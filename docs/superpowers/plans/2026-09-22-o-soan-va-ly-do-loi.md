# Ô soạn và lý do lỗi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ô soạn hội thoại không còn giả chữ; thẻ lỗi hội thoại hiện mã lỗi; agent ghi log lý do lỗi của hội thoại.

**Architecture:** Sửa cách xếp chữ gợi ý trong `TokenField` (packages/ui). Tách `BuilderFailureCard` ra tệp riêng và thêm dòng mã lỗi. Xuất object `events` của kênh `crm` để kiểm được bộ xử lý thật, thêm `console.error` ở nhánh BUILDER của `turn.failed` / `session.failed`. Một tệp mẫu sự kiện dùng chung cho ba tầng (hook audit → API → thẻ).

**Tech Stack:** Next.js + React 19, Tailwind v4, bun test (jsdom qua `packages/ui/test/setup-dom.ts`), NestJS + Prisma, eve 0.29.4, puppeteer-core.

**Spec:** `docs/superpowers/specs/2026-09-22-o-soan-va-ly-do-loi-design.md` · hợp đồng `_acceptance/o-soan-va-ly-do-loi/contract.md` · phép đo `_acceptance/o-soan-va-ly-do-loi/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- `/packages/ui` là nguồn duy nhất của giao diện; không `className` ghi đè tại chỗ gọi.
- Phân tích ở biên: dữ liệu sự kiện eve đọc qua `eveTurnFailure` (`@crm/validation/eve-stream`).
- Chuỗi hiển thị qua gói thông điệp `apps/app/lib/messages/agent-builder-tro-chuyen.ts`, đủ `en` và `vi`.
- Mã lỗi là định danh: `translate="no"`.
- Tệp `.dom.tsx` mới phải vào danh sách `test:dom` của `apps/app/package.json` (bài học #81, #83).
- Mỗi phép đo mới đi kèm lượt phá-thử trên bản sao với thông điệp ghim (MEASURE-BIRTH-CLAUSE).

## File map

| Tệp | Việc |
|---|---|
| `packages/ui/src/components/token-field.tsx` | sửa: xếp chồng chữ gợi ý khi ô trống |
| `apps/app/components/agent-builder/builder-failure-card.tsx` | tạo: thẻ lỗi + dòng mã lỗi |
| `apps/app/components/agent-builder/agent-builder-chat.tsx` | sửa: bỏ hàm thẻ cũ, import tệp mới |
| `apps/app/lib/messages/agent-builder-tro-chuyen.ts` | sửa: thêm `loi.maLoi` |
| `apps/app/test/agent-transcript.spec.ts` | sửa: thêm khối `ma-loi` |
| `apps/app/test/the-loi-hoi-thoai.dom.tsx` | tạo: kiểm thẻ theo kind và từ sự kiện |
| `apps/app/package.json` | sửa: thêm tệp dom vào `test:dom` |
| `apps/api/test/fixtures/loi-hoi-thoai-events.json` | tạo: tệp mẫu sự kiện |
| `apps/api/test/loi-hoi-thoai.spec.ts` | tạo: kiểm `conversations.events` |
| `apps/agent/agent/channels/crm.ts` | sửa: xuất `crmEvents`, log nhánh BUILDER |
| `apps/agent/test/log-loi-hoi-thoai.integration.spec.ts` | tạo: kiểm log và hook audit |
| `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs` | tạo: răng trình duyệt cho E1, E2, E8 |

Mọi task `independent: false` — chung tệp mẫu sự kiện (Task 3, 4, 5) và chung danh sách `test:dom`; làm tuần tự.

---

### Task 1: Tệp mẫu sự kiện + mã lỗi trong `latestTurnFailure`

Phục vụ: E3 · independent: false

**Files:**
- Create: `apps/api/test/fixtures/loi-hoi-thoai-events.json`
- Modify: `apps/app/test/agent-transcript.spec.ts` (thêm khối cuối tệp)

**Interfaces:**
- Produces: tệp mẫu là mảng một phần tử `{ "type": "turn.failed", "data": { "code": "TOOL_EXECUTION_FAILED", "message": "search_crm: query too short" } }` — đầu ra của `conversations.events` sau khi bỏ `meta`.

- [ ] **Step 1: Tạo tệp mẫu**

```json
[
	{
		"type": "turn.failed",
		"data": {
			"code": "TOOL_EXECUTION_FAILED",
			"message": "search_crm: query too short"
		}
	}
]
```

- [ ] **Step 2: Viết khối kiểm `ma-loi`** (cuối `apps/app/test/agent-transcript.spec.ts`)

```ts
describe("ma-loi", () => {
	const hong = (type: string, data: Record<string, string>) => [
		{ type: "turn.started", data: {} },
		{ type, data },
	];

	test.each([
		["GatewayRateLimitError: Free tier requests on this model are rate-limited.", "RL_1", "rate-limit"],
		["RestrictedModelsError: free tier users do not have access", "RS_1", "restricted"],
		["insufficient credits", "CR_1", "credits"],
		["search_crm: query too short", "TOOL_EXECUTION_FAILED", "unknown"],
	] as const)("latestTurnFailure giu code cua su kien: %s", (message, code, kind) => {
		expect(latestTurnFailure(hong("turn.failed", { code, message }))).toEqual({ code, kind });
	});

	test("session.failed khong code thi code la AGENT_FAILED", () => {
		expect(latestTurnFailure(hong("session.failed", { message: "boom" }))).toEqual({
			code: "AGENT_FAILED",
			kind: "unknown",
		});
	});
});
```

(`test` import thêm từ `bun:test` nếu tệp chỉ dùng `it`.)

- [ ] **Step 3: Chạy — phải xanh ngay** (hành vi đã có; khối này chốt nó)

Run: `cd apps/app && bun test test/agent-transcript.spec.ts -t ma-loi`
Expected: 5 pass.

- [ ] **Step 4: Phá-thử trên bản sao** — `cp -R apps/app /tmp/.../app-sao`, trong bản sao sửa `agent-transcript.ts` dòng `code: failure.code ?? "AGENT_FAILED"` thành `code: "AGENT_FAILED"`, chạy lại lệnh trong bản sao.
Expected: 4 fail, tên ca «latestTurnFailure giu code cua su kien». Xoá bản sao.

- [ ] **Step 5: Commit** — `test(app): chot ma loi trong latestTurnFailure`

---

### Task 2: Thẻ lỗi có mã lỗi

Phục vụ: E4, E6 · independent: false

**Files:**
- Create: `apps/app/components/agent-builder/builder-failure-card.tsx`
- Modify: `apps/app/components/agent-builder/agent-builder-chat.tsx` (xoá `function BuilderFailureCard` ~1217-1269, import từ tệp mới; xoá import `WarningAlt` nếu không còn dùng)
- Modify: `apps/app/lib/messages/agent-builder-tro-chuyen.ts` (`loi.maLoi` ở `en` và `vi`)
- Create: `apps/app/test/the-loi-hoi-thoai.dom.tsx`
- Modify: `apps/app/package.json` (`test:dom` thêm `./test/the-loi-hoi-thoai.dom.tsx`)

**Interfaces:**
- Consumes: `AgentTurnFailure` từ `@/lib/agent-transcript`; tệp mẫu Task 1.
- Produces: `export function BuilderFailureCard(props: { failure: AgentTurnFailure; creatingAgent: boolean; retrying: boolean; onRetry: (() => void) | null })`.

- [ ] **Step 1: Thêm chuỗi** — `en.loi.maLoi: "Error code"`, `vi.loi.maLoi: "Mã lỗi"`.

- [ ] **Step 2: Viết bài kiểm dom** `apps/app/test/the-loi-hoi-thoai.dom.tsx`

```tsx
import { afterEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import su_kien from "../../api/test/fixtures/loi-hoi-thoai-events.json";

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { BuilderFailureCard } = await import("@/components/agent-builder/builder-failure-card");
const { latestTurnFailure } = await import("@/lib/agent-transcript");
const { troChuyenMessages } = await import("@/lib/messages/agent-builder-tro-chuyen");

let root: Root | null = null;
let o: HTMLDivElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	o?.remove();
	root = null;
	o = null;
});

function ve(locale: "vi" | "en", failure: { code: string; kind: "rate-limit" | "restricted" | "credits" | "unknown" }) {
	o = document.createElement("div");
	document.body.append(o);
	root = createRoot(o);
	act(() =>
		root?.render(
			<LocaleProvider locale={locale}>
				<BuilderFailureCard failure={failure} creatingAgent={false} retrying={false} onRetry={() => {}} />
			</LocaleProvider>,
		),
	);
	return o;
}

const CAU = { "rate-limit": "choPhut", restricted: "canTra", credits: "hetTien", unknown: "chung" } as const;

describe("the-loi-theo-kind", () => {
	for (const locale of ["vi", "en"] as const) {
		for (const kind of ["rate-limit", "restricted", "credits", "unknown"] as const) {
			test(`${locale} ${kind}`, () => {
				const t = troChuyenMessages(locale);
				const the = ve(locale, { code: "TOOL_EXECUTION_FAILED", kind });
				const chu = the.textContent ?? "";
				expect(chu, "the loi hien ma loi").toContain(`${t.loi.maLoi}: TOOL_EXECUTION_FAILED`);
				const ma = [...the.querySelectorAll("[translate='no']")].find((el) => el.textContent === "TOOL_EXECUTION_FAILED");
				expect(ma, "ma loi mang translate=no").toBeDefined();
				expect(chu).toContain(t.loi[CAU[kind]]);
				expect(chu).toContain(t.dung.thuLai);
				expect(chu).not.toContain("search_crm: query too short");
			});
		}
	}
});

describe("the-loi-tu-su-kien", () => {
	test("ma loi di tu su kien toi the", () => {
		const failure = latestTurnFailure(su_kien);
		expect(failure).not.toBeNull();
		const the = ve("vi", failure!);
		expect(the.textContent, "ma loi di tu su kien toi the").toContain("Mã lỗi: TOOL_EXECUTION_FAILED");
	});
});
```

(`latestTurnFailure` nhận `readonly EveStreamEvent[]`; nếu kiểu JSON không khớp thì phân tích tệp mẫu bằng schema sự kiện của `@crm/validation/eve-stream` trước khi truyền — không ép kiểu `as`.)

- [ ] **Step 3: Chạy — phải đỏ** (tệp thẻ chưa có)

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/the-loi-hoi-thoai.dom.tsx`
Expected: FAIL, không resolve được `builder-failure-card`.

- [ ] **Step 4: Tạo `builder-failure-card.tsx`** — chuyển nguyên thân hàm cũ, thêm dòng mã dưới câu lỗi:

```tsx
"use client";

import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { AsyncButtonContent } from "@crm/ui/components/async-action";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import type { AgentTurnFailure } from "@/lib/agent-transcript";
import { troChuyenMessages } from "@/lib/messages/agent-builder-tro-chuyen";

export function BuilderFailureCard({ failure, creatingAgent, retrying, onRetry }: {
	failure: AgentTurnFailure;
	creatingAgent: boolean;
	retrying: boolean;
	onRetry: (() => void) | null;
}) {
	const t = troChuyenMessages(useLocale());
	const message =
		failure.kind === "rate-limit" ? t.loi.choPhut
		: failure.kind === "restricted" ? t.loi.canTra
		: failure.kind === "credits" ? t.loi.hetTien
		: t.loi.chung;

	return (
		<div role="alert" className="flex flex-col items-stretch gap-3 rounded-lg border border-destructive/30 bg-card px-4 py-3 sm:flex-row sm:items-start">
			<div className="flex min-w-0 flex-1 items-start gap-3">
				<Icon icon={WarningAlt} className="mt-0.5 size-4 text-destructive" />
				<div className="min-w-0 flex-1">
					<p className="font-medium text-sm">{creatingAgent ? t.dung.daDungTao : t.dung.daDungTraLoi}</p>
					<p className="mt-0.5 text-pretty text-muted-foreground text-xs leading-5">{message}</p>
					<p className="mt-1 break-all text-muted-foreground text-xs leading-5">
						{t.loi.maLoi}: <span translate="no" className="select-all font-mono">{failure.code}</span>
					</p>
				</div>
			</div>
			{onRetry ? ( /* nguyên khối Button + AsyncButtonContent cũ */ ) : null}
		</div>
	);
}
```

(Khối nút giữ đúng mã cũ ở `agent-builder-chat.tsx` 1253-1267. Lớp chữ `font-mono` / `select-all` là tiện ích Tailwind có sẵn, không phải ghi đè component.)

- [ ] **Step 5: Sửa `agent-builder-chat.tsx`** — xoá hàm cũ, `import { BuilderFailureCard } from "./builder-failure-card";`, bỏ import thừa.

- [ ] **Step 6: Thêm tệp vào `test:dom`** trong `apps/app/package.json`.

- [ ] **Step 7: Chạy — phải xanh**; `bun run check-types` xanh.

- [ ] **Step 8: Phá-thử trên bản sao** — (a) bỏ `<p>` mã lỗi → các ca `the-loi-theo-kind` đỏ với «the loi hien ma loi»; (b) bỏ `translate="no"` → đỏ với «ma loi mang translate=no»; (c) bản sao tệp mẫu bỏ `code` → `the-loi-tu-su-kien` đỏ với «ma loi di tu su kien toi the».

- [ ] **Step 9: Commit** — `fix(app): the loi hoi thoai hien ma loi`

---

### Task 3: API trả sự kiện lỗi nguyên vẹn

Phục vụ: E5 · independent: false

**Files:**
- Create: `apps/api/test/loi-hoi-thoai.spec.ts`

**Interfaces:**
- Consumes: `ConversationsService#events(input, userId)`; tệp mẫu Task 1.

- [ ] **Step 1: Viết bài kiểm** theo khuôn gieo của `apps/api/test/conversations.spec.ts` (tổ chức `WORKSPACE_ID`, `member` cho A — `assertWorkspaceMember` đòi; người B là user thường):

```ts
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { DEFAULT_WORKSPACE_NAME, WORKSPACE_ID } from "@crm/auth";
import { db } from "@crm/db";
import { workspaceSlug } from "@crm/db/workspace";
import mau from "./fixtures/loi-hoi-thoai-events.json";
import { ConversationsService } from "../src/conversations/conversations.service";

const hau = process.env.TEST_RUN_ID ?? "loi-hoi-thoai";
const nguoiA = `loi-a-${hau}`;
const nguoiB = `loi-b-${hau}`;
const thanhVien = `loi-thanh-vien-${hau}`;
let hoiThoai = "";
let dichVu: ConversationsService;

beforeAll(async () => {
	await db.organization.upsert({ where: { id: WORKSPACE_ID }, update: {}, create: { id: WORKSPACE_ID, name: DEFAULT_WORKSPACE_NAME, slug: workspaceSlug(DEFAULT_WORKSPACE_NAME), createdAt: new Date() } });
	for (const id of [nguoiA, nguoiB]) await db.user.create({ data: { id, name: id, email: `${id}@example.test` } });
	await db.member.create({ data: { id: thanhVien, organizationId: WORKSPACE_ID, userId: nguoiA, role: "member", createdAt: new Date() } });
	const c = await db.agentConversation.create({ data: { userId: nguoiA, kind: "BUILDER" }, select: { id: true } });
	hoiThoai = c.id;
	const [suKien] = mau;
	await db.agentEvent.create({ data: { id: `evt_${hau}_loi`, sessionId: `ses_${hau}_loi`, conversationId: hoiThoai, type: suKien.type, data: suKien.data, emittedAt: new Date() } });
	dichVu = new ConversationsService(db);
});

afterAll(async () => {
	await db.agentConversation.deleteMany({ where: { userId: nguoiA } });
	await db.member.deleteMany({ where: { id: thanhVien } });
	await db.user.deleteMany({ where: { id: { in: [nguoiA, nguoiB] } } });
});

describe("su-kien-loi", () => {
	test("su kien turn.failed giu code va message", async () => {
		const ra = await dichVu.events({ id: hoiThoai, limit: 50 }, nguoiA);
		const loi = ra.find((e) => e.type === "turn.failed");
		expect(loi?.data).toEqual({ code: "TOOL_EXECUTION_FAILED", message: "search_crm: query too short" });
	});

	test("fixture su kien loi khop dau ra that", async () => {
		const ra = await dichVu.events({ id: hoiThoai, limit: 50 }, nguoiA);
		expect(ra.map(({ type, data }) => ({ type, data })), "fixture su kien loi khop dau ra that").toEqual(mau);
	});

	test("nguoi khac khong doc duoc", async () => {
		await expect(dichVu.events({ id: hoiThoai, limit: 50 }, nguoiB)).rejects.toThrow(`No conversation with id ${hoiThoai}.`);
	});
});
```

(Tên cột bắt buộc của `agentConversation` kiểm lại trong `schema.prisma` khi viết; `rejects` hoạt động vì `events` là hàm `async` thường, không phải `PrismaPromise`.)

- [ ] **Step 2: Chạy** `bun run test -- "cd apps/api && bun test test/loi-hoi-thoai.spec.ts -t su-kien-loi"` — xanh (hành vi API đã đúng; bài kiểm chốt nó).

- [ ] **Step 3: Phá-thử** — bản sao tệp mẫu đổi `code` → ca «fixture su kien loi khop dau ra that» đỏ.

- [ ] **Step 4: Commit** — `test(api): chot su kien loi hoi thoai qua conversations.events`

---

### Task 4: Agent ghi log lỗi hội thoại

Phục vụ: E7, E9 · independent: false

**Files:**
- Modify: `apps/agent/agent/channels/crm.ts`
- Create: `apps/agent/test/log-loi-hoi-thoai.integration.spec.ts`

**Interfaces:**
- Produces: `export const crmEvents = { … } satisfies ChannelEvents;` (`ChannelEvents` từ `eve/channels`), dùng ở `defineChannel({ …, events: crmEvents })`.
- Dòng log: `` `[agent] builder conversation ${conversationId} ${event}: ${code} ${message}` `` với `event` là `"turn.failed"` hoặc `"session.failed"`, `code` mặc định `AGENT_FAILED`, `message` mặc định chuỗi rỗng.

- [ ] **Step 1: Viết bài kiểm**

```ts
import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { db, EnrichmentStatus } from "@crm/db";
import type { ChannelEvents } from "eve/channels";
import type { HookEvent } from "eve/hooks";
import mau from "../../api/test/fixtures/loi-hoi-thoai-events.json";
import { crmEvents, taskToken } from "../agent/channels/crm";
import audit from "../agent/hooks/audit";
import { builderToken } from "../agent/lib/custom-agent-dispatch";

type DuLieuLuot = Parameters<NonNullable<ChannelEvents["turn.failed"]>>[0];
type DuLieuPhien = Parameters<NonNullable<ChannelEvents["session.failed"]>>[0];

const hau = crypto.randomUUID();
const nguoi = `log-loi-${hau}`;
const email = `log-loi-${hau}@example.test`;
let hoiThoai = "";
let task = "";
let lienHe = "";

const kenh = (token: string) => ({ continuationToken: token, setContinuationToken() {} });
const cauHoiCho = { kind: "question", id: "q1" };

beforeAll(async () => {
	await db.user.create({ data: { id: nguoi, name: nguoi, email: `${nguoi}@example.test` } });
	const c = await db.agentConversation.create({ data: { userId: nguoi, kind: "BUILDER", pendingInputRequest: cauHoiCho }, select: { id: true } });
	hoiThoai = c.id;
	const lh = await db.contact.create({ data: { firstName: "Log", email, enrichmentStatus: EnrichmentStatus.RUNNING }, select: { id: true } });
	lienHe = lh.id;
	const t = await db.agentTask.create({ data: { kind: "identify", reason: "test", dueAt: new Date(), budget: 4, contactId: lienHe, startedAt: new Date(), attempts: 1 }, select: { id: true } });
	task = t.id;
});

afterAll(async () => {
	await db.agentTask.deleteMany({ where: { id: task } });
	await db.contact.deleteMany({ where: { email } });
	await db.agentConversation.deleteMany({ where: { userId: nguoi } });
	await db.user.deleteMany({ where: { id: nguoi } });
});

const dongHoiThoai = (goi: unknown[][]) => goi.map((g) => String(g[0])).filter((d) => d.includes("builder conversation"));

describe("log-loi", () => {
	test("agent ghi log loi hoi thoai", async () => {
		const loi = spyOn(console, "error").mockImplementation(() => {});
		try {
			const luot = { code: "C1", message: "M1" } satisfies DuLieuLuot;
			await crmEvents["turn.failed"](luot, kenh(builderToken(hoiThoai)), undefined as never);
			expect(dongHoiThoai(loi.mock.calls), "agent ghi log loi hoi thoai").toEqual([`[agent] builder conversation ${hoiThoai} turn.failed: C1 M1`]);
			const sau1 = await db.agentConversation.findUniqueOrThrow({ where: { id: hoiThoai } });
			expect(sau1.continuationToken).toBe(builderToken(hoiThoai));
			expect(sau1.pendingInputRequest).toBeNull();

			await db.agentConversation.update({ where: { id: hoiThoai }, data: { pendingInputRequest: cauHoiCho } });
			loi.mockClear();
			const phien = { code: "C2", message: "M2" } satisfies DuLieuPhien;
			await crmEvents["session.failed"](phien, kenh(builderToken(hoiThoai)));
			expect(dongHoiThoai(loi.mock.calls)).toEqual([`[agent] builder conversation ${hoiThoai} session.failed: C2 M2`]);
			const sau2 = await db.agentConversation.findUniqueOrThrow({ where: { id: hoiThoai } });
			expect(sau2.continuationToken).toBe(builderToken(hoiThoai));
			expect(sau2.pendingInputRequest).toBeNull();

			loi.mockClear();
			await crmEvents["turn.failed"]({ code: "C3", message: "M3" } satisfies DuLieuLuot, kenh(taskToken(task)), undefined as never);
			expect(dongHoiThoai(loi.mock.calls)).toEqual([]);
			const lh = await db.contact.findUniqueOrThrow({ where: { id: lienHe } });
			expect(lh.enrichmentStatus).toBe(EnrichmentStatus.FAILED);
		} finally {
			loi.mockRestore();
		}
	});
});

describe("ghi-su-kien", () => {
	test("fixture su kien loi la dau ra cua hook audit", async () => {
		const idSuKien = `evt_${hau}_audit`;
		const suKien = {
			type: "turn.failed",
			data: { code: "TOOL_EXECUTION_FAILED", message: "search_crm: query too short" },
			meta: { id: idSuKien, at: new Date().toISOString() },
		} satisfies Pick<HookEvent<"turn.failed">, "type" | "data"> & { meta: { id: string; at: string } };
		const xuLy = audit.events["*"] as unknown as (e: typeof suKien, ctx: unknown) => Promise<void>;
		await xuLy(suKien, { session: { id: `ses_${hau}`, auth: { current: { attributes: { purpose: "builder", conversationId: hoiThoai } }, initiator: null } } });
		const hang = await db.agentEvent.findMany({ where: { conversationId: hoiThoai, type: "turn.failed" } });
		expect(hang).toHaveLength(1);
		expect(hang[0]?.data, "fixture su kien loi la dau ra cua hook audit").toEqual(mau[0]?.data);
		await db.agentEvent.deleteMany({ where: { id: idSuKien } });
	});
});
```

(Cú pháp `satisfies` trên kiểu `HookEvent` kiểm lại khi viết — nếu `HookEvent<"turn.failed">` đòi thêm trường, dựng đủ trường đó thay vì nới kiểu. Kiểu `agentConversation` / `agentTask` kiểm lại ở `schema.prisma`.)

- [ ] **Step 2: Chạy — phải đỏ**: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/log-loi-hoi-thoai.integration.spec.ts"` → `crmEvents` không được xuất.

- [ ] **Step 3: Sửa `crm.ts`**
  - `import { type ChannelEvents, defineChannel, GET, POST } from "eve/channels";`
  - Chuyển nguyên object `events: { … }` thành `export const crmEvents = { … } satisfies ChannelEvents;` đặt trước `export default defineChannel`, và `events: crmEvents`.
  - Thêm hàm nhỏ trong tệp:

```ts
function logBuilderFailure(conversationId: string, event: "turn.failed" | "session.failed", data: unknown) {
	const { code, message } = eveTurnFailure.parse(data);
	console.error(`[agent] builder conversation ${conversationId} ${event}: ${code ?? "AGENT_FAILED"} ${message ?? ""}`);
}
```

  - Nhánh `if (conversationId)` của `turn.failed` và `session.failed`: gọi `logBuilderFailure(conversationId, "<tên>", data)` trước `updateMany`.
  - `session.failed` nhánh run: `const failure = eveTurnFailure.parse(data); await failRun(runId, failure.code ?? "SESSION_FAILED", failure.message ?? "The agent session failed.")` — chỉ nếu kiểu của `failRun` hiện đòi chuỗi; giữ nguyên hành vi nếu nó nhận null.

- [ ] **Step 4: Chạy — xanh** cả `-t log-loi` và `-t ghi-su-kien`; `bun run check-types` xanh.

- [ ] **Step 5: Phá-thử trên bản sao** — (a) bỏ lời gọi `logBuilderFailure` ở nhánh `turn.failed` → đỏ với «agent ghi log loi hoi thoai»; (b) bản sao tệp mẫu đổi `code` → «fixture su kien loi la dau ra cua hook audit» đỏ.

- [ ] **Step 6: Commit** — `fix(agent): ghi log ma va ly do loi cua hoi thoai`

---

### Task 5: Ô soạn xếp chồng chữ gợi ý + răng trình duyệt

Phục vụ: E1, E2, E8 · independent: false

**Files:**
- Modify: `packages/ui/src/components/token-field.tsx:11`
- Create: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`

**Interfaces:**
- Consumes: `APP`, `API`, `CHROME`, `LANG`, `phien` từ `_acceptance/cua-vao-noi-tieng-viet/rang/may-chu.mjs`; mẫu chặn cây của `_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs`.
- Produces: `bun _acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs <con-tro|go-chu|chup|chieu-do>`; mã 0 đạt, 1 không đạt (in thông điệp ghim), 2 không đo được (khác cây, máy chủ không trả lời).

- [ ] **Step 1: Viết răng** `o-soan.mjs` (puppeteer-core):
  - Chặn cây: ghi `apps/app/public/o-soan-<pid>.txt` chứa một chuỗi ngẫu nhiên, `fetch(APP + "/o-soan-<pid>.txt")`, khác → in `khac-cay: <gốc cây>` và thoát 2; xoá tệp ở `finally`.
  - Phiên: `phien(process.env.NGUOI ?? "manh.phan@onemount.com")` → cookie cho host của `APP`, cookie `lang=vi`.
  - Tìm slug: đọc `workspaceSlug` qua `bun -e` trong cây (như `khoChuoiTai`), mở `APP/<slug>/chat`.
  - Đo, cho mỗi khổ 1440×900 và 375×812:
    - bấm vào giữa `[data-slot=token-field]`; đặt `caret-color: transparent` trước khi chụp;
    - `con_tro`: `getSelection().getRangeAt(0).getClientRects()[0]`, không có hoặc `height === 0` → ghi `null`, FAIL;
    - `mep_vung_chu`: `rect.left + paddingLeft` của khung;
    - `chu_goi_y_hien`: `getComputedStyle(khung, "::before").content` khác `"none"` và `data-empty === "true"`;
    - `mep_chu_goi_y`: chụp vùng khung (`element.screenshot`), giải PNG bằng `pngjs` (kiểm có trong cây; không có thì dùng `sharp` nếu có, không thì `Uint8Array` qua `page.evaluate` vẽ vào `canvas`) và tìm cột đầu tiên có điểm ảnh lệch nền quá ngưỡng; đổi sang px CSS theo `deviceScaleFactor`;
    - `nam_tron`: `khung.scrollHeight <= khung.clientHeight` và hàng điểm ảnh cuối có chữ nằm trên `top` của thanh nút (`[data-slot=token-field]` → phần tử anh em chứa nút gửi);
    - lặp lại trong một hội thoại: tạo bằng cách gõ «x» + Enter ở màn đầu rồi chờ URL `/chat/<id>`, hoặc mở hội thoại gieo ở `chup`.
  - `go-chu`: gõ `a`, ghi chữ gợi ý còn hiện không, `textContent` bỏ `​`, `con_tro.left` so với `Range` bao chữ `a`.
  - `chup`: gieo hội thoại BUILDER + `agentEvent` từ tệp mẫu cho người đo (xoá ở `finally`), mở `APP/<slug>/chat/<id>`, chụp thẻ lỗi; chụp các ảnh E8; ghi `E8-khuon.txt`.
  - Ghi JSON và ảnh vào `_acceptance/o-soan-va-ly-do-loi/evidence/`.
  - Luật đạt nằm trong răng, theo đúng `expected` của E1/E2; không đạt → in `con tro dung sau chu goi y` / `chu goi y tran khoi o` / … và thoát 1.

- [ ] **Step 2: Dựng máy chủ của cây** trên 3500/3501 (kiểm cổng trước; `APP_URL=http://127.0.0.1:3500` cho cả api), chạy `o-soan.mjs con-tro` trên mã CŨ — phải thoát 1 với «con tro dung sau chu goi y» (đây là chiều đỏ, đo trên vật thật trước khi sửa).

- [ ] **Step 3: Sửa `token-field.tsx`** — thay các lớp chữ gợi ý:

```
data-[empty=true]:grid data-[empty=true]:before:col-start-1 data-[empty=true]:before:row-start-1 data-[empty=true]:before:pointer-events-none data-[empty=true]:before:text-muted-foreground data-[empty=true]:before:content-[attr(data-placeholder)] data-[empty=true]:[&>[contenteditable]]:col-start-1 data-[empty=true]:[&>[contenteditable]]:row-start-1
```

(Giữ nguyên mọi lớp khác. Nếu `span` gõ được không phải con trực tiếp của khung, chọn đúng bộ chọn con trực tiếp của nó — kiểm DOM của `ComposerEditorText` khi làm.)

- [ ] **Step 4: Chạy lại** `con-tro`, `go-chu`, `chup` — thoát 0; xem bằng mắt các ảnh.

- [ ] **Step 5: Tắt máy chủ bằng PID đã ghi**; `bun run check-types`, `bun run lint`, `bun run lint:slop`.

- [ ] **Step 6: Commit** — `fix(ui): o soan xep chong chu goi y, con tro o dau o`

---

### Task 6: Năm lệnh chứng của kho

Phục vụ: mọi eval · independent: false

- [ ] `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build` — đều xanh.
- [ ] Contract `status: implemented`, commit — `chore(acceptance): o-soan-va-ly-do-loi S3 xong, hop dong implemented`.
