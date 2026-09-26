---
slug: quen-mat-khau
at: 2026-09-25T21:21:51Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Không eval nào đo chỗ nối chayNen với đường thật: E16 thử chayNen đứng riêng, còn E8 và E14 chạy trong tiến trình Node sống lâu, nơi promise nào cũng xong ([noi-zalo-cho-nguoi-moi#F1]) | handler khai (p) => p.catch(() => {}) thay vì waitUntil: E8, E14, E16 đều xanh, lên Vercel thì hàm đóng băng và thư không bao giờ đi | Ca nối-nền với context Vercel giả: waitUntil gọi đúng một lần; await chính promise ấy thì fetch tới Resend tăng đúng 1; chiều đỏ ghim «thư không nằm trong waitUntil» | fixed: thêm ca NOI-NEN vào E8 và E14 |
| P1 | design | Chưa chốt donChiaCu được await trước hay chạy nền cùng thư báo; E10 chỉ đo khi Resend chạy tốt | Dọn chìa nằm sau thư trong promise nền; Resend chết thì liên kết thứ hai vẫn đặt được mật khẩu, E10 và E14 vẫn xanh | Design chốt await donChiaCu trước chayNen; E10 thêm ca Resend chết, dùng chìa 2 ngay không chờ nền → INVALID_TOKEN | fixed: design mục Máy chủ + ca RESEND-CHET trong E10 |
| P1 | evals | AC-1 là cross-layer nhưng trạng thái tắt không đi qua trang thật: E2 thử hàm thuần với đầu vào tự dựng, E18 chỉ chạy khi thư bật ([noi-zalo-cho-nguoi-moi#F1]) | page.tsx quên gọi hàm quyết định, sign-in truyền nhãn vô điều kiện: bản tự dựng chưa khai Resend hiện liên kết, người dùng chờ một lá thư không bao giờ tới; E1, E2, E5, E18 vẫn xanh | Một lượt ui-check với api không có hai biến: 0 liên kết /quen-mat-khau ở /sign-in; mở thẳng /quen-mat-khau thì URL cuối là /sign-in | fixed: thêm E21 (ui-check, qmk_chup_tat) ghép cặp với E18 |
| P1 | evals | E12 có thể xanh chỉ vì môi trường test; design không khai kiểu lưu bộ đếm và cách bật | storage memory trên Vercel: lượt thứ tư rơi vào instance khác và nhận 200, trong khi E12 xanh trong một tiến trình | E12 dòng 0 khẳng định rateLimit.enabled === true và storage === "database" mà không đặt NODE_ENV; chiều đỏ storage memory | fixed: design khai cấu hình đang có (enabled true, storage database) + dòng 0 trong E12 |
| P2 | evals | Câu quá lượt trên form chỉ đo bằng fixture viết tay { error: { status: 429 } }; không lượt nào đưa 429 thật qua client better-auth thật | Client thật trả 429 theo khuôn khác, form rơi vào nhánh lỗi mạng; E13 và E17 xanh | E18 thêm bước gửi form bốn lần tới máy chủ thật, chụp E18-qua-luot-1440.png, khẳng định chuỗi quá lượt và không có «Kiểm tra hộp thư» | fixed: thêm bước quá lượt vào steps và expected của E18 |
