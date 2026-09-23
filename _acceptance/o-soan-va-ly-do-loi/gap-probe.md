---
slug: o-soan-va-ly-do-loi
at: 2026-09-22T15:35:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

# Gap-probe: o-soan-va-ly-do-loi

Phản biện context sạch, một lượt, đọc design + contract + evals + decisions + bài học từ hồ sơ trước.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Sự kiện turn.failed và session.failed ở E3, E5, E7 là khuôn tự viết, không lấy từ bên ghi thật (eve phát, hook audit lưu AgentEvent); E5 chèn hàng tay [dieu-phoi-30-ngay-dau#F1] | eve thật đặt code ở chỗ khác thì mọi eval xanh mà thẻ vẫn chỉ hiện AGENT_FAILED | Dựng sự kiện theo kiểu eve (satisfies); chạy hook audit thật và so data nó ghi với fixture | fixed: thêm E9 (hook audit thật ghi AgentEvent từ sự kiện kiểu eve, data bằng fixture); E5 gieo data đọc từ fixture; E7 dựng sự kiện theo kiểu eve |
| P1 | evals | E6 dựng thẳng BuilderFailureCard, bỏ qua chỗ nối trong agent-builder-chat.tsx; chỉ ui-check E8 chạm chỗ nối [ke-hoach-la-mot-ban-ghi#F1] | chat chỉ truyền kind mà quên code thì E4, E6 xanh | Dom test dựng chat thật với tRPC giả | rejected: thẻ nhận nguyên đối tượng AgentTurnFailure (đã chứa code) như hiện nay, không có prop code riêng để quên; E8 chụp đường nối thật trên máy chủ của cây |
| P2 | design | ::before absolute bỏ chữ gợi ý khỏi phép tính chiều cao; không AC nào hứa chữ gợi ý nằm trọn trong ô | khổ 375 chữ gợi ý màn đầu xuống hai dòng, tràn khỏi ô, đè thanh nút | Thêm vế nằm trọn trong ô vào AC-1, AC-7 | fixed: đổi thiết kế sang xếp chồng bằng lưới một ô (ô cao theo cái cao hơn); thêm vế nằm trọn vào AC-1, AC-7, E1 mục d, E8 mục 1 |
| P2 | evals | E1 không ghim cách đo mép ::before và con trỏ; ngưỡng một phía | Range thu gọn trả hình chữ nhật 0 thì hiệu âm vẫn qua ngưỡng | Trị tuyệt đối, height lớn hơn 0 bắt buộc, mép chữ gợi ý lấy mẫu điểm ảnh | fixed: E1 dùng trị tuyệt đối, FAIL khi hình chữ nhật con trỏ rỗng, mép chữ gợi ý đo bằng lấy mẫu điểm ảnh, không đọc CSS |
| P2 | evals | Vế âm của E7 dùng task không tồn tại; token chỉ kiểm sau sự kiện 1 | handler thoát sớm với task không tồn tại; nhánh session.failed quên đặt lại token mà vẫn xanh | Gieo task thật với đối chứng dương; kiểm token sau sự kiện 2 | fixed: E7 gieo AgentTask thật và khẳng định task vẫn bị đánh dấu hỏng; gieo lại pendingInputRequest và kiểm sau session.failed; AC-6 viết lại cho khớp |
