## Trong hợp đồng

(không có phát hiện nào ánh xạ được vào AC ở vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **builderCommandType đã thành hàm đồng nhất, kéo theo một tham số chết xuyên suốt**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay bây giờ, nhưng để lại một chỗ hở kỹ thuật: nếu sau này ai đó gõ sai tên trạng thái quyền, hệ thống có thể âm thầm coi lượt đó là không được phép mà không báo lỗi gì.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: medium
  Đề xuất: known-limits

- **Khuôn thật của cột pendingInputRequest không có schema nào mô tả trọn**
  Người dùng thấy gì: Cách hệ thống lưu lại quyền của một câu hỏi đang chờ chưa được chuẩn hoá chặt ở bước ghi; nếu dữ liệu trôi dần theo thời gian, hai nơi đọc lại (nơi hỏi và nơi xác nhận quyền) có thể không còn khớp nhau.
  file: `packages/validation/src/builder-question.ts`
  severity: medium
  Đề xuất: known-limits

- **Biến chết trong test mới, lint của kho đã bắt**
  Người dùng thấy gì: Có một dòng mã thừa trong bộ kiểm tra không được dùng tới; không ảnh hưởng gì tới người dùng, chỉ là mã chưa được dọn sạch.
  file: `apps/agent/test/chan-uy-thac.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hai file test trùng nội dung cho một hàm sống ở packages/validation**
  Người dùng thấy gì: Có hai bộ kiểm tra gần như giống hệt nhau nằm ở hai nơi khác nhau trong mã nguồn; không ảnh hưởng người dùng, chỉ tốn công bảo trì về lâu dài.
  file: `apps/api/test/quyen-luot.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Existing pendingInputRequest rows have no builderAuthorized flag, so in-flight builder questions silently downgrade to CHAT after deploy**
  Người dùng thấy gì: Những câu hỏi mà tính năng tạo tác nhân đang chờ người dùng trả lời từ trước bản cập nhật này sẽ bị coi như một tin nhắn chat thường khi người dùng bấm trả lời; việc tạo tác nhân dở dang sẽ dừng lặng lẽ và người dùng phải bấm Tạo tác nhân để làm lại từ đầu.
  file: `apps/api/src/conversations/conversations.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: `rejects.not.toThrow` không ghim kết quả đúng**
  Người dùng thấy gì: Một bài kiểm tra dùng để đảm bảo các lượt được phép không bị chặn nhầm hiện đang báo đạt vì một lỗi khác không liên quan, chứ không phải vì lượt đó thực sự đi qua trót lọt; nếu sau này có lỗi thật chặn nhầm lượt hợp lệ, bài kiểm tra này sẽ không phát hiện ra.
  file: `apps/agent/test/chan-uy-thac.spec.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/6 lỗi rơi vào file không bộ đo nào phủ (apps/agent/test/chan-uy-thac.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
