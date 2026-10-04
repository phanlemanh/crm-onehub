import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db, Prisma } from "@crm/db";
import { capNhatPhien, moCuoc } from "@crm/db/okr-cuoc-soan";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { idMau } from "../scripts/okr-mau/nap";
import type {
	SoanDanhSachCuocOutput,
	SoanDuaVaoOutput,
	SoanMoOutput,
	SoanSanSangOutput,
} from "../src/okr/okr.contracts";
import { OKR } from "../src/okr/okr-config";
import {
	CHU_KY_Q4,
	DON_VI,
	type Duong,
	datPhaQuy4,
	donSoan,
	gieoCuoc,
	gieoDongNhap,
	goiSoan,
	NAC_SOAN,
	vaoDonVi,
	xoaCuoc,
} from "./soan-okr-san";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	ghiCauHinh,
	ketThucMau,
	mt,
	ok,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

const RANG = join(
	import.meta.dir,
	"../../../_acceptance/soan-okr-cung-tro-ly/rang",
);
const CHO_GIU =
	/^cho-eve:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const TRUONG_A = "nguyen-thi-lan";
const TRUONG_B = "ly-thanh-tam";
const QUAN_TRI = "le-hai-dang";
const DUONG = ["trpc", "rest"] as const;
const TEN_SUA = "Hợp đồng bán lẻ ký mới trong tháng";
const BANG_CUA_LOAI = {
	"muc-tieu-moi": "okrObjective",
	"kr-moi": "okrKeyResult",
	"can-chinh-moi": "okrAlignment",
} as const;

type LoaiDong = keyof typeof BANG_CUA_LOAI;
type DongNhan = { deXuatId: string; loai: LoaiDong };
type HangSql = {
	de_xuat_id: string;
	loai: string;
	trang_thai: string;
	tao_ra_id: string | null;
	bang: string | null;
};

let app: NestExpressApplication;
let cA = "";
let cB = "";
let cQuanTri = "";
let ketQuaDuaVao: Extract<SoanDuaVaoOutput, { ok: true }>;
const cuocA = { dang: "", daDuaVao: "", bo: "" };
const cuocB: string[] = [];
let dongNhan: DongNhan[] = [];

async function chaySql(ten: string, cuoc: string): Promise<HangSql[]> {
	const sql = readFileSync(join(RANG, ten), "utf8");
	return db.$transaction(async (tx) => {
		await tx.$executeRaw`SELECT set_config('okr.cuoc', ${cuoc}, true)`;
		return tx.$queryRawUnsafe<HangSql[]>(sql);
	});
}

function doiChieu(hang: HangSql[], dong: DongNhan[]): string[] {
	const loi: string[] = [];
	if (hang.length !== dong.length)
		loi.push(`so cap ${hang.length}, dong nhan/sua ${dong.length}`);
	for (const d of dong) {
		const h = hang.find((x) => x.de_xuat_id === d.deXuatId);
		if (!h) loi.push(`thieu dong ${d.deXuatId}`);
		else if (h.tao_ra_id === null)
			loi.push(`vet khong ghim dong ${d.deXuatId}`);
		else if (h.bang !== BANG_CUA_LOAI[d.loai])
			loi.push(`bang cua ${d.loai}: ${h.bang}`);
	}
	return loi;
}

async function danhSach(
	c: string,
	dv = DON_VI.kdBac,
	duong: Duong = "trpc",
): Promise<SoanDanhSachCuocOutput> {
	return ok<SoanDanhSachCuocOutput>(
		await goiSoan(app, "soanDanhSachCuoc", duong, vaoDonVi(dv, duong), c),
		"danh sach cuoc",
	);
}

async function moLai(
	duong: Duong,
	thuLaiCuocId?: string,
	c = cA,
): Promise<SoanMoOutput> {
	tienDongHo();
	return ok<SoanMoOutput>(
		await goiSoan(
			app,
			"soanMo",
			duong,
			{ ...vaoDonVi(DON_VI.kdBac, duong), thuLaiCuocId },
			c,
		),
		"mo",
	);
}

async function cuocDaDuaVao(): Promise<string> {
	const cuoc = await gieoCuoc({ donVi: DON_VI.kdBac, nguoiMo: TRUONG_A });
	const [mtId] = await gieoDongNhap(
		cuoc,
		[
			{
				loai: "muc-tieu-moi",
				khoa: "a",
				ten: "Bán lẻ miền Bắc ký đều mỗi tháng",
			},
		],
		"nhan",
	);
	const [k1] = await gieoDongNhap(
		cuoc,
		[
			{
				loai: "kr-moi",
				khoa: "a1",
				chaKhoa: "a",
				ten: "Hợp đồng bán lẻ ký mới",
				kieu: "tang-toi",
			},
		],
		"sua",
		{ giaTriCuoi: TEN_SUA },
	);
	const [k2] = await gieoDongNhap(
		cuoc,
		[
			{
				loai: "kr-moi",
				khoa: "a2",
				chaKhoa: "a",
				ten: "Tỷ lệ báo giá thành hợp đồng",
				kieu: "phan-tram",
				donVi: "%",
			},
		],
		"sua",
		{ giaTriCuoi: "Tỷ lệ báo giá chốt thành hợp đồng" },
	);
	const [cc] = await gieoDongNhap(
		cuoc,
		[
			{
				loai: "can-chinh-moi",
				khoa: "cc",
				chaKhoa: "a",
				dichId: mt("q4-kd"),
				loaiDich: "muc-tieu",
			},
		],
		"nhan",
	);
	await gieoDongNhap(
		cuoc,
		[{ loai: "muc-tieu-moi", khoa: "z", ten: "Mục tiêu bị bác" }],
		"bac",
	);
	await gieoDongNhap(
		cuoc,
		[{ loai: "muc-tieu-moi", khoa: "w", ten: "Mục tiêu còn chờ quyết" }],
		"cho",
	);
	await gieoDongNhap(
		cuoc,
		[{ loai: "kr-moi", khoa: "x", chaKhoa: "a", ten: "KR có số lạ 99" }],
		"bi-loai",
		{ maLoai: "so-moi" },
	);
	tienDongHo();
	const kq = ok<SoanDuaVaoOutput>(
		await goiSoan(
			app,
			"soanDuaVao",
			"trpc",
			{
				cuocSoanId: cuoc.id,
				kr: [
					{ deXuatId: k1 ?? "", khoiDiem: 0, dich: 10 },
					{ deXuatId: k2 ?? "", khoiDiem: 10, dich: 40 },
				],
			} as never,
			cA,
		),
		"dua vao",
	);
	if (!kq.ok) throw new Error(`dua vao: ${kq.lyDo} ${kq.chiTiet ?? ""}`);
	ketQuaDuaVao = kq;
	dongNhan = [
		{ deXuatId: mtId ?? "", loai: "muc-tieu-moi" },
		{ deXuatId: k1 ?? "", loai: "kr-moi" },
		{ deXuatId: k2 ?? "", loai: "kr-moi" },
		{ deXuatId: cc ?? "", loai: "can-chinh-moi" },
	];
	return cuoc.id;
}

beforeAll(async () => {
	await batDauMau();
	await donSoan();
	await datPhaQuy4("lap-ke-hoach");
	app = await dungUngDung();
	cA = await phienMau(TRUONG_A);
	cB = await phienMau(TRUONG_B);
	cQuanTri = await phienMau(QUAN_TRI);
	await ghiCauHinh(app, cQuanTri, NAC_SOAN.bat);
	cuocA.daDuaVao = await cuocDaDuaVao();
	cuocA.bo = (await gieoCuoc({ donVi: DON_VI.kdBac, nguoiMo: TRUONG_A })).id;
	await db.okrCuocSoan.update({
		where: { id: cuocA.bo },
		data: { trangThai: "bo" },
	});
	const m = await moLai("trpc");
	if (!m.ok) throw new Error(`mo A: ${m.lyDo}`);
	cuocA.dang = m.cuoc.id;
	await db.okrCuocSoan.updateMany({
		where: { id: { in: [cuocA.daDuaVao, cuocA.bo, cuocA.dang] } },
		data: { soLuot: 1 },
	});
	cuocB.push(
		(await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: TRUONG_B })).id,
		(await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: QUAN_TRI, nac: "an" })).id,
	);
}, CHO_DB);

afterAll(async () => {
	await donSoan();
	await ketThucMau(app);
}, CHO_DB);

describe("cuoc", () => {
	test(
		"trưởng phòng A thấy đúng ba id của phòng A (so tập), trưởng phòng B thấy một và quản trị thấy hai (cuộc ẩn chỉ quản trị thấy); qua hai đường",
		async () => {
			for (const duong of DUONG) {
				const a = await danhSach(cA, DON_VI.kdBac, duong);
				expect(new Set(a.cuoc.map((c) => c.id)), "lo cuoc don vi khac").toEqual(
					new Set([cuocA.dang, cuocA.daDuaVao, cuocA.bo]),
				);
				expect(a.cuoc[0]?.id, "cuoc gan nhat truoc").toBe(cuocA.dang);
				expect(a.tranCuoc).toBe(3);
				const b = await danhSach(cB, DON_VI.kdNam, duong);
				expect(new Set(b.cuoc.map((c) => c.id)), "lo cuoc an").toEqual(
					new Set(cuocB.slice(0, 1)),
				);
				const quanTri = await danhSach(cQuanTri, DON_VI.kdNam, duong);
				expect(new Set(quanTri.cuoc.map((c) => c.id))).toEqual(new Set(cuocB));
			}
			for (const duong of DUONG) {
				expect(
					(
						await goiSoan(
							app,
							"soanDanhSachCuoc",
							duong,
							vaoDonVi(DON_VI.kdNam, duong),
							cA,
						)
					).status,
				).toBe(403);
				expect(
					(
						await goiSoan(
							app,
							"soanDanhSachCuoc",
							duong,
							vaoDonVi(DON_VI.kdBac, duong),
							cB,
						)
					).status,
				).toBe(403);
			}
			const daDuaVao = (await danhSach(cA)).cuoc.find(
				(c) => c.id === cuocA.daDuaVao,
			);
			expect(daDuaVao).toMatchObject({
				trangThai: "da-dua-vao",
				soDongNhan: dongNhan.length,
				nguoiMo: { id: idMau("nguoi", TRUONG_A), name: "Nguyễn Thị Lan" },
			});
			expect(daDuaVao?.duaVaoLuc).not.toBeNull();
		},
		CHO_DB,
	);

	test(
		"tiếp nối: soanMo khi còn cuộc dang → con-cuoc-dang kèm id; sessionId là phiên đã lưu; sanSang vẫn mở kèm cuocDang; vẫn đúng một cuộc dang",
		async () => {
			for (const duong of DUONG)
				expect(await moLai(duong)).toMatchObject({
					ok: false,
					lyDo: "con-cuoc-dang",
					cuocDang: { id: cuocA.dang },
				});
			const hang = await db.okrCuocSoan.findUniqueOrThrow({
				where: { id: cuocA.dang },
			});
			expect(hang.sessionId).toMatch(CHO_GIU);
			const dang = (await danhSach(cA)).cuoc.find((c) => c.id === cuocA.dang);
			expect(dang?.sessionId).toBe(hang.sessionId);
			expect(
				await db.okrCuocSoan.count({
					where: {
						departmentId: DON_VI.kdBac.departmentId,
						trangThai: "dang",
					},
				}),
			).toBe(1);
			tienDongHo();
			for (const duong of DUONG) {
				const s = ok<SoanSanSangOutput>(
					await goiSoan(
						app,
						"soanSanSang",
						duong,
						vaoDonVi(DON_VI.kdBac, duong),
						cA,
					),
					"san sang",
				);
				expect(s).toMatchObject({
					bat: true,
					cuocDang: { id: cuocA.dang, sessionId: hang.sessionId },
					soCuocDaDung: 3,
				});
			}
		},
		CHO_DB,
	);

	test(
		"sessionId @unique: mở cuộc thứ hai với cùng phiên → lỗi Prisma P2002; phiên khác thì mở được",
		async () => {
			const hang = await db.okrCuocSoan.findUniqueOrThrow({
				where: { id: cuocA.dang },
			});
			const v = {
				cycleId: CHU_KY_Q4,
				...DON_VI.taiChinh,
				nguoiMoUserId: idMau("nguoi", TRUONG_B),
				nac: "bat",
			} as const;
			const trung = moCuoc(db, { ...v, sessionId: hang.sessionId });
			await expect(trung).rejects.toBeInstanceOf(
				Prisma.PrismaClientKnownRequestError,
			);
			await expect(trung).rejects.toMatchObject({ code: "P2002" });
			const khac = await moCuoc(db, {
				...v,
				sessionId: `${hang.sessionId}-khac`,
			});
			expect(khac.cacPhien).toEqual([`${hang.sessionId}-khac`]);
			await xoaCuoc(khac.id);
			expect(
				await db.okrCuocSoan.count({
					where: { departmentId: DON_VI.taiChinh.departmentId },
				}),
			).toBe(0);
		},
		CHO_DB,
	);

	test(
		"nhap-thanh-okr.sql trên cuộc da-dua-vao: số cặp = số dòng nhan/sua, mỗi cặp đúng bảng và đúng bản ghi vừa tạo; dòng bác, bị loại, chờ không có mặt",
		async () => {
			const hang = await chaySql("nhap-thanh-okr.sql", cuocA.daDuaVao);
			expect(doiChieu(hang, dongNhan)).toEqual([]);
			expect(hang.filter((h) => h.trang_thai === "sua")).toHaveLength(2);
			expect(hang.filter((h) => h.trang_thai === "nhan")).toHaveLength(2);
			const cua = (loai: LoaiDong) =>
				hang.flatMap((h) =>
					h.loai === loai && h.tao_ra_id !== null ? [h.tao_ra_id] : [],
				);
			const mucTieu = cua("muc-tieu-moi");
			expect(mucTieu).toHaveLength(1);
			expect(ketQuaDuaVao.mucTieuIds).toEqual(mucTieu);
			const kr = await db.okrKeyResult.findMany({
				where: { id: { in: cua("kr-moi") } },
				select: { objectiveId: true, title: true },
			});
			expect(kr.map((k) => k.objectiveId)).toEqual([
				mucTieu[0] ?? "",
				mucTieu[0] ?? "",
			]);
			expect(kr.map((k) => k.title)).toContain(TEN_SUA);
			const canChinh = await db.okrAlignment.findMany({
				where: {
					id: { in: cua("can-chinh-moi") },
				},
				select: { objectiveId: true, targetObjectiveId: true },
			});
			expect(canChinh).toEqual([
				{ objectiveId: mucTieu[0] ?? "", targetObjectiveId: mt("q4-kd") },
			]);
			expect(await chaySql("nhap-thanh-okr.sql", cuocA.dang)).toEqual([]);
			expect(await chaySql("nhap-thanh-okr.sql", cuocB[0] ?? "")).toEqual([]);
		},
		CHO_DB,
	);

	test(
		"nhap-thanh-okr.sql phát hiện vết gãy: dòng nhận không ghim, ghim vào bản ghi không có, ghim nhầm loại → bang NULL hay lệch, và bộ đối chiếu báo đúng ba lỗi",
		async () => {
			const cuoc = await gieoCuoc({
				donVi: DON_VI.taiChinh,
				nguoiMo: TRUONG_B,
			});
			const dong = await gieoDongNhap(
				cuoc,
				[
					{ loai: "muc-tieu-moi", khoa: "m1", ten: "Mục tiêu không ghim" },
					{
						loai: "muc-tieu-moi",
						khoa: "m2",
						ten: "Mục tiêu ghim vào hư không",
					},
					{ loai: "muc-tieu-moi", khoa: "m3", ten: "Mục tiêu ghim nhầm loại" },
				],
				"nhan",
			);
			const [m1, m2, m3] = dong as [string, string, string];
			await db.okrDeXuat.update({
				where: { id: m2 },
				data: { taoRaId: "khong-co-that" },
			});
			const krThat = (await chaySql("nhap-thanh-okr.sql", cuocA.daDuaVao)).find(
				(h) => h.loai === "kr-moi",
			)?.tao_ra_id;
			expect(krThat).toBeTruthy();
			await db.okrDeXuat.update({
				where: { id: m3 },
				data: { taoRaId: krThat },
			});
			const hang = await chaySql("nhap-thanh-okr.sql", cuoc.id);
			const theoId = new Map(hang.map((h) => [h.de_xuat_id, h]));
			expect(theoId.get(m1)).toMatchObject({ tao_ra_id: null, bang: null });
			expect(theoId.get(m2)).toMatchObject({
				tao_ra_id: "khong-co-that",
				bang: null,
			});
			expect(theoId.get(m3)?.bang).toBe("okrKeyResult");
			expect(
				doiChieu(
					hang,
					[m1, m2, m3].map((deXuatId) => ({
						deXuatId,
						loai: "muc-tieu-moi" as const,
					})),
				),
			).toEqual([
				`vet khong ghim dong ${m1}`,
				`bang cua muc-tieu-moi: null`,
				`bang cua muc-tieu-moi: okrKeyResult`,
			]);
			await xoaCuoc(cuoc.id);
		},
		CHO_DB,
	);

	test(
		"Thử lại đổi phiên: soanMo({ thuLaiCuocId }) đúc phiên uuid mới, nối cacPhien, xoá mốc luồng; phiên cũ vẫn trong cacPhien; hai đường; cuộc không dang không đổi được",
		async () => {
			const truoc = await db.okrCuocSoan.findUniqueOrThrow({
				where: { id: cuocA.dang },
			});
			expect(truoc.cacPhien).toEqual([truoc.sessionId]);
			await db.okrCuocSoan.update({
				where: { id: cuocA.dang },
				data: { streamIndex: 7, continuationToken: "tiep-tuc" },
			});
			const lan1 = await moLai("trpc", cuocA.dang);
			if (!lan1.ok) throw new Error(`thu lai 1: ${lan1.lyDo}`);
			expect(lan1.cuoc.id).toBe(cuocA.dang);
			expect(lan1.cuoc.sessionId).toMatch(CHO_GIU);
			expect(lan1.cuoc.sessionId).not.toBe(truoc.sessionId);
			const sau1 = await db.okrCuocSoan.findUniqueOrThrow({
				where: { id: cuocA.dang },
			});
			expect(sau1).toMatchObject({
				sessionId: lan1.cuoc.sessionId,
				cacPhien: [truoc.sessionId, lan1.cuoc.sessionId],
				streamIndex: 0,
				continuationToken: null,
				trangThai: "dang",
			});
			const lan2 = await moLai("rest", cuocA.dang);
			if (!lan2.ok) throw new Error(`thu lai 2: ${lan2.lyDo}`);
			const sau2 = await db.okrCuocSoan.findUniqueOrThrow({
				where: { id: cuocA.dang },
			});
			expect(sau2.cacPhien).toEqual([
				truoc.sessionId,
				lan1.cuoc.sessionId,
				lan2.cuoc.sessionId,
			]);
			expect(new Set(sau2.cacPhien).size).toBe(3);
			expect(
				(await danhSach(cA)).cuoc.find((c) => c.id === cuocA.dang)?.sessionId,
			).toBe(lan2.cuoc.sessionId);
			expect(await capNhatPhien(db, cuocA.dang, sau2.sessionId)).toEqual({
				doi: false,
			});
			expect(
				(await db.okrCuocSoan.findUniqueOrThrow({ where: { id: cuocA.dang } }))
					.cacPhien,
			).toEqual(sau2.cacPhien);
			const daDuaVao = await db.okrCuocSoan.findUniqueOrThrow({
				where: { id: cuocA.daDuaVao },
			});
			tienDongHo();
			const tra = await goiSoan(
				app,
				"soanMo",
				"trpc",
				{ ...vaoDonVi(DON_VI.kdBac, "trpc"), thuLaiCuocId: cuocA.daDuaVao },
				cA,
			);
			expect(tra.status).toBe(409);
			expect(
				(
					await db.okrCuocSoan.findUniqueOrThrow({
						where: { id: cuocA.daDuaVao },
					})
				).cacPhien,
			).toEqual(daDuaVao.cacPhien);
		},
		CHO_DB,
	);
});

describe("nguoi-mo-cuoc", () => {
	test(
		"Thử lại và đếm lượt chỉ cho người mở cuộc hoặc quản trị: trưởng bộ phận cùng đơn vị bị 403 có tên, phiên và số lượt giữ nguyên",
		async () => {
			const cBoPhan = await phienMau("tran-quoc-bao");
			const doc = () =>
				db.okrCuocSoan.findUniqueOrThrow({
					where: { id: cuocA.dang },
					select: { sessionId: true, soLuot: true },
				});
			const truoc = await doc();
			const thuLai = await goiSoan(
				app,
				"soanMo",
				"trpc",
				{ ...vaoDonVi(DON_VI.kdBac, "trpc"), thuLaiCuocId: cuocA.dang },
				cBoPhan,
			);
			const luot = await goiSoan(
				app,
				"soanTangLuot",
				"trpc",
				{ cuocSoanId: cuocA.dang },
				cBoPhan,
			);
			const sauNguoiKhac = await doc();
			const quanTri = await moLai("trpc", cuocA.dang, cQuanTri);
			const luotQuanTri = await goiSoan(
				app,
				"soanTangLuot",
				"trpc",
				{ cuocSoanId: cuocA.dang },
				cQuanTri,
			);
			const nguoiMo = await moLai("rest", cuocA.dang, cA);
			expect({
				thuLai: [thuLai.status, thuLai.loi],
				luot: [luot.status, luot.loi],
				giuNguyen: sauNguoiKhac,
				quanTri: quanTri.ok,
				luotQuanTri: (luotQuanTri.data as { ok?: boolean } | undefined)?.ok,
				nguoiMo: nguoiMo.ok,
			}).toEqual({
				thuLai: [403, OKR.thongDiep.soan.khongPhaiNguoiMo],
				luot: [403, OKR.thongDiep.soan.khongPhaiNguoiMo],
				giuNguyen: truoc,
				quanTri: true,
				luotQuanTri: true,
				nguoiMo: true,
			});
		},
		CHO_DB,
	);
});
