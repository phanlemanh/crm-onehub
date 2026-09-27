# Tác nhân chạy đúng với mọi model — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tác nhân chạy được với mọi model trong danh mục, model giải theo vai lúc chạy, lượt hỏng hiện là Hỏng.

**Architecture:** Một khuôn kết quả phẳng dùng chung (`lib/run-result.ts`) thay `z.json()`; một bộ giải `modelTheoVai` trong `lib/model.ts` cho gốc, bộ dựng và điều phối lượt, bộ chạy đọc model từ thuộc tính phiên; một hook mới đóng lượt khi `agent_runner` báo lỗi, và `choKetLuot` đóng lượt chưa nộp kết quả.

**Tech Stack:** eve 0.29.4, zod 4, bun test, Prisma, AI SDK `ai` 7 (qua eve).

**Spec:** `docs/superpowers/specs/2026-09-27-tac-nhan-model-rieng-design.md` · hợp đồng `_acceptance/tac-nhan-model-rieng/contract.md` · phép đo `_acceptance/tac-nhan-model-rieng/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Hằng tinh chỉnh vào `apps/agent/agent/lib/dispatch-config.ts`, không để lẻ.
- Parse ở biên bằng Zod, không truyền `Record<string, unknown>`.
- Không migration; `packages/db/prisma` không đổi.
- Mã lỗi: `RUNNER_FAILED`, `RUNNER_NO_RESULT`. Câu: «Bộ chạy dừng trước khi nộp kết quả.», «Bộ chạy báo lỗi nhưng không nói lý do.». Lý do cắt 1.000 ký tự.
- Ba model đo thật: `google/gemini-3.8-flash`, `zai/glm-5.2-fast`, `openai/gpt-5-mini`.
- Tiến trình nền dùng Node 24 (`export PATH=$HOME/.local/share/fnm/node-versions/v24.15.0/installation/bin:$PATH`).
- Phá-thử chỉ làm sau commit, trên tệp đã commit, rồi `git checkout -- <tệp>`.

## Review Focus

1. Sự kiện `action.result` lỗi tới sau khi lượt đã FAILED hoặc SUCCEEDED → không đổi gì, không ném (Task 3 ô «đã kết thúc»).
2. `session.completed` gặp lượt đã FAILED vì hook → giữ FAILED, một sự kiện `run.failed` (Task 3).
3. Cài đặt để trống → điều phối ghi model mặc định vào lượt, không truyền thuộc tính model, bộ chạy trả `null` (Task 2).
4. Kết quả có danh sách quá 50 phần tử → `finish_run` từ chối (Task 1).
5. Công cụ gốc import lỗi khi nạp trong test → phép quét đỏ và nêu tên tệp, không bỏ qua câm (Task 1).

---

### Task 0: Chụp kết quả lỗi thật của bộ chạy (fixture E4)

`independent: false` · phục vụ E4

**Files:**
- Create: `apps/agent/test/fixtures/runner-loi-that.json`

- [ ] Dựng kho riêng `bun run db:do --tao --ten tnm` (in URL dòng cuối).
- [ ] Chạy tác nhân nền trên kho đó với Node 24: `cd apps/agent && DATABASE_URL=<url> bun run dev:headless` (cổng 2000).
- [ ] Gieo bằng một kịch bản trong scratchpad (dùng `@crm/db` với `DATABASE_URL=<url>`): một user, `agentDefinition` LIVE, `agentVersion` DEPLOYED có `modelId: "google/gemini-3.8-flash"` và bản khai MANUAL + `run.summary` + `dataScope` WORKSPACE, `agentRun` QUEUED MANUAL.
- [ ] `curl -X POST -H "Authorization: Bearer $AGENT_BRIDGE_SECRET" http://127.0.0.1:2000/internal/crm/agent-dispatch`, chờ lượt kết thúc.
- [ ] Đọc `agentRunEvent` type `action.result` của lượt, chép nguyên `data` vào tệp fixture dạng `{"sha":"<HEAD>","ngay":"2026-09-27","model":"google/gemini-3.8-flash","su_kien":{"type":"action.result","data":<data>}}`.
- [ ] Kiểm: `data.result.kind == "subagent-result"`, `subagentName == "agent_runner"`, `isError == true`, `output.message` chứa «ref loops».
- [ ] Tắt tác nhân, `bun run db:do --xoa --ten tnm` và `--xoa --kho crm_tnm__mau_do`.
- [ ] Commit fixture.

### Task 1: Khuôn kết quả phẳng và phép quét khuôn di động

`independent: false` · phục vụ E1, E3

**Files:**
- Create: `apps/agent/agent/lib/run-result.ts`
- Modify: `apps/agent/agent/subagents/agent_runner/tools/finish_run.ts`
- Modify: `apps/agent/agent/subagents/agent_runner/agent.ts` (chỉ `outputSchema`)
- Modify: `apps/agent/agent/lib/run-runtime.ts:30-38`
- Create: `apps/agent/test/support/khuon-di-dong.ts`
- Create: `apps/agent/test/fixtures/ket-qua-that.json` (hai `result` thật ngày 27/09, từ báo cáo)
- Test: `apps/agent/test/khuon-di-dong.spec.ts`

**Interfaces:**
- Produces: `ketQuaLuot` (zod), `type KetQuaLuot`, `KET_QUA_LUOT` limits trong `DISPATCH.run`; `chuyenKhuon(schema): object`, `viPhamKhuon(ten, schema): string[]`, `quetKhuonAgent(): Promise<{ daQuet: string[]; viPham: string[] }>`.

- [ ] **Step 1: Test đỏ** — `khuon-di-dong.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { z } from "zod";
import finishRun from "../agent/subagents/agent_runner/tools/finish_run";
import runner from "../agent/subagents/agent_runner/agent";
import { ketQuaLuot } from "../agent/lib/run-result";
import { runResultOf } from "../agent/lib/run-runtime";
import { quetKhuonAgent, viPhamKhuon } from "./support/khuon-di-dong";
import that from "./fixtures/ket-qua-that.json";

describe("khuon-di-dong", () => {
	it("khuon-di-dong: moi khuon model thay khong co $ref", async () => {
		const { daQuet, viPham } = await quetKhuonAgent();
		expect(viPham).toEqual([]);
		for (const ten of [
			"tools/search_crm.ts", "tools/read_crm_history.ts",
			"agent_builder/tools/inspect_context.ts", "agent_builder/tools/write_agent_file.ts", "agent_builder/tools/save_agent_draft.ts",
			"agent_runner/tools/inspect_run.ts", "agent_runner/tools/query_crm.ts", "agent_runner/tools/read_crm_record.ts",
			"agent_runner/tools/create_crm_activity.ts", "agent_runner/tools/post_slack_message.ts", "agent_runner/tools/finish_run.ts",
			"agent_builder/agent.ts#output", "agent_runner/agent.ts#output",
		]) expect(daQuet.some((d) => d.endsWith(ten))).toBe(true);
		expect(daQuet.filter((d) => /\/agent\/tools\//.test(d)).length).toBeGreaterThanOrEqual(20);
	});
	it("khuon-di-dong: doi chung am", () => {
		expect(viPhamKhuon("mau-json", z.object({ result: z.record(z.string(), z.json()) }))).toEqual([
			"khuon co vong tham chieu: mau-json",
		]);
	});
});
```

  Cùng tệp, `describe("ket-qua-phang")`: hai kết quả thật (`test/fixtures/ket-qua-that.json` chép hai `result` ở báo cáo 27/09) parse qua `finishRun.inputSchema` và `toEqual` đầu vào; `{chiTiet:{a:1}}` thất bại với `issues[0].path` chứa `"chiTiet"`; danh sách 51 phần tử thất bại; `unwrap` của ô `result` trong `finishRun.inputSchema`, trong `runner.outputSchema`, và bộ đọc `runResultOf` cùng tham chiếu `ketQuaLuot` (`toBe`). `runResultOf` được so bằng cách kiểm `runResultOf({chiTiet:{a:1}})` trả `{}` và `runResultOf(that[0])` trả `that[0]`.

- [ ] **Step 2: Chạy, thấy đỏ**
  Run: `bun run test -- "cd apps/agent && bun test test/khuon-di-dong.spec.ts"`
  Expected: FAIL «khuon co vong tham chieu: …agent_runner/tools/finish_run.ts» và `Cannot find module '../agent/lib/run-result'`.

- [ ] **Step 3: Mã**

`apps/agent/agent/lib/run-result.ts`:
```ts
import { z } from "zod";
import { DISPATCH } from "./dispatch-config";

const oDon = z.union([z.string(), z.number().finite(), z.boolean(), z.null()]);

const oDanhSach = z
	.array(z.union([z.string(), z.number().finite()]))
	.max(DISPATCH.run.resultListMax);

export const ketQuaLuot = z.record(z.string(), z.union([oDon, oDanhSach]));

export type KetQuaLuot = z.infer<typeof ketQuaLuot>;
```
`dispatch-config.ts`: thêm vào `run`: `resultListMax: 50, failureReasonMaxChars: 1000,`.
`finish_run.ts`: `result: ketQuaLuot.nullish()` (import từ `../../../lib/run-result`).
`agent_runner/agent.ts`: `outputSchema: z.object({ summary: z.string().min(1).max(1000), result: ketQuaLuot.nullable() })`.
`run-runtime.ts`: bỏ `const runResult = z.record(z.string(), json)`; `export type RunResult = KetQuaLuot;` và `const storedRunResult = ketQuaLuot.catch({});` (giữ `json` cho phản hồi Slack).

`test/support/khuon-di-dong.ts`:
```ts
import { Glob } from "bun";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const GOC = join(dirname(new URL(import.meta.url).pathname), "..", "..", "agent");

type KhuonChuan = { "~standard": { jsonSchema: { input: (o: { target: string }) => object } } };

export function chuyenKhuon(schema: unknown): object {
	return (schema as KhuonChuan)["~standard"].jsonSchema.input({ target: "draft-07" });
}

export function viPhamKhuon(ten: string, schema: unknown): string[] {
	return JSON.stringify(chuyenKhuon(schema)).includes('"$ref"') ? [`khuon co vong tham chieu: ${ten}`] : [];
}

const MAU = ["tools/**/*.ts", "subagents/*/tools/**/*.ts", "subagents/*/agent.ts"];

export async function quetKhuonAgent() {
	const daQuet: string[] = [];
	const viPham: string[] = [];
	for (const mau of MAU) {
		for (const tep of new Glob(mau).scanSync(GOC)) {
			const duong = join(GOC, tep);
			const mod = (await import(duong)).default as { inputSchema?: unknown; outputSchema?: unknown } | undefined;
			if (tep.endsWith("agent.ts")) {
				if (mod?.outputSchema) { daQuet.push(`${duong}#output`); viPham.push(...viPhamKhuon(`${duong}#output`, mod.outputSchema)); }
				continue;
			}
			if (mod?.inputSchema) { daQuet.push(duong); viPham.push(...viPhamKhuon(duong, mod.inputSchema)); continue; }
			if (!readFileSync(duong, "utf8").includes("disableTool(")) viPham.push(`khong khuon, khong dau tat: ${duong}`);
		}
	}
	return { daQuet, viPham };
}
```
  Đối chứng «không khuôn, không dấu tắt»: test thêm một ô gọi hàm phân loại tách riêng `phanLoaiTep(duong, mod, nguon)` — tách hàm này khỏi vòng lặp để test gọi được với module giả `{}` và nguồn `"export default {}"` → trả `"khong khuon, khong dau tat: gia.ts"`.

- [ ] **Step 4: Xanh** — cùng lệnh, PASS; và `bun run test -- "cd apps/agent && bun test test/durable-agent-runtime.integration.spec.ts test/custom-agent-runtime.spec.ts"` PASS.
- [ ] **Step 5: Commit**, rồi **phá-thử**: đặt lại `z.json()` trong `finish_run.ts` → `khuon-di-dong` đỏ nêu `agent_runner/tools/finish_run.ts`; đổi `ketQuaLuot` thành `z.record(z.string(), z.unknown())` → ô «long bi tu choi» đỏ với thông điệp ghim `ket qua long phai bi tu choi` (đặt làm tham số thứ hai của `expect(...,"ket qua long phai bi tu choi")`). `git checkout --` sau mỗi lần; ghi hai lượt vào `pha-thu.md`.

### Task 2: Model giải theo vai

`independent: false` · phục vụ E6, E7

**Files:**
- Modify: `apps/agent/agent/lib/model.ts`
- Modify: `apps/agent/agent/agent.ts`, `apps/agent/agent/subagents/agent_builder/agent.ts`, `apps/agent/agent/subagents/agent_runner/agent.ts`
- Modify: `apps/agent/agent/lib/custom-agent-dispatch.ts:440-516`
- Modify: `apps/agent/test/durable-agent-runtime.integration.spec.ts:334` (kỳ vọng `modelId` đổi theo Cài đặt)
- Test: `apps/agent/test/model-theo-vai.integration.spec.ts`

**Interfaces:**
- Produces (`lib/model.ts`): `type VaiModel = "tro-ly" | "tac-nhan"`; `modelTheoVai(vai): Promise<ModelSelection | null>`; `vaiCuaPhien(ctx: PurposeContext): VaiModel`; `modelChoPhienGoc(ctx): Promise<ModelSelection | null>`; `modelChoBoDung(): Promise<ModelSelection | null>`; `modelChoBoChay(ctx): ModelSelection | null`; `modelChoLuot(): Promise<{ id: string; thuocTinh: Record<string, string> }>`.

- [ ] **Step 1: Test đỏ** — `model-theo-vai.integration.spec.ts`, hai `describe`:
  - `doi-sau-khi-dung`: lưu `appSetting` cũ; `writeAgentModel(db, {id:"test/model-x", contextWindowTokens: 1000})`; tạo user, agent LIVE, bản `modelId:"test/model-x"`, lượt QUEUED; `writeAgentModel(db, {id:"test/model-y", contextWindowTokens: 2000})`; `dispatchAgentRun(run.id, sendGia)` bắt `auth`; kỳ vọng `auth.attributes.modelId === "test/model-y"`, `auth.attributes.modelContextWindowTokens === "2000"`, `agentRun.modelId === "test/model-y"`, `agentVersion.modelId === "test/model-x"`, `modelChoBoChay({session:{auth:{current:{attributes:auth.attributes},initiator:null}}})` là `{model:"test/model-y", modelContextWindowTokens:2000}` với thông điệp ghim `luot moi phai chay model cua Cai dat`. Đối chứng: không đổi Cài đặt → `send` mang `test/model-x`. Quét AST (`typescript` `createSourceFile`) mọi `.ts` dưới `agent/`: không `PropertyAccessExpression` `version.modelId` nào ngoài `lib/builder-runtime.ts` → `[]`. Khôi phục `appSetting` ở `afterAll`.
  - `bon-phien`: ma trận `[{Cài đặt X}, {trống}] × [gốc research, gốc team-agent, bộ dựng, bộ chạy]`, đếm 8 ô. Gốc: `modelChoPhienGoc(ctx)`; bộ dựng: `modelChoBoDung()`; bộ chạy: `dispatchAgentRun` với lượt mới rồi `modelChoBoChay` từ thuộc tính bắt được. X → `{model:X,…}`; trống → `null`. Import-check bằng `new Bun.Transpiler({loader:"ts"}).scan(src).imports` trên ba `agent.ts`: có import `../lib/model`/`../../lib/model`; và quét AST: không lời gọi `readAgentModel` ngoài `lib/model.ts`, `lib/builder-runtime.ts`, `hooks/telemetry.ts` (thông điệp ghim `moi phien qua modelTheoVai`).
- [ ] **Step 2: Đỏ** — `bun run test -- "cd apps/agent && bun test test/model-theo-vai.integration.spec.ts"` → FAIL (`modelTheoVai` không có).
- [ ] **Step 3: Mã**

`lib/model.ts` (thay toàn tệp):
```ts
import { db } from "@crm/db";
import { DEFAULT_AGENT_MODEL, readAgentModel } from "@crm/db/settings";
import { attribute, purposeOf, type PurposeContext } from "./session-purpose";

export interface ModelSelection {
	model: string;
	modelContextWindowTokens: number;
}

export type VaiModel = "tro-ly" | "tac-nhan";

export async function modelTheoVai(vai: VaiModel): Promise<ModelSelection | null> {
	try {
		const setting = await readAgentModel(db);
		if (setting.isDefault) return null;
		return { model: setting.id, modelContextWindowTokens: setting.contextWindowTokens };
	} catch (error) {
		console.error(`[agent] could not read the configured model for ${vai}, falling back: ${error instanceof Error ? error.message : String(error)}`);
		return null;
	}
}

export function vaiCuaPhien(ctx: PurposeContext): VaiModel {
	const purpose = purposeOf(ctx);
	return purpose === "builder" || purpose === "team-agent" ? "tac-nhan" : "tro-ly";
}

export function modelChoPhienGoc(ctx: PurposeContext) {
	return modelTheoVai(vaiCuaPhien(ctx));
}

export function modelChoBoDung() {
	return modelTheoVai("tac-nhan");
}

export async function modelChoLuot() {
	const chon = await modelTheoVai("tac-nhan");
	if (!chon) return { id: DEFAULT_AGENT_MODEL.id, thuocTinh: {} as Record<string, string> };
	return {
		id: chon.model,
		thuocTinh: { modelId: chon.model, modelContextWindowTokens: String(chon.modelContextWindowTokens) },
	};
}

export function modelChoBoChay(ctx: PurposeContext): ModelSelection | null {
	if (purposeOf(ctx) !== "team-agent") return null;
	const model = attribute(ctx, "modelId");
	const cuaSo = Number(attribute(ctx, "modelContextWindowTokens"));
	return model && Number.isFinite(cuaSo) && cuaSo > 0 ? { model, modelContextWindowTokens: cuaSo } : null;
}
```
`agent.ts`: `events: { "session.started": (_event, ctx) => modelChoPhienGoc(ctx) }`.
`agent_builder/agent.ts`: `events: { "session.started": () => modelChoBoDung() }`.
`agent_runner/agent.ts`: `events: { "session.started": (_event, ctx) => modelChoBoChay(ctx) }`; bỏ import `db`.
`custom-agent-dispatch.ts`: trước `claim`: `const model = await modelChoLuot();`; trong `updateMany` `modelId: model.id`; bỏ `version: { select: { modelId: true } }`; trong `attributes` của `send`: `...model.thuocTinh`.
`durable-agent-runtime.integration.spec.ts:334`: `modelId: (await readAgentModel(db)).id` thay `"test/model"`.

- [ ] **Step 4: Xanh** — lệnh Step 2 PASS; `bun run test -- "cd apps/agent && bun test test/durable-agent-runtime.integration.spec.ts test/builder-runtime.integration.spec.ts"` PASS.
- [ ] **Step 5: Commit**, **phá-thử**: `agent_runner/agent.ts` quay về đọc `run.version.modelId` → `doi-sau-khi-dung` đỏ «luot moi phai chay model cua Cai dat»; `agent_builder/agent.ts` gọi thẳng `readAgentModel` → `bon-phien` đỏ «moi phien qua modelTheoVai». `git checkout --`; ghi `pha-thu.md`.

### Task 3: Hỏng hiện là hỏng

`independent: false` · phục vụ E4, E5

**Files:**
- Create: `apps/agent/agent/lib/dong-luot-tac-nhan.ts`
- Create: `apps/agent/agent/hooks/dong-luot-tac-nhan.ts`
- Modify: `apps/agent/agent/channels/crm.ts:171-205`
- Test: `apps/agent/test/dong-luot-tac-nhan.integration.spec.ts`

**Interfaces:**
- Consumes: `failRun` (`custom-agent-dispatch.ts`), `finishRun`, `runResultOf` (`run-runtime.ts`), `attribute`, `purposeOf`, `DISPATCH.run.failureReasonMaxChars`.
- Produces: `LY_DO_DONG_LUOT`, `dongLuotKhiBoChayLoi(data: unknown, ctx: PurposeContext): Promise<void>`, `choKetLuot(runId: string): Promise<void>`.

- [ ] **Step 1: Test đỏ** — fixture Task 0; tiền đề như `durable-agent-runtime` (user, agent LIVE, bản, lượt QUEUED → `dispatchAgentRun` với `send` giả bắt `auth`). Hook thật: `import hook from "../agent/hooks/dong-luot-tac-nhan"`; nạp một công cụ trước (`import "../agent/subagents/agent_runner/tools/finish_run"`) để eve dựng kho ngữ cảnh; gọi `trongNguCanhEve(() => hook.events["action.result"](suKien, { session: { id, auth: { current: auth, initiator: null } } }))`.
  - `bao-loi`: ô chính → FAILED, `RUNNER_FAILED`, `errorMessage === fixture.su_kien.data.result.output.message.slice(0,1000)`, đếm `run.failed` = 1 (thông điệp ghim `bo chay bao loi phai dong luot ngay`); `choKetLuot` sau đó → vẫn FAILED, vẫn 1. Ma trận 4 ô output (dài 5000 → 1000; chuỗi trần; `{}`; `null` → câu cố định). Đối chứng: `isError:false`; `subagentName:"agent_builder"`; `kind:"tool-result"`; purpose `research` → RUNNING. Ô «đã kết thúc»: lượt SUCCEEDED + sự kiện lỗi → vẫn SUCCEEDED, không ném.
  - `chua-nop`: lượt RUNNING, `result` null → `choKetLuot` → FAILED `RUNNER_NO_RESULT` câu cố định (ghim `chua nop ket qua phai la Hong`); lượt đã `stageRunResult(id,{summary:"xong",result:{a:1}})` → SUCCEEDED, `result` `{a:1}`. Nhánh `session.completed` của `channels/crm.ts` gọi `choKetLuot`: quét AST tệp đó, trong hàm `"session.completed"` có `CallExpression` tên `choKetLuot` và không còn `runResultOf`.
- [ ] **Step 2: Đỏ** — `bun run test -- "cd apps/agent && bun test test/dong-luot-tac-nhan.integration.spec.ts"` → FAIL (module không có).
- [ ] **Step 3: Mã**

`lib/dong-luot-tac-nhan.ts`:
```ts
import { db } from "@crm/db";
import { z } from "zod";
import { failRun } from "./custom-agent-dispatch";
import { DISPATCH } from "./dispatch-config";
import { finishRun, runResultOf } from "./run-runtime";
import { attribute, purposeOf, type PurposeContext } from "./session-purpose";

export const LY_DO_DONG_LUOT = {
	khongNop: "Bộ chạy dừng trước khi nộp kết quả.",
	khongLyDo: "Bộ chạy báo lỗi nhưng không nói lý do.",
} as const;

const loiBoChay = z.object({
	result: z.object({
		kind: z.literal("subagent-result"),
		subagentName: z.literal("agent_runner"),
		isError: z.literal(true),
		output: z.unknown(),
	}),
});

const loiCoCau = z.object({ message: z.string().trim().min(1) });

function lyDo(output: unknown): string {
	const coCau = loiCoCau.safeParse(output);
	return coCau.success ? coCau.data.message.slice(0, DISPATCH.run.failureReasonMaxChars) : LY_DO_DONG_LUOT.khongLyDo;
}

export async function dongLuotKhiBoChayLoi(data: unknown, ctx: PurposeContext) {
	if (purposeOf(ctx) !== "team-agent") return;
	const runId = attribute(ctx, "runId");
	const loi = loiBoChay.safeParse(data);
	if (!runId || !loi.success) return;
	await failRun(runId, "RUNNER_FAILED", lyDo(loi.data.result.output));
}

export async function choKetLuot(runId: string) {
	const run = await db.agentRun.findUnique({ where: { id: runId }, select: { status: true, summary: true, result: true } });
	if (run?.status !== "RUNNING") return;
	if (run.result === null) {
		await failRun(runId, "RUNNER_NO_RESULT", LY_DO_DONG_LUOT.khongNop);
		return;
	}
	try {
		await finishRun(runId, { summary: run.summary ?? "The agent run completed.", result: runResultOf(run.result) });
	} catch (error) {
		await failRun(runId, "NEVER_SETTLED", error instanceof Error ? error.message : String(error)).catch(() => {});
	}
}
```
`hooks/dong-luot-tac-nhan.ts`:
```ts
import { defineHook } from "eve/hooks";
import { dongLuotKhiBoChayLoi } from "../lib/dong-luot-tac-nhan";

export default defineHook({
	events: {
		async "action.result"(event, ctx) {
			try {
				await dongLuotKhiBoChayLoi(event.data, ctx);
			} catch (error) {
				console.warn("[dong-luot] could not close the run", { reason: error instanceof Error ? error.message : String(error) });
			}
		},
	},
});
```
`channels/crm.ts` nhánh `session.completed`: thay khối từ `const { db } = await import("@crm/db");` tới hết `catch` bằng `await choKetLuot(runId);` (import tĩnh `choKetLuot` từ `../lib/dong-luot-tac-nhan`; bỏ `finishRun, runResultOf` khỏi import nếu không còn dùng).

- [ ] **Step 4: Xanh** — lệnh Step 2 PASS; `durable-agent-runtime` PASS.
- [ ] **Step 5: Commit**, **phá-thử**: bỏ nhánh `isError` (đổi `z.literal(true)` thành `z.boolean()` và bỏ kiểm) → `bao-loi` đỏ «bo chay bao loi phai dong luot ngay»; hook default export `defineHook({events:{}})` → cùng đỏ; `choKetLuot` quay về `runResultOf(null)` → `chua-nop` đỏ «chua nop ket qua phai la Hong». `git checkout --`; ghi `pha-thu.md`.

### Task 4: Phép gọi thật ba nhà cung cấp

`independent: false` · phục vụ E2

**Files:**
- Create: `_acceptance/tac-nhan-model-rieng/rang/goi-that.ts`

- [ ] **Step 1: Mã** — script bun:

```ts
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { z } from "zod";

const GOC = join(dirname(new URL(import.meta.url).pathname), "..", "..", "..");
const AGENT = join(GOC, "apps/agent");
const eveReq = createRequire(createRequire(join(AGENT, "package.json")).resolve("eve/package.json"));
const { generateText, tool, jsonSchema } = eveReq("ai") as typeof import("ai");
const MODELS = ["google/gemini-3.8-flash", "zai/glm-5.2-fast", "openai/gpt-5-mini"];
const khuonCu = process.argv.includes("--khuon-cu");

if (!process.env.AI_GATEWAY_API_KEY) { console.log("thieu AI_GATEWAY_API_KEY"); process.exit(2); }

const chuyen = (s: unknown) => (s as { "~standard": { jsonSchema: { input: (o: object) => object } } })["~standard"].jsonSchema.input({ target: "draft-07" });
const tep = ["inspect_run", "query_crm", "read_crm_record", "create_crm_activity", "post_slack_message", "finish_run"];
const tools: Record<string, ReturnType<typeof tool>> = {};
for (const ten of tep) {
	const mod = (await import(join(AGENT, "agent/subagents/agent_runner/tools", `${ten}.ts`))).default;
	let khuon = mod.inputSchema;
	if (khuonCu && ten === "finish_run") khuon = z.object({ summary: z.string(), result: z.record(z.string(), z.json()).nullish() });
	tools[ten] = tool({ description: mod.description, inputSchema: jsonSchema(chuyen(khuon)) });
}
const runner = (await import(join(AGENT, "agent/subagents/agent_runner/agent.ts"))).default;
tools.final_output = tool({ description: "Final output", inputSchema: jsonSchema(chuyen(runner.outputSchema)) });
const finishRun = (await import(join(AGENT, "agent/subagents/agent_runner/tools/finish_run.ts"))).default;

let loi = 0;
for (const model of khuonCu ? [MODELS[0]] : MODELS) {
	try {
		const r = await generateText({
			model, tools, toolChoice: { type: "tool", toolName: "finish_run" }, maxOutputTokens: 400,
			prompt: 'Nộp kết quả bằng finish_run: summary "kiểm tra khuôn", result có đúng hai khoá: "kiemTra" là chữ "ok" và "soDem" là số 2.',
		});
		const goi = r.toolCalls[0];
		const doc = finishRun.inputSchema.safeParse(goi?.input);
		const ok = goi?.toolName === "finish_run" && doc.success && doc.data.result?.kiemTra !== undefined && doc.data.result?.soDem !== undefined;
		console.log(`${model} ${ok ? "ok" : `loi: ${JSON.stringify(goi?.input).slice(0, 200)}`}`);
		if (!ok) loi += 1;
	} catch (e) {
		const m = e instanceof Error ? e.message : String(e);
		if (khuonCu && m.includes("ref loops")) { console.log("khuon-cu: google tu choi nhu mong doi"); process.exit(3); }
		console.log(`${model} loi: ${m.slice(0, 200)}`);
		loi += 1;
	}
}
process.exit(loi === 0 ? 0 : 1);
```
- [ ] **Step 2: Chạy** `bun _acceptance/tac-nhan-model-rieng/rang/goi-that.ts` → ba dòng `ok`, exit 0. Nhà cung cấp nào từ chối: sửa khuôn (phạm vi vòng này), không nới phép đo.
- [ ] **Step 3: Chiều đỏ** `... --khuon-cu` → «khuon-cu: google tu choi nhu mong doi», exit 3. Ghi `pha-thu.md`, kèm tiền.
- [ ] **Step 4: Commit.**

### Task 5: Tài liệu, chỗ rẽ có tên, phép đo tài liệu

`independent: false` · phục vụ E8

**Files:**
- Modify: `docs/agent.md` (mục «Model», mục «Team-agent builder and runner», luật 2 và 6 của «Khi nào thêm…»; thêm đoạn «Chỗ rẽ có tên với bản của hãng»)
- Create: `_acceptance/tac-nhan-model-rieng/rang/tai-lieu.mjs`

- [ ] **Step 1:** Viết `tai-lieu.mjs` (node, `execFileSync("git", …)`, gốc suy từ vị trí tệp): nhận `--ref <sha>` (mặc định đọc tệp đĩa); tách mục theo `## `/`### `; bốn hàm kiểm như E8; tập (4) = `git diff --name-only $(git merge-base HEAD origin/onehub) HEAD` ∩ `git ls-tree -r --name-only origin/release`, so bằng tập tên trong các dòng `- \`…\`` của đoạn «Chỗ rẽ có tên với bản của hãng». Exit 0 khi HEAD đạt bốn và merge-base không đạt (1),(2),(4).
- [ ] **Step 2:** Chạy trên merge-base (`--ref`) → exit 1, in tên điều không đạt (chiều đỏ tự nhiên).
- [ ] **Step 3:** Sửa `docs/agent.md`: mục «Model» — model giải theo vai qua `modelTheoVai` (`lib/model.ts`), bộ chạy không ghim model theo bản, lượt ghi model đã chạy, khuôn di động (không `$ref`, test `khuon-di-dong.spec.ts`); mục Tác nhân — luật hỏng-hiện-hỏng với `RUNNER_FAILED`, `RUNNER_NO_RESULT`; luật 2 — model cố định chỉ cho `subagent` có ranh giới riêng (ZDR), cùng ranh giới với gốc thì dùng bộ giải theo vai; luật 6 trỏ phép quét; đoạn «Chỗ rẽ có tên với bản của hãng» liệt các tệp của hãng bị sửa.
- [ ] **Step 4:** `node _acceptance/tac-nhan-model-rieng/rang/tai-lieu.mjs` → exit 0.
- [ ] **Step 5: Commit.**

### Task 6: Bộ chứng đầy đủ

`independent: false`

- [ ] `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` (PATH Node 24) — xanh cả năm.
- [ ] Set contract `status: implemented`, commit, vào S4.
