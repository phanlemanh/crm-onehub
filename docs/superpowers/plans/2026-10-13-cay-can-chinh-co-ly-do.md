# L3 Cây căn chỉnh có lý do — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cây căn chỉnh hiện nhãn mức tin và lý do của từng chỗ nối, lọc được «Chưa có lý do» và «Đặt cược».

**Architecture:** `okr.cayCanChinh` trả thêm `canh: CanhCanChinh[]` dựng ở `OkrXemService.cayCanChinh` từ `alignments` của chính tập `mts` cây đã đọc (đích phải có trong tập). Client ghép cạnh với nút theo cặp (`nut.objectiveId`, id của cha) khi dựng cây; bộ lọc là giá trị `nuqs` mới, cắt cây giữ nút khớp và tổ tiên.

**Tech Stack:** NestJS + Zod (apps/api), Next.js + `@crm/ui` (TreeNav, ToggleGroup, StatusIndicator, KaraTrace, Empty), nuqs, bun test + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-13-cay-can-chinh-co-ly-do-design.md` · hợp đồng `_acceptance/cay-can-chinh-co-ly-do/contract.md` · evals `_acceptance/cay-can-chinh-co-ly-do/evals.yaml`.

## Global Constraints

- Không đổi `apps/api/src/okr/can-chinh.ts`, `NutCanChinh`, `nutCayDayDu`, `apps/api/test/okr-can-chinh.spec.ts`.
- Không chú thích trong code; không `className` đổi màu/góc/khoảng cách của component `@crm/ui`.
- `search-param-keys.ts`, `okr-toan-canh.ts`, `config.yaml`, `okr-theo-don-vi.dom.tsx` chỉ thêm dòng.
- Mức tin → nghĩa dùng `NGHIA_MUC_TIN` của `ly-do-noi-gop.tsx`; nhãn mức tin dùng `okrMessages(...).sheet.mucTin`.

## Review Focus

- Mục tiêu góp hai chỗ: mỗi lần hiện đọc cạnh theo cha của lần đó (E5).
- Đích của căn chỉnh không có trong tập cây: cạnh không vào `canh` (E1, E2).
- Lọc giữ tổ tiên của nút khớp sâu (E6).
- Giá trị lọc lạ trên đường dẫn: đọc như «Tất cả» (E7).
- Lọc không khớp gì: màn rỗng có câu (E7).

---

### Task 1: API — `canh` trong `okr.cayCanChinh`

`independent: true` · phục vụ E1, E2, E9

**Files:** Modify `apps/api/src/okr/okr-xem.contracts.ts` (`cayCanChinhOutput`), `apps/api/src/okr/okr-xem.service.ts` (`cayCanChinh`); Create `apps/api/test/okr-cay-ly-do.spec.ts`, `_acceptance/cay-can-chinh-co-ly-do/rang/ca-man.json`.

**Interfaces:** `canhCanChinh = z.object({ tu: z.string(), den: z.string(), lyDo: z.string().nullable(), canCu: z.string().nullable(), lyDoTuKara: z.boolean(), mucTin: z.enum(MUC_TIN_CAN_CHINH) })`; `cayCanChinhOutput` thêm `canh: z.array(canhCanChinh)`.

- [ ] Viết spec `l3-canh`, `l3-quyen`, `l3-man-doc-lai` theo `expected` của E1, E2, E9 (dùng `batDauMau`, `dungUngDung`, `phienMau`, `goi`/`ok` của `tro-ly-okr-san`); chạy → đỏ.
- [ ] Thêm schema và dựng `canh` trong service: `coMat` = id mục tiêu và KR của `mts`; mỗi `m` × `a` có `den = a.targetKeyResultId ?? a.targetObjectiveId` ∈ `coMat`.
- [ ] Chạy lại → xanh; chạy `okr-toan-canh.spec.ts -t cay-day-du`, `okr-can-chinh.spec.ts` → xanh.
- [ ] Commit.

### Task 2: Màn — nhãn, dòng lý do, bộ lọc

`independent: false` (cần kiểu `canh` của Task 1) · phục vụ E3–E8

**Files:** Modify `cay-can-chinh.tsx`, `theo-don-vi/theo-don-vi.tsx` (truyền `canh`), `okr-search-params.ts`, `apps/app/lib/search-param-keys.ts`, `apps/app/lib/messages/okr-toan-canh.ts`, `apps/app/test/okr-theo-don-vi.dom.tsx` (thêm `canh: []`); Create `apps/app/test/cay-can-chinh-ly-do.dom.tsx`.

- [ ] Viết bài DOM sáu nhóm `l3-nut`, `l3-ba-muc`, `l3-lap-lai`, `l3-loc`, `l3-dem`, `l3-chu` theo `expected` E3–E8; chạy → đỏ.
- [ ] Khoá `SEARCH_PARAM.okr.mucTinCay`, parser `parseAsStringLiteral(["tat-ca","chua-co-ly-do","dat-cuoc"]).withDefault("tat-ca")`.
- [ ] `CayCanChinh` nhận `canh`; `dung()` mang id cha, gắn `canh` của cặp (`nut.objectiveId`, cha) vào dữ liệu nút; `NhanNut` hiện `StatusIndicator data-muc-tin` cạnh tên đơn vị và `[data-ly-do-canh]` khi có `lyDo`; `ToggleGroup` có số đếm; cắt cây khi lọc; `Empty` `data-cay-loc-rong` khi rỗng.
- [ ] Chạy lại → xanh; `okr-theo-don-vi.dom.tsx`, `messages-guard.spec.ts` → xanh; phá thử từng thông điệp ghim; commit.

### Task 3: Bàn đo của hồ sơ

`independent: false` · phục vụ E10–E13

**Files:** Create `_acceptance/cay-can-chinh-co-ly-do/rang/{ranh-gioi,giu-ho-so,dot-bien,man}.mjs` theo khuôn của `duong-ly-do-muc-tieu/rang/`.

- [ ] Viết, chạy E11–E13 và lượt thử E10; commit; hợp đồng sang `implemented`.
