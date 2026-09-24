# Hình tại điểm quyết định — Cổng Phạm vi

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 lối B: câu lỗi ở API, app hiện e.message | 2 nhánh (A/B) nhưng đã chọn ở brainstorm — dưới ngưỡng: 1 nhánh còn sống | — |
| d-2 tác tử phân loại lỗi Zalo, trả kết quả có kiểu | 3 chặng nối tiếp (API → tác tử → Zalo) × 2 thao tác, rẽ 8 nhánh nguyên nhân | chuoi-nguyen-nhan |
| d-3 guiDuoc mặc định true (lệch phiên bản) | 2 nhánh (API mới/tác tử cũ · API cũ/tác tử mới) | chuoi-nguyen-nhan (dải chú thích lệch phiên bản) |
| d-4 bỏ design-pass | dưới ngưỡng: 1 bước | — |
| d-5 bỏ ui-observed | dưới ngưỡng: 1 bước | — |
| d-6 giữ mã 400 | dưới ngưỡng: 1 bước | — |
| d-7 đổi hai khẳng định E15 hồ sơ đã ký | dưới ngưỡng: 1 bước | — |
| d-8 chữ «dịch vụ nhắc việc» | dưới ngưỡng: 1 bước | — |
| [GIẢ ĐỊNH] × 3 ở Coverage | dưới ngưỡng: mỗi dòng 1 câu gạch/giữ | — |

## Đề bài: chuoi-nguyen-nhan

- Loại hình: flowchart/luồng ngang ba cột chặng — «Màn» (Kết nối › Zalo, Thông báo của bạn) → «API» (`zalo-cau-noi.service.ts`) → «Tác tử» (`zalo-bot-xuong.ts`) → «Zalo / Slack».
- Nút hỏng gắn ở chặng phát hiện: API phát hiện 5 nguyên nhân cầu nối (thiếu cầu nối · không tới được · 401 sai khoá · mã khác 2xx · sai khuôn JSON/HTML); tác tử phát hiện Zalo hỏng (getMe: mạng · 5xx · sai khuôn · ok:false 5xx → zalo-loi; 4xx hay ok:false 4xx → token sai) và gửi hỏng (sendMessage/Slack → guiDuoc false).
- Mỗi nhánh kết ở câu người dùng thấy (8 câu trong design) và một dòng log (API: warn «Zalo bridge call failed» + nguyenNhan; tác tử: console.error «[zalo] <method> <lớp>»), không có token.
- Dải chú thích dưới: lệch phiên bản — API mới + tác tử cũ đọc thiếu guiDuoc là đã gửi (đúng); API cũ + tác tử mới hiện «đã gửi» khi hỏng (Known limit, cho API lên trước).
- AC liên quan: AC-1, AC-2 (API) · AC-3, AC-4, AC-5 (tác tử) · AC-6 (log không token) · AC-7 (màn) · AC-8 (lệch phiên bản).
