import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { companyDetailOutput } from "../src/companies/companies.contracts";
import { CompaniesService } from "../src/companies/companies.service";
import { CompanyDirectoryService } from "../src/companies/company-directory.service";
import type { FaviconService } from "../src/companies/favicon.service";
import { ContactsService } from "../src/contacts/contacts.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { ConversionService } from "../src/currency/conversion.service";
import {
	dealContactOptionsOutput,
	dealDetailOutput,
} from "../src/deals/deals.contracts";
import { DealsService } from "../src/deals/deals.service";
import { FieldsService } from "../src/fields/fields.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";

const HAU_TO = process.env.TEST_RUN_ID ?? "dt2-spec";
const TEN = `DT2 ${HAU_TO}`;
const MIEN = `dt2-${HAU_TO}.test`;
const CHU = `dt2-chu-${HAU_TO}`;

const agent = {
	contactCreated: async () => true,
	companyCreated: async () => undefined,
	companyRequested: async () => true,
	withCrmEvents: withDiscardedCrmEvents,
} as unknown as AgentTriggerService;

const stamp = new ActivityStampService(db);
const queue = new AgentQueueService(db);
const conversion = new ConversionService(db);
const fields = new FieldsService(db, agent);
const contacts = new ContactsService(
	db,
	new CompanyDirectoryService(agent),
	agent,
	queue,
	stamp,
	fields,
);
const companies = new CompaniesService(
	db,
	agent,
	queue,
	{ backfill: async () => undefined } as unknown as FaviconService,
	stamp,
	conversion,
	fields,
);
const deals = new DealsService(db, agent, stamp, conversion, fields);

let congTyId: string;
let dealId: string;
let pId: string;
let qId: string;
let rId: string;

async function don() {
	const cu = await db.company.findMany({
		where: { domain: MIEN },
		select: { id: true },
	});
	const ids = cu.map((row) => row.id);
	await db.deal.deleteMany({ where: { companyId: { in: ids } } });
	await db.activity.deleteMany({ where: { companyId: { in: ids } } });
	await db.agentTask.deleteMany({ where: { companyId: { in: ids } } });
	await db.contact.deleteMany({ where: { firstName: { startsWith: TEN } } });
	await db.company.deleteMany({ where: { id: { in: ids } } });
	await db.user.deleteMany({ where: { id: CHU } });
}

function soCua(
	ten: string,
	rows: { id: string; phone?: string | null }[],
	id: string,
) {
	const row = rows.find((r) => r.id === id);
	if (!row || !("phone" in row)) {
		throw new Error(`${ten}: thieu phone`);
	}
	return row.phone;
}

beforeAll(async () => {
	await don();
	await db.user.create({
		data: { id: CHU, name: "DT2 Rep", email: `${CHU}@example.test` },
	});
	const congTy = await db.company.create({
		data: { name: `${TEN} Co`, domain: MIEN },
		select: { id: true },
	});
	congTyId = congTy.id;

	const p = await contacts.create({
		firstName: `${TEN} P`,
		phone: "0901 234 567",
		companyId: congTyId,
	});
	const q = await contacts.create({
		firstName: `${TEN} Q`,
		companyId: congTyId,
	});
	const r = await contacts.create({
		firstName: `${TEN} R`,
		phone: "0901 234 569",
		companyId: congTyId,
	});
	pId = p.id;
	qId = q.id;
	rId = r.id;

	const deal = await deals.create({
		name: `${TEN} Deal`,
		companyId: congTyId,
		ownerId: CHU,
	});
	dealId = deal.id;
	await deals.attachContact({ dealId, contactId: pId });
	await deals.attachContact({ dealId, contactId: qId });
});

afterAll(don);

describe("deal-co-so", () => {
	test("byId: P mang +84901234567, Q mang null, qua schema dau ra", async () => {
		const deal = dealDetailOutput.parse(await deals.byId(dealId));
		const p = soCua("deal-co-so", deal.contacts, pId);
		const q = soCua("deal-co-so", deal.contacts, qId);
		expect(`${p} ${q}`).toBe("+84901234567 null");
	});

	test("contactOptions: R mang +84901234569, qua schema dau ra", async () => {
		const options = dealContactOptionsOutput.parse(
			await deals.contactOptions(dealId),
		);
		expect(soCua("deal-co-so", options, rId)).toBe("+84901234569");
	});
});

describe("cong-ty-co-so", () => {
	test("byId: P mang +84901234567, Q mang null, qua schema dau ra", async () => {
		const company = companyDetailOutput.parse(await companies.byId(congTyId));
		const p = soCua("cong-ty-co-so", company.contacts, pId);
		const q = soCua("cong-ty-co-so", company.contacts, qId);
		expect(`${p} ${q}`).toBe("+84901234567 null");
	});
});
