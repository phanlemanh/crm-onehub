import { describe, expect, test } from "bun:test";
import {
	loadOkrSearchParams,
	locOkr,
} from "@/app/(app)/[slug]/okr/okr-search-params";
import { locDanhSach } from "../../api/src/okr/okr-xem.contracts";

const MAT_API = Object.keys(locDanhSach.shape).sort();

function duMat(loc: ReturnType<typeof locOkr>) {
	const co = Object.keys(loc).sort();
	const thieu = MAT_API.filter((m) => !co.includes(m));
	const thua = co.filter((m) => !MAT_API.includes(m));
	if (thieu.length > 0 || thua.length > 0)
		throw new Error(
			`loc-tai-truoc-thieu-mat: thieu [${thieu.join(", ")}] thua [${thua.join(", ")}]`,
		);
}

describe("loc-okr-tai-truoc", () => {
	test("locOkr tra dung tap mat loc API nhan", () => {
		duMat(locOkr(loadOkrSearchParams(new URLSearchParams())));
	});

	const CA: { ten: string; q: string; ra: ReturnType<typeof locOkr> }[] = [
		{
			ten: "khong-loc",
			q: "",
			ra: { phuTrach: [], loai: [], trangThai: [], tuTin: [], gopY: [] },
		},
		{
			ten: "chi-tu-tin",
			q: "tuTinOkr=thap",
			ra: { phuTrach: [], loai: [], trangThai: [], tuTin: ["thap"], gopY: [] },
		},
		{
			ten: "du-bon-mat",
			q: "phuTrachOkr=u-a&loaiOkr=cam-ket&trangThaiOkr=cong-bo&tuTinOkr=thap,cao",
			ra: {
				phuTrach: ["u-a"],
				loai: ["cam-ket"],
				trangThai: ["cong-bo"],
				tuTin: ["thap", "cao"],
				gopY: [],
			},
		},
	];

	for (const ca of CA)
		test(`ma tran URL ${ca.ten}`, () => {
			const loc = locOkr(loadOkrSearchParams(new URLSearchParams(ca.q)));
			duMat(loc);
			expect(loc).toEqual(ca.ra);
			expect(locDanhSach.parse(loc)).toEqual(loc);
		});
});
