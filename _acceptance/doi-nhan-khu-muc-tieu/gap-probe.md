---
slug: doi-nhan-khu-muc-tieu
at: 2026-10-19T11:40:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ d-20261019T113217Z-7 cắt nhãn «Dây căn chỉnh» của packages/ui theo nguồn mục-tiêu, nhưng câu trích luật 19 chỉ nói chủ vùng, không cấm VK4 chạm; lối đổi một chuỗi chưa chết (cùng dạng [dich-ten-nganh-bang-bang#F1], [du-an-gantt#F1]) | Sau gộp, Sơ đồ góp vào vẫn có dây đọc «Dây căn chỉnh» — hai tên cho một khái niệm; E6 và E15 không bắt | Một dòng Hỏi lên Cổng Phạm vi, hoặc câu trích thật sự cấm | fixed: đổi luôn soDo.day và soDo.moTaDay (yêu cầu cham-tep V2-5), dòng sổ d-20261019T113734Z-10 thay d-7; AC-1, AC-2, AC-6, E1, E2, E6 phủ hai khoá |
| P1 | evals | AC-3 hứa ba màn nhưng thanh hành động khu không có eval; chữ dự phòng chỉ đo ở bảng độ phủ | hanh-dong-khu.tsx in tên thiếu translate="no" hay rơi về khoá dự phòng khác mà E3, E4, E15 vẫn xanh | Thêm vế dựng HanhDongKhu có tên và tên rỗng | fixed: E3 (d) HanhDongKhu có tên, (e) ChonDonVi và HanhDongKhu tên rỗng ở vi và en |
| P1 | evals | Thay đổi mã duy nhất (NhanHang đọc workspace.get) chỉ được ảnh chứng «nếu có lần lấy ý kiến»; mock viết tay; không ảnh en cho nhãn dài | Bộ mẫu không có lần lấy ý kiến nên E15 không bao giờ nhìn hàng gốc; nút en tràn không ai thấy | chup.mjs tạo lần lấy ý kiến qua đường thật; ảnh độ phủ bắt buộc; ảnh en; mock khai kiểu đầu ra thật | fixed: E15 mở lần lấy ý kiến qua service thật khi bộ mẫu chưa có, ảnh E15-do-phu bắt buộc (thiếu là KHONG DO DUOC), thêm hai ảnh en 1440 và phép đo nút không tràn; E3 (f) mock khai bằng RouterOutputs; AC-2 thêm vế không tràn |
| P1 | evals | E8 (d), E9, E10, E12 neo merge-base nên hết hạn hay đỏ giả sau khi gộp | Lượt kiểm sau gộp chạy E8 trên dải rỗng ra 'kiem-ke viet sau khi sua'; E9, E10, E12 xanh không răng | Neo theo cặp sha của vòng, dải rỗng thoát 2 | fixed: rang/dai.mjs trả merge-base..HEAD khi nhánh mở, M^1..M^2 của commit gộp khi đã lên onehub, dải rỗng thoát 2 'khong do duoc: dai rong'; bốn eval dùng chung |
| P2 | evals | E14 hỏi vai và ngữ cảnh mà bang-chu.md không có cột | Hội đồng đoán vai từ tên khoá, PASS hay FAIL phụ thuộc cách đoán | Thêm cột vai hoặc bỏ câu | fixed: kiem-ke có trường vai cho mọi mục goc, bang-chu thêm cột vai (E13 kiểm đủ), E14 bỏ câu ngữ cảnh và chấm vai theo cột |
