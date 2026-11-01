import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { readTenGoc, WORKSPACE_ID } from "@crm/db/workspace";
import { OKR_HOI_Y } from "@crm/validation/okr-hoi-y";
import { z } from "zod";
import type {
	CapNhatTuanOutput,
	MucMoCoi,
	ObjectiveOutput,
	SoanDanhSachCuocOutput,
	SoanMoOutput,
} from "../src/okr/okr.contracts";
import type { HoiYDoPhuOutput } from "../src/okr/okr-hoi-y.contracts";
import type {
	BangChamOutput,
	XuatKyOutput,
} from "../src/okr/okr-khep.contracts";
import type {
	SoDoDonViOutput,
	SucKhoeOutput,
	ToanCanhOutput,
} from "../src/okr/okr-xem.contracts";
import { roiKhoi } from "./okr-canh-kr-san";
import { SO_LIEU_MAC_DINH, sauGio } from "./okr-hoi-y-san";
import {
	donSanKhep,
	gieoMucTieuCongBo,
	keoDaiPhien,
	luc,
	sangPha,
} from "./okr-khep-san";
import {
	CHUONG_TRINH_RONG,
	dangChay,
	doc,
	dungSan,
	goi,
	type Json,
	kyDangChay,
	nguoiMoi,
	ok,
	pbMoi,
	phien,
	phienCua,
	taoNam,
	taoQuy,
	truongMoi,
} from "./okr-san";

dungSan();

const BAT_DAU = new Date();
const GOC = join(import.meta.dir, "..", "..", "..");
const KIEM_KE = join(
	GOC,
	"_acceptance",
	"chu-may-sinh-ten-moi",
	"kiem-ke.json",
);
const NGUON_OKR = join(GOC, "apps", "api", "src", "okr");
const TEP_HANG_CU = "okr-config.ts";
const TEP_TEN_DON_VI = "don-vi.ts";
const GOI_TEN_DON_VI = /\btenDonVi\(/g;
const DINH_NGHIA_TEN_DON_VI = /function tenDonVi\(/g;
const TEP_TEN_DON_VI_RIENG = "soan.service.ts";

const TEN_THU = "Kho Thử Nghiệm";
const TEN_TRANG = "   ";
const TEN_DU_PHONG = "Công ty";

const LUC_GIEO_KY_DONG = "2026-08-10T03:00:00Z";
const LUC_DOC = "2026-11-10T03:00:00Z";
const DON_VI_GOC = { level: "onehub" } as const;
const KR_MOT = { startValue: 0, targetValue: 100, currentValue: 0 } as const;
const SEED_MS = 180_000;
const DOC_MS = 60_000;

const kiemKe = z.object({
	muc: z.array(
		z.object({ tep: z.string(), dong: z.number(), khai_niem: z.string() }),
	),
});

type HangGoc = { ten: string; cho: string; doc: () => Promise<string> };

type San = {
	kyChay: string;
	kyCham: string;
	kyDong: string;
	kyHoiY: string;
	kySoan: string;
	goc: string;
	phong: string;
	moCoi: string;
	hoiY: string;
	cuoc: string;
	cookieChuKr: string;
};

const s: San = {
	kyChay: "",
	kyCham: "",
	kyDong: "",
	kyHoiY: "",
	kySoan: "",
	goc: "",
	phong: "",
	moCoi: "",
	hoiY: "",
	cuoc: "",
	cookieChuKr: "",
};

function motHang<T>(ds: readonly T[], dk: (x: T) => boolean, ten: string): T {
	const hang = ds.find(dk);
	if (hang === undefined) throw new Error(`cmst: goc ${ten} khong co hang`);
	return hang;
}

function cotCsv(noiDung: string, cot: string, capCot: string): string {
	const [dau, ...dong] = noiDung
		.replace(/^﻿/, "")
		.split("\r\n")
		.filter((d) => d !== "")
		.map((d) => d.split(","));
	const iCot = dau?.indexOf(cot) ?? -1;
	const iCap = dau?.indexOf(capCot) ?? -1;
	const hang = motHang(dong, (d) => d[iCap] === "onehub", "csv");
	return hang[iCot] ?? "";
}

const GOC_MOI_CHO: readonly HangGoc[] = [
	{
		ten: "muc-tieu.unitName",
		cho: "tenDonVi@okr.service.ts",
		doc: async () =>
			(await doc<ObjectiveOutput>("okr.objective", "quan", { id: s.goc }))
				.unitName,
	},
	{
		ten: "gop-vao.alignments.unitName",
		cho: "tenDonVi@okr.service.ts",
		doc: async () =>
			motHang(
				(await doc<ObjectiveOutput>("okr.objective", "quan", { id: s.phong }))
					.alignments,
				(a) => a.targetObjectiveId === s.goc,
				"gop-vao",
			).unitName,
	},
	{
		ten: "alignmentTargets.unitName",
		cho: "tenDonVi@okr.service.ts",
		doc: async () =>
			motHang(
				(
					await doc<{
						targets: { objectiveId: string; unitName: string }[];
					}>("okr.alignmentTargets", "quan", { objectiveId: s.phong })
				).targets,
				(t) => t.objectiveId === s.goc,
				"alignmentTargets",
			).unitName,
	},
	{
		ten: "capNhatGanDay.bo.ten",
		cho: "tenDonVi@okr-cap-nhat-gan-day.service.ts",
		doc: async () =>
			motHang(
				(
					await doc<{ rows: { bo: { khoa: string; ten: string } }[] }>(
						"okr.capNhatGanDay",
						"quan",
						{ cycleId: s.kyChay },
					)
				).rows,
				(r) => r.bo.khoa === "goc",
				"capNhatGanDay",
			).bo.ten,
	},
	{
		ten: "capNhatTuan.unitName",
		cho: "tenDonVi@okr-cap-nhat.service.ts",
		doc: async () =>
			motHang(
				(await doc<CapNhatTuanOutput>("okr.capNhatTuan", s.cookieChuKr)).items,
				(k) => k.objectiveId === s.goc,
				"capNhatTuan",
			).unitName,
	},
	{
		ten: "hoiYDoPhu.goc.nhan",
		cho: "kiem-ke@apps/api/src/okr/okr-hoi-y.service.ts:989",
		doc: async () =>
			motHang(
				(
					await doc<HoiYDoPhuOutput>("okr.hoiYDoPhu", "quan", {
						hoiYId: s.hoiY,
					})
				).hang,
				(h) => h.loai === "goc",
				"hoiYDoPhu",
			).nhan,
	},
	{
		ten: "toanCanh.goc.ten",
		cho: "kiem-ke@apps/api/src/okr/okr-xem.service.ts:395",
		doc: async () =>
			motHang(
				(
					await doc<ToanCanhOutput>("okr.toanCanh", "quan", {
						cycleId: s.kyChay,
					})
				).hang,
				(h) => h.cap === "goc",
				"toanCanh",
			).ten,
	},
	{
		ten: "sucKhoe.goc.ten",
		cho: "kiem-ke@apps/api/src/okr/okr-xem.service.ts:469",
		doc: async () =>
			motHang(
				(
					await doc<SucKhoeOutput>("okr.sucKhoe", "quan", {
						cycleId: s.kyChay,
					})
				).hang,
				(h) => h.cap === "goc",
				"sucKhoe",
			).ten,
	},
	{
		ten: "soDoDonVi.goc.ten",
		cho: "kiem-ke@apps/api/src/okr/okr-xem.service.ts:477",
		doc: async () =>
			motHang(
				(
					await doc<SoDoDonViOutput>("okr.soDoDonVi", "quan", {
						cycleId: s.kyChay,
					})
				).nut,
				(n) => n.cap === "goc",
				"soDoDonVi",
			).ten,
	},
	{
		ten: "soanDanhSachCuoc.tenDonVi",
		cho: "kiem-ke@apps/api/src/okr/soan.service.ts:433",
		doc: async () =>
			motHang(
				(
					await doc<SoanDanhSachCuocOutput>("okr.soanDanhSachCuoc", "quan", {
						cycleId: s.kySoan,
						level: "onehub",
						divisionId: null,
						departmentId: null,
					})
				).cuoc,
				(c) => c.id === s.cuoc,
				"soanDanhSachCuoc",
			).tenDonVi,
	},
	{
		ten: "moCoi.donVi.ten",
		cho: "kiem-ke@apps/api/src/okr/okr-tai-co-cau.service.ts:127",
		doc: async () =>
			motHang(
				await doc<MucMoCoi[]>("okr.moCoi", "quan", { cycleId: s.kyChay }),
				(m) => m.objectiveId === s.moCoi,
				"moCoi",
			).donVi.ten,
	},
	{
		ten: "bangCham.chuaCham.goc.ten",
		cho: "tenDonVi@khep.ts",
		doc: async () =>
			motHang(
				(
					await doc<BangChamOutput>("okr.bangCham", "quan", {
						cycleId: s.kyCham,
					})
				).chuaCham,
				(d) => d.khoa === "goc",
				"bangCham",
			).ten,
	},
	{
		ten: "xuatKy.cotDonVi",
		cho: "tenDonVi@okr-khep.service.ts",
		doc: async () =>
			cotCsv(
				(await doc<XuatKyOutput>("okr.xuatKy", "quan", { cycleId: s.kyDong }))
					.noiDung,
				"Đơn vị",
				"Cấp",
			),
	},
];

function choDungGoc(): string[] {
	const tuKiemKe = kiemKe
		.parse(JSON.parse(readFileSync(KIEM_KE, "utf8")))
		.muc.filter(
			(m) =>
				m.khai_niem === "goc" &&
				m.tep.startsWith("apps/api/src/") &&
				!m.tep.endsWith(TEP_HANG_CU) &&
				!m.tep.endsWith(TEP_TEN_DON_VI),
		)
		.map((m) => `kiem-ke@${m.tep}:${m.dong}`);
	const tuLoiGoi = readdirSync(NGUON_OKR)
		.filter((t) => t.endsWith(".ts") && t !== TEP_TEN_DON_VI_RIENG)
		.flatMap((t) => {
			const nguon = readFileSync(join(NGUON_OKR, t), "utf8");
			const so =
				(nguon.match(GOI_TEN_DON_VI)?.length ?? 0) -
				(nguon.match(DINH_NGHIA_TEN_DON_VI)?.length ?? 0);
			return Array.from({ length: so }, () => `tenDonVi@${t}`);
		});
	return [...tuKiemKe, ...tuLoiGoi].sort();
}

async function tenGocLa(name: string): Promise<void> {
	await db.organization.update({ where: { id: WORKSPACE_ID }, data: { name } });
}

async function mucTieuGoc(
	cycleId: string,
	ownerUserId: string,
): Promise<string> {
	return (
		await gieoMucTieuCongBo(cycleId, [{ ...KR_MOT, ownerUserId }], {
			unit: DON_VI_GOC,
		})
	).objectiveId;
}

async function gieoKyDong(): Promise<void> {
	luc(LUC_GIEO_KY_DONG);
	await keoDaiPhien();
	const namCham = await taoNam("cmst-cham-nam", 2026);
	s.kyCham = await taoQuy("cmst-cham", namCham, "2026-07-01", "2026-09-30");
	await dangChay(s.kyCham);
	const namDong = await taoNam("cmst-dong-nam", 2026);
	s.kyDong = await taoQuy("cmst-dong", namDong, "2026-07-01", "2026-09-30");
	await dangChay(s.kyDong);
	await mucTieuGoc(s.kyCham, phien.quan.nguoi);
	await mucTieuGoc(s.kyDong, phien.quan.nguoi);
	luc(LUC_DOC);
	await keoDaiPhien();
	for (const id of [s.kyCham, s.kyDong])
		ok(await goi("okr.setCyclePhase", { id, phase: "cham-diem" }), "sang cham");
	ok(await sangPha(s.kyDong, "da-dong"), "dong ky");
}

async function gieoKyChay(): Promise<void> {
	s.kyChay = await kyDangChay("cmst-chay");
	const chuKr = await nguoiMoi("cmst-chu-kr");
	s.cookieChuKr = await phienCua(chuKr);
	s.goc = await mucTieuGoc(s.kyChay, chuKr);
	const krGoc = await db.okrKeyResult.findFirstOrThrow({
		where: { objectiveId: s.goc },
		select: { id: true },
	});
	const { sessionId } = ok<{ sessionId: string }>(
		await goi("okr.moCapNhat", { entry: "sheet" }, s.cookieChuKr),
		"mo cap nhat goc",
	);
	ok(
		await goi(
			"okr.guiCapNhat",
			{
				sessionId,
				items: [
					{ keyResultId: krGoc.id, value: 1, confidence: "vua", note: "" },
				],
			},
			s.cookieChuKr,
		),
		"cap nhat goc",
	);
	const pb = await pbMoi("cmst-pb");
	const truong = await truongMoi("department", pb, "cmst-truong");
	s.phong = (
		await gieoMucTieuCongBo(
			s.kyChay,
			[{ ...KR_MOT, ownerUserId: truong.nguoi }],
			{
				unit: { level: "phong-ban", departmentId: pb },
				ownerUserId: truong.nguoi,
				ai: truong.cookie,
			},
		)
	).objectiveId;
	ok(
		await goi(
			"okr.addAlignment",
			{
				objectiveId: s.phong,
				targetObjectiveId: s.goc,
				targetKeyResultId: null,
			},
			truong.cookie,
		),
		"gop vao goc",
	);
	const roi = await nguoiMoi("cmst-roi");
	s.moCoi = await mucTieuGoc(s.kyChay, roi);
	await roiKhoi(roi);
}

async function gieoHoiY(): Promise<void> {
	const nguoiChon = await nguoiMoi("cmst-chon", "admin");
	s.kyHoiY = await taoNam("cmst-hoi-y", 2027);
	s.hoiY = ok<{ id: string }>(
		await goi("okr.moHoiY", {
			cycleId: s.kyHoiY,
			cauHoi: "Năm tới công ty nên dồn sức vào điều gì?",
			loiMo: "",
			soLieu: SO_LIEU_MAC_DINH,
			hanLuc: sauGio(new Date(), OKR_HOI_Y.hanGio.min * 2).toISOString(),
			nguoiChonUserId: nguoiChon,
		}),
		"mo hoi y",
	).id;
}

async function gieoCuocSoan(): Promise<void> {
	s.kySoan = await taoNam("cmst-soan", 2028);
	const mo = ok<SoanMoOutput>(
		await goi("okr.soanMo", {
			cycleId: s.kySoan,
			level: "onehub",
			divisionId: null,
			departmentId: null,
		}),
		"mo cuoc soan",
	);
	if (!mo.ok) throw new Error(`cmst: goc soanMo ${mo.lyDo}`);
	s.cuoc = mo.cuoc.id;
}

describe("cmst-goc", () => {
	let tenCu = "";
	let chuongTrinhCu: Json = null;

	beforeAll(async () => {
		tenCu = (
			await db.organization.findUniqueOrThrow({
				where: { id: WORKSPACE_ID },
				select: { name: true },
			})
		).name;
		chuongTrinhCu = await doc<Json>("okr.program");
		ok(
			await goi("okr.setProgram", {
				...CHUONG_TRINH_RONG,
				aiOn: true,
				aiSoanPhamVi: "toan-cong-ty",
			}),
			"chuong trinh",
		);
		await gieoKyDong();
		await gieoKyChay();
		await gieoHoiY();
		await gieoCuocSoan();
	}, SEED_MS);

	afterAll(async () => {
		setSystemTime();
		await tenGocLa(tenCu);
		const cu = z
			.object({ aiOn: z.boolean(), aiSoanPhamVi: z.string() })
			.safeParse(chuongTrinhCu);
		ok(
			await goi("okr.setProgram", {
				...CHUONG_TRINH_RONG,
				aiOn: cu.success ? cu.data.aiOn : false,
				aiSoanPhamVi: cu.success ? cu.data.aiSoanPhamVi : "tat",
			}),
			"tra chuong trinh",
		);
		await db.okrDeXuat.deleteMany({ where: { cuocSoanId: s.cuoc } });
		await db.okrCuocSoan.deleteMany({ where: { id: s.cuoc } });
		await db.agentTask.deleteMany({
			where: {
				kind: "okr-kiem-san-sang",
				finishedAt: null,
				createdAt: { gte: BAT_DAU },
			},
		});
		await donSanKhep();
	}, SEED_MS);

	test("cmst-goc: ma tran GOC_MOI_CHO khop so cho dung kiem-ke dan toi", () => {
		const cho = choDungGoc();
		const hang = GOC_MOI_CHO.map((h) => h.cho).sort();
		console.log(
			`cmst-goc: ma trận ${GOC_MOI_CHO.length} hàng, kiem-ke dẫn tới ${cho.length} chỗ dùng`,
		);
		if (JSON.stringify(hang) !== JSON.stringify(cho))
			throw new Error(
				`cmst: ma tran goc thieu ${GOC_MOI_CHO.length} khac ${cho.length}: hang ${hang.join(", ")} · cho ${cho.join(", ")}`,
			);
		expect(new Set(GOC_MOI_CHO.map((h) => h.ten)).size).toBe(cho.length);
	});

	test(
		"cmst-goc: moi hang tra ten khong gian lam viec, roi «Công ty» khi ten trang",
		async () => {
			for (const [name, mong] of [
				[TEN_THU, TEN_THU],
				[TEN_TRANG, TEN_DU_PHONG],
			] as const) {
				await tenGocLa(name);
				const giaTri = await Promise.all(
					GOC_MOI_CHO.map(async (hang) => ({
						ten: hang.ten,
						giaTri: await hang.doc(),
					})),
				);
				const sai = giaTri.filter((g) => g.giaTri !== mong);
				if (sai.length > 0)
					throw new Error(
						sai.map((g) => `cmst: goc ${g.ten} ${g.giaTri}`).join("\n"),
					);
				expect(giaTri.map((g) => g.giaTri)).toEqual(
					GOC_MOI_CHO.map(() => mong),
				);
			}
		},
		DOC_MS,
	);

	test("cmst-goc: readTenGoc — ten rong ra «Công ty», ten co khoang trang hai dau da cat", async () => {
		await tenGocLa("");
		expect(await readTenGoc(db)).toBe(TEN_DU_PHONG);
		await tenGocLa("  Kho A  ");
		expect(await readTenGoc(db)).toBe("Kho A");
	});
});
