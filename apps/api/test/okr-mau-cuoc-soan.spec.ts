import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { chiTieuThang, thangVN } from "@crm/db/ai-chi-phi";
import { type CuocSoan, docCuoc, moCuoc } from "@crm/db/okr-cuoc-soan";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import { idMau, xoaBoOkrMau } from "../scripts/okr-mau/nap";
import type { SoanMoOutput } from "../src/okr/okr.contracts";
import {
	chayLenh,
	cotMangChu,
	demThamChieu,
	demThamChieuMang,
	nguoiMau,
	tapIdMau,
	vanTayKho,
} from "./okr-mau-san";
import {
	BP,
	CHU_KY_NAM_KE,
	DON_VI,
	gieoDongNhap,
	goiSoan,
	PB,
	vaoDonVi,
} from "./soan-okr-san";
import {
	batDauMau,
	dungUngDung,
	ghiCauHinh,
	gieoChiPhi,
	ketThucMau,
	ok,
	phienMau,
	TIEN_TO_TLO,
} from "./tro-ly-okr-san";

const CHO = 300_000;
const TRUONG = "nguyen-thi-lan";
const QUAN_TRI = "le-hai-dang";
const TIEN = { startsWith: OKR_MAU.tienTo };
const KHOA_CAU_HINH = "okrProgramConfig.createdById";
const MANG_CAU_HINH = [
	"aiDeXuatAnDonVi",
	"aiDeXuatDonVi",
	"aiSoanAnDonVi",
	"aiSoanDonVi",
	"aiTomTatAnDonVi",
	"aiTomTatDonVi",
].map((c) => `okrProgramConfig.${c}`);
const NGOAI = {
	chuKy: "ngoai-mau-chu-ky-omx",
	pb: "ngoai-mau-pb-omx",
	nguoi: "ngoai-mau-nguoi-omx",
};

let app: NestExpressApplication;

function hong(dieuKien: boolean, thongDiep: string): void {
	if (dieuKien) throw new Error(thongDiep);
}

async function moCuocMau(): Promise<CuocSoan> {
	await batDauMau();
	const quanTri = await phienMau(QUAN_TRI);
	await ghiCauHinh(app, quanTri, {
		aiOn: true,
		aiSoanPhamVi: "danh-sach",
		aiSoanDonVi: [PB("kd-bac")],
		aiSoanAnPhamVi: "tat",
		aiSoanAnDonVi: [],
	});
	const truong = await phienMau(TRUONG);
	const mo = ok<SoanMoOutput>(
		await goiSoan(
			app,
			"soanMo",
			"trpc",
			vaoDonVi(DON_VI.kdBac, "trpc", CHU_KY_NAM_KE),
			truong,
		),
		"soanMo",
	);
	if (!mo.ok) throw new Error(`omx: soanMo tu choi ${mo.lyDo}`);
	const cuoc = await docCuoc(db, mo.cuoc.id);
	if (!cuoc) throw new Error("omx: soanMo khong ghi cuoc");
	return cuoc;
}

async function cuocTay(v: {
	cycleId: string;
	level: CuocSoan["level"];
	divisionId: string | null;
	departmentId: string | null;
	nguoiMoUserId: string;
	nhan: string;
}): Promise<CuocSoan> {
	const { nhan, ...donVi } = v;
	const cuoc = await moCuoc(db, {
		...donVi,
		sessionId: `${TIEN_TO_TLO}omx-${nhan}`,
		nac: "bat",
	});
	await gieoDongNhap(cuoc, [
		{ loai: "muc-tieu-moi", khoa: `m-${nhan}`, ten: `Mục tiêu ${nhan}` },
	]);
	return cuoc;
}

const conCuoc = (id: string) => db.okrCuocSoan.count({ where: { id } });

const demCuocTroMau = (nguoi: string[]) =>
	db.okrCuocSoan.count({
		where: {
			OR: [
				{ cycleId: TIEN },
				{ divisionId: TIEN },
				{ departmentId: TIEN },
				{ nguoiMoUserId: { in: nguoi } },
			],
		},
	});

async function chupHang(bang: string, id: string): Promise<string[]> {
	const rows = await db.$queryRawUnsafe<{ dong: string }[]>(
		`SELECT to_jsonb(t)::text AS dong FROM "${bang}" t WHERE id = $1`,
		id,
	);
	return rows.map((r) => r.dong);
}

async function chupDeXuat(cuocSoanId: string): Promise<string[]> {
	const rows = await db.$queryRawUnsafe<{ dong: string }[]>(
		`SELECT to_jsonb(t)::text AS dong FROM "okrDeXuat" t WHERE "cuocSoanId" = $1 ORDER BY id`,
		cuocSoanId,
	);
	return rows.map((r) => r.dong);
}

beforeAll(async () => {
	app = await dungUngDung();
}, CHO);

afterAll(async () => {
	await db.okrDeXuat.deleteMany({ where: { cuocSoanId: { not: null } } });
	await db.okrCuocSoan.deleteMany({});
	await ketThucMau(app);
}, CHO);

describe("omx-xoa", () => {
	test(
		"cuộc soạn trên bộ mẫu, đề xuất của nó đi theo --xoa; cuộc ngoài và chi phí AI ở lại",
		async () => {
			const chinh = await moCuocMau();
			await gieoDongNhap(chinh, [
				{ loai: "muc-tieu-moi", khoa: "m1", ten: "Tăng hợp đồng miền Bắc" },
			]);
			await gieoDongNhap(
				chinh,
				[{ loai: "muc-tieu-moi", khoa: "m2", ten: "Giảm thời gian chốt" }],
				"bac",
			);
			const vePb = await cuocTay({
				nhan: "ve-pb",
				cycleId: NGOAI.chuKy,
				level: "phong-ban",
				divisionId: null,
				departmentId: PB("kd-nam"),
				nguoiMoUserId: NGOAI.nguoi,
			});
			const veBp = await cuocTay({
				nhan: "ve-bp",
				cycleId: NGOAI.chuKy,
				level: "bo-phan",
				divisionId: BP("kinh-doanh"),
				departmentId: null,
				nguoiMoUserId: NGOAI.nguoi,
			});
			const veNguoi = await cuocTay({
				nhan: "ve-nguoi",
				cycleId: NGOAI.chuKy,
				level: "phong-ban",
				divisionId: null,
				departmentId: NGOAI.pb,
				nguoiMoUserId: nguoiMau(TRUONG),
			});
			const veChuKy = await cuocTay({
				nhan: "ve-chu-ky",
				cycleId: CHU_KY_NAM_KE,
				level: "onehub",
				divisionId: null,
				departmentId: null,
				nguoiMoUserId: NGOAI.nguoi,
			});
			const ngoai = await cuocTay({
				nhan: "ngoai",
				cycleId: "ngoai-mau-chu-ky",
				level: "phong-ban",
				divisionId: null,
				departmentId: "ngoai-mau-pb",
				nguoiMoUserId: "ngoai-mau-nguoi",
			});
			await gieoChiPhi({
				id: "omx-chi",
				taskId: chinh.id,
				sessionId: chinh.sessionId,
				tinhNang: "okr.soan",
				usd: "0.25",
			});
			const idChi = `${TIEN_TO_TLO}omx-chi`;
			const thang = thangVN(new Date());
			const cuocMau = [chinh, vePb, veBp, veNguoi, veChuKy].map((c) => c.id);

			const ids = await tapIdMau();
			const nguoi = ids.filter((id) => id.startsWith(idMau("nguoi", "")));
			const truoc = await demThamChieu(ids);
			for (const cot of [
				"okrCuocSoan.cycleId",
				"okrCuocSoan.departmentId",
				"okrCuocSoan.divisionId",
				"okrCuocSoan.nguoiMoUserId",
				KHOA_CAU_HINH,
			])
				expect(Object.keys(truoc), cot).toContain(cot);
			const mangTruoc = await demThamChieuMang(ids);
			expect(Object.keys(mangTruoc.dem)).toContain(
				"okrProgramConfig.aiSoanDonVi",
			);
			for (const cot of [...(await cotMangChu()), ...MANG_CAU_HINH])
				hong(!mangTruoc.cot.includes(cot), `omx: quet mang thieu cot ${cot}`);
			expect(
				await db.okrCuocSoan.count({ where: { id: { in: cuocMau } } }),
			).toBe(5);
			expect(
				await db.okrDeXuat.count({ where: { cuocSoanId: { in: cuocMau } } }),
			).toBe(6);
			const ngoaiTruoc = [
				...(await chupHang("okrCuocSoan", ngoai.id)),
				...(await chupDeXuat(ngoai.id)),
			];
			expect(ngoaiTruoc).toHaveLength(2);
			const chiTruoc = await chupHang("aiChiPhi", idChi);
			expect(chiTruoc).toHaveLength(1);
			const tongTruoc = (await chiTieuThang(db, thang)).tongUsd;
			expect(tongTruoc).toBeGreaterThanOrEqual(0.25);

			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(0);

			hong((await conCuoc(chinh.id)) > 0, "omx: con cuoc soan mau (chinh)");
			hong((await conCuoc(vePb.id)) > 0, "omx: con cuoc ve-pb");
			hong((await conCuoc(veBp.id)) > 0, "omx: con cuoc ve-bp");
			hong((await conCuoc(veNguoi.id)) > 0, "omx: con cuoc ve-nguoi");
			hong((await conCuoc(veChuKy.id)) > 0, "omx: con cuoc ve-chu-ky");
			const conTroMau = await demCuocTroMau(nguoi);
			hong(conTroMau > 0, `omx: con cuoc soan mau (${conTroMau})`);
			const conDeXuat = await db.okrDeXuat.count({
				where: { cuocSoanId: { in: cuocMau } },
			});
			hong(conDeXuat > 0, `omx: con de xuat soan (${conDeXuat})`);
			const sau = await demThamChieu(ids);
			hong(
				Object.keys(sau).length > 0,
				`omx: con tham chieu mau ${JSON.stringify(sau)}`,
			);
			const mangSau = (await demThamChieuMang(ids)).dem;
			hong(
				Object.keys(mangSau).length > 0,
				`omx: con ma mau trong mang ${JSON.stringify(mangSau)}`,
			);
			hong(
				JSON.stringify(await chupHang("aiChiPhi", idChi)) !==
					JSON.stringify(chiTruoc),
				"omx: chi phi soan bi doi",
			);
			const tongSau = (await chiTieuThang(db, thang)).tongUsd;
			hong(
				tongSau !== tongTruoc,
				`omx: tong chi thang doi ${tongTruoc} -> ${tongSau}`,
			);
			const ngoaiSau = [
				...(await chupHang("okrCuocSoan", ngoai.id)),
				...(await chupDeXuat(ngoai.id)),
			];
			hong(
				JSON.stringify(ngoaiSau) !== JSON.stringify(ngoaiTruoc),
				"omx: cuoc ngoai bi doi",
			);
			hong(
				!r.ra.startsWith("Đã xoá bộ OKR mẫu:") ||
					!r.ra.includes("5 cuộc soạn OKR với 6 đề xuất soạn"),
				`omx: dong in thieu dem cuoc soan: ${r.ra}`,
			);

			const lai = chayLenh([]);
			expect(lai.ma, lai.loi).toBe(0);
		},
		CHO,
	);
});

describe("omx-mo-coi", () => {
	test(
		"kho chỉ còn cuộc mồ côi từ lần xoá trước: --xoa gỡ và đếm nó",
		async () => {
			await xoaBoOkrMau(db);
			expect(await tapIdMau()).toEqual([]);
			const moCoi = await cuocTay({
				nhan: "mo-coi",
				cycleId: CHU_KY_NAM_KE,
				level: "phong-ban",
				divisionId: null,
				departmentId: PB("kd-bac"),
				nguoiMoUserId: nguoiMau(TRUONG),
			});
			expect(
				await db.okrDeXuat.count({ where: { cuocSoanId: moCoi.id } }),
			).toBe(1);

			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(0);
			hong((await conCuoc(moCoi.id)) > 0, "omx: cuoc mo coi con");
			hong(
				(await db.okrDeXuat.count({ where: { cuocSoanId: moCoi.id } })) > 0,
				"omx: de xuat mo coi con",
			);
			hong(r.ra.includes("không có bộ mẫu"), "omx: mo coi bao khong co bo mau");
			expect(r.ra).toContain("1 cuộc soạn OKR với 1 đề xuất soạn");
		},
		CHO,
	);
});

describe("omx-nap-lai", () => {
	test(
		"nạp lại gỡ cuộc soạn của bộ cũ và đề xuất của nó",
		async () => {
			const cu = await moCuocMau();
			await gieoDongNhap(cu, [
				{ loai: "muc-tieu-moi", khoa: "m1", ten: "Tăng hợp đồng miền Bắc" },
			]);
			const dem = async () => ({
				boPhan: await db.division.count({ where: { id: TIEN } }),
				phongBan: await db.department.count({ where: { id: TIEN } }),
				chuKy: await db.okrCycle.count({ where: { id: TIEN } }),
				mucTieu: await db.okrObjective.count({ where: { id: TIEN } }),
				kr: await db.okrKeyResult.count({ where: { id: TIEN } }),
			});
			const mot = await dem();
			const nguoi = (await tapIdMau()).filter((id) =>
				id.startsWith(idMau("nguoi", "")),
			);

			const r = chayLenh([]);
			expect(r.ma, r.loi).toBe(0);
			hong(
				(await conCuoc(cu.id)) > 0 || (await demCuocTroMau(nguoi)) > 0,
				"omx: nap lai con cuoc cu",
			);
			hong(
				(await db.okrDeXuat.count({ where: { cuocSoanId: cu.id } })) > 0,
				"omx: nap lai con de xuat cu",
			);
			const hai = await dem();
			hong(
				JSON.stringify(hai) !== JSON.stringify(mot),
				`omx: nap lai lech so hang ${JSON.stringify(mot)} -> ${JSON.stringify(hai)}`,
			);
		},
		CHO,
	);
});

describe("omx-dang-giu", () => {
	test(
		"dữ liệu ngoài giữ người mẫu: mã 5, kho không đổi kể cả cuộc soạn",
		async () => {
			const cuoc = await moCuocMau();
			await gieoDongNhap(cuoc, [
				{ loai: "muc-tieu-moi", khoa: "m1", ten: "Tăng hợp đồng miền Bắc" },
			]);
			await db.company.create({
				data: { id: "ngoai-mau-cty-omx", name: "Công ty ngoài mẫu omx" },
			});
			await db.deal.create({
				data: {
					id: "ngoai-mau-deal-omx",
					name: "Thoả thuận ngoài mẫu omx",
					companyId: "ngoai-mau-cty-omx",
					ownerId: nguoiMau("do-minh-khoa"),
				},
			});
			try {
				const truoc = await vanTayKho();
				expect(Object.keys(truoc)).toEqual(
					expect.arrayContaining(["okrCuocSoan", "okrDeXuat"]),
				);
				const r = chayLenh([OKR_MAU.co.xoa]);
				hong(r.ma !== OKR_MAU.ma.dangGiu, `omx: ma 5 khong ra (${r.ma})`);
				const sau = await vanTayKho();
				const lech = Object.keys(truoc).filter((b) => truoc[b] !== sau[b]);
				hong(lech.length > 0, `omx: ma 5 doi kho ${lech.join(",")}`);
			} finally {
				await db.deal.delete({ where: { id: "ngoai-mau-deal-omx" } });
				await db.company.delete({ where: { id: "ngoai-mau-cty-omx" } });
			}
		},
		CHO,
	);
});
