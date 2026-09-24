---
slug: to-chuc-danh-sach-chi-tiet
at: 2026-09-24T15:13:41Z
verdict: findings
p0: 0
p1: 5
p2: 0
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-1 hứa tải lại trang mở đúng nút, nhưng E1 chỉ đo chiều bấm cây rồi ghi địa chỉ; chiều mở từ `?don=` hợp lệ không được đo, ba giá trị hỏng là khẳng định âm tính không đối chứng | Nút đang chọn giữ trong trạng thái cục bộ; tải lại luôn ra gốc mà E1 vẫn xanh | Dựng mới từ địa chỉ trang: 4 loại nút × 2 khẳng định + 1 lần `?loc=`; chiều đỏ bản `useState` | fixed: E1 thêm 9 khẳng định dựng từ địa chỉ và chiều đỏ thứ hai |
| P1 | contract | AC-8 không viết ra ba câu lỗi mới; E14 chỉ đo ba câu khác nhau, không đo câu đúng với cột | Tráo hằng số hoặc câu vô nghĩa vẫn khác nhau từng đôi, vấp #6 còn nguyên | Ghi ba câu nguyên văn vào AC-8; E14 so chuỗi nguyên văn từng dòng; E13 đo bước 2 hiện đúng câu | fixed: AC-8 ghi ba câu nguyên văn; E14 so chuỗi nguyên văn, chiều đỏ tráo hằng số; E13 thêm 3 khẳng định |
| P1 | evals | E20 chỉ đo tên bài và màu xanh, không đo nội dung khẳng định của bài đã dời, không đo hồ sơ đã ghim | Bài dời giữ tên nhưng bỏ bớt expect; E20 vẫn xanh | So số expect từng bài base_commit với HEAD, tập chuỗi ghim chỉ mất câu gộp cũ, run-log có dòng repin mới | fixed: E20 thêm ba phép so và chiều đỏ xoá một expect |
| P1 | evals | E16, E18, E21 tuyên quét cả lớp nhưng danh sách viết trước chỉ một phần | Nút «Xếp phòng ban» bấm được ở vai chỉ đọc, hộp gắn báo lỗi bằng toast, nút cây dùng thẻ trần có className — cả ba vẫn xanh | Ma trận toàn phần theo bảng năm loại nút; đủ hộp thoại và thủ tục ghi; quét mọi phần tử JSX | fixed: E16 ma trận 6 vùng; E18 13 thủ tục ghi và 5 hộp thoại; E21 quét mọi thành phần |
| P1 | evals | Không bài nào ghi thật qua trình duyệt rồi tải lại; fixture E7 thiếu người giữ phòng ban làm phòng ban phụ | Kéo bằng chuột hỏng trên Chrome mà E8 xanh; hộp thêm người loại nhầm người phụ mà E6, E7 xanh | E17 thêm bốn việc ghi thật rồi tải lại; E7 thêm người phụ | fixed: E17 thêm 4 khẳng định ghi thật, KY_MONG 36; E7 thêm ca người phụ và chiều đỏ |
