---
schema_version: 1
feature: Bot Zalo nhận tin qua webhook — tin mã tới là nối ngay, không còn mất giữa hai nhịp cron; cron chỉ kiểm bot sống; hai lệnh tay đăng ký webhook và đọc tin cho bot thử
slug: zalo-qua-webhook
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, config, docs]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-24-zalo-qua-webhook-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-24T01:36:20Z
---

# Acceptance Contract: zalo-qua-webhook

## Context

Bản `nhac-qua-zalo` (#94) đọc tin Zalo bằng `getUpdates` trong cron mỗi phút,
mỗi lời gọi mở 1 giây. Lái thử bot thật ngày 2026-09-23 đo được: Zalo chỉ giao
tin cho lời gọi đang mở, nên tin mã rơi mất và không ai nối được. Tác tử chạy
serverless nên không có vòng đọc sống lâu. Đường sửa là webhook, qua một custom
eve channel trong `apps/agent`.

Người dùng là nhân viên OneHub nối Zalo để nhận nhắc buổi sáng. Người vận hành
là chủ kho: đăng ký webhook cho bot công ty, và dùng vòng tay cho bot thử tại máy.

Source input: `docs/plan/lo-trinh-zalo.md` vòng 1 · lái thử 2026-09-23 · thiết kế
chủ kho duyệt trong chat 2026-09-24 · design doc ở `design_doc`.

## Criteria

- AC-1: Given `ZALO_BOT_TOKEN` và `ZALO_WEBHOOK_SECRET` có, U có mã nối còn sống, When `POST /zalo/webhook` đến với header `X-Bot-Api-Secret-Token` đúng và thân là tin chữ của người Zalo Z (cuộc trò chuyện `PRIVATE`) chứa mã đó, Then phản hồi 200; đọc lại từ DB có đúng một `ZaloLink` (U, Z) mang `display_name` của Z, mã có `usedAt`, có một hàng `ZaloUpdateSeen` cho `message_id` đó; và có đúng một `sendMessage` tới Z chứa tên CRM của U.
- AC-2: Given hai biến có, When `POST /zalo/webhook` đến với thân là tin mang mã sống của U và header lần lượt là: không có; có mặt nhưng rỗng; sai cùng độ dài với khoá đúng; sai với độ dài 1 ký tự; sai với độ dài 300 ký tự, Then mỗi lần phản hồi 403 và không ném; thân request không bị đọc; không có hàng `ZaloLink`, `ZaloUpdateSeen` hay `ZaloLinkAttempt` mới; không có lời gọi nào tới Zalo; và mã của U vẫn sống.
- AC-3: Given thiếu `ZALO_WEBHOOK_SECRET`, hoặc thiếu `ZALO_BOT_TOKEN`, trong môi trường của tiến trình, When nạp kênh Zalo và `POST /zalo/webhook` đến với bất kỳ header nào, Then việc nạp kênh không ném, phản hồi 404, thân không bị đọc, không có hàng mới nào và không có lời gọi nào tới Zalo.
- AC-4: Given hai biến có, U có mã sống, When cùng một tin (cùng `message_id`, chứa mã của U) đến qua webhook hai lần, rồi một lần nữa qua vòng tay `zalo:poll`, Then cả hai lần webhook đều trả 200; chỉ có một `ZaloLink` (U, Z), một hàng `ZaloUpdateSeen` và một `sendMessage` cho tin đó.
- AC-5: Given hai biến có và khoá đúng, When thân webhook lần lượt là: không phải JSON; JSON sai khuôn nhưng có `message_id`; `{event_name, message}` không có vỏ `ok`/`result`; tin mang mã sống từ người có `is_bot` true; và tin mang mã sống trong cuộc trò chuyện `GROUP`, Then mọi lần đều trả 200; không lần nào tạo `ZaloLink`, `ZaloUpdateSeen` hay `ZaloLinkAttempt`, và không lần nào có `sendMessage`; mỗi lần thân sai khuôn ghi một dòng log chứa danh sách khoá cấp đầu của thân, và lần có `message_id` thì chứa cả `message_id` đó; mã của U vẫn sống.
- AC-6: Given hai biến có và khoá đúng, When người Zalo Z gửi qua webhook lần lượt: một mã sai; một tin chữ không phải 6 số; một tin không có chữ (ảnh); rồi mã sống của U sau khi Z đã sai đủ `ZALO_LIEN_KET.doMa.toiDa` lần trong cửa sổ, Then mã sai tăng bộ đếm sai của Z thêm một và nhận câu `ZALO.loi.huongDan`; tin chữ và tin ảnh mỗi tin nhận câu hướng dẫn, không tăng bộ đếm; lần mang mã sống lúc đang bị chặn không tạo liên kết và không có câu trả lời; mọi lần đều trả 200.
- AC-7: Given lịch `dispatch` mỗi phút, When hàm `run` của chính lịch đó chạy với một Zalo giả thay mạng, trong ba trường hợp: (a) token có và `getMe` thành công, (b) token có và `getMe` trả 401, (c) không token, Then không trường hợp nào có lời gọi `getUpdates`; (a) có đúng một `getMe`, và `zaloBotName` là tên bot, `zaloPolledAt` không cũ hơn lúc bắt đầu nhịp; (b) nhịp không ném và `zaloBotName` null; (c) không có lời gọi nào tới Zalo và `zaloBotName` null.
- AC-8: Given Zalo giả chỉ giao tin cho lời gọi `getUpdates` đang mở, và tin mang mã sống của U đến ở giây thứ 30 của đồng hồ ảo, When đọc theo ba đường trên cùng dữ liệu: (a) nhịp kiểu #94, mở 1 giây ở giây 0, 60, 120; (b) vòng tay `zalo:poll`, mở `ZALO.pollTay.timeoutGiay` giây liên tục; (c) tin đó đến qua webhook, Then (a) không tạo `ZaloLink` và không có `sendMessage`, tái hiện lỗi của #94; (b) và (c) mỗi đường tạo đúng một `ZaloLink` (U, Z).
- AC-9: Given lệnh `zalo:webhook`, When chạy (a) với URL `https://` và hai biến có, (b) với cờ `--xoa`, (c) với URL `http://`, (d) thiếu `ZALO_WEBHOOK_SECRET`, (e) thiếu `ZALO_BOT_TOKEN`, Then (a) có đúng một `setWebhook` mang `url` đó và `secret_token` bằng `ZALO_WEBHOOK_SECRET`, và kết quả in ra chứa `verification.outcome` Zalo trả về; (b) có đúng một `deleteWebhook` và không `setWebhook` nào; (c), (d), (e) — chạy bằng đúng lệnh `bun run zalo:webhook` trong `apps/agent` — tiến trình thoát mã khác 0, stderr gọi đích danh thứ sai hay thiếu, và không có lời gọi nào tới Zalo; và lệnh `bun run zalo:poll` chạy khi thiếu `ZALO_BOT_TOKEN` cũng thoát mã khác 0 với stderr gọi tên biến đó.
- AC-10: Given kho sau vòng này, When đọc `.env.example`, `docs/environment.md`, `turbo.json` và `apps/agent/turbo.json`, Then `.env.example` và `docs/environment.md` có `ZALO_WEBHOOK_SECRET` kèm ghi chú; `globalPassThroughEnv` của `turbo.json` có `ZALO_BOT_TOKEN` và `ZALO_WEBHOOK_SECRET`, còn `globalEnv` không có biến Zalo nào; `passThroughEnv` của `dev` và `dev:headless` trong `apps/agent/turbo.json` có cả hai; và `.env.example` chỉ nơi tạo bot là OA «Zalo Bot Manager» trong app Zalo, không còn chỉ tạo bot ở `bot.zaloplatforms.com`.
- AC-11: Given kênh mặc định export từ `apps/agent/agent/channels/zalo.ts`, When tìm route có `method` `POST` và `path` `/zalo/webhook` rồi gọi handler của nó với tin của AC-1 và khoá đúng, rồi với khoá sai, Then route đó tồn tại đúng một, lần khoá đúng tạo `ZaloLink` như AC-1, và lần khoá sai trả 403. (cross-layer)
- AC-12: Given các phép đo đã ký của `nhac-qua-zalo` (`apps/agent/test/nhac-qua-zalo.integration.spec.ts`), When chạy trọn tệp đó ở đỉnh nhánh của vòng này, Then mọi ca xanh, và tệp đó không có thay đổi nào so với `merge-base` của nhánh với `onehub`.

## Coverage

Quét bằng skill `morphological-scan` ngày 2026-09-24, trục dựng lại. Bản đầy đủ ở
`_acceptance/zalo-qua-webhook/morphological-scan.md`: 4 trục, khoảng 55 ô có
nghĩa, cắt còn 11 ô Core (khoảng 20%).

- Trục A — đường tin vào: webhook | vòng tay `zalo:poll` | nhịp cron cũ [thước CE: `[NGÀNH: Zalo — getUpdates và webhook loại trừ nhau]`]
- Trục B — cổng vào: đủ | khoá sai | thiếu header | thiếu `ZALO_WEBHOOK_SECRET` | thiếu `ZALO_BOT_TOKEN` [thước CE: `[NGÀNH: Telegram Bot API secret_token]` + `capabilities.ts`]
- Trục C — loại tin: mã sống | mã sai | chữ | không chữ | trùng | hỏng | từ bot | từ nhóm | đang bị chặn [thước CE: luật mã của `nhac-qua-zalo` AC-7 tới AC-11]
- Trục D — nhịp và vận hành: trong cửa sổ | ngoài cửa sổ | cron kiểm bot | đăng ký | gỡ | URL http [thước CE: lái thử bot thật 2026-09-23]
- Ánh xạ Core → tiêu chí: nối qua webhook → AC-1, AC-11 · cổng → AC-2, AC-3 · trùng → AC-4 · tin bỏ qua → AC-5 · luật mã → AC-6 · cron → AC-7 · luật giao tin → AC-8 · lệnh tay → AC-9 · biến → AC-10 · không làm hỏng lượt đã ký → AC-12
- `[GIẢ ĐỊNH]` chờ người gạch:
  - (1) Zalo gửi lại tin khi webhook trả mã khác 2xx — vì thế thân hỏng trả 200.
  - (2) Thân webhook cùng khuôn với `getUpdates`, và tên header là
    `X-Bot-Api-Secret-Token`. Theo tài liệu Zalo, chưa đo trên bot thật vì máy
    không có URL công khai. Phần `message` của fixture chép từ phản hồi
    `getUpdates` thật ngày 2026-09-23, nên chỉ phần vỏ và header là chưa đo. Sai
    ở đây thì mọi tin rơi vào nhánh 200 + log, hoặc bị trả 403; log in danh sách
    khoá của thân để thấy ngay khi triển khai.

## Out of scope

- Dấu «đã đăng ký webhook» trên trang kết nối — vòng 2 (`getWebhookInfo` trả 404 khi chưa đặt, dạng phản hồi chưa đo được).
- Mọi thay đổi giao diện, kể cả ba lỗi chữ đã thấy khi lái thử — vòng 2.
- Trả lời tin nhắc, mô hình AI, hỏi CRM qua Zalo — vòng 3 và 4.
- Nối Zalo trong nhóm; tin ảnh hay giọng nói mang nghĩa gì với bot.
- Đăng ký webhook cho bot công ty ở production — hàng T của lộ trình, do chủ kho làm.

## Notes

- Tin từ cuộc trò chuyện `GROUP` bị bỏ qua là hành vi mới so với #94. Lý do: bot
  có `can_join_groups: true`, nên câu «Đã nối với <tên CRM>» trả trong nhóm sẽ lộ
  tên cho cả nhóm.
- `pollZalo` giữ nguyên hành vi, TRỪ một điều: nó dùng chung lõi với webhook nên
  cũng bỏ qua tin nhóm. Các phép đo đã ký của `nhac-qua-zalo` đo trên nó, và AC-12
  giữ chúng xanh mà không sửa tệp test. Vòng tay `zalo:poll` là `pollZalo` chạy
  liên tục với timeout dài hơn.
- Sau khi triển khai (hàng T của lộ trình), phải gửi một tin thật tới bot công ty
  và thấy một hàng `ZaloUpdateSeen` mới. Đó là phép đo duy nhất chạm được giả
  định (2) ở Coverage; nó chưa phải một AC vì vòng này chưa có URL công khai.
- Một bot không chạy được webhook và `getUpdates` cùng lúc. Bot đã đăng ký webhook
  thì vòng tay không nhận được gì cho tới khi gỡ bằng `zalo:webhook --xoa`.

### Known limits (Cổng Bằng chứng vòng 1, 2026-09-24)

- Ngoài-2: hằng mã HTTP của webhook khai tại chỗ trong `zalo-webhook.ts`, chưa
  nằm trong `ZALO`.
- Ngoài-5: vòng tay `zalo:poll` dùng một mốc giờ cho cả lượt, lượt có thể dài tới
  khoảng 10 phút; hạn mã và cửa sổ chặn tính theo mốc đó. Chỉ ảnh hưởng bot thử.
- Ngoài-6: E9 chứng minh lệnh không gọi mạng bằng cách kiểm stderr không có
  `error_code`, không có đối chứng dương.
- Ngoài-7: E5 kiểm dòng log bằng chuỗi có mặt.
- Ngoài-8: vỏ thân webhook trong test viết theo mẫu tài liệu Zalo (giả định (2)).
- Chưa phân loại: nhánh `pollZalo` của E4 chỉ đo «không trả lời thêm», không
  chứng minh vòng đọc đã nhận lại tin trùng.
- Chuyển sang vòng 2 (`noi-zalo-cho-nguoi-moi`): Ngoài-3 (tin lỗi giữa chừng mất
  hẳn vì đã đánh dấu đã thấy mà vẫn trả 200) và Ngoài-4 (trang báo bot sống chỉ dựa
  vào `getMe`).

- Known limits — chọn ở Cổng Bằng chứng 2026-10-14:
  - Ngoài-1: hằng mã HTTP của webhook khai tại chỗ trong `zalo-webhook.ts`, chưa nằm trong `ZALO`.
  - Ngoài-4: vòng tay `zalo:poll` dùng một mốc giờ cho cả lượt dài nhiều phút, nên hạn mã và cửa sổ chặn tính theo mốc đó; chỉ ảnh hưởng bot thử.
  - Ngoài-5: vỏ thân webhook và phản hồi `setWebhook` của Zalo giả dựng theo khuôn bên đọc, chưa đối chiếu với tin Zalo thật.

