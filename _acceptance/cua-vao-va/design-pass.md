---
slug: cua-vao-va
at: 2026-10-04T21:30:39Z
route: http://localhost:3330/proto/cua-vao-va
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (anh — gói ảnh gửi kèm thẻ Cổng Phạm vi)
options:
divergence: skipped — trang Quên mật khẩu đi theo khối tiêu đề AuthHeading có sẵn; trang lỗi theo khuôn Empty + một nút chính của @crm/ui; không có hướng thứ hai đáng bày
ds_skill: web-design-guidelines
states: [ST-quen-mat-khau-nhap, ST-quen-mat-khau-da-gui, ST-trang-loi-trong-khung, ST-trang-loi-dang-thu, ST-trang-loi-ngoai-khung]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 2
deferred: 1
---
# design-pass — cua-vao-va

Bản mẫu ghép từ component thật của `@crm/ui` (`LogoLockup`, `Field`, `Input`, `Button`, `Empty`,
`Spinner`) trong khung tĩnh: cột giữa của trang cửa vào, và một dải ghi chỗ đầu trang + thanh biểu
tượng của app cho trang lỗi trong khung. 20 ảnh, không ảnh nào tràn ngang (scrollWidth − clientWidth
= 0 ở mọi ô). Lệnh chụp: `.acceptance-runs/cua-vao-va/chup-proto.mjs` (THEME=light|dark).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-quen-mat-khau-da-gui | desktop-1280 | dark | evidence/design-pass/ST-quen-mat-khau-da-gui--desktop-1280--dark.png |
| ST-quen-mat-khau-da-gui | desktop-1280 | light | evidence/design-pass/ST-quen-mat-khau-da-gui--desktop-1280--light.png |
| ST-quen-mat-khau-da-gui | mobile-375 | dark | evidence/design-pass/ST-quen-mat-khau-da-gui--mobile-375--dark.png |
| ST-quen-mat-khau-da-gui | mobile-375 | light | evidence/design-pass/ST-quen-mat-khau-da-gui--mobile-375--light.png |
| ST-quen-mat-khau-nhap | desktop-1280 | dark | evidence/design-pass/ST-quen-mat-khau-nhap--desktop-1280--dark.png |
| ST-quen-mat-khau-nhap | desktop-1280 | light | evidence/design-pass/ST-quen-mat-khau-nhap--desktop-1280--light.png |
| ST-quen-mat-khau-nhap | mobile-375 | dark | evidence/design-pass/ST-quen-mat-khau-nhap--mobile-375--dark.png |
| ST-quen-mat-khau-nhap | mobile-375 | light | evidence/design-pass/ST-quen-mat-khau-nhap--mobile-375--light.png |
| ST-trang-loi-dang-thu | desktop-1280 | dark | evidence/design-pass/ST-trang-loi-dang-thu--desktop-1280--dark.png |
| ST-trang-loi-dang-thu | desktop-1280 | light | evidence/design-pass/ST-trang-loi-dang-thu--desktop-1280--light.png |
| ST-trang-loi-dang-thu | mobile-375 | dark | evidence/design-pass/ST-trang-loi-dang-thu--mobile-375--dark.png |
| ST-trang-loi-dang-thu | mobile-375 | light | evidence/design-pass/ST-trang-loi-dang-thu--mobile-375--light.png |
| ST-trang-loi-ngoai-khung | desktop-1280 | dark | evidence/design-pass/ST-trang-loi-ngoai-khung--desktop-1280--dark.png |
| ST-trang-loi-ngoai-khung | desktop-1280 | light | evidence/design-pass/ST-trang-loi-ngoai-khung--desktop-1280--light.png |
| ST-trang-loi-ngoai-khung | mobile-375 | dark | evidence/design-pass/ST-trang-loi-ngoai-khung--mobile-375--dark.png |
| ST-trang-loi-ngoai-khung | mobile-375 | light | evidence/design-pass/ST-trang-loi-ngoai-khung--mobile-375--light.png |
| ST-trang-loi-trong-khung | desktop-1280 | dark | evidence/design-pass/ST-trang-loi-trong-khung--desktop-1280--dark.png |
| ST-trang-loi-trong-khung | desktop-1280 | light | evidence/design-pass/ST-trang-loi-trong-khung--desktop-1280--light.png |
| ST-trang-loi-trong-khung | mobile-375 | dark | evidence/design-pass/ST-trang-loi-trong-khung--mobile-375--dark.png |
| ST-trang-loi-trong-khung | mobile-375 | light | evidence/design-pass/ST-trang-loi-trong-khung--mobile-375--light.png |

## Cảnh ngữ-cảnh

- Không áp: nấc `static-frame` (bản mẫu đứng trong khung cửa vào và dải chỗ khung app), không phải `standalone`.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Trang lỗi không có tiêu đề ngữ nghĩa vì `EmptyTitle` là `div` — gắn `role="heading"` `aria-level={1}` (thuộc tính, không đổi `className`); luật «heading hierarchy» của web-design-guidelines.
- Chuyển «Thử lại» → «Đang thử lại…» không được đọc cho trình đọc màn hình — gắn `aria-live="polite"` lên `Empty`.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `EmptyTitle` của `packages/ui` không có cách khai cấp tiêu đề; mỗi nơi dùng nó làm tiêu đề trang phải tự gắn `role="heading"`. Đề xuất: prop `level` (hoặc `asChild`) trong `packages/ui/src/components/empty.tsx` ở một vòng riêng — vòng này giữ cách gắn thuộc tính.
