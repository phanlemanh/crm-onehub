import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { CuocSoan } from "@crm/db/okr-cuoc-soan";
import { docTrangChienLuocDangDung } from "@crm/db/tai-lieu-chien-luoc";
import { khoaDong } from "@crm/validation/okr-kiem-de-xuat";
import { dongSoanTuHang, TRO_LY_OKR_TRAN } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type {
	SoanDanhSachOutput,
	SoanQuyetOutput,
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
	trangThaiDongNhap,
	xoaCuoc,
} from "./soan-okr-san";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	ghiCauHinh,
	ketThucMau,
	mt,
	nguoi,
	ok,
	phienMau,
	type TraLoi,
	tienDongHo,
} from "./tro-ly-okr-san";

const TRUONG = "nguyen-thi-lan";
const QUAN_TRI = "le-hai-dang";
const DUONG = ["trpc", "rest"] as const satisfies readonly Duong[];
const T = OKR.thongDiep.soan;

let app: NestExpressApplication;
let cTruong = "";
let cQuanTri = "";

type Kho = {
	cuoc: CuocSoan;
	mtA: string;
	kA1: string;
	kA2: string;
	ccA: string;
	mtB: string;
	kB1: string;
	kB2: string;
	mtC: string;
	kC1: string;
	ccC: string;
	loaiC: string;
};
let kho: Kho;

async function gieoBanNhap(nhan: string): Promise<Kho> {
	const cuoc = await gieoCuoc({ donVi: DON_VI.kdBac, nguoiMo: TRUONG });
	const [mtA, mtB, mtC] = (await gieoDongNhap(cuoc, [
		{
			loai: "muc-tieu-moi",
			khoa: "a",
			ten: `Bán lẻ miền Bắc ký đều mỗi tháng ${nhan}`,
		},
		{
			loai: "muc-tieu-moi",
			khoa: "b",
			ten: `Đối tác cũ quay lại đặt hàng ${nhan}`,
			loaiMucTieu: "tham-vong",
		},
		{ loai: "muc-tieu-moi", khoa: "c", ten: `Mục tiêu sẽ bị bác ${nhan}` },
	])) as [string, string, string];
	const [kA1, kA2, kB1, kB2, kC1] = (await gieoDongNhap(cuoc, [
		{
			loai: "kr-moi",
			khoa: "a1",
			chaKhoa: "a",
			ten: "Hợp đồng bán lẻ ký mới",
			kieu: "tang-toi",
			donVi: "hợp đồng",
			khoiDiemGoiY: 12,
		},
		{
			loai: "kr-moi",
			khoa: "a2",
			chaKhoa: "a",
			ten: "Tỷ lệ báo giá thành hợp đồng",
			kieu: "phan-tram",
			donVi: "%",
		},
		{
			loai: "kr-moi",
			khoa: "b1",
			chaKhoa: "b",
			ten: "Đối tác cũ đặt lại",
			kieu: "tang-toi",
			donVi: "đối tác",
		},
		{
			loai: "kr-moi",
			khoa: "b2",
			chaKhoa: "b",
			ten: "Hoàn thành chương trình chăm sóc lại",
			kieu: "moc",
			donVi: "mốc",
		},
		{
			loai: "kr-moi",
			khoa: "c1",
			chaKhoa: "c",
			ten: "KR dưới mục tiêu bị bác",
			kieu: "tang-toi",
			donVi: "lần",
		},
	])) as [string, string, string, string, string];
	const [ccA, ccC] = (await gieoDongNhap(cuoc, [
		{
			loai: "can-chinh-moi",
			khoa: "cc-a",
			chaKhoa: "a",
			dichId: mt("q4-kd"),
			loaiDich: "muc-tieu",
		},
		{
			loai: "can-chinh-moi",
			khoa: "cc-c",
			chaKhoa: "c",
			dichId: mt("q4-kd"),
			loaiDich: "muc-tieu",
		},
	])) as [string, string];
	const [loaiC] = (await gieoDongNhap(
		cuoc,
		[
			{
				loai: "kr-moi",
				khoa: "c9",
				chaKhoa: "c",
				ten: "KR đạt 100 % ngay",
				kieu: "tang-toi",
			},
		],
		"bi-loai",
		{ maLoai: "so-moi" },
	)) as [string];
	return {
		cuoc,
		mtA,
		kA1,
		kA2,
		ccA,
		mtB,
		kB1,
		kB2,
		mtC,
		kC1,
		ccC,
		loaiC,
	};
}

async function quyet(
	deXuatId: string,
	cach: "nhan" | "sua" | "bac",
	giaTriCuoi?: string,
	c = cTruong,
	duong: Duong = "trpc",
): Promise<TraLoi> {
	tienDongHo();
	return goiSoan(
		app,
		"soanQuyet",
		duong,
		{ deXuatId, quyet: cach, giaTriCuoi },
		c,
	);
}

async function danhSach(
	cuocSoanId: string,
	duong: Duong = "trpc",
	c = cTruong,
) {
	return ok<SoanDanhSachOutput>(
		await goiSoan(app, "soanDanhSach", duong, { cuocSoanId }, c),
		`danh sach ${duong}`,
	);
}

async function hang(id: string) {
	return db.okrDeXuat.findUniqueOrThrow({ where: { id } });
}

beforeAll(async () => {
	await batDauMau();
	await donSoan();
	await datPhaQuy4("lap-ke-hoach");
	app = await dungUngDung();
	cTruong = await phienMau(TRUONG);
	cQuanTri = await phienMau(QUAN_TRI);
	await ghiCauHinh(app, cQuanTri, NAC_SOAN.bat);
	kho = await gieoBanNhap("1");
}, CHO_DB);

afterAll(async () => {
	await donSoan();
	await ketThucMau(app);
}, CHO_DB);

describe("quyet", () => {
	test(
		"danh sách: chỉ dòng qua kiểm (không bi-loai), ghi hienLuc lần đầu rồi giữ, cùng tập id qua hai đường, dòng phẳng theo khuôn D",
		async () => {
			const truoc = await danhSach(kho.cuoc.id);
			const ids = new Set(truoc.dong.map((d) => d.id));
			expect(ids.has(kho.loaiC)).toBe(false);
			expect(ids).toEqual(
				new Set([
					kho.mtA,
					kho.mtB,
					kho.mtC,
					kho.kA1,
					kho.kA2,
					kho.kB1,
					kho.kB2,
					kho.kC1,
					kho.ccA,
					kho.ccC,
				]),
			);
			expect(truoc.cuoc.id).toBe(kho.cuoc.id);
			expect(truoc.cuoc.soDongTong).toBe(10);
			for (const d of truoc.dong)
				expect(d.khoaDong, `khoaDong ${d.id}`).toBe(
					khoaDong(dongSoanTuHang(await hang(d.id))),
				);
			expect(new Set(truoc.dong.map((d) => d.khoaDong)).size).toBe(10);
			expect(truoc.lyDo).toBeNull();
			expect(truoc.thieuBoiCanh).toBe(
				(await docTrangChienLuocDangDung(db)).length === 0,
			);
			const lanDau = new Map<string, number>();
			for (const d of truoc.dong) {
				const h = await hang(d.id);
				expect(h.hienLuc, `hienLuc ${d.id}`).not.toBeNull();
				lanDau.set(d.id, h.hienLuc?.getTime() ?? 0);
			}
			expect((await hang(kho.loaiC)).hienLuc).toBeNull();
			tienDongHo(60_000);
			const rest = await danhSach(kho.cuoc.id, "rest");
			expect(new Set(rest.dong.map((d) => d.id))).toEqual(ids);
			for (const d of rest.dong)
				expect((await hang(d.id)).hienLuc?.getTime(), `giu ${d.id}`).toBe(
					lanDau.get(d.id),
				);
			expect(truoc.dong.find((d) => d.id === kho.kA1)).toMatchObject({
				loai: "kr-moi",
				khoa: "a1",
				chaKhoa: "a",
				ten: "Hợp đồng bán lẻ ký mới",
				kieu: "tang-toi",
				donVi: "hợp đồng",
				khoiDiemGoiY: 12,
				trangThai: "cho",
				maLoai: null,
				giaTriCuoi: null,
				taoRaId: null,
			});
			expect(truoc.dong.find((d) => d.id === kho.mtB)).toMatchObject({
				loai: "muc-tieu-moi",
				khoa: "b",
				loaiMucTieu: "tham-vong",
				viSaoLucNay: "Kỳ trước còn trượt phần này.",
			});
			const dich = await db.okrObjective.findUniqueOrThrow({
				where: { id: mt("q4-kd") },
				select: { title: true },
			});
			expect(truoc.dong.find((d) => d.id === kho.ccA)).toMatchObject({
				loai: "can-chinh-moi",
				khoa: "cc-a",
				chaKhoa: "a",
				dichId: mt("q4-kd"),
				tenDich: dich.title,
			});
		},
		CHO_DB,
	);

	test(
		"nhận Mục tiêu A, KR a2, Căn chỉnh; sửa KR a1 (giá trị qua khuôn tên KR); quyết lại thì lần sau thắng; dich vẫn null",
		async () => {
			for (const id of [kho.mtA, kho.kA2, kho.ccA])
				expect(
					ok<SoanQuyetOutput>(await quyet(id, "nhan"), `nhan ${id}`),
				).toEqual({
					ok: true,
				});
			const goRa = "Hợp đồng bán lẻ ký mới với chuỗi trên 10 cửa hàng";
			const thieu = await quyet(kho.kA1, "sua");
			expect(thieu.status, "sua can gia tri").toBe(400);
			expect(thieu.loi).toBe(T.canGiaTri);
			const ngan = await quyet(kho.kA1, "sua", "ab");
			expect(ngan.status, "sua qua ngan").toBe(400);
			expect(ngan.loi).toBe(T.tenSuaKhongHop(TRO_LY_OKR_TRAN.chu.tenKr));
			const dai = await quyet(
				kho.mtA,
				"sua",
				"x".repeat(TRO_LY_OKR_TRAN.chu.tenMucTieu + 1),
			);
			expect(dai.status, "sua muc tieu qua dai").toBe(400);
			expect(dai.loi).toBe(T.tenSuaKhongHop(TRO_LY_OKR_TRAN.chu.tenMucTieu));
			expect(await trangThaiDongNhap(kho.mtA)).toBe("nhan");
			const tenA = "Bán lẻ miền Bắc ký đều hằng tháng";
			expect(
				ok<SoanQuyetOutput>(await quyet(kho.mtA, "sua", tenA), "sua A"),
			).toEqual({ ok: true });
			expect(await hang(kho.mtA)).toMatchObject({
				trangThai: "sua",
				giaTriCuoi: tenA,
			});
			const ccSua = await quyet(kho.ccA, "sua", "Căn chỉnh khác");
			expect(ccSua.status, "sua can chinh").toBe(400);
			expect(ccSua.loi).toBe(T.cachKhongHop);
			expect(await trangThaiDongNhap(kho.ccA)).toBe("nhan");
			expect(await trangThaiDongNhap(kho.kA1)).toBe("cho");
			expect(
				ok<SoanQuyetOutput>(await quyet(kho.kA1, "sua", goRa), "sua a1"),
			).toEqual({
				ok: true,
			});
			const a1 = await hang(kho.kA1);
			expect(a1).toMatchObject({
				trangThai: "sua",
				giaTriCuoi: goRa,
				nguoiQuyet: nguoi(TRUONG),
				dich: null,
			});
			expect(a1.quyetLuc).not.toBeNull();
			expect(await hang(kho.mtA)).toMatchObject({
				trangThai: "sua",
				giaTriCuoi: tenA,
				nguoiQuyet: nguoi(TRUONG),
				dich: null,
			});
			expect(
				ok<SoanQuyetOutput>(
					await quyet(kho.kA2, "sua", "Tỷ lệ báo giá chốt thành hợp đồng"),
					"a2 sua",
				),
			).toEqual({ ok: true });
			expect(
				ok<SoanQuyetOutput>(
					await quyet(kho.kA2, "bac", undefined, cQuanTri),
					"a2 bac",
				),
			).toEqual({ ok: true });
			expect(await hang(kho.kA2)).toMatchObject({
				trangThai: "bac",
				giaTriCuoi: null,
				nguoiQuyet: nguoi(QUAN_TRI),
			});
			const lucCuoi = tienDongHo();
			expect(
				ok<SoanQuyetOutput>(
					await quyet(kho.kA2, "nhan", undefined, cTruong, "rest"),
					"a2 nhan rest",
				),
			).toEqual({ ok: true });
			const a2 = await hang(kho.kA2);
			expect(a2).toMatchObject({
				trangThai: "nhan",
				giaTriCuoi: null,
				nguoiQuyet: nguoi(TRUONG),
			});
			expect(a2.quyetLuc?.getTime()).toBeGreaterThan(lucCuoi.getTime());
		},
		CHO_DB,
	);

	test(
		"bác Mục tiêu C kéo KR con c1 và Căn chỉnh cc-c cùng bac; dòng bị loại và dòng của Mục tiêu khác giữ nguyên; nhận hay sửa dưới Mục tiêu đã bác, bị loại hay không có trả lý do có tên",
		async () => {
			expect(
				ok<SoanQuyetOutput>(await quyet(kho.kC1, "nhan"), "nhan c1 truoc"),
			).toEqual({ ok: true });
			const kq = ok<SoanQuyetOutput>(await quyet(kho.mtC, "bac"), "bac C");
			expect(kq).toEqual({ ok: true });
			for (const id of [kho.mtC, kho.kC1, kho.ccC])
				expect(await hang(id), `bac keo ${id}`).toMatchObject({
					trangThai: "bac",
					giaTriCuoi: null,
					nguoiQuyet: nguoi(TRUONG),
				});
			expect(await trangThaiDongNhap(kho.loaiC)).toBe("bi-loai");
			expect(await trangThaiDongNhap(kho.kA1)).toBe("sua");
			expect(await trangThaiDongNhap(kho.kB1)).toBe("cho");
			const [them] = (await gieoDongNhap(kho.cuoc, [
				{ loai: "kr-moi", khoa: "c2", chaKhoa: "c", ten: "KR nộp lại dưới C" },
			])) as [string];
			const tenC = `Mục tiêu sẽ bị bác 1`;
			const [chaLoai] = (await gieoDongNhap(
				kho.cuoc,
				[{ loai: "muc-tieu-moi", khoa: "d", ten: "Mục tiêu tăng 300 % ngay" }],
				"bi-loai",
				{ maLoai: "so-moi" },
			)) as [string];
			const [conLoai, moCoi] = (await gieoDongNhap(kho.cuoc, [
				{
					loai: "kr-moi",
					khoa: "d1",
					chaKhoa: "d",
					ten: "KR dưới mục tiêu bị loại",
				},
				{
					loai: "kr-moi",
					khoa: "z1",
					chaKhoa: "zz",
					ten: "KR không có mục tiêu cha",
				},
			])) as [string, string];
			const ca = [
				[them, { ok: false, lyDo: "cha-da-bac", chiTiet: T.chaDaBac(tenC) }],
				[
					conLoai,
					{
						ok: false,
						lyDo: "cha-bi-loai",
						chiTiet: T.chaBiLoai("Mục tiêu tăng 300 % ngay"),
					},
				],
				[
					moCoi,
					{ ok: false, lyDo: "khong-co-cha", chiTiet: T.khongCoCha("zz") },
				],
			] as const;
			for (const [id, can] of ca) {
				expect(
					ok<SoanQuyetOutput>(await quyet(id, "nhan"), `nhan ${can.lyDo}`),
				).toEqual(can);
				expect(
					ok<SoanQuyetOutput>(
						await quyet(id, "sua", "Tên KR sửa lại cho rõ"),
						`sua ${can.lyDo}`,
					),
				).toEqual(can);
				expect(await hang(id), `giu ${can.lyDo}`).toMatchObject({
					trangThai: "cho",
					nguoiQuyet: null,
					giaTriCuoi: null,
				});
			}
			expect(await trangThaiDongNhap(chaLoai)).toBe("bi-loai");
			expect(
				ok<SoanQuyetOutput>(await quyet(moCoi, "bac"), "bac mo coi"),
			).toEqual({ ok: true });
			expect(ok<SoanQuyetOutput>(await quyet(them, "bac"), "bac c2")).toEqual({
				ok: true,
			});
		},
		CHO_DB,
	);

	test(
		"nhận B và hai KR của B; mọi dòng nháp của cuộc vẫn dich null",
		async () => {
			for (const id of [kho.mtB, kho.kB1, kho.kB2])
				expect(
					ok<SoanQuyetOutput>(await quyet(id, "nhan"), `nhan ${id}`),
				).toEqual({ ok: true });
			const dong = await db.okrDeXuat.findMany({
				where: { cuocSoanId: kho.cuoc.id },
				select: { dich: true },
			});
			expect(dong.length).toBe(15);
			expect(dong.every((d) => d.dich === null)).toBe(true);
		},
		CHO_DB,
	);

	test(
		"hai lần nộp: chỉ lần mới nhất và dòng đã quyết hiện, mỗi khoaDong một dòng; quyết dòng cũ bị từ chối; bác Mục tiêu không chạm dòng cũ",
		async () => {
			const cuoc = await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: QUAN_TRI });
			const lan1 = { inputHash: "nop-1" };
			const lan2 = { inputHash: "nop-2" };
			const mt = {
				loai: "muc-tieu-moi",
				khoa: "m",
				ten: "Kênh bán miền Nam ổn định",
			} as const;
			const kr1 = {
				loai: "kr-moi",
				khoa: "k1",
				chaKhoa: "m",
				ten: "Đại lý mới ký hợp đồng",
			} as const;
			const [m1, k1, k2] = (await gieoDongNhap(
				cuoc,
				[
					mt,
					kr1,
					{
						loai: "kr-moi",
						khoa: "k2",
						chaKhoa: "m",
						ten: "Doanh số đại lý cũ",
					},
				],
				"cho",
				lan1,
			)) as [string, string, string];
			expect(
				ok<SoanQuyetOutput>(
					await quyet(k1, "nhan", undefined, cQuanTri),
					"nhan k1",
				),
			).toEqual({ ok: true });
			tienDongHo();
			const [m2, k1Moi, k3] = (await gieoDongNhap(
				cuoc,
				[
					mt,
					kr1,
					{
						loai: "kr-moi",
						khoa: "k3",
						chaKhoa: "m",
						ten: "Đơn đặt lại trong 30 ngày",
					},
				],
				"cho",
				lan2,
			)) as [string, string, string];
			const ds = await danhSach(cuoc.id, "trpc", cQuanTri);
			expect(ds.dong.map((d) => d.id).sort()).toEqual([m2, k1, k3].sort());
			expect(new Set(ds.dong.map((d) => d.khoaDong)).size).toBe(3);
			expect(ds.cuoc).toMatchObject({ soDongTong: 3, soDongNhan: 1 });
			for (const cu of [m1, k2, k1Moi])
				expect((await hang(cu)).hienLuc, `cu ${cu}`).toBeNull();
			const dongCu = await quyet(k2, "nhan", undefined, cQuanTri);
			expect(dongCu.status, "quyet dong cu").toBe(409);
			expect(dongCu.loi).toBe(T.dongCu);
			expect((await quyet(k1Moi, "bac", undefined, cQuanTri)).status).toBe(409);
			expect(
				ok<SoanQuyetOutput>(
					await quyet(m2, "bac", undefined, cQuanTri),
					"bac m2",
				),
			).toEqual({ ok: true });
			for (const id of [k1, k3])
				expect(await trangThaiDongNhap(id), `keo ${id}`).toBe("bac");
			for (const id of [m1, k2, k1Moi])
				expect(await hang(id), `giu cu ${id}`).toMatchObject({
					trangThai: "cho",
					nguoiQuyet: null,
				});
			await xoaCuoc(cuoc.id);
		},
		CHO_DB,
	);

	test(
		"bác → kéo → nhận lại: KR nhận ở lần nộp 1, bị kéo bác theo Mục tiêu lần nộp 2, nhận lại bị từ chối cha-da-bac",
		async () => {
			const cuoc = await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: QUAN_TRI });
			const tenM = "Kênh đại lý miền Nam giữ nhịp";
			const mt = { loai: "muc-tieu-moi", khoa: "m", ten: tenM } as const;
			const [, k1] = (await gieoDongNhap(
				cuoc,
				[
					mt,
					{
						loai: "kr-moi",
						khoa: "k1",
						chaKhoa: "m",
						ten: "Đại lý giữ đơn hằng tháng",
					},
				],
				"cho",
				{ inputHash: "keo-1" },
			)) as [string, string];
			expect(
				ok<SoanQuyetOutput>(
					await quyet(k1, "nhan", undefined, cQuanTri),
					"nhan k1",
				),
			).toEqual({ ok: true });
			tienDongHo();
			const [m2] = (await gieoDongNhap(cuoc, [mt], "cho", {
				inputHash: "keo-2",
			})) as [string];
			expect(
				ok<SoanQuyetOutput>(
					await quyet(m2, "bac", undefined, cQuanTri),
					"bac m2",
				),
			).toEqual({ ok: true });
			expect(await trangThaiDongNhap(k1)).toBe("bac");
			const can: SoanQuyetOutput = {
				ok: false,
				lyDo: "cha-da-bac",
				chiTiet: T.chaDaBac(tenM),
			};
			expect(
				ok<SoanQuyetOutput>(
					await quyet(k1, "nhan", undefined, cQuanTri),
					"nhan lai k1",
				),
			).toEqual(can);
			expect(
				ok<SoanQuyetOutput>(
					await quyet(k1, "sua", "Đại lý giữ đơn đều mỗi tháng", cQuanTri),
					"sua lai k1",
				),
			).toEqual(can);
			expect(await trangThaiDongNhap(k1)).toBe("bac");
			await xoaCuoc(cuoc.id);
		},
		CHO_DB,
	);

	test(
		"cha bác cũ thắng cha chờ mới cùng tên: KR mới của lần nộp 2 bị từ chối cha-da-bac",
		async () => {
			const cuoc = await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: QUAN_TRI });
			const tenM = "Khách lẻ miền Nam quay lại";
			const mt = { loai: "muc-tieu-moi", khoa: "m", ten: tenM } as const;
			const [m1] = (await gieoDongNhap(cuoc, [mt], "cho", {
				inputHash: "thang-1",
			})) as [string];
			expect(
				ok<SoanQuyetOutput>(
					await quyet(m1, "bac", undefined, cQuanTri),
					"bac m1",
				),
			).toEqual({ ok: true });
			tienDongHo();
			const [m2, k3] = (await gieoDongNhap(
				cuoc,
				[
					mt,
					{
						loai: "kr-moi",
						khoa: "k3",
						chaKhoa: "m",
						ten: "Khách lẻ đặt lại lần hai",
					},
				],
				"cho",
				{ inputHash: "thang-2" },
			)) as [string, string];
			const ds = await danhSach(cuoc.id, "trpc", cQuanTri);
			expect(ds.dong.map((d) => d.id).sort()).toEqual([m1, k3].sort());
			const can: SoanQuyetOutput = {
				ok: false,
				lyDo: "cha-da-bac",
				chiTiet: T.chaDaBac(tenM),
			};
			expect(
				ok<SoanQuyetOutput>(
					await quyet(k3, "nhan", undefined, cQuanTri),
					"nhan k3",
				),
			).toEqual(can);
			expect(
				ok<SoanQuyetOutput>(
					await quyet(k3, "sua", "Khách lẻ đặt lại trong quý", cQuanTri),
					"sua k3",
				),
			).toEqual(can);
			expect(await hang(k3)).toMatchObject({
				trangThai: "cho",
				nguoiQuyet: null,
			});
			expect(await trangThaiDongNhap(m2)).toBe("cho");
			await xoaCuoc(cuoc.id);
		},
		CHO_DB,
	);

	test(
		"dòng bị loại, dòng không có và dòng của cuộc không còn dang: từ chối có tên, không ghi gì",
		async () => {
			const biLoai = await quyet(kho.loaiC, "nhan");
			expect(biLoai.status).toBe(404);
			expect(biLoai.loi).toBe(T.khongCoDong(kho.loaiC));
			expect((await quyet("khong-co", "nhan")).status).toBe(404);
			const cuoc = await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: QUAN_TRI });
			const [id] = (await gieoDongNhap(cuoc, [
				{ loai: "muc-tieu-moi", khoa: "m", ten: "Mục tiêu của cuộc đã bỏ" },
			])) as [string];
			await db.okrCuocSoan.update({
				where: { id: cuoc.id },
				data: { trangThai: "bo" },
			});
			for (const duong of DUONG) {
				const tra = await quyet(id, "nhan", undefined, cQuanTri, duong);
				expect(tra.status, `cuoc bo ${duong}`).toBe(409);
				expect(tra.loi).toBe(T.cuocKhongDang);
			}
			expect(await hang(id)).toMatchObject({
				trangThai: "cho",
				nguoiQuyet: null,
			});
			await xoaCuoc(cuoc.id);
		},
		CHO_DB,
	);

	test(
		"cuộc ẩn khi nấc đã bật: trưởng phòng không đọc, không quyết được (404 cùng câu với mã không có); quản trị đọc được",
		async () => {
			const cuoc = await gieoCuoc({
				donVi: DON_VI.kdBac,
				nguoiMo: QUAN_TRI,
				nac: "an",
			});
			const [id] = (await gieoDongNhap(cuoc, [
				{ loai: "muc-tieu-moi", khoa: "m", ten: "Mục tiêu cuộc ẩn" },
			])) as [string];
			for (const duong of DUONG) {
				const doc = await goiSoan(
					app,
					"soanDanhSach",
					duong,
					{ cuocSoanId: cuoc.id },
					cTruong,
				);
				expect(doc.status, `lo cuoc an ${duong}`).toBe(404);
				expect(doc.loi).toBe(T.khongCoCuoc);
				expect(doc.data).toBeUndefined();
				const khongCo = await goiSoan(
					app,
					"soanDanhSach",
					duong,
					{ cuocSoanId: "khong-co" },
					cTruong,
				);
				expect([khongCo.status, khongCo.loi]).toEqual([404, doc.loi]);
				const bac = await quyet(id, "bac", undefined, cTruong, duong);
				expect([bac.status, bac.loi]).toEqual([404, T.khongCoDong(id)]);
				expect(
					(await danhSach(cuoc.id, duong, cQuanTri)).dong.map((d) => d.id),
				).toEqual([id]);
			}
			expect(await trangThaiDongNhap(id)).toBe("cho");
			await xoaCuoc(cuoc.id);
		},
		CHO_DB,
	);

	test(
		"danh sách: đích Căn chỉnh là Mục tiêu giới hạn (hay KR của nó) thì tên rỗng như đích không còn với người không xem được; quản trị và người xem có tên thấy tên",
		async () => {
			const TEN_KIN = "Mở kênh bán cho khách hàng kín của bộ phận";
			const TEN_KR_KIN = "Số hợp đồng với khách hàng kín";
			const chu = nguoi("tran-quoc-bao");
			const kin = await db.okrObjective.create({
				data: {
					cycleId: CHU_KY_Q4,
					level: "bo-phan",
					divisionId: DON_VI.kinhDoanh.divisionId,
					ownerUserId: chu,
					kind: "cam-ket",
					status: "cong-bo",
					hienThi: "gioi-han",
					title: TEN_KIN,
					keyResults: {
						create: [
							{
								title: TEN_KR_KIN,
								kind: "tang-toi",
								ownerUserId: chu,
								startValue: 0,
								targetValue: 5,
								currentValue: 1,
								unit: "hợp đồng",
								position: 0,
							},
						],
					},
				},
				select: { id: true, keyResults: { select: { id: true } } },
			});
			const krKin = kin.keyResults[0]?.id ?? "";
			const cuoc = await gieoCuoc({ donVi: DON_VI.kdBac, nguoiMo: TRUONG });
			try {
				await gieoDongNhap(cuoc, [
					{ loai: "muc-tieu-moi", khoa: "k", ten: "Mục tiêu góp vào đích kín" },
				]);
				const [ccMt, ccKr, ccCong] = (await gieoDongNhap(cuoc, [
					{
						loai: "can-chinh-moi",
						khoa: "cc-mt",
						chaKhoa: "k",
						dichId: kin.id,
						loaiDich: "muc-tieu",
					},
					{
						loai: "can-chinh-moi",
						khoa: "cc-kr",
						chaKhoa: "k",
						dichId: krKin,
						loaiDich: "kr",
					},
					{
						loai: "can-chinh-moi",
						khoa: "cc-cong",
						chaKhoa: "k",
						dichId: mt("q4-kd"),
						loaiDich: "muc-tieu",
					},
				])) as [string, string, string];
				const tenCongKhai = (
					await db.okrObjective.findUniqueOrThrow({
						where: { id: mt("q4-kd") },
						select: { title: true },
					})
				).title;
				const tenCua = (ds: SoanDanhSachOutput) =>
					Object.fromEntries(
						ds.dong.flatMap((d) =>
							d.loai === "can-chinh-moi" ? [[d.id, [d.dichId, d.tenDich]]] : [],
						),
					);
				for (const duong of DUONG) {
					const truong = await danhSach(cuoc.id, duong);
					expect(tenCua(truong), `truong ${duong}`).toEqual({
						[ccMt]: [kin.id, ""],
						[ccKr]: [krKin, ""],
						[ccCong]: [mt("q4-kd"), tenCongKhai],
					});
					const chuTruong = JSON.stringify(truong);
					expect(chuTruong, "ten muc tieu kin lot").not.toContain(TEN_KIN);
					expect(chuTruong, "ten KR kin lot").not.toContain(TEN_KR_KIN);
					expect(
						tenCua(await danhSach(cuoc.id, duong, cQuanTri)),
						`quan tri ${duong}`,
					).toEqual({
						[ccMt]: [kin.id, TEN_KIN],
						[ccKr]: [krKin, TEN_KR_KIN],
						[ccCong]: [mt("q4-kd"), tenCongKhai],
					});
				}
				await db.okrNguoiXem.create({
					data: {
						objectiveId: kin.id,
						userId: nguoi(TRUONG),
						createdById: chu,
					},
				});
				expect(tenCua(await danhSach(cuoc.id)), "nguoi xem co ten").toEqual({
					[ccMt]: [kin.id, TEN_KIN],
					[ccKr]: [krKin, TEN_KR_KIN],
					[ccCong]: [mt("q4-kd"), tenCongKhai],
				});
			} finally {
				await xoaCuoc(cuoc.id);
				await db.okrObjective.delete({ where: { id: kin.id } });
			}
		},
		CHO_DB,
	);

	test(
		"nấc tắt: danh sách trả cuộc, không dòng, lý do don-vi-chua-bat; quyết trả ok false cùng lý do và không ghi",
		async () => {
			await ghiCauHinh(app, cQuanTri, NAC_SOAN.tat);
			try {
				for (const duong of DUONG) {
					const ds = await danhSach(kho.cuoc.id, duong);
					expect(ds).toMatchObject({
						cuoc: { id: kho.cuoc.id },
						dong: [],
						lyDo: "don-vi-chua-bat",
					});
					expect(
						ok<SoanQuyetOutput>(
							await quyet(kho.kB2, "bac", undefined, cTruong, duong),
							`tat ${duong}`,
						),
					).toEqual({ ok: false, lyDo: "don-vi-chua-bat", chiTiet: null });
				}
				expect(await trangThaiDongNhap(kho.kB2)).toBe("nhan");
			} finally {
				await ghiCauHinh(app, cQuanTri, NAC_SOAN.bat);
			}
		},
		CHO_DB,
	);
});
