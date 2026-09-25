import { describe, expect, test } from "bun:test";
import { NHOM_CAI_DAT } from "@/lib/cai-dat-dieu-huong";
import { settingsMessages } from "@/lib/messages/settings";

const TEN_NHOM = {
	vi: ["Không gian làm việc", "Con người", "Kết nối và dữ liệu", "Bảo mật"],
	en: ["Workspace", "People", "Connections & data", "Security"],
} as const;

function moiChuoi(gia: unknown): string[] {
	if (typeof gia === "string") return [gia];
	if (typeof gia === "function") return [];
	if (gia && typeof gia === "object")
		return Object.values(gia).flatMap(moiChuoi);
	return [];
}

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
		const chuoi = moiChuoi(settingsMessages("vi"));
		const sai = chuoi.filter(
			(c) =>
				c.includes("Tổng quan") ||
				c.includes("Cài đặt công ty") ||
				c === "Công ty",
		);
		expect(sai, `vi: con chu cu ${JSON.stringify(sai)}`).toEqual([]);
	});

	test("chuyen-huong: duong cu chuyen toi reminders dung slug", async () => {
		const { default: TrangCu } = await import(
			"@/app/(app)/[slug]/settings/notifications/page"
		);
		for (const slug of ["ws", "cong-ty-a"]) {
			let loi: unknown = null;
			let traVe: unknown = "chua-goi";
			try {
				traVe = await TrangCu({ params: Promise.resolve({ slug }) });
			} catch (e) {
				loi = e;
			}
			const digest =
				loi instanceof Error && "digest" in loi ? String(loi.digest) : "";
			expect(digest, `${slug}: digest khong chua /${slug}/reminders`).toContain(
				`;/${slug}/reminders;`,
			);
			expect(traVe, `${slug}: trang cu ve noi dung truoc khi chuyen`).toBe(
				"chua-goi",
			);
		}
	});
});
