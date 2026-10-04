# Hình tại Cổng Phạm vi — man-okr-truoc-r1

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 Hồi ý thu gọn mặc định | 2 trạng thái (gọn ↔ mở), không rẽ nhánh | dưới ngưỡng: 2 |
| d-…-2 + d-…-6 Cập nhật tuần «đã xong» và form sửa | 4 bước nối tiếp (gửi → tải lại → Sửa → gửi lại) + 3 nhánh khi mở trang (0 / một phần / đủ KR) | cần hình: `cap-nhat-tuan-trang-thai` |
| d-…-3 Toàn cảnh giữ cách đếm, đổi chữ | 1 bước | dưới ngưỡng: 1 |
| d-…-4 R1m-7 → R1d | 0 bước trong lượt | dưới ngưỡng: 0 |
| d-…-5 bỏ design-pass | 0 bước | dưới ngưỡng: 0 |
| Coverage [GIẢ ĐỊNH] gửi lần hai cùng tuần | 1 bước | dưới ngưỡng: 1 |

## Đề bài `cap-nhat-tuan-trang-thai`

- Loại hình: sơ đồ trạng thái (state machine), một màn «Cập nhật tuần».
- Nút: «Mở trang» → rẽ ba nhánh theo số KR đã cập nhật tuần này: «0 KR → Form (ST-capnhat-dangdien)»,
  «một phần x/y → Form + dòng "Đã gửi x/y KR tuần này" (ST-capnhat-motphan)», «đủ → Đã xong tuần này
  (ST-capnhat-daxong)»; nhánh thứ tư «không phụ trách KR → Trống (ST-capnhat-rong)».
- Cạnh: Form —Gửi→ «Đã gửi (ST-capnhat-dagui)» —Tải lại→ Đã xong; Đã xong —«Sửa cập nhật»→ Form sửa
  (số điền sẵn, mức tự tin chưa chọn, «Gửi 0» tắt) —chọn mức KR cần đổi, Gửi→ Đã gửi.
- Nhãn chữ trên cạnh bằng tiếng Việt như trên; tô đậm hai nút mới (Đã xong, Form sửa).
- AC liên quan: AC-3, AC-4, AC-5.
