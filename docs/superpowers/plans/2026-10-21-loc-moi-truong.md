# Lọc mọi trường — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nhân viên quan hệ đối tác lọc Thoả thuận, Công ty, Liên hệ theo mọi trường tự tạo (chứa, khoảng, mốc, Có/Không, trống) và lưu bộ lọc ở cả Thoả thuận.

**Architecture:** Một bảng «kiểu → cách lọc» ở `packages/db/src/fields-shape.ts`; một bộ phân tích giá trị lọc ở `packages/validation/src/bo-loc-truong.ts`; `FieldsService.fieldFilters` và `filterFacetCounts` dựng `where` và số đếm theo bảng ấy. App ghi mỗi bộ lọc trường thành khoá lặp `field:<khoá>` trên đường dẫn; khuôn `SavedViewFilters` không đổi.

**Tech Stack:** NestJS + tRPC, Prisma, Zod, Next.js, nuqs, bun test.

**Spec:** `docs/superpowers/specs/2026-10-21-loc-moi-truong-design.md`, hợp đồng `_acceptance/loc-moi-truong/contract.md` (duyệt manh 2026-10-21T09:34:22Z, nhận Hỏi-1..6), evals `_acceptance/loc-moi-truong/evals.yaml`.

## Global Constraints

- Không chú thích trong mã (`AGENTS.md`).
- Không migration, không đổi schema Prisma, không đổi khuôn `SavedView.filters`.
- Giá trị lọc: `has:<chữ>`, `gte:<số>`, `lte:<số>` (số chấm thập phân), `overdue` · `this-month` · `next-month` · `later`, `yes` · `no`, `none`, id lựa chọn/người.
- Hỏi-5: bộ lọc chỉ áp cho trường bật `showOnFilter` (`filterableFieldsFor`), như hôm nay.
- Hỏi-1: nhãn mốc trước hôm nay của trường Ngày tự tạo là «Đã qua».
- Hỏi-2: bộ lọc đã lưu không mang kiểu xem.
- Hỏi-3: «chứa» là `contains` + `mode: "insensitive"`, không bỏ dấu.
- Tệp chữ dùng chung (`apps/app/lib/messages/*.ts`, `packages/ui/src/lib/messages.ts`, `_acceptance/config.yaml`) chỉ thêm dòng (luật 7).
- `packages/ui/src/components/data-table.tsx` chỉ sửa khi `cham-tep` R2-1 được trả lời (luật 31). Né `apps/app/components/crm/record-sheet/**`, `apps/app/(app)/[slug]/okr/**`.
- Cặp hai chiều cho mọi phép đo mới: chiều đỏ ghim thông điệp (MEASURE-BIRTH-CLAUSE).

## Review Focus

- Chuỗi rỗng hay toàn khoảng trắng sau khi xoá chữ trên phiếu: «Trống» phải bắt nó → E4 ô chuỗi rỗng (Task 2).
- Tên trường có ký tự `:` hay khoá trùng tiền tố: `field:` chỉ cắt một lần ở đầu → test trong Task 1.
- Bộ lọc `gte` lớn hơn `lte`: trả rỗng, không lỗi → test trong Task 2.
- `has:` với chuỗi rỗng sau `has:`: coi là sai cú pháp → test trong Task 1.
- Số đếm khi có bộ lọc khác đang bật: đếm theo `where` đầy đủ → E5 vế c (Task 3).

---

### Task 1: Bảng lọc theo kiểu và bộ phân tích giá trị lọc

**Files:**
- Modify: `packages/db/src/fields-shape.ts` (thêm cạnh `SAP_THEO_KIEU`)
- Create: `packages/validation/src/bo-loc-truong.ts`
- Modify: `packages/validation/package.json` (export `./bo-loc-truong`)
- Test: `packages/validation/test/bo-loc-truong.spec.ts`

**Interfaces:**
- Produces: `type CachLocTruong = "chua" | "khoang" | "moc" | "tich" | "luaChon" | "nguoi"`; `LOC_THEO_KIEU: Record<FieldTypeName, CachLocTruong>` (TEXT, LONG_TEXT, URL, EMAIL, PHONE → chua; NUMBER → khoang; DATE → moc; CHECKBOX → tich; SELECT → luaChon; USER → nguoi); `cachLocTruong(type: FieldTypeName): CachLocTruong`; `locDuocTrong(type: FieldTypeName): boolean` (mọi kiểu trừ CHECKBOX).
- Produces: `MOC_NGAY = ["overdue","this-month","next-month","later"] as const`; `GIA_TRI_TRONG = "none"`; `type LocTruong = { cach: "chua"; chu: string[]; trong: boolean } | { cach: "khoang"; tu: number | null; den: number | null; trong: boolean } | { cach: "moc"; moc: MocNgay[]; trong: boolean } | { cach: "tich"; co: boolean[] } | { cach: "luaChon" | "nguoi"; id: string[]; trong: boolean }`; `phanTichLocTruong(cach: CachLocTruong, gia: string[]): LocTruong` ném `LocTruongError(gia)` khi sai cú pháp; `laGiaTriHopLe(cach, gia: string): boolean` (cho app bỏ giá trị hỏng).

- [ ] Viết test `bo-loc-truong.spec.ts`: mỗi cách lọc một ca đúng (`["has:lmt"]`, `["gte:5","lte:20.5"]`, `["this-month","none"]`, `["yes","no"]`, `["id1","none"]`), mỗi cách một ca hỏng (`has:`, `gte:abc`, `tomorrow`, `maybe`) ném `LocTruongError`; bảng có đúng một dòng cho mỗi phần tử `FIELD_TYPES`.
- [ ] Chạy `cd packages/validation && bun test test/bo-loc-truong.spec.ts` — đỏ vì thiếu module.
- [ ] Viết bảng và bộ phân tích bằng Zod; `gte`/`lte` đọc bằng `Number`, `Number.isFinite`.
- [ ] Chạy lại — xanh. `bun run check-types` xanh.
- [ ] Commit `feat(loc-moi-truong): bảng lọc theo kiểu và bộ phân tích giá trị lọc`.

independent: false (mọi task sau dùng)

### Task 2: Lọc ở API — chứa, khoảng, mốc, Có/Không, trống

**Files:**
- Modify: `apps/api/src/fields/fields.service.ts` (`filterableFieldsFor`, `fieldFilters`)
- Test: `apps/api/test/loc-moi-truong.spec.ts` (`lmt-api-chu`, `lmt-api-so`, `lmt-api-ngay-tich`, `lmt-api-trong`, `lmt-api-khoa-chet`)

**Interfaces:**
- Consumes: Task 1.
- Produces: `filterableFieldsFor(entity)` bỏ điều kiện `type: { in: ["SELECT","USER"] }`; `fieldFilters(definitions, selected): Prisma.XWhereInput[]` nhận mọi cách lọc, ném `BadRequestException` có nhãn trường khi `LocTruongError`; điều kiện «có giá trị» dùng chung với `sapTheoTruong` (rút `coGiaTriCua(definition)` thành hàm riêng trong `fields.service.ts`); chuỗi rỗng sau `trim` tính là trống. Mốc tính như `closingFilter` (đầu tháng giờ máy chủ), `overdue` = `date < now`.

- [ ] Viết năm ca theo đúng `expected` của E1, E2, E3, E4, E6 trong `evals.yaml` (fixture qua service thật, cô lập theo tiền tố, thông điệp ghim).
- [ ] Chạy `bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts"` — đỏ đúng các thông điệp chiều đỏ đã khai (ghi vào sổ S3).
- [ ] Sửa `fields.service.ts`.
- [ ] Chạy lại — xanh; chạy `test/sort-moi-truong.spec.ts` của DA17 — vẫn xanh.
- [ ] Commit.

independent: false

### Task 3: Công ty, Liên hệ, bảng cột, số đếm, tốc độ

**Files:**
- Modify: `apps/api/src/fields/fields.service.ts` (`filterFacetCounts`)
- Modify (chỉ nếu cần): `apps/api/src/{companies,contacts,deals}/*.service.ts`
- Test: `apps/api/test/loc-moi-truong.spec.ts` (`lmt-api-cty-lh-bang`), `apps/api/test/loc-moi-truong-toc-do.spec.ts` (`lmt-toc-do`, `describe.skipIf(!process.env.LMT_TOC_DO)`)

**Interfaces:**
- Produces: `facetCounts[<khoá>]` có `yes`, `no` (Ô tích), bốn mốc (Ngày), `none` (mọi kiểu trừ Ô tích), đếm bằng `count` nối quan hệ, chạy trong cùng `Promise.all`.

- [ ] Viết ca E5 và E5b theo `evals.yaml`; chạy — đỏ.
- [ ] Sửa `filterFacetCounts`.
- [ ] Chạy lại cả hai (E5b với `LMT_TOC_DO=1`); ghi trung vị vào sổ S3; chạy đột biến tay (đếm trong bộ nhớ) và ghi số.
- [ ] Commit.

independent: false

### Task 4: Bộ lọc đã lưu và chiến dịch giữ kết quả

**Files:**
- Create: `_acceptance/loc-moi-truong/rang/sinh-khuon-cu.mjs`, `_acceptance/loc-moi-truong/rang/khuon-cu.json` (sinh)
- Modify (chỉ nếu cần): `apps/api/src/campaigns/campaigns.service.ts` (`contactListFor` dùng `TIEN_TO_COT_TRUONG` thay hằng riêng)
- Test: `apps/api/test/loc-moi-truong.spec.ts` (`lmt-api-da-luu`)

**Interfaces:**
- Produces: `khuon-cu.json` = `{ sha: "c6a718f3d…", bo: [{ ten, entity, filters, mong_doi_ids_theo_ten }] }` sinh từ `useTableQuery` của worktree tạm ở `c6a718f3d` và `contacts.list` của cây ấy; script dọn worktree tạm khi xong.

- [ ] Viết `sinh-khuon-cu.mjs`, chạy, commit tệp sinh.
- [ ] Viết ca E7; chạy — xanh vế a, b; vế c đỏ trước Task 2 (đã có Task 2 thì xanh) — chứng chiều đỏ bằng đột biến tiền tố `f:` ghi sổ.
- [ ] Commit.

independent: false

### Task 5: Cài đặt › Trường mở «Hiện trong bộ lọc» cho mọi kiểu, và bài quét bảng chung

**Files:**
- Modify: `apps/app/components/crm/fields/field-editor.tsx:181` (thay so chuỗi bằng `cachLocTruong` từ bảng chung)
- Create: `_acceptance/loc-moi-truong/rang/quet-bang-loc.mjs`
- Test: `apps/app/test/loc-moi-truong.dom.tsx` (`lmt-cai-dat`)

- [ ] Viết E6c và E6b; chạy — đỏ đúng `lmt cai dat: thieu o TEXT` và `lmt quet: loc tu khai …field-editor.tsx:181`.
- [ ] Sửa `field-editor.tsx`.
- [ ] Chạy lại — xanh; chạy phá-thử của E6b.
- [ ] Commit.

independent: true (so với Task 6, Task 7)

### Task 6: Một cách mã hoá đường dẫn

**Files:**
- Modify: `apps/app/components/data-table/list-search-params.ts`, `apps/app/components/data-table/use-table-query.ts`, `apps/app/lib/search-param-keys.ts` (nếu cần khoá cũ `fields`)
- Modify: `apps/app/app/(app)/[slug]/{deals,companies,contacts}/page.tsx` (loader máy chủ dùng hàm đọc chung)
- Test: `apps/app/test/loc-moi-truong.dom.tsx` (`lmt-duong-dan`)

**Interfaces:**
- Produces: `docLocTruong(searchParams: URLSearchParams | Record<string, string | string[] | undefined>): FieldFilters` — đọc mọi khoá `field:*` và khoá cũ `fields` (JSON), bỏ giá trị hỏng theo `laGiaTriHopLe` (cần định nghĩa trường: đọc kiểu qua tham số `kieuTheoKhoa?: Record<string, FieldTypeName>`; vắng thì chỉ kiểm cú pháp chung). `useTableQuery` ghi `field:<khoá>` bằng `useQueryStates` với parser `parseAsNativeArrayOf(parseAsString)` dựng theo các khoá đang có; gặp `fields` cũ thì ghi lại theo cách mới (`history: "replace"`).

- [ ] Viết E8; chạy — đỏ `lmt duong dan: con json`.
- [ ] Sửa ba tệp; loader máy chủ và máy khách cùng gọi `docLocTruong`.
- [ ] Chạy lại — xanh; chạy `test/loc-va-kieu-xem.dom.tsx`, `test/bang-crm-loc-ro.dom.tsx`, `test/sort-moi-truong.dom.tsx` — vẫn xanh.
- [ ] Commit.

independent: false (Task 7, 8 dùng)

### Task 7: Bộ lọc đã lưu cho Thoả thuận

**Files:**
- Modify: `apps/app/app/(app)/[slug]/deals/deals-table.tsx` (thêm `SavedViewsMenu entity="DEAL"` cạnh `viewToggle`), `apps/app/app/(app)/[slug]/deals/deals-board.tsx` (cùng menu ở bảng cột)
- Test: `apps/app/test/loc-moi-truong.dom.tsx` (`lmt-luu-thoa-thuan`)

- [ ] Viết E9; chạy — đỏ `lmt luu thoa thuan: thieu menu table`.
- [ ] Thêm menu ở hai kiểu xem; áp bộ lọc giữ `view` đang mở.
- [ ] Chạy lại — xanh. Commit.

independent: false (sau Task 6)

### Task 8: Menu Bộ lọc — ô chữ, khoảng số, mốc, Có/Không, Trống (sau `cham-tep` R2-1)

**Files:**
- Modify: `packages/ui/src/components/data-table.tsx` (`DataTableFacet.kieu?: "luaChon" | "chu" | "khoang"`, `docSo?: (chu: string) => number | null`, `loiSo?: string`), `packages/ui/src/lib/messages.ts` (chỉ thêm dòng)
- Modify: `apps/app/components/crm/fields/field-facets.tsx` (dựng mặt lọc theo `cachLocTruong`, «Trống»/«Không chọn»/«Chưa giao», «Đã qua» · «Tháng này» · «Tháng sau» · «Sau đó», «Có»/«Không»), `apps/app/lib/messages/crm.ts` (chỉ thêm dòng)
- Create: `_acceptance/loc-moi-truong/rang/do-man.mjs`

- [ ] Chờ trả lời `tra-loi/R2-1.json`; từ chối thì dừng, báo giám sát.
- [ ] Viết `do-man.mjs` theo E10; chạy trên phiên đo — đỏ.
- [ ] Sửa `data-table.tsx` và `field-facets.tsx`; ô «Từ/Đến» đọc bằng `docSoNhap` truyền qua `docSo`.
- [ ] Chạy E10 — đạt; soát sáu ảnh.
- [ ] Commit.

independent: false (cuối cùng)

### Task 9: Chốt S3

- [ ] `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` xanh.
- [ ] Hợp đồng `status: implemented`; commit; vào S4.
