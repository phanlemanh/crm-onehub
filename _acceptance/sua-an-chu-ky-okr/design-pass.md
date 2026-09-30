---
slug: sua-an-chu-ky-okr
at: 2026-09-30T05:44:44Z
route: http://localhost:3960/proto/sua-an-chu-ky-okr
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (anh gui kem the Cong Pham vi)
options:
divergence: skipped — bảng chu kỳ đã có menu «…» theo hàng từ lượt 7; Perdoo đặt Edit/Archive/Delete cadence cùng chỗ; không có hướng thứ hai đáng bày
ds_skill: web-design-guidelines
states: [ST-bang-an, ST-menu-trong, ST-menu-co-du-lieu, ST-menu-nam-con-quy, ST-menu-da-an, ST-sua-moi-o, ST-sua-chi-ten, ST-go, ST-an-ly-do, ST-hien-lai, ST-khong-quyen]
breakpoints: [mobile-390, desktop-1440]
themes: [light, dark]
patched: 1
deferred: 1
---
# design-pass — sua-an-chu-ky-okr

Bản mẫu dựng bằng component thật của `packages/ui` (bảng `SimpleTable`, menu
`DropdownMenu`, `Sheet`, `Dialog`, `ConfirmDialog`, `StatusIndicator`), đứng trong khung
thẻ «Chương trình OKR» của trang Cài đặt. Dữ liệu giả năm hàng: Năm 2026 (có dữ liệu, còn
hai quý hiện), Quý 3/2026 (đã đóng), Quý 4/2026 (có dữ liệu, đang chạy), Năm 2027 (trống,
lập kế hoạch), Năm 2026 (thử) (đã ẩn). Máy chủ bản mẫu chạy từ chính cây làm việc ở cổng
3960; ma trận chụp bằng `puppeteer-core`, 44 ảnh, 0 ảnh tràn ngang.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-bang-an | mobile-390 / desktop-1440 | light / dark | evidence/design-pass/ST-bang-an--<khổ>--<theme>.png |
| ST-menu-trong | mobile-390 / desktop-1440 | light / dark | evidence/design-pass/ST-menu-trong--<khổ>--<theme>.png |
| ST-menu-co-du-lieu | mobile-390 / desktop-1440 | light / dark | evidence/design-pass/ST-menu-co-du-lieu--<khổ>--<theme>.png |
| ST-menu-nam-con-quy | mobile-390 / desktop-1440 | light / dark | evidence/design-pass/ST-menu-nam-con-quy--<khổ>--<theme>.png |
| ST-menu-da-an | mobile-390 / desktop-1440 | light / dark | evidence/design-pass/ST-menu-da-an--<khổ>--<theme>.png |
| ST-sua-moi-o | mobile-390 / desktop-1440 | light / dark | evidence/design-pass/ST-sua-moi-o--<khổ>--<theme>.png |
| ST-sua-chi-ten | mobile-390 / desktop-1440 | light / dark | evidence/design-pass/ST-sua-chi-ten--<khổ>--<theme>.png |
| ST-go | mobile-390 / desktop-1440 | light / dark | evidence/design-pass/ST-go--<khổ>--<theme>.png |
| ST-an-ly-do | mobile-390 / desktop-1440 | light / dark | evidence/design-pass/ST-an-ly-do--<khổ>--<theme>.png |
| ST-hien-lai | mobile-390 / desktop-1440 | light / dark | evidence/design-pass/ST-hien-lai--<khổ>--<theme>.png |
| ST-khong-quyen | mobile-390 / desktop-1440 | light / dark | evidence/design-pass/ST-khong-quyen--<khổ>--<theme>.png |

## Cảnh ngữ-cảnh

- Không cần cảnh riêng: nấc `static-frame` — thẻ «Chu kỳ» đứng dưới thẻ «Chương trình OKR» như trang Cài đặt thật; bảng giữ đúng cột của `bang-chu-ky.tsx` hôm nay.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Hàng đã ẩn và hàng «Đã đóng» cùng tông `neutral` nên khó phân biệt: tên hàng đã ẩn đổi sang `text-muted-foreground`, dòng phụ ghi «Ẩn <ngày> lúc pha <pha> · <lý do>».

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `DatePicker` của `packages/ui` chưa có trạng thái tắt; sheet «Sửa» của chu kỳ có dữ liệu cần hai ô ngày tắt. Bản mẫu tạm dùng `Input` tắt hiện ngày. Đề xuất: thêm `disabled` vào `DatePicker` trong `packages/ui` (bậc 5 của «Vẽ tay là bậc cuối» — biến thể của component sẵn có), để ô tắt trông giống ô đang sửa được ở chu kỳ trống.
