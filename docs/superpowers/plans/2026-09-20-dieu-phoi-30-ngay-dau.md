# Điều phối 30 ngày đầu — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cả đội OneHub điều phối ba mươi ngày đầu của một đối tác mới ngay trong CRM — khuôn kế hoạch theo loại đối tác, bước có người và có hạn, phễu theo dõi từng môi giới — thay cho Google Sheet.

**Architecture:** Năm bảng mới đứng cạnh, nối vào `Company` và `Contact` bằng khoá ngoài; không sửa bảng nào đang chạy. Bước của khuôn lưu ở một cột Json có schema Zod, parse tại chỗ đọc (nếp `AgentManifest`). Mặt dữ liệu đi tRPC theo nếp `campaigns`; một điểm nhận REST riêng nhận lô số liệu từ nền tảng, sao hình `ListingsController`.

**Tech Stack:** Prisma + Postgres · NestJS + nestjs-trpc · Zod ở `packages/validation` · Next.js App Router + `@crm/ui` (shadcn) · `nuqs` cho trạng thái trong đường dẫn · bun test.

**Spec:** `docs/superpowers/specs/2026-09-20-dieu-phoi-30-ngay-dau-design.md`
**Hợp đồng:** `_acceptance/dieu-phoi-30-ngay-dau/contract.md` (14 tiêu chí) · **Bộ đo:** `_acceptance/dieu-phoi-30-ngay-dau/evals.yaml` (15 eval)

## Global Constraints

- **Không viết chú thích trong code.** Không cho code mới, không cho code sửa (`AGENTS.md`).
- **Trí khôn sống ở `apps/agent`, không ở API.** API không khớp danh tính, không chấm điểm, không làm giàu — nó ghi một hàng `AgentTask` rồi để tác nhân quyết.
- **Một `.env` duy nhất ở gốc.** Biến mới khai ở `.env.example` kèm một dòng nói nó làm gì, VÀ ở `apps/api/src/config/env.validation.ts`.
- **Thứ tự-host có thể không có thì không bao giờ ném.** Thiếu khoá = mất một năng lực, không sập module.
- **`/packages/ui` là nguồn duy nhất của giao diện.** Chỉ dùng component chung; biến thể mới dựng ở đó, không đè `className` ở chỗ gọi.
- **Parse tại biên.** Dữ liệu chưa kiểu (cột Json, thân gói webhook) parse thành kiểu miền bằng Zod ngay khi vào; cấm chuyền `Record<string, unknown>`.
- **Hằng số theo vùng, một file.** Mọi số chỉnh được của vòng này sống ở `apps/api/src/onboarding/onboarding-config.ts`, `as const`.
- **Component khách không được nhập gói máy chủ.** `@crm/auth` và `@crm/db` là gói máy chủ; trang máy chủ tính, component khách nhận dữ liệu đã xong.
- **Router mỏng.** Zod vào, gọi dịch vụ ra; Prisma sống ở `*.service.ts`. Thủ tục danh sách nhận `listInput`, trả `{ rows, total, facetCounts }`.
- **Sinh phép đo phải có cặp hai chiều.** Mỗi bài kiểm mới chỉ tính là xong khi có cả chiều xanh lẫn chiều đỏ trên CÙNG một fixture, và chiều đỏ ghim thông điệp có tên.
- **Năm lệnh chứng của kho:** `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build`.

---

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `packages/db/prisma/schema.prisma` | Năm model mới: `Department`, `OnboardingTemplate`, `OnboardingPlan`, `OnboardingStep`, `OnboardingEnrollment` |
| `packages/validation/src/onboarding-template.ts` | Schema Zod cho cột `steps` của khuôn + hàm parse |
| `packages/validation/src/onboarding-ingest.ts` | Schema Zod cho lô số liệu từ nền tảng + hàm parse. **Đây là bản hợp đồng đưa đội nền tảng** |
| `apps/api/src/onboarding/onboarding-config.ts` | Mọi số chỉnh được: ngày mặc định, trần lô, ngưỡng nguội |
| `apps/api/src/onboarding/onboarding.contracts.ts` | Zod cho mặt tRPC |
| `apps/api/src/onboarding/onboarding.service.ts` | Prisma: bộ phận, khuôn, kế hoạch, bước, ghi danh |
| `apps/api/src/onboarding/onboarding.router.ts` | Mặt tRPC, mỏng |
| `apps/api/src/onboarding/onboarding-ingest.service.ts` | Nhận lô, khớp mã, ghi hoặc chuyển tác nhân |
| `apps/api/src/onboarding/onboarding.controller.ts` | Điểm nhận REST `POST /internal/onboarding/ingest` |
| `apps/api/src/onboarding/onboarding.module.ts` | Nối dây |
| `apps/app/app/(app)/[slug]/onboarding/page.tsx` | Màn danh mục (máy chủ tính) |
| `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx` | Bảng danh mục (khách) |
| `apps/app/app/(app)/[slug]/onboarding/[planId]/page.tsx` | Hồ sơ kế hoạch |
| `apps/app/app/(app)/[slug]/settings/onboarding/page.tsx` | Cài đặt: khuôn + bộ phận |
| `_acceptance/dieu-phoi-30-ngay-dau/rang/hang-so-o-config.mjs` | Thước AST cho AC-10 |

Bài kiểm: `apps/api/test/dieu-phoi.spec.ts` · `apps/api/test/dieu-phoi-diem-nhan.spec.ts` · `apps/app/test/dieu-phoi-trang-thai.spec.ts`

---

### Task 1: Lược đồ — năm bảng mới

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/<timestamp>_dieu_phoi_30_ngay/migration.sql` (do `prisma migrate dev` sinh)
- Test: `apps/api/test/dieu-phoi.spec.ts`

**Interfaces:**
- Consumes: `Company`, `Contact`, `User` đã có.
- Produces: năm model; các task sau dùng `prisma.onboardingPlan`, `prisma.onboardingStep`, `prisma.onboardingEnrollment`, `prisma.onboardingTemplate`, `prisma.department`.

- [ ] **Step 1: Thêm model vào lược đồ**

```prisma
model Department {
  id       String @id @default(cuid())
  name     String
  position Int

  archivedAt DateTime?
  steps      OnboardingStep[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([position])
  @@map("department")
}

model OnboardingTemplate {
  id          String  @id @default(cuid())
  name        String
  partnerType String?
  steps       Json

  archivedAt DateTime?
  plans      OnboardingPlan[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("onboardingTemplate")
}

model OnboardingPlan {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  templateId String?
  template   OnboardingTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)

  startedAt  DateTime
  targetDays Int
  closedAt   DateTime?

  ownerId String
  owner   User   @relation("OnboardingPlanOwner", fields: [ownerId], references: [id])

  steps       OnboardingStep[]
  enrollments OnboardingEnrollment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([companyId, startedAt])
  @@index([closedAt])
  @@index([ownerId])
  @@map("onboardingPlan")
}

model OnboardingStep {
  id     String         @id @default(cuid())
  planId String
  plan   OnboardingPlan @relation(fields: [planId], references: [id], onDelete: Cascade)

  label        String
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id], onDelete: Restrict)

  assigneeId String?
  assignee   User?   @relation("OnboardingStepAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)

  dueAt       DateTime
  completedAt DateTime?
  position    Int

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([planId, position])
  @@index([departmentId])
  @@index([assigneeId])
  @@index([completedAt])
  @@map("onboardingStep")
}

model OnboardingEnrollment {
  id     String         @id @default(cuid())
  planId String
  plan   OnboardingPlan @relation(fields: [planId], references: [id], onDelete: Cascade)

  contactId String
  contact   Contact @relation(fields: [contactId], references: [id], onDelete: Cascade)

  accountAt DateTime?
  courseAt  DateTime?
  activeAt  DateTime?
  dealAt    DateTime?

  source String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([planId, contactId])
  @@index([planId])
  @@index([contactId])
  @@map("onboardingEnrollment")
}
```

Thêm quan hệ ngược vào các model đã có: `Company` nhận `onboardingPlans OnboardingPlan[]`; `Contact` nhận `onboardingEnrollments OnboardingEnrollment[]`; `User` nhận `onboardingPlansOwned OnboardingPlan[] @relation("OnboardingPlanOwner")` và `onboardingStepsAssigned OnboardingStep[] @relation("OnboardingStepAssignee")`.

- [ ] **Step 2: Sinh migration và client**

Run: `cd packages/db && bunx prisma migrate dev --name dieu_phoi_30_ngay && bun run db:generate`
Expected: migration mới dưới `prisma/migrations/`, client sinh lại, không lỗi.

- [ ] **Step 3: Bài kiểm đỏ — bảng phải tồn tại và ràng buộc phải cắn**

```ts
import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";

describe("dieu-phoi luoc do", () => {
  test("ghi danh duy nhat theo cap ke hoach va ca nhan", async () => {
    const { planId, contactId } = await gieoKeHoachVaCaNhan();
    await db.onboardingEnrollment.create({ data: { planId, contactId, source: "tay" } });
    await expect(
      db.onboardingEnrollment.create({ data: { planId, contactId, source: "tay" } }),
    ).rejects.toThrow();
  });

  test("bon bac la moc thoi gian, khong phai Boolean", async () => {
    const { planId, contactId } = await gieoKeHoachVaCaNhan();
    const row = await db.onboardingEnrollment.create({
      data: { planId, contactId, source: "tay", accountAt: new Date() },
    });
    expect(row.accountAt).toBeInstanceOf(Date);
    expect(typeof row.accountAt).not.toBe("boolean");
  });
});
```

- [ ] **Step 4: Chạy — phải XANH sau migration, và ĐỎ nếu bỏ ràng buộc**

Run: `bun run test -- "cd apps/api && bun test test/dieu-phoi.spec.ts -t luoc-do"`
Expected: PASS. Chiều đỏ: gỡ `@@unique([planId, contactId])` khỏi lược đồ, migrate lại → bài kiểm thứ nhất phải ĐỎ với thông điệp ghim tên ràng buộc. Khôi phục.

- [ ] **Step 5: Commit**

```bash
git add packages/db/prisma apps/api/test/dieu-phoi.spec.ts
git commit -m "feat(db): nam bang cho dieu phoi 30 ngay dau"
```

---

### Task 2: Schema biên — khuôn và lô số liệu

**Files:**
- Create: `packages/validation/src/onboarding-template.ts`
- Create: `packages/validation/src/onboarding-ingest.ts`
- Test: `packages/validation/test/onboarding.spec.ts`

**Interfaces:**
- Produces: `parseOnboardingTemplateSteps(value: unknown): OnboardingTemplateStep[]` · `parseOnboardingBatch(value: unknown): OnboardingBatch` · hằng `ONBOARDING_BATCH_MAX_ITEMS`.

- [ ] **Step 1: Bài kiểm đỏ cho schema khuôn**

```ts
import { describe, expect, test } from "bun:test";
import { parseOnboardingTemplateSteps } from "@crm/validation/onboarding-template";

test("buoc cua khuon phai co nhan, bo phan, thu tu, lech ngay", () => {
  const ok = [{ label: "Ky bien ban", departmentId: "d1", position: 0, offsetDays: 2 }];
  expect(parseOnboardingTemplateSteps(ok)).toHaveLength(1);
  expect(() => parseOnboardingTemplateSteps([{ label: "Thieu bo phan", position: 0 }])).toThrow();
});
```

- [ ] **Step 2: Chạy để thấy nó đỏ**

Run: `cd packages/validation && bun test test/onboarding.spec.ts`
Expected: FAIL — module chưa tồn tại.

- [ ] **Step 3: Viết schema**

```ts
import { z } from "zod";
import { parse } from "./index";

export const onboardingTemplateStep = z.object({
  label: z.string().trim().min(1).max(200),
  departmentId: z.string().trim().min(1),
  position: z.int().min(0).max(200),
  offsetDays: z.int().min(0).max(365),
});

export const onboardingTemplateSteps = z.array(onboardingTemplateStep).min(1).max(100);

export type OnboardingTemplateStep = z.infer<typeof onboardingTemplateStep>;

export function parseOnboardingTemplateSteps(value: unknown): OnboardingTemplateStep[] {
  return parse(onboardingTemplateSteps, value, "onboarding-template.steps");
}
```

```ts
import { z } from "zod";
import { parse } from "./index";

export const ONBOARDING_BATCH_MAX_ITEMS = 500;

export const onboardingIngestItem = z.object({
  platformBrokerId: z.string().trim().min(1).max(120),
  accountAt: z.iso.datetime().nullable(),
  courseAt: z.iso.datetime().nullable(),
  activeAt: z.iso.datetime().nullable(),
  dealAt: z.iso.datetime().nullable(),
});

export const onboardingBatch = z.object({
  source: z.literal("onehub-platform"),
  planId: z.string().trim().min(1),
  observedAt: z.iso.datetime(),
  items: z.array(onboardingIngestItem).min(1).max(ONBOARDING_BATCH_MAX_ITEMS),
});

export type OnboardingBatch = z.infer<typeof onboardingBatch>;

export function parseOnboardingBatch(value: unknown): OnboardingBatch {
  return parse(onboardingBatch, value, "onboarding-ingest.batch");
}
```

Thêm hai subpath vào `exports` của `packages/validation/package.json` theo đúng nếp `listing-ingest`.

- [ ] **Step 4: Chạy lại**

Run: `cd packages/validation && bun test test/onboarding.spec.ts`
Expected: PASS. Chiều đỏ trên cùng fixture: bỏ `.min(1)` của `departmentId` → bài kiểm thứ hai phải đỏ.

- [ ] **Step 5: Commit**

```bash
git add packages/validation
git commit -m "feat(validation): schema bien cho khuon va lo so lieu nen tang"
```

---

### Task 3: Hằng số và module xương — bộ phận

**Files:**
- Create: `apps/api/src/onboarding/onboarding-config.ts`, `onboarding.contracts.ts`, `onboarding.service.ts`, `onboarding.router.ts`, `onboarding.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Test: `apps/api/test/dieu-phoi.spec.ts`

**Interfaces:**
- Produces: `ONBOARDING` config object · `OnboardingService.listDepartments/createDepartment/updateDepartment/reorderDepartments/archiveDepartment`.

- [ ] **Step 1: Viết config**

```ts
const DAY_MS = 24 * 60 * 60 * 1000;

export const ONBOARDING = {
  plan: { defaultTargetDays: 30 },
  stale: { warnAfterMs: 7 * DAY_MS },
  ingest: { maxItemsPerBatch: 500 },
} as const;
```

- [ ] **Step 2: Bài kiểm đỏ — đổi tên bộ phận không làm bước mất bộ phận (AC-8)**

```ts
test("doi-ten-bo-phan: ba buoc van tro dung bo phan", async () => {
  const dep = await service.createDepartment({ name: "Ky thuat" });
  const planId = await gieoKeHoachVoiBaBuoc(dep.id);
  await service.updateDepartment(dep.id, { name: "Ky thuat va Du lieu" });
  const steps = await db.onboardingStep.findMany({
    where: { planId },
    include: { department: true },
  });
  expect(steps).toHaveLength(3);
  expect(steps.every((s) => s.departmentId === dep.id)).toBe(true);
  expect(steps.every((s) => s.department.name === "Ky thuat va Du lieu")).toBe(true);
  expect(steps.some((s) => s.departmentId === null)).toBe(false);
});
```

- [ ] **Step 3: Chạy để thấy đỏ**

Run: `bun run test -- "cd apps/api && bun test test/dieu-phoi.spec.ts -t doi-ten-bo-phan"`
Expected: FAIL — dịch vụ chưa tồn tại.

- [ ] **Step 4: Viết dịch vụ và router cho bộ phận**

Dịch vụ giữ Prisma; router mỏng, `@Router({ alias: "onboarding" })` + `@UseMiddlewares(AuthMiddleware)`. Nối `OnboardingModule` vào `AppModule`.

- [ ] **Step 5: Chạy lại + chiều đỏ**

Run: lệnh ở Step 3.
Expected: PASS. Chiều đỏ: đổi cột `departmentId` sang cột chuỗi `departmentName` → dòng khẳng định tên mới phải đỏ với thông điệp ghim tên cũ và tên mới.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/onboarding apps/api/src/app.module.ts apps/api/test/dieu-phoi.spec.ts
git commit -m "feat(api): module dieu phoi + bo phan quan tri tu them"
```

---

### Task 4: Khuôn và tạo kế hoạch — chép, không tham chiếu (AC-1, AC-2, AC-14)

**Files:**
- Modify: `apps/api/src/onboarding/onboarding.service.ts`, `onboarding.router.ts`, `onboarding.contracts.ts`
- Test: `apps/api/test/dieu-phoi.spec.ts`

**Interfaces:**
- Consumes: `parseOnboardingTemplateSteps` (Task 2), `ONBOARDING` (Task 3).
- Produces: `createFromTemplate(input: { companyId, templateId, startedAt, ownerId }): Promise<OnboardingPlan>`.

- [ ] **Step 1: Ba bài kiểm đỏ**

```ts
test("chep-khong-tham-chieu: sua nhan trong khuon khong dong ke hoach", async () => {
  const tpl = await service.createTemplate({ name: "Sàn môi giới", partnerType: "moi-gioi", steps: baBuoc });
  const plan = await service.createFromTemplate({ companyId, templateId: tpl.id, startedAt, ownerId });
  await service.updateTemplate(tpl.id, { steps: baBuocSuaNhanThuHai });
  const steps = await db.onboardingStep.findMany({ where: { planId: plan.id }, orderBy: { position: "asc" } });
  expect(steps).toHaveLength(3);
  expect(steps[1].label).toBe(baBuoc[1].label);
});

test("buoc-chua-giao: van mang bo phan va van loc ra duoc", async () => {
  const plan = await service.createFromTemplate({ companyId, templateId, startedAt, ownerId });
  const step = await db.onboardingStep.findFirst({ where: { planId: plan.id } });
  expect(step?.departmentId).toBe(depId);
  expect(step?.assigneeId).toBeNull();
  const { rows } = await service.listSteps({ planId: plan.id, departmentId: depId });
  expect(rows.map((r) => r.id)).toContain(step?.id);
});

test("nguoi-cam-trich: ownerId khac rong va cong thuc dem tra ve 1", async () => {
  const plan = await service.createFromTemplate({ companyId, templateId, startedAt, ownerId });
  const doc = await db.onboardingPlan.findUniqueOrThrow({ where: { id: plan.id } });
  expect(doc.ownerId).toBe(ownerId);
  const dem = await db.onboardingPlan.count({ where: { ownerId: { not: undefined }, steps: { some: {} } } });
  expect(dem).toBe(1);
  const truoc = await db.onboardingPlan.count();
  await expect(service.createFromTemplate({ companyId, templateId, startedAt })).rejects.toThrow();
  expect(await db.onboardingPlan.count()).toBe(truoc);
});
```

- [ ] **Step 2: Chạy để thấy cả ba đỏ**

Run: `bun run test -- "cd apps/api && bun test test/dieu-phoi.spec.ts -t 'chep-khong-tham-chieu|buoc-chua-giao|nguoi-cam-trich'"`
Expected: FAIL ×3.

- [ ] **Step 3: Viết `createFromTemplate`**

Trong một giao dịch: đọc khuôn, `parseOnboardingTemplateSteps(template.steps)`, tạo `OnboardingPlan` với `targetDays: ONBOARDING.plan.defaultTargetDays`, rồi `createMany` các `OnboardingStep` với `label` và `departmentId` **chép** từ bước khuôn, `dueAt = startedAt + offsetDays`, `assigneeId: null`. `ownerId` bắt buộc trong contract Zod — thiếu thì Zod ném trước khi chạm DB.

- [ ] **Step 4: Chạy lại + ba chiều đỏ**

Expected: PASS ×3. Chiều đỏ lần lượt: (a) đổi sang lưu `templateStepId` thay vì chép nhãn → bài một đỏ; (b) bỏ `departmentId` khi bước không có người → bài hai đỏ; (c) bỏ `ownerId` khỏi dữ liệu ghi → bài ba đỏ.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/onboarding apps/api/test/dieu-phoi.spec.ts
git commit -m "feat(api): tao ke hoach tu khuon bang cach chep buoc"
```

---

### Task 5: Danh mục, đóng kế hoạch, và phễu (AC-3, AC-4, AC-13)

**Files:**
- Modify: `apps/api/src/onboarding/onboarding.service.ts`, `onboarding.router.ts`, `onboarding.contracts.ts`
- Test: `apps/api/test/dieu-phoi.spec.ts`

**Interfaces:**
- Produces: `listPlans(input: ListInput & { departmentId?: string; status?: "dang-chay" | "da-dong" }): Promise<{ rows, total, facetCounts }>` · `closePlan(id: string)` · `markEnrollmentStage(id, stage, at)`.

- [ ] **Step 1: Ba bài kiểm đỏ**

```ts
test("danh-muc-loc: chi ke hoach khop, total nhat quan, so ngay im dung", async () => {
  await gieoHaiKeHoachHaiBoPhan({ imNgayCuaCaiDau: 9 });
  const { rows, total, facetCounts } = await service.listPlans({ departmentId: depA });
  expect(rows).toHaveLength(1);
  expect(total).toBe(1);
  expect(facetCounts.department[depA]).toBe(1);
  expect(rows[0].imNgay).toBe(9);
  const rong = await service.listPlans({ departmentId: depKhongCoGi });
  expect(rong.rows).toHaveLength(0);
  expect(rong.total).toBe(0);
});

test("bac-la-moc-ngay: danh dau ghi mot moc, go tra ve rong", async () => {
  const e = await service.upsertEnrollment({ planId, contactId, source: "tay" });
  expect(e.accountAt).toBeNull();
  const sau = await service.markEnrollmentStage(e.id, "accountAt", new Date());
  const doc = await db.onboardingEnrollment.findUniqueOrThrow({ where: { id: e.id } });
  expect(doc.accountAt).toBeInstanceOf(Date);
  expect(Date.now() - doc.accountAt.getTime()).toBeLessThan(60_000);
  await service.markEnrollmentStage(e.id, "accountAt", null);
  expect((await db.onboardingEnrollment.findUniqueOrThrow({ where: { id: e.id } })).accountAt).toBeNull();
});

test("dong-ke-hoach: con buoc do van dong duoc va roi danh muc mac dinh", async () => {
  const plan = await gieoKeHoachBaBuocMotXong();
  await service.closePlan(plan.id);
  const doc = await db.onboardingPlan.findUniqueOrThrow({ where: { id: plan.id } });
  expect(doc.closedAt).toBeInstanceOf(Date);
  const do_ = await db.onboardingStep.findMany({ where: { planId: plan.id, completedAt: null } });
  expect(do_).toHaveLength(2);
  const macDinh = await service.listPlans({});
  expect(macDinh.rows.map((r) => r.id)).not.toContain(plan.id);
  const daDong = await service.listPlans({ status: "da-dong" });
  expect(daDong.rows.map((r) => r.id)).toContain(plan.id);
});
```

- [ ] **Step 2: Chạy để thấy đỏ**

Run: `bun run test -- "cd apps/api && bun test test/dieu-phoi.spec.ts -t 'danh-muc-loc|bac-la-moc-ngay|dong-ke-hoach'"`
Expected: FAIL ×3.

- [ ] **Step 3: Viết ba thủ tục**

`listPlans` lọc trong Prisma (`where.steps.some.departmentId`), mặc định `closedAt: null`, tính `imNgay` từ `max(step.updatedAt)` so với hiện tại, trả `facetCounts` bằng `groupBy`. `closePlan` chỉ ghi `closedAt`, không đụng bước. `markEnrollmentStage` nhận tên bậc từ một enum Zod đóng.

- [ ] **Step 4: Chạy lại + ba chiều đỏ**

Expected: PASS ×3. Chiều đỏ: (a) bỏ mệnh đề lọc khỏi truy vấn → bài một đỏ ghim số hàng; (b) đổi cột sang Boolean → bài hai đỏ ghim tên cột và kiểu; (c) bỏ mệnh đề loại kế hoạch đã đóng khỏi bộ lọc mặc định → bài ba đỏ ghim mã kế hoạch.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/onboarding apps/api/test/dieu-phoi.spec.ts
git commit -m "feat(api): danh muc ke hoach, dong ke hoach, moc bac cua ghi danh"
```

---

### Task 6: Điểm nhận dữ liệu từ nền tảng (AC-5, AC-6, AC-7)

**Files:**
- Create: `apps/api/src/onboarding/onboarding-ingest.service.ts`, `onboarding.controller.ts`
- Modify: `apps/api/src/onboarding/onboarding.module.ts`, `apps/api/src/config/env.validation.ts`, `.env.example`, `docs/api.md`
- Test: `apps/api/test/dieu-phoi-diem-nhan.spec.ts`

**Interfaces:**
- Consumes: `parseOnboardingBatch` (Task 2), `AgentTriggerService` đã có.
- Produces: `POST /internal/onboarding/ingest` trả `{ khop: number, chuyenTacNhan: number }`.

- [ ] **Step 1: Ba bài kiểm đỏ**

```ts
test("lo-sai-tu-choi-tron: mot muc hong thi khong muc nao duoc ghi", async () => {
  const truoc = await db.onboardingEnrollment.count();
  const truocTask = await db.agentTask.count();
  const res = await goiDiemNhan(loBaMucMucHaiThieuTruong);
  expect(res.status).toBe(400);
  expect(res.body.message).toContain("platformBrokerId");
  expect(await db.onboardingEnrollment.count()).toBe(truoc);
  expect(await db.agentTask.count()).toBe(truocTask);
});

test("khong-khop-agenttask: muc khong khop khong sinh ghi danh, sinh mot AgentTask", async () => {
  const res = await goiDiemNhan(loHaiMucMotKhopMotKhong);
  expect(res.status).toBe(200);
  const rows = await db.onboardingEnrollment.findMany({ where: { planId } });
  expect(rows).toHaveLength(1);
  expect(rows[0].contactId).toBe(contactKhop);
  const tasks = await db.agentTask.findMany({ orderBy: { createdAt: "desc" }, take: 1 });
  expect(JSON.stringify(tasks[0])).toContain(maKhongKhop);
  expect(res.body).toEqual({ khop: 1, chuyenTacNhan: 1 });
});

test("thieu-khoa-503: ung dung van dung duoc, diem nhan tra 503", async () => {
  const app = await dungAppKhongCoKhoa();
  expect(app).toBeDefined();
  const res = await goiDiemNhan(loHopLe, { app });
  expect(res.status).toBe(503);
  const trpc = await goiThuTucDanhSach({ app });
  expect(trpc.rows).toBeDefined();
});
```

- [ ] **Step 2: Chạy để thấy đỏ**

Run: `bun run test -- "cd apps/api && bun test test/dieu-phoi-diem-nhan.spec.ts"`
Expected: FAIL ×3.

- [ ] **Step 3: Viết controller và dịch vụ nhận**

Controller sao hình `ListingsController`: `@Controller("internal/onboarding")`, `@AllowAnonymous()`, đọc `ONEHUB_PLATFORM_INGEST_SECRET` từ `ConfigService`, thiếu → `ServiceUnavailableException`, sai → `ForbiddenException`. Thân gói qua `parseOnboardingBatch`; lỗi parse → `BadRequestException` mang tên trường. Dịch vụ chạy TRỌN lô trong một giao dịch: khớp `Cá nhân` bằng `FieldValue.text` trên trường mã nền tảng đã chỉ định; không khớp → `AgentTriggerService` ghi một hàng, KHÔNG đoán.

Khai biến ở `.env.example` kèm một dòng nói nó làm gì, và ở `env.validation.ts` dạng tuỳ chọn.

- [ ] **Step 4: Cập nhật `docs/api.md`**

Thêm vào mục «tRPC is the data surface» một khối khai hạng mục **điểm nhận nội bộ**: liệt `ListingsController` và `OnboardingController`, nói rõ chúng là ngoại lệ có chủ ý, xác thực bằng khoá bí mật riêng, parse tại biên, và không bao giờ khớp danh tính bằng suy đoán.

- [ ] **Step 5: Chạy lại + ba chiều đỏ**

Expected: PASS ×3. Chiều đỏ: (a) parse từng mục trong vòng lặp và bỏ qua mục hỏng → bài một đỏ ghim số hàng trước/sau; (b) thêm bước khớp dự phòng theo tên gần đúng → bài hai đỏ ghim mã không khớp; (c) đổi đọc khoá sang ném khi thiếu → bài ba đỏ ghim tên biến môi trường.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/onboarding apps/api/src/config .env.example docs/api.md apps/api/test/dieu-phoi-diem-nhan.spec.ts
git commit -m "feat(api): diem nhan so lieu tu nen tang, khop bang ma khong doan"
```

---

### Task 7: Thước hằng số (AC-10)

**Files:**
- Create: `_acceptance/dieu-phoi-30-ngay-dau/rang/hang-so-o-config.mjs`

**Interfaces:**
- Produces: script thoát 0 khi sạch, khác 0 khi có hằng số ghim ngoài config.

- [ ] **Step 1: Viết thước bằng AST**

Suy gốc kho từ vị trí chính script (`fileURLToPath(import.meta.url)` rồi đi lên), KHÔNG ghim cứng đường dẫn. Duyệt mọi tệp `.ts` dưới `apps/api/src/onboarding/` trừ `onboarding-config.ts`, parse bằng `typescript` sẵn có trong kho, tìm `NumericLiteral` giá trị 30 và giá trị ngưỡng nguội ở vị trí khởi tạo hằng. Vế hai: `onboarding-config.ts` phải khai cả hai, VÀ ít nhất một tệp khác phải `import` từ nó.

- [ ] **Step 2: Chiều đỏ trước khi tin chiều xanh**

Run: chép thư mục module sang `/tmp`, chèn `const TARGET_DAYS = 30;` vào một tệp, chạy thước trên bản sao.
Expected: exit khác 0, thông điệp ghim đường dẫn tệp và số dòng.

- [ ] **Step 3: Chạy trên cây thật**

Run: `node _acceptance/dieu-phoi-30-ngay-dau/rang/hang-so-o-config.mjs`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/dieu-phoi-30-ngay-dau/rang
git commit -m "test(acceptance): thuoc AST chan hang so ghim ngoai config"
```

---

### Task 8: Màn danh mục (AC-3 phần đường dẫn, AC-9, AC-11)

**Files:**
- Create: `apps/app/app/(app)/[slug]/onboarding/page.tsx`, `danh-muc-table.tsx`
- Test: `apps/app/test/dieu-phoi-trang-thai.spec.ts`
- Tham chiếu: bản mẫu đã duyệt ở `apps/app/app/proto/_modules/dieu-phoi-30-ngay-dau/`

**Interfaces:**
- Consumes: thủ tục `onboarding.listPlans` (Task 5), `onboarding.listTemplates` (Task 4).
- Produces: màn tại `/[slug]/onboarding`.

- [ ] **Step 1: Hai bài kiểm đỏ**

```ts
test("chua-co-khuon: man noi ro va dan sang Cai dat, khong phai trang thai rong thuong", async () => {
  const kq = await taiDuLieuManDanhMuc({ plans: [], templates: [] });
  expect(kq.soKhuon).toBe(0);
  expect(kq.trangThai).toBe("ST-danhmuc-chuacokhuon");
  expect(kq.duongDanKhuon).toBeTruthy();
  const coKhuon = await taiDuLieuManDanhMuc({ plans: [], templates: [motKhuon] });
  expect(coKhuon.trangThai).toBe("ST-danhmuc-empty");
});

test("bo-loc-duong-dan: tham so nam trong duong dan va song sot qua tai lai", async () => {
  const man = dungManDanhMuc({ rows: haiHang });
  await datBoLoc(man, { boPhan: "Ky thuat" });
  expect(man.duongDan).toContain("boPhan=Ky+thuat");
  const sauTaiLai = dungManDanhMuc({ duongDan: man.duongDan, rows: haiHang });
  expect(sauTaiLai.boLoc.boPhan).toBe("Ky thuat");
  expect(sauTaiLai.soHang).toBe(man.soHang);
  const tran = dungManDanhMuc({ duongDan: "/onboarding", rows: haiHang });
  expect(tran.soHang).toBe(2);
});
```

- [ ] **Step 2: Chạy để thấy đỏ**

Run: `bun run test -- "cd apps/api && bun test test/dieu-phoi.spec.ts -t chua-co-khuon"` và `cd apps/app && bun test test/dieu-phoi-trang-thai.spec.ts -t bo-loc-duong-dan`
Expected: FAIL ×2.

- [ ] **Step 3: Viết màn**

Trang máy chủ gọi CẢ `listPlans` LẪN `listTemplates` (đếm khuôn là điều kiện của `ST-danhmuc-chuacokhuon`) rồi trao dữ liệu đã xong cho component khách. Component khách dùng `nuqs` cho `boPhan` và `trangThai`. Ghép từ bản mẫu đã duyệt: cột `Đối tác · Đang tắc ở · Im · Bước · Ngày · Bộ phận · Cầm trịch`, rãnh trạng thái có số đếm từ `facetCounts`, `tabular-nums` ở cột số, cắt có dấu ba chấm ở cột chữ dài.

- [ ] **Step 4: Chạy lại + hai chiều đỏ**

Expected: PASS ×2. Chiều đỏ: (a) bỏ lời gọi đếm khuôn khỏi trang → bài một đỏ ghim tên trạng thái; (b) đổi bộ lọc sang trạng thái React cục bộ → bài hai đỏ ghim đường dẫn mong đợi.

- [ ] **Step 5: Commit**

```bash
git add "apps/app/app/(app)/[slug]/onboarding" apps/app/test/dieu-phoi-trang-thai.spec.ts
git commit -m "feat(app): man danh muc 30 ngay"
```

---

### Task 9: Màn hồ sơ, Cài đặt, và xác nhận trước khi xoá (AC-12)

**Files:**
- Create: `apps/app/app/(app)/[slug]/onboarding/[planId]/page.tsx`, `apps/app/app/(app)/[slug]/settings/onboarding/page.tsx`
- Test: `apps/app/test/dieu-phoi-trang-thai.spec.ts`

**Interfaces:**
- Consumes: mọi thủ tục của Task 4–5.

- [ ] **Step 1: Bài kiểm đỏ**

```ts
test("xoa-co-xac-nhan: cu bam dau tien chi mo hop thoai", async () => {
  const goi = mock(() => Promise.resolve());
  const man = dungManHoSo({ onRemove: goi, ghiDanh: [motGhiDanh] });
  bam(man, "xoa");
  expect(man.hopThoaiXacNhan).toBe(true);
  expect(goi).toHaveBeenCalledTimes(0);
  bam(man, "xac-nhan");
  expect(goi).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Chạy để thấy đỏ**

Run: `cd apps/app && bun test test/dieu-phoi-trang-thai.spec.ts -t xoa-co-xac-nhan`
Expected: FAIL.

- [ ] **Step 3: Viết hai màn**

Hồ sơ: hai phần như bản mẫu — thẻ bước (kèm dòng tóm tắt *x/y xong · n bước chưa giao · bộ phận nào đang dở*) và thẻ phễu bốn bậc. Danh sách ghi danh trên 50 dòng phải ảo hoá. Xoá ghi danh đi qua `AlertDialog` của `@crm/ui`. Cài đặt: danh sách khuôn và danh sách bộ phận, đều có đường tạo.

- [ ] **Step 4: Chạy lại + chiều đỏ**

Expected: PASS. Chiều đỏ: bỏ hộp thoại, gọi xoá thẳng → bài kiểm đỏ ghim số lần gọi mong đợi.

- [ ] **Step 5: Commit**

```bash
git add "apps/app/app/(app)/[slug]" apps/app/test/dieu-phoi-trang-thai.spec.ts
git commit -m "feat(app): man ho so ke hoach va cai dat khuon, bo phan"
```

---

### Task 10: Năm lệnh chứng xanh trọn

- [ ] **Step 1: Chạy trọn bộ**

Run, từ gốc kho, đúng thứ tự:
```bash
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```
Expected: cả năm exit 0.

- [ ] **Step 2: Đặt hợp đồng sang `implemented`**

Sửa frontmatter `_acceptance/dieu-phoi-30-ngay-dau/contract.md`: `status: implemented`. Đây là hành vi cuối của bên viết mã; nghiệm thu máy (S4) là việc của phiên chấm.

- [ ] **Step 3: Commit**

```bash
git add _acceptance/dieu-phoi-30-ngay-dau/contract.md
git commit -m "chore(acceptance): dieu-phoi-30-ngay-dau san sang nghiem thu may"
```
