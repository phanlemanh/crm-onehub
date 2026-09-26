---
slug: toan-canh-okr
at: 2026-09-25T21:25:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals (E15) + contract (AC-8) | Câu đếm của Cổng Giá trị không được thử trên dòng do chính okr.hopTuan ghi; E15(b) gieo tay đúng khuôn câu SQL; hình after.tuan và after.donVi không ghim; AC-8 thiếu (cross-layer) và E14 không đọc bảng vết [zalo-qua-webhook#F1] [noi-zalo-cho-nguoi-moi#F1] | Bên ghi lưu tuan là Date đầu tuần giờ Việt Nam (JSON …T17:00:00.000Z hôm trước); SQL so chuỗi '2026-11-16' và fixture gieo tay cũng ghi '2026-11-16' nên E15 xanh; ngày 23/11 dữ liệu thật trả 0% và Cổng Giá trị đọc CHẾT oan | E15(b) sinh dòng bằng okr.hopTuan thật (ba trưởng tuần 16/11, một tuần khác, một thành viên), chạy nguyên văn tệp SQL → 3/5; ghim chuỗi after; chiều đỏ tuan là Date → 0; E14 đọc bảng vết; AC-8 gắn cross-layer | fixed: AC-8 gắn (cross-layer) và ghim hình after (chuỗi YYYY-MM-DD); design mục 4 ghim hình dòng; E15 viết lại (b) đi qua bên ghi thật, chiều đỏ Date; E14 thêm bước đọc bảng vết; thêm E28 lớp backend-effect cho AC-8 |
| P1 | design (Heatmap) + evals (E12) | Thang 0/10/25/45/70% không đạt 4.5:1 ở mọi bậc hai nền; chiều đỏ E12 dựa trên phép tính sai; không có bảng tương phản tính trước | Nền tối bậc 45% ≈ 4,4–4,6; người làm tự đổi thang không ai duyệt, hoặc E12 đỏ ở chiều xanh; chiều đỏ «bậc 3 giữ foreground» không đỏ được ở nền sáng | Design ghim độ trong và màu chữ từng bậc × nền kèm bảng 10 tỷ lệ; E12 so bảng; chiều đỏ lấy từ bảng | fixed: tính từ token thật (geist.css), đổi thang thành 5/15/30/65/85% với chữ foreground ở bậc 0–2, background ở bậc 3–4, bảng 10 tỷ lệ ≥ 5,4 ghim ở design mục 5; E12 đọc token từ geist.css và so bảng; chiều đỏ bậc 4 giữ chữ foreground ≈ 1,6 |
| P1 | contract (AC-12) + evals (E23) | Vế «mọi tab đọc theo kỳ đó» đi qua máy chủ nhưng AC-12 không gắn (cross-layer), không eval backend-effect, E23 chỉ kiểm chuỗi kyOkr trong URL | Toàn cảnh là trang máy chủ đọc kỳ đang chạy, bỏ qua kyOkr; URL giữ Q3 nhưng màn hiện số Q4; E23 xanh, lãnh đạo xem nhầm quý | AC-12 cross-layer; E23 gieo mục tiêu tên riêng Q3 và Q4, khẳng định DOM ba tab; bắt input tRPC cycleId = Q3; chiều đỏ tab đọc kỳ đang chạy | fixed: AC-12 viết lại (mọi tab gọi máy chủ với đúng kỳ và hiện mục tiêu kỳ đó) và gắn (cross-layer); design mục 3 thêm luật «mọi tab đọc theo kỳ đang chọn»; E23 gieo hai tên riêng, khẳng định DOM ba tab; thêm E29 bắt input tRPC |
| P2 | evals (E1) + contract (AC-1) | Luật facetCounts «trừ mặt của chính nó» không có trong AC-1; E1 chỉ so facetCounts ở lời gọi không lọc (ca suy biến) | Người làm đếm trên tập lọc đủ mặt; chọn người k thì menu chỉ còn {p1, k}, không chọn thêm người thứ hai; E1 xanh | AC-1 nêu luật; E1 thêm ma trận cho lời gọi {bp:B, phuTrach:[k]}; chiều đỏ đếm trên tập lọc đủ mặt | fixed: AC-1 nêu luật «trừ mặt của chính nó»; E1 thêm ma trận facetCounts của lời gọi đã lọc và chiều đỏ tương ứng |
| P2 | contract (AC-5) + evals (E9) | Giả định 3 hứa dưới 1 giây nhưng không AC nào hứa; E9 treo vào AC-5 với ngưỡng 1.500 ms và bỏ hopTuan | toanCanh hay hopTuan chạy 1,3 s: E9 xanh, Cổng Phạm vi không thấy ngưỡng bị nới; E9 đỏ thì không AC nào đánh fail | AC-5 nêu ngưỡng thời gian và số câu hỏi cố định; E9 dùng 1.000 ms, thêm hopTuan và danhSach có lọc | fixed: AC-5 thêm vế dưới 1.000 ms và số câu ở 5 đơn vị bằng ở 50; E9 đổi 1.000 ms, thêm danhSach có lọc và hopTuan (nhịp 2); design mục 3 ghi ngưỡng |
