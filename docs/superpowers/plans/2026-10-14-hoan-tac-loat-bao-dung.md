# Lưu trữ và hoàn tác loạt báo đúng Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kết quả lưu trữ/khôi phục hàng loạt tách lỗi thật của máy chủ (`errored`), ghi log từng bản lỗi; toast app báo lỗi máy chủ riêng khỏi «bị bỏ qua» và báo «đã được khôi phục từ trước» khi hoàn tác mà mọi bản đã về.

**Architecture:** `apps/api/src/crm/bulk.ts` — `runBulk` đếm `errored`, ghi `Logger.error`/`warn` mỗi bản; `crmBulkResultOutput` thêm `errored`. `apps/app/components/crm/bulk-actions.tsx` — `BulkResult` thêm `errored`, `baoLuuTruLoat`/`baoHoanTacLoat` rẽ theo nó; hai khoá chữ mới. Luật đếm `failed` của V2d giữ nguyên.

**Tech Stack:** NestJS + tRPC + zod, Prisma, bun test (+ supertest, happy-dom), sonner.

**Spec:** `docs/superpowers/specs/2026-10-14-hoan-tac-loat-bao-dung-design.md` · hợp đồng `_acceptance/hoan-tac-loat-bao-dung/contract.md` · tiêu chí `_acceptance/hoan-tac-loat-bao-dung/evals.yaml`

## Global Constraints

- Không chú thích trong code. Log theo `docs/api.md` mục Logging: một đối tượng, stack ở đối số hai.
- `apps/app/lib/messages/crm.ts`, `apps/app/test/messages-guard.spec.ts`, `_acceptance/config.yaml` chỉ thêm dòng.
- Không sửa `apps/api/test/hoan-tac-loat-dung-id.spec.ts`, `apps/app/test/hoan-tac-loat-dung-id.dom.tsx` (E11 canh).
- Toast không in lời lỗi thô. `errored` vắng coi như 0.
- Phép đo mới kèm cặp hai chiều trên cùng fixture, chiều đỏ ghim thông điệp.

## Review Focus

- `errored` vắng → `NaN` trong số «bị bỏ qua» (Task 2, E5).
- Lô trộn `succeeded 0` có cả bỏ qua lẫn lỗi thật ra toast cảnh báo thay toast lỗi (Task 2, E3 ca trộn).
- Log truyền `err.message` thay stack (Task 1, E1).
- `NotFoundException` lọt vào `errored` (Task 1, E1).
- Bài V2d bị sửa cho xanh (Task 3, E11).

---

### Task 1: Máy chủ — `errored` và log từng bản

`independent: true` · phục vụ E1, E2, E9, E10, E17

**Files:** Modify `apps/api/src/crm/bulk.ts`, `docs/api.md` (mục «Deleting a record is archive first, purge later»). Create `apps/api/test/hoan-tac-loat-bao-dung.spec.ts`, `_acceptance/hoan-tac-loat-bao-dung/rang/tai-lieu.mjs`.

**Interfaces:** Produces `crmBulkResultOutput` có `errored: z.number()`; `runBulk(ids, act)` không đổi chữ ký.

- [ ] Viết `hoan-tac-loat-bao-dung.spec.ts`: describe `hlb-run-bulk` gọi `runBulk(["ok","nul","mat","hong"], act)` với `act` trả `{id}`, `null`, ném `new NotFoundException("No x")`, ném `loi = new Error("hong-that")`; `spyOn(Logger.prototype,"error")`, `spyOn(Logger.prototype,"warn")`; khẳng định kết quả, `error.mock.calls[0][0].recordId === "hong"`, `error.mock.calls[0][1] === loi.stack`, `warn` một lần `recordId "mat"`; đối chứng 4 id trả `{id}` → `errored 0`, `error`/`warn` 0 lần; mỗi sai ném thông điệp ghim của E1. Describe `hlb-may-chu`: chép khung `AppModule` + `supertest` + `mintPhien`/`gieoThanhVien` của `hoan-tac-loat-dung-id.spec.ts` (gieo a, p đã cất, x giả), ma trận 3 loại × {bulkArchive, bulkRestore}, khẳng định `errored === 0` và số của V2d; `expect(o.length).toBe(6)`.
- [ ] Chạy `bun run test -- "cd apps/api && bun test test/hoan-tac-loat-bao-dung.spec.ts"` — đỏ.
- [ ] `bulk.ts`: `const logger = new Logger("CrmBulk")`; trong `catch`: `if (error instanceof NotFoundException) logger.warn({ message: "Bulk action skipped a missing record", recordId: id })` còn lại `errored += 1; logger.error({ message: "Bulk action failed", recordId: id }, error instanceof Error ? error.stack : undefined)`; trả `errored`; schema thêm `errored: z.number()`.
- [ ] Chạy lại — xanh; chạy `htl-luu-tru`, `htl-hoan-tac` của V2d — xanh không sửa. Phá-thử từng chiều đỏ E1, E2 trên bản đã commit.
- [ ] `docs/api.md`: thêm đoạn nói `changedIds` (bản vừa đổi), `skipped` (đã như ý), `failed` (không đổi được, gồm id không còn), `errored` (phần của `failed` vì lỗi máy chủ thật) và dòng log `Bulk action failed`/`skipped a missing record` kèm `recordId`. Viết `rang/tai-lieu.mjs` (cắt mục, đủ 4 tên + `recordId`; `--chieu-do` đọc bản merge-base). Chạy hai chiều.
- [ ] Commit `feat(hoan-tac-loat-bao-dung): runBulk tách lỗi máy chủ và ghi log từng bản`.

### Task 2: App — toast báo đúng

`independent: false` (cần trường `errored` của Task 1 về kiểu) · phục vụ E3, E4, E5, E6–E8, E12, E13

**Files:** Modify `apps/app/components/crm/bulk-actions.tsx`, `apps/app/lib/messages/crm.ts` (thêm `bulk.chuaLuuTru`, `bulk.daVeTruoc` vi/en), `apps/app/test/messages-guard.spec.ts` (thêm GHIM). Create `apps/app/test/hoan-tac-loat-bao-dung.dom.tsx`.

- [ ] Chữ: vi `chuaLuuTru: (n) => \`${n} bản chưa lưu trữ được vì máy chủ gặp lỗi — thử lại sau.\``, `daVeTruoc: (n) => \`${n} bản đã được khôi phục từ trước.\``; en `\`${n} could not be archived — the server hit an error. Try again later.\``, `\`${n} were already restored.\``. GHIM `"crm:bulk.chuaLuuTru"`, `"crm:bulk.daVeTruoc"` theo khuôn hai chuỗi của `"crm:bulk.boQua"`.
- [ ] Viết `hoan-tac-loat-bao-dung.dom.tsx` (describe `hlb-luu-tru-loi`, `hlb-hoan-tac-da-ve`, `hlb-thieu-truong`, `hlb-chu`): vẽ `<Toaster />` của `@crm/ui/components/sonner`, gọi thẳng `baoLuuTruLoat`/`baoHoanTacLoat` với `done`/`restored` theo `contactMessages`/`companyMessages`/`dealMessages`, đọc vùng toast (`[data-sonner-toast]`, `data-type`); ma trận đúng như E3 (9), E4 (6), E5 (6); E12 so chuỗi chữ.
- [ ] Chạy — đỏ.
- [ ] `bulk-actions.tsx`: `BulkResult` thêm `errored: number`; `const loi = Number.isFinite(result.errored) ? result.errored : 0`; `baoLuuTruLoat`: `boQua = skipped + failed − loi`; phần chữ `[done(succeeded) khi > 0, boQua(boQua) khi > 0, chuaLuuTru(loi) khi > 0]` nối bằng khoảng trắng; `changedIds` rỗng → `loi > 0 ? toast.error(…) : toast.warning(khongDoi)`; còn lại `baoDaLuuTru` như cũ. `baoHoanTacLoat`: `succeeded 0 && failed 0 && skipped > 0` → `toast.success(daVeTruoc(skipped))` trước nhánh `hoanTacLoi`.
- [ ] Chạy bài mới, bốn bài DOM V2d, messages-guard — xanh. Phá-thử chiều đỏ E3, E4, E5, E12.
- [ ] `check-types`, `lint`, `lint:slop`. Commit `fix(hoan-tac-loat-bao-dung): toast lưu trữ, hoàn tác hàng loạt báo đúng`.

### Task 3: Canh bài V2d

`independent: true` · phục vụ E11

- [ ] `rang/v2d-nguyen.mjs` theo khuôn `_acceptance/dai-luu-tru-dung-chung/rang/v2-nguyen.mjs` với hai tệp kiểm V2d; chạy hai chiều; commit.

### Task 4: Đo màn

`independent: false` (cần Task 1–2) · phục vụ E14, E15, E16

- [ ] `rang/man.mjs` theo khuôn `_acceptance/hoan-tac-loat-dung-id/rang/man.mjs` (man-lib, `moDo`, gieo 3 cá nhân qua đường ghi thật, chọn cả ba, «Hành động» → «Lưu trữ», khôi phục cả ba qua db, bấm «Hoàn tác», chờ toast có `daVeTruoc("3")` và không có `hoanTacLoi`, đọc lại db, chụp `hlb-da-ve-1440.png`, chép vào evidence khi hồ sơ chưa thông cổng và không `--chieu-do`). `--chieu-do`: bỏ bước khôi phục qua db → đỏ «man: khong thay toast da ve truoc».
- [ ] Chạy qua `tien-de.mjs --chay` hai chiều; commit kèm ảnh.
