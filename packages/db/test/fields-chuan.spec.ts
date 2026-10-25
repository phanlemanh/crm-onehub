import { describe, expect, it } from "bun:test";
import {
	type HangChuan,
	type MucBoTri,
	REQUIRED_STANDARD_KEYS,
	STANDARD_FIELD_KEYS,
	sapBoTri,
} from "../src/fields-chuan";

const DAP_AN_KHOA = {
	DEAL: ["name", "amount", "currency", "expectedCloseDate", "company", "owner"],
	COMPANY: [
		"name",
		"domain",
		"website",
		"phone",
		"email",
		"city",
		"country",
		"owner",
	],
	CONTACT: [
		"firstName",
		"lastName",
		"title",
		"email",
		"phone",
		"linkedin",
		"x",
		"github",
		"company",
		"owner",
	],
};

const DAP_AN_BAT_BUOC = {
	DEAL: ["name", "currency", "company", "owner"],
	COMPANY: ["name"],
	CONTACT: ["firstName"],
};

const khoa = (muc: MucBoTri[]) =>
	muc.map((m) => (m.kind === "standard" ? m.key : `+${m.key}`));

const hangTheoThuTu = (dsKhoa: readonly string[]): HangChuan[] =>
	dsKhoa.map((key, position) => ({ key, position, hidden: false }));

describe("fields-chuan", () => {
	it("danh mục đúng 24 khoá theo thứ tự đã khai", () => {
		expect(STANDARD_FIELD_KEYS).toEqual(DAP_AN_KHOA);
		expect(Object.values(STANDARD_FIELD_KEYS).flat()).toHaveLength(24);
	});

	it("chưa có hàng bố trí: trường chuẩn theo danh mục rồi trường tự tạo", () => {
		const muc = sapBoTri(
			"DEAL",
			[],
			[
				{ id: "b", key: "hang_b", position: 1 },
				{ id: "a", key: "hang_a", position: 0 },
			],
		);
		expect(khoa(muc)).toEqual([...DAP_AN_KHOA.DEAL, "+hang_a", "+hang_b"]);
	});

	it("đã sắp: trường tự tạo chen giữa trường chuẩn", () => {
		const hang = hangTheoThuTu([
			"name",
			"amount",
			"currency",
			"__",
			"expectedCloseDate",
			"company",
			"owner",
		]).filter((h) => h.key !== "__");
		const muc = sapBoTri("DEAL", hang, [
			{ id: "a", key: "hang_doi_tac", position: 3 },
		]);
		expect(khoa(muc)).toEqual([
			"name",
			"amount",
			"currency",
			"+hang_doi_tac",
			"expectedCloseDate",
			"company",
			"owner",
		]);
	});

	it("hoà số: trường chuẩn đứng trước trường tự tạo", () => {
		const hang = hangTheoThuTu(DAP_AN_KHOA.COMPANY);
		const muc = sapBoTri("COMPANY", hang, [
			{ id: "a", key: "khoi_phuc", position: 2 },
		]);
		expect(khoa(muc).slice(2, 4)).toEqual(["website", "+khoi_phuc"]);
	});

	it("khoá chuẩn chưa có hàng đứng ngay sau khoá chuẩn liền trước", () => {
		const hang = hangTheoThuTu(DAP_AN_KHOA.CONTACT.filter((k) => k !== "x"));
		const muc = sapBoTri("CONTACT", hang, [
			{ id: "a", key: "so_thich", position: 6 },
		]);
		const ds = khoa(muc);
		expect(ds.indexOf("x")).toBe(ds.indexOf("linkedin") + 1);
	});

	it("mục chuẩn mang required đúng tập bắt buộc", () => {
		expect(REQUIRED_STANDARD_KEYS).toEqual(DAP_AN_BAT_BUOC);
		for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
			const batBuoc = sapBoTri(entity, [], [])
				.filter((m) => m.kind === "standard" && m.required)
				.map((m) => m.key);
			expect(batBuoc).toEqual(DAP_AN_BAT_BUOC[entity]);
		}
	});
});
