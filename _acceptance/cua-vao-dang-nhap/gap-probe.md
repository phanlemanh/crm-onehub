---
slug: cua-vao-dang-nhap
at: 2026-09-25T15:38:58Z
verdict: findings
p0: 0
p1: 4
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Eval DOM mock `AuthShell`, `@crm/auth`, `fetchQuery` trong CÙNG một tệp với eval cần module thật; lọc theo tag không tách tiến trình | `mock.module` của bun sống cả tiến trình: E2, E3, E6–E9 vẽ bộ ghi props thay khung thật, đỏ giả hoặc đo nhầm vật; mock `@crm/auth` còn rò sang `sign-in-mat-khau-luon-hien.spec.ts` | Tách tệp, lệnh riêng; assert giữ hàm thật; chạy gói hai thứ tự `--randomize --seed` | fixed: tách ba tệp (`cua-vao-trang-khac.dom.tsx` mock AuthShell riêng, `cua-vao-shell.dom.tsx` không mock khung và ghim hàm thật, `cua-vao-sign-in.dom.tsx`), ba lệnh config riêng; phá-thử `PASSWORD` chuyển sang bản sao, không mock `@crm/auth` trong gói |
| P1 | contract | AC-7 hứa HTML không chứa giá trị URL nhưng E8 chỉ đo `renderToString` của component | Next ghi `searchParams` vào payload RSC trong `<script>`; `curl` thấy giá trị, E8 xanh mà lời hứa sai trên sản phẩm thật | Viết lại phạm vi AC-7; đo HTML thật trên bàn đo, ma trận 6 ca | fixed: AC-7 tách «ngoài `<script>`» (không chứa ở ba dạng) và «payload RSC» (không thẻ thô); thêm E19 đo HTML thật từ máy chủ của cây, 6 ca viết trước |
| P1 | design | Vị trí và vai của `LogoLockup` mâu thuẫn giữa §4.2, ST-sign-in-hep, E13 và AC-12 | Logo là liên kết trong khối → E13 «tiêu điểm vào khối»; không phải liên kết mà logo cột phải ẩn → Tab ở 1440 lệch ngay bước một | Design nói rõ từng khổ; chuỗi Tab viết trước cho 1440 và 320 | fixed: spec §4.2 — logo khối hướng dẫn trang trí, `aria-hidden`, chỉ từ `lg`; liên kết logo duy nhất là của `AuthHeading` ở mọi khổ; AC-12 và E13 ghim cùng một chuỗi Tab ở 1440 và 320 |
| P1 | evals | Fixture `signInOptions` viết tay đúng khuôn bên đọc; màn thật chỉ chạy cấu hình Google bật [zalo-qua-webhook#F1] [noi-zalo-cho-nguoi-moi#F1] | #104 đặt cờ khác tên hoặc API trả khuôn khác; E4, E15 xanh trên fixture, màn thật thiếu «Quên mật khẩu?» hoặc bước 2 ghi `undefined` | `satisfies` kiểu suy từ router; bàn đo đọc `signInOptions` thật | fixed: mọi fixture `satisfies RouterOutputs["sso"]["signInOptions"]` (check-types đỏ khi khuôn trôi); E11 thêm dòng đọc `signInOptions` thật từ API của cây và ghim bước 2 khớp nút. deferred: nhánh chỉ-mật-khẩu, SSO, Microsoft trên màn thật cần dựng API ba lần với env khác — đo bằng test DOM có kiểu thật, ghi Known limit |
| P2 | evals | E5 chỉ ghim hai mỏ neo OAuth; writer SSO (`@better-auth/sso` dòng 2191) bị bỏ | Nâng `@better-auth/sso` đổi cách mã hoá lỗi; người vào SSO bị từ chối thấy câu chung, E5 vẫn xanh | Mỏ neo thứ ba; ma trận writer × câu | fixed: E5 thêm mỏ neo SSO, ma trận {oauth, sso} × 3 câu = 6 dòng, chiều đỏ trên bản sao dist SSO |
