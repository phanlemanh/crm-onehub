import { expect, it } from "bun:test";
import { db } from "@crm/db";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { FieldsService } from "../src/fields/fields.service";
import { ListingFieldsService } from "../src/listings/listing-fields.service";
import { LISTING } from "../src/listings/listings-config";

const keys = LISTING.fields.map((field) => field.key);

const agent = {
	fieldBackfillRecords: async () => ({ queued: 0, merged: 0 }),
} as unknown as AgentTriggerService;

const fields = new FieldsService(db, agent);
const service = new ListingFieldsService(db, fields);

it("dựng đủ chín trường, tác nhân không điền được", async () => {
	const built = await service.ensure();

	expect(built.size).toBe(9);
	for (const field of LISTING.fields) {
		const definition = built.get(field.key);
		expect(definition?.label).toBe(field.label);
		expect(definition?.agentFilled).toBe(false);
	}
	const filterable = built.get("san_luong");
	expect(filterable?.showOnFilter).toBe(true);
	expect(filterable?.options.map((option) => option.label)).toEqual([
		"Cao",
		"Vừa",
		"Thấp",
		"Ngủ",
	]);
});

it("gọi lần hai không tạo thêm định nghĩa nào", async () => {
	await service.ensure();
	const before = await db.fieldDefinition.findMany({
		where: { entity: "CONTACT", key: { in: keys } },
		select: { id: true },
	});

	await service.ensure();
	await service.ensure();

	const after = await db.fieldDefinition.findMany({
		where: { entity: "CONTACT", key: { in: keys } },
		select: { id: true },
	});

	expect(after.length).toBe(9);
	expect(after.map((row) => row.id).sort()).toEqual(
		before.map((row) => row.id).sort(),
	);
});
