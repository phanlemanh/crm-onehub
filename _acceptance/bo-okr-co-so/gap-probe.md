---
slug: bo-okr-co-so
at: 2026-10-22T02:10:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-…-6 ghi «một lối» cho cả cách đếm ngày cuối và cách hiện chu kỳ chưa bắt đầu, mà hai lựa chọn ấy còn lối khác sống — là câu cho người. [trang-bo-okr#F2] [loc-don-vi-khong-tu-dong#F1] | Chủ kho ký mà không thấy câu hỏi; tới Cổng Bằng chứng muốn khác thì viết lại AC-2, E3 rồi ký lại. | Tách d-6: phần giờ VN và không số âm giữ một-lối với lối chết thật; phần đếm thành Hỏi chỉ-người; AC-2 nêu số Hỏi. | fixed: d-…-16 (một lối, lối chết nêu được) + Hỏi-4 d-…-17; AC-2 ghi «theo khuyến nghị Hỏi-4» |
| P1 | contract | AC-9 và E13 chỉ xét bước bấm mở; hàng số và nút mới còn chạm khẳng định bố cục đã ký (số mục hàng công cụ, khoảng dưới thẻ con). [d-20261021T225713Z-60] [d-20261021T225713Z-19] | E13 không tìm ra man-don-vi.mjs, in DUNG; ghim lại sau gộp đỏ ở khoảng lệch; muốn qua phải sửa thước đã ký không phép. | E13 quét thêm hàng công cụ và khoảng dưới thẻ con, đối chứng dương có man-don-vi.mjs; Hỏi-1 nêu lớp bố cục; AC-9 mở rộng. | fixed: AC-9 mở rộng ba lớp; E13 bốn mẫu quét + đối chứng dương man-don-vi.mjs và okr-trang-don-vi.dom.tsx; Hỏi-1 d-…-18 nêu lớp bố cục |
| P1 | design | Lối khác của Hỏi-1 không nêu AC/eval nào phải cắt; ca thước khẳng định thẳng «mặc định gập» chưa ai biết có hay không. [re-mo-hinh-mac-dinh#F2] | Chủ kho chọn lối khác mà hợp đồng giữ AC-4/AC-5; hoặc S3 tìm ra thước khẳng định gập, E13 kẹt. | Lối khác ghi rõ phần cắt; chạy quét ngay ở S1 và ghi hai danh sách vào Hỏi-1. | fixed: quét chạy 22/10 — khoảng 24 tệp bước mở, 1 khẳng định đổi giá trị (okr-trang-don-vi.dom.tsx, bàn phím), 3 khớp khác là nhóm Đã bỏ hay bước chờ, không thuộc bảng đơn vị; Hỏi-1 d-…-18 nêu lớp (c) và giá lối khác |
| P2 | evals | E12 bắt so «cùng nếp Toàn cảnh» mà không có ảnh Toàn cảnh. | Người chấm cho PASS/FAIL theo trí nhớ. | E11 chụp hàng số Toàn cảnh cùng phiên; E12 mở cạnh nhau, nêu điểm phải giống. | fixed: E11 chụp bco-toan-canh-1440-sang, -375-sang; E12 thêm bước mở ảnh đối chiếu và liệt điểm phải giống |
| P2 | evals | E6 không gieo mục đã bỏ có KR và mục không KR; E3 ghi 9 ô mà liệt 12. | isExpandable sai vẫn xanh nếu bộ mẫu thiếu ca; S2 viết 9 khẳng định bỏ sót một ca. | E6 gieo hai mục qua đường ghi thật, chiều đỏ isExpandable luôn true; E3 sửa số. | fixed: E6 gieo + chiều đỏ mo-moi-dong; E3 ghi 12 khẳng định |
