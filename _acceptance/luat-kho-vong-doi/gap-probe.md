---
slug: luat-kho-vong-doi
at: 2026-10-08T23:42:08Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | evals | E1 đòi exit 0 và 7/7 luật xanh trên cây thật, trong khi onehub đang đỏ luật cach-ly-hai-agent của #321 và vòng này cố ý không đưa vi phạm đó vào nền; không chỗ nào nói S4 phải chờ bản sửa | Cài đúng tới từng chữ mà E1 vẫn thoát 1, S4 REJECT; lối duy nhất cho xanh là nhét vi phạm #321 vào nền | Điều kiện vào S4 có tên, hoặc E1 cho phép đúng một dòng đỏ đã ghim | fixed: thêm điều kiện vào S4 vào E1 expected và Notes của contract (bản sửa #321 của P3 nằm trong HEAD, chưa có thì BLOCKED «chờ bản sửa #321», không REJECT) · human-gate1: anh chọn chờ P3 hay cho đúng một dòng đỏ đã ghim |
| P1 | design | AC-5 hứa nền đúng hai vị trí mà design không ghi số đo hiện trạng của (a) và (b) | Lần chạy đầu bắt thêm ca đúng chuẩn, E1 đỏ hoặc nền phình — đúng ngưỡng CHẾT | Bảng đếm trên 532e3317 có tệp:dòng và phân loại | fixed: thêm bảng hiện trạng vào design (11 mô hình, 8 list*, 3 lời xoá, 2 vi phạm đều AgentDefinition) và luật «ca đúng chuẩn bị bắt thì sửa luật, không vào nền» |
| P1 | evals | Ma trận E2 thiếu ô: deleteMany không kiểm, ngoài app Nest, *.spec.ts, thiếu app Nest, NEN THUA vị trí service | Cài quên deleteMany hay quét nhầm apps/agent vẫn qua E2 | Thêm ô a4, b4, k2, n2 | fixed: thêm a4, b4 (hai ô), k2, n2 vào ma trận viết trước |
| P1 | evals | Không eval nào làm hỏng chính bộ bắt để thấy mã 2; N của chiều đo không ghim số | Cài thiếu ca tự gài hay bỏ qua ca đối chứng vẫn N/N | Ghim N, liệt bảy tên ca; ô làm hỏng luật | fixed: E1 ghim N = 32 + 7 kèm bảy tên ca; E2 thêm h1 (hàm luật trả rỗng → mã 2) và h2 (hàm phụ luôn có → mã 2) |
| P2 | evals | E4 neo merge-base động, bản archive thiếu node_modules, không ghim dòng KET LUAN; đường đo CI không có số nền | Sau gộp chênh = 0 luôn xanh; lượt mốc sập vì thiếu typescript cũng xanh [d-20261008T171908Z-35] | Neo sha cố định, dùng node_modules cây đang xét, bắt buộc KET LUAN; số nền CI từ PR đầu | fixed: E4 neo 532e33175, dùng node_modules cây đang xét, thiếu KET LUAN → mã 2; Đường đo ghi số nền là lượt CI đầu tiên |
