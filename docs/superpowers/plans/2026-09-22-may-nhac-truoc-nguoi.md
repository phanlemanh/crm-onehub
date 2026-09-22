# Máy nhắc trước người — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mỗi sáng 08:30 giờ VN, mỗi người có việc 30 ngày nhận đúng một tin Slack riêng; thẻ Tasks hiện kế hoạch im và mốc ngày; ai cũng tự theo dõi được một kế hoạch.

**Architecture:** Một hàm truy vấn có ngưỡng `viecCanNhac` ở `packages/db` là nguồn duy nhất. Tác tử (`apps/agent`) gọi nó trên nhịp dispatch mỗi phút để ghi hàng `AgentTask` loại `nhac-ke-hoach` (một hàng/người/ngày, chỉ mục duy nhất chặn trùng) rồi gửi Slack ở làn trực tiếp. API gọi cùng hàm cho `dashboard.summary`, và thêm bật/tắt theo dõi trên bảng mới `OnboardingWatch`.

**Tech Stack:** bun · turbo · Prisma 7 (`partialIndexes` preview) · NestJS + nestjs-trpc · eve (`apps/agent`) · Next.js App Router · TanStack Query · zod 4 · `@crm/ui`.

**Spec:** `docs/superpowers/specs/2026-09-22-may-nhac-truoc-nguoi-design.md` · hợp đồng `_acceptance/may-nhac-truoc-nguoi/contract.md` · phép đo `_acceptance/may-nhac-truoc-nguoi/evals.yaml` (E1–E15; lệnh ở `_acceptance/config.yaml` khoá `mn3_*`).

## Global Constraints

- Không viết chú thích trong code — mã mới lẫn mã sửa (`AGENTS.md`).
- Trí khôn ở `apps/agent`; API chỉ đọc hàm dùng chung và ghi hàng theo dõi — không gửi Slack, không lịch từ API.
- `/packages/ui` là nguồn giao diện duy nhất; không `className` ghi đè màu/viền của component chung; «màu cảnh báo» = `StatusIndicator tone="error"`.
- Mọi ngưỡng ở hằng `NHAC` trong `packages/db/src/onboarding-nhac.ts`: `{ gio: { gio: 8, phut: 30 }, muiGio: "Asia/Ho_Chi_Minh", sapHanNgay: 3, imSauNgay: 7, moc: [7, 14, 30], tran: 10 }`. Không số rời trong code hay test — test đọc `NHAC`.
- Mọi «ngày» là ngày giờ VN (`Asia/Ho_Chi_Minh`), không phải ngày UTC.
- `AgentTask.payload` của loại `nhac-ke-hoach` chỉ giữ mã và loại: `{ muc: [{loai, planId, stepId?}], daGui?: [{loai, planId, stepId?}] }`.
- Thiếu Slack, thiếu `SlackMemberMatch`, thiếu `APP_URL` không bao giờ ném.
- Chữ trên màn qua bảng tin nhắn có dấu (`apps/app/lib/messages/**`, guard `apps/app/test/messages-guard.spec.ts`); dữ liệu người nhập mang `translate="no"`.
- Tin Slack bằng tiếng Việt — xưởng không lưu ngôn ngữ (kho không có trường locale của workspace).
- lint:slop cấm tham số `unknown`, `Record<string, unknown>`, `typeof` lúc chạy, tham số `object`; Biome cấm khoá React bằng chỉ số mảng.
- Phân tích ở biên bằng Zod; payload `nhac-ke-hoach` có schema ở `packages/validation/src/nhac-ke-hoach.ts`.
- Tệp dưới 800 dòng: `onboarding.service.ts` đã 810 — không thêm vào đó.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture và một lượt phá-thử đỏ với thông điệp ghim (MEASURE-BIRTH-CLAUSE) — ghi lệnh phá-thử đã chạy vào mô tả commit của task.
- Năm lệnh chứng minh từ gốc kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `packages/db/prisma/schema.prisma` | `OnboardingWatch`; quan hệ ngược trên `OnboardingPlan`, `User`; chỉ mục duy nhất một phần trên `AgentTask` |
| `packages/db/prisma/migrations/<ts>_may_nhac_truoc_nguoi/migration.sql` | migration sinh bởi `prisma migrate dev` |
| `packages/db/src/agent-tasks.ts` | thêm `nhac-ke-hoach` vào `TASK_KINDS` và `DIRECT_KINDS` |
| `packages/db/src/onboarding-nhac.ts` (mới) | `NHAC`, ngày VN, `viecCanNhac`, `goiY` |
| `packages/db/package.json` | subpath `./onboarding-nhac` |
| `packages/validation/src/onboarding-activity.ts` | vết `theoDoi.bat`, `theoDoi.tat` |
| `packages/validation/src/nhac-ke-hoach.ts` (mới) | schema payload hàng nhắc |
| `apps/agent/agent/lib/nhac-ke-hoach.ts` (mới) | `lenLichNhac(now)`, `chayNhac(task, deps)` |
| `apps/agent/agent/lib/tin-nhac.ts` (mới) | dựng văn bản tin Slack từ `ViecNhac[]` |
| `apps/agent/agent/lib/dispatch.ts` | nhánh `nhac-ke-hoach` trong `handleDirect` |
| `apps/agent/agent/schedules/dispatch.ts` | gọi `lenLichNhac` cạnh `sweepBlankFacts` |
| `apps/agent/test/nhac-ke-hoach.integration.spec.ts` (mới) | E1–E6, E12 |
| `_acceptance/may-nhac-truoc-nguoi/rang/*.sql` (mới) | hai câu truy vấn đường đo |
| `apps/api/src/onboarding/onboarding-theo-doi.ts` (mới) | `OnboardingTheoDoi`: watch, unwatch, người theo dõi của một kế hoạch |
| `apps/api/src/onboarding/onboarding.router.ts`, `onboarding.module.ts`, `onboarding.contracts.ts`, `onboarding.service.ts` (chỉ `planById` gọi thêm) | thủ tục và khuôn |
| `apps/api/src/onboarding/onboarding-config.ts` | gỡ `stale` |
| `apps/api/src/dashboard/dashboard.service.ts`, `dashboard.contracts.ts` | `keHoachCanDeY` |
| `apps/api/src/generated/server.ts` | sinh lại |
| `apps/api/test/may-nhac.spec.ts` (mới), `apps/api/test/fixtures/may-nhac-payload.json` (mới) | E7, E8, E10, E15 |
| `apps/app/app/(app)/[slug]/dong-ke-hoach.tsx` (mới) | dòng «Kế hoạch im» / «Mốc ngày» |
| `apps/app/app/(app)/[slug]/dashboard-summary.tsx` | ghép dòng mới, đếm mô tả |
| `apps/app/components/crm/record-sheet/theo-doi-ke-hoach.tsx` (mới) | nút theo dõi |
| `apps/app/components/crm/record-sheet/plan-sheet.tsx` | đặt nút cạnh `MenuKeHoach` |
| `apps/app/lib/messages/nhac.ts` (mới) | chữ của hai màn |
| `apps/app/test/may-nhac.dom.tsx` (mới) | E9, E11 |
| `.env.example` | `APP_URL` cho tác tử |
| `docs/agent.md` | mục ngắn «Nhắc buổi sáng» |

Không task nào `independent: true`: T2 dựa trên kiểu của T1, T3 và T4 dựa trên T2, T5 dựa trên khuôn API của T4. Chạy tuần tự trong vòng chính.

---

### Task 1: Dữ liệu — `OnboardingWatch`, chỉ mục chống trùng, loại việc, vết theo dõi

**independent:** false · **phục vụ:** E4 (khoá), E7 (bảng, vết) · **verify:** `bun run db:generate && bun run check-types`

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `AgentTask` ~509, `OnboardingPlan` ~1720, `User` ~15)
- Create: `packages/db/prisma/migrations/<ts>_may_nhac_truoc_nguoi/migration.sql` (sinh)
- Modify: `packages/db/src/agent-tasks.ts:1-26`
- Modify: `packages/validation/src/onboarding-activity.ts` (union ~10, builder `vet` ~60)
- Create: `packages/validation/src/nhac-ke-hoach.ts`; Modify `packages/validation/package.json` exports

**Interfaces — Produces:**
- Prisma `db.onboardingWatch` với `{ id, planId, userId, createdAt }`, `@@unique([planId, userId])`.
- `"nhac-ke-hoach"` ∈ `TASK_KINDS`, `DIRECT_KINDS`.
- `vet.theoDoiBat()` → `{ kind: "theoDoi.bat" }`, `vet.theoDoiTat()` → `{ kind: "theoDoi.tat" }`.
- `@crm/validation/nhac-ke-hoach`: `LOAI_NHAC = ["buoc-qua-han","buoc-sap-han","ke-hoach-im","moc-ngay"] as const`, `type LoaiNhac`, `mucNhac`, `nhacPayload`, `type NhacPayload`, `parseNhacPayload(value: unknown): NhacPayload`.

- [ ] **Step 1: Schema.** Thêm vào `schema.prisma`:

```prisma
model OnboardingWatch {
  id        String         @id @default(cuid())
  planId    String
  plan      OnboardingPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  userId    String
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime       @default(now())

  @@unique([planId, userId])
  @@index([userId])
  @@map("onboardingWatch")
}
```

`OnboardingPlan` thêm `watches OnboardingWatch[]`; `User` thêm `onboardingWatches OnboardingWatch[]`. `AgentTask` thêm dưới `@@index([kind, subject], where: { finishedAt: null })`:

```prisma
  @@unique([kind, subject], map: "agentTask_nhac_mot_ngay", where: { kind: "nhac-ke-hoach" })
```

Nếu `prisma validate` từ chối dạng object cho so chuỗi, dùng `where: raw("kind = 'nhac-ke-hoach'")` — cả hai là cú pháp của preview `partialIndexes`; chọn dạng validate qua và ghi dạng đã chọn vào commit.

- [ ] **Step 2: Migration.** `cd packages/db && bun run db:migrate -- --name may_nhac_truoc_nguoi`. Mở `migration.sql` sinh ra, kiểm có `CREATE TABLE "onboardingWatch"` và `CREATE UNIQUE INDEX "agentTask_nhac_mot_ngay" ON "agentTask"("kind", "subject") WHERE (kind = 'nhac-ke-hoach')` (hoặc tương đương). Không sửa tay SQL.

- [ ] **Step 3: Loại việc.** `packages/db/src/agent-tasks.ts`: thêm `"nhac-ke-hoach"` cuối `TASK_KINDS` và cuối `DIRECT_KINDS`.

- [ ] **Step 4: Vết.** Trong union `onboardingActivityMeta` thêm hai nhánh:

```ts
z.object({ kind: z.literal("theoDoi.bat") }),
z.object({ kind: z.literal("theoDoi.tat") }),
```

và trong `vet`:

```ts
theoDoiBat: () => ({ kind: "theoDoi.bat" }) as const,
theoDoiTat: () => ({ kind: "theoDoi.tat" }) as const,
```

`vetCoCongTy` không đổi (hai vết mới không gắn công ty). Mọi `switch` trên `meta.kind` ở `apps/app` (dòng thời gian kế hoạch) phải có nhánh cho hai loại mới — tìm bằng `rg -n "buoc.boXong" apps/app` và thêm câu hiển thị «đã theo dõi» / «đã bỏ theo dõi» qua bảng tin nhắn của tệp đó.

- [ ] **Step 5: Schema payload.** `packages/validation/src/nhac-ke-hoach.ts`:

```ts
import { z } from "zod";

export const LOAI_NHAC = ["buoc-qua-han", "buoc-sap-han", "ke-hoach-im", "moc-ngay"] as const;
export type LoaiNhac = (typeof LOAI_NHAC)[number];

export const mucNhac = z
	.object({ loai: z.enum(LOAI_NHAC), planId: z.string().min(1), stepId: z.string().min(1).optional() })
	.strict();

export const nhacPayload = z
	.object({ muc: z.array(mucNhac), daGui: z.array(mucNhac).optional() })
	.strict();

export type NhacPayload = z.infer<typeof nhacPayload>;

export function parseNhacPayload(value: unknown): NhacPayload {
	const ket = nhacPayload.safeParse(value);
	if (!ket.success) throw new Error(`payload nhac-ke-hoach hong: ${ket.error.message}`);
	return ket.data;
}
```

Thêm `"./nhac-ke-hoach": "./src/nhac-ke-hoach.ts"` vào `exports` của `packages/validation/package.json`. (`value: unknown` ở đây là đúng biên parse theo mẫu `agent-manifest.ts`; nếu lint:slop cắn thì theo đúng cách `parseAgentManifest` đang qua lint.)

- [ ] **Step 6: Verify.** `bun run db:generate && bun run check-types` → exit 0.

- [ ] **Step 7: Commit.** `git add packages/db packages/validation apps/app && git commit -m "feat(db): OnboardingWatch, khoa nhac mot ngay, vet theo doi"`

---

### Task 2: `viecCanNhac` — nguồn duy nhất của bốn loại nhắc

**independent:** false · **phục vụ:** E1, E2, E3 · **verify:** `bun run test -- "cd apps/agent && bun test test/nhac-ke-hoach.integration.spec.ts -t 'dung-nguoi|bien-nguong|nua-dem'"`

**Files:**
- Create: `packages/db/src/onboarding-nhac.ts`; Modify `packages/db/package.json` exports (`"./onboarding-nhac": "./src/onboarding-nhac.ts"`)
- Modify: `apps/api/src/onboarding/onboarding-config.ts` (gỡ khối `stale`)
- Create: `apps/agent/test/nhac-ke-hoach.integration.spec.ts` (phần `describe("viec-can-nhac")`)

**Interfaces — Produces (`@crm/db/onboarding-nhac`):**

```ts
export const NHAC: { gio: { gio: 8; phut: 30 }; muiGio: "Asia/Ho_Chi_Minh"; sapHanNgay: 3; imSauNgay: 7; moc: readonly [7, 14, 30]; tran: 10 };
export function ngayVN(d: Date): string;
export function soNgayVN(tu: Date, den: Date): number;
export function daToiGioNhac(now: Date): boolean;
export type ViecNhac = {
	loai: LoaiNhac; planId: string; stepId?: string; companyName: string; nhan: string;
	goiY: string; han?: string; soNgay?: number; soBuocXong?: number; soBuocTong?: number;
};
export function viecCanNhac(db: Db, chon: { now: Date; userId?: string }): Promise<Map<string, ViecNhac[]>>;
```

Luật (bản sao nguyên văn của design doc mục 3):
- Kế hoạch đang chạy = `closedAt: null`. Người nhận chỉ là người có hàng `Member` với `organizationId = WORKSPACE_ID` (`@crm/db/workspace`).
- `buoc-qua-han`: bước chưa xong, `ngayVN(dueAt) < ngayVN(now)` → người được giao; `soNgay` = số ngày trễ; `han` = `ngayVN(dueAt)`.
- `buoc-sap-han`: bước chưa xong, `0 ≤ soNgayVN(now, dueAt) ≤ NHAC.sapHanNgay` → người được giao.
- `ke-hoach-im`: `soNgayVN(moiNhat, now) ≥ NHAC.imSauNgay`, `moiNhat` = `max(step.updatedAt)` hoặc `startedAt` → người cầm trịch + mọi người theo dõi; `soNgay` = số ngày im.
- `moc-ngay`: `soNgayVN(startedAt, now) + 1 ∈ NHAC.moc` → người cầm trịch + người theo dõi; `soNgay` = ngày thứ; `soBuocXong`, `soBuocTong` đếm thật.
- `goiY` của `ke-hoach-im`, việc đầu tiên khớp thắng: bước chưa xong chưa giao đầu tiên theo `position` → `Giao bước «${nhan}»`; không có mà có bước quá hạn → `Bước «${nhan}» quá hạn ${n} ngày — hỏi ${tenNguoiGiao}`; còn lại bước chưa xong kế tiếp → `Bước kế: «${nhan}», hạn ${dd/mm}`. `goiY` của `buoc-*` = `nhan`; của `moc-ngay` = `${soBuocXong}/${soBuocTong} bước xong`.
- Một người nhận hai lần cùng `(loai, planId)` (vừa cầm trịch vừa theo dõi) chỉ có một mục.
- Thứ tự trong danh sách của mỗi người: `buoc-qua-han`, `buoc-sap-han`, `ke-hoach-im`, `moc-ngay`; trong mỗi loại theo `han` rồi `planId`.

- [ ] **Step 1: Test đỏ trước.** Tạo `apps/agent/test/nhac-ke-hoach.integration.spec.ts`. Tiền tố gieo `mn3-`. Bộ gieo dùng `db` thật: `db.user.create`, `db.member.create({ organizationId: WORKSPACE_ID, ... })`, `db.company.create`, `db.department`/`onboardingTemplate` theo cách `apps/api/test/support/ke-hoach-gieo.ts` đang gieo (đọc tệp đó, chép khuôn tối thiểu vào `apps/agent/test/support/nhac-gieo.ts` — không import chéo từ `apps/api`). `afterEach` xoá theo tiền tố. Ba `describe` mang đúng tag lệnh:

```ts
describe("dung-nguoi", () => {
	test("dung-nguoi: moi loai nhac toi dung nguoi, ngoai le khong nhan", async () => {
		setSystemTime(new Date("2026-10-10T02:00:00Z"));
		const g = await gieoAc1();
		const kq = await viecCanNhac(db, { now: new Date() });
		const tap = (id: string) => (kq.get(id) ?? []).map((m) => `${m.loai}:${m.stepId ?? m.planId}`).sort();
		expect(tap(g.A.id), "A").toEqual([`buoc-qua-han:${g.B1.id}`, `buoc-sap-han:${g.B2.id}`].sort());
		expect(tap(g.O.id), "O").toEqual([`ke-hoach-im:${g.P1.id}`, `moc-ngay:${g.P1.id}`].sort());
		expect(tap(g.W.id), "W").toEqual([`ke-hoach-im:${g.P1.id}`, `moc-ngay:${g.P1.id}`].sort());
		const moiMa = [...kq.values()].flat().flatMap((m) => [m.planId, m.stepId]);
		expect(moiMa.filter((x) => [g.B3.id, g.B4.id, g.B5.id, g.P2.id].includes(x ?? "")), "khong ai nhan gi ve P2").toEqual([]);
		expect(kq.has(g.R.id), "R da roi xuong khong nhan").toBe(false);
		await db.member.create({ data: { id: `mn3-mem-${g.R.id}`, organizationId: WORKSPACE_ID, userId: g.R.id, role: "member", createdAt: new Date() } });
		const lai = await viecCanNhac(db, { now: new Date() });
		expect(tap2(lai, g.R.id), "doi chung duong: R tro lai thi nhan P3").toContain(`ke-hoach-im:${g.P3.id}`);
	});
});
```

`gieoAc1` dựng đúng Given của AC-1 (ngày VN 2026-10-10 09:00; P1 bắt đầu `2026-09-27T00:00+07:00` nên hôm nay là ngày thứ 14; `updatedAt` mới nhất của bước P1 là 8 ngày trước — đặt bằng `db.onboardingStep.update({ data: { updatedAt } })` sau khi gieo). `describe("bien-nguong")` có sáu cặp của E2, mỗi cặp hai `expect` với thông điệp ghim như E2 (`"im dung imSauNgay la ke-hoach-im"`, `"con buoc chua giao thi Giao bước"`, …), giá trị suy từ `NHAC`. `describe("nua-dem")` có hai `setSystemTime` của E3 với thông điệp `"00:30 VN ngay 11 thi da qua han"`.

- [ ] **Step 2: Chạy, xác nhận đỏ.** Lệnh verify ở trên → FAIL «Cannot find module '@crm/db/onboarding-nhac'».

- [ ] **Step 3: Viết `onboarding-nhac.ts`.** Ngày VN dùng `Intl.DateTimeFormat("en-CA", { timeZone: NHAC.muiGio, year: "numeric", month: "2-digit", day: "2-digit" }).format(d)` → `YYYY-MM-DD`; `soNgayVN(tu, den)` = hiệu hai ngày đó chia `DAY_MS` (`Date.UTC` của từng chuỗi); `daToiGioNhac(now)` so giờ và phút VN (`Intl.DateTimeFormat(..., { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })`) với `NHAC.gio`. `viecCanNhac` làm ba truy vấn song song: kế hoạch đang chạy kèm `steps` (`select id, label, position, dueAt, completedAt, updatedAt, assigneeId, assignee{name}`), `company{name}`, `watches{userId}`, `ownerId`; tập `userId` thành viên; rồi dựng `Map` bằng hàm thuần `dungViec(keHoach, thanhVien, now)`. `userId` truyền vào thì lọc kế hoạch có `ownerId = userId` hoặc có watch của userId hoặc có bước giao cho userId, và trả map chỉ một khoá. Không `typeof`, không `unknown`.

- [ ] **Step 4: Gỡ `stale`.** Xoá khối `stale: { warnAfterMs: 7 * DAY_MS }` khỏi `onboarding-config.ts`; `rg -n "stale" apps/api/src/onboarding` phải không còn chỗ đọc nó (không có — đã kiểm ở S1).

- [ ] **Step 5: Chạy xanh.** Lệnh verify → PASS, ≥ 3 test.

- [ ] **Step 6: Phá thử.** Trên bản sao: bỏ `closedAt: null` → `dung-nguoi` đỏ với «khong ai nhan gi ve P2»; đổi `>=` thành `>` ở ngưỡng im → `bien-nguong` đỏ với «im dung imSauNgay la ke-hoach-im»; thay `ngayVN` bằng `toISOString().slice(0,10)` → `nua-dem` đỏ với «00:30 VN ngay 11 thi da qua han». Hoàn lại.

- [ ] **Step 7: Commit.** `git commit -m "feat(db): viecCanNhac va NHAC; go ONBOARDING.stale"` kèm dòng «phá thử: …» trong thân.

---

### Task 3: Tác tử — lượt quét, làn gửi Slack, đường đo

**independent:** false · **phục vụ:** E4, E5, E6, E12 · **verify:** `bun run test -- "cd apps/agent && bun test test/nhac-ke-hoach.integration.spec.ts -t 'quet-mot-lan|gui-slack|khong-kenh|duong-do'"`

**Files:**
- Create: `apps/agent/agent/lib/nhac-ke-hoach.ts`, `apps/agent/agent/lib/tin-nhac.ts`
- Modify: `apps/agent/agent/lib/dispatch.ts:86` (`handleDirect`), `apps/agent/agent/schedules/dispatch.ts:15`
- Create: `_acceptance/may-nhac-truoc-nguoi/rang/ngay-im-trung-vi.sql`, `_acceptance/may-nhac-truoc-nguoi/rang/xong-dung-han-sau-nhac.sql`
- Modify: `.env.example` (khối biến của tác tử), `docs/agent.md` (mục mới «Nhắc buổi sáng» sau «Stale rows are closed on the dispatch tick»)
- Test: `apps/agent/test/nhac-ke-hoach.integration.spec.ts` (thêm bốn `describe`)

**Interfaces — Consumes:** `viecCanNhac`, `NHAC`, `ngayVN`, `daToiGioNhac` (T2); `parseNhacPayload`, `LoaiNhac` (T1); `sendSlackMessage(accessToken, destination, text, clientMessageId, { fetcher })` (`run-runtime.ts:593`); `slackAccessToken()` (`slack-connection.ts:3`); `completeTask(taskId, outcome)` (`tasks.ts:99`).

**Produces:**

```ts
export const LOAI_VIEC_NHAC = "nhac-ke-hoach";
export function chuDeNhac(userId: string, now: Date): string;
export async function lenLichNhac(now?: Date): Promise<{ ghi: number }>;
export type PhuThuocGui = { fetcher?: typeof fetch; appUrl?: string | null };
export async function chayNhac(task: { id: string; subject: string | null; payload: Prisma.JsonValue }, deps?: PhuThuocGui): Promise<"da-gui" | "khong-slack" | "khong-khop" | "khong-viec">;
export function dungTin(ten: string, viec: ViecNhac[], lienKet: (planId: string) => string | null): { text: string; daGui: ViecNhac[] };
```

- [ ] **Step 1: Test đỏ.** Thêm vào spec:
  - `describe("quet-mot-lan")`: gieo A (bước quá hạn), O (kế hoạch im), N (không việc). Gọi `lenLichNhac` với `setSystemTime` 08:29 VN (`2026-10-10T01:29:00Z`), 08:31, 10:00, rồi `2026-10-11T01:31:00Z`; sau mỗi lần đếm `db.agentTask.findMany({ where: { kind: "nhac-ke-hoach", subject: { startsWith: "user:mn3-" } } })` theo ma trận E4 (thông điệp «quet lai cung ngay khong them hang»). Ca chồng nhau: fixture sạch, `await Promise.all([lenLichNhac(t), lenLichNhac(t)])` → đúng 2 hàng («hai luot chong nhau van mot hang moi nguoi»). Mỗi `payload` qua `parseNhacPayload`, khoá của mọi mục ⊆ `{loai, planId, stepId}`.
  - `describe("gui-slack")`: gieo `db.account` Slack (`providerId: "slack"`, `accessToken: "xoxb-mn3"`) và `db.slackMemberMatch` cho A (`slackUserId: "U-MN3-A"`). `fetcher` giả ghi `{url, body}` và trả `{ ok: true, channel: { id: "D1" } }` cho `conversations.open`, `{ ok: true, channel: "D1", ts: "1" }` cho `chat.postMessage`. Gọi `lenLichNhac` rồi `chayNhac(hang, { fetcher, appUrl: "https://crm.test" })`. Ma trận E5: một `conversations.open` với `users` = `U-MN3-A`; một `chat.postMessage`; `text.indexOf("Quá hạn") < text.indexOf("Sắp hạn") < text.indexOf("Kế hoạch im")`; với từng việc gieo, dòng chứa tên công ty của việc đó kết thúc bằng `?record=plan:${planId}` («dong mo dung ke hoach cua no»); đọc lại hàng: `finishedAt` khác null, `outcome` bắt đầu `da-gui`, `parseNhacPayload(payload).daGui` bằng đúng tập đã gửi; ca 12 việc: 10 dòng liên kết + «và 2 việc nữa», `daGui.length === 10`; ca `appUrl: null`: một `postMessage`, `text` không chứa `record=` và `undefined`, `outcome` `da-gui`.
  - `describe("khong-kenh")`: ba hàng của E6, `fetcher` đếm lời gọi = 0, `outcome` `khong-slack` / `khong-khop` / `khong-viec`; đối chứng dương: thêm `slackMemberMatch` cho ca 2 → `da-gui`.
  - `describe("duong-do")`: gieo đúng Given của AC-11; nhắc do chính `lenLichNhac` + `chayNhac` (fetcher giả, `NHAC.tran` bị vượt bằng 11 bước sắp hạn để một bước bị cắt); bước xong do chính `setStepDone`… — tác tử không có `setStepDone`, nên đánh dấu bằng đúng câu `db.onboardingStep.update({ data: { completedAt } })` mà `OnboardingGhi.setStepDone` ghi (đọc `apps/api/src/onboarding/onboarding-ghi.ts` và chép đúng hai trường nó đặt); đọc hai tệp SQL bằng `readFileSync(join(import.meta.dir, "../../../_acceptance/may-nhac-truoc-nguoi/rang/<tep>.sql"))`, chạy bằng `db.$queryRawUnsafe(sql, tu, den)`; kỳ vọng trung vị 6 («trung vi chi tinh ke hoach dang chay»), `dung = 1, mau = 2`; đối chứng: xong bước còn lại đúng hạn → `dung = 2`.

- [ ] **Step 2: Chạy, xác nhận đỏ** (thiếu module `nhac-ke-hoach`).

- [ ] **Step 3: `tin-nhac.ts`.** Nhóm theo `LOAI_NHAC` với tiêu đề `Quá hạn`, `Sắp hạn`, `Kế hoạch im`, `Mốc ngày`; dòng: `• ${companyName} · ${goiY}${han ? `, hạn ${dd/mm}` : ""}` rồi ` — <${lienKet}|mở kế hoạch>` khi `lienKet` khác null (mrkdwn của Slack); lời chào `Chào ${ten}, sáng nay có ${n} việc 30 ngày đầu cần bạn để ý.`; cắt ở `NHAC.tran` theo thứ tự nhóm, còn thừa `và ${k} việc nữa — mở tổng quan`. Trả `daGui` = đúng các việc đã thành dòng.

- [ ] **Step 4: `nhac-ke-hoach.ts`.**
  - `chuDeNhac(userId, now)` = `` `user:${userId}:${ngayVN(now)}` ``.
  - `lenLichNhac(now = new Date())`: `if (!daToiGioNhac(now)) return { ghi: 0 }`; `const viec = await viecCanNhac(db, { now })`; `db.agentTask.createMany({ data: [...].map(([userId, ds]) => ({ kind: LOAI_VIEC_NHAC, reason: "nhắc buổi sáng", subject: chuDeNhac(userId, now), dueAt: now, priority: 60, payload: { muc: ds.map(({ loai, planId, stepId }) => ({ loai, planId, ...(stepId ? { stepId } : {}) })) } })), skipDuplicates: true })`; trả `{ ghi: count }`.
  - `chayNhac(task, deps = {})`: `userId` tách từ `subject`; tính lại `viecCanNhac(db, { now: new Date(), userId })`; rỗng → `completeTask(id, "khong-viec")`; `slackAccessToken()` null → `khong-slack`; không có `db.slackMemberMatch.findUnique({ where: { crmUserId: userId } })` → `khong-khop`; còn lại `dungTin` với `lienKet = appUrl ? (planId) => `${appUrl}/${slug}?record=plan:${planId}` : () => null` (`slug` = `db.organization.findUnique({ where: { id: WORKSPACE_ID } }).slug`, `appUrl` mặc định `process.env.APP_URL?.trim() || null`), `sendSlackMessage(token, { kind: "user", resolution: "chosen", id: slackUserId, label: ten }, text, task.id, { fetcher })`, rồi `db.agentTask.update({ where: { id }, data: { payload: { ...payloadCu, daGui } } })` và `completeTask(id, `da-gui:${daGui.length}`)`. Lỗi Slack để ném — `runDirect` → `settle`/luật thử lại sẵn có lo.
  - Nếu `SlackRunDestination` đòi trường khác `{ kind, resolution, id, label }`, đọc định nghĩa trong `run-runtime.ts` và điền đúng; không nới kiểu.

- [ ] **Step 5: Nối dây.** `dispatch.ts` `handleDirect` thêm trước dòng mặc định:

```ts
if (task.kind === LOAI_VIEC_NHAC) {
	await chayNhac(task);
	return;
}
```

(`chayNhac` tự `completeTask`.) `schedules/dispatch.ts`: trong `Promise.all` thêm `lenLichNhac()` cạnh `sweepBlankFacts()`.

- [ ] **Step 6: SQL đường đo.** `ngay-im-trung-vi.sql` — tham số `$1` = thời điểm đo:

```sql
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY im)::float AS trung_vi
FROM (
  SELECT (($1::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
          - (COALESCE(MAX(s."updatedAt"), p."startedAt") AT TIME ZONE 'Asia/Ho_Chi_Minh')::date) AS im
  FROM "onboardingPlan" p
  LEFT JOIN "onboardingStep" s ON s."planId" = p.id
  WHERE p."closedAt" IS NULL
  GROUP BY p.id, p."startedAt"
) t
```

`xong-dung-han-sau-nhac.sql` — `$1`, `$2` = kỳ:

```sql
WITH gui AS (
  SELECT DISTINCT (m->>'stepId') AS step_id
  FROM "agentTask" t, jsonb_array_elements(t.payload->'daGui') m
  WHERE t.kind = 'nhac-ke-hoach' AND t.outcome LIKE 'da-gui%'
    AND m->>'loai' = 'buoc-sap-han'
    AND t."createdAt" >= $1 AND t."createdAt" < $2
)
SELECT
  COUNT(*) FILTER (WHERE s."completedAt" IS NOT NULL
    AND (s."completedAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date <= (s."dueAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date)::int AS dung,
  COUNT(*)::int AS mau
FROM gui JOIN "onboardingStep" s ON s.id = gui.step_id
```

Tên bảng/cột lấy đúng `@@map` trong schema (kiểm `onboardingPlan`, `onboardingStep`, `agentTask`).

- [ ] **Step 7: Tài liệu.** `.env.example` thêm cạnh biến tác tử: `# APP_URL — tác tử đọc để đặt đường mở kế hoạch trong nhắc buổi sáng; vắng thì tin vẫn gửi, không liên kết.` (dòng chú thích trong `.env.example` là tài liệu kho, không phải chú thích mã). `docs/agent.md` mục «Nhắc buổi sáng»: năm gạch — chạy trên nhịp dispatch, một hàng/người/ngày khoá bằng `agentTask_nhac_mot_ngay`, làn trực tiếp không mô hình, bốn `outcome`, `payload.daGui` là thứ thước đọc.

- [ ] **Step 8: Chạy xanh + phá thử.** Lệnh verify PASS. Phá: bỏ `skipDuplicates` và chỉ mục (bản sao schema không áp được — thay bằng xoá `skipDuplicates` và gọi `create` từng hàng) → ca chồng nhau đỏ; gán `planId` dòng đầu cho kế hoạch khác trong `dungTin` → «dong mo dung ke hoach cua no»; bỏ nhánh `slackMemberMatch` → «khong khop thi khong goi Slack»; bỏ `closedAt IS NULL` trong SQL → «trung vi chi tinh ke hoach dang chay». Hoàn lại.

- [ ] **Step 9: Commit.** `git commit -m "feat(agent): nhac buoi sang tren nhip dispatch, lan gui Slack, duong do"`.

---

### Task 4: API — theo dõi và `keHoachCanDeY`

**independent:** false · **phục vụ:** E7, E8, E10, E15 · **verify:** `bun run test -- "cd apps/api && bun test test/may-nhac.spec.ts"`

**Files:**
- Create: `apps/api/src/onboarding/onboarding-theo-doi.ts` (`@Injectable() OnboardingTheoDoi`)
- Modify: `apps/api/src/onboarding/onboarding.module.ts` (providers), `onboarding.router.ts` (hai mutation), `onboarding.contracts.ts` (`watchInput`, `watchOutput`, `planDetailOutput` + `dangTheoDoi`, `nguoiTheoDoi`), `onboarding.service.ts` (`planById` nhận `actingUserId` và gộp kết quả của `OnboardingTheoDoi.cua(planId, actingUserId)` — chỉ sửa dòng gọi và chữ ký, không thêm thân hàm vào tệp 810 dòng)
- Modify: `apps/api/src/dashboard/dashboard.service.ts`, `dashboard.contracts.ts`
- Modify: `apps/api/src/generated/server.ts` (sinh lại bằng lệnh sinh của kho — `rg -n "generated/server" apps/api/package.json`)
- Create: `apps/api/test/may-nhac.spec.ts`, `apps/api/test/fixtures/may-nhac-payload.json`

**Interfaces — Produces:**
- `watchInput = z.object({ planId: z.string().min(1) })`; `watchOutput = z.object({ dangTheoDoi: z.boolean(), soNguoiTheoDoi: z.number().int() })`.
- tRPC `onboarding.watch`, `onboarding.unwatch` (input `watchInput`, output `watchOutput`; REST `POST /onboarding/plans/{planId}/watch`, `DELETE …/watch`).
- `planDetailOutput` thêm `dangTheoDoi: z.boolean()`, `nguoiTheoDoi: z.array(z.object({ id: z.string(), name: z.string() }))`.
- `dashboardSummaryOutput` thêm `keHoachCanDeY: z.array(keHoachCanDeYOutput)` với `keHoachCanDeYOutput = z.object({ loai: z.enum(["ke-hoach-im","moc-ngay"]), planId: z.string(), companyName: z.string(), goiY: z.string(), soNgay: z.number().int(), soBuocXong: z.number().int().optional(), soBuocTong: z.number().int().optional() })`.

- [ ] **Step 1: Test đỏ.** `apps/api/test/may-nhac.spec.ts` dùng harness `apps/api/test/support/ke-hoach-gieo.ts` (`gieoThanhVien`, `gieoKeHoach`, `dichVu`, `noi` …). Tag `describe`:
  - `theo-doi`: ma trận E7 ba dòng, đọc lại `db.onboardingWatch.findMany` và `db.activity.findMany({ where: { planId } })`, meta qua `parseOnboardingActivityMeta`; thông điệp «bat lan hai khong ghi vet thu hai».
  - `tong-quan`: gieo O cầm trịch P1 im 8 ngày ngày thứ 14 (dùng `setSystemTime` như E1), W theo dõi, X; `summary` của ba người theo ma trận E8, thông điệp «X khong lien quan thi khong co muc»; `mySteps` của O trước/sau gieo P1 bằng nhau.
  - `payload`: `summary(O).keHoachCanDeY` sau khi bỏ trường thời gian bằng `fixture.keHoachCanDeY` («fixture the Tasks khop dau ra that»).
  - `payload-theo-doi`: `watchInput.parse(fixture.batTheoDoi)` rồi gọi `watch` thật → một hàng; fixture thiếu `planId` → `safeParse` thất bại, 0 hàng («payload man gui khop schema watch»).
  Viết `may-nhac-payload.json` bằng cách chạy test `payload` một lần với cờ in (`MN3_IN=1`) rồi dán đầu ra thật — không gõ tay; `batTheoDoi` lấy từ đầu vào mà dom test T5 ghi lại (T5 Step 3 đối chiếu lại).

- [ ] **Step 2: Chạy, đỏ.**

- [ ] **Step 3: `OnboardingTheoDoi`.**

```ts
@Injectable()
export class OnboardingTheoDoi {
	constructor(private readonly db: DbService) {}

	async bat(input: WatchInput, actingUserId: string): Promise<WatchOutput> {
		return this.db.$transaction(async (tx) => {
			const plan = await tx.onboardingPlan.findUniqueOrThrow({ where: { id: input.planId }, select: { id: true, companyId: true } });
			const ton = await tx.onboardingWatch.findUnique({ where: { planId_userId: { planId: plan.id, userId: actingUserId } } });
			if (!ton) {
				await tx.onboardingWatch.create({ data: { planId: plan.id, userId: actingUserId } });
				await ghiVet(tx, plan, vet.theoDoiBat(), actingUserId);
			}
			return { dangTheoDoi: true, soNguoiTheoDoi: await tx.onboardingWatch.count({ where: { planId: plan.id } }) };
		});
	}
}
```

`tat` đối xứng (`deleteMany`, ghi `theoDoi.tat` chỉ khi `count > 0`). `cua(planId, actingUserId)` trả `{ dangTheoDoi, nguoiTheoDoi }` (join `user.name`, sắp theo tên). Dịch vụ DB và `ghiVet` lấy đúng tên đang dùng trong `onboarding-ghi.ts` (đọc đầu tệp đó). Kế hoạch không tồn tại → dùng đúng ngoại lệ 404 mà `onboarding-ghi.ts` đang dùng cho kế hoạch không có.

- [ ] **Step 4: Router + module + contracts** theo mẫu `closePlan` (router.ts:276); `planById` truyền `ctx.user.id`.

- [ ] **Step 5: Dashboard.** Trong `summary`: `keHoachCanDeY: await this.keHoachCanDeY(actingUserId, now)` với

```ts
private async keHoachCanDeY(userId: string, now: Date) {
	const ds = (await viecCanNhac(this.db, { now, userId })).get(userId) ?? [];
	return ds
		.filter((m) => m.loai === "ke-hoach-im" || m.loai === "moc-ngay")
		.slice(0, NHAC.tran)
		.map(({ loai, planId, companyName, goiY, soNgay, soBuocXong, soBuocTong }) => ({ loai, planId, companyName, goiY, soNgay: soNgay ?? 0, soBuocXong, soBuocTong }));
}
```

(kiểu `loai` thu hẹp bằng một hàm nhận dạng, không ép kiểu.)

- [ ] **Step 6: Sinh lại `generated/server.ts`**, chạy verify → PASS; phá thử ba đột biến E7/E8/E15; hoàn lại.

- [ ] **Step 7: Commit.** `git commit -m "feat(api): theo doi ke hoach, keHoachCanDeY tren tong quan"`.

---

### Task 5: App — hai loại dòng ở thẻ Tasks và nút theo dõi

**independent:** false · **phục vụ:** E9, E11, E14 (và chuẩn bị E13) · **verify:** `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/may-nhac.dom.tsx` rồi lệnh `mn3_san_thiet_ke`

**Files:**
- Create: `apps/app/app/(app)/[slug]/dong-ke-hoach.tsx`, `apps/app/components/crm/record-sheet/theo-doi-ke-hoach.tsx`, `apps/app/lib/messages/nhac.ts`, `apps/app/test/may-nhac.dom.tsx`
- Modify: `apps/app/app/(app)/[slug]/dashboard-summary.tsx` (~152–180 ghép dòng, mô tả), `apps/app/components/crm/record-sheet/plan-sheet.tsx:203`
- Tham chiếu hình dạng: bản mẫu `apps/app/app/proto/_modules/may-nhac-truoc-nguoi/{the-tong-quan,sheet-theo-doi}.tsx` (đã duyệt ở Cổng Phạm vi — chép khuôn, thay dữ liệu giả bằng dữ liệu thật)

**Interfaces — Consumes:** `RouterOutputs["dashboard"]["summary"]["keHoachCanDeY"]`, `RouterOutputs["onboarding"]["planById"]` với `dangTheoDoi`, `nguoiTheoDoi`; `trpc.onboarding.watch/unwatch`.

- [ ] **Step 1: Test đỏ.** `may-nhac.dom.tsx` theo khung giả tRPC của `apps/app/test/moi-phia-ke-hoach.dom.tsx` (chép hàm `thuTuc`, `trpcGia`, `mo`, `cho`, `bam`, `nut`; không import chéo tệp test). Dữ liệu từ `../../api/test/fixtures/may-nhac-payload.json`.
  - `the-tasks`: ma trận E9 năm dòng; dòng im có chữ «Kế hoạch im», tên công ty, `goiY`; dòng mốc có «Mốc ngày» và `${soBuocXong}/${soBuocTong}` lấy từ fixture; hai dòng không có `[role=checkbox]`; mô tả chứa «kế hoạch im»; bấm dòng im → `daMo` chứa `plan:${planId}` («the Tasks co dong Kế hoạch im»).
  - `nut-theo-doi`: sheet kế hoạch với `planById` giả `dangTheoDoi: false`; bấm «Theo dõi» → đúng một `onboarding.watch` với `dauVao` bằng `fixture.batTheoDoi`; nút «Đang theo dõi», `aria-pressed="true"`, số tăng một; lượt hai cho `watch` ném → nút «Theo dõi» và chữ «Không lưu được theo dõi» («loi thi nut ve lai Theo dõi»). Trong lúc lời gọi còn treo (promise chưa giải), nút có `disabled` — chứng trạng thái `ST-theodoi-dang-gui` mà design-pass để cho phép đo này.
- [ ] **Step 2: Chạy, đỏ.**
- [ ] **Step 3: Chữ.** `lib/messages/nhac.ts` hai ngôn ngữ theo mẫu `ke-hoach-noi.ts`: `keHoachIm`, `mocNgay`, `imNgay: "im {n} ngày"`, `ngayThu: "ngày {n}/{tong}"`, `buocXong: "{xong}/{tong} bước xong"`, `theoDoi`, `dangTheoDoi`, `khongLuu`, `moTaIm: "{n} kế hoạch im"`, `nguoiTheoDoi: "Người theo dõi"`. Dùng `dien()` của `plan-copy`. Chạy `messages-guard.spec.ts`.
- [ ] **Step 4: `dong-ke-hoach.tsx`.** Một `SimpleTableRow` cùng khuôn `DongBuoc` (`dong-buoc.tsx`), ô đầu không ô tích (giữ ô trống cùng rộng để cột thẳng), dòng phụ `goiY · Kế hoạch` với `RecordLink kind="plan"`, cột phải `StatusIndicator tone={loai === "ke-hoach-im" ? "error" : "neutral"}` nhãn `im N ngày` / `ngày N/30`. Tên công ty và `goiY` mang `translate="no"`.
- [ ] **Step 5: Thẻ Tasks.** `dashboard-summary.tsx`: nối `keHoachCanDeY` vào danh sách dòng sau `mySteps` (thứ tự: việc, bước theo hạn, rồi kế hoạch im, rồi mốc ngày); mô tả thêm vế `dien(m.moTaIm, { n })` khi có kế hoạch im. Không đổi `mySteps`.
- [ ] **Step 6: Nút theo dõi.** `theo-doi-ke-hoach.tsx`: `Button variant="outline" size="sm"` với `aria-pressed`, biểu tượng mắt (`@carbon/icons-react/es/View`), nhãn `Theo dõi` / `Đang theo dõi · N`; dưới khổ `sm` chỉ biểu tượng + số, nhãn đầy đủ ở `aria-label` (quyết định Cổng Phạm vi, sổ dòng 10); `Tooltip` liệt `nguoiTheoDoi` (`translate="no"`); `useMutation(trpc.onboarding.watch/unwatch.mutationOptions({ onSuccess: () => void cache.plan(planId), onError: () => setLoi(true) }))`; lỗi hiện `Alert` của `@crm/ui` trong sheet với «Không lưu được theo dõi» như bản mẫu. Gắn ở `plan-sheet.tsx:203`: `actions={plan ? <><TheoDoiKeHoach plan={plan} /><MenuKeHoach plan={plan} /></> : null}`.
- [ ] **Step 7: Chạy xanh, design-gate, phá thử** (bỏ render `keHoachCanDeY`; bỏ `onError`) → đỏ với thông điệp ghim; hoàn lại. Chạy lệnh `mn3_san_thiet_ke` → exit 0; phá thử span `bg-blue-600 text-gray-400` trên bản sao → khác 0.
- [ ] **Step 8: Commit.** `git commit -m "feat(app): the Tasks hien ke hoach im va moc ngay; nut theo doi ke hoach"`.

---

### Task 6: Chứng minh trọn vòng

**independent:** false · **phục vụ:** mọi eval · **verify:** năm lệnh

- [ ] **Step 1:** Từ gốc kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` — cả năm exit 0.
- [ ] **Step 2:** Chạy từng khoá `mn3_*` trong `_acceptance/config.yaml` (15 lệnh) — mỗi lệnh exit 0 và chạy ≥ 1 test (đọc dòng tổng của bun, không tin mỗi mã thoát).
- [ ] **Step 3:** Hồ sơ đã ký bị chạm (bài kiểm của `ke-hoach-la-mot-ban-ghi`, `moi-phia-deu-thay-ke-hoach`, `dieu-phoi-30-ngay-dau` nếu `planById` hay `dashboard.summary` đổi khuôn) — sửa fixture của chúng cho đúng khuôn mới, ghi entry `fix` vào sổ, ghim lại ở cuối nhánh (sau S4, trước PR).
- [ ] **Step 4:** Đặt contract `status: implemented`, commit, vào S4.
