---
slug: gieo-nguoi-chiu-song-song
at: 2026-10-14T07:30:26Z
verdict: findings
p0: 1
p1: 1
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design (sổ d-20261014T072658Z-1) | Dòng d-1 ghi nguồn «chỉ một lối» trong khi khoá tư vấn và ON CONFLICT (id) DO NOTHING vẫn sống; căn cứ thật là hướng chủ vùng chốt. Cùng dạng [cay-can-chinh-co-ly-do#F2] | Người duyệt ký mà không thấy ba lối và vì sao lối này được chọn | Dòng S1 mới supersedes d-1, thẻ hiện các lối sống | human-gate1: dòng d-20261014T073026Z-5 supersedes d-1, nguồn chỉ-người, lên thẻ thành câu hỏi |
| P1 | contract | Out of scope nói không có chỗ gọi song song ở helper khác, nhưng chỉ một chỗ gọi đã kể được đo | Hai spec gọi hai gieoKeHoach cùng lúc vẫn ném P2002 ở helper khác mà cổng không thấy | Eval chạy riêng từng chỗ gọi đã kể trên kho mới | fixed: hai spec đi qua dieu-phoi-gieo.ts (không qua support/ke-hoach-gieo.ts); AC-3 mở rộng, thêm E6 E7; đo trên cây chưa sửa cả hai đã xanh — ghi ở Notes là đo không-hồi-quy |
| P2 | evals | Không thước nào kiểm bài kiểm có thật assert hai số đếm của AC-1 | Bản sửa bỏ tạo thành viên cho lượt thua, bài kiểm không đếm, E1 E2 E5 vẫn xanh | Thêm spec vào inputs của E5 kèm câu hỏi về hai assert | fixed: E5 nhận gieo-nguoi-song-song.spec.ts trong inputs và câu hỏi về quan hệ một tổ chức, SO_LUOT thành viên |
| P2 | evals | Cuộc đua có xác suất, mỗi thước chạy một lượt | Bản đột biến tình cờ không đua, E2 REJECT oan; hoặc bản sửa hở qua nhờ may | Chạy bản đột biến K lần, in số lượt | fixed: rang/dot-bien.mjs chạy bản đột biến 3 lượt, đòi đỏ đúng câu ghim cả 3, in do-dung-ghim=k/3 |
