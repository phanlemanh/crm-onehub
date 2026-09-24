---
slug: loi-tac-tu-zalo-noi-dung-nguyen-nhan
preset: test-matrix
at: 2026-09-24
---

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, màn Kết nối › Zalo (quản trị viên đặt bot) và màn
  Thông báo của bạn (mọi thành viên gửi tin thử). Chân sản phẩm: đào repo —
  `[SUY-TỪ-REPO: apps/api/src/zalo/zalo.service.ts]`,
  `[SUY-TỪ-REPO: apps/api/src/zalo/zalo-cau-noi.service.ts]`,
  `[SUY-TỪ-REPO: apps/agent/agent/lib/zalo-bot-xuong.ts]`,
  `[SUY-TỪ-REPO: apps/agent/agent/channels/zalo.ts]`.
- Chân ngành: `[NGÀNH: RFC 9457 Problem Details for HTTP APIs]` (lỗi mang *loại*
  máy đọc được, không chỉ một câu chung), `[NGÀNH: Google AIP-193 Errors]`
  (mỗi lỗi có `reason` ổn định + thông điệp cho người), `[NGÀNH: OWASP Logging
  Cheat Sheet]` (log đủ để tra, không ghi bí mật/token), `[NGÀNH: Telegram Bot
  API]` (nền tảng bot cùng loại trả `ok:false` + `error_code` trong thân HTTP 200 —
  Zalo Bot API theo đúng khuôn này, xem `packages/validation/src/zalo-update.ts`).

## Trục

- **A. Thao tác**: luuBot (quản trị viên, màn Kết nối) | guiThu (mọi thành viên,
  màn Thông báo). `[SUY-TỪ-REPO: apps/api/src/zalo/zalo.router.ts]`
  [thước CE: hai procedure duy nhất gọi cầu nối — `ZALO_CAU_NOI` có đúng hai đường]
- **B. Chặng hỏng**: cầu nối API↔tác tử | dịch vụ ngoài tác tử gọi (Zalo; Slack chỉ
  với guiThu). [thước CE: chuỗi gọi thật API → `bridge()` → route eve → `zaloGoi`/
  `guiSlackRieng`]
- **C. Kiểu hỏng**: chưa cấu hình | không tới được (mạng, hết giờ) | bị từ chối
  (401 ở cầu nối; 4xx hay `ok:false` ở Zalo) | lỗi phía kia (5xx, mã khác 2xx) |
  trả lời sai khuôn. [thước CE: `[NGÀNH: RFC 9457]` + `[NGÀNH: Telegram Bot API]`
  — năm lớp này phủ mọi kết cục của một lời gọi HTTP có xác thực]
- **D. Vật quan sát**: câu người dùng thấy | dòng log vận hành | không lộ bí mật |
  trạng thái lưu không đổi / không báo thành công giả. [thước CE: `[NGÀNH: OWASP
  Logging Cheat Sheet]` + `[NGÀNH: AIP-193]`]

## Không gian (A × B × C, mỗi ô xét đủ D)

| | chưa cấu hình | không tới được | bị từ chối | lỗi phía kia | sai khuôn |
|---|---|---|---|---|---|
| luuBot · cầu nối | ô 1 | ô 2 | ô 3 | ô 4 | ô 5 |
| guiThu · cầu nối | ô 6 | ô 7 | ô 8 | ô 9 | ô 10 |
| luuBot · Zalo `getMe` | đã có («Chưa có Bot Token») | ô 11 | đã đúng («Zalo không nhận token này») | ô 12 — hiện báo nhầm «token sai» | ô 13 |
| guiThu · Zalo `sendMessage` | gạch — kênh zalo đòi có token | ô 14 | ô 15 | ô 16 | ô 17 |
| guiThu · Slack | gạch — kênh slack đòi có token | ô 18 | ô 19 | ô 20 | ô 21 |

## Core

1. Ô 1–10 — năm nguyên nhân cầu nối, mỗi nguyên nhân một câu riêng và một dòng log
   gọi tên nguyên nhân (kèm mã HTTP khi có), cho CẢ hai thao tác: cùng một hàm
   `goi`, nên đo đủ ma trận 5 × 2 rẻ.
2. Ô 11–13 — `getMe` không trả lời được hoặc trả sai khuôn thành kết cục riêng
   («Zalo đang không trả lời»), không còn đội lốt «token sai» hay «tác tử chưa nối»;
   bot đang dùng giữ nguyên trong DB. Đi cặp với ô «bị từ chối» (4xx) vẫn ra «token sai».
3. Ô 14–17 — gửi tin thử qua Zalo hỏng thì người dùng thấy «Zalo chưa nhận tin thử»,
   không bao giờ thấy «đã gửi».
4. Ô 18–21 — như trên cho Slack.
5. Cắt ngang: không dòng log nào (API hay tác tử) chứa Bot Token hay khoá cầu nối,
   kể cả khi lỗi mạng mà địa chỉ gọi chứa token.
6. Cắt ngang: màn Thông báo hiện câu nguyên nhân của API thay vì câu cố định.
7. Cắt ngang: API mới đọc được phản hồi guiThu của tác tử cũ (chưa có trường mới).

## Later

- Mã HTTP theo nguyên nhân (502/503 thay vì 400) — phải chạm `DomainErrorMiddleware`
  dùng chung cho mọi router.
- Câu lỗi hai thứ tiếng (API trả mã, app dịch) — lối A đã cân ở brainstorm; cùng nợ
  với câu lỗi `luuBot` hiện có.
- Tách «Zalo từ chối tin» (người nhận chặn bot) khỏi «Zalo đang lỗi» ở guiThu.
- API ghi log cả kết cục miền (Zalo hỏng) — tác tử đã ghi, API ghi lại là trùng.

## Never

- Tự thử lại lời gọi hỏng — guiThu thử lại có thể gửi hai tin thử.
- Chép nguyên văn `description` của Zalo lên màn — chữ của nhà cung cấp, không nói
  người dùng phải làm gì.

## Cross-cutting áp mọi ô Core

- Chữ hiển thị là tiếng Việt có dấu, nói việc người đọc làm được (thử lại / báo quản
  trị viên / báo người cài đặt hệ thống).
- Đường thành công giữ nguyên: `valid`, `chuaCoKenh`, `saiDang`, `chiQuanTri`.
