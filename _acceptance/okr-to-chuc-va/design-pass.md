---
slug: okr-to-chuc-va
at: 2026-10-04T14:10:00Z
route: http://localhost:3000/proto/okr-to-chuc-va (phiên đo riêng qua mot-luot.sh, PROTO_ROUTE=1)
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (anh-goi-kem-the-cong-pham-vi)
options:
divergence: skipped — mỗi lỗi có một hướng khuyên; hướng bỏ (R1m-7 lối A, B; #30 khôi phục vào «chưa xếp bộ phận») và lý do ở design doc, người veto ở Cổng Phạm vi
ds_skill: web-design-guidelines
states: [ST-donvi-quantri-them, ST-donvi-thanhvien, ST-luutru-chan-en, ST-luutru-khoiphuc-chan]
breakpoints: [mobile-375, desktop-1280]
themes: [light]
patched: 2
deferred: 0
---
# design-pass — okr-to-chuc-va

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-donvi-quantri-them | mobile-375 | light | evidence/design-pass/ST-donvi-quantri-them--mobile-375--light.png |
| ST-donvi-quantri-them | desktop-1280 | light | evidence/design-pass/ST-donvi-quantri-them--desktop-1280--light.png |
| ST-donvi-thanhvien | mobile-375 | light | evidence/design-pass/ST-donvi-thanhvien--mobile-375--light.png |
| ST-donvi-thanhvien | desktop-1280 | light | evidence/design-pass/ST-donvi-thanhvien--desktop-1280--light.png |
| ST-luutru-chan-en | mobile-375 | light | evidence/design-pass/ST-luutru-chan-en--mobile-375--light.png |
| ST-luutru-chan-en | desktop-1280 | light | evidence/design-pass/ST-luutru-chan-en--desktop-1280--light.png |
| ST-luutru-khoiphuc-chan | mobile-375 | light | evidence/design-pass/ST-luutru-khoiphuc-chan--mobile-375--light.png |
| ST-luutru-khoiphuc-chan | desktop-1280 | light | evidence/design-pass/ST-luutru-khoiphuc-chan--desktop-1280--light.png |

Bộ chụp: `rang/chup-proto.mjs` (puppeteer, hai khổ × bốn trạng thái, bấm thật ở trạng thái khôi phục).
Trình duyệt headless theo giao diện mặc định của app; tên tệp giữ hậu tố `light` như các hồ sơ trước.

## Cảnh ngữ-cảnh

- Không cần: bản mẫu chạy trong host thật (`/proto` của app, cờ `PROTO_ROUTE`), các trạng thái là màn có sẵn (Theo đơn vị, Cài đặt › Tổ chức).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Toast từ chối khôi phục hiện hai lần vì bắn trong effect (chế độ dev chạy effect hai lần) — bỏ effect, bộ chụp bấm «Khôi phục» thật như người dùng.
- Danh sách «Đã lưu trữ» thu gọn nên ảnh không thấy hàng nào — bộ chụp mở danh sách trước khi bấm, không sửa `ArchivedList`.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Không có.
