import { describe, expect, test } from "bun:test";
import { dauTuanVN } from "../src/onboarding-nhac";

const BANG: [string, string, string][] = [
	["chu nhat truoc nua dem VN", "2026-11-08T16:59:00Z", "2026-11-02"],
	["thu hai 00:00 gio VN", "2026-11-08T17:00:00Z", "2026-11-09"],
	["giua tuan", "2026-11-11T05:00:00Z", "2026-11-09"],
];

describe("dauTuanVN", () => {
	test.each(BANG)("%s", (_ten, vao, mong) => {
		expect(dauTuanVN(new Date(vao))).toBe(mong);
	});
});
