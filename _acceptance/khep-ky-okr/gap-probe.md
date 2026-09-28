---
slug: khep-ky-okr
at: 2026-09-27T09:52:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Điểm gợi ý nói ba cách ở ba tệp: «phần trăm» là giá trị / đích (hồ sơ cơ hội), số chốt / 100 (bảng thiết kế), hay `tienDoKr`; làm tròn «gần nhất» (sổ) hay «lên lưới» (Coverage); E8 hứa 18 ô mà chỉ ghi 5, mốc không có ba ca [tien-te-chua-tai-khong-doan#F1] | Người làm chọn công thức riêng rồi tự viết 13 ô cho khớp, E8 vẫn xanh; ô chốt 78 cho 0,9 dù làm tròn lên hay xuống nên chiều đỏ không đỏ | Chốt một câu chung; chép đủ ô vào E8; thêm ô chốt 84, 85, 86 và phần trăm 20 → 80 chốt 80 | fixed: thiết kế mục 4, hồ sơ cơ hội giả định 2, Coverage của hợp đồng cùng một câu (hàm tiến độ, nửa bậc làm tròn lên; phần trăm = số chốt / 100); E8 ghi đủ 20 ô; chiều đỏ đổi sang ô 84, 86 và phần trăm chốt 80 |
| P1 | design | Điểm mục tiêu «tính khi đọc» không nói đọc theo cấu hình nào khi kỳ đã đóng | Quản trị bật trọng số cho quý 1, điểm quý 4 trong bảng chấm và CSV tự đổi | E12 đổi cấu hình sau khi đóng rồi xuất lại, so từng byte | fixed: thiết kế mục 4 «kỳ đã chấm đọc theo phiên bản đã chép»; AC-6, AC-9 thêm vế; E12 thêm ca và chiều đỏ |
| P1 | contract | Thang 0–100 không đo từ đầu tới cuối: không nói `chamKr` nhận 80 hay 0,8 | Màn gửi 80, máy chủ từ chối ngoài lưới hoặc lưu 8000%; quý 4 không đóng được | E9 lặp ma trận chấm trên thang 0–100 | fixed: thiết kế mục 4 «đơn vị của điểm»; AC-6 lặp trên thang 0–100; E9 thêm ca 80, 85, 0,8 và chiều đỏ; E12 ghim ô 80 |
| P2 | design | Luật sang chấm từ 00:00 ngày sau ngày cuối không bảo đảm bản chụp ngày cuối đã ghi | Quản trị sang chấm 00:02 hoặc nhịp chụp hỏng; KR nguồn CRM chốt ở số ngày áp cuối, không bao giờ sửa | E8 thêm ca 00:02 chưa có bản chụp | fixed: thiết kế mục 3 gác thêm «mọi KR nguồn CRM đã có bản chụp ngày cuối» (nguồn API, Sheets không gác); AC-5 và E8 thêm ca và chiều đỏ |
| P2 | contract | Ngưỡng chết «chấm trên bảng tính rồi gõ lại» không có đường đo | Pha đóng, 100% có điểm, nhưng mỗi đơn vị do một người gõ lại trong năm phút | Thêm cột vào câu đếm, gieo hai kiểu chấm | fixed: cột `chamDon` trong `rang/khep-ky.sql` + câu hỏi ở phiên nghiệm thu; mục Đường đo, AC-13, E17 cập nhật |
