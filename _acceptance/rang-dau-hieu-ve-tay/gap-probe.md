---
slug: rang-dau-hieu-ve-tay
at: 2026-11-01T07:40:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | AC-7 hứa quan hệ «thay đúng hàng»; E8 chỉ kiểm tên có mặt đâu đó trong mục, kể cả cột Vẽ tay | Luật đảo thông điệp table và clipboard, hay khuyên chính dấu hiệu cấm, E8 vẫn bảy DAT | E8 tách bảng thành hàng, ánh xạ mã → hàng viết trước, chiều đỏ đổi chéo; E1 ghim chuỗi thay bằng chữ | fixed: AC-7 đổi lời «đúng hàng»; E8 tách hàng với ánh xạ viết trước và ca đổi chéo đỏ; E1 ghim chuỗi thay bằng chữ trong răng |
| P0 | design | d-3 ghi muc-tieu mà câu trích chỉ quyết chỗ đặt danh sách, không quyết đếm theo cặp và bánh cóc | Cổng 1 tưởng câu giao chọn sẵn độ mịn và bánh cóc | Tách d-3, căn cứ đúng loại cho độ mịn | fixed: dòng sổ mới supersedes d-3, căn cứ là AC-6 của BK6 (rang-hang-cong-cu, đã máy thông) — đếm theo cặp, vượt và thiếu đều đỏ |
| P0 | design | d-4 ghi mot-loi mà lối hằng cùng tệp vẫn sống | const DONG = "divide-y" rồi className={DONG} lọt | Hằng cùng tệp vào luật hoặc thành Hỏi | fixed: dòng sổ mới supersedes d-4 — hằng const cùng tệp vào luật; E1 thêm hang-cung-tep đỏ, E2 thêm hang-tep-khac im; Out of scope ghi «hằng nhập từ tệp khác» |
| P1 | contract | Định nghĩa «tệp mới» ở mức cả tệp; không AC nào hứa tệp nợ thêm dấu hiệu khác thì đỏ | Bản cài miễn trọn tệp nợ, bốn mươi tệp thành vùng tự do | Định nghĩa theo cặp; AC-4 thêm nhánh; E4 ca no-dau-hieu-khac | fixed: «chỗ mới» định nghĩa theo cặp (tệp, dấu hiệu); AC-4 thêm nhánh; E4 thêm no-dau-hieu-khac |
| P1 | evals | Ma trận không quét các dạng giá trị className; thiếu gần dạng divide-y-0, divide-x, size-2.5 | Luật chỉ đọc Literal, template hay cn hai đối số lọt; divide-y-0 đỏ oan | Ma trận dạng giá trị × hai mã; gần dạng ghim sẵn | fixed: AC-1 ma trận 15 ca gồm năm dạng giá trị × divide-y, cham; AC-2, E2 thêm divide-y-0, divide-x, size-2.5 rounded-full im; lớp so theo từ |
