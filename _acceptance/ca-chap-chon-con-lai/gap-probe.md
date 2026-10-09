---
slug: ca-chap-chon-con-lai
at: 2026-10-08T22:50:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract | goiKiemTu hứa «không còn phụ thuộc giờ đồng hồ» nhưng còn nguồn chữ số thứ hai: id cuid trong JSON của gói không được gỡ trước khi trích số (đo lại: lớp 1 và phần còn lại của lớp 2a, không phải lớp 3 như bản nháp ghi). | Sau gộp, một id có «26» đứng riêng trong phần ngẫu nhiên → trichSo bắt 26 → bài đỏ «so cap nhat tuan khong in lot» dù ma() đã sạch; Cổng 1 duyệt chữ «tất định» cho một ca còn chập chờn. | Thêm cặp phá gán id chứa «26» vào gói thật; Cổng 1 chọn kéo idCuaGoi vào phạm vi hay hạ lời hứa. | human-gate1: thêm AC-7 + E8 (đề xuất, gỡ mọi giá trị id khỏi chữ gói trước khi trích số — goi-soan.ts) và cặp (f); Cổng 1 giữ hay bỏ AC-7 |
| P1 | design | Kiểm EXPLAIN trước probe chỉ xem chuỗi kế hoạch; khe giữa EXPLAIN và probe, hoặc Materialize trên subquery phía trong, làm phép kiểm lọt hay hằng đúng; chỗ chèn ANALYZE của cặp (a)(b) mơ hồ. | Đột biến chèn ANALYZE sau EXPLAIN → đỏ «Expected length: 3» chứ không phải «ke hoach doi» → E2 exit 1; trên CI một autoanalyze rơi vào khe đó cho lại lỗi vô danh. | Đọc thống kê và EXPLAIN SAU probe khi số hàng lệch; ghim chỗ chèn của từng cặp. | fixed: design và AC-2 chuyển sang kiểm sau probe (lệch rows → «ke hoach doi» kèm EXPLAIN và thống kê đọc sau probe); E2 ghim (a) chèn ngay trước lời gọi probe, (b) chèn ngay sau staleStatistics |
| P1 | design | afterAll dùng RESET trong khi AC-1 hứa trả đúng giá trị trước khối; bài bị giết để lại false trên crm_test; E2 không nói kho nào. | Cặp (d) để lại false trên kho chung → lượt kế lưu false trước khối, RESET đưa về null → «autovacuum khong duoc tra lai» → E2 exit 1. | Đặt lại đúng giá trị đã lưu; ô điều kiện đầu đã-tắt-từ-trước; mỗi bên chạy kho riêng. | fixed: design afterAll đặt lại giá trị đã lưu (RESET chỉ khi trước khối không có khoá); AC-1 và E1 thêm ô «da tat tu truoc»; E2 ghi mỗi bên chạy qua bun run test -- (kho riêng) |
| P1 | design | Nguồn đảo kế hoạch thứ hai không cần ANALYZE: planner nội suy theo số trang hiện tại; ba trường in ra không phân biệt được. | CI đỏ «ke hoach doi» với hai mốc analyze đứng yên, không ai đọc ra nguyên nhân — đúng điều kiện CHẾT ở opportunity.md. | In thêm relpages, số trang hiện tại, n_dead_tup; hạ câu autovacuum thành một trong hai giả thuyết. | fixed: design nêu hai giả thuyết và trường phân biệt; AC-2 và E2 (a) đòi thêm relpages=, so_trang=, n_dead_tup= |
| P2 | evals | E6 đòi gieo.ts đúng một dòng bỏ, một dòng thêm bắt đầu «export const ma =» — mã hoá cơ số 26 gần chắc cần hàm phụ hoặc bị bộ định dạng bẻ dòng. | Thợ viết đúng design, formatter bẻ khai báo → E6 đỏ dù diff chỉ chạm ma(). | Chỉ chặn dòng bỏ ngoài khai báo ma; đối chứng một dòng đổi ở TIEN_TO. | fixed: AC-6 và E6 cho phép khai báo ma và hàm mã hoá chỉ ma dùng; chặn bỏ dòng TIEN_TO và export khác; đối chứng «gieo.ts: doi ngoai ma» |
