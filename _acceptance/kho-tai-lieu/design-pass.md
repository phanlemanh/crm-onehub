---
slug: kho-tai-lieu
at: 2026-09-27T12:30:00Z
route: http://localhost:3310/proto/kho-tai-lieu
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (khong-dong-bo tren anh, gui kem the Cong 1)
options:
divergence: skipped — hướng đã chốt bằng lời trong phiên 2026-09-27 (trình soạn giàu kiểu Google Docs, diff kiểu Track Changes); không còn hai hướng khả dĩ
ds_skill: web-design-guidelines
states: [ST-danh-sach, ST-doc-trang, ST-doc-cho-lan-dau, ST-viet-trang, ST-kho-rong, ST-dang-tai, ST-duyet-thuong, ST-de-xuat-cu]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 2
deferred: 7
---
# design-pass — kho-tai-lieu

Bản mẫu dựng bằng component `@crm/ui` thật trong khung giả tĩnh của CRM (`KhungUngDung`: thanh trên, thanh biểu tượng có mục «Tài liệu»). Tám trạng thái lượt 1 × hai khổ, cộng hai ảnh tối cho màn soạn và màn duyệt. Không lỗi console. Chưa có phản ứng của chủ kho: gói ảnh đi kèm thẻ Cổng 1.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-dang-tai | desktop-1280 | light | evidence/design-pass/ST-dang-tai--desktop-1280.png |
| ST-dang-tai | mobile-375 | light | evidence/design-pass/ST-dang-tai--mobile-375.png |
| ST-danh-sach | desktop-1280 | light | evidence/design-pass/ST-danh-sach--desktop-1280.png |
| ST-danh-sach | mobile-375 | light | evidence/design-pass/ST-danh-sach--mobile-375.png |
| ST-de-xuat-cu | desktop-1280 | light | evidence/design-pass/ST-de-xuat-cu--desktop-1280.png |
| ST-de-xuat-cu | mobile-375 | light | evidence/design-pass/ST-de-xuat-cu--mobile-375.png |
| ST-doc-cho-lan-dau | desktop-1280 | light | evidence/design-pass/ST-doc-cho-lan-dau--desktop-1280.png |
| ST-doc-cho-lan-dau | mobile-375 | light | evidence/design-pass/ST-doc-cho-lan-dau--mobile-375.png |
| ST-doc-trang | desktop-1280 | light | evidence/design-pass/ST-doc-trang--desktop-1280.png |
| ST-doc-trang | mobile-375 | light | evidence/design-pass/ST-doc-trang--mobile-375.png |
| ST-duyet-thuong | desktop-1280 | dark | evidence/design-pass/ST-duyet-thuong--desktop-1280--dark.png |
| ST-duyet-thuong | desktop-1280 | light | evidence/design-pass/ST-duyet-thuong--desktop-1280.png |
| ST-duyet-thuong | mobile-375 | light | evidence/design-pass/ST-duyet-thuong--mobile-375.png |
| ST-kho-rong | desktop-1280 | light | evidence/design-pass/ST-kho-rong--desktop-1280.png |
| ST-kho-rong | mobile-375 | light | evidence/design-pass/ST-kho-rong--mobile-375.png |
| ST-viet-trang | desktop-1280 | dark | evidence/design-pass/ST-viet-trang--desktop-1280--dark.png |
| ST-viet-trang | desktop-1280 | light | evidence/design-pass/ST-viet-trang--desktop-1280.png |
| ST-viet-trang | mobile-375 | light | evidence/design-pass/ST-viet-trang--mobile-375.png |

## Cảnh ngữ-cảnh

- Không cần: nấc `static-frame`, bản mẫu tự vẽ khung CRM quanh vật (thanh biểu tượng, thanh trên).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Màn duyệt: chữ bỏ dính liền chữ thêm («48 giờ24 giờ») → chèn một dấu cách giữa đoạn bỏ và đoạn thêm liền kề.
- Bản mẫu lượt 1 lọc phần của lượt sau (tìm nhanh, nguồn, sức khoẻ, đồ thị, lịch sử, «Toàn công ty») bằng cờ `phamVi`; đổi «Nhóm» thành «Loại trang»; bỏ «Ai xem được», «Người duyệt», «Lưu nháp».

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Chưa có biến thể màu cho chữ thêm và chữ bỏ; tạm `bg-muted underline` và `line-through`. Ở giao diện tối nền chữ thêm gần như không thấy (ảnh `ST-duyet-thuong--desktop-1280--dark.png`). Đề xuất: biến thể `ins`/`del` trong `DiffTrang` bằng token có sẵn, đủ tương phản cả hai giao diện — thuộc S3 của vòng này.
- Chưa có `DiffTrang` trong `packages/ui` — dựng ở S3 (đã có trong thiết kế mục 4).
- Chưa có `TrinhSoan` — dựng ở S3; bản mẫu dùng vùng sửa được bọc `MarkdownReader`.
- Ô soạn chưa có tên cho trình đọc màn hình (lint không cho `role="textbox"` trên div); `TrinhSoan` phải tự đặt role và tên.
- Chưa có thành phần thanh công cụ (kiểu Radix Toolbar, phím mũi tên giữa các nút); tạm `div role="toolbar"`.
- Chưa có biểu tượng Tiêu đề 2 và Tiêu đề 3; tạm biểu tượng Heading kèm số.
- `SimpleTable` ở khổ 375 cắt nhãn «Có bản chờ duyệt» trong ô tên trang; thiết kế hứa danh sách thành thẻ ở khổ nhỏ — cần cách hiển thị thẻ của danh sách ở khổ nhỏ, làm ở S3 (dùng `Item` theo `docs/design.md`).
