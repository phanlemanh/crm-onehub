# zalo-qua-webhook — thiết kế

Vòng 1 của `docs/plan/lo-trinh-zalo.md`. Chủ kho duyệt thiết kế trong chat ngày
2026-09-24: chọn ngả A, trả 200 khi thân tin hỏng, và hoãn dấu «đã đăng ký
webhook» sang vòng 2.

## 1. Vấn đề

Bản `nhac-qua-zalo` (#94) đọc tin bằng `getUpdates` trong cron mỗi phút, mỗi lời
gọi mở 1 giây (`ZALO.poll.timeoutGiay`). Lái thử bot thật ngày 2026-09-23 đo được
ba điều:

- Zalo chỉ giao tin cho một lời gọi **đang mở** đúng lúc tin đến. Tin đến lúc không
  có lời gọi nào mở thì mất, và Zalo không giữ lại.
- Hệ quả là tin mã người dùng nhắn gần như luôn rơi vào khoảng trống giữa hai lời
  gọi.
- Khi chạy vòng đọc liên tục, mỗi lời gọi mở 30 giây, thì mã tới trong vòng một
  giây và nối được.

Tác tử chạy serverless trên Vercel, cron mỗi phút, nên không thể có một vòng đọc
sống lâu. Theo tài liệu Zalo, webhook là đường cho production, và webhook với
`getUpdates` loại trừ nhau.

## 2. Ngả đã chọn

- **A — chọn.** Một custom eve channel `apps/agent/agent/channels/zalo.ts`, route
  `POST /zalo/webhook`. Custom route mount thẳng dưới địa chỉ tác tử, như
  `/internal/crm/verify-key` mà `apps/api/src/agent/research-key.service.ts` gọi
  qua `agent.url(...)`. Chỉ tác tử gọi Zalo, và bot phải nhắn trả lời, nên nơi
  nhận tin phải là tác tử.
- **B — loại.** Route trong `apps/api`: API không được gọi dịch vụ ngoài
  (AGENTS.md, «Intelligence lives in `apps/agent`»).
- **C — loại.** Một hàm Vercel riêng: thêm một bản triển khai thứ hai phải trông.

## 3. Cách chạy

```
Zalo ── POST /zalo/webhook ──> channels/zalo.ts ──> nhanWebhook(request)
           header X-Bot-Api-Secret-Token             │
                                                     ├─ thiếu ZALO_WEBHOOK_SECRET hoặc ZALO_BOT_TOKEN → 404
                                                     ├─ khoá sai hoặc vắng → 403 (không đọc thân)
                                                     ├─ thân hỏng, không JSON → 200 + log
                                                     └─ tin hợp lệ → xuLyTinDen() → 200
                                                          (chung với zalo:poll)
```

1. `nhanWebhook` so header với `ZALO_WEBHOOK_SECRET`. Nó băm SHA-256 cả hai phía
   rồi mới so bằng `timingSafeEqual`, nên header dài hay ngắn bao nhiêu cũng không
   làm hàm ném; phần còn lại theo khuôn `authorised()` của `channels/crm.ts`.
   - Chưa có biến nào của Zalo → **404**. Tính năng coi như tắt, không ném lỗi
     (luật «thiếu khoá là mất năng lực»).
   - Sai khoá → **403**, và thân tin không được đọc.
2. Thân tin được phân tích bằng `parseZaloGetUpdates`. Theo tài liệu Zalo, thân
   webhook có cùng khuôn `{ok, result: {event_name, message}}` với `getUpdates`.
   - Thân hỏng vẫn trả **200**, để Zalo không gửi lại liên tục. Kèm một dòng log
     in danh sách khoá cấp đầu của thân, và `message_id` nếu đọc được. Như vậy,
     nếu vỏ thật khác mẫu tài liệu thì nhìn log là thấy ngay.
3. Tin hợp lệ đi vào `xuLyTinDen(token, message, deps)`, lõi dùng chung với
   `zalo:poll`. Lõi này tách ra từ `zalo-poll.ts` hiện có:
   - bỏ qua tin từ bot và tin từ cuộc trò chuyện không phải `PRIVATE`;
   - chống trùng bằng `ZaloUpdateSeen`;
   - chống dò mã bằng `dangBiChan`;
   - nối bằng `noiBangMa`; mã sai, hết hạn hay đã dùng thì `ghiSai`;
   - bot trả lời bằng các câu trong `ZALO.loi`.

   Tin từ nhóm bị bỏ qua là điều mới so với #94. Bot đang có
   `can_join_groups: true`, nên nếu trả lời «Đã nối với <tên CRM>» trong một nhóm
   thì tên đó lộ ra cho cả nhóm.
4. Xử lý chạy ngay trong request: vài truy vấn DB và một `sendMessage`.

## 4. Cron và lệnh tay

- `schedules/dispatch.ts` thay `pollZalo()` bằng `kiemBot()`: chỉ gọi `getMe`,
  ghi `zaloBotName` và `zaloPolledAt`. Không token thì ghi null và không gọi mạng.
  `getMe` lỗi thì ghi null và không ném. Trang kết nối giữ nguyên nghĩa: «im» là
  `zaloPolledAt` cũ hơn `ZALO_LIEN_KET.imSauMs`.
- `pollZalo()` giữ lại cho lệnh tay:
  - `bun run --filter=agent zalo:poll` là vòng `pollZalo` liên tục, mỗi lời gọi
    mở `ZALO.pollTay.timeoutGiay` (30 giây). Dùng cho bot thử tại máy, là bot chưa
    đặt webhook.
  - Các phép đo của `nhac-qua-zalo` đo trên `pollZalo`, nên hành vi của nó không
    đổi, trừ một điều: tin nhóm bị bỏ qua, vì lõi dùng chung với webhook. AC-12
    giữ các phép đo đã ký xanh mà không sửa tệp test của chúng.
- `bun run --filter=agent zalo:webhook <url>` gọi `setWebhook` với `{url,
  secret_token}` rồi in `verification.outcome`. Cờ `--xoa` gọi `deleteWebhook`.
  URL không phải `https://`, hoặc thiếu biến nào, thì dừng với thông điệp gọi
  tên thứ thiếu và không gọi Zalo.

## 5. Biến môi trường

- `ZALO_WEBHOOK_SECRET` (8–256 ký tự) là mới. Khai ở `.env.example` và
  `docs/environment.md`. Chỉ tác tử đọc nó, nên không vào `env.validation.ts`.
- Cả `ZALO_BOT_TOKEN` và `ZALO_WEBHOOK_SECRET` được khai:
  - trong `globalEnv` của `turbo.json`;
  - trong `passThroughEnv` của `dev` và `dev:headless` ở `apps/agent/turbo.json`.

  Việc này sửa Ngoài-3 của `nhac-qua-zalo`.
- `.env.example` sửa dòng hướng dẫn: bot tạo trong app Zalo, qua OA «Zalo Bot
  Manager».

## 6. Zalo giả mang luật giao tin

`apps/agent/test/support/zalo-gia.ts` thêm chế độ `chiGiaoKhiMo`, chạy trên một
đồng hồ ảo:

- Mỗi tin có giờ đến.
- Một lời gọi `getUpdates` lúc T, với timeout t giây, trả tin sớm nhất có giờ đến
  trong khoảng [T, T+t]. Có tin thì đồng hồ nhảy tới giờ đến của tin. Không có
  tin thì đồng hồ nhảy tới T+t, và lời gọi trả 408.
- Tin có giờ đến trước T mất hẳn.

Nhờ vậy cùng một bộ dữ liệu thử tái hiện được lỗi của #94 (nhịp mỗi 60 giây, mở 1
giây), và chứng minh được vòng tay 30 giây liên tục cùng webhook đều bắt được tin.
Chế độ mặc định của giả vẫn giữ nguyên, nên các phép đo cũ không đổi.

Phần `message` của mọi tin thử lấy từ `apps/agent/test/fixtures/zalo-tin-that.json`.
Tệp này chép khuôn từ phản hồi `getUpdates` thật ngày 2026-09-23 (khoá, lồng,
kiểu, giá trị `chat_type` và `event_name`), chỉ thay các giá trị định danh. Vỏ
webhook `{ok: true, result}` lấy theo mẫu tài liệu Zalo, và là phần duy nhất chưa
đo trên bot thật. Hợp đồng gọi đó là giả định (2).

## 7. Hoãn và loại

- **Dấu «đã đăng ký webhook»:** hoãn sang vòng 2. `getWebhookInfo` trả `404 Not
  Found` khi bot chưa đặt webhook (đo ngày 2026-09-24), nên dạng phản hồi chưa
  biết. Vòng 2 lưu token trên màn hình và tự đăng ký webhook, nên sẽ biết trạng
  thái đăng ký mà không phải đoán.
- **Ngoài phạm vi:** mô hình AI, trả lời tin nhắc, mọi thay đổi giao diện.
- **Không đặc tả UX, không design-pass:** vòng này không chạm màn hình nào.

## 8. Triển khai (không thuộc hợp đồng)

1. Đặt `ZALO_WEBHOOK_SECRET` trên project Vercel của tác tử.
2. Chạy `zalo:webhook https://<tên miền tác tử>/zalo/webhook`.
3. Đọc `verification.outcome`: `webhook.ok` là chạy được.

Đây là việc của hàng T trong lộ trình, do chủ kho làm.
