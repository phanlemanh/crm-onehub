---
schema_version: 1
feature: Khi Zalo nhận đăng ký nhưng gọi thử địa chỉ nhận tin hỏng, màn Kết nối › Zalo hiện đúng bot vừa lưu kèm cảnh báo «Đăng ký lại», và cảnh báo giữ nguyên qua các nhịp kiểm cho tới lần đăng ký lại thành công
slug: zalo-goi-thu-hong-hien-dung-bot
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui, docs]
status: approved
design_doc: docs/superpowers/specs/2026-09-24-zalo-goi-thu-hong-hien-dung-bot-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-24T09:29:31Z
---

# Acceptance Contract: zalo-goi-thu-hong-hien-dung-bot

## Context

Cổng Bằng chứng vòng 3 của `noi-zalo-cho-nguoi-moi` (chủ kho ký 24/09, PR #118) để lại ba
mục ngoài hợp đồng về cùng một nhánh: Zalo nhận `setWebhook` nhưng gọi thử hỏng. Ngoài-2
(HIGH, chủ kho quyết mở hợp đồng mới): tác tử đã lưu bot mới mà vẫn trả `invalid`, API ném
lỗi, màn không tải lại, nên quản trị viên thấy bot cũ xanh và không bấm «Đăng ký lại».
Ngoài-3: nhịp `kiemBot` ghi lại `zaloWebhookUrl` từ `getWebhookInfo`, nên cảnh báo mất sau
một phút. Ngoài-4: nhánh này chưa có trong ma trận `CACH_GOI` kèm token mới. Phải lên
`onehub` trước hàng T của `docs/plan/lo-trinh-zalo.md` (triển khai trước 26/10).

Người dùng: quản trị viên bật hay đổi bot Zalo cho cả xưởng. Source input: prompt ·
`_acceptance/noi-zalo-cho-nguoi-moi/review-findings.md` · `decisions.jsonl` dòng 31–33 của hồ
sơ đó · design doc ở `design_doc`.

## Criteria

- AC-1: Given `AppSetting` có bot cũ (token T, khoá K, tên «Bot Cũ», `zaloWebhookUrl` U), tác tử ở gốc `https://`, Zalo giả trả `getMe` với `display_name` «Bot Mới» và `setWebhook` `ok: true` kèm `verification.outcome` «webhook.failed», When gọi route `POST /internal/zalo/bot` của tác tử với token T2, Then phản hồi là `outcome` «valid», `tenBot` «Bot Mới», `webhook` «zalo-tu-choi» và không chứa T2; đọc lại `AppSetting`: `zaloBotToken` T2, `zaloWebhookSecret` bằng đúng `secret_token` đã gửi trong `setWebhook`, `zaloBotName` «Bot Mới», `zaloWebhookUrl` null, `zaloWebhookLyDo` «zalo-tu-choi».
- AC-2: Given ba cách gọi — token mới khi đã có bot cũ (T, K, U), token lần đầu khi `AppSetting` rỗng, đăng ký lại không kèm token khi có bot (T, K, U) — và bốn kết quả Zalo — gọi thử được, gọi thử hỏng, `setWebhook` `ok: false`, lỗi mạng, When gọi route với từng tổ hợp (12 ô), Then mỗi ô khớp đúng bảng viết trước: gọi thử được → token mới hoặc T, khoá bằng khoá Zalo nhận, tên bot theo `getMe` ở cả `AppSetting` lẫn phản hồi, url bằng `<gốc>/zalo/webhook`, lý do null, «valid»/«da-dang-ky»; gọi thử hỏng → token mới hoặc T, khoá bằng khoá Zalo nhận, tên bot theo `getMe` ở cả hai nơi, url null, lý do «zalo-tu-choi», «valid»/«zalo-tu-choi»; `ok: false` và lỗi mạng → token, khoá, tên bot, url như trước lời gọi (T, K, «Bot Cũ», U; hoặc null khi lần đầu), lý do «zalo-tu-choi», «invalid».
- AC-3: Given quản trị viên, API thật gọi route tác tử thật qua cầu nối, Zalo giả như AC-1, bot cũ «Bot Cũ» có url U, When gọi `zalo.luuBot` với T2, rồi chạy một nhịp `kiemBot` với `getWebhookInfo` trả url U2, rồi gọi `zalo.xuong`, Then `luuBot` thành công và trả `{ tenBot: "Bot Mới", webhook: "zalo-tu-choi" }`; `zalo.xuong` trả `tenBot` «Bot Mới», `goiToken` bằng 4 ký tự cuối của T2, `webhook.trangThai` «chua-dang-ky»; không phản hồi nào chứa T2; và đối chứng cùng dựng với `setWebhook` `ok: false`: `luuBot` trả lỗi yêu cầu, `zalo.xuong` vẫn «Bot Cũ», «da-dang-ky». (cross-layer)
- AC-4: Given token đang lưu và `getMe` trả được, với ba trạng thái — (i) lý do null, url null; (ii) lý do «zalo-tu-choi», url null; (iii) lý do «zalo-tu-choi», url U — When nhịp `kiemBot` chạy với `getWebhookInfo` lần lượt trả url U2, 404, 500, thân sai khuôn (12 ô), Then (i) theo luật cũ: U2, null, null, null; (ii) url null ở cả bốn ô; (iii) U, null, U, null; lý do không đổi ở mọi ô; không nhịp nào ném; và khi một lần lưu bot gọi-thử-hỏng xảy ra giữa lúc nhịp đọc và lúc `getWebhookInfo` trả url, sau nhịp url vẫn null và lý do vẫn «zalo-tu-choi».
- AC-5: Given trạng thái sau AC-1, When đăng ký lại không kèm token mà Zalo giả gọi thử được, rồi nhịp `kiemBot` chạy với `getWebhookInfo` trả url U2, Then sau đăng ký lại: `zaloWebhookUrl` bằng `<gốc>/zalo/webhook`, lý do null, phản hồi «valid»/«da-dang-ky»; sau nhịp: `zaloWebhookUrl` là U2.
- AC-6: Given màn Kết nối › Zalo của quản trị viên, When dán token đúng dạng, bấm lưu, và API trả `{ tenBot: "Bot Mới", webhook: "zalo-tu-choi" }`, Then có đúng một thông báo loại cảnh báo, không có thông báo thành công; câu chứa «Bot Mới» và «Đăng ký lại» (tiếng Việt) hoặc «Bot Mới» và «Sign up again» (tiếng Anh); ô token trống; dữ liệu Zalo được làm mới và trang được tải lại đúng một lần; và đối chứng cùng dựng với `webhook` «da-dang-ky»: đúng một thông báo thành công «Đã bật Bot Mới.», không có cảnh báo.
- AC-7: Given khối «Zalo chưa giao tin nhắn về CRM» với nút «Đăng ký lại», When bấm nút và API trả `webhook` «zalo-tu-choi», Then có đúng một thông báo cảnh báo, không có «Đã đăng ký nhận tin lại.», và trang được tải lại; đối chứng `webhook` «da-dang-ky»: đúng một thông báo thành công «Đã đăng ký nhận tin lại.».
- AC-8: Given app và api thật của cây đang xét, cầu nối tới route tác tử thật sau Zalo giả như AC-1, bot cũ «Bot Cũ» đang «Nhận tin qua webhook», When quản trị viên dán token mới, bấm «Đổi token», rồi một nhịp `kiemBot` chạy với `getWebhookInfo` trả url, rồi tải lại trang, Then trên ảnh sau khi lưu (1440 và 375): có «Bot Mới», không có «Bot Cũ», có thông báo cảnh báo nói đã lưu nhưng Zalo chưa gọi thử được, có khối «Zalo chưa giao tin nhắn về CRM» và nút «Đăng ký lại», không có «Nhận tin qua webhook»; trên ảnh sau nhịp: vẫn có khối cảnh báo và nút đó. (cross-layer)
- AC-9: Given kho sau vòng này, When chạy trọn `nhac-qua-zalo.integration.spec.ts`, `zalo-qua-webhook.integration.spec.ts`, `noi-zalo-cho-nguoi-moi.integration.spec.ts` của tác tử và `noi-zalo-cho-nguoi-moi.spec.ts`, `noi-zalo-cau-noi.spec.ts` của API, Then hai spec đầu không đổi so với `merge-base` của nhánh với `onehub`; trong spec `noi-zalo-cho-nguoi-moi` của tác tử chỉ hai ca `goi-nguoc: b` và `goi-nguoc: c` đổi, và chỉ ở vế `outcome`/`webhook`; mọi ca của năm tệp xanh.
- AC-10: Given kho sau vòng này, When đọc `docs/connections.md` và `docs/plan/lo-trinh-zalo.md`, Then mục Zalo của `docs/connections.md` nói gọi thử hỏng vẫn lưu bot mới và cảnh báo giữ tới lần «Đăng ký lại» thành công; bảng mục 7 của lộ trình có một dòng mang slug `zalo-goi-thu-hong-hien-dung-bot`, và dòng vòng 2 ghi đã lên `onehub` với #118 thay cho «PR mở»; bản hai tệp ở `merge-base` với `onehub` không đạt các điều đó.

## Coverage

Quét bằng `morphological-scan` (`_acceptance/zalo-goi-thu-hong-hien-dung-bot/morphological-scan.md`).

- Trục A — cách gọi: token mới khi có bot cũ | token lần đầu | đăng ký lại [thước CE: `datBot` nhận `token?`; ma trận `CACH_GOI` đã ký]
- Trục B — Zalo trả gì: gọi thử được | gọi thử hỏng | `ok: false` | lỗi mạng (gốc http và `getMe` 401 gạch — AC-3, AC-2 hồ sơ vòng 2 phủ) [thước CE: `KetDangKy` trong `zalo-bot-xuong.ts` + `[NGÀNH: Telegram Bot API setWebhook/getWebhookInfo]`]
- Trục C — nhịp sau đó: `getWebhookInfo` url | 404 | 500 | sai khuôn, trên ba trạng thái cờ [thước CE: `docWebhook` trong `zalo-bot.ts`]
- Trục D — ai nhìn: phản hồi tác tử | `AppSetting` | `zalo.xuong` | màn [thước CE: AC-1, AC-14, AC-16, AC-17 hồ sơ vòng 2]
- Ánh xạ Core → tiêu chí: token mới × gọi thử hỏng → AC-1, AC-3, AC-6, AC-8 · đăng ký lại × gọi thử hỏng → AC-2, AC-7 · cờ giữ qua nhịp → AC-4, AC-3, AC-8 · ma trận viết trước (Ngoài-4) → AC-2 · đường gỡ cờ → AC-5 · không hồi quy, tài liệu → AC-9, AC-10
- `[GIẢ ĐỊNH]` chờ người gạch:
  - (1) Zalo thật có thể trả `setWebhook` `ok: true` kèm `verification.outcome` khác «webhook.ok» — khuôn Zalo giả lấy từ lần gọi thật trong vòng 2; chưa đo được ca hỏng trên bot thật.
  - (2) Sau gọi thử hỏng, `getWebhookInfo` vẫn trả địa chỉ vừa đăng ký — đó là lý do Ngoài-3 xảy ra; nếu Zalo xoá địa chỉ thì AC-4 hàng (ii) vẫn đúng (404 → null).
  - (3) Sau gọi thử hỏng Zalo không giao tin về CRM cho tới lần đăng ký lại. Sai thì cảnh báo nói "chưa giao" trong lúc tin vẫn tới; đăng ký lại một lần là gỡ.

## Out of scope

- Lùi về bot cũ khi gọi thử hỏng với token mới — xem phương án đã loại ở design doc.
- Tự gỡ cảnh báo khi webhook đến bằng khoá đúng; trạng thái riêng «xac-minh-hong» ở `zalo.xuong`.
- Nhịp tự gọi lại `setWebhook` để xác minh lại.
- Ngoài-1 vòng 3 (`CotZalo` viết tay, lý do không đối chiếu lúc biên dịch) và các mục Known limits khác của hồ sơ vòng 2.
- Lỗi tác tử hiện thành «Tác tử chưa nối được» — hợp đồng riêng đã tách ở vòng 2.

## Notes

- Không gọi `setWebhook`/`deleteWebhook` trên bot Zalo thật; mọi phép đo đi qua Zalo giả
  (`ZALO_API_URL` hoặc `fetcher`).
- Hai ca `goi-nguoc: b`, `goi-nguoc: c` của spec đã ký `noi-zalo-cho-nguoi-moi` ghim
  `outcome: "invalid"` cho nhánh gọi thử hỏng; vòng này đổi đúng vế đó (xem sổ quyết định).
  Hồ sơ `_acceptance/noi-zalo-cho-nguoi-moi/` không bị chạm.
