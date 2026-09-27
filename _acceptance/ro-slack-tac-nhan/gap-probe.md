---
slug: ro-slack-tac-nhan
at: 2026-09-27T02:41:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E11 không chặn ca đỏ vì thiếu mô-đun thay vì đỏ vì còn rò: E1, E3 so với hằng xuất từ tệp mới chưa có ở origin/onehub | Trong bản gương bun báo «Cannot find module», không dòng (fail) nào mang tên ca; E11 hoặc không bao giờ xanh, hoặc bị nới cách so để xanh — đỏ trước vá chỉ chứng tệp mới chưa có, không chứng tin đã đi ra | Tệp kiểm nạp mô-đun mới bằng import() động có dự phòng; khẳng định số chat.postMessage trước; E11 đòi «chat.postMessage=1» và không có «Cannot find module»; thống nhất tên tệp luot-tu-dong.integration.spec.ts | fixed: E1, E3, E6, E11 và design doc đã sửa đúng như thước đo đề xuất |
| P1 | evals | Trả lời giả của Slack ở E1–E7 viết tay theo khuôn bên đọc; không eval nào ghim hình trả lời thật (response_metadata.next_cursor, profile.email) [tra-loi-tin-nhac#F1] | Bộ đọc đọc next_cursor ở cấp ngoài cùng và dữ liệu giả cũng đặt ở đó; E7 xanh, production chỉ đọc trang 1, người «chỉ OKR» ở trang sau lọt | Ghim hình Slack Web API trong expected; E7 khẳng định dữ liệu giả không có next_cursor cấp ngoài cùng và trang 2 mang cursor=c2 | fixed: E1 và E7 ghim hình Slack Web API; design doc dùng lại bộ đọc listSlackMembers đã chạy thật ở đồng bộ người Slack thay vì khuôn đọc mới |
| P1 | evals | Ca từ chối vì người nhận không tách khỏi ca từ chối vì đọc lỗi; hai hằng chỉ được ghim bằng «chứa»; E7 thiếu đối chứng dương; lời hứa «nêu số người» không có phép đo | Trang 2 của E7 hỏng, hàm rơi vào nhánh «không kiểm được»; nếu hằng này chứa hằng kia hoặc rỗng, E7 vẫn xanh dù vòng phân trang chưa đọc được người «chỉ OKR» | Hai hằng khác rỗng, không chứa nhau; E1–E4, E7 khẳng định không chứa KHONG_KIEM_DUOC_NGUOI_NHAN và có số người; E7 thêm đối chứng trang 2 chỉ có member | fixed: AC-1, AC-7 và E1–E4, E6, E7 đã thêm đúng các khẳng định này |
| P1 | contract | Trục A và C khai thước «grep mọi chỗ» nhưng không eval nào nối kết quả grep với các hàng; trục C thiếu hàng «theo sự kiện» | Một đường khởi lượt hay một lối gửi Slack khác xuất hiện không qua postRunSlackMessage hay không mang purpose team-agent; E1–E10 vẫn xanh, người duyệt ký hai trục là đã phủ | Eval script kiểm kê viết trước mọi chỗ dựng authenticator và mọi chỗ gửi Slack, so bằng với kết quả quét | fixed: thêm AC-14 và E14 (rang/kiem-ke.mjs); trục C thêm «theo sự kiện» — đi dispatchAgentRun không initiatedById, nên thuộc AC-8 |
| P2 | evals | E12 rút mọi đường apps/...ts trong mục chỗ rẽ nhưng chỉ so với tệp của hãng bị sửa | Mục chỗ rẽ nêu thêm tệp mới của bản rẽ; E12 báo THIEU và đỏ oan, ép viết thiếu tài liệu | Chỉ rút đường có ở origin/release; thêm đối chứng mục nêu tệp của bản rẽ vẫn xanh | fixed: E12 lọc đường rút bằng git cat-file -e origin/release và có đối chứng |
