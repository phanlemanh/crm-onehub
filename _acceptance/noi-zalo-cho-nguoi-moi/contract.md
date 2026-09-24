---
schema_version: 1
feature: Quản trị viên bật bot Zalo ngay trên màn (dán Bot Token, tác tử tự đăng ký webhook); người mới nối theo ba bước có tên bot thật và gửi thử được nhắc ngay; bot nhận ra người đã nối; tin lỗi giữa chừng không mất; người rời xưởng bị gỡ liên kết
slug: noi-zalo-cho-nguoi-moi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, config, docs]
status: approved
design_doc: docs/superpowers/specs/2026-09-24-noi-zalo-cho-nguoi-moi-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-24T06:53:58Z
---

# Acceptance Contract: noi-zalo-cho-nguoi-moi

## Context

Vòng 2 của `docs/plan/lo-trinh-zalo.md`. Lái thử bot thật ngày 2026-09-23: quản
trị viên phải sửa `.env` và khởi động lại tác tử để bật Zalo, hướng dẫn chỉ sai chỗ
tạo bot, chủ kho dán nhầm Secret Token; người dùng thấy tên bot là `account_name`
thay vì tên tìm được trong Zalo; nối xong không có cách biết nhắc có tới không.
Vòng 1 chuyển sang đây Ngoài-3 (tin lỗi giữa chừng mất hẳn) và Ngoài-4 (trang báo
bot sống chỉ theo `getMe`).

Người dùng: nhân viên OneHub nối Zalo để nhận nhắc 08:30. Quản trị viên: người bật
bot cho cả xưởng. Source input: lộ trình vòng 2 · lái thử 23/09 · thiết kế chủ kho
duyệt trong chat 2026-09-24 · design doc ở `design_doc`.

## Criteria

- AC-1: Given quản trị viên, tác tử nhận cầu nối ở gốc `https://`, và Zalo giả nhận token T (`getMe` trả `account_name` «bot.uipSwwnr» và `display_name` «Bot OneHub»), When gọi `zalo.luuBot` với T, Then có đúng một `getMe` và đúng một `setWebhook` với `url` bằng `<gốc>/zalo/webhook` và `secret_token` dài 64 ký tự; đọc lại `AppSetting`: `zaloBotToken` bằng T, `zaloWebhookSecret` bằng đúng khoá đã gửi, `zaloBotName` là «Bot OneHub», `zaloWebhookUrl` bằng url đó, `zaloWebhookLyDo` null; `zalo.xuong` trả `nguonToken` «man-hinh», `goiToken` bằng 4 ký tự cuối của T, `webhook.trangThai` «da-dang-ky», và không trường nào của hai phản hồi chứa T. (cross-layer)
- AC-2: Given quản trị viên, When gọi `zalo.luuBot` lần lượt với: (a) chuỗi 18 ký tự không có dấu hai chấm; (b) `12345:abc` mà `getMe` trả 401, Then (a) lỗi yêu cầu có câu nêu «<số>:<chuỗi>» và «Secret Token», không có lời gọi nào tới tác tử; (b) lỗi yêu cầu có câu «Zalo không nhận token này», không có `setWebhook`; ở cả hai ca, bốn cột Zalo mới và `zaloBotName` của `AppSetting` không đổi so với trước. (cross-layer)
- AC-3: Given quản trị viên và tác tử nhận cầu nối ở gốc `http://`, When gọi `zalo.luuBot` với token hợp lệ, Then có một `getMe` và không có `setWebhook`; `AppSetting` có token và tên bot, `zaloWebhookUrl` null, `zaloWebhookLyDo` «can-https»; `zalo.xuong` trả `webhook.trangThai` «can-https». (cross-layer)
- AC-4: Given thành viên không phải quản trị viên, When gọi `zalo.luuBot` với token hợp lệ, và gọi thẳng `POST /internal/zalo/bot` của tác tử không kèm khoá cầu nối, Then lời gọi API bị cấm, lời gọi tác tử trả 401; không có lời gọi nào tới Zalo; `AppSetting` không đổi; `zalo.xuong` của người đó trả `canManage` false và `goiToken` null. (cross-layer)
- AC-5: Given `AppSetting` có token A và khoá KA, môi trường có token B và khoá KB, When (a) webhook đến với header KA; (b) với header KB; (c) nhịp `kiemBot` chạy; (d) nhắc buổi sáng gửi cho người đã nối; (e) `pollZalo` chạy; (f) lệnh `bun run zalo:poll` chạy; (g) lệnh `bun run zalo:webhook <https-url>` chạy, Then (a) 200 và tin được xử lý; (b) 403; (c) tới (g) mọi lời gọi Zalo đi đường `/bot<A>/`, và (g) gửi `secret_token` bằng KA; và khi `AppSetting` rỗng, webhook với KB trả 200 và `kiemBot` dùng B; khi cả hai rỗng, webhook trả 404 và `kiemBot` không gọi Zalo.
- AC-6: Given token đang lưu, When nhịp `kiemBot` chạy với `getWebhookInfo` lần lượt trả (a) url U; (b) 404; (c) 500; (d) 200 với thân không đúng khuôn; rồi quản trị viên gọi `zalo.luuBot` không kèm token, Then (a) `zaloWebhookUrl` bằng U và `zalo.xuong` trả «da-dang-ky»; (b) null và «chua-dang-ky»; (c) giữ giá trị cũ; (d) null, «chua-dang-ky», và một dòng log chứa danh sách khoá cấp đầu của thân; không nhịp nào ném; lần đăng ký lại có đúng một `setWebhook` bằng token đang lưu với khoá mới, sau đó webhook với khoá cũ trả 403 và với khoá mới trả 200. (cross-layer)
- AC-7: Given U có mã sống, When tin mang mã của U đến qua webhook trong lúc `transaction` ghi liên kết bị làm hỏng, rồi cùng tin đó đến lại khi DB đã lành, Then lần đầu trả 500, không có `ZaloUpdateSeen`, `ZaloLink` hay `sendMessage`; lần sau trả 200 và có đúng một `ZaloLink` (U, Z), một `ZaloUpdateSeen`, một `sendMessage`.
- AC-8: Given U có mã sống và Zalo giả trả lỗi cho `sendMessage`, When tin mang mã của U đến qua webhook, rồi cùng tin đến lại, Then lần đầu trả 200, có `ZaloLink` (U, Z) và `ZaloUpdateSeen`, và một dòng log chứa `message_id` của tin; lần sau trả 200 và không có thêm `sendMessage` hay `ZaloLink`.
- AC-9: Given Z đã nối với U có tên CRM «Phan Lê Mạnh», When Z nhắn «xin chào» qua webhook, và người Zalo Y chưa nối nhắn cùng chữ, Then Z nhận đúng một tin chứa «Bạn đã nối với Phan Lê Mạnh» và «08:30», không chứa câu hướng dẫn, bộ đếm sai của Z không tăng; Y nhận câu `ZALO.loi.huongDan`.
- AC-10: Given U đã nối Zalo, V chỉ khớp Slack, W không có kênh nào, When mỗi người gọi `zalo.guiThu`, Then U: đúng một `sendMessage` tới `zaloUserId` của U chứa câu tin thử, phản hồi kênh «zalo», không có hàng `AgentTask` mới; V: đúng một tin Slack tới `slackUserId` của V, phản hồi kênh «slack»; W: lỗi yêu cầu có câu «chưa có kênh nào», không gửi gì; và khi không có cầu nối, lời gọi trả lỗi yêu cầu, không ném. (cross-layer)
- AC-11: Given U và V đều có `ZaloLink`, `ZaloLinkCode` và `NotificationPreference`, When quản trị viên gỡ U khỏi xưởng, Then đọc lại DB: U không còn hàng nào trong ba bảng đó; ba hàng của V còn nguyên.
- AC-12: Given `getMe` trả `account_name` «bot.uipSwwnr» và `display_name` «Bot OneHub», When nhịp `kiemBot` chạy rồi mở trang Thông báo của bạn (có mã chờ) và trang Kết nối › Zalo, Then `zaloBotName` là «Bot OneHub»; cả hai trang hiện «Bot OneHub» và không có «bot.uipSwwnr».
- AC-13: Given trang Kết nối › Zalo của quản trị viên chưa bật bot, When dán `abc` rồi bấm Lưu; rồi dán token đúng dạng mà API trả lỗi «Zalo không nhận token này», Then ca `abc` không gửi yêu cầu nào; lỗi hiện dưới ô trong vùng `aria-live`, focus về ô, ô vẫn giữ chữ đã dán; trong lúc yêu cầu chạy, nút ghi «Đang kiểm…» và bị khoá; ô có `type="password"` và `autocomplete="off"`.
- AC-14: Given màn thật chạy ở 1440 và 375, When mở Thông báo của bạn ở ba trạng thái chưa nối, mã chờ, đã nối, và Kết nối › Zalo ở năm trạng thái chưa bật (quản trị), sống, can-https, chưa đăng ký webhook, thành viên thường, Then nhìn thấy trên ảnh: ba bước có số với tên bot «Bot OneHub»; bước 3 có mã 6 số; nút «Gửi thử nhắc ngay» ở trạng thái đã nối; hướng dẫn tạo bot chỉ Zalo › OA «Zalo Bot Manager» và nói Bot Token có dạng `<số>:<chuỗi>`, khác Secret Token; không có chữ `.env` hay `bot.zaloplatforms.com`; trạng thái chưa đăng ký webhook có cảnh báo «Zalo chưa giao tin nhắn về CRM» và nút «Đăng ký lại», không có «Nhận tin qua webhook»; mỗi ảnh có nhiều nhất một nút tô đầy; thành viên thường không thấy ô token; nhãn «Chưa nối» và dòng giờ hết hạn của mã không bị cắt ở 375; không có «Zalo: Zalo» hay «Slack: Slack».
- AC-15: Given kho sau vòng này, When chạy trọn `apps/agent/test/nhac-qua-zalo.integration.spec.ts` và `apps/agent/test/zalo-qua-webhook.integration.spec.ts`, và đọc `docs/connections.md`, `docs/environment.md`, `.env.example`, `docs/proto.md`, Then hai tệp test không đổi so với `merge-base` của nhánh với `onehub` và mọi ca xanh; mục Zalo của `docs/connections.md` chỉ quản trị viên dán Bot Token ở Kết nối › Zalo và mô tả trạng thái webhook, không còn lấy «sửa `.env` rồi khởi động lại tác tử» làm đường chính; `docs/environment.md` và `.env.example` ghi `ZALO_BOT_TOKEN`, `ZALO_WEBHOOK_SECRET` là đường dự phòng khi `AppSetting` rỗng; `docs/proto.md` có mục block ReUI chỉ làm tham chiếu bố cục.
- AC-16: Given quản trị viên dán token hợp lệ, tác tử ở gốc `https://`, và Zalo giả gọi thử `POST /zalo/webhook` của tác tử bằng đúng `secret_token` nó vừa nhận NGAY TRONG lúc xử lý `setWebhook` (như Zalo thật xác minh địa chỉ), When gọi `zalo.luuBot`, Then lời gọi thử đó nhận 200; và khi Zalo giả trả `verification.outcome` khác `webhook.ok`, `zaloWebhookLyDo` là «zalo-tu-choi», `zaloWebhookUrl` null và `zalo.xuong` không trả «da-dang-ky». (cross-layer)
- AC-17: Given bot đang chạy với token T và khoá K đã đăng ký, When quản trị viên đăng ký lại (không kèm token) hoặc dán token mới T2, và Zalo giả làm `setWebhook` thất bại (trả `ok: false`, hoặc lỗi mạng), Then đọc lại `AppSetting`: `zaloBotToken` vẫn là T, `zaloWebhookSecret` vẫn là K, `zaloWebhookLyDo` là «zalo-tu-choi»; webhook với khoá K vẫn trả 200; và phản hồi cho màn nói đăng ký không thành, không báo đã bật. (cross-layer)
- AC-18: Given token đang lưu, `zaloWebhookUrl` là U và có hàng `ZaloUpdateSeen` cũ hơn hạn giữ, When nhịp `dispatch` chạy với `getWebhookInfo` trả 500, Then `zaloWebhookUrl` vẫn là U, đồng thời `zaloPolledAt` được ghi mới trong nhịp đó và hàng `ZaloUpdateSeen` cũ bị dọn — nhịp chạy trọn chứ không dừng giữa chừng.

## Coverage

Quét bằng skill `morphological-scan` ngày 2026-09-24. Bản đầy đủ ở
`_acceptance/noi-zalo-cho-nguoi-moi/morphological-scan.md`: 4 trục, khoảng 60 ô có
nghĩa, cắt còn 12 ô Core (khoảng 20%).

- Trục A — ai đứng trước màn: quản trị viên | thành viên thường | người mới | người đã nối | người rời xưởng [thước CE: `canManageConnections` + lái thử 23/09]
- Trục B — nguồn token và đường tin: `AppSetting` | `.env` | cả hai | không · https | http [thước CE: `capabilities.ts` + `[NGÀNH: Telegram setWebhook chỉ nhận https]`]
- Trục C — sự kiện: lưu đúng | sai dạng | Zalo từ chối | dán nhầm Secret Token | webhook rơi | nhắn mã | nhắn chữ khi đã nối | gửi thử | DB lỗi giữa chừng | gỡ thành viên [thước CE: lái thử 23/09 + Ngoài-3/Ngoài-4 vòng 1]
- Trục D — màn: Kết nối › Zalo | Thông báo của bạn | trong Zalo [thước CE: `docs/connections.md`, hồ sơ `nhac-qua-zalo`]
- Ánh xạ Core → tiêu chí: lưu token → AC-1, AC-13 · token sai → AC-2, AC-13 · http → AC-3 · quyền → AC-4 · nguồn token → AC-5 · trạng thái webhook (Ngoài-4) → AC-6 · tin lỗi (Ngoài-3) → AC-7, AC-8 · bot nhận ra người → AC-9 · gửi thử → AC-10 · rời xưởng → AC-11 · tên bot → AC-12 · màn người mới và ba lỗi chữ → AC-14 · không làm hỏng vòng đã ký, tài liệu → AC-15
- `[GIẢ ĐỊNH]` chờ người gạch:
  - (1) `getWebhookInfo` khi đã đặt webhook trả `{ok: true, result: {url, …}}` theo tài liệu Zalo. Mới đo được ca 404 (chưa đặt) trên bot thật; ca có URL cần https công khai.
  - (2) Zalo gửi lại tin khi webhook trả mã khác 2xx — kế thừa vòng 1, nay AC-7 dựa hẳn vào nó: không gửi lại thì tin gặp DB lỗi vẫn mất, chỉ khác là có log và mã 500.
  - (3) Trên Vercel, gốc URL tác tử thấy trong yêu cầu cầu nối là tên miền `AGENT_URL` mà API gọi, không phải URL riêng của từng lần triển khai. Sai thì webhook trỏ vào bản triển khai cũ; kiểm ở hàng T bằng `getWebhookInfo`.

## Out of scope

- Nút «Gỡ bot», mã hoá token trong DB, giới hạn tần suất «Gửi thử».
- Mã QR, đường dẫn mở thẳng bot, nối đảo chiều — Zalo không có deep link; chủ kho giữ mã 6 số.
- Báo quản trị viên qua email hay Slack khi webhook rơi.
- Trả lời tin nhắc, hỏi CRM qua Zalo — vòng 3 và 4.
- Chạy `migration` ở production, chọn bot công ty — hàng T của lộ trình.

## Notes

- Token và khoá webhook nằm chữ trơn trong `AppSetting`, như khoá nghiên cứu (chủ
  kho chọn 24/09). Ai đọc được DB là đọc được token bot.
- Đăng ký lại luôn sinh khoá mới; khoá cũ hết hiệu lực ngay.
- `ZALO_BOT_TOKEN` và `ZALO_WEBHOOK_SECRET` trong `.env` còn dùng được, nhưng thua
  giá trị trên màn. Bot thử tại máy vẫn chạy `zalo:poll`.
- Block ReUI Pro (settings-8, settings-12, onboarding-2) chỉ là tham chiếu bố cục;
  `@reui/stepper` là component miễn phí cài vào `packages/ui` ở S3.
- Chip riêng «Sửa ba lỗi giao diện Zalo thấy khi lái thử» (23/09) chưa ai mở; vòng
  này làm luôn ba lỗi đó, nên chip ấy bỏ được.
- AC-16, AC-17, AC-18 thêm sau Cổng Bằng chứng vòng 1 (chủ kho nâng phạm vi
  Ngoài-4, Ngoài-5, Ngoài-8, 2026-09-24).
- Ngoài-6 (lỗi từ Zalo hay tác tử hiện thành câu «Tác tử chưa nối được», API không
  ghi log) tách sang một hợp đồng riêng.

### Known limits (Cổng Bằng chứng vòng 1, 2026-09-24)

- Ngoài-1: mọi lỗi cầu nối (thiếu cầu nối, tác tử trả mã khác 2xx, lỗi mạng, phản
  hồi sai khuôn) đều thành cùng một câu «Tác tử chưa nối được»; mã khác 2xx không
  được ghi log.
- Ngoài-2: quy tắc dạng Bot Token viết ở hai nơi (`apps/api/src/zalo/zalo.config.ts`,
  `apps/app/lib/nhac-qua-zalo-man.ts`), chưa nằm trong schema đầu vào của tRPC.
- Ngoài-3: `docs/api.md` chưa ghi việc gỡ thành viên nay xoá hẳn liên kết Zalo, mã
  nối và lựa chọn kênh (cho phép lại không khôi phục).
- Ngoài-7: năng lực «Zalo reminders» trong `capabilities.ts` vẫn chỉ đọc
  `ZALO_BOT_TOKEN`, nên báo tắt khi token chỉ dán trên màn.
- Ngoài-9: ma trận sáu ô của E20 vẫn đạt khi một ô không có dòng, và khẳng định
  «đủ 6 ô» là hằng đúng.
- Ngoài-10: vế cấm «sửa .env rồi khởi động lại» của `rang/tai-lieu.mjs` chưa từng
  được chứng minh đỏ.
- Ngoài-11: E24 hứa một đối chứng đỏ nhưng lệnh chỉ chạy trên hai trang thật.
- Ngoài-12: E2 đọc `zalo.xuong` trên hàng `AppSetting` do tác tử giả trong test ghi,
  không phải bên ghi thật (E23 phủ chỗ nối thật).
- Ngoài-13: khẳng định «token không về trình duyệt» trên kết quả `luuBot` rỗng
  nghĩa khi `luuBot` thất bại.
