---
schema_version: 1
feature: Webhook Zalo đọc được thân thật {event_name, message} mà production gửi (và vẫn đọc khuôn có vỏ ok/result theo tài liệu), để người nhắn mã cho bot được nối và nhận trả lời; Zalo giả của test dựng khuôn thật
slug: zalo-webhook-doc-khuon-that
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, docs]
status: approved
design_doc: docs/superpowers/specs/2026-09-25-zalo-webhook-doc-khuon-that-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-24T22:57:51Z
---

# Acceptance Contract: zalo-webhook-doc-khuon-that

## Context

Bot Zalo production không nối được ai. `vercel logs` của tác tử ngày 2026-09-25
(05:22–05:25 giờ VN) ghi bốn lượt `POST /zalo/webhook` khoá đúng, lượt nào cũng
`[zalo] webhook sai khuon khoa=event_name,message message_id=?`. Thân thật không có
vỏ `{ok, result}`; bộ đọc dùng khuôn của `getUpdates` nên bỏ mọi tin, trả 200. Chủ kho
nhắn mã 6 số cho «Bot OneHub 1» và không nhận được gì; Kết nối › Zalo báo 0/11 người
đã nối. Nguồn: giả định (2) và Ngoài-8 của `zalo-qua-webhook` — thân webhook viết theo
tài liệu Zalo, chưa đo trên bot thật.

Người dùng: thành viên nhắn mã cho bot để nối Zalo. Người vận hành: đọc log tác tử.
Source input: prompt của chủ kho 25/09 · log production 25/09 · design doc ở
`design_doc` · quyết định (A) của chủ kho trong brainstorm 25/09.

## Criteria

- AC-1: Given thành viên U và V mỗi người có một mã sống, khoá webhook đúng, When webhook nhận tin mang mã của U ở khuôn thật `{event_name, message}` từ Zalo Z1, và tin mang mã của V ở khuôn có vỏ `{ok: true, result: {event_name, message}}` từ Zalo Z2 (phần `message` của cả hai dựng từ phản hồi `getUpdates` thật trong `apps/agent/test/fixtures/zalo-tin-that.json`), Then cả hai lượt trả 200; U nối với Z1 và V nối với Z2 (đọc lại `ZaloLink` từ DB, gồm tên hiển thị); hai mã đã dùng; mỗi `message_id` đúng một hàng `ZaloUpdateSeen`; Z1 và Z2 mỗi người nhận đúng một `sendMessage` mang tên CRM của mình.
- AC-2: Given U có mã sống, When cùng một tin (cùng `message_id`, mang mã của U) tới webhook hai lần — lần đầu ở một khuôn, lần hai ở khuôn kia — theo cả hai thứ tự (thật rồi có vỏ, có vỏ rồi thật), Then mỗi thứ tự cho đúng một `ZaloLink` của U, đúng một hàng `ZaloUpdateSeen` cho `message_id` đó, đúng một `sendMessage`, và cả hai lượt trả 200.
- AC-3: Given khoá đúng, When thân webhook lần lượt là (a) không phải JSON; (b) khuôn thật mà `message` thiếu `from.id`, `text` là một chuỗi đánh dấu; (c) khuôn có vỏ mà `result.message` thiếu `from`, `text` là chuỗi đánh dấu; (d) JSON `{"event_name":"x"}` không có `message` lẫn `result`, Then mọi lượt trả 200; không lượt nào tạo `ZaloLink`, `ZaloUpdateSeen`, `ZaloLinkAttempt` hay gọi `sendMessage`; mỗi lượt in đúng một dòng `console.error` bắt đầu `[zalo] webhook sai khuon`, trong đó trường `khoa` bằng đúng danh sách khoá cấp đầu của thân, trường `khoa_message` bằng đúng danh sách khoá của `message` (b) hay `result.message` (c) và rỗng ở (a), (d), trường `message_id` bằng mã tin ở (b), (c) và `?` ở (a), (d); không dòng log nào chứa chuỗi đánh dấu.
- AC-4: Given Zalo giả của test, When dựng thân webhook bằng `thanWebhook` và `thanWebhookCoVo`, Then `thanWebhookCoVo(x).result` bằng `result` của fixture `getUpdates` thật (`zalo-tin-that.json`) sau khi thay đúng các trường định danh của `x`, `thanWebhook(x)` bằng `thanWebhookCoVo(x).result`, và khoá cấp đầu của `thanWebhook(x)` bằng danh sách khoá tách từ dòng log production 25/09 lưu trong `apps/agent/test/fixtures/zalo-webhook-log-that.txt`; When chạy trọn hai spec đã ký `zalo-qua-webhook.integration.spec.ts` và `noi-zalo-cho-nguoi-moi.integration.spec.ts` trên thân đó, Then cả hai xanh; và so với `merge-base` của `origin/onehub`, `noi-zalo-cho-nguoi-moi.integration.spec.ts` không đổi, còn `zalo-qua-webhook.integration.spec.ts` chỉ khác ở việc gỡ ca «c khong vo» của `webhook-bo-qua` (khối ca, khẳng định log của nó, số ca 5 → 4 và tên ca bỏ chữ «khong vo»).
- AC-5: Given nhánh này, When đọc `docs/agent.md` và bảng mục 7 của `docs/plan/lo-trinh-zalo.md`, Then mục «Zalo: webhook…» của `docs/agent.md` có một câu nêu thân thật `{event_name, message}` cùng chữ «không có vỏ», một câu nêu khuôn có vỏ `` `ok` ``/`` `result` `` vẫn được nhận, và nêu dòng log in `khoa_message`; bản `docs/agent.md` ở `merge-base` của `origin/onehub` không đạt các điều đó; bảng mục 7 có đúng một dòng cho `zalo-webhook-doc-khuon-that` với Trạng thái thuộc tập giá trị của mục đó.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix) —
`_acceptance/zalo-webhook-doc-khuon-that/morphological-scan.md`.

- Trục A · Vỏ thân: khuôn thật | khuôn có vỏ theo tài liệu | hỏng [thước CE: log production 25/09 + tài liệu Zalo + `[NGÀNH: Telegram Bot API — setWebhook]`]
- Trục B · Tin bên trong: mã sống | trùng `message_id` | luật cũ | `message` thiếu trường [thước CE: luật mã `nhac-qua-zalo` AC-7…AC-11, Trục C của `zalo-qua-webhook`]
- Trục C · Vật quan sát: DB + tin trả lời | mã HTTP | dòng log không mang nội dung [thước CE: `docs/agent.md` mục webhook]
- Ô → AC: mã sống × hai khuôn → AC-1 · trùng × hai khuôn → AC-2 · thiếu trường / hỏng → AC-3 · luật cũ × khuôn thật → AC-4 (chạy lại spec đã ký) · tài liệu → AC-5.
- Ô gạch: «hỏng» × mã sống / trùng / luật cũ — không có tin để xét.
- [GIẢ ĐỊNH] Các trường bên trong `message` của thân webhook thật (`from.id`, `display_name`, `is_bot`, `chat.id`, `chat_type`, `text`, `message_id`, `date`) giống phản hồi `getUpdates` thật 23/09. Log production chỉ cho thấy khoá cấp đầu. Sai ở đây thì tin rơi vào nhánh AC-3, và dòng log nay in khoá của `message` để đo được ở lượt thử đầu tiên trên production.
- [GIẢ ĐỊNH] Zalo có thể giao cùng một tin hai lần ở hai vỏ khác nhau (vì thế AC-2). Chưa thấy trên production; chống trùng theo `message_id` đã có, AC-2 chỉ ghim nó không phụ thuộc vỏ.

## Out of scope

- Đổi bộ đọc `getUpdates` (`parseZaloGetUpdates`) và vòng tay `zalo:poll` — phản hồi `getUpdates` thật có vỏ, đo 23/09.
- Chụp một thân webhook thật làm fixture — cần bot gửi tới máy có URL công khai.
- Lỗi TLS khi đọc DB ở nhịp dispatch, dòng năng lực `Zalo reminders` in `off` khi token chỉ dán trên màn (Ngoài-7 của `noi-zalo-cho-nguoi-moi`), giờ UTC ở «trả lời lần cuối» trên Kết nối › Zalo.
- Gọi `setWebhook`/`deleteWebhook` trên bot thật; thử lại trên production sau merge là bước tay của chủ kho.
- Sửa `_acceptance/` của `zalo-qua-webhook` hay `noi-zalo-cho-nguoi-moi`.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- **Thay một lời hứa đã máy thông.** Vòng này thay AC-5 ý (3) của `zalo-qua-webhook`
  («`{event_name, message}` không vỏ → bỏ qua»): production 25/09 cho thấy đó là khuôn
  thật. Theo quyết định (A) của chủ kho, ca «c khong vo» của `webhook-bo-qua` trong
  `apps/agent/test/zalo-qua-webhook.integration.spec.ts` bị gỡ (ma trận còn 4 ca);
  không sửa ca nào khác của tệp đó.
- Thước khoá `nzm_giu_da_ky` của hồ sơ `noi-zalo-cho-nguoi-moi` đỏ trên nhánh này
  cho tới khi merge, vì nó so tệp spec đã ký với `merge-base` của `origin/onehub`.
  Mốc đó dời sau merge. Văn bản `expected` của `zqw_webhook_bo_qua` trong hồ sơ đã ký
  còn tả 5 ca.
- Sau merge: chủ kho tạo mã mới ở Cài đặt › Thông báo, nhắn cho «Bot OneHub 1», rồi
  kiểm `vercel logs … --query zalo` — không còn dòng `webhook sai khuon`, và trang
  Kết nối › Zalo đếm thêm một người đã nối.
