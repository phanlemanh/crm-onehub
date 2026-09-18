---
slug: cho-phep-ai-vao-o-man-hinh
at: 2026-09-16T02:24:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — cho-phep-ai-vao-o-man-hinh

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract | Trục vòng đời khai nấc *cho phép lại* nhưng không AC nào phủ; AC-11 lại ra luật chặn đúng ca đó, nên hai chỗ trong cùng hợp đồng đánh nhau | Quản gỡ một người (AC-5 chuyển dòng sang `cancelled`), tuần sau muốn nhận lại. Thủ tục cho phép thấy đã có dòng cùng địa chỉ nên từ chối; không đường nào mở lại ngoài sửa tay cơ sở dữ liệu. E10 vẫn xanh vì nó khớp đúng khuôn đã viết | Thêm AC cho nấc cho phép lại, ba ca khác kết quả trong một lượt; ba ca cùng kết quả thì mã 2 | fixed: thêm AC-14 và E16, sửa AC-11 nói rõ chỉ áp cho lời còn hiệu lực, thêm executor `cp_cho_phep_lai` |
| P0 | evals | Bảng tám dòng của E1 không có dòng âm nào nằm trong đường mồi, và chỉ thử biến mồi dạng domain, trong khi giá trị chạy thật là dạng địa chỉ đích danh. Tám dòng không phân biệt được «đọc đúng nội dung biến mồi» với «biến mồi khác rỗng thì cho tất cả» | Hàm thuần cài kiểu «bảng rỗng và chưa ai và mồi khác rỗng thì cho qua», bỏ qua việc so địa chỉ. Tám trên tám xanh, S4 xanh, Cổng 2 ký. Bản cài mới đầu tiên mở cửa cho mọi địa chỉ chạm vào callback — đúng lớp lỗi mà mục Vì sao dựng ra vòng này để vá | Nâng bảng và đổi chân đếm; thêm ca domain-nhưng-địa-chỉ-ngoài và ca mồi-đích-danh hai chiều; đột biến «mồi khác rỗng thì có» phải đỏ | fixed: E1 lên mười một dòng, thêm dòng 4, 5, 6, thêm luật 2 và một ca đột biến chứng minh |
| P1 | evals | Vế mặt người của E9 không có đường nào ở `apps/app` trong `paths`, và assert âm «không so chuỗi vai tại chỗ» không có đối chứng dương neo vào tệp cụ thể | Quét AST chỉ chạy trên ba đường API nên không gặp mã giao diện, không tìm thấy gì, thoát 0, vế mặt người xanh khống trong khi nút Gỡ vẫn hiện với vai `member`. Chiều kia: người cài nhập `@crm/auth` thẳng vào component `"use client"` và `bun run build` đỏ ở dns | Khai đích danh tệp máy chủ tính cờ và đưa vào `paths`; ba khẳng định AST gồm cả vế cấm client nhập gói máy chủ | fixed: E9 thêm đường `settings/members/**`, ba khẳng định AST, đột biến chứng minh |
| P1 | evals | Không eval nào khép vòng từ nơi giá trị sinh ra tới nơi cổng vào đọc nó; mọi lời cho phép trong E1–E7 là đồ viết tay đúng khuôn bên đọc. Cùng lớp với bài học đã có ở kho `[do-quyen-luot-bang-hanh-vi#F1]` | Thủ tục cho phép lưu vai dạng chữ hoa hoặc địa chỉ chưa hạ chữ thường, còn hàm thuần so chữ thường. Người được cho phép qua màn hình thật vẫn bị chặn ở lượt đăng nhập đầu, mà E1 xanh, E2 xanh vì hàng của nó do test tự cắm đúng khuôn, E10 xanh vì chỉ nhìn bên ghi | Ghim rằng hàng lời cho phép phải do chính thủ tục tạo ra, đọc lại từ DB rồi mới đưa vào hàm thuần; đột biến ở bên ghi phải làm E2 đỏ | fixed: E2 và E3 thêm điều khoản khép vòng ghi–đọc, khẳng định danh tính, và chiều đỏ thứ hai |
| P1 | design, evals | E12, E13, E15 ăn khung hình ở `evidence/` nhưng không nói khung hình do đâu sinh ra, chạy cây nào, cổng nào. Design còn khẳng định làn design «đã wire», trái với sổ quyết định | Tới S4 không ai dựng ứng dụng nên `evidence/` rỗng, AC-6 mất eval duy nhất. Nặng hơn: có người dựng nhưng chân design đọc mặc định cổng 3000, chụp bản dev ở checkout chính, nên khung hình màn Members CŨ đi vào hồ sơ như bằng chứng của cây đang xét | Khai đường sinh khung hình trong cả ba eval; khẳng định danh tính trước khi tin màu; thiếu tệp thì mã 2 chứ không im lặng UNCERTAIN | fixed: E12, E13, E15 khai đường sinh và khẳng định danh tính; design sửa lại câu về làn design cho khớp sổ |
