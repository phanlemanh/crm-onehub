# Trần uỷ thác chịu được chạy lại — kế hoạch cài đặt

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trần một-lần-uỷ-thác `agent_builder` nhận ra lần chạy lại của một step bằng toạ độ `(turnId, stepIndex, sequence)` thay vì `callId`, và bộ đo bắt được khi chuỗi cưỡng chế của hook chết.

**Architecture:** Tách `defineState` handle sang module riêng để hàm thuần hết phụ thuộc `eve/context` và để chỗ hook đọc-ghi trạng thái thành một seam thay được. Hàm thuần khoá theo toạ độ của sự kiện, nhận cả `event.data` với kiểu suy từ `HookEvent<"actions.requested">` của eve. Bộ đo chạy chính hook qua một handle giả, nên đường cưỡng chế trở nên quan sát được.

**Tech Stack:** TypeScript, `eve@^0.29.4` (`eve/hooks`, `eve/context`), `bun:test` (`mock.module`), Zod 4, node cho hai răng đo.

**Spec:** `docs/superpowers/specs/2026-09-10-tran-uy-thac-chiu-chay-lai-design.md`
**Hợp đồng:** `_acceptance/tran-uy-thac-chiu-chay-lai/contract.md` (13 tiêu chí)
**Evals:** `_acceptance/tran-uy-thac-chiu-chay-lai/evals.yaml` (E1–E13)

## Global Constraints

- **Không viết chú thích trong code.** Không vào mã mới, không vào mã sửa. (`AGENTS.md`)
- **Parse tại biên bằng Zod.** Trạng thái bền là JSON từ ngoài process — parse ngay chỗ đọc, không truyền `Record<string, unknown>` đi xa. (`AGENTS.md`)
- **Câu ném giữ nguyên nguyên văn:** `The agent builder can be delegated only once per turn.`
- **Tên slot trạng thái:** `crm.builder-delegation.v2`. Sửa ở S3 — bản kế hoạch đầu giữ tên cũ và thêm một hàm parse nhận `unknown`, nhưng `lint:slop` chặn đúng: `anti-slop/no-unknown-parameters` chỉ miễn cho `packages/validation/src/**`, và hình dạng này không vượt biên gói nên không thuộc về đó. Xem entry `fix` trong `decisions.jsonl`.
- **Chín tên nhóm bài của vòng trước phải còn:** `khong-quyen` · `co-quyen` · `lan-mot` · `lap-callid` · `luot-moi` · `ngoai-kenh` · `cung-batch` · `mot-cau` · `khong-loi-goi`. Chín khoá `tr_*` trong `_acceptance/config.yaml` trỏ vào chúng và đó là bằng chứng **đã ký** của `tran-mot-lan-uy-thac`.
- **Năm nhóm mới phải có:** `toa-do-chay-lai` · `toa-do-rai-rac` · `toa-do-step-khac` · `lan-dau` · `subagent-khac` · `khong-xoa-slot`.
- **`apps/agent/tsconfig.json` chỉ gồm `agent/**` và `evals/**`** — `test/**` KHÔNG được `check-types` soi. Đừng dựa vào `check-types` để bắt lỗi kiểu trong bộ đo.
- **Kiểu `subagent-call` của eve là union strict**: một hành động hợp lệ cần đủ `callId`, `description`, `input`, `kind`, `name`, `nodeId`, `subagentName`.
- **Lệnh cổng, chạy từ gốc kho:** `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build`.
- **Một phép đo mới chỉ tính XONG khi có cặp hai chiều trên CÙNG fixture**: vật lành → xanh; phá vật thật trong bản sao → đỏ với thông điệp ghim.

---

### Task 1: Tách module trạng thái, và khoá trần theo toạ độ

**Files:**
- Create: `apps/agent/agent/lib/builder-delegation-state.ts`
- Modify: `apps/agent/agent/lib/builder-delegation.ts` (viết lại toàn bộ)
- Modify: `apps/agent/agent/hooks/builder-delegation.ts`
- Test: `apps/agent/test/tran-uy-thac.spec.ts`

**Interfaces:**
- Produces:
  - `builderDelegationState` — `StateHandle<BuilderDelegationState>` từ `defineState("crm.builder-delegation", …)`, sống MỘT MÌNH trong `builder-delegation-state.ts`.
  - `type ActionsRequestedData = HookEvent<"actions.requested">["data"]`
  - `type BuilderDelegationState = { turnId: string | null; stepIndex: number | null; sequence: number | null }`
  - `const EMPTY_BUILDER_DELEGATION: BuilderDelegationState`
  - `const BUILDER_DELEGATION_SUBAGENT = "agent_builder"`
  - `const BUILDER_DELEGATION_LIMIT_MESSAGE = "The agent builder can be delegated only once per turn."`
  - `parseBuilderDelegationState(value: unknown): BuilderDelegationState`
  - `recordBuilderDelegation(state: BuilderDelegationState, event: ActionsRequestedData): BuilderDelegationState`
- Consumes: `purposeOf` từ `agent/lib/session-purpose`.

`independent: false` — Task 2 … 5 đều đứng trên chữ ký này.
Phục vụ: AC-1 … AC-8, AC-10, AC-12, AC-13.

- [ ] **Step 1: Viết bài đo hàm thuần cho trục toạ độ (đỏ trước)**

Thêm vào đầu `apps/agent/test/tran-uy-thac.spec.ts` một bộ dựng hành động ĐỦ TRƯỜNG (union của eve là strict), và năm nhóm mới. Giữ nguyên phần cũ của file ở bước này.

```ts
import { describe, expect, it } from "bun:test";
import type { HookEvent } from "eve/hooks";
import {
	BUILDER_DELEGATION_LIMIT_MESSAGE,
	EMPTY_BUILDER_DELEGATION,
	recordBuilderDelegation,
} from "../agent/lib/builder-delegation";

type SuKien = HookEvent<"actions.requested">;
type DuLieu = SuKien["data"];
type HanhDong = DuLieu["actions"][number];

const goi = (callId: string, subagentName: string): HanhDong => ({
	callId,
	description: "dung ban nhap tac nhan",
	input: {},
	kind: "subagent-call",
	name: subagentName,
	nodeId: "node-1",
	subagentName,
});

const goiBuilder = (callId: string) => goi(callId, "agent_builder");
const goiKhac = (callId: string) => goi(callId, "agent_runner");

const duLieu = (
	turnId: string,
	stepIndex: number,
	sequence: number,
	...actions: HanhDong[]
): DuLieu => ({ actions, sequence, stepIndex, turnId });

const ghi = (state: Parameters<typeof recordBuilderDelegation>[0], data: DuLieu) =>
	recordBuilderDelegation(state, data);

const DA_GHI = { turnId: "turn-1", stepIndex: 2, sequence: 0 };

describe("toa-do-chay-lai", () => {
	it("toa-do-chay-lai: cung toa do, callId KHAC — khong nem, trang thai khong doi", () => {
		expect(ghi(DA_GHI, duLieu("turn-1", 2, 0, goiBuilder("call-b")))).toEqual(DA_GHI);
	});

	it("toa-do-chay-lai: chieu do — CUNG fixture, doi dung truong sequence thi nem", () => {
		expect(() => ghi(DA_GHI, duLieu("turn-1", 2, 1, goiBuilder("call-b")))).toThrow(
			BUILDER_DELEGATION_LIMIT_MESSAGE,
		);
	});
});

describe("toa-do-rai-rac", () => {
	it("toa-do-rai-rac: cung step, sequence KHAC — nem", () => {
		expect(() => ghi(DA_GHI, duLieu("turn-1", 2, 1, goiBuilder("call-b")))).toThrow(
			"only once",
		);
	});

	it("toa-do-rai-rac: chieu do — dua sequence ve bang lan truoc thi khong nem", () => {
		expect(() => ghi(DA_GHI, duLieu("turn-1", 2, 0, goiBuilder("call-b")))).not.toThrow();
		expect(ghi(DA_GHI, duLieu("turn-1", 2, 0, goiBuilder("call-b")))).toEqual(DA_GHI);
	});
});

describe("toa-do-step-khac", () => {
	it("toa-do-step-khac: cung luot, stepIndex KHAC — nem", () => {
		expect(() => ghi(DA_GHI, duLieu("turn-1", 3, 0, goiBuilder("call-b")))).toThrow(
			"only once",
		);
	});

	it("toa-do-step-khac: chieu do — dua CA HAI truong ve dung toa do da ghi thi khong nem", () => {
		expect(ghi(DA_GHI, duLieu("turn-1", 2, 0, goiBuilder("call-b")))).toEqual(DA_GHI);
	});
});

describe("lan-dau", () => {
	it("lan-dau: trang thai rong, mot loi goi — khong nem, ghi dung ca ba truong", () => {
		expect(
			ghi(EMPTY_BUILDER_DELEGATION, duLieu("turn-1", 2, 0, goiBuilder("call-a"))),
		).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });
	});

	it("lan-dau: chieu do — them mot su kien thu hai khac toa do thi nem", () => {
		const sau = ghi(EMPTY_BUILDER_DELEGATION, duLieu("turn-1", 2, 0, goiBuilder("call-a")));
		expect(() => ghi(sau, duLieu("turn-1", 3, 0, goiBuilder("call-b")))).toThrow("only once");
	});
});

describe("subagent-khac", () => {
	it("subagent-khac: mot builder mot subagent khac — khong nem, ghi toa do su kien", () => {
		expect(
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, 0, goiBuilder("call-a"), goiKhac("call-b")),
			),
		).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });
	});

	it("subagent-khac: chieu do — CUNG fixture, doi dung truong subagentName thi nem", () => {
		expect(() =>
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, 0, goiBuilder("call-a"), goiBuilder("call-b")),
			),
		).toThrow("only once");
	});
});
```

- [ ] **Step 2: Chạy để chắc nó đỏ**

Run: `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tran-uy-thac.spec.ts -t toa-do`
Expected: FAIL — `EMPTY_BUILDER_DELEGATION` và `BUILDER_DELEGATION_LIMIT_MESSAGE` chưa tồn tại, và `recordBuilderDelegation` còn nhận ba tham số.

- [ ] **Step 3: Tạo module trạng thái**

```ts
// apps/agent/agent/lib/builder-delegation-state.ts
import { defineState } from "eve/context";
import { EMPTY_BUILDER_DELEGATION } from "./builder-delegation";

export const builderDelegationState = defineState(
	"crm.builder-delegation",
	() => EMPTY_BUILDER_DELEGATION,
);
```

- [ ] **Step 4: Viết lại hàm thuần**

Thay TOÀN BỘ `apps/agent/agent/lib/builder-delegation.ts`:

```ts
import type { HookEvent } from "eve/hooks";
import { z } from "zod";

export const BUILDER_DELEGATION_SUBAGENT = "agent_builder";

export const BUILDER_DELEGATION_LIMIT_MESSAGE =
	"The agent builder can be delegated only once per turn.";

export type ActionsRequestedData = HookEvent<"actions.requested">["data"];

const builderDelegationState = z.object({
	turnId: z.string().nullable(),
	stepIndex: z.number().int().nullable(),
	sequence: z.number().int().nullable(),
});

export type BuilderDelegationState = z.infer<typeof builderDelegationState>;

export const EMPTY_BUILDER_DELEGATION: BuilderDelegationState = {
	turnId: null,
	stepIndex: null,
	sequence: null,
};

export function parseBuilderDelegationState(
	value: unknown,
): BuilderDelegationState {
	const parsed = builderDelegationState.safeParse(value);
	return parsed.success ? parsed.data : EMPTY_BUILDER_DELEGATION;
}

export function recordBuilderDelegation(
	state: BuilderDelegationState,
	event: ActionsRequestedData,
): BuilderDelegationState {
	const { actions, sequence, stepIndex, turnId } = event;
	const current = state.turnId === turnId ? state : EMPTY_BUILDER_DELEGATION;
	const uyThac = actions.filter(
		(action) =>
			action.kind === "subagent-call" &&
			action.subagentName === BUILDER_DELEGATION_SUBAGENT,
	);

	if (uyThac.length === 0) return { ...current, turnId };
	if (uyThac.length > 1) throw new Error(BUILDER_DELEGATION_LIMIT_MESSAGE);

	const daGhi = current.stepIndex !== null && current.sequence !== null;
	if (daGhi && (current.stepIndex !== stepIndex || current.sequence !== sequence)) {
		throw new Error(BUILDER_DELEGATION_LIMIT_MESSAGE);
	}

	return { turnId, stepIndex, sequence };
}
```

Ba điều load-bearing, đừng đơn giản hoá:
- `return { ...current, turnId }` ở nhánh 0 lời gọi giữ toạ độ đã ghi (AC-12) đồng thời trả `null` khi chưa ghi (AC-8). Trả `{ turnId, stepIndex, sequence }` ở nhánh này là **xoá slot** — đúng lỗi AC-12 tồn tại để bắt.
- `parseBuilderDelegationState` là biên: một phiên đang chạy từ trước bản này giữ hình dạng cũ `{ turnId, callIds }` trong slot cùng tên, parse hỏng thì về giá trị đầu chứ không ném — ném ở đây là dựng lại đúng lớp lỗi đang vá.
- Kiểm `uyThac.length > 1` đứng TRƯỚC kiểm toạ độ: hai lời gọi trong một sự kiện là vi phạm bất kể toạ độ.

- [ ] **Step 5: Cập nhật hook để truyền cả `event.data`**

```ts
// apps/agent/agent/hooks/builder-delegation.ts
import { defineHook } from "eve/hooks";
import {
	parseBuilderDelegationState,
	recordBuilderDelegation,
} from "../lib/builder-delegation";
import { builderDelegationState } from "../lib/builder-delegation-state";
import { purposeOf } from "../lib/session-purpose";

export default defineHook({
	events: {
		"actions.requested"(event, ctx) {
			if (purposeOf(ctx) !== "builder") return;
			const next = recordBuilderDelegation(
				parseBuilderDelegationState(builderDelegationState.get()),
				event.data,
			);
			builderDelegationState.update(() => next);
		},
	},
});
```

- [ ] **Step 6: Viết lại chín nhóm cũ theo chữ ký mới, giữ NGUYÊN tên nhóm**

Trong `test/tran-uy-thac.spec.ts`, giữ đúng chín `describe` cũ (`khong-quyen`, `co-quyen`, `lan-mot`, `lap-callid`, `luot-moi`, `ngoai-kenh`, `cung-batch`, `mot-cau`, `khong-loi-goi`) và đổi thân bài sang chữ ký mới. Ví dụ ba nhóm:

```ts
describe("luot-moi", () => {
	it("luot-moi: turnId khac thi tran mo lai, trang thai mang toa do moi", () => {
		expect(ghi(DA_GHI, duLieu("turn-2", 5, 3, goiBuilder("call-b")))).toEqual({
			turnId: "turn-2",
			stepIndex: 5,
			sequence: 3,
		});
	});

	it("luot-moi: chieu do — giu nguyen turnId cu va doi stepIndex thi chan", () => {
		expect(() => ghi(DA_GHI, duLieu("turn-1", 5, 3, goiBuilder("call-b")))).toThrow(
			"only once",
		);
	});
});

describe("cung-batch", () => {
	it("cung-batch: hai loi goi builder trong CUNG mot actions thi chan", () => {
		expect(() =>
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, 0, goiBuilder("call-a"), goiBuilder("call-b")),
			),
		).toThrow("only once");
	});

	it("cung-batch: chieu do — loi goi thu hai toi subagent KHAC thi khong chan", () => {
		expect(
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, 0, goiBuilder("call-a"), goiKhac("call-b")),
			),
		).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });
	});
});

describe("mot-cau", () => {
	const cauNem = (): string => {
		try {
			ghi(DA_GHI, duLieu("turn-1", 3, 0, goiBuilder("call-b")));
		} catch (loi) {
			return (loi as Error).message;
		}
		throw new Error("tran khong bat: khong co lan nem nao de doc cau");
	};

	it("mot-cau: cau nem BANG DUNG hang dung chung, khong chi chua only once", () => {
		expect(cauNem()).toBe(BUILDER_DELEGATION_LIMIT_MESSAGE);
		expect(BUILDER_DELEGATION_LIMIT_MESSAGE).toBe(
			"The agent builder can be delegated only once per turn.",
		);
	});

	it("mot-cau: chieu do — cau khong con chu creation", () => {
		expect(cauNem()).not.toContain("creation");
	});
});
```

Nhóm `lap-callid` nay đo đúng lời hứa cũ dưới hình dạng mới: nhận lại cùng toạ độ thì không ném, trạng thái không đổi. Nhóm `lan-mot` giữ vế "lời gọi thứ nhất lọt". Nhóm `khong-quyen` và `co-quyen` chuyển sang Task 2 (chúng đo **gác**, cần handle giả).

- [ ] **Step 7: Chạy toàn bộ bộ đo + hai lệnh cổng nhanh**

Run:
```
cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tran-uy-thac.spec.ts
```
Expected: PASS. Rồi từ gốc kho: `bun run check-types` và `bun run lint` — cùng PASS.

- [ ] **Step 8: Phá thử — chứng bộ đo này có răng**

Đổi đúng một chỗ trong `recordBuilderDelegation`: nhánh 0 lời gọi từ `return { ...current, turnId }` thành `return { turnId, stepIndex, sequence }`.
Run: `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tran-uy-thac.spec.ts`
Expected: FAIL ở nhóm `khong-loi-goi` với thông điệp ghim tên nhóm. Hoàn nguyên rồi chạy lại: PASS.

- [ ] **Step 9: Commit**

```bash
git add apps/agent/agent/lib/builder-delegation.ts apps/agent/agent/lib/builder-delegation-state.ts apps/agent/agent/hooks/builder-delegation.ts apps/agent/test/tran-uy-thac.spec.ts
git commit -m "feat(agent): trần uỷ thác khoá theo toạ độ sự kiện, không theo callId mô hình sinh"
```

---

### Task 2: Bộ đo chuỗi cưỡng chế — chạy chính hook qua handle giả

**Files:**
- Create: `apps/agent/test/tran-uy-thac/chuoi-cuong-che.ts`
- Modify: `apps/agent/test/tran-uy-thac.spec.ts`

**Interfaces:**
- Consumes: `builderDelegationState` (đường tuyệt đối tới `agent/lib/builder-delegation-state.ts`), `EMPTY_BUILDER_DELEGATION`, `purposeOf`, `builderSessionAttributes`, `buildPendingInputRequest`, `commandTypeFromAuthorization`.
- Produces:
  - `DUONG_STATE: string` — đường tuyệt đối tới module trạng thái, suy từ `import.meta.url`.
  - `datSlot(dau?: unknown): { doc(): unknown; nhatKy: string[] }` — đặt lại kho sau handle giả cho một bài.
  - `layHandler(): (event: SuKien, ctx: never) => void` — handler của **hook thật**, đã bị chặn ở module trạng thái.
  - `phien(over?: Record<string, string>, authorized?: boolean)` — ngữ cảnh dựng từ đường ghi thật.
  - `duLieu`, `goiBuilder`, `goiKhac` — cùng bộ dựng của Task 1.

`independent: false` — đứng trên chữ ký của Task 1.
Phục vụ: AC-9 (nửa dùng-chung), AC-11, AC-12; và hai nhóm cũ `khong-quyen`, `co-quyen`.

- [ ] **Step 1: Viết module dùng chung**

Điểm load-bearing: `mock.module` chỉ được gọi **một lần**, và export bị chặn là một object **ổn định** uỷ quyền cho một kho đổi được. Gọi `mock.module` nhiều lần với handle mới sẽ không tới được hook, vì hook đã bắt binding cũ lúc import.

```ts
// apps/agent/test/tran-uy-thac/chuoi-cuong-che.ts
import { mock } from "bun:test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
	buildPendingInputRequest,
	commandTypeFromAuthorization,
} from "@crm/validation/builder-question";
import type { HookEvent } from "eve/hooks";
import { EMPTY_BUILDER_DELEGATION } from "../../agent/lib/builder-delegation";
import { builderSessionAttributes } from "../../agent/lib/custom-agent-dispatch";

const DAY = dirname(fileURLToPath(import.meta.url));
export const DUONG_STATE = resolve(DAY, "../../agent/lib/builder-delegation-state.ts");
export const DUONG_HOOK = resolve(DAY, "../../agent/hooks/builder-delegation.ts");

export type SuKien = HookEvent<"actions.requested">;
export type DuLieu = SuKien["data"];
export type HanhDong = DuLieu["actions"][number];

let kho: unknown = EMPTY_BUILDER_DELEGATION;
let nhatKy: string[] = [];

mock.module(DUONG_STATE, () => ({
	builderDelegationState: {
		get: () => {
			nhatKy.push("get");
			return kho;
		},
		update: (buoc: (current: unknown) => unknown) => {
			nhatKy.push("update");
			kho = buoc(kho);
		},
	},
}));

export function datSlot(dau: unknown = EMPTY_BUILDER_DELEGATION) {
	kho = dau;
	nhatKy = [];
	return {
		doc: () => kho,
		get nhatKy() {
			return nhatKy;
		},
	};
}

export async function layHandler() {
	const hook = (await import(DUONG_HOOK)).default;
	return hook.events["actions.requested"] as (event: SuKien, ctx: never) => void;
}

const goi = (callId: string, subagentName: string): HanhDong => ({
	callId,
	description: "dung ban nhap tac nhan",
	input: {},
	kind: "subagent-call",
	name: subagentName,
	nodeId: "node-1",
	subagentName,
});

export const goiBuilder = (callId: string) => goi(callId, "agent_builder");
export const goiKhac = (callId: string) => goi(callId, "agent_runner");

export const duLieu = (
	turnId: string,
	stepIndex: number,
	sequence: number,
	...actions: HanhDong[]
): DuLieu => ({ actions, sequence, stepIndex, turnId });

export const suKien = (data: DuLieu) => ({ data }) as unknown as SuKien;

const banGhi = (authorized: boolean) =>
	buildPendingInputRequest(
		{ kind: "question", requestId: "req_1", prompt: "Chon mot muc", options: [] },
		authorized,
	);

export const phien = (over: Record<string, string> = {}, authorized = true) =>
	({
		session: {
			auth: {
				current: {
					attributes: {
						...builderSessionAttributes({
							commandType: commandTypeFromAuthorization(banGhi(authorized)),
							message: {
								text: "co",
								resources: [],
								inputResponse: { requestId: "req_1", text: "co" },
							},
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
	}) as never;
```

- [ ] **Step 2: Viết nhóm `khong-xoa-slot` (ba sự kiện) và hai nhóm gác — đỏ trước**

TRƯỚC KHI THÊM: **xoá** các hằng cục bộ `goi`, `goiBuilder`, `goiKhac`, `duLieu`
mà Task 1 đã viết ở đầu `test/tran-uy-thac.spec.ts`, và nhập chúng từ module dùng
chung thay thế. Để cả hai là lỗi trùng tên khi biên dịch, và tệ hơn là hai bộ dựng
fixture song song — đúng lớp lỗi mà sàn khuôn "một bộ dựng" cấm.

```ts
import {
	datSlot,
	duLieu,
	goiBuilder,
	goiKhac,
	layHandler,
	phien,
	suKien,
} from "./tran-uy-thac/chuoi-cuong-che";

const handler = await layHandler();

describe("khong-xoa-slot", () => {
	it("khong-xoa-slot: su kien 0 loi goi dung GIUA hai lan uy thac khong xoa toa do", () => {
		const slot = datSlot();
		handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))), phien());
		expect(slot.doc()).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });

		handler(suKien(duLieu("turn-1", 3, 0, goiKhac("call-x"))), phien());
		expect(slot.doc()).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });

		expect(() =>
			handler(suKien(duLieu("turn-1", 4, 0, goiBuilder("call-b"))), phien()),
		).toThrow("only once");
	});

	it("khong-xoa-slot: chieu do — lan chay lai cua CHINH step da ghi thi khong nem", () => {
		const slot = datSlot();
		handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))), phien());
		handler(suKien(duLieu("turn-1", 3, 0, goiKhac("call-x"))), phien());
		expect(() =>
			handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-b"))), phien()),
		).not.toThrow();
		expect(slot.doc()).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });
	});

	it("khong-xoa-slot: hook that su ghi ben — moi su kien builder co ca get va update", () => {
		const slot = datSlot();
		handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))), phien());
		expect(slot.nhatKy).toEqual(["get", "update"]);
	});
});

describe("khong-quyen", () => {
	it("khong-quyen: hook CHAM chot cung tren luot khong co quyen", () => {
		const slot = datSlot();
		handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))), phien({}, false));
		expect(slot.nhatKy).toEqual(["get", "update"]);
		expect(slot.doc()).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });
	});

	it("khong-quyen: loi goi thu hai khac toa do trong cung luot thi chan", () => {
		datSlot();
		handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))), phien({}, false));
		expect(() =>
			handler(suKien(duLieu("turn-1", 3, 0, goiBuilder("call-b"))), phien({}, false)),
		).toThrow("only once");
	});
});

describe("co-quyen", () => {
	it("co-quyen: luot co quyen van bi chan o loi goi thu hai", () => {
		datSlot();
		handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))), phien({}, true));
		expect(() =>
			handler(suKien(duLieu("turn-1", 3, 0, goiBuilder("call-b"))), phien({}, true)),
		).toThrow("only once");
	});

	it("co-quyen: chieu do — goi dung mot lan thi KHONG chan", () => {
		datSlot();
		expect(() =>
			handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))), phien({}, true)),
		).not.toThrow();
	});
});
```

- [ ] **Step 3: Viết lại ma trận `ngoai-kenh` — nhận diện gác bằng handle bị chạm**

Đổi khuôn nhận diện: vòng trước đọc câu lỗi `No active eve context` của eve; nay đọc **handle giả có bị chạm không**. Đó là cái lợi — hai Known limits của vòng trước (ghim nguyên văn câu lỗi của eve, và đọc tín hiệu môi trường thay vì đầu ra) thôi áp cho ma trận này.

```ts
describe("ngoai-kenh", () => {
	it("ngoai-kenh: ma tran toan phan purpose nhan commandType, sau o", () => {
		const PURPOSES = ["builder", "team-agent", "research"] as const;
		const COMMAND_TYPES = ["CREATE_AGENT", "CHAT"] as const;
		const o = PURPOSES.flatMap((purpose) =>
			COMMAND_TYPES.map((commandType) => ({ purpose, commandType })),
		);
		expect(o).toHaveLength(6);
		for (const { purpose, commandType } of o) {
			const slot = datSlot();
			handler(
				suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))),
				phien({ purpose, commandType }),
			);
			expect(slot.nhatKy.length > 0).toBe(purpose === "builder");
		}
	});
});
```

Sàn khuôn giữ nguyên: cả sáu ô đi qua **một** bộ dựng — đầu ra thật của `builderSessionAttributes` trải ra rồi đè đúng hai trường. Hai ô `builder` chạm handle là đối chứng dương của bốn ô im.

- [ ] **Step 4: Chạy để chắc nó xanh**

Run: `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tran-uy-thac.spec.ts`
Expected: PASS, và tổng số bài ≥ 22.

- [ ] **Step 5: Phá thử — hai đột biến từng cho 22 xanh nay phải đỏ**

Đột biến A: trong hook, bỏ `recordBuilderDelegation` và `builderDelegationState.update`, giữ `builderDelegationState.get()`.
Run: `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tran-uy-thac.spec.ts`
Expected: FAIL ở `khong-xoa-slot` và `khong-quyen`.

Đột biến B: giữ `record`, bỏ `update`.
Expected: FAIL ở `khong-xoa-slot`.

Hoàn nguyên hook sau mỗi lượt, rồi chạy lại: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/agent/test/tran-uy-thac/chuoi-cuong-che.ts apps/agent/test/tran-uy-thac.spec.ts
git commit -m "test(agent): đo chuỗi cưỡng chế của hook qua handle giả, bắt được ca hook chết"
```

---

### Task 3: Răng đột biến — chứng bộ đo bắt được hook chết

**Files:**
- Create: `_acceptance/tran-uy-thac-chiu-chay-lai/rang/hook-chet.mjs`

**Interfaces:**
- Consumes: `apps/agent/agent/hooks/builder-delegation.ts` (đọc nguyên văn từ đĩa), `apps/agent/test/tran-uy-thac/chuoi-cuong-che.ts` (module dùng chung của Task 2).
- Produces: một script node, ba mã thoát `0` / `1` / `2`.

`independent: false` — cần Task 2 đã có module dùng chung.
Phục vụ: AC-9.

- [ ] **Step 1: Viết răng**

Sáu sàn khuôn của E9 phải hiện thành mã, không thành lời:

```js
// _acceptance/tran-uy-thac-chiu-chay-lai/rang/hook-chet.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(DAY, "../../..");
const APP = resolve(GOC, "apps/agent");
const HOOK = resolve(APP, "agent/hooks/builder-delegation.ts");
const CHUOI = resolve(APP, "test/tran-uy-thac/chuoi-cuong-che.ts");
const O = resolve(APP, "node_modules/.cache/rang-hook-chet");

function chet(viSao) {
	console.log(`KHONG DO DUOC: ${viSao}`);
	process.exit(2);
}

function sha() {
	try {
		return execFileSync("git", ["rev-parse", "HEAD"], { cwd: GOC, encoding: "utf8" }).trim();
	} catch {
		return "khong-doc-duoc";
	}
}

const HINH_DANG = [
	{
		ten: "than-hook-rong",
		cam: () =>
			[
				'import { defineHook } from "eve/hooks";',
				"export default defineHook({ events: { \"actions.requested\"() { return; } } });",
			].join("\n"),
	},
	{
		ten: "bo-record-va-update",
		cam: (nguon) =>
			nguon
				.replace(
					/const next = recordBuilderDelegation\([\s\S]*?\);\n/,
					"builderDelegationState.get();\n",
				)
				.replace(/\s*builderDelegationState\.update\(\(\) => next\);\n/, "\n"),
	},
	{
		ten: "bo-update",
		cam: (nguon) =>
			nguon.replace(/\s*builderDelegationState\.update\(\(\) => next\);\n/, "\n"),
	},
];

const nguon = (() => {
	try {
		return readFileSync(HOOK, "utf8");
	} catch {
		return chet(`khong doc duoc ban ma cua hook tai ${HOOK}`);
	}
})();

if (!HOOK.startsWith(resolve(GOC) + "/")) chet("duong dan hook nam ngoai goc suy tu vi tri rang");

console.log(`doc ban ma: ${HOOK}`);
console.log(`moc cay: ${sha()}`);

function chayBoDo(duongSpec) {
	try {
		const ra = execFileSync("bun", ["test", duongSpec], {
			cwd: APP,
			encoding: "utf8",
			env: { ...process.env, CRM_TELEMETRY_DISABLED: "1" },
			stdio: ["ignore", "pipe", "pipe"],
		});
		return { ma: 0, ra };
	} catch (e) {
		const ra = `${e.stdout ?? ""}${e.stderr ?? ""}`;
		if (/did not match any test files/.test(ra)) return { ma: 2, ra };
		if (/error: Cannot find module|Failed to resolve/.test(ra)) return { ma: 2, ra };
		if (/\d+ fail/.test(ra)) return { ma: 1, ra };
		return { ma: 2, ra };
	}
}

function vietSpec(ten, duongHook) {
	const duong = `${O}/${ten}.spec.ts`;
	writeFileSync(
		duong,
		[
			'import { expect, it } from "bun:test";',
			`import { datSlot, duLieu, goiBuilder, phien, suKien } from "${CHUOI}";`,
			`const hook = (await import("${duongHook}")).default;`,
			'const handler = hook.events["actions.requested"];',
			`it("${ten}: chuoi cuong che con song", () => {`,
			"	const slot = datSlot();",
			'	handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))), phien());',
			"	expect(slot.nhatKy.length > 0).toBe(true);",
			'	expect(slot.doc()).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });',
			"	expect(() =>",
			'		handler(suKien(duLieu("turn-1", 3, 0, goiBuilder("call-b"))), phien()),',
			'	).toThrow("only once");',
			"});",
		].join("\n"),
	);
	return duong;
}

mkdirSync(O, { recursive: true });
let ma = 0;
const khongBat = [];

try {
	const nen = chayBoDo(`./${vietSpec("cay-lanh", HOOK).slice(APP.length + 1)}`);
	if (nen.ma !== 0) {
		chet(
			`tren cay LANH bo do chuoi cuong che da khong xanh (ma ${nen.ma}) — mot chieu xanh gay lam moi chieu do vo nghia`,
		);
	}
	console.log("chieu xanh: bo do chuoi cuong che xanh tren cay lanh.");

	for (const hinhDang of HINH_DANG) {
		const banDotBien = hinhDang.cam(nguon);
		if (banDotBien === nguon) {
			chet(`phep bien doi van ban cua hinh dang ${hinhDang.ten} khong cam duoc vao ma — ma da doi`);
		}
		const duongDotBien = `${O}/${hinhDang.ten}.hook.ts`;
		writeFileSync(
			duongDotBien,
			banDotBien
				.replace(/"\.\.\/lib\//g, `"${resolve(APP, "agent/lib")}/`)
				.replace(/'\.\.\/lib\//g, `'${resolve(APP, "agent/lib")}/`),
		);
		const spec = vietSpec(hinhDang.ten, duongDotBien);
		const ket = chayBoDo(`./${spec.slice(APP.length + 1)}`);
		if (ket.ma === 2) {
			chet(`hinh dang ${hinhDang.ten}: ban dot bien khong nap duoc hoac bo do khong chay duoc`);
		}
		if (ket.ma === 0) {
			khongBat.push(hinhDang.ten);
			console.log(`DO: hinh dang ${hinhDang.ten} KHONG bi bo do bat.`);
		} else {
			console.log(`hinh dang ${hinhDang.ten} -> bi bat.`);
		}
	}
} finally {
	rmSync(O, { recursive: true, force: true });
}

if (khongBat.length > 0) {
	console.log(`\nDO: ${khongBat.length}/${HINH_DANG.length} hinh dang khong bi bat: ${khongBat.join(" · ")}`);
	ma = 1;
} else {
	console.log(`\nXANH: ca ${HINH_DANG.length} hinh dang deu bi bo do bat.`);
}
process.exit(ma);
```

Bốn điều đừng đơn giản hoá:
- `chayBoDo` phân loại **ba** kết cục từ đầu ra. `did not match any test files` là ca thật đã chứng tại `83501f3` khi thiếu đường dạng `./…`, và nó **phải** là mã 2 — đọc nó thành "có ném nên bắt được" là ca hỏng nặng nhất của răng này.
- Spec sinh ra **import module dùng chung**, không chép lại phép đo. Chép lại là hằng-đúng.
- Bài đo trong spec sinh ra đòi `slot.nhatKy.length > 0` — dấu hiệu dương rằng hook của bản đột biến **đã chạy**, không chỉ "đã nạp".
- Không sửa file nào trong cây làm việc; bản đột biến ghi dưới `node_modules/.cache/`, dọn trong `finally`.

- [ ] **Step 2: Chạy — chờ mã 0**

Run: `node _acceptance/tran-uy-thac-chiu-chay-lai/rang/hook-chet.mjs; echo "ma=$?"`
Expected: in `doc ban ma:` + `moc cay:` + `chieu xanh:` + ba dòng `bi bat`, rồi `XANH`, `ma=0`.

- [ ] **Step 3: Phá thử răng — đòi mã 1 và mã 2 gọi được tên**

Phá thử một: trong `builder-delegation.ts` đổi cả hai chỗ `throw` thành `return`, tức trần không bao giờ ném trên **cây lành**.
Expected: `KHONG DO DUOC: tren cay LANH bo do chuoi cuong che da khong xanh`, `ma=2` — răng từ chối chấm trên một cây mà chiều xanh đã đổ. Hoàn nguyên.

Bản kế hoạch đầu ghi phép thử này là "làm cùn `slot.nhatKy`", và **đó là một đề sai**: bài đo sinh ra đứng trên ba assert (`nhatKy`, `slot.doc()`, vế ném), nên làm cùn một assert thì hai assert kia vẫn gánh và răng vẫn bắt đúng. Đổi sang phép thử ở trên vì nó đánh vào **chiều xanh** — thứ duy nhất mà một assert khác không thay thế được.

Phá thử hai: đổi `HINH_DANG[2].cam` thành một regex không khớp gì.
Expected: `KHONG DO DUOC: phep bien doi van ban cua hinh dang bo-update khong cam duoc vao ma`, `ma=2`. Hoàn nguyên.

Phá thử ba: bỏ tiền tố `./` khỏi đường truyền cho `chayBoDo`.
Expected: `KHONG DO DUOC` ở chiều xanh, `ma=2`. Hoàn nguyên.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/tran-uy-thac-chiu-chay-lai/rang/hook-chet.mjs
git commit -m "test(acceptance): răng đột biến — ba hình dạng hook chết đều phải làm bộ đo đỏ"
```

---

### Task 4: Răng kiểu — thiếu toạ độ là lỗi biên dịch

**Files:**
- Create: `_acceptance/tran-uy-thac-chiu-chay-lai/rang/kieu-theo-eve.mjs`

**Interfaces:**
- Consumes: `apps/agent/agent/lib/builder-delegation.ts`, `apps/agent/node_modules/.bin/tsc`.
- Produces: script node, ba mã thoát `0` / `1` / `2`.

`independent: false` — cần chữ ký của Task 1.
Phục vụ: AC-10.

- [ ] **Step 1: Viết răng**

```js
// _acceptance/tran-uy-thac-chiu-chay-lai/rang/kieu-theo-eve.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(DAY, "../../..");
const APP = resolve(GOC, "apps/agent");
const LIB = resolve(APP, "agent/lib/builder-delegation.ts");
const TSC = resolve(APP, "node_modules/.bin/tsc");
const O = resolve(APP, "node_modules/.cache/rang-kieu-theo-eve");

function chet(viSao) {
	console.log(`KHONG DO DUOC: ${viSao}`);
	process.exit(2);
}

function sha() {
	try {
		return execFileSync("git", ["rev-parse", "HEAD"], { cwd: GOC, encoding: "utf8" }).trim();
	} catch {
		return "khong-doc-duoc";
	}
}

const nguon = (() => {
	try {
		return readFileSync(LIB, "utf8");
	} catch {
		return chet(`khong doc duoc ${LIB}`);
	}
})();

if (/BuilderDelegationAction/.test(nguon)) {
	console.log("DO: ma san pham con khai tay BuilderDelegationAction.");
	process.exit(1);
}

console.log(`doc ban ma: ${LIB}`);
console.log(`moc cay: ${sha()}`);

const DU = `import { recordBuilderDelegation, EMPTY_BUILDER_DELEGATION } from "${LIB}";
export const ra = recordBuilderDelegation(EMPTY_BUILDER_DELEGATION, {
	actions: [], sequence: 0, stepIndex: 2, turnId: "turn-1",
});
`;

const THIEU = `import { recordBuilderDelegation, EMPTY_BUILDER_DELEGATION } from "${LIB}";
export const ra = recordBuilderDelegation(EMPTY_BUILDER_DELEGATION, {
	actions: [], sequence: 0, turnId: "turn-1",
});
`;

function chayTsc(ten, ma) {
	const duong = `${O}/${ten}.ts`;
	writeFileSync(duong, ma);
	try {
		execFileSync(
			TSC,
			["--noEmit", "--strict", "--skipLibCheck", "--module", "preserve",
			 "--moduleResolution", "bundler", "--allowImportingTsExtensions",
			 "--target", "ES2022", "--types", "node", duong],
			{ cwd: APP, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
		);
		return { ma: 0, ra: "" };
	} catch (e) {
		return { ma: 1, ra: `${e.stdout ?? ""}${e.stderr ?? ""}` };
	}
}

mkdirSync(O, { recursive: true });
let ket = 0;
try {
	const duong = chayTsc("du-truong", DU);
	if (duong.ma !== 0) {
		chet(`chieu duong da do — file thu DU ca bon truong van khong bien dich duoc:\n${duong.ra.slice(0, 800)}`);
	}
	console.log("chieu duong: du ca bon truong thi bien dich duoc.");

	const thieu = chayTsc("thieu-stepindex", THIEU);
	if (thieu.ma === 0) {
		console.log("DO: thieu stepIndex ma tsc khong do — kieu chua siet theo eve.");
		ket = 1;
	} else if (!/stepIndex/.test(thieu.ra)) {
		chet(`tsc do nhung thong diep khong goi ten stepIndex:\n${thieu.ra.slice(0, 800)}`);
	} else {
		console.log("chieu am: thieu stepIndex thi tsc do va goi dung ten truong.");
	}
} finally {
	rmSync(O, { recursive: true, force: true });
}

if (ket === 0) console.log("\nXANH: kieu tham so suy tu type cong khai cua eve.");
process.exit(ket);
```

Hai điều load-bearing:
- File thử ghi dưới `node_modules/.cache/`, **ngoài** `include` của `apps/agent/tsconfig.json` (`agent/**`, `evals/**`) và ngoài tầm git — nên chính nó không làm `bun run check-types` của cổng đỏ.
- `tsc` chạy trên file thử với cờ tường minh, không dựa vào `tsconfig` của dự án, vì file nằm ngoài `include`.

- [ ] **Step 2: Chạy — chờ mã 0**

Run: `node _acceptance/tran-uy-thac-chiu-chay-lai/rang/kieu-theo-eve.mjs; echo "ma=$?"`
Expected: `chieu duong:` rồi `chieu am:` rồi `XANH`, `ma=0`.

- [ ] **Step 3: Phá thử — đòi mã 1**

Trong `builder-delegation.ts`, đổi tham số thứ hai của `recordBuilderDelegation` thành kiểu khai tay `{ actions: readonly unknown[]; sequence: number; turnId: string }`.
Run lại răng.
Expected: `DO: thieu stepIndex ma tsc khong do`, `ma=1`. Hoàn nguyên rồi chạy lại: `ma=0`.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/tran-uy-thac-chiu-chay-lai/rang/kieu-theo-eve.mjs
git commit -m "test(acceptance): răng kiểu — thiếu toạ độ trong sự kiện là lỗi biên dịch"
```

---

### Task 5: Năm lệnh cổng, và chín khoá của vòng trước

**Files:**
- Modify: `apps/agent/test/tran-uy-thac.spec.ts` (chỉ nếu cổng đỏ)

**Interfaces:** không sinh gì mới.

`independent: false` — đứng cuối.
Phục vụ: mọi tiêu chí; và bất biến "chuỗi bằng chứng đã ký của `tran-mot-lan-uy-thac` không đứt".

- [ ] **Step 1: Chạy năm lệnh cổng từ gốc kho**

```
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```
Expected: cả năm PASS. `agent#test` đỏ ở `retireExhausted` thì chạy `bun run db:test --reset` rồi mới tin màu đỏ.

- [ ] **Step 2: Chạy chín khoá của vòng trước, đúng nguyên văn lệnh trong config**

```bash
cd apps/agent
for g in khong-quyen co-quyen lan-mot lap-callid luot-moi ngoai-kenh cung-batch mot-cau khong-loi-goi; do
  CRM_TELEMETRY_DISABLED=1 bun test test/tran-uy-thac.spec.ts -t "$g" >/dev/null 2>&1 \
    && echo "$g xanh" || echo "$g DO"
done
```
Expected: chín dòng `xanh`. Một dòng `DO` nghĩa là bằng chứng đã ký của vòng trước đứt — sửa nhóm đó, không đổi tên nhóm.

- [ ] **Step 3: Chạy mười một khoá mới**

```bash
cd apps/agent
for g in toa-do-chay-lai toa-do-rai-rac toa-do-step-khac luot-moi lan-dau cung-batch subagent-khac khong-loi-goi ngoai-kenh khong-xoa-slot mot-cau; do
  CRM_TELEMETRY_DISABLED=1 bun test test/tran-uy-thac.spec.ts -t "$g" >/dev/null 2>&1 \
    && echo "$g xanh" || echo "$g DO"
done
cd ..
node _acceptance/tran-uy-thac-chiu-chay-lai/rang/hook-chet.mjs; echo "hook-chet ma=$?"
node _acceptance/tran-uy-thac-chiu-chay-lai/rang/kieu-theo-eve.mjs; echo "kieu ma=$?"
```
Expected: mười một dòng `xanh`, và hai răng `ma=0`.

- [ ] **Step 4: Đặt hợp đồng sang `implemented` và commit**

```bash
sed -i '' 's/^status: approved$/status: implemented/' _acceptance/tran-uy-thac-chiu-chay-lai/contract.md
git add -- _acceptance/tran-uy-thac-chiu-chay-lai/contract.md apps/agent
git commit -m "chore(acceptance): tran-uy-thac-chiu-chay-lai sang implemented — vào vòng chấm"
```

Không dùng `git add -A` hay `git add -u`: cây này dùng chung với các phiên khác, và một lần add-tất-cả đã cuốn mất 477 dòng bằng chứng đã ký.
