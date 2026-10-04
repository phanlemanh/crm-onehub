---
slug: gop-y-dung-cho
at: 2026-10-03T12:51:42Z
route: http://localhost:3300/proto/gop-y-dung-cho
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim)
options:
divergence: skipped — hướng A+B đã chốt ở Cổng Đáng (01/10) và ba câu S1 đã trả lời 03/10; vòng này dựng lại hướng đã chốt trên bảng mới, không mở hướng mới
ds_skill: web-design-guidelines
states: [ST-hien-tai, ST-a-danh-sach, ST-a-loc, ST-b-chi-tiet, ST-b-bien-nhan, ST-b-chua-goi, ST-b-dang-doc, ST-b-rong, ST-b-loi, ST-b-het-luot, ST-b-tat, ST-b-hop-sua, ST-b-hop-sua-kr]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 9
deferred: 5
---
# design-pass — gop-y-dung-cho

Bản mẫu chạy trong app thật sau cờ `PROTO_ROUTE` (máy chủ dev riêng của worktree,
cổng 3300). Danh sách dựng trên `BangMucTieu` của proto `muc-tieu-va-kr` qua điểm cắm
`nhanMucTieu`; khung chi tiết theo khuôn khung chi tiết của proto đó; mọi khối Kara là
thành phần thật của `packages/ui` (#235): `KaraMark`, `KaraLabel`, `ProposedChange`
inline, `ProposedChangeReceipt`, `ThinkingIndicator`, `DataTableFacetMenu`. Proto không
gọi tRPC: dữ liệu giả, quyết định chỉ sống trong trạng thái của trang.

Mốc «trước» (proto cũ của #230, dựng trên Card) chụp ở `evidence/design-pass/truoc--*`
(4 trạng thái × 2 khổ, sáng).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-a-danh-sach | desktop-1280 | dark | evidence/design-pass/ST-a-danh-sach--desktop-1280--dark.png |
| ST-a-danh-sach | desktop-1280 | light | evidence/design-pass/ST-a-danh-sach--desktop-1280--light.png |
| ST-a-danh-sach | mobile-375 | dark | evidence/design-pass/ST-a-danh-sach--mobile-375--dark.png |
| ST-a-danh-sach | mobile-375 | light | evidence/design-pass/ST-a-danh-sach--mobile-375--light.png |
| ST-a-loc | desktop-1280 | dark | evidence/design-pass/ST-a-loc--desktop-1280--dark.png |
| ST-a-loc | desktop-1280 | light | evidence/design-pass/ST-a-loc--desktop-1280--light.png |
| ST-a-loc | mobile-375 | dark | evidence/design-pass/ST-a-loc--mobile-375--dark.png |
| ST-a-loc | mobile-375 | light | evidence/design-pass/ST-a-loc--mobile-375--light.png |
| ST-b-bien-nhan | desktop-1280 | dark | evidence/design-pass/ST-b-bien-nhan--desktop-1280--dark.png |
| ST-b-bien-nhan | desktop-1280 | light | evidence/design-pass/ST-b-bien-nhan--desktop-1280--light.png |
| ST-b-bien-nhan | mobile-375 | dark | evidence/design-pass/ST-b-bien-nhan--mobile-375--dark.png |
| ST-b-bien-nhan | mobile-375 | light | evidence/design-pass/ST-b-bien-nhan--mobile-375--light.png |
| ST-b-chi-tiet | desktop-1280 | dark | evidence/design-pass/ST-b-chi-tiet--desktop-1280--dark.png |
| ST-b-chi-tiet | desktop-1280 | light | evidence/design-pass/ST-b-chi-tiet--desktop-1280--light.png |
| ST-b-chi-tiet | mobile-375 | dark | evidence/design-pass/ST-b-chi-tiet--mobile-375--dark.png |
| ST-b-chi-tiet | mobile-375 | light | evidence/design-pass/ST-b-chi-tiet--mobile-375--light.png |
| ST-b-chua-goi | desktop-1280 | dark | evidence/design-pass/ST-b-chua-goi--desktop-1280--dark.png |
| ST-b-chua-goi | desktop-1280 | light | evidence/design-pass/ST-b-chua-goi--desktop-1280--light.png |
| ST-b-chua-goi | mobile-375 | dark | evidence/design-pass/ST-b-chua-goi--mobile-375--dark.png |
| ST-b-chua-goi | mobile-375 | light | evidence/design-pass/ST-b-chua-goi--mobile-375--light.png |
| ST-b-dang-doc | desktop-1280 | dark | evidence/design-pass/ST-b-dang-doc--desktop-1280--dark.png |
| ST-b-dang-doc | desktop-1280 | light | evidence/design-pass/ST-b-dang-doc--desktop-1280--light.png |
| ST-b-dang-doc | mobile-375 | dark | evidence/design-pass/ST-b-dang-doc--mobile-375--dark.png |
| ST-b-dang-doc | mobile-375 | light | evidence/design-pass/ST-b-dang-doc--mobile-375--light.png |
| ST-b-het-luot | desktop-1280 | dark | evidence/design-pass/ST-b-het-luot--desktop-1280--dark.png |
| ST-b-het-luot | desktop-1280 | light | evidence/design-pass/ST-b-het-luot--desktop-1280--light.png |
| ST-b-het-luot | mobile-375 | dark | evidence/design-pass/ST-b-het-luot--mobile-375--dark.png |
| ST-b-het-luot | mobile-375 | light | evidence/design-pass/ST-b-het-luot--mobile-375--light.png |
| ST-b-hop-sua | desktop-1280 | dark | evidence/design-pass/ST-b-hop-sua--desktop-1280--dark.png |
| ST-b-hop-sua | desktop-1280 | light | evidence/design-pass/ST-b-hop-sua--desktop-1280--light.png |
| ST-b-hop-sua | mobile-375 | dark | evidence/design-pass/ST-b-hop-sua--mobile-375--dark.png |
| ST-b-hop-sua | mobile-375 | light | evidence/design-pass/ST-b-hop-sua--mobile-375--light.png |
| ST-b-hop-sua-kr | desktop-1280 | dark | evidence/design-pass/ST-b-hop-sua-kr--desktop-1280--dark.png |
| ST-b-hop-sua-kr | desktop-1280 | light | evidence/design-pass/ST-b-hop-sua-kr--desktop-1280--light.png |
| ST-b-hop-sua-kr | mobile-375 | dark | evidence/design-pass/ST-b-hop-sua-kr--mobile-375--dark.png |
| ST-b-hop-sua-kr | mobile-375 | light | evidence/design-pass/ST-b-hop-sua-kr--mobile-375--light.png |
| ST-b-loi | desktop-1280 | dark | evidence/design-pass/ST-b-loi--desktop-1280--dark.png |
| ST-b-loi | desktop-1280 | light | evidence/design-pass/ST-b-loi--desktop-1280--light.png |
| ST-b-loi | mobile-375 | dark | evidence/design-pass/ST-b-loi--mobile-375--dark.png |
| ST-b-loi | mobile-375 | light | evidence/design-pass/ST-b-loi--mobile-375--light.png |
| ST-b-rong | desktop-1280 | dark | evidence/design-pass/ST-b-rong--desktop-1280--dark.png |
| ST-b-rong | desktop-1280 | light | evidence/design-pass/ST-b-rong--desktop-1280--light.png |
| ST-b-rong | mobile-375 | dark | evidence/design-pass/ST-b-rong--mobile-375--dark.png |
| ST-b-rong | mobile-375 | light | evidence/design-pass/ST-b-rong--mobile-375--light.png |
| ST-b-tat | desktop-1280 | dark | evidence/design-pass/ST-b-tat--desktop-1280--dark.png |
| ST-b-tat | desktop-1280 | light | evidence/design-pass/ST-b-tat--desktop-1280--light.png |
| ST-b-tat | mobile-375 | dark | evidence/design-pass/ST-b-tat--mobile-375--dark.png |
| ST-b-tat | mobile-375 | light | evidence/design-pass/ST-b-tat--mobile-375--light.png |
| ST-hien-tai | desktop-1280 | dark | evidence/design-pass/ST-hien-tai--desktop-1280--dark.png |
| ST-hien-tai | desktop-1280 | light | evidence/design-pass/ST-hien-tai--desktop-1280--light.png |
| ST-hien-tai | mobile-375 | dark | evidence/design-pass/ST-hien-tai--mobile-375--dark.png |
| ST-hien-tai | mobile-375 | light | evidence/design-pass/ST-hien-tai--mobile-375--light.png |

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded` — bản mẫu chạy trong khung trang OKR thật (thanh
  điều hướng, tab Theo đơn vị, chu kỳ), khung chi tiết và hộp Sửa mở đè lên danh sách.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Mốc cũ ở 375: tên mục tiêu bị ép còn ~50 px, bảng KR tràn cắt cột Đích, nút «Đổi tên KR»
  bị cắt, câu hỏi của Kara vỡ thành cột hẹp → dựng lại trên `BangMucTieu`/bảng KR có cột ẩn
  dưới `sm`/`md`; 52 ảnh, 0 tràn ngang.
- Chip danh sách là chữ tĩnh cạnh nhãn trạng thái → `Button` viền cỡ `xs` bọc `KaraMark`,
  là liên kết mở khung chi tiết, `aria-label` nói số góp ý và tên mục tiêu, chặn nổi bọt (hàng
  không thu/mở khi bấm chip — đo tay: `aria-expanded` giữ `true`).
- Proto cũ thiếu 9/13 trạng thái → thêm lọc, biên nhận, chưa gọi, đang đọc, rỗng, lỗi, hết
  lượt, tắt, hộp Sửa KR.
- Trạng thái đang đọc và hết lượt có hai dấu Kara chồng nhau (`KaraMark` + chữ/ nút đã mang
  tia sáng) → bỏ `KaraMark` thừa.
- Trạng thái rỗng không có lối đi tiếp → thêm «Nhờ Kara đọc lại» trong `EmptyContent`.
- Biên nhận bỏ qua nhắc lại tên KR ngay dưới chính KR đó → nói nội dung đã bỏ qua: «Đã bỏ qua
  câu hỏi của Kara: KR này là việc, chưa phải kết quả», «Đã bỏ qua tên Kara đề xuất: «…»» (U4/U6).
- Dòng dẫn hộp Sửa: phạm vi dài làm `KaraMark` gãy thành hai cột; mô tả bị cắt «…» ở 375 →
  `KaraMark` «3 góp ý chờ» + mô tả ngắn «Quyết ngay dưới từng KR.» + nút «Xem góp ý».
- Dòng dẫn bọc `SheetClose` để bộ giữ thay đổi thấy lối rời hộp khi form còn chữ chưa lưu.
- Đang gửi một đề xuất thì mọi nút của các đề xuất khác khoá (Ngoài-9) — đo tay: 7/7 nút
  `disabled` trong lúc gửi, 0/7 sau khi xong.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- **Focus rơi về khung sau Esc / Huỷ / Nhận / Hoàn tác** (L2 của hạt giống
  `the-gop-y-sua-nhanh`, còn sống trong `ProposedChange`): đo tay `document.activeElement`
  là thân khung chi tiết. Đề xuất: `ProposedChange` trả focus — Esc/Huỷ về nút «Sửa», Nhận về
  «Hoàn tác» của biên nhận, Hoàn tác về nút chính của đề xuất vừa hiện lại. Làm ở
  `packages/ui` trong lượt này (AC).
- **Cỡ chữ đề xuất to hơn KR nó sửa:** thân khung chi tiết 12 px, `ProposedChange` inline cố
  định 14 px (đo `getComputedStyle`: 54 khối 12 px, 3 khối 14 px là câu hỏi và hai biên
  nhận) — lời Kara lấn chính KR. Đề xuất: inline thừa cỡ chữ của bề mặt chứa.
- **«Bỏ qua» bị đẩy tận mép phải** (`ms-auto` của nhóm nút): ở khung 870 px cách nút chính
  ~700 px. Đề xuất: ở `density="inline"` giữ nút lặng sát nhóm nút chính.
- **Chưa có thành phần «theo Kara»:** bản mẫu ghép tay `Icon` + chữ cho dấu sau tên KR (luật
  3: dấu nhỏ tại chỗ tới khi người sửa). Đề xuất: `KaraTrace` (hoặc biến thể của `KaraMark`)
  trong `packages/ui/components/kara.tsx`.
- **Diff tên lặp tên cũ:** đề xuất neo ngay dưới hàng KR nên tên cũ hiện hai lần liền (hàng
  KR, rồi dòng gạch). Luật 5 đòi diff; giữ theo luật trừ khi chủ kho cho bỏ `before` khi đề
  xuất neo ngay dưới chính chữ nó sửa (khi đó phải sửa `docs/ai-ux.md`).
