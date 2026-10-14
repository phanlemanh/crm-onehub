# Lưu trữ trường không hỏi lại — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lưu trữ một trường (menu dòng, trình sửa) thôi hỏi lại và có toast «Hoàn tác».

**Architecture:** Hook `useLuuTruTruong(entity)` ở `components/crm/fields/use-luu-tru-truong.ts` gói `fields.archive` + `fields.restore` + `baoDaLuuTru`; gọi ở hai component chủ (`fields-settings.tsx`, `fields-sheet.tsx`) và truyền `onArchive(field)` xuống `FieldsList`, `FieldEditor`. Trình sửa bỏ `AlertDialog`.

**Tech Stack:** Next.js, React Query, `@crm/ui` (`baoDaLuuTru`), bun test + happy-dom, Playwright qua `tien-de.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-13-luu-tru-truong-khong-hoi-design.md` · `_acceptance/luu-tru-truong-khong-hoi/{contract.md,evals.yaml}`

## Global Constraints

- Không chú thích trong code. Không `className` đè kiểu component `@crm/ui`.
- Chữ: «Đã lưu trữ <nhãn>.», «Đã khôi phục <nhãn>.», «Chưa hoàn tác được. Trường vẫn ở mục Đã lưu trữ.»; en không dấu Việt.
- `crm.ts`: chỉ thêm khoá `fields.*`, xoá đúng 6 dòng archiveTitle/Body/Field (cham-tep P3-4 đã duyệt).
- Không đổi máy chủ.

## Review Focus

- Trình sửa bị gỡ ngay sau «Lưu trữ»: toast và «Hoàn tác» vẫn chạy (E2 dựng `FieldsSheet` thật).
- «Hoàn tác» trong ngăn Sheet không làm đóng ngăn (E10 bước 3).
- Bấm «Hoàn tác» hai lần: khôi phục một lần (E3).
- Hoàn tác lỗi: không in lỗi thô (E4).
- Người không quyền: nút «…» khoá, trình sửa không mở (E7, E8).

---

### Task 1: Chữ

independent: false · phục vụ E5, E6, E12

**Files:** `apps/app/lib/messages/crm.ts`, `apps/app/test/messages-guard.spec.ts`, `apps/app/test/vong-doi-mot-cach-cat.dom.tsx`

- [ ] Thêm vào `fields` (en): `archived: (label: string) => \`${label} was archived.\``, `restored: (label: string) => \`${label} was restored.\``, `hoanTacLoi: "Couldn't undo. The field is still under Archived."`; (vi): `archived: (label) => \`Đã lưu trữ ${label}.\``, `restored: (label) => \`Đã khôi phục ${label}.\``, `hoanTacLoi: "Chưa hoàn tác được. Trường vẫn ở mục Đã lưu trữ."`.
- [ ] Xoá `archiveTitle`, `archiveBody`, `archiveField` ở cả hai bản; bỏ ba dòng tương ứng trong `fields-copy.ts`.
- [ ] `messages-guard.spec.ts`: bỏ dòng GHIM `crm:fields.archiveTitle`; thêm `crm:fields.archived` `["Đã lưu trữ 1.", "Đã lưu trữ 12."]`, `crm:fields.restored` `["Đã khôi phục 1.", "Đã khôi phục 12."]`.
- [ ] `vong-doi-mot-cach-cat.dom.tsx`: `truongVi`/`truongEn` chỉ còn `archivedNote`.
- [ ] Verify: `cd apps/app && bun test test/messages-guard.spec.ts` (sau Task 2, khi khoá mới đã có chỗ gọi).

### Task 2: Hook và hai đường lưu trữ

independent: false · phục vụ E1–E4, E7, E8, E13

**Files:** Create `apps/app/components/crm/fields/use-luu-tru-truong.ts`; Modify `fields-list.tsx`, `field-editor.tsx`, `fields-sheet.tsx`, `app/(app)/[slug]/settings/fields/fields-settings.tsx`; Test `apps/app/test/luu-tru-truong-khong-hoi.dom.tsx`

- [ ] Bài DOM đỏ trước (khung tRPC giả của `chi-quan-tri-truong.dom.tsx`): `ltk-menu`, `ltk-trinh-sua` (dựng `FieldsSheet` thật), `ltk-hoan-tac` (2 đường), `ltk-hoan-tac-loi`, `ltk-chu`, mỗi chiều đỏ một `chot(…, "<thông điệp ghim>")`.
- [ ] Hook: `useLuuTruTruong(entity: FieldEntity)` trả `(field: { id: string; label: string }) => void`; `archive` onSuccess → `cache.fields(kindOf(entity))` rồi `baoDaLuuTru({ thongDiep: m.fields.archived(field.label), nhanHoanTac: m.sheet.hoanTac, onHoanTac: () => restore.mutate({ id: field.id }) })`; `restore` onSuccess → `toast.success(m.fields.restored(label))` + `cache.fields`; onError → `toast.error(m.fields.hoanTacLoi)`. Nhãn lấy từ kết quả `SerializedField.label` của máy chủ.
- [ ] `FieldsList`: prop `onArchive`; menu dòng gọi `onArchive(field)`; bỏ mutation `archive` riêng (giữ `restore` của nhóm «Đã lưu trữ»).
- [ ] `FieldEditor`: prop `onArchive`; bỏ `AlertDialog`, state `confirming`, mutation `archive`; nút «Lưu trữ» → `onArchive(field)` rồi `onDone()`.
- [ ] Hai component chủ gọi hook một lần, truyền `onArchive` xuống.
- [ ] Verify: bài DOM mới xanh; `chi-quan-tri-truong.dom.tsx` xanh; `check-types`; biome + oxlint; bộ quét tĩnh hai tệp; phá-thử từng thông điệp ghim.

### Task 3: Kịch bản đo màn

independent: false · phục vụ E9, E10, E11

**Files:** Create `_acceptance/luu-tru-truong-khong-hoi/rang/man.mjs` (khung của `lien-quan-loc-ban-da-cat/rang/man.mjs`).

- [ ] Ba bước: (1) 1440 Cài đặt › Trường thẻ Công ty, menu dòng → «Lưu trữ» → toast → API `archived true` → «Hoàn tác» → API `archived false`; (2) 390 trình sửa, cùng kiểm; (3) 1440 `/companies?manageFields=company`, menu dòng → «Lưu trữ» → «Hoàn tác» → ngăn còn mở, API `archived false`. Gieo trường qua `fields.create` thật, dọn qua `fields.delete` cuối.
- [ ] `--chieu-do`: không bấm «Lưu trữ» → «man: khong thay toast luu tru».
- [ ] Verify: `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/luu-tru-truong-khong-hoi/rang/man.mjs"` → «… man: dat».
