---
slug: giai-doan-thoa-thuan
at: 2026-09-29T00:25:40Z
verdict: findings
p0: 0
p1: 4
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E8 đo chữ ký trong generated/server.ts («không thủ tục nào nhận kind ngoài create»), mâu thuẫn với reorder { kind, ids } của design và ca 5 của E5 | S3 làm đúng design thì E8 đỏ vế tĩnh; rename trải input vào data qua schema lỏng vẫn đổi được kind mà vế tĩnh xanh | Ma trận hành vi: mọi mutation trừ create gửi kèm kind khác loại, đọc CSDL thấy kind không đổi | fixed: E8 bỏ vế tĩnh, thay ma trận hành vi rút danh sách mutation từ generated/server.ts, chiều đỏ «rename: kind OPEN -> WON» |
| P1 | contract | Số «N thoả thuận» của danh sách giai đoạn có tính thoả thuận đã lưu trữ hay không chưa được hứa và đo | Giai đoạn chỉ còn thoả thuận đã lưu trữ hiện 0, màn mở hộp hỏi lại không moveTo, máy chủ từ chối — không đường nào xoá được qua giao diện | list trả count gồm thoả thuận đã lưu trữ; màn mở hộp chuyển khi count > 0 | fixed: AC-6 thêm vế đếm gồm đã lưu trữ và nút Xoá mở hộp chọn đích; E7 đo count S = 3, T = 1; E16 thêm ca count > 0 toàn đã lưu trữ |
| P1 | contract | AC-5 thiếu tag (cross-layer) và lời hứa nhãn trên dòng lịch sử chỉ đo ở API | Component timeline tự tra nhãn trong giaiDoan.list (chỉ giai đoạn sống) nên giai đoạn đã xoá hiện id thô; E6 xanh ở API | Eval jsdom dựng timeline với giai đoạn đã xoá vắng khỏi list | fixed: AC-5 gắn (cross-layer) và hứa «không hiện id»; thêm E19 giai-doan-timeline.dom.tsx cùng khoá gdtt_man_timeline |
| P1 | evals | deals.bulkStage không có eval dù phải kiểm giai đoạn sống và luật theo loại | bulkStage updateMany không kiểm archivedAt và không bắt lý do LOST; thoả thuận rơi vào giai đoạn không còn cột | Ca bulkStage trong E6 và E11 | fixed: AC-5 và AC-9 hứa cả chuyển hàng loạt; E6 thêm bulkStage vào giai đoạn đã xoá bị từ chối; E11 thêm hai ca bulkStage vào LOST mới |
| P2 | contract | Coverage và design hứa phát deal.stage.changed khi chuyển lúc xoá, AC-6 và E7 không đo | Chuyển bằng updateMany + createMany đủ cho E7 xanh nhưng không phát sự kiện nào; tác nhân nghe sự kiện không thấy N lần chuyển | E7 đếm sự kiện = 3 ca xanh, = 0 ca nguyên tử | fixed: AC-6 thêm vế mỗi thoả thuận một sự kiện, lượt thất bại không phát; E7 đếm và so từng cặp from/to, chiều đỏ «sự kiện 0 != 3» |
