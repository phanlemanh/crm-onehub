---
slug: tro-ly-okr-tom-tat
at: 2026-09-30T14:05:10Z
route: http://localhost:3920/proto/tro-ly-okr-tom-tat
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong)
options:
divergence: skipped — khối đặt ở đầu bảng họp tuần theo thiết kế 12 §4.6 và khuôn WorkBoard «AI memo» đầu trang họp; trích dẫn theo inline-citation của AI Elements (Adopted trong sổ docs/chat-ui.md)
ds_skill: web-design-guidelines
states: [ST-tomtat-co-cau, ST-tomtat-trich-dan, ST-tomtat-dang-soan, ST-tomtat-chua-cap-nhat, ST-tomtat-loc-het, ST-tomtat-da-phan-hoi, ST-tomtat-loi, ST-tomtat-dang-tai, ST-suckhoe-tomtat-co, ST-suckhoe-tomtat-rong, ST-suckhoe-tomtat-ngan, ST-nhac-dong-tomtat, ST-nhac-tin-mau]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 2
deferred: 5
---
# design-pass — tro-ly-okr-tom-tat

Bản mẫu chạy trong chính ứng dụng sau cờ `PROTO_ROUTE=1`, dựng bằng thành phần thật của
`packages/ui` (`Card`, `Popover`, `Button`, `ToggleGroup`, `ConfidenceIndicator`, `Shimmer`,
`Skeleton`, `Empty`, `Alert`, `SimpleTable`, `Sheet`, `StatusIndicator`, `Badge`, `Field`,
`Switch`); bảng họp tuần và Sức khoẻ nằm trên khung ứng dụng OKR dùng chung của các bản mẫu
OKR (`ban-mau-okr/phan-chung.tsx`), trang Nhắc buổi sáng dùng `PageShell` như màn thật. Dữ liệu
giả của một phòng ban «Kinh doanh» riêng cho bản mẫu (9 KR, 14 lần cập nhật tuần 12/10), không
đường ghi. Bấm được: nhãn trích dẫn mở thẻ, lật nguồn 1/2, hai nút phản hồi đổi ý được, công
tắc dòng báo bật tắt được. Chụp bằng `rang/chup-proto.mjs` (puppeteer, 1280 và 375, sáng và
tối, viewport cao bằng trang); 52 ảnh, 0 ảnh tràn ngang (scrollWidth ≤ clientWidth mọi ảnh).

## Bước phân kỳ

Bỏ qua. Chỗ đặt khối đã chốt ở thiết kế (§Đặc tả UX 4: trên hàng «Đáng bàn tuần này», dưới
thẻ đơn vị; thiết kế 12 §4.6; WorkBoard đặt «AI memo» ở đầu trang họp), và hình trích dẫn đã
có đáp án trong sổ `docs/chat-ui.md` (`inline-citation` là Adopted). Không còn trục nào đáng
dựng hai hướng.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-tomtat-co-cau | desktop-1280 | light | evidence/design-pass/ST-tomtat-co-cau--desktop-1280--light.png |
| ST-tomtat-co-cau | desktop-1280 | dark | evidence/design-pass/ST-tomtat-co-cau--desktop-1280--dark.png |
| ST-tomtat-co-cau | mobile-375 | light | evidence/design-pass/ST-tomtat-co-cau--mobile-375--light.png |
| ST-tomtat-co-cau | mobile-375 | dark | evidence/design-pass/ST-tomtat-co-cau--mobile-375--dark.png |
| ST-tomtat-trich-dan | desktop-1280 | light | evidence/design-pass/ST-tomtat-trich-dan--desktop-1280--light.png |
| ST-tomtat-trich-dan | desktop-1280 | dark | evidence/design-pass/ST-tomtat-trich-dan--desktop-1280--dark.png |
| ST-tomtat-trich-dan | mobile-375 | light | evidence/design-pass/ST-tomtat-trich-dan--mobile-375--light.png |
| ST-tomtat-trich-dan | mobile-375 | dark | evidence/design-pass/ST-tomtat-trich-dan--mobile-375--dark.png |
| ST-tomtat-dang-soan | desktop-1280 | light | evidence/design-pass/ST-tomtat-dang-soan--desktop-1280--light.png |
| ST-tomtat-dang-soan | desktop-1280 | dark | evidence/design-pass/ST-tomtat-dang-soan--desktop-1280--dark.png |
| ST-tomtat-dang-soan | mobile-375 | light | evidence/design-pass/ST-tomtat-dang-soan--mobile-375--light.png |
| ST-tomtat-dang-soan | mobile-375 | dark | evidence/design-pass/ST-tomtat-dang-soan--mobile-375--dark.png |
| ST-tomtat-chua-cap-nhat | desktop-1280 | light | evidence/design-pass/ST-tomtat-chua-cap-nhat--desktop-1280--light.png |
| ST-tomtat-chua-cap-nhat | desktop-1280 | dark | evidence/design-pass/ST-tomtat-chua-cap-nhat--desktop-1280--dark.png |
| ST-tomtat-chua-cap-nhat | mobile-375 | light | evidence/design-pass/ST-tomtat-chua-cap-nhat--mobile-375--light.png |
| ST-tomtat-chua-cap-nhat | mobile-375 | dark | evidence/design-pass/ST-tomtat-chua-cap-nhat--mobile-375--dark.png |
| ST-tomtat-loc-het | desktop-1280 | light | evidence/design-pass/ST-tomtat-loc-het--desktop-1280--light.png |
| ST-tomtat-loc-het | desktop-1280 | dark | evidence/design-pass/ST-tomtat-loc-het--desktop-1280--dark.png |
| ST-tomtat-loc-het | mobile-375 | light | evidence/design-pass/ST-tomtat-loc-het--mobile-375--light.png |
| ST-tomtat-loc-het | mobile-375 | dark | evidence/design-pass/ST-tomtat-loc-het--mobile-375--dark.png |
| ST-tomtat-da-phan-hoi | desktop-1280 | light | evidence/design-pass/ST-tomtat-da-phan-hoi--desktop-1280--light.png |
| ST-tomtat-da-phan-hoi | desktop-1280 | dark | evidence/design-pass/ST-tomtat-da-phan-hoi--desktop-1280--dark.png |
| ST-tomtat-da-phan-hoi | mobile-375 | light | evidence/design-pass/ST-tomtat-da-phan-hoi--mobile-375--light.png |
| ST-tomtat-da-phan-hoi | mobile-375 | dark | evidence/design-pass/ST-tomtat-da-phan-hoi--mobile-375--dark.png |
| ST-tomtat-loi | desktop-1280 | light | evidence/design-pass/ST-tomtat-loi--desktop-1280--light.png |
| ST-tomtat-loi | desktop-1280 | dark | evidence/design-pass/ST-tomtat-loi--desktop-1280--dark.png |
| ST-tomtat-loi | mobile-375 | light | evidence/design-pass/ST-tomtat-loi--mobile-375--light.png |
| ST-tomtat-loi | mobile-375 | dark | evidence/design-pass/ST-tomtat-loi--mobile-375--dark.png |
| ST-tomtat-dang-tai | desktop-1280 | light | evidence/design-pass/ST-tomtat-dang-tai--desktop-1280--light.png |
| ST-tomtat-dang-tai | desktop-1280 | dark | evidence/design-pass/ST-tomtat-dang-tai--desktop-1280--dark.png |
| ST-tomtat-dang-tai | mobile-375 | light | evidence/design-pass/ST-tomtat-dang-tai--mobile-375--light.png |
| ST-tomtat-dang-tai | mobile-375 | dark | evidence/design-pass/ST-tomtat-dang-tai--mobile-375--dark.png |
| ST-suckhoe-tomtat-co | desktop-1280 | light | evidence/design-pass/ST-suckhoe-tomtat-co--desktop-1280--light.png |
| ST-suckhoe-tomtat-co | desktop-1280 | dark | evidence/design-pass/ST-suckhoe-tomtat-co--desktop-1280--dark.png |
| ST-suckhoe-tomtat-co | mobile-375 | light | evidence/design-pass/ST-suckhoe-tomtat-co--mobile-375--light.png |
| ST-suckhoe-tomtat-co | mobile-375 | dark | evidence/design-pass/ST-suckhoe-tomtat-co--mobile-375--dark.png |
| ST-suckhoe-tomtat-rong | desktop-1280 | light | evidence/design-pass/ST-suckhoe-tomtat-rong--desktop-1280--light.png |
| ST-suckhoe-tomtat-rong | desktop-1280 | dark | evidence/design-pass/ST-suckhoe-tomtat-rong--desktop-1280--dark.png |
| ST-suckhoe-tomtat-rong | mobile-375 | light | evidence/design-pass/ST-suckhoe-tomtat-rong--mobile-375--light.png |
| ST-suckhoe-tomtat-rong | mobile-375 | dark | evidence/design-pass/ST-suckhoe-tomtat-rong--mobile-375--dark.png |
| ST-suckhoe-tomtat-ngan | desktop-1280 | light | evidence/design-pass/ST-suckhoe-tomtat-ngan--desktop-1280--light.png |
| ST-suckhoe-tomtat-ngan | desktop-1280 | dark | evidence/design-pass/ST-suckhoe-tomtat-ngan--desktop-1280--dark.png |
| ST-suckhoe-tomtat-ngan | mobile-375 | light | evidence/design-pass/ST-suckhoe-tomtat-ngan--mobile-375--light.png |
| ST-suckhoe-tomtat-ngan | mobile-375 | dark | evidence/design-pass/ST-suckhoe-tomtat-ngan--mobile-375--dark.png |
| ST-nhac-dong-tomtat | desktop-1280 | light | evidence/design-pass/ST-nhac-dong-tomtat--desktop-1280--light.png |
| ST-nhac-dong-tomtat | desktop-1280 | dark | evidence/design-pass/ST-nhac-dong-tomtat--desktop-1280--dark.png |
| ST-nhac-dong-tomtat | mobile-375 | light | evidence/design-pass/ST-nhac-dong-tomtat--mobile-375--light.png |
| ST-nhac-dong-tomtat | mobile-375 | dark | evidence/design-pass/ST-nhac-dong-tomtat--mobile-375--dark.png |
| ST-nhac-tin-mau | desktop-1280 | light | evidence/design-pass/ST-nhac-tin-mau--desktop-1280--light.png |
| ST-nhac-tin-mau | desktop-1280 | dark | evidence/design-pass/ST-nhac-tin-mau--desktop-1280--dark.png |
| ST-nhac-tin-mau | mobile-375 | light | evidence/design-pass/ST-nhac-tin-mau--mobile-375--light.png |
| ST-nhac-tin-mau | mobile-375 | dark | evidence/design-pass/ST-nhac-tin-mau--mobile-375--dark.png |

## Cảnh ngữ-cảnh

- Không cần cảnh riêng: `context: host-embedded` — bản mẫu chạy trong ứng dụng thật, khối
  nằm trong bảng họp tuần trên khung OKR dùng chung.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Ở 1280 mỗi câu tóm tắt dài hơn 130 ký tự một dòng, mắt phải đi quá xa → danh sách câu giới
  hạn `max-w-3xl`, khối vẫn rộng bằng bảng.
- Ở 375 thẻ trích dẫn chạm sát mép phải màn → `collisionPadding={16}` trên `PopoverContent`
  (thuộc tính của Radix, không đổi kiểu của thành phần), thẻ chừa đúng lề 16px của trang.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `InlineCitation` của AI Elements chưa cài trong `packages/ui` (sổ `docs/chat-ui.md`: Adopted,
  đã xoá khỏi cây ở vòng `nen-chat-ai-elements`) — bản mẫu dùng `Popover` + `Button` cỡ `xs`;
  S3 cài bằng CLI và mở rộng cho mở bằng bấm (bản gốc dựa trên `HoverCard`, không mở được
  trên điện thoại), giữ di chuột mở trên máy tính; cài phải chạm màn trong cùng thay đổi vì
  răng mồ côi của thư mục `ai-elements`.
- Lật nhiều nguồn trong thẻ («1/2» với hai nút mũi tên) là phần `InlineCitationCarousel` của
  AI Elements; bản mẫu ráp tay bằng `Button size="icon-xs"`. Khi cài `inline-citation` thì dùng
  phần carousel của nó, không giữ bản ráp tay.
- Hai nút «Hữu ích» · «Không hữu ích» cần trạng thái đã nhấn giữ lại và đổi ý được: bản mẫu
  dùng `ToggleGroup variant="outline"` (có sẵn `aria-pressed`/`data-state=on`) thay cho
  `Button`/`ButtonGroup` mà Đặc tả UX §5 ghi — cần Cổng Phạm vi gật hay đổi dòng xuất xứ.
- `CardDescription` ẩn dưới `sm`, nên dòng mô tả của khối quản trị ở Sức khoẻ và mô tả thẻ
  đơn vị («Phòng ban · Trưởng … · đã cập nhật 7/9 KR») biến mất ở 375; khối tóm tắt đã đưa dòng
  «Trợ lý OKR tóm tắt từ 14 lần cập nhật» vào thân thẻ vì lý do đó. Cần quyết ở tầng thành phần
  có nên cho mô tả hiện ở khổ hẹp không.
- `SimpleTable` ở 375: khối quản trị ẩn bốn cột phụ và dồn nấc, trạng thái, số câu bị bỏ vào ô
  đầu (như bảng họp tuần mẫu) — cách dồn này đang lặp ở mỗi màn; nên thành một khả năng của
  `SimpleTable` (cột phụ xếp dọc ở khổ hẹp) thay vì mỗi màn tự viết.

### Chỗ bản mẫu phải đoán (gạch ở Cổng Phạm vi nếu sai)

- Nhãn trạng thái của bản chế độ ẩn đã qua bộ kiểm: bảng trạng thái chỉ có «Đã hiện», mà bản
  ẩn không hiện cho ai — bản mẫu dùng «Qua bộ kiểm, chỉ quản trị thấy».
- Nhãn sáu mã bỏ câu: «Dẫn nguồn ngoài phòng» · «Số lệch với nguồn» · «Sai chiều tăng giảm» ·
  «Nêu tên người» · «Dùng từ cấm» · «Trùng câu trước», kèm một dòng chi tiết mỗi câu.
- Nhãn trích dẫn: «Cập nhật dd/mm» của nguồn đầu, thêm «+n» khi nhiều nguồn.
- Ngày: tuần 12/10 (Thứ Hai), nguồn ghi 09/10–12/10, tóm tắt và tin nhắc sáng Thứ Ba 13/10 —
  không dùng «Cập nhật 13/10» vì tóm tắt ghi lúc 06:00 ngày đó, trước mọi lần cập nhật cùng ngày.
- Phòng ban tên «Kinh doanh» (khớp câu dòng báo «Tóm tắt tuần Phòng Kinh doanh»), dựng riêng
  cho bản mẫu; trong cây mẫu dùng chung «Kinh doanh» là bộ phận, không phải phòng ban.
