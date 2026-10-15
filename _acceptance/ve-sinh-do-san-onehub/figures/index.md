# Hình tại điểm quyết định — ve-sinh-do-san-onehub (Cổng Phạm vi)

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Cách B + chỉ đổ khi ngăn có bản ghi (d-…-1, d-…-12) | 5 bước nối tiếp (ngăn về trước → ngăn tạo khoá rỗng → trang về → HydrationBoundary hoãn → render lệch) | cần hình — `hydrat-truoc-sau` |
| Hỏi-1: miễn `hinh` theo tên hay theo thành phần (d-…-11) | 2 nhánh rẽ | cần hình — `hoi-1-hinh` |
| 403: chỉ tải luồng cho người mở (d-…-2) | 2 bước | dưới ngưỡng: 2 bước, không rẽ |
| Bảy hồ sơ ghim lại (d-…-5) | 1 bước | dưới ngưỡng: 1 bước |
| Các dòng descope (d-…-7…10) | 0 | dưới ngưỡng: không luồng |

## Đề bài

### hydrat-truoc-sau (sequence, hai làn so sánh)
- Loại: sơ đồ trình tự hai cột «Trước sửa» / «Sau sửa», trục dọc là thời gian phía trình duyệt.
- Nút: Máy chủ (stream) · Ranh giới ngăn bản ghi · Bộ đệm truy vấn · Ranh giới trang · React hydrate.
- Trước: ngăn về trước → ngăn tạo khoá rỗng (users.list…) → trang về với dữ liệu → HydrationBoundary thấy khoá đã có → hoãn sang useEffect → render đầu đọc rỗng ≠ HTML → «Hydration failed».
- Sau: máy chủ nạp sẵn khoá cho ngăn → NapSanKhiMoNgan (chỉ khi có record=) đổ dữ liệu vào bộ đệm → trang về cùng dataUpdatedAt → không hoãn → render đầu khớp HTML. Không record= → không đổ gì.
- AC: AC-1, AC-2, AC-3, AC-12.

### hoi-1-hinh (decision, hai nhánh)
- Loại: cây quyết định một gốc, hai nhánh.
- Gốc: «moi-chuoi bắt nhầm hinh="the" của KhungXuong».
- (a) khuyến nghị: khai `hinh` theo tên trong bản khai riêng của lát cài đặt — sửa 1 dòng JSON; rủi ro: thành phần khác của lát dùng prop hinh mang chữ thì lọt.
- (b) chiều theo thành phần `KhungXuong.hinh` trong khuôn bản khai + moi-chuoi.mjs — hẹp hơn; giá: sửa mã thước năm lát dùng chung, thêm chiều đỏ, ~1 giờ máy.
- AC: AC-6.
