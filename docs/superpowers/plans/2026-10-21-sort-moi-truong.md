# Sort mọi trường (DA17) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sắp ba danh sách và Kanban theo mọi trường tự tạo sắp được, cột trường ẩn theo kiểu, thẻ Kanban hiện hai trường tự tạo đầu.

**Architecture:** Một bảng «kiểu nào sắp theo gì» ở `packages/db/src/fields-shape.ts` dùng cho cả API và app. `FieldsService.sapTheoTruong` trả trang id theo hai đoạn trên `fieldValue` (có giá trị, rồi trống); ba service và `deals.board` dùng nó khi `sort` là `field:<khoá>`, còn lại đi `SORTABLE` như cũ. Phần app (cột, ẩn theo khổ, thẻ) viết sau khi DA14 gộp, trên bảng đăng ký `KIEU_TRUONG` của `kieu-truong.tsx`.

**Tech Stack:** NestJS + Prisma 7 (apps/api), Next.js + React + `@crm/ui` DataTable + nuqs (apps/app), bun test.

**Spec:** `docs/superpowers/specs/2026-10-21-sort-moi-truong-design.md` · hợp đồng `_acceptance/sort-moi-truong/contract.md` · `_acceptance/sort-moi-truong/evals.yaml`.

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Không chạm `packages/ui`, `DataTable`, schema Prisma (luật 31, T2).
- Hằng tinh chỉnh vào tệp cấu hình của khu: số trường trên thẻ vào `apps/api/src/deals/deal-board-config.ts` (`DEAL_BOARD.truongTrenThe: 2`).
- Trống luôn cuối cả hai chiều; hoà: tên bản ghi A→Z (deal, company theo `name`; contact theo `lastName` rồi `firstName`), rồi id.
- `sort` dạng `field:<khoá>` sống mà không sắp được (khoá vắng, trường lưu trữ, khác loại bản ghi, Ô tích, chữ rác) → thứ tự mặc định, không ném.
- Bài kiểm API: tiền tố tên riêng mỗi ca, mọi lời gọi `list`/`board` mang `q` = tiền tố; dọn dữ liệu của ca ở `afterAll`.
- Phần app (Task 6–8) chỉ viết sau khi DA14 gộp onehub và nhánh này gộp lại onehub.

## Review Focus

- `q` rỗng cùng `sort=field:` trên danh sách có hàng nghìn bản ghi: đoạn trống phải phân trang ở DB, không tải hết id — Task 2, E8.
- Trang đúng bằng ranh (skip = số hàng có giá trị): trang bắt đầu ngay ở bản ghi trống đầu tiên — Task 2 test `smt-api-trang` với pageSize 5 và 16 hàng có giá trị (ranh ở giữa trang 4).
- Trường đổi kiểu không có (kiểu không đổi được), nhưng trường bị lưu trữ giữa chừng khi người đang ở trang 3: lời gọi kế về thứ tự mặc định, không lỗi — Task 3 test `smt-api-khoa-chet`.
- Lựa chọn bị lưu trữ (không xoá) vẫn có `position`: sắp theo position cũ, không coi là trống — Task 2 thêm một ô trong E1 với lựa chọn đã lưu trữ đứng giữa.
- Bộ lọc trường hiện có (`fields` facet SELECT/USER) cùng lúc với sort theo trường: `where` đi nguyên vào quan hệ — Task 3 test `smt-api-trang` vế lọc.

---

### Task 1: Bảng sắp theo kiểu

**Files:**
- Modify: `packages/db/src/fields-shape.ts`

**Interfaces:**
- Produces: `export type CachSapTruong = "text" | "number" | "date" | "luaChon" | "nguoi"`; `export const SAP_THEO_KIEU: Record<FieldTypeName, CachSapTruong | null>` (TEXT, LONG_TEXT, URL, EMAIL, PHONE → "text"; NUMBER → "number"; DATE → "date"; SELECT → "luaChon"; USER → "nguoi"; CHECKBOX → null), `as const satisfies`; `export function cachSapTruong(type: FieldTypeName): CachSapTruong | null`; `export function sapDuocTheoKieu(type: string): boolean`.

- [ ] **Step 1:** thêm hằng và hai hàm như trên.
- [ ] **Step 2:** `cd packages/db && bunx tsc --noEmit -p .` → không lỗi.
- [ ] **Step 3:** commit `feat(sort-moi-truong): bảng sắp theo kiểu ở fields-shape`.

### Task 2: `FieldsService.sapTheoTruong` (hai đoạn)

**Files:**
- Modify: `apps/api/src/fields/fields.service.ts`
- Create: `apps/api/test/sort-moi-truong.spec.ts` (ca `smt-api-sap`, `smt-api-trang`)

**Interfaces:**
- Consumes: `cachSapTruong`, `recordColumn`, `RELATIONS`, `Page` (`apps/api/src/trpc/list-input.ts`).
- Produces: `async sapTheoTruong(entity: FieldEntity, sapXep: { sort: string; dir: SortDirection }, relationWhere: Prisma.DealWhereInput | Prisma.CompanyWhereInput | Prisma.ContactWhereInput, trang: Page): Promise<string[] | null>` — `null` khi `sort` không bắt đầu `field:` hoặc khoá chết (Global Constraints); ngược lại mảng id đúng thứ tự trang (độ dài ≤ `trang.take`).

- [ ] **Step 1: test đỏ.** Trong `sort-moi-truong.spec.ts` dựng services như `apps/api/test/fields.spec.ts` (FieldsService, DealsService… với agent giả); đầu vào list đi qua `dealListInput.parse` của `deals.contracts.ts` như router làm. `describe("smt-api-sap")`: fixture và đáp án đúng như E1 (`expected` của evals.yaml) — tên T1 'Bình', T2 'Cường', T3 'Dung', T4 'An', T5 'Em'; tăng `[T2,T4,T1,T5,T3]`, giảm `[T5,T4,T1,T2,T3]`; 18 ô; thông điệp `smt api sap: <kieu> <dir> ra <ten>`; đối chứng `amount`. Thêm ô SELECT với lựa chọn đã lưu trữ đứng giữa theo position (Review Focus). `describe("smt-api-trang")`: đúng E1b, gồm hai dạng trống (xoá giá trị qua `deals.update`; xoá User bằng `db.user.delete`).
- [ ] **Step 2:** `bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t 'smt-api-sap|smt-api-trang'"` → FAIL `smt api sap: TEXT asc ra Em,An,Dung,Cường,Bình`.
- [ ] **Step 3: cài `sapTheoTruong`.** Đoạn một: `fieldValue.findMany({ where: { fieldId, [cột]: { not: null }, [quan hệ]: { is: relationWhere } }, orderBy: [<theo cách sắp, dir>, <tên bản ghi qua quan hệ, asc>, { [cột id bản ghi]: "asc" }], skip, take, select: { [cột id bản ghi]: true } })`; cột theo `columnFor`, «luaChon» sắp `{ option: { position: dir } }`, «nguoi» sắp `{ user: { name: dir } }`. Đếm đoạn một bằng `fieldValue.count` cùng `where`. Đoạn hai (khi `skip + take > n`): `db[quan hệ].findMany({ where: { AND: [relationWhere, { fieldValues: { none: { fieldId, [cột]: { not: null } } } }] }, orderBy: [<tên bản ghi asc>, { id: "asc" }], skip: max(0, skip - n), take: phần còn lại, select: { id: true } })`. Tên quan hệ ngược từ bản ghi tới `fieldValue` đọc ở schema (`fieldValues` hay tên khác).
- [ ] **Step 4:** chưa nối vào list — test vẫn đỏ ở bước gọi `deals.list`; nối ở Task 3. (Task 2 và 3 commit chung.)

### Task 3: Nối vào ba danh sách, Kanban, Điện thoại của Liên hệ

**Files:**
- Modify: `apps/api/src/deals/deals.service.ts`, `apps/api/src/companies/companies.service.ts`, `apps/api/src/contacts/contacts.service.ts`
- Test: `apps/api/test/sort-moi-truong.spec.ts` (thêm `smt-api-cty-lh`, `smt-api-khoa-chet`, `smt-api-board`)

**Interfaces:**
- Consumes: `sapTheoTruong` (Task 2).
- Produces: `list` và `board` có cùng hình đầu ra như nay; contacts `SORTABLE.phone: (dir) => [{ phone: { sort: dir, nulls: "last" } }, { lastName: "asc" }]`.

- [ ] **Step 1: test đỏ** cho ba ca mới đúng E2, E3, E4 (`expected` của evals.yaml): 12 ô cty/lh + phone + PHONE tự tạo «hoa lech chuan»; 22 ô khoá chết + view đã lưu qua `SavedViewsService` và `savedViewFilters`; 8 ô board + trần thẻ + đếm cột không đổi.
- [ ] **Step 2:** chạy năm ca → FAIL.
- [ ] **Step 3:** trong mỗi `list`: `const ids = await this.fields.sapTheoTruong(<entity>, input, where, { skip, take })`; có `ids` → `findMany({ where: { id: { in: ids } }, select })` rồi xếp theo `ids`; `null` → nhánh `resolveOrderBy` cũ. `board`: mỗi cột giai đoạn gọi với `stageWhere` và `{ skip: 0, take: DEAL_BOARD.cardsPerColumn }`. Thêm `phone` vào SORTABLE của contacts.
- [ ] **Step 4:** năm ca PASS; `bun run check-types` sạch.
- [ ] **Step 5:** commit `feat(sort-moi-truong): sắp ba danh sách và Kanban theo trường tự tạo`.

### Task 4: Trường tự tạo trên thẻ Kanban (API)

**Files:**
- Modify: `apps/api/src/deals/deal-board-config.ts` (`truongTrenThe: 2`), `apps/api/src/fields/fields.service.ts`, `apps/api/src/deals/deals.service.ts`, `apps/api/src/deals/deals.contracts.ts`
- Test: `apps/api/test/sort-moi-truong.spec.ts` (`smt-api-the`)

**Interfaces:**
- Produces: `tableValuesFor(entity, recordIds, gioiHan?: number)` — `gioiHan` cắt định nghĩa sau `orderBy position` (`take`); `dealBoardCardOutput` = hàng danh sách bỏ `fields` rồi `extend({ counted, fields: z.record(z.string(), fieldValueOutput) })`.

- [ ] **Step 1:** test đỏ theo E7 (năm trường, đưa lên đầu bằng `fields.reorder` với TOÀN BỘ id trường DEAL chưa lưu trữ, của ca đứng trước; `smt api the: khoa …`, `theo thu tu`, `hop dong`).
- [ ] **Step 2:** FAIL `smt api the: khoa undefined`.
- [ ] **Step 3:** cài như Interfaces; `board` gọi `tableValuesFor("DEAL", idsCuaMoiCot, DEAL_BOARD.truongTrenThe)` một lần cho mọi thẻ.
- [ ] **Step 4:** PASS; check-types sạch (app đọc `card.fields` chưa dùng — không lỗi).
- [ ] **Step 5:** commit `feat(sort-moi-truong): board trả hai trường tự tạo đầu cho thẻ`.

### Task 5: Đo tốc độ

**Files:**
- Create: `apps/api/test/sort-moi-truong-toc-do.spec.ts`

- [ ] **Step 1:** viết ca `smt-toc-do` đúng E8: `describe.skipIf(!process.env.SMT_TOC_DO)` — nhưng khi chạy qua lệnh eval mà biến vắng thì ném `smt toc do: thieu bien` (một `it` riêng ngoài `skipIf` kiểm `process.argv` chứa `-t smt-toc-do`); 5.000 thoả thuận qua `DealsService.create` lô 100; 4.500 có giá trị; năm lượt đo bốn truy vấn; ngưỡng 3× và 1000 ms; dọn và đếm lại.
- [ ] **Step 2:** chạy `config:executors.test.smt_toc_do` → PASS, in bốn trung vị.
- [ ] **Step 3:** đột biến tay: `sapTheoTruong` tải hết id rồi sort trong bộ nhớ → chạy lại, ghi số đo vào sổ S3 (dòng `fix`), hoàn lại.
- [ ] **Step 4:** commit `test(sort-moi-truong): đo tốc độ sắp theo trường trên 5.000 bản ghi`.

### Task 6 (sau DA14): Cột sắp được và ẩn theo kiểu

**Files:**
- Modify: `apps/app/components/crm/fields/kieu-truong.tsx` (mặt `anDuoi` trong `KIEU_TRUONG`, export `anDuoiTheoKieu(kieu)`), `apps/app/components/crm/fields/field-columns.tsx`, ba `*-table.tsx`
- Create: `apps/app/test/sort-moi-truong.dom.tsx` (`smt-cot-sap`, `smt-an-theo-kieu`), `_acceptance/sort-moi-truong/rang/quet-bang-kieu.mjs`

**Interfaces:**
- Consumes: `sapDuocTheoKieu` (Task 1), `KIEU_TRUONG` (DA14).
- Produces: `anDuoiTheoKieu(kieu: KieuTruong): "sm" | "md" | "lg"` theo bảng của design; cột tự tạo `sortable: sapDuocTheoKieu(field.type)`, `hideBelow: anDuoiTheoKieu(field.type)`; cột chuẩn có kiểu `hideBelow: anDuoiTheoKieu("<kiểu>")`; contacts `phone` `sortable: true`.

- [ ] **Step 1:** test đỏ E5, E6 (`expected` của evals.yaml); răng E5b theo mẫu `quet-vo-tay.mjs` của DA14 (TypeScript compiler API, cặp hai chiều).
- [ ] **Step 2:** FAIL. **Step 3:** cài. **Step 4:** PASS, `bun run check-types`, `bun run lint`. **Step 5:** commit.

### Task 7 (sau DA14): Dòng trường trên thẻ Kanban

**Files:**
- Modify: `apps/app/app/(app)/[slug]/deals/deals-board.tsx`
- Test: `apps/app/test/sort-moi-truong.dom.tsx` (`smt-the-kanban`)

- [ ] **Step 1:** test đỏ E7b. **Step 2:** FAIL. **Step 3:** `DealBoardCard` đọc `fields.list` (DEAL, showOnTable, theo position) để lấy nhãn và kiểu, vẽ mỗi khoá có giá trị khác null thành một dòng nhãn `text-muted-foreground` + `HienThiTruong`, đặt sau Ngày chốt. **Step 4:** PASS. **Step 5:** commit.

### Task 8 (sau DA14): Răng màn

**Files:**
- Create: `_acceptance/sort-moi-truong/rang/do-man.mjs`

- [ ] **Step 1:** theo mẫu `rang/do-man.mjs` của DA14 và `scripts/lan-do/tien-de.mjs`: dựng dữ liệu qua API thật, chụp sáu ảnh và các lời thoát của E9.
- [ ] **Step 2:** `config:executors.script.smt_man` → `smt man: dat`. **Step 3:** commit.
