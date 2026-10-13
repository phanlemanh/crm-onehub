import { describe, expect, test } from "bun:test";
import { docDuocDoiTac as docDuocDoiTacDb } from "@crm/db/vai-doi-tac";
import {
	docDuocDoiTac,
	docDuocPhamVi,
	KHONG_TRONG_PHAM_VI,
	laVaiChiOkr,
	PHAM_VI_DU_LIEU,
	toWorkspaceRole,
	WORKSPACE_ROLES,
} from "../src/vai-workspace";

describe("vai-workspace", () => {
	test("okr la vai thu tu, khong bi ha ve member", () => {
		expect(WORKSPACE_ROLES).toEqual(["owner", "admin", "member", "okr"]);
		expect(toWorkspaceRole("okr")).toBe("okr");
		expect(toWorkspaceRole("la")).toBe("member");
		expect(laVaiChiOkr("okr")).toBe(true);
		expect(laVaiChiOkr("member")).toBe(false);
		expect(laVaiChiOkr(null)).toBe(false);
	});

	test("bang doc: okr doc okr/chung/to-chuc, khong doc doi-tac va chua khai", () => {
		expect(PHAM_VI_DU_LIEU).toEqual(["doi-tac", "to-chuc", "okr", "chung"]);
		expect(docDuocPhamVi("okr", "okr")).toBe(true);
		expect(docDuocPhamVi("okr", "chung")).toBe(true);
		expect(docDuocPhamVi("okr", "to-chuc")).toBe(true);
		expect(docDuocPhamVi("okr", "doi-tac")).toBe(false);
		expect(docDuocPhamVi("okr", null)).toBe(false);
		for (const vai of ["owner", "admin", "member"] as const) {
			for (const pv of [...PHAM_VI_DU_LIEU, null]) {
				expect(docDuocPhamVi(vai, pv), `${vai} ${pv}`).toBe(true);
			}
		}
		for (const pv of [...PHAM_VI_DU_LIEU, null]) {
			expect(docDuocPhamVi(null, pv)).toBe(false);
		}
	});

	test("thong diep tu choi la mot hang co ten", () => {
		expect(KHONG_TRONG_PHAM_VI).toMatch(/role/);
	});
});

describe("docDuocDoiTac", () => {
	test("docDuocDoiTac: ba vai thường đọc được, vai okr không, vai lạ đọc như member", () => {
		const ket = ["owner", "admin", "member", "okr", "Member", "khach"].map(
			(vai) => `${vai}=${docDuocDoiTac(vai)}`,
		);
		expect(ket).toEqual([
			"owner=true",
			"admin=true",
			"member=true",
			"okr=false",
			"Member=true",
			"khach=true",
		]);
	});
});

describe("docDuocDoiTac khớp bản soi của db", () => {
	test("docDuocDoiTac của @crm/db/vai-doi-tac khớp luật validation cho mọi vai, kể cả vai lạ", () => {
		const lech = [...WORKSPACE_ROLES, "Member", "khach", ""].filter(
			(vai) => docDuocDoiTacDb(vai) !== docDuocDoiTac(vai),
		);
		if (lech.length > 0) {
			throw new Error(`vlr: ban soi db lech luat validation ${lech.join(",")}`);
		}
	});
});
