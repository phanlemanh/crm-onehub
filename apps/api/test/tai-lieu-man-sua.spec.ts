import { describe, expect, test } from "bun:test";
import { deXuat, dungSan, duyet, hoi, ok, taoTrang } from "./tai-lieu-san";

dungSan();

type Get = {
	noiDung: string | null;
	coBanCho: boolean;
	phienBan: { so: number } | null;
};

describe("man-sua", () => {
	test("man-sua: get tra noi dung phien ban dang dung cho moi nguoi, khong bao gio noi dung de xuat cho", async () => {
		const { slug, deXuatId } = await taoTrang("Màn sửa thử", "Bản một.");
		await duyet(deXuatId, "chu");
		const hai = await deXuat(slug, "Bản hai.", "khac");
		await duyet(hai, "chu");
		await deXuat(slug, "Bản ba đang chờ.", "tao");
		const MONG = [
			["tao", true],
			["chu", true],
			["khac", false],
		] as const;
		for (const [ai, coBanCho] of MONG) {
			const g = ok<Get>(await hoi("taiLieu.get", { slug }, ai), `get ${ai}`);
			expect(
				`${ai}: ${g.noiDung} (phien ban ${g.phienBan?.so})`,
				"man sua mo ban de xuat thay ban dang dung",
			).toBe(`${ai}: Bản hai. (phien ban 2)`);
			expect(`${ai} coBanCho=${g.coBanCho}`).toBe(`${ai} coBanCho=${coBanCho}`);
		}
	});
});
