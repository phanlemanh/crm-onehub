---
slug: tin-hieu-tu-ve-kho
at: 2026-10-14T02:56:35Z
verdict: findings
p0: 0
p1: 4
p2: 1
---
# Phản biện context sạch — tin-hieu-tu-ve-kho

Một phiên mới, chỉ đọc thiết kế, hợp đồng, bộ đo, sổ quyết định, ô cơ hội và bài học từ hồ sơ trước. Sửa xong không phản biện lại (một lượt).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract, evals | AC-9 chỉ mở PR khi lượt vừa đẩy; lượt cây trùng mà chưa có PR thì không bao giờ mở | Lượt đầu đỏ ở bước mở PR vì kho cấm; chủ kho bật quyền; các đêm sau không có tín hiệu mới nên không PR nào hiện, 5 tệp nằm im trên nhánh hàng chờ | Ô E9 cây trùng không PR và PR đã đóng không gộp; chiều đỏ khi chỉ kiểm PR lúc vừa đẩy | fixed: AC-9 viết lại — mọi lượt xanh kết thúc với đúng một PR mở khi nhánh hàng chờ khác nhánh chính; E9 thêm ô 4, 5 và chiều đỏ «nhánh hàng chờ có tệp mà không PR»; thiết kế ghi bước này chạy cả khi không đẩy |
| P1 | evals | Khoá thường «cũ» của E6 chèn tay configId default — khuôn bên đọc mới chờ | Khoá production cất configId khác lúc trước; móc mới trả 401, mọi khoá cũ mất phiên mà E6 vẫn xanh | Fixture tạo qua đường tạo thật không truyền configId và một hàng đặt về DEFAULT của cột | fixed: E6 tạo khoá qua đường tạo thật không truyền configId và thêm hàng đặt configId về DEFAULT của cột; đã đọc migration 20260820152910_add_api_keys — cột NOT NULL DEFAULT 'default', thư viện coi default và rỗng là mặc định; ghi vào hợp đồng (Notes) và thiết kế, không migration |
| P1 | evals, contract | Ma trận E4 chọn tay 7 đường, thiếu tRPC gốc, các đường api-key khác, đường đọc khoá ngoài getSession; đường 7 gọi hàm chứ không qua cầu tác nhân | Một đường tự đọc x-api-key và gọi verifyApiKey không truyền configId nhận khoá chỉ-kéo; vế CHẾT báo sống sai | Liệt kê bằng máy mọi chỗ đọc khoá, số ô bằng số chỗ | fixed: E4 lên 11 đường (thêm tRPC gốc, api-key list/update/delete); thêm E4c — răng duong-doc-khoa.mjs liệt kê bằng máy mọi chỗ gọi getSession, verifyApiKey, đọc x-api-key trong apps/api, apps/app, apps/agent, packages/auth và mọi đường /api-key/* của plugin; chỗ không có ô là đỏ. Cầu tác nhân đi qua apps/app/lib/session.ts nên ô 11 gọi đúng hàm đó; E4c bắt nếu cầu đổi sang đọc khoá kiểu khác |
| P1 | evals, design | Nhánh hàng chờ ghi đè chỉ an toàn khi thủ tục trả cả tín hiệu đã dấu; chưa eval nào đo quan hệ đó; máy chủ giả E8 viết tay | Ngày 2 máy chủ chỉ trả tín hiệu chưa dấu; lượt ghi đè làm rơi crm-1, crm-2 khỏi nhánh hàng chờ trong khi CRM đã báo «Chờ gom» | E3 lượt hai trả đủ id cùng byte; E8 máy chủ giả bằng hàm ghi thật, quan hệ không rơi tệp, chiều đỏ | fixed: E3 thêm dòng 3b và chiều đỏ «lượt kéo về bỏ tín hiệu đã dấu»; E8 máy chủ giả phát bằng hàm viết thật và giữ luật trả mọi tín hiệu còn lại, thêm dòng 6 quan hệ không rơi tệp và chiều đỏ «nhánh hàng chờ làm rơi tệp chưa gộp»; hợp đồng AC-3, AC-8 nói rõ quan hệ |
| P2 | contract | «Chờ lâu nhất» chỉ thấy tín hiệu vừa đóng dấu; không nói cách đo tín hiệu chưa dấu; lịch một lần mỗi ngày làm lúc chờ sát 24 giờ | Lượt bị bỏ ba ngày: không dòng nào báo; tín hiệu gửi 21:01Z chờ hơn 24 giờ dù hệ thống đúng | Truy vấn CSDL trên mọi tín hiệu kể cả chưa dấu; nói rõ sai số lịch | fixed: Đường đo ghi truy vấn trên mọi tín hiệu trong khung, chưa dấu tính tới lúc đo; lịch chạy hai lần mỗi ngày (21:00Z, 09:00Z) nên lúc chờ dài nhất khoảng 12 giờ cộng trễ lịch — ngưỡng đã ký giữ nguyên, AC-10 và E10b đổi theo |
