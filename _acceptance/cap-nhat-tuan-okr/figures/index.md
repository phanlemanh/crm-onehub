# Hình tại điểm quyết định — cap-nhat-tuan-okr (Cổng Phạm vi)

Kê từ artifact cuối S1: sổ quyết định chờ seal (8 dòng), chín dòng `[GIẢ ĐỊNH]` trong Coverage, năm finding phản biện đã sửa (không finding nào đẩy lên người). Ngưỡng N5: từ ba bước nối tiếp hoặc từ hai nhánh rẽ → cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| Một hàm cho tin và thẻ: dữ liệu OKR → `viecCanNhac` → hàng nhắc → tin một lần / thẻ ba chỗ (d-1, d-4, AC-5, AC-7, AC-8) | 4 bước nối tiếp, 2 nhánh (đã nối kênh / chưa nối) | cần hình → `mot-ham-hai-loi-ra` |
| Tuần của một KR: ngày cập nhật → nhắc mỗi sáng tới Chủ nhật → im 14 → im 21 lên trưởng (giả định tuần, im 14/21, AC-5) | 4 mốc nối tiếp, 2 nhánh (đã gửi / chưa) | cần hình → `tuan-cua-mot-kr` |
| Phiên cập nhật đo giây ở máy chủ: mở màn → điền → gửi → đóng phiên; lỗi thì gửi lại cùng phiên (d-2, AC-2) | 4 bước nối tiếp, 2 nhánh (ghi được / bị từ chối) | cần hình → `phien-cap-nhat` |
| Chuyển OKR mục riêng hay ghép hộp «Chuyển việc 30 ngày» (d-3, giả định 4) | 2 nhánh rẽ | cần hình → `chuyen-okr-hai-loi` |
| Người là chuỗi, KR có lần cập nhật không xoá được (d-5) | 1 nhánh | dưới ngưỡng |
| Bỏ design-pass (d-6) | 1 nhánh (bỏ/chạy) | dưới ngưỡng — cờ vàng trên thẻ |
| Không khoá ô giá trị hộp KR (d-7) | 1 nhánh | dưới ngưỡng |
| Cửa sổ 24 giờ (d-8) | 1 nhánh | dưới ngưỡng — nằm trong hình `tuan-cua-mot-kr` |
| Ghi hộ theo trưởng đơn vị; chỉ KR công bố ở chu kỳ đang chạy; thẻ hiện cả khi rỗng; mẫu số mọi KR theo phòng ban chính | mỗi cái 1 nhánh | dưới ngưỡng |

## Đề bài hình 1 — `mot-ham-hai-loi-ra`

- Loại hình: luồng dữ liệu, trái → phải.
- Nút: «Việc kế hoạch 30 ngày» và «KR, lần cập nhật, bình luận, theo dõi» → «Một hàm: việc cần nhắc của mỗi người» → rẽ hai: (a) «Mỗi sáng 08:30: một hàng nhắc mỗi người» → «Đã nối Zalo hoặc Slack? có → một tin duy nhất, «cập nhật tuần» đứng đầu · chưa → không gửi gì» ; (b) «Thẻ việc của tôi» → ba chỗ: «Tổng quan», «Tổng quan vai chỉ OKR», «Của tôi». Cả hai đầu ra trỏ về «Màn Cập nhật tuần» hoặc «Sheet mục tiêu». Chú thích: người chưa nối kênh vẫn có thẻ và màn — kênh chỉ là một lối vào thêm.
- AC liên quan: AC-5, AC-7, AC-8, AC-13.

## Đề bài hình 2 — `tuan-cua-mot-kr`

- Loại hình: dòng thời gian bảy ngày (thứ Hai → Chủ nhật) cộng hai mốc im.
- Mốc: «Thứ Hai = ngày cập nhật của chu kỳ: việc "N KR chờ cập nhật" xuất hiện» → «mỗi sáng nhắc lại tới khi gửi» → «gửi xong: hết việc» (nhánh) / «hết Chủ nhật chưa gửi: tuần sau lại có việc»; bên dưới: «im 14 ngày → nhắc người phụ trách», «im 21 ngày → thêm trưởng phòng ban (không có thì trưởng bộ phận)». Dải phụ: «được giao · nhắc tên · theo dõi: sự kiện trong 24 giờ qua».
- AC liên quan: AC-5, AC-6.

## Đề bài hình 3 — `phien-cap-nhat`

- Loại hình: tuần tự, trên → dưới, hai làn «Người» và «Máy chủ».
- Bước: Người mở màn (từ tin, thẻ, tab hay sheet) → Máy chủ ghi mốc mở (một phiên) → Người điền số, chọn mức tự tin, ghi chú → Người bấm Gửi → Máy chủ kiểm cả lô: hợp lệ → ghi mỗi KR một dòng, đổi số hiện tại, một dòng vết, đóng phiên với số giây = mốc gửi − mốc mở; không hợp lệ → từ chối cả lô, phiên còn mở → «Gửi lại» dùng cùng phiên. Chú thích: máy khách không có ô nào để khai số giây hay người ghi.
- AC liên quan: AC-1, AC-2, AC-4.

## Đề bài hình 4 — `chuyen-okr-hai-loi`

- Loại hình: so sánh hai lối (hai cột), mỗi cột một luồng ngắn.
- Cột trái «Lối chọn — mục riêng "Chuyển OKR…"»: menu hàng thành viên → «Chuyển OKR…» → xem trước «a KR, b mục tiêu» → chọn người nhận → chuyển KR và mục tiêu đơn vị ở chu kỳ còn ghi được; hộp «Chuyển việc 30 ngày» không đổi. Cột phải «Lối không chọn — ghép vào hộp đã ký»: hộp «Chuyển việc 30 ngày» thêm hai con số → đổi hợp đồng đã ký của hồ sơ kế hoạch 30 ngày → phải duyệt lại hồ sơ đó. Chú thích dưới: giá phải trả của lối chọn — quản trị bấm hai mục cho một người nghỉ.
- AC liên quan: AC-12.
