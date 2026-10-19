---
slug: so-do-toan-vung
at: 2026-10-19T12:10:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design (sổ d-20261019T112738Z-4) | Dòng d-4 ghi `mot-loi` chung cho tâm và toàn màn hình. Lối «state cục bộ» chỉ chết với tâm; với toàn màn hình nó vẫn sống, và nếp nuqs nói về giá trị lọc chứ không quyết trạng thái trình bày | Cổng Phạm vi duyệt vế «tải lại vẫn toàn màn hình» tưởng là luật kho, trong khi chủ kho muốn đó là chế độ tạm; người nhận đường dẫn mở ra mất thanh bên | Tách d-4: tâm giữ `mot-loi`, toàn màn hình thành câu chỉ người có | fixed: hai dòng sổ mới `supersedes` d-4 — tâm `mot-loi`, toàn màn hình thành Hỏi-4 `chi-nguoi`; AC-2 và E2 bước (3) mang «chờ Hỏi-4» theo lối máy khuyên (chế độ tạm của vỏ) |
| P1 | contract | AC-3 hứa đổi kiểu xem giữ toàn màn hình, AC-4 lại nói nút ngăn mở «ở khung thường», E4 so href tuyệt đối; chiều cả công ty › ngăn › Sơ đồ quanh mục tiêu không có thước | Đang trình chiếu toàn màn hình, bấm «Xem trên sơ đồ» thì thanh bên bật lại mà E3, E4 vẫn xanh | Chốt một chiều; E3 thêm ô đi qua ngăn | fixed: toàn màn hình sống trong vỏ khu nên đi qua ngăn vẫn giữ; AC-4 «giữ khung đang có», href chỉ mang khoá tâm; E3 thêm ô (d) |
| P1 | evals | Hành vi dời từ DH4, DH5 (bấm thẻ mở ngăn, rê chuột, «Đang xem quanh», lọc Cần chú ý, thẻ đơn vị có lý do) không có thước ở hồ sơ này, trong khi eval đã ký có thể khai nghỉ trỏ sang đây; E2 chỉ thử Esc với Sheet | Bấm thẻ không mở ngăn sau khi dời, eval cũ nghỉ trỏ AC-3, E11 vẫn in GIU; Esc với thẻ đơn vị mở thoát luôn toàn màn hình | E3 thêm các ô dời; E2 ma trận bốn lớp; E11 đòi bảng ánh xạ eval nghỉ | fixed: E3 ô (e)–(i), E2 ma trận bốn lớp có đối chứng dương, E11 đòi `rang/anh-xa-nghi.json` và in «MAT THUOC» khi thiếu |
| P1 | contract | AC-1 cấm `PageShellDescription` mà không ghi «chờ Hỏi-2»; lối khác của Hỏi-3 lật vế của AC-4, AC-5; dòng ngoại lệ trong `docs/design.md` không có AC | Chủ kho chọn giữ đầu trang, E1 đỏ trên bản dựng đúng quyết định; hoặc không ai thêm dòng ngoại lệ và `khung-man-chung` đỏ sau gộp | Gắn nhãn chờ cho từng vế; thêm vế dòng ngoại lệ; E11 có `khung-man-chung` | fixed: AC-1, E1 mang «chờ Hỏi-2» và vế dòng ngoại lệ; AC-4, AC-5, E4, E5 mang «chờ Hỏi-3»; Notes kể vế theo từng câu hỏi; E11 đối chứng dương có `khung-man-chung` |
| P1 | evals | Ba thước không đỏ được: chiều cao và cuộn ngang ở 1440 không đo; «không còn chữ căn chỉnh» đọc `innerText` trong DOM giả; sàn thiết kế tĩnh tự khai không đo được | Khung vẽ dời nguyên cao 600 px, dưới còn 300 px trống mà E10 in DUNG; chữ «Căn chỉnh» còn trên nút mà E9 xanh | E10 đo đáy khung vẽ và `scrollWidth`; E9 dùng `textContent` có đối chứng dương; sàn tĩnh thành Known limit | fixed: E10 đo đáy và `scrollWidth` có đối chứng 600 px; E1 thêm «không style height cố định»; E9 `textContent` + đối chứng dương; eval sàn tĩnh bỏ, Known limit có tên ở Notes; design ghi rõ 600 px do nơi gọi đặt, `FlowMap` không đổi |
