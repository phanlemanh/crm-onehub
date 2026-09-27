---
slug: bo-dung-khong-ket
at: 2026-09-27T11:28:30Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Ô «eve chạy tiếp × continue» không có AC; lời hứa cốt lõi chỉ là giả định lái tay ở S3 | eve không khớp requestId của câu hỏi chuyển xuống phiên con; E3, E4, E6 vẫn xanh vì chỉ soi đối số gửi đi, trên production bấm xong vẫn đứng yên | eval chạy eve thật với hạn mức nhỏ và model giả, trả lời continue rồi thấy phiên con chạy tiếp | fixed: thêm AC-7 (cross-layer) và E11 — ứng dụng eve thử với mockModel, trả lời bằng khuôn của builderDeliveryMessage thật, đo cả continue lẫn stop |
| P1 | evals | Lời hứa «gọi kèm outputSchema thì lượt hỏng, bộ dựng không chạy» dựa trên tài liệu eve, không eval nào đo | eve chạy móc song song hoặc nuốt lỗi móc; E8 xanh mà thành công giả vẫn còn | chạy gốc thật trên eve với model giả phát đúng lời gọi GLM, assert turn.failed và không có phiên con | fixed: AC-5 thêm vế eve thật, E10 — móc gọi chính recordBuilderDelegation, có đối chứng không khuôn |
| P1 | evals | Đầu vào màn không lấy từ bên ghi thật; gieo của E6 có thể ghi tay | màn đọc hàng agentEvent do kênh ghi theo khuôn khác; E5, E6 xanh mà màn thật không vẽ | E6 gieo bắt buộc qua persistBuilderInputRequest với mẫu thật | fixed: E6 gieo bắt buộc qua persistBuilderInputRequest, cấm ghi tay; E5 giữ sự kiện eve thô vì đó đúng là đường sống màn dùng khi người đang xem, ghi rõ trong expected |
| P1 | contract | Nhánh «Dừng» và gửi lỗi không có AC hay eval | bấm Dừng mà câu hỏi vẫn coi là đang chờ, người dùng kẹt | AC-4 thêm Then cho stop và lỗi; E4, E5, E6 thêm ô | fixed: AC-4 thêm «hai nút biến mất sau khi nhận», «gửi lỗi thì mở lại»; E4 ma trận continue/stop; E5 ca reject và ca đã trả lời; E6 ảnh sau Dừng; AC-7 đo eve với stop |
| P2 | evals | E4 dựng bài nộp bằng khuôn viết tay thay vì hàng do API tạo | API đặt khác một trường mà điều phối rẽ nhánh; E4 xanh mà inputResponses không tới eve | eval tích hợp gọi answerBuilderQuestion thật rồi đưa chính hàng đó vào dispatch | rejected: api và agent là hai ứng dụng không import nhau; khuôn bài nộp inputResponse là đường của câu hỏi làm rõ đang chạy trên production và vòng này không đổi nó; E3 soi hàng API ghi, E4 soi bên đọc với cùng khuôn |
