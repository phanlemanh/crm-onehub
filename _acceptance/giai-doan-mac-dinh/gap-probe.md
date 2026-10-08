---
slug: giai-doan-mac-dinh
at: 2026-10-08T20:36:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E5 không nói Prisma client có được sinh lại từ `schema.prisma` của cây trước khi kiểm kiểu; chiều đỏ dựa vào lượt chạy lúc viết | Client cũ còn `@default` nên `stage` vẫn tuỳ chọn; một lời gọi thiếu `stage` qua kiểm kiểu, lỗi `NOT NULL` chỉ lộ khi chạy | Sinh lại client rồi khẳng định `stage` bắt buộc trong kiểu sinh ra; chiều đỏ chạy trong S4 | fixed: E5 thành `rang/kieu.mjs` — `db:generate`, đọc kiểu sinh ra, `check-types`, chiều đỏ chạy lại trong S4 |
| P1 | evals | E1 dòng 4 neo `origin/onehub` không loại chính migration của vòng và không `fetch` | Sau gộp E1 đỏ vĩnh viễn; trước gộp một mốc trùng mới trên onehub lọt qua [d-20261008T171908Z-35] | `fetch` trước, so «khác tên cùng mốc», đối chứng hai chiều | fixed: dòng 4 `git fetch` rồi so thư mục khác tên cùng mốc; đối chứng dương (chính thư mục của vòng) và âm (thư mục giả cùng mốc) |
| P1 | evals | E4 chạy seed thật trên cơ sở dữ liệu dùng chung của lượt `bun run test`, không dọn, không khôi phục Demo | Dữ liệu seed và Demo đã cất làm lệch số đếm của tệp chạy sau; E3, E6 đỏ hay chập chờn theo thứ tự tệp | Kho dùng-một-lần riêng, hoặc dọn có khẳng định đếm | fixed: E4 tạo kho `<kho của lượt>_seed`, chạy migration, seed, drop trong afterAll; thêm dòng Demo vẫn đã cất sau seed và dòng số hàng `deal` của kho dùng chung không đổi |
| P1 | contract | Ghim lại 8 hồ sơ đã ký không có AC đo; `cach-ly.eval.ts` không trong `paths` của E6; số tệp lệch giữa sổ và thiết kế [zalo-va-cach-ly#F1] | Gate 2 ký mà lưới trước-merge chặn vì 8 hồ sơ cũ; `cach-ly.eval.ts` sửa sai không ai thấy | AC-7 đo lưới không báo cũ cho 8 slug; thêm tệp vào `paths` | fixed: AC-7 và E7 (`rang/ghim.mjs`); `cach-ly.eval.ts` vào `paths` của E6, ghi rõ không chạy vì gọi model thật — đo bằng E5 và chốt `expect`; số tệp thống nhất là 5 tệp, 9 lời gọi |
| P2 | contract | Rủi ro T3 lên production: thiếu đường lùi, AC-5 không thấy SQL thô, lối B làm hỏng vế 2 của ngưỡng SỐNG | Đường ghi thô thiếu `stage` thành lỗi 500 trên production, không lệnh lùi đã duyệt; chọn B thì phiên nghiệm thu đọc SỐNG thành CHẾT | `git grep` SQL thô chèn vào `deal`; ghi đường lùi; nói rõ hệ quả của B | fixed: AC-5 và E5 dòng 3 quét SQL thô; Notes ghi đường lùi (revert PR, migration tạm có thời hạn — Never sửa thành «lâu dài»); Notes của lối B nêu vế 2 của ngưỡng phải sửa và AC nào bỏ |
