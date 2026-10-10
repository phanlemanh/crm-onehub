# Thước «một chỗ khai» quét thật khu soạn — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `mot-nguon.mjs` của K2b quét đủ ba gốc bằng đọc thư mục thật (gốc rỗng thì đỏ có tên), và hồ sơ K2d có bộ đo `do.mjs` chứng điều đó trên cây tạm, kể cả cặp trước/sau với bản thước `d089cb8d`.

**Architecture:** `chung.mjs` của K2b khai `GOC_QUET` và `tepQuet` (một chỗ). `mot-nguon.mjs` quét qua chúng, kiểm gốc trước khi nạp mô-đun, in dòng đếm. Bộ đo của hồ sơ (`_acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs`) gọi `mot-nguon.mjs` như tiến trình con, trên kho thật hoặc trên cây tạm dưới `.acceptance-runs/`.

**Tech Stack:** Bun 1.3.12 chạy `.mjs`, `node:fs`, `git`.

**Spec:** `docs/superpowers/specs/2026-10-09-thuoc-mot-cho-khai-quet-man-design.md` · hợp đồng `_acceptance/thuoc-mot-cho-khai-quet-man/contract.md` · `evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (`AGENTS.md`).
- Chỉ chạm ranh giới hàng K2d: `_acceptance/soan-okr-khong-lac/rang/**`, `_acceptance/thuoc-mot-cho-khai-quet-man/**`; cham-tep đã duyệt (P7-15): `_acceptance/config.yaml` chỉ thêm khoá `k2d_*`, design doc, kế hoạch này, `PRODUCT-MAP.md`, `LO-TRINH.html`.
- Dòng thành công cũ «mot-nguon: KET_QUA_NOP 1 cho, agent + app dung chung» và chiều đỏ `--ban-sao them-tap` của `mot-nguon.mjs` giữ nguyên (E7 K2b đã ký).
- Không chiều đỏ nào sửa tệp thật; cây tạm nằm dưới `.acceptance-runs/thuoc-mot-cho-khai-quet-man/`, xoá trong `finally`.

## Review Focus

- `tepQuet` bỏ `.tsx` hay lấy cả tệp không theo dõi → số đếm lệch `git ls-files` (E1 so hai vế, ca `--tu-thu` bỏ một `.tsx`).
- Gốc `agent` rỗng làm `mot-nguon.mjs` sập «Cannot find module» thay vì đỏ có tên (E3 đòi không có chuỗi đó).
- Cây tạm thiếu `node_modules` làm bản cũ thoát khác 0 trên cây lành — đối chứng dương thoát 2 «KHONG DO DUOC» thay vì đỏ giả (E2, E3).
- `git ls-files` với đường có `(app)` và `[slug]` phải dùng `:(literal)` (E1).
- Sau khi gộp, merge-base bằng HEAD — E6 phải tìm merge đưa hồ sơ lên thay vì đo diff rỗng.

---

### Task 1: Ba gốc quét một chỗ, đọc thư mục thật

**Files:**
- Modify: `_acceptance/soan-okr-khong-lac/rang/chung.mjs` (thêm `GOC_QUET`, `tepQuet`)
- Modify: `_acceptance/soan-okr-khong-lac/rang/mot-nguon.mjs` (bỏ `glob`, quét `GOC_QUET`)

**Evals phục vụ:** E1, E3, E4, E5 · **independent:** false (Task 2 đo nó)

**Interfaces:**
- Produces: `GOC_QUET: { agent: string, "khu-soan": string, validation: string }` (đường tương đối gốc kho), `tepQuet(thuMuc: string): string[]` (đường tuyệt đối `.ts`/`.tsx`, sắp xếp); `mot-nguon.mjs` in `   quet: agent <a> · khu-soan <k> · validation <v>`, gốc rỗng in `goc quet rong: <tên>` và thoát 1 trước khi nạp mô-đun.

- [ ] **Step 1: Thêm vào cuối `chung.mjs`**

```js
export const GOC_QUET = {
	agent: "apps/agent-okr/agent",
	"khu-soan": SOAN,
	validation: "packages/validation/src",
};

export function tepQuet(thuMuc) {
	if (!fs.existsSync(thuMuc)) return [];
	return fs
		.readdirSync(thuMuc, { recursive: true, withFileTypes: true })
		.filter((d) => d.isFile() && /\.tsx?$/.test(d.name))
		.map((d) => path.join(d.parentPath ?? d.path, d.name))
		.sort();
}
```

- [ ] **Step 2: Viết lại phần đầu `mot-nguon.mjs`**

```js
import path from "node:path";
import { GOC_QUET, NOP, ROOT, SOAN, VALIDATION, doiCo, docTep, ketLuan, tepQuet } from "./chung.mjs";

const co = doiCo(process.argv.slice(2));
let sai = 0;
const bao = (dong) => {
	sai++;
	console.log(dong);
};

const nguon = new Map();
const dem = [];
for (const [ten, goc] of Object.entries(GOC_QUET)) {
	const tep = tepQuet(path.join(ROOT, goc));
	dem.push(`${ten} ${tep.length}`);
	if (tep.length === 0) bao(`goc quet rong: ${ten}`);
	for (const t of tep) {
		const tuongDoi = path.relative(ROOT, t);
		nguon.set(tuongDoi, docTep(tuongDoi));
	}
}
console.log(`   quet: ${dem.join(" · ")}`);
if (sai) ketLuan(sai);

const agent = await import(path.join(ROOT, NOP));
const v = await import(path.join(ROOT, VALIDATION));
const options = agent.ketQuaNop.shape.ketQua.options;
const cungTap =
	options.length === v.KET_QUA_NOP.length && options.every((x, i) => x === v.KET_QUA_NOP[i]);
if (!cungTap) bao(`tap lech: agent ${JSON.stringify(options)} · validation ${JSON.stringify(v.KET_QUA_NOP)}`);

const KHAI_TAP = /(z\.enum\(\s*\[[^\]]*"da-ghi"[^\]]*\]|\[[^\]]*"da-ghi"[^\]]*\]\s*as\s+const)/g;
if (co["ban-sao"] === "them-tap") {
```

Phần còn lại của tệp (từ `nguon.set(NOP, …)` của nhánh `them-tap` tới `ketLuan(sai)`) giữ nguyên.

- [ ] **Step 3: Chạy trên kho**

Run: `bun _acceptance/soan-okr-khong-lac/rang/mot-nguon.mjs; echo exit=$?`
Expected: `   quet: agent 26 · khu-soan 22 · validation 70`, dòng `mot-nguon: KET_QUA_NOP 1 cho, agent + app dung chung`, `exit=0`.

Run: `bun _acceptance/soan-okr-khong-lac/rang/mot-nguon.mjs --ban-sao them-tap; echo exit=$?`
Expected: `tap ket qua khai 2 cho`, `exit=1`.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/soan-okr-khong-lac/rang/chung.mjs _acceptance/soan-okr-khong-lac/rang/mot-nguon.mjs
git commit -m "test(soan-okr-khong-lac): mot-nguon quét ba gốc bằng đọc thư mục, gốc rỗng thì đỏ (K2d)"
```

### Task 2: Bộ đo của hồ sơ và khoá cấu hình

**Files:**
- Create: `_acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs`
- Create: `_acceptance/thuoc-mot-cho-khai-quet-man/rang/ranh-gioi.json`
- Modify: `_acceptance/config.yaml` (thêm sáu dòng `k2d_*` sau `k2c_man`)

**Evals phục vụ:** E1–E6 · **independent:** false

**Interfaces:**
- Consumes: `GOC_QUET` từ `chung.mjs` của K2b (Task 1); dòng `quet:` của `mot-nguon.mjs`.
- Produces: `bun do.mjs <lanh|khai-trung|goc-rong|mot-cho|k2b-giu|ranh-gioi> [--tu-thu]`, thoát 0 xanh / 1 đỏ / 2 không đo được.

- [ ] **Step 1: `ranh-gioi.json`**

```json
{
	"globs": [
		"_acceptance/soan-okr-khong-lac/rang/**",
		"_acceptance/thuoc-mot-cho-khai-quet-man/**",
		"_acceptance/config.yaml",
		"docs/superpowers/specs/2026-10-09-thuoc-mot-cho-khai-quet-man-design.md",
		"docs/superpowers/plans/2026-10-09-thuoc-mot-cho-khai-quet-man.md",
		"PRODUCT-MAP.md",
		"LO-TRINH.html",
		"_acceptance/soan-okr-khong-lac/evidence-report.md",
		"_acceptance/soan-okr-khong-lac/run-log.jsonl"
	]
}
```

- [ ] **Step 2: `do.mjs`** — mã đầy đủ là tệp `_acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs` của commit task này. Cấu trúc: hằng `MONG` (ba gốc mong đợi, khai độc lập với `chung.mjs`), `BAN_CU = "d089cb8da"`, `DONG_XANH`; hàm `tepTs`, `demGit` (`git ls-files -- :(literal)<gốc>/`), `vanTay` (sha256 tệp thật ba gốc + `git status --porcelain`), `dungCay(ten, ban, sua)` (chép ba gốc, nối `node_modules` + `package.json` của `apps/agent-okr` và `packages/validation`, ghi `mot-nguon.mjs` + `chung.mjs` bản mới hay bản `d089cb8da`, chạy, xoá trong `finally`), `doiChungCu` (bản cũ trên cây lành phải thoát 0, khác thì thoát 2 «KHONG DO DUOC»), `globSangRe`; sáu chế độ đúng `expected` của E1–E6.

- [ ] **Step 3: Thêm vào `_acceptance/config.yaml` sau dòng `k2c_man`**

```yaml
    k2d_lanh: bun _acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs lanh
    k2d_khai_trung: bun _acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs khai-trung
    k2d_goc_rong: bun _acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs goc-rong
    k2d_mot_cho: bun _acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs mot-cho
    k2d_k2b_giu: bun _acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs k2b-giu
    k2d_ranh_gioi: bun _acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs ranh-gioi
```

- [ ] **Step 4: Chạy hai chiều từng chế độ**

Run: `for c in lanh khai-trung goc-rong mot-cho k2b-giu ranh-gioi; do bun _acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs $c; echo "$c exit=$?"; bun _acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs $c --tu-thu; echo "$c tu-thu exit=$?"; done`
Expected: mỗi chế độ `exit=0` với dòng in của `expected`; mỗi `--tu-thu` `exit=1` với thông điệp ghim của chiều đỏ; `git status --porcelain` trước và sau giống hệt.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/thuoc-mot-cho-khai-quet-man/rang _acceptance/config.yaml
git commit -m "test(thuoc-mot-cho-khai-quet-man): bộ đo do.mjs sáu chế độ hai chiều, khoá k2d_*"
```
