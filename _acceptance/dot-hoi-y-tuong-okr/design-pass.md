---
slug: dot-hoi-y-tuong-okr
at: 2026-09-29T10:30:58Z
route: http://localhost:3370/proto/dot-hoi-y-tuong-okr
material: real-components
context: static-frame
context_scenes: []
reaction: nac-2 (goi-anh-va-vat-bam-duoc; vong-2 theo ra-soat-ux.md, chu kho xem truc tiep tren vat)
options:
divergence: skipped — khuôn một-cột-cuộn theo nếp khu OKR; danh-sách-chi-tiết và kanban đã so ở đặc tả UX mục 6 của thiết kế, không còn hướng máy không tự chắc
ds_skill: web-design-guidelines
states: [ST-hoiy-dang-tai, ST-hoiy-loi, ST-hoiy-trong-quan-tri, ST-hoiy-trong-thanh-vien, ST-mo-sheet, ST-gop-chua-gop, ST-gop-da-gop, ST-gop-het-han, ST-viet-truoc, ST-gom, ST-chon-chua-du, ST-chon-du, ST-ket-qua, ST-ket-qua-da-hieu]
breakpoints: [mobile-375, desktop-1280]
themes: [dark]
patched: 9
deferred: 7
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

- Vòng 2 (rà soát UX, chủ kho duyệt áp cả bảy, `ra-soat-ux.md`):
  - A: thanh tab trong khung cuộn ngang, tự cuộn tab đang đứng vào khung nhìn — tab «Hỏi ý» ở x 329–359 trong 375 ở cả 14 trạng thái.
  - B: trạng thái góp xếp dải pha → câu hỏi → lời mở gập ba dòng («Đọc thêm») → thẻ con số lưới hai cột → ô soạn; mép trên ô soạn 781px ở 375 (trước 885px) — đạt sát, chỉ lộ khoảng 31px của ô.
  - C: lý do của người chọn hiện đủ theo bố cục `review-3` ở «Ý của bạn đi đâu» và kho ý — 0 đoạn bị cắt.
  - D: gom theo bố cục `wishlist-1` — ô chọn + menu «…», thanh «N ý đã chọn · Đưa vào chủ đề… · Bỏ chọn» chỉ hiện khi đã chọn; 0/5 dòng phụ bị cắt.
  - E: dải pha `StepList` tĩnh ba bước kèm dòng hạn, số người đã góp hay lúc công bố, tên người chọn, ở mọi trạng thái có lần hỏi ý.
  - F: dòng đếm «4/6 chủ đề đã kết luận»; thanh công bố «Chưa công bố được — còn 4 điều» liệt từng điều thành liên kết, bấm thì cuộn và đặt tiêu điểm vào đúng thẻ; bản viết trước dính khi cuộn ở ≥ lg.
  - G: 15 ý đồng nghiệp theo một hoán vị cố định cho người xem, hiện 10 rồi «Hiện thêm 5 ý».

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
- (vòng 2) `CardDescription` tự ẩn dưới 640px, nên mọi lời giải thích đặt ở đó biến mất
  trên điện thoại (câu «không kèm tên», lý do danh sách ý bị khoá). Đề xuất: biến thể
  luôn hiện; tới lúc đó dựng thật dùng `ItemDescription` hoặc đoạn văn trong nội dung.
- (vòng 2) `ItemTitle` cắt một dòng, `ItemDescription` cắt hai dòng, không có thân không
  cắt — chữ người nhập dài phải ra đoạn văn trong `ItemContent`. Đề xuất: biến thể không cắt.
- (vòng 2) `StepList` chỉ xếp dọc (khoảng 110px ở 375) và chế độ tĩnh không đánh dấu bước
  hiện tại — bản mẫu gắn tay một `Badge` «Bây giờ». Đề xuất: kiểu xếp ngang và bước hiện
  tại cho chế độ tĩnh (tham chiếu `c-timeline-12` của ReUI).

