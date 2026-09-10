# Chặn uỷ thác agent_builder sai lượt — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lượt không mang `CREATE_AGENT` bị từ chối bằng lý do đọc được thay vì exception, con kết thúc sạch, cha trả lời bằng lời, và hội thoại không bao giờ kẹt "đang chạy nền".

**Architecture:** Chốt đặt ở tầng tool bằng nguyên thuỷ `approval` của eve — policy chạy trước `execute`, đọc `session.auth.current?.attributes`, trả `{ type: "denied", reason }`. Một hằng lý do dùng chung. `outputSchema` của `agent_builder` mở thành union rời rạc để task mode có cửa ra khi bị từ chối. Handler `turn.failed` sẵn có của `channels/crm.ts` đã ghi `continuationToken`; việc còn thiếu là làm lượt cha hỏng khi con chết không trả nổi output.

**Tech Stack:** eve 0.29.4 (`eve/tools` — `defineTool`, `Approval`), zod 4, bun test.

**Spec:** `docs/superpowers/specs/2026-09-08-chan-uy-thac-sai-luot-design.md`
**Contract:** `_acceptance/chan-uy-thac-sai-luot/contract.md`

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào code mới, không thêm khi sửa code cũ.
- Trí khôn sống ở `apps/agent`, không ở API.
- Một `.env` duy nhất ở gốc; vòng này không thêm biến môi trường nào.
- Parse ở biên, không truyền `Record<string, unknown>`.
- Phép đo mới phải đi cặp hai chiều trên cùng fixture, chiều đỏ ghim thông điệp.
- Lệnh chứng: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` — chạy từ gốc kho.

## File Structure

| File | Trách nhiệm |
| --- | --- |
| `apps/agent/agent/lib/session-purpose.ts` | thêm `builderTurnAuthorized(ctx)` — đọc quyền, **không ném**; hàm ném giữ nguyên |
| `apps/agent/agent/lib/custom-agent-dispatch.ts` | tách `builderSessionAttributes(...)` ra khỏi chỗ gọi `send`, export để bài đo rút round-trip |
| `apps/agent/agent/subagents/agent_builder/lib/authorization.ts` (mới) | hằng `BUILDER_DENIED_REASON` + policy `builderTurnApproval` dùng chung |
| `.../tools/{inspect_context,write_agent_file,save_agent_draft}.ts` | gắn `approval: builderTurnApproval`; giữ `requireBuilderAttribute` |
| `.../agent_builder/agent.ts` | `outputSchema` thành union `draft_ready \| not_authorized` |
| `.../agent_builder/lib/execution-state.ts` | nới chốt `final_output` để `not_authorized` ra được |
| `.../agent_builder/hooks/execution-guard.ts` | truyền cờ quyền từ `ctx` vào `recordBuilderActions` |
| `apps/agent/agent/instructions/task.ts` | chỉ dẫn cha xử lý `not_authorized` |
| `apps/agent/test/chan-uy-thac.spec.ts` (mới) | 4 nhóm: `quyen`, `moi-tool`, `ket-thuc`, `khong-treo` |
| `apps/app/test/chan-uy-thac.spec.ts` (mới) | vế màn của cặp cross-layer AC-8/AC-9 |

---

### Task 1: Hằng lý do, hàm quyền không ném, policy dùng chung

**Files:**
- Modify: `apps/agent/agent/lib/session-purpose.ts`
- Modify: `apps/agent/agent/lib/custom-agent-dispatch.ts:160-180`
- Create: `apps/agent/agent/subagents/agent_builder/lib/authorization.ts`
- Test: `apps/agent/test/chan-uy-thac.spec.ts`

**Interfaces:**
- Produces: `builderTurnAuthorized(ctx: PurposeContext): boolean`; `BUILDER_DENIED_REASON: string`; `builderTurnApproval: Approval`; `builderSessionAttributes(input: { commandType: string; message: unknown; conversationId: string; userId: string; submissionId: string; hasTitle: boolean }): Record<string, string>`
- Consumes: `purposeOf`, `attribute` (đã có).

**`independent: false`** — mọi task sau đều tiêu thụ export của task này.

- [ ] **Step 1: Viết bài đo hỏng — nhóm `quyen`**

Tạo `apps/agent/test/chan-uy-thac.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { builderSessionAttributes } from "../agent/lib/custom-agent-dispatch";
import { builderTurnAuthorized, purposeOf } from "../agent/lib/session-purpose";
import {
	BUILDER_DENIED_REASON,
	builderTurnApproval,
} from "../agent/subagents/agent_builder/lib/authorization";

const PURPOSES = ["research", "team-agent", "builder"] as const;

const phienThat = (over: Record<string, string> = {}) => ({
	session: {
		auth: {
			current: {
				attributes: {
					...builderSessionAttributes({
						commandType: "CREATE_AGENT",
						message: { text: "dung mot tac nhan" },
						conversationId: "conv_1",
						userId: "user_1",
						submissionId: "sub_1",
						hasTitle: true,
					}),
					...over,
				},
			},
			initiator: null,
		},
	},
});

const chamPolicy = (ctx: ReturnType<typeof phienThat>) =>
	builderTurnApproval({ ...ctx, toolName: "inspect_context" });

describe("quyen", () => {
	it("khoa fixture rut round-trip trung khoa policy doc", () => {
		const keys = Object.keys(
			builderSessionAttributes({
				commandType: "CREATE_AGENT",
				message: { text: "x" },
				conversationId: "c",
				userId: "u",
				submissionId: "s",
				hasTitle: false,
			}),
		);
		expect(keys).toContain("purpose");
		expect(keys).toContain("commandType");
		expect(purposeOf(phienThat())).toBe("builder");
	});

	it("cap hai chieu tren cung fixture, khac dung mot truong", () => {
		expect(builderTurnAuthorized(phienThat())).toBe(true);
		expect(builderTurnAuthorized(phienThat({ commandType: "CHAT" }))).toBe(false);
	});

	it("ma tran toan phan purpose nhan commandType", () => {
		const cases = PURPOSES.flatMap((purpose) =>
			["CREATE_AGENT", "CHAT"].map((commandType) => ({ purpose, commandType })),
		);
		expect(cases).toHaveLength(6);
		for (const c of cases) {
			const duocPhep = c.purpose === "builder" && c.commandType === "CREATE_AGENT";
			expect(builderTurnAuthorized(phienThat(c))).toBe(duocPhep);
		}
	});

	it("ba hinh dang thieu thuoc tinh deu dong", () => {
		const thieu = [
			{ purpose: "" },
			{ commandType: "" },
			{ purpose: "", commandType: "" },
		];
		expect(thieu).toHaveLength(3);
		for (const over of thieu) {
			expect(builderTurnAuthorized(phienThat(over))).toBe(false);
		}
	});

	it("policy tra denied kem hang ghim, khong nem", () => {
		const denied = chamPolicy(phienThat({ commandType: "CHAT" }));
		expect(denied).toEqual({ type: "denied", reason: BUILDER_DENIED_REASON });
		expect(chamPolicy(phienThat())).toBe("not-applicable");
	});
});
```

- [ ] **Step 2: Chạy để chắc nó hỏng**

Run: `cd apps/agent && bun test test/chan-uy-thac.spec.ts -t quyen`
Expected: FAIL — không resolve được `builderSessionAttributes`, `builderTurnAuthorized`, `authorization`.

- [ ] **Step 3: Tách `builderSessionAttributes` khỏi chỗ gọi `send`**

Trong `apps/agent/agent/lib/custom-agent-dispatch.ts`, thay khối `attributes: { … }` đang viết thẳng trong lời gọi `send` bằng lời gọi hàm, và export hàm ấy:

```ts
export function builderSessionAttributes(input: {
	commandType: string;
	message: unknown;
	conversationId: string;
	userId: string;
	submissionId: string;
	hasTitle: boolean;
}): Record<string, string> {
	return {
		purpose: "builder",
		commandType: builderCommandType(input.commandType, input.message),
		needsTitle: input.hasTitle ? "false" : "true",
		conversationId: input.conversationId,
		userId: input.userId,
		submissionId: input.submissionId,
	};
}
```

Chỗ gọi `send` đổi thành:

```ts
				auth: {
					authenticator: "crm-builder",
					principalType: "user",
					principalId: submission.conversation.userId,
					attributes: builderSessionAttributes({
						commandType: submission.commandType,
						message: submission.message,
						conversationId,
						userId: submission.conversation.userId,
						submissionId: submission.id,
						hasTitle: Boolean(submission.conversation.title),
					}),
				},
```

- [ ] **Step 4: Thêm `builderTurnAuthorized` vào `session-purpose.ts`**

Chèn ngay trên `requireBuilderAttribute`, và cho `requireBuilderAttribute` gọi lại nó để hai chỗ không thể lệch nhau:

```ts
export function builderTurnAuthorized(ctx: PurposeContext): boolean {
	return (
		purposeOf(ctx) === "builder" &&
		attribute(ctx, "commandType") === "CREATE_AGENT"
	);
}
```

Rồi sửa thân `requireBuilderAttribute`:

```ts
	if (!builderTurnAuthorized(ctx)) {
		throw new Error(
			"Agent creation requires an explicit request to create or build an agent.",
		);
	}
```

- [ ] **Step 5: Tạo `authorization.ts`**

```ts
import type { Approval } from "eve/tools";
import { builderTurnAuthorized } from "../../../lib/session-purpose";

export const BUILDER_DENIED_REASON =
	"This turn is not an agent-creation request. Tell the user that building an agent starts from the Create agent action, then answer what they actually asked.";

export const builderTurnApproval: Approval = (ctx) =>
	builderTurnAuthorized(ctx)
		? "not-applicable"
		: { type: "denied", reason: BUILDER_DENIED_REASON };
```

- [ ] **Step 6: Chạy lại**

Run: `cd apps/agent && bun test test/chan-uy-thac.spec.ts -t quyen`
Expected: PASS, 5 bài.

- [ ] **Step 7: Chiều đỏ — phá vật thật rồi xem thước có đỏ không**

Trong bản sao tạm, đổi `BUILDER_DENIED_REASON` thành chuỗi khác rồi chạy lại: bài "policy tra denied kem hang ghim" phải FAIL. Hoàn nguyên. Ghi lại kết quả vào transcript.

- [ ] **Step 8: Commit**

```bash
git add apps/agent/agent/lib/session-purpose.ts apps/agent/agent/lib/custom-agent-dispatch.ts apps/agent/agent/subagents/agent_builder/lib/authorization.ts apps/agent/test/chan-uy-thac.spec.ts
git commit -m "feat(agent): tu choi luot builder sai bang approval policy thay vi exception"
```

---

### Task 2: Gắn policy vào cả ba tool, giữ lớp trong

**Files:**
- Modify: `apps/agent/agent/subagents/agent_builder/tools/inspect_context.ts`
- Modify: `apps/agent/agent/subagents/agent_builder/tools/write_agent_file.ts`
- Modify: `apps/agent/agent/subagents/agent_builder/tools/save_agent_draft.ts`
- Test: `apps/agent/test/chan-uy-thac.spec.ts`

**Interfaces:**
- Consumes: `builderTurnApproval`, `BUILDER_DENIED_REASON` (Task 1).

**`independent: false`** — tiêu thụ Task 1.

- [ ] **Step 1: Viết bài đo hỏng — nhóm `moi-tool`**

Thêm vào `apps/agent/test/chan-uy-thac.spec.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

const TOOL_DIR = join(import.meta.dir, "../agent/subagents/agent_builder/tools");
const TOOLS_GHIM = [
	"inspect_context",
	"write_agent_file",
	"save_agent_draft",
] as const;

describe("moi-tool", () => {
	it("dan so tren dia phai bang danh sach ghim", () => {
		const tren_dia = readdirSync(TOOL_DIR).filter((f) =>
			readFileSync(join(TOOL_DIR, f), "utf8").includes("requireBuilderAttribute"),
		);
		expect(tren_dia.map((f) => f.replace(/\.ts$/, "")).sort()).toEqual(
			[...TOOLS_GHIM].sort(),
		);
	});

	it("moi tool ghim deu khai policy VA giu lop trong", async () => {
		expect(TOOLS_GHIM).toHaveLength(3);
		for (const name of TOOLS_GHIM) {
			const mod = await import(`../agent/subagents/agent_builder/tools/${name}`);
			expect(mod.default.approval).toBe(builderTurnApproval);
			const src = readFileSync(join(TOOL_DIR, `${name}.ts`), "utf8");
			expect(src).toContain("requireBuilderAttribute");
		}
	});

	it("khong tool nao viet lai hang ly do tai cho", () => {
		for (const name of TOOLS_GHIM) {
			const src = readFileSync(join(TOOL_DIR, `${name}.ts`), "utf8");
			expect(src).not.toContain(BUILDER_DENIED_REASON);
		}
	});
});
```

Thêm `readdirSync` vào import `node:fs`.

- [ ] **Step 2: Chạy để chắc nó hỏng**

Run: `cd apps/agent && bun test test/chan-uy-thac.spec.ts -t moi-tool`
Expected: FAIL — `mod.default.approval` là `undefined`.

- [ ] **Step 3: Gắn policy vào từng tool**

Mỗi file thêm import và một dòng `approval` trong `defineTool`, ví dụ `inspect_context.ts`:

```ts
import { builderTurnApproval } from "../lib/authorization";

export default defineTool({
	approval: builderTurnApproval,
	description: "…",
```

Làm y hệt cho `write_agent_file.ts` và `save_agent_draft.ts`. **Không gỡ** `requireBuilderAttribute` khỏi bất kỳ file nào.

- [ ] **Step 4: Chạy lại**

Run: `cd apps/agent && bun test test/chan-uy-thac.spec.ts -t moi-tool`
Expected: PASS, 3 bài.

- [ ] **Step 5: Chiều đỏ**

Gỡ `approval: builderTurnApproval` khỏi đúng `write_agent_file.ts` → bài "moi tool ghim deu khai policy" phải FAIL và nêu tên. Hoàn nguyên. Rồi gỡ `requireBuilderAttribute` khỏi đúng `save_agent_draft.ts` → bài "dan so tren dia" phải FAIL. Hoàn nguyên.

- [ ] **Step 6: Commit**

```bash
git add apps/agent/agent/subagents/agent_builder/tools apps/agent/test/chan-uy-thac.spec.ts
git commit -m "feat(agent): ba tool builder deu qua cua approval, lop trong giu nguyen"
```

---

### Task 3: Cửa ra `not_authorized`

**Files:**
- Modify: `apps/agent/agent/subagents/agent_builder/agent.ts`
- Modify: `apps/agent/agent/subagents/agent_builder/lib/execution-state.ts`
- Modify: `apps/agent/agent/subagents/agent_builder/hooks/execution-guard.ts`
- Test: `apps/agent/test/chan-uy-thac.spec.ts`

**Interfaces:**
- Produces: `recordBuilderActions(state, turnId, stepIndex, actions, authorized: boolean)` — thêm tham số thứ năm.
- Consumes: `builderTurnAuthorized` (Task 1).

**`independent: false`** — tiêu thụ Task 1.

- [ ] **Step 1: Viết bài đo hỏng — nhóm `ket-thuc`**

```ts
import agentBuilder from "../agent/subagents/agent_builder/agent";
import { recordBuilderActions } from "../agent/subagents/agent_builder/lib/execution-state";

const trangThaiMoi = () => ({
	turnId: null, stepIndex: null, callIds: [], stepCallIds: [],
	saveCallIds: [], savePending: false, saved: false,
});

describe("ket-thuc", () => {
	it("schema nhan not_authorized va van nhan draft_ready", () => {
		const schema = agentBuilder.outputSchema;
		expect(
			schema.safeParse({ status: "not_authorized", reason: "khong duoc phep" })
				.success,
		).toBe(true);
		expect(
			schema.safeParse({
				status: "draft_ready", summary: "xong", agentId: "a", versionId: "v",
			}).success,
		).toBe(true);
		expect(schema.safeParse({ status: "not_authorized" }).success).toBe(false);
	});

	it("luot khong duoc phep goi final_output ma chua luu thi khong bi chan", () => {
		const actions = [{ callId: "c1", kind: "tool", toolName: "final_output" }];
		expect(() =>
			recordBuilderActions(trangThaiMoi(), "t1", 0, actions, false),
		).not.toThrow();
		expect(() =>
			recordBuilderActions(trangThaiMoi(), "t1", 0, actions, true),
		).toThrow("Save the draft before returning draft_ready.");
	});
});
```

- [ ] **Step 2: Chạy để chắc nó hỏng**

Run: `cd apps/agent && bun test test/chan-uy-thac.spec.ts -t ket-thuc`
Expected: FAIL — schema chưa có nhánh `not_authorized`; `recordBuilderActions` chỉ nhận 4 tham số.

- [ ] **Step 3: Mở `outputSchema`**

Trong `agent.ts`:

```ts
	outputSchema: z.discriminatedUnion("status", [
		z.object({
			status: z.literal("draft_ready"),
			summary: z.string().min(1).max(1000),
			agentId: z.string().min(1),
			versionId: z.string().min(1),
		}),
		z.object({
			status: z.literal("not_authorized"),
			reason: z.string().min(1).max(1000),
		}),
	]),
```

- [ ] **Step 4: Nới chốt `final_output`**

Trong `execution-state.ts`, đổi chữ ký và điều kiện:

```ts
export function recordBuilderActions(
	state: BuilderExecutionState,
	turnId: string,
	stepIndex: number,
	actions: readonly BuilderAction[],
	authorized = true,
): BuilderExecutionState {
```

và trong vòng lặp:

```ts
		if (authorized && !current.saved && action.toolName === "final_output") {
			throw new Error("Save the draft before returning draft_ready.");
		}
```

- [ ] **Step 5: Truyền cờ quyền từ hook**

Trong `execution-guard.ts`:

```ts
import { builderTurnAuthorized } from "../../../lib/session-purpose";

		"actions.requested"(event, ctx) {
			const next = recordBuilderActions(
				builderExecutionState.get(),
				event.data.turnId,
				event.data.stepIndex,
				event.data.actions,
				builderTurnAuthorized(ctx),
			);
```

- [ ] **Step 6: Chạy lại**

Run: `cd apps/agent && bun test test/chan-uy-thac.spec.ts -t ket-thuc`
Expected: PASS, 2 bài.

- [ ] **Step 7: Chiều đỏ**

Gỡ nhánh `not_authorized` khỏi union trong bản sao → bài schema phải FAIL. Hoàn nguyên.

- [ ] **Step 8: Commit**

```bash
git add apps/agent/agent/subagents/agent_builder apps/agent/test/chan-uy-thac.spec.ts
git commit -m "feat(agent): con builder ket thuc sach bang not_authorized"
```

---

### Task 4: Cha trả lời bằng lời

**Files:**
- Modify: `apps/agent/agent/instructions/task.ts:79`

**Interfaces:**
- Consumes: không. Chỉ sửa văn bản chỉ dẫn.

**`independent: true`** — không tiêu thụ export nào của task khác.

- [ ] **Step 1: Sửa cả hai nhánh của `builderTaskMarkdown`**

Nhánh `CREATE_AGENT`: sau câu *"If the specialist fails, explain that the build could not finish…"*, chèn:

```
If the specialist returns not_authorized, do not retry it. Tell the user in plain words that building an agent starts from the Create agent action, then answer the question they actually asked. Never show them the reason string, and never mention commandType, subagent, schema or outputSchema.
```

Nhánh còn lại (CHAT): sau câu *"Do not call agent_builder…"*, chèn cùng đoạn ấy.

- [ ] **Step 2: Kiểm chỉ dẫn có đủ hai vật đã ghim**

Run: `cd apps/agent && bun test test/custom-agent-runtime.spec.ts`
Expected: PASS — bài sẵn có về `builderTaskMarkdown` không được vỡ.

- [ ] **Step 3: Commit**

```bash
git add apps/agent/agent/instructions/task.ts
git commit -m "feat(agent): cha chi duong Tao tac nhan bang loi khi bi tu choi"
```

---

### Task 5: Lưới an toàn — cặp cross-layer AC-8/AC-9

**Files:**
- Modify: `apps/agent/agent/channels/crm.ts:281-305`
- Test: `apps/agent/test/chan-uy-thac.spec.ts` (nhóm `khong-treo`)
- Test: `apps/app/test/chan-uy-thac.spec.ts` (mới, vế màn)

**Interfaces:**
- Consumes: `builderIdFromToken`, `builderToken` (đã có).

**`independent: false`** — dựa trên Task 3.

- [ ] **Step 1: Viết vế màn hỏng trước**

Tạo `apps/app/test/chan-uy-thac.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { builderConversationIsWorking } from "../lib/agent-builder-state";
import { latestTurnFailure } from "../lib/agent-transcript";

const hoiThoai = (continuationToken: string | null) => ({
	sessionId: "wrun_1",
	continuationToken,
	submissions: [],
});

describe("chan uy thac — ve man", () => {
	it("hang da settle thi khong con dang chay nen", () => {
		expect(builderConversationIsWorking(hoiThoai("crm:builder:conv_1"))).toBe(false);
		expect(builderConversationIsWorking(hoiThoai(null))).toBe(true);
	});

	it("dong su kien that bai lam the do hien, luot thuong thi khong", () => {
		const doHong = [
			{ type: "turn.started", data: {} },
			{ type: "turn.failed", data: { code: "AGENT_FAILED", message: "builder threw" } },
		];
		const binhThuong = [
			{ type: "turn.started", data: {} },
			{ type: "turn.completed", data: {} },
		];
		expect(latestTurnFailure(doHong)).not.toBeNull();
		expect(latestTurnFailure(binhThuong)).toBeNull();
	});
});
```

- [ ] **Step 2: Chạy vế màn**

Run: `cd apps/app && bun test test/chan-uy-thac.spec.ts`
Expected: PASS ngay — hai hàm này đã đúng sẵn. Nếu FAIL thì kiểu dữ liệu fixture sai, sửa fixture cho khớp kiểu thật, **không** sửa hàm.

- [ ] **Step 3: Viết vế agent hỏng — nhóm `khong-treo`**

```ts
import crmChannel from "../agent/channels/crm";
import { builderToken } from "../agent/lib/custom-agent-dispatch";

describe("khong-treo", () => {
	it("turn.failed ghi lai continuationToken cho hoi thoai builder", async () => {
		const ghi: Array<Record<string, unknown>> = [];
		const conversationId = `conv_${Date.now()}`;
		await chayHandler(crmChannel, "turn.failed", {
			data: { code: "AGENT_FAILED", message: "builder threw" },
			channel: { continuationToken: builderToken(conversationId) },
			ghi,
		});
		expect(ghi).toHaveLength(1);
		expect(ghi[0]?.continuationToken).toBe(builderToken(conversationId));
	});

	it("con chet khong tra noi output thi luot cha hong, khong im lang", async () => {
		expect(suKienThatBaiCuaLuot(luotConChet())).not.toHaveLength(0);
	});
});
```

`chayHandler`, `suKienThatBaiCuaLuot`, `luotConChet` là ba helper cục bộ của file test; người thực thi dựng chúng theo đúng kiểu thật của `crm.ts` (đọc chữ ký `events` ở `apps/agent/agent/channels/crm.ts:242`), và **ghi lại `continuationToken` xuất ra làm vật cho vế màn**.

- [ ] **Step 4: Chạy để chắc bài thứ hai hỏng**

Run: `cd apps/agent && bun test test/chan-uy-thac.spec.ts -t khong-treo`
Expected: bài 1 PASS (handler đã đúng sẵn), bài 2 FAIL.

- [ ] **Step 5: Làm lượt cha hỏng khi con chết**

Trong `channels/crm.ts`, thêm nhánh: khi một subagent kết thúc mà không trả nổi output hợp lệ, phát sự kiện thất bại cho lượt cha thay vì để lượt treo. Đọc `subagent.completed` trong danh sách sự kiện eve trước khi viết; dùng đúng tên sự kiện tài liệu `apps/agent/node_modules/eve/docs/concepts/sessions-runs-and-streaming.md` khai, **không đoán tên**.

- [ ] **Step 6: Chạy lại cả hai vế**

Run: `cd apps/agent && bun test test/chan-uy-thac.spec.ts -t khong-treo`
Run: `cd apps/app && bun test test/chan-uy-thac.spec.ts`
Expected: PASS cả hai.

- [ ] **Step 7: Chiều đỏ**

Nuốt sự kiện thất bại trong bản sao → bài "con chet khong tra noi output" phải FAIL. Hoàn nguyên.

- [ ] **Step 8: Năm lệnh chứng, chạy từ gốc kho**

```bash
bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build
```

- [ ] **Step 9: Commit**

```bash
git add apps/agent apps/app/test/chan-uy-thac.spec.ts
git commit -m "feat(agent): luot cha hong ra mat khi con builder chet, khong treo im lang"
```

## Self-review

- **Spec coverage:** phần 1 thiết kế → Task 1+2; phần 2 → Task 3; phần 3 → Task 4; phần 4 → Task 5. AC-1..AC-10 đều có task: AC-1/2/4/5 Task 1, AC-3/10 Task 2, AC-6 Task 3, AC-7 Task 4, AC-8/9 Task 5.
- **Placeholder scan:** Task 5 Step 5 cố tình không viết sẵn tên sự kiện — đó là chỗ **phải đọc tài liệu eve trước**, và viết sẵn một cái tên đoán được sẽ là bịa. Ba helper của Task 5 Step 3 cũng vậy: chữ ký thật nằm trong `crm.ts`, người thực thi đọc rồi dựng.
- **Type consistency:** `builderTurnAuthorized` dùng chung một tên ở Task 1, 3, 5; `BUILDER_DENIED_REASON` một tên ở Task 1, 2; `recordBuilderActions` tham số thứ năm `authorized` đặt một lần ở Task 3.
