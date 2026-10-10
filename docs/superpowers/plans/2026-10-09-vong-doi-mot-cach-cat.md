# V2 vong-doi-mot-cach-cat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lưu trữ hàng loạt ở ba bảng CRM có «Hoàn tác»; ngăn bản ghi đã cất có dải «Đã lưu trữ ngày … · Khôi phục» và chỉ đọc; Kanban thoả thuận có «Đã lưu trữ»; chữ và hộp xoá vĩnh viễn đúng bộ chữ.

**Architecture:** Một hook dùng chung `useLuuTruLoat` trong `components/crm/bulk-actions.tsx` bọc `bulkArchive` + `baoDaLuuTru` + `bulkRestore(variables.ids)`; `DaiLuuTru` trong `record-actions.tsx` dùng lại `useRestoreRecord`; ba ngăn bọc nội dung tab chi tiết trong `fieldset disabled`; `deals-table.tsx` dùng một hằng nút «Đã lưu trữ» cho cả hai nhánh; `BulkDeleteDialog` và hộp xoá vĩnh viễn của `RecordActions` chuyển sang `ConfirmDialog`. Không đổi API.

**Tech Stack:** React 19, TanStack Query 5, tRPC client, nuqs (`NuqsTestingAdapter`), sonner, `@crm/ui` (`Alert`, `AlertAction`, `ConfirmDialog`, `Button`), bun test + jsdom + `@testing-library/user-event`, Nest service test (bun) cho API.

**Spec:** `docs/superpowers/specs/2026-10-09-vong-doi-mot-cach-cat-design.md` · hợp đồng `_acceptance/vong-doi-mot-cach-cat/contract.md` · evals `_acceptance/vong-doi-mot-cach-cat/evals.yaml`.

## Global Constraints

- Không chú thích trong code; chữ mới đủ cặp en/vi và đi qua `messages-guard` (khoá viết tường minh `nhom.khoa` để lưới khoá chết thấy).
- `docs/design.md`: không đè kiểu component `@crm/ui` bằng `className`; `ConfirmDialog` thay `AlertDialog` ráp tay; `fieldset` theo tiền lệ `okr/soan/the-nhap.tsx` (fieldset trần bỏ viền/lề) hoặc `FieldSet disabled`.
- Ranh giới V2 (hang-viec + P2-36): bulk-actions ba bảng, `components/crm/bulk-actions.tsx`, ba sheet, `record-actions.tsx`, `deals/page.tsx`, `deals-table.tsx` (chỉ nút Kanban), `list-search-params.ts`, `archived-list.tsx`, test `vong-doi-*`, bốn tệp chữ deals/contacts/companies/crm.
- Ba sheet trùng K4b: K4b gộp trước; V2 gộp onehub sau K4b rồi gỡ xung đột.
- Bài DOM: expect chỉ so giá trị nguyên thuỷ; lượt đầu có trần thời gian, đo RSS (luật 35).
- `bun test` trong `apps/app` chung tiến trình: không `mock.module` một phần làm tệp khác đỏ (`khung-gop-y.tsx` đã mock `@/lib/trpc/cache` thành no-op — bài cần làm mới thật thì dựng bộ thử riêng, không import `khung-gop-y`).

## Review Focus

- Hoàn tác khi một phần không lưu trữ được (`failed > 0`, `succeeded > 0`): vẫn có «Hoàn tác», chữ nói số bỏ qua.
- `succeeded === 0`: giữ toast lỗi cũ, không có «Hoàn tác».
- Hoàn tác thất bại: toast `bulk.hoanTacLoi`, không lộ `error.message`.
- Khôi phục từ dải báo xong: `byId` đọc lại, dải mất, ô bật lại — không ẩn dải bằng state cục bộ.
- Kanban: bấm «Đã lưu trữ» lần hai quay về Kanban, `view=board` còn trên URL.

---

### Task 1: Hoàn tác lưu trữ hàng loạt (E1, E4)

**Files:** Modify `apps/app/components/crm/bulk-actions.tsx` (thêm `useLuuTruLoat`), `deals-/contacts-/companies-bulk-actions.tsx`, `apps/app/lib/messages/crm.ts` (`bulk.hoanTacLoi` en/vi). Test `apps/app/test/vong-doi-mot-cach-cat.dom.tsx` (`vdc-hoan-tac-loat`, `vdc-hoan-tac-loi`).

**Interfaces — Produces:** `useLuuTruLoat({ archive: UseMutationResult, restore: UseMutationResult, done: (n) => string, restored: (n) => string, onDone })` hoặc tương đương nhận `mutationOptions` của `bulkArchive`/`bulkRestore` và trả `{ mutate(ids), isPending }`.

- [ ] Bài đỏ: bộ thử riêng (QueryClient thật, `useCrmCache` thật, `@/lib/trpc/client` giả có `queryKey/pathKey` khớp `cache.ts`, Toaster thật). Ma trận 3 loại × 2 kết quả (đủ; một phần) = 6; một component con giữ `useQuery(<loại>.list)` để đếm lần làm mới. Bấm bằng `userEvent`. Chiều đỏ ghim «vdc: luu tru loat khong co hoan tac», «vdc: hoan tac sai id», «vdc: hoan tac goi hai lan», «vdc: hoan tac khong lam moi danh sach», «vdc: hoan tac loi in loi tho».
- [ ] Cài đặt: lưu trữ xong `succeeded > 0` → `baoDaLuuTru({ thongDiep: failed > 0 ? leftAlone(...) : done(n), nhanHoanTac: crm.sheet.hoanTac, onHoanTac: () => restore.mutate({ ids: variables.ids }) })`; restore thành công → `cache.<loại>()` + `reportBulk(restored)`; lỗi → `toast.error(crm.bulk.hoanTacLoi)`.
- [ ] Xanh + phá thử từng chiều đỏ trên cây đã commit; commit.

### Task 2: Dải báo và chỉ đọc (E5, E6)

**Files:** Modify `record-actions.tsx` (`DaiLuuTru`), `contact-/company-/deal-sheet.tsx`, `crm.ts` (`sheet.daLuuTruNgay` en/vi). Test cùng tệp (`vdc-dai-bao`, `vdc-chi-doc`), dựng ngăn trong `DetailSheet open` với bộ thử riêng của Task 1.

- [ ] Bài đỏ theo `expected` của E5/E6: ma trận 3 ngăn × 2 trạng thái cho dải; 15 ô sửa viết trước cho chỉ đọc; xét tắt bằng `el.matches(":disabled")`; bấm bằng `userEvent`; mutation update 0 lần; menu «…» không tắt; sau «Khôi phục» `byId` đọc lại và số chỗ bật > 0.
- [ ] Cài đặt: dải `Alert` + `AlertAction` có `data-dai-luu-tru`, ngày bằng `LocalDateTime` dạng ngày; `fieldset disabled={Boolean(archivedAt)}` bọc nội dung tab chi tiết và menu giai đoạn trên đầu ngăn thoả thuận.
- [ ] Phá thử ba chiều đỏ; commit.

### Task 3: Nút «Đã lưu trữ» trên Kanban (E7)

**Files:** Modify `deals-table.tsx`. Test `vdc-kanban` (DealsTable thật trong `NuqsTestingAdapter`, theo tiền lệ `bang-crm-loc-ro.dom.tsx`).

- [ ] Bài đỏ; rút hằng `archivedButton`, đặt ở thanh công cụ nhánh board; xanh; phá thử; commit.

### Task 4: Chữ và hộp xoá vĩnh viễn (E8, E9)

**Files:** `deals.ts`, `contacts.ts`, `companies.ts` (`archivedToggle` vi «Đã lưu trữ»), `crm.ts` (`bulkMenu.confirmDelete` «Xoá vĩnh viễn»/«Delete forever»; `fields.archivedNote`, `fields.archiveBody` bỏ «ẩn»/«hidden»), `bulk-actions.tsx` (`BulkDeleteDialog` → `ConfirmDialog` + `pending`), ba bulk-actions truyền `purge.isPending`, `record-actions.tsx` (`ConfirmDialog`).

- [ ] Bài đỏ `vdc-chu` theo `expected` của E8 (double click → 1 lần purge); cài đặt; `messages-guard`; phá thử; commit.

### Task 5: Máy chủ thật (E2)

**Files:** Create `apps/api/test/vong-doi-mot-cach-cat.spec.ts` theo khuôn `apps/api/test/bulk.spec.ts`.

- [ ] Ba loại: gieo 3 bản → `bulkArchive` → không có trong list mặc định → `bulkRestore` → có lại; ca id không tồn tại. Chạy bằng `bun run test -- "cd apps/api && bun test test/vong-doi-mot-cach-cat.spec.ts"`; chiều đỏ bằng bản sao; commit.

### Task 6: Răng script (E15, E12)

**Files:** Create `_acceptance/vong-doi-mot-cach-cat/rang/duong-luu-tru.mjs`, `rang/man.mjs`.

- [ ] `duong-luu-tru.mjs`: suy gốc từ vị trí; quét `apps/app/**/*.tsx` (bỏ `test/`) tìm `archive`/`bulkArchive` `mutationOptions` của contacts/companies/deals; ma trận 4 chỗ; mỗi chỗ có `baoDaLuuTru` hoặc `useLuuTruLoat`; `--chieu-do`.
- [ ] `man.mjs` theo khuôn `khung-loi-ban-ghi-dung-ly-do/rang/man.mjs`: 5 bước của E12; ảnh 5 tệp; chốt hồ sơ đã thông cổng.
- [ ] Chạy qua `tien-de`; commit.

### Task 7: Cổng máy

- [ ] Gộp onehub (sau K4b), `bun run test`, `check-types`, `lint`, `lint:slop`, `build`; contract `status: implemented`; sang S4.
