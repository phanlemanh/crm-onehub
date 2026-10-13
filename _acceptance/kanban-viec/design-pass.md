---
slug: kanban-viec
at: 2026-10-13T08:47:20Z
route: http://localhost:3360/proto/kanban-viec
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-2 (bản bấm được chạy ở cổng 3360 bằng cấu hình proto-kanban-viec của .claude/launch.json + gói ảnh kèm thẻ Cổng Phạm vi)
options:
divergence: skipped — khuôn kanban hiển nhiên: câu giao gọi tên bốn cột, mọi hãng Việt trong khảo sát có «Bảng (Kanban)» theo trạng thái
ds_skill: web-design-guidelines
states: [ST-bang-viec-chi-xem, ST-bang-viec-cho-tai, ST-bang-viec-co-viec, ST-bang-viec-hoi-dong-cha, ST-bang-viec-loi, ST-bang-viec-menu, ST-bang-viec-rong, ST-bang-viec-tu-choi, ST-khung-viec-con, ST-khung-viec-con-soan, ST-khung-viec-la-con]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 3
deferred: 2
---
# design-pass — kanban-viec

Bản mẫu ở `apps/app/app/proto/_modules/kanban-viec/` ghép từ thành phần thật (`Board`, `ViewSwitch`, `DropdownMenu`,
`ConfirmDialog`, `DetailSheet`, `PageShell`), dữ liệu giả ở `du-lieu.ts`, không đường ghi. Kéo thả trên bảng chạy
thật trong bản mẫu (thẻ đổi cột theo `chuyenDuoc` giả; kéo cha còn con mở sang Xong mở hộp hỏi lại). Mọi trạng thái
ở 375 có `scrollWidth` = 375 (trang không cuộn ngang). Nấc phản ứng khuyên nac-2: quyết định đang mở có kéo thả,
nên người duyệt nên kéo thử trên bản bấm được chứ không chỉ xem ảnh.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-bang-viec-chi-xem | desktop-1280 | light | evidence/design-pass/ST-bang-viec-chi-xem--desktop-1280.png |
| ST-bang-viec-chi-xem | mobile-375 | light | evidence/design-pass/ST-bang-viec-chi-xem--mobile-375.png |
| ST-bang-viec-cho-tai | desktop-1280 | light | evidence/design-pass/ST-bang-viec-cho-tai--desktop-1280.png |
| ST-bang-viec-cho-tai | mobile-375 | light | evidence/design-pass/ST-bang-viec-cho-tai--mobile-375.png |
| ST-bang-viec-co-viec | desktop-1280 | dark | evidence/design-pass/ST-bang-viec-co-viec--desktop-1280--dark.png |
| ST-bang-viec-co-viec | desktop-1280 | light | evidence/design-pass/ST-bang-viec-co-viec--desktop-1280.png |
| ST-bang-viec-co-viec | mobile-375 | light | evidence/design-pass/ST-bang-viec-co-viec--mobile-375.png |
| ST-bang-viec-hoi-dong-cha | desktop-1280 | light | evidence/design-pass/ST-bang-viec-hoi-dong-cha--desktop-1280.png |
| ST-bang-viec-hoi-dong-cha | mobile-375 | light | evidence/design-pass/ST-bang-viec-hoi-dong-cha--mobile-375.png |
| ST-bang-viec-loi | desktop-1280 | light | evidence/design-pass/ST-bang-viec-loi--desktop-1280.png |
| ST-bang-viec-loi | mobile-375 | light | evidence/design-pass/ST-bang-viec-loi--mobile-375.png |
| ST-bang-viec-menu | desktop-1280 | light | evidence/design-pass/ST-bang-viec-menu--desktop-1280.png |
| ST-bang-viec-menu | mobile-375 | light | evidence/design-pass/ST-bang-viec-menu--mobile-375.png |
| ST-bang-viec-rong | desktop-1280 | light | evidence/design-pass/ST-bang-viec-rong--desktop-1280.png |
| ST-bang-viec-rong | mobile-375 | light | evidence/design-pass/ST-bang-viec-rong--mobile-375.png |
| ST-bang-viec-tu-choi | desktop-1280 | light | evidence/design-pass/ST-bang-viec-tu-choi--desktop-1280.png |
| ST-bang-viec-tu-choi | mobile-375 | light | evidence/design-pass/ST-bang-viec-tu-choi--mobile-375.png |
| ST-khung-viec-con | desktop-1280 | dark | evidence/design-pass/ST-khung-viec-con--desktop-1280--dark.png |
| ST-khung-viec-con | desktop-1280 | light | evidence/design-pass/ST-khung-viec-con--desktop-1280.png |
| ST-khung-viec-con | mobile-375 | light | evidence/design-pass/ST-khung-viec-con--mobile-375.png |
| ST-khung-viec-con-soan | desktop-1280 | light | evidence/design-pass/ST-khung-viec-con-soan--desktop-1280.png |
| ST-khung-viec-con-soan | mobile-375 | light | evidence/design-pass/ST-khung-viec-con-soan--mobile-375.png |
| ST-khung-viec-la-con | desktop-1280 | light | evidence/design-pass/ST-khung-viec-la-con--desktop-1280.png |
| ST-khung-viec-la-con | mobile-375 | light | evidence/design-pass/ST-khung-viec-la-con--mobile-375.png |

## Cảnh ngữ-cảnh

- Không cần: bản mẫu nhúng trong host thật (`PageShell` của app, trang proto sau cờ `PROTO_ROUTE`), nấc `host-embedded`.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Nút «Chuyển sang…» chiếm cả bề rộng thẻ và nặng hơn tiêu đề — bọc lại để canh trái, cỡ `sm`, kiểu `ghost`.
- Cột Xong in «còn 5 thẻ» trùng với dòng «Xem 5 việc xong cũ hơn ở Danh sách» — cột Xong nay đếm việc đang hiện, chỉ giữ dòng dẫn.
- Khung việc cha có hai nút tô màu cùng lúc («Xong» ở đầu khung và «Thêm» ở ô soạn việc con) — «Thêm» hạ xuống kiểu viền.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `Board` chưa biết cột nào không nhận một thẻ: trạng thái ST-bang-viec-dang-keo (cột không nhận mờ đi) và ST-bang-viec-cho-luu (thẻ khoá chờ máy chủ) không dựng được trên bản mẫu vì bản mẫu cấm sửa `packages/ui`. Đề xuất: lựa chọn `canDrop` và `reorder` trong `Board` — đã nằm trong kế hoạch của hợp đồng (AC-4, AC-5; eval E4).
- Cột của `Board` cố định 256px: bốn cột cần khoảng 1.080px, vùng nội dung ở 1280 có thanh trái chỉ khoảng 1.000px, nên cột «Xong» phải cuộn ngang mới thấy (ảnh ST-bang-viec-co-viec--desktop-1280). Đề xuất: thêm lựa chọn để cột co giãn chia đều bề rộng (tối thiểu 224px) khi số cột ít, trong `packages/ui`; hoặc nhận cuộn ngang như bảng thoả thuận.
