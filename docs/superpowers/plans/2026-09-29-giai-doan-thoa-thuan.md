# Giai đoạn thoả thuận tự cấu hình — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay enum Prisma `DealStage` bằng bảng giai đoạn mà owner/admin tự thêm, đổi tên, sắp xếp, xoá ở Cài đặt, và mọi hành vi dựa vào loại (OPEN / WON / LOST) chứ không vào tên.

**Architecture:** Bảng `dealStage` (id, label, kind, position, archivedAt) + cột `deal.stage` đổi kiểu enum → text có khoá ngoại (quan hệ Prisma tên `giaiDoan`). Bảy dòng khởi tạo mang id bằng chuỗi enum cũ, nên dữ liệu, lịch sử và test cũ vẫn trỏ đúng. Một module luật ở `packages/db/src/giai-doan.ts`; router `giaiDoan` ở API; app đọc danh sách động qua một hook.

**Tech Stack:** Prisma 7 + Postgres · NestJS + nestjs-trpc · Next.js App Router + TanStack Query · bun test · zod 4.

**Spec:** `docs/superpowers/specs/2026-09-29-giai-doan-thoa-thuan-design.md` · Hợp đồng `_acceptance/giai-doan-thoa-thuan/contract.md` (14 AC) · `_acceptance/giai-doan-thoa-thuan/evals.yaml` (19 eval).

## Global Constraints

- Không viết chú thích trong code (`AGENTS.md`).
- Hằng số tinh chỉnh được nằm trong MỘT object `GIAI_DOAN` ở `packages/db/src/giai-doan.ts`: trần 20 giai đoạn sống, nhãn 1–40 ký tự sau khi cắt khoảng trắng.
- Dữ liệu `Json` (`Activity.meta`) parse ở biên bằng zod, trong module sở hữu hình dạng (`packages/validation/src/giai-doan.ts`).
- UI chỉ ghép từ `@crm/ui/components/*` (subpath); không đè `className` đổi màu/góc; component client không import `@crm/db` / `@crm/auth`.
- Mốc migration: `20261006010000_giai_doan_thoa_thuan`. Kiểm lại `git ls-tree --name-only origin/onehub packages/db/prisma/migrations/ | tail -3` ngay trước khi đẩy.
- Mã sản phẩm (ngoài `packages/db/src/giai-doan.ts`, `seed.ts`, `apps/app/app/proto/**`) KHÔNG nhắc bảy id cũ và KHÔNG import `GIAI_DOAN_GOC` (E17).
- Nhãn giai đoạn là dữ liệu người nhập: mọi chỗ hiện mang `translate="no"`.
- Mọi phép đo mới đi kèm cặp hai chiều trên cùng fixture: vật lành xanh, bản sao hỏng đỏ với thông điệp ghim (MEASURE-BIRTH).
- Worktree cần `.env` symlink (đã có) và `bun run db:generate` sau khi đổi schema.
- Năm lệnh chứng ở gốc: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## Review Focus

1. **Thoả thuận đã lưu trữ khi xoá giai đoạn** — đếm và chuyển phải gồm `archivedAt != null`; nếu sót, khoá ngoại `RESTRICT` không phạm (xoá chỉ đặt `archivedAt`) nhưng thoả thuận lưu trữ bị kẹt ở giai đoạn đã ẩn. Test ở Task 3 (E7 ca T chỉ có thoả thuận lưu trữ).
2. **Hai quản trị viên cùng sửa** — `reorder` với danh sách cũ phải bị từ chối, không trộn; `create` đồng thời không vượt trần. Khoá `FOR UPDATE` trên các dòng giai đoạn sống trong transaction. Test ở Task 3 (reorder danh sách thiếu = đại diện cho danh sách cũ).
3. **Thoả thuận tạo khi giai đoạn đầu vừa bị xoá** — `deals.create` không truyền `stage` phải lấy giai đoạn OPEN sống có position nhỏ nhất tại thời điểm ghi, không dùng mặc định DB. Test ở Task 2 (E11 ca «sau khi reorder»).
4. **Timeline gặp `meta` hỏng** — dòng `STAGE_CHANGE` cũ có `meta` null hoặc sai hình: trả `stageChange: null`, không vỡ trang. Test ở Task 2.
5. **Nhãn có khoảng trắng hai đầu hoặc khác hoa thường** — «Closed won » và «closed WON» phải bị coi là trùng. Test ở Task 3 (E8).

---

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `packages/db/prisma/schema.prisma` | enum `DealStageKind`, model `DealStage`, `Deal.stage` → text + quan hệ `giaiDoan` |
| `packages/db/prisma/migrations/20261006010000_giai_doan_thoa_thuan/migration.sql` | tạo bảng, chèn 7 dòng, đổi kiểu cột, xoá enum |
| `packages/db/src/giai-doan.ts` (thay `deal-stage.ts`) | `GIAI_DOAN`, `GIAI_DOAN_GOC`, `laDaDong`, `laThua`, `laChotDuoc`, `thuTuGiaiDoan` |
| `packages/validation/src/giai-doan.ts` | zod đầu vào (nhãn, loại) + `stageChangeMeta` |
| `apps/api/src/giai-doan/{giai-doan.module,router,service,contracts,config}.ts` | router `giaiDoan` |
| `apps/api/src/deals/*`, `dashboard/*`, `companies/*`, `contacts/*`, `activities/*`, `telemetry/rollup.service.ts` | đổi sang loại + gắn nhãn cho timeline |
| `apps/agent/agent/lib/{lookup,accounts,preamble,crm}.ts` | lọc theo loại, in nhãn |
| `apps/app/lib/giai-doan.ts` (thay `deal-stage.ts`) | hook `useGiaiDoan()` + hàm trình bày |
| `apps/app/app/(app)/[slug]/settings/giai-doan/{page,giai-doan-settings}.tsx` | trang Cài đặt |
| `_acceptance/giai-doan-thoa-thuan/rang/*.mjs` | răng đo E1, E15, E17, E18 |

---

### Task 1: Dữ liệu, migration và module luật

**independent: false** (nền cho mọi task) · **Phục vụ:** E1 (AC-1), một phần E8/E11/E13/E17

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (enum `DealStage` dòng 219-227; model `Deal` ~989-1030)
- Create: `packages/db/prisma/migrations/20261006010000_giai_doan_thoa_thuan/migration.sql`
- Create: `packages/db/src/giai-doan.ts`; Delete: `packages/db/src/deal-stage.ts`
- Modify: `packages/db/package.json` (exports: bỏ `./deal-stage`, thêm `./giai-doan`)
- Modify: `packages/db/src/okr-chi-so.ts:171`, `packages/db/prisma/seed.ts` (8, 282-293, 846-891, 945, 999-1000)
- Create: `packages/validation/src/giai-doan.ts`; Modify: `packages/validation/package.json` (thêm `./giai-doan`)
- Create: `_acceptance/giai-doan-thoa-thuan/rang/migration-du-lieu.mjs`
- Test: `packages/db/test/giai-doan.spec.ts`

**Interfaces — Produces:**
```ts
export type LoaiGiaiDoan = "OPEN" | "WON" | "LOST";
export const GIAI_DOAN: { tran: { tong: 20 }; nhan: { toiDa: 40 }; loai: readonly ["OPEN","WON","LOST"] };
export const GIAI_DOAN_GOC: { DEMO_BOOKED: "DEMO_BOOKED"; …7 id };
export function laDaDong(kind: LoaiGiaiDoan): boolean;
export function laThua(kind: LoaiGiaiDoan): boolean;
export function laChotDuoc(kind: LoaiGiaiDoan): boolean;
export const THU_TU_GIAI_DOAN: [{ giaiDoan: { kind: "asc" } }, { giaiDoan: { position: "asc" } }];
// @crm/validation/giai-doan
export const nhanGiaiDoan: z.ZodString;
export const loaiGiaiDoan: z.ZodEnum<["OPEN","WON","LOST"]>;
export const stageChangeMeta: z.ZodType<{ from: string | null; to: string } | null>;
export function parseStageChangeMeta(value: unknown): { from: string | null; to: string } | null;
```

- [ ] **Step 1: Viết test module luật (đỏ)** — `packages/db/test/giai-doan.spec.ts`

```ts
import { describe, expect, test } from "bun:test";
import { GIAI_DOAN, GIAI_DOAN_GOC, laChotDuoc, laDaDong, laThua } from "../src/giai-doan";

describe("giai-doan", () => {
	test("ba loai va luat dong", () => {
		expect([...GIAI_DOAN.loai]).toEqual(["OPEN", "WON", "LOST"]);
		expect(GIAI_DOAN.loai.map(laDaDong)).toEqual([false, true, true]);
		expect(GIAI_DOAN.loai.map(laThua)).toEqual([false, false, true]);
		expect(GIAI_DOAN.loai.map(laChotDuoc)).toEqual([false, true, false]);
	});
	test("bay id goc", () => {
		expect(Object.keys(GIAI_DOAN_GOC)).toHaveLength(7);
		expect(Object.entries(GIAI_DOAN_GOC).every(([k, v]) => k === v)).toBe(true);
	});
});
```

Run: `cd packages/db && bun test test/giai-doan.spec.ts` → FAIL «Cannot find module ../src/giai-doan».

- [ ] **Step 2: Module luật** — `packages/db/src/giai-doan.ts`

```ts
export type LoaiGiaiDoan = "OPEN" | "WON" | "LOST";

export const GIAI_DOAN = {
	tran: { tong: 20 },
	nhan: { toiDa: 40 },
	loai: ["OPEN", "WON", "LOST"],
} as const;

export const GIAI_DOAN_GOC = {
	DEMO_BOOKED: "DEMO_BOOKED",
	QUALIFIED_TO_BUY: "QUALIFIED_TO_BUY",
	DECISION_MAKER_BOUGHT_IN: "DECISION_MAKER_BOUGHT_IN",
	CONTRACT_SENT: "CONTRACT_SENT",
	CLOSED_WON: "CLOSED_WON",
	CLOSED_LOST: "CLOSED_LOST",
	UNQUALIFIED_TO_BUY: "UNQUALIFIED_TO_BUY",
} as const;

export function laDaDong(kind: LoaiGiaiDoan): boolean {
	return kind !== "OPEN";
}

export function laThua(kind: LoaiGiaiDoan): boolean {
	return kind === "LOST";
}

export function laChotDuoc(kind: LoaiGiaiDoan): boolean {
	return kind === "WON";
}

export const THU_TU_GIAI_DOAN = [
	{ giaiDoan: { kind: "asc" } },
	{ giaiDoan: { position: "asc" } },
] as const;
```

Package export: trong `packages/db/package.json` thay `"./deal-stage": "./src/deal-stage.ts"` bằng `"./giai-doan": "./src/giai-doan.ts"`; xoá `src/deal-stage.ts`.

Run: `cd packages/db && bun test test/giai-doan.spec.ts` → PASS.

- [ ] **Step 3: Schema** — trong `schema.prisma` xoá `enum DealStage {…}`, thêm:

```prisma
enum DealStageKind {
  OPEN
  WON
  LOST
}

model DealStage {
  id         String        @id @default(cuid())
  label      String
  kind       DealStageKind
  position   Int
  archivedAt DateTime?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  deals      Deal[]

  @@index([kind, position])
  @@map("dealStage")
}
```

và trong `model Deal` thay `stage DealStage @default(DEMO_BOOKED)` bằng:

```prisma
  stage             String    @default("DEMO_BOOKED")
  giaiDoan          DealStage @relation(fields: [stage], references: [id], onDelete: Restrict)
```

(giữ `@@index([stage])`).

- [ ] **Step 4: Migration SQL** — `packages/db/prisma/migrations/20261006010000_giai_doan_thoa_thuan/migration.sql`

```sql
-- CreateEnum
CREATE TYPE "DealStageKind" AS ENUM ('OPEN', 'WON', 'LOST');

-- CreateTable
CREATE TABLE "dealStage" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "DealStageKind" NOT NULL,
    "position" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dealStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dealStage_kind_position_idx" ON "dealStage"("kind", "position");

INSERT INTO "dealStage" ("id", "label", "kind", "position", "updatedAt") VALUES
    ('DEMO_BOOKED', 'Demo booked', 'OPEN', 0, CURRENT_TIMESTAMP),
    ('QUALIFIED_TO_BUY', 'Qualified to buy', 'OPEN', 1, CURRENT_TIMESTAMP),
    ('DECISION_MAKER_BOUGHT_IN', 'Decision maker in', 'OPEN', 2, CURRENT_TIMESTAMP),
    ('CONTRACT_SENT', 'Contract sent', 'OPEN', 3, CURRENT_TIMESTAMP),
    ('CLOSED_WON', 'Closed won', 'WON', 0, CURRENT_TIMESTAMP),
    ('CLOSED_LOST', 'Closed lost', 'LOST', 0, CURRENT_TIMESTAMP),
    ('UNQUALIFIED_TO_BUY', 'Unqualified', 'LOST', 1, CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "deal" ALTER COLUMN "stage" DROP DEFAULT;
ALTER TABLE "deal" ALTER COLUMN "stage" TYPE TEXT USING ("stage"::text);
ALTER TABLE "deal" ALTER COLUMN "stage" SET DEFAULT 'DEMO_BOOKED';

-- DropEnum
DROP TYPE "DealStage";

-- AddForeignKey
ALTER TABLE "deal" ADD CONSTRAINT "deal_stage_fkey" FOREIGN KEY ("stage") REFERENCES "dealStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

Run: `bun run db:generate` rồi kiểm schema và migration khớp:
`cd packages/db && bunx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --shadow-database-url "$SHADOW_URL" --script` với `SHADOW_URL` là một kho `crm_gdtt_shadow_test` tạo tay (`createdb`), xoá sau. Expected: đầu ra rỗng (`-- This is an empty migration.`).

- [ ] **Step 5: Validation** — `packages/validation/src/giai-doan.ts`

```ts
import { z } from "zod";

export const LOAI_GIAI_DOAN = ["OPEN", "WON", "LOST"] as const;
export const NHAN_TOI_DA = 40;

export const loaiGiaiDoan = z.enum(LOAI_GIAI_DOAN);
export const nhanGiaiDoan = z.string().trim().min(1).max(NHAN_TOI_DA);

export const stageChangeMeta = z
	.object({ from: z.string().min(1).nullable(), to: z.string().min(1) })
	.nullable();

export type StageChangeMeta = z.infer<typeof stageChangeMeta>;

export function parseStageChangeMeta(value: unknown): StageChangeMeta {
	const parsed = stageChangeMeta.safeParse(value);
	return parsed.success ? parsed.data : null;
}
```

`NHAN_TOI_DA` phải bằng `GIAI_DOAN.nhan.toiDa`: thêm một ca vào `packages/db/test/giai-doan.spec.ts` import cả hai và `expect(NHAN_TOI_DA).toBe(GIAI_DOAN.nhan.toiDa)`. Package export `"./giai-doan": "./src/giai-doan.ts"`.

- [ ] **Step 6: okr-chi-so và seed** — `okr-chi-so.ts:171` đổi `stage: "CLOSED_WON"` thành `giaiDoan: { kind: "WON" }`. `seed.ts`: bỏ import `DealStage`; `OPEN_STAGES`/`CLOSED_STAGES` dựng từ `GIAI_DOAN_GOC` (`import { GIAI_DOAN_GOC } from "../src/giai-doan"`); dòng 890 so với `GIAI_DOAN_GOC.CLOSED_LOST`/`UNQUALIFIED_TO_BUY`; kiểu `meta?: { from: string; to: string }`. Seed KHÔNG tạo dòng `dealStage` (migration đã chèn).

- [ ] **Step 7: Răng E1** — `_acceptance/giai-doan-thoa-thuan/rang/migration-du-lieu.mjs`. Gốc kho suy từ `import.meta.url` (ba cấp lên). Luồng:
  1. `ten = crm_gdtt_${Date.now().toString(36)}_test`; tạo kho bằng `pg` client nối `TEST_DATABASE_URL` gốc (`CREATE DATABASE`).
  2. Chép `packages/db/prisma/migrations` vào thư mục tạm TRỪ `20261006010000_giai_doan_thoa_thuan`; chạy `bunx prisma migrate deploy --schema <tạm>/schema.prisma` (schema chép từ `git show $(git merge-base HEAD origin/onehub):packages/db/prisma/schema.prisma`) với `DATABASE_URL` trỏ kho mới.
  3. Gieo bằng SQL: 1 user, 1 company, 7 deal (mỗi `stage` cũ một cái; `UNQUALIFIED_TO_BUY` và `CLOSED_WON` có `archivedAt`; `CLOSED_LOST` có `closedAt`, `closedReason`), 3 activity `STAGE_CHANGE` `meta` `{from,to}`.
  4. Đọc `ORDER`/`PRESENTATION` từ `git show <merge-base>:apps/app/lib/deal-stage.ts` bằng regex trên nguồn → bảng kỳ vọng id/label/kind/position.
  5. Chạy RIÊNG tệp `migration.sql` thật của vòng này (`psql -f` hoặc `client.query(readFileSync(...))`).
  6. Khẳng định: 28 (7×4 cột `dealStage`) + 21 (7 deal × stage/closedAt/closedReason) + 3 (meta từng byte) + 1 (`SELECT 1 FROM pg_type WHERE typname='DealStage'` rỗng) = `KY_MONG = 53`. Đếm lệch → exit 2. Hỏng → in `HONG <thông điệp>` và exit 1.
  7. `finally`: `DROP DATABASE`.

  Chiều đỏ (chạy tay, ghi vào `expected` của E1): bản sao `migration.sql` gán `CLOSED_LOST` vào `OPEN` → «CLOSED_LOST: kind OPEN != LOST»; bản sao bỏ `DROP TYPE` → «enum DealStage con song». Bản sao đặt ở `.acceptance-runs/giai-doan-thoa-thuan/` (không trong gói).

Run: `bun _acceptance/giai-doan-thoa-thuan/rang/migration-du-lieu.mjs` → `53/53`, exit 0.

- [ ] **Step 8: Commit**

```bash
git add packages/db packages/validation _acceptance/giai-doan-thoa-thuan/rang/migration-du-lieu.mjs
git commit -m "feat(giai-doan-thoa-thuan): bảng giai đoạn, migration giữ id cũ, module luật theo loại"
```

(Sau bước này `check-types` đỏ ở mọi nơi import `DealStage`/`@crm/db/deal-stage` — Task 2–5 sửa.)

---

### Task 2: API tiêu thụ theo loại + timeline gắn nhãn

**independent: false** (phụ thuộc Task 1; Task 3 dùng hàm chuyển trong transaction) · **Phục vụ:** E4 (phần timeline), E6 (bulk), E11, E12, E13, E19 (hình dạng output)

**Files:**
- Modify: `apps/api/src/deals/deals.contracts.ts` (1, 40-42, 48, 76-80, 123-126, 198, 242-262, 264, 300-304)
- Modify: `apps/api/src/deals/deals.service.ts` (1-14, 90-97, 118-140, 198-260, 345-395, 565-669, 788-803, 845-915, 955)
- Modify: `apps/api/src/dashboard/dashboard.{contracts,service}.ts`, `apps/api/src/companies/companies.{contracts,service}.ts`, `apps/api/src/contacts/contacts.{contracts,service}.ts`, `apps/api/src/telemetry/rollup.service.ts`
- Modify: `apps/api/src/activities/{activities.contracts,activities.service}.ts`
- Modify tests import `DealStage`: `apps/api/test/{deals-board.spec.ts,currency-totals.integration.spec.ts}` → `GIAI_DOAN_GOC`
- Test: `apps/api/test/giai-doan.spec.ts` (ca `theo-loai`, `doi-ten` phần timeline), `apps/api/test/giai-doan-bao-cao.spec.ts`

**Interfaces:**
- Consumes: `laDaDong`, `laThua`, `THU_TU_GIAI_DOAN` (Task 1), `parseStageChangeMeta`.
- Produces:
```ts
// deals.contracts.ts
export const stageId = z.string().min(1);
// setStageInput { id, stage: stageId, closedReason? } — tên khoá giữ nguyên
// board columns[].stage: string ; + columns[].label: string ; columns[].kind: "OPEN"|"WON"|"LOST"
// DealsService
chuyenGiaiDoanTrongTx(tx: Prisma.TransactionClient, emit: EmitFn, args: {
  dealId: string; toStageId: string; closedReason?: string; actingUserId: string; now: Date;
}): Promise<{ changed: boolean; companyId: string }>;
docGiaiDoanSong(tx: Prisma.TransactionClient, id: string): Promise<{ id: string; kind: LoaiGiaiDoan }>; // BadRequest nếu vắng hay đã xoá
// activities.contracts.ts
stageChange: z.object({ from: stageRef.nullable(), to: stageRef }).nullable()   // stageRef = { id, label }
```

- [ ] **Step 1: Test theo loại (đỏ)** — `apps/api/test/giai-doan.spec.ts`, khuôn `deals-board.spec.ts` (service trực tiếp, `withDiscardedCrmEvents`, dữ liệu gắn `TEST_RUN_ID`). Fixture: tạo ba giai đoạn mới bằng `db.dealStage.create({ data: { id: \`gdtt-${suffix}-open\`, label: \`Mở ${suffix}\`, kind: "OPEN", position: 50 } })` (tương tự WON, LOST); dọn: deal trước, rồi `dealStage.deleteMany({ where: { id: { startsWith: \`gdtt-${suffix}\` } } })`.

```ts
describe("theo-loai", () => {
	it("chuyen vao tung loai hanh xu theo kind", async () => {
		const a = await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED);
		await deals.setStage({ id: a, stage: moi.WON }, userId);
		expect((await db.deal.findUniqueOrThrow({ where: { id: a } })).closedAt).not.toBeNull();
		await deals.setStage({ id: a, stage: moi.OPEN }, userId);
		const mo = await db.deal.findUniqueOrThrow({ where: { id: a } });
		expect([mo.closedAt, mo.closedReason]).toEqual([null, null]);
		await expect(deals.setStage({ id: a, stage: moi.LOST }, userId)).rejects.toThrow("Say why");
		await deals.setStage({ id: a, stage: moi.LOST, closedReason: "Hết nhu cầu" }, userId);
		const thua = await db.deal.findUniqueOrThrow({ where: { id: a } });
		expect(thua.closedReason).toBe("Hết nhu cầu");
		expect(thua.closedAt).not.toBeNull();
	});
	it("tao moi vao OPEN dau tien, ke ca sau khi sap lai", async () => { … deals.create({name, companyId, ownerId}) → stage === id OPEN position nhỏ nhất đọc từ db.dealStage; đổi position của moi.OPEN về -1 → create lần hai → stage === moi.OPEN });
	it("bulkSetStage vao LOST moi", async () => { không lý do → rejects "Say why", stage hai thoả thuận không đổi; có lý do → closedAt + closedReason trên cả hai });
});
```

Thêm ca Review Focus 4 vào `activities`: một activity `STAGE_CHANGE` với `meta: null` và một với `meta: { foo: 1 }` → `timeline` trả `stageChange: null` cho cả hai, không ném.

Run: `bun run test -- "cd apps/api && bun test test/giai-doan.spec.ts -t theo-loai"` → FAIL (typecheck/khoá `giaiDoan`).

- [ ] **Step 2: Contracts** — `deals.contracts.ts`: xoá import `DealStage`, `const stageEnum` → `export const stageId = z.string().min(1);` và thay mọi `stageEnum` bằng `stageId`. Board column thêm `label: z.string(), kind: z.enum(["OPEN","WON","LOST"])`. Tương tự `dashboard.contracts.ts` (13-15, 39-43, 59: `stage: z.string()`, bucket thêm `label`), `companies.contracts.ts:78-80,158`, `contacts.contracts.ts:217` → `z.string()`.

- [ ] **Step 3: DealsService**
  - Xoá `LOSING`, `DEAL_BOARD_STAGES`. Sort `stage: (dir) => [{ giaiDoan: { kind: dir } }, { giaiDoan: { position: dir } }, { expectedCloseDate: "asc" }]`.
  - `buildWhere`: `status === "open"` → `and.push({ giaiDoan: { kind: "OPEN" } })`; `"closed"` → `{ giaiDoan: { kind: { in: ["WON", "LOST"] } } }`; `input.stage` giữ `{ stage: { in: input.stage } }`. `closingFilter` overdue: `giaiDoan: { kind: "OPEN" }`. `list` openWhere cũng vậy.
  - `facetCounts`: `openCount`/`closedCount` bằng hai `this.db.deal.count({ where: { AND: [where, { giaiDoan: { kind: … } }] } })` thay vì cộng theo danh sách tên.
  - `board`: đọc `const cot = await this.db.dealStage.findMany({ where: { archivedAt: null }, orderBy: [{ kind: "asc" }, { position: "asc" }], select: { id: true, label: true, kind: true } })`, rồi `cot.map(async (g) => { const stageWhere = { AND: [where, { stage: g.id }] }; … return { stage: g.id, label: g.label, kind: g.kind, … } })`.
  - Tách `chuyenGiaiDoanTrongTx(tx, emit, args)` từ thân `setStage` (dòng 568-650): `SELECT id, stage, "companyId" FROM deal WHERE id = … FOR UPDATE` giữ nguyên; đọc hai giai đoạn `from`/`to` bằng `tx.dealStage.findUnique`; `to` vắng hoặc `archivedAt != null` → `BadRequestException("That stage no longer exists.")`; `laThua(to.kind) && !closedReason` → BadRequest như cũ; `closed = laDaDong(to.kind)`; `deal.closed` khi `!laDaDong(from.kind) && closed`; `deal.opened` khi `laDaDong(from.kind) && !closed`. `setStage` = `withCrmEvents((tx, emit) => this.chuyenGiaiDoanTrongTx(tx, emit, {...}))` + phần sau commit như cũ.
  - `create`: `stage = input.stage ?? (await tx.dealStage.findFirstOrThrow({ where: { kind: "OPEN", archivedAt: null }, orderBy: { position: "asc" } })).id` TRONG transaction; kiểm giai đoạn sống bằng `docGiaiDoanSong`.
  - `bulkSetStage`: đọc kind của `input.stage` một lần bằng `docGiaiDoanSong`; `laThua` && thiếu lý do → BadRequest trước khi chạy lô.

- [ ] **Step 4: Dashboard, companies, contacts, telemetry**
  - `dashboard.service.ts`: groupBy `where: { ...owned, giaiDoan: { kind: "OPEN" } }` (81, 85, 112, 123). `stages` = `(await this.db.dealStage.findMany({ where: { kind: "OPEN", archivedAt: null }, orderBy: { position: "asc" } })).map(g => ({ stage: g.id, label: g.label, count, valueCents }))`. `recentDeals` select thêm `giaiDoan: { select: { kind: true } }`; `won = deal.giaiDoan.kind === "WON"`; `else if (deal.giaiDoan.kind === "LOST") losses += 1`.
  - `companies.service.ts:113` → `deals: { where: { giaiDoan: { kind: "OPEN" } } }`; dòng 216 `orderBy: [{ giaiDoan: { kind: "asc" } }, { giaiDoan: { position: "asc" } }, { expectedCloseDate: "asc" }]`.
  - `rollup.service.ts`: bỏ import `DealStage`; key cho `countsOf` = `(await this.db.dealStage.findMany({ select: { id: true } })).map(g => g.id)`. Không gửi `label`.

- [ ] **Step 5: Timeline gắn nhãn** — `activities.contracts.ts`: `const stageRef = z.object({ id: z.string(), label: z.string() }); activityEntryOutput` thêm `stageChange: z.object({ from: stageRef.nullable(), to: stageRef }).nullable()`. `activities.service.ts` trong `timeline`: gom `parseStageChangeMeta(e.meta)` của các dòng `STAGE_CHANGE`, một `findMany({ where: { id: { in: ids } }, select: { id, label } })` (gồm đã lưu trữ), map id→label; id vắng → label = id. Dòng khác loại hoặc meta hỏng → `stageChange: null`.

- [ ] **Step 6: Test báo cáo** — `apps/api/test/giai-doan-bao-cao.spec.ts`:
  - `tong-quan` (E12): fixture đúng như E12; kỳ vọng tính bằng hàm độc lập `kyVong(fixture)` trong tệp test (đếm theo kind), so `summary.performance.{wins,losses,winRate}` và `pipeline.stages` (id theo position, count, valueCents).
  - `okr-telemetry` (E13): `dieuKienChiSo` «thoa-thuan-chot-duoc» → `db.deal.count` trả 2; thoả thuận ở LOST mới không đếm; `RollupService` payload `deals_by_stage` có khoá = id, và `JSON.stringify(payload)` không chứa nhãn nào của fixture.

- [ ] **Step 7: Sửa test cũ** — `deals-board.spec.ts`, `currency-totals.integration.spec.ts`: `import { type DealStage, db }` → `import { db } from "@crm/db"; import { GIAI_DOAN_GOC } from "@crm/db/giai-doan";`, `DealStage.X` → `GIAI_DOAN_GOC.X`, `type DealStage` → `string`. Tìm thêm: `rg -l "DealStage|deal-stage" apps/api/test` và sửa cùng khuôn.

Run: `bun run test -- "cd apps/api && bun test test/giai-doan.spec.ts test/giai-doan-bao-cao.spec.ts test/deals-board.spec.ts test/currency-totals.integration.spec.ts"` → PASS. `cd apps/api && bunx tsc --noEmit` → 0 lỗi trong `src/`.

- [ ] **Step 8: Phá-thử cặp đỏ** (bản sao ở `.acceptance-runs/giai-doan-thoa-thuan/`): `laThua` so `id === "CLOSED_LOST"` → E11 đỏ «LOST moi khong ly do duoc chap nhan»; dashboard chỉ đếm `CLOSED_LOST` → E12 đỏ «winRate 5/6 != 5/9»; okr giữ `"CLOSED_WON"` → E13 đỏ «chot-duoc 1 != 2». Ghim thông điệp trong `expect(…, "<thông điệp>")`.

- [ ] **Step 9: Commit** — `git commit -m "feat(giai-doan-thoa-thuan): API đọc theo loại giai đoạn, timeline gắn nhãn"`

---

### Task 3: Router `giaiDoan`

**independent: false** (cần `chuyenGiaiDoanTrongTx` của Task 2) · **Phục vụ:** E2, E4, E5, E6, E7, E8, E9

**Files:**
- Create: `apps/api/src/giai-doan/giai-doan.{module,router,service,contracts,config}.ts`
- Modify: `apps/api/src/app.module.ts` (import + mảng `imports`)
- Modify: `apps/api/src/generated/server.ts` (sinh bằng `cd apps/api && bun run trpc:generate`)
- Modify (nếu spec đòi): `apps/api/test/vai-chi-okr.spec.ts` — `DAU_VAO_HOP_LE` thêm bốn mutation; `SO_MUTATION_KHONG_DAU_VAO` giữ nguyên (không mutation nào thiếu input). `ALIAS_CHO_PHEP` KHÔNG đổi.
- Test: `apps/api/test/giai-doan.spec.ts` (ca `tao`, `doi-ten`, `sap-xep`, `xoa-trong`, `xoa-chuyen`, `bat-bien`), `apps/api/test/giai-doan-quyen.spec.ts`

**Interfaces — Produces:**
```ts
// giai-doan.contracts.ts
export const giaiDoanRow = z.object({ id: z.string(), label: z.string(), kind: loaiGiaiDoan, position: z.number().int(), dealCount: z.number().int() });
export const giaiDoanListOutput = z.object({ canManage: z.boolean(), tran: z.number().int(), stages: z.array(giaiDoanRow) });
export const giaiDoanCreateInput = z.object({ label: nhanGiaiDoan, kind: loaiGiaiDoan });
export const giaiDoanRenameInput = z.object({ id: z.string().min(1), label: nhanGiaiDoan });
export const giaiDoanReorderInput = z.object({ kind: loaiGiaiDoan, ids: z.array(z.string().min(1)).min(1) });
export const giaiDoanArchiveInput = z.object({ id: z.string().min(1), moveTo: z.string().min(1).optional() });
export const giaiDoanWriteOutput = z.object({ id: z.string() });
// giai-doan.config.ts
export const GIAI_DOAN_API = { messages: { forbidden, trung, tran, cuoiCung, conThoaThuan, dichSai, khongCo, danhSachLech } } as const;
```
`dealCount` đếm mọi thoả thuận trỏ giai đoạn đó, **kể cả đã lưu trữ** (Review Focus 1).

- [ ] **Step 1: Test ma trận (đỏ)** — trong `giai-doan.spec.ts` gọi `GiaiDoanService` trực tiếp với `actingUserId` là owner đã gieo bằng `gieoThanhVien` (`./phien-thu`). Ca theo đúng `expected` của E2, E4 (list/board), E5 (1 xanh + 5 đỏ), E6, E7 (4 đỏ + xanh + nguyên tử + T chỉ lưu trữ = count 1), E8 (8 đỏ + 2 đối chứng + ma trận «kind lạ không đổi» rút mutation từ `generated/server.ts` bằng regex `giaiDoan: t\.router\(\{([\s\S]*?)\}\)` rồi lọc `.mutation(`). E7 dùng agent stub đếm emit: `const phat: unknown[] = []; const agent = { withCrmEvents: (work) => db.$transaction((tx) => work(tx, async (e) => { phat.push(e); })) }` — đếm sau khi transaction trả về (ca nguyên tử: `phat` bị bỏ vì transaction rollback → khẳng định đếm các sự kiện của transaction đã commit bằng cách chỉ đọc `phat` khi hàm trả về thành công; ca lỗi kỳ vọng hàm ném và `db.agentTask.count({ where: { reason: "deal.stage.changed", dealId: { in: ids } } })` = 0 khi dùng `withCrmEvents` thật của `AgentTriggerService`).

Ca nguyên tử cần điểm tiêm lỗi: `GiaiDoanService` nhận tham số `taoLoi?: (dealId: string, thuTu: number) => void` qua constructor thứ ba (chỉ test truyền; Nest provider dùng factory không truyền).

Run: `bun run test -- "cd apps/api && bun test test/giai-doan.spec.ts"` → FAIL (module chưa có).

- [ ] **Step 2: Service** — `giai-doan.service.ts` khuôn `settings.service.ts` (`@InjectDatabase() db`, `canManageSettings(await workspaceRoleOf(userId))`):

```ts
async list(userId: string) {
	const [canManage, rows, dem] = await Promise.all([
		this.canManage(userId),
		this.db.dealStage.findMany({ where: { archivedAt: null }, orderBy: [{ kind: "asc" }, { position: "asc" }] }),
		this.db.deal.groupBy({ by: ["stage"], _count: { _all: true } }),
	]);
	const theoId = new Map(dem.map((d) => [d.stage, d._count._all]));
	return { canManage, tran: GIAI_DOAN.tran.tong, stages: rows.map((g) => ({ id: g.id, label: g.label, kind: g.kind, position: g.position, dealCount: theoId.get(g.id) ?? 0 })) };
}

private async khoaSong(tx: Prisma.TransactionClient) {
	return tx.$queryRaw<Array<{ id: string; label: string; kind: LoaiGiaiDoan; position: number }>>`
		SELECT id, label, kind, position FROM "dealStage" WHERE "archivedAt" IS NULL FOR UPDATE`;
}

private nhanTrung(song: { id: string; label: string }[], label: string, boQua?: string) {
	const k = label.trim().toLocaleLowerCase("vi");
	return song.some((g) => g.id !== boQua && g.label.trim().toLocaleLowerCase("vi") === k);
}
```
  - `create`: `requireManager` → transaction: `khoaSong`; `song.length >= GIAI_DOAN.tran.tong` → BadRequest(`tran`); `nhanTrung` → BadRequest(`trung`); `position = max(position của kind) + 1` (hoặc 0).
  - `rename`: giai đoạn sống? không → NotFound(`khongCo`); `nhanTrung(..., id)`; update label.
  - `reorder`: `const cua = song.filter(g => g.kind === input.kind).map(g => g.id)`; `new Set(input.ids).size !== input.ids.length || input.ids.length !== cua.length || !input.ids.every(id => cua.includes(id))` → BadRequest(`danhSachLech`); update `position = index`.
  - `archive`: nguồn sống? `song.filter(g => g.kind === nguon.kind).length === 1` → BadRequest(`cuoiCung`); `const ids = (await tx.deal.findMany({ where: { stage: id }, select: { id: true } })).map(d => d.id)` (không lọc `archivedAt`); `ids.length > 0 && !moveTo` → BadRequest(`conThoaThuan`); đích: sống, cùng kind, khác nguồn, không thì BadRequest(`dichSai`); với từng id: `this.taoLoi?.(dealId, i)`; `await this.deals.chuyenGiaiDoanTrongTx(tx, emit, { dealId, toStageId: moveTo, actingUserId, now })`; cuối: `tx.dealStage.update({ where: { id }, data: { archivedAt: now } })`. Cả khối trong `this.agent.withCrmEvents`. Cùng kind nên `closedAt`/`closedReason` không đổi — `chuyenGiaiDoanTrongTx` phải giữ nguyên hai trường khi `laDaDong(from.kind) === laDaDong(to.kind)` và `from.kind === to.kind` (thêm nhánh này ở Task 2 nếu chưa có; ca E7 bắt).

- [ ] **Step 3: Router + module** — khuôn `settings.router.ts` nhưng `@UseMiddlewares(PhamViDoiTacMiddleware)`:

```ts
@Router({ alias: "giaiDoan" })
@UseMiddlewares(PhamViDoiTacMiddleware)
export class GiaiDoanRouter {
	constructor(@Inject(GiaiDoanService) private readonly giaiDoan: GiaiDoanService) {}
	@Query({ output: giaiDoanListOutput, meta: restMeta("GET", "/deal-stages", ["Deal stages"]) })
	async list(@Ctx() ctx: AuthedTrpcContext) { return this.giaiDoan.list(ctx.user.id); }
	@Mutation({ input: giaiDoanCreateInput, output: giaiDoanWriteOutput, meta: restMeta("POST", "/deal-stages", ["Deal stages"]) })
	async create(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof giaiDoanCreateInput>) { return this.giaiDoan.create(ctx.user.id, input); }
	// rename PATCH /deal-stages/{id}, reorder POST /deal-stages/reorder, archive POST /deal-stages/{id}/archive
}
```
`GiaiDoanModule`: `imports: [TrpcModule, AgentModule, DealsModule]`, `providers: [GiaiDoanService, GiaiDoanRouter]`; `DealsModule` phải `exports: [DealsService]` (kiểm; thêm nếu thiếu). Đăng ký vào `app.module.ts`. Chạy `cd apps/api && bun run trpc:generate`.

- [ ] **Step 4: Quyền (E9)** — `apps/api/test/giai-doan-quyen.spec.ts` khuôn `chi-quan-tri-truong.spec.ts` (HTTP + `mintPhien`/`gieoThanhVien`, vai owner/admin/member/okr). Danh sách mutation rút từ `generated/server.ts`. member × 4 và okr × 4 → 403, dữ liệu không đổi; `giaiDoan.list` okr → 403 `KHONG_TRONG_PHAM_VI`, member → 200 `canManage: false`; owner/admin × 4 → 200. Chạy thêm `vai-chi-okr.spec.ts`; nếu nó đòi mục `DAU_VAO_HOP_LE` cho mutation mới thì thêm bốn mục hợp lệ (không đổi `ALIAS_CHO_PHEP`).

Run: `bun run test -- "cd apps/api && bun test test/giai-doan.spec.ts test/giai-doan-quyen.spec.ts test/vai-chi-okr.spec.ts"` → PASS.

- [ ] **Step 5: Phá-thử** — create gán position 0 (E2 «OPEN: giai doan moi o vi tri 0 != cuoi»); reorder bỏ kiểm đủ-đúng (E5); setStage bỏ kiểm archivedAt (E6); chuyển ngoài transaction (E7 «nguyen tu: 2 thoa thuan da doi sau loi»); đếm bỏ lưu trữ (E7 «S: count 2 != 3»); chuyển bằng updateMany (E7 «su kien 0 != 3»); so nhãn phân biệt hoa thường (E8); rename trải input (E8 «rename: kind OPEN -> WON»); bỏ `requireManager` ở rename (E9).

- [ ] **Step 6: Commit** — `git commit -m "feat(giai-doan-thoa-thuan): router giaiDoan — thêm, đổi tên, sắp xếp, xoá có chuyển"`

---

### Task 4: Agent đọc theo loại và in nhãn

**independent: true** (chỉ cần Task 1; chạy song song được với Task 3) · **Phục vụ:** E14

**Files:**
- Modify: `apps/agent/agent/lib/lookup.ts` (1-2, 69-80, 101, 137, 312, 326)
- Modify: `apps/agent/agent/lib/accounts.ts` (7-12, 160, 284, 355, 477-480, 497-504, 532-538, 637-638)
- Modify: `apps/agent/agent/lib/preamble.ts` (95, 116, 182, 207, 251, 289), `apps/agent/agent/lib/crm.ts` (188, 280), `apps/agent/agent/lib/builder-runtime.ts:767`
- Modify tests: `apps/agent/test/{lookup,accounts,preamble,okr-chup}.integration.spec.ts` (`DealStage.X` → `GIAI_DOAN_GOC.X`)
- Test: `apps/agent/test/giai-doan-agent.integration.spec.ts`

- [ ] **Step 1: Test (đỏ)** — khuôn `lookup.integration.spec.ts`; tạo ba giai đoạn `gdtt-agent-${suffix}-{open,won,lost}`, một thoả thuận mỗi cái + một ở `GIAI_DOAN_GOC.CONTRACT_SENT`. Ma trận 3 status × tập id bằng tập kỳ vọng tính từ kind của fixture. `readDealHistory` và `dealPreamble` của thoả thuận ở giai đoạn mới: chuỗi chứa nhãn, không chứa id `gdtt-agent-…`. Dọn: deal → dealStage → company → user.
- [ ] **Step 2: lookup** — bỏ import `DealStage` và `@crm/db/deal-stage`; `where.giaiDoan = status === "open" ? { kind: "OPEN" } : status === "won" ? { kind: "WON" } : status === "lost" ? { kind: "LOST" } : undefined`; select `giaiDoan: { select: { label: true } }`; trả `stage: deal.giaiDoan.label`.
- [ ] **Step 3: accounts** — `stageChangeMeta` cục bộ → `parseStageChangeMeta` từ `@crm/validation/giai-doan`; select `giaiDoan: { select: { label: true, kind: true } }`; `isOpen(stage)` → `kind === "OPEN"`; `stageHistory` map id → nhãn bằng một `db.dealStage.findMany({ where: { id: { in } } })`, id vắng giữ id; đầu ra `stage` = nhãn.
- [ ] **Step 4: preamble, crm, builder-runtime** — select `giaiDoan: { select: { label: true } }` và in `deal.giaiDoan.label`.
- [ ] **Step 5: Sửa test cũ** và chạy: `bun run test -- "cd apps/agent && bun test test/giai-doan-agent.integration.spec.ts test/lookup.integration.spec.ts test/accounts.integration.spec.ts test/preamble.integration.spec.ts test/okr-chup.integration.spec.ts"` → PASS. Test cũ kỳ vọng `stage === "CONTRACT_SENT"` (accounts 230, 288) đổi thành nhãn `"Contract sent"` — đây là thay đổi hành vi có chủ đích (AC-12).
- [ ] **Step 6: Phá-thử** — `won = [id "CLOSED_WON"]` → «won: thieu thoa thuan o giai doan WON moi».
- [ ] **Step 7: Commit** — `git commit -m "feat(giai-doan-thoa-thuan): agent lọc theo loại, in nhãn giai đoạn"`

---

### Task 5: App đọc danh sách giai đoạn động

**independent: false** (cần Task 3 — `giaiDoan.list` và `generated/server.ts`) · **Phục vụ:** E3, E19, một phần E15

**Files:**
- Create: `apps/app/lib/giai-doan.ts`; Delete: `apps/app/lib/deal-stage.ts`
- Modify: `apps/app/lib/trpc/cache.ts` (type `CrmCache` + nhóm `giaiDoan`; `cache.deal` rest thêm `trpc.giaiDoan.list.queryKey()`)
- Modify: `components/crm/{deal-stage,stage-change,stage-stepper}.tsx`, `components/crm/timeline/timeline-entry.tsx`, `components/crm/record-sheet/company-sheet.tsx`, `app/(app)/[slug]/deals/{deals-board,deals-table,deals-bulk-actions,create-deal-sheet}.tsx`, `deals/use-deal-board-move.ts`, `app/(app)/[slug]/{sales-dashboard,dashboard-summary}.tsx`, `components/agent-builder/deal-list-result.tsx`
- Modify tests: `apps/app/test/keo-tha-thoa-thuan.dom.tsx` (thêm `giaiDoan.list` vào tRPC giả, `THU_TU` là chuỗi), `apps/app/test/so-kr.dom.tsx`
- Test: `apps/app/test/giai-doan-menu.dom.tsx`, `apps/app/test/giai-doan-timeline.dom.tsx`

**Interfaces — Produces:**
```ts
"use client";
export type GiaiDoanHien = { id: string; label: string; kind: "OPEN" | "WON" | "LOST"; position: number; dealCount: number };
export function useGiaiDoan(): {
	stages: GiaiDoanHien[]; open: GiaiDoanHien[]; theoId: Map<string, GiaiDoanHien>;
	label(id: string): string; laThua(id: string): boolean; laDaDong(id: string): boolean;
	mau(id: string): string; tone(id: string): StatusTone; dangTai: boolean;
};
export function mauGiaiDoan(g: GiaiDoanHien | undefined, open: GiaiDoanHien[]): string;   // OPEN: var(--chart-1..4) theo chỉ số xoay vòng; WON/LOST/khác: var(--chart-5)
export function toneGiaiDoan(g: GiaiDoanHien | undefined): StatusTone;                   // OPEN "info", WON "success", LOST "error", vắng "neutral"
```
`label(id)` khi id chưa có trong danh sách (đang tải) trả chính id.

- [ ] **Step 1: Test menu (đỏ)** — `giai-doan-menu.dom.tsx` khuôn `keo-tha-thoa-thuan.dom.tsx` (mock `@/lib/trpc/client` với `thuTuc("giaiDoan.list", () => ({ canManage: true, tran: 20, stages: NAM }))`, `NAM` là 5 giai đoạn tên mới, parse qua `giaiDoanListOutput` của `apps/api/src/giai-doan/giai-doan.contracts`). Render `DealStageMenu` và `StageStepper`: mục menu = 5 nhãn theo thứ tự; stepper = các OPEN theo thứ tự. Đối chứng: `stages` = 7 giai đoạn gốc → 7 mục.
- [ ] **Step 2: Test timeline (đỏ)** — `giai-doan-timeline.dom.tsx`: entry `activities.timeline` giả có `stageChange` (hình dạng từ `z.infer<typeof activityEntryOutput>`) của một giai đoạn đã xoá vắng khỏi `giaiDoan.list` giả và một giai đoạn sống đã đổi tên; khẳng định 4 vế theo E19.
- [ ] **Step 3: `lib/giai-doan.ts`** — `useGiaiDoan` = `useQuery(trpc.giaiDoan.list.queryOptions())` + dẫn xuất (không lưu trạng thái trùng).
- [ ] **Step 4: Thay từng nơi dùng** (theo bảng trong spec):
  - `deal-stage.tsx`: thêm `"use client"`, `DealStageIndicator({ stage })` dùng `useGiaiDoan().tone/label`; nhãn bọc `<span translate="no">` (bỏ `ForeignText lang="en"` vì nhãn là dữ liệu người nhập).
  - `stage-change.tsx`: menu từ `stages`; `laThua(chosen)` thay `LOSING_STAGES.includes`; `CloseReasonDialog` bỏ so `"CLOSED_LOST"` — luôn dùng `m.close.asLost` (một lời chung cho loại Không thành).
  - `stage-stepper.tsx`: `RAIL = [...open, ...stages.filter(g => g.kind === "WON").slice(0, 1)]`; `exited = laThua(stage)`.
  - `timeline-entry.tsx`: đọc `entry.stageChange` (API đã gắn nhãn), bỏ zod `z.enum(DealStage)`; hiện `from.label → to.label` trong `translate="no"`.
  - `deals-board.tsx`: `label: column.label` (từ API); `use-deal-board-move.ts`: `laThua(to)`; `deals-table.tsx`: facet options từ `stages`; `deals-bulk-actions.tsx`: menu + `laThua`; `create-deal-sheet.tsx`: bỏ `useState("DEMO_BOOKED")` → không gửi `stage` khi người không chọn (máy chủ chọn OPEN đầu), Select liệt kê `open`; `company-sheet.tsx`: `open` theo `laDaDong`; `sales-dashboard.tsx`: `label: stage.label` từ API, `color: mau(stage.stage)`; `dashboard-summary.tsx`: indicator + `mau`; `deal-list-result.tsx`: `stage` từ agent đã là nhãn → hiện thẳng trong `translate="no"`, bỏ `humaniseStage`.
- [ ] **Step 5: Sửa test cũ** — `keo-tha-thoa-thuan.dom.tsx`: thêm `giaiDoan: { list: thuTuc(...) }` với 7 giai đoạn gốc; `so-kr.dom.tsx` nếu mock thiếu. Chạy `cd apps/app && bun run test:dom` → PASS, và `cd apps/app && bunx tsc --noEmit` → 0 lỗi.
- [ ] **Step 6: Phá-thử** — menu đọc hằng cứng cũ (E3 «muc 1: Demo booked != …»); timeline tra nhãn trong list (E19 «timeline: nhan G != <id>»).
- [ ] **Step 7: Commit** — `git commit -m "feat(giai-doan-thoa-thuan): app đọc giai đoạn động từ giaiDoan.list"`

---

### Task 6: Trang Cài đặt › Giai đoạn thoả thuận

**independent: false** (cần Task 5 — hook, cache) · **Phục vụ:** E10, E16, E15 (màn)

**Files:**
- Create: `apps/app/app/(app)/[slug]/settings/giai-doan/page.tsx` (server, khuôn `settings/currencies/page.tsx`: `generateMetadata` → `tieuDeTab.giaiDoan`, `PageShell width="page"`, prefetch `trpc.giaiDoan.list.queryOptions()`, `HydrateClient`)
- Create: `.../settings/giai-doan/giai-doan-settings.tsx` (client) — bố cục đúng như bản mẫu `apps/app/app/proto/_modules/giai-doan-thoa-thuan/index.tsx` đã qua design-pass: ba `Card` theo loại, `SortableList`/`SortableItem`, menu «…» (`DropdownMenu`), `Dialog` thêm/đổi tên, `ConfirmDialog` xoá trống, `Dialog`+`Select` xoá có chuyển; lý do đạt trần ở `PageShellDescription`; `canManage` từ `giaiDoan.list` khoá mọi điều khiển + dòng lý do dưới tiêu đề; `isError` → `Empty` + «Thử lại» (`refetch`); chưa có dữ liệu → khung xương ba thẻ.
- Create: `.../settings/giai-doan/hop-thoai-giai-doan.tsx` (hai hộp thoại, tách để tệp trang < 300 dòng)
- Modify: `apps/app/lib/messages/settings.ts` (en + vi: `thanhBen.giaiDoan`, `tieuDeTab.giaiDoan`, nhóm `giaiDoan: {...}`), `apps/app/test/messages-guard.spec.ts` (mục `GHIM` cho mỗi hàm có biến, ví dụ `"settings:giaiDoan.conThoaThuan": [...]`)
- Modify: `apps/app/lib/cai-dat-dieu-huong.ts` (sau `truong`: `{ khoa: "giaiDoan", href: \`${GOC_CAI_DAT}/giai-doan\` }`)
- Modify: `apps/app/lib/trpc/cache.ts` (đã thêm ở Task 5; trang gọi `cache.giaiDoan()` sau mỗi mutation, và `cache.everything`-kiểu diện rộng sau `archive` có chuyển — dùng `cache.giaiDoan()` + `cache.deal()`)
- Test: `apps/app/test/giai-doan-cai-dat.dom.tsx` (ca `khong-quyen`, `trang-thai`)

Luật lưu (docs/settings.md): sắp xếp lưu ngay, toast `toast(m.giaiDoan.daSapXep, { action: { label: m.giaiDoan.hoanTac, onClick: () => hoanTac(thuTuCu) } })` với `useRef` chống bấm đôi (khuôn `settings/organization/xac-nhan-luu-tru.tsx`); thêm/đổi tên có nút Lưu trong hộp thoại, tắt khi nhãn không hợp lệ theo `nhanGiaiDoan`; lỗi máy chủ hiện `FieldError` dưới ô, giữ chữ đã gõ. Mọi nhãn giai đoạn `translate="no"`.

- [ ] **Step 1: Test (đỏ)** — `giai-doan-cai-dat.dom.tsx` theo E10 (member: nút Thêm ×3 + tay cầm + menu «…» đều disabled/aria-disabled, dòng lý do đúng chuỗi messages; đối chứng admin) và E16 (7 ca).
- [ ] **Step 2: Messages + nav** → `cd apps/app && bun test test/messages-guard.spec.ts test/cai-dat-dieu-huong.spec.ts test/khung-trang-cai-dat.spec.ts test/pham-vi-man.spec.ts` PASS.
- [ ] **Step 3: Trang + hộp thoại** → `bun run test:dom` PASS.
- [ ] **Step 4: Phá-thử** — ẩn nút Thêm với member (E10 «member: nut Them bien mat thay vi khoa»); loading trả null (E16 «dang tai: khong co khung xuong»).
- [ ] **Step 5: Commit** — `git commit -m "feat(giai-doan-thoa-thuan): trang Cài đặt › Giai đoạn thoả thuận"`

---

### Task 7: Răng màn, răng quét tên, cổng thiết kế, tài liệu

**independent: false** (cần Task 6) · **Phục vụ:** E15, E17, E18 · tài liệu

**Files:**
- Create: `_acceptance/giai-doan-thoa-thuan/rang/man-giai-doan.mjs` (khuôn `_acceptance/keo-tha-thoa-thuan/rang/man-bang-cot.mjs`: `canhCay`, `man-that-lib.mjs`, puppeteer-core; ma trận 5 khổ × 2 tiếng; `KY_MONG = 36`; chạy trong phiên đo `tien-de`)
- Create: `_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs` (danh sách id lấy bằng `import { GIAI_DOAN_GOC } from "../../../packages/db/src/giai-doan.ts"`; quét `git ls-files` các thư mục của E17 trừ ngoại lệ; in số tệp, `< 50` → exit 2)
- Create: `_acceptance/giai-doan-thoa-thuan/rang/san-thiet-ke.mjs` (khuôn `keo-tha-thoa-thuan/rang/san-thiet-ke.mjs`, `VUNG` = `settings/giai-doan/*.tsx` + `components/crm/*.tsx`, mốc `truoc` = merge-base)
- Modify: `docs/api.md` (mục mới «Deal stages are rows» — bất biến, xoá = lưu trữ, dealCount gồm lưu trữ), `docs/settings.md` (bảng nhóm: Không gian làm việc · Chung · Tiền tệ · Trường · Giai đoạn thoả thuận; bảng width: `page`), `docs/telemetry.md` (`deals_by_stage`: khoá = id giai đoạn, không gửi nhãn)

- [ ] **Step 1** — viết ba răng; chạy xanh trên cây sạch.
- [ ] **Step 2: Phá-thử** — Item `whitespace-nowrap` (E15 «tran trang 320/vi»); bỏ `translate="no"` (E15); chèn `stage === "CLOSED_WON"` vào `dashboard.service.ts` (E17); `rounded-[7px]` (E18).
- [ ] **Step 3: Năm lệnh chứng** ở gốc: `bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build` → tất cả exit 0.
- [ ] **Step 4: Commit** — `git commit -m "test(giai-doan-thoa-thuan): răng màn, quét tên cũ, cổng thiết kế; docs"`

---

## Self-Review

- **Spec coverage:** dữ liệu + migration (T1) · luật theo loại (T1, T2) · API bất biến + chuyển khi xoá (T3) · bên tiêu thụ API (T2), agent (T4), app (T5) · trang Cài đặt (T6) · telemetry (T2) · timeline nhãn đã xoá (T2 + T5) · răng + tài liệu (T7). Hợp đồng: AC-1 T1 · AC-2/3/5/6/7 T3 · AC-4 T3 · AC-8 T3+T6 · AC-9 T2 · AC-10/11 T2 · AC-12 T4 · AC-13 T6+T7 · AC-14 T7.
- **Placeholder scan:** không còn TBD; các bước «khuôn X» trỏ tệp và dòng có thật do bản khảo 29/09 đọc.
- **Type consistency:** `stage` (id chuỗi) ở mọi contract; quan hệ Prisma `giaiDoan`; `LoaiGiaiDoan` một nguồn (`@crm/db/giai-doan`), zod `loaiGiaiDoan` ở `@crm/validation/giai-doan`; `chuyenGiaiDoanTrongTx` định nghĩa ở T2, dùng ở T3.
- **Review Focus:** năm dòng, mỗi dòng có ca ở task sở hữu.
