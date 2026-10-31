---
slug: hex-trang-gioi-thieu
at: 2026-10-31T13:10:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ design-pass trích tiền lệ kanban-viec làm căn cứ mục tiêu; chưa có ảnh trước, không có ảnh sau | Chủ kho trả lời Hỏi-1 (gu nhìn) mà không thấy nhãn sau đổi | Ảnh trước 1280/375 + bản nháp sau dựng thử, đặt cạnh nhau trên thẻ; viết lại dòng sổ | fixed: dòng sổ mới (supersedes dòng 6, căn cứ một-lối); thước thêm HTG_XEM_SAU=1 dựng bản nháp sau bằng đổi lớp trên trang; ảnh truoc-* và nhap-sau-* gửi kèm thẻ |
| P0 | design | Dòng sổ chọn text-code-string ghi máy quyết, câu trích chỉ loại text-primary | Lệnh đổi sắc xanh mà chủ kho chưa được hỏi | Dòng chi-nguoi riêng, khuyên code-string, lối khác ring | fixed: Hỏi-2 (supersedes dòng 2), design doc trỏ Hỏi-2 |
| P1 | evals | Vế «ảnh sau chỉ khác ảnh trước ở 11 chỗ» không có thước máy; vế nền sáng = nền tối hằng đúng | Đổi thêm một màu ngoài 11 chỗ, E4 vẫn DUNG | So từng điểm trước/sau với mặt nạ là hộp bao 11 chỗ, đối chứng dương tiêm đổi màu ngoài mặt nạ | fixed: E4 (b) so ảnh có mặt nạ, đối chứng dương tô h1 đỏ cùng lượt; vế (a) ghi rõ là chặn hồi quy |
| P1 | evals | rang/man-cho.mjs không nằm trong paths của E2–E5 | Sửa bộ định vị không làm bằng chứng hoá cũ | Thêm man-cho.mjs vào paths, rà bao đóng import | fixed: thêm vào paths của E2–E5; bao đóng import còn lại (canh-cay.mjs, man-that-lib.mjs của hồ sơ man-cai-dat-noi-tieng-viet) là thư viện thước dùng chung, không khai |
| P2 | contract | Out of scope loại text-white mà không có dòng sổ | Cổng Giá trị thấy câu giao «đúng màu bộ giao diện» chưa đạt mà không có dấu vết | Dòng descope cho text-white | fixed: dòng descope trích câu giao «không còn mã màu hex» |
