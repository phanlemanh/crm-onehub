import { describe, expect, test } from "bun:test";
import { parseDealListResult } from "../src/deal-list";

const thoaThuan = (them: { stageId?: string | number }) => ({
	id: "d1",
	name: "d1",
	stage: "Discovery",
	amount: null,
	currency: "USD",
	company: { id: "c1", name: "Acme" },
	owner: null,
	daysSinceLastActivity: 3,
	expectedCloseDate: null,
	...them,
});

const ketQua = (deals: ReturnType<typeof thoaThuan>[]) => ({
	asOf: "2026-08-07T00:00:00.000Z",
	criteria: {
		status: "open",
		inactiveForDays: null,
		companyId: null,
		ownerId: null,
	},
	deals,
});

describe("parseDealListResult", () => {
	test("giu stageId co mat", () => {
		const ra = parseDealListResult(ketQua([thoaThuan({ stageId: "gd-1" })]));
		expect(ra?.deals[0]?.stageId).toBe("gd-1");
	});

	test("ban ghi cu khong stageId van doc duoc", () => {
		const ra = parseDealListResult(ketQua([thoaThuan({}), thoaThuan({})]));
		expect(ra === null, "ban ghi cu roi ca bang").toBe(false);
		expect(ra?.deals.length).toBe(2);
		expect(ra?.deals[0]?.stageId).toBe(null);
	});

	test("stageId sai kieu thanh null", () => {
		const ra = parseDealListResult(ketQua([thoaThuan({ stageId: 7 })]));
		expect(ra === null, "ban ghi cu roi ca bang").toBe(false);
		expect(ra?.deals[0]?.stageId).toBe(null);
	});

	test("sai hinh tra null", () => {
		const { deals: _bo, ...thieu } = ketQua([]);
		expect(parseDealListResult(thieu)).toBe(null);
	});
});
