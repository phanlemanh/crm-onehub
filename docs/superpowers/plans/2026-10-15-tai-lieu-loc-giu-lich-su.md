# Tài liệu: bộ lọc giữ lịch sử, thanh lọc không chớp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ở Tài liệu › Trang và › Chờ duyệt, mỗi lần đổi bộ lọc hay sang trang ghi một mục lịch sử (bấm lùi về bộ lọc
trước), và trong lúc chờ danh sách mới thì thanh lọc, phân trang, tiêu điểm đứng yên, danh sách cũ mờ đi tại chỗ.

**Architecture:** Lịch sử: `taiLieuParsers` đặt `.withOptions({ history: "push" })` cho sáu khoá lọc; nuqs 2.9.4 lấy
`history` của parser khi lời gọi không đặt (`callOptions.history ?? parser.history ?? hook`), và một lượt ghi có một
khoá `push` là cả lượt `push`. Giữ thanh lọc: hai truy vấn `taiLieu.list` và `taiLieu.proposals` thêm
`placeholderData: (previous) => previous` (nếp `deals-table.tsx:180`); vùng danh sách bọc trong thành phần mới
`VungDangTai` của `packages/ui` (mờ đi, `aria-busy`, `data-dang-tai` khi `dangTai`). TanStack v5 chỉ cấp
`placeholderData` lúc `status === "pending"`, nên đổi lọc mà lỗi thì `data` rỗng và nhánh `isError && !data` hiện
khung lỗi như lần đầu (AC-5) — không cần nhánh mới.

**Tech Stack:** Next 16.3 app router, nuqs 2.9.4, TanStack Query v5, bun test + jsdom, puppeteer qua `man-lib.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-15-tai-lieu-loc-giu-lich-su-design.md` · hợp đồng
`_acceptance/tai-lieu-loc-giu-lich-su/contract.md` (AC-1…AC-5, đã duyệt 15/10) · `evals.yaml` (E1–E5, E4m).

## Global Constraints

- Không viết chú thích trong code (`AGENTS.md`).
- `packages/ui` là nguồn duy nhất của giao diện; không đè `className` lên component `@crm/ui` ở chỗ gọi (`docs/design.md`).
- Không đổi khoá đường dẫn, không đổi parser nào ngoài sáu khoá lọc của Tài liệu, không đổi màn ngoài Tài liệu.
- Khoá `tab` giữ `replace` (thẻ trang con là `Link`, không phải bộ lọc).
- Bài DOM chạy từng tệp riêng, `TZ=Asia/Ho_Chi_Minh`, preload `../../packages/ui/test/setup-dom.ts` (lệnh ở `_acceptance/config.yaml` khoá `tlg_*`).
- Thông điệp ghim chiều đỏ chép nguyên văn từ `evals.yaml`.
- Đo màn chỉ qua `mot-luot.sh` (phiên đo riêng); cổng 3000/3001 là của chủ kho.

## Review Focus

1. Bấm «Bỏ lọc» khi đang có hai khoá lọc — một lượt ghi, đúng một mục lịch sử (không hai). Phủ: ô «bo loc» của E1.
2. Bấm hai chip liền nhau trước khi truy vấn đầu về — danh sách vẫn cũ, mờ, không khung xương, ô tiêu điểm ở chip thứ hai. Phủ: thêm ca «bam hai lan lien» vào nhóm giu-loc (Task 3).
3. Đổi lọc trên Chờ duyệt rồi truy vấn lỗi — khung lỗi, không danh sách cũ; bấm thử lại về danh sách mới. Phủ: E5 ô Chờ duyệt.
4. Lọc ra rỗng trong lúc danh sách cũ còn — trạng thái rỗng chỉ hiện khi dữ liệu mới về, không chớp. Phủ: thêm ca «loc ra rong» vào giu-loc (Task 3).
5. Lần đầu mở bằng đường dẫn đã có bộ lọc (dán link) — khung xương, không `aria-busy` treo sau khi về. Phủ: ô lần đầu của E3 mở bằng `?loai=chinh-sach`.

---

### Task 1: `VungDangTai` trong `packages/ui`

Bậc 5 của «Vẽ tay là bậc cuối»: đã tra bậc 1–4 — `packages/ui` có `SkeletonSwap` (thay bằng khung xương, đúng lối Hỏi-2
đã loại), `DataTable` chỉ có `Spinner` khi rỗng; ReUI không có vùng mờ-khi-tải (tra `loading overlay`, `busy`).

**Files:**
- Create: `packages/ui/src/components/vung-dang-tai.tsx`
- Test: `packages/ui/test/vung-dang-tai.dom.tsx`

**Interfaces:**
- Produces: `export function VungDangTai(props: { dangTai: boolean; children: ReactNode } & ComponentProps<"div">)` — `aria-busy="true"` và `data-dang-tai=""` chỉ khi `dangTai`; mờ bằng `opacity-60` khi `dangTai`, `transition-opacity`, `motion-reduce:transition-none`; `data-slot="vung-dang-tai"`.

- [ ] **Step 1: Viết bài đỏ**

```tsx
import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { VungDangTai } from "../src/components/vung-dang-tai";

let root: Root | null = null;
afterEach(() => {
	act(() => root?.unmount());
	document.body.innerHTML = "";
});

function dung(dangTai: boolean): HTMLElement {
	const k = document.createElement("div");
	document.body.appendChild(k);
	root = createRoot(k);
	act(() => root?.render(<VungDangTai dangTai={dangTai}><p>hang</p></VungDangTai>));
	const v = k.querySelector('[data-slot="vung-dang-tai"]');
	if (!(v instanceof HTMLElement)) throw new Error("vung-dang-tai: khong dung");
	return v;
}

test("vung-dang-tai: dang tai thi aria-busy, data-dang-tai va mo", () => {
	const v = dung(true);
	expect(v.getAttribute("aria-busy")).toBe("true");
	expect(v.hasAttribute("data-dang-tai")).toBe(true);
	expect(v.className).toContain("opacity-60");
	expect(v.textContent).toBe("hang");
});

test("vung-dang-tai: xong thi khong aria-busy, khong data-dang-tai, khong mo", () => {
	const v = dung(false);
	expect(v.hasAttribute("aria-busy")).toBe(false);
	expect(v.hasAttribute("data-dang-tai")).toBe(false);
	expect(v.className).not.toContain("opacity-60");
});
```

- [ ] **Step 2:** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/vung-dang-tai.dom.tsx` → FAIL (không có module).
- [ ] **Step 3: Cài**

```tsx
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export function VungDangTai({
	dangTai,
	className,
	children,
	...props
}: ComponentProps<"div"> & { dangTai: boolean }) {
	return (
		<div
			aria-busy={dangTai ? "true" : undefined}
			className={cn(
				"min-w-0 transition-opacity duration-200 motion-reduce:transition-none",
				dangTai && "opacity-60",
				className,
			)}
			data-dang-tai={dangTai ? "" : undefined}
			data-slot="vung-dang-tai"
			{...props}
		>
			{children}
		</div>
	);
}
```

Theo nếp import của các tệp cùng thư mục (`cn` từ `@crm/ui/lib/utils` nếu tệp láng giềng dùng thế). Xuất qua `package.json` `exports` nếu kho khai từng tệp.

- [ ] **Step 4:** chạy lại Step 2 → PASS; `bun run check-types --filter @crm/ui`.
- [ ] **Step 5:** commit `feat(tai-lieu-loc-giu-lich-su): VungDangTai trong packages/ui`.

Verify: lệnh Step 2. Eval phục vụ: E2, E4 (vật dùng chung). Independent: có.

### Task 2: Mỗi lần đổi lọc ghi một mục lịch sử (AC-1, E1)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/tai-lieu-search-params.ts`
- Create: `apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx` (nhóm `lich-su`; Task 3 thêm ba nhóm còn lại)

**Interfaces:**
- Consumes: `taiLieuParsers`, `useLocTaiLieu`, `duongLoc`, `BO_LOC_TRONG` (`danh-sach-loc.ts`, không đổi).
- Produces: tệp bài có bộ dựng chung dùng lại ở Task 3:
  - `canh` — trạng thái giả: `goi: { list: number; proposals: number }`, `treo: boolean`, `loi: boolean`, `capNhat: { qs: string; history: string }[]`.
  - `mo(man: "trang" | "cho-duyet", duong: string): Promise<HTMLElement>` — `NuqsTestingAdapter hasMemory` với `onUrlUpdate={(e) => canh.capNhat.push({ qs: e.queryString, history: e.options.history })}`, `QueryClient` `retry: false`.
  - `bam(el)`, `chon(khoa, nhan)` chép từ `tai-lieu-loc.dom.tsx`; `ghim(dk: boolean, thongDiep: string)` ném `Error(thongDiep)`.

- [ ] **Step 1: Viết bài đỏ** — trpc giả như `tai-lieu-loc.dom.tsx` (list, boLoc) cộng `proposals` (hai hàng mỗi nhóm, `total` 30 để có phân trang). Ma trận viết trước, bảy ô:

```tsx
const HANH_DONG = [
	{ ten: "chon loai", man: "trang", duong: "", lam: () => bam(q('[data-loai="chinh-sach"]')) },
	{ ten: "chon don vi", man: "trang", duong: "", lam: () => chon("data-loc-don-vi", "Phòng Kinh doanh") },
	{ ten: "chon chu trang", man: "trang", duong: "", lam: () => chon("data-loc-chu", "Hà") },
	{ ten: "bat luu tru", man: "trang", duong: "", lam: () => bam(q("[data-nut-da-luu-tru]")) },
	{ ten: "bo loc", man: "trang", duong: "?loai=quy-dinh&donVi=dv1", lam: () => bam(q("[data-bo-loc-xoa]")) },
	{ ten: "sang trang 2", man: "trang", duong: "", lam: () => bam(nutTheoChu("Sau")) },
	{ ten: "doi nhom de xuat", man: "cho-duyet", duong: "?tab=cho-duyet", lam: () => bam(q('[data-nhom="da-xu-ly"]')) },
] as const;

describe("lich-su", () => {
	test("lich-su: ma tran 7 hanh dong, moi lan mot cap nhat push", async () => {
		let dem = 0;
		for (const h of HANH_DONG) {
			await mo(h.man, h.duong);
			canh.capNhat = [];
			await h.lam();
			ghim(canh.capNhat.length === 1, `tlg-lich-su: ${h.ten} ra ${canh.capNhat.length} cap nhat`);
			ghim(canh.capNhat[0]?.history === "push",
				h.ten === "chon loai" ? "tlg-lich-su: chon loai ghi de muc lich su" : `tlg-lich-su: ${h.ten} ghi de muc lich su`);
			dem += 1;
			await go();
		}
		expect(dem).toBe(7);
	});

	test("lich-su: sau khoa loc cua taiLieuParsers mang history push", () => {
		for (const k of ["loai", "donVi", "chu", "archived", "page", "nhom"] as const)
			ghim(taiLieuParsers[SEARCH_PARAM_KHOA[k]].history === "push", `tlg-lich-su: khoa ${k} khong push`);
		ghim(taiLieuParsers[SEARCH_PARAM.taiLieu.tab].history !== "push", "tlg-lich-su: tab bi doi sang push");
	});
});
```

Lúc viết thật: mục ma trận mở sẵn phân trang (`total` > `coTrang`) cho «sang trang 2»; `nutTheoChu` tìm `button` theo chữ của `m.phanTrang.sau`. Ô thứ hai đọc thuộc tính `history` mà `withOptions` gắn thẳng lên parser (đã kiểm bằng `bun -e` trên nuqs 2.9.4: `parseAsInteger.withDefault(1).withOptions({history:"push"}).history === "push"`, parser trần là `undefined`). `SEARCH_PARAM_KHOA` là ánh xạ sáu tên ngắn sang khoá thật của `SEARCH_PARAM.taiLieu`/`SEARCH_PARAM.list`, khai ngay trong tệp bài.

- [ ] **Step 2:** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t lich-su` → FAIL với `tlg-lich-su: chon loai ghi de muc lich su` (chính là chiều đỏ của E1: bản hôm nay ghi `replace`).
- [ ] **Step 3: Cài**

```ts
const PUSH = { history: "push" } as const;

export const taiLieuParsers = {
	[SEARCH_PARAM.taiLieu.tab]:
		parseAsStringLiteral(TAB_TAI_LIEU).withDefault("trang"),
	[SEARCH_PARAM.taiLieu.loai]: parseAsStringLiteral(LOAI_TRANG).withOptions(PUSH),
	[SEARCH_PARAM.taiLieu.donVi]: parseAsString.withOptions(PUSH),
	[SEARCH_PARAM.taiLieu.chu]: parseAsString.withOptions(PUSH),
	[SEARCH_PARAM.taiLieu.nhom]:
		parseAsStringLiteral(NHOM_DE_XUAT).withDefault("cho").withOptions(PUSH),
	[SEARCH_PARAM.list.page]: parseAsInteger.withDefault(1).withOptions(PUSH),
	[SEARCH_PARAM.list.archived]: parseAsBoolean.withDefault(false).withOptions(PUSH),
};
```

- [ ] **Step 4:** chạy lại Step 2 → PASS; chạy riêng từng tệp `tai-lieu-loc`, `tai-lieu-cho-duyet`, `tai-lieu-da-xu-ly`, `tai-lieu-kho-rong-luu-tru`, `loc-va-kieu-xem` (cùng lệnh, đổi tên tệp, bỏ `-t`) → PASS.
- [ ] **Step 5:** commit `feat(tai-lieu-loc-giu-lich-su): bộ lọc Tài liệu ghi lịch sử`.

Verify: `bun run test` khoá `tlg_lich_su`. Eval phục vụ: E1. Independent: có.

### Task 3: Giữ thanh lọc và danh sách cũ trong lúc chờ (AC-2, AC-3, AC-5; E2, E3, E5)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach-trang.tsx:140-152, 218-343`
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/cho-duyet.tsx:60, 83-85, 92-140`
- Test: `apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx` (thêm nhóm `giu-loc`, `lan-dau`, `doi-loc-loi`)

**Interfaces:**
- Consumes: `VungDangTai` (Task 1); bộ dựng `mo`, `bam`, `canh`, `ghim` (Task 2).
- Produces: vùng danh sách Trang và Chờ duyệt mang `data-slot="vung-dang-tai"`; `[data-bo-loc]` (Trang) và nhóm `[data-nhom]` (Chờ duyệt) không bao giờ bị gỡ khi đã có dữ liệu.

- [ ] **Step 1: Viết bài đỏ.** trpc giả cho `list` và `proposals`: lượt gọi thứ nhất trả ngay; từ lượt thứ hai, `canh.treo` giữ promise tới khi bài gọi `tha()`, `canh.loi` ném `Error("mang")`. Tên hàng đổi theo lượt gọi (`Quy định A` → `Chính sách B`) để thấy cũ/mới.

```tsx
function demGo(goc: Element, chon: string): { so: () => number; dung: () => void } {
	let so = 0;
	const ob = new MutationObserver((ds) => {
		for (const d of ds) for (const n of d.removedNodes)
			if (n instanceof Element && (n.matches(chon) || n.querySelector(chon))) so += 1;
	});
	ob.observe(goc, { childList: true, subtree: true });
	return { so: () => so, dung: () => ob.disconnect() };
}

const O_GIU = [
	{ ten: "trang chon loai", man: "trang", giu: "[data-bo-loc]", lam: '[data-loai="chinh-sach"]' },
	{ ten: "trang sang trang 2", man: "trang", giu: "[data-bo-loc], nav", lam: "nut-sau" },
	{ ten: "cho duyet doi nhom", man: "cho-duyet", giu: "[data-nhom]", lam: '[data-nhom="da-xu-ly"]' },
	{ ten: "cho duyet sang trang 2", man: "cho-duyet", giu: "[data-nhom], [data-slot=table-pagination]", lam: "nut-sau" },
] as const;

describe("giu-loc", () => {
	test("giu-loc: ma tran 4 o", async () => {
		let dem = 0;
		for (const o of O_GIU) {
			const k = await mo(o.man, o.man === "cho-duyet" ? "?tab=cho-duyet" : "");
			const vung = () => k.querySelector('[data-slot="vung-dang-tai"]');
			ghim(vung()?.getAttribute("aria-busy") !== "true" && !vung()?.hasAttribute("data-dang-tai"), `tlg-giu-loc: ${o.ten} dang tai truoc khi bam`);
			ghim(k.textContent?.includes(TEN_CU[o.man]) ?? false, `tlg-giu-loc: ${o.ten} thieu hang cu truoc khi bam`);
			canh.treo = true;
			const go = demGo(k, o.giu);
			const nut = timNut(k, o.lam);
			await bam(nut);
			ghim(go.so() === 0, o.ten === "trang chon loai" ? "tlg-giu-loc: trang chon loai go thanh loc" : `tlg-giu-loc: ${o.ten} go thanh loc`);
			ghim(document.activeElement === nut || nut.contains(document.activeElement), `tlg-giu-loc: ${o.ten} mat tieu diem`);
			ghim(vung()?.getAttribute("aria-busy") === "true" && vung()?.hasAttribute("data-dang-tai") === true, `tlg-giu-loc: ${o.ten} khong bao dang tai`);
			ghim(k.textContent?.includes(TEN_CU[o.man]) ?? false, `tlg-giu-loc: ${o.ten} mat hang cu`);
			await tha();
			ghim(k.textContent?.includes(TEN_MOI[o.man]) ?? false, `tlg-giu-loc: ${o.ten} khong co hang moi`);
			ghim(vung()?.getAttribute("aria-busy") !== "true" && !vung()?.hasAttribute("data-dang-tai"), `tlg-giu-loc: ${o.ten} con dang tai sau khi ve`);
			go.dung();
			dem += 1;
			await dong();
		}
		expect(dem).toBe(4);
	});

	test("giu-loc: bam hai chip lien truoc khi ve van giu danh sach cu", async () => { … chip chinh-sach rồi quy-trinh khi treo; không khung xương, tiêu điểm ở chip thứ hai … });
	test("giu-loc: loc ra rong chi hien rong khi du lieu moi ve", async () => { … lượt hai trả rows rỗng; lúc treo không có [data-loc-rong]; sau tha có … });
});

describe("lan-dau", () => {
	test("lan-dau: ma tran 2 man x 2 trang thai", async () => { … 4 ô: treo ngay lượt đầu → có [data-slot=skeleton] và không [data-bo-loc]/[data-nhom] (ghim "tlg-lan-dau: trang lan dau khong co khung xuong" ở ô Trang chờ); lỗi lượt đầu → nút "Thử lại", bấm → canh.goi tăng 1. Ô Trang chờ mở bằng "?loai=chinh-sach" (Review Focus 5) … });
});

describe("doi-loc-loi", () => {
	test("doi-loc-loi: ma tran 2 o", async () => { … lượt hai ném lỗi: khung lỗi có "Thử lại", không TEN_CU (ghim "tlg-doi-loc-loi: trang doi loc loi treo danh sach cu" ở ô Trang), không skeleton, không [aria-busy="true"]; bấm thử lại (canh.loi = false) → goi +1, có TEN_MOI … });
});
```

Phần `…` viết đủ theo cùng khuôn ô ma trận trên lúc thi công; thông điệp ghim và số ô đếm theo đúng `evals.yaml`.

- [ ] **Step 2:** chạy ba lệnh `-t giu-loc`, `-t lan-dau`, `-t doi-loc-loi` → `giu-loc` FAIL với `tlg-giu-loc: trang chon loai go thanh loc`; `lan-dau` và `doi-loc-loi` PASS ngay (hành vi hôm nay đã đúng — đây là bài giữ hồi quy, chiều đỏ của chúng phá thử ở Step 4).
- [ ] **Step 3: Cài.** Trang:

```tsx
const ds = useQuery({
	...trpc.taiLieu.list.queryOptions({ loai: loai ?? undefined, donViId: donVi ?? undefined, chuTrangId: chu ?? undefined, page, archived }),
	placeholderData: (truoc) => truoc,
});
```

bọc khối từ dòng 218 (`rows.length === 0 && archived …`) tới hết nhánh bảng/thẻ trong `<VungDangTai dangTai={ds.isPlaceholderData}>`; `nav` phân trang đứng ngoài vùng. Chờ duyệt: cùng cách cho `proposals`, bọc `Empty`/`ItemGroup` trong `<VungDangTai dangTai={cho.isPlaceholderData}>`; `TablePagination` ngoài vùng.

- [ ] **Step 4:** ba lệnh Step 2 → PASS. Phá thử ba chiều đỏ trên bản đang có (rồi `git checkout -- <tệp>` — **commit trước khi phá**): bỏ `placeholderData` ở Trang → ra đúng `tlg-giu-loc: trang chon loai go thanh loc`; đổi `if (!ds.data) return <DangTaiDanhSach />` thành trả danh sách rỗng → `tlg-lan-dau: trang lan dau khong co khung xuong`; đặt `if (!ds.data) return <DangTaiDanhSach />` lên trước nhánh lỗi và giữ dữ liệu cũ bằng `placeholderData` cố định → `tlg-doi-loc-loi: trang doi loc loi treo danh sach cu`.
- [ ] **Step 5:** chạy riêng từng tệp `tai-lieu-*.dom.tsx` và `loc-va-kieu-xem.dom.tsx` → PASS. Commit `feat(tai-lieu-loc-giu-lich-su): giữ thanh lọc và danh sách cũ khi chờ`.

Verify: khoá `tlg_giu_loc`, `tlg_lan_dau`, `tlg_doi_loc_loi`. Eval phục vụ: E2, E3, E5. Independent: không (cần Task 1, Task 2).

### Task 4: Bàn đo màn thật `do-lich-su.mjs` (AC-4; E4, E4m)

**Files:**
- Create: `_acceptance/tai-lieu-loc-giu-lich-su/rang/do-lich-su.mjs`

**Interfaces:**
- Consumes: `moDo`, `chieuDo`, `chay`, `cho`, `taoTrangDangDung` của `_acceptance/kho-tai-lieu/rang/man-lib.mjs`; khuôn `CAY_DO` + `--chi-do` qua `spawnSync` của `_acceptance/loc-va-kieu-xem-chung/rang/chup-loc.mjs`.
- Produces: in `buoc 1: dat`, `buoc 2: dat`, mỗi bước một dòng số đo; `--chi-do` in `tlg-man-do: 3/3 chieu do ra dung ghim`. Ảnh `tlg-cho-loc-1280.png` vào `.acceptance-runs/tai-lieu-loc-giu-lich-su/evidence/`.

- [ ] **Step 1: Gieo.** Đăng nhập quản trị; `org.createDivision` + hai `org.createDepartment`; ba trang khác loại (`quy-dinh`, `chinh-sach`, `quy-trinh`) qua `taoTrangDangDung`, hai đơn vị mỗi đơn vị có trang.
- [ ] **Step 2: Bước 1 (1280).** Mở `/tai-lieu`; ghi `{href, chip}` ban đầu; bấm `[data-loai="chinh-sach"]`, chờ `location.href` có `loai=`; ghi trạng thái A; chọn đơn vị qua `[data-loc-don-vi]` + `[cmdk-item]`; chờ `donVi=` (thiếu → `tlg-man: chon don vi khong doi duong dan`, mã 1); `page.goBack()` → trạng thái phải bằng A (khác, hay pathname không kết thúc `/tai-lieu` → `tlg-man: lui lan 1 roi tai lieu`, mã 1); `page.goBack()` lần nữa → bằng ban đầu. `chip` = `aria-pressed`/`data-state="on"` trong `[data-bo-loc]`.
- [ ] **Step 3: Bước 2 (1280).** `page.setRequestInterception(true)`; yêu cầu có `taiLieu.list` thì đếm và trì hoãn 3 giây rồi `continue()`. Cài `MutationObserver` đếm lần `[data-bo-loc]` bị gỡ (lưu ở `window.__go`). Đối chứng trước khi bấm: `aria-busy` của `[data-slot="vung-dang-tai"]` không là `"true"`, opacity tính = 1. Bấm chip `quy-trinh`; trong lúc chờ: `document.activeElement` là chip vừa bấm, `aria-busy === "true"`, opacity tính < 1, số yêu cầu bị chặn ≥ 1 (thiếu → `tlg-man: khong chan duoc taiLieu.list`, mã 1); chụp ảnh. Chờ về: `window.__go === 0` (khác → `tlg-man: thanh loc bi go khi cho`, mã 1), opacity = 1.
- [ ] **Step 4: Ba chiều đỏ** (`CAY_DO`, mỗi chiều một bản sao riêng qua `chieuDo`): (1) `tai-lieu-search-params.ts` bỏ mọi `.withOptions(PUSH)` → `tlg-man: lui lan 1 roi tai lieu`; (2) `danh-sach-trang.tsx` bỏ dòng `placeholderData` → `tlg-man: thanh loc bi go khi cho`; (3) cờ môi trường của bàn đo tắt trì hoãn trên bản sao → `tlg-man: khong chan duoc taiLieu.list`. `--chi-do` chạy cả ba, mỗi chiều phải ra đúng ghim và mã 1, rồi in `tlg-man-do: 3/3 chieu do ra dung ghim`.
- [ ] **Step 5:** `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/tai-lieu-loc-giu-lich-su/rang/do-lich-su.mjs"` → exit 0; cùng lệnh kèm `--chi-do` → exit 0. Commit `test(tai-lieu-loc-giu-lich-su): bàn đo lịch sử và thanh lọc trên màn thật`.

Verify: khoá `tlg_man`, `tlg_man_do`. Eval phục vụ: E4, E4m. Independent: không (cần Task 2, Task 3).

### Task 5: Lượt kiểm toàn kho trước S4

**Files:** không tệp mới; sổ quyết định thêm dòng `approach` S2 cho `VungDangTai` (bậc 5, tệp ngoài `tai-lieu/**`).

- [ ] **Step 1:** từ gốc kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` → cả năm xanh.
- [ ] **Step 2:** `bun run lint` báo `organizeImports` thì `bunx biome check --write <tệp>` rồi chạy lại.
- [ ] **Step 3:** hạ contract `status: implemented` khi S3 xong; commit.

Verify: năm lệnh. Eval phục vụ: tất cả (đường nền). Independent: không.
