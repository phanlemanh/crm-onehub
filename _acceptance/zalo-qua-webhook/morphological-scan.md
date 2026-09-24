# Quét không gian tiêu chí — zalo-qua-webhook

Chạy ngày 2026-09-24. Quét theo khuôn `morphological-scan`, dựng trục từ đầu vì
không preset nào khớp: đây là một đường nhận sự kiện, không phải một thực thể.

## Ngữ cảnh

- **Sản phẩm:** CRM OneHub. Bot Zalo gửi nhắc buổi sáng và nhận mã nối.
- **Chân sản phẩm:** đào từ repo.
  - `[SUY-TỪ-REPO: apps/agent/agent/lib/zalo-poll.ts]`
  - `[SUY-TỪ-REPO: apps/agent/agent/channels/crm.ts]`
  - `[SUY-TỪ-REPO: docs/plan/lo-trinh-zalo.md]`
- **Chân ngành:**
  - `[NGÀNH: Telegram Bot API — setWebhook secret_token, header X-Telegram-Bot-Api-Secret-Token]`
    (eve có sẵn kênh Telegram dựng đúng khuôn này:
    `apps/agent/node_modules/eve/docs/channels/telegram.mdx`);
  - `[NGÀNH: Zalo Bot Platform — tài liệu Webhook, setWebhook, getUpdates]`, đọc
    2026-09-23.

## Trục

- **Trục A — đường tin vào:** webhook | vòng tay `zalo:poll` | nhịp cron cũ (bỏ)
  - Thước CE: tài liệu `getUpdates` của Zalo nói hai cơ chế loại trừ nhau.
- **Trục B — cổng vào:** đủ khoá và token | khoá sai | thiếu header | thiếu
  `ZALO_WEBHOOK_SECRET` | thiếu `ZALO_BOT_TOKEN`
  - Thước CE: `[NGÀNH: Telegram]` kiểm khoá bí mật trước khi tin điều gì; và
    `apps/agent/agent/lib/capabilities.ts` (thiếu khoá thì mất năng lực).
- **Trục C — loại tin:** mã sống | mã sai, hết hạn hay đã dùng | chữ không phải
  số | không có chữ (ảnh, sticker) | trùng `message_id` | thân hỏng hoặc không
  phải JSON | từ bot | từ nhóm | người đang bị chặn
  - Thước CE: luật mã của `nhac-qua-zalo` (AC-7 tới AC-11) và các loại sự kiện
    trong tài liệu Webhook của Zalo.
- **Trục D — nhịp và vận hành:** tin đến trong cửa sổ đang mở | tin đến ngoài
  cửa sổ | cron kiểm bot (ok, 401, không token) | đăng ký webhook | gỡ webhook |
  URL không phải https
  - Thước CE: lần lái thử bot thật 2026-09-23, mất tin khi không có lời gọi mở.

## Core

Khoảng 55 ô có nghĩa; giữ lại 11 ô Core, khoảng 20%.

1. Webhook + đủ khoá + mã sống → nối, đọc lại từ DB → AC-1
2. Webhook + khoá sai hoặc thiếu header → 403, không đọc thân → AC-2
3. Thiếu biến nào → 404, không ném → AC-3
4. Trùng `message_id`, kể cả một lần qua webhook và một lần qua vòng tay → một
   lần → AC-4
5. Thân hỏng, không JSON, từ bot, từ nhóm → 200, không ghi → AC-5
6. Luật mã qua webhook (sai, chặn, chữ, không chữ) → AC-6
7. Cron chỉ kiểm bot, không `getUpdates` → AC-7
8. Tin đến ngoài cửa sổ: nhịp cũ mất, vòng tay và webhook bắt được → AC-8
9. Lệnh đăng ký và gỡ webhook, kể cả chặn URL http và biến thiếu → AC-9
10. Biến khai đủ mọi chỗ → AC-10
11. Route thật sự mount trên kênh → AC-11

## Later

- Dấu «đã đăng ký webhook» trên trang kết nối — vòng 2 (lưu token trên màn hình).
- Trả lời tin nhắc («xong 2») — vòng 3.
- Hỏi CRM qua Zalo — vòng 4.
- Tin ảnh hay giọng nói mang nghĩa gì với bot — vòng 4.

## Never

- Giữ nhịp `getUpdates` trong cron song song với webhook — hai cơ chế loại trừ
  nhau.
- Nối Zalo trong nhóm — lộ tên CRM cho cả nhóm.
- Đọc hay lưu nội dung tin ngoài mã — luật dữ liệu của `nhac-qua-zalo` giữ nguyên.

## Cross-cutting, áp cho mọi ô Core

- Không ô nào lưu văn bản người nhắn.
- Không ô nào ném lỗi ra khỏi route.
- Mọi ghi được đo bằng cách đọc lại từ DB.

## Giả định

- `[GIẢ ĐỊNH]` Zalo gửi lại tin khi webhook trả mã khác 2xx. Chưa có tài liệu,
  nên thân hỏng trả 200.
- `[NGÀNH: tài liệu Zalo]` Thân webhook có cùng khuôn với `getUpdates`: mẫu trong
  tài liệu giống hệt tin thật đo được ngày 2026-09-23.
