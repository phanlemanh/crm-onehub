---
slug: cho-tac-nhan-lau
at: 2026-10-16T06:50:00Z
route: http://localhost:3302/proto/cho-tac-nhan-lau
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (ảnh gửi kèm lời mời Cổng Phạm vi; chủ kho phản ứng lúc rảnh bằng lời)
options:
divergence: skipped — giữ khuôn thẻ tiến trình trong hội thoại đang chạy (BuildingAgentCard) và chuông có sẵn; không có hướng IA thứ hai đáng dựng
ds_skill: web-design-guidelines
states: [ST-duoi-nguong, ST-tren-nguong, ST-chuong-ba-loai]
breakpoints: [mobile-375, desktop-800, desktop-1280]
themes: [dark]
patched: 0
deferred: 3
---
# design-pass — cho-tac-nhan-lau

Bản mẫu ghép từ thành phần thật: thẻ `TheDangDung` (`apps/app/components/agent-builder/the-dang-dung.tsx`, cùng thành phần màn
`/chat/<id>` dùng) và khung chuông `ChuongThongBaoKhung`; câu của ba loại thông báo đi qua `cauThongBao`, như chuông thật. Dữ
liệu giả, thời gian đã trôi cố định (84 s và 220 s). Đo lúc chụp: khổ 375 không cuộn ngang (`scrollWidth 375 / innerWidth 375`).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-duoi-nguong | desktop-800 | dark | evidence/design-pass/ST-duoi-nguong--desktop-800--dark.jpg |
| ST-duoi-nguong | mobile-375 | dark | evidence/design-pass/ST-duoi-nguong--mobile-375--dark.jpg |
| ST-tren-nguong | desktop-1280 | dark | evidence/design-pass/ST-tren-nguong--desktop-1280--dark.jpg |
| ST-tren-nguong | mobile-375 | dark | evidence/design-pass/ST-tren-nguong--mobile-375--dark.jpg |
| ST-chuong-ba-loai | desktop-1280 | dark | evidence/design-pass/ST-chuong-ba-loai--desktop-1280--dark.jpg |
| ST-chuong-ba-loai | mobile-375 | dark | evidence/design-pass/ST-chuong-ba-loai--mobile-375--dark.jpg |

`ST-chuong-da-doc` không chụp: khác `ST-chuong-ba-loai` đúng ở chấm chưa đọc và số trên chuông, đã có ở bản mẫu hộp thông báo.

## Findings

- F1 (deferred → S3): thẻ chuyển sang `Card` của `packages/ui` theo `docs/design.md`; danh sách bốn bước nằm trong ô có viền
  riêng, còn tiêu đề thẻ, thời gian đã trôi và chân thẻ nằm ngoài ô — khác hình thẻ cũ (một hộp viền bao trọn). Soi lại ở S4
  bằng ảnh màn thật; nếu chủ kho muốn giữ hình cũ thì đó là một biến thể `Card` trong `packages/ui`, không `className`.
- F2 (deferred → bản mẫu): trạng thái chuông khai `open` sẵn nhưng popover chỉ mở sau một lần bấm — giống bản mẫu
  `hop-thong-bao-tren-web`; không ảnh hưởng màn thật.
- F3 (deferred → Cổng Phạm vi): câu chân thẻ «Bạn có thể rời trang. Kara sẽ báo trong hộp thông báo khi xong.» hiện ngay từ
  đầu — đúng khuyến nghị Hỏi-1; nếu chủ kho chọn «chỉ sau ngưỡng» thì câu chỉ hiện ở `ST-tren-nguong`.
