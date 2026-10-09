---
slug: zalo-gui-hong-ghi-ly-do
at: 2026-10-08T11:30:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | contract | Nhánh HTTP lỗi chỉ hứa http-<mã>, bỏ description/error_code trong thân; ma trận sót 400, 404 | Gửi thử nhận HTTP 403 kèm description, nhật ký chỉ in http-403 — ngưỡng SỐNG không đạt mà E1 vẫn xanh | Dòng HTTP có thân phải mang zalo-tu-choi <mã> «<ghim>»; cặp phá bỏ đọc thân | fixed: AC-1/E1 mười hai dòng gồm 400, 401, 403, 404, 408, 429 có thân; zaloGoi đọc thân trước khi ném; cặp (l) |
| P1 | evals | E6 không có đường nào để token lọt vào loi.message | Cặp (g) không đỏ, E8 thoát 1; chỗ String(loi) ở zalo-nhan.ts bỏ ngỏ | Thêm lỗi mạng có URL chứa token và HTTP 401; gom cả hai chỗ String(loi) | fixed: E6 thêm hai dòng và gom zalo-nhan.ts 182/209 |
| P1 | contract | «Cùng một giao dịch» ở AC-8 không có phép đo | Ghi AppSetting rồi gỡ liên kết hai lệnh rời; bước gỡ hỏng thì liên kết cũ sống với bot mới | Tiêm lỗi vào bước gỡ trong giao dịch; cặp phá tách giao dịch | fixed: E10 ca (3); cặp (j) «go lien ket khong nguyen tu»; design ghi một $transaction |
| P1 | evals | AC-7/AC-8 đi qua app → API → agent mà không tag cross-layer, không eval trọn đường | Schema API bỏ xacNhanDoiBot, hộp thoại hiện mãi; E9/E10/E13 vẫn xanh | Eval qua router API thật với agent giả; bài DOM Huỷ/xác nhận | fixed: tag (cross-layer) cho AC-7, AC-8; E14 (backend-effect), E15 (DOM), cặp (m), (n) |
| P2 | contract | Ranh giới thiếu zalo-lien-ket.ts, kenh-thong-bao.ts, guard chữ; AC-3 đếm bảy chỗ thay vì tám; paths E8 thiếu tệp; E12 không có cặp phá có tên | Đặt hàm gỡ đúng nhà thì E7 đỏ; sửa datBot không làm E8 cũ đi | Thêm tệp vào Ranh giới; AC-3 tám chỗ; paths E8 đủ; cặp (k) | fixed: cả bốn ý; SO_CAP_KHAI = 14 |

## Lượt hai — phần A (webhook 403/404), 2026-10-08T11:55Z: 0 P0 · 2 P1 · 3 P2

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | evals | «Ghi đúng một lần» mâu thuẫn với updateMany có điều kiện (một câu lệnh mỗi yêu cầu); không có ca đồng thời, không có cặp phá | Spy đếm 3 lần gọi nên đỏ oan, hoặc thợ đổi sang đọc-rồi-ghi thì đua khi đồng thời | AC đếm hàng đổi; E16 ba yêu cầu đồng thời + ba lần lượt, tổng count = 1; cặp phá bỏ điều kiện | fixed: AC-12 «hàng đổi đúng một lần»; E16 dòng (1); cặp (s) |
| P1 | contract | Mọi 403 đều bật lý do bền, kể cả máy quét không header | Máy quét bật cảnh báo khoá lệch giả, Đăng ký lại xong lại bị bật | Chỉ đặt lý do khi header có mà lệch và thân là tin Zalo; ca âm | fixed: AC-12 ba nhánh (khoa-lech, thieu-khoa, 404); E16 dòng (2), (3); cặp (t) «ke la bat canh bao gia» |
| P2 | evals | E18 đòi đặt lý do bằng nhánh 403 của agent từ bài thử API | Import chéo agent vào api làm đỏ check-types, hoặc gieo tay trái expected | Gieo bằng hằng ZALO_LY_DO | fixed: E18 gieo bằng ZALO_LY_DO, layer backend-effect |
| P2 | evals | Ảnh thứ ba của E13 gắn AC-7; AC-13 xuyên ba tầng không tag | Trang cha truyền sai trạng thái mà không ai chấm AC-13 thấy | Eval ui-observed riêng cho AC-13; tag cross-layer | fixed: E20 (ui-check, AC-13); AC-13 (cross-layer); bỏ ảnh thứ ba khỏi E13 |
| P2 | evals | E17 url fixture không ghim; ca (2) lệch chữ AC-13; thiếu ca Lưu bot | Cặp (p) không đỏ do kiemBot rẽ nhánh khác; người chấm thấy «giữ» không giữ | url dựng bằng hàm của datBot; AC-13 «không về null»; thêm ca (4) | fixed: cả ba |
