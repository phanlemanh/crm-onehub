# Hình tại điểm quyết định — ngan-ho-so-trong-lo-trinh (Cổng Phạm vi)

Điểm quyết định kê từ artifact cuối S1: 10 dòng sổ chờ seal, 2 dòng `[GIẢ ĐỊNH]` trong Coverage, 0 finding phản
biện xử lý `human-gate1`, 1 chỗ lệch hàng gốc (hàng ghi «PR», vòng dùng đường tìm PR theo mã commit).

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-3 tầng chủ kho lọc ở máy chủ (+ giả định «vai owner là chủ kho») | 4 bước nối tiếp, 2 nhánh rẽ theo vai | `luong-vai.html` |
| d-…-7 E7 mã 2 tới kit 2.27 + thứ tự gộp | 5 bước nối tiếp | `thu-tu-gop.html` |
| d-…-1 bỏ ô trạng thái trùng | dưới ngưỡng: 1 bước | — |
| d-…-2 không thu gọn đoạn dài | dưới ngưỡng: 1 bước | — |
| d-…-4 chụp trên bản mẫu thay trang thật | dưới ngưỡng: 1 nhánh | — |
| d-…-5 bỏ đường đo mức dùng (đếm tay) | dưới ngưỡng: 1 bước | — |
| d-…-6 tìm PR theo mã commit (+ giả định đường tìm PR đủ) | dưới ngưỡng: 1 bước | — |
| d-…-8 thiết kế đi cùng hợp đồng tới cổng | dưới ngưỡng: 1 bước | — |
| d-…-9 nghi thức thiết kế không đồng bộ | dưới ngưỡng: 1 bước | — |
| d-…-10 đính chính lý do bỏ ô trạng thái (thay d-…-1) | dưới ngưỡng: 1 bước | — |

## Đề bài `luong-vai`

- Loại hình: luồng dữ liệu (data flow) có một chỗ rẽ.
- Nút: «LO-TRINH.html (kit vẽ)» → «Bộ đọc + khuôn (đọc một lần, có cache)» → «Trang máy chủ đọc vai người xem» → rẽ hai: «vai owner: giữ tầng chủ kho» / «vai khác: gỡ tầng chủ kho (null)» → «Mã khách (trình duyệt) — chỉ nhận dữ liệu đã lọc» → «Ngăn: Tóm tắt hồ sơ (mọi người) + Số liệu làm việc (chỉ khi có tầng chủ kho)».
- Nhãn bằng chữ: «máy chủ» và «trình duyệt» tách bằng một đường biên có tên «ranh giới gửi xuống trình duyệt».
- AC liên quan: AC-4, AC-5.

## Đề bài `thu-tu-gop`

- Loại hình: dòng thời gian (timeline) năm mốc.
- Nút: «12/10 — vòng làm trên tệp mẫu kit nhánh chính; E7 trả mã đã khai 2, phép đo bản chép của LT1 đỏ» → «PR mở, CI đỏ ở phép đo LT1 — đúng điều kiện» → «15/10 — crm nhận kit 2.27 (khối bản 2 ở gốc)» → «gộp onehub vào nhánh, ghim lại LT1 và LT1b một làn (E7 trả 0, đọc tệp gốc)» → «chủ kho bấm gộp = lên production».
- Nhãn bằng chữ: đánh dấu ngày 14/10 «hạn crm: mọi phòng ban dùng thật — LT1 đã lên, ngăn hồ sơ chưa».
- AC liên quan: AC-7, AC-8.
