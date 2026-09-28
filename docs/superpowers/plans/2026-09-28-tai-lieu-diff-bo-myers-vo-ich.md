# tai-lieu-diff-bo-myers-vo-ich Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `soSanh` bỏ lời gọi `diffArrays` mức khối khi cận dưới đa tập của số bước sửa đã vượt `tranSuaKhoi`, để ca `tat-dinh` hết sát trần 5 000 ms trên CI mà đầu ra không đổi một byte.

**Architecture:** Thêm hàm nội bộ `canDuoiSua(truoc, sau)` trong `tai-lieu-diff.ts` (đếm giao đa tập theo khoá `JSON.stringify([kieu, chu])`), chặn trước `diffArrays` trong `soSanh`. Thước: ghim `diffHash` bản gốc `cfac5bea` cho bảy fixture, đếm `Date.now` làm proxy vòng Myers, ba răng trong `_acceptance/<slug>/rang/`.

**Tech Stack:** TypeScript, Bun 1.3.12 test, `diff@8.0.4`, Node cho răng `.mjs`, `typescript` (bộ phân tích AST).

**Spec:** `docs/superpowers/specs/2026-09-28-tai-lieu-diff-bo-myers-vo-ich-design.md` · hợp đồng `_acceptance/tai-lieu-diff-bo-myers-vo-ich/contract.md`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Không hằng mới, không số ma: trần là `TAI_LIEU.diff.tranSuaKhoi`; literal mới chỉ {0, 1, 2}.
- Chữ ký export `soSanh`, `diffHash`, `suKienDoi` không đổi.
- Không đặt trần thời gian riêng cho ca `tat-dinh`; `TRAN_MS` giữ `process.env.CI ? 6_000 : 2_000`.
- Mốc so của mọi phép đo «so với gốc» là sha `cfac5bea`, không phải merge-base.
- Răng đo ghi tạo phẩm dưới `.acceptance-runs/tai-lieu-diff-bo-myers-vo-ich/`, suy gốc kho từ vị trí script.

## Review Focus

1. Tài liệu có nhiều khối lặp và vài chỗ sửa — đầu ra phải như cũ (fixture `lap-khoi`, Task 1).
2. Cận dưới đúng bằng trần — vẫn phải chạy diff thật (fixture `bien-dung-tran`, Task 1).
3. Tài liệu dài sửa rải rác (trường hợp phổ biến nhất ở production) — vẫn có diff từng từ như cũ (`dai-sua-rai-rac`, Task 1).
4. Hai bản rỗng hay một bên rỗng — `canDuoiSua` trả `N + M`, với `N + M ≤ tran` vẫn đi `diffArrays` như cũ; phủ bởi ca «hai bản giống nhau» và `ngan` sẵn có.
5. Đảo thứ tự khối — chặn không bắt, hành vi như cũ (`dao-thu-tu`, Task 1).

---

### Task 1: Thước ghim bản gốc và đếm vòng Myers (RED)

**Files:**
- Modify: `packages/validation/test/tai-lieu-diff.spec.ts` (thêm sau ca `tat-dinh`)

**Interfaces:**
- Consumes: `soSanh`, `diffHash`, `vanBanDai` có sẵn trong spec; `spyOn` từ `bun:test`.
- Produces: ca `tran-duoi-khoi: <ten>` ×7, `myers-vo-ich: khac het …`, `myers-vo-ich: doi chung duong …` — Task 3 chạy chúng theo tên.

- [ ] **Step 1: Thêm bảng CAP, GHIM (7 hash tính từ bản sao mã `cfac5bea` ở scratchpad) và hai ca `myers-vo-ich`** — code trong `scratchpad/s1/spec-them.ts` + fixture `lap-khoi`:

```ts
const lap1500 = Array.from({ length: 1500 }, (_, i) => (i % 15 === 0 ? `rieng ${i}.` : "Ghi chú lặp."));
const lapSua = lap1500.map((d, i) => (i % 150 === 45 ? `rieng sua ${i}.` : d));
// CAP["lap-khoi"] = [md(lap1500), md(lapSua)]
// GHIM lap-khoi = 224acc5122c552b2be73a6597918551aa089c6a1aba59d00e488ca8c18b0e536
```

- [ ] **Step 2: Chạy, kỳ vọng RED đúng một ca**

Run: `cd packages/validation && bun test test/tai-lieu-diff.spec.ts -t "tran-duoi-khoi|myers-vo-ich"`
Expected: 7 `tran-duoi-khoi` PASS (mã chưa đổi = gốc), `myers-vo-ich: khac het` FAIL «vong Myers muc khoi van chay 2001 lan», đối chứng dương PASS.

### Task 2: Cận dưới đa tập trong soSanh (GREEN)

**Files:**
- Modify: `packages/validation/src/tai-lieu-diff.ts` (thêm `canDuoiSua` trước `mot`; đổi đầu `soSanh`)

**Interfaces:**
- Consumes: `Khoi`, `giong`, `TAI_LIEU.diff.tranSuaKhoi`.
- Produces: không export mới.

- [ ] **Step 1: Cài**

```ts
function canDuoiSua(truoc: Khoi[], sau: Khoi[]): number {
	const con = new Map<string, number>();
	for (const k of truoc) {
		const khoa = JSON.stringify([k.kieu, k.chu]);
		con.set(khoa, (con.get(khoa) ?? 0) + 1);
	}
	let chung = 0;
	for (const k of sau) {
		const khoa = JSON.stringify([k.kieu, k.chu]);
		const n = con.get(khoa) ?? 0;
		if (n === 0) continue;
		con.set(khoa, n - 1);
		chung += 1;
	}
	return truoc.length + sau.length - 2 * chung;
}
```

```ts
	const tran = TAI_LIEU.diff.tranSuaKhoi;
	const thay =
		canDuoiSua(a, b) > tran
			? undefined
			: diffArrays(a, b, { comparator: giong, maxEditLength: tran });
```

- [ ] **Step 2: Chạy cả tệp spec** — Run: `cd packages/validation && bun test test/tai-lieu-diff.spec.ts` · Expected: mọi ca PASS.
- [ ] **Step 3: Commit** `perf(validation): soSanh bỏ vòng Myers mức khối khi cận dưới vượt trần` (kèm Task 1).

### Task 3: Răng cat-thuoc (chiều đỏ AC-1/AC-2/AC-3)

**Files:**
- Create: `_acceptance/tai-lieu-diff-bo-myers-vo-ich/rang/cat-thuoc.mjs` (bản nháp `scratchpad/s1/rang/cat-thuoc.mjs`, thêm đột biến thứ tư `dem-theo-tap`: `\t\tcon.set(khoa, n - 1);` → `\t\tcon.set(khoa, 0);`, ca `tran-duoi-khoi: lap-khoi`, ghim `lech ban goc: lap-khoi`)

- [ ] **Step 1: Viết, chạy** `node _acceptance/tai-lieu-diff-bo-myers-vo-ich/rang/cat-thuoc.mjs` · Expected: 4 «dot bien …: bat», 4 «lanh …: xanh», exit 0.
- [ ] **Step 2: Phá thước** — đổi một chuỗi `tu` thành chuỗi không có trong mã → exit 2 «dot bien khong ap duoc»; đổi `ghim` sai → exit 1 «lot». Hoàn lại.

### Task 4: Răng nhanh-hon-goc và luat (AC-4, AC-5, AC-7)

**Files:**
- Create: `_acceptance/tai-lieu-diff-bo-myers-vo-ich/rang/nhanh-hon-goc.ts` (bản nháp scratchpad, đổi mốc sang `cfac5bea`, thêm tự kiểm `goc so da chua ban sua`)
- Create: `_acceptance/tai-lieu-diff-bo-myers-vo-ich/rang/luat.mjs` (`--phan thuoc` = E5 bảy kiểm; `--phan ma` = E8 bốn kiểm; `--chieu-do` chạy trên bản sao trong `.acceptance-runs/`)

- [ ] **Step 1: Chạy** `bun …/nhanh-hon-goc.ts` → tỉ lệ ≤ 0,75, exit 0; `--chieu-do` → «chieu do: bat», exit 0.
- [ ] **Step 2: Chạy** `node …/luat.mjs --phan thuoc` và `--phan ma` → mọi dòng «dat», exit 0; mỗi phần với `--chieu-do` → mọi bản phá bị bắt đúng thông điệp ghim, đối chứng dương `2 * chung` xanh.
- [ ] **Step 3: Mười lượt ca `tat-dinh`** — `for i in $(seq 10); do bun test test/tai-lieu-diff.spec.ts -t tat-dinh; done` trong `packages/validation`, ghi thời gian mỗi lượt vào `.acceptance-runs/<slug>/muoi-luot.txt`; làm tương tự ở `cfac5bea` bằng worktree tạm để có số trước/sau.
- [ ] **Step 4: Năm lệnh chứng** `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
- [ ] **Step 5: Commit** răng + đặt contract `status: implemented`.

`independent`: Task 1→2 phụ thuộc nhau; Task 3, 4 phụ thuộc Task 2. Thực thi tuần tự trong vòng chính.
