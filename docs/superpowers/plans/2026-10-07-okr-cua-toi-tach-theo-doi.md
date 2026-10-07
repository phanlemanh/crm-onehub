# Tách «Đang theo dõi» khỏi «Của tôi» — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `okr.mine` trả bốn vai «của tôi» ở `objectives`, mục tiêu chỉ-theo-dõi ở `dangTheoDoi`; tab «Của tôi» hiện chúng ở một nhóm gập riêng.

**Architecture:** API giữ một lượt `docMucTieu` năm vai và thêm một truy vấn `select id` bốn vai chạy song song; hàm thuần `chiaCuaToi` chia kết quả. UI tách thân gập của `NhomDaBo` thành `NhomMucTieuGap` dùng chung cho nhóm mới.

**Tech Stack:** NestJS + nestjs-trpc, Prisma, Zod, Next.js App Router, React Query, bun test.

**Spec:** `docs/superpowers/specs/2026-10-07-okr-cua-toi-tach-theo-doi-design.md` · hợp đồng `_acceptance/okr-cua-toi-tach-theo-doi/contract.md` · đo `_acceptance/okr-cua-toi-tach-theo-doi/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- `/packages/ui` là nguồn duy nhất của giao diện; không `className` đè màu/góc/khoảng của component `@crm/ui`.
- `mineOutput.dangTheoDoi` bắt buộc — không `.default([])`; fixture phải sửa.
- Nhãn: «Đang theo dõi (n)» / «Following (n)».
- Thứ tự trên màn: bảng chính hoặc Empty → «Đang theo dõi» → «Đã bỏ».
- Test API chạy qua `bun run test -- "<lệnh>"` (CSDL riêng mỗi lượt), test ngày giờ cần `TZ=Asia/Ho_Chi_Minh`.

## Review Focus

- Mục tiêu nháp/chờ duyệt của chính U phải ở bảng chính — E1 quét đủ bốn trạng thái (Task 1).
- Mục tiêu vừa của U vừa được theo dõi không được lặp — E3 (Task 2).
- Mục tiêu bị giới hạn người xem không được lọt qua truy vấn id — nguồn duy nhất của dữ liệu là `docMucTieu` (Task 2, E5).
- Test đã ký `okr-cap-nhat.spec.ts` (khối theo dõi) đọc `objectives` — đổi sang `dangTheoDoi` (Task 2).
- Fixture `mineOutput.parse({ objectives, daBo })` ở sáu tệp test app phải thêm `dangTheoDoi: []` kẻo `bun run check-types`/test đỏ (Task 3).

---

### Task 1: Hàm thuần `chiaCuaToi`

`independent: false` (Task 2 dùng nó) · phục vụ E1, E4 (chiều đỏ (a)) · verify: `cd apps/api && bun test test/okr-cua-toi-chia.spec.ts`

**Files:**
- Create: `apps/api/src/okr/cua-toi.ts`
- Test: `apps/api/test/okr-cua-toi-chia.spec.ts`

**Interfaces:**
- Produces: `export function chiaCuaToi<T extends { id: string; status: TrangThaiMucTieu }>(ds: readonly T[], idsCuaToi: ReadonlySet<string>): { objectives: T[]; daBo: T[]; dangTheoDoi: T[] }`

- [ ] **Step 1: Viết test đỏ** — bảng 8 dòng gõ tay, khẳng định tập status = `TRANG_THAI_MUC_TIEU`, ca thứ tự; mỗi lỗi in thông điệp ghim:

```ts
import { describe, expect, test } from "bun:test";
import { TRANG_THAI_MUC_TIEU } from "@crm/validation/okr-muc-tieu";
import { chiaCuaToi } from "../src/okr/cua-toi";

type Dich = "objectives" | "daBo" | "dangTheoDoi" | "khong";
const BANG: { thuoc: boolean; status: (typeof TRANG_THAI_MUC_TIEU)[number]; dich: Dich; ghim: string }[] = [
	{ thuoc: true, status: "nhap", dich: "objectives", ghim: "nhap cua toi roi khoi objectives" },
	{ thuoc: true, status: "cho-duyet", dich: "objectives", ghim: "cho-duyet cua toi roi khoi objectives" },
	{ thuoc: true, status: "cong-bo", dich: "objectives", ghim: "cong-bo cua toi roi khoi objectives" },
	{ thuoc: true, status: "da-bo", dich: "daBo", ghim: "da-bo cua toi khong o daBo" },
	{ thuoc: false, status: "nhap", dich: "dangTheoDoi", ghim: "nhap chi theo doi khong o dangTheoDoi" },
	{ thuoc: false, status: "cho-duyet", dich: "dangTheoDoi", ghim: "cho-duyet chi theo doi khong o dangTheoDoi" },
	{ thuoc: false, status: "cong-bo", dich: "dangTheoDoi", ghim: "cong-bo chi theo doi khong o dangTheoDoi" },
	{ thuoc: false, status: "da-bo", dich: "khong", ghim: "chi-theo-doi-da-bo lot vao dangTheoDoi" },
];

const noi = (r: ReturnType<typeof chiaCuaToi>, id: string): Dich[] => {
	const o: Dich[] = [];
	if (r.objectives.some((m) => m.id === id)) o.push("objectives");
	if (r.daBo.some((m) => m.id === id)) o.push("daBo");
	if (r.dangTheoDoi.some((m) => m.id === id)) o.push("dangTheoDoi");
	return o.length === 0 ? ["khong"] : o;
};

describe("chia-cua-toi", () => {
	test("bang 2 x 4 phu du trang thai", () => {
		expect(new Set(BANG.map((d) => d.status))).toEqual(new Set(TRANG_THAI_MUC_TIEU));
		expect(BANG.length).toBe(8);
	});

	for (const [i, d] of BANG.entries())
		test(`${d.thuoc ? "thuoc" : "khong thuoc"} x ${d.status}`, () => {
			const id = `m${i}`;
			const r = chiaCuaToi([{ id, status: d.status }], new Set(d.thuoc ? [id] : []));
			const thay = noi(r, id);
			if (thay.length !== 1 || thay[0] !== d.dich)
				throw new Error(`${d.ghim}: mong ${d.dich}, thay ${thay.join("+")}`);
		});

	test("giu thu tu dau vao trong tung mang", () => {
		const ds = [
			{ id: "b", status: "cong-bo" as const },
			{ id: "a", status: "cong-bo" as const },
			{ id: "d", status: "cong-bo" as const },
			{ id: "c", status: "cong-bo" as const },
		];
		const r = chiaCuaToi(ds, new Set(["b", "d"]));
		expect({ o: r.objectives.map((m) => m.id), t: r.dangTheoDoi.map((m) => m.id) }).toEqual({ o: ["b", "d"], t: ["a", "c"] });
	});
});
```

- [ ] **Step 2:** chạy verify → FAIL «Cannot find module ../src/okr/cua-toi».
- [ ] **Step 3: Cài**

```ts
import type { TrangThaiMucTieu } from "@crm/validation/okr-muc-tieu";

export function chiaCuaToi<T extends { id: string; status: TrangThaiMucTieu }>(
	ds: readonly T[],
	idsCuaToi: ReadonlySet<string>,
): { objectives: T[]; daBo: T[]; dangTheoDoi: T[] } {
	const cuaToi = ds.filter((m) => idsCuaToi.has(m.id));
	return {
		objectives: cuaToi.filter((m) => m.status !== "da-bo"),
		daBo: cuaToi.filter((m) => m.status === "da-bo"),
		dangTheoDoi: ds.filter((m) => !idsCuaToi.has(m.id) && m.status !== "da-bo"),
	};
}
```

- [ ] **Step 4:** verify → PASS (10 ca).
- [ ] **Step 5:** commit `feat(okr): ham chia Cua toi theo bon vai`.

### Task 2: `okr.mine` trả `dangTheoDoi`

`independent: false` · phục vụ E2, E3, E4, E5, E6 · verify: `bun run test -- "cd apps/api && bun test test/okr-cua-toi-theo-doi.spec.ts"` rồi `bun run test -- "cd apps/api && bun test test/okr-cap-nhat.spec.ts -t trao-doi"` (tên khối theo dõi trong tệp — chạy `-t` theo tên describe thật)

**Files:**
- Modify: `apps/api/src/okr/okr.service.ts` (hàm `mine`)
- Modify: `apps/api/src/okr/okr.contracts.ts` (`mineOutput`)
- Modify: `apps/api/test/okr-cap-nhat.spec.ts` (khối theo dõi: `cuaM.objectives` → `cuaM.dangTheoDoi`)
- Test: `apps/api/test/okr-cua-toi-theo-doi.spec.ts`

**Interfaces:**
- Consumes: `chiaCuaToi` (Task 1)
- Produces: `mineOutput = z.object({ objectives, daBo, dangTheoDoi: z.array(mucTieuOutput) })`

- [ ] **Step 1: Test đỏ** — `dungSan()`, `caiChuongTrinh`, `kyDangChay`, `nguoiMoi("U")`, `nguoiMoi("V")`, cookie qua `phienCua`. Helper cục bộ:

```ts
const mt = (cycleId: string, unit: Json, ownerUserId: string, participantIds: string[] = []) =>
	tao("okr.createObjective", { cycleId, unit, title: ma("ctt"), kind: "cam-ket", ownerUserId, participantIds, whyNow: "" }, "tao muc tieu");
const congBo = async (id: string) => ok(await goi("okr.publishObjective", { id }), "cong bo");
const theoDoi = async (id: string, on: boolean, cookie: string) => ok(await goi("okr.follow", { objectiveId: id, on }, cookie), `follow ${on}`);
const mineCua = (cookie: string, cycleId: string) => doc<{ objectives: { id: string }[]; daBo: { id: string }[]; dangTheoDoi: { id: string }[] }>("okr.mine", cookie, { cycleId });
const noiCua = (r: Awaited<ReturnType<typeof mineCua>>, id: string) =>
	(["objectives", "daBo", "dangTheoDoi"] as const).filter((k) => r[k].some((m) => m.id === id));
```

Năm `describe`, tên trùng `-t` của config:
- `mine-vai`: M1 `{level:"onehub"}` owner U để nháp; M2 `{level:"ca-nhan", personUserId:U}` owner V; M3 owner V participant U; M4 owner V + `okr.createKeyResult` owner U; M5 owner V + U follow; M6 owner V. M2–M6 công bố. Đọc `db.okrObjective` khẳng định M1 `nhap`. Khẳng định `new Set(objectives ids) ⊇ {M1..M4}` và không chứa M5, `dangTheoDoi` chứa M5 không chứa M1..M4, M6 `noiCua` rỗng; lỗi in `M5 o objectives` khi M5 thuộc objectives. Đối chứng V: M5 ∈ objectives của V, ∉ dangTheoDoi của V.
- `trung-vai`: T1..T4 bốn vai như M1..M4 + U follow từng cái → mỗi Ti `noiCua` toEqual `["objectives"]`; lỗi in `T1 o dangTheoDoi`.
- `da-bo`: D1..D5 công bố rồi `okr.dropObjective` (D1..D4 bốn vai, D5 U chỉ theo dõi, follow trước khi bỏ); D6 chỉ theo dõi chưa bỏ → D1..D4 `["daBo"]`, D5 `[]`, D6 `["dangTheoDoi"]`; lỗi in `D5 o dangTheoDoi`.
- `hien-thi`: H owner V công bố, U follow → `["dangTheoDoi"]`; `okr.datHienThi {hienThi:"gioi-han", nguoiXem:[V]}` → `[]`, lỗi in `H lo du bi gioi han`; đặt `cong-khai` → `["dangTheoDoi"]`.
- `bo-theo-doi`: F owner V; U follow on → `["dangTheoDoi"]`; off → `[]`, lỗi in `F con o dangTheoDoi sau khi tat`; on lại → `["dangTheoDoi"]`.

Khuôn khẳng định có ghim (dùng ở mọi ca):

```ts
const ghim = (dung: boolean, thongDiep: string) => {
	if (!dung) throw new Error(thongDiep);
};
```

- [ ] **Step 2:** verify → FAIL (`dangTheoDoi` undefined).
- [ ] **Step 3: Cài** — `okr.contracts.ts`:

```ts
export const mineOutput = z.object({
	objectives: z.array(mucTieuOutput),
	daBo: z.array(mucTieuOutput),
	dangTheoDoi: z.array(mucTieuOutput),
});
```

`okr.service.ts`:

```ts
const vaiCuaToi = (userId: string): Prisma.OkrObjectiveWhereInput[] => [
	{ ownerUserId: userId },
	{ personUserId: userId },
	{ participants: { some: { userId } } },
	{ keyResults: { some: { ownerUserId: userId } } },
];

async mine(userId: string, cycleId: string) {
	const q = await this.quyenOkr.quyen(userId);
	const [ds, cuaToi] = await Promise.all([
		this.docMucTieu(
			this.db,
			{ cycleId, OR: [...vaiCuaToi(userId), { followers: { some: { userId } } }] },
			userId,
			q,
			{ nguCanh: this.quyenOkr.nguCanhXem(q, userId) },
		),
		this.db.okrObjective.findMany({
			where: { cycleId, OR: vaiCuaToi(userId) },
			select: { id: true },
		}),
	]);
	return chiaCuaToi(ds, new Set(cuaToi.map((m) => m.id)));
}
```

`vaiCuaToi` đặt ở `cua-toi.ts` (export) cạnh `chiaCuaToi`, import `Prisma` type từ `@crm/db`. Sửa `okr-cap-nhat.spec.ts`: kiểu `doc<{ objectives…; dangTheoDoi: { id: string; theoDoi: boolean }[] }>` và `mineM: cuaM.dangTheoDoi.filter(...)`.

- [ ] **Step 4:** verify cả hai lệnh → PASS; thêm `bun run check-types` (lỗi kiểu ở fixture app sẽ sửa ở Task 3 — chạy lại sau Task 3).
- [ ] **Step 5:** commit `fix(okr): Cua toi khong gom muc tieu chi theo doi`.

### Task 3: Nhóm «Đang theo dõi» trên màn

`independent: false` · phục vụ E7, E8, E9, E10, E14 · verify: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-cua-toi-theo-doi.dom.tsx ./test/okr-da-bo.dom.tsx` + `bun run check-types`

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/nhom-da-bo.tsx`
- Modify: `apps/app/app/(app)/[slug]/okr/cua-toi.tsx`
- Modify: `apps/app/lib/messages/okr.ts` (vi + en `khoiMucTieu.nhomDangTheoDoi`)
- Modify fixture: `apps/app/test/okr-don-san.tsx`, `apps/app/test/okr-da-bo.dom.tsx`, `apps/app/test/khung-gop-y-dung-cho.tsx`, `apps/app/test/khung-okr-truoc-r1.dom.tsx`, `apps/app/test/muc-tieu-va-kr.dom.tsx` — thêm `dangTheoDoi: []` vào mọi `mineOutput.parse`
- Test: `apps/app/test/okr-cua-toi-theo-doi.dom.tsx`

**Interfaces:**
- Consumes: `mineOutput.dangTheoDoi` (Task 2)
- Produces: `NhomMucTieuGap({ nhan: string; ma: "da-bo" | "dang-theo-doi"; ds: MucTieu[]; hienDonVi: boolean; danhDauCuaToi: boolean })`, thuộc tính `data-nhom-da-bo` / `data-nhom-dang-theo-doi` trên `Collapsible`.

- [ ] **Step 1: Test đỏ** — dựng `CuaToi` qua `okr-don-san` như `okr-da-bo.dom.tsx`. Năm ca (a)–(e) theo E7: (a) `objectives:[a1]`, `dangTheoDoi:[t1,t2]`, `daBo:[d1]` → hàng chính `["a1"]`; `[data-nhom-dang-theo-doi] button` chữ «Đang theo dõi (2)», `aria-expanded="false"`; `nhomTheoDoi.compareDocumentPosition(nhomDaBo) & Node.DOCUMENT_POSITION_FOLLOWING` khác 0; bấm → `aria-expanded="true"`, hàng trong nhóm `["t1","t2"]`. (b) `objectives:[]`, `dangTheoDoi:[t1]` → `[data-trang-thai='ST-cuatoi-rong']` có, `nhom.previousElementSibling` là Empty đó, chữ «Đang theo dõi (1)»; lỗi in `ST-cuatoi-rong khong co nhom theo doi`. (c) `objectives:[a1]`, `dangTheoDoi:[]` và (d) cả hai rỗng → không `[data-nhom-dang-theo-doi]`, `document.body.textContent` không chứa «Đang theo dõi (». (e) như (a) với locale en → «Following (2)».
- [ ] **Step 2:** verify → FAIL.
- [ ] **Step 3: Cài** — `nhom-da-bo.tsx`:

```tsx
export function NhomMucTieuGap({ nhan, ma, ds, hienDonVi, danhDauCuaToi }: { nhan: string; ma: "da-bo" | "dang-theo-doi"; ds: MucTieu[]; hienDonVi: boolean; danhDauCuaToi: boolean }) {
	if (ds.length === 0) return null;
	const dau = ma === "da-bo" ? { "data-nhom-da-bo": "" } : { "data-nhom-dang-theo-doi": "" };
	return (
		<Collapsible {...dau}>
			<CollapsibleTrigger asChild>
				<Button className="group" size="sm" variant="ghost">
					<Icon className="transition-transform group-aria-expanded:rotate-90 motion-reduce:transition-none" data-icon="inline-start" icon={ChevronRight} />
					{nhan}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="pt-3">
				<BangMucTieu danhDauCuaToi={danhDauCuaToi} dangMo={KHONG_MO} ds={ds} hienDonVi={hienDonVi} />
			</CollapsibleContent>
		</Collapsible>
	);
}

export function NhomDaBo({ ds, hienDonVi, danhDauCuaToi }: { ds: MucTieu[]; hienDonVi: boolean; danhDauCuaToi: boolean }) {
	const k = okrMessages(useLocale()).khoiMucTieu;
	return <NhomMucTieuGap danhDauCuaToi={danhDauCuaToi} ds={ds} hienDonVi={hienDonVi} ma="da-bo" nhan={k.nhomDaBo(ds.length)} />;
}

export function NhomDangTheoDoi({ ds }: { ds: MucTieu[] }) {
	const k = okrMessages(useLocale()).khoiMucTieu;
	return <NhomMucTieuGap danhDauCuaToi={false} ds={ds} hienDonVi ma="dang-theo-doi" nhan={k.nhomDangTheoDoi(ds.length)} />;
}
```

`okr.ts`: vi `nhomDangTheoDoi: (n: number) => \`Đang theo dõi (${n})\``, en `nhomDangTheoDoi: (n: number) => \`Following (${n})\`` cạnh `nhomDaBo`. `cua-toi.tsx`: `const nhomTheoDoi = <NhomDangTheoDoi ds={mine.data.dangTheoDoi} />;` và chèn `{nhomTheoDoi}` trước `{nhomDaBo}` ở cả hai nhánh. Fixture: thêm `dangTheoDoi: []`.

- [ ] **Step 4:** verify → PASS; `bun run check-types` xanh; `bun run lint` xanh; chạy `ctt_san_thiet_ke` → exit 0.
- [ ] **Step 5:** commit `feat(okr): nhom Dang theo doi trong Cua toi`.

### Task 4: Thước màn thật và thước phá thử

`independent: false` · phục vụ E11, E12, E13, E15 · verify: `EVAL= bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/okr-cua-toi-tach-theo-doi/rang/man-theo-doi.mjs"`, rồi `--chieu-do` hai lần (E11, E12), rồi `node _acceptance/okr-cua-toi-tach-theo-doi/rang/dot-bien.mjs`

**Files:**
- Create: `_acceptance/okr-cua-toi-tach-theo-doi/rang/man-lib.mjs` (chép `_acceptance/kho-tai-lieu/rang/man-lib.mjs`, đổi `HO_SO`, thêm helper gieo OKR: `kyDangChay`, `mucTieu`, `theoDoi`, `congBo`, `bo` qua `d.lam(cookie, thuTuc, vao)`)
- Create: `_acceptance/okr-cua-toi-tach-theo-doi/rang/man-theo-doi.mjs` (sáu bước của E11; `CAY_DO` cho E11 cắm `objectives` + `dangTheoDoi` vào bảng chính ở `cua-toi.tsx`, ghim `/buoc 1: M5 trong bang chinh/`; `CAY_DO` cho E12 bỏ `cache.okr` ở `objective-sheet.tsx`, ghim `/buoc 3: M5 con tren man sau khi tat/`)
- Create: `_acceptance/okr-cua-toi-tach-theo-doi/rang/dot-bien.mjs` (bản sao bằng `git worktree add` ở thư mục tạm ngoài kho — KHÔNG thư mục ẩn trong gói; symlink `node_modules` và `.env`; bảng 8 cặp đột biến → lệnh → thông điệp ghim; đối chứng lành trước; dọn trong `finally`)

Mỗi bước gọi `d.dat(n, dung, thongDiep)`; ảnh `ctt-cua-toi-dong.png`, `ctt-cua-toi-mo.png`, `ctt-sau-bo-theo-doi.png`, `ctt-rong-co-theo-doi.png`, `ctt-390.png` vào `BANG_CHUNG`. Bước 3 khẳng định «không tải lại» bằng một dấu `window.__cttDau = 1` đặt trước khi bấm và còn nguyên sau khi đọc màn.

- [ ] **Step 1:** viết `man-lib.mjs` + `man-theo-doi.mjs`; chạy verify trên cây lành → sáu bước đạt.
- [ ] **Step 2:** `--chieu-do` cho E11 và E12 → đỏ đúng thông điệp ghim.
- [ ] **Step 3:** viết `dot-bien.mjs`; chạy → 8/8 cặp đỏ đúng thông điệp, đối chứng lành xanh.
- [ ] **Step 4:** commit `test(okr-cua-toi-tach-theo-doi): thuoc man that va pha thu`.

### Task 5: Từ điển

`independent: true` · phục vụ — (Notes của hợp đồng) · verify: `bun run lint:slop`

**Files:**
- Modify: `CONTEXT.md` mục «Theo dõi (mục tiêu)» — thêm câu: «Mục tiêu đang theo dõi hiện ở nhóm «Đang theo dõi» của tab «Của tôi», không vào danh sách chính; mục tiêu chỉ theo dõi mà đã bỏ không hiện ở tab đó.»

- [ ] **Step 1:** sửa, chạy verify, commit `docs(context): Theo doi hien o nhom rieng cua Cua toi`.

## Sau Task 5

Năm lệnh chứng của kho (`bun run test`, `check-types`, `lint`, `lint:slop`, `build`), rồi contract `status: implemented` và S4.
