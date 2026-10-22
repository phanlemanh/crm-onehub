# Nhập trường lúc tạo (DA16 `nhap-truong-luc-tao`) — thiết kế

Ngày: 21/10/2026 · hạng T2 · dãy V3 của đợt viec-du-an-kho-tai-lieu · mốc 22/10/2026.

Câu giao: «Nhân viên quan hệ đối tác nhập đủ các trường cần thiết ngay lúc tạo công ty, cá nhân hay thoả thuận, không
phải mở lại phiếu».

Luật đích: `docs/design.md` mục «Trường» — «Form tạo và ô thêm nhanh: trường bắt buộc và trường đang hiện trên phiếu»,
và «Mỗi kiểu trường khai **một lần** sáu mặt: hiển thị, sửa tại chỗ, ô trong form tạo, ô trong bảng, bộ lọc, sort».

Hồ sơ này soạn trên giấy theo luật 44 của đợt: mã chỉ viết sau khi DA15 `truong-chuan-o-cai-dat` gộp. Mọi tên hàm của
DA15 dưới đây đọc từ nhánh `feat/truong-chuan-o-cai-dat` (đỉnh 2efcd9bfa), chưa có trên onehub. Khi DA15 gộp, gộp
onehub vào nhánh này rồi đọc lại tên thật; tên khác thì sửa kế hoạch S2, không sửa hợp đồng.

## Hôm nay

- Ba sheet «Tạo mới» (`apps/app/app/(app)/[slug]/{companies,contacts,deals}/create-*-sheet.tsx`) và hai ô thêm nhanh
  (`apps/app/components/crm/record-sheet/quick-add.tsx`: `QuickAddContact`, `QuickAddDeal`) dựng tay từng ô của trường
  chuẩn bằng `Field`/`Input`, không có trường tự tạo nào.
- Ba thủ tục `companies.create`, `contacts.create`, `deals.create` không nhận `fields`; chỉ `*.update` nhận
  (`recordFieldValues`). Người tạo xong phải mở phiếu bấm từng ô.
- `required` của trường tự tạo chỉ chặn việc xoá trống một giá trị đã ghi (`coerceValue`). Không đâu kiểm «bản ghi mới
  phải có giá trị».
- `queueBackfillForNewRecord` xếp hàng Kara điền mọi trường «Kara điền» của bản ghi mới, vì cho rằng bản ghi vừa tạo
  luôn trống (`apps/api/src/fields/fields.service.ts`).
- Lỗi lượt tạo hiện nguyên câu máy chủ (`onError: (error) => toast.error(error.message)`).
- Bảng đăng ký kiểu `KIEU_TRUONG` của DA14 có ba mặt: `hienThi`, `suaTaiCho`, `oBang`. Mặt `suaTaiCho` lưu ngay khi
  người chốt một ô (`MoTaTruong.luu`), không giữ được bản nháp tới lúc bấm Tạo.

## Đã có từ DA15 (nhánh, chưa gộp)

- `fields.layout({entity})` trả danh sách trộn `MucBoTri`: `{kind:"standard", key, hidden, required}` hoặc
  `{kind:"custom", id, key}`; ai trong đội cũng đọc được. Schema `@crm/validation/bo-tri-truong` (`parseBoTriTruong`).
- `useBoTriTruong(entity, tuTao)` (`apps/app/components/crm/fields/use-bo-tri-truong.ts`): đang tải hay lỗi thì rơi về
  thứ tự mặc định.
- Danh mục trường chuẩn ở app (`apps/app/components/crm/fields/truong-chuan.ts`): `nhanTruongChuan`,
  `kieuTruongChuan`, `khoaTruongChuan`; khoá và tập bắt buộc ở `@crm/db/fields-chuan` (`STANDARD_FIELD_KEYS`,
  `REQUIRED_STANDARD_KEYS`, `isRequiredStandardKey`).
- `mucChiTiet(muc, tuTao)` lọc theo luật **phiếu** (bỏ trường chuẩn ẩn, bỏ trường tự tạo `showOnSheet=false`).
- Luật «bắt buộc ⇒ hiện trên phiếu» ở `fields.create`/`fields.update`; trường chuẩn bắt buộc không ẩn được.

## Quyết định

1. **Mặt thứ tư của bảng đăng ký: `oTao`.** `DongKieu` thêm mặt «ô form tạo» cho cả mười một kiểu, nhận bộ mô tả form
   (`MoTaTao`: khoá, nhãn, kiểu, giá trị nháp, `doi(giaTri)`, `loi`, `batBuoc`, lựa chọn, người dùng, tiền tệ). Ô form
   không lưu gì; nó đổi bản nháp của form. Đọc nhập theo kiểu dùng chung `docNhapTheoKieu` của DA14 (Số nhận
   «1.234,5»). Đây là đúng cột «Sửa và form tạo» của bảng ở `docs/design.md`.
2. **Một hàm chọn trường cho form tạo, cạnh `mucChiTiet`.** `mucFormTao(muc, tuTao)` trả các mục theo thứ tự bố trí,
   giữ mục khi: trường chuẩn không ẩn (trường chuẩn bắt buộc không ẩn được), hoặc trường tự tạo chưa lưu trữ có
   `required || showOnSheet`. Cùng tầng `truong-chuan.ts`, để luật form và luật phiếu nằm cạnh nhau.
3. **Trường chuẩn cũng đi qua bảng đăng ký trong form** (luật 30: không dựng ô riêng cho một trường ở màn). Ngoại lệ có
   tên như DA14: ô Công ty (`CompanyPicker`) và ô Giai đoạn. Luật riêng sẵn có của ô chuẩn đi theo bộ mô tả, không mất:
   chặn tên miền nền tảng (`nenTangCuaTenMien`), chuẩn hoá số điện thoại (`docSoDienThoai`), tiền tệ mặc định là tiền
   báo cáo.
4. **Thủ tục `create` nhận `fields`.** `companyCreateInput`, `contactCreateInput`, `dealCreateInput` thêm
   `fields: recordFieldValues.optional()`. Dịch vụ ghi qua `fields.applyValues(tx, …)` trong cùng giao dịch
   `withCrmEvents`, như `update` đang làm: một giá trị sai thì không có bản ghi nào.
5. **Máy chủ chặn thiếu trường bắt buộc lúc tạo** (Hỏi-3). Trong cùng giao dịch, trước khi ghi giá trị: mọi trường tự
   tạo chưa lưu trữ có `required` mà khoá vắng hay rỗng trong `fields` → `BAD_REQUEST`, câu tiếng Anh cho máy gọi. Áp ở
   dịch vụ nên cả tRPC lẫn REST và khoá API cùng chịu. Đường máy ghi thẳng Prisma (Gmail/Lịch, form theo dõi, tin
   đăng, công ty tự tạo từ tên miền) không đi qua `create`, nên không đổi.
6. **Lỗi giá trị mang khoá trường.** `FieldValueError` đã có `key`; lỗi trả về app mang khoá ấy (dữ liệu của lỗi tRPC,
   đọc qua `error-formatter.ts`), để form nói đúng ô: toast «Chưa tạo được <loại>.» nối câu theo kiểu của DA14
   (`truongKieu.tuChoi`), ô ấy hiện câu dưới ô, form giữ nguyên mọi giá trị. Không in `error.message`. Chỗ đặt khoá là
   một hằng dùng chung ở `packages/validation` mà formatter ghi và app đọc; kế hoạch S2 đọc `error-formatter.ts` để
   chọn. Lỗi «thiếu trường bắt buộc» cũng mang khoá, nên khi form không có ô ấy (danh sách trường tải lỗi) toast vẫn
   gọi tên trường bằng câu «<nhãn> không được để trống.». Fixture lỗi của bài kiểm app sinh từ lượt ném thật của bài
   kiểm API (`GHI_FIXTURE_LOI_TAO=1`, như `GHI_FIXTURE_BANG_COT` của DA17), không dựng tay.
7. **Kara chỉ điền trường còn trống.** `queueBackfillForNewRecord` nhận tập khoá đã có giá trị lúc tạo và bỏ chúng ra
   khỏi hàng chờ. Trường «Kara điền» để trống vẫn vào hàng như nay.
8. **Bắt buộc là bắt buộc, kể cả trường «Kara điền»** (Hỏi-1). `agentFilled` mặc định `true`, nên miễn trường Kara
   điền là miễn gần hết.
9. **Bản ghi cũ không bị chặn** (Hỏi-2). Luật «không xoá trống» giữ nguyên; sửa một ô khác trên phiếu không gửi khoá
   của trường bắt buộc còn trống, nên máy chủ không chặn — đúng như hôm nay, có bài kiểm giữ.
10. **Thêm nhanh theo cùng luật** (`docs/design.md`). Bớt đúng phần ngữ cảnh đã cấp: Công ty (là công ty đang mở);
    Người phụ trách hiện với giá trị điền sẵn từ ngữ cảnh như nay.
11. **Đang tải danh sách trường.** Form vẽ trường chuẩn theo thứ tự mặc định (luật của `useBoTriTruong`), trường tự tạo
    hiện khi `fields.list` về. Nút Tạo khoá tới khi `fields.list` về hoặc báo lỗi; lỗi thì vẫn tạo được bằng trường
    chuẩn và máy chủ vẫn chặn thiếu bắt buộc (quyết định 5).
12. **Ô tích chưa tích là để trống** (Hỏi-4). Xem bảng mặt «ô form tạo» ở cuối.

## Ngoài phạm vi

- Bắt buộc cho trường chuẩn không bắt buộc theo mô hình (Ngày chốt, Giá trị…) — DA15 Hỏi-2, hàng riêng.
- Đường máy ghi thẳng Prisma điền trường tự tạo lúc tạo.
- Nhắc trên phiếu «còn thiếu trường bắt buộc» cho bản ghi cũ.
- Lỗi lượt tạo không thuộc trường (trùng email hay điện thoại của cá nhân, tên miền trùng): giữ cách báo như nay.
- Thêm nhanh Công ty, nhập CSV.
- Thứ tự cột bảng, thẻ Kanban (DA17); lọc (DA18); kiểu Tệp (DA19).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: trang danh sách › nút Tạo (hoặc phiếu công ty › Thêm cá nhân / Thêm thoả thuận) → form hiện trường chuẩn và
  trường tự tạo theo thứ tự ở Cài đặt › Trường → người điền, bấm Tạo → toast «Đã tạo …», phiếu bản ghi mở với đủ giá
  trị (điểm ra: phiếu bản ghi; thêm nhanh thì về danh sách trong phiếu công ty).
- Biên: loại chưa có trường tự tạo nào (form như nay cộng các trường chuẩn đang hiện) · trường tự tạo kiểu Chọn mà mọi
  lựa chọn đã lưu trữ · danh sách trường đang tải hay tải lỗi (quyết định 11).
- Lỗi & quay lại: để trống trường bắt buộc → câu «<nhãn> không được để trống.» dưới ô, con trỏ về ô đầu tiên lỗi, không
  gửi · gõ sai kiểu → câu theo kiểu của DA14 dưới ô · máy chủ từ chối → toast «Chưa tạo được <loại>.» + câu theo kiểu,
  ô ấy hiện câu, form giữ giá trị, người sửa rồi bấm Tạo lại · đóng form khi đã gõ → bộ giữ thay đổi hỏi lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Sheet Tạo công ty | tạo một công ty với đủ trường | trang Công ty / phiếu công ty mới |
| Sheet Tạo cá nhân | tạo một cá nhân với đủ trường | trang Cá nhân / phiếu cá nhân mới |
| Sheet Tạo thoả thuận | tạo một thoả thuận với đủ trường | trang Thoả thuận / phiếu thoả thuận mới |
| Thêm nhanh cá nhân | thêm một cá nhân vào công ty đang mở | phiếu công ty / danh sách cá nhân của phiếu |
| Thêm nhanh thoả thuận | thêm một thoả thuận vào công ty đang mở | phiếu công ty / danh sách thoả thuận của phiếu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-formtao-dangtai | cả năm form | trường chuẩn theo thứ tự mặc định; chỗ trường tự tạo là khung xương một hàng; nút Tạo khoá | chờ |
| ST-formtao-loitai | cả năm form | trường chuẩn; không trường tự tạo; nút Tạo mở | tạo bằng trường chuẩn, hay đóng mở lại |
| ST-formtao-sansang | cả năm form | trường bắt buộc và trường đang hiện trên phiếu, theo thứ tự bố trí | điền, bấm Tạo |
| ST-formtao-thieubatbuoc | cả năm form | «<nhãn> không được để trống.» dưới ô, con trỏ về ô ấy | điền ô, bấm Tạo lại |
| ST-formtao-saikieu | cả năm form | câu theo kiểu dưới ô (Số «Ô này nhận số, ví dụ 1.234,5») | sửa ô |
| ST-formtao-maychutuchoi | cả năm form | toast «Chưa tạo được <loại>.» + câu theo kiểu; câu dưới ô bị từ chối; giá trị giữ nguyên | sửa ô, bấm Tạo lại |
| ST-formtao-dangtao | cả năm form | nút Tạo có vòng quay, các ô khoá | chờ |
| ST-formtao-dong | cả năm form | hộp hỏi bỏ thay đổi khi đã gõ | ở lại hay bỏ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thứ tự ô theo `fields.layout`; ô Giai đoạn của thoả thuận giữ chỗ như nay, ngay sau Công ty.
- Ô bắt buộc mang dấu bắt buộc của `FieldLabel` như ô Tên hôm nay; Chọn và Người bắt buộc không có lựa chọn «Không có».
- Kiểm ở lúc bấm Tạo, không kiểm khi rời ô; Enter trong ô chữ một dòng là bấm Tạo.
- Ô thêm nhanh dài hơn nay khi đội bật nhiều trường hiện trên phiếu; form cuộn trong khung của nó, không đẩy phiếu
  công ty.
- 375: mỗi ô một hàng đầy chiều rộng; không cuộn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `KIEU_TRUONG` + mặt `oTao` | mở rộng | DA14 dựng bảng; DA16 thêm cột «form tạo» đúng như `docs/design.md` hứa |
| `Field`, `FieldLabel`, `FieldError`, `FieldGroup` (`@crm/ui`) | dùng | form tạo hôm nay đã dùng; ô form dựng bằng chúng |
| `Input`, `Checkbox`, `Select`, `DatePicker`, `MoneyInput` (`@crm/ui`) | dùng | đúng cột «Sửa và form tạo» của bảng kiểu |
| `CompanyPicker` | dùng | ngoại lệ có tên của DA14 |
| `Sheet`, `SheetClose`, `QuickAddForm` | dùng | khung form và bộ giữ thay đổi đã có |

Không dựng thành phần mới trong `packages/ui` (vùng làn Mac Studio, luật 31). Bậc dừng: bậc 1 (`packages/ui`) — đã tra
`field.tsx`, `input.tsx`, `checkbox.tsx`, `select.tsx`, `date-picker`, `money-input` trong `packages/ui/src/components`.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — năm form đã là một cột trong sheet; vòng chỉ thêm hàng, không đổi khuôn. Không tra mẫu ngoài.
<!-- UX-SPEC-TEMPLATE>>> -->

## Bảng mặt «ô form tạo» theo kiểu

| Kiểu | Ô form | Đọc nhập |
|---|---|---|
| Chữ, Liên kết, Email, Điện thoại | `Input` đúng `type` | `docNhapTheoKieu` |
| Chữ dài | ô nhiều dòng | nguyên văn |
| Số | `Input` `inputMode="decimal"` | «1.234,5» ở vi, «1,234.5» ở en |
| Tiền | `MoneyInput` | như ô tiền hôm nay |
| Ngày | `DatePicker` | ngày địa phương |
| Chọn | `Select` lựa chọn chưa lưu trữ; «Không có» khi không bắt buộc | id lựa chọn |
| Người | `Select` người trong đội; «Chưa giao» khi không bắt buộc | id người |
| Ô tích | `Checkbox` có nhãn là nhãn trường | tích → `true`; chưa tích → không gửi khoá (Hỏi-4) |

Ô tích (Hỏi-4, theo khuyến nghị): trong form tạo, ô chưa tích là **để trống** — không gửi khoá, Kara điền được nếu
bật «Kara điền»; tích thì gửi `true`. Vì vậy «Ô tích bắt buộc» nghĩa là phải tích. Trên phiếu, ô tích vẫn lưu
`true`/`false` như DA14.
