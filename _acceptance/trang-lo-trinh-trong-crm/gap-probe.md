---
slug: trang-lo-trinh-trong-crm
at: 2026-10-08T17:40:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E8 chưa chứng bản dựng tự mang tệp: dòng 2 chấp nhận đọc từ gốc kho, không eval nào chạy trang từ bản dựng không có gốc kho bên cạnh | Hàm đọc tìm tệp theo thư mục chạy cộng ../../; máy cục bộ xanh hết, trên Vercel trang rơi vào khung «không đọc được», khung khoan dung che lỗi | Dòng 3 cho E8: chép đúng các tệp đường mang theo sang thư mục tạm không có gốc kho, hàm đọc vẫn ra khối; chiều đỏ bản sao đọc theo gốc kho | fixed: AC-8 viết lại theo thư mục chỉ gồm tệp đường mang theo; E8 thêm dòng 3 và chiều đỏ ghim «trang doc tep ngoai ban dung» |
| P1 | contract | AC-5 bắt khung trống kèm câu của bộ đọc, AC-11 cấm người xem gặp chữ nội bộ; E11 không thấy câu bộ đọc sinh ra | Câu máy hiện trước trưởng phòng ban, E11 vẫn PASS vì inputs không chứa câu đó | Hướng (a): câu máy vào phần gập dành cho đội sản phẩm, AC-11 khai ngoài phạm vi | fixed: AC-5, AC-11, thiết kế và bản mẫu đặt câu máy trong phần gập «Chi tiết cho đội sản phẩm»; E5 kiểm câu máy chỉ nằm trong phần gập |
| P1 | contract | Trục «thiếu khoá» không có vế AC; E5 chỉ đòi 0 việc; thiết kế nói khuôn không khớp là lỗi có tên | Cài lặng lẽ thay mảng thiếu bằng rỗng, thẻ hiện 0 việc không một câu | Thêm vế thiếu khoá vào AC-5 với khung lỗi mang đường khoá | fixed (một phần, có lý do): đặc tả khối của kit quy định khoá thiếu là rỗng theo kiểu và docDuLieu tự điền — trang tuân đặc tả; tách thêm ca «sai kiểu» thành khung lỗi mang đường khoá (AC-5, E5 dòng mới, chiều đỏ «sai kieu bi nuot thanh rong»); thiết kế ghi rõ hai ca |
| P1 | evals | AC-3 hứa điều thấy trên màn nhưng E3 chỉ thử hàm thuần | Thành phần tự lấy ngày UTC hoặc xếp khung trễ sai thứ tự, E3 vẫn xanh | describe «ngay» trong lo-trinh.dom.tsx với đồng hồ giả 00:30 giờ Việt Nam | fixed: E3 thêm dòng 5–7 (dấu đã qua trên màn, thứ tự khung trễ, lần render máy chủ không có phần phụ thuộc ngày); lệnh ltc_ngay chạy thêm phần DOM |
| P2 | contract | Vế CHẾT «trạng thái khác LO-TRINH.html mà không ai biết» không có dòng Đường đo | Cổng Giá trị không có số cho ô CHẾT thứ hai | Một dòng Đường đo trỏ E1 và E8 | fixed: Đường đo thêm thước trang khớp LO-TRINH.html, số từ E1 và E8 chạy lại ở mỗi lượt ghim lại, bảo đảm bởi AC-1, AC-8 |
