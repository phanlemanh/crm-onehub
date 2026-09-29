# Giai đoạn thoả thuận do quản trị viên tự cấu hình — thiết kế

Ngày: 2026-09-29 · Hồ sơ: `_acceptance/giai-doan-thoa-thuan/` · Hạng: T3 (chạm
`packages/db/prisma`).

## Vấn đề

Giai đoạn của một thoả thuận hợp tác là enum Prisma `DealStage` với bảy giá trị
thừa kế từ phễu bán phần mềm của kho gốc (`DEMO_BOOKED` … `CLOSED_LOST`).
`CONTEXT.md` ghi mục «Giai đoạn thoả thuận» là **chưa chốt nghĩa**: bảy bước đó
không mô tả quy trình hợp tác của OneHub. Muốn đổi một bước phải sửa enum, viết
`migration`, sửa ba tầng code và triển khai lại.

Luật nhóm (mở / đã đóng / thua) sống ở hai chỗ lệch nhau:
`packages/db/src/deal-stage.ts` và `apps/app/lib/deal-stage.ts` (bản sau suy nhóm
mở bằng `ORDER.slice(0, 4)`). Tỷ lệ chốt ở Tổng quan, chỉ số OKR «thoả thuận chốt
được» và bộ lọc «won» của agent so thẳng với chuỗi `CLOSED_WON` / `CLOSED_LOST`.

## Quyết định đã chốt với chủ kho (2026-09-29)

1. **Một bộ giai đoạn chung** cho mọi thoả thuận, không theo loại hợp tác.
2. **Bộ ban đầu = bảy bước cũ**, nhãn giữ nguyên; không thoả thuận nào đổi chỗ.
   Quản trị viên đổi tên, thêm, bớt sau khi lên.
3. **Xoá một giai đoạn còn thoả thuận**: bắt chọn giai đoạn đích **cùng loại**,
   chuyển hết rồi xoá.
4. **Ba loại**: Đang mở · Chốt được · Không thành. «Unqualified» thành «Không
   thành», nên tỷ lệ chốt tính cả nó vào mẫu số — con số có thể giảm, chủ kho
   đã chấp nhận.
5. **Cách làm A**: bảng định nghĩa + khoá ngoại, bỏ enum (B «đè nhãn lên enum» và
   C «JSON trong `AppSetting`» đã loại — xem sổ quyết định).

## Dữ liệu

```prisma
enum DealStageKind { OPEN WON LOST }

model DealStage {
  id         String        @id @default(cuid())
  label      String
  kind       DealStageKind
  position   Int
  archivedAt DateTime?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  deals      Deal[]
  @@index([kind, position])
}

model Deal {
  stage    String    @default("DEMO_BOOKED")
  giaiDoan DealStage @relation(fields: [stage], references: [id], onDelete: Restrict)
}
```

- Tên model `DealStage` giữ nguyên chữ của hãng để diff nhỏ; enum cũ cùng tên bị
  xoá trong cùng `migration`.
- `Deal.stage` giữ TÊN, đổi KIỂU: enum → text, khoá ngoại tới `dealStage.id`
  (`ON DELETE RESTRICT`), quan hệ tên `giaiDoan`. Giữ tên để test, fixture và
  lệnh SQL của các hồ sơ đã ký chạy nguyên (quyết định S2). Mặc định tầng DB giữ
  `DEMO_BOOKED` chỉ để test và seed tạo thẳng bằng Prisma không vỡ; service luôn
  tự chọn giai đoạn mở đứng đầu, không dựa vào mặc định này.
- **Migration `20261006010000_giai_doan_thoa_thuan`**, một transaction:
  1. tạo enum `DealStageKind`, bảng `DealStage`;
  2. chèn bảy dòng với **id = chuỗi enum cũ** (`DEMO_BOOKED`…), nhãn = nhãn đang
     hiện ở `apps/app/lib/deal-stage.ts`, loại: bốn bước đầu `OPEN`,
     `CLOSED_WON` `WON`, `CLOSED_LOST` và `UNQUALIFIED_TO_BUY` `LOST`; vị trí theo
     `ORDER` hiện tại;
  3. `ALTER COLUMN stage TYPE text USING stage::text`, thêm khoá ngoại (chỉ mục
     `deal_stage_idx` giữ nguyên);
  4. xoá kiểu enum `DealStage` cũ.
- Vì id giữ nguyên chuỗi cũ: `Activity.meta {from, to}` của lịch sử cũ, dòng
  `deals_by_stage` của telemetry, và mọi răng đo của hồ sơ khác đang gieo bằng
  chuỗi `DEMO_BOOKED` vẫn trỏ đúng mà không viết lại hàng nào.
- **Xoá = đặt `archivedAt`**, không bao giờ xoá hàng: lịch sử «từ X sang Y» của
  một giai đoạn đã xoá vẫn đọc được tên. Không có giao diện khôi phục.

## Luật — một module

`packages/db/src/giai-doan.ts` (thay `deal-stage.ts`, xuất qua
`@crm/db/giai-doan`) là nơi DUY NHẤT định nghĩa:

- `GIAI_DOAN = { tran: { tong: 20 }, nhan: { toiDa: 40 } } as const` — theo khuôn
  config một-tệp-một-khu của `AGENTS.md`;
- `laDaDong(kind)`, `laThua(kind)` (loại `LOST` bắt lý do), `laChotDuoc(kind)`;
- `GIAI_DOAN_GOC` — bảy id của bộ ban đầu. **Chỉ `seed.ts`, `migration` và tệp
  test được dùng**; code sản phẩm rẽ nhánh theo `kind`, không theo id. Một phép đo
  script chặn import `GIAI_DOAN_GOC` hoặc chuỗi id cũ trong `apps/*/src`,
  `apps/app/app`, `apps/app/components`, `apps/app/lib`, `apps/agent/agent`.
- Schema zod của đầu vào (`packages/validation/src/giai-doan.ts`): nhãn đã cắt
  khoảng trắng, 1–40 ký tự; `kind` là một trong ba giá trị.

`apps/app/lib/deal-stage.ts` còn giữ phần trình bày: màu suy ra từ loại và vị
trí (`OPEN` xoay vòng `--chart-1..4`, `WON` success, `LOST` error), không còn
danh sách hay nhãn cứng.

## Bất biến (máy chủ cưỡng chế, một transaction, `FOR UPDATE` trên bảng giai đoạn)

- Luôn còn **≥ 1 giai đoạn sống mỗi loại**.
- Nhãn giai đoạn sống không trùng, so không phân biệt hoa thường.
- Tổng giai đoạn sống ≤ `GIAI_DOAN.tran.tong`.
- `reorder` nhận **đủ và đúng** danh sách id sống của MỘT loại; thiếu, thừa hay
  lẫn loại → từ chối (cùng luật `reorderDivisions`).
- `archive` khi còn thoả thuận (kể cả thoả thuận đã lưu trữ) → bắt `moveTo`; đích
  phải sống, cùng loại, khác chính nó. Chuyển từng thoả thuận qua đường đổi giai
  đoạn hiện có: một dòng `STAGE_CHANGE` mỗi thoả thuận, `stageChangedAt` mới,
  **không** đổi `closedAt` hay `closedReason` (cùng loại), phát
  `deal.stage.changed`. Chuyển xong mới đặt `archivedAt`, cùng một transaction.
- Loại của một giai đoạn **không đổi được** sau khi tạo.

## API — router `giaiDoan`

`apps/api/src/giai-doan/`, `PhamViDoiTacMiddleware` (dữ liệu của thoả thuận).
Ghi gọi `canManageSettings` (owner, admin) trước mọi việc; cùng hàm đó khoá nút.

| Thủ tục | Việc |
| --- | --- |
| `list` | giai đoạn sống theo `kind`, `position`, kèm số thoả thuận đang ở đó |
| `create` | `{ label, kind }` → cuối danh sách của loại đó |
| `rename` | `{ id, label }` |
| `reorder` | `{ kind, ids }` |
| `archive` | `{ id, moveTo? }` |

`deals.setStage`, `deals.bulkSetStage`, `deals.create` nhận `stage` là id giai
đoạn (chuỗi), kiểm giai đoạn sống. Khoá `stage` của mọi đầu ra API giữ nguyên tên,
nay là id. Mọi truy vấn «đang mở» dùng `giaiDoan: { kind: "OPEN" }`.
Freshness: thêm `cache.giaiDoan()` vào `useCrmCache()`; `archive` có chuyển thì
gọi thêm `cache.deal` diện rộng.

## Bên tiêu thụ — đổi từ tên sang loại

| Nơi | Trước | Sau |
| --- | --- | --- |
| `deals.service.ts` board, list lọc «open», openCount | hằng `OPEN_DEAL_STAGES` | mỗi giai đoạn sống một cột theo `kind`, `position`; lọc theo `kind` |
| `deals.service.ts` setStage | `LOSING`, `isClosedStage` | `laThua(kind)`, `laDaDong(kind)` |
| `dashboard.service.ts` | `CLOSED_WON`/`CLOSED_LOST` | `WON` / `LOST`; pipeline mở = mọi `OPEN` |
| `packages/db/src/okr-chi-so.ts` «thoả thuận chốt được» | `stage: "CLOSED_WON"` | `stage: { kind: "WON" }` |
| `companies.service.ts` openDealCount | `OPEN_DEAL_STAGES` | `kind: OPEN` |
| agent `lookup.ts` (`list_deals` open/won/lost) | hằng + `CLOSED_WON` | theo `kind` |
| agent `accounts.ts`, `preamble.ts` | so chuỗi, in id | theo `kind`, in **nhãn** |
| telemetry `deals_by_stage` | khoá = enum | khoá = id giai đoạn (bảy id cũ giữ nguyên); không gửi nhãn |
| app: board, table, stepper, menu giai đoạn, bulk, create sheet, timeline, Tổng quan, agent-builder | `DEAL_STAGE_OPTIONS` cứng | đọc `giaiDoan.list` |
| `seed.ts` | enum | `GIAI_DOAN_GOC` |

Timeline hiện nhãn **hiện tại** của giai đoạn, kể cả giai đoạn đã xoá — mà
`giaiDoan.list` chỉ trả giai đoạn sống. Nên `activities.timeline` gắn nhãn ở
biên: parse `meta` của dòng `STAGE_CHANGE` bằng zod thành `{ from, to }`, tra cả
hai id trong bảng giai đoạn (gồm đã xoá) và trả
`stageChange: { from: { id, label } | null, to: { id, label } }`. Giao diện chỉ
in, không tra. Id không còn trong bảng (không thể xảy ra, nhưng `meta` là
`Json`) → nhãn = chính id, không vỡ trang.

## Trang Cài đặt › Giai đoạn thoả thuận

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh bên Cài đặt › «Giai đoạn thoả thuận» → thấy ba thẻ Đang mở ·
  Chốt được · Không thành → «Thêm giai đoạn» ở một thẻ → gõ tên → Lưu → giai đoạn
  mới đứng cuối thẻ đó, và xuất hiện ngay ở menu giai đoạn và bảng cột của màn
  Thoả thuận (điểm ra: ở lại trang).
- Sắp xếp: kéo tay cầm (hoặc bàn phím: Space nhấc, mũi tên, Space thả) trong một
  thẻ → lưu ngay → toast «Đã đổi thứ tự» có «Hoàn tác».
- Xoá giai đoạn trống: menu «…» › Xoá → hỏi lại → xoá.
- Xoá giai đoạn còn thoả thuận: menu «…» › Xoá → hộp thoại «Còn N thoả thuận ở
  giai đoạn này. Chuyển chúng sang:» + ô chọn giai đoạn cùng loại → «Chuyển và
  xoá».
- Biên: giai đoạn cuối cùng của một loại → mục «Xoá» khoá, gợi ý dưới tên «Cần
  ít nhất một giai đoạn …». Đạt trần → nút «Thêm» khoá kèm lý do.
- Lỗi & quay lại: máy chủ từ chối (nhãn trùng, danh sách cũ, mất quyền) → hộp
  thoại giữ nguyên chữ đã gõ, lỗi hiện dưới ô; kéo bị từ chối → danh sách về thứ
  tự cũ + toast lỗi.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Giai đoạn thoả thuận | quản lý danh sách giai đoạn và thứ tự của chúng | thanh bên Cài đặt, nhóm Không gian làm việc, sau «Trường» / ở lại |
| Hộp thoại Thêm / Đổi tên | đặt một cái tên | nút «Thêm», menu «…» / đóng về trang |
| Hộp thoại Xoá có chuyển | chọn nơi đón các thoả thuận còn lại | menu «…» / đóng về trang |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-giaidoan-dangtai | Cài đặt › Giai đoạn | ba thẻ khung xương cùng hình | chờ |
| ST-giaidoan-loi | Cài đặt › Giai đoạn | `Empty` «Không tải được danh sách giai đoạn» + «Thử lại» | bấm Thử lại |
| ST-giaidoan-co-du-lieu | Cài đặt › Giai đoạn | mỗi thẻ: hàng `Item` gồm tay cầm, nhãn, «N thoả thuận», menu «…» | thêm, sửa, sắp, xoá |
| ST-giaidoan-khong-quyen | Cài đặt › Giai đoạn | danh sách đọc được, mọi điều khiển khoá, một dòng dưới tiêu đề «Chỉ chủ sở hữu và quản trị viên đổi được giai đoạn» | không có |
| ST-giaidoan-mot-con | Cài đặt › Giai đoạn | «Xoá» khoá ở giai đoạn duy nhất của loại, kèm lý do | thêm giai đoạn khác trước |
| ST-giaidoan-dat-tran | Cài đặt › Giai đoạn | «Thêm giai đoạn» khoá ở cả ba thẻ, kèm lý do có con số | xoá bớt |
| ST-giaidoan-dang-luu | hộp thoại | nút chính có spinner, khoá | chờ |
| ST-giaidoan-tu-choi | hộp thoại | lỗi máy chủ dưới ô, chữ đã gõ còn nguyên | sửa rồi lưu lại |
| ST-xoa-con-thoa-thuan | hộp thoại Xoá | «Còn N thoả thuận …» + ô chọn; nút chính khoá tới khi chọn | chọn đích |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Nhãn: cắt khoảng trắng hai đầu, 1–40 ký tự, không trùng giai đoạn sống khác
  (so không phân biệt hoa thường). Nút Lưu tắt tới khi hợp lệ.
- Nhãn là dữ liệu người nhập: mang `translate="no"` ở mọi nơi hiện.
- Chỉ sắp xếp trong một thẻ; không kéo sang thẻ khác (đổi loại là Never).
- Kéo có đường bàn phím (`SortableList` đã có) và `aria-label` cho tay cầm.
- Khổ 320–1440: một cột, hàng không tràn ngang; nhãn dài xuống dòng.
- Lưu theo `docs/settings.md`: sắp xếp là «điều khiển tự đủ», áp cả không gian →
  toast có «Hoàn tác»; thêm/đổi tên có ô gõ → hộp thoại có nút Lưu.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `PageShell` `width="page"` | dùng | khung chuẩn Cài đặt |
| `Card` + `CardHeader`/`CardTitle`/`CardAction` | dùng | một thẻ một loại |
| `Item` | dùng | hàng có hành động, không cột — bảng Danh sách của `docs/settings.md` |
| `SortableList` / `SortableItem` | dùng | đã dùng ở Tổ chức |
| `DropdownMenu` «…» | dùng | từ hai hành động |
| `Dialog` + `Field` + `Input` | ghép | ≤ 3 ô |
| `ConfirmDialog` | dùng | xoá giai đoạn trống |
| `Dialog` + `Select` | ghép | xoá có chuyển |
| `Empty`, `Skeleton` | dùng | trạng thái lỗi / đang tải |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: trang Cài đặt một đối tượng danh sách ngắn (≤ 20 hàng) — cùng khuôn với
Tiền tệ và Tổ chức › danh sách kéo; không có khuôn thứ hai khả dĩ nên không tra
mẫu thị trường. Đối chiếu ngành: HubSpot «Deal pipelines» và Pipedrive
«Pipelines» đều là một danh sách giai đoạn có thứ tự trong phần cài đặt.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- API (`apps/api/test/giai-doan*.spec.ts`, DB kiểm của `bun run test`): migration
  trên dữ liệu bảy giai đoạn, mọi bất biến hai chiều, quyền, chuyển khi xoá,
  tỷ lệ chốt và OKR theo loại.
- Agent (`apps/agent/test`): `list_deals` theo loại với giai đoạn mới tạo.
- App (`apps/app/test/*.dom.tsx`): trang Cài đặt, menu giai đoạn đọc danh sách
  động, timeline đọc nhãn.
- Chrome thật (răng `_acceptance/giai-doan-thoa-thuan/rang/`): thêm giai đoạn ở
  Cài đặt rồi thấy nó ở bảng cột; khổ 320–1440, vi/en.
- Script: không code sản phẩm nào rẽ nhánh theo id cũ; cổng thiết kế tĩnh.

## Rủi ro

- **Hồ sơ đã ký bị chạm.** `deals-board.spec.ts`, `currency-totals.integration`,
  ba spec của agent và `keo-tha-thoa-thuan.dom.tsx` import `DealStage`; sửa import
  sang `GIAI_DOAN_GOC` làm các hồ sơ đó hoá cũ → ghim lại ở S5 (làn `repin-lane`).
- **Mốc migration.** Nhánh 9b giữ `20261004010000_tro_ly_okr_de_xuat` trùng với
  `okr_canh_kr` trên onehub; vòng này lấy `20261006` và kiểm lại
  `origin/onehub` ngay trước merge.
- **Production.** Merge onehub = `migrate deploy` tự động. Migration chỉ đổi kiểu
  cột trên chuỗi đã có; không mất dữ liệu, nhưng không đảo ngược tự động được.

## Ngoài phạm vi

Nhiều bộ giai đoạn · tự chọn màu · xác suất / dự báo theo giai đoạn · đổi loại
của giai đoạn · khôi phục giai đoạn đã xoá · dịch bảy nhãn cũ · nhật ký thay đổi
cấu hình giai đoạn.
