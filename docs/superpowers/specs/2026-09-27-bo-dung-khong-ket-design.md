# Bộ dựng tác nhân không còn kẹt im lặng — thiết kế

Ngày 27/09. Hồ sơ nghiệm thu `_acceptance/bo-dung-khong-ket/`. Chủ kho đồng ý bốn việc
trong hội thoại cùng ngày.

## Vấn đề

Chủ kho lái thử trên production: yêu cầu «Tổng hợp contact mới hàng ngày» đứng yên sau
khi bộ dựng viết ba tệp. Chạy lại trên máy, với kho đo riêng, cho thấy hai lỗi độc lập.

**Gemini 3.8 Flash — kẹt ở câu hỏi không ai thấy.**

- Bộ dựng (`agent_builder`) có hạn mức 10.000 token cho phần model viết ra mỗi phiên, và
  100.000 cho phần gửi vào.
- Token «suy nghĩ» của Gemini tính vào phần viết ra. Sau khoảng 2,5 phút, lúc mới viết
  xong tệp chỉ dẫn, nó đã dùng 23.589.
- eve đỗ phiên con và đẩy lên phiên gốc một `input.requested` loại `session-limit`, với
  hai lựa chọn `continue` / `stop`. Mẫu thật lưu ở
  `apps/agent/test/fixtures/session-limit-that.json`.
- OneHub chỉ nhận loại `question`, ở cả ba lớp:
  - kênh `crm` không ghi yêu cầu vào `pendingInputRequest`;
  - API `answerBuilderQuestion` không nhận câu trả lời;
  - màn hội thoại không vẽ gì.
- Gõ «approve» vào ô chat được nhận nhưng không gỡ được phiên.

**GLM 5.2 Fast — thành công giả.**

- Người dùng chỉ hỏi (lệnh `CHAT`, không phải «Tạo tác nhân»). Trợ lý vẫn gọi
  `agent_builder` và gửi kèm `outputSchema` — khuôn kết quả của tác nhân đích.
- Công cụ `subagent` của eve nhận `{ message, outputSchema? }`. Khuôn do người gọi đưa
  thắng khuôn riêng của bộ dựng.
- Bộ dựng điền khuôn lạ toàn số 0 sau 164 token. Nó không đi qua bước kiểm quyền
  (`not_authorized`), cũng không qua chốt «phải lưu bản nháp trước khi trả
  `draft_ready`».
- Trợ lý báo «đã tạo và xác thực thành công», trong khi không có tệp, không có bản nháp.
- Mẫu lời gọi thật lưu ở `apps/agent/test/fixtures/goi-bo-dung-kem-khuon-that.json`.

## Mục tiêu

1. Một lần dựng bình thường không chạm hạn mức với model có suy nghĩ.
2. Khi phiên vẫn chạm hạn mức, người dùng thấy câu hỏi và trả lời được bằng một bấm.
3. Không đường nào để bộ dựng trả kết quả thành công mà không có bản nháp đã lưu.

## Cách làm

### 1. Hạn mức phiên đi vào một chỗ cấu hình

- `apps/agent/agent/lib/dispatch-config.ts` thêm `SESSION_LIMITS`, nhóm theo vai, đơn vị
  suy từ một hằng `THOUSAND_TOKENS`.
- Ba tác nhân (gốc, bộ dựng, bộ chạy) đọc hạn mức từ đó, thay cho số viết ngay trong
  `agent.ts`. Giá trị gốc và bộ chạy giữ nguyên: 500k vào / 50k ra, và 500k / 40k.
- Bộ dựng lên 500k vào / 128k ra; `sessionTimeoutMs` giữ 24 giờ.
- Vì sao 128k: một lần dựng Gemini ước cần 40–60k, vậy 128k có dư mà vẫn là cầu dao.
  Vòng lặp lưu hay viết tệp đã bị chặn riêng bởi ngân sách 12 lời gọi công cụ và 2 lần
  lưu trong `execution-state.ts`, nên cầu dao token không còn là lưới chính.

### 2. Câu hỏi «hết hạn mức» đi hết ba lớp

**Khuôn dùng chung** — `packages/validation/src/builder-question.ts`:

- `askedQuestion` nhận thêm loại `session-limit`, với `allowFreeform` luôn `false`.
- Hàm `buildPendingInputRequest` nhận cả hai loại.
- Một khuôn, hai loại. Không thêm cột, không `migration`.

**Kênh `crm`** — `apps/agent/agent/lib/builder-input.ts`:

- `persistBuilderInputRequest` chọn yêu cầu đầu tiên có loại `question` hoặc
  `session-limit`, và ghi vào `pendingInputRequest` như câu hỏi.
- `tool-approval` vẫn bỏ qua; ngoài phạm vi, bộ dựng không dùng.

**API** — `answerBuilderQuestion`:

- Không đổi luật. Câu hỏi `session-limit` có hai lựa chọn và không nhận chữ tự do, nên API
  chỉ nhận `optionId` `continue` hoặc `stop`.
- Bài nộp mang `inputResponse` như câu hỏi thường. Điều phối gửi nó vào eve, và eve
  chuyển xuống phiên con qua bảng `proxyInputRequests`, giống câu hỏi của bộ dựng hôm
  nay.

**Màn hội thoại** — `apps/app`:

- `pendingQuestion` và `conversationTimeline` nhận thêm `session-limit`.
- Ô soạn tin thay bằng khối mới `AgentSessionLimitComposer`:
  - một câu tiếng Việt lấy từ `apps/app/lib/messages`;
  - hai nút `Button` của `@crm/ui`: «Cấp thêm» (`primary`) và «Dừng» (`outline`).
- Câu tiếng Anh của eve không hiện ra.
- Bấm một nút gọi `answerBuilderQuestion` với `optionId` tương ứng. Bong bóng câu trả lời
  hiện nhãn tiếng Việt theo `optionId`, không theo nhãn «Approve» của eve.
- Bậc thiết kế (`docs/design.md`, «Vẽ tay là bậc cuối»): dừng ở bậc 1.
  - Đã xét `Questionnaire`. Nó cần chọn rồi bấm Gửi — hai thao tác — trong khi đây là
    một quyết định có hai nút.
  - Khối mới ghép `Button` và khung `AGENT_COMPOSER_CLASS_NAME` có sẵn. Không `className`
    đổi màu, góc hay khoảng cách.

### 3. Trợ lý không được gửi khuôn kết quả cho bộ dựng

**Móc kiểm.** `apps/agent/agent/lib/builder-delegation.ts` thêm một chốt vào
`recordBuilderDelegation`, chạy trong móc `actions.requested` sẵn có của phiên dựng:

- lời gọi `subagent-call` tới `agent_builder` mà `input.outputSchema` có mặt (kể cả
  `{}`) thì ném lỗi với câu hằng
  `BUILDER_OUTPUT_SCHEMA_MESSAGE = "Call agent_builder with message only; it returns its own result."`.
- eve biến lỗi ném trong móc thành `turn.failed`. Kênh `crm` đã xử lý `turn.failed` cho
  hội thoại dựng: trả `continuationToken`, xoá câu hỏi treo, và màn hiện lỗi lượt.

Vì sao chặn cứng mà không lọc:

- Móc của eve chỉ quan sát, không sửa được đầu vào.
- Công cụ `subagent` là khuôn cố định của eve, không tắt được riêng ô `outputSchema`.
- Lượt hỏng hiện rõ vẫn tốt hơn thành công giả.

**Chỉ dẫn.** `apps/agent/agent/instructions/task.ts`, ở cả hai nhánh `CREATE_AGENT` và
`CHAT`:

- «Không bao giờ truyền `outputSchema` cho `agent_builder`»;
- «Chỉ nói tác nhân đã được tạo khi `agent_builder` trả `draft_ready` có `versionId`».

Như vậy lời gọi sai trở thành hiếm; móc kiểm là lưới.

**Kết quả:** kết quả thành công duy nhất bộ dựng trả được là khuôn riêng của nó, và
`draft_ready` đòi bản nháp đã lưu (chốt có sẵn trong `execution-state.ts`). Ở lệnh `CHAT`,
bộ dựng trả `not_authorized` như thiết kế gốc.

### 4. Tài liệu

`docs/agent.md`:

- mục «Team-agent builder and runner» nêu hạn mức mới, câu hỏi «hết hạn mức» và chốt
  `outputSchema`;
- danh sách «Chỗ rẽ có tên với bản của hãng» thêm các tệp của hãng mà vòng này sửa.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: người dùng gửi yêu cầu dựng → bộ dựng chạm hạn mức → ô soạn tin đổi thành
  câu hỏi hai nút → bấm «Cấp thêm» → bộ dựng chạy tiếp tới bản nháp (điểm ra: thẻ bản
  nháp như hôm nay).
- Biên: bấm «Dừng» → bộ dựng dừng, trợ lý báo chưa dựng xong, ô soạn tin trở lại.
- Lỗi & quay lại: gửi câu trả lời lỗi → thông báo lỗi (toast) như câu hỏi làm rõ, hai
  nút mở lại để bấm lần nữa.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hội thoại dựng | cho người dùng quyết cấp thêm hạn mức hay dừng | từ lượt dựng đang chạy / về lượt dựng tiếp hoặc ô soạn tin |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hoithoaidung-dangdung | Hội thoại dựng | thẻ tiến độ dựng, ô soạn tin khoá | chờ |
| ST-hoithoaidung-hethanmuc | Hội thoại dựng | «Bộ dựng đã dùng hết hạn mức của phiên này. Cấp thêm để làm tiếp, hoặc dừng.» + nút «Cấp thêm» (chính) và «Dừng» | bấm một nút |
| ST-hoithoaidung-dangguitraloi | Hội thoại dựng | hai nút khoá, nút vừa bấm hiện đang chờ | chờ |
| ST-hoithoaidung-guiloi | Hội thoại dựng | toast lỗi, hai nút mở lại | bấm lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Hai nút là `button` thật, đi được bằng Tab, bấm được bằng Enter/Space; ở khổ 375
  hai nút không tràn lề.
- Không có ô nhập chữ trong trạng thái hết hạn mức.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Button` (`@crm/ui`) | dùng | hai hành động, một chính một phụ |
| khung `AGENT_COMPOSER_CLASS_NAME` | dùng | giữ chỗ và khung của ô soạn tin |
| `AgentSessionLimitComposer` | ghép | câu + hai nút; `Questionnaire` cần chọn rồi Gửi — hai thao tác cho một quyết định |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại
Căn cứ: câu hỏi thay chỗ ô soạn tin trong hội thoại sẵn có, như câu hỏi làm rõ của bộ
dựng hôm nay; luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Phạm vi loại ra

- Câu hiển thị cho `RUNNER_FAILED` / `RUNNER_NO_RESULT` (nợ Ngoài-1 của vòng trước).
- Câu hiển thị riêng cho lượt hỏng vì chốt `outputSchema` — màn dùng câu lỗi lượt chung.
- Chỉnh `thinkingLevel` / `reasoning` theo model.
- Gỡ hội thoại đã kẹt trước bản vá. Hội thoại đó không có `pendingInputRequest`; người
  dùng mở hội thoại mới.
- Loại `tool-approval`.
- Gửi bản vá lên hãng — chủ kho đã chọn không gửi.

## Kiểm chứng

- Phép đo dùng hai mẫu thật đã lưu, không mẫu gõ tay:
  - lưu câu hỏi «hết hạn mức» → kho;
  - trả lời qua API → bài nộp mang `inputResponse` đúng;
  - màn vẽ câu tiếng Việt và hai nút, bấm gửi đúng `optionId`;
  - móc kiểm chặn lời gọi GLM thật.
- Một phép đo mắt thấy (`ui-check`) chụp màn hội thoại dựng ở trạng thái «hết hạn mức»
  trên app thật, với sự kiện thật gieo vào kho đo.
