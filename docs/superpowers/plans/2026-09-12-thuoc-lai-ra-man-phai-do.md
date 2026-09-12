# Thước lái-ra-màn phải đỏ được — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Làm cho thước «lái từng component ra màn» đỏ được khi một component ngừng vẽ được, và ngừng làm bẩn bằng chứng đã ký của hồ sơ khác.

**Architecture:** Bốn lỗ độc lập, sửa ở đúng hai file đã có (`packages/ui/test/lai-ra-man.spec.tsx` bên VIẾT, `_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs` bên ĐỌC) cộng một bộ ca mới `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs` chạy cặp hai chiều trên bản sao `git archive`. Danh sách component về một nguồn (`docMacDinh`), bản vẽ của lượt chạy về chỗ tạm ngoài git.

**Tech Stack:** Node ≥ 20 ESM, bun test (preload happy-dom), TypeScript compiler API qua `moi-mac-dinh.mjs`, không thư viện mới.

**Spec:** `docs/superpowers/specs/2026-09-12-thuoc-lai-ra-man-phai-do-design.md` · hợp đồng `_acceptance/thuoc-lai-ra-man-phai-do/contract.md` · evals `_acceptance/thuoc-lai-ra-man-phai-do/evals.yaml`

## Global Constraints

- **Không sửa** `contract.md`, `evidence-report.md`, `run-log.jsonl`, `decisions.jsonl` hay `evals.yaml` của `chan-lai-component-ra-man` (ký 06/09). Được sửa: `rang/*.mjs` của hồ sơ đó.
- **Không viết chú thích trong code** (luật kho, AGENTS.md).
- Chỗ tạm cố định: `<gốc kho>/node_modules/.cache/lai-ra-man/` — nằm sẵn ngoài git, không thêm dòng `.gitignore` nào.
- Cờ ghi bằng chứng có chủ đích: biến môi trường `TLR_GHI_BANG_CHUNG=1`. Vắng cờ ⇒ chỉ ghi chỗ tạm.
- Mọi phép đo mới đi theo `MEASURE-BIRTH-CLAUSE`: cặp hai chiều trên CÙNG fixture, chiều đỏ ghim thông điệp có nhãn ca (`MOT-NGUON`, `SAN-KHUON`, `HONG-MOT-CHIEU`, `BO-VE-CHET`, `DEM-DU`, `KHONG-BAN-CAY`, `QUA-CONG`).
- Bản sao để tiêm dựng bằng `git archive HEAD` (trọn cây), không chép danh sách file tay.
- Đường dẫn trong mọi script suy từ `import.meta.dirname`, không hardcode gốc kho.
- Lệnh verify của kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

---

### Task 1: Bản vẽ của lượt chạy ra chỗ tạm (AC-5)

**Files:**
- Modify: `packages/ui/test/lai-ra-man.spec.tsx` — hàm `ghi()` (quanh dòng 232)
- Modify: `_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs` — hàm `ghi()` (dòng 18-22), `phanNhom()` đọc `ve-that.json` (dòng 78)
- Test: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs` ca `khong-ban-cay` (Task 5)

**Interfaces:**
- Produces: `duongRa(ten: string): string` ở CẢ HAI file — trả `<goc>/node_modules/.cache/lai-ra-man/<ten>` khi `process.env.TLR_GHI_BANG_CHUNG !== "1"`, ngược lại `<goc>/_acceptance/chan-lai-component-ra-man/evidence/<ten>`. Bên đọc dùng cùng hàm để tìm bản vẽ.

- [ ] **Step 1: Sửa `ghi()` của bên VIẾT**

```tsx
const CHO_TAM = join(GOC_KHO, "node_modules", ".cache", "lai-ra-man");

function duongRa(ten: string): string {
	const goc =
		process.env.TLR_GHI_BANG_CHUNG === "1"
			? join(HO_SO, "evidence")
			: CHO_TAM;
	return join(goc, ten);
}

function ghi(ten: string, gt: Record<string, BanVe[]> | MoNguyenBan) {
	const duong = duongRa(ten);
	mkdirSync(dirname(duong), { recursive: true });
	writeFileSync(duong, `${JSON.stringify(gt, null, "\t")}\n`);
}
```

- [ ] **Step 2: Sửa `ghi()` và chỗ đọc của bên ĐỌC**

```js
const CHO_TAM = join(GOC, "node_modules", ".cache", "lai-ra-man");

function duongRa(ten) {
	return join(process.env.TLR_GHI_BANG_CHUNG === "1" ? EV : CHO_TAM, ten);
}

function ghi(ten, gt) {
	const duong = duongRa(ten);
	mkdirSync(dirname(duong), { recursive: true });
	writeFileSync(duong, `${JSON.stringify(gt, null, "\t")}\n`);
}
```

  Trong `phanNhom()`, đổi `const duong = join(EV, "ve-that.json");` thành `const duong = duongRa("ve-that.json");`.

- [ ] **Step 3: Chạy và xác nhận cây sạch**

Run: `bun run test -- --filter=@crm/ui && git status --porcelain -- _acceptance/chan-lai-component-ra-man/evidence/`
Expected: lệnh test PASS, `git status` in RỖNG.

- [ ] **Step 4: Xác nhận cờ có chủ đích vẫn ghi được**

Run: `TLR_GHI_BANG_CHUNG=1 node _acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs phan-nhom && git status --porcelain -- _acceptance/chan-lai-component-ra-man/evidence/`
Expected: `git status` in ÍT NHẤT một dòng. Rồi `git checkout -- _acceptance/chan-lai-component-ra-man/evidence/` để trả cây về sạch.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/test/lai-ra-man.spec.tsx _acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs
git commit -m "fix(thuoc): ban ve cua luot chay ra cho tam, bang chung chi ghi khi co chu dich"
```

---

### Task 2: Danh sách về một nguồn (AC-1)

**Files:**
- Modify: `packages/ui/test/lai-ra-man.spec.tsx` — test `"lai tung component ra man…"` (quanh dòng 240-244)
- Test: ca `mot-nguon` của Task 5

**Interfaces:**
- Consumes: `docMacDinh(goc: string): { file: string; dong: number; tham_so: string; gia_tri: string }[]` từ `_acceptance/chan-lai-component-ra-man/rang/moi-mac-dinh.mjs` — cùng hàm bên ĐỌC dùng.
- Produces: bản vẽ ở chỗ tạm có tập khoá == tập `file` của `docMacDinh` tại HEAD.

- [ ] **Step 1: Kiểm `typescript` resolve được từ vị trí `moi-mac-dinh.mjs`**

Run: `node -e "import('./_acceptance/chan-lai-component-ra-man/rang/moi-mac-dinh.mjs').then(m=>console.log(m.docMacDinh(process.cwd()).length))"`
Expected: in ra một số > 0. Nếu nổ vì không tìm thấy `typescript`, dừng và báo — không tự thêm dependency.

- [ ] **Step 2: Đổi nguồn danh sách trong spec**

```tsx
import { docMacDinh } from "../../../_acceptance/chan-lai-component-ra-man/rang/moi-mac-dinh.mjs";
```

  rồi trong test, thay hai dòng đọc `mac-dinh.json` bằng:

```tsx
	const macDinh = docMacDinh(GOC_KHO) as { file: string }[];
	const file = [...new Set(macDinh.map((m) => m.file))].sort();
	expect(file.length).toBeGreaterThan(0);
```

- [ ] **Step 3: Chạy và xác nhận sáu file chết biến mất**

Run: `bun run test -- --filter=@crm/ui && node -e "const v=require('./node_modules/.cache/lai-ra-man/ve-that.json');const fs=require('fs');const chet=Object.keys(v).filter(f=>!fs.existsSync(f));console.log('khoa:',Object.keys(v).length,'· tro file chet:',chet.length)"`
Expected: `tro file chet: 0`.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/test/lai-ra-man.spec.tsx
git commit -m "fix(thuoc): ben ve rut danh sach bang docMacDinh, khong doc bang chung da commit"
```

---

### Task 3: Hỏng một chiều là hỏng, và bộ vẽ chết là đỏ (AC-2, AC-3)

**Files:**
- Modify: `_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs` — `banVeRong()` (dòng 12-16), `chayBanVe()` (dòng 63-75), `phanNhom()` (dòng 92-95)
- Test: ca `hong-mot-chieu` và `bo-ve-chet` của Task 5

**Interfaces:**
- Produces: `veTron(b): boolean` — `b.loi_dong === null && b.loi_mo === null`. Một component vào nhóm «không vẽ được» khi không có xuất nào `veTron`.

- [ ] **Step 1: Thay phép phân loại trong `phanNhom()`**

```js
		const ban = banVe[m.file] ?? [];
		const tron = ban.filter((b) => b.loi_dong === null && b.loi_mo === null);
		if (tron.length === 0) {
			khongVeDuoc.push({
				...m,
				ly_do: ban[0]?.loi_dong ?? ban[0]?.loi_mo ?? "khong co xuat nao ve duoc",
			});
			continue;
		}
```

- [ ] **Step 2: Thay `banVeRong()` bằng cùng phép**

```js
function banVeRong(banVe) {
	return Object.values(banVe)
		.flat()
		.every((b) => b.loi_dong !== null || b.loi_mo !== null);
}
```

- [ ] **Step 3: `chayBanVe()` trả mã thay vì nuốt**

```js
function chayBanVe() {
	try {
		execFileSync("bun", ["test", "--preload", "./test/setup-dom.ts", "test/lai-ra-man.spec.tsx"], {
			cwd: join(GOC, "packages/ui"),
			stdio: "pipe",
		});
		return 0;
	} catch (e) {
		const ra = `${e.stdout ?? ""}${e.stderr ?? ""}`;
		console.error(`BO-VE-CHET: buoc ve thoat ${e.status ?? "khac 0"}, khong cham tiep\n${ra.slice(-1200)}`);
		return e.status ?? 1;
	}
}
```

- [ ] **Step 4: `phanNhom()` dừng khi bộ vẽ chết**

  Ngay sau `ghi("mac-dinh.json", docMacDinh(GOC));`:

```js
	const maVe = chayBanVe();
	if (maVe !== 0) return maVe;
```

  và xoá lời gọi `chayBanVe();` cũ.

- [ ] **Step 5: Chạy đối chứng dương**

Run: `node _acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs phan-nhom; echo "ma=$?"`
Expected: `ma=0`, in ba số nhóm. Nếu `ma=1` vì tổng lệch neo, dừng và báo số thật — neo là con số của hồ sơ cũ, việc chỉnh neo là quyết định phải ghi sổ, không sửa lặng.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs
git commit -m "fix(thuoc): hong mot chieu la hong, va bo ve chet thi dung"
```

---

### Task 4: Đếm đủ thay vì «có ít nhất một» (AC-4)

**Files:**
- Modify: `packages/ui/test/lai-ra-man.spec.tsx` — khẳng định cuối test đầu (quanh dòng 250-255)
- Create: `_acceptance/thuoc-lai-ra-man-phai-do/khai-khong-ve-duoc.json`
- Test: ca `dem-du` của Task 5

**Interfaces:**
- Produces: `khai-khong-ve-duoc.json` = `{ "<đường dẫn file>": "<lý do một dòng>" }` — bản khai các component được phép không vẽ được. Mục ngoài bản khai làm test ĐỎ.

- [ ] **Step 1: Đo trước xem hiện có bao nhiêu component không vẽ được**

Run: `node -e "const v=require('./node_modules/.cache/lai-ra-man/ve-that.json');const x=Object.entries(v).filter(([,b])=>!b.some(y=>y.loi_dong===null&&y.loi_mo===null));console.log(x.length);x.forEach(([f,b])=>console.log(' ',f,'·',(b[0]?.loi_dong||b[0]?.loi_mo||'').slice(0,60)))"`
Expected: một danh sách. Ghi lại — nó là nội dung khởi đầu của bản khai.

- [ ] **Step 2: Viết bản khai từ kết quả Step 1**

  Mỗi dòng một file kèm lý do thật đọc được từ thông điệp lỗi. Danh sách rỗng thì file là `{}`.

- [ ] **Step 3: Thay khẳng định cuối trong spec**

```tsx
	const khai = JSON.parse(
		readFileSync(
			join(GOC_KHO, "_acceptance", "thuoc-lai-ra-man-phai-do", "khai-khong-ve-duoc.json"),
			"utf8",
		),
	) as Record<string, string>;
	const hong = Object.entries(banVe)
		.filter(([, b]) => !b.some((y) => y.loi_dong === null && y.loi_mo === null))
		.map(([f]) => f);
	const ngoaiKhai = hong.filter((f) => !(f in khai));
	expect(
		`DEM-DU: ve duoc ${file.length - hong.length}/${file.length}, ngoai khai: ${ngoaiKhai.join(", ") || "khong"}`,
	).toBe(`DEM-DU: ve duoc ${file.length - hong.length}/${file.length}, ngoai khai: khong`);
```

- [ ] **Step 4: Chạy đối chứng dương**

Run: `bun run test -- --filter=@crm/ui`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/test/lai-ra-man.spec.tsx _acceptance/thuoc-lai-ra-man-phai-do/khai-khong-ve-duoc.json
git commit -m "fix(thuoc): dem du component ve duoc, sot phai co ban khai"
```

---

### Task 5: Bộ ca hai chiều (AC-6, AC-7, và chiều đỏ cho AC-1..AC-5)

**Files:**
- Create: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
- Test: chính nó — mỗi lệnh con tự chạy cặp dương/đỏ trên bản sao

**Interfaces:**
- Consumes: `docMacDinh` từ `moi-mac-dinh.mjs`; bản vẽ ở `node_modules/.cache/lai-ra-man/ve-that.json`.
- Produces: bảy lệnh con `mot-nguon` · `hong-mot-chieu` · `bo-ve-chet` · `dem-du` · `khong-ban-cay` · `qua-lenh-cong` · `cap-hai-chieu`; mỗi ca in ba dòng máy đọc được `CHIEU-DUONG ma=<n>` · `CHIEU-DO ma=<n>` · `CHIEU-DO thong-diep=<nguyên văn>`; exit 0 xanh · 1 đỏ · 2 không đo được.

- [ ] **Step 1: Khung bản sao + ba dòng máy đọc**

```js
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const GOC = join(import.meta.dirname, "..", "..", "..");

function banSao() {
	const d = mkdtempSync(join(tmpdir(), "tlr-"));
	execFileSync("bash", ["-c", `git -C "${GOC}" archive HEAD | tar -x -C "${d}"`]);
	return d;
}

function chay(cwd, lenh) {
	const r = spawnSync("bash", ["-c", lenh], { cwd, encoding: "utf8" });
	return { ma: r.status ?? 1, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function ketCa(ten, duong, do_) {
	console.log(`CHIEU-DUONG ma=${duong.ma}`);
	console.log(`CHIEU-DO ma=${do_.ma}`);
	console.log(`CHIEU-DO thong-diep=${(do_.ra.match(new RegExp(`${ten}[^\\n]*`)) || [""])[0]}`);
	if (duong.ma !== 0) return 1;
	if (do_.ma === 0) return 1;
	if (!do_.ra.includes(ten)) return 1;
	return 0;
}
```

- [ ] **Step 2: Ca `mot-nguon` — hai chiều đỏ**

  Dương: trong bản sao chạy suite ui, so tập khoá bản vẽ ở chỗ tạm với `docMacDinh(banSao)` — phải trùng.
  Đỏ 1: xoá một file component thật trong bản sao, chạy lại — tập khoá phải ngắn đi và không trỏ file chết; còn trỏ ⇒ in `MOT-NGUON: ben ve con tro <đường dẫn> ma cay khong con`, mã 1.
  Đỏ 2: `git -C <bản sao> checkout HEAD~0 -- packages/ui/test/lai-ra-man.spec.tsx` không đủ — thay bằng ghi đè hai dòng nguồn danh sách trong bản sao về bản cũ (`readFileSync(evidence/mac-dinh.json)`), xoá một component, chạy lại ⇒ phải bắt được `MOT-NGUON`.

- [ ] **Step 3: Ca `hong-mot-chieu` — ma trận 5 ô + sàn khuôn**

  Bốn ô đầu tiêm tay vào bản vẽ của bản sao: `(co,null)` `(null,co)` `(co,co)` `(null,null)`; gọi `phan-nhom` và đọc `phan-nhom.json` — ba ô đầu phải nằm trong `khong_ve_duoc`, ô cuối không.
  Ô thứ năm ROUND-TRIP: phá một component thật trong bản sao (đổi export thành `throw`), chạy bên VẼ thật, đọc bản vẽ thật — mục đó phải vào `khong_ve_duoc`.
  Sàn khuôn: so `Object.keys` của một mục trong bản vẽ THẬT với tập tên trường bên đọc dùng (`loi_dong`, `loi_mo`, `dong`, `mo`, `xuat`); lệch ⇒ `SAN-KHUON: ban ve co <ten>, ben cham doc <ten>`, mã 1.

- [ ] **Step 4: Ca `bo-ve-chet`**

  Dương: bản sao nguyên vẹn, `phan-nhom` mã 0.
  Đỏ: đặt sẵn một bản vẽ CŨ hợp lệ ở chỗ tạm của bản sao, rồi tiêm lỗi cú pháp vào `packages/ui/test/lai-ra-man.spec.tsx` của bản sao ⇒ `phan-nhom` phải mã khác 0 và in `BO-VE-CHET`.

- [ ] **Step 5: Ca `dem-du`**

  Dương: bản sao nguyên vẹn, suite ui PASS.
  Đỏ: tiêm một mục hỏng vào bản vẽ chỗ tạm của bản sao cho một file KHÔNG có trong bản khai, chạy lại khẳng định ⇒ phải đỏ với `DEM-DU: ve duoc <N-1>/<N>, ngoai khai: <ten>`.

- [ ] **Step 6: Ca `khong-ban-cay` — ba mảnh**

  (a) chạy suite ui trong bản sao, ghim mã 0 VÀ `ve-that.json` ở chỗ tạm có > 0 khoá; không thoả ⇒ mã 2 `KHONG DO DUOC: luot chay khong song`.
  (b) tiêm lại đường ghi cũ (trỏ thẳng `evidence/`) vào bản sao, chạy lại ⇒ `git status --porcelain` của bản sao phải có dòng dưới `evidence/`; in `KHONG-BAN-CAY: <file>`, đây là chiều đỏ.
  (c) chỉ khi (a) xanh mới đọc `git status` của bản sao nguyên vẹn — phải rỗng.

- [ ] **Step 7: Ca `qua-lenh-cong`**

  Dương: bản sao nguyên vẹn, chạy `bun run test -- --filter=@crm/ui` ⇒ mã 0.
  Đỏ: xoá một component thật trong bản sao (file không có trong bản khai) ⇒ cùng lệnh đó phải mã khác 0; mã 0 ⇒ in `QUA-CONG: thuoc do duoc khi goi thang nhung lenh cong khong goi toi no`, mã 1.

- [ ] **Step 8: Ca `cap-hai-chieu`**

  Chạy sáu ca trên, đọc ba dòng máy của từng ca; assert `CHIEU-DUONG ma=0`, `CHIEU-DO ma` khác 0, và `thong-diep` chứa đúng nhãn ca. Chiều đỏ của chính nó: chạy một ca với biến `TLR_VO_HIEU_TIEM=<tên ca>` khiến bước tiêm của ca đó không đổi gì ⇒ ca đó báo `CHIEU-DO ma=0` ⇒ `cap-hai-chieu` mã 1 và gọi tên ca.

- [ ] **Step 9: Chạy cả bảy ca**

Run: `for c in mot-nguon hong-mot-chieu bo-ve-chet dem-du khong-ban-cay qua-lenh-cong cap-hai-chieu; do node _acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs $c > /dev/null 2>&1; echo "$c=$?"; done`
Expected: cả bảy `=0`.

- [ ] **Step 10: Lệnh verify của kho**

Run: `bun run check-types && bun run lint && bun run lint:slop && bun run test && bun run build`
Expected: cả năm mã 0.

- [ ] **Step 11: Commit**

```bash
git add _acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs
git commit -m "feat(thuoc): bo bay ca hai chieu cho thuoc lai-ra-man"
```
