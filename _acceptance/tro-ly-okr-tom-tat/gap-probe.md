---
slug: tro-ly-okr-tom-tat
at: 2026-09-30T14:25:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals (E7), contract (AC-5) | Thiết kế hứa kiểm lại số lúc hiện nhưng AC-5 và E7 chỉ đo lọc quyền và mất KR; không ca nào sửa giá trị hay xoá riêng lần cập nhật được dẫn | Giá trị lần cập nhật đổi sau khi ghi; câu mang số cũ vẫn hiện trong khi thẻ trích dẫn hiện số mới; E7 vẫn xanh | Hai ca: sửa value nguồn câu 1 thì câu 1 vắng; xoá riêng lần cập nhật nguồn câu 4 thì câu 4 vắng; chiều đỏ 'so cu lot: cau 1' | fixed: AC-5 thêm vế «giá trị trong kho đã khác số trong câu»; E7 thêm hai ca và chiều đỏ |
| P1 | contract (Đường đo), evals (E15, E17) | Thước số lệch lọt qua chưa định nghĩa tập tham chiếu; thiếu đối chứng dương cho các dạng số hợp lệ | Câu đúng «tiến độ 60%» bị thước độc lập đếm là lệch, E17 đỏ oan và chế độ ẩn báo CHẾT giả; hoặc thước chép luật bộ kiểm mà vẫn qua kiểm «không import» | Ghi rõ tập tham chiếu; gieo câu lành chứa mỗi dạng số hợp lệ phải báo 0 | fixed: Đường đo và AC-12 ghi tập tham chiếu tính lại từ kho; E15 thêm đối chứng dương từng dạng và chiều đỏ 'lech gia: tien-do' |
| P1 | contract (AC-6), evals (E7, E8) | Ba trạng thái đang soạn, chưa cập nhật, lọc hết phụ thuộc tín hiệu API nhưng chỉ đo ở màn với tRPC giả | API trả null khi lọc hết hay không đặt đang soạn khi việc chưa xả; khối biến mất thay cho chữ đúng; E8 vẫn xanh | Ô API cho việc chờ xả, đang chạy, tuần không cập nhật, lọc hết trả bản rỗng khác null | fixed: AC-6 thêm vế API và nhãn (cross-layer); thêm E22 lớp máy chủ với hai chiều đỏ |
| P1 | contract (Đường đo, AC-9), evals (E9, E12, E15) | Thước mở-sau-nhắc đọc vết mo-hop-tuan nhưng không AC nào đòi ứng dụng ghi vết khi mở từ dòng báo; không ghim đích đường mở; E15 gieo vết theo khuôn bên đọc | Đường mở trỏ trang OKR chung, hay vết thiếu phòng; mo-sau-nhac luôn 0%, Cổng Giá trị đọc CHẾT giả; E12, E15 vẫn xanh | E9 mở từ đường của dòng báo và kiểm đúng một vết; E15 gieo vết bằng thủ tục thật; E12 ghim tham số đường mở | fixed: AC-9 ghim đường mở; E9 thêm bước; E12 so từng tham số; E15 chuyển thành bài API gieo qua OkrXemService.moHopTuan và các hàm ghi thật |
| P2 | contract (Coverage trục C), evals (E4) | Ghi chú trộn Anh–Việt không AC nào nhận; bảng số khó chỉ dạng Việt | «closed 1,200 leads» bị đọc thành 1,2; câu đúng bị bỏ hay câu lệch lọt | Ca số kiểu Anh 1.5; 1,200; 3k; 12.5% mỗi dạng khớp và lệch | fixed: AC-3 và E4 thêm nhóm số kiểu Anh; Coverage trục C trỏ AC-3 |
