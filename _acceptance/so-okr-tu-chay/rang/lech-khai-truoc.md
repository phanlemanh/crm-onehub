# Lệch khai trước — phép thử tin số

Khai trước khi chạy `tin-so.mjs`, không sửa sau khi thấy số. Lệch là trị tuyệt đối
của số máy trừ số đếm độc lập (`dem-doc-lap.sql`, hay số đếm tay của người trên
production), cho kỳ và phạm vi toàn công ty. Ô dạng `n` là số bản ghi, dạng `n%` là
phần trăm của số đếm độc lập, làm tròn lên.

| Chỉ số | Trên dữ liệu gieo | Trên production | Vì sao production được lệch chừng đó |
| --- | --- | --- | --- |
| `thoa-thuan-chot-duoc` | 0 | 1 | Thoả thuận đã lưu trữ sau khi chốt không đếm; người đếm tay trên bảng thoả thuận có thể còn tính một cái như thế. |
| `thoa-thuan-moi` | 0 | 2 | Thoả thuận tạo rồi lưu trữ trong kỳ (tạo nhầm, gộp trùng) không đếm. |
| `goi-hen-duoc` | 0 | 0 | Chỉ cuộc gọi ghi trong chiến dịch với kết quả hẹn được; người đếm tay cũng đọc từ màn chiến dịch. |
| `buoc-xong-dung-han` | 0 | 0 | Cả hai phía đọc cùng ngày xong và hạn của bước; bước không có hạn không đếm. |
| `email-gui-ra` | 0 | 10% | Chỉ thư trong hộp thư đã đồng bộ được đếm; thư gửi từ hộp chưa nối, hay trước lần đồng bộ đầu, không có trong kho. |
