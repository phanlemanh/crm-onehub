---
slug: trang-lo-trinh-trong-crm
at: 2026-10-08T17:25:46Z
route: http://localhost:3300/proto/trang-lo-trinh-trong-crm
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong)
options:
divergence: skipped — danh sách một cột chọn theo tra mẫu Mobbin, kanban loại vì 44/64 việc OKR đã giao (sổ quyết định, dòng approach thứ hai)
ds_skill: web-design-guidelines
states: [ST-lotrinh-day-du, ST-lotrinh-loc, ST-lotrinh-tre, ST-lotrinh-dang-tai, ST-lotrinh-chua-co-khoi, ST-lotrinh-khoi-hong, ST-lotrinh-tep-vang, ST-lotrinh-lo-loi, ST-lotrinh-khuon-moi]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 3
deferred: 2
---
# design-pass — trang-lo-trinh-trong-crm

Dữ liệu của bản mẫu là khối `lo-trinh-du-lieu` do chính bộ vẽ của kit (nhánh `vong/xuat-du-lieu-lo-trinh`,
d86a2f5e) sinh trên kho này cộng hàng LT1/LT2 của #313 — 87 việc, 22 mốc, ba lộ trình. Bộ vẽ chạy ngoài kho,
không cài vào crm. Các trạng thái lỗi dùng đúng câu của hàm `docDuLieu`.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-lotrinh-day-du | mobile-375 | light | evidence/design-pass/ST-lotrinh-day-du--mobile-375.png |
| ST-lotrinh-day-du | desktop-1280 | light | evidence/design-pass/ST-lotrinh-day-du--desktop-1280.png |
| ST-lotrinh-loc | mobile-375 | light | evidence/design-pass/ST-lotrinh-loc--mobile-375.png |
| ST-lotrinh-loc | desktop-1280 | light | evidence/design-pass/ST-lotrinh-loc--desktop-1280.png |
| ST-lotrinh-tre | mobile-375 | light | evidence/design-pass/ST-lotrinh-tre--mobile-375.png |
| ST-lotrinh-tre | desktop-1280 | light | evidence/design-pass/ST-lotrinh-tre--desktop-1280.png |
| ST-lotrinh-dang-tai | mobile-375 | light | evidence/design-pass/ST-lotrinh-dang-tai--mobile-375.png |
| ST-lotrinh-dang-tai | desktop-1280 | light | evidence/design-pass/ST-lotrinh-dang-tai--desktop-1280.png |
| ST-lotrinh-chua-co-khoi | mobile-375 | light | evidence/design-pass/ST-lotrinh-chua-co-khoi--mobile-375.png |
| ST-lotrinh-chua-co-khoi | desktop-1280 | light | evidence/design-pass/ST-lotrinh-chua-co-khoi--desktop-1280.png |
| ST-lotrinh-khoi-hong | mobile-375 | light | evidence/design-pass/ST-lotrinh-khoi-hong--mobile-375.png |
| ST-lotrinh-khoi-hong | desktop-1280 | light | evidence/design-pass/ST-lotrinh-khoi-hong--desktop-1280.png |
| ST-lotrinh-tep-vang | mobile-375 | light | evidence/design-pass/ST-lotrinh-tep-vang--mobile-375.png |
| ST-lotrinh-tep-vang | desktop-1280 | light | evidence/design-pass/ST-lotrinh-tep-vang--desktop-1280.png |
| ST-lotrinh-lo-loi | mobile-375 | light | evidence/design-pass/ST-lotrinh-lo-loi--mobile-375.png |
| ST-lotrinh-lo-loi | desktop-1280 | light | evidence/design-pass/ST-lotrinh-lo-loi--desktop-1280.png |
| ST-lotrinh-khuon-moi | mobile-375 | light | evidence/design-pass/ST-lotrinh-khuon-moi--mobile-375.png |
| ST-lotrinh-khuon-moi | desktop-1280 | light | evidence/design-pass/ST-lotrinh-khuon-moi--desktop-1280.png |
| ST-lotrinh-day-du | desktop-1280 | dark | evidence/design-pass/ST-lotrinh-day-du--desktop-1280--dark.png |

## Cảnh ngữ-cảnh

- bỏ cảnh ngữ-cảnh — mục Lộ trình chỉ thêm một dòng vào thanh điều hướng có sẵn; đường vào đo trên màn thật ở E10 (sổ quyết định, dòng descope cuối)

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Khổ 375 tràn ngang: trạng thái ở cột phải bóp câu giao còn vài chữ một dòng, bộ lọc chung hàng tiêu đề — chuyển trạng thái vào dòng phụ dưới câu giao, bộ lọc xuống hàng riêng; 19/19 ảnh không tràn.
- Thanh thẻ kiểu gạch chân dính chữ ba tên lộ trình — đổi sang kiểu nền mặc định của Tabs.
- Chữ «đã qua» gắn cả việc đã giao làm người đọc tưởng trễ — chỉ đánh «trễ» cho việc nằm trong danh sách việc trễ của luật ngày.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `packages/ui` chưa có ô số liệu chỉ đọc: `StatTile` là nút bấm, trang chỉ đọc không được có nút lạ — bản mẫu vẽ bốn con số bằng danh sách định nghĩa tại chỗ; đề xuất thêm một thành phần số liệu chỉ đọc vào `packages/ui` ở S3.
- Nhóm hiện bằng mã trần của tệp kế hoạch (`okr`, `tro-ly`, `crm-chung`, `ve-sinh`) — «crm-chung», «ve-sinh» khó hiểu với trưởng phòng ban; tệp kế hoạch có từ vựng nhưng khối dữ liệu không chở tên hiển thị của nhóm. Đề xuất: xin bộ kit thêm tên hiển thị của nhóm vào khối; tới lúc đó trang hiện mã trần.
