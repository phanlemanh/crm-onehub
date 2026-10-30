---
slug: cap-nhat-trong-ngan-kr
at: 2026-10-30T07:10:00Z
route: http://localhost:3000/proto/cap-nhat-trong-ngan-kr
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (gui-goi-khong-dong-bo)
options:
divergence: skipped — khuôn đã chốt ở docs/design.md «Ghi vào bản ghi: ngay trong ngăn»; chỗ chọn còn mở nằm ở Hỏi-1, Hỏi-2
ds_skill: web-design-guidelines
states: [ST-cnk-hom-nay, ST-cnk-mo-san, ST-cnk-xem-truoc, ST-cnk-thu, ST-cnk-vua-gui, ST-cnk-loi, ST-cnk-moc, ST-cnk-ghi-ho, ST-cnk-giu-nhap, ST-cnk-chi-doc, ST-cnk-tu-hop-tuan]
breakpoints: [mobile-375, desktop-1440]
themes: [light]
patched: 0
deferred: 4
---
# design-pass — cap-nhat-trong-ngan-kr

Bản mẫu `/proto/cap-nhat-trong-ngan-kr` dựng bằng thành phần thật của `packages/ui` (Sheet/ngăn kéo, StatGroup/StatCard,
Progress, ToggleGroup, Input, Alert, ConfirmDialog, SimpleTable, Item, biểu đồ đích của Lịch sử) trên dữ liệu mẫu dày: KR
«Tăng số đại lý cấp 1 ký hợp đồng phân phối độc quyền khu vực miền Trung và Tây Nguyên», 9 lần trong 6 tuần, một KR mốc,
ba KR phụ cho ‹ ›. Không tRPC. Trạng thái «Hôm nay» dựng lại hộp thoại hiện hành để so trước và sau. Chạy:
`cd apps/app && PROTO_ROUTE=1 bunx next dev -p <cổng>`; ảnh chụp bằng Playwright, ẩn chỉ báo dev, làm mờ lớp nền
`rgb(0 0 0 / .25)` để thấy ngăn phía sau, và trải hết thân ngăn rồi chụp riêng phần tử ngăn.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-cnk-chi-doc | desktop-1440 | light | evidence/design-pass/chi-doc--desktop-1440--light.png |
| ST-cnk-chi-doc | mobile-375 | light | evidence/design-pass/chi-doc--mobile-375--light.png |
| ST-cnk-ghi-ho | desktop-1440 | light | evidence/design-pass/ghi-ho--desktop-1440--light.png |
| ST-cnk-ghi-ho | mobile-375 | light | evidence/design-pass/ghi-ho--mobile-375--light.png |
| ST-cnk-giu-nhap | desktop-1440 | light | evidence/design-pass/giu-nhap--desktop-1440--light.png |
| ST-cnk-giu-nhap | mobile-375 | light | evidence/design-pass/giu-nhap--mobile-375--light.png |
| ST-cnk-hom-nay | desktop-1440 | light | evidence/design-pass/hom-nay--desktop-1440--light.png |
| ST-cnk-hom-nay | mobile-375 | light | evidence/design-pass/hom-nay--mobile-375--light.png |
| ST-cnk-loi | desktop-1440 | light | evidence/design-pass/loi--desktop-1440--light.png |
| ST-cnk-loi | mobile-375 | light | evidence/design-pass/loi--mobile-375--light.png |
| ST-cnk-mo-san | desktop-1440 | light | evidence/design-pass/mo-san--desktop-1440--light.png |
| ST-cnk-mo-san | mobile-375 | light | evidence/design-pass/mo-san--mobile-375--light.png |
| ST-cnk-moc | desktop-1440 | light | evidence/design-pass/moc--desktop-1440--light.png |
| ST-cnk-moc | mobile-375 | light | evidence/design-pass/moc--mobile-375--light.png |
| ST-cnk-thu | desktop-1440 | light | evidence/design-pass/thu--desktop-1440--light.png |
| ST-cnk-thu | mobile-375 | light | evidence/design-pass/thu--mobile-375--light.png |
| ST-cnk-tu-hop-tuan | desktop-1440 | light | evidence/design-pass/tu-hop-tuan--desktop-1440--light.png |
| ST-cnk-tu-hop-tuan | mobile-375 | light | evidence/design-pass/tu-hop-tuan--mobile-375--light.png |
| ST-cnk-vua-gui | desktop-1440 | light | evidence/design-pass/vua-gui--desktop-1440--light--khung.png |
| ST-cnk-vua-gui | desktop-1440 | light | evidence/design-pass/vua-gui--desktop-1440--light.png |
| ST-cnk-vua-gui | mobile-375 | light | evidence/design-pass/vua-gui--mobile-375--light--khung.png |
| ST-cnk-vua-gui | mobile-375 | light | evidence/design-pass/vua-gui--mobile-375--light.png |
| ST-cnk-xem-truoc | desktop-1440 | light | evidence/design-pass/xem-truoc--desktop-1440--light.png |
| ST-cnk-xem-truoc | mobile-375 | light | evidence/design-pass/xem-truoc--mobile-375--light.png |

## Findings

- Nhóm 1 (bản mẫu đã đúng luật): khối giữa ô số và Lịch sử; một nút chính «Gửi cập nhật»; đầu ngăn không còn nút chính;
  xem trước là chấm nét đứt trên biểu đồ Lịch sử và dòng «12 → 14 (+2 đại lý)»; khổ 375 khối nằm trong ngăn kéo,
  không tràn ngang.
- Nhóm 2 (hoãn sang S3, không chặn Cổng 1):
  - Dòng «Lần trước: vừa» dưới mức tự tin lặp thông tin của dòng đầu Lịch sử — S3 bỏ, theo luật «không lặp».
  - KR mốc ở 375: ô «Hiện tại» xuống dòng «Chưa / xong» — S3 kiểm cỡ chữ ô số của ngăn kéo.
  - Bản mẫu chưa có `Kbd` trong `packages/ui`; gợi ý phím viết bằng chữ «Ctrl/⌘ + Enter».
  - Đếm «n/tổng» đặt ở dòng phụ dưới tiêu đề ngăn (ngăn 460px) — S3 giữ chỗ hiện tại của ngăn thật (cạnh ‹ ›).
- Giới hạn của bản mẫu: ảnh `hom-nay` khổ 375 — ngăn kéo đè hộp thoại cũ, chỉ thấy đầu hộp; ảnh `tu-hop-tuan` khổ 375
  không thấy bảng Họp tuần dưới ngăn kéo; ảnh `vua-gui` riêng ngăn không có toast (toast ở ảnh `--khung`).
