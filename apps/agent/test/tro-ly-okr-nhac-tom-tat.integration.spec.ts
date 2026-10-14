import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db, Prisma } from "@crm/db";
import { LOAI_NHAC_AI } from "@crm/db/ai-nhac";
import { type KrSo, lyDoCua } from "@crm/db/okr-hop-tuan";
import { dungGoiTomTat, ghiTomTat } from "@crm/db/okr-tom-tat";
import { OKR_TOM_TAT } from "@crm/db/okr-tro-ly-danh-muc";
import { viecCanNhac } from "@crm/db/onboarding-nhac";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { type MucNhac, parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import {
	OKR_PROGRAM_MAC_DINH,
	type OkrProgramSua,
	okrProgram,
} from "@crm/validation/okr-chuong-trinh";
import { LUAT_TOM_TAT } from "@crm/validation/okr-kiem-tom-tat";
import { THAM_SO_OKR } from "@crm/validation/okr-tham-so";
import { parseNoiDungTomTat } from "@crm/validation/okr-tom-tat";
import type { CauTomTat } from "@crm/validation/okr-tro-ly";
import { OKR_MAU } from "../../api/scripts/okr-mau/cau-hinh";
import { idMau, xoaBoOkrMau } from "../../api/scripts/okr-mau/nap";
import { congTy, lamSachOkr, napMau } from "../../api/test/okr-mau-san";
import {
	chayNhac,
	chuDeNhac,
	LOAI_VIEC_NHAC,
	lenLichNhac,
} from "../agent/lib/nhac-ke-hoach";
import { khopSlack, moXuong, noiSlack, slackGia } from "./support/nhac-gieo";
import { batBot, noiZalo, tatBot, voiToken } from "./support/okr-gieo";
import { donTroLy, gieoChiPhi } from "./support/tro-ly-gieo";
import { zaloGia } from "./support/zalo-gia";

const CHO_DB = 120_000;
const TIEN_TO = `ntn-${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}-`;
const MOC_MAU = new Date("2026-11-12T15:00:00+07:00");
const APP_URL = "https://crm.test";
const KY = idMau("chu-ky", "quy4");
const TUAN = "2026-11-09";
const THANG_DOI_SOAT = "2026-10";
const TRAN_USD = 10;
const CHI_USD = 9;
const MAY: readonly string[] = [...LOAI_NHAC_AI, "okr-tom-tat"];

const luc = (vn: string) => new Date(`${vn}+07:00`);
const LUC_GHI = luc("2026-11-13T06:05:00");
const LUC_CU = luc("2026-11-12T08:00:00");
const LUC_SAU_MOC = luc("2026-11-13T09:00:00");
const SANG = luc("2026-11-13T08:31:00");
const SANG_MAI = luc("2026-11-14T08:31:00");

const bo = congTy();
const pb = (ma: string) => idMau("pb", ma);
const nguoi = (ma: string) => idMau("nguoi", ma);

function truongCua(maPhong: string): string {
	const truong = bo.phongBan.find((p) => p.ma === maPhong)?.truong;
	if (!truong) throw new Error(`phong ${maPhong} khong co truong`);
	return nguoi(truong);
}

type Ban = {
	phong: string;
	nac: "bat" | "an";
	ghiLuc: Date;
	hong?: boolean;
};

const BAN: readonly Ban[] = [
	{ phong: "kd-nam", nac: "bat", ghiLuc: LUC_GHI },
	{ phong: "kd-bac", nac: "bat", ghiLuc: LUC_GHI },
	{ phong: "cham-soc", nac: "bat", ghiLuc: LUC_GHI },
	{ phong: "kho-van", nac: "bat", ghiLuc: LUC_GHI, hong: true },
	{ phong: "dieu-phoi", nac: "an", ghiLuc: LUC_GHI },
	{ phong: "tai-chinh", nac: "bat", ghiLuc: LUC_CU },
	{ phong: "marketing", nac: "bat", ghiLuc: LUC_GHI },
	{ phong: "san-pham", nac: "bat", ghiLuc: LUC_SAU_MOC },
	{ phong: "nhan-su", nac: "bat", ghiLuc: LUC_GHI },
];

type O = {
	nguoi: string;
	kenh: "zalo" | "slack";
	can: string[];
};

const THANH_VIEN_KD_NAM = nguoi("truong-bao-ngoc");

const MA_TRAN = new Map<string, O>([
	[
		"truong-nhan",
		{ nguoi: truongCua("kd-nam"), kenh: "slack", can: ["okr-tom-tat:kd-nam"] },
	],
	["thanh-vien", { nguoi: THANH_VIEN_KD_NAM, kenh: "zalo", can: [] }],
	["tat-dong", { nguoi: truongCua("kd-bac"), kenh: "zalo", can: [] }],
	["can-xem", { nguoi: truongCua("kho-van"), kenh: "zalo", can: [] }],
	["che-do-an", { nguoi: truongCua("dieu-phoi"), kenh: "zalo", can: [] }],
	["ngoai-cua-so", { nguoi: truongCua("tai-chinh"), kenh: "zalo", can: [] }],
	[
		"hai-dong-ai",
		{
			nguoi: truongCua("cham-soc"),
			kenh: "zalo",
			can: ["okr-tom-tat:cham-soc", "ai-tran"],
		},
	],
	[
		"chi-tom-tat",
		{
			nguoi: truongCua("marketing"),
			kenh: "zalo",
			can: ["okr-tom-tat:marketing"],
		},
	],
]);

type DuongMo = {
	kenh: O["kenh"];
	goc: string;
	xem: string | null;
	don: string | null;
	ky: string | null;
	soThamSo: number;
};

type TieuDeNhom = {
	kenh: O["kenh"];
	tieuDe: string | null;
	soLan: number;
};

const DONG_TOM_TAT = /Tóm tắt tuần Phòng (.+?) · (\d+) KR đáng bàn/;

type Tin = {
	text: string;
	daGui: MucNhac[];
	outcome: string | null;
};

const idBan = new Map<string, string>();
const cauBan = new Map<string, string[]>();
let slug = "";
let tinSang = new Map<string, Tin | null>();

const phongCuaBan = (tomTatId: string) =>
	[...idBan].find(([, id]) => id === tomTatId)?.[0] ?? `la:${tomTatId}`;

function nhanMuc(m: MucNhac): string {
	return m.loai === "okr-tom-tat"
		? `okr-tom-tat:${phongCuaBan(m.tomTatId)}`
		: m.loai;
}

const laMay = (m: MucNhac) => MAY.includes(m.loai);

async function ghiCauHinh(sua: OkrProgramSua, lucGhi: Date): Promise<void> {
	const cu = await db.okrProgramConfig.findFirst({
		orderBy: { version: "desc" },
	});
	const truoc = cu
		? okrProgram.parse({ ...cu, aiTranThangUsd: cu.aiTranThangUsd.toNumber() })
		: OKR_PROGRAM_MAC_DINH;
	const moi = okrProgram.parse({ ...truoc, ...sua });
	await db.okrProgramConfig.create({
		data: {
			...moi,
			version: (cu?.version ?? 0) + 1,
			createdById: nguoi(bo.nguoi[0]?.ma ?? ""),
			createdAt: lucGhi,
		},
	});
}

async function ghiBan(b: Ban): Promise<void> {
	const departmentId = pb(b.phong);
	const goi = await dungGoiTomTat(
		db,
		{ cycleId: KY, departmentId, tuan: TUAN, moc: b.ghiLuc },
		LUAT_TOM_TAT,
	);
	if (!goi) throw new Error(`khong dung duoc goi cua ${b.phong}`);
	const thay = new Set<string>();
	const nguon = goi.nguon.filter((n) => {
		if (thay.has(n.keyResultId)) return false;
		thay.add(n.keyResultId);
		return true;
	});
	if (nguon.length === 0) throw new Error(`goi cua ${b.phong} khong co nguon`);
	const cauLanh = [
		"Phòng giữ nhịp cập nhật đều đặn.",
		"Có ghi chú mới trong tuần.",
	];
	const cau: CauTomTat[] = b.hong
		? [{ vanBan: cauLanh[0] ?? "", nguon: [`${TIEN_TO}ngoai-goi`] }]
		: nguon
				.slice(0, cauLanh.length)
				.map((n, i) => ({ vanBan: cauLanh[i] ?? "", nguon: [n.id] }));
	const viec = await db.agentTask.create({
		data: {
			kind: "okr-tom-tat-tuan",
			reason: "okr-tom-tat-tuan",
			subject: `${TIEN_TO}tts-${b.phong}`,
			budget: 0,
			dueAt: b.ghiLuc,
			createdAt: b.ghiLuc,
			attempts: 1,
			startedAt: b.ghiLuc,
			finishedAt: b.ghiLuc,
			outcome: "da-nop",
			payload: {
				viec: "tom-tat-tuan",
				departmentId,
				cycleId: KY,
				tuan: TUAN,
				inputHash: `hash-${b.phong}`,
				nac: b.nac,
			},
		},
		select: { id: true },
	});
	setSystemTime(b.ghiLuc);
	const ket = await ghiTomTat(
		db,
		{
			taskId: viec.id,
			cycleId: KY,
			departmentId,
			tuan: TUAN,
			moc: b.ghiLuc,
			inputHash: `hash-${b.phong}`,
			nac: b.nac,
			cau,
		},
		LUAT_TOM_TAT,
	);
	setSystemTime();
	idBan.set(b.phong, ket.id);
	const hang = await db.okrTomTat.findUniqueOrThrow({
		where: { id: ket.id },
		select: { cau: true },
	});
	const noiDung = parseNoiDungTomTat(hang.cau);
	cauBan.set(b.phong, [
		...noiDung.cau.map((c) => c.vanBan),
		...noiDung.bo.map((c) => c.vanBan),
	]);
}

async function don(): Promise<void> {
	await db.agentTask.deleteMany({
		where: {
			OR: [{ kind: LOAI_VIEC_NHAC }, { subject: { startsWith: TIEN_TO } }],
		},
	});
	await db.aiDoiSoat.deleteMany({ where: { thang: THANG_DOI_SOAT } });
	await db.aiBaoTran.deleteMany({
		where: { userId: { startsWith: OKR_MAU.tienTo } },
	});
	await db.notificationPreference.deleteMany({
		where: { userId: { startsWith: OKR_MAU.tienTo } },
	});
	await db.zaloLink.deleteMany({
		where: { crmUserId: { startsWith: OKR_MAU.tienTo } },
	});
	await db.slackMemberMatch.deleteMany({
		where: { crmUserId: { startsWith: OKR_MAU.tienTo } },
	});
	await db.account.deleteMany({ where: { providerId: "slack" } });
	await db.okrProgramConfig.deleteMany({
		where: { createdById: { startsWith: OKR_MAU.tienTo } },
	});
	await donTroLy();
}

const zaloCua = (o: string) => `Z-${o}`;

async function guiSang(
	now: Date,
	ai: string[],
): Promise<Map<string, Tin | null>> {
	setSystemTime(now);
	await lenLichNhac(now);
	const z = zaloGia();
	const s = slackGia();
	const ra = new Map<string, Tin | null>();
	for (const [o, userId] of ai.map((o) => [o, nguoiCua(o)] as const)) {
		const hang = await db.agentTask.findFirst({
			where: { kind: LOAI_VIEC_NHAC, subject: chuDeNhac(userId, now) },
			select: { id: true },
		});
		if (!hang) {
			ra.set(o, null);
			continue;
		}
		const truocSlack = s.goi.length;
		await voiToken(() =>
			chayNhac(hang, {
				fetcher: s.fetcher,
				zaloFetcher: z.fetcher,
				appUrl: APP_URL,
			}),
		);
		const sau = await db.agentTask.findUniqueOrThrow({
			where: { id: hang.id },
			select: { payload: true, outcome: true },
		});
		const slackMoi = s.goi
			.slice(truocSlack)
			.filter((g) => g.url.endsWith("chat.postMessage"));
		const text =
			MA_TRAN.get(o)?.kenh === "slack"
				? (slackMoi[0]?.body.text ?? "")
				: (z.guiToi(zaloCua(o))[0]?.body.text ?? "");
		ra.set(o, {
			text,
			daGui: parseNhacPayload(sau.payload).daGui ?? [],
			outcome: sau.outcome,
		});
	}
	setSystemTime();
	return ra;
}

const NGOAI_MA_TRAN = new Map<string, string>([
	["ban-sau-moc", truongCua("san-pham")],
	["khong-truong", truongCua("nhan-su")],
]);

function nguoiCua(o: string): string {
	const id = MA_TRAN.get(o)?.nguoi ?? NGOAI_MA_TRAN.get(o);
	if (!id) throw new Error(`o la: ${o}`);
	return id;
}

async function krDangBan(maPhong: string, now: Date): Promise<string[]> {
	const krs = await db.okrKeyResult.findMany({
		where: {
			objective: {
				cycleId: KY,
				level: "phong-ban",
				departmentId: pb(maPhong),
				status: "cong-bo",
				hienThi: "cong-khai",
			},
		},
		select: {
			id: true,
			startLockedAt: true,
			objective: { select: { publishedAt: true } },
			checkIns: {
				select: {
					weekStart: true,
					confidence: true,
					note: true,
					value: true,
					createdAt: true,
					session: { select: { submittedAt: true } },
				},
			},
		},
	});
	return krs
		.filter((k) => {
			const so: KrSo = {
				id: k.id,
				thuTu: 0,
				khoaLuc: k.startLockedAt ?? k.objective.publishedAt,
				lan: k.checkIns
					.map((l) => ({
						tuan: l.weekStart.toISOString().slice(0, 10),
						luc: l.session.submittedAt ?? l.createdAt,
						tuTin: z3(l.confidence),
						ghiChu: l.note,
						giaTri: l.value.toNumber(),
					}))
					.sort((a, b) => a.luc.getTime() - b.luc.getTime()),
			};
			return lyDoCua(so, now).length > 0;
		})
		.map((k) => k.id);
}

function z3(v: string): "cao" | "vua" | "thap" {
	if (v === "cao" || v === "vua" || v === "thap") return v;
	throw new Error(`tu tin la: ${v}`);
}

function lienKetDong(text: string): string | null {
	const dong = text.split("\n").find((d) => DONG_TOM_TAT.test(d));
	if (!dong) return null;
	return (
		/<([^|>]+)\|mở>/.exec(dong)?.[1] ?? / — (\S+)$/.exec(dong)?.[1] ?? null
	);
}

beforeAll(async () => {
	setSystemTime();
	await moXuong();
	await don();
	await lamSachOkr();
	await xoaBoOkrMau(db);
	await napMau(MOC_MAU);
	const xuong = await db.organization.findUniqueOrThrow({
		where: { id: WORKSPACE_ID },
		select: { slug: true },
	});
	slug = xuong.slug ?? "";
	await ghiCauHinh(
		{
			aiOn: true,
			aiTranThangUsd: TRAN_USD,
			aiTomTatPhamVi: "danh-sach",
			aiTomTatDonVi: BAN.filter((b) => b.nac === "bat").map((b) => pb(b.phong)),
			aiTomTatAnPhamVi: "danh-sach",
			aiTomTatAnDonVi: BAN.filter((b) => b.nac === "an").map((b) =>
				pb(b.phong),
			),
		},
		luc("2026-11-12T16:00:00"),
	);
	for (const b of BAN) await ghiBan(b);
	await db.department.update({
		where: { id: pb("nhan-su") },
		data: { headUserId: null },
	});
	await db.notificationPreference.upsert({
		where: { userId: truongCua("kd-bac") },
		create: { userId: truongCua("kd-bac"), dongTroLyOkr: false },
		update: { dongTroLyOkr: false },
	});
	await db.member.updateMany({
		where: { organizationId: WORKSPACE_ID, userId: truongCua("cham-soc") },
		data: { role: "admin" },
	});
	await gieoChiPhi(luc("2026-11-05T10:00:00"), "okr.de-xuat", CHI_USD);
	await db.aiDoiSoat.create({
		data: {
			thang: THANG_DOI_SOAT,
			tuNgay: new Date("2026-10-01T00:00:00Z"),
			denNgay: new Date("2026-10-31T00:00:00Z"),
			soSoUsd: new Prisma.Decimal(1),
			soGatewayUsd: new Prisma.Decimal(1.12),
			lechPhanTram: new Prisma.Decimal(12),
			ketQua: "lech",
		},
	});
	await batBot();
	for (const o of [...[...MA_TRAN.keys()], ...[...NGOAI_MA_TRAN.keys()]]) {
		if (MA_TRAN.get(o)?.kenh === "slack") continue;
		await noiZalo(nguoiCua(o), zaloCua(o));
	}
	const quaSlack = MA_TRAN.get("truong-nhan")?.nguoi ?? "";
	await noiSlack(quaSlack);
	await khopSlack(quaSlack, "U-TOM-TAT");
	tinSang = await guiSang(SANG, [
		...[...MA_TRAN.keys()],
		...[...NGOAI_MA_TRAN.keys()],
	]);
}, CHO_DB);

afterAll(async () => {
	setSystemTime();
	await don();
	await tatBot();
	await lamSachOkr();
	await xoaBoOkrMau(db);
}, CHO_DB);

describe("gieo", () => {
	test(
		"ban kho-van la can-xem, moi ban khac hien; nac dung nhu da ghi",
		async () => {
			const hang = await db.okrTomTat.findMany({
				where: { id: { in: [...idBan.values()] } },
				select: { id: true, trangThai: true, cau: true },
			});
			const ra = Object.fromEntries(
				hang.map((h) => [
					phongCuaBan(h.id),
					`${h.trangThai}:${parseNoiDungTomTat(h.cau).nac}`,
				]),
			);
			expect(ra).toEqual(
				Object.fromEntries(
					BAN.map((b) => [b.phong, `${b.hong ? "can-xem" : "hien"}:${b.nac}`]),
				),
			);
		},
		CHO_DB,
	);
});

describe("ma tran tam o", () => {
	test(
		"moi o nhan dung tap dong may (loai + ban)",
		async () => {
			const co = Object.fromEntries(
				[...MA_TRAN.keys()].map((o) => [
					o,
					(tinSang.get(o)?.daGui ?? []).filter(laMay).map(nhanMuc).sort(),
				]),
			);
			const can = Object.fromEntries(
				[...MA_TRAN].map(([o, v]) => [o, [...v.can].sort()]),
			);
			expect(co).toEqual(can);
		},
		CHO_DB,
	);

	test(
		"ca xuong: chi ba truong phong nhan dong tom tat, dung ban cua phong minh",
		async () => {
			const viec = await viecCanNhac(db, { now: SANG, cuaSo: "buoi-sang" });
			const co = [...viec].flatMap(([userId, ds]) =>
				ds.flatMap((v) =>
					v.loai === "okr-tom-tat"
						? [`${userId}>${phongCuaBan(v.tomTatId)}`]
						: [],
				),
			);
			expect(co.sort()).toEqual(
				["kd-nam", "cham-soc", "marketing"]
					.map((p) => `${truongCua(p)}>${p}`)
					.sort(),
			);
		},
		CHO_DB,
	);

	test(
		"so KR dang ban tren dong bang so KR co ly do tru KR im trong cung tin",
		async () => {
			const lech: string[] = [];
			let trung = 0;
			for (const o of [...MA_TRAN.keys()]) {
				const tin = tinSang.get(o);
				if (!tin) continue;
				const im = new Set(
					tin.daGui.flatMap((m) =>
						m.loai === "okr-kr-im" ? [m.keyResultId] : [],
					),
				);
				for (const m of tin.daGui) {
					if (m.loai !== "okr-tom-tat") continue;
					const phong = phongCuaBan(m.tomTatId);
					const dangBan = await krDangBan(phong, SANG);
					trung += dangBan.filter((id) => im.has(id)).length;
					const n = dangBan.filter((id) => !im.has(id)).length;
					const dong = DONG_TOM_TAT.exec(tin.text);
					const tenPhong = bo.phongBan.find((p) => p.ma === phong)?.ten;
					if (
						m.soKrDangBan !== n ||
						dong?.[2] !== String(n) ||
						dong?.[1] !== tenPhong
					)
						lech.push(
							`${o}: dong «${dong?.[0] ?? "vang"}», daGui ${m.soKrDangBan}, can ${n} Phòng ${tenPhong}`,
						);
				}
			}
			expect(trung, "khong co KR im trung de thu").toBeGreaterThan(0);
			expect(lech, "dem trung kr im").toEqual([]);
		},
		CHO_DB,
	);

	test(
		"toi da hai dong may moi tin, dung sau moi dong viec nguoi",
		() => {
			const lech: string[] = [];
			for (const [o, tin] of tinSang) {
				if (!tin) continue;
				const may = tin.daGui.map(laMay);
				const soMay = may.filter(Boolean).length;
				const dauMay = may.indexOf(true);
				if (soMay > OKR_TOM_TAT.dongBaoAiToiDa)
					lech.push(`${o}: ${soMay} dong may`);
				if (dauMay >= 0 && may.slice(dauMay).includes(false))
					lech.push(`${o}: dong nguoi sau dong may`);
			}
			const haiAi = tinSang.get("hai-dong-ai");
			expect(
				{ lech, loai: haiAi?.daGui.map((m) => m.loai) },
				"qua hai dong bao",
			).toEqual({
				lech: [],
				loai: ["okr-kr-im", "okr-tom-tat", "ai-tran"],
			});
			const text = haiAi?.text ?? "";
			expect(text.includes("Đối soát tháng"), "dong doi soat bi cat").toBe(
				false,
			);
			expect(text.indexOf("KR im")).toBeLessThan(
				text.indexOf("Tóm tắt tuần Phòng"),
			);
			expect(text.indexOf("Tóm tắt tuần Phòng")).toBeLessThan(
				text.indexOf("Kara đã dùng 80% trần tháng"),
			);
		},
		CHO_DB,
	);

	test(
		"nguoi chi co dong tom tat van nhan tin, da-gui:1",
		() => {
			const tin = tinSang.get("chi-tom-tat");
			expect({
				outcome: tin?.outcome,
				loai: tin?.daGui.map((m) => m.loai),
				coDong: DONG_TOM_TAT.test(tin?.text ?? ""),
			}).toEqual({ outcome: "da-gui:1", loai: ["okr-tom-tat"], coDong: true });
		},
		CHO_DB,
	);

	test(
		"tieu de nhom la Kara · OKR, chu Tom tat tuan dung mot lan moi tin — Slack va Zalo",
		() => {
			const ra = new Map<string, TieuDeNhom>();
			const can = new Map<string, TieuDeNhom>();
			for (const [o, v] of MA_TRAN) {
				const tin = tinSang.get(o);
				if (!tin?.daGui.some((m) => m.loai === "okr-tom-tat")) continue;
				const dong = tin.text.split("\n");
				const i = dong.findIndex((d) => DONG_TOM_TAT.test(d));
				ra.set(o, {
					kenh: v.kenh,
					tieuDe: dong[i - 1] ?? null,
					soLan: tin.text.split("Tóm tắt tuần").length - 1,
				});
				can.set(o, {
					kenh: v.kenh,
					tieuDe: v.kenh === "slack" ? "*Kara · OKR*" : "Kara · OKR",
					soLan: 1,
				});
			}
			expect([...new Set([...ra.values()].map((t) => t.kenh))].sort()).toEqual([
				"slack",
				"zalo",
			]);
			expect(Object.fromEntries(ra)).toEqual(Object.fromEntries(can));
		},
		CHO_DB,
	);

	test(
		"chu cua dong khong chua cau nao cua ban tom tat",
		() => {
			const moiCau = [...cauBan.values()].flat();
			const lot: string[] = [];
			for (const [o, tin] of tinSang) {
				for (const cau of moiCau)
					if (tin?.text.includes(cau)) lot.push(`${o}: ${cau}`);
			}
			expect(moiCau.length).toBeGreaterThan(0);
			expect(lot).toEqual([]);
		},
		CHO_DB,
	);

	test(
		"duong mo cua dong toi Hop tuan cua dung phong, dung chu ky — so tung tham so",
		() => {
			const ra = new Map<string, DuongMo>();
			const can = new Map<string, DuongMo>();
			for (const [o, v] of [...MA_TRAN]) {
				const tin = tinSang.get(o);
				const ban = tin?.daGui.find((m) => m.loai === "okr-tom-tat");
				if (!tin || !ban || ban.loai !== "okr-tom-tat") continue;
				const url = new URL(lienKetDong(tin.text) ?? "about:blank");
				ra.set(o, {
					kenh: v.kenh,
					goc: `${url.origin}${url.pathname}`,
					xem: url.searchParams.get(THAM_SO_OKR.xem),
					don: url.searchParams.get(THAM_SO_OKR.don),
					ky: url.searchParams.get(THAM_SO_OKR.ky),
					soThamSo: [...url.searchParams.keys()].length,
				});
				can.set(o, {
					kenh: v.kenh,
					goc: `${APP_URL}/${slug}/okr/theo-don-vi`,
					xem: "hop-tuan",
					don: `pb:${pb(phongCuaBan(ban.tomTatId))}`,
					ky: KY,
					soThamSo: 3,
				});
			}
			expect([...ra.keys()].sort()).toEqual([
				"chi-tom-tat",
				"hai-dong-ai",
				"truong-nhan",
			]);
			expect(Object.fromEntries(ra)).toEqual(Object.fromEntries(can));
		},
		CHO_DB,
	);
});

describe("review focus", () => {
	test(
		"ban-sau-moc: ban ghi sau 08:30 khong vao tin sang do, vao tin sang hom sau; ban da bao khong lap",
		async () => {
			const homNay = tinSang.get("ban-sau-moc");
			const mai = await guiSang(SANG_MAI, ["ban-sau-moc", "truong-nhan"]);
			const tomTat = (t: Tin | null | undefined) =>
				(t?.daGui ?? []).filter((m) => m.loai === "okr-tom-tat").map(nhanMuc);
			expect({
				homNay: tomTat(homNay),
				mai: tomTat(mai.get("ban-sau-moc")),
				kdNamMai: tomTat(mai.get("truong-nhan")),
			}).toEqual({
				homNay: [],
				mai: ["okr-tom-tat:san-pham"],
				kdNamMai: [],
			});
		},
		CHO_DB,
	);

	test(
		"khong-truong: phong khong truong co ban hien nhung khong ai nhan dong, khong loi",
		async () => {
			const viec = await viecCanNhac(db, { now: SANG, cuaSo: "buoi-sang" });
			const nhanSu = idBan.get("nhan-su");
			const nguoiNhan = [...viec].flatMap(([userId, ds]) =>
				ds.some((v) => v.loai === "okr-tom-tat" && v.tomTatId === nhanSu)
					? [userId]
					: [],
			);
			expect({
				nguoiNhan,
				truongCu: (tinSang.get("khong-truong")?.daGui ?? []).filter(
					(m) => m.loai === "okr-tom-tat",
				),
			}).toEqual({ nguoiNhan: [], truongCu: [] });
		},
		CHO_DB,
	);
});
