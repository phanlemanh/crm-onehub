## Trong hợp đồng

- **Sàn dân số lọc theo chính thuộc tính đang assert — chỉ bắt chiều gỡ, mù chiều thêm (tuyên quét lớp nhưng đo điểm-case)**
  file: `apps/agent/test/chan-uy-thac.spec.ts:123`
  severity: medium
  AC: AC-3
  source: measurement
  detail: AC-3/E3 tuyên "Chốt phủ mọi cửa vào" của agent_builder và cài một sàn dân số đọc đĩa. Nhưng bộ lọc đĩa là `.filter((f) => boDongImport(readFileSync(join(TOOL_DIR, f), "utf8")).includes("requireBuilderAttribute("))` — nó chỉ giữ lại đúng những file ĐÃ có cái guard đang được assert, rồi so bằng `expect(trenDia).toEqual([...TOOLS_GHIM].sort())`. Hệ quả: dân số của phép đo không bao giờ là dân số của lớp. Thư mục `apps/agent/agent/subagents/agent_builder/tools/` hiện có 11 file; chỉ 3 file (inspect_context, write_agent_file, save_agent_draft) khai `builderTurnApproval`. Tám file còn lại hôm nay vô hại vì đều là `export default disableTool()`, nhưng phép đo không hề đọc điều đó — nó không phân biệt "tool bị tắt" với "tool đang bật mà quên guard". Thêm một tool builder thật vào thư mục mà quên cả `builderTurnApproval` lẫn `requireBuilderAttribute`: bộ lọc bỏ qua nó, `trenDia` vẫn đúng 3 tên, `TOOLS_GHIM` vẫn 3, ba assert trong vòng lặp vẫn xanh — một cửa vào hở hoàn toàn đi qua cổng không ai thấy. Dân số đúng cho lời hứa "mọi cửa vào" phải là "mọi file trong TOOL_DIR không phải disableTool()", rồi đòi từng file đó khai policy; dân số hiện tại là tập con tự-khớp.
  rationale: Đúng nguyên văn sàn dân số của AC-3: bộ lọc đĩa tự khớp theo thuộc tính đang assert nên 'mọi cửa vào' không còn được đo như một dân số thật.

- **Fixture viết tay đúng khuôn bên đọc — không round-trip qua writer `buildPendingInputRequest`**
  file: `apps/agent/test/custom-agent-runtime.spec.ts:75`
  severity: medium
  AC: AC-1
  source: measurement
  detail: Bài đo tên là "keeps clarification answers in agent-creation mode, now from the recorded grant", tức lời hứa là quyền đọc ra ĐÚNG cái mà đường ghi đã ghi. Nhưng cả hai chiều đều dựng bằng object literal viết tay ngay tại chỗ: `commandTypeFromAuthorization({ kind: "question", requestId: "question-1", prompt: "Which one", options: [], [BUILDER_AUTHORIZATION_KEY]: true })` (dòng 75-82) và bản `false` (dòng 84-91). Hàm ghi duy nhất sinh ra bản ghi ấy — `buildPendingInputRequest` trong packages/validation/src/builder-question.ts, chính là hàm mà apps/agent/agent/lib/builder-input.ts gọi khi lưu `pendingInputRequest` — không hề được import trong file này. Nên phép đo chỉ chứng minh reader đọc lại đúng cái literal mà chính bài đo vừa viết ra theo khuôn của reader: nếu writer đặt cờ dưới khuôn khác (bọc lồng, ghi chuỗi "true", hoặc bỏ trường khi authorized=true) thì cặp assert này vẫn xanh cả hai chiều, trong khi "grant đã ghi" thực tế không đọc được. Không có bài đo nào 'recorded' cái gì ở đây — không có DB, không có writer.
  rationale: Đúng nguyên văn sàn khuôn fixture của AC-1: fixture tự dựng đúng khuôn bên đọc thay vì round-trip qua đường runtime ghi.

- **Cặp hai chiều dựng bằng cách ghi đè trường quyền bằng tay; tham số `authorized` của writer bị ghim cứng `false`**
  file: `apps/api/test/quyen-luot.spec.ts:10`
  severity: low
  AC: AC-1
  source: measurement
  detail: Helper `cauHoi` gọi `buildPendingInputRequest(question, false)` với đối số `authorized` ghim cứng `false` (dòng 11-19), rồi spread `...over` lên trên. Cả hai chiều của cặp đối chứng đều được tạo bằng cách ghi đè trường bằng tay chứ không phải bằng cách hỏi writer: `cauHoi({ [BUILDER_AUTHORIZATION_KEY]: true })` -> kỳ vọng CREATE_AGENT (dòng 27), `cauHoi({ [BUILDER_AUTHORIZATION_KEY]: false })` -> kỳ vọng CHAT (dòng 32). Vì `authorized` không bao giờ nhận `true`, nhánh ghi "lượt được phép" của `buildPendingInputRequest` không được chạy lần nào trong file này. Nếu writer sai đúng ở nhánh đó (ví dụ luôn ghi `false`, hoặc ghi cờ dưới key khác khi authorized), cả hai assert vẫn xanh — phép đo chỉ đang đo `commandTypeFromAuthorization` đọc lại field mà bài đo tự dán vào. Ghi chú kèm: E4 khai paths là `apps/api/src/conversations/conversations.service.ts` nhưng file này không import service; chiều hai-chiều chạm service thật nằm ở apps/api/test/conversations.spec.ts.
  rationale: Cùng vi phạm sàn khuôn fixture của AC-1: authorized bị ghim cứng false nên nhánh ghi hợp lệ của writer chưa từng chạy, cặp đối chứng chỉ đọc lại field tự gán tay.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Stray probe script committed into apps/agent, outside every gate, importing an undeclared dependency**
  Người dùng thấy gì: Một đoạn mã thử nghiệm còn sót lại trong sản phẩm có thể tự động gọi mô hình AI tốn phí mà không ai chủ đích dùng đến, mỗi khi hệ thống được dựng lại.
  file: `apps/agent/thu-schema-that.ts`
  severity: high
  Đề xuất: known-limits

- **The pendingInputRequest Json column is written by spread and read back by two partial schemas — no module owns the stored shape**
  Người dùng thấy gì: Khi một cuộc hỏi-đáp bị lưu sai định dạng, hệ thống có thể âm thầm coi đó là một tin nhắn trò chuyện bình thường thay vì báo lỗi, khiến người dùng không biết vì sao yêu cầu dựng tác nhân của họ không được ghi nhận.
  file: `packages/validation/src/builder-question.ts`
  severity: medium
  Đề xuất: new-contract

- **The anti-inference guard test scopes out apps/app, where authorization is still derived from message text and sent by the client**
  Người dùng thấy gì: Ở màn hình soạn tin nhắn, hệ thống vẫn có thể tự đoán ý định tạo tác nhân từ nội dung gõ vào thay vì chỉ tin vào việc bấm đúng nút, nên một câu hỏi bình thường đôi khi có thể bị hiểu nhầm thành yêu cầu dựng tác nhân.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/6 lỗi rơi vào file không bộ đo nào phủ (apps/agent/thu-schema-that.ts, packages/validation/src/builder-question.ts, apps/agent/test/quyen-luot.spec.ts, apps/agent/test/custom-agent-runtime.spec.ts, apps/api/test/quyen-luot.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
