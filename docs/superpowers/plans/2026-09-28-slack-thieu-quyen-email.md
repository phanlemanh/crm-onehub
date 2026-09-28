# Slack thiếu quyền đọc email — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bước kiểm người nhận Slack của Tác nhân coi người trong danh bạ không có email đọc được và không có dòng khớp là không xác định, và từ chối đăng.

**Architecture:** Chỉ sửa tệp của bản rẽ `apps/agent/agent/lib/slack-nguoi-nhan.ts`: bộ đọc thành viên trả thêm tập mã Slack đã khớp của mọi vai; bước đếm trả hai số (chặn, không xác định); `kiemNguoiNhanSlack` ném lời «có người không đọc được» trước, rồi lời «không kiểm được người nhận» kèm số người và cách gỡ. Lời từ chối đi đường mã `ACTION_REJECTED` sẵn có qua `laTuChoiNguoiNhan`.

**Tech Stack:** Bun test, Prisma (`@crm/db`), Zod, tệp kiểm tích hợp chạy trên cơ sở dữ liệu riêng của mỗi lượt `bun run test`.

**Spec:** `docs/superpowers/specs/2026-09-28-slack-thieu-quyen-email-design.md`; hợp đồng `_acceptance/slack-thieu-quyen-email/contract.md`; phép đo `_acceptance/slack-thieu-quyen-email/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Không sửa tệp nào có ở `origin/release` ngoài `_acceptance/`, `docs/`, `.md` (AC-10).
- Không sửa tệp kiểm của #170 `apps/agent/test/ro-slack-tac-nhan.integration.spec.ts` (AC-8, quyết định d-5).
- Mọi commit của nhánh mang chuỗi `slack-thieu-quyen-email` trong thông điệp (E10).
- Mốc trước vá cố định: `a62adb16`.
- Lời từ chối không nêu tên, email, mã CRM hay mã Slack (AC-7).
- Mã Slack gieo trong tệp kiểm mới khác mã của tệp #170 (`SOKR`, `SMEM`, `SADM`, `SOWN`), vì hai tệp chạy chung một cơ sở dữ liệu trong cùng lượt.

## Review Focus

- Người không có trong danh bạ nhưng mã Slack nằm trong dòng khớp của người vai «chỉ OKR» vẫn phải bị chặn như #170 — bước đếm không được bỏ qua sớm người vắng danh bạ trước khi xét dòng khớp. Pin: ca `stqe-tin-rieng` vế phụ ở Task 1.
- `profile.email` là chuỗi trắng — khuôn `trim().min(1)` sẵn có ném lỗi, lượt rơi vào lối «không kiểm được» chung: đúng hướng đóng khi lỗi, không cần ca mới (ca `doc-loi` của #170 đã phủ trả lời hỏng).
- Kênh có người chưa khớp nhưng thành viên CRM tương ứng đã rời workspace: không có trong bảng thành viên → không có dòng khớp → không xác định nếu thiếu email. Chấp nhận, đúng nguyên tắc.
- Lượt phát lại (cùng mã lời gọi) sau một lần từ chối: #170 đã chứng phát lại không gọi Slack; lời từ chối không tạo hàng thành công nên không có gì để phát lại.
- Hai tệp kiểm chạy chung một cơ sở dữ liệu: bộ đọc thành viên đọc cả người do tệp khác gieo; dùng mã Slack riêng nên người lạ không trùng danh bạ giả.

---

### Task 1: Luật «không xác định» và tệp kiểm của nó

`independent: false` · phục vụ E1–E8

**Files:**
- Create: `apps/agent/test/slack-thieu-quyen-email.integration.spec.ts`
- Modify: `apps/agent/agent/lib/slack-nguoi-nhan.ts`

**Interfaces:**
- Consumes: `postRunSlackMessage(runId, callId, { text })` từ `apps/agent/agent/lib/run-runtime.ts`; hằng `TU_CHOI_NGUOI_NHAN`, `KHONG_KIEM_DUOC_NGUOI_NHAN`.
- Produces: hằng mới `KHONG_THAY_EMAIL` trong `slack-nguoi-nhan.ts`; lời từ chối mới có dạng `` `${KHONG_KIEM_DUOC_NGUOI_NHAN} (${n} person|people ${KHONG_THAY_EMAIL}).` ``.

- [ ] **Step 1: Viết tệp kiểm**

```ts
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
	okr: { id: `${suffix}-okr`, vai: "okr", slack: "SOKR", email: `${suffix}-okr@thu.test` },
	member: { id: `${suffix}-member`, vai: "member", slack: "SMEM", email: `${suffix}-member@thu.test` },
	admin: { id: `${suffix}-admin`, vai: "admin", slack: "SADM", email: `${suffix}-admin@thu.test` },
	owner: { id: `${suffix}-owner`, vai: "owner", slack: "SOWN", email: `${suffix}-owner@thu.test` },
} as const;

type Nguoi = (typeof NGUOI)[keyof typeof NGUOI];
type TrangSlack = { members: unknown[]; next?: string };
type KichBan = { kenh: Record<string, TrangSlack>; danhBa: Record<string, TrangSlack> };

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
			return Response.json({ ok: true, channel: "CKENH", ts: `${Date.now()}.1` });
		}
		return Response.json({ ok: false, error: "unknown_method" });
	}) as typeof fetch;
}

const motTrang = (members: unknown[]) => ({ "": { members } });

function thieuEmail(id: string) {
	return { id, name: id.toLowerCase(), profile: {} };
}

function coEmail(id: string, email: string, extra: Record<string, boolean> = {}) {
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
		await db.slackMemberMatch.create({ data: { crmUserId: n.id, slackUserId: n.slack } });
	}
}

let agentKenh = "";
let agentTinOkr = "";
let agentTinMember = "";

async function tacNhan(destination: { kind: "channel" | "user"; id: string; label: string }) {
	const agent = await db.agentDefinition.create({
		data: { name: `stqe ${destination.label}`, status: "LIVE", createdById: NGUOI.owner.id },
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
					{
						type: "slack.message.post",
						provider: "slack",
						summary: "Post the update",
						destination: { ...destination, resolution: "chosen" },
					},
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
	const ket = await postRunSlackMessage(run.id, crypto.randomUUID(), { text: "Deal update" }).then(
		(value) => ({ ok: true as const, value }),
		(error: Error) => ({ ok: false as const, error }),
	);
	const action = await db.agentAction.findFirst({ where: { runId: run.id }, orderBy: { plannedAt: "desc" } });
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
	return Object.values(NGUOI).flatMap((n) => [n.email, n.id, n.slack, n.slack.toLowerCase()]);
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
			create: { id: n.id, name: n.id, email: n.email, emailVerified: true, createdAt: now, updatedAt: now },
			update: {},
		});
		await db.member.upsert({
			where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId: n.id } },
			create: { id: `member-${n.id}`, organizationId: WORKSPACE_ID, userId: n.id, role: n.vai, createdAt: now },
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
	agentTinOkr = await tacNhan({ kind: "user", id: NGUOI.okr.slack, label: "@okr" });
	agentTinMember = await tacNhan({ kind: "user", id: NGUOI.member.slack, label: "@member" });
});

afterEach(async () => {
	globalThis.fetch = realFetch;
	await db.slackMemberMatch.deleteMany({ where: { crmUserId: { startsWith: suffix } } });
});

afterAll(async () => {
	const agentIds = [agentKenh, agentTinOkr, agentTinMember].filter(Boolean);
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

describe("slack-thieu-quyen-email", () => {
	test("stqe-kenh: kenh co nguoi chi OKR chua khop khi Slack khong cho thay email", async () => {
		await khop(NGUOI.member);
		giaSlack({ kenh: motTrang([NGUOI.okr.slack, NGUOI.member.slack]), danhBa: danhBaThieu() });
		tuChoiKhongRo(await dang(agentKenh), 1);

		giaSlack({
			kenh: motTrang([NGUOI.member.slack, NGUOI.okr.slack]),
			danhBa: {
				"": { members: [thieuEmail(NGUOI.member.slack)], next: "c2" },
				c2: { members: [thieuEmail(NGUOI.okr.slack)] },
			},
		});
		tuChoiKhongRo(await dang(agentKenh), 1);
		expect(dem["users.list"] ?? 0, `users.list=${dem["users.list"] ?? 0}`).toBe(2);

		giaSlack({ kenh: motTrang([NGUOI.member.slack]), danhBa: danhBaThieu() });
		daDang(await dang(agentKenh));
	});

	test("stqe-tin-rieng: tin rieng toi nguoi chi OKR chua khop khong mo hoi thoai", async () => {
		giaSlack({ kenh: {}, danhBa: danhBaThieu() });
		const ket = await dang(agentTinOkr);
		expect({ open: dem["conversations.open"] ?? 0, post: soPost() }).toEqual({ open: 0, post: 0 });
		tuChoiKhongRo(ket, 1);

		await khop(NGUOI.okr);
		giaSlack({ kenh: {}, danhBa: motTrang([]) });
		tuChoiNguoiNhan(await dang(agentTinOkr));

		await khop(NGUOI.member);
		giaSlack({ kenh: {}, danhBa: danhBaThieu() });
		const doiChung = await dang(agentTinMember);
		expect({ open: dem["conversations.open"] ?? 0, post: soPost() }).toEqual({ open: 1, post: 1 });
		expect(doiChung.ket.ok).toBe(true);
	});

	test("stqe-dong-khop: dong khop la nguon nhan dien khi khong co email", async () => {
		await khop(NGUOI.member, NGUOI.admin, NGUOI.owner);
		giaSlack({
			kenh: motTrang([NGUOI.member.slack, NGUOI.admin.slack, NGUOI.owner.slack, "SBOT"]),
			danhBa: danhBaThieu([{ id: "SBOT", name: "sbot", profile: {}, is_bot: true }]),
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
		const danhBa = motTrang([coEmail(NGUOI.okr.slack, NGUOI.okr.email), thieuEmail(NGUOI.member.slack)]);
		giaSlack({ kenh: motTrang([NGUOI.okr.slack, NGUOI.member.slack]), danhBa });
		tuChoiNguoiNhan(await dang(agentKenh));

		giaSlack({ kenh: motTrang([NGUOI.member.slack]), danhBa });
		tuChoiKhongRo(await dang(agentKenh), 1);
	});

	test("stqe-ba-hinh: ba hinh tra loi thieu email cho cung ket qua", async () => {
		await khop(NGUOI.admin);
		const maTran: Array<[string, unknown]> = [
			["khoa-vang", { id: NGUOI.member.slack, name: "smem", profile: {} }],
			["email-null", { id: NGUOI.member.slack, name: "smem", profile: { email: null } }],
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
				throw new Error(`hang ${ten}: ${ket.action?.errorMessage ?? ""} — ${(error as Error).message}`);
			}
			soHang += 1;
		}
		expect(soHang).toBe(3);

		giaSlack({
			kenh: motTrang([NGUOI.admin.slack, NGUOI.member.slack]),
			danhBa: motTrang([thieuEmail(NGUOI.admin.slack), coEmail(NGUOI.member.slack, NGUOI.member.email)]),
		});
		daDang(await dang(agentKenh));
	});

	test("stqe-khong-tinh: bot, tai khoan da xoa, nguoi ngoai danh ba, email ngoai CRM khong tinh", async () => {
		await khop(NGUOI.admin);
		giaSlack({
			kenh: motTrang([NGUOI.admin.slack, "SBOT", "SXOA1", "SXOA2", "SNGOAI", "SCONNECT"]),
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
		expect(chuoiLo(`x ${NGUOI.okr.email.toUpperCase()} y`)).toContain(NGUOI.okr.email);
		expect(chuoiLo("Refused: SOKR")).toContain(NGUOI.okr.slack);

		await khop(NGUOI.owner);
		giaSlack({
			kenh: motTrang([NGUOI.member.slack, NGUOI.admin.slack, NGUOI.owner.slack, "SNGOAI"]),
			danhBa: danhBaThieu([coEmail("SNGOAI", "khach@ngoai.test")]),
		});
		const hai = tuChoiKhongRo(await dang(agentKenh), 2);
		expect(hai).not.toContain("4 people");
		expect(hai).not.toContain("3 people");
		expect(hai).toContain("email");
		expect(chuoiLo(hai), `chuoi lo: ${chuoiLo(hai).join(", ")}`).toEqual([]);

		giaSlack({ kenh: motTrang([NGUOI.member.slack, NGUOI.owner.slack]), danhBa: danhBaThieu() });
		const mot = tuChoiKhongRo(await dang(agentKenh), 1);
		expect(chuoiLo(mot), `chuoi lo: ${chuoiLo(mot).join(", ")}`).toEqual([]);
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ trên mã hiện tại**

Run: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/slack-thieu-quyen-email.integration.spec.ts"`
Expected: FAIL — `stqe-kenh`, `stqe-tin-rieng`, `stqe-ba-hinh`, `stqe-loi-nhan`, vế hai của `stqe-uu-tien` đỏ với `chat.postMessage=1`; `stqe-dong-khop`, `stqe-khong-tinh` xanh (đối chứng dương).

- [ ] **Step 3: Sửa `slack-nguoi-nhan.ts`**

Thêm hằng sau `KHONG_KIEM_DUOC_NGUOI_NHAN`:

```ts
export const KHONG_THAY_EMAIL =
	"without an email Slack shares with this app; reconnect Slack so it can read email addresses";
```

Thay `type ChiOkr` và `thanhVienChiOkr`:

```ts
type NhanDien = { emails: Set<string>; slackIds: Set<string>; daKhop: Set<string> };

async function nhanDienThanhVien(): Promise<NhanDien> {
	const members = await db.member.findMany({
		where: { organizationId: WORKSPACE_ID },
		select: {
			role: true,
			user: {
				select: {
					email: true,
					slackMemberMatch: { select: { slackUserId: true } },
				},
			},
		},
	});
	const chan = members.filter(
		(member) => !docDuocPhamVi(toWorkspaceRole(member.role), "doi-tac"),
	);
	const maKhop = (list: typeof members) =>
		new Set(list.flatMap((member) => member.user.slackMemberMatch?.slackUserId ?? []));
	return {
		emails: new Set(chan.map((member) => chuanEmail(member.user.email))),
		slackIds: maKhop(chan),
		daKhop: maKhop(members),
	};
}
```

Thay `demNguoiChan`:

```ts
type DemNguoi = { chan: number; khongRo: number };

function demNguoi(
	nguoiO: string[],
	danhBa: Map<string, NguoiSlack>,
	nhanDien: NhanDien,
): DemNguoi {
	const dem: DemNguoi = { chan: 0, khongRo: 0 };
	for (const id of new Set(nguoiO)) {
		const nguoi = danhBa.get(id);
		if (nguoi?.is_bot || nguoi?.deleted) continue;
		const email = nguoi?.profile?.email;
		if (
			nhanDien.slackIds.has(id) ||
			(email && nhanDien.emails.has(chuanEmail(email)))
		) {
			dem.chan += 1;
		} else if (nguoi && !email && !nhanDien.daKhop.has(id)) {
			dem.khongRo += 1;
		}
	}
	return dem;
}

function soNguoi(so: number): string {
	return `${so} ${so === 1 ? "person" : "people"}`;
}
```

Thay thân `kiemNguoiNhanSlack`:

```ts
export async function kiemNguoiNhanSlack(
	accessToken: string,
	destination: DichSlack,
): Promise<void> {
	let dem: DemNguoi;
	try {
		const [nguoiO, danhBa, nhanDien] = await Promise.all([
			nguoiODich(accessToken, destination),
			docMoiTrang(accessToken, "users.list", {}, trangNguoi),
			nhanDienThanhVien(),
		]);
		dem = demNguoi(
			nguoiO,
			new Map(danhBa.map((nguoi) => [nguoi.id, nguoi])),
			nhanDien,
		);
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		throw new Error(`${KHONG_KIEM_DUOC_NGUOI_NHAN} (${reason}).`);
	}
	if (dem.chan > 0) {
		throw new Error(`Refused: ${soNguoi(dem.chan)} ${TU_CHOI_NGUOI_NHAN}.`);
	}
	if (dem.khongRo > 0) {
		throw new Error(
			`${KHONG_KIEM_DUOC_NGUOI_NHAN} (${soNguoi(dem.khongRo)} ${KHONG_THAY_EMAIL}).`,
		);
	}
}
```

- [ ] **Step 4: Chạy, thấy xanh — cả tệp mới lẫn tệp của #170**

Run: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/slack-thieu-quyen-email.integration.spec.ts test/ro-slack-tac-nhan.integration.spec.ts"`
Expected: PASS, 0 dòng `(fail)`.

- [ ] **Step 5: Phá-thử một chiều đỏ, trong bản sao đã commit** — commit trước (bài học «phá-thử phải commit trước»), rồi đổi `else if (nguoi && !email && !nhanDien.daKhop.has(id))` thành `else if (nguoi && !email)`, chạy lại: `stqe-dong-khop` phải đỏ; hoàn tác bằng `git checkout -- apps/agent/agent/lib/slack-nguoi-nhan.ts`.

- [ ] **Step 6: Commit**

```bash
git add apps/agent/test/slack-thieu-quyen-email.integration.spec.ts apps/agent/agent/lib/slack-nguoi-nhan.ts
git commit -m "fix(slack-thieu-quyen-email): người không email, không dòng khớp là không xác định"
```

### Task 2: Hai phép đo bằng script (E9, E10)

`independent: false` (E9 chạy tệp kiểm của Task 1) · phục vụ E9, E10

**Files:**
- Create: `_acceptance/slack-thieu-quyen-email/rang/do-truoc-khi-va.mjs`
- Create: `_acceptance/slack-thieu-quyen-email/rang/khong-sua-tep-hang.mjs`

**Interfaces:**
- Consumes: tệp kiểm của Task 1; lệnh `bun run test`; `origin/release`, `origin/onehub`.
- Produces: hai lệnh đã khai ở `_acceptance/config.yaml` (`stqe_do_truoc_khi_va`, `stqe_khong_sua_tep_hang`).

- [ ] **Step 1: `do-truoc-khi-va.mjs`** — chép khuôn của `_acceptance/ro-slack-tac-nhan/rang/do-truoc-khi-va.mjs`, đổi ba chỗ: `TEP = ["apps/agent/test/slack-thieu-quyen-email.integration.spec.ts"]`, `CA_GHIM = ["stqe-kenh", "stqe-tin-rieng"]`, mốc mặc định `"a62adb16"` thay cho `merge-base`, tiền tố thư mục tạm `slack-thieu-guong-`, dòng kết `do-truoc-khi-va: do truoc va (<mốc>), xanh sau va`.

- [ ] **Step 2: `khong-sua-tep-hang.mjs`**

```js
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const MOC = "a62adb16";
const TEN = "slack-thieu-quyen-email";
const args = process.argv.slice(2);
const git = (...a) =>
	execFileSync("git", ["-C", ROOT, ...a], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const coHang = (tep) => {
	try {
		git("cat-file", "-e", `origin/release:${tep}`);
		return true;
	} catch {
		return false;
	}
};
const giaTep = args.flatMap((a, i) => (a === "--gia-tep" ? [args[i + 1]] : []));

const loi = [];
const commits = git("log", "--no-merges", "--format=%H", `--grep=${TEN}`, `${MOC}..HEAD`)
	.split("\n")
	.filter(Boolean);
if (commits.length === 0) loi.push("KHONG THAY COMMIT");

const tep = new Set(giaTep);
for (const c of commits) {
	for (const t of git("show", "--name-only", "--format=", c).split("\n").filter(Boolean)) tep.add(t);
}
const tepHang = [...tep]
	.filter((t) => !t.startsWith("_acceptance/") && !t.startsWith("docs/") && !t.endsWith(".md"))
	.filter(coHang)
	.sort();
for (const t of tepHang) loi.push(`TEP HANG: ${t}`);

const rieng = git("log", "--no-merges", "--format=%H%x00%B%x01", `${MOC}..HEAD`, "^origin/onehub")
	.split("\x01")
	.map((s) => s.trim())
	.filter(Boolean)
	.map((s) => s.split("\x00"));
if (args.includes("--gia-commit-khong-ten")) rieng.push(["0000000000000000000000000000000000000000", "fix: gia"]);
for (const [sha, msg] of rieng) {
	if (!msg.includes(TEN)) loi.push(`COMMIT KHONG TEN: ${sha}`);
}

console.log(`khong-sua-tep-hang: ${commits.length} commit mang ten, ${tep.size} tep da xet, ${rieng.length} commit rieng cua nhanh`);
if (loi.length) {
	console.error(loi.join("\n"));
	process.exit(1);
}
console.log("khong-sua-tep-hang: khong tep nao cua hang bi sua");
```

- [ ] **Step 3: Chạy hai chiều của cả hai script**

Run:
- `node _acceptance/slack-thieu-quyen-email/rang/khong-sua-tep-hang.mjs` → exit 0
- `node _acceptance/slack-thieu-quyen-email/rang/khong-sua-tep-hang.mjs --gia-tep apps/agent/agent/lib/run-runtime.ts` → exit 1, `TEP HANG: apps/agent/agent/lib/run-runtime.ts`
- `node _acceptance/slack-thieu-quyen-email/rang/khong-sua-tep-hang.mjs --gia-tep apps/agent/agent/lib/slack-nguoi-nhan.ts` → exit 0
- `node _acceptance/slack-thieu-quyen-email/rang/khong-sua-tep-hang.mjs --gia-commit-khong-ten` → exit 1, `COMMIT KHONG TEN`
- `node _acceptance/slack-thieu-quyen-email/rang/do-truoc-khi-va.mjs` → exit 0
- `node _acceptance/slack-thieu-quyen-email/rang/do-truoc-khi-va.mjs --base HEAD` → exit 1, `TRUOC VA KHONG DO`

- [ ] **Step 4: Commit**

```bash
git add _acceptance/slack-thieu-quyen-email/rang
git commit -m "test(slack-thieu-quyen-email): phép đo đỏ-trước-xanh-sau và không sửa tệp của hãng"
```

### Task 3: Mục chỗ rẽ nói luật mới

`independent: false` · phục vụ E11

**Files:**
- Modify: `docs/agent.md` — mục «Chỗ rẽ: người nhận Slack và lượt tự động của Tác nhân», đoạn «Phần lõi nằm ở tệp của bản rẽ…»

- [ ] **Step 1: Thay câu «Người Slack không khớp thành viên nào thì cho qua — mở lại khi có khớp tay.»** bằng:

```markdown
Người Slack có email mà không khớp thành viên nào thì cho qua — mở lại khi có khớp
tay; người của tổ chức khác qua Slack Connect không có trong danh bạ nên cũng không
tính. Người trong danh bạ mà Slack không cho thấy email và không có dòng khớp thì
không xác định được: lượt bị từ chối bằng lời «không kiểm được người nhận», kèm số
người đó và lời nhắc kết nối lại Slack. Kết nối Slack thiếu quyền đọc email
(`users:read.email`) vì thế không đăng được vào kênh có người chưa khớp — đúng ý, vì
khi đó bước kiểm không phân biệt được người vai «chỉ OKR» với người ngoài CRM.
```

- [ ] **Step 2: Commit**

```bash
git add docs/agent.md
git commit -m "docs(slack-thieu-quyen-email): chỗ rẽ nói luật người không xác định"
```

### Task 4: Năm lệnh chứng của kho

`independent: false` · phục vụ mọi eval qua suite

- [ ] **Step 1:** chạy `bun run check-types`, `bun run lint`, `bun run lint:slop` — exit 0.
- [ ] **Step 2:** chạy `bun run test` và `bun run build` — exit 0 (chạy nền, mỗi lệnh có thể lâu).
- [ ] **Step 3:** sửa nếu đỏ; commit sửa với tên hồ sơ trong thông điệp.

## Dòng S2 của lộ trình

Không phải một task của S3: dòng S2 ở mục 10 của `docs/plan/lo-trinh-okr.md` chỉ có trên `onehub` khi PR #183 gộp. Sửa ở S5, trước khi mở PR, sau khi gộp `onehub` mới về nhánh.
