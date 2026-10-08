---
slug: datatable-loc-ro
at: 2026-10-07T13:47:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Chiều đỏ E3 không bắt lỗi ghi đè fields: fixture một trường tuỳ chỉnh, và đếm onUrlUpdate không tách được vì nuqs gom lần ghi | Đột biến setFilter từng cái vẫn xanh; bảng có hai trường tuỳ chỉnh giữ lại giá trị sau Bỏ lọc mà không eval nào thấy | Hai trường k1, k2 cùng chọn; dương fields = {}; đỏ ghim «fields còn k1», chạy ngay ở S3 | fixed: AC-3 bỏ «ghi một lần», thêm hai trường tuỳ chỉnh; E3 đổi fixture và chiều đỏ ghim «fields con k1» |
| P1 | evals | Phép âm E9 không phủ câu mô tả vi, ca en không khẳng định dương noMatchDescription, Bỏ chọn chỉ hiện khi mở menu | Chép nhầm câu vi sang en: messages-guard và loc-ro-en vẫn xanh, AC-9 qua cổng khi bảng en lọt chữ Việt | Mỗi khoá en khác vi và không khớp chữ có dấu; dương cả ba khoá; mở menu con kiểm Clear; đỏ chép vi sang en | fixed: AC-9 thêm điều kiện en khác vi, không có dấu; E9 ma trận 7 khoá, ca en dương và mở menu con, chiều đỏ ghim tên khoá |
| P1 | evals | Đếm của trpc giả trong E6 viết tay theo khuôn bên đọc; E8 chỉ chạm API thật ở Giai đoạn | API trả đếm trường tuỳ chỉnh dưới khoá khác, E6 vẫn xanh, màn thật mất số 0 | Kiểu RouterOutputs cho trpc giả hoặc cảnh E8 trường tuỳ chỉnh có lựa chọn 0 | fixed: cả hai — E6 khai kiểu RouterOutputs; AC-8 và E8 thêm cảnh truong-tuy-chinh trên kho đo, ma trận 8 ô |
| P2 | evals | E11 quét tiền tố p-, m-, gap- không có ma trận viết trước, chiều đỏ chỉ rounded-xl | className ml-auto px-2 lọt vì tiền tố không khớp | Ma trận tiền tố đầy đủ, một ca đỏ mỗi tiền tố | fixed: AC-11 nêu mọi biến thể; E11 khai 27 tiền tố và --tu-thu một ca đỏ mỗi tiền tố |
| P2 | evals | E10 so với ref onehub cục bộ, E11 so merge-base — hai mốc | onehub dời sau khi cắt nhánh làm E10 đỏ giả, hoặc xanh oan khi nhánh cục bộ cũ | git diff --quiet merge-base HEAD origin/onehub; đỏ khi sửa kỳ vọng OKR | fixed: E10 dùng merge-base với origin/onehub, thêm chiều đỏ thứ hai |
