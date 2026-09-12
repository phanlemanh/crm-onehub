# Trần một-lần-uỷ-thác cho lượt không có quyền — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chốt cứng một-lần-uỷ-thác `agent_builder` chạy trên **mọi** lượt của kênh builder, kể cả lượt không có quyền — thay cho một câu dặn trong prompt.

**Architecture:** Bỏ vế `commandType` khỏi điều kiện gác của hook `builder-delegation`, giữ vế `purpose`. Đổi câu ném cho đúng cả hai chiều. Bộ đo chạy **chính hook** trong ngữ cảnh eve thật (`ContextContainer` của eve đặt vào `AsyncLocalStorage` toàn cục), fixture rút từ đường ghi thật.

**Tech Stack:** TypeScript, `bun test`, eve 0.29.4 (`eve/hooks`, `eve/context`), `@crm/validation/builder-question`.

**Spec:** `docs/superpowers/specs/2026-09-09-tran-mot-lan-uy-thac-design.md`
**Hợp đồng:** `_acceptance/tran-mot-lan-uy-thac/contract.md` (đã duyệt Cổng 1, `85240a0`)

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào code mới, không thêm vào code sửa (`AGENTS.md`).
- **Không trailer `Co-Authored-By` cho người**; trailer Claude theo cấu hình phiên.
- Mọi phép đo **chạy chính hook** qua `hook.events["actions.requested"]`. Gọi hàm thuần `recordBuilderDelegation` thay cho hook là **mã 2** — lỗ nằm ở điều kiện *bên trong* hook.
- Ngữ cảnh eve phải là `ContextContainer` **thật của eve**, đường dẫn suy từ `require.resolve("eve/package.json")`. Đường viết cứng, hoặc một thùng tự chế, là **mã 2**. Không nạp được thì **ném có tên**, tuyệt đối không `skip`.
- Fixture quyền đi từ `buildPendingInputRequest` (bên ghi thật) → `commandTypeFromAuthorization` → `builderSessionAttributes`. Object literal viết tay đúng khuôn bên đọc là **mã 2**.
- **MEASURE-BIRTH-CLAUSE:** mỗi phép đo mới chỉ tính XONG khi có cặp hai chiều trên **cùng** fixture, và chiều đỏ đã **chạy thật** — phá vật thật trong bản sao, xem thước đỏ với thông điệp ghim. Thiếu cặp = task chưa xong.
- Tên hàm/biến trong bộ đo theo lối tiếng Việt không dấu của kho (`banGhi`, `phienThat`, `chuoiQuyen` ở `quyen-luot.spec.ts`, `chan-uy-thac.spec.ts`).
- Tên `describe` phải **chứa nguyên văn** nhãn lọc mà `_acceptance/config.yaml` gọi bằng `bun test -t`.

---

## File Structure

| File | Trách nhiệm | Trạng thái |
| --- | --- | --- |
| `apps/agent/test/tran-uy-thac.spec.ts` | Toàn bộ bộ đo chín tiêu chí + khung chạy hook trong ngữ cảnh eve | Tạo mới |
| `apps/agent/agent/hooks/builder-delegation.ts` | Điều kiện gác của hook | Sửa, dòng 11-16 |
| `apps/agent/agent/lib/builder-delegation.ts` | Câu ném của trần | Sửa, dòng 37-39 |
| `docs/agent.md` | Mô tả trần trong mục Team-agent builder and runner | Sửa, thêm một gạch đầu dòng |

Một file đo duy nhất: chín tiêu chí dùng chung một khung dựng ngữ cảnh, tách file là nhân bản khung. `_acceptance/config.yaml` đã có sẵn chín khoá executor trỏ vào file này (commit `85240a0`) — **không** thêm khoá nào nữa.

Năm task **tuần tự**, `independent: false` với nhau: cùng chạm một file đo, và Task 1 dựng khung mà bốn task sau đứng lên. Không dùng workflow fan-out.

---

### Task 1: Khung đo chạy hook thật, và vá lỗ

**Files:**
- Create: `apps/agent/test/tran-uy-thac.spec.ts`
- Modify: `apps/agent/agent/hooks/builder-delegation.ts:8-24`
- Test: chính file trên

**Interfaces:**
- Consumes: `buildPendingInputRequest`, `commandTypeFromAuthorization` từ `@crm/validation/builder-question`; `builderSessionAttributes` từ `../agent/lib/custom-agent-dispatch`; `builderDelegationState` từ `../agent/lib/builder-delegation`; `default` export của `../agent/hooks/builder-delegation`.
- Produces — bốn thứ Task 2-5 dùng lại, **giữ nguyên tên**:
  - `trongLuot<T>(fn: () => T): T` — chạy `fn` trong một ngữ cảnh eve mới tinh
  - `phien(over?: Record<string, string>, authorized?: boolean)` — dựng `ctx` của phiên
  - `goiBuilder(callId: string)` — một action `subagent-call` tới `agent_builder`
  - `suKien(turnId: string, ...actions: unknown[])` — một sự kiện `actions.requested`
  - `chay(ctx: unknown, event: unknown): void` — gọi handler thật của hook

**Serves:** AC-1 (ca đang bỏ lọt), AC-2 (không hồi quy), AC-3 (lần một vẫn lọt) · evals E1, E2, E3

- [ ] **Step 1: Viết khung + ba bài đo, chưa sửa code sản phẩm**

Tạo `apps/agent/test/tran-uy-thac.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { createRequire } from "node:module";
import { join } from "node:path";
import {
	buildPendingInputRequest,
	commandTypeFromAuthorization,
} from "@crm/validation/builder-question";
import hook from "../agent/hooks/builder-delegation";
import { builderDelegationState } from "../agent/lib/builder-delegation";
import { builderSessionAttributes } from "../agent/lib/custom-agent-dispatch";

const gocEve = join(
	createRequire(import.meta.url).resolve("eve/package.json"),
	"..",
);
const duongThung = join(gocEve, "dist/src/context/container.js");
const { ContextContainer } = await import(duongThung).catch((loi) => {
	throw new Error(
		`bố cục eve đã đổi: không nạp được ContextContainer tại ${duongThung} (${loi})`,
	);
});

const KHOA_ALS = Symbol.for("eve.context-storage");
const als = (globalThis as Record<symbol, unknown>)[KHOA_ALS] as {
	run<T>(store: unknown, fn: () => T): T;
};
if (!als) {
	throw new Error(`bố cục eve đã đổi: không thấy AsyncLocalStorage ở ${String(KHOA_ALS)}`);
}

export const trongLuot = <T>(fn: () => T): T => als.run(new ContextContainer(), fn);

const banGhi = (authorized: boolean) =>
	buildPendingInputRequest(
		{ kind: "question", requestId: "req_1", prompt: "Chon mot muc", options: [] },
		authorized,
	);

export const phien = (over: Record<string, string> = {}, authorized = true) => ({
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
});

export const goiBuilder = (callId: string) => ({
	kind: "subagent-call",
	callId,
	subagentName: "agent_builder",
});

export const suKien = (turnId: string, ...actions: unknown[]) => ({
	data: { turnId, actions },
});

const handler = hook.events["actions.requested"];

export const chay = (ctx: unknown, event: unknown): void => {
	handler(event as never, ctx as never);
};

describe("khong-quyen", () => {
	it("khong-quyen: goi lan hai bi chan", () => {
		trongLuot(() => {
			const ctx = phien({}, false);
			chay(ctx, suKien("turn-1", goiBuilder("call-1")));
			expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-2")))).toThrow(
				"only once",
			);
		});
	});

	it("khong-quyen: chieu do — cung bo dung, doi mot truong sang duoc phep, cung chan", () => {
		trongLuot(() => {
			const ctx = phien({}, true);
			chay(ctx, suKien("turn-1", goiBuilder("call-1")));
			expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-2")))).toThrow(
				"only once",
			);
		});
	});
});

describe("co-quyen", () => {
	it("co-quyen: goi lan hai bi chan nhu cu", () => {
		trongLuot(() => {
			const ctx = phien({}, true);
			chay(ctx, suKien("turn-1", goiBuilder("call-1")));
			expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-2")))).toThrow(
				"only once",
			);
		});
	});

	it("co-quyen: chieu do — goi dung mot lan thi KHONG chan", () => {
		trongLuot(() => {
			const ctx = phien({}, true);
			expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-1")))).not.toThrow();
		});
	});
});

describe("lan-mot", () => {
	it("lan-mot: luot khong quyen, goi mot lan thi lot va trang thai ghi dung callId", () => {
		trongLuot(() => {
			const ctx = phien({}, false);
			chay(ctx, suKien("turn-1", goiBuilder("call-1")));
			expect(builderDelegationState.get()).toEqual({
				turnId: "turn-1",
				callIds: ["call-1"],
			});
		});
	});

	it("lan-mot: chieu do — them loi goi thu hai khac callId thi chan", () => {
		trongLuot(() => {
			const ctx = phien({}, false);
			chay(ctx, suKien("turn-1", goiBuilder("call-1")));
			expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-2")))).toThrow(
				"only once",
			);
		});
	});
});
```

- [ ] **Step 2: Chạy để thấy nó ĐỎ đúng chỗ**

Run: `cd apps/agent && bun test test/tran-uy-thac.spec.ts`

Expected: nhóm `co-quyen` XANH cả hai bài (đường cũ vẫn chạy). Nhóm `khong-quyen` bài thứ nhất **ĐỎ** — không ném gì cả, vì hook return sớm. Nhóm `lan-mot` bài thứ nhất **ĐỎ**: trạng thái là `{ turnId: null, callIds: [] }` chứ không phải `{ turnId: "turn-1", callIds: ["call-1"] }`, vì hook chưa từng ghi. Bài chiều đỏ của `lan-mot` cũng ĐỎ.

Ba bài đỏ này **chính là lỗ** — đừng sửa bài đo cho nó xanh.

- [ ] **Step 3: Vá hook — bỏ vế `commandType`**

`apps/agent/agent/hooks/builder-delegation.ts`, thay trọn file:

```ts
import { defineHook } from "eve/hooks";
import {
	builderDelegationState,
	recordBuilderDelegation,
} from "../lib/builder-delegation";
import { purposeOf } from "../lib/session-purpose";

export default defineHook({
	events: {
		"actions.requested"(event, ctx) {
			if (purposeOf(ctx) !== "builder") {
				return;
			}

			const next = recordBuilderDelegation(
				builderDelegationState.get(),
				event.data.turnId,
				event.data.actions,
			);
			builderDelegationState.update(() => next);
		},
	},
});
```

`attribute` không còn người dùng trong file này — bỏ khỏi dòng import, giữ `purposeOf`.

- [ ] **Step 4: Chạy lại, cả sáu bài phải XANH**

Run: `cd apps/agent && bun test test/tran-uy-thac.spec.ts`
Expected: 6 pass, 0 fail.

- [ ] **Step 5: Chạy thật CHIỀU ĐỎ của bản vá (MEASURE-BIRTH-CLAUSE)**

Phá vật thật trong bản sao, xem thước có đỏ với thông điệp ghim không:

```bash
cd apps/agent
cp agent/hooks/builder-delegation.ts /tmp/hook-that.ts
sed -i '' 's|if (purposeOf(ctx) !== "builder") {|if (purposeOf(ctx) !== "builder" \|\| attribute(ctx, "commandType") !== "CREATE_AGENT") {|' agent/hooks/builder-delegation.ts
sed -i '' 's|import { purposeOf } from "../lib/session-purpose";|import { attribute, purposeOf } from "../lib/session-purpose";|' agent/hooks/builder-delegation.ts
bun test test/tran-uy-thac.spec.ts; echo "ma thoat = $?"
cp /tmp/hook-that.ts agent/hooks/builder-delegation.ts
bun test test/tran-uy-thac.spec.ts; echo "ma thoat sau khi tra lai = $?"
```

Expected: lượt giữa **mã thoát khác 0**, với bài `khong-quyen: goi lan hai bi chan` đỏ. Lượt cuối mã thoát 0. Chép hai dòng mã thoát vào ghi chú commit.

- [ ] **Step 6: Ba lệnh cổng liên quan**

Run: `bun run check-types && bun run lint && bun run lint:slop` (từ gốc kho)
Expected: cả ba mã thoát 0.

- [ ] **Step 7: Commit**

```bash
git add apps/agent/test/tran-uy-thac.spec.ts apps/agent/agent/hooks/builder-delegation.ts
git commit -m "$(cat <<'MSG'
feat(agent): trần một-lần-uỷ-thác áp cả lượt không có quyền

Hook builder-delegation bỏ vế commandType, giữ vế purpose. Trần nay chạy
trên mọi lượt của kênh builder, kể cả nhánh not_authorized.

Bộ đo chạy chính hook qua hook.events["actions.requested"], trong ngữ cảnh
eve thật (ContextContainer của eve đặt vào AsyncLocalStorage toàn cục), fixture
rút từ buildPendingInputRequest.

Chiều đỏ đã chạy thật: trả lại vế commandType thì bài khong-quyen đỏ.
MSG
)"
```

---

### Task 2: Một câu thông điệp, đúng cho cả hai chiều

**Files:**
- Modify: `apps/agent/agent/lib/builder-delegation.ts:36-40`
- Modify: `docs/agent.md` (mục `## Team-agent builder and runner`)
- Test: `apps/agent/test/tran-uy-thac.spec.ts` (thêm nhóm `mot-cau`)

**Interfaces:**
- Consumes: `trongLuot`, `phien`, `goiBuilder`, `suKien`, `chay` từ Task 1.
- Produces: không có gì cho task sau.

**Serves:** AC-8 · eval E8

- [ ] **Step 1: Viết bài đo, lấy câu từ LẦN NÉM THẬT**

Thêm vào cuối `apps/agent/test/tran-uy-thac.spec.ts`:

```ts
const cauNem = (authorized: boolean): string =>
	trongLuot(() => {
		const ctx = phien({}, authorized);
		chay(ctx, suKien("turn-1", goiBuilder("call-1")));
		try {
			chay(ctx, suKien("turn-1", goiBuilder("call-2")));
		} catch (loi) {
			return (loi as Error).message;
		}
		throw new Error("tran khong bat: khong co lan nem nao de doc cau");
	});

describe("mot-cau", () => {
	it("mot-cau: cau nem dung nguyen van, khong con chu creation", () => {
		expect(cauNem(false)).toBe(
			"The agent builder can be delegated only once per turn.",
		);
		expect(cauNem(false)).not.toContain("creation");
	});

	it("mot-cau: hai chieu quyen cho cau BANG NHAU", () => {
		expect(cauNem(true)).toBe(cauNem(false));
	});
});
```

- [ ] **Step 2: Chạy để thấy ĐỎ**

Run: `cd apps/agent && bun test test/tran-uy-thac.spec.ts -t mot-cau`
Expected: bài thứ nhất **ĐỎ** — câu hiện tại còn chữ `creation`. Bài thứ hai xanh (hai chiều vốn cùng một hằng).

- [ ] **Step 3: Đổi câu ném**

`apps/agent/agent/lib/builder-delegation.ts`, trong `recordBuilderDelegation`:

```ts
		if (callIds.size > 0) {
			throw new Error(
				"The agent builder can be delegated only once per turn.",
			);
		}
```

- [ ] **Step 4: Chạy lại**

Run: `cd apps/agent && bun test test/tran-uy-thac.spec.ts`
Expected: 8 pass, 0 fail. Bài cũ ở `custom-agent-runtime.spec.ts` ghim `.toThrow("only once")` nên vẫn xanh.

Run: `cd apps/agent && bun test test/custom-agent-runtime.spec.ts`
Expected: pass.

- [ ] **Step 5: Chạy thật CHIỀU ĐỎ**

```bash
cd apps/agent
cp agent/lib/builder-delegation.ts /tmp/lib-that.ts
sed -i '' 's|only once per turn.|only once per creation turn.|' agent/lib/builder-delegation.ts
bun test test/tran-uy-thac.spec.ts -t mot-cau; echo "ma thoat = $?"
cp /tmp/lib-that.ts agent/lib/builder-delegation.ts
bun test test/tran-uy-thac.spec.ts -t mot-cau; echo "ma thoat sau khi tra lai = $?"
```

Expected: lượt giữa **mã thoát khác 0**; lượt cuối mã thoát 0.

- [ ] **Step 6: Cập nhật `docs/agent.md`**

Trong mục `## Team-agent builder and runner`, thêm một gạch đầu dòng ngay sau gạch đầu dòng **"A denial is a result, not an exception."**:

```markdown
- **One delegation per turn, on every turn.** `hooks/builder-delegation.ts` gates on
  `purpose` alone, not on `commandType`. It has to: the `not_authorized` branch makes
  an unauthorized turn a legal path that still delegates once, and gating on
  `CREATE_AGENT` left that path with no hard stop at all — only the sentence in
  `instructions/task.ts` telling the root not to retry. A hook can only observe, so the
  stop is a throw, which surfaces as `turn.failed`: the turn settles with a failure
  card instead of burning a fresh child session per retry. The message says `per turn`,
  not `per creation turn`, because it now fires on turns that create nothing.
```

- [ ] **Step 7: Ba lệnh cổng + commit**

```bash
bun run check-types && bun run lint && bun run lint:slop
git add apps/agent/agent/lib/builder-delegation.ts apps/agent/test/tran-uy-thac.spec.ts docs/agent.md
git commit -m "$(cat <<'MSG'
feat(agent): một câu thông điệp cho trần, đúng cả lượt không tạo tác nhân

Bỏ chữ "creation" khỏi câu ném: trần nay bật trên lượt không có quyền, và lượt
đó không phải creation turn. Câu này đi nguyên văn ra turn.failed nên nó là câu
người dùng có thể thấy.

Bài đo lấy câu từ lần ném thật của hook, không đọc hằng trong mã nguồn, và đòi
hai chiều quyền cho câu bằng nhau.
MSG
)"
```

---

### Task 3: Lặp `callId` và ranh giới lượt

**Files:**
- Test: `apps/agent/test/tran-uy-thac.spec.ts` (thêm nhóm `lap-callid`, `luot-moi`)

**Interfaces:**
- Consumes: `trongLuot`, `phien`, `goiBuilder`, `suKien`, `chay`, `builderDelegationState` từ Task 1.
- Produces: không có gì cho task sau.

**Serves:** AC-4, AC-5 · evals E4, E5

Không sửa code sản phẩm. Hai nhánh này đã đúng ở hàm thuần, nhưng **chưa từng chạy qua hook**, và Task 1 vừa mở chúng ra cho chiều không có quyền.

- [ ] **Step 1: Viết hai nhóm bài đo, mỗi nhóm hai chiều quyền**

```ts
const HAI_CHIEU = [
	{ nhan: "duoc phep", authorized: true },
	{ nhan: "khong duoc phep", authorized: false },
] as const;

describe("lap-callid", () => {
	it("lap-callid: nhan lai dung callId thi khong nem, trang thai khong doi", () => {
		expect(HAI_CHIEU).toHaveLength(2);
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				chay(ctx, suKien("turn-1", goiBuilder("call-1")));
				const truoc = builderDelegationState.get();
				chay(ctx, suKien("turn-1", goiBuilder("call-1")));
				expect(builderDelegationState.get()).toEqual(truoc);
			});
		}
	});

	it("lap-callid: chieu do — doi dung callId sang gia tri khac thi chan, ca hai chieu", () => {
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				chay(ctx, suKien("turn-1", goiBuilder("call-1")));
				expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-2")))).toThrow(
					"only once",
				);
			});
		}
	});
});

describe("luot-moi", () => {
	it("luot-moi: turnId khac thi tran mo lai, trang thai mang luot moi", () => {
		expect(HAI_CHIEU).toHaveLength(2);
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				chay(ctx, suKien("turn-1", goiBuilder("call-1")));
				chay(ctx, suKien("turn-2", goiBuilder("call-2")));
				expect(builderDelegationState.get()).toEqual({
					turnId: "turn-2",
					callIds: ["call-2"],
				});
			});
		}
	});

	it("luot-moi: chieu do — giu nguyen turnId cu thi chan, ca hai chieu", () => {
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				chay(ctx, suKien("turn-1", goiBuilder("call-1")));
				expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-2")))).toThrow(
					"only once",
				);
			});
		}
	});
});
```

- [ ] **Step 2: Chạy — phải XANH ngay**

Run: `cd apps/agent && bun test test/tran-uy-thac.spec.ts -t lap-callid` rồi `-t luot-moi`
Expected: cả bốn bài pass. Đây là hai nhánh đã đúng sẵn; bài đo ghim chúng lại cho **chiều không có quyền** mà Task 1 vừa mở.

- [ ] **Step 3: Chạy thật CHIỀU ĐỎ — phá đúng hai nhánh này**

```bash
cd apps/agent
cp agent/lib/builder-delegation.ts /tmp/lib-that.ts
sed -i '' 's|state.turnId === turnId ? state : { turnId, callIds: \[\] as string\[\] }|{ turnId, callIds: [] as string[] }|' agent/lib/builder-delegation.ts
bun test test/tran-uy-thac.spec.ts -t luot-moi; echo "phe reset = $?"
cp /tmp/lib-that.ts agent/lib/builder-delegation.ts
sed -i '' 's|callIds.has(action.callId)|false|' agent/lib/builder-delegation.ts
bun test test/tran-uy-thac.spec.ts -t lap-callid; echo "phe idempotent = $?"
cp /tmp/lib-that.ts agent/lib/builder-delegation.ts
bun test test/tran-uy-thac.spec.ts; echo "ma thoat sau khi tra lai = $?"
```

Expected: hai lượt phá **mã thoát khác 0** (phá reset làm `luot-moi` đỏ ở bài thứ nhất; phá idempotent làm `lap-callid` đỏ ở bài thứ nhất, thông điệp `only once`). Lượt cuối mã thoát 0.

- [ ] **Step 4: Commit**

```bash
git add apps/agent/test/tran-uy-thac.spec.ts
git commit -m "$(cat <<'MSG'
test(agent): ghim lặp callId và ranh giới lượt cho chiều không có quyền

Hai nhánh này đã đúng ở hàm thuần nhưng chưa từng chạy qua hook, và bản vá vừa
mở chúng ra cho lượt không có quyền. Mỗi nhóm đo cả hai chiều quyền, số assert
bằng số chiều.

Chiều đỏ đã chạy thật: phá nhánh reset thì luot-moi đỏ, phá nhánh idempotent
thì lap-callid đỏ.
MSG
)"
```

---

### Task 4: Ma trận phạm vi phiên, và hai lời gọi cùng một batch

**Files:**
- Test: `apps/agent/test/tran-uy-thac.spec.ts` (thêm nhóm `ngoai-kenh`, `cung-batch`)

**Interfaces:**
- Consumes: `trongLuot`, `phien`, `goiBuilder`, `suKien`, `chay`, `HAI_CHIEU` từ Task 1 và Task 3.
- Produces: không có gì cho task sau.

**Serves:** AC-6, AC-7 · evals E6, E7

- [ ] **Step 1: Viết ma trận toàn phần và bài batch**

`ngoai-kenh` phải sinh sáu ô bằng tích Descartes và assert độ dài bằng 6 — sinh ma trận rồi chỉ assert vài ô là **đếm-rồi-vứt**, mã 1. Cả sáu ô đi **một** bộ dựng `phien(over)`; hai ô `purpose = builder` là chốt kiểm khuôn cho bốn ô kia.

```ts
const PURPOSES = ["builder", "team-agent", "research"] as const;
const COMMAND_TYPES = ["CREATE_AGENT", "CHAT"] as const;

describe("ngoai-kenh", () => {
	it("ngoai-kenh: ma tran toan phan purpose nhan commandType, sau o", () => {
		const o = PURPOSES.flatMap((purpose) =>
			COMMAND_TYPES.map((commandType) => ({ purpose, commandType })),
		);
		expect(o).toHaveLength(6);
		for (const { purpose, commandType } of o) {
			const goi = () =>
				trongLuot(() => {
					const ctx = phien({ purpose, commandType });
					chay(ctx, suKien("turn-1", goiBuilder("call-1")));
					chay(ctx, suKien("turn-1", goiBuilder("call-2")));
				});
			if (purpose === "builder") {
				expect(goi).toThrow("only once");
			} else {
				expect(goi).not.toThrow();
			}
		}
	});
});

describe("cung-batch", () => {
	it("cung-batch: hai loi goi khac callId trong CUNG mot actions thi chan", () => {
		expect(HAI_CHIEU).toHaveLength(2);
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				expect(() =>
					chay(ctx, suKien("turn-1", goiBuilder("call-1"), goiBuilder("call-2"))),
				).toThrow("only once");
			});
		}
	});

	it("cung-batch: chieu do — loi goi thu hai toi subagent KHAC thi khong chan", () => {
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				expect(() =>
					chay(
						ctx,
						suKien("turn-1", goiBuilder("call-1"), {
							kind: "subagent-call",
							callId: "call-2",
							subagentName: "agent_runner",
						}),
					),
				).not.toThrow();
			});
		}
	});
});
```

- [ ] **Step 2: Chạy — phải XANH**

Run: `cd apps/agent && bun test test/tran-uy-thac.spec.ts -t ngoai-kenh` rồi `-t cung-batch`
Expected: cả ba bài pass.

- [ ] **Step 3: Chạy thật CHIỀU ĐỎ — phá vế `purpose` và vế tên subagent**

```bash
cd apps/agent
cp agent/hooks/builder-delegation.ts /tmp/hook-that.ts
cp agent/lib/builder-delegation.ts /tmp/lib-that.ts
sed -i '' 's|if (purposeOf(ctx) !== "builder") {|if (false) {|' agent/hooks/builder-delegation.ts
bun test test/tran-uy-thac.spec.ts -t ngoai-kenh; echo "phe ve purpose = $?"
cp /tmp/hook-that.ts agent/hooks/builder-delegation.ts
sed -i '' 's|action.subagentName !== "agent_builder"|false|' agent/lib/builder-delegation.ts
bun test test/tran-uy-thac.spec.ts -t cung-batch; echo "phe ve ten subagent = $?"
cp /tmp/lib-that.ts agent/lib/builder-delegation.ts
bun test test/tran-uy-thac.spec.ts; echo "ma thoat sau khi tra lai = $?"
```

Expected: hai lượt phá **mã thoát khác 0** (phá vế `purpose` làm bốn ô im hoá ném; phá vế tên subagent làm bài chiều đỏ của `cung-batch` ném oan). Lượt cuối mã thoát 0.

Lượt phá thứ nhất cũng là **chốt kiểm khuôn** mà AC-6 đòi: nếu bộ dựng `phien(over)` sai khuôn thì hai ô `builder` đã không ném ngay từ Step 2.

- [ ] **Step 4: Commit**

```bash
git add apps/agent/test/tran-uy-thac.spec.ts
git commit -m "$(cat <<'MSG'
test(agent): ma trận sáu ô phạm vi phiên, và hai lời gọi cùng một batch

Ma trận purpose nhân commandType sinh từ tích Descartes, assert độ dài bằng 6,
cả sáu ô đi một bộ dựng — hai ô builder ném là chốt kiểm khuôn cho bốn ô im.

Batch: một sự kiện mang hai subagent-call không đi qua nhánh "lần chạy thứ hai
của handler" nên phải đo riêng.

Chiều đỏ đã chạy thật: phá vế purpose thì bốn ô im hoá ném; phá vế tên subagent
thì bài đối chứng ném oan.
MSG
)"
```

---

### Task 5: Vùng bán kính mới — lượt không gọi `agent_builder` lần nào

**Files:**
- Test: `apps/agent/test/tran-uy-thac.spec.ts` (thêm nhóm `khong-loi-goi`)

**Interfaces:**
- Consumes: `trongLuot`, `phien`, `goiBuilder`, `suKien`, `chay`, `HAI_CHIEU`, `builderDelegationState`.
- Produces: không có gì.

**Serves:** AC-9 · eval E9

Đây là vùng bản tại `41ba0a7` **chưa từng chạy**: hook return sớm ở mọi lượt `CHAT`, nên mọi hội thoại của kênh builder không chạm hook lần nào. Bỏ vế `commandType` mở nó ra.

- [ ] **Step 1: Viết bài đo, bốn assert**

```ts
describe("khong-loi-goi", () => {
	it("khong-loi-goi: su kien khong mang agent_builder thi im lang, ca hai chieu", () => {
		const hinhDang = [
			{ nhan: "actions rong", actions: [] as unknown[] },
			{
				nhan: "chi co subagent khac",
				actions: [
					{ kind: "subagent-call", callId: "call-1", subagentName: "agent_runner" },
				] as unknown[],
			},
		];
		const o = hinhDang.flatMap((h) => HAI_CHIEU.map((c) => ({ ...h, ...c })));
		expect(o).toHaveLength(4);
		for (const { actions, authorized } of o) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				expect(() => {
					chay(ctx, suKien("turn-1", ...actions));
					chay(ctx, suKien("turn-1", ...actions));
				}).not.toThrow();
				expect(builderDelegationState.get().callIds).toEqual([]);
			});
		}
	});

	it("khong-loi-goi: chieu do — doi subagentName sang agent_builder thi chan", () => {
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				expect(() => {
					chay(ctx, suKien("turn-1", goiBuilder("call-1")));
					chay(ctx, suKien("turn-1", goiBuilder("call-2")));
				}).toThrow("only once");
			});
		}
	});
});
```

- [ ] **Step 2: Chạy — phải XANH**

Run: `cd apps/agent && bun test test/tran-uy-thac.spec.ts -t khong-loi-goi`
Expected: hai bài pass.

- [ ] **Step 3: Chạy thật CHIỀU ĐỎ**

```bash
cd apps/agent
cp agent/lib/builder-delegation.ts /tmp/lib-that.ts
sed -i '' 's|action.subagentName !== "agent_builder" \|\||false \|\||' agent/lib/builder-delegation.ts
bun test test/tran-uy-thac.spec.ts -t khong-loi-goi; echo "phe ve ten subagent = $?"
cp /tmp/lib-that.ts agent/lib/builder-delegation.ts
bun test test/tran-uy-thac.spec.ts; echo "ma thoat sau khi tra lai = $?"
```

Expected: lượt phá **mã thoát khác 0** — bỏ vế lọc tên subagent thì action `agent_runner` được ghi vào `callIds`, nên ô "chỉ có subagent khác" có `callIds` khác rỗng và assert đỏ. Lượt cuối mã thoát 0.

**Đã thử một chỗ phá SAI trước khi tìm ra chỗ đúng, ghi lại để khỏi lặp:** phá vế lọc `kind` (`action.kind !== "subagent-call"`) **không** làm bài này đỏ, vì action `agent_runner` vẫn bị vế lọc *tên subagent* loại ra. Hệ quả đã biết: **không bài đo nào trong hồ sơ này ghim vế lọc `kind`.** Hợp đồng không đòi nó, và hình dạng "một `tool-call` mang `subagentName: agent_builder`" chưa từng thấy trong runtime — nhưng đây là một khoảng trống có thật, không phải một chỗ đã đo.

- [ ] **Step 4: Cả năm lệnh cổng**

Run từ gốc kho:
```bash
bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build
```
Expected: cả năm mã thoát 0.

- [ ] **Step 5: Commit**

```bash
git add apps/agent/test/tran-uy-thac.spec.ts
git commit -m "$(cat <<'MSG'
test(agent): ghim vùng bán kính mới — lượt builder không gọi agent_builder

Bản trước return sớm ở mọi lượt CHAT nên không hội thoại nào của kênh builder
chạm hook. Bỏ vế commandType mở vùng đó ra, nên nó cần tiêu chí riêng.

Hai hình dạng sự kiện nhân hai chiều quyền, bốn assert, đọc trạng thái chứ
không chỉ "không ném".

Chiều đỏ đã chạy thật: bỏ vế lọc kind thì ô "chỉ có subagent khác" ném oan.
MSG
)"
```

---

## Self-Review

**1. Spec coverage.** Chín tiêu chí của hợp đồng đều có task: AC-1/2/3 → Task 1; AC-8 → Task 2; AC-4/5 → Task 3; AC-6/7 → Task 4; AC-9 → Task 5. Ba việc "không làm" của hợp đồng không có task, đúng như thiết kế: không gỡ câu dặn `task.ts`, không chặn lời gọi đầu tiên (AC-3 giữ), không mở rộng `purpose` (AC-6 ghim).

**2. Placeholder scan.** Không có "TBD", không có "tương tự Task N", không có bước nào mô tả mà không đưa mã. Mọi lệnh chạy đều đầy đủ, mọi kỳ vọng đều nêu mã thoát hoặc số bài.

**3. Type consistency.** `trongLuot`, `phien`, `goiBuilder`, `suKien`, `chay`, `HAI_CHIEU`, `PURPOSES`, `COMMAND_TYPES` — mỗi tên khai đúng một lần (Task 1 khai năm tên đầu, Task 3 khai `HAI_CHIEU`, Task 4 khai hai hằng cuối), và mọi lần dùng sau đều khớp. `phien(over, authorized)` giữ nguyên thứ tự tham số ở cả năm task.

**4. Một chỗ cần người thi công để mắt.** Các lệnh `sed -i ''` ở bước chiều đỏ là khuôn macOS; chuỗi bị thay phải khớp **nguyên văn** mã hiện tại. `sed` không khớp thì không sửa gì và bài đo vẫn xanh — đó là một chiều đỏ **giả**. Sau mỗi lượt `sed` phá vật, `git diff --stat` phải cho thấy file đã đổi; không đổi thì dừng và sửa chuỗi, đừng ghi nhận một mã thoát khác 0 chưa từng xảy ra.
