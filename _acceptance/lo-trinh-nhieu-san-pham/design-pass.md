---
slug: lo-trinh-nhieu-san-pham
at: 2026-10-19T22:20:47Z
route: http://localhost:3302/proto/lo-trinh-nhieu-san-pham
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong)
options:
divergence: skipped — cả hai màn theo khuôn sẵn có của kho: bộ chọn một giá trị ở PageShellActions, danh sách đối tượng có hành động là Item trong Card và tạo-sửa bằng Sheet (docs/settings.md «Danh sách», «Tạo mới và hỏi lại»)
ds_skill: web-design-guidelines
states: [ST-lotrinh-chon, ST-lotrinh-sp, ST-lotrinh-sp-chua-co, ST-lotrinh-sp-en, ST-lotrinh-sp-khuon-cu, ST-lotrinh-sp-lay-hong, ST-lotrinh-sp-nguon-doi, ST-sanpham-chua-cau-hinh, ST-sanpham-da-luu-tru, ST-sanpham-danh-sach, ST-sanpham-khong-quyen, ST-sanpham-nguoi-xem, ST-sanpham-rong, ST-sanpham-them]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 3
deferred: 2
---
# design-pass — lo-trinh-nhieu-san-pham

Bản mẫu ghép từ thành phần thật của `packages/ui` và `TrangLoTrinh` thật với dữ liệu mẫu của bản mẫu LT1: trang Lộ
trình có bộ chọn sản phẩm ở `PageShellActions`, và trang Cài đặt › Sản phẩm (`PageShell width="page"`, một `Card` liệt
`Item`, Sheet thêm và Sheet người xem, `ArchivedList`). Dữ liệu giả, không đường ghi. Đo lúc chụp: không ảnh nào cuộn
ngang (36/36 ảnh, `scrollWidth <= clientWidth`). Nền tối chụp ở bốn trạng thái đại diện.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-lotrinh-chon | desktop-1280 | light | evidence/design-pass/ST-lotrinh-chon--desktop-1280--light.png |
| ST-lotrinh-chon | mobile-375 | light | evidence/design-pass/ST-lotrinh-chon--mobile-375--light.png |
| ST-lotrinh-sp | desktop-1280 | dark | evidence/design-pass/ST-lotrinh-sp--desktop-1280--dark.png |
| ST-lotrinh-sp | desktop-1280 | light | evidence/design-pass/ST-lotrinh-sp--desktop-1280--light.png |
| ST-lotrinh-sp | mobile-375 | dark | evidence/design-pass/ST-lotrinh-sp--mobile-375--dark.png |
| ST-lotrinh-sp | mobile-375 | light | evidence/design-pass/ST-lotrinh-sp--mobile-375--light.png |
| ST-lotrinh-sp-chua-co | desktop-1280 | dark | evidence/design-pass/ST-lotrinh-sp-chua-co--desktop-1280--dark.png |
| ST-lotrinh-sp-chua-co | desktop-1280 | light | evidence/design-pass/ST-lotrinh-sp-chua-co--desktop-1280--light.png |
| ST-lotrinh-sp-chua-co | mobile-375 | dark | evidence/design-pass/ST-lotrinh-sp-chua-co--mobile-375--dark.png |
| ST-lotrinh-sp-chua-co | mobile-375 | light | evidence/design-pass/ST-lotrinh-sp-chua-co--mobile-375--light.png |
| ST-lotrinh-sp-en | desktop-1280 | light | evidence/design-pass/ST-lotrinh-sp-en--desktop-1280--light.png |
| ST-lotrinh-sp-en | mobile-375 | light | evidence/design-pass/ST-lotrinh-sp-en--mobile-375--light.png |
| ST-lotrinh-sp-khuon-cu | desktop-1280 | light | evidence/design-pass/ST-lotrinh-sp-khuon-cu--desktop-1280--light.png |
| ST-lotrinh-sp-khuon-cu | mobile-375 | light | evidence/design-pass/ST-lotrinh-sp-khuon-cu--mobile-375--light.png |
| ST-lotrinh-sp-lay-hong | desktop-1280 | light | evidence/design-pass/ST-lotrinh-sp-lay-hong--desktop-1280--light.png |
| ST-lotrinh-sp-lay-hong | mobile-375 | light | evidence/design-pass/ST-lotrinh-sp-lay-hong--mobile-375--light.png |
| ST-lotrinh-sp-nguon-doi | desktop-1280 | light | evidence/design-pass/ST-lotrinh-sp-nguon-doi--desktop-1280--light.png |
| ST-lotrinh-sp-nguon-doi | mobile-375 | light | evidence/design-pass/ST-lotrinh-sp-nguon-doi--mobile-375--light.png |
| ST-sanpham-chua-cau-hinh | desktop-1280 | light | evidence/design-pass/ST-sanpham-chua-cau-hinh--desktop-1280--light.png |
| ST-sanpham-chua-cau-hinh | mobile-375 | light | evidence/design-pass/ST-sanpham-chua-cau-hinh--mobile-375--light.png |
| ST-sanpham-da-luu-tru | desktop-1280 | light | evidence/design-pass/ST-sanpham-da-luu-tru--desktop-1280--light.png |
| ST-sanpham-da-luu-tru | mobile-375 | light | evidence/design-pass/ST-sanpham-da-luu-tru--mobile-375--light.png |
| ST-sanpham-danh-sach | desktop-1280 | dark | evidence/design-pass/ST-sanpham-danh-sach--desktop-1280--dark.png |
| ST-sanpham-danh-sach | desktop-1280 | light | evidence/design-pass/ST-sanpham-danh-sach--desktop-1280--light.png |
| ST-sanpham-danh-sach | mobile-375 | dark | evidence/design-pass/ST-sanpham-danh-sach--mobile-375--dark.png |
| ST-sanpham-danh-sach | mobile-375 | light | evidence/design-pass/ST-sanpham-danh-sach--mobile-375--light.png |
| ST-sanpham-khong-quyen | desktop-1280 | light | evidence/design-pass/ST-sanpham-khong-quyen--desktop-1280--light.png |
| ST-sanpham-khong-quyen | mobile-375 | light | evidence/design-pass/ST-sanpham-khong-quyen--mobile-375--light.png |
| ST-sanpham-nguoi-xem | desktop-1280 | light | evidence/design-pass/ST-sanpham-nguoi-xem--desktop-1280--light.png |
| ST-sanpham-nguoi-xem | mobile-375 | light | evidence/design-pass/ST-sanpham-nguoi-xem--mobile-375--light.png |
| ST-sanpham-rong | desktop-1280 | light | evidence/design-pass/ST-sanpham-rong--desktop-1280--light.png |
| ST-sanpham-rong | mobile-375 | light | evidence/design-pass/ST-sanpham-rong--mobile-375--light.png |
| ST-sanpham-them | desktop-1280 | dark | evidence/design-pass/ST-sanpham-them--desktop-1280--dark.png |
| ST-sanpham-them | desktop-1280 | light | evidence/design-pass/ST-sanpham-them--desktop-1280--light.png |
| ST-sanpham-them | mobile-375 | dark | evidence/design-pass/ST-sanpham-them--mobile-375--dark.png |
| ST-sanpham-them | mobile-375 | light | evidence/design-pass/ST-sanpham-them--mobile-375--light.png |

## Cảnh ngữ-cảnh

- Không có cảnh: entry `descope` trong sổ quyết định bắt đầu đúng chuỗi «bỏ cảnh ngữ-cảnh — hai màn sống trong khung app có sẵn không đổi…».

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Bộ chọn hiện rỗng khi đóng: `SelectValue` mang tên sản phẩm đang chọn tường minh; bỏ `className` đè bề rộng ở `SelectTrigger`.
- Ca lần lấy hỏng lặp giờ lấy ở hai dòng liền nhau: dòng thứ hai nói lý do hỏng («Lần lấy gần nhất hỏng: không thấy tệp lộ trình ở nhánh này. Trang đang hiện bản lấy trước đó.»), giờ chỉ ở dòng nguồn; ca nguồn vừa đổi cũng bỏ giờ lặp.
- Dòng «Chỉ chủ và quản trị khai được sản phẩm» lệch sang cạnh nút ở 1280: dùng `PageShellNote` như Cài đặt › Tổ chức, nút «Thêm sản phẩm» trỏ `aria-describedby` vào dòng ấy.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Lớp phủ sau Sheet ở nền tối đen đặc, che hẳn trang phía sau — lỗi chung của bộ giao diện, đã có ở bản phạm vi 14/10 (U9); không sửa trong vòng này.
- Ở 375 px mô tả nguồn của hàng sản phẩm (`kho · nhánh · tệp · giờ lấy · khuôn`) bị cắt hai dòng bởi `ItemDescription`; đề xuất: giữ, vì trạng thái và tên vẫn đọc đủ, nguồn đầy đủ xem trong Sheet sửa.
