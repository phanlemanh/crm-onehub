import { db } from "@crm/db";
import { PRIORITY } from "@crm/db/agent-tasks";
import { kenhSeDungCua } from "@crm/db/kenh-thong-bao";
import {
	daToiGioNhac,
	ngayVN,
	type ViecNhac,
	viecCanNhac,
} from "@crm/db/onboarding-nhac";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	mucNhac,
	type NhacPayload,
	parseNhacPayload,
} from "@crm/validation/nhac-ke-hoach";
import { sendSlackMessage } from "./run-runtime";
import { slackAccessToken } from "./slack-connection";
import { completeTask } from "./tasks";
import { dungTin } from "./tin-nhac";
import { guiZalo, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";

export const LOAI_VIEC_NHAC = "nhac-ke-hoach";

const LY_DO = "nhắc buổi sáng";

const CHU_DE = /^user:(.+):\d{4}-\d{2}-\d{2}$/;

export type KetQuaNhac = "da-gui" | "khong-slack" | "khong-khop" | "khong-viec";

export type PhuThuocGui = {
	fetcher?: typeof fetch;
	zaloFetcher?: typeof fetch;
	appUrl?: string | null;
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

function maCua(ds: ViecNhac[]): NhacPayload["muc"] {
	return ds.map(({ loai, planId, stepId }) =>
		mucNhac.parse({ loai, planId, stepId }),
	);
}

export async function lenLichNhac(now = new Date()): Promise<{ ghi: number }> {
	if (!daToiGioNhac(now)) return { ghi: 0 };
	const viec = await viecCanNhac(db, { now });
	if (viec.size === 0) return { ghi: 0 };
	const { count } = await db.agentTask.createMany({
		data: [...viec].map(([userId, ds]) => ({
			kind: LOAI_VIEC_NHAC,
			reason: LY_DO,
			subject: chuDeNhac(userId, now),
			dueAt: now,
			priority: PRIORITY.nhac,
			payload: { muc: maCua(ds) },
		})),
		skipDuplicates: true,
	});
	return { ghi: count };
}

function appUrlMacDinh(): string | null {
	const dau = process.env.APP_URL?.split(",")[0]?.trim().replace(/\/+$/, "");
	return dau || null;
}

async function duongMo(
	appUrl: string | null,
): Promise<(planId: string) => string | null> {
	if (!appUrl) return () => null;
	const xuong = await db.organization.findUnique({
		where: { id: WORKSPACE_ID },
		select: { slug: true },
	});
	const slug = xuong?.slug;
	if (!slug) return () => null;
	return (planId) => `${appUrl}/${slug}?record=plan:${planId}`;
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
	const viec =
		(await viecCanNhac(db, { now: new Date(), userId })).get(userId) ?? [];
	if (viec.length === 0) return dong(task.id, "khong-viec");

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
				daGui: maCua(daGui),
				kenh: kenh.kenh,
				lechKenh: kenh.lech,
			},
		},
	});
	await completeTask(task.id, `da-gui:${daGui.length}`);
	return "da-gui";
}

async function guiQuaZalo(
	token: string | null,
	zaloUserId: string | null,
	ten: string,
	viec: ViecNhac[],
	lienKet: (planId: string) => string | null,
	deps: PhuThuocGui,
): Promise<ViecNhac[]> {
	if (!token || !zaloUserId) {
		throw new Error("kenh Zalo duoc chon ma thieu token hoac lien ket");
	}
	const { text, daGui } = dungTin(ten, viec, lienKet, "tron", ZALO.tranKyTu);
	await guiZalo(token, zaloUserId, text, { fetcher: deps.zaloFetcher });
	return daGui;
}

async function guiQuaSlack(
	slackUserId: string | null,
	ten: string,
	viec: ViecNhac[],
	lienKet: (planId: string) => string | null,
	taskId: string,
	deps: PhuThuocGui,
): Promise<ViecNhac[]> {
	const token = await slackAccessToken();
	if (!token || !slackUserId) {
		throw new Error("kenh Slack duoc chon ma thieu token hoac nguoi khop");
	}
	const { text, daGui } = dungTin(ten, viec, lienKet);
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
