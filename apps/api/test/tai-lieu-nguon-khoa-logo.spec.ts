import { afterAll, describe, expect, test } from "bun:test";
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

const TRUOC = {
	BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
	KHO_TAI_LIEU_BLOB_TOKEN: process.env.KHO_TAI_LIEU_BLOB_TOKEN,
};
process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_logo_gia";
process.env.KHO_TAI_LIEU_BLOB_TOKEN = "";
dungSan();

afterAll(() => {
	for (const [ten, gt] of Object.entries(TRUOC)) {
		if (gt === undefined) delete process.env[ten];
		else process.env[ten] = gt;
	}
});

const TAT = `412 ${NGUON.thongDiep.tat}`;
const traVe = (t: TraLoi) => `${t.status} ${t.loi}`;

describe("khoa-logo", () => {
	test("khoa-logo: chi co khoa logo thi kho nguon tat, ba thu tuc tra PRECONDITION_FAILED", async () => {
		const trangThai = ok<{ bat: boolean }>(
			await hoi("taiLieuNguon.trangThai", undefined, "tao"),
			"trang thai",
		);
		if (trangThai.bat) throw new Error("kho nguon bat bang khoa logo");
		expect(trangThai).toEqual({ bat: false });
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
				phieu: "0.khong-co-phieu",
			},
			"tao",
		);
		expect(traVe(nhan)).toBe(TAT);
		const taiVe = await goi("taiLieuNguon.taiVe", { id: "khong-co" }, "tao");
		expect(traVe(taiVe)).toBe(TAT);
	});

	test("khoa-logo: luot 1 chay nhu cu khi chi co khoa logo", async () => {
		const { slug, deXuatId } = await taoTrang(ma("Logo"), "## Mot\n\nBan dau.");
		expect(await duyet(deXuatId, "chu")).toBe(1);
		const moi = await deXuat(slug, "## Mot\n\nBan sau.");
		expect(await duyet(moi, "chu")).toBe(2);
		ok(await hoi("taiLieu.list", {}, "khac"), "list");
		ok(await hoi("taiLieu.get", { slug }, "khac"), "get");
	});
});
