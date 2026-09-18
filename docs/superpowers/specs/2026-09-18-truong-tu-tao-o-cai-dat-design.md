# Trường tự tạo có đường vào ở Cài đặt — thiết kế

Ngày 2026-09-18 · hồ sơ `_acceptance/truong-tu-tao-o-cai-dat/` · T2

## Vì sao vòng này tồn tại

Kho đã có trường tự tạo từ 2026-08-06. Ba bảng dữ liệu, mười kiểu trường, mười
một điểm cuối API, một màn quản trị đã Việt hoá. Chính chủ kho mở buổi khai
thác 2026-09-18 với đề bài «hãy làm custom field» — nghĩa là tính năng tồn tại
mà không ai tìm thấy.

Hai chỗ hở, không phải thiếu năng lực:

1. Màn quản trị chỉ mở được từ trong thẻ hồ sơ, qua tham số trên địa chỉ. Trang
   Cài đặt có bảy mục trên thanh bên, không mục nào cho trường. HubSpot đặt nó ở
   `Settings › Properties`, Salesforce ở `Setup › Object Manager`. Người quản trị
   đi tìm ở Cài đặt và không thấy.
2. Bộ gợi ý trường là của một CRM Mỹ: vùng bán hàng AMER / EMEA / APAC, phân
   khúc Enterprise / Mid-Market / SMB. OneHub làm tài chính và bất động sản ở
   Việt Nam. Cá nhân và Thoả thuận không có gợi ý nào.

## Cái đã có, không chạm

- `packages/db/prisma/schema.prisma` — `FieldDefinition`, `FieldOption`,
  `FieldValue`, enum `FieldEntity` ba giá trị, `FieldType` mười giá trị.
- `apps/api/src/fields/` — mười một điểm cuối: liệt kê, tra theo khoá, lọc được,
  độ phủ, tạo, sửa, xếp lại, lưu trữ, khôi phục, xoá, gieo lại.
- `apps/app/components/crm/fields/` — `FieldsList` và `FieldEditor` nhận dữ liệu
  qua thuộc tính, không phụ thuộc khay trượt; `FieldsSheetHost` là vỏ khay.

Vòng này **không sửa khay trượt**. Nó đang chạy, đã Việt hoá, và đường vào từ
thẻ hồ sơ không được hồi quy. Giá phải trả: khoảng bốn mươi dòng điều phối thẻ
và ô sửa bị lặp ở trang mới. Nhận giá đó để khỏi gây hồi quy.

## Cái vòng này thêm

### Đường vào

Thanh bên Cài đặt thêm một mục, nhãn **Trường**, đặt sau Tiền tệ vì cùng nhóm
hình dạng dữ liệu. Nhãn là "Trường" chứ không phải "Trường tự tạo": màn đó hiện
cả trường chuẩn của hệ thống lẫn trường người tạo, nên chữ "tự tạo" nói hẹp hơn
thứ người thấy.

Chữ "Trường" chưa có mục trong từ điển sản phẩm. Vòng này thêm mục cho nó.

### Trang mới

`/settings/fields` dùng vỏ trang chuẩn, cùng khuôn trang Tiền tệ. Ba thẻ Công ty,
Cá nhân, Thoả thuận. Thẻ đang mở giữ trên địa chỉ.

**Cái bẫy phải tránh:** `RecordSheetHost` được lắp ở bố cục chung của khu làm
việc, nên khay trượt có mặt trên cả trang Cài đặt. Khay mở khi tham số
`manageFields` có giá trị. Nếu trang mới dùng chung tham số đó, vào Cài đặt sẽ
thấy khay đè lên trang. Trang mới dùng **nhóm khoá riêng** khai trong
`SEARCH_PARAM`, và bài kiểm trùng khoá có sẵn canh chỗ này.

### Bộ gợi ý

Thay trọn nội dung `FIELD_TEMPLATES`, giữ nguyên cơ chế. Cơ chế đã lọc bỏ khoá
đã tồn tại, nên gợi ý nào trùng trường có sẵn sẽ tự ẩn.

**Chín khoá phải tránh trên Cá nhân.** Vòng tiếp thị tuyển đối tác đã gieo chín
trường, khoá cố định, `agentFilled` tắt (`apps/api/src/listings/listings-config.ts`):
`san_luong` · `tin_dang` · `tin_moi_30_ngay` · `dia_ban` · `hinh_thai` ·
`chung_chi` · `ten_chuyen_trang` · `trang_nhatot` · `san_cap_nhat_luc`. Hai
trường tôi định đề xuất, Địa bàn và Chứng chỉ, nằm trong đó nên đã bỏ.

Bộ chốt tại buổi thiết kế 2026-09-18, owner đồng ý:

| Thực thể | Nhãn | Kiểu | Lựa chọn |
|---|---|---|---|
| Cá nhân | Phân khúc chuyên | SELECT | Căn hộ · Nhà phố · Đất nền · Cho thuê · Dự án |
| Cá nhân | Vai trò trong sàn | SELECT | Chủ sàn · Trưởng nhóm · Môi giới · Trợ lý |
| Cá nhân | Kênh liên lạc quen | SELECT | Zalo · Điện thoại · Email · Facebook |
| Cá nhân | Mức độ hợp tác | SELECT | Chưa tiếp xúc · Đang thăm dò · Đang hợp tác · Tạm dừng |
| Cá nhân | Người phụ trách | USER | |
| Công ty | Loại hình | SELECT | Sàn giao dịch · Công ty môi giới · Đại lý phân phối · Tổ chức tín dụng |
| Công ty | Phân khúc chính | SELECT | Căn hộ · Nhà phố · Đất nền · Cho thuê · Dự án |
| Công ty | Quy mô môi giới | SELECT | Dưới 10 · 10–50 · 50–200 · Trên 200 |
| Công ty | Mức độ hợp tác | SELECT | Chưa tiếp xúc · Đang thăm dò · Đang hợp tác · Tạm dừng |
| Công ty | Nguồn quen | SELECT | Giới thiệu · Hội thảo · Tự tìm · Chiến dịch gọi |
| Công ty | Người phụ trách | USER | |
| Thoả thuận | Hình thức hợp tác | SELECT | Giới thiệu khách · Phân phối dự án · Đồng môi giới · Cung cấp dữ liệu |
| Thoả thuận | Nguồn thoả thuận | SELECT | Giới thiệu · Hội thảo · Chiến dịch gọi · Tự tìm |
| Thoả thuận | Tỷ lệ chia hoa hồng | NUMBER | |
| Thoả thuận | Người phụ trách | USER | |

Kiểu dùng đúng ba giá trị mà `FieldTemplate` đã cho: SELECT, USER, NUMBER. Không
mở rộng kiểu.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt → mục Trường → trang mở thẻ Công ty → bấm một gợi ý → trường
  tồn tại, hiện trong danh sách đang dùng (điểm ra: ở lại trang, danh sách đã có
  trường mới)
- Biên: thực thể chưa có trường nào tự tạo → hiện trạng thái rỗng kèm gợi ý;
  mọi gợi ý đã tạo hết → khối gợi ý biến mất, không hiện khối trống
- Lỗi & quay lại: tải danh sách lỗi → hiện lời lỗi kèm nút thử lại; tạo trường
  trùng khoá → lời lỗi ngay trong ô sửa, ô không đóng, người sửa nhãn rồi lưu lại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Trường | cho người quản trị nhìn và sửa hình dạng dữ liệu của một thực thể | từ thanh bên Cài đặt / ở lại trang sau mỗi việc |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-truong-dangtai | Cài đặt › Trường | vòng chờ giữa vùng nội dung | chờ |
| ST-truong-rong | Cài đặt › Trường | «Chưa có trường tự tạo nào» kèm khối gợi ý của thực thể đang mở | bấm một gợi ý, hoặc bấm Tạo trường |
| ST-truong-loi | Cài đặt › Trường | «Chưa tải được các trường của bạn» kèm nút «Thử lại» | bấm thử lại |
| ST-truong-codanhsach | Cài đặt › Trường | ba nhóm: trường chuẩn, trường đang dùng, trường đã lưu trữ | sửa, xếp lại, lưu trữ, tạo mới |
| ST-truong-dangsua | Cài đặt › Trường | ô sửa một trường: nhãn, khoá, kiểu, lựa chọn, các ô hiển thị | lưu thay đổi, hoặc quay lại danh sách |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thẻ đang mở giữ trên địa chỉ, tải lại trang vẫn đúng thẻ đó
- Vào trang không được bật khay trượt: nhóm khoá tham số của trang khác nhóm của khay
- Khổ hẹp: ba thẻ cuộn ngang, cùng nếp thanh bên Cài đặt đang dùng
- Bàn phím: ba thẻ đi được bằng mũi tên, ô sửa đóng bằng Esc

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `FieldsList` | dùng | đã nhận dữ liệu qua thuộc tính, không dính khay trượt |
| `FieldEditor` | dùng | cùng lý do |
| `PageShell` | dùng | vỏ chuẩn của mọi trang Cài đặt |
| `Tabs` | dùng | khay trượt đã dùng đúng bộ này cho ba thực thể |
| trang Trường | ghép | chỉ điều phối thẻ và ô sửa, không vẽ gì mới |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên, không tra mẫu. Danh sách trường là bên trái của quan
hệ, ô sửa một trường là bên phải. HubSpot và Salesforce đều dựng màn trường theo
đúng khuôn này, và khay trượt của kho cũng vậy, nên giữ một khuôn cho hai đường
vào là thứ người dùng đã biết.
<!-- UX-SPEC-TEMPLATE>>> -->

## Tệp sẽ sửa

| Người dùng thấy gì khác | Đụng đâu |
|---|---|
| Thanh bên Cài đặt có thêm mục Trường | `settings-sidebar.tsx` |
| Mục đó có nhãn đúng tiếng của người đang dùng | `lib/messages/settings.ts` |
| Bấm vào mục thì ra trang quản trị trường | `settings/fields/page.tsx` (mới) |
| Trang có ba thẻ và ô sửa, không bật khay trượt | `settings/fields/fields-settings.tsx` (mới) |
| Địa chỉ giữ thẻ đang mở mà không đụng khay | `lib/search-param-keys.ts` |
| Gợi ý trường là của môi giới Việt, cả ba thực thể | `packages/validation/src/field-templates.ts` |
| Chữ «Trường» có mục trong từ điển sản phẩm | `CONTEXT.md` |

## Cách chứng minh nó chạy

- Thước tĩnh cho bộ gợi ý (`rang/bo-goi-y.mjs`): cả ba thực thể có gợi ý; không
  gợi ý nào trùng chín khoá bộ cào; mọi nhãn mang dấu tiếng Việt; không còn dấu
  vết bộ cũ. Cặp hai chiều: chèn một khoá trùng vào bản sao thì thước đỏ và gọi
  tên đúng khoá đó.
- Thước trên trình duyệt thật (`rang/trang-truong.mjs`): từ Cài đặt thấy mục
  Trường, bấm ra trang, ba thẻ đúng nhãn, chọn một gợi ý thì trường tồn tại qua
  API. Đột biến: xoá mục khỏi thanh bên thì thước đỏ và gọi tên mục.
- Thước không-bật-khay: mở trang, khẳng định khay trượt không có trên màn. Đột
  biến: đổi nhóm khoá của trang thành khoá của khay thì thước đỏ.
- Ca thêm vào bài kiểm khoá tham số đang có.
- Bốn lệnh cổng của kho, cộng lệnh dựng.

## Ngoài phạm vi

- Sửa khay trượt — đang chạy, đã Việt hoá; vòng này chỉ thêm đường vào.
- Quyền sửa trường theo vai trò — ô riêng, chạm xác thực nên là T3.
- Kiểu tiền tệ, kiểu nhiều lựa chọn, trường tính toán — ô riêng.
- Tìm kiếm trường, lọc theo người tạo, gom nhóm trường — HubSpot có, ta chưa
  cần: mỗi thực thể dưới hai mươi trường.
- Xoá cứng trường từ giao diện — cố ý không có; giao diện chỉ cho lưu trữ mềm.
- Trường cho thực thể ngoài ba cái đã có — mô hình dữ liệu chỉ có ba.
