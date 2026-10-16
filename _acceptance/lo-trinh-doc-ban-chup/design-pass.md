---
slug: lo-trinh-doc-ban-chup
at: 2026-10-14T08:08:42Z
route: http://localhost:3392/proto/lo-trinh-doc-ban-chup
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong)
options:
divergence: skipped — dòng giờ lấy chỉ có một chỗ khả dĩ: tiêu đề và mô tả trang dựng ngoài vùng chờ dữ liệu (docs/design.md «Khung trang»), nên dòng phụ thuộc dữ liệu phải nằm đầu vùng nội dung
ds_skill: web-design-guidelines
states: [ST-lo-trinh-ban-chup, ST-lo-trinh-ban-dung, ST-lo-trinh-ban-chup-en, ST-lo-trinh-ban-dung-en]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 0
deferred: 0
---
# design-pass — lo-trinh-doc-ban-chup

Bản mẫu bọc đúng khung trang Lộ trình của LT1 (`PageShell` + `NoiDungLoTrinh` với dữ liệu mẫu của bản mẫu LT1) và
thêm một dòng chữ phụ ở đầu vùng nội dung. Giờ trong bản mẫu cố định theo `Asia/Ho_Chi_Minh`; mã thật đọc múi giờ
người xem. Đo lúc chụp: không ô nào cuộn ngang (`scrollWidth == clientWidth` ở cả 16 ảnh).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-lo-trinh-ban-chup | mobile-375 | light | evidence/design-pass/ST-lo-trinh-ban-chup--mobile-375--light.png |
| ST-lo-trinh-ban-chup | mobile-375 | dark | evidence/design-pass/ST-lo-trinh-ban-chup--mobile-375--dark.png |
| ST-lo-trinh-ban-chup | desktop-1280 | light | evidence/design-pass/ST-lo-trinh-ban-chup--desktop-1280--light.png |
| ST-lo-trinh-ban-chup | desktop-1280 | dark | evidence/design-pass/ST-lo-trinh-ban-chup--desktop-1280--dark.png |
| ST-lo-trinh-ban-dung | mobile-375 | light | evidence/design-pass/ST-lo-trinh-ban-dung--mobile-375--light.png |
| ST-lo-trinh-ban-dung | mobile-375 | dark | evidence/design-pass/ST-lo-trinh-ban-dung--mobile-375--dark.png |
| ST-lo-trinh-ban-dung | desktop-1280 | light | evidence/design-pass/ST-lo-trinh-ban-dung--desktop-1280--light.png |
| ST-lo-trinh-ban-dung | desktop-1280 | dark | evidence/design-pass/ST-lo-trinh-ban-dung--desktop-1280--dark.png |
| ST-lo-trinh-ban-chup-en | mobile-375 | light | evidence/design-pass/ST-lo-trinh-ban-chup-en--mobile-375--light.png |
| ST-lo-trinh-ban-chup-en | mobile-375 | dark | evidence/design-pass/ST-lo-trinh-ban-chup-en--mobile-375--dark.png |
| ST-lo-trinh-ban-chup-en | desktop-1280 | light | evidence/design-pass/ST-lo-trinh-ban-chup-en--desktop-1280--light.png |
| ST-lo-trinh-ban-chup-en | desktop-1280 | dark | evidence/design-pass/ST-lo-trinh-ban-chup-en--desktop-1280--dark.png |
| ST-lo-trinh-ban-dung-en | mobile-375 | light | evidence/design-pass/ST-lo-trinh-ban-dung-en--mobile-375--light.png |
| ST-lo-trinh-ban-dung-en | mobile-375 | dark | evidence/design-pass/ST-lo-trinh-ban-dung-en--mobile-375--dark.png |
| ST-lo-trinh-ban-dung-en | desktop-1280 | light | evidence/design-pass/ST-lo-trinh-ban-dung-en--desktop-1280--light.png |
| ST-lo-trinh-ban-dung-en | desktop-1280 | dark | evidence/design-pass/ST-lo-trinh-ban-dung-en--desktop-1280--dark.png |

## Cảnh ngữ-cảnh

- Bỏ — xem entry sổ quyết định «bỏ cảnh ngữ-cảnh — …»: bản mẫu đã dựng trong khung trang Lộ trình thật, đường vào–ra không đổi so với LT1.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Không có.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Không có. Dòng giờ lấy dùng nếp chữ phụ `text-muted-foreground` đang có ở vùng lộ trình; không cần thành phần mới.

## Câu hỏi ghim cho Cổng Phạm vi

- Chữ «(bản dựng)» / «(build)» khi trang rơi về tệp đóng gói: máy khuyên GIỮ — người xem thường vẫn đọc được giờ,
  còn chủ kho nhận ra ngay đường đẩy đang hỏng mà không phải mở GitHub. Đổi chữ là sửa một khoá trong tệp lời.
