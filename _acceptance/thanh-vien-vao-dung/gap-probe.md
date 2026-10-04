---
slug: thanh-vien-vao-dung
at: 2026-10-04T06:52:31Z
verdict: findings
p0: 0
p1: 4
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E13 không đi qua con đường gây lỗi #43 — prefetch máy chủ lỗi rồi hydrate xuống trình duyệt; chỉ giả fetch phía trình duyệt | Bản vá giữ quyết định ở máy chủ, nút vẫn mất tới khi tải lại, cả ba ca cũ của E13 vẫn xanh | Ca «ssr-loi» dehydrate bằng makeQueryClient thật, render trong HydrationBoundary, chờ nút bằng findByRole; chiều đỏ giữ quyenQuanTri() | fixed: E13 thêm ca (a) ssr-loi + chiều đỏ ghim «nut sau loi ssr»; AC-9 ghi rõ vế hydrate |
| P1 | contract | AC-9 cross-layer chỉ có eval lớp UI; vế «người không quyền nhận 403 trong hộp» không được đo | pre-merge-check đỏ AC-9; hoặc allowEmail bỏ kiểm vai vẫn qua 23 eval | Eval backend-effect: thành viên thường gọi allowEmail qua createCaller → FORBIDDEN, đếm invitation không đổi; ca dom hộp giữ mở với 403 | fixed: thêm E24 (backend-effect) + ca (d) của E13 nối 403 trong hộp; AC-9 viết lại vế Then |
| P1 | contract | Đường đo «bị coi nhầm đang bị gỡ» bằng bo-sot trùng trạng thái hợp lệ của AC-8 (cho phép lại, chưa đăng nhập) | Sau giao, một lần cho phép lại làm bo-sot 1, Cổng Giá trị đọc ra CHẾT dù không ai bị coi nhầm | bo-sot thêm điều kiện có phiên tạo sau dòng còn hiệu lực mới nhất; ca gieo thêm người cho phép lại chưa đăng nhập không được đếm | fixed: AC-11 định nghĩa lại bo-sot; E15 thêm ca không-đếm và chiều đỏ «bo-sot 2» |
| P1 | contract | Vế màn của AC-1 và AC-7 không có eval trỏ đúng AC; AC-4, AC-7 thiếu nhãn cross-layer | Ô giữ chữ thô và Lưu còn bật, hoặc đầu khối đếm cả dòng treo, mà E1/E4/E11/E17 vẫn xanh | Ca dom AC-1 kiểm ô chuẩn hoá + Lưu tắt; E17 ghim giá trị của AC-1; ca dom AC-7 kiểm số đếm | fixed: thêm E25 (AC-1), E26 (AC-7); E17 ghim chuỗi và giá trị của AC-1; AC-4, AC-7 gắn (cross-layer) |
| P2 | evals | E14 gieo D (chỉ có dòng không đọc được) mà không ghi kết quả mong đợi; AC-10 cũng không nói | Dựng lại và decideSignIn lệch nhau ở D mà E14 vẫn xanh | AC-10 ghi D theo decideSignIn; E14 thêm D, 5 assert | fixed: AC-10 ghi D không thành thành viên (đối chiếu decideSignIn gọi thật trong ca); E14 thành 5 assert |
