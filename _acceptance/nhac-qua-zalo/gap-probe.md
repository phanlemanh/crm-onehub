---
slug: nhac-qua-zalo
at: 2026-09-23T08:10:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | «Zalo dùng được» định nghĩa hai nơi (agent: token + liên kết; API: zaloBotName); không eval đo quan hệ kênh trang báo = kênh máy gửi; AC-6 bỏ ngỏ getMe lỗi | Token bị thu hồi, getMe 401, zaloBotName vẫn còn; trang báo dùng Zalo, máy gửi Zalo lỗi rồi retireExhausted; mọi người mất nhắc im lặng mà E4 E6 E15 vẫn xanh | Ca getMe 401 đưa zaloBotName về null; ma trận trang ↔ máy gửi trên cùng trạng thái gieo | fixed: AC-6 thêm ca getMe 401 → zaloBotName null → nhắc đi Slack kèm lệch (E6 ca 3); AC-4 thêm quan hệ kenhSeDungCua = payload.kenh cho P Q R S (E4); design mục 6 gom về một hàm kenhSeDungCua dùng chung |
| P1 | evals | AC-7 hứa qua thủ tục tạo mã của API mà không tag cross-layer, E7 gọi thẳng packages/db; nút Nối Zalo, Tạo mã mới, Gỡ không có eval dom [ke-hoach-la-mot-ban-ghi#F1] | Router tự sinh mã bằng Math.random, không xoá mã cũ hoặc trả mã cho người ngoài xưởng; nút nối nhầm mutation; E7 vẫn xanh | Eval tRPC tạo mã hai lần + người ngoài xưởng bị từ chối; eval dom có spy cho nối và gỡ | fixed: AC-7 và AC-10 gắn (cross-layer); thêm E19 (tRPC tạo mã, người ngoài xưởng), E20 (nút Nối và Tạo mã mới), E22 (Gỡ qua xác nhận, câu về Slack) |
| P1 | contract | Không AC nào đo trạng thái liên kết trên trang cá nhân (chưa nối, mã chờ, mã hết hạn, đã nối) và vòng làm mới | Thủ tục trạng thái coi mọi hàng mã là mã chờ; nối xong trang vẫn hiện mã, vòng làm mới chạy mãi; E15 E16 E17 xanh | AC cross-layer + ma trận bốn trạng thái + dòng dom làm mới dừng khi đã nối | fixed: thêm AC-15 (cross-layer), E21 (ma trận bốn trạng thái qua tRPC, không lộ mã), E23 (làm mới dừng khi đã nối); design mục 6 thêm bảng trạng thái liên kết |
| P2 | evals | AC-8 tuyên không bảng nào lưu văn bản người nhắn, E8 chỉ quét bốn bảng kể tên | pollZalo ghi update gốc vào AgentTask.payload hoặc dòng lỗi; E8 vẫn xanh | Chuỗi lính canh + quét mọi bảng mọi cột text/json từ information_schema, có đối chứng dương | fixed: E8 dòng 4 quét toàn DB theo information_schema bằng lính canh, đối chứng dương chèn tay vào AgentTask |
| P2 | evals | E2 khẳng định không có &amp; mà fixture không có ký tự cần thoát | Khuôn tron vẫn thoát HTML, Zalo nhận Minh &amp; Co; E2 xanh | Gieo công ty «Minh & Co <HN>», khẳng định dương chứa nguyên chuỗi; đột biến bật thoát HTML | fixed: AC-2 và E2 gieo «Minh & Co <HN>», thêm đột biến bật thoát HTML |
