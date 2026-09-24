---
slug: zalo-goi-thu-hong-hien-dung-bot
at: 2026-09-24T09:12:00Z
verdict: findings
p0: 0
p1: 1
p2: 4
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E6 dòng 3 lấy chuỗi kỳ vọng «từ messages của đúng ngôn ngữ». Nếu đó là chính câu cảnh báo mới thì assert so câu với chính nó. Lời hứa AC-6 là quan hệ giữa hai chuỗi: câu cảnh báo phải có tên bot và gọi đúng tên nút | Bản en viết thiếu tên nút mà test tính kỳ vọng từ cùng hàm nên vẫn xanh; người dùng tiếng Anh không biết bấm nút nào | Lấy nhãn nút mà `TrangThaiWebhookZalo` render ở cùng ngôn ngữ, assert câu toast chứa nhãn đó và `tenBot`; thêm literal theo AC; đột biến bỏ tên nút khỏi câu en | fixed: E6 dòng 3 đo quan hệ với nhãn nút render thật, thêm dòng 3b literal và đột biến «câu cảnh báo phải gọi tên nút Đăng ký lại» |
| P2 | evals | Ma trận 12 ô E2 không có cột tên bot (`zaloBotName`, `tenBot`) dù lời hứa là hiện đúng bot | Ô lần-đầu × gọi-thử-hỏng không ghi tên, hoặc ô ok-false × token mới để lọt tên mới; E2 vẫn xanh | Thêm `ten` và `tenBot` vào cả 12 ô, viết trước; đột biến bỏ ghi tên | fixed: E2 thêm hai cột và đột biến; AC-2 thêm vế tên bot |
| P2 | design | Luật cờ trong `docWebhook` viết là đọc rồi ghi; nhịp chen giữa lúc `datBot` chạy thì gỡ cờ | Nhịp đọc lý do null, `datBot` gọi-thử-hỏng đặt cờ, nhịp ghi U2 theo lần đọc cũ; Ngoài-3 quay lại dù E4/E5 xanh | Ghi có điều kiện bằng `updateMany`; thêm ô «nhịp chen» vào E4 | fixed: design đổi sang một lệnh `updateMany` có điều kiện; AC-4 và E4 thêm ô 13 «nhịp chen không gỡ cờ» cùng đột biến đọc-rồi-ghi |
| P2 | evals | E8 không chứng nhịp đã thật sự chạy `docWebhook`, không cô lập khỏi tác tử khác trên cùng DB dev; ảnh sau lưu có thể chụp trước khi trang tải lại | Tác tử của cây khác tick trên cùng `AppSetting`; ảnh sau nhịp xanh dù luật cờ không chạy, hoặc đỏ giả | Kiểm cổng 2000 và dừng mã 2; lệnh `nhip` in số lần `getWebhookInfo` (phải 1) và url đọc lại; chờ tất định tới khi có «Bot Mới» | fixed: E8 thêm kiểm 2000, `E8-nhip.txt` với `getWebhookInfo=1 url=null`, chờ tất định chữ «Bot Mới», chụp thông báo riêng |
| P2 | evals | E10 không có chiều đỏ trên bản gốc; mốc 1 và mốc 3 có thể đã đạt trước khi sửa tài liệu | Không sửa tài liệu mà E10 vẫn exit 0; AC-10 ký đạt sai | Chạy script trên hai tệp ở `merge-base` — phải đỏ; siết mốc 1 và mốc 3; ROOT suy từ vị trí script | fixed: E10 thêm lượt `--goc` trên `merge-base`, mốc 1 đòi thêm «bot mới», mốc 3 đòi «đã lên `onehub`» và cấm «PR mở»; AC-10 nói rõ bản gốc không đạt |
