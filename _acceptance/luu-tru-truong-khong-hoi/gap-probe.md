---
slug: luu-tru-truong-khong-hoi
at: 2026-10-13T07:20:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Ngăn «Quản lý trường» mở từ bảng không có AC hay eval chạy trên bản thật | Toast nằm ngoài lớp Sheet; bấm «Hoàn tác» làm đóng ngăn hoặc không bấm được mà mọi eval vẫn xanh | Thêm bước ngăn vào AC-7, E10; chiều đỏ «man: hoan tac dong ngan» | fixed: AC-7 thêm vế ngăn, E10 bước 3 + ảnh ltk-ngan-1440, E9 đo máy chủ cả ba bước, Coverage thêm Trục E |
| P1 | evals | E2 dùng onDone giả nên trình sửa không bị gỡ; toast/Hoàn tác có thể mất khi gỡ thật | Hook trong trình sửa, trình sửa gỡ trước khi archive trả về, toast không hiện mà E2 vẫn xanh | E2 dựng component chủ thật; chiều đỏ «ltk: trinh sua dong mat toast» | fixed: E2 dựng FieldsSheet thật; thiết kế đặt hook ở component chủ (sổ d-…-7) |
| P1 | evals | AC-6 nói nút «Lưu trữ» trong trình sửa bị khoá mà eval không khẳng định | Bỏ AlertDialog làm rơi disabled, người không quyền bấm được | Khẳng định dương nút disabled | rejected: người không quyền không mở được trình sửa (fields-settings.tsx, fields-sheet.tsx chỉ dựng khi !khoa) — sửa câu AC-6 cho đúng hành vi thật; E7, E8 đo khoá ở hai nơi |
| P2 | contract | Ô «không bấm» của Trục B không có AC; thời hạn 10 giây không đo | Hook gọi toast thời hạn mặc định ~4 giây, Hoàn tác mất sớm | Đồng hồ giả đo hoanTacMs | deferred: thời hạn sống trong baoDaLuuTru (LUU_TRU.hoanTacMs) của packages/ui, mảnh dùng chung đã đo ở V2; hook chỉ gọi mảnh đó |
| P2 | evals | Đường trình sửa 390 không đo phía máy chủ; bước 2 không khẳng định trường về nhóm đang dùng | Khôi phục sai id ở 390 mà E9, E10 vẫn đạt | Thêm bước máy chủ cho trình sửa | fixed: E9 ma trận 3 bước × 2 trạng thái, E10 bước 2 khẳng định trường về nhóm đang dùng |
