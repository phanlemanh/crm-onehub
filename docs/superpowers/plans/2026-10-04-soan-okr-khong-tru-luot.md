# Soạn OKR không trừ lượt — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lượt soạn không tới được Trợ lý thì cửa hoàn lượt; «Thử lại» luôn nói lý do và đếm số lần thử.

**Architecture:** Cửa `/eve/agents/okr` giữ chỗ lượt như hôm nay rồi hoàn bằng `hoanLuot` (`packages/db`) khi trả một kết quả hỏng; thân lỗi mang `luot: "da-hoan"` chỉ khi đã trừ thật. Phía màn, một hàm thuần `lyDoHong` (`loi-cua.ts`) đọc lỗi phiên thành `{ ma, daHoan }`; `LuotLoi` hiện câu lý do, câu «không bị tính» khi `daHoan`, và «Đã thử lại N lần».

**Tech Stack:** Next.js route handler, Prisma, eve client (`useEveAgent`, `ClientError`), TanStack Query, bun test, jsdom (test:dom), puppeteer qua `mot-luot.sh`.

**Spec:** `docs/superpowers/specs/2026-10-04-soan-okr-khong-tru-luot-design.md`; hợp đồng `_acceptance/soan-okr-khong-tru-luot/contract.md`; evals `_acceptance/soan-okr-khong-tru-luot/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Số có thể chỉnh nằm trong config của khu: `choTroLyMs` ở `CUA_OKR` (`apps/app/lib/cua-okr-config.ts`), dẫn từ một đơn vị gốc.
- Mọi chữ qua `apps/app/lib/messages/okr-soan.ts`, có cả `vi` và `en`; khoá mới ghim ở `apps/app/test/messages-guard.spec.ts`.
- Không useEffect (skill `no-use-effect`); trạng thái dẫn xuất từ dữ liệu sẵn có.
- `/packages/ui` là nguồn duy nhất của giao diện: chỉ dùng `Alert*`, `Button` sẵn có, không className đổi màu/góc.
- Không sửa tệp kiểm của hồ sơ đã ký (`cua-okr.spec.ts`, `okr-cuoc-soan.spec.ts`, `soan-okr-tran.spec.ts`, `soan-okr-song-lai.*`).
- Ranh giới P5: không chạm `nut-soan.tsx`, `nop_ban_nhap.ts`, `packages/validation/src/okr-cuoc-soan.ts`, `schema.prisma`, `apps/agent-okr/**`.
- Bun 1.3.12; lệnh kiểm có kho chạy qua `bun run test -- "…"` (kho `crm_<id>_test` riêng).
- `mock.module` của bun sống qua các tệp trong cùng tiến trình `apps/app bun test`: mọi mock trong tệp mới phải uỷ quyền về hàm thật khi cờ tắt, và chạy hai thứ tự tệp (`--randomize --seed`).

## Review Focus

1. Hai lượt gửi song song ở `soLuot = luotMoiCuoc − 1`, một lượt hỏng — trần không được thủng, lượt hỏng không được hoàn nhầm lượt của lượt kia (Task 2, E3).
2. Hoàn lượt khi kho hỏng — người dùng vẫn nhận đúng lỗi gốc, không bị đổi thành 500 (Task 2, tệp hoàn-hỏng).
3. Thân lỗi Trợ lý không phải JSON (HTML 502 của Vercel) — `lyDoHong` không được ném, phải ra `tro-ly-loi` (Task 3, dòng bảng «thân không JSON»).
4. «Thử lại» bấm liên tiếp khi lần trước còn chạy — nút khoá, không gửi đôi (Task 4).
5. Lượt thành công sau nhiều lần hỏng — chỗ báo lỗi biến mất, không còn dòng đếm treo (Task 4, đối chứng dương).

---

### Task 1: `hoanLuot` trong packages/db — independent: true

**Files:**
- Modify: `packages/db/src/okr-cuoc-soan.ts` (cạnh `tangLuot`)
- Create: `packages/db/test/okr-hoan-luot.spec.ts`

**Interfaces:**
- Produces: `export async function hoanLuot(db: DbHoacTx, cuocId: string): Promise<{ tru: boolean }>`

**Phục vụ:** E6 (AC-6), nền cho E1–E5.

- [ ] **Step 1: Viết bài kiểm đỏ** — gieo kỳ + bốn cuộc (soLuot 0, 1, 3, đối chứng 5) theo khung gieo của `packages/db/test/okr-cuoc-soan.spec.ts` (chép hàm gieo, không import tệp đó). Ma trận viết trước:

```ts
const MA_TRAN = [
	{ truoc: 0, sau: 0, tru: false },
	{ truoc: 1, sau: 0, tru: true },
	{ truoc: 3, sau: 2, tru: true },
] as const;
for (const o of MA_TRAN)
	test(`hoan-luot: ${o.truoc} -> ${o.sau}`, async () => {
		const id = await gieo(o.truoc);
		expect(await hoanLuot(db, id), `so-luot-am ${o.truoc}`).toEqual({ tru: o.tru });
		expect((await doc(id)).soLuot, `so-luot-am ${o.truoc}`).toBe(o.sau);
		expect((await doc(DOI_CHUNG)).soLuot).toBe(5);
	});
test("hoan-luot: hai lan song song tren soLuot 1", async () => {
	const id = await gieo(1);
	const kq = await Promise.all([hoanLuot(db, id), hoanLuot(db, id)]);
	expect(kq.filter((k) => k.tru).length).toBe(1);
	expect((await doc(id)).soLuot).toBe(0);
});
test("hoan-luot: san ma tran", () => {
	if (MA_TRAN.length + 2 < 5) throw new Error("ma tran rong");
});
```

- [ ] **Step 2:** `bun run test -- "cd packages/db && bun test test/okr-hoan-luot.spec.ts"` → FAIL (`hoanLuot` không export).
- [ ] **Step 3: Cài**

```ts
export async function hoanLuot(
	db: DbHoacTx,
	cuocId: string,
): Promise<{ tru: boolean }> {
	const { count } = await db.okrCuocSoan.updateMany({
		where: { id: cuocId, soLuot: { gt: 0 } },
		data: { soLuot: { decrement: 1 } },
	});
	return { tru: count === 1 };
}
```

- [ ] **Step 4:** chạy lại → PASS. **Phá-thử** (bản sao trong `.acceptance-runs/`, không sửa tại chỗ): bỏ `soLuot: { gt: 0 }` → bài đỏ với `so-luot-am 0`.
- [ ] **Step 5:** commit `feat: hoanLuot trả một lượt soạn cho cuộc`.

### Task 2: Cửa hoàn lượt + thời hạn chờ — independent: false (cần Task 1)

**Files:**
- Modify: `apps/app/lib/cua-okr-config.ts` — thêm `choTroLyMs`, `luotDaHoan`, ba mã lỗi.
- Modify: `apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts`
- Create: `apps/app/test/soan-okr-khong-tru-luot.spec.ts` (44 ô, mở phiên, trần, người huỷ)
- Create: `apps/app/test/soan-okr-hoan-hong.spec.ts` (hoàn hỏng, ghi phiên hỏng)

**Interfaces:**
- Consumes: `hoanLuot` (Task 1).
- Produces: `CUA_OKR.loi.quaHan = "tro-ly-okr-qua-han"`, `CUA_OKR.loi.troLyTuChoi = "tro-ly-okr-tu-choi"`, `CUA_OKR.loi.troLyLoi = "tro-ly-okr-loi"`, `CUA_OKR.luotDaHoan = "da-hoan"`, `CUA_OKR.choTroLyMs`.

**Phục vụ:** E1 (AC-1), E2 (AC-2), E3 (AC-3), E4 (AC-4).

- [ ] **Step 1: Config**

```ts
const GIAY_MS = 1000;
…
	choTroLyMs: 30 * GIAY_MS,
	luotDaHoan: "da-hoan",
	loi: { …, quaHan: "tro-ly-okr-qua-han", troLyTuChoi: "tro-ly-okr-tu-choi", troLyLoi: "tro-ly-okr-loi" },
```

`choTroLyMs` phải nhỏ hơn thời hạn hàm của route (kiểm `maxDuration` / mặc định Vercel 300 s).

- [ ] **Step 2: Bài kiểm đỏ** — `soan-okr-khong-tru-luot.spec.ts` dựng như `cua-okr.spec.ts` (người, kỳ, cuộc giữ chỗ, hàm `goi`), khác ở ba chỗ: (a) mock `@/lib/trpc/server` cho `soanTangLuot.mutate` gọi `tangLuot(db, cuocSoanId)` THẬT; (b) mock `@crm/db/okr-cuoc-soan` bằng chính các export thật (gỡ mock rò từ tệp khác); (c) `globalThis.fetch` giả điều khiển theo biến `ketQua`:

```ts
const KET_QUA_HONG = ["nem", "treo", 400, 401, 403, 404, 409, 422, 500, 502, 503] as const;
const N = [0, TRO_LY_OKR_TRAN.soan.luotMoiCuoc - 1] as const;
const DUONG = ["mo-phien", "gui-tiep"] as const;
const O = DUONG.flatMap((d) => KET_QUA_HONG.flatMap((k) => N.map((n) => ({ d, k, n }))));
test("hong-khong-tru: san ma tran", () => { if (O.length < 44) throw new Error("ma tran rong"); });
for (const { d, k, n } of O)
	test(`hong-khong-tru: ${d} ${k} n=${n}`, async () => {
		const { id, duong } = await cuocCho(d, n);
		ketQua = k;
		const res = await goi(NGUOI, duong, id);
		const than = await res.json();
		expect((await docLuot(id)), `tru-luot-khi-hong ${d} ${k} n=${n}`).toBe(n);
		expect(res.status).toBe(k === "nem" ? 502 : k === "treo" ? 504 : k);
		expect(than).toEqual(thanMongDoi(k));
		expect(soLanFetch).toBe(1);
	});
```

`thanMongDoi`: `nem` → `{ error: "tro-ly-okr-khong-noi-duoc", detail: <chuỗi lỗi giả>, luot: "da-hoan" }`; `treo` → `{ error: "tro-ly-okr-qua-han", luot: "da-hoan" }`; 4xx → `tro-ly-okr-tu-choi`; 5xx → `tro-ly-okr-loi`. Ca `treo`: fetch giả chờ `init.signal` huỷ rồi ném `AbortError`; bài hạ `CUA_OKR.choTroLyMs` bằng `mock.module("@/lib/cua-okr-config", …)` uỷ quyền mọi khoá thật, chỉ đổi `choTroLyMs` xuống 50 ms. Đối chứng dương cùng tệp: `ketQua = 202` → `soLuot = n + 1`, thân của Trợ lý không có `luot`.

Cùng tệp: `describe("mo-phien-khong-dung-duoc")` ba ca — 202 không mã phiên → 502 `khong-doc-duoc-phien` + `luot`; thua đua (cuộc đổi chỗ giữ trong lúc fetch, như `duaVoi` ở `cua-okr.spec.ts`) → 409 `da-co-phien` + `luot`; `soLuot = 0`, mã eve có trong `cacPhien`. `describe("tran-van-chan")`: chuỗi xen `202, 502, nem, 202…` tới `luotMoiCuoc` lượt 202, lượt 202 kế → 429 `het-luot-cuoc`, `soLanFetch` không tăng; song song hai POST 202 ở `soLuot = luotMoiCuoc − 1` → `{202, 429}`, `soLanFetch = 1`. `describe("nguoi-huy")`: `AbortController` huỷ trước khi fetch giả trả lời → `soLuot = n + 1`; đối chứng: lỗi thường không huỷ → `soLuot = n`; treo không huỷ → 504 + `luot`, `soLuot = n`.

`soan-okr-hoan-hong.spec.ts`: mock `@crm/db/okr-cuoc-soan` với cờ `hoanHong`, `ghiHong` — tắt thì uỷ quyền hàm thật; `hoan-hong`: `hoanHong = true`, fetch 502 → status 502, thân KHÔNG có `luot`, spy `console.error` một lời gọi chứa `hoan-luot-hong` và mã cuộc; `mo-phien-khong-dung-duoc: ghi phien hong`: `ghiHong = true` (capNhatPhien ném) → 502 `{ error: "khong-ghi-duoc-phien", luot: "da-hoan" }`, `soLuot = 0`. `afterAll` tắt cờ.

- [ ] **Step 3:** chạy lệnh `r1h_hong`, `r1h_mo_phien`, `r1h_tran`, `r1h_huy` → FAIL (lượt vẫn trừ).
- [ ] **Step 4: Cài trong route.ts** — trích ba hàm, giữ `handler` đọc được:

```ts
async function daHoan(cuocSoanId: string): Promise<boolean> {
	try {
		return (await hoanLuot(db, cuocSoanId)).tru;
	} catch (error) {
		console.error("hoan-luot-hong", cuocSoanId, error);
		return false;
	}
}

function kemLuot(than: Record<string, string>, hoan: boolean) {
	return hoan ? { ...than, luot: CUA_OKR.luotDaHoan } : than;
}

async function loiHoan(
	giuCho: boolean,
	cuocSoanId: string,
	status: number,
	than: Record<string, string>,
): Promise<Response> {
	const hoan = giuCho && (await daHoan(cuocSoanId));
	return Response.json(kemLuot(than, hoan), { status });
}
```

Trong `handler`: `const giuCho = request.method === "POST" && laLuot(duong.ten);` (thay điều kiện cũ ở khối tăng lượt). Fetch:

```ts
const quaHan = AbortSignal.timeout(CUA_OKR.choTroLyMs);
init.signal = AbortSignal.any([request.signal, quaHan]);
try {
	upstream = await fetch(dich, init);
} catch (error) {
	const detail = error instanceof Error ? error.message : String(error);
	if (request.signal.aborted)
		return Response.json({ error: CUA_OKR.loi.khongNoiDuoc, detail }, { status: 502 });
	if (quaHan.aborted) return loiHoan(giuCho, cuocSoanId, 504, { error: CUA_OKR.loi.quaHan });
	return loiHoan(giuCho, cuocSoanId, 502, { error: CUA_OKR.loi.khongNoiDuoc, detail });
}
if (giuCho && !upstream.ok && (await daHoan(cuocSoanId))) {
	const error = upstream.status >= 500 ? CUA_OKR.loi.troLyLoi : CUA_OKR.loi.troLyTuChoi;
	return Response.json(kemLuot({ error }, true), { status: upstream.status });
}
```

Nhánh mở phiên: `khongDocDuocPhien` → `loiHoan(true, cuocSoanId, 502, { error })`; `ghi !== "da-ghi"` → giữ `noiPhienMoCoi` như cũ rồi `loiHoan(true, …, 409 | 502, …)`.

- [ ] **Step 5:** bốn lệnh → PASS; chạy `soan_cua` (`cua-okr.spec.ts`, hồ sơ đã ký) → PASS không sửa; chạy `cd apps/app && bun test ./test/cua-okr.spec.ts ./test/soan-okr-khong-tru-luot.spec.ts ./test/soan-okr-hoan-hong.spec.ts` ở cả hai thứ tự tệp (đảo danh sách) → PASS. **Phá-thử** trong bản sao: bỏ `daHoan` ở nhánh fetch → `tru-luot-khi-hong mo-phien nem n=0`; hoàn cả khi 202 → `tran-thung`; hoàn khi người huỷ → `hoan-khi-nguoi-huy`.
- [ ] **Step 6:** commit `feat: cửa soạn OKR hoàn lượt khi không tới được Trợ lý`.

### Task 3: `lyDoHong` + chữ — independent: false (cần mã lỗi Task 2)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/soan/loi-cua.ts`
- Modify: `apps/app/lib/messages/okr-soan.ts` (vi + en, chỉ thêm khoá; thay `loiMoTa`/`loiMoTaKhac` bằng `lyDoHong["qua-45s"]`/`["dung-giua-chung"]` nếu không chỗ nào khác đọc hai khoá cũ — grep trước)
- Modify: `apps/app/test/messages-guard.spec.ts` (ghim khoá mới theo luật tệp)
- Create: `apps/app/test/soan-okr-ly-do-loi.spec.ts`

**Interfaces:**
- Produces:

```ts
export const MA_LY_DO_HONG = [
	"khong-noi-duoc", "qua-han", "tro-ly-tu-choi", "tro-ly-loi",
	"chua-dem-duoc-luot", "chua-mo-duoc-phien", "het-dang-nhap",
	"mat-mang", "chua-mo-lai-duoc", "qua-45s", "dung-giua-chung",
] as const;
export type MaLyDoHong = (typeof MA_LY_DO_HONG)[number];
export type LyDoHong = { ma: MaLyDoHong; daHoan: boolean };
export function lyDoHong(vao: {
	loi: Error | undefined;
	qua45s: boolean;
	loiMoLai: unknown;
}): LyDoHong | null;
```

- messages: `hoiThoai.lyDoHong: Record<MaLyDoHong, string>`, `hoiThoai.khongTinh: string`, `hoiThoai.daThuLai: (n: string) => string`.

**Phục vụ:** E7 (AC-7), E10 (AC-10).

- [ ] **Step 1: Bài đỏ** — bảng viết trước, dựng lỗi bằng `new ClientError(status, body, headers)` như `soan-okr-song-lai.dom.tsx` (`loiCua`); thêm dòng thân không JSON (`"<html>502</html>"`, 502) → `tro-ly-loi`; lỗi `new TypeError("fetch failed")` → `mat-mang`, `daHoan: false`; mỗi mã có thể hoàn hai dòng có/không `luot`; mã từ chối có tên rút `Object.entries(CUA_OKR.trangThaiTuChoiLuot)` → `null`; `{ status: 503, error: chuaCauHinh }`, `{ 409, daCoPhien }`, `{ 409, phienDaThay }` → `null`; tập `ma` bảng phủ `toEqual` `Object.keys(okrSoanMessages("vi").hoiThoai.lyDoHong).sort()` và bản `en` (lệch → `ly-do-lech: <ma>`).
- [ ] **Step 2:** `cd apps/app && bun test ./test/soan-okr-ly-do-loi.spec.ts` → FAIL.
- [ ] **Step 3: Cài** — thân lỗi đọc lỏng (status số + thân chuỗi, JSON thì lấy `error` và `luot`, không JSON thì cả hai rỗng); thứ tự: `loiMoLai` → `chua-mo-lai-duoc`; lỗi HTTP: ca có chỗ riêng (`lyDoTuChoiLuot`, `laChuaCauHinh`, `laDaCoPhien`) → `null`; bảng mã cửa → mã lý do; còn lại `status >= 500` → `tro-ly-loi`, `>= 400` → `tro-ly-tu-choi`; lỗi không status → `mat-mang`; không lỗi mà `qua45s` → `qua-45s`; còn lại → `dung-giua-chung`. `daHoan = luot === CUA_OKR.luotDaHoan`.
- [ ] **Step 4:** chữ vi theo bảng của thiết kế; en dịch tương ứng; `khongTinh`: «Lượt này không bị tính.» / "This turn was not counted."; `daThuLai`: `(n) => \`Đã thử lại ${n} lần\`` / `` (n) => `Tried again ${n} times` ``. Ghim ở `messages-guard.spec.ts` (`DOI_SO_GHIM` cho `daThuLai`). Chạy E7 + `bun test test/messages-guard.spec.ts` → PASS. **Phá-thử**: bản sao trả `daHoan: true` cho mọi 502 → `da-hoan-sai`.
- [ ] **Step 5:** commit `feat: lý do hỏng có tên cho phiên soạn OKR`.

### Task 4: «Thử lại» nói vì sao — independent: false (cần Task 3)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
- Modify: `apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx` (`LuotLoi`)
- Create: `apps/app/test/soan-okr-thu-lai.dom.tsx` (dùng `./khung-soan-okr`)

**Interfaces:**
- Consumes: `lyDoHong`, `MaLyDoHong`, messages Task 3.
- Produces trên `CuocDangSoan`: `lyDoHong: LyDoHong | null`, `lanThu: number`, `dangThu: boolean`.

**Phục vụ:** E8 (AC-8), E10.

- [ ] **Step 1: Bài đỏ** — ca rút lúc chạy như evals E8; mỗi ca: `datAgent` lỗi chung → mở màn → bấm `[data-nut="thu-lai"]` với lần thử treo (promise chưa giải) → nút `disabled` và `[data-luot="loi"]` còn; giải lần thử theo ca → kiểm câu, `khongTinh` chỉ khi có `luot`, `daThuLai("1")`, nằm trong `[aria-live="polite"]`; bấm lần hai → `daThuLai("2")`. Ca từ chối có tên / chưa cấu hình → không `[data-luot="loi"]`, có `[data-tu-choi="<ma>"]`. Đối chứng dương: lần thử qua → không `[data-luot="loi"]`.
- [ ] **Step 2:** chạy `r1h_thu_lai_dom` → FAIL.
- [ ] **Step 3: Cài trong hook**

```ts
const dangThu =
	lanThu > 0 && (agent.status === "submitted" || moLai.isPending);
const lyDo = lyDoHong({
	loi: agent.status === "error" ? agent.error : undefined,
	qua45s,
	loiMoLai: moLai.error,
});
```

`hong` thêm điều kiện `|| moLai.isError`; trả thêm `lyDoHong: lyDo, lanThu, dangThu`. `thuLai` giữ nguyên hai lối, `moLai.mutate` thêm `onSettled: docLai` để số lượt trên màn đọc lại sau khi cửa hoàn.

`LuotLoi`: hiện khi `s.hong || s.dangThu`; `AlertDescription` chứa `<p>` câu `m.lyDo[loiMo]` (giữ nhánh cũ) hoặc `m.hoiThoai.lyDoHong[s.lyDoHong.ma]`, `<p>` `m.hoiThoai.khongTinh` khi `s.lyDoHong?.daHoan`, `<p>` `m.hoiThoai.daThuLai(String(s.lanThu))` khi `s.lanThu > 0`; bọc ba dòng trong `<div aria-live="polite">`; nút `disabled={s.dangThu}`.

- [ ] **Step 4:** E8 + `sol_loi_dom`, `sol_man_dom`, `soan_man_trang_thai` (hồ sơ đã ký) → PASS. **Phá-thử**: bản sao giữ câu chung → `thu-lai-im <ca>`; luôn in `khongTinh` → `khong-tinh-sai <ca>`.
- [ ] **Step 5:** soát `hoi-thoai-soan.tsx` theo `web-design-guidelines` (aria-live, disabled, không chữ cứng); commit `feat: Thử lại nói lý do và đếm lần thử`.

### Task 5: Bài API trần cuộc của kỳ — independent: true (chỉ cần Task 1)

**Files:**
- Create: `apps/api/test/soan-okr-hoan-luot.spec.ts` (dùng `apps/api/test/soan-okr-san.ts`)

**Phục vụ:** E5 (AC-5).

- [ ] **Step 1:** bài theo evals E5: gieo `cuocMoiDonViMoiKy − 1` cuộc đã đóng có lượt; `soanMo` cuộc mới; `k ∈ {1, 3}` lần `tangLuot` rồi `hoanLuot` thật; `soanSanSang().soCuocDaDung` = trần − 1; `soanMo({ boCuocDangId })` → `ok`. Đối chứng: một `tangLuot` không hoàn → `soCuocDaDung` = trần, `soanMo` → `het-cuoc-ky`. Thông điệp ghim `cuoc-hong-an-tran k=<k>`.
- [ ] **Step 2:** `r1h_cuoc_ky` → PASS (đếm đã đúng sẵn; bài là thước của AC-5). **Phá-thử**: thay `hoanLuot` bằng hàm không trừ trong bản sao → đỏ.
- [ ] **Step 3:** commit `test: trần cuộc của kỳ bỏ qua cuộc mà mọi lượt đều hỏng`.

### Task 6: Đo màn thật — independent: false (cần Task 2–4)

**Files:**
- Create: `_acceptance/soan-okr-khong-tru-luot/rang/thu-lai-man-that.mjs` (khung từ `_acceptance/soan-okr-song-lai/rang/man-chua-cau-hinh.mjs`)

**Phục vụ:** E9 (AC-9).

- [ ] **Step 1:** script: kiểm `laKhoDo` + cảnh cây; seed (`napBoMau`, một cuộc `dang` soLuot 0 bằng `moCuoc`); puppeteer đăng nhập `phienCookie` trưởng phòng ban; nghe `request` đếm POST `/eve/agents/okr/eve/v1/session`; mở `/okr/theo-don-vi?…&cuocSoan=<id>` ở 1440 → chờ `[data-luot="loi"]` → `innerText` chứa `lyDoHong["khong-noi-duoc"]` và `khongTinh`; đọc soLuot từ kho (in tên kho); bấm `[data-nut="thu-lai"]` → chờ `daThuLai("1")`; ảnh + HTML; lặp 390 với cuộc mới; đo `scrollWidth ≤ clientWidth`. `--kiem-do-do`: dựng máy giả `Bun.serve` trả 202 `{ sessionId, continuationToken }` trên cổng tự do, đặt làm `OKR_AGENT_URL` … — không đặt được env của app đang chạy từ script, nên `--kiem-do-do` là lệnh thứ hai trong `r1h_man_that` với `OKR_AGENT_URL` trỏ cổng máy giả cố định do script dựng trước khi `mot-luot.sh` khởi app (khai trong bước này khi cài).
- [ ] **Step 2:** chạy `r1h_man_that` một lần ở S3 để chắc script chạy (ảnh thật để S4 chụp lại).
- [ ] **Step 3:** commit `test: đo màn soạn khi Trợ lý không nối được`.

### Task 7: Tài liệu + sàn — independent: true

**Files:**
- Modify: `docs/api.md` (đoạn «`soanTangLuot` là chỗ duy nhất đếm lượt»), `docs/agent.md` (mục cửa soạn OKR nếu có câu tương tự)

**Phục vụ:** E10 (chạy `r1h_chu_va_san`).

- [ ] **Step 1:** thêm vế: «cửa hoàn đúng một lượt qua `hoanLuot` khi lượt không tới được Trợ lý (không nối được, quá `CUA_OKR.choTroLyMs`, Trợ lý trả không `ok`, không mở được phiên); người dùng tự huỷ thì không hoàn; thân lỗi mang `luot: "da-hoan"` chỉ khi đã trừ».
- [ ] **Step 2:** `r1h_chu_va_san` → PASS; `bun run check-types`, `bun run lint`, `bun run lint:slop`.
- [ ] **Step 3:** commit `docs: cửa soạn OKR hoàn lượt khi lượt không tới Trợ lý`.

## Thứ tự

Task 1 → 2 → 3 → 4 → 6; Task 5 và 7 chen sau Task 1 bất kỳ lúc nào. Chỉ hai task độc lập thật sự (5, 7) và đều nhỏ — chạy tuần tự trong vòng chính, không fan-out.
