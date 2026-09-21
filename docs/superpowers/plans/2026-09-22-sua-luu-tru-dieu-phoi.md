# Sửa, lưu trữ và phân quyền trên Điều phối 30 ngày — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nối sửa, sắp xếp, lưu trữ, khôi phục, xoá vĩnh viễn cho bộ phận và khuôn; đóng/mở lại kế hoạch; đánh dấu bậc phễu; khoá cấu hình theo vai trò; sửa Ngoài-1 và Ngoài-6.

**Architecture:** Máy chủ (`apps/api/src/onboarding`) thêm thủ tục restore/purge/reopen/access, siết schema ngày, kiểm quyền qua `canManageOnboarding` của `@crm/auth` theo khuôn `canManageCurrency`. Màn (`apps/app`) dùng lại khuôn Cài đặt › Trường: `SortableList`, `DropdownMenu`, `ConfirmDialog`, `toast`. Mỗi thay đổi đi kèm phép đo của `evals.yaml`, viết trước (đỏ) rồi mới làm (xanh).

**Tech Stack:** NestJS + nestjs-trpc (không transformer — JSON thuần), Prisma, Zod 4, Next.js, TanStack Query, `@crm/ui` (shadcn), sonner, bun test (jsdom qua `packages/ui/test/setup-dom.ts`).

**Spec:** `docs/superpowers/specs/2026-09-22-sua-luu-tru-dieu-phoi-design.md` · Hợp đồng: `_acceptance/sua-luu-tru-dieu-phoi/contract.md` · Bộ đo: `_acceptance/sua-luu-tru-dieu-phoi/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Không `console.log`; lỗi trả về người dùng bằng thông điệp tiếng Việt của máy chủ.
- `/packages/ui` là nguồn UI duy nhất; biến thể mới (tuỳ chọn bị khoá của Combobox) làm trong `packages/ui`.
- Client component chỉ import `@crm/ui`, tRPC client, React và mã app; không import `@crm/auth`, `@crm/db`.
- Hằng số chỉnh được sống trong `apps/api/src/onboarding/onboarding-config.ts` (máy chủ) hoặc một tệp config của khu vực (màn); không số ma thuật.
- Parse ở biên bằng Zod; không truyền `Record<string, unknown>`.
- tRPC không có transformer: đầu vào ngày đi dạng chuỗi `YYYY-MM-DD` và dùng `z.iso.date()`; đầu ra `Date` tới client là chuỗi.
- Nhãn mới có trong cả `vi` và `en` của `apps/app/lib/messages/onboarding.ts`; không khoá chết (messages-guard).
- `lint:slop` cấm tham số kiểu `unknown`.
- Mỗi phép đo mới: cặp hai chiều trên cùng fixture (lành → xanh; phá bản sao → đỏ với thông điệp ghim) — khối MEASURE-BIRTH-CLAUSE.
- Sau khi đổi router: `cd apps/api && bun run trpc:generate`.
- Cổng cuối: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## Bản đồ tệp

| Tệp | Trách nhiệm |
|---|---|
| `packages/auth/src/organization.ts`, `packages/auth/src/index.ts` | `canManageOnboarding` |
| `packages/auth/test/quyen-dieu-phoi.spec.ts` (mới) | E28 |
| `apps/api/src/onboarding/onboarding.contracts.ts` | schema ngày, `archived`, `purgeable`, `departmentName`, `contactName`, `accessOutput` |
| `apps/api/src/onboarding/onboarding.service.ts` | luật lưu trữ/khôi phục/xoá/đóng/mở, 409 ghi danh, kiểm quyền |
| `apps/api/src/onboarding/onboarding.router.ts` | thủ tục mới, `@Ctx()` cho thủ tục cấu hình |
| `apps/api/src/onboarding/onboarding-config.ts` | thông điệp lỗi dùng chung |
| `apps/api/test/sua-luu-tru.spec.ts` (mới) | E2 E4 E7 E9 E11 E13 E15 E17 E19 E21 E22 E24 |
| `packages/ui/src/components/combobox.tsx` | `ComboboxOption.disabled` |
| `apps/app/components/onboarding/khung-tao.tsx` | nút mở tuỳ chọn + khoá nút mở |
| `apps/app/lib/messages/onboarding.ts` | nhãn mới vi/en |
| `apps/app/app/(app)/[slug]/settings/onboarding/them-bo-phan.tsx` | chế độ sửa |
| `apps/app/app/(app)/[slug]/settings/onboarding/soan-khuon.tsx` | chế độ sửa |
| `apps/app/app/(app)/[slug]/settings/onboarding/danh-sach-bo-phan.tsx` (mới) | danh sách kéo-thả + menu |
| `apps/app/app/(app)/[slug]/settings/onboarding/danh-sach-khuon.tsx` (mới) | thẻ khuôn + menu |
| `apps/app/app/(app)/[slug]/settings/onboarding/da-luu-tru.tsx` (mới) | mục Đã lưu trữ |
| `apps/app/app/(app)/[slug]/settings/onboarding/cai-dat-dieu-phoi.tsx` | ghép, đọc `access` |
| `apps/app/app/(app)/[slug]/onboarding/[planId]/dong-mo-ke-hoach.tsx` (mới) | đóng/mở lại |
| `apps/app/app/(app)/[slug]/onboarding/[planId]/o-bac.tsx` (mới) | ô bậc |
| `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx` | danh sách môi giới + ô bậc, `departmentName` |
| `apps/app/app/(app)/[slug]/onboarding/[planId]/them-moi-gioi.tsx` | làm mờ người đã trong phễu |
| `apps/app/lib/ngay-lich.ts` (mới) | `ngayLichHomNay()` dùng chung (dời từ tao-ke-hoach) |
| `apps/app/test/sua-luu-tru.dom.tsx` (mới) | E1 E3 E5 E6 E8 E10 E12 E14 E16 E18 E20 E23 E25 E27 |

---

### Task 1: `canManageOnboarding` trong `@crm/auth`

**independent:** true · **phục vụ:** E28 (AC-9)

**Files:**
- Modify: `packages/auth/src/organization.ts` (sau `canManageTracking`)
- Modify: `packages/auth/src/index.ts` (danh sách export từ `./organization`)
- Create: `packages/auth/test/quyen-dieu-phoi.spec.ts`

**Interfaces:** Produces `canManageOnboarding(role: WorkspaceRole | null): boolean`.

- [ ] **Step 1: Viết phép đo đỏ**

```ts
import { describe, expect, test } from "bun:test";
import { canManageOnboarding, WORKSPACE_ROLES, type WorkspaceRole } from "../src";

const MONG_DOI: ReadonlyArray<[WorkspaceRole | null, boolean]> = [
	["owner", true],
	["admin", true],
	["member", false],
	[null, false],
];

describe("quyen-dieu-phoi", () => {
	test("ma tran vai tro khop WORKSPACE_ROLES", () => {
		const trongMaTran = MONG_DOI.flatMap(([vai]) => (vai === null ? [] : [vai]));
		expect([...trongMaTran].sort()).toEqual([...WORKSPACE_ROLES].sort());
	});

	for (const [vai, duoc] of MONG_DOI) {
		test(`vai ${String(vai)} -> ${duoc}`, () => {
			expect(`${String(vai)}: ${canManageOnboarding(vai)}`).toBe(`${String(vai)}: ${duoc}`);
		});
	}
});
```

- [ ] **Step 2:** `cd packages/auth && bun test test/quyen-dieu-phoi.spec.ts` → FAIL (`canManageOnboarding` không có).
- [ ] **Step 3: Làm**

```ts
export function canManageOnboarding(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}
```
và thêm `canManageOnboarding` vào khối export `./organization` của `index.ts`.

- [ ] **Step 4:** chạy lại → PASS 5/5. **Chiều đỏ:** sửa tạm thành `role === "admin"` → dòng `owner` đỏ với thông điệp `owner: false` ≠ `owner: true`; hoàn lại.
- [ ] **Step 5:** commit `feat(auth): canManageOnboarding cho cau hinh dieu phoi`.

---

### Task 2: Schema ngày, ghi danh không trùng, đóng/mở lại, tên trong dữ liệu bước và ghi danh

**independent:** false (cùng tệp với Task 3–5) · **phục vụ:** E19 E21 E22 E24, phần `departmentName` của E2, phần tên ghi danh của E20/E23

**Files:**
- Modify: `apps/api/src/onboarding/onboarding.contracts.ts`
- Modify: `apps/api/src/onboarding/onboarding.service.ts` (`createFromTemplate`, `closePlan`, mới `reopenPlan`, `listSteps`, `listEnrollments`, `upsertEnrollment`, `markEnrollmentStage`, `docKhuon`)
- Modify: `apps/api/src/onboarding/onboarding.router.ts` (thủ tục `reopenPlan`)
- Modify: `apps/api/src/onboarding/onboarding-config.ts` (thông điệp)
- Create: `apps/api/test/phien-thu.ts` — dời `kyCookie`, `mintPhien`, `COOKIE_NAME` từ `noi-bon-nut.spec.ts` ra đây (một bản duy nhất; `noi-bon-nut.spec.ts` import lại), thêm `gieoThanhVien(db, vai)` tạo user + member với vai trò cho sẵn
- Create: `apps/api/test/sua-luu-tru.spec.ts` (AppModule + `phien-thu.ts`, dọn theo tiền tố `slt`)

**Interfaces — Produces:**

```ts
export const ngayLich = z.iso.date().transform((s) => new Date(`${s}T00:00:00.000Z`));

planCreateFromTemplateInput.startedAt: ngayLich
enrollmentStageInput.at: ngayLich.nullable()
stepOutput += { departmentName: z.string() }
enrollmentOutput += { contactName: z.string() }
reopenPlan(input: PlanIdInput): Promise<PlanOutput>
planById(input: PlanIdInput): Promise<PlanOutput & { companyName: string }>
```

`ONBOARDING.thongDiep` (onboarding-config.ts) thêm:
```ts
daTrongPheu: "Người này đã có trong phễu.",
khuonDaLuuTru: (ten: string) => `Khuôn ${ten} đã lưu trữ — khôi phục trước khi tạo kế hoạch.`,
```

- [ ] **Step 1: Phép đo đỏ** trong `sua-luu-tru.spec.ts`, bốn `describe` đúng tên slug của config:
  - `api-ngay` (E22): ma trận viết trước `const SAI = [{truong:"startedAt",gia:undefined},{truong:"startedAt",gia:null},{truong:"startedAt",gia:1726963200000},{truong:"startedAt",gia:"21/09/2026"},{truong:"at",gia:undefined},{truong:"at",gia:1726963200000},{truong:"at",gia:"21/09/2026"}]` (7 ô); mỗi ô POST HTTP → `expect(\`${o.truong} ${res.status} ${body}\`)` chứa `400` và tên trường; đếm hàng DB trước/sau bằng nhau. Ô lành `"2026-09-21"` → 200, `startedAt.toISOString().slice(0,10) === "2026-09-21"`. Cuối: `db.onboardingPlan.count({ where: { startedAt: { lt: new Date("1971-01-01") } } }) === 0`.
  - `api-trung-pheu` (E24): ghi thẳng DB ghi danh X `source:"nen-tang"`; POST `onboarding.upsertEnrollment` X `source:"tay"` → 409, body chứa `Người này đã có trong phễu`, DB đúng một hàng, `source === "nen-tang"`. Đối chứng: Y → 200, `source === "tay"`.
  - `api-dong-mo` (E19): POST `closePlan` → `closedAt` khác null; `manDanhMuc` mặc định không có id, `status:"da-dong"` có; POST `reopenPlan` → `closedAt === null`, mặc định có lại.
  - `api-dong-mo` còn khẳng định `planById` trả `closedAt` đúng trước và sau khi đóng/mở (hồ sơ kế hoạch đọc trạng thái từ đây); id không có → 404.
  - `api-bac` (E21): POST `markEnrollmentStage {id, stage:"dealAt", at:"2026-09-20"}` → 200, `dealAt` UTC `2026-09-20`, ba bậc kia null; `at:null` → `dealAt` null.
  - Gọi tRPC qua HTTP bằng helper `goi(thuTuc, dauVao, cookie)` (POST `/api/trpc/onboarding.<thuTuc>`, thân JSON) cho mutation và GET `?input=` cho query.
- [ ] **Step 2:** `bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/sua-luu-tru.spec.ts -t api-ngay"` (và ba slug kia) → FAIL.
- [ ] **Step 3: Làm**
  - contracts: thêm `ngayLich`; `startedAt: ngayLich`; `at: ngayLich.nullable()`; `stepOutput`/`enrollmentOutput` thêm trường tên; `reopenPlan` dùng `planIdInput`/`planOutput`.
  - service `createFromTemplate`: `docKhuon` trả thêm `archivedAt`; `archivedAt !== null` → `throw new BadRequestException(ONBOARDING.thongDiep.khuonDaLuuTru(khuon.name))`.
  - service `upsertEnrollment` → tạo:

```ts
async upsertEnrollment(input: EnrollmentUpsertInput): Promise<EnrollmentOutput> {
	const co = await this.db.onboardingEnrollment.findUnique({
		where: { planId_contactId: { planId: input.planId, contactId: input.contactId } },
		select: { id: true },
	});
	if (co !== null) throw new ConflictException(ONBOARDING.thongDiep.daTrongPheu);
	const row = await this.db.onboardingEnrollment.create({
		data: { planId: input.planId, contactId: input.contactId, source: input.source },
		select: CHON_GHI_DANH,
	});
	return ghiDanhRa(row);
}
```
  với `CHON_GHI_DANH` (hằng `select` gồm `contact: { select: { firstName: true, lastName: true } }`) và `ghiDanhRa(row)` ghép `contactName` = `[firstName, lastName].filter(Boolean).join(" ")`; dùng chung cho `listEnrollments`, `markEnrollmentStage`.
  - `listSteps`: `select` thêm `department: { select: { name: true } }`, map ra `departmentName`.
  - `reopenPlan`: như `closePlan` nhưng `closedAt: null`.
  - `planById`: `findUnique` kèm `company: { select: { name: true } }`, vắng → `NotFoundException`; router `@Query({ input: planIdInput, output: planDetailOutput, meta: restMeta("GET", "/onboarding/plans/{id}", ["Onboarding"]) })`, `planDetailOutput = planOutput.extend({ companyName: z.string() })`.
  - router: `@Mutation({ input: planIdInput, output: planOutput, meta: restMeta("POST", "/onboarding/plans/{id}/reopen", ["Onboarding"]) }) reopenPlan(...)`.
  - `cd apps/api && bun run trpc:generate`.
- [ ] **Step 4:** bốn slug → PASS. **Chiều đỏ** từng eval (E19 bỏ `closedAt: null`; E21 `at: z.date()`; E22 `startedAt: z.coerce.date()` → ô null đỏ ghim `startedAt`; E24 trả về `update source`) — chạy, thấy đỏ đúng thông điệp, hoàn lại.
- [ ] **Step 5:** `bun run check-types` (client `ho-so-ke-hoach.tsx` còn đọc `listDepartments` để tra tên — vẫn biên dịch) → commit `feat(onboarding): ngay lich chat, ghi danh khong trung, mo lai ke hoach`.

---

### Task 3: Bộ phận — danh sách lưu trữ, chặn khi khuôn dùng, khôi phục, xoá vĩnh viễn, sắp xếp

**independent:** false · **phục vụ:** E2 E4 E7, phần bộ phận của E15

**Files:** contracts, service, router, `sua-luu-tru.spec.ts`

**Interfaces — Produces:**

```ts
export const archivedInput = z.object({ archived: z.boolean().default(false) }).default({ archived: false });
departmentOutput += { purgeable: z.boolean() }
listDepartments(input: ArchivedInput): Promise<DepartmentOutput[]>
restoreDepartment(input: DepartmentIdInput): Promise<DepartmentOutput>
purgeDepartment(input: DepartmentIdInput): Promise<{ id: string }>
```

`ONBOARDING.thongDiep` thêm:
```ts
boPhanTrongKhuon: (khuon: string[]) => `Bộ phận này còn nằm trong khuôn ${khuon.join(", ")} — sửa khuôn trước.`,
chuaLuuTru: "Chỉ xoá vĩnh viễn được thứ đã lưu trữ.",
daDung: "Đã được dùng nên không xoá vĩnh viễn được — lịch sử kế hoạch còn trỏ tới.",
```

- [ ] **Step 1: Phép đo đỏ**
  - `api-bo-phan` (E2, E4): quản trị đổi tên bộ phận có bước kế hoạch → DB + `listSteps` `departmentName` mới; `reorderDepartments` `[c,a,b]` → `listDepartments` đúng thứ tự và `position` DB 0,1,2; `archiveDepartment` → `listDepartments({archived:false})` không có, `({archived:true})` có; `listSteps` vẫn trả tên; `restoreDepartment` → về.
  - `api-chan-luu-tru` (E7): ma trận ba ca viết trước (trong khuôn chưa lưu trữ → 400 + tên khuôn + `archivedAt` null; chỉ trong khuôn đã lưu trữ → 200; không khuôn nào → 200); `expect(soCa).toBe(3)`.
  - `api-xoa-vinh-vien` phần bộ phận (E15): bộ phận lưu trữ chưa dùng → `purgeable` true, purge 200, hàng mất; đã có bước kế hoạch → `purgeable` false, purge 400, hàng còn; chưa lưu trữ → purge 400.
- [ ] **Step 2:** các slug → FAIL.
- [ ] **Step 3: Làm**
  - `khuonDungBoPhan(id)`: đọc `onboardingTemplate.findMany({ where: { archivedAt: null } })`, `parseOnboardingTemplateSteps`, lọc khuôn có bước `departmentId === id`, trả tên.
  - `archiveDepartment`: danh sách tên khác rỗng → `BadRequestException(boPhanTrongKhuon(ten))`.
  - `listDepartments({archived})`: `where: { archivedAt: archived ? { not: null } : null }`; `purgeable = archivedAt !== null && _count.steps === 0` (select `_count: { select: { steps: true } }`).
  - `restoreDepartment`: `update({ archivedAt: null })`.
  - `purgeDepartment`: chưa lưu trữ → 400 `chuaLuuTru`; có bước → 400 `daDung`; ngược lại `delete`.
  - router: `listDepartments` nhận `input: archivedInput`; hai thủ tục mới với `restMeta("POST", "/onboarding/departments/{id}/restore")` và `restMeta("DELETE", "/onboarding/departments/{id}")`.
  - `trpc:generate`.
- [ ] **Step 4:** PASS; chiều đỏ E4 (ghi position nghịch), E7 (bỏ `khuonDungBoPhan`), E15 (bỏ kiểm `daDung`, `purgeable` luôn true) → đỏ ghim tên ca; hoàn lại.
- [ ] **Step 5:** commit `feat(onboarding): luu tru, khoi phuc, xoa vinh vien bo phan`.

---

### Task 4: Khuôn — danh sách lưu trữ, khôi phục có chặn, kiểm bộ phận khi soạn/sửa, xoá vĩnh viễn

**independent:** false · **phục vụ:** E9 E11 E13, phần khuôn của E15

**Interfaces — Produces:**

```ts
templateOutput += { purgeable: z.boolean() }
listTemplates(input: ArchivedInput): Promise<TemplateOutput[]>
restoreTemplate(input: TemplateIdInput): Promise<TemplateOutput>
purgeTemplate(input: TemplateIdInput): Promise<{ id: string }>
```
`ONBOARDING.thongDiep.boPhanDaLuuTru: (ten: string[]) => \`Bộ phận ${ten.join(", ")} đã lưu trữ — khôi phục hoặc chọn bộ phận khác.\``

- [ ] **Step 1: Phép đo đỏ** — `api-khuon`: E9 (updateTemplate sau khi đã tạo kế hoạch → khuôn mới, bước kế hoạch cũ giữ nhãn/số lượng); E11 (archive → lọc đúng hai danh sách; `createFromTemplate` khuôn lưu trữ → 400; restore → về); E13 ma trận ba ca viết trước (restore có bước bộ phận lưu trữ; create với bước đó; update thêm bước đó → 400 chứa TÊN bộ phận, DB không đổi; đối chứng bộ phận đang dùng → thành công); `api-xoa-vinh-vien` phần khuôn (chưa kế hoạch → purge 200; có kế hoạch → 400).
- [ ] **Step 2:** FAIL.
- [ ] **Step 3: Làm** — `kiemBoPhanDangDung(steps)`: `department.findMany({ where: { id: { in: ids } } })`; id vắng → `NotFoundException`; có `archivedAt` → `BadRequestException(boPhanDaLuuTru(ten))`; gọi trong `createTemplate`, `updateTemplate` (khi `steps` có), `restoreTemplate`. `listTemplates({archived})` với `_count: { select: { plans: true } }` → `purgeable = archivedAt !== null && _count.plans === 0`. `purgeTemplate` như bộ phận. Router + `trpc:generate`.
- [ ] **Step 4:** PASS; chiều đỏ E9, E11, E13 (bỏ kiểm ở `createTemplate` → ca 2 đỏ), E15 phần khuôn; hoàn lại.
- [ ] **Step 5:** commit `feat(onboarding): luu tru, khoi phuc, xoa vinh vien khuon`.

---

### Task 5: Quyền cấu hình ở máy chủ

**independent:** false (cần Task 1, 3, 4) · **phục vụ:** E17

**Files:** router (thêm `@Ctx() ctx: AuthedTrpcContext` cho 11 thủ tục cấu hình + query `access`), service (`yeuCauQuanTri(userId)` + `access(userId)`), contracts (`accessOutput = z.object({ canManage: z.boolean() })`), spec.

**Interfaces — Produces:** `access(userId: string): Promise<{ canManage: boolean }>`; mọi thủ tục cấu hình nhận `userId` làm đối số đầu, ví dụ `createDepartment(userId: string, input)`.

```ts
private async yeuCauQuanTri(userId: string): Promise<void> {
	if (!canManageOnboarding(await workspaceRoleOf(userId))) {
		throw new ForbiddenException(ONBOARDING.thongDiep.canQuyenQuanTri);
	}
}
```
`canQuyenQuanTri: "Cần quyền quản trị để đổi cấu hình điều phối."`

- [ ] **Step 1: Phép đo đỏ** — `api-quyen`: ba người (chủ, quản trị, thành viên) tạo bằng `db.user.create` + `db.member.create({ organizationId: WORKSPACE_ID, role })`; ma trận `const CAU_HINH = ["createDepartment","updateDepartment","reorderDepartments","archiveDepartment","restoreDepartment","purgeDepartment","createTemplate","updateTemplate","archiveTemplate","restoreTemplate","purgeTemplate"] as const`; thành viên mỗi thủ tục → 403 và DB không đổi; `expect(soAssert).toBe(CAU_HINH.length)`; `access` thành viên false, quản trị true, chủ true; chủ `createDepartment` 200; thành viên `createFromTemplate`, `closePlan`, `reopenPlan`, `upsertEnrollment`, `markEnrollmentStage` → 200. Dọn member/user/session.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3: Làm** — router nhận `ctx.user.id`, service kiểm đầu mỗi thủ tục cấu hình. Sửa `apps/api/test/noi-bon-nut.spec.ts` gọi service với `userId` của một quản trị gieo trong tệp. `trpc:generate`.
- [ ] **Step 4:** PASS; chiều đỏ: bỏ `yeuCauQuanTri` ở `purgeTemplate` → đỏ ghim `purgeTemplate 200`; hoàn lại. Chạy lại `noi-bon-nut.spec.ts` → xanh.
- [ ] **Step 5:** commit `feat(onboarding): chi quan tri doi cau hinh dieu phoi`.

---

### Task 6: Nền màn — Combobox khoá tuỳ chọn, KhungTao mở từ ngoài, nhãn, ngày lịch dùng chung

**independent:** false · **phục vụ:** tiền đề E1 E8 E23

**Files:** `packages/ui/src/components/combobox.tsx`, `apps/app/components/onboarding/khung-tao.tsx`, `apps/app/lib/messages/onboarding.ts`, `apps/app/lib/ngay-lich.ts` (mới), `tao-ke-hoach.tsx`.

**Interfaces — Produces:**

```ts
type ComboboxOption = { value: string; label: string; hint?: string; keywords?: string[]; disabled?: boolean };
KhungTaoProps.nhanNut?: string
KhungTaoProps.khoaNut?: boolean
export function ngayLichHomNay(bayGio?: Date): string
```

- [ ] **Step 1:** Combobox: `CommandItem disabled={stale || option.disabled === true}` và `aria-disabled` theo đó. KhungTao: `nhanNut === undefined` → không render `SheetTrigger`; `khoaNut` → `disabled` cho nút mở.
- [ ] **Step 2:** `ngay-lich.ts`:

```ts
export function ngayLichHomNay(bayGio: Date = new Date()): string {
	const nam = bayGio.getFullYear();
	const thang = String(bayGio.getMonth() + 1).padStart(2, "0");
	const ngay = String(bayGio.getDate()).padStart(2, "0");
	return `${nam}-${thang}-${ngay}`;
}
```
`tao-ke-hoach.tsx` import từ đây thay cho hàm cục bộ.
- [ ] **Step 3:** Nhãn (vi và en, cùng khoá): `quanLy.{doiTen, sua, luuTru, khoiPhuc, xoaVinhVien, hoanTac, daLuuTru, daLuuTruTen, canQuyen, xacNhanLuuTru, xacNhanXoa, keHoachKhongDoi, keo}`, `keHoach.{dong, moLai, daDong, xacNhanDong}`, `bac.{accountAt, courseAt, activeAt, dealAt, boDanhDau}`, `tao.moiGioi.daTrongPheu`. Không khoá chết.
- [ ] **Step 4:** `bun run check-types` + `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/noi-bon-nut.dom.tsx` → xanh (không hồi quy). `cd packages/ui && bun test test/messages-guard.spec.ts` nếu nhãn nằm trong phạm vi guard.
- [ ] **Step 5:** commit `feat(ui): tuy chon khoa cua combobox, khung tao mo tu ngoai`.

---

### Task 7: Cài đặt › Điều phối — sửa, sắp xếp, lưu trữ + hoàn tác, khôi phục, xoá vĩnh viễn, khoá theo quyền

**independent:** false · **phục vụ:** E1 E3 E5 E6 E8 E10 E12 E14 E16 và phần cài đặt của E25

**Files:** `them-bo-phan.tsx`, `soan-khuon.tsx`, mới `danh-sach-bo-phan.tsx`, `danh-sach-khuon.tsx`, `da-luu-tru.tsx`, sửa `cai-dat-dieu-phoi.tsx`, `page.tsx` (prefetch `access` và danh sách lưu trữ), mới `apps/app/test/sua-luu-tru.dom.tsx`.

**Interfaces — Produces:**

```ts
ThemBoPhan({ sua?: { id: string; name: string }; dangMo?: boolean; doiMo?: (mo: boolean) => void; khoa: boolean })
SoanKhuon({ boPhan: BoPhanChon[]; sua?: KhuonSua; dangMo?: boolean; doiMo?: (mo: boolean) => void; khoa: boolean })
type KhuonSua = { id: string; name: string; partnerType: string | null; steps: { label: string; departmentId: string; offsetDays: number }[] }
DanhSachBoPhan({ boPhan: DepartmentRow[]; khoa: boolean })
DanhSachKhuon({ khuon: TemplateRow[]; boPhan: BoPhanChon[]; khoa: boolean })
DaLuuTru({ khoa: boolean })
```
Kiểu `DepartmentRow`/`TemplateRow` khai trong file client (không re-export kiểu máy chủ).

- [ ] **Step 1: Phép đo đỏ** — `sua-luu-tru.dom.tsx`: bộ giả tRPC ĐỦ mọi thủ tục mà cả tệp này lẫn `noi-bon-nut.dom.tsx` chạm (bộ nhớ: mock một phần làm tệp kia đỏ theo thứ tự nạp); dữ liệu giả của danh sách lưu trữ đi qua `departmentListOutput.parse` / `templateListOutput.parse` của API. Viết các `describe` đúng slug config: `doi-ten-bo-phan`, `sap-bo-phan`, `luu-tru-bo-phan`, `bi-chan-luu-tru`, `sua-khuon`, `luu-tru-khuon`, `khoi-phuc`, `xoa-vinh-vien`, `khoa-theo-quyen` — mỗi cái theo đúng `expected` của E tương ứng trong `evals.yaml` (ma trận viết trước, `expect(soCa).toBe(n)`, thông điệp ghim ở mọi assert).
- [ ] **Step 2:** từng slug → FAIL.
- [ ] **Step 3: Làm**
  - `ThemBoPhan`/`SoanKhuon`: `sua` có → điền sẵn khi mở, gọi `updateDepartment`/`updateTemplate`, `nhanNut` vắng (mở từ menu), `moTa` của Soạn khuôn ở chế độ sửa = `m.quanLy.keHoachKhongDoi`; `onError` giữ giá trị và `setLoi`.
  - `DanhSachBoPhan`: `SortableList` với `onReorder(ids)` → cập nhật lạc quan qua `queryClient.setQueryData(listDepartments.queryKey({archived:false}), …)`, `reorderDepartments.mutate({ids})`, `onError` → trả lại mảng cũ + `toast.error(error.message)`; mỗi dòng `DropdownMenu`: Đổi tên (mở `ThemBoPhan` chế độ sửa) · Lưu trữ (mở `ConfirmDialog` → `archiveDepartment`; thành công → `toast(m.quanLy.daLuuTruTen.replace("{ten}", ten), { action: { label: m.quanLy.hoanTac, onClick: () => restoreDepartment.mutate({id}) } })`; lỗi → `toast.error`). `khoa` → trigger menu và kéo bị khoá.
  - `DanhSachKhuon`: thẻ như hiện nay + `DropdownMenu`: Sửa · Lưu trữ (cùng khuôn toast Hoàn tác).
  - `DaLuuTru`: `Collapsible`; đọc `listDepartments({archived:true})` + `listTemplates({archived:true})`; rỗng cả hai → không render; mỗi dòng Khôi phục; `purgeable` → Xoá vĩnh viễn (ConfirmDialog).
  - `CaiDatDieuPhoi`: `useQuery(access)`; `khoa = !access.data?.canManage`; khoá → dòng `m.quanLy.canQuyen`.
  - Mọi mutation invalidate `listDepartments`/`listTemplates` cả hai giá trị `archived`.
- [ ] **Step 4:** slug → PASS; chiều đỏ theo từng E (ghi nhận lệnh + thông điệp đỏ vào mô tả commit); chạy `noi-bon-nut.dom.tsx` rồi `sua-luu-tru.dom.tsx` và ngược lại trong MỘT lệnh bun (`bun test … a b` và `… b a`) → cả hai xanh.
- [ ] **Step 5:** commit `feat(onboarding): sua, sap xep, luu tru, khoi phuc o Cai dat › Dieu phoi`.

---

### Task 8: Hồ sơ kế hoạch — đóng/mở lại, ô bậc, tên bộ phận, môi giới đã trong phễu, ngày tạo kế hoạch

**independent:** false · **phục vụ:** E1 (phần hồ sơ) E18 E20 E23 E27 và phần kế hoạch của E25

**Files:** mới `dong-mo-ke-hoach.tsx`, `o-bac.tsx`; sửa `ho-so-ke-hoach.tsx` (đọc `planById`), `them-moi-gioi.tsx`, `[planId]/page.tsx` (prefetch `planById`, bỏ prefetch `listDepartments`); test.

**Interfaces — Produces:**

```ts
DongMoKeHoach({ planId: string; closedAt: string | null })
OBac({ enrollmentId: string; planId: string; bac: "accountAt" | "courseAt" | "activeAt" | "dealAt"; ngay: string | null })
ThemMoiGioi({ planId: string; daTrongPheu: string[] })
```

- [ ] **Step 1: Phép đo đỏ** — `dong-mo-ke-hoach` (E18), `danh-dau-bac` (E20; `setSystemTime(new Date(2026, 8, 21, 23, 30))` dưới `TZ=Asia/Ho_Chi_Minh`; ba ca viết trước), `da-trong-pheu` (E23), `ngay-tao-ke-hoach` (E27), phần hồ sơ của `doi-ten-bo-phan` (E1: `listSteps` giả trả `departmentName` → hiện tên, không hiện mã).
- [ ] **Step 2:** FAIL.
- [ ] **Step 3: Làm**
  - `OBac`: ô trống → `markEnrollmentStage.mutate({ id, stage: bac, at: ngayLichHomNay() })`; ô có ngày → `Popover` + `Calendar` (chọn → `at` = ngày đó dạng `YYYY-MM-DD` từ ngày địa phương) + nút `m.bac.boDanhDau` (`at: null`); `disabled` khi `isPending`; lỗi → `toast.error`, giữ giá trị cũ; thành công invalidate `listEnrollments`.
  - `ho-so-ke-hoach.tsx`: badge bộ phận dùng `b.departmentName`; bỏ query `listDepartments`; dưới thanh phễu thêm danh sách môi giới (tên `contactName` + bốn `OBac`); nhãn bậc lấy `m.bac[bac]` thay cho khoá thô.
  - `DongMoKeHoach`: `ConfirmDialog` → `closePlan`; đã đóng → `Badge` `m.keHoach.daDong` + nút `moLai` → `reopenPlan`; invalidate `manDanhMuc`, `bangCot`, query kế hoạch.
  - `ThemMoiGioi`: `luaChon` gắn `disabled: daTrongPheu.includes(c.id)` và `hint: m.tao.moiGioi.daTrongPheu` cho người đó.
- [ ] **Step 4:** PASS; chiều đỏ từng E; chạy cặp hai thứ tự như Task 7.
- [ ] **Step 5:** commit `feat(onboarding): dong mo ke hoach, danh dau bac, moi gioi da trong pheu`.

---

### Task 9: Ma trận lỗi và một-lần-gửi (E25)

**independent:** false · **phục vụ:** E25

- [ ] **Step 1:** `describe("loi-va-mot-lan")` với `const THAO_TAC = [...]` 14 ô (thao tác × đối tượng như `expected` của E25); vòng lặp hai chế độ `loi` và `treo`; `expect(soCa).toBe(28)`.
- [ ] **Step 2:** chạy → sửa mọi ô đỏ trong mã màn (không sửa phép đo).
- [ ] **Step 3:** chiều đỏ: bỏ `disabled` khi pending ở `OBac` → ô «danh dấu bậc (b)» đỏ ghim tên và số lời gọi; đóng hộp sửa khuôn trong `onSettled` → «sửa khuôn (a)» đỏ; hoàn lại.
- [ ] **Step 4:** commit `test(onboarding): ma tran loi va mot lan gui`.

---

### Task 10: Cổng cuối

**independent:** false

- [ ] **Step 1:** `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run test` · `bun run build` — tất cả xanh.
- [ ] **Step 2:** chạy từng lệnh `slt_*` trong `_acceptance/config.yaml` — 24/24 exit 0.
- [ ] **Step 3:** contract `status: implemented`; commit `docs(acceptance): sua-luu-tru-dieu-phoi S3 xong, hop dong implemented`.
