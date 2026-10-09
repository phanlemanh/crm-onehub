# K6b kara-trang-thai-toan-crm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vùng con của ngăn bản ghi và tóm tắt tuần không còn nuốt lỗi thành rỗng; lưu trữ ba loại bản ghi có Hoàn tác trên toast; bước Kara chưa lưu hiện khác bước đã lưu; ba việc chữ.

**Architecture:** Hai mảnh mới trong `packages/ui` (`VungTaiLoi`, `baoDaLuuTru`) và một trạng thái mới của `KaraSteps`; các màn trong `apps/app` chỉ đổi nhánh tải/lỗi và gọi mảnh. Không đổi API — Hoàn tác gọi `<loại>.restore` có sẵn.

**Tech Stack:** Next.js (apps/app), React 19, TanStack Query + tRPC, sonner, bun test + jsdom (`packages/ui/test/setup-dom.ts`), puppeteer qua `scripts/lan-do/tien-de.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-08-kara-trang-thai-toan-crm-design.md` · hợp đồng `_acceptance/kara-trang-thai-toan-crm/contract.md` · evals `_acceptance/kara-trang-thai-toan-crm/evals.yaml`

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Mọi chữ qua `lib/messages` (apps/app) hoặc `packages/ui/src/lib/messages.ts`; cặp en/vi; khoá mới là hàm thì thêm GHIM ở `apps/app/test/messages-guard.spec.ts`.
- Tệp chữ dùng chung chỉ thêm dòng (luật 7), trừ đúng một giá trị «Sửa Mục tiêu» → «Sửa mục tiêu» ở `okr-gop-y.ts` (P2-15).
- «Thử lại» là `KaraRetry` (ai-ux §10); không in thông điệp lỗi thô; không `Spinner`/`Shimmer` trần cho việc của Kara.
- Hằng tinh chỉnh được đặt trong một đối tượng `as const` của tệp mảnh (AGENTS.md «Constants belong in one file per area»).
- Không chạm `detail-sheet.tsx`, `record-parts.tsx`, `bulk-actions.tsx`, `archived-list.tsx`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture với thông điệp ghim (MEASURE-BIRTH).

## Review Focus

1. Bấm «Thử lại» khi truy vấn đang tải lại — không gọi chồng (nút khoá khi `isFetching`). Ghim ở Task 2.
2. Hoàn tác bấm hai lần nhanh — `restore` chỉ chạy một lần. Ghim ở Task 4.
3. Lưu trữ xong rồi đóng ngăn trước khi bấm Hoàn tác — toast vẫn khôi phục được (hàm Hoàn tác không phụ thuộc ngăn còn mở). Ghim ở Task 4.
4. Bước Kara vừa `output-error` vừa có `stored:false` — vẫn là lỗi, không phải chưa lưu. Ghim ở Task 3.
5. Hoạt động web đổi từ lỗi sang có dữ liệu sau «Thử lại» — khung lỗi biến mất, dữ liệu hiện. Ghim ở Task 2.

---

### Task 1: Mảnh trong `packages/ui`

**Files:**
- Create: `packages/ui/src/components/vung-tai-loi.tsx`
- Create: `packages/ui/src/lib/bao-luu-tru.ts`
- Modify: `packages/ui/src/components/kara/steps.tsx` (chỉ thêm)
- Modify: `packages/ui/src/lib/messages.ts` (chỉ thêm khoá `karaKhung.buocChuaLuu`, `karaKhung.buocChuaLuuTieuDe`, nhóm `luuTru` với `hoanTac`)
- Test: `packages/ui/test/kara-trang-thai-ui.dom.tsx`

**Interfaces:**
- Produces: `VungTaiLoi({ tieuDe, moTa, onThuLai, dangTai }: { tieuDe: string; moTa: string; onThuLai: () => void; dangTai?: boolean })` — `Empty border="solid" size="compact"` có `data-vung-tai-loi=""`, `KaraRetry` (khoá khi `dangTai`).
- Produces: `baoDaLuuTru({ thongDiep, nhanHoanTac, onHoanTac }: { thongDiep: string; nhanHoanTac: string; onHoanTac: () => void }): void` và `LUU_TRU = { hoanTacMs: 10 * GIAY_MS } as const`. Hoàn tác chỉ gọi `onHoanTac` lần đầu.
- Produces: `KaraStep.state` thêm `"unsaved"`; `DAU.unsaved = "chua-luu"`, `TONE.unsaved = "warning"`; tiêu đề khi có bước `unsaved` và không bước chạy/lỗi = `msg.karaKhung.buocChuaLuuTieuDe(label)`.

- [ ] Step 1: Viết bài `kara-trang-thai-ui.dom.tsx` ba ca: `vung-tai-loi` (chữ, nút «Thử lại», bấm gọi một lần, `dangTai` khoá nút), `bao-luu-tru` (Toaster thật; toast có nút «Hoàn tác»; bấm hai lần → `onHoanTac` một lần), `buoc-chua-luu` (KaraSteps với ba bước done/unsaved/unsaved → `data-trang-thai` xong/chua-luu, `data-tone` warning ở chấm, tiêu đề «Kara chưa lưu được: <nhãn>»).
- [ ] Step 2: Chạy `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/kara-trang-thai-ui.dom.tsx` — đỏ (thiếu module).
- [ ] Step 3: Viết hai tệp mới và phần thêm của `steps.tsx`, `messages.ts`.
- [ ] Step 4: Chạy lại — xanh. Phá thử: bỏ khoá `unsaved` khỏi `TONE` → đỏ «buoc-chua-luu: cham khong canh bao»; bỏ chặn lần hai trong `baoDaLuuTru` → đỏ «bao-luu-tru: hoan tac goi hai lan».
- [ ] Step 5: Commit `feat(ui): kara-trang-thai-toan-crm — VungTaiLoi, baoDaLuuTru, bước Kara chưa lưu`.

### Task 2: Vùng con của ngăn bản ghi (AC-1, AC-2, AC-3)

**Files:**
- Modify: `apps/app/components/crm/timeline/timeline.tsx` — nhánh `history.isError` → `VungTaiLoi` trước nhánh rỗng.
- Modify: `apps/app/components/crm/website-activity.tsx` — chọn truy vấn đang dùng; `isPending` (đã bật) → section + `Skeleton` ×2 + `sr-only` «Đang tải»; `isError` → section + `VungTaiLoi`; giữ hai `return null` của «chưa nhận diện» và «rỗng».
- Modify: `apps/app/components/crm/record-sheet/contact-plans.tsx` — `isPending` → section + Skeleton; `isError` → section + `VungTaiLoi` (chữ `keHoachNoiMessages(locale).congTy.loi`); giữ `return null` khi rỗng.
- Modify: `apps/app/lib/messages/crm.ts` (chỉ thêm `timeline.loiTieuDe`, `timeline.loiMoTa`, `web.loiTieuDe`, `web.dangTai`, cặp en/vi).
- Test: `apps/app/test/kara-trang-thai-vung.dom.tsx` (`dong-thoi-gian`, `web`, `ke-hoach`).

**Interfaces:** Consumes `VungTaiLoi` (Task 1).

- [ ] Step 1: Viết ba describe theo ma trận E1 (3 ô), E2 (10 ô), E3 (4 ô) của `evals.yaml`, dùng `khung-gop-y.tsx` (`dat`, `mo`, `cho`, `goiCua`); thêm ô Review Focus 1 (bấm «Thử lại» lúc đang tải không gọi chồng) và 5 (lỗi → Thử lại → có dữ liệu).
- [ ] Step 2: Chạy `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/kara-trang-thai-vung.dom.tsx -t "dong-thoi-gian|web|ke-hoach"` — đỏ.
- [ ] Step 3: Sửa ba tệp + khoá chữ.
- [ ] Step 4: Xanh. Phá thử: trả `return null` khi lỗi ở website-activity → đỏ «web: loi lam mat muc»; bỏ nhánh `isError` timeline → đỏ «dong-thoi-gian: loi hien nhu rong»; trả `return null` khi tải ở contact-plans → đỏ «ke-hoach: dang tai bien mat».
- [ ] Step 5: Commit `fix(app): kara-trang-thai-toan-crm — dòng thời gian, hoạt động web, 30 ngày đầu không nuốt lỗi`.

### Task 3: Bước Kara chưa lưu trong tab Kara (AC-7)

**Files:**
- Modify: `apps/app/components/crm/agent-panel.tsx` — `state: item.pending ? "running" : item.failed ? "error" : item.tone === "warning" ? "unsaved" : "done"`.
- Test: `apps/app/test/kara-trang-thai-vung.dom.tsx` (`buoc-chua-luu`, ma trận 7 ô E8, gồm ô Review Focus 4: `output-error` + `stored:false` vẫn là lỗi; mock `eve/react` như `kara-ban-ghi.dom.tsx`).

**Interfaces:** Consumes `KaraStep.state = "unsaved"` (Task 1).

- [ ] Step 1: Viết bài; Step 2: đỏ; Step 3: sửa một dòng; Step 4: xanh, phá thử bỏ nhánh tone → đỏ «buoc-chua-luu: buoc khong luu hien xong»; Step 5: commit `fix(app): kara-trang-thai-toan-crm — bước Kara chưa lưu`.

### Task 4: Lưu trữ có Hoàn tác (AC-5, AC-6)

**Files:**
- Modify: `apps/app/components/crm/record-sheet/record-actions.tsx` — `useArchiveRecord.onSuccess` gọi `baoDaLuuTru({ thongDiep: m.sheet.archived(ten), nhanHoanTac: m.sheet.hoanTac, onHoanTac: () => restore.mutate({ id }, { onError: () => toast.error(m.sheet.hoanTacLoi) }) })`; `useRestoreRecord` nhận tuỳ chọn để nhánh Hoàn tác không in `error.message`.
- Modify: `apps/app/lib/messages/crm.ts` (thêm `sheet.hoanTac` «Hoàn tác»/«Undo», `sheet.hoanTacLoi` «Chưa hoàn tác được. Bản ghi vẫn ở mục Đã lưu trữ.»/«Couldn't undo. The record is still under Archived.»).
- Test: `apps/app/test/kara-trang-thai-luu-tru.dom.tsx` (`luu-tru-hoan-tac` 4 ô E5 + Review Focus 2, 3; `hoan-tac-hong` E7).

**Interfaces:** Consumes `baoDaLuuTru` (Task 1).

- [ ] Step 1–5 như trên; phá thử: toast cũ không action → đỏ «luu-tru: toast khong co Hoan tac»; in `error.message` → đỏ «hoan-tac-loi: lo chu loi tho». Commit `feat(app): kara-trang-thai-toan-crm — lưu trữ có Hoàn tác`.

### Task 5: Tóm tắt tuần (AC-4, AC-10)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx` — nhánh `isError` → `section` `data-trang-thai="ST-tomtat-loi"` chứa `KaraState kind="error" what={m.loiKara} description={m.loiMoTa} onRetry={() => void tt.refetch()}`; nhánh `dangSoan` → `KaraState kind="working" label={m.dangSoan}` thay `Shimmer`, giữ mô tả + «Tải lại».
- Modify: `apps/app/lib/messages/okr-toan-canh.ts` — `dangSoan` «Kara đang tóm tắt tuần này…» (en «Kara is summarising this week…»), thêm `loiKara` «Kara chưa tải được tóm tắt tuần» (en «Kara couldn't load this week's summary»), `daGhi` «Đã ghi — quản trị viên thấy số phản hồi này ở Toàn cảnh › Sức khoẻ chương trình.» (en «Noted — admins see these counts under Overview › Programme health.»).
- Modify: `apps/app/test/tro-ly-okr-tom-tat.dom.tsx` — ca `ST-tomtat-loi` đổi chữ kỳ vọng sang `m.loiKara`; thêm `describe("kts-tom-tat")` và `test("kts-da-ghi")` theo E4, E11.

- [ ] Step 1–5; phá thử: giữ `Alert` → đỏ «tom-tat: loi con Alert»; giữ chữ cảm ơn cũ → đỏ «da-ghi: loi cam on khong noi gi xay ra». Commit `fix(app): kara-trang-thai-toan-crm — tóm tắt tuần theo bộ trạng thái Kara`.

### Task 6: Chữ (AC-8, AC-9) và răng `chu.mjs`

**Files:**
- Modify: ba `create-*-sheet.tsx` — `toast.success(m.created(ten))`.
- Modify: `apps/app/lib/messages/contacts.ts`, `companies.ts` — thêm `created: (name: string) => …` cùng hình với `deals.ts`.
- Modify: `apps/app/lib/messages/okr-gop-y.ts` — «Sửa Mục tiêu» → «Sửa mục tiêu».
- Modify: `apps/app/test/messages-guard.spec.ts` — GHIM cho hai hàm `created` mới.
- Create: `_acceptance/kara-trang-thai-toan-crm/rang/chu.mjs` (E9, E10, E12).

- [ ] Step 1: viết `chu.mjs` (TypeScript compiler API, `git ls-files`, ma trận khai trước; in «KET LUAN: n cho sai — ma thoat x»); Step 2: chạy — đỏ (còn «added.», «Sửa Mục tiêu»); Step 3: sửa; Step 4: xanh; phá thử ba chiều đỏ của E9, E10, E12; Step 5: commit.

### Task 7: Đo màn (AC-5 backend, AC-11)

**Files:**
- Create: `_acceptance/kara-trang-thai-toan-crm/rang/man.mjs` — theo mẫu `_acceptance/khung-ban-ghi-kara/rang/man.mjs` (`moDo`, `nganDungYen`, `chupNgan`); chặn `tracking.contactActivity` bằng `page.setRequestInterception`; bước lưu trữ ba loại đọc `archivedAt` qua `d.hoi`; `--chieu-do` bỏ bấm Hoàn tác.

- [ ] Step 1: viết; Step 2: chạy qua `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/kara-trang-thai-toan-crm/rang/man.mjs"`; Step 3: chiều đỏ `--chieu-do` → «luu-tru: sau hoan tac van con ngay luu tru»; Step 4: commit.

### Task 8: Năm cổng và trạng thái hợp đồng

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run test`, `bun run build` từ gốc kho.
- [ ] Contract `status: implemented`; commit; vào S4.
