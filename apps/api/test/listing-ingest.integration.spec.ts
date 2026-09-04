import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { db, RecordSource } from "@crm/db";
import { InvalidInput } from "@crm/validation";
import {
	type ListingItem,
	parseListingBatch,
} from "@crm/validation/listing-ingest";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { FieldsService } from "../src/fields/fields.service";
import { ListingFieldsService } from "../src/listings/listing-fields.service";
import { ListingIngestService } from "../src/listings/listing-ingest.service";
import { LISTING, MATCH_KEY } from "../src/listings/listings-config";

const suffix = process.env.TEST_RUN_ID ?? "listing-ingest";
const keys = LISTING.fields.map((field) => field.key);

const agent = {
	fieldBackfillRecords: async () => ({ queued: 0, merged: 0 }),
} as unknown as AgentTriggerService;

const fields = new FieldsService(db, agent);
const listingFields = new ListingFieldsService(db, fields);
const ingest = new ListingIngestService(db, listingFields);

function item(n: number, overrides: Partial<ListingItem> = {}) {
	return {
		url: `https://nhatot.com/moi-gioi-${suffix}-${n}`,
		shopName: `Chuyên trang ${suffix} ${n}`,
		personName: `Người ${n}`,
		isCompany: false,
		hasLicense: n % 2 === 0,
		districts: ["Quận 7"],
		city: "Tp Hồ Chí Minh",
		listingsTotal: 100 + n,
		listingsNew30d: 60 + n,
		tier: "cao",
		phone: `090000${String(n).padStart(4, "0")}`,
		...overrides,
	};
}

function batch(items: unknown[], at = "2026-09-04T10:00:00Z") {
	return { source: "nhatot" as const, crawledAt: at, items };
}

async function urls(): Promise<string[]> {
	const definition = await db.fieldDefinition.findUnique({
		where: { entity_key: { entity: "CONTACT", key: MATCH_KEY } },
		select: { id: true },
	});
	if (!definition) return [];

	const rows = await db.fieldValue.findMany({
		where: { fieldId: definition.id, text: { contains: suffix } },
		select: { text: true },
	});

	return rows.map((row) => row.text ?? "");
}

async function cleanup() {
	const rows = await db.contact.findMany({
		where: { source: RecordSource.LISTING, firstName: { contains: "Người" } },
		select: { id: true },
	});
	const ids = rows.map((row) => row.id);

	await db.agentTask.deleteMany({ where: { contactId: { in: ids } } });
	await db.contact.deleteMany({ where: { id: { in: ids } } });
}

beforeEach(cleanup);

afterAll(async () => {
	await cleanup();
	await db.fieldDefinition.deleteMany({
		where: { entity: "CONTACT", key: { in: keys } },
	});
});

describe("cổng tiếp nhận lô từ sàn", () => {
	it("AC-1 · mỗi mục thành một cá nhân nguồn sàn với chín trường đúng", async () => {
		const result = await ingest.ingest(
			parseListingBatch(batch([item(1), item(2), item(3)])),
		);

		expect(result).toEqual({ created: 3, updated: 0 });
		expect((await urls()).length).toBe(3);

		const contact = await db.contact.findFirst({
			where: { source: RecordSource.LISTING, firstName: "Người" },
			select: {
				id: true,
				phone: true,
				fieldValues: { select: { text: true, number: true } },
			},
		});
		expect(contact?.fieldValues.length).toBe(9);
	});

	it("AC-2 · gửi lại cùng lô thì cập nhật, không tạo trùng", async () => {
		await ingest.ingest(parseListingBatch(batch([item(1)])));
		const before = await db.contact.count({
			where: { source: RecordSource.LISTING },
		});

		const result = await ingest.ingest(
			parseListingBatch(
				batch([item(1, { listingsTotal: 999 })], "2026-09-05T10:00:00Z"),
			),
		);

		expect(result).toEqual({ created: 0, updated: 1 });
		expect(
			await db.contact.count({ where: { source: RecordSource.LISTING } }),
		).toBe(before);

		const definition = await db.fieldDefinition.findUnique({
			where: { entity_key: { entity: "CONTACT", key: "tin_dang" } },
			select: { id: true },
		});
		const value = await db.fieldValue.findFirst({
			where: { fieldId: definition?.id },
			select: { number: true },
		});
		expect(Number(value?.number)).toBe(999);
	});

	it("AC-2 · lô vắng số điện thoại thì giữ số cũ, lô có số thì đè", async () => {
		await ingest.ingest(
			parseListingBatch(batch([item(1, { phone: "0900000001" })])),
		);

		const { phone: _drop, ...withoutPhone } = item(1);
		await ingest.ingest(
			parseListingBatch(batch([withoutPhone], "2026-09-05T10:00:00Z")),
		);
		let contact = await db.contact.findFirst({
			where: { source: RecordSource.LISTING },
			select: { phone: true },
		});
		expect(contact?.phone).toBe("0900000001");

		await ingest.ingest(
			parseListingBatch(
				batch([item(1, { phone: "0911111111" })], "2026-09-06T10:00:00Z"),
			),
		);
		contact = await db.contact.findFirst({
			where: { source: RecordSource.LISTING },
			select: { phone: true },
		});
		expect(contact?.phone).toBe("0911111111");
	});

	it("AC-3 · một mục sai lược đồ thì cả lô bị từ chối và không ghi gì", async () => {
		const { listingsTotal: _drop, ...broken } = item(2);

		expect(() => parseListingBatch(batch([item(1), broken]))).toThrow(
			InvalidInput,
		);
		expect(() => parseListingBatch(batch([item(1), broken]))).toThrow(
			"items.1.listingsTotal",
		);
		expect(
			await db.contact.count({ where: { source: RecordSource.LISTING } }),
		).toBe(0);
	});

	it("AC-4 · không xếp việc nghiên cứu cho người đến từ sàn", async () => {
		await ingest.ingest(parseListingBatch(batch([item(1)])));

		const contacts = await db.contact.findMany({
			where: { source: RecordSource.LISTING },
			select: { id: true, enrichmentStatus: true },
		});
		const tasks = await db.agentTask.count({
			where: { contactId: { in: contacts.map((row) => row.id) } },
		});

		expect(tasks).toBe(0);
		expect(contacts[0]?.enrichmentStatus).toBe("SKIPPED");
	});

	it("AC-5 · chín trường tồn tại với khoá cố định và tác nhân không điền được", async () => {
		await ingest.ingest(parseListingBatch(batch([item(1)])));

		const definitions = await db.fieldDefinition.findMany({
			where: { entity: "CONTACT", key: { in: keys } },
			select: { key: true, label: true, agentFilled: true, showOnFilter: true },
		});

		expect(definitions.length).toBe(9);
		expect(definitions.every((row) => row.agentFilled === false)).toBe(true);
		expect(
			definitions
				.filter((row) => row.showOnFilter)
				.map((row) => row.key)
				.sort(),
		).toEqual(["chung_chi", "hinh_thai", "san_luong"]);
	});
});
