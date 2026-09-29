---
slug: dot-hoi-y-tuong-okr
at: 2026-09-29T10:05:32Z
route: http://localhost:3370/proto/dot-hoi-y-tuong-okr
material: real-components
context: static-frame
context_scenes: []
reaction: nac-2 (goi-anh-va-vat-bam-duoc)
options:
divergence: skipped — khuôn một-cột-cuộn theo nếp khu OKR; danh-sách-chi-tiết và kanban đã so ở đặc tả UX mục 6 của thiết kế, không còn hướng máy không tự chắc
ds_skill: web-design-guidelines
states: [ST-hoiy-dang-tai, ST-hoiy-loi, ST-hoiy-trong-quan-tri, ST-hoiy-trong-thanh-vien, ST-mo-sheet, ST-gop-chua-gop, ST-gop-da-gop, ST-gop-het-han, ST-viet-truoc, ST-gom, ST-chon-chua-du, ST-chon-du, ST-ket-qua, ST-ket-qua-da-hieu]
breakpoints: [mobile-375, desktop-1280]
themes: [dark]
patched: 2
deferred: 4
---
# design-pass — dot-hoi-y-tuong-okr

Bản mẫu dựng bằng thành phần thật của `packages/ui`, trong khung khu OKR tĩnh
(`ban-mau-okr/phan-chung.tsx`, thêm tab «Hỏi ý» bằng một prop tuỳ chọn, không đổi
hành vi các bản mẫu khác). Máy chủ dev riêng của cây này ở cổng 3370, `PROTO_ROUTE=1`.
Nấc phản ứng khuyên: nac-2 — không đồng bộ trên vật bấm được, vì quyết định mở là
một luồng nhiều bước (góp → gom → kết luận → công bố → kết quả) và thanh công bố đổi
theo từng lần kết luận. 28 ảnh; không trạng thái nào tràn ngang ở 375 (đo
`scrollWidth > innerWidth` trên từng ảnh, `ma-tran.json`).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-hoiy-dang-tai | mobile-375 | dark | evidence/design-pass/ST-hoiy-dang-tai--mobile-375.png |
| ST-hoiy-loi | mobile-375 | dark | evidence/design-pass/ST-hoiy-loi--mobile-375.png |
| ST-hoiy-trong-quan-tri | mobile-375 | dark | evidence/design-pass/ST-hoiy-trong-quan-tri--mobile-375.png |
| ST-hoiy-trong-thanh-vien | mobile-375 | dark | evidence/design-pass/ST-hoiy-trong-thanh-vien--mobile-375.png |
| ST-mo-sheet | mobile-375 | dark | evidence/design-pass/ST-mo-sheet--mobile-375.png |
| ST-gop-chua-gop | mobile-375 | dark | evidence/design-pass/ST-gop-chua-gop--mobile-375.png |
| ST-gop-da-gop | mobile-375 | dark | evidence/design-pass/ST-gop-da-gop--mobile-375.png |
| ST-gop-het-han | mobile-375 | dark | evidence/design-pass/ST-gop-het-han--mobile-375.png |
| ST-viet-truoc | mobile-375 | dark | evidence/design-pass/ST-viet-truoc--mobile-375.png |
| ST-gom | mobile-375 | dark | evidence/design-pass/ST-gom--mobile-375.png |
| ST-chon-chua-du | mobile-375 | dark | evidence/design-pass/ST-chon-chua-du--mobile-375.png |
| ST-chon-du | mobile-375 | dark | evidence/design-pass/ST-chon-du--mobile-375.png |
| ST-ket-qua | mobile-375 | dark | evidence/design-pass/ST-ket-qua--mobile-375.png |
| ST-ket-qua-da-hieu | mobile-375 | dark | evidence/design-pass/ST-ket-qua-da-hieu--mobile-375.png |
| ST-hoiy-dang-tai | desktop-1280 | dark | evidence/design-pass/ST-hoiy-dang-tai--desktop-1280.png |
| ST-hoiy-loi | desktop-1280 | dark | evidence/design-pass/ST-hoiy-loi--desktop-1280.png |
| ST-hoiy-trong-quan-tri | desktop-1280 | dark | evidence/design-pass/ST-hoiy-trong-quan-tri--desktop-1280.png |
| ST-hoiy-trong-thanh-vien | desktop-1280 | dark | evidence/design-pass/ST-hoiy-trong-thanh-vien--desktop-1280.png |
| ST-mo-sheet | desktop-1280 | dark | evidence/design-pass/ST-mo-sheet--desktop-1280.png |
| ST-gop-chua-gop | desktop-1280 | dark | evidence/design-pass/ST-gop-chua-gop--desktop-1280.png |
| ST-gop-da-gop | desktop-1280 | dark | evidence/design-pass/ST-gop-da-gop--desktop-1280.png |
| ST-gop-het-han | desktop-1280 | dark | evidence/design-pass/ST-gop-het-han--desktop-1280.png |
| ST-viet-truoc | desktop-1280 | dark | evidence/design-pass/ST-viet-truoc--desktop-1280.png |
| ST-gom | desktop-1280 | dark | evidence/design-pass/ST-gom--desktop-1280.png |
| ST-chon-chua-du | desktop-1280 | dark | evidence/design-pass/ST-chon-chua-du--desktop-1280.png |
| ST-chon-du | desktop-1280 | dark | evidence/design-pass/ST-chon-du--desktop-1280.png |
| ST-ket-qua | desktop-1280 | dark | evidence/design-pass/ST-ket-qua--desktop-1280.png |
| ST-ket-qua-da-hieu | desktop-1280 | dark | evidence/design-pass/ST-ket-qua-da-hieu--desktop-1280.png |

## Cảnh ngữ-cảnh

- Không cần: `context: static-frame` — bản mẫu nằm trong khung khu OKR (thanh bên,
  tiêu đề «Hỏi ý mục tiêu», bốn tab có sẵn và tab «Hỏi ý», chọn chu kỳ «Năm 2027»).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Ô «Nối với câu viết trước» làm cả trang tràn ngang ở 375 khi câu dài: lưới hai cột
  của khối «Chọn» đổi sang một cột có cận trên (`grid-cols-1 md:grid-cols-2`).
- Tiêu đề «CEO viết trước, rồi chọn» dùng chữ «CEO» mà từ điển tránh trên màn: đổi
  thành «<tên người chọn> viết trước, rồi chọn».

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `Heatmap` in chú giải cứng về KR («Ô càng nổi khỏi nền, càng nhiều KR tự tin cao»,
  «tuần chưa tới hoặc chưa ai cập nhật») — sai nghĩa trên màn độ phủ. Đề xuất: prop
  chú giải trong `packages/ui` (đã có trong thiết kế, mục Xuất xứ component).
- Không có thanh hành động dính đáy nhiều dòng: `SaveBar` cắt chữ một dòng nên ở 375
  mất danh sách điều còn thiếu; bản mẫu ghép `Alert` + `AlertAction`, mà `Alert` mang
  `role="alert"` nên trình đọc màn hình đọc lại mỗi lần danh sách đổi. Đề xuất: biến
  thể thanh công bố trong `packages/ui` (hoặc `SaveBar` nhận danh sách), vai `status`.
- Không có thành phần trích dẫn: câu trích của người góp và lý do của người chọn dùng
  thẻ trích của trình duyệt trong `ItemTitle`/`ItemDescription`. Đề xuất: giữ như
  vậy ở lượt này; thành phần trích là việc chung của kho.
- `Empty` không có biến thể có viền; bản mẫu theo cách bản mẫu OKR cũ (`className="border"`).
  Đề xuất: biến thể `outline` trong `packages/ui` khi dựng thật.
