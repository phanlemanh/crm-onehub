# Bộ lọc danh sách rõ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bảng rỗng vì lọc nói rõ và có nút «Bỏ lọc»; nút trong menu con đúng tên «Bỏ chọn»; lựa chọn đếm 0 vẫn hiện kèm số — cho bốn danh sách CRM qua `DataTable` dùng chung.

**Architecture:** Mọi hành vi hiển thị làm ở `packages/ui/src/components/data-table.tsx` bằng prop tuỳ chọn (`searchActive`, `onClearFilters`, `counts` cho `DataTableFacetMenu`); `DataTable` tự tra số từ `facetCounts` sẵn có. Bốn bảng ở `apps/app` thôi lọc `> 0`, truyền cờ tìm kiếm và hàm bỏ lọc dựng từ `applyView` của `useTableQuery` (ghi URL một lần).

**Tech Stack:** React 19, Radix (dropdown, command), nuqs, bun test + jsdom (`packages/ui/test/setup-dom.ts`), tRPC + TanStack Query.

**Spec:** `docs/superpowers/specs/2026-10-07-datatable-loc-ro-design.md` · hợp đồng `_acceptance/datatable-loc-ro/contract.md` · evals `_acceptance/datatable-loc-ro/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- `DataTable`, `DataTableFacetMenu`: giữ nguyên mọi prop cũ; chỉ thêm prop tuỳ chọn.
- UI chỉ từ `@crm/ui`; không thêm `className` đổi màu, góc, khoảng cách lên component `@crm/ui` ở bốn bảng.
- Chữ: vi `table.clearFilters` = «Bỏ chọn»; `table.noMatch` = «Không có kết quả nào khớp bộ lọc»; `table.noMatchDescription` = «Đổi hoặc bỏ bớt bộ lọc, hay xoá từ khoá tìm, để thấy lại danh sách.»; `table.resetFilters` = «Bỏ lọc». en: «Clear», «Nothing matches these filters», «Change or clear a filter, or clear the search, to see the list again.», «Clear filters».
- Chữ rỗng không lọc: vi «Chưa có thoả thuận nào.», «Chưa có cá nhân nào.», «Chưa có công ty nào.»; en «No deals yet.», «No contacts yet.», «No companies yet.».
- Tệp chữ dùng chung: chỉ sửa đúng các dòng đã duyệt (P3-2), không chạm dòng khác.
- Chạy `apps/app` test với `TZ=Asia/Ho_Chi_Minh`; bài DOM chạy riêng từng tệp (mock.module sống qua tệp).

## Review Focus

1. Ô tìm có chữ nhưng không tiêu chí nào → vẫn là «rỗng vì lọc» (searchActive) — Task 1 ca 4.
2. `filters` chứa khoá trạng thái `["all"]` khi không lọc → KHÔNG tính là lọc — Task 1 ca 6.
3. Hai trường tuỳ chỉnh cùng chọn rồi «Bỏ lọc» → `fields` rỗng hẳn — Task 3 `bo-loc`.
4. Lựa chọn giá trị tự do đang chọn mà đếm mất → vẫn trong menu với 0 — Task 3 `so-0` ca `tu-do`.
5. Lựa chọn trạng thái đếm 0 đang được chọn → vẫn hiện trong menu trạng thái — Task 2 `so-dem`.

---

### Task 1: Ô rỗng vì lọc trong `DataTable` (independent: false)

Phục vụ E1, E2 (một phần E9).

**Files:**
- Modify: `packages/ui/src/lib/messages.ts` (khối `table` en và vi: đổi `clearFilters`, thêm `noMatch`, `noMatchDescription`, `resetFilters`)
- Modify: `packages/ui/src/components/data-table.tsx` (props, tính `filterActive`, overlay)
- Create: `packages/ui/test/data-table-loc-ro.dom.tsx` (describe `rong-vi-loc`, `nut-bo-loc`)

**Interfaces:**
- Produces: `DataTableProps` thêm `searchActive?: boolean`, `onClearFilters?: () => void`.

- [ ] **Step 1: Viết bài đỏ** — `data-table-loc-ro.dom.tsx`: helper `ve(props)` dựng `DataTable` trong `NuqsTestingAdapter` + `LocaleProvider` + `TooltipProvider` bằng `createRoot`/`act`; `queryCo(filters, tab, tabId)` dựng `TableQueryState`. Ma trận 8 dòng của E1 viết thành mảng `{ten, props, mong: "loc"|"man"|"tai"}`; mỗi dòng đọc `[data-slot="empty"]`, `textContent`, `[role="status"]`. `nut-bo-loc`: đếm lần gọi.
- [ ] **Step 2: Chạy** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/data-table-loc-ro.dom.tsx -t rong-vi-loc` → đỏ (không có `noMatch`).
- [ ] **Step 3: Cài** — trong `DataTable`:

```tsx
const filterActive =
	searchActive === true ||
	(tabs != null && query.tab !== "all") ||
	Object.entries(query.filters).some(
		([id, values]) => id !== query.tabId && values.length > 0,
	);
```

overlay khi `deferredRows.length === 0`: `loading` → `<Spinner />`; `filterActive` → `<Empty><EmptyHeader><EmptyTitle>{msg.table.noMatch}</EmptyTitle><EmptyDescription>{msg.table.noMatchDescription}</EmptyDescription></EmptyHeader>{onClearFilters && <EmptyContent><Button variant="outline" size="sm" onClick={onClearFilters}>{msg.table.resetFilters}</Button></EmptyContent>}</Empty>`; còn lại `empty ?? msg.table.noResults`.
- [ ] **Step 4: Chạy lại** cả hai describe → xanh. Phá-thử chiều đỏ của E1 (đếm cả khoá trạng thái) trên bản sao → dòng 6 đỏ đúng thông điệp ghim; hoàn lại.
- [ ] **Step 5: Commit** `feat(ui): DataTable nói rõ khi rỗng vì lọc, có nút Bỏ lọc`.

### Task 2: Số đếm, lựa chọn 0, «Bỏ chọn» (independent: false)

Phục vụ E4, E5.

**Files:**
- Modify: `packages/ui/src/components/data-table.tsx` (`FacetSubmenu`, `DataTableFacetMenu`, menu trạng thái)
- Test: `packages/ui/test/data-table-loc-ro.dom.tsx` (describe `bo-chon`, `so-dem`)

**Interfaces:**
- Produces: `DataTableFacetMenu` thêm prop `counts?: Record<string, Record<string, number>>`; `FacetSubmenu` nhận `counts?: Record<string, number>`; `DataTable` truyền `facetCounts` xuống.

- [ ] **Step 1: Bài đỏ** — `bo-chon`: mở menu Lọc rồi menu con bằng chuỗi `pointerdown/mousedown/pointerup/click` (khuôn `luoi-va-khong-dich.dom.tsx`), trigger con mở bằng `keydown ArrowRight` hoặc click; kiểm mục «Bỏ chọn» ở cả nhánh thường và nhánh `searchable`, `onFilterChange` chỉ gọi cho đúng tiêu chí, menu con vẫn mở. `so-dem`: span số theo thứ tự 4,0,0; tiêu chí không có mục đếm thì không có span; menu trạng thái có «closed» với 0.
- [ ] **Step 2: Chạy** `-t bo-chon` và `-t so-dem` → đỏ.
- [ ] **Step 3: Cài** — hàm `SoDem` nhỏ render `<span className="ml-auto tabular-nums opacity-60" data-slot="facet-count">{n}</span>`; mỗi `DropdownMenuCheckboxItem` / `CommandItem` in nó khi `counts` có; nhánh `searchable` thêm `CommandItem` «Bỏ chọn» đầu `CommandGroup` khi `selected.length > 0`; mục «Bỏ chọn» ở nhánh thường `onSelect={(e) => { e.preventDefault(); onChange([]); }}`; menu trạng thái bỏ dòng `if (tabCounts?.[option.value] === 0) return null` và in số khi có `tabCounts`.
- [ ] **Step 4: Chạy lại** → xanh; phá-thử hai chiều đỏ của E5 (giữ dòng ẩn tab; bỏ tra cứu đếm) và của E4 (bỏ mục ở nhánh searchable) → đỏ đúng thông điệp; hoàn lại.
- [ ] **Step 5: Commit** `feat(ui): menu lọc in số đếm, hiện lựa chọn 0, nút Bỏ chọn đúng tên`.

### Task 3: Bốn bảng CRM (independent: false)

Phục vụ E3, E6, E7.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/contacts/contacts-table.tsx`, `companies/companies-table.tsx`, `deals/deals-table.tsx`, `settings/members/members-table.tsx`, `apps/app/components/crm/fields/field-facets.tsx`
- Modify: `apps/app/lib/messages/{contacts,companies,deals}.ts` (dòng `empty` vi + en)
- Create: `apps/app/test/bang-crm-loc-ro.dom.tsx` (describe `bo-loc`, `so-0`, `khong-loc`)

**Interfaces:**
- Consumes: `searchActive`, `onClearFilters` (Task 1); `counts` của `DataTableFacetMenu` (Task 2).
- Produces: trong mỗi bảng `const clearFilters = () => applyView({ ...currentView, q: "", filters: tabId ? { [tabId]: ["all"] } : {} })` — deals: `{ status: ["all"] }`.

- [ ] **Step 1: Bài đỏ** — trpc giả theo khuôn `chuyen-okr.dom.tsx` (`mock.module("@/lib/trpc/client")`, `@/lib/trpc/cache`, `next/navigation`), kiểu đầu ra `RouterOutputs`; ghi mọi đầu vào của `*.list`. `bo-loc` 4 bảng; `so-0` 13 ô + `tu-do` 4 ô + `kanban`; `khong-loc` 12 ô.
- [ ] **Step 2: Chạy** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/bang-crm-loc-ro.dom.tsx` → đỏ.
- [ ] **Step 3: Cài** — bỏ mọi `.filter((option) => (facetCounts?.X?.[option.value] ?? 0) > 0)` và nhánh `flatMap` của thành viên; `field-facets.tsx` bỏ `.filter`; tiêu chí giá trị tự do dùng hàm cục bộ `giuDangChon(keys, selected)` = hợp có thứ tự của khoá đếm (đã sort) và `selected` chưa có; truyền `searchActive={input.q !== ""}` (thành viên dùng `input.q`) và `onClearFilters={clearFilters}`; Kanban truyền `counts={facetCounts}`; đổi ba dòng `empty`.
- [ ] **Step 4: Chạy lại** → xanh; phá-thử chiều đỏ E3 (setFilter lần lượt ở contacts → «fields con k1»), E6 (trả filter `> 0` ở owner), E7 (searchActive cố định) → đỏ; hoàn lại.
- [ ] **Step 5: Commit** `feat(app): bốn danh sách dùng ô rỗng vì lọc, giữ lựa chọn số 0`.

### Task 4: Chữ và hồi quy (independent: false)

Phục vụ E9, E10.

**Files:**
- Modify: `packages/ui/test/data-table-locale.spec.tsx` (describe `loc-ro-chu`, `loc-ro-en`, `loc-ro-vi`)
- Kiểm: `apps/app/test/messages-guard.spec.ts`, `loc-okr-ten.spec.ts`, `loc-okr-tai-truoc.spec.ts`, `render-diff.spec.tsx`, `lai-ra-man.spec.tsx`

- [ ] **Step 1:** thêm ca ma trận 7 khoá (en ≠ vi, en không khớp `/[À-ỹ]/`) — khoá app đọc qua `contactsMessages("en"|"vi")`… nhập từ `apps/app/lib/messages` KHÔNG được (gói ui không nhập app) → ca ba khoá app đặt trong `bang-crm-loc-ro.dom.tsx` describe `khong-loc` (đã có), ca 4 khoá ui ở `data-table-locale.spec.tsx`.
- [ ] **Step 2:** chạy `config:executors.test.dlr_chu` và `dlr_hoi_quy` → xanh; phá-thử chép câu vi sang en → đỏ ghim tên khoá; hoàn lại.
- [ ] **Step 3: Commit** `test(ui): chữ ô rỗng vì lọc đủ hai thứ tiếng`.

### Task 5: Sàn thiết kế (independent: false)

Phục vụ E11.

**Files:**
- Create: `_acceptance/datatable-loc-ro/rang/khong-ghi-de.mjs` (theo khuôn `_acceptance/cua-vao-va/rang/khong-ghi-de.mjs`, ma trận 27 tiền tố, cờ `--tu-thu`)

- [ ] **Step 1:** viết răng; `--tu-thu` bơm từng tiền tố vào bản sao `deals-table.tsx` trong thư mục tạm ngoài gói, đếm ca đỏ = 27.
- [ ] **Step 2:** chạy `config:executors.script.dlr_san_thiet_ke` → 0 P0, «0 lop moi»; `--tu-thu` → 27/27 đỏ.
- [ ] **Step 3: Commit** `test(acceptance): răng sàn thiết kế datatable-loc-ro`.

### Task 6: Đo màn thật (independent: false)

Phục vụ E8.

**Files:**
- Create: `_acceptance/datatable-loc-ro/rang/do-man.mjs` (theo khuôn `_acceptance/cua-vao-va/rang/do-man.mjs` + `tieu-de-cot-doc-tron/rang/mot-luot.sh`)

- [ ] **Step 1:** dựng dữ liệu qua API của kho đo: một thoả thuận, một giai đoạn rỗng; một trường tuỳ chỉnh dạng lựa chọn của cá nhân với hai lựa chọn, một chưa dùng.
- [ ] **Step 2:** 2 khổ × 4 cảnh, chụp `evidence/<canh>-<kho>.png`, in dòng `DUNG/SAI` + «8/8 o», mã 0/1/2.
- [ ] **Step 3:** chạy `config:executors.script.dlr_do_man` → 8/8; soi ảnh.
- [ ] **Step 4: Commit** `test(acceptance): đo màn thật datatable-loc-ro`.

### Task 7: Năm lệnh của kho

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop` ở gốc → xanh (test và build chạy trong S4).
- [ ] Đặt contract `status: implemented`, commit.
