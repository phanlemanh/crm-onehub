# Hạt giống — B5: bỏ cách xem «Cây căn chỉnh» khỏi trang đơn vị, sau phiên nghiệm thu L3

Gốc: `_acceptance/so-do-can-chinh-don-vi/` (DH4), AC-13 — chủ kho tách ra ở Gate 1.5 ngày 15/10/2026
(«tách B5 thành hàng riêng sau phiên nghiệm thu L3»). Mã B5 của `docs/plan/pham-vi-okr-dieu-huong-1410.md`.
Hạt giống là SỔ, không phải ô: mở thành hàng/ô khi có neo — phiên nghiệm thu của `cay-can-chinh-co-ly-do`
(L3, mốc R2 31/10) đã ký, và DH4 (Toàn cảnh › Sơ đồ) đã lên production.

## Lỗ

Cây căn chỉnh ở trang đơn vị (`?xemOkr=cay`) luôn hiện toàn công ty dù đang chọn đơn vị nào, cao khoảng
4.100px. DH4 đưa sơ đồ có lý do căn chỉnh lên Toàn cảnh, nên cây ở trang đơn vị thành thừa.

## Vì sao chưa làm ở DH4

- L3 `cay-can-chinh-co-ly-do` còn chờ phiên nghiệm thu: bỏ Cây lúc này là bỏ đúng màn Cổng Giá trị của L3
  sẽ đo (Mac Studio, crm #375 03:33Z 15/10).
- Bốn hồ sơ đã ký đo trên cách xem Cây: `cay-can-chinh-co-ly-do` E3–E8, E10, E11; `ux-lai-thu-8c-okr` E2,
  E14 (bài `nhan-danh-sach`); `dat-okr-trong-crm` script `dok_man_chrome` (bước «URL phai co xemOkr=cay»,
  chung cho E11–E13, E15, E16, E20, E21); `toan-canh-okr` script `tco_man_chrome` (E2, E5).

## Hướng

Một hàng riêng: bỏ `cay` khỏi `CACH_XEM_OKR`, `?xemOkr=cay` chuyển sang Toàn cảnh › Sơ đồ mở sẵn thẻ đơn vị
đang chọn (AC-13 của DH4 viết sẵn khuôn), và CÙNG PR chuyển bốn hồ sơ trên sang đo trên Sơ đồ (khai nghỉ
có `superseded_by` hoặc sửa bước của hai script màn thật), đăng crm #375 trước khi commit.
