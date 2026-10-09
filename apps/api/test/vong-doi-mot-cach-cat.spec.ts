import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { companyListInput } from "../src/companies/companies.contracts";
import { CompaniesService } from "../src/companies/companies.service";
import { CompanyDirectoryService } from "../src/companies/company-directory.service";
import type { FaviconService } from "../src/companies/favicon.service";
import { contactListInput } from "../src/contacts/contacts.contracts";
import { ContactsService } from "../src/contacts/contacts.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { ConversionService } from "../src/currency/conversion.service";
import { dealListInput } from "../src/deals/deals.contracts";
import { DealsService } from "../src/deals/deals.service";
import { FieldsService } from "../src/fields/fields.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";

const suffix = process.env.TEST_RUN_ID ?? "vong-doi-spec";
const ma = `vdc${suffix.replace(/[^a-z0-9]/gi, "").slice(-8)}`;
const domain = `vong-doi-${suffix}.test`;
const ownerId = `owner-vdc-${suffix}`;

const agent = {
	contactCreated: async () => true,
	companyCreated: async () => undefined,
	companyRequested: async () => true,
	withCrmEvents: withDiscardedCrmEvents,
} as unknown as AgentTriggerService;

const stamp = new ActivityStampService(db);
const queue = new AgentQueueService(db);
const conversion = new ConversionService(db);
const directory = new CompanyDirectoryService(agent);
const fields = new FieldsService(db, agent);
const contacts = new ContactsService(
	db,
	directory,
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

let congTyGoc: string;

async function clean() {
	const owned = await db.company.findMany({
		where: {
			OR: [{ domain: { endsWith: domain } }, { name: { contains: ma } }],
		},
		select: { id: true },
	});
	const ids = owned.map((r) => r.id);
	await db.deal.deleteMany({
		where: { OR: [{ companyId: { in: ids } }, { name: { contains: ma } }] },
	});
	await db.activity.deleteMany({ where: { companyId: { in: ids } } });
	await db.agentTask.deleteMany({ where: { companyId: { in: ids } } });
	await db.contact.deleteMany({ where: { lastName: { contains: ma } } });
	await db.company.deleteMany({ where: { id: { in: ids } } });
	await db.user.deleteMany({ where: { id: ownerId } });
}

type Loai = {
	ten: string;
	gieo: (i: number) => Promise<string>;
	bulkArchive: (
		ids: string[],
	) => Promise<{ succeeded: number; failed: number }>;
	bulkRestore: (
		ids: string[],
	) => Promise<{ succeeded: number; failed: number }>;
	trongDanhSach: () => Promise<string[]>;
	archivedAt: (id: string) => Promise<Date | null>;
};

const LOAI: Loai[] = [
	{
		ten: "contacts",
		gieo: async (i) =>
			(
				await db.contact.create({
					data: { firstName: `Người ${i}`, lastName: ma },
					select: { id: true },
				})
			).id,
		bulkArchive: (ids) => contacts.bulkArchive(ids),
		bulkRestore: (ids) => contacts.bulkRestore(ids),
		trongDanhSach: async () =>
			(
				await contacts.list(contactListInput.parse({ q: ma, pageSize: 100 }))
			).rows.map((r) => r.id),
		archivedAt: async (id) =>
			(
				await db.contact.findUniqueOrThrow({
					where: { id },
					select: { archivedAt: true },
				})
			).archivedAt,
	},
	{
		ten: "companies",
		gieo: async (i) =>
			(
				await db.company.create({
					data: { name: `Công ty ${ma} ${i}` },
					select: { id: true },
				})
			).id,
		bulkArchive: (ids) => companies.bulkArchive(ids),
		bulkRestore: (ids) => companies.bulkRestore(ids),
		trongDanhSach: async () =>
			(
				await companies.list(companyListInput.parse({ q: ma, pageSize: 100 }))
			).rows.map((r) => r.id),
		archivedAt: async (id) =>
			(
				await db.company.findUniqueOrThrow({
					where: { id },
					select: { archivedAt: true },
				})
			).archivedAt,
	},
	{
		ten: "deals",
		gieo: async (i) =>
			(
				await db.deal.create({
					data: {
						name: `Thoả thuận ${ma} ${i}`,
						companyId: congTyGoc,
						ownerId,
					},
					select: { id: true },
				})
			).id,
		bulkArchive: (ids) => deals.bulkArchive(ids),
		bulkRestore: (ids) => deals.bulkRestore(ids),
		trongDanhSach: async () =>
			(
				await deals.list(dealListInput.parse({ q: ma, pageSize: 100 }))
			).rows.map((r) => r.id),
		archivedAt: async (id) =>
			(
				await db.deal.findUniqueOrThrow({
					where: { id },
					select: { archivedAt: true },
				})
			).archivedAt,
	},
];

beforeAll(async () => {
	await clean();
	await db.user.create({
		data: { id: ownerId, name: "Người phụ trách", email: `owner@${domain}` },
	});
	congTyGoc = (
		await db.company.create({
			data: { name: `Gốc thoả thuận ${suffix}`, domain },
			select: { id: true },
		})
	).id;
});

afterAll(clean);

describe("vong-doi-mot-cach-cat", () => {
	it("vdc-may-chu: luu tru hang loat roi khoi phuc cung danh sach id thi ca ba ve danh sach mac dinh", async () => {
		const o: string[] = [];
		for (const l of LOAI) {
			const ids = [await l.gieo(1), await l.gieo(2), await l.gieo(3)];
			const daCat = await l.bulkArchive(ids);
			expect(`${l.ten}:${daCat.succeeded}/${daCat.failed}`).toBe(
				`${l.ten}:3/0`,
			);
			const sauCat = await l.trongDanhSach();
			for (const id of ids) {
				expect(`${l.ten}:${(await l.archivedAt(id)) !== null}`).toBe(
					`${l.ten}:true`,
				);
				expect(`${l.ten}:${sauCat.includes(id)}`).toBe(`${l.ten}:false`);
			}
			const khoiPhuc = await l.bulkRestore(ids);

			const sauKhoiPhuc = await l.trongDanhSach();
			const thieu = [];
			for (const id of ids) {
				if ((await l.archivedAt(id)) !== null) thieu.push(id);
				if (!sauKhoiPhuc.includes(id)) thieu.push(id);
			}
			if (thieu.length > 0)
				throw new Error(`vdc: may chu khong khoi phuc du (${l.ten})`);
			expect(`${l.ten}:${khoiPhuc.succeeded}/${khoiPhuc.failed}`).toBe(
				`${l.ten}:3/0`,
			);
			o.push(l.ten);
		}
		expect(o.length).toBe(3);
	});

	it("vdc-may-chu: id khong ton tai bi bo qua luc luu tru, khoi phuc cung danh sach khong hong", async () => {
		const o: string[] = [];
		for (const l of LOAI) {
			const id = await l.gieo(9);
			const gia = `${id.slice(0, -6)}zzzzzz`;
			const daCat = await l.bulkArchive([id, gia]);
			expect(`${l.ten}:${daCat.succeeded}/${daCat.failed}`).toBe(
				`${l.ten}:1/1`,
			);
			const hoanTac = await l.bulkRestore([id, gia]);
			expect(`${l.ten}:${hoanTac.succeeded}/${hoanTac.failed}`).toBe(
				`${l.ten}:1/1`,
			);
			expect(`${l.ten}:${(await l.archivedAt(id)) === null}`).toBe(
				`${l.ten}:true`,
			);
			o.push(l.ten);
		}
		expect(o.length).toBe(3);
	});
});
