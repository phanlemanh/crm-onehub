# khoa-con-bat-xa-tran Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ca `go-la-cat-quyen > khoa-con-bat` chạy ≤ 1250ms tại chỗ (từ 1.6–4.1s) mà hai ma trận vẫn phủ đúng từng thủ tục, từng đường, và vẫn cắn.

**Architecture:** Một bộ chia lô cố định (`theoLo`) trong tệp spec; `maTranTrpc`/`maTranRest` nhận số lượt tuỳ chọn, mặc định 1. Chỉ `khoa-con-bat` truyền `LO_SONG_SONG = 8`. Thước đo sống ở `_acceptance/khoa-con-bat-xa-tran/rang/`.

**Tech Stack:** Bun 1.3.12 test runner, NestJS + tRPC, Better Auth api-key 1.6.25, supertest, Postgres (DB riêng mỗi lượt qua `bun run test`).

**Spec:** `docs/superpowers/specs/2026-09-26-khoa-con-bat-xa-tran-design.md` · hợp đồng `_acceptance/khoa-con-bat-xa-tran/contract.md` · `evals.yaml`.

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Không nới trần: không đối số thứ ba cho `test(`, không `setDefaultTimeout`, không `--timeout`.
- `LO_SONG_SONG` ≤ pool `pg` (10) trừ 2.
- Bản sao đột biến đặt ở `.acceptance-runs/khoa-con-bat-xa-tran/`, không trong gói (oxlint quét thư mục ẩn).
- Env đo lấy từ `.github/workflows/ci.yml`, không chép tay.

## Review Focus

1. Bộ chia lô trả kết quả sai thứ tự khi `lo > 1` → khẳng định danh sách tên (Task 1) + đột biến đảo thứ tự (Task 2).
2. Lô cuối không đủ `lo` phần tử (230 không chia hết cho 8) → khẳng định danh sách tên bắt hụt (Task 1), đột biến bỏ lô cuối (Task 2).
3. Ca khác vô tình chạy song song → ca `theo-lo` đo số lượt cùng lúc (Task 1) + soát chỗ gọi (Task 2).
4. Thước thời gian xanh giả khi junit không có ca hoặc `-t` lọc nhầm → E1 khẳng định đủ 18 testcase và `khoa-con-bat` có mặt đúng một lần (Task 2).
5. Bản sao đột biến không tìm được chuỗi đích mà vẫn báo xanh → mã 2 gọi tên đột biến (Task 2).

---

### Task 1: Ma trận của `khoa-con-bat` chạy theo lô

independent: false · phục vụ E1, E2, E3, E5

**Files:**
- Modify: `apps/api/test/go-la-cat-quyen.spec.ts`

**Interfaces:**
- Produces: `theoLo<T, R>(ds: readonly T[], fn: (x: T) => Promise<R>, lo = 1): Promise<R[]>`; `maTranTrpc(dau: Dau, lo?: number)`; `maTranRest(dau: Dau, lo?: number)`; `tenDuong(d: { path: string; method: string }): string`; hằng `LO_SONG_SONG = 8`, `POOL_PG = 10`, `SO_PHAN_TU_GIA = 40`.

- [ ] **Step 1: Thêm ca `theo-lo` (ngoài `describe`, không cần dữ liệu) — đỏ vì `theoLo` chưa có**

```ts
async function luotCungLuc(lo?: number) {
	const ds = Array.from({ length: SO_PHAN_TU_GIA }, (_, i) => i);
	let dangChay = 0;
	let lonNhat = 0;
	const kq = await theoLo(
		ds,
		async (x) => {
			dangChay += 1;
			lonNhat = Math.max(lonNhat, dangChay);
			await Bun.sleep(1);
			dangChay -= 1;
			return x;
		},
		lo,
	);
	return { ds, kq, lonNhat };
}

test("theo-lo: bo chia lo mac dinh chay tung luot, LO_SONG_SONG chay dung so luot da khai", async () => {
	const tuanTu = await luotCungLuc();
	expect(tuanTu.lonNhat, "bo chia lo mac dinh chay nhieu hon mot luot").toBe(1);
	expect(tuanTu.kq, "bo chia lo mac dinh lech thu tu").toEqual(tuanTu.ds);
	const songSong = await luotCungLuc(LO_SONG_SONG);
	expect(songSong.lonNhat, "bo chia lo khong chay dung LO_SONG_SONG luot cung luc").toBe(LO_SONG_SONG);
	expect(songSong.kq, "bo chia lo song song lech thu tu").toEqual(songSong.ds);
	expect(LO_SONG_SONG, "LO_SONG_SONG lan vao pool pg").toBeLessThanOrEqual(POOL_PG - 2);
});
```

Run: `bun run test -- "cd apps/api && bun test --preload ./test/setup.ts test/go-la-cat-quyen.spec.ts -t theo-lo"` → FAIL (`theoLo` is not defined).

- [ ] **Step 2: Thêm `theoLo`, hằng, tham số `lo` cho hai ma trận**

```ts
async function theoLo<T, R>(ds: readonly T[], fn: (x: T) => Promise<R>, lo = 1): Promise<R[]> {
	const kq: R[] = [];
	for (let dau = 0; dau < ds.length; dau += lo) {
		kq.push(...(await Promise.all(ds.slice(dau, dau + lo).map(fn))));
	}
	return kq;
}
```

`maTranTrpc(dau, lo?)` → `theoLo(soThuTuc(), async ({ ten, loai }) => ({ ten, status, message }), lo)`; `maTranRest(dau, lo?)` → `theoLo(duongRest(), async (d) => ({ ten: tenDuong(d), … }), lo)`.

- [ ] **Step 3: `khoa-con-bat` gọi với `LO_SONG_SONG` và khẳng định danh sách**

```ts
const hangTrpc = await maTranTrpc(dau, LO_SONG_SONG);
expect(hangTrpc.map((h) => h.ten), "ma tran tRPC song song lech danh sach thu tuc").toEqual(soThuTuc().map((t) => t.ten));
expect(hangLot(hangTrpc, laNgoaiLeTrpc), "tRPC: khoa con bat cua nguoi ngoai van qua duoc").toEqual([]);
const rest = await maTranRest(dau, LO_SONG_SONG);
expect(rest.length, "ma tran REST rong hoac qua it").toBeGreaterThanOrEqual(SAN_DUONG_REST);
expect(rest.map((h) => h.ten), "ma tran REST song song lech danh sach duong").toEqual(duongRest().map(tenDuong));
expect(hangLot(rest, laNgoaiLeRest), "REST: khoa con bat cua nguoi ngoai van qua duoc").toEqual([]);
```

- [ ] **Step 4: Verify** — `-t theo-lo` và `-t khoa-con-bat` xanh; cả tệp xanh; `bun run check-types`, `bun run lint`, `bun run lint:slop`.
- [ ] **Step 5: Commit** `test(api): hai ma trận của khoa-con-bat chạy theo lô 8 lượt`

### Task 2: Thước đo của hồ sơ

independent: false (đọc tệp của Task 1) · phục vụ E1–E5

**Files:**
- Create: `_acceptance/khoa-con-bat-xa-tran/rang/chung.mjs` — `GOC`, `API`, `SPEC`, `dbCuaLuot()`, `giuKhoa()`, `envCi()`, `dungBanSao(noiDung, ten)`, `chayBunTest(tep, thamSo)`, `quetLoiGoiTest(noiDung)`.
- Create: `rang/do-thoi-gian.mjs` (E1, `--luot`, `--ban-sha`), `rang/pha-thu.mjs` (`lech-hang` E2, `con-thanh-vien` E3, `bo-qua-lo` E5-1), `rang/soi-tep.mjs` (`khong-noi-tran` E4, `tuan-tu` E5-2).
- Modify: `_acceptance/config.yaml` — sáu khoá `kcb_*` dưới `executors.script` (chỉ dòng của hồ sơ này).

Khoá config:

```yaml
    kcb_thoi_gian: 'bun run test -- "bun _acceptance/khoa-con-bat-xa-tran/rang/do-thoi-gian.mjs"'
    kcb_lech_hang: 'bun run test -- "bun _acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs lech-hang"'
    kcb_con_thanh_vien: 'bun run test -- "bun _acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs con-thanh-vien"'
    kcb_khong_noi_tran: "bun _acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs khong-noi-tran"
    kcb_tuan_tu: 'bun run test -- "bun _acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs bo-qua-lo && bun _acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs tuan-tu"'
```

Đột biến (chuỗi đích phải xuất hiện đúng một lần, không thì mã 2):

| Nhóm | Đột biến | Tìm → thay | Lọc | Thông điệp ghim |
|---|---|---|---|---|
| lech-hang | bo-lo-cuoi | `dau < ds.length;` → `dau + lo < ds.length;` | khoa-con-bat | ma tran tRPC song song lech danh sach thu tuc |
| lech-hang | dao-thu-tu | `.map(fn))));` → `.map(fn))).reverse());` | khoa-con-bat | ma tran tRPC song song lech danh sach thu tuc |
| lech-hang | rest-bo-dau | `theoLo(\n\t\tduongRest(),` → `theoLo(\n\t\tduongRest().slice(1),` | khoa-con-bat | ma tran REST song song lech danh sach duong |
| con-thanh-vien | con-thanh-vien | dòng `await db.member.delete({ where: { id: await memberId(bi) } });` trong khoa-con-bat → bỏ | khoa-con-bat | tRPC: khoa con bat cua nguoi ngoai van qua duoc |
| bo-qua-lo | bo-qua-lo | `for (let dau = 0; dau < ds.length; dau += lo)` → `for (let dau = 0, lo = ds.length; dau < ds.length; dau += lo)` | theo-lo | bo chia lo mac dinh chay nhieu hon mot luot |

(Chuỗi đích chốt theo mã thật sau Task 1 — bảng trên là ý định; `pha-thu.mjs` là nguồn.)

- [ ] **Step 1:** Viết `chung.mjs`; thử `dungBanSao` với bản nguyên vẹn, `-t khoa-con-bat` → mã 0 (chứng bản sao ngoài gói chạy được).
- [ ] **Step 2:** Viết `pha-thu.mjs`; chạy ba nhóm → mã 0 (đối chứng xanh, đột biến đỏ đúng thông điệp).
- [ ] **Step 3:** Viết `soi-tep.mjs`; chạy hai nhóm → mã 0, in số lời gọi 18 và 6, hai lần tự kiểm bắt đúng.
- [ ] **Step 4:** Viết `do-thoi-gian.mjs`; chạy trên cây → mã 0 10/10; chạy `--ban-sha 679432a0` → mã 1 với thông điệp ghim. Ghi kết quả chiều đỏ vào `_acceptance/khoa-con-bat-xa-tran/evidence/pha-thu.md`.
- [ ] **Step 5:** Thêm khoá config; commit `acceptance(khoa-con-bat-xa-tran): thước đo`.

### Task 3: Năm lệnh chứng và chuyển S4

independent: false

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop` (nhẹ, tự chạy). `bun run test` + `bun run build` là làn nặng — chạy trong S4 sau khi phiên điều phối cấp lượt.
- [ ] Contract `status: implemented`, commit, xin lượt S4.
