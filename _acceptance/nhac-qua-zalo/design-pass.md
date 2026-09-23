---
slug: nhac-qua-zalo
at: 2026-09-23T08:40:00Z
route: http://localhost:3300/proto/nhac-qua-zalo
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (ghim)
options:
divergence: skipped — khuôn đã chốt ở brainstorm: trang cài đặt một cột theo Linear/GitHub Notifications, nhóm chọn kênh bằng ToggleGroup sẵn có, trang kết nối theo khuôn trang Slack (d-…-7 trong sổ quyết định)
ds_skill: web-design-guidelines
states: [ST-thong-bao-chua-noi, ST-thong-bao-ma-cho, ST-thong-bao-ma-het-han, ST-thong-bao-da-noi, ST-thong-bao-lech, ST-thong-bao-zalo-tat, ST-thong-bao-luu-loi, ST-thong-bao-dang-tai, ST-ket-noi-zalo-song, ST-ket-noi-zalo-im, ST-ket-noi-zalo-tat]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 2
deferred: 2
---
# design-pass — nhac-qua-zalo

Bản mẫu ghép từ component thật của `packages/ui`, bọc trong khung Cài đặt dạng
tĩnh (thanh bên có mục mới «Thông báo của bạn»). Dữ liệu giả, không đường ghi.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-ket-noi-zalo-im | desktop-1280 | dark | evidence/design-pass/ST-ket-noi-zalo-im--desktop-1280--dark.png |
| ST-ket-noi-zalo-im | desktop-1280 | light | evidence/design-pass/ST-ket-noi-zalo-im--desktop-1280--light.png |
| ST-ket-noi-zalo-im | mobile-375 | light | evidence/design-pass/ST-ket-noi-zalo-im--mobile-375--light.png |
| ST-ket-noi-zalo-song | desktop-1280 | light | evidence/design-pass/ST-ket-noi-zalo-song--desktop-1280--light.png |
| ST-ket-noi-zalo-song | mobile-375 | light | evidence/design-pass/ST-ket-noi-zalo-song--mobile-375--light.png |
| ST-ket-noi-zalo-tat | desktop-1280 | light | evidence/design-pass/ST-ket-noi-zalo-tat--desktop-1280--light.png |
| ST-ket-noi-zalo-tat | mobile-375 | light | evidence/design-pass/ST-ket-noi-zalo-tat--mobile-375--light.png |
| ST-thong-bao-chua-noi | desktop-1280 | light | evidence/design-pass/ST-thong-bao-chua-noi--desktop-1280--light.png |
| ST-thong-bao-chua-noi | mobile-375 | light | evidence/design-pass/ST-thong-bao-chua-noi--mobile-375--light.png |
| ST-thong-bao-da-noi | desktop-1280 | light | evidence/design-pass/ST-thong-bao-da-noi--desktop-1280--light.png |
| ST-thong-bao-da-noi | mobile-375 | light | evidence/design-pass/ST-thong-bao-da-noi--mobile-375--light.png |
| ST-thong-bao-dang-tai | desktop-1280 | light | evidence/design-pass/ST-thong-bao-dang-tai--desktop-1280--light.png |
| ST-thong-bao-dang-tai | mobile-375 | light | evidence/design-pass/ST-thong-bao-dang-tai--mobile-375--light.png |
| ST-thong-bao-lech | desktop-1280 | dark | evidence/design-pass/ST-thong-bao-lech--desktop-1280--dark.png |
| ST-thong-bao-lech | desktop-1280 | light | evidence/design-pass/ST-thong-bao-lech--desktop-1280--light.png |
| ST-thong-bao-lech | mobile-375 | light | evidence/design-pass/ST-thong-bao-lech--mobile-375--light.png |
| ST-thong-bao-luu-loi | desktop-1280 | light | evidence/design-pass/ST-thong-bao-luu-loi--desktop-1280--light.png |
| ST-thong-bao-luu-loi | mobile-375 | light | evidence/design-pass/ST-thong-bao-luu-loi--mobile-375--light.png |
| ST-thong-bao-ma-cho | desktop-1280 | dark | evidence/design-pass/ST-thong-bao-ma-cho--desktop-1280--dark.png |
| ST-thong-bao-ma-cho | desktop-1280 | light | evidence/design-pass/ST-thong-bao-ma-cho--desktop-1280--light.png |
| ST-thong-bao-ma-cho | mobile-375 | light | evidence/design-pass/ST-thong-bao-ma-cho--mobile-375--light.png |
| ST-thong-bao-ma-het-han | desktop-1280 | light | evidence/design-pass/ST-thong-bao-ma-het-han--desktop-1280--light.png |
| ST-thong-bao-ma-het-han | mobile-375 | light | evidence/design-pass/ST-thong-bao-ma-het-han--mobile-375--light.png |
| ST-thong-bao-zalo-tat | desktop-1280 | light | evidence/design-pass/ST-thong-bao-zalo-tat--desktop-1280--light.png |
| ST-thong-bao-zalo-tat | mobile-375 | light | evidence/design-pass/ST-thong-bao-zalo-tat--mobile-375--light.png |

## Cảnh ngữ-cảnh

- Không áp: nấc `static-frame` — mỗi ảnh đã là khung Cài đặt bọc vật, thanh bên cho thấy chỗ vào.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Nhãn hướng «Mang vào» đổi thành «Mang về» cho khớp từ trang Kết nối đang dùng (`settings-ket-noi.ts` khoá `mangVe`).
- Dòng «Đã nối · <tên Zalo>» ở khổ 375 to hơn chữ thân trang — đưa về bậc `text-sm` như các dòng cùng khối.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Kho chưa có logo Zalo trong `packages/ui/src/components/brand-logos/`; trang kết nối hiện chữ viết tắt «ZA» (hành vi đúng theo `docs/connections.md`). Thêm logo thì là việc riêng, contract đang để ngoài phạm vi.
- `ToggleGroup` chưa có kiểu «đang chọn nhưng không dùng được»: ở trạng thái lệch, lựa chọn Slack vừa đang chọn vừa bị khoá nên hiện mờ. Cảnh báo ngay dưới đã nói rõ kênh sẽ dùng; nếu muốn một kiểu riêng thì làm ở `packages/ui`.
