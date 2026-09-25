import { describe, expect, test } from "bun:test";
import { moTaThanWebhook, parseZaloWebhook } from "../src/zalo-webhook";

const MESSAGE = {
	from: { id: "u1", display_name: "A", is_bot: false },
	chat: { id: "u1", chat_type: "PRIVATE" },
	text: "123456",
	message_id: "m1",
	date: 1,
};

describe("zalo-webhook", () => {
	test("hai khuon cho cung ket qua", () => {
		const that = parseZaloWebhook({ event_name: "e", message: MESSAGE });
		const vo = parseZaloWebhook({
			ok: true,
			result: { event_name: "e", message: MESSAGE },
		});
		expect(that).toEqual({ message: MESSAGE, eventName: "e" });
		expect(vo).toEqual(that);
	});

	test("khoa-thua: message co khoa la van doc", () => {
		const ket = parseZaloWebhook({
			event_name: "e",
			message: { ...MESSAGE, moi: 1 },
		});
		expect(ket.message.message_id).toBe("m1");
	});

	test("lai: khuon that hop le thang khi co ca result", () => {
		const ket = parseZaloWebhook({
			event_name: "e",
			message: MESSAGE,
			result: 1,
		});
		expect(ket.eventName).toBe("e");
	});

	test("sai khuon nem thong diep webhook, khong mang gia tri", () => {
		const bi = {
			...MESSAGE,
			from: { display_name: "A", is_bot: false },
			text: "BI-MAT",
		};
		const thu = () => parseZaloWebhook({ event_name: "e", message: bi });
		expect(thu).toThrow("webhook tra hinh dang la");
		let thongDiep = "";
		try {
			thu();
		} catch (loi) {
			thongDiep = String(loi);
		}
		expect(thongDiep, "loi co thong diep").toContain("from");
		expect(thongDiep, "loi khong mang noi dung tin").not.toContain("BI-MAT");
	});

	test("khong-doi-tuong va ma-rong: mo ta khong nem", () => {
		expect(moTaThanWebhook(null)).toEqual({
			khoa: [],
			khoaMessage: [],
			messageId: null,
		});
		expect(moTaThanWebhook([1])).toEqual({
			khoa: [],
			khoaMessage: [],
			messageId: null,
		});
		expect(moTaThanWebhook({ message: { message_id: "" } }).messageId).toBe(
			null,
		);
		expect(
			moTaThanWebhook({
				ok: true,
				result: { message: { message_id: "m9", x: 1 } },
			}),
		).toEqual({
			khoa: ["ok", "result"],
			khoaMessage: ["message_id", "x"],
			messageId: "m9",
		});
		expect(
			moTaThanWebhook({ event_name: "e", message: { message_id: "m8" } }),
		).toEqual({
			khoa: ["event_name", "message"],
			khoaMessage: ["message_id"],
			messageId: "m8",
		});
	});
});
