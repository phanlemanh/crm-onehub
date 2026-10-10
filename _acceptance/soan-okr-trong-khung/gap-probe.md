---
slug: soan-okr-trong-khung
at: 2026-10-09T08:14:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E12 cần ảnh `doi-chieu-khung-muc-tieu-1440-dark.png` mà không eval nào chụp | hội đồng thiếu input, câu (2) «cùng dáng khung Mục tiêu» thành đoán | bước có tên chụp ảnh đối chiếu; thiếu ảnh thì đỏ | fixed: thêm bước ảnh đối chiếu vào E11, thiếu ảnh in 'thieu anh doi chieu' mã 1 |
| P1 | contract | trang Theo đơn vị sống sau khung không được làm mới sau «Đưa vào» | đóng khung sau biên nhận vẫn thiếu N Mục tiêu và còn nút «Tiếp tục» cho tới khi tải lại | AC mới so số Mục tiêu trên màn với CSDL sau đóng khung, chiều đỏ bỏ làm mới | fixed: thêm AC-13 và E14 (ui-check, chiều đỏ khong-lam-moi); design doc thêm mục «Trang nền sau Đưa vào» |
| P2 | contract | trục C có «tải lại» nhưng AC-7, AC-8 không có vế tải lại; luật beforeunload chưa nói bật khi nào | bộ giữ dời vào khung làm rơi beforeunload hoặc hỏi vô cớ khi rảnh | vế tải lại trong AC-7, AC-8 và bước ui-check | fixed: AC-7 nói beforeunload khi và chỉ khi Kara đang soạn; AC-8 thêm tải lại; E8 thêm ca tải lại có dialog và CSDL |
| P2 | evals | E10 (2) chỉ đòi một trong hai token; E3 so khoảng số thay vì so với token | cột Kara đặt w-96 vẫn lọt 372–388 và lọt regex px | E3 đọc token từ computed style; chiều đỏ kara-w96 và token-420 | fixed: E3 so với giá trị token ± 1 kèm hai chiều đỏ; E10 đòi cả hai token ở đúng hai ô |
| P2 | evals | E11 tính ST-khung-chua-cau-hinh mà không nói cách dựng phiên thiếu cấu hình | E11 kẹt hoặc người làm dựng phản hồi giả đúng khuôn bên đọc | dựng phiên đo thiếu biến cầu nối, hoặc loại ô có lý do | fixed: loại ô khỏi ma trận E11 kèm lý do; bài DOM E5 ô «chưa cấu hình» phủ trạng thái này |
