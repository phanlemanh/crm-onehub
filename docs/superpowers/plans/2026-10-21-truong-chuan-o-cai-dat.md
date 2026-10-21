# Trường chuẩn và «Bắt buộc» ở Cài đặt — kế hoạch thi công (DA15)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quản trị đặt được mục Chi tiết của phiếu ở Cài đặt › Trường — một danh sách trộn trường chuẩn với trường tự tạo, sắp lại, ẩn trường chuẩn, bật «Bắt buộc» cho trường tự tạo — và phiếu vẽ đúng bố trí ấy.

**Architecture:** Một bảng mới `StandardFieldLayout` giữ `position`/`hidden` của trường chuẩn, chung trục `position` với `FieldDefinition`. Một hàm thuần trộn hai nguồn thành danh sách đã sắp (`packages/db/src/fields-chuan.ts`), dùng ở API và trong bài kiểm. API thêm `fields.layout`, `fields.setStandardHidden`, cho `fields.reorder` nhận thêm danh sách trộn; app đọc `fields.layout` để vẽ phiếu và Cài đặt.

**Tech Stack:** Prisma (Postgres), NestJS + nestjs-trpc, Zod, Next.js app router, React Query, bun test + happy-dom.

**Spec:** `docs/superpowers/specs/2026-10-21-truong-chuan-o-cai-dat-design.md` · hợp đồng `_acceptance/truong-chuan-o-cai-dat/contract.md` (approved 21/10, manh) · evals `_acceptance/truong-chuan-o-cai-dat/evals.yaml`.

## Global Constraints

- Không chú thích trong mã (`AGENTS.md`).
- Migration: tên lấy giờ UTC thật lúc tạo (`date -u +%Y%m%d%H%M%S`), chỉ `CREATE TABLE`/`CREATE INDEX`/`ADD CONSTRAINT` trên bảng mới; ngay trước khi gộp kiểm `origin/onehub` không có migration mới hơn (luật 1–2 của đợt).
- Không chạm `packages/ui` (vùng Mac Studio) và `apps/agent` (vùng DA21).
- `apps/app/lib/messages/*.ts` chỉ thêm dòng; `standardRow`, `standardNote`, `customGroup` để nguyên dù thôi dùng (luật 7).
- Hình dạng dùng chung giữa API và app sống ở `packages/validation/src/bo-tri-truong.ts`, nhập bằng `@crm/validation/bo-tri-truong`; parse ở biên (`AGENTS.md`).
- Tên gọi theo `CONTEXT.md`: «trường», «trường chuẩn», «trường tự tạo». Không «tuỳ chỉnh», không «động».
- Danh mục trường chuẩn (thứ tự mặc định; bắt buộc in đậm): Thoả thuận **name** · amount · **currency** · expectedCloseDate · **company** · **owner** — Công ty **name** · domain · website · phone · email · city · country · owner — Liên hệ **firstName** · lastName · title · email · phone · linkedin · x · github · company · owner.
- Câu toast lỗi: «Chưa lưu được thứ tự.» (kéo) và `truongKieu.chuaLuu(<nhãn>)` = «Chưa lưu được <nhãn>.» (công tắc). Lý do khoá: «Trường bắt buộc luôn hiện trên phiếu». Không in `error.message`.
- Mỗi phép đo mới đi kèm cặp hai chiều cùng fixture (vật lành xanh, bản phá đỏ với thông điệp ghim) — khuôn MEASURE-BIRTH của feature-loop.
- Năm lệnh chứng minh ở gốc kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## Review Focus

- Trường tự tạo đã lưu trữ rồi khôi phục giữ `position` cũ, có thể trùng số với một trường chuẩn: thứ tự phải tất định — cùng `position` thì trường chuẩn trước, rồi theo khoá. Bài: `sapBoTri` hoà số (Task 1).
- Danh sách cũ trên màn (người khác vừa tạo trường) gửi `fields.reorder` thiếu một mục: máy chủ từ chối, màn về thứ tự trước, báo lỗi và tải lại danh sách. Bài: ca lỗi của E2 + `onSettled` làm mới (Task 5).
- Danh mục thêm khoá chuẩn sau lần sắp đầu (khoá chưa có hàng bố trí): đứng ngay sau khoá chuẩn liền trước trong danh mục, không nhảy lên đầu. Bài: `sapBoTri` khoá mới (Task 1).
- Máy gọi REST cũ `POST /rest/fields/reorder` với `{entity, ids}`: vẫn chạy, chỉ đổi thứ tự giữa các trường tự tạo, trường chuẩn giữ chỗ. Bài: `tcc-api-reorder-cu` (Task 2).
- Thoả thuận ẩn Giá trị: hàng «Quy đổi» đi theo Giá trị nên cũng không vẽ; hiện lại thì đứng ngay sau hàng muộn hơn trong hai hàng Giá trị, Tiền tệ. Bài: `tcc-phieu-quy-doi` (Task 3).

---

### Task 1: Bảng bố trí, danh mục và hàm trộn

**Phục vụ:** E7c, nền cho E2b, E3b, E4b, E7 · **independent:** false

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model mới sau `FieldOption`)
- Create: `packages/db/prisma/migrations/<UTC>_truong_chuan_bo_tri/migration.sql`
- Create: `packages/db/src/fields-chuan.ts`
- Modify: `packages/db/package.json` (export `./fields-chuan`)
- Create: `packages/db/test/fields-chuan.spec.ts`
- Create: `_acceptance/truong-chuan-o-cai-dat/rang/migration-chi-them.mjs`

**Interfaces:**
- Produces:
  - Prisma `StandardFieldLayout { entity FieldEntity; key String; position Int; hidden Boolean @default(false); updatedAt DateTime @updatedAt; @@id([entity, key]); @@map("standardFieldLayout") }`
  - `STANDARD_FIELD_KEYS: { DEAL: readonly [...6]; COMPANY: readonly [...8]; CONTACT: readonly [...10] }` (`as const`, đúng thứ tự Global Constraints)
  - `REQUIRED_STANDARD_KEYS: { DEAL: readonly ["name","currency","company","owner"]; COMPANY: readonly ["name"]; CONTACT: readonly ["firstName"] }`
  - `type StandardFieldKey<E extends FieldEntity>`; `isStandardFieldKey(entity, key): boolean`
  - `type MucBoTri = { kind: "standard"; key: string; hidden: boolean; required: boolean } | { kind: "custom"; id: string; key: string }`
  - `sapBoTri(entity, hangChuan: { key: string; position: number; hidden: boolean }[], tuTao: { id: string; key: string; position: number }[]): MucBoTri[]`

- [ ] **Step 1: Viết bài `fields-chuan.spec.ts` (đỏ trước)** — năm ca: (a) không hàng chuẩn nào + tự tạo position 0,1 → chuẩn theo danh mục rồi tự tạo; (b) có hàng cho mọi khoá, tự tạo position 3 chen giữa → đúng thứ tự trộn; (c) tự tạo cùng `position` với một khoá chuẩn → chuẩn trước; (d) thiếu hàng cho `x` của Liên hệ trong khi có hàng cho mọi khoá khác → `x` đứng ngay sau `linkedin`; (e) `required` của mục chuẩn đúng `REQUIRED_STANDARD_KEYS`. Đối chứng: tập khoá của `STANDARD_FIELD_KEYS` bằng đúng 24 khoá viết sẵn trong bài.
- [ ] **Step 2: Chạy** `cd packages/db && bun test test/fields-chuan.spec.ts` → FAIL (module chưa có).
- [ ] **Step 3: Viết `fields-chuan.ts`** (thuần, không nhập Prisma client). `sapBoTri`: khoá chuẩn không có hàng nhận `position` ảo — nếu entity chưa có hàng nào thì `chỉ số − số khoá`; nếu có thì `position` của khoá chuẩn liền trước + 0,5 (khoá đầu: `position` nhỏ nhất − 1). Sắp theo (`position`, chuẩn trước, khoá).
- [ ] **Step 4: Schema + migration**: thêm model; `cd packages/db && bunx prisma migrate dev --create-only --name truong_chuan_bo_tri` rồi đổi tiền tố thư mục thành `date -u +%Y%m%d%H%M%S` lúc tạo; soát SQL chỉ có `CREATE TABLE "standardFieldLayout"` và khoá chính.
- [ ] **Step 5: Viết `rang/migration-chi-them.mjs`** theo E7c (thư mục mới so với merge-base `origin/onehub`, tên 14 chữ số lớn hơn mốc lớn nhất trên onehub, chỉ câu thêm, không `ALTER` bảng cũ, `REFERENCES` chỉ tới bảng của migration xếp trước) kèm cặp phá-thử trên bản chép (`ALTER TABLE "fieldDefinition" DROP COLUMN "required";` phải ném `tcc migration: doi bang cu`, không thì `tcc migration: thuoc mu`).
- [ ] **Step 6: Chạy** `cd packages/db && bun test test/fields-chuan.spec.ts` → PASS; `bun _acceptance/truong-chuan-o-cai-dat/rang/migration-chi-them.mjs` → exit 0; `bun run db:test --reset` chạy migration sạch.
- [ ] **Step 7: Commit** `feat(truong-chuan-o-cai-dat): bảng bố trí trường chuẩn và hàm trộn thứ tự`.

### Task 2: API bố trí

**Phục vụ:** E2b, E3b, E4b, E5b, E6b, E7, E8 · **independent:** false (cần Task 1)

**Files:**
- Create: `packages/validation/src/bo-tri-truong.ts`; Modify: `packages/validation/package.json` (export)
- Modify: `apps/api/src/fields/fields.contracts.ts`, `fields.router.ts`, `fields.service.ts`
- Modify: `apps/app/lib/trpc/cache.ts` (`cache.fields` làm mới `trpc.fields.layout`)
- Create: `apps/api/test/truong-chuan-cai-dat.spec.ts` (theo khuôn `apps/api/test/truong-mot-cach.spec.ts`: `gieoThanhVien`, `mintPhien`, gọi `/api/trpc/...`)

**Interfaces:**
- Consumes: `STANDARD_FIELD_KEYS`, `REQUIRED_STANDARD_KEYS`, `isStandardFieldKey`, `sapBoTri`, `MucBoTri` (Task 1)
- Produces:
  - `boTriTruong = z.array(z.discriminatedUnion("kind", [z.object({ kind: z.literal("standard"), key: z.string(), hidden: z.boolean(), required: z.boolean() }), z.object({ kind: z.literal("custom"), id: z.string(), key: z.string() })]))`; `type BoTriTruong = z.infer<typeof boTriTruong>`; `parseBoTriTruong(value: unknown): BoTriTruong`
  - `mucSapLai = z.union([z.object({ standard: z.string() }), z.object({ custom: z.string() })])`
  - tRPC `fields.layout({ entity }) → BoTriTruong` · REST `GET /fields/{entity}/layout`
  - tRPC `fields.reorder({ entity, ids } | { entity, items: MucSapLai[] }) → SerializedField[]` · REST giữ `POST /fields/reorder`
  - tRPC `fields.setStandardHidden({ entity, key, hidden }) → BoTriTruong` · REST `POST /fields/{entity}/standard/{key}/hidden`

- [ ] **Step 1: Viết bài API (đỏ trước)** — mỗi ca đúng tên `-t` của evals và đúng thông điệp ghim trong `expected`: `tcc-api-sap-lai`, `tcc-api-an`, `tcc-api-chuan-bat-buoc`, `tcc-api-bat-buoc-luu`, `tcc-api-bat-buoc-hien`, `tcc-api-mac-dinh`, `tcc-api-quyen`; thêm `tcc-api-reorder-cu`: `{entity:"DEAL", ids:[b,a]}` đảo hai trường tự tạo, layout đọc lại có trường chuẩn giữ nguyên chỗ và b trước a. Đầu ra layout đọc qua `parseBoTriTruong`.
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/truong-chuan-cai-dat.spec.ts"` → FAIL (`No procedure found`).
- [ ] **Step 3: `bo-tri-truong.ts`** đúng Produces; `parseBoTriTruong` ném lỗi có thông điệp, không nuốt thành mảng rỗng.
- [ ] **Step 4: Service**
  - `layout(entity)`: đọc `standardFieldLayout` của entity + `fieldDefinition` chưa lưu trữ, trả `sapBoTri(...)`.
  - `reorder(actingUserId, input)`: `requireManager`; nhánh `ids` giữ nguyên thuật cũ nhưng chỉ hoán vị các giá trị `position` đang có của chính những trường ấy (trường chuẩn không xê dịch); nhánh `items`: phải phủ đúng mọi khoá chuẩn của entity và mọi trường tự tạo chưa lưu trữ, mỗi mục một lần — lệch thì `BadRequestException`; ghi `position = chỉ số` cho cả hai bảng (`upsert` hàng chuẩn) trong một `$transaction`.
  - `setStandardHidden(actingUserId, { entity, key, hidden })`: `requireManager`; khoá ngoài danh mục → `BadRequestException`; khoá bắt buộc mà `hidden: true` → `BadRequestException`; khi entity chưa có hàng nào thì tạo hàng cho mọi khoá theo `position` ảo của `sapBoTri` trước khi đặt `hidden`, để chỗ của khoá không đổi.
  - `create`: `required && !showOnSheet` → `BadRequestException`; `position` = lớn nhất của cả hai bảng + 1.
  - `update`: `data.required === true && data.showOnSheet === false` → `BadRequestException`; `data.required === true` mà trường đang ẩn và `showOnSheet` không gửi → ghi `showOnSheet: true`.
- [ ] **Step 5: Router + contracts** — `fieldReorderInput` thành union hai nhánh (`ids` giữ `.min(1)`); `layout` là `@Query` (đọc được với mọi thành viên trong phạm vi đối tác), hai lệnh ghi là `@Mutation`; mỗi thủ tục có `restMeta`.
- [ ] **Step 6: `cache.fields`** thêm `trpc.fields.layout.queryKey(...)` vào danh sách làm mới.
- [ ] **Step 7: Chạy** lệnh Step 2 → PASS; `bun run check-types`.
- [ ] **Step 8: Phá-thử** từng thông điệp ghim mới (vd bỏ kiểm khoá bắt buộc trong `setStandardHidden` → `tcc api chuan bat buoc: lot`), ghi kết quả vào sổ S3, hoàn lại.
- [ ] **Step 9: Commit** `feat(truong-chuan-o-cai-dat): API bố trí trường — đọc, sắp lại trộn, ẩn trường chuẩn`.

### Task 3: Danh mục ở app và phiếu vẽ theo bố trí

**Phục vụ:** E1 (vế phiếu), E2c, E3 (vế 3), E7b · **independent:** false (cần Task 2)

**Files:**
- Create: `apps/app/components/crm/fields/truong-chuan.ts`
- Create: `apps/app/components/crm/fields/use-bo-tri-truong.ts`
- Modify: `apps/app/components/crm/record-sheet/deal-sheet.tsx`, `company-sheet.tsx`, `contact-sheet.tsx`
- Modify: `apps/app/components/crm/fields/record-fields.tsx` (thêm `oTruongTuTao(field, …)` vẽ một trường theo khoá)
- Modify: `apps/app/components/crm/record-sheet/record-prefetch.ts` (nạp sẵn `fields.layout`)
- Create: `apps/app/test/truong-chuan-cai-dat.dom.tsx` (khuôn `truong-mot-cach.dom.tsx`: mock `sonner`, `khung-gop-y`)

**Interfaces:**
- Consumes: `fields.layout`, `BoTriTruong`, `parseBoTriTruong` (Task 2); `STANDARD_FIELD_KEYS` (Task 1); `truongChuanThoaThuan`, `truongChuanCongTy`, `truongChuanLienHe`, `OTruongPhieu`, `moTaTruongTuTao` (DA14, đã có)
- Produces:
  - `nhanTruongChuan(entity: FieldEntity, key: string, m: RecordSheetMessages): string`
  - `kieuTruongChuan(entity: FieldEntity, key: string): KieuTruong | "COMPANY"`
  - `useBoTriTruong(entity: FieldEntity): { muc: BoTriTruong; daTai: boolean; query }` — chưa tải hay lỗi thì `muc` là thứ tự mặc định từ `sapBoTri(entity, [], <tự tạo theo position>)`
  - `MucChiTiet` = các mục vẽ trên phiếu sau khi bỏ `hidden` và trường tự tạo `showOnSheet: false`

- [ ] **Step 1: Viết bài DOM (đỏ trước)** — `tcc-phieu-thu-tu`, `tcc-phieu-chua-tai`, vế phiếu của `tcc-danh-muc` (đọc nhãn mục Chi tiết ba phiếu ở vi, en), vế 3 của `tcc-an`, cộng `tcc-phieu-quy-doi` (Review Focus): layout ẩn `amount` → không hàng «Quy đổi»; layout đưa `currency` lên trước `amount` → «Quy đổi» ngay sau «Giá trị». Mọi fixture bố trí qua `parseBoTriTruong`; bản ghi qua bộ đọc đầu ra thật của `apps/api/src/{deals,companies,contacts}`.
- [ ] **Step 2: Chạy** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-chuan-cai-dat.dom.tsx -t "tcc-phieu|tcc-danh-muc|tcc-an"` → FAIL.
- [ ] **Step 3: `truong-chuan.ts`, `use-bo-tri-truong.ts`**; ba phiếu thay khối mục Chi tiết bằng một vòng qua `muc`: mục chuẩn `company` vẽ `InlineCompanyField` như nay, mục chuẩn khác vẽ `OTruongPhieu` của bộ mô tả DA14 cùng khoá, mục tự tạo vẽ `oTruongTuTao`; thoả thuận chèn `ReportedValue` theo luật ở Review Focus. Mô tả và Giai đoạn giữ chỗ cũ. `standard-fields.ts` chưa gỡ ở task này: `fields-list.tsx` còn nhập nó tới Task 4.
- [ ] **Step 4: Chạy** lệnh Step 2 → PASS (trừ vế Cài đặt của `tcc-danh-muc`, Task 4 làm xanh); `bun test` của `truong-mot-cach.dom.tsx` vẫn xanh (DA14 không lùi).
- [ ] **Step 5: Commit** `feat(truong-chuan-o-cai-dat): phiếu vẽ mục Chi tiết theo bố trí đã đặt`.

### Task 4: Cài đặt › Trường — một danh sách, công tắc, «Bắt buộc»

**Phục vụ:** E1, E2, E3 (vế 1, 2, 4), E4, E5, E6, E8b · **independent:** false (cần Task 3)

**Files:**
- Modify: `apps/app/components/crm/fields/fields-list.tsx`, `field-editor.tsx`, `fields-copy.ts`
- Modify: `apps/app/lib/messages/crm.ts` (chỉ thêm khoá, cả `en` và `vi`)
- Delete: `apps/app/components/crm/fields/standard-fields.ts`
- Test: `apps/app/test/truong-chuan-cai-dat.dom.tsx`

**Interfaces:**
- Consumes: `useBoTriTruong`, `nhanTruongChuan`, `kieuTruongChuan` (Task 3); `fields.reorder` nhánh `items`, `fields.setStandardHidden` (Task 2); `truongKieu.chuaLuu` (DA14)
- Produces: khoá messages mới dưới `fields`: `standardSummary` («Trường chuẩn» / "Standard field"), `sheetSwitch(label)` (tên truy cập công tắc), `requiredLocked` («Trường bắt buộc luôn hiện trên phiếu»), `requiredLabel` («Bắt buộc»), `requiredHelp` («Không để trống được khi sửa trên phiếu.»), `orderSaved` («Đã lưu thứ tự.»), `orderFailed` («Chưa lưu được thứ tự.»), `shown(label)`, `hidden(label)`.

- [ ] **Step 1: Viết bài DOM (đỏ trước)** — `tcc-danh-muc` (vế Cài đặt), `tcc-sap-lai` (kể cả ca lỗi), `tcc-an` (vế 1, 2, 4 — vế 4 dựng `CompaniesTable` thật), `tcc-chuan-bat-buoc`, `tcc-bat-buoc-luu`, `tcc-bat-buoc-hien`, `tcc-khong-quyen`, đúng thông điệp ghim của evals.
- [ ] **Step 2: Chạy** lệnh DOM đầy đủ của tệp → FAIL ở các ca mới.
- [ ] **Step 3: `FieldsList`** — bỏ khối gập «Trường chuẩn» và tiêu đề nhóm «Trường tự tạo»; `SortableList` trên `muc` của `useBoTriTruong` (id `std:<key>` / `<field.id>`); hàng chuẩn: nhãn, huy hiệu kiểu, dòng phụ `standardSummary` (+ `required`), `Switch` «Hiện trên phiếu»; hàng tự tạo như nay + cùng `Switch` (ghi `fields.update { showOnSheet }`). Kéo: lạc quan, `fields.reorder({ entity, items })`, lỗi → khôi phục, `toast.error(orderFailed)`, `onSettled` → `cache.fields`. Công tắc lỗi → về giá trị cũ, `toast.error(truongKieu.chuaLuu(nhãn))`. Bắt buộc → `Switch` `checked disabled` và `aria-describedby` trỏ câu `requiredLocked`. Không quyền → mọi tay kéo, công tắc, nút `disabled`, dòng `canQuyen` như nay.
- [ ] **Step 4: `FieldEditor`** — dòng `Field orientation="horizontal"` với `Switch` `requiredLabel` + `FieldDescription requiredHelp`; bật thì ô `showOnSheet` `checked` và `disabled`; `save` gửi `required: draft.required` cho cả `create` lẫn `update`, kèm `showOnSheet: true` khi bắt buộc.
- [ ] **Step 5: Gỡ `standard-fields.ts`**; `fields-list.tsx` không còn nhập nó.
- [ ] **Step 6: Chạy** lệnh DOM đầy đủ → PASS; `bun run check-types`; `bun run lint:slop`.
- [ ] **Step 7: Commit** `feat(truong-chuan-o-cai-dat): Cài đặt › Trường sắp, ẩn trường chuẩn và bật «Bắt buộc»`.

### Task 5: Răng quét và phép đo màn

**Phục vụ:** E1b, E9 · **independent:** false (đọc mã của Task 3, 4)

**Files:**
- Create: `_acceptance/truong-chuan-o-cai-dat/rang/quet.mjs`
- Create: `_acceptance/truong-chuan-o-cai-dat/rang/do-man.mjs` (khuôn `_acceptance/truong-mot-cach-cu-xu/rang/do-man.mjs`, chạy qua `scripts/lan-do/tien-de.mjs`)

**Interfaces:**
- Consumes: lệnh `tcc_quet`, `tcc_man` đã khai ở `_acceptance/config.yaml`

- [ ] **Step 1: `quet.mjs`** theo E1b (TypeScript compiler API), kèm cặp phá-thử trên bản chép `fields-list.tsx`.
- [ ] **Step 2: Chạy** `bun _acceptance/truong-chuan-o-cai-dat/rang/quet.mjs` → exit 0; chạy trên cây `03d4842f1` (bản chép tạm) → `tcc quet: con standard-fields.ts`.
- [ ] **Step 3: `do-man.mjs`** theo E9: dựng dữ liệu qua API thật trong phiên đo; kéo bằng `page.mouse` và bấm công tắc bằng chuột; chụp tám ảnh vào `BANG_CHUNG`; các kiểm DOM và mã thoát đúng `expected`.
- [ ] **Step 4: Chạy** `BANG_CHUNG=_acceptance/truong-chuan-o-cai-dat/evidence bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/truong-chuan-o-cai-dat/rang/do-man.mjs"` → dòng cuối `tcc man: dat`; mở tám ảnh soát bằng mắt.
- [ ] **Step 5: Commit** `test(truong-chuan-o-cai-dat): răng quét và phép đo màn`.

### Task 6: Năm lệnh chứng minh

**Phục vụ:** mọi eval · **independent:** false

- [ ] **Step 1:** `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build` ở gốc kho — đều exit 0.
- [ ] **Step 2:** Kiểm `git fetch origin && git ls-tree --name-only origin/onehub packages/db/prisma/migrations/ | tail -3`: không migration nào mới hơn của Task 1; có thì đổi tên lại theo luật 1.
- [ ] **Step 3:** Hợp đồng `status: implemented`, vào S4.
