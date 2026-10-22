# Hình tại điểm quyết định — sort-moi-truong

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — ngưỡng ẩn của Số, Chọn, Ô tích | 2 nhánh rẽ | `hoi-1-an-theo-kieu.html` |
| Hỏi-2 — thẻ Kanban: dòng trường tự tạo có nhãn hay chỉ giá trị | 2 nhánh rẽ | `hoi-2-the-kanban.html` |
| Hỏi-3 — ngưỡng tốc độ của AC-8 | 2 nhánh rẽ | `hoi-3-nguong-toc-do.html` |
| Hỏi-4 — view đã lưu sắp theo trường đã lưu trữ: im lặng hay báo một dòng | 2 nhánh rẽ | `hoi-4-view-truong-luu-tru.html` |
| d-1 bảng sort theo kiểu ở fields-shape | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-3 truy vấn hai đoạn | dưới ngưỡng: 2 bước, 0 nhánh | — |
| d-5 Kanban theo cùng sort | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-6 Điện thoại của Liên hệ sort được | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-7 hideBelow theo kiểu | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-9 hai trường đầu lên thẻ | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-15 hoà theo tên bản ghi | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-12, d-13 bỏ/dời phạm vi; d-14 chia S3 quanh DA14 | dưới ngưỡng: 1 bước, 0 nhánh | — |

## Đề bài hình

### hoi-2-the-kanban

- Loại: so sánh hai mockup một thẻ Kanban (hai cột).
- Nút: thẻ thoả thuận «Hợp đồng đại lý Q4» — tên, công ty «Công ty An Phát», Giá trị «120.000.000 ₫», Ngày chốt «5 thg 11», hàng cuối có ảnh đại diện người phụ trách và nhãn giai đoạn.
- Lối A (khuyên): dưới Ngày chốt hai dòng chữ nhỏ «Hoa hồng 1.234,5» và «Khu vực Miền Bắc», nhãn màu mờ, giá trị màu chữ thường; thẻ có Hoa hồng trống thì chỉ còn dòng Khu vực.
- Lối B: hai dòng chỉ giá trị «1.234,5» và «Miền Bắc», không nhãn, như các dòng có sẵn.
- AC liên quan: AC-7, AC-9.

### hoi-1-an-theo-kieu

- Loại: bảng ma trận kiểu × khổ (sm 640, md 768, lg 1024), ô tô đậm là «cột hiện từ khổ này».
- Hàng có cột chuẩn cùng kiểu (chép, không hỏi): Tiền sm; Người, Liên kết, Email, Điện thoại md; Chữ, Ngày lg.
- Ba hàng chưa có cột chuẩn cùng kiểu: Số — A (khuyên) sm như Tiền, B lg như hôm nay (hàng duy nhất hai lối khác nhau, tô viền); Chọn và Ô tích — lg ở cả hai lối.
- Ghi chú dưới bảng: ở 375 mọi cột trừ cột chính đều ẩn, chuẩn hay tự tạo; sắp vẫn được qua menu sort.
- AC liên quan: AC-6, AC-9.

### hoi-3-nguong-toc-do

- Loại: biểu đồ ngưỡng (threshold chart) một trục thời gian (ms), không số đo thật.
- Nút: vạch «trung vị sort Giá trị» (x), vùng xanh tới min(3x, 1000 ms) cho lối A (khuyên), vạch 300 ms cho lối B.
- Chú thích: lối A so tương đối nên ít nhiễu máy; lối B chặt hơn, dễ đỏ giả khi máy đang chạy đợt.
- AC liên quan: AC-8.

### hoi-4-view-truong-luu-tru

- Loại: luồng ba bước với một nhánh rẽ hai lối.
- Bước: người lưu view «Sắp theo Hoa hồng» → quản trị lưu trữ trường Hoa hồng → người mở lại view.
- Lối A (khuyên): bảng về thứ tự mặc định, cột Hoa hồng không còn, không tiêu đề nào có mũi tên, không chữ báo.
- Lối B: như A, thêm một dòng dưới thanh công cụ «Trường Hoa hồng đã lưu trữ — bảng về thứ tự mặc định».
- AC liên quan: AC-3.
