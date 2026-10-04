import { describe, expect, test } from "bun:test";
import { luaChonPhuTrach } from "@/app/(app)/[slug]/okr/loc-okr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import type { RouterOutputs } from "@/lib/trpc/types";

const DEM = {
	phuTrach: [{ value: "u-a", name: "Trần An", count: 2 }],
	loai: [],
	trangThai: [],
	tuTin: [],
	gopY: [],
} satisfies RouterOutputs["okr"]["danhSach"]["facetCounts"];

const TEN = new Map([
	["u-a", "Trần An"],
	["u-b", "Lê Bình"],
]);

function khongLoMa(ds: { value: string; label: string }[]) {
	const lo = ds.filter((d) => d.label.includes(d.value));
	if (lo.length > 0)
		throw new Error(
			`nhan-phu-trach-lo-ma: ${lo.map((d) => d.label).join(" | ")}`,
		);
}

describe("loc-okr-ten", () => {
	const CA = [
		{
			ngonNgu: "vi",
			ra: [
				{ value: "u-a", label: "Trần An · 2" },
				{ value: "u-b", label: "Lê Bình · 0" },
				{ value: "u-x", label: "Người không còn trong tổ chức · 0" },
			],
		},
		{
			ngonNgu: "en",
			ra: [
				{ value: "u-a", label: "Trần An · 2" },
				{ value: "u-b", label: "Lê Bình · 0" },
				{ value: "u-x", label: "No longer in the organization · 0" },
			],
		},
	] as const;

	for (const ca of CA)
		test(`nguoi da chon khong khop hien ten, da roi hien nhan chung (${ca.ngonNgu})`, () => {
			const ra = luaChonPhuTrach(
				DEM.phuTrach,
				["u-a", "u-b", "u-x"],
				TEN,
				okrToanCanhMessages(ca.ngonNgu).loc.nguoiDaRoi,
			);
			khongLoMa(ra);
			expect(ra).toEqual([...ca.ra]);
		});

	test("danh sach chua tai van hien ten nguoi da chon", () => {
		const ra = luaChonPhuTrach(
			undefined,
			["u-b"],
			TEN,
			okrToanCanhMessages("vi").loc.nguoiDaRoi,
		);
		khongLoMa(ra);
		expect(ra).toEqual([{ value: "u-b", label: "Lê Bình · 0" }]);
	});
});
