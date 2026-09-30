---
slug: khung-tao-okr-nhu-deal
at: 2026-09-30T01:22:20Z
route: http://localhost:3300/proto/khung-tao-okr-nhu-deal
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — ảnh gửi kèm thẻ Cổng Phạm vi, chủ kho phản ứng lúc rảnh)
options:
divergence: skipped — khuôn có sẵn là ngăn tạo deal của chính kho, chủ kho đã chọn hướng trong đề bài
ds_skill: web-design-guidelines
states: [ST-khung-deal, ST-khung-tao-muc-tieu, ST-khung-sua-muc-tieu, ST-khung-them-kr, ST-khung-sua-kr, ST-khung-cot-muc-tieu, ST-khung-cot-kr, ST-khung-hoi-lai, ST-khung-url-sai]
breakpoints: [mobile-390, desktop-1440]
themes: [light]
patched: 1
deferred: 4
---
# design-pass — khung-tao-okr-nhu-deal

Bản mẫu chạy trong app thật sau cờ `PROTO_ROUTE=1` (cổng 3300 của cây này), ghép từ
`Sheet`, `ProposedChange`, `Field`, `Input`, `Select` thật của `packages/ui`. Khung Theo đơn vị
phía sau là khung dùng chung của bản mẫu OKR. Khổ chụp là 1440 và 390 — đúng hai khổ mà
AC-3 và AC-5 đo, thay cho 1280 và 375 mặc định của nghi thức.

Số đo trên bản mẫu (Chromium không giao diện): ở 1440 năm ngăn thường cùng rộng 384 px, bám
mép phải; hai ngăn có cột rộng 768 px; «Huỷ» nằm trái nút chính trên cùng hàng. Ở 390 mọi
ngăn rộng 293 px, nút chính trên «Huỷ». Không ảnh nào tràn ngang.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-khung-deal | desktop-1440 | light | evidence/design-pass/ST-khung-deal--desktop-1440.png |
| ST-khung-tao-muc-tieu | desktop-1440 | light | evidence/design-pass/ST-khung-tao-muc-tieu--desktop-1440.png |
| ST-khung-sua-muc-tieu | desktop-1440 | light | evidence/design-pass/ST-khung-sua-muc-tieu--desktop-1440.png |
| ST-khung-them-kr | desktop-1440 | light | evidence/design-pass/ST-khung-them-kr--desktop-1440.png |
| ST-khung-sua-kr | desktop-1440 | light | evidence/design-pass/ST-khung-sua-kr--desktop-1440.png |
| ST-khung-cot-muc-tieu | desktop-1440 | light | evidence/design-pass/ST-khung-cot-muc-tieu--desktop-1440.png |
| ST-khung-cot-kr | desktop-1440 | light | evidence/design-pass/ST-khung-cot-kr--desktop-1440.png |
| ST-khung-hoi-lai | desktop-1440 | light | evidence/design-pass/ST-khung-hoi-lai--desktop-1440.png |
| ST-khung-url-sai | desktop-1440 | light | evidence/design-pass/ST-khung-url-sai--desktop-1440.png |
| ST-khung-deal | mobile-390 | light | evidence/design-pass/ST-khung-deal--mobile-390.png |
| ST-khung-tao-muc-tieu | mobile-390 | light | evidence/design-pass/ST-khung-tao-muc-tieu--mobile-390.png |
| ST-khung-sua-muc-tieu | mobile-390 | light | evidence/design-pass/ST-khung-sua-muc-tieu--mobile-390.png |
| ST-khung-them-kr | mobile-390 | light | evidence/design-pass/ST-khung-them-kr--mobile-390.png |
| ST-khung-sua-kr | mobile-390 | light | evidence/design-pass/ST-khung-sua-kr--mobile-390.png |
| ST-khung-cot-muc-tieu | mobile-390 | light | evidence/design-pass/ST-khung-cot-muc-tieu--mobile-390.png |
| ST-khung-cot-kr | mobile-390 | light | evidence/design-pass/ST-khung-cot-kr--mobile-390.png |
| ST-khung-hoi-lai | mobile-390 | light | evidence/design-pass/ST-khung-hoi-lai--mobile-390.png |
| ST-khung-url-sai | mobile-390 | light | evidence/design-pass/ST-khung-url-sai--mobile-390.png |

## Cảnh ngữ-cảnh

- Không cần cảnh riêng: `context: host-embedded`, bản mẫu đứng trong khung app thật; các state sửa và thêm KR vẽ ngăn chồng lên khung chi tiết Mục tiêu như luồng thật.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Chữ của ngăn tạo deal trong bản mẫu đổi về đúng chữ của app («Thoả thuận mới», «Thêm thoả thuận», «Phụ trách») để so cùng khung trên cùng chữ.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `SheetFooter` hôm nay xếp dọc; bản mẫu vẽ tay chân một hàng dồn phải. Đề xuất: sửa `SheetFooter` trong `packages/ui` khớp `DialogFooter` và đảo bảy chỗ gọi (AC-4).
- Chưa có cỡ ngăn cho form cộng cột; bản mẫu dùng cỡ `lg` (768 px) thay 800 px. Đề xuất: cỡ `assist` trong `sheetContentVariants` (AC-5, AC-9).
- Chưa có thân ngăn chung; bản mẫu tự vẽ vùng cuộn và lưới hai cột. Đề xuất: `SheetBody` có `split` trong `packages/ui` (AC-9).
- Ở 390 mọi ngăn chỉ rộng ba phần tư màn (293 px), form KR mười ô thành cột dài. Đây là cỡ chung của mọi ngăn kể cả tạo deal; lượt này giữ để «cùng khung», xét lại cho mọi ngăn ở lượt riêng.
