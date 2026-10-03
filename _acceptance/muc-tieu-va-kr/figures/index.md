# Hình tại điểm quyết định — muc-tieu-va-kr (Cổng Phạm vi)

Ngưỡng N5: điểm có từ ba bước nối tiếp hoặc từ hai nhánh rẽ thì cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-5 Mỗi mục tiêu một khung thay cho một bảng chung (lệch thiết kế đã duyệt) | 4 tầng lồng: khối data-muc-tieu → bảng → hàng mục tiêu → hàng KR; hai nhánh (một bảng / mỗi mục tiêu một khung) | `khung-muc-tieu.html` |
| d-…-3 Mặc định mở, URL ghi danh sách đã thu | 4 bước: bấm mũi tên → URL thêm id → tải lại vẫn thu → mở lại cái cuối, khoá rời URL | `thu-mo-url.html` |
| d-…-1 SimpleTable mở rộng, không DataTable, không bảng nhóm mới | dưới ngưỡng: 1 bước chọn, không luồng | — |
| d-…-2 «Tính từ N KR» thay «Trung bình» | dưới ngưỡng: 1 câu chữ | — |
| d-…-4 Không đổi Toàn cảnh, Cập nhật tuần, cây căn chỉnh | dưới ngưỡng: 1 dòng phạm vi | — |
| d-…-6 Chạy design-pass nấc không đồng bộ | dưới ngưỡng: 1 lựa chọn nấc | — |
| Coverage [NGÀNH: Asana Goals], [NGÀNH: Perdoo] | dưới ngưỡng: ứng viên gật/cắt | — |

## Đề bài `khung-muc-tieu`

Loại hình: so sánh hai cây cấu trúc cạnh nhau (trái «Một bảng chung — đã duyệt», phải «Mỗi mục tiêu một khung — đề xuất»).
Nút trái: một table → thead (hiện) → tr mục tiêu A (data-muc-tieu trên tr) → tr KR → tr mục tiêu B → tr KR; ghi chú đỏ: «[data-muc-tieu] [data-kr-hang] = 0 · thead th trong khối = 0 → 6 hồ sơ đã ký đỏ».
Nút phải: div data-muc-tieu=A → table → thead (chỉ trình đọc màn hình, 4 th) → tr mục tiêu (data-hang-muc-tieu) → tr KR1, KR2 (nền nhạt); lặp cho B; ghi chú xanh: «móc của 6 hồ sơ giữ nguyên · tiêu đề cột không lặp ra mắt».
AC liên quan: AC-1, AC-2, AC-9, AC-11.

## Đề bài `thu-mo-url`

Loại hình: sơ đồ luồng 4 bước ngang.
Nút: (1) Mở «Của tôi» — mọi mục tiêu mở, URL sạch → (2) Bấm mũi tên mục tiêu A — KR của A rời màn, URL `?thuMucTieu=A` → (3) Tải lại / gửi link — A vẫn thu → (4) Bấm mở lại A — `thuMucTieu` rời URL. Nhánh phụ dưới bước 1: URL mang id không tồn tại → bỏ qua id, mọi mục tiêu mở.
AC liên quan: AC-3.
