---
slug: zalo-webhook-doc-khuon-that
preset: test-matrix
at: 2026-09-25
---

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub — bot Zalo nhận mã nối qua `POST /zalo/webhook` của
  tác tử. Chân sản phẩm: đào repo —
  `[SUY-TỪ-REPO: apps/agent/agent/lib/zalo-webhook.ts]`,
  `[SUY-TỪ-REPO: apps/agent/agent/lib/zalo-nhan.ts]`,
  `[SUY-TỪ-REPO: packages/validation/src/zalo-update.ts]`,
  `[SUY-TỪ-REPO: apps/agent/test/support/zalo-tin.ts]`,
  `[SUY-TỪ-REPO: _acceptance/zalo-qua-webhook/contract.md]` (AC-5, giả định (2)).
- Chân ngành: `[NGÀNH: Telegram Bot API — setWebhook]` giao đối tượng Update thẳng
  trong thân POST, không bọc vỏ `ok`/`result` như phản hồi của `getUpdates`; Zalo Bot
  API chép khuôn Telegram (cùng `ok:false` + `error_code`, cùng header
  `X-…-Secret-Token`). Tài liệu Zalo (`bot.zaloplatforms.com/docs/webhook/`) mô tả
  thân CÓ vỏ — lệch với log production 2026-09-25 (khoá cấp đầu `event_name,message`).

## Trục

- **A. Vỏ thân**: khuôn thật `{event_name, message}` | khuôn có vỏ theo tài liệu
  `{ok:true, result:{event_name, message}}` | hỏng (không JSON, JSON không khớp khuôn
  nào). [thước CE: log production 25/09 + tài liệu Zalo + Telegram Bot API]
- **B. Tin bên trong**: mã sống từ người, chat riêng | cùng `message_id` tới lần hai |
  luật cũ (mã sai, từ bot, từ nhóm, không chữ, người đã nối) | `message` thiếu trường.
  [thước CE: luật mã của `nhac-qua-zalo` AC-7…AC-11 và `zalo-qua-webhook` Trục C]
- **C. Vật quan sát**: kết cục trong DB và tin trả lời | mã HTTP | dòng log (khoá, không
  nội dung tin). [thước CE: `docs/agent.md` mục webhook — «log in khoá cấp đầu và
  message_id»; luật «không lưu, không log nội dung tin»]

## Không gian (A × B, mỗi ô xét đủ C)

| | mã sống | trùng `message_id` | luật cũ | `message` thiếu trường |
|---|---|---|---|---|
| khuôn thật | ô 1 — hôm nay bị bỏ qua (lỗi production) | ô 2 | ô 3 — spec đã ký chỉ chạy trên khuôn có vỏ | ô 4 |
| khuôn có vỏ | ô 5 — đang chạy | ô 6 | ô 7 — đã đo ở spec đã ký | ô 8 — đã đo (ca «b sai khuon») |
| hỏng | gạch — không có tin | gạch | gạch | ô 9 — ca «a khong-json» đã đo; JSON không khớp khuôn nào chưa đo |

## Core

1. Ô 1 + ô 5 — cả hai khuôn nối được mã, ra cùng một kết cục (AC-1).
2. Ô 2 + ô 6 — cùng một tin tới lần hai ở khuôn KHÁC vẫn chỉ nối và trả lời một lần:
   chống trùng không được phụ thuộc vỏ (AC-2).
3. Ô 4 + ô 8 + ô 9 — thân không khớp khuôn nào vẫn trả 200, không ghi, và dòng log gọi
   đủ khoá để lần sau đo được, không mang nội dung tin (AC-3).
4. Ô 3 — Zalo giả dựng khuôn thật làm mặc định, để mọi luật đã ký chạy lại trên khuôn
   production (AC-4).

## Later

- Chụp một thân webhook thật (không nội dung) làm fixture — cần bot thật gửi tới máy có
  URL công khai; lượt này suy phần `message` từ phản hồi `getUpdates` thật 23/09.

## Never

- Đổi bộ đọc `getUpdates` (`parseZaloGetUpdates`) — phản hồi `getUpdates` thật có vỏ,
  đã đo 23/09; vòng tay `zalo:poll` đang đúng.
- Trả mã khác 200 cho thân hỏng — Zalo gửi lại vô hạn một thân sẽ không bao giờ đọc
  được (giả định (1) của `zalo-qua-webhook`).

## Cross-cutting áp mọi ô Core

- Không log, không lưu nội dung tin.
- Khoá sai vẫn 403 trước khi đọc thân — không đổi.
