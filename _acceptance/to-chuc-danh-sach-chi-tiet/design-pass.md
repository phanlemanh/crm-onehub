---
slug: to-chuc-danh-sach-chi-tiet
at: 2026-09-24T15:13:10Z
route: http://localhost:3710/proto/to-chuc-danh-sach-chi-tiet
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (khong-dong-bo-tren-anh)
options: docs/superpowers/specs/2026-09-24-to-chuc-danh-sach-chi-tiet-design.md
divergence: opened
ds_skill: web-design-guidelines
states: [ST-goc, ST-bo-phan, ST-gan-phong-ban, ST-phong-ban, ST-phong-ban-trong, ST-them-nguoi, ST-chua-co-phong-ban, ST-chua-truong, ST-chi-doc, ST-hep, ST-nhap-1, ST-nhap-2, ST-nhap-3, ST-luu-tru, ST-trong, ST-dang-tai, ST-loi]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 3
deferred: 5
---
# design-pass — to-chuc-danh-sach-chi-tiet

Bản bấm được chạy trong host thật (`apps/app`, sau cờ `PROTO_ROUTE`) ở máy chủ dev của chính worktree này, cổng 3710. Vật liệu thật của `@crm/ui`: `Combobox`, `SortableList`, `Sheet`, `StepList`, `Empty`, `Checkbox`, `Dialog`, `AlertDialog`, `PersonAvatar`, cùng `PageShell` của app. Dữ liệu giả dùng lại từ bản mẫu lượt 1, không có tRPC, không sửa `packages/ui`. 17 trạng thái × 2 khổ × 2 giao diện = 68 ảnh, không trạng thái nào tràn ngang.

Nạp luật: `web-design-guidelines` (chuẩn DS của kho — địa chỉ trang giữ trạng thái, kéo thả có bàn phím, lỗi ngay cạnh ô, danh sách dài chỉ vẽ phần thấy), `ux-ui-craft`, `docs/design.md`, `docs/proto.md`, `docs/reui.md`.

Bước phân kỳ đã mở: ba hướng có tên đặt trong bản đặc tả (mục «Hướng đã chọn»):
- **danh sách – chi tiết** — ngả máy khuyên, và là hướng được dựng thành bản mẫu;
- **cây sửa tại chỗ + chữ gợi ý** — rẻ nhất, nhưng không chữa được việc phải đi 5 thao tác mỗi phòng ban;
- **bảng người có cột đơn vị** — mất hình cây đã hứa cho OKR.

Chủ kho đã gật hướng danh sách – chi tiết trong phiên ngày 2026-09-24, trước khi mở vòng.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| mọi state trong frontmatter | mobile-375, desktop-1280 | light | evidence/design-pass/<state>--<breakpoint>.png |
| mọi state trong frontmatter | mobile-375, desktop-1280 | dark | evidence/design-pass/<state>--<breakpoint>--dark.png |

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded`. Bản mẫu render trong app thật; cảnh vào–ra là thanh bên Cài đặt đã có ở màn thật `settings/organization`.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- **Khung trượt lặp tên phòng ban hai lần:** đầu khung và đầu nội dung. Bỏ đầu nội dung khi nằm trong khung trượt.
- **Huy hiệu «Trưởng phòng ban» ép tên người cụt còn «T…» ở khổ 375:** chuyển huy hiệu xuống dưới tên.
- **Con số trên cây mang hai nghĩa:** dòng bộ phận đếm phòng ban, dòng phòng ban đếm người. Bỏ số ở dòng bộ phận. Dòng phòng ban chưa có trưởng hiện «chưa có trưởng» thay cho số, kể cả phòng ban chưa xếp.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- **Nút trên cây** cần một biến thể «mục điều hướng» trong `packages/ui` (canh trái, thụt theo cấp, trạng thái đang chọn). Bản mẫu đang tự chỉnh `className`.
- **Ô số bấm được** cần một thành phần thật (nhãn, số lớn, liên kết, trạng thái đang bấm dễ thấy). Hiện `aria-pressed` không đổi gì trên hình, ở cả hai giao diện.
- **Lớp phủ của hộp thoại che kín trang phía sau**, ở cả nền sáng lẫn nền tối — khớp chỗ vấp #10 của lái thử. Lớp phủ thuộc `packages/ui`, không riêng màn này.
- **`StepList` chỉ xếp dọc**, chiếm gần nửa hộp nhập. Một biến thể ngang (như `wizard-5` của ReUI) sẽ gọn hơn.
- **Hộp chọn nhiều** (ô tìm + danh sách ô tích + nút mang số lượng) chưa có thành phần dùng chung. Tổ chức cần nó hai lần («Gắn phòng ban», «Thêm người»).
