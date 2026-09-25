import { describe, expect, mock, test } from "bun:test";
import { NHOM_CAI_DAT } from "@/lib/cai-dat-dieu-huong";

class ChuyenHuongKtcd extends Error {
	constructor(readonly dich: string) {
		super(dich);
	}
}

const dieuHuongThat = await import("next/navigation");
mock.module("next/navigation", () => ({
	...dieuHuongThat,
	redirect: (dich: string) => {
		throw new ChuyenHuongKtcd(dich);
	},
}));

const { default: TrangCu } = await import(
	"@/app/(app)/[slug]/settings/notifications/page"
);

import { settingsMessages } from "@/lib/messages/settings";

const TEN_NHOM = {
	vi: ["Không gian làm việc", "Con người", "Kết nối và dữ liệu", "Bảo mật"],
	en: ["Workspace", "People", "Connections & data", "Security"],
} as const;

describe("khung-trang-cai-dat", () => {
	test("nhan: thanh ben la Cai dat, muc dau va trang dau la Chung", () => {
		const vi = settingsMessages("vi");
		const en = settingsMessages("en");
		expect(vi.thanhBen.nhan).toBe("Cài đặt");
		expect(en.thanhBen.nhan).toBe("Settings");
		for (const [t, mong] of [
			[vi, "Chung"],
			[en, "General"],
		] as const) {
			expect(t.thanhBen.chung).toBe(mong);
			expect(t.chung.tieuDe).toBe(mong);
			expect(t.tieuDeTab.chung).toBe(mong);
		}
		expect(vi.congTy.tieuDe).toBe("Không gian làm việc");
		expect(en.congTy.tieuDe).toBe("Workspace");
		expect(vi.chung.moTa).toContain("OneHub");
		expect(vi.chung.moTa).not.toContain("Công ty bạn");
	});

	test("nhan: ten bon nhom dung ca hai tieng", () => {
		for (const locale of ["vi", "en"] as const) {
			const t = settingsMessages(locale);
			expect(
				NHOM_CAI_DAT.map((n) => t.nhomThanhBen[n.khoa]),
				`${locale}: ten nhom lech`,
			).toEqual([...TEN_NHOM[locale]]);
		}
	});

	test("nhan: khong con chu cu trong tep chu Cai dat", () => {
		const toanBo = JSON.stringify(settingsMessages("vi"));
		for (const cu of ["Tổng quan", "Cài đặt công ty", ':"Công ty"']) {
			expect(toanBo.includes(cu), `vi: con chu cu ${cu}`).toBe(false);
		}
	});

	test("chuyen-huong: duong cu chuyen toi reminders dung slug", async () => {
		for (const slug of ["ws", "cong-ty-a"]) {
			const ket = await TrangCu({ params: Promise.resolve({ slug }) }).then(
				() => "khong-nem",
				(e: Error) =>
					e instanceof ChuyenHuongKtcd ? e.dich : `loi-khac: ${e.message}`,
			);
			expect(ket, `${slug}: trang cu ve noi dung truoc khi chuyen`).not.toBe(
				"khong-nem",
			);
			expect(ket, `${slug}: digest khong chua /${slug}/reminders`).toBe(
				`/${slug}/reminders`,
			);
		}
	});
});
