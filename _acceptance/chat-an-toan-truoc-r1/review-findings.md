# Review findings: chat-an-toan-truoc-r1 (round 3)

## Trong hợp đồng

- **Shared Gateway catalog parser turns an unreadable catalog into [], and the agent and API read that [] in opposite ways**
  file: `packages/validation/src/gateway-danh-muc.ts:27`
  severity: medium
  AC: AC-8
  source: conventions
  detail: AGENTS.md (Parse at the boundary) says a parse failure must not be swallowed into an empty array, because "unreadable" and "empty" are different problems. `docDanhMucGateway` does exactly that: `gatewayCatalog.catch({ data: [] })` plus silently dropping rows that fail `safeParse`. The new shared module now has two consumers that disagree on what [] means. The agent (`apps/agent/agent/lib/model-danh-muc.ts:21`) treats [] as "khong-doc-duoc" and keeps the chosen model; docs/agent.md says the same: when the catalog cannot be read, the chosen model stays. The API's `ModelCatalogService.models()` caches [] as a valid catalog ([] is truthy, so `if (cached)` returns it for the whole TTL). Then `settings.service.ts:66` computes `selectedMissing = !isDefault && models !== null && effective === null`, which is true. Failure scenario: the Gateway returns 200 with a changed shape, e.g. `{models:[…]}`, or rows missing `context_window`/`tool-use`. Settings then shows the alert saying the agent is running the default model, while the agent is in fact still running the chosen model. Fix by having the parser return a distinct 'unreadable' result (or throw), so both callers handle it the same way.
  rationale: AC-8 requires selectedMissing=false when the catalog cannot be read, and AC-6(c) counts a body that is not a catalog as unreadable; the API treats it as an empty catalog and reports missing.

- **Evidence screenshots for step 1 (model removed) and step 4 (model still present) are byte-identical and show neither state**
  file: `_acceptance/chat-an-toan-truoc-r1/evidence/r1e-bi-go-1440.png:154`
  severity: medium
  AC: AC-9
  source: conventions
  detail: `shasum` shows `r1e-bi-go-1440.png` and `r1e-con-1440.png` share the same hash (44e52227…). Both are the top of /settings, cut off before the 'Tác nhân nghiên cứu' card: there is no alert and no model combobox in the frame. evals.yaml lines 154 and 157 name exactly these two files as the step 1 evidence (alert shown) and the step 4 evidence (no alert). So the committed evidence cannot tell the two states apart. The correct frames are in E9u-step1.png and E9u-step4.png (they do show the card and the alert or its absence); the r1e-* files are stale output from an earlier run. Replace them or remove them from the eval steps, so whoever signs Gate 2 does not see wrong evidence.
  rationale: AC-9 is proven by frames showing the alert present and absent; the two named evidence files are identical and show neither, so the AC-9 evidence does not prove it.

- **step.failed recomputes the session's model from the live catalog, so a session that started before the model was removed is logged with the default id, and a false model.bi-go-lui row is written**
  file: `apps/agent/agent/hooks/telemetry.ts:85`
  severity: high
  AC: AC-11
  source: bugs
  detail: eve resolves `session.started` once per session (node_modules/eve/docs/agent-config.md:73, guides/dynamic-capabilities.md:75). The model a session actually runs is therefore fixed by whatever `modelTheoVai` returned at session start. In the hook, `modelCuaPhien(ctx)` (lib/model.ts:109) does not read that frozen value. It calls `modelTheoVai` again, which reads `docDanhMuc()` again. Concrete case: a chat session starts while the catalog still lists model X (or the catalog cannot be read), so the session runs X. The Gateway removes X. After `MODEL_DANH_MUC.ttlMs` (5 min) the cache refreshes, the next step fails with GatewayModelNotFoundError, and `modelTheoVai` now sees X missing. It calls `ghiBiGoLui(X, vai)`, which writes a `model.bi-go-lui` row claiming the session fell back, although it did not and is failing. It then returns null, so `modelCuaPhien` returns `DEFAULT_AGENT_MODEL.id`. The `model.khong-tim-thay` row is written with the default model's id instead of X. This is the main way removal hurts a long-lived chat. Both numbers `dem-doi-truong.ts` reports for AC-6/AC-11 come out wrong: biGoLui goes up for a fallback that never happened, and khongTimThay carries the wrong modelId. It is the same AC-11 defect commit 0215b7c34 was meant to fix. The tests do not catch it because the preload `test/support/danh-muc-mac-dinh.ts` pins the catalog to 'khong-doc-duoc', so `modelTheoVai` always returns the chosen id in E11. The hook should get the id without the catalog check and without side effects, for example from the error's own `modelId`/details, or from `readAgentModel` with no catalog lookup and no `ghiBiGoLui`.
  rationale: AC-11 requires the model.khong-tim-thay row to carry the id of the model that failed; in this case it carries the default model id.

- **ghiBiGoLui marks an id as reported before the insert succeeds, so one failed write loses the fallback event for the life of the process**
  file: `apps/agent/agent/lib/model-danh-muc.ts:51`
  severity: medium
  AC: AC-6
  source: bugs
  detail: `daBao.add(modelId)` runs before `await db.agentEvent.create(...)`. If the insert throws (a DB hiccup or connection-pool timeout), the error goes up to the `catch` in `modelTheoVai`. That catch logs the misleading message "could not read the configured model ... falling back" and returns null. The fallback itself still happens. But `daBao` already holds the id, so every later fallback for that model in this process returns early and no `model.bi-go-lui` row is ever written. AC-6 promises exactly one row per id per process. Here the result is zero rows, and the measure in dem-doi-truong.ts reads 'no fallbacks' while every session is falling back. Fix: add to `daBao` only after the insert succeeds, or remove the id again in a catch.
  rationale: AC-6(b) promises exactly one model.bi-go-lui row per id per process; a failed insert leaves zero rows for the rest of the process.

- **Shape 5 (claims a whole class, tests one point case): E8 tests 'catalog unreadable' only with HTTP 503, which hides an agent/API split on malformed or empty bodies**
  file: `apps/api/test/cai-dat-model-bi-go.spec.ts:79`
  severity: high
  AC: AC-8
  source: measurement
  detail: AC-8 promises selectedMissing=false whenever the catalog cannot be read. AC-6 defines 'cannot be read' as three kinds: network error, HTTP error, and a body that is not a catalog (plus an empty list, see the 'rong' test). The E8 matrix has a single unreadable cell, `{ ten: "da chon, loi", danhMuc: "loi" }`, and datFetch only covers it with `new Response("loi", { status: 503 })` (line 38). There is no network-error cell, no malformed-body cell and no empty-list cell. The production code splits on exactly the missing cells. The agent's docDanhMucTuMang returns "khong-doc-duoc" when `ids.length === 0`, so it keeps the chosen model. The API's ModelCatalogService.fetchCatalog returns `[]` rather than null for a body like `{khong:"phai danh muc"}`, because docDanhMucGateway's `.catch({data:[]})` turns it into an empty list. SettingsService then computes `models !== null && effective === null`, which gives selectedMissing=true. Result: when Gateway returns a malformed or empty body, Settings tells both admins and members that the model was removed, while chat still runs the chosen model. E8 stays green. The test in model-lui-mac-dinh that checks agent and API produce the same id set only runs on the real fixture, never on the 'hong' or 'rong' cells, so it cannot catch this either.
  rationale: AC-8 promises selectedMissing=false for every unreadable catalog, and the malformed or empty body case gives true; the E8 matrix tests only HTTP 503.

- **Shape 2 (hand-written fixture shaped for the reader): the 'real Gateway body' fixture is a hand-assembled 30-entry subset with DEFAULT_AGENT_MODEL injected at the top**
  file: `apps/agent/test/fixtures/gateway-models-2026-10-05.json:5`
  severity: medium
  AC: AC-6
  source: measurement
  detail: AC-6(d) and gap-probe P1 require 'the real response body of GET https://ai-gateway.vercel.sh/v1/models recorded on 05/10', and the plan says to save it with `curl -s ... > fixture`. The committed file (already 30 entries in 774dcaf7a) has `zai/glm-5.2-fast` (= DEFAULT_AGENT_MODEL.id) first, followed by 29 `alibaba/*` entries in alphabetical order. There are no anthropic, openai or google entries, and the file is about 48 KB, while a full catalog has hundreds of models. That is not the shape of a curl output or of a head-truncated one. It is a hand-picked selection. The assertion in model-lui-mac-dinh.integration.spec.ts:165 `expect(ra.co.has(DEFAULT_AGENT_MODEL.id)).toBe(true)` is therefore true by construction of the fixture, not by reading the real body. Entries in the real body that might break the reader (for example a language model with context_window null that `z.number()` would silently drop) were never put through the reader. The red direction that swaps the outer key (data -> models) still works, but the claims 'the reader picks up every id of the real body' and 'it contains DEFAULT' are not measured against real output. The file also records no source or capture time, although the contract promises 'with date and source'.
  rationale: AC-6(d) requires the real recorded Gateway response body with date and source; the fixture is a hand-picked subset with no source or capture time.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **manage_fields/archive_field write the AgentEvent after the mutation, outside a transaction**
  Người dùng thấy gì: If the system fails to record the log entry right after a field is created or archived, the chat may report an error even though the change went through. A retry can then say the field already exists. This only happens during a database fault.
  file: `apps/agent/agent/tools/manage_fields.ts`
  severity: low
  Đề xuất: known-limits

- **Gateway catalog URL declared twice even though the parser was moved into a shared module**
  Người dùng thấy gì: The model list address is written in two places. If it ever changes, someone must update both, or one side will quietly read the wrong list. Nothing is wrong for users today.
  file: `apps/agent/agent/lib/model-config.ts`
  severity: low
  Đề xuất: wont-fix

- **Shape 5 (claims a whole class, tests point cases): E5 claims a check of 'every cell of the E1-E3 matrix', but its cmd runs only `-t ca-truong-su-kien` (5 point cases)**
  Người dùng thấy gì: One of the automatic checks for the activity log covers fewer cases than its description says. The rest are checked by other tests, so a problem would still be caught, just under a different label.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped for the reader): step.failed `details` in the E11 tests are hand-built to match laModelKhongTimThay instead of being derived from the real error**
  Người dùng thấy gì: The test for the missing-model error uses a hand-written error shape. If the chat engine renames its error fields in a future upgrade, the system could stop counting these failures and the tests would not warn us.
  file: `apps/agent/test/model-lui-mac-dinh.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/10 lỗi rơi vào file không bộ đo nào phủ (_acceptance/chat-an-toan-truoc-r1/evidence/r1e-bi-go-1440.png, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
