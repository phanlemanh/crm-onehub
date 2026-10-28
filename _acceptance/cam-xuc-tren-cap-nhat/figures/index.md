# Hình tại điểm quyết định — cam-xuc-tren-cap-nhat (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Một khoá lần cập nhật cho cảm xúc và trả lời; ba màn đọc cùng một tóm tắt (D5, D6, dòng sổ «Một hàm gom tóm tắt») | 3 bước nối tiếp (ghi → khoá checkInId → ba thủ tục đọc) — cần hình | mot-khoa-ba-cho |
| Hỏi-2 — lấp checkInId cho bình luận cũ theo luật VK12 | 3 bước nối tiếp (bình luận gắn KR → lần muộn nhất không sau lúc viết → ghi khoá) + 2 nhánh (trước lần đầu, không gắn KR) — cần hình | lap-check-in-id |
| Hỏi-1 — bộ cảm xúc | dưới ngưỡng: 1 lựa chọn, 2 lối, không bước | — (xem ảnh bản mẫu) |
| Hỏi-3 — vòng đời của cảm xúc | dưới ngưỡng: 1 bước (chạm lại là gỡ) | — |
| Hỏi-4 — khoá theo pha | dưới ngưỡng: 1 điều kiện | — |
| Lối xem tên trên màn cảm ứng (dòng sổ mot-loi) | dưới ngưỡng: 1 bước — có ảnh bản mẫu ST-camxuc-nhieu--mobile-375 | — |

## Đề bài

### mot-khoa-ba-cho
Loại: sơ đồ luồng dữ liệu. Nút: «Chạm cảm xúc (thaCamXuc)», «Trả lời (addComment + checkInId)», «OkrCheckIn — một lần cập nhật»,
«okrCamXuc (checkInId, người, loại)», «okrComment.checkInId», «tomTatCamXucCua — một truy vấn, dieuKienXemMucTieu», ba đích
«Cập nhật gần đây (mọi lần)», «Họp tuần (lần mới nhất của KR)», «Ngăn KR (lần cuối của tuần)». Nhãn bằng chữ tiếng Việt.
AC liên quan: AC-1, AC-3, AC-6, AC-7.

### lap-check-in-id
Loại: dòng thời gian một KR. Trục: lần t1 10:00, lần t2 12:00; bình luận 09:00 (→ rỗng, trước lần đầu), 11:00 (→ t1),
12:00 (→ t2, bằng thời điểm tính là «không sau»), 13:00 (→ t2); bình luận không gắn KR (→ rỗng). Chú thích: «thời điểm lần
cập nhật = submittedAt của phiên». AC liên quan: AC-8.
