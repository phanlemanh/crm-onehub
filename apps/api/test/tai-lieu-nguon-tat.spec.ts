import { describe, expect, test } from "bun:test";
import { NGUON } from "@crm/validation/tai-lieu-nguon";
import {
	deXuat,
	dungSan,
	duyet,
	goi,
	hoi,
	ma,
	ok,
	type TraLoi,
	taoTrang,
} from "./tai-lieu-san";

process.env.BLOB_READ_WRITE_TOKEN = "";
dungSan();

const TAT = `412 ${NGUON.thongDiep.tat}`;
const traVe = (t: TraLoi) => `${t.status} ${t.loi}`;

describe("nguon-tat", () => {
	test("nguon-tat: ba thu tuc nap nguon tra PRECONDITION_FAILED, khong 500", async () => {
		expect(
			ok<{ bat: boolean }>(
				await hoi("taiLieuNguon.trangThai", undefined, "tao"),
				"trang thai",
			),
		).toEqual({ bat: false });
		const xin = await goi(
			"taiLieuNguon.xinCho",
			{ tenTep: "a.pdf", kieu: "pdf", kichThuoc: 10 },
			"tao",
		);
		expect(traVe(xin)).toBe(TAT);
		const nhan = await goi(
			"taiLieuNguon.nhan",
			{
				pathname: "kho-tai-lieu/nguon/00000000-0000-4000-8000-000000000000",
				tenTep: "a.pdf",
				dich: { loai: "cap-nhat", slug: "khong-co" },
			},
			"tao",
		);
		expect(traVe(nhan)).toBe(TAT);
		const taiVe = await goi("taiLieuNguon.taiVe", { id: "khong-co" }, "tao");
		expect(traVe(taiVe)).toBe(TAT);
	});

	test("nguon-tat: luot 1 chay nhu cu khi chua bat luu tep", async () => {
		const { slug, deXuatId } = await taoTrang(ma("Tat"), "## Mot\n\nBan dau.");
		expect(await duyet(deXuatId, "chu")).toBe(1);
		const moi = await deXuat(slug, "## Mot\n\nBan sau.");
		expect(await duyet(moi, "chu")).toBe(2);
		ok(await hoi("taiLieu.list", {}, "khac"), "list");
		ok(await hoi("taiLieu.get", { slug }, "khac"), "get");
	});

	test("nguon-tat: doi chung, dat khoa thi cong bat ngay, doc luc goi", async () => {
		process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_gia_123";
		try {
			expect(
				ok<{ bat: boolean }>(
					await hoi("taiLieuNguon.trangThai", undefined, "tao"),
					"trang thai bat",
				),
			).toEqual({ bat: true });
		} finally {
			process.env.BLOB_READ_WRITE_TOKEN = "";
		}
	});
});
