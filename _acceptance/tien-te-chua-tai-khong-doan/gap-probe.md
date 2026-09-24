---
slug: tien-te-chua-tai-khong-doan
at: 2026-09-24T07:10:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
claims_input: ok
---

# Gap probe — tien-te-chua-tai-khong-doan

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design, contract, evals | Design và AC-3 nói ngược nhau ở ca số tiền để trống; 12 dòng kỳ vọng của ma trận không nằm trong bộ đo | Người làm tự viết bảng khớp cách mình làm, người chọn USD cho thoả thuận không số tiền mà lưu VND vẫn xanh | Chốt một cách hiểu, chép đủ 12 dòng vào expected | fixed: chốt «số trống vẫn mang đồng đã biết, chỉ bỏ currency khi chưa biết»; design và AC-3 cùng một câu; bảng 12 dòng nằm trong expected của E3 |
| P1 | evals | E3 đo đồng gửi đi so với bảng, không đo quan hệ đồng đọc số bằng đồng gửi đi | Đọc theo đồng này mà gửi đồng kia, cents như nhau nên xanh | Đọc dòng «Đọc là» trước Tạo và so ký hiệu tiền với currency của lệnh | fixed: mỗi ô có số khẳng định dòng «Đọc là» theo đúng currency của lệnh (VND và USD cho chuỗi khác nhau) |
| P1 | evals | E9 không ghim đồng báo cáo khác USD và đồng chọn khác đồng báo cáo | Đồng báo cáo là USD thì bản cũ vẫn qua; máy khách quên gửi currency mà máy chủ tự điền trùng | Đọc đồng báo cáo trước, thoát mã 2 khi là USD, chọn đồng khác cả hai | fixed: script đọc đồng báo cáo, USD thì mã 2, chọn đồng đầu tiên trong EUR, VND, JPY khác cả USD lẫn đồng báo cáo; AC-8 sửa theo |
| P1 | evals, decisions | Thêm nhanh không có ảnh màn thật dù là màn có phần tử mới và là chỗ Thử lại gọi lại truy vấn | Nút Thử lại tràn hoặc không gọi lại trên ứng dụng thật, Cổng Bằng chứng không thấy | Thêm eval màn thật cho thêm nhanh | fixed: thêm AC-10 và E11 (ui-check) cùng script, bản ghi máy chủ đọc trong E9 |
| P2 | contract, evals | Khẳng định «không chứa USD» không có vế dương; aria-live không được đo | Ô chọn tự lấy đồng đầu danh sách vẫn xanh; dòng mất aria-live không ai thấy | Khẳng định chữ ô chọn bằng «Tiền tệ»; đo aria-live ở E7 | fixed: E1, E8 khẳng định chữ bằng «Tiền tệ» và không mục nào được chọn; AC-7 và E7 đo aria-live |
