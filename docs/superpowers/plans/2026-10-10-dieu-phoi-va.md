# Điều phối vá (E6) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mã đối tác lệch thành việc của người cầm trịch qua làn trực tiếp tác nhân; kế hoạch rỗng và bộ phận chưa có bước thêm được bước; thẻ «Việc quá hạn» đếm số thật kèm «và N việc quá hạn nữa».

**Architecture:** API giữ ghi `AgentTask` `onboarding-identify` (luật `docs/api.md`); payload có schema dùng chung ở `@crm/validation/onboarding-identify`; tác nhân xử lý loại này ở làn trực tiếp bằng mã tất định (`lib/ma-lech.ts`). Màn kế hoạch thêm `ThemBuoc` có ô chọn bộ phận. `DashboardService` trả thêm `quaHan { viec, buoc }` đếm không trần; thẻ dùng số đó.

**Tech Stack:** NestJS + tRPC (apps/api), eve agent (apps/agent, chỉ phần mã), Next.js + React Query (apps/app), Prisma 7, Zod, bun test.

**Spec:** `docs/superpowers/specs/2026-10-10-dieu-phoi-va-design.md` · hợp đồng `_acceptance/dieu-phoi-va/contract.md` · evals `_acceptance/dieu-phoi-va/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Trí khôn không ở API: API chỉ ghi `AgentTask`, không đối khớp danh tính (`docs/api.md`).
- Parse ở biên: payload `onboarding-identify` qua `onboardingIdentifyPayload` ở cả bên ghi và bên đọc.
- Giao diện chỉ dùng thành phần `@crm/ui`; không đổi màu/góc/khoảng cách bằng `className`.
- Chữ trên màn vào `apps/app/lib/messages/*` (chỉ thêm khoá), đủ `en` và `vi`.
- Tên người giữ kế hoạch: «người cầm trịch» (CONTEXT.md).
- Không đổi `schema.prisma`, không migration.
- Ranh giới E6 + P3-76: chỉ chạm tệp đã liệt.

## Review Focus

- Lô gửi lại cùng mã khi việc cũ còn mở → không việc thứ hai (Task 2, E2).
- Bộ phận bị lưu trữ giữa lúc mở form và lúc lưu → báo trong form, giữ chữ (Task 4/5, E6, E6b).
- Việc hạn hôm nay và việc đã xong không vào số quá hạn (Task 6, E7 dòng 6).
- Bước trong kế hoạch đã đóng không vào số bước quá hạn (Task 6, E7 dòng 6).
- Tác nhân tắt: hàng `onboarding-identify` nằm chờ, không lỗi (thiết kế; không cần phép đo riêng — làn trực tiếp chỉ claim khi chạy).

---

### Task 1: Schema payload dùng chung + API ghi qua schema

**Files:**
- Create: `packages/validation/src/onboarding-identify.ts`
- Modify: `packages/validation/package.json` (thêm subpath `./onboarding-identify`)
- Modify: `apps/api/src/agent/agent-trigger.service.ts` (`onboardingMatchNeeded` dựng payload qua schema)
- Test: `apps/api/test/dieu-phoi-va.spec.ts` (describe `nhan-lo`) — phục vụ E1b

**Interfaces:**
- Produces: `MA_NEN_TANG_KEY`, `onboardingIdentifyPayload: z.ZodObject<{ planId: z.ZodString; platformBrokerId: z.ZodString }>`, `type OnboardingIdentifyPayload`, `parseOnboardingIdentifyPayload(value: unknown): OnboardingIdentifyPayload` (ném `Error` có thông điệp parse).

- [ ] Step 1: viết `nhan-lo` (lô ma khop + ma lech → một hàng, payload qua schema, kind ∈ `DIRECT_KINDS`; lô ba mã lệch → ba hàng). Chạy: `bun run test -- "cd apps/api && bun test test/dieu-phoi-va.spec.ts -t nhan-lo"` → đỏ (module chưa có, kind chưa trong `DIRECT_KINDS`).
- [ ] Step 2: tạo schema:

```ts
import { z } from "zod";

export const onboardingIdentifyPayload = z.object({
	planId: z.string().trim().min(1),
	platformBrokerId: z.string().trim().min(1).max(200),
});

export type OnboardingIdentifyPayload = z.infer<typeof onboardingIdentifyPayload>;

export function parseOnboardingIdentifyPayload(value: unknown): OnboardingIdentifyPayload {
	const ket = onboardingIdentifyPayload.safeParse(value);
	if (!ket.success) {
		throw new Error(`payload onboarding-identify hong: ${ket.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
	}
	return ket.data;
}
```

- [ ] Step 3: `onboardingMatchNeeded` dùng `payload: onboardingIdentifyPayload.parse({ planId, platformBrokerId })`.
- [ ] Step 4: chạy lại `nhan-lo` → xanh sau Task 2 (kind). Commit cùng Task 2.

**Verify:** `bun run test -- "cd apps/api && bun test test/dieu-phoi-va.spec.ts -t nhan-lo"` · independent: false

### Task 2: Làn trực tiếp xử lý `onboarding-identify`

**Files:**
- Modify: `packages/db/src/agent-tasks.ts` (thêm `"onboarding-identify"` vào `TASK_KINDS`, `DIRECT_KINDS`)
- Create: `apps/agent/agent/lib/ma-lech.ts`
- Modify: `apps/agent/agent/lib/dispatch.ts` (`handleDirect` gọi `xuLyMaLech`)
- Test: `apps/agent/test/dieu-phoi-va.spec.ts` (describe `ma-lech`, `khong-trung`, `dong-som`, `mach-lien-doc`) — phục vụ E1, E2, E3, E1c

**Interfaces:**
- Consumes: `parseOnboardingIdentifyPayload`, `MA_NEN_TANG_KEY` (Task 1, `@crm/validation/onboarding-identify`), `dauNgayVN` (`@crm/db/onboarding-nhac`). `MA_NEN_TANG_KEY = "ma_moi_gioi_nen_tang"` đặt cạnh schema; test `nhan-lo` ghim `MA_NEN_TANG.key === MA_NEN_TANG_KEY` để hai bản không lệch (onboarding-config.ts ngoài ranh giới).
- Produces: `export const LOAI_VIEC_MA_LECH = "onboarding-identify"`, `export async function xuLyMaLech(task: LeasedTask, now?: Date): Promise<KetQuaMaLech>` với `type KetQuaMaLech = "da-giao" | "ma-da-khop" | "ke-hoach-dong" | "da-co-viec-mo" | "payload-hong"`; `export const LY_DO_MA_LECH: Record<KetQuaMaLech, string>`.

- [ ] Step 1: viết test `ma-lech` (10 dòng ma trận E1 + đối chứng `identify`), `khong-trung`, `dong-som` (4 ca), `mach-lien-doc` (chỉ chạy khi `DPV_MACH_LIEN=1`). Chạy `bun run test -- "cd apps/agent && bun test test/dieu-phoi-va.spec.ts"` → đỏ.
- [ ] Step 2: thêm kind vào hai mảng.
- [ ] Step 3: `ma-lech.ts`: parse payload (lỗi → `completeTask(id, lý do kèm thông điệp)`), đọc kế hoạch (`closedAt` khác null hoặc không còn → đóng), đọc mã đã khớp qua `fieldValue` của trường mã nền tảng (khớp → đóng), tìm `activity` TASK mở cùng `planId` + `meta.platformBrokerId` (có → đóng), còn lại `activity.create` (`createdById: plan.ownerId`, `planId`, `companyId`, `dueAt: dauNgayVN(now)`, `subject: "Gắn mã nền tảng <mã> vào đúng cá nhân"`, `body`, `meta: { agent: "onboarding-identify", platformBrokerId }`) rồi đóng «đã giao việc cho người cầm trịch». Ghi + kiểm trùng trong một giao dịch có `lockIdempotencyKey`.
- [ ] Step 4: `handleDirect`: `if (task.kind === LOAI_VIEC_MA_LECH) { await xuLyMaLech(task); return; }`.
- [ ] Step 5: chạy lại → xanh; phá-thử hai chiều đỏ của E1 (bỏ khỏi `DIRECT_KINDS`) và E3 (bỏ nhánh mã đã khớp) trên bản sao, rồi trả lại. Commit.

**Verify:** `bun run test -- "cd apps/agent && bun test test/dieu-phoi-va.spec.ts"` · independent: false

### Task 3: Mạch liền API → tác nhân (E1c)

**Files:** Test: `apps/api/test/dieu-phoi-va.spec.ts` (describe `mach-lien-ghi`, chạy khi `DPV_MACH_LIEN=1`), `apps/agent/test/dieu-phoi-va.spec.ts` (`mach-lien-doc`); `_acceptance/config.yaml` khoá `dpv_mach_lien` thêm `DPV_MACH_LIEN=1` vào trong chuỗi lệnh.

- [ ] Step 1: `mach-lien-ghi` tạo kế hoạch id `dpv-mach-lien-<pid>` qua `db.onboardingPlan.create`, gọi controller với lô hai mã lệch, không dọn.
- [ ] Step 2: `mach-lien-doc` tìm hàng theo `payload.planId` bắt đầu bằng `dpv-mach-lien-`, `claimDue(…, { only: DIRECT_KINDS })`, `runDirect` từng hàng, khẳng định 2 hàng nhận, 2 việc mở mỗi việc một mã, 2 hàng đóng; dọn.
- [ ] Step 3: chạy `dpv_mach_lien` → xanh. Commit.

**Verify:** lệnh của khoá `dpv_mach_lien` · independent: false

### Task 4: `addStep` kiểm bộ phận (E6)

**Files:** Modify `apps/api/src/onboarding/onboarding-ghi.ts` (`addStep`); Test `apps/api/test/dieu-phoi-va.spec.ts` (`bo-phan-hong`).

- [ ] Step 1: test gọi `addStep` với id không có thật và bộ phận `archivedAt` khác null → `TRPCError` `BAD_REQUEST`, thông điệp chứa «bộ phận», số bước không đổi; đối chứng bộ phận sống → ghi. Đỏ (hôm nay 500/Prisma).
- [ ] Step 2: trong giao dịch `addStep`, `tx.department.findUnique({ where: { id }, select: { archivedAt: true } })`; không có → `BAD_REQUEST` «Không tìm thấy bộ phận này.»; `archivedAt` khác null → `BAD_REQUEST` «Bộ phận này đã lưu trữ — chọn bộ phận khác.»
- [ ] Step 3: xanh. Commit.

**Verify:** `dpv_bo_phan_hong` · independent: false (chung tệp test với Task 1, 3, 6)

### Task 5: Thêm bước khi kế hoạch rỗng / bộ phận khác (E4, E5, E6b)

**Files:** Modify `apps/app/components/crm/record-sheet/plan-steps.tsx`, `apps/app/lib/messages/onboarding.ts` (khoá `addStepOtherDepartment`, `pickDepartment`); Test `apps/app/test/dieu-phoi-va.dom.tsx` (`ke-hoach-rong`, `bo-phan-khac`, `loi-bo-phan`).

- [ ] Step 1: test DOM theo giàn của `ke-hoach-sheet.dom.tsx` (mock tRPC `listSteps`, `listDepartments`, `addStep`). Đỏ.
- [ ] Step 2: `ThemBuoc` nhận `departmentId?: string`, `boPhan?: { id: string; name: string }[]`, `nhan?: string`; thiếu `departmentId` thì hiện `Select` bộ phận (đứng trước ô tên, nhận focus), Lưu khoá khi tên trống hoặc chưa chọn; lỗi mutation → hiện `ghi.them.error.message` trong form (`FieldError`), giữ state, không đóng.
- [ ] Step 3: `PlanSteps` đọc `trpc.onboarding.listDepartments({ archived: false })`; kế hoạch mở rỗng → `ThemBuoc boPhan={tất cả}` dưới `DetailSheetEmpty`; có bước → sau các nhóm `ThemBuoc nhan={m.addStepOtherDepartment} boPhan={chưa có nhóm}` khi danh sách không rỗng; `khoa` → không nút.
- [ ] Step 4: xanh; phá-thử chiều đỏ E4 (chỉ vẽ trong nhóm), E6b (đóng form khi lỗi). Commit.

**Verify:** `dpv_them_buoc_dom` · independent: false

### Task 6: Thẻ quá hạn đếm thật (E7, E7b, E8)

**Files:** Modify `apps/api/src/dashboard/dashboard.contracts.ts` (`quaHan: z.object({ viec: z.number().int(), buoc: z.number().int() })`), `apps/api/src/dashboard/dashboard.service.ts` (hai `count`), `apps/app/app/(app)/[slug]/dashboard-summary.tsx`, `apps/app/lib/messages/tong-quan.ts` (khoá `tasks.conLai: (n) => …`); Test `apps/api/test/dieu-phoi-va.spec.ts` (`dem-qua-han`), `apps/app/test/dieu-phoi-va.dom.tsx` (`the-qua-han`).

- [ ] Step 1: test API gieo 25/3/2/2/15/2 như E7, gọi `new DashboardService(db, new ConversionService(db)).summary(userId, { scope })`. Đỏ.
- [ ] Step 2: service: `viec = db.activity.count({ where: <cùng where của overdueTasks> })`, `buoc = db.onboardingStep.count({ where: { assigneeId: actingUserId, completedAt: null, plan: { closedAt: null }, dueAt: { lt: dauNgayVN(now) } } })`; trả `quaHan`.
- [ ] Step 3: thẻ: `soQuaHan = quaHan.viec + quaHan.buoc`; `dangHien = overdueTasks.length + mySteps.filter(buocQuaHan).length`; `soQuaHan > dangHien` → `<p className="text-muted-foreground text-xs">` trong `CardPanel` dưới bảng với `m.tasks.conLai(formatCount(...))` (dùng `CardPanelFooter` nếu `@crm/ui` có; không thì `CardDescription`).
- [ ] Step 4: test DOM `the-qua-han` (E7b, E8, en/vi). Xanh; phá-thử chiều đỏ. Commit.

**Verify:** `dpv_dem_qua_han`, `dpv_the_qua_han_dom` · independent: false

### Task 7: Thước hồi quy và thước màn (E9, E10, E11)

**Files:** Create `_acceptance/dieu-phoi-va/rang/khong-xoa-expect.mjs` (chép khuôn `giai-doan-mac-dinh`, `TEP` = năm tệp E9), `_acceptance/dieu-phoi-va/rang/man.mjs` (theo `kara-gop-y-luot-2/rang/man.mjs` + `soan-okr-trang-rieng/rang/man-chung.mjs`).

- [ ] Step 1: `khong-xoa-expect.mjs --tu-thu` → xanh; `--moc d0ccad984` → xanh.
- [ ] Step 2: `man.mjs`: phiên đo riêng, gieo kế hoạch rỗng / có bước / đã đóng và 25 việc + 15 bước quá hạn qua Prisma, chụp 6 trạng thái × 1440, 390, in `dat` mỗi trạng thái, dọn.
- [ ] Step 3: chạy `dpv_man` một lần tới xanh (eval chưa từng xanh phải xanh một lần trước S4). Commit.

**Verify:** `dpv_hoi_quy`, `dpv_man` · independent: true (chỉ thước)

## Thứ tự

1 → 2 → 3 → 4 → 5 → 6 → 7, tuần tự trong phiên (Native). Sau Task 7: `bun run check-types`, `bun run lint`, `bun run lint:slop`, rồi S4.
