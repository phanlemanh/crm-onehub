# Hình tại Cổng Phạm vi — bo-okr-mau

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Bỏ bản xem trước (descope, sổ quyết định dòng 3) | chuỗi 3 bước: app bản xem trước → api production → cơ sở dữ liệu production | `ban-xem-truoc.html` |
| Mốc thời gian trôi theo ngày nạp (approach, dòng 2) | chuỗi 4 bước: ngày nạp → tuần 6 → quý 4 mẫu 13 tuần → quý 3 mẫu 13 tuần liền trước; hai nhánh KR «tụt» / «im» | `moc-thoi-gian.html` |
| Tệp dữ liệu + ghi thẳng (approach, dòng 1) | 3 nhánh phương án | dưới ngưỡng nhìn: bảng ba phương án trong design đã đủ — không vẽ |
| Bỏ design-pass, bỏ đặc tả UX, không gắn vào kho mẫu phiên đo | 1 bước mỗi dòng | dưới ngưỡng |

## Đề bài `ban-xem-truoc`

- Loại: sơ đồ luồng dữ liệu, hai làn (hôm nay · sau khi chủ kho tách).
- Nút làn hôm nay: «Máy dev» → «Cơ sở dữ liệu cục bộ» (lệnh nạp chạy được); «Bản xem trước (app)» → «API production» → «Cơ sở dữ liệu production (Neon)»; mũi tên lệnh nạp tới Neon bị chặn, nhãn «từ chối — không phải máy cục bộ».
- Làn sau: «Bản xem trước (app)» → «API bản xem trước» → «Cơ sở dữ liệu bản xem trước» — nhãn «việc Vercel/Neon của chủ kho, ngoài hạng mục».
- AC liên quan: AC-9.

## Đề bài `moc-thoi-gian`

- Loại: trục thời gian theo tuần.
- Trục: «Quý 3 · mẫu» 13 tuần (đã đóng) liền trước «Quý 4 · mẫu» 13 tuần; trong quý 4, tuần 1…6 có Cập nhật tuần, tuần 6 chứa «ngày nạp» (mũi tên «hôm nay / --moc»), tuần 7–13 trống.
- Đánh dấu: KR «tụt» — lần cập nhật tuần 6 thấp hơn tuần 5; KR «im» — lần cuối tuần 3, cách ngày nạp ≥ 14 ngày; người «chưa gửi» — lần cuối tuần 5.
- Năm mẫu bao cả hai quý.
- AC liên quan: AC-4, AC-6.
