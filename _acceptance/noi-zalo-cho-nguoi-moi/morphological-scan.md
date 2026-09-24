# Quét không gian tiêu chí — noi-zalo-cho-nguoi-moi

Preset `entity-feature` (entity: bot Zalo của xưởng + liên kết Zalo của một người),
trục dựng lại theo B1. Quét 2026-09-24.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub — chân sản phẩm: `CLAUDE.md` + `CONTEXT.md`
  [SUY-TỪ-REPO: CLAUDE.md] · hồ sơ `nhac-qua-zalo` và `zalo-qua-webhook`
  [SUY-TỪ-REPO: _acceptance/zalo-qua-webhook/contract.md] · lộ trình
  [SUY-TỪ-REPO: docs/plan/lo-trinh-zalo.md] · lái thử bot thật 2026-09-23.
- Chân ngành: Telegram BotFather + `setWebhook` (dán token, hệ thống tự đăng ký)
  [NGÀNH: Telegram Bot API] · khuôn «Connected apps» có trạng thái sức khoẻ
  webhook [NGÀNH: ReUI settings-8, Stripe webhooks dashboard] · Slack «Connect
  your account» với bước hướng dẫn đánh số [NGÀNH: Slack app directory onboarding]
  · Zalo Bot API không có deep link, QR hay start payload [NGÀNH: tài liệu
  bot.zaloplatforms.com, kiểm 2026-09-24].

## Trục

- Trục A — ai đứng trước màn: quản trị viên | thành viên thường | người mới chưa
  nối | người đã nối | người rời xưởng
  [thước CE: `canManageConnections` trong `packages/auth/src/organization.ts` + lái thử 23/09]
- Trục B — nguồn token và đường tin: token trong `AppSetting` | token trong `.env`
  | cả hai | không có · địa chỉ tác tử https | http
  [thước CE: `capabilities.ts` + `[NGÀNH: Telegram setWebhook chỉ nhận https]`]
- Trục C — sự kiện: lưu token đúng | token sai dạng | token đúng dạng nhưng Zalo
  từ chối | dán nhầm Secret Token | đăng ký webhook hỏng | nhắn mã | nhắn chữ khi đã
  nối | gửi thử | lỗi DB giữa chừng | gỡ thành viên
  [thước CE: lái thử 23/09 (dán nhầm Secret Token, tên bot sai) + Ngoài-3/Ngoài-4 vòng 1]
- Trục D — màn: `/settings/connections/zalo` | `/settings/notifications` | trong Zalo
  (câu bot trả) [thước CE: `docs/connections.md`, hồ sơ `nhac-qua-zalo`]

## Không gian (B3)

Khoảng 60 ô có nghĩa sau khi gạch ô vô nghĩa (vd «thành viên thường × lưu token»
chỉ có một nghĩa: bị cấm; «người rời xưởng × màn» không có màn).

## Core (12 ô, khoảng 20%)

1. Quản trị viên × token đúng × https — lưu, tự đăng ký webhook, hiện tên bot.
2. Quản trị viên × token sai dạng / Zalo từ chối / dán nhầm Secret Token — báo đúng
   chỗ sai, không lưu gì.
3. Quản trị viên × token đúng × http — lưu, nói thẳng tin chưa về được, chỉ `zalo:poll`.
4. Thành viên thường × lưu token — bị cấm ở API, màn không cho nhập.
5. Tác tử × nguồn token — `AppSetting` trước, `.env` sau, cho mọi chỗ dùng token.
6. Trang kết nối × webhook chưa đăng ký — báo rõ (Ngoài-4 vòng 1).
7. Hai màn × tên bot — theo `display_name`.
8. Tin đến × lỗi DB giữa chừng — không mất tin (Ngoài-3 vòng 1).
9. Người đã nối × nhắn chữ — bot nhận ra người, nói giờ nhắc.
10. Người đã nối × gửi thử — tin thử đi đúng kênh sẽ dùng.
11. Người rời xưởng — liên kết Zalo, mã và lựa chọn kênh bị gỡ.
12. Người mới × màn thông báo — ba bước có số, tên bot thật; ba lỗi chữ lái thử.

## Later

- Nút «Gỡ bot» cho quản trị viên (thay bằng dán token mới là đủ để xoay token).
- Mã hoá token trong DB (chủ kho chọn chữ trơn như khoá nghiên cứu, 24/09).
- Giới hạn tần suất «Gửi thử».
- Mã QR / đường dẫn mở thẳng bot — chờ Zalo có deep link.
- Thông báo cho quản trị khi webhook rơi (email, Slack).

## Never

- Nối đảo chiều (bot gửi đường dẫn đăng nhập) — người mới phải đăng nhập CRM trên
  điện thoại; mã 6 số ngắn hơn cho đúng ca này (chủ kho chọn 24/09).
- Cài block ReUI Pro vào `packages/ui` — ghi đè 5–7 tệp đã tuỳ biến và thêm 18 biến
  màu (đo `ui:add --dry-run` 24/09).
- Nối trong nhóm Zalo — lộ tên CRM cho cả nhóm (quyết ở vòng 1).

## Cross-cutting áp mọi ô Core

- Token không bao giờ rời máy chủ về trình duyệt; màn chỉ thấy 4 ký tự cuối.
- Thiếu tác tử (không `AGENT_BRIDGE_SECRET`) thì báo, không ném.
- Chữ trên màn có đủ tiếng Anh và tiếng Việt; dữ liệu người nhập đánh dấu `translate="no"`.
