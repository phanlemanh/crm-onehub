# K3b ban-gieo-gop-y-sau-nop — Kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bàn gieo dùng chung `san-gop-y.mjs` gieo được lại sau khi công cụ nộp tự đóng việc, để ba bàn đo màn OKR chạy lại.

**Architecture:** Tách phần kiểm «nộp xong» thành hàm thuần `kiemNopXong(kq, viec)` trong `san-gop-y.mjs`, bỏ `completeTask`, thêm dòng dấu hiệu dương sau khi gieo. Năm răng trong `_acceptance/ban-gieo-gop-y-sau-nop/rang/` đo đường gieo thật, ma trận bốn ca, ba bàn đo, ranh giới và đột biến trên bản sao.

**Tech Stack:** Bun 1.3.12, Prisma (`packages/db`), agent OKR (`apps/agent/agent/lib/okr`), phiên đo `mot-luot.sh`.

**Spec:** `docs/superpowers/specs/2026-10-09-ban-gieo-gop-y-sau-nop-design.md` · hợp đồng `_acceptance/ban-gieo-gop-y-sau-nop/contract.md` · `evals.yaml`.

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Chỉ đổi `_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs`, `_acceptance/ban-gieo-gop-y-sau-nop/**`, `_acceptance/config.yaml` (chỉ thêm), cùng tệp chạm tệp P1-49.
- Không phá tệp bàn gieo thật trong phép đo; vết đặt trên bản sao `.san-gop-y-vet-<pid>.mjs` cạnh tệp thật.
- Kết cục đọc từ `TRO_LY_OKR.ketThuc.daNop` của `apps/agent/agent/lib/okr/config.ts`, không chép chuỗi.

## Review Focus

1. Một bàn đo gọi `gieoGopY` hai lần trong cùng phiên (ví dụ chạy hai khổ): lần hai bị `dungLai` vì `inputHash` không đổi — bàn gieo phải ném có tên, không gieo «xanh» rỗng. Đã có: `nop()` giữ chặn `dungLai`; E3 sẽ lộ ra nếu bàn đo nào gọi hai lần.
2. Đầu ra bàn đo không có dòng KET LUAN vì bị ngắt (trần giờ): E3 phải báo `thieu ket luan`, không coi là qua. Task 3 Step 1 ghim bằng `--phan-loai` trên tệp rỗng.
3. `BAN_GIEO` trỏ tệp không tồn tại: phép đo phải thoát 2 «KHONG DO DUOC», không đỏ như một vết bị bắt. Task 2 Step 1.
4. Bản sao vết sót lại sau khi bị ngắt: lần chạy sau phải dọn bản sao cũ trước khi bắt đầu. Task 4 Step 1.
5. Tệp thật bị sửa tay giữa lượt: E5 so băm trước/sau, lệch thì thoát 3. Task 4 Step 1.

---

### Task 1: `kiemNopXong` và dấu hiệu dương trong bàn gieo (AC-1, AC-2)

`independent: false` (mọi task sau dùng nó) · Evals: E1, E2

**Files:**
- Modify: `_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs:1-10` (nhập), `:43-90` (`nguCanhCon` xuất ra, `nop`), `gieoGopY` (dòng dấu hiệu)
- Create: `_acceptance/ban-gieo-gop-y-sau-nop/rang/kiem-nop.mjs`

**Interfaces:**
- Produces: `export function kiemNopXong(kq: {ketQua, lyDo}, viec: {id, finishedAt, outcome} | null): void` — ném `Error`; `export function nguCanhCon(phienGoc)`; dòng stdout `gieo-gop-y: xong A <id> (<n> dong cho), B <id> (rong)`.

- [ ] **Step 1: Răng E2 (đỏ trước)** — `kiem-nop.mjs`:

```js
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { TRO_LY_OKR } from "../../../apps/agent/agent/lib/okr/config.ts";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const tep = resolve(GOC, process.env.BAN_GIEO ?? "_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs");
if (!existsSync(tep)) { console.log(`KHONG DO DUOC: khong co ban gieo ${tep}`); process.exit(2); }
const { kiemNopXong } = await import(pathToFileURL(tep).href);
if (typeof kiemNopXong !== "function") { console.log("KHONG DO DUOC: ban gieo khong xuat kiemNopXong"); process.exit(2); }
const XONG = TRO_LY_OKR.ketThuc.daNop;
const luc = new Date("2026-10-09T15:00:00Z");
const CA = [
	{ ten: "qua", kq: { ketQua: "da-ghi", lyDo: "" }, viec: { id: "t1", finishedAt: luc, outcome: XONG }, nem: null },
	{ ten: "tu-choi", kq: { ketQua: "tu-choi", lyDo: "task is not running" }, viec: { id: "t2", finishedAt: luc, outcome: XONG }, nem: ["tu-choi"] },
	{ ten: "chua-dong", kq: { ketQua: "da-ghi", lyDo: "" }, viec: { id: "t3", finishedAt: null, outcome: null }, nem: ["khong dong bang da-nop"] },
	{ ten: "loi", kq: { ketQua: "da-ghi", lyDo: "" }, viec: { id: "t4", finishedAt: luc, outcome: "loi" }, nem: ["khong dong bang da-nop", "(loi)"] },
];
let dung = 0;
for (const ca of CA) {
	let loi = null;
	try { kiemNopXong(ca.kq, ca.viec); } catch (e) { loi = e instanceof Error ? e.message : String(e); }
	if (ca.nem === null) { if (loi === null) dung++; else console.log(`ca ${ca.ten}: nem sai: ${loi}`); continue; }
	if (loi === null) console.log(`ca ${ca.ten}: khong nem`);
	else if (!ca.nem.every((m) => loi.includes(m))) console.log(`ca ${ca.ten}: nem sai: ${loi}`);
	else dung++;
}
if (CA.length !== 4) { console.log(`KHONG DO DUOC: ma tran ${CA.length} ca, mong 4`); process.exit(2); }
console.log(`kiem-nop: ${dung}/${CA.length} ca dung`);
process.exit(dung === CA.length ? 0 : 1);
```

- [ ] **Step 2: Chạy, thấy đỏ:** `bun _acceptance/ban-gieo-gop-y-sau-nop/rang/kiem-nop.mjs` → `KHONG DO DUOC: ban gieo khong xuat kiemNopXong`, mã 2.

- [ ] **Step 3: Sửa bàn gieo.** Nhập `TRO_LY_OKR` từ `../../../apps/agent/agent/lib/okr/config.ts`, bỏ `completeTask` khỏi dòng nhập `tasks.ts`; `nguCanhCon` thêm `export`; thêm:

```js
export function kiemNopXong(kq, viec) {
	if (kq.ketQua !== "da-ghi") throw new Error(`nop: ${kq.ketQua} — ${kq.lyDo}`);
	if (!viec || viec.finishedAt === null || viec.outcome !== TRO_LY_OKR.ketThuc.daNop)
		throw new Error(`viec ${viec?.id ?? "?"} khong dong bang ${TRO_LY_OKR.ketThuc.daNop} sau khi nop (${viec?.outcome ?? "chua dong"})`);
}
```

Trong `nop()` thay `const kq = await nopDeXuatVao(...); if (!(await completeTask(...))) throw …` bằng:

```js
	const kq = await nopDeXuatVao({ dong }, nguCanhCon(phienGoc));
	const viec = await db.agentTask.findUnique({ where: { id: xep.taskId }, select: { id: true, finishedAt: true, outcome: true } });
	kiemNopXong(kq, viec);
```

Cuối `gieoGopY`, trước `return`: `console.log(\`gieo-gop-y: xong A ${a} (${gieoA.ids.length} dong cho), B ${b} (rong)\`);`

- [ ] **Step 4: Chạy lại:** `bun …/kiem-nop.mjs` → `kiem-nop: 4/4 ca dung`, mã 0.

- [ ] **Step 5: Commit** `feat(acceptance): bàn gieo góp ý kiểm nộp xong theo kết cục việc, không đòi completeTask`.

### Task 2: Răng E1 `gieo-thu.mjs` — đường gieo thật và ca từ chối thật (AC-1, AC-2)

`independent: false` (cần Task 1) · Evals: E1

**Files:** Create `_acceptance/ban-gieo-gop-y-sau-nop/rang/gieo-thu.mjs`; khoá `k3b_gieo_thu` đã có.

- [ ] **Step 1: Viết răng.** Đầu tệp: suy GOC từ vị trí script; đọc `BAN_GIEO` như Task 1 (không có tệp → `KHONG DO DUOC`, mã 2); `laKhoDo()` sai → `KHONG DO DUOC … chay qua config:executors.script.k3b_gieo_thu`, mã 2. Nạp `napBoMau()` (mã ≠ 0 → mã 2), `phienCookie(thuMau(SAN.nguoi.quanTri))`, `phienCookie(thuMau(SAN.nguoi.truong))`; chặn `console.log` để đếm dòng `gieo-gop-y: xong`; `const g = await gieoGopY({ api: process.env.API_URL, quanTri, truong })` bọc try/catch (ném → in nguyên `e.message`, mã 1). Đọc `db.okrDeXuat.findMany({ where: { taskId: g.taskA } })` (3 dòng, đều `cho`), `{ taskId: g.taskB }` (0), `db.agentTask.findUnique` của taskA/taskB (`finishedAt` khác null, `outcome === TRO_LY_OKR.ketThuc.daNop`), đếm dấu hiệu === 1. Ca từ chối thật: `const kq = await nopDeXuatVao({ dong: [] }, nguCanhCon(\`${SAN.tienToPhien}${g.taskA}\`))`; đòi `kq.ketQua === "tu-choi"`; đọc hàng `agentTask` của taskA; `kiemNopXong(kq, hang)` phải ném và thông điệp chứa `tu-choi`. Mỗi lệch in một dòng tên vế, mã 1. Xanh in `gieo-thu: A 3 dong cho, B rong, 2 viec dong bang da-nop; tu-choi that bi chan`. `finally` gọi `dongKho()`.
- [ ] **Step 2: Chạy:** `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/ban-gieo-gop-y-sau-nop/rang/gieo-thu.mjs"` → dòng xanh, mã 0. Thử `BAN_GIEO=khong-co.mjs` → mã 2.
- [ ] **Step 3: Commit** `test(acceptance): răng E1 K3b — gieo thật trên phiên đo, ca từ chối thật`.

### Task 3: Răng E3 `ba-ban-do.mjs` — ba bàn đo qua bước gieo (AC-3)

`independent: false` (cần Task 1) · Evals: E3

**Files:** Create `_acceptance/ban-gieo-gop-y-sau-nop/rang/ba-ban-do.mjs`.

- [ ] **Step 1: Viết răng.** `KHOA = ["gy_man_that","r1a_man_chip","r1d_man_okr"]` (ba lệnh gọi `gieoGopY`; sửa lúc S3 — `r1a_man_khung`/`r1a_man_thanh` không gieo), lệnh đọc từ `Bun.YAML.parse(config.yaml).executors.script[k]` (vắng → `KHONG DO DUOC`, mã 2). `phanLoai(text)` → `{ qua: /^gieo-gop-y: xong/m.test(text), ket: dòng cuối khớp /^(KET LUAN|KHONG DO DUOC)/m hoặc null }`. `--phan-loai <tệp>` chỉ in `qua buoc gieo` hay `khong qua buoc gieo` (tệp rỗng → `khong qua buoc gieo`, Review Focus 2) và thoát 0/1. Chế độ thường: chạy từng lệnh bằng `spawnSync("bash", ["-c", lenh], { cwd: GOC, maxBuffer: 256 << 20 })`, ghi `.acceptance-runs/ban-gieo-gop-y-sau-nop/ban-do-<k>.txt`; in `<k>: ma <status> · <ket>`; `ket === null` → thêm `thieu ket luan: <k>`; `!qua` → `khong qua buoc gieo: <k>`. Ghi bốn dòng vào `_acceptance/ban-gieo-gop-y-sau-nop/evidence/ba-ban-do.txt`. Mã 1 khi có `khong qua` hay `thieu`, không thì in `ba-ban-do: 4/4 lenh qua buoc gieo`, mã 0.
- [ ] **Step 2: Chạy bộ phân loại trên đầu ra cũ đỏ:** lưu một đầu ra cũ (trước Task 1) của `gy_man_that` rồi `bun …/ba-ban-do.mjs --phan-loai <tệp>` → `khong qua buoc gieo`.
- [ ] **Step 3: Chạy trọn** (nền, ~30–40 phút): `bun _acceptance/ban-gieo-gop-y-sau-nop/rang/ba-ban-do.mjs` → bốn dòng kết luận, `4/4 lenh qua buoc gieo`.
- [ ] **Step 4: Commit** `test(acceptance): răng E3 K3b — ba lệnh bàn đo qua bước gieo, kết luận từng bàn`.

### Task 4: Răng E4 ranh giới và E5 đột biến trên bản sao (AC-4, AC-5)

`independent: false` (cần Task 1–3) · Evals: E4, E5

**Files:** Create `rang/ranh-gioi.mjs` (chép khuôn `_acceptance/kara-gop-y-luot-2/rang/ranh-gioi.mjs` từ nhánh `feat/kara-gop-y-luot-2`, đổi `SLUG`, `MA_HANG = "K3b"`, `RANH_GIOI_CHEP` = ba mục của hàng, `CHAM_TEP` = bốn tệp P1-49, `CHI_THEM = ["_acceptance/config.yaml"]`, bỏ luật `state.tsx`), `rang/dot-bien.mjs`.

- [ ] **Step 1: `dot-bien.mjs`.** Dọn mọi `.san-gop-y-vet-*.mjs` sót trong `_acceptance/gop-y-dung-cho/rang/` trước (Review Focus 4). Băm tệp thật. Chiều xanh: `k3b_kiem_nop` và `k3b_gieo_thu` mã 0, không thì `KHONG DO DUOC`, mã 2. Ba vết, mỗi vết ghi bản sao `.san-gop-y-vet-<pid>.mjs` bằng `thay(a,b)` (chuỗi neo đúng một lần, không thì `vet khong cam duoc`), chạy lệnh với `env.BAN_GIEO = <bản sao tương đối>`, xoá bản sao trong `finally`:
  - (a) neo `kiemNopXong(kq, viec);` → `if (!(await completeTask(xep.taskId, "da-nop"))) throw new Error(\`viec ${xep.taskId} da dong truoc khi nop xong\`);` và neo dòng nhập `noteSession,` → `completeTask,\n\tnoteSession,` → chạy `k3b_gieo_thu`, đòi đỏ và có `da dong truoc khi nop xong`.
  - (b) neo `|| viec.outcome !== TRO_LY_OKR.ketThuc.daNop` → `` → chạy `k3b_kiem_nop`, đòi đỏ và có `ca loi: khong nem`.
  - (c) neo `export function kiemNopXong(kq, viec) {` → `export function kiemNopXong(kq, viec) {\n\tthrow new Error("vet-c");` → chạy `k3b_gieo_thu`, đòi đỏ và có `vet-c`; ghi đầu ra ra tệp tạm, chạy `ba-ban-do.mjs --phan-loai <tệp>` đòi `khong qua buoc gieo`.
  Băm lại tệp thật, lệch → `TEP THAT BI DOI`, mã 3. In `dot-bien: 3/3 vet bi bat, tep that nguyen`.
- [ ] **Step 2: Chạy:** `node …/ranh-gioi.mjs` → `0 ngoai`; `--them apps/app/lib/x.ts` → mã 1. `bun …/dot-bien.mjs` → `3/3`, mã 0; `git status` không đổi tệp thật.
- [ ] **Step 3: Commit** `test(acceptance): răng E4, E5 K3b — ranh giới và ba vết trên bản sao`.

### Task 5: Cổng cuối trước S4

`independent: false` · Evals: tất cả

- [ ] Năm khoá `k3b_*` lần lượt mã 0 (E3 chạy nền).
- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop` mã 0 (không tệp nào ngoài `_acceptance/` đổi nên `test`, `build` không cần chạy lại riêng).
- [ ] `git status --short` chỉ còn tệp trong `evidence/` của hồ sơ.
