# Hình tại điểm quyết định — lo-trinh-doc-ban-chup (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Đường bản chụp: ai đẩy, lưu ở đâu, trang đọc gì (sổ: Actions đẩy · bảng dữ liệu · khoá thứ ba · lưu nguyên khối) | 5 bước nối tiếp (gộp → Actions → API → bảng → trang) | duong-ban-chup |
| Trang chọn nguồn — không bao giờ lùi (sổ: sha + giờ dựng, Preview đọc tệp đóng gói; AC-6) | 3 nhánh rẽ (Preview · cùng sha/commit sau giờ dựng · còn lại) | chon-nguon |
| Bỏ lịch sử, nút làm mới, màn trạng thái (descope) | dưới ngưỡng: 0 bước, 0 nhánh | — |
| Design-pass nhẹ; bỏ cảnh ngữ-cảnh | dưới ngưỡng: 1 bước | — |
| [GIẢ ĐỊNH] onehub gộp nối tiếp | dưới ngưỡng: 1 điều kiện, nằm trong hình chon-nguon | — |
| [GIẢ ĐỊNH] khối ~216 KB qua cầu REST | dưới ngưỡng: 1 điều kiện | — |

## Đề bài

### duong-ban-chup
- Loại: sơ đồ luồng dữ liệu (data flow), trái → phải, chữ tiếng Việt.
- Nút: «Gộp vào nhánh chính đổi lộ trình» → «GitHub Actions đọc và kiểm khối lộ trình» → «CRM nhận (khoá Đẩy lộ trình, chỉ chủ/quản trị; chỉ ghi khi mới hơn)» → «Bảng bản chụp — một hàng mỗi nguồn» → «Trang Lộ trình (làm mới ≤ 60 giây)». Nhánh song song: «Gộp» → «Vercel dựng app 1–2 phút» → «Tệp đóng gói» → «Trang».
- Ghi chú bên: «LT3: thay Actions bằng ứng dụng GitHub, thêm nguồn khác» ; «TH3: đọc tín hiệu từ cùng bản chụp».
- AC liên quan: AC-1, AC-2, AC-3, AC-4.

### chon-nguon
- Loại: cây quyết định (decision tree), trên → dưới.
- Gốc: «Có bản chụp đọc được?» → không → «Tệp đóng gói (bản dựng)». Có → «Bản Preview?» → có → «Tệp đóng gói». Không → «Cùng sha với bản đang chạy, hoặc commit sau giờ bắt đầu dựng?» → có → «Bản chụp — giờ lấy» ; không → «Tệp đóng gói — ghi (bản dựng)».
- Chú thích dưới: «Mọi ca mơ hồ chọn tệp đóng gói: chậm bằng hôm nay, không bao giờ cũ hơn bản đang chạy».
- AC liên quan: AC-5, AC-6, AC-7.
