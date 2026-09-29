---
slug: giai-doan-thoa-thuan
at: 2026-09-29T00:22:45Z
route: http://localhost:3410/proto/giai-doan-thoa-thuan
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (anh-chup-gui-kem-the-cong-1)
options:
divergence: skipped — trang danh sách có thứ tự theo đúng khuôn Cài đặt đã chốt (docs/settings.md) và khuôn kéo của Tổ chức; không có hướng thứ hai khả dĩ
ds_skill: repo-tokens
states: [ST-co-du-lieu, ST-them, ST-them-tu-choi, ST-xoa-trong, ST-xoa-chuyen, ST-khong-quyen, ST-dat-tran, ST-dang-tai, ST-loi]
breakpoints: [mobile-375, desktop-1280]
themes: [light]
patched: 1
deferred: 2
---
# design-pass — giai-doan-thoa-thuan

Bản bấm được: `apps/app/app/proto/_modules/giai-doan-thoa-thuan`, mở ở
`/proto/giai-doan-thoa-thuan` khi `PROTO_ROUTE=1`. Khung tĩnh gồm thanh bên Cài đặt
với mục mới «Giai đoạn thoả thuận» ngay sau «Trường»; thân trang ghép từ component
thật (`PageShell`, `Card`, `SortableList`, `DropdownMenu`, `Dialog`,
`ConfirmDialog`, `Select`, `Empty`, `Skeleton`), dữ liệu giả, không đường ghi.
Kéo sắp xếp, mở menu «…», thêm và xoá bấm được thật trong bản mẫu.

Máy khuyên nấc nac-1: quyết định đang mở là bố cục ba thẻ và chữ của các trạng
thái — tĩnh, đọc được trên ảnh. Kéo sắp xếp dùng lại đúng `SortableList` của Tổ
chức nên không cần phiên ngồi cùng.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-co-du-lieu | mobile-375 | light | evidence/design-pass/ST-co-du-lieu--mobile-375--light.png |
| ST-co-du-lieu | desktop-1280 | light | evidence/design-pass/ST-co-du-lieu--desktop-1280--light.png |
| ST-them | mobile-375 | light | evidence/design-pass/ST-them--mobile-375--light.png |
| ST-them | desktop-1280 | light | evidence/design-pass/ST-them--desktop-1280--light.png |
| ST-them-tu-choi | mobile-375 | light | evidence/design-pass/ST-them-tu-choi--mobile-375--light.png |
| ST-them-tu-choi | desktop-1280 | light | evidence/design-pass/ST-them-tu-choi--desktop-1280--light.png |
| ST-xoa-trong | mobile-375 | light | evidence/design-pass/ST-xoa-trong--mobile-375--light.png |
| ST-xoa-trong | desktop-1280 | light | evidence/design-pass/ST-xoa-trong--desktop-1280--light.png |
| ST-xoa-chuyen | mobile-375 | light | evidence/design-pass/ST-xoa-chuyen--mobile-375--light.png |
| ST-xoa-chuyen | desktop-1280 | light | evidence/design-pass/ST-xoa-chuyen--desktop-1280--light.png |
| ST-khong-quyen | mobile-375 | light | evidence/design-pass/ST-khong-quyen--mobile-375--light.png |
| ST-khong-quyen | desktop-1280 | light | evidence/design-pass/ST-khong-quyen--desktop-1280--light.png |
| ST-dat-tran | mobile-375 | light | evidence/design-pass/ST-dat-tran--mobile-375--light.png |
| ST-dat-tran | desktop-1280 | light | evidence/design-pass/ST-dat-tran--desktop-1280--light.png |
| ST-dang-tai | mobile-375 | light | evidence/design-pass/ST-dang-tai--mobile-375--light.png |
| ST-dang-tai | desktop-1280 | light | evidence/design-pass/ST-dang-tai--desktop-1280--light.png |
| ST-loi | mobile-375 | light | evidence/design-pass/ST-loi--mobile-375--light.png |
| ST-loi | desktop-1280 | light | evidence/design-pass/ST-loi--desktop-1280--light.png |

## Cảnh ngữ-cảnh

- Không áp: nấc `static-frame` — khung thanh bên Cài đặt bọc thân trang cho thấy chỗ sống của trang.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Lý do «đã đủ 20 giai đoạn» nằm trong `CardDescription`, mà `CardDescription` của kho ẩn dưới khổ `sm` → ở 375px nút Thêm khoá mà không nói vì sao. Đã dời lý do lên `PageShellDescription`, hiện ở mọi khổ.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Lời giải thích của từng thẻ (thứ tự = thứ tự cột; «Không thành» bắt lý do) cũng nằm trong `CardDescription`, nên người dùng điện thoại không thấy. Đề xuất: chấp nhận như luật chung của kho (mô tả thẻ là phụ), không đổi `packages/ui` trong vòng này.
- `design_pass.ds_skill` khai `web-design-guidelines`, nhưng đó là skill rà soát trong `.agents/skills/` chứ không phải skill nạp được trong phiên — phiên chạy trên từ vựng token của kho (`packages/ui` + `docs/design.md`, `docs/settings.md`). Đề xuất: giữ nguyên nấc repo-tokens làm chuẩn kho.
