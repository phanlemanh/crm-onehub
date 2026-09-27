# Máy soạn bản đề xuất — thiết kế lượt 2 Kho tài liệu

Viết 2026-09-28. Hồ sơ `_acceptance/may-soan-de-xuat/`. Lượt 2 của
`docs/plan/lo-trinh-kho-tai-lieu.md` (mục 4 «Lượt 2»). Nền là lượt 1 `kho-tai-lieu`
(PR #180, đã ký Cổng Bằng chứng 28/09, chưa lên `onehub`).

## 1. Người dùng nói được gì sau lượt này

«Tôi tải tệp quy định đang có lên, máy soạn thành trang, tôi sửa và duyệt.»

Người tải là nhân viên phòng ban (quen Word, có sẵn tệp `.docx` hay PDF). Người duyệt
là chủ trang, hoặc quản trị duyệt thay. Máy chỉ soạn **bản đề xuất**; bản đề xuất chỉ
thành **bản đang dùng** qua đúng nút «Duyệt» của lượt 1.

## 2. Đã có sẵn và đã chốt

- Lượt 1: `TaiLieuTrang`, `TaiLieuPhienBan`, `TaiLieuDeXuat`, `TaiLieuSuKien`,
  `TaiLieuLienKet` (`packages/db/prisma/schema.prisma`), router `taiLieu` ở phạm vi chung
  (`apps/api/src/tai-lieu/`), màn duyệt Track Changes, dải «Con số và ngày bị đổi»,
  luật ai thấy đề xuất (người tạo và người duyệt được) và ai duyệt được (chủ trang,
  `owner`, `admin`).
- `TaiLieuDeXuat.taoBoiId` bắt buộc là một `User`; lượt 1 không có chỗ ghi «máy soạn».
- `@crm/db/blob` chỉ ghi blob `public` (logo, ảnh); `blobEnabled()` đọc
  `BLOB_READ_WRITE_TOKEN`. `@vercel/blob` 2.6.1 có blob `private` và `presignUrl`.
- `apps/agent`: loại việc khai ở `packages/db/src/agent-tasks.ts` (`TASK_KINDS`,
  `DIRECT_KINDS`); loại trực tiếp rẽ nhánh ở `lib/dispatch.ts` (vd `okr-doc-sheet` →
  `chayDocSheet`); `agent-event` dựng phiên cho `subagent` `agent_runner`.
- `docs/agent.md` «Khi nào thêm mã, tool, skill, subagent»: việc tính được là mã;
  ranh giới khác là `subagent` khác; quyền nằm ở `tool`; mỗi `subagent` mới có sổ chi phí.
- Không có thư viện đọc docx hay PDF nào trong kho; không có đường tải tệp lên nào.
- Chốt 2026-09-27 (Manh Phan): tệp nguồn ở Vercel Blob; duyệt mọi thay đổi.

## 3. Hướng đã chọn

### 3.1 Tải lên: thẳng vào Blob private, băm ở máy chủ

Ba hướng đã xét:

| Hướng | Được | Mất |
| --- | --- | --- |
| **A. Trình duyệt PUT thẳng vào Blob private qua URL ký, rồi gọi `taiLieu.nguon.nhan`** (chọn) | Không đụng trần 4,5 MB thân yêu cầu của hàm Vercel; tệp tới 20 MB; API vẫn tự đọc byte để băm | Hai bước, cần dọn blob mồ côi khi bước hai bị từ chối |
| B. Gửi tệp qua API (multipart) | Một bước, đơn giản | Trần 4,5 MB; mở một đường REST nhận tệp, trái «tRPC là mặt dữ liệu» |
| C. `handleUpload` với callback | Mẫu có sẵn của Vercel | Callback cần URL công khai, không chạy ở máy dev; tin kết quả do Blob gọi về |

Luồng A: `taiLieu.nguon.xinCho({ tenTep, kichThuoc, kieu })` → API kiểm cỡ và đuôi, trả
URL PUT ký ngắn hạn cho một `pathname` do máy chủ đặt (`kho-tai-lieu/nguon/<uuid>`) ·
trình duyệt PUT byte · `taiLieu.nguon.nhan({ pathname, dich })` → API `get` blob
private, **tự tính `sha256` từ byte đã lưu**, kiểm chữ ký tệp (`%PDF-` hay zip có
`word/document.xml`), rồi trong một lần ghi: tạo `TaiLieuNguon`, tạo trang đích nếu là
trang mới, ghi một `AgentTask` loại `soan-tu-nguon`. Hash trùng một nguồn đã có → xoá
blob vừa tải, trả nguồn cũ, không ghi việc mới.

Tải về: `taiLieu.nguon.taiVe({ id })` trả URL GET ký sống 5 phút sau khi kiểm quyền. Blob
không bao giờ `public`; hàng không lưu URL công khai nào.

### 3.2 Đọc chữ là mã, ở `apps/agent`

Loại việc `soan-tu-nguon` là **loại trực tiếp** (như `okr-doc-sheet`). Trình xử lý:

1. Tải byte từ Blob, băm lại, so với `sha256` của hàng (lệch → lỗi, không soạn).
2. Đọc chữ: docx bằng thư viện đọc OOXML; PDF bằng thư viện đọc lớp chữ. Thư viện
   chọn ở S2 (giấy phép MIT/BSD, không AGPL — `kho-tai-lieu-nghien-cuu.md` mục 6.6).
3. **Thử độ tin lớp chữ theo trang** (nghiên cứu 6.6): trang không có chữ, hoặc có
   U+FFFD, mã private-use, `(cid:` vượt ngưỡng → nguồn thành **«cần gõ tay»**, không
   soạn. Ngưỡng là hằng trong tệp cấu hình của khu (luật «Constants belong in one file»).
4. Chuẩn NFC, ghi chữ đã đọc vào `TaiLieuNguon.chu` (để màn duyệt hiện nguồn cạnh nhau và
   để kiểm trích dẫn), ghi số trang, số ký tự.
5. Chữ dài quá trần một lần soạn → «Nguồn quá dài để máy soạn một lần», không soạn.

### 3.3 Soạn là một `subagent` riêng

Ranh giới của máy soạn khác agent gốc ở ba chỗ: đọc tài liệu không tin cậy, tiền đi theo
khoá AI Gateway thứ hai, không được ra mạng. Theo luật 2 của `docs/agent.md` nó là
`subagent` `may_soan`:

- Model: một `LanguageModel` dựng bằng `createGateway({ apiKey })` với
  `KHO_TAI_LIEU_AI_GATEWAY_API_KEY` khi có; vắng thì đường Gateway chung của agent. Mã
  model là hằng trong cấu hình của khu, không đọc `AppSetting` (luật 2).
- `tool` duy nhất: `nop_ban_de_xuat`. Mọi `tool` dựng sẵn tắt, sandbox `deny-all`, không
  `web_fetch`, không `web_search`.
- Đầu vào của phiên: chữ nguồn bọc như **dữ liệu** (có dấu phân cách, không phải chỉ
  thị), trang «Quy tắc viết» (bản đang dùng) làm lời dặn, và với trang có sẵn thì bản
  đang dùng của trang đó.
- Đầu ra qua `nop_ban_de_xuat({ ten, noiDung, trichDoan: [{ menhDe, trich }] })`. Khuôn
  phẳng, không đệ quy (luật 6; `test/khuon-di-dong.spec.ts` tự quét).

`nop_ban_de_xuat` là nơi mã kiểm trước khi ghi (luật 1 và 4):

1. `noiDung` chuẩn hoá qua bộ tuần tự hoá markdown của lượt 1 (khứ hồi ổn định), NFC.
2. Mỗi `trich` phải là chuỗi con của `TaiLieuNguon.chu` sau `quote_key` (NFC, quy đổi vị
   trí dấu thanh `hoà`/`hóa`, bỏ NBSP và ký tự rộng bằng không, gộp khoảng trắng, thống
   nhất nháy và gạch — nghiên cứu 6.7).
3. **Mỗi con số mới** trong `noiDung` — số, phần trăm, ngày, số tiền; rút từ nút chữ của cây
   markdown, không tính số thứ tự danh sách — phải nằm trong ít nhất một `trich`. «Mới» là
   không có trong bản gốc (trang mới: mọi số đều mới). So khớp **con số trọn vẹn có biên**,
   không so chuỗi con: «20%» không được nhận nhờ «2026», «2%» không nhờ «12%».
4. Trượt bất kỳ → `tool` trả lỗi nêu đích danh số hay đoạn trượt; model được sửa trong
   trần bước của `subagent`. Hết trần mà vẫn trượt → không đề xuất nào được ghi, nguồn
   thành «Máy chưa soạn được» kèm lý do.
5. Đạt → gọi **hàm tạo đề xuất dùng chung** (`packages/db`) — cùng hàm mà
   `TaiLieuService.propose/create` gọi, để NFC, bản gốc, sự kiện `DE_XUAT` chỉ có một đường
   ghi — với `taoBoiId` là người tải, `nguonId`, `trichDoan`.

Máy soạn không có đường nào tới `TaiLieuPhienBan` hay `banDangDungId`.

### 3.4 Ghi lại gì

Bảng mới `TaiLieuNguon`: `id`, `sha256` (duy nhất), `tenTep`, `kieu` (`docx` | `pdf`),
`kichThuoc`, `blobPathname`, `taiBoiId`, `taiLuc`, `trangId` (trang đích), `trangThai`
(`CHO_DOC` · `DANG_SOAN` · `DA_SOAN` · `CAN_GO_TAY` · `LOI`), `lyDo`, `chu`, `soTrang`.
Không cột nào sửa được sau khi đọc chữ xong, trừ `trangThai`/`lyDo` của lượt soạn.

Cột mới trên `TaiLieuDeXuat` (thêm, không sửa cột cũ): `nguonId` (khoá ngoại, rỗng với
đề xuất do người viết), `trichDoan` (`Json`, parse bằng Zod ở
`packages/validation/src/tai-lieu-trich-doan.ts` — luật «Parse at the boundary»).

Sổ chi phí (luật 8): mỗi lượt soạn ghi một `TaiLieuSuKien` loại `MAY_SOAN` với mã model,
nhãn khoá (`rieng` | `chung`), token vào, token ra, chi phí USD tính từ bảng giá ghim theo mã
model trong cấu hình của khu (mã chưa có giá → `null` và ghi «chưa có giá»), số lần
`nop_ban_de_xuat` bị bác.

`migration` chỉ thêm: một bảng, hai cột rỗng được, chỉ mục, khoá ngoại.

### 3.5 Ai thấy gì

Đi theo luật lượt 1, không dựng cơ chế quyền thứ hai:

- Bản đề xuất máy soạn: người tải (là `taoBoiId`) và người duyệt được của trang thấy;
  người khác `NOT_FOUND` như id không tồn tại.
- Nguồn: người tải và người duyệt được của trang đích thấy và tải về; khi một **bản đang
  dùng** trích nguồn đó (phiên bản sinh từ đề xuất có `nguonId`), mọi thành viên thấy và
  tải về từ màn đọc trang.
- Tải lên: mọi thành viên (như tạo trang ở lượt 1, kể cả vai `okr`).
- «Sửa bản này» trên một bản máy soạn: bản đề xuất mới của người duyệt **giữ `nguonId` và
  `trichDoan`** của bản máy, để phiên bản sinh ra vẫn truy được về nguồn (và thành viên vẫn
  tải về được).

### 3.6 Khi thiếu thứ gì

| Thiếu | Hệ quả | Không bao giờ |
| --- | --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Nút «Tải nguồn lên» hiện câu «Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình», thủ tục nạp trả `PRECONDITION_FAILED` có thông điệp; mọi thứ lượt 1 chạy như cũ | Lỗi 500, ném lỗi lúc khởi động |
| `KHO_TAI_LIEU_AI_GATEWAY_API_KEY` | Máy soạn dùng đường Gateway chung; sự kiện `MAY_SOAN` ghi nhãn `chung` | Tắt máy soạn |
| Trang «Quy tắc viết» chưa có bản đang dùng | Nguồn lưu được, không soạn; lý do «Chưa có trang Quy tắc viết đã duyệt» | Soạn không lời dặn |
| Model lỗi, hết giờ, trả rỗng, sai khuôn, trượt kiểm số | Không đề xuất nào; nguồn «Máy chưa soạn được» kèm lý do; nút «Soạn lại» ghi một việc mới | Một bản đề xuất rỗng hay nửa vời |

Trang «Quy tắc viết» nhận ra bằng slug cố định `quy-tac-viet` (hằng trong cấu hình).
**Nội dung trang do chủ kho viết** — tiền đề của S3, không phải việc của máy.

## 4. Không làm ở lượt này

- OCR bản quét (nguồn «cần gõ tay» dừng ở cờ).
- Thẻ mâu thuẫn giữa trang, sổ khẳng định đầy đủ, kiểm độ phủ nguồn (nghiên cứu 6.3–6.4).
- Phân lớp dữ liệu (công khai, nội bộ, dữ liệu cá nhân, nhạy cảm) và ô che dữ liệu cá nhân.
- Máy tự tìm trang liên quan cho một nguồn; người tải chọn đích (trang mới hay một trang
  đang dùng).
- Vá theo mục, khoá phần người viết; đề xuất máy là cả trang so với bản gốc, người duyệt
  đọc diff Track Changes của lượt 1.
- `.doc`, `.xlsx`, ảnh, chữ TCVN3/VNI (đọc được thì đọc, không chuyển mã).
- Xoá nguồn, bia mộ, cờ giữ pháp lý.
- Bậc 2 (người kiểm thứ hai) và giảm tốc nạp theo hàng đợi duyệt.

## 5. Rủi ro

| Rủi ro | Giảm |
| --- | --- |
| Tiêm lệnh qua nội dung tệp | Máy soạn không có mạng, một `tool` duy nhất, chữ nguồn bọc là dữ liệu; mọi thứ nó ghi đi qua duyệt |
| Model bịa số | Kiểm số và trích dẫn là mã, chạy trước khi người thấy |
| Trích đúng chữ nhưng sai nghĩa | Không máy nào bắt được (nghiên cứu 6.3). Màn duyệt bắt đọc nguồn trước; câu hỏi judgment ở S4 |
| Tiền AI | Khoá thứ hai có trần tháng ở Gateway; sổ `MAY_SOAN` đếm token mỗi lượt |
| Neon | Không nhịp mới; soạn chạy trên nhịp điều phối có sẵn; tệp ở Blob, chỉ chữ đã đọc vào Postgres |

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Tài liệu → «Tải nguồn lên» → chọn tệp, chọn đích (trang mới: tên, loại, chủ
  trang, đơn vị · hoặc cập nhật một trang đang dùng) → «Tải lên» → tab «Nguồn» thấy hàng
  «Máy đang soạn» → khi xong, hàng thành «Đã soạn · Xem bản đề xuất» → chủ trang mở màn
  duyệt, đọc «Nguồn nói gì», bấm «Đã đọc nguồn, xem bản máy soạn», đối chiếu từng số, sửa
  nếu cần (nút «Sửa bản này» mở trình soạn lượt 1), Duyệt hoặc Trả lại (điểm ra: màn đọc
  trang, mục «Nguồn» có nút tải về).
- Biên: tệp đã tải trước đó → «Nguồn này đã có» kèm liên kết tới nguồn cũ · bản quét →
  hàng «Cần gõ tay» · chưa có trang Quy tắc viết → hàng «Chưa soạn được» với lý do ·
  chưa bật lưu tệp → nút tải khoá có câu giải thích.
- Lỗi & quay lại: sai loại hay quá 20 MB → câu lỗi dưới ô chọn tệp, hộp thoại giữ nguyên
  đích đã chọn · tải đứt giữa chừng → «Tải lên không xong, thử lại», không có hàng nào ·
  máy soạn hỏng → hàng «Chưa soạn được» + lý do + «Soạn lại».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
| --- | --- | --- |
| Hộp «Tải nguồn lên» | Đưa một tệp vào kho và nói nó dành cho trang nào | Nút ở danh sách trang, ở màn đọc trang / tab «Nguồn» |
| Tab «Nguồn» | Cho người tải và người duyệt thấy máy đã làm gì với từng tệp | Thanh tab của Tài liệu / màn duyệt, hộp tải |
| Màn duyệt bản máy soạn | Cho chủ trang đọc nguồn trước rồi mới quyết | Tab «Chờ duyệt», hàng nguồn / màn đọc trang |
| Mục «Nguồn» trên màn đọc | Cho người đọc tải về tệp mà bản đang dùng trích | Màn đọc trang / tải tệp |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
| --- | --- | --- | --- |
| ST-tai-nguon | Tab «Nguồn» + hộp tải | Vùng kéo thả «Kéo tệp vào đây, hoặc chọn tệp · Word (.docx) hoặc PDF, tới 20 MB»; bảng nguồn: tên tệp, người tải, trang đích, trạng thái, ngày | Chọn tệp, chọn đích, tải |
| ST-nguon-dang-tai | Hộp tải | Thanh tiến độ tải, nút «Huỷ» | Chờ / huỷ |
| ST-nguon-sai-loai | Hộp tải | Câu lỗi dưới ô: «Chỉ nhận Word (.docx) hoặc PDF, tới 20 MB» | Chọn tệp khác |
| ST-nguon-da-co | Hộp tải | «Nguồn này đã có (tải ngày …)» + «Mở nguồn» | Mở nguồn cũ |
| ST-nguon-dang-soan | Tab «Nguồn» | Hàng «Máy đang soạn» (chỉ báo bận) | Chờ |
| ST-nguon-can-go-tay | Tab «Nguồn» | Hàng «Cần gõ tay — tệp là bản quét, máy không đọc được chữ» | Viết trang bằng tay |
| ST-nguon-chua-soan-duoc | Tab «Nguồn» | Hàng «Chưa soạn được» + lý do một dòng + «Soạn lại» | Soạn lại / bỏ qua |
| ST-nguon-tat | Danh sách trang | Nút «Tải nguồn lên» khoá, câu «Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình» | Nhờ quản trị |
| ST-duyet-ban-may-soan | Màn duyệt | Bước 1 «Nguồn nói gì»: chữ nguồn, đoạn được trích tô nền; bảng «Con số và ngày» (số → đoạn nguồn); nút «Đã đọc nguồn, xem bản máy soạn»; Duyệt chưa hiện | Đọc nguồn, mở bước 2 |
| ST-duyet-ban-may-soan-buoc-2 | Màn duyệt | Nguồn trái, bản máy soạn phải (≥1024; 390 là hai thẻ «Nguồn» / «Bản máy soạn»); Duyệt, Trả lại, Sửa bản này — không nút nào nhận focus sẵn, không nút nào tô «nên bấm» | Duyệt / trả lại / sửa |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tệp nhận: `.docx`, `.pdf`, tới 20 MB; kiểm đuôi ở máy khách, kiểm chữ ký tệp ở máy chủ.
- Đích «cập nhật trang có sẵn» chỉ liệt trang có bản đang dùng.
- Bước 2 của màn duyệt chỉ mở sau khi bấm «Đã đọc nguồn»; tải lại trang thì về bước 1.
- Nhãn trên màn: «máy soạn», «nguồn», «bản đề xuất», «chủ trang» theo `CONTEXT.md`; tên
  tệp và chữ nguồn là dữ liệu người nhập, gắn `translate="no"`.
- 390: hộp tải thành trang toàn màn; màn duyệt hai thẻ thay hai cột.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
| --- | --- | --- |
| `Dialog`, `Field`, `FieldDescription`, `Select`, `RadioGroup` (`@crm/ui`) | dùng | Hộp tải và chọn đích là form thường |
| Vùng kéo thả tệp | tra ReUI (`file-upload`/`dropzone`) ở S3 theo `docs/design.md` năm bậc; không có thì dựng trong `packages/ui` | Kho chưa có; không dựng ở chỗ gọi |
| `Progress` (`@crm/ui`) | dùng | Tiến độ tải |
| `SimpleTable`, `StatusIndicator` | dùng | Bảng nguồn, trạng thái từng hàng |
| `DiffTrang`, `markdown-reader` (`packages/ui`, lượt 1) | dùng | Bản máy soạn trình bày như lượt 1 |
| Khung nguồn cạnh nhau, đoạn trích tô nền | ghép trong `packages/ui` | Mới ở lượt này; màn đọc lượt 3 dùng lại |
| `Tabs` | dùng | 390: «Nguồn» / «Bản máy soạn» |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: nối tiếp khuôn của lượt 1 (danh sách trang → màn đọc, tab «Chờ duyệt» → màn duyệt);
tab «Nguồn» là danh sách thứ ba cùng khuôn. Chân ngành: Document360 và HelpSite đều để bài
máy soạn từ tệp vào hàng nháp chờ biên tập duyệt — cùng hình danh sách → chi tiết. Không tra
Mobbin: chỉ một khuôn khả dĩ.
<!-- UX-SPEC-TEMPLATE>>> -->

## 6. Đo thế nào (tóm tắt, chi tiết ở `evals.yaml`)

- `migration`: script so câu lệnh với tập chỉ-thêm viết trước, và áp trên bản sao có dữ liệu.
- Nạp nguồn, trùng, sai loại, thiếu khoá: test tRPC thật với Blob giả cắm qua một cổng
  (`interface`) trong service — không gọi Blob thật trong test.
- Đọc chữ: ma trận tệp mẫu viết trước (docx, PDF có chữ, PDF quét, PDF lỗi mã, tệp hỏng),
  tệp lưu trong hồ sơ.
- Soạn: model giả trả kịch bản viết trước (đạt, số không nguồn, trích không có trong nguồn,
  dấu thanh lệch kiểu, rỗng, sai khuôn, lỗi) chạy qua đúng `nop_ban_de_xuat` và trình xử lý.
- Ranh giới `subagent`: test ghim tập `tool`, sandbox, model không đọc `AppSetting`.
- Màn: ui-check trong phiên đo riêng (`tien-de.mjs`), 1440 và 390.
- Chất lượng soạn thật: một lượt model thật trên ba tệp mẫu, đầu ra lưu vào hồ sơ, chấm
  judgment — T3 nên người ký phán cuối.
