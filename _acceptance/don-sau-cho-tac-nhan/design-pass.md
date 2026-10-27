---
slug: don-sau-cho-tac-nhan
at: 2026-10-27T04:35:00Z
route: http://localhost:3302/proto/cho-tac-nhan-lau
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (ảnh gửi kèm lời mời Cổng Phạm vi; chủ kho trả lời Hỏi-1 bằng lời)
options: [mac-dinh-card, boc-giu-12-8]
divergence: skipped — việc dọn không đổi IA; hai lối chỉ khác hai khoảng
ds_skill: web-design-guidelines
states: [ST-duoi-nguong, ST-tren-nguong]
breakpoints: [mobile-375, desktop-1280]
themes: [dark]
patched: 0
deferred: 1
---
# design-pass — don-sau-cho-tac-nhan

Bản mẫu `cho-tac-nhan-lau` của K7, thẻ thật. Ảnh «trước» là thẻ hiện tại, cũng là hình của lối «bọc giữ 12/8 px». Ảnh
«sau» là cùng thẻ với khoảng mặc định của `Card` (đổi lớp trên trang lúc chụp, chưa sửa mã). Đo lúc chụp, `column-gap`
tính ra: đầu thẻ 12 px → 8 px, chân thẻ 8 px → 12 px; khổ 375 không cuộn ngang ở cả tám ảnh (`scrollWidth` = khổ).

## Ma trận capture

| state | breakpoint | theme | trước (= lối bọc) | sau (= mặc định Card, khuyến nghị) |
|---|---|---|---|---|
| ST-duoi-nguong | desktop-1280 | dark | evidence/design-pass/ST-duoi-nguong--1280--truoc.png | evidence/design-pass/ST-duoi-nguong--1280--sau.png |
| ST-duoi-nguong | mobile-375 | dark | evidence/design-pass/ST-duoi-nguong--375--truoc.png | evidence/design-pass/ST-duoi-nguong--375--sau.png |
| ST-tren-nguong | desktop-1280 | dark | evidence/design-pass/ST-tren-nguong--1280--truoc.png | evidence/design-pass/ST-tren-nguong--1280--sau.png |
| ST-tren-nguong | mobile-375 | dark | evidence/design-pass/ST-tren-nguong--375--truoc.png | evidence/design-pass/ST-tren-nguong--375--sau.png |

## Findings

- F1 (deferred → Cổng Phạm vi, Hỏi-1): hai lối khác nhau 4 px ở hai chỗ; nhìn bằng mắt ở 375 gần như không phân biệt.
  Khuyến nghị mặc định của `Card`.
