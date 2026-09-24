import { describe, expect, test } from "bun:test";

const { onboardingMessages } = await import("@/lib/messages/onboarding");

function moiChuoi(o: unknown, duong = ""): [string, string][] {
	if (typeof o === "string") return [[duong, o]];
	if (o && typeof o === "object") {
		return Object.entries(o).flatMap(([k, v]) =>
			moiChuoi(v, duong ? `${duong}.${k}` : k),
		);
	}
	return [];
}

describe("nhan-dieu-phoi", () => {
	test("nhan-dieu-phoi: chu cap duoi la phong ban, bo loc cap tren la Bo phan", () => {
		const m = onboardingMessages("vi");
		expect([
			m.columns.department,
			m.facets.department,
			m.chia["bo-phan"],
			m.tao.khuon.stepDepartment,
		]).toEqual(["Phòng ban", "Phòng ban đang cầm", "Phòng ban", "Phòng ban"]);
		expect(m.facets.division).toBe("Bộ phận");
		const viPham = moiChuoi(m)
			.filter(([duong]) => duong !== "facets.division")
			.filter(([, chu]) => /bộ phận/i.test(chu));
		expect(viPham.map(([d]) => d)).toEqual([]);
	});
});

describe("thoi-luong", () => {
	test("thoi-luong: o so ngay mang nhan Thoi luong / Duration", () => {
		expect(onboardingMessages("vi").sheet.fields.target).toBe("Thời lượng");
		expect(onboardingMessages("en").sheet.fields.target).toBe("Duration");
	});
});
