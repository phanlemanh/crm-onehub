---
slug: slack-thieu-quyen-email
at: 2026-09-28T04:19:30Z
verdict: findings
p0: 0
p1: 1
p2: 4
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Không eval nào đặt người không xác định ở trang 2 của `users.list`; luật «ngoài danh bạ thì không tính» biến lần đọc danh bạ bị cụt thành lối cho qua | Danh bạ hai trang, người okr không email, không dòng khớp chỉ ở trang 2; bản vá chỉ đọc trang 1 thì người đó thành «ngoài danh bạ» và tin đi ra, E1–E7 vẫn xanh | Vế phân trang trong E1: hai trang, đòi 0 `chat.postMessage`, lời «không kiểm được», `users.list` === 2 | fixed: AC-1 thêm câu phân trang; E1 thêm vế hai trang, đếm `users.list` === 2; ca `stqe-kenh` đã nằm trong danh sách ghim đỏ-trước của E9 |
| P2 | evals | E6 gắn email cho tài khoản đã xoá, trái hình thật của kết nối thiếu quyền | Bản vá xét «không email» trước cờ đã xoá; E6 xanh, Slack thật chặn mọi kênh có tài khoản đã nghỉ | E6 thêm tài khoản đã xoá không email | fixed: AC-6 và E6 có hai tài khoản đã xoá — một không email, một mang email người okr |
| P2 | evals | E7 không tách số người không xác định khỏi tổng số người | Bản vá in tổng số người; kênh của E7 cho cùng số, E7 xanh | Thêm người đã khớp và người ngoài CRM vào kênh; đòi `2 people`, cấm `4 people`/`3 people` | fixed: AC-7 nói rõ đếm người không xác định, không đếm tổng; E7 dùng kênh bốn người |
| P2 | evals | E1, E2, E5 chỉ ghim tiền tố `KHONG_KIEM_DUOC_NGUOI_NHAN`, không phân biệt luật mới với lối chặn chung khi đọc Slack hỏng | Khuôn phân tích ở biên từ chối `profile` vắng hay `email: null`; lượt bị chặn theo lối chung, E5 xanh | Đòi thêm « (1 person » và «reconnect Slack» | fixed: E1, E2, từng hàng E5 ghim cả hai; E5 in tên hàng và thông điệp khi đỏ |
| P2 | evals | E10 gom commit bằng tên hồ sơ, commit không mang tên lọt khỏi tập xét | Commit «fix(agent): …» chạm tệp của hãng không mang tên hồ sơ; E10 xanh sai | Mọi commit của nhánh chưa có trên `origin/onehub` phải mang tên hồ sơ | fixed: E10 thêm vế «COMMIT KHONG TEN» với chiều đỏ tự thân `--gia-commit-khong-ten` |
