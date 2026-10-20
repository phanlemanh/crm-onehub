# Coverage scan — chu-may-sinh-ten-moi

Preset `entity-feature` không khớp (không có thực thể mới); dựng trục từ B1: hàng đổi chữ máy sinh, không gian
là tích «khái niệm × nơi sinh chữ».

## Ngữ cảnh
- Sản phẩm: CRM nội bộ OneHub, khu Mục tiêu (OKR) — chân sản phẩm: `CONTEXT.md` [SUY-TỪ-REPO: CONTEXT.md] và
  kiểm kê `kiem-ke.json` [SUY-TỪ-REPO: _acceptance/chu-may-sinh-ten-moi/kiem-ke.json] · chân ngành: Tability gọi
  liên kết là «contributes to» ở mọi chỗ [NGÀNH: Tability — tiền lệ CONTEXT.md mục Căn chỉnh]; Google Workspace
  và Slack hiển thị tên tổ chức do quản trị đặt cho gốc cây [NGÀNH: Google Workspace Admin — org unit gốc mang tên tổ chức].

## Trục
- Trục A — khái niệm: Góp vào | Lấy ý kiến | cấp gốc | tên gốc   [thước CE: ba mục CONTEXT.md]
- Trục B — nơi sinh chữ: câu lỗi API | lỗi gói validation | tin nhắc Zalo | tin nhắc Slack | lời dặn Kara soạn |
  lời dặn Kara góp ý | dữ liệu API trả về | lệnh dev   [thước CE: kiểm kê 13 tệp ở mốc 37dc2da8d]
- Trục C — người đọc: người dùng | model (judge) | lập trình viên   [thước CE: ai đọc chữ đó]

## Bảng ô (A × B, chỉ ô có trong kiểm kê)

| | câu lỗi API | validation | Zalo | Slack | Kara soạn | Kara góp ý | dữ liệu API | lệnh dev |
|---|---|---|---|---|---|---|---|---|
| Góp vào | 8 dòng — Core AC-1 | — | — | — | 3 — Core AC-6 | 4 — Core AC-6 | — | Later |
| Lấy ý kiến | 16 — Core AC-2 | 1 — Core AC-2 | 1+2 — Core AC-5 | 1+4 — Core AC-5 | — | — | — | Later |
| cấp gốc | 2 — Core AC-3 | — | — | — | — | — | — | — |
| tên gốc | — | — | — | — | — | — | 10 — Core AC-4 | Never |

Ô judge (Trục C = model): `config.ts` 116, 130; `van.ts` 34 — Never (đổi là đổi thước của AC-7).

## Core
1. Câu lỗi API theo tên mới (AC-1, AC-2, AC-3) — người dùng đọc trực tiếp trên màn khi thao tác sai.
2. Tên gốc lấy từ không gian làm việc ở API và Kara hỏi đáp (AC-4) — màn đã làm ở VK4, dữ liệu API còn lệch.
3. Tin nhắc buổi sáng (AC-5) — chữ máy gửi ra kênh ngoài mỗi sáng.
4. Lời dặn Kara và bộ chấm soạn không tụt (AC-6, AC-7) — `bat_khi` của hàng.
5. Luật máy, kiểm kê trước sửa, bài cũ và thước đã ký (AC-8, AC-9) — giữ lâu.

## Later
- Lệnh dev `apps/api/scripts/okr-mau/**` («căn chỉnh cần đúng một đích») — người đọc là lập trình viên.

## Never
- Chữ judge của eval soạn — đổi làm hai lần đo không cùng thước.
- Dữ liệu ca eval `ten: "OneHub"` — tên công ty giả trong ca, không phải tên gốc của sản phẩm.

## Cross-cutting áp mọi ô Core
- Mã, khoá, đường dẫn `hoi-y`, tên mã `dichCanChinh`/`can-chinh` giữ nguyên.
- Chữ người dùng nhập không dịch; chỉ đổi chữ máy viết.
