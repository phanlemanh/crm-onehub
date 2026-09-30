# Hình tại điểm quyết định — sua-an-chu-ky-okr (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| d-20260930T053653Z-1 — cách A (cột ẩn riêng) thay vì B (pha thứ năm) hay C (chỉ gỡ khi trống) | 3 nhánh rẽ | cần hình → `duong-don-chu-ky` |
| d-20260930T053653Z-2 — không sửa ngày khi đã có dữ liệu hoặc đã rời lập kế hoạch | 2 nhánh rẽ (trống lập kế hoạch / còn lại) | cần hình → `duong-don-chu-ky` |
| d-20260930T053653Z-3 — không xoá có dữ liệu, không ẩn năm dây chuyền | 3 bước nối tiếp (ẩn quý → ẩn năm → hiện lại) | cần hình → `duong-don-chu-ky` |
| d-20260930T053653Z-4 — đọc theo id không lọc chu kỳ ẩn | dưới ngưỡng: 1 nhánh | — |
| d-20260930T054444Z-5 — design-pass nac-1, không mở phân kỳ | dưới ngưỡng: 0 nhánh | — |
| [GIẢ ĐỊNH] ô ngày tắt bằng `DatePicker` `disabled` | dưới ngưỡng: 1 nhánh | — (ảnh `ST-sua-chi-ten`) |

## Đề bài `duong-don-chu-ky`

- Loại hình: cây quyết định trái → phải.
- Nút: «Chu kỳ tạo nhầm» → hỏi «Đã có dữ liệu?» (mục tiêu, lần hỏi ý, quý con, đợt rà, điểm, mang sang).
- Nhánh KHÔNG: «Còn ở Lập kế hoạch?» — có → «Sửa mọi ô» hoặc «Gỡ»; không → «Sửa tên» hoặc «Gỡ».
- Nhánh CÓ: «Đã đóng?» — chưa → «Sửa tên»; cả hai → «Ẩn (lý do 10–500 ký tự)»; với năm: «Còn quý đang hiện?» có → «Ẩn hoặc gỡ quý trước».
- Từ «Ẩn» → «Hiện lại» (chặn khi năm cha đã ẩn hoặc chồng ngày quý đang hiện). Nhãn phụ dưới «Ẩn»: biến khỏi ô chọn kỳ, không ghi, không nhắc, không mang sang; dữ liệu giữ nguyên.
- AC liên quan: AC-1, AC-2, AC-3, AC-4, AC-5.
