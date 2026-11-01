import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
	DUONG_NO,
	GOC_KHO,
	phanTichNo,
} from "../../../tools/oxlint/onehub/shared/no-ve-tay";

const CHU_THAT = readFileSync(join(GOC_KHO, DUONG_NO), "utf8");
const coTep = (tep: string) => existsSync(join(GOC_KHO, tep));
const BANG = "apps/app/components/landing/product-shot/companies-page.tsx";
const TONG_MONG = {
	"tieu-de": 38,
	"chip-dinh": 10,
	"alert-dialog": 11,
	clipboard: 8,
	"divide-y": 9,
	cham: 2,
	table: 1,
};

function dongBang(): string {
	const khop = new RegExp(
		`\\{\\n\\t\\t"tep": "${BANG}",\\n\\t\\t"dau_hieu": "table",\\n\\t\\t"so": 1,\\n\\t\\t"ly_do": "[^"]*"\\n\\t\\}`,
	).exec(CHU_THAT);
	if (!khop) throw new Error("fixture: khong thay dong companies-page/table");
	return khop[0];
}

function sua(cu: string, moi: string): string {
	if (!CHU_THAT.includes(cu)) throw new Error(`fixture: khong thay «${cu}»`);
	return CHU_THAT.replace(cu, moi);
}

describe("dau-hieu-ve-tay", () => {
	test("cay-that: danh sach that khong loi, 61 dong, tong so khop kiem ke", () => {
		const r = phanTichNo(CHU_THAT, coTep);
		expect(r.loi).toEqual([]);
		expect(r.dong).toHaveLength(61);
		const tong: Record<string, number> = {};
		for (const d of r.dong) tong[d.dauHieu] = (tong[d.dauHieu] ?? 0) + d.so;
		expect(tong).toEqual(TONG_MONG);
	});

	test("tep-khong-co: dong tro tep khong co thi do", () => {
		const d = dongBang();
		const r = phanTichNo(
			sua(d, d.replace("companies-page.tsx", "khong-co.tsx")),
			coTep,
		);
		expect(r.loi).toEqual(["no ve tay khong-co.tsx/table: tep khong co"]);
	});

	test("dau-hieu-la: dau hieu ngoai bay ma thi do", () => {
		const d = dongBang();
		const r = phanTichNo(
			sua(d, d.replace('"dau_hieu": "table"', '"dau_hieu": "bang"')),
			coTep,
		);
		expect(r.loi).toEqual(["no ve tay companies-page.tsx/bang: dau hieu la"]);
	});

	test("so-sai: so khong phai so nguyen duong thi do", () => {
		const d = dongBang();
		const r = phanTichNo(sua(d, d.replace('"so": 1', '"so": 0')), coTep);
		expect(r.loi).toEqual([
			"no ve tay companies-page.tsx/table: so khong phai so nguyen duong",
		]);
	});

	test("thieu-ly-do: ly_do rong thi do", () => {
		const d = dongBang();
		const r = phanTichNo(
			sua(d, d.replace(/"ly_do": "[^"]*"/, '"ly_do": ""')),
			coTep,
		);
		expect(r.loi).toEqual(["no ve tay companies-page.tsx/table: thieu ly do"]);
	});

	test("trung-cap: hai dong cung cap thi do", () => {
		const d = dongBang();
		const r = phanTichNo(sua(d, `${d},\n\t${d}`), coTep);
		expect(r.loi).toEqual(["no ve tay companies-page.tsx/table: trung cap"]);
	});
});
