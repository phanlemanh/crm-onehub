# Quyền của lượt builder mang theo tường minh

Ngày 2026-09-08 · slug `quyen-luot-mang-theo` · hạng T2 · `apps/agent` + `apps/api`

## Vì sao có vòng này

Vòng `chan-uy-thac-sai-luot` đặt một cổng quyền ở tầng tool: lượt không mang
`commandType: CREATE_AGENT` thì policy `approval` từ chối trước khi tool chạy.
Cổng ấy đúng. Nhưng vòng chấm S4 của nó tìm ra cổng **bị vượt**, và tìm ra ở
vòng thứ ba chứ không phải vòng đầu — vì bộ đo lúc ấy ghi đè thẳng trường
`commandType` trong fixture nên không bao giờ đi qua chỗ hỏng.

Hai chỗ, một gốc:

```
apps/agent/agent/lib/custom-agent-dispatch.ts
    return requestId && (optionId || text) ? "CREATE_AGENT" : commandType;

apps/api/src/conversations/conversations.service.ts:584
    commandType: "CREATE_AGENT",
```

Nhánh CHAT của chỉ dẫn cha **bảo mô hình gọi `ask_question`** khi thiếu một
quyết định. Nên: chat thường → mô hình hỏi lại → người dùng bấm trả lời → lượt
kế được cấp quyền dựng agent. Đây không phải ngóc ngách; đó là đường mà chính
chỉ dẫn dẫn người dùng đi vào.

Gốc chung: **quyền đang được suy ra từ hình dạng tin nhắn, thay vì được cấp và
mang theo.** Một tin nhắn "có `inputResponse`" nói lên hình dạng của nó, không
nói lên ai đã cho phép điều gì.

## Nguyên tắc

Quyền là thứ **được cấp tại một thời điểm và mang theo từ đó**. Đây là nguyên
tắc của OAuth 2.0 (RFC 6749): bên nhận không đoán quyền từ hình dạng yêu cầu,
nó đọc một thứ đã được cấp tường minh. Áp vào đây: lượt **hỏi** là nơi quyền
tồn tại; câu **trả lời** kế thừa đúng quyền đó, không hơn.

## Thiết kế

### 1. Ghi quyền tại lúc hỏi

`persistBuilderInputRequest` (`agent/lib/builder-input.ts`) chạy từ hook
`input.requested` của `channels/crm.ts`, và hook ấy **đã có `ctx`**. Nên tại
đúng chỗ lưu câu hỏi, ghi kèm kết quả `builderTurnAuthorized(ctx)`.

Không cần migration: `pendingInputRequest` đã là cột `Json`.

### 2. Khuôn ấy sống ở `packages/validation/src`

Hai app cùng đọc cột này — agent ghi, API đọc. `AGENTS.md` nói rõ: một shape
crossing a package boundary sống ở `packages/validation/src`, một module một
shape, import theo subpath. Có schema Zod, `z.infer`, và **parse hỏng là lỗi
thật có thông điệp** — không nuốt thành rỗng.

### 3. Câu trả lời kế thừa đúng quyền đã ghi

`conversations.service.ts` thôi ghim cứng `CREATE_AGENT`. Nó đọc bản ghi và đặt
`commandType` theo đó. **Không có bản ghi ⇒ `CHAT`** — đóng, theo quyết định của
người ký ở S1.

Hệ quả người dùng, khai thẳng: ai đang dựng agent dở mà trả lời một câu hỏi đã
treo từ trước lúc deploy sẽ phải bấm Tạo tác nhân lại. Cửa sổ ấy chỉ kéo dài
đến khi các câu hỏi cũ trôi hết.

### 4. Xoá luật suy diễn

Vế `requestId && (optionId || text) ? "CREATE_AGENT"` trong `builderCommandType`
biến mất. Sau vòng này, **không chỗ nào trong kho suy quyền từ hình dạng tin
nhắn**.

### 5. Dạy con cửa ra, và viết lại hằng lý do cho đúng người đọc

`instructions.md` của `agent_builder` hiện đếm được **0** lần nhắc
`not_authorized`; cửa ra duy nhất nó biết là `draft_ready`. Thêm một đoạn: bị từ
chối thì gọi ngay `final_output` với `{ status: "not_authorized", reason }`.

Và `BUILDER_DENIED_REASON` đang là câu nói với **cha** — *"Tell the user… then
answer what they actually asked"* — trong khi eve giao nó cho **con**, vốn chạy
task mode, không có kênh người dùng, và phần lớn tool đã tắt. Viết lại cho con:
bảo nó trả `not_authorized` ngay. Việc nói với người dùng vẫn là của cha, và chỉ
dẫn cha đã có sẵn câu đó.

## Cách đo — và chỗ vòng trước hỏng nhất

**Mọi phép đo quyền phải đi qua hàm thật `builderCommandType` với một message có
`inputResponse`.** Cấm ghi đè thẳng trường `commandType` trong fixture. Chính vì
fixture cũ ghi đè trường mà lỗ này sống sót qua cả ba vòng chấm của vòng trước —
sáu phép đo xanh trong khi cổng vẫn mở.

Cặp hai chiều trên cùng fixture: lượt hỏi **được phép** → trả lời kế thừa
`CREATE_AGENT`; đổi đúng một trường sang lượt hỏi **không được phép** → trả lời
là `CHAT`. Ba hình dạng nguồn quyền — đủ · vắng · hỏng khuôn — kiểm cả ba.

## Files

| File | Việc |
| --- | --- |
| `packages/validation/src/builder-input-request.ts` (mới) | khuôn `pendingInputRequest` + quyền, parse ở biên |
| `apps/agent/agent/lib/builder-input.ts` | ghi quyền của lượt hỏi |
| `apps/agent/agent/lib/custom-agent-dispatch.ts` | xoá luật suy diễn |
| `apps/api/src/conversations/conversations.service.ts` | đọc bản ghi thay vì ghim cứng |
| `apps/agent/agent/subagents/agent_builder/instructions.md` | dạy con cửa ra |
| `apps/agent/agent/subagents/agent_builder/lib/authorization.ts` | hằng lý do viết cho con |
| `apps/agent/agent/subagents/agent_builder/agent.ts` | `outputSchema` — tại `9ec0251` đã nhận 2 status kể cả `not_authorized`; vòng này chỉ xác nhận không làm mất |
| `apps/agent/test/quyen-luot.spec.ts`, `apps/api/test/quyen-luot.spec.ts` (mới) | phép đo |
