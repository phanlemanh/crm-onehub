---
slug: so-okr-tu-chay
at: 2026-09-26T14:20:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Thước 50% đếm mọi KR có cấu hình nguồn CRM, gộp cả KR đo cạnh vẫn gõ tay; KR quý 4 công bố từ 26/10 trước khi lượt lên nên chỉ gắn được theo kiểu đo cạnh | Ngày 01/12 câu đếm trả 60% và ghi SỐNG trong khi khối kinh doanh vẫn đếm tay mỗi thứ Hai — thước đo sai câu hỏi «có thôi đếm tay không» | Câu đếm trả cột hiệu lực và cột đo cạnh tách riêng; E21 khẳng định hai số; chiều đỏ là gộp | fixed: câu đếm ba cột (hiệu lực, đo cạnh, tỷ lệ lần cập nhật tuần nhận số máy); KR đo cạnh trong cập nhật tuần điền sẵn số máy (AC-11); Đường đo thêm thước «thôi đếm tay»; E19, E21 cập nhật |
| P1 | design | Chưa ghim banGhiChiSo(ngay) tính lại theo định nghĩa chép trong dòng chụp hay theo cấu hình hiện tại; E10 gieo bản chụp không nói qua chupSoOkr thật [tra-loi-tin-nhac#F1] | Đổi phạm vi KR nháp sau khi chụp → cờ lệch bật dù dữ liệu không đổi, danh sách thuộc phạm vi khác tiêu đề; fixture viết tay đúng khuôn bên đọc che lệch khuôn bên ghi | Design ghim bản chép trong dòng chụp; E10 tạo bản chụp bằng chupSoOkr thật, ca đổi phạm vi sau chụp, chiều đỏ đọc cấu hình hiện tại | fixed: design mục 8, AC-6 thêm vế, E10 thêm ca và chiều đỏ |
| P1 | evals | E8 chỉ soi lời gọi Prisma; E25 không ghim ON DELETE của khoá ngoại bản chụp | Khoá ngoại CASCADE hay SQL thô xoá lịch sử mà E8 vẫn xanh | E25 khẳng định RESTRICT, chiều đỏ tệp CASCADE; E8 soi thêm SQL thô | fixed: design mục 3 ghim RESTRICT; AC-4 thêm vế; E8, E25 cập nhật (removeKeyResult đã từ chối KR có bản chụp ở E5, mục tiêu không có đường xoá) |
| P1 | evals | E7 so với trần do người làm tự đặt; đọc Sheets trong nhịp không có trần mỗi nhịp | tranMs đặt 10 phút, E7 xanh; Google chậm làm nhịp dispatch vượt trần, nhắc buổi sáng bị trễ | Con số viết sẵn trong expected; bộ trộn có Sheets treo; chiều đỏ không trần mỗi nhịp | fixed: AC-4 ghim 20 giây cho 200 KR và 60 giây cho bộ trộn Sheets treo; design mục 5 thêm trần đọc mỗi nhịp; E7 phần (b) |
| P2 | contract | ghiSoKr ngày ngoài kỳ không có ca; AC-11 chỉ đo KR crm; E5 ghi «cả ba pha» mà liệt hai | Máy ngoài đẩy số sau ngày cuối kỳ khi pha chưa chuyển; cập nhật tuần ghi đè số API | Thêm ca ngoài kỳ vào E15; thêm KR api vào E18; sửa E5 | fixed: AC-9 và E15 thêm ca; AC-11 và E18 thêm KR api và KR đo cạnh; E5 liệt đúng pha |
