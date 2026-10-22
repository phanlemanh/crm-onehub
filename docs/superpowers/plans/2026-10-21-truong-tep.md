# Kiểu trường Tệp — kế hoạch thực thi (NHÁP, chờ Cổng Phạm vi và DA18 gộp)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm kiểu trường `FILE`: nhiều tệp mỗi ô trên Thoả thuận, Công ty, Cá nhân, tải lên kho Blob riêng tư bằng URL
ký trước, quyền tạm chỉ quản trị mở, lọc «Có tệp / Chưa có tệp», xoá kèm Blob qua hàng chờ.

**Architecture:** Bảng `FieldFile` cạnh `FieldValue`; hàng chờ `BlobChoXoa` cho mọi lần Blob phải mất (xoá, xoá vĩnh viễn,
tải dở). Router `fieldFiles` trong module `fields` ký và nhận; byte đi thẳng trình duyệt → Blob. `FILE` vào mọi bảng
theo kiểu, nên trình biên dịch và rang `quet-kieu` chỉ ra chỗ sót.

**Tech Stack:** Prisma (Postgres), NestJS + nestjs-trpc, `@vercel/blob` (`issueSignedToken`, `presignUrl`, `get`, `del`),
Next.js + `@crm/ui` (`NguonKeoTha`, `Item`, `ConfirmDialog`, `KhoaLuuTru`), nuqs, bun test.

**Spec:** `docs/superpowers/specs/2026-10-21-truong-tep-design.md` · hợp đồng `_acceptance/truong-tep/contract.md` · evals
`_acceptance/truong-tep/evals.yaml`.

**Trạng thái:** Task 0 đã chạy trên onehub `c9e4ce605` (DA18 #526 đã gộp; nhánh gộp ở `7f91e5453`). Tên thật đã đọc:

- DA17 (`packages/db/src/fields-shape.ts`): `SAP_THEO_KIEU` (`Record<FieldTypeName, CachSapTruong | null>`),
  `cachSapTruong`, `sapDuocTheoKieu`, `TIEN_TO_COT_TRUONG = "field:"`.
- DA18 (`fields-shape.ts`): `LOC_THEO_KIEU` (`Record<FieldTypeName, CachLocTruong>`), `CachLocTruong = "chua" | "khoang"
  | "moc" | "tich" | "luaChon" | "nguoi"`, `cachLocTruong`, `locDuocTheoKieu`, `locDuocTrong`.
- DA18 (`packages/validation/src/bo-loc-truong.ts`): `GIA_TRI_TRONG = "none"`, `LocTruong` (hợp có nhãn `cach`),
  `phanTichLocTruong(cach, giaTri)`, `laGiaTriHopLe`, `LocTruongError`.
- DA18 (`apps/api/src/fields/fields.service.ts`): `DieuKienTruong` (chỉ nhánh `fieldValues` và `OR`), `coGiaTriCua`
  (dựa `columnFor`), `dieuKienLoc`, `filterFacetCounts`, `filterableFieldsFor`, `sapTheoTruong`.
- DA14 (`apps/app/components/crm/fields/kieu-truong.tsx`): `DongKieu = { hienThi, suaTaiCho, oBang, anDuoi, canh }`,
  `KIEU_TRUONG satisfies Record<KieuTruong, DongKieu>`. Chưa có mặt form tạo: DA16 (#533, nháp) chưa có mã.
- `coerceValue` ném `FieldValueError(key, message)` (`fields-shape.ts`); API dịch nó thành `BAD_REQUEST`.

Va chạm đang mở: DA15 (#534, sẵn sàng) chạm `schema.prisma` (bảng `standardFieldLayout`, migration `20261021054942`),
ba phiếu `record-sheet/*-sheet.tsx`, `fields-list.tsx`, `record-fields.tsx`, `crm.ts`, `cache.ts`. Hàng này gộp onehub
lại trước Task 1 nếu #534 đã gộp, và luôn trước Task 7. Migration của hàng này mang giờ UTC lúc viết, nên xếp sau
`20261021054942` (luật 2).

Kế hoạch giả định khuyến nghị của cả tám câu Hỏi (chủ kho đã duyệt cả tám ở Cổng Phạm vi, `89cb431c1`).

## Global Constraints

- Không viết chú thích trong mã, kể cả mã sửa (`AGENTS.md`).
- Migration: tên theo `date -u +%Y%m%d%H%M%S` lúc viết; không trỏ bảng tạo ở migration xếp sau; kiểm `origin/onehub`
  trước khi gộp (luật 1–2).
- `.env.example`, `apps/app/lib/messages/*.ts`, `_acceptance/config.yaml`, `CONTEXT.md`: chỉ thêm dòng (luật 7).
- Hằng số ở `apps/api/src/fields/field-files-config.ts`: `TEP_TRUONG.toiDaByte = 20 * MB`, `toiDaTepMoiO = 10`,
  `kyPutGiay = 600`, `taiVeGiay = 300`, `phieuPhut = 60`.
- Biến khoá `TEP_BAN_GHI_BLOB_TOKEN`; không lùi về `KHO_TAI_LIEU_BLOB_TOKEN` hay `BLOB_READ_WRITE_TOKEN`.
- Không sửa tệp nào của Kho tài liệu (Hỏi-7): `packages/db/src/blob-nguon.ts`, `apps/api/src/tai-lieu/**`.
- Chữ trên màn tiếng Việt theo `CONTEXT.md`: «trường», «Cá nhân», «Xoá», «Đã lưu trữ»; tên tệp mang `translate="no"`.
- Mỗi phép đo mới có cặp hai chiều cùng fixture, thông điệp ghim (khuôn trong `evals.yaml`).
- Năm lệnh từ gốc kho trước S4: `bun run test`, `check-types`, `lint`, `lint:slop`, `build`.

## Review Focus

- Hai người cùng thả đúng một tệp vào cùng một ô cùng lúc → một hàng, người sau nhận «Tệp này đã có trong ô.» — E3 «đua».
- Người mất mạng giữa PUT và `complete` rồi thử lại → lượt mới xin chữ ký mới; Blob cũ được dọn sau hạn phiếu — E7 «tải dở».
- Tên tệp có dấu tiếng Việt, dấu cách, rất dài → lưu và hiện nguyên văn, cắt một dòng trên màn — E2 (tên «Hợp đồng hợp tác —
  bản ký 2026.pdf» 240 ký tự) và E10 bước 2.
- Bản ghi bị lưu trữ trong lúc một tệp đang tải → `complete` kiểm lại trong giao dịch và từ chối, Blob xoá — E3
  (ô «lưu trữ giữa chừng»).
- Thiếu khoá ở máy chủ nhưng hàng `FieldFile` đã có → phiếu vẫn mở, tên hiện, không lỗi 500 — E8(b).

---

## Bảng tóm tắt

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Quản trị viên tạo được trường kiểu Tệp | `schema.prisma`, migration | AC-1 (tạo trường Tệp) |
| Ô Tệp không nhận chữ từ mọi lối ghi, kể cả Kara | `fields-shape.ts`, `fields.ts`, `apps/agent/agent/tools/*` | AC-9 (chặn lối ghi chữ) |
| Tệp được giữ trong kho riêng tư, thiếu khoá thì mất khả năng | `blob-tep-truong.ts`, `kieu-tep.ts`, `blob-cho-xoa.ts` | AC-8 (thiếu khoá) |
| Nhân viên tải lên, quản trị viên mở, người tải lên xoá | `apps/api/src/fields/field-files.*` | AC-2, AC-3, AC-4, AC-6 |
| Xoá vĩnh viễn bản ghi hay trường xoá luôn tệp | ba `*.service.ts`, `archive-retention.controller.ts` | AC-7 (vòng đời) |
| Lọc «Có tệp», «Chưa có tệp», lưu thành bộ lọc | `fields-shape.ts` (bảng lọc DA18), `fields.service.ts` | AC-5 (lọc) |
| Ô Tệp trên phiếu, «n tệp» trong bảng, menu lọc | `apps/app/components/crm/fields/**` | AC-1, AC-4, AC-5, AC-10 |
| Người chấm nhìn được màn thật | `_acceptance/truong-tep/rang/do-man.mjs` | AC-10 (mắt người) |

---

### Task 0: Gộp onehub sau DA18, đường nền

**Files:** không sửa tệp nguồn.

- [ ] Gộp: `git fetch origin onehub && git merge origin/onehub` (merge commit). `bun install` nếu `bun.lock` đổi (luật 4).
- [ ] Xin lượt `duong-nen`, chạy `node "$WORKFLOWS_DIR/../scripts/duong-nen.mjs" --root . --slug truong-tep` qua lệnh bọc
  `giu-nhip`, nhả khoá. Mã 1 → gỡ thứ gỡ được, thứ chỉ người gỡ báo giám sát.
- [x] Đọc tên thật trên onehub mới (xong — mục «Trạng thái» ở đầu): bảng lọc theo kiểu và bộ phân tích của DA18 (`packages/validation/src/bo-loc-truong.ts`
  hay tên khác), `SAP_THEO_KIEU` của DA17, mặt form tạo của DA16 nếu đã gộp. Khác kế hoạch thì sửa task 2, 6, 7 ở kế
  hoạch này, không sửa hợp đồng; ghi dòng sổ `fix` stage S2.
- [ ] Kiểm khoá R3-1 đã về: `grep -c '^TEP_BAN_GHI_BLOB_TOKEN=' .env` bằng 1 (giá trị không in ra).

### Task 1: Dữ liệu — enum, `FieldFile`, `BlobChoXoa`

`independent: false` (mọi task sau đứng trên nó).

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (enum `FieldType` thêm `FILE`; model `FieldFile`, `BlobChoXoa`; quan hệ ngược
  `files FieldFile[]` ở `Company`, `Contact`, `Deal`, `FieldDefinition`; `User.fieldFilesUploaded`).
- Create: `packages/db/prisma/migrations/<UTC>_truong_tep/migration.sql`.

**Interfaces — Produces:** bảng `fieldFile` (cột như design mục 1), `blobChoXoa { pathname @id, kho, taoLuc, xoaSau,
lanThu, fieldId?, banGhiId?, userId? }`, `CHECK (num_nonnulls("companyId","contactId","dealId") = 1)` trên `fieldFile`.

- [ ] Viết schema và migration (`ALTER TYPE "FieldType" ADD VALUE 'FILE'` trên dòng riêng, rồi `CREATE TABLE`).
- [ ] `cd packages/db && bunx --bun prisma validate` → «is valid»; `bun run db:test --reset` → migrate sạch.
- [ ] Commit `feat(truong-tep): bảng tệp của trường và hàng chờ xoá Blob`.

### Task 2: `FILE` trong mọi bảng theo kiểu; chặn lối ghi chữ

`independent: false` (Task 4, 6, 7 đọc bảng này).

**Files:**
- Modify: `packages/db/src/fields-shape.ts` — `FIELD_TYPES` thêm `"FILE"`; `COLUMNS: Record<FieldTypeName, FieldValueColumn
  | null>` với `FILE: null` và `columnFor` trả `FieldValueColumn | null`; `SAP_THEO_KIEU.FILE = null`; `LOC_THEO_KIEU.FILE =
  "coTep"` (thêm `"coTep"` vào `CachLocTruong`); `locDuocTrong("FILE")` trả `true`.
- Modify: `packages/db/src/fields.ts` — `coerceValue` nhánh `case "FILE"` ném `BadRequest(FIELD_FILE_COPY.chiNhanTep)`
  trước `default`; `readValue` nhánh `FILE` trả `null`; `writeValues` bỏ qua `COLUMNS[type] === null`.
- Modify: mọi `switch` theo kiểu mà rang liệt (`doc-nhap.ts`, `kieu-truong.tsx` `veGiaTri`/`kieuNhap`, `field-columns.tsx`,
  `apps/agent/agent/tools/manage_fields.ts` không thêm FILE vào danh sách tạo).
- Modify: `apps/api/src/fields/fields.service.ts` — đếm ở `update` (đổi kiểu) cộng `fieldFile.count`.
- Create: `_acceptance/truong-tep/rang/quet-kieu.mjs`.
- Test: `apps/api/test/truong-tep.spec.ts` (`ttp-ghi-chu`), `apps/agent/test/truong-tep.integration.spec.ts` (`ttp-kara`).

**Interfaces — Produces:** `FIELD_FILE_COPY.chiNhanTep = "Ô Tệp chỉ nhận tệp tải lên."` (trong
ném bằng `FieldValueError(key, FIELD_FILE_COPY.chiNhanTep)`, hằng ở `packages/db/src/fields-shape.ts` cạnh `FieldValueError`).

- [ ] Viết `ttp-ghi-chu` (11 ô, E9) và `ttp-kara`; chạy → đỏ «ttp ghi chu: deals.update abc nhan» (hôm nay `default` nhận chữ).
- [ ] Viết rang `quet-kieu.mjs` (E9b); chạy trên cây chưa sửa với `FIELD_TYPES` đã thêm FILE → đỏ «switch thieu FILE
  packages/db/src/fields.ts:118»; lượt phá-thử trên bản chép → «thuoc mu» không ném.
- [ ] Sửa các tệp trên; ba lệnh trên xanh; `bun run check-types` xanh.
- [ ] Commit.

### Task 3: Kho tệp, nhận kiểu theo byte, hàng chờ, biến khoá

`independent: true` so với Task 2 (không chung tệp); đứng trên Task 1.

**Files:**
- Create: `packages/db/src/blob-tep-truong.ts` — `export const BLOB_TEP_TRUONG = { thuMuc: "truong-tep", bienKhoa:
  "TEP_BAN_GHI_BLOB_TOKEN", ... } as const`; `export function khoTepTruong(): KhoTepTruong` với `bat(): boolean`,
  `kyPut({ pathname, kieu, toiDaByte }): Promise<{ url: string; hetHan: Date }>`, `doc(pathname): Promise<Uint8Array |
  null>`, `xoa(pathname): Promise<void>`, `kyGet(pathname, giay): Promise<string>`; `PATHNAME_TEP(id) = \`truong-tep/${id}\``.
- Create: `packages/validation/src/kieu-tep.ts` — `KIEU_TEP = ["application/pdf", DOCX_MIME, "image/png", "image/jpeg"]`;
  `nhanKieuTep(byte: Uint8Array): { kieu: KieuTep } | { loi: "khong-nhan" | "macro" }`.
- Create: `packages/db/src/blob-cho-xoa.ts` — `ghiChoXoa(tx, rows: { pathname; xoaSau; fieldId?; banGhiId?; userId? }[])`,
  `goChoXoa(tx, pathname)`, `ghiChoXoaTheoBanGhi(tx, where: Prisma.FieldFileWhereInput)`, `donChoXoa(kho, now, toiDa):
  Promise<{ daXoa: number; hong: number }>`.
- Modify: `.env.example` (khối mới ngay dưới `KHO_TAI_LIEU_BLOB_TOKEN`), `apps/api/src/config/env.validation.ts`,
  `apps/api/turbo.json`, `turbo.json` gốc.
- Create: `packages/db/test/blob-tep-truong.spec.ts` (`ttp-khoa`), `packages/db/test/blob-tep-truong-gia.ts` (kho giả trong
  bộ nhớ, cùng hình `khoNguonGia`), `_acceptance/truong-tep/rang/bai-cu-nguyen.mjs`.

- [ ] Viết `ttp-khoa` (máy chủ giả `Bun.serve` theo hợp đồng `@vercel/blob`, bảng hai biến 2 × 2) → đỏ vì tệp chưa có.
- [ ] Viết bài nhận kiểu: năm byte đầu thật, DOCX có `word/vbaProject.bin` → `macro`, byte rác → `khong-nhan`.
- [ ] Viết `bai-cu-nguyen.mjs` (E8b) với cặp hai chiều.
- [ ] Hiện thực; ba bài xanh; bộ bài Kho tài liệu (`ttp_kho_tai_lieu`) xanh nguyên văn.
- [ ] Commit.

### Task 4: Router `fieldFiles`, quyền, đọc tệp theo bản ghi

`independent: false` (đứng trên Task 2, 3).

**Files:**
- Create: `apps/api/src/fields/field-files.router.ts` (`@Router({ alias: "fieldFiles" })`, `PhamViDoiTacMiddleware`,
  `restMeta` cho năm thủ tục), `field-files.service.ts`, `field-files.contracts.ts`, `field-files-config.ts`,
  `kho-tep.ts` (provider token `KHO_TEP` để test bơm kho giả).
- Create: `packages/validation/src/tep-truong.ts` — `tepTrongO = z.object({ id, tenTep, kieu, kichThuoc, taiLuc, taiBoi:
  { id, ten } | null, coTheMo: boolean, coTheXoa: boolean })`, `type TepTrongO = z.infer<typeof tepTrongO>`.
- Modify: `apps/api/src/fields/fields.module.ts`; `deals|companies|contacts.service.ts` (`byId` thêm `tepTheoTruong`,
  `list`/`board` thêm `soTepTheoTruong` bằng `_count`); `apps/api/src/generated/server.ts` (`bun run trpc:generate`).
- Test: `apps/api/test/truong-tep.spec.ts` — `ttp-tao-truong`, `ttp-tai-len`, `ttp-tu-choi`, `ttp-quyen`, `ttp-xoa` (phần
  không cần lịch dọn), `ttp-tat`.

**Interfaces — Produces:**
- `FieldFilesService.status(): { bat: boolean }`
- `requestUpload(userId, { entity, recordId, fieldKey, tenTep, kieu, kichThuoc }): { pathname, url, hetHan, phieu }`
- `complete(userId, { phieu, pathname, entity, recordId, fieldKey, tenTep }): { tepId: string; trung: boolean }`
- `downloadUrl(userId, { tepId }): { url: string; hetHan: Date }`
- `remove(userId, { tepId }): { tepId: string }`
- `coTheMoTep(vai: WorkspaceRole): boolean` và `coTheXoaTep(vai, taiBoiId, userId): boolean` — đúng hai hàm luật, DA20
  thay `coTheMoTep`.
- Phiếu: `kyPhieuTep(userId, pathname, hetHan)` / `kiemPhieuTep(...)` trong `field-files.service.ts`, khoá
  `truong-tep:phieu:` + `BETTER_AUTH_SECRET`, `timingSafeEqual`.

- [ ] Viết sáu ca test theo `evals.yaml` (E1, E2, E3 17 ô, E4 18 + 4 ô, E6 6 ô, E8 vế b) → đỏ.
- [ ] Hiện thực; `complete` một giao dịch chỉ `tx` với `pg_advisory_xact_lock(hashtext(pathname))`, kiểm cỡ byte thật,
  trùng theo `@@unique([fieldId, dealId, sha256])` bắt `P2002` để trả hàng cũ.
- [ ] Log `Field file removed` với `fieldId`, `recordId`, `tepId`, `userId` (khuôn `docs/api.md` mục Logging).
- [ ] Các ca xanh; lượt phá-thử của E3, E4 ghi vào sổ S3.
- [ ] Commit.

### Task 5: Vòng đời — xoá vĩnh viễn, xoá trường, lịch dọn

`independent: false` (đứng trên Task 4; chung `*.service.ts`).

**Files:**
- Modify: `deals.service.ts`, `contacts.service.ts`, `companies.service.ts` — trong giao dịch `purge` gọi
  `ghiChoXoaTheoBanGhi(tx, { dealId: id })` trước `delete`; sau commit `donChoXoa` cho đúng các pathname ấy (log, không ném).
- Modify: `apps/api/src/fields/fields.service.ts` — `delete` một giao dịch: `ghiChoXoaTheoBanGhi(tx, { fieldId: id })` rồi
  xoá định nghĩa.
- Modify: `apps/api/src/archive/archive-retention.controller.ts` — sau `purgeExpired` gọi `donChoXoa(kho, now,
  ARCHIVE.prune.maxBatch)`.
- Test: `ttp-vong-doi` (7 ô + lùi + hỏng + tải dở), phần lịch dọn của `ttp-xoa`.

- [ ] Viết `ttp-vong-doi` → đỏ «deals.purge hang con»/«xoa []».
- [ ] Hiện thực; xanh; đột biến tay «bỏ ghi hàng chờ ở deals.purge» đỏ đúng thông điệp, ghi sổ S3.
- [ ] `bun test test/luu-tru-chat.spec.ts` (bài vòng đời cũ) xanh.
- [ ] Commit.

### Task 6: Lọc «Có tệp / Chưa có tệp» trên bảng lọc của DA18

`independent: false` (chung `fields.service.ts` với Task 5).

**Files:**
- Modify: `packages/db/src/fields-shape.ts` — dòng `FILE` của `LOC_THEO_KIEU` đã thêm ở Task 2 (`"coTep"`); hằng
  `GIA_TRI_CO_TEP = "some"` cạnh `GIA_TRI_TRONG` ở `bo-loc-truong.ts`.
- Modify: `packages/validation/src/bo-loc-truong.ts` — `docMotGia` nhận `"some"` cho cách `coTep` (`none` đã là
  `GIA_TRI_TRONG`); `LocTruong` thêm `{ cach: "coTep"; co: boolean; trong: boolean }`; giá trị khác ném `LocTruongError`.
- Modify: `apps/api/src/fields/fields.service.ts` — `DieuKienTruong` thêm nhánh `{ files: { some | none: Prisma.FieldFileWhereInput } }`;
  `dieuKienLoc` nhánh `coTep`; `coGiaTriCua` không gọi cho `FILE` (trống của Tệp là `files: { none: { fieldId } }`).
- Modify: `FieldsService.filterFacetCounts` — trường `coTep` đếm `some` và `none` bằng `<relation>.count` với
  `files: { some | none: { fieldId } }`, trong cùng `Promise.all`; `filterableFieldsFor` không đổi (đọc `LOC_THEO_KIEU`).
- Test: `ttp-loc` (12 ô + đếm + chiến dịch + hỏng).

- [ ] Viết `ttp-loc` → đỏ; hiện thực; xanh; bộ bài `loc-moi-truong.spec.ts` của DA18 xanh nguyên văn.
- [ ] Commit.

### Task 7: Màn — ô Tệp, Cài đặt › Trường, bảng, menu lọc

`independent: false` (đọc kiểu tRPC của Task 4, bảng của Task 2, 6).

**Files:**
- Create: `apps/app/components/crm/fields/o-tep.tsx` (client; props `{ tep: TepTrongO[]; entity; recordId; fieldKey;
  bat: boolean; luuTru: boolean }` — kiểu tự khai ở tệp, không re-export kiểu máy chủ).
- Modify: `kieu-truong.tsx` (dòng `FILE` của `KIEU_TRUONG`: `hienThi` số tệp, `suaTaiCho` → `OTep`, `oBang` «n tệp»/«—»,
  `anDuoi: "md"`, `canh: "left"`; `DongKieu` chưa có mặt form tạo — DA16 thêm mặt ấy thì khai `FILE` là không có,
  theo Hỏi-6), `field-editor.tsx` (ẩn «Kara điền» và lời dặn khi `FILE`), `fields-copy.ts` (`TYPE_KEY.FILE`),
  `field-facets.tsx`, `apps/app/lib/messages/crm.ts` (chỉ thêm dòng: `type.FILE`, `typeNgan.FILE`, chữ ô Tệp, lý do khoá),
  `apps/app/lib/trpc/cache.ts` không đổi — `onSuccess` gọi `cache.deal(id)` / `cache.company(id)` / `cache.contact(id)`.
- Test: `apps/app/test/truong-tep.dom.tsx` — `ttp-cai-dat`, `ttp-o-tep` (12 ô), `ttp-man-loc`.

- [ ] Viết ba ca dom → đỏ; hiện thực; xanh.
- [ ] Cập nhật `apps/app/test/chu-man-tieng-viet.dom.tsx:232` (`FIELD_TYPES.length * 2`) bằng cách đọc độ dài lúc chạy,
  không viết số mới — bài cũ đếm theo bảng, không nới.
- [ ] Commit.

### Task 8: Đo trên Blob thật và đo màn

`independent: true` so với Task 7 phần rang (tệp khác); bài Blob thật đứng trên Task 4.

**Files:**
- Create: `apps/api/test/truong-tep-blob-that.spec.ts` (`ttp-blob-that`, `describe.skipIf(process.env.TTB_BLOB_THAT !== "1")`).
- Create: `_acceptance/truong-tep/rang/do-man.mjs` (dựng máy chủ Blob giả của Task 3 cho phiên đo, tám ảnh, các
  thông điệp thoát của E10).

- [ ] Chạy `config:executors.test.ttp_blob_that` với khoá R3-1 → xanh, «0 skip»; đột biến `access: "public"` ở bản sao
  → đỏ «khong rieng tu», ghi sổ S3.
- [ ] Chạy `config:executors.script.ttp_man` qua `tien-de.mjs` → «ttp man: dat», tám ảnh trong `evidence/`.
- [ ] Commit.

### Task 9: Tài liệu

`independent: true`.

**Files:**
- Modify: `CONTEXT.md` (chỉ thêm mục «**Tệp** (kiểu trường)» và «**Hàng chờ xoá tệp**» nếu từ ấy hiện ra màn — không
  hiện thì không thêm), `docs/api.md` (mục mới «Trường Tệp: tải lên, quyền tạm, hàng chờ xoá» cạnh «Kho tài liệu: nguồn»),
  `docs/environment.md` (dòng `TEP_BAN_GHI_BLOB_TOKEN`), `docs/production.md` (dòng store mới ở bảng «Kho Blob», khi
  store production có).
- [ ] Commit.

### Sau Task 9

- [ ] Năm lệnh từ gốc kho xanh.
- [ ] Contract `status: implemented`, xin lượt `s4`, S4 theo feature-loop.

## Hỏi nào đổi task nào

| Hỏi | Lối khác đổi gì |
|---|---|
| Hỏi-1 lưu trữ tệp | Task 1 thêm `archivedAt` ở `FieldFile`; Task 4 `remove` thành `archive`; Task 7 thêm `ArchivedList` trong ô |
| Hỏi-2 ai cũng xoá | Task 4 `coTheXoaTep` trả `true` cho mọi vai đọc được đối tác; E6 đáp án đổi |
| Hỏi-5 không trần | Task 4 bỏ kiểm số tệp; E3 bỏ ô «ô đầy» (15 ô) |
| Hỏi-6 làm luôn form tạo | Task 7 thêm ô Tệp ở form tạo của DA16 (chọn tệp ở máy khách, tải sau `create`); E9b(c) đảo |
| Hỏi-7 dùng chung | Task 3 rút `blob-nguon.ts` thành nhà máy; E8b chỉ giữ bài cũ nguyên |
| Hỏi-8 quét mã độc | thêm một task: dịch vụ quét ở `apps/agent` qua `AgentTask`, tệp ở trạng thái «đang kiểm» tới khi xong |
