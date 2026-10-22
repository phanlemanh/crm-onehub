# Trường chuẩn và «Bắt buộc» ở Cài đặt — DA15

Hàng DA15 của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511). Cổng Đáng: build, chủ kho 20/10
(«Tôi duyệt Cổng Đáng build cho cả 9 hàng.»). Mốc đợt 2026-10-22. Đứng trên DA14 (`truong-mot-cach-cu-xu`).

Câu giao: «Quản trị mở Cài đặt › Trường, thấy trường chuẩn bằng tiếng Việt khớp đúng phiếu, sắp lại và ẩn được
chúng, và bật «Bắt buộc» cho một trường».

Luật đích: `docs/design.md` mục «Trường»:

- «Phiếu: mục DETAILS theo thứ tự ở Cài đặt › Trường, không tách khối «trường tự tạo».»
- «Cài đặt › Trường. Trường chuẩn sắp lại và ẩn được; không xoá, không đổi kiểu. Danh sách trường chuẩn dịch theo
  locale và khớp đúng các trường trên phiếu.»

## Vì sao

Soát mã trên onehub `03d4842f1`:

- Cài đặt › Trường hứa «chỉ sắp lại thứ tự và ẩn» (`crm.ts` `standardNote`). Thực tế danh sách trường chuẩn là một
  khối gập chỉ đọc (`fields-list.tsx` `DisclosureRow`).
- Tên trường chuẩn viết cứng tiếng Anh ở `standard-fields.ts` («Close date», «Owner»…), không qua messages.
- Danh sách lệch phiếu. Liên hệ thiếu X. Thoả thuận có «Stage», mà Giai đoạn không phải hàng của mục Chi tiết.
- Không có chỗ nào lưu thứ tự hay trạng thái ẩn của trường chuẩn. `FieldDefinition` chỉ chứa trường tự tạo,
  `AppSetting` không có cột JSON. Trường tự tạo luôn đứng sau trường chuẩn trên phiếu.
- Ô «Bắt buộc» có trong mô hình (`FieldDefinition.required`) và máy chủ đã chặn để trống (`packages/db/src/fields.ts`
  `coerceValue`). Nhưng ô sửa trường không có công tắc nào cho nó, và lượt tạo luôn gửi `required: false`
  (`field-editor.tsx` `save`).

## Mục tiêu

1. Một danh mục trường chuẩn cho mỗi loại bản ghi, dùng chung cho phiếu và Cài đặt. Danh mục đúng bằng các hàng của
   mục Chi tiết trên phiếu, và tên trường hiện theo locale.
2. Một danh sách sắp được ở Cài đặt › Trường, trộn trường chuẩn với trường tự tạo. Thứ tự ở đó là thứ tự trên phiếu.
3. Trường chuẩn ẩn được khỏi phiếu, trừ trường bắt buộc theo mô hình dữ liệu. Ẩn không xoá giá trị.
4. Quản trị bật «Bắt buộc» cho một trường tự tạo. Một trường bắt buộc luôn hiện trên phiếu (Hỏi-4).

## Không làm (non-goals)

- Form tạo và ô thêm nhanh đọc bố trí (thứ tự, ẩn, bắt buộc): DA16.
- Thứ tự cột trên bảng, thẻ Kanban: DA17. Ẩn khỏi phiếu không ẩn cột; cột vẫn bật tắt ở bảng như nay.
- Ô đầu phiếu (`DetailSheetStat`) giữ như nay. Ẩn chỉ áp cho mục Chi tiết (Hỏi-6).
- Kara đọc bố trí: Kara vẫn đọc và ghi trường đã ẩn (Hỏi-6).
- Bố trí riêng từng người. Đây là cài đặt của không gian làm việc.
- Mô tả và Giai đoạn của thoả thuận. Chúng là mục riêng của phiếu, không phải hàng của mục Chi tiết; Giai đoạn có trang
  Cài đặt riêng (Hỏi-5).
- Ẩn trường bắt buộc khỏi phiếu (Hỏi-4).
- «Bắt buộc» cho trường chuẩn (Hỏi-2).

## Không được thành (anti-goals)

- Hai danh sách ở Cài đặt, một cho trường chuẩn và một cho trường tự tạo. Thứ tự là một, nên danh sách là một.
- Danh sách trường chuẩn viết lại lần thứ hai ở Cài đặt. Cài đặt đọc đúng danh mục mà phiếu vẽ.
- Ẩn mà mất dữ liệu: giá trị của trường đã ẩn còn nguyên ở API, ở bảng và với Kara.

## Ràng buộc

- Vùng: đợt làm chủ `apps/app/components/crm/fields/**`, `record-sheet/**`, `apps/api/src/fields/**`,
  `packages/db/src/fields*.ts` (luật 31). `packages/ui` và `DataTable` là của làn Mac Studio. DA15 chỉ ghép thành phần
  có sẵn (`SortableList`, `SortableItem`, `Switch`, `Badge`).
- Lưu bố trí cần một bảng mới, tức một migration ở `packages/db/prisma`: vòng lên **T3** (Hỏi-1). Migration theo luật 1–2
  của đợt: tên lấy giờ UTC thật, chỉ thêm, không trỏ bảng của migration xếp sau.
- `apps/app/lib/messages/*.ts` chỉ thêm dòng (luật 7). Các dòng cũ không còn dùng (`standardRow`, `standardNote`,
  `customGroup`) để nguyên, không sửa.
- Không chú thích trong mã. Phân tích ở biên: khoá trường chuẩn đọc bằng Zod ngay ở router.
- Đứng trên DA14. DA14 khai trường chuẩn thành bộ mô tả trong từng phiếu (`OTruongPhieu`, 22 dòng của E6 trong
  `_acceptance/truong-mot-cach-cu-xu/evals.yaml`). DA15 gom phần tĩnh của các bộ mô tả ấy về một danh mục. Tên hàm của
  DA14 đọc lại sau khi DA14 gộp; khác thì sửa bản kế hoạch, không sửa hợp đồng.
- Đã nạp `web-design-guidelines` (khoá `feature_loop.ui_standards_skill`). Ba luật áp vào màn này: kéo thả phải có lối
  bàn phím, công tắc có tên truy cập, điều khiển bị khoá nói vì sao.

## Cách làm (máy quyết, căn cứ ở sổ)

### Danh mục trường chuẩn

Hai lớp, vì máy chủ và app cần khác phần:

- `packages/db/src/fields-chuan.ts`, mô-đun thuần, không chạm Prisma. Nó khai khoá theo thứ tự mặc định cho từng loại,
  và tập khoá bắt buộc theo cột không null của mô hình. App nhập qua đường con `@crm/db/fields-chuan`, như
  `@crm/db/fields-shape` hiện nay.

  | Loại | Khoá theo thứ tự mặc định (bắt buộc in đậm) |
  |---|---|
  | Thoả thuận | **name** · amount · **currency** · expectedCloseDate · **company** · **owner** |
  | Công ty | **name** · domain · website · phone · email · city · country · owner |
  | Liên hệ | **firstName** · lastName · title · email · phone · linkedin · x · github · company · owner |

  Thứ tự mặc định là thứ tự mục Chi tiết trên onehub hôm nay. Hàng «Quy đổi» của thoả thuận không phải trường: nó đi
  theo Giá trị.

- `apps/app/components/crm/fields/truong-chuan.ts` gắn mỗi khoá với nhãn theo locale (đọc từ đúng messages mà phiếu
  dùng: `m.deal.fields.*`, `m.company.fields.*`, `m.contact.fields.*`) và với kiểu của bảng đăng ký DA14. Công ty của
  thoả thuận và liên hệ mang kiểu riêng của ô chọn bản ghi (Hỏi-1 của DA14). `standard-fields.ts` bị gỡ.

### Lưu bố trí

Bảng mới, tên đặt ở kế hoạch:

```
StandardFieldLayout { entity FieldEntity, key String, position Int, hidden Boolean @default(false),
                      updatedAt, @@id([entity, key]) }
```

Thứ tự trộn dùng chung một trục `position` với `FieldDefinition.position`:

- Loại bản ghi chưa có hàng bố trí nào: trường chuẩn mang `position = chỉ số − số trường chuẩn` (số âm), nên đứng trước
  mọi trường tự tạo (`position ≥ 0`). Phiếu hôm nay giữ nguyên thứ tự cho tới lần sắp đầu.
- Lượt sắp ghi `position = chỉ số` cho mọi mục của danh sách trộn, ở cả hai bảng, trong một giao dịch, và tạo hàng bố
  trí cho mọi khoá chuẩn của loại ấy.
- Trường tự tạo mới mang `position = lớn nhất của cả hai bảng + 1`.
- Khoá chuẩn có trong danh mục mà chưa có hàng (danh mục thêm khoá sau lần sắp) đứng sau khoá chuẩn liền trước nó
  trong danh mục.

### API (`apps/api/src/fields`)

- `fields.layout({ entity })` trả danh sách trộn đã sắp:
  `{ kind: "standard", key, hidden, required } | { kind: "custom", id, key }`. Đọc được với mọi người đăng nhập, vì
  phiếu đọc nó.
- `fields.reorder({ entity, items })` nhận danh sách trộn `{ standard: key } | { custom: id }`. Danh sách phải phủ đúng
  mọi trường chuẩn và mọi trường tự tạo chưa lưu trữ của loại ấy, mỗi mục một lần; lệch thì `BAD_REQUEST`. Lệnh này
  thay hình dạng cũ `{ entity, ids }`, vì chỉ `fields-list.tsx` gọi nó.
- `fields.setStandardHidden({ entity, key, hidden })`. Khoá bắt buộc mà `hidden: true` thì `BAD_REQUEST`.
- `fields.create` và `fields.update`: `required: true` đi cùng `showOnSheet: false` thì `BAD_REQUEST`. Bật `required`
  cho một trường đang ẩn thì bật luôn `showOnSheet`.
- Ba lệnh ghi qua `requireManager` như lệnh ghi hiện nay. Câu lỗi tiếng Anh là cho máy gọi; màn hình nói tiếng mình theo
  mã (luật của DA14).
- Làm mới: `fields.layout` vào danh sách mà `cache.fields(kind)` làm mới (`docs/api.md` mục «Freshness»).
- Hình dạng đầu ra của `fields.layout` là một schema Zod ở `packages/validation/src/bo-tri-truong.ts`
  (`@crm/validation/bo-tri-truong`): router đọc ra qua nó, app nhận kiểu `z.infer` của nó, và mọi fixture bố trí trong
  bài kiểm DOM đi qua `parse` của nó (`AGENTS.md` mục «Parse at the boundary»).

### Phiếu

Ba phiếu vẽ mục Chi tiết theo `fields.layout`. Mỗi mục `standard` lấy bộ mô tả DA14 của khoá ấy, mỗi mục `custom` lấy
bộ mô tả của trường tự tạo, rồi đi qua `OTruongPhieu`. Mục `hidden` không vẽ. Trường tự tạo đã tắt «Hiện trên phiếu»
không vẽ như nay. Lúc `fields.layout` chưa tải xong thì phiếu dùng thứ tự mặc định của danh mục. Lúc tải lỗi cũng vậy:
mục Chi tiết không bao giờ trống vì bố trí.

### Cài đặt › Trường

Một danh sách sắp được thay cho khối gập «Trường chuẩn» và nhóm «Trường tự tạo». Mỗi hàng là một `SortableItem`:

- Tay kéo (có lối bàn phím của `SortableList`), nhãn, huy hiệu kiểu (`fieldTypeNgan`).
- Dòng phụ. Trường tự tạo giữ `summaryOf` như nay. Trường chuẩn ghi «Trường chuẩn», cộng «bắt buộc» khi bắt buộc.
- Công tắc «Hiện trên phiếu» ngay trên hàng, cho cả hai loại (Hỏi-3). Đổi là lưu ngay, toast ngắn, lỗi thì trả giá trị
  cũ (`docs/settings.md` mục «Lưu»). Câu lỗi là «Chưa lưu được <nhãn>.»; lượt kéo lỗi thì danh sách về thứ tự trước và
  toast «Chưa lưu được thứ tự.». Không in câu của máy chủ. Trường bắt buộc có công tắc bật và khoá, tên truy cập kèm lý do «Trường bắt buộc
  luôn hiện trên phiếu».
- Trường tự tạo giữ nút «…» (Sửa, Lưu trữ) và bấm hàng để sửa. Trường chuẩn không có hai việc ấy.

Ô sửa trường tự tạo thêm một dòng `Field orientation="horizontal"` với `Switch` «Bắt buộc», kèm `FieldDescription`
«Không để trống được khi sửa trên phiếu.» Bật nó thì ô «Hiện trên phiếu» bật và khoá. Lượt tạo gửi đúng giá trị của
công tắc, không còn `false` cứng.

Người không phải quản trị: mọi tay kéo, công tắc và nút bị khoá, dòng `canQuyen` hiện ở đầu như nay.

## Để lại cho người dựng

- Tên bảng Prisma, tên thủ tục tRPC, tên tệp phụ.
- Cách chèn `fields.layout` vào lượt nạp sẵn của phiếu (`record-prefetch.ts`).
- Cách dựng kho tRPC giả trong bài kiểm DOM (theo mẫu `apps/app/test/chi-quan-tri-truong.dom.tsx`).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ, sắp lại: Cài đặt › Trường, thẻ Thoả thuận → kéo «Hạng đối tác» (tự tạo) lên trên «Ngày chốt» → toast «Đã
  lưu thứ tự.» → mở một thoả thuận: «Hạng đối tác» đứng trên «Ngày chốt» (điểm ra: phiếu).
- Suôn sẻ, ẩn: thẻ Công ty → tắt «Hiện trên phiếu» của «Thành phố» → toast → phiếu công ty không còn hàng «Thành phố»;
  bảng công ty vẫn có cột Thành phố.
- Suôn sẻ, bắt buộc: bấm trường tự tạo → bật «Bắt buộc» → Lưu → trên phiếu, xoá trống ô ấy rồi Enter thì thấy câu
  «không được để trống» của DA14.
- Biên: chưa có trường tự tạo → danh sách chỉ có trường chuẩn, `Empty` gợi tạo trường mới nằm dưới danh sách. Người
  không quản trị → mọi điều khiển khoá, dòng lý do ở đầu.
- Lỗi và quay lại: lượt lưu thứ tự hay công tắc lỗi → toast «Chưa lưu được …», danh sách về trạng thái trước.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Trường (ba thẻ loại bản ghi) | đặt mục Chi tiết của phiếu: thứ tự, hiện hay ẩn, trường nào bắt buộc | thanh bên Cài đặt, hoặc nút bánh răng ở mục Chi tiết của phiếu / ô sửa trường |
| Ô sửa trường tự tạo | sửa một trường tự tạo, kể cả «Bắt buộc» | bấm hàng / Lưu hay Huỷ về danh sách |
| Phiếu Thoả thuận, Công ty, Liên hệ (mục Chi tiết) | xem và sửa trường theo bố trí đã đặt | bảng / đóng phiếu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-cai-dat-dang-tai | Cài đặt › Trường | `KhungXuong hinh="danh-sach"`, tiêu đề trang giữ nguyên | chờ |
| ST-cai-dat-danh-sach | Cài đặt › Trường | một danh sách trộn: tay kéo, nhãn, huy hiệu kiểu, dòng phụ, công tắc «Hiện trên phiếu» | kéo, bật tắt, bấm trường tự tạo để sửa |
| ST-cai-dat-bat-buoc | Cài đặt › Trường | hàng bắt buộc: công tắc bật và khoá, dòng phụ có «bắt buộc» | — |
| ST-cai-dat-dang-luu | Cài đặt › Trường | hàng vừa kéo đã ở chỗ mới; công tắc đổi ngay | chờ toast |
| ST-cai-dat-loi-luu | Cài đặt › Trường | toast «Chưa lưu được …», danh sách về như trước | thử lại |
| ST-cai-dat-khong-quyen | Cài đặt › Trường | mọi điều khiển khoá, dòng «Cần quyền quản trị để đổi trường của cả đội.» | — |
| ST-cai-dat-loi-tai | Cài đặt › Trường | `Empty` có nút «Thử lại» như nay | thử lại |
| ST-sua-bat-buoc | Ô sửa trường | dòng «Bắt buộc» có công tắc; bật thì «Hiện trên phiếu» bật và khoá | Lưu |
| ST-phieu-theo-bo-tri | Phiếu | mục Chi tiết theo thứ tự đã đặt, không có hàng đã ẩn | sửa trường |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Kéo bằng chuột hay chạm, hoặc bằng bàn phím: Space nhấc hàng, mũi tên dời, Space đặt (`KeyboardSensor` của
  `SortableList`).
- Công tắc lưu ngay khi đổi. Không có nút «Lưu» cho danh sách.
- Khổ 375: hàng giữ tay kéo, nhãn và công tắc; huy hiệu kiểu và dòng phụ cắt dòng, không cuộn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `SortableList`, `SortableItem`, `Switch`, `Badge`, `Field`, `FieldDescription`, `KhungXuong`, `Empty` (`@crm/ui`) | dùng | thành phần chung có sẵn; danh sách trường tự tạo đã dùng `SortableList` |
| `FieldsList` (`apps/app/components/crm/fields/fields-list.tsx`) | mở rộng | cùng màn, thêm hàng trường chuẩn và công tắc; không có dạng, màu hay khoảng cách mới |
| `OTruongPhieu` (DA14) | dùng | phiếu vẽ mục Chi tiết qua bảng đăng ký kiểu |

Bậc tra theo «Vẽ tay là bậc cuối»: dừng ở bậc 1 (`packages/ui` có `SortableList`, `Switch`, `Item`). Hàng giữ khuôn
`SortableItem` đang chạy, không đổi sang `Item`, vì `SortableItem` đã mang tay kéo và lối bàn phím.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: màn đã có và đã là một danh sách sắp được; DA15 thêm hàng vào cùng danh sách, không đổi khuôn. Chân ngành cùng
hình: HubSpot «Record customization» và Salesforce «Page Layouts» đều đặt thứ tự trường của một loại bản ghi trong một
danh sách kéo được.
<!-- UX-SPEC-TEMPLATE>>> -->
