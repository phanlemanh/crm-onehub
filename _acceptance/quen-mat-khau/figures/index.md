# Hình tại điểm quyết định — Cổng Phạm vi, quen-mat-khau

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 gửi thư ở nền bằng waitUntil | 4 bước nối tiếp (xin → trả lời → nền → thư đi) | luong-nen |
| d-4 dọn chìa còn treo trước khi thư báo chạy nền | 4 bước nối tiếp (đặt mật khẩu → dọn chìa → trả lời → thư báo) | luong-nen |
| d-3 cấu hình thư đọc lúc gọi, cờ bật/tắt | 2 nhánh rẽ (có thư / chưa có thư) × 2 màn | co-bat-tat |
| d-2 Resend ở lại trong packages/auth | 2 nhánh, đã chốt trong chat (Q2 = A) | dưới ngưỡng: đã quyết, không còn rẽ |
| d-5 form giữ tiêu đề cục bộ | 1 bước | dưới ngưỡng: 1 |
| d-6 bỏ design-pass | 1 bước | dưới ngưỡng: 1 |
| d-7 không giới hạn theo địa chỉ nhận | 1 bước | dưới ngưỡng: 1 |
| d-8 không đo chênh lệch mức DB | 1 bước | dưới ngưỡng: 1 |
| [GIẢ ĐỊNH] tài khoản chỉ vào bằng Google cũng xin được | 1 bước | dưới ngưỡng: 1 |

## Đề bài hình `luong-nen` (loại: sequence, hai làn thời gian)

- Nút: Người dùng · Trang xin liên kết · Máy chủ xác thực · Kho (chìa) · Dịch vụ thư.
- Luồng 1 «xin liên kết»: người gửi địa chỉ → máy chủ ghi chìa (chỉ khi có tài khoản) → **trả lời ngay, cùng một câu cho mọi địa chỉ** → phần nền: kiểm còn quyền vào → gửi thư có liên kết. Nhãn: «câu trả lời không chờ thư» (AC-4, AC-5, AC-6).
- Luồng 2 «đặt lại mật khẩu»: mở liên kết → đặt mật khẩu → tiêu thụ chìa này → **dọn mọi chìa còn treo (chờ xong)** → trả lời → phần nền: thư báo «vừa được đổi». Nhãn: «dọn chìa không phụ thuộc thư» (AC-7, AC-10).
- Phần nền tô khác màu, ghi «chạy sau khi đã trả lời».

## Đề bài hình `co-bat-tat` (loại: flowchart, 2 nhánh)

- Nút gốc: «Đã khai khoá gửi thư?».
- Nhánh có: màn đăng nhập hiện «Quên mật khẩu?» → trang xin liên kết mở được khi chưa đăng nhập (AC-2).
- Nhánh không: màn đăng nhập không có liên kết → gõ thẳng trang xin liên kết thì về màn đăng nhập → người dùng nhờ quản trị như trước (AC-1).
- Nhánh phụ: khai một nửa → máy chủ không khởi động, báo tên hai biến (AC-3).
