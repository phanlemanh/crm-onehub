---
slug: soan-okr-song-lai
at: 2026-10-03T23:50:58Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Bảng «Hồ sơ đã ký bị thay» chỉ có soan-okr-cung-tro-ly/E9; thiếu eval đã ký bị đổi fixture (soan-okr.dom.tsx, khung-soan-okr.tsx) và bài db «đếm mọi trạng thái» | Eval đã ký chạy tệp bị sửa đỏ hoặc bị sửa ngầm mà Cổng Phạm vi không thấy; recheck strict làm hồ sơ cũ hoá cũ | Rút mọi eval đã ký có cmd chạy các tệp bị chạm; đổi kỳ vọng → BANG-THAY-THE, đổi fixture → danh sách ghim lại | fixed: quét theo lệnh ra đúng hai eval — E9 (đã trong bảng), E12 (thêm vào «Ghim lại»); bài db ghi rõ chạy trong suite |
| P1 | contract | AC-4 không chốt trạng thái cuộc rỗng, không chốt ưu tiên khi có cuộc dang, «mở được» chưa định nghĩa | Ô k=3 có cuộc dang → soanSanSang trả cuocDang, E6 đỏ trên bản đúng; z=3 dang → soanMo trả id cũ, «mở được» xanh mà trần không đo | Ma trận z ở bo + ô riêng dang; «mở được» = id mới khác mọi id gieo và số hàng tăng đúng 1 | fixed: AC-4, E5, E6 viết lại theo đúng đề xuất |
| P1 | evals | AC-2 (cross-layer) chỉ có E3 DOM tiêm cờ; không eval đo soLuot vẫn 0, không đo dây cờ tới ManSoan | Trang truyền cờ cho NutSoan nhưng ManSoan không nhận → URL cũ mở hội thoại, E2/E3 vẫn xanh | E2 soi page → TheoDonVi → NutSoan → ManSoan + chiều đỏ; eval backend-effect đọc soLuot qua tRPC với đối chứng tangLuot → 1 | fixed: E2 mở rộng chuỗi prop và chiều đỏ 'man soan khong nhan co cau noi'; thêm E13 (AC-2, backend-effect) |
| P1 | evals | E4 dựng tay đối tượng lỗi đúng khuôn bên đọc, không đi qua Response thật và client eve thật; ST-soan-loi-chua-cau-hinh không có trên màn thật | Client eve bọc 503 khác khuôn → laChuaCauHinh false trên production mà E4 vẫn xanh; câu dài có thể tràn ở 390 | Response dựng từ hằng của cửa thật qua useEveAgent thật; E11 chặn mạng trả cùng Response, chụp 1440 và 390 | fixed: thêm hằng CUA_OKR.trangThaiChuaCauHinh dùng chung cho route.ts và bài; E4, E11 viết lại |
| P2 | evals | «soanMo không được gọi» không có đối chứng dương; ma trận rút lúc chạy không có sàn; ba con số khác nhau cho không gian kết quả | Spy gắn sai module luôn xanh; bộ rút union trả rỗng → ma trận co về 6 ô mà E1 vẫn xanh | Chốt một con số; tập khoá HINH_NUT_TAT bằng tập union; sàn 22 ô; spy đối chứng dương | fixed: AC-1 chốt 8 mã + 3 biến thể = 11 × 2 vai = 22 ô; E1 thêm so tập, sàn 22, 'ma tran rong', spy dương; sổ thêm dòng sửa con số |
