# Hình tại điểm quyết định — Cổng 1

| Điểm | Đếm | Hình |
|---|---|---|
| Sửa ở bài kiểm, không sửa auth.ts (d-…-3) | 4 bước nối tiếp (auth nạp khoá hd → tệp khác đổi env → token giả đọc env → Better Auth so hd) + 2 nhánh sửa | `luong-hd-lech` |
| Trả env ở afterAll, không afterEach (d-…-4) | dưới ngưỡng: 1 bước, 2 nhánh không rẽ tiếp | — |
| Bỏ coverage-scan (d-…-1) | dưới ngưỡng: 1 bước | — |
| Bỏ đặc-tả-UX (d-…-2) | dưới ngưỡng: 1 bước | — |
| Mã có trước hợp đồng, gộp duyệt thiết kế vào Cổng 1 (d-…-5) | dưới ngưỡng: 2 bước | — |

## Đề bài `luong-hd-lech`

- Loại: sơ đồ tuần tự (sequence), hai làn so sánh «trước sửa» và «sau sửa».
- Nút: `auth.ts` (nạp một lần, khoá `google.hd = example.com`) · `cau-tu-choi.spec` (gán `ALLOWED_SIGN_IN = "phanlemanh@gmail.com"`, không trả) · `chia-mat-khau.spec` (dựng token Google giả) · Better Auth (so `hd` token với `hd` đã khoá).
- Trước sửa: token đọc env lúc chạy → `hd` vắng → «hd "<missing>" không khớp "example.com"» → hai ca đỏ.
- Sau sửa: `cau-tu-choi` trả env ở afterAll; token lấy `hd` từ `auth.options` → `hd = example.com` → khớp → xanh.
- AC liên quan: AC-1, AC-2, AC-8 (chỗ nối `hd` của auth.ts được đo riêng vì token thôi độc lập với cấu hình).
