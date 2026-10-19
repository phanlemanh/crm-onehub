---
slug: tin-hieu-tu-ve-kho
at: 2026-10-14T02:51:24Z
route: http://localhost:3390/proto/tin-hieu-tu-ve-kho
material: real-components
context: static-frame
context_scenes: [evidence/design-pass/ST-danh-sach-co-khoa-keo--desktop-1280--light.png, evidence/design-pass/ST-danh-sach-co-khoa-keo--mobile-375--light.png]
reaction: nac-1 (ảnh không đồng bộ — gói ảnh đính kèm lời mời Cổng Phạm vi, chủ kho phản ứng lúc duyệt)
options:
divergence: skipped — khuôn có sẵn: chọn phạm vi khoá ngay trong tờ tạo khoá và ghi loại cạnh tên trên danh sách, theo nếp Stripe restricted keys; trang Khoá API giữ nguyên khuôn danh sách + tờ tạo
ds_skill: web-design-guidelines
states: [ST-tao-khoa-quan-tri, ST-tao-khoa-chon-keo, ST-tao-khoa-thanh-vien, ST-tao-khoa-dang-tao, ST-khoa-moi-keo-tin-hieu, ST-danh-sach-co-khoa-keo]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 3
deferred: 2
---
# design-pass — tin-hieu-tu-ve-kho

Bản mẫu ghép từ đúng các mảnh sẽ chạy thật: tờ tạo khoá `to-tao-khoa.tsx`, mục chọn loại và nhãn `loai-khoa.tsx`, hộp khoá
vừa tạo `created-api-key-dialog.tsx` (thư mục `apps/app/app/(app)/[slug]/settings/api-keys/`). Trang thật đã dùng chung tờ
tạo khoá; mục chọn loại còn tắt ở trang thật tới khi máy chủ trả quyền (S3). Danh sách trong bản mẫu là bảng tĩnh dữ liệu giả
bọc trong đầu trang thật — trang thật dùng `DataTable` của nó, vòng này chỉ thêm nhãn.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-tao-khoa-quan-tri | desktop-1280 | light | evidence/design-pass/ST-tao-khoa-quan-tri--desktop-1280--light.png |
| ST-tao-khoa-quan-tri | desktop-1280 | dark | evidence/design-pass/ST-tao-khoa-quan-tri--desktop-1280--dark.png |
| ST-tao-khoa-quan-tri | mobile-375 | light | evidence/design-pass/ST-tao-khoa-quan-tri--mobile-375--light.png |
| ST-tao-khoa-quan-tri | mobile-375 | dark | evidence/design-pass/ST-tao-khoa-quan-tri--mobile-375--dark.png |
| ST-tao-khoa-chon-keo | desktop-1280 | light | evidence/design-pass/ST-tao-khoa-chon-keo--desktop-1280--light.png |
| ST-tao-khoa-chon-keo | desktop-1280 | dark | evidence/design-pass/ST-tao-khoa-chon-keo--desktop-1280--dark.png |
| ST-tao-khoa-chon-keo | mobile-375 | light | evidence/design-pass/ST-tao-khoa-chon-keo--mobile-375--light.png |
| ST-tao-khoa-chon-keo | mobile-375 | dark | evidence/design-pass/ST-tao-khoa-chon-keo--mobile-375--dark.png |
| ST-tao-khoa-thanh-vien | desktop-1280 | light | evidence/design-pass/ST-tao-khoa-thanh-vien--desktop-1280--light.png |
| ST-tao-khoa-thanh-vien | desktop-1280 | dark | evidence/design-pass/ST-tao-khoa-thanh-vien--desktop-1280--dark.png |
| ST-tao-khoa-thanh-vien | mobile-375 | light | evidence/design-pass/ST-tao-khoa-thanh-vien--mobile-375--light.png |
| ST-tao-khoa-thanh-vien | mobile-375 | dark | evidence/design-pass/ST-tao-khoa-thanh-vien--mobile-375--dark.png |
| ST-tao-khoa-dang-tao | desktop-1280 | light | evidence/design-pass/ST-tao-khoa-dang-tao--desktop-1280--light.png |
| ST-tao-khoa-dang-tao | desktop-1280 | dark | evidence/design-pass/ST-tao-khoa-dang-tao--desktop-1280--dark.png |
| ST-tao-khoa-dang-tao | mobile-375 | light | evidence/design-pass/ST-tao-khoa-dang-tao--mobile-375--light.png |
| ST-tao-khoa-dang-tao | mobile-375 | dark | evidence/design-pass/ST-tao-khoa-dang-tao--mobile-375--dark.png |
| ST-khoa-moi-keo-tin-hieu | desktop-1280 | light | evidence/design-pass/ST-khoa-moi-keo-tin-hieu--desktop-1280--light.png |
| ST-khoa-moi-keo-tin-hieu | desktop-1280 | dark | evidence/design-pass/ST-khoa-moi-keo-tin-hieu--desktop-1280--dark.png |
| ST-khoa-moi-keo-tin-hieu | mobile-375 | light | evidence/design-pass/ST-khoa-moi-keo-tin-hieu--mobile-375--light.png |
| ST-khoa-moi-keo-tin-hieu | mobile-375 | dark | evidence/design-pass/ST-khoa-moi-keo-tin-hieu--mobile-375--dark.png |
| ST-danh-sach-co-khoa-keo | desktop-1280 | light | evidence/design-pass/ST-danh-sach-co-khoa-keo--desktop-1280--light.png |
| ST-danh-sach-co-khoa-keo | desktop-1280 | dark | evidence/design-pass/ST-danh-sach-co-khoa-keo--desktop-1280--dark.png |
| ST-danh-sach-co-khoa-keo | mobile-375 | light | evidence/design-pass/ST-danh-sach-co-khoa-keo--mobile-375--light.png |
| ST-danh-sach-co-khoa-keo | mobile-375 | dark | evidence/design-pass/ST-danh-sach-co-khoa-keo--mobile-375--dark.png |

## Cảnh ngữ-cảnh

- `evidence/design-pass/ST-danh-sach-co-khoa-keo--desktop-1280--light.png` và bản 375 — đầu trang Khoá API thật (tiêu đề, câu mô tả) bọc danh sách; mọi trạng thái tờ và hộp mở chồng lên đúng khung đó.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Câu mô tả của tờ tạo khoá với quản trị đổi sang «Chọn khoá dùng để làm gì, rồi đặt tên.» — câu cũ «Khoá hành động thay bạn» sai với khoá chỉ-kéo; mỗi lựa chọn tự mang câu mô tả của nó.
- Câu mô tả đầu trang đổi «Mỗi khoá hành động thay bạn» → «Khoá thường hành động thay bạn» (vi và en).
- Lời dặn trong hộp khoá vừa tạo dùng `Alert` của `packages/ui` thay đoạn chữ tự đặt cỡ.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Nền tối: lớp phủ sau tờ và hộp đen đặc, che hẳn trang — lỗi chung của bộ giao diện (U9, chân trời TH7), không sửa ở vòng này.
- Danh sách ở 375 cuộn ngang trong khung bảng (bản mẫu là bảng tĩnh); trang thật dùng `DataTable` hiện có, vòng này không đổi cách danh sách xuống dòng trên điện thoại.
