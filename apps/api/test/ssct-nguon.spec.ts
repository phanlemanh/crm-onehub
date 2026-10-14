import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { khoNguonGia } from "@crm/db/test/blob-nguon-gia";
import { TAI_LIEU_API } from "../src/tai-lieu/tai-lieu-config";
import { docxNho } from "./tai-lieu-nguon-mau";
import {
	type Ai,
	dungSan,
	duyet,
	goi,
	hoi,
	type Json,
	ma,
	ok,
	type TraLoi,
	taoTrang,
} from "./tai-lieu-san";

const gia = khoNguonGia();
dungSan(gia);

const NGUOI_GOI: Ai = "khac";

async function trangDangDung(nhan: string): Promise<string> {
	const t = await taoTrang(ma(nhan), "## Mot\n\nBan dau.");
	await duyet(t.deXuatId, "chu");
	return t.slug;
}

async function trangDaLuuTru(nhan: string): Promise<string> {
	const slug = await trangDangDung(nhan);
	const { deXuatId } = ok<{ deXuatId: string }>(
		await goi(
			"taiLieu.deXuatLuuTru",
			{ slug, lyDo: "Không còn dùng." },
			"khac",
		),
		`de xuat luu tru ${slug}`,
	);
	await duyet(deXuatId, "chu");
	return slug;
}

async function trangChuaDuyetCuaNguoiKhac(nhan: string): Promise<string> {
	const t = await taoTrang(ma(nhan), "## Nhap\n\nChua duyet.", "tao", "chu");
	return t.slug;
}

async function nhanCapNhat(slug: string): Promise<TraLoi> {
	const byte = docxNho(ma("chu"));
	const cho = ok<{ pathname: string; phieu: string }>(
		await goi(
			"taiLieuNguon.xinCho",
			{ tenTep: "nguon.docx", kieu: "docx", kichThuoc: byte.length },
			NGUOI_GOI,
		),
		`xin cho ${slug}`,
	);
	gia.daPut.set(cho.pathname, byte);
	const dich: Json = { loai: "cap-nhat", slug };
	return goi(
		"taiLieuNguon.nhan",
		{ pathname: cho.pathname, tenTep: "nguon.docx", dich, phieu: cho.phieu },
		NGUOI_GOI,
	);
}

async function demHang() {
	const [nguon, deXuat] = await Promise.all([
		db.taiLieuNguon.count(),
		db.taiLieuDeXuat.count(),
	]);
	return { nguon, deXuat };
}

type Dong = {
	ten: string;
	dung: (nhan: string) => Promise<string>;
	mong: "luu-tru" | "nhu-get" | "nhan";
};

const BANG: readonly Dong[] = [
	{ ten: "A đã lưu trữ", dung: trangDaLuuTru, mong: "luu-tru" },
	{
		ten: "B chưa duyệt của người khác",
		dung: trangChuaDuyetCuaNguoiKhac,
		mong: "nhu-get",
	},
	{ ten: "C đang dùng", dung: trangDangDung, mong: "nhan" },
];

describe("ssct-nguon", () => {
	test("ssct-nguon: bảng ba dòng viết trước", () => {
		expect(BANG.map((d) => d.mong)).toEqual(["luu-tru", "nhu-get", "nhan"]);
	});

	for (const dong of BANG) {
		test(`ssct-nguon: ${dong.ten}`, async () => {
			const slug = await dong.dung(dong.ten);
			const truoc = await demHang();
			const tra = await nhanCapNhat(slug);
			const sau = await demHang();

			if (dong.mong === "nhan") {
				ok<{ nguonId: string }>(tra, dong.ten);
				expect(sau.nguon).toBe(truoc.nguon + 1);
				return;
			}
			expect(sau).toEqual(truoc);
			if (dong.mong === "luu-tru") {
				expect(tra.status).toBe(400);
				expect(tra.loi).toBe(TAI_LIEU_API.thongDiep.daLuuTru);
				expect(tra.loi).toContain("Trang đã lưu trữ");
				return;
			}
			const get = await hoi("taiLieu.get", { slug }, NGUOI_GOI);
			expect(get.status).toBe(404);
			expect({ status: tra.status, loi: tra.loi }).toEqual({
				status: get.status,
				loi: get.loi,
			});
		});
	}
});
