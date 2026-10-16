# Hình tại điểm quyết định — Cổng Phạm vi LT1d

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — môi trường GitHub chỉ cho onehub: để vòng sau hay làm ngay (d-20261015T090716Z-10) | 2 nhánh rẽ, 4 bước nối tiếp trên dòng thời gian gộp | khoang-ho.html / khoang-ho.png |
| Hai cầu REST theo đường (d-20261015T090237Z-1) | 1 nhánh (đúng đường → 2 MB, còn lại → 100 KB), 2 bước | dưới ngưỡng: 1 nhánh, 2 bước |
| Chặn trong kịch bản đẩy (d-20261015T090237Z-2, -3) | 1 nhánh (onehub → đẩy, khác → đỏ), 2 bước | dưới ngưỡng: 1 nhánh, 2 bước |
| Trần chung 100 000 byte (d-20261015T090716Z-9) | 0 nhánh | dưới ngưỡng: 0 |
| Bỏ design-pass / đặc tả UX / ui-observed (d-…-6, -7, -8) | 0 nhánh | dưới ngưỡng: 0 |
| Gap-probe P1 khoảng hở (human-gate1) | gộp vào Hỏi-1 | khoang-ho |

## Đề bài hình khoang-ho

- Loại: dòng thời gian ngang (timeline) có hai nhánh lựa chọn ở cuối.
- Nút trên dòng thời gian onehub: «LT1c gộp» → «nhánh X rẽ khỏi onehub (mang workflow chạy tay được, CHƯA có bước chặn)» → «LT1d gộp (bước chặn vào onehub)» → «nhánh Y rẽ sau (có bước chặn)».
- Vùng tô giữa «LT1c gộp» và «LT1d gộp»: «khoảng hở — bấm chạy tay trên nhánh X vẫn đẩy được lộ trình chưa duyệt».
- Hai nhánh lựa chọn: (A, máy khuyên) «Để vòng sau + gộp LT1d sát sau LT1c → khoảng hở gần bằng 0; ai sửa workflow trên nhánh vẫn đẩy được» · (B) «Làm ngay: môi trường GitHub chỉ cho onehub giữ hai khoá → đóng cả khoảng hở lẫn ca sửa workflow; chủ kho chỉnh cài đặt GitHub một lần, không bài kiểm nào chứng được».
- Liên quan: AC-6, AC-7.
