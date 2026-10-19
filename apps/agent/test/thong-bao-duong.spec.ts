import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { THU_TU_NHAC } from "@crm/db/onboarding-nhac";
import { duongTrongApp } from "../agent/lib/nhac-ke-hoach";
import type { BanChup } from "./support/chup-tin-nhac";
import { CHUP } from "./support/chup-tin-nhac";
import { MUC_MAU } from "./support/muc-mau";

const banChup = JSON.parse(
	readFileSync(
		join(import.meta.dir, "fixtures/tin-nhac-truoc-tb1.json"),
		"utf8",
	),
) as BanChup;

describe("duong", () => {
	test("duong: moi loai, duong thong bao trung duong tin Zalo truoc vong", () => {
		console.log(`duong: so loai ${THU_TU_NHAC.length}`);
		expect(Object.keys(banChup).length).toBe(THU_TU_NHAC.length);
		for (const loai of THU_TU_NHAC) {
			const zalo = banChup[loai]?.duong ?? "";
			const dau = `${CHUP.appUrl}/`;
			expect(zalo.startsWith(dau), `ban chup ${loai} khong co dia chi`).toBe(
				true,
			);
			const sauSlug = zalo.slice(dau.length).replace(/^[^/?]+/, "");
			expect(
				duongTrongApp(MUC_MAU[loai]),
				"duong thong bao lech tin Zalo",
			).toBe(sauSlug);
		}
	});
});
