---
slug: canh-kr-okr
at: 2026-09-28T07:22:12Z
route: http://localhost:3217/proto/canh-kr-okr
material: real-components
context: static-frame
context_scenes: [evidence/design-pass/ST-canh-chong--desktop-1440.png, evidence/design-pass/ST-canh-chong--mobile-390.png]
reaction: nac-1 (anh-gui-kem-the-cong)
options:
divergence: skipped — ba cách đặt «cạnh KR» đã so ở thiết kế mục 2 (khung KR xếp chồng · tab ở khung mục tiêu · dòng bung tại chỗ); máy khuyên khung xếp chồng vì khu OKR đã có khuôn đó (khung số lượt 6), người veto ở Cổng Phạm vi
ds_skill: web-design-guidelines
states: [ST-bangchung-co, ST-bangchung-rong, ST-bangchung-sai, ST-bangkr-co-viec, ST-canh-chong, ST-capnhat-moc, ST-datmt-chon-mau, ST-datmt-tu-mau, ST-khungkr-chi-okr, ST-khungkr-co-viec, ST-khungkr-dang-tai, ST-khungkr-gan, ST-khungkr-goc-mat, ST-khungkr-khoa, ST-khungkr-loi, ST-khungkr-rong, ST-khungkr-them, ST-mau-danh-sach, ST-mau-khong-quyen, ST-mau-rong, ST-mau-sheet, ST-traodoi-ghinhan, ST-traodoi-soan-ghinhan]
breakpoints: [mobile-390, desktop-1440]
themes: [light, dark]
patched: 5
deferred: 1
---
# design-pass — canh-kr-okr

Bản mẫu `/proto/canh-kr-okr`, 23 trạng thái, dựng bằng thành phần thật của `packages/ui`
trong khung ứng dụng tĩnh của bản mẫu OKR (`KhungUngDung`). Dữ liệu giả, không đường ghi.
Chụp ở 1440 và 390, sáng; bốn trạng thái chính chụp thêm tối. Không trạng thái nào tràn
ngang ở 390. Mặc định là KHÔNG ĐỒNG BỘ: máy dựng bản mẫu, tự chụp ma trận trạng thái × khổ, gửi gói rồi đi làm việc khác; nac-3 (ngồi cùng) chỉ mở khi có người gọi tên nó.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-bangchung-co | desktop-1440 | light | evidence/design-pass/ST-bangchung-co--desktop-1440.png |
| ST-bangchung-co | mobile-390 | light | evidence/design-pass/ST-bangchung-co--mobile-390.png |
| ST-bangchung-rong | desktop-1440 | light | evidence/design-pass/ST-bangchung-rong--desktop-1440.png |
| ST-bangchung-rong | mobile-390 | light | evidence/design-pass/ST-bangchung-rong--mobile-390.png |
| ST-bangchung-sai | desktop-1440 | light | evidence/design-pass/ST-bangchung-sai--desktop-1440.png |
| ST-bangchung-sai | mobile-390 | light | evidence/design-pass/ST-bangchung-sai--mobile-390.png |
| ST-bangkr-co-viec | desktop-1440 | dark | evidence/design-pass/ST-bangkr-co-viec--desktop-1440--dark.png |
| ST-bangkr-co-viec | desktop-1440 | light | evidence/design-pass/ST-bangkr-co-viec--desktop-1440.png |
| ST-bangkr-co-viec | mobile-390 | dark | evidence/design-pass/ST-bangkr-co-viec--mobile-390--dark.png |
| ST-bangkr-co-viec | mobile-390 | light | evidence/design-pass/ST-bangkr-co-viec--mobile-390.png |
| ST-canh-chong | desktop-1440 | light | evidence/design-pass/ST-canh-chong--desktop-1440.png |
| ST-canh-chong | mobile-390 | light | evidence/design-pass/ST-canh-chong--mobile-390.png |
| ST-capnhat-moc | desktop-1440 | light | evidence/design-pass/ST-capnhat-moc--desktop-1440.png |
| ST-capnhat-moc | mobile-390 | light | evidence/design-pass/ST-capnhat-moc--mobile-390.png |
| ST-datmt-chon-mau | desktop-1440 | light | evidence/design-pass/ST-datmt-chon-mau--desktop-1440.png |
| ST-datmt-chon-mau | mobile-390 | light | evidence/design-pass/ST-datmt-chon-mau--mobile-390.png |
| ST-datmt-tu-mau | desktop-1440 | light | evidence/design-pass/ST-datmt-tu-mau--desktop-1440.png |
| ST-datmt-tu-mau | mobile-390 | light | evidence/design-pass/ST-datmt-tu-mau--mobile-390.png |
| ST-khungkr-chi-okr | desktop-1440 | light | evidence/design-pass/ST-khungkr-chi-okr--desktop-1440.png |
| ST-khungkr-chi-okr | mobile-390 | light | evidence/design-pass/ST-khungkr-chi-okr--mobile-390.png |
| ST-khungkr-co-viec | desktop-1440 | dark | evidence/design-pass/ST-khungkr-co-viec--desktop-1440--dark.png |
| ST-khungkr-co-viec | desktop-1440 | light | evidence/design-pass/ST-khungkr-co-viec--desktop-1440.png |
| ST-khungkr-co-viec | mobile-390 | dark | evidence/design-pass/ST-khungkr-co-viec--mobile-390--dark.png |
| ST-khungkr-co-viec | mobile-390 | light | evidence/design-pass/ST-khungkr-co-viec--mobile-390.png |
| ST-khungkr-dang-tai | desktop-1440 | light | evidence/design-pass/ST-khungkr-dang-tai--desktop-1440.png |
| ST-khungkr-dang-tai | mobile-390 | light | evidence/design-pass/ST-khungkr-dang-tai--mobile-390.png |
| ST-khungkr-gan | desktop-1440 | light | evidence/design-pass/ST-khungkr-gan--desktop-1440.png |
| ST-khungkr-gan | mobile-390 | light | evidence/design-pass/ST-khungkr-gan--mobile-390.png |
| ST-khungkr-goc-mat | desktop-1440 | light | evidence/design-pass/ST-khungkr-goc-mat--desktop-1440.png |
| ST-khungkr-goc-mat | mobile-390 | light | evidence/design-pass/ST-khungkr-goc-mat--mobile-390.png |
| ST-khungkr-khoa | desktop-1440 | light | evidence/design-pass/ST-khungkr-khoa--desktop-1440.png |
| ST-khungkr-khoa | mobile-390 | light | evidence/design-pass/ST-khungkr-khoa--mobile-390.png |
| ST-khungkr-loi | desktop-1440 | light | evidence/design-pass/ST-khungkr-loi--desktop-1440.png |
| ST-khungkr-loi | mobile-390 | light | evidence/design-pass/ST-khungkr-loi--mobile-390.png |
| ST-khungkr-rong | desktop-1440 | light | evidence/design-pass/ST-khungkr-rong--desktop-1440.png |
| ST-khungkr-rong | mobile-390 | light | evidence/design-pass/ST-khungkr-rong--mobile-390.png |
| ST-khungkr-them | desktop-1440 | light | evidence/design-pass/ST-khungkr-them--desktop-1440.png |
| ST-khungkr-them | mobile-390 | light | evidence/design-pass/ST-khungkr-them--mobile-390.png |
| ST-mau-danh-sach | desktop-1440 | light | evidence/design-pass/ST-mau-danh-sach--desktop-1440.png |
| ST-mau-danh-sach | mobile-390 | light | evidence/design-pass/ST-mau-danh-sach--mobile-390.png |
| ST-mau-khong-quyen | desktop-1440 | light | evidence/design-pass/ST-mau-khong-quyen--desktop-1440.png |
| ST-mau-khong-quyen | mobile-390 | light | evidence/design-pass/ST-mau-khong-quyen--mobile-390.png |
| ST-mau-rong | desktop-1440 | light | evidence/design-pass/ST-mau-rong--desktop-1440.png |
| ST-mau-rong | mobile-390 | light | evidence/design-pass/ST-mau-rong--mobile-390.png |
| ST-mau-sheet | desktop-1440 | dark | evidence/design-pass/ST-mau-sheet--desktop-1440--dark.png |
| ST-mau-sheet | desktop-1440 | light | evidence/design-pass/ST-mau-sheet--desktop-1440.png |
| ST-mau-sheet | mobile-390 | dark | evidence/design-pass/ST-mau-sheet--mobile-390--dark.png |
| ST-mau-sheet | mobile-390 | light | evidence/design-pass/ST-mau-sheet--mobile-390.png |
| ST-traodoi-ghinhan | desktop-1440 | dark | evidence/design-pass/ST-traodoi-ghinhan--desktop-1440--dark.png |
| ST-traodoi-ghinhan | desktop-1440 | light | evidence/design-pass/ST-traodoi-ghinhan--desktop-1440.png |
| ST-traodoi-ghinhan | mobile-390 | dark | evidence/design-pass/ST-traodoi-ghinhan--mobile-390--dark.png |
| ST-traodoi-ghinhan | mobile-390 | light | evidence/design-pass/ST-traodoi-ghinhan--mobile-390.png |
| ST-traodoi-soan-ghinhan | desktop-1440 | light | evidence/design-pass/ST-traodoi-soan-ghinhan--desktop-1440.png |
| ST-traodoi-soan-ghinhan | mobile-390 | light | evidence/design-pass/ST-traodoi-soan-ghinhan--mobile-390.png |

## Cảnh ngữ-cảnh

- evidence/design-pass/ST-canh-chong--desktop-1440.png và --mobile-390.png — khung KR mở chồng lên khung mục tiêu trong khu «Theo đơn vị» (vào: bấm số việc ở bảng KR; ra: đóng khung, về khung mục tiêu).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Tiêu đề trang Cài đặt vẽ bằng `<h1>` → đổi sang `PageShell` / `PageShellTitle`.
- Ô «Hạn» của dòng nhập việc là ô chữ → `DatePicker`.
- Ô «Kiểu» của KR mẫu là ô chữ → `Select` sáu kiểu.
- Tab Trao đổi của khung mục tiêu hiện «KR» đang chọn → chọn đúng «Trao đổi».
- Dòng ghi nhận tách «người gửi · ghi nhận · người nhận» thành ba khối cách quãng → gộp thành một câu.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `SheetFooter` của `packages/ui` còn xếp dọc (Huỷ trên, Lưu dưới, hết bề ngang), trái với `docs/settings.md` («Huỷ» bên trái, nút chính bên phải, sửa trong `packages/ui` ở Đợt 2). Sheet mẫu OKR dùng nguyên `SheetFooter`. Đề xuất: để Đợt 2 của Cài đặt sửa một lần cho mọi sheet, không sửa trong lượt này.

Ghi chú không phải finding: khung KR trong bản mẫu dùng `Sheet` trần nên ở 390 còn lề trái; bản thật dùng khung chi tiết của ngăn xếp bản ghi, đã toàn màn ở khổ nhỏ.
