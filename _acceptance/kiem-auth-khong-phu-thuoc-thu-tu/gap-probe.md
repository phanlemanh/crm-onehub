---
slug: kiem-auth-khong-phu-thuoc-thu-tu
at: 2026-09-23T04:10:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals, contract | Token giả theo cấu hình auth nên không AC nào đo chỗ `auth.ts` đưa `hd` vào `google.hd`; phần bù «hosted-domain.spec đo ở tầng hàm» không chạm chỗ nối | `auth.ts` đặt `hd` sai hoặc bỏ `hd`: hai ca cua-google vẫn xanh, hosted-domain.spec vẫn xanh, cửa Google của sản phẩm hỏng mà toàn gói xanh | Eval đột biến trên bản sao: M1 hd ngoài danh sách, M2 bỏ hd; mỗi đột biến làm một ca có tên đỏ | fixed: thêm AC-8 + E11 (tệp test mới `hd-cua-google.spec.ts`, nạp auth trong tiến trình mới, đột biến M1/M2 trên bản sao) |
| P1 | evals, contract | Chiều đỏ chỉ có cho cặp cau-tu-choi → chia-mat-khau; ba cặp kia chỉ có chiều xanh | Bản gốc của một tệp không làm cặp đỏ; E1 vẫn báo bốn cặp xanh và người ký tưởng bốn đường rò đều được chặn | Ma trận 4×2 viết trước; cặp nào bản gốc không đỏ thì thoát 2 gọi tên cặp | fixed: AC-1 và E1 đòi ma trận 4×2, ghim log `does not satisfy the configured "hd" option "example.com"`, đếm đủ 8 ô |
| P1 | contract, evals | Thước CE bằng grep hỏng (không -r, khớp cả phép so và lệnh trả env); E2 chỉ chạy bốn tệp kể tên, không quét cả lớp | Một tệp thứ năm đổi env bằng delete hoặc qua helper khác; không eval nào chạy nó; CI đỏ lại như PR #87 | Liệt kê mọi spec lúc chạy, chạy từng tệp với preload canh env ở bản gốc và bản sửa; tập rò bản gốc bằng đúng bốn tên, bản sửa rỗng; thêm lượt toàn gói | fixed: AC-2 và E2 viết lại theo ma trận toàn lớp + lượt toàn gói; bỏ thước grep khỏi Coverage |
| P2 | evals | E3/E4 chỉ khẳng định âm tính (vắng dòng fail, pass ≥ 112) không đối chứng dương; hai ca có nhánh bỏ qua khi env Google trống | Env CI bị .env đè hoặc ca bị đổi tên/skip: E3 không thấy fail nên xanh, E4 vẫn đủ 112 | E3 đếm đúng 2 testcase xanh qua junit + tiền đề Google bật; E4 ghim tổng theo bản gốc và trần skip | fixed: E3 thêm tiền đề `isGoogleConfigured()` + đếm 2 testcase xanh qua junit; E4 ghim tổng = bản gốc + ca tệp mới, skip không vượt bản gốc |
| P2 | evals, contract | E8 không đòi output và 0 cached; AC-5 thiếu `bun run build` mà CLAUDE.md coi là lệnh thứ năm | turbo phát lại cache auth#test từ lượt env máy dev; E8 xanh mà không ai thấy task cached | E8 đòi output + 0 cached; thêm eval build hoặc descope có tên | fixed: E8 dùng `api_khong_cache_tru_agent` đòi output; thêm E9 `build_khong_cache`; AC-5 thành năm lệnh |
