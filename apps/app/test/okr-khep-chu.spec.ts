import { describe, expect, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import { CACH_DOC } from "@crm/validation/okr-khep";
import { MA_LUAT_OKR } from "@crm/validation/okr-kiem";
import { okrKhepMessages } from "@/lib/messages/okr-khep";

const LOCALE: readonly Locale[] = ["vi", "en"];
const CO_DAU = /[à-ỹđ]/i;

type Cau = (m: ReturnType<typeof okrKhepMessages>) => string | undefined;

const NHOM: readonly (readonly [
	string,
	readonly (readonly [string, Cau])[],
])[] = [
	[
		"luat",
		MA_LUAT_OKR.map(
			(ma) =>
				[ma, (m: ReturnType<typeof okrKhepMessages>) => m.luat[ma]] as const,
		),
	],
	[
		"cachDoc",
		CACH_DOC.map(
			(k) =>
				[k, (m: ReturnType<typeof okrKhepMessages>) => m.cachDoc[k]] as const,
		),
	],
	[
		"khongPhaiDanhGia",
		[["khongPhaiDanhGia", (m) => m.khongPhaiDanhGia.tieuDe] as const],
	],
];

describe("chu cua khep ky OKR", () => {
	for (const [nhom, cau] of NHOM) {
		test(`${nhom}: moi ma co cau vi va en`, () => {
			const thieu = LOCALE.flatMap((l) =>
				cau
					.filter(([, lay]) => {
						return (lay(okrKhepMessages(l)) ?? "").trim() === "";
					})
					.map(([ma]) => `${l}:${ma}`),
			);
			expect(thieu).toEqual([]);
		});

		test(`${nhom}: cau vi khac cau en`, () => {
			const vi = okrKhepMessages("vi");
			const en = okrKhepMessages("en");
			const trung = cau
				.filter(([, lay]) => lay(vi) === lay(en))
				.map(([ma]) => ma);
			expect(trung).toEqual([]);
		});

		test(`${nhom}: cau vi co dau`, () => {
			const vi = okrKhepMessages("vi");
			const khongDau = cau
				.filter(([, lay]) => !CO_DAU.test(lay(vi) ?? ""))
				.map(([ma]) => ma);
			expect(khongDau).toEqual([]);
		});
	}

	test("dai ra giu ngay duoc truyen vao o ca hai tieng", () => {
		for (const l of LOCALE) {
			expect(okrKhepMessages(l).dai.ra("22/11")).toContain("22/11");
		}
	});
});
