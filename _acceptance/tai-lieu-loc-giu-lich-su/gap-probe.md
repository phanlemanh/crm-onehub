---
slug: tai-lieu-loc-giu-lich-su
at: 2026-10-15T07:35:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ «giữ danh sách cũ trong lúc chờ» ghi máy quyết (một lối) nhưng lối khác — thanh lọc đứng yên, vùng danh sách thành khung xương — cũng sửa trọn Ngoài-4; chọn giữa hai lối là việc của người. | Chủ kho không thấy đánh đổi ở Cổng Phạm vi; AC-2 khoá «danh sách cũ còn hiện» mà chưa ai chọn. | Đổi dòng sổ sang câu hỏi có khuyến nghị và lối khác | fixed: dòng d-…-6 thay d-…-2 thành Hỏi-2 (khuyên giữ danh sách cũ mờ đi, lối khác khung xương trong vùng danh sách); design phương án 2 nêu cả hai lối |
| P1 | contract | Design hứa danh sách cũ mờ đi trong lúc chờ nhưng AC-2 chỉ đòi aria-busy, tín hiệu chỉ trình đọc màn hình nghe được. | Bản làm chỉ thêm aria-busy, người nhìn không biết đang tải; E2, E4 vẫn đạt. | Vế tín hiệu nhìn thấy được, E4 đo khi chờ có đối chứng | fixed: AC-2 thêm vùng danh sách mờ đi (data-dang-tai); E2 kiểm data-dang-tai có khi chờ, không có trước và sau; E4 bước 2 đo opacity < 1 khi chờ, = 1 trước và sau |
| P1 | contract | Ô «đổi lọc khi đã có dữ liệu × lỗi» không có AC, mà đây đúng đường placeholderData làm thay đổi. | Đổi lọc mà lỗi thì danh sách cũ treo mãi hoặc khung xương thay khung lỗi, không có nút thử lại; E2, E3 vẫn đạt. | AC mới và eval hai ô có chiều đỏ | fixed: thêm AC-5 và E5 (Trang chọn loại, Chờ duyệt đổi nhóm × lỗi), chiều đỏ «trang doi loc loi treo danh sach cu» |
| P1 | evals | Bước 2 của E4 là khẳng định âm tính không có đối chứng dương cho cửa sổ chờ; mẫu chặn có thể trượt. | Chặn trượt, truy vấn về ngay, số lần gỡ bằng 0, E4 vẫn đạt mà chưa quan sát lúc chờ. | Đếm request bị chặn ≥ 1, đọc aria-busy trước khi thả, chiều đỏ tắt độ trễ | fixed: E4 bước 2 đếm request taiLieu.list bị chặn ≥ 1 với ghim «khong chan duoc taiLieu.list», đọc aria-busy và opacity trước khi thả; thêm chiều đỏ (3) bản sao bàn đo bỏ độ trễ; E4m thành 3/3 |
| P2 | contract | AC-4 cần đổi đơn vị nhưng bước gieo không tạo đơn vị. | Kho đo trống đơn vị, bước chọn đơn vị không đổi đường dẫn, E4 đỏ vì môi trường. | Gieo hai đơn vị và khẳng định donVi có trên đường dẫn | fixed: AC-4 Given thêm hai đơn vị có trang; E4 gieo đơn vị qua org.createDivision và org.createDepartment, khẳng định khoá donVi có trên đường dẫn trước khi lùi |
