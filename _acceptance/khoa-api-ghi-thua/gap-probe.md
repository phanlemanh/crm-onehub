---
slug: khoa-api-ghi-thua
at: 2026-09-26T00:20:00Z
verdict: findings
p0: 0
p1: 1
p2: 4
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Ước lượng hồ sơ đã ký bị chạm chỉ khớp `paths`; bản vá đổi hành vi qua `package.json`/`bun.lock`, không khớp `paths` nào; 30 hồ sơ có eval không khai `paths` [mot-duong-ghi-phong-ban#F1] | Eval của hồ sơ đã ký đọc `lastRequest`/`updatedAt` sau lượt dùng khoá, không chạy lại, E8–E12 xanh, recheck strict đỏ lúc merge | Rút tập hồ sơ bị ảnh hưởng bằng máy và chạy pre-merge-check toàn kho | fixed: soát bằng grep 26/09 — chỉ `go-la-cat-quyen.spec.ts` chạm `lastRequest` (đặt giá trị cũ vài ngày), không test hay răng nào đọc sau lượt dùng khoá; ghi vào Notes; pin hoá cũ ghim lại bằng repin-lane ở lượt merge theo luật điều phối |
| P2 | contract | AC-5 không ghim lý do từ chối; khoá hết hạn không bảo đảm `lastRequest` trong ngưỡng, không đối chứng dương | Khoá dựng tay sai hash trả 401 vì không hợp lệ, E5 xanh mà không đo hết hạn | Tạo khoá qua writer thật, 200 trước, rồi đặt tắt/hết hạn, ghim mã lỗi thư viện | fixed: AC-5 và E5 viết lại — `createApiKey`, đối chứng 200, ghim `KEY_DISABLED`/`KEY_EXPIRED` qua `auth.api.getSession` |
| P2 | contract | AC-9 và design nói «không chạm nhánh rate-limit bật» trong khi lần đóng dấu `updatedAt` bỏ cả khi rate-limit bật | Giám khảo E13 kết luận ngược nhau tuỳ cách hiểu câu | Sửa câu cho khớp | fixed: AC-9 và design nói rõ bỏ đóng dấu mỗi khi có tuỳ chọn, bất kể rate-limit; cách đếm của nhánh bật không đổi |
| P2 | evals | E7 chỉ đo chuỗi có mặt, AC-7 hứa quan hệ (điều kiện gỡ, việc khi nâng) | Đoạn tài liệu có đủ chuỗi mà không nêu điều kiện gỡ, E7 vẫn thoát 0 | Thêm eval judgment hai câu có/không | fixed: thêm AC-10 và E14 judgment trên mục đó của `docs/api.md` |
| P2 | design | Không khai đường cài của bản chạy thật; AC chỉ đo môi trường test | Deploy cài không qua `bun.lock`, production vẫn ghi mỗi lượt, mọi AC xanh | Khai lệnh cài và khẳng định mã đã cài có bản vá | fixed: design thêm mục «Đường cài của bản chạy thật»; AC-6/E6 đòi `dist/index.mjs` đã cài có tuỳ chọn mới; Vercel cài bằng bun ghi `[GIẢ ĐỊNH]` ở Notes để người gạch tại Cổng 1 |
