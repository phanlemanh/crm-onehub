import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { type CuocSoan, docCuoc } from "@crm/db/okr-cuoc-soan";
import { docTrangChienLuocDangDung } from "@crm/db/tai-lieu-chien-luoc";
import { soGhiKhacNguoiGo, vetTaoKrSoan } from "@crm/validation/okr-cuoc-soan";
import { khoaDong } from "@crm/validation/okr-kiem-de-xuat";
import { dongSoanTuHang, TRO_LY_OKR_TRAN } from "@crm/validation/okr-tro-ly";
import { BadRequestException } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type {
	SoanDanhSachOutput,
	SoanDuaVaoOutput,
	SoanQuyetOutput,
} from "../src/okr/okr.contracts";
import { OkrService } from "../src/okr/okr.service";
import { OKR } from "../src/okr/okr-config";
import {
	BP,
	CHU_KY_Q4,
	DON_VI,
	type DonViSan,
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
	goi,
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

async function gieoBanNhap(
	nhan: string,
	donVi: DonViSan = DON_VI.kdBac,
	nguoiMo = TRUONG,
): Promise<Kho> {
	const cuoc = await gieoCuoc({ donVi, nguoiMo });
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

type SoKr = { deXuatId: string; khoiDiem: number; dich: number };

async function duaVao(
	cuocSoanId: string,
	kr: SoKr[],
	c = cTruong,
	duong: Duong = "trpc",
): Promise<TraLoi> {
	tienDongHo();
	return goiSoan(app, "soanDuaVao", duong, { cuocSoanId, kr } as never, c);
}

async function demBanGhi(cuocSoanId: string) {
	const vet = await db.okrTrail.findMany({
		where: { note: { startsWith: `${OKR.soan.ghiChuVet}${cuocSoanId}:` } },
		select: {
			objectiveId: true,
			keyResultId: true,
			action: true,
			note: true,
			after: true,
		},
	});
	const mucTieu = new Set(
		vet.filter((v) => v.action === "tao").map((v) => v.objectiveId),
	);
	const kr = new Set(
		vet.filter((v) => v.action === "tao-kr").map((v) => v.keyResultId),
	);
	const canChinh = vet.filter((v) => v.action === "gan-can-chinh").length;
	return { vet, mucTieu: [...mucTieu], kr: [...kr], canChinh };
}

async function soDichMayGhi(cuocSoanIds: string[]): Promise<string[]> {
	const vet = await db.okrTrail.findMany({
		where: {
			action: "tao-kr",
			OR: cuocSoanIds.map((id) => ({
				note: { startsWith: `${OKR.soan.ghiChuVet}${id}:` },
			})),
		},
		select: { keyResultId: true, after: true },
	});
	return vet.flatMap((v) => {
		const doc = vetTaoKrSoan.safeParse(v.after);
		return doc.success && !soGhiKhacNguoiGo(doc.data)
			? []
			: [v.keyResultId ?? ""];
	});
}

async function nhanHet(k: Kho, c = cTruong) {
	for (const id of [k.mtA, k.kA1, k.kA2, k.ccA, k.mtB, k.kB1, k.kB2])
		expect(
			ok<SoanQuyetOutput>(await quyet(id, "nhan", undefined, c), `nhan ${id}`)
				.ok,
		).toBe(true);
	expect(
		ok<SoanQuyetOutput>(await quyet(k.mtC, "bac", undefined, c), "bac C").ok,
	).toBe(true);
}

const SO = (k: Kho): SoKr[] => [
	{ deXuatId: k.kA1, khoiDiem: 12, dich: 30 },
	{ deXuatId: k.kA2, khoiDiem: 18, dich: 35 },
	{ deXuatId: k.kB1, khoiDiem: 0, dich: 8 },
];

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

describe("dua-vao", () => {
	test(
		"thiếu khởi điểm hay đích cho một KR đã nhận → thieu-so-kr; số cho dòng lạ hay cho KR mốc → 400 có tên; 0 bản ghi",
		async () => {
			const thieu = SO(kho).filter((s) => s.deXuatId !== kho.kB1);
			for (const duong of DUONG)
				expect(
					ok<SoanDuaVaoOutput>(
						await duaVao(kho.cuoc.id, thieu, cTruong, duong),
						`thieu ${duong}`,
					),
				).toEqual({
					ok: false,
					lyDo: "thieu-so-kr",
					chiTiet: T.thieuSoKr("Đối tác cũ đặt lại"),
				});
			const la = await duaVao(kho.cuoc.id, [
				...SO(kho),
				{ deXuatId: kho.kC1, khoiDiem: 0, dich: 3 },
			]);
			expect([la.status, la.loi], "so cho dong la").toEqual([
				400,
				T.soKrLa(kho.kC1),
			]);
			const moc = await duaVao(kho.cuoc.id, [
				...SO(kho),
				{ deXuatId: kho.kB2, khoiDiem: 0, dich: 1 },
			]);
			expect([moc.status, moc.loi], "so cho kr moc").toEqual([
				400,
				T.mocKhongNhanSo("Hoàn thành chương trình chăm sóc lại"),
			]);
			expect((await demBanGhi(kho.cuoc.id)).vet).toHaveLength(0);
			expect(
				(
					await db.okrCuocSoan.findUniqueOrThrow({
						where: { id: kho.cuoc.id },
					})
				).trangThai,
			).toBe("dang");
			expect(
				await db.okrDeXuat.count({
					where: { cuocSoanId: kho.cuoc.id, taoRaId: { not: null } },
				}),
			).toBe(0);
		},
		CHO_DB,
	);

	test(
		"số sai kiểu ở Mục tiêu thứ hai → 400 có tên, Mục tiêu thứ nhất đã ghi trong giao dịch cũng lùi: 0 bản ghi",
		async () => {
			const k = await gieoBanNhap("sai", DON_VI.kdNam, QUAN_TRI);
			await nhanHet(k, cQuanTri);
			const saiKieu = await duaVao(
				k.cuoc.id,
				[
					...SO(k).filter((s) => s.deXuatId !== k.kB1),
					{ deXuatId: k.kB1, khoiDiem: 8, dich: 2 },
				],
				cQuanTri,
			);
			expect([saiKieu.status, saiKieu.loi], "so sai kieu").toEqual([
				400,
				OKR.thongDiep.soTheoKieu["dich-phai-lon-hon-khoi-diem"],
			]);
			expect(
				(await demBanGhi(k.cuoc.id)).vet,
				"sai kieu lui ca giao dich",
			).toHaveLength(0);
			expect(
				await db.okrDeXuat.count({
					where: { cuocSoanId: k.cuoc.id, taoRaId: { not: null } },
				}),
			).toBe(0);
			expect(
				(await db.okrCuocSoan.findUniqueOrThrow({ where: { id: k.cuoc.id } }))
					.trangThai,
			).toBe("dang");
			await xoaCuoc(k.cuoc.id);
		},
		CHO_DB,
	);

	test(
		"đủ số → một giao dịch: Mục tiêu nhap, KR với số BẰNG lời gọi (mốc 0→1), Căn chỉnh chỉ từ dòng nhan/sua, vết có note và after hai số, taoRaId trỏ đúng, cuộc da-dua-vao; thước 0 số đích máy ghi có đối chứng dương",
		async () => {
			const kq = ok<SoanDuaVaoOutput>(
				await duaVao(kho.cuoc.id, SO(kho)),
				"dua vao",
			);
			if (!kq.ok) throw new Error(`dua vao tu choi: ${JSON.stringify(kq)}`);
			for (const id of [kho.mtC, kho.kC1, kho.ccC, kho.loaiC])
				expect((await hang(id)).taoRaId, "tao dong da bac").toBeNull();
			expect(
				await db.okrObjective.count({
					where: { title: { contains: "Mục tiêu sẽ bị bác" } },
				}),
				"tao dong da bac",
			).toBe(0);
			const idA = (await hang(kho.mtA)).taoRaId ?? "";
			const idB = (await hang(kho.mtB)).taoRaId ?? "";
			expect([...kq.mucTieuIds].sort()).toEqual([idA, idB].sort());
			expect(kq.soMucTieu).toBe(2);
			expect(kq.soKr).toBe(4);
			const cuoc = await db.okrCuocSoan.findUniqueOrThrow({
				where: { id: kho.cuoc.id },
			});
			expect(cuoc.trangThai).toBe("da-dua-vao");
			expect(cuoc.duaVaoLuc).not.toBeNull();
			const dem = await demBanGhi(kho.cuoc.id);
			expect(dem.mucTieu).toHaveLength(2);
			expect(dem.kr).toHaveLength(4);
			expect(dem.canChinh).toBe(1);
			for (const id of kq.mucTieuIds)
				expect(
					await db.okrObjective.findUniqueOrThrow({ where: { id } }),
				).toMatchObject({
					status: "nhap",
					hienThi: "cong-khai",
					cycleId: kho.cuoc.cycleId,
					level: "phong-ban",
					departmentId: DON_VI.kdBac.departmentId,
					ownerUserId: nguoi(TRUONG),
				});
			const mtA = await db.okrObjective.findUniqueOrThrow({
				where: { id: idA },
				include: {
					keyResults: { orderBy: { position: "asc" } },
					alignments: true,
				},
			});
			expect(mtA.title).toBe("Bán lẻ miền Bắc ký đều hằng tháng");
			expect(mtA.keyResults).toHaveLength(2);
			for (const s of SO(kho)) {
				const h = await hang(s.deXuatId);
				const krDb = await db.okrKeyResult.findUniqueOrThrow({
					where: { id: h.taoRaId ?? "" },
				});
				expect(
					[krDb.startValue.toNumber(), krDb.targetValue.toNumber()],
					"dich khong tu nguoi",
				).toEqual([s.khoiDiem, s.dich]);
				expect(krDb.currentValue.toNumber()).toBe(s.khoiDiem);
				const vet = dem.vet.find(
					(v) => v.note === `${OKR.soan.ghiChuVet}${kho.cuoc.id}:${s.deXuatId}`,
				);
				expect(vet?.keyResultId).toBe(krDb.id);
				expect(vet?.after, "vet mang so nguoi go").toMatchObject({
					startValue: s.khoiDiem,
					targetValue: s.dich,
					soNguoiGoKhoiDiem: s.khoiDiem,
					soNguoiGoDich: s.dich,
				});
			}
			const moc = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: (await hang(kho.kB2)).taoRaId ?? "" },
			});
			expect([
				moc.kind,
				moc.startValue.toNumber(),
				moc.targetValue.toNumber(),
			]).toEqual(["moc", OKR.mau.moc.startValue, OKR.mau.moc.targetValue]);
			expect(
				dem.vet.find((v) => v.keyResultId === moc.id)?.after,
				"moc khong co so nguoi go",
			).toMatchObject({
				kind: "moc",
				soNguoiGoKhoiDiem: null,
				soNguoiGoDich: null,
			});
			const a1 = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: (await hang(kho.kA1)).taoRaId ?? "" },
			});
			expect([a1.title, a1.unit]).toEqual([
				"Hợp đồng bán lẻ ký mới với chuỗi trên 10 cửa hàng",
				"hợp đồng",
			]);
			expect(mtA.alignments).toHaveLength(1);
			expect(mtA.alignments[0]?.targetObjectiveId).toBe(mt("q4-kd"));
			expect((await hang(kho.ccA)).taoRaId).toBe(mtA.alignments[0]?.id ?? "");
			const dong = await db.okrDeXuat.findMany({
				where: { cuocSoanId: kho.cuoc.id },
				select: { dich: true },
			});
			expect(dong.every((d) => d.dich === null)).toBe(true);
			expect(await soDichMayGhi([kho.cuoc.id]), "so dich may ghi").toEqual([]);
			const gia = await db.okrKeyResult.create({
				data: {
					objectiveId: idA,
					title: "KR đối chứng thước",
					kind: "tang-toi",
					ownerUserId: nguoi(TRUONG),
					startValue: 0,
					targetValue: 50,
					currentValue: 0,
					unit: "lần",
					position: 9,
				},
			});
			await db.okrTrail.create({
				data: {
					actorUserId: nguoi(TRUONG),
					action: "tao-kr",
					objectiveId: idA,
					keyResultId: gia.id,
					after: {
						title: gia.title,
						kind: "tang-toi",
						startValue: 0,
						targetValue: 99,
						soNguoiGoKhoiDiem: 0,
						soNguoiGoDich: 50,
					},
					note: `${OKR.soan.ghiChuVet}${kho.cuoc.id}:doi-chung`,
				},
			});
			expect(await soDichMayGhi([kho.cuoc.id]), "doi chung duong").toEqual([
				gia.id,
			]);
			await db.okrTrail.deleteMany({ where: { keyResultId: gia.id } });
			await db.okrKeyResult.delete({ where: { id: gia.id } });
		},
		CHO_DB,
	);

	test(
		"đối chứng đường công bố: publishObjective trên Mục tiêu vừa tạo thành công",
		async () => {
			const id = (await hang(kho.mtA)).taoRaId ?? "";
			ok(
				await goi(app, "okr.publishObjective", "mutation", { id }, cTruong),
				"cong bo",
			);
			expect(
				(await db.okrObjective.findUniqueOrThrow({ where: { id } })).status,
			).toBe("cong-bo");
		},
		CHO_DB,
	);

	test(
		"hai lời gọi đồng thời → đúng một thành công, lần kia từ chối có tên; bấm lần ba cũng vậy; bản ghi đếm bằng một lần",
		async () => {
			const cuoc = await gieoCuoc({ donVi: DON_VI.kdBac, nguoiMo: TRUONG });
			const [mtId] = await gieoDongNhap(
				cuoc,
				[{ loai: "muc-tieu-moi", khoa: "d", ten: "Mục tiêu chạy đua" }],
				"nhan",
			);
			const [krId] = await gieoDongNhap(
				cuoc,
				[
					{
						loai: "kr-moi",
						khoa: "d1",
						chaKhoa: "d",
						ten: "KR chạy đua",
						kieu: "tang-toi",
					},
				],
				"nhan",
			);
			const so = [{ deXuatId: krId ?? "", khoiDiem: 0, dich: 5 }];
			const hai = await Promise.all([
				duaVao(cuoc.id, so, cTruong, "trpc"),
				duaVao(cuoc.id, so, cTruong, "rest"),
			]);
			const kq = hai.map((t) => ok<SoanDuaVaoOutput>(t, "dong thoi"));
			const tuChoi: SoanDuaVaoOutput = {
				ok: false,
				lyDo: "cuoc-khong-dang",
				chiTiet: T.duaVaoHaiLan,
			};
			expect(
				kq.filter((k) => k.ok),
				"dua vao hai lan",
			).toHaveLength(1);
			expect(kq.filter((k) => !k.ok)).toEqual([tuChoi]);
			expect(ok<SoanDuaVaoOutput>(await duaVao(cuoc.id, so), "lan ba")).toEqual(
				tuChoi,
			);
			const dem = await demBanGhi(cuoc.id);
			expect(dem.mucTieu).toHaveLength(1);
			expect(dem.kr).toHaveLength(1);
			expect((await hang(mtId ?? "")).taoRaId).toBe(dem.mucTieu[0] ?? "");
		},
		CHO_DB,
	);

	test(
		"Mục tiêu cha chưa nhận, đã bác, bị loại hay không có → từ chối có tên cho cả đưa vào, 0 bản ghi",
		async () => {
			const cuoc = await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: QUAN_TRI });
			try {
				const [cho] = (await gieoDongNhap(cuoc, [
					{ loai: "muc-tieu-moi", khoa: "cho", ten: "Mục tiêu còn chờ" },
				])) as [string];
				await gieoDongNhap(
					cuoc,
					[{ loai: "muc-tieu-moi", khoa: "bac", ten: "Mục tiêu đã bác" }],
					"bac",
				);
				await gieoDongNhap(
					cuoc,
					[{ loai: "muc-tieu-moi", khoa: "loai", ten: "Mục tiêu bị loại" }],
					"bi-loai",
					{ maLoai: "so-moi" },
				);
				await gieoDongNhap(
					cuoc,
					[{ loai: "muc-tieu-moi", khoa: "m", ten: "Mục tiêu đã nhận" }],
					"nhan",
				);
				const [kM] = (await gieoDongNhap(
					cuoc,
					[{ loai: "kr-moi", khoa: "km", chaKhoa: "m", ten: "KR hợp lệ" }],
					"nhan",
				)) as [string];
				const conCua = async (chaKhoa: string, ten: string) => {
					const [id] = (await gieoDongNhap(
						cuoc,
						[{ loai: "kr-moi", khoa: `k-${chaKhoa}`, chaKhoa, ten }],
						"nhan",
					)) as [string];
					return id;
				};
				const ca = [
					["cho", "cha-chua-nhan", T.chaChuaNhan("Mục tiêu còn chờ")],
					["bac", "cha-da-bac", T.chaDaBac("Mục tiêu đã bác")],
					["loai", "cha-bi-loai", T.chaBiLoai("Mục tiêu bị loại")],
					["zz", "khong-co-cha", T.khongCoCha("zz")],
				] as const;
				for (const [chaKhoa, lyDo, chiTiet] of ca) {
					const con = await conCua(chaKhoa, `KR dưới ${chaKhoa}`);
					expect(
						ok<SoanDuaVaoOutput>(
							await duaVao(
								cuoc.id,
								[
									{ deXuatId: kM, khoiDiem: 0, dich: 4 },
									{ deXuatId: con, khoiDiem: 0, dich: 4 },
								],
								cQuanTri,
							),
							`cha ${lyDo}`,
						),
					).toEqual({ ok: false, lyDo, chiTiet });
					await db.okrDeXuat.update({
						where: { id: con },
						data: { trangThai: "bac" },
					});
				}
				await gieoDongNhap(
					cuoc,
					[
						{
							loai: "can-chinh-moi",
							khoa: "cc-cho",
							chaKhoa: "cho",
							dichId: mt("q4-kd"),
							loaiDich: "muc-tieu",
						},
					],
					"nhan",
				);
				expect(
					ok<SoanDuaVaoOutput>(
						await duaVao(
							cuoc.id,
							[{ deXuatId: kM, khoiDiem: 0, dich: 4 }],
							cQuanTri,
						),
						"can chinh cha chua nhan",
					),
				).toEqual({
					ok: false,
					lyDo: "cha-chua-nhan",
					chiTiet: T.chaChuaNhan("Mục tiêu còn chờ"),
				});
				expect((await demBanGhi(cuoc.id)).vet).toHaveLength(0);
				expect(await trangThaiDongNhap(cho)).toBe("cho");
				expect(
					(await db.okrCuocSoan.findUniqueOrThrow({ where: { id: cuoc.id } }))
						.trangThai,
				).toBe("dang");
			} finally {
				await xoaCuoc(cuoc.id);
			}
		},
		CHO_DB,
	);

	test(
		"chu kỳ đổi sang dang-chay trước khi đưa vào → từ chối có tên, 0 bản ghi, bảng giữ nguyên",
		async () => {
			const k = await gieoBanNhap("pha");
			await nhanHet(k);
			await datPhaQuy4("dang-chay");
			try {
				expect(
					ok<SoanDuaVaoOutput>(await duaVao(k.cuoc.id, SO(k)), "pha"),
				).toEqual({
					ok: false,
					lyDo: "chu-ky-khong-lap-ke-hoach",
					chiTiet: T.kyKhongLapKeHoach,
				});
			} finally {
				await datPhaQuy4("lap-ke-hoach");
			}
			expect((await demBanGhi(k.cuoc.id)).vet).toHaveLength(0);
			expect(
				(await db.okrCuocSoan.findUniqueOrThrow({ where: { id: k.cuoc.id } }))
					.trangThai,
			).toBe("dang");
			expect(await trangThaiDongNhap(k.mtA)).toBe("nhan");
			await db.okrCuocSoan.update({
				where: { id: k.cuoc.id },
				data: { trangThai: "bo" },
			});
			expect(
				ok<SoanDuaVaoOutput>(await duaVao(k.cuoc.id, SO(k)), "cuoc bo"),
			).toEqual({
				ok: false,
				lyDo: "cuoc-khong-dang",
				chiTiet: T.cuocKhongDang,
			});
		},
		CHO_DB,
	);

	test(
		"chu kỳ bị ẩn trước khi đưa vào → 400 câu chu kỳ đã ẩn, 0 bản ghi, bảng giữ nguyên; hiện lại thì qua cửa chu kỳ",
		async () => {
			const k = await gieoBanNhap("an");
			await nhanHet(k);
			await db.okrCycle.update({
				where: { id: k.cuoc.cycleId },
				data: { anLuc: new Date() },
			});
			try {
				const an = await duaVao(k.cuoc.id, SO(k));
				expect([an.status, an.loi]).toEqual([400, OKR.thongDiep.chuKy.kyDaAn]);
				expect((await demBanGhi(k.cuoc.id)).vet).toHaveLength(0);
				expect(
					(
						await db.okrCuocSoan.findUniqueOrThrow({
							where: { id: k.cuoc.id },
						})
					).trangThai,
				).toBe("dang");
				expect(await trangThaiDongNhap(k.mtA)).toBe("nhan");
			} finally {
				await db.okrCycle.update({
					where: { id: k.cuoc.cycleId },
					data: { anLuc: null },
				});
			}
			const lai = ok<SoanDuaVaoOutput>(
				await duaVao(k.cuoc.id, SO(k)),
				"hien lai",
			);
			expect(
				lai.ok ? "qua" : lai.lyDo,
				"hien lai van bi chan o cua chu ky",
			).not.toBe("chu-ky-khong-lap-ke-hoach");
		},
		CHO_DB,
	);

	test(
		"vượt objectiveCap của đơn vị ở cả hai capMode, và ở cuộc phòng ban mang divisionId thừa → từ chối có tên, 0 bản ghi",
		async () => {
			const demPhong = () =>
				db.okrObjective.count({
					where: {
						cycleId: kho.cuoc.cycleId,
						departmentId: DON_VI.kdBac.departmentId,
						status: { not: "da-bo" },
					},
				});
			const daCo = await demPhong();
			expect(daCo).toBe(5);
			const ct = await goi(app, "okr.program", "query", undefined, cQuanTri);
			expect(ok<{ capMode: string }>(ct, "chuong trinh").capMode).toBe(
				"canh-bao",
			);
			const vuot: SoanDuaVaoOutput = {
				ok: false,
				lyDo: "vuot-tran-muc-tieu",
				chiTiet: T.vuotTranMucTieu(5),
			};
			const k = await gieoBanNhap("tran");
			await nhanHet(k);
			expect(
				ok<SoanDuaVaoOutput>(await duaVao(k.cuoc.id, SO(k)), "tran"),
			).toEqual(vuot);
			await ghiCauHinh(app, cQuanTri, { capMode: "chan" });
			try {
				expect(
					ok<SoanDuaVaoOutput>(await duaVao(k.cuoc.id, SO(k)), "tran chan"),
				).toEqual(vuot);
			} finally {
				await ghiCauHinh(app, cQuanTri, { capMode: "canh-bao" });
			}
			expect((await demBanGhi(k.cuoc.id)).vet).toHaveLength(0);
			await xoaCuoc(k.cuoc.id);
			const lech = await gieoBanNhap("lech", {
				...DON_VI.kdBac,
				divisionId: BP("kinh-doanh"),
			});
			await nhanHet(lech);
			expect(
				ok<SoanDuaVaoOutput>(
					await duaVao(lech.cuoc.id, SO(lech)),
					"tran cuoc mang divisionId",
				),
			).toEqual(vuot);
			expect((await demBanGhi(lech.cuoc.id)).vet).toHaveLength(0);
			expect(await demPhong()).toBe(daCo);
			await xoaCuoc(lech.cuoc.id);
		},
		CHO_DB,
	);

	test(
		"Căn chỉnh tới đích kín hoặc chưa công bố → 400 có tên, cả giao dịch lùi: 0 bản ghi",
		async () => {
			const taoDich = (
				tieuDe: string,
				trangThai: "cong-bo" | "nhap",
				hienThi: "cong-khai" | "gioi-han",
			) =>
				db.okrObjective.create({
					data: {
						cycleId: CHU_KY_Q4,
						level: "bo-phan",
						divisionId: DON_VI.kinhDoanh.divisionId,
						ownerUserId: nguoi("tran-quoc-bao"),
						kind: "cam-ket",
						status: trangThai,
						hienThi,
						title: tieuDe,
					},
					select: { id: true },
				});
			const kin = await taoDich("Đích kín của bộ phận", "cong-bo", "gioi-han");
			const nhap = await taoDich(
				"Đích còn nháp của bộ phận",
				"nhap",
				"cong-khai",
			);
			const cuoc = await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: QUAN_TRI });
			try {
				await gieoDongNhap(
					cuoc,
					[
						{
							loai: "muc-tieu-moi",
							khoa: "m",
							ten: "Mục tiêu góp vào đích lạ",
						},
					],
					"nhan",
				);
				const [kr] = (await gieoDongNhap(
					cuoc,
					[
						{
							loai: "kr-moi",
							khoa: "k",
							chaKhoa: "m",
							ten: "KR góp vào đích lạ",
						},
					],
					"nhan",
				)) as [string];
				const ca = [
					[kin.id, OKR.thongDiep.canChinh.gioiHanKhongCanChinh],
					[nhap.id, OKR.thongDiep.canChinh.chuaCongBo],
				] as const;
				for (const [dich, loi] of ca) {
					const [cc] = (await gieoDongNhap(
						cuoc,
						[
							{
								loai: "can-chinh-moi",
								khoa: `cc-${dich}`,
								chaKhoa: "m",
								dichId: dich,
								loaiDich: "muc-tieu",
							},
						],
						"nhan",
					)) as [string];
					const tra = await duaVao(
						cuoc.id,
						[{ deXuatId: kr, khoiDiem: 0, dich: 4 }],
						cQuanTri,
					);
					expect([tra.status, tra.loi], `can chinh ${dich}`).toEqual([
						400,
						loi,
					]);
					expect(
						(await demBanGhi(cuoc.id)).vet,
						"can chinh lui ca giao dich",
					).toHaveLength(0);
					expect(
						await db.okrDeXuat.count({
							where: { cuocSoanId: cuoc.id, taoRaId: { not: null } },
						}),
					).toBe(0);
					await db.okrDeXuat.update({
						where: { id: cc },
						data: { trangThai: "bac" },
					});
				}
				expect(
					(await db.okrCuocSoan.findUniqueOrThrow({ where: { id: cuoc.id } }))
						.trangThai,
				).toBe("dang");
			} finally {
				await xoaCuoc(cuoc.id);
				await db.okrObjective.deleteMany({
					where: { id: { in: [kin.id, nhap.id] } },
				});
			}
		},
		CHO_DB,
	);

	test(
		"số ngoài miền (1e12 + 1) → 400 ở biên, 0 bản ghi; KR ghi với objectiveId khác mục tiêu của giao dịch → 400 có tên",
		async () => {
			const k = await gieoBanNhap("mien");
			await nhanHet(k);
			const ngoai = await duaVao(k.cuoc.id, [
				...SO(k).filter((s) => s.deXuatId !== k.kB1),
				{ deXuatId: k.kB1, khoiDiem: 0, dich: 1e12 + 1 },
			]);
			expect(ngoai.status, "so ngoai mien").toBe(400);
			expect((await demBanGhi(k.cuoc.id)).vet).toHaveLength(0);
			await xoaCuoc(k.cuoc.id);
			const okr = app.get(OkrService);
			const vao = {
				objectiveId: mt("q4-kd-bac-1"),
				title: "KR ghi lệch mục tiêu",
				kind: "tang-toi",
				ownerUserId: nguoi(TRUONG),
				startValue: 0,
				targetValue: 5,
				currentValue: 0,
				unit: "lần",
				dueOn: null,
				weight: 1,
			} as const;
			const ghi = db.$transaction((tx) =>
				okr.createKeyResult(nguoi(TRUONG), vao, {
					tx,
					mt: { id: mt("q4-kd-bac-2"), cycleId: CHU_KY_Q4 },
					note: "soan-okr:lech",
				}),
			);
			await expect(ghi, "kr lech giao dich").rejects.toBeInstanceOf(
				BadRequestException,
			);
			await expect(ghi).rejects.toThrow(
				OKR.thongDiep.krKhacGiaoDich(mt("q4-kd-bac-1"), mt("q4-kd-bac-2")),
			);
			expect(await db.okrKeyResult.count({ where: { title: vao.title } })).toBe(
				0,
			);
		},
		CHO_DB,
	);

	test(
		"nấc tắt sau khi mở cuộc → don-vi-chua-bat, 0 bản ghi; cuộc không có → 404 cùng câu",
		async () => {
			const k = await gieoBanNhap("tat");
			await nhanHet(k);
			await ghiCauHinh(app, cQuanTri, NAC_SOAN.tat);
			try {
				expect(
					ok<SoanDuaVaoOutput>(await duaVao(k.cuoc.id, SO(k)), "tat"),
				).toEqual({ ok: false, lyDo: "don-vi-chua-bat", chiTiet: null });
			} finally {
				await ghiCauHinh(app, cQuanTri, NAC_SOAN.bat);
			}
			expect((await demBanGhi(k.cuoc.id)).vet).toHaveLength(0);
			const khongCo = await duaVao("khong-co", []);
			expect([khongCo.status, khongCo.loi]).toEqual([404, T.khongCoCuoc]);
			await xoaCuoc(k.cuoc.id);
		},
		CHO_DB,
	);
});

describe("mot-khoa-hai-dong", () => {
	test(
		"một khoá Mục tiêu hai dòng (Mục tiêu đã nhận rồi đổi tên qua chat): bảng giữ dòng đã quyết trước, đưa vào tạo đúng một Mục tiêu mang KR của nó; bác dòng đổi tên không kéo KR đã nhận",
		async () => {
			const tenGoc = "Khách miền Nam đặt lại đều mỗi quý";
			const gieo = async (nhanDoiTen: boolean) => {
				const cuoc = await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: QUAN_TRI });
				const cu = { inputHash: `cu:${cuoc.id}` };
				const [mtGoc] = await gieoDongNhap(
					cuoc,
					[{ loai: "muc-tieu-moi", khoa: "a", ten: tenGoc }],
					"nhan",
					cu,
				);
				const kr = await gieoDongNhap(
					cuoc,
					[
						{
							loai: "kr-moi",
							khoa: "a1",
							chaKhoa: "a",
							ten: "Khách miền Nam đặt lại",
							kieu: "tang-toi",
							donVi: "khách",
						},
						{
							loai: "kr-moi",
							khoa: "a2",
							chaKhoa: "a",
							ten: "Tỷ lệ khách miền Nam quay lại",
							kieu: "phan-tram",
							donVi: "%",
						},
					],
					"nhan",
					cu,
				);
				const [mtDoi] = await gieoDongNhap(
					cuoc,
					[{ loai: "muc-tieu-moi", khoa: "a", ten: "Khách miền Nam gắn bó" }],
					nhanDoiTen ? "nhan" : "cho",
					{ inputHash: `moi:${cuoc.id}` },
				);
				return { cuoc, mtGoc, mtDoi, kr };
			};
			const hai = await gieo(true);
			const bang = await danhSach(hai.cuoc.id, "trpc", cQuanTri);
			const kq = ok<SoanDuaVaoOutput>(
				await duaVao(
					hai.cuoc.id,
					hai.kr.map((deXuatId) => ({ deXuatId, khoiDiem: 2, dich: 9 })),
					cQuanTri,
				),
				"dua vao mot khoa hai dong",
			);
			const taoRa = kq.ok
				? await db.okrObjective.findMany({
						where: { id: { in: kq.mucTieuIds } },
						select: { title: true, _count: { select: { keyResults: true } } },
					})
				: [];
			await db.okrObjective.deleteMany({
				where: { id: { in: kq.ok ? kq.mucTieuIds : [] } },
			});
			const mot = await gieo(false);
			const bac = await quyet(mot.mtDoi ?? "", "bac", undefined, cQuanTri);
			expect({
				bang: bang.dong
					.filter((d) => d.loai === "muc-tieu-moi" && d.khoa === "a")
					.map((d) => [d.id, d.trangThai]),
				duaVao: kq.ok ? kq.soMucTieu : kq.lyDo,
				taoRa: taoRa.map((m) => [m.title, m._count.keyResults]),
				bac: [bac.status, bac.loi],
				krSauBac: await Promise.all(mot.kr.map(trangThaiDongNhap)),
			}).toEqual({
				bang: [[hai.mtGoc ?? "", "nhan"]],
				duaVao: 1,
				taoRa: [[tenGoc, 2]],
				bac: [409, T.dongCu],
				krSauBac: ["nhan", "nhan"],
			});
			await xoaCuoc(hai.cuoc.id);
			await xoaCuoc(mot.cuoc.id);
		},
		CHO_DB,
	);
});

describe("lan-nop-moi-nhat", () => {
	test(
		"lần nộp mới nhất đọc từ cuộc: nộp lại «bỏ mục 2» khi mục còn lại đã nhận (0 hàng mới) → Mục tiêu 2 và KR của nó ra khỏi bảng; cuộc chưa ghi lần nộp thì lùi về hàng mới nhất",
		async () => {
			const gieo = async () => {
				const cuoc = await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: QUAN_TRI });
				const lan1 = { inputHash: `lan-1:${cuoc.id}` };
				await gieoDongNhap(
					cuoc,
					[
						{ loai: "muc-tieu-moi", khoa: "m1", ten: "Giữ khách miền Nam" },
						{
							loai: "kr-moi",
							khoa: "k11",
							chaKhoa: "m1",
							ten: "Khách miền Nam đặt lại",
						},
					],
					"nhan",
					lan1,
				);
				await gieoDongNhap(
					cuoc,
					[
						{ loai: "muc-tieu-moi", khoa: "m2", ten: "Mở tuyến miền Tây" },
						{
							loai: "kr-moi",
							khoa: "k21",
							chaKhoa: "m2",
							ten: "Chuyến miền Tây đúng hẹn",
						},
					],
					"cho",
					lan1,
				);
				return cuoc;
			};
			const khoaTrenBang = async (cuocSoanId: string) =>
				(await danhSach(cuocSoanId, "trpc", cQuanTri)).dong
					.map((d) => d.khoa)
					.sort();
			const boMuc2 = await gieo();
			await db.okrCuocSoan.update({
				where: { id: boMuc2.id },
				data: { lanNopMoiNhat: `lan-2:${boMuc2.id}` },
			});
			const chuaGhi = await gieo();
			expect({
				boMuc2: await khoaTrenBang(boMuc2.id),
				chuaGhi: await khoaTrenBang(chuaGhi.id),
				cuoc: (await docCuoc(db, boMuc2.id))?.lanNopMoiNhat,
			}).toEqual({
				boMuc2: ["k11", "m1"],
				chuaGhi: ["k11", "k21", "m1", "m2"],
				cuoc: `lan-2:${boMuc2.id}`,
			});
			await xoaCuoc(boMuc2.id);
			await xoaCuoc(chuaGhi.id);
		},
		CHO_DB,
	);
});
