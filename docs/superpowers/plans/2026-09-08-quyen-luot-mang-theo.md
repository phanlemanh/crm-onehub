# Quyền của lượt builder mang theo tường minh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Câu trả lời một câu hỏi kế thừa đúng quyền của lượt đã hỏi, thay vì được nâng lên `CREATE_AGENT` chỉ vì nó có hình dạng của một câu trả lời.

**Architecture:** Quyền được ghi vào cột Json `pendingInputRequest` ngay lúc câu hỏi được lưu, đọc lại qua `@crm/validation/builder-question` khi API tạo submission cho câu trả lời. Luật suy diễn trong `builderCommandType` biến mất. Con `agent_builder` được dạy cửa ra `not_authorized`, và hằng lý do viết lại cho con đọc.

**Tech Stack:** zod 4, Prisma Json column, eve 0.29.4, bun test, NestJS.

**Spec:** `docs/superpowers/specs/2026-09-08-quyen-luot-mang-theo-design.md`
**Contract:** `_acceptance/quyen-luot-mang-theo/contract.md`

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào code mới, không thêm khi sửa code cũ.
- **Parse ở biên**; không truyền `Record<string, unknown>` giữa các lớp.
- **Một `.env` ở gốc**; vòng này không thêm biến môi trường nào.
- **Không migration** — dùng cột `Json` sẵn có.
- Lệnh chứng, chạy từ gốc kho: `bun run test` · `bunx turbo run check-types --force` · `bunx turbo run lint --force` · `bun run lint:slop` · `bunx turbo run build --force`.
- Mỗi phép đo mới đi **cặp hai chiều trên cùng fixture**, chiều đỏ ghim thông điệp.
- **Cấm ghi đè thẳng trường `commandType` trong fixture** — mọi phép đo quyền đi qua hàm thật. Đây là lối tắt đã làm lỗ này sống sót ba vòng chấm.

## File Structure

| File | Trách nhiệm |
| --- | --- |
| `packages/validation/src/builder-question.ts` | thêm trường quyền vào khuôn + một bộ đọc **strict** riêng cho quyền (không nuốt lỗi) + hàm suy `commandType` dùng chung |
| `apps/agent/agent/lib/builder-input.ts` | ghi quyền của lượt hỏi vào `pendingInputRequest` |
| `apps/agent/agent/channels/crm.ts` | truyền quyền của lượt từ `ctx` vào hàm ghi |
| `apps/agent/agent/lib/custom-agent-dispatch.ts` | xoá vế suy diễn khỏi `builderCommandType` |
| `apps/api/src/conversations/conversations.service.ts` | đọc bản ghi thay vì ghim cứng `CREATE_AGENT` |
| `apps/agent/agent/subagents/agent_builder/instructions.md` | dạy con cửa ra `not_authorized` |
| `apps/agent/agent/subagents/agent_builder/lib/authorization.ts` | hằng lý do viết cho con |
| `apps/agent/test/quyen-luot.spec.ts` (mới) | nhóm `ke-thua`, `suy-dien`, `cua-ra`, `cong-dong` |
| `apps/api/test/quyen-luot.spec.ts` (mới) | đường API đọc bản ghi |

---

### Task 1: Khuôn quyền và hàm suy dùng chung

**Files:**
- Modify: `packages/validation/src/builder-question.ts`
- Test: `apps/agent/test/quyen-luot.spec.ts`

**Interfaces:**
- Produces: `BUILDER_AUTHORIZATION_KEY = "builderAuthorized"`; `readBuilderAuthorization(value: unknown): boolean` (ném `Error` có thông điệp khi sai khuôn); `commandTypeFromAuthorization(value: unknown): "CHAT" | "CREATE_AGENT"` (nuốt lỗi của bộ đọc thành `CHAT`, và chỉ ở đây).
- Consumes: không.

**`independent: false`** — mọi task sau tiêu thụ export này.

- [ ] **Step 1: Viết bài đo hỏng — nhóm `ke-thua`**

Tạo `apps/agent/test/quyen-luot.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import {
	BUILDER_AUTHORIZATION_KEY,
	commandTypeFromAuthorization,
	readBuilderAuthorization,
} from "@crm/validation/builder-question";

const banGhi = (authorized: boolean) => ({
	kind: "question",
	requestId: "req_1",
	prompt: "Chon mot muc",
	options: [],
	[BUILDER_AUTHORIZATION_KEY]: authorized,
});

describe("ke-thua", () => {
	it("ke-thua: doc duoc ca hai chieu tren cung khuon", () => {
		expect(readBuilderAuthorization(banGhi(true))).toBe(true);
		expect(readBuilderAuthorization(banGhi(false))).toBe(false);
	});

	it("ke-thua: sai khuon thi nem loi CO THONG DIEP, khong nuot", () => {
		const hong = [
			null,
			{ kind: "question", requestId: "req_1", prompt: "x", options: [] },
			{ ...banGhi(true), [BUILDER_AUTHORIZATION_KEY]: "co" },
		];
		expect(hong).toHaveLength(3);
		for (const value of hong) {
			expect(() => readBuilderAuthorization(value)).toThrow(
				"Builder input request is missing a usable authorization flag.",
			);
		}
	});

	it("ke-thua: suy commandType dong khi khong doc duoc", () => {
		expect(commandTypeFromAuthorization(banGhi(true))).toBe("CREATE_AGENT");
		expect(commandTypeFromAuthorization(banGhi(false))).toBe("CHAT");
		expect(commandTypeFromAuthorization(null)).toBe("CHAT");
		expect(commandTypeFromAuthorization({ kind: "question" })).toBe("CHAT");
	});
});
```

- [ ] **Step 2: Chạy để chắc nó hỏng**

Run: `cd apps/agent && bun test test/quyen-luot.spec.ts -t ke-thua`
Expected: FAIL — không resolve được ba export mới.

- [ ] **Step 3: Thêm vào `builder-question.ts`**

Nối vào cuối file, **không** đụng `askedQuestion` và `builderQuestion` đang có:

```ts
export const BUILDER_AUTHORIZATION_KEY = "builderAuthorized";

const authorizationEnvelope = z.object({
	[BUILDER_AUTHORIZATION_KEY]: z.boolean(),
});

export function readBuilderAuthorization(value: unknown): boolean {
	const parsed = authorizationEnvelope.safeParse(value);
	if (!parsed.success) {
		throw new Error(
			"Builder input request is missing a usable authorization flag.",
		);
	}
	return parsed.data[BUILDER_AUTHORIZATION_KEY];
}

export function commandTypeFromAuthorization(
	value: unknown,
): "CHAT" | "CREATE_AGENT" {
	try {
		return readBuilderAuthorization(value) ? "CREATE_AGENT" : "CHAT";
	} catch {
		return "CHAT";
	}
}
```

- [ ] **Step 4: Chạy lại**

Run: `cd apps/agent && bun test test/quyen-luot.spec.ts -t ke-thua`
Expected: PASS, 3 bài.

- [ ] **Step 5: Chiều đỏ — chạy thật, không khai suông**

Trong bản sao tạm, đổi `z.boolean()` thành `z.any()` rồi chạy lại: bài "sai khuon thi nem loi" phải FAIL. Hoàn nguyên và chạy lại cho xanh.

- [ ] **Step 6: Commit**

```bash
git add packages/validation/src/builder-question.ts apps/agent/test/quyen-luot.spec.ts
git commit -m "feat(validation): khuon quyen cua luot hoi va ham suy commandType dung chung"
```

---

### Task 2: Ghi quyền tại lúc hỏi

**Files:**
- Modify: `apps/agent/agent/lib/builder-input.ts`
- Modify: `apps/agent/agent/channels/crm.ts:243-249`
- Test: `apps/agent/test/quyen-luot.spec.ts`

**Interfaces:**
- Consumes: `BUILDER_AUTHORIZATION_KEY` (Task 1); `builderTurnAuthorized` từ `agent/lib/session-purpose`.
- Produces: `persistBuilderInputRequest(data, continuationToken, authenticatedConversationId, authorized: boolean)` — thêm tham số thứ tư.

**`independent: false`** — tiêu thụ Task 1.

- [ ] **Step 1: Viết bài đo hỏng — nối vào nhóm `ke-thua`**

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

it("ke-thua: cho ghi truyen quyen cua luot hoi, khong tu bia", () => {
	const nguon = readFileSync(
		join(import.meta.dir, "../agent/lib/builder-input.ts"),
		"utf8",
	);
	expect(nguon).toContain(BUILDER_AUTHORIZATION_KEY);
	const goi = readFileSync(
		join(import.meta.dir, "../agent/channels/crm.ts"),
		"utf8",
	);
	expect(goi).toContain("builderTurnAuthorized(ctx)");
});
```

- [ ] **Step 2: Chạy để chắc nó hỏng**

Run: `cd apps/agent && bun test test/quyen-luot.spec.ts -t ke-thua`
Expected: FAIL — hai chuỗi chưa có.

- [ ] **Step 3: Nhận quyền và ghi vào bản ghi**

Trong `builder-input.ts`, đổi chữ ký và chỗ ghi:

```ts
export async function persistBuilderInputRequest(
	data: InputRequestedEvent,
	continuationToken: string | undefined,
	authenticatedConversationId: string | null | undefined,
	authorized: boolean,
): Promise<boolean> {
```

và:

```ts
				pendingInputRequest: {
					...question,
					[BUILDER_AUTHORIZATION_KEY]: authorized,
				} as Prisma.InputJsonValue,
```

kèm import `BUILDER_AUTHORIZATION_KEY` từ `@crm/validation/builder-question`.

- [ ] **Step 4: Truyền quyền từ chỗ gọi**

Trong `channels/crm.ts`, handler `input.requested`:

```ts
		async "input.requested"(data, channel, ctx) {
			await persistBuilderInputRequest(
				data,
				channel.continuationToken,
				attribute(ctx, "conversationId"),
				builderTurnAuthorized(ctx),
			);
		},
```

kèm import `builderTurnAuthorized` từ `../lib/session-purpose`.

- [ ] **Step 5: Chạy lại**

Run: `cd apps/agent && bun test test/quyen-luot.spec.ts -t ke-thua`
Expected: PASS, 4 bài.

- [ ] **Step 6: Commit**

```bash
git add apps/agent/agent/lib/builder-input.ts apps/agent/agent/channels/crm.ts apps/agent/test/quyen-luot.spec.ts
git commit -m "feat(agent): ghi quyen cua luot hoi vao pendingInputRequest"
```

---

### Task 3: Xoá luật suy diễn

**Files:**
- Modify: `apps/agent/agent/lib/custom-agent-dispatch.ts`
- Test: `apps/agent/test/quyen-luot.spec.ts`

**Interfaces:**
- Consumes: không. Produces: `builderCommandType(commandType, value)` giữ nguyên chữ ký, đổi thân.

**`independent: false`** — không tiêu thụ export của task khác, nhưng sửa **cùng file test** `apps/agent/test/quyen-luot.spec.ts` với Task 1, 2, 5, 6; chia nhánh song song sẽ đụng nhau ở đúng file đó.

- [ ] **Step 1: Viết bài đo hỏng — nhóm `suy-dien`**

```ts
import { builderCommandType } from "../agent/lib/custom-agent-dispatch";

describe("suy-dien", () => {
	it("suy-dien: message co inputResponse KHONG con nang quyen", () => {
		const traLoi = [
			{ text: "co", resources: [], inputResponse: { requestId: "r1", text: "co" } },
			{ text: "co", resources: [], inputResponse: { requestId: "r1", optionId: "o1" } },
		];
		expect(traLoi).toHaveLength(2);
		for (const message of traLoi) {
			expect(builderCommandType("CHAT", message)).toBe("CHAT");
			expect(builderCommandType("CREATE_AGENT", message)).toBe("CREATE_AGENT");
		}
	});

	it("suy-dien: khong con cho nao suy quyen tu hinh dang tin nhan", () => {
		const nguon = readFileSync(
			join(import.meta.dir, "../agent/lib/custom-agent-dispatch.ts"),
			"utf8",
		);
		expect(nguon).not.toContain("? \"CREATE_AGENT\" :");
	});
});
```

- [ ] **Step 2: Chạy để chắc nó hỏng**

Run: `cd apps/agent && bun test test/quyen-luot.spec.ts -t suy-dien`
Expected: FAIL — `builderCommandType("CHAT", <có inputResponse>)` đang trả `"CREATE_AGENT"`.

- [ ] **Step 3: Xoá vế suy diễn**

```ts
export function builderCommandType(
	commandType: string,
	_value: Prisma.JsonValue,
): string {
	return commandType;
}
```

Giữ chữ ký hai tham số để chỗ gọi không phải đổi; `builderSubmissionMessage` vẫn dùng ở chỗ khác nên không xoá.

- [ ] **Step 4: Chạy lại**

Run: `cd apps/agent && bun test test/quyen-luot.spec.ts -t suy-dien`
Expected: PASS, 2 bài.

- [ ] **Step 5: Chiều đỏ**

Cấy lại vế `return requestId && (optionId || text) ? "CREATE_AGENT" : commandType;` trong bản sao → cả hai bài phải FAIL. Hoàn nguyên.

- [ ] **Step 6: Commit**

```bash
git add apps/agent/agent/lib/custom-agent-dispatch.ts apps/agent/test/quyen-luot.spec.ts
git commit -m "feat(agent): quyen khong con duoc suy tu hinh dang tin nhan"
```

---

### Task 4: API đọc bản ghi thay vì ghim cứng

**Files:**
- Modify: `apps/api/src/conversations/conversations.service.ts:584`
- Test: `apps/api/test/quyen-luot.spec.ts`

**Interfaces:**
- Consumes: `commandTypeFromAuthorization` (Task 1).

**`independent: false`** — tiêu thụ Task 1.

- [ ] **Step 1: Viết bài đo hỏng**

Tạo `apps/api/test/quyen-luot.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import {
	BUILDER_AUTHORIZATION_KEY,
	commandTypeFromAuthorization,
} from "@crm/validation/builder-question";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const cauHoi = (over: Record<string, unknown> = {}) => ({
	kind: "question",
	requestId: "req_1",
	prompt: "Chon mot muc",
	options: [],
	...over,
});

describe("api doc ban ghi quyen", () => {
	it("cap hai chieu tren cung ban ghi, khac dung mot truong", () => {
		expect(
			commandTypeFromAuthorization(cauHoi({ [BUILDER_AUTHORIZATION_KEY]: true })),
		).toBe("CREATE_AGENT");
		expect(
			commandTypeFromAuthorization(cauHoi({ [BUILDER_AUTHORIZATION_KEY]: false })),
		).toBe("CHAT");
	});

	it("ba hinh dang nguon quyen khong dung duoc deu cho CHAT", () => {
		const hong = [null, cauHoi(), cauHoi({ [BUILDER_AUTHORIZATION_KEY]: "co" })];
		expect(hong).toHaveLength(3);
		for (const value of hong) {
			expect(commandTypeFromAuthorization(value)).toBe("CHAT");
		}
	});

	it("service khong con ghim cung CREATE_AGENT cho cau tra loi", () => {
		const nguon = readFileSync(
			join(import.meta.dir, "../src/conversations/conversations.service.ts"),
			"utf8",
		);
		expect(nguon).toContain("commandTypeFromAuthorization(");
		const taoSubmission = nguon.slice(nguon.indexOf("inputRequestId: input.requestId"));
		expect(taoSubmission.slice(0, 200)).not.toContain('commandType: "CREATE_AGENT"');
	});
});
```

- [ ] **Step 2: Chạy để chắc nó hỏng**

Run: `cd apps/api && bun test test/quyen-luot.spec.ts`
Expected: FAIL ở bài thứ ba — service vẫn ghim cứng.

- [ ] **Step 3: Đọc bản ghi**

Trong `conversations.service.ts`, thay dòng 584:

```ts
						commandType: commandTypeFromAuthorization(
							conversation.pendingInputRequest,
						),
```

kèm import `commandTypeFromAuthorization` vào khối import `@crm/validation/builder-question` đã có ở dòng 7. Biến `conversation` là hàng đã nạp ở đầu hàm để lấy `question`; nếu tên khác thì dùng đúng tên đang có tại chỗ, **không** truy vấn thêm.

- [ ] **Step 4: Chạy lại**

Run: `cd apps/api && bun test test/quyen-luot.spec.ts`
Expected: PASS, 3 bài.

- [ ] **Step 5: Chiều đỏ**

Đổi lại thành `commandType: "CREATE_AGENT"` trong bản sao → bài thứ ba phải FAIL. Hoàn nguyên.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/conversations/conversations.service.ts apps/api/test/quyen-luot.spec.ts
git commit -m "feat(api): cau tra loi ke thua quyen cua luot da hoi"
```

---

### Task 5: Dạy con cửa ra, và hằng lý do viết cho con

**Files:**
- Modify: `apps/agent/agent/subagents/agent_builder/instructions.md`
- Modify: `apps/agent/agent/subagents/agent_builder/lib/authorization.ts`
- Test: `apps/agent/test/quyen-luot.spec.ts`

**Interfaces:**
- Consumes: `outputSchema` của `agent_builder` (đã nhận `not_authorized` từ vòng trước).

**`independent: false`** — chỉ sửa văn bản và một hằng, nhưng cũng sửa **cùng file test** với các task khác.

- [ ] **Step 1: Viết bài đo hỏng — nhóm `cua-ra`**

```ts
import agentBuilder from "../agent/subagents/agent_builder/agent";
import { BUILDER_DENIED_REASON } from "../agent/subagents/agent_builder/lib/authorization";

describe("cua-ra", () => {
	it("cua-ra: chi dan cua con khai not_authorized, va schema nhan dung ten do", () => {
		const chiDan = readFileSync(
			join(import.meta.dir, "../agent/subagents/agent_builder/instructions.md"),
			"utf8",
		);
		expect(chiDan).toContain("not_authorized");
		expect(
			agentBuilder.outputSchema.safeParse({
				status: "not_authorized",
				reason: "khong duoc phep",
			}).success,
		).toBe(true);
	});

	it("cua-ra: hang ly do noi voi con, khong noi voi cha", () => {
		expect(BUILDER_DENIED_REASON).toContain("not_authorized");
		expect(BUILDER_DENIED_REASON).not.toContain("Tell the user");
		expect(BUILDER_DENIED_REASON).not.toContain("answer what they actually asked");
	});
});
```

- [ ] **Step 2: Chạy để chắc nó hỏng**

Run: `cd apps/agent && bun test test/quyen-luot.spec.ts -t cua-ra`
Expected: FAIL cả hai — `instructions.md` chưa nhắc, và hằng vẫn mang hai câu cấm.

- [ ] **Step 3: Viết lại hằng lý do cho con**

```ts
export const BUILDER_DENIED_REASON =
	"This turn is not authorized to create or revise an agent. Stop now and return final_output with status not_authorized and this sentence as the reason. Do not write files, do not save a draft.";
```

- [ ] **Step 4: Dạy con cửa ra**

Nối vào cuối `instructions.md`:

```
If any tool returns a denial saying this turn is not authorized, stop
immediately. Call `final_output` with `status: "not_authorized"` and the denial
sentence as `reason`. Do not write files, do not save a draft, and do not
return `draft_ready`.
```

- [ ] **Step 5: Chạy lại**

Run: `cd apps/agent && bun test test/quyen-luot.spec.ts -t cua-ra`
Expected: PASS, 2 bài.

- [ ] **Step 6: Commit**

```bash
git add apps/agent/agent/subagents/agent_builder
git commit -m "feat(agent): con builder biet cua ra not_authorized, hang ly do noi voi con"
```

---

### Task 6: Chuỗi quyền đóng thật, đo hết vòng

**Files:**
- Test: `apps/agent/test/quyen-luot.spec.ts` (nhóm `cong-dong`)

**Interfaces:**
- Consumes: `commandTypeFromAuthorization` (Task 1); `builderSessionAttributes` và `builderCommandType` (`agent/lib/custom-agent-dispatch`); `builderTurnApproval` và `BUILDER_DENIED_REASON` (`agent_builder/lib/authorization`).

**`independent: false`** — tiêu thụ Task 1, 3, 5.

- [ ] **Step 1: Viết bài đo hỏng — nhóm `cong-dong`**

```ts
import { builderSessionAttributes } from "../agent/lib/custom-agent-dispatch";
import { builderTurnApproval } from "../agent/subagents/agent_builder/lib/authorization";

const chuoiQuyen = (authorized: boolean) => {
	const banGhi = {
		kind: "question",
		requestId: "req_1",
		prompt: "x",
		options: [],
		[BUILDER_AUTHORIZATION_KEY]: authorized,
	};
	const commandType = commandTypeFromAuthorization(banGhi);
	const attributes = builderSessionAttributes({
		commandType,
		message: { text: "co", resources: [], inputResponse: { requestId: "req_1", text: "co" } },
		conversationId: "conv_1",
		userId: "user_1",
		submissionId: "sub_1",
		hasTitle: true,
	});
	return builderTurnApproval({
		session: { auth: { current: { attributes }, initiator: null } },
		toolName: "inspect_context",
	});
};

describe("cong-dong", () => {
	it("cong-dong: ban ghi khong duoc phep -> policy tu choi kem hang ghim", () => {
		const GHIM =
			"This turn is not authorized to create or revise an agent. Stop now and return final_output with status not_authorized and this sentence as the reason. Do not write files, do not save a draft.";
		expect(BUILDER_DENIED_REASON).toBe(GHIM);
		expect(chuoiQuyen(false)).toEqual({ type: "denied", reason: GHIM });
	});

	it("cong-dong: ban ghi duoc phep -> policy cho di tiep", () => {
		expect(chuoiQuyen(true)).toBe("not-applicable");
	});
});
```

- [ ] **Step 2: Chạy**

Run: `cd apps/agent && bun test test/quyen-luot.spec.ts -t cong-dong`
Expected: PASS, 2 bài — cả chuỗi đã có sau Task 1, 3, 5.

- [ ] **Step 3: Chiều đỏ — đây là bài quan trọng nhất của vòng**

Trong bản sao, cấy lại vế suy diễn vào `builderCommandType`, rồi chạy lại: bài "ban ghi khong duoc phep" phải FAIL, vì message có `inputResponse` sẽ nâng quyền và policy cho đi tiếp. Đó đúng là lỗ vòng trước. Hoàn nguyên và chạy lại cho xanh.

- [ ] **Step 4: Năm lệnh chứng, chạy từ gốc kho**

```bash
bun run test && bunx turbo run check-types --force && bunx turbo run lint --force && bun run lint:slop && bunx turbo run build --force
```

- [ ] **Step 5: Commit**

```bash
git add apps/agent/test/quyen-luot.spec.ts
git commit -m "test(agent): do het chuoi quyen tu ban ghi toi quyet dinh cua policy"
```

## Self-review

- **Spec coverage:** phần 1 → Task 2; phần 2 → Task 1; phần 3 → Task 4; phần 4 → Task 3; phần 5 → Task 5; AC-9 → Task 6. AC-6 (ba đường còn lại không đổi) do Task 4 phủ vì cả ba đều đi qua cùng service; bài đo của nó nằm trong `apps/api/test/quyen-luot.spec.ts`.
- **Placeholder scan:** Task 4 Step 3 cố ý không ghim tên biến hàng đã nạp — chữ ký thật nằm ngay tại chỗ và người thực thi đọc rồi dùng, viết sẵn một cái tên đoán được sẽ là bịa.
- **Type consistency:** `BUILDER_AUTHORIZATION_KEY`, `readBuilderAuthorization`, `commandTypeFromAuthorization` đặt một lần ở Task 1 và dùng nguyên tên ở Task 2, 4, 6. `BUILDER_DENIED_REASON` đặt lại ở Task 5 và ghim literal ở Task 6.
