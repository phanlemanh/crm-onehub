import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { postRunSlackMessage } from "../agent/lib/run-runtime";

const nguoiNhan = await import("../agent/lib/slack-nguoi-nhan").catch(
	() => null,
);
const TU_CHOI =
	nguoiNhan?.TU_CHOI_NGUOI_NHAN ?? "chua co hang TU_CHOI_NGUOI_NHAN";
const KHONG_KIEM =
	nguoiNhan?.KHONG_KIEM_DUOC_NGUOI_NHAN ??
	"chua co hang KHONG_KIEM_DUOC_NGUOI_NHAN";

const suffix = `${process.env.TEST_RUN_ID ?? "ro-slack"}-rst`;

const NGUOI = {
	okr: {
		id: `${suffix}-okr`,
		vai: "okr",
		slack: "UOKR",
		email: `${suffix}-okr@thu.test`,
	},
	member: {
		id: `${suffix}-member`,
		vai: "member",
		slack: "UMEM",
		email: `${suffix}-member@thu.test`,
	},
	admin: {
		id: `${suffix}-admin`,
		vai: "admin",
		slack: "UADM",
		email: `${suffix}-admin@thu.test`,
	},
	owner: {
		id: `${suffix}-owner`,
		vai: "owner",
		slack: "UOWN",
		email: `${suffix}-owner@thu.test`,
	},
} as const;

type TrangSlack = { members: unknown[]; next?: string };

type LoiSlack = "mang" | "hong" | { ok: false; error: string };

type KichBan = {
	kenh: Record<string, TrangSlack>;
	danhBa: Record<string, TrangSlack>;
	loi?: Partial<Record<string, LoiSlack>>;
};

const realFetch = globalThis.fetch;
let dem: Record<string, number> = {};
let cursors: Record<string, string[]> = {};

function giaSlack(kb: KichBan) {
	dem = {};
	cursors = {};
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = new URL(
			input instanceof Request ? input.url : String(input),
		);
		const method = url.pathname.replace("/api/", "");
		dem[method] = (dem[method] ?? 0) + 1;
		const body = init?.body ? JSON.parse(String(init.body)) : {};
		const cursor = url.searchParams.get("cursor") ?? body.cursor ?? "";
		cursors[method] = [...(cursors[method] ?? []), cursor];
		const loi = kb.loi?.[method];
		if (loi === "mang") throw new TypeError("fetch failed");
		if (loi === "hong") {
			return Response.json({ ok: true, members: "khong-phai-mang" });
		}
		if (loi) return Response.json(loi);
		const trang = (nguon: Record<string, TrangSlack>) => {
			const t = nguon[cursor] ?? { members: [] };
			return Response.json({
				ok: true,
				members: t.members,
				response_metadata: { next_cursor: t.next ?? "" },
			});
		};
		if (method === "conversations.members") return trang(kb.kenh);
		if (method === "users.list") return trang(kb.danhBa);
		if (method === "conversations.open") {
			return Response.json({ ok: true, channel: { id: "DOPEN" } });
		}
		if (method === "chat.postMessage") {
			return Response.json({
				ok: true,
				channel: "CKENH",
				ts: `${Date.now()}.1`,
			});
		}
		return Response.json({ ok: false, error: "unknown_method" });
	}) as typeof fetch;
}

function nguoiSlack(
	id: string,
	email: string | null,
	extra: Record<string, unknown> = {},
) {
	return { id, name: id.toLowerCase(), profile: { email }, ...extra };
}

function chuaDang() {
	const n = dem["chat.postMessage"] ?? 0;
	if (n !== 0) throw new Error(`chat.postMessage=${n}`);
}

let agentKenh = "";
let agentTin = "";
let agentTinMember = "";

async function tacNhan(destination: {
	kind: "channel" | "user";
	id: string;
	label: string;
}) {
	const agent = await db.agentDefinition.create({
		data: {
			name: `rst ${destination.label}`,
			status: "LIVE",
			createdById: NGUOI.owner.id,
		},
		select: { id: true },
	});
	const version = await db.agentVersion.create({
		data: {
			agentId: agent.id,
			number: 1,
			status: "DEPLOYED",
			instructions: "Post one message.",
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
					resources: [
						{ kind: "integration", id: "slack:workspace", label: "Slack" },
					],
				},
				actions: [
					{
						type: "slack.message.post",
						provider: "slack",
						summary: "Post the update",
						destination: { ...destination, resolution: "chosen" },
					},
					{
						type: "run.summary",
						provider: "crm",
						summary: "Summarize the run",
					},
				],
			},
			modelId: "test/model",
			sandboxPolicy: {},
			createdById: NGUOI.owner.id,
			approvedAt: new Date(),
			deployedAt: new Date(),
		},
		select: { id: true },
	});
	await db.agentDefinition.update({
		where: { id: agent.id },
		data: { currentVersionId: version.id },
	});
	return agent.id;
}

async function luot(agentId: string) {
	const agent = await db.agentDefinition.findUniqueOrThrow({
		where: { id: agentId },
		select: { currentVersionId: true },
	});
	const run = await db.agentRun.create({
		data: {
			agentId,
			versionId: agent.currentVersionId ?? "",
			triggerType: "MANUAL",
			status: "RUNNING",
			startedAt: new Date(),
			idempotencyKey: `rst-${crypto.randomUUID()}`,
			correlationId: crypto.randomUUID(),
			events: { create: { sequence: 0, type: "run.queued", data: {} } },
		},
		select: { id: true },
	});
	return run.id;
}

async function dang(agentId: string, runId?: string, callId?: string) {
	const id = runId ?? (await luot(agentId));
	const call = callId ?? crypto.randomUUID();
	const ket = await postRunSlackMessage(id, call, {
		text: "Deal update",
	}).then(
		(value) => ({ ok: true as const, value }),
		(error: Error) => ({ ok: false as const, error }),
	);
	const action = await db.agentAction.findFirst({
		where: { runId: id },
		orderBy: { plannedAt: "desc" },
	});
	return { runId: id, callId: call, ket, action };
}

function tuChoiVi(
	ketQua: Awaited<ReturnType<typeof dang>>,
	hang: string,
	khongChua: string,
) {
	chuaDang();
	const msg = ketQua.ket.ok ? "" : ketQua.ket.error.message;
	expect(ketQua.ket.ok, "loi goi dang phai bi tu choi").toBe(false);
	expect(msg).toContain(hang);
	expect(msg).not.toContain(khongChua);
	expect(ketQua.action?.status).toBe("FAILED");
	expect(ketQua.action?.errorCode).toBe("ACTION_REJECTED");
	const luu = ketQua.action?.errorMessage ?? "";
	expect(luu).toContain(hang);
	for (const nguoi of Object.values(NGUOI)) {
		expect(luu).not.toContain(nguoi.email);
		expect(luu).not.toContain(nguoi.id);
	}
	return msg;
}

const kenhHaiNguoi = (thuHai: string) => ({
	"": { members: [NGUOI.member.slack, thuHai] },
});

const danhBaDu = (them: unknown[] = []) => ({
	"": {
		members: [
			nguoiSlack(NGUOI.okr.slack, ` ${NGUOI.okr.email.toUpperCase()} `),
			nguoiSlack(NGUOI.member.slack, NGUOI.member.email),
			nguoiSlack(NGUOI.admin.slack, NGUOI.admin.email),
			nguoiSlack(NGUOI.owner.slack, NGUOI.owner.email),
			...them,
		],
	},
});

async function datVai(userId: string, role: string) {
	await db.member.update({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } },
		data: { role },
	});
}

beforeAll(async () => {
	const now = new Date();
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: now },
		update: {},
	});
	for (const nguoi of Object.values(NGUOI)) {
		await db.user.upsert({
			where: { id: nguoi.id },
			create: {
				id: nguoi.id,
				name: nguoi.id,
				email: nguoi.email,
				emailVerified: true,
				createdAt: now,
				updatedAt: now,
			},
			update: {},
		});
		await db.member.upsert({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: nguoi.id,
				},
			},
			create: {
				id: `member-${nguoi.id}`,
				organizationId: WORKSPACE_ID,
				userId: nguoi.id,
				role: nguoi.vai,
				createdAt: now,
			},
			update: { role: nguoi.vai },
		});
	}
	await db.account.upsert({
		where: { id: `${suffix}-slack` },
		create: {
			id: `${suffix}-slack`,
			accountId: `${suffix}-slack`,
			providerId: "slack",
			userId: NGUOI.owner.id,
			accessToken: "xoxb-rst",
		},
		update: {},
	});
	agentKenh = await tacNhan({ kind: "channel", id: "CKENH", label: "#chung" });
	agentTin = await tacNhan({
		kind: "user",
		id: NGUOI.okr.slack,
		label: "@okr",
	});
	agentTinMember = await tacNhan({
		kind: "user",
		id: NGUOI.member.slack,
		label: "@member",
	});
});

afterEach(async () => {
	globalThis.fetch = realFetch;
	await datVai(NGUOI.okr.id, "okr");
	await datVai(NGUOI.member.id, "member");
	await db.slackMemberMatch.deleteMany({
		where: { crmUserId: { startsWith: suffix } },
	});
});

afterAll(async () => {
	const agentIds = [agentKenh, agentTin, agentTinMember].filter(Boolean);
	await db.agentRunEvent.deleteMany({
		where: { run: { agentId: { in: agentIds } } },
	});
	await db.agentAction.deleteMany({ where: { agentId: { in: agentIds } } });
	await db.agentRun.deleteMany({ where: { agentId: { in: agentIds } } });
	await db.agentDefinition.updateMany({
		where: { id: { in: agentIds } },
		data: { currentVersionId: null },
	});
	await db.agentVersion.deleteMany({ where: { agentId: { in: agentIds } } });
	await db.agentDefinition.deleteMany({ where: { id: { in: agentIds } } });
	await db.account.deleteMany({ where: { id: `${suffix}-slack` } });
	await db.member.deleteMany({ where: { userId: { startsWith: suffix } } });
	await db.user.deleteMany({ where: { id: { startsWith: suffix } } });
});

describe("ro-slack-tac-nhan", () => {
	test("hai hang tu choi khac rong va khong chua nhau", () => {
		expect(TU_CHOI.length).toBeGreaterThan(0);
		expect(KHONG_KIEM.length).toBeGreaterThan(0);
		expect(TU_CHOI.includes(KHONG_KIEM) || KHONG_KIEM.includes(TU_CHOI)).toBe(
			false,
		);
	});

	test("khop-email: kenh co nguoi chi OKR khop email thi khong dang", async () => {
		giaSlack({ kenh: kenhHaiNguoi(NGUOI.okr.slack), danhBa: danhBaDu() });
		const msg = tuChoiVi(await dang(agentKenh), TU_CHOI, KHONG_KIEM);
		expect(msg).toContain("1");

		await datVai(NGUOI.okr.id, "member");
		giaSlack({ kenh: kenhHaiNguoi(NGUOI.okr.slack), danhBa: danhBaDu() });
		const doiChung = await dang(agentKenh);
		expect(
			dem["chat.postMessage"] ?? 0,
			"doi chung: vai member thi dang dung 1 lan",
		).toBe(1);
		expect(doiChung.ket.ok).toBe(true);
	});

	test("khop-bang: email Slack lech nhung bang khop chi dung nguoi chi OKR", async () => {
		const lech = {
			"": {
				members: [
					nguoiSlack(NGUOI.okr.slack, "khac-han@ngoai.test"),
					nguoiSlack(NGUOI.member.slack, NGUOI.member.email),
				],
			},
		};
		await db.slackMemberMatch.create({
			data: { crmUserId: NGUOI.okr.id, slackUserId: NGUOI.okr.slack },
		});
		giaSlack({ kenh: kenhHaiNguoi(NGUOI.okr.slack), danhBa: lech });
		tuChoiVi(await dang(agentKenh), TU_CHOI, KHONG_KIEM);

		await db.slackMemberMatch.deleteMany({ where: { crmUserId: NGUOI.okr.id } });
		giaSlack({ kenh: kenhHaiNguoi(NGUOI.okr.slack), danhBa: lech });
		await dang(agentKenh);
		expect(
			dem["chat.postMessage"] ?? 0,
			"doi chung: bo bang khop thi nguoi do la nguoi ngoai CRM",
		).toBe(1);
	});

	test("tin-truc-tiep: tin rieng toi nguoi chi OKR khong mo hoi thoai", async () => {
		giaSlack({ kenh: {}, danhBa: danhBaDu() });
		const ket = await dang(agentTin);
		expect({
			open: dem["conversations.open"] ?? 0,
			post: dem["chat.postMessage"] ?? 0,
		}).toEqual({ open: 0, post: 0 });
		tuChoiVi(ket, TU_CHOI, KHONG_KIEM);

		giaSlack({ kenh: {}, danhBa: danhBaDu() });
		await dang(agentTinMember);
		expect({
			open: dem["conversations.open"] ?? 0,
			post: dem["chat.postMessage"] ?? 0,
		}).toEqual({ open: 1, post: 1 });
	});

	test("vai-song: doi vai khong can dong bo Slack", async () => {
		await db.slackMemberMatch.create({
			data: { crmUserId: NGUOI.member.id, slackUserId: NGUOI.member.slack },
		});
		const kb = {
			kenh: { "": { members: [NGUOI.member.slack, NGUOI.admin.slack] } },
			danhBa: danhBaDu(),
		};
		giaSlack(kb);
		await dang(agentKenh);
		expect(dem["chat.postMessage"] ?? 0, "luot 1 vai member").toBe(1);

		await datVai(NGUOI.member.id, "okr");
		giaSlack(kb);
		tuChoiVi(await dang(agentKenh), TU_CHOI, KHONG_KIEM);

		await datVai(NGUOI.member.id, "member");
		giaSlack(kb);
		await dang(agentKenh);
		expect(dem["chat.postMessage"] ?? 0, "luot 3 ve lai member").toBe(1);
	});

	test("doi-chung: vai day du, bot, tai khoan da xoa, nguoi ngoai CRM thi dang mot lan", async () => {
		giaSlack({
			kenh: {
				"": {
					members: [
						NGUOI.member.slack,
						NGUOI.admin.slack,
						NGUOI.owner.slack,
						"UBOT",
						"UXOA",
						"UNGOAI",
					],
				},
			},
			danhBa: danhBaDu([
				nguoiSlack("UBOT", null, { is_bot: true }),
				nguoiSlack("UXOA", NGUOI.okr.email, { deleted: true }),
				nguoiSlack("UNGOAI", "khach@ngoai.test"),
			]),
		});
		const lan1 = await dang(agentKenh);
		expect(lan1.ket.ok, lan1.ket.ok ? "" : lan1.ket.error.message).toBe(true);
		expect(dem["chat.postMessage"] ?? 0).toBe(1);
		expect(lan1.action?.status).toBe("SUCCEEDED");
		expect(lan1.action?.externalId ?? "").toMatch(/^CKENH:/);

		const tong = Object.values(dem).reduce((a, b) => a + b, 0);
		const lan2 = await dang(agentKenh, lan1.runId, lan1.callId);
		expect(lan2.ket.ok && lan2.ket.value.replayed).toBe(true);
		expect(
			Object.values(dem).reduce((a, b) => a + b, 0),
			"phat lai khong goi Slack",
		).toBe(tong);
	});

	test("doc-loi: khong doc duoc nguoi nhan thi tu choi", async () => {
		const kenh = { "": { members: [NGUOI.member.slack] } };
		const maTran: Array<Partial<Record<string, LoiSlack>>> = [
			{ "conversations.members": { ok: false, error: "missing_scope" } },
			{ "users.list": { ok: false, error: "ratelimited" } },
			{ "conversations.members": "mang" },
			{ "conversations.members": "hong" },
		];
		let soHang = 0;
		for (const loi of maTran) {
			giaSlack({ kenh, danhBa: danhBaDu(), loi });
			tuChoiVi(await dang(agentKenh), KHONG_KIEM, TU_CHOI);
			soHang += 1;
		}
		expect(soHang).toBe(4);
	});

	test("phan-trang: nguoi chi OKR o trang hai cua ca hai danh sach", async () => {
		const kenh = {
			"": { members: [NGUOI.member.slack], next: "c2" },
			c2: { members: [NGUOI.okr.slack] },
		};
		const danhBa = {
			"": {
				members: [nguoiSlack(NGUOI.member.slack, NGUOI.member.email)],
				next: "c2",
			},
			c2: { members: [nguoiSlack(NGUOI.okr.slack, NGUOI.okr.email)] },
		};
		for (const t of [...Object.values(kenh), ...Object.values(danhBa)]) {
			expect(t).not.toHaveProperty("next_cursor");
		}
		giaSlack({ kenh, danhBa });
		tuChoiVi(await dang(agentKenh), TU_CHOI, KHONG_KIEM);
		expect(dem["conversations.members"] ?? 0).toBeGreaterThanOrEqual(2);
		expect(dem["users.list"] ?? 0).toBeGreaterThanOrEqual(2);
		expect(cursors["conversations.members"]).toContain("c2");
		expect(cursors["users.list"]).toContain("c2");

		giaSlack({
			kenh: { "": kenh[""], c2: { members: [NGUOI.admin.slack] } },
			danhBa: danhBaDu(),
		});
		await dang(agentKenh);
		expect(
			dem["chat.postMessage"] ?? 0,
			"doi chung: trang hai chi co vai day du",
		).toBe(1);
	});
});
