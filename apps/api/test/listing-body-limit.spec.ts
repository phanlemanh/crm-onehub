import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import type { ListingBatch, ListingItem } from "@crm/validation/listing-ingest";
import { LISTING_BATCH_MAX_ITEMS } from "@crm/validation/listing-ingest";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { LISTING_INGEST } from "../src/listings/listings-config";

const suffix = `listing-body-limit-${process.env.TEST_RUN_ID ?? "local"}`;
const SECRET = process.env.LISTING_INGEST_SECRET;

const INGEST = "/internal/listings/ingest";

function item(n: number): ListingItem {
	return {
		url: `https://nhatot.com/moi-gioi-${suffix}-${n}`,
		shopName: `Chuyên trang bất động sản ${suffix} ${n}`,
		personName: `Nguyễn Văn ${n}-${suffix}`,
		isCompany: n % 3 === 0,
		hasLicense: n % 2 === 0,
		districts: ["Quận 7", "Quận Bình Thạnh", "Thành phố Thủ Đức"],
		city: "Tp Hồ Chí Minh",
		listingsTotal: 100 + n,
		listingsNew30d: 100 + n,
		tier: "cao",
		phone: `090${String(n).padStart(7, "0")}`,
	};
}

function batch(count: number): ListingBatch {
	return {
		source: "nhatot",
		crawledAt: "2026-09-05T08:00:00Z",
		items: Array.from({ length: count }, (_, index) => item(index + 1)),
	};
}

function bytesOf(payload: ListingBatch): number {
	return Buffer.byteLength(JSON.stringify(payload), "utf8");
}

describe("Trần thân yêu cầu của /internal/listings", () => {
	let app: INestApplication;

	beforeAll(async () => {
		const { createApp } = await import("../src/create-app");
		app = await createApp();
		await app.listen(0, "127.0.0.1");
	});

	afterAll(async () => {
		const rows = await db.contact.findMany({
			where: { lastName: { contains: suffix } },
			select: { id: true },
		});
		const ids = rows.map((row) => row.id);

		await db.agentTask.deleteMany({ where: { contactId: { in: ids } } });
		await db.fieldValue.deleteMany({ where: { contactId: { in: ids } } });
		await db.contact.deleteMany({ where: { id: { in: ids } } });

		await app.close();
	});

	it("nhận một lô đúng 500 mục qua HTTP thật", async () => {
		const payload = batch(LISTING_BATCH_MAX_ITEMS);
		const size = bytesOf(payload);

		expect(payload.items).toHaveLength(500);
		expect(size).toBeLessThanOrEqual(LISTING_INGEST.bodyLimitBytes);

		const response = await request(app.getHttpServer())
			.post(INGEST)
			.set("authorization", `Bearer ${SECRET}`)
			.set("content-type", "application/json")
			.send(payload);

		expect(response.status).toBe(201);
		expect(response.body).toEqual({ created: 500, updated: 0 });

		const stored = await db.contact.count({
			where: { lastName: { contains: suffix } },
		});
		expect(stored).toBe(500);
	}, 300_000);

	it("trả 413 cho một lượt cào gửi trọn không chia lô", async () => {
		const payload = batch(8_000);
		const size = bytesOf(payload);

		expect(size).toBeGreaterThan(LISTING_INGEST.bodyLimitBytes);

		const response = await request(app.getHttpServer())
			.post(INGEST)
			.set("authorization", `Bearer ${SECRET}`)
			.set("content-type", "application/json")
			.send(payload);

		expect(response.status).toBe(413);
	}, 300_000);
});
