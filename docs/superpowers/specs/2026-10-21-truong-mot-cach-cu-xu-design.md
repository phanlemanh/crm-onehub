# Một trường, một cách cư xử — DA14

Hàng DA14 của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511). Cổng Đáng: build, chủ kho 20/10
(«Tôi duyệt Cổng Đáng build cho cả 9 hàng.»). Mốc đợt 2026-10-22.

Câu giao: «Nhân viên quan hệ đối tác xem và sửa một trường tự tạo trên phiếu và trong bảng y như trường có sẵn: số
viết kiểu Việt, ô tích có nhãn, liên kết bấm được, lỗi nói tiếng Việt».

Luật đích: `docs/design.md` mục «Trường» — người dùng không phân biệt được trường chuẩn với trường tự tạo ở bất kỳ màn
nào. DA14 dựng bảng đăng ký theo kiểu mà các hàng sau (DA15–DA20, DA17, DA18) dùng tiếp (luật 30 của đợt).

## Vì sao

Soát mã 20/10 (đọc lại 21/10 trên onehub `37e7bf27c`):

- Trường tự tạo đi đường riêng. Phiếu vẽ chúng ở `apps/app/components/crm/fields/record-fields.tsx`, bảng ở
  `field-columns.tsx`. Mỗi tệp tự rẽ nhánh theo `field.type`. Trường chuẩn thì mỗi phiếu và mỗi bảng tự viết ô cho
  từng trường (`InlineField`, `InlineDateField`, `formatMoney`, `LocalDay`, `OwnerCell`, `SoDienThoai`…).
- Ô Số là một `InlineField` chữ. Nó gửi nguyên chuỗi, và máy chủ đọc bằng `Number("1.234,5")`, ra `NaN`. Người nhận câu
  «… takes a number.» của `packages/db/src/fields.ts`, được app in thẳng bằng `toast.error(error.message)`.
- Ô tích nằm trong `DetailSheetProperty`. Nhãn ở đó là `<span>` nên ô tích không có tên truy cập, và bấm vào nhãn không
  đổi giá trị.
- Liên kết, Email, Điện thoại tự tạo hiện thành chữ trơn, ở cả phiếu lẫn bảng. Trường chuẩn cùng kiểu thì bấm được ở
  đầu phiếu (`mailto:`, `SoDienThoai goi`).
- Có ba tên gọi khác nhau: «Trường tự tạo» ở Cài đặt, «trường động» (`crm.ts` `createHint`), «trường tuỳ chỉnh»
  (`kara-ban-ghi.ts` `set_field_value`).

## Mục tiêu

1. Mỗi kiểu trường khai một lần, ở một bảng đăng ký. DA14 làm ba mặt: hiển thị, sửa tại chỗ, ô bảng. Ba mặt còn lại
   (ô form tạo, lọc, sort) thuộc DA16, DA18, DA17 và sẽ thêm cột vào cùng bảng.
2. Ba phiếu (Công ty, Liên hệ, Thoả thuận) và ba bảng (cùng ba loại) vẽ giá trị trường chỉ qua bảng đó, cho cả trường
   chuẩn lẫn trường tự tạo.
3. Số theo locale: nhận «1.234,5» ở tiếng Việt, «1,234.5» ở tiếng Anh, hiện bằng `Intl` với `tabular-nums`.
4. Lỗi khi lưu nói tiếng người dùng và theo kiểu, ví dụ «Ô này nhận số, ví dụ 1.234,5». Câu của máy chủ không bao giờ
   lên màn ở đường lưu trường.
5. Ô tích có nhãn; Liên kết, Email, Điện thoại bấm được ở mọi chỗ hiện giá trị.
6. Một tên gọi: «trường», «trường tự tạo».

## Không làm (non-goals)

- Ô trong form tạo và ô thêm nhanh: DA16.
- Sort và ẩn cột theo kiểu ở khổ hẹp, thẻ Kanban: DA17. DA14 giữ `hideBelow`, `width`, `sortable` của từng cột như nay.
- Lọc: DA18.
- Cài đặt › Trường (dịch tên trường chuẩn, sắp lại, ẩn, bật «Bắt buộc»): DA15.
- Kiểu Tệp: DA19, DA20.
- Kiểu Tiền cho trường tự tạo. Bảng có dòng Tiền cho Giá trị của thoả thuận; thêm Tiền vào `FIELD_TYPES` là đổi schema,
  không thuộc hàng này.
- Câu lỗi tiếng Anh của API cho máy gọi (Kara, khoá API). Chúng là hợp đồng máy với máy. Màn hình không đọc chúng nữa.

## Không được thành (anti-goals)

- Một ô riêng cho một trường ở màn. Nếu một trường chuẩn cần cư xử khác, phần khác ấy là tham số của dòng kiểu
  (ví dụ cách hiện tên quốc gia của ô Chữ «Quốc gia»), không phải một nhánh ô mới.
- Trường tự tạo trông «khác loại»: đứng thành khối riêng, có nhãn phụ, hay dùng thành phần khác trường chuẩn cùng kiểu.
- Hạ chuẩn trường chuẩn để khớp trường tự tạo. Hướng ngược lại: trường tự tạo lên đúng chuẩn đang có.

## Ràng buộc

- Vùng: đợt làm chủ `apps/app/components/crm/fields/**`, `record-sheet/**`, `apps/api/src/fields/**`,
  `packages/db/src/fields*.ts`. `packages/ui` và `DataTable` là của làn Mac Studio (luật 31). DA14 không chạm
  `packages/ui`: bảng đăng ký sống ở `apps/app/components/crm/fields/` và chỉ ghép các thành phần có sẵn.
- `apps/app/lib/messages/*.ts` chỉ được thêm dòng (luật 7). Sửa hai dòng gọi tên thì gửi `cham-tep` (luật 33).
- `apps/agent` là vùng của DA21. DA14 không chạm.
- Không chú thích trong mã. Phân tích ở biên: chuỗi người gõ được đọc thành giá trị có kiểu ngay ở ô nhập.

## Cách làm (máy quyết, căn cứ ở sổ)

### Bảng đăng ký

`apps/app/components/crm/fields/kieu-truong.tsx`, khoá theo kiểu: mười kiểu của `FIELD_TYPES` cộng `MONEY` (chỉ dùng
cho Giá trị của thoả thuận). Mỗi dòng khai:

- `hienThi`: vẽ giá trị ở chế độ đọc. Dùng ở ô phiếu, đầu phiếu (`DetailSheetStat`) và ô bảng.
- `suaTaiCho`: ô sửa trên phiếu.
- `oBang`: ô bảng, thường là `hienThi` trong một khung `truncate`.
- `docNhap`: đọc chuỗi người gõ thành giá trị có kiểu, hoặc trả lời từ chối có mã.

Ba điểm vào dùng chung: `OTruongPhieu` (một hàng nhãn và giá trị trên phiếu), `OTruongBang` (một ô bảng) và
`HienThiTruong` (giá trị trần, cho đầu phiếu). Đầu vào là một bộ mô tả trường:

```
{ khoa, nhan, kieu, giaTri, batBuoc, luaChon?, tienTe?, luu, dangLuu, nguon? }
```

Trường tự tạo đổi từ `RecordFieldEntry` sang bộ mô tả ở một hàm. Trường chuẩn được khai thành bộ mô tả trong từng phiếu.
Phiếu không còn gọi `InlineField`, `InlineDateField`, `InlineSelectField`, `InlineMoneyField`, `InlineTextArea` trực
tiếp: các ô ấy chỉ còn được gọi từ bảng đăng ký.

Kiểu của trường chuẩn (theo bảng ở `docs/design.md`):

| Phiếu | Trường chuẩn → kiểu |
|---|---|
| Thoả thuận | Tên → Chữ (bắt buộc) · Giá trị → Tiền · Tiền tệ → Chọn · Ngày chốt → Ngày · Người phụ trách → Người · Mô tả → Chữ dài |
| Công ty | Tên → Chữ (bắt buộc) · Tên miền → Chữ · Trang web → Liên kết · Điện thoại → Điện thoại · Email → Email · Thành phố → Chữ · Quốc gia → Chữ · Người phụ trách → Người |
| Liên hệ | Tên, Họ → Chữ · Chức danh → Chữ · Email → Email · Điện thoại → Điện thoại · LinkedIn, X, GitHub → Liên kết · Người phụ trách → Người |

Công ty của thoả thuận và liên hệ (ô chọn bản ghi), cùng Giai đoạn của thoả thuận (menu giai đoạn), không có dòng trong
bảng kiểu của `docs/design.md`. Khuyến nghị: giữ ô riêng của chúng ở DA14 (Hỏi-1 ở Cổng Phạm vi). Vai trò của
một liên hệ trong thoả thuận (`InlineTextCell` ở danh sách liên hệ của phiếu Thoả thuận) là thuộc tính của quan hệ,
không phải trường của bản ghi, nên cũng ngoài bảng.

Hành vi riêng của một trường chuẩn đi qua tham số của dòng kiểu, không thành ô riêng:

- Tên miền: `luu` bọc thêm bước nhận ra trang mạng xã hội, như hiện nay.
- Quốc gia: `hienThi` của Chữ nhận `trinhBay` để hiện tên quốc gia theo mã.

### Số

`docSoNhap(chuoi, locale)` nằm ở `apps/app/components/crm/fields/doc-nhap.ts`, là hàm thuần. Nó dùng dấu nhóm và dấu
thập phân của `Intl.NumberFormat(locale)`, cùng cách `parseMoneyInput` đang làm cho tiền:

- Nhận số âm và phần thập phân.
- Chuỗi chỉ đọc được theo locale kia (ví dụ «1234.5» khi đang ở tiếng Việt) thì từ chối với mã `locale-khac`, không
  đoán.

Ô gửi lên máy chủ một `number`. Máy chủ giữ nguyên luật nhận số JSON: nó không biết locale của người gõ, nên «1.234»
là mơ hồ ở phía nó.

Hiển thị dùng `Intl.NumberFormat(locale, { maximumFractionDigits: 20 })`, có `tabular-nums` và `translate="no"`. Không
đặt trần thấp hơn: mọi trần làm tròn bớt giá trị đã lưu, tức là hiện một số khác số đã lưu.

### Lỗi theo kiểu

`docNhap` của mỗi kiểu trả mã từ chối (`trong`, `so`, `locale-khac`, `email`, `lien-ket`, `dien-thoai`). Hai mã chỉ
máy chủ sinh: `lua-chon` (Chọn: lựa chọn vừa bị lưu trữ) và `nguoi` (Người: người vừa rời đội); kiểu không có luật
riêng dùng `khac`. Câu cho mã
nằm ở messages của app, theo locale, mở đầu bằng «Ô này nhận …» kèm một ví dụ đúng.

Câu hiện ngay dưới ô đang sửa (`aria-invalid`, `aria-describedby`). Ô giữ chế độ sửa với chuỗi người vừa gõ, và không
gọi lưu.

Máy chủ vẫn có thể từ chối khi hai người sửa cùng lúc (lựa chọn vừa bị lưu trữ, người vừa rời đội). Khi đó lượt lưu
trường — tự tạo hay chuẩn — báo «Chưa lưu được <nhãn>.» nối với câu của mã theo kiểu, không in `error.message`, và ô về
giá trị cũ. Phiếu biết đang lưu trường nào: lượt lưu trường tự tạo mang đúng một khoá trong `data.fields`, lượt lưu
trường chuẩn mang đúng một khoá trong `data`; bảng đăng ký giữ bộ mô tả của khoá ấy.

### Ô tích

Nhãn là một `<label htmlFor>` nối với `Checkbox id`, nên ô tích có tên truy cập là nhãn trường, và bấm nhãn đổi giá
trị. Ô bảng và đầu phiếu hiện «Có» hay «Không» (`misc.yes` / `misc.no`).

### Liên kết bấm được

Ở chế độ đọc, Liên kết, Email và Điện thoại là thẻ `<a>`:

- Liên kết: `href` là giá trị, thêm `https://` khi thiếu giao thức; mở thẻ mới với `rel="noreferrer noopener"`.
- Email: `mailto:`.
- Điện thoại: qua `SoDienThoai goi`.

Bên cạnh là một nút biểu tượng «Sửa <nhãn>» mở ô nhập (lối máy khuyên ở Hỏi-2; lối kia: hàng là đích sửa như mười
kiểu còn lại, cạnh đó nút «Mở <nhãn>»). Ô trống thì không có liên kết, và cả hàng là nút sửa như các kiểu khác.

### Tên gọi

Hai dòng chữ đổi theo `CONTEXT.md` mục «Trường» (gửi `cham-tep`):

- `crm.ts` `createHint`: «Tạo trường động để …» → «Tạo trường để …».
- `kara-ban-ghi.ts` `set_field_value`: «Điền một trường tuỳ chỉnh» → «Điền một trường».

Một bài kiểm giữ: chuỗi tiếng Việt của app không còn «tuỳ chỉnh», «tùy chỉnh» hay «trường động».

## Để lại cho người dựng

- Tên hàm và tệp phụ trong `apps/app/components/crm/fields/`.
- Thứ tự chuyển phiếu và bảng.
- Cách dựng kho tRPC giả trong bài kiểm DOM (theo mẫu `apps/app/test/chi-quan-tri-truong.dom.tsx`).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: phiếu bản ghi → bấm ô một trường → gõ (ví dụ «1.234,5») → Enter hay rời ô → ô hiện «1.234,5», giá trị đã
  lưu (điểm ra: vẫn ở phiếu).
- Biên: trường trống hiện «—» (`EmptyCellValue`). Liên kết trống thì không có thẻ `<a>`. Trường bắt buộc không cho để
  trống. Phiếu đã lưu trữ thì khoá mọi ô (`KhoaLuuTru`, như nay).
- Lỗi và quay lại: gõ sai → câu theo kiểu dưới ô, ô giữ chuỗi vừa gõ → sửa rồi Enter, hoặc Esc để trả giá trị cũ.
  Máy chủ từ chối → toast «Chưa lưu được <nhãn>. Ô này nhận …», ô trở về giá trị cũ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Phiếu Thoả thuận, Công ty, Liên hệ (thẻ Tổng quan) | xem và sửa giá trị trường của một bản ghi | từ bảng hay liên kết bản ghi / đóng phiếu |
| Bảng Thoả thuận, Công ty, Liên hệ | đọc giá trị trường của nhiều bản ghi | từ thanh bên / mở phiếu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-phieu-doc | Phiếu | nhãn bên trái, giá trị theo kiểu bên phải; Liên kết, Email, Điện thoại là liên kết kèm nút «Sửa <nhãn>» | bấm liên kết hoặc bấm để sửa |
| ST-phieu-trong | Phiếu | «—» mờ | bấm để nhập |
| ST-phieu-sua | Phiếu | ô nhập đúng kiểu (số, ngày, chọn, người, ô tích) | gõ, Enter để lưu, Esc để huỷ |
| ST-phieu-dang-luu | Phiếu | vòng quay nhỏ cạnh giá trị đang gửi | chờ |
| ST-phieu-loi-nhap | Phiếu | ô viền đỏ, câu «Ô này nhận số, ví dụ 1.234,5» ngay dưới | sửa chuỗi hay Esc |
| ST-phieu-loi-may-chu | Phiếu | toast «Chưa lưu được <nhãn>. Ô này nhận …», ô về giá trị cũ | thử lại |
| ST-bang-o | Bảng | giá trị theo kiểu, cùng cách hiện như trên phiếu; số `tabular-nums` | mở phiếu |
| ST-bang-trong | Bảng | «—» | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Số: nhận dấu của locale đang dùng; chuỗi theo locale kia bị từ chối kèm ví dụ đúng.
- Enter lưu, Esc trả lại, rời ô lưu (như `InlineField` hiện nay).
- Ô tích: `Space` đổi giá trị; bấm nhãn đổi giá trị.
- Liên kết: `Tab` tới liên kết rồi tới nút «Sửa <nhãn>»; nút có `aria-label`.
- Khổ 375: hàng nhãn và giá trị xếp như `PROPERTY_ROW` hiện nay, không cuộn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `InlineField`, `InlineDateField`, `InlineSelectField`, `InlineMoneyField`, `InlineTextArea` (apps/app) | dùng | ô sửa tại chỗ đang chạy ở trường chuẩn; bảng đăng ký gọi lại chúng |
| `Checkbox`, `Input`, `Button`, `EmptyCellValue` (`@crm/ui`) | dùng | thành phần chung có sẵn |
| `OwnerCell`, `SoDienThoai`, `LocalDay`, `formatMoney` | dùng | cách hiện đã chốt của Người, Điện thoại, Ngày, Tiền |
| `OTruongPhieu`, `OTruongBang`, `HienThiTruong` (`apps/app/components/crm/fields/kieu-truong.tsx`) | ghép | bậc 5 của «Vẽ tay là bậc cuối»: chỉ ghép thành phần có sẵn theo kiểu; không có dạng/màu/khoảng cách mới, nên không đụng `packages/ui` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — bảng và phiếu đã có. DA14 đổi cách vẽ ô bên trong, không đổi khuôn, nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
