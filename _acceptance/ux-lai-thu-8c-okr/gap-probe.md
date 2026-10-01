---
slug: ux-lai-thu-8c-okr
at: 2026-09-30T03:12:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract, evals | AC-7 và E10 ghim Sức khoẻ và toàn cảnh, bỏ mất tiến độ gộp mà thiết kế và sổ d-4 hứa giữ luật 8c; E10 chỉ so hai người | đổi countByUnit kéo theo điều kiện dùng chung của phép gộp tiến độ; tiến độ gộp của khối tính G cho V mà không cho N; E10 vẫn xanh | ma trận 3 loại số × 4 người = 12 ô, ảnh chụp trước lượt; chiều đỏ «tien do gop V != N» | fixed: AC-7 nêu ba loại số và bốn người; E10 thêm phần 2 với 12 ô ghim trên onehub 79168cbe và chiều đỏ riêng |
| P1 | evals | E1 so hai tập mà không có số kỳ vọng từng ô, không bắt G có mặt ở từng danh sách, chiều đỏ chỉ ở byUnit, không nêu thủ tục họp tuần [gioi-han-duyet-cay-okr#F1] | G vắng ở họp tuần hay cây căn chỉnh thì hai vế cùng rỗng và ô xanh; bộ dựng họp tuần gán cứng cong-khai lọt | ma trận 13 ô viết trước, gieo cập nhật tuần cho G, chiều đỏ mỗi danh sách | fixed: E1 có ma trận 13 ô với số kỳ vọng, nêu okr.hopTuan, gieo cập nhật tuần, chiều đỏ riêng cho từng thủ tục |
| P1 | evals | E15 không có bảng ảnh → chuỗi phải có; chữ phụ thuộc ngày và dữ liệu; không đặt trần 5 và chính sách cảnh báo | chạy ngày khác thì ảnh tra-lai-truoc đỏ giả; bộ mẫu không trần thì ảnh chuyen-vuot-tran chụp sai; người đo nới chuẩn tại chỗ | bảng 10 dòng ảnh → chuỗi, ngày tính lúc chạy, bước đặt trần qua API | fixed: E15 có bảng 10 dòng, chuỗi lấy từ messages, số từ dữ liệu phiên, ngày dd/MM lúc chạy, bước 2 đặt trần 5 và chính sách cảnh báo, ảnh thiếu chuỗi thoát 1 |
| P2 | contract, evals | ST-gonguoi-dang-tai và lỗi xem trước trần không có trong AC-3, AC-6; E3, E9 không có ca đang chờ hay lỗi | hộp gỡ khoá «Gỡ» khi đang đọc, hộp chuyển coi lỗi xem trước là chặn — trái sổ d-3 và luồng lỗi đã duyệt, mà bài vẫn xanh | ca treo trong E3, ca lỗi trong E9, chiều đỏ | fixed: AC-3 thêm vế đang đọc, AC-6 thêm vế lỗi; E3 thêm ca S treo, E9 thêm ca lỗi, mỗi ca có chiều đỏ |
| P2 | evals | AC-12 hứa mọi trạng thái ở 1440 và 390 nhưng E15 chỉ đo 390 cho ba trạng thái | hộp chuyển có câu cảnh báo dài tràn ngang ở 390, E15 vẫn xanh | ma trận 10 × 2 = 20 ảnh, kiểm tràn cho trang và hộp | fixed: E15 viết trước 20 ảnh, kiểm scrollWidth cho trang và hộp đang mở ở mọi ảnh 390 |
