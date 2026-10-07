# Dọn được OKR nhập sai — thiết kế

Lượt 1 của chuẩn vòng đời bản ghi (`docs/vong-doi.md`). Chủ kho duyệt chuẩn và
thiết kế này ngày 2026-10-07, trong phiên rà 15 loại bản ghi.

## Vì sao

Chủ kho dùng `/okr/theo-don-vi` trên production và thấy ba điều, đã kiểm lại trên mã
onehub `73bb599`:

1. Mục tiêu nhập sai không xoá được, kể cả nháp chưa ai thấy. Chỉ có `dropObjective`
   (`okr.service.ts`), đặt `status: "da-bo"`; không thủ tục nào rời `da-bo`.
2. «Theo đơn vị» và «Của tôi» hiện lẫn mục tiêu đã bỏ: bộ lọc trạng thái mặc định
   rỗng nghĩa là lấy tất cả (`okr-search-params.ts`, `okr-xem.service.ts`
   `dieuKienLoc`).
3. Nhãn «Đã bỏ» cùng kiểu `outline` và cùng màu chấm `neutral` với «Nháp»
   (`tien-do-kr.tsx`); dòng không khác gì.

Không có quyết định nào ghi «cấm xoá mục tiêu». Lý do gốc của `dropObjective` là giữ
KR và chỗ góp để đọc lại (`2026-09-25-dat-okr-trong-crm-design.md`), và lý do đó chỉ
đúng khi mục tiêu đã có lịch sử.

Cùng đợt rà thấy một lỗ an toàn ở bán hàng: `deals.purge`, `contacts.purge`,
`companies.purge` chỉ kiểm «đã lưu trữ» khi lịch dọn gọi (`guard`), nên gọi thẳng
(tRPC, REST `DELETE /deals/{id}`, `bulkPurge`) xoá hẳn được bản ghi chưa lưu trữ; và
`archive` ghi đè `archivedAt`, nên lưu trữ lại đặt lại đồng hồ dọn 180 ngày.

## Chuẩn áp vào đây

> Chưa có lịch sử thì Xoá. Đã có lịch sử thì Lưu trữ, hoặc khép bằng một kết cục
> nghiệp vụ.

Với mục tiêu OKR, kết cục nghiệp vụ là «Bỏ». Lượt này thêm Xoá cho mục tiêu chưa có
lịch sử, thêm «Dùng lại» để lấy lại mục tiêu bỏ nhầm, và cất mục tiêu đã bỏ khỏi danh
sách mặc định.

## Lịch sử của một mục tiêu

Một mục tiêu **có lịch sử** khi một trong các điều sau đúng:

- `publishedAt` khác null — đã từng công bố, kể cả đã bỏ sau đó.
- Một quan hệ lịch sử của mục tiêu có dòng: `alignedBy` (mục tiêu khác góp vào nó),
  `comments`, `nhinLai`, `mangSangDi`, `mangSangTu`, `ghiNhan`, `chuDeHoiY`.
- Một KR của nó có dòng ở quan hệ lịch sử của KR: `alignedBy`, `checkIns`,
  `comments`, `soChup`, `doiDich`, `diemKr`, `bangChung`, `ghiNhan` — đúng bộ
  `removeKeyResult` đang chặn, cộng `comments`.

Các quan hệ còn lại **đi theo** mục tiêu khi xoá: `participants`, `keyResults`,
`alignments` (chiều đi ra), `followers`, `nguoiXem`, `mucTieuTuMau`; và của KR:
`nguonMay`, `viecKr`.

Hai danh sách nằm ở một module, `@crm/db/okr-muc-tieu-lich-su`:
`QUAN_HE_LICH_SU_MUC_TIEU`, `QUAN_HE_DI_THEO_MUC_TIEU`, `QUAN_HE_LICH_SU_KR`,
`QUAN_HE_DI_THEO_KR`, và hàm `lichSuMucTieu(tx, ids)` trả `Map<id, LyDoLichSu | null>`
— `null` là sạch, còn lại là lý do đầu tiên tìm thấy. Một test đọc mô hình dữ liệu
lúc chạy của Prisma (`db._runtimeDataModel`, như `okr-sua-an-chu-ky.spec.ts` đọc cho
chu kỳ) và đỏ, gọi tên quan hệ, khi một quan hệ của `OkrObjective` hay
`OkrKeyResult` không nằm đúng một trong hai danh sách. Ai thêm bảng mới trỏ vào mục
tiêu mà quên xếp loại thì CI nói ra.

Hai thứ cố ý ở lại sau khi xoá, vì không có khoá ngoại: `okrTrail` (vết, kể cả dòng
xoá) và `OkrDeXuat` (góp ý của Kara — dữ liệu đo Kara, `ty-le-quyet.sql`). Dấu «tạo từ
mẫu» (`OkrMucTieuTuMau`) đi theo mục tiêu, nên nháp tạo nhầm từ mẫu rời mẫu số của
`canh-kr-okr/rang/ty-le-canh-kr.sql` — đúng ý, vì đó không phải một lần dùng mẫu thật.

## API

**`okr.xoaMucTieu({ id })`** — mới.

- Quyền: `assertSuaMucTieu`, như `dropObjective`.
- Trong một giao dịch: `assertKyGhiDuoc`; khoá hàng mục tiêu và mọi hàng KR của nó
  `FOR UPDATE` (cập nhật tuần ghi `okrKeyResult.currentValue`, nên một lần cập nhật
  chen giữa phải chờ hoặc thấy mục tiêu đã mất); đọc lại trạng thái.
- `cho-duyet` → 400 `OKR.thongDiep.xoa.dangChoDuyet` («Rút về Nháp rồi mới xoá được.»).
  `cong-bo` có `publishedAt` nên rơi vào nhánh lịch sử.
- `lichSuMucTieu` khác `null` → 400 `OKR.thongDiep.xoa.coLichSu(lyDo)`, câu gọi tên lý
  do («đã công bố», «có bình luận», «một KR đã có cập nhật»…) và chỉ lối ra «Hãy bỏ
  mục tiêu».
- Sạch: xoá `OkrViecKr` và `OkrNguonKr` của từng KR (như `removeKeyResult`), xoá
  `OkrMucTieuTuMau`, rồi `okrObjective.delete` (các quan hệ còn lại cascade). Ghi một
  dòng vết `xoa-muc-tieu`, `objectiveId` giữ id cũ, `before = { title, level, đơn vị,
  status, soKr }`.
- Trả `{ id, canhBao: null }`.

**`okr.dungLaiMucTieu({ id })`** — mới.

- Quyền như trên; `assertKyGhiDuoc`; khoá hàng mục tiêu.
- Không phải `da-bo` → 400 `OKR.thongDiep.dungLai.chuaBo`.
- Kiểm trần số mục tiêu của đơn vị bằng `kiemTranMucTieu(..., them: 1)`: chế độ «chặn»
  thì 400, chế độ «cảnh báo» thì trả `canhBao`.
- `status: "nhap"`, `droppedAt: null`; `publishedAt` giữ nguyên (đã công bố thì vẫn có
  lịch sử, không xoá được). Vết `dung-lai`, `before { status: "da-bo" }`,
  `after { status: "nhap" }`.
- Trả `{ id, canhBao, canGuiDuyet }`; `canGuiDuyet` là `congBoHayGuiDuyet` của chính
  mục tiêu đó cho người gọi trả `gui-duyet`, để màn chọn đúng câu toast.

**Khoá khi cập nhật tuần chen giữa.** `xoaMucTieu` khoá hàng mục tiêu rồi mọi hàng KR
`FOR UPDATE` trước khi gọi `lichSuMucTieu`. `guiCapNhat` ghi `okrKeyResult.currentValue`
nên giữ khoá hàng KR tới lúc commit: một lần cập nhật đang chạy làm `xoaMucTieu` chờ,
rồi thấy dòng `checkIn` mới và trả 400; một lần cập nhật đến sau thì thấy mục tiêu đã
mất và hỏng ở khoá ngoại như mọi KR đã xoá.

**Một nguồn cho nút.** `okr.objective` thêm `quyen.xoa` và `quyen.dungLai`, tính từ
cùng điều kiện các thủ tục dùng: quyền sửa đơn vị ∧ chu kỳ nhận ghi ∧ (`xoa`: trạng
thái `nhap` hoặc `da-bo` và `lichSuMucTieu` là `null`; `dungLai`: trạng thái
`da-bo`). Màn không tự suy.

**Hai tên hành động vết mới** `xoa-muc-tieu`, `dung-lai` vào `HANH_DONG_VET`
(`@crm/db/okr-vet`) — chuỗi, không `migration`. Tab Vết có chữ cho cả hai.

**Danh sách.** `okr.danhSach` và `okr.mine` thêm mảng `daBo`.

- Bộ lọc trạng thái rỗng (mặc định): `rows` loại `da-bo`; `daBo` là mục tiêu đã bỏ
  khớp mọi lọc còn lại (phụ trách, loại, tự tin, góp ý), cùng thứ tự với `rows`.
- Bộ lọc trạng thái chọn rõ: `rows` theo đúng lọc (có `da-bo` nếu người chọn);
  `daBo` rỗng.
- `facetCounts` không đổi: mặt «Trạng thái» vẫn đếm «Đã bỏ · n».
- `total` là độ dài `rows`.

**Bán hàng.** `purge(id)` của deals, contacts, companies: không `guard` mà hàng có
`archivedAt` null → 400 `ARCHIVE.thongDiep.chuaLuuTru` («Chỉ xoá vĩnh viễn được bản
ghi đã lưu trữ.»), không xoá gì. `bulkPurge` đi qua `purge` nên id chưa lưu trữ thành
một dòng lỗi trong kết quả lô, các id khác vẫn chạy. Lịch dọn (`purgeExpired`, có
`guard`) không đổi. `archive(id)` và `bulkArchive` chỉ đặt `archivedAt` khi đang null
(`updateMany where archivedAt: null`); đã lưu trữ thì giữ ngày đầu, vẫn trả tên.

## Màn hình

**«Theo đơn vị»** (`theo-don-vi.tsx`) và **«Của tôi»** (`cua-toi.tsx`):

- Danh sách chính là `rows`. Đếm trên đầu thẻ đơn vị đếm `rows`.
- Cuối danh sách, khi `daBo` có phần tử: một dòng gập «Đã bỏ ({n})», đóng mặc định.
  Mở ra là các mục tiêu đã bỏ, cùng khối `KhoiMucTieu`.
- Không mục tiêu đang dùng nhưng có mục tiêu đã bỏ: trạng thái rỗng như hôm nay, dòng
  gập nằm dưới.
- Lọc «Trạng thái» → «Đã bỏ»: danh sách chính chỉ còn mục tiêu đã bỏ, không dòng gập.

**Mục tiêu đã bỏ trông khác «Nháp»:** nhãn trạng thái khác biến thể với nhãn «Nháp»,
không vẽ thanh tiến độ, khối mang `data-da-bo`. Ý nghĩa nằm ở chữ «Đã bỏ», không chỉ ở
màu. Biến thể cụ thể chốt ở design-pass bằng thành phần có sẵn của `packages/ui`.

**Ngăn chi tiết** (`objective-sheet.tsx`):

- Nháp sạch: menu «…» có «Xoá mục tiêu» (tông huỷ), **không** có «Bỏ mục tiêu» — bỏ
  một nháp sạch chỉ đẻ thêm một dòng «Đã bỏ».
- Đã có lịch sử, chưa bỏ: «Bỏ mục tiêu» như hôm nay, không có «Xoá».
- Đã bỏ: nút «Dùng lại» (viền) ở chỗ nút chính; menu «…» có «Xoá mục tiêu» khi
  `quyen.xoa`.
- «Xoá mục tiêu» mở `ConfirmDialog` tông huỷ: tiêu đề «Xoá mục tiêu này?», tên mục
  tiêu ở dòng riêng mang `translate="no"` (tiêu đề của `ConfirmDialog` là chuỗi, không
  đánh dấu được phần dữ liệu người nhập), thân «Mục tiêu và {n} KR của nó mất hẳn. Vết
  vẫn ghi lại việc xoá.», nút «Xoá mục tiêu» · «Huỷ». Xác nhận →
  ngăn đóng, toast «Đã xoá mục tiêu», danh sách làm mới. Lỗi máy chủ (ví dụ vừa có một
  lần cập nhật) → toast đúng thông điệp, ngăn vẫn mở và đọc lại.
- «Dùng lại» không hỏi lại (đảo được bằng «Bỏ»). Toast chốt nguyên văn, hai nhánh theo
  `canGuiDuyet`: bật — «Mục tiêu đã về Nháp. Gửi duyệt lại khi sẵn sàng.»; tắt — «Mục
  tiêu đã về Nháp. Công bố lại khi sẵn sàng.» Có `canhBao` thì toast kèm câu cảnh báo
  trần.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (xoá): danh sách theo đơn vị → bấm mục tiêu nháp nhập sai → ngăn chi tiết →
  «…» → «Xoá mục tiêu» → hỏi lại → xác nhận → ngăn đóng, toast, dòng biến mất (điểm
  ra: danh sách).
- Suôn sẻ (dùng lại): danh sách → mở «Đã bỏ (n)» → bấm mục tiêu → «Dùng lại» → toast
  «Mục tiêu đã về Nháp. Gửi duyệt lại khi sẵn sàng.» (hoặc «Công bố lại…» khi đơn vị
  không cần duyệt), mục tiêu về danh sách chính với nhãn «Nháp».
- Biên: mục tiêu đã công bố hoặc có lịch sử → không có «Xoá», chỉ «Bỏ»; người không
  sửa được đơn vị → không có nút nào; chu kỳ khoá hoặc ẩn → không có nút ghi.
- Lỗi & quay lại: xoá bị từ chối vì lịch sử vừa xuất hiện → toast thông điệp có lý
  do, ngăn ở lại và đọc lại, menu nay chỉ còn «Bỏ»; dùng lại vượt trần ở chế độ chặn →
  toast thông điệp trần, mục tiêu vẫn ở «Đã bỏ».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| OKR › Theo đơn vị | xem mục tiêu đang dùng của một đơn vị | cây đơn vị / ngăn chi tiết |
| OKR › Của tôi | xem mục tiêu của tôi đang dùng | tab OKR / ngăn chi tiết |
| Ngăn chi tiết mục tiêu | làm việc với một mục tiêu | danh sách / danh sách |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-donvi-danhsach | Theo đơn vị | mục tiêu đang dùng, không dòng «Đã bỏ» | mở mục tiêu |
| ST-donvi-dabo-dong | Theo đơn vị | mục tiêu đang dùng + dòng gập «Đã bỏ (n)» đóng | mở dòng gập |
| ST-donvi-dabo-mo | Theo đơn vị | thêm các khối mục tiêu đã bỏ, nhãn «Đã bỏ», không thanh tiến độ | mở một mục tiêu đã bỏ |
| ST-donvi-chi-dabo | Theo đơn vị | trạng thái rỗng của đơn vị + dòng gập «Đã bỏ (n)» | tạo mục tiêu / mở dòng gập |
| ST-donvi-loc-dabo | Theo đơn vị | lọc «Đã bỏ»: chỉ mục tiêu đã bỏ, không dòng gập | bỏ lọc |
| ST-cuatoi-dabo-dong | Của tôi | mục tiêu của tôi + dòng gập «Đã bỏ (n)» | mở dòng gập |
| ST-ngan-nhap-sach | Ngăn chi tiết | menu có «Xoá mục tiêu», không «Bỏ mục tiêu» | xoá |
| ST-ngan-co-lich-su | Ngăn chi tiết | menu có «Bỏ mục tiêu», không «Xoá» | bỏ |
| ST-ngan-da-bo | Ngăn chi tiết | nút «Dùng lại»; «Xoá mục tiêu» nếu sạch | dùng lại / xoá |
| ST-ngan-hoi-xoa | Ngăn chi tiết | hộp hỏi lại tông huỷ, tên và số KR | xác nhận / huỷ |
| ST-ngan-xoa-loi | Ngăn chi tiết | toast thông điệp có lý do, ngăn ở lại | bỏ thay vì xoá |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Dòng gập dùng `Collapsible`: `aria-expanded`, Enter/Space mở đóng, đóng mặc định mỗi
  lần tải.
- Sau khi xoá, ngăn đóng và tiêu điểm về danh sách; hộp hỏi lại huỷ thì tiêu điểm về
  nút «…».
- Số trong «Đã bỏ ({n})» là số mục tiêu đã bỏ khớp các lọc đang bật.
- Tên mục tiêu trong hộp hỏi lại mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Collapsible` (`packages/ui`) | dùng | dòng gập có sẵn, `ArchivedList` cũng dựng trên nó |
| `KhoiMucTieu` | mở rộng | thêm nhánh hiển thị mục tiêu đã bỏ |
| `Badge` / `StatusIndicator` | dùng | chọn biến thể có sẵn cho «Đã bỏ» ở design-pass |
| `ConfirmDialog` | dùng | hỏi lại thao tác không hoàn tác được |
| `DropdownMenuItem variant="destructive"` | dùng | như «Bỏ mục tiêu» hôm nay |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: màn đã là danh sách mục tiêu mở ngăn chi tiết; lượt này chỉ thêm một nhóm gập
cuối danh sách và hai hành động trong ngăn — không đổi khuôn, không cần tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Độ phủ — quét hình thái

Chân sản phẩm: `CONTEXT.md` («Lưu trữ», «Chu kỳ»), `docs/vong-doi.md`, mã onehub
`73bb599` [SUY-TỪ-REPO]. Chân ngành: HubSpot giữ bản ghi bán hàng đã xoá 90 ngày
trong thùng rác rồi mới xoá hẳn [NGÀNH: HubSpot Knowledge Base «Restore deleted
records»]; Lattice cho xoá mục tiêu và có lệnh «End a goal» riêng [NGÀNH: Lattice Help
«Delete a goal»].

- **Trục A — bản ghi:** mục tiêu OKR · KR (chỉ như nguồn lịch sử) · thoả thuận, cá
  nhân, công ty.
- **Trục B — việc:** xoá · bỏ · dùng lại · lưu trữ · xoá vĩnh viễn · hiện trong danh
  sách.
- **Trục C — tình trạng:** nháp sạch · nháp có lịch sử · chờ duyệt · đã công bố · đã
  bỏ chưa từng công bố · đã bỏ từng công bố; bán hàng: đang dùng · đã lưu trữ. [thước
  CE: `TRANG_THAI_MUC_TIEU` + các quan hệ của `OkrObjective`, `OkrKeyResult` trong
  `schema.prisma`]
- **Trục D — đường vào:** ngăn chi tiết · danh sách Theo đơn vị · Của tôi · gọi thẳng
  tRPC/REST · thao tác theo lô · lịch dọn.
- Cross-cutting: quyền sửa đơn vị; pha chu kỳ và chu kỳ ẩn; vết; trần số mục tiêu;
  mục tiêu hạn chế (`hienThi`); khoá hàng khi cập nhật tuần chen giữa; vi/en.

**Core** → AC-1…AC-15 (bảng ở hợp đồng).

**Later:** xoá nhiều mục tiêu một lúc; «Đã bỏ» gập ở cây căn chỉnh, họp tuần, chấm
điểm (chúng đã chỉ đọc mục tiêu đã công bố hoặc có lọc riêng); Hoàn tác sau khi xoá
mục tiêu; nút «…» trên từng dòng danh sách.

**Never:** thùng rác cho mục tiêu kiểu HubSpot [NGÀNH] — chuẩn kho đã chọn «chưa có
lịch sử thì xoá thật, có lịch sử thì bỏ», thùng rác là cách cất thứ ba; cột
`deletedAt` cho mục tiêu — chuẩn cấm hai cách cất song song; khôi phục mục tiêu đã xoá
— đã hỏi lại trước khi xoá.

## Ngoài phạm vi

- Mọi việc của lượt 2 và lượt 3 trong `docs/vong-doi.md` (bộ chữ trên các màn khác,
  Hoàn tác khi lưu trữ bán hàng, dải báo bản ghi đã lưu trữ, Kanban, tác nhân, giai
  đoạn, chiến dịch, kế hoạch 30 ngày).
- Tài liệu — lượt 3b của lộ trình Kho tài liệu.
- Kara không có công cụ xoá hay dùng lại mục tiêu.
