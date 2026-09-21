---
slug: tac-nhan-khop-ma-doi-tac
at: 2026-09-21T10:55:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design, contract, evals | Không có tiêu chí cho ca email và số điện thoại chỉ về hai Cá nhân khác nhau; luật «khớp đúng MỘT» để ngỏ ca này | Email khớp A, số khớp B; bản cài tra email trước và ghép vào A — một ca ghép nhầm, đúng ngưỡng CHẾT | AC mới: hai tín hiệu trái nhau thì đề xuất cả hai, không ghi gì; đối chứng dương khi cả hai chỉ về A | fixed: AC-14 và E14, thiết kế ghi rõ ca này vào điểm 4 |
| P1 | contract, evals | Ngưỡng «không ca nào ghép nhầm trên mẫu đã biết đáp án» không có phép đo nào chạy một mẫu | Mỗi ca xanh riêng lẻ nhưng hỏng khi chung một cơ sở dữ liệu; Cổng Giá trị không có số | Bảng mẫu có đáp án chạy trên cùng một cơ sở dữ liệu, đếm ghép nhầm bằng 0 và số dòng đã chấm | fixed: AC-16 và E16, bảng mẫu có mọi ca kể cả ca P0 |
| P1 | design, contract, evals | Mâu thuẫn giữa AC-7 (không ghi đè mã khác) và AC-11 (người xác nhận thì ghi mã) | Người xác nhận ứng viên đã mang OH-1, API ghi đè thành OH-2, lô kế của OH-1 lạc | Chốt một hành vi cho AC-11 và thêm dòng đo | fixed: AC-11 từ chối xác nhận kèm lỗi nêu mã cũ; E11 dòng 5 — lựa chọn của máy, trình chủ kho tại Cổng Phạm vi |
| P1 | design, contract, evals | Hàng chờ chưa được tác nhân xử lý hoặc việc đã lỗi không có trạng thái trên màn; E13 phải chèn tay ứng viên | Tác nhân lỗi, hàng chờ nằm im ngoài khối — trái ngưỡng (c) | Trạng thái và AC mới; E13 gieo bằng điểm nhận cộng lượt chạy thật của tác nhân | fixed: AC-15, E15, trạng thái ST-choghep-dangcho; bước gieo của E13 đổi sang đường thật |
| P1 | evals | Không phép đo nào đi trọn từ điểm nhận sang tác nhân; E3 đến E9 dựng payload tay [dieu-phoi-30-ngay-dau#F1] | Bên ghi đổi tên khoá payload, mọi ca thật thành lỗi mà mọi phép đo vẫn xanh | Phép đo nối điểm nhận thật với dispatch thật; E2 kiểm payload qua đúng hàm đọc của tác nhân | fixed: E16 nối hai bài kiểm trên cùng một cơ sở dữ liệu; E2 dòng 5 kiểm payload bằng parseOnboardingIdentifyPayload |
