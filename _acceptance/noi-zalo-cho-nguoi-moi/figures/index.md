# Hình tại điểm quyết định — noi-zalo-cho-nguoi-moi

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-4 tác tử tự ghi token và khoá + d-1 chỉ quản trị + giả định (3) gốc URL trên Vercel | 5 bước nối tiếp, 3 nhánh rẽ (không quyền · sai dạng · http) | cần hình → `bat-bot` |
| d-5 Ngoài-3: seen và hiệu ứng DB chung một giao dịch + giả định (2) Zalo gửi lại khi khác 2xx | 4 bước nối tiếp, 2 nhánh rẽ (DB lỗi · gửi trả lời hỏng) | cần hình → `tin-den-giao-dich` |
| d-2 giữ mã 6 số, bỏ nối đảo chiều và QR | 3 bước nối tiếp phía người dùng | không vẽ: luồng đã có trên proto bấm được (ST-thong-bao-chua-noi, ST-thong-bao-ma-cho) |
| d-3 block ReUI Pro chỉ tham chiếu, cài stepper ở S3 | 1 bước | dưới ngưỡng: 1 bước |
| d-6 hoãn Gỡ bot, mã hoá, giới hạn gửi thử | 0 bước | dưới ngưỡng: danh sách cắt |
| d-7 chạy design-pass, module proto dùng lại | 1 bước | dưới ngưỡng: 1 bước |
| giả định (1) khuôn `getWebhookInfo` khi đã đặt | 1 nhánh | dưới ngưỡng: đã nằm trong AC-6 (d) |

## Đề bài `bat-bot`

- Loại: sequence ngang, bốn làn: «Màn Kết nối › Zalo», «API», «Tác tử», «Zalo».
- Bước: quản trị dán Bot Token → API: `canManageConnections`? (không → «bị cấm, không gọi tác tử») → API: token khớp `<số>:<chuỗi>`? (không → «lỗi dưới ô: đây không phải Bot Token, khác Secret Token») → cầu nối `POST /internal/zalo/bot` → Tác tử: `getMe` (401 → «Zalo không nhận token này», không ghi gì) → Tác tử: sinh khoá 64 ký tự → gốc yêu cầu là https? (không → ghi token, lý do «can-https», màn chỉ `zalo:poll`) → `setWebhook(<gốc>/zalo/webhook, khoá)` → Tác tử ghi `AppSetting` (token, khoá, tên bot, url) → API trả bản đã che `••••wxyz`.
- Nhãn chú thích: ô «gốc yêu cầu» gắn cờ «giả định (3): trên Vercel gốc là tên miền AGENT_URL». Ô «Tác tử ghi AppSetting» gắn «d-4: khoá không đi qua API».
- AC liên quan: AC-1, AC-2, AC-3, AC-4, AC-6.

## Đề bài `tin-den-giao-dich`

- Loại: flowchart dọc, một đường vào, hai nhánh lỗi.
- Nút: «Zalo POST /zalo/webhook (khoá đúng, tin riêng)» → «Đã thấy message_id?» (có → «200, bỏ qua») → khối giao dịch bao hai ô «ghi ZaloUpdateSeen» + «nối / ghi sai» → «DB lỗi?» (có → «giao dịch lui, không seen, trả 500 → Zalo gửi lại») → «gửi câu trả lời» → «gửi hỏng?» (có → «vẫn 200, log message_id; liên kết đã có») → «200».
- So sánh nhỏ bên cạnh: «vòng 1: seen ghi TRƯỚC, lỗi vẫn 200 → tin mất hẳn (Ngoài-3)».
- Nhãn chú thích: nhánh 500 gắn «giả định (2): Zalo gửi lại khi khác 2xx — chưa đo trên bot thật».
- AC liên quan: AC-7, AC-8.
