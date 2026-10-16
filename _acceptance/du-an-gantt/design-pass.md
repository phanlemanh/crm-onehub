---
slug: du-an-gantt
at: 2026-10-16T08:49:11Z
route: http://localhost:3300/proto/du-an-gantt
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-2 (bản bấm được chạy ở cổng 3300 bằng cấu hình proto-cay-nay của .claude/launch.json + gói ảnh kèm thẻ Cổng Phạm vi)
options:
divergence: skipped — khuôn danh-sách-chi-tiết và Gantt hiển nhiên: câu giao gọi tên Gantt, mọi hãng trong khảo sát đặt Gantt là một kiểu xem của dự án
ds_skill: web-design-guidelines
states: [ST-du-an-ds-co, ST-du-an-ds-rong, ST-du-an-ds-cho-tai, ST-du-an-ds-loi, ST-du-an-tao, ST-gantt-co-lich, ST-gantt-moc-tre, ST-gantt-da-doi, ST-gantt-chi-xem, ST-gantt-rong, ST-gantt-cho-tai, ST-gantt-loi, ST-du-an-hoi-dong, ST-khung-viec-lich, ST-lich-lam-viec, ST-lich-lam-viec-khong-quyen]
breakpoints: [mobile-375, desktop-1280]
themes: [light]
patched: 4
deferred: 5
---
# design-pass — du-an-gantt

Bản mẫu ở `apps/app/app/proto/_modules/du-an-gantt/` ghép từ thành phần thật (`GanttDuAn` bọc `@reui/gantt`,
`PageShell`, `ViewSwitch`, `SimpleTable`, `Item`, `Empty`, `VungTaiLoi`, `ConfirmDialog`, `DetailSheet`, `DatePicker`,
`Combobox`, `ToggleGroup`, `Card`), dữ liệu giả ở `du-lieu.ts`, không đường ghi. Gantt chạy thật trong bản mẫu: kéo
thân thanh, kéo mép, phím, phóng to thu nhỏ, đổi thang; mũi tên xong-rồi-mới-bắt-đầu, hàng Mốc, ngày nghỉ và ngày lễ
26/10 tô nền. Mọi trạng thái ở 375 có `scrollWidth` = `clientWidth` (trang không cuộn ngang). Nấc phản ứng khuyên
nac-2: quyết định đang mở có kéo thanh và tự dời, nên người duyệt nên kéo thử trên bản bấm được chứ không chỉ xem ảnh.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-du-an-ds-co | desktop-1280 | light | evidence/design-pass/ST-du-an-ds-co--desktop-1280.png |
| ST-du-an-ds-rong | desktop-1280 | light | evidence/design-pass/ST-du-an-ds-rong--desktop-1280.png |
| ST-du-an-ds-cho-tai | desktop-1280 | light | evidence/design-pass/ST-du-an-ds-cho-tai--desktop-1280.png |
| ST-du-an-ds-loi | desktop-1280 | light | evidence/design-pass/ST-du-an-ds-loi--desktop-1280.png |
| ST-du-an-tao | desktop-1280 | light | evidence/design-pass/ST-du-an-tao--desktop-1280.png |
| ST-gantt-co-lich | desktop-1280 | light | evidence/design-pass/ST-gantt-co-lich--desktop-1280.png |
| ST-gantt-moc-tre | desktop-1280 | light | evidence/design-pass/ST-gantt-moc-tre--desktop-1280.png |
| ST-gantt-da-doi | desktop-1280 | light | evidence/design-pass/ST-gantt-da-doi--desktop-1280.png |
| ST-gantt-chi-xem | desktop-1280 | light | evidence/design-pass/ST-gantt-chi-xem--desktop-1280.png |
| ST-gantt-rong | desktop-1280 | light | evidence/design-pass/ST-gantt-rong--desktop-1280.png |
| ST-gantt-cho-tai | desktop-1280 | light | evidence/design-pass/ST-gantt-cho-tai--desktop-1280.png |
| ST-gantt-loi | desktop-1280 | light | evidence/design-pass/ST-gantt-loi--desktop-1280.png |
| ST-du-an-hoi-dong | desktop-1280 | light | evidence/design-pass/ST-du-an-hoi-dong--desktop-1280.png |
| ST-khung-viec-lich | desktop-1280 | light | evidence/design-pass/ST-khung-viec-lich--desktop-1280.png |
| ST-lich-lam-viec | desktop-1280 | light | evidence/design-pass/ST-lich-lam-viec--desktop-1280.png |
| ST-lich-lam-viec-khong-quyen | desktop-1280 | light | evidence/design-pass/ST-lich-lam-viec-khong-quyen--desktop-1280.png |
| ST-du-an-ds-co | mobile-375 | light | evidence/design-pass/ST-du-an-ds-co--mobile-375.png |
| ST-du-an-ds-rong | mobile-375 | light | evidence/design-pass/ST-du-an-ds-rong--mobile-375.png |
| ST-du-an-ds-cho-tai | mobile-375 | light | evidence/design-pass/ST-du-an-ds-cho-tai--mobile-375.png |
| ST-du-an-ds-loi | mobile-375 | light | evidence/design-pass/ST-du-an-ds-loi--mobile-375.png |
| ST-du-an-tao | mobile-375 | light | evidence/design-pass/ST-du-an-tao--mobile-375.png |
| ST-gantt-co-lich | mobile-375 | light | evidence/design-pass/ST-gantt-co-lich--mobile-375.png |
| ST-gantt-moc-tre | mobile-375 | light | evidence/design-pass/ST-gantt-moc-tre--mobile-375.png |
| ST-gantt-da-doi | mobile-375 | light | evidence/design-pass/ST-gantt-da-doi--mobile-375.png |
| ST-gantt-chi-xem | mobile-375 | light | evidence/design-pass/ST-gantt-chi-xem--mobile-375.png |
| ST-gantt-rong | mobile-375 | light | evidence/design-pass/ST-gantt-rong--mobile-375.png |
| ST-gantt-cho-tai | mobile-375 | light | evidence/design-pass/ST-gantt-cho-tai--mobile-375.png |
| ST-gantt-loi | mobile-375 | light | evidence/design-pass/ST-gantt-loi--mobile-375.png |
| ST-du-an-hoi-dong | mobile-375 | light | evidence/design-pass/ST-du-an-hoi-dong--mobile-375.png |
| ST-khung-viec-lich | mobile-375 | light | evidence/design-pass/ST-khung-viec-lich--mobile-375.png |
| ST-lich-lam-viec | mobile-375 | light | evidence/design-pass/ST-lich-lam-viec--mobile-375.png |
| ST-lich-lam-viec-khong-quyen | mobile-375 | light | evidence/design-pass/ST-lich-lam-viec-khong-quyen--mobile-375.png |

## Cảnh ngữ-cảnh

- Không cần: bản mẫu nhúng trong host thật (`/proto/[slug]` sau cờ `PROTO_ROUTE`), nấc `host-embedded`.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Nhãn trạng thái của danh mục bản mẫu dài quá làm khung bản mẫu cuộn ngang 11px ở 375 — rút nhãn còn hai đến bốn chữ.
- Thang tuần mặc định để một ngày rộng cả khung, chỉ thấy năm ngày — đặt ô ngày 2.5rem để thấy hai tuần của đợt.
- Khung mở quanh hôm nay nên mốc 30/10 nằm ngoài — tâm khung là giữa khoảng ngày của việc và mốc.
- Hai nhãn tiếng Việt không dấu bị `messages-guard` chặn («Sau», «xong n%») — đổi «Kế tiếp», «đã xong n%».

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `@reui/gantt` cài vào `packages/ui/src/components/reui/gantt/` theo ngoại lệ thành phần nền của `docs/proto.md` (9 tệp, thêm `context-menu.tsx` của shadcn, hai phụ thuộc `date-fns`, `@date-fns/tz`; bỏ gói `cn`, chú thích, Lucide ở tệp Gantt; vá 25 chỗ truy cập mảng cho `noUncheckedIndexedAccess`). Cổng Phạm vi từ chối thì gỡ cùng bản mẫu.
- Vạch «bây giờ» của Gantt ReUI lệch hydrat giữa máy chủ và trình duyệt (phần trăm vị trí khác số lẻ) — S3: `GanttDuAn` chỉ dựng sau hydrat hoặc làm tròn vị trí; không vá thành phần nền ở phiên này.
- Ở 375 cột tên việc chiếm khoảng một phần ba bề ngang — S3: `treePanel.width` hẹp hơn dưới `md`.
- Toast «Đã dời n việc» trong bản mẫu vẽ bằng `Alert` vì bản mẫu không có đường ghi — màn thật dùng toast `aria-live`.
- Ở ST-gantt-da-doi, việc cha «Chuẩn bị dữ liệu» dời sang 27/10 nhưng việc con «Xuất danh sách chi nhánh» đứng nguyên 22/10, trước cả cha — đúng luật «chỉ phụ thuộc gây dời» và «gắn của cha và con sống riêng sau lúc tạo» của `CONTEXT.md`, nhưng người nhìn Gantt sẽ thấy; chủ kho xem có cần một câu hỏi riêng không.
