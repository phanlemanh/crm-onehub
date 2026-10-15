# Hình tại điểm quyết định — hop-thong-bao-tren-web (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-2 — mục lặp (d-20261014T025239Z-10) | hai nhánh (đã đọc / chưa đọc) × hai nhánh (còn liên tục / vắng rồi quay lại) | `muc-lap.html` |
| Ghi thông báo trước khi chọn kênh (d-20261014T025239Z-1) | năm bước nối tiếp + hai nhánh kênh | `duong-ghi.html` |
| Hỏi-1 — vòng đời 90 ngày (d-20261014T025239Z-9) | dưới ngưỡng: một bước, không nhánh | — |
| Tám lựa chọn máy đã quyết còn lại | dưới ngưỡng: mỗi lựa chọn một bước | — |

## Đề bài `muc-lap.html`

- Loại: timeline bốn sáng (Thứ Hai → Thứ Năm) cho MỘT mục nhắc «Việc Gửi báo giá cho Hoà Phát quá hạn».
- Hàng 1 (luật máy khuyên): T2 có mục → 1 thông báo mới · T3 còn mục, người đã đọc → không thông báo mới, nội dung cập nhật · T4 mục vắng (việc đã dời hạn) → không gì · T5 mục quay lại → 1 thông báo MỚI.
- Hàng 2 (lối khác — báo lại mỗi sáng như Zalo): T2, T3, T5 mỗi sáng một thông báo mới → chuông có 3 dòng cho cùng việc.
- Nhãn bằng chữ tiếng Việt; AC liên quan: AC-2.

## Đề bài `duong-ghi.html`

- Loại: luồng (flowchart) của lượt nhắc buổi sáng 08:30 cho một người.
- Bước: tính mục cần nhắc → ghi danh sách mục đã tính vào lượt → ghi thông báo vào chuông → chọn kênh → (có Zalo/Slack: gửi tin như hôm nay) / (không kênh: đóng lượt «không có kênh» — thông báo đã nằm trong chuông).
- Đánh dấu chỗ hôm nay mục bị bỏ (nhánh không kênh) và chỗ lệnh đối chiếu đọc (danh sách mục đã tính vs thông báo).
- AC liên quan: AC-1, AC-3, AC-12.
