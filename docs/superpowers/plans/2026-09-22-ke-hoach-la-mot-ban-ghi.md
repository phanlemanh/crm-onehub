# Kế hoạch là một bản ghi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kế hoạch 30 ngày mở như một record sheet, làm việc được trên từng bước (giao · xong · hạn · thêm · bỏ · sắp · cầm trịch · ghi chú), mỗi thay đổi để lại một vết đọc được.

**Architecture:** Bảy thủ tục ghi mới trong module `onboarding` của API, mỗi thủ tục ghi bước và một `Activity` kiểu `PLAN_CHANGE` trong cùng transaction; `meta` của vết dựng bằng hàm dựng ở `packages/validation`. Phía app, `plan` thành loại bản ghi thứ tư của `RECORD_KINDS`, `PlanSheet` dựng trên `RecordSheetFrame`, `Timeline` nhận mốc neo `planId`.

**Tech Stack:** Prisma (Postgres) · NestJS + nestjs-trpc · zod 4 · Next.js App Router · TanStack Query · nuqs · bun test (+ jsdom preload cho `.dom.tsx`).

**Spec:** `docs/superpowers/specs/2026-09-22-ke-hoach-la-mot-ban-ghi-design.md` · hợp đồng `_acceptance/ke-hoach-la-mot-ban-ghi/contract.md` (duyệt 2026-09-22) · phép đo `_acceptance/ke-hoach-la-mot-ban-ghi/evals.yaml`.

## Global Constraints

- **Không viết chú thích trong code** — không vào code mới, không vào code đang sửa (`AGENTS.md`).
- Router mỏng: zod vào, gọi service; Prisma chỉ trong `*.service.ts`; lỗi ném bằng `HttpException` (`docs/api.md`).
- Thông điệp lỗi tiếng Việt và mọi số tinh chỉnh khai trong `apps/api/src/onboarding/onboarding-config.ts`, không ghim tại chỗ dùng.
- Hình dữ liệu vượt biên gói (`meta` của vết) sống ở `packages/validation/src/onboarding-activity.ts`, nhập theo subpath `@crm/validation/onboarding-activity`; kiểu rút bằng `z.infer`.
- Client component không nhập `@crm/db`, `@crm/auth`; `@crm/ui` chỉ nhập theo subpath.
- `/packages/ui` là nguồn giao diện duy nhất; không đè style ở chỗ gọi, radius chỉ từ thang.
- Chữ trên màn ở `apps/app/lib/messages/onboarding.ts`, đủ `en` và `vi`; tên người, tên công ty, nhãn bước gắn `translate="no"`.
- Thông điệp đóng: `«Kế hoạch đã đóng — mở lại trước khi sửa.»` — nguyên văn, AC-8 so chuỗi.
- Hạn gửi qua dây luôn là chuỗi `YYYY-MM-DD`; vết đổi hạn ghi `tu` · `den` dạng đó.
- Mỗi phép đo mới đi kèm cặp hai chiều trên cùng fixture và một đột biến có thông điệp ghim; thiếu cặp là task CHƯA XONG (MEASURE-BIRTH-CLAUSE).
- Năm lệnh chứng minh từ gốc kho, không export gì: `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build`.
- `bun test` trong `apps/app` chạy một tiến trình: không preload jsdom cho cả gói (đụng `sign-out.spec.ts`); `.dom.tsx` chạy với `--preload ../../packages/ui/test/setup-dom.ts` riêng.
- `mock.module` của bun sống qua các tệp kiểm — tệp `.dom.tsx` mới chạy riêng qua khoá executor của nó, và phải xanh ở cả hai thứ tự nạp với `dieu-phoi-xoa-ghi-danh.dom.tsx`.

## Bản đồ tệp

| Tệp | Trách nhiệm |
| --- | --- |
| `packages/db/prisma/schema.prisma` | `Activity.planId`, `OnboardingPlan.activities`, `ActivityType.PLAN_CHANGE` |
| `packages/db/prisma/migrations/<ts>_ke_hoach_la_mot_ban_ghi/migration.sql` | migration sinh bởi `prisma migrate dev` |
| `packages/validation/src/onboarding-activity.ts` (mới) | schema hợp phân biệt 10 dạng `meta`, hàm dựng `vet.*`, `parseOnboardingActivityMeta`, `vetCoCongTy` |
| `packages/validation/package.json` | export subpath `./onboarding-activity` |
| `apps/api/src/onboarding/onboarding.contracts.ts` | input/output của bảy thủ tục, `planDetailOutput` mở rộng, `stepOutput` thêm `assignee` |
| `apps/api/src/onboarding/onboarding-config.ts` | thông điệp mới |
| `apps/api/src/onboarding/onboarding-ghi.ts` (mới) | bảy thủ tục ghi + ghi vết (tách khỏi `onboarding.service.ts` đã 700+ dòng) |
| `apps/api/src/onboarding/onboarding.service.ts` | uỷ quyền sang `onboarding-ghi.ts`; `planById`, `listSteps` mở rộng; `closePlan` · `reopenPlan` ghi vết |
| `apps/api/src/onboarding/onboarding.router.ts` | bảy `@Mutation` mới truyền `ctx.user.id` |
| `apps/api/src/activities/activities.contracts.ts` · `activities.service.ts` | mốc neo `planId`, `PLAN_CHANGE` trong output |
| `apps/api/test/ke-hoach-ban-ghi.spec.ts` (mới) | E1–E10, E14, E20 |
| `apps/api/test/fixtures/ke-hoach-payload.json` (mới) | ba payload E19 khẳng định và E20 ghi |
| `apps/app/components/crm/record-sheet/record-stack.ts` · `record-sheet-host.tsx` · `record-prefetch.ts` | loại `plan` |
| `apps/app/lib/trpc/cache.ts` | `plan(id)` |
| `apps/app/lib/qua-han.ts` (mới) | hàm thuần `quaHan` |
| `apps/app/components/crm/record-sheet/plan-sheet.tsx` (mới) | khung sheet, dải số, tab, menu `⋯` |
| `apps/app/components/crm/record-sheet/plan-steps.tsx` (mới) | tab Bước |
| `apps/app/components/crm/record-sheet/plan-brokers.tsx` (mới) | tab Môi giới |
| `apps/app/components/crm/timeline/timeline.tsx` · `timeline-entry.tsx` · `activity-composer.tsx` · `plan-change-line.ts` (mới) | mốc neo `planId`, câu cho `PLAN_CHANGE` |
| `apps/app/app/(app)/[slug]/onboarding/[planId]/page.tsx` | chỉ còn `redirect` |
| `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx` · `danh-muc-bang-cot.tsx` | bấm hàng / thẻ → `openRecord` |
| `apps/app/lib/messages/onboarding.ts` | nhóm chữ `sheet` |
| `apps/app/test/ke-hoach-sheet.dom.tsx` · `qua-han-theo-ngay.spec.ts` · `ke-hoach-chuyen-huong.spec.ts` (mới) | E11, E12, E13, E15, E16, E19 |
| `apps/app/test/dieu-phoi-xoa-ghi-danh.dom.tsx` | đổi nhà sang `PlanBrokers` (bài kiểm của vòng một) |
| `CONTEXT.md` | mục từ điển |

---

### Task 1: Dữ liệu và hình của vết

**Phục vụ:** E1–E10, E16 (nền cho mọi phép đo vết) · `independent: false`

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `Activity` ~dòng 1205, enum `ActivityType` ~dòng 199, model `OnboardingPlan` ~dòng 1716)
- Create: `packages/db/prisma/migrations/<timestamp>_ke_hoach_la_mot_ban_ghi/migration.sql` (sinh bằng lệnh)
- Create: `packages/validation/src/onboarding-activity.ts`
- Create: `packages/validation/test/onboarding-activity.spec.ts`
- Modify: `packages/validation/package.json`
- Modify: `CONTEXT.md`

**Interfaces — Produces:**
- `ActivityType.PLAN_CHANGE`; `Activity.planId: string | null`.
- `onboardingActivityMeta` (zod) · `type OnboardingActivityMeta` · `type OnboardingActivityKind` · `ONBOARDING_ACTIVITY_KINDS` (10 phần tử, theo thứ tự dưới).
- `vet.buocGiao({ stepId, nhan, tu, tuTen, den, denTen })` · `vet.buocXong({ stepId, nhan })` · `vet.buocBoXong(...)` · `vet.buocDoiHan({ stepId, nhan, tu, den })` · `vet.buocThem({ stepId, nhan })` · `vet.buocBo({ stepId, nhan })` · `vet.keHoachDoiCamTrich({ tu, tuTen, den, denTen })` · `vet.keHoachDong()` · `vet.keHoachMoLai()` — mỗi hàm trả đúng một `OnboardingActivityMeta`.
- `parseOnboardingActivityMeta(value: unknown): OnboardingActivityMeta` — ném lỗi có tên.
- `vetCoCongTy(meta: OnboardingActivityMeta): boolean` — `true` với `keHoach.*`.

> **Lệch design doc có tên (S2):** `buoc.giao` và `keHoach.doiCamTrich` mang thêm `tuTen` · `denTen` — ảnh chụp tên lúc ghi. Dòng thời gian chỉ có tên người tạo vết, không tra được tên theo id trong `meta`; không có ảnh chụp thì câu «giao cho Thương» không vẽ được. Ghi vào sổ quyết định ở cuối S2.

- [ ] **Step 1: Viết bài kiểm schema (đỏ)**

`packages/validation/test/onboarding-activity.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import {
	ONBOARDING_ACTIVITY_KINDS,
	parseOnboardingActivityMeta,
	vet,
	vetCoCongTy,
} from "../src/onboarding-activity";

const MA_TRAN = [
	vet.buocGiao({ stepId: "s1", nhan: "Dao tao", tu: null, tuTen: null, den: "u1", denTen: "Thuong" }),
	vet.buocXong({ stepId: "s1", nhan: "Dao tao" }),
	vet.buocBoXong({ stepId: "s1", nhan: "Dao tao" }),
	vet.buocDoiHan({ stepId: "s1", nhan: "Dao tao", tu: "2026-09-22", den: "2026-09-25" }),
	vet.buocThem({ stepId: "s1", nhan: "Dao tao" }),
	vet.buocBo({ stepId: "s1", nhan: "Dao tao" }),
	vet.keHoachDoiCamTrich({ tu: "u1", tuTen: "Manh", den: "u2", denTen: "Tuan" }),
	vet.keHoachDong(),
	vet.keHoachMoLai(),
];

describe("onboarding-activity", () => {
	test("moi kind co mot ham dung va doc lai qua schema", () => {
		expect(new Set(MA_TRAN.map((m) => m.kind)).size).toBe(9);
		expect(ONBOARDING_ACTIVITY_KINDS.length).toBe(9);
		for (const meta of MA_TRAN) {
			expect(parseOnboardingActivityMeta(meta)).toEqual(meta);
		}
	});

	test("doi han tu choi chuoi ISO co gio", () => {
		expect(() =>
			parseOnboardingActivityMeta({ kind: "buoc.doiHan", stepId: "s1", nhan: "x", tu: "2026-09-22T00:00:00.000Z", den: "2026-09-25" }),
		).toThrow("vết kế hoạch");
	});

	test("chi keHoach.* mang cong ty", () => {
		expect(MA_TRAN.filter(vetCoCongTy).map((m) => m.kind)).toEqual([
			"keHoach.doiCamTrich",
			"keHoach.dong",
			"keHoach.moLai",
		]);
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd packages/validation && bun test test/onboarding-activity.spec.ts`
Expected: FAIL — `Cannot find module '../src/onboarding-activity'`.

- [ ] **Step 3: Viết module**

`packages/validation/src/onboarding-activity.ts`:

```ts
import { z } from "zod";
import { parse } from "./index";

const ma = z.string().trim().min(1).max(120);
const nhan = z.string().trim().min(1).max(200);
const ten = z.string().trim().min(1).max(200);
const ngay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const buoc = { stepId: ma, nhan };

export const onboardingActivityMeta = z.discriminatedUnion("kind", [
	z.object({ kind: z.literal("buoc.giao"), ...buoc, tu: ma.nullable(), tuTen: ten.nullable(), den: ma.nullable(), denTen: ten.nullable() }),
	z.object({ kind: z.literal("buoc.xong"), ...buoc }),
	z.object({ kind: z.literal("buoc.boXong"), ...buoc }),
	z.object({ kind: z.literal("buoc.doiHan"), ...buoc, tu: ngay, den: ngay }),
	z.object({ kind: z.literal("buoc.them"), ...buoc }),
	z.object({ kind: z.literal("buoc.bo"), ...buoc }),
	z.object({ kind: z.literal("keHoach.doiCamTrich"), tu: ma, tuTen: ten, den: ma, denTen: ten }),
	z.object({ kind: z.literal("keHoach.dong") }),
	z.object({ kind: z.literal("keHoach.moLai") }),
]);

export type OnboardingActivityMeta = z.infer<typeof onboardingActivityMeta>;

export type OnboardingActivityKind = OnboardingActivityMeta["kind"];

export const ONBOARDING_ACTIVITY_KINDS = [
	"buoc.giao",
	"buoc.xong",
	"buoc.boXong",
	"buoc.doiHan",
	"buoc.them",
	"buoc.bo",
	"keHoach.doiCamTrich",
	"keHoach.dong",
	"keHoach.moLai",
] as const satisfies readonly OnboardingActivityKind[];

type Cua<K extends OnboardingActivityKind> = Omit<Extract<OnboardingActivityMeta, { kind: K }>, "kind">;

export const vet = {
	buocGiao: (v: Cua<"buoc.giao">) => ({ kind: "buoc.giao", ...v }) as const,
	buocXong: (v: Cua<"buoc.xong">) => ({ kind: "buoc.xong", ...v }) as const,
	buocBoXong: (v: Cua<"buoc.boXong">) => ({ kind: "buoc.boXong", ...v }) as const,
	buocDoiHan: (v: Cua<"buoc.doiHan">) => ({ kind: "buoc.doiHan", ...v }) as const,
	buocThem: (v: Cua<"buoc.them">) => ({ kind: "buoc.them", ...v }) as const,
	buocBo: (v: Cua<"buoc.bo">) => ({ kind: "buoc.bo", ...v }) as const,
	keHoachDoiCamTrich: (v: Cua<"keHoach.doiCamTrich">) => ({ kind: "keHoach.doiCamTrich", ...v }) as const,
	keHoachDong: () => ({ kind: "keHoach.dong" }) as const,
	keHoachMoLai: () => ({ kind: "keHoach.moLai" }) as const,
} satisfies Record<string, (...a: never[]) => OnboardingActivityMeta>;

export function parseOnboardingActivityMeta(value: unknown): OnboardingActivityMeta {
	return parse(onboardingActivityMeta, value, "vết kế hoạch");
}

export function vetCoCongTy(meta: OnboardingActivityMeta): boolean {
	return meta.kind.startsWith("keHoach.");
}
```

Thêm vào `packages/validation/package.json` › `exports`: `"./onboarding-activity": "./src/onboarding-activity.ts",` (đúng thứ tự chữ cái, sau `./onboarding-ingest`).

> Ma trận ở bài kiểm dùng 9 phần tử vì `buoc.giao` là một `kind`; E16 ở Task 7 dùng hai dòng `buoc.giao` (giao và bỏ giao), tổng 10 assert.

- [ ] **Step 4: Chạy, thấy xanh; rồi phá thử**

Run: `cd packages/validation && bun test test/onboarding-activity.spec.ts` → PASS 3/3.
Phá thử trong bản sao: đổi `ngay` thành `z.string()` → test 2 đỏ với `Expected ... to throw "vết kế hoạch"`. Hoàn lại.

- [ ] **Step 5: Schema và migration**

Trong `schema.prisma`:
- `enum ActivityType` thêm dòng `PLAN_CHANGE` sau `ENRICHMENT`.
- `model Activity` thêm, ngay sau khối `dealId`:
  ```prisma
  planId    String?
  plan      OnboardingPlan? @relation(fields: [planId], references: [id], onDelete: Cascade)
  ```
  và `@@index([planId, createdAt])` cạnh các chỉ mục cùng loại.
- `model OnboardingPlan` thêm `activities  Activity[]` sau `enrollments`.

Run: `bun run db:migrate -- --name ke_hoach_la_mot_ban_ghi` rồi `bun run db:generate`.
Expected: một thư mục migration mới chứa `ALTER TYPE "ActivityType" ADD VALUE 'PLAN_CHANGE'`, `ALTER TABLE "activity" ADD COLUMN "planId" TEXT`, khoá ngoại `ON DELETE CASCADE`, chỉ mục.

- [ ] **Step 6: Rà mọi chỗ `switch`/liệt kê trên `ActivityType`**

Run: `grep -rn "ActivityType\.\(ENRICHMENT\|STAGE_CHANGE\)" apps packages --include=*.ts --include=*.tsx | grep -v node_modules`
Với mỗi danh sách đóng (`ALL_ACTIVITY_TYPES` trong `activities.contracts.ts`, `activity-presentation.ts`, `activity-icon.tsx`…) thêm `PLAN_CHANGE`. Chạy `bun run check-types` — xanh là rà đủ (giả định 4 của design doc).

- [ ] **Step 7: Từ điển**

Thêm vào `CONTEXT.md` bốn mục theo đúng khuôn mục đang có (tên đậm · định nghĩa · `_Avoid_` · «Vì sao»): **Kế hoạch 30 ngày** · **Bước** · **Người cầm trịch** (kèm lý do khác «Phụ trách» — d-20260922T051911Z-12) · **Ghi danh** và **Bậc**.

- [ ] **Step 8: Commit**

```bash
git add packages/db/prisma packages/validation CONTEXT.md apps
git commit -m "feat(db): vet ke hoach — Activity.planId, PLAN_CHANGE, khuon meta o validation"
```

---

### Task 2: Bảy thủ tục ghi

**Phục vụ:** E1, E2, E3, E4, E5, E6, E7, E8, E14 · `independent: false`

**Files:**
- Create: `apps/api/src/onboarding/onboarding-ghi.ts`
- Modify: `apps/api/src/onboarding/onboarding.contracts.ts`, `onboarding-config.ts`, `onboarding.service.ts` (`closePlan`, `reopenPlan`, `datDong`), `onboarding.router.ts`
- Create: `apps/api/test/ke-hoach-ban-ghi.spec.ts`

**Interfaces:**
- Consumes: `vet.*`, `vetCoCongTy` (Task 1).
- Produces (service, mọi hàm nhận `actingUserId: string` cuối):
  - `assignStep(input: { stepId: string; assigneeId: string | null }, actingUserId): Promise<StepOutput>`
  - `setStepDone(input: { stepId: string; done: boolean }, actingUserId): Promise<StepOutput>`
  - `rescheduleStep(input: { stepId: string; dueAt: Date }, actingUserId): Promise<StepOutput>`
  - `addStep(input: { planId: string; label: string; departmentId: string; dueAt: Date; assigneeId?: string | null }, actingUserId): Promise<StepOutput>`
  - `removeStep(input: { stepId: string }, actingUserId): Promise<{ id: string }>`
  - `reorderSteps(input: { planId: string; stepIds: string[] }): Promise<StepListOutput>`
  - `setPlanOwner(input: { planId: string; ownerId: string }, actingUserId): Promise<PlanOutput>`
  - `closePlan(input, actingUserId)` · `reopenPlan(input, actingUserId)` — chữ ký mới.
- Contracts: `stepAssignInput` · `stepDoneInput` · `stepRescheduleInput` (`dueAt: ngayLich`) · `stepAddInput` · `stepIdInput` · `stepReorderInput` · `planOwnerInput`.
- Router tRPC: `onboarding.assignStep` · `setStepDone` · `rescheduleStep` · `addStep` · `removeStep` · `reorderSteps` · `setPlanOwner`.

- [ ] **Step 1: Thông điệp vào cấu hình**

`onboarding-config.ts` › `thongDiep` thêm:

```ts
		keHoachDaDong: "Kế hoạch đã đóng — mở lại trước khi sửa.",
		khongPhaiThanhVien: (id: string) => `Người ${id} không phải thành viên đang hoạt động.`,
		sapLaiSaiTap: "Danh sách sắp lại phải gồm đúng mọi bước của kế hoạch, mỗi bước một lần.",
		khongCoBuoc: (id: string) => `Không có bước nào mang mã ${id}.`,
		khongCoKeHoach: (id: string) => `Không có kế hoạch nào mang mã ${id}.`,
```

- [ ] **Step 2: Contracts**

`onboarding.contracts.ts`, sau `stepListOutput`:

```ts
const ma = z.string().trim().min(1).max(120);

export const stepAssignInput = z.object({ stepId: ma, assigneeId: ma.nullable() });
export const stepDoneInput = z.object({ stepId: ma, done: z.boolean() });
export const stepRescheduleInput = z.object({ stepId: ma, dueAt: ngayLich });
export const stepAddInput = z.object({
	planId: ma,
	label: z.string().trim().min(1).max(200),
	departmentId: ma,
	dueAt: ngayLich,
	assigneeId: ma.nullable().optional(),
});
export const stepIdInput = z.object({ stepId: ma });
export const stepReorderInput = z.object({ planId: ma, stepIds: z.array(ma).min(1).max(100) });
export const planOwnerInput = z.object({ planId: ma, ownerId: ma });
export const stepRemovedOutput = z.object({ id: z.string() });

export type StepAssignInput = z.infer<typeof stepAssignInput>;
export type StepDoneInput = z.infer<typeof stepDoneInput>;
export type StepRescheduleInput = z.infer<typeof stepRescheduleInput>;
export type StepAddInput = z.infer<typeof stepAddInput>;
export type StepIdInput = z.infer<typeof stepIdInput>;
export type StepReorderInput = z.infer<typeof stepReorderInput>;
export type PlanOwnerInput = z.infer<typeof planOwnerInput>;
```

`stepOutput` thêm `assignee: z.object({ id: z.string(), name: z.string(), image: z.string().nullable() }).nullable()`.

- [ ] **Step 3: Viết bài kiểm E1, E2, E7, E8 (đỏ)**

`apps/api/test/ke-hoach-ban-ghi.spec.ts` — dựng trên `gieoNguoi` · `gieoBoPhan` của `./dieu-phoi-gieo` và một `gieoKeHoach` chép hình của `quan-ly-danh-muc.spec.ts:78-114` (tiền tố `khbg`, dọn ở `afterAll` theo đúng mẫu đó, thêm `db.activity.deleteMany({ where: { plan: { company: { name: { contains: TIEN_TO } } } } })` trước khi xoá kế hoạch). Mỗi `describe` mang đúng nhãn `-t` của khoá executor:

```ts
describe("giao-buoc", () => {
	test("giao-buoc: doc lai thay nguoi, vet buoc.giao mang nguoi bam", async () => {
		const [O, A, B] = [await gieoNguoi(), await gieoNguoi(), await gieoNguoi()];
		const bp = await gieoBoPhan();
		const plan = await gieoKeHoach({ tenCongTy: token(), ownerId: O.id, buoc: [{ label: "Dao tao", departmentId: bp.id }] });
		const [truoc] = await db.onboardingStep.findMany({ where: { planId: plan.id } });

		await dichVu().assignStep({ stepId: truoc.id, assigneeId: A.id }, B.id);

		const sau = await db.onboardingStep.findUniqueOrThrow({ where: { id: truoc.id } });
		const vetGhi = await db.activity.findMany({ where: { planId: plan.id } });
		expect(sau.assigneeId).toBe(A.id);
		expect(sau.updatedAt.getTime()).toBeGreaterThan(truoc.updatedAt.getTime());
		expect(vetGhi.length, "buoc.giao: so vet mong 1").toBe(1);
		expect(vetGhi[0].type).toBe("PLAN_CHANGE");
		expect(parseOnboardingActivityMeta(vetGhi[0].meta)).toMatchObject({ kind: "buoc.giao", stepId: truoc.id, tu: null, den: A.id });
		expect(vetGhi[0].createdById, `mong ${B.id} / nhan ${vetGhi[0].createdById}`).toBe(B.id);

		await dichVu().assignStep({ stepId: truoc.id, assigneeId: B.id }, B.id);
		const lan2 = await db.activity.findMany({ where: { planId: plan.id }, orderBy: { createdAt: "asc" } });
		expect(parseOnboardingActivityMeta(lan2[1].meta)).toMatchObject({ tu: A.id, den: B.id });
	});
});
```

E2 (`xong-lam-song-danh-muc`), E7 (`thao-tac-rong`), E8 (`dong-la-chi-doc`) viết theo đúng `expected` của `evals.yaml` — E2 gieo `imNgay: 5` và đọc `manDanhMuc` trước/sau; E8 lặp ma trận bảy thủ tục và so `err.message` bằng `ONBOARDING.thongDiep.keHoachDaDong` và `err.getStatus()` bằng `409`, rồi so ảnh chụp trước/sau bằng `toEqual`.

Run: `bun run test -- "cd apps/api && bun test test/ke-hoach-ban-ghi.spec.ts"` → FAIL `dichVu(...).assignStep is not a function`.

- [ ] **Step 4: Viết `onboarding-ghi.ts`**

```ts
import type { Db, Prisma } from "@crm/db";
import { type OnboardingActivityMeta, vet, vetCoCongTy } from "@crm/validation/onboarding-activity";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import type { PlanOutput, StepAddInput, StepAssignInput, StepDoneInput, StepIdInput, StepListOutput, StepOutput, StepReorderInput, StepRescheduleInput, PlanOwnerInput } from "./onboarding.contracts";
import { ONBOARDING } from "./onboarding-config";

type Tx = Prisma.TransactionClient;

export const CHON_BUOC = {
	id: true,
	planId: true,
	label: true,
	departmentId: true,
	department: { select: { name: true } },
	assigneeId: true,
	assignee: { select: { id: true, name: true, image: true } },
	dueAt: true,
	completedAt: true,
	position: true,
} as const;

type HangBuoc = Prisma.OnboardingStepGetPayload<{ select: typeof CHON_BUOC }>;

export function buocRa({ department, ...b }: HangBuoc): StepOutput {
	return { ...b, departmentName: department.name };
}

function ngay(d: Date): string {
	return d.toISOString().slice(0, 10);
}

async function keHoachMo(tx: Tx, planId: string): Promise<{ id: string; companyId: string; ownerId: string }> {
	const plan = await tx.onboardingPlan.findUnique({ where: { id: planId }, select: { id: true, companyId: true, ownerId: true, closedAt: true } });
	if (plan === null) throw new NotFoundException(ONBOARDING.thongDiep.khongCoKeHoach(planId));
	if (plan.closedAt !== null) throw new ConflictException(ONBOARDING.thongDiep.keHoachDaDong);
	return plan;
}

async function buocCuaKeHoachMo(tx: Tx, stepId: string) {
	const buoc = await tx.onboardingStep.findUnique({ where: { id: stepId }, select: CHON_BUOC });
	if (buoc === null) throw new NotFoundException(ONBOARDING.thongDiep.khongCoBuoc(stepId));
	const plan = await keHoachMo(tx, buoc.planId);
	return { buoc, plan };
}

async function thanhVien(tx: Tx, userId: string): Promise<{ id: string; name: string }> {
	const nguoi = await tx.user.findFirst({ where: { id: userId, members: { some: {} } }, select: { id: true, name: true } });
	if (nguoi === null) throw new BadRequestException(ONBOARDING.thongDiep.khongPhaiThanhVien(userId));
	return nguoi;
}

export async function ghiVet(tx: Tx, plan: { id: string; companyId: string }, meta: OnboardingActivityMeta, actingUserId: string): Promise<void> {
	await tx.activity.create({
		data: {
			type: "PLAN_CHANGE",
			occurredAt: new Date(),
			planId: plan.id,
			companyId: vetCoCongTy(meta) ? plan.companyId : null,
			createdById: actingUserId,
			meta,
		},
	});
}

export class OnboardingGhi {
	constructor(private readonly db: Db) {}

	assignStep(input: StepAssignInput, actingUserId: string): Promise<StepOutput> {
		return this.db.$transaction(async (tx) => {
			const { buoc, plan } = await buocCuaKeHoachMo(tx, input.stepId);
			if (buoc.assigneeId === input.assigneeId) return buocRa(buoc);
			const den = input.assigneeId === null ? null : await thanhVien(tx, input.assigneeId);
			const sau = await tx.onboardingStep.update({ where: { id: buoc.id }, data: { assigneeId: input.assigneeId }, select: CHON_BUOC });
			await ghiVet(tx, plan, vet.buocGiao({ stepId: buoc.id, nhan: buoc.label, tu: buoc.assignee?.id ?? null, tuTen: buoc.assignee?.name ?? null, den: den?.id ?? null, denTen: den?.name ?? null }), actingUserId);
			return buocRa(sau);
		});
	}

	setStepDone(input: StepDoneInput, actingUserId: string): Promise<StepOutput> {
		return this.db.$transaction(async (tx) => {
			const { buoc, plan } = await buocCuaKeHoachMo(tx, input.stepId);
			if ((buoc.completedAt !== null) === input.done) return buocRa(buoc);
			const sau = await tx.onboardingStep.update({ where: { id: buoc.id }, data: { completedAt: input.done ? new Date() : null }, select: CHON_BUOC });
			await ghiVet(tx, plan, input.done ? vet.buocXong({ stepId: buoc.id, nhan: buoc.label }) : vet.buocBoXong({ stepId: buoc.id, nhan: buoc.label }), actingUserId);
			return buocRa(sau);
		});
	}

	rescheduleStep(input: StepRescheduleInput, actingUserId: string): Promise<StepOutput> {
		return this.db.$transaction(async (tx) => {
			const { buoc, plan } = await buocCuaKeHoachMo(tx, input.stepId);
			if (ngay(buoc.dueAt) === ngay(input.dueAt)) return buocRa(buoc);
			const sau = await tx.onboardingStep.update({ where: { id: buoc.id }, data: { dueAt: input.dueAt }, select: CHON_BUOC });
			await ghiVet(tx, plan, vet.buocDoiHan({ stepId: buoc.id, nhan: buoc.label, tu: ngay(buoc.dueAt), den: ngay(input.dueAt) }), actingUserId);
			return buocRa(sau);
		});
	}

	addStep(input: StepAddInput, actingUserId: string): Promise<StepOutput> {
		return this.db.$transaction(async (tx) => {
			const plan = await keHoachMo(tx, input.planId);
			if (input.assigneeId) await thanhVien(tx, input.assigneeId);
			const cuoi = await tx.onboardingStep.findFirst({ where: { planId: plan.id }, orderBy: { position: "desc" }, select: { position: true } });
			const moi = await tx.onboardingStep.create({
				data: { planId: plan.id, label: input.label, departmentId: input.departmentId, dueAt: input.dueAt, assigneeId: input.assigneeId ?? null, position: (cuoi?.position ?? -1) + 1 },
				select: CHON_BUOC,
			});
			await ghiVet(tx, plan, vet.buocThem({ stepId: moi.id, nhan: moi.label }), actingUserId);
			return buocRa(moi);
		});
	}

	removeStep(input: StepIdInput, actingUserId: string): Promise<{ id: string }> {
		return this.db.$transaction(async (tx) => {
			const { buoc, plan } = await buocCuaKeHoachMo(tx, input.stepId);
			await tx.onboardingStep.delete({ where: { id: buoc.id } });
			await ghiVet(tx, plan, vet.buocBo({ stepId: buoc.id, nhan: buoc.label }), actingUserId);
			return { id: buoc.id };
		});
	}

	reorderSteps(input: StepReorderInput): Promise<StepListOutput> {
		return this.db.$transaction(async (tx) => {
			const plan = await keHoachMo(tx, input.planId);
			const co = await tx.onboardingStep.findMany({ where: { planId: plan.id }, select: { id: true } });
			const tap = new Set(input.stepIds);
			const dung = tap.size === input.stepIds.length && tap.size === co.length && co.every((b) => tap.has(b.id));
			if (!dung) throw new BadRequestException(ONBOARDING.thongDiep.sapLaiSaiTap);
			for (const [position, id] of input.stepIds.entries()) {
				await tx.onboardingStep.update({ where: { id }, data: { position } });
			}
			const hang = await tx.onboardingStep.findMany({ where: { planId: plan.id }, orderBy: { position: "asc" }, select: CHON_BUOC });
			return { rows: hang.map(buocRa), total: hang.length };
		});
	}

	setPlanOwner(input: PlanOwnerInput, actingUserId: string): Promise<PlanOutput> {
		return this.db.$transaction(async (tx) => {
			const plan = await keHoachMo(tx, input.planId);
			const cu = await thanhVien(tx, plan.ownerId).catch(() => ({ id: plan.ownerId, name: plan.ownerId }));
			const moi = await thanhVien(tx, input.ownerId);
			const sau = await tx.onboardingPlan.update({ where: { id: plan.id }, data: { ownerId: moi.id } });
			if (cu.id !== moi.id) {
				await ghiVet(tx, plan, vet.keHoachDoiCamTrich({ tu: cu.id, tuTen: cu.name, den: moi.id, denTen: moi.name }), actingUserId);
			}
			return sau;
		});
	}
}
```

> Kiểm trước khi chép: tên quan hệ `User.members` và trường `OnboardingStep.assignee` có trong `schema.prisma` (quan hệ `"OnboardingStepAssignee"`); nếu quan hệ thành viên tên khác, dùng đúng tên trong schema. `setPlanOwner` trả `sau` qua `keHoachRa` của service (import từ service hoặc chuyển `keHoachRa` sang `onboarding-ghi.ts`) — chọn một nơi, không chép hai bản.

`onboarding.service.ts`: thêm `private readonly ghi = new OnboardingGhi(this.db);` và bảy phương thức uỷ quyền một dòng; `listSteps` dùng `CHON_BUOC` + `buocRa`; `datDong(id, closedAt, actingUserId)` chạy trong `$transaction`, bỏ qua khi `closedAt` không đổi trạng thái, ghi `vet.keHoachDong()` / `vet.keHoachMoLai()` qua `ghiVet`.

`onboarding.router.ts`: bảy `@Mutation` theo mẫu `closePlan` (dòng ~250), mỗi cái `@Ctx() ctx: AuthedTrpcContext` và truyền `ctx.user.id`; `closePlan` · `reopenPlan` thêm `ctx`. `restMeta`: `PATCH /onboarding/steps/{stepId}/assignee` · `/done` · `/due` · `POST /onboarding/plans/{planId}/steps` · `DELETE /onboarding/steps/{stepId}` · `PUT /onboarding/plans/{planId}/steps/order` · `PATCH /onboarding/plans/{planId}/owner`.

Sinh lại `apps/api/src/generated/server.ts` bằng lệnh codegen của kho (`docs/api.md` mục generated — commit tệp sinh).

- [ ] **Step 5: E3, E4, E5, E6, E14 — viết, thấy đỏ trước khi Step 4 xong, rồi xanh**

Viết theo `expected` trong `evals.yaml` với các nhãn `doi-han` · `them-bo-buoc` · `sap-lai` · `doi-cam-trich` · `go-dung-nguoi`. E5 lặp ma trận bốn dòng viết trước (ba sai + một đúng), mỗi dòng một `expect` riêng.

Run: `bun run test -- "cd apps/api && bun test test/ke-hoach-ban-ghi.spec.ts"`
Expected: PASS mọi `describe` của Task 2.

- [ ] **Step 6: Phá thử có tên**

Trong bản sao, từng đột biến một, chạy lại đúng nhãn và thấy thông điệp ghim:
1. bỏ `ghiVet` khỏi `assignStep` → E1 đỏ `buoc.giao: so vet mong 1`;
2. `createdById: plan.ownerId` → E1 đỏ `mong <B> / nhan <O>`;
3. `setStepDone` qua `$executeRaw` không chạm `updatedAt` → E2 đỏ ở `imNgay`;
4. bỏ nhánh so giá trị cũ → E7 đỏ `thao tac rong`;
5. bỏ `keHoachMo` khỏi `removeStep` → E8 đỏ ở dòng `removeStep`.
Hoàn lại cả năm.

- [ ] **Step 7: Commit**

```bash
git add apps/api packages
git commit -m "feat(onboarding): bay thu tuc ghi buoc va cam trich, moi thu tuc mot vet"
```

---

### Task 3: Mốc neo `planId` trong dòng thời gian

**Phục vụ:** E9, E10 · `independent: false`

**Files:**
- Modify: `apps/api/src/activities/activities.contracts.ts`, `activities.service.ts`
- Test: `apps/api/test/ke-hoach-ban-ghi.spec.ts` (thêm `describe` `ghi-chu-hai-dong-thoi-gian`, `xoa-day-chuyen`)

**Interfaces — Produces:** `timelineInput.planId?` · `timelineCountsInput.planId?` · `activityCreateInput.planId?`; output entry thêm `planId: string | null`, `type` nhận `PLAN_CHANGE`.

- [ ] **Step 1: Viết E9, E10 (đỏ)** theo `expected`. E9 gọi `new ActivitiesService(db, new ActivityStampService(db))` (xem `activities.service.ts:74`), `create({ type: "NOTE", body: "Hen goi lai thu Sau", planId }, B.id)`, rồi `timeline({ planId, filter: "all", limit: 30 })` và `timeline({ companyId, ... })`; có dòng đối chứng âm với một vết `buoc.giao`. E10 xoá công ty qua `CompaniesService.purge(id)` (dòng ~428) — dựng service như `record-delete.spec.ts` đang dựng.

Run → FAIL `An activity has to be about a company, a contact or a deal.`

- [ ] **Step 2: Sửa contracts**

`timelineInput`, `timelineCountsInput`, `activityCreateInput` thêm `planId: z.string().optional()`; `refine` thứ nhất thành `input.companyId || input.contactId || input.dealId || input.planId`, thông điệp thêm «or a 30-day plan»; `ALL_ACTIVITY_TYPES` thêm `ActivityType.PLAN_CHANGE`; entry output thêm `planId: z.string().nullable()`.

- [ ] **Step 3: Sửa service**

`anchor()`: dòng đầu `if (input.planId) return { planId: input.planId };`. `resolveCompanyId()`: nhánh `planId` đọc `onboardingPlan.findUnique({ select: { companyId: true } })`, không có → `NotFoundException`. `create()` ghi `planId: input.planId ?? null`. `ENTRY_SELECT` thêm `planId: true`. Kiểu `Pick<..., "companyId" | "contactId" | "dealId">` thêm `"planId"`.

- [ ] **Step 4: Chạy E9, E10 → PASS; phá thử**: bỏ nhánh `planId` trong `resolveCompanyId` → E9 dòng 3 đỏ với id ghi chú; đổi `onDelete: SetNull` cho `Activity.plan` (bản sao schema + `db push` vào DB test) → E10 dòng 1 đỏ. Hoàn lại.

- [ ] **Step 5: Commit** — `git commit -m "feat(activities): moc neo planId, ghi chu ke hoach tu mang cong ty"`

---

### Task 4: Đọc cho sheet, và tệp payload chung

**Phục vụ:** E20 (và dữ liệu cho E11, E19) · `independent: false`

**Files:**
- Modify: `apps/api/src/onboarding/onboarding.contracts.ts` (`planDetailOutput`), `onboarding.service.ts` (`planById`)
- Create: `apps/api/test/fixtures/ke-hoach-payload.json`
- Test: `apps/api/test/ke-hoach-ban-ghi.spec.ts` (`describe` `noi-man-buoc`)

**Interfaces — Produces:** `planDetailOutput = planOutput.extend({ companyName, company: { id, name, iconUrl, iconDarkUrl, iconTone }, owner: { id, name, image }, templateName: string | null, ngayThu, buocXong, buocTong, imNgay, tacO: string | null })`.

- [ ] **Step 1: Tệp payload** — nội dung đúng như sau (E19 khẳng định màn gửi đúng ba dòng này, E20 ghi chúng):

```json
[
	{ "thuTuc": "setStepDone", "dauVao": { "stepId": "S2", "done": true } },
	{ "thuTuc": "assignStep", "dauVao": { "stepId": "S2", "assigneeId": "A" } },
	{ "thuTuc": "rescheduleStep", "dauVao": { "stepId": "S2", "dueAt": "2026-09-25" } }
]
```

- [ ] **Step 2: E20 (đỏ → xanh)** — đọc tệp, thay `"S2"`/`"A"` bằng id thật, parse qua `stepDoneInput` · `stepAssignInput` · `stepRescheduleInput`, gọi service, đọc lại dòng 2 và dòng 1 theo `expected`. Phá thử: `stepRescheduleInput.dueAt` thành `z.date()` → đỏ ghim `rescheduleStep`.

- [ ] **Step 3: `planById` mở rộng** — `include` thêm `company: { select: { id, name, iconUrl, iconDarkUrl, iconTone } }`, `owner: { select: { id, name, image } }`, `template: { select: { name: true } }`, `steps` với đúng `select` mà `taiTap` dùng; dải số lấy từ `dungHang(plan, new Date())` — không tính lại.

- [ ] **Step 4: Commit** — `git commit -m "feat(onboarding): planById tra dai so tu dungHang, tep payload chung cho man va may chu"`

---

### Task 5: `plan` là loại bản ghi thứ tư

**Phục vụ:** E11, E12 · `independent: false`

**Files:**
- Modify: `apps/app/components/crm/record-sheet/record-stack.ts:13`, `record-sheet-host.tsx:28-38`, `record-prefetch.ts`, `apps/app/lib/trpc/cache.ts`, `apps/app/app/(app)/[slug]/onboarding/[planId]/page.tsx`, `danh-muc-table.tsx:270`, `danh-muc-bang-cot.tsx` (chỗ gọi `hrefCua`)
- Create: `apps/app/test/ke-hoach-chuyen-huong.spec.ts`

**Interfaces:**
- Produces: `RECORD_KINDS = ["company", "contact", "deal", "plan"]`; `useCrmCache().plan(id?: string, options?)`.
- Consumes: `PlanSheet({ planId }: { planId: string })` (Task 6 — Task 5 thêm nhánh host sau khi Task 6 có tệp; thứ tự thực thi 5 → 6 giữ nhánh host ở cuối Task 6).

- [ ] **Step 1: E12 (đỏ)** — `ke-hoach-chuyen-huong.spec.ts` nhập `default` của trang `[planId]/page.tsx`, gọi với `params: Promise.resolve({ slug: "onehub", planId: "P" })`, bắt lỗi `NEXT_REDIRECT` và so `digest` chứa `recordHref("onehub", "/onboarding", "plan", "P")` (theo đúng cách `deals/[dealId]` đang được kiểm nếu kho có; không có thì đọc `err.digest.split(";")[2]`). Đối chứng: `planId` khác → đích khác.

- [ ] **Step 2: Trang cũ thành chuyển hướng** — thay toàn bộ `[planId]/page.tsx` bằng bản sao hình `deals/[dealId]/page.tsx` với `"/onboarding"` và `"plan"`.

- [ ] **Step 3: `RECORD_KINDS` · prefetch · cache**
  - `record-stack.ts`: thêm `"plan"`.
  - `record-prefetch.ts`: `case "plan": void queryClient.prefetchQuery(trpc.onboarding.planById.queryOptions({ id })); break;`
  - `cache.ts`: `plan: (id, options) => run([id ? trpc.onboarding.planById.queryKey({ id }) : trpc.onboarding.planById.queryKey()], [trpc.onboarding.listSteps.queryKey(), trpc.onboarding.listEnrollments.queryKey(), trpc.onboarding.manDanhMuc.queryKey(), trpc.onboarding.bangCot.queryKey(), ...activityKeys(), trpc.companies.byId.queryKey()], options)` — cùng hình các mục `company`/`deal`.
  - Mọi `switch`/`Record<RecordKind, …>` đòi thêm nhánh (`record-actions.tsx` `RECORD_PROCEDURES`, `lib/agent-record.ts`…) — `check-types` gọi tên từng chỗ. `RECORD_PROCEDURES` và `agent-record` KHÔNG thêm `plan`: đổi kiểu của chúng sang `Record<Exclude<RecordKind, "plan">, …>` (kế hoạch có menu riêng, không tab Agent — d-…-3, d-…-8).

- [ ] **Step 4: Bấm hàng / thẻ → `openRecord`** — `danh-muc-table.tsx:270` `onRowClick={(hang) => openRecord({ kind: "plan", id: hang.id })}`, thêm `onRowHover`/prefetch theo cách `deals-table.tsx` đang làm; bỏ `router` và `hrefCua` nếu không còn ai dùng; bảng cột đổi tương tự.

- [ ] **Step 5: E12 xanh; commit** — `git commit -m "feat(app): ke hoach la loai ban ghi thu tu, duong cu chuyen huong"`

---

### Task 6: Sheet kế hoạch

**Phục vụ:** E11, E13, E15, E18, E19 · `independent: false`

**Files:**
- Create: `apps/app/lib/qua-han.ts`, `apps/app/test/qua-han-theo-ngay.spec.ts`
- Create: `apps/app/components/crm/record-sheet/plan-sheet.tsx`, `plan-steps.tsx`, `plan-brokers.tsx`
- Modify: `record-sheet-host.tsx`, `apps/app/lib/messages/onboarding.ts`
- Create: `apps/app/test/ke-hoach-sheet.dom.tsx`

**Interfaces:**
- Produces: `quaHan(dueAt: Date, completedAt: Date | null, now: Date): boolean`; `PlanSheet({ planId })`; `PlanSteps({ plan, steps })`; `PlanBrokers({ planId, closed })`.
- Consumes: `trpc.onboarding.*` (Task 2, 4), `useCrmCache().plan` (Task 5), `RecordSheetFrame` (`record-parts.tsx:21`), `OBac` · `ThemMoiGioi` · `DongMoKeHoach` (chuyển từ `[planId]/` sang `components/crm/record-sheet/plan/` — cùng tệp, đổi chỗ).

- [ ] **Step 1: E15 (đỏ → xanh)**

`apps/app/lib/qua-han.ts`:

```ts
import { toDay } from "@crm/ui/lib/format";

export function quaHan(dueAt: Date, completedAt: Date | null, now: Date): boolean {
	return completedAt === null && toDay(dueAt) < toDay(now);
}
```

`qua-han-theo-ngay.spec.ts` — ma trận ba dòng (D−1 true · D false · D+1 false) với `now = new Date(2026, 8, 22, 23, 30)` và `dueAt` là `00:00Z` của ngày tương ứng; đối chứng: D−1 đã xong → false. Phá thử: thân hàm thành `dueAt.getTime() < now.getTime()` → dòng D đỏ ghim `2026-09-22`.

- [ ] **Step 2: Chữ** — `onboardingMessages` thêm nhóm `sheet` (en + vi, cùng kiểu `OnboardingMessages`): `subtitle(khuon)` «Kế hoạch 30 ngày · khuôn {khuon}» · `companyLink` «Hồ sơ công ty» · `stats.{day,steps,silent,owner}` · `tabs.{steps,brokers,activity}` · `details` «Chi tiết» · `fields.{template,started,target,owner}` · `groupTitle(boPhan, xong, tong)` · `unassigned` «Chưa giao» · `overdue` «Quá hạn» · `row.{up,down,remove,more,markDone,markNotDone}` · `addStep` · `noSteps.{title,body}` · `closedNote(ngay)` «Đã đóng {ngay}» · `closedHint` «Kế hoạch đã đóng — mở lại để sửa.» · `menu.{close,reopen}` · `confirmClose.{title,body,action,cancel}` · `confirmRemoveStep.{title(nhan),body,action,cancel}` · `confirmRemoveBroker.{title(ten),body,action,cancel}` · `brokerColumns.{name,remove}`. Tên tiếng Anh cho `en` theo cùng nghĩa. Chạy `cd apps/app && bun test test/messages-guard.spec.ts` — xanh.

- [ ] **Step 3: `plan-sheet.tsx`** — hình bám sát `deal-sheet.tsx:131-265`: `useQuery(trpc.onboarding.planById)`, `useRecordSheetView("steps")`, `RecordSheetFrame` với `media` `EntityLogo` công ty, `title` tên công ty (`translate="no"`), `description` = `subtitle` + nút `companyLink` gọi `openRecord({ kind: "company", id })`, `note` = `closedNote` khi đóng, `actions` = menu `⋯` riêng (`DropdownMenu` một mục Đóng/Mở lại → `ConfirmDialog` → `closePlan`/`reopenPlan` → `onSuccess: () => cache.plan(planId)`), `stats` = bốn `DetailSheetStat` đọc thẳng `ngayThu/targetDays`, `buocXong/buocTong`, `imNgay`, `OwnerCell owner`. `tabs`: steps (`PlanSteps`), brokers (`PlanBrokers`), activity (`Timeline anchor={{ planId }}`). Không tab Agent.

- [ ] **Step 4: `plan-steps.tsx`** — mục `DetailSheetSection title={m.sheet.details}` với `DetailSheetProperties` (Khuôn · Bắt đầu · Mục tiêu · `InlineSelectField` Cầm trịch → `setPlanOwner`); rồi nhóm theo `departmentId` giữ thứ tự `position`, mỗi nhóm `DetailSheetSection title={m.sheet.groupTitle(...)}` chứa `<ul>` dòng bước, mỗi dòng: `Checkbox` (aria-label `markDone`/`markNotDone` + nhãn) → `setStepDone({ stepId: step.id, done })`; nhãn + `Badge variant="outline"` «Quá hạn» khi `quaHan(...)`; nút người (`Popover` + `Command` danh sách `trpc.users.list`) → `assignStep({ stepId: step.id, assigneeId })`; nút hạn (`Popover` + `Calendar`) → `rescheduleStep({ stepId: step.id, dueAt: toDay(ngay) })`; `DropdownMenu` Lên/Xuống/Bỏ bước → `reorderSteps` với mảng id đã hoán vị / `ConfirmDialog` → `removeStep`. Mọi `useMutation` có `onSuccess: () => cache.plan(plan.id)` và `onError: (e) => toast.error(e.message)`; nút khoá khi `isPending` hoặc kế hoạch đóng. `AddRow` «Thêm bước» cuối nhóm mở một hàng nhập nhãn + hạn, gửi `addStep` với `departmentId` của nhóm. Rỗng → `DetailSheetEmpty`.

> `stepId` LUÔN lấy từ `step` của chính dòng đang vẽ, trong closure của dòng — không bao giờ từ chỉ số hay phần tử đầu mảng (E19, lớp lỗi `dsGhiDanh[0]`).

- [ ] **Step 5: `plan-brokers.tsx`** — phễu bốn bậc giữ nguyên cách ghép `Progress` của `ho-so-ke-hoach.tsx`; `SimpleTable` cột Tên · bốn bậc (tiêu đề từ `m.bac`) · gỡ; ô bậc là `OBac`; nút gỡ `Close` trên từng hàng → `ConfirmDialog` với `m.sheet.confirmRemoveBroker.title(e.contactName)` → `removeEnrollment({ planId, contactId: e.contactId })` của CHÍNH hàng; nút khoá khi `isPending`; `onSuccess` → `cache.plan(planId)`; `AddRow` với `ThemMoiGioi`.

- [ ] **Step 6: Host** — `record-sheet-host.tsx` thêm `{shown?.kind === "plan" ? <PlanSheet key={recordKey(shown)} planId={shown.id} /> : null}`.

- [ ] **Step 7: E11, E13, E19 (dom) — đỏ trước Step 3–6, xanh sau**

`apps/app/test/ke-hoach-sheet.dom.tsx`, theo nếp `dieu-phoi-xoa-ghi-danh.dom.tsx` (bản giả `useTRPC` ghi `{ duong, dauVao }`, `QueryClientProvider`, `act`), thêm:
- bản giả `@/lib/trpc/cache` → `useCrmCache: () => ({ plan: (id) => daLamMoi.push(id), activity: () => {} })`;
- bản giả `nuqs` bằng `NuqsTestingAdapter` của `nuqs/adapters/testing` để đọc `record`.
Ba `describe` mang nhãn `mo-nhu-thoa-thuan` · `go-dung-nguoi` · `noi-man-buoc`, nội dung đúng `expected` của E11, E13, E19. E19 đọc `apps/api/test/fixtures/ke-hoach-payload.json` bằng `import payload from "../../api/test/fixtures/ke-hoach-payload.json"` và so `daGoi` (sau khi thay `S2`/`A` bằng id bản giả) bằng `toEqual`.

Run: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ke-hoach-sheet.dom.tsx`
Expected: PASS 3 describe. Chạy hai thứ tự với `dieu-phoi-xoa-ghi-danh.dom.tsx` (bài học `mock.module`) — cả hai xanh.

- [ ] **Step 8: E18** — `for t in …plan-sheet.tsx …plan-steps.tsx …plan-brokers.tsx; do node <design-gate> --target "$t" --mode static; done` (lệnh nguyên văn ở khoá `kh1_san_thiet_ke`) → mã 0. Phá thử: thêm một `Button size="icon-sm"` không `aria-label` → khác 0 và in tên tệp.

- [ ] **Step 9: Commit** — `git commit -m "feat(app): sheet ke hoach — buoc giao/xong/han tren dong, moi gioi go dung hang"`

---

### Task 7: Câu cho vết trên dòng thời gian

**Phục vụ:** E16 · `independent: false`

**Files:**
- Modify: `apps/app/components/crm/timeline/timeline.tsx:33` (`TimelineAnchor` thêm `| { planId: string }`), `timeline-entry.tsx` (`anchorId`, nhánh `PLAN_CHANGE`), `activity-composer.tsx` (truyền `planId`)
- Create: `apps/app/components/crm/timeline/plan-change-line.ts`
- Modify: `apps/app/lib/messages/onboarding.ts` (nhóm `vet`)
- Test: `apps/app/test/ke-hoach-sheet.dom.tsx` (`describe` `ve-vet-ke-hoach`)

**Interfaces — Produces:** `cauVet(meta: OnboardingActivityMeta, m: OnboardingMessages["vet"], locale: Locale): string` — hàm thuần; `TimelineEntry` gọi nó khi `entry.type === "PLAN_CHANGE"` sau `onboardingActivityMeta.safeParse(entry.meta)`; hỏng → `m.vet.khongDoc` «Thay đổi kế hoạch không đọc được».

- [ ] **Step 1: E16 (đỏ)** — ma trận 10 dòng viết trước, fixture dựng bằng `vet.*` của `@crm/validation/onboarding-activity` (không dựng `meta` tay), vẽ `TimelineEntry` với `anchor={{ planId: "P" }}`, mỗi dòng một `expect` trên `textContent`: có tên người tạo, có nhãn bước với `buoc.*`, không khớp `/undefined|null|\d{4}-\d{2}-\d{2}T/`; thêm dòng `STAGE_CHANGE` và dòng meta hỏng.

- [ ] **Step 2: `cauVet`** — `switch (meta.kind)` đủ chín nhánh, không `default` (kiểu `never` cho nhánh thừa); ngày hiển thị qua `formatDay(meta.tu, locale)`; `buoc.giao` với `den === null` → «bỏ giao «{nhan}»»; chuỗi mẫu trong `m.vet` (en + vi).

- [ ] **Step 3: Nối vào `TimelineEntry`** — `headline` thêm nhánh `PLAN_CHANGE`; `anchorId` thêm `planId`; `ActivityIcon` có biểu tượng cho `PLAN_CHANGE` (đã thêm ở Task 1 Step 6). Composer truyền `planId` khi anchor có `planId`.

- [ ] **Step 4: E16 xanh; phá thử**: xoá nhánh `buoc.giao` → dòng `buoc.giao` đỏ ghim tên kind; cho `PLAN_CHANGE` đi qua `stageChange.parse` → mọi dòng kế hoạch đỏ. Hoàn lại.

- [ ] **Step 5: Commit** — `git commit -m "feat(app): dong thoi gian ve vet ke hoach thanh cau tieng Viet"`

---

### Task 8: Dọn trang hồ sơ cũ và bài kiểm vòng một

**Phục vụ:** giữ E12 của vòng một (`dieu-phoi-30-ngay-dau`) xanh · `independent: false`

**Files:**
- Delete: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
- Move: `o-bac.tsx`, `them-moi-gioi.tsx`, `dong-mo-ke-hoach.tsx` → `apps/app/components/crm/record-sheet/plan/` (nếu Task 6 chưa chuyển)
- Modify: `apps/app/test/dieu-phoi-xoa-ghi-danh.dom.tsx` — nhập `PlanBrokers` thay cho `HoSoKeHoach`, bổ sung bản giả `planById`/`cache`; mọi khẳng định giữ nguyên nghĩa (có hộp xác nhận, gọi `onboarding.removeEnrollment`, không gọi `upsertEnrollment`)
- Modify: `apps/app/app/proto/_modules/dieu-phoi-30-ngay-dau/*` chỉ khi `check-types` đòi

- [ ] **Step 1:** Xoá, chuyển, sửa nhập. **Step 2:** `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dieu-phoi-xoa-ghi-danh.dom.tsx` → xanh; chạy khoá `dp30_xoa_co_xac_nhan` nguyên văn trong `_acceptance/config.yaml` → mã 0. **Step 3:** Commit — `git commit -m "refactor(app): bo trang ho so ke hoach cu, bai kiem vong mot doi nha sang PlanBrokers"`

> Tệp này nằm trong `paths` của E12 vòng một, nên hồ sơ `dieu-phoi-30-ngay-dau` sẽ phải ghim lại. Việc ghim làm ở Task 9, một lượt duy nhất ở tip — không làm ở đây (bài học «ghim lại đi cuối cùng»).

---

### Task 9: Năm lệnh chứng minh và khép S3

**Phục vụ:** mọi eval · `independent: false`

- [ ] **Step 1:** Từ gốc kho: `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build` — cả năm mã 0. Đỏ ở `lint:slop` hay `build` thì sửa tại chỗ, không `--no-verify`.
- [ ] **Step 2:** Chạy từng khoá `kh1_*` của `_acceptance/config.yaml` nguyên văn — mỗi khoá mã 0 (E17 là ui-check, để S4).
- [ ] **Step 3:** Rà sổ quyết định: thêm dòng `approach` S2 cho `tuTen`/`denTen` (lệch design có tên ở Task 1) và dòng `fix` S3 cho mọi lần buộc đổi hướng.
- [ ] **Step 4:** Đặt `contract.md` `status: implemented`; commit; sang S4.
- [ ] **Step 5 (sau S4, trước PR):** Ghim lại hồ sơ bị chạm `paths` — ít nhất `dieu-phoi-30-ngay-dau` (E12 vòng một đo `dieu-phoi-xoa-ghi-danh.dom.tsx`), và mọi hồ sơ `signed-off` khác mà `pre-merge-check.sh --base origin/onehub` gọi tên — bằng MỘT lượt `repin-lane.mjs` ở tip.

## Tự rà

- **Phủ spec:** §2 dữ liệu → Task 1 · §3 thủ tục ghi → Task 2 · mốc neo → Task 3 · đọc mở rộng → Task 4 · §5 lối vào → Task 5 · sheet → Task 6 · vết thành câu → Task 7 · Ngoài-5 (làm mới qua lối chung) → Task 5 `cache.plan` + E19 · CONTEXT.md → Task 1 Step 7.
- **Phủ evals:** E1–E8, E14 → Task 2 · E9, E10 → Task 3 · E20 → Task 4 · E12 → Task 5 · E11, E13, E15, E18, E19 → Task 6 · E16 → Task 7 · E17 → S4 (ui-check).
- **Tên nhất quán:** `vet.*`, `parseOnboardingActivityMeta`, `vetCoCongTy` (Task 1) dùng đúng tên ở Task 2, 7; `CHON_BUOC`/`buocRa` sống ở `onboarding-ghi.ts`, service nhập từ đó; `quaHan` ở Task 6 là tên duy nhất.
- **Điểm phải kiểm lúc thi công, đã ghi trong task:** tên quan hệ thành viên của `User` (Task 2 Step 4); cách kho kiểm `redirect` của Next (Task 5 Step 1); khoá `NuqsTestingAdapter` có trong phiên bản `nuqs` đang cài (Task 6 Step 7).
