import { describe, expect, it } from "bun:test";
import { MUC_CAI_DAT } from "@/lib/cai-dat-dieu-huong";
import { MUC_RAIL } from "@/lib/khung-dieu-huong";
import {
	dieuHuongTheoVai,
	mucCaiDatChoVai,
	mucRailChoVai,
} from "@/lib/pham-vi-man";

describe("pham vi man theo vai", () => {
	it("rail: okr hai muc, settings tro thang thong bao cua ban; vai khac du tam muc", () => {
		const okr = mucRailChoVai("okr");
		expect(okr.map((m) => m.key)).toEqual(["overview", "settings"]);
		expect(okr[1]?.href).toBe("/settings/notifications");
		expect(okr[1]?.related).toContain("/settings");
		expect(mucRailChoVai("member")).toBe(MUC_RAIL);
		expect(mucRailChoVai(null)).toBe(MUC_RAIL);
	});

	it("cai dat: okr hai muc ca nhan", () => {
		expect(mucCaiDatChoVai("okr").map((m) => m.khoa)).toEqual([
			"thongBaoCuaBan",
			"khoaApi",
		]);
		expect(mucCaiDatChoVai("admin")).toBe(MUC_CAI_DAT);
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
			toi: "/settings/notifications",
		});
		for (const p of [
			"/",
			"/settings/notifications",
			"/settings/api-keys",
			"/ngoai-pham-vi",
		]) {
			expect(dieuHuongTheoVai("okr", p), p).toBe("ok");
		}
		expect(dieuHuongTheoVai("member", "/contacts")).toBe("ok");
		expect(dieuHuongTheoVai(null, "/contacts")).toBe("ok");
		expect(dieuHuongTheoVai("khach", "/contacts")).toBe("ok");
	});
});
