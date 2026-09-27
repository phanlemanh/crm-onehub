---
slug: khep-ky-okr
at: 2026-09-27T09:30:43Z
route: http://localhost:3940/proto/khep-ky-okr
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (ghim)
options: http://localhost:3940/proto/khep-ky-okr?state=ST-cham-donvi · ?state=ST-cham-sheet
divergence: opened
ds_skill: web-design-guidelines
states: [ST-cham-donvi, ST-cham-sheet, ST-cham-lydo, ST-cham-daxong, ST-cham-chiokr, ST-cham-dadong, ST-cham-rong, ST-cham-dangtai, ST-cham-loi, ST-mangsang-hoi, ST-mangsang-khongky, ST-caidat-ra, ST-caidat-dong-chan, ST-caidat-dong, ST-caidat-molai, ST-kr-lydo, ST-kr-hoi, ST-muctieu-doitrong, ST-dai-ra, ST-toancanh-xuat]
breakpoints: [mobile-390, desktop-1440]
themes: [light, dark]
patched: 4
deferred: 3
---
# design-pass — khep-ky-okr

Phiên phục vụ các bề mặt lượt 7 chưa có trong hai bản mẫu đã duyệt (`ban-mau-okr`
PR #113, `toan-canh-okr` lượt 5): bảng chấm điểm và điều học được, hộp thoại mang
sang, điều khiển chu kỳ ở Cài đặt (rà giữa kỳ, đóng kỳ, mở lại), hộp thoại KR với ô
lý do đổi đích và câu hỏi chất lượng, cảnh báo thiếu đối trọng trên sheet mục tiêu,
dải rà giữa kỳ, nút Xuất ở Toàn cảnh.

Khung: dùng lại `KhungUngDung` của `ban-mau-okr` (rail, đầu trang, bốn tab), nên
`context: static-frame`. Cài đặt đứng trong một khung rộng 820px không có thanh bên
thật — bản mẫu chỉ dựng thẻ Chu kỳ.

Chuẩn thiết kế: nạp `web-design-guidelines` (khai ở `feature_loop.ui_standards_skill`
và `design_pass.ds_skill`), soát năm tệp bản mẫu; các điểm áp được đã theo (nhãn cho
nút chỉ có biểu tượng, `htmlFor` cho mọi ô, `tabular-nums` cho số, lỗi kèm cách sửa,
`translate="no"` cho chữ người nhập, «Đang tải…»). Một điểm chuyển sang thiết kế: cách
xem «Chấm điểm» phải nằm trong URL (bộ lọc `nuqs` như «Họp tuần»).

## Hai hướng mở — lời khuyên ghim trên vật

| Quyết định | Hướng A — máy khuyên | Hướng B |
|---|---|---|
| Chấm điểm đặt ở đâu | **Cách xem thứ tư của «Theo đơn vị»** (Danh sách · Cây căn chỉnh · Họp tuần · Chấm điểm), hiện khi kỳ ở pha chấm hoặc đã đóng. Động cơ: cuối quý đơn vị ngồi chấm cùng nhau, một màn thấy mọi mục tiêu, tiến độ «đã chấm N/M» và điều học được — như họp tuần. Đánh đổi: bốn nút cách xem chật ở 390. | **Tab «Chấm điểm» trong sheet mục tiêu**. Động cơ: chấm ngay chỗ đang xem một mục tiêu, không cần cách xem mới. Đánh đổi: chấm cả đơn vị phải mở từng sheet; không có chỗ thấy đơn vị đã chấm tới đâu. |

Tên hướng A/B giữ nguyên các vòng sau.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-caidat-dong | desktop-1440 | light | evidence/design-pass/ST-caidat-dong--desktop-1440.png |
| ST-caidat-dong | mobile-390 | light | evidence/design-pass/ST-caidat-dong--mobile-390.png |
| ST-caidat-dong-chan | desktop-1440 | dark | evidence/design-pass/ST-caidat-dong-chan--desktop-1440--dark.png |
| ST-caidat-dong-chan | desktop-1440 | light | evidence/design-pass/ST-caidat-dong-chan--desktop-1440.png |
| ST-caidat-dong-chan | mobile-390 | light | evidence/design-pass/ST-caidat-dong-chan--mobile-390.png |
| ST-caidat-molai | desktop-1440 | light | evidence/design-pass/ST-caidat-molai--desktop-1440.png |
| ST-caidat-molai | mobile-390 | light | evidence/design-pass/ST-caidat-molai--mobile-390.png |
| ST-caidat-ra | desktop-1440 | light | evidence/design-pass/ST-caidat-ra--desktop-1440.png |
| ST-caidat-ra | mobile-390 | light | evidence/design-pass/ST-caidat-ra--mobile-390.png |
| ST-cham-chiokr | desktop-1440 | light | evidence/design-pass/ST-cham-chiokr--desktop-1440.png |
| ST-cham-chiokr | mobile-390 | light | evidence/design-pass/ST-cham-chiokr--mobile-390.png |
| ST-cham-dadong | desktop-1440 | light | evidence/design-pass/ST-cham-dadong--desktop-1440.png |
| ST-cham-dadong | mobile-390 | light | evidence/design-pass/ST-cham-dadong--mobile-390.png |
| ST-cham-dangtai | desktop-1440 | light | evidence/design-pass/ST-cham-dangtai--desktop-1440.png |
| ST-cham-dangtai | mobile-390 | light | evidence/design-pass/ST-cham-dangtai--mobile-390.png |
| ST-cham-daxong | desktop-1440 | light | evidence/design-pass/ST-cham-daxong--desktop-1440.png |
| ST-cham-daxong | mobile-390 | light | evidence/design-pass/ST-cham-daxong--mobile-390.png |
| ST-cham-donvi | desktop-1440 | dark | evidence/design-pass/ST-cham-donvi--desktop-1440--dark.png |
| ST-cham-donvi | desktop-1440 | light | evidence/design-pass/ST-cham-donvi--desktop-1440.png |
| ST-cham-donvi | mobile-390 | light | evidence/design-pass/ST-cham-donvi--mobile-390.png |
| ST-cham-loi | desktop-1440 | light | evidence/design-pass/ST-cham-loi--desktop-1440.png |
| ST-cham-loi | mobile-390 | light | evidence/design-pass/ST-cham-loi--mobile-390.png |
| ST-cham-lydo | desktop-1440 | light | evidence/design-pass/ST-cham-lydo--desktop-1440.png |
| ST-cham-lydo | mobile-390 | light | evidence/design-pass/ST-cham-lydo--mobile-390.png |
| ST-cham-rong | desktop-1440 | light | evidence/design-pass/ST-cham-rong--desktop-1440.png |
| ST-cham-rong | mobile-390 | light | evidence/design-pass/ST-cham-rong--mobile-390.png |
| ST-cham-sheet | desktop-1440 | light | evidence/design-pass/ST-cham-sheet--desktop-1440.png |
| ST-cham-sheet | mobile-390 | light | evidence/design-pass/ST-cham-sheet--mobile-390.png |
| ST-dai-ra | desktop-1440 | light | evidence/design-pass/ST-dai-ra--desktop-1440.png |
| ST-dai-ra | mobile-390 | light | evidence/design-pass/ST-dai-ra--mobile-390.png |
| ST-kr-hoi | desktop-1440 | light | evidence/design-pass/ST-kr-hoi--desktop-1440.png |
| ST-kr-hoi | mobile-390 | light | evidence/design-pass/ST-kr-hoi--mobile-390.png |
| ST-kr-lydo | desktop-1440 | dark | evidence/design-pass/ST-kr-lydo--desktop-1440--dark.png |
| ST-kr-lydo | desktop-1440 | light | evidence/design-pass/ST-kr-lydo--desktop-1440.png |
| ST-kr-lydo | mobile-390 | light | evidence/design-pass/ST-kr-lydo--mobile-390.png |
| ST-mangsang-hoi | desktop-1440 | light | evidence/design-pass/ST-mangsang-hoi--desktop-1440.png |
| ST-mangsang-hoi | mobile-390 | light | evidence/design-pass/ST-mangsang-hoi--mobile-390.png |
| ST-mangsang-khongky | desktop-1440 | light | evidence/design-pass/ST-mangsang-khongky--desktop-1440.png |
| ST-mangsang-khongky | mobile-390 | light | evidence/design-pass/ST-mangsang-khongky--mobile-390.png |
| ST-muctieu-doitrong | desktop-1440 | light | evidence/design-pass/ST-muctieu-doitrong--desktop-1440.png |
| ST-muctieu-doitrong | mobile-390 | light | evidence/design-pass/ST-muctieu-doitrong--mobile-390.png |
| ST-toancanh-xuat | desktop-1440 | light | evidence/design-pass/ST-toancanh-xuat--desktop-1440.png |
| ST-toancanh-xuat | mobile-390 | light | evidence/design-pass/ST-toancanh-xuat--mobile-390.png |

## Cảnh ngữ-cảnh

- Không áp: `context: static-frame` — khung ứng dụng thật dạng tĩnh bọc mọi màn.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Bốn nút cách xem làm màn chấm tràn ngang 8px ở 390: dời nhóm nút khỏi `CardAction` xuống thân thẻ, trong khung cuộn `relative`.
- Ô điểm và ô lý do bị ép trong cột 30% ở 390: dưới `md` điểm và lý do xuống dưới tên KR, cột Điểm chỉ hiện từ `md`.
- Nút «Mang sang» chen tên mục tiêu ở 390: xuống chân thẻ cạnh «Lưu điều học được».
- Chấm tình trạng dính vào tên người phụ trách khi tên bị cắt: xuống một dòng riêng dưới mô tả.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `FieldDescription` chưa có tông «câu hỏi»: câu hỏi chất lượng đang là chữ phụ «Hỏi: …», lẫn với chú thích thường. Đề xuất biến thể câu hỏi (biểu tượng dấu hỏi + chữ thường) trong `packages/ui/src/components/field.tsx`.
- `ToggleGroup` cách xem ở 390 cắt mất mục đang chọn khi có bốn mục: đề xuất biến thể thu về `Select` dưới `md`, áp chung cho «Theo đơn vị» (ba mục hôm nay cũng sát mép).
- `ConfirmDialog` không nhận ô nhập: «Mở lại kỳ» (lý do bắt buộc) dùng `Dialog` + `Field` + `DialogClose`; nếu vòng khác cũng cần xác nhận có lý do, thêm biến thể `ConfirmDialog` có ô lý do trong `packages/ui`.
