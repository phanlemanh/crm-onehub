# Hình tại điểm quyết định — tro-ly-okr-tom-tat (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Lịch mỗi ngày 06:00 tự nối, tóm tắt sáng hôm sau ngày cập nhật (sổ d-…-1, [GIẢ ĐỊNH] lịch) | 5 bước nối tiếp: xếp → việc tóm tắt → subagent nộp → nhắc 08:30 → bảng họp tuần | `nhip-mot-tuan` |
| Một lần nộp; câu trượt bộ kiểm bị bỏ; quá 30% thì giữ lại (sổ d-…-6) | 2 nhánh: câu qua / bị bỏ; bản hiện / cần xem | `bo-kiem-cau` |
| Ai thấy gì: chỉ phòng ban, gói công khai, dòng báo chỉ Trưởng phòng ban, bản cần xem và bản ẩn chỉ quản trị ([GIẢ ĐỊNH] ×4) | 3 nhánh theo nấc × trạng thái | `ai-thay-gi` |
| T2 không migration (sổ d-…-2) | dưới ngưỡng: 1 bước | — |
| Chạy design-pass (sổ d-…-3) | dưới ngưỡng: 1 bước | — |
| Judge chỉ in điểm, hiệu chỉnh dời (sổ d-…-4) | dưới ngưỡng: 1 bước | — |
| Không tô tuần trong Diễn biến (sổ d-…-5) | dưới ngưỡng: 1 bước | — |
| Sổ chi phí đọc loại việc từ hàng việc (sổ d-…-7) | dưới ngưỡng: 1 bước | — |

## Đề bài

### nhip-mot-tuan
- Loại: swimlane theo giờ (thứ Hai → sáng thứ Ba).
- Làn: Người (Cập nhật tuần) · Máy xếp (06:00) · Trợ lý OKR · Nhắc buổi sáng (08:30) · Bảng họp tuần.
- Nút: thứ Hai mọi người gửi Cập nhật tuần → 06:00 thứ Ba việc xếp: chu kỳ có ngày cập nhật hôm qua × phòng ban bật/ẩn có cập nhật → một việc tóm tắt mỗi phòng; tự đặt việc ngày mai → Trợ lý OKR đọc gói (KR công khai, lần cập nhật 7 ngày, không họ tên) và nộp câu → bộ kiểm → bản «hiện» hay «cần xem» → 08:30 Trưởng phòng ban nhận dòng «Tóm tắt tuần Phòng X · 3 KR đáng bàn» → mở Họp tuần, bấm trích dẫn ra lần cập nhật gốc.
- AC: AC-2, AC-4, AC-7, AC-9.

### bo-kiem-cau
- Loại: cây quyết định cho MỘT câu, rồi một nút gộp cho CẢ bản.
- Nút: câu → nguồn thuộc gói? → số khớp tập tham chiếu? → chữ chỉ chiều khớp dấu? → không họ tên? → không từ cấm? → không trùng? → «giữ»; mỗi «không» → «bỏ, ghi mã». Cả bản: bỏ > 30% hay 0 câu còn lại → «cần xem» (không hiện, không nhắc, chỉ quản trị thấy); còn lại → «hiện». Lúc hiện chạy lại cùng bộ kiểm.
- AC: AC-3, AC-4, AC-5.

### ai-thay-gi
- Loại: bảng/ma trận nấc × trạng thái → ai thấy gì.
- Hàng: nấc tắt · chế độ ẩn · bật (bản hiện) · bật (bản cần xem).
- Cột: thành viên và vai «chỉ OKR» trên bảng họp tuần · Trưởng phòng ban trong nhắc buổi sáng · quản trị chương trình ở màn Sức khoẻ.
- Ô: tắt → không ai, không việc chạy; ẩn → chỉ quản trị; bật-hiện → mọi thành viên (lọc câu theo quyền xem nguồn), Trưởng phòng ban nhận dòng (trừ người đã tắt), quản trị; bật-cần-xem → chỉ quản trị.
- AC: AC-5, AC-7, AC-9, AC-11.
