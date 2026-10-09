import { describe, expect, test } from "bun:test";
import {
	type OkrGopYMessages,
	okrGopYMessages,
} from "@/lib/messages/okr-gop-y";

type Cau = (m: OkrGopYMessages, n: string) => string;

const NAM_CAU = {
	soCho: (m, n) => m.vung.soCho(n),
	lyDo: (m, n) => m.vung.lyDo(n),
	chip: (m, n) => m.chip(n),
	chipAria: (m, n) => m.chipAria(n, "Giữ chân khách miền Bắc"),
	coCho: (m, n) => m.loc.coCho(n),
} satisfies Record<string, Cau>;
type Khoa = keyof typeof NAM_CAU;
const KHOA = Object.keys(NAM_CAU) as Khoa[];

const TU_SO_NHIEU = {
	soCho: "suggestions",
	lyDo: "KRs",
	chip: "suggestions",
	chipAria: "suggestions",
	coCho: "suggestions",
} satisfies Record<Khoa, string>;

const VI_C1067C16 = {
	soCho: ["1 góp ý chờ", "2 góp ý chờ"],
	lyDo: [
		"Kara đọc tên, «vì sao lúc này» và 1 KR của Mục tiêu này. Kara chỉ đọc dữ liệu OKR.",
		"Kara đọc tên, «vì sao lúc này» và 2 KR của Mục tiêu này. Kara chỉ đọc dữ liệu OKR.",
	],
	chip: ["1 góp ý", "2 góp ý"],
	chipAria: [
		"Kara có 1 góp ý chờ cho «Giữ chân khách miền Bắc», mở khung chi tiết",
		"Kara có 2 góp ý chờ cho «Giữ chân khách miền Bắc», mở khung chi tiết",
	],
	coCho: ["Có góp ý chờ · 1", "Có góp ý chờ · 2"],
} satisfies Record<Khoa, [string, string]>;

function soNhieuSai(m: OkrGopYMessages): string | null {
	for (const khoa of KHOA) {
		const tu = new RegExp(`\\b${TU_SO_NHIEU[khoa]}\\b`);
		if (tu.test(NAM_CAU[khoa](m, "1")) || !tu.test(NAM_CAU[khoa](m, "2")))
			return `so nhieu sai: ${khoa}`;
	}
	return null;
}

const EN = okrGopYMessages("en");
const EN_CU: OkrGopYMessages = {
	...EN,
	vung: {
		...EN.vung,
		soCho: (n) => `${n} suggestions waiting`,
		lyDo: (soKr) =>
			`Kara read the title, “why now” and ${soKr} KRs of this objective. Kara reads OKR data only.`,
	},
	chip: (n) => `${n} suggestions`,
	chipAria: (n, ten) =>
		`Kara has ${n} suggestions waiting for “${ten}”, open details`,
	loc: { ...EN.loc, coCho: (n) => `Has suggestions waiting · ${n}` },
};

describe("k3-so-nhieu", () => {
	test("k3-so-nhieu 5 cau x 2 so o en: so it khi 1, so nhieu khi 2", () => {
		expect(KHOA.length * 2).toBe(10);
		expect(soNhieuSai(EN)).toBeNull();
	});

	test("k3-so-nhieu ban vi cua 5 cau voi 1 va 2 giu nguyen nhu c1067c16", () => {
		const vi = okrGopYMessages("vi");
		for (const khoa of KHOA)
			expect([NAM_CAU[khoa](vi, "1"), NAM_CAU[khoa](vi, "2")]).toEqual(
				VI_C1067C16[khoa],
			);
	});

	test("k3-so-nhieu chieu do: ban en cu khong tach so it bi bat", () => {
		expect(soNhieuSai(EN_CU)).toBe("so nhieu sai: soCho");
	});
});
