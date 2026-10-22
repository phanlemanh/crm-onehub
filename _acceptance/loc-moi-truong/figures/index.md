# Hình tại điểm quyết định — loc-moi-truong

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 nhãn mốc trước hôm nay | 2 nhánh rẽ | `menu-loc.html` (chung hình menu) |
| Hỏi-2 bộ lọc đã lưu có nhớ kiểu xem | 2 nhánh rẽ | `kieu-xem.html` |
| Hỏi-3 bỏ dấu khi lọc «chứa» | dưới ngưỡng: 1 lựa chọn chữ, không luồng | — |
| Hỏi-4 ngưỡng Đường đo | dưới ngưỡng: con số, không luồng | — |
| Hỏi-5 trường tắt «Hiện trong bộ lọc» | 2 nhánh rẽ, 4 bước nối tiếp | `truong-tat.html` |
| Hỏi-6 bỏ design-pass | 2 nhánh rẽ | `menu-loc.html` (UI duyệt bằng hình này) |
| Một cách mã hoá đường dẫn (d-2) | 3 bước nối tiếp | `truong-tat.html` (dòng đường dẫn → bộ lọc đã lưu → API) |
| Các dòng máy quyết còn lại | dưới ngưỡng: một câu, không rẽ | — |

## Đề bài

### menu-loc
- Loại: wireframe hai khổ (1280 và 375) của menu Bộ lọc trên danh sách Thoả thuận.
- Nút: nút «Bộ lọc (2)»; menu con theo trường: «Ghi chú» (Chữ) có ô «Chứa…» + «Trống 2»; «Số căn» (Số) có ô «Từ» «Đến» + dòng lỗi «Ô này nhận số, ví dụ 1.234,5» + «Trống 1»; «Ngày ký» (Ngày) có «Đã qua 3 · Tháng này 2 · Tháng sau 1 · Sau đó 0 · Trống 4»; «Đã ký» (Ô tích) «Có 5 · Không 7».
- Nhãn bằng chữ: ghi chú cạnh «Đã qua»: «Hỏi-1: hay "Quá hạn" như Ngày chốt».
- AC: AC-10, AC-1..AC-3.

### kieu-xem
- Loại: hai nhánh rẽ cạnh nhau.
- Nút: lưu «Đang chờ ký» ở Bảng cột → mở lại từ menu khi đang ở Bảng. Nhánh A (khuyên): giữ Bảng, áp bộ lọc. Nhánh B: chuyển sang Bảng cột, khuôn lưu thêm khoá view chỉ Thoả thuận có.
- AC: AC-9.

### truong-tat
- Loại: luồng dữ liệu bốn bước + hai nhánh.
- Nút: đường dẫn `field:loai=A` → bộ lọc đã lưu `{filters: {"field:loai": ["A"]}}` → quản trị tắt «Hiện trong bộ lọc» của «loai» → chiến dịch đọc bộ lọc. Nhánh A (khuyên): giữ như hôm nay, «loai» không lọc, chiến dịch giữ 120 thành viên. Nhánh B: áp lại, chiến dịch còn 40, không ai sửa gì (khó đảo).
- AC: AC-6, AC-7, AC-8.
