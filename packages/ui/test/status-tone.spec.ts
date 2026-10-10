import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	type NghiaTrangThai,
	TONE_THEO_NGHIA,
	toneTheoNghia,
} from "../src/components/status-tone";

const NHAN_NGHIA = {
	xong: "xong",
	cho: "chờ",
	hong: "hỏng",
	nhap: "nháp",
	dangChay: "đang chạy",
} as const satisfies Record<NghiaTrangThai, string>;

const THIET_KE = join(import.meta.dir, "..", "..", "..", "docs", "design.md");

function bangThietKe() {
	const chu = readFileSync(THIET_KE, "utf8");
	const dau = chu.indexOf("### Màu trạng thái");
	const het = chu.indexOf("\n#", dau + 1);
	const muc = chu.slice(dau, het < 0 ? undefined : het);
	return [...muc.matchAll(/^\| ([^|`]+?) \| `(\w+)` \|$/gm)]
		.map((m) => ({
			nghia: (m[1] ?? "").split(",").map((s) => s.trim()),
			tone: m[2] ?? "",
		}))
		.filter((d) => d.tone !== "tone");
}

describe("bang nghia → mau dung chung", () => {
	test("moi nghia trong ma khop dung mot dong cua docs/design.md", () => {
		const bang = bangThietKe();
		expect(bang.length).toBe(Object.keys(TONE_THEO_NGHIA).length);
		for (const [khoa, tone] of Object.entries(TONE_THEO_NGHIA)) {
			const dong = bang.filter((d) =>
				d.nghia.includes(NHAN_NGHIA[khoa as NghiaTrangThai]),
			);
			expect(dong.length, `nghia ${khoa} khong co dong nao`).toBe(1);
			expect(
				dong[0]?.tone,
				`bang mau lech docs/design.md o nghia ${khoa}`,
			).toBe(tone);
		}
	});

	test("toneTheoNghia tra dung gia tri cua bang", () => {
		for (const [khoa, tone] of Object.entries(TONE_THEO_NGHIA))
			expect(toneTheoNghia(khoa as NghiaTrangThai)).toBe(tone);
	});
});
