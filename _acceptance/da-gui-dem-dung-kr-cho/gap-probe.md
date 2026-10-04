---
slug: da-gui-dem-dung-kr-cho
at: 2026-10-04T10:45:00Z
verdict: findings
p0: 0
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Coverage chưa xếp đủ 9 ô; thiếu ô «một phần đã gửi × gửi lại kèm KR còn thiếu» | Bản cài trừ hai lần phần giao vẫn qua 4 ô cũ nhưng ra sai khi gửi {A đã gửi, B} | Thêm AC-6 + ô ma trận, chiều đỏ trừ hai lần | fixed: AC-6 và E6; Coverage liệt đủ 9 ô (4 ô Never có lý do); E1 chiều đỏ (b) |
| P1 | evals | Vế «Đã gửi N cập nhật» và tập KR thật sự gửi không được đo; câu vắng mặt đứng một mình | Mock trả cố định hoặc form gửi lố thì công thức cũ vẫn ra 0, ô AC-1 xanh oan | Mỗi ô đo tập id gửi, tiêu đề title(N), rồi mới tới conCho(K) | fixed: E1 thành ma trận 6 ô × 3 cột (18 khẳng định), AC-4 thêm vế «Đã gửi 2/3 cập nhật» |
| P1 | evals | Chiều đỏ E5 có thể không đỏ (bg-red-500 đơn không bị sàn bắt) | S4 REJECT vì thước hỏng | Chạy thử chiều đỏ trước Cổng Phạm vi | fixed: đã chạy trên bản sao — text-gray-500 + bg-red-500 cho REJECT, p0_count 1, mã 2; expected ghi đúng mã 2 |
| P2 | design | Chưa nói một lần mở trang gửi được mấy lượt | Có đường gửi tiếp không mount lại thì dữ liệu lúc mở trang cũ | Ghi rõ hoặc thêm ô hai lượt | fixed: Notes của hợp đồng — màn «Đã gửi» thay form, chỉ dẫn về Của tôi; lượt kế luôn mở trang lại |
