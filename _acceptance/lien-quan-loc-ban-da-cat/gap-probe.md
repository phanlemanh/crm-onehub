---
slug: lien-quan-loc-ban-da-cat
at: 2026-10-13T00:36:30Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ ghi việc đổi hình `byId` là máy quyết theo mục tiêu, nhưng câu trích chỉ nói về danh sách trong ngăn; đầu REST bridge `/rest` mà khoá API đọc cũng đổi theo, và design chỉ tra người gọi trong `apps/agent` | Một tích hợp dùng khoá API đang đọc `contacts`/`deals` của công ty; sau khi gộp, bản đã cất lặng lẽ biến mất; chủ kho ký mà không biết | Ghi phần lộ ra ngoài kho thành câu hỏi `chi-nguoi` có khuyến nghị và lối khác; Notes nêu đã tra gì | human-gate1: sổ thêm d-20261013T003730Z-8 (`chi-nguoi`, khuyên đổi cả REST và ghi vào `docs/api.md`); Notes và design nêu câu tìm đã dùng — chủ kho chốt ở Cổng Phạm vi |
| P1 | contract | Lời báo xoá vĩnh viễn ở ngăn thoả thuận (chữ «người» số ít/số nhiều) không có AC, eval hay ô trên Trục C | Thoả thuận 1 người đang dùng và 1 người đã cất; lời báo nói số ít trong khi cả hai còn ở lại; không eval nào bắt | AC và eval DOM có ca đối chứng | fixed: AC-9 thêm ca thoả thuận, E9 thêm (b) có đối chứng và chiều đỏ, Trục C ghi chỗ đọc, design nêu luật đếm tổng |
| P1 | evals | E7 ghi `toBe(6)` nhưng liệt kê 7 phép kiểm; tab Cá nhân của công ty không có bản đã cất nên không phân biệt; ngày chốt không ghim đồng hồ | Cài đúng thì 7≠6, E7 đỏ oan; bản sao đếm cả `archivedContacts` vẫn xanh; sau 01/12/2026 đỏ theo giờ thật | `toBe(7)`, thêm cá nhân đã cất và chiều đỏ, `setSystemTime` | fixed: E7 viết lại ma trận 7 phép, thêm `archivedContacts` và chiều đỏ «lqc: so tab ca nhan dem ban da cat», ghim `2026-10-15T03:00:00Z` |
| P2 | evals | Dữ liệu giả của các bài DOM viết tay theo hình người đọc, không qua hợp đồng đầu ra thật | Router trả hình khác dữ liệu giả; màn thật sai mà E5, E8 xanh | Dữ liệu giả mang kiểu `RouterOutputs[...]["byId"]` | fixed: `expected` của E5 đòi kiểu `RouterOutputs` không ép kiểu, `check-types` đo khớp hợp đồng |
| P2 | evals | `paths` của E15 thiếu `apps/api/src/crm/**` và `apps/api/src/contacts/**` | Sửa hình gọn sau khi ký mà E15 vẫn bị coi là mới | Thêm hai glob | fixed: thêm cả hai vào `paths` của E15 |
