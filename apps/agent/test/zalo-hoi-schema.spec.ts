import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { zaloHoiKetQua } from "@crm/validation/zalo-hoi";
import { db } from "@crm/db";

const TIEN_TO = "zhs-";

async function donDep(): Promise<void> {
	await db.zaloHoi.deleteMany({ where: { messageId: { startsWith: TIEN_TO } } });
}

beforeAll(donDep);
afterAll(donDep);

describe("zalo-hoi-schema", () => {
	test("zalo-hoi-schema: ghi va doc lai ket qua gach ngang", async () => {
		const hang = await db.zaloHoi.create({
			data: {
				messageId: `${TIEN_TO}1`,
				crmUserId: "nguoi-khong-ton-tai",
				zaloChatId: "chat-1",
				ketQua: "dang-hoi",
			},
		});
		const doc = await db.zaloHoi.findUniqueOrThrow({ where: { id: hang.id } });
		expect(zaloHoiKetQua.parse(doc.ketQua)).toBe("dang-hoi");
		expect(doc.sessionId).toBeNull();
		expect(doc.hoiLuc).toBeInstanceOf(Date);
	});

	test("zalo-hoi-schema: messageId la duy nhat", async () => {
		const tao = () =>
			db.zaloHoi.create({
				data: {
					messageId: `${TIEN_TO}2`,
					crmUserId: "u",
					zaloChatId: "c",
					ketQua: "dang-hoi",
				},
			});
		await tao();
		let ma: string | undefined;
		try {
			await tao();
		} catch (loi) {
			ma = (loi as { code?: string }).code;
		}
		expect(ma).toBe("P2002");
	});

	test("zalo-hoi-schema: tap ket qua dong va khong nhan gach duoi", () => {
		expect(zaloHoiKetQua.options).toEqual([
			"dang-hoi",
			"da-tra-loi",
			"gui-hong",
			"tu-choi-vai",
			"tu-choi-tran-phut",
			"tu-choi-tran-ngay",
			"tu-choi-tran-thang",
			"dang-ban",
			"loi",
		]);
		expect(zaloHoiKetQua.safeParse("dang_hoi").success).toBe(false);
	});
});
