import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { db, RecordSource } from "@crm/db";
import {
	type ListingBatch,
	type ListingItem,
	parseListingBatch,
} from "@crm/validation/listing-ingest";
import {
	BadRequestException,
	ForbiddenException,
	type HttpException,
	ServiceUnavailableException,
} from "@nestjs/common";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { FieldsService } from "../src/fields/fields.service";
import { ListingFieldsService } from "../src/listings/listing-fields.service";
import { ListingIngestService } from "../src/listings/listing-ingest.service";
import { ListingsController } from "../src/listings/listings.controller";
import {
	LISTING,
	MATCH_KEY,
	TIER_LABELS,
} from "../src/listings/listings-config";

const suffix = `listing-ingest-${process.env.TEST_RUN_ID ?? "local"}`;
const keys = LISTING.fields.map((field) => field.key);
const SELECT_KEYS = ["san_luong", "hinh_thai", "chung_chi"];
const SECRET = `bi-mat-${suffix}`;

const agent = {
	fieldBackfillRecords: async () => ({ queued: 0, merged: 0 }),
} as unknown as AgentTriggerService;

const fields = new FieldsService(db, agent);
const listingFields = new ListingFieldsService(db, fields);
const ingest = new ListingIngestService(db, listingFields);

function item(n: number, overrides: Partial<ListingItem> = {}): ListingItem {
	return {
		url: `https://nhatot.com/moi-gioi-${suffix}-${n}`,
		shopName: `Chuyên trang ${suffix} ${n}`,
		personName: `Người ${n} ${suffix}`,
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

type OTruong = {
	text: string | null;
	number: number | null;
	date: Date | null;
	option: string | null;
};

async function contactIdOf(url: string): Promise<string> {
	const definition = await db.fieldDefinition.findUnique({
		where: { entity_key: { entity: "CONTACT", key: MATCH_KEY } },
		select: { id: true },
	});
	const anchor = await db.fieldValue.findFirst({
		where: { fieldId: definition?.id, text: url, contactId: { not: null } },
		select: { contactId: true },
	});
	if (!anchor?.contactId) {
		throw new Error(`Không có cá nhân nào mang ${MATCH_KEY} = ${url}.`);
	}

	return anchor.contactId;
}

async function valuesOf(url: string): Promise<Record<string, OTruong>> {
	const rows = await db.fieldValue.findMany({
		where: {
			contactId: await contactIdOf(url),
			field: { entity: "CONTACT", key: { in: [...keys] } },
		},
		select: {
			text: true,
			number: true,
			date: true,
			field: { select: { key: true } },
			option: { select: { label: true } },
		},
	});

	return Object.fromEntries(
		rows.map((row) => [
			row.field.key,
			{
				text: row.text,
				number: row.number === null ? null : Number(row.number),
				date: row.date,
				option: row.option?.label ?? null,
			},
		]),
	);
}

function gate(secret: string | undefined): ListingsController {
	const config = {
		get: () => secret,
	} as unknown as ConstructorParameters<typeof ListingsController>[1];

	return new ListingsController(ingest, config);
}

async function refused(promise: Promise<unknown>): Promise<HttpException> {
	try {
		await promise;
	} catch (error) {
		return error as HttpException;
	}

	throw new Error("Cổng đã nhận lô mà đáng lẽ nó phải từ chối.");
}

function selectItem() {
	return item(7, { tier: "cao", isCompany: false, hasLicense: true });
}

async function selectLabels(
	url: string,
): Promise<Record<string, string | undefined>> {
	const rows = await db.fieldValue.findMany({
		where: {
			contactId: await contactIdOf(url),
			field: { entity: "CONTACT", key: { in: SELECT_KEYS } },
			option: { isNot: null },
		},
		select: {
			field: { select: { key: true } },
			option: { select: { label: true } },
		},
	});

	return Object.fromEntries(
		rows.map((row) => [row.field.key, row.option?.label]),
	);
}

async function renameOption(key: string, from: string, to: string) {
	const definition = await db.fieldDefinition.findUnique({
		where: { entity_key: { entity: "CONTACT", key } },
		select: { id: true },
	});

	await db.fieldOption.updateMany({
		where: { fieldId: definition?.id, label: from },
		data: { label: to },
	});
}

async function cleanup() {
	const rows = await db.contact.findMany({
		where: { lastName: { contains: suffix } },
		select: { id: true },
	});
	const ids = rows.map((row) => row.id);

	await db.agentTask.deleteMany({ where: { contactId: { in: ids } } });
	await db.contact.deleteMany({ where: { id: { in: ids } } });
}

beforeEach(cleanup);

afterAll(cleanup);

describe("cổng tiếp nhận lô từ sàn", () => {
	it("AC-1 · chín trường mang đúng giá trị của mục — ma trận toàn phần", async () => {
		const at = "2026-09-04T10:00:00Z";
		const sent = item(1);
		const result = await ingest.ingest(
			parseListingBatch(batch([sent, item(2), item(3)], at)),
		);

		expect(result).toEqual({ created: 3, updated: 0 });
		expect((await urls()).length).toBe(3);

		const got = await valuesOf(sent.url);
		expect(Object.keys(got).sort()).toEqual([...keys].sort());

		expect(got.san_luong?.option).toBe(TIER_LABELS[sent.tier]);
		expect(got.tin_dang?.number).toBe(sent.listingsTotal);
		expect(got.tin_moi_30_ngay?.number).toBe(sent.listingsNew30d);
		expect(got.dia_ban?.text).toBe(sent.districts.join(", "));
		expect(got.hinh_thai?.option).toBe(sent.isCompany ? "Công ty" : "Cá nhân");
		expect(got.chung_chi?.option).toBe(sent.hasLicense ? "Có" : "Không");
		expect(got.ten_chuyen_trang?.text).toBe(sent.shopName);
		expect(got.trang_nhatot?.text).toBe(sent.url);
		expect(got.san_cap_nhat_luc?.date?.toISOString()).toBe(
			new Date(at).toISOString(),
		);
	});

	it("AC-1 · ba trường chọn mang đúng nhãn của mục", async () => {
		const sent = selectItem();
		await ingest.ingest(parseListingBatch(batch([sent])));

		expect(await selectLabels(sent.url)).toEqual({
			san_luong: "Cao",
			hinh_thai: "Cá nhân",
			chung_chi: "Có",
		});
	});

	it("AC-1 · nhãn tuỳ chọn lệch thì tiếp nhận ném lỗi gọi tên trường và nhãn", async () => {
		const sent = selectItem();
		await ingest.ingest(parseListingBatch(batch([sent])));
		await renameOption("san_luong", "Cao", "Cao (≥60)");

		try {
			await expect(
				ingest.ingest(parseListingBatch(batch([selectItem()]))),
			).rejects.toThrow(
				'Listing field "san_luong" has no option labelled "Cao". Known options: "Cao (≥60)", "Vừa", "Thấp", "Ngủ".',
			);
		} finally {
			await renameOption("san_luong", "Cao (≥60)", "Cao");
		}

		await ingest.ingest(parseListingBatch(batch([sent])));
		expect((await selectLabels(sent.url)).san_luong).toBe("Cao");
	});

	it("AC-2 · gửi lại cùng lô thì cập nhật, không tạo trùng", async () => {
		const sent = item(1);
		await ingest.ingest(parseListingBatch(batch([sent])));
		const before = await db.contact.count({
			where: { lastName: { contains: suffix } },
		});

		const result = await ingest.ingest(
			parseListingBatch(
				batch([item(1, { listingsTotal: 999 })], "2026-09-05T10:00:00Z"),
			),
		);

		expect(result).toEqual({ created: 0, updated: 1 });
		expect(
			await db.contact.count({ where: { lastName: { contains: suffix } } }),
		).toBe(before);

		const definition = await db.fieldDefinition.findUnique({
			where: { entity_key: { entity: "CONTACT", key: "tin_dang" } },
			select: { id: true },
		});
		const value = await db.fieldValue.findFirst({
			where: {
				fieldId: definition?.id,
				contactId: await contactIdOf(sent.url),
			},
			select: { number: true },
		});
		expect(Number(value?.number)).toBe(999);
	});

	it("AC-2 · lô vắng số điện thoại thì giữ số cũ, lô có số thì đè", async () => {
		const sent = item(1, { phone: "0900000001" });
		await ingest.ingest(parseListingBatch(batch([sent])));
		const id = await contactIdOf(sent.url);

		const { phone: _drop, ...withoutPhone } = item(1);
		await ingest.ingest(
			parseListingBatch(batch([withoutPhone], "2026-09-05T10:00:00Z")),
		);
		let contact = await db.contact.findUnique({
			where: { id },
			select: { phone: true },
		});
		expect(contact?.phone).toBe("0900000001");

		await ingest.ingest(
			parseListingBatch(
				batch([item(1, { phone: "0911111111" })], "2026-09-06T10:00:00Z"),
			),
		);
		contact = await db.contact.findUnique({
			where: { id },
			select: { phone: true },
		});
		expect(contact?.phone).toBe("0911111111");
	});

	it("AC-3 · cổng trả 403 khi khoá sai, và không ghi gì", async () => {
		const body = batch([item(1)]) as unknown as ListingBatch;

		const error = await refused(gate(SECRET).run(body, "Bearer sai-be-bet"));

		expect(error).toBeInstanceOf(ForbiddenException);
		expect(error.getStatus()).toBe(403);
		expect((await urls()).length).toBe(0);
	});

	it("AC-3 · cổng trả 503 khi khoá chưa cấu hình, và không ghi gì", async () => {
		const body = batch([item(1)]) as unknown as ListingBatch;

		const error = await refused(gate(undefined).run(body, `Bearer ${SECRET}`));

		expect(error).toBeInstanceOf(ServiceUnavailableException);
		expect(error.getStatus()).toBe(503);
		expect(error.message).toBe("Listing ingest is not configured.");
		expect((await urls()).length).toBe(0);
	});

	it("AC-3 · cổng trả 400 gọi tên mục và trường sai, và không ghi gì", async () => {
		const { listingsTotal: _drop, ...broken } = item(2);
		const body = batch([item(1), broken]) as unknown as ListingBatch;

		const error = await refused(gate(SECRET).run(body, `Bearer ${SECRET}`));

		expect(error).toBeInstanceOf(BadRequestException);
		expect(error.getStatus()).toBe(400);
		expect(error.message).toContain("items.1.listingsTotal");
		expect((await urls()).length).toBe(0);
	});

	it("AC-3 · cổng nhận lô khi khoá đúng", async () => {
		const body = batch([item(1)]) as unknown as ListingBatch;

		expect(await gate(SECRET).run(body, `Bearer ${SECRET}`)).toEqual({
			created: 1,
			updated: 0,
		});
		expect((await urls()).length).toBe(1);
	});

	it("AC-4 · không xếp việc nghiên cứu cho người đến từ sàn", async () => {
		await ingest.ingest(parseListingBatch(batch([item(1)])));

		const contacts = await db.contact.findMany({
			where: { lastName: { contains: suffix }, source: RecordSource.LISTING },
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
