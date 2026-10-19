import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TaiLieuService } from "../../api/src/tai-lieu/tai-lieu.service";
import { TaiLieuLichSuService } from "../../api/src/tai-lieu/tai-lieu-lich-su.service";
import { type BanNop, nopBanDeXuat } from "../agent/lib/tai-lieu-nop";
import {
	datBanDangDung,
	donTaiLieu,
	gieoNguoi,
	gieoNguon,
	gieoTrang,
	ma,
} from "./support/tai-lieu-gieo";

const BAN: BanNop = {
	ten: "Trang cập nhật",
	noiDung: "## Mục chung\n\nNội dung cập nhật từ nguồn.",
	trichDoan: [],
};

let nguoiId = "";

beforeAll(async () => {
	nguoiId = await gieoNguoi();
});

afterAll(async () => {
	await donTaiLieu([nguoiId]);
});

async function trangCoNguonDangSoan(): Promise<{
	trangId: string;
	slug: string;
	nguonId: string;
	phien: string;
}> {
	const slug = ma("trang");
	const trangId = await gieoTrang(nguoiId, slug);
	await datBanDangDung(trangId, nguoiId, "## Mục chung\n\nBản đầu.");
	const { banDangDungId } = await db.taiLieuTrang.findUniqueOrThrow({
		where: { id: trangId },
		select: { banDangDungId: true },
	});
	const phien = ma("phien");
	const { id: nguonId } = await gieoNguon({
		tep: "quyet-dinh.docx",
		trangId,
		taiBoiId: nguoiId,
		bamKhai: ma("sha"),
		trangThai: "DANG_SOAN",
		chu: "Nội dung cập nhật từ nguồn.",
		banGocId: banDangDungId,
		phienId: phien,
	});
	return { trangId, slug, nguonId, phien };
}

async function luuTruQuaApi(slug: string): Promise<void> {
	const quanTri = { id: nguoiId, role: "owner" as const };
	const { deXuatId } = await new TaiLieuLichSuService(db).deXuatLuuTru(
		quanTri,
		{ slug, lyDo: "Không còn dùng." },
	);
	await new TaiLieuService(db).approve(quanTri, {
		id: deXuatId,
		diffHash: "",
	});
	const { archivedAt } = await db.taiLieuTrang.findUniqueOrThrow({
		where: { slug },
		select: { archivedAt: true },
	});
	expect(archivedAt).not.toBeNull();
}

const demDeXuat = (trangId: string) =>
	db.taiLieuDeXuat.count({ where: { trangId } });

describe("ssct-nop-luu-tru", () => {
	test("ssct-nop-luu-tru: trang vừa lưu trữ → nguồn lỗi, không đề xuất mới", async () => {
		const p = await trangCoNguonDangSoan();
		await luuTruQuaApi(p.slug);
		const truoc = await demDeXuat(p.trangId);

		const kq = await nopBanDeXuat(p.nguonId, p.phien, BAN);

		expect(kq.ok).toBe(false);
		const nguon = await db.taiLieuNguon.findUniqueOrThrow({
			where: { id: p.nguonId },
			select: { trangThai: true, lyDo: true },
		});
		expect(nguon.trangThai).toBe("LOI");
		expect(nguon.lyDo ?? "").toContain("lưu trữ");
		expect(await demDeXuat(p.trangId)).toBe(truoc);
	});

	test("ssct-nop-luu-tru: chiều đỏ — trang chưa lưu trữ thì nộp tạo đúng một đề xuất", async () => {
		const q = await trangCoNguonDangSoan();
		const truoc = await demDeXuat(q.trangId);

		const kq = await nopBanDeXuat(q.nguonId, q.phien, BAN);

		expect(kq.ok).toBe(true);
		expect(await demDeXuat(q.trangId)).toBe(truoc + 1);
	});
});
