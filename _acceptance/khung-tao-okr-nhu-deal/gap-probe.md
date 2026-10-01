---
slug: khung-tao-okr-nhu-deal
at: 2026-09-30T01:25:16Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Chiều đỏ của E18 chỉ soi chốt E9 của hop-thoai-giu-cho-dang-nhap; chốt thay chữ của khep-ky-okr E3, E7 và hop-thoai-giu E7 không được soi còn đổi được tệp không | S3 thêm một lớp bọc làm form thụt sâu một nấc, chuỗi thay của khep-ky-okr không còn khớp, chốt đỏ im lặng; E18 vẫn xanh | Danh sách viết trước mọi chốt thay chữ trong bốn hồ sơ; mỗi chốt chép, thay, khẳng định bản sao khác bản gốc; chiều đỏ riêng cho khep-ky-okr | fixed: E18 mang danh sách viết trước, rút chuỗi tìm từ chính script của hồ sơ, in số chốt, chiều đỏ ghim cho khep-ky-okr E3 và hop-thoai-giu E9 |
| P1 | evals | «Không tràn ngang» đo bằng scrollWidth của trang; ngăn fixed và trang khoá cuộn nên phép đo không thể đỏ | Ở 390 một hàng hai ô rộng hơn ngăn, nội dung bị cắt trong ngăn mà trang vẫn scrollWidth == innerWidth; E3 xanh | Đo trên chính ngăn: sheet-content, sheet-body scrollWidth ≤ clientWidth, mọi con right ≤ right ngăn; chiều đỏ chèn phần tử 600 px | fixed: AC-3, AC-5 đổi thành «không nội dung nào tràn ra khỏi ngăn»; E3 đo trong ngăn cho năm ngăn thường và hai ngăn rộng ở bốn khổ, chiều đỏ 'tran ngang: <ngăn>' |
| P1 | contract | URL là đường vào mới; không AC nào nói người không sửa được mở URL có khoá thì sao | Người phòng khác nhận link hopOkr=muc-tieu, ngăn Sửa mở với ô sửa được; E1, E2 xanh vì chỉ dựng người có quyền | Thêm vế quyền vào AC-1, AC-2; ma trận khoá × người không quyền, đối chứng dương | fixed: AC-1, AC-2 thêm vế; Coverage thêm trục E «người mở»; E1 thêm ca new=true không quyền, E2 thêm ma trận ba khoá × không quyền, hai chiều đỏ 'mo ngan khong quyen' |
| P1 | evals | E4 rút danh sách lúc chạy với sàn ≥ 14; chân dựng nút qua nhánh điều kiện bị bỏ qua im | Chân SSO dựng nút qua điều kiện, AST bỏ qua, nút chính vẫn trước «Huỷ»; tổng vẫn ≥ 14 nên E4 xanh | Danh sách viết trước các tệp của AC-4; mỗi tệp đúng một chân; chân ngoài danh sách in tên | fixed: E4 mang danh sách mười hai tệp, trải fragment và nhánh điều kiện, in số khẳng định 12, in tên mọi chân ngoài danh sách; AC-4 ghi rõ mười hai chân |
| P2 | evals | inputs của E20 thiếu ảnh ngăn Tạo mục tiêu và Thêm KR | Ngăn Tạo mục tiêu ở 390 lệch đầu mà người chấm không thấy ảnh, hoặc ra UNCERTAIN vì expected đòi năm ngăn | Đủ mười ảnh năm ngăn × hai khổ cộng hai ảnh ngăn rộng; ghim tên ảnh trong bước E3 | fixed: E20 inputs có mười hai ảnh; bước E3 ghim tên năm ngăn |
