# Hình tại Cổng Phạm vi — cua-vao-dang-nhap

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 nhận «chưa được cho phép» bằng tiền tố câu tiếng Anh (kèm d-4 không dựng OAuth giả) | 4 bước nối tiếp | `ma-loi-di-dau.html` |
| Hướng khối «Lần đầu vào?» — «Đều nhau» / «Tiến độ» | 2 nhánh rẽ | có sẵn: `evidence/design-pass/ST-phan-ky-*--desktop-1280--light.png` |
| d-2 bỏ ép dark, sign-in nền phẳng | dưới ngưỡng: 1 bước | — |
| d-3 «địa chỉ email» thay «email công ty» | dưới ngưỡng: 1 câu chữ | — |
| d-5 chạy design-pass | dưới ngưỡng: 1 bước | — |
| Ba dòng [GIẢ ĐỊNH] của Coverage | dưới ngưỡng: mỗi dòng 1 khẳng định | — |
| Ký Cổng Đáng (`opportunity.md`) | dưới ngưỡng: 1 quyết định | — |

## Đề bài — ma-loi-di-dau

- Loại: sơ đồ luồng ngang (flowchart), 5 nút nối tiếp + 1 nhánh.
- Nút: (1) Hook `user.create.before` ném `APIError("FORBIDDEN", "This CRM is private. …")` — `packages/auth` · (2) `handleOAuthUserInfo` bắt lỗi, giữ `e.message` — better-auth · (3) Callback đổi khoảng trắng thành `_`, chuyển về `/sign-in?error=…` — better-auth (và `@better-auth/sso`) · (4) `/sign-in` đọc `error` · (5) Phân loại: tiền tố `This_CRM_is_private.` → «chưa được cho phép»; `access_denied` → «dừng giữa chừng»; còn lại → câu chung; vắng → không ô.
- Nhãn chữ: đánh dấu nút (1)–(3) «đo bằng mỏ neo nguồn — E5», nút (4)–(5) «đo bằng test và bàn đo — E6–E9, E19»; ghi chú dưới: «không chạy đầu-cuối với nhà cung cấp OAuth giả (d-4)».
- AC: AC-5, AC-6, AC-7, AC-8.
