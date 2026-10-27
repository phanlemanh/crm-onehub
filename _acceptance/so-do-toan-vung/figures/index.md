# Hình tại Cổng Phạm vi — so-do-toan-vung

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-19 tâm là đoạn đường `/okr/so-do/muc-tieu/<id>` + d-…-20 không sửa `next.config.ts`, đường cũ chuyển ở lớp trang | năm lối vào, lối dài nhất bốn bước nối tiếp (đường cũ → redirect → rewrite → trang chuyển) | `duong-toi-so-do` |
| d-…-21 khung `PageShell width="full" contained` | dưới ngưỡng: một bước, không rẽ | — |
| d-…-23 bỏ design-pass | dưới ngưỡng: không bước, không rẽ | — |
| Hỏi-1…4 (đã trả lời 19/10, sổ gate1) | dưới ngưỡng: mỗi câu hai nhánh đã chốt, không còn chờ | — |
| Esc theo tầng (AC-2) | hai nhánh rẽ (có lớp mở / không) | `duong-toi-so-do` (khung phụ) |

## Đề bài `duong-toi-so-do`

- Loại hình: sơ đồ luồng (flowchart) trái → phải.
- Nút trái (lối vào): «Thanh bên › Sơ đồ», «Ngăn mục tiêu › Xem trên sơ đồ», «Dấu trang `/okr/quanh-muc-tieu/<id>`»,
  «Dấu trang Toàn cảnh `?xemToanCanh=so-do`», «Dấu trang Bộ OKR `?xemOkr=cay`».
- Nút giữa: chuyển của VK2 trong `next.config.ts` (không đổi) — `quanh-muc-tieu → so-do/muc-tieu`, `toan-canh → suc-khoe`;
  rewrite về thư mục cũ; chuyển ở lớp trang của VK6 (trang Sức khoẻ, trang Bộ OKR).
- Nút phải: «Màn Sơ đồ — cả công ty `/okr/so-do`» và «Màn Sơ đồ — quanh mục tiêu `/okr/so-do/muc-tieu/<id>`», hai nút
  cùng một khung toàn vùng; một cạnh hai chiều «Về sơ đồ cả công ty» / «Xem trên sơ đồ».
- Khung phụ dưới: «Toàn màn hình» — bấm nút → thanh bên thu; Esc → có lớp mở? có: đóng lớp; không: thoát.
- AC liên quan: AC-3, AC-4, AC-5, AC-6, AC-2.
