---
slug: cua-toi-ba-phan
at: 2026-10-15T04:25:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
# Phản biện context sạch — cua-toi-ba-phan

Một tác tử tươi đọc đúng sáu tệp (design, contract, evals, sổ quyết định, bài học xuyên feature, ô cơ hội), không đọc
mã kho.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-…-5 ghi máy quyết (muc-tieu) việc bỏ bảng mục tiêu ở phần 3; câu trích chỉ đòi HIỆN KR phụ trách, không quyết GỠ bảng mục tiêu; lý do «lặp phần 2» không áp cho thành viên không dẫn đơn vị nào [tac-nhan-va#F2] [gan-tay-va-kara-co-ly-do#F1] | Cổng Phạm vi duyệt d-5 như việc máy đã chọn; thành viên thường mất bảng mục tiêu chính, E8 vẫn xanh vì chỉ đo quan hệ tập | Dòng sổ thay d-5 với nguồn chỉ-người-có, khuyến nghị + lối khác + giá, thành câu Hỏi trên thẻ | human-gate1: dòng sổ d-20261015T041727Z-9 thay d-5 (supersedes), nguồn chi-nguoi — câu Hỏi-2 ở Cổng Phạm vi |
| P1 | evals | E6 grep chuỗi «okr/cap-nhat-tuan» trên cả cây, không có chiều im; khớp cả docs và đường import của bảng cũ dùng lại | E6 in «SAI AC-4» trên vật đúng — đỏ vì phép đo | Chỉ đếm liên kết (href, url, template) trong apps/app và apps/agent, không tính import và docs; thêm ca IM | fixed: E6 viết lại phạm vi + ca đỏ (href) và ca im (docs + import) trên bản sao, chạy trước cây thật |
| P1 | contract | AC-3 (cross-layer) chỉ có E4 lớp DOM; vế máy chủ nằm trong E16 gắn AC-5; không lượt máy chủ cho tu=viec-cua-toi, tải lại, tu lạ | E16 đỏ ở vế AC-3 thì thẻ báo AC-5 đỏ còn AC-3 vẫn PASS | Eval riêng criterion AC-3, layer backend-effect, ma trận 5 ô đếm dòng phiên mới | fixed: thêm E18 (AC-3, backend-effect, 5 ô + ca đỏ giu-tu), gỡ vế AC-3 khỏi E16 |
| P1 | contract | Trục C «chu kỳ đang chọn khác chu kỳ đang chạy» và giả định phần 1 theo chu kỳ đang chạy không có AC, không dòng sổ | Thợ truyền kyOkr vào phần 1; người chọn chu kỳ cũ thấy sai, mọi eval xanh | Vế vào AC-1 + ô ma trận E1 + ca đỏ theo-o-chu-ky + dòng sổ | fixed: AC-1 thêm vế, E1 thêm ô chu kỳ cũ + ca đỏ, dòng sổ d-20261015T041727Z-10 (mot-loi) |
| P2 | contract | Đường đo đọc cây tổ chức lúc chạy lệnh, không theo vai lúc phiên mở; không khai giới hạn | Người đổi vai dẫn trong 14 ngày làm lệch n và p sát sàn | Khai giới hạn kèm ngưỡng đếm | fixed: «Đường đo» khai giới hạn; AC-10 + E12 in số đơn vị có dấu sửa trong cửa sổ làm ngưỡng đếm |
