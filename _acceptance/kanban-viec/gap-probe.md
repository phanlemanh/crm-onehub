---
slug: kanban-viec
at: 2026-10-13T08:55:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Sổ ghi máy quyết «ngưỡng chỉ đếm kéo» nhưng ô cơ hội ghi sống là «đếm theo nguồn bảng», chết là «qua bảng» — hai cách đọc; đường đo không nối ngưỡng chết với trường nào | 30% kéo, 20% menu: đọc theo chữ ô cơ hội là sống, đọc tiLeBangKeo là làm tiếp — Cổng Giá trị ra hai phán quyết; người dùng điện thoại (menu là lối chính) bị loại khỏi tử số | Đổi dòng sổ thành câu hỏi người; Đường đo đủ bốn dòng; thước in thêm tiLeBang | human-gate1: thành Hỏi-4 (dòng sổ thay d-20261013T083945Z-6); fixed: Đường đo bốn dòng, AC-10 và E10 thêm tiLeBang, E15 cặp (l) |
| P0 | design | Sổ ghi máy quyết «việc con chép gắn và người của cha» nhưng câu trích CONTEXT.md chỉ tả luật thấy việc, không nói về việc con — ai thấy con là nghĩa sản phẩm và quyền riêng tư | Việc con nội bộ của một thoả thuận hiện cho mọi người đọc được thoả thuận; người giao việc cha bị thêm vào theo dõi mọi con; chủ kho không thấy đây là một lựa chọn | Đổi dòng sổ thành câu hỏi người; AC-7, AC-8 ghim theo lối chủ kho chọn | human-gate1: thành Hỏi-5 (dòng sổ thay d-20261013T083945Z-8); hợp đồng ghi AC-7, AC-8, E7, E8 đang ghim theo lối khuyên và sẽ sửa nếu chủ kho chọn khác |
| P1 | evals | E3 đòi đọc chuyenDuoc trên bảng cho cả năm người và năm trạng thái, nhưng thành viên khác, quản trị và việc Huỷ không bao giờ lên bảng | Mã đúng mà E3 đỏ, hoặc người viết test lặng lẽ bỏ hàng | 12 hàng viết sẵn, assert số hàng = 12 | fixed: AC-3 và E3 đổi thành 12 hàng (giao/toi-giao, thucHien/giao-cho-toi, theoDoi/dang-theo-doi × bốn trạng thái có cột) kèm lời ghim thiếu hàng |
| P1 | design | Design nói thẻ không đích thì mất tay kéo và menu, AC-4 lại đòi nhấc được và nút khoá; không eval nào đo app có truyền canDrop vào Board; vế «375 menu đổi được trạng thái» không có eval | Quên truyền canDrop thì E4, E4b vẫn xanh mà lệnh tới máy chủ và nhận 403 | E4b thêm ca kéo phím sang cột cấm gọi 0 lần; E15 cặp phá; E11 bước menu ở 375 | fixed: design sửa cho khớp AC-4 (chỉ nhóm Đang theo dõi mất tay kéo), E4b thêm ca canDrop có đối chứng dương, E15 cặp (m), E11 bước menu ở 375 |
| P2 | contract | Design hứa ba đường hỏi lại khi đóng cha còn con mở; AC-9 chỉ đo đường thả và nút Huỷ | Chọn «Đánh dấu xong» trong menu ở điện thoại đóng cha không hỏi, mọi eval xanh | AC-9, E9b thêm hai đường | fixed: AC-9 thêm vế menu và nút Xong trong khung, E9b thêm hai ca có lời ghim riêng và đối chứng |
