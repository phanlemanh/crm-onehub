import { describe, expect, test } from "bun:test";
import type { ViecNhac } from "@crm/db/onboarding-nhac";
import { duongCapNhatKr } from "@crm/validation/okr-cap-nhat";
import { duongTrongApp } from "../agent/lib/nhac-ke-hoach";
import { dungTin } from "../agent/lib/tin-nhac";

const SANG = new Date("2026-10-28T01:30:00Z");

function capNhat(krIds: string[]): ViecNhac {
	return {
		loai: "okr-cap-nhat",
		krIds,
		nhan: krIds.join(", "),
		soKr: krIds.length,
	};
}

describe("ctlk-duong-nhac", () => {
	test("ctlk-duong-nhac: duongTrongApp bang duongCapNhatKr, khong tu=, nhan Slack theo so KR", () => {
		const o = [["a"], ["a", "b"], ["a", "b", "c"]];
		for (const krIds of o) {
			const duong = duongTrongApp(capNhat(krIds));
			if (duong.includes("tu=")) throw new Error("ctlk-duong-nhac: con tu=");
			expect(duong).toBe(duongCapNhatKr(krIds));
		}
		expect(duongTrongApp(capNhat(["a"]))).toBe("/okr/kr/a");

		const lienKet = (v: ViecNhac) => `https://app/ws${duongTrongApp(v)}`;
		const mot = dungTin("An", SANG, [capNhat(["a"])], lienKet, "slack").text;
		expect(mot).toContain("<https://app/ws/okr/kr/a|mở KR>");
		const nhieu = dungTin(
			"An",
			SANG,
			[capNhat(["a", "b"])],
			lienKet,
			"slack",
		).text;
		expect(nhieu).toContain("<https://app/ws/okr|mở Của tôi>");
	});
});
