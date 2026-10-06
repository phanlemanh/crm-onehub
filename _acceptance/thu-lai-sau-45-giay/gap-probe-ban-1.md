---
slug: thu-lai-sau-45-giay
at: 2026-10-04T11:58:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design, evals | Gửi lại chỉ chờ onFinish (lúc trình duyệt cắt luồng), không chờ hồi âm huỷ; Trợ lý giả của E7 nhận mọi lần gửi nên không mô phỏng đua | Production: tin gửi lại tới khi eve còn chạy lượt cũ → bị nuốt, từ chối hay chạy chồng; mọi eval vẫn xanh | Chờ cả onFinish lẫn hồi âm huỷ; E2 thêm ca huỷ treo; E7 Trợ lý giả trả 409 trước mốc đỗ | fixed: thiết kế bước 4 chờ cả hai điều; AC-2 và E2 ba ca thứ tự (onFinish trước, huỷ trước, huỷ treo); AC-7 và E7 đỗ trễ 3 s, 409 trước mốc đỗ, gửi lại 202 sau mốc |
| P1 | evals | E4 cho send ném khi phiên ready nhưng đòi POST cancel thứ hai — mâu thuẫn với nhánh busy của thiết kế | Cài đúng thiết kế thì E4 đỏ; cài sai (luôn huỷ khi cờ bật) thì E4 xanh với yêu cầu huỷ thừa | E4 đặt phiên streaming lúc ném; đối chứng phiên ready gửi thẳng | fixed: AC-4 đi theo trạng thái thật của phiên; E4 hai nhánh viết trước và chiều đỏ 'huy-thua-khi-ranh' |
| P1 | evals | AC-2/AC-3 dựa trên giả định chưa kiểm rằng stop() vẫn gọi onFinish sau khi đặt ready | eve không gọi onFinish khi huỷ → tin không bao giờ gửi lại, E1–E4 vẫn xanh | Bài với EveAgentStore thật, khẳng định thứ tự ready → onFinish | fixed: E9 mới dựng EveAgentStore thật, đo trạng thái lúc onFinish và đối chứng send ngay sau stop ném đúng lỗi gốc |
| P1 | evals | «Mọi mẫu giữa hai mốc thấy chỗ báo lỗi» tự đúng khi khoảng giữa ngắn hơn chu kỳ lấy mẫu | Bản cài để chỗ báo lỗi biến mất trong lúc chờ vẫn qua E7 | Đỗ trễ 3 s; sàn số mẫu ≥ 3 | fixed: Trợ lý giả giữ hồi âm huỷ 3 s; E7 đòi ≥ 3 mẫu và in số mẫu; ảnh cho-khep chụp trước mốc đỗ |
| P2 | design, contract | dangChoKhep không có trần — onFinish không tới thì nút khoá mãi, lại một đường im | eve bỏ qua onFinish hay luồng đóng giữa lúc kiểm busy và stop | Trần SOAN_UI.choKhepMs, quá trần thì bật chuaGuiLai | fixed: thiết kế bước 5 trần 15 s; AC-3 thêm vế; E3 ca đồng hồ trôi quá trần, chiều đỏ 'khoa-mai' |
