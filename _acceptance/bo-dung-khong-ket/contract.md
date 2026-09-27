---
schema_version: 1
feature: Bộ dựng tác nhân không còn kẹt im lặng — hạn mức phiên đủ cho model có suy nghĩ, câu hỏi «hết hạn mức» hiện trên màn với hai nút và trả lời được, trợ lý không gửi được khuôn kết quả vào bộ dựng nên không còn thành công giả
slug: bo-dung-khong-ket
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui, docs]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-27T11:29:17Z
design_doc: docs/superpowers/specs/2026-09-27-bo-dung-khong-ket-design.md
---

# Acceptance Contract: bo-dung-khong-ket

## Context

Ngày 27/09, chủ kho lái thử bộ dựng tác nhân trên production với Gemini 3.8 Flash, và
hội thoại đứng yên. Chạy lại trên máy, trong kho đo riêng, thấy hai lỗi:

- **Gemini:** bộ dựng dùng 23.589 trên hạn mức 10.000 token phần viết ra. eve đỗ phiên
  bằng câu hỏi loại `session-limit`, nhưng OneHub không ghi, không nhận câu trả lời, và
  không vẽ loại này.
- **GLM:** trợ lý gọi bộ dựng kèm `outputSchema` lạ. Bộ dựng điền số 0 mà không qua kiểm
  quyền hay chốt lưu bản nháp, và trợ lý báo «đã tạo» trong khi không có bản nháp.

Người dùng: người dựng tác nhân trong hội thoại dựng.

Source input:
- chẩn đoán 27/09 trong hội thoại;
- hai mẫu sự kiện thật:
  - `apps/agent/test/fixtures/session-limit-that.json`;
  - `apps/agent/test/fixtures/goi-bo-dung-kem-khuon-that.json`;
- thiết kế ở `design_doc`, chủ kho đồng ý bốn việc trong hội thoại.

## Criteria

- **AC-1:**
  - Given `apps/agent/agent/lib/dispatch-config.ts`.
  - When đọc `limits` của ba tác nhân (gốc, `agent_builder`, `agent_runner`) từ chính
    định nghĩa `defineAgent` của chúng.
  - Then:
    - bộ dựng có `maxInputTokensPerSession` 500.000 và `maxOutputTokensPerSession`
      128.000;
    - gốc giữ 500.000 / 50.000, bộ chạy giữ 500.000 / 40.000;
    - cả ba bằng đúng giá trị trong `SESSION_LIMITS`;
    - không `agent.ts` nào còn viết số hạn mức token ngay trong tệp.
- **AC-2:**
  - Given một hội thoại dựng có `sessionId`.
  - When kênh `crm` nhận `input.requested` chép từ lượt Gemini thật (loại
    `session-limit`).
  - Then `pendingInputRequest` của hội thoại mang:
    - loại `session-limit` và đúng `requestId` của mẫu;
    - hai lựa chọn `continue` và `stop`;
    - `allowFreeform` `false`.
  - Và `continuationToken` được đặt, có đúng một sự kiện `builder-input` được lưu.
  - Và:
    - câu hỏi loại `question` vẫn được lưu như trước;
    - sự kiện chỉ có `tool-approval` không đổi gì;
    - nhận lại cùng sự kiện lần hai cũng không đổi gì.
- **AC-3 (cross-layer):**
  - Given hội thoại dựng đang treo câu hỏi `session-limit` của AC-2.
  - When người dùng trả lời qua `conversations.answerBuilderQuestion` với `optionId`
    `continue`.
  - Then có đúng một bài nộp mang `inputResponse`
    `{ requestId, optionId: "continue", kind: "session-limit" }` và `inputRequestId` bằng
    `requestId`; `builderById` trả `pendingQuestion` loại `session-limit` trước khi trả
    lời; điều phối gửi bài nộp đó tới eve dưới dạng `inputResponses`. Điều tương tự đúng
    với `stop`.
  - When trả lời bằng chữ tự do, bằng một `optionId` không có, hay bằng `requestId` cũ.
  - Then API từ chối với đúng câu lỗi hiện có của từng ca, và không tạo bài nộp nào.
- **AC-4:**
  - Given màn hội thoại dựng mà luồng sự kiện có câu hỏi `session-limit` đang chờ.
  - When màn vẽ.
  - Then:
    - ô soạn tin được thay bằng câu tiếng Việt «Bộ dựng đã dùng hết hạn mức của phiên
      này. Cấp thêm để làm tiếp, hoặc dừng.»;
    - có hai nút «Cấp thêm» và «Dừng»;
    - câu tiếng Anh của eve không có trên màn.
  - When bấm «Cấp thêm» (hoặc «Dừng»).
  - Then màn gọi trả lời với đúng `requestId` và `optionId` `continue` (hoặc `stop`), và
    hai nút khoá trong lúc gửi.
  - Sau khi câu trả lời được nhận, hai nút biến mất, và bong bóng câu trả lời hiện
    «Cấp thêm» (hoặc «Dừng»), không hiện nhãn «Approve» / «Stop» của eve.
  - Và:
    - gửi lỗi thì hai nút mở lại để bấm lần nữa;
    - câu hỏi loại `question` vẫn hiện bằng ô trả lời cũ.
- **AC-5 (cross-layer):**
  - Given phiên dựng (purpose `builder`).
  - When móc `actions.requested` của gốc nhận lời gọi `agent_builder` chép từ lượt GLM thật
    (có `outputSchema`).
  - Then móc ném lỗi với câu hằng `BUILDER_OUTPUT_SCHEMA_MESSAGE`, và trạng thái ủy thác
    không ghi lời gọi đó.
  - Và:
    - cùng lời gọi bỏ `outputSchema` thì lọt;
    - `outputSchema: {}` cũng bị chặn;
    - lời gọi `subagent` khác kèm `outputSchema` không bị chốt này chặn;
    - phiên không phải dựng thì móc không làm gì.
  - Given một ứng dụng eve 0.29.4 thật, với model giả (`mockModel`) phát đúng lời gọi đó,
    và móc gọi chính `recordBuilderDelegation` của kho.
  - When gửi một lượt.
  - Then lượt kết thúc `turn.failed`, không có `subagent.called`, và không phiên con nào
    được tạo.
  - Chiều đỏ: móc không ném thì có `subagent.called`.
- **AC-6:**
  - Given nhánh này.
  - When đọc `docs/agent.md`.
  - Then mục «Team-agent builder and runner» nêu:
    - hạn mức bộ dựng 500k / 128k và chỗ khai `SESSION_LIMITS`;
    - câu hỏi «hết hạn mức» hiện trên màn với hai nút;
    - lời gọi bộ dựng kèm `outputSchema` làm hỏng lượt.
  - Và danh sách «Chỗ rẽ có tên với bản của hãng» có mọi tệp của hãng mà nhánh này sửa, so
    với `origin/release`.
  - Và bản `docs/agent.md` ở merge-base của `origin/onehub` không đạt các điều trên.

- **AC-7 (cross-layer):**
  - Given một ứng dụng eve 0.29.4 thật, gồm:
    - gốc có `subagent` mang hạn mức phần viết ra nhỏ;
    - model giả (`mockModel`) báo số token vượt hạn mức ở bước đầu của phiên con.
  - When gửi một lượt.
  - Then gốc nhận đúng một `input.requested` loại `session-limit`, với lựa chọn
    `continue` / `stop`, và phiên đỗ.
  - When trả lời gốc bằng `inputResponses` đúng khuôn mà
    `builderDeliveryMessage` của kho dựng từ bài nộp
    (`[{ requestId, optionId: "continue" }]`).
  - Then phiên con chạy thêm ít nhất một bước model, rồi `subagent.completed` về gốc
    với kết quả của bước đó.
  - When trả lời `stop`.
  - Then phiên con không chạy thêm bước model nào, gốc nhận kết quả lỗi của `subagent`,
    và lượt gốc kết thúc thay vì đỗ tiếp.

## Coverage

Không gian đủ nhỏ để kê trục bằng tay; ô và trục dưới đây là bảng quét.

- **Trục A · Loại câu hỏi eve gửi lên:** `question` | `session-limit` | `tool-approval`.
  [thước CE: `inputRequest.kind` trong `packages/validation/src/agents.ts`;
  `PROXY_INPUT_REQUEST_KINDS` của eve 0.29.4]
- **Trục B · Lớp mà câu hỏi đi qua:**
  - kênh ghi;
  - API nhận câu trả lời;
  - màn vẽ và gửi;
  - eve chạy tiếp.
- **Trục C · Câu trả lời:** `continue` | `stop` | chữ tự do | lựa chọn không có |
  `requestId` cũ.
- **Trục D · Lời gọi bộ dựng:**
  - có `outputSchema`;
  - `outputSchema` rỗng;
  - không `outputSchema`;
  - `subagent` khác;
  - phiên không phải dựng.
- **Trục E · Hạn mức:** gốc | bộ dựng | bộ chạy.
- **Ô → AC:**
  - E × ba vai → AC-1;
  - A × kênh ghi → AC-2;
  - C × API → AC-3;
  - `session-limit` và `question` × màn, và gửi lỗi → AC-4;
  - D → AC-5 (móc, và cả eve thật cho ô có `outputSchema`);
  - eve chạy tiếp × `continue` / `stop` → AC-7;
  - tài liệu → AC-6.
- **Ô gạch:** `tool-approval` × API và màn — bộ dựng không dùng công cụ cần duyệt; ngoài
  phạm vi.
- **[GIẢ ĐỊNH]** Ứng dụng eve thử của AC-5 và AC-7 dựng lại đúng quan hệ gốc → `subagent`
  của kho, với model giả. Nó không chạy bộ dựng thật, không chạy kênh `crm`.
  - Nửa «OneHub ghi và gửi đúng» đo ở AC-2, AC-3.
  - Nửa «eve nhận và chạy tiếp» đo ở AC-7.
  - Hai nửa nối nhau bằng khuôn `inputResponses` của `builderDeliveryMessage` thật, được
    import vào ứng dụng thử.

## Out of scope

- Câu hiển thị riêng cho lượt hỏng vì chốt `outputSchema`, và cho `RUNNER_FAILED` /
  `RUNNER_NO_RESULT`.
- Chỉnh mức suy nghĩ (`thinkingLevel` / `reasoning`) theo model.
- Gỡ hội thoại đã kẹt trước bản vá.
- Loại câu hỏi `tool-approval`.
- Bảo đảm bằng máy rằng lời văn của trợ lý không nói sai. Vòng này chỉ bảo đảm không có
  kết quả dựng giả; lời văn do chỉ dẫn điều khiển.
- Gửi bản vá lên hãng.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- **Chỉ dẫn gốc** (`apps/agent/agent/instructions/task.ts`) thêm hai câu:
  - «không truyền `outputSchema` cho `agent_builder`»;
  - «chỉ nói đã tạo khi có `draft_ready` kèm `versionId`».

  Không AC nào đo câu chữ của chỉ dẫn. Lưới là móc kiểm của AC-5.
- **Không `migration`.** `pendingInputRequest` là cột `Json` sẵn có; khuôn đọc mở rộng thêm
  một loại.
- **Đường nền 27/09 đỏ, không do kho** (`duong-nen.md`):
  - `build_khong_cache` đỏ vì `duong-nen.mjs` chạy qua `bash -lc`, rơi về Node 22, trong
    khi eve đòi Node 24.
  - `test.api` đỏ ở bốn ca `@crm/auth` hết trần 5 giây khi máy tải nặng.
  - «THIEU merge-base» là lỗi đã biết của kit.
