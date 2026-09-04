import { describe, expect, it } from "bun:test";
import { DEFAULT_LOCALE } from "@crm/ui/lib/locale";
import { resolveLocale } from "@/lib/locale/resolve";

const O = [
	["cookie vi thang Accept-Language en", "vi", "en-US,en;q=0.9", "vi"],
	["cookie en thang Accept-Language vi", "en", "vi-VN,vi;q=0.9", "en"],
	["khong cookie, Accept-Language vi", undefined, "vi-VN,vi;q=0.9", "vi"],
	["khong cookie, Accept-Language en", undefined, "en-US,en;q=0.9", "en"],
	["khong cookie, khong Accept-Language", undefined, undefined, "vi"],
] as const;

describe("luat chon tieng", () => {
	it("mac dinh la tieng Viet", () => {
		expect(DEFAULT_LOCALE).toBe("vi");
	});

	it("do du nam o cua truc C", () => {
		expect(O.length).toBe(5);
	});

	for (const [ten, cookie, header, mong] of O) {
		it(ten, () => {
			expect(resolveLocale(cookie, header)).toBe(mong);
		});
	}
});
