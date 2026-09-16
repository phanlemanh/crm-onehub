import { beforeEach, describe, expect, it } from "bun:test";
import { decideSignIn } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { CompanyDirectoryService } from "../src/companies/company-directory.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { EnrichmentLogService } from "../src/crm/enrichment-log.service";
import { MailboxMatchService } from "../src/mailbox/mailbox-match.service";
import { TrackingCounterService } from "../src/tracking/tracking-counter.service";
import { TrackingFilingService } from "../src/tracking/tracking-filing.service";
import { APP_SETTING_ID } from "../src/workspace/staff-domains";

const suffix = process.env.TEST_RUN_ID ?? "domain-nha";
const NHA = "doitac-nha.vn";

const agent = {
	contactCreated: async () => true,
	companyCreated: async () => undefined,
	companyRequested: async () => true,
	withCrmEvents: async (_scope: string, viec: () => Promise<unknown>) => viec(),
	workspaceChanged: async () => undefined,
} as unknown as AgentTriggerService;

const hopThu = new MailboxMatchService(
	db,
	new CompanyDirectoryService(agent),
	agent,
	new EnrichmentLogService(db, new ActivityStampService(db)),
);

const lapHoSo = new TrackingFilingService(
	db,
	new TrackingCounterService(db),
	new CompanyDirectoryService(agent),
	agent,
	new ActivityStampService(db),
);

async function datDomainNha(value: string | null) {
	await db.appSetting.upsert({
		where: { id: APP_SETTING_ID },
		create: { id: APP_SETTING_ID, staffEmailDomains: value },
		update: { staffEmailDomains: value },
	});
}

async function dungKho() {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: {
			id: WORKSPACE_ID,
			name: "CRM",
			slug: "crm",
			createdAt: new Date(),
		},
		update: {},
	});
}

async function don() {
	await db.formSubmission.deleteMany({
		where: { id: { startsWith: `${suffix}-` } },
	});
	await db.invitation.deleteMany({
		where: { id: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

async function nopForm(phan: string, email: string) {
	const id = `${suffix}-${phan}`;

	await db.formSubmission.create({
		data: {
			id,
			host: "www.example.test",
			path: "/lien-he",
			email,
			fields: {},
			dedupeKey: id,
		},
	});

	try {
		const ket = await lapHoSo.file({
			id,
			email,
			host: "www.example.test",
			visitorId: null,
			name: "Ai Do",
		});
		return ket.filed ? null : ket.reason;
	} catch {
		return "di qua cong domain nha roi hong o buoc sau";
	}
}

function aiVaoDuoc(status: "pending" | "cancelled") {
	return decideSignIn({
		email: "khach@gmail.com",
		allowances: [{ email: "khach@gmail.com", role: "member", status }],
		seedList: "",
		anyUserExists: true,
	}).allowed;
}

describe("domain nha tach khoi danh sach nguoi", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("doi o domain nha thi HAI DUONG DOC THAT doi theo, ai-vao-duoc KHONG doi", async () => {
		await datDomainNha(null);
		const nhaTruoc = (await hopThu.internalIdentity()).domains.has(NHA);
		const nopTruoc = await nopForm("truoc", `nguoi@${NHA}`);
		const vaoTruoc = aiVaoDuoc("pending");

		await datDomainNha(NHA);
		const nhaSau = (await hopThu.internalIdentity()).domains.has(NHA);
		const nopSau = await nopForm("sau", `nguoi@${NHA}`);
		const vaoSau = aiVaoDuoc("pending");

		expect([
			nhaTruoc,
			nhaSau,
			nopTruoc,
			nopSau,
			"hai duong doc THAT doi theo o domain nha",
		]).toEqual([
			false,
			true,
			"di qua cong domain nha roi hong o buoc sau",
			"One of our own addresses",
			"hai duong doc THAT doi theo o domain nha",
		]);

		expect([
			vaoTruoc,
			vaoSau,
			"ai-vao-duoc KHONG doi theo o domain nha",
		]).toEqual([true, true, "ai-vao-duoc KHONG doi theo o domain nha"]);
	});

	it("them roi rut mot loi cho phep thi HAI DUONG DOC THAT khong doi", async () => {
		await datDomainNha(NHA);

		const nhaKhiCoPhep = (await hopThu.internalIdentity()).domains.has(NHA);
		const nopKhiCoPhep = await nopForm("co-phep", `nguoi@${NHA}`);
		const vaoKhiCoPhep = aiVaoDuoc("pending");

		const nhaKhiRut = (await hopThu.internalIdentity()).domains.has(NHA);
		const nopKhiRut = await nopForm("da-rut", `nguoi@${NHA}`);
		const vaoKhiRut = aiVaoDuoc("cancelled");

		expect([
			nhaKhiCoPhep,
			nhaKhiRut,
			nopKhiCoPhep,
			nopKhiRut,
			"hai duong doc THAT dung yen qua ca hai luot",
		]).toEqual([
			true,
			true,
			"One of our own addresses",
			"One of our own addresses",
			"hai duong doc THAT dung yen qua ca hai luot",
		]);

		expect([vaoKhiCoPhep, vaoKhiRut, "ai-vao-duoc thi CO doi"]).toEqual([
			true,
			false,
			"ai-vao-duoc thi CO doi",
		]);
	});

	it("dia chi NGOAI domain nha khong bi hai duong doc coi la nguoi nha", async () => {
		await datDomainNha(NHA);

		const nop = await nopForm("nguoi-ngoai", "khach@doitac-khac.vn");

		expect([
			nop,
			"doi chung: dia chi ngoai domain nha KHONG bi bo qua vi ly do nguoi nha",
		]).not.toEqual([
			"One of our own addresses",
			"doi chung: dia chi ngoai domain nha KHONG bi bo qua vi ly do nguoi nha",
		]);
	});
});
