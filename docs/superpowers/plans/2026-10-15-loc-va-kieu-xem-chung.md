# Lọc và kiểu xem chung — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ba màn danh sách (Thoả thuận, Onboarding, Tài liệu) dùng chung chip lọc có số đếm, chung `ViewSwitch`, và ghi bộ lọc lên đường dẫn bằng nuqs, để đường dẫn gửi đi mở ra đúng bộ lọc.

**Architecture:** Hai prop mới ở `packages/ui` (`ToggleGroupItem.count`, `ViewSwitch.disabled`) và `DataTable` vẽ `tabs` thành chip. `apps/app` bỏ số đếm tự vẽ, bỏ `ToggleGroup` tự ghép cho kiểu xem, và Tài liệu đọc/ghi bộ lọc bằng `useQueryStates(taiLieuParsers, { shallow: false })` — truy vấn danh sách lấy khoá từ nuqs nên đổi ngay trên trang, còn `shallow: false` giữ các phần máy chủ (nút hành động đầu trang) cùng bộ lọc.

**Tech Stack:** Next 16 App Router, React 19, nuqs 2.8, TanStack Query, Radix ToggleGroup/Select, bun test + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-14-loc-va-kieu-xem-chung-design.md` · hợp đồng `_acceptance/loc-va-kieu-xem-chung/contract.md` · evals `_acceptance/loc-va-kieu-xem-chung/evals.yaml`.

## Global Constraints

- Không viết chú thích trong code (`AGENTS.md`).
- `/packages/ui` là nguồn duy nhất của giao diện; biến thể mới làm ở đó, không đè `className` ở chỗ gọi (`docs/design.md`).
- Số đếm: `text-muted-foreground tabular-nums`, không `opacity-*` (`docs/design.md`, «Chip lọc và chuyển kiểu xem»).
- Giữ nguyên tên khoá đường dẫn: `status`, `view`, `trangThai`, `cachXem`, `cachChia`, `loai`, `donVi`, `chuTrang`, `archived`, `page`, `tabTaiLieu`, `nhomDeXuat`.
- Tệp chữ và cấu hình dùng chung chỉ thêm dòng (luật 7 của đợt).
- Không đụng `apps/app/components/lo-trinh/**`.
- Verify theo `CLAUDE.md`: `bun run test`, `check-types`, `lint`, `lint:slop`, `build` ở cuối; bài DOM chạy bằng `TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts`.

## Review Focus

1. Thoả thuận đang xem lưu trữ: `ViewSwitch` phải khoá cả ô chọn ở điện thoại, không chỉ nhóm nút — bài E1 ô `disabled`, E4 ô lưu trữ.
2. Đường dẫn mang giá trị lạ (`status=abc`, `loai=xyz`): parser bỏ qua, màn về mặc định, không ném lỗi — thêm ô vào bài `duong-dan` (Task 5).
3. Chip số 0 vẫn bấm được và hiện «0», không ẩn — E1 ô `count={0}`, E3 dùng `facetCounts` có một trạng thái 0 ở ô phụ.
4. Bấm hàng ở Tài liệu vẫn mở trang (bỏ `router.push` không được làm mất điều hướng hàng) — bài `tai-lieu` thêm ô bấm hàng dẫn tới `Link` (Task 4).
5. Đổi kiểu xem không xoá bộ lọc — bài `kieu-xem` khẳng định `status`/`trangThai` còn nguyên sau khi đổi (Task 3).

---

### Task 1: `packages/ui` — số đếm, `ViewSwitch.disabled`, chip trạng thái của `DataTable`

Phục vụ E1 (AC-1), là nền của E3, E4. `independent: false` (mọi task sau dùng prop mới).

**Files:**
- Modify: `packages/ui/src/components/toggle-group.tsx` (`ToggleGroupItem`)
- Modify: `packages/ui/src/components/view-switch.tsx`
- Modify: `packages/ui/src/components/data-table.tsx` (`FacetCount` dòng ~246, nút «Bộ lọc» dòng ~548, khối `tabs` dòng ~572-610)
- Test: `packages/ui/test/loc-va-kieu-xem.dom.tsx`

**Interfaces:**
- Produces: `ToggleGroupItem` nhận `count?: number`, vẽ `<span data-slot="toggle-group-item-count" className="text-muted-foreground tabular-nums">`; `ViewSwitch` nhận `disabled?: boolean`; `DataTable` với `tabs` vẽ `ToggleGroup` `aria-label={tabs.label ?? msg.table.status}` — thêm khoá `label?: string` vào `DataTableTabs`.

- [ ] **Step 1: Viết bài đỏ** `packages/ui/test/loc-va-kieu-xem.dom.tsx` với ma trận bốn ô `ToggleGroupItem` (3, 0, vắng, asChild), ba số đếm của `DataTable` (facet, nút bộ lọc, chip trạng thái có tổng ở «Tất cả»), và `ViewSwitch disabled`. Mỗi ô ghim một thông điệp riêng `lkx-dem: …`. Chiều đỏ: hai thành phần giả ngay trong tệp (item vẽ `opacity-60`, `ViewSwitch` bỏ `disabled` ở ô chọn) chạy cùng hàm kiểm và phải ném đúng thông điệp ghim.

```tsx
const kiemDem = (goc: ParentNode, nhan: string, mong: string) => {
	const o = goc.querySelector('[data-slot="toggle-group-item-count"]');
	if (!o) throw new Error(`lkx-dem: ${nhan} thieu so dem`);
	if (o.textContent !== mong) throw new Error(`lkx-dem: ${nhan} so ${o.textContent} thay vi ${mong}`);
	if ([...o.classList].some((c) => c.startsWith("opacity-"))) throw new Error("lkx-dem: so dem mo bang opacity");
	if (!o.classList.contains("text-muted-foreground") || !o.classList.contains("tabular-nums"))
		throw new Error(`lkx-dem: ${nhan} khong phai chu phu tabular-nums`);
};
```

- [ ] **Step 2: Chạy, thấy đỏ** — `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/loc-va-kieu-xem.dom.tsx` → FAIL «lkx-dem: … thieu so dem».

- [ ] **Step 3: Cài đặt.**

```tsx
function ToggleGroupItem({ className, children, variant = "default", size = "default", asChild, count, ...props }:
	React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants> & { count?: number }) {
	…
			{asChild ? children : (
				<>
					<ToggleMark variant={context.variant || variant} />
					{children}
					{count === undefined ? null : (
						<span data-slot="toggle-group-item-count" className="text-muted-foreground tabular-nums">{count}</span>
					)}
				</>
			)}
```

`ViewSwitch`: thêm `disabled?: boolean`, truyền `disabled` vào `ToggleGroup` và `Select`. `FacetCount` và số trên nút «Bộ lọc»: `opacity-60` → `text-muted-foreground`. Khối `tabs`: thay `DropdownMenu` bằng

```tsx
<div className="max-w-full overflow-x-auto">
	<ToggleGroup aria-label={tabs.label ?? msg.table.status} size="sm" type="single" variant="outline"
		value={query.tab} onValueChange={(v) => { if (v) query.setTab(v); }}>
		<ToggleGroupItem value="all" count={tabCounts === undefined ? undefined : tabs.options.reduce((n, o) => n + (tabCounts[o.value] ?? 0), 0)}>
			{tabs.allLabel ?? "All"}
		</ToggleGroupItem>
		{tabs.options.map((o) => (
			<ToggleGroupItem key={o.value} value={o.value} count={tabCounts === undefined ? undefined : (tabCounts[o.value] ?? 0)}>{o.label}</ToggleGroupItem>
		))}
	</ToggleGroup>
</div>
```

`msg.table.status` thêm vào `packages/ui/src/lib/messages.ts` (en «Status», vi «Trạng thái») — chỉ thêm dòng. `query.setTab` đã đưa trang về 1 (`use-table-query.ts`); kiểm lại ở Task 3.

- [ ] **Step 4: Chạy, thấy xanh** cùng lệnh; thêm `bun test ./test/data-table-loc-ro.dom.tsx ./test/khep-ky-bien-the.dom.tsx` để chắc không vỡ bài cũ.
- [ ] **Step 5: Commit** `feat(loc-va-kieu-xem-chung): ToggleGroupItem count, ViewSwitch disabled, DataTable vẽ trạng thái thành chip`.

### Task 2: `apps/app` — số đếm qua `count` và bài quét

Phục vụ E2 (AC-2). `independent: false` (cần Task 1).

**Files:**
- Modify: `apps/app/app/(app)/[slug]/onboarding/danh-muc-cong-cu.tsx:70-72` (`TrangThaiToggle`)
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach-trang.tsx:198-212`
- Modify: `apps/app/app/(app)/[slug]/viec/viec-cua-toi.tsx:80-86`
- Create: `apps/app/test/loc-va-kieu-xem.spec.ts`

**Interfaces:** Consumes `ToggleGroupItem.count` (Task 1).

- [ ] **Step 1: Viết bài quét** dùng `phanTich`, `moiPhanTu`, `tenThe`, `moiTepTsx` của `apps/app/test/lib/quet-jsx.ts`. Với mỗi `ToggleGroupItem` trong mọi `.tsx` dưới `apps/app` (bỏ `node_modules`, `.next`, `test/fixtures`): con là phần tử JSX có `className` chứa `tabular-nums` → vi phạm `lkx-quet: ToggleGroupItem tu dat so dem o <tệp>`. Miễn đúng một tệp `apps/app/components/lo-trinh/trang-lo-trinh.tsx`; tệp miễn mà hết vi phạm → `lkx-quet: mien tru thua`. Quan hệ: tập tệp có `ToggleGroupItem` chứa ba tệp đích, mỗi tệp đích có ít nhất một `ToggleGroupItem` mang thuộc tính `count`. Chiều đỏ: hàm quét nhận `DocTep` — bản đọc chèn `<span className="tabular-nums opacity-60">` vào `danh-muc-cong-cu.tsx` phải ra đúng thông điệp ghim.
- [ ] **Step 2: Chạy, thấy đỏ** — `cd apps/app && bun test ./test/loc-va-kieu-xem.spec.ts` → FAIL nêu ba tệp đích.
- [ ] **Step 3: Cài đặt** — ba chỗ bỏ `<span>` tự đặt, truyền `count={counts?.[tt] ?? 0}`, `count={tatCa}` / `count={facetCounts[l]}`, `count={du ? du.demNhom[n] : undefined}`. Việc của tôi giữ `data-dem` bằng cách chuyển bài cũ (`viec-bang.dom.tsx`) sang đọc `[data-slot="toggle-group-item-count"]` nếu nó đọc `[data-dem]`.
- [ ] **Step 4: Chạy xanh** bài quét + `onboarding-giong-deals.dom.tsx`, `tai-lieu-loc.dom.tsx`, `viec-bang.dom.tsx`.
- [ ] **Step 5: Commit** `feat(loc-va-kieu-xem-chung): ba màn truyền số đếm qua count`.

### Task 3: Thoả thuận và Onboarding — chip trạng thái, `ViewSwitch`

Phục vụ E3 (AC-3), E4 (AC-4). `independent: false`.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/deals/deals-table.tsx:255-275` (`viewToggle` → `ViewSwitch`), dòng 322 (`tabs` thêm `label: m.tabs.label` — thêm khoá `label` vào `apps/app/lib/messages/deals.ts`, chỉ thêm dòng)
- Modify: `apps/app/app/(app)/[slug]/onboarding/danh-muc-cong-cu.tsx` (`CachXemToggle`, `CachChiaToggle` → `ViewSwitch`)
- Create: `apps/app/test/loc-va-kieu-xem.dom.tsx` (nhóm `trang-thai`, `kieu-xem`)

**Interfaces:** Consumes `ViewSwitch({ label, value, items, onValueChange, disabled })`, `DataTableTabs.label`.

- [ ] **Step 1: Viết bài đỏ.** Dựng `DealsTable` thật trong `NuqsTestingAdapter searchParams="?page=2" onUrlUpdate`, mock `trpc.deals.list` theo hợp đồng thật với `facetCounts.status = { open: 4, closed: 2 }`, chờ truy vấn trả về (đếm gọi > 0). `trang-thai`: ba chip theo thứ tự, số 6 · 4 · 2, không `dropdown-menu-trigger` của trạng thái, trước khi bấm có `page=2`, bấm «Đã chốt» → cập nhật cuối có `status=closed` và không `page`. Chiều đỏ trong tệp: một `DataTable` giả giữ menu thả → «lkx-trang-thai: thoa thuan loc trang thai bang menu tha»; một giả không đặt lại trang → «lkx-trang-thai: doi trang thai khong ve trang 1». `kieu-xem`: ma trận 3 công tắc × 2 dạng (nút/ô chọn) = 6 ô; bấm nút thứ hai → `view=board`, `cachXem=bang-cot`, `cachChia=<DANH_MUC_CACH_CHIA[1]>`; sau khi đổi kiểu xem, `status`/`trangThai` còn nguyên (Review Focus 5); `archived=true` → mọi nút và ô chọn `disabled`. Chiều đỏ: `ToggleGroup` tự ghép → «lkx-kieu-xem: thoa thuan khong dung ViewSwitch».
- [ ] **Step 2: Chạy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/loc-va-kieu-xem.dom.tsx -t "trang-thai|kieu-xem"`.
- [ ] **Step 3: Cài đặt.**

```tsx
const viewToggle = (
	<ViewSwitch
		disabled={input.archived}
		items={DEALS_VIEWS.map((v) => ({ value: v, label: m.view[v] }))}
		label={m.view.label}
		value={board ? "board" : "table"}
		onValueChange={(next) => {
			const chosen = DEALS_VIEWS.find((v) => v === next);
			if (chosen) void setView({ view: chosen });
		}}
	/>
);
```

`CachXemToggle` và `CachChiaToggle` giữ tên và chữ ký, thân thay bằng `ViewSwitch` cùng `items`.
- [ ] **Step 4: Chạy xanh** cùng lệnh + `bang-crm-loc-ro.dom.tsx`, `keo-tha-thoa-thuan.dom.tsx`, `onboarding-giong-deals.dom.tsx`, `danh-muc-quan-ly.dom.tsx`.
- [ ] **Step 5: Commit** `feat(loc-va-kieu-xem-chung): Thoả thuận lọc trạng thái bằng chip, ViewSwitch ở Thoả thuận và Onboarding`.

### Task 4: Tài liệu ghi bộ lọc bằng nuqs

Phục vụ E5 (AC-5). `independent: false`.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach-loc.ts` (bỏ `thamSo`; thêm `duongLoc`)
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach.tsx`, `danh-sach-trang.tsx`, `cho-duyet.tsx`
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/tai-lieu-search-params.ts` (tách parser sang tệp không `nuqs/server` nếu client cần: `tai-lieu-parsers.ts` dùng `nuqs` thường; loader giữ ở tệp cũ)
- Modify tests: `apps/app/test/tai-lieu-loc.dom.tsx`, `tai-lieu-cho-duyet.dom.tsx`, `tai-lieu-da-xu-ly.dom.tsx`, `tai-lieu-kho-rong-luu-tru.dom.tsx` (từ mock `router.push` sang `NuqsTestingAdapter`)
- Test: `apps/app/test/loc-va-kieu-xem.dom.tsx` (nhóm `tai-lieu`)

**Interfaces:**
- Produces: `useLocTaiLieu(): [Loc, (sua: Partial<Loc>) => Promise<URLSearchParams>]` trong `danh-sach-loc.ts` (bọc `useQueryStates(taiLieuParsers, { shallow: false })`, ánh xạ khoá ↔ trường `Loc`); `duongLoc(goc: string, loc: Partial<Loc>): string` dựng bằng `createSerializer(taiLieuParsers)`.

- [ ] **Step 1: Viết bài đỏ** nhóm `tai-lieu`: ma trận 7 hành động (loại, đơn vị, chủ trang, lưu trữ, xoá lọc, sang trang 2, đổi nhóm), mỗi ô dựng từ `?page=2` (trừ «sang trang 2»), khẳng định trước khi bấm, rồi sau khi bấm: cập nhật cuối mang đúng khoá và giá trị, không `page` với hành động đổi lọc, `router.push` đếm 0, truy vấn `taiLieu.list`/`taiLieu.proposals` gọi lại trên cùng lần dựng với đầu vào mới và tên hàng đổi theo lần trả mới. Quan hệ với máy chủ: chuỗi cuối qua `loadTaiLieuSearchParams` ra đúng giá trị. Ô thêm (Review Focus 4): bấm hàng gọi `click` của `Link` trong hàng. Quét chuỗi: `danh-sach-trang.tsx`, `cho-duyet.tsx` không chứa `router.push`, `danh-sach-loc.ts` không chứa `URLSearchParams`. Chiều đỏ: bản giả gọi `router.push(toi(...))` → «lkx-tai-lieu: chon loai di qua router.push»; bản giả ghi đường dẫn mà truy vấn đọc prop máy chủ → «lkx-tai-lieu: chon loai khong doi danh sach tren trang».
- [ ] **Step 2: Chạy đỏ** `… ./test/loc-va-kieu-xem.dom.tsx -t tai-lieu`.
- [ ] **Step 3: Cài đặt.**

```ts
export function useLocTaiLieu() {
	const [q, dat] = useQueryStates(taiLieuParsers, { shallow: false });
	const loc: Loc = {
		tab: q[SEARCH_PARAM.taiLieu.tab],
		loai: q[SEARCH_PARAM.taiLieu.loai],
		donVi: q[SEARCH_PARAM.taiLieu.donVi],
		chu: q[SEARCH_PARAM.taiLieu.chu],
		nhom: q[SEARCH_PARAM.taiLieu.nhom],
		page: Math.max(1, q[SEARCH_PARAM.list.page]),
		archived: q[SEARCH_PARAM.list.archived],
	};
	const doi = (sua: Partial<Loc>) => dat(sangKhoa(sua));
	return [loc, doi] as const;
}
```

`sangKhoa` ánh xạ `Partial<Loc>` sang khoá parser (`page: 1` → `null` để nuqs xoá khoá mặc định). `DanhSach` bỏ prop bộ lọc, đọc `useLocTaiLieu`; `page.tsx` thôi truyền chúng (giữ prefetch). Thẻ trang con: `href={duongLoc(url(duongDanhSach()), { ...BO_LOC_TRONG, tab: "cho-duyet" })}`. Hàng bảng: `onClick={(e) => e.currentTarget.querySelector("a")?.click()}` — `Link` trong hàng là nguồn duy nhất của đường dẫn.
- [ ] **Step 4: Chạy xanh** nhóm `tai-lieu` + bốn bài Tài liệu cũ đã chuyển sang `NuqsTestingAdapter`.
- [ ] **Step 5: Commit** `feat(loc-va-kieu-xem-chung): Tài liệu đọc và ghi bộ lọc bằng nuqs`.

### Task 5: Đường dẫn gửi đi mở đúng bộ lọc

Phục vụ E6 (AC-6). `independent: false` (cần Task 3, 4).

**Files:** Test: `apps/app/test/loc-va-kieu-xem.dom.tsx` (nhóm `duong-dan`).

- [ ] **Step 1: Viết bài** ma trận 5 ô (Thoả thuận bảng `?status=closed&page=2`, bảng cột `?view=board`, Onboarding `?trangThai=da-dong&cachXem=bang-cot&cachChia=<DANH_MUC_CACH_CHIA[1]>`, Tài liệu `?loai=<LOAI_TRANG[1]>&donVi=dv1&chuTrang=u1&archived=true&page=2`, Chờ duyệt `?tabTaiLieu=cho-duyet&nhomDeXuat=da-xu-ly&page=2`; hai ô Tài liệu là chuỗi chép tay). Mỗi ô: dựng màn chỉ từ `searchParams`, đọc điều khiển và đầu vào truy vấn; khứ hồi — bấm đổi một bộ lọc, lấy chuỗi cuối, dựng lại màn mới, so trạng thái. Thêm ô giá trị lạ (Review Focus 2): `?status=abc&loai=xyz` → màn về mặc định, không lỗi. Chiều đỏ: Thoả thuận giả đọc `view` từ mặc định → «lkx-duong-dan: thoa thuan mo duong dan mat bang cot»; Tài liệu giả đọc `loai` từ `useState(null)` → «lkx-duong-dan: tai lieu mo duong dan mat loai».
- [ ] **Step 2: Chạy** `… -t duong-dan` — xanh nếu Task 3, 4 đúng; đỏ chứng bằng hai bản giả.
- [ ] **Step 3: Commit** `test(loc-va-kieu-xem-chung): ma trận đường dẫn gửi đi ba màn`.

### Task 6: Bàn đo màn thật

Phục vụ E7, E7m, E7j (AC-7). `independent: true` với Task 5 (chỉ cần Task 1–4).

**Files:**
- Create: `_acceptance/loc-va-kieu-xem-chung/rang/chup-loc.mjs` (khuôn theo `_acceptance/chu-man-tieng-viet-khong-tran/rang/chup-truong.mjs`: `CAY_DO` cho ghim, `--chieu-do`, `--chi-do`, ảnh ra `.acceptance-runs/loc-va-kieu-xem-chung/evidence/`)

- [ ] **Step 1: Viết bàn đo**: phiên đo qua `mot-luot.sh` + `tien-de.mjs`; `dev:session` quản trị; gieo qua đường ghi thật — thoả thuận mở và đã chốt (`deals.create`, `deals.update`), kế hoạch onboarding đang chạy và đã đóng, ba trang tài liệu khác loại (cùng đường ghi bài `onboarding-giong-deals` và `tim-va-dieu-huong-kho` đang dùng). Bước 1 (3 màn × 360/1280): ở 360 Thoả thuận bấm «Bộ lọc» trước khi đo; mọi `[data-slot=toggle-group-item-count]` có `getComputedStyle(el).color` bằng màu của một phần tử `text-muted-foreground` tham chiếu và `opacity` tính dồn từ gốc bằng 1; `ViewSwitch` đúng dạng theo khổ; `document.scrollingElement.scrollWidth <= innerWidth`. Bước 1b: Tài liệu 1280 bấm chip loại khác trên cùng trang, tên hàng đầu đổi, số mục `navigation` không tăng. Bước 2: chọn bộ lọc mỗi màn, đọc `location.href`, mở trang mới cùng phiên, đọc điều khiển.
- [ ] **Step 2: Chiều đỏ trên bản sao** (`CONG_SAO`): bốn bản phá theo E7 — `opacity-60` ở item; `deals-table` trả lại `ToggleGroup`; `danh-sach-trang` đọc `loai` từ `useState`; truy vấn danh sách đọc prop máy chủ — mỗi bản ra đúng thông điệp ghim, mã 1.
- [ ] **Step 3: Chạy** `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/loc-va-kieu-xem-chung/rang/chup-loc.mjs"` và `… --chi-do` — mã 0, đủ 6 ảnh.
- [ ] **Step 4: Commit** `test(loc-va-kieu-xem-chung): bàn đo ba màn ở 360 và 1280`.

### Task 7: Cổng năm lệnh

- [ ] `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build` — đều xanh. Đỏ ở phần không chạm thì theo luật 15 của đợt.
- [ ] Contract `status: implemented`, commit, sang S4.
