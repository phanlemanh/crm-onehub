---
slug: hop-tuan-mo-dung-bo
at: 2026-10-23T22:30:04Z
route: http://localhost:3302/proto/hop-tuan-mo-dung-bo
material: real-components
context: static-frame
context_scenes: []
reaction: nac-2 (gui-anh-va-link-ban-mau)
options:
divergence: skipped — khuôn có sẵn: hàng số theo nếp «Ô số tổng quan» (StatGroup như Toàn cảnh), màn rỗng theo Empty và Item của docs/design.md; chỗ chọn còn mở đã nằm ở Hỏi-1…4
ds_skill: web-design-guidelines
states: [ST-htmb-cua-toi, ST-htmb-the-okr, ST-htmb-bo-okr-toi-dan, ST-htmb-hom-nay, ST-htmb-co-du-lieu, ST-htmb-chua-kr-onehub, ST-htmb-chua-kr-phong-ban, ST-htmb-chu-ky-chua-chay, ST-htmb-chua-ai-cap-nhat, ST-htmb-dang-tai]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 3
deferred: 1
---
# design-pass — hop-tuan-mo-dung-bo

Chủ kho gọi ở Cổng Phạm vi 24/10: «Tạo proto cho tôi xem». Bản mẫu `/proto/hop-tuan-mo-dung-bo` dựng bằng thành phần
thật của `packages/ui` (AreaSidebar, PageShell, Tabs dạng gạch chân, StatGroup/StatCard, SimpleTable, Empty, Item)
trong khung tĩnh của khu Mục tiêu theo VK3 (thanh bên, dòng vị trí «Bộ OKR › …», thẻ con). Dữ liệu giả, không tRPC.
Trạng thái «Hôm nay» là màn production 22/10, để so trước và sau. Chạy: cấu hình `proto-cay-nay` của
`.claude/launch.json` (cổng 3302, `PROTO_ROUTE=1`).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-htmb-cua-toi | desktop-1280 | light | evidence/design-pass/cua-toi--desktop-1280--light.png |
| ST-htmb-cua-toi | desktop-1280 | dark | evidence/design-pass/cua-toi--desktop-1280--dark.png |
| ST-htmb-cua-toi | mobile-375 | light | evidence/design-pass/cua-toi--mobile-375--light.png |
| ST-htmb-cua-toi | mobile-375 | dark | evidence/design-pass/cua-toi--mobile-375--dark.png |
| ST-htmb-the-okr | desktop-1280 | light | evidence/design-pass/the-okr--desktop-1280--light.png |
| ST-htmb-the-okr | desktop-1280 | dark | evidence/design-pass/the-okr--desktop-1280--dark.png |
| ST-htmb-the-okr | mobile-375 | light | evidence/design-pass/the-okr--mobile-375--light.png |
| ST-htmb-the-okr | mobile-375 | dark | evidence/design-pass/the-okr--mobile-375--dark.png |
| ST-htmb-bo-okr-toi-dan | desktop-1280 | light | evidence/design-pass/bo-okr-toi-dan--desktop-1280--light.png |
| ST-htmb-bo-okr-toi-dan | desktop-1280 | dark | evidence/design-pass/bo-okr-toi-dan--desktop-1280--dark.png |
| ST-htmb-bo-okr-toi-dan | mobile-375 | light | evidence/design-pass/bo-okr-toi-dan--mobile-375--light.png |
| ST-htmb-bo-okr-toi-dan | mobile-375 | dark | evidence/design-pass/bo-okr-toi-dan--mobile-375--dark.png |
| ST-htmb-hom-nay | desktop-1280 | light | evidence/design-pass/hom-nay--desktop-1280--light.png |
| ST-htmb-hom-nay | desktop-1280 | dark | evidence/design-pass/hom-nay--desktop-1280--dark.png |
| ST-htmb-hom-nay | mobile-375 | light | evidence/design-pass/hom-nay--mobile-375--light.png |
| ST-htmb-hom-nay | mobile-375 | dark | evidence/design-pass/hom-nay--mobile-375--dark.png |
| ST-htmb-co-du-lieu | desktop-1280 | light | evidence/design-pass/co-du-lieu--desktop-1280--light.png |
| ST-htmb-co-du-lieu | desktop-1280 | dark | evidence/design-pass/co-du-lieu--desktop-1280--dark.png |
| ST-htmb-co-du-lieu | mobile-375 | light | evidence/design-pass/co-du-lieu--mobile-375--light.png |
| ST-htmb-co-du-lieu | mobile-375 | dark | evidence/design-pass/co-du-lieu--mobile-375--dark.png |
| ST-htmb-chua-kr-onehub | desktop-1280 | light | evidence/design-pass/chua-kr-onehub--desktop-1280--light.png |
| ST-htmb-chua-kr-onehub | desktop-1280 | dark | evidence/design-pass/chua-kr-onehub--desktop-1280--dark.png |
| ST-htmb-chua-kr-onehub | mobile-375 | light | evidence/design-pass/chua-kr-onehub--mobile-375--light.png |
| ST-htmb-chua-kr-onehub | mobile-375 | dark | evidence/design-pass/chua-kr-onehub--mobile-375--dark.png |
| ST-htmb-chua-kr-phong-ban | desktop-1280 | light | evidence/design-pass/chua-kr-phong-ban--desktop-1280--light.png |
| ST-htmb-chua-kr-phong-ban | desktop-1280 | dark | evidence/design-pass/chua-kr-phong-ban--desktop-1280--dark.png |
| ST-htmb-chua-kr-phong-ban | mobile-375 | light | evidence/design-pass/chua-kr-phong-ban--mobile-375--light.png |
| ST-htmb-chua-kr-phong-ban | mobile-375 | dark | evidence/design-pass/chua-kr-phong-ban--mobile-375--dark.png |
| ST-htmb-chu-ky-chua-chay | desktop-1280 | light | evidence/design-pass/chu-ky-chua-chay--desktop-1280--light.png |
| ST-htmb-chu-ky-chua-chay | desktop-1280 | dark | evidence/design-pass/chu-ky-chua-chay--desktop-1280--dark.png |
| ST-htmb-chu-ky-chua-chay | mobile-375 | light | evidence/design-pass/chu-ky-chua-chay--mobile-375--light.png |
| ST-htmb-chu-ky-chua-chay | mobile-375 | dark | evidence/design-pass/chu-ky-chua-chay--mobile-375--dark.png |
| ST-htmb-chua-ai-cap-nhat | desktop-1280 | light | evidence/design-pass/chua-ai-cap-nhat--desktop-1280--light.png |
| ST-htmb-chua-ai-cap-nhat | desktop-1280 | dark | evidence/design-pass/chua-ai-cap-nhat--desktop-1280--dark.png |
| ST-htmb-chua-ai-cap-nhat | mobile-375 | light | evidence/design-pass/chua-ai-cap-nhat--mobile-375--light.png |
| ST-htmb-chua-ai-cap-nhat | mobile-375 | dark | evidence/design-pass/chua-ai-cap-nhat--mobile-375--dark.png |
| ST-htmb-dang-tai | desktop-1280 | light | evidence/design-pass/dang-tai--desktop-1280--light.png |
| ST-htmb-dang-tai | desktop-1280 | dark | evidence/design-pass/dang-tai--desktop-1280--dark.png |
| ST-htmb-dang-tai | mobile-375 | light | evidence/design-pass/dang-tai--mobile-375--light.png |
| ST-htmb-dang-tai | mobile-375 | dark | evidence/design-pass/dang-tai--mobile-375--dark.png |

## Cảnh ngữ-cảnh

- Khung tĩnh của khu Mục tiêu bọc mọi ảnh (thanh bên với «Bộ OKR» đang mở, dòng vị trí, hàng thẻ con) — nấc
  `static-frame`, không cần cảnh riêng. Chuyển hướng ở máy chủ không thấy được trên ảnh: E1 đo nó ở S4.

## Vòng phản ứng

- Vòng 1 (24/10): chủ kho «Bỏ mục Họp tuần trên thanh bên. Dùng đường dẫn vào bộ okr tương tự như Tability.» — bỏ mục
  khỏi thanh bên của bản mẫu, thêm trạng thái `ST-htmb-bo-okr-toi-dan` (Bộ OKR › Tôi dẫn), chụp lại 32 ảnh; hợp đồng,
  evals, thiết kế, hình `duong-vao` và sổ quyết định sửa theo.

- Vòng 2 (24/10): chủ kho «Kiểm tra thử xem đã có bộ proto đến chính xác thẻ họp tuần không?» — bấm thử thấy bản mẫu
  bấm bộ là nhảy thẳng vào Họp tuần, thẻ con OKR/Việc/Sơ đồ và «Của tôi» đều trỏ Họp tuần. Thêm `ST-htmb-the-okr`
  (thẻ OKR, nút «Cập nhật» từng KR) và `ST-htmb-cua-toi` (đơn vị bạn dẫn); bộ → thẻ OKR → thẻ con Họp tuần; thẻ con
  và mục thanh bên ngoài bản mẫu thì khoá. Bấm lại hai đường: đúng từng bước. Chụp 40 ảnh.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Dòng vị trí «Bộ OKR › …» nằm cùng hàng với tiêu đề trang — dời xuống ngay trên hàng thẻ con, như VK3.
- Ở 375 danh sách «Đơn vị có KR» nằm trong khối rỗng nên tên dài bị căn giữa — dời danh sách ra dưới khối rỗng, ẩn chữ
  «Mở Họp tuần» dưới `sm` (cả mục đã là liên kết).

- Đường bấm trong bản mẫu bỏ qua thẻ OKR và trỏ mọi thẻ con về Họp tuần — sửa ở vòng 2 (xem trên).

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Thanh tiến độ trong bản mẫu dùng `Progress` của `packages/ui` thay `ThanhTienDo` của app (có vạch «lẽ ra đã tới»):
  bản thật giữ `ThanhTienDo`; không đổi gì ở tầng component.
