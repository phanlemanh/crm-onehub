# Lọc mọi trường — thiết kế

Hàng DA18 `loc-moi-truong` của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511), dãy R2 của đợt
`viec-du-an-kho-tai-lieu`. Câu giao: «Nhân viên quan hệ đối tác lọc danh sách theo trường chữ, số, ngày, ô tích hay
ô trống, và lưu bộ lọc ấy cho cả Thoả thuận». Mã phạm vi L3, L4, L5 của `docs/plan/pham-vi-truong-hop-dong.md`.
Cổng Đáng: build, manh, 2026-10-21T06:19:17Z. Mốc đợt 22/10.

Soạn trên giấy theo luật 43 của đợt: hàng này chưa viết mã tới khi DA17 `sort-moi-truong` (#521) gộp. Thiết kế đọc
onehub `c6a718f3d` và nhánh DA17 `feat/sort-moi-truong` (`a4b1845be`, chỉ đọc).

Đã đọc: `AGENTS.md`, `docs/design.md` (mục «Trường», «Chip lọc và chuyển kiểu xem», «Danh sách»), `docs/api.md`
(mục tRPC, cache), `docs/vong-doi.md` (ba câu — không áp: hàng không thêm loại bản ghi hay trạng thái kết thúc),
`docs/plan/dynamic-fields.md` §7, thiết kế `2026-10-14-loc-va-kieu-xem-chung`, hợp đồng và sổ của DA17, skill
`nuqs`, `web-design-guidelines` (luật nhập liệu, URL phản ánh bộ lọc), `morphological-scan`.

## Hiện trạng trên onehub `c6a718f3d`

| Chỗ | Hôm nay |
|---|---|
| Trường nào lọc được | `FieldsService.filterableFieldsFor` chỉ lấy `SELECT`, `USER` có `showOnFilter`. Ô «Hiện trong bộ lọc» ở Cài đặt › Trường chỉ hiện cho hai kiểu ấy (`field-editor.tsx:181`). |
| Cách lọc | `fieldFilters` dịch `{khoá: [id…]}` thành `fieldValues.some` theo `optionId` hay `userId`. Không có «trống», không có chữ, số, ngày, ô tích. |
| Trường tắt «Hiện trong bộ lọc» | Bộ lọc đã lưu mang khoá của nó bị bỏ qua lặng lẽ: `fieldFilters` chỉ tra trong danh sách `filterableFieldsFor`. Số thành viên chiến dịch đổi theo. |
| Đường dẫn | Mặt lọc chuẩn: một khoá lặp mỗi mặt (`?stage=a&stage=b`). Trường tự tạo: một khoá JSON `?fields={"khoá":["id"]}` (`list-search-params.ts:34`). Hai cách. |
| Bộ lọc đã lưu | `SavedView.filters` = `{q, sort, dir, archived, filters: Record<string, string[]>}`; trường tự tạo nằm dưới khoá `field:<khoá>` (`use-table-query.ts`). Chiến dịch đọc đúng khuôn ấy (`campaigns.service.ts` `contactListFor`, tiền tố `FIELD_FILTER_PREFIX` ở `campaigns-config.ts`). |
| Thoả thuận | Không có `SavedViewsMenu`; Liên hệ và Công ty có. `SavedView.entity` đã nhận `DEAL`. |
| DA17 | Sort trường tự tạo là `sort=field:<khoá>` (`TIEN_TO_COT_TRUONG` ở `packages/db/src/fields-shape.ts`). `sapTheoTruong` nhận nguyên `where` của danh sách, nên đổi `where` không đụng đường sort. |

`FIELD_TYPES` (trường tự tạo) có mười kiểu: Chữ, Chữ dài, Số, Ngày, Ô tích, Chọn, Liên kết, Email, Điện thoại, Người.
Tiền chỉ là trường chuẩn (Giá trị), Tệp là DA19.

## Phương án

### 1. Một bảng «kiểu nào lọc thế nào»

Thêm một dòng mặt «lọc» cho mỗi kiểu ở `packages/db/src/fields-shape.ts`, cạnh bảng sort của DA17. Đây là chỗ duy
nhất quyết một kiểu lọc ra sao; API (dựng `where`), app (vẽ ô lọc nào), Cài đặt › Trường (kiểu nào bật được «Hiện
trong bộ lọc») và bộ phân tích giá trị lọc đều đọc nó.

| Kiểu | Cách lọc | Giá trị trên đường dẫn và trong bộ lọc đã lưu |
|---|---|---|
| Chữ, Chữ dài, Liên kết, Email, Điện thoại | chứa (không phân biệt hoa thường, như ô Tìm) | `has:<chữ>` |
| Số | khoảng, gồm hai đầu; một đầu cũng được | `gte:<số>`, `lte:<số>` (số viết dấu chấm thập phân, `1234.5`) |
| Ngày | mốc như Ngày chốt | `overdue` · `this-month` · `next-month` · `later` |
| Ô tích | Có / Không | `yes` · `no` (`no` gồm cả bản ghi chưa có giá trị) |
| Chọn | nhiều lựa chọn | id lựa chọn, như hôm nay |
| Người | nhiều người | id người, như hôm nay |
| mọi kiểu trừ Ô tích | trống | `none` |

Trong một trường: các giá trị là «hoặc» (`none` hoặc lựa chọn A); `gte` và `lte` là «và» với nhau rồi «hoặc» với
`none`. Giữa các trường và các mặt lọc chuẩn: «và», như hôm nay.

«Trống» khớp cả hai dạng trống mà DA17 đã đo: không có hàng `fieldValue`, và hàng có cột lưu là `null` (khoá ngoại
`SetNull` của lựa chọn hay người để lại).

Mốc Ngày tính như `closingFilter` (`deals.service.ts`): đầu tháng theo giờ máy chủ. Khác một chỗ: `overdue` của Ngày
chốt chỉ tính thoả thuận đang mở; trường Ngày tự tạo không có giai đoạn nên `overdue` là «trước hôm nay». Nhãn của mốc
ấy là câu Hỏi-1.

Tiền không vào bảng: không có trường Tiền tự tạo, và khoảng Tiền của Giá trị phải chọn tiền gốc hay quy đổi
(`docs/currency.md`) — để hàng sau.

### 2. Giá trị lọc phân tích ở biên

Một module `packages/validation/src/bo-loc-truong.ts` khai cú pháp giá trị (`has:`, `gte:`, `lte:`, mốc, `yes`/`no`,
`none`, id) bằng Zod và một hàm `phanTichLocTruong(kieu, gia: string[])` trả kiểu miền:
`{ kieu: "chua", chu } | { kieu: "khoang", tu?, den? } | { kieu: "moc", moc[] } | …`, mỗi loại mang cờ `trong`. API,
app và chiến dịch dùng chung nó (`AGENTS.md`: khuôn vượt ranh gói sống ở `packages/validation`).

- Khoá không có, trường đã lưu trữ, trường thuộc loại bản ghi khác: bỏ bộ lọc ấy, không lỗi — cùng luật với sort của
  DA17 (Hỏi-4 của DA17), vì bộ lọc đã lưu phải mở được sau khi trường bị lưu trữ.
- Trường còn sống mà giá trị sai cú pháp với kiểu của nó (`gte:abc` cho Số, `has:` cho Ngày): API trả `BAD_REQUEST`
  nêu tên trường. App không gửi giá trị như vậy: bộ đọc đường dẫn bỏ giá trị hỏng trước khi gọi API.
- Trường tắt «Hiện trong bộ lọc» không lọc, như hôm nay (theo khuyến nghị Hỏi-5): bộ lọc đã lưu mang trường ấy cho
  đúng kết quả nó cho hôm nay, nên không chiến dịch nào đổi thành viên khi hàng này lên production. Lối kia (áp lại bộ
  lọc cho mọi trường còn sống) sửa được lỗi cũ «tắt một ô ở Cài đặt là lặng lẽ đổi bộ lọc đã lưu», nhưng đổi thành viên
  chiến dịch ngay khi lên — việc khó đảo, nên là câu của người.

### 3. Lọc ở API: `FieldsService.fieldFilters` biết mọi kiểu

`fieldFilters(definitions, selected)` nhận danh sách của `filterableFieldsFor`, nay mở cho mọi kiểu có dòng ở bảng
mục 1 (theo Hỏi-5; lối kia thì nhận mọi trường còn sống), đọc bảng ở mục 1 và dựng `AND` của từng trường:

- chứa: `fieldValues.some({fieldId, text: {contains, mode: "insensitive"}})`;
- khoảng: `fieldValues.some({fieldId, number: {gte, lte}})`;
- mốc: `fieldValues.some({fieldId, date: {gte, lt}})` theo từng mốc, nối «hoặc»;
- Ô tích `yes`: `some({fieldId, bool: true})`; `no`: `none({fieldId, bool: true})`;
- trống: `fieldValues.none({fieldId, <cột của kiểu>: {not: null}})` — cùng điều kiện «có giá trị» mà `sapTheoTruong`
  của DA17 dùng (`coGiaTri`), nên sort và lọc đồng ý với nhau thế nào là trống.

Ba service (`companies`, `contacts`, `deals`) và `deals.board` đã gọi `fieldFilters` trong `where` với danh sách
`filterableFieldsFor`; chỗ gọi không đổi. Đầu vào `fields: Record<string, string[]>` của ba `*ListInput` và `dealBoardInput` giữ nguyên
khuôn, nên hợp đồng tRPC không đổi hình.

**Số đếm.** `filterFacetCounts` thêm đếm cho mọi giá trị có trong menu: `yes`/`no` của Ô tích, bốn mốc của Ngày, và
`none` của mọi kiểu trừ Ô tích. Chữ và Số (ô nhập) không có số đếm, chỉ «Trống» có. Đếm chạy cho trường bật «Hiện trong
bộ lọc», trong cùng `Promise.all` với lượt đếm đang có, và đếm bằng `count` nối theo quan hệ như hôm nay, không tải id.

### 4. Một cách mã hoá trên đường dẫn

Mỗi bộ lọc là một khoá đường dẫn lặp giá trị, mặt chuẩn và trường tự tạo như nhau. Khoá của trường tự tạo là
`field:<khoá>` — cùng chuỗi đã là khoá của nó trong `SavedView.filters` và là giá trị `sort` của DA17:

```
?stage=st_1&owner=unassigned&field:so_can=gte:5&field:so_can=lte:20&field:ngay_ky=this-month&field:ghi_chu=none
```

- Tham số JSON `fields` bỏ khỏi đường dẫn (`docs/design.md`: «Một cách mã hoá `nuqs` cho mọi trường; không tham số
  JSON riêng cho trường tự tạo»).
- Đường dẫn cũ mang `?fields={…}` vẫn mở ra đúng bộ lọc: bộ đọc chuyển nó sang khoá `field:<khoá>` và ghi lại đường
  dẫn theo cách mới (`history: replace`).
- Khoá trường tự tạo không biết trước lúc dựng bộ parser, nên `list-search-params.ts` thêm một parser theo tiền tố:
  đọc mọi khoá `field:*` từ `searchParams` ở máy chủ (`page.tsx` dựng đầu vào lần đầu) và ở máy khách (`useTableQuery`)
  bằng cùng một hàm, rồi ghi bằng `useQueryStates` với bộ parser mở rộng theo các khoá đang có. Máy chủ và máy khách
  ra cùng `ListInput` cho cùng đường dẫn. Chi tiết cách ghép nuqs để kế hoạch S2 quyết, sau khi DA17 gộp vào cùng tệp.
- `currentView` và `applyView` giữ nguyên khuôn `SavedViewFilters`: `filters` vẫn là `Record<string, string[]>` với khoá
  `field:<khoá>`. Không đổi khuôn lưu, không chép lại dòng `SavedView` nào, không migration.

### 5. Bộ lọc đã lưu cho Thoả thuận

`DealsTable` thêm `SavedViewsMenu entity="DEAL"` ở cùng chỗ Liên hệ và Công ty đặt nó (`leadingActions` của
`DataTable`). Bảng cột (Kanban) của Thoả thuận đọc cùng đường dẫn, nên áp một bộ lọc đã lưu ở bảng rồi chuyển sang bảng
cột vẫn giữ bộ lọc. Menu có mặt ở cả hai kiểu xem. Bộ lọc đã lưu của Thoả thuận không có số bản ghi (`size` chỉ đếm cho
Liên hệ, vì chiến dịch). Chiến dịch chỉ nhận bộ lọc của Liên hệ, không đổi.

Bộ lọc đã lưu có nhớ kiểu xem (Bảng / Bảng cột) hay không là câu Hỏi-2.

### 6. Ô lọc trong menu Bộ lọc

Menu Bộ lọc của `DataTable` hôm nay chỉ có mặt lọc dạng danh sách lựa chọn (`DataTableFacet.options`). Hàng này cần hai
dạng mới ở cùng menu:

- **ô chữ** «Chứa…» (Chữ, Chữ dài, Liên kết, Email, Điện thoại) kèm lựa chọn «Trống»;
- **khoảng số** «Từ» / «Đến» nhận cách viết Việt `1.234,5` (cùng bộ đọc số của ô Số DA14), kèm «Trống».

Ngày, Ô tích, Chọn, Người dùng dạng danh sách lựa chọn có sẵn, thêm «Trống» (Chọn: «Không chọn», Người: «Chưa giao»
theo `docs/design.md`).

`DataTable` và `packages/ui` là vùng của làn Mac Studio (luật 31). Hàng này gửi `cham-tep` cho
`packages/ui/src/components/data-table.tsx` (thêm `DataTableFacet.kieu: "luaChon" | "chu" | "khoang"`, mặc định
`luaChon` nên mặt lọc có sẵn không đổi) và dòng chữ mới ở `packages/ui/src/lib/messages.ts` (chỉ thêm dòng, luật 7).
Nút thu nhãn bộ lọc đang bật theo khuôn có sẵn: «Số căn: 5–20», «Ghi chú: trống».

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: danh sách Thoả thuận → «Bộ lọc» → chọn trường «Số căn» → gõ Từ 5, Đến 20 → bảng lọc ngay, nút Bộ lọc
  hiện «(1)», đường dẫn mang `field:so_can=gte:5&field:so_can=lte:20` → «Bộ lọc đã lưu» › «Lưu bộ lọc này» → đặt tên
  → bộ lọc có trong menu (điểm ra: danh sách đã lọc, chia sẻ được bằng đường dẫn).
- Biên: không trường nào bật «Hiện trong bộ lọc» → menu chỉ có mặt chuẩn như hôm nay. Bộ lọc đã lưu trỏ một trường đã
  lưu trữ → mở được, bộ lọc của trường ấy không còn tác dụng, không dòng báo (cùng luật với sort của DA17).
- Lỗi & quay lại: gõ chữ không phải số vào «Từ» → ô báo «Ô này nhận số, ví dụ 1.234,5» và không đổi đường dẫn; Từ lớn
  hơn Đến → không có bản ghi nào, trạng thái rỗng có nút «Xoá bộ lọc».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh sách Thoả thuận (bảng và bảng cột) | lọc và lưu bộ lọc thoả thuận | thanh bên / phiếu thoả thuận |
| Danh sách Công ty, Liên hệ | lọc theo mọi trường (đã có bộ lọc đã lưu) | thanh bên / phiếu |
| Cài đặt › Trường › sửa trường | bật «Hiện trong bộ lọc» cho mọi kiểu | Cài đặt / danh sách trường |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-loc-dong | Danh sách | nút «Bộ lọc», không số | mở menu |
| ST-loc-menu-chu | Menu Bộ lọc › trường Chữ | ô «Chứa…» và lựa chọn «Trống» có số đếm | gõ chữ / chọn Trống |
| ST-loc-menu-khoang | Menu Bộ lọc › trường Số | ô «Từ», «Đến» và «Trống» có số đếm | gõ số |
| ST-loc-menu-moc | Menu Bộ lọc › trường Ngày | Đã qua · Tháng này · Tháng sau · Sau đó · Trống, mỗi mục có số đếm | chọn mốc |
| ST-loc-menu-tich | Menu Bộ lọc › trường Ô tích | Có · Không, mỗi mục có số đếm | chọn |
| ST-loc-so-sai | Ô «Từ»/«Đến» | «Ô này nhận số, ví dụ 1.234,5» dưới ô | sửa số |
| ST-loc-dang-bat | Danh sách | «Bộ lọc (2)», bảng đã lọc | xoá hay đổi bộ lọc |
| ST-loc-rong | Danh sách | trạng thái rỗng «Không có thoả thuận nào khớp bộ lọc» + «Xoá bộ lọc» | xoá bộ lọc |
| ST-loc-dang-tai | Danh sách | khung xương của bảng, tiêu đề trang giữ nguyên | chờ |
| ST-loc-luu-thoa-thuan | Menu Bộ lọc đã lưu (Thoả thuận) | «Lưu bộ lọc này», danh sách bộ lọc đã lưu | lưu / áp / xoá |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô «Chứa…»: ghi đường dẫn sau khi ngừng gõ (như ô Tìm của bảng), `spellCheck={false}`, `autocomplete="off"`, nhãn có
  `aria-label` mang tên trường.
- Ô «Từ», «Đến»: `inputmode="decimal"`, nhận `1.234,5` và `1234.5`; giá trị hỏng không ghi đường dẫn. Trường trống
  một đầu là khoảng một đầu.
- Đổi bộ lọc đưa `page` về 1, như mặt lọc có sẵn.
- Dưới `md` menu Bộ lọc là menu con trên điện thoại có sẵn (`2026-10-08-menu-con-loc-dien-thoai`); hai ô mới nằm
  trong menu con của trường, không cuộn ngang ở 375.
- Chữ người dùng gõ vào ô lọc và nhãn lựa chọn mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DataTable` menu Bộ lọc | mở rộng (`cham-tep`, Mac Studio) | thêm dạng ô chữ và khoảng số vào mặt lọc, mặc định không đổi |
| `SavedViewsMenu` | dùng | đã chạy ở Liên hệ và Công ty |
| Bộ đọc số Việt của ô Số (DA14) | dùng | một cách đọc «1.234,5» |
| `Field`, `FieldDescription` (Cài đặt › Trường) | dùng | ô «Hiện trong bộ lọc» có sẵn, chỉ mở cho mọi kiểu |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — hàng thêm cách lọc vào danh sách có sẵn, không thêm màn; không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Câu hỏi cho Cổng Phạm vi

- **Hỏi-1.** Mốc «trước hôm nay» của trường Ngày tự tạo gọi là gì. Máy khuyên «Đã qua»: Ngày ký, Ngày gặp là ngày đã
  xảy ra, gọi «Quá hạn» là sai nghĩa. Lối khác: «Quá hạn» y như Ngày chốt — một chữ cho cả hai loại trường, nhưng sai
  nghĩa với ngày không phải hạn.
- **Hỏi-2.** Bộ lọc đã lưu của Thoả thuận có nhớ Bảng / Bảng cột không. Máy khuyên không: khuôn `SavedViewFilters` dùng
  chung ba loại bản ghi giữ nguyên, kiểu xem là lựa chọn của người xem. Lối khác: nhớ — thêm khoá `view` vào khuôn lưu
  (chỉ Thoả thuận dùng), mở bộ lọc «Đang chờ ký» là ra bảng cột luôn.
- **Hỏi-3.** Lọc «chứa» có bỏ dấu không («ha noi» khớp «Hà Nội»). Máy khuyên không bỏ dấu, như ô Tìm hôm nay (không
  phân biệt hoa thường, phân biệt dấu). Lối khác: bỏ dấu — cần extension `unaccent` của Postgres, tức migration, hàng
  lên T3, và ô Tìm lệch với ô lọc nếu chỉ làm một bên.
- **Hỏi-4.** Ngưỡng của Đường đo (ô Cổng Đáng để trống ngưỡng). Máy đề xuất: ở phiên nghiệm thu, ít nhất bốn trên năm
  người lọc được thoả thuận theo một trường Số trong khoảng và lưu thành bộ lọc mà không hỏi; dấu CHẾT là một chiến dịch
  đổi số thành viên sau khi hàng lên production mà không ai sửa bộ lọc của nó.
- **Hỏi-5.** Bộ lọc đã lưu mang một trường đang tắt «Hiện trong bộ lọc». Máy khuyên giữ kết quả hôm nay (trường ấy
  không lọc): không chiến dịch nào đổi thành viên khi lên production. Lối khác: áp lại bộ lọc cho mọi trường còn sống —
  đúng ý lúc lưu và gỡ lỗi «tắt một ô là đổi bộ lọc đã lưu», giá là chiến dịch có thể đổi thành viên ngay khi lên, không
  ai sửa gì. Việc khó đảo.
- **Hỏi-6.** Bỏ design-pass để giữ mốc. Máy khuyên bỏ: hai ô mới (Chứa…, Từ/Đến) ghép vào menu con có sẵn của
  `DataTable`, E10 đo mắt người ở S4. Lối khác: design-pass ngay sau #521 gộp, trước Cổng Phạm vi — nhìn bản bấm được
  trước khi duyệt, giá là Cổng Phạm vi và S3 lùi theo #521, sát mốc 22/10.

## Không làm trong hàng này

- Bộ lọc chữ, số cho trường chuẩn hôm nay chưa lọc được (Tên miền, Điện thoại, Giá trị…): câu giao và lý do của hàng
  chỉ nói `filterableFieldsFor`; mặt lọc chuẩn có sẵn chỉ đổi cách mã hoá và thêm «trống» không ai đòi.
- Khoảng Tiền của Giá trị (tiền gốc hay quy đổi, `docs/currency.md`).
- Lọc Tệp có / chưa có (DA19, đứng trên hàng này).
- Bộ lọc «hoặc» giữa hai trường, nhóm điều kiện lồng nhau.
- Đổi khuôn `SavedView.filters` hay chép lại dòng đã lưu.
- Số đếm cho ô chữ và khoảng số.
