# Cài đặt chung chỉ chủ và quản trị — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ba thao tác đổi Cài đặt chung (`setResearchKey`, `setAgentModel`, `setArchiveRetention`) chỉ `owner`/`admin` làm được, màn khoá control cho người khác, và cổng `/onboarding/research` chỉ đẩy người đổi được khoá.

**Architecture:** Một vị từ mới trong `@crm/auth`. `SettingsService` hỏi nó ở dòng đầu mỗi mutation và gắn `canManage` vào ba output đọc. Phần đọc trả lời `settings.researchKey` của proxy dời vào `@crm/validation/cong-nghien-cuu` để API test và proxy dùng chung một hàm. Ba card đọc `canManage` từ chính query của mình.

**Tech Stack:** NestJS + nestjs-trpc, Zod, Better Auth, Next.js proxy, React Query, bun:test (+ jsdom qua `packages/ui/test/setup-dom.ts`), supertest.

**Spec:** `docs/superpowers/specs/2026-09-25-cai-dat-chung-chi-quan-tri-design.md` · contract `_acceptance/cai-dat-chung-chi-quan-tri/contract.md` · evals `_acceptance/cai-dat-chung-chi-quan-tri/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Hằng tinh chỉnh được và thông điệp sống trong một module cấu hình của khu (`settings-config.ts`), `as const`.
- Hình đi qua ranh giới gói nằm ở `packages/validation/src`, import theo subpath.
- `/packages/ui` là nguồn giao diện duy nhất; không `className` đè kiểu component. Dòng lý do dùng đúng `text-muted-foreground text-xs` như `workspace-form.tsx`.
- Client component không import `@crm/auth` hay `@crm/db` (trừ hằng thuần `@crm/db/settings` đã có sẵn ở `research-key.tsx`).
- Thông điệp từ chối máy chủ: `"Only an owner or an admin can change workspace settings."`
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành xanh, phá vật thật đỏ với thông điệp ghim (MEASURE-BIRTH-CLAUSE).
- Năm lệnh chứng: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## Review Focus

- Trả lời cũ thiếu `canManage` (cache trình duyệt, API cũ): card coi là không đổi được, cổng coi là `settled` — không nhốt ai, không mở khoá nhầm. Ca «thiếu cờ» nằm ở Task 2 (cổng) và Task 4 (card).
- Người bị gỡ khỏi workspace nhưng phiên còn: đọc vẫn 200 với `canManage: false`, đổi 403 — Task 3 loi `nonMember`.
- Khoá rỗng `""` là «chưa có khoá» (`readContextDevKey` trim → null): E10 dùng đúng đường ghi này để xoá khoá — Task 3.
- Quản trị gọi REST: cầu REST dựng ngữ cảnh riêng (`createBaseTrpcContext`) — Task 3 có ca REST cho cả member và admin.
- Lệnh bị từ chối không được kích lời gọi ngoài kể cả khi input sai: `requireManager` đứng trước mọi việc; input sai hình vẫn bị Zod chặn trước service (400), không phải điều vòng này hứa.

---

### Task 1: Vị từ `canManageWorkspaceSettings`

Phục vụ E1 (AC-1). `independent: true`.

**Files:**
- Modify: `packages/auth/src/organization.ts` (sau `canManageOrganization`)
- Test: `packages/auth/test/quyen-cai-dat.spec.ts`

**Interfaces:**
- Produces: `canManageWorkspaceSettings(role: WorkspaceRole | null): boolean`, xuất qua barrel `@crm/auth` (barrel đã `export *` từ `organization.ts` — kiểm bằng `grep -n organization packages/auth/src/index.ts`).

- [ ] **Step 1: Viết test đỏ**

```ts
import { describe, expect, test } from "bun:test";
import {
	canManageWorkspaceSettings,
	WORKSPACE_ROLES,
	type WorkspaceRole,
} from "../src";

const MONG_DOI: ReadonlyArray<[WorkspaceRole | null, boolean]> = [
	["owner", true],
	["admin", true],
	["member", false],
	[null, false],
];

describe("quyen-cai-dat", () => {
	test("ma tran vai tro khop WORKSPACE_ROLES", () => {
		const trongMaTran = MONG_DOI.flatMap(([vai]) =>
			vai === null ? [] : [vai],
		);
		expect([...trongMaTran].sort()).toEqual([...WORKSPACE_ROLES].sort());
	});

	for (const [vai, duoc] of MONG_DOI) {
		test(`vai ${String(vai)} -> ${duoc}`, () => {
			expect(`${String(vai)}: ${canManageWorkspaceSettings(vai)}`).toBe(
				`${String(vai)}: ${duoc}`,
			);
		});
	}
});
```

- [ ] **Step 2:** `cd packages/auth && bun test test/quyen-cai-dat.spec.ts` → FAIL (export không tồn tại).
- [ ] **Step 3: Cài đặt**

```ts
export function canManageWorkspaceSettings(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}
```

- [ ] **Step 4:** chạy lại → 5 pass.
- [ ] **Step 5: Phá-thử** trong bản sao dưới `.acceptance-runs/` (không phá tại chỗ): đổi thân hàm thành `role !== null` → ca member đỏ với chuỗi `member: true`. Hoàn nguyên bản sao.
- [ ] **Step 6: Commit** `feat(auth): canManageWorkspaceSettings`.

---

### Task 2: Hàm đọc cổng nghiên cứu dùng chung

Phục vụ E6, E8 (AC-6, AC-8) và là nửa reader của E10. `independent: true`.

**Files:**
- Create: `packages/validation/src/cong-nghien-cuu.ts`
- Modify: `packages/validation/package.json` (exports thêm `"./cong-nghien-cuu": "./src/cong-nghien-cuu.ts"`)
- Modify: `apps/app/lib/onboarding.ts` (bỏ `researchKeyAnswer`, `readResearchGate` gọi `congNghienCuu`)
- Test: `apps/app/test/onboarding-gate.spec.ts` (bộ dựng `researchKey` thêm `canManage` mặc định `true`; thêm `describe("ccq-cong-nghien-cuu")`)

**Interfaces:**
- Produces: `congNghienCuu(data: unknown): "settled" | "required" | "unknown"` và `traLoiKhoaNghienCuu` (Zod) từ `@crm/validation/cong-nghien-cuu`.

- [ ] **Step 1: Test đỏ** — sửa bộ dựng và thêm describe:

```ts
const researchKey = (configured: boolean, canManage: boolean | undefined = true) => ({
	result: {
		data: {
			configured,
			hint: configured ? "••••9876" : null,
			...(canManage === undefined ? {} : { canManage }),
		},
	},
});
```

`setup()` nhận thêm `canManage?: boolean` (mặc định `true`) và trả `json(researchKey(configured, canManage))`. Không sửa dòng `expect`/`it(` cũ nào.

```ts
describe("ccq-cong-nghien-cuu", () => {
	it("member khong bi day khi chua co khoa", async () => {
		answerWith(researchKey(false, false));
		expect(`member: ${await readResearchGate(request("/", [SESSION_COOKIE]))}`).toBe("member: settled");
	});
	it("quan tri van bi day khi chua co khoa", async () => {
		answerWith(researchKey(false, true));
		expect(`admin: ${await readResearchGate(request("/", [SESSION_COOKIE]))}`).toBe("admin: required");
	});
	it("thieu co thi settled", async () => {
		answerWith(researchKey(false, undefined));
		expect(`thieu co: ${await readResearchGate(request("/", [SESSION_COOKIE]))}`).toBe("thieu co: settled");
	});
	it("co khoa thi settled du khong co quyen", async () => {
		answerWith(researchKey(true, false));
		expect(`co khoa: ${await readResearchGate(request("/", [SESSION_COOKIE]))}`).toBe("co khoa: settled");
	});
	it("proxy: member mo trang trong ung dung khong bi day", async () => {
		setup({ configured: false, canManage: false });
		expect(`member khong bi day: ${redirectedTo(await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])))}`)
			.not.toBe("member khong bi day: /onboarding/research");
	});
	it("proxy: member go thang /onboarding/research ve trang chinh", async () => {
		setup({ configured: false, canManage: false });
		expect(`member go thang: ${redirectedTo(await proxy(request("/onboarding/research", [SESSION_COOKIE])))}`)
			.toBe(`member go thang: /${SLUG}`);
	});
	it("proxy: quan tri van bi day", async () => {
		setup({ configured: false, canManage: true });
		expect(`quan tri: ${redirectedTo(await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])))}`)
			.toBe("quan tri: /onboarding/research");
	});
});
```

(Giá trị chính xác của `workspaceUrl(SLUG)` kiểm bằng `apps/app/lib/workspace-url.ts` trước khi chốt chuỗi `/${SLUG}`.)

- [ ] **Step 2:** `cd apps/app && bun test test/onboarding-gate.spec.ts -t ccq-cong-nghien-cuu` → FAIL ở ca member.
- [ ] **Step 3: Module dùng chung**

```ts
import { z } from "zod";

export const traLoiKhoaNghienCuu = z
	.object({
		configured: z.boolean().nullable().catch(null),
		canManage: z.boolean().nullable().catch(null),
	})
	.catch({ configured: null, canManage: null });

export type CongNghienCuu = "settled" | "required" | "unknown";

export function congNghienCuu(data: unknown): CongNghienCuu {
	const { configured, canManage } = traLoiKhoaNghienCuu.parse(data ?? {});
	if (configured === null) return "unknown";
	return configured || canManage !== true ? "settled" : "required";
}
```

`onboarding.ts`:

```ts
import { congNghienCuu } from "@crm/validation/cong-nghien-cuu";

export async function readResearchGate(request: NextRequest): Promise<Gate> {
	return congNghienCuu(await read(request, "settings.researchKey"));
}
```

- [ ] **Step 4:** chạy toàn tệp `cd apps/app && bun test test/onboarding-gate.spec.ts` → mọi ca xanh (E6 + E8).
- [ ] **Step 5: Phá-thử** (bản sao): bỏ vế `canManage !== true` → ca `member khong bi day` đỏ với chuỗi ghim. Chạy lệnh E8 (`ccq_cong_hoi_quy`) trên bản sao có một `expect` cũ bị sửa → đỏ.
- [ ] **Step 6: Commit** `feat(onboarding): cổng khoá nghiên cứu chỉ đẩy người đổi được khoá`.

---

### Task 3: Máy chủ chặn và báo quyền

Phục vụ E2, E3, E4, E5, E10 (AC-2..AC-6). `independent: false` — cần Task 1 (vị từ) và Task 2 (`congNghienCuu` cho E10).

**Files:**
- Create: `apps/api/src/settings/settings-config.ts`
- Modify: `apps/api/src/settings/settings.contracts.ts` (ba output thêm `canManage: z.boolean()`)
- Modify: `apps/api/src/settings/settings.router.ts` (`@Ctx() ctx: AuthedTrpcContext` ở 3 query có cờ + 3 mutation)
- Modify: `apps/api/src/settings/settings.service.ts`
- Regenerate: `apps/api/src/generated/server.ts` (lệnh sinh của kho — tìm bằng `grep -n "generated" apps/api/package.json`)
- Test: `apps/api/test/cai-dat-chung-chi-quan-tri.spec.ts`

**Interfaces:**
- Consumes: `canManageWorkspaceSettings`, `workspaceRoleOf` (`@crm/auth`); `congNghienCuu` (`@crm/validation/cong-nghien-cuu`).
- Produces: `researchKey`/`agentModel`/`archiveRetention` và ba mutation trả thêm `canManage: boolean`.

- [ ] **Step 1: Test đỏ** — khung theo `chi-quan-tri-truong.spec.ts` (hàm `moPhien`, `moKhoa`, `goi`, `doc`, `ok`) nhưng app dựng bằng `createApp()` như `go-la-cat-quyen.spec.ts`. `beforeAll`:

```ts
app = await createApp();
demVerify = spyOn(app.get(ResearchKeyService), "verify").mockResolvedValue({ outcome: "valid" });
demModels = spyOn(app.get(ModelCatalogService), "models").mockResolvedValue([MODEL_GIA]);
spyOn(app.get(ModelCatalogService), "find").mockResolvedValue(MODEL_GIA);
demBackfill = spyOn(app.get(BackfillService), "run").mockResolvedValue({ queued: 0, remaining: 0 });
```

Mỗi ca ghi trước giá trị gốc bằng `writeContextDevKey`/`writeAgentModel`/`writeArchiveRetentionDays`, `mockClear()` ba bộ đếm, gọi, rồi đọc lại bằng `readContextDevKey`/`readAgentModel`/`readArchiveRetentionDays`. `afterAll` đặt lại ba giá trị đã đọc lúc đầu.

Ma trận viết trước (hằng `LOI_BI_CHAN`, `LOI_DUOC`, `BA_THAO_TAC`, đếm ca = tích):

```ts
const BA_THAO_TAC = [
	{ ten: "setResearchKey", rest: "/rest/settings/research-key", vao: { apiKey: "ccq-khoa-moi-12345" } },
	{ ten: "setAgentModel", rest: "/rest/settings/agent-model", vao: { modelId: MODEL_GIA.id } },
	{ ten: "setArchiveRetention", rest: "/rest/settings/archive-retention", vao: { days: 42 } },
] as const;
```

Tag tên test: `ccq-member-bi-chan` (12 ca: member/memberKey/nonMember qua tRPC + member qua REST × 3; mỗi ca `403`, `loi` chứa `SETTINGS_CONFIG.messages.forbidden`, DB giữ giá trị trước, `demVerify`/`demModels`/`demBackfill` đều 0 lời gọi — thông điệp ghim `"<loi> <thao tac>"`), `ccq-quan-tri-lam-duoc` (12 ca admin/owner/adminKey tRPC + admin REST; 200, `canManage: true`, DB mới; setResearchKey → verify 1 lần, backfill 1 lần với `"companies"`; setAgentModel → models ≥1 lần), `ccq-member-doc-duoc` (4 ca đọc; `hint` bằng `maskKey(khoa)` và khác khoá thô; `days` đúng), `ccq-co-quyen` (12 ca: 4 phiên × 3 query, `canManage` true/true/false/false), `ccq-cong-that`:

```ts
test("ccq-cong-that: tra loi that qua ham doc cua proxy", async () => {
	await writeContextDevKey(db, "");
	const traMember = await doc("member", "researchKey", undefined);
	const traAdmin = await doc("admin", "researchKey", undefined);
	expect(`member: ${congNghienCuu(traMember.data)}`).toBe("member: settled");
	expect(`admin bi day: ${congNghienCuu(traAdmin.data)}`).toBe("admin bi day: required");
	await writeContextDevKey(db, KHOA_GOC);
	const lai = await doc("admin", "researchKey", undefined);
	expect(`admin co khoa: ${congNghienCuu(lai.data)}`).toBe("admin co khoa: settled");
	const nguon = await Bun.file(join(THU_MUC_APP, "lib/onboarding.ts")).text();
	expect(nguon.includes(`from "@crm/validation/cong-nghien-cuu"`)).toBe(true);
});
```

- [ ] **Step 2:** `bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/cai-dat-chung-chi-quan-tri.spec.ts"` → đỏ (member được 200, không có `canManage`).
- [ ] **Step 3: Cài đặt**

`settings-config.ts`:

```ts
export const SETTINGS_CONFIG = {
	messages: {
		forbidden: "Only an owner or an admin can change workspace settings.",
	},
} as const;
```

`settings.contracts.ts`: `canManage: z.boolean()` vào `agentModelOutput`, `researchKeyOutput`, `archiveRetentionOutput`.

`settings.service.ts` (thêm import `ForbiddenException`, `canManageWorkspaceSettings`, `workspaceRoleOf`, `SETTINGS_CONFIG`):

```ts
private async canManage(userId: string): Promise<boolean> {
	return canManageWorkspaceSettings(await workspaceRoleOf(userId));
}

private async requireManager(userId: string): Promise<void> {
	if (!(await this.canManage(userId))) {
		throw new ForbiddenException(SETTINGS_CONFIG.messages.forbidden);
	}
}
```

- `agentModel(userId)`: thêm `this.canManage(userId)` vào `Promise.all`, trả `canManage`.
- `setAgentModel(userId, modelId)`: dòng đầu `await this.requireManager(userId)`; các `return this.agentModel()` thành `this.agentModel(userId)`.
- `researchKey(userId)`: `{ configured, hint, canManage: await this.canManage(userId) }`.
- `setResearchKey(userId, apiKey)`: dòng đầu `requireManager`; trả `this.researchKey(userId)`.
- `archiveRetention(userId)`: `{ days, canManage }`.
- `setArchiveRetention(userId, days)`: dòng đầu `requireManager`; trả `{ days: saved, canManage: true }`.

`settings.router.ts`: import `Ctx` và `AuthedTrpcContext`; mỗi phương thức trên nhận `@Ctx() ctx: AuthedTrpcContext` và truyền `ctx.user.id` làm đối số đầu. `modelCatalog` giữ nguyên.

- [ ] **Step 4:** chạy lại spec → xanh; `bun run check-types` bắt mọi chỗ gọi cũ của service/contract.
- [ ] **Step 5: Phá-thử** (bản sao `.acceptance-runs/`): gỡ `requireManager` ở `setArchiveRetention` → ca `member setArchiveRetention` đỏ; dời `requireManager` xuống sau `verify` → ca member setResearchKey đỏ với «verify 0 lời gọi»; `researchKeyOutput` đổi `canManage` thành `canEdit` → `ccq-cong-that` đỏ với «admin bi day».
- [ ] **Step 6: Commit** `feat(settings): chỉ owner/admin đổi được cài đặt chung`.

---

### Task 4: Ba card khoá control và nói lý do

Phục vụ E7 (AC-7), là vật của E9 (AC-9). `independent: false` — cần output có `canManage` từ Task 3.

**Files:**
- Modify: `apps/app/lib/messages/settings.ts` (`nghienCuu`, `luuTru`, `model` thêm `khongDuQuyen` ở cả `en` và `vi`)
- Modify: `apps/app/app/(app)/[slug]/settings/research-key.tsx`, `archive-retention.tsx`, `agent-model.tsx`
- Test: `apps/app/test/cai-dat-chung-khoa.dom.tsx`

Chuỗi:

| khoá | en | vi |
|---|---|---|
| `nghienCuu.khongDuQuyen` | Only an owner or an admin can change the research key. | Chỉ chủ sở hữu hoặc quản trị mới thay được khoá. |
| `luuTru.khongDuQuyen` | Only an owner or an admin can change how long archived records are kept. | Chỉ chủ sở hữu hoặc quản trị mới đổi được hạn dọn. |
| `model.khongDuQuyen` | Only an owner or an admin can change the agent's model. | Chỉ chủ sở hữu hoặc quản trị mới đổi được model. |

- [ ] **Step 1: Test đỏ** — khung jsdom theo `chi-quan-tri-truong.dom.tsx` (`mock.module("@/lib/trpc/client")` với `settings.researchKey|agentModel|modelCatalog|archiveRetention|setResearchKey|setAgentModel|setArchiveRetention`, `mock.module("@/lib/trpc/cache", () => ({ useCrmCache: () => ({ settings: async () => {} }) }))`). Dữ liệu giả rút qua `researchKeyOutput.parse`, `agentModelOutput.parse`, `archiveRetentionOutput.parse`, `modelCatalogOutput.parse` của `apps/api/src/settings/settings.contracts` (round-trip qua writer schema). Ma trận viết trước `BA_CARD × HAI_VAI` = 6 ca, tag `ccq-man-khoa`:
  - `canManage: false`: card hiện `Connected`/`Not connected` và `placeholder` = hint; ô số ngày có value `"42"`; nút model có tên model. Năm control (`input[type=password]`, nút `Replace key`/`Save key`, ô số ngày, nút `Save` của lưu trữ, nút `role=combobox`) có `disabled`; `aria-describedby` của mỗi control trỏ tới `document.getElementById(id)` KHÁC null, nằm trong cùng `[data-slot=card]` và có `textContent` bằng `khongDuQuyen` của card đó. Ghim thông điệp `"<card>: <control> disabled"` và `"<card>: mo ta ton tai"`.
  - `canManage: true`: không có câu `khongDuQuyen` nào; ô khoá, ô số ngày, nút model không `disabled`.
- [ ] **Step 2:** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/cai-dat-chung-khoa.dom.tsx -t ccq-man-khoa` → đỏ.
- [ ] **Step 3: Cài đặt** — mỗi card: `const lyDoId = useId();`, đọc `canManage` từ `data`, thêm `!canManage` vào `disabled` của từng control, `aria-describedby={canManage ? undefined : lyDoId}`, và cuối `CardContent`:

```tsx
{canManage ? null : (
	<p id={lyDoId} className="text-muted-foreground text-xs">
		{t.nghienCuu.khongDuQuyen}
	</p>
)}
```

Ở `agent-model.tsx` dòng mô tả model cũ vẫn hiện; dòng lý do đặt ngay sau nó.

- [ ] **Step 4:** chạy lại → 6 ca xanh; `bun run test:dom` trong `apps/app` xanh.
- [ ] **Step 5: Phá-thử** (bản sao): bỏ `!canManage` khỏi nút combobox → đỏ `"model: nut chon disabled"`; đổi `aria-describedby` sang id rác → đỏ `"mo ta ton tai"`.
- [ ] **Step 6: Commit** `feat(settings): khoá ba card cho thành viên thường`.

---

### Kết S3

- [ ] Năm lệnh chứng ở gốc kho xanh.
- [ ] Contract `status: implemented`, commit, rồi S4.
