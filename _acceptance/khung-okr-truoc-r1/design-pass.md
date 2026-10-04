---
slug: khung-okr-truoc-r1
at: 2026-10-04T05:50:00Z
route: http://localhost:3310/proto/khung-okr-truoc-r1
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (anh-goi-kem-the-cong-pham-vi)
options:
divergence: skipped — mỗi lỗi có một hướng khuyên; hướng bỏ và lý do ở design doc mục «Đã cân», ảnh bản đang chạy (evidence/truoc/) đi kèm thẻ để người veto cả tiền đề
ds_skill: web-design-guidelines
states: [ST-khung-kr, ST-khung-tab, ST-khung-dienthoai, ST-danhsach-chip, ST-donvi-soan-tiep, ST-donvi-soan-chuacauhinh, ST-donvi-soan-dangtai, ST-hienthi-hoilai]
breakpoints: [mobile-375, desktop-1440]
themes: [light]
patched: 1
deferred: 3
---
# design-pass — khung-okr-truoc-r1

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-khung-kr | desktop-1440 | light | evidence/design-pass/ST-khung-kr--desktop-1440--light.png |
| ST-khung-kr | mobile-375 | light | evidence/design-pass/ST-khung-kr--mobile-375--light.png |
| ST-khung-tab | desktop-1440 | light | evidence/design-pass/ST-khung-tab--desktop-1440--light.png |
| ST-khung-tab | mobile-375 | light | evidence/design-pass/ST-khung-tab--mobile-375--light.png |
| ST-khung-dienthoai | mobile-375 | light | evidence/design-pass/ST-khung-dienthoai--mobile-375--light.png |
| ST-khung-dienthoai (đã cuộn 400 px) | mobile-375 | light | evidence/design-pass/ST-khung-dienthoai-cuon--mobile-375--light.png |
| ST-khung-dienthoai | desktop-1440 | light | evidence/design-pass/ST-khung-dienthoai--desktop-1440--light.png |
| ST-danhsach-chip | desktop-1440 | light | evidence/design-pass/ST-danhsach-chip--desktop-1440--light.png |
| ST-danhsach-chip | mobile-375 | light | evidence/design-pass/ST-danhsach-chip--mobile-375--light.png |
| ST-donvi-soan-tiep | desktop-1440 | light | evidence/design-pass/ST-donvi-soan-tiep--desktop-1440--light.png |
| ST-donvi-soan-tiep | mobile-375 | light | evidence/design-pass/ST-donvi-soan-tiep--mobile-375--light.png |
| ST-donvi-soan-chuacauhinh | desktop-1440 | light | evidence/design-pass/ST-donvi-soan-chuacauhinh--desktop-1440--light.png |
| ST-donvi-soan-chuacauhinh | mobile-375 | light | evidence/design-pass/ST-donvi-soan-chuacauhinh--mobile-375--light.png |
| ST-donvi-soan-dangtai | desktop-1440 | light | evidence/design-pass/ST-donvi-soan-dangtai--desktop-1440--light.png |
| ST-donvi-soan-dangtai | mobile-375 | light | evidence/design-pass/ST-donvi-soan-dangtai--mobile-375--light.png |
| ST-hienthi-hoilai | desktop-1440 | light | evidence/design-pass/ST-hienthi-hoilai--desktop-1440--light.png |
| ST-hienthi-hoilai | mobile-375 | light | evidence/design-pass/ST-hienthi-hoilai--mobile-375--light.png |

Ảnh bản đang chạy để so: `evidence/truoc/` (khảo sát và lái thử production 04/10).

## Cảnh ngữ-cảnh

- Không cần: bản mẫu chạy trong host thật (`/proto` sau cờ `PROTO_ROUTE`), bọc khung ứng dụng OKR của bản mẫu `ban-mau-okr`.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Nhóm soạn dời về cuối thanh bằng `ml-auto`, để khi chữ nút đổi («Soạn…» ↔ «Tiếp…») không nút nào khác bị đẩy.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `Badge` chưa có hover/focus khi là `button` (chỉ có cho `a`) — thêm trong `packages/ui/src/components/badge.tsx`.
- `DrawerHeader` căn giữa cứng ở ngăn kéo dưới — thêm tuỳ chọn căn trái trong `packages/ui/src/components/drawer.tsx`.
- Ở ngăn kéo dưới, tay nắm của `DrawerContent` đè lên thanh tab khi tab dính ở mép trên (ảnh `ST-khung-dienthoai-cuon`); bản thật phải đặt mốc dính dưới tay nắm.
