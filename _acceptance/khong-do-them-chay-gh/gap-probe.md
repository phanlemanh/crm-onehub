---
slug: khong-do-them-chay-gh
at: 2026-10-19T13:50:30Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | AC-3/E3 so mã thoát của bản merge-base với cây gốc đứng ở HEAD; Given không đòi PR mở; chuỗi âm «nhanh HEAD khong co PR mo» không do lần phá nào sinh ra | Lệnh phụ thuộc workflow ở sha nên bản merge-base ra mã khác mà hàm đúng (đỏ giả); hoặc chưa có PR, cả ba nơi cùng thoát 2 và E3 xanh rỗng | Tiền đề hai lệnh thoát 0 ở cây gốc; bản merge-base chỉ đòi lệnh chạy thật; thêm lần phá bản tách mang origin GitHub để ghim chuỗi | fixed: AC-3 và E3 viết lại — tiền đề cây gốc thoát 0 (không thì mã 2), bản HEAD đòi 0, bản merge-base đòi 0 hoặc 1 và không dòng «MA 2:», thêm ca phá (b) bản tách có origin ghim «MA 2: nhanh HEAD khong co PR mo» |
| P1 | evals | E6 có bốn lần gỡ nhưng chỉ phủ ba trên bốn bảo đảm; ca «bẩn ở tệp khác» không có lần gỡ | Mảnh giữ ca «tệp khác» hồi quy mà E6 vẫn xanh | Ma trận bốn bảo đảm viết trước, mỗi bảo đảm ít nhất một dòng BAT | fixed: E6 thêm lần gỡ (e) bỏ cả dựng lại lẫn --force ở checkout làm B2 đỏ; ma trận B1–B4 viết trước, thiếu chiều đỏ thì mã 1; AC-6 nói rõ mỗi bảo đảm có ít nhất một lần gỡ |
| P2 | evals | E5 chỉ đo chữ dòng «chay:», không đo quan hệ với tập thật sự chạy; «trước khi dựng bản» không quan sát được ở --chi-rut | Bàn in «chay:» đúng mà lặp trên biến khác; hoặc khoá sai vẫn dựng hai bản rồi mới thoát 2 | E4 đối chiếu tập trên dòng kết quả với «chay:»; E5 thêm ô chế độ đầy đủ với khoá sai | fixed: E4 đòi tập khoá trên các dòng kết quả bằng tập «chay:» và «chay:» đứng trước «neo:»; E5 thêm ô thứ năm chạy đầy đủ với khoá sai, đòi mã 2, không «neo:», không thư mục tạm «cgdp-kdt-» mới |
| P2 | evals | Tiền đề E4 chỉ kiểm có PR mở, không kiểm lượt nháp đã xong | Lượt nháp còn chạy, gpct_luot_that đỏ cả hai cây, in «do san» trùng dấu hiệu lỗi chưa sửa | Tiền đề lượt của sha đầu PR đã xong, chưa thì mã 2 | fixed: E4 thêm tiền đề mọi lượt pull_request của sha đầu PR đã completed, không thì mã 2 «luot nhap chua xong» |
| P2 | design | d-1 khai nguồn mục-tiêu mà câu trích chỉ tả nguyên nhân; d-6 trích hành vi E11 không quyết việc thu hẹp lời hứa; dòng feature hứa không điều kiện | Người duyệt tưởng chủ kho đã chọn chỗ sửa, tưởng mọi lượt chạy đều được phủ | Dòng sổ thay d-1 nguồn một-lối; làm rõ điều kiện «có PR mở» | fixed: d-11 thay d-1 (một-lối: sửa lệnh không chữa bàn cho các lệnh cần gh khác); d-12 thay d-6 (bàn không thể chạy thật hơn cây gốc); Context của hợp đồng định nghĩa «chạy thật» = như ở cây gốc, kể cả ca không có PR mở |
