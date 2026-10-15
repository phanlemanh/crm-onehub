---
slug: tran-cho-app-rieng
at: 2026-10-14T23:30:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

# Phản biện context sạch — tran-cho-app-rieng

Một tác tử tươi (feature-loop:cham-doc) đọc design doc, contract, evals và sổ; không đọc mã, không chạy lệnh.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Ô đối chứng bản cũ không chậm chính là ca hay chập chờn khi máy nặng | S4 chạy cạnh suite, ô 0 ms của bản cũ đỏ, E1 E2 đỏ oan | Chạy tuần tự hoặc thử lại riêng ô đó | fixed: ô trước-vòng 0 ms thử lại tối đa 3 lần, in số lần; ô khác chạy một lần |
| P1 | sổ | d-3 bỏ đường nền ghi một lối, trong khi đường nền chạy được trên bản sạch | Đỏ có sẵn chỉ lộ ở S4 | Chạy đường nền hoặc để người quyết | fixed: d-9 thay d-3 thành Hỏi-2 cho người |
| P2 | sổ | d-1 trích luật chỗ đặt hằng nhưng không quyết phạm vi trần và con số 30 s | Người duyệt tưởng luật kho đã chọn trần riêng 30 s | Tách dòng | fixed: d-6 giữ chỗ đặt hằng, d-7 thành Hỏi-1 cho phạm vi và con số |
| P2 | evals | E3 chỉ dò chuỗi hằng có mặt, không đo đối số của đúng bài | Số 30_000 tại chỗ vẫn lọt | Đọc đối số cuối của khối bài, đối chứng âm | fixed: thước đọc đối số cuối của khối «chạy cạnh apps/agent», thay bằng 30_000 thì không đạt |
| P2 | sổ | d-2 ghi một lối cho cách làm chậm, còn lối proxy và ép tải | Lối thay thế không được cân | Nêu lối khác và vì sao bỏ | fixed: d-8 thay d-2, nêu proxy và ép tải cùng ràng buộc làm chúng chết |
