## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **builderCommandType is now an identity function; message is threaded through builderSessionAttributes for nothing**
  Người dùng thấy gì: Không ảnh hưởng người dùng: có một đoạn mã cũ không còn tác dụng thực sự nhưng vẫn được giữ lại trong hệ thống, không gây lỗi hay thay đổi hành vi nào.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: low
  Đề xuất: known-limits

- **Source-text scanning test will fail on any legitimate future ternary producing "CREATE_AGENT"**
  Người dùng thấy gì: Một bài kiểm tra nội bộ có thể báo lỗi nhầm trong tương lai khi có người viết thêm code hợp lệ khác nhưng tình cờ giống mẫu bị cấm trước đây; điều này chỉ làm chậm việc phát triển sau này, không ảnh hưởng đến trải nghiệm của người dùng hiện tại.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: low
  Đề xuất: known-limits

- **buildPendingInputRequest validates but discards the parsed value, so the JSON column keeps an unparsed shape**
  Người dùng thấy gì: Dữ liệu câu hỏi đang chờ của tính năng dựng tác nhân được lưu chưa hoàn toàn chuẩn hoá; hiện tại chưa gây lỗi hiển thị nào cho người dùng, nhưng nếu định dạng dữ liệu thay đổi sau này thì dữ liệu cũ có thể bị đọc sai.
  file: `packages/validation/src/builder-question.ts`
  severity: low
  Đề xuất: known-limits

- **Câu hỏi builder đang treo lúc deploy bị hạ ngầm xuống CHAT (không có backfill)**
  Người dùng thấy gì: Nếu một người dùng đang dở một cuộc trò chuyện dựng tác nhân đúng lúc bản cập nhật này được đưa lên, họ có thể bất ngờ nhận yêu cầu phải bấm lại nút Tạo tác nhân và mất bản nháp đang làm dở, dù họ không làm gì sai.
  file: `packages/validation/src/builder-question.ts`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét LỚP ("đếm trên đĩa = 0") nhưng bộ dò chỉ nhận đúng một điểm-case cú pháp (hình dạng 5)**
  Người dùng thấy gì: Một phép đo nội bộ dùng để bảo đảm hệ thống không còn suy đoán quyền từ nội dung tin nhắn hiện chỉ nhận diện được một cách viết code cụ thể; các cách viết tương đương khác có thể lọt qua, khiến báo cáo có thể báo 'an toàn' trong khi một dạng lỗi tương tự vẫn còn tồn tại chưa được phát hiện.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/5 lỗi rơi vào file không bộ đo nào phủ (apps/agent/agent/lib/custom-agent-dispatch.ts, apps/agent/test/quyen-luot.spec.ts, packages/validation/src/builder-question.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
