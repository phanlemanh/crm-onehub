import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { API_KEY_HEADER, auth } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { hashPassword } from "better-auth/crypto";
import request from "supertest";
import { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { WorkspaceService } from "../src/workspace/workspace.service";
import { gieoThanhVien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "go-la-cat-quyen";
const MAT_KHAU = "mat-khau-thu-du-dai-1";

const THU_TUC_DU_LIEU = [
	{ ten: "contacts.list", input: {} },
	{ ten: "companies.list", input: {} },
	{ ten: "deals.list", input: {} },
	{ ten: "activities.myTasks", input: {} },
	{ ten: "search.quick", input: { q: "a" } },
	{ ten: "campaigns.list", input: undefined },
] as const;

let app: INestApplication;
let workspace: WorkspaceService;

const id = (phan: string) => `${suffix}-${phan}`;

function duongDoc(ten: string, input: unknown): string {
	return input === undefined
		? `/api/trpc/${ten}`
		: `/api/trpc/${ten}?input=${encodeURIComponent(JSON.stringify(input))}`;
}

async function goiDoc(
	ten: string,
	input: unknown,
	dau: Record<string, string>,
): Promise<number> {
	let req = request(app.getHttpServer()).get(duongDoc(ten, input));
	for (const [k, v] of Object.entries(dau)) req = req.set(k, v);
	return (await req).status;
}

async function datMatKhau(userId: string): Promise<string> {
	const email = `${userId}@thu.test`;
	await db.account.upsert({
		where: { id: `acc-${userId}` },
		create: {
			id: `acc-${userId}`,
			accountId: userId,
			providerId: "credential",
			userId,
			password: await hashPassword(MAT_KHAU),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		update: {},
	});
	return email;
}

async function dangNhap(email: string): Promise<string> {
	const { headers } = await auth.api.signInEmail({
		body: { email, password: MAT_KHAU },
		returnHeaders: true,
	});
	return headers
		.getSetCookie()
		.map((c) => c.split(";")[0])
		.join("; ");
}

async function memberId(userId: string): Promise<string> {
	const row = await db.member.findFirstOrThrow({
		where: { organizationId: WORKSPACE_ID, userId },
		select: { id: true },
	});
	return row.id;
}

async function don() {
	const users = { startsWith: `${suffix}-` };
	await db.apikey.deleteMany({ where: { referenceId: users } });
	await db.session.deleteMany({ where: { userId: users } });
	await db.account.deleteMany({ where: { userId: users } });
	await db.member.deleteMany({ where: { userId: users } });
	await db.invitation.deleteMany({
		where: { email: { contains: suffix } },
	});
	await db.user.deleteMany({ where: { id: users } });
}

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = moduleFixture.createNestApplication({ bodyParser: false });
	await app.init();
	workspace = new WorkspaceService(db, {
		workspaceChanged: async () => undefined,
	} as unknown as AgentTriggerService);
});

afterAll(async () => {
	await don();
	await app.close();
});

describe("go-la-cat-quyen", () => {
	let chu: string;
	let bi: string;
	let emailBi: string;

	beforeEach(async () => {
		await don();
		chu = id("chu");
		bi = id("bi");
		await gieoThanhVien(chu, "owner");
		await gieoThanhVien(bi, "member");
		emailBi = await datMatKhau(bi);
	});

	test("doi-chung: thanh vien con trong kho doc duoc du lieu", async () => {
		const cookie = await dangNhap(emailBi);
		for (const { ten, input } of THU_TUC_DU_LIEU) {
			expect(
				await goiDoc(ten, input, { cookie }),
				`${ten} phai tra 200 cho thanh vien dang con trong kho`,
			).toBe(200);
		}
	});

	test("duong-1-dang-nhap-lai: bi go roi dang nhap lai khong doc duoc du lieu", async () => {
		await workspace.removeMember(chu, { memberId: await memberId(bi) });
		const cookie = await dangNhap(emailBi);
		for (const { ten, input } of THU_TUC_DU_LIEU) {
			expect(
				await goiDoc(ten, input, { cookie }),
				`${ten}: nguoi da bi go dang nhap lai van doc duoc`,
			).toBe(403);
		}
	});

	test("duong-2-khoa-cu: khoa API tao truoc luot go khong con doc duoc", async () => {
		const khoa = await auth.api.createApiKey({
			body: { name: "khoa-thu", userId: bi },
		});
		expect(
			await goiDoc("contacts.list", {}, { [API_KEY_HEADER]: khoa.key }),
			"doi chung: khoa con song truoc luot go phai doc duoc",
		).toBe(200);
		await workspace.removeMember(chu, { memberId: await memberId(bi) });
		for (const { ten, input } of THU_TUC_DU_LIEU) {
			expect(
				await goiDoc(ten, input, { [API_KEY_HEADER]: khoa.key }),
				`${ten}: khoa API cua nguoi da bi go van doc duoc`,
			).toBe(403);
		}
		const quaRest = await request(app.getHttpServer())
			.post("/rest/contacts/search")
			.set(API_KEY_HEADER, khoa.key)
			.set("content-type", "application/json")
			.send(JSON.stringify({}));
		expect(
			quaRest.status,
			"cau REST: khoa API cua nguoi da bi go van doc duoc",
		).toBe(403);
	});

	test("duong-2-khoa-moi: nguoi da bi go khong tao duoc khoa moi", async () => {
		await workspace.removeMember(chu, { memberId: await memberId(bi) });
		const cookie = await dangNhap(emailBi);
		const quaTrpc = await request(app.getHttpServer())
			.post("/api/trpc/apiKeys.create")
			.set("cookie", cookie)
			.set("content-type", "application/json")
			.send(JSON.stringify({ name: "khoa-sau-go", expiresInDays: null }));
		const quaAuth = await request(app.getHttpServer())
			.post("/api/auth/api-key/create")
			.set("cookie", cookie)
			.set("content-type", "application/json")
			.send(JSON.stringify({ name: "khoa-sau-go-2" }));
		const soKhoa = await db.apikey.count({ where: { referenceId: bi } });
		expect(
			{ quaTrpc: quaTrpc.status, quaAuth: quaAuth.status, soKhoa },
			"nguoi da bi go van tao duoc khoa moi",
		).toEqual({ quaTrpc: 403, quaAuth: 403, soKhoa: 0 });
	});

	test("duong-3-tab-dang-mo: phien dang mo mat quyen ngay khi bi go", async () => {
		const cookie = await dangNhap(emailBi);
		expect(cookie, "dang nhap phai tra ca cookie cache phien").toContain(
			"session_data",
		);
		await workspace.removeMember(chu, { memberId: await memberId(bi) });
		for (const { ten, input } of THU_TUC_DU_LIEU) {
			expect(
				await goiDoc(ten, input, { cookie }),
				`${ten}: tab dang mo cua nguoi da bi go van doc duoc`,
			).not.toBe(200);
		}
	});

	test("cau-hoi-tu-cach: nguoi da bi go van hoi duoc tu cach va nhan viewerRole null", async () => {
		await workspace.removeMember(chu, { memberId: await memberId(bi) });
		const cookie = await dangNhap(emailBi);
		const res = await request(app.getHttpServer())
			.get("/api/trpc/workspace.get")
			.set("cookie", cookie);
		expect(res.status, "workspace.get phai tra 200 cho proxy").toBe(200);
		expect(res.body.result.data.viewerRole).toBe(null);
	});
});
