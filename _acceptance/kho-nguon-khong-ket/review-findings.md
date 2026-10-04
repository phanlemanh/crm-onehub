# Review findings: kho-nguon-khong-ket (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **catch in chaySoanTuNguon also wraps writes made after the state change, so a failed completeTask resets a finished source to LOI 'docLoi'**
  Người dùng thấy gì: Hiếm khi, nếu hệ thống gặp lỗi tạm lúc đóng việc sau khi nguồn đã đọc xong, nguồn có thể bị đổi sang lỗi chung «Chưa đọc được tệp», mất lý do cụ thể trước đó, hoặc bị kéo lùi khi máy soạn đã bắt đầu soạn. Người nạp bấm «Soạn lại» là chạy tiếp được.
  file: `apps/agent/agent/lib/tai-lieu-soan.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: AC-3 không round-trip từ việc soanLai ghi sang chaySoanTuNguon đọc**
  Người dùng thấy gì: Các bài kiểm tự động chưa chạy trọn một vòng từ lúc bấm «Soạn lại» đến lúc máy soạn nhận việc, nên nếu hai bên lệch nhau về dạng việc thì bài kiểm vẫn xanh. Người dùng có thể bấm «Soạn lại» mà nguồn không đi tiếp mà không ai biết trước.
  file: `apps/agent/test/tai-lieu-nguon-mo-coi.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert chuỗi có mặt trong khi lời hứa là quan hệ: ô f-can-go-tay chỉ khớp tiền tố «Cần gõ tay»**
  Người dùng thấy gì: Bài kiểm chỉ chắc chắn lý do «Cần gõ tay» bắt đầu đúng chữ, chưa kiểm cả câu. Nếu sau này ai đó vô tình thêm chữ thừa vào câu giải thích cho tệp bản quét, người nạp sẽ thấy câu lạ mà bài kiểm không báo.
  file: `apps/agent/test/tai-lieu-soan.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 — hằng viết tay thay cho đầu ra thật: nhịp dispatch trong cận 30 phút là literal 60_000, không đọc từ cron của schedules/dispatch.ts**
  Người dùng thấy gì: Nếu sau này ai đó chỉnh máy soạn chạy thưa hơn, nguồn mồ côi có thể kẹt lâu hơn 30 phút mới được báo lỗi, mà bài kiểm vẫn không cảnh báo. Hiện tại mọi thứ vẫn đúng hạn.
  file: `apps/agent/test/tai-lieu-nguon-mo-coi.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
