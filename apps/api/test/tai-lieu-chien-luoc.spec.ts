import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import { docTrangChienLuocDangDung } from "@crm/db/tai-lieu-chien-luoc";
import { LOAI_TRANG } from "@crm/validation/tai-lieu";
import { TAI_LIEU_API } from "../src/tai-lieu/tai-lieu-config";
import {
	deXuat,
	dungSan,
	duyet,
	goi,
	hashCua,
	hoi,
	ma,
	ok,
	taoTrang,
} from "./tai-lieu-san";

dungSan();

const T = TAI_LIEU_API.thongDiep;
const TRAN = TRO_LY_OKR_TRAN.trangChienLuocKyTu;
const CAU = "Hải Đăng vận chuyển hàng lạnh khắp miền Bắc bằng đội xe riêng. ";

function than(soKyTu: number, duoi = ""): string {
	const goc = `## Hồ sơ\n\n${CAU.repeat(Math.ceil(soKyTu / CAU.length))}`;
	const than = goc.slice(0, soKyTu - duoi.length - 1);
	return `${than}.${duoi}`;
}

type Duyet = { slug: string; so: number; canhBaoTuCam: string[] };
type DeXuatDoc = {
	chienLuoc: {
		soKyTu: number;
		tranKyTu: number;
		canhBaoTuCam: string[];
	} | null;
};

describe("trang-chien-luoc", () => {
	test("loại chien-luoc có trong LOAI_TRANG; tạo được trang loại này", async () => {
		expect(LOAI_TRANG).toContain("chien-luoc");
		const t = await taoTrang(
			ma("Hồ sơ công ty"),
			than(300),
			"tao",
			"chu",
			"chien-luoc",
		);
		const trang = await db.taiLieuTrang.findUniqueOrThrow({
			where: { slug: t.slug },
			select: { loai: true },
		});
		expect(trang.loai).toBe("chien-luoc");
	});

	test("bản đề xuất 24.310 ký tự trên trang chiến lược → từ chối «tối đa 20.000 (đang 24.310)»; không có bản đang dùng", async () => {
		const t = await taoTrang(
			ma("Chiến lược dài"),
			than(24_310),
			"tao",
			"chu",
			"chien-luoc",
		);
		const p = ok<DeXuatDoc>(
			await hoi("taiLieu.proposal", { id: t.deXuatId }, "chu"),
			"proposal",
		);
		expect(p.chienLuoc).toEqual({
			soKyTu: 24_310,
			tranKyTu: TRAN,
			canhBaoTuCam: [],
		});
		const r = await goi(
			"taiLieu.approve",
			{ id: t.deXuatId, diffHash: await hashCua(t.deXuatId, "chu") },
			"chu",
		);
		expect([r.status, r.loi]).toEqual([400, T.chienLuocQuaTran(TRAN, 24_310)]);
		expect(T.chienLuocQuaTran(TRAN, 24_310)).toBe(
			"Trang chiến lược tối đa 20.000 ký tự (đang 24.310)",
		);
		const trang = await db.taiLieuTrang.findUniqueOrThrow({
			where: { slug: t.slug },
			select: { banDangDungId: true },
		});
		expect(trang.banDangDungId).toBeNull();
	});

	test("trang quy-dinh 24.310 ký tự vẫn duyệt được — trần chỉ áp loại chien-luoc", async () => {
		const t = await taoTrang(
			ma("Quy định dài"),
			than(24_310),
			"tao",
			"chu",
			"quy-dinh",
		);
		const r = await goi(
			"taiLieu.approve",
			{ id: t.deXuatId, diffHash: await hashCua(t.deXuatId, "chu") },
			"chu",
		);
		expect([r.status, r.loi], "tran ap sai loai").toEqual([200, ""]);
		expect((r.data as Duyet).canhBaoTuCam).toEqual([]);
	});

	test("bản 19.000 ký tự có «thưởng quý» và «xếp hạng» → duyệt được, kết quả và proposal mang canhBaoTuCam đúng hai chữ theo thứ tự TRO_LY_OKR_TRAN.tuCamTrangChienLuoc", async () => {
		const duoi = "\n\nChính sách thưởng quý theo xếp hạng đội.";
		const t = await taoTrang(
			ma("Chiến lược năm"),
			than(19_000, duoi),
			"tao",
			"chu",
			"chien-luoc",
		);
		const mong = TRO_LY_OKR_TRAN.tuCamTrangChienLuoc.filter(
			(tu) => tu === "thưởng" || tu === "xếp hạng",
		);
		expect(mong).toEqual(["thưởng", "xếp hạng"]);
		const p = ok<DeXuatDoc>(
			await hoi("taiLieu.proposal", { id: t.deXuatId }, "chu"),
			"proposal",
		);
		expect(p.chienLuoc?.canhBaoTuCam).toEqual(mong);
		const r = ok<Duyet>(
			await goi(
				"taiLieu.approve",
				{ id: t.deXuatId, diffHash: await hashCua(t.deXuatId, "chu") },
				"chu",
			),
			"duyet co tu cam",
		);
		expect(r.canhBaoTuCam, "canh bao tu cam sai chu").toEqual(mong);
		expect(r.so).toBe(1);
	});

	test("trang chiến lược nói về khách hàng, dự án, cơ hội → không cảnh báo: từ bán hàng và dự án không thuộc nhóm từ cấm của trang chiến lược", async () => {
		const duoi =
			"\n\nKhách hàng lớn, dự án mới và cơ hội mở rộng, mỗi task có người phụ trách.";
		const t = await taoTrang(
			ma("Chiến lược khách hàng"),
			than(2_000, duoi),
			"tao",
			"chu",
			"chien-luoc",
		);
		for (const tu of ["khách hàng", "dự án", "cơ hội", "task"]) {
			expect(TRO_LY_OKR_TRAN.tuCam as readonly string[]).toContain(tu);
			expect(
				TRO_LY_OKR_TRAN.tuCamTrangChienLuoc as readonly string[],
			).not.toContain(tu);
		}
		const p = ok<DeXuatDoc>(
			await hoi("taiLieu.proposal", { id: t.deXuatId }, "chu"),
			"proposal",
		);
		expect(p.chienLuoc?.canhBaoTuCam, "canh bao tu ban hang").toEqual([]);
		const r = ok<Duyet>(
			await goi(
				"taiLieu.approve",
				{ id: t.deXuatId, diffHash: await hashCua(t.deXuatId, "chu") },
				"chu",
			),
			"duyet tu ban hang",
		);
		expect(r.canhBaoTuCam, "canh bao tu ban hang").toEqual([]);
	});

	test("docTrangChienLuocDangDung: chỉ bản đang dùng của loại chien-luoc, theo thứ tự cập nhật; không bản đề xuất, không loại khác", async () => {
		const tenA = ma("Hồ sơ A");
		const tenB = ma("Chiến lược B");
		const a = await taoTrang(tenA, than(400), "tao", "chu", "chien-luoc");
		await duyet(a.deXuatId, "chu");
		const b = await taoTrang(tenB, than(500), "tao", "chu", "chien-luoc");
		await duyet(b.deXuatId, "chu");
		await deXuat(b.slug, than(600), "tao");
		const tenChua = ma("Chưa duyệt");
		const tenQuyDinh = ma("Quy định C");
		await taoTrang(tenChua, than(300), "tao", "chu", "chien-luoc");
		const quyDinh = await taoTrang(
			tenQuyDinh,
			than(300),
			"tao",
			"chu",
			"quy-dinh",
		);
		await duyet(quyDinh.deXuatId, "chu");
		const ds = await docTrangChienLuocDangDung(db);
		const cua = ds.filter((t) => t.ten === tenA || t.ten === tenB);
		expect(cua.map((t) => t.ten)).toEqual([tenA, tenB]);
		expect(cua[1]?.noiDung, "doc ban chua duyet").toBe(than(500));
		expect(
			ds.some((t) => t.ten === tenChua),
			"doc ban chua duyet",
		).toBe(false);
		expect(
			ds.some((t) => t.ten === tenQuyDinh),
			"doc sai loai trang",
		).toBe(false);
		for (const t of ds)
			expect(Object.keys(t).sort()).toEqual(["noiDung", "ten", "xacMinhDen"]);
	});
});
