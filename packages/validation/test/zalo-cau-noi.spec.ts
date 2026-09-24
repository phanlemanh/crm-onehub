import { describe, expect, test } from "bun:test";
import {
	datBotPhanHoi,
	datBotYeuCau,
	guiThuPhanHoi,
	guiThuYeuCau,
} from "../src/zalo-cau-noi";
import {
	docLyDo,
	parseZaloGetMe,
	parseZaloWebhookInfo,
} from "../src/zalo-update";

const GETME_THAT = {
	ok: true,
	result: {
		id: "7412",
		account_name: "bot.uipSwwnr",
		account_type: "BASIC",
		can_join_groups: true,
		display_name: "Bot OneHub",
	},
};

describe("zalo-cau-noi", () => {
	test("getMe lay display_name, khong lay account_name", () => {
		expect(parseZaloGetMe(GETME_THAT).tenBot).toBe("Bot OneHub");
	});

	test("getMe thieu display_name thi nem, goi ten truong", () => {
		const { display_name: _bo, ...thieu } = GETME_THAT.result;
		expect(() => parseZaloGetMe({ ok: true, result: thieu })).toThrow(
			/display_name/,
		);
	});

	test("getWebhookInfo co url", () => {
		expect(
			parseZaloWebhookInfo({
				ok: true,
				result: { url: "https://a.test/zalo/webhook", updated_at: 1 },
			}),
		).toEqual({ loai: "co-url", url: "https://a.test/zalo/webhook" });
	});

	test("getWebhookInfo than la thi tra khoa cap dau", () => {
		expect(parseZaloWebhookInfo({ ok: true, result: { khac: 1 } })).toEqual({
			loai: "la",
			khoa: "ok,result",
			khoaKetQua: "khac",
		});
	});

	test("ly do webhook chi nhan hai gia tri da khai", () => {
		expect(docLyDo("can-https")).toBe("can-https");
		expect(docLyDo("zalo-tu-choi")).toBe("zalo-tu-choi");
		expect(docLyDo("khac")).toBeNull();
		expect(docLyDo(null)).toBeNull();
	});

	test("yeu cau dat bot: token tuy chon, cat khoang trang, khong nhan truong la", () => {
		expect(datBotYeuCau.parse({})).toEqual({});
		expect(datBotYeuCau.parse({ token: " 1:a\n" })).toEqual({ token: "1:a" });
		expect(() => datBotYeuCau.parse({ botToken: "1:a" })).toThrow();
	});

	test("phan hoi dat bot va gui thu dung khuon", () => {
		expect(
			datBotPhanHoi.parse({
				outcome: "valid",
				tenBot: "B",
				webhook: "can-https",
			}).outcome,
		).toBe("valid");
		expect(() =>
			datBotPhanHoi.parse({ outcome: "valid", webhook: "can-https" }),
		).toThrow();
		expect(guiThuYeuCau.parse({ userId: "u1" }).userId).toBe("u1");
		expect(guiThuPhanHoi.parse({ kenh: null, lech: false }).kenh).toBeNull();
	});
});
