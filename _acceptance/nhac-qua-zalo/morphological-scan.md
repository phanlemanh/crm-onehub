---
slug: nhac-qua-zalo
at: 2026-09-23
preset: entity-feature (trục dựng lại)
---

# Quét độ phủ — nhac-qua-zalo

## Ngữ cảnh

- Sản phẩm: CRM nội bộ của OneHub, một xưởng, nhân viên nhận nhắc việc 30 ngày đầu
  mỗi sáng. Chân sản phẩm: đào repo — `apps/agent/agent/lib/nhac-ke-hoach.ts`,
  `apps/agent/agent/lib/tin-nhac.ts`, `docs/connections.md`, `docs/agent.md` mục
  «Nhắc buổi sáng», `packages/db/prisma/schema.prisma` (`SlackMemberMatch`,
  `AppSetting`). Không có mục Product Context trong CLAUDE.md.
- Chân ngành:
  - `[NGÀNH: Linear — Settings › Notifications]` mỗi người tự chọn kênh nhận
    (desktop, email, Slack).
  - `[NGÀNH: GitHub — Settings › Notifications]` chọn «on GitHub» / «Email» cho
    từng loại.
  - `[NGÀNH: Telegram Bot API deep linking]` nối tài khoản ứng dụng với chat bot
    bằng mã một lần gửi qua `/start <payload>`.
  - `[NGÀNH: Zalo Bot Platform docs.zaloplatforms.com]` tin đến chỉ có `from.id`,
    `display_name`, `is_bot`; `getUpdates` chỉ nhận `timeout`, không có `offset`,
    mỗi lần trả một tin.
- Pháp lý (⏱ verify-current, đã tra 2026-09-23): Luật Bảo vệ dữ liệu cá nhân
  91/2025/QH15, hiệu lực 01/01/2026, thay NĐ13/2023. `zaloUserId` và tên hiển thị
  Zalo là dữ liệu cá nhân; người tự nối là đồng ý, gỡ là xoá.

## Trục

- **Trục A — vòng đời liên kết:** chưa nối | mã đang chờ | mã hỏng (sai / hết hạn /
  đã dùng) | đã nối | nối lại (cùng người đổi Zalo, hoặc một Zalo đã nối người khác) |
  gỡ | người rời xưởng.
  [thước CE: `[NGÀNH: Telegram deep linking]` + vòng đời `SlackMemberMatch`]
- **Trục B — kênh ưa thích:** Tự động | Zalo | Slack.
  [thước CE: `[NGÀNH: Linear, GitHub]`; «Cả hai» và «Tắt» đã cân ở brainstorm]
- **Trục C — kênh dùng được lúc gửi:** Zalo được / không (không token, hoặc chưa nối)
  × Slack được / không (chưa kết nối, hoặc không khớp) · cộng một ca: Zalo trả lỗi
  lúc gửi.
  [thước CE: `nhac-ke-hoach.ts` — ba `outcome` sẵn có + khuôn capability của `capabilities.ts`]
- **Trục D — bề mặt:** trang «Thông báo của bạn» (mỗi người) | trang kết nối Zalo
  (cả xưởng) | cuộc chat với bot (kể cả người lạ) | tin nhắc buổi sáng.
  [thước CE: `docs/connections.md` — kết nối là năng lực, sống-chết hiện trên mặt]

Không gian: A×D (≈ 20 ô có nghĩa) + B×C (3 × 5 = 15 ô) + chéo bề mặt. Khoảng 60 ô
có nghĩa, trong đó 13 ô Core (≈ 21%).

## Core

1. B×C, 12 ô (ưa thích × Zalo được/không × Slack được/không) — một hàm thuần chọn
   kênh; ma trận toàn phần viết trước.
2. C: Zalo gửi được — tin chữ trơn, đúng người, `payload.kenh = zalo`.
3. C: kênh ưa thích không dùng được mà kênh kia dùng được — gửi kênh kia, ghi
   `lechKenh`, trang cá nhân cảnh báo.
4. C: Zalo trả lỗi lúc gửi — ném để thử lại, không rơi sang Slack.
5. C: không token — năng lực tắt: không poll, «Tự động» đi Slack, không ném.
6. A: mã đang chờ → đã nối — sinh mã (lưu băm, 15 phút, mỗi người một mã sống),
   bot xác nhận bằng tên CRM.
7. A: mã hỏng + chống dò — không nối, bot hướng dẫn không lộ tên, quá 5 lần sai
   trong một giờ thì bỏ qua.
8. A: nối lại — một Zalo chỉ nối một người, một người chỉ một Zalo; nối mới thay cũ.
9. A: gỡ — xoá liên kết; ưa thích đang là Zalo thì về Tự động.
10. B×D: chọn kênh chỉ khi kênh dùng được — máy chủ từ chối, màn khoá lựa chọn
    (cross-layer).
11. D: trang kết nối — bot sống (lần poll cuối, tên bot), x/y người đã nối, ai đã nối.
12. D: chat bot — một `message_id` xử lý đúng một lần dù `getUpdates` trả lại.
13. D×mặt người nhìn — hai trang ở khổ 1440 và 375.

## Later

- Người rời xưởng: liên kết tự mất theo `User` (Cascade); người còn `User` nhưng
  rời xưởng thì không có việc nhắc nên không gửi. Không tiêu chí riêng.
- Tác tử đăng tin lên Zalo (bản Zalo của `slack.message.post`).
- Nhóm Zalo — Zalo ghi «đang thử nghiệm nội bộ».
- Chế độ webhook thay long-poll.
- Quản trị viên xem hoặc gỡ liên kết hộ người khác.
- Kênh email / chuông trong app trong cùng ô chọn.
- Chọn kênh theo từng loại thông báo `[NGÀNH: GitHub]` — hiện chỉ có một loại.

## Never

- Ghép bằng số điện thoại — Bot API không trả số; số tự khai không chứng được chủ.
- Zalo cá nhân qua `zca-js` — trái điều 4.7 điều khoản Zalo.
- ZBS gửi theo số — cần OA xác thực, mẫu duyệt, tốn phí; chỉ hợp cho tin với khách.
- «Cả hai kênh» — trùng tin mỗi sáng, thử lại gửi đúp.
- «Tắt nhắc» cho từng người — phá mục đích máy canh thay người.

## Cross-cutting áp mọi ô Core

- Dữ liệu cá nhân (Luật 91/2025): chỉ lưu `zaloUserId` và tên hiển thị; gỡ là xoá
  hàng; không lưu nội dung tin người lạ nhắn bot.
- Tên hiển thị Zalo là dữ liệu người nhập: không dịch, gắn `translate="no"`.
- Trạng thái rỗng / đang tải / lỗi trên hai trang.
- Nhãn song ngữ theo `settingsMessages` của locale.

## Giả định chờ người gạch

- `[GIẢ ĐỊNH]` Một tin đã trả qua `getUpdates` không bị trả lại ở lần gọi sau (tài
  liệu Zalo không nói). Chống trùng bằng `message_id` giữ đúng kết quả dù giả định
  này sai.
- `[GIẢ ĐỊNH]` Trần độ dài một tin `sendMessage` là 2000 ký tự — số lấy từ tài liệu
  OpenClaw, Zalo không công bố.
- `[GIẢ ĐỊNH]` Đội OneHub đọc Zalo trong ngày nhiều hơn Slack — lý do của cả vòng,
  chưa đo.
