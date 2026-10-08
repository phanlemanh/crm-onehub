import { readFileSync } from "node:fs";
import { describe, expect, it } from "bun:test";
import { companiesSearchParams } from "@/app/(app)/[slug]/companies/companies-search-params";
import { contactsSearchParams } from "@/app/(app)/[slug]/contacts/contacts-search-params";
import { dealsSearchParams } from "@/app/(app)/[slug]/deals/deals-search-params";
import { membersSearchParams } from "@/app/(app)/[slug]/settings/members/members-search-params";
import {
	assertUnreservedSearchParamKeys,
	RESERVED_SEARCH_PARAM_KEYS,
	SEARCH_PARAM,
} from "./search-param-keys";

const registeredKeys = Object.values(SEARCH_PARAM).flatMap((group) =>
	Object.values(group),
);

describe("SEARCH_PARAM", () => {
	it("gives every feature its own url key", () => {
		expect(registeredKeys.length).toBe(RESERVED_SEARCH_PARAM_KEYS.size);
	});

	it("keeps the fields sheet off the table's fields filter", () => {
		expect(SEARCH_PARAM.fieldsSheet.entity).not.toBe(SEARCH_PARAM.list.fields);
	});

	it("keeps the fields page off every key the sheet owns", () => {
		const sheet = Object.values(SEARCH_PARAM.fieldsSheet);
		const page = Object.values(SEARCH_PARAM.fieldsPage);

		for (const key of page) {
			expect(sheet).not.toContain(key);
		}
		expect(page).toHaveLength(2);
	});

	it("reserves every key the fields page owns", () => {
		for (const key of Object.values(SEARCH_PARAM.fieldsPage)) {
			expect(RESERVED_SEARCH_PARAM_KEYS.has(key)).toBe(true);
		}
	});
});

describe("assertUnreservedSearchParamKeys", () => {
	it("accepts keys no other feature owns", () => {
		expect(() =>
			assertUnreservedSearchParamKeys(["owner", "industry"], "test"),
		).not.toThrow();
	});

	it("rejects a facet that shadows a reserved key", () => {
		expect(() =>
			assertUnreservedSearchParamKeys(
				["owner", SEARCH_PARAM.dialog.closeDeal],
				"test",
			),
		).toThrow(/closeDeal/);
	});

	it("rejects a facet that shadows a list key", () => {
		expect(() => assertUnreservedSearchParamKeys(["q"], "test")).toThrow(/q/);
	});

	it("rejects the fields page reusing a key the sheet owns", () => {
		expect(() =>
			assertUnreservedSearchParamKeys(
				[SEARCH_PARAM.fieldsSheet.entity],
				"fields-page",
			),
		).toThrow(SEARCH_PARAM.fieldsSheet.entity);
	});
});

describe("list tables", () => {
	it("builds every table without a key collision", () => {
		for (const table of [
			companiesSearchParams,
			contactsSearchParams,
			dealsSearchParams,
			membersSearchParams,
		]) {
			expect(Object.keys(table.parsers)).toContain(SEARCH_PARAM.list.fields);
		}
	});
	it("trang soạn đọc khoá đã đăng ký", () => {
		expect(SEARCH_PARAM.okr.tabSoan).toBe("tabSoan");
		expect(SEARCH_PARAM.okr.locSoan).toBe("locSoan");
		expect(RESERVED_SEARCH_PARAM_KEYS.has(SEARCH_PARAM.okr.tabSoan)).toBe(true);
		expect(RESERVED_SEARCH_PARAM_KEYS.has(SEARCH_PARAM.okr.locSoan)).toBe(true);
		const cauHinh = readFileSync(
			new URL("../app/(app)/[slug]/okr/soan/cau-hinh.ts", import.meta.url),
			"utf8",
		);
		expect(cauHinh.includes("thamSo")).toBe(false);
	});
});
