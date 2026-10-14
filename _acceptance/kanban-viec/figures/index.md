# Hình tại điểm quyết định — kanban-viec (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 thứ tự trong cột | 2 nhánh | hoi-nam-cau |
| Hỏi-2 cột Xong hiện gì | 2 nhánh | hoi-nam-cau |
| Hỏi-3 checklist | 2 nhánh | hoi-nam-cau |
| Hỏi-4 ngưỡng đếm kéo hay cả menu | 2 nhánh | hoi-nam-cau |
| Hỏi-5 ai thấy việc con | 3 nhánh | hoi-nam-cau |
| Luồng kéo một thẻ (cột cấm, máy chủ từ chối, hỏi lại cha) | 5 bước, 3 nhánh | luong-keo |
| Design-pass Nhóm 2: cột 256px tràn ở 1280 | 2 nhánh | dưới ngưỡng hình riêng — ảnh design-pass đã cho thấy |
| Design-pass Nhóm 2: Board thiếu canDrop | 0 nhánh (đã trong kế hoạch) | dưới ngưỡng: 0 |

## Đề bài

### hoi-nam-cau — cây giải pháp (solution tree), năm gốc
- Năm câu hỏi, mỗi câu một gốc; dưới mỗi gốc là các lối, lối máy khuyên đánh dấu «máy khuyên».
- Hỏi-1: (khuyên) thứ tự riêng từng người · không có thứ tự tay, xếp theo hạn.
- Hỏi-2: (khuyên) cột Xong 7 ngày gần nhất · cột Xong như danh sách (50 việc).
- Hỏi-3: (khuyên) checklist ngoài lượt này · làm checklist trong lượt (thêm bảng, vượt 12 tiêu chí).
- Hỏi-4: (khuyên) ngưỡng chỉ đếm kéo · đếm kéo cộng menu (không thiệt người dùng điện thoại).
- Hỏi-5: (khuyên) việc con mang gắn và người của cha · con thừa quyền thấy của cha · con riêng chỉ ba vai.
- Mỗi lá một dòng giá (đổi lại gì). AC liên quan: AC-5 (Hỏi-1), AC-1 (Hỏi-2), AC-10 (Hỏi-4), AC-7 và AC-8 (Hỏi-5).

### luong-keo — sơ đồ luồng (flowchart)
- Nút: Nhấc thẻ → «Cột này nhận thẻ không?» → không: cột mờ, thả không gửi gì → có: «Thẻ là việc cha còn con mở và đích là Xong?» → có: hộp hỏi lại (thôi: thẻ về chỗ cũ; đồng ý: đi tiếp) → gửi máy chủ → «Máy chủ nhận?» → có: vết đổi trạng thái nguồn «kéo» → không: thẻ về chỗ cũ, báo lý do, bảng tải lại.
- Nhãn bằng chữ người, không tên hàm. AC liên quan: AC-2, AC-4, AC-6, AC-9.
