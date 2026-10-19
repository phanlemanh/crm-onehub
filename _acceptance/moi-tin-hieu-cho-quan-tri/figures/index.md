# Hình tại điểm quyết định — moi-tin-hieu-cho-quan-tri

Ngưỡng N5: cần hình khi điểm quyết định có từ ba bước nối tiếp hoặc từ hai nhánh rẽ.

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 thẻ Tất cả là đường dẫn riêng | 1 bước | dưới ngưỡng: 1 bước |
| d-2 một hàm đếm chung | 2 bên gọi, 1 hàm | gộp vào hình `khop-ba-so` |
| d-4 Hỏi — ẩn thanh thẻ với người không phải quản trị | 2 nhánh rẽ (quản trị / người khác) × 2 lối (ẩn / hiện khoá) | cần hình: `vai-va-the` |
| d-5 Hỏi — lọc ở trình duyệt hay ở máy chủ | 2 nhánh rẽ, mỗi nhánh 3 bước | cần hình: `loc-o-dau` |
| d-6 không trả thư điện tử | 1 bước | dưới ngưỡng: 1 bước |
| d-8 ba ô số không đổi theo lọc | 1 bước | dưới ngưỡng: 1 bước |
| d-9 «—» khi thiếu bản vẽ | 1 bước | dưới ngưỡng: 1 bước |
| d-9 (thay d-3) đếm phòng ban theo mã | 3 bước nối tiếp (máy chủ → lệnh / trang → hàm đếm) | cần hình: `khop-ba-so` |

## Đề bài

### vai-va-the (luồng, hai cột so sánh)
- Loại: luồng rẽ nhánh theo vai, hai phương án cạnh nhau.
- Nút: «Mở Tín hiệu đã gửi» → rẽ «Chủ / quản trị» → thấy thanh thẻ «Của tôi · Tất cả» → «Tất cả: ba ô số + bảng»; rẽ «Thành viên / chỉ OKR» → Lối khuyên: không thanh thẻ, trang như hôm nay; mở thẳng đường dẫn Tất cả → «Chỉ chủ và quản trị CRM xem được mọi tín hiệu» + nút về. Lối khác: thẻ «Tất cả» hiện nhưng khoá + một dòng lý do.
- Nhãn bằng chữ tiếng Việt, ghi «máy khuyên» cạnh lối ẩn.
- AC: AC-1, AC-3.

### loc-o-dau (luồng dữ liệu, hai phương án)
- Loại: luồng dữ liệu hai làn.
- Lối khuyên (lọc ở trình duyệt): CSDL → máy chủ trả mọi tín hiệu → trang tính trạng thái từ bản vẽ + ba số → trình duyệt lọc theo phòng ban/trạng thái/người gửi, chia trang 50. Ghi chú: «vài chục tín hiệu/tháng; mở lại khi vượt vài trăm».
- Lối khác (lọc ở máy chủ): CSDL lọc phòng ban/người gửi + chia trang → trạng thái (sống ở bản vẽ, không ở CSDL) phải dịch thành danh sách mã ở trang trước khi gọi → thêm một thủ tục đếm riêng cho ba số. Ghi chú: «theo luật docs/api.md; ước thêm nửa vòng công».
- AC: AC-6, AC-7.

### khop-ba-so (luồng hội tụ)
- Loại: hai nguồn hội tụ vào một hàm.
- Nút: máy chủ CRM → (a) lệnh kéo về: phản hồi có tên + mã phòng ban → ánh xạ kéo về; (b) thẻ Tất cả: danh sách mọi tín hiệu → ánh xạ danh sách; cả hai → «hàm đếm chung» (+ bản vẽ LO-TRINH.html cùng commit → tập «đã có chỗ») → ba số: tín hiệu 30 ngày · phòng ban có tín hiệu (đếm theo mã) · quá 7 ngày chưa có chỗ → «bằng nhau ngày 12/11».
- AC: AC-2, AC-7, AC-8.
