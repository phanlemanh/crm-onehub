# Hình tại điểm quyết định — che-do-soan-bo-okr

Kê từ sổ quyết định (dòng chờ seal), design doc và Coverage cuối S1. Ngưỡng N5: từ ba bước nối tiếp hoặc từ hai nhánh
rẽ của luồng người dùng thì cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-2 — đường vào: hộp Thêm mục tiêu › «Soạn cả bộ», bộ trống › «Soạn bộ OKR», cuộc soạn cũ thành «Nhờ Kara soạn nháp» | ba đường vào hội về một khung, một nhánh rẽ sang cuộc soạn cũ — vượt | `luong-soan.html` |
| Hỏi-4 — chip góp ý ở ngăn theo dõi: mở chế độ Soạn hay mở tại chỗ | hai nhánh rẽ — vượt | `luong-soan.html` (cùng hình) + ảnh bản mẫu `ST-ngan-mot-chip`, `ST-ngan-chip-mo-tai-cho` |
| Hỏi-1 — điểm chất lượng máy chấm hay Kara chấm | một lựa chọn giá trị, không luồng — dưới ngưỡng: 1 bước | — |
| Hỏi-3 — mục tiêu đã công bố trong tài liệu | một lựa chọn hiển thị — dưới ngưỡng: 1 bước | — (ảnh bản mẫu `ST-soan-co-muc-da-cong-bo`) |
| Hỏi-5 — lời dặn Kara không đổi | một lựa chọn phạm vi — dưới ngưỡng: 1 bước | — |
| Hỏi-6 — thước của sáu hồ sơ đã ký | một lựa chọn cách xử lý — dưới ngưỡng: 1 bước | — |

## Đề bài `luong-soan`

- Loại hình: sơ đồ luồng (flowchart), trái sang phải.
- Nút: «Bộ OKR (trang một bộ)» · «Hộp Thêm mục tiêu» · «Câu rỗng của bộ trống» · «Ngăn theo dõi (chip Kara · N góp ý)» →
  «Chế độ Soạn (tài liệu trái · Chất lượng + góp ý Kara phải)» → «Hỏi lại Công bố N mục tiêu» → «Màn theo dõi của Bộ OKR».
  Nhánh rẽ: «Nhờ Kara soạn nháp» (chỉ khi bộ trống) → «Cuộc soạn cũ» → «Đưa vào bộ OKR» quay về «Chế độ Soạn».
- Nhãn trên cạnh: «Soạn cả bộ» · «Soạn bộ OKR» · «bấm chip (Hỏi-4: máy khuyên)» · nét đứt «mở tại chỗ (lối khác Hỏi-4)»
  từ ngăn theo dõi tới một hộp nổi «Góp ý tại ngăn» · «Công bố N mục tiêu» · «xác nhận».
- AC liên quan: AC-1, AC-6, AC-7; Hỏi-2, Hỏi-4.
