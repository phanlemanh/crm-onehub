import { describe, expect, test } from "bun:test";
import {
	huy,
	luongXoaMoi,
	moHoi,
	xacNhan,
} from "@/app/(app)/[slug]/onboarding/luong-xoa";
import {
	danhMucSearchParams,
	loadOnboardingSearchParams,
	ONBOARDING_TRANG_THAI,
	onboardingParsers,
} from "@/app/(app)/[slug]/onboarding/onboarding-search-params";
import { onboardingMessages } from "@/lib/messages/onboarding";
import {
	assertUnreservedSearchParamKeys,
	SEARCH_PARAM,
} from "@/lib/search-param-keys";

describe("bo-loc-duong-dan", () => {
	test("bo-loc-duong-dan: hai khoa loc co ten rieng trong so dang ky", () => {
		expect(SEARCH_PARAM.onboarding.trangThai).toBe("trangThai");
		expect(Object.keys(onboardingParsers).sort()).toEqual(
			[
				SEARCH_PARAM.onboarding.trangThai,
				SEARCH_PARAM.onboarding.cachXem,
				SEARCH_PARAM.onboarding.cachChia,
			].sort(),
		);
		expect(Object.keys(danhMucSearchParams.parsers)).toContain("boPhan");
	});

	test("bo-loc-duong-dan: doc tu duong dan co tham so thi giu nguyen bo loc", async () => {
		const duongDan = new URLSearchParams("boPhan=dep-1&trangThai=da-dong");

		expect((await danhMucSearchParams.load(duongDan)).boPhan).toEqual([
			"dep-1",
		]);
		expect((await loadOnboardingSearchParams(duongDan)).trangThai).toBe(
			"da-dong",
		);
	});

	test("bo-loc-duong-dan: duong dan TRAN tra ve khong loc", async () => {
		const tran = new URLSearchParams("");

		expect((await danhMucSearchParams.load(tran)).boPhan).toEqual([]);
		expect((await loadOnboardingSearchParams(tran)).trangThai).toBe(
			"dang-chay",
		);
	});

	test("bo-loc-duong-dan: gia tri la khong hop le thi ve mac dinh, khong nem", () => {
		const trangThai = onboardingParsers[SEARCH_PARAM.onboarding.trangThai];
		expect(trangThai.parse("khong-co-thu-nay")).toBeNull();
		expect(ONBOARDING_TRANG_THAI).toEqual(["dang-chay", "da-dong"]);
	});

	test("bo-loc-duong-dan: khong dung nham khoa cua tinh nang khac", () => {
		expect(() =>
			assertUnreservedSearchParamKeys(["q", "page"], "onboarding"),
		).toThrow();
	});
});

describe("thong diep man danh muc", () => {
	test("hai thu tieng deu co du khoa, khong thieu ben nao", () => {
		const vi = onboardingMessages("vi");
		const en = onboardingMessages("en");

		expect(Object.keys(vi.columns).sort()).toEqual(
			Object.keys(en.columns).sort(),
		);
		expect(vi.empty.noTemplate.title).not.toBe(en.empty.noTemplate.title);
		expect(vi.empty.noTemplate.action).toContain("Cài đặt");
	});

	test("trang thai rong va trang thai chua-co-khuon la HAI thong diep khac nhau", () => {
		const vi = onboardingMessages("vi");
		expect(vi.empty.noPlan.title).not.toBe(vi.empty.noTemplate.title);
		expect(vi.empty.noPlan.body).not.toBe(vi.empty.noTemplate.body);
		expect(vi.empty.noPlan.action).not.toBe(vi.empty.noTemplate.action);
	});
});

describe("xoa-co-xac-nhan", () => {
	test("xoa-co-xac-nhan: cu bam dau tien chi mo hop thoai, chua goi xoa", () => {
		let daGoi = 0;
		const xoa = () => {
			daGoi += 1;
		};

		let luong = luongXoaMoi<string>();
		luong = moHoi(luong, "ghi-danh-1");

		expect(luong.dangHoi).toBe("ghi-danh-1");
		expect(daGoi).toBe(0);

		luong = xacNhan(luong, xoa);
		expect(daGoi).toBe(1);
		expect(luong.dangHoi).toBeNull();
		expect(luong.soLanGoiXoa).toBe(1);
	});

	test("xoa-co-xac-nhan: bam huy thi ham xoa KHONG bao gio duoc goi", () => {
		let daGoi = 0;
		const xoa = () => {
			daGoi += 1;
		};

		let luong = luongXoaMoi<string>();
		luong = moHoi(luong, "ghi-danh-1");
		luong = huy(luong);

		expect(luong.dangHoi).toBeNull();
		expect(daGoi).toBe(0);

		luong = xacNhan(luong, xoa);
		expect(daGoi).toBe(0);
		expect(luong.soLanGoiXoa).toBe(0);
	});

	test("xoa-co-xac-nhan: xac nhan khi chua mo hoi thi khong xoa gi", () => {
		let daGoi = 0;
		const luong = xacNhan(luongXoaMoi<string>(), () => {
			daGoi += 1;
		});

		expect(daGoi).toBe(0);
		expect(luong.soLanGoiXoa).toBe(0);
	});
});
