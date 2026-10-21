# Hình tại Cổng Phạm vi — MH2

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 Model mặc định Tác nhân | dưới ngưỡng: 2 lối | — |
| Hỏi-3 Model Trợ lý kho và ngưỡng câu lỗi | dưới ngưỡng: 2 lối | — |
| Hỏi-2 Máy soạn kho | dưới ngưỡng: 2 lối | — |
| Hỏi-4 Đo xác nhận | dưới ngưỡng: 2 lối | — |
| Hỏi-5 | dưới ngưỡng: 2 lối | — |
| Hỏi-6 Ngưỡng Cổng Giá trị | dưới ngưỡng: 2 lối | — |
| Hỏi-7 Ô Cài đặt production | 3 nhánh rẽ (ô trống · ô đã chọn model cũ · ô đã chọn model khác) | `nguoi-dung-nhan-model.html` |

## Đề bài `nguoi-dung-nhan-model`

- Loại hình: flowchart dọc, một workspace trên production sau khi bản MH2 lên.
- Nút: «workspace mở phiên Tác nhân» → «ô Cài đặt model?» → ba nhánh: «trống» → «chạy model mặc định mới (Hỏi-1)»; «đã chọn zai/glm-5.2-fast» → «vẫn chạy GLM 5.2 Fast — anh xoá ô trên màn Cài đặt (Hỏi-7)»; «đã chọn model khác» → «chạy model trong ô». Nhánh phụ: «model trong ô bị Gateway gỡ» → «lùi về model mặc định mới».
- Chú thích dưới hình: «Trợ lý kho không đọc ô này: luôn chạy model kho mới (Hỏi-3)».
- AC liên quan: AC-1, AC-2, AC-3.
