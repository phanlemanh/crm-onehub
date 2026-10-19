---
slug: dieu-huong-khu-muc-tieu
at: 2026-10-15T02:43:25Z
route: http://localhost:3410/proto/dieu-huong-khu-muc-tieu
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong-pham-vi)
options: http://localhost:3410/proto/dieu-huong-khu-muc-tieu?state=ST-dhk-don-vi · http://localhost:3410/proto/dieu-huong-khu-muc-tieu?state=ST-dhk-hoi-1-gom
divergence: opened
ds_skill: repo-tokens
states: [ST-dhk-don-vi, ST-dhk-cua-toi, ST-dhk-toan-canh, ST-dhk-suc-khoe, ST-dhk-menu, ST-dhk-soan, ST-dhk-khong-quyen, ST-dhk-khong-dan, ST-dhk-hoi-1-gom]
breakpoints: [mobile-375, desktop-1280]
themes: [dark]
patched: 0
deferred: 2
---
# design-pass — dieu-huong-khu-muc-tieu

Bản mẫu dựng từ component thật của kho trong khung ứng dụng tĩnh (thanh bên, đầu ứng dụng) — khung host giả tĩnh
bọc đầu trang khu, nên thấy được chỗ sống của nó; thân từng thẻ là ô giữ chỗ vì lượt này không đổi thân trang.
Mọi ảnh: không tràn ngang (scrollWidth − innerWidth = 0) ở cả hai khổ. App dựng ở giao diện tối của máy chụp.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-dhk-don-vi | desktop-1280 | dark | evidence/design-pass/ST-dhk-don-vi--desktop-1280.png |
| ST-dhk-don-vi | mobile-375 | dark | evidence/design-pass/ST-dhk-don-vi--mobile-375.png |
| ST-dhk-cua-toi | desktop-1280 | dark | evidence/design-pass/ST-dhk-cua-toi--desktop-1280.png |
| ST-dhk-cua-toi | mobile-375 | dark | evidence/design-pass/ST-dhk-cua-toi--mobile-375.png |
| ST-dhk-toan-canh | desktop-1280 | dark | evidence/design-pass/ST-dhk-toan-canh--desktop-1280.png |
| ST-dhk-toan-canh | mobile-375 | dark | evidence/design-pass/ST-dhk-toan-canh--mobile-375.png |
| ST-dhk-suc-khoe | desktop-1280 | dark | evidence/design-pass/ST-dhk-suc-khoe--desktop-1280.png |
| ST-dhk-suc-khoe | mobile-375 | dark | evidence/design-pass/ST-dhk-suc-khoe--mobile-375.png |
| ST-dhk-menu | desktop-1280 | dark | evidence/design-pass/ST-dhk-menu--desktop-1280.png |
| ST-dhk-menu | mobile-375 | dark | evidence/design-pass/ST-dhk-menu--mobile-375.png |
| ST-dhk-soan | desktop-1280 | dark | evidence/design-pass/ST-dhk-soan--desktop-1280.png |
| ST-dhk-soan | mobile-375 | dark | evidence/design-pass/ST-dhk-soan--mobile-375.png |
| ST-dhk-khong-quyen | desktop-1280 | dark | evidence/design-pass/ST-dhk-khong-quyen--desktop-1280.png |
| ST-dhk-khong-quyen | mobile-375 | dark | evidence/design-pass/ST-dhk-khong-quyen--mobile-375.png |
| ST-dhk-khong-dan | desktop-1280 | dark | evidence/design-pass/ST-dhk-khong-dan--desktop-1280.png |
| ST-dhk-khong-dan | mobile-375 | dark | evidence/design-pass/ST-dhk-khong-dan--mobile-375.png |
| ST-dhk-hoi-1-gom | desktop-1280 | dark | evidence/design-pass/ST-dhk-hoi-1-gom--desktop-1280.png |
| ST-dhk-hoi-1-gom | mobile-375 | dark | evidence/design-pass/ST-dhk-hoi-1-gom--mobile-375.png |

## Bước phân kỳ — câu Hỏi-1

Trục: chỗ đứng của lối «Soạn OKR cùng Kara» trong đầu trang.

- **Nút viền hiện sẵn** (máy khuyên, state ST-dhk-don-vi) — động cơ: lối soạn cùng Kara thấy được ngay, nút giữ
  nguyên năm lý do khoá trong nút «i»; đánh đổi: ở 375 px hàng hành động xuống hai dòng, «Thêm mục tiêu» nằm dòng dưới.
- **Gom vào «…»** (state ST-dhk-hoi-1-gom, đúng chữ A2 và bản mẫu 14/10) — động cơ: đầu trang gọn một hàng ở mọi
  khổ, giống bản mẫu đã đo; đánh đổi: lối soạn khuất sau một cú bấm, lý do khoá phải viết lại thành dòng phụ của mục menu.

## Cảnh ngữ-cảnh

- Không cần: nấc `static-frame` — khung ứng dụng đã bọc vật trong mọi ảnh.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Không có.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Kho khai `design_pass.ds_skill: web-design-guidelines` nhưng phiên này không có skill đó — phiên chạy trên từ vựng token của kho (`packages/ui`); quyết giữ nấc này làm chuẩn hay cài skill.
- Ở 375 px lối nút viền làm hàng hành động xuống hai dòng; nếu chọn lối này mà muốn một hàng thì cần một biến thể nút chỉ-biểu-tượng cho «Soạn OKR cùng Kara» ở khổ hẹp — `packages/ui` chưa có quy ước đó.
