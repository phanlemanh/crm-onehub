# Bộ dựng không kẹt im lặng — kế hoạch làm

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Bộ dựng không còn kẹt khi hết hạn mức, và không còn trả được kết quả thành
công mà không có bản nháp.

**Architecture:**

- Hạn mức phiên của ba tác nhân vào một chỗ cấu hình.
- Câu hỏi `session-limit` của eve đi qua đúng ba lớp đang chở câu hỏi làm rõ: kênh ghi,
  API trả và nhận, màn vẽ.
- Móc `actions.requested` của gốc chặn lời gọi bộ dựng kèm `outputSchema`.
- Một ứng dụng eve thử, dùng model giả, chứng hành vi của eve mà code kho dựa vào.

**Tech Stack:** eve 0.29.4, Bun test, Prisma, NestJS tRPC, Next.js, zod.

**Spec:** `docs/superpowers/specs/2026-09-27-bo-dung-khong-ket-design.md` ·
`_acceptance/bo-dung-khong-ket/contract.md` · `_acceptance/bo-dung-khong-ket/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (`AGENTS.md`).
- Hằng tinh chỉnh được nằm ở `apps/agent/agent/lib/dispatch-config.ts`, đơn vị suy từ một
  hằng gốc.
- Giao diện chỉ dùng thành phần `@crm/ui`, không `className` đổi màu, góc, khoảng cách.
- Chữ trên màn đi qua `apps/app/lib/messages/*`, có cả `en` và `vi`. Hàm ghép chữ nhận
  đối số vô hướng.
- Tiến trình chạy nền dùng Node 24:
  `export PATH=$HOME/.local/share/fnm/node-versions/v24.15.0/installation/bin:$PATH`.
- Bộ chứng: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`,
  `bun run build`.
- Mỗi phép đo mới có cặp hai chiều trên cùng một mẫu thử. Lượt phá-thử phải commit
  trước, rồi mới `git checkout` để trả lại.

## Review Focus

1. Câu hỏi `session-limit` tới khi hội thoại chưa có `sessionId`. Kênh phải trả `false`
   như câu hỏi thường (T2).
2. Người bấm hai lần liền, hoặc bấm khi câu trả lời trước còn chờ. Hai nút phải khoá
   trong lúc gửi, và API trả bài nộp cũ nhờ `clientRequestId` (T4).
3. `outputSchema` rỗng `{}`. Vẫn phải bị chặn — GLM có thể gửi khuôn rỗng (T5).
4. Câu hỏi `session-limit` tới trong khi hội thoại còn treo một câu hỏi cũ. Luật
   `supersedes` hiện có quyết định; câu mới hơn thắng (T2).
5. Khổ 375: hai nút không tràn (T4 và phép đo E6).

---

### Task 1: Hạn mức phiên vào một chỗ — phục vụ E1 · independent: true

**Files:**
- Modify: `apps/agent/agent/lib/dispatch-config.ts`,
  `apps/agent/agent/agent.ts`,
  `apps/agent/agent/subagents/agent_builder/agent.ts`,
  `apps/agent/agent/subagents/agent_runner/agent.ts`
- Test: `apps/agent/test/han-muc-phien.spec.ts`

**Interfaces — produces:** `SESSION_LIMITS.{root,builder,runner}`, mỗi ô mang
`{ maxInputTokensPerSession, maxOutputTokensPerSession, sessionTimeoutMs }`.

- [ ] Viết test trước (`describe("han-muc")`):
  - import default ba `agent.ts` và `SESSION_LIMITS`;
  - sáu assert giá trị (500000/128000, 500000/50000, 500000/40000), mỗi vai `toEqual`
    ô của nó trong `SESSION_LIMITS`;
  - `sessionTimeoutMs`: bộ dựng và bộ chạy 24 giờ, gốc 30 ngày;
  - hàm `soHanMucViet(nguon, ten)`, regex `/TokensPerSession:\s*\d/`, quét ba tệp lấy
    bằng `Bun.Glob`, danh sách vi phạm `toEqual([])`; đối chứng âm với chuỗi mẫu.
- [ ] Chạy thấy đỏ: `SESSION_LIMITS` chưa có.
- [ ] Viết mã:
  ```ts
  const THOUSAND_TOKENS = 1_000;
  const HOUR_MS = 60 * MINUTE_MS;
  const DAY_MS = 24 * HOUR_MS;
  export const SESSION_LIMITS = {
    root: { maxInputTokensPerSession: 500 * THOUSAND_TOKENS, maxOutputTokensPerSession: 50 * THOUSAND_TOKENS, sessionTimeoutMs: 30 * DAY_MS },
    builder: { maxInputTokensPerSession: 500 * THOUSAND_TOKENS, maxOutputTokensPerSession: 128 * THOUSAND_TOKENS, sessionTimeoutMs: DAY_MS },
    runner: { maxInputTokensPerSession: 500 * THOUSAND_TOKENS, maxOutputTokensPerSession: 40 * THOUSAND_TOKENS, sessionTimeoutMs: DAY_MS },
  } as const;
  ```
  Ba `agent.ts` đổi thành `limits: SESSION_LIMITS.<vai>`.
- [ ] Chạy xanh:
  `bun run test -- "cd apps/agent && bun test test/han-muc-phien.spec.ts -t han-muc"`.
- [ ] Phá-thử: commit, sửa bộ dựng về `10 * THOUSAND_TOKENS`, thấy đỏ với thông điệp có
  «agent_builder maxOutputTokensPerSession», rồi `git checkout` tệp.
- [ ] Commit.

### Task 2: Khuôn chung và kênh ghi câu hỏi `session-limit` — phục vụ E2, E4 · independent: false

**Files:**
- Modify:
  - `packages/validation/src/builder-question.ts`;
  - `apps/agent/agent/lib/builder-input.ts`;
  - `apps/api/src/conversations/conversations.contracts.ts` (`builderQuestionOutput.kind`
    đổi thành enum);
  - `apps/api/src/conversations/conversations.service.ts` (`answerBuilderQuestion` ghi
    `kind` vào `inputResponse` khi loại là `session-limit`).
- Test: `apps/agent/test/cau-hoi-het-han-muc.integration.spec.ts`

**Interfaces — produces:**
- `BuilderQuestion.kind: "question" | "session-limit"`;
- `buildPendingInputRequest` nhận cả hai loại;
- `SESSION_LIMIT_OPTION_IDS = { continue: "continue", stop: "stop" } as const`, xuất từ
  `@crm/validation/builder-question`.

- [ ] Viết test trước:
  - `describe("luu-cau-hoi")`: đọc mẫu `fixtures/session-limit-that.json`; ma trận ba
    loại; phát lại lần hai; kiểm hội thoại chưa có `sessionId`.
  - `describe("dieu-phoi")`: tạo bài nộp mang
    `{ text: "Approve", inputResponse: { requestId, optionId, kind: "session-limit" } }`,
    đặt `continuationToken`, gọi `dispatchBuilderSubmission(id, send giả)`; ma trận
    `continue` / `stop`.
- [ ] Chạy thấy đỏ: kênh trả `false` với `session-limit`.
- [ ] Viết mã:
  - `askedQuestion`: `kind: z.enum(["question", "session-limit"])`; nếu loại là
    `session-limit` thì `allowFreeform: false`.
  - `builder-input.ts`: chọn bằng
    `request.kind === "question" || request.kind === "session-limit"`.
- [ ] Chạy xanh cả hai `describe`, và cả `builder-runtime.integration.spec.ts`.
- [ ] Phá-thử: bỏ `session-limit` khỏi bộ lọc, thấy đỏ với «session-limit khong duoc
  luu»; bỏ `inputResponses` trong `builderDeliveryMessage`, thấy đỏ với «inputResponses».
- [ ] Commit.

### Task 3: API trả và nhận câu trả lời — phục vụ E3 · independent: false (cần T2)

**Files:**
- Test: `apps/api/test/tra-loi-het-han-muc.spec.ts`, theo mẫu
  `apps/api/test/conversations.spec.ts`.

- [ ] Viết test `describe("tra-loi")`:
  - gieo `pendingInputRequest` bằng `buildPendingInputRequest(mẫu thật, true)`;
  - `builderById` trả `pendingQuestion` loại `session-limit`;
  - ma trận năm ô: `continue`, `stop`, chữ tự do, lựa chọn không có, `requestId` cũ;
  - đối chứng: câu hỏi `question` có `allowFreeform` vẫn nhận chữ.
- [ ] Chạy:
  `bun run test -- "cd apps/api && bun test test/tra-loi-het-han-muc.spec.ts -t tra-loi"`.
  Nếu đỏ ở `kind` thì sửa chỗ ghi `inputResponse` trong `answerBuilderQuestion`:
  ```ts
  const inputResponse = input.optionId
    ? { requestId: input.requestId, optionId: input.optionId, ...(question.kind === "session-limit" ? { kind: question.kind } : {}) }
    : { requestId: input.requestId, text: input.text };
  ```
- [ ] Commit.

### Task 4: Màn — khối hai nút và bong bóng tiếng Việt — phục vụ E5, E6, E7 · independent: false (cần T2)

**Files:**
- Create: `apps/app/components/agent-session-limit-composer.tsx`
- Modify:
  - `apps/app/lib/messages/agent-builder-o-soan.ts`, thêm khối `hetHanMuc`:
    - `en`: `cau` «The builder used up this session's budget. Grant more to keep going,
      or stop.», `capThem` «Grant more», `dung` «Stop»;
    - `vi`: `cau` «Bộ dựng đã dùng hết hạn mức của phiên này. Cấp thêm để làm tiếp,
      hoặc dừng.», `capThem` «Cấp thêm», `dung` «Dừng».
  - `apps/app/components/agent-builder/agent-builder-chat.tsx`:
    - `question.kind === "session-limit"` → vẽ `AgentSessionLimitComposer`;
    - `builderMessage.inputResponse` đọc thêm `optionId` và `kind`;
    - bong bóng hiện `capThem` / `dung` khi `kind` là `session-limit`.
- Test: `apps/app/test/het-han-muc.dom.tsx`

**Interfaces — consumes:** `BuilderQuestion`, `SESSION_LIMIT_OPTION_IDS` (T2).

- [ ] Viết test DOM trước, theo `evals.yaml` E5. Đầu vào đi qua `buildPendingInputRequest`
  rồi `builderQuestion.parse`.
- [ ] Viết khối:
  ```tsx
  "use client";
  export function AgentSessionLimitComposer({ requestId, pending, onAnswer }: {
    requestId: string; pending: boolean;
    onAnswer: (response: { requestId: string; optionId: string }) => Promise<void>;
  }) {
    const t = oSoanMessages(useLocale()).hetHanMuc;
    const [dangGui, setDangGui] = useState<string | null>(null);
    const tra = async (optionId: string) => {
      setDangGui(optionId);
      try { await onAnswer({ requestId, optionId }); } catch { setDangGui(null); }
    };
    const khoa = pending || dangGui !== null;
    return (
      <div className={AGENT_COMPOSER_CLASS_NAME}>
        <p>{t.cau}</p>
        <div><Button disabled={khoa} onClick={() => tra(SESSION_LIMIT_OPTION_IDS.continue)}>{t.capThem}</Button>
        <Button variant="outline" disabled={khoa} onClick={() => tra(SESSION_LIMIT_OPTION_IDS.stop)}>{t.dung}</Button></div>
      </div>
    );
  }
  ```
  Bố cục bên trong dùng thành phần `@crm/ui` có sẵn cho hàng nút, tra ở bậc 1 trước khi
  viết. Tên hàm messages theo tệp thật.
- [ ] Chạy xanh: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/het-han-muc.dom.tsx`.
- [ ] Chạy thước E7: `design-gate --mode static` trên tệp mới, mã 0.
- [ ] Phá-thử: màn bỏ nhánh `session-limit`, thấy đỏ với «session-limit».
- [ ] Commit.

### Task 5: Chặn `outputSchema` ở móc gốc — phục vụ E8 · independent: true

**Files:**
- Modify: `apps/agent/agent/lib/builder-delegation.ts`,
  `apps/agent/agent/instructions/task.ts`
- Test: `apps/agent/test/chan-khuon-bo-dung.spec.ts`

**Interfaces — produces:** `BUILDER_OUTPUT_SCHEMA_MESSAGE`.

- [ ] Viết test `describe("chan-khuon")`: năm ô của E8, qua `layHook()` và `datSlot()`;
  lấy lời gọi từ mẫu `goi-bo-dung-kem-khuon-that.json`.
- [ ] Viết mã trong `recordBuilderDelegation`, trước khi lọc `moi`:
  ```ts
  export const BUILDER_OUTPUT_SCHEMA_MESSAGE = "Call agent_builder with message only; it returns its own result.";
  const kemKhuon = actions.some((action) => action.kind === "subagent-call" && action.subagentName === BUILDER_DELEGATION_SUBAGENT && "outputSchema" in action.input);
  if (kemKhuon) throw new Error(BUILDER_OUTPUT_SCHEMA_MESSAGE);
  ```
  `action.input` lấy theo kiểu `HookEvent` thật; dùng chốt kiểu, không ép kiểu.
- [ ] Chỉ dẫn: thêm vào cả hai nhánh của `builderTaskMarkdown`:
  - «Never pass outputSchema to agent_builder.»;
  - nhánh `CREATE_AGENT` thêm «Say the agent was created only when agent_builder returned
    draft_ready with a versionId.»
- [ ] Chạy xanh `chan-khuon`, `tran-uy-thac.spec.ts`, `custom-agent-runtime.spec.ts`,
  `chan-uy-thac.spec.ts`, `quyen-luot.spec.ts`. Chỉ dẫn đổi câu, nên test nào ghim nguyên
  văn chỉ dẫn thì sửa ghim theo câu mới.
- [ ] Phá-thử: bỏ chốt, thấy ô (1) đỏ với «outputSchema».
- [ ] Commit.

### Task 6: Ứng dụng eve thử — phục vụ E10, E11 · independent: true

**Files:**
- Create: `apps/agent/test/eve-tran/`:
  - `package.json` (tên riêng, `private`);
  - `agent/agent.ts`;
  - `agent/hooks/chan-khuon.ts`;
  - `agent/subagents/agent_builder/agent.ts`;
  - `agent/subagents/bo_dung_thu/agent.ts`;
  - `evals/evals.config.ts`;
  - `evals/chan-khuon/co-khuon.eval.ts`;
  - `evals/chan-khuon/khong-khuon.eval.ts`;
  - `evals/chay-tiep/tiep.eval.ts`;
  - `evals/chay-tiep/dung.eval.ts`.
- Modify (nếu cần): tách `builderDeliveryMessage` ra
  `apps/agent/agent/lib/builder-delivery.ts`, để import được mà không kéo theo
  `@crm/db`. `custom-agent-dispatch.ts` xuất lại từ đó.

**Interfaces — consumes:** `recordBuilderDelegation`, `BUILDER_OUTPUT_SCHEMA_MESSAGE` (T5),
`builderDeliveryMessage`.

- [ ] Đọc `eve/docs/evals/*` và `eve/docs/subagents.mdx`.
- [ ] Gốc: `mockModel` chọn kịch bản theo `lastUserMessage`:
  - «co-khuon» → phát lời gọi `agent_builder` với `input` của mẫu GLM;
  - «khong-khuon» → cùng lời gọi, bỏ `outputSchema`;
  - «tiep» / «dung» → gọi `bo_dung_thu`.
  - Sau khi có `toolResults` thì trả chữ.
- [ ] Móc `chan-khuon`: gọi `recordBuilderDelegation(trạng thái cục bộ, event.data)`.
- [ ] `bo_dung_thu`: `limits.maxOutputTokensPerSession: 100`, `mockModel` trả `usage`
  outputTokens 500 ở bước đầu và đếm bước qua `toolResults`. `tiep.eval.ts`:
  - `requireInputRequest` loại `session-limit`;
  - gửi `inputResponses` lấy từ
    `builderDeliveryMessage("s", { text: "Approve", inputResponse: { requestId, optionId: "continue" } })`;
  - assert có `subagent.completed`, và kết quả mang dấu bước thứ hai.
- [ ] Chạy (Node 24): `cd apps/agent/test/eve-tran && ../../node_modules/.bin/eve eval chan-khuon`
  và `… eve eval chay-tiep`.
  - Nếu CLI đòi cấu hình khác, sửa ứng dụng thử chứ không sửa lệnh trong
    `config.yaml`.
  - Nếu phải đổi lệnh, sửa `config.yaml` rồi ghi một dòng sổ quyết định `fix`.
- [ ] Phá-thử:
  - móc không ném → `co-khuon` đỏ vì thấy `subagent.called`;
  - trả lời bằng `requestId` sai → `tiep` đỏ với «khong chay tiep».
- [ ] Kiểm `bun run check-types` và `bun run lint` không quét lỗi vào `eve-tran`. Nếu
  quét, khai thư mục như các thư mục test khác.
- [ ] Commit.

### Task 7: Tài liệu, thước tài liệu, script gieo — phục vụ E6, E9 · independent: false (sau T1–T6)

**Files:**
- Modify: `docs/agent.md`
- Create: `_acceptance/bo-dung-khong-ket/rang/tai-lieu.mjs`,
  `_acceptance/bo-dung-khong-ket/rang/gieo-het-han-muc.ts`

- [ ] `docs/agent.md`, mục «Team-agent builder and runner»:
  - hạn mức 500k / 128k và chỗ khai `SESSION_LIMITS`;
  - câu hỏi `session-limit` hiện hai nút;
  - lời gọi kèm `outputSchema` làm hỏng lượt.

  Mục «Chỗ rẽ có tên»: thêm các tệp của hãng mà nhánh sửa (so bằng
  `git diff --name-only origin/release...HEAD`, lọc tệp tồn tại ở `origin/release`).
- [ ] `tai-lieu.mjs` theo E9, đường dẫn suy từ vị trí script. Chạy thấy xanh ở `HEAD`,
  và thấy bản ở merge-base trượt.
- [ ] `gieo-het-han-muc.ts`:
  - tạo người dùng? Không — dùng người của `dev:session`, tìm theo email ở đối số;
  - tạo hội thoại `BUILDER` có `sessionId`;
  - gọi `persistBuilderInputRequest(mẫu.data, builderToken(id), id, true)`;
  - in đường dẫn `/<slug>/chat/<id>`.
- [ ] Lái thật một lần, theo các bước của E6, trong phiên đo, để chắc script và màn
  chạy. Ảnh để S4 chụp.
- [ ] Bộ chứng đủ năm lệnh (Node 24).
- [ ] Commit.
