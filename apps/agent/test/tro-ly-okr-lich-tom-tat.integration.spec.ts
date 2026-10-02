import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { ghiChiPhi } from "@crm/db/ai-chi-phi";
import { NGAY_MS, TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import { dauTuanVN, thuTrongTuan } from "@crm/db/onboarding-nhac";
import {
	OKR_PROGRAM_MAC_DINH,
	type OkrProgramSua,
	okrProgram,
} from "@crm/validation/okr-chuong-trinh";
import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import { OKR_MAU } from "../../api/scripts/okr-mau/cau-hinh";
import { idMau, xoaBoOkrMau } from "../../api/scripts/okr-mau/nap";
import { congTy, lamSachOkr, napMau } from "../../api/test/okr-mau-san";
import { beginResearch, runDirect } from "../agent/lib/dispatch";
import { chayXepTomTat, damBaoLichTomTat } from "../agent/lib/okr/lich-tom-tat";
import { lyDoChanTruocKhiGui } from "../agent/lib/okr/viec";
import { moXuong } from "./support/nhac-gieo";

const CHO_DB = 120_000;
const TIEN_TO = `llt-${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}-`;
const MOC_MAU = new Date("2026-11-12T15:00:00+07:00");
const XEP = "okr-tom-tat-xep";
const TOM_TAT = "okr-tom-tat-tuan";
const KY = {
	quy4: idMau("chu-ky", "quy4"),
	nam: idMau("chu-ky", "nam-tom-tat"),
} as const;
const NGUOI_GHI = idMau("nguoi", congTy().nguoi[0]?.ma ?? "");
const khoaCu = process.env.AI_GATEWAY_API_KEY;

type TenKy = keyof typeof KY;

const PHONG = {
	batCo: "kd-bac",
	batKhong: "kd-nam",
	anCo: "cham-soc",
	anKhong: "marketing",
	tatCo: "kho-van",
	tatKhong: "dieu-phoi",
} as const;

const pb = (ma: string) => idMau("pb", ma);
const luc = (vn: string) => new Date(`${vn}+07:00`);
const sau6 = (ngay: string) => luc(`${ngay}T06:00:00`);

const CAU_HINH_A: OkrProgramSua = {
	aiOn: true,
	aiTomTatPhamVi: "danh-sach",
	aiTomTatDonVi: [pb(PHONG.batCo), pb(PHONG.batKhong)],
	aiTomTatAnPhamVi: "danh-sach",
	aiTomTatAnDonVi: [pb(PHONG.anCo), pb(PHONG.anKhong)],
};

const MA_TRAN: { ngay: string; homQua: number; ky: TenKy[]; tuan: string }[] = [
	{ ngay: "2026-11-23", homQua: 7, ky: [], tuan: "2026-11-16" },
	{ ngay: "2026-11-24", homQua: 1, ky: ["quy4"], tuan: "2026-11-23" },
	{ ngay: "2026-11-25", homQua: 2, ky: [], tuan: "2026-11-23" },
	{ ngay: "2026-11-26", homQua: 3, ky: [], tuan: "2026-11-23" },
	{ ngay: "2026-11-27", homQua: 4, ky: ["nam"], tuan: "2026-11-23" },
	{ ngay: "2026-11-28", homQua: 5, ky: [], tuan: "2026-11-23" },
	{ ngay: "2026-11-29", homQua: 6, ky: [], tuan: "2026-11-23" },
];

const CO_CAP_NHAT = [PHONG.batCo, PHONG.anCo, PHONG.tatCo];

type O = { ky: string; phong: string; nac: string };

const tenKy = (id: string) =>
	(Object.keys(KY) as TenKy[]).find((k) => KY[k] === id) ?? id;
const tenPhong = (id: string) => id.replace(idMau("pb", ""), "");
const khoaO = (o: O) => `${tenKy(o.ky)}|${tenPhong(o.phong)}|${o.nac}`;

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
			createdById: NGUOI_GHI,
			createdAt: lucGhi,
		},
	});
}

async function krCua(ky: TenKy, ma: string): Promise<string> {
	const kr = await db.okrKeyResult.findFirstOrThrow({
		where: {
			objective: {
				cycleId: KY[ky],
				level: "phong-ban",
				departmentId: pb(ma),
				status: "cong-bo",
				hienThi: "cong-khai",
			},
		},
		orderBy: { id: "asc" },
		select: { id: true },
	});
	return kr.id;
}

async function capNhat(
	ky: TenKy,
	ma: string,
	lucCap: Date,
	confidence = "vua",
): Promise<string> {
	const kr = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: await krCua(ky, ma) },
		select: { id: true, ownerUserId: true, currentValue: true },
	});
	const phien = await db.okrCheckInSession.create({
		data: {
			userId: kr.ownerUserId,
			entry: "web",
			openedAt: lucCap,
			submittedAt: lucCap,
			seconds: 30,
		},
	});
	const lan = await db.okrCheckIn.create({
		data: {
			keyResultId: kr.id,
			sessionId: phien.id,
			weekStart: new Date(`${dauTuanVN(lucCap)}T00:00:00Z`),
			value: kr.currentValue,
			confidence,
			note: "",
			authorUserId: kr.ownerUserId,
			ownerUserId: kr.ownerUserId,
			createdAt: lucCap,
		},
	});
	return lan.id;
}

async function gieoMucTieuPhong(
	ky: TenKy,
	ma: string,
	ten: string,
): Promise<void> {
	const departmentId = pb(ma);
	const phong = await db.department.findUniqueOrThrow({
		where: { id: departmentId },
		select: { headUserId: true },
	});
	const chu = phong.headUserId ?? NGUOI_GHI;
	const objectiveId = idMau("mt", `${ky}-tt-${ma}`);
	await db.okrObjective.create({
		data: {
			id: objectiveId,
			cycleId: KY[ky],
			level: "phong-ban",
			departmentId,
			ownerUserId: chu,
			kind: "cam-ket",
			status: "cong-bo",
			hienThi: "cong-khai",
			title: ten,
			publishedAt: MOC_MAU,
			createdAt: MOC_MAU,
		},
	});
	await db.okrKeyResult.create({
		data: {
			id: idMau("kr", `${ky}-tt-${ma}`),
			objectiveId,
			title: `${ten} — tỷ lệ hoàn thành`,
			kind: "tang-toi",
			ownerUserId: chu,
			startValue: 0,
			targetValue: 100,
			currentValue: 40,
			unit: "%",
			startLockedAt: MOC_MAU,
			createdAt: MOC_MAU,
		},
	});
}

async function viecXep(ngay: string): Promise<{ id: string; dueAt: Date }> {
	return db.agentTask.create({
		data: {
			kind: XEP,
			reason: XEP,
			subject: `${XEP}:${ngay}`,
			budget: 0,
			dueAt: sau6(ngay),
		},
		select: { id: true, dueAt: true },
	});
}

async function oMoi(now: Date): Promise<O[]> {
	const hang = await db.agentTask.findMany({
		where: { kind: TOM_TAT, createdAt: now },
		select: { payload: true },
	});
	return hang.map((h) => {
		const p = okrTroLyViec.parse(h.payload);
		if (p.viec !== "tom-tat-tuan") throw new Error(`viec la: ${p.viec}`);
		return { ky: p.cycleId, phong: p.departmentId, nac: p.nac };
	});
}

async function tuanMoi(now: Date): Promise<string[]> {
	const hang = await db.agentTask.findMany({
		where: { kind: TOM_TAT, createdAt: now },
		select: { payload: true },
	});
	return [
		...new Set(
			hang.map((h) => {
				const p = okrTroLyViec.parse(h.payload);
				return p.viec === "tom-tat-tuan" ? p.tuan : "";
			}),
		),
	];
}

function lech(ngay: string, co: O[], can: O[]): string[] {
	const coK = new Set(co.map(khoaO));
	const canK = new Set(can.map(khoaO));
	const ngoai = [
		...co.filter((o) => !canK.has(khoaO(o))),
		...can.filter((o) => !coK.has(khoaO(o))),
	];
	return ngoai.map(
		(o) => `o lich lech: ${ngay} x ${tenKy(o.ky)} x ${tenPhong(o.phong)}`,
	);
}

function canCo(ky: TenKy[], them: [string, string][]): O[] {
	return ky.flatMap((k) =>
		them.map(([ma, nac]) => ({ ky: KY[k], phong: pb(ma), nac })),
	);
}

async function demXep(ngay: string): Promise<number> {
	return db.agentTask.count({
		where: { kind: XEP, subject: `${XEP}:${ngay}` },
	});
}

async function donViec(): Promise<void> {
	await db.agentTask.deleteMany({ where: { kind: { in: [XEP, TOM_TAT] } } });
}

beforeAll(async () => {
	process.env.AI_GATEWAY_API_KEY = "khoa-thu";
	setSystemTime();
	await moXuong();
	await lamSachOkr();
	await donViec();
	await db.okrProgramConfig.deleteMany({
		where: { createdById: { startsWith: OKR_MAU.tienTo } },
	});
	await xoaBoOkrMau(db);
	await napMau(MOC_MAU);
	await db.agentTask.create({
		data: {
			kind: "okr-kiem-san-sang",
			reason: "okr-kiem-san-sang",
			subject: `${TIEN_TO}kiem`,
			dueAt: new Date(MOC_MAU.getTime() - 60_000),
			finishedAt: new Date(MOC_MAU.getTime() - 60_000),
			outcome: "san-sang",
		},
	});
	await db.okrCycle.create({
		data: {
			id: KY.nam,
			kind: "nam",
			name: "Năm tóm tắt · thử",
			startsOn: new Date("2026-01-01T00:00:00Z"),
			endsOn: new Date("2026-12-31T00:00:00Z"),
			phase: "dang-chay",
			updateWeekday: 4,
		},
	});
	for (const ma of Object.values(PHONG))
		await gieoMucTieuPhong("nam", ma, `Mục tiêu năm của ${ma}`);
	await ghiCauHinh(CAU_HINH_A, luc("2026-11-20T00:00:00"));
}, CHO_DB);

afterAll(async () => {
	setSystemTime();
	await donViec();
	await db.agentTask.deleteMany({
		where: { subject: { startsWith: TIEN_TO } },
	});
	await db.aiChiPhi.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await db.okrProgramConfig.deleteMany({
		where: { createdById: { startsWith: OKR_MAU.tienTo } },
	});
	await lamSachOkr();
	await xoaBoOkrMau(db);
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
}, CHO_DB);

describe("ma tran bay ngay", () => {
	test(
		"moi ngay chi xep chu ky co ngay cap nhat la hom qua, nac bat va an co cap nhat, va noi chuoi sang ngay ke",
		async () => {
			await donViec();
			for (const ky of ["quy4", "nam"] as const)
				for (const ma of CO_CAP_NHAT)
					await capNhat(ky, ma, luc("2026-11-22T18:00:00"));
			expect(await damBaoLichTomTat(luc("2026-11-23T05:00:00"))).toBe(true);
			const loi: string[] = [];
			const chuoi: string[] = [];
			type Phu = {
				ngay: string;
				homQua: number;
				ketQua: (string | null)[];
				tuan: string[];
			};
			const phu: Phu[] = [];
			const canPhu: Phu[] = [];
			for (const o of MA_TRAN) {
				const now = sau6(o.ngay);
				const xep = await db.agentTask.findFirst({
					where: { kind: XEP, subject: `${XEP}:${o.ngay}`, finishedAt: null },
					select: { id: true, dueAt: true },
				});
				if (!xep || xep.dueAt.getTime() !== now.getTime()) {
					chuoi.push(`chuoi dut: ${o.ngay}`);
					continue;
				}
				const ketQua = await chayXepTomTat(xep, now);
				const can = canCo(o.ky, [
					[PHONG.batCo, "bat"],
					[PHONG.anCo, "an"],
				]);
				loi.push(...lech(o.ngay, await oMoi(now), can));
				const dong = await db.agentTask.findUniqueOrThrow({
					where: { id: xep.id },
					select: { outcome: true },
				});
				phu.push({
					ngay: o.ngay,
					homQua: thuTrongTuan(new Date(now.getTime() - NGAY_MS)),
					ketQua: [ketQua, dong.outcome],
					tuan: await tuanMoi(now),
				});
				canPhu.push({
					ngay: o.ngay,
					homQua: o.homQua,
					ketQua: [`da-xep:${can.length}`, `da-xep:${can.length}`],
					tuan: can.length ? [o.tuan] : [],
				});
				await db.agentTask.deleteMany({ where: { kind: TOM_TAT } });
			}
			expect(chuoi).toEqual([]);
			expect(loi).toEqual([]);
			expect(phu).toEqual(canPhu);
			expect(await demXep("2026-11-30")).toBe(1);
		},
		CHO_DB,
	);
});

describe("cua truoc khi gui", () => {
	const viecTomTat = (ma: string, nac: "an" | "bat") => ({
		kind: TOM_TAT,
		attempts: 1,
		payload: {
			viec: "tom-tat-tuan",
			departmentId: pb(ma),
			cycleId: KY.quy4,
			tuan: "2026-11-23",
			inputHash: "hash-thu",
			nac,
		},
	});

	const qua = (chan: string | null, nhan: string) =>
		chan === null
			? `${nhan} qua cua truoc khi gui`
			: `${nhan} bi chan truoc khi gui: ${chan}`;

	test(
		"ban an cua phong an qua cua, ban cua phong khong bat bi chan — ca cau hinh tron va cau hinh chi an",
		async () => {
			await ghiCauHinh(
				{
					aiTomTatPhamVi: "tat",
					aiTomTatDonVi: [],
					aiTomTatAnPhamVi: "danh-sach",
					aiTomTatAnDonVi: [pb(PHONG.anCo)],
				},
				luc("2026-11-29T12:00:00"),
			);
			const chiAn = luc("2026-11-29T12:30:00");
			expect(
				qua(
					await lyDoChanTruocKhiGui(viecTomTat(PHONG.anCo, "an"), chiAn),
					"an",
				),
			).toBe("an qua cua truoc khi gui");
			expect(
				await lyDoChanTruocKhiGui(viecTomTat(PHONG.anKhong, "an"), chiAn),
			).toBe("khong-chay:don-vi-chua-bat");

			await ghiCauHinh(CAU_HINH_A, luc("2026-11-29T13:00:00"));
			const tron = luc("2026-11-29T13:30:00");
			expect(
				qua(
					await lyDoChanTruocKhiGui(viecTomTat(PHONG.anCo, "an"), tron),
					"an",
				),
			).toBe("an qua cua truoc khi gui");
			expect(
				qua(
					await lyDoChanTruocKhiGui(viecTomTat(PHONG.batCo, "bat"), tron),
					"bat",
				),
			).toBe("bat qua cua truoc khi gui");
			expect(
				await lyDoChanTruocKhiGui(viecTomTat(PHONG.tatCo, "bat"), tron),
			).toBe("khong-chay:don-vi-chua-bat");
			expect(
				await lyDoChanTruocKhiGui(viecTomTat(PHONG.anCo, "bat"), tron),
			).toBe("khong-chay:don-vi-chua-bat");
		},
		CHO_DB,
	);

	test(
		"phong-luu-tru-truoc-gui: viec tom tat cua phong da luu tru dong khong-chay:phong-luu-tru, khong mo phien",
		async () => {
			const luuTru = congTy().phongBanLuuTru[0]?.ma;
			if (!luuTru) throw new Error("bo mau khong co phong luu tru");
			expect(
				await lyDoChanTruocKhiGui(
					viecTomTat(luuTru, "bat"),
					luc("2026-11-29T13:30:00"),
				),
			).toBe("khong-chay:phong-luu-tru");
			const hang = await db.agentTask.create({
				data: {
					kind: TOM_TAT,
					reason: TOM_TAT,
					subject: `${TIEN_TO}luu-tru`,
					budget: 0,
					dueAt: new Date(),
					attempts: 1,
					payload: viecTomTat(luuTru, "bat").payload,
				},
			});
			let moPhien = 0;
			await beginResearch(hang, async () => {
				moPhien += 1;
				return { id: `${TIEN_TO}khong-duoc-mo` };
			});
			const dong = await db.agentTask.findUniqueOrThrow({
				where: { id: hang.id },
				select: { outcome: true, finishedAt: true },
			});
			expect([dong.outcome, dong.finishedAt !== null, moPhien]).toEqual([
				"khong-chay:phong-luu-tru",
				true,
				0,
			]);
			await db.agentTask.delete({ where: { id: hang.id } });
		},
		CHO_DB,
	);
});

describe("review focus", () => {
	test(
		"cn-sang-t2: chu ky cap nhat chu nhat, xep sang thu hai lay tuan chua chu nhat",
		async () => {
			await donViec();
			await db.okrCycle.update({
				where: { id: KY.nam },
				data: { updateWeekday: 7 },
			});
			try {
				await capNhat("nam", PHONG.batCo, luc("2026-11-29T20:00:00"));
				const now = sau6("2026-11-30");
				const xep = await viecXep("2026-11-30");
				expect(await chayXepTomTat(xep, now)).toBe("da-xep:1");
				expect(
					lech(
						"2026-11-30",
						await oMoi(now),
						canCo(["nam"], [[PHONG.batCo, "bat"]]),
					),
				).toEqual([]);
				expect(await tuanMoi(now)).toEqual(["2026-11-23"]);
				expect(dauTuanVN(now)).toBe("2026-11-30");
			} finally {
				await db.okrCycle.update({
					where: { id: KY.nam },
					data: { updateWeekday: 4 },
				});
			}
		},
		CHO_DB,
	);

	test(
		"chu-ky-an: chu ky dang chay da an khong duoc xep tom tat du co cap nhat",
		async () => {
			await donViec();
			await db.okrCycle.update({
				where: { id: KY.nam },
				data: { updateWeekday: 7, anLuc: luc("2026-11-28T09:00:00") },
			});
			try {
				await capNhat("nam", PHONG.batCo, luc("2026-11-29T20:00:00"));
				const now = sau6("2026-11-30");
				const xep = await viecXep("2026-11-30");
				expect(await chayXepTomTat(xep, now)).toBe("da-xep:0");
				expect(await oMoi(now)).toEqual([]);
			} finally {
				await db.okrCycle.update({
					where: { id: KY.nam },
					data: { updateWeekday: 4, anLuc: null },
				});
			}
		},
		CHO_DB,
	);

	test(
		"xep-muon: tac tu chay 10:00 van xep cho ngay do va noi viec ke luc 06:00 ngay mai",
		async () => {
			await donViec();
			for (const ma of [PHONG.batCo, PHONG.anCo])
				await capNhat("quy4", ma, luc("2026-11-30T20:00:00"));
			const now = luc("2026-12-01T10:00:00");
			const xep = await viecXep("2026-12-01");
			expect(await chayXepTomTat(xep, now)).toBe("da-xep:2");
			expect(
				lech(
					"2026-12-01",
					await oMoi(now),
					canCo(
						["quy4"],
						[
							[PHONG.batCo, "bat"],
							[PHONG.anCo, "an"],
						],
					),
				),
			).toEqual([]);
			expect(await tuanMoi(now)).toEqual(["2026-11-30"]);
			const ke = await db.agentTask.findFirstOrThrow({
				where: { kind: XEP, subject: `${XEP}:2026-12-02` },
				select: { dueAt: true, finishedAt: true },
			});
			expect(ke.dueAt.toISOString()).toBe(sau6("2026-12-02").toISOString());
			expect(ke.finishedAt).toBeNull();
		},
		CHO_DB,
	);

	test(
		"xep-tre-qua-nua-dem: viec xep hen 06:00 hom truoc chay luc 00:30 xu ly ngay truoc han va noi sang ngay han ke",
		async () => {
			await donViec();
			await capNhat("quy4", PHONG.batCo, luc("2026-12-07T20:00:00"));
			const now = luc("2026-12-09T00:30:00");
			const xep = await viecXep("2026-12-08");
			const ketQua = await chayXepTomTat(xep, now);
			const tuan = await tuanMoi(now);
			expect(
				ketQua === "da-xep:1" && tuan.join() === "2026-12-07"
					? "neo han"
					: `hom qua lech: ${ketQua} ${tuan.join()}`,
			).toBe("neo han");
			expect(
				lech(
					"2026-12-08",
					await oMoi(now),
					canCo(["quy4"], [[PHONG.batCo, "bat"]]),
				),
			).toEqual([]);
			const ke = await db.agentTask.findMany({
				where: { kind: XEP, finishedAt: null },
				select: { subject: true, dueAt: true },
			});
			expect(ke.map((k) => [k.subject, k.dueAt.toISOString()])).toEqual([
				[`${XEP}:2026-12-09`, sau6("2026-12-09").toISOString()],
			]);
		},
		CHO_DB,
	);

	test(
		"phong-luu-tru: phong da luu tru co cap nhat van khong duoc xep",
		async () => {
			await donViec();
			await ghiCauHinh(
				{
					aiTomTatPhamVi: "toan-cong-ty",
					aiTomTatDonVi: [],
					aiTomTatAnPhamVi: "tat",
					aiTomTatAnDonVi: [],
				},
				luc("2026-12-27T00:00:00"),
			);
			const luuTru = congTy().phongBanLuuTru[0]?.ma ?? "";
			await gieoMucTieuPhong("quy4", luuTru, "Mục tiêu kho lạnh");
			await capNhat("quy4", luuTru, luc("2026-12-28T20:00:00"));
			await capNhat("quy4", PHONG.batCo, luc("2026-12-28T20:00:00"));
			const now = sau6("2026-12-29");
			const xep = await viecXep("2026-12-29");
			expect(await chayXepTomTat(xep, now)).toBe("da-xep:1");
			const co = await oMoi(now);
			expect(
				co
					.filter((o) => o.phong === pb(luuTru))
					.map(() => "phong luu tru bi xep"),
			).toEqual([]);
			expect(
				lech("2026-12-29", co, canCo(["quy4"], [[PHONG.batCo, "bat"]])),
			).toEqual([]);
			await ghiCauHinh(CAU_HINH_A, luc("2026-12-30T00:00:00"));
		},
		CHO_DB,
	);
});

describe("dong thoi, chay lai, loi giua vong, tran", () => {
	test(
		"hai luot dong thoi ra dung mot viec xep ngay ke va khong trung viec tom tat; chay lai cung ngay khong them",
		async () => {
			await donViec();
			for (const ma of [PHONG.batCo, PHONG.anCo])
				await capNhat("quy4", ma, luc("2026-12-07T20:00:00"));
			const now = sau6("2026-12-08");
			const xep = await viecXep("2026-12-08");
			const ketQua = await Promise.all([
				chayXepTomTat(xep, now),
				chayXepTomTat(xep, now),
			]);
			expect(ketQua.sort()).toEqual(["da-xep:0", "da-xep:2"]);
			expect(await demXep("2026-12-09")).toBe(1);
			const co = await oMoi(now);
			expect(co.length).toBe(new Set(co.map(khoaO)).size);
			expect(
				lech(
					"2026-12-08",
					co,
					canCo(
						["quy4"],
						[
							[PHONG.batCo, "bat"],
							[PHONG.anCo, "an"],
						],
					),
				),
			).toEqual([]);

			const lai = await viecXep("2026-12-08");
			expect(await chayXepTomTat(lai, luc("2026-12-08T07:00:00"))).toBe(
				"da-xep:0",
			);
			expect(await db.agentTask.count({ where: { kind: TOM_TAT } })).toBe(2);
			expect(await demXep("2026-12-09")).toBe(1);
		},
		CHO_DB,
	);

	test(
		"loi giua vong phong ban khong cat chuoi: viec xep ngay ke da ghi truoc vong",
		async () => {
			await donViec();
			await capNhat("quy4", PHONG.batCo, luc("2026-12-14T20:00:00"));
			const hong = await capNhat(
				"quy4",
				PHONG.anCo,
				luc("2026-12-14T20:00:00"),
				"khong-ro",
			);
			const now = sau6("2026-12-15");
			const xep = await viecXep("2026-12-15");
			const loi = await chayXepTomTat(xep, now).then(
				() => "khong nem",
				(e: Error) => e.message,
			);
			expect(loi).toContain("okrCheckIn.confidence");
			expect(
				(await demXep("2026-12-16")) === 1 ? "chuoi con" : "chuoi dut",
			).toBe("chuoi con");
			expect(await db.agentTask.count({ where: { kind: TOM_TAT } })).toBe(0);
			const lan = await db.okrCheckIn.delete({
				where: { id: hong },
				select: { sessionId: true },
			});
			await db.okrCheckInSession.delete({ where: { id: lan.sessionId } });
		},
		CHO_DB,
	);

	test(
		"so chi phi cham tran: viec xep qua dispatch dong het-tran-thang, khong viec tom tat, chuoi van noi",
		async () => {
			await donViec();
			await capNhat("quy4", PHONG.batCo, luc("2026-12-21T20:00:00"));
			await ghiChiPhi(db, {
				id: `${TIEN_TO}tran`,
				at: luc("2026-12-21T12:00:00"),
				sessionId: `${TIEN_TO}phien-tran`,
				phienCha: null,
				kenh: null,
				tinhNang: "okr.tom-tat",
				taskId: null,
				modelId: null,
				inputTokens: 100,
				cacheReadTokens: 0,
				outputTokens: 10,
				costUsd: TRO_LY_OKR_TRAN.tranThangMacDinhUsd,
			});
			const now = sau6("2026-12-22");
			const xep = await viecXep("2026-12-22");
			setSystemTime(now);
			try {
				await runDirect(
					await db.agentTask.findUniqueOrThrow({ where: { id: xep.id } }),
				);
			} finally {
				setSystemTime();
			}
			const dong = await db.agentTask.findUniqueOrThrow({
				where: { id: xep.id },
				select: { outcome: true },
			});
			expect(dong.outcome).toBe("khong-chay:het-tran-thang:0");
			expect(await db.agentTask.count({ where: { kind: TOM_TAT } })).toBe(0);
			expect(await demXep("2026-12-23")).toBe(1);
			await db.aiChiPhi.deleteMany({ where: { id: `${TIEN_TO}tran` } });
		},
		CHO_DB,
	);
});

describe("damBaoLichTomTat", () => {
	test(
		"khong con viec xep mo: ghi dung mot, goi hai lan hay dong thoi van mot; truoc 06:00 lay hom nay",
		async () => {
			await donViec();
			const now = luc("2026-12-23T10:00:00");
			const dong = await Promise.all([
				damBaoLichTomTat(now),
				damBaoLichTomTat(now),
			]);
			expect(dong.sort()).toEqual([false, true]);
			expect(await damBaoLichTomTat(now)).toBe(false);
			const mo = await db.agentTask.findMany({
				where: { kind: XEP, finishedAt: null },
				select: { subject: true, dueAt: true },
			});
			expect(mo.map((m) => [m.subject, m.dueAt.toISOString()])).toEqual([
				[`${XEP}:2026-12-24`, sau6("2026-12-24").toISOString()],
			]);

			await donViec();
			expect(await damBaoLichTomTat(luc("2026-12-24T05:00:00"))).toBe(true);
			const som = await db.agentTask.findFirstOrThrow({
				where: { kind: XEP, finishedAt: null },
				select: { subject: true, dueAt: true },
			});
			expect([som.subject, som.dueAt.toISOString()]).toEqual([
				`${XEP}:2026-12-24`,
				sau6("2026-12-24").toISOString(),
			]);
		},
		CHO_DB,
	);

	test(
		"moi nac tom tat tat: khong ghi viec xep, viec xep dang co dong khong-chay va khong noi ngay ke",
		async () => {
			await donViec();
			await ghiCauHinh(
				{
					aiTomTatPhamVi: "tat",
					aiTomTatDonVi: [],
					aiTomTatAnPhamVi: "tat",
					aiTomTatAnDonVi: [],
				},
				luc("2026-12-24T12:00:00"),
			);
			const now = luc("2026-12-24T13:00:00");
			expect(await damBaoLichTomTat(now)).toBe(false);
			expect(await damBaoLichTomTat(now)).toBe(false);
			expect(await db.agentTask.count({ where: { kind: XEP } })).toBe(0);
			const xep = await viecXep("2026-12-24");
			expect(await chayXepTomTat(xep, now)).toBe("khong-chay:viec-tat:0");
			expect(await demXep("2026-12-25")).toBe(0);
			await ghiCauHinh(CAU_HINH_A, luc("2026-12-24T14:00:00"));
		},
		CHO_DB,
	);
});
