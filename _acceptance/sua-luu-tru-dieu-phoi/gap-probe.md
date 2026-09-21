---
slug: sua-luu-tru-dieu-phoi
at: 2026-09-22T00:00:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design, evals | Máy chủ không có trường báo «đã từng dùng»; E14 dựng dữ liệu giả viết tay, E15 chỉ đo purge [dieu-phoi-30-ngay-dau#F1] | Màn hiện «Xoá vĩnh viễn» cho mọi mục đã lưu trữ rồi bị 400, hoặc không mục nào có nút, mà E14 và E15 vẫn xanh | Trường đầu ra `purgeable`, E15 đo danh sách qua HTTP, E14 dựng dữ liệu giả qua schema đầu ra thật | fixed: design thêm `purgeable` ở listDepartments/listTemplates; E14 dữ liệu giả đi qua departmentListOutput/templateListOutput kèm chiều đỏ bỏ trường; E15 đo purgeable cho bốn đối tượng qua HTTP |
| P1 | contract, evals | Siết `startedAt` về `z.iso.date()` mà không đo hộp thoại tạo kế hoạch của vòng trước gửi dạng gì | Hộp thoại cũ gửi ngày có giờ, mọi lần tạo kế hoạch từ màn bị 400, 26 eval vẫn xanh | Eval hộp thoại: một lời gọi, đầu vào qua schema đã siết, ngày lịch địa phương lúc 23:30 giờ Việt Nam | fixed: thêm E27 (AC-12), AC-12 nêu rõ hộp thoại của vòng trước |
| P1 | contract, evals | Ô vai trò «chủ» không được đo; không ma trận đủ vai trò cho canManageOnboarding | Hàm viết thành role === admin, chủ kho bị 403 và màn khoá hết nút với chủ, E16 và E17 vẫn xanh | Eval đơn vị ma trận WORKSPACE_ROLES cộng null; phiên chủ trong E17 | fixed: thêm E28 (packages/auth, ma trận bốn dòng, khớp tập vai trò); E17 có ba cookie phiên chủ, quản trị, thành viên |
| P2 | contract, evals | Ma trận lỗi AC-14 và E25 thiếu «sửa khuôn» và không tách bộ phận với khuôn | updateTemplate bị từ chối, hộp thoại đóng làm mất các bước vừa sửa, E25 vẫn xanh | Ma trận thao tác nhân đối tượng, có ca sửa khuôn giữ giá trị | fixed: AC-14 liệt kê sửa khuôn và hai đối tượng; E25 thành 14 ô nhân 2 bằng 28 ca, chiều đỏ ghim ca «sửa khuôn (a)» |
| P2 | evals | E26 không gieo dữ liệu; cổng ghi cứng; chặn cây không kiểm cổng api | Bàn đo không có dữ liệu lưu trữ nên không chụp được mục Đã lưu trữ, hoặc api của cây khác ở 3301 chụp ra màn lỗi | Bước gieo bằng thủ tục thật qua HTTP; cổng từ APP_URL/API_URL; xin onboarding.access qua API_URL | fixed: E26 thêm bước GIEO qua HTTP, cổng lấy từ APP_URL/API_URL, chặn cây xin cả onboarding.access |
