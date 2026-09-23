# Ca «chủ cuối cùng» nói tường minh tiền đề — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ca `chu-cuoi-cung` của api xanh bất kể trong workspace còn chủ lạ, không làm yếu ca, không để lại tác dụng phụ.

**Architecture:** Trong ca, `haChuLa(chu)` hạ mọi owner khác `chu` xuống member và trả về id đã hạ; thân ca bọc `try`; `finally` gọi `traVai(ids)` trả lại đúng những id đó. Răng đo chạy trên bản sao `apps/api` ở `.acceptance-runs/chu-cuoi-cung-tien-de/sao-*` với tệp dò cài chủ lạ và member lạ.

**Tech Stack:** bun 1.4.2 (`bun test --preload ./test/setup.ts`, `--reporter=junit`, `Bun.Glob`), Prisma qua `@crm/db`.

**Spec:** `docs/superpowers/specs/2026-09-23-chu-cuoi-cung-tien-de-design.md` · hợp đồng `_acceptance/chu-cuoi-cung-tien-de/contract.md` · evals `_acceptance/chu-cuoi-cung-tien-de/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Chỉ sửa `apps/api/test/workspace-thanh-vien.spec.ts` ngoài `_acceptance/**` và tệp T1 (AC-5).
- Commit gốc: `058bb75f8d9766ffe7654384201642664be83c21`.
- Răng: bản sao ở `.acceptance-runs/`, đọc mã thoát, lỗi ném `Dung` bắt ở đỉnh để `finally` dọn bản sao; mỗi phép đo có cặp hai chiều cùng fixture (MEASURE-BIRTH-CLAUSE).

---

### Task 1: Lập tiền đề tường minh trong ca `chu-cuoi-cung`

`independent: false` · phục vụ E1–E4, E9

**Files:**
- Modify: `apps/api/test/workspace-thanh-vien.spec.ts` (thêm hai hàm cạnh `don()`, bọc thân ca `chu cuoi cung khong go duoc, hai chu thi go duoc`)

**Interfaces:**
- Produces: hàm `haChuLa(chu: string): Promise<string[]>` và `traVai(ids: string[]): Promise<void>`; thân ca có đúng chuỗi `const daHa = await haChuLa(chu);` và khối `} finally {\n\t\t\tawait traVai(daHa);\n\t\t}` — Task 2 đột biến trên các mốc này.

- [ ] **Step 1: Chiều đỏ trước khi sửa** — tệp dò cài chủ lạ rồi chạy ca (đã chạy 2026-09-23 trên `058bb75f`: `(fail) chu-cuoi-cung …`, nhận `["", 1, …]`).

- [ ] **Step 2: Thêm hai hàm sau `don()`**

```ts
async function haChuLa(chu: string): Promise<string[]> {
	const chuLa = await db.member.findMany({
		where: { organizationId: WORKSPACE_ID, role: "owner", userId: { not: chu } },
		select: { id: true },
	});
	const ids = chuLa.map((m) => m.id);
	await db.member.updateMany({
		where: { id: { in: ids } },
		data: { role: "member" },
	});
	return ids;
}

async function traVai(ids: string[]): Promise<void> {
	await db.member.updateMany({
		where: { id: { in: ids } },
		data: { role: "owner" },
	});
}
```

- [ ] **Step 3: Bọc thân ca** — ngay sau `const chu = await dungNguoi("chu", "owner");` thêm `const daHa = await haChuLa(chu);`, mở `try {` bao toàn bộ phần còn lại của thân ca, đóng bằng `} finally { await traVai(daHa); }`.

- [ ] **Step 4: Chạy tệp** — `bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts ./test/workspace-thanh-vien.spec.ts"` → 0 fail.

- [ ] **Step 5: Commit** — `test(api): ca chu cuoi cung lap tien de chu duy nhat va tra vai sau ca`.

---

### Task 2: Răng đo + executor

`independent: false` (đột biến trên mốc của Task 1) · phục vụ E1–E5

**Files:**
- Create: `_acceptance/chu-cuoi-cung-tien-de/rang/chu-la.mjs`
- Modify: `_acceptance/config.yaml` (khoá `executors.script.ccc_chu_la`, `ccc_tra_vai`, `ccc_khong_chu_la`, `ccc_dot_bien`, `ccc_pham_vi` qua `config-patch.mjs`)

**Interfaces:**
- Consumes: mốc của Task 1; câu ghim `The workspace needs an owner. Make someone else an owner first.`; mốc `owners.length <= 1` sau `async removeMember(` trong `apps/api/src/workspace/workspace.service.ts`.
- Produces: `bun _acceptance/chu-cuoi-cung-tien-de/rang/chu-la.mjs --chan <chu-la|tra-vai|khong-chu-la|dot-bien|pham-vi>`; exit 0 đạt · 1 răng đỏ/cùn · 2 tiền đề mất.

Thiết kế răng:
- `saoChep(ban, dotBien[])`: chép `package.json`, `tsconfig.json`, `src`, `test` của `apps/api` vào `.acceptance-runs/chu-cuoi-cung-tien-de/sao-<ban>-<hex>`, symlink `node_modules`; `ban === "goc"` thay tệp kiểm bằng `git show 058bb75f:apps/api/test/workspace-thanh-vien.spec.ts`; áp từng đột biến (mốc phải có mặt, không thì `TIEN DE`).
- Tệp dò `test/.do/do.spec.ts`: `beforeAll` cài chủ lạ `ccc-chu-la` (owner) và `ccc-member-la` (member); import `../workspace-thanh-vien.spec.ts`; `afterAll` in `VAI-GIU|VAI-MAT <vai>` cho từng người rồi xoá hai hàng. Chạy với `-t chu-cuoi-cung`.
- Đọc kết quả từ junit (testcase `chu cuoi cung khong go duoc, hai chu thi go duoc` passed/failed/skipped) và mã thoát.
- Đột biến: `G` guard `owners.length <= 1` → `owners.length < 1` (trong `removeMember`); `F` khối trả vai → `catch (loi) { throw loi; }` rồi gọi `traVai` sau khối; `T` `traVai` đổi `where` thành mọi member thường của workspace.

- [ ] **Step 1:** viết `chu-la.mjs`; **Step 2:** chạy năm chân (qua `bun run test --`, trừ `pham-vi`) → exit 0; **Step 3:** phá-thử: `CCC_GOC=HEAD` cho `chu-la` → exit 2 `TIEN DE`; **Step 4:** khai executor; **Step 5:** commit.
