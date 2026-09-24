# Ô số tiền đọc theo tiếng đang dùng — design

Ngày: 2026-09-24 · Hồ sơ: `_acceptance/o-so-tien-doc-theo-tieng/` · Hạng: T2

## Vấn đề

Ba ô nhập số tiền thoả thuận đọc chuỗi người gõ bằng `Number.parseFloat`:

- tấm tạo thoả thuận (`apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx`),
- ô sửa tại chỗ trên tấm thoả thuận (`apps/app/components/crm/record-sheet/deal-sheet.tsx`),
- ô thêm nhanh thoả thuận từ tấm công ty (`apps/app/components/crm/record-sheet/quick-add.tsx`) — đề bài nêu hai chỗ đầu, chỗ thứ ba cùng lỗi, cùng dữ liệu.

Màn hiển thị tiền theo tiếng Việt (`150.000.000 ₫`), nên người gõ `150.000.000` và
thoả thuận lưu là 150; `1.500.000,50` thành 1,5. Tấm tạo còn tệ hơn: chuỗi không đọc
được thành `null` mà không báo gì. Tổng cột, biểu đồ, báo cáo sai theo, vì
`baseAmount` quy đổi từ đúng con số sai đó.

Ô sửa tại chỗ còn lỗi ngược chiều: khi mở sửa, nó hiện `String(amountCents / 100)`
(`1500000.5`) — chuỗi kiểu tiếng Anh ngay trong màn tiếng Việt.

## Hướng đã chọn

Một ô dùng chung `MoneyInput` trong `packages/ui`, đứng trên `Input` sẵn có, và một
bộ đọc thuần `parseMoneyInput` / `formatMoneyInput` trong `packages/ui/src/lib/money-input.ts`.
Cả ba chỗ dùng ô này; không chỗ nào tự đọc chuỗi nữa.

### Vì sao không dùng `@reui/number-field`

Đã chạy `bun run ui:add @reui/number-field --dry-run` trong `packages/ui` (không cài):

- kéo theo `@base-ui/react` — thư viện nền thứ hai bên cạnh Radix của kho (`radix-nova`);
- ghi đè `src/components/label.tsx` của kho;
- bộ đọc số của Base UI dễ dãi theo thiết kế: trong tiếng Việt nó bỏ dấu nhóm rồi đọc
  `1.5` thành 15 — đúng loại «đoán» mà việc này phải chặn; muốn chặn phải bọc một bộ
  đọc thứ hai quanh bộ đọc của nó;
- nút cộng/trừ và vùng kéo-chỉnh vô nghĩa với số tiền chín chữ số; nhóm có `rounded-lg`
  và chữ canh giữa, lệch `docs/design.md` (ô nhập là `rounded-md`).

Phần đáng lấy của nó — `tabular-nums`, `inputMode` — lấy thẳng vào `MoneyInput`.

## Luật đọc

Dấu nhóm và dấu thập phân lấy từ `Intl.NumberFormat(locale).formatToParts`, không viết
cứng: vi → nhóm `.`, lẻ `,`; en → nhóm `,`, lẻ `.`. Số chữ số lẻ lấy từ
`minorUnitsOf(currency)` của `@crm/db/currency` (VND, JPY: 0; mười đồng còn lại: 2).

Sau khi bỏ khoảng trắng hai đầu, chuỗi được nhận khi và chỉ khi khớp:

`(nhóm-1-đến-3-chữ-số (dấu-nhóm 3-chữ-số)+ | chữ-số+) (dấu-lẻ chữ-số+)?`

và số chữ số lẻ ≤ số chữ số lẻ của đồng tiền. Kết quả là một trong:

| Kết quả | Khi nào |
|---|---|
| `empty` | chuỗi rỗng sau khi bỏ khoảng trắng |
| `ok` + `cents` | khớp mẫu, lẻ trong hạn, `cents` là số nguyên an toàn |
| `invalid: negative` | bắt đầu bằng `-` hoặc `−` |
| `invalid: otherLocale` | không nhận được theo tiếng này, nhưng NHẬN ĐƯỢC theo tiếng kia |
| `invalid: fraction` | khớp mẫu nhưng lẻ vượt hạn của đồng tiền (và tiếng kia không nhận) |
| `invalid: tooLarge` | khớp nhưng vượt số nguyên an toàn |
| `invalid: format` | mọi trường hợp còn lại (dấu nhóm lệch, ký tự lạ, dấu lẻ trơ trọi) |

`cents` tính từ chữ số, không qua số thực: `phần-nguyên × 100 + phần-lẻ đệm đủ 2 chữ số`
(giữ đúng quy ước vận chuyển ×100 của `docs/currency.md`).

Một chuỗi hợp lệ theo tiếng đang dùng được đọc theo tiếng đó, không đoán: trong tiếng
Việt `1.500` là một nghìn năm trăm với mọi đồng tiền. Dòng đọc lại dưới ô cho người thấy
máy đã đọc gì trước khi lưu. Cặp dễ nhầm nhất — một dấu và đúng ba chữ số phía sau
(`1,500` trong tiếng Việt) — không bao giờ lọt thành phần lẻ, vì không đồng nào trong
mười hai đồng có ba chữ số lẻ; nó rơi vào `otherLocale` khi tiếng kia đọc được.

## Ô `MoneyInput`

- `Input` của kho, `inputMode` = `numeric` cho đồng không lẻ, `decimal` cho đồng có lẻ,
  `autoComplete="off"`, `spellCheck={false}`, chữ `tabular-nums`, không chặn dán.
- Placeholder là số mẫu theo tiếng và đồng tiền (`150.000.000` / `150,000,000`), không có `…`
  vì dấu chấm lửng trong một ô số dễ bị đọc thành một phần của số.
- Dưới ô, một dòng `aria-live="polite"` nối vào ô bằng `aria-describedby`:
  đọc được → «Đọc là 150.000.000 ₫» (định dạng bằng `formatMoney` sẵn có);
  không đọc được → câu lỗi theo lý do, có cách sửa và một số mẫu đúng tiếng, và ô mang
  `aria-invalid`. Rỗng → không có dòng.
- Đổi đồng tiền (ô bên cạnh) thì đọc lại ngay với số chữ số lẻ mới.
- Rời ô khi đọc được → chữ trong ô được nhóm lại theo chuẩn (`150000000` → `150.000.000`);
  không đọc được → để nguyên chữ người gõ.
- Không tự chèn dấu nhóm trong lúc gõ từng phím: làm vậy phải đoán một dấu người vừa gõ
  là nhóm hay lẻ, và con trỏ nhảy. Dòng đọc lại làm cùng việc — cho người thấy số — mà
  không đoán. Chấp nhận «hiển thị số đã nhóm khi đang gõ» ở dạng dòng đọc lại.
- Chỗ gọi truyền được một phần tử đứng cạnh ô (ô chọn đồng tiền của tấm tạo).

## Ba chỗ dùng

- **Tấm tạo**: ô số tiền + ô chọn đồng tiền trong cùng hàng. Bấm Tạo khi số tiền không đọc
  được → không gửi gì, focus về ô số tiền, câu lỗi vẫn hiện. Nút Tạo không bị khoá vì số
  tiền. Gửi kèm đồng tiền đang hiện (`resolvedCurrency`), để đồng tiền đọc và đồng tiền lưu
  là một.
- **Ô sửa tại chỗ**: `InlineMoneyField` mới trong `apps/app/components/crm/inline-field.tsx`.
  Mở sửa hiện số hiện có theo tiếng (`1.500.000,50`). Enter hoặc rời ô khi đọc được → lưu
  `amountCents`; rỗng → lưu `null`; không đọc được → ở lại chế độ sửa với câu lỗi, không
  lưu, không toast. Esc → bỏ, về giá trị cũ.
- **Thêm nhanh**: đọc theo đồng tiền báo cáo (`currency.settings.reportingCurrency`), gửi kèm
  đồng tiền đó; chưa tải xong thiết lập thì nút Tạo chưa bật. Không đọc được → không gửi,
  focus về ô.

Hai khoá chuỗi `amountNotNumber` (trong `apps/app/lib/messages`) hết người dùng → xoá.
Câu của ô sống trong `packages/ui/src/lib/messages.ts`, nhóm `soTien`, đủ vi và en.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở tấm tạo thoả thuận → gõ `150.000.000` → dòng dưới ô hiện «Đọc là 150.000.000 ₫» → Tạo (điểm ra: tấm thoả thuận mới, số tiền 150.000.000 ₫).
- Biên: đổi đồng tiền sau khi gõ (VND → USD) thì dòng đọc lại đổi theo; ô rỗng thì thoả thuận không có số tiền.
- Lỗi & quay lại: gõ `1.5` trong tiếng Việt → dòng dưới ô báo số viết theo kiểu tiếng Anh, kèm số mẫu → sửa chữ trong ô; bấm Tạo trước khi sửa → không gửi, focus về ô. Ở ô sửa tại chỗ, Esc bỏ thay đổi.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tấm tạo thoả thuận | tạo một thoả thuận | nút Thêm ở màn Thoả thuận / tấm thoả thuận mới |
| Tấm thoả thuận — mục Chi tiết | sửa từng trường của thoả thuận | bấm một thoả thuận / ở lại tấm |
| Tấm công ty — thêm nhanh thoả thuận | thêm thoả thuận cho công ty đang xem | nút thêm trong mục thoả thuận / danh sách thoả thuận của công ty |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-o-so-tien-rong | cả ba | ô trống, placeholder `150.000.000` (vi) / `150,000,000` (en), không có dòng dưới | gõ, hoặc bỏ trống |
| ST-o-so-tien-doc-duoc | cả ba | dòng dưới «Đọc là 150.000.000 ₫» / «Reads as ₫150,000,000» | lưu / tạo |
| ST-o-so-tien-tieng-kia | cả ba | ô viền đỏ, «Số này viết theo kiểu tiếng Anh. Ở đây dấu chấm nhóm nghìn, dấu phẩy là phần lẻ — ví dụ 1.500.000,50.» | sửa chữ |
| ST-o-so-tien-le-vuot | cả ba | ô viền đỏ, «VND không có phần lẻ — gõ số tròn, ví dụ 150.000.000.» | sửa chữ hoặc đổi đồng tiền |
| ST-o-so-tien-sai-dang | cả ba | ô viền đỏ, «Chưa đọc được số này. Dấu chấm nhóm nghìn, dấu phẩy cho phần lẻ — ví dụ 1.500.000,50.» | sửa chữ |
| ST-o-so-tien-am | cả ba | ô viền đỏ, «Số tiền không được âm.» | bỏ dấu trừ |
| ST-o-so-tien-qua-lon | cả ba | ô viền đỏ, «Số này quá lớn để lưu.» | sửa chữ |
| ST-tao-gui-khi-loi | tấm tạo | không gửi, focus về ô số tiền, câu lỗi giữ nguyên | sửa rồi Tạo lại |
| ST-sua-tai-cho-loi | tấm thoả thuận | vẫn là ô nhập, câu lỗi dưới ô, không lưu | sửa, hoặc Esc để bỏ |
| ST-sua-tai-cho-dang-luu | tấm thoả thuận | vòng quay như các trường khác | chờ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Enter lưu (ô sửa tại chỗ) hoặc gửi biểu mẫu (tấm tạo, thêm nhanh); Esc bỏ ở ô sửa tại chỗ.
- Rời ô: đọc được thì nhóm lại chữ; không đọc được thì để nguyên chữ.
- Gửi khi lỗi: focus về ô số tiền; nút gửi không bị khoá vì số tiền.
- Dán không bị chặn; chuỗi dán được đọc như chuỗi gõ.
- Dòng dưới ô: `aria-live="polite"`, ô trỏ tới nó bằng `aria-describedby`; số trong dòng mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Input` (`@crm/ui/components/input`) | dùng | ô nhập của kho, đã có kiểu `aria-invalid` |
| `formatMoney` (`@crm/ui/lib/format`) | dùng | cùng hàm hiện tiền ở mọi màn, nên dòng đọc lại giống hệt chỗ hiện số |
| `MoneyInput` (`@crm/ui/components/money-input`) | tạo | `@reui/number-field` kéo thư viện nền thứ hai và đọc số dễ dãi (xem trên) |
| `InlineMoneyField` (`apps/app/components/crm/inline-field.tsx`) | ghép | `InlineField` sẵn có + `MoneyInput`, cùng hình với các trường tại chỗ khác |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên, không tra — việc này chỉ đổi một ô trong ba biểu mẫu một cột đã có; không màn, không bước mới.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- Bộ đọc: ma trận viết trước vi/en × VND/USD × bảy dạng chuỗi, mỗi ô ghi sẵn kết quả;
  JPY đi cùng nhánh VND. Vòng tròn `formatMoneyInput` → `parseMoneyInput` trên các giá trị
  sinh từ chính hàm ghi (người viết thật), không tự dựng chuỗi đúng khuôn bên đọc.
- Ô và ba chỗ dùng: bài kiểm DOM (`*.dom.tsx`, chạy trong `bun run test`) với tRPC giả,
  bắt đúng `amountCents` gửi đi.
- Màn thật: một script Chrome (khuôn `man-that-lib.mjs` của kho) gõ vào màn thật ở 375 và
  1440, vi và en, chụp dòng đọc lại và câu lỗi, rồi đọc `deals.byId` để so số đã lưu.

## Ngoài phạm vi

Xem `## Out of scope` của contract và sổ quyết định.
