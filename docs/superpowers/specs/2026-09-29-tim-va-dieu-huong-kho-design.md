# Tìm và điều hướng kho tài liệu — lượt 3

Viết 2026-09-29. Lượt 3 của `docs/plan/lo-trinh-kho-tai-lieu.md`. Hồ sơ nghiệm thu:
`_acceptance/tim-va-dieu-huong-kho/`.

## Mục đích

Sau lượt này nhân viên nói được: «Tôi gõ ⌘K có dấu hay không dấu là ra trang; thấy trang
nào nhắc tới trang này; sáng ra biết có mấy bản chờ tôi duyệt.» Lượt 1 đã đặt sẵn cột
`timKiem` (ghi lúc duyệt) và bảng `taiLieuLienKet` (thay trọn lúc duyệt) để lượt này là T2.

Chủ kho chốt trong phiên 2026-09-29:
- Dòng nhắc sáng đếm **đúng số của tab «Chờ duyệt»** — quản trị thấy mọi bản chờ của kho.
- Nhận «chèn liên kết tới trang trong trình soạn» (dời từ lượt 1) vào lượt này.
- Duyệt thiết kế bản T2; tách lịch sử, khôi phục, lưu trữ sang lượt 3b là đề xuất của máy,
  chủ kho chọn ở Cổng Phạm vi.

## Vì sao tách 3b

`TaiLieuTrang` không có trạng thái lưu trữ. Lưu trữ qua duyệt cần một cột trên trang và
một loại đề xuất mới — chạm `packages/db/prisma`, tức T3 và thêm Cổng 1.5. Vế «trang lưu
trữ không ra kết quả» chỉ đo được khi lưu trữ tồn tại, nên đi cùng. Gộp cả hai thì lượt
thành 16–17 AC, vượt trần 15 của kit (lộ trình mục 2). Lượt 3b `lich-su-va-luu-tru-trang`
(T3): danh sách phiên bản, khôi phục là một đề xuất từ bản cũ, lưu trữ và bỏ lưu trữ qua
duyệt, trang lưu trữ biến khỏi danh sách mặc định, ⌘K, «Trang nhắc tới», Sức khoẻ; liên
kết tới trang lưu trữ thành «gãy».

## Kiến trúc

Không migration. Mọi thứ đọc từ bảng đã có.

### 1. Tìm — `taiLieu.tim`

Thủ tục mới trên router `taiLieu` (phạm vi chung, mọi vai kể cả `okr`).

- Vào: `{ q }`, cắt khoảng trắng, NFC, tối đa 200 ký tự. Dưới 2 ký tự chữ hay số thì trả
  rỗng, không chạm cơ sở dữ liệu.
- Dựng truy vấn ở mã: tách `q` thành các từ `[\p{L}\p{N}]+`, nối bằng ` & `, từ cuối thêm
  `:*` để gõ dở vẫn khớp; chuỗi chỉ gồm chữ, số và ba ký hiệu đó nên không cần thoát.
  Phía SQL: `"timKiem" @@ to_tsquery('simple', unaccent($1))`. `unaccent` chạy cùng hàm với
  lúc ghi cột (`to_tsvector('simple', unaccent(tên ‖ nội dung))`), nên «quy định», «quy
  dinh», «QUY ĐỊNH», «quy đ» khớp cùng một tập.
- Chỉ trang có `banDangDungId` và `timKiem` khác rỗng. Cột chỉ ghi lúc duyệt, nên trang
  chưa từng duyệt và chữ trong bản đề xuất không bao giờ ra — không cần nhánh quyền.
- Xếp: trúng tên trước (tên bỏ dấu chứa mọi từ, từ cuối theo tiền tố), rồi `ts_rank_cd`,
  rồi tên. Trần 20 dòng (`TAI_LIEU_API.tim.toiDa`).
- Đoạn trích: máy chủ lấy nội dung bản đang dùng của các dòng trúng, rút chữ thường bằng
  hàm `chuThuong` mới ở `packages/validation/src/tai-lieu-markdown.ts`, tìm từ khớp đầu
  tiên trên bản bỏ dấu và cắt khoảng 60 ký tự hai bên theo ranh giới từ. Bỏ dấu từng ký
  tự NFC tiếng Việt ra đúng một ký tự, nên vị trí trên bản bỏ dấu là vị trí trên chữ gốc
  — đoạn trích giữ dấu, phần khớp trả riêng để tô. Trúng tên mà không trúng nội dung thì
  đoạn trích là câu đầu.
- Ra: `{ rows: [{ slug, ten, loai, chuTrang, phienBan, doanTrich: { truoc, khop, sau } }] }`.

Đây cũng là nền của `search_pages` ở lượt 4.

### 2. ⌘K — nhóm «Tài liệu» trong `QuickSwitcher`

`apps/app/components/crm/quick-switcher.tsx` đang giữ ⌘K cho cả ứng dụng. Thêm một truy
vấn song song `taiLieu.tim` và một nhóm «Tài liệu» đứng sau ba nhóm đối tác: biểu tượng
trang, tên, dòng phụ là đoạn trích (phần khớp đậm). Chọn thì đi tới
`/<workspace>/tai-lieu/<slug>` và đóng hộp.

`search.quick` ở phạm vi đối tác trả `FORBIDDEN` cho vai `okr`: nhóm đối tác ẩn, nhóm «Tài
liệu» vẫn chạy, không thông báo lỗi. Nút «Tìm nhanh ⌘K» ở đầu màn Kho tài liệu mở cùng hộp
đó qua tham số `nuqs` sẵn có (`SEARCH_PARAM.dialog.switcher`). Không có bộ nghe ⌘K thứ hai.

### 3. Chèn liên kết tới trang

`TrinhSoan` (`packages/ui`) nhận prop tuỳ chọn `timTrang(q) → Promise<TrangGoiY[]>`. Có prop
thì thanh công cụ thêm nút «Liên kết tới trang»; bấm mở hộp chọn (`Command` trong
`Popover`), gõ để tìm, Enter chèn liên kết. Có chữ đang chọn thì bọc chữ đó; không thì
chèn tên trang. Đích là `/<workspace>/tai-lieu/<slug>` — dạng `slugTuDuongDan` đã nhận, nên
lúc duyệt bảng liên kết tự ghi. `packages/ui` không nhập tRPC: màn soạn trong `apps/app`
truyền hàm gọi `taiLieu.tim`.

### 4. «Trang nhắc tới trang này» — `taiLieu.nhacToi`

- Vào `{ slug }`. Trang đích phải thấy được với người gọi theo đúng luật `get` của lượt 1;
  không thì `NOT_FOUND` giống hệt `get`.
- Lấy các dòng `taiLieuLienKet` có `denSlug = slug`, trang nguồn khác trang đích và có bản
  đang dùng. Bảng liên kết chỉ ghi từ bản đã duyệt, nên liên kết trong bản đề xuất chưa
  duyệt không bao giờ tính.
- Câu ngữ cảnh tính lúc đọc: rút khối chứa liên kết (đoạn, mục danh sách, ô bảng, tiêu
  đề) từ nội dung bản đang dùng của trang nguồn bằng hàm `cauChuaLienKet` mới ở
  `tai-lieu-markdown.ts`, cắt khoảng 160 ký tự quanh chữ của liên kết. Lưu sẵn câu lúc
  duyệt sẽ cần thêm cột — T3, không đáng cho vài chục trang nguồn.
- Một trang nguồn nhắc nhiều lần thì một dòng, câu của lần đầu, kèm số lần. Xếp theo tên
  trang nguồn. Trần 100 dòng.

### 5. Lọc danh sách

`taiLieu.list` nhận thêm `donViId` và `chuTrangId` cạnh `loai`; ba lọc ghép bằng AND ở
Prisma. Số đếm theo loại tính trên tập đã lọc đơn vị và chủ, để số trên chip khớp cái
người thấy. Thủ tục mới `taiLieu.boLoc` trả đơn vị và chủ trang **có ít nhất một trang
người gọi thấy**, kèm số trang. Trạng thái lọc sống trên URL
(`tai-lieu-search-params.ts`, `nuqs`); đổi lọc về trang 1; nút «Bỏ lọc».

### 6. Tab «Sức khoẻ» — `taiLieu.sucKhoe`

Mọi vai xem được. Năm danh sách, mỗi dòng có tên trang (liên kết), chủ trang, chi tiết:

| Danh sách | Định nghĩa | Chi tiết |
| --- | --- | --- |
| Quá hạn xác minh | trang có bản đang dùng, `xacMinhDen` trước đầu ngày hôm nay giờ VN | ngày hết hạn |
| Có đề xuất chờ duyệt | trang có bản `CHO_DUYET` **người xem thấy được** (`dieuKienThayDeXuat`) | số bản |
| Liên kết gãy | theo trang nguồn có bản đang dùng: liên kết tới slug không có bản đang dùng | chữ của từng liên kết |
| Được nhắc mà chưa có trang | theo slug đích không có bản đang dùng | số trang nhắc, chữ liên kết đầu tiên |
| Mồ côi | trang có bản đang dùng mà không trang nào khác có bản đang dùng dẫn tới | ngày duyệt |

«Chưa có» nghĩa là **chưa có bản đang dùng**, như nhau với mọi người. Trang đang soạn lần
đầu (chưa duyệt) vì vậy hiện là «chưa có» với cả người tạo. Tên của nó chỉ hiện ở «Có đề
xuất chờ duyệt», và chỉ với người thấy bản chờ đó theo luật lượt 1 (người tạo, chủ trang,
quản trị) — đúng như tab «Chờ duyệt». Chữ trong thân bản chưa duyệt không vào đường nào. Mỗi danh sách trần 200 dòng, kèm tổng. Tính mỗi lần mở tab, không bộ
nhớ đệm: vài trăm trang và một bảng liên kết.

Lượt 3b nối thêm: liên kết tới trang lưu trữ thành «gãy», trang lưu trữ ra khỏi mọi danh
sách.

### 7. Nhắc sáng — dòng «N bản đề xuất chờ bạn duyệt»

- Luật «ai duyệt được bản nào» chuyển từ `apps/api/src/tai-lieu/quyen.ts` sang
  `packages/db/src/tai-lieu-quyen.ts`; `quyen.ts` gọi lại nó. Tab «Chờ duyệt» và dòng nhắc
  đếm bằng cùng một hàm `demChoDuyet`.
- `viecTaiLieuCanNhac(db, chon)` mới ở `packages/db/src/tai-lieu-nhac.ts`, gộp vào
  `viecCanNhac` như `viecAiCanNhac`: với mỗi thành viên, N = số bản `CHO_DUYET` người đó
  duyệt được ở trạng thái `CHO_DUYET` (không tính `TRA_LAI`, `CU`); N = 0 thì không có mục. Đếm theo trạng thái lúc chạy, không theo cửa sổ sự
  kiện — bản còn chờ thì sáng nào cũng nhắc.
- Loại mới `tai-lieu-cho-duyet` với khuôn `{ loai, so }` trong hợp `mucNhac`
  (`@crm/validation/nhac-ke-hoach`), `THU_TU_NHAC` đặt sau năm loại OKR, trước hai loại AI.
  `payload.daGui` giữ loại và số, không tên trang.
- `tin-nhac.ts`: nhóm «Kho tài liệu», một dòng «N bản đề xuất chờ bạn duyệt», đường mở
  `<APP_URL>/<slug>/tai-lieu?tab=cho-duyet` khi có `APP_URL`. Khuôn Zalo đánh số dòng như
  mọi dòng; «xong N» trỏ vào dòng này bị từ chối như dòng OKR.
- Thẻ «Việc của bạn» và Tổng quan đọc cùng `viecCanNhac` với cửa sổ `"truc-tiep"`, nên
  hiện dòng này với cùng số và cùng đích.

### 8. Hai hạn chế người dùng gặp trước

- **Dấu `|` trong ô bảng.** Bộ tuần tự hoá bảng không thoát `|`, nên lần nạp sau tách ô sai
  và mất dữ liệu (Ngoài-7 của lượt 1). Sửa trong `tai-lieu-markdown.ts`: chữ trong ô thoát
  `|` thành `\|` và `\` đứng trước `|` thành `\\`; bộ nạp đọc ngược lại. Khứ hồi hai lần
  y hệt từng byte; trình đọc và màn duyệt hiện đúng `|`. Dữ liệu đã mất trước bản sửa
  không khôi phục được.
- **Trần 25 dòng của danh sách đề xuất.** `taiLieu.proposals` nhận `{ nhom: "cho" | "da-xu-ly",
  page }`. Nhóm «cho» là trạng thái `CHO_DUYET` — đúng tập tab «Chờ duyệt» và dòng nhắc đếm;
  bản `CHO_DUYET` có bản gốc khác bản đang dùng vẫn ở đây với nhãn «cũ» như lượt 1. Nhóm
  «da-xu-ly» là `TRA_LAI` và `CU` (bản bị thay khi bản khác được duyệt). Mặc định «cho»,
  25 dòng một trang, trả tổng;
  bản chờ thứ 26 trở đi mở được qua trang 2. Tab «Chờ duyệt» dùng `TablePagination` sẵn có.

## Xử lý lỗi

- `taiLieu.tim` gặp lỗi mạng trong ⌘K: nhóm «Tài liệu» hiện «Không tìm được lúc này. Thử
  lại.»; nhóm đối tác không bị ảnh hưởng. Không nuốt lỗi thành «không có trang».
- `taiLieu.nhacToi`, `taiLieu.sucKhoe`, `taiLieu.boLoc` lỗi: khối đó hiện lỗi có nút «Thử
  lại» (`Alert` + `Button`), phần còn lại của màn vẫn dùng được — khác lượt 1 (Ngoài-9 nuốt
  lỗi thành số sai).
- Truy vấn chỉ gồm ký hiệu (`!!!`): dưới 2 ký tự chữ hay số → «Gõ ít nhất 2 chữ».
- Dòng nhắc: `viecTaiLieuCanNhac` ném thì `viecCanNhac` ném như nhánh OKR — nhịp nhắc hỏng
  hiện là hỏng, không gửi tin thiếu dòng.

## Kiểm

Test API chạy trên Postgres thật (`bun run test` tạo kho riêng mỗi lượt), vì `unaccent` và
`to_tsquery` là hành vi của Postgres, không giả được. Test agent cho dòng nhắc chạy với
`TZ=Asia/Ho_Chi_Minh`. Test DOM cho ⌘K, nút chèn liên kết, phân trang. Hai phép đo màn
(`ui-check`) chạy trong phiên đo riêng (`tien-de.mjs`), chụp 390 và 1440. Mỗi phép đo mới
có chiều đỏ trên cùng fixture theo `MEASURE-BIRTH-CLAUSE`.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (tìm): bất kỳ màn nào → ⌘K hoặc nút «Tìm nhanh ⌘K» ở Kho → gõ «quy dinh hoa hong» → nhóm «Tài liệu» có trang kèm đoạn trích → Enter (điểm ra: màn đọc trang đó).
- Suôn sẻ (điều hướng): màn đọc → khối «Trang nhắc tới trang này» → bấm một dòng (điểm ra: màn đọc trang nguồn).
- Suôn sẻ (chủ trang buổi sáng): tin Zalo/Slack «2 bản đề xuất chờ bạn duyệt» → bấm đường mở → tab «Chờ duyệt» (điểm ra: màn duyệt).
- Suôn sẻ (sức khoẻ): Kho → tab «Sức khoẻ» → «Được nhắc mà chưa có trang» → bấm một trang nhắc → sửa liên kết hay viết trang mới.
- Suôn sẻ (viết): màn soạn → chọn chữ → «Liên kết tới trang» → gõ tên → Enter → chữ thành liên kết.
- Biên: kho chưa có trang nào đã duyệt → ⌘K nhóm «Tài liệu» không hiện, Sức khoẻ mọi danh sách rỗng; vai `okr` mở ⌘K → chỉ nhóm «Tài liệu»; lọc ra rỗng.
- Lỗi & quay lại: tìm lỗi → dòng lỗi trong nhóm, gõ lại là thử lại; khối «Trang nhắc tới» hay Sức khoẻ lỗi → «Thử lại» tại khối.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp ⌘K | Đi tới một bản ghi hay một trang bằng tên hoặc chữ trong trang | mọi màn / màn đọc trang, bảng bản ghi |
| Danh sách Kho (tab «Trang») | Thu hẹp danh sách trang theo loại, đơn vị, chủ | thanh biểu tượng / màn đọc |
| Màn đọc — khối «Trang nhắc tới trang này» | Cho thấy trang nào dẫn tới đây và vì sao | màn đọc / màn đọc trang nguồn |
| Tab «Sức khoẻ» | Cho chủ trang thấy việc phải làm với kho | Kho / màn đọc, màn soạn |
| Tab «Chờ duyệt» | Mở được mọi bản chờ, kể cả sau dòng 25 | Kho, tin nhắc sáng / màn duyệt |
| Màn soạn — hộp «Liên kết tới trang» | Chèn liên kết tới một trang có sẵn không phải chép địa chỉ | thanh công cụ / màn soạn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tim-go-it | Hộp ⌘K | «Gõ ít nhất 2 chữ» | gõ tiếp |
| ST-tim-dang-tai | Hộp ⌘K | kết quả cũ giữ nguyên, không nhấp nháy | chờ |
| ST-tim-co-ket-qua | Hộp ⌘K | nhóm «Tài liệu»: tên trang + đoạn trích có phần khớp đậm | mũi tên, Enter |
| ST-tim-khong-khop | Hộp ⌘K | «Không có trang nào khớp.» | sửa chữ gõ |
| ST-tim-loi | Hộp ⌘K | «Không tìm được lúc này. Thử lại.» trong nhóm Tài liệu | gõ lại |
| ST-danh-sach-loc-rong | Danh sách Kho | «Không có trang nào khớp bộ lọc» + «Bỏ lọc» | bỏ lọc |
| ST-nhac-toi-co | Màn đọc | «Trang nhắc tới trang này (N)»: mỗi dòng tên trang nguồn + câu có chữ liên kết đậm | bấm dòng |
| ST-nhac-toi-rong | Màn đọc | «Chưa trang nào nhắc tới trang này.» | — |
| ST-nhac-toi-loi | Màn đọc | Alert «Không tải được các trang nhắc tới trang này.» + «Thử lại» | thử lại |
| ST-suc-khoe-co-viec | Tab Sức khoẻ | năm khối, mỗi khối tiêu đề + số + các dòng trang, chủ, chi tiết | bấm trang |
| ST-suc-khoe-sach | Tab Sức khoẻ | khối rỗng ghi «Không có trang nào.» | — |
| ST-suc-khoe-loi | Tab Sức khoẻ | Alert «Không tải được sức khoẻ kho.» + «Thử lại» | thử lại |
| ST-cho-duyet-trang-2 | Tab Chờ duyệt | phân trang dưới bảng, «Trang 2 / 3» | bấm trang |
| ST-lien-ket-chon | Màn soạn | hộp chọn có ô tìm và danh sách trang | Enter chèn, Esc đóng |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô tìm: tối thiểu 2 chữ hay số, tối đa 200 ký tự, gõ không dấu hay có dấu như nhau; giữ kết quả trước trong lúc chờ (`placeholderData`).
- ⌘K / Ctrl+K bật tắt hộp ở mọi màn; mũi tên chọn, Enter mở, Esc đóng — theo `Command` sẵn có.
- Hộp chèn liên kết: Esc đóng và trả focus về trình soạn; có chữ đang chọn thì bọc chữ đó.
- Lọc danh sách: đổi lọc về trang 1; lọc nằm trên URL nên gửi đường dẫn cho người khác giữ nguyên lọc.
- Khối «Trang nhắc tới» nằm dưới nội dung trang ở mọi khổ (cột phải hẹp quá cho câu ngữ cảnh). Khổ 390: bộ lọc xếp dọc, Sức khoẻ một cột, không cuộn ngang.
- Tên trang và câu trích là dữ liệu người nhập: `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `CommandDialog`, `Command*` (`packages/ui/command.tsx`) | dùng | ⌘K đã dựng trên nó; nhóm mới chỉ là thêm `CommandGroup` |
| `TrinhSoanThanhCongCu` | mở rộng | thêm nút «Liên kết tới trang» khi có prop `timTrang` |
| `Popover` + `Command` | ghép | hộp chọn trang trong trình soạn |
| `Item` | dùng | dòng của «Trang nhắc tới» và của năm danh sách Sức khoẻ (`docs/design.md`: không `ul divide-y` tự dựng) |
| `Card`, `CardTitle` | dùng | khung từng khối Sức khoẻ |
| `Select`, `Combobox` | dùng | lọc loại, đơn vị, chủ |
| `TablePagination` | dùng | phân trang tab Chờ duyệt |
| `Alert` + `Button` | ghép | lỗi có «Thử lại» tại từng khối |
| `Empty` | dùng | rỗng |
| `Badge` | dùng | số của từng khối Sức khoẻ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: nối tiếp khuôn của lượt 1 (danh sách trang → màn đọc); lượt này thêm cửa vào (⌘K, backlink, Sức khoẻ, nhắc sáng) chứ không thêm màn trung tâm. Luồng hiển nhiên, không tra mẫu ngoài; thứ tự điều hướng lấy từ nghiên cứu mục 5.1 (⌘K → backlink có ngữ cảnh → danh sách theo thuộc tính → báo cáo kiểu «special pages» của MediaWiki).
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài lượt

Lượt 3b: lịch sử, khôi phục, lưu trữ. Để sau: gõ sai và biến thể i/y bằng `pg_trgm` (cần chỉ
mục, T3; mở khi chạy thật cho thấy cần), danh sách «cụt» của bản mẫu, đồ thị cục bộ và toàn
kho, xem trước khi rê chuột, đo lượt tìm và lượt mở ⌘K (lộ trình chốt bốn số đếm từ bảng,
không telemetry), sắp xếp `COLLATE "vi-x-icu"`, lọc Sức khoẻ theo chủ, tìm trong tệp nguồn.
Không làm: vector, `pg_search` (Neon gỡ 2026-09-21), lọc phía trình duyệt.
