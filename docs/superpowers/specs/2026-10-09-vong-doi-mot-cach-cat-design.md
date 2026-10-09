# V2 `vong-doi-mot-cach-cat` — một cách cất, một bộ chữ

Hàng V2 của đợt `sau-14-10`, dãy P2, ưu tiên 3, sau K6b (#314) và E7 (#303). Cổng Đáng: anh ký `build`
2026-10-07T13:13:50Z (luật 16). Nguồn: đợt 2 của `docs/vong-doi.md`. Ô cơ hội:
`_acceptance/vong-doi-mot-cach-cat/opportunity.md`.

## Vấn đề

| Chỗ | Tệp | Hôm nay | Chuẩn (`docs/vong-doi.md`) |
| --- | --- | --- | --- |
| Lưu trữ hàng loạt | `deals-/contacts-/companies-bulk-actions.tsx` | `reportBulk` → toast «Đã lưu trữ n …», không «Hoàn tác» | toast luôn có «Hoàn tác» |
| Ngăn bản đã cất | `contact-/company-/deal-sheet.tsx` | không báo gì, mọi ô sửa được | dải «Đã lưu trữ ngày … · Khôi phục», ô chỉ đọc |
| Kanban thoả thuận | `deals-table.tsx` nhánh `board` | không có nút «Đã lưu trữ» | nút có ở mọi dạng xem |
| Nút xem thứ đã cất | `lib/messages/{deals,contacts,companies}.ts` `archivedToggle` | «Lưu trữ» | «Đã lưu trữ» |
| Hộp xoá vĩnh viễn hàng loạt | `crm.ts` `bulkMenu.confirmDelete`, `bulk-actions.tsx` `BulkDeleteDialog` | nút «Xoá», `AlertDialog` ráp tay | «Xoá vĩnh viễn», `ConfirmDialog` |
| Hộp xoá vĩnh viễn từ menu ngăn | `record-actions.tsx` | `AlertDialog` ráp tay (chữ đã đúng) | `ConfirmDialog` |
| Chữ lưu trữ một trường | `crm.ts` `fields.archivedNote`, `fields.archiveBody` | «ẩn ở mọi nơi» | không «ẩn» (`CONTEXT.md` mục Lưu trữ) |

Máy chủ đã đủ: `bulkArchive`, `bulkRestore`, `restore`, `archivedAt` trong `byId` của ba loại. V2 không đổi API.

## Cách làm

**Hoàn tác hàng loạt.** `components/crm/bulk-actions.tsx` thêm một hook dùng chung cho ba bảng, ví dụ
`useLuuTruLoat({ kind, archive, restore, done, onDone })`: lưu trữ xong mà `succeeded > 0` thì gọi `baoDaLuuTru`
(`packages/ui/src/lib/bao-luu-tru.ts`, 10 giây, chốt một lần bấm) với chữ hôm nay (`bulk.archived` khi đủ,
`bulkMenu.leftAlone` khi một phần) và `onHoanTac` gọi `bulkRestore({ ids: variables.ids })`. Khôi phục xong thì
`reportBulk(..., bulk.restored)` như đường «Khôi phục» sẵn có; lỗi thì toast `crmMessages.bulk.hoanTacLoi` («Chưa hoàn
tác được. Các bản ghi vẫn ở mục Đã lưu trữ.»), không in `error.message`. `succeeded === 0` giữ đường `reportBulk`
cũ (không có gì để hoàn tác).

Vì sao gửi lại `variables.ids`: `runBulk` (`apps/api/src/crm/bulk.ts`) chỉ trả số đếm. `restore` của ba service đặt
`archivedAt: null` không điều kiện, nên khôi phục một id bị bỏ qua lúc lưu trữ là không-đổi; id không còn thì đếm
vào `failed` và `reportBulk` nói ra. Hạn chế: bản có người khác lưu trữ chen giữa bị Hoàn tác khôi phục theo.

**Dải báo và chỉ đọc.** `record-sheet/record-actions.tsx` (đã có `useRestoreRecord`) thêm `DaiLuuTru({ record,
archivedAt })`: `Alert` + `AlertAction` của `packages/ui`, chữ «Đã lưu trữ ngày <ngày>» (`LocalDateTime` dạng ngày)
và nút «Khôi phục» gọi `restore` của đúng loại; gắn `data-dai-luu-tru`. Ba ngăn đặt dải ở đầu thân tab chi tiết khi
`archivedAt` có giá trị, và bọc phần còn lại của nội dung tab trong một `fieldset disabled` (lớp `contents` để không
đổi bố cục) cùng menu giai đoạn trên đầu ngăn thoả thuận. Các ô sửa tại chỗ (`InlineField`, `InlineCompanyField`,
`InlineSelectField`, `RecordFields`) đều là `button`/`input`, nên một `fieldset` tắt hết mà không phải chạm từng
component — chúng nằm ngoài ranh giới V2. Menu «…» (`RecordActions`) nằm trên đầu ngăn, ngoài `fieldset`, nên
«Khôi phục» và «Xoá vĩnh viễn» vẫn bấm được. Khôi phục xong, `cache[kind](id)` làm mới `byId`, `archivedAt` về
`null`, dải mất và `fieldset` mở.

**Kanban.** `deals-table.tsx`: rút nút «Đã lưu trữ» đang ở `actions` của `DataTable` thành một hằng `archivedButton`,
đặt vào thanh công cụ nhánh `board` cạnh `viewToggle` và dùng lại ở nhánh bảng. Bấm thì `toggleArchived(true)` →
`archived=true` → `showsBoard` trả `false` → bảng đã lưu trữ; `view=board` vẫn trên URL nên bấm lại là về Kanban.

**Chữ.** `archivedToggle` → «Đã lưu trữ» ở ba kho (en đã là «Archived»); `crm.ts` `bulkMenu.confirmDelete` → «Xoá
vĩnh viễn» / «Delete forever»; `fields.archivedNote`, `fields.archiveBody` bỏ «ẩn» / «hidden»; khoá mới
`bulk.hoanTacLoi` và chữ dải báo (`sheet.daLuuTruNgay`, dùng lại `sheet.restore`/`m.bulk.restore` cho nút) đủ cặp
en/vi — `messages-guard` giữ.

**Hộp xoá vĩnh viễn.** `BulkDeleteDialog` thành lớp mỏng trên `ConfirmDialog` (`tieuDe`, `than` = hậu quả, `nut` =
«Xoá vĩnh viễn», `thoi` = «Huỷ», `pending`); ba bảng truyền `purge.isPending`. `RecordActions` thay `AlertDialog` ráp
tay bằng `ConfirmDialog` với `pending={purge.isPending}`.

## Vòng đời (luật 14 — ba câu)

1. **Dọn thế nào:** không đổi — ba loại đi Lưu trữ → Khôi phục → Xoá vĩnh viễn; V2 thêm «Hoàn tác» cho đường hàng
   loạt.
2. **«Lịch sử»:** không đổi — ba loại không có Xoá trần.
3. **Danh sách mặc định:** không đổi — chỉ bản đang dùng; thứ đã cất tìm ở nút «Đã lưu trữ», nay có ở cả Kanban.

## Ngoài phạm vi

- Danh sách liên quan trong ngăn lọc bản đã cất kèm «+n đã lưu trữ» — cần `byId` của ba service API, trùng E4 (P3).
- Lưu trữ trường thôi hỏi lại — `field-editor.tsx` ngoài ranh giới.
- Giai đoạn và tác nhân theo nếp lưu trữ — trang Cài đặt.
- «Xoá hẳn» ở Tổ chức — hồ sơ đã ký `to-chuc-danh-sach-chi-tiet` ghim chữ.
- Máy chủ chặn cập nhật bản đã cất; luật kho «vòng đời» (V2L).
- Gom nút «Đã lưu trữ» của ba bảng thành một mảnh ở `packages/ui`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: chọn dòng → «Thao tác» → «Lưu trữ» → toast «Đã lưu trữ 3 cá nhân.» + «Hoàn tác» → (không bấm) toast tắt
  sau 10 giây.
- Biên: bấm «Hoàn tác» → «Đã khôi phục 3 cá nhân.» và ba dòng hiện lại; một phần không lưu trữ được → toast nói số
  bỏ qua, vẫn «Hoàn tác».
- Lỗi & quay lại: Hoàn tác thất bại → «Chưa hoàn tác được. Các bản ghi vẫn ở mục Đã lưu trữ.»; người dùng mở «Đã lưu
  trữ» và khôi phục ở đó.
- Mở bản đã cất (đường dẫn cũ, mục «Đã lưu trữ») → dải «Đã lưu trữ ngày 15/09/2026 · Khôi phục», ô chỉ đọc → bấm
  «Khôi phục» → toast «Đã khôi phục …», dải mất, ô sửa được.
- Kanban → «Đã lưu trữ» → bảng thoả thuận đã cất → bấm lại → Kanban.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng cá nhân / công ty / thoả thuận (bảng, Kanban) | tìm và làm việc với nhiều bản ghi | thanh bên / ngăn bản ghi, «Đã lưu trữ» |
| Ngăn bản ghi | xem và làm việc với một bản ghi | bảng, đường dẫn / đóng ngăn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-vdc-luu-tru-loat | Bảng | toast «Đã lưu trữ n …» + «Hoàn tác» (10 giây) | bấm Hoàn tác hoặc bỏ qua |
| ST-vdc-luu-tru-mot-phan | Bảng | toast nói số đã lưu trữ và số bỏ qua + «Hoàn tác» | bấm Hoàn tác hoặc bỏ qua |
| ST-vdc-hoan-tac-loi | Bảng | toast lỗi «Chưa hoàn tác được. Các bản ghi vẫn ở mục Đã lưu trữ.» | mở «Đã lưu trữ», khôi phục |
| ST-vdc-ngan-da-cat | Ngăn bản ghi | dải «Đã lưu trữ ngày …» + «Khôi phục»; ô tắt | bấm Khôi phục hoặc đóng ngăn |
| ST-vdc-kanban-da-luu-tru | Bảng thoả thuận | nút «Đã lưu trữ» trên Kanban; bấm → bảng đã cất, nút đang chọn | bấm lại để về Kanban |
| ST-vdc-xoa-vinh-vien | Bảng (Đã lưu trữ), ngăn | hộp hỏi lại nêu hậu quả, nút «Xoá vĩnh viễn» tắt khi đang chạy | xác nhận hoặc Huỷ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- «Hoàn tác» chỉ ăn một lần; toast tắt sau 10 giây (`LUU_TRU.hoanTacMs`).
- Dải báo không đóng được — nó là trạng thái của bản ghi, không phải thông báo.
- Ô tắt dùng kiểu tắt sẵn có của `Button`/`Input` (mờ, con trỏ cấm), không thêm kiểu riêng.
- 390: dải báo xuống dòng gọn trong ngăn, nút «Khôi phục» trong khung nhìn; thanh công cụ Kanban xếp dọc như dạng bảng.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `baoDaLuuTru` (`packages/ui/src/lib/bao-luu-tru.ts`) | dùng | toast lưu trữ có Hoàn tác của kho (K6b) |
| `Alert` + `AlertAction` | ghép | dải báo có một nút, không cần mảnh mới |
| `ConfirmDialog` | dùng | hộp hỏi lại chuẩn của kho, có `pending` |
| `Button variant contrast/outline` «Đã lưu trữ» | dùng | chép nút sẵn có của dạng bảng |
| `fieldset disabled` | ghép — tiền lệ `okr/soan/the-nhap.tsx` (fieldset trần, bỏ viền và lề), `okr/hoi-y/sheet-mo-hoi-y.tsx` (`FieldSet disabled`) | tắt mọi ô sửa tại chỗ mà không sửa component ngoài ranh giới |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: chỉ đổi trạng thái bên trong bảng (toast, nút thanh công cụ) và ngăn chi tiết; không màn mới, luồng theo chuẩn vòng đời đã duyệt.
<!-- UX-SPEC-TEMPLATE>>> -->
