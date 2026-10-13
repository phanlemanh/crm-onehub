# Hình tại điểm quyết định — viec-chung

Kê từ sổ quyết định bước thiết kế (dòng chỉ-người-biết, Hỏi-1…Hỏi-5) và phản biện context sạch (hai mục
`human-gate1` gom vào Hỏi-5). Không có dòng `[GIẢ ĐỊNH]` nào trong Coverage. Ngưỡng N5: từ ba bước nối tiếp hoặc
từ hai nhánh rẽ.

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 — việc đứng đâu trên thẻ Hoạt động | 2 nhánh (ghim đầu thẻ · trộn vào dòng sự kiện) | cần hình: `hoi-1-cho-dung-cua-viec` |
| Hỏi-2 — người thực hiện đóng việc thế nào | 5 trạng thái, 2 nhánh (Xong thẳng · bắt buộc qua Chờ đánh giá) | cần hình: `hoi-2-do-thi-trang-thai` |
| Hỏi-3 — vai «chỉ OKR» và Việc ở lượt này | 2 nhánh (chặn tới DA5 · mở việc riêng ngay) | cần hình: `hoi-3-vai-chi-okr` |
| Hỏi-4 — chép việc cần làm cũ ở đâu | 3 bước nối tiếp (DA0b → DA1 → DA1b) và 2 nhánh | cần hình: `hoi-4-tach-da1b` |
| Hỏi-5 — thước đọc hai chỗ ngưỡng chưa nói | 2 nhánh × 2 chỗ | cần hình: `hoi-5-thuoc-dem-gi` |

## Đề bài từng hình

### hoi-1-cho-dung-cua-viec
- Loại: so sánh bố cục hai cột (wireflow tĩnh), mỗi cột một khung thẻ «Hoạt động» của một thoả thuận.
- Cột trái «Máy khuyên — khối Việc ghim đầu thẻ»: khối «Việc» (3 dòng việc mở theo hạn, dòng gập «Đã xong (2) · Đã huỷ (0)») rồi dòng sự kiện bên dưới (ghi chú, cuộc gọi, đổi giai đoạn).
- Cột phải «Lối khác — trộn vào dòng sự kiện»: việc nằm lẫn giữa ghi chú và cuộc gọi theo ngày tạo; một việc tạo tuần trước trôi xuống dưới.
- Nhãn bằng chữ tiếng Việt, không tên tệp. AC liên quan: AC-1, AC-2.

### hoi-2-do-thi-trang-thai
- Loại: sơ đồ trạng thái (state machine) năm nút: Chưa làm · Đang làm · Chờ đánh giá · Xong · Huỷ.
- Mũi tên theo bảng «Đồ thị trạng thái» của design doc; mỗi mũi tên ghi ai được làm (người giao, người thực hiện).
- Tô nổi mũi tên Chưa làm/Đang làm → Xong của người thực hiện (máy khuyên: được bấm Xong thẳng); ghi chú lối khác: «bắt buộc qua Chờ đánh giá khi người giao khác người thực hiện — mũi tên ấy biến mất với người thực hiện».
- AC liên quan: AC-3.

### hoi-3-vai-chi-okr
- Loại: bảng ma trận nhỏ 2 × 3 vẽ thành hình: hàng = (máy khuyên: chặn ở DA1, mở cùng DA5) · (lối khác: mở việc riêng ngay); cột = việc gắn đối tác · việc riêng không gắn gì · việc gắn KR (DA5).
- Ô ghi «không thấy / không nhận» hay «thấy, nhận được»; ô việc gắn đối tác luôn «không» ở cả hai hàng.
- AC liên quan: AC-5, AC-6.

### hoi-4-tach-da1b
- Loại: dòng thời gian ba mốc nối tiếp: DA0b gộp (16/10) → DA1 gộp → DA1b gộp.
- Nhánh máy khuyên: DA1 = Việc mới, việc cần làm cũ vẫn sống; DA1b = chép việc cũ sang (sửa dữ liệu production, cổng riêng) + đổi hai đường Tác nhân + bỏ «Việc cần làm» khỏi dòng thời gian.
- Nhánh lối khác: mọi thứ trong DA1, một lần sửa dữ liệu production trong cùng PR, DA1 gộp muộn hơn.
- Đánh dấu khoảng giữa DA1 và DA1b: «dòng thời gian có cả hai kiểu việc». AC liên quan: Out of scope dòng 1.

### hoi-5-thuoc-dem-gi
- Loại: phễu lọc hai vế của thước.
- Vế tỉ lệ: mọi việc tạo trong cửa sổ → bỏ việc tự giao → bỏ việc người giao Huỷ khi người thực hiện chưa chuyển (máy khuyên) → mẫu số → tử số: người thực hiện chuyển khỏi Chưa làm trước hoặc trong ngày hạn.
- Vế an toàn: việc gắn đối tác có người thực hiện hay người theo dõi vai «chỉ OKR» → chỉ đếm việc đang mở (máy khuyên) | đếm cả việc đã khép (lối khác).
- AC liên quan: AC-14, Đường đo.
