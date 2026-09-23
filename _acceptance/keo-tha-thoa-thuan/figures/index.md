# Hình tại điểm quyết định — keo-tha-thoa-thuan

| Điểm | Đếm | Hình |
|---|---|---|
| Thả một thẻ: ghi ngay, hỏi lý do, hay không làm gì (d-…-4, AC-5/6/7/8) | 3 nhánh rẽ (cùng cột · cột thua · cột khác) + 2 nhánh sau khi ghi (nhận · từ chối) | luong-tha.html |
| Bảng cột là chế độ của Board, chạy bằng kanban ReUI (d-…-1, d-…-6) | dưới ngưỡng: 1 bước, 0 nhánh | — |
| deals.board thay vì dùng lại deals.list (d-…-2) | dưới ngưỡng: 1 bước | — |
| Không sắp trong cột (d-…-3) | dưới ngưỡng | — |
| [GIẢ ĐỊNH] cảm biến chạm đủ dùng trên điện thoại | dưới ngưỡng | — |

## Đề bài: luong-tha

- Loại hình: flowchart (quyết định rẽ nhánh)
- Nút: «Thả thẻ» → rẽ «cùng cột / ra ngoài / Esc» → «Không gửi gì, thẻ ở nguyên» ; rẽ «cột Closed lost hoặc Unqualified» → «Hộp thoại lý do» → «Lưu» → «Ghi setStage + lý do» / «Huỷ» → «Thẻ về cột cũ, không ghi» ; rẽ «cột khác» → «Thẻ dời ngay (lạc quan)» → «setStage» → «Nhận: đầu hai cột đổi số» / «Từ chối: thẻ về cột cũ + câu lỗi của máy chủ»
- Nhãn bằng chữ tiếng Việt, tên giai đoạn giữ tiếng Anh như màn
- AC liên quan: AC-5, AC-6, AC-7, AC-8
