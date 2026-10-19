---
slug: ngan-ban-ghi-giu-danh-tinh
at: 2026-10-19T15:24:00Z
verdict: findings
p0: 3
p1: 1
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Căn cứ d-4 (bỏ đường-đo) sai nguồn: câu trích là dòng mẫu trống, và viện luật «lộ trình chỉ chứa việc dựng» vốn nói về hàng chờ người — cùng dạng [lam-moi-goi-y-ke-hoach#F1], [push-ghim-lai-t1#F1] | Cổng Phạm vi tin chủ kho đã chọn không đo; Cổng Giá trị gặp bảng ngưỡng CHƯA ĐO | Thay d-4 bằng dòng có căn cứ đúng hoặc thành câu hỏi người | fixed: d-20261019T152522Z-7 thay d-4 — ô đã ký không khai ngưỡng nên không có số để nối; trích CLAUDE.md «Đo trên dữ liệu thật … không phải cổng của việc dựng»; vòng không tự đặt ngưỡng thay người, ô trống vẫn hiện ở Cổng Giá trị |
| P0 | contract | Căn cứ d-3 (bỏ coverage-scan) đoán chứ không nêu ràng buộc; Trục A kể năm hàm đổi ngăn nhưng ma trận E1 chỉ dùng open và closeAll | Đóng bằng close() từ chồng hai về rỗng dựng lại mà không bài nào đỏ | Ma trận E1 phủ đủ năm hàm | fixed: AC-1 và E1 thành bảy bước open, lotDuoi, close, close, open, thayDinh, closeAll; Trục A ghi từng hàm; d-20261019T152522Z-6 thay d-3 với ràng buộc «mọi trục đóng và đếm được từ mã» |
| P0 | evals | Căn cứ d-5 chỉ loại so ảnh, bỏ sót MutationObserver và getAnimations; chiều đỏ E6–E8 chỉ tiêm vào chính script đo; E7 có thể xanh trên mã cũ | AC-4 đạt mà không chứng gì; lấy mẫu 40 ms đỏ giả lúc máy bận | Đo bằng observer và getAnimations; chiều đỏ trên phiên đo dựng từ bản sao mang mã cũ; AC-4 có ngưỡng | fixed: E6–E8 đo bằng MutationObserver và getAnimations(); E12 chạy chieuDo của man-lib trên bản sao mang nap-san cũ (thêm trễ 400 ms) đòi ba thông điệp ghim; AC-4 ngưỡng 150 ms và khai rõ là thước giữ-không-hồi-quy; d-20261019T152522Z-8 thay d-5 |
| P1 | evals | Chỉ một ui-check (AC-3); AC-4, AC-5 không có; nhật ký sáu ô không nằm trong bằng chứng; ảnh chụp cùng lượt lấy mẫu | Hội đồng không đối chiếu được; ảnh rơi lúc ngăn đã rời trang | Nhật ký thành tệp bằng chứng; tách lượt chụp; ui-check cho AC-4, AC-5 | fixed: evidence/gdt-man.log vào evidence_required; lượt chụp riêng làm chậm mười lần bằng CDP Animation.setPlaybackRate; thêm E10 (AC-4) và E11 (AC-5, ảnh gdt-mo-lai-1440.png) |
| P2 | contract | Trục D ghi ca «khoá đã có, cũ hơn máy chủ» nhưng AC-6 và E3 không có | Bản sửa chỉ đổ khoá thiếu vẫn qua E3, E4 | Thêm ca và chiều đỏ | fixed: AC-6 thêm vế «khoá cũ hơn nhận bản máy chủ»; E3 thêm ca; E5 thêm đột biến (4) «chỉ đổ khoá chưa có» ghim "gdt: khoa cu khong nhan ban may chu moi hon" |
