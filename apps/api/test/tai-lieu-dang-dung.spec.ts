import { describe, expect, test } from "bun:test";
import { dungSan, duyet, hoi, ma, ok, taoTrang } from "./tai-lieu-san";

dungSan();

type DangDung = { rows: { slug: string; ten: string }[] };

describe("tai-lieu-dang-dung", () => {
	test("dang-dung: chi liet trang co ban dang dung", async () => {
		const co = await taoTrang(ma("Co ban"), "## Mot\n\nDa duyet.");
		await duyet(co.deXuatId, "chu");
		const chua = await taoTrang(ma("Chua ban"), "## Hai\n\nCho duyet.");
		const { rows } = ok<DangDung>(
			await hoi("taiLieu.dangDung", undefined, "khac"),
			"dang dung",
		);
		const slug = rows.map((r) => r.slug);
		expect(slug).toContain(co.slug);
		expect(slug).not.toContain(chua.slug);
	});
});
