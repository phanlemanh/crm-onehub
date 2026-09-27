# Vá lối rò Slack của Tác nhân — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lượt Tác nhân không đăng được tin Slack tới nơi có người vai «chỉ OKR», và
lượt Tác nhân bị coi là tự động nên thao tác ghi nhạy cảm bị từ chối.

**Architecture:** Một mô-đun mới của bản rẽ (`apps/agent/agent/lib/slack-nguoi-nhan.ts`)
đọc ai ở đích Slack, ai là ai trong CRM, và từ chối; `postRunSlackMessage` gọi nó ngay
trước khi gửi. `isAutomated` nhận thêm phiên mang `purpose: "team-agent"`. Hai tệp của
hãng chỉ nhận một lời gọi, một nhánh mã lỗi, một vế điều kiện.

**Tech Stack:** Bun test, Prisma (`@crm/db`), Zod (`@crm/validation`), eve.

**Spec:** `docs/superpowers/specs/2026-09-27-ro-slack-tac-nhan-design.md`;
hợp đồng `_acceptance/ro-slack-tac-nhan/contract.md`; phép đo `_acceptance/ro-slack-tac-nhan/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Không số điều chỉnh được nào nằm tại chỗ; dùng lại `SLACK.request`, `SLACK.inventory` của `lib/slack-config.ts`.
- Trả lời Slack được phân tích bằng Zod ngay tại biên, không truyền `Record<string, unknown>`.
- Tệp của hãng bị sửa: đúng hai — `apps/agent/agent/lib/approval.ts`, `apps/agent/agent/lib/run-runtime.ts`. `slack-people.ts` cũng là tệp của hãng nên KHÔNG xuất hàm từ đó; bộ đọc Slack viết trong tệp của bản rẽ.
- Lời từ chối không chứa tên hay email người.
- Lệnh chứng ở gốc kho: `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build` (build cần Node 24 trong PATH).

## Review Focus

- Người vai «chỉ OKR» có email Slack viết hoa hoặc có khoảng trắng → vẫn khớp (Task 1, ca khop-email dùng email ` Hoa@... `).
- Một người xuất hiện hai lần trong danh sách thành viên kênh → đếm một lần (Task 2, `demNguoiChan` dùng `Set`).
- Tài khoản Slack đã xoá mang email người «chỉ OKR» → không chặn (Task 1, ca doi-chung).
- Phát lại một lượt đã đăng → không đọc lại Slack, không đăng lần hai (Task 1, ca doi-chung, vế gọi lại).
- Slack trả `ratelimited` → từ chối có lý do, không treo (Task 1, ca doc-loi hàng b).

---

### Task 1: Phép đo đỏ trước vá

**independent: false** · phục vụ E1–E11

**Files:**
- Create: `apps/agent/test/ro-slack-tac-nhan.integration.spec.ts`
- Create: `apps/agent/test/luot-tu-dong.integration.spec.ts`
- Create: `_acceptance/ro-slack-tac-nhan/rang/do-truoc-khi-va.mjs`

**Interfaces:**
- Consumes: `postRunSlackMessage(runId, callId, { text })` (`lib/run-runtime.ts`); `dispatchAgentRun(runId, send)`, `builderSessionAuthFromRow(row, conversationId)` (`lib/custom-agent-dispatch.ts`); `sensitiveWrite(instead)` (`lib/approval.ts`); `repFromCrm(secret)` (`channels/eve.ts`); `hoiTacTu(tx, tin, crmUserId, now)` (`lib/zalo-hoi.ts`); `taskAuth(task)` (`lib/dispatch.ts`).
- Produces: tên ca `khop-email`, `khop-bang`, `tin-truc-tiep`, `vai-song`, `doi-chung`, `doc-loi`, `phan-trang`, `lich`, `nguoi-bam`, `giu-nguyen` — khớp `-t` trong `_acceptance/config.yaml`.

- [ ] **Step 1: Viết tệp kiểm Slack**

Bộ giả Slack: `globalThis.fetch` thay trong mỗi ca, khôi phục ở `afterEach`. Trả lời theo đúng hình Slack Web API — con trỏ ở `response_metadata.next_cursor`, email ở `profile.email`.

```ts
import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { postRunSlackMessage } from "../agent/lib/run-runtime";

const nguoiNhan = await import("../agent/lib/slack-nguoi-nhan").catch(() => null);
const TU_CHOI = nguoiNhan?.TU_CHOI_NGUOI_NHAN ?? "chua co hang TU_CHOI_NGUOI_NHAN";
const KHONG_KIEM = nguoiNhan?.KHONG_KIEM_DUOC_NGUOI_NHAN ?? "chua co hang KHONG_KIEM_DUOC_NGUOI_NHAN";

const suffix = `${process.env.TEST_RUN_ID ?? "ro-slack"}-rst`;
const NGUOI = {
	okr: { id: `${suffix}-okr`, vai: "okr", slack: "UOKR", email: `${suffix}-okr@thu.test` },
	member: { id: `${suffix}-member`, vai: "member", slack: "UMEM", email: `${suffix}-member@thu.test` },
	admin: { id: `${suffix}-admin`, vai: "admin", slack: "UADM", email: `${suffix}-admin@thu.test` },
	owner: { id: `${suffix}-owner`, vai: "owner", slack: "UOWN", email: `${suffix}-owner@thu.test` },
} as const;

type TrangSlack = { members: unknown[]; next?: string };
type KichBan = {
	kenh: Record<string, TrangSlack>;
	danhBa: Record<string, TrangSlack>;
	loi?: Partial<Record<string, "mang" | "hong" | { ok: false; error: string }>>;
};
const realFetch = globalThis.fetch;
let dem: Record<string, number> = {};
let cursors: Record<string, string[]> = {};

function giaSlack(kb: KichBan) {
	dem = {};
	cursors = {};
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = new URL(String(input instanceof Request ? input.url : input));
		const method = url.pathname.replace("/api/", "");
		dem[method] = (dem[method] ?? 0) + 1;
		const body = init?.body ? JSON.parse(String(init.body)) : {};
		const cursor = url.searchParams.get("cursor") ?? body.cursor ?? "";
		cursors[method] = [...(cursors[method] ?? []), cursor];
		const loi = kb.loi?.[method];
		if (loi === "mang") throw new TypeError("fetch failed");
		if (loi === "hong") return Response.json({ ok: true, members: "khong-phai-mang" });
		if (loi) return Response.json(loi);
		const trang = (m: Record<string, TrangSlack>) => {
			const t = m[cursor] ?? { members: [] };
			return Response.json({ ok: true, members: t.members, response_metadata: { next_cursor: t.next ?? "" } });
		};
		if (method === "conversations.members") return trang(kb.kenh);
		if (method === "users.list") return trang(kb.danhBa);
		if (method === "conversations.open") return Response.json({ ok: true, channel: { id: "DOPEN" } });
		if (method === "chat.postMessage") return Response.json({ ok: true, channel: "CKENH", ts: `${Date.now()}.1` });
		return Response.json({ ok: false, error: "unknown_method" });
	}) as typeof fetch;
}

function nguoiSlack(id: string, email: string | null, extra: Record<string, unknown> = {}) {
	return { id, name: id.toLowerCase(), profile: { email }, ...extra };
}

function chuaDang() {
	const n = dem["chat.postMessage"] ?? 0;
	if (n !== 0) throw new Error(`chat.postMessage=${n}`);
}

let agentKenh = "";
let agentTin = "";
let agentTinMember = "";

async function tacNhan(destination: { kind: "channel" | "user"; id: string; label: string }) {
	const agent = await db.agentDefinition.create({
		data: { name: `rst ${destination.label}`, status: "LIVE", createdById: NGUOI.owner.id },
		select: { id: true },
	});
	const version = await db.agentVersion.create({
		data: {
			agentId: agent.id,
			number: 1,
			status: "DEPLOYED",
			instructions: "Post one message.",
			manifest: {
				triggers: [{ type: "MANUAL", name: "Run now", summary: "Run on demand", config: {} }],
				dataScope: {
					mode: "WORKSPACE",
					summary: "Workspace CRM records",
					resources: [{ kind: "integration", id: "slack:workspace", label: "Slack" }],
				},
				actions: [
					{ type: "slack.message.post", provider: "slack", summary: "Post the update", destination: { ...destination, resolution: "chosen" } },
					{ type: "run.summary", provider: "crm", summary: "Summarize the run" },
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
	await db.agentDefinition.update({ where: { id: agent.id }, data: { currentVersionId: version.id } });
	return agent.id;
}

async function luot(agentId: string) {
	const version = await db.agentDefinition.findUniqueOrThrow({ where: { id: agentId }, select: { currentVersionId: true } });
	const run = await db.agentRun.create({
		data: {
			agentId,
			versionId: version.currentVersionId ?? "",
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
	const ket = await postRunSlackMessage(id, call, { text: "Deal update" }).then(
		(value) => ({ ok: true as const, value }),
		(error: Error) => ({ ok: false as const, error }),
	);
	const action = await db.agentAction.findFirst({ where: { runId: id }, orderBy: { createdAt: "desc" } });
	return { runId: id, callId: call, ket, action };
}

function tuChoiVi(ket: Awaited<ReturnType<typeof dang>>, hang: string, khongChua: string) {
	chuaDang();
	expect(ket.ket.ok, "loi goi dang phai bi tu choi").toBe(false);
	const msg = ket.ket.ok ? "" : ket.ket.error.message;
	expect(msg).toContain(hang);
	expect(msg).not.toContain(khongChua);
	expect(ket.action?.status).toBe("FAILED");
	expect(ket.action?.errorCode).toBe("ACTION_REJECTED");
	expect(ket.action?.errorMessage ?? "").toContain(hang);
	for (const p of Object.values(NGUOI)) {
		expect(ket.action?.errorMessage ?? "").not.toContain(p.email);
		expect(ket.action?.errorMessage ?? "").not.toContain(p.id);
	}
	return msg;
}

const kenhHaiNguoi = (thuHai: string) => ({ "": { members: [NGUOI.member.slack, thuHai] } });
const danhBaDu = (extra: unknown[] = []) => ({
	"": {
		members: [
			nguoiSlack(NGUOI.okr.slack, ` ${NGUOI.okr.email.toUpperCase()} `),
			nguoiSlack(NGUOI.member.slack, NGUOI.member.email),
			nguoiSlack(NGUOI.admin.slack, NGUOI.admin.email),
			nguoiSlack(NGUOI.owner.slack, NGUOI.owner.email),
			...extra,
		],
	},
});

async function datVai(userId: string, role: string) {
	await db.member.update({ where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } }, data: { role } });
}

beforeAll(async () => {
	const now = new Date();
	await db.organization.upsert({ where: { id: WORKSPACE_ID }, create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: now }, update: {} });
	for (const p of Object.values(NGUOI)) {
		await db.user.upsert({ where: { id: p.id }, create: { id: p.id, name: p.id, email: p.email, emailVerified: true, createdAt: now, updatedAt: now }, update: {} });
		await db.member.upsert({
			where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId: p.id } },
			create: { id: `member-${p.id}`, organizationId: WORKSPACE_ID, userId: p.id, role: p.vai, createdAt: now },
			update: { role: p.vai },
		});
	}
	await db.account.create({ data: { id: `${suffix}-slack`, accountId: `${suffix}-slack`, providerId: "slack", userId: NGUOI.owner.id, accessToken: "xoxb-rst" } });
	agentKenh = await tacNhan({ kind: "channel", id: "CKENH", label: "#chung" });
	agentTin = await tacNhan({ kind: "user", id: NGUOI.okr.slack, label: "@okr" });
	agentTinMember = await tacNhan({ kind: "user", id: NGUOI.member.slack, label: "@member" });
});

afterEach(async () => {
	globalThis.fetch = realFetch;
	await datVai(NGUOI.okr.id, "okr");
	await datVai(NGUOI.member.id, "member");
	await db.slackMemberMatch.deleteMany({ where: { crmUserId: { startsWith: suffix } } });
});

afterAll(async () => {
	const agentIds = [agentKenh, agentTin, agentTinMember].filter(Boolean);
	await db.agentRunEvent.deleteMany({ where: { run: { agentId: { in: agentIds } } } });
	await db.agentAction.deleteMany({ where: { agentId: { in: agentIds } } });
	await db.agentRun.deleteMany({ where: { agentId: { in: agentIds } } });
	await db.agentDefinition.updateMany({ where: { id: { in: agentIds } }, data: { currentVersionId: null } });
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
		expect(TU_CHOI.includes(KHONG_KIEM) || KHONG_KIEM.includes(TU_CHOI)).toBe(false);
	});

	test("khop-email: kenh co nguoi chi OKR khop email thi khong dang", async () => {
		giaSlack({ kenh: kenhHaiNguoi(NGUOI.okr.slack), danhBa: danhBaDu() });
		const msg = tuChoiVi(await dang(agentKenh), TU_CHOI, KHONG_KIEM);
		expect(msg).toContain("1");
		await datVai(NGUOI.okr.id, "member");
		giaSlack({ kenh: kenhHaiNguoi(NGUOI.okr.slack), danhBa: danhBaDu() });
		const doiChung = await dang(agentKenh);
		expect(dem["chat.postMessage"] ?? 0, "doi chung: vai member thi dang dung 1 lan").toBe(1);
		expect(doiChung.ket.ok).toBe(true);
	});

	test("khop-bang: email Slack lech nhung bang khop chi dung nguoi chi OKR", async () => {
		const lech = { "": { members: [nguoiSlack(NGUOI.okr.slack, "khac-han@ngoai.test"), nguoiSlack(NGUOI.member.slack, NGUOI.member.email)] } };
		await db.slackMemberMatch.create({ data: { crmUserId: NGUOI.okr.id, slackUserId: NGUOI.okr.slack } });
		giaSlack({ kenh: kenhHaiNguoi(NGUOI.okr.slack), danhBa: lech });
		tuChoiVi(await dang(agentKenh), TU_CHOI, KHONG_KIEM);
		await db.slackMemberMatch.deleteMany({ where: { crmUserId: NGUOI.okr.id } });
		giaSlack({ kenh: kenhHaiNguoi(NGUOI.okr.slack), danhBa: lech });
		await dang(agentKenh);
		expect(dem["chat.postMessage"] ?? 0, "doi chung: bo bang khop thi nguoi do la nguoi ngoai CRM").toBe(1);
	});

	test("tin-truc-tiep: tin rieng toi nguoi chi OKR khong mo hoi thoai", async () => {
		giaSlack({ kenh: {}, danhBa: danhBaDu() });
		const ket = await dang(agentTin);
		expect({ open: dem["conversations.open"] ?? 0, post: dem["chat.postMessage"] ?? 0 }).toEqual({ open: 0, post: 0 });
		tuChoiVi(ket, TU_CHOI, KHONG_KIEM);
		giaSlack({ kenh: {}, danhBa: danhBaDu() });
		await dang(agentTinMember);
		expect({ open: dem["conversations.open"] ?? 0, post: dem["chat.postMessage"] ?? 0 }).toEqual({ open: 1, post: 1 });
	});

	test("vai-song: doi vai khong can dong bo Slack", async () => {
		await db.slackMemberMatch.create({ data: { crmUserId: NGUOI.member.id, slackUserId: NGUOI.member.slack } });
		const kb = { kenh: { "": { members: [NGUOI.member.slack, NGUOI.admin.slack] } }, danhBa: danhBaDu() };
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
		const kb = {
			kenh: { "": { members: [NGUOI.member.slack, NGUOI.admin.slack, NGUOI.owner.slack, "UBOT", "UXOA", "UNGOAI"] } },
			danhBa: danhBaDu([
				nguoiSlack("UBOT", null, { is_bot: true }),
				nguoiSlack("UXOA", NGUOI.okr.email, { deleted: true }),
				nguoiSlack("UNGOAI", "khach@ngoai.test"),
			]),
		};
		giaSlack(kb);
		const lan1 = await dang(agentKenh);
		expect(lan1.ket.ok, lan1.ket.ok ? "" : lan1.ket.error.message).toBe(true);
		expect(dem["chat.postMessage"] ?? 0).toBe(1);
		expect(lan1.action?.status).toBe("SUCCEEDED");
		expect(lan1.action?.externalId ?? "").toMatch(/^CKENH:/);
		const tong = Object.values(dem).reduce((a, b) => a + b, 0);
		const lan2 = await dang(agentKenh, lan1.runId, lan1.callId);
		expect(lan2.ket.ok && lan2.ket.value.replayed).toBe(true);
		expect(Object.values(dem).reduce((a, b) => a + b, 0), "phat lai khong goi Slack").toBe(tong);
	});

	test("doc-loi: khong doc duoc nguoi nhan thi tu choi", async () => {
		const kenh = { "": { members: [NGUOI.member.slack] } };
		const hang: KichBan["loi"][] = [
			{ "conversations.members": { ok: false, error: "missing_scope" } },
			{ "users.list": { ok: false, error: "ratelimited" } },
			{ "conversations.members": "mang" },
			{ "conversations.members": "hong" },
		];
		let soHang = 0;
		for (const loi of hang) {
			giaSlack({ kenh, danhBa: danhBaDu(), loi });
			tuChoiVi(await dang(agentKenh), KHONG_KIEM, TU_CHOI);
			soHang += 1;
		}
		expect(soHang).toBe(4);
	});

	test("phan-trang: nguoi chi OKR o trang hai cua ca hai danh sach", async () => {
		const kenh = { "": { members: [NGUOI.member.slack], next: "c2" }, c2: { members: [NGUOI.okr.slack] } };
		const danhBa = {
			"": { members: [nguoiSlack(NGUOI.member.slack, NGUOI.member.email)], next: "c2" },
			c2: { members: [nguoiSlack(NGUOI.okr.slack, NGUOI.okr.email)] },
		};
		for (const t of [...Object.values(kenh), ...Object.values(danhBa)]) expect(t).not.toHaveProperty("next_cursor");
		giaSlack({ kenh, danhBa });
		tuChoiVi(await dang(agentKenh), TU_CHOI, KHONG_KIEM);
		expect(dem["conversations.members"] ?? 0).toBeGreaterThanOrEqual(2);
		expect(dem["users.list"] ?? 0).toBeGreaterThanOrEqual(2);
		expect(cursors["conversations.members"]).toContain("c2");
		expect(cursors["users.list"]).toContain("c2");
		const kenhSach = { "": kenh[""], c2: { members: [NGUOI.admin.slack] } };
		giaSlack({ kenh: kenhSach, danhBa: danhBaDu() });
		await dang(agentKenh);
		expect(dem["chat.postMessage"] ?? 0, "doi chung: trang hai chi co vai day du").toBe(1);
	});
});
```

- [ ] **Step 2: Viết tệp kiểm lượt tự động**

```ts
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { SendFn } from "eve/channels";
import { repFromCrm, BRIDGE_AUDIENCE, BRIDGE_ISSUER } from "../agent/channels/eve";
import { sensitiveWrite } from "../agent/lib/approval";
import { builderSessionAuthFromRow, dispatchAgentRun } from "../agent/lib/custom-agent-dispatch";
import { taskAuth } from "../agent/lib/dispatch";
import type { LeasedTask } from "../agent/lib/tasks";
import { hoiTacTu } from "../agent/lib/zalo-hoi";

const SECRET = "test-secret-at-least-long-enough-to-be-a-secret";
const suffix = `${process.env.TEST_RUN_ID ?? "luot-tu-dong"}-ltd`;
const nguoi = `${suffix}-member`;
let agentId = "";
let versionId = "";

function chinhSach(auth: unknown) {
	return sensitiveWrite("Ask a person.")({ session: { auth: { current: auth, initiator: null } } } as never);
}
```

Mint token HS256 và dựng `Request` chép nguyên từ `apps/agent/test/kenh-chi-okr.spec.ts` (hàm `mint`, `request`, `claims`). `beforeAll` gieo organization + user + member vai `member`, một `agentDefinition` LIVE với `agentVersion` DEPLOYED (manifest như Task 1 nhưng chỉ có `run.summary`). Ca:

```ts
async function giaoLuot(initiatedById: string | null) {
	const run = await db.agentRun.create({
		data: { agentId, versionId, triggerType: initiatedById ? "MANUAL" : "EVENT", status: "QUEUED", initiatedById,
			idempotencyKey: `ltd-${crypto.randomUUID()}`, correlationId: crypto.randomUUID(),
			events: { create: { sequence: 0, type: "run.queued", data: {} } } },
		select: { id: true },
	});
	let auth: unknown = null;
	const send = (async (_message: string, options: { auth: unknown }) => {
		auth = options.auth;
		return { id: `ltd-session-${run.id}` };
	}) as unknown as SendFn;
	await dispatchAgentRun(run.id, send);
	await db.agentRun.update({ where: { id: run.id }, data: { status: "CANCELLED", finishedAt: new Date() } });
	return auth as { authenticator: string; principalType: string; attributes: Record<string, string> };
}

describe("luot-tu-dong", () => {
	test("lich: luot Tac nhan khong ai khoi la tu dong", async () => {
		const auth = await giaoLuot(null);
		expect(auth).toMatchObject({ authenticator: "crm-schedule", attributes: { purpose: "team-agent" } });
		const ket = chinhSach(auth);
		expect(ket, `chinh sach tra ve: ${JSON.stringify(ket)}`).toMatchObject({ type: "denied" });
		expect((ket as { reason: string }).reason).toContain("Not something to do unattended");
	});

	test("nguoi-bam: luot do nguoi bam chay cung la tu dong", async () => {
		const auth = await giaoLuot(nguoi);
		expect(auth).toMatchObject({ authenticator: "crm-user", principalType: "user" });
		expect(chinhSach(auth), JSON.stringify(chinhSach(auth))).toMatchObject({ type: "denied" });
	});

	test("giu-nguyen: phien co nguoi ngoi van xin duyet, viec nen van tu dong", async () => {
		const cauNoi = await repFromCrm(SECRET)(request(await mint(claims(nguoi))));
		const builder = builderSessionAuthFromRow(
			{ id: "sub", commandType: "CREATE_AGENT", message: null, conversation: { userId: nguoi, title: null } },
			"conv",
		);
		const zalo = await db.$transaction((tx) =>
			hoiTacTu(tx, { messageId: `${suffix}-m`, chatId: `${suffix}-chat`, text: "hi" }, nguoi, new Date()),
		);
		expect(zalo.loai).toBe("hoi");
		const viecNen = taskAuth(task());
		const maTran: Array<[string, unknown, unknown]> = [
			["cau-noi", cauNoi, "user-approval"],
			["builder", builder, "user-approval"],
			["zalo", zalo.loai === "hoi" ? zalo.yeuCau.auth : null, "user-approval"],
			["viec-nen", viecNen, { type: "denied" }],
		];
		let soHang = 0;
		for (const [ten, auth, mongDoi] of maTran) {
			const ket = chinhSach(auth);
			if (typeof mongDoi === "string") expect(ket, `${ten}: ${JSON.stringify(ket)}`).toBe(mongDoi);
			else expect(ket, `${ten}: ${JSON.stringify(ket)}`).toMatchObject(mongDoi as object);
			soHang += 1;
		}
		expect(soHang).toBe(4);
	});
});
```

`task()` chép nguyên từ `apps/agent/test/drain.spec.ts`. `afterAll` xoá `zaloHoi` theo `zaloChatId`, `agentRunEvent`/`agentRun`/`agentVersion`/`agentDefinition` theo `agentId`, rồi member và user theo `suffix`. Chữ ký thật của `BuilderAuthRow`, `repFromCrm` (trả hàm nhận `Request`), `LeasedTask` đọc ở tệp nguồn khi viết; ép kiểu bằng `as never` chỉ ở chỗ gọi chính sách duyệt.

- [ ] **Step 3: Chạy — phải đỏ đúng chỗ**

Run: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/ro-slack-tac-nhan.integration.spec.ts test/luot-tu-dong.integration.spec.ts"`
Expected: FAIL. Các ca khop-email, khop-bang, tin-truc-tiep, vai-song, phan-trang, doc-loi đỏ với `chat.postMessage=1`; lich, nguoi-bam đỏ với `chinh sach tra ve: "user-approval"`; doi-chung và giu-nguyen xanh. Không có «Cannot find module».

- [ ] **Step 4: Viết `rang/do-truoc-khi-va.mjs`** (xem mã ở Task 4 — viết ở đây vì nó cần hai tệp kiểm) và commit hai tệp kiểm + script.

```bash
git add apps/agent/test/ro-slack-tac-nhan.integration.spec.ts apps/agent/test/luot-tu-dong.integration.spec.ts _acceptance/ro-slack-tac-nhan/rang/do-truoc-khi-va.mjs
git commit -m "ro-slack-tac-nhan: phép đo đỏ trước vá"
```

### Task 2: Lọc người nhận Slack lúc gửi

**independent: false** · phục vụ E1–E7

**Files:**
- Create: `apps/agent/agent/lib/slack-nguoi-nhan.ts`
- Modify: `apps/agent/agent/lib/run-runtime.ts` (import; một lời gọi trong khối `try` của `postRunSlackMessage` ngay sau `if (!accessToken) …`; một nhánh trong `slackActionErrorCode`)

**Interfaces:**
- Produces: `TU_CHOI_NGUOI_NHAN: string`, `KHONG_KIEM_DUOC_NGUOI_NHAN: string`, `kiemNguoiNhanSlack(accessToken: string, destination: { kind: "channel" | "user"; id: string }): Promise<void>` (ném `Error` khi từ chối), `laTuChoiNguoiNhan(message: string): boolean`.

- [ ] **Step 1: Viết mô-đun**

```ts
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { parse, schemas } from "@crm/validation";
import { docDuocPhamVi, toWorkspaceRole } from "@crm/validation/vai-workspace";
import { z } from "zod";
import { SLACK } from "./slack-config";

export const TU_CHOI_NGUOI_NHAN = "at this Slack destination may not read partner data";

export const KHONG_KIEM_DUOC_NGUOI_NHAN = "Refused: could not check who is at this Slack destination";

export type DichSlack = { kind: "channel" | "user"; id: string };

const conTro = z.object({ next_cursor: z.string().nullish() }).nullish();

const trangThanhVienKenh = schemas.slack.reply.extend({
	members: z.array(z.string().trim().min(1)).default([]),
	response_metadata: conTro,
});

const nguoiSlack = z.object({
	id: z.string().trim().min(1),
	profile: z.object({ email: z.string().trim().min(1).nullish() }).nullish(),
	deleted: z.boolean().optional(),
	is_bot: z.boolean().optional(),
});

const trangDanhBa = schemas.slack.reply.extend({
	members: z.array(nguoiSlack).default([]),
	response_metadata: conTro,
});

type NguoiSlack = z.infer<typeof nguoiSlack>;

type ChiOkr = { emails: Set<string>; slackIds: Set<string> };

function chuanEmail(value: string): string {
	return value.trim().toLowerCase();
}

async function docMoiTrang<Schema extends typeof trangThanhVienKenh | typeof trangDanhBa>(
	token: string,
	method: string,
	params: Record<string, string>,
	schema: Schema,
): Promise<z.infer<Schema>["members"]> {
	const members: z.infer<Schema>["members"] = [];
	let cursor = "";
	do {
		const url = new URL(`https://slack.com/api/${method}`);
		url.searchParams.set("limit", String(SLACK.inventory.pageSize));
		for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
		if (cursor) url.searchParams.set("cursor", cursor);
		const response = await fetch(url, {
			headers: { authorization: `Bearer ${token}` },
			signal: AbortSignal.timeout(SLACK.request.timeoutMs),
		});
		if (!response.ok) throw new Error(`Slack ${method} failed.`);
		const page = parse(schema, await response.json(), `Slack ${method}`);
		if (!page.ok) throw new Error(`Slack ${method} was rejected (${page.error ?? "rejected"}).`);
		members.push(...page.members);
		cursor = page.response_metadata?.next_cursor ?? "";
	} while (cursor);
	return members;
}

async function nguoiODich(token: string, destination: DichSlack): Promise<string[]> {
	if (destination.kind === "user") return [destination.id];
	return docMoiTrang(token, "conversations.members", { channel: destination.id }, trangThanhVienKenh);
}

async function thanhVienChiOkr(): Promise<ChiOkr> {
	const members = await db.member.findMany({
		where: { organizationId: WORKSPACE_ID },
		select: { role: true, user: { select: { email: true, slackMemberMatch: { select: { slackUserId: true } } } } },
	});
	const chan = members.filter((member) => !docDuocPhamVi(toWorkspaceRole(member.role), "doi-tac"));
	return {
		emails: new Set(chan.map((member) => chuanEmail(member.user.email))),
		slackIds: new Set(chan.flatMap((member) => member.user.slackMemberMatch?.slackUserId ?? [])),
	};
}

function demNguoiChan(nguoiO: string[], danhBa: Map<string, NguoiSlack>, chiOkr: ChiOkr): number {
	let so = 0;
	for (const id of new Set(nguoiO)) {
		const nguoi = danhBa.get(id);
		if (nguoi?.is_bot || nguoi?.deleted) continue;
		const email = nguoi?.profile?.email;
		if (chiOkr.slackIds.has(id) || (email && chiOkr.emails.has(chuanEmail(email)))) so += 1;
	}
	return so;
}

export async function kiemNguoiNhanSlack(accessToken: string, destination: DichSlack): Promise<void> {
	let so: number;
	try {
		const [nguoiO, nguoiSlackList, chiOkr] = await Promise.all([
			nguoiODich(accessToken, destination),
			docMoiTrang(accessToken, "users.list", {}, trangDanhBa),
			thanhVienChiOkr(),
		]);
		so = demNguoiChan(nguoiO, new Map(nguoiSlackList.map((nguoi) => [nguoi.id, nguoi])), chiOkr);
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		throw new Error(`${KHONG_KIEM_DUOC_NGUOI_NHAN} (${reason}).`);
	}
	if (so > 0) {
		throw new Error(`Refused: ${so} ${so === 1 ? "person" : "people"} ${TU_CHOI_NGUOI_NHAN}.`);
	}
}

export function laTuChoiNguoiNhan(message: string): boolean {
	return message.includes(TU_CHOI_NGUOI_NHAN) || message.startsWith(KHONG_KIEM_DUOC_NGUOI_NHAN);
}
```

- [ ] **Step 2: Nối vào `run-runtime.ts`**

```ts
import { kiemNguoiNhanSlack, laTuChoiNguoiNhan } from "./slack-nguoi-nhan";
```

Trong `postRunSlackMessage`, ngay sau `if (!accessToken) throw new Error("Slack is not connected.");`:

```ts
		await kiemNguoiNhanSlack(accessToken, destination);
```

`slackActionErrorCode`:

```ts
function slackActionErrorCode(message: string): string {
	if (laTuChoiNguoiNhan(message)) return "ACTION_REJECTED";
	return message === "Slack is not connected." ||
		message.includes("additional permission")
		? "NOT_AUTHORISED"
		: "PROVIDER_ERROR";
}
```

- [ ] **Step 3: Chạy tệp kiểm Slack**

Run: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/ro-slack-tac-nhan.integration.spec.ts test/custom-agent-runtime.spec.ts"`
Expected: PASS toàn bộ.

- [ ] **Step 4: Commit** `git commit -m "ro-slack-tac-nhan: lọc người nhận Slack lúc gửi"`

### Task 3: Lượt Tác nhân là tự động

**independent: false** · phục vụ E8–E10

**Files:**
- Modify: `apps/agent/agent/lib/approval.ts`

- [ ] **Step 1: Sửa `isAutomated`**

```ts
import type { Approval } from "eve/tools";
import { APP_AUTH } from "./app-auth";
import type { SessionPurpose } from "./session-purpose";

type Attributes = Readonly<Record<string, string | readonly string[]>>;

const LUOT_TAC_NHAN: SessionPurpose = "team-agent";

export function isAutomated(session: {
	auth: {
		current?: {
			authenticator?: string;
			principalId?: string;
			principalType?: string;
			attributes?: Attributes;
		} | null;
		initiator?: { attributes?: Attributes } | null;
	};
}): boolean {
	const auth = session.auth.current;
	const purpose =
		auth?.attributes?.purpose ?? session.auth.initiator?.attributes?.purpose;
	return (
		purpose === LUOT_TAC_NHAN ||
		(auth?.authenticator === APP_AUTH.authenticator &&
			auth.principalId === APP_AUTH.principalId &&
			auth.principalType === APP_AUTH.principalType)
	);
}
```

`sensitiveWrite` giữ nguyên.

- [ ] **Step 2: Chạy**

Run: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/luot-tu-dong.integration.spec.ts test/drain.spec.ts test/channel-auth.spec.ts"`
Expected: PASS.

- [ ] **Step 3: Commit** `git commit -m "ro-slack-tac-nhan: lượt Tác nhân là tự động"`

### Task 4: Chỗ rẽ có tên và hai phép đo kiểm kê

**independent: false** · phục vụ E11, E12, E14, E13

**Files:**
- Modify: `docs/agent.md` (thêm mục `## Chỗ rẽ: người nhận Slack và lượt tự động của Tác nhân` ngay trước `## The bridge`)
- Create: `_acceptance/ro-slack-tac-nhan/rang/cho-re.mjs`
- Create: `_acceptance/ro-slack-tac-nhan/rang/kiem-ke.mjs`
- (đã tạo ở Task 1) `_acceptance/ro-slack-tac-nhan/rang/do-truoc-khi-va.mjs`

- [ ] **Step 1: Mục chỗ rẽ trong `docs/agent.md`**

```markdown
## Chỗ rẽ: người nhận Slack và lượt tự động của Tác nhân

Bản rẽ OneHub sửa hai tệp của hãng để lượt Tác nhân tôn trọng vai «chỉ OKR»:

- `apps/agent/agent/lib/run-runtime.ts` — `postRunSlackMessage` hỏi
  `kiemNguoiNhanSlack` trước khi gửi; lời từ chối mang mã `ACTION_REJECTED`.
- `apps/agent/agent/lib/approval.ts` — `isAutomated` coi phiên mang
  `purpose: "team-agent"` là tự động, nên thao tác ghi nhạy cảm bị từ chối có lý do.

Phần lõi nằm ở tệp của bản rẽ `apps/agent/agent/lib/slack-nguoi-nhan.ts`: đọc ai ở
đích Slack, khớp họ với thành viên bằng bảng khớp Slack hoặc email, và từ chối khi có
người không đọc được dữ liệu đối tác, hoặc khi không đọc được ai ở đích. Người Slack
không khớp thành viên nào thì cho qua — mở lại khi có khớp tay.

Gỡ chỗ rẽ khi hãng có bản sửa tương đương: bỏ hai chỗ sửa trên, giữ hai tệp kiểm
`ro-slack-tac-nhan.integration.spec.ts` và `luot-tu-dong.integration.spec.ts`; chúng
phải còn xanh trên mã của hãng. Việc báo cho hãng đi qua kênh bảo mật riêng của hãng
và cần chủ kho cho phép; không qua PR hay issue công khai.
```

- [ ] **Step 2: `rang/cho-re.mjs`**

```js
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const args = process.argv.slice(2);
const refDoc = args.includes("--ref-doc") ? args[args.indexOf("--ref-doc") + 1] : null;
const git = (...a) => execFileSync("git", ["-C", ROOT, ...a], { encoding: "utf8" });
const coOHang = (p) => {
	try {
		git("cat-file", "-e", `origin/release:${p}`);
		return true;
	} catch {
		return false;
	}
};
const base = git("merge-base", "HEAD", "origin/onehub").trim();
const sua = git("diff", "--name-only", `${base}..HEAD`).split("\n").filter(Boolean)
	.filter((p) => !p.startsWith("_acceptance/") && !p.startsWith("docs/") && !p.endsWith(".md"))
	.filter(coOHang).sort();
const doc = refDoc ? git("show", `${refDoc}:docs/agent.md`) : readFileSync(resolve(ROOT, "docs/agent.md"), "utf8");
const muc = doc.split(/\n(?=## )/).find((s) => s.startsWith("## Chỗ rẽ")) ?? "";
const neu = [...new Set([...muc.matchAll(/`(apps\/[^`]+\.ts)`/g)].map((m) => m[1]))].filter(coOHang).sort();
const thua = sua.filter((p) => !neu.includes(p));
const thieu = neu.filter((p) => !sua.includes(p));
const loi = [...thua.map((p) => `THUA: ${p}`), ...thieu.map((p) => `THIEU: ${p}`)];
if (!muc) loi.push("THIEU MUC: ## Chỗ rẽ trong docs/agent.md");
if (muc && !/gỡ/i.test(muc)) loi.push("THIEU DIEU KIEN GO");
console.log(JSON.stringify({ sua, neu }));
if (loi.length) {
	console.error(loi.join("\n"));
	process.exit(1);
}
console.log(`cho-re: ${sua.length} tệp của hãng bị sửa, khớp mục chỗ rẽ`);
```

Chiều đỏ: `node _acceptance/ro-slack-tac-nhan/rang/cho-re.mjs --ref-doc origin/onehub` → exit 1, `THUA: apps/agent/agent/lib/approval.ts`.

- [ ] **Step 3: `rang/kiem-ke.mjs`**

```js
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const GOC = join(ROOT, "apps/agent/agent");
const args = process.argv.slice(2);
const them = args.includes("--them") ? [args[args.indexOf("--them") + 1]] : [];

const DA_XEP = {
	"lib/custom-agent-dispatch.ts#dispatchAgentRun": "AC-8, AC-9",
	"lib/custom-agent-dispatch.ts#builderSessionAuthFromRow": "AC-10",
	"lib/app-auth.ts#APP_AUTH": "AC-10",
	"lib/zalo-config.ts#ZALO": "AC-10",
	"lib/zalo-hoi.ts#hoiTacTu": "AC-10",
	"channels/eve.ts#repFromCrm": "AC-10",
	"lib/run-runtime.ts#postRunSlackMessage": "AC-1..AC-7",
	"lib/run-runtime.ts#sendSlackMessage": "AC-1..AC-7",
	"lib/nhac-ke-hoach.ts#guiSlackRieng": "ngoài phạm vi: tin nhắc gửi riêng cho chính người nhận",
};

function tep(dir) {
	return readdirSync(dir).flatMap((ten) => {
		const p = join(dir, ten);
		return statSync(p).isDirectory() ? tep(p) : p.endsWith(".ts") ? [p] : [];
	});
}

const KHAI_BAO = /^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+))/;
const CHO = [
	/authenticator:\s*(?!string\b)[^\s;]/,
	/(?<!function\s)thanhVienPrincipal\(/,
	/(?<!function\s)sendSlackMessage\(/,
	/"chat\.postMessage"/,
];

const tim = new Set();
for (const duong of [...tep(GOC), ...them]) {
	const dong = readFileSync(duong, "utf8").split("\n");
	let bao = "(top)";
	for (const d of dong) {
		const k = d.match(KHAI_BAO);
		if (k) bao = k[1] ?? k[2];
		if (CHO.some((re) => re.test(d))) {
			const ten = them.includes(duong) ? duong : relative(GOC, duong);
			tim.add(`${ten}#${bao}`);
		}
	}
}

const loi = [
	...[...tim].filter((k) => !(k in DA_XEP)).map((k) => `CHUA XEP: ${k}`),
	...Object.keys(DA_XEP).filter((k) => !tim.has(k)).map((k) => `KHONG CON: ${k}`),
];
console.log(JSON.stringify([...tim].sort()));
if (loi.length) {
	console.error(loi.join("\n"));
	process.exit(1);
}
console.log(`kiem-ke: ${tim.size}/${Object.keys(DA_XEP).length} chỗ đã xếp`);
```

Khi chạy lần đầu, đọc danh sách `tim` in ra; nếu một khoá thật khác tên dự kiến ở `DA_XEP` (tên hàm bao quanh) thì sửa `DA_XEP` theo tên thật và ghi một dòng sổ `fix` — không nới regex. Chiều đỏ: tệp tạm trong `os.tmpdir()` chứa `export function x() { sendSlackMessage(a); }` → `--them <tệp>` → exit 1, `CHUA XEP`.

- [ ] **Step 4: `rang/do-truoc-khi-va.mjs`**

```js
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const TEP = ["apps/agent/test/ro-slack-tac-nhan.integration.spec.ts", "apps/agent/test/luot-tu-dong.integration.spec.ts"];
const CA_GHIM = ["khop-email", "tin-truc-tiep", "lich"];
const args = process.argv.slice(2);
const git = (...a) => execFileSync("git", ["-C", ROOT, ...a], { encoding: "utf8" });
const base = args.includes("--base") ? args[args.indexOf("--base") + 1] : git("merge-base", "HEAD", "origin/onehub").trim();

const lenh = `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test ${TEP.map((t) => t.replace("apps/agent/", "")).join(" ")}`;
const chay = (cwd) => {
	const r = spawnSync("bun", ["run", "test", "--", lenh], { cwd, encoding: "utf8", env: process.env, maxBuffer: 256 * 1024 * 1024 });
	return { status: r.status, out: `${r.stdout}${r.stderr}` };
};

const goiNodeModules = [".", ...["apps", "packages"].flatMap((d) => readdirSync(join(ROOT, d)).map((x) => `${d}/${x}`))]
	.filter((d) => existsSync(join(ROOT, d, "node_modules")));

const guong = mkdtempSync(join(tmpdir(), "ro-slack-guong-"));
const loi = [];
try {
	git("worktree", "add", "--detach", guong, base);
	for (const t of TEP) writeFileSync(join(guong, t), readFileSync(join(ROOT, t)));
	for (const d of goiNodeModules) {
		if (existsSync(join(guong, d)) && !existsSync(join(guong, d, "node_modules"))) symlinkSync(join(ROOT, d, "node_modules"), join(guong, d, "node_modules"));
	}
	mkdirSync(join(guong, "packages/db/src"), { recursive: true });
	symlinkSync(join(ROOT, "packages/db/src/generated"), join(guong, "packages/db/src/generated"));
	symlinkSync(join(ROOT, ".env"), join(guong, ".env"));

	const truoc = chay(guong);
	if (truoc.status === 0) loi.push("TRUOC VA KHONG DO: ca bo kiem xanh tren ma truoc va");
	for (const ca of CA_GHIM) {
		if (!new RegExp(`\\(fail\\)[^\\n]*${ca}`).test(truoc.out)) loi.push(`TRUOC VA KHONG DO: ${ca}`);
	}
	if (!truoc.out.includes("chat.postMessage=1")) loi.push("TRUOC VA KHONG DO: khong thay tin da di ra (chat.postMessage=1)");
	if (truoc.out.includes("Cannot find module")) loi.push("TRUOC VA DO SAI LY DO: Cannot find module");

	const sau = chay(ROOT);
	if (sau.status !== 0 || /\(fail\)/.test(sau.out)) loi.push("SAU VA CON DO");
	console.log(`truoc va: exit ${truoc.status} · sau va: exit ${sau.status}`);
} finally {
	try {
		git("worktree", "remove", "--force", guong);
	} catch {}
	rmSync(guong, { recursive: true, force: true });
}
if (loi.length) {
	console.error(loi.join("\n"));
	process.exit(1);
}
console.log("do-truoc-khi-va: do truoc va, xanh sau va");
```

Chiều đỏ: `node _acceptance/ro-slack-tac-nhan/rang/do-truoc-khi-va.mjs --base HEAD` → exit 1, `TRUOC VA KHONG DO`.

- [ ] **Step 5: Chạy ba script cả hai chiều, rồi commit**

Run: `node _acceptance/ro-slack-tac-nhan/rang/cho-re.mjs` · `… --ref-doc origin/onehub` · `node _acceptance/ro-slack-tac-nhan/rang/kiem-ke.mjs` · `… --them <tệp tạm>` · `node _acceptance/ro-slack-tac-nhan/rang/do-truoc-khi-va.mjs` · `… --base HEAD`
Expected: chiều lành exit 0; chiều phá exit 1 với thông điệp ghim.

### Task 5: Bộ chứng năm lệnh

**independent: false** · phục vụ mọi eval qua `suite_keys`

- [ ] Chạy ở gốc kho, PATH có Node 24: `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build`. Đỏ thì sửa trước khi chuyển hợp đồng sang `implemented`.
