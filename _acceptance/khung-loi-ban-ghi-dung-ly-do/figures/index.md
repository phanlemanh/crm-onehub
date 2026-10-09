# Hình tại điểm quyết định — khung-loi-ban-ghi-dung-ly-do

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Phân loại lỗi trong khung chung theo data.code (approach S1) | ba nhánh (không còn · không có quyền · mất kết nối) × hai nơi hiện (ngăn bản ghi · mục «Kế hoạch» của công ty) | `ba-ly-do.html` |
| Không tách UNAUTHORIZED, không đụng OKR/lưu trữ (descope) | dưới ngưỡng: danh sách cắt | — |
| Bỏ design-pass (descope) | dưới ngưỡng: một quyết định nhị phân | — |

## Đề bài `ba-ly-do`

- Loại hình: cây quyết định trái sang phải. Gốc «Mở ngăn bản ghi (cá nhân · công ty · thoả thuận · kế hoạch) — truy vấn lỗi». Câu hỏi «Máy chủ trả mã gì?».
- Nhánh NOT_FOUND → «Bản ghi này không còn» + một câu + nút «Đóng» (về ngăn trước). Nhánh FORBIDDEN → «Bạn không có quyền xem bản ghi này» + một câu + «Đóng». Nhánh mã khác → «Không tải được bản ghi này» + «Kiểm tra kết nối rồi thử lại.» + «Thử lại» (như hôm nay; ngăn kế hoạch nay có thêm nút).
- Một dải phụ bên dưới cho mục «Kế hoạch» trong ngăn công ty: cùng ba nhánh nhưng hai nhánh đầu KHÔNG có nút (ngăn công ty vẫn dùng được).
- Tô nổi hai nhánh mới (NOT_FOUND, FORBIDDEN) so với nhánh giữ nguyên. Ghi AC-1, AC-2, AC-3, AC-4 cạnh nhánh. Nhãn tiếng Việt.
