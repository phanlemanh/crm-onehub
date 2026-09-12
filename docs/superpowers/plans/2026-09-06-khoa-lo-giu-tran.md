# Khoá lô giữ trần — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng bộ răng nghiệm thu hai chiều cho bản sửa đã có trong `apps/agent/agent/lib/tasks.ts`, để hồ sơ `khoa-lo-giu-tran` qua được S4 và cổng trước-merge.

**Architecture:** Mã sửa và bốn bài kiểm đã nằm trên nhánh. Kế hoạch chỉ thêm ba thứ: (1) bộ dựng trong bài kiểm tự canh thống kê, (2) một tệp răng trong `apps/agent/rang/` đo cơ chế (số lượt `LockRows`, đồng thời) trên cả bản sửa lẫn bản trước sửa nạp từ git vào thư mục tạm, (3) một script chân `_acceptance/khoa-lo-giu-tran/rang.sh` chạy từng phép đo trên cơ sở dữ liệu riêng và khai vào `config.yaml`.

**Tech Stack:** bun test, Prisma (`@crm/db`, sự kiện `query`), Postgres 17, bash.

**Spec:** `docs/superpowers/specs/2026-09-06-khoa-lo-giu-tran-design.md`

## Global Constraints

- Không viết chú thích trong mã.
- Răng KHÔNG ghi vào `apps/agent/agent/lib/tasks.ts`; bản cũ và đột biến chỉ sống ở `apps/agent/rang/.tmp/` (gitignore), tên có PID.
- Mỗi chân dùng cơ sở dữ liệu riêng `crm_khoa_lo_<chân>_test`, dựng bằng `bun run db:test` với `TEST_DATABASE_URL` ghi đè.
- Sha bản trước sửa: `746d3ef8ef8667c5e59545bf5f9b71b97d98f2c9`. Vắng trong clone → thoát mã 2.
- Lệnh trong `evals.yaml` chỉ là `config:` ref; khai key bằng `config-patch.mjs`, không sửa tay `config.yaml`.

---

### Task 1: Bộ dựng tự canh thống kê, và trần đếm cả phần còn lại

**Files:**
- Modify: `apps/agent/test/tasks.integration.spec.ts` (khối `describe("a limited lock subquery when the planner re-runs it per row")`)

**Interfaces:**
- Produces: bốn bài kiểm giữ tên cũ; `staleStatistics()` ném `Error("statistics drifted: reltuples=<n>")` khi `pg_class.reltuples > 1`; hai bài trần khẳng định thêm còn đúng 1 hàng chưa xử lý.
- `independent: false` (Task 3 chạy chính các bài này).

- [ ] **Step 1: Sửa bộ dựng và hai bài trần**

```ts
	async function staleStatistics(attempts: number) {
		await db.agentTask.deleteMany({});
		await insert(0, attempts);
		await db.$executeRaw`ANALYZE "agentTask"`;
		for (let index = 1; index < rows; index++) await insert(index, attempts);
		const [stats] = await db.$queryRaw<{ reltuples: number }[]>`
			SELECT reltuples::float8 AS reltuples FROM pg_class WHERE relname = 'agentTask'
		`;
		if (!stats || stats.reltuples > 1) {
			throw new Error(`statistics drifted: reltuples=${stats?.reltuples}`);
		}
	}
```

```ts
	it("retireExhausted still retires exactly the limit", async () => {
		await staleStatistics(MAX_ATTEMPTS);
		expect(await retireExhausted(limit)).toHaveLength(limit);
		expect(await db.agentTask.count({ where: { kind, finishedAt: null } })).toBe(rows - limit);
	});

	it("claimDue still claims exactly the limit", async () => {
		await staleStatistics(0);
		expect(await claimDue(limit, RESEARCH)).toHaveLength(limit);
		expect(await db.agentTask.count({ where: { kind, leasedUntil: { lt: new Date() } } })).toBe(rows - limit);
	});
```

- [ ] **Step 2: Chạy bốn bài, đối chứng dương**

Run: `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tasks.integration.spec.ts -t "planner re-runs"`
Expected: `4 pass`, `0 fail`.

- [ ] **Step 3: Phá vật thật — thống kê trôi phải đỏ đúng chữ**

Tạm đổi trong bản sao: gọi `ANALYZE` một lần nữa SAU vòng chèn (bản sao ở `rang/.tmp/`, không sửa tệp thật) rồi chạy bài "the fixture bites".
Expected: đỏ với `statistics drifted: reltuples=3`, không phải `Expected length`.

- [ ] **Step 4: Commit**

```bash
git add apps/agent/test/tasks.integration.spec.ts
git commit -m "test(agent): bộ dựng thống kê cũ tự canh reltuples, trần đếm cả phần còn lại"
```

### Task 2: Tệp răng đo cơ chế

**Files:**
- Create: `apps/agent/rang/khoa-lo-giu-tran.rang.ts`

**Interfaces:**
- Consumes: `retireExhausted(limit)` từ `../agent/lib/tasks`; sự kiện `query` của Prisma (cần `PRISMA_LOG_QUERIES=true` lúc nạp `@crm/db`); `git show 746d3ef8…:apps/agent/agent/lib/tasks.ts`.
- Produces: bốn bài, tên chứa `explain fixed`, `explain pre-fix`, `concurrent fixed`, `concurrent no-lock`; mỗi bài in một dòng `LockRows loops=<n> (<bản>)` hoặc `unique=<n>/<tổng> (<bản>)`. Chỉ chạy khi `KHOA_LO_RANG=1`.
- `independent: false` (Task 3 gọi tệp này).

- [ ] **Step 1: Viết tệp răng**

```ts file=apps/agent/rang/khoa-lo-giu-tran.rang.ts
import { afterAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { MAX_ATTEMPTS } from "@crm/db/agent-tasks";
import { z } from "zod";
import * as current from "../agent/lib/tasks";

type Tasks = typeof current;

const queryParams = z.array(
	z.union([
		z.iso.datetime({ offset: true }).transform((iso) => new Date(iso)),
		z.string(),
		z.number(),
		z.boolean(),
		z.null(),
	]),
);

type Captured = { query: string; params: z.infer<typeof queryParams> };

const PRE_FIX_SHA = "746d3ef8ef8667c5e59545bf5f9b71b97d98f2c9";
const SOURCE = "apps/agent/agent/lib/tasks.ts";
const TMP = join(import.meta.dir, ".tmp");
const kind = "khoa-lo-rang";
const armed = process.env.KHOA_LO_RANG === "1";
const limit = 2;
const stale = 3;
const crowd = 40;
const callers = 8;

const written: string[] = [];

function relocate(source: string): string {
	return source.replace(
		'from "./dispatch-config"',
		'from "../../agent/lib/dispatch-config"',
	);
}

async function load(name: string, source: string): Promise<Tasks> {
	mkdirSync(TMP, { recursive: true });
	const file = join(TMP, `${name}-${process.pid}.ts`);
	writeFileSync(file, relocate(source));
	written.push(file);
	return (await import(file)) as Tasks;
}

function preFixSource(): string {
	const shown = Bun.spawnSync(["git", "show", `${PRE_FIX_SHA}:${SOURCE}`], {
		cwd: import.meta.dir,
	});
	if (shown.exitCode !== 0) {
		console.error(`sha ${PRE_FIX_SHA} không có trong clone`);
		process.exit(2);
	}
	return shown.stdout.toString();
}

async function currentSource(): Promise<string> {
	return Bun.file(join(import.meta.dir, "../agent/lib/tasks.ts")).text();
}

let latest: Captured | null = null;
db.$on("query", (event) => {
	if (event.query.includes('UPDATE "agentTask"')) {
		latest = {
			query: event.query,
			params: queryParams.parse(JSON.parse(event.params)),
		};
	}
});

async function exhausted(count: number) {
	await db.agentTask.deleteMany({});
	for (let index = 0; index < count; index++) {
		await db.agentTask.create({
			data: {
				kind,
				reason: "rang",
				dueAt: new Date(Date.now() - (count - index) * 60_000),
				attempts: MAX_ATTEMPTS,
				leasedUntil: new Date(Date.now() - 1000),
			},
		});
	}
}

async function staleStatistics() {
	await exhausted(1);
	await db.$executeRaw`ANALYZE "agentTask"`;
	for (let index = 1; index < stale; index++) {
		await db.agentTask.create({
			data: {
				kind,
				reason: "rang",
				dueAt: new Date(Date.now() - (stale - index) * 60_000),
				attempts: MAX_ATTEMPTS,
				leasedUntil: new Date(Date.now() - 1000),
			},
		});
	}
}

async function lockRowsLoops(
	mod: Tasks,
): Promise<{ loops: number; cte: boolean }> {
	await staleStatistics();
	latest = null;
	await mod.retireExhausted(limit);
	const captured = latest as Captured | null;
	if (!captured)
		throw new Error("no UPDATE captured from the Prisma query event");
	await staleStatistics();
	const plan: string[] = [];
	await db
		.$transaction(async (tx) => {
			const rows = await tx.$queryRawUnsafe<{ "QUERY PLAN": string }[]>(
				`EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF) ${captured.query}`,
				...captured.params,
			);
			for (const row of rows) plan.push(row["QUERY PLAN"]);
			throw new Error("rollback");
		})
		.catch((error: Error) => {
			if (error.message !== "rollback") throw error;
		});
	const lock = plan.find((line) => line.includes("LockRows"));
	const loops = Number(/loops=(\d+)/.exec(lock ?? "")?.[1] ?? Number.NaN);
	if (Number.isNaN(loops))
		throw new Error(`no LockRows node in plan:\n${plan.join("\n")}`);
	return { loops, cte: plan.some((line) => line.includes("CTE Scan")) };
}

function assertDisjoint(results: { id: string }[][]): Set<string> {
	const ids = results.flat().map((row) => row.id);
	const unique = new Set(ids);
	if (unique.size !== ids.length) {
		throw new Error(
			`duplicate ids: ${ids.length - unique.size} of ${ids.length}`,
		);
	}
	return unique;
}

async function concurrent(mod: Tasks) {
	await exhausted(crowd);
	await db.$executeRaw`ANALYZE "agentTask"`;
	return Promise.all(
		Array.from({ length: callers }, () => mod.retireExhausted(limit)),
	);
}

afterAll(async () => {
	await db.agentTask.deleteMany({ where: { kind } });
	for (const file of written) rmSync(file, { force: true });
});

describe.skipIf(!armed)("khoa-lo-giu-tran rang", () => {
	it("explain fixed: LockRows runs once behind a CTE Scan", async () => {
		const { loops, cte } = await lockRowsLoops(current);
		console.log(`LockRows loops=${loops} (fixed) cte=${cte}`);
		expect(loops).toBe(1);
		expect(cte).toBe(true);
	});

	it("explain pre-fix: LockRows runs once per outer row", async () => {
		const old = await load("pre-fix", preFixSource());
		const { loops } = await lockRowsLoops(old);
		console.log(`LockRows loops=${loops} (pre-fix)`);
		expect(loops).toBe(stale);
	});

	it("concurrent fixed: eight callers never share a row", async () => {
		const results = await concurrent(current);
		const unique = assertDisjoint(results);
		console.log(`unique=${unique.size}/${callers * limit} (fixed)`);
		for (const batch of results)
			expect(batch.length).toBeLessThanOrEqual(limit);
		expect(unique.size).toBe(callers * limit);
	});

	it("concurrent no-lock: dropping FOR UPDATE SKIP LOCKED hands out duplicates", async () => {
		const source = (await currentSource()).replaceAll(
			"FOR UPDATE SKIP LOCKED",
			"",
		);
		const noLock = await load("no-lock", source);
		const results = await concurrent(noLock);
		const ids = results.flat().map((row) => row.id);
		console.log(`unique=${new Set(ids).size}/${ids.length} (no-lock)`);
		expect(() => assertDisjoint(results)).toThrow(/duplicate ids/);
	});
});
```

- [ ] **Step 2: Chạy tệp răng trên cơ sở dữ liệu riêng**

Run: `cd apps/agent && TEST_DATABASE_URL=<url crm_khoa_lo_rang_test> KHOA_LO_RANG=1 PRISMA_LOG_QUERIES=true CRM_TELEMETRY_DISABLED=1 bun test ./rang/khoa-lo-giu-tran.rang.ts`
Expected: `4 pass`, dòng `LockRows loops=1 (fixed) cte=true`, `LockRows loops=3 (pre-fix)`, `unique=16/16 (fixed)`, `unique=<n<16>/16 (no-lock)`.

- [ ] **Step 3: Không có biến môi trường thì bỏ qua**

Run: `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test ./rang/khoa-lo-giu-tran.rang.ts`
Expected: `0 pass`, `4 skip`.

- [ ] **Step 4: Lint rồi commit**

```bash
cd apps/agent && bunx biome check rang/ && cd ../.. && git add apps/agent/rang/khoa-lo-giu-tran.rang.ts && git commit -m "test(agent): răng khoa-lo-giu-tran đo số lượt LockRows và đồng thời trên bản sửa lẫn bản trước sửa"
```

### Task 3: Script chân, bằng chứng diff, khai key vào config

**Files:**
- Create: `_acceptance/khoa-lo-giu-tran/rang.sh`
- Create: `_acceptance/khoa-lo-giu-tran/evidence/spec-diff.patch`
- Modify: `_acceptance/config.yaml` (qua `config-patch.mjs`, tám key `khoa_lo_*`)

**Interfaces:**
- Consumes: bốn bài "planner re-runs" (Task 1), tệp răng (Task 2).
- Produces: `bash _acceptance/khoa-lo-giu-tran/rang.sh --chan <tran-retire|tran-claim|can|chieu-do|giai-thich|dong-thoi|toan-tep|tai-lieu>`; mỗi chân thoát 0 và in dòng `rang <chân>: …`; đỏ thì in `RANG DO: …`; hạ tầng hỏng thì thoát 2.
- `independent: false`.

- [ ] **Step 1: Viết script chân**

```bash file=_acceptance/khoa-lo-giu-tran/rang.sh
#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WS="$ROOT/_acceptance/khoa-lo-giu-tran"
AGENT="$ROOT/apps/agent"
SPEC="test/tasks.integration.spec.ts"
RANG="./rang/khoa-lo-giu-tran.rang.ts"
SHA="746d3ef8ef8667c5e59545bf5f9b71b97d98f2c9"
FILTER="planner re-runs"

[ "${1:-}" = "--chan" ] || { echo "rang: dùng --chan tran-retire|tran-claim|can|chieu-do|giai-thich|dong-thoi|toan-tep|tai-lieu"; exit 2; }
CHAN="${2:-}"

base_url() {
  if [ -n "${TEST_DATABASE_URL:-}" ]; then printf '%s' "$TEST_DATABASE_URL"; return; fi
  grep '^TEST_DATABASE_URL=' "$ROOT/.env" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"'
}

prepare_db() {
  local base name
  base="$(base_url)"
  [ -n "$base" ] || { echo "không đọc được TEST_DATABASE_URL từ môi trường hay .env gốc"; exit 2; }
  name="crm_khoa_lo_$(printf '%s' "$1" | tr '-' '_')_test"
  export TEST_DATABASE_URL
  TEST_DATABASE_URL="$(printf '%s' "$base" | sed -E "s#/[A-Za-z0-9_]+(\?|\$)#/${name}\1#")"
  (cd "$ROOT" && bun run db:test >/dev/null 2>&1) || { echo "không dựng được cơ sở dữ liệu ${name}"; exit 2; }
}

run_once() {
  (cd "$AGENT" && CRM_TELEMETRY_DISABLED=1 KHOA_LO_RANG=1 PRISMA_LOG_QUERIES=true bun test "$@" 2>&1)
}

run_test() {
  local out
  out="$(run_once "$@")"
  if printf '%s' "$out" | grep -q "Cannot find module '\./internal/"; then
    echo "nạp lại một lần: Prisma client đang được sinh lại bởi lệnh khác (turbo ^build)" >&2
    sleep 5
    out="$(run_once "$@")"
  fi
  printf '%s' "$out"
}

count() { printf '%s' "$1" | grep -Eo "^ *[0-9]+ $2" | tail -1 | grep -Eo '[0-9]+'; }

expect_counts() {
  local out="$1" pass="$2" fail="$3" got_pass got_fail
  got_pass="$(count "$out" pass)"; got_fail="$(count "$out" fail)"
  [ -n "$got_pass" ] && [ -n "$got_fail" ] || { echo "không đọc được số ca"; echo "$out" | tail -20; exit 1; }
  if [ "$got_pass" != "$pass" ] || [ "$got_fail" != "$fail" ]; then
    echo "RANG DO: mong $pass pass / $fail fail, nhận $got_pass pass / $got_fail fail"
    echo "$out" | grep -E '\(fail\)|Expected|Received|error:' | head -20
    exit 1
  fi
}

source_hash() { git -C "$ROOT" hash-object apps/agent/agent/lib/tasks.ts; }

tree_untouched() {
  [ "$(source_hash)" = "$1" ] || { echo "RANG DO: tasks.ts trong cây làm việc bị chân này đổi"; exit 1; }
  [ -z "$(git -C "$ROOT" status --porcelain apps/agent/agent/lib/tasks.ts)" ] || { echo "RANG DO: tasks.ts có thay đổi chưa commit sau khi chạy"; exit 1; }
}

next_paragraph() {
  awk -v RS= '/claimDue.*sorts what it claims/{ if ((getline para) > 0) print para; exit }' "$1"
}

doc_rule() {
  local para
  para="$(next_paragraph "$1")"
  [ -n "$para" ] || { echo "RANG DO: không thấy luật neo 'claimDue sorts what it claims' hoặc không có đoạn nào ngay sau nó"; return 1; }
  printf '%s' "$para" | grep -q 'MATERIALIZED' || { echo "RANG DO: đoạn ngay sau luật neo không phải luật CTE (thiếu MATERIALIZED)"; return 1; }
  for word in claimDue retireExhausted; do
    printf '%s' "$para" | grep -q "$word" || { echo "RANG DO: đoạn luật thiếu $word"; return 1; }
  done
}

drop_word_after_anchor() {
  awk -v w="$2" 'found{gsub(w,"")} /sorts what it claims/{found=1} {print}' "$1"
}

wedge_after_anchor() {
  awk 'p&&/^$/{print; print "Một đoạn chen vào giữa luật neo và luật CTE."; print ""; p=0; next} /sorts what it claims/{p=1} {print}' "$1"
}

expect_red() {
  local file="$1" pin="$2" out
  out="$(doc_rule "$file" 2>&1)" && { echo "RANG CUN: bản sao hỏng mà răng vẫn xanh (mong: $pin)"; return 1; }
  printf '%s' "$out" | grep -qF "$pin" || { echo "RANG DO: bản sao hỏng đỏ nhưng sai thông điệp — mong '$pin', nhận '$out'"; return 1; }
  echo "  chiều đỏ ghim: $out"
}

case "$CHAN" in
  tran-retire)
    prepare_db "$CHAN"
    OUT="$(run_test "$SPEC" -t "retireExhausted still retires exactly the limit")"
    expect_counts "$OUT" 1 0
    echo "rang tran-retire: retireExhausted(2) trả đúng 2, còn 1 hàng mở"
    ;;
  tran-claim)
    prepare_db "$CHAN"
    OUT="$(run_test "$SPEC" -t "claimDue still claims exactly the limit")"
    expect_counts "$OUT" 1 0
    echo "rang tran-claim: claimDue(2) trả đúng 2, còn 1 hàng chưa thuê"
    ;;
  can)
    prepare_db "$CHAN"
    OUT="$(run_test "$SPEC" -t "the fixture bites")"
    expect_counts "$OUT" 2 0
    echo "rang can: probe khuôn FROM trả đủ 3 hàng dù LIMIT 2, thống kê không trôi"
    ;;
  chieu-do)
    git -C "$ROOT" cat-file -e "$SHA" 2>/dev/null || { echo "sha $SHA không có trong clone"; exit 2; }
    prepare_db "$CHAN"
    BEFORE="$(source_hash)"
    TMP="$AGENT/rang/.tmp"; mkdir -p "$TMP"
    OLD="$TMP/pre-fix-$$.ts"; OLDSPEC="$TMP/pre-fix-spec-$$.rang.ts"
    trap 'rm -f "$OLD" "$OLDSPEC"' EXIT
    git -C "$ROOT" show "$SHA:apps/agent/agent/lib/tasks.ts" | sed 's#"./dispatch-config"#"../../agent/lib/dispatch-config"#' > "$OLD"
    sed "s#\"../agent/lib/tasks\"#\"./pre-fix-$$\"#" "$AGENT/$SPEC" > "$OLDSPEC"
    OUT="$(run_test "./rang/.tmp/pre-fix-spec-$$.rang.ts" -t "$FILTER")"
    expect_counts "$OUT" 2 2
    RED="$(printf '%s' "$OUT" | grep -c 'Received length: 3')"
    [ "$RED" -eq 2 ] || { echo "RANG DO: mong 2 dòng 'Received length: 3', nhận $RED"; echo "$OUT" | tail -20; exit 1; }
    printf '%s' "$OUT" | grep -q 'Expected length: 2' || { echo "RANG DO: thiếu 'Expected length: 2'"; exit 1; }
    printf '%s' "$OUT" | grep -E '^\(fail\)' | grep -qv 'still' && { echo "RANG DO: bài đỏ không phải bài trần"; exit 1; }
    tree_untouched "$BEFORE"
    echo "rang chieu-do: bản trước sửa đỏ đúng hai bài trần với 'Expected length: 2 / Received length: 3', hai bài bites xanh, cây làm việc nguyên"
    ;;
  giai-thich)
    git -C "$ROOT" cat-file -e "$SHA" 2>/dev/null || { echo "sha $SHA không có trong clone"; exit 2; }
    prepare_db "$CHAN"
    BEFORE="$(source_hash)"
    OUT="$(run_test "$RANG" -t "explain")"
    expect_counts "$OUT" 2 0
    printf '%s' "$OUT" | grep -q 'LockRows loops=1 (fixed) cte=true' || { echo "RANG DO: thiếu dòng loops=1 của bản sửa"; echo "$OUT" | tail -20; exit 1; }
    printf '%s' "$OUT" | grep -q 'LockRows loops=3 (pre-fix)' || { echo "RANG DO: thiếu dòng loops=3 của bản trước sửa"; echo "$OUT" | tail -20; exit 1; }
    tree_untouched "$BEFORE"
    echo "rang giai-thich: LockRows loops=1 với CTE Scan ở bản sửa, loops=3 ở bản trước sửa"
    ;;
  dong-thoi)
    prepare_db "$CHAN"
    BEFORE="$(source_hash)"
    OUT="$(run_test "$RANG" -t "concurrent")"
    expect_counts "$OUT" 2 0
    printf '%s' "$OUT" | grep -q 'unique=16/16 (fixed)' || { echo "RANG DO: thiếu dòng unique=16/16 của bản sửa"; echo "$OUT" | tail -20; exit 1; }
    NL="$(printf '%s' "$OUT" | grep -Eo 'unique=[0-9]+/16 \(no-lock\)' | grep -Eo '=[0-9]+' | tr -d '=')"
    [ -n "$NL" ] && [ "$NL" -lt 16 ] || { echo "RANG DO: bản bỏ khoá không cho id trùng (unique=${NL:-?})"; exit 1; }
    tree_untouched "$BEFORE"
    echo "rang dong-thoi: 8 lượt song song, bản sửa 16/16 id khác nhau, bản bỏ khoá chỉ $NL/16"
    ;;
  toan-tep)
    prepare_db "$CHAN"
    OUT="$(run_test "$SPEC")"
    expect_counts "$OUT" 19 0
    git -C "$ROOT" diff "$SHA" -- "apps/agent/$SPEC" | cmp -s - "$WS/evidence/spec-diff.patch" || { echo "RANG DO: spec-diff.patch stale — chạy lại: git diff $SHA -- apps/agent/$SPEC > _acceptance/khoa-lo-giu-tran/evidence/spec-diff.patch"; exit 1; }
    echo "rang toan-tep: 19 pass 0 fail, spec-diff.patch khớp diff sống"
    ;;
  tai-lieu)
    DOC="$ROOT/docs/agent.md"
    doc_rule "$DOC" || exit 1
    FIX="$(mktemp)"; trap 'rm -f "$FIX"' EXIT
    drop_word_after_anchor "$DOC" MATERIALIZED > "$FIX"; expect_red "$FIX" "không phải luật CTE (thiếu MATERIALIZED)" || exit 1
    drop_word_after_anchor "$DOC" claimDue > "$FIX"; expect_red "$FIX" "đoạn luật thiếu claimDue" || exit 1
    drop_word_after_anchor "$DOC" retireExhausted > "$FIX"; expect_red "$FIX" "đoạn luật thiếu retireExhausted" || exit 1
    wedge_after_anchor "$DOC" > "$FIX"; expect_red "$FIX" "không phải luật CTE" || exit 1
    echo "rang tai-lieu: đoạn ngay sau 'claimDue sorts what it claims' nêu claimDue, retireExhausted, MATERIALIZED; bốn bản sao hỏng đỏ đúng thông điệp"
    ;;
  *)
    echo "rang: chân lạ $CHAN"; exit 2 ;;
esac
```

- [ ] **Step 2: Sinh bằng chứng diff của tệp kiểm**

```bash
mkdir -p _acceptance/khoa-lo-giu-tran/evidence
git diff 746d3ef8ef8667c5e59545bf5f9b71b97d98f2c9 -- apps/agent/test/tasks.integration.spec.ts > _acceptance/khoa-lo-giu-tran/evidence/spec-diff.patch
```

- [ ] **Step 3: Khai tám key vào config bằng script chung**

```bash
CP=/Users/manhphan/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.8.0/scripts/config-patch.mjs
for c in tran-retire tran-claim can chieu-do giai-thich dong-thoi toan-tep tai-lieu; do
  k="khoa_lo_$(printf '%s' "$c" | tr '-' '_')"
  node "$CP" --config _acceptance/config.yaml --key "executors.script.$k" --value "bash _acceptance/khoa-lo-giu-tran/rang.sh --chan $c" --write
done
```

- [ ] **Step 4: Chạy tám chân, đối chứng dương**

Run: `for c in tran-retire tran-claim can chieu-do giai-thich dong-thoi toan-tep tai-lieu; do bash _acceptance/khoa-lo-giu-tran/rang.sh --chan $c; echo "exit $?"; done`
Expected: tám dòng `rang <chân>: …`, tám `exit 0`.

- [ ] **Step 5: Phá vật thật cho chân toan-tep và tai-lieu**

Run: đổi một ký tự trong `evidence/spec-diff.patch` rồi chạy `--chan toan-tep`. Expected: `RANG DO: spec-diff.patch stale`, exit 1; trả lại tệp. Chân tai-lieu tự phá trong bản sao (bước RANG CUN).

- [ ] **Step 6: Commit**

```bash
git add _acceptance/khoa-lo-giu-tran/rang.sh _acceptance/khoa-lo-giu-tran/evidence/spec-diff.patch _acceptance/config.yaml
git commit -m "chore(acceptance): khoa-lo-giu-tran — tám chân răng trên cơ sở dữ liệu riêng, bằng chứng diff tệp kiểm, khai key"
```

### Task 4: Đánh dấu đã thi công

- [ ] Set `status: implemented` trong `_acceptance/khoa-lo-giu-tran/contract.md`, commit, rồi dispatch S4 ngay trong cùng lượt.
