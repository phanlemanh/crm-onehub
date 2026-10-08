# Danh sách kéo thả chung, giai đoạn theo nếp lưu trữ — thiết kế (E3 `danh-sach-keo-chung`)

Ngày: 2026-10-08 · Hạng: T2 · Đợt: sau-14-10, dãy P3 · Hồ sơ: `_acceptance/danh-sach-keo-chung/`

## Vấn đề

Hai trang Cài đặt có danh sách kéo để sắp xếp — Tổ chức (bộ phận ở gốc, phòng ban trong bộ phận) và Giai đoạn
thoả thuận — là hai bản chép (`organization/danh-sach-keo.tsx`, `giai-doan/giai-doan-settings.tsx`), đã lệch nhau:

| | Tổ chức | Giai đoạn |
|---|---|---|
| Lưu lỗi | quay về thứ tự cũ | giữ thứ tự vừa kéo tới khi tải lại trang (Ngoài-8 của `giai-doan-thoa-thuan`) |
| Sau khi sắp | toast «Đã lưu thứ tự mới», không «Hoàn tác» | toast «Đã đổi thứ tự.» có «Hoàn tác» |
| Dòng hướng dẫn kéo | có | không |
| Khung | hộp `rounded-lg border` tự dựng (`docs/design.md` cấm) | `Card` |

Thêm phần vòng đời (bảng vòng đời của đợt sau-14-10, lượt 2 của `docs/vong-doi.md`): giai đoạn ghi «Xoá» nhưng máy
chủ chỉ đặt `archivedAt`, và không có chỗ nào thấy lại hay lấy lại giai đoạn đã cất. Bảng vòng đời của đợt ghi «máy
chủ giai đoạn đã lưu trữ đúng, chỉ chữ và màn lệch» — đọc mã thì không đủ: `giaiDoan.list` chỉ trả giai đoạn sống,
không có thủ tục đọc giai đoạn đã cất hay khôi phục.

Nguồn: Ngoài-2 của `giai-doan-thoa-thuan` (Cổng Bằng chứng 29/09, «mở hợp đồng mới»), khảo sát lộ trình 04/10.

## Cách làm (anh duyệt 08/10, «Đồng ý theo lời khuyên» — A ở cả ba câu)

### 1. Một thành phần kéo có lưu, trong `packages/ui`

`packages/ui/src/components/sortable-list.tsx` thêm `SortableSaveList` cạnh `SortableList` (giữ nguyên cho Trường
tuỳ chỉnh). Nó giữ trọn hành vi chung:

- Nhận `ids`, `disabled`, `onSave(change) => Promise`, với `change = { ids, id, index }` — toàn bộ thứ tự mới, mục
  vừa kéo và chỗ mới của nó. Nơi gọi chọn dùng phần nào (bộ phận và giai đoạn gửi cả danh sách, phòng ban gửi
  `id` + `index`).
- Kéo xong: hiện thứ tự mới ngay, khoá mọi tay kéo tới khi `onSave` xong.
- `onSave` thành công: toast «Đã lưu thứ tự mới» có nút «Hoàn tác»; bấm «Hoàn tác» gọi lại `onSave` với thứ tự cũ
  (`id` cùng chỗ cũ), không mở toast «Hoàn tác» lồng; hoàn tác xong thì toast «Đã trả thứ tự cũ» không có nút, hoàn
  tác lỗi thì giữ thứ tự mới và toast lỗi.
- `disabled` (không quyền, hoặc nơi gọi đang bận) khoá mọi tay kéo.
- `onSave` lỗi: trả thứ tự cũ ngay, toast lỗi bằng thông điệp của lỗi.
- Dưới danh sách một dòng hướng dẫn kéo (chuột hoặc phím Space rồi mũi tên).
- Chữ ở `packages/ui/src/lib/messages.ts`, khoá `sortableList` (`hint`, `saved`, `undo`, `restored`; vi, en). Toast dùng `sonner` như `copy-value.tsx`.

Tổ chức (`chi-tiet-goc.tsx`, `chi-tiet-bo-phan.tsx`) và Giai đoạn (`giai-doan-settings.tsx`) chỉ truyền hàm lưu và
nội dung mỗi hàng. `organization/danh-sach-keo.tsx` còn lo nội dung hàng (tên, chữ phụ, menu) trên
`SortableSaveList`, bỏ hộp tự dựng.

### 2. Giai đoạn: «Xoá» → «Lưu trữ»

- Menu hàng ghi «Lưu trữ». Giai đoạn cuối cùng của nhóm vẫn bị khoá với lý do như cũ.
- Giai đoạn không có thoả thuận: lưu trữ ngay, không hỏi; toast «Đã lưu trữ «<tên>».» có «Hoàn tác» → khôi phục rồi
  sắp lại nhóm theo thứ tự trước khi lưu trữ, nên giai đoạn về đúng chỗ cũ (`restore` rồi `reorder`; gap-probe P2).
- Giai đoạn còn thoả thuận: vẫn hỏi chuyển sang giai đoạn nào (máy chủ đòi). Hộp thoại «Lưu trữ «<tên>»?», nút
  «Chuyển và lưu trữ», câu phụ nói giai đoạn lấy lại được ở «Đã lưu trữ» còn thoả thuận ở lại giai đoạn mới. Toast
  không có «Hoàn tác» — khôi phục không đưa thoả thuận về (anh chọn A ở câu 2).

### 3. «Đã lưu trữ (n)»

- Một `ArchivedList` ở cuối trang Giai đoạn (như Tổ chức), mỗi dòng ghi tên và nhóm (Đang mở / Chốt được / Không
  thành), chỉ có «Khôi phục». Không «Xoá vĩnh viễn» ở vòng này — lịch sử thoả thuận còn mang tên giai đoạn (anh chọn
  A ở câu 3). `purgeable: false` cho mọi dòng.
- Khôi phục: giai đoạn trở lại cuối nhóm của nó, toast «Đã khôi phục «<tên>».». Bị chặn (toast lỗi, không đổi gì) khi
  trùng tên với giai đoạn đang dùng hoặc đã đủ 20 giai đoạn.

### 4. Máy chủ (`apps/api/src/giai-doan`, chỉ thêm)

- `giaiDoan.archived` (đọc): giai đoạn đã cất `{ id, label, kind, archivedAt }`, mới cất trước. Cùng phạm vi đọc với
  `giaiDoan.list`.
- `giaiDoan.restore` (ghi, chỉ chủ và quản trị): dưới `FOR UPDATE` của giai đoạn sống — không có hay chưa cất → 404 /
  400; trùng tên sau khi chuẩn hoá → 400 «trùng tên»; đủ `GIAI_DOAN.tran.tong` → 400 «đủ trần»; còn lại đặt
  `archivedAt = null`, `position` = cuối nhóm. Không trí khôn, không đụng thoả thuận.
- `cache.giaiDoan()` làm mới thêm `giaiDoan.archived`.
- `list`, `archive`, `reorder` giữ nguyên.

## Ba câu vòng đời (`docs/vong-doi.md`)

1. **Dọn thế nào**: Lưu trữ → Khôi phục. Xoá vĩnh viễn hoãn.
2. **«Lịch sử» nghĩa là gì**: thoả thuận từng ở giai đoạn đó (dòng `STAGE_CHANGE` mang mã giai đoạn); vì thế không có
   nút Xoá.
3. **Danh sách mặc định hiện gì**: giai đoạn sống theo ba nhóm; giai đoạn đã cất tìm lại ở «Đã lưu trữ (n)» cuối
   trang. Bảng, Kanban, bộ lọc không đổi.

## Phản biện context sạch (S1, 08/10)

0 P0, 2 P1, 3 P2 — sửa cả năm vào hợp đồng và phép đo (`gap-probe.md`): lưu lỗi ở Tổ chức có phép đo riêng
(`sap-luu-loi.dom.tsx`); kết quả của «Hoàn tác» được hứa (toast «Đã trả thứ tự cũ»); giai đoạn cuối nhóm và người
không quyền có dòng đo; «Hoàn tác» lưu trữ về đúng chỗ cũ; sàn thiết kế quét theo `git diff`.

## Loại

- **Mỗi trang tự giữ thứ tự tạm, chỉ sửa Ngoài-8 tại chỗ**: lại thành hai bản chép, lệch tiếp ở lần sửa sau.
- **Hoàn tác đưa cả thoả thuận về (B ở câu 2)**: máy chủ phải nhớ danh sách thoả thuận đã chuyển; thêm một lượt API.
- **Xoá vĩnh viễn giai đoạn chưa từng có thoả thuận (B ở câu 3)**: thêm thủ tục và luật «lịch sử» mới, E4 cũng chạm
  giai đoạn.
- **Đổi `SortableList` sẵn có thay vì thêm `SortableSaveList`**: Trường tuỳ chỉnh dùng nó với bản nháp cục bộ, không có
  lưu; đổi hợp đồng của nó kéo tệp ngoài ranh giới.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Giai đoạn (hoặc Tổ chức) → kéo tay kéo của một hàng → thả → danh sách hiện thứ tự mới, toast «Đã lưu thứ tự mới» có «Hoàn tác» (điểm ra: thứ tự mới đã lưu)
- Biên: bấm «Hoàn tác» → thứ tự cũ trở lại; giai đoạn không có thoả thuận → «Lưu trữ» cất ngay, toast có «Hoàn tác»; giai đoạn còn thoả thuận → hộp thoại chọn giai đoạn đích; «Đã lưu trữ (n)» → «Khôi phục» → giai đoạn về cuối nhóm
- Lỗi & quay lại: lưu thứ tự lỗi → thứ tự cũ trở lại ngay, toast lỗi; khôi phục bị chặn (trùng tên, đủ trần) → toast lỗi, danh sách không đổi

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Giai đoạn | sắp, đổi tên, lưu trữ, khôi phục giai đoạn thoả thuận | thanh bên Cài đặt / Kanban và bảng thoả thuận dùng thứ tự mới |
| Cài đặt › Tổ chức (gốc, bộ phận) | sắp bộ phận, phòng ban | thanh bên Cài đặt / cây tổ chức |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-keo-dang-luu | Giai đoạn, Tổ chức | thứ tự mới, mọi tay kéo bị khoá | chờ |
| ST-keo-da-luu | Giai đoạn, Tổ chức | thứ tự mới, toast «Đã lưu thứ tự mới» có «Hoàn tác» | làm tiếp hoặc Hoàn tác |
| ST-keo-loi | Giai đoạn, Tổ chức | thứ tự cũ, toast lỗi | kéo lại |
| ST-luu-tru-khong-thoa-thuan | Giai đoạn | hàng biến khỏi nhóm, «Đã lưu trữ (n)» tăng, toast có «Hoàn tác» | Hoàn tác hoặc làm tiếp |
| ST-luu-tru-co-thoa-thuan | Giai đoạn | hộp thoại chọn giai đoạn đích, nút «Chuyển và lưu trữ» | chọn đích, xác nhận hoặc Huỷ |
| ST-da-luu-tru | Giai đoạn | mục gập «Đã lưu trữ (n)», mỗi dòng tên + nhóm + «Khôi phục» | Khôi phục |
| ST-khoi-phuc-bi-chan | Giai đoạn | toast lỗi trùng tên / đủ trần, danh sách không đổi | đổi tên giai đoạn đang dùng hoặc lưu trữ bớt |
| ST-khong-quyen | Giai đoạn, Tổ chức | tay kéo, menu, «Khôi phục» bị khoá, một dòng lý do dưới tiêu đề | không |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bàn phím: tay kéo nhận Space rồi mũi tên lên xuống (dnd-kit `KeyboardSensor`), như cũ.
- «Hoàn tác» chỉ một bậc; đang lưu thì «Hoàn tác» thứ hai bị bỏ qua.
- Dữ liệu người nhập (tên giai đoạn, tên đơn vị) đánh dấu `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `SortableSaveList` | tạo, trong `packages/ui` (bậc 5) | bậc 1–4 không có danh sách kéo có lưu và hoàn tác; `SortableList` sẵn có là nền |
| `ArchivedList` | dùng (bậc 1) | mảnh chung của `docs/vong-doi.md`, Tổ chức đã dùng |
| `ConfirmDialog`, `Dialog` | dùng (bậc 1) | hộp hỏi chuyển thoả thuận như cũ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi khuôn — hai trang Cài đặt giữ bố cục; chỉ gộp hành vi kéo và thêm mục gập «Đã lưu trữ» như Tổ chức đã có.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- `packages/ui/test/sortable-save-list.dom.tsx` (mới): thứ tự tạm, khoá khi đang lưu, quay về khi lỗi, toast có
  Hoàn tác gọi lại với thứ tự cũ, dòng hướng dẫn.
- `apps/app/test/giai-doan-cai-dat.dom.tsx`: «Lưu trữ», hai nhánh có / không thoả thuận, «Đã lưu trữ (n)», khôi phục
  bị chặn, lưu thứ tự lỗi trả thứ tự cũ.
- `apps/api/test/giai-doan.spec.ts`: `archived`, `restore` (cuối nhóm, trùng tên, đủ trần, chưa cất); quyền ở
  `giai-doan-quyen.spec.ts`.
- Màn thật qua `mot-luot.sh`: sắp + Hoàn tác ở Giai đoạn và Tổ chức, lưu trữ + khôi phục giai đoạn, 1440 và 375.
