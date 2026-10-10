import { describe, expect, it } from "bun:test";
import { MUC_CAI_DAT, NHOM_CAI_DAT } from "@/lib/cai-dat-dieu-huong";
import { MUC_RAIL } from "@/lib/khung-dieu-huong";
import {
	dieuHuongTheoVai,
	mucCaiDatChoVai,
	mucRailChoVai,
	nhomCaiDatChoVai,
} from "@/lib/pham-vi-man";

describe("pham vi man theo vai", () => {
	it("rail: okr nam muc gom tai lieu va lo trinh, settings tro thang khoa api; vai khac du muc", () => {
		const okr = mucRailChoVai("okr");
		expect(okr.map((m) => m.key)).toEqual([
			"overview",
			"okr",
			"taiLieu",
			"loTrinh",
			"settings",
		]);
		expect(okr[4]?.href).toBe("/settings/api-keys");
		expect(okr[4]?.related).toContain("/settings");
		expect(mucRailChoVai("member")).toBe(MUC_RAIL);
		expect(mucRailChoVai(null)).toBe(MUC_RAIL);
	});

	it("cai dat: okr mot muc khoa api, mot nhom bao mat", () => {
		expect(mucCaiDatChoVai("okr").map((m) => m.khoa)).toEqual(["khoaApi"]);
		expect(mucCaiDatChoVai("admin")).toBe(MUC_CAI_DAT);
		expect(
			nhomCaiDatChoVai("okr").map((n) => [n.khoa, n.muc.map((m) => m.khoa)]),
		).toEqual([["baoMat", ["khoaApi"]]]);
		expect(nhomCaiDatChoVai("member")).toBe(NHOM_CAI_DAT);
		expect(nhomCaiDatChoVai(null)).toBe(NHOM_CAI_DAT);
	});

	it("dieu huong: okr bi dua ve ngoai pham vi o khu doi tac va cai dat quan tri", () => {
		for (const p of [
			"/contacts",
			"/deals/abc",
			"/companies",
			"/campaigns/x",
			"/onboarding",
			"/chat/1",
			"/agents",
			"/settings/members",
			"/settings/organization",
			"/settings/tracking",
			"/settings",
		]) {
			expect(dieuHuongTheoVai("okr", p), p).not.toBe("ok");
		}
		expect(dieuHuongTheoVai("okr", "/contacts")).toEqual({
			toi: "/ngoai-pham-vi",
		});
		expect(dieuHuongTheoVai("okr", "/settings")).toEqual({
			toi: "/settings/api-keys",
		});
		for (const p of [
			"/",
			"/settings/notifications",
			"/settings/api-keys",
			"/ngoai-pham-vi",
			"/okr",
			"/okr/theo-don-vi",
		]) {
			expect(dieuHuongTheoVai("okr", p), p).toBe("ok");
		}
		expect(dieuHuongTheoVai("member", "/contacts")).toBe("ok");
		expect(dieuHuongTheoVai(null, "/contacts")).toBe("ok");
		expect(dieuHuongTheoVai("khach", "/contacts")).toBe("ok");
	});

	it("lo-trinh: chi OKR va du quyen deu thay va mo duoc trang Lo trinh", () => {
		for (const vai of ["okr", "member", "admin", null]) {
			expect(
				mucRailChoVai(vai).some((m) => m.key === "loTrinh"),
				"vai chi OKR khong thay Lo trinh",
			).toBe(true);
			expect(dieuHuongTheoVai(vai, "/lo-trinh"), String(vai)).toBe("ok");
		}
		expect(dieuHuongTheoVai("okr", "/deals")).toEqual({
			toi: "/ngoai-pham-vi",
		});
	});
});
