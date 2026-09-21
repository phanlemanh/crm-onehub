---
slug: quan-ly-danh-muc-30-ngay
at: 2026-09-21T11:35:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract, evals | Không phép đo nào gọi bảng cột khi số kế hoạch vượt một trang hoặc khi đường dẫn đang ở trang hai | Bảng cột dùng lại bộ tải có phân trang, 27 kế hoạch chỉ hiện 25 hoặc 2, mà E7 đến E10 vẫn xanh | Gieo quá một trang, gọi bảng cột ở bốn cách chia có và không có trang hai, đếm đủ | fixed: AC-14 và E14, ma trận tám ca |
| P1 | contract, evals | AC-3 không có thứ tự phụ khi trùng giá trị khoá; E3 không kiểm các trang nối lại đủ và không trùng | Sắp không ổn định, một kế hoạch hiện ở hai trang và một kế hoạch mất | Thứ tự phụ cố định, gieo có chủ ý giá trị trùng, kiểm hợp các trang bằng đúng tập đã gieo | fixed: AC-3 thêm thứ tự phụ; E3 gieo trùng và kiểm hợp trang [dieu-phoi-30-ngay-dau#F1 không áp] |
| P1 | evals | Nửa màn của E1 có thể dựng từ mẫu viết tay và chỉ đo dạng bảng [dieu-phoi-30-ngay-dau#F1] | Bảng cột lọc ra không kết quả hiện bốn cột rỗng; hoặc tên trường máy chủ trả khác mẫu tay | Màn lấy dữ liệu từ kết quả thủ tục thật; thêm ca bảng cột; bỏ lọc hiện lại dữ liệu và giữ cách xem | fixed: E1 dòng 5 đến 7, AC-1 nói rõ cả hai cách xem |
| P1 | evals | E13 không chụp dạng bảng ở 768; chặn cây chỉ canh app, không canh api | Dạng bảng tràn ngang ở 768 mà không ảnh nào thấy; api của cây khác ở 3301 lọt | Chụp dạng bảng ở 768; chặn cây phía api bằng thủ tục chỉ cây đang xét có | fixed: E13 thêm ảnh bảng 768 và bước chặn cây phía api |
| P2 | contract, evals | Tab trạng thái không có phép đo | Tab đã đóng bị máy chủ bỏ qua hoặc mất khi tải lại | Thêm tab vào AC-5, E5 và E6 | fixed: AC-5 thêm tab; E5 ma trận sáu ca; E6 đặt tab đã đóng |
