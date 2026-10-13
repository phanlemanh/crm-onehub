# Lịch sử và lưu trữ trang — thiết kế

Hàng `l3b` của `docs/plan/lo-trinh-kho-tai-lieu.json`, dãy P6 đợt r2. Câu giao: «Tôi xem được các phiên bản cũ của
trang, khôi phục một bản cũ qua duyệt, và lưu trữ trang không còn dùng». T3: thêm cột vào `TaiLieuTrang` và
`TaiLieuDeXuat` (`packages/db/prisma`).

Nguồn: lộ trình mục 4 «Lượt 1» («Lịch sử phiên bản; khôi phục là một đề xuất từ bản cũ; lưu trữ qua duyệt, trang lưu
trữ ẩn khỏi danh sách mặc định») và dòng 10 · `docs/vong-doi.md` (chuẩn lưu trữ; đoạn «Tài liệu đi lộ trình riêng»: lưu
trữ trang là một đề xuất qua duyệt; đề xuất đã duyệt không hiện ở tab nào) · lộ trình mục 4 «Lượt 4» (trợ lý kho
«không thấy trang lưu trữ») · `coverage-scan.md`.

Chữ đánh dấu «[chờ P6-5]», «[chờ P6-6]» là lựa chọn đang chờ người chốt; thiết kế viết theo khuyến nghị.

## Có gì sẵn

- `TaiLieuPhienBan` giữ mọi bản đã duyệt (`so`, `ten`, `noiDung`, `duyetLuc`, `duyetBoiId`, `deXuatId`), bất biến; trang
  trỏ `banDangDungId`. Chưa có đường đọc bản cũ nào.
- `TaiLieuDeXuat` là hàng chờ duyệt; `approve` tạo phiên bản mới, đánh `CU` các đề xuất cùng gốc; `TaiLieuSuKien` là nhật
  ký chỉ ghi thêm.
- Tìm (`timTrangDangDung`), đọc bản đang dùng (`docBanDangDung`, `docNhieuBanDangDung` — trợ lý kho dùng chung) ở
  `packages/db/src/tai-lieu-tim.ts`; `list`, `dangDung`, `sucKhoe`, `nhacToi`, `boLoc` ở API.
- `DiffTrang` (`packages/ui`) và `soSanh` (`@crm/validation/tai-lieu-diff`) so hai chữ bất kỳ.
- Nhóm «Đã xử lý» của tab Chờ duyệt chỉ gồm `TRA_LAI`, `CU`; «Tất cả» loại `DA_DUYET`.

## Làm gì

### Dữ liệu (`packages/db/prisma`, một `migration` mốc giờ UTC thật)

- `TaiLieuTrang.archivedAt DateTime?` — cùng tên với mọi bản ghi lưu trữ được của kho, để dùng lại `archivedFilter`.
- `TaiLieuDeXuat.loai String @default("NOI_DUNG")` — `NOI_DUNG` · `LUU_TRU` · `KHOI_PHUC`; `TaiLieuDeXuat.tuPhienBanSo Int?`
  — đề xuất nội dung sinh từ một phiên bản cũ; `TaiLieuDeXuat.lyDoDeXuat String?` — lý do của đề xuất lưu trữ hay khôi
  phục [chờ P6-6]. Khuôn ở `packages/validation/src/tai-lieu.ts`; sự kiện mới `LUU_TRU`, `KHOI_PHUC` vào `LOAI_SU_KIEN`.

### Máy chủ

- `taiLieu.lichSu({slug})` — các phiên bản của trang, mới nhất trước: số, tên, ngày duyệt, người duyệt, người đề xuất,
  có phải bản đang dùng. Ai đọc được trang thì xem được.
- `taiLieu.phienBan({slug, so})` — chữ một phiên bản cùng chữ bản đang dùng để so.
- `taiLieu.quayLai({slug, so})` — tạo đề xuất `NOI_DUNG` mang tên và nội dung phiên bản `so`, gốc là bản đang dùng,
  `tuPhienBanSo = so`; đi `taoDeXuatTaiLieu`. Bản `so` đang dùng hay chữ trùng bản đang dùng → từ chối `chuaDoi`.
- `taiLieu.deXuatLuuTru({slug, lyDo})` và `taiLieu.deXuatKhoiPhuc({slug, lyDo})` — đề xuất `LUU_TRU` (chỉ trang đang dùng,
  chưa lưu trữ, không có đề xuất lưu trữ đang chờ) và `KHOI_PHUC` (chỉ trang đã lưu trữ, không có đề xuất khôi phục đang chờ).
- `approve` rẽ theo `loai`: `LUU_TRU` đặt `archivedAt` (đã có thì giữ ngày đầu), đánh `CU` các đề xuất nội dung đang
  chờ với một sự kiện `CU` mỗi đề xuất như luật có sẵn [chờ P6-8], ghi sự kiện `LUU_TRU`, không tạo phiên bản; `KHOI_PHUC` xoá `archivedAt`, ghi `KHOI_PHUC`. `reject` như cũ. Quyền
  duyệt như cũ (`duyetDuocTrang`). `propose` từ chối trang đã lưu trữ.
- Lọc một chỗ: `dieuKienDangDung()` ở `packages/db/src/tai-lieu-tim.ts` (`banDangDungId` khác null và `archivedAt`
  null) dùng ở `timTrangDangDung`, `docBanDangDung`, `docNhieuBanDangDung`, `dangDung`, `sucKhoe`, `nhacToi`, `boLoc`;
  `list` nhận `archived` (`archivedFilter`). `get` vẫn trả trang đã lưu trữ, kèm `daLuuTru {luc}`.
- Nhóm «Đã xử lý» gồm `DA_DUYET`.

### Màn (`apps/app/app/(app)/[slug]/tai-lieu/**`)

- Màn đọc: nút «Lịch sử» cạnh «Sửa trang»; trình đơn «…» có «Đề xuất lưu trữ» (hộp có ô lý do). Trang đã lưu trữ: dải
  `Alert` «Trang đã lưu trữ ngày … · Đề xuất khôi phục», không có «Sửa trang» và «Đề xuất lưu trữ».
- `/tai-lieu/[trang]/lich-su`: bảng phiên bản; `/tai-lieu/[trang]/lich-su/[so]`: so phiên bản với bản đang dùng
  (`DiffTrang`) hoặc đọc toàn văn, nút «Quay lại phiên bản N» [chờ P6-6].
- Màn duyệt: đề xuất `LUU_TRU`/`KHOI_PHUC` hiện tên việc và lý do thay cho diff; đề xuất quay lại mang nhãn «Quay lại
  phiên bản N».
- Danh sách trang: nút «Đã lưu trữ» trên thanh công cụ (tham số `archived` trên URL).

## Không làm

- Xoá vĩnh viễn trang [chờ P6-5]; lưu trữ nguồn tài liệu [chờ P6-5]; lưu trữ hàng loạt; so hai bản cũ với nhau.
- Mảnh dải báo dùng chung trong `packages/ui` — việc của hàng V2e (`dai-luu-tru-dung-chung`); lượt này dùng `Alert`.
- Sửa hay xoá phiên bản đã duyệt, lưu trữ không qua duyệt.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (lịch sử): màn đọc → «Lịch sử» → bảng phiên bản → chọn phiên bản 2 → so với bản đang dùng → «Quay lại phiên
  bản 2» → màn duyệt của đề xuất mới (điểm ra: hàng Chờ duyệt của chủ trang).
- Suôn sẻ (lưu trữ): màn đọc → «…» → «Đề xuất lưu trữ» → gõ lý do → gửi → toast «Đã gửi đề xuất lưu trữ» → chủ trang duyệt
  → trang rời danh sách, tìm, trợ lý → tìm lại ở «Đã lưu trữ» → «Đề xuất khôi phục» → duyệt → trang về danh sách.
- Biên: trang chỉ có một phiên bản (lịch sử một dòng, không có «Quay lại»); trang chưa từng duyệt (không có «Lịch sử»,
  không có «Đề xuất lưu trữ»); đã có đề xuất lưu trữ đang chờ (mục trình đơn khoá, có dòng vì sao); người vai `okr`.
- Lỗi & quay lại: gửi đề xuất lỗi mạng → hộp giữ chữ, nút «Thử lại»; phiên bản không có → trang 404 của kho; duyệt lưu
  trữ khi trang đã đổi → thông báo «Trang đã thay đổi, tải lại» như duyệt cũ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Lịch sử trang | Chọn một phiên bản cũ để xem | màn đọc / phiên bản cũ |
| Phiên bản cũ | Thấy bản cũ khác bản đang dùng ở đâu | lịch sử / màn duyệt đề xuất quay lại |
| Màn đọc (đã lưu trữ) | Biết trang đã thôi dùng và xin khôi phục | «Đã lưu trữ», liên kết cũ / màn duyệt |
| Màn duyệt (lưu trữ, khôi phục) | Duyệt hay trả lại việc cất hay lấy lại trang | Chờ duyệt / màn đọc |
| Danh sách — Đã lưu trữ | Tìm lại trang đã lưu trữ | danh sách trang / màn đọc |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-lich-su-dang-tai | Lịch sử trang | khung xương bảng, tiêu đề trang giữ nguyên | chờ |
| ST-lich-su-mot-ban | Lịch sử trang | một dòng «Phiên bản 1 · Đang dùng», câu «Trang mới có một phiên bản» | về màn đọc |
| ST-lich-su-nhieu-ban | Lịch sử trang | bảng mới nhất trước, nhãn «Đang dùng» ở dòng đầu | chọn phiên bản |
| ST-lich-su-loi | Lịch sử trang | `VungTaiLoi` «Không tải được lịch sử» | «Thử lại» |
| ST-ban-cu-so-sanh | Phiên bản cũ | diff với bản đang dùng, chữ thêm và bớt tô | «Quay lại phiên bản N» / «Toàn văn» |
| ST-ban-cu-toan-van | Phiên bản cũ | toàn văn bản cũ đọc như màn đọc | «So với bản đang dùng» |
| ST-ban-cu-dang-dung | Phiên bản cũ | phiên bản chọn là bản đang dùng: không diff, câu «Đây là bản đang dùng» | về lịch sử |
| ST-doc-hop-luu-tru | Màn đọc | hộp «Đề xuất lưu trữ trang» với ô lý do, nút «Gửi đề xuất» | gửi / huỷ |
| ST-doc-cho-luu-tru | Màn đọc | huy hiệu «Có đề xuất lưu trữ chờ duyệt», mục trình đơn khoá | xem đề xuất |
| ST-doc-da-luu-tru | Màn đọc | dải «Trang đã lưu trữ ngày …» + «Đề xuất khôi phục», nội dung đọc được, không «Sửa trang» | đề xuất khôi phục |
| ST-doc-cho-khoi-phuc | Màn đọc | dải đã lưu trữ với huy hiệu «Có đề xuất khôi phục chờ duyệt» thay nút | xem đề xuất |
| ST-duyet-luu-tru | Màn duyệt | «Đề xuất lưu trữ trang» + lý do + người đề xuất, nút «Duyệt lưu trữ» / «Trả lại» | duyệt / trả lại |
| ST-duyet-khoi-phuc | Màn duyệt | «Đề xuất khôi phục trang» + lý do, nút «Duyệt khôi phục» / «Trả lại» | duyệt / trả lại |
| ST-duyet-quay-lai | Màn duyệt | diff như mọi đề xuất + nhãn «Quay lại phiên bản N» | duyệt / trả lại |
| ST-ds-da-luu-tru | Danh sách | nút «Đã lưu trữ» bật, bảng chỉ trang đã lưu trữ, cột «Lưu trữ ngày» | mở trang |
| ST-ds-da-luu-tru-rong | Danh sách | `Empty` «Chưa có trang nào đã lưu trữ» | tắt «Đã lưu trữ» |
| ST-cho-duyet-da-xu-ly | Chờ duyệt | nhóm «Đã xử lý» có cả đề xuất đã duyệt, nhãn «Đã duyệt» | mở đề xuất |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Lý do: 1–500 ký tự sau khi bỏ khoảng trắng hai đầu; nút gửi khoá khi rỗng [chờ P6-6].
- Hộp đề xuất: nút Huỷ bọc `DialogClose asChild`; Enter trong ô lý do xuống dòng, không gửi.
- Dưới `md`: bảng lịch sử thành danh sách `Item variant="outline"`; diff giữ một cột.
- Mọi chữ do người nhập (tên trang, lý do, nội dung) mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `PageShell`, `SimpleTable`, `Item`, `Badge`, `StatusIndicator` | dùng | nếp màn danh sách của `docs/design.md` |
| `DiffTrang` | dùng | đã so hai chữ ở màn duyệt |
| `MarkdownReader` | dùng | toàn văn bản cũ đọc như màn đọc |
| `Dialog`, `Field`, `Textarea`, `DialogClose` | ghép | hộp đề xuất lưu trữ/khôi phục |
| `Alert` | dùng | dải trang đã lưu trữ; mảnh chung là việc V2e |
| `ToggleGroup` | dùng | chuyển «So với bản đang dùng / Toàn văn» |
| `DropdownMenu` | dùng | trình đơn «…» của màn đọc |
| `VungTaiLoi`, `Empty` | dùng | lỗi tải và rỗng theo nếp màn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: (ii) lịch sử là danh sách phiên bản, mở một dòng ra chi tiết; trùng cách Confluence «Page history» và MediaWiki
«View history» xếp — danh sách bản sửa, chọn một bản để xem và so.
<!-- UX-SPEC-TEMPLATE>>> -->
