---
slug: dieu-huong-khu-muc-tieu
at: 2026-10-15T02:48:19Z
verdict: findings
p0: 2
p1: 3
p2: 0
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design + contract | Đơn vị đích ở thẻ khác Theo đơn vị ưu tiên đơn vị đang xem trước đơn vị mình dẫn; vì đơn vị đang xem đi theo mọi thẻ nên nút ở Của tôi nhắm đơn vị xem gần nhất — nghĩa sản phẩm nhưng sổ ghi máy quyết; E4 thiếu ca đơn vị đang xem không sửa được [hoan-tac-loat-bao-dung#F1] | Trưởng P1 xem P2 rồi sang Của tôi: nút khoá kèm câu «Bạn xem được P2…» ngay trên trang của mình — chạm ngưỡng chết của Cổng Đáng | Dòng sổ chi-nguoi thay d-3; E4 thêm ca donOkr không sửa được; E5 thêm lượt đi-về trên máy chủ thật | human-gate1: thành câu Hỏi-2 (khuyến nghị đơn vị mình dẫn trước — dòng sổ supersedes d-20261015T023912Z-3); đã sửa AC-3, design, E4 (30 ô + phá thử xem-truoc), E5 (lượt đi-về) |
| P0 | contract | Giữ nhãn «Soạn OKR cùng Kara» trái chữ phạm vi «Soạn cùng Trợ lý» là đánh đổi giá trị, sổ ghi máy quyết theo một-lối [chu-man-tieng-viet-khong-tran#F1] | Owner muốn gọi «Trợ lý»; DH1 ship «Kara» lên đầu trang cả khu, Cổng Bằng chứng đạt theo nhãn cũ | Dòng sổ chi-nguoi thay d-7, câu Hỏi riêng ở Cổng Phạm vi | human-gate1: thành câu Hỏi-3 (khuyến nghị giữ «Kara» — dòng sổ supersedes d-20261015T023912Z-7); dòng GIẢ ĐỊNH ở Coverage thay bằng con trỏ câu hỏi |
| P1 | contract + evals | Mục Nhập khoá theo canCreate trong khi Coverage liệt nhapDuoc như thước riêng; vai chỉ OKR và quản trị chương trình không có ô eval | Quản trị chương trình thấy Nhập bật rồi bị máy chủ từ chối, hoặc ngược lại mất lối nhập | AC-5 khai nguồn quyền từng điều khiển; E7 2×2; E5 vai thật | fixed: máy chủ dùng cùng phép kiểm cho tạo và nhập (okr.service.ts applyImport → assertNhapDuoc = nhapDuoc = canCreate), AC-5 ghi căn cứ này; E7 khẳng định Nhập và nút chính luôn cùng trạng thái; E5 thêm lượt thành viên không dẫn ai trên máy chủ thật |
| P1 | contract + evals | AC-4, AC-5 đi qua máy chủ (canCreate, trạng thái soạn của đơn vị đích) mà không gắn cross-layer; E6, E7 giả lập truy vấn không kiểm đối số | Đầu trang hỏi máy chủ cho sai đơn vị, nút bật nhưng bấm vào ngăn không mở; mọi eval DOM vẫn xanh | Gắn cross-layer; E6/E7 khẳng định đối số truy vấn bằng đúng đích từ hàm giải của E4; E5 thêm chiều không quyền trên máy chủ thật | fixed: AC-4, AC-5 gắn (cross-layer); E6 (d) và E7 khẳng định đối số okr.danhSach/okr.soanSanSang lấy từ hàm giải E4; E5 thêm hai ca khoá trên máy chủ thật |
| P1 | evals | Inputs của E13 có ảnh Sức khoẻ và ảnh khoá mà không eval nào sinh; thiếu khổ 390 | Lượt chấm thiếu tệp hoặc hội đồng phán về dòng lý do khi không có ảnh chứa nó | E2 mở ma trận thêm Sức khoẻ và lượt người không quyền; inputs E13 bằng đúng tập E2 khai | fixed: E2 ma trận 12 ô (thêm Sức khoẻ) + 2 ảnh khoá, danh sách 16 tệp đóng, thiếu tệp → mã 2; inputs E13 lấy 10 tệp từ đúng danh sách đó (gồm 390 của Của tôi, Sức khoẻ, khoá) |
