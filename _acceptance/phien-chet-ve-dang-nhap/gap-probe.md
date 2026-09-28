---
slug: phien-chet-ve-dang-nhap
at: 2026-09-28T02:10:00Z
verdict: findings
p0: 0
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E9/E10 không ghim trình duyệt mang cookie nào, trong khi Notes nói cookieCache 5 phút giữ phiên thu hồi sống | Nếu có crm.session_data thì xoá hàng Session xong app và API vẫn thấy phiên sống, E9/E10 SAI dù code đúng, người sửa dễ vá phép đo bằng cách chờ | Chỉ đặt crm.session_token; in tên cookie; tiền đề API 401 với đúng bộ cookie, không thì mã 2 | fixed: E9/E10 và design ghim hai cookie (crm.session_token của dev:session — chỉ in một cookie — và lang=vi), thêm tiền đề 401 → mã 2 «phiên chưa chết» |
| P1 | evals | E10 ghi «proxy chuyển» cho / nhưng không tách B khỏi A trên stack thật [bo-dung-khong-ket#F1] | Nhánh 401 của proxy không bắt được trên stack thật, A vẫn đẩy / về /sign-in, trang khác tự kiểm phiên nên E9/E10 vẫn xanh, AC-1 chỉ đo bằng 401 giả | Đường chỉ proxy quyết, 307 không kèm NEXT_REDIRECT, phá-thử gỡ nhánh hetPhien giữ A phải làm E10 đỏ | fixed: tra 28/09 — /<slug>/agents (trang, layout (agent-builder) và [slug] không tự kiểm phiên); thêm vào E9, E10, AC-9 và design; E10 thêm chiều đỏ phá-thử gỡ B giữ A |
| P2 | evals | E3 khai 9 assert đếm = 0 nhưng ca marketing / đi qua bước đọc cổng | Test theo khai đỏ trên code đúng, hoặc người code dời isPublic lên trước và đổi hành vi người còn phiên ở / khi bật marketing | 8 assert đếm cho đường thoát sớm, ca marketing không assert đếm, thông điệp riêng | fixed: E3 viết lại 9 assert chuyển hướng + 8 assert đếm, ca marketing thông điệp «marketing bat: / bi day ve /sign-in» |
| P2 | evals | E9 so tiêu đề với authMessages("vi") mà không khai phiên đo lấy locale vi thế nào | Puppeteer gửi Accept-Language en-US, màn đăng nhập ra tiếng Anh, 5 dòng SAI giả | Ghim cookie locale hoặc so theo html[lang] | fixed: trình duyệt mang cookie lang=vi (LANG_COOKIE của lib/locale), E9 thêm assert html[lang] = vi |
