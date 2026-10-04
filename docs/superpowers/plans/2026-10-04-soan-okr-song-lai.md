# Soạn OKR khi chưa cấu hình — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khi app chưa cấu hình cầu nối OKR thì nút soạn không mời mở cuộc, màn soạn nói thẳng chưa bật, trần chỉ đếm cuộc đã có lượt, và `docs/setup.md` có hướng dẫn dựng `apps/agent-okr` trên Vercel.

**Architecture:** Cờ `okrBridgeConfigured()` sinh ở trang server `okr/theo-don-vi/page.tsx`, đi prop `TheoDonVi(cauNoiOkr?)` → `NutSoan(cauNoi)` → `ManSoan(cauNoi)`; client không import `agent-bridge`. `demCuocTrongKy` thêm `soLuot > 0`. Hằng `CUA_OKR.trangThaiChuaCauHinh` dùng chung cho cửa và bên đọc lỗi.

**Tech Stack:** Next.js App Router, React 19, tRPC + TanStack Query, NestJS (API), Prisma, bun test + jsdom (`packages/ui/test/setup-dom.ts`), eve client (`eve/client`, `eve/react`), puppeteer-core cho màn thật.

**Spec:** `docs/superpowers/specs/2026-10-04-soan-okr-song-lai-design.md` · hợp đồng `_acceptance/soan-okr-song-lai/contract.md` · evals `_acceptance/soan-okr-song-lai/evals.yaml`.

## Global Constraints

- Không chú thích trong code (AGENTS.md «Never add code comments»).
- Tệp `"use client"` chỉ import `@crm/ui`, tRPC client, React; không import `@/lib/agent-bridge`.
- Chữ mới qua `apps/app/lib/messages/okr-soan.ts`, vi + en; câu: vi «Tính năng soạn nháp chưa được bật trên máy chủ này — quản trị viên OneHub cần bật nó.» · en «Drafting isn't turned on for this server yet — a OneHub admin needs to turn it on.»
- Thành phần UI từ `@crm/ui` (`Empty`, `Alert`, `Field`, `FieldDescription`, `Button`); không `className` đổi màu/góc.
- Lệnh chạy test theo `_acceptance/config.yaml` (`sol_*`, `soan_tran`, `soan_man_trang_thai`); Bun 1.3.12 (`PATH="$(brew --prefix bun@1.3.12)/bin:$PATH"`); DOM test một tệp một tiến trình, kèm `TZ=Asia/Ho_Chi_Minh`.
- Mọi phép đo mới có cặp hai chiều trên cùng fixture với thông điệp ghim (MEASURE-BIRTH-CLAUSE) — lượt phá-thử chạy trên bản sao trong `.acceptance-runs/soan-okr-song-lai/`, không `git checkout` tại chỗ.

## Review Focus

1. Ô kết quả hôm nay KHÔNG có nút (lưu trữ, chưa bật, ẩn với người thường) phải vẫn không có nút khi chưa cấu hình — không được hiện nút khoá ở đó. → Task 4 ma trận E1 (vế «không có nút»).
2. Cuộc `dang` 0 lượt khi chưa cấu hình: không «Tiếp tục cuộc đang soạn», không nút danh sách cuộc. → Task 4 ô «nấc bật có cuộc đang».
3. Mở `?cuocSoan=` khi chưa cấu hình không được gửi lượt mở đầu tự động (`useMountEffect` của `useCuocSoan`). → Task 4 E3 (đếm `daGui` = 0, `soLanMoAgent` = 0).
4. Cửa trả 503 mã khác `chua-cau-hinh` vẫn ra «Thử lại» như cũ — không nuốt mọi 503. → Task 3 E4 ca đối chứng.
5. Trần với cuộc `dang` đang mở: `soanMo` vẫn trả `con-cuoc-dang`, không mở cuộc thứ hai. → Task 2 ô riêng.

---

### Task 1: Trần chỉ đếm cuộc đã có lượt (db)

**Evals phục vụ:** E5 (AC-4). **independent:** false (Task 2 dùng).

**Files:**
- Modify: `packages/db/src/okr-cuoc-soan.ts:171-176`
- Test: `packages/db/test/okr-cuoc-soan.spec.ts` (sửa ca «đếm mọi trạng thái», thêm describe `dem-co-luot`)

**Interfaces:**
- Produces: `demCuocTrongKy(db, v): Promise<number>` — đếm hàng `okrCuocSoan` của đơn vị/kỳ có `soLuot > 0`.

- [ ] **Step 1: Viết test đỏ** — trong `okr-cuoc-soan.spec.ts`, import thêm `tangLuot`; thêm:

```ts
describe("okr-cuoc-soan: dem-co-luot", () => {
	const MA_TRAN = [0, 1, 2, 3].flatMap((k) => [0, 3].map((z) => ({ k, z })));
	async function gieo(pb: string, k: number, z: number) {
		for (let i = 0; i < k; i += 1) {
			const c = await mo(`${pb}-k${i}`, { departmentId: id(pb) });
			await tangLuot(db, c.id);
			await doi(c.id, i % 2 === 0 ? "da-dua-vao" : "bo");
		}
		for (let i = 0; i < z; i += 1) {
			const c = await mo(`${pb}-z${i}`, { departmentId: id(pb) });
			await doi(c.id, "bo");
		}
	}
	for (const { k, z } of MA_TRAN) {
		test(`dem-co-luot: k=${k} z=${z}`, async () => {
			const pb = `pb-dcl-${k}-${z}`;
			await gieo(pb, k, z);
			await mo(`${pb}-khac-ky`, { departmentId: id(pb), cycleId: id("ky2") }).then((c) => tangLuot(db, c.id));
			expect(await demCuocTrongKy(db, dv(id(pb))), `dem ca cuoc rong: k=${k} z=${z}`).toBe(k);
		});
	}
	test("dem-co-luot: dang 0 luot voi k=3", async () => {
		const pb = "pb-dcl-dang-rong";
		await gieo(pb, 3, 0);
		await mo(`${pb}-dang`, { departmentId: id(pb) });
		expect(await demCuocTrongKy(db, dv(id(pb))), "dem ca cuoc rong: k=3 dang-rong").toBe(3);
	});
	test("dem-co-luot: dang co luot voi k=2", async () => {
		const pb = "pb-dcl-dang-luot";
		await gieo(pb, 2, 0);
		const c = await mo(`${pb}-dang`, { departmentId: id(pb) });
		await tangLuot(db, c.id);
		expect(await demCuocTrongKy(db, dv(id(pb))), "dem ca cuoc rong: k=3 dang-luot").toBe(3);
	});
});
```

Sửa ca cũ «demCuocTrongKy: 0 khi chưa có; đếm mọi trạng thái…»: đổi tên thành «…đếm mọi trạng thái của cuộc đã có lượt…», gọi `tangLuot(db, x.id)` trên `dem-a`, `dem-b`, `dem-c`, `dem-khac-dv`, `dem-khac-ky` TRƯỚC `doi(...)`; kỳ vọng giữ 3 và 1; thêm một cuộc `dem-rong` 0 lượt cùng đơn vị → vẫn 3.

- [ ] **Step 2: Chạy, thấy đỏ** — `bun run test -- "cd packages/db && bun test test/okr-cuoc-soan.spec.ts -t dem-co-luot"` → FAIL `dem ca cuoc rong: k=0 z=3` (đếm ra 3).
- [ ] **Step 3: Sửa** `demCuocTrongKy`: `return db.okrCuocSoan.count({ where: { ...dieuKienDonVi(v), soLuot: { gt: 0 } } });`
- [ ] **Step 4: Chạy lại** cùng lệnh → PASS 10 ca; chạy cả tệp → PASS.
- [ ] **Step 5: Phá-thử** — bản sao `packages/db/src/okr-cuoc-soan.ts` trong `.acceptance-runs/soan-okr-song-lai/pha-dem/` bỏ `soLuot` → chạy lệnh E5 trỏ bản sao (đổi tạm import qua biến môi trường không có → dùng `sed` trên bản sao cây git worktree tạm) → thấy `dem ca cuoc rong: k=0 z=3`; xoá bản sao.
- [ ] **Step 6: Commit** `fix(soan-okr-song-lai): trần cuộc soạn chỉ đếm cuộc đã có lượt`.

### Task 2: API — ma trận trần và sửa bài đã ký E9

**Evals phục vụ:** E6 (AC-4), E9 (AC-5). **independent:** false (sau Task 1).

**Files:**
- Modify: `apps/api/test/soan-okr-tran.spec.ts` (ca `cuoc-ky` + describe mới `cuoc-rong-khong-tinh`)

**Interfaces:**
- Consumes: `demCuocTrongKy` (Task 1), `tangLuot` từ `@crm/db/okr-cuoc-soan`.

- [ ] **Step 1: Sửa ca `cuoc-ky`** — `da` đếm bằng `db.okrCuocSoan.count({ where: { departmentId, soLuot: { gt: 0 } } })`; trong vòng mở, sau `mo()` gọi `await tangLuot(db, id)` rồi mới `update trangThai: "bo"`. Kỳ vọng giữ nguyên.
- [ ] **Step 2: Viết test đỏ `cuoc-rong-khong-tinh`** — một hàm `gieoMaTran(k, z)` mở qua `mo()` (tRPC thật), `tangLuot` cho k cuộc rồi đóng (`da-dua-vao`/`bo` xen kẽ), z cuộc rỗng đóng `bo`; với mỗi ô `{k,z}` của `[0..3]×[0,3]`:

```ts
const truoc = await db.okrCuocSoan.findMany({ where: { departmentId }, select: { id: true } });
const s = await sanSang();
expect(s.bat ? s.soCuocDaDung : TRAN, `so cuoc da dung: k=${k} z=${z}`).toBe(k);
const kq = await mo();
if (k >= TRAN) expect(kq, `het cuoc khi chi co cuoc rong: z=${z}`).toEqual({ ok: false, lyDo: "het-cuoc-ky", cuocDang: null });
else {
	expect(kq.ok, `het cuoc khi chi co cuoc rong: z=${z}`).toBe(true);
	expect(truoc.map((x) => x.id)).not.toContain(kq.ok ? kq.cuoc.id : "");
	expect(await db.okrCuocSoan.count({ where: { departmentId } })).toBe(truoc.length + 1);
}
```

cộng hai ô `dang`: (k=3, một cuộc `dang` 0 lượt) và (k=2, một cuộc `dang` có lượt) → `sanSang().cuocDang?.id` bằng id đó và `mo()` trả `{ ok: false, lyDo: "con-cuoc-dang" }` (so `toMatchObject`); và ô «phòng ban khác mở được» ở k = TRAN. Dọn `deleteMany` mỗi ô.
- [ ] **Step 3: Chạy trên code cũ (stash Task 1 bằng bản sao)** → thấy đỏ `het cuoc khi chi co cuoc rong: z=3`; trên HEAD (có Task 1) → PASS. Lệnh: `bun run test -- "cd apps/api && bun test test/soan-okr-tran.spec.ts"`.
- [ ] **Step 4: Commit** `test(soan-okr-song-lai): trần cuộc soạn theo ma trận lượt × cuộc rỗng; sửa ca cuoc-ky đã ký`.

### Task 3: Lỗi «chưa cấu hình» của cửa — hằng, bên đọc, chữ

**Evals phục vụ:** E4 (AC-3). **independent:** false (Task 4 dùng chữ).

**Files:**
- Modify: `apps/app/lib/cua-okr-config.ts` (thêm `trangThaiChuaCauHinh: 503`)
- Modify: `apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts:32` (`loi(CUA_OKR.trangThaiChuaCauHinh, CUA_OKR.loi.chuaCauHinh)`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/loi-cua.ts` (thêm `laChuaCauHinh`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts` (cờ `chuaCauHinh`; `hong` loại nó; `khoaSoan` gồm nó)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx` (Alert `data-tu-choi="chua-cau-hinh"`)
- Modify: `apps/app/lib/messages/okr-soan.ts` (`nut.chuaCauHinh` vi + en)
- Test: `apps/app/test/soan-okr-song-lai.dom.tsx` (describe `loi-chua-cau-hinh`)

**Interfaces:**
- Produces: `laChuaCauHinh(loi: Error | undefined): boolean`; `CUA_OKR.trangThaiChuaCauHinh`; `m.nut.chuaCauHinh: string`; trường `chuaCauHinh: boolean` trong `CuocDangSoan`.

- [ ] **Step 1: Test đỏ** — tệp mới `apps/app/test/soan-okr-song-lai.dom.tsx` dùng `khung-soan-okr.tsx`:

```ts
import { ClientError } from "eve/client";
import { CUA_OKR } from "@/lib/cua-okr-config";
async function loiCua(status: number, ma: string) {
	const r = Response.json({ error: ma }, { status });
	return new ClientError(r.status, await r.text(), r.headers);
}
describe("loi-chua-cau-hinh", () => {
	test("loi-chua-cau-hinh: 503 chua-cau-hinh -> cau chua bat, khong Thu lai", async () => {
		await datAgent({ status: "error", error: await loiCua(CUA_OKR.trangThaiChuaCauHinh, CUA_OKR.loi.chuaCauHinh) });
		await moMan();
		expect(chu('[data-tu-choi="chua-cau-hinh"]'), "loi chua cau hinh hien chu chung").toBe(m.nut.chuaCauHinh);
		expect(q('[data-nut="thu-lai"]')).toBeNull();
		expect(q('[data-luot="loi"]')).toBeNull();
	});
	test("loi-chua-cau-hinh: 503 ma khac -> chu chung, co Thu lai", …baoLoi(503,"khac") → q('[data-luot="loi"]') not null, q('[data-nut="thu-lai"]') not null);
	test("loi-chua-cau-hinh: loi mang khong status -> nhu hom nay", …new Error("fetch failed") → q('[data-luot="loi"]') not null);
	test("loi-chua-cau-hinh: 401 chua-dang-nhap -> nhu hom nay", …loiCua(401, CUA_OKR.loi.chuaDangNhap) → không data-tu-choi="chua-cau-hinh");
	test("loi-chua-cau-hinh: route tra dung hang", () => { const nguon = readFileSync(<route.ts>, "utf8"); expect(nguon).toContain("loi(CUA_OKR.trangThaiChuaCauHinh, CUA_OKR.loi.chuaCauHinh)"); });
});
```

- [ ] **Step 2: Chạy** `config:executors.test.sol_loi_dom` → FAIL (thiếu `trangThaiChuaCauHinh`, `nut.chuaCauHinh`).
- [ ] **Step 3: Cài** — `loi-cua.ts`:

```ts
export function laChuaCauHinh(loi: Error | undefined): boolean {
	const http = loiHttp.safeParse(loi);
	return (
		http.success &&
		http.data.status === CUA_OKR.trangThaiChuaCauHinh &&
		http.data.body.error === CUA_OKR.loi.chuaCauHinh
	);
}
```

`dung-cuoc-soan.ts`: `const chuaCauHinh = agent.status === "error" && laChuaCauHinh(agent.error);` ; `hong = lyDoLuot === null && !chuaCauHinh && …` ; `khoaSoan = … || chuaCauHinh`; trả `chuaCauHinh` trong object. `hoi-thoai-soan.tsx` sau khối `s.lyDoLuot`: `{s.chuaCauHinh ? (<Alert role="alert" data-tu-choi="chua-cau-hinh"><AlertTitle>{m.nut.chuaCauHinh}</AlertTitle></Alert>) : null}`. Messages: thêm `chuaCauHinh` vào `nut` của `vi` và `en` (câu ở Global Constraints).
- [ ] **Step 4: Chạy** `sol_loi_dom` → PASS 5; chạy `cd apps/app && bun test test/messages-guard.spec.ts` → PASS (thêm ghim nếu guard đòi); chạy `cd apps/app && bun test test/cua-okr.spec.ts` → PASS.
- [ ] **Step 5: Phá-thử** bản sao bỏ nhánh `chuaCauHinh` trong `hong` → `loi chua cau hinh hien chu chung`.
- [ ] **Step 6: Commit** `feat(soan-okr-song-lai): cửa nói thẳng chưa cấu hình thay vì lỗi chung`.

### Task 4: Cờ cầu nối từ trang server tới nút và màn soạn

**Evals phục vụ:** E1, E2 (AC-1), E3 (AC-2), E7 (AC-4), E8 (AC-5). **independent:** false.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx` (`<TheoDonVi cauNoiOkr={okrBridgeConfigured()} />`)
- Modify: `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx` (`TheoDonVi({ cauNoiOkr = false }: { cauNoiOkr?: boolean })`, truyền `cauNoi={cauNoiOkr}` cho `NutSoan`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx` (prop `cauNoi: boolean`; `export const HINH_NUT_TAT`; hình `nut-chua-cau-hinh`; truyền `cauNoi` cho `ManSoan`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/man-soan.tsx` (prop `cauNoi: boolean`; thân `ChuaCauHinh` dùng `Empty`)
- Modify: `apps/app/test/khung-soan-okr.tsx` (`moMan` truyền `cauNoi`; `TuyChonKhung.cauNoi?: boolean` mặc định `true`; `<TheoDonVi cauNoiOkr={cauNoi} />`)
- Test: `apps/app/test/soan-okr-song-lai.dom.tsx` (describe `nut-chua-cau-hinh`, `man-chua-cau-hinh`), `apps/app/test/soan-okr-song-lai.spec.ts` (nguồn + `okrBridgeConfigured`)

**Interfaces:**
- Consumes: `m.nut.chuaCauHinh` (Task 3).
- Produces: `NutSoan({ …, cauNoi })`, `ManSoan({ …, cauNoi })`, `TheoDonVi({ cauNoiOkr? })`, `export const HINH_NUT_TAT`.

- [ ] **Step 1: Test đỏ E1/E7** — trong `soan-okr-song-lai.dom.tsx`:

```ts
const BAT = [
	["bat-thuong", SAN_SANG_BAT],
	["bat-co-cuoc-dang", { ...SAN_SANG_BAT, cuocDang: CUOC, soCuocDaDung: 1 }],
	["nac-an", { ...SAN_SANG_BAT, nac: "an" as const }],
] as const;
const MA = Object.keys(HINH_NUT_TAT);
describe("nut-chua-cau-hinh", () => {
	test("nut-chua-cau-hinh: bang nut bang tap ma ly do", () => {
		expect(MA.sort(), `bang nut lech union: ${MA}`).toEqual(Object.keys(m.lyDo).sort());
	});
	const O = [...MA.map((lyDo) => [lyDo, { bat: false as const, lyDo }] as const), ...BAT].flatMap(([ten, s]) => [false, true].map((quanTri) => ({ ten, s, quanTri })));
	test("nut-chua-cau-hinh: ma tran du o", () => { if (O.length < 22) throw new Error("ma tran rong"); });
	for (const { ten, s, quanTri } of O) {
		test(`nut-chua-cau-hinh: ${ten} ${quanTri ? "quan-tri" : "nguoi-sua"}`, async () => {
			await moKhung(DON_PB1, { sanSang: s, quanTri, cauNoi: true });
			const homNayCo = q("[data-nut-soan]") !== null;
			await don();
			await moKhung(DON_PB1, { sanSang: s, quanTri, cauNoi: false });
			const co = qa("[data-nut-soan]").map((o) => o.getAttribute("data-nut-soan"));
			if (!homNayCo) { expect(co, `nut mo khi chua cau hinh: ${ten}`).toEqual([]); return; }
			expect(co, `nut mo khi chua cau hinh: ${ten}`).toEqual(["nut-chua-cau-hinh"]);
			const n = q('[data-nut-soan="nut-chua-cau-hinh"] button');
			expect(n?.hasAttribute("disabled")).toBe(true);
			expect(document.getElementById(n?.getAttribute("aria-describedby") ?? "")?.textContent).toBe(m.nut.chuaCauHinh);
			expect(document.body.textContent).not.toContain(m.nut.tiep);
			expect(q('[data-nut="ds-cuoc"]')).toBeNull();
			expect(goiCua("okr.soanMo").length).toBe(0);
		});
	}
	test("nut-chua-cau-hinh: doi chung duong — cauNoi=true bam nut goi soanMo 1 lan", …moKhung(..., {sanSang: SAN_SANG_BAT, cauNoi: true}); dat("okr.soanMo", () => ({ ok: true, cuoc: CUOC })); await bam(nut(m.nut.soan)); expect(goiCua("okr.soanMo").length).toBe(1));
	for (const k of [0, 1, 2, 3]) test(`nut-chua-cau-hinh — so cuoc: k=${k}`, …sanSang {…SAN_SANG_BAT, soCuocDaDung: k}, cauNoi true → k===0 ? q('[data-nut="ds-cuoc"]') null : chu('[data-nut="ds-cuoc"]') === m.nut.dsCuoc(String(k), "3") với thông điệp `so cuoc tren nut lech: ${k}`);
});
```

(`moKhung` dùng `mo(...)` → gọi `don()` giữa hai lần mở để gỡ cây cũ; `goiCua` đếm lời gọi đã ghi.)

- [ ] **Step 2: Test đỏ E3** — describe `man-chua-cau-hinh`:

```ts
test("man-chua-cau-hinh: cuoc dang 0 luot, cauNoi=false -> empty, khong mo phien", async () => {
	datDanhSach({ cuoc: { ...CUOC, soLuot: 0 } });
	await moMan(false, false);
	expect(chu("[data-man-chua-cau-hinh] [data-slot='empty-title']") ?? chu("[data-man-chua-cau-hinh]")).toContain(m.nut.chuaCauHinh);
	expect(q("textarea"), "man mo phien khi chua cau hinh").toBeNull();
	expect(soLanMoAgent, "man mo phien khi chua cau hinh").toBe(0);
	expect(daGui).toEqual([]);
	expect(daTaiLuong).toEqual([]);
});
test("man-chua-cau-hinh: doi chung duong cauNoi=true -> co o soan va gui luot mo dau", …moMan(false, true) → q("textarea") not null, soLanMoAgent ≥ 1, daGui chứa MO_DAU);
```

(`moMan(quanTri = false, cauNoi = true)` — tham số mới trong khung.)

- [ ] **Step 3: Test đỏ E2** — `apps/app/test/soan-okr-song-lai.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Glob } from "bun";
const APP = join(import.meta.dir, "..");
const doc = (p: string) => readFileSync(join(APP, p), "utf8");
describe("cau-noi-server", () => {
	test("trang server tinh co va truyen xuong", () => {
		const page = doc("app/(app)/[slug]/okr/theo-don-vi/page.tsx");
		expect(page).toMatch(/import \{[^}]*okrBridgeConfigured[^}]*\} from "@\/lib\/agent-bridge"/);
		expect(page).toMatch(/<TheoDonVi cauNoiOkr=\{okrBridgeConfigured\(\)\} \/>/);
		expect(doc("app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx")).toMatch(/<NutSoan[\s\S]*?cauNoi=\{cauNoiOkr\}/);
		expect(doc("app/(app)/[slug]/okr/soan/nut-soan.tsx"), "man soan khong nhan co cau noi").toMatch(/<ManSoan[\s\S]*?cauNoi=\{cauNoi\}/);
	});
	test("khong tep client nao import agent-bridge", () => {
		const lo: string[] = [];
		for (const f of new Glob("**/*.{ts,tsx}").scanSync({ cwd: APP })) {
			if (f.includes("node_modules") || f.startsWith("test/")) continue;
			const s = doc(f);
			if (/^\s*["']use client["']/.test(s) && /@\/lib\/agent-bridge/.test(s)) lo.push(f);
		}
		expect(lo, `client import agent-bridge: ${lo.join(", ")}`).toEqual([]);
	});
	test("okrBridgeConfigured theo bi mat", async () => { … đặt process.env.OKR_AGENT_BRIDGE_SECRET = "" / "  " / "k" rồi import lại lib/agent-bridge (đọc lúc gọi) → false, false, true; trả env cũ });
	test("bo phat hien client import that su do", () => { … quét thêm một chuỗi fixture '"use client";\nimport { x } from "@/lib/agent-bridge";' bằng cùng regex → bắt được (đối chứng dương cho regex) });
});
```

- [ ] **Step 4: Chạy** `sol_nut_dom`, `sol_man_dom`, `sol_cau_noi_server` → FAIL (prop chưa có).
- [ ] **Step 5: Cài** — `nut-soan.tsx`:
  - `export const HINH_NUT_TAT = { … }` (giữ nguyên nội dung).
  - `type HinhNutTat = "nut-het-cuoc" | "nut-het-tran" | "nut-chua-khoa" | "nut-chua-cau-hinh";`
  - `NutSoan({ …, cauNoi }: { …; cauNoi: boolean })`; sau khi tính `nut` theo `s` như hôm nay, nếu `!cauNoi && nut !== null` thì `nut = <NutTat hinh="nut-chua-cau-hinh" m={m} moTa={m.nut.chuaCauHinh} />`; `ds` không dựng khi `!cauNoi`; `<ManSoan … cauNoi={cauNoi} />`.
  - `man-soan.tsx`: `ManSoan({ …, cauNoi }: { …; cauNoi: boolean })`; thân: `dangMo ? <DangMo/> : !cauNoi ? <ChuaCauHinh m={m}/> : du ? <ThanCuoc…/> : <KhongMo…/>` với
    ```tsx
    function ChuaCauHinh({ m }: { m: OkrSoanMessages }) {
    	return (
    		<SheetBody data-man-chua-cau-hinh>
    			<Empty>
    				<EmptyHeader>
    					<EmptyTitle>{m.nut.chuaCauHinh}</EmptyTitle>
    				</EmptyHeader>
    			</Empty>
    		</SheetBody>
    	);
    }
    ```
    (`Empty`, `EmptyHeader`, `EmptyTitle` từ `@crm/ui/components/empty`.)
  - `theo-don-vi.tsx`: chữ ký và truyền prop; `page.tsx`: import `okrBridgeConfigured` từ `@/lib/agent-bridge`, `<TheoDonVi cauNoiOkr={okrBridgeConfigured()} />`.
  - `khung-soan-okr.tsx`: `moMan(quanTri = false, cauNoi = true)` truyền `cauNoi`; `TuyChonKhung` thêm `cauNoi?: boolean` (mặc định `true`), `mo(<TheoDonVi cauNoiOkr={cauNoi} />, …)`.
- [ ] **Step 6: Chạy** ba lệnh trên → PASS; `soan_man_trang_thai` (bài đã ký E12) → PASS; `cd apps/app && bun run check-types` → 0 lỗi.
- [ ] **Step 7: Phá-thử** — bản sao `nut-soan.tsx` bỏ nhánh `!cauNoi` → `nut mo khi chua cau hinh: …`; bản sao `man-soan.tsx` bỏ nhánh `ChuaCauHinh` → `man mo phien khi chua cau hinh`; bản sao `nut-soan.tsx` bỏ `cauNoi={cauNoi}` ở ManSoan → E2 `man soan khong nhan co cau noi`.
- [ ] **Step 8: Commit** `feat(soan-okr-song-lai): nút và màn soạn nói thẳng khi chưa cấu hình cầu nối`.

### Task 5: Hướng dẫn dựng `apps/agent-okr` và bài kiểm mục

**Evals phục vụ:** E10 (AC-6). **independent:** true.

**Files:**
- Modify: `docs/setup.md` (mục mới sau «The agent bridge»)
- Create: `_acceptance/soan-okr-song-lai/rang/huong-dan-trien-khai.mjs`

- [ ] **Step 1: Viết bài** `huong-dan-trien-khai.mjs` (Node, không phụ thuộc): suy gốc kho từ `import.meta.url` (`../../..`); đọc `docs/setup.md`; cắt từ dòng `## Deploying \`apps/agent-okr\` to Vercel` tới `## ` kế; vắng → in `SAI thieu muc huong dan`, mã 1. Khẳng định chứa `apps/agent-okr`, `Framework`, `Build Command`, `Node`; rút `tasks.dev.passThroughEnv` từ `apps/agent-okr/turbo.json` (JSON.parse); rút biến trong bảng của mục bằng `/\|\s*`([A-Z][A-Z0-9_]+)`\s*\|/g` ở cột đầu, chỉ các dòng dưới tiêu đề «agent-okr project»; so tập: in `SAI thieu bien: X` / `SAI thua bien: X`; khẳng định có `OKR_AGENT_URL`, `OKR_AGENT_BRIDGE_SECRET` trong bảng «app project» và chuỗi «same value»; khẳng định có `/health`. Cờ `--kiem-do-do`: chạy lại phép đo trên bản sao chuỗi mục đã xoá dòng `DATABASE_URL`, phải in `thieu bien: DATABASE_URL` và mã 1, ngược lại in `SAI chieu do khong do` mã 2. In `DUNG`/`SAI` từng dòng, cuối `N DUNG, M SAI`.
- [ ] **Step 2: Chạy** → FAIL `thieu muc huong dan`.
- [ ] **Step 3: Viết mục** trong `docs/setup.md`: tiêu đề `## Deploying \`apps/agent-okr\` to Vercel`; đoạn vì sao (cửa 503 khi thiếu); bảng «Project settings» (Root Directory `apps/agent-okr`, Framework preset Other, Build Command `bun run build`, Node 24.x — mẫu `crm-onehub-agent`); bảng «agent-okr project» với đúng `OKR_AGENT_BRIDGE_SECRET`, `AI_GATEWAY_API_KEY`, `OKR_AI_GATEWAY_API_KEY`, `DATABASE_URL` và một câu mỗi biến; bảng «app project» với `OKR_AGENT_URL` (URL production của dự án mới) và `OKR_AGENT_BRIDGE_SECRET` («same value as the agent-okr project; `openssl rand -base64 32`»); bước kiểm `GET <OKR_AGENT_URL>/health` trả `cay`, rồi nút soạn ở «By unit» mở được; một câu: tạo dự án và đặt khoá là việc của chủ kho.
- [ ] **Step 4: Chạy** → `DUNG` hết, mã 0; `--kiem-do-do` → mã 1 với `thieu bien: DATABASE_URL`.
- [ ] **Step 5: Commit** `docs(soan-okr-song-lai): hướng dẫn dựng apps/agent-okr trên Vercel`.

### Task 6: Phép đo màn thật và sàn thiết kế

**Evals phục vụ:** E11 (AC-7), E13 (AC-2), E12 (AC-7). **independent:** false (sau Task 3–4).

**Files:**
- Create: `_acceptance/soan-okr-song-lai/rang/man-chua-cau-hinh.mjs`

- [ ] **Step 1: Viết** theo mẫu `_acceptance/gop-y-dung-cho/rang/man-gop-y.mjs` và `_acceptance/soan-okr-cung-tro-ly/rang/man-soan.mjs` (đọc trước, dùng lại cảnh cây, đăng nhập `dev:session`, puppeteer-core): seed bằng Prisma — chu kỳ mẫu `phase = lap-ke-hoach`, Chương trình OKR bật soạn cho một phòng ban (đường ghi thật như `san-thiet-ke.mjs` của soan-okr-cung-tro-ly), một cuộc `dang` 0 lượt (`moCuoc`); đăng nhập trưởng phòng ban. Bước: 1440 → `/okr/theo-don-vi?donOkr=pb:<id>` → chờ `[data-nut-soan]` → innerText chứa câu → ảnh `E11-nut-1440.png` + HTML; mở `?cuocSoan=<id>` → chờ `[data-man-chua-cau-hinh]` → không `textarea` → nghe `page.on("request")` đếm `/eve/agents/okr` = 0 → ảnh `E11-man-1440.png`; đọc `soLuot` qua `okr.soanDanhSachCuoc` cùng cookie = 0 (`DUNG soLuot sau khi mo man: 0`); `tangLuot` thật một lần → đọc lại = 1 (`DUNG soLuot sau tangLuot: 1`); lặp 390 (`E11-nut-390`, `E11-man-390`); tràn ngang: `document.documentElement.scrollWidth <= innerWidth` và vùng cuộn màn soạn. Pha 503: chạy lại app với `OKR_AGENT_BRIDGE_SECRET` giả (biến của lượt), `page.setRequestInterception(true)` trả `Response` 503 `{ error: "chua-cau-hinh-tro-ly-okr" }` cho `/eve/agents/okr`, mở `?cuocSoan=` (cuộc mới 0 lượt) → chờ `[data-tu-choi="chua-cau-hinh"]` → không `[data-nut="thu-lai"]` → ảnh `E11-loi-1440`, `E11-loi-390`. Cờ `--kiem-do-do`: phép đo nút với bí mật giả không chặn mạng → phải in `nut khong khoa khi da cau hinh gia` và mã 1; bỏ bước `tangLuot` mà vẫn đòi 1 → `phep doc soLuot khong nhay`.
- [ ] **Step 2: Chạy** `config:executors.script.sol_man_that` (một lượt `mot-luot.sh`, kiểm cổng 3300 trước) → `N DUNG, 0 SAI`, mã 0; `--kiem-do-do` → mã 1 với thông điệp ghim.
- [ ] **Step 3: Sàn thiết kế** `config:executors.script.sol_san_thiet_ke` → PASS; phá-thử bản sao `nut-soan.tsx` chèn `<p className="bg-blue-600 text-gray-400">x</p>` → REJECT `gray-on-color` mã 2.
- [ ] **Step 4: Commit** `test(soan-okr-song-lai): đo màn thật khi chưa cấu hình và khi cửa từ chối` (kèm ảnh `evidence/` nếu phép đo ghi vào đó).

### Task 7: Năm lệnh của kho

- [ ] `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build` (Bun 1.3.12) — mọi lệnh exit 0; đỏ nào cũng đọc nhật ký trước khi sửa.
