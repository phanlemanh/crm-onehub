import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setDefaultTimeout,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { postRunSlackMessage } from "../agent/lib/run-runtime";

const HAN_CA_MS = 60_000;

setDefaultTimeout(HAN_CA_MS);

const nguoiNhan = await import("../agent/lib/slack-nguoi-nhan").catch(
	() => null,
);
const TU_CHOI =
	nguoiNhan?.TU_CHOI_NGUOI_NHAN ?? "chua co hang TU_CHOI_NGUOI_NHAN";
const KHONG_KIEM =
	nguoiNhan?.KHONG_KIEM_DUOC_NGUOI_NHAN ??
	"chua co hang KHONG_KIEM_DUOC_NGUOI_NHAN";

const suffix = `${process.env.TEST_RUN_ID ?? "stqe"}-stqe`;

const NGUOI = {
	okr: {
		id: `${suffix}-okr`,
		vai: "okr",
		slack: "SOKR",
		email: `${suffix}-okr@thu.test`,
	},
	member: {
		id: `${suffix}-member`,
		vai: "member",
		slack: "SMEM",
		email: `${suffix}-member@thu.test`,
	},
	admin: {
		id: `${suffix}-admin`,
		vai: "admin",
		slack: "SADM",
		email: `${suffix}-admin@thu.test`,
	},
	owner: {
		id: `${suffix}-owner`,
		vai: "owner",
		slack: "SOWN",
		email: `${suffix}-owner@thu.test`,
	},
} as const;

type Nguoi = (typeof NGUOI)[keyof typeof NGUOI];
type TrangSlack = { members: unknown[]; next?: string };
type KichBan = {
	kenh: Record<string, TrangSlack>;
	danhBa: Record<string, TrangSlack>;
};

const realFetch = globalThis.fetch;
let dem: Record<string, number> = {};

function giaSlack(kb: KichBan) {
	dem = {};
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = new URL(input instanceof Request ? input.url : String(input));
		const method = url.pathname.replace("/api/", "");
		dem[method] = (dem[method] ?? 0) + 1;
		const body = init?.body ? JSON.parse(String(init.body)) : {};
		const cursor = url.searchParams.get("cursor") ?? body.cursor ?? "";
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

const motTrang = (members: unknown[]) => ({ "": { members } });

function thieuEmail(id: string) {
	return { id, name: id.toLowerCase(), profile: {} };
}

function coEmail(
	id: string,
	email: string,
	extra: Record<string, boolean> = {},
) {
	return { id, name: id.toLowerCase(), profile: { email }, ...extra };
}

const danhBaThieu = (them: unknown[] = []) =>
	motTrang([...Object.values(NGUOI).map((n) => thieuEmail(n.slack)), ...them]);

function soPost() {
	return dem["chat.postMessage"] ?? 0;
}

function chuaDang() {
	const n = soPost();
	if (n !== 0) throw new Error(`chat.postMessage=${n}`);
}

async function khop(...nguoi: Nguoi[]) {
	for (const n of nguoi) {
		await db.slackMemberMatch.create({
			data: { crmUserId: n.id, slackUserId: n.slack },
		});
	}
}

let agentKenh = "";
let agentTinOkr = "";
let agentTinMember = "";

async function tacNhan(destination: {
	kind: "channel" | "user";
	id: string;
	label: string;
}) {
	const agent = await db.agentDefinition.create({
		data: {
			name: `stqe ${destination.label}`,
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

async function dang(agentId: string) {
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
			idempotencyKey: `stqe-${crypto.randomUUID()}`,
			correlationId: crypto.randomUUID(),
			events: { create: { sequence: 0, type: "run.queued", data: {} } },
		},
		select: { id: true },
	});
	const ket = await postRunSlackMessage(run.id, crypto.randomUUID(), {
		text: "Deal update",
	}).then(
		(value) => ({ ok: true as const, value }),
		(error: Error) => ({ ok: false as const, error }),
	);
	const action = await db.agentAction.findFirst({
		where: { runId: run.id },
		orderBy: { plannedAt: "desc" },
	});
	return { ket, action };
}

type Ket = Awaited<ReturnType<typeof dang>>;

function tuChoi(ket: Ket) {
	chuaDang();
	expect(ket.ket.ok, "loi goi dang phai bi tu choi").toBe(false);
	expect(ket.action?.status).toBe("FAILED");
	expect(ket.action?.errorCode).toBe("ACTION_REJECTED");
	return ket.action?.errorMessage ?? "";
}

function tuChoiKhongRo(ket: Ket, so: number) {
	const msg = tuChoi(ket);
	const nem = ket.ket.ok ? "" : ket.ket.error.message;
	const dau = `${KHONG_KIEM} (${so} ${so === 1 ? "person" : "people"} `;
	expect(nem.startsWith(dau), `loi nem: ${nem}`).toBe(true);
	expect(msg.startsWith(dau), `thong diep: ${msg}`).toBe(true);
	expect(msg).toContain("reconnect Slack");
	expect(msg).not.toContain(TU_CHOI);
	return msg;
}

function tuChoiNguoiNhan(ket: Ket) {
	const msg = tuChoi(ket);
	expect(msg).toContain(TU_CHOI);
	expect(msg).not.toContain(KHONG_KIEM);
	return msg;
}

function daDang(ket: Ket) {
	expect(ket.ket.ok, ket.ket.ok ? "" : ket.ket.error.message).toBe(true);
	expect(soPost()).toBe(1);
	expect(ket.action?.status).toBe("SUCCEEDED");
}

function danhTinh() {
	return Object.values(NGUOI).flatMap((n) => [
		n.email,
		n.id,
		n.slack,
		n.slack.toLowerCase(),
	]);
}

function chuoiLo(msg: string) {
	const thap = msg.toLowerCase();
	return danhTinh().filter((s) => thap.includes(s.toLowerCase()));
}

beforeAll(async () => {
	const now = new Date();
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: now },
		update: {},
	});
	for (const n of Object.values(NGUOI)) {
		await db.user.upsert({
			where: { id: n.id },
			create: {
				id: n.id,
				name: n.id,
				email: n.email,
				emailVerified: true,
				createdAt: now,
				updatedAt: now,
			},
			update: {},
		});
		await db.member.upsert({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: n.id },
			},
			create: {
				id: `member-${n.id}`,
				organizationId: WORKSPACE_ID,
				userId: n.id,
				role: n.vai,
				createdAt: now,
			},
			update: { role: n.vai },
		});
	}
	await db.account.upsert({
		where: { id: `${suffix}-slack` },
		create: {
			id: `${suffix}-slack`,
			accountId: `${suffix}-slack`,
			providerId: "slack",
			userId: NGUOI.owner.id,
			accessToken: "xoxb-stqe",
		},
		update: {},
	});
	agentKenh = await tacNhan({ kind: "channel", id: "CKENH", label: "#chung" });
	agentTinOkr = await tacNhan({
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
	await db.slackMemberMatch.deleteMany({
		where: { crmUserId: { startsWith: suffix } },
	});
});

afterAll(async () => {
	const agentIds = [agentKenh, agentTinOkr, agentTinMember].filter(Boolean);
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

describe("slack-thieu-quyen-email", () => {
	test("stqe-kenh: kenh co nguoi chi OKR chua khop khi Slack khong cho thay email", async () => {
		await khop(NGUOI.member);
		giaSlack({
			kenh: motTrang([NGUOI.okr.slack, NGUOI.member.slack]),
			danhBa: danhBaThieu(),
		});
		tuChoiKhongRo(await dang(agentKenh), 1);

		giaSlack({
			kenh: motTrang([NGUOI.member.slack, NGUOI.okr.slack]),
			danhBa: {
				"": { members: [thieuEmail(NGUOI.member.slack)], next: "c2" },
				c2: { members: [thieuEmail(NGUOI.okr.slack)] },
			},
		});
		tuChoiKhongRo(await dang(agentKenh), 1);
		expect(dem["users.list"] ?? 0, `users.list=${dem["users.list"] ?? 0}`).toBe(
			2,
		);

		giaSlack({ kenh: motTrang([NGUOI.member.slack]), danhBa: danhBaThieu() });
		daDang(await dang(agentKenh));
	});

	test("stqe-tin-rieng: tin rieng toi nguoi chi OKR chua khop khong mo hoi thoai", async () => {
		giaSlack({ kenh: {}, danhBa: danhBaThieu() });
		const ket = await dang(agentTinOkr);
		const moi = { open: dem["conversations.open"] ?? 0, post: soPost() };
		if (moi.open !== 0 || moi.post !== 0) {
			throw new Error(
				`conversations.open=${moi.open} chat.postMessage=${moi.post}`,
			);
		}
		tuChoiKhongRo(ket, 1);

		await khop(NGUOI.okr);
		giaSlack({ kenh: {}, danhBa: motTrang([]) });
		tuChoiNguoiNhan(await dang(agentTinOkr));

		await khop(NGUOI.member);
		giaSlack({ kenh: {}, danhBa: danhBaThieu() });
		const doiChung = await dang(agentTinMember);
		expect({ open: dem["conversations.open"] ?? 0, post: soPost() }).toEqual({
			open: 1,
			post: 1,
		});
		expect(doiChung.ket.ok).toBe(true);
	});

	test("stqe-dong-khop: dong khop la nguon nhan dien khi khong co email", async () => {
		await khop(NGUOI.member, NGUOI.admin, NGUOI.owner);
		giaSlack({
			kenh: motTrang([
				NGUOI.member.slack,
				NGUOI.admin.slack,
				NGUOI.owner.slack,
				"SBOT",
			]),
			danhBa: danhBaThieu([
				{ id: "SBOT", name: "sbot", profile: {}, is_bot: true },
			]),
		});
		daDang(await dang(agentKenh));

		await khop(NGUOI.okr);
		giaSlack({
			kenh: motTrang([NGUOI.member.slack, NGUOI.admin.slack, NGUOI.okr.slack]),
			danhBa: danhBaThieu(),
		});
		tuChoiNguoiNhan(await dang(agentKenh));
	});

	test("stqe-uu-tien: nguoi bi chan thang nguoi khong xac dinh", async () => {
		const danhBa = motTrang([
			coEmail(NGUOI.okr.slack, NGUOI.okr.email),
			thieuEmail(NGUOI.member.slack),
		]);
		giaSlack({ kenh: motTrang([NGUOI.okr.slack, NGUOI.member.slack]), danhBa });
		tuChoiNguoiNhan(await dang(agentKenh));

		giaSlack({ kenh: motTrang([NGUOI.member.slack]), danhBa });
		tuChoiKhongRo(await dang(agentKenh), 1);
	});

	test("stqe-ba-hinh: ba hinh tra loi thieu email cho cung ket qua", async () => {
		await khop(NGUOI.admin);
		const maTran: Array<[string, unknown]> = [
			["khoa-vang", { id: NGUOI.member.slack, name: "smem", profile: {} }],
			[
				"email-null",
				{ id: NGUOI.member.slack, name: "smem", profile: { email: null } },
			],
			["khong-profile", { id: NGUOI.member.slack, name: "smem" }],
		];
		let soHang = 0;
		for (const [ten, muc] of maTran) {
			giaSlack({
				kenh: motTrang([NGUOI.admin.slack, NGUOI.member.slack]),
				danhBa: motTrang([thieuEmail(NGUOI.admin.slack), muc]),
			});
			const ket = await dang(agentKenh);
			try {
				tuChoiKhongRo(ket, 1);
			} catch (error) {
				throw new Error(
					`hang ${ten}: ${ket.action?.errorMessage ?? ""} — ${(error as Error).message}`,
				);
			}
			soHang += 1;
		}
		expect(soHang).toBe(3);

		giaSlack({
			kenh: motTrang([NGUOI.admin.slack, NGUOI.member.slack]),
			danhBa: motTrang([
				thieuEmail(NGUOI.admin.slack),
				coEmail(NGUOI.member.slack, NGUOI.member.email),
			]),
		});
		daDang(await dang(agentKenh));
	});

	test("stqe-khong-tinh: bot, tai khoan da xoa, nguoi ngoai danh ba, email ngoai CRM khong tinh", async () => {
		await khop(NGUOI.admin);
		giaSlack({
			kenh: motTrang([
				NGUOI.admin.slack,
				"SBOT",
				"SXOA1",
				"SXOA2",
				"SNGOAI",
				"SCONNECT",
			]),
			danhBa: motTrang([
				thieuEmail(NGUOI.admin.slack),
				{ id: "SBOT", name: "sbot", profile: {}, is_bot: true },
				{ id: "SXOA1", name: "sxoa1", profile: {}, deleted: true },
				coEmail("SXOA2", NGUOI.okr.email, { deleted: true }),
				coEmail("SNGOAI", "khach@ngoai.test"),
			]),
		});
		const ket = await dang(agentKenh);
		daDang(ket);
		expect(ket.ket.ok && ket.ket.value.replayed).toBe(false);
	});

	test("stqe-loi-nhan: loi tu choi dem dung nguoi khong xac dinh va khong lo danh tinh", async () => {
		expect(chuoiLo(`x ${NGUOI.okr.email.toUpperCase()} y`)).toContain(
			NGUOI.okr.email,
		);
		expect(chuoiLo("Refused: SOKR")).toContain(NGUOI.okr.slack);

		await khop(NGUOI.owner);
		giaSlack({
			kenh: motTrang([
				NGUOI.member.slack,
				NGUOI.admin.slack,
				NGUOI.owner.slack,
				"SNGOAI",
			]),
			danhBa: danhBaThieu([coEmail("SNGOAI", "khach@ngoai.test")]),
		});
		const hai = tuChoiKhongRo(await dang(agentKenh), 2);
		expect(hai).not.toContain("4 people");
		expect(hai).not.toContain("3 people");
		expect(hai).toContain("email");
		expect(chuoiLo(hai), `chuoi lo: ${chuoiLo(hai).join(", ")}`).toEqual([]);

		giaSlack({
			kenh: motTrang([NGUOI.member.slack, NGUOI.owner.slack]),
			danhBa: danhBaThieu(),
		});
		const mot = tuChoiKhongRo(await dang(agentKenh), 1);
		expect(chuoiLo(mot), `chuoi lo: ${chuoiLo(mot).join(", ")}`).toEqual([]);
	});
});
