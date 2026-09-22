# Mọi phía đều thấy kế hoạch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa kế hoạch 30 ngày tới sheet Công ty, sheet Cá nhân, thẻ Tasks của tổng quan, bộ lọc và bảng cột của danh mục, và thêm thao tác chuyển việc 30 ngày ở Cài đặt › Thành viên.

**Architecture:** Không migration. API thêm các thủ tục đọc ở tệp mới `onboarding-noi.ts`, thao tác chuyển giao trong `OnboardingGhi`, và trường `mySteps` cho `dashboard.summary`. Vết `buoc.xong` thêm `giaoLucXong`. App thêm một tab, một mục, một loại dòng trong thẻ Tasks, một facet và một cách chia cột, một hộp thoại.

**Tech Stack:** bun, turbo, Prisma, NestJS + nestjs-trpc, Next.js App Router, TanStack Query, nuqs, zod 4, jsdom (`.dom.tsx`).

**Spec:** `docs/superpowers/specs/2026-09-22-moi-phia-deu-thay-ke-hoach-design.md` · hợp đồng `_acceptance/moi-phia-deu-thay-ke-hoach/contract.md` · phép đo `_acceptance/moi-phia-deu-thay-ke-hoach/evals.yaml`

## Global Constraints

- Không viết chú thích trong code, kể cả code sửa (`AGENTS.md`).
- `/packages/ui` là nguồn duy nhất của giao diện; component mới dựng bằng component có sẵn.
- Client component không import `@crm/db`, `@crm/auth`; schema dùng chung qua `@crm/validation/<module>`.
- Hằng số tinh chỉnh được nằm ở `ONBOARDING` trong `apps/api/src/onboarding/onboarding-config.ts`.
- Chữ trên màn đi qua kho chữ `apps/app/lib/messages/*.ts` hai tiếng; tên người và tên công ty mang `translate="no"`.
- `onboarding.service.ts` (810 dòng) không nhận thêm dòng nào; thủ tục đọc mới nằm ở `onboarding-noi.ts`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture và một đột biến chạy thật cho đỏ với thông điệp ghim (MEASURE-BIRTH-CLAUSE).
- Lệnh chứng minh: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

---

## Bản đồ tệp

| Tệp | Việc |
| --- | --- |
| `packages/validation/src/onboarding-activity.ts` (sửa) | `buoc.xong` thêm `giaoLucXong` |
| `apps/api/src/onboarding/onboarding-config.ts` (sửa) | `viecCuaToi`, thông điệp `chuyenChoChinhMinh` |
| `apps/api/src/onboarding/onboarding.contracts.ts` (sửa) | input/output mới; `nguoiGiao`; `nguoi-giao` |
| `apps/api/src/onboarding/onboarding-ghi.ts` (sửa) | `setStepDone` ghi `giaoLucXong`; `transferPreview`, `transferWork` |
| `apps/api/src/onboarding/onboarding-noi.ts` (mới) | `plansOfCompany`, `plansOfContact` |
| `apps/api/src/onboarding/onboarding-danh-muc.ts` (sửa) | `nguoiGiao` trong hàng, lọc, đếm, chia cột |
| `apps/api/src/onboarding/onboarding.service.ts` (sửa tối thiểu) | uỷ quyền; `taiTap` chọn thêm `assigneeId` |
| `apps/api/src/onboarding/onboarding.router.ts` (sửa) | bốn thủ tục mới |
| `apps/api/src/companies/companies.{service,contracts}.ts` (sửa) | `soKeHoach`, `xuongCoKhuon` |
| `apps/api/src/dashboard/dashboard.{service,contracts}.ts` (sửa) | `mySteps` |
| `apps/api/test/support/ke-hoach-gieo.ts` (mới) | bộ gieo dùng chung của lượt này |
| `apps/api/test/moi-phia-ke-hoach.spec.ts` (mới) | E1 E2 E4 E5 E7 E8 E9 E11 E13 E15 |
| `apps/api/test/fixtures/moi-phia-payload.json` (mới) | payload chung màn ↔ máy chủ |
| `apps/app/components/crm/record-sheet/company-plans.tsx` (mới) | tab «30 ngày đầu» |
| `apps/app/components/crm/record-sheet/contact-plans.tsx` (mới) | mục «30 ngày đầu» |
| `apps/app/components/crm/record-sheet/company-sheet.tsx` (sửa) | thêm tab; Giá trị đang mở rỗng |
| `apps/app/components/crm/record-sheet/contact-sheet.tsx` (sửa) | thêm mục |
| `apps/app/app/(app)/[slug]/onboarding/tao-ke-hoach.tsx` (sửa) | `congTyCoDinh` |
| `apps/app/app/(app)/[slug]/dashboard-summary.tsx` (sửa) | dòng bước |
| `apps/app/app/(app)/[slug]/onboarding/*` (sửa) | facet `nguoiGiao`, chia `nguoi-giao` |
| `apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx` (mới) + `members-table.tsx` (sửa) | chuyển giao |
| `apps/app/components/crm/inline-field.tsx`, `components/crm/fields/record-fields.tsx` (sửa) | `emptyValue`, bỏ «None» |
| `apps/app/lib/messages/*.ts` (sửa) | chữ mới |
| `apps/app/test/moi-phia-ke-hoach.dom.tsx` (mới) | E3 E6 E10 E12 E14 E16 |
| `CONTEXT.md` (sửa) | mục «Chuyển việc 30 ngày», «Người được giao» |

---

### Task 1: Vết xong ghi người được giao lúc bấm, và câu truy vấn đường đo

**Files:**
- Modify: `packages/validation/src/onboarding-activity.ts`
- Modify: `apps/api/src/onboarding/onboarding-ghi.ts` (`setStepDone`)
- Create: `apps/api/test/support/ke-hoach-gieo.ts`
- Create: `apps/api/test/moi-phia-ke-hoach.spec.ts` (describe `vet-giao-luc-xong`)
- Verify: `bun run test -- "cd apps/api && bun test test/moi-phia-ke-hoach.spec.ts -t vet-giao-luc-xong"`
- Phục vụ: E8 · independent: false (các task API sau dùng bộ gieo)

**Interfaces:**
- Produces: schema `buoc.xong` = `{ kind, stepId, nhan, giaoLucXong?: string | null }`; `vet.buocXong({ stepId, nhan, giaoLucXong })` với `giaoLucXong: string | null` bắt buộc ở kiểu tham số.
- Produces (bộ gieo): `dichVu(): OnboardingService`, `gieoThanhVien(ten?, vaiTro?: "member" | "admin")`, `gieoCongTy(ten?)`, `gieoKeHoach({ congTy, camTrich, buoc: {nhan, hanNgay, giao?, xong?}[], dong?, batDau? })`, `gieoGhiDanh`, `donDep()` — tiền tố tên `mpkh`.

- [ ] **Step 1: Test đỏ.** Trong `moi-phia-ke-hoach.spec.ts`, `describe("vet-giao-luc-xong")`: gieo S1 giao A và S2 chưa giao; B gọi `dichVu().setStepDone({ stepId, done: true }, B)` hai lần; đọc hai vết `buoc.xong` theo `planId` và parse qua `parseOnboardingActivityMeta`; `expect(meta1.giaoLucXong, "giaoLucXong mong A").toBe(A)`, `expect(meta2.giaoLucXong).toBeNull()`, `createdById` bằng B.
- [ ] **Step 2: Phần đường đo.** Đọc `_acceptance/moi-phia-deu-thay-ke-hoach/rang/ty-le-tu-danh-dau.sql` bằng `readFileSync(join(import.meta.dir, "../../../_acceptance/moi-phia-deu-thay-ke-hoach/rang/ty-le-tu-danh-dau.sql"))`, chạy `db.$queryRawUnsafe(sql, tu, den)` với cửa sổ chỉ bao lượt test. Trên hai vết phần 1: `{tu_danh_dau: 0, mau: 1, khong_giao: 1}`. Gieo thêm bằng `setStepDone` thật: A hai bước giao A, C một bước giao C, B một bước giao A; và một vết cũ viết tay = meta của một vết `buoc.xong` đọc lại rồi `delete meta.giaoLucXong`, `db.activity.create` với cùng `planId`. Khẳng định `{3, 5, 1}` với thông điệp «mau mong 5». Cặp: thêm một vết đánh dấu hộ bằng `setStepDone` → `{3, 6, 1}`.
- [ ] **Step 3: Chạy — đỏ** vì `giaoLucXong` chưa có.
- [ ] **Step 4: Cài đặt.** Schema: `z.object({ kind: z.literal("buoc.xong"), ...buoc, giaoLucXong: ma.nullable().optional() })`. Builder `buocXong: (v: Omit<Cua<"buoc.xong">, "giaoLucXong"> & { giaoLucXong: string | null }) => ...`. `setStepDone`: `input.done ? vet.buocXong({ ...chung, giaoLucXong: buoc.assigneeId }) : vet.buocBoXong(chung)`.
- [ ] **Step 5: Xanh; ba đột biến** (bỏ `giaoLucXong`; bỏ điều kiện loại vết chưa giao trong câu truy vấn trên bản sao; đổi tên khoá `kind` trong builder) mỗi cái đỏ với thông điệp ghim, rồi hoàn nguyên.
- [ ] **Step 6: Commit** `feat(onboarding): vet xong ghi nguoi duoc giao luc bam`.

### Task 2: Chuyển việc 30 ngày — API

**Files:**
- Modify: `onboarding-config.ts` (`thongDiep.chuyenChoChinhMinh`), `onboarding.contracts.ts`, `onboarding-ghi.ts`, `onboarding.service.ts` (uỷ quyền hai dòng), `onboarding.router.ts`
- Create: `apps/api/test/fixtures/moi-phia-payload.json` (mục `xemTruoc`, `chuyenGiao`)
- Test: `moi-phia-ke-hoach.spec.ts` describe `chuyen-giao-dung-viec`, `chuyen-giao-chan`, `chuyen-giao-payload`
- Verify: `bun run test -- "cd apps/api && bun test test/moi-phia-ke-hoach.spec.ts -t chuyen-giao"`; `cd apps/api && bun run trpc:generate`
- Phục vụ: E1 E2 E4 · independent: false

**Interfaces:**
- Produces: `transferPreviewInput = z.object({ fromUserId: ma })`, `transferWorkInput = z.object({ fromUserId: ma, toUserId: ma })`, `transferOutput = z.object({ keHoach: z.number().int(), buoc: z.number().int() })`.
- Produces: `OnboardingGhi.transferPreview(input, actingUserId)` và `transferWork(input, actingUserId)`; router `onboarding.transferPreview` (query), `onboarding.transferWork` (mutation), cả hai gọi `yeuCauQuanTri` trước.
- Produces: `function dieuKienChuyen(from: string)` trả `{ keHoach: Prisma.OnboardingPlanWhereInput, buoc: Prisma.OnboardingStepWhereInput }` = `{ ownerId: from, closedAt: null }` và `{ assigneeId: from, completedAt: null, plan: { closedAt: null } }` — preview và work dùng chung.

- [ ] **Step 1: Test đỏ E1** — fixture đúng mô tả của E1, ma trận sáu dòng, preview trước {2,3} và sau {0,0}.
- [ ] **Step 2: Test đỏ E2** — bốn ca bị chặn, chụp trạng thái trước mỗi ca, so sau; ca năm đối chứng dương.
- [ ] **Step 3: Test đỏ E4** — đọc `payload.xemTruoc`, `payload.chuyenGiao` (mã giả `NGUOI_DI`, `NGUOI_NHAN`), thay id thật, parse bằng `transferPreviewInput`/`transferWorkInput`, gọi thật.
- [ ] **Step 4: Cài đặt.** `transferWork` trong `$transaction`: kiểm `from !== to` (400), `thanhVien(tx, to)`, `findMany` hai tập theo `dieuKienChuyen`, `update` từng kế hoạch + `ghiVet(keHoachDoiCamTrich)`, `update` từng bước + `ghiVet(buocGiao)`, trả số. Quyền kiểm ở router bằng `yeuCauQuanTri` trước khi gọi, và kiểm lại trong service để E2 đo trên service.
- [ ] **Step 5: Xanh; đột biến** của E1 (bỏ `closedAt: null`; bỏ `completedAt: null`), E2 (bỏ kiểm quyền), E4 (đổi khoá schema) đỏ rồi hoàn nguyên.
- [ ] **Step 6: Commit** `feat(onboarding): chuyen viec 30 ngay giua hai thanh vien`.

### Task 3: Việc của tôi trên tổng quan — API

**Files:**
- Modify: `onboarding-config.ts` (`viecCuaToi: { cuaSoNgay: 3, tran: 10 }`), `apps/api/src/dashboard/dashboard.{contracts,service}.ts`
- Modify fixture: mục `tichXong` `{ stepId: "BUOC_S2", done: true }`
- Test: describe `viec-cua-toi`, `the-tasks-payload`
- Verify: `bun run test -- "cd apps/api && bun test test/moi-phia-ke-hoach.spec.ts -t viec-cua-toi"` và `-t the-tasks-payload`
- Phục vụ: E5 E7 · independent: false

**Interfaces:**
- Produces: `mySteps: z.array(z.object({ stepId, nhan, dueAt: ngay, planId, company: linkedRecordOutput }))` trong `dashboardSummaryOutput`.
- Service: `onboardingStep.findMany({ where: { assigneeId: actingUserId, completedAt: null, plan: { closedAt: null }, dueAt: { lt: dauNgay(hom nay + cuaSoNgay + 1) } }, orderBy: [{ dueAt: "asc" }, { id: "asc" }], take: tran })`; `dueAt` trả `toISOString().slice(0, 10)`.

- [ ] Test đỏ E5 (ma trận {D-1, D, D+3} ở hai scope) và E7 (fixture `tichXong` qua `stepDoneInput`, đọc vết có `giaoLucXong`) → cài đặt → xanh → đột biến bỏ `closedAt: null` → commit `feat(dashboard): buoc giao cho toi trong tong quan`.

### Task 4: Đọc cho sheet Công ty và sheet Cá nhân — API

**Files:**
- Create: `apps/api/src/onboarding/onboarding-noi.ts`
- Modify: `onboarding.contracts.ts`, `onboarding.router.ts`, `onboarding.service.ts` (uỷ quyền), `companies.{service,contracts}.ts`, `onboarding-danh-muc.ts` (`HangDanhMuc` thêm `ownerName`)
- Modify fixture: mục `keHoachCongTy` `{ companyId: "CONG_TY_K" }`, `keHoachCaNhan` `{ contactId: "CA_NHAN_C" }`
- Test: describe `ke-hoach-cong-ty`, `ke-hoach-ca-nhan`
- Phục vụ: E9 E11 · independent: false

**Interfaces:**
- Produces: `plansOfCompanyInput = z.object({ companyId: ma })` → `z.array(planRow.extend({ ownerName: z.string() }))`; `plansOfContactInput = z.object({ contactId: ma })` → `z.array(z.object({ planId, companyName, bac: z.enum(BAC_PHEU) }))`.
- `OnboardingNoi.plansOfCompany`: `onboardingPlan.findMany({ where: { companyId }, include như taiTap + owner.name })` → `dungHang` → sắp `(closedAt === null ? 0 : 1)` rồi `startedAt` giảm dần.
- `companies.byId` thêm `soKeHoach: _count.onboardingPlans` và `xuongCoKhuon: (await onboardingTemplate.count({ where: { archivedAt: null } })) > 0`.

- [ ] Test đỏ E9 (thứ tự [P1, P0, P2], so từng trường với `manDanhMuc`) và E11 → cài đặt → xanh → hai đột biến E9 và một E11 → commit `feat(onboarding): doc ke hoach cho sheet cong ty va ca nhan`.

### Task 5: Lọc và chia cột theo người được giao — API

**Files:**
- Modify: `onboarding-danh-muc.ts` (`BuocTho.assigneeId`, `HangDanhMuc.nguoiGiao: string[]`, `khopNguoiGiao`, `demBoLoc.nguoiGiao`, `chiaCot` nhánh `nguoi-giao`), `onboarding.contracts.ts` (`nguoiGiao: danhSachMa.default([])`, `bangCotCachChia` thêm `"nguoi-giao"`, `demBoLoc` output), `onboarding.service.ts` (`taiTap` chọn `assigneeId`, `assignee.name`)
- Test: describe `loc-nguoi-giao-db`, `cot-nguoi-giao`
- Phục vụ: E13 E15 · independent: false

**Interfaces:**
- `nguoiGiao` = tập `assigneeId` khác null của bước `completedAt === null`, không trùng, giữ thứ tự xuất hiện.
- Chia cột `nguoi-giao`: một thẻ cho mỗi người trong `nguoiGiao`; `nguoiGiao` rỗng mà còn bước chưa xong → cột `CHUA_GIAO`; hết bước chưa xong → `COT_XONG`. Cột người sắp theo tên (`soChu`).

- [ ] Test đỏ E13 (bốn dòng ma trận + đối chứng P3) và E15 (bốn cột theo tập id + tổng thẻ 5) → cài đặt → xanh → đột biến (tính từ mọi bước; mỗi kế hoạch một cột) → commit `feat(onboarding): loc va chia cot theo nguoi duoc giao`.

### Task 6: Tab «30 ngày đầu» ở sheet Công ty

**Files:**
- Create: `apps/app/components/crm/record-sheet/company-plans.tsx`
- Modify: `company-sheet.tsx`, `tao-ke-hoach.tsx` (`congTyCoDinh?: { id: string; name: string }`), `lib/trpc/cache.ts` nếu cần khoá mới, `lib/messages/onboarding.ts` (nhóm `congTy`)
- Test: `apps/app/test/moi-phia-ke-hoach.dom.tsx` describe `tab-cong-ty-man`
- Verify: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/moi-phia-ke-hoach.dom.tsx -t tab-cong-ty-man`
- Phục vụ: E10 · independent: false (dùng API Task 4)

- [ ] Test đỏ E10 (ba ca trên cùng lần dựng, assert input `plansOfCompany` khớp fixture) → `CompanyPlans({ companyId, companyName })` dùng `useQuery(trpc.onboarding.plansOfCompany.queryOptions({ companyId }))`, `SimpleTable` năm cột (ba cột phụ `max-sm:hidden`), `AddRow` → `TaoKeHoach congTyCoDinh`; tab có mặt khi `soKeHoach > 0 || xuongCoKhuon` → xanh → đột biến → commit.

### Task 7: Mục «30 ngày đầu» ở sheet Cá nhân

**Files:** Create `contact-plans.tsx`; modify `contact-sheet.tsx` (`ContactOverview`), messages · Test describe `muc-ca-nhan-man` · Phục vụ E12 · independent: false

- [ ] Test đỏ E12 → `ContactPlans({ contactId })` trả `null` khi rỗng, mỗi dòng là nút mở `openRecord("plan", planId)`, nhãn bậc lấy từ `onboardingMessages(locale).bac` → xanh → đột biến → commit.

### Task 8: Dòng bước trong thẻ Tasks

**Files:** Modify `dashboard-summary.tsx`, `lib/messages/tong-quan.ts` · Test describe `the-tasks-man` · Phục vụ E6 · independent: false

- [ ] Test đỏ E6 → gộp `overdueTasks` và `mySteps` thành một danh sách `{ loai: "viec" | "buoc", ... }` sắp theo hạn; dòng bước gọi `onboarding.setStepDone`, `onSuccess` làm mới `dashboard.summary` và `cache.plan(planId)`; tone bằng `quaHan(dueAt, null, now)` của `lib/qua-han.ts`; mô tả thẻ theo ba nhánh của design §5 → xanh → hai đột biến → commit.

### Task 9: Ô lọc và cách chia «Người được giao» ở danh mục

**Files:** Modify `onboarding-search-params.ts` (`DANH_MUC_BO_LOC` thêm `nguoiGiao`, `DANH_MUC_CACH_CHIA` thêm `nguoi-giao`, `DanhMucInput.nguoiGiao`), `danh-muc-cong-cu.tsx`, `danh-muc-bang-cot.tsx`, messages · Test describe `loc-nguoi-giao-man` · Phục vụ E14 · independent: false

- [ ] Test đỏ E14 → thêm facet cạnh `nguoiCam`, nhãn «Người được giao», nguồn tên từ `users.list` → xanh → đột biến nối nhầm khoá → commit.

### Task 10: Hộp thoại «Chuyển việc 30 ngày»

**Files:** Create `settings/members/chuyen-viec-dialog.tsx`; modify `members-table.tsx` (mục menu khi `onboarding.access.canManage`), `lib/messages/thanh-vien.ts` · Test describe `chuyen-giao-man` · Phục vụ E3 · independent: false

- [ ] Test đỏ E3 (sáu khẳng định + đối chứng không quyền) → hộp thoại `Dialog` + `Select`, `transferPreview` khi mở với `fromUserId: row.userId`, nút khoá khi `{0,0}` hoặc chưa chọn, `transferWork` rồi toast và làm mới → xanh → đột biến `row.id` → commit.

### Task 11: Ba lệch nhỏ của sheet Công ty

**Files:** Modify `components/crm/inline-field.tsx` (`emptyValue?: string` → ô thu gọn hiện `EmptyCellValue`), `components/crm/fields/record-fields.tsx` (nhãn «None» → `crmMessages(locale)` khoá «Không chọn / None»; truyền `emptyValue`), `company-sheet.tsx` (chủ sở hữu `emptyValue={UNASSIGNED}`; Giá trị đang mở rỗng khi không thoả thuận đang mở nào có `amountCents`) · Test describe `ba-lech` · Phục vụ E16 · independent: false

- [ ] Test đỏ E16 (ba cặp hai chiều) → cài đặt → xanh → đột biến khôi phục «None» → commit.

### Task 12: Từ điển, sàn thiết kế, năm lệnh chứng minh, khép S3

**Files:** `CONTEXT.md`, `docs/plan/lo-trinh-dieu-phoi-30-ngay.md` (mục 9), `_acceptance/moi-phia-deu-thay-ke-hoach/contract.md` (`status: implemented`)
**Phục vụ:** E18 và mọi phép đo · independent: false

- [ ] Thêm mục «Người được giao», «Chuyển việc 30 ngày», «Việc của tôi» vào `CONTEXT.md`.
- [ ] Chạy skill rà `web-design-guidelines` (`.agents/skills/web-design-guidelines`) trên ba tệp giao diện mới; sửa phát hiện trong phạm vi.
- [ ] Chạy khoá `kh2_san_thiet_ke` (E18) → mã 0; đột biến gray-on-color trên bản sao → khác 0.
- [ ] Chạy đủ 18 khoá `kh2_*` máy (trừ E17) → mã 0, mỗi khoá chạy ≥1 bài.
- [ ] `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` xanh.
- [ ] Set `status: implemented`, commit, vào S4.

## Tự rà

- Phủ design: §2 → Task 1 · §3 bảng → Task 2, 3, 4, 5 · §5 từng bề mặt → Task 6–11 · Đặc tả UX trạng thái → Task 6 (ST-congty-*), 7 (ST-canhan-*), 8 (ST-tongquan-*), 9 (ST-danhmuc-*), 10 (ST-chuyen-*), 11 (ST-congty-lechsua).
- Phủ phép đo: E1 E2 E4 → T2 · E3 → T10 · E5 E7 → T3 · E6 → T8 · E8 → T1 · E9 E11 → T4 · E10 → T6 · E12 → T7 · E13 E15 → T5 · E14 → T9 · E16 → T11 · E17 E18 → T12 (E17 do S4 chạy).
- Tên dùng chung: `giaoLucXong`, `nguoiGiao`, `nguoi-giao`, `transferPreview`, `transferWork`, `plansOfCompany`, `plansOfContact`, `mySteps`, `soKeHoach`, `xuongCoKhuon`, `congTyCoDinh`, `emptyValue` — cùng chính tả ở mọi task.
