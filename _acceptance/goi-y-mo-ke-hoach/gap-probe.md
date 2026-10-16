---
slug: goi-y-mo-ke-hoach
at: 2026-10-16T08:20:47Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Máy tự quyết hai điểm chỉ người có (sổ d-20261016T081319Z-2): tính deal tạo thẳng ở thắng, và sinh lại gợi ý sau khi người đã bỏ qua; câu ngưỡng đã ký chỉ liên quan, không quyết [e24-qua-han-khong-phai-ha-tang#F1] [neo-thuoc-het-han#F1] | Người nhận lại gợi ý cho deal vừa bỏ qua sau một lần kéo nhầm cột; deal ghi muộn ở thắng sinh gợi ý thừa; tiếng ồn kéo tỉ lệ 50% xuống mà Cổng Phạm vi không ai hỏi | Dòng sổ chi-nguoi supersedes d-2, câu hỏi lên thẻ | human-gate1: dòng sổ Hỏi-4 (supersedes d-20261016T081319Z-2), khuyên giữ cả hai theo nháp DA3; AC-1, AC-2, E1, E2, E8 và mục 7 sửa theo câu trả lời |
| P1 | evals | Ba ô đi từ thắng của E1 bị gợi ý chờ sinh lúc dựng che, nên không đo điều kiện «giai đoạn đi không phải thắng»; E11 thiếu cặp cho điều kiện ấy | Bỏ điều kiện mà E1 vẫn xanh, hoặc bản đúng mà E1 đỏ giả | Bỏ qua gợi ý dựng trước lần chuyển đo, đếm delta; thêm cặp đột biến | fixed: E1 bỏ qua gợi ý dựng bằng boQuaGoiY thật rồi đếm delta; ca lưu trữ W→W2 dùng deal không có gợi ý chờ; thêm E11 (i) |
| P1 | contract | AC-8/E8 không khẳng định mã 3 khi không đo được; tỉ lệ 0/0 có thể ra xanh | Lần đọc 14 ngày đặt cửa sổ sai, lanChuyen 0, thước thoát 0 tức «sống» mà không đo gì | Ca mẫu số 0 và thiếu đối số phải thoát 3; cặp đột biến | fixed: AC-8 và E8 thêm ba ca mã 3 ('gy: thuoc xanh khi khong do'), ca xoá mọi gợi ý khẳng định mã 2; design mục 7 ghi luật; thêm E11 (j) |
| P1 | evals | Thông điệp ghim E11 (d) và (g) không phải thông điệp ra trước thật (chỉ mục duy nhất một phần ném trùng khoá; G3 lọt làm kiểm đếm ném trước) | S4 E11 đỏ ở (d), (g) vì sai thông điệp dù đột biến đã bị bắt | Ghim theo thông điệp thật, chạy thử tay từng cặp | fixed: E2 bọc lỗi trùng khoá vào 'gy: chan cho khong chan'; E7 kiểm G2/G3 trước kiểm đếm; E11 ghi luật chạy thử tay từng cặp trước khi ghim |
| P1 | evals | E6 kiểm âm «người khác không thấy thẻ» không có đối chứng dương; tự thử chỉ phủ một dòng | Phiên Q không dựng được sheet mà dòng vẫn đạt, thẻ hiện cho mọi người không bị bắt | Q phải thấy tên deal trước; tự thử phủ cả ba dòng | fixed: E6 đòi tên deal hiện trên sheet của Q (không thì KHONG DO DUOC, thoát khác 0); --tu-thu thêm ca chèn thẻ giả cho Q và chèn lại thẻ sau Bỏ qua |
