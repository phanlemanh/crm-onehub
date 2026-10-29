---
slug: bo-okr-chi-don-vi
at: 2026-10-28T05:28:16Z
route: http://localhost:3337/proto/bo-okr-chi-don-vi
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (ghim)
options:
divergence: skipped — hướng đã chốt bởi Q1–Q8 của chủ kho 25/10 và luật màn «Dòng vị trí», «Hàng công cụ» trong docs/design.md
ds_skill: repo-tokens
states: [ST-bcd-khoi, ST-bcd-menu, ST-bcd-da-bo, ST-bcd-khoi-rong, ST-bcd-phong, ST-bcd-goc, ST-bcd-danh-sach, ST-bcd-hop-tuan-goc]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 2
deferred: 4
---
# design-pass — bo-okr-chi-don-vi

Bản mẫu ghép từ thành phần thật của `packages/ui` (PageShell, AreaSidebar, Breadcrumb, DropdownMenu, Tabs, StatGroup,
DataTable, Empty, SimpleTable, Item) trong khung tĩnh của khu Mục tiêu, dữ liệu mẫu viết sẵn trong module. Chụp bằng
`rang/chup-proto.mjs` (Chrome không giao diện), 32 ảnh, 0 ảnh tràn ngang. Hai trạng thái `ST-bcd-hop-tuan` và
`ST-bcd-mot-bo` nhận `?don=` để bấm menu đi khắp cây; không chụp riêng.

Skill `ux-ui-craft` không nạp trọn ở phiên này: sàn truy cập dựa vào thành phần thật (`DropdownMenu` đủ phím, nút
`aria-pressed`, `translate="no"` trên tên đơn vị).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-bcd-khoi | desktop-1280 | light | evidence/design-pass/ST-bcd-khoi--desktop-1280--light.png |
| ST-bcd-menu | desktop-1280 | light | evidence/design-pass/ST-bcd-menu--desktop-1280--light.png |
| ST-bcd-da-bo | desktop-1280 | light | evidence/design-pass/ST-bcd-da-bo--desktop-1280--light.png |
| ST-bcd-khoi-rong | desktop-1280 | light | evidence/design-pass/ST-bcd-khoi-rong--desktop-1280--light.png |
| ST-bcd-phong | desktop-1280 | light | evidence/design-pass/ST-bcd-phong--desktop-1280--light.png |
| ST-bcd-goc | desktop-1280 | light | evidence/design-pass/ST-bcd-goc--desktop-1280--light.png |
| ST-bcd-danh-sach | desktop-1280 | light | evidence/design-pass/ST-bcd-danh-sach--desktop-1280--light.png |
| ST-bcd-hop-tuan-goc | desktop-1280 | light | evidence/design-pass/ST-bcd-hop-tuan-goc--desktop-1280--light.png |
| ST-bcd-khoi | mobile-375 | light | evidence/design-pass/ST-bcd-khoi--mobile-375--light.png |
| ST-bcd-menu | mobile-375 | light | evidence/design-pass/ST-bcd-menu--mobile-375--light.png |
| ST-bcd-da-bo | mobile-375 | light | evidence/design-pass/ST-bcd-da-bo--mobile-375--light.png |
| ST-bcd-khoi-rong | mobile-375 | light | evidence/design-pass/ST-bcd-khoi-rong--mobile-375--light.png |
| ST-bcd-phong | mobile-375 | light | evidence/design-pass/ST-bcd-phong--mobile-375--light.png |
| ST-bcd-goc | mobile-375 | light | evidence/design-pass/ST-bcd-goc--mobile-375--light.png |
| ST-bcd-danh-sach | mobile-375 | light | evidence/design-pass/ST-bcd-danh-sach--mobile-375--light.png |
| ST-bcd-hop-tuan-goc | mobile-375 | light | evidence/design-pass/ST-bcd-hop-tuan-goc--mobile-375--light.png |
| ST-bcd-khoi | desktop-1280 | dark | evidence/design-pass/ST-bcd-khoi--desktop-1280--dark.png |
| ST-bcd-menu | desktop-1280 | dark | evidence/design-pass/ST-bcd-menu--desktop-1280--dark.png |
| ST-bcd-da-bo | desktop-1280 | dark | evidence/design-pass/ST-bcd-da-bo--desktop-1280--dark.png |
| ST-bcd-khoi-rong | desktop-1280 | dark | evidence/design-pass/ST-bcd-khoi-rong--desktop-1280--dark.png |
| ST-bcd-phong | desktop-1280 | dark | evidence/design-pass/ST-bcd-phong--desktop-1280--dark.png |
| ST-bcd-goc | desktop-1280 | dark | evidence/design-pass/ST-bcd-goc--desktop-1280--dark.png |
| ST-bcd-danh-sach | desktop-1280 | dark | evidence/design-pass/ST-bcd-danh-sach--desktop-1280--dark.png |
| ST-bcd-hop-tuan-goc | desktop-1280 | dark | evidence/design-pass/ST-bcd-hop-tuan-goc--desktop-1280--dark.png |
| ST-bcd-khoi | mobile-375 | dark | evidence/design-pass/ST-bcd-khoi--mobile-375--dark.png |
| ST-bcd-menu | mobile-375 | dark | evidence/design-pass/ST-bcd-menu--mobile-375--dark.png |
| ST-bcd-da-bo | mobile-375 | dark | evidence/design-pass/ST-bcd-da-bo--mobile-375--dark.png |
| ST-bcd-khoi-rong | mobile-375 | dark | evidence/design-pass/ST-bcd-khoi-rong--mobile-375--dark.png |
| ST-bcd-phong | mobile-375 | dark | evidence/design-pass/ST-bcd-phong--mobile-375--dark.png |
| ST-bcd-goc | mobile-375 | dark | evidence/design-pass/ST-bcd-goc--mobile-375--dark.png |
| ST-bcd-danh-sach | mobile-375 | dark | evidence/design-pass/ST-bcd-danh-sach--mobile-375--dark.png |
| ST-bcd-hop-tuan-goc | mobile-375 | dark | evidence/design-pass/ST-bcd-hop-tuan-goc--mobile-375--dark.png |

## Cảnh ngữ-cảnh

- Không cần: bản mẫu đứng trong khung tĩnh của khu Mục tiêu (thanh bên khu, đầu trang, dòng vị trí, thẻ con) — nấc `static-frame`.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Mục menu dòng vị trí xếp hai dòng (tên trên, số mục tiêu dưới) thay một hàng: ở bề rộng menu mặc định tên dài bị cắt và số xuống dòng lộn xộn.
- Nút «Đã bỏ (n)» hiện ngay trên hàng công cụ ở 375 (bản dưới `sm` đặt ở ô tìm kiếm của `DataTable`, như nút Mở tất cả của VK8); trước đó nó nằm trong «Lọc» đóng, người dùng điện thoại không thấy.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `BreadcrumbMenu` mới trong `packages/ui`: mắt xích mở `DropdownMenu`, mang bề rộng menu (bản mẫu đặt tạm `w-72` tối đa bề ngang màn trừ lề trên `DropdownMenuContent`, vì min-width 8rem mặc định làm tên đơn vị dài vỡ dòng). Đề xuất: dựng ở S3 theo dòng sổ bậc 5.
- `design_pass.ds_skill` = `web-design-guidelines` không giải được thành skill nào ở phiên này — phiên chạy trên từ vựng token của kho (`packages/ui`). Đề xuất: khai đúng tên skill hay bỏ khoá.
- Hàng số của bộ phận chưa có mục tiêu riêng hiện «0/0» ở ô KR đã cập nhật (cách VK8 vẽ bộ rỗng); HT1 cấm «0/0» ở Họp tuần. Đề xuất: ghi Known limits cho vòng này, sửa cùng VK8 nếu chủ kho muốn đồng bộ.
- Câu rỗng trong `DataTable` dính sát hàng tiêu đề bảng (không đệm trên) — thành phần nền, không riêng màn này. Đề xuất: ghi Known limits.
