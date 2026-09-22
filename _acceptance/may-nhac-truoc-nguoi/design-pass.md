---
slug: may-nhac-truoc-nguoi
at: 2026-09-22T11:05:00Z
route: http://localhost:3300/proto/may-nhac-truoc-nguoi
material: real-components
context: static-frame
context_scenes: [ST-tasks-co-im--desktop-1280--light.png, ST-theo-doi-dang--desktop-1280--light.png]
reaction: nac-1 (ghim)
options:
divergence: skipped — không màn mới; hai loại dòng nối vào khuôn dòng bước có sẵn của thẻ Tasks, nút theo dõi dùng Button outline cạnh menu ⋯ có sẵn, bốn hướng đã chốt ở brainstorm (sổ quyết định)
ds_skill: web-design-guidelines
states: [tasks-co-im, tasks-rong, theo-doi-chua, theo-doi-dang, theo-doi-loi, slack-du, slack-tran]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 3
deferred: 2
---
# design-pass — may-nhac-truoc-nguoi

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| tasks-co-im | desktop-1280 | light | evidence/design-pass/ST-tasks-co-im--desktop-1280--light.png |
| tasks-co-im | desktop-1280 | dark | evidence/design-pass/ST-tasks-co-im--desktop-1280--dark.png |
| tasks-co-im | mobile-375 | light | evidence/design-pass/ST-tasks-co-im--mobile-375--light.png |
| tasks-rong | desktop-1280 | light | evidence/design-pass/ST-tasks-rong--desktop-1280--light.png |
| tasks-rong | desktop-1280 | dark | evidence/design-pass/ST-tasks-rong--desktop-1280--dark.png |
| tasks-rong | mobile-375 | light | evidence/design-pass/ST-tasks-rong--mobile-375--light.png |
| theo-doi-chua | desktop-1280 | light | evidence/design-pass/ST-theo-doi-chua--desktop-1280--light.png |
| theo-doi-chua | desktop-1280 | dark | evidence/design-pass/ST-theo-doi-chua--desktop-1280--dark.png |
| theo-doi-chua | mobile-375 | light | evidence/design-pass/ST-theo-doi-chua--mobile-375--light.png |
| theo-doi-dang | desktop-1280 | light | evidence/design-pass/ST-theo-doi-dang--desktop-1280--light.png |
| theo-doi-dang | desktop-1280 | dark | evidence/design-pass/ST-theo-doi-dang--desktop-1280--dark.png |
| theo-doi-dang | mobile-375 | light | evidence/design-pass/ST-theo-doi-dang--mobile-375--light.png |
| theo-doi-loi | desktop-1280 | light | evidence/design-pass/ST-theo-doi-loi--desktop-1280--light.png |
| theo-doi-loi | desktop-1280 | dark | evidence/design-pass/ST-theo-doi-loi--desktop-1280--dark.png |
| theo-doi-loi | mobile-375 | light | evidence/design-pass/ST-theo-doi-loi--mobile-375--light.png |
| slack-du | desktop-1280 | light | evidence/design-pass/ST-slack-du--desktop-1280--light.png |
| slack-du | desktop-1280 | dark | evidence/design-pass/ST-slack-du--desktop-1280--dark.png |
| slack-du | mobile-375 | light | evidence/design-pass/ST-slack-du--mobile-375--light.png |
| slack-tran | desktop-1280 | light | evidence/design-pass/ST-slack-tran--desktop-1280--light.png |
| slack-tran | desktop-1280 | dark | evidence/design-pass/ST-slack-tran--desktop-1280--dark.png |
| slack-tran | mobile-375 | light | evidence/design-pass/ST-slack-tran--mobile-375--light.png |

Chụp bằng Chrome không giao diện qua `puppeteer-core` của kho, đợi trang yên rồi tắt hoạt ảnh trước khi bấm máy. Lượt chụp đầu bắt sheet kế hoạch đang trượt vào (x≈896), trông như tràn phải; đo lại trong Browser pane và trong Chrome không giao diện đều ra sheet đúng x 410–1280, nên đó là lỗi của lượt chụp, không phải của bản mẫu. Không ảnh nào tràn ngang (đo `scrollWidth − innerWidth`).

## Cảnh ngữ-cảnh

- `ST-tasks-co-im--desktop-1280--light.png` — thẻ Tasks đứng cạnh thẻ «Thoả thuận đang mở» cùng khổ, như trang tổng quan thật: hai loại dòng mới nằm giữa dòng việc và dòng bước của lượt 2.
- `ST-theo-doi-dang--desktop-1280--light.png` — nút theo dõi trong khung sheet kế hoạch thật (`RecordSheetFrame`), cạnh menu ⋯ và nút đóng.
- Tin Slack không có host trong app; bản xem trước ghi rõ «chưa phải giao diện của app».

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Dòng phụ của «Kế hoạch im» mở đầu bằng gạch ngang, lệch khuôn dòng bước → «Giao bước «Mở tài khoản» · Kế hoạch»; dòng mốc → «3/8 bước xong · Kế hoạch».
- «Màu cảnh báo» của dòng im ghim vào `StatusIndicator tone="error"` — đúng chỉ báo của bước quá hạn — thay vì một màu mới (phản biện context sạch P1 #4).
- Trạng thái lỗi của nút theo dõi dùng hộp báo nằm trong sheet thay vì thông báo nổi tự tắt, để người thấy lỗi tới khi bấm lại.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Khổ 375: nút «Đang theo dõi · 3» ép dòng mô tả dưới tên kế hoạch thành cột hẹp nhiều dòng (`ST-theo-doi-dang--mobile-375--light.png`). Đề xuất: dưới khổ `sm` nút chỉ còn biểu tượng mắt kèm số, nhãn đầy đủ nằm ở `aria-label` và tooltip — đổi ở chỗ gọi bằng biến thể kích thước có sẵn của `Button`, không sửa `RecordSheetFrame`.
- Trạng thái đang gửi (`ST-theodoi-dang-gui`) chưa có id riêng trong bản mẫu, chỉ thấy khi bấm; đề xuất để phép đo dom E11 chứng nó thay vì thêm ảnh.
