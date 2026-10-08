# Bộ lọc danh sách rõ — thiết kế (E7 `datatable-loc-ro`)

Ngày: 2026-10-07 · Hạng: T2 · Đợt: sau-14-10, dãy P3 · Hồ sơ: `_acceptance/datatable-loc-ro/`

## Vấn đề

Câu giao của hàng E7 (`docs/plan/lo-trinh-okr.json`): «Bảng rỗng vì đang lọc thì nói rõ, nút bỏ
lọc đúng tên, lựa chọn có số 0 vẫn hiện». Soi mã ở `origin/onehub` 0426cc9d0:

1. `DataTable` (`packages/ui/src/components/data-table.tsx:654`) chỉ có một câu cho mọi ca rỗng, do
   màn truyền vào. Thoả thuận, cá nhân, công ty ghi «Chưa có … nào khớp bộ lọc này» — sai khi không
   lọc gì, và khi đang lọc thì không có đường ra ngay tại ô rỗng.
2. Menu con của một tiêu chí có nút «Bỏ hết tiêu chí» nhưng chỉ bỏ lựa chọn của tiêu chí đó; menu
   con có ô tìm (Công ty) không có nút này.
3. Mọi bảng lọc bỏ lựa chọn có đếm 0 (`… > 0`), `field-facets.tsx:40` cũng vậy, và bộ lọc trạng thái
   của `DataTable` ẩn lựa chọn đếm 0. Đếm của API chỉ theo ô tìm và chế độ lưu trữ, nên gõ tìm
   kiếm làm lựa chọn đang chọn biến khỏi menu — không bỏ chọn được ở chỗ đã chọn.

Màn OKR đã giải đúng ba việc này (`okr/loc-okr.tsx`: nhãn «· n», giữ lựa chọn đang chọn,
`KhongKhop` + nút «Bỏ lọc»). Vòng này đưa bốn bảng CRM về cùng mẫu, làm ở `DataTable` dùng chung.

## Cách làm (anh duyệt 07/10, phương án A cho lựa chọn số 0)

**`packages/ui` — `DataTable`, chỉ thêm prop tuỳ chọn, chữ ký cũ giữ nguyên:**

- `searchActive?: boolean` — bảng báo ô tìm đang có chữ (`DataTable` không thấy ô tìm vì nó là
  `ReactNode` của màn).
- `onClearFilters?: () => void` — bảng đưa hàm bỏ lọc. Bảng tự làm vì chỉ bảng ghi URL được trong
  một lần: `setFilter` gọi lần lượt từng tiêu chí ghi đè nhau ở trường tuỳ chỉnh (`fields` là một
  tham số JSON). Bốn bảng dùng `applyView` của `useTableQuery`: `q` rỗng, mọi tiêu chí rỗng, bộ lọc
  trạng thái về «Tất cả», giữ `archived`, `sort`, `dir`, trang về 1.
- «Đang lọc» = có tiêu chí mang giá trị (trừ khoá bộ lọc trạng thái mà `useTableQuery` luôn ghi vào
  `filters`), hoặc bộ lọc trạng thái khác `all`, hoặc `searchActive`.
- Rỗng + không tải + đang lọc → `Empty` (`EmptyTitle`, `EmptyDescription`, `EmptyContent` có một
  `Button variant="outline" size="sm"` «Bỏ lọc» khi có `onClearFilters`). Không đang lọc → câu `empty`
  của màn như cũ. Đang tải → `Spinner` như cũ.
- Lựa chọn của tiêu chí in số đếm ở mép phải khi `facetCounts[facet.id]` có mục (giá trị vắng = 0);
  tiêu chí không có mục đếm → không in gì, nên `LocOkr` (dùng `DataTableFacetMenu` không truyền đếm)
  không đổi. `DataTableFacetMenu` nhận thêm prop tuỳ chọn `counts` để Kanban thoả thuận cũng in số.
- Bộ lọc trạng thái thôi ẩn lựa chọn đếm 0; in số khi có đếm.
- Nút trong menu con đổi chữ thành «Bỏ chọn» (en «Clear»), chỉ hiện khi tiêu chí có lựa chọn, và có
  mặt cả ở menu con có ô tìm.

**`apps/app` — bốn bảng và `field-facets`:** thôi lọc `> 0`; truyền `searchActive={input.q !== ""}`
và `onClearFilters`; Kanban thoả thuận truyền `counts`. Tiêu chí giá trị tự do rút từ khoá của đếm
(chức danh, cấp bậc, chân dung của cá nhân; ngành của công ty) gộp thêm lựa chọn đang chọn mà đếm không còn, nhãn
chính là giá trị. Câu rỗng không lọc đổi thành «Chưa có thoả thuận/cá nhân/công ty nào.»; bảng thành
viên không đổi câu (không gian làm việc luôn có ít nhất một người, ca không-lọc-mà-rỗng không xảy ra).

**Chữ** (`cham-tep` P3-2 đã duyệt): `packages/ui/src/lib/messages.ts` đổi `table.clearFilters`, thêm
`table.noMatch`, `table.noMatchDescription`, `table.resetFilters`; ba tệp chữ app đổi dòng `empty`.

## Loại

- **Đếm theo các tiêu chí còn lại** (đếm «nếu thêm lựa chọn này thì còn bao nhiêu») — đổi API, ngoài
  ranh giới; đếm hôm nay theo ô tìm + lưu trữ là con số đúng nghĩa «có bao nhiêu bản ghi mang giá trị
  này», đủ cho việc «lựa chọn có số 0 vẫn hiện».
- **Phương án B** (lựa chọn 0 mờ, không bấm được) — anh chọn A để cùng mẫu với OKR.
- **`DataTable` tự bỏ lọc bằng `setFilter` từng cái** — ghi đè nhau ở `fields`; bảng đưa hàm.
- **Nút «Bỏ lọc» thường trực trên thanh công cụ** — Later; ô rỗng là chỗ người bị kẹt.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: danh sách (thoả thuận/cá nhân/công ty/thành viên) → Lọc → menu con một tiêu chí → tick lựa chọn (thấy số bản ghi cạnh tên) → bảng thu lại (điểm ra: bảng có dòng)
- Biên: chọn lựa chọn mang số 0 hoặc tổ hợp không khớp → bảng rỗng nói «Không có kết quả nào khớp bộ lọc» + nút «Bỏ lọc»; không lọc gì mà rỗng → «Chưa có … nào.»; gõ tìm kiếm làm đếm của lựa chọn đang chọn về 0 → lựa chọn vẫn trong menu, mang «0», bỏ chọn được
- Lỗi & quay lại: kẹt vì lọc → «Bỏ lọc» ở ô rỗng (xoá tiêu chí, trạng thái, tìm kiếm; giữ chế độ lưu trữ và sắp xếp) hoặc «Bỏ chọn» trong menu con để gỡ riêng một tiêu chí

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thoả thuận (bảng + Kanban) | tìm thoả thuận cần làm | thanh bên / ngăn bản ghi |
| Cá nhân | tìm một người | thanh bên / ngăn bản ghi |
| Công ty | tìm một công ty | thanh bên / ngăn bản ghi |
| Cài đặt › Thành viên | xem và quản người trong không gian | thanh bên cài đặt / hộp thoại thành viên |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bang-dang-tai | mọi bảng | `Spinner` giữa ô bảng | chờ |
| ST-bang-rong-khong-loc | thoả thuận/cá nhân/công ty | «Chưa có thoả thuận nào.» (theo màn) | tạo bản ghi từ nút sẵn có của màn |
| ST-bang-rong-vi-loc | mọi bảng | «Không có kết quả nào khớp bộ lọc» · «Đổi hoặc bỏ bớt bộ lọc, hay xoá từ khoá tìm, để thấy lại danh sách.» · nút «Bỏ lọc» | bấm «Bỏ lọc» hoặc sửa tiêu chí |
| ST-bang-rong-luu-tru | thoả thuận/cá nhân/công ty, chế độ «Đã lưu trữ», không lọc | «Chưa có … nào đã lưu trữ.» (giữ nguyên) | tắt «Đã lưu trữ» |
| ST-menu-tieu-chi-co-so | menu con một tiêu chí | mỗi lựa chọn kèm số bản ghi ở mép phải, kể cả «0»; «Bỏ chọn» đầu menu khi có lựa chọn | tick / bỏ chọn |
| ST-menu-trang-thai-co-so | bộ lọc Mở/Đóng của thoả thuận | cả hai lựa chọn hiện, kèm số | chọn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Một lần bấm «Bỏ lọc» đưa URL về: `q` rỗng, mọi tiêu chí (kể cả trường tuỳ chỉnh) rỗng, trạng thái `all`, trang 1; giữ `archived`, `sort`, `dir`.
- «Bỏ chọn» trong menu con chỉ xoá tiêu chí đó; menu không đóng.
- Số đếm dùng `tabular-nums`, cùng độ mờ với số đếm ở nút «Lọc (n)».
- Khổ 375: ô rỗng vì lọc nằm trong khung nhìn của bảng, nút bấm được không cần cuộn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Empty` + `EmptyHeader/Title/Description/Content` | dùng | `docs/settings.md` mục Danh sách: rỗng là `Empty`; cùng khuôn `KhongKhop` của OKR |
| `Button` outline sm | dùng | một hành động phụ ở ô rỗng, như `KhongKhop` |
| `DataTable`, `DataTableFacetMenu` | mở rộng (prop tuỳ chọn) | `docs/design.md`: biến thể mới làm ở `packages/ui`, không ở chỗ gọi |
| `DropdownMenuCheckboxItem`, `CommandItem` | dùng | số đếm là một `span` con, như số ở `DropdownMenuSubTrigger` hiện có |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — bốn màn đã là danh sách mở ngăn chi tiết; vòng này chỉ đổi trạng thái rỗng và menu lọc trong khuôn đó, không tra mẫu. Đối chiếu ngành cho ô rỗng vì lọc: Linear (câu không khớp + xoá bộ lọc), bài «empty states» của NN/g (nói lý do rỗng, chỉ đường ra).
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- `packages/ui/test/data-table-loc-ro.dom.tsx` (mới, `cham-tep` P3-4): ô rỗng theo ma trận nguồn
  lọc, nút «Bỏ lọc», «Bỏ chọn», số đếm, bộ lọc trạng thái.
- `apps/app/test/bang-crm-loc-ro.dom.tsx` (mới): bốn bảng với trpc giả theo khuôn
  `chuyen-okr.dom.tsx` — lựa chọn số 0, «Bỏ lọc» ghi URL một lần, câu rỗng không lọc.
- Hồi quy: `loc-okr-ten.spec.ts`, `loc-okr-tai-truoc.spec.ts`, `render-diff.spec.tsx`,
  `lai-ra-man.spec.tsx`, `data-table-locale.spec.tsx`, `messages-guard.spec.ts`.
- Màn thật: `_acceptance/datatable-loc-ro/rang/do-man.mjs` qua `mot-luot.sh` (kho đo riêng của cây),
  375 và 1440.
