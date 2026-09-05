import { afterAll, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { db } from "@crm/db";
import {
	type ListingBatch,
	parseListingBatch,
} from "@crm/validation/listing-ingest";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { FieldsService } from "../src/fields/fields.service";
import { ListingFieldsService } from "../src/listings/listing-fields.service";
import { ListingIngestService } from "../src/listings/listing-ingest.service";

const BATCH = resolve(
	import.meta.dir,
	"../../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/fixture-batch.json",
);

const suffix = `fixture-batch-${process.env.TEST_RUN_ID ?? "local"}`;

const agent = {
	fieldBackfillRecords: async () => ({ queued: 0, merged: 0 }),
} as unknown as AgentTriggerService;

const ingest = new ListingIngestService(
	db,
	new ListingFieldsService(db, new FieldsService(db, agent)),
);

function cuaLuotChay(batch: ListingBatch): ListingBatch {
	return {
		...batch,
		items: batch.items.map((item) => ({
			...item,
			url: `${item.url}?run=${suffix}`,
			shopName: `${item.shopName} ${suffix}`,
			personName: `${item.personName ?? item.shopName} ${suffix}`,
		})),
	};
}

afterAll(async () => {
	const rows = await db.contact.findMany({
		where: { lastName: { contains: suffix } },
		select: { id: true },
	});
	const ids = rows.map((row) => row.id);

	await db.agentTask.deleteMany({ where: { contactId: { in: ids } } });
	await db.contact.deleteMany({ where: { id: { in: ids } } });
});

it("lô do bộ cào phát đi qua lược đồ thật và dịch vụ thật", async () => {
	expect(existsSync(BATCH)).toBe(true);

	const raw = JSON.parse(readFileSync(BATCH, "utf8"));
	const parsed = cuaLuotChay(parseListingBatch(raw));
	const result = await ingest.ingest(parsed);

	expect(result.created).toBe(parsed.items.length);
	expect(result.updated).toBe(0);
});
