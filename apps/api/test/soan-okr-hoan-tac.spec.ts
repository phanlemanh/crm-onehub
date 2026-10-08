import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { CuocSoan } from "@crm/db/okr-cuoc-soan";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type {
	SoanDanhSachOutput,
	SoanQuyetOutput,
} from "../src/okr/okr.contracts";
import { OKR } from "../src/okr/okr-config";
import {
	DON_VI,
	type Duong,
	datPhaQuy4,
	donSoan,
	gieoCuoc,
	gieoDongNhap,
	goiSoan,
	NAC_SOAN,
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
	type TraLoi,
	tienDongHo,
} from "./tro-ly-okr-san";

const TRUONG = "nguyen-thi-lan";
const QUAN_TRI = "le-hai-dang";
const DUONG = ["trpc", "rest"] as const satisfies readonly Duong[];
const T = OKR.thongDiep.soan;

let app: NestExpressApplication;
let cTruong = "";

type Cach = "nhan" | "sua" | "bac" | "hoan";

type Kho = {
	cuoc: CuocSoan;
	mt: string;
	kr1: string;
	kr2: string;
	kr3: string;
	moc: string;
	cc: string;
	mtKhac: string;
	krKhac: string;
};

let dem = 0;

async function gieo(): Promise<Kho> {
	dem += 1;
	const cuoc = await gieoCuoc({ donVi: DON_VI.kdBac, nguoiMo: TRUONG });
	const [mtId, mtKhac] = (await gieoDongNhap(cuoc, [
		{ loai: "muc-tieu-moi", khoa: "a", ten: `Đối tác lớn gắn bó ${dem}` },
		{ loai: "muc-tieu-moi", khoa: "b", ten: `Mở tuyến mới ${dem}` },
	])) as [string, string];
	const [kr1, kr2, kr3, moc, krKhac] = (await gieoDongNhap(cuoc, [
		{ loai: "kr-moi", khoa: "a1", chaKhoa: "a", ten: "Doanh số đối tác lớn" },
		{ loai: "kr-moi", khoa: "a2", chaKhoa: "a", ten: "Số đại lý gắn bó" },
		{ loai: "kr-moi", khoa: "a3", chaKhoa: "a", ten: "Đơn đặt lại mỗi quý" },
		{
			loai: "kr-moi",
			khoa: "a4",
			chaKhoa: "a",
			ten: "Ký hợp đồng thử vận chuyển",
			kieu: "moc",
			donVi: "mốc",
		},
		{ loai: "kr-moi", khoa: "b1", chaKhoa: "b", ten: "Chuyến chạy thử" },
	])) as [string, string, string, string, string];
	const [cc] = (await gieoDongNhap(cuoc, [
		{
			loai: "can-chinh-moi",
			khoa: "cc-a",
			chaKhoa: "a",
			dichId: mt("q4-kd"),
			loaiDich: "muc-tieu",
		},
	])) as [string];
	return { cuoc, mt: mtId, kr1, kr2, kr3, moc, cc, mtKhac, krKhac };
}

async function quyet(
	vao: { deXuatId: string; quyet: Cach; giaTriCuoi?: string; kem?: string[] },
	duong: Duong = "trpc",
): Promise<TraLoi> {
	tienDongHo();
	return goiSoan(app, "soanQuyet", duong, vao, cTruong);
}

async function quyetOk(
	vao: Parameters<typeof quyet>[0],
	duong: Duong = "trpc",
): Promise<SoanQuyetOutput> {
	return ok<SoanQuyetOutput>(await quyet(vao, duong), `${vao.quyet} ${duong}`);
}

type Anh = {
	id: string;
	trangThai: string;
	giaTriCuoi: string | null;
	nguoiQuyet: string | null;
	quyetLuc: Date | null;
};

async function anh(cuocSoanId: string): Promise<Anh[]> {
	return db.okrDeXuat.findMany({
		where: { cuocSoanId },
		orderBy: { id: "asc" },
		select: {
			id: true,
			trangThai: true,
			giaTriCuoi: true,
			nguoiQuyet: true,
			quyetLuc: true,
		},
	});
}

async function hang(id: string): Promise<Anh> {
	return db.okrDeXuat.findUniqueOrThrow({
		where: { id },
		select: {
			id: true,
			trangThai: true,
			giaTriCuoi: true,
			nguoiQuyet: true,
			quyetLuc: true,
		},
	});
}

function viPham(h: Anh): string[] {
	return [
		h.trangThai === "cho" ? null : `trangThai ${h.trangThai} sau hoan`,
		h.giaTriCuoi === null ? null : "giaTriCuoi con sau hoan",
		h.nguoiQuyet === null ? null : "nguoiQuyet con sau hoan",
		h.quyetLuc === null ? null : "quyetLuc con sau hoan",
	].filter((x): x is string => x !== null);
}

function laCho(h: Anh, nhan: string): void {
	expect(`${nhan}: ${viPham(h).join(", ")}`).toBe(`${nhan}: `);
}

async function conQuyet(ids: readonly string[]): Promise<void> {
	const con = (await Promise.all(ids.map(hang))).filter(
		(h) => viPham(h).length > 0,
	);
	expect(
		`kr con quyet sau hoan muc tieu: ${con.map((h) => h.id).join(", ")}`,
	).toBe("kr con quyet sau hoan muc tieu: ");
}

function khongDoi(truoc: readonly Anh[], sau: readonly Anh[]): void {
	const cu = new Map(truoc.map((h) => [h.id, h.trangThai]));
	const doi = sau
		.filter((h) => cu.get(h.id) !== h.trangThai)
		.map((h) => `${h.id} ${cu.get(h.id)}→${h.trangThai}`);
	expect(`ghi nua chung: ${doi.join(", ")}`).toBe("ghi nua chung: ");
	expect(sau).toEqual(truoc);
}

beforeAll(async () => {
	await batDauMau();
	await donSoan();
	await datPhaQuy4("lap-ke-hoach");
	app = await dungUngDung();
	cTruong = await phienMau(TRUONG);
	await ghiCauHinh(app, await phienMau(QUAN_TRI), NAC_SOAN.bat);
}, CHO_DB);

afterAll(async () => {
	await donSoan();
	await ketThucMau(app);
}, CHO_DB);

const MA_TRAN = [
	{ loai: "muc-tieu", cach: "nhan" },
	{ loai: "muc-tieu", cach: "sua" },
	{ loai: "muc-tieu", cach: "bac" },
	{ loai: "kr", cach: "nhan" },
	{ loai: "kr", cach: "sua" },
	{ loai: "kr", cach: "bac" },
	{ loai: "can-chinh", cach: "nhan" },
	{ loai: "can-chinh", cach: "bac" },
] as const;

describe("k2-api-hoan", () => {
	test(
		"ma trận {Mục tiêu, KR, căn chỉnh} × {nhan, sua, bac} → hoan đưa đúng dòng về chờ, xoá giaTriCuoi, nguoiQuyet, quyetLuc — qua tRPC và REST",
		async () => {
			let o = 0;
			for (const duong of DUONG) {
				for (const { loai, cach } of MA_TRAN) {
					const k = await gieo();
					if (loai !== "muc-tieu")
						await quyetOk({ deXuatId: k.mt, quyet: "nhan" }, duong);
					const id = loai === "muc-tieu" ? k.mt : loai === "kr" ? k.kr1 : k.cc;
					const giaTriCuoi =
						cach === "sua" ? "Đối tác lớn mua nhiều hơn mỗi quý" : undefined;
					expect(
						await quyetOk({ deXuatId: id, quyet: cach, giaTriCuoi }, duong),
					).toEqual({ ok: true });
					const sau = await hang(id);
					expect(sau.trangThai).toBe(cach);
					expect(sau.quyetLuc).not.toBeNull();
					expect(await quyetOk({ deXuatId: id, quyet: "hoan" }, duong)).toEqual(
						{ ok: true },
					);
					laCho(await hang(id), `${duong} ${loai} ${cach}`);
					o += 1;
				}
			}
			expect(o).toBe(MA_TRAN.length * DUONG.length);
		},
		CHO_DB,
	);

	test(
		"hoàn tác Mục tiêu đã nhận kéo mọi KR và căn chỉnh đã quyết của nó về chờ, không chạm Mục tiêu khác",
		async () => {
			const k = await gieo();
			await quyetOk({ deXuatId: k.mt, quyet: "nhan" });
			await quyetOk({ deXuatId: k.kr1, quyet: "nhan" });
			await quyetOk({ deXuatId: k.kr2, quyet: "nhan" });
			await quyetOk({ deXuatId: k.kr3, quyet: "bac" });
			await quyetOk({ deXuatId: k.mtKhac, quyet: "nhan" });
			await quyetOk({ deXuatId: k.mt, quyet: "hoan" });
			await conQuyet([k.mt, k.kr1, k.kr2, k.kr3]);
			expect((await hang(k.mtKhac)).trangThai).toBe("nhan");
		},
		CHO_DB,
	);

	test(
		"hoàn tác Mục tiêu đã bỏ qua đưa các KR bị bỏ kèm về chờ",
		async () => {
			const k = await gieo();
			await quyetOk({ deXuatId: k.mt, quyet: "bac" });
			for (const id of [k.kr1, k.kr2, k.kr3, k.moc, k.cc])
				expect((await hang(id)).trangThai).toBe("bac");
			await quyetOk({ deXuatId: k.mt, quyet: "hoan" });
			await conQuyet([k.mt, k.kr1, k.kr2, k.kr3, k.moc, k.cc]);
		},
		CHO_DB,
	);

	test(
		"dòng quyết trước lần nộp mới nhất (Kara giữ nguyên, không tạo hàng mới) hoàn tác xong vẫn nằm trong bản nháp hiện tại, ở chờ, cùng các KR được kéo theo",
		async () => {
			const k = await gieo();
			await quyetOk({ deXuatId: k.mt, quyet: "nhan" });
			await quyetOk({ deXuatId: k.kr1, quyet: "nhan" });
			await gieoDongNhap(
				k.cuoc,
				[
					{
						loai: "kr-moi",
						khoa: "a5",
						chaKhoa: "a",
						ten: "KR của lần nộp mới",
					},
				],
				"cho",
				{ inputHash: "lan-moi" },
			);
			await db.okrCuocSoan.update({
				where: { id: k.cuoc.id },
				data: { lanNopMoiNhat: "lan-moi" },
			});
			const ten = async () =>
				ok<SoanDanhSachOutput>(
					await goiSoan(
						app,
						"soanDanhSach",
						"trpc",
						{ cuocSoanId: k.cuoc.id },
						cTruong,
					),
					"danh sach",
				).dong.map((d) => [d.id, d.trangThai] as const);
			const truoc = new Map(await ten());
			expect(truoc.get(k.mt)).toBe("nhan");
			expect(truoc.get(k.kr2)).toBeUndefined();
			await quyetOk({ deXuatId: k.mt, quyet: "hoan" });
			const sau = new Map(await ten());
			expect([sau.get(k.mt), sau.get(k.kr1)]).toEqual(["cho", "cho"]);
		},
		CHO_DB,
	);

	test(
		"từ chối không ghi gì: dòng đang chờ (chua-quyet), dòng của lần nộp cũ (dongCu), cuộc đã đưa vào (cuocKhongDang)",
		async () => {
			const k = await gieo();
			const truoc = await anh(k.cuoc.id);
			expect(await quyetOk({ deXuatId: k.kr1, quyet: "hoan" })).toEqual({
				ok: false,
				lyDo: "chua-quyet",
				chiTiet: null,
			});
			khongDoi(truoc, await anh(k.cuoc.id));

			const [cu] = (await gieoDongNhap(
				k.cuoc,
				[{ loai: "kr-moi", khoa: "a9", chaKhoa: "a", ten: "Dòng của lần cũ" }],
				"cho",
				{ inputHash: "lan-cu" },
			)) as [string];
			await db.okrCuocSoan.update({
				where: { id: k.cuoc.id },
				data: { lanNopMoiNhat: `gieo:${k.cuoc.id}` },
			});
			const truocCu = await anh(k.cuoc.id);
			for (const duong of DUONG) {
				const tra = await quyet({ deXuatId: cu, quyet: "hoan" }, duong);
				expect(`${duong} ${tra.status} ${tra.loi}`).toBe(
					`${duong} 409 ${T.dongCu}`,
				);
			}
			khongDoi(truocCu, await anh(k.cuoc.id));

			await quyetOk({ deXuatId: k.kr1, quyet: "nhan" });
			await db.okrCuocSoan.update({
				where: { id: k.cuoc.id },
				data: { trangThai: "da-dua-vao" },
			});
			const truocDong = await anh(k.cuoc.id);
			const tra = await quyet({ deXuatId: k.kr1, quyet: "hoan" });
			expect(`${tra.status} ${tra.loi}`).toBe(`409 ${T.cuocKhongDang}`);
			khongDoi(truocDong, await anh(k.cuoc.id));
		},
		CHO_DB,
	);
});

describe("k2-api-nhom", () => {
	test(
		"nhận Mục tiêu kèm hai KR trong một lần ghi: ba hàng nhan cùng quyetLuc, KR không kèm vẫn chờ; hoàn tác Mục tiêu đưa cả ba về chờ",
		async () => {
			for (const duong of DUONG) {
				const k = await gieo();
				expect(
					await quyetOk(
						{ deXuatId: k.mt, quyet: "nhan", kem: [k.kr1, k.moc] },
						duong,
					),
				).toEqual({ ok: true });
				const ba = await Promise.all([k.mt, k.kr1, k.moc].map(hang));
				expect(ba.map((h) => h.trangThai)).toEqual(["nhan", "nhan", "nhan"]);
				const luc = new Set(ba.map((h) => h.quyetLuc?.toISOString()));
				expect(luc.size).toBe(1);
				expect((await hang(k.kr2)).trangThai).toBe("cho");
				await quyetOk({ deXuatId: k.mt, quyet: "hoan" }, duong);
				for (const id of [k.mt, k.kr1, k.moc])
					laCho(await hang(id), `${duong} nhom ${id}`);
			}
		},
		CHO_DB,
	);

	test(
		"lệnh nhóm sai bị từ chối trọn, không dòng nào đổi: KR của Mục tiêu khác, KR đã quyết",
		async () => {
			const k = await gieo();
			const truoc = await anh(k.cuoc.id);
			expect(
				await quyetOk({
					deXuatId: k.mt,
					quyet: "nhan",
					kem: [k.kr1, k.krKhac],
				}),
			).toEqual({ ok: false, lyDo: "kem-sai", chiTiet: null });
			khongDoi(truoc, await anh(k.cuoc.id));

			await quyetOk({ deXuatId: k.kr2, quyet: "bac" });
			const truoc2 = await anh(k.cuoc.id);
			expect(
				await quyetOk({ deXuatId: k.mt, quyet: "nhan", kem: [k.kr1, k.kr2] }),
			).toEqual({ ok: false, lyDo: "kem-sai", chiTiet: null });
			khongDoi(truoc2, await anh(k.cuoc.id));
		},
		CHO_DB,
	);

	test(
		"kem chỉ đi với quyet nhan trên Mục tiêu: kem với bac là lỗi đầu vào, kem trên dòng KR bị từ chối kem-sai",
		async () => {
			const k = await gieo();
			const truoc = await anh(k.cuoc.id);
			for (const duong of DUONG) {
				const voiBac = await quyet(
					{ deXuatId: k.mt, quyet: "bac", kem: [k.kr1] },
					duong,
				);
				expect(`${duong} ${voiBac.status}`).toBe(`${duong} 400`);
			}
			expect(
				await quyetOk({ deXuatId: k.kr1, quyet: "nhan", kem: [k.kr2] }),
			).toEqual({ ok: false, lyDo: "kem-sai", chiTiet: null });
			khongDoi(truoc, await anh(k.cuoc.id));
		},
		CHO_DB,
	);
});
