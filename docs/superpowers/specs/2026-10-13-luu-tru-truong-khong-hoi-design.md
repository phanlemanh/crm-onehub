# Lưu trữ trường không hỏi lại — thiết kế

Hàng V2b của `docs/plan/lo-trinh-okr.json`, dãy P3 đợt r2. Cổng Đáng `build` (chủ kho, 2026-10-12T23:58:15Z). Mở từ
OOS-2 của V2 `vong-doi-mot-cach-cat`: V2 chỉ đổi chữ mô tả của trình sửa trường.

## Vấn đề

`docs/vong-doi.md` dặn: «Lưu trữ không hỏi, toast luôn có «Hoàn tác»». Trường tự tạo (Cài đặt › Trường, và ngăn
«Quản lý trường» mở từ bảng) có hai đường lưu trữ, cả hai lệch luật:

| Đường | Hôm nay |
| --- | --- |
| Menu «…» trên mỗi dòng của danh sách trường (`fields-list.tsx`) | lưu trữ ngay, không toast, không «Hoàn tác» |
| Nút «Lưu trữ» trong trình sửa trường (`field-editor.tsx`) | hỏi lại bằng `AlertDialog` ráp tay, rồi lưu trữ, không «Hoàn tác» |

Muốn lấy lại một trường cất nhầm, người dùng phải tự tìm nhóm «Đã lưu trữ» cuối danh sách.

## Cách làm

**Một hook cho cả hai đường.** `useLuuTruTruong(entity)` trong `components/crm/fields/` gói `fields.archive` và
`fields.restore`:

- Lưu trữ xong: làm mới danh sách trường (`cache.fields`) rồi gọi `baoDaLuuTru` của `packages/ui` — toast «Đã lưu
  trữ <nhãn>.» kèm nút «Hoàn tác» 10 giây, bấm hai lần vẫn chỉ khôi phục một lần. Đây đúng mảnh mà ba bảng CRM dùng
  từ V2.
- «Hoàn tác» gọi `fields.restore` với đúng id; xong thì toast «Đã khôi phục <nhãn>.» và làm mới danh sách.
- Hoàn tác lỗi: toast «Chưa hoàn tác được. Trường vẫn ở mục Đã lưu trữ.» — không in lỗi thô của máy chủ.

Hook đặt ở **component chủ** — trang Cài đặt › Trường (`fields-settings.tsx`) và ngăn «Quản lý trường»
(`fields-sheet.tsx`) — chứ không ở trình sửa: lưu trữ từ trình sửa thì trình sửa bị gỡ ngay, còn «Hoàn tác» bấm sau đó
phải gọi một mutation còn sống. Chủ truyền `onArchive(field)` xuống `FieldsList` (menu dòng) và `FieldEditor` (nút
«Lưu trữ»). Trình sửa bỏ `AlertDialog`: nút «Lưu trữ» gọi `onArchive` rồi đóng như hôm nay. Trong ngăn, toast nằm
ngoài lớp của Sheet; bấm «Hoàn tác» không được làm đóng ngăn.

**Chữ.** Thêm `fields.archived`, `fields.restored`, `fields.hoanTacLoi` (vi/en). Ba khoá chỉ hộp hỏi lại dùng —
`archiveTitle`, `archiveBody`, `archiveField` — thành khoá chết nên bỏ, cùng dòng `GHIM` của `archiveTitle` trong
`messages-guard.spec.ts`; bài `vdc-chu` của V2 thôi đọc `archiveBody` (vẫn đọc `archivedNote`).

Máy chủ không đổi: `fields.archive` và `fields.restore` đã có, cùng quyền quản trị.

## Không làm

- Nút «Khôi phục» trong nhóm «Đã lưu trữ» của danh sách trường giữ như hôm nay (khôi phục, làm mới, không toast).
- Xoá vĩnh viễn trường.
- Gom menu dòng và nhóm «Đã lưu trữ» về `ArchivedList`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: danh sách trường › «…» của một dòng › «Lưu trữ» → dòng rời nhóm đang dùng, sang nhóm «Đã lưu trữ», toast
  «Đã lưu trữ Nguồn khách.» với «Hoàn tác» (điểm ra: để toast tự tắt, hoặc bấm «Hoàn tác»).
- Trình sửa: «Lưu trữ» → trình sửa đóng, cùng toast.
- Biên: không đủ quyền → nút «…» và nút trong trình sửa bị khoá như hôm nay, không có toast.
- Lỗi & quay lại: lưu trữ lỗi → toast lỗi như hôm nay, trường ở nguyên chỗ; hoàn tác lỗi → toast «Chưa hoàn tác
  được…», trường vẫn trong nhóm «Đã lưu trữ», khôi phục tay ở đó.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Trường | quản lý trường tự tạo của một loại bản ghi | thanh bên Cài đặt / trình sửa trường |
| Ngăn «Quản lý trường» | như trên, mở từ bảng | nút trường của bảng / trình sửa trường |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-truong-vua-cat | danh sách trường | dòng ở nhóm «Đã lưu trữ», toast «Đã lưu trữ <nhãn>.» + «Hoàn tác» | bấm «Hoàn tác» hoặc để yên |
| ST-truong-hoan-tac | danh sách trường | dòng về nhóm đang dùng, toast «Đã khôi phục <nhãn>.» | làm tiếp |
| ST-truong-hoan-tac-loi | danh sách trường | dòng vẫn ở «Đã lưu trữ», toast «Chưa hoàn tác được. Trường vẫn ở mục Đã lưu trữ.» | khôi phục tay ở nhóm «Đã lưu trữ» |
| ST-truong-khong-quyen | danh sách trường | dòng «Bạn cần quyền quản trị…», nút khoá | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không hộp hỏi lại nào mở khi lưu trữ một trường.
- «Hoàn tác» sống 10 giây (`LUU_TRU.hoanTacMs`), bấm hai lần vẫn một lần khôi phục.
- Nhãn trường là dữ liệu người nhập, đi nguyên trong câu toast.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `baoDaLuuTru` (`packages/ui/src/lib/bao-luu-tru.ts`) | dùng | toast «Hoàn tác» chung của ba bảng CRM |
| `useLuuTruTruong` (`components/crm/fields/`) | tạo | một chỗ cho hai đường lưu trữ trường, gọi ở hai component chủ; chỉ khu trường dùng |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: danh sách trường và trình sửa đã có; việc này chỉ bỏ một hộp hỏi và thêm một toast — luồng hiển nhiên, không tra.
<!-- UX-SPEC-TEMPLATE>>> -->

## Chuẩn nội đã nạp

`feature_loop.ui_standards_skill: web-design-guidelines` — bản Web Interface Guidelines đã nạp ở V2a cùng phiên (13/10).
Áp ở đây: thao tác phá huỷ được thì cho hoàn tác thay vì hỏi lại; toast không tự mất trước khi người kịp bấm.
