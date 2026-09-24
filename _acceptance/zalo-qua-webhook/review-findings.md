## Trong hợp đồng

Không có phát hiện nào ánh xạ được vào AC trong vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New local HTTP-status constant object instead of the area's config module (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng — chỉ là cách sắp xếp mã nguồn, không tác động tới việc nối Zalo đang chạy.
  file: `apps/agent/agent/lib/zalo-webhook.ts`
  severity: low
  Đề xuất: known-limits

- **Webhook drops a message for good when processing fails: the seen row is written before processing, and the route still returns 200 (r1)**
  Người dùng thấy gì: Nếu có trục trặc tạm thời đúng lúc người dùng gửi mã nối tài khoản (ví dụ cơ sở dữ liệu chậm một nhịp), người đó có thể không bao giờ nhận được phản hồi và mã coi như mất hẳn, không ai biết để gửi lại.
  file: `apps/agent/agent/lib/zalo-webhook.ts`
  severity: medium
  Đề xuất: new-contract

- **Zalo reports as on and healthy from getMe alone, while nothing reads messages when there is no webhook secret or no registered webhook (r1)**
  Người dùng thấy gì: Trang kết nối có thể báo bot đang hoạt động bình thường trong khi thực ra không có tin nhắn nào được đọc, khiến người dùng gửi mã nối tài khoản mà không hề biết nó sẽ không bao giờ tới nơi.
  file: `apps/agent/agent/lib/zalo-bot.ts`
  severity: medium
  Đề xuất: new-contract

- **Manual polling loop uses one frozen `now` for a whole round of up to 20 × 30 s long-polls (r1)**
  Người dùng thấy gì: Trong một đợt vòng tay thử bot kéo dài nhiều phút, một mã nối tài khoản có thể vẫn được chấp nhận dù đã hết hạn, hoặc một người từng bị chặn vẫn bị coi là đang chặn dù thời hạn chặn đã qua.
  file: `apps/agent/agent/lib/zalo-poll.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): vỏ thân webhook và phản hồi setWebhook của Zalo giả được dựng đúng theo schema bên đọc, không lấy từ bản chụp thật (r1)**
  Người dùng thấy gì: Phần vỏ dữ liệu webhook giả lập trong bằng chứng chưa được đối chiếu với một tin nhắn thật từ Zalo, nên khi triển khai thật, hình dạng dữ liệu có thể khác và một số tin có thể bị xử lý sai mà chưa được lường trước.
  file: `apps/agent/test/support/zalo-tin.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có mục nào trong vòng này.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
