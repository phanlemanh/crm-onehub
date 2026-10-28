---
slug: cam-xuc-tren-cap-nhat
at: 2026-10-27T08:55:44Z
route: http://localhost:3302/proto/cam-xuc-tren-cap-nhat
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (ghim — ảnh 1280 và 375 gửi cùng thẻ Cổng Phạm vi; chủ kho bấm thử bản mẫu khi rảnh theo docs/proto.md)
options:
divergence: skipped — cảm xúc là một hàng thêm vào dòng đã có của ba màn đã ký (VK12, HT1, VK7); bố cục chip + tooltip theo ReUI c-emoji-picker-3, không còn hai hướng máy không tự chắc
ds_skill: web-design-guidelines
states: [ST-camxuc-cng, ST-camxuc-nhieu, ST-camxuc-hop, ST-camxuc-ngan]
breakpoints: [mobile-375, desktop-1280]
themes: [light]
patched: 2
deferred: 1
---
# design-pass — cam-xuc-tren-cap-nhat

Bản mẫu chạy trên cây `dazzling-bohr-10e829` (app riêng ở cổng 3302, `PROTO_ROUTE=1`), dựng từ thành phần thật của
`packages/ui` (`Item`, `Toggle`, `Tooltip`, `Popover`, `ConfidenceIndicator`, `Progress`, `Card`). Dữ liệu viết sẵn
trong module, dùng lại dòng tin dày của bản mẫu VK12 (11 KR tên dài, 7 bộ OKR, lần cập nhật thay, ghi chú dài và trống) cộng
cảm xúc rải theo mức tự tin; một lần có đủ bốn loại với bảy người thả «Đồng ý»; một KR ở Họp tuần chưa có lần cập nhật.
Ảnh chụp bằng `rang/chup-design-pass.mjs` (puppeteer-core, Chrome, sáng, 1280×800 và 375×812 có cảm ứng); tràn ngang
đo bằng `scrollWidth - innerWidth` = 0 ở cả tám ảnh.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-camxuc-cng | desktop-1280 | light | evidence/design-pass/ST-camxuc-cng--desktop-1280.png |
| ST-camxuc-cng | mobile-375 | light | evidence/design-pass/ST-camxuc-cng--mobile-375.png |
| ST-camxuc-nhieu | desktop-1280 | light | evidence/design-pass/ST-camxuc-nhieu--desktop-1280.png |
| ST-camxuc-nhieu | mobile-375 | light | evidence/design-pass/ST-camxuc-nhieu--mobile-375.png |
| ST-camxuc-hop | desktop-1280 | light | evidence/design-pass/ST-camxuc-hop--desktop-1280.png |
| ST-camxuc-hop | mobile-375 | light | evidence/design-pass/ST-camxuc-hop--mobile-375.png |
| ST-camxuc-ngan | desktop-1280 | light | evidence/design-pass/ST-camxuc-ngan--desktop-1280.png |
| ST-camxuc-ngan | mobile-375 | light | evidence/design-pass/ST-camxuc-ngan--mobile-375.png |

## Cảnh ngữ-cảnh

- Không có — sổ quyết định có dòng «bỏ cảnh ngữ-cảnh — …»: ba màn chủ đã chạy và đã ký, vòng chỉ thêm một hàng trong dòng của chúng.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Tooltip 1280: tên loại «Đồng ý» gãy thành hai dòng cạnh danh sách tên — giữ tên loại trên một dòng (`whitespace-nowrap`).
- Bảng của nút «Thả cảm xúc» ở 375 chạm mép phải màn — thu bề rộng bảng từ `w-72` về `w-64`.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `packages/ui` chưa có thành phần hàng cảm xúc; bản mẫu ghép tạm tại chỗ từ `Toggle`, `Tooltip`, `Popover`. Đề xuất: dựng
  `ThanhCamXuc` trong `packages/ui` ở S3 (bậc 5 của docs/design.md, bố cục theo ReUI c-emoji-picker-3), như design doc.
