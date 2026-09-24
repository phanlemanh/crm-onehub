## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub — bot Zalo nhắc việc buổi sáng. Chân sản phẩm: đào repo
  (`apps/agent/agent/lib/zalo-bot-xuong.ts`, `apps/agent/agent/lib/zalo-bot.ts`,
  `apps/api/src/zalo/zalo.service.ts`, màn `apps/app/app/(app)/[slug]/settings/connections/zalo/`,
  hồ sơ `_acceptance/noi-zalo-cho-nguoi-moi/` vòng 3). Chân ngành: Telegram Bot API —
  `setWebhook` / `getWebhookInfo` (trường `last_error_message`, `last_error_date`): nền tảng
  bot báo trạng thái webhook là "đã đặt địa chỉ" tách khỏi "giao tin có lỗi gần nhất"; Zalo
  Bot API chép khuôn này và thêm `verification.outcome` khi `setWebhook`.

## Trục

- Trục A — cách quản trị viên gọi lưu bot: token mới khi đã có bot cũ | token lần đầu (chưa có
  bot) | đăng ký lại không kèm token [thước CE: `datBot` nhận `token?`, ma trận `CACH_GOI`
  của `noi-zalo-cho-nguoi-moi.integration.spec.ts` — SUY-TỪ-REPO]
- Trục B — Zalo trả gì khi đăng ký: `setWebhook` nhận và gọi thử được | nhận nhưng gọi thử
  hỏng | `ok: false` | lỗi mạng | (gốc http → không gọi `setWebhook`) | `getMe` 401 [thước CE:
  `KetDangKy` trong `zalo-bot-xuong.ts` + `[NGÀNH: Telegram setWebhook trả ok/false]`]
- Trục C — nhịp `kiemBot` sau đó: `getWebhookInfo` trả url | 404 | 500 | thân sai khuôn |
  `getMe` hỏng [thước CE: `docWebhook`/`docBot` trong `zalo-bot.ts` — SUY-TỪ-REPO]
- Trục D — ai nhìn kết quả: phản hồi của tác tử | hàng `AppSetting` | `zalo.xuong` | màn (ô
  token, nút «Đăng ký lại») [thước CE: AC-1/AC-14/AC-16/AC-17 hồ sơ vòng 2]

## Dựng không gian

A × B = 18 ô. Gạch: A × «gốc http» (3 ô — không đi nhánh `setWebhook`, AC-3 cũ phủ) và
A × «getMe 401» (3 ô — dừng trước khi lưu gì, AC-2 cũ phủ). Còn 12 ô có nghĩa, cộng trục C
trên ba trạng thái cờ (không cờ · cờ + url rỗng · cờ + url cũ) × 4 kết quả `getWebhookInfo` =
12 ô, cộng trục D.

## Core (≈20%)

1. Token mới × gọi thử hỏng — bot mới đã lưu; phản hồi phải nói "đã lưu, chưa nhận tin",
   API không ném, màn tải lại hiện bot mới (Ngoài-2, HIGH).
2. Đăng ký lại × gọi thử hỏng — cùng loại phản hồi, nút «Đăng ký lại» không báo thành công.
3. Cờ «zalo-tu-choi» + url rỗng × `getWebhookInfo` trả url — nhịp không được xoá cảnh báo
   (Ngoài-3).
4. Ma trận 3 cách gọi × 4 kết quả Zalo viết trước — phủ Ngoài-4 thành lớp, không điểm.
5. Đăng ký lại thành công sau đó — cờ gỡ, nhịp kế lại ghi url bình thường (đường thoát).

## Later

- Tự gỡ cờ khi webhook đến bằng khoá đúng (bằng chứng Zalo đã giao được) — cần một lối ghi
  mới ở `nhanWebhook`; đăng ký lại một cú bấm là đủ cho tới khi lái thử thấy cảnh báo sai
  chiều.
- Trạng thái riêng «xac-minh-hong» ở `zalo.xuong` với câu riêng — cảnh báo «Zalo chưa giao
  tin nhắn về CRM» + «Đăng ký lại» đã nói đúng việc cần làm.
- Cờ + gốc http (`can-https`) × `getWebhookInfo` trả url — hành vi cũ, không liên quan lời
  hứa này.

## Never

- Lùi về bot cũ khi gọi thử hỏng với token mới — Zalo đã nhận khoá mới; khi quản trị viên đổi
  token của CÙNG bot (Zalo cấp lại token) thì token cũ đã chết, lùi về là mất bot.
- Nhịp tự gọi lại `setWebhook` để xác minh lại — sinh khoá mới mỗi phút, đè khoá Zalo đang giữ.

## Cross-cutting áp mọi ô Core

- Không trường nào của phản hồi tác tử, API hay `zalo.xuong` chứa Bot Token.
- Chữ trên màn có đủ hai ngôn ngữ (vi, en).
- Hai spec đã ký (`nhac-qua-zalo`, `zalo-qua-webhook`) không đổi và xanh.
