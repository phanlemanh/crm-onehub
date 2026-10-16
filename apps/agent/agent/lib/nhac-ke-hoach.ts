import { db } from "@crm/db";
import { PRIORITY } from "@crm/db/agent-tasks";
import { ghiDaBaoAi, LOAI_NHAC_AI, type ViecAi } from "@crm/db/ai-nhac";
import { kenhSeDungCua } from "@crm/db/kenh-thong-bao";
import { KHOA_MUC_OKR, laViecOkr } from "@crm/db/okr-nhac";
import {
	daToiGioNhac,
	laNhacViec,
	ngayVN,
	type ViecNhac,
	viecCanNhac,
} from "@crm/db/onboarding-nhac";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	type MucNhac,
	mucNhac,
	parseNhacPayload,
} from "@crm/validation/nhac-ke-hoach";
import {
	type CachXemOkr,
	khoaDonOkr,
	THAM_SO_OKR,
} from "@crm/validation/okr-tham-so";
import { khoaThongBao } from "@crm/validation/thong-bao";
import { sendSlackMessage } from "./run-runtime";
import { slackAccessToken } from "./slack-connection";
import { completeTask } from "./tasks";
import { ghiThongBao } from "./thong-bao-ghi";
import { dungTin, type LienKet, truKrIm } from "./tin-nhac";
import { guiZalo, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";

export const LOAI_VIEC_NHAC = "nhac-ke-hoach";

const LY_DO = "nhắc buổi sáng";

const DUONG_CHO_DUYET = "tabTaiLieu=cho-duyet";

const CACH_XEM_HOP_TUAN = "hop-tuan" satisfies CachXemOkr;

const CHU_DE = /^user:(.+):\d{4}-\d{2}-\d{2}$/;

export type KetQuaNhac = "da-gui" | "khong-slack" | "khong-khop" | "khong-viec";

export type PhuThuocGui = {
	fetcher?: typeof fetch;
	zaloFetcher?: typeof fetch;
	appUrl?: string | null;
	ghiThongBao?: typeof ghiThongBao;
};

export function chuDeNhac(userId: string, now: Date): string {
	return `user:${userId}:${ngayVN(now)}`;
}

function nguoiCua(subject: string | null): string {
	const khop = CHU_DE.exec(subject ?? "");
	if (!khop?.[1]) {
		throw new Error(`subject nhac-ke-hoach hong: ${subject ?? "null"}`);
	}
	return khop[1];
}

function maViec(v: ViecNhac): MucNhac {
	if (laViecAi(v)) {
		return mucNhac.parse(
			v.loai === "ai-tran"
				? { loai: v.loai, thang: v.thang, muc: v.muc }
				: { loai: v.loai, thang: v.thang },
		);
	}
	if (v.loai === "tai-lieu-cho-duyet") {
		return mucNhac.parse({ loai: v.loai, so: v.so });
	}
	if (v.loai === "goi-y-ke-hoach") {
		return mucNhac.parse({ loai: v.loai, goiYId: v.goiYId });
	}
	if (v.loai === "okr-tom-tat") {
		return mucNhac.parse({
			loai: v.loai,
			tomTatId: v.tomTatId,
			departmentId: v.departmentId,
			cycleId: v.cycleId,
			soKrDangBan: v.soKrDangBan,
		});
	}
	if (laNhacViec(v)) {
		return mucNhac.parse({ loai: v.loai, viecId: v.viecId });
	}
	if (!laViecOkr(v)) {
		return mucNhac.parse({ loai: v.loai, planId: v.planId, stepId: v.stepId });
	}
	const khoa = Object.keys(KHOA_MUC_OKR[v.loai]);
	return mucNhac.parse(
		Object.fromEntries(Object.entries(v).filter(([k]) => khoa.includes(k))),
	);
}

function maCuaAnToan(userId: string, ds: ViecNhac[]): MucNhac[] {
	return ds.flatMap((v) => {
		try {
			return [maViec(v)];
		} catch (loi) {
			console.error(
				`[nhac] bo muc loai=${v.loai} nguoi=${userId}: ${loi instanceof Error ? loi.message : String(loi)}`,
			);
			return [];
		}
	});
}

function conMaDuoc(userId: string, ds: ViecNhac[]): ViecNhac[] {
	const sauTru = truKrIm(ds);
	return ds.filter(
		(v, i) => maCuaAnToan(userId, [sauTru[i] ?? v]).length === 1,
	);
}

export async function lenLichNhac(
	now = new Date(),
	gom: typeof viecCanNhac = viecCanNhac,
): Promise<{ ghi: number }> {
	if (!daToiGioNhac(now)) return { ghi: 0 };
	const viec = await gom(db, { now, cuaSo: "buoi-sang" });
	const hang = [...viec].flatMap(([userId, ds]) => {
		const muc = maCuaAnToan(userId, truKrIm(ds));
		return muc.length === 0
			? []
			: [
					{
						kind: LOAI_VIEC_NHAC,
						reason: LY_DO,
						subject: chuDeNhac(userId, now),
						dueAt: now,
						priority: PRIORITY.nhac,
						payload: { muc },
					},
				];
	});
	if (hang.length === 0) return { ghi: 0 };
	const { count } = await db.agentTask.createMany({
		data: hang,
		skipDuplicates: true,
	});
	return { ghi: count };
}

function appUrlMacDinh(): string | null {
	const dau = process.env.APP_URL?.split(",")[0]?.trim().replace(/\/+$/, "");
	return dau || null;
}

async function xuongSlug(
	appUrl: string | null,
): Promise<{ appUrl: string; slug: string } | null> {
	if (!appUrl) return null;
	const xuong = await db.organization.findUnique({
		where: { id: WORKSPACE_ID },
		select: { slug: true },
	});
	const slug = xuong?.slug;
	if (!slug) return null;
	return { appUrl, slug };
}

export function duongTrongApp(v: ViecNhac): string {
	if (laNhacViec(v)) {
		return `/viec?record=viec:${v.viecId}`;
	}
	if ("planId" in v) return `?record=plan:${v.planId}`;
	if (v.loai === "goi-y-ke-hoach") return `?record=deal:${v.dealId}`;
	if (laViecAi(v)) return "/settings/okr";
	if (v.loai === "tai-lieu-cho-duyet") {
		return `/tai-lieu?${DUONG_CHO_DUYET}`;
	}
	if (v.loai === "okr-cap-nhat") {
		return "/okr/cap-nhat-tuan?tu=nhac";
	}
	if (v.loai === "okr-hoi-y-gop" || v.loai === "okr-hoi-y-cong-bo") {
		const thamSo = new URLSearchParams({ [THAM_SO_OKR.ky]: v.cycleId });
		return `/okr/hoi-y?${thamSo}`;
	}
	if (v.loai === "okr-tom-tat") {
		const thamSo = new URLSearchParams({
			[THAM_SO_OKR.xem]: CACH_XEM_HOP_TUAN,
			[THAM_SO_OKR.don]: khoaDonOkr({ loai: "pb", id: v.departmentId }),
			[THAM_SO_OKR.ky]: v.cycleId,
		});
		return `/okr/theo-don-vi?${thamSo}`;
	}
	return `/okr?record=objective:${v.objectiveId}`;
}

export async function duongMo(appUrl: string | null): Promise<LienKet> {
	const ctx = await xuongSlug(appUrl);
	if (!ctx) return () => null;
	return (v) => `${ctx.appUrl}/${ctx.slug}${duongTrongApp(v)}`;
}

export async function lienKetKeHoach(): Promise<
	(planId: string) => string | null
> {
	const ctx = await xuongSlug(appUrlMacDinh());
	if (!ctx) return () => null;
	return (planId) => `${ctx.appUrl}/${ctx.slug}?record=plan:${planId}`;
}

function laViecAi(v: ViecNhac): v is ViecAi {
	return (LOAI_NHAC_AI as readonly string[]).includes(v.loai);
}

async function dong(taskId: string, ket: KetQuaNhac): Promise<KetQuaNhac> {
	await completeTask(taskId, ket);
	return ket;
}

export async function chayNhac(
	task: { id: string },
	deps: PhuThuocGui = {},
): Promise<KetQuaNhac> {
	const hang = await db.agentTask.findUniqueOrThrow({
		where: { id: task.id },
		select: { subject: true, payload: true },
	});
	const userId = nguoiCua(hang.subject);
	const payload = parseNhacPayload(hang.payload);
	const viec = conMaDuoc(
		userId,
		(
			await viecCanNhac(db, { now: new Date(), userId, cuaSo: "buoi-sang" })
		).get(userId) ?? [],
	);
	if (viec.length === 0) return dong(task.id, "khong-viec");

	const now = new Date();
	const mucTinh = {
		ngay: ngayVN(now),
		khoa: viec.map((v) => khoaThongBao(v, now)),
	};
	await db.agentTask.update({
		where: { id: task.id },
		data: { payload: { ...payload, mucTinh } },
	});
	let thongBaoLoi: string | undefined;
	try {
		await (deps.ghiThongBao ?? ghiThongBao)(
			db,
			userId,
			viec,
			duongTrongApp,
			now,
		);
	} catch (loi) {
		thongBaoLoi = loi instanceof Error ? loi.message : String(loi);
		console.error(`[nhac] ghi thong bao hong nguoi=${userId}: ${thongBaoLoi}`);
		await db.agentTask.update({
			where: { id: task.id },
			data: { payload: { ...payload, mucTinh, thongBaoLoi } },
		});
	}

	const token = await zaloToken();
	const kenh = await kenhSeDungCua(db, userId, { coToken: token !== null });
	if (kenh.kenh === null) {
		const slack = await slackAccessToken();
		return dong(task.id, slack ? "khong-khop" : "khong-slack");
	}

	const { name: ten } = await db.user.findUniqueOrThrow({
		where: { id: userId },
		select: { name: true },
	});
	const lienKet = await duongMo(
		deps.appUrl === undefined ? appUrlMacDinh() : deps.appUrl,
	);
	const daGui =
		kenh.kenh === "zalo"
			? await guiQuaZalo(token, kenh.zaloUserId, ten, viec, lienKet, deps)
			: await guiQuaSlack(kenh.slackUserId, ten, viec, lienKet, task.id, deps);
	await db.agentTask.update({
		where: { id: task.id },
		data: {
			payload: {
				...payload,
				mucTinh,
				thongBaoLoi,
				daGui: daGui.map(maViec),
				kenh: kenh.kenh,
				lechKenh: kenh.lech,
			},
		},
	});
	await ghiDaBaoAi(db, userId, daGui.filter(laViecAi));
	await completeTask(task.id, `da-gui:${daGui.length}`);
	return "da-gui";
}

async function guiQuaZalo(
	token: string | null,
	zaloUserId: string | null,
	ten: string,
	viec: ViecNhac[],
	lienKet: LienKet,
	deps: PhuThuocGui,
): Promise<ViecNhac[]> {
	if (!token || !zaloUserId) {
		throw new Error("kenh Zalo duoc chon ma thieu token hoac lien ket");
	}
	const { text, daGui } = dungTin(
		ten,
		new Date(),
		viec,
		lienKet,
		"tron",
		ZALO.tranKyTu,
		ZALO.loi.goiY,
	);
	await guiZalo(token, zaloUserId, text, { fetcher: deps.zaloFetcher });
	return daGui;
}

async function guiQuaSlack(
	slackUserId: string | null,
	ten: string,
	viec: ViecNhac[],
	lienKet: LienKet,
	taskId: string,
	deps: PhuThuocGui,
): Promise<ViecNhac[]> {
	const token = await slackAccessToken();
	if (!token || !slackUserId) {
		throw new Error("kenh Slack duoc chon ma thieu token hoac nguoi khop");
	}
	const { text, daGui } = dungTin(ten, new Date(), viec, lienKet);
	await guiSlackRieng(token, slackUserId, ten, text, taskId, deps.fetcher);
	return daGui;
}

function guiSlackRieng(
	token: string,
	slackUserId: string,
	ten: string,
	text: string,
	maTin: string,
	fetcher: typeof fetch | undefined,
) {
	return sendSlackMessage(
		token,
		{ kind: "user", id: slackUserId, label: ten },
		text,
		maTin,
		{ fetcher },
	);
}

export async function guiQuaSlackThu(
	slackUserId: string,
	text: string,
	chon: { fetcher?: typeof fetch; maTin: string },
): Promise<void> {
	const token = await slackAccessToken();
	if (!token) throw new Error("kenh Slack duoc chon ma thieu token");
	await guiSlackRieng(
		token,
		slackUserId,
		slackUserId,
		text,
		chon.maTin,
		chon.fetcher,
	);
}
