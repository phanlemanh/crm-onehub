---
slug: chi-tiet-cong-ty-hai-cot
at: 2026-10-23T03:14:00Z
verdict: findings
p0: 3
p1: 1
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ d-6 bỏ design-pass ghi nguồn một-lối trong khi lối làm design-pass còn sống: thứ tự Giới thiệu/Chi tiết (Hỏi-1) và chữ vùng kéo thả rơi dưới nút ở 375 là hai điều mới cho người phản ứng. Cùng khuôn [tran-test-ci-30#F1] [pre-push-cau-va-nhan#F1]. | Cổng Phạm vi duyệt Hỏi-1 bằng chữ; chủ kho chỉ thấy phiếu dài ở ảnh S4 và phải mở vòng lại. | Thay d-6 bằng dòng chỉ-người, hoặc đưa hình hai thứ tự lên thẻ. | fixed: d-20261023T031527Z-7 thay d-6 thành Hỏi (khuyến nghị bỏ design-pass); hình figures/thu-tu-muc.png so hai thứ tự lên thẻ |
| P0 | design | d-3 đổi mặc định vùng kéo thả cho mọi nơi, kể cả hộp thoại Tài liệu › tải nguồn; câu trích AGENTS.md chỉ liên quan, không quyết giữa đổi mặc định và thêm biến thể; d-5 ghi một-lối cho việc không đo hộp thoại. Cùng khuôn [truong-tep#F2]. | Bề rộng nền làm chữ trong hộp thoại Tài liệu rơi xuống dưới nút; không eval nào chạm hộp thoại. | Dòng sổ mới với câu thật sự quyết; thêm bước đo hộp thoại ở 1440 có chiều đỏ. | fixed: d-20261023T031527Z-8 thay d-3, trích docs/design.md «so the entire application stays consistent»; thêm AC-7 + E8 (hộp thoại Tài liệu ở 1440, chiều đỏ (7)); d-20261023T031527Z-9 thay d-5 chỉ còn bỏ ca 10 tệp |
| P0 | contract | Out of scope «nhãn trên giá trị cho trường rộng ở điện thoại» là lối sửa còn sống cho ô Tệp hẹp trên điện thoại; bốn mục Out of scope không có dòng descope. Cùng khuôn [tran-test-ci-30#F1]. | Chủ kho tưởng phiếu điện thoại đã rộng như 1440. | Dòng sổ cho từng mục; mục nhãn trên giá trị là chỉ-người. | fixed: d-20261023T031527Z-10 (Hỏi, khuyến nghị để vòng sau), d-20261023T031527Z-11 (ba mục còn lại, một-lối) |
| P1 | evals | Chiều đỏ chỉ ghim một thông điệp mỗi eval; nhiều kiểm âm tính chưa từng chứng đỏ; tên tệp gieo 56 ký tự, AC-2 hứa 60. | Bộ chọn lệch DOM lặp qua 0 phần tử, bước in «đạt» trong khi tên vẫn bị cắt. | Mỗi thông điệp vi phạm một chiều đỏ; mỗi bước in số phần tử, đỏ khi 0; tên tệp đúng 60 ký tự. | fixed: E7 lên 13 chiều đỏ phủ mọi thông điệp (thêm 9–13); E1/E2 đếm phần tử và đỏ khi 0 («khong thay …»); tên tệp kiểm đúng 60 ký tự lúc gieo |
| P2 | evals | Kiểm «một dòng» của E3 dùng getClientRects của phần tử khối — luôn ra một hộp. | Chữ gãy hai dòng vẫn qua. | Đo bằng Range.getClientRects trên nút chữ; chiều đỏ ép chữ hẹp. | fixed: E3 đo bằng Range.getClientRects gom theo top; chiều đỏ (11) ép w-20 ghim «keo tha bop chu» |
