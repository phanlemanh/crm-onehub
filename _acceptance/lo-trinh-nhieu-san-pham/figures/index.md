# Hình tại điểm quyết định — lo-trinh-nhieu-san-pham (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Lấy theo nhịp thay webhook (d-…-13, lệch L3 «báo khi nhánh chính đổi») | 5 bước nối tiếp (khai → cài ứng dụng → nhịp kiểm → bản chụp → trang) | luong-lay.html |
| Hỏi-3 sửa nguồn của một sản phẩm | 2 nhánh rẽ (giữ bản cũ / xoá ngay) | sua-nguon.html |
| Hỏi-2 dọn một sản phẩm | 3 bước nối tiếp (Lưu trữ → Khôi phục / Xoá vĩnh viễn) + 2 nhánh (có / chưa có lịch sử) | vong-doi.html |
| Hỏi-1 ai thấy một sản phẩm | dưới ngưỡng: 1 luật, không luồng | — |
| Hỏi-4 CRM chuyển sang ứng dụng GitHub | dưới ngưỡng: 1 bước (hoãn hay làm ngay) | — |

## Đề bài

### luong-lay — sơ đồ luồng (process), AC-1, AC-2, AC-3
Nút: Quản trị khai sản phẩm ở Cài đặt › Sản phẩm → Chủ kho cài ứng dụng GitHub chỉ đọc vào kho → Nhịp điều phối của
tác nhân (mỗi 5 phút): hỏi đầu nhánh; sha đổi thì tải LO-TRINH.html → Bản chụp của sản phẩm (một hàng, ghi một chiều) →
Trang Lộ trình: bộ chọn sản phẩm, chỉ người được cấp thấy. Nhánh phụ từ nhịp: hỏng (chưa cài, không thấy tệp, khối hỏng)
→ trạng thái ở Cài đặt, bản chụp cũ giữ nguyên. Ghi chú bên: CRM đi đường riêng (Actions đẩy, giữ như hôm nay).

### sua-nguon — cây rẽ hai nhánh, AC-5 (Hỏi-3)
Gốc: Quản trị sửa kho, nhánh hay đường tệp. Nhánh A (máy khuyên): giữ bản chụp cũ + dòng «nguồn vừa đổi» → nhịp kế
lấy được nguồn mới → thay hẳn bản cũ; nguồn mới sai → trang vẫn đọc được bản cũ, Cài đặt báo đỏ. Nhánh B: xoá bản chụp
ngay → trang trống → nhịp kế lấy được thì hiện; nguồn mới sai → trang trống tới khi có người sửa.

### vong-doi — sơ đồ trạng thái, AC-6 (Hỏi-2)
Trạng thái: Đang dùng (chưa có bản chụp) —Xoá (hỏi lại)→ Mất. Đang dùng (đã có bản chụp) —Lưu trữ (có Hoàn tác)→ Đã
lưu trữ —Khôi phục→ Đang dùng; Đã lưu trữ —Xoá vĩnh viễn (hỏi lại, mất bản chụp và người xem)→ Mất. Ghi chú: đã lưu trữ
thì biến khỏi bộ chọn và thôi lấy.
