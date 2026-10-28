---
slug: lich-su-moi-lan-cap-nhat
at: 2026-10-28T12:47:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Hỏi-1 chỉ cho đổi hai tệp VK7, trong khi năm hồ sơ đã ký mồi dienBienOutput.parse; đổi nguồn Lịch sử có thể làm đỏ bài đã ký khác (ứng viên HT5) [hop-tuan-tren-bang#F2] | Bài DOM đã ký mồi dienBien không mồi lichSuKr nên dòng Lịch sử không dựng và bài đỏ; sửa thì vi phạm AC-10 | Ma trận năm hồ sơ × có đo Lịch sử; eval chạy hẹp đúng các tệp đó trên cây | fixed: ma trận bằng grep — chỉ hai tệp VK7 đo Lịch sử; năm tệp còn lại mồi dienBien mà không đo; HT5 đo cảm xúc trên máy thật qua `[data-lich-su-kr] [data-hang-cam-xuc]`, AC-4 giữ hai dấu ấy; AC-10 thêm vế năm tệp vẫn xanh, eval E13 chạy hẹp năm tệp, nền đỏ thì phân loại đỏ sẵn |
| P1 | evals | E1 không so `luc`, `camXuc` với SQL; AC-8 đi qua máy chủ mà chỉ có eval DOM mồi tay | Máy chủ dựng camXuc theo tuần hay luc đầu ngày; E1, E4, E8 vẫn xanh vì mồi tay đúng | E1 so luc với SQL; thêm eval backend-effect thả cảm xúc thật rồi đọc lichSuKr | fixed: E1 (c) so luc bằng coalesce(giờ nộp, createdAt) và ngay bằng AT TIME ZONE; AC-8 gắn (cross-layer); thêm E12 backend-effect thả cảm xúc qua router caller thật, đếm SQL theo checkInId, đối chứng L2 |
| P1 | design | Nhãn HH:mm không tách hai lần cùng phút; thứ tự không có khoá phụ; dòng sổ d-3 ghi một-lối mà lối giây vẫn sống | E10 đòi nhãn khác nhau nên trượt hay chấm lỏng; E1 so thứ tự chập chờn khi createdAt trùng | So máy hai dòng đầu; ca cùng phút; khoá phụ id trong AC-1 | fixed: AC-1 thứ tự theo giờ gửi rồi id; E1 thêm ca hai lần cùng phút; E10 so data-lan-cap-nhat với hai id OkrCheckIn mới nhất từ SQL, bỏ đòi nhãn khác nhau; dòng sổ mới thay d-3, căn cứ là luc() của dòng tin «Cập nhật gần đây» |
| P2 | evals | E9 so với bản chụp tự ghi trên cây không kiểm được | Tách phần chung làm lệch dienBien rồi ghi lại bản chụp; E9 xanh | Sinh kỳ vọng từ nền hay đối chiếu độc lập | fixed: E9 tính kỳ vọng độc lập bằng SQL (lần cuối mỗi tuần theo giờ gửi, id), không bản chụp, có đối chứng hai lần khác giá trị |
| P2 | contract | Ca 30 lần khai ở trục A mà không AC nào chứa | Ca dài vỡ trên drawer mà người duyệt tưởng đã phủ | Thêm AC hay bỏ khỏi trục | fixed: AC-7 thêm vế 30 lần dựng đủ 30 dòng, E7 ô thứ năm; hình ở 375 xem trong ảnh ST-lsk-dai của design-pass |
