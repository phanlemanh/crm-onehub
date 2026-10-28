---
slug: hop-tuan-tren-bang
at: 2026-10-27T13:15:24Z
route: http://localhost:3302/proto/hop-tuan-tren-bang
material: real-components
context: static-frame
context_scenes: []
reaction: nac-2 (gui-anh-va-link-ban-mau)
options:
divergence: skipped — khuôn có sẵn: bảng Họp tuần của HT1 và ngăn KR của VK7; chỗ chọn còn mở đã nằm ở Hỏi-1, Hỏi-2
ds_skill: web-design-guidelines
states: [ST-ht2-bang, ST-ht2-con-lai, ST-ht2-hop-cap-nhat, ST-ht2-ngan-kr, ST-ht2-hom-nay]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 4
deferred: 2
---
# design-pass — hop-tuan-tren-bang

Bản mẫu `/proto/hop-tuan-tren-bang` dựng bằng thành phần thật của `packages/ui` (AreaSidebar, PageShell, Breadcrumb,
Tabs gạch chân, StatGroup/StatCard, SimpleTable, Item, Collapsible, Sheet, Dialog) trong khung tĩnh của khu Mục tiêu sau
HT1: dòng vị trí «Bộ OKR › …», thẻ con, hàng bốn số. Dữ liệu giả, không tRPC. Trạng thái «Hôm nay» là màn onehub
5084ffe74 để so trước và sau. Chạy: `cd apps/app && PROTO_ROUTE=1 PORT=3302 bun run dev`, ảnh chụp bằng
`scripts/ui-capture.mjs`. Thêm một ảnh 768 của ST-ht2-bang (khổ giữa của `bat_khi`).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-ht2-bang | desktop-1280 | light | evidence/design-pass/bang--desktop-1280--light.png |
| ST-ht2-bang | desktop-1280 | dark | evidence/design-pass/bang--desktop-1280--dark.png |
| ST-ht2-bang | mobile-375 | light | evidence/design-pass/bang--mobile-375--light.png |
| ST-ht2-bang | mobile-375 | dark | evidence/design-pass/bang--mobile-375--dark.png |
| ST-ht2-con-lai | desktop-1280 | light | evidence/design-pass/con-lai--desktop-1280--light.png |
| ST-ht2-con-lai | desktop-1280 | dark | evidence/design-pass/con-lai--desktop-1280--dark.png |
| ST-ht2-con-lai | mobile-375 | light | evidence/design-pass/con-lai--mobile-375--light.png |
| ST-ht2-con-lai | mobile-375 | dark | evidence/design-pass/con-lai--mobile-375--dark.png |
| ST-ht2-hop-cap-nhat | desktop-1280 | light | evidence/design-pass/hop-cap-nhat--desktop-1280--light.png |
| ST-ht2-hop-cap-nhat | desktop-1280 | dark | evidence/design-pass/hop-cap-nhat--desktop-1280--dark.png |
| ST-ht2-hop-cap-nhat | mobile-375 | light | evidence/design-pass/hop-cap-nhat--mobile-375--light.png |
| ST-ht2-hop-cap-nhat | mobile-375 | dark | evidence/design-pass/hop-cap-nhat--mobile-375--dark.png |
| ST-ht2-ngan-kr | desktop-1280 | light | evidence/design-pass/ngan-kr--desktop-1280--light.png |
| ST-ht2-ngan-kr | desktop-1280 | dark | evidence/design-pass/ngan-kr--desktop-1280--dark.png |
| ST-ht2-ngan-kr | mobile-375 | light | evidence/design-pass/ngan-kr--mobile-375--light.png |
| ST-ht2-ngan-kr | mobile-375 | dark | evidence/design-pass/ngan-kr--mobile-375--dark.png |
| ST-ht2-hom-nay | desktop-1280 | light | evidence/design-pass/hom-nay--desktop-1280--light.png |
| ST-ht2-hom-nay | desktop-1280 | dark | evidence/design-pass/hom-nay--desktop-1280--dark.png |
| ST-ht2-hom-nay | mobile-375 | light | evidence/design-pass/hom-nay--mobile-375--light.png |
| ST-ht2-hom-nay | mobile-375 | dark | evidence/design-pass/hom-nay--mobile-375--dark.png |
| ST-ht2-bang | tablet-768 | light | evidence/design-pass/bang--tablet-768--light.png |

## Cảnh ngữ-cảnh

- Không áp: context là static-frame — bản mẫu đã bọc trong khung tĩnh của khu Mục tiêu (thanh bên, dòng vị trí, thẻ con).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Khung bản mẫu cắt từ onehub cũ (24/10): thiếu dòng vị trí và hàng số của HT1, tiêu đề là tên đơn vị — thêm
  `Breadcrumb` «Bộ OKR › …», `StatGroup` bốn ô, tiêu đề «Mục tiêu»; bỏ dòng chữ nhỏ «Tuần · đã cập nhật».
- Nền tối: tên KR dùng `Button variant="link"` nên mang màu thương hiệu, gần như chìm trên nền tối — đổi về nút chữ
  thường gạch chân khi rê như bảng đang chạy.
- 1280: mức đổi một dòng với đơn vị dài («−0,09 tỷ đồng · 1,17 tỷ đồng → 1,08 tỷ đồng») đẩy bảng tràn ngang và che nút
  Cập nhật — tách hai dòng: phần chênh ở trên, «trước → sau · so với dd/mm» ở dưới, ô cho xuống dòng.
- KR đo bằng %: mức đổi theo điểm tiến độ (32% → 16%) lệch với giá trị ở «Các lần cập nhật» (68% → 64%) trong cùng ngăn —
  đổi sang giá trị của KR (Hỏi-2); ‹ › đổi sang thứ tự cả bảng (Hỏi-1).

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Bản mẫu dùng `Progress` của `packages/ui` thay `ThanhTienDo` của app (có vạch «lẽ ra đã tới»): bản thật giữ
  `ThanhTienDo`; không đổi gì ở tầng component.
- Ngăn KR ở 375 trong bản mẫu là `Sheet` bên phải; bản thật dưới 768 là ngăn kéo từ dưới như VK7 — giữ VK7.
