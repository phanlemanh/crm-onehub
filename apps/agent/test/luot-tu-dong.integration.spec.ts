import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setDefaultTimeout,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { SendFn } from "eve/channels";
import {
	BRIDGE_AUDIENCE,
	BRIDGE_ISSUER,
	repFromCrm,
} from "../agent/channels/eve";
import { type isAutomated, sensitiveWrite } from "../agent/lib/approval";
import {
	builderSessionAuthFromRow,
	dispatchAgentRun,
} from "../agent/lib/custom-agent-dispatch";
import { taskAuth } from "../agent/lib/dispatch";
import type { LeasedTask } from "../agent/lib/tasks";
import { hoiTacTu } from "../agent/lib/zalo-hoi";

const HAN_CA_MS = 60_000;

setDefaultTimeout(HAN_CA_MS);

const SECRET = "test-secret-at-least-long-enough-to-be-a-secret";
const suffix = `${process.env.TEST_RUN_ID ?? "luot-tu-dong"}-ltd`;
const nguoi = `${suffix}-member`;
const chatId = `${suffix}-chat`;
let agentId = "";
let versionId = "";

type BridgeHeader = { alg: string; typ: string };

type BridgeClaims = {
	iss: string;
	aud: string;
	sub: string;
	email: string;
	name: string;
	iat: number;
	nbf: number;
	exp: number;
};

async function mint(claims: BridgeClaims): Promise<string> {
	const encode = (value: BridgeClaims | BridgeHeader) =>
		Buffer.from(JSON.stringify(value)).toString("base64url");
	const signingInput = `${encode({ alg: "HS256", typ: "JWT" })}.${encode(claims)}`;
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(SECRET),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(signingInput),
	);
	return `${signingInput}.${Buffer.from(signature).toString("base64url")}`;
}

function request(token: string): Request {
	return new Request("https://agent.example.com/eve/v1/session", {
		method: "POST",
		headers: { authorization: `Bearer ${token}` },
	});
}

function claims(sub: string): BridgeClaims {
	const now = Math.floor(Date.now() / 1000);
	return {
		iss: BRIDGE_ISSUER,
		aud: BRIDGE_AUDIENCE,
		sub,
		email: `${sub}@thu.test`,
		name: sub,
		iat: now,
		nbf: now - 5,
		exp: now + 120,
	};
}

function task(): LeasedTask {
	return {
		id: "task_1",
		contactId: "contact_1",
		companyId: null,
		dealId: null,
		kind: "identify",
		reason: "A new contact",
		payload: null,
		budget: 4,
		attempts: 1,
		priority: 100,
		dueAt: new Date(),
	};
}

type PhienAuth = NonNullable<
	Parameters<typeof isAutomated>[0]["auth"]["current"]
>;

async function chinhSach(auth: PhienAuth | null): Promise<string> {
	const ket = await sensitiveWrite("Ask a person.")({
		session: { auth: { current: auth, initiator: null } },
	} as never);
	return JSON.stringify(ket);
}

type AuthGhiLai = {
	authenticator: string;
	principalId: string;
	principalType: string;
	attributes: Record<string, string>;
};

const XIN_DUYET = '"user-approval"';

const TU_CHOI = '"type":"denied"';

async function giaoLuot(initiatedById: string | null): Promise<AuthGhiLai> {
	const run = await db.agentRun.create({
		data: {
			agentId,
			versionId,
			triggerType: initiatedById ? "MANUAL" : "EVENT",
			status: "QUEUED",
			initiatedById,
			idempotencyKey: `ltd-${crypto.randomUUID()}`,
			correlationId: crypto.randomUUID(),
			events: { create: { sequence: 0, type: "run.queued", data: {} } },
		},
		select: { id: true },
	});
	let auth: AuthGhiLai | null = null;
	const send = (async (_message: string, options: { auth: AuthGhiLai }) => {
		auth = options.auth;
		return { id: `ltd-session-${run.id}` };
	}) as unknown as SendFn;
	await dispatchAgentRun(run.id, send);
	await db.agentRun.update({
		where: { id: run.id },
		data: { status: "CANCELLED", finishedAt: new Date() },
	});
	if (!auth) throw new Error("dispatchAgentRun khong goi send");
	return auth;
}

beforeAll(async () => {
	const now = new Date();
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: now },
		update: {},
	});
	await db.user.upsert({
		where: { id: nguoi },
		create: {
			id: nguoi,
			name: nguoi,
			email: `${nguoi}@thu.test`,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		},
		update: {},
	});
	await db.member.upsert({
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId: nguoi },
		},
		create: {
			id: `member-${nguoi}`,
			organizationId: WORKSPACE_ID,
			userId: nguoi,
			role: "member",
			createdAt: now,
		},
		update: { role: "member" },
	});
	const agent = await db.agentDefinition.create({
		data: { name: "ltd", status: "LIVE", createdById: nguoi },
		select: { id: true },
	});
	agentId = agent.id;
	const version = await db.agentVersion.create({
		data: {
			agentId,
			number: 1,
			status: "DEPLOYED",
			instructions: "Summarize.",
			manifest: {
				triggers: [
					{
						type: "MANUAL",
						name: "Run now",
						summary: "Run on demand",
						config: {},
					},
				],
				dataScope: {
					mode: "WORKSPACE",
					summary: "Workspace CRM records",
					resources: [],
				},
				actions: [
					{
						type: "run.summary",
						provider: "crm",
						summary: "Summarize the run",
					},
				],
			},
			modelId: "test/model",
			sandboxPolicy: {},
			createdById: nguoi,
			approvedAt: now,
			deployedAt: now,
		},
		select: { id: true },
	});
	versionId = version.id;
	await db.agentDefinition.update({
		where: { id: agentId },
		data: { currentVersionId: versionId },
	});
});

afterAll(async () => {
	await db.zaloHoi.deleteMany({ where: { zaloChatId: chatId } });
	if (agentId) {
		await db.agentRunEvent.deleteMany({ where: { run: { agentId } } });
		await db.agentRun.deleteMany({ where: { agentId } });
		await db.agentDefinition.updateMany({
			where: { id: agentId },
			data: { currentVersionId: null },
		});
		await db.agentVersion.deleteMany({ where: { agentId } });
		await db.agentDefinition.deleteMany({ where: { id: agentId } });
	}
	await db.member.deleteMany({ where: { userId: nguoi } });
	await db.user.deleteMany({ where: { id: nguoi } });
});

describe("luot-tu-dong", () => {
	test("lich: luot Tac nhan khong ai khoi la tu dong", async () => {
		const auth = await giaoLuot(null);
		expect(auth).toMatchObject({
			authenticator: "crm-schedule",
			attributes: { purpose: "team-agent" },
		});
		const ket = await chinhSach(auth);
		expect(ket, `chinh sach tra ve: ${ket}`).toContain(TU_CHOI);
		expect(ket).toContain("Not something to do unattended");
	});

	test("nguoi-bam: luot do nguoi bam chay cung la tu dong", async () => {
		const auth = await giaoLuot(nguoi);
		expect(auth).toMatchObject({
			authenticator: "crm-user",
			principalType: "user",
		});
		const ket = await chinhSach(auth);
		expect(ket, `chinh sach tra ve: ${ket}`).toContain(TU_CHOI);
	});

	test("giu-nguyen: phien co nguoi ngoi van xin duyet, viec nen van tu dong", async () => {
		const cauNoi = await repFromCrm(SECRET)(request(await mint(claims(nguoi))));
		expect(cauNoi, "cau noi phai xac thuc duoc thanh vien").not.toBe(null);
		const builder = builderSessionAuthFromRow(
			{
				id: "sub",
				commandType: "CREATE_AGENT",
				message: null,
				conversation: { userId: nguoi, title: null },
			},
			"conv",
		);
		const zalo = await db.$transaction((tx) =>
			hoiTacTu(
				tx,
				{ messageId: `${suffix}-m`, chatId, text: "hi" },
				nguoi,
				new Date(),
			),
		);
		expect(zalo.loai).toBe("hoi");
		const maTran: Array<[string, PhienAuth | null, string]> = [
			["cau-noi", cauNoi, XIN_DUYET],
			["builder", builder, XIN_DUYET],
			["zalo", zalo.loai === "hoi" ? zalo.yeuCau.auth : null, XIN_DUYET],
			["viec-nen", taskAuth(task()), TU_CHOI],
		];
		let soHang = 0;
		for (const [ten, auth, mongDoi] of maTran) {
			const ket = await chinhSach(auth);
			expect(ket, `${ten}: ${ket}`).toContain(mongDoi);
			soHang += 1;
		}
		expect(soHang).toBe(4);
	});
});
