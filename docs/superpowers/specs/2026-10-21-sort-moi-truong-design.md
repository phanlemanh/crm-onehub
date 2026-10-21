# Sort mọi trường, cột như trường chuẩn — DA17

Hàng DA17 của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511). Cổng Đáng: build, chủ kho 20/10
(«Tôi duyệt Cổng Đáng build cho cả 9 hàng.»). Mốc đợt 2026-10-22. Dãy R1 của đợt `viec-du-an-kho-tai-lieu`.

Câu giao: «Nhân viên quan hệ đối tác sắp danh sách theo bất kỳ trường nào và thấy cột trường tự tạo ở khổ hẹp như cột
có sẵn, cả trên thẻ Kanban».

DA17 đứng trên DA14 `truong-mot-cach-cu-xu`: bảng đăng ký theo kiểu ở `apps/app/components/crm/fields/kieu-truong.tsx`
(`OTruongBang`, `HienThiTruong`). Thiết kế này đọc hợp đồng DA14 đã duyệt (00:36Z 21/10, nhánh
`feat/truong-mot-cach-cu-xu`), chưa gộp.

## Vì sao

Soát mã 21/10 trên onehub `03d4842f1`:

- `SORTABLE` của `deals.service.ts`, `companies.service.ts`, `contacts.service.ts` chỉ có cột chuẩn. Một `sort` lạ
  rơi về `resolveOrderBy` (`apps/api/src/trpc/list-input.ts`), lặng lẽ trả thứ tự mặc định. Cột trường tự tạo
  (`field-columns.tsx`) không khai `sortable`, nên tiêu đề không bấm được, và menu sort trên điện thoại không có nó.
- Cột Điện thoại của Liên hệ cũng không sort được, dù `docs/design.md` khai Điện thoại sort A→Z.
- Cột trường tự tạo luôn `hideBelow: "lg"` (`field-columns.tsx:68`). Cột chuẩn cùng kiểu ẩn ở khổ khác: Người phụ
  trách `md`, Giá trị `sm`, Email `md`.
- Thẻ Kanban bỏ giá trị trường: `dealBoardCardOutput` là hàng danh sách bỏ `fields` (`deals.contracts.ts:236`).

## Mục tiêu

1. Sort được theo mọi trường có sort trong bảng kiểu của `docs/design.md`, chuẩn hay tự tạo, ở ba bảng và bảng
   Kanban.
2. Trống luôn đứng cuối, hoà giá trị phân xử ổn định, phân trang không trùng không sót.
3. Cột ẩn dưới khổ nào theo kiểu của trường, một bảng cho cả hai loại trường.
4. Thẻ Kanban hiện tối đa hai trường tự tạo đầu tiên đã bật «Hiện trong bảng».
5. Sort theo trường tự tạo không chậm hơn đáng kể sort theo cột chuẩn trên dữ liệu mẫu lớn.

## Không làm (non-goals)

- Lọc theo trường, cách mã hoá bộ lọc trên đường dẫn: DA18.
- Sort theo Tệp: DA19, bảng của `docs/design.md` khai «—».
- Sort nhiều cột một lúc.
- Đổi bộ sort hay menu sort của `DataTable` (`packages/ui`, vùng Mac Studio, luật 31). DA17 chỉ khai `sortable` và
  `hideBelow` của cột, là hai thuộc tính `DataTable` đã có.
- Đổi chỗ, đổi bề rộng cột chuẩn. Cột chuẩn đổi nguồn của `hideBelow` sang bảng kiểu, giá trị giữ như trên onehub.

## Không được thành (anti-goals)

- Một bảng sort riêng cho trường tự tạo, khác cách trường chuẩn cư xử (trống đầu, chiều ngược…).
- Sort ở máy khách trên trang đã tải: sai khi danh sách nhiều trang.
- Tải hết id khớp bộ lọc rồi sort trong bộ nhớ: `fields.service.ts` đã ghi luật «never by first fetching every
  matching id, which would not scale past a few thousand records».

## Ràng buộc

- Vùng (luật 31): `apps/api/src/fields/**`, `packages/db/src/fields*.ts`, `apps/app/components/crm/fields/**` là của
  đợt. `*.service.ts` của companies, contacts, deals và `list-search-params.ts` dùng chung với DA18 (luật 34): DA17
  đi trước, DA18 sau.
- Không chạm `packages/ui`, `DataTable`, schema Prisma (T2).
- Không chú thích trong mã; hằng số tinh chỉnh vào một tệp cấu hình của khu.
- `apps/app` phần cột và thẻ chỉ viết sau khi DA14 gộp onehub. Phần API không phụ thuộc DA14.

## Cách làm (máy quyết, căn cứ ở sổ)

### Khoá sort của trường

Cột trường tự tạo có `id` là `field:<khoá>` như hôm nay. `DataTable` gửi `id` ấy làm `sort` khi người bấm tiêu đề
hay chọn trong menu sort. API nhận `sort` dạng `field:<khoá>`.

### Kiểu nào sort theo gì

Một bảng ở `packages/db/src/fields-shape.ts`, cạnh `columnFor`. Bảng ấy là nguồn duy nhất cho cả API (cách sort) lẫn
app (cột có `sortable` hay không), vì `@crm/db/fields-shape` đã là đường mà mã khách dùng.

| Kiểu | Sort theo | Ghi chú |
|---|---|---|
| Chữ, Chữ dài, Liên kết, Email, Điện thoại | `fieldValue.text` | A→Z theo collation của kho, như `name` chuẩn |
| Số | `fieldValue.number` | |
| Ngày | `fieldValue.date` | |
| Chọn | `fieldOption.position` | theo thứ tự lựa chọn ở Cài đặt › Trường |
| Người | `user.name` | như `owner` chuẩn |
| Ô tích | không sort | `docs/design.md` khai «—» |

Trống luôn đứng cuối, cả hai chiều, như `amount` và `lastActivity`. Trống có hai dạng, cả hai đều tính: không có hàng
`fieldValue` (đường ghi xoá hàng khi người xoá giá trị), hay có hàng mà cột lưu là `null` (khoá ngoại `SetNull` để
lại khi người dùng hay lựa chọn bị xoá).

Hoà giá trị phân xử như sort chuẩn: theo tên bản ghi A→Z (Thoả thuận và Công ty theo `name`, Liên hệ theo `lastName`
rồi `firstName`, như `title` và `owner` của `contacts.service.ts`), rồi `id`. Điện thoại chuẩn của Liên hệ và một
trường Điện thoại tự tạo hoà theo cùng luật.

### Truy vấn: hai đoạn trên `fieldValue`

Prisma không sắp bản ghi theo một hàng của quan hệ một-nhiều đã lọc. Hàm `FieldsService.sapTheoTruong` làm ở phía
`fieldValue`, hai đoạn:

1. Đoạn có giá trị: `fieldValue.findMany` với `fieldId`, cột lưu `not: null`, quan hệ bản ghi `is: <where của danh
   sách>`, `orderBy` theo bảng trên, rồi tên bản ghi A→Z, rồi `id`; `skip`, `take` theo trang. Đếm đoạn này
   bằng `fieldValue.count` cùng `where`.
2. Đoạn trống: khi trang vượt qua cuối đoạn một, lấy tiếp bản ghi khớp `where` mà không có hàng giá trị khác null
   (`fieldValues: { none: { fieldId, <cột>: { not: null } } }`, phủ cả hai dạng trống), `orderBy` tên bản ghi A→Z
   rồi `id`, `skip` trừ đi số hàng đoạn một.

Hàm trả danh sách id đúng thứ tự của trang. Service tải hàng bằng `findMany({ where: { id: { in } } })` với `select`
như nay, rồi xếp lại theo danh sách id. `total` và `facetCounts` không đổi. Chỉ mục `[fieldId, text|number|date]` của
`fieldValue` đã có.

`sort` dạng `field:<khoá>` mà khoá không có, trường đã lưu trữ, thuộc loại bản ghi khác, hay kiểu không sort được
→ thứ tự mặc định của danh sách, không ném lỗi. Lý do: `SavedView.filters.sort` lưu chuỗi ấy, và một trường bị lưu
trữ sau đó không được làm hỏng view đã lưu. Có báo người hay không là Hỏi-4: máy khuyên không báo, vì cột của trường đã
lưu trữ biến khỏi bảng, nên không tiêu đề nào mang mũi tên sort và bảng không nói dối là đang sắp. `sort` không có tiền tố đi `SORTABLE` như hôm nay.

Bảng Kanban (`deals.board`) dùng cùng hàm cho từng cột giai đoạn, `skip` 0, `take` là `DEAL_BOARD.cardsPerColumn`.

Liên hệ thêm `phone` vào `SORTABLE`, theo `phone` rồi `lastName`.

### Ẩn cột theo kiểu

Bảng đăng ký của DA14 thêm mặt `anDuoi` (`hideBelow`) cho mỗi kiểu. Giá trị lấy từ cột chuẩn cùng kiểu đang chạy:

| Kiểu | `hideBelow` | Cột chuẩn đang có |
|---|---|---|
| Tiền | `sm` | Giá trị (thoả thuận) |
| Số | `sm` | chưa có cột chuẩn — theo Tiền (Hỏi-1) |
| Người | `md` | Người phụ trách (cả ba bảng) |
| Liên kết, Email, Điện thoại | `md` | Tên miền, Email, Điện thoại |
| Chữ, Chữ dài | `lg` | Chức danh |
| Ngày | `lg` | Ngày chốt |
| Chọn | `lg` | chưa có cột chuẩn kiểu Chọn — theo Chữ |
| Ô tích | `lg` | chưa có cột chuẩn — theo Chữ (Hỏi-1) |

Cột chuẩn và cột tự tạo đều đọc `hideBelow` từ bảng theo kiểu của mình. Ngoại trừ có tên: cột chính (Tên), và cột
không có dòng trong bảng «Trường chuẩn → kiểu» của DA14 (Công ty của bản ghi, Giai đoạn, Ngành, số liên hệ, số
thoả thuận, Ngày tạo, Hoạt động gần nhất, Lưu trữ, Làm giàu). Với các cột chuẩn có kiểu, giá trị bảng trùng giá trị trên onehub, nên bảng chuẩn không đổi mắt.

Cột trường tự tạo khai `sortable` theo bảng «Kiểu nào sort theo gì». Cột chuẩn có kiểu sort được thì `sortable: true`
(thêm Điện thoại của Liên hệ).

### Thẻ Kanban

`deals.board` trả thêm `fields` cho mỗi thẻ: chỉ hai trường tự tạo đầu tiên theo `position` đã bật «Hiện trong bảng»,
chưa lưu trữ. `FieldsService` có hàm đọc giá trị cho tập id ấy, dùng chung đường đọc với `tableValuesFor`.

Thẻ vẽ mỗi trường có giá trị thành một dòng: nhãn mờ, rồi giá trị qua `HienThiTruong` của DA14, cắt dòng. Trường
trống thì bỏ dòng (Hỏi-2). Dòng nằm sau Ngày chốt, trước Người phụ trách.

### Tốc độ

Đo trên kho thử của lượt (`crm_<id>_test`, các tệp trong lượt dùng chung) với 5.000 thoả thuận mẫu, mỗi bản ghi có một trường Số tự tạo (một phần mười trống), tạo
qua đường ghi thật. Trung vị năm lượt `deals.list` sắp theo trường Số, ở trang đầu và trang vắt qua ranh trống, không
quá ba lần trung vị cùng lượt sắp theo Giá trị, và không quá 1 giây (Hỏi-3). Tệp đo riêng
(`sort-moi-truong-toc-do.spec.ts`) chỉ chạy khi có biến `SMT_TOC_DO=1`, để lượt `bun run test` thường không mang thêm
5.000 bản ghi; xong đo thì dọn hết bản ghi và trường nó tạo.

### Cô lập trong bài kiểm

Kho thử của lượt dùng chung giữa mọi tệp. Mỗi ca của bài kiểm API gắn một tiền tố tên riêng và gọi `list`, `board`
với `q` là tiền tố ấy, nên chỉ thấy bản ghi của mình; ca nào đọc thứ tự trường trên thẻ thì tự sắp trường của mình lên
đầu bằng thủ tục sắp lại thật. Cuối ca lưu trữ trường đã tạo.

## Để lại cho người dựng

- Tên hàm phụ trong `apps/api/src/fields/`.
- Cách ghép kho tRPC giả trong bài kiểm DOM (theo mẫu của DA14).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: bảng Thoả thuận → bấm tiêu đề cột «Hoa hồng» (trường Số tự tạo) → bảng sắp tăng dần, mũi tên ở tiêu đề,
  đường dẫn mang `sort=field:hoa_hong` → bấm lần nữa → giảm dần (điểm ra: vẫn ở bảng).
- Điện thoại (375): menu sort của bảng liệt mọi cột sort được, kể cả cột trường tự tạo đang ẩn theo khổ; chọn → bảng
  sắp theo trường đó, đường dẫn mang `sort=field:<khoá>`.
- Kanban: chuyển kiểu xem sang Kanban, đường dẫn giữ `sort` → thẻ trong mỗi giai đoạn theo cùng thứ tự; mỗi thẻ hiện
  tối đa hai dòng trường tự tạo.
- Biên: bản ghi trống giá trị xếp cuối cả hai chiều. Trường Ô tích không có mũi tên sort. View đã lưu sắp theo một
  trường nay đã lưu trữ thì mở ra với thứ tự mặc định, không báo lỗi (Hỏi-4, lối máy khuyên).
- Lỗi: tải bảng hỏng thì như nay (`VungTaiLoi`), không có lỗi riêng của sort.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng Thoả thuận, Công ty, Liên hệ | đọc và sắp danh sách bản ghi | thanh bên / mở phiếu |
| Kanban Thoả thuận | xem thoả thuận theo giai đoạn | chuyển kiểu xem / mở phiếu, kéo thẻ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bang-chua-sap | Bảng | tiêu đề cột trường bấm được, không mũi tên | bấm tiêu đề |
| ST-bang-sap-tang | Bảng | mũi tên lên ở cột đang sắp, `aria-sort="ascending"`, trống cuối | bấm lần nữa để giảm |
| ST-bang-sap-giam | Bảng | mũi tên xuống, `aria-sort="descending"`, trống vẫn cuối | bấm cột khác |
| ST-bang-khong-sap | Bảng | cột Ô tích: tiêu đề chữ thường, không nút | — |
| ST-bang-hep | Bảng 768 | cột trường tự tạo kiểu Người, Liên kết, Email, Điện thoại, Số hiện như cột chuẩn cùng kiểu; Chữ, Ngày, Chọn, Ô tích ẩn | dùng menu sort |
| ST-kanban-the | Kanban | dưới Ngày chốt, tối đa hai dòng «nhãn giá trị» của trường tự tạo | mở thẻ |
| ST-kanban-the-trong | Kanban | trường trống: không có dòng | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tiêu đề sort là nút của `DataTable` (bàn phím, `aria-sort`, vòng focus) — DA17 không đổi.
- Sắp đổi trang về trang 1 như sort cột chuẩn hiện nay.
- Số trên thẻ dùng `tabular-nums` qua `HienThiTruong`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DataTable` (`sortable`, `hideBelow`) | dùng | hai thuộc tính đã có; không đổi `packages/ui` |
| `HienThiTruong`, mặt `anDuoi` của `kieu-truong.tsx` (DA14) | mở rộng | thêm một mặt vào bảng đăng ký của đợt, không ở `packages/ui` |
| Thẻ Kanban `DealBoardCard` | ghép | thêm dòng nhãn và giá trị bằng `HienThiTruong` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail) và bảng Kanban, cả hai đã có.
Căn cứ: luồng hiển nhiên — DA17 thêm hành vi vào cột và thẻ đang chạy, không thêm màn, nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
