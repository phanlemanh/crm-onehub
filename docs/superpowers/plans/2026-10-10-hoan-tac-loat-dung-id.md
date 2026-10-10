# Hoàn tác hàng loạt đúng bản đã cất — kế hoạch thi công

> Thi công: Native (thợ P2 tự làm tuần tự trong worktree phiên).

**Goal:** lưu trữ và khôi phục hàng loạt trả `changedIds` thật; «Hoàn tác» chỉ gửi những id đó; toast nói số bị bỏ qua hay
không về được bằng chữ của sản phẩm.

**Spec:** `docs/superpowers/specs/2026-10-10-hoan-tac-loat-dung-id-design.md` · hợp đồng `_acceptance/hoan-tac-loat-dung-id/contract.md`

## Global Constraints

- Không chú thích trong code. Không `Record<string, unknown>`, không tham số `unknown` (lint:slop).
- Chữ mới vào `apps/app/lib/messages/crm.ts`, đủ cặp en/vi; giá trị khoá có sẵn không đổi.
- `archive`/`restore` đơn lẻ không đổi hành vi (K6b).
- `apps/api/src/generated/server.ts` không sửa tay.

## Review Focus

1. Router khai `output` bằng schema thiếu trường → body mất `changedIds` (E1 qua HTTP).
2. Lô toàn id hỏng, `changedIds` rỗng mà có `message` → không in câu thô (E5 ca 4).
3. Hoàn tác về thiếu → không có toast xanh đi kèm toast vàng (E4).
4. Hai người bấm cùng lúc → `restoreIfArchived` có điều kiện, lần sau thành `skipped` (E1 lần hai).
5. Bài V2 `vdc-hoan-tac-loat` và `vdc-hoan-tac-loi` phải nhận fixture có `changedIds`, nếu không client đọc `undefined`.

## Task 1: Máy chủ — `changedIds` và đường hàng loạt có điều kiện

**Files:** `apps/api/src/crm/bulk.ts`, `apps/api/src/{contacts,companies,deals}/*.service.ts`,
`apps/api/src/{contacts,companies,deals}/*.contracts.ts`, test `apps/api/test/hoan-tac-loat-dung-id.spec.ts`.

**Produces:** `BulkResult = { requested, succeeded, skipped, failed, message, changedIds: string[] }`;
`bulkResultOutput` (zod) export từ `crm/bulk.ts`; ba contracts re-export dưới tên cũ.

- [ ] Viết bài HTTP (khuôn `sua-luu-tru.spec.ts`: AppModule + supertest + `mintPhien`): `htl-luu-tru` (3 loại × {archive,
  restore} = 6 ô) và `htl-hoan-tac` (3 loại). Chạy: đỏ (`changedIds` undefined).
- [ ] `runBulk` gom `changedIds`; ba service thêm `archiveIfActive`/`restoreIfArchived` (`updateMany` có điều kiện → `count`;
  0 → `findUnique` còn thì `null`, không còn thì `NotFoundException` cùng câu với `translate`); `bulkArchive`/`bulkRestore`
  dùng chúng.
- [ ] Gộp schema đầu ra, thêm `skipped`, `changedIds`. Chạy lại: xanh. Phá thử hai chiều đỏ ghim.

## Task 2: Trình duyệt — Hoàn tác đúng id, toast không câu thô

**Files:** `apps/app/components/crm/bulk-actions.tsx`, ba `*-bulk-actions.tsx`, `apps/app/lib/messages/crm.ts`,
test `apps/app/test/hoan-tac-loat-dung-id.dom.tsx`, sửa `apps/app/test/vong-doi-mot-cach-cat.dom.tsx`.

**Consumes:** `BulkResult` có `skipped`, `changedIds`.

- [ ] Viết bài DOM `htl-hoan-tac-dung-id` (3), `htl-hoan-tac-thieu` (9), `htl-luu-tru-bo-qua` (12), `htl-en`. Đỏ.
- [ ] `crm.ts` thêm `bulk.boQua(n)`, `bulk.khongDoi(n)`, `bulk.hoanTacThieu(n)` (en/vi).
- [ ] `baoLuuTruLoat`: `changedIds` rỗng → `toast.error(khongDoi(skipped+failed))`, không nút; bỏ qua > 0 → `done(n) + " " +
  boQua(k)`; không nối `message`. `baoHoanTacLoat`: `failed > 0` và `succeeded > 0` → `toast.warning(restored(n) + " " +
  hoanTacThieu(k))`.
- [ ] Ba `*-bulk-actions.tsx`: `onHoanTac: () => hoanTac.mutate({ ids: result.changedIds })`.
- [ ] Sửa fixture và assert của `vdc-hoan-tac-loat`, `vdc-hoan-tac-loi` theo luật mới (supersede AC-1 V2). Xanh, phá thử.

## Task 3: Răng màn E8

**Files:** `_acceptance/hoan-tac-loat-dung-id/rang/man.mjs` (khuôn `man-lib.mjs` như `vong-doi-mot-cach-cat/rang/man.mjs`).

- [ ] Gieo 3 cá nhân mang mã, mở `/contacts?q=<mã>`, chờ 3 dòng; cất bản thứ ba qua db; chọn hết → Lưu trữ → toast có số 2
  và số bỏ qua 1, không "No "/"with id"; bảng 0 dòng; Hoàn tác → đúng 2 dòng; db đối chiếu. Hai `--chieu-do`.

## Cổng máy

`bun run test`, `check-types`, `lint`, `lint:slop`, `build`.
