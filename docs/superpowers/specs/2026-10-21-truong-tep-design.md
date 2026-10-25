# Kiểu trường Tệp — thiết kế

Hàng DA19 `truong-tep` của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511), dãy R3 của đợt
`viec-du-an-kho-tai-lieu`. Câu giao: «Nhân viên quan hệ đối tác gắn tệp hợp đồng vào ô Tệp trên phiếu thoả thuận, công
ty hay liên hệ, và lọc được bản ghi nào chưa có». Mã phạm vi F1 của `docs/plan/pham-vi-truong-hop-dong.md`. Hạng T3
(có migration ở `packages/db/prisma`). Cổng Đáng: build, manh, 2026-10-21T14:12:29Z. Mốc đợt 22/10.

Soạn trên giấy theo luật 44 của đợt: hàng này chưa viết mã tới khi DA18 `loc-moi-truong` (#526) gộp. Thiết kế đọc
onehub `110a07377`, nhánh DA18 `feat/loc-moi-truong` (`680bc1d38`) và nhánh DA17 `feat/sort-moi-truong`, chỉ đọc.

Đã đọc: `AGENTS.md`, `docs/design.md` (mục «Trường», «Vẽ tay là bậc cuối», «Nếp màn»), `docs/api.md` (mục tRPC, «One
organization», «Deleting a record is archive first, purge later», «Kho tài liệu: nguồn», «Freshness»),
`docs/vong-doi.md`, `docs/environment.md` và `docs/production.md` mục «Kho Blob», `.env.example`, `CONTEXT.md` (mục
«Trường»), thiết kế và hợp đồng DA18, LUAT.md của đợt (luật 1–2, 7, 30–44), skill `web-design-guidelines` (luật tải tệp,
danh sách tệp, hỏi lại trước khi xoá), skill `prisma-database-setup` (không có luật migration riêng; luật migration là
luật 1–2 của đợt), `morphological-scan` (`_acceptance/truong-tep/coverage-scan.md`).

## Hiện trạng trên onehub `110a07377`

| Chỗ | Hôm nay |
|---|---|
| Kiểu trường | `enum FieldType` mười giá trị (`schema.prisma:1126`), `FIELD_TYPES` (`packages/db/src/fields-shape.ts:5`). |
| Giá trị | `FieldValue` một hàng mỗi trường × bản ghi, một cột vô hướng mỗi kiểu (`schema.prisma:1182`, `@@unique([fieldId, dealId])`…). Không chứa được nhiều tệp. |
| Ghi giá trị | Không có thủ tục riêng: `companies.update`, `contacts.update`, `deals.update` nhận `data.fields`. `coerceValue` (`fields.ts:98`) rơi về `{ text }` ở `default` — một kiểu mới không có nhánh sẽ lặng lẽ nhận chuỗi. Kara ghi qua `writeValues` cùng đường. |
| Bảng đăng ký kiểu (DA14) | `KIEU_TRUONG` (`apps/app/components/crm/fields/kieu-truong.tsx:483`), `satisfies Record<KieuTruong, DongKieu>`: mặt `hienThi`, `suaTaiCho`, `oBang`. DA17 thêm `anDuoi`, `canh` và bảng `SAP_THEO_KIEU`; DA18 thêm bảng lọc theo kiểu. |
| Tải tệp | Chỉ Kho tài liệu: `packages/db/src/blob-nguon.ts` ký PUT riêng tư (`issueSignedToken`, `presignUrl`), API đọc lại byte, nhận kiểu theo byte đầu (`apps/api/src/tai-lieu/kho-nguon.ts`), phiếu HMAC (`phieu-nguon.ts`), thiếu khoá thì tắt (`trangThai.bat`). Giao diện kéo thả `NguonKeoTha` (`packages/ui`). |
| Xoá bản ghi | Lưu trữ rồi xoá vĩnh viễn; lịch dọn `purgeExpired` mỗi ngày (`archive-retention.controller.ts`). Không đường nào xoá Blob. |
| Xoá trường | `fields.delete` xoá định nghĩa, giá trị đi theo khoá ngoại `Cascade`. |
| Quyền | Router `fields` và ba router bản ghi mang `PhamViDoiTacMiddleware`. Quản trị = `owner` hoặc `admin` (`isWorkspaceAdmin`, `packages/auth/src/roles.ts:16`). |

## Phương án

### 1. Dữ liệu: một bảng tệp, một hàng cho mỗi tệp

`FieldValue` giữ nguyên. Tệp có bảng riêng, vì một ô giữ nhiều tệp và mỗi tệp có tên, cỡ, người tải:

```prisma
enum FieldType { … USER FILE }

model FieldFile {
  id           String          @id @default(uuid())
  fieldId      String
  field        FieldDefinition @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  companyId    String?
  company      Company?        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  contactId    String?
  contact      Contact?        @relation(fields: [contactId], references: [id], onDelete: Cascade)
  dealId       String?
  deal         Deal?           @relation(fields: [dealId], references: [id], onDelete: Cascade)
  tenTep       String
  kieu         String
  kichThuoc    Int
  sha256       String
  blobPathname String          @unique
  taiBoiId     String?
  taiBoi       User?           @relation("FieldFileUploader", fields: [taiBoiId], references: [id], onDelete: SetNull)
  taiLuc       DateTime        @default(now())

  @@unique([fieldId, companyId, sha256])
  @@unique([fieldId, contactId, sha256])
  @@unique([fieldId, dealId, sha256])
  @@index([fieldId, companyId])
  @@index([fieldId, contactId])
  @@index([fieldId, dealId])
  @@map("fieldFile")
}

model BlobChoXoa {
  pathname String   @id
  kho      String
  taoLuc   DateTime @default(now())
  xoaSau   DateTime
  lanThu   Int      @default(0)
  fieldId  String?
  banGhiId String?
  userId   String?
  @@index([xoaSau])
  @@map("blobChoXoa")
}
```

- Một bản ghi có đúng một trong ba khoá, như `FieldValue`; một `CHECK` trong migration giữ điều đó.
- Ba chỉ mục duy nhất theo `sha256` giữ «một tệp một lần trong một ô» ở lần đua mà lượt kiểm trước bỏ sót, như chỉ mục
  `sha256` của `TaiLieuNguon`.
- `BlobChoXoa` là hàng chờ xoá Blob: mọi đường làm mất hàng `FieldFile` ghi đường dẫn vào đây **trong cùng giao dịch**,
  với `xoaSau = now()`, rồi xoá Blob sau khi commit. Xoá Blob hỏng thì hàng còn đó và lịch dọn hằng ngày thử lại. Lý do:
  hàng đã mất mà Blob còn là hợp đồng có dữ liệu cá nhân nằm lại sau «Xoá vĩnh viễn», không ai còn đường dẫn để dọn.
- Cùng hàng chờ ấy bịt tệp bỏ dở: `requestUpload` ghi pathname với `xoaSau` = hạn phiếu; `complete` gỡ hàng trong giao
  dịch ghi `FieldFile`. Người đóng trình duyệt giữa PUT và `complete` thì Blob còn, hàng chờ còn, và lượt dọn đầu tiên
  sau hạn phiếu xoá nó. Lượt dọn chỉ lấy hàng `xoaSau <= now()`, nên không đụng tệp đang tải dở.
- Migration một tệp, tên theo giờ UTC thật lúc viết (luật 1): `ALTER TYPE "FieldType" ADD VALUE 'FILE'`, tạo hai bảng,
  `CHECK`, chỉ mục. Không trỏ bảng nào tạo sau nó (luật 2). Không chép lại dữ liệu nào, nên lùi được bằng cách gỡ hai
  bảng; giá trị enum thì Postgres không gỡ được — ghi ở Known limits của hợp đồng.

### 2. Một kiểu trong bảng kiểu, không đường riêng

`FILE` vào `FIELD_TYPES`. Mọi bảng `Record<FieldTypeName, …>` buộc khai nó, nên trình biên dịch chỉ ra chỗ sót:

| Bảng | Dòng `FILE` |
|---|---|
| `COLUMNS` (`fields-shape.ts`) | `null` — không có cột trong `FieldValue`; đổi kiểu bảng thành `FieldValueColumn \| null` và mọi chỗ đọc xử lý `null`. |
| `SAP_THEO_KIEU` (DA17) | `null` — không sắp được, như Ô tích. `sort=field:<khoá Tệp>` bị bỏ như khoá không sắp được của DA17. |
| Bảng lọc (DA18) | cách lọc «có tệp»: giá trị `some` và `none` (mục 5). |
| `KIEU_TRUONG` (DA14) | `hienThi`: số tệp; `suaTaiCho`: ô Tệp (mục 6); `oBang`: «3 tệp»; ô form tạo: không có (mục 6). |
| `TYPE_KEY`, chữ `type`/`typeNgan` ở `crm.ts` | «Tệp» (chỉ thêm dòng, luật 7). |

**Ghi chữ vào ô Tệp bị từ chối ở một chỗ.** `coerceValue` thêm nhánh `FILE` ném `BAD_REQUEST` «Ô Tệp chỉ nhận tệp tải
lên.», trước `default`. Ba `*.update` và Kara (`writeValues`) đều đi qua nó, nên không lối ghi chữ nào để lại một hàng
`FieldValue` cho trường Tệp. `readValue` thêm nhánh `FILE` trả `null`. Các `switch` có `default` liệt ở báo cáo khảo mã
(`doc-nhap.ts`, `veGiaTri`, `kieuNhap`) thêm nhánh `FILE` tường minh; kế hoạch S2 kê từng chỗ.

Kara: `manage_fields` không thêm Tệp vào danh sách kiểu Kara tạo được; `set_field_value` lên trường Tệp nhận đúng lời
từ chối trên. Kara đọc tệp là DA23.

Cài đặt › Trường: kiểu «Tệp» có trong ô chọn kiểu; ẩn «Kara điền» và lời dặn Kara cho kiểu này (Kara không ghi tệp);
«Hiện trong bộ lọc», «Hiện trên phiếu», «Hiện trong bảng» như mọi kiểu. Đổi kiểu của trường đã có tệp bị chặn như trường
đã có giá trị: lượt đếm ở `fields.update` đếm cả `fieldFile`.

### 3. Tải lên: trình duyệt PUT thẳng lên Blob, API ký và nhận

Theo khuôn Kho tài liệu (`docs/api.md` «The browser uploads, the API only signs and receives»). Dùng chung hay viết
riêng là Hỏi-7; máy khuyên **viết riêng, không sửa tệp nào của Kho tài liệu**:

- **Kho tệp** `packages/db/src/blob-tep-truong.ts`, cùng giao diện `{ bat, kyPut, doc, xoa, kyGet }` và cùng hai lời gọi
  `@vercel/blob` (`issueSignedToken` + `presignUrl` cho PUT, `get` riêng tư, `del`) như `blob-nguon.ts`; thư mục
  `truong-tep`, biến `TEP_BAN_GHI_BLOB_TOKEN`, `access: "private"`, `allowOverwrite: false`. Hai kho, hai khoá; không lùi
  về `KHO_TAI_LIEU_BLOB_TOKEN` hay `BLOB_READ_WRITE_TOKEN`. Gộp hai kho về một nhà máy là hạt giống sau mốc, khi Kho tài
  liệu có lượt riêng.
- **Nhận kiểu theo byte** ở `packages/validation/src/kieu-tep.ts`: PDF (`%PDF-`), DOCX (zip có `word/document.xml`),
  PNG (`89 50 4E 47`), JPEG (`FF D8 FF`). DOCX chứa `word/vbaProject.bin` (tài liệu có macro đổi đuôi) bị từ chối. Cỡ kiểm
  lại trên byte thật ở `complete`, không tin cỡ người gọi khai.
- **Phiếu** HMAC ký `userId|pathname|hetHan` như Kho tài liệu, khoá dẫn từ `BETTER_AUTH_SECRET` với tiền tố riêng
  `truong-tep:phieu:`. Ô đích không nằm trong phiếu mà trong hàng chờ `BlobChoXoa` mà `requestUpload` ghi (`fieldId`, id
  bản ghi, `userId`); `complete` đối chiếu hàng chờ ấy, nên phiếu của ô này không dùng được cho ô khác và pathname không
  do `requestUpload` cấp thì không có hàng chờ để khớp.
- **Hằng số** ở `apps/api/src/fields/field-files-config.ts`: 20 MB mỗi tệp (như Kho tài liệu), 10 tệp mỗi ô (Hỏi-5),
  chữ ký PUT 600 giây, URL tải về 300 giây, phiếu 60 phút.

Router `fieldFiles` (cùng module `fields`, `PhamViDoiTacMiddleware`, `restMeta` cho cả năm thủ tục):

| Thủ tục | Làm gì |
|---|---|
| `status` | `{ bat }` — có khoá hay không. |
| `requestUpload({ entity, recordId, fieldKey, tenTep, kieu, kichThuoc })` | Kiểm trường sống, đúng loại bản ghi, kiểu `FILE`; bản ghi tồn tại và chưa lưu trữ; đuôi khớp kiểu; cỡ trong trần; ô chưa đủ 10 tệp. Ghi pathname vào `BlobChoXoa` với `xoaSau` = hạn phiếu. Trả `{ pathname, url, hetHan, phieu }`; `pathname` = `truong-tep/<uuid>`, không mang id bản ghi. |
| `complete({ phieu, pathname, entity, recordId, fieldKey, tenTep })` | Kiểm phiếu; khoá cố vấn theo pathname trong một giao dịch chỉ dùng `tx`; kiểm lại trường, bản ghi, số tệp; đọc byte, nhận kiểu theo byte, tính `sha256`; trùng `sha256` trong cùng ô → `{ trung: true, tepId }` của hàng cũ và xoá Blob mới; không thì ghi hàng `FieldFile` và gỡ hàng `BlobChoXoa` của pathname trong cùng giao dịch. Từ chối có tên → xoá Blob. |
| `downloadUrl({ tepId })` | Chỉ quản trị (mục 4). URL GET ký 300 giây. |
| `remove({ tepId })` | Theo Hỏi-1 và Hỏi-2 (mục 7). |

Đọc tệp của một ô đi cùng bản ghi: `companies.byId`, `contacts.byId`, `deals.byId` thêm `tepTheoTruong: Record<khoá,
TepTrongO[]>` (`TepTrongO` = id, tên, kiểu, cỡ, lúc tải, người tải, `coTheMo`, `coTheXoa`), xếp theo `taiLuc`. Hai cờ do
máy chủ tính cho người đang gọi — `coTheMo` bằng `coTheMoTep`, `coTheXoa` bằng luật Hỏi-2 — để màn khoá nút bằng đúng câu
trả lời của máy chủ, không tự so vai hay người tải. Ba `list` và `deals.board` thêm
`soTepTheoTruong: Record<khoá, number>` cho trường Tệp bật «Hiện trong bảng», đếm bằng `_count` theo quan hệ, không tải
hàng tệp. Khuôn `TepTrongO` khai bằng Zod ở `packages/validation/src/tep-truong.ts` (AGENTS: khuôn vượt ranh gói sống ở
`packages/validation`); `FieldValueJson` không đổi.

**Đường ghi cho lệnh nạp mẫu (DA22).** Lệnh nạp mẫu gọi đúng ba bước này qua service thật (`requestUpload`, PUT lên URL
đã ký, `complete`) với một người dùng mẫu, như `okr:mau` gọi service. Tệp trùng trong ô trả hàng cũ, nên chạy lại lệnh
không nhân đôi tệp — tiêu chí «chạy lại hai lần» của DA22 đứng trên chính luật trùng này. `FieldFile` không có cột
«mẫu»; DA22 gắn nhãn mẫu trong tên và nội dung tệp.

### 4. Quyền tạm của hàng này

| Ai | Thấy tên, số tệp | Tải lên | Mở, tải về | Xoá |
|---|---|---|---|---|
| Quản trị (`owner`, `admin`) | có | có | có | có |
| Nhân viên (`member`) | có | có | không — `FORBIDDEN` | Hỏi-2 |
| Vai «chỉ OKR» | không — router mang `PhamViDoiTacMiddleware` | không | không | không |

Mở tệp chỉ qua `downloadUrl`; URL ký sống 300 giây, kho riêng tư nên đường dẫn trần không đọc được. Quyền theo chủ bản
ghi là DA20: hàng ấy chỉ đổi một hàm `coTheMoTep(vai, banGhi)` ở `apps/api/src/fields/field-files.service.ts`, nên DA19
đặt luật ở đúng một hàm ấy.

### 5. Lọc «Có tệp» / «Chưa có tệp» trên đường lọc của DA18

Cùng cách mã hoá của DA18: `field:<khoá>=some` và `field:<khoá>=none`; `none` cùng nghĩa «trống» như mọi kiểu của DA18.
Dòng `FILE` của bảng lọc theo kiểu: cách lọc «có tệp», giá trị `some` · `none`, cả hai «hoặc» nhau (chọn cả hai = không
lọc). `fieldFilters` dựng `files: { some: { fieldId } }` và `files: { none: { fieldId } }` trên quan hệ ngược
`Deal.files` / `Company.files` / `Contact.files`. `filterFacetCounts` đếm cả hai, cùng `Promise.all`, bằng `count` theo
quan hệ. Bộ lọc đã lưu giữ khuôn `SavedViewFilters` (`field:<khoá>: ["none"]`); chiến dịch đọc đúng khuôn ấy nên «Cá nhân
chưa có hợp đồng» làm được đoạn chiến dịch. Menu Bộ lọc dùng dạng danh sách lựa chọn có sẵn của `DataTable`: «Có tệp
(n)», «Chưa có tệp (n)». Không cần `cham-tep` mới cho `DataTable`.

Nếu DA18 gộp với tên hàm hay khuôn bảng khác thiết kế của nó, kế hoạch S2 đọc lại tên thật; hợp đồng không đổi.

### 6. Màn

- **Phiếu** (Thoả thuận, Công ty, Cá nhân): ô Tệp nằm trong mục Chi tiết theo thứ tự ở Cài đặt › Trường, như mọi
  trường. Ô gồm danh sách `Item` mỗi tệp (biểu tượng theo kiểu, tên tệp cắt dòng, cỡ, ngày, người tải; nút «Mở» và
  «Xoá» có `aria-label` mang tên tệp) và vùng `NguonKeoTha` «Kéo tệp vào đây hoặc Chọn tệp», mô tả «PDF, DOCX, PNG, JPG ·
  tối đa 20 MB · 10 tệp». Chọn nhiều tệp thì tải lần lượt, mỗi tệp một dòng trạng thái.
- **Nhân viên không phải quản trị**: nút «Mở» khoá, dưới danh sách một dòng «Chỉ quản trị mở được tệp.» (`docs/design.md`:
  nút bị khoá có một dòng nói vì sao).
- **Bản ghi đã lưu trữ**: ô chỉ đọc như mọi ô (`KhoaLuuTru`); API cũng từ chối tải lên và xoá.
- **Bảng và thẻ bảng cột**: «3 tệp», ô trống thì «—»; theo `oBang` của bảng kiểu, như mọi kiểu.
- **Form tạo và ô thêm nhanh** (DA16): theo Hỏi-6. Khuyến nghị: hàng này không vẽ ô Tệp ở đó — lệch có chủ ý so với
  bảng kiểu của `docs/design.md` (cột «Sửa và form tạo» của dòng Tệp ghi «kéo thả `NguonKeoTha`»), ghi ở Known limits của
  hợp đồng, và một hạt giống «ô Tệp trong form tạo» mở sau khi DA16 gộp. Dòng `KIEU_TRUONG` khai mặt form tạo là không
  có, nên DA16 bỏ ô theo bảng chứ không theo tên.
- **Thiếu khoá**: tên và số tệp đã có vẫn hiện; vùng kéo thả khoá với lý do «Kho tệp chưa bật trên máy chủ nên chưa tải
  tệp lên được.»; nút «Mở» khoá cùng lý do.

### 7. Vòng đời (ba câu của `docs/vong-doi.md`)

1. **Dọn thế nào.** Một tệp trong ô: Xoá — hỏi lại một lần bằng `ConfirmDialog` nêu tên tệp, xoá hàng và đưa Blob vào
   `BlobChoXoa` (Hỏi-1). Bản ghi: như hôm nay (lưu trữ → xoá vĩnh viễn); xoá vĩnh viễn (tay, `bulkPurge`, lịch dọn) đưa
   mọi tệp của bản ghi vào `BlobChoXoa` trong cùng giao dịch rồi xoá Blob sau commit. Trường: lưu trữ trường giữ tệp
   (ẩn như mọi giá trị); xoá trường đưa mọi tệp của nó vào `BlobChoXoa`. Lịch dọn hằng ngày
   (`ArchiveRetentionController`) xoá mọi hàng `BlobChoXoa` có `xoaSau <= now()` — tệp xoá hỏng lần trước và tệp tải dở
   quá hạn phiếu — trần `ARCHIVE.prune.maxBatch`, tăng `lanThu` khi hỏng.
2. **«Lịch sử» nghĩa là gì.** Một tệp không có lịch sử riêng ở hàng này — không ai dựa vào nó ngoài người mở. Vì vậy Xoá
   chứ không Lưu trữ. Lịch sử của bản ghi giữ nguyên luật cũ. DA23 (Kara đọc tệp để đề xuất trường) có thể làm tệp có
   lịch sử; hàng ấy xét lại.
3. **Danh sách mặc định hiện gì.** Ô hiện mọi tệp của ô. Không có chỗ «Đã lưu trữ» cho tệp. Bản ghi đã lưu trữ tìm lại ở
   nút «Đã lưu trữ» như nay, tệp đi cùng.

Mỗi lần xoá tệp ghi một dòng log `Field file removed` (`fieldId`, id bản ghi, `tepId`, `userId`) — vết của việc xoá,
như `docs/vong-doi.md` đòi.

### 8. Thiếu khoá thì mất khả năng, không ném lỗi

`TEP_BAN_GHI_BLOB_TOKEN` vắng hay rỗng: `status` trả `{ bat: false }`; `requestUpload`, `complete`, `downloadUrl` trả
`PRECONDITION_FAILED` với chữ tiếng Việt; `remove` vẫn xoá hàng và để Blob lại `BlobChoXoa` (lịch dọn thử lại khi có
khoá); danh sách tên tệp vẫn đọc. Biến khai ở `.env.example` (chỉ thêm, luật 7), `env.validation.ts`, `turbo.json` của
API. Kho thật để đo xin qua yêu cầu `can-nguoi` R3-1 (luật 35): store riêng tư mới, không «Connect Project».

### 9. Đo trên Blob riêng tư thật

Bài kiểm thường dùng kho giả trong bộ nhớ và máy chủ giả theo hợp đồng thật (khuôn `blob-nguon.spec.ts`: `Bun.serve`
đóng `/signed-token`, `/delete`, kiểm mọi yêu cầu mang đúng `Bearer` của khoá tệp). Một bài riêng chạy trên kho thật
khi `TTB_BLOB_THAT=1`: ký PUT, PUT một PDF nhỏ, `complete`, ký GET và tải về đúng `sha256`, đường dẫn trần không đọc được
(kho riêng tư), xoá rồi đọc lại không còn. Cờ bật mà khoá vắng thì bài ném, không bỏ qua.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: phiếu Thoả thuận › Chi tiết › ô «Hợp đồng» (trường Tệp) → kéo hai PDF vào vùng tải → mỗi tệp «Đang tải
  lên…» rồi thành một dòng (tên, cỡ, ngày, người tải) → danh sách Thoả thuận › Bộ lọc › «Hợp đồng» › «Chưa có tệp» →
  bảng chỉ còn thoả thuận chưa có hợp đồng, cột «Hợp đồng» hiện «—» (điểm ra: danh sách đã lọc, lưu được thành bộ lọc).
- Biên: ô trống → «Chưa có tệp.» và vùng tải. Ô đủ 10 tệp → vùng tải khoá với «Ô này đã đủ 10 tệp.». Nhân viên không
  phải quản trị → «Mở» khoá kèm dòng lý do. Bản ghi đã lưu trữ → ô chỉ đọc. Thiếu khoá → vùng tải và «Mở» khoá kèm lý do.
- Lỗi & quay lại: tệp sai kiểu, quá cỡ, trùng → dòng của tệp ấy báo lỗi tiếng Việt kèm cách sửa, các tệp khác vẫn tải;
  mạng đứt giữa PUT → «Chưa tải lên được. Thử lại.» với nút thử lại trên đúng dòng ấy. Xoá → hộp hỏi lại nêu tên tệp,
  «Huỷ» quay về ô không đổi.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Phiếu Thoả thuận, Công ty, Cá nhân › ô Tệp | gắn, mở, xoá tệp của bản ghi | danh sách / danh sách |
| Danh sách ba loại và bảng cột Thoả thuận | thấy số tệp, lọc có hay chưa có tệp | thanh bên / phiếu |
| Cài đặt › Trường › tạo, sửa trường | tạo trường kiểu Tệp | Cài đặt / danh sách trường |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-otep-rong | Phiếu › ô Tệp | «Chưa có tệp.» và vùng «Kéo tệp vào đây hoặc Chọn tệp» | kéo hay chọn tệp |
| ST-otep-dang-tai | Phiếu › ô Tệp | dòng tệp với «Đang tải lên…», `aria-live="polite"` | chờ |
| ST-otep-co-tep | Phiếu › ô Tệp | danh sách tệp (tên, cỡ, ngày, người tải, «Mở», «Xoá») | mở / xoá / tải thêm |
| ST-otep-loi-tep | Phiếu › ô Tệp | dòng tệp báo «Tệp này không phải PDF, DOCX hay ảnh PNG, JPG.» / «Tệp quá 20 MB.» / «Tệp này đã có trong ô.» / «Chưa tải lên được. Thử lại.» | bỏ dòng / thử lại |
| ST-otep-day | Phiếu › ô Tệp | vùng tải khoá, «Ô này đã đủ 10 tệp.» | xoá bớt |
| ST-otep-khong-mo | Phiếu › ô Tệp | «Mở» khoá, «Chỉ quản trị mở được tệp.» | nhờ quản trị |
| ST-otep-tat | Phiếu › ô Tệp | vùng tải và «Mở» khoá, «Kho tệp chưa bật trên máy chủ nên chưa tải tệp lên được.» | báo quản trị |
| ST-otep-luu-tru | Phiếu bản ghi đã lưu trữ | danh sách tệp chỉ đọc, dải «Đã lưu trữ» | khôi phục bản ghi |
| ST-otep-hoi-xoa | Hộp hỏi lại | «Xoá tệp «<tên>»? Tệp mất hẳn, không hoàn tác được.» · «Huỷ» · «Xoá tệp» | xoá / huỷ |
| ST-otep-dang-tai-phieu | Phiếu | khung xương của mục Chi tiết, tiêu đề giữ nguyên | chờ |
| ST-loc-tep | Menu Bộ lọc › trường Tệp | «Có tệp (n)», «Chưa có tệp (n)» | chọn |
| ST-bang-tep | Danh sách / thẻ bảng cột | «3 tệp» hoặc «—» | mở phiếu |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Vùng tải: bấm hay Enter mở hộp chọn tệp (`multiple`, `accept` theo bốn kiểu); kéo thả là lối thêm, không phải lối duy
  nhất. Kiểm kiểu và cỡ ở trình duyệt trước khi xin chữ ký (`lyDoTuChoiTep`), máy chủ kiểm lại theo byte.
- Tên tệp dài cắt một dòng (`truncate`, `min-w-0`), đủ tên ở `title`; mang `translate="no"`.
- Nút «Mở» là `<button>` gọi `downloadUrl` rồi mở URL ký trong tab mới; «Xoá» mở `ConfirmDialog` với nút «Xoá tệp».
- Dưới `md` dòng tệp xuống hai hàng (tên trên, cỡ · ngày · nút dưới), không cuộn ngang ở 375.
- Sau tải lên hay xoá: `cache.deal(id)` / `cache.company(id)` / `cache.contact(id)` (`docs/api.md` «Freshness»).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `NguonKeoTha` (`packages/ui`) | dùng | vùng kéo thả có sẵn, đã có `tat`, `chapNhan`, `toiDaByte` |
| `Item`, `ItemActions` (`packages/ui`) | ghép | dòng tệp; `docs/design.md` cấm `ul divide-y` tự dựng |
| `ConfirmDialog` (`packages/ui`) | dùng | hỏi lại trước khi xoá |
| `KhoaLuuTru` (`packages/ui`) | dùng | ô chỉ đọc trên bản ghi đã lưu trữ |
| `DataTable` mặt lọc danh sách lựa chọn | dùng | «Có tệp», «Chưa có tệp» là hai lựa chọn |

Bậc tra (`docs/design.md` «Vẽ tay là bậc cuối»): dừng ở bậc 1 — `packages/ui` có đủ; không cần shadcn mới hay ReUI.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — hàng thêm một kiểu ô vào phiếu và danh sách có sẵn, không thêm màn; không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Câu hỏi cho Cổng Phạm vi

- **Hỏi-1 (khó đảo: xoá dữ liệu).** Gỡ một tệp khỏi ô là gì. Máy khuyên **Xoá thật**: hỏi lại một lần nêu tên tệp, hàng
  mất, Blob xoá ngay sau commit (lịch dọn thử lại nếu hỏng); xoá vĩnh viễn bản ghi và xoá trường cũng xoá Blob. Căn cứ:
  `docs/vong-doi.md` «Chưa có lịch sử thì Xoá», ghi chú hàng «purgeExpired xoá kèm Blob». Lối khác: tệp gỡ ra vào mục
  «Đã lưu trữ» của ô, xoá vĩnh viễn theo hạn dọn 180 ngày — lỡ tay lấy lại được, giá là thêm cột lưu trữ, mục gập, và hợp
  đồng gỡ ra vẫn nằm trong kho nửa năm.
- **Hỏi-2 (khó đảo: xoá dữ liệu).** Ai xoá được tệp khỏi ô. Máy khuyên **quản trị và chính người đã tải tệp ấy lên**:
  hợp đồng là thứ người khác dựa vào; nhân viên khác thấy tên nhưng không mở được tệp (quyền tạm), nên cũng không nên
  xoá được thứ mình không xem được. Lối khác: ai sửa được bản ghi thì xoá được, như mọi giá trị trường hôm nay — một luật
  cho mọi ô, giá là một người lỡ tay xoá hợp đồng của đồng nghiệp mà không mở ra xem được trước.
- **Hỏi-3.** Ngưỡng của Đường đo (ô Cổng Đáng để trống ngưỡng). Máy đề xuất: ở phiên nghiệm thu, ít nhất bốn trên năm
  người gắn được một hợp đồng PDF vào thoả thuận và lọc ra thoả thuận chưa có hợp đồng mà không hỏi; dấu CHẾT là một tệp
  mở được bởi người không phải quản trị trước khi DA20 lên, hoặc `BlobChoXoa` còn hàng quá ba ngày trên production.
- **Hỏi-4.** Bỏ design-pass. Máy khuyên bỏ: luật 44 cấm viết mã (kể cả bản mẫu `/proto` trong `apps/app`) trước khi DA18
  gộp, ô Tệp ghép từ `NguonKeoTha` và `Item` có sẵn, E10 đo mắt người ở S4. Lối khác: design-pass ngay khi DA18 gộp,
  trước S3 — nhìn bản bấm được trước khi duyệt, giá là S3 lùi nửa ngày, sát mốc 22/10.
- **Hỏi-5.** Trần số tệp mỗi ô. Máy khuyên **10**, như thuộc tính Tệp của HubSpot; 20 MB mỗi tệp đã có căn cứ ở Kho tài
  liệu. Lối khác: không trần — một ô giữ cả bộ hồ sơ, giá là ô dài vô hạn trên phiếu và không có số nào chặn một lệnh lỗi
  tải lặp.

- **Hỏi-6 (lệch luật đích).** Ô Tệp trong form tạo và ô thêm nhanh. `docs/design.md` mục «Trường» ghi form tạo của Tệp là
  kéo thả `NguonKeoTha`, và form tạo hiện trường bắt buộc cùng trường đang hiện trên phiếu. Máy khuyên **lệch có chủ ý ở
  hàng này**: form tạo là của DA16 (V3, chưa gộp), làm ô ở đó trước khi DA16 gộp là hai dãy cùng sửa một form, sát mốc
  22/10; ghi lệch ở Known limits, mở hạt giống sau khi DA16 gộp, «Bắt buộc» cho Tệp đi cùng hạt giống ấy. Lối khác: làm
  luôn — form giữ tệp đã chọn ở máy khách, tạo bản ghi rồi tải lên id vừa có; đúng luật «một trường, một cách cư xử», giá
  là phụ thuộc DA16 gộp trước S3 của hàng này, và một lượt tải hỏng sau khi bản ghi đã tạo cần đường báo riêng.
- **Hỏi-7 (chạm tính năng đang chạy).** Dùng chung mã Blob với Kho tài liệu hay viết riêng. Máy khuyên **viết riêng**:
  `blob-tep-truong.ts` cùng khuôn, không sửa tệp nào của Kho tài liệu (đang chạy trên production); E8b chứng bốn bài cũ
  của Kho tài liệu và `git diff` rỗng ở các tệp ấy. Lối khác: rút `blob-nguon.ts` thành nhà máy dùng chung — một khuôn,
  giá là sửa đường tải nguồn đang chạy sát mốc, và bài cũ chưa chắc phủ mọi tham số ký.
- **Hỏi-8 (rủi ro khi lên).** Quét mã độc. Máy khuyên **để sau**: chỉ quản trị mở tệp, kiểu nhận theo byte, DOCX có macro
  bị từ chối. Lối khác: quét trước khi nhận (dịch vụ quét ngoài, hay ClamAV trong agent) — an toàn hơn, giá là một dịch vụ
  mới, một khoá mới và trễ mỗi lượt tải.

## Không làm trong hàng này

- Mở tệp theo chủ bản ghi, quyền đổi theo chủ (DA20).
- Kara đọc chữ trong tệp (DA23); Kara tạo trường Tệp.
- Bộ hợp đồng mẫu (DA22) — hàng này chỉ bảo đảm đường ghi dùng được cho nó.
- Xem trước PDF trên phiếu; quét mã độc (Hỏi-8).
- Ô Tệp trong form tạo và ô thêm nhanh; bật «Bắt buộc» cho trường Tệp (theo khuyến nghị Hỏi-6).
- Đổi tên tệp, sắp lại tệp trong ô, sort theo số tệp.
- HEIC, XLSX, ZIP.
