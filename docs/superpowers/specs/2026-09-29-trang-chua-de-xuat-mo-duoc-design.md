# Trang chưa có đề xuất mở được — thiết kế

Ngày: 2026-09-29 · Hồ sơ: `_acceptance/trang-chua-de-xuat-mo-duoc/` · Hạng T2

## Sự việc

2026-09-29, production: chủ kho (vai `owner`) mở Kho tài liệu, thấy dòng «Chính sách nhân viên ·
Quy định · Phan Le Manh · — · 28/09/2026», bấm vào thì gặp trang 404 tiếng Anh mặc định của Next.
Log `crm-onehub-api` cho thấy `taiLieu.get` và `taiLieu.nhacToi` trả `NOT_FOUND` với vai `owner`.

## Gốc

Hai luật «ai thấy trang» sống ở hai chỗ:

- Danh sách (`list`, `boLoc`, `sucKhoe`, `dangDung`, `propose`) lọc bằng `dieuKienThay` ở
  `packages/db/src/tai-lieu-quyen.ts`: quản trị thấy mọi trang; người khác thấy trang có bản đang
  dùng, trang mình làm chủ, hoặc trang mình có bản đề xuất.
- Màn đọc (`get`) và `nhacToi` dùng `thayTrang` ở `apps/api/src/tai-lieu/quyen.ts`: có bản đang
  dùng, hoặc có một bản đề xuất mà người gọi thấy. Trang không có bản đề xuất nào thì `false` với
  mọi người, kể cả `owner`, `admin`, chủ trang.

Trang không có bản đề xuất sinh ra từ «Tải nguồn lên» cho trang mới: `TaiLieuNguonService` tạo dòng
`taiLieuTrang` ngay khi nhận nguồn; bản đề xuất do máy soạn nộp sau. Máy soạn chưa xong, lỗi, hay
nguồn «Cần gõ tay» → trang không có bản đề xuất.

Đọc mã lộ thêm hai biểu hiện cùng gốc:

1. Người tải nguồn cho trang mới mà chọn người khác làm chủ trang thấy dòng nguồn ở tab Nguồn (luật
   nguồn có `taiBoiId`), dòng đó dẫn sang trang — trang 404 với họ cho tới khi máy soạn xong (bản máy
   soạn mang `taoBoiId` = người tải, lúc đó họ mới thấy).
2. Trang có bản đầu bị trả lại: màn vẫn báo «Đang chờ {chủ trang} duyệt» dù không còn bản chờ; nút
   «Sửa trang» ẩn, và `/sua` tự chuyển về màn đọc khi trang chưa có bản — dù `taiLieu.propose` vốn
   nhận bản đề xuất cho trang chưa có bản.

## Quyết định

**Một luật, không có bản thứ hai.** `get` và `nhacToi` đọc trang bằng
`findFirst({ where: { AND: [{ slug }, dieuKienThay(nguoi)] } })`, như `propose` đã làm. Hàm
`thayTrang` bị xoá. Không có kiểm tra thấy-trang nào trong bộ nhớ ở `apps/api` — không có gì để
lệch. (Cách giữ một bản kiểm trong bộ nhớ cạnh `dieuKienThay` bị loại: vẫn là hai định nghĩa, cần
một phép đo giữ chúng khớp.)

**Người tạo trang thấy trang của mình.** `dieuKienThay` thêm vế `{ taoBoiId: nguoi.id }` trên trang.
Trang do «Tải nguồn lên» tạo có `taoBoiId` = người tải, nên người tải thấy trang đích ngay từ lúc tải,
không chờ máy soạn. Đây đúng là chữ «người tạo» mà hợp đồng lượt 1 (`kho-tai-lieu` AC-3) đã hứa;
vế cũ `deXuat.some(taoBoiId)` vẫn giữ cho người sửa (bản đề xuất của họ). Tải nguồn «cập nhật» chỉ
nhận trang đã có bản đang dùng, nên không có ca người tải cập nhật không thấy trang.

**Không thấy = không tồn tại.** Người không được thấy nhận `NOT_FOUND` với cùng thông điệp
`TAI_LIEU_API.thongDiep.khongCo` như slug không có.

**Màn đọc nói đang chờ gì.** `taiLieu.get` của trang chưa có bản đang dùng trả
`choLanDau: { chuTrang, dangCho, nguon }`, `dangCho` tính ở API theo thứ tự:

1. còn bản `CHO_DUYET` trên trang → `duyet`;
2. nguồn mới nhất của trang (theo `taiLuc`) ở `CHO_DOC`/`CHO_SOAN`/`DANG_SOAN` → `may-soan`;
   `CAN_GO_TAY` → `go-tay`; `LOI` → `loi` (kèm `lyDo`);
3. có bản `TRA_LAI` → `tra-lai`;
4. còn lại → `chua-co-ban`.

`dangCho` tính trên nguồn mới nhất của trang, bất kể người xem. `nguon` = `{ id, tenTep, lyDo }` của
nguồn mới nhất khi người xem thấy nguồn đó theo `dieuKienThayNguon`, ngược lại `null` và màn không có
«Xem nguồn» — nút «Xem nguồn» không bao giờ dẫn tới dòng mà tab Nguồn giấu. (Với trang chưa có bản,
người thấy trang là quản trị, chủ trang, người tạo = người tải, nên thực tế luôn thấy; phép đo quan hệ
ở E2 giữ điều đó.) Nguồn đã soạn xong (`DA_SOAN`) không phải dấu hiệu chờ: rơi xuống bước 3–4.

**Viết tay trên trang chưa có bản.** `/sua` của trang chưa có bản mở trình soạn với nội dung gốc
rỗng (không chuyển về màn đọc nữa). Gửi → `taiLieu.propose` tạo bản đề xuất `banGocId` null, trang
sang `dangCho: duyet`.

**Tìm và ⌘K không đổi.** `taiLieu.tim` chỉ trả trang có bản đang dùng, mà mọi người thấy trang đó;
⌘K đọc `tim`. Phép đo quan hệ vẫn kéo kết quả `tim` vào để khẳng định điều này. `boLoc`, `sucKhoe`,
`dangDung` đã dùng `dieuKienThay`, nên vế người tạo đi vào chúng theo cùng một hàm.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Danh sách Kho (tab Trang) → bấm dòng trang chưa có bản → màn đọc có khung «đang chờ gì» → «Xem nguồn» (tab Nguồn, cuộn tới dòng nguồn) hoặc «Viết tay» (trình soạn trống) → gửi duyệt → màn đọc báo «Đang chờ {chủ trang} duyệt».
- Biên: trang chưa có bản mà người xem không phải quản trị, chủ trang, người tạo hay người có bản đề xuất → không thấy dòng ở danh sách, mở thẳng đường dẫn nhận trang không tồn tại.
- Lỗi & quay lại: máy soạn hỏng → khung nói «Máy chưa soạn được» kèm lý do → «Xem nguồn» (nút «Soạn lại» sống ở tab Nguồn) hoặc «Viết tay»; «Về danh sách» ở đầu màn như cũ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Màn đọc trang (`/tai-lieu/<trang>`) | Cho biết trang đang chờ gì và bước kế | Danh sách, tab Nguồn, ⌘K / tab Nguồn, `/sua` |
| Màn sửa (`/tai-lieu/<trang>/sua`) | Viết bản đầu cho trang chưa có bản | Nút «Viết tay» / màn đọc sau khi gửi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-doc-cho-duyet | Màn đọc | Khung «Trang này chưa hiện cho mọi người.» · «Đang chờ {chủ trang} duyệt.» (lời cũ), huy hiệu «N bản chờ duyệt», nút «Xem bản chờ» | Chờ; người duyệt được bấm «Xem bản chờ» |
| ST-doc-may-soan | Màn đọc | Khung «Máy đang soạn bản đầu.» · «Từ nguồn {tên tệp}. Bản soạn xong sẽ chờ {chủ trang} duyệt.» | «Xem nguồn» |
| ST-doc-go-tay | Màn đọc | Khung «Cần gõ tay.» · «Nguồn {tên tệp} là bản quét, máy không đọc được chữ. Gõ nội dung vào trang để gửi duyệt.» | «Viết tay», «Xem nguồn» |
| ST-doc-loi | Màn đọc | Khung «Máy chưa soạn được.» · «Nguồn {tên tệp}: {lý do}» | «Xem nguồn» (soạn lại ở đó), «Viết tay» |
| ST-doc-tra-lai | Màn đọc | Khung «Bản đầu đã bị trả lại.» · «Viết bản mới để gửi {chủ trang} duyệt.» | «Viết tay» |
| ST-doc-chua-co-ban | Màn đọc | Khung «Trang chưa có bản nào.» · «Viết bản đầu để gửi {chủ trang} duyệt.» | «Viết tay» |
| ST-sua-trong | Màn sửa | Trình soạn trống, tên trang sẵn | Gõ, «Gửi duyệt» |
<!-- UX-STATE-TABLE>>> -->

Chữ trên khung là bản nháp — câu chốt nằm ở `apps/app/lib/messages/tai-lieu.ts` (vi + en), theo
`CONTEXT.md`: «Nguồn», «Máy soạn» (trên màn: «Máy đang soạn»), «Cần gõ tay», «Chủ trang», «Bản đề
xuất». Tên chủ trang và tên tệp là dữ liệu người nhập: `translate="no"`.

### 4. Hành vi

- Khung là `role="status"` như khung «chờ lần đầu» hiện có; không tự làm mới khi máy soạn xong (tải lại trang mới thấy — Out of scope).
- «Xem nguồn» là liên kết tới tab Nguồn kèm neo `nguon-<id>` (`neoNguon`), «Viết tay» là liên kết tới `/sua` — đều là `<Link>` (điều hướng, không phải hành động).
- Khổ 390: hai nút xuống dòng trong hàng `flex-wrap` sẵn có, không cuộn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Alert` + `AlertTitle` + `AlertDescription` (`@crm/ui`) | dùng | Chính khung «chờ lần đầu» đang dùng trên màn này |
| `Button asChild` + `Link` | dùng | Cùng cách các nút «Sửa trang», «Xem bản chờ» đang làm |
| `ManSoan` | dùng | Trình soạn sẵn có, nhận `banGoc` rỗng |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: màn đọc là trang chi tiết của danh sách Kho đã có; việc này chỉ thêm trạng thái cho trang chi tiết, không đổi khuôn — luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

Chuẩn giao diện đã nạp làm đối trọng: skill kho `web-design-guidelines` (Vercel Web Interface
Guidelines) — `<Link>` cho điều hướng, lời lỗi kèm bước kế, nhãn nút cụ thể, `…` không `...`.

## Cách đo

- **Ma trận viết trước** (`apps/api/test/tai-lieu-thay-trang.spec.ts`): sáu người của `tai-lieu-san`
  (`tao` = người tạo/người tải, `chu`, `owner`, `admin`, `khac`, `okr`) × sáu trạng thái trang (đã
  duyệt · chờ duyệt lần đầu · máy đang soạn · cần gõ tay · lỗi soạn · bị trả lại lần đầu). Bảng «ai
  thấy» viết trước, một khẳng định cho mỗi ô. Trang «máy đang soạn / cần gõ tay / lỗi soạn» gieo qua
  đường thật `taiLieuNguon.nhan` (người tải `tao`, chủ trang `chu`) rồi đặt trạng thái nguồn như máy
  soạn đặt.
- **Quan hệ**: với mỗi người, tập slug `list` trả (trong các trang thử) = tập slug `get` mở được =
  tập slug `nhacToi` không `NOT_FOUND`; mọi dòng `taiLieuNguon.list` và mọi kết quả `taiLieu.tim`
  đều mở được bằng `get` của chính người đó.
- **Không thấy = không tồn tại**: `get`/`nhacToi` với trang không được thấy trả cùng mã và thông điệp
  như slug không có.
- **Chiều đỏ**: bản sao dựng lại `thayTrang` cũ trong `get` → phép đo đỏ với thông điệp ghim
  `lech list/get: <người> <trạng thái>`.
- **Màn**: test DOM của `ManDoc` cho sáu `dangCho`; đo màn trong phiên đo (`do:man`): `owner` bấm dòng
  trang máy đang soạn từ danh sách → màn đọc mở, có khung «Máy đang soạn…»; trang cần gõ tay →
  «Viết tay» → trình soạn trống.

## Ngoài phạm vi

- Trang 404 mặc định tiếng Anh của Next — việc riêng (một `not-found.tsx` tiếng Việt cho vùng app).
- Tự làm mới màn đọc khi máy soạn xong.
- Đổi luật thấy bản đề xuất (`dieuKienThayDeXuat`) hay luật thấy nguồn (`dieuKienThayNguon`).
