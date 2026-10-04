---
slug: thanh-vien-vao-dung
at: 2026-10-04T06:48:06Z
route: http://localhost:3330/proto/thanh-vien-vao-dung
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (anh — gói ảnh gửi kèm thẻ Cổng Phạm vi)
options:
divergence: skipped — thẻ thêm vào trang Cài đặt có sẵn theo đúng khuôn section của docs/settings.md (Card → CardHeader → CardAction «Lưu» → CardContent form); không có hướng thứ hai đáng bày
ds_skill: web-design-guidelines
states: [ST-ten-mien-co, ST-ten-mien-rong, ST-ten-mien-dang-tai, ST-ten-mien-dang-luu, ST-ten-mien-loi-nhap, ST-ten-mien-khoa, ST-ten-mien-loi-tai, ST-cho-phep-da-la-thanh-vien, ST-dau-trang-sau-loi]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 0
deferred: 3
---
# design-pass — thanh-vien-vao-dung

Bản mẫu ghép từ component thật của `@crm/ui` trong `PageShell` thật của trang Thành viên
(khung host dạng tĩnh: hai khối có sẵn chỉ còn tiêu đề). 36 ảnh, không ảnh nào tràn ngang
(scrollWidth − clientWidth = 0 ở mọi ô). Lệnh chụp: `.acceptance-runs/thanh-vien-vao-dung/chup-proto.mjs`.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-cho-phep-da-la-thanh-vien | desktop-1280 | dark | evidence/design-pass/ST-cho-phep-da-la-thanh-vien--desktop-1280--dark.png |
| ST-cho-phep-da-la-thanh-vien | desktop-1280 | light | evidence/design-pass/ST-cho-phep-da-la-thanh-vien--desktop-1280--light.png |
| ST-cho-phep-da-la-thanh-vien | mobile-375 | dark | evidence/design-pass/ST-cho-phep-da-la-thanh-vien--mobile-375--dark.png |
| ST-cho-phep-da-la-thanh-vien | mobile-375 | light | evidence/design-pass/ST-cho-phep-da-la-thanh-vien--mobile-375--light.png |
| ST-dau-trang-sau-loi | desktop-1280 | dark | evidence/design-pass/ST-dau-trang-sau-loi--desktop-1280--dark.png |
| ST-dau-trang-sau-loi | desktop-1280 | light | evidence/design-pass/ST-dau-trang-sau-loi--desktop-1280--light.png |
| ST-dau-trang-sau-loi | mobile-375 | dark | evidence/design-pass/ST-dau-trang-sau-loi--mobile-375--dark.png |
| ST-dau-trang-sau-loi | mobile-375 | light | evidence/design-pass/ST-dau-trang-sau-loi--mobile-375--light.png |
| ST-ten-mien-co | desktop-1280 | dark | evidence/design-pass/ST-ten-mien-co--desktop-1280--dark.png |
| ST-ten-mien-co | desktop-1280 | light | evidence/design-pass/ST-ten-mien-co--desktop-1280--light.png |
| ST-ten-mien-co | mobile-375 | dark | evidence/design-pass/ST-ten-mien-co--mobile-375--dark.png |
| ST-ten-mien-co | mobile-375 | light | evidence/design-pass/ST-ten-mien-co--mobile-375--light.png |
| ST-ten-mien-dang-luu | desktop-1280 | dark | evidence/design-pass/ST-ten-mien-dang-luu--desktop-1280--dark.png |
| ST-ten-mien-dang-luu | desktop-1280 | light | evidence/design-pass/ST-ten-mien-dang-luu--desktop-1280--light.png |
| ST-ten-mien-dang-luu | mobile-375 | dark | evidence/design-pass/ST-ten-mien-dang-luu--mobile-375--dark.png |
| ST-ten-mien-dang-luu | mobile-375 | light | evidence/design-pass/ST-ten-mien-dang-luu--mobile-375--light.png |
| ST-ten-mien-dang-tai | desktop-1280 | dark | evidence/design-pass/ST-ten-mien-dang-tai--desktop-1280--dark.png |
| ST-ten-mien-dang-tai | desktop-1280 | light | evidence/design-pass/ST-ten-mien-dang-tai--desktop-1280--light.png |
| ST-ten-mien-dang-tai | mobile-375 | dark | evidence/design-pass/ST-ten-mien-dang-tai--mobile-375--dark.png |
| ST-ten-mien-dang-tai | mobile-375 | light | evidence/design-pass/ST-ten-mien-dang-tai--mobile-375--light.png |
| ST-ten-mien-khoa | desktop-1280 | dark | evidence/design-pass/ST-ten-mien-khoa--desktop-1280--dark.png |
| ST-ten-mien-khoa | desktop-1280 | light | evidence/design-pass/ST-ten-mien-khoa--desktop-1280--light.png |
| ST-ten-mien-khoa | mobile-375 | dark | evidence/design-pass/ST-ten-mien-khoa--mobile-375--dark.png |
| ST-ten-mien-khoa | mobile-375 | light | evidence/design-pass/ST-ten-mien-khoa--mobile-375--light.png |
| ST-ten-mien-loi-nhap | desktop-1280 | dark | evidence/design-pass/ST-ten-mien-loi-nhap--desktop-1280--dark.png |
| ST-ten-mien-loi-nhap | desktop-1280 | light | evidence/design-pass/ST-ten-mien-loi-nhap--desktop-1280--light.png |
| ST-ten-mien-loi-nhap | mobile-375 | dark | evidence/design-pass/ST-ten-mien-loi-nhap--mobile-375--dark.png |
| ST-ten-mien-loi-nhap | mobile-375 | light | evidence/design-pass/ST-ten-mien-loi-nhap--mobile-375--light.png |
| ST-ten-mien-loi-tai | desktop-1280 | dark | evidence/design-pass/ST-ten-mien-loi-tai--desktop-1280--dark.png |
| ST-ten-mien-loi-tai | desktop-1280 | light | evidence/design-pass/ST-ten-mien-loi-tai--desktop-1280--light.png |
| ST-ten-mien-loi-tai | mobile-375 | dark | evidence/design-pass/ST-ten-mien-loi-tai--mobile-375--dark.png |
| ST-ten-mien-loi-tai | mobile-375 | light | evidence/design-pass/ST-ten-mien-loi-tai--mobile-375--light.png |
| ST-ten-mien-rong | desktop-1280 | dark | evidence/design-pass/ST-ten-mien-rong--desktop-1280--dark.png |
| ST-ten-mien-rong | desktop-1280 | light | evidence/design-pass/ST-ten-mien-rong--desktop-1280--light.png |
| ST-ten-mien-rong | mobile-375 | dark | evidence/design-pass/ST-ten-mien-rong--mobile-375--dark.png |
| ST-ten-mien-rong | mobile-375 | light | evidence/design-pass/ST-ten-mien-rong--mobile-375--light.png |

## Cảnh ngữ-cảnh

- Không áp: `context: static-frame` — thẻ nằm trong khung trang Thành viên thật (`PageShell` width wide, nút đầu trang, hai khối có sẵn), nên mọi ảnh đã là cảnh ngữ-cảnh.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- (không có)

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `CardDescription` ẩn dưới 640 px theo hệ thiết kế, nên trên điện thoại thẻ mất câu giải thích tên miền nội bộ dùng để làm gì (ảnh `ST-ten-mien-*--mobile-375-*`). Đề xuất: giữ hệ thiết kế; dòng `FieldDescription` dưới ô vẫn hiện và nói cách nhập.
- Thông điệp lỗi của API là tiếng Anh trên giao diện tiếng Việt (ảnh `ST-ten-mien-loi-nhap`, `ST-cho-phep-da-la-thanh-vien`) — cùng lớp với «That address is already on the list.» đang có. Đề xuất: Out of scope vòng này, đã ghi [GIẢ ĐỊNH] trong Coverage.
- Hộp «Cho phép một địa chỉ» thật (`allow-dialog.tsx`) vẽ lỗi bằng `<p className="text-destructive text-sm">` và xếp nhãn bằng `div`, lệch bảng «Dấu hiệu vẽ tay» của `docs/design.md` (`Field`, `FieldError`). Bản mẫu dùng `Field data-invalid` + `FieldError`. Đề xuất: không đổi vòng này (thước đã ký `tvhk_do_khoi` ghim hộp đó); mở việc riêng.
