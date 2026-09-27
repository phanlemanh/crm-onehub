---
slug: no-sau-luot-4-okr
at: 2026-09-27T09:25:05Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | evals | AC-6 chỉ được đo bằng E6, một bài gọi thẳng dungTin với giờ tự truyền. Không eval nào đo đường gửi thật (chayNhac có đưa giờ gửi thật vào dungTin không); múi giờ tiến trình không ghim ở E4, E5, E6. | chayNhac truyền mốc 08:30 hay createdAt của hàng → tin gửi 14:02 vẫn chào «sáng nay», E6 xanh. Mã so giờ bằng getHours() → máy dev giờ VN xanh, máy chủ UTC chào sai. | Ca tích hợp gửi 14:02 thấy «hôm nay», đối chứng 10:00 thấy «sáng nay», chiều đỏ ghim; chạy TZ=UTC. | fixed: thêm E16 (ma trận 3 ô qua lenLichNhac + chayNhac, hai chiều đỏ createdAt và getHours); AC-6 nói rõ giờ gửi thật và máy chủ UTC; mọi lệnh bài agent có giờ chạy TZ=UTC |
| P1 | evals | E10 chỉ ghi «bảng 15 giá trị viết trước» mà không liệt kê; sau khi gộp luật về một hàm, a = b = c gần như luôn đúng [tien-te-chua-tai-khong-doan#F1]. | S3 chọn bản luật lệch khi gộp, trưởng bộ phận mất quyền cập nhật KR cá nhân; ba câu trả lời vẫn trùng nên E10 xanh, người duyệt không thấy quyền ai đổi. | Ghi đủ 15 ô trong expected và AC-9; đo trên cây cũ in ô lệch. | fixed: bảng 15 ô viết vào AC-9 và E10 (C ✓✓✓ · TP ✓✗✓ · TB ✓✓✓ · Q ✗✗✗ · N ✗✗✗), đọc từ ba luật hiện hành 27/09 — cả ba cho cùng bảng, nên không có ô lệch phải đưa ra Cổng 1. Phần «chạy 15 ô trên cây cũ» rejected: bảng viết trước đã chặn đổi quyền, chạy thêm một cây gương API là tốn mà không thêm gì |
| P1 | contract | E12 dừng ở lớp viecCanNhac ném lỗi; không eval nào đo lỗi hiện ra ở đâu, và AC-11 không nói ảnh hưởng dừng ở X hay lan cả công ty. | lenLichNhac bọc try/catch từng người → việc «được giao» lại mất im, E12 vẫn xanh. Hoặc một dòng hỏng làm cả công ty mất tin sáng mà người duyệt tưởng chỉ X. | Ghi phạm vi lan vào AC-11; nối E12 tới lenLichNhac và tRPC viecCuaToi; chiều đỏ bắt lỗi rồi bỏ qua. | human-gate1: phạm vi lan ghi thẳng vào AC-11 (nhịp nhắc dừng cho mọi người, thẻ «Việc của bạn» và khối kế hoạch Tổng quan trả lỗi tới khi dòng được sửa) — người quyết ở Cổng Phạm vi có chấp nhận lan như vậy không. E12 thêm nửa agent (lenLichNhac bị từ chối, không hàng nào), tRPC viecCuaToi của X và Z, dashboard của Z; chiều đỏ thứ hai «loi bi bat» |
| P2 | evals | E13(2), E14, E15(b) lấy kỳ vọng từ chính bảng của mã (KHOA_MUC_OKR, TIEU_DE, LOAI_NHAC ∪ LOAI_NHAC_OKR); không bảng khoá viết trước; E14 đếm độ dài sẽ đỏ đúng khi 9a thêm ai-* [d-20260906T101500Z-9205]. | KHOA_MUC_OKR khai okr-kr-im thiếu keyResultId, payload mất mã KR mà E13/E15 vẫn xanh; 9a lên trước S3 thì E14 đỏ với mã đúng. | Bảng khoá viết tay 5 loại; tập loại E14 rút từ hợp ViecNhac; E15(d) thêm đột biến ai-*. | fixed: E13 mang bảng khoá viết tay 5 loại và so giá trị mã với mã đã gieo; E14 bỏ đếm độ dài, phủ đủ giao cho E15(d); E15(d) thêm ca xoá ai-tran khi 9a đã lên |
| P2 | evals | Trục C có «Tổng quan kế hoạch» nhưng không AC; phần Dashboard của E7 dùng bước kế hoạch, không phân biệt được hai cửa sổ. | DashboardService gọi cửa sổ buoi-sang, nhắc tên 14:00 không hiện trên Tổng quan tới sáng mai, E7 vẫn xanh. | AC cho Tổng quan; E7 dùng sự kiện nhắc tên. | rejected: khối kế hoạch Tổng quan chỉ giữ việc kế hoạch (`keHoachCanDeY` lọc `laNhacKeHoach`), không đọc mục OKR nào, nên cửa sổ sự kiện không chạm kết quả của nó; phần Dashboard ở E7 chỉ là đối chứng không hồi quy |
