---
slug: keo-tha-thoa-thuan
at: 2026-09-23T11:20:00Z
route: http://localhost:3700/proto/keo-tha-thoa-thuan
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-2 (vat-bam-duoc)
options:
divergence: skipped — khuôn kanban cho phễu giai đoạn là khuôn có sẵn của ngành (HubSpot deals board, Pipedrive pipeline view) và của kho (Board ở màn 30 ngày đầu); không có hai hướng khả dĩ
ds_skill: web-design-guidelines
states: [ST-bangcot-coduLieu, ST-bangcot-cotrong, ST-bangcot-qua50, ST-bangcot-dangtai, ST-bangcot-loitai, ST-bangcot-tuchoi, ST-lydo-mo, ST-bangcot-dangkeo, ST-bangcot-dangluu]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 2
deferred: 5
---
# design-pass — keo-tha-thoa-thuan

Bản bấm được chạy trong host thật (`apps/app`, sau cờ `PROTO_ROUTE`) ở máy chủ dev của chính worktree này, cổng 3700 — kiểm bằng `lsof` cwd, không phải checkout chính. Vật liệu thật: `Kanban` của ReUI đã cài vào `packages/ui/src/components/reui/`, cùng `Button`, `DropdownMenu`, `Dialog`, `ToggleGroup`, `InputGroup`, `PersonAvatar`, `formatMoney` của kho. Dữ liệu giả, không tRPC. Nạp luật: `web-design-guidelines` (chuẩn DS của kho), `ux-ui-craft`, `docs/design.md`, `docs/reui.md`.

Kéo thả đã thử bằng sự kiện chuột thật trên Chrome: Demo booked → Decision maker in dời thẻ, số đếm và tổng hai cột đổi đúng (4→3, 1.350.000.000 → 1.050.000.000 ₫; 2→3). Không khổ nào tràn ngang ở cả 20 ảnh.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-bangcot-coduLieu | mobile-375 | light | evidence/design-pass/ST-bangcot-coduLieu--mobile-375--light.png |
| ST-bangcot-coduLieu | desktop-1280 | light | evidence/design-pass/ST-bangcot-coduLieu--desktop-1280--light.png |
| ST-bangcot-coduLieu | mobile-375 | dark | evidence/design-pass/ST-bangcot-coduLieu--mobile-375--dark.png |
| ST-bangcot-coduLieu | desktop-1280 | dark | evidence/design-pass/ST-bangcot-coduLieu--desktop-1280--dark.png |
| ST-bangcot-cotrong | mobile-375 | light | evidence/design-pass/ST-bangcot-cotrong--mobile-375--light.png |
| ST-bangcot-cotrong | desktop-1280 | light | evidence/design-pass/ST-bangcot-cotrong--desktop-1280--light.png |
| ST-bangcot-qua50 | mobile-375 | light | evidence/design-pass/ST-bangcot-qua50--mobile-375--light.png |
| ST-bangcot-qua50 | desktop-1280 | light | evidence/design-pass/ST-bangcot-qua50--desktop-1280--light.png |
| ST-bangcot-dangtai | mobile-375 | light | evidence/design-pass/ST-bangcot-dangtai--mobile-375--light.png |
| ST-bangcot-dangtai | desktop-1280 | light | evidence/design-pass/ST-bangcot-dangtai--desktop-1280--light.png |
| ST-bangcot-loitai | mobile-375 | light | evidence/design-pass/ST-bangcot-loitai--mobile-375--light.png |
| ST-bangcot-loitai | desktop-1280 | light | evidence/design-pass/ST-bangcot-loitai--desktop-1280--light.png |
| ST-bangcot-tuchoi | mobile-375 | light | evidence/design-pass/ST-bangcot-tuchoi--mobile-375--light.png |
| ST-bangcot-tuchoi | desktop-1280 | light | evidence/design-pass/ST-bangcot-tuchoi--desktop-1280--light.png |
| ST-lydo-mo | mobile-375 | light | evidence/design-pass/ST-lydo-mo--mobile-375--light.png |
| ST-lydo-mo | desktop-1280 | light | evidence/design-pass/ST-lydo-mo--desktop-1280--light.png |
| ST-lydo-mo | mobile-375 | dark | evidence/design-pass/ST-lydo-mo--mobile-375--dark.png |
| ST-lydo-mo | desktop-1280 | dark | evidence/design-pass/ST-lydo-mo--desktop-1280--dark.png |
| ST-bangcot-dangkeo | desktop-1280 | light | evidence/design-pass/ST-bangcot-dangkeo--desktop-1280--light.png |
| ST-bangcot-dangluu | desktop-1280 | light | evidence/design-pass/ST-bangcot-dangluu--desktop-1280--light.png |

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded` — vật chạy trong app thật sau cờ dev.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Hạn chốt trên thẻ gãy dòng («2026-10-» / «05») ở cột 256px → giữ một dòng (`whitespace-nowrap`); bản thật dùng `LocalDay` như dòng bảng.
- Bóng kéo có `shadow-lg` — `docs/design.md` cấm bóng tự chế → bỏ, chỉ giữ viền.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- **Thả vào cột rỗng rơi sang cột khác** (đo: kéo từ Decision maker in vào Contract sent đang rỗng → thẻ vào Closed won). `Kanban` không khai `collisionDetection` nên dnd-kit dùng mặc định so diện tích chồng lấn, thiên về thẻ nhỏ hơn khung cột. Đề xuất: `Kanban` nhận `collisionDetection`, bảng cột dùng `pointerWithin` rồi mới `rectIntersection`. Đây là lỗi đúng của AC-5 («kể cả cột đang rỗng») và E14 bước cột rỗng — sửa ở S3.
- **Lệch hydrate** `aria-describedby="DndDescribedBy-0/1"` giữa máy chủ và trình duyệt: `DndContext` của `Kanban` không nhận `id` ổn định. Đề xuất: truyền `useId()` làm `id` của `DndContext` trong `packages/ui/src/components/reui/kanban.tsx`.
- **Tương tác lồng nhau**: `KanbanItem` rải `role="button" tabIndex=0` lên cả thẻ, trong khi thẻ chứa nút mở tấm và nút menu (đo: 24 nút nằm trong phần tử `role=button`). Đề xuất: dời thuộc tính kéo sang tay kéo, thẻ không mang `role`.
- **Vùng chạm nhỏ**: tay kéo 16×88px, nút menu giai đoạn 24×24px — dưới 44px cho chạm. Đề xuất cho `Board` chế độ kéo: tay kéo ≥ 44px chiều ngang trên màn chạm, hoặc kéo cả thẻ với độ trễ chạm (TouchSensor delay) và bỏ tay kéo riêng.
- **Không đánh dấu cột đang trỏ khi kéo**: `KanbanColumn` không phơi trạng thái «đang được trỏ», nên không vẽ được viền/ring mà design doc hứa (ST-bangcot-dangkeo). Đề xuất: `KanbanColumn` gắn `data-over` từ `useDroppable`/`isOver`, `Board` vẽ ring từ đó.
