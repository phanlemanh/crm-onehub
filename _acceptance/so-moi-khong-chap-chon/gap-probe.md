---
slug: so-moi-khong-chap-chon
at: 2026-10-07T13:27:00Z
verdict: findings
p0: 0
p1: 1
p2: 3
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-2 là quan hệ «số vắng khỏi gói của CHÍNH cuộc bài nộp vào», nhưng fixture va chạm chèn cùng chuỗi vào mọi tên gieo và bài dò chỉ đọc gói của canh.cuocSoanId — E2 xanh cả khi hàm đọc nhầm cuộc | Bài 3 gọi soVangKhoiGoi(canh.cuocSoanId, 41) thay vì cuộc mới; dưới fixture hai gói cùng chứa bốn số nên E2 xanh | Fixture chèn số khác nhau theo cuộc, cộng chiều đỏ đột biến «mọi lời gọi dùng canh.cuocSoanId» | fixed (một phần): E4 phủ thêm AC-2 và hỏi đích danh đối số cuộc của từng bài. Fixture theo từng cuộc không dựng được trong ranh giới: cuộc của bài 3, 4 dùng chung phòng và chu kỳ với canh (gieoCuoc nhận departmentId, cycleId của canh), nên chữ số từ ma() trùng ở cả hai gói — đổi điều đó phải sửa test/support (ngoài ranh giới, decisions d-20261007T132042Z-2) |
| P2 | evals | Lời hứa «không còn hằng làm số vắng» của AC-2 chỉ đo bằng hành vi; E4 hỏi đúng điều đó nhưng criterion chỉ khai AC-5 | Thay 41 bằng hằng 9973: E1, E2 xanh, dòng AC-2 PASS mà lớp lỗi còn | Thêm AC-2 vào criterion của E4 | fixed: E4 criterion = AC-2, AC-5; câu hỏi thêm vế «còn hằng số nào làm số vắng ngoài hàm đọc gói» |
| P2 | evals | Bản sao ở .acceptance-runs không phải gói turbo — không nói rõ dùng CSDL nào, E2 và E3 có dẫm nhau không | Răng lùi về bun test trần trên crm_test; hàng sót làm bài thứ năm đỏ, E3 thoát 1 giả | Ghi rõ mỗi lượt một kho riêng | fixed: expected của E2 ghi chạy từ gốc kho bằng bun run test -- "cd <bản sao> && … bun test ./<tệp>" — bọc của gốc tạo crm_<id>_test riêng mỗi lượt bất kể thư mục (cùng đường với nbn_dao_thu_tu đã ký) |
| P2 | evals | Không nói gốc kho của răng suy từ đâu | Gốc lấy theo cwd hay ghi cứng ~/dev/crm thì bản sao nạp agent/ và spec của checkout chính | Gốc từ import.meta, in đường đã nạp, lệch thì thoát 2 | fixed: expected của E2 ghi gốc từ import.meta.dirname, in đường spec và agent/ đã nạp, nằm ngoài gốc thì thoát 2 |
