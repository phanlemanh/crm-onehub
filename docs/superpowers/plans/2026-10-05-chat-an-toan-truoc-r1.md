# Chat an toàn trước R1 — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chỉ owner/admin nhờ chat đổi được trường của cả đội; model bị AI Gateway gỡ thì chat lùi về mặc định, Cài đặt báo cho mọi người, và mọi lần đổi/lùi/hỏng đều để lại sự kiện đếm được.

**Architecture:** Một chốt quyền `quyenDoiTruong` trong agent gác ba công cụ đổi trường, luật vai lấy từ `@crm/validation/vai-workspace`. `modelTheoVai` đối chiếu model đã chọn với danh mục Gateway (schema dùng chung `@crm/validation/gateway-danh-muc`, nhớ tạm 5 phút, nguồn tiêm được). API trả thêm `selectedMissing`, màn Cài đặt hiện `Alert`. Ba loại `AgentEvent` làm đường đo, `rang/dem-doi-truong.ts` đếm.

**Tech Stack:** Bun 1.3.12, eve 0.29.4 (agent), NestJS + tRPC (API), Next.js (app), Prisma/Postgres, zod, puppeteer-core (đo màn).

**Spec:** `docs/superpowers/specs/2026-10-05-chat-an-toan-truoc-r1-design.md` · hợp đồng `_acceptance/chat-an-toan-truoc-r1/contract.md` · evals `_acceptance/chat-an-toan-truoc-r1/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Không đổi `packages/auth` (đường T3) và `packages/db/src/settings.ts` (chủ kho chưa quyết model mặc định).
- Hằng số tinh chỉnh đặt ở tệp cấu hình của vùng: `apps/agent/agent/lib/fields-config.ts` (`FIELDS_AGENT`), `apps/agent/agent/lib/model-config.ts` (`MODEL_DANH_MUC`), đơn vị suy từ `MINUTE_MS`/`SECOND_MS` kiểu `dispatch-config.ts`.
- `MODEL_DANH_MUC.ttlMs` = 5 phút; `timeoutMs` = 5 giây; URL `https://ai-gateway.vercel.sh/v1/models`.
- Câu từ chối `FIELDS_AGENT.tuChoi` = «Only a workspace owner or admin can change the team's fields. Ask one of them to do it from Settings › Fields.»
- Hộp báo: en «The model you chose is no longer on the AI Gateway — the agent is running the default model. Pick another model.» · vi «Model đã chọn không còn trên AI Gateway — tác nhân đang chạy model mặc định. Chọn model khác.»
- Nhãn vai trong sự kiện: `owner` | `admin` | `member` | `okr` | `khong-thanh-vien` | `tu-dong`.
- Loại sự kiện: `truong.doi-qua-chat`, `model.bi-go-lui`, `model.khong-tim-thay`.
- Parse ở biên bằng zod, không truyền `Record<string, unknown>`.
- Thành viên thường vẫn thấy ô chọn model bị khoá kèm `t.model.khongDuQuyen` (AC-9 đã sửa, không đổi hành vi hồ sơ `cai-dat-chung-chi-quan-tri`).
- Bài kiểm agent cũ dùng id model giả (`test/model-x`, `openai/gpt-x`): nguồn danh mục mặc định trong test là «không đọc được» (giữ model) qua preload.

## Review Focus

- Danh mục Gateway trả thân hợp lệ nhưng `data` rỗng → không được coi là «thiếu mọi model» rồi lùi tất cả; rỗng = không đọc được (Task 4 ô `rong`).
- Phiên chat mà `principalId` trỏ user có hàng member vai lạ (không trong `WORKSPACE_ROLES`) → `toWorkspaceRole` cho `member`, bị từ chối (Task 2 ô `vai-la`).
- Sự kiện `model.bi-go-lui` ghi lặp mỗi lượt sẽ phình bảng → tối đa một lần mỗi id mỗi tiến trình (Task 4 ô `mot-lan`).
- `archive_field` vẫn hỏi duyệt cho owner/admin — chốt vai không được bỏ `approval` (Task 2 ô `van-hoi-duyet`).
- Lỗi model hết tín dụng (402) không được đếm là model bị gỡ (Task 5 ô `402`).

---

### Task 1: Luật vai và schema danh mục dùng chung

**Files:**
- Modify: `packages/validation/src/vai-workspace.ts`
- Create: `packages/validation/src/gateway-danh-muc.ts`
- Modify: `packages/validation/package.json` (exports `./gateway-danh-muc`)
- Modify: `apps/api/src/settings/model-catalog.service.ts` (dùng schema chung)
- Test: `apps/api/test/luat-vai-truong-trung.spec.ts`

**Interfaces:**
- Produces: `laQuanTriWorkspace(role: WorkspaceRole | null): boolean`; `docDanhMucGateway(json: unknown): DongDanhMuc[]` với `DongDanhMuc = { id: string; name: string; owned_by: string; context_window: number; pricing: { input: number | null; output: number | null } | null }` (chỉ dòng `type === "language"` có tag `tool-use`).
- Phục vụ: E4 (AC-4); nền cho E6, E8. `independent: true`.

- [ ] **Step 1: Viết test đỏ** — `apps/api/test/luat-vai-truong-trung.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { canManageFields } from "@crm/auth";
import { laQuanTriWorkspace } from "@crm/validation/vai-workspace";

const BANG = [
	["owner", true],
	["admin", true],
	["member", false],
	["okr", false],
	[null, false],
] as const;

describe("luat-vai", () => {
	test("luat-vai: agent va API cung ket qua tren 5 gia tri", () => {
		expect(BANG.length).toBe(5);
		const lech = BANG.filter(
			([vai, mong]) =>
				laQuanTriWorkspace(vai) !== mong || canManageFields(vai) !== mong,
		).map(([vai]) => `luat-vai: lech o ${vai}`);
		expect(lech).toEqual([]);
	});
});
```

- [ ] **Step 2: Chạy, mong đỏ** — `cd apps/api && bun test test/luat-vai-truong-trung.spec.ts` → lỗi không có export `laQuanTriWorkspace`.
- [ ] **Step 3: Cài** — thêm vào `vai-workspace.ts`:

```ts
export function laQuanTriWorkspace(role: WorkspaceRole | null): boolean {
	return role === "owner" || role === "admin";
}
```

Tạo `gateway-danh-muc.ts` bằng cách chuyển nguyên `gatewayRate`, `gatewayModel`, `gatewayCatalog`, `usable` từ `model-catalog.service.ts` sang, và xuất:

```ts
export type DongDanhMuc = z.infer<typeof gatewayModel>;

export function docDanhMucGateway(json: unknown): DongDanhMuc[] {
	return gatewayCatalog.parse(json).data.flatMap((entry) => {
		const parsed = gatewayModel.safeParse(entry);
		return parsed.success && usable(parsed.data) ? [parsed.data] : [];
	});
}
```

`model-catalog.service.ts`: `const models = docDanhMucGateway(await response.json()).map(toCatalogModel);` (giữ sort, log, cache). Thêm `"./gateway-danh-muc": "./src/gateway-danh-muc.ts"` vào exports.
- [ ] **Step 4: Chạy xanh** — `cd apps/api && bun test test/luat-vai-truong-trung.spec.ts`; `bun run test -- "cd apps/api && bun test test/cai-dat-chung-chi-quan-tri.spec.ts"` vẫn xanh. Chiều đỏ: tạm cho `laQuanTriWorkspace` trả `true` với `"member"` → «luat-vai: lech o member», hoàn lại.
- [ ] **Step 5: Commit** — `git commit -m "feat(validation): luật vai quản trị và schema danh mục Gateway dùng chung"`

### Task 2: Chốt quyền đổi trường trong chat

**Files:**
- Create: `apps/agent/agent/lib/fields-config.ts`, `apps/agent/agent/lib/quyen-truong.ts`
- Modify: `apps/agent/agent/tools/manage_fields.ts`, `apps/agent/agent/tools/archive_field.ts`
- Test: `apps/agent/test/chat-an-toan-truong.integration.spec.ts`, `apps/agent/test/chat-an-toan-truong-chu.spec.ts`

**Interfaces:**
- Consumes: `laQuanTriWorkspace` (Task 1), `isAutomated` (`lib/approval.ts`), `WORKSPACE_ID` (`@crm/db/workspace`).
- Produces: `FIELDS_AGENT = { tuChoi: string, suKien: "truong.doi-qua-chat" } as const`; `type VaiDoiTruong = "owner" | "admin" | "member" | "okr" | "khong-thanh-vien" | "tu-dong"`; `quyenDoiTruong(ctx: NguCanhTruong): Promise<{ cho: boolean; vai: VaiDoiTruong }>`; `ghiDoiTruong(sessionId: string, data: { hanhDong: "create" | "update-brief" | "archive"; vai: VaiDoiTruong; ketQua: "lam" | "tu-choi"; entity: string; key?: string }): Promise<void>`.
- Phục vụ: E1, E2, E3, E5(a), E10 (phần agent). `independent: false` (cần Task 1).

- [ ] **Step 1: Test đỏ** — ma trận viết trước (`ca-truong-tao`: 5 vai × 3 hành động = 15 ô; `ca-truong-luu-tru`: 5 ô; `ca-truong-phien-may`: 2 khung × 3 việc = 6 ô; `ca-truong-su-kien`: mỗi ô của ba ma trận có đúng 1 hàng `truong.doi-qua-chat` khớp; ô `vai-la` (member role `"khach"`) → từ chối; ô `van-hoi-duyet`: `archive_field.approval` với phiên owner trả `"user-approval"`). Gieo người bằng `gieoNguoi` + `db.member.update({ role })`; ctx:

```ts
function ctxChat(userId: string, sessionId: string) {
	return {
		session: {
			id: sessionId,
			auth: {
				current: { authenticator: "crm-app", principalId: userId, principalType: "user", attributes: {} },
				initiator: null,
			},
		},
	};
}
```

Mỗi ô gọi `manageFields.execute(input, ctx)` / `archiveField.execute(input, ctx)` thật, rồi đọc lại `db.fieldDefinition`. Ô từ chối ghim `reason === FIELDS_AGENT.tuChoi`. Thông điệp đỏ ghim: `ca-truong: member doi duoc truong (create)`, `ca-truong: member luu tru duoc truong`, `ca-truong: phien tu dong doi duoc truong`. `chat-an-toan-truong-chu.spec.ts` (không DB): `expect(FIELDS_AGENT.tuChoi).toBe("Only a workspace owner or admin can change the team's fields. Ask one of them to do it from Settings › Fields.")`.
- [ ] **Step 2: Chạy, mong đỏ** — `bun run test -- "cd apps/agent && bun test test/chat-an-toan-truong.integration.spec.ts"` → không có module `quyen-truong`.
- [ ] **Step 3: Cài**

```ts
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { laQuanTriWorkspace, toWorkspaceRole } from "@crm/validation/vai-workspace";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { isAutomated } from "./approval";
import { FIELDS_AGENT } from "./fields-config";

const nguoiChat = z.object({ authenticator: z.literal("crm-app"), principalId: z.string().min(1) });

export async function quyenDoiTruong(ctx: NguCanhTruong) {
	if (isAutomated(ctx.session)) return { cho: false, vai: "tu-dong" } as const;
	const nguoi = nguoiChat.safeParse(ctx.session.auth.current);
	if (!nguoi.success) return { cho: false, vai: "tu-dong" } as const;
	const member = await db.member.findUnique({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId: nguoi.data.principalId } },
		select: { role: true },
	});
	if (!member) return { cho: false, vai: "khong-thanh-vien" } as const;
	const vai = toWorkspaceRole(member.role);
	return { cho: laQuanTriWorkspace(vai), vai };
}
```

`ghiDoiTruong` ghi `db.agentEvent.create({ data: { id: randomUUID(), sessionId, type: FIELDS_AGENT.suKien, data, emittedAt: new Date() } })`. Trong `manage_fields.execute` và `archive_field.execute`, ngay sau `assertNotZaloQuestion(ctx)`: gọi `quyenDoiTruong(ctx)`; không cho → `ghiDoiTruong(..., ketQua: "tu-choi")` rồi trả `{ created|updated|archived: false, reason: FIELDS_AGENT.tuChoi }`; cho → làm như cũ rồi `ghiDoiTruong(..., ketQua: "lam")`. Giữ nguyên `approval: sensitiveWrite(...)` của `archive_field`.
- [ ] **Step 4: Xanh + chiều đỏ** — cùng lệnh xanh; tạm bỏ dòng gọi chốt trong `manage_fields` → «ca-truong: member doi duoc truong (create)» đỏ; hoàn lại. `bun run check-types`, `bun run lint:slop`.
- [ ] **Step 5: Commit** — `git commit -m "feat(agent): chỉ owner/admin nhờ chat đổi được trường của cả đội"`

### Task 3: Danh mục Gateway và lùi về mặc định

**Files:**
- Create: `apps/agent/agent/lib/model-config.ts`, `apps/agent/agent/lib/model-danh-muc.ts`, `apps/agent/test/fixtures/gateway-models-2026-10-05.json`, `apps/agent/test/support/danh-muc-mac-dinh.ts`, `apps/agent/bunfig.toml`
- Modify: `apps/agent/agent/lib/model.ts`
- Test: `apps/agent/test/model-lui-mac-dinh.integration.spec.ts`

**Interfaces:**
- Consumes: `docDanhMucGateway` (Task 1).
- Produces: `MODEL_DANH_MUC = { url, ttlMs, timeoutMs, suKienLui: "model.bi-go-lui", suKienHong: "model.khong-tim-thay" } as const`; `type KetQuaDanhMuc = { co: ReadonlySet<string> } | "khong-doc-duoc"`; `docDanhMuc(): Promise<KetQuaDanhMuc>`; `datNguonDanhMuc(doc: () => Promise<KetQuaDanhMuc>): () => void` (trả hàm hoàn lại); `docDanhMucTuMang(layVe: typeof fetch = fetch): Promise<KetQuaDanhMuc>`; `xoaNhoDanhMuc(): void`.
- Phục vụ: E6, E7. `independent: false` (cần Task 1).

- [ ] **Step 1: Ghi fixture thật** — `curl -s https://ai-gateway.vercel.sh/v1/models > apps/agent/test/fixtures/gateway-models-2026-10-05.json`; mở tệp xác nhận có khoá `data` và `DEFAULT_AGENT_MODEL.id`.
- [ ] **Step 2: Test đỏ** — ma trận 3 đường (`modelTheoVai("tro-ly")`, `modelTheoVai("tac-nhan")`, `modelChoLuot()`) × 5 danh mục (`co`, `thieu`, `mang` ném, `503`, `hong` thân `{}`) = 15 ô, nguồn tiêm qua `datNguonDanhMuc` dựng từ `docDanhMucTuMang(fetchGia)`; ô (d) đọc fixture thật qua `docDanhMucTuMang(async () => new Response(fixture))` → tập id không rỗng, chứa `DEFAULT_AGENT_MODEL.id`, và API `docDanhMucGateway(fixture)` ra cùng tập id; ô `rong` (`{ data: [] }`) → `"khong-doc-duoc"`; ô `mot-lan`: chạy ô `thieu` 3 lần → đúng 1 hàng `model.bi-go-lui` cho `openai/gpt-x`. `danh-muc`: `MODEL_DANH_MUC.ttlMs === 5 * 60_000`; `setSystemTime` + `afterEach(() => setSystemTime())`: 3 lần gọi trong ttl → fetch giả đếm 1, qua ttl → 2; fetch giả treo → `"khong-doc-duoc"` trước `timeoutMs + 1000`. Thông điệp đỏ ghim: `model-lui: thieu id van tra model da chon`, `model-lui: than that doc ra rong`, `danh-muc: goi Gateway 3 lan trong ttl`.
- [ ] **Step 3: Chạy, mong đỏ** — `bun run test -- "cd apps/agent && bun test test/model-lui-mac-dinh.integration.spec.ts"`.
- [ ] **Step 4: Cài** — `model-danh-muc.ts`: `docDanhMucTuMang` gọi `layVe(MODEL_DANH_MUC.url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(MODEL_DANH_MUC.timeoutMs) })`, không ok → `"khong-doc-duoc"`, `docDanhMucGateway(await r.json())` rỗng → `"khong-doc-duoc"`, ngược lại `{ co: new Set(ids) }`, mọi lỗi → `"khong-doc-duoc"`; nhớ tạm `{ luc, ketQua }` theo `ttlMs` chỉ khi đọc được; `datNguonDanhMuc` thay nguồn và xoá nhớ. `model.ts` trong `modelTheoVai` sau khi `setting` không phải mặc định:

```ts
const danhMuc = await docDanhMuc();
if (danhMuc !== "khong-doc-duoc" && !danhMuc.co.has(setting.id)) {
	await baoBiGo(setting.id, vai);
	return null;
}
```

`baoBiGo` `console.warn` một dòng và ghi `AgentEvent` `model.bi-go-lui` (`sessionId: "model-danh-muc"`, `data: { modelId, vai }`) một lần mỗi id mỗi tiến trình (Set trong module). `bunfig.toml`: `[test]\npreload = ["./test/support/danh-muc-mac-dinh.ts"]`; tệp preload `datNguonDanhMuc(async () => "khong-doc-duoc")`.
- [ ] **Step 5: Xanh + bài cũ** — lệnh trên xanh; `bun run test -- "cd apps/agent && bun test test/model-theo-vai.integration.spec.ts test/model.integration.spec.ts test/tro-ly-kho-dung-phien.integration.spec.ts"` xanh. Chiều đỏ: tạm bỏ nhánh `thieu` → đỏ ghim; đổi khoá `data` thành `models` trong schema → ô (d) đỏ; hoàn lại.
- [ ] **Step 6: Commit** — `git commit -m "feat(agent): model bị Gateway gỡ thì lùi về mặc định"`

### Task 4: Ghi lượt vẫn hỏng vì model không tìm thấy

**Files:**
- Modify: `apps/agent/agent/hooks/telemetry.ts`, `apps/agent/agent/lib/model-danh-muc.ts`
- Test: `apps/agent/test/model-lui-mac-dinh.integration.spec.ts` (`khong-tim-thay`)

**Interfaces:**
- Produces: `laModelKhongTimThay(details: unknown): boolean` (zod `{ gatewayName?: string, gatewayType?: string }` → `gatewayName === "GatewayModelNotFoundError" || gatewayType === "model_not_found"`); `ghiModelKhongTimThay(sessionId: string, modelId: string): Promise<void>`.
- Phục vụ: E11. `independent: false` (cần Task 3).

- [ ] **Step 1: Test đỏ** — ma trận 4 ô (`model-not-found` với `details` từ một `GatewayModelNotFoundError` thật dựng bằng `new GatewayModelNotFoundError(...)` của `@ai-sdk/gateway` rồi chép trường `name`/`type` sang `details` như eve; `402`: `{ gatewayName: "GatewayInternalServerError", statusCode: 402 }`; `429`: `{ gatewayName: "GatewayRateLimitError", gatewayType: "rate_limit_exceeded" }`; `khac`: code `TOOL_FAILED`), gọi `telemetry.events["step.failed"]({ data: { code: "MODEL_CALL_FAILED", message, details } }, ctx)` thật; chỉ ô đầu ghi đúng 1 hàng `model.khong-tim-thay` của `ctx.session.id`. Đỏ ghim: `khong-tim-thay: loi 402 bi dem la model bi go`.
- [ ] **Step 2: Chạy đỏ** — `bun run test -- "cd apps/agent && bun test test/model-lui-mac-dinh.integration.spec.ts -t khong-tim-thay"`.
- [ ] **Step 3: Cài** — trong `"step.failed"(event, ctx)`: `if (laModelKhongTimThay(event.data.details)) await ghiModelKhongTimThay(ctx.session.id, (await readAgentModel(db)).id);` trước nhánh `looksLikeModel`.
- [ ] **Step 4: Xanh + chiều đỏ** — đổi điều kiện thành khớp chữ «model» trong `message` → ô 402 đỏ; hoàn lại.
- [ ] **Step 5: Commit** — `git commit -m "feat(agent): ghi lượt hỏng vì model không tìm thấy"`

### Task 5: Bộ đếm cho ngày 10/11

**Files:**
- Create: `_acceptance/chat-an-toan-truoc-r1/rang/dem-doi-truong.ts`, `_acceptance/chat-an-toan-truoc-r1/rang/dem-doi-truong.spec.ts`

**Interfaces:**
- Consumes: `ghiDoiTruong` (Task 2), `ghiModelKhongTimThay` (Task 4), hàm ghi `model.bi-go-lui` (Task 3, xuất `ghiBiGoLui(modelId, vai)`).
- Produces: `demDoiTruong(db, tu?: Date): Promise<{ lam: Record<VaiDoiTruong, number>; tuChoi: number; chet: number; biGoLui: number; khongTimThay: number }>`; chạy trực tiếp in JSON.
- Phục vụ: E5(b). `independent: false`.

- [ ] **Step 1: Test đỏ** — gieo qua hàm ghi thật: lam owner ×2, admin ×1, tu-choi member ×3, bốn ô chết (lam member, okr, khong-thanh-vien, tu-dong) `expect(CHET.length).toBe(4)`, 1 `model.bi-go-lui`, 1 `model.khong-tim-thay`; đếm số hàng `agentEvent` trước/sau `demDoiTruong` bằng nhau; mong `tuChoi 3, chet 4, biGoLui 1, khongTimThay 1`. Đỏ ghim: `dem-truong: bo sot vai okr`. Import `db` tương đối (bài học `blocked-ha-tang-resume-cung-run`).
- [ ] **Step 2: Chạy đỏ** — `bun run test -- "bun test _acceptance/chat-an-toan-truoc-r1/rang/dem-doi-truong.spec.ts"`.
- [ ] **Step 3: Cài** — đọc `agentEvent` theo ba `type`, parse `data` bằng zod ở biên, `chet` = `lam` với vai ngoài `owner`/`admin`.
- [ ] **Step 4: Xanh + chiều đỏ** — đổi `chet` chỉ đếm `member` → đỏ ghim; hoàn lại.
- [ ] **Step 5: Commit** — `git commit -m "feat(acceptance): bộ đếm đổi trường và model bị gỡ"`

### Task 6: API báo model đã chọn không còn

**Files:**
- Modify: `apps/api/src/settings/settings.contracts.ts`, `apps/api/src/settings/settings.service.ts`
- Test: `apps/api/test/cai-dat-model-bi-go.spec.ts`

**Interfaces:**
- Produces: `agentModelOutput.selectedMissing: z.boolean()`.
- Phục vụ: E8. `independent: false` (cần Task 1).

- [ ] **Step 1: Test đỏ** — 4 ô × 2 người gọi (owner, member) = 8 lần `expect(lan.length).toBe(8)`, `ModelCatalogService` thật với `globalThis.fetch` giả và cache bộ nhớ, `writeAgentModel` thật; mong `(da chon, co) false · (da chon, thieu) true · (mac dinh, *) false · (da chon, khong doc duoc) false`, member = owner; parse qua `agentModelOutput`. Đỏ ghim: `api-bi-go: danh muc loi bao bi go`.
- [ ] **Step 2: Chạy đỏ** — `bun run test -- "cd apps/api && bun test test/cai-dat-model-bi-go.spec.ts"`.
- [ ] **Step 3: Cài** — `agentModel`: `const models = await this.catalog.models();` · `effective: models?.find((m) => m.id === model.id) ?? null` · `selectedMissing: !model.isDefault && models !== null && !models.some((m) => m.id === model.id)`.
- [ ] **Step 4: Xanh + chiều đỏ** — bỏ điều kiện `models !== null` → đỏ ghim; hoàn lại. `bun run check-types`.
- [ ] **Step 5: Commit** — `git commit -m "feat(api): Cài đặt model báo model đã chọn không còn"`

### Task 7: Hộp báo trên màn Cài đặt và bài đo màn

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/agent-model.tsx`, `apps/app/lib/messages/settings.ts`, `apps/app/test/messages-guard.spec.ts`
- Create: `_acceptance/chat-an-toan-truoc-r1/rang/man-bi-go.mjs`

**Interfaces:**
- Consumes: `selectedMissing` (Task 6).
- Produces: khoá chữ `t.model.biGo` (en/vi ở Global Constraints).
- Phục vụ: E9u, E10. `independent: false`.

- [ ] **Step 1: Chữ + guard** — thêm `biGo` vào khối `model` hai ngôn ngữ; `messages-guard.spec.ts` xanh (khoá chuỗi thường, có dấu).
- [ ] **Step 2: UI** — dưới `CardContent` mở đầu, khi `settings.data.selectedMissing`: `<Alert><AlertDescription>{t.model.biGo}</AlertDescription></Alert>` (từ `@crm/ui/components/alert`), không `className` đổi kiểu. Ô chọn giữ nguyên logic `disabled`/`khongDuQuyen`.
- [ ] **Step 3: Bài đo màn** — `man-bi-go.mjs` theo khuôn `_acceptance/kho-nguon-khong-ket/rang/man-lien-ket-loi.mjs` (dùng `moDo`, `chay`, `RONG`, `HEP` của `kho-tai-lieu/rang/man-lib.mjs`; thoát 2 «KHONG DO DUOC» khi thiếu `PHIEN_DO`/`API_URL` hoặc danh mục Gateway không đọc được qua `settings.modelCatalog`): bước 1–4 đúng E9u, đọc chữ bằng `innerText`, ảnh vào `.acceptance-runs/chat-an-toan-truoc-r1/evidence/`, `--chieu-do` dùng id có trong danh mục ở bước 1.
- [ ] **Step 4: Chạy** — `cd apps/app && bun test test/messages-guard.spec.ts`; `bun run check-types`; `bun run lint:slop`; bài đo màn chạy ở S4 qua `mot-luot.sh` (cần khoá s4).
- [ ] **Step 5: Commit** — `git commit -m "feat(app): hộp báo model đã chọn không còn"`

### Task 8: Tài liệu

**Files:** Modify `docs/agent.md` (mục Model: lùi về mặc định khi Gateway gỡ, nhớ tạm 5 phút, ba sự kiện; mục công cụ trường: chốt owner/admin, phiên máy bị từ chối).
- Phục vụ: không eval. `independent: true`.
- [ ] **Step 1: Viết hai gạch đầu dòng mỗi mục, chạy `bun run lint:slop`.**
- [ ] **Step 2: Commit** — `git commit -m "docs(agent): chốt quyền đổi trường và lùi model"`

Kết S3: `bun run check-types`, `bun run lint`, `bun run lint:slop` xanh; đặt contract `status: implemented`; dispatch S4 (cần khoá s4 của điều phối).
