import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TAI_LIEU_API } from "../src/tai-lieu/tai-lieu-config";
import {
	dungSan,
	duyet,
	goi,
	ma,
	ok,
	type TraLoi,
	taoTrang,
} from "./tai-lieu-san";

dungSan();

const NOI_DUNG = "## Quy định\n\nNội dung giữ nguyên.";

async function trangHaiTen(): Promise<string> {
	const t = await taoTrang(ma("Quy định cũ"), NOI_DUNG);
	await duyet(t.deXuatId, "chu");
	const { deXuatId } = ok<{ deXuatId: string }>(
		await goi(
			"taiLieu.propose",
			{ slug: t.slug, noiDung: NOI_DUNG, ten: ma("Quy định mới") },
			"tao",
		),
		"doi ten",
	);
	await duyet(deXuatId, "chu");
	return t.slug;
}

async function trangMotBan(): Promise<{ slug: string; so: number }> {
	const t = await taoTrang(ma("Quy định đứng yên"), NOI_DUNG);
	const so = await duyet(t.deXuatId, "chu");
	return { slug: t.slug, so };
}

async function demHang(trangSlug: string) {
	const trang = await db.taiLieuTrang.findUniqueOrThrow({
		where: { slug: trangSlug },
		select: { id: true },
	});
	const [deXuat, suKien] = await Promise.all([
		db.taiLieuDeXuat.count({ where: { trangId: trang.id } }),
		db.taiLieuSuKien.count({ where: { trangId: trang.id } }),
	]);
	return { trangId: trang.id, deXuat, suKien };
}

const CA_T = { ten: "T chỉ khác tên", mong: 200 } as const;
const CA_U = { ten: "U trùng cả tên lẫn nội dung", mong: 409 } as const;
const BANG = [CA_T, CA_U] as const;

describe("ssct-quay-lai", () => {
	test("ssct-quay-lai: bảng hai ca viết trước, mã khác nhau", () => {
		expect(BANG.map((c) => c.mong)).toEqual([200, 409]);
	});

	test(`ssct-quay-lai: ${CA_T.ten}`, async () => {
		const slug = await trangHaiTen();
		const truoc = await demHang(slug);
		const tra: TraLoi = await goi("taiLieu.quayLai", { slug, so: 1 }, "tao");
		expect(tra.status).toBe(CA_T.mong);
		const { deXuatId } = ok<{ deXuatId: string }>(tra, "quay lai T");
		const dx = await db.taiLieuDeXuat.findUniqueOrThrow({
			where: { id: deXuatId },
			select: { ten: true, loai: true, tuPhienBanSo: true, trangThai: true },
		});
		const v1 = await db.taiLieuPhienBan.findFirstOrThrow({
			where: { trangId: truoc.trangId, so: 1 },
			select: { ten: true },
		});
		expect(dx).toEqual({
			ten: v1.ten,
			loai: "NOI_DUNG",
			tuPhienBanSo: 1,
			trangThai: "CHO_DUYET",
		});
		const sau = await demHang(slug);
		expect(sau.deXuat).toBe(truoc.deXuat + 1);
		const deXuatSuKien = await db.taiLieuSuKien.count({
			where: {
				trangId: truoc.trangId,
				loai: "DE_XUAT",
				chiTiet: { path: ["deXuatId"], equals: deXuatId },
			},
		});
		expect(deXuatSuKien).toBe(1);
	});

	test(`ssct-quay-lai: ${CA_U.ten}`, async () => {
		const { slug, so } = await trangMotBan();
		const truoc = await demHang(slug);
		const tra = await goi("taiLieu.quayLai", { slug, so }, "tao");
		expect(tra.status).toBe(CA_U.mong);
		expect(tra.loi).toBe(TAI_LIEU_API.thongDiep.chuaDoi);
		expect(await demHang(slug)).toEqual(truoc);
	});
});
