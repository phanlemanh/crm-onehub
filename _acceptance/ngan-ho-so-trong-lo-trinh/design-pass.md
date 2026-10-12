---
slug: ngan-ho-so-trong-lo-trinh
at: 2026-10-12T01:45:16Z
route: http://localhost:<cổng trống>/proto/ngan-ho-so-trong-lo-trinh (rang/chup.mjs tự dựng app của cây với PROTO_ROUTE=1)
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong)
options:
divergence: skipped — khuôn có sẵn: ngăn việc của LT1 (họ DetailSheet), chỉ thêm hai phần vào thân ngăn, một hướng hiển nhiên
ds_skill: web-design-guidelines
states: [ST-ngan-day-du, ST-ngan-chu-kho, ST-ngan-o-vang, ST-ngan-chua-co-tom-tat, ST-ngan-khuon-cu, ST-ngan-doan-dai]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 1
deferred: 2
---
# design-pass — ngan-ho-so-trong-lo-trinh

Bản mẫu dựng trang Lộ trình thật (`NoiDungLoTrinh`) và ngăn việc thật (`HoSoViec` có thêm «Tóm tắt hồ sơ» và
«Số liệu làm việc») trên khối dữ liệu bản 2 do bộ vẽ của kit nhánh chính `7f65e5a0` vẽ trên bản sao crm
`27d47de04` (`apps/app/test/fixtures/lo-trinh/x2/`, máy sinh). Trạng thái chủ kho / mọi người đi qua đúng hàm lọc
`choVaiXem` mà trang máy chủ sẽ dùng. Chạy trong app thật sau cờ `PROTO_ROUTE`; thiếu thanh điều hướng của app.

Mỗi ảnh qua phép đo DOM của `rang/chup.mjs`: phần tóm tắt đứng trước «Chi tiết», «Số liệu làm việc» chỉ ở trạng
thái chủ kho và đứng ngay sau tóm tắt, ô vắng của 4n hiện «Chưa có», chữ của dải và mã commit mang dấu không dịch,
trang và ngăn không cuộn ngang — 24/24 ô đạt.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-ngan-day-du | desktop-1280 | light | evidence/design-pass/ST-ngan-day-du--desktop-1280--light.png |
| ST-ngan-chu-kho | desktop-1280 | light | evidence/design-pass/ST-ngan-chu-kho--desktop-1280--light.png |
| ST-ngan-o-vang | desktop-1280 | light | evidence/design-pass/ST-ngan-o-vang--desktop-1280--light.png |
| ST-ngan-chua-co-tom-tat | desktop-1280 | light | evidence/design-pass/ST-ngan-chua-co-tom-tat--desktop-1280--light.png |
| ST-ngan-khuon-cu | desktop-1280 | light | evidence/design-pass/ST-ngan-khuon-cu--desktop-1280--light.png |
| ST-ngan-doan-dai | desktop-1280 | light | evidence/design-pass/ST-ngan-doan-dai--desktop-1280--light.png |
| ST-ngan-day-du | mobile-375 | light | evidence/design-pass/ST-ngan-day-du--mobile-375--light.png |
| ST-ngan-chu-kho | mobile-375 | light | evidence/design-pass/ST-ngan-chu-kho--mobile-375--light.png |
| ST-ngan-o-vang | mobile-375 | light | evidence/design-pass/ST-ngan-o-vang--mobile-375--light.png |
| ST-ngan-chua-co-tom-tat | mobile-375 | light | evidence/design-pass/ST-ngan-chua-co-tom-tat--mobile-375--light.png |
| ST-ngan-khuon-cu | mobile-375 | light | evidence/design-pass/ST-ngan-khuon-cu--mobile-375--light.png |
| ST-ngan-doan-dai | mobile-375 | light | evidence/design-pass/ST-ngan-doan-dai--mobile-375--light.png |
| ST-ngan-day-du | desktop-1280 | dark | evidence/design-pass/ST-ngan-day-du--desktop-1280--dark.png |
| ST-ngan-chu-kho | desktop-1280 | dark | evidence/design-pass/ST-ngan-chu-kho--desktop-1280--dark.png |
| ST-ngan-o-vang | desktop-1280 | dark | evidence/design-pass/ST-ngan-o-vang--desktop-1280--dark.png |
| ST-ngan-chua-co-tom-tat | desktop-1280 | dark | evidence/design-pass/ST-ngan-chua-co-tom-tat--desktop-1280--dark.png |
| ST-ngan-khuon-cu | desktop-1280 | dark | evidence/design-pass/ST-ngan-khuon-cu--desktop-1280--dark.png |
| ST-ngan-doan-dai | desktop-1280 | dark | evidence/design-pass/ST-ngan-doan-dai--desktop-1280--dark.png |
| ST-ngan-day-du | mobile-375 | dark | evidence/design-pass/ST-ngan-day-du--mobile-375--dark.png |
| ST-ngan-chu-kho | mobile-375 | dark | evidence/design-pass/ST-ngan-chu-kho--mobile-375--dark.png |
| ST-ngan-o-vang | mobile-375 | dark | evidence/design-pass/ST-ngan-o-vang--mobile-375--dark.png |
| ST-ngan-chua-co-tom-tat | mobile-375 | dark | evidence/design-pass/ST-ngan-chua-co-tom-tat--mobile-375--dark.png |
| ST-ngan-khuon-cu | mobile-375 | dark | evidence/design-pass/ST-ngan-khuon-cu--mobile-375--dark.png |
| ST-ngan-doan-dai | mobile-375 | dark | evidence/design-pass/ST-ngan-doan-dai--mobile-375--dark.png |

## Cảnh ngữ-cảnh

- Không cần: bản mẫu nhúng host thật — chính trang Lộ trình của app, ngăn mở từ danh sách như người dùng mở.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Nhãn «Quyết định của máy» / «Quyết định của người» bị cắt ở cột nhãn 6,5rem khi hai cột (1280) → đổi chữ thành «Máy quyết» / «Người quyết» (en «Machine calls» / «Human calls»); không đổi độ rộng cột.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Nhãn «Coi là thành công khi» của LT1 bị cắt ở cột nhãn 6,5rem của `DetailSheetProperty` (cả hai khổ), và «Trạng thái» ở dải số 375 thành «Trạng th…» — có sẵn từ LT1, ngoài phạm vi vòng này; sửa ở họ `DetailSheet` (nhãn xuống dòng thay vì cắt) là việc riêng.
- Ô «Vì sao làm» dài (R1g 1.311 ký tự) chiếm gần một màn ở 375 — không thu gọn ở lượt này (sổ quyết định d-20261012T013218Z-2); đo ở phiên nghiệm thu.
