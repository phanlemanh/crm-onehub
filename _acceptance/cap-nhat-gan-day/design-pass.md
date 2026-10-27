---
slug: cap-nhat-gan-day
at: 2026-10-26T14:05:00Z
route: http://localhost:3300/proto/cap-nhat-gan-day
material: real-components
context: static-frame
context_scenes: []
reaction: nac-2 (ghim — chủ kho bấm thử bản mẫu trước Cổng Phạm vi theo docs/proto.md)
options:
divergence: skipped — đi theo khuôn dòng tin của bản mẫu vo-khu-muc-tieu (ManCapNhat, 2790552ac) và nếp trang Mọi KR; không còn hai hướng bố cục máy không tự chắc
ds_skill: web-design-guidelines
states: [ST-cng-tat-ca, ST-cng-toi-dan, ST-cng-theo-doi, ST-cng-tra-loi, ST-cng-rong-loc, ST-cng-rong, ST-cng-dang-tai, ST-cng-loi]
breakpoints: [mobile-375, desktop-1280]
themes: [light]
patched: 3
deferred: 0
---
# design-pass — cap-nhat-gan-day

Bản mẫu chạy trên cây `laughing-hodgkin-a6aef5` (app riêng ở cổng 3300, `PROTO_ROUTE=1`). Khung là thanh bên khu thật
(`AreaSidebar` của `packages/ui`) bọc trang, nên người duyệt thấy mục thứ bảy «Cập nhật gần đây» nằm ngay dưới «Của tôi»
và chỗ của trang trong khu. Dữ liệu viết sẵn trong module: 7 bộ OKR (OneHub, một bộ phận, năm phòng ban), 11 KR có tên
dài, KR mốc, một lần cập nhật thay, ghi chú dài và trống, ba lần trả lời; tổng giả 214 · 31 · 47 để thấy phân trang.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-cng-tat-ca | desktop-1280 | light | evidence/design-pass/ST-cng-tat-ca--desktop-1280.png |
| ST-cng-tat-ca | mobile-375 | light | evidence/design-pass/ST-cng-tat-ca--mobile-375.png |
| ST-cng-toi-dan | desktop-1280 | light | evidence/design-pass/ST-cng-toi-dan--desktop-1280.png |
| ST-cng-toi-dan | mobile-375 | light | evidence/design-pass/ST-cng-toi-dan--mobile-375.png |
| ST-cng-theo-doi | desktop-1280 | light | evidence/design-pass/ST-cng-theo-doi--desktop-1280.png |
| ST-cng-theo-doi | mobile-375 | light | evidence/design-pass/ST-cng-theo-doi--mobile-375.png |
| ST-cng-tra-loi | desktop-1280 | light | evidence/design-pass/ST-cng-tra-loi--desktop-1280.png |
| ST-cng-tra-loi | mobile-375 | light | evidence/design-pass/ST-cng-tra-loi--mobile-375.png |
| ST-cng-rong-loc | desktop-1280 | light | evidence/design-pass/ST-cng-rong-loc--desktop-1280.png |
| ST-cng-rong-loc | mobile-375 | light | evidence/design-pass/ST-cng-rong-loc--mobile-375.png |
| ST-cng-rong | desktop-1280 | light | evidence/design-pass/ST-cng-rong--desktop-1280.png |
| ST-cng-rong | mobile-375 | light | evidence/design-pass/ST-cng-rong--mobile-375.png |
| ST-cng-dang-tai | desktop-1280 | light | evidence/design-pass/ST-cng-dang-tai--desktop-1280.png |
| ST-cng-dang-tai | mobile-375 | light | evidence/design-pass/ST-cng-dang-tai--mobile-375.png |
| ST-cng-loi | desktop-1280 | light | evidence/design-pass/ST-cng-loi--desktop-1280.png |
| ST-cng-loi | mobile-375 | light | evidence/design-pass/ST-cng-loi--mobile-375.png |

Cả 16 ảnh: trang không tràn ngang (`scrollWidth − innerWidth = 0`). Dưới `md` thanh bên khu tự thành hàng cuộn ngang.

## Cảnh ngữ-cảnh

- Không cần cảnh riêng: `context: static-frame` — bản mẫu đặt trang trong thanh bên khu thật, mỗi ảnh đã là cảnh vào–ra
  (đi từ «Của tôi» sang «Cập nhật gần đây», bấm tên KR thì mở chi tiết KR).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Ô trả lời mở sẵn ở mọi lần mới nhất làm dòng tin dài gấp đôi → đổi thành nút «Trả lời» gọn, bấm mới mở ô (Huỷ · Gửi).
- Thời điểm trong dữ liệu mẫu không giảm dần, làm «mới nhất trước» trông sai → dữ liệu mẫu xếp lại theo thời điểm.
- Dòng gợi ý dưới lần cập nhật cũ quá dài → rút còn «Có lần cập nhật mới hơn — trả lời ở đó.»

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- (không có) — dòng tin ghép từ `Item`, `PersonAvatar`, `ConfidenceIndicator`, `InputGroup`, `ToggleGroup`,
  `TablePagination`, `Empty`, `VungTaiLoi` sẵn có.
