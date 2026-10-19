---
slug: mau-trang-thai-chung
at: 2026-10-15T20:45:11Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Hỏi-3 chỉ đưa ba nhóm cho người; #8 qua bộ kiểm, #9 lập kế hoạch, #12 chờ do máy tự quyết, và #12 chờ → nháp lệch lý lẽ «máy đang lo» của #5 | Người ký chỉ thấy ba nhóm; hàng làm giàu «chờ» xám còn «chờ đọc» ở Tài liệu xanh dương — cùng nghĩa hai màu | Câu hỏi người liệt đủ mọi dòng đổi màu và dòng máy không chắc, mỗi dòng có khuyến nghị và lối khác | fixed: design doc thêm bảng «Mọi dòng đổi màu» (sáu nhóm dòng); #12 chờ → đang chạy; sổ dòng Hỏi-3 mới supersedes d-…-3 |
| P0 | contract | Bỏ ui-observed với lý do «trạng thái chóng qua» trong khi pha chu kỳ (#9) và liên kết KR (#10) là trạng thái bền dựng được qua service | Màu đổi ở Cài đặt OKR lên production mà không ai nhìn | Eval ui-check trên bàn đo cho trạng thái bền | fixed: thêm AC-6, E6 (bàn đo Cài đặt OKR › chu kỳ, ba pha) và E6m; sổ dòng mới supersedes d-…-5; trạng thái chóng qua chỉ đo DOM |
| P0 | contract | Out of scope cắt Badge và màu chọn tại chỗ khỏi câu giao mà không có dòng sổ, không lối khác | Cùng một màn, chấm theo bảng nghĩa cạnh Badge giữ màu riêng | Dòng descope chỉ-người với khuyến nghị và lối khác | human-gate1: Hỏi-4 (khuyên để ngoài, ghi hàng sau) |
| P1 | evals | E3 tự gọi toneTheoNghia trên bảng NGHIA_, không đo đầu ra; sáu khu đổi màu không có thước nào đo màu vẽ ra | NGHIA_ đúng nhưng kr-viec vẫn vẽ chấm bằng chuỗi màu tại chỗ — cả bộ xanh | Ma trận DOM cho các khu đổi màu hoặc luật chặn chuỗi màu | fixed: AC-3 và E3 thêm luật cây cú pháp — trong 13 tệp khu không chuỗi màu nào, kể cả thuộc tính JSX; chiều đỏ (2) ghim kr-viec truyền màu bằng chuỗi |
| P1 | evals | E2 chỉ bắt Record<…, StatusTone> và tone: "…"; switch-return, as const, Map lọt | Đổi hienTrangThai thành switch trả "warning" — E2 xanh | Quét mở rộng, đối chứng dương từng dạng | fixed: E2 quét cây cú pháp TypeScript; đối chứng dương bốn dạng (Record satisfies, as const, switch-return, new Map), đếm đủ 4 |
