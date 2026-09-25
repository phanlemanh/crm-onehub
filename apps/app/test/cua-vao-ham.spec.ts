import { describe, expect, it } from "bun:test";
import {
	buocLanDau,
	chonCua,
	type SignInOptions,
} from "@/lib/cua-vao/chon-cua";
import { type LoaiLoi, phanLoaiLoiDangNhap } from "@/lib/cua-vao/loi-dang-nhap";
import { cuaVaoMessages } from "@/lib/messages/cua-vao";

const m = cuaVaoMessages("vi");
const TEN = { google: "Google", microsoft: "Microsoft" } as const;
const tenHang = (p: keyof typeof TEN) => TEN[p];
const CHU = {
	duongChoPhep: "Cài đặt › Thành viên › Cho phép một địa chỉ",
	duongPhatLienKet: "Cài đặt › Thành viên",
	phut: 60,
};

const GOOGLE = {
	google: true,
	microsoft: false,
	providers: [],
} satisfies SignInOptions;

describe("phanLoaiLoiDangNhap", () => {
	const MA_TRAN: [string | string[] | undefined, LoaiLoi | null][] = [
		[undefined, null],
		["", null],
		[[], null],
		[
			"This_CRM_is_private._Sign_in_with_your_@onemount.com_account.",
			"chua-cho-phep",
		],
		[
			"This_CRM_is_private._That_address_is_not_on_the_allow-list.",
			"chua-cho-phep",
		],
		["access_denied", "da-huy"],
		["access_denied ", "chung"],
		["xaccess_denied", "chung"],
		["invalid_code", "chung"],
		["<script>alert(1)</script>", "chung"],
		[["access_denied", "invalid_code"], "da-huy"],
		[["", "access_denied"], null],
	];

	for (const [vao, ra] of MA_TRAN) {
		it(`${JSON.stringify(vao)} -> ${ra}`, () => {
			expect(phanLoaiLoiDangNhap(vao)).toBe(ra);
		});
	}
});

describe("chonCua", () => {
	it("google bat: chi nut google", () => {
		expect(chonCua(GOOGLE, undefined)).toEqual({
			social: ["google"],
			sso: [],
		});
	});

	it("options null giong google bat", () => {
		expect(chonCua(null, undefined)).toEqual(chonCua(GOOGLE, undefined));
	});

	it("method ep mot cua khi hai cua bat", () => {
		const hai = { ...GOOGLE, microsoft: true };
		expect(chonCua(hai, "google").social).toEqual(["google"]);
		expect(chonCua(hai, ["microsoft", "google"]).social).toEqual(["microsoft"]);
	});

	it("co sso thi chi sso, tru khi method ep", () => {
		const sso = {
			...GOOGLE,
			providers: [{ providerId: "onehub", name: "OneHub" }],
		};
		expect(chonCua(sso, undefined)).toEqual({
			social: [],
			sso: sso.providers,
		});
		expect(chonCua(sso, "google")).toEqual({ social: ["google"], sso: [] });
	});

	it("chi mat khau: khong cua nao", () => {
		expect(chonCua({ ...GOOGLE, google: false }, undefined)).toEqual({
			social: [],
			sso: [],
		});
	});
});

describe("buocLanDau", () => {
	it("google bat: ba buoc, buoc 2 goi Google, buoc 3 noi so phut", () => {
		const buoc = buocLanDau(chonCua(GOOGLE, undefined), CHU, m, tenHang);
		expect(buoc.map((b) => b.tieuDe)).toEqual([
			m.buoc.choPhep.tieuDe,
			m.buoc.nutNgoai.tieuDe("Google"),
			m.buoc.matKhauPhu.tieuDe,
		]);
		expect(buoc[0]?.moTa).toBe(m.buoc.choPhep.moTa(CHU.duongChoPhep));
		expect(buoc[2]?.moTa).toBe(
			m.buoc.matKhauPhu.moTa(CHU.duongPhatLienKet, CHU.phut),
		);
		expect(buoc[2]?.moTa).toContain("60 phút");
	});

	it("chi mat khau: hai buoc, buoc mat khau la duong chinh", () => {
		const buoc = buocLanDau(
			chonCua({ ...GOOGLE, google: false }, undefined),
			CHU,
			m,
			tenHang,
		);
		expect(buoc.map((b) => b.tieuDe)).toEqual([
			m.buoc.choPhep.tieuDe,
			m.buoc.matKhauChinh.tieuDe,
		]);
	});

	it("sso: buoc 2 goi ten sso", () => {
		const cua = chonCua(
			{ ...GOOGLE, providers: [{ providerId: "okta", name: "Okta" }] },
			undefined,
		);
		expect(buocLanDau(cua, CHU, m, tenHang)[1]?.tieuDe).toBe(
			m.buoc.nutNgoai.tieuDe("Okta"),
		);
	});
});
