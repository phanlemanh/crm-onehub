---
slug: buoc-kara-bo-qua
at: 2026-10-09T16:19:48Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Chuỗi agent → kiểu kết cục chung → app không đo trọn; output viết tay theo khuôn bên đọc [soan-okr-khong-lac#F1] | Kiểu kết cục lược mất skipped, mọi eval vẫn xanh, màn thật vẫn «Chưa lưu được» | Ca đi qua eveToolOutcome bằng kết cục thật; đối chứng warning; chiều đỏ bỏ skipped khỏi kiểu | fixed: AC-2 gắn (cross-layer); E1 dòng 6 và E2b parse kết cục THẬT qua eveToolOutcome; E2 thêm đối chứng {stored:false}/{written:false} → warning |
| P1 | evals | Ma trận E1 viết tay, không dẫn xuất từ mọi chỗ trả stored:false; «No photo on the profile.» không có máy giữ | Gắn nhầm skipped cho ca không tìm thấy ảnh, E1 vẫn xanh | Ma trận dẫn xuất từ tệp + chiều đỏ ghim | fixed: rang/bo-qua-dung-cho.mjs đếm mọi khối stored:false trong portrait.ts, đòi skipped đúng hai lý do vô hại và vắng ở mọi lý do khác; chiều đỏ «No photo on the profile.» |
| P1 | contract | Thêm skipped:false vào mọi mục có thể làm đỏ bài kiểm cũ so tuyệt đối [luat-kho-vong-doi#F1] | Bài cũ đỏ, người cài phải chọn giữa sửa kỳ vọng (E7 đỏ) và giữ (AC-7 đỏ) | Quét bài cũ trước Cổng 1 | fixed: đã quét — không bài nào so tuyệt đối cả mục did, nhưng có bài so tập trường với tệp mẫu JSON; chọn lối skipped vắng khi không bỏ qua (sổ quyết định), AC-2 sửa theo |
| P2 | evals | E5 đo lời chỉ dẫn (tone) thay vì khung tạo tác nhân thật | Khung đọc điều kiện khác, vẫn hiện cảnh báo, E5 xanh | Render AgentToolStep thật, đối chứng dương | fixed: E5 render AgentToolStep thật (xin cham-tep export), kiểm icon cảnh báo vắng / có mặt ở đối chứng |
| P2 | contract | Không nói gì về các lượt Kara đã chạy trước bản này | Người duyệt mở bản ghi cũ thấy «Chưa lưu được», tưởng chưa lên | Out of scope + sổ quyết định | fixed: thêm Out of scope và dòng sổ descope |
