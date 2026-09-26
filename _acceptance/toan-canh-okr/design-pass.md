---
slug: toan-canh-okr
at: 2026-09-25T21:00:08Z
route: http://localhost:3930/proto/toan-canh-okr
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (ghim)
options: http://localhost:3930/proto/toan-canh-okr?state=ST-hoptuan-tabrieng · ?state=ST-suckhoe-caidat
divergence: opened
ds_skill: web-design-guidelines
states: [ST-hoptuan-codulieu, ST-hoptuan-tabrieng, ST-hoptuan-yenang, ST-hoptuan-tuandau, ST-hoptuan-dangtai, ST-hoptuan-loi, ST-suckhoe-codulieu, ST-suckhoe-caidat, ST-suckhoe-tuandau, ST-suckhoe-khongquyen, ST-suckhoe-dangtai, ST-suckhoe-loi, ST-tongquan-khoi, ST-tongquan-rong, ST-tongquan-chiokr, ST-nguoi-codulieu, ST-nguoi-rong, ST-dienbien-so, ST-dienbien-moc, ST-dienbien-chuaco, ST-donvi-loc, ST-donvi-loc-khongkhop]
breakpoints: [mobile-390, desktop-1440]
themes: [light, dark]
patched: 3
deferred: 6
---
# design-pass — toan-canh-okr

Phiên phục vụ bốn bề mặt lượt 5 chưa có trong bản mẫu đã duyệt `ban-mau-okr`
(PR #113): bảng họp tuần, sức khoẻ chương trình, khối OKR trên Tổng quan và trang
OKR của một người, biểu đồ đường có đích trên sheet mục tiêu — cộng bộ lọc
«Theo đơn vị» (XEM-02), vì bản mẫu cũ không có bộ lọc nào. «Toàn cảnh», heatmap,
cây căn chỉnh và mười một biến thể Nhóm 2 đã duyệt ngày 2026-09-24, phiên này
không dựng lại.

Khung: dùng lại `KhungUngDung` của `ban-mau-okr` (khung host tĩnh: rail, đầu
trang, bốn tab), nên `context: static-frame`. Khối Tổng quan đứng trong một trang
Tổng quan rút gọn, có dòng chào và chỗ của các khối đang có.

## Hai hướng mở — lời khuyên ghim trên vật

| Quyết định | Hướng A — máy khuyên | Hướng B |
|---|---|---|
| Họp tuần đặt ở đâu | **Cách xem thứ ba của «Theo đơn vị»** (Danh sách · Cây căn chỉnh · Họp tuần). Động cơ: họp tuần luôn là của một đơn vị, mà «Theo đơn vị» đã chọn đơn vị; giữ bốn tab đã duyệt. Đánh đổi: người mới phải biết nút «Họp tuần» nằm trong ô cách xem. | **Tab thứ năm «Họp tuần»**. Động cơ: lối vào lộ ra ngay, dễ gửi đường dẫn. Đánh đổi: năm tab tràn ở 390, và tab phải tự chọn lại đơn vị. |
| Sức khoẻ chương trình đặt ở đâu | **Trang riêng trong khu OKR**, đi từ nút ở đầu «Toàn cảnh», chỉ quản trị thấy nút. Động cơ: đây là màn xem, không phải cấu hình; bảng năm cột cần bề ngang; không đụng khung Cài đặt mà vòng khác đang sửa. Đánh đổi: thêm một trang ngoài bốn tab. | **Section trong Cài đặt › Chương trình OKR**. Động cơ: quản trị đã quen vào đó. Đánh đổi: Cài đặt rộng 820px ép bảng; trộn màn xem vào trang cấu hình, trái `docs/settings.md`. |

Tên hướng A/B giữ nguyên các vòng sau.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-dienbien-chuaco | desktop-1440 | light | evidence/design-pass/ST-dienbien-chuaco--desktop-1440.png |
| ST-dienbien-chuaco | mobile-390 | light | evidence/design-pass/ST-dienbien-chuaco--mobile-390.png |
| ST-dienbien-moc | desktop-1440 | light | evidence/design-pass/ST-dienbien-moc--desktop-1440.png |
| ST-dienbien-moc | mobile-390 | light | evidence/design-pass/ST-dienbien-moc--mobile-390.png |
| ST-dienbien-so | desktop-1440 | dark | evidence/design-pass/ST-dienbien-so--desktop-1440--dark.png |
| ST-dienbien-so | desktop-1440 | light | evidence/design-pass/ST-dienbien-so--desktop-1440.png |
| ST-dienbien-so | mobile-390 | light | evidence/design-pass/ST-dienbien-so--mobile-390.png |
| ST-donvi-loc | desktop-1440 | light | evidence/design-pass/ST-donvi-loc--desktop-1440.png |
| ST-donvi-loc | mobile-390 | light | evidence/design-pass/ST-donvi-loc--mobile-390.png |
| ST-donvi-loc-khongkhop | desktop-1440 | light | evidence/design-pass/ST-donvi-loc-khongkhop--desktop-1440.png |
| ST-donvi-loc-khongkhop | mobile-390 | light | evidence/design-pass/ST-donvi-loc-khongkhop--mobile-390.png |
| ST-hoptuan-codulieu | desktop-1440 | dark | evidence/design-pass/ST-hoptuan-codulieu--desktop-1440--dark.png |
| ST-hoptuan-codulieu | desktop-1440 | light | evidence/design-pass/ST-hoptuan-codulieu--desktop-1440.png |
| ST-hoptuan-codulieu | mobile-390 | light | evidence/design-pass/ST-hoptuan-codulieu--mobile-390.png |
| ST-hoptuan-dangtai | desktop-1440 | light | evidence/design-pass/ST-hoptuan-dangtai--desktop-1440.png |
| ST-hoptuan-dangtai | mobile-390 | light | evidence/design-pass/ST-hoptuan-dangtai--mobile-390.png |
| ST-hoptuan-loi | desktop-1440 | light | evidence/design-pass/ST-hoptuan-loi--desktop-1440.png |
| ST-hoptuan-loi | mobile-390 | light | evidence/design-pass/ST-hoptuan-loi--mobile-390.png |
| ST-hoptuan-tabrieng | desktop-1440 | light | evidence/design-pass/ST-hoptuan-tabrieng--desktop-1440.png |
| ST-hoptuan-tabrieng | mobile-390 | light | evidence/design-pass/ST-hoptuan-tabrieng--mobile-390.png |
| ST-hoptuan-tuandau | desktop-1440 | light | evidence/design-pass/ST-hoptuan-tuandau--desktop-1440.png |
| ST-hoptuan-tuandau | mobile-390 | light | evidence/design-pass/ST-hoptuan-tuandau--mobile-390.png |
| ST-hoptuan-yenang | desktop-1440 | light | evidence/design-pass/ST-hoptuan-yenang--desktop-1440.png |
| ST-hoptuan-yenang | mobile-390 | light | evidence/design-pass/ST-hoptuan-yenang--mobile-390.png |
| ST-nguoi-codulieu | desktop-1440 | light | evidence/design-pass/ST-nguoi-codulieu--desktop-1440.png |
| ST-nguoi-codulieu | mobile-390 | light | evidence/design-pass/ST-nguoi-codulieu--mobile-390.png |
| ST-nguoi-rong | desktop-1440 | light | evidence/design-pass/ST-nguoi-rong--desktop-1440.png |
| ST-nguoi-rong | mobile-390 | light | evidence/design-pass/ST-nguoi-rong--mobile-390.png |
| ST-suckhoe-caidat | desktop-1440 | light | evidence/design-pass/ST-suckhoe-caidat--desktop-1440.png |
| ST-suckhoe-caidat | mobile-390 | light | evidence/design-pass/ST-suckhoe-caidat--mobile-390.png |
| ST-suckhoe-codulieu | desktop-1440 | dark | evidence/design-pass/ST-suckhoe-codulieu--desktop-1440--dark.png |
| ST-suckhoe-codulieu | desktop-1440 | light | evidence/design-pass/ST-suckhoe-codulieu--desktop-1440.png |
| ST-suckhoe-codulieu | mobile-390 | light | evidence/design-pass/ST-suckhoe-codulieu--mobile-390.png |
| ST-suckhoe-dangtai | desktop-1440 | light | evidence/design-pass/ST-suckhoe-dangtai--desktop-1440.png |
| ST-suckhoe-dangtai | mobile-390 | light | evidence/design-pass/ST-suckhoe-dangtai--mobile-390.png |
| ST-suckhoe-khongquyen | desktop-1440 | light | evidence/design-pass/ST-suckhoe-khongquyen--desktop-1440.png |
| ST-suckhoe-khongquyen | mobile-390 | light | evidence/design-pass/ST-suckhoe-khongquyen--mobile-390.png |
| ST-suckhoe-loi | desktop-1440 | light | evidence/design-pass/ST-suckhoe-loi--desktop-1440.png |
| ST-suckhoe-loi | mobile-390 | light | evidence/design-pass/ST-suckhoe-loi--mobile-390.png |
| ST-suckhoe-tuandau | desktop-1440 | light | evidence/design-pass/ST-suckhoe-tuandau--desktop-1440.png |
| ST-suckhoe-tuandau | mobile-390 | light | evidence/design-pass/ST-suckhoe-tuandau--mobile-390.png |
| ST-tongquan-chiokr | desktop-1440 | light | evidence/design-pass/ST-tongquan-chiokr--desktop-1440.png |
| ST-tongquan-chiokr | mobile-390 | light | evidence/design-pass/ST-tongquan-chiokr--mobile-390.png |
| ST-tongquan-khoi | desktop-1440 | dark | evidence/design-pass/ST-tongquan-khoi--desktop-1440--dark.png |
| ST-tongquan-khoi | desktop-1440 | light | evidence/design-pass/ST-tongquan-khoi--desktop-1440.png |
| ST-tongquan-khoi | mobile-390 | light | evidence/design-pass/ST-tongquan-khoi--mobile-390.png |
| ST-tongquan-rong | desktop-1440 | light | evidence/design-pass/ST-tongquan-rong--desktop-1440.png |
| ST-tongquan-rong | mobile-390 | light | evidence/design-pass/ST-tongquan-rong--mobile-390.png |

## Cảnh ngữ-cảnh

- Không cần: vật dựng trong khung host tĩnh (`static-frame`), không đứng một mình.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Hướng B họp tuần tràn ngang 28px ở 390: năm tab không có khung cuộn — bọc thanh tab trong khung `overflow-x-auto` như bản mẫu cũ.
- Nhãn «Đích 85%» của biểu đồ đường bị cắt thành «Đích 85» ở mép phải: nới lề phải biểu đồ.
- Khối Tổng quan hứa «KR đáng lo lên đầu» nhưng dữ liệu mẫu xếp «Cao» đầu tiên: xếp lại theo tình trạng — mốc tự tin thấp, chậm nhịp, rồi đúng nhịp.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Biểu đồ đường có đích: chưa có thành phần trong `packages/ui` (chỉ có `AreaTrend`, `BarTrend`…). Bản mẫu ghép tay `LineChart` + `ReferenceLine` + đường đứt «lẽ ra»; cần một thành phần bọc nhận dãy giá trị, đích, dãy kỳ vọng, nhãn đích dính phải, khoảng trống cho tuần chưa tới — đúng việc lộ trình ghi cho lượt 5.
- Bảng họp tuần và khối Tổng quan dùng `SimpleTable` với ô xếp chồng ở 390 (tiến độ gấp vào ô KR, cột phụ ẩn theo khổ). `SimpleTableColumn.className` chỉ vào ô tiêu đề, nên mỗi ô thân phải tự lặp `hidden md:table-cell` — nên có khoá ẩn-theo-khổ trên cột áp cho cả thân.
- Chip bộ lọc đang áp (bản mẫu dựng bằng `Badge` + icon đóng) chưa có thành phần; `DataTable` có trạng thái lọc nhưng không xuất chip. Cần một chip gỡ được có `aria-label` «Bỏ lọc …».
- Sheet mục tiêu ở 390 vẫn cắt «Tiến độ · lẽ ra 4…» và «Võ Phươr» — cùng mục `DetailSheetStats` của Nhóm 2 bản mẫu cũ, chưa đổi.
- Lý do đáng bàn (tự tin tụt · im N ngày · ghi chú mới) dùng `StatusIndicator` ba tông error/warning/info; tông «info» chưa có nghĩa nào khác trong khu OKR — cần chốt ở cặp thành phần mức tự tin/tình trạng (Nhóm 2 cũ) để một tông không mang hai nghĩa.
- Cây nhiều cấp đi bằng bàn phím không dựng trong bản mẫu (bản mẫu cấm sửa `packages/ui`); nó là mục Nhóm 2 đã duyệt của `ban-mau-okr` và là việc S3.
