# Hình tại điểm quyết định — gieo-nguoi-chiu-song-song

| Điểm | Đếm | Hình |
|---|---|---|
| d-20261014T073026Z-5 — chọn cách cho bước tạo tổ chức chịu gọi song song (cũng là finding P0 gap-probe, human-gate1) | ba nhánh rẽ → cần hình | `ba-loi-gieo-to-chuc` |

## Đề bài `ba-loi-gieo-to-chuc`

- Loại hình: so sánh ba nhánh rẽ từ một điểm (decision tree / solution tree), ngang.
- Nút gốc: «Hai lượt gieoNguoi() cùng lúc, kho chưa có hàng tổ chức → lượt thua ném P2002».
- Ba nhánh: (A, khuyên) «Bắt P2002 rồi đọc lại hàng» — hướng chủ vùng DA0a đã chốt, không SQL thô · (B) «Chèn thô ON CONFLICT (id) DO NOTHING» — gọn, thêm SQL thô trong helper test · (C) «Khoá tư vấn Postgres quanh bước tạo» — chắc nhất, nặng nhất.
- Chân chung dưới ba nhánh: «Đổi lối = sửa một hàm trong tệp test, chấm lại một lượt — không chạm dữ liệu hay mã sản phẩm».
- AC liên quan: AC-1, AC-2, AC-5.
