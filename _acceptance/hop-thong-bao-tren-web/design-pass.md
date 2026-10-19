---
slug: hop-thong-bao-tren-web
at: 2026-10-14T03:01:52Z
route: http://localhost:3300/proto/hop-thong-bao-tren-web
material: real-components
context: static-frame
context_scenes: [evidence/design-pass/ST-ngu-canh--desktop-1280--dark.png, evidence/design-pass/ST-ngu-canh--desktop-1280--light.png, evidence/design-pass/ST-ngu-canh--mobile-375--dark.png, evidence/design-pass/ST-ngu-canh--mobile-375--light.png]
reaction: nac-1 (ghim — ảnh gửi kèm lời mời Cổng Phạm vi, chủ kho phản ứng trên ảnh)
options:
divergence: skipped — chuông theo khuôn nút đếm + ô bật ra «Hàng làm giàu» đang chạy trên đầu trang (enrichment-queue.tsx); trang Thông báo theo nếp màn danh sách của docs/design.md
ds_skill: web-design-guidelines
states: [ST-ngu-canh, ST-chuong-co-chua-doc, ST-chuong-99, ST-chuong-het-chua-doc, ST-chuong-rong, ST-chuong-cho-tai, ST-chuong-loi, ST-trang-co, ST-trang-loc-chua-doc-rong, ST-trang-rong, ST-trang-cho-tai, ST-trang-loi]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 4
deferred: 1
---
# design-pass — hop-thong-bao-tren-web

Bản mẫu ghép từ đúng các mảnh sẽ chạy thật (`apps/app/components/thong-bao/`), dữ liệu giả trong
`apps/app/app/proto/_modules/hop-thong-bao-tren-web/du-lieu.ts`. Câu thông báo là câu mẫu viết tay theo từng loại
mục nhắc; câu thật dựng từ khuôn nội dung ở S3. Cảnh ngữ-cảnh `ST-ngu-canh` đặt chuông cạnh nút «Gửi tín hiệu» và
ảnh đại diện thật của đầu trang. Ảnh chụp bằng `rang/chup-proto.mjs` (puppeteer, Chrome không giao diện): 12 trạng
thái × 2 khổ × 2 nền = 48 ảnh; máy kiểm mỗi ảnh không cuộn ngang, ô bật ra nằm trọn khung nhìn, chuông có tên đọc được
— 48/48 đạt.

Tra mẫu thị trường: chuông Salesforce (20 thông báo gần nhất, giữ 90 ngày) và HubSpot (số chưa đọc; người dùng than
số bị xoá khi mới mở chuông) — rút ra: số chỉ đổi khi đọc thật, không đổi khi mở chuông.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-chuong-99 | desktop-1280 | dark | evidence/design-pass/ST-chuong-99--desktop-1280--dark.png |
| ST-chuong-99 | desktop-1280 | light | evidence/design-pass/ST-chuong-99--desktop-1280--light.png |
| ST-chuong-99 | mobile-375 | dark | evidence/design-pass/ST-chuong-99--mobile-375--dark.png |
| ST-chuong-99 | mobile-375 | light | evidence/design-pass/ST-chuong-99--mobile-375--light.png |
| ST-chuong-cho-tai | desktop-1280 | dark | evidence/design-pass/ST-chuong-cho-tai--desktop-1280--dark.png |
| ST-chuong-cho-tai | desktop-1280 | light | evidence/design-pass/ST-chuong-cho-tai--desktop-1280--light.png |
| ST-chuong-cho-tai | mobile-375 | dark | evidence/design-pass/ST-chuong-cho-tai--mobile-375--dark.png |
| ST-chuong-cho-tai | mobile-375 | light | evidence/design-pass/ST-chuong-cho-tai--mobile-375--light.png |
| ST-chuong-co-chua-doc | desktop-1280 | dark | evidence/design-pass/ST-chuong-co-chua-doc--desktop-1280--dark.png |
| ST-chuong-co-chua-doc | desktop-1280 | light | evidence/design-pass/ST-chuong-co-chua-doc--desktop-1280--light.png |
| ST-chuong-co-chua-doc | mobile-375 | dark | evidence/design-pass/ST-chuong-co-chua-doc--mobile-375--dark.png |
| ST-chuong-co-chua-doc | mobile-375 | light | evidence/design-pass/ST-chuong-co-chua-doc--mobile-375--light.png |
| ST-chuong-het-chua-doc | desktop-1280 | dark | evidence/design-pass/ST-chuong-het-chua-doc--desktop-1280--dark.png |
| ST-chuong-het-chua-doc | desktop-1280 | light | evidence/design-pass/ST-chuong-het-chua-doc--desktop-1280--light.png |
| ST-chuong-het-chua-doc | mobile-375 | dark | evidence/design-pass/ST-chuong-het-chua-doc--mobile-375--dark.png |
| ST-chuong-het-chua-doc | mobile-375 | light | evidence/design-pass/ST-chuong-het-chua-doc--mobile-375--light.png |
| ST-chuong-loi | desktop-1280 | dark | evidence/design-pass/ST-chuong-loi--desktop-1280--dark.png |
| ST-chuong-loi | desktop-1280 | light | evidence/design-pass/ST-chuong-loi--desktop-1280--light.png |
| ST-chuong-loi | mobile-375 | dark | evidence/design-pass/ST-chuong-loi--mobile-375--dark.png |
| ST-chuong-loi | mobile-375 | light | evidence/design-pass/ST-chuong-loi--mobile-375--light.png |
| ST-chuong-rong | desktop-1280 | dark | evidence/design-pass/ST-chuong-rong--desktop-1280--dark.png |
| ST-chuong-rong | desktop-1280 | light | evidence/design-pass/ST-chuong-rong--desktop-1280--light.png |
| ST-chuong-rong | mobile-375 | dark | evidence/design-pass/ST-chuong-rong--mobile-375--dark.png |
| ST-chuong-rong | mobile-375 | light | evidence/design-pass/ST-chuong-rong--mobile-375--light.png |
| ST-ngu-canh | desktop-1280 | dark | evidence/design-pass/ST-ngu-canh--desktop-1280--dark.png |
| ST-ngu-canh | desktop-1280 | light | evidence/design-pass/ST-ngu-canh--desktop-1280--light.png |
| ST-ngu-canh | mobile-375 | dark | evidence/design-pass/ST-ngu-canh--mobile-375--dark.png |
| ST-ngu-canh | mobile-375 | light | evidence/design-pass/ST-ngu-canh--mobile-375--light.png |
| ST-trang-cho-tai | desktop-1280 | dark | evidence/design-pass/ST-trang-cho-tai--desktop-1280--dark.png |
| ST-trang-cho-tai | desktop-1280 | light | evidence/design-pass/ST-trang-cho-tai--desktop-1280--light.png |
| ST-trang-cho-tai | mobile-375 | dark | evidence/design-pass/ST-trang-cho-tai--mobile-375--dark.png |
| ST-trang-cho-tai | mobile-375 | light | evidence/design-pass/ST-trang-cho-tai--mobile-375--light.png |
| ST-trang-co | desktop-1280 | dark | evidence/design-pass/ST-trang-co--desktop-1280--dark.png |
| ST-trang-co | desktop-1280 | light | evidence/design-pass/ST-trang-co--desktop-1280--light.png |
| ST-trang-co | mobile-375 | dark | evidence/design-pass/ST-trang-co--mobile-375--dark.png |
| ST-trang-co | mobile-375 | light | evidence/design-pass/ST-trang-co--mobile-375--light.png |
| ST-trang-loc-chua-doc-rong | desktop-1280 | dark | evidence/design-pass/ST-trang-loc-chua-doc-rong--desktop-1280--dark.png |
| ST-trang-loc-chua-doc-rong | desktop-1280 | light | evidence/design-pass/ST-trang-loc-chua-doc-rong--desktop-1280--light.png |
| ST-trang-loc-chua-doc-rong | mobile-375 | dark | evidence/design-pass/ST-trang-loc-chua-doc-rong--mobile-375--dark.png |
| ST-trang-loc-chua-doc-rong | mobile-375 | light | evidence/design-pass/ST-trang-loc-chua-doc-rong--mobile-375--light.png |
| ST-trang-loi | desktop-1280 | dark | evidence/design-pass/ST-trang-loi--desktop-1280--dark.png |
| ST-trang-loi | desktop-1280 | light | evidence/design-pass/ST-trang-loi--desktop-1280--light.png |
| ST-trang-loi | mobile-375 | dark | evidence/design-pass/ST-trang-loi--mobile-375--dark.png |
| ST-trang-loi | mobile-375 | light | evidence/design-pass/ST-trang-loi--mobile-375--light.png |
| ST-trang-rong | desktop-1280 | dark | evidence/design-pass/ST-trang-rong--desktop-1280--dark.png |
| ST-trang-rong | desktop-1280 | light | evidence/design-pass/ST-trang-rong--desktop-1280--light.png |
| ST-trang-rong | mobile-375 | dark | evidence/design-pass/ST-trang-rong--mobile-375--dark.png |
| ST-trang-rong | mobile-375 | light | evidence/design-pass/ST-trang-rong--mobile-375--light.png |

## Cảnh ngữ-cảnh

- evidence/design-pass/ST-ngu-canh--desktop-1280--dark.png
- evidence/design-pass/ST-ngu-canh--desktop-1280--light.png
- evidence/design-pass/ST-ngu-canh--mobile-375--dark.png
- evidence/design-pass/ST-ngu-canh--mobile-375--light.png

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Dòng đã đọc mang chấm xám giống dòng chưa đọc → chỉ dòng chưa đọc có chấm, dòng đã đọc giữ chỗ trống cùng bề rộng.
- Trang Thông báo lặp ngày ở mỗi dòng («Hôm qua» rồi «Hôm qua, 08:30») → trong nhóm theo ngày, dòng chỉ ghi giờ.
- Mở chuông, tiêu điểm nhảy vào nút «Đánh dấu tất cả đã đọc» và viền nó như đang chọn → tiêu điểm vào khung ô bật ra.
- «Xem tất cả» kiểu chữ liên kết màu thương hiệu gần như không đọc được ở nền tối → nút nhẹ (`ghost`) có sẵn.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Kiểu chữ liên kết (`Button variant="link"`) dùng màu thương hiệu ở cả hai nền, nên ở nền tối tương phản thấp ở mọi
  chỗ dùng nó, không riêng chuông. Đề xuất: một việc riêng ở `packages/ui` cho màu liên kết nền tối (theo luật «ring
  sáng hơn ở nền tối» của docs/design.md). Vòng này tránh bằng nút nhẹ.
