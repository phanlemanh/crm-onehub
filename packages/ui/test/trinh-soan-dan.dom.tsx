import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { donDep, dung } from "./trinh-soan-vat";

const THU_MUC = join(import.meta.dir, "fixtures", "tai-lieu");

const NGUON = ["clipboard-word", "clipboard-gdocs"] as const;

const CHUOI_CAM = ["Mso", "o:p", "style=", "color", "font"] as const;

const CHI_WORD = new Set(["Mso", "o:p"]);

afterEach(donDep);

function docThat(tep: string): string {
	const duong = join(THU_MUC, tep);
	if (!existsSync(duong)) throw new Error(`thiếu mẫu dán thật: ${tep}`);
	return readFileSync(duong, "utf8");
}

function mau(ten: string) {
	const html = docThat(`${ten}.html`);
	const kyVong = docThat(`${ten}.md`).replace(/\n$/, "");
	return { html, kyVong };
}

function danVao(html: string): string {
	const t = dung("");
	t.dan(html);
	const md = t.phat.at(-1);
	if (md === undefined) throw new Error("dan khong phat markdown");
	return md;
}

function soDam(md: string): number {
	return (md.match(/\*\*/g) ?? []).length / 2;
}

describe("E11 dan tu Word va Google Docs", () => {
	for (const ten of NGUON) {
		test(`markdown trung tep ky vong tung byte: ${ten}`, () => {
			const { html, kyVong } = mau(ten);
			const md = danVao(html);
			if (soDam(md) > soDam(kyVong)) throw new Error(`dam tran: ${ten}`);
			expect(md).toBe(kyVong);
		});

		for (const chuoi of CHUOI_CAM) {
			test(`${ten}: markdown khong co "${chuoi}"`, () => {
				const { html } = mau(ten);
				const nguonPhaiCo = ten === "clipboard-word" || !CHI_WORD.has(chuoi);
				if (nguonPhaiCo && !html.includes(chuoi)) {
					throw new Error(`mau dan khong ban: ${ten} thieu ${chuoi}`);
				}
				const md = danVao(html);
				if (md.includes(chuoi)) {
					throw new Error(`con ${chuoi} trong markdown: ${ten}`);
				}
				expect(md.includes(chuoi)).toBe(false);
			});
		}
	}
});
