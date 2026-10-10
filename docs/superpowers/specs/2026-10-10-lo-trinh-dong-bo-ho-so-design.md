# Lộ trình: ngăn chi tiết việc dùng khung của Thoả thuận — thiết kế

Ngày 10/10/2026. Hồ sơ `_acceptance/lo-trinh-dong-bo-ho-so`. Tiếp sau LT1
(`trang-lo-trinh-trong-crm`, đã lên production qua #329).

## Vì sao

Chủ kho đi thử trang Lộ trình trên production 10/10 rồi yêu cầu: «trang chi tiết
dùng lại block/component của deal chi tiết để đồng nhất», chốt «sử dụng lại ux/ui
để đồng nhất». Lượt đi thử cũng thấy ba lỗi nhìn được và một dòng kế hoạch sai:

1. Ở 375 px, cột Mốc của bảng hẹp quá, ngày mốc bị cắt.
2. Thẻ trong «Bảng cột» căn chữ giữa (thẻ là `<button>`, nút trình duyệt căn giữa).
3. Nút «Đã bác» bật hay tắt trông y như nhau — chỉ có `aria-pressed`.
4. Hàng LT1 trong `docs/plan/lo-trinh-okr.json` còn «chưa mở» dù đã lên onehub.

Ngăn hồ sơ việc của LT1 hôm nay tự dựng: `Sheet` của `@crm/ui` cỡ `lg`, một `Card`
bọc lưới `dl` bốn ô, `SectionHeading` cho từng mục; đóng ngăn thì tiêu điểm về đầu
trang (thấy trên production 10/10). Ngăn của Thoả thuận, Công ty, Liên hệ là khung
bản ghi `RecordSheetFrame`, mà khung này dựng trên họ `DetailSheet` trong
`apps/app/components/detail-sheet.tsx` (`record-sheet-host.tsx` mở `DetailSheet` cỡ
mặc định; khung đặt dải `DetailSheetStats` dưới đầu ngăn, thân là `DetailSheetSection`):
đầu ngăn có nút đóng, dải ô số liệu nền xám có vạch ngăn, mục có tiêu đề chữ hoa
nhỏ, bảng thuộc tính hai cột, và trên điện thoại thành ngăn kéo toàn bề rộng. Hai
khung khác nhau nên người đi từ Thoả thuận sang Lộ trình thấy hai kiểu ngăn.

## Hướng đã chọn

Dựng lại `HoSoViec` bằng chính họ `DetailSheet`, không thêm thành phần mới:

- `DetailSheet` (cỡ mặc định như ngăn Thoả thuận; điện thoại → ngăn kéo).
- `DetailSheetHeader`: tiêu đề là câu giao, mô tả là `mã · lộ trình · nhóm`.
- `DetailSheetStats` + bốn `DetailSheetStat`: Trạng thái · Mốc · Lộ trình · Nhóm.
- `DetailSheetBody` chứa các `DetailSheetSection`:
  - khung «theo lời ghi» và khung «lệch kế hoạch» (hai `Alert` cũ) trong một mục đầu không tiêu đề;
  - «Chi tiết»: `DetailSheetProperties columns={1}` với «Coi là thành công khi», «Vì sao»;
  - «Cần xong trước», «Việc đang chờ việc này»: danh sách `DongLienQuan` như cũ.

Không dùng `RecordSheetFrame`: khung đó buộc vào chồng bản ghi CRM (`?record=`,
nút lùi), thẻ Tổng quan/Cá nhân/Hoạt động/Kara và nút thao tác — trang Lộ trình
chỉ đọc, giữ tham số `viec` của mình, không có thẻ hay thao tác. Dùng nó là phải
giả một bản ghi CRM.

`DetailSheet` hôm nay không nhận thuộc tính `data-*`; mốc `data-lo-trinh-chi-tiet-viec`
mà các phép đo LT1 bám vào cần nằm trên khung ngăn. Thêm vào `DetailSheet` một
đường chuyển tiếp thuộc tính `data-*` xuống `SheetContent` — thay đổi chỉ cộng,
35 chỗ gọi khác không đổi.

Ba lỗi:

- Cột Mốc: bề rộng cố định đủ cho ngày dài nhất cộng «còn n ngày» ở dưới `md`,
  giữ tỉ lệ 16% từ `md` trở lên.
- Thẻ Bảng cột: nút thẻ căn chữ đầu dòng (`text-start`) ngay trong `NutThe` — đó
  là thành phần của trang, không phải đè kiểu thành phần `@crm/ui`.
- «Đã bác»: đổi `Button` + `aria-pressed` thành `Toggle variant="outline" size="sm"`
  của `@crm/ui` — trạng thái bật có nền riêng sẵn trong thành phần, khớp các chip
  lọc `ToggleGroup variant="outline"` của chính thanh công cụ.

Dòng kế hoạch: LT1 → `"trang_thai": "đã lên onehub"`, `buoc_ke` «Đã gộp 10/10
(#329); còn phiên nghiệm thu», `pr: [329]`, rồi vẽ lại `LO-TRINH.html`.

Giữ nguyên: trang chỉ đọc; dữ liệu qua bản chép `docDuLieu`; màu trạng thái qua
`status-tone`. Đóng ngăn trả tiêu điểm về chỗ đã mở là chỗ SỬA, không phải giữ:
ngăn cũ trả về đầu trang, `DetailSheet` tự lưu và trả lại phần tử đã mở như ngăn
Thoả thuận.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: danh sách / bảng cột / mốc → bấm một việc → ngăn chi tiết mở bên phải (điện thoại: ngăn kéo từ dưới) → đọc, bấm việc liên quan để chuyển → đóng (điểm ra: về đúng dòng đã bấm).
- Biên: việc không có «thành công khi» lẫn «vì sao» → không có mục Chi tiết; không có việc liên quan → không có hai mục cuối; việc chưa hẹn mốc → ô Mốc ghi «Chưa hẹn mốc».
- Lỗi & quay lại: `viec` trên đường dẫn không khớp việc nào → ngăn không mở, danh sách như thường.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn chi tiết việc | cho biết một việc đang ở đâu và nó chờ gì | từ dòng, thẻ hay việc trong dòng thời gian / về danh sách |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ngan-viec-mo | Ngăn chi tiết việc | đầu ngăn, dải bốn ô, các mục có dữ liệu | đọc, bấm việc liên quan, đóng |
| ST-ngan-viec-lech | Ngăn chi tiết việc | khung vàng «lệch kế hoạch» với cờ nguyên văn ở đầu thân ngăn | đọc |
| ST-ngan-viec-dien-thoai | Ngăn chi tiết việc | ngăn kéo toàn bề rộng, có tay kéo | kéo xuống hoặc bấm đóng |
| ST-bang-da-bac-bat | Thanh công cụ | nút «Đã bác» ở trạng thái bật, nền khác lúc tắt | bấm lại để tắt |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Đóng ngăn (Esc, nút đóng, kéo xuống) → tiêu điểm về phần tử đã mở ngăn.
- Dưới `md`: cột Mốc đủ rộng cho ngày và «còn n ngày», không cắt chữ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DetailSheet*` | dùng (mở rộng `DetailSheet` thêm chuyển tiếp `data-*`) | cùng khung với ngăn Thoả thuận — đúng yêu cầu chủ kho |
| `Toggle` | dùng | trạng thái bật có sẵn, khớp `ToggleGroup` của thanh công cụ |
| `DongLienQuan`, `OTrangThai`, `OMoc` | dùng | giữ nguyên từ LT1 |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — giữ đúng khuôn của LT1 và của Thoả thuận; vòng này chỉ đổi khung ngăn chi tiết sang khung chung.
<!-- UX-SPEC-TEMPLATE>>> -->
