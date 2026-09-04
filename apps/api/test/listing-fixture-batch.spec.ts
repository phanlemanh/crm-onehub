import { afterAll, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { db, RecordSource } from "@crm/db";
import { parseListingBatch } from "@crm/validation/listing-ingest";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { FieldsService } from "../src/fields/fields.service";
import { ListingFieldsService } from "../src/listings/listing-fields.service";
import { ListingIngestService } from "../src/listings/listing-ingest.service";
import { LISTING } from "../src/listings/listings-config";

const BATCH = resolve(
	import.meta.dir,
	"../../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/fixture-batch.json",
);

const keys = LISTING.fields.map((field) => field.key);

const agent = {
	fieldBackfillRecords: async () => ({ queued: 0, merged: 0 }),
} as unknown as AgentTriggerService;

const ingest = new ListingIngestService(
	db,
	new ListingFieldsService(db, new FieldsService(db, agent)),
);

afterAll(async () => {
	const rows = await db.contact.findMany({
		where: { source: RecordSource.LISTING },
		select: { id: true },
	});
	const ids = rows.map((row) => row.id);

	await db.agentTask.deleteMany({ where: { contactId: { in: ids } } });
	await db.contact.deleteMany({ where: { id: { in: ids } } });
	await db.fieldDefinition.deleteMany({
		where: { entity: "CONTACT", key: { in: keys } },
	});
});

it("lô do bộ cào phát đi qua lược đồ thật và dịch vụ thật", async () => {
	expect(existsSync(BATCH)).toBe(true);

	const raw = JSON.parse(readFileSync(BATCH, "utf8"));
	const parsed = parseListingBatch(raw);
	const result = await ingest.ingest(parsed);

	expect(result.created).toBe(parsed.items.length);
	expect(result.updated).toBe(0);
});
