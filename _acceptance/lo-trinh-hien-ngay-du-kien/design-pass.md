---
slug: lo-trinh-hien-ngay-du-kien
at: 2026-10-17T12:20:00Z
route: http://localhost:3302/proto/lo-trinh-hien-ngay-du-kien
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong)
options:
divergence: skipped — một dòng thêm vào ba chỗ đã có (dòng mốc, cột Mốc, mục Chi tiết của ngăn); chỗ đặt do khuôn trang LT1 quyết, không còn hai hướng khả dĩ
ds_skill: web-design-guidelines
states: [ST-du-kien-moc, ST-du-kien-bang, ST-du-kien-ngan, ST-du-kien-da-qua, ST-du-kien-ban-cu, ST-du-kien-moc-en]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 3
deferred: 0
---
# design-pass — lo-trinh-hien-ngay-du-kien

Bản mẫu bọc đúng khung trang Lộ trình (`PageShell` + `NoiDungLoTrinh`) với khối dữ liệu rút từ `LO-TRINH.html` thật của
cây (17/10, kit 2.32.0), chèn ngày dự kiến cho ba mốc: «Lộ trình bước 2» (hoàn tất 17/10, có việc máy ước), «Sửa một
đợt» (hoàn tất 20/10, mọi việc đã đo), «R3 lên production» (hoàn tất 30/10 sau mục tiêu 28/10). Các mốc đang chạy còn lại
giữ `du_kien` null như khối thật. Hôm nay cố định 17/10 (trạng thái «đã qua» dùng 19/10). Đo lúc chụp: không ô nào cuộn
ngang (`scrollWidth == clientWidth` ở cả 24 ảnh).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-du-kien-moc | mobile-375 | light | evidence/design-pass/ST-du-kien-moc--mobile-375--light.png |
| ST-du-kien-moc | mobile-375 | dark | evidence/design-pass/ST-du-kien-moc--mobile-375--dark.png |
| ST-du-kien-moc | desktop-1280 | light | evidence/design-pass/ST-du-kien-moc--desktop-1280--light.png |
| ST-du-kien-moc | desktop-1280 | dark | evidence/design-pass/ST-du-kien-moc--desktop-1280--dark.png |
| ST-du-kien-bang | mobile-375 | light | evidence/design-pass/ST-du-kien-bang--mobile-375--light.png |
| ST-du-kien-bang | mobile-375 | dark | evidence/design-pass/ST-du-kien-bang--mobile-375--dark.png |
| ST-du-kien-bang | desktop-1280 | light | evidence/design-pass/ST-du-kien-bang--desktop-1280--light.png |
| ST-du-kien-bang | desktop-1280 | dark | evidence/design-pass/ST-du-kien-bang--desktop-1280--dark.png |
| ST-du-kien-ngan | mobile-375 | light | evidence/design-pass/ST-du-kien-ngan--mobile-375--light.png |
| ST-du-kien-ngan | mobile-375 | dark | evidence/design-pass/ST-du-kien-ngan--mobile-375--dark.png |
| ST-du-kien-ngan | desktop-1280 | light | evidence/design-pass/ST-du-kien-ngan--desktop-1280--light.png |
| ST-du-kien-ngan | desktop-1280 | dark | evidence/design-pass/ST-du-kien-ngan--desktop-1280--dark.png |
| ST-du-kien-da-qua | mobile-375 | light | evidence/design-pass/ST-du-kien-da-qua--mobile-375--light.png |
| ST-du-kien-da-qua | mobile-375 | dark | evidence/design-pass/ST-du-kien-da-qua--mobile-375--dark.png |
| ST-du-kien-da-qua | desktop-1280 | light | evidence/design-pass/ST-du-kien-da-qua--desktop-1280--light.png |
| ST-du-kien-da-qua | desktop-1280 | dark | evidence/design-pass/ST-du-kien-da-qua--desktop-1280--dark.png |
| ST-du-kien-ban-cu | mobile-375 | light | evidence/design-pass/ST-du-kien-ban-cu--mobile-375--light.png |
| ST-du-kien-ban-cu | mobile-375 | dark | evidence/design-pass/ST-du-kien-ban-cu--mobile-375--dark.png |
| ST-du-kien-ban-cu | desktop-1280 | light | evidence/design-pass/ST-du-kien-ban-cu--desktop-1280--light.png |
| ST-du-kien-ban-cu | desktop-1280 | dark | evidence/design-pass/ST-du-kien-ban-cu--desktop-1280--dark.png |
| ST-du-kien-moc-en | mobile-375 | light | evidence/design-pass/ST-du-kien-moc-en--mobile-375--light.png |
| ST-du-kien-moc-en | mobile-375 | dark | evidence/design-pass/ST-du-kien-moc-en--mobile-375--dark.png |
| ST-du-kien-moc-en | desktop-1280 | light | evidence/design-pass/ST-du-kien-moc-en--desktop-1280--light.png |
| ST-du-kien-moc-en | desktop-1280 | dark | evidence/design-pass/ST-du-kien-moc-en--desktop-1280--dark.png |

## Cảnh ngữ-cảnh

- bỏ cảnh ngữ-cảnh — vật là một dòng thêm vào trang Lộ trình đã giao, đường vào và ra của người dùng không đổi (sổ quyết
  định d-20261017T122600Z-9).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Cột Mốc ở 375 px bị cắt chữ khi dạng gọn dùng ngày đủ («dự kiến 17 thg 10, 2026») cạnh cờ — đổi dạng gọn sang ngày ngắn
  theo ngôn ngữ (`formatDayShort`: vi 17/10, en 10/17) và cờ xuống dòng riêng.
- Ngày ngắn tiếng Việt ra «17-10» với `Intl` mặc định — ghép lại bằng `/` theo thứ tự ngày/tháng của ngôn ngữ.
- Ô «Mốc» ở đầu ngăn hồ sơ lặp lại ngày dự kiến đã có trong mục «Chi tiết» và bị khung ô cắt — bỏ dòng ở ô, giữ mục
  «Ngày dự kiến» dạng đủ.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- (không có)
