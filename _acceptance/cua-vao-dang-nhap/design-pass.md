---
slug: cua-vao-dang-nhap
at: 2026-09-25T15:31:57Z
route: http://localhost:3840/proto/cua-vao-dang-nhap
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (ghim)
options: http://localhost:3840/proto/cua-vao-dang-nhap?state=ST-phan-ky-deu-nhau · ?state=ST-phan-ky-tien-do
divergence: opened
ds_skill: repo-tokens
states: [ST-sign-in-mac-dinh, ST-sign-in-chi-mat-khau, ST-sign-in-chua-cho-phep, ST-sign-in-da-huy, ST-sign-in-loi-chung, ST-sign-in-dang-tai, ST-shell-khong-khoi, ST-phan-ky-deu-nhau, ST-phan-ky-tien-do]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 1
deferred: 5
---
# design-pass — cua-vao-dang-nhap

Bản mẫu ghép từ component thật của `@crm/ui` (`Card`, `StepList`, `Alert`, `Button`,
`Field`, `Input`, `LogoLockup`, `Skeleton`), dựng lại khung `AuthShell` dạng tĩnh vì vòng
này không được chạm tệp đăng nhập thật trước khi PR #104 merge. Khung nằm trong vỏ
`max-w-5xl` của route proto, không phủ trọn khung nhìn như trang thật. 36 ảnh, không cảnh nào
tràn ngang (`scrollWidth - innerWidth = 0` ở mọi ô). Lệnh chụp:
`node .acceptance-runs/cua-vao-dang-nhap/chup-proto.mjs` (puppeteer-core, Chrome cục bộ, cổng 3840).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-phan-ky-deu-nhau | desktop-1280 | dark | evidence/design-pass/ST-phan-ky-deu-nhau--desktop-1280--dark.png |
| ST-phan-ky-deu-nhau | desktop-1280 | light | evidence/design-pass/ST-phan-ky-deu-nhau--desktop-1280--light.png |
| ST-phan-ky-deu-nhau | mobile-375 | dark | evidence/design-pass/ST-phan-ky-deu-nhau--mobile-375--dark.png |
| ST-phan-ky-deu-nhau | mobile-375 | light | evidence/design-pass/ST-phan-ky-deu-nhau--mobile-375--light.png |
| ST-phan-ky-tien-do | desktop-1280 | dark | evidence/design-pass/ST-phan-ky-tien-do--desktop-1280--dark.png |
| ST-phan-ky-tien-do | desktop-1280 | light | evidence/design-pass/ST-phan-ky-tien-do--desktop-1280--light.png |
| ST-phan-ky-tien-do | mobile-375 | dark | evidence/design-pass/ST-phan-ky-tien-do--mobile-375--dark.png |
| ST-phan-ky-tien-do | mobile-375 | light | evidence/design-pass/ST-phan-ky-tien-do--mobile-375--light.png |
| ST-shell-khong-khoi | desktop-1280 | dark | evidence/design-pass/ST-shell-khong-khoi--desktop-1280--dark.png |
| ST-shell-khong-khoi | desktop-1280 | light | evidence/design-pass/ST-shell-khong-khoi--desktop-1280--light.png |
| ST-shell-khong-khoi | mobile-375 | dark | evidence/design-pass/ST-shell-khong-khoi--mobile-375--dark.png |
| ST-shell-khong-khoi | mobile-375 | light | evidence/design-pass/ST-shell-khong-khoi--mobile-375--light.png |
| ST-sign-in-chi-mat-khau | desktop-1280 | dark | evidence/design-pass/ST-sign-in-chi-mat-khau--desktop-1280--dark.png |
| ST-sign-in-chi-mat-khau | desktop-1280 | light | evidence/design-pass/ST-sign-in-chi-mat-khau--desktop-1280--light.png |
| ST-sign-in-chi-mat-khau | mobile-375 | dark | evidence/design-pass/ST-sign-in-chi-mat-khau--mobile-375--dark.png |
| ST-sign-in-chi-mat-khau | mobile-375 | light | evidence/design-pass/ST-sign-in-chi-mat-khau--mobile-375--light.png |
| ST-sign-in-chua-cho-phep | desktop-1280 | dark | evidence/design-pass/ST-sign-in-chua-cho-phep--desktop-1280--dark.png |
| ST-sign-in-chua-cho-phep | desktop-1280 | light | evidence/design-pass/ST-sign-in-chua-cho-phep--desktop-1280--light.png |
| ST-sign-in-chua-cho-phep | mobile-375 | dark | evidence/design-pass/ST-sign-in-chua-cho-phep--mobile-375--dark.png |
| ST-sign-in-chua-cho-phep | mobile-375 | light | evidence/design-pass/ST-sign-in-chua-cho-phep--mobile-375--light.png |
| ST-sign-in-da-huy | desktop-1280 | dark | evidence/design-pass/ST-sign-in-da-huy--desktop-1280--dark.png |
| ST-sign-in-da-huy | desktop-1280 | light | evidence/design-pass/ST-sign-in-da-huy--desktop-1280--light.png |
| ST-sign-in-da-huy | mobile-375 | dark | evidence/design-pass/ST-sign-in-da-huy--mobile-375--dark.png |
| ST-sign-in-da-huy | mobile-375 | light | evidence/design-pass/ST-sign-in-da-huy--mobile-375--light.png |
| ST-sign-in-dang-tai | desktop-1280 | dark | evidence/design-pass/ST-sign-in-dang-tai--desktop-1280--dark.png |
| ST-sign-in-dang-tai | desktop-1280 | light | evidence/design-pass/ST-sign-in-dang-tai--desktop-1280--light.png |
| ST-sign-in-dang-tai | mobile-375 | dark | evidence/design-pass/ST-sign-in-dang-tai--mobile-375--dark.png |
| ST-sign-in-dang-tai | mobile-375 | light | evidence/design-pass/ST-sign-in-dang-tai--mobile-375--light.png |
| ST-sign-in-loi-chung | desktop-1280 | dark | evidence/design-pass/ST-sign-in-loi-chung--desktop-1280--dark.png |
| ST-sign-in-loi-chung | desktop-1280 | light | evidence/design-pass/ST-sign-in-loi-chung--desktop-1280--light.png |
| ST-sign-in-loi-chung | mobile-375 | dark | evidence/design-pass/ST-sign-in-loi-chung--mobile-375--dark.png |
| ST-sign-in-loi-chung | mobile-375 | light | evidence/design-pass/ST-sign-in-loi-chung--mobile-375--light.png |
| ST-sign-in-mac-dinh | desktop-1280 | dark | evidence/design-pass/ST-sign-in-mac-dinh--desktop-1280--dark.png |
| ST-sign-in-mac-dinh | desktop-1280 | light | evidence/design-pass/ST-sign-in-mac-dinh--desktop-1280--light.png |
| ST-sign-in-mac-dinh | mobile-375 | dark | evidence/design-pass/ST-sign-in-mac-dinh--mobile-375--dark.png |
| ST-sign-in-mac-dinh | mobile-375 | light | evidence/design-pass/ST-sign-in-mac-dinh--mobile-375--light.png |

## Cảnh ngữ-cảnh

- Không cần: nấc `static-frame` — khung `AuthShell` dựng lại bọc khối mới, ở cả khổ điện thoại (khối dưới nút Đăng nhập) và máy tính (khối ở cột trái).

## Phân kỳ — hướng của khối «Lần đầu vào?»

Ghim trên vật ở hai state `ST-phan-ky-*`. Mọi state khác vẽ theo hướng máy khuyên.

- **«Đều nhau» — máy khuyên.** Trục: các bước là hướng dẫn tĩnh hay tiến độ. Động cơ: ba bước ngang hàng; người mới đọc cả ba trước khi bấm, không bước nào trông như chưa mở. Đánh đổi: `StepList` sinh ra cho tiến độ — hướng này đặt bước đang làm vượt số bước, cần một chế độ tĩnh ở `packages/ui` (Nhóm 2, mục 1).
- **«Tiến độ».** Trục: như trên. Động cơ: dùng `StepList` đúng thiết kế; mắt dừng ở việc đầu tiên. Đánh đổi: bước 2–3 mờ như chưa tới lượt, và trình đọc màn hình nghe bước 1 là «bước hiện tại» (`aria-current="step"`) dù trang không biết người đang ở đâu.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Ô lỗi: `Alert destructive` của kho là nền xám, chữ 12px, nên câu báo trông y một ghi chú thường. Đã thêm `Icon Warning` + `AlertTitle` theo khuôn sẵn có ở màn Kết nối (`google-connection.tsx`); mỗi câu lỗi tách thành tiêu đề (chuyện gì) và mô tả (làm gì tiếp). Không thêm màu.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `StepList` chưa có chế độ hướng dẫn tĩnh. Đề xuất: thêm biến thể tĩnh ở `packages/ui/src/components/step-list.tsx` (mọi bước cùng trọng lượng, không `aria-current`) — bậc 5 của `docs/design.md`, làm ở S3; hoặc chọn hướng «Tiến độ» và giữ nguyên component.
- `Alert destructive` dùng chữ 12px. Với lời báo quan trọng nhất của một người mới bị từ chối, 12px là nhỏ; chấp nhận theo hệ thiết kế, hay mở một biến thể cỡ chữ lớn hơn ở `packages/ui`.
- Khi `sign-in` truyền khối cột trái, dòng tiêu đề `h1` của khung biến mất và trang chỉ còn `h2` («Đăng nhập vào CRM» của `AuthHeading`). Đề xuất: S3 nâng tiêu đề cột phải lên `h1` khi khung không có dòng tiêu đề — sửa ở `auth-shell.tsx`, không ở `packages/ui`.
- `design_pass.ds_skill: web-design-guidelines` không giải được thành skill nào trong phiên; phiên chạy trên token của `packages/ui` (nấc 2 của thang DS). Chủ kho quyết: nhận token kho làm chuẩn, hay khai lại tên skill.
- Bản mẫu là khung tĩnh trong vỏ `max-w-5xl`, không phải `AuthShell` thật; tỉ lệ hai cột ở khổ 1024–1440 thật sẽ rộng hơn ảnh. Ảnh đo thật ở 320/768/1024/1440 là việc của E12/E14 ở S4.
