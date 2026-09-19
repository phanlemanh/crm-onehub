# Thước của hồ sơ khai đúng tiếng — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bộ đo của `ho-so-khai-dung-tieng` thôi nói dối được, và thước cấu trúc của nó chạy ở lệnh cổng chứ không chỉ khi có người gõ tay.

**Architecture:** Mười ba chân đo mới sống ở `_acceptance/thuoc-khai-dung-tieng/rang/`, tất cả dựng trên một module chung `chung.mjs` giữ ba thứ hay bị làm sai: suy gốc kho từ vị trí script, ghim hằng trước khi đếm, và thoát có tên. Cơ chế khai thước ở `.githooks/gate-shape.json` đổi từ một khối thành danh sách khối để đỡ hai hồ sơ. Bảy chỗ hỏng trong bộ đo cũ được vá tại chỗ.

**Tech Stack:** bun · node:fs / node:child_process · `bun test` · git worktree · `repin-lane.mjs` của plugin feature-loop.

**Spec:** `docs/superpowers/specs/2026-09-19-thuoc-khai-dung-tieng-design.md`
**Hợp đồng:** `_acceptance/thuoc-khai-dung-tieng/contract.md` (13 tiêu chí) · **Phép đo:** `_acceptance/thuoc-khai-dung-tieng/evals.yaml` (14 ô) · **Phản biện:** `_acceptance/thuoc-khai-dung-tieng/gap-probe.md`

## Global Constraints

- **Không viết chú thích trong code.** Luật `AGENTS.md`, không ngoại lệ.
- **KHÔNG đổi một tệp sản phẩm nào của `ho-so-khai-dung-tieng`.** AC-9 và E10 đo chính điều đó. Danh sách cấm chạm: `packages/ui/src/components/foreign-text.tsx` · `apps/app/components/crm/record-sheet/{record-parts,company-sheet,contact-sheet}.tsx` · `apps/app/components/crm/timeline/{timeline-entry,timeline}.tsx` · `apps/app/app/(app)/[slug]/companies/companies-table.tsx` · `apps/app/app/(app)/[slug]/sales-dashboard.tsx` · `apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx` · `apps/app/components/crm/{stage-stepper,deal-stage}.tsx`.
- **Mọi chân đo mới suy gốc kho TỪ VỊ TRÍ SCRIPT**, không hardcode. `chung.mjs` giữ một chỗ duy nhất làm việc đó.
- **Mọi phép đếm lớp phải ghim hằng TRƯỚC**, chép tay từ cây, không nạp từ vật bị đo. So hai con số cùng suy từ một lượt quét là 0 bằng 0 khi glob neo sai gốc.
- **Mọi chuỗi ghim phải PHÂN BIỆT ĐƯỢC**: vắng ở lượt lành, có ở lượt đỏ. Đây là luật của vòng này và nó áp cho chính mười ba chân đo mới (AC-11).
- **Chỉ khai HAI hồ sơ vào cổng**: `nen-chat-ai-elements` (6 tệp) và `ho-so-khai-dung-tieng` (5 tệp). KHÔNG khai `thuoc-khai-dung-tieng` — mười ba chân của nó cần máy chủ, trình duyệt và bản sao cây; đưa chúng vào lệnh đẩy là bắt mọi người trả giá đó mỗi lần push.
- Bộ kiểm kho, từ gốc: `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build`.

---

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `_acceptance/thuoc-khai-dung-tieng/rang/chung.mjs` | **Tạo.** Gốc kho suy từ vị trí script · ghim hằng và khẳng định trước khi đếm · in bảng · thoát có tên. Mọi chân đo mới nhập từ đây. |
| `…/rang/ghim-phan-biet.mjs` | **Tạo.** E1 — mỗi chuỗi ghim của `pha-thu.mjs` phải vắng ở lượt lành. |
| `…/rang/khai-sinh-dung-ghim.mjs` | **Tạo.** E2 — `pha-thu.mjs` có DÙNG kết quả đó, không tính rồi vứt. |
| `…/rang/cong-chan-duoc.mjs` | **Tạo.** E3 — thêm chỗ thứ mười thật, khẳng định `bun run test` đỏ. |
| `…/rang/hai-ho-so.mjs` | **Tạo.** E4 — bản khai cổng đỡ hai hồ sơ, ba thước cũ vẫn xanh. |
| `…/rang/khong-de-lai-vet.mjs` | **Tạo.** E5 — ép ngoại lệ giữa chừng, đối chiếu bản ghi trước/sau. |
| `…/rang/xoa-co-kiem.mjs` | **Tạo.** E6 — ba đường của phép kiểm trước `rmSync`. |
| `…/rang/ban-khai-khop.mjs` | **Tạo.** E7 — bản khai khớp bản thật. |
| `…/rang/bai-kiem-dung-nha.mjs` | **Tạo.** E8 — không tệp nào trong `packages/` nhập mã `apps/`. |
| `…/rang/ho-so-cu-van-xanh.mjs` | **Tạo.** E10 — hồ sơ cũ vẫn xanh, và diff không chạm sản phẩm. |
| `…/rang/khai-sinh-phu-vong-nay.mjs` | **Tạo.** E12 — bộ khai sinh của chính vòng này. |
| `…/rang/ghim-lai-da-xong.mjs` | **Tạo.** E13 — bằng chứng hồ sơ đã ký còn tươi. |
| `…/rang/bay-benh-cu.mjs` | **Tạo.** E14 — bảy bệnh cũ không quay lại. |
| `.githooks/gate-shape.json` | **Sửa.** `rang` từ một khối thành danh sách khối. |
| `packages/ui/test/rang-chat.spec.ts` | **Sửa.** Lặp qua danh sách khối. |
| `apps/app/test/khai-tieng-metaline.spec.tsx` | **Tạo.** Phần `MetaLine` của bài kiểm, chuyển từ `packages/ui/test`. |
| `packages/ui/test/khai-tieng.spec.tsx` | **Sửa.** Bỏ phần `MetaLine`, giữ `ForeignText`. |
| `_acceptance/ho-so-khai-dung-tieng/rang/{pha-thu,du-lieu-thu,hoi-quy-nam-cho,mot-duong,khai-tieng-ho-so}.mjs` | **Sửa.** Bảy chỗ hỏng. |
| `_acceptance/ho-so-khai-dung-tieng/{contract.md,evals.yaml}` | **Sửa.** Tu chính AC-7 lần hai; E7 bỏ mô tả API đã chết. |

---

### Task 1: Module chung `chung.mjs`

**Files:** Create `_acceptance/thuoc-khai-dung-tieng/rang/chung.mjs`

**Interfaces:**
- Produces: `GOC` (đường tuyệt đối gốc kho, suy từ `import.meta.url`) · `ghim(ten, thuc, mong)` · `bang(tieu_de, hang)` · `thoat(ma, ...dong)` · `chay(lenh, doi_so, tuy)`.
- Mọi chân đo mới nhập từ đây. Đây là chỗ DUY NHẤT tính gốc kho.

- [ ] **Step 1: Viết bài kiểm trượt**

Tạo `_acceptance/thuoc-khai-dung-tieng/rang/chung.spec.mjs`:

```js
import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { GOC, ghim } from "./chung.mjs";

assert.ok(existsSync(join(GOC, "_acceptance", "config.yaml")), "GOC phai tro dung goc kho");

let nem = null;
try {
	ghim("so tep", 3, 4);
} catch (loi) {
	nem = loi.message;
}
assert.ok(nem?.includes("so tep"), "ghim phai nem kem TEN hang, khong chi con so");
assert.ok(nem?.includes("3") && nem?.includes("4"), "ghim phai in ca hai con so");
assert.equal(ghim("so tep", 4, 4), 4, "ghim khop thi tra chinh gia tri");
console.log("chung.mjs: 4 khang dinh dat");
```

- [ ] **Step 2: Chạy để chắc nó trượt**

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/chung.spec.mjs`
Expected: FAIL — `Cannot find module './chung.mjs'`

- [ ] **Step 3: Viết `chung.mjs`**

```js
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

export function thoat(ma, ...dong) {
	for (const d of dong) console.log(d);
	process.exit(ma);
}

export function ghim(ten, thuc, mong) {
	if (thuc !== mong) {
		throw new Error(
			`HANG GHIM LECH: ${ten} — dem duoc ${thuc}, ban khai noi ${mong}.\n` +
				"   Hai con so cung suy tu mot luot quet la 0 bang 0 khi glob neo sai goc,\n" +
				"   nen hang phai chep tay tu cay va so TRUOC khi dem vi pham.",
		);
	}
	return thuc;
}

export function bang(tieu_de, hang) {
	console.log(tieu_de);
	for (const d of hang) console.log(`   ${d}`);
}

export function chay(lenh, doi_so, tuy = {}) {
	const r = spawnSync(lenh, doi_so, {
		cwd: tuy.cwd ?? GOC,
		encoding: "utf8",
		env: { ...process.env, ...(tuy.env ?? {}) },
	});
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
```

- [ ] **Step 4: Chạy lại, phải xanh**

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/chung.spec.mjs`
Expected: `chung.mjs: 4 khang dinh dat`

- [ ] **Step 5: Chứng chiều đỏ**

Bản sao: đổi `GOC` thành `join(dirname(...), "..")` (thiếu một bậc) → bài kiểm ĐỎ, thông điệp chứa `GOC phai tro dung goc kho`. Trả bản gốc.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/thuoc-khai-dung-tieng/rang/chung.mjs _acceptance/thuoc-khai-dung-tieng/rang/chung.spec.mjs
git commit -m "feat(thuoc): module chung — goc suy tu vi tri script, ghim hang co ten"
```

**Phục vụ:** nền cho mọi chân đo. **independent: true**

---

### Task 2: Chuỗi ghim phân biệt được — `pha-thu.mjs` và `ghim-phan-biet.mjs`

**Files:**
- Modify: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
- Create: `_acceptance/thuoc-khai-dung-tieng/rang/ghim-phan-biet.mjs`

**Interfaces:**
- Consumes: `GOC`, `bang`, `chay` (Task 1).
- Produces: `pha-thu.mjs` xuất `DOT_BIEN` (mảng `{chan, ghim, do}`) để chân đo khác đọc được danh sách ghim từ BẢN THẬT thay vì gõ lại.

- [ ] **Step 1: Cho `pha-thu.mjs` xuất bảng đột biến**

Đổi `const DOT_BIEN = [` thành `export const DOT_BIEN = [`, và bọc thân chạy trong `if (import.meta.main) { … }` để nhập được mà không chạy.

- [ ] **Step 2: Viết `ghim-phan-biet.mjs`**

```js
import { bang, chay, GOC } from "./chung.mjs";
import { DOT_BIEN } from "../../ho-so-khai-dung-tieng/rang/pha-thu.mjs";

const hang = [];
let hong = 0;

for (const d of DOT_BIEN) {
	const r = chay(d.do.lenh, d.do.doi_so, { cwd: d.do.duoi ? `${GOC}/${d.do.duoi}` : GOC });
	const coONLuotLanh = r.ra.includes(d.ghim);
	if (coONLuotLanh) hong += 1;
	hang.push(
		`${coONLuotLanh ? "KHONG PHAN BIET" : "phan biet duoc "} ${d.chan.padEnd(5)} ${JSON.stringify(d.ghim)}`,
	);
}

bang(
	`-- ${DOT_BIEN.length} chuoi ghim, doc TU pha-thu.mjs (khong go lai danh sach thu hai).\n` +
		"   Chuoi ghim phai VANG o luot lanh; co mat o luot lanh nghia la chot khong chot gi.",
	hang,
);
console.log(`ket qua: ${hong} chuoi ghim KHONG phan biet duoc tren ${DOT_BIEN.length}`);
process.exit(hong > 0 ? 1 : 0);
```

- [ ] **Step 3: Chạy — phải ĐỎ, vì bảy chuỗi hiện tại là tên chân**

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/ghim-phan-biet.mjs`
Expected: exit 1, ≥7 dòng `KHONG PHAN BIET`. Đây là dữ kiện đã kiểm 19/09, không phải giả định.

- [ ] **Step 4: Sửa bảy chuỗi ghim thành chuỗi phân biệt được**

Mỗi chân đo in một dòng CHỈ khi đỏ, và chuỗi ghim lấy từ dòng đó. Ví dụ trong `khai-tieng-ho-so.mjs`, hàm `bao()` đổi dòng lệch thành:

```js
console.log(
	`   KHONG DAT [lech-boc:${ten}] ${JSON.stringify(gt.slice(0, 48))} — ${cho.length} cho, lech ${lech.length}`,
);
```

và `pha-thu.mjs` đổi `ghim: "gioi-thieu"` thành `ghim: "lech-boc:gioi-thieu"`. Nhãn `lech-boc:` chỉ in ra khi có chỗ lệch, nên nó vắng ở lượt lành.

Bảy chân đổi theo cùng khuôn: `gioi-thieu` · `tom-tat-lien-he` · `nganh` · `dong-thoi-gian` · `khong-khai-thua` → `lech-boc:<ten>`; `ho-so-trong` → `phan-tu-rong-dem-duoc:`; `tieng-trang` → `tieng-viet-lot:`.

- [ ] **Step 5: Chạy lại — phải XANH**

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/ghim-phan-biet.mjs`
Expected: exit 0, `0 chuoi ghim KHONG phan biet duoc`.

- [ ] **Step 6: Chứng chân đo vẫn bắt được lỗi thật**

Run: `bun _acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
Expected: exit 0, 21/21 — đổi chuỗi ghim không được làm mất khả năng bắt.

- [ ] **Step 7: Commit**

```bash
git add _acceptance/ho-so-khai-dung-tieng/rang _acceptance/thuoc-khai-dung-tieng/rang/ghim-phan-biet.mjs
git commit -m "fix(thuoc): chuoi ghim phai VANG o luot lanh — bay chuoi cu la ten chan"
```

**Phục vụ:** AC-1 · E1. **independent: false** (cần Task 1)

---

### Task 3: Bộ khai sinh DÙNG kết quả — `khai-sinh-dung-ghim.mjs`

**Files:**
- Modify: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
- Create: `_acceptance/thuoc-khai-dung-tieng/rang/khai-sinh-dung-ghim.mjs`

- [ ] **Step 1: Thêm điều kiện thứ ba vào `pha-thu.mjs`**

Trước vòng đột biến, chạy chân đo trên vật lành và ghi `vangOLuotLanh` cho từng đột biến. Điều kiện đạt đổi từ hai thành ba:

```js
const dat = ket.ma !== 0 && ket.ghim && d.vangOLuotLanh === true;
```

và khi `d.vangOLuotLanh !== true`, in thêm dòng:

```js
console.log(
	`             -> [dem-roi-vut] chuoi ghim ${JSON.stringify(d.ghim)} CO mat o luot lanh, nen "co ghim" khong chung duoc gi`,
);
```

- [ ] **Step 2: Viết `khai-sinh-dung-ghim.mjs`**

Chạy `pha-thu.mjs` trên một bản sao đã cố ý đặt một chuỗi ghim thành tên chân, rồi khẳng định `pha-thu` báo đột biến đó **KHÔNG ĐẠT** và in nhãn `[dem-roi-vut]`.

```js
import { chay, GOC, thoat } from "./chung.mjs";
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SAO = join(GOC, "..", `.thu-khai-sinh-${process.pid}`);
cpSync(join(GOC, "_acceptance"), join(SAO, "_acceptance"), { recursive: true });

const tep = join(SAO, "_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs");
const s = readFileSync(tep, "utf8");
const pha = s.replace(/ghim: "lech-boc:gioi-thieu"/, 'ghim: "gioi-thieu"');
if (pha === s) {
	rmSync(SAO, { recursive: true, force: true });
	thoat(2, "KHONG DO DUOC: khong tim thay chuoi ghim de dat lai — pha-thu.mjs da doi hinh dang");
}
writeFileSync(tep, pha);

const r = chay("bun", ["_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs"], { cwd: SAO });
rmSync(SAO, { recursive: true, force: true });

const bao = r.ra.includes("[dem-roi-vut]");
const khongDat = /KHONG DAT\s+E1/.test(r.ra);
console.log(`   pha-thu bao [dem-roi-vut]: ${bao ? "co" : "KHONG"}`);
console.log(`   pha-thu tinh E1 la KHONG DAT: ${khongDat ? "co" : "KHONG"}`);
console.log(`ket qua: ${bao && khongDat ? "dat" : "KHONG DAT"}`);
process.exit(bao && khongDat ? 0 : 1);
```

- [ ] **Step 3: Chạy — phải xanh**

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/khai-sinh-dung-ghim.mjs`
Expected: exit 0.

- [ ] **Step 4: Chứng chiều đỏ**

Bản sao: bỏ điều kiện thứ ba khỏi `pha-thu.mjs` → chân này ĐỎ, thông điệp chứa `[dem-roi-vut]: KHONG`.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs _acceptance/thuoc-khai-dung-tieng/rang/khai-sinh-dung-ghim.mjs
git commit -m "fix(thuoc): bo khai sinh DUNG ket qua ghim, khong dem roi vut"
```

**Phục vụ:** AC-2 · E2. **independent: false** (cần Task 2)

---

### Task 4: Cơ chế cổng đỡ hai hồ sơ

**Files:**
- Modify: `.githooks/gate-shape.json`
- Modify: `packages/ui/test/rang-chat.spec.ts`

**Interfaces:**
- Produces: `checkers[id=test].rang` đổi từ một object thành **mảng** object, mỗi phần tử giữ nguyên hình dạng cũ (`runsIn`, `runner`, `dir`, `checks[]`, `notInGate[]`) cộng khoá mới `ho_so` (tên hồ sơ, để thông điệp lỗi gọi tên được).

- [ ] **Step 1: Đổi `gate-shape.json`**

`rang` thành mảng hai phần tử. Phần tử thứ nhất là khối cũ nguyên vẹn cộng `"ho_so": "nen-chat-ai-elements"`. Phần tử thứ hai:

```json
{
  "ho_so": "ho-so-khai-dung-tieng",
  "note": "Răng của _acceptance/ho-so-khai-dung-tieng. Thêm 2026-09-19. AC-6 hứa cơ chế — chỗ gọi thứ mười không quên được nữa — mà một lời hứa về cơ chế chỉ đúng khi có cái chặn được. Chỉ mot-duong.mjs vào cổng: nó đọc đĩa, không cần mạng, không cần trình duyệt. Bốn tệp còn lại cần máy chủ dev, Chrome, hoặc một bản sao cây, nên chúng đứng ngoài cổng và nói ra đo ở đâu.",
  "runsIn": "@crm/ui#test",
  "runner": "packages/ui/test/rang-chat.spec.ts",
  "dir": "_acceptance/ho-so-khai-dung-tieng/rang",
  "checks": [
    {
      "id": "mot-duong",
      "script": "_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs",
      "vi_sao": "AC-6. Đọc đĩa, không mạng, không trình duyệt, xong dưới một giây. Đếm đúng chín chỗ khai tiếng và đòi cả chín đi qua ForeignText nhập từ @crm/ui. Không có răng này thì chỗ gọi thứ mười đẩy qua được bình thường."
    }
  ],
  "notInGate": [
    { "id": "khai-tieng-ho-so", "script": "_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs", "vi_sao": "Mở tấm hồ sơ thật bằng Chrome, cần máy chủ dev ở APP_URL.", "do_o": "E1–E5, E8, E9 của hồ sơ, chạy trong vòng chấm S4." },
    { "id": "hoi-quy-nam-cho", "script": "_acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs", "vi_sao": "Chạy lại thước của vòng trước, cần máy chủ dev và Chrome.", "do_o": "E12 của hồ sơ." },
    { "id": "pha-thu", "script": "_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs", "vi_sao": "Dựng bản sao git worktree và hai máy chủ dev riêng; mất vài phút.", "do_o": "E10 của hồ sơ." },
    { "id": "du-lieu-thu", "script": "_acceptance/ho-so-khai-dung-tieng/rang/du-lieu-thu.mjs", "vi_sao": "Module dựng vật thử, không phải răng — nó không tự khẳng định gì.", "do_o": "Mọi chân ui-check của hồ sơ nhập nó." }
  ]
}
```

- [ ] **Step 2: Cho `rang-chat.spec.ts` lặp qua danh sách**

`docKhoiRang()` trả `KhoiRang[]`:

```ts
function docKhoiRang(): KhoiRang[] {
	const hinh = JSON.parse(readFileSync(HINH_DANG, "utf8")) as {
		checkers?: { id?: string; rang?: KhoiRang | KhoiRang[] }[];
	};
	const cong = (hinh.checkers ?? []).find((c) => c.id === "test");
	if (!cong?.rang) {
		throw new Error(
			`.githooks/gate-shape.json không khai khối "rang" trong checker 'test'. AC-9 và AC-10 đòi răng phải có khai ở đó; không khai thì không ai biết răng nào đang chặn.`,
		);
	}
	return Array.isArray(cong.rang) ? cong.rang : [cong.rang];
}

const khoi = docKhoiRang();
```

Mỗi `describe` hiện tại bọc thêm một vòng `for (const k of khoi)`, và mọi thông điệp lỗi thêm `k.ho_so` để gọi tên hồ sơ. `KhoiRang` thêm `ho_so: string`.

- [ ] **Step 3: Chạy bộ kiểm của `@crm/ui`**

Run: `cd packages/ui && bun test test/rang-chat.spec.ts`
Expected: PASS, và số test tăng vì có hai khối.

- [ ] **Step 4: Chứng ba thước cũ vẫn chạy**

Run: `cd packages/ui && bun test test/rang-chat.spec.ts 2>&1 | grep -cE "mo-coi|chu-cung|mau-ban-kinh"`
Expected: ≥3 — ba thước của hồ sơ cũ vẫn được gọi tên.

- [ ] **Step 5: Commit**

```bash
git add .githooks/gate-shape.json packages/ui/test/rang-chat.spec.ts
git commit -m "feat(cong): ban khai rang do HAI ho so — danh sach khoi thay vi mot khoi"
```

**Phục vụ:** AC-3, AC-4 · E3, E4. **independent: false** (cần Task 1)

---

### Task 5: Hai chân đo cho cổng — `cong-chan-duoc.mjs` và `hai-ho-so.mjs`

**Files:** Create hai tệp trong `_acceptance/thuoc-khai-dung-tieng/rang/`

- [ ] **Step 1: `cong-chan-duoc.mjs` — đo HIỆU LỰC, không đo bản khai**

Trong một bản sao `git worktree` (mượn khuôn `dungCaySao` của `pha-thu.mjs`), thêm một chỗ khai tiếng thứ mười vào `apps/app`, chạy `bun run test`, khẳng định ĐỎ và gọi tên tệp; rồi trả bản sao về, chạy lại, khẳng định XANH. So `git status --porcelain` của cây đang xét trước và sau — phải giống hệt.

Chuỗi ghim: `cong-khong-chan-duoc` (chỉ in khi `bun run test` xanh dù đã thêm vi phạm).

- [ ] **Step 2: `hai-ho-so.mjs` — ba khẳng định, hằng ghim trước**

```js
import { bang, chay, ghim, GOC } from "./chung.mjs";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const HANG = { "nen-chat-ai-elements": 6, "ho-so-khai-dung-tieng": 5 };

const hinh = JSON.parse(readFileSync(join(GOC, ".githooks/gate-shape.json"), "utf8"));
const rang = hinh.checkers.find((c) => c.id === "test").rang;
const khoi = Array.isArray(rang) ? rang : [rang];

const hang = [];
for (const k of khoi) {
	const tep = readdirSync(join(GOC, k.dir)).filter((t) => t.endsWith(".mjs")).sort();
	ghim(`so .mjs cua ${k.ho_so}`, tep.length, HANG[k.ho_so]);
	const daKhai = new Set([...k.checks, ...k.notInGate].map((x) => `${x.id}.mjs`));
	for (const t of tep) {
		if (!daKhai.has(t)) {
			hang.push(`THIEU DINH DOAT [chua-dinh-doat:${k.ho_so}/${t}]`);
		} else {
			hang.push(`co dinh doat  ${k.ho_so}/${t}`);
		}
	}
}
```

Cộng vế (a): chạy ba thước của `nen-chat-ai-elements` và khẳng định cả ba exit 0, gọi tên từng cái.

Chuỗi ghim: `chua-dinh-doat:` (chỉ in khi thiếu).

- [ ] **Step 3: Chạy cả hai**

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/hai-ho-so.mjs && bun _acceptance/thuoc-khai-dung-tieng/rang/cong-chan-duoc.mjs`
Expected: cả hai exit 0.

- [ ] **Step 4: Chứng chiều đỏ, HAI vị trí cho `hai-ho-so`**

(i) bản sao bỏ khai một `.mjs` của hồ sơ thứ nhất → ĐỎ, gọi tên tệp đó;
(ii) bản sao thêm một `.mjs` mới vào `rang/` của hồ sơ thứ hai → ĐỎ vì hằng lệch, gọi tên hằng.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/thuoc-khai-dung-tieng/rang/cong-chan-duoc.mjs _acceptance/thuoc-khai-dung-tieng/rang/hai-ho-so.mjs
git commit -m "test(thuoc): cong chan duoc that, va ban khai do ca hai ho so"
```

**Phục vụ:** AC-3, AC-4 · E3, E4. **independent: false** (cần Task 4)

---

### Task 6: Thước không làm hỏng dữ liệu thật

**Files:**
- Modify: `_acceptance/ho-so-khai-dung-tieng/rang/{du-lieu-thu,hoi-quy-nam-cho}.mjs`
- Create: `_acceptance/thuoc-khai-dung-tieng/rang/khong-de-lai-vet.mjs`

- [ ] **Step 1: Bọc `try/finally` cho `hoi-quy-nam-cho.mjs`**

Toàn bộ thân từ sau `datDuGiaiDoan()` tới trước `process.exit` bọc trong `try { … } finally { await giaiDoan.don(); }`, cộng hai bẫy `process.on("uncaughtException")` và `process.on("unhandledRejection")` gọi `don()` rồi thoát — cùng khuôn `khai-tieng-ho-so.mjs` đã dùng.

- [ ] **Step 2: `datDuGiaiDoan` thôi bỏ cuộc im lặng**

`if (!muon) break;` đổi thành thoát có tên:

```js
if (!muon) {
	throw new Error(
		`KHONG DUNG DUOC TIEN DE: het thoa thuan de muon cho giai doan ${ma}. ` +
			"Tap du lieu thu khong du phu enum; day la tien de thieu, khong phai dat.",
	);
}
```

và `skip: daDoi.length` đổi thành lọc theo id đã mượn để không lệch chỉ số:

```js
const muon = await db.deal.findFirst({
	where: { stage: { notIn: thieu }, id: { notIn: daDoi.map((d) => d.id) } },
	orderBy: { createdAt: "desc" },
});
```

- [ ] **Step 3: Viết `khong-de-lai-vet.mjs`**

Chụp `{id, stage}` của mọi thoả thuận TRƯỚC, đặt biến môi trường `RANG_EP_LOI=1` để `hoi-quy-nam-cho.mjs` ném một ngoại lệ thật ở giữa (sau khi mượn, trước khi trả), chạy nó, rồi chụp lại và đối chiếu. Gọi tên từng thoả thuận kèm giá trị trước/sau.

Chuỗi ghim: `ban-ghi-that-con-lech:`.

Thêm vào `hoi-quy-nam-cho.mjs` đúng một dòng phục vụ phép đo này, ngay sau khi mượn:

```js
if (process.env.RANG_EP_LOI === "1") throw new Error("ep loi de do phep tra lai");
```

- [ ] **Step 4: Chạy**

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/khong-de-lai-vet.mjs`
Expected: exit 0, `0 ban ghi that con lech`.

- [ ] **Step 5: Chứng chiều đỏ**

Bản sao: gỡ `try/finally` khỏi `hoi-quy-nam-cho.mjs` → chân ĐỎ, thông điệp ghim `ban-ghi-that-con-lech:` kèm id thoả thuận.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/ho-so-khai-dung-tieng/rang _acceptance/thuoc-khai-dung-tieng/rang/khong-de-lai-vet.mjs
git commit -m "fix(thuoc): thuoc khong de lai vet tren vat no do, ke ca khi chet giua chung"
```

**Phục vụ:** AC-5 · E5. **independent: true** so với Task 4, 5.

---

### Task 7: Kiểm đường dẫn trước khi xoá

**Files:**
- Modify: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs` (`dungCaySao`)
- Create: `_acceptance/thuoc-khai-dung-tieng/rang/xoa-co-kiem.mjs`

- [ ] **Step 1: Thêm phép kiểm vào `dungCaySao`**

```js
function kiemDuongSao(sao) {
	const ten = sao.split("/").pop() ?? "";
	if (!ten.startsWith(".pha-thu-khai-tieng-")) {
		thoatCoTen(`[xoa-tu-choi] duong ${sao} khong mang tien to .pha-thu-khai-tieng-`);
	}
	if (sao === GOC || GOC.startsWith(`${sao}/`)) {
		thoatCoTen(`[xoa-tu-choi] duong ${sao} chua hoac bang goc kho`);
	}
	const ra = spawnSync("git", ["-C", GOC, "worktree", "list", "--porcelain"], { encoding: "utf8" });
	if (existsSync(sao) && !(ra.stdout ?? "").includes(sao)) {
		thoatCoTen(`[xoa-tu-choi] duong ${sao} ton tai nhung khong phai worktree do script nay tao`);
	}
}
```

Gọi `kiemDuongSao(sao)` NGAY TRƯỚC mọi `rmSync`.

- [ ] **Step 2: Viết `xoa-co-kiem.mjs` — ba đường**

(a) đường hợp lệ → xoá được, exit 0;
(b) `CAY_SAO` = gốc kho → từ chối, **và khẳng định thư mục VẪN CÒN**;
(c) `CAY_SAO` = một thư mục thường do chân đo tự dựng → từ chối, **và thư mục VẪN CÒN**.

Chuỗi ghim: `xoa-nham:` (chỉ in khi một đường lẽ ra phải từ chối mà lại xoá).

- [ ] **Step 3: Chạy**

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/xoa-co-kiem.mjs`
Expected: exit 0, ba đường đạt.

- [ ] **Step 4: Chứng chiều đỏ**

Bản sao: bỏ `kiemDuongSao` → đường (c) xoá thật → chân ĐỎ, ghim `xoa-nham:` kèm đường nào.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs _acceptance/thuoc-khai-dung-tieng/rang/xoa-co-kiem.mjs
git commit -m "fix(thuoc): kiem duong dan truoc moi rmSync de quy"
```

**Phục vụ:** AC-6 · E6. **independent: true** so với Task 6.

---

### Task 8: Bản khai khớp bản thật

**Files:**
- Modify: `_acceptance/ho-so-khai-dung-tieng/evals.yaml` (E7, E11)
- Modify: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs` (ghi đủ khoá)
- Create: `_acceptance/thuoc-khai-dung-tieng/rang/ban-khai-khop.mjs`

- [ ] **Step 1: E7 bỏ mô tả API đã chết**

Trong `evals.yaml` của hồ sơ cũ, chiều (b) và (c) của E7 đổi "part kiểu CHUỖI TRẦN" thành "part KHÔNG khai `lang`" — khớp hợp đồng đã tu chính và khớp chính phép phá.

- [ ] **Step 2: Mọi mục `vung-khai.json` mang khoá hội đồng chấm**

`ghiVung()` thêm `tieng_viet_lot: []` mặc định cho mọi mục, và các chân bọc điền danh sách thật. E11 của hồ sơ cũ lấy "danh sách rỗng ở mọi mục" làm tiêu chí PASS, nên mọi mục phải có khoá ấy.

- [ ] **Step 3: Viết `ban-khai-khop.mjs`**

Đọc `evals.yaml` của hồ sơ cũ; gom mọi khoá mà eval `judgment` nhắc tới trong `expected`; chạy một lượt chân đo thật rồi đọc `vung-khai.json`; khẳng định mọi khoá đều có mặt ở mọi mục. Gọi tên từng khoá.

Chuỗi ghim: `khoa-hoi-dong-khong-co-chan-do-ghi:`.

- [ ] **Step 4: Chạy**

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/ban-khai-khop.mjs`
Expected: exit 0.

- [ ] **Step 5: Chứng chiều đỏ**

Bản sao: thêm một khoá vào `expected` của eval judgment mà không chân đo nào ghi → ĐỎ, gọi tên khoá.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/ho-so-khai-dung-tieng _acceptance/thuoc-khai-dung-tieng/rang/ban-khai-khop.mjs
git commit -m "fix(thuoc): ban khai khop ban that — bo API da chet, ghi du khoa hoi dong cham"
```

**Phục vụ:** AC-7 · E7. **independent: true** so với Task 6, 7.

---

### Task 9: Bài kiểm về đúng nhà

**Files:**
- Create: `apps/app/test/khai-tieng-metaline.spec.tsx`
- Modify: `packages/ui/test/khai-tieng.spec.tsx`
- Modify: `_acceptance/ho-so-khai-dung-tieng/contract.md` (AC-7, `amended_at` lần hai)
- Create: `_acceptance/thuoc-khai-dung-tieng/rang/bai-kiem-dung-nha.mjs`

- [ ] **Step 1: Chứng cổng kiểu HIỆN KHÔNG soi bài kiểm**

Đổi `MetaPart.text` thành `noi_dung` trong `record-parts.tsx` (tạm), chạy `bun run check-types`.
Expected: XANH — đó là bằng chứng bài kiểm đang lọt. Trả bản gốc ngay.

- [ ] **Step 2: Chuyển phần `MetaLine` sang `apps/app/test`**

Tạo `apps/app/test/khai-tieng-metaline.spec.tsx` mang hai test `chieu b` và `chieu c` cùng hàm `ve()` và `vungKhai()`; nhập `MetaLine` bằng `@/components/crm/record-sheet/record-parts`. Xoá hai test đó cùng dòng nhập `MetaLine` khỏi `packages/ui/test/khai-tieng.spec.tsx`; tệp đó giữ `chieu a`.

`apps/app` cần preload DOM: thêm `"test": "bun test --preload ../../packages/ui/test/setup-dom.ts"` vào `apps/app/package.json` nếu chưa có, hoặc chép `setup-dom.ts` sang `apps/app/test/`.

- [ ] **Step 3: Cả hai bài kiểm xanh**

Run: `cd packages/ui && bun test --preload ./test/setup-dom.ts test/khai-tieng.spec.tsx && cd ../../apps/app && bun test test/khai-tieng-metaline.spec.tsx`
Expected: 1 pass + 2 pass.

- [ ] **Step 4: Chứng cổng kiểu NAY soi được**

Lặp lại Step 1: đổi `MetaPart.text` thành `noi_dung`, chạy `bun run check-types`.
Expected: ĐỎ, thông điệp gọi tên `apps/app/test/khai-tieng-metaline.spec.tsx`. Trả bản gốc.

- [ ] **Step 5: Tu chính AC-7 của hồ sơ cũ, lần hai**

`amended_at: 2026-09-19`, `amended_reason` nói rõ: ba chiều vẫn được đo, nhưng (a) sống ở `packages/ui/test` và (b)(c) ở `apps/app/test`, vì bài kiểm gộp lọt khỏi mọi `tsconfig`. Câu AC-7 đổi "trong CÙNG một bài kiểm" thành "ba chiều cùng được đo, mỗi chiều bởi một cổng kiểu thật sự soi nó".

- [ ] **Step 6: Viết `bai-kiem-dung-nha.mjs`**

Hằng ghim: số tệp nguồn dưới `packages/` (chép tay từ cây). Khẳng định số quét được bằng hằng TRƯỚC khi đếm vi phạm; rồi 0 tệp nào nhập `../../apps/`.

Chuỗi ghim: `nhap-nguoc-chieu:`.

- [ ] **Step 7: Chứng chiều đỏ, hai vị trí**

(i) thêm một dòng nhập ngược chiều vào `packages/ui/src` → ĐỎ;
(ii) thêm vào `packages/ui/test` → ĐỎ. Hai vị trí chứng phạm vi quét phủ cả `src` lẫn `test`.

- [ ] **Step 8: Commit**

```bash
git add apps/app/test packages/ui/test _acceptance/ho-so-khai-dung-tieng/contract.md _acceptance/thuoc-khai-dung-tieng/rang/bai-kiem-dung-nha.mjs apps/app/package.json
git commit -m "fix(thuoc): bai kiem MetaLine ve apps/app/test — het nguoc chieu, cong kieu soi duoc"
```

**Phục vụ:** AC-8 · E8, E9. **independent: true** so với Task 6, 7, 8.

---

### Task 10: Hồ sơ cũ vẫn xanh, và sản phẩm không bị chạm

**Files:** Create `_acceptance/thuoc-khai-dung-tieng/rang/ho-so-cu-van-xanh.mjs`

- [ ] **Step 1: Viết chân đo, hai vế**

(a) chạy lại trọn bộ đo của hồ sơ cũ, gọi tên từng chân kèm mã thoát, và đọc `vung-khai.json` khẳng định 0 lệch;
(b) `git diff --name-only <diffBase>...HEAD` giao với danh sách mười một tệp sản phẩm ở Global Constraints — giao phải RỖNG.

Hằng ghim: mười một tệp sản phẩm, chép từ hợp đồng.
Chuỗi ghim: `cham-san-pham:`.

- [ ] **Step 2: Chạy**

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/ho-so-cu-van-xanh.mjs`
Expected: exit 0.

- [ ] **Step 3: Chứng chiều đỏ**

Bản sao: sửa một dòng trong `foreign-text.tsx` rồi commit trong bản sao → ĐỎ, ghim `cham-san-pham:` kèm tên tệp.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/thuoc-khai-dung-tieng/rang/ho-so-cu-van-xanh.mjs
git commit -m "test(thuoc): ho so cu van xanh, va diff khong cham mot tep san pham nao"
```

**Phục vụ:** AC-9 · E10. **independent: false** (cần Task 2, 6, 7, 8)

---

### Task 11: Bộ khai sinh của CHÍNH vòng này

**Files:** Create `_acceptance/thuoc-khai-dung-tieng/rang/khai-sinh-phu-vong-nay.mjs`

- [ ] **Step 0: Tu chính AC-11 của CHÍNH hợp đồng này — số "MƯỜI" đã lỗi thời**

`config.yaml` khai 12 script `tk_*`, không phải mười. Ghi `amended_at: 2026-09-19` và `amended_reason` nói rõ: số mười là ước lượng lúc S1 trước khi executor được liệt đủ; mệnh đề điều hành của AC-11 vốn là "số đột biến = số mệnh đề đếm được trong bản khai", và mệnh đề đó không đổi. Đây là MỞ RỘNG phạm vi phủ, không thu hẹp. Append một dòng `fix` vào `decisions.jsonl` theo khuôn `DEC-ID-RECIPE`.

- [ ] **Step 1: Đếm mệnh đề "Cặp hai chiều" — NEO ĐẦU DÒNG, không đếm thô**

```js
const s = readFileSync(join(GOC, "_acceptance/thuoc-khai-dung-tieng/evals.yaml"), "utf8");
const soMenhDe = (s.match(/^\s*Cap hai chieu/gm) ?? []).length;
ghim("so menh de Cap hai chieu", soMenhDe, 13);
```

Đếm thô `/Cap hai chieu/g` ra **15**, không phải 13: chính phần mô tả của E12 nhắc cụm đó hai lần, giữa dòng, trong ngoặc kép. Neo `^\s*` chỉ bắt mệnh đề mở đầu một dòng — đúng hình dạng mà mười ba ô kia dùng. Đây không phải chuyện thẩm mỹ regex: đếm thô làm chân đo đòi 15 đột biến cho 13 chỗ và đỏ vĩnh viễn vì một lý do không dính gì tới chất lượng bộ đo.

Hằng ghim 13 chép tay từ cây (E1–E10, E12, E13, E14 — mỗi ô một mệnh đề; E11 là ô hội đồng, không có cặp). Danh sách đột biến khai trong chính tệp, và `ghim("so dot bien", DOT_BIEN_VONG_NAY.length, soMenhDe)`.

- [ ] **Step 2: Với từng chân mới: lượt lành trước, rồi phá**

Cùng khuôn `ghim-phan-biet.mjs` cộng bước phá: chạy lành → khẳng định chuỗi ghim VẮNG; áp đột biến trong bản sao → chạy lại → khẳng định ĐỎ và chuỗi ghim CÓ.

Chuỗi ghim: `chan-moi-khong-do-duoc:`.

- [ ] **Step 3: Chạy**

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/khai-sinh-phu-vong-nay.mjs`
Expected: exit 0, số đột biến bằng số mệnh đề.

- [ ] **Step 4: Chứng chiều đỏ**

Bản sao: sửa một chân mới thành luôn `process.exit(0)` → ĐỎ, gọi tên chân đó.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/thuoc-khai-dung-tieng/rang/khai-sinh-phu-vong-nay.mjs
git commit -m "test(thuoc): bo khai sinh phu CA MUOI chan cua chinh vong nay"
```

**Phục vụ:** AC-11 · E12. **independent: false** (cần mọi chân mới)

---

### Task 12: Ghim lại hồ sơ đã ký, và đo rằng nó đã xong

**Files:** Create `_acceptance/thuoc-khai-dung-tieng/rang/ghim-lai-da-xong.mjs`

- [ ] **Step 1: Viết chân đo TRƯỚC khi ghim lại — nó phải ĐỎ**

Đọc `evals.yaml` của `nen-chat-ai-elements`, gom mọi đường trong `paths`, so băm nội dung tại `verified_commit` với băm trên cây đang xét. Gọi tên từng đường kèm hai băm.

Chuỗi ghim: `bang-chung-hoa-cu:`.

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/ghim-lai-da-xong.mjs`
Expected: **ĐỎ**, gọi tên `.githooks/gate-shape.json` — vì Task 4 vừa sửa nó.

- [ ] **Step 2: Chạy nghi thức ghim lại**

```bash
node "$WORKFLOWS_DIR/../scripts/repin-lane.mjs" --root . --slug nen-chat-ai-elements --reason "gate-shape.json doi hinh dang de do hai ho so (thuoc-khai-dung-tieng AC-4)" --write
```

Làn đỏ ở bất kỳ suite hay eval nào → DỪNG, không append dòng repin, khắc phục rồi chạy làn MỚI.

- [ ] **Step 3: Chạy lại chân đo — phải XANH**

Expected: exit 0, 0 đường lệch.

- [ ] **Step 4: Chứng chiều đỏ lần nữa**

Sửa một byte của `gate-shape.json` sau khi ghim → ĐỎ, gọi tên đúng tệp kèm hai băm. Trả bản gốc.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/nen-chat-ai-elements _acceptance/thuoc-khai-dung-tieng/rang/ghim-lai-da-xong.mjs
git commit -m "chore(nen-chat): ghim lai sau khi ban khai cong doi hinh dang"
```

**Phục vụ:** AC-12 · E13. **independent: false** (cần Task 4)

---

### Task 13: Bảy bệnh cũ không quay lại

**Files:** Create `_acceptance/thuoc-khai-dung-tieng/rang/bay-benh-cu.mjs`

- [ ] **Step 1: Bảy đột biến, hằng ghim bảy**

Mỗi đột biến khôi phục đúng một bệnh (A, C, D, E, F, G, chốt-ghim-cũ) trong bản sao, chạy phần bộ đo liên quan, khẳng định ĐỎ và thông điệp gọi tên bệnh.

`ghim("so benh", DOT_BIEN.length, 7)`.

- [ ] **Step 2: Bệnh không dựng được đột biến phải có tên trong Known limits**

Chân đọc mục `## Known limits` của `_acceptance/thuoc-khai-dung-tieng/contract.md`; bệnh nào bỏ khỏi danh sách mà không có tên ở đó → ĐỎ.

Chuỗi ghim: `benh-cu-quay-lai:` và `benh-thieu-ca-do-lan-known-limits:`.

- [ ] **Step 3: Chạy**

Run: `bun _acceptance/thuoc-khai-dung-tieng/rang/bay-benh-cu.mjs`
Expected: exit 0, bảy bệnh đều bị bắt.

- [ ] **Step 4: Chứng chiều đỏ**

Bản sao: bỏ một bệnh khỏi danh sách mà không thêm tên vào Known limits → ĐỎ, gọi tên bệnh thiếu.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/thuoc-khai-dung-tieng/rang/bay-benh-cu.mjs
git commit -m "test(thuoc): bay benh da va khong quay lai duoc"
```

**Phục vụ:** AC-13 · E14. **independent: false** (cần Task 2, 6, 7)

---

### Task 14: Cổng cuối và bằng chứng

- [ ] **Step 1: Năm cổng của kho**

```bash
bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build
```
Expected: cả năm exit 0.

- [ ] **Step 2: Mười ba chân đo mới, mỗi cái một lượt**

Chạy từng `tk_*` executor, ghi mã thoát. Cái nào đỏ thì sửa rồi chạy lại — không đi tiếp với một chân đỏ.

- [ ] **Step 3: Kết xuất đầu ra một lượt chạy cho hội đồng (AC-10 · E11)**

E11 là ô hội đồng duy nhất và nó phục vụ AC-10: người đọc phải nêu được, với từng dòng trong bảng mười ba cách nói dối, phép đo nào bắt nó và bắt bằng cách nào. Gom đầu ra của cả mười ba executor vào `_acceptance/thuoc-khai-dung-tieng/evidence/dau-ra-mot-luot.txt`, theo đúng thứ tự E1→E14, mỗi khối mở bằng dòng `== <eval id> · <lệnh> ==`. Dòng nào trong bảng không có phép đo nào bắt thì tên nó phải đã nằm ở `## Known limits` — AC-13 Step 2 đo chính điều đó, nên hai AC dùng chung một danh sách.

- [ ] **Step 4: Đặt hợp đồng sang `implemented` và commit**

```bash
git add -A
git commit -m "chore(thuoc-khai-dung-tieng): hop dong sang implemented — 13/13 task xong"
```

**Phục vụ:** mọi AC. **independent: false**

---

## Thứ tự và làn song song

```
Task 1 (chung.mjs)
   ├─> Task 2 (ghim phân biệt) ──> Task 3 (khai sinh dùng ghim)
   ├─> Task 4 (cơ chế cổng) ─────> Task 5 (hai chân cổng) ──> Task 12 (ghim lại)
   ├─> Task 6 (dữ liệu thật)  ─┐
   ├─> Task 7 (xoá có kiểm)   ├─ ba task này độc lập với nhau
   ├─> Task 8 (bản khai khớp) ─┘
   └─> Task 9 (bài kiểm đúng nhà)
                 ├─> Task 10 (hồ sơ cũ vẫn xanh)
                 ├─> Task 11 (khai sinh phủ vòng này)
                 └─> Task 13 (bảy bệnh cũ)
                              └─> Task 14 (cổng cuối)
```

Task 6, 7, 8, 9 chạm bốn tập tệp rời nhau nên chạy song song được. **Task 11 và 13 phải chạy TUẦN TỰ và sau cùng** — chúng dựng bản sao cây và chạy lại các chân đo khác, nên song song với chúng là đo lẫn nhau. Task 12 phải sau Task 4 vì nó ghim lại chính cái vừa sửa.

## Cổng cuối trước khi giao

Năm lệnh ở Task 14, cộng một điều kiện không có trong lệnh nào: **`git diff` của cả vòng không được chứa một tệp sản phẩm nào của `ho-so-khai-dung-tieng`.** Task 10 đo điều đó, và nó là lời hứa trung tâm của vòng này — thước đổi, sản phẩm không đổi.
