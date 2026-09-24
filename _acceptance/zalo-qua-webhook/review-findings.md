# Review Findings: zalo-qua-webhook

## Trong hợp đồng

(không có phát hiện nào ánh xạ được vào AC đã ký ở vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Zalo secrets put in turbo.json globalEnv, against the repo's 'passThroughEnv, never env' rule**
  Người dùng thấy gì: Đổi khoá bot Zalo hoặc khoá webhook có thể làm lần dựng lại kế tiếp của toàn bộ ứng dụng chậm hơn cần thiết, và giá trị bí mật bị ghi lại trong dữ liệu bộ nhớ đệm build.
  file: `turbo.json`
  severity: high
  Đề xuất: new-contract

- **New local HTTP-status constant object instead of the area's config module**
  Người dùng thấy gì: Không ảnh hưởng người dùng — chỉ là cách sắp xếp mã nguồn, không tác động tới việc nối Zalo đang chạy.
  file: `apps/agent/agent/lib/zalo-webhook.ts`
  severity: low
  Đề xuất: known-limits

- **Webhook drops a message for good when processing fails: the seen row is written before processing, and the route still returns 200**
  Người dùng thấy gì: Nếu có trục trặc tạm thời đúng lúc người dùng gửi mã nối tài khoản (ví dụ cơ sở dữ liệu chậm một nhịp), người đó có thể không bao giờ nhận được phản hồi và mã coi như mất hẳn, không ai biết để gửi lại.
  file: `apps/agent/agent/lib/zalo-webhook.ts`
  severity: medium
  Đề xuất: new-contract

- **Zalo reports as on and healthy from getMe alone, while nothing reads messages when there is no webhook secret or no registered webhook**
  Người dùng thấy gì: Trang kết nối có thể báo bot đang hoạt động bình thường trong khi thực ra không có tin nhắn nào được đọc, khiến người dùng gửi mã nối tài khoản mà không hề biết nó sẽ không bao giờ tới nơi.
  file: `apps/agent/agent/lib/zalo-bot.ts`
  severity: medium
  Đề xuất: new-contract

- **Manual polling loop uses one frozen `now` for a whole round of up to 20 × 30 s long-polls**
  Người dùng thấy gì: Trong một đợt vòng tay thử bot kéo dài nhiều phút, một mã nối tài khoản có thể vẫn được chấp nhận dù đã hết hạn, hoặc một người từng bị chặn vẫn bị coi là đang chặn dù thời hạn chặn đã qua.
  file: `apps/agent/agent/lib/zalo-poll.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): E9 c–f assert stderr KHÔNG chứa "error_code" để chứng minh "dừng trước khi gọi mạng"**
  Người dùng thấy gì: Nếu sau này có lỗi khiến hệ thống lỡ gọi ra ngoài dù thiếu cấu hình, bộ bằng chứng hiện tại có thể vẫn báo xanh, nên người ký duyệt có thể tin nhầm vào một phép đo chưa thực sự đo được điều nó tuyên bố.
  file: `apps/agent/test/zalo-qua-webhook.integration.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 3/4 (chuỗi có mặt thay cho quan hệ): E5 ca b assert log chứa "result" được thoả bởi bản dump lỗi Zod, không phải bởi danh sách khoá cấp đầu**
  Người dùng thấy gì: Một dòng bằng chứng tưởng đang xác nhận đúng nội dung nhật ký lỗi có thể xanh chỉ vì trùng chữ tình cờ, không phải vì nhật ký thực sự in đúng như mô tả.
  file: `apps/agent/test/zalo-qua-webhook.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): vỏ thân webhook và phản hồi setWebhook của Zalo giả được dựng đúng theo schema bên đọc, không lấy từ bản chụp thật**
  Người dùng thấy gì: Phần vỏ dữ liệu webhook giả lập trong bằng chứng chưa được đối chiếu với một tin nhắn thật từ Zalo, nên khi triển khai thật, hình dạng dữ liệu có thể khác và một số tin có thể bị xử lý sai mà chưa được lường trước.
  file: `apps/agent/test/support/zalo-tin.ts`
  severity: low
  Đề xuất: known-limits

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ

- **Hình dạng 4 (âm tính một mình): chân poll của E4 (webhook-trung) chỉ đo "không trả lời thêm", không có bằng chứng poll đã nhận lại tin trùng**
  file: `apps/agent/test/zalo-qua-webhook.integration.spec.ts:494`
  severity: medium
  source: measurement
  detail: E4 hứa rằng cùng message_id đi qua webhook hai lần RỒI qua một lượt pollZalo thì chỉ trả lời một lần. Sau khi gọi `pollZalo({ fetcher: zPoll.fetcher, now: () => GOC })`, test chỉ có các assert giữ nguyên: count ZaloLink = 1, count ZaloUpdateSeen = 1, `z.guiToi("Z").length + zPoll.guiToi("Z").length` = 1. Không có assert nào kiểu `zPoll.soGoi("getUpdates") >= 1` hay tin đã được giao, và không có ca đối chứng dùng message_id mới qua cùng zPoll để thấy poll sẽ trả lời. Nếu pollZalo thoát sớm (kiemBot trả "tat"/"loi", hoặc không gọi getUpdates) thì cả ba assert vẫn xanh. Nửa lời hứa về khử trùng giữa hai đường (webhook và poll) vì thế không được đo.

## Chưa adversarial-verify (refuter chết)

(không có mục nào)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
