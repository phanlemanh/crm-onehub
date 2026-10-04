# Tắt Preview của project Vercel agent-okr — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vercel không tạo bản Preview nào cho project agent-okr, còn mỗi merge vào `onehub` vẫn sinh một bản Production READY.

**Architecture:** Một tệp `apps/agent-okr/vercel.json` chỉ có `$schema` và `git.deploymentEnabled` (`"**": false`, `"onehub": true`). Luật được đo cục bộ bằng một spec bun dùng minimatch, phá-thử trong bản sao, và đo trên Vercel thật bằng ba rang đọc API Vercel + commit status GitHub.

**Tech Stack:** bun test, zod, minimatch 10.2.6 (devDependency mới của `apps/agent-okr`), Vercel CLI `/opt/homebrew/bin/vercel api`, `gh api`.

**Spec:** `docs/superpowers/specs/2026-10-04-tat-preview-agent-okr-design.md`; hợp đồng `_acceptance/tat-preview-agent-okr/contract.md`, evals `_acceptance/tat-preview-agent-okr/evals.yaml`.

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Không đổi biến môi trường Vercel nào, không sửa `packages/db/prisma.config.ts`, không đặt `commandForIgnoringBuildStep`.
- `vercel.json` chỉ có khoá `$schema` và `git`; `git` chỉ có `deploymentEnabled`.
- Dữ liệu chưa định kiểu (JSON) được parse bằng zod ngay khi đọc.
- Đường dẫn trong test và rang suy từ vị trí tệp (`import.meta.dir` / `import.meta.url`), không hardcode gốc kho.
- Lệnh eval khai trong `_acceptance/config.yaml` dưới `executors.test.tpa_*` và `executors.script.tpa_*`.
- Vercel: `--scope phanlemanh-8330s-projects`; project agent-okr `prj_5a1UZt07Z4SnyHlnXaKgQEvvRYkB`. Không giải mã biến.

## Review Focus

- Branch có `/` (mọi branch làm việc ở kho này) — luật phải chặn; `*` là bẫy. Phủ ở Task 1 (bảng 15 branch) và Task 2 (đột biến `sao`).
- Branch mang chữ `onehub` mà khác `onehub` (`onehub-thu`, `onehub/con`, `sao-luu/onehub`) — không được deploy. Phủ ở Task 1.
- Commit chỉ chạm `_acceptance/**` hay `docs/**` — Vercel bỏ agent-okr vì «không bị ảnh hưởng», nên không chứng gì. Task 3 đo trên commit gần nhất chạm `apps/agent-okr/`, và Task 1 phải được đẩy làm đỉnh một lần đẩy riêng.
- Bản Production deploy tay (`source: cli`) cho cùng sha — không được tính là READY. Phủ ở Task 3 (E10).
- `vercel.json` hỏng JSON — `eve build` ném. Phủ ở Task 1 (zod/JSON.parse) và Task 2 (đột biến `json`); suite `build_khong_cache` chứng bản lành.

---

### Task 1: vercel.json + spec luật triển khai

Phục vụ E1, E2, E3. `independent: false` (Task 2 dùng spec này).

**Files:**
- Create: `apps/agent-okr/vercel.json`
- Create: `apps/agent-okr/test/vercel-trien-khai.spec.ts`
- Modify: `apps/agent-okr/package.json` (devDependency `minimatch`), `bun.lock`
- Modify: `_acceptance/config.yaml` (ba khoá `executors.test.tpa_*`)

**Interfaces:**
- Produces: spec có bốn ca tên `hop-le`, `onehub-trien-khai`, `nhanh-khac-khong-trien-khai`, `bo-khop-bat-bay-sao` trong describe `vercel-trien-khai`; đọc `../vercel.json` tương đối với tệp spec.

- [ ] **Step 1: Cài minimatch**

Run: `cd apps/agent-okr && bun add -d minimatch@^10.2.6`
Expected: `apps/agent-okr/package.json` có `"minimatch": "^10.2.6"` trong devDependencies.

- [ ] **Step 2: Viết spec (đỏ vì chưa có vercel.json)**

```ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { minimatch } from "minimatch";
import { z } from "zod";

const TEP_CAU_HINH = join(import.meta.dir, "..", "vercel.json");

const cauHinhVercel = z
	.object({
		$schema: z.string(),
		git: z
			.object({
				deploymentEnabled: z.record(z.string(), z.boolean()),
			})
			.strict(),
	})
	.strict();

type CauHinhVercel = z.infer<typeof cauHinhVercel>;
type LuatTrienKhai = { git: { deploymentEnabled: boolean | Record<string, boolean> } };

const NHANH = [
	"feat/a",
	"fix/a",
	"docs/a",
	"chore/a",
	"claude/a",
	"proto/a",
	"test/a",
	"ci/a",
	"dependabot/npm_and_yarn/a",
	"main",
	"release",
	"test-lane-per-run",
	"onehub-thu",
	"onehub/con",
	"sao-luu/onehub",
];

function docCauHinh(): CauHinhVercel {
	return cauHinhVercel.parse(JSON.parse(readFileSync(TEP_CAU_HINH, "utf8")));
}

function duocTrienKhai(cauHinh: LuatTrienKhai, nhanh: string): boolean {
	const luat = cauHinh.git.deploymentEnabled;
	if (typeof luat === "boolean") return luat;
	const khop = Object.entries(luat).filter(([mau]) => minimatch(nhanh, mau));
	if (khop.length === 0) return true;
	return khop.some(([, bat]) => bat);
}

describe("vercel-trien-khai", () => {
	test("hop-le", () => {
		const tho: unknown = JSON.parse(readFileSync(TEP_CAU_HINH, "utf8"));
		expect(cauHinhVercel.safeParse(tho).error?.issues ?? []).toEqual([]);
	});

	test("onehub-trien-khai", () => {
		expect(duocTrienKhai(docCauHinh(), "onehub")).toBe(true);
	});

	test("nhanh-khac-khong-trien-khai", () => {
		const cauHinh = docCauHinh();
		expect(NHANH).toHaveLength(15);
		expect(NHANH.map((nhanh) => ({ nhanh, trienKhai: duocTrienKhai(cauHinh, nhanh) }))).toEqual(
			NHANH.map((nhanh) => ({ nhanh, trienKhai: false })),
		);
	});

	test("bo-khop-bat-bay-sao", () => {
		const bay = { git: { deploymentEnabled: { "*": false, onehub: true } } };
		expect({
			fix: duocTrienKhai(bay, "fix/a"),
			main: duocTrienKhai(bay, "main"),
			onehub: duocTrienKhai(bay, "onehub"),
		}).toEqual({ fix: true, main: false, onehub: true });
	});
});
```

- [ ] **Step 3: Chạy, thấy đỏ**

Run: `cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/vercel-trien-khai.spec.ts`
Expected: 3 fail (ENOENT `vercel.json`), `bo-khop-bat-bay-sao` pass.

- [ ] **Step 4: Viết vercel.json**

```json
{
	"$schema": "https://openapi.vercel.sh/vercel.json",
	"git": {
		"deploymentEnabled": {
			"**": false,
			"onehub": true
		}
	}
}
```

- [ ] **Step 5: Chạy, thấy xanh**

Run: cùng lệnh Step 3. Expected: 4 pass, 0 fail.

- [ ] **Step 6: Khai lệnh eval** — thêm sau dòng `nbn_ca_tep:` trong `_acceptance/config.yaml`:

```yaml
    tpa_hop_le: cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/vercel-trien-khai.spec.ts -t hop-le
    tpa_onehub: cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/vercel-trien-khai.spec.ts -t onehub-trien-khai
    tpa_nhanh_khac: cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/vercel-trien-khai.spec.ts -t "nhanh-khac-khong-trien-khai|bo-khop-bat-bay-sao"
```

- [ ] **Step 7: Lint + dựng agent-okr**

Run: `cd apps/agent-okr && bun run lint && bun run check-types` rồi `bunx turbo run build --filter=agent-okr --force`
Expected: xanh cả ba.

- [ ] **Step 8: Commit và ĐẨY NGAY** (commit này phải là đỉnh của một lần đẩy riêng, vì E5 đo trên commit gần nhất chạm `apps/agent-okr/`)

```bash
git add apps/agent-okr/vercel.json apps/agent-okr/test/vercel-trien-khai.spec.ts apps/agent-okr/package.json bun.lock _acceptance/config.yaml
git commit -m "feat(agent-okr): tắt Preview bằng git.deploymentEnabled, chỉ onehub được deploy"
git push -u origin chore/tat-preview-agent-okr
```

### Task 2: phá-thử trong bản sao

Phục vụ E4. `independent: false` (dựa vào spec Task 1).

**Files:**
- Create: `_acceptance/tat-preview-agent-okr/rang/pha-thu.mjs`
- Modify: `_acceptance/config.yaml` (`executors.script.tpa_pha_thu`)

**Interfaces:**
- Consumes: spec Task 1 (tên bốn ca), `apps/agent-okr/node_modules`.
- Produces: lệnh `bun _acceptance/tat-preview-agent-okr/rang/pha-thu.mjs`, mã 0/1/2.

- [ ] **Step 1: Viết rang**

```js
import { cpSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const APP = join(GOC, "apps/agent-okr");
const CHO = join(GOC, ".acceptance-runs/tat-preview-agent-okr");

const CA = [
	{ ten: "lanh", sua: (s) => s, doi: { ma: 0, pass: 4 } },
	{ ten: "sao", sua: (s) => s.replace('"**"', '"*"'), doi: { ma: 1, ca: "nhanh-khac-khong-trien-khai", chua: ["fix/a", "claude/a"] } },
	{ ten: "onehub", sua: (s) => s.replace(/,\s*"onehub": true/, ""), doi: { ma: 1, ca: "onehub-trien-khai" } },
	{ ten: "json", sua: (s) => s.trimEnd().replace(/}$/, ""), doi: { ma: 1, ca: "hop-le", chua: ["JSON"] } },
	{ ten: "khoa", sua: (s) => s.replace("{", '{\n\t"buildCommand": "x",'), doi: { ma: 1, ca: "hop-le" } },
];

function chayCa(ca) {
	const sao = join(CHO, `sao-${ca.ten}-${process.pid}`);
	rmSync(sao, { recursive: true, force: true });
	mkdirSync(join(sao, "test"), { recursive: true });
	const goc = readFileSync(join(APP, "vercel.json"), "utf8");
	const doi = ca.sua(goc);
	if (ca.ten !== "lanh" && doi === goc) return { ma: 2, dong: `${ca.ten}: DOT-BIEN-KHONG-AN` };
	writeFileSync(join(sao, "vercel.json"), doi);
	cpSync(join(APP, "test/vercel-trien-khai.spec.ts"), join(sao, "test/vercel-trien-khai.spec.ts"));
	symlinkSync(join(APP, "node_modules"), join(sao, "node_modules"));
	const kq = spawnSync("bun", ["test", "test/vercel-trien-khai.spec.ts"], {
		cwd: sao,
		encoding: "utf8",
		env: { ...process.env, CRM_TELEMETRY_DISABLED: "1" },
	});
	rmSync(sao, { recursive: true, force: true });
	const ra = `${kq.stdout}\n${kq.stderr}`;
	if (!/\((pass|fail)\)/.test(ra)) return { ma: 2, dong: `${ca.ten}: BUN-KHONG-CHAY-TOI-TEST` };
	const fail = [...ra.matchAll(/\(fail\) vercel-trien-khai > (\S+)/g)].map((m) => m[1]);
	const pass = (ra.match(/\(pass\)/g) ?? []).length;
	if (ca.doi.ma === 0) {
		const dung = kq.status === 0 && fail.length === 0 && pass === ca.doi.pass;
		return { ma: dung ? 0 : 1, dong: `${ca.ten}: ma ${kq.status}, ${pass} pass, fail [${fail.join(", ")}]` };
	}
	const thieu = (ca.doi.chua ?? []).filter((chu) => !ra.includes(chu));
	const dung = kq.status !== 0 && fail.includes(ca.doi.ca) && thieu.length === 0;
	return { ma: dung ? 0 : 1, dong: `${ca.ten}: ma ${kq.status}, fail [${fail.join(", ")}]${thieu.length ? `, thieu ${thieu.join(", ")}` : ""}` };
}

mkdirSync(CHO, { recursive: true });
let ma = 0;
for (const ca of CA) {
	const kq = chayCa(ca);
	console.log(kq.dong);
	ma = Math.max(ma, kq.ma);
}
process.exit(ma);
```

Ca `sao` còn đòi `main` không lệch: thêm vào `doi` của ca `sao` điều kiện `!/"nhanh": "main",\s*\n\s*[-+]\s*"trienKhai"/.test(ra)` — gộp vào biến `dung` của nhánh đỏ khi `ca.ten === "sao"`.

- [ ] **Step 2: Khai lệnh** — sau dòng `nbn_quet_mau:`:

```yaml
    tpa_pha_thu: bun _acceptance/tat-preview-agent-okr/rang/pha-thu.mjs
```

- [ ] **Step 3: Chạy, thấy năm dòng đúng chữ ký, mã 0**

Run: `bun _acceptance/tat-preview-agent-okr/rang/pha-thu.mjs`
Expected: `lanh: ma 0, 4 pass, fail []`, bốn ca còn lại `ma 1, fail [<ca>]`, exit 0.

- [ ] **Step 4: Phá-thử chính rang** — tạm đổi `doi` của ca `onehub` thành `ca: "hop-le"` trong một bản chép của rang ở `.acceptance-runs/`, chạy, thấy exit 1 với dòng `onehub: ma 1, fail [onehub-trien-khai]`. Không sửa rang thật.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/tat-preview-agent-okr/rang/pha-thu.mjs _acceptance/config.yaml
git commit -m "test(tat-preview-agent-okr): rang phá-thử luật triển khai trong bản sao"
```

### Task 3: rang đo Vercel thật

Phục vụ E5, E6, E7, E8, E10. `independent: true` với Task 2 (chỉ đọc API).

**Files:**
- Create: `_acceptance/tat-preview-agent-okr/rang/vercel-doc.mjs`, `rang/vercel-preview.mjs`, `rang/vercel-production.mjs`
- Modify: `_acceptance/config.yaml` (sáu khoá `executors.script.tpa_vercel_*`)

**Interfaces:**
- Produces: `vercelApi(duong)`, `trienKhaiCho(projectId, sha)` → mảng chi tiết `/v13/deployments/<id>` mang `id, readyState, readyStateReason, source, target`; `statusGithub(sha)` → mảng `{context, state}` toàn lịch sử.

- [ ] **Step 1: `vercel-doc.mjs`**

```js
import { spawnSync } from "node:child_process";

export const VERCEL = "/opt/homebrew/bin/vercel";
export const SCOPE = "phanlemanh-8330s-projects";
export const AGENT_OKR = "prj_5a1UZt07Z4SnyHlnXaKgQEvvRYkB";
export const KHO = "phanlemanh/crm-onehub";

export class LoiApi extends Error {}

function chay(lenh, doiSo) {
	const kq = spawnSync(lenh, doiSo, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
	if (kq.status !== 0) throw new LoiApi(`${lenh} ${doiSo.join(" ")} -> ma ${kq.status}: ${kq.stderr.trim().slice(0, 400)}`);
	try {
		return JSON.parse(kq.stdout);
	} catch {
		throw new LoiApi(`${lenh} ${doiSo[0]} ${doiSo[1]}: khong phai JSON`);
	}
}

export function vercelApi(duong) {
	return chay(VERCEL, ["api", duong, "--scope", SCOPE]);
}

export function trienKhaiCho(projectId, sha) {
	const ds = vercelApi(`/v6/deployments?projectId=${projectId}&limit=100`).deployments ?? [];
	return ds
		.filter((d) => d.meta?.githubCommitSha === sha)
		.map((d) => vercelApi(`/v13/deployments/${d.uid}`))
		.map((d) => ({ id: d.id, readyState: d.readyState, readyStateReason: d.readyStateReason ?? "", source: d.source, target: d.target ?? "preview" }));
}

export function statusGithub(sha) {
	return chay("gh", ["api", "--paginate", `repos/${KHO}/commits/${sha}/statuses`]).map((s) => ({ context: s.context, state: s.state }));
}

export const ngu = (giay) => Bun.sleep(giay * 1000);
```

- [ ] **Step 2: `vercel-preview.mjs`** (`xanh` | `do`)

```js
import { spawnSync } from "node:child_process";
import { AGENT_OKR, LoiApi, ngu, statusGithub, trienKhaiCho } from "./vercel-doc.mjs";

const MOC_DO = "9333acad157ddb24f5128bcb98fec6d02ba5bab0";
const CHE_DO = process.argv[2];
const TRAN_GIAY = 600;
const NHIP_GIAY = 20;
const DOI_CHUNG = "Vercel – crm-onehub-";
const NGU_AGENT_OKR = "Vercel – agent-okr";

function git(...doiSo) {
	return spawnSync("git", doiSo, { encoding: "utf8" }).stdout.trim();
}

function thoat(ma, dong) {
	console.log(dong);
	process.exit(ma);
}

async function choDoiChung(sha) {
	for (let da = 0; da <= TRAN_GIAY; da += NHIP_GIAY) {
		const moiNhat = new Map();
		for (const s of statusGithub(sha)) if (!moiNhat.has(s.context)) moiNhat.set(s.context, s.state);
		const doiChung = [...moiNhat].filter(([c]) => c.startsWith(DOI_CHUNG));
		if (doiChung.length > 0 && doiChung.every(([, st]) => st !== "pending")) return doiChung;
		await ngu(NHIP_GIAY);
	}
	return null;
}

try {
	if (CHE_DO !== "xanh" && CHE_DO !== "do") thoat(2, "doi so: xanh | do");
	const sha = CHE_DO === "do" ? MOC_DO : git("log", "-1", "--format=%H", "HEAD", "--", "apps/agent-okr");
	if (!sha) thoat(2, "KHONG-CO-COMMIT cham apps/agent-okr");
	if (!git("branch", "-r", "--contains", sha)) thoat(2, `CHUA-DAY ${sha}`);
	const doiChung = await choDoiChung(sha);
	if (!doiChung) thoat(2, `DOI-CHUNG-VANG ${sha}`);
	const dsTrienKhai = trienKhaiCho(AGENT_OKR, sha);
	const statusDo = statusGithub(sha).filter((s) => s.context === NGU_AGENT_OKR && (s.state === "failure" || s.state === "error"));
	const nen = doiChung.map(([c, st]) => `${c}=${st}`).join(", ");
	const ngan = sha.slice(0, 8);
	if (CHE_DO === "xanh") {
		if (dsTrienKhai.length === 0 && statusDo.length === 0) thoat(0, `agent-okr: 0 deployment, 0 status do cho ${sha}; doi chung: ${nen}`);
		thoat(1, `agent-okr co ${dsTrienKhai.map((d) => `${d.id} (${d.readyState})`).join(", ") || "0 deployment"}; status do ${statusDo.length} cho ${sha}`);
	}
	const coTrienKhai = dsTrienKhai.length > 0;
	const coStatusDo = statusDo.length > 0;
	if (coTrienKhai) console.log(`agent-okr co deployment cho ${ngan}…: ${dsTrienKhai.map((d) => `${d.id} (${d.readyState})`).join(", ")}`);
	if (coStatusDo) console.log(`status ${NGU_AGENT_OKR} failure cho ${ngan}…`);
	thoat(coTrienKhai && coStatusDo ? 0 : 1, `do: deployment ${coTrienKhai ? "thay" : "VANG"}, status do ${coStatusDo ? "thay" : "VANG"}; doi chung: ${nen}`);
} catch (loi) {
	if (loi instanceof LoiApi) thoat(2, `LOI-API ${loi.message}`);
	throw loi;
}
```

- [ ] **Step 3: `vercel-production.mjs`** (`xanh` [sha, mặc định `origin/onehub`] | `do` | `bo-tay`)

```js
import { spawnSync } from "node:child_process";
import { AGENT_OKR, LoiApi, ngu, trienKhaiCho } from "./vercel-doc.mjs";

const MOC = { do: "226231c9cfb19a0c76cf28f2a8ded8d712c87948", "bo-tay": "ff8c337294773cabc1103eb4a764734a04754168" };
const CHE_DO = process.argv[2];
const TRAN_GIAY = 600;
const NHIP_GIAY = 20;
const CUOI = new Set(["READY", "ERROR", "CANCELED"]);

function thoat(ma, dong) {
	console.log(dong);
	process.exit(ma);
}

function shaXanh() {
	if (process.argv[3]) return process.argv[3];
	spawnSync("git", ["fetch", "-q", "origin", "onehub"]);
	return spawnSync("git", ["rev-parse", "origin/onehub"], { encoding: "utf8" }).stdout.trim();
}

async function banGit(sha, cho) {
	for (let da = 0; da <= (cho ? TRAN_GIAY : 0); da += NHIP_GIAY) {
		const ds = trienKhaiCho(AGENT_OKR, sha).filter((d) => d.target === "production");
		for (const d of ds) if (d.source !== "git") console.log(`bo qua ${d.id} (source ${d.source})`);
		const git = ds.find((d) => d.source === "git" && CUOI.has(d.readyState));
		if (git) return git;
		if (cho) await ngu(NHIP_GIAY);
	}
	return null;
}

try {
	if (!["xanh", "do", "bo-tay"].includes(CHE_DO)) thoat(2, "doi so: xanh [sha] | do | bo-tay");
	const sha = CHE_DO === "xanh" ? shaXanh() : MOC[CHE_DO];
	const ban = await banGit(sha, CHE_DO === "xanh");
	if (!ban) thoat(CHE_DO === "xanh" ? 1 : 2, `KHONG-CO-PRODUCTION git cho ${sha}`);
	const dong = `agent-okr production ${ban.id} (git): ${ban.readyState}${ban.readyStateReason ? ` — ${ban.readyStateReason}` : ""}`;
	if (CHE_DO === "xanh") {
		if (ban.readyState === "READY") thoat(0, `${dong} cho ${sha}`);
		const biChan = /Ignored Build Step|deploymentEnabled/i.test(ban.readyStateReason);
		thoat(ban.readyState === "CANCELED" && !biChan ? 2 : 1, `${ban.readyState === "CANCELED" && !biChan ? "BI-THAY " : ""}${dong}`);
	}
	if (CHE_DO === "do") thoat(ban.readyState === "CANCELED" && ban.readyStateReason.includes("Ignored Build Step") ? 0 : 1, dong);
	thoat(ban.readyState === "CANCELED" ? 0 : 1, dong);
} catch (loi) {
	if (loi instanceof LoiApi) thoat(2, `LOI-API ${loi.message}`);
	throw loi;
}
```

- [ ] **Step 4: Khai lệnh** — sau `tpa_pha_thu:`:

```yaml
    tpa_vercel_preview_xanh: bun _acceptance/tat-preview-agent-okr/rang/vercel-preview.mjs xanh
    tpa_vercel_preview_do: bun _acceptance/tat-preview-agent-okr/rang/vercel-preview.mjs do
    tpa_vercel_production_xanh: bun _acceptance/tat-preview-agent-okr/rang/vercel-production.mjs xanh
    tpa_vercel_production_do: bun _acceptance/tat-preview-agent-okr/rang/vercel-production.mjs do
    tpa_vercel_production_bo_tay: bun _acceptance/tat-preview-agent-okr/rang/vercel-production.mjs bo-tay
```

- [ ] **Step 5: Chạy các chiều đỏ ngay** (không cần merge)

Run: `bun …/vercel-preview.mjs do`, `bun …/vercel-production.mjs do`, `bun …/vercel-production.mjs bo-tay`
Expected: cả ba exit 0; `bo-tay` in `bo qua dpl_9Ldx… (source cli)` và `dpl_6tv5… (git): CANCELED`.

- [ ] **Step 6: Chạy chiều xanh của Preview** (sau khi Task 1 đã đẩy)

Run: `bun …/vercel-preview.mjs xanh`
Expected: exit 0, `agent-okr: 0 deployment, 0 status do cho <sha Task 1>`.

- [ ] **Step 7: Commit**

```bash
git add _acceptance/tat-preview-agent-okr/rang/vercel-*.mjs _acceptance/config.yaml
git commit -m "test(tat-preview-agent-okr): rang đo Preview và Production agent-okr trên Vercel thật"
```

### Task 4: docs/setup.md

Phục vụ E9. `independent: true`.

**Files:**
- Modify: `docs/setup.md` mục «Deploying `apps/agent-okr` to Vercel»

- [ ] **Step 1: Sửa bảng và đoạn dưới bảng** — hàng `Ignored Build Step | empty` giữ; thêm hàng `Preview deployments | off — apps/agent-okr/vercel.json`; thay đoạn «The agent-okr check is red on every pull request, and that is expected…» bằng đoạn nói Preview tắt bằng `git.deploymentEnabled` trong `apps/agent-okr/vercel.json` (chỉ `onehub` deploy, `**` vì `*` không khớp `/`), giữ đoạn cấm Ignored Build Step theo `VERCEL_ENV` và lời dặn deploy `onehub` lên Production rồi kiểm READY sau mỗi lần đổi.

- [ ] **Step 2: Commit**

```bash
git add docs/setup.md
git commit -m "docs(setup): Preview của agent-okr tắt bằng apps/agent-okr/vercel.json"
```
