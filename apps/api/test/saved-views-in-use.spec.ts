import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { db, type FieldEntity, RecordSource } from "@crm/db";
import { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { CampaignsService } from "../src/campaigns/campaigns.service";
import { CompanyDirectoryService } from "../src/companies/company-directory.service";
import { ContactsService } from "../src/contacts/contacts.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { FieldsService } from "../src/fields/fields.service";
import { SavedViewsService } from "../src/saved-views/saved-views.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";

const suffix = process.env.TEST_RUN_ID ?? "views-in-use";
const userId = `views-user-${suffix}`;

const agent = {
	contactCreated: async () => true,
	companyCreated: async () => undefined,
	companyRequested: async () => true,
	withCrmEvents: withDiscardedCrmEvents,
	fieldBackfillRecords: async () => ({ queued: 0, merged: 0 }),
} as unknown as AgentTriggerService;

const fields = new FieldsService(db, agent);
const contacts = new ContactsService(
	db,
	new CompanyDirectoryService(agent),
	agent,
	new AgentQueueService(db),
	new ActivityStampService(db),
	fields,
);
const campaigns = new CampaignsService(db, contacts);
const savedViews = new SavedViewsService(db, campaigns);

let firstViewId: string;
let secondViewId: string;
let dealViewId: string;
let insiderId: string;
let outsiderId: string;

async function clean() {
	await db.campaign.deleteMany({ where: { createdById: userId } });
	await db.contact.deleteMany({
		where: { lastName: { contains: `views-${suffix}` } },
	});
	await db.savedView.deleteMany({ where: { ownerId: userId } });
	await db.user.deleteMany({ where: { id: userId } });
}

async function view(
	name: string,
	scope: { owner: string } | { q: string },
	entity: FieldEntity = "CONTACT",
) {
	const row = await db.savedView.create({
		data: {
			entity,
			name: `${name} ${suffix}`,
			shared: true,
			filters: {
				q: "q" in scope ? scope.q : "",
				sort: "",
				dir: "asc",
				archived: false,
				filters: "owner" in scope ? { owner: [scope.owner] } : {},
			},
			ownerId: userId,
		},
		select: { id: true },
	});
	return row.id;
}

async function seed() {
	await db.user.create({
		data: { id: userId, name: "Nhân viên tiếp thị", email: `v@${suffix}.test` },
	});

	const insider = await db.contact.create({
		data: {
			firstName: "Trong",
			lastName: `views-${suffix}-1`,
			ownerId: userId,
			source: RecordSource.LISTING,
		},
		select: { id: true },
	});
	insiderId = insider.id;

	const outsider = await db.contact.create({
		data: {
			firstName: "Ngoài",
			lastName: `views-${suffix}-2`,
			source: RecordSource.LISTING,
		},
		select: { id: true },
	});
	outsiderId = outsider.id;

	firstViewId = await view("Phân khúc một", { owner: userId });
	secondViewId = await view("Phân khúc hai", { q: `views-${suffix}` });
	dealViewId = await view("Góc nhìn thoả thuận", { owner: userId }, "DEAL");
}

beforeEach(async () => {
	await clean();
	await seed();
});

afterAll(clean);

async function finished(name: string) {
	const created = await campaigns.create(
		{ name: `${name} ${suffix}`, savedViewId: firstViewId },
		userId,
	);
	await campaigns.start(created.id);
	await campaigns.finish(created.id);
	return created.id;
}

describe("AC-1 · góc nhìn đang dùng mang tên chiến dịch", () => {
	it("danh sách góc nhìn nói chiến dịch nào đang dùng nó", async () => {
		await finished("Gọi tuần một");

		const rows = await savedViews.list("CONTACT", userId);
		const first = rows.find((row) => row.id === firstViewId);

		expect(first?.usedBy).toEqual([`Gọi tuần một ${suffix}`]);
	});

	it("hai chiến dịch cùng dùng một góc nhìn thì kể cả hai", async () => {
		await finished("Gọi tuần một");
		await finished("Gọi tuần hai");

		const rows = await savedViews.list("CONTACT", userId);
		const first = rows.find((row) => row.id === firstViewId);

		expect(first?.usedBy).toEqual([
			`Gọi tuần hai ${suffix}`,
			`Gọi tuần một ${suffix}`,
		]);
	});
});

describe("AC-2 · góc nhìn rảnh thì danh sách rỗng", () => {
	it("chưa chiến dịch nào dùng thì usedBy rỗng", async () => {
		const rows = await savedViews.list("CONTACT", userId);

		expect(rows.find((row) => row.id === firstViewId)?.usedBy).toEqual([]);
		expect(rows.find((row) => row.id === secondViewId)?.usedBy).toEqual([]);
	});

	it("chiến dịch dùng góc nhìn khác thì góc nhìn này vẫn rảnh", async () => {
		await finished("Gọi tuần một");

		const rows = await savedViews.list("CONTACT", userId);

		expect(rows.find((row) => row.id === secondViewId)?.usedBy).toEqual([]);
	});
});

describe("AC-3 · từ chối xoá nêu đúng lối thoát", () => {
	it("chiến dịch ĐÃ KẾT THÚC vẫn chặn xoá, và câu từ chối nêu tên nó", async () => {
		await finished("Gọi tuần một");

		const refusal = await savedViews
			.delete(firstViewId, userId)
			.then(() => null)
			.catch((error: Error) => error.message);

		expect(refusal).toContain(`Gọi tuần một ${suffix}`);
		expect(refusal).toContain("Point those campaigns at another view");
	});

	it("câu từ chối KHÔNG bảo người dùng đi kết thúc chiến dịch", async () => {
		await finished("Gọi tuần một");

		const refusal = await savedViews
			.delete(firstViewId, userId)
			.then(() => null)
			.catch((error: Error) => error.message);

		expect(refusal).not.toContain("Finish");
		expect(refusal).not.toContain("finish");
	});
});

describe("AC-4 · trỏ sang góc nhìn khác", () => {
	it("phân khúc đổi và thành viên tính lại theo bộ lọc mới", async () => {
		const campaignId = await finished("Gọi tuần một");

		const before = await campaigns.members({
			id: campaignId,
			page: 1,
			pageSize: 50,
			uncalledOnly: false,
			q: "",
		});
		expect(before.rows.map((row) => row.id)).toEqual([insiderId]);

		const after = await campaigns.repoint({
			id: campaignId,
			savedViewId: secondViewId,
		});
		expect(after.savedViewId).toBe(secondViewId);
		expect(after.segmentName).toBe(`Phân khúc hai ${suffix}`);

		const members = await campaigns.members({
			id: campaignId,
			page: 1,
			pageSize: 50,
			uncalledOnly: false,
			q: "",
		});
		expect(members.rows.map((row) => row.id).sort()).toEqual(
			[insiderId, outsiderId].sort(),
		);
	});

	it("góc nhìn cũ thành rảnh, góc nhìn mới thành đang dùng", async () => {
		const campaignId = await finished("Gọi tuần một");
		await campaigns.repoint({ id: campaignId, savedViewId: secondViewId });

		const rows = await savedViews.list("CONTACT", userId);

		expect(rows.find((row) => row.id === firstViewId)?.usedBy).toEqual([]);
		expect(rows.find((row) => row.id === secondViewId)?.usedBy).toEqual([
			`Gọi tuần một ${suffix}`,
		]);
	});
});

describe("AC-5 · trỏ đi rồi thì xoá được", () => {
	it("ngõ cụt đã mở: xoá góc nhìn cũ sau khi trỏ chiến dịch đi", async () => {
		const campaignId = await finished("Gọi tuần một");
		await campaigns.repoint({ id: campaignId, savedViewId: secondViewId });

		const removed = await savedViews.delete(firstViewId, userId);

		expect(removed).toEqual({ id: firstViewId });
		expect(await db.savedView.count({ where: { id: firstViewId } })).toBe(0);
	});
});

describe("AC-6 · trỏ sang chỗ không hợp lệ thì từ chối", () => {
	it("góc nhìn của thực thể khác cá nhân bị từ chối, phân khúc giữ nguyên", async () => {
		const campaignId = await finished("Gọi tuần một");

		const refusal = await campaigns
			.repoint({ id: campaignId, savedViewId: dealViewId })
			.then(() => null)
			.catch((error: Error) => error.message);

		expect(refusal).toContain("must be a contact view");
		expect((await campaigns.byId(campaignId)).savedViewId).toBe(firstViewId);
	});

	it("mã góc nhìn không tồn tại bị từ chối, phân khúc giữ nguyên", async () => {
		const campaignId = await finished("Gọi tuần một");

		const refusal = await campaigns
			.repoint({ id: campaignId, savedViewId: `khong-co-${suffix}` })
			.then(() => null)
			.catch((error: Error) => error.message);

		expect(refusal).toContain("No saved view with id");
		expect((await campaigns.byId(campaignId)).savedViewId).toBe(firstViewId);
	});
});
