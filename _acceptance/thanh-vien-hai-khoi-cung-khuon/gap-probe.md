---
slug: thanh-vien-hai-khoi-cung-khuon
at: 2026-09-25T11:57:30Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

# Gap probe — thanh-vien-hai-khoi-cung-khuon

Phản biện context sạch, một lượt, đọc design doc, contract, evals, sổ quyết định và 10 bài học từ claim-scan.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-1, AC-2, AC-7 chỉ đo quan hệ giữa các giá trị computed style; không eval nào giữ luật không đè className lên component @crm/ui | Người làm thêm className rounded-lg border cho CardTable và pl-4 cho ô đầu; E1, E2, E7 xanh, cổng ký một bản vi phạm đúng luật vòng này sinh ra để sửa | Soi mã các tệp của trang: 0 lớp viền, góc, nền, bóng trên component @crm/ui; component khung không nhận className; ghim chuỗi lớp của CardTable | fixed: thêm AC-16 và E17 (soi cú pháp TypeScript, ghim chuỗi lớp CardTable, chiều đỏ trên bản sao) |
| P1 | evals | Dữ liệu giả của E8, E9 viết tay đúng khuôn bên đọc [zalo-qua-webhook#F1]; AC-9 chỉ đo ở lớp DOM | Đầu ra thật của workspace.allowances đổi khuôn; component đọc sai mà E8, E9 vẫn xanh | Gõ kiểu dữ liệu giả theo RouterOutputs; thêm ca rỗng trên màn thật bằng một workspace phụ | fixed: dữ liệu giả gõ kiểu satisfies RouterOutputs["workspace"]["allowances"] và ["get"], check-types đỏ khi lệch. rejected phần màn thật: app chỉ có một không gian làm việc (WORKSPACE_ID cố định) và không được làm rỗng dữ liệu người khác — ghi ở Out of scope |
| P1 | contract | Đường lỗi của «Cho phép» và «Rút» hứa trong design mà không AC nào nhận, trong khi mutation dời sang component mới ở đầu trang | Bản mới đóng hộp trong onSettled; người gõ một địa chỉ bị API từ chối mất chữ và không thấy lỗi; E3 chỉ đi đường suôn | AC cross-layer cho đường lỗi: hộp vẫn mở, thông điệp ghim, DB không thêm, tiêu đề giữ số | fixed: thêm AC-15 và E18 (địa chỉ đã chờ, thông điệp «That address is already on the list.», chiều đỏ đóng hộp trong onSettled). Đường lỗi của «Rút» ghi Out of scope — mã xử lý không đổi và không gây lỗi API rút được trên màn thật |
| P2 | evals | Một script phục vụ 11 eval mà không có ma trận viết trước, dòng KẾT LUẬN không ghim số [tien-te-chua-tai-khong-doan#F1] | Phiên của marcus hỏng bị nuốt hoặc khổ 768 bị bỏ qua, script vẫn in mã 0 | Mảng ma trận viết trước, tổng ghim, mã thiếu thì in SAI thiếu | fixed: E1 khai ma trận 46 mã và dòng KẾT LUẬN «46 DUNG, 0 SAI»; mã không phát ra in «SAI thieu <ma>»; phá-thử TVHK_BO_KHO=768 |
| P2 | evals | AC-13 hứa dọn cả khi hỏng giữa chừng nhưng E14 không thử tiến trình bị giết, không quét tàn dư trước khi gieo | Tiến trình bị giết exit 137, finally không chạy, 15 hàng còn lại; lượt sau đụng ràng buộc hoặc M thổi lên | Dọn tàn dư trước khi gieo; phá-thử kill -9 | fixed: E14 thêm dòng «don-truoc» và phá-thử kill -9 rồi chạy lượt mới |
