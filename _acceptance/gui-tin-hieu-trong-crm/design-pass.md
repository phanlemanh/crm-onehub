---
slug: gui-tin-hieu-trong-crm
at: 2026-10-12T01:39:24Z
route: http://localhost:3380/proto/gui-tin-hieu-trong-crm
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (gui-kem-the-cong — ảnh đính kèm lời mời Cổng Phạm vi, chủ kho phản ứng cùng lượt duyệt)
options:
divergence: skipped — hộp gửi theo khuôn hộp «Báo sai» đang chạy, danh sách theo nếp màn «Tài liệu»; câu hỏi «danh sách trong hộp hay trang riêng» đã quyết trong sổ quyết định
ds_skill: web-design-guidelines
states: [ST-ds-co, ST-ds-dang-tai, ST-ds-khong-doc-ban-ve, ST-ds-loi, ST-ds-rong, ST-ds-xac-nhan-xoa, ST-hop-da-gui, ST-hop-dang-go, ST-hop-dang-gui, ST-hop-loi, ST-hop-qua-tran, ST-hop-trong, ST-nut]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 3
deferred: 2
---
# design-pass — gui-tin-hieu-trong-crm

Bản mẫu ghép từ đúng các mảnh sẽ chạy thật (`apps/app/components/tin-hieu/`), dữ liệu giả trong
`apps/app/app/proto/_modules/gui-tin-hieu-trong-crm/du-lieu.ts`. Câu trạng thái của các dòng sau gom là câu
dựng theo khuôn câu `CAU` của kit (`scripts/tin-hieu.mjs`), không phải câu do kit sinh trên dữ liệu thật.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-ds-co | desktop-1280 | dark | evidence/design-pass/ST-ds-co--desktop-1280--dark.png |
| ST-ds-co | desktop-1280 | light | evidence/design-pass/ST-ds-co--desktop-1280.png |
| ST-ds-co | mobile-375 | dark | evidence/design-pass/ST-ds-co--mobile-375--dark.png |
| ST-ds-co | mobile-375 | light | evidence/design-pass/ST-ds-co--mobile-375.png |
| ST-ds-dang-tai | desktop-1280 | light | evidence/design-pass/ST-ds-dang-tai--desktop-1280.png |
| ST-ds-dang-tai | mobile-375 | light | evidence/design-pass/ST-ds-dang-tai--mobile-375.png |
| ST-ds-khong-doc-ban-ve | desktop-1280 | light | evidence/design-pass/ST-ds-khong-doc-ban-ve--desktop-1280.png |
| ST-ds-khong-doc-ban-ve | mobile-375 | light | evidence/design-pass/ST-ds-khong-doc-ban-ve--mobile-375.png |
| ST-ds-loi | desktop-1280 | light | evidence/design-pass/ST-ds-loi--desktop-1280.png |
| ST-ds-loi | mobile-375 | light | evidence/design-pass/ST-ds-loi--mobile-375.png |
| ST-ds-rong | desktop-1280 | light | evidence/design-pass/ST-ds-rong--desktop-1280.png |
| ST-ds-rong | mobile-375 | light | evidence/design-pass/ST-ds-rong--mobile-375.png |
| ST-ds-xac-nhan-xoa | desktop-1280 | light | evidence/design-pass/ST-ds-xac-nhan-xoa--desktop-1280.png |
| ST-ds-xac-nhan-xoa | mobile-375 | light | evidence/design-pass/ST-ds-xac-nhan-xoa--mobile-375.png |
| ST-hop-da-gui | desktop-1280 | light | evidence/design-pass/ST-hop-da-gui--desktop-1280.png |
| ST-hop-da-gui | mobile-375 | light | evidence/design-pass/ST-hop-da-gui--mobile-375.png |
| ST-hop-dang-go | desktop-1280 | dark | evidence/design-pass/ST-hop-dang-go--desktop-1280--dark.png |
| ST-hop-dang-go | desktop-1280 | light | evidence/design-pass/ST-hop-dang-go--desktop-1280.png |
| ST-hop-dang-go | mobile-375 | dark | evidence/design-pass/ST-hop-dang-go--mobile-375--dark.png |
| ST-hop-dang-go | mobile-375 | light | evidence/design-pass/ST-hop-dang-go--mobile-375.png |
| ST-hop-dang-gui | desktop-1280 | light | evidence/design-pass/ST-hop-dang-gui--desktop-1280.png |
| ST-hop-dang-gui | mobile-375 | light | evidence/design-pass/ST-hop-dang-gui--mobile-375.png |
| ST-hop-loi | desktop-1280 | light | evidence/design-pass/ST-hop-loi--desktop-1280.png |
| ST-hop-loi | mobile-375 | light | evidence/design-pass/ST-hop-loi--mobile-375.png |
| ST-hop-qua-tran | desktop-1280 | light | evidence/design-pass/ST-hop-qua-tran--desktop-1280.png |
| ST-hop-qua-tran | mobile-375 | light | evidence/design-pass/ST-hop-qua-tran--mobile-375.png |
| ST-hop-trong | desktop-1280 | light | evidence/design-pass/ST-hop-trong--desktop-1280.png |
| ST-hop-trong | mobile-375 | light | evidence/design-pass/ST-hop-trong--mobile-375.png |
| ST-nut | desktop-1280 | light | evidence/design-pass/ST-nut--desktop-1280.png |
| ST-nut | mobile-375 | light | evidence/design-pass/ST-nut--mobile-375.png |

## Cảnh ngữ-cảnh

- Không dựng cảnh: entry sổ quyết định «bỏ cảnh ngữ-cảnh — nút chỉ thêm một mục vào cụm nút sẵn có của thanh đầu trang; chỗ đứng đo trên màn thật ở E13».

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Cột trạng thái cắt mất câu dài của kit → nhãn ngắn có chấm màu theo nghĩa, câu đầy đủ xuống dòng phụ (nếp nhãn chính + dòng phụ của trang Lộ trình).
- Cột Xoá rơi khỏi khung ở 1280 vì trang để khổ hẹp → trang về khổ mặc định của màn danh sách (`docs/design.md`, «Bề rộng»).
- Câu trạng thái của CRM dùng chữ «kéo về kho» — người không dùng git đọc thành kho hàng → «chờ đội sản phẩm lấy về», «đội sản phẩm đã lấy về — chờ gom nhóm».

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Câu trạng thái của kit mở bằng chữ thường và mang mã việc cùng tên hồ sơ kỹ thuật («→ việc Z4 → hồ sơ nhac-dung-gio-zalo: đang làm»). CRM hiện nguyên văn theo hợp đồng; muốn câu cho người không dùng git thì kit thêm một câu riêng — khuôn thuộc kit, báo phiên điều phối, CRM không viết lại.
- `StatusIndicator` chỉ có nhãn một dòng (cắt chữ); câu dài đi dòng phụ `SimpleTableNote`. Chưa cần biến thể mới; nếu màn khác cũng cần nhãn nhiều dòng thì thêm biến thể ở `packages/ui`.
