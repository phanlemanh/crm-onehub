---
slug: sua-tai-cho-muc-tieu-va-kr
at: 2026-11-01T10:05:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Bỏ mô tả KR và gán «mô tả» mục tiêu là whyNow mà ghi máy tự quyết | Ngưỡng SỐNG nói «sửa tên, mô tả» cho cả hai ngăn; giao xong KR vẫn không có mô tả mà không ai ký việc cắt | Câu Hỏi ở Cổng 1, sửa câu SỐNG cho khớp | human-gate1: dòng sổ Hỏi-1 (chi-nguoi) thay d-3; khuyến nghị chấp nhận, lối khác là vòng T3 đổi lược đồ |
| P1 | evals | AC-5, AC-6 dựa luật quyền máy chủ mà chỉ có eval DOM với tRPC giả | Máy chủ từ chối chủ KR đổi tên, ô vẫn hiện, E5 xanh | Eval tầng API (cross-layer) gọi router thật | fixed: AC-5 gắn (cross-layer); thêm E12 bài API sua-tai-cho-okr.spec.ts (chủ KR đổi tên được, đổi người FORBIDDEN, trưởng đơn vị sửa mục tiêu được) |
| P1 | evals | E8 chỉ đếm invalidate, không kiểm DOM; không ca lưu từ ngăn mục tiêu | Ngăn KR đọc khoá khác, vẫn tên cũ mà E8 xanh | QueryClient thật, kiểm DOM, đối chứng bỏ invalidate | fixed: E8 dùng QueryClient thật, ca lam-moi-mt và lam-moi-kr kiểm đầu ngăn và dòng KR, đối chứng bỏ cache.okr đỏ; AC-8 thêm đầu ngăn mục tiêu |
| P1 | evals | Không ma trận viết trước cho các cách kết của từng ô | Rời ô ở ngăn KR không lưu, Esc ở «Vì sao» vẫn gửi, E1–E8 xanh | Bảng ngăn × trường × cách kết, mỗi ô một ca | fixed: thêm E13 ma trận 13 ô ghim mảng lời gọi |
| P2 | evals | AC-7 chọn câu theo nguyên nhân mà E7 chọn theo kiểu trường; lỗi giả không theo mã thật | Lỗi mạng ở ô người báo «không còn trong đội» | Lỗi giả theo mã thật; USER + lỗi khác ra «Chưa lưu được» | fixed: AC-7 chọn theo mã — USER + BAD_REQUEST → tuChoi.nguoi, mọi lỗi khác → «Chưa lưu được <ô>»; E7 dựng TRPCClientError với data.code thật, năm ca |
