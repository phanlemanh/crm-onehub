---
slug: ngay-lich-test-tao-ke-hoach
at: 2026-10-14T17:40:00Z
verdict: findings
p0: 0
p1: 1
p2: 4
---

# Phản biện context sạch — ngay-lich-test-tao-ke-hoach

Một tác tử tươi (feature-loop:cham-doc) đọc design doc, contract, evals, sổ và bài học xuyên hồ sơ; không đọc mã, không chạy lệnh.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Ba mốc đều 12:00 VN, không chạm chỗ ngày UTC lệch ngày VN; sổ d-2 nói không có trục thứ hai | Bản sửa tính hôm nay theo UTC, đỏ lúc 00:30 ngày 15 VN mà thước vẫn xanh | Thêm ô 00:30 và 23:30 ngày 15 VN cho bản sửa, 00:30 cho bản cũ | fixed: ma trận 8 ô, d-7 thay d-2 |
| P2 | evals | Tệp tạm của bản cũ nằm trong cây với tên khớp bộ chạy dom, không thước kiểm cây sạch | Lượt test song song nhặt tệp tạm, hay tiến trình bị giết để lại tệp | Tên ngoài mẫu, kiểm git status sau lượt | fixed: tên .tam.tsx gọi tường minh, SAI cay con tep tam |
| P2 | evals | Gốc diff ghim cứng c1864a3a2 | onehub dời, E3 đỏ giả trước gộp | Gốc merge-base onehub, đối chứng âm | fixed: origin/onehub...HEAD, đối chứng thêm một tệp ngoài |
| P2 | sổ | d-1 ghi một lối trong khi lối ghim đồng hồ trong một bài còn sống [hoan-tac-loat-bao-dung#F1] [tac-nhan-va#F2] | Người duyệt tưởng mọi lối khác đã chết | Đổi căn cứ sang lời giao, nêu lối ghim đồng hồ | fixed: d-6 thay d-1 thành Hỏi-1 cho người |
| P2 | evals | Ô xanh không đòi số bài thật chạy | -t lệch, 0 pass 0 fail vẫn xanh | Đòi đúng 1 pass hay 1 fail | fixed: ô lạ khi khác hai dạng đó |
