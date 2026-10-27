---
slug: bao-loi-tac-nhan-sau-cau-hoi
at: 2026-10-27T01:32:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ d-20261027T010607Z-4 bỏ ca tin trò chuyện chen giữa lúc đang dựng rồi hỏng, ghi là máy quyết theo câu giao; câu giao không giới hạn mà mở rộng, và ngưỡng CHẾT của opportunity.md gọi đúng ca này | Chủ kho ký hợp đồng tuyên SỐNG trong khi một ca thuộc mức CHẾT (tab thứ hai gửi tin, lượt dựng hỏng, hộp thông báo trống) vẫn còn | Thay dòng sổ; hoặc hỏi người, hoặc đưa ca vào phạm vi bằng một tiêu chí | fixed: đưa ca vào phạm vi (AC-6, AC-7, AC-9) theo ngưỡng CHẾT đã ký ở opportunity.md; dòng sổ mới d-…-7 thay d-…-4 |
| P1 | design | Dòng d-20261027T010607Z-2 loại lối sửa bộ đọc vì «không có ca đỏ trên đường người dùng tới được», trong khi bảng đo của design có đúng một ca đỏ tới được | Lối sửa mã bị loại vì lý do sai, và nếu chọn làm ca chen giữa thì thiết kế không còn lối nào | Viết lại lối chết cho khớp bảng đo | fixed: dòng sổ mới d-…-6 thay d-…-2 — sửa bộ ghi chọn lần gửi đã giao, chiều đỏ là ca chen giữa của bảng đo |
| P1 | contract | Thước trục C nói «ba nơi gọi baoTacNhan(…, "hong")» nhưng các ô chỉ có hai sự kiện | Một đường hỏng thứ ba đọc quyền khác sẽ lọt | Liệt kê đủ nơi gọi, mỗi nơi nối với AC | fixed: đếm lại `crm.ts` — đúng hai nơi gọi «hong» (`turn.failed`, `session.failed`) và một nơi gọi «cho»; thước trục C sửa thành hai |
| P2 | evals | E1 chỉ khẳng định lastAssistantAt khác rỗng, trong khi bước chờ trước đó đã đặt nó | Bộ ghi thôi cập nhật lastAssistantAt lúc hỏng mà E1 vẫn xanh | Chụp giá trị trước turn.failed, khẳng định giá trị sau lớn hơn hẳn | fixed: AC-1/E1 so giá trị trước và sau `turn.failed` |
| P2 | design | Câu hỏi làm rõ dựng từ khuôn rồi parse, không đi vòng từ bên ghi thật | Sự kiện thật mang hình khác, đi nhánh khác của persistBuilderInputRequest mà bài kiểm vẫn xanh | Dùng sự kiện câu hỏi thật đã chụp | fixed: dùng `apps/agent/test/fixtures/hai-luot-hoi-that.json` (chụp từ eve); ngữ cảnh phiên lấy từ chính lời gọi giao của `dispatchBuilderSubmission` |
