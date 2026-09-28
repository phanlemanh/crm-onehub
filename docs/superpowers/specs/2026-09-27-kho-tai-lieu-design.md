# Kho tài liệu, lượt 1 — viết, duyệt, đọc

Ngày 2026-09-27. Vòng `kho-tai-lieu`, hạng T3 (chạm `packages/db/prisma`). Lượt 1 của
`docs/plan/lo-trinh-kho-tai-lieu.md`. Thiết kế đã được chủ kho duyệt bằng lời trong phiên
2026-09-27; tệp này là bản viết của nó.

**Câu người dùng:** «Tôi viết được một trang, gửi chủ trang duyệt, cả công ty đọc được bản
đang dùng.»

## 1. Ai dùng, và điều đó đổi gì

Người dùng là dân văn phòng: họ quen Word và Google Docs, người khá hơn quen Notion. Ba thứ
là điều kiện tối thiểu (thiếu là bỏ dùng): gõ như Word, không cú pháp; dán từ Word và Google
Docs giữ được tiêu đề, danh sách, bảng; duyệt như «Track Changes» — chữ thêm tô, chữ bỏ gạch,
ngay trong văn bản đã trình bày.

Khái niệm sản phẩm khớp sẵn thứ họ biết: bản đề xuất là chế độ «Suggesting», duyệt là «Accept
all», bản đang dùng là bản đã chấp nhận. Chỉ hai bề mặt đổi so với bản mẫu và nghiên cứu:
**soạn** (trình soạn giàu thay cho ô gõ markdown) và **duyệt** (diff đã trình bày thay cho diff
dòng mono).

Kho vẫn **lưu markdown** — máy soạn ở lượt 2, tìm kiếm ở lượt 3 và trích dẫn của trợ lý AI ở
lượt 4 cần nó — nhưng người không bao giờ thấy markdown. Nghiên cứu (mục 5.3 của
`kho-tai-lieu-nghien-cuu.md`) đo được mọi trình soạn giàu viết lại dòng khi lưu; lối ra nó để
sẵn là **một bộ tuần tự hoá duy nhất** cho mọi bản ghi, nên viết lại chỉ xảy ra đúng một lần.
Lượt này thực hiện lối ra đó, và đo nó (AC-10).

## 2. Luật

- Mọi thành viên workspace, kể cả vai `okr`, tạo được trang và đề xuất sửa; đọc được mọi bản
  đang dùng. Trang nào cũng «toàn công ty» trong lượt này (chốt 2026-09-27); ô «Ai xem được»
  của bản mẫu không có.
- **Người duyệt được** một bản đề xuất: chủ trang của trang đó (kể cả bản do chính chủ trang
  tạo), và `owner` hoặc `admin` của workspace (duyệt thay khi chủ trang vắng). Không ai khác,
  kể cả người tạo bản đề xuất.
- **Người thấy một bản đề xuất**: người tạo nó và người duyệt được nó. Người khác không thấy
  nội dung, không thấy nó tồn tại.
- **Trang chưa từng được duyệt** (chưa có bản đang dùng) chỉ người thấy bản đề xuất đầu của nó
  mới thấy; với người khác, đường dẫn trả 404 giống hệt slug không tồn tại, và nó không có
  trong danh sách hay số đếm nào.
- **Duyệt là so-và-đặt.** Màn duyệt gửi kèm `diffHash` của diff người duyệt đã xem. Máy chủ
  tính lại diff giữa bản gốc của đề xuất và nội dung đề xuất; lệch → từ chối. Bản gốc của
  đề xuất khác bản đang dùng hiện tại → đề xuất thành «cũ», không duyệt được; người tạo làm lại
  trên bản mới.
- **Trả lại** cần lý do (1–500 ký tự). Bản trả lại không bao giờ thành bản đang dùng.
- Chữ người gõ chuẩn NFC lúc nhận. Slug sinh từ tên lúc tạo (bỏ dấu bằng NFD, `đ` → `d`, chữ
  thường, gạch nối), bất biến, thêm hậu tố `-2`, `-3` khi trùng; đổi tên không đổi slug (đổi
  tên đi qua bản đề xuất như nội dung).

## 3. Dữ liệu

Bảng mới, không đổi bảng cũ; `migration` chỉ thêm. Tên model tiếng Việt không dấu theo lệ kho
(`OkrObjective`, `OrgPlacement`), tiền tố `TaiLieu`.

| Model | Trường chính | Ghi chú |
| --- | --- | --- |
| `TaiLieuTrang` | `slug` (unique), `ten`, `loai` (enum 4 giá trị: loại trang), `departmentId?` → `Department`, `chuTrangId` → `User`, `xacMinhDen?`, `banDangDungId?` → `TaiLieuPhienBan`, `timKiem` (`tsvector`), `taoBoiId`, `taoLuc` | `banDangDungId` null = chưa từng duyệt |
| `TaiLieuPhienBan` | `trangId`, `so` (tăng dần theo trang, unique cùng `trangId`), `ten`, `noiDung` (markdown), `noiDungHash`, `deXuatId` (unique), `duyetBoiId`, `duyetLuc` | Bất biến: không có đường cập nhật hay xoá |
| `TaiLieuDeXuat` | `trangId`, `banGocId?` (null với trang mới), `ten`, `noiDung`, `taoBoiId`, `taoLuc`, `trangThai` (`CHO_DUYET` · `DA_DUYET` · `TRA_LAI` · `CU`), `lyDo?`, `xuLyBoiId?`, `xuLyLuc?` | Trạng thái `CU` ghi lúc duyệt một đề xuất khác của cùng trang |
| `TaiLieuSuKien` | `trangId`, `loai` (`TAO` · `DE_XUAT` · `DUYET` · `TRA_LAI` · `CU`), `aiId`, `luc`, `chiTiet` (Json) | Chỉ ghi thêm; `chiTiet` parse bằng Zod ở `packages/validation/src/tai-lieu-su-kien.ts` (hash diff, số phiên bản, lý do) |
| `TaiLieuLienKet` | `tuTrangId`, `denSlug`, `vanBan` | Rút từ markdown của bản vừa duyệt, thay trọn trong cùng giao dịch; cho lượt 3 |

`migration` tạo extension `unaccent` và `pg_trgm` (`CREATE EXTENSION IF NOT EXISTS`); cột
`timKiem` ghi lúc duyệt bằng `to_tsvector('simple', unaccent(ten || ' ' || noiDung))`. Kiểm ở S2
rằng kho test và Neon tạo được hai extension. Duyệt chạy trong **một giao dịch**: kiểm lại so-
và-đặt, tạo phiên bản, đặt con trỏ, đánh dấu đề xuất `DA_DUYET`, đánh các đề xuất chờ khác cùng
bản gốc thành `CU`, ghi sự kiện, thay liên kết, cập nhật `timKiem`.

## 4. Trình soạn và diff

**Trình soạn** là thành phần mới `TrinhSoan` trong `packages/ui` trên Tiptap 3 (ProseMirror,
MIT). Tra theo bậc của `docs/design.md`: `packages/ui` không có trình soạn; shadcn gốc không có;
ReUI (bậc 3) chỉ có `kanban`, `stepper`, `tree` đã cài và không có thành phần soạn thảo trong
danh mục miễn phí — tra lại bằng câu tìm «editor» trên ReUI lúc dựng và ghi vào mô tả PR. Nên
đây là bậc 5: dựng mới trong `packages/ui`.

- Nút cho phép (tập con cố định): tiêu đề cấp 2 và 3, đoạn, đậm, nghiêng, danh sách có số và
  không số, bảng, liên kết. Không ảnh, không màu, không cỡ chữ, không wikilink, không callout.
- Thanh công cụ gắn trên đầu ô soạn, nút có `aria-label` và phím tắt quen (Ctrl/Cmd+B, I, Z,
  Shift+Z). Gõ «1. » hoặc «- » đầu dòng ra danh sách như Word.
- **Dán:** HTML từ Word và Google Docs được lọc về đúng tập nút cho phép; màu, font, style,
  lớp `Mso*`, thẻ `<o:p>` bị bỏ; tiêu đề giữ cấp (H1 của Word thành cấp 2 vì cấp 1 là tên trang).
- **Lưu:** một mô-đun duy nhất `packages/validation/src/tai-lieu-markdown.ts`, không phụ thuộc
  DOM hay React, giữ lược đồ bảy loại nút và cấu hình tuần tự hoá cố định (`@tiptap/core` và
  `@tiptap/markdown` chạy không đầu). Trình soạn trong `packages/ui` và máy chủ cùng gọi nó; máy
  chủ chạy lại chuẩn hoá khi nhận để nội dung người và nội dung máy soạn (lượt 2) cùng một dạng.
  Điểm bất động qua ranh client–máy chủ được đo: nội dung máy chủ đã lưu, nạp vào trình soạn rồi
  tuần tự hoá lại, phải y hệt từng byte (E10c).
- Mở rồi lưu không sửa → markdown y hệt từng byte; nút «Gửi duyệt» khoá với chữ «Chưa có thay
  đổi».
- Rời màn khi có thay đổi chưa gửi → hỏi lại bằng bộ giữ thay đổi có sẵn (`giu-thay-doi.tsx`).
- Bộ gõ tiếng Việt: Unikey/EVKey (Telex, VNI) và bộ gõ macOS đi qua `compositionstart/end`;
  ProseMirror xử lý composition, nhưng phải đo trên Chrome thật (AC-12).

**Diff** là thành phần mới `DiffTrang` trong `packages/ui`: hai bản markdown → hai cây
ProseMirror bằng cùng bộ phân tích → `prosemirror-changeset` (MIT) theo từ → hiện trong
`TrinhSoan` ở chế độ chỉ đọc, đoạn thêm bọc `<ins>`, đoạn bỏ bọc `<del>`, mỗi đoạn có chữ ẩn
«Thêm:» / «Bỏ:» cho trình đọc màn hình. Biến thể màu `ins`/`del` khai trong `packages/ui`, không
đặt ở chỗ gọi. Dải «Con số và ngày bị đổi» rút mọi số, phần trăm, ngày trong các đoạn thêm hoặc
bỏ. `diffHash` = SHA-256 của danh sách thay đổi đã chuẩn hoá (vị trí, loại, chữ), tính cùng một
hàm ở client và server (`packages/validation/src/tai-lieu-diff.ts`, không phụ thuộc DOM).

## 5. API và app

- Module `apps/api/src/tai-lieu`, router `taiLieu` với `PhamViChungMiddleware` (mọi vai đọc).
  Thủ tục: `list` (chỉ trang có bản đang dùng, cộng trang chưa duyệt mà người gọi thấy; lọc
  theo loại trang; `listInput` → `{ rows, total, facetCounts }`) · `get` (theo slug; bản đang dùng,
  có-bản-chờ-duyệt, quyền sửa) · `create` · `propose` · `proposals` (hàng chờ của tôi, số đếm) ·
  `proposal` (một bản, kèm bản gốc để dựng diff) · `approve` (`id`, `diffHash`) · `reject`
  (`id`, `lyDo`). Thêm router vào phạm vi chung là sửa có ý thức danh sách ghim trong
  `apps/api/test/vai-chi-okr.spec.ts`.
- Quyền là một hàm: `quyenDuyet(nguoi, trang)` và `thayDeXuat(nguoi, deXuat, trang)` trong
  `apps/api/src/tai-lieu/quyen.ts`; mọi thủ tục gọi chúng, không kiểm vai rải rác. Hằng số (độ dài
  tên 1–160, lý do 1–500, nội dung ≤ 200 000 ký tự, cỡ trang danh sách) trong
  `tai-lieu-config.ts`.
- App: route `/{workspace}/tai-lieu` (danh sách, tab «Chờ duyệt» qua tham số tìm kiếm),
  `/tai-lieu/moi`, `/tai-lieu/[slug]`, `/tai-lieu/[slug]/sua`, `/tai-lieu/de-xuat/[id]`. Trang
  server gọi tRPC và trao dữ liệu xong; thành phần client chỉ vẽ. Mục «Tài liệu» thêm vào thanh
  biểu tượng (`app-icon-rail.tsx`) và nav di động. Chữ trên màn qua `lib/messages`. Làm mới qua
  `useCrmCache()` với `cache.taiLieu()`.

## 6. Ngoài lượt này

Dời sang lượt 3 (van đã khai ở lộ trình): lịch sử phiên bản, khôi phục, lưu trữ trang, tìm
kiếm, ⌘K, backlink, chèn liên kết tới trang. Để sau: phó và thang leo, phạm vi xem theo trang,
bậc 2, nhắc, xuất, ảnh trong trang, hộp ghi chú. Mọi AI ở lượt 2 và 4.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: thanh biểu tượng «Tài liệu» → danh sách → «Trang mới» → gõ tên, chọn loại trang, gõ nội
  dung → «Gửi duyệt» → màn trang với thẻ «Đang chờ Nguyễn Thu Hà duyệt» → chủ trang mở tab «Chờ
  duyệt» → bản đề xuất với chữ thêm tô → «Duyệt» → trang hiện cho mọi người với «Phiên bản 1 ·
  duyệt 27/09/2026» (điểm ra: màn đọc trang).
- Sửa: màn đọc → «Sửa trang» → trình soạn mở sẵn bản đang dùng → sửa → «Gửi duyệt» → bản đang
  dùng giữ nguyên, thẻ «Có 1 bản chờ duyệt».
- Biên: kho rỗng; tab «Chờ duyệt» rỗng; người không duyệt được mở đường dẫn đề xuất; trang chưa
  duyệt với người ngoài (404); vai `okr`.
- Lỗi & quay lại: tên trống hoặc quá 160 ký tự → lỗi dưới ô, focus về ô; lưu mạng lỗi → thông
  báo giữ nguyên nội dung trong trình soạn; đề xuất cũ → thẻ vàng, nút Duyệt khoá, về trang;
  duyệt lệch hash (trang đổi trong lúc xem) → thông báo «Bản đề xuất vừa thay đổi, mở lại để xem
  bản mới» và tải lại; trả lại thiếu lý do → lỗi dưới ô.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh sách | Tìm đúng trang để đọc | thanh biểu tượng / màn đọc, trang mới |
| Chờ duyệt | Thấy bản nào đang chờ mình | tab trên danh sách / màn duyệt |
| Soạn (mới và sửa) | Viết rồi gửi duyệt | «Trang mới», «Sửa trang» / màn đọc |
| Đọc trang | Đọc bản đang dùng | danh sách, liên kết / soạn, duyệt |
| Duyệt | Quyết một bản đề xuất | chờ duyệt, thẻ trên màn đọc / màn đọc |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-danh-sach-dang-tai | Danh sách | Skeleton ô lọc và 6 dòng, `aria-busy` | Chờ |
| ST-danh-sach-rong | Danh sách | «Chưa có trang nào» · «Viết trang đầu tiên cho quy định, quy trình hay biểu mẫu của phòng mình.» · nút «Viết trang đầu tiên» | Viết trang |
| ST-danh-sach-co-trang | Danh sách | Bảng Trang · Loại · Chủ trang · Đơn vị · Cập nhật; lọc bốn loại trang có số; nhãn «Có bản chờ duyệt» | Mở một trang |
| ST-cho-duyet-rong | Chờ duyệt | «Không có bản nào chờ bạn duyệt.» | Về danh sách |
| ST-soan-moi | Soạn | Tên trang, Loại trang, Đơn vị (tuỳ chọn), Chủ trang (mặc định «Bạn»), thanh công cụ, ô soạn trống với gợi ý «Viết nội dung trang, hoặc dán từ Word.» | Gõ, dán, «Gửi duyệt» |
| ST-soan-chua-doi | Soạn | Nút «Gửi duyệt» khoá, chữ «Chưa có thay đổi» | Sửa hoặc «Huỷ» |
| ST-soan-dang-gui | Soạn | Nút «Đang gửi…» khoá | Chờ |
| ST-doc-cho-lan-dau | Đọc | Thẻ «Trang này chưa hiện cho mọi người. Đang chờ <chủ trang> duyệt.» | Chờ, hoặc duyệt nếu là chủ trang |
| ST-doc-dang-dung | Đọc | Nội dung, mục lục, «Phiên bản N · duyệt dd/mm/yyyy», chủ trang, «Sửa trang» | Đọc, sửa |
| ST-doc-co-ban-cho | Đọc | Như trên + nhãn «Có 1 bản chờ duyệt» và nút «Xem bản chờ duyệt» (chỉ người thấy đề xuất) | Mở màn duyệt |
| ST-duyet-thuong | Duyệt | Trang trình bày, chữ thêm tô, chữ bỏ gạch; dải «Con số và ngày bị đổi»; «Duyệt» (đầy), «Trả lại» | Duyệt hoặc trả lại |
| ST-duyet-cu | Duyệt | Thẻ «Bản đề xuất này đã cũ: trang đã được sửa sau khi nó được tạo.» Nút Duyệt khoá | Người tạo sửa lại trên bản mới |
| ST-duyet-khong-quyen | Duyệt | Trang 404 như slug không tồn tại | Về danh sách |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tên trang 1–160 ký tự, NFC, trống → «Nhập tên trang.»; lý do trả lại 1–500 ký tự.
- Ctrl/Cmd+B, I, Z, Shift+Z; Tab trong bảng sang ô kế; Esc không đóng màn soạn.
- «Gửi duyệt» bật cho tới khi gửi, rồi «Đang gửi…»; lỗi mạng → giữ nội dung, báo `aria-live`.
- Rời màn soạn có thay đổi → hỏi lại (bộ giữ thay đổi).
- Dữ liệu người nhập (tên trang, nội dung) mang `translate="no"`.
- Khổ 390: thanh công cụ cuộn ngang, danh sách thành thẻ, diff một cột.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| `TrinhSoan` | tạo (`packages/ui`) | Không bậc nào có trình soạn giàu; bậc 5 |
| `DiffTrang` | tạo (`packages/ui`) | Diff kết xuất kiểu Track Changes không có sẵn |
| `SimpleTable`, `Tabs`, `Badge`, `Empty`, `Alert`, `Field`, `Select`, `Textarea`, `Button`, `Skeleton` | dùng | Có sẵn, bản mẫu đã dùng |
| `MarkdownReader`, `ReaderToc` | dùng | Trình đọc có sẵn |
| Bộ giữ thay đổi `giu-thay-doi.tsx` | dùng | Hỏi lại khi rời màn soạn |
| `PageShellTitle` | dùng | Tiêu đề trang |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — danh sách trang dẫn vào màn đọc, hàng chờ dẫn vào màn duyệt;
cùng khuôn với OKR và danh bạ của kho, và với Notion, Confluence mà người dùng quen.
<!-- UX-SPEC-TEMPLATE>>> -->

## 7. Chuẩn giao diện

Nạp `web-design-guidelines` (`feature_loop.ui_standards_skill`) lúc S1: mọi ô có nhãn; nút
biểu tượng có `aria-label`; lỗi cạnh ô, focus ô lỗi đầu; «Gửi duyệt» bật tới khi gửi rồi hiện
«Đang gửi…»; chữ chờ kết thúc bằng «…»; cảnh báo khi rời màn có thay đổi; trạng thái rỗng có
đường đi tiếp; `aria-live="polite"` cho thông báo; không chặn dán; URL mang tab và bộ lọc.
