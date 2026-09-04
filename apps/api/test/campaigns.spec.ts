import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { db, type TouchOutcome, RecordSource } from "@crm/db";
import { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import type { CampaignDetail } from "../src/campaigns/campaigns.contracts";
import { CampaignsService } from "../src/campaigns/campaigns.service";
import { OUTCOME_LABELS } from "../src/campaigns/campaigns-config";
import { CompanyDirectoryService } from "../src/companies/company-directory.service";
import { ContactsService } from "../src/contacts/contacts.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { FieldsService } from "../src/fields/fields.service";
import { SavedViewsService } from "../src/saved-views/saved-views.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";

const suffix = process.env.TEST_RUN_ID ?? "campaigns-spec";
const userId = `campaigns-user-${suffix}`;
const email = `rep@campaigns-${suffix}.test`;

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
const service = new CampaignsService(db, contacts);
const savedViews = new SavedViewsService(db, service);

let viewId: string;
let contactIds: string[] = [];
let outsiderId: string;

async function clean() {
	await db.campaign.deleteMany({ where: { createdById: userId } });
	await db.activity.deleteMany({ where: { createdById: userId } });
	await db.contact.deleteMany({
		where: { lastName: { contains: `campaigns-${suffix}` } },
	});
	await db.savedView.deleteMany({ where: { ownerId: userId } });
	await db.user.deleteMany({ where: { id: userId } });
}

async function seed() {
	await db.user.create({
		data: { id: userId, name: "Nhân viên quan hệ đối tác", email },
	});

	contactIds = [];
	for (const n of [1, 2, 3]) {
		const row = await db.contact.create({
			data: {
				firstName: "Môi giới",
				lastName: `campaigns-${suffix}-${n}`,
				phone: `090111${String(n).padStart(4, "0")}`,
				ownerId: userId,
				source: RecordSource.LISTING,
			},
			select: { id: true },
		});
		contactIds.push(row.id);
	}

	const outsider = await db.contact.create({
		data: {
			firstName: "Ngoài phân khúc",
			lastName: `campaigns-${suffix}-0`,
			source: RecordSource.LISTING,
		},
		select: { id: true },
	});
	outsiderId = outsider.id;

	const view = await db.savedView.create({
		data: {
			entity: "CONTACT",
			name: `Phân khúc ${suffix}`,
			shared: false,
			filters: {
				q: "",
				sort: "",
				dir: "asc",
				archived: false,
				filters: { owner: [userId] },
			},
			ownerId: userId,
		},
		select: { id: true },
	});
	viewId = view.id;
}

async function draft(name: string): Promise<CampaignDetail> {
	return service.create(
		{ name: `${name} ${suffix}`, savedViewId: viewId },
		userId,
	);
}

async function running(name: string): Promise<CampaignDetail> {
	const created = await draft(name);

	return service.start(created.id);
}

function contactAt(index: number): string {
	const id = contactIds[index];
	if (!id) throw new Error(`Bài kiểm chưa gieo cá nhân thứ ${index}.`);

	return id;
}

async function touchCount(campaignId: string): Promise<number> {
	return db.campaignTouch.count({ where: { campaignId } });
}

async function callCount(): Promise<number> {
	return db.activity.count({ where: { createdById: userId, type: "CALL" } });
}

beforeEach(async () => {
	await clean();
	await seed();
});

afterAll(clean);

describe("chiến dịch tuyển đối tác", () => {
	it("AC-6 · thành viên bằng đúng kết quả bộ lọc của góc nhìn", async () => {
		const campaign = await running("Gọi quận 7");

		const members = await service.members({
			id: campaign.id,
			page: 1,
			pageSize: 50,
			uncalledOnly: false,
			q: "",
		});

		expect(members.total).toBe(3);
		expect(members.rows.map((row) => row.id).sort()).toEqual(
			[...contactIds].sort(),
		);
		expect(members.rows.map((row) => row.id)).not.toContain(outsiderId);
		expect(campaign.stats.members).toBe(3);
	});

	it("AC-7 · vòng đời ba trạng thái, đã kết thúc không bắt đầu lại", async () => {
		const created = await draft("Vòng đời");
		expect(created.status).toBe("DRAFT");

		const started = await service.start(created.id);
		expect(started.status).toBe("RUNNING");

		const finished = await service.finish(created.id);
		expect(finished.status).toBe("FINISHED");

		await expect(service.start(created.id)).rejects.toThrow(
			/only a DRAFT campaign starts/,
		);
		await expect(service.finish(created.id)).rejects.toThrow(
			/only a RUNNING campaign finishes/,
		);
	});

	it("AC-8 · một cú ghi tạo đúng một lượt gọi và đúng một hoạt động Gọi", async () => {
		const campaign = await running("Một cú bấm");

		const result = await service.touch(
			{ id: campaign.id, contactId: contactAt(0), outcome: "MEETING" },
			userId,
		);

		expect(await touchCount(campaign.id)).toBe(1);
		expect(await callCount()).toBe(1);

		const activity = await db.activity.findUnique({
			where: { id: result.activityId },
			select: { type: true, subject: true, contactId: true },
		});
		expect(activity?.type).toBe("CALL");
		expect(activity?.contactId).toBe(contactAt(0));
		expect(activity?.subject).toBe(
			`${OUTCOME_LABELS.MEETING} · ${campaign.name}`,
		);
	});

	it("AC-8 · hoạt động hỏng thì không còn lượt gọi nào", async () => {
		const campaign = await running("Hoạt động hỏng");

		await expect(
			service.touch(
				{
					id: campaign.id,
					contactId: "khong-co-ca-nhan-nay",
					outcome: "ANSWERED",
				},
				userId,
			),
		).rejects.toThrow();

		expect(await touchCount(campaign.id)).toBe(0);
		expect(await callCount()).toBe(0);
	});

	it("AC-8 · lượt gọi hỏng thì hoạt động cũng không ở lại", async () => {
		const campaign = await running("Lượt gọi hỏng");

		await expect(
			service.touch(
				{
					id: campaign.id,
					contactId: contactAt(0),
					outcome: "KHONG_PHAI_KET_QUA" as TouchOutcome,
				},
				userId,
			),
		).rejects.toThrow();

		expect(await touchCount(campaign.id)).toBe(0);
		expect(await callCount()).toBe(0);
	});

	it("AC-9 · nháp và đã kết thúc từ chối ghi, không để lại vết", async () => {
		const nhap = await draft("Còn nháp");

		await expect(
			service.touch(
				{ id: nhap.id, contactId: contactAt(0), outcome: "ANSWERED" },
				userId,
			),
		).rejects.toThrow(/only a RUNNING campaign accepts call outcomes/);

		const ketThuc = await running("Đã kết thúc");
		await service.finish(ketThuc.id);

		await expect(
			service.touch(
				{ id: ketThuc.id, contactId: contactAt(0), outcome: "ANSWERED" },
				userId,
			),
		).rejects.toThrow(/only a RUNNING campaign accepts call outcomes/);

		expect(await touchCount(nhap.id)).toBe(0);
		expect(await touchCount(ketThuc.id)).toBe(0);
		expect(await callCount()).toBe(0);
	});

	it("AC-10 · số đo đếm cá nhân riêng biệt, đối chứng không tính chính nó", async () => {
		const campaign = await running("Chiến dịch chính");
		const other = await running("Chiến dịch khác");

		await service.touch(
			{ id: campaign.id, contactId: contactAt(0), outcome: "NO_ANSWER" },
			userId,
		);
		await service.touch(
			{ id: campaign.id, contactId: contactAt(0), outcome: "ANSWERED" },
			userId,
		);
		await service.touch(
			{ id: campaign.id, contactId: contactAt(1), outcome: "MEETING" },
			userId,
		);
		await service.touch(
			{ id: other.id, contactId: contactAt(2), outcome: "NO_ANSWER" },
			userId,
		);

		const stats = await service.statsFor({ campaignId: campaign.id });
		expect(stats.called).toBe(2);
		expect(stats.answered).toBe(2);
		expect(stats.meetings).toBe(1);
		expect(stats.answerRate).toBe(1);

		const control = await service.controlFor(campaign.id);
		expect(control?.called).toBe(1);
		expect(control?.answered).toBe(0);
	});

	it("AC-10 · chưa có chiến dịch khác thì đối chứng là null, không phải tỷ số 1", async () => {
		const campaign = await running("Chiến dịch duy nhất");

		await service.touch(
			{ id: campaign.id, contactId: contactAt(0), outcome: "ANSWERED" },
			userId,
		);

		expect(await db.campaign.count()).toBe(1);
		expect(await service.controlFor(campaign.id)).toBeNull();

		const detail = await service.byId(campaign.id);
		expect(detail.control).toBeNull();
	});

	it("AC-11 · góc nhìn đang có chiến dịch thì không xoá được, thông điệp nêu tên", async () => {
		const campaign = await running("Giữ góc nhìn");

		await expect(savedViews.delete(viewId, userId)).rejects.toThrow(
			campaign.name,
		);
		expect(await db.savedView.count({ where: { id: viewId } })).toBe(1);

		await db.campaign.delete({ where: { id: campaign.id } });

		expect(await savedViews.delete(viewId, userId)).toEqual({ id: viewId });
	});

	it("AC-16 · kết thúc ghi mốc, và sau đó bắt đầu bị từ chối", async () => {
		const campaign = await running("Đóng sổ");
		expect(campaign.startedAt).not.toBeNull();
		expect(campaign.finishedAt).toBeNull();

		const finished = await service.finish(campaign.id);
		expect(finished.finishedAt).not.toBeNull();
		expect(
			new Date(finished.finishedAt ?? "").getTime(),
		).toBeGreaterThanOrEqual(new Date(finished.startedAt ?? "").getTime());

		await expect(service.start(campaign.id)).rejects.toThrow(
			/only a DRAFT campaign starts/,
		);
		expect(
			(await db.campaign.findUnique({ where: { id: campaign.id } }))?.status,
		).toBe("FINISHED");
	});
});
