# Hình tại điểm quyết định — doi-ten-onehub-center

| Điểm | Đếm | Hình |
|---|---|---|
| Chữ «CRM» nào phải đổi (tập quét, glob loại trừ, bốn ngoại lệ) — AC-1, d-…-2 | 3 nhánh rẽ | cần hình: `pham-vi-doi-chu` |
| Thước của hồ sơ đã ký bị chạm: thế tên hay thay thế — AC-13, ba dòng supersedes | 2 nhánh rẽ + 3 bước kiểm | cần hình: `thuoc-da-ky` |
| Nhãn đầu trang — AC-5, d-…-3 | 2 nhánh | dưới ngưỡng: một phép rẽ, bảng trong AC-5 đủ đọc |
| Hướng A cho cột trái — d-…-1 | 0 (đã chốt) | dưới ngưỡng: ảnh design-pass thay hình |
| Gộp một vòng / gộp T3 — d-…-4, d-…-5 | 0 | dưới ngưỡng |
| Thay AuthShader ở cả năm trang — d-…-7 | 0 | dưới ngưỡng: ảnh ST-shell-khac |
| Bỏ lời báo builder/run-runtime — d-…-6 | 0 | dưới ngưỡng |
| Năm dòng [GIẢ ĐỊNH] của Coverage | 0 mỗi dòng | dưới ngưỡng |

## Đề bài `pham-vi-doi-chu`

Loại: cây quyết định (decision tree), trái sang phải.
Nút: «Chuỗi mang CRM» → hỏi «nằm trong glob loại trừ?» (có → «Giữ — trang giới thiệu hãng, /proto cũ, tiêu đề API, test, chỉ dẫn cho model») → không → hỏi «là một trong bốn ngoại lệ?» (có → «Giữ — chuỗi máy so khớp, mã giảm giá, user-agent») → không → «Đổi thành OneHub Center (35 tệp)».
Nhãn phụ: dưới nút cuối ghi «bộ quét E1 đỏ nếu còn sót · ngoại lệ lạ cũng đỏ».
AC: AC-1, AC-2.

## Đề bài `thuoc-da-ky`

Loại: luồng (flowchart) có hai nhánh.
Nút: «Tệp thước của hồ sơ đã ký bị diff chạm» → hỏi «vạch có trong danh sách thay thế?» → có → «Thay thế: có dòng supersedes + eval mới của vòng đỏ ở merge-base» (ví dụ: cua-vao-dang-nhap E2, vạch khong-shader, E14) → không → «Chỉ được thế tên: thế ngược ra đúng từng byte merge-base» → «Kiểm từng cặp bang-the: chuẩn hoá tên bằng nhau, hoặc cặp chuỗi sản phẩm thật».
Nhãn cuối: «mọi eval đạt ở merge-base phải đạt ở HEAD».
AC: AC-13.
