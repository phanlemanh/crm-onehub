# Trần giờ và cô lập cho thước lai-ra-man — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ca lái của `packages/ui/test/lai-ra-man.spec.tsx` có trần giờ tường minh theo số đo CI, và khi quá hạn thì dừng thật, không kéo đỏ ca khác.

**Architecture:** Hằng `TRAN_LAI_MS` gắn làm tham số thứ ba của cả ba `test(...)`. Một `AbortController` theo ca (`beforeEach`/`afterEach`), signal truyền xuống `laiMotFile → ve → laiMoRa`, hàm `conLuot` ném lỗi khi đã huỷ; `unmount` dự phòng trong `finally`. Bốn răng trong `_acceptance/lai-ra-man-tran-gio/rang/` đo: trần có mặt, trần có căn cứ, cô lập (bản sao ép trần), bản vẽ không đổi (bản sao spec ở `c895e5bf`).

**Tech Stack:** bun test 1.3.12 (happy-dom qua `test/setup-dom.ts`), React 19 `act`, Node ESM cho răng, `typescript` cho đọc cây cú pháp.

**Spec:** `docs/superpowers/specs/2026-09-28-lai-ra-man-tran-gio-design.md` · contract `_acceptance/lai-ra-man-tran-gio/contract.md` · evals `_acceptance/lai-ra-man-tran-gio/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Hằng số tinh chỉnh của răng nằm trong một tệp `rang/cau-hinh.mjs`, không rải theo tệp dùng.
- `TRAN_LAI_MS = 30_000`; hệ số căn cứ `4`; neo spec cũ `c895e5bff88f9b1f6a13ffc5885c37fe0b6d7ec8`.
- Bản sao spec đặt trong `packages/ui/test/` với tên không mang đuôi `.spec`/`.dom.tsx` (`lai-ra-man.co-lap-<pid>.tsx`, `.cu-<pid>.tsx`, `.moi-<pid>.tsx`, …), xoá trong `finally`.
- Bản sao ghi tạo phẩm vào `.acceptance-runs/lai-ra-man-tran-gio/<eval>-<pid>/…`, không vào thư mục tạo phẩm của `chan-lai-component-ra-man`.
- Bản vẽ (`ve-that.json`, `mo-nguyen-ban.json`) không được đổi — E4 là trọng tài.

## Review Focus

1. Một component `unmount` lỗi phải vẫn ra đúng `loi` như trước (unmount dự phòng trong `finally` không được nuốt lỗi của đường thành công) → E4 bắt, Task 2 bước 4.
2. Vòng đã chết đang giữa `act(render)` khi ca mới bắt đầu: lần kiểm `conLuot` ngay sau `await act` phải chặn nó trước khi đọc/bấm → E3 chiều xanh.
3. Chiều đỏ của E3 không đua (vòng chết xong trước ca sau) → mã 2, không REJECT giả → Task 3.
4. Răng bị giết giữa chừng để sót bản sao trong `packages/ui/test` → so danh sách tệp trước/sau và `finally` → Task 3, 4.
5. Tệp đỡ (`setup-dom.ts`, `luot-chay.mjs`, `moi-mac-dinh.mjs`) trôi so với neo làm phép so E4 mất nghĩa → tiền kiểm mã 2 → Task 4.

---

### Task 1: Răng E1/E2 — trần có mặt và trần có căn cứ

`independent: false` (xanh chỉ sau Task 2) · phục vụ E1, E2

**Files:**
- Create: `_acceptance/lai-ra-man-tran-gio/rang/cau-hinh.mjs`
- Create: `_acceptance/lai-ra-man-tran-gio/rang/tran-gio.mjs`

**Interfaces:**
- Produces: `CAU_HINH` (`spec`, `neo`, `heSo`, `soCa`, `tenCa`, `tranEpMs`, `lanDo`, `tepDo`, `raGoc`); `soi(nguon) → { ca: {ten, thuBa}[], tran: number|null }`.

- [ ] **Step 1: cau-hinh.mjs**

```js
export const CAU_HINH = {
	spec: "packages/ui/test/lai-ra-man.spec.tsx",
	bangDo: "_acceptance/lai-ra-man-tran-gio/rang/bang-do-ci.json",
	neo: "c895e5bff88f9b1f6a13ffc5885c37fe0b6d7ec8",
	heSo: 4,
	soLuotToiThieu: 30,
	soCa: 3,
	tenCa: {
		lai: "lai tung component ra man, doc chu ban ve that su ve",
		mo: "mo tung nguyen ban cua bang gioi han vong truoc",
		chuoi: "chuoi da va den man bang tieng Viet, va so ca bang so dong da va",
	},
	tranEpMs: 300,
	lanDo: 3,
	tepDo: [
		"packages/ui/test/setup-dom.ts",
		"_acceptance/chan-lai-component-ra-man/rang/luot-chay.mjs",
		"_acceptance/chan-lai-component-ra-man/rang/moi-mac-dinh.mjs",
	],
	raGoc: ".acceptance-runs/lai-ra-man-tran-gio",
};
```

- [ ] **Step 2: tran-gio.mjs** — `soi` duyệt `CallExpression` có `expression` là `test`, lấy tên (đối số 1) và `args[2]?.getText()`; `tran` từ câu khai cấp tệp `TRAN_LAI_MS` là `NumericLiteral` (bỏ `_`). Lệnh `co-mat`: lỗi `ca khong co tran tuong minh: <ten>` cho mỗi ca thiếu; `so ca <n>, neo 3`; `TRAN_LAI_MS khong khai o cap tep bang so nguyen`. Đột biến trong bộ nhớ: bỏ `, TRAN_LAI_MS` ở ca «chuoi da va» → phải có lỗi chứa tên ca đó. Lệnh `can-cu`: đọc bảng; mốc = max(xanh chậm nhất, cận đỏ lớn nhất); lỗi `tran <t> ms duoi 4 lan moc <m> ms (can duoi do <run>/<att>)`; hai đột biến 5000 và 25000. Mã: 0 xanh · 1 lời hứa sai hoặc đột biến không bị bắt · 2 không đo được.

- [ ] **Step 3: chạy trên spec hiện tại (chưa sửa) — phải đỏ**

Run: `node _acceptance/lai-ra-man-tran-gio/rang/tran-gio.mjs co-mat; echo $?`
Expected: mã 1, ba dòng `ca khong co tran tuong minh: …` và dòng `TRAN_LAI_MS khong khai…`.

Run: `node _acceptance/lai-ra-man-tran-gio/rang/tran-gio.mjs can-cu; echo $?`
Expected: mã 1 (`TRAN_LAI_MS` vắng).

### Task 2: Spec — trần tường minh, tín hiệu dừng, root trong finally

`independent: false` · phục vụ E1, E2, E3, E4

**Files:**
- Modify: `packages/ui/test/lai-ra-man.spec.tsx`

**Interfaces:**
- Produces: `TRAN_LAI_MS`, `luot`, `conLuot(tin)`, `ve(nut, tieng, tin)`, `laiMoRa(tin)`, `laiMotFile(duong, tieng, tin)`; hai lời gọi `luot.abort();` (mốc đột biến của E3).

- [ ] **Step 1: thêm hằng và hook**

```ts
import { afterEach, beforeEach, expect, test } from "bun:test";

const TRAN_LAI_MS = 30_000;
const LUOT_HET = "vong lai da het luot — ca cua no da ket thuc";

let luot = new AbortController();

beforeEach(() => {
	luot.abort();
	luot = new AbortController();
});

afterEach(() => {
	luot.abort();
});

function conLuot(tin: AbortSignal) {
	if (tin.aborted) throw new Error(LUOT_HET);
}
```

- [ ] **Step 2: laiMoRa và ve nhận `tin`**

```ts
async function laiMoRa(tin: AbortSignal) {
	const thay = new Set<Element>();
	for (const chon of NUT_LAI)
		for (const n of Array.from(document.body.querySelectorAll(chon)))
			thay.add(n);
	for (const n of Array.from(thay)) {
		if (n instanceof HTMLElement === false) continue;
		conLuot(tin);
		try {
			await act(async () => {
				n.click();
			});
		} catch {}
	}
}

async function ve(
	nut: ReactElement,
	tieng: Locale,
	tin: AbortSignal,
): Promise<{ chu: Set<string>; loi: string | null }> {
	conLuot(tin);
	document.body.innerHTML = "";
	const hop = document.createElement("div");
	document.body.appendChild(hop);
	const goc = createRoot(hop);
	const im = console.error;
	console.error = () => {};
	let daThao = false;
	try {
		await act(async () => {
			goc.render(
				createElement(
					LocaleProvider,
					{ locale: tieng },
					createElement(TooltipProvider, null, nut),
				),
			);
		});
		conLuot(tin);
		const chu = chuNguoiDoc();
		await laiMoRa(tin);
		conLuot(tin);
		for (const c of chuNguoiDoc()) chu.add(c);
		await act(async () => {
			goc.unmount();
		});
		daThao = true;
		return { chu, loi: null };
	} catch (e) {
		if (tin.aborted) throw e;
		return { chu: new Set(), loi: (e as Error).message.slice(0, 200) };
	} finally {
		if (!daThao) {
			try {
				goc.unmount();
			} catch {}
		}
		console.error = im;
	}
}
```

- [ ] **Step 3: laiMotFile(duongUi, tieng, tin)** — bỏ mặc định `tieng`, thêm `conLuot(tin)` ở đầu, truyền `tin` vào hai lời gọi `ve`. Mỗi ca mở đầu bằng `const tin = luot.signal;`, gọi `laiMotFile(f, "en", tin)` / `laiMotFile(duong, "en", tin)` / `laiMotFile(d.file, "vi", tin)` + `"en"`, và đóng bằng `}, TRAN_LAI_MS);`.

- [ ] **Step 4: kiểm**

Run: `node _acceptance/lai-ra-man-tran-gio/rang/tran-gio.mjs co-mat && node _acceptance/lai-ra-man-tran-gio/rang/tran-gio.mjs can-cu`
Expected: mã 0, in 3 ca, hệ số 30000/7469.2 ≈ 4.02.

Run: `cd packages/ui && bun test --preload ./test/setup-dom.ts test/lai-ra-man.spec.tsx && bun run test`
Expected: 3 pass; cả gói xanh.

Run: `cd packages/ui && bun test --preload ./test/setup-dom.ts --timeout 400 test/lai-ra-man.spec.tsx` (tái hiện ở design doc)
Expected: `--timeout` không đè trần theo ca, nên cả 3 xanh — bằng chứng trần theo ca có hiệu lực.

- [ ] **Step 5: Commit** `fix(ui-test): lai-ra-man có trần tường minh và dừng vòng lái khi hết giờ`

### Task 3: Răng E3 — cô lập

`independent: false` · phục vụ E3

**Files:**
- Create: `_acceptance/lai-ra-man-tran-gio/rang/ban-sao.mjs` (dùng chung cho E3/E4)
- Create: `_acceptance/lai-ra-man-tran-gio/rang/co-lap.mjs`

**Interfaces:**
- Produces (`ban-sao.mjs`): `GOC`, `thayMotLan(src, cu, moi, nhan) → string` (ném `MocVang` khi số lần ≠ 1), `thayDungSoLan(src, cu, moi, n, nhan)`, `doiDich(src, thuMuc)`, `epTranCa(src, tenCa, ms)`, `chayBanSao(src, nhan, thuMuc) → Map<ten, {xanh, loai}>`, `chup() → {tep: string[], sha: Record<string,string>}`, `soChup(truoc, sau) → string[]`.

- [ ] **Step 1:** `chayBanSao` ghi `packages/ui/test/lai-ra-man.<nhan>-<pid>.tsx`, `mkdir` thư mục đích, chạy `bun test --preload ./test/setup-dom.ts --reporter=junit --reporter-outfile <xml> ./test/<tệp>` ở `packages/ui`, đọc từng `<testcase name=…>` và `<failure type="…"/>`, xoá bản sao + xml trong `finally`.
- [ ] **Step 2:** `co-lap.mjs`: chụp trước; chiều xanh (ép trần ca lái 300 ms, đổi đích): ca lái phải đỏ với `TimeoutError` (không đỏ → mã 2 «tran ep khong co tac dung»), hai ca kia xanh (đỏ → mã 1, nêu tên); chiều đỏ ×3 (thêm bỏ hai `luot.abort();`): «chuoi da va» đỏ cả 3 lần → in `vong lai het gio van ve tiep: chuoi da va den man do theo (3/3)`; lần nào xanh → mã 2 «doi chung khong dua». Chụp sau; lệch → mã 2.
- [ ] **Step 3: kiểm hai chiều**

Run: `node _acceptance/lai-ra-man-tran-gio/rang/co-lap.mjs; echo $?`
Expected: mã 0, dòng (3/3).

Phá-thử (bản sao cây trong scratchpad, không phá tại chỗ): chạy răng với spec ở `c895e5bf` → mốc `luot.abort()` vắng → mã 2.

- [ ] **Step 4: Commit** `test(acceptance): răng cô lập của lai-ra-man-tran-gio`

### Task 4: Răng E4 — bản vẽ không đổi

`independent: false` · phục vụ E4

**Files:**
- Create: `_acceptance/lai-ra-man-tran-gio/rang/ban-ve-khong-doi.mjs`

- [ ] **Step 1:** tiền kiểm `tepDo` bằng `git show <neo>:<tệp>` so với đĩa (lệch → mã 2); lấy spec cũ bằng `git show`; bốn lượt: `cu`, `moi`, `do-a` (bỏ `"button",`), `do-b` (bỏ `for (const c of b.mo) chu.add(c);`); mỗi lượt phải ghi đủ hai tệp (vắng → mã 2). So `cu`↔`moi` từng byte (lệch → mã 1 `ban ve lech: <tệp> khoa <k>`); `moi`↔`do-a` phải lệch `ve-that.json`, `moi`↔`do-b` phải lệch `mo-nguyen-ban.json` (không lệch → mã 1). Chụp trước/sau như E3.
- [ ] **Step 2: kiểm**

Run: `node _acceptance/lai-ra-man-tran-gio/rang/ban-ve-khong-doi.mjs; echo $?`
Expected: mã 0; in kích thước hai tệp, số khoá ve-that, hai dòng `ban ve lech` của chiều đỏ.

- [ ] **Step 3: Commit** `test(acceptance): răng bản vẽ không đổi của lai-ra-man-tran-gio`

### Task 5: Đo CI trước/sau

`independent: false` · phục vụ E5

- [ ] **Step 1:** đẩy nhánh `fix/lai-ra-man-tran-gio`, mở PR nháp vào `onehub` (sẽ là PR của S5) → lượt CI «sau» của bản vá.
- [ ] **Step 2:** hai nhánh đo-thử, mỗi nhánh một commit đổi riêng trần ca lái thành `500`:
  - `do-thu/lai-ra-man-co-va` từ nhánh vá (`}, TRAN_LAI_MS);` của ca lái → `}, 500);`);
  - `do-thu/lai-ra-man-chua-va` từ `origin/onehub` (thêm `, 500` cho ca lái).
  Mở hai PR nháp «[đo-thử — không merge]» vào `onehub`.
- [ ] **Step 3:** chờ CI, lấy danh sách `(fail)` của `@crm/ui#test` từng run bằng `gh run view --log`; chạy lại CI của PR thật thêm 2 lượt.
- [ ] **Step 4:** ghi `_acceptance/lai-ra-man-tran-gio/evidence/do-ci.md` (run id, attempt, ms ca lái, danh sách ca đỏ); đóng hai PR đo-thử, xoá hai nhánh.
- [ ] **Step 5: Commit** `docs(acceptance): số đo CI trước/sau của lai-ra-man-tran-gio`
