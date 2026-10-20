---
slug: va-gantt-lich-bay-ngay
at: 2026-10-19T15:40:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Tiền đề «kho mỗi lượt là kho mới nên cờ mới luôn false» sai: kho crm_<id>_test dùng chung cho mọi tệp của một lượt; E1, E3, E4 ghi qua datNgayNghiTuan mà không eval nào đòi bước dọn trả cờ | lich-bay-ngay.spec.ts chạy trước lich-lam-viec.spec.ts, bài dg_lich đã ký ghi mảng rỗng, cờ còn từ tệp trước, đọc ra [] và ném 'llv: mac dinh sai []' — đỏ tuỳ thứ tự tệp | Bước dọn có kiểm sau dọn ở E1–E4; đột biến bỏ bước dọn đòi dg_lich đỏ | fixed: đổi khuôn sang cờ khongNghiTuan (bài dg_lich không bao giờ bật nó, vì không đặt rỗng qua API — với cờ «đã đặt» chính nó cũng để cờ true lại); E1–E4 có lời 'vg: don lich de lai co'; E7 (g); E2b chạy cùng lượt; sổ d-20261019T152533Z-8 thay d-20261019T151925Z-1 |
| P0 | contract | Dòng sổ d-20261019T151925Z-7 ghi «khoá chạm mọi đường tạo việc» là lối chết, nhưng khoá đặt trong docDuAnNhanViec chỉ chạm ba đường thêm việc vào dự án | Cổng Phạm vi ký Out of scope «hai người cùng thêm việc thứ 300» vì tin ràng buộc kỹ thuật không có thật | Ca hai giao dịch song song trên P299, cuối đúng 300 việc | fixed: khoá hàng duAn trong docDuAnNhanViec vào phạm vi; AC-7 thêm vế tranh nhau; E6b ca tranh nhau; E7 (h); sổ d-20261019T152534Z-9 thay d-20261019T151925Z-7 |
| P1 | evals | «Ma trận 27 dòng» chỉ ghim kết quả 19 dòng; tao-viec × P299 đẩy P299 lên 300 làm hai đường thêm việc sau bị chặn | Lỗi lệch một ở docDuAnNhanViec trên chuyen-vao hay viec-con lọt; PD × đường thêm việc trả lời trần thay lời đóng mà không ai thấy | Đủ 27 kết quả viết trước, P299 về 299 sau mỗi dòng | fixed: E5 ghi đủ 27 kết quả {thaoTac, duAn, ket, loi}; E6b đưa việc vừa thêm ra khỏi dự án và đòi P299 về 299 trước dòng kế |
| P1 | evals | Vế «không ô nào chọn» trên màn Cài đặt của E8 là đếm bằng 0 không có đối chứng dương | Bộ chọn trỏ sai phần tử thì luôn ra 0, E8 xanh rỗng dù T7, CN bật lại | Trước khi bỏ chọn, đếm cùng bộ chọn ra đúng 2 ô data-thu 6 và 7 | fixed: E8 bước 0 đối chứng dương trên màn Lịch làm việc với lời 'vg man: doi chung lich khong thay 2 o' |
| P1 | contract | AC-4 When là thao tác người, Then qua backend, thiếu tag cross-layer; E4 tự gửi giá trị Hoàn tác viết tay | Nút Hoàn tác của màn gửi giá trị khác mà E4 vẫn xanh; Cổng Bằng chứng ký AC-4 dù không ai bấm nút | Răng màn bấm Hoàn tác hai chiều, tải lại, đếm ô | fixed: AC-4 gắn (cross-layer); thêm E8b ui-check bấm Hoàn tác trên thông báo hai chiều kèm đối chứng đọc API trước mỗi lần bấm |
