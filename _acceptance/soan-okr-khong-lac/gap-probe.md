---
slug: soan-okr-khong-lac
at: 2026-10-08T13:05:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | AC-5/AC-6 đi qua agent → lưu → tải → app nhưng E5/E6 chỉ đo ở app với transcript dựng tay theo khuôn bên đọc; giả định số 1 chỉ kiểm phía agent | Đầu ra công cụ thật tới app dưới lớp bọc khác, docKetQuaNop trả null cho mọi lần nộp, production mất mọi mốc; E5/E6 vẫn xanh | Đo trên đường thật: agent chạy công cụ thật, tải lại qua bộ chuyển của app; ca hồi quy hội thoại thật vẫn có mốc | fixed: thêm AC-10 + E10 ui-check trên do:man với agent-okr thật và mô hình giả (công cụ thật trả tu-choi), E5 dựng transcript qua bộ chuyển thật của app; giả định số 1 ghi phép thử phía app là E10 |
| P1 | evals | E1 tự thêm/xoá tham số URL, không dùng đường mở/đóng ngăn thật; khổ hẹp không đo được trong jsdom; không ui-check cho AC-1 | Đường đóng ngăn thật làm rơi tabSoan/locSoan, ở 390 px trang vẫn về Trò chuyện; E1 vẫn xanh | Mở/đóng qua thành phần thật; ui-check ở 390 và 1440 | fixed: E1 dùng useRecordStack().open/close thật (gốc rễ đo được ở record-stack.ts ghi tab: null); E10 đo ST-soan-hep-co-ban-ghi ở 390 và 1440; không xin bỏ ui-observed |
| P1 | evals | E7 đếm mọi chuỗi da-ghi kể cả chỗ dùng; E9 ghim số dòng; E3 dùng selector design chưa hứa; E2 đo chuỗi thamSo vắng | Bản cài đúng design làm E7/E9 đỏ, không cách cài nào làm cả hai xanh | Đo quan hệ một nguồn; E9 theo mẫu dòng; design ghi data-loi | fixed: E7 so ketQuaNop.shape.ketQua.options với KET_QUA_NOP và chỉ đếm khai báo tập; E9 ràng buộc dòng theo mẫu; design và AC-4 ghi FieldError mang data-loi=nhom |
| P1 | evals | E8 không có vết cho proposal.tsx và cho gốc so sánh; vết (c) không đòi k2b-moc-hong; lần 2 của E5 không khác lần 1 | Bản cài lọc mốc nhưng lấy gốc so sánh từ lời gọi liền trước, E5 và E8 vẫn xanh | Thêm vết (d), (e); lần 2 khác lần 1 | fixed: E8 năm vết, có (d) proposal.tsx bỏ vẽ error và (e) gốc so sánh không lọc; vết (c) đòi cả k2b-moc-hong; lần 2 = lần 1 cộng 2 KR |
| P2 | design | Ngưỡng UAT rỗng nghĩa khi điều kiện lỗi không xảy ra lúc lái-thử; vùng giữa SỐNG và CHẾT không tên | Hai người thử không gặp lỗi nào, Cổng Giá trị đọc SỐNG dù lỗi chưa từng xuất hiện | Kịch bản lái-thử chủ động gây điều kiện; gọi tên vùng giữa | fixed: opportunity và Đường đo ghi ba điều kiện phải gây, loại không gây được không tính; một người vấp một lần là iterate |
