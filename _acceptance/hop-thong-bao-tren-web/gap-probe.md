---
slug: hop-thong-bao-tren-web
at: 2026-10-14T03:06:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Lệnh đối chiếu lấy «mục đã tính» từ chính danh sách mục đã ghi thành thông báo — so cái đã ghi với chính nó; không ca nào ghi thông báo hỏng | Ghi thông báo hỏng cho người không kênh: danh sách rỗng, lệnh in 0 mục mất, Cổng Giá trị đọc là SỐNG đúng lúc đang CHẾT | Lượt nhắc ghi danh sách mục đã tính trước và độc lập; E12 thêm ca tiêm lỗi ghi và ca lượt thiếu danh sách | fixed: AC-1, AC-12, design «Đường ghi» bước 1 (`payload.mucTinh`), E1 ô 3 + chiều đỏ, E12 ca 6 và 7 + chiều đỏ |
| P1 | evals | Bản chụp tin Zalo/Slack của E3 không neo vào mã trước vòng và chỉ phủ bộ mục gieo | Tách hàm đường dẫn làm đổi đường một loại; chụp lại từ mã đã sửa nên E3 và E10 cùng xanh | Bản chụp sinh từ 762acca38, commit trước mọi sửa tệp nhắc, kiểm bằng git; ma trận đủ mọi loại | fixed: E3 ô 2 (tệp chụp, kiểm tổ tiên bằng git, ma trận THU_TU_NHAC) + chiều đỏ; design ghi thứ tự thi công |
| P1 | evals | E2 đo luật gộp trên một mục; mục gộp (tài liệu chờ, cập nhật tuần) dễ lệch mã nhất | Mã mục gộp mang số đếm → mỗi sáng một thông báo mới; hoặc giữ một thông báo mà số cũ | Ma trận mọi loại hai sáng liền; ca mục gộp đổi số | fixed: AC-2 thêm cập nhật nội dung và «mọi loại»; design luật `khoa` không mang số đếm; E2 ô f, g + hai chiều đỏ |
| P2 | evals | AC-4 «số mới trong 60 giây» chỉ đo bằng đọc cấu hình; không đo vùng đọc màn | Chuông dùng truy vấn khác cấu hình, số cũ tới khi tải lại | Đồng hồ giả, đổi mock, thấy số mới; quay lại thẻ; vùng aria-live | fixed: AC-4 thêm «trình đọc màn được báo»; E4 ca «hoi-lai» + chiều đỏ |
| P2 | evals | E11 gọi hàm dọn trần; không phủ tệp nối vào lượt quét | Hàm dọn đúng nhưng không nối vào lịch nên production không dọn | Gọi qua lối vào của lịch quét; thêm tệp lịch vào paths | fixed: AC-11 «lượt dọn định kỳ có sẵn», E11 gọi qua lối vào lịch, thêm paths + chiều đỏ |
