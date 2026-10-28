---
slug: cam-xuc-tren-cap-nhat
at: 2026-10-27T09:20:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ quyết «không khoá theo pha» và «chu kỳ ẩn thì từ chối» trỏ câu trích về vết, câu ấy không quyết hai việc kia | Cổng Phạm vi duyệt một lựa chọn nghĩa sản phẩm (thả trong kỳ chấm điểm hay đã đóng) mà không người nào chọn; AC-6 chỉ đo chu kỳ ẩn | Thay câu trích thật hoặc đổi thành Hỏi; thêm ca pha vào E6 | fixed: tách ba dòng sổ — vết (trích docs/api.md về vet), chu kỳ ẩn (trích «Every write into a hidden cycle is refused»), khoá theo pha thành Hỏi-4 (chỉ người); AC-6 thêm pha; E6 thêm ca chấm điểm và đã đóng có đối chứng guiCapNhat bị khoá |
| P1 | contract | AC-6 và E6 bỏ hopTuan và addComment có checkInId | Người xem hẹp gửi addComment với objectiveId mục tiêu mở và checkInId của mục tiêu giới hạn — ghi được và lộ sự tồn tại | Hai ca mới trong E6 có đối chứng dương | fixed: AC-6 và AC-7 nói rõ checkInId thuộc mục tiêu khác trả khongThayMucTieu; design đọc lần với objectiveId và dieuKienXemMucTieu; E6 thêm addComment hai dạng và hopTuan |
| P1 | evals | E4 mở Họp tuần và ngăn KR lần đầu sau khi thả nên chiều đỏ không-làm-mới không đỏ được | Quên làm mới hopTuan trong cache.okr — người họp quay lại thấy chip cũ mà E4 vẫn xanh | Nạp đệm trước rồi mới thả, quay lại bằng liên kết | fixed: E4 thêm bước nạp đệm trước, đếm tải trang bằng 0, chiều đỏ chặn request hopTuan sau thaCamXuc |
| P1 | design | Tooltip không mở bằng chạm, chạm chip là đảo — «thấy ai đã thả» hỏng ở 375 | Người cập nhật trên điện thoại chạm giữ chip, tự gỡ cảm xúc của mình mà không thấy tên | Chốt lối xem tên trên cảm ứng; ảnh 375 | fixed: nút «Thả cảm xúc» mở bảng có danh sách tên từng loại (dòng sổ mot-loi); AC-5 viết lại; E5 thêm ca bảng không gọi onDao; E10 thêm ảnh bang-375; ST-camxuc-bang vào bảng trạng thái |
| P1 | evals | Phần màn của AC-1, AC-2 (lạc quan, lùi khi lỗi, toast) không eval nào đo | onError không lùi — chip đứng sáng với số sai khi chu kỳ ẩn | Eval DOM với thủ tục giả trả lỗi | fixed: thêm E12 cx-lac-quan (gắn AC-2) có chiều đỏ bỏ phần lùi; AC-2 nói rõ lùi về đúng số trước; AC-9 thêm ST-camxuc-dang-gui và ST-camxuc-loi |
