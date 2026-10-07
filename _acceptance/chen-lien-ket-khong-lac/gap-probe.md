---
slug: chen-lien-ket-khong-lac
at: 2026-10-07T20:52:00Z
verdict: findings
p0: 0
p1: 2
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design + evals (E3) | AC-3 là quan hệ (chính lỗi bài mới bắt mang commandManager) nhưng E3 chỉ đòi chữ có mặt đâu đó; design không nói danh sách chứa gì | Bài đẩy ErrorEvent rồi toEqual([]) → bun in diff đối tượng DOM, treo; hoặc bài mới đỏ vì lỗi khác mà chữ commandManager đến từ console của bài cũ → E3 xanh oan [tro-ly-kho-dung-phien#F1] | Đẩy chuỗi; E3 cắt khối (fail) của bài mới; trần thời gian | fixed: design + AC-2 ghi bài đẩy String(e.error?.message ?? e.message); E3 đòi commandManager trong khối đầu ra của chính bài mới; E2/E3 có trần thời gian mỗi lượt bun |
| P1 | evals (E2) | E2 chỉ so khối bài Esc; hàm trợ giúp, afterEach, hằng chờ ngoài khối không ai canh; bản ghim không round-trip | Sửa hàm chờ 20 ms thành 200 ms → bài Esc bị nới mà khối trùng byte; hoặc bản ghim chép sau khi sửa → so vòng tròn | So cả tệp bỏ khối mới; bản ghim đối chiếu git show sha | fixed: bài mới ở describe riêng cuối tệp; E2 đòi tệp HEAD bỏ khối đó trùng byte bản ghim; bản ghim phải trùng git show 0426cc9d0 (lệch → mã 2) |
| P2 | evals (E2/E3) | Bộ đếm commandManager không có đối chứng dương trên đường console jsdom | Răng chỉ bắt stdout trong khi jsdom in ra stderr → E2 đếm 0 vô nghĩa | E3 dùng cùng hàm đếm, đòi ≥2 dòng ngoài khối bài mới | fixed: E2/E3 cùng hàm đếm trên stdout + stderr; E3 đòi ≥ 2 dòng commandManager ngoài khối bài mới |
