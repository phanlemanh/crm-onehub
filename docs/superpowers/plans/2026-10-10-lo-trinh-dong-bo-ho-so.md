# Lộ trình: ngăn chi tiết dùng khung Thoả thuận — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ngăn chi tiết việc của trang Lộ trình dựng bằng họ `DetailSheet` như ngăn Thoả thuận; sửa cột Mốc ở 375, căn chữ thẻ Bảng cột, trạng thái bật của «Đã bác»; ghi LT1 đã lên onehub.

**Architecture:** `HoSoViec` đổi từ `Sheet` + `Card` sang `DetailSheet`/`DetailSheetHeader`/`DetailSheetStats`/`DetailSheetSection`. `DetailSheet` nhận thêm thuộc tính `data-*` chuyển xuống `SheetContent`. Ba lỗi sửa tại chỗ trong `apps/app/components/lo-trinh`. Phép đo màn mới ở `_acceptance/lo-trinh-dong-bo-ho-so/rang/`.

**Tech Stack:** Next 16, React 19, `@crm/ui`, nuqs, bun test (happy-dom), puppeteer-core.

**Spec:** `docs/superpowers/specs/2026-10-10-lo-trinh-dong-bo-ho-so-design.md`

## Global Constraints

- Không viết chú thích trong mã.
- `/packages/ui` là nguồn duy nhất của giao diện; không đè `className` lên thành phần `@crm/ui`.
- `apps/app/test/lo-trinh.dom.tsx` và `apps/app/test/ngan-ban-ghi-giu.dom.tsx` không được sửa (E9).
- Chỗ gọi `DetailSheet` ngoài `apps/app/components/lo-trinh` không đổi (E10).
- Giữ mọi `data-lo-trinh-*` mà phép đo LT1 bám.

## Review Focus

- Việc không có `bat_khi` lẫn `vi_sao` → không có mục «Chi tiết» (Task 1 test, dòng 4).
- Việc không có mốc → ô Mốc ghi «Chưa hẹn mốc» trong dải ô (Task 1 test, dòng 2).
- Ngăn mở bằng `?viec=` trên đường dẫn rồi đóng → không có phần tử để trả tiêu điểm, không lỗi (`DetailSheet` đã kiểm `isConnected`).
- Ngày dài nhất «30 thg 10, 2026» + «Trễ 120 ngày» ở 375 (Task 4 đo mọi con cháu).
- Bật «Đã bác» rồi tắt → danh sách cũ trở lại (Task 4 dòng da-bac).

---

### Task 1: Khung chi tiết chung cho ngăn việc  (phục vụ E1, E9, E10 · independent: false)

**Files:**
- Modify: `apps/app/components/detail-sheet.tsx` (`DetailSheet`)
- Modify: `apps/app/components/lo-trinh/ho-so-viec.tsx`
- Create: `apps/app/test/lo-trinh-khung.dom.tsx`

**Interfaces:**
- Produces: `DetailSheet({ open, onOpenChange, size, className, children, ...data })` với `data: { [k: \`data-${string}\`]: string | undefined }` chuyển xuống `SheetContent`.

- [ ] **Step 1: Viết test hỏng** — `lo-trinh-khung.dom.tsx`, cùng khung dựng với `lo-trinh.dom.tsx` (mock trpc, next/navigation; `docTrangLoTrinh(LO-TRINH.mau.html)`; `NuqsTestingAdapter`, `LocaleProvider vi`, `TooltipProvider`). `describe("khung-chung")`, với MỌI việc của tệp mẫu: mở `?vongDoi=tat-ca&viec=<khoa>`, kiểm năm dòng của E1; thông điệp ghim «ngan khong dung khung chi tiet chung» khi thiếu `[data-slot=detail-sheet-stats]`.
- [ ] **Step 2: Chạy** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-khung.dom.tsx -t khung-chung` → FAIL với thông điệp ghim (chiều đỏ trên mã cũ).
- [ ] **Step 3: `DetailSheet` chuyển tiếp `data-*`**

```tsx
export function DetailSheet({
	open,
	onOpenChange,
	size = "2xl",
	className,
	children,
	...data
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	size?: SheetSize;
	className?: string;
	children: ReactNode;
} & { [k: `data-${string}`]: string | undefined }) {
```

và `<SheetContent {...data} ref={content} …>`.

- [ ] **Step 4: Dựng lại `HoSoViec`**

```tsx
<DetailSheet data-lo-trinh-chi-tiet-viec={v?.ma} onOpenChange={(mo) => (mo ? null : dong())} open={v !== undefined}>
	{v ? (
		<>
			<DetailSheetHeader
				description={<span translate="no">{v.ma} · {v.loTen}{v.nhom ? ` · ${v.nhom}` : ""}</span>}
				title={<span translate="no">{v.cau_giao}</span>}
			/>
			<DetailSheetStats>
				<DetailSheetStat label={m.hoSo.trangThai}><OTrangThai v={v} /></DetailSheetStat>
				<DetailSheetStat label={m.hoSo.moc}>…ô mốc như cũ…</DetailSheetStat>
				<DetailSheetStat label={m.hoSo.loTrinh}><span translate="no">{v.loTen}</span></DetailSheetStat>
				<DetailSheetStat label={m.hoSo.nhom}><span translate="no">{v.nhom || m.loc.khongNhom}</span></DetailSheetStat>
			</DetailSheetStats>
			<DetailSheetBody>
				{v.theo_loi || v.co.length ? <DetailSheetSection>…hai Alert cũ…</DetailSheetSection> : null}
				{v.bat_khi || v.vi_sao ? (
					<DetailSheetSection title={m.hoSo.chiTiet}>
						<DetailSheetProperties columns={1}>
							{v.bat_khi ? <DetailSheetProperty label={m.hoSo.thanhCongKhi}><span translate="no">{v.bat_khi}</span></DetailSheetProperty> : null}
							{v.vi_sao ? <DetailSheetProperty label={m.hoSo.viSao}><span translate="no">{v.vi_sao}</span></DetailSheetProperty> : null}
						</DetailSheetProperties>
					</DetailSheetSection>
				) : null}
				{canTruoc.length ? <DetailSheetSection title={m.hoSo.canXongTruoc}><ItemGroup data-lo-trinh-can-truoc>…</ItemGroup></DetailSheetSection> : null}
				{dangCho.length ? <DetailSheetSection title={m.hoSo.dangCho}><ItemGroup data-lo-trinh-dang-cho>…</ItemGroup></DetailSheetSection> : null}
			</DetailSheetBody>
		</>
	) : null}
</DetailSheet>
```

- [ ] **Step 5: Chạy** test Step 2 → PASS; `bash _acceptance/lo-trinh-dong-bo-ho-so/rang/hoi-quy.sh` (Task 4) → mọi lệnh 0.
- [ ] **Step 6: Commit**

### Task 2: Ba lỗi production  (phục vụ E5, E6, E7 · independent: false)

**Files:**
- Modify: `apps/app/components/lo-trinh/trang-lo-trinh.tsx` (cột Mốc, nút «Đã bác»)
- Modify: `apps/app/components/lo-trinh/bang-cot.tsx` (`NutThe`)

- [ ] **Step 1: Cột Mốc** — `width: "w-28 md:w-[16%]"` (ô 112px đủ cho ngày và «Trễ n ngày» cỡ `xs`).
- [ ] **Step 2: `NutThe`** — `className={cn(className, "text-start")}` trên `<button>` của chính trang.
- [ ] **Step 3: «Đã bác»** — `Toggle` của `@crm/ui/components/toggle`:

```tsx
<Toggle
	data-lo-trinh-nut-da-bac
	onPressedChange={(bat) => setLt({ daBac: bat })}
	pressed={lt.daBac}
	size="sm"
	variant="outline"
>
	{m.thanhCongCu.daBac}
</Toggle>
```

- [ ] **Step 4: Chạy** `ltc_da_bac`, `ltc_chi_doc`, `ltc_cach_xem` → 0 (bài LT1 bám `[data-lo-trinh-nut-da-bac]` và `aria-pressed` — Radix Toggle giữ `aria-pressed`).
- [ ] **Step 5: Commit**

### Task 3: Kế hoạch LT1  (phục vụ E8 · independent: true)

**Files:**
- Modify: `docs/plan/lo-trinh-okr.json` (hàng `LT1`)
- Modify: `LO-TRINH.html`, `PRODUCT-MAP.md` (máy vẽ lại)
- Create: `_acceptance/lo-trinh-dong-bo-ho-so/rang/ke-hoach.mjs`

- [ ] **Step 1:** `ke-hoach.mjs` (gốc kho suy từ `import.meta.url`): đọc JSON, hàng `LT1`; đọc `LO-TRINH.html` qua `apps/app/lib/lo-trinh/doc-du-lieu.js`; chạy `product-map.mjs --root <gốc> --check` của gói giải qua `scripts/resolve-plugin.mjs --plugin acceptance-gate --require scripts/product-map.mjs`. Mỗi ý một dòng DUNG/SAI; thoát 1 khi có SAI. Chạy → SAI «LT1 trong kế hoạch chưa ghi đã lên onehub».
- [ ] **Step 2:** sửa hàng LT1: `"trang_thai": "đã lên onehub"`, `"buoc_ke": "Đã gộp 10/10 (#329); còn phiên nghiệm thu"`, `"pr": [329]`; chạy `node <AG>/scripts/product-map.mjs --root .`.
- [ ] **Step 3:** chạy `ke-hoach.mjs` → 0. Commit.

### Task 4: Phép đo màn và lưới hồi quy  (phục vụ E2–E7, E9, E10 · independent: false)

**Files:**
- Create: `_acceptance/lo-trinh-dong-bo-ho-so/rang/do-man.mjs`
- Create: `_acceptance/lo-trinh-dong-bo-ho-so/rang/hoi-quy.sh`
- Create: `_acceptance/lo-trinh-dong-bo-ho-so/rang/thiet-ke.sh`

- [ ] **Step 1: `hoi-quy.sh`** — `set -e`; `git diff --quiet $(git merge-base HEAD origin/onehub) -- apps/app/test/lo-trinh.dom.tsx apps/app/test/ngan-ban-ghi-giu.dom.tsx || { echo "SAI bai kiem cu bi sua"; exit 1; }`; rồi lần lượt lệnh của `ltc_hien … ltc_loi` (chép từ `config.yaml`) và `bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ban-ghi-giu.dom.tsx`.
- [ ] **Step 2: `thiet-ke.sh`** — design-gate tĩnh như `ltc_thiet_ke` cho `apps/app/components/lo-trinh/*.tsx` + `detail-sheet.tsx`; `git diff --name-only <base> -- $(git grep -l '@/components/detail-sheet' -- apps/app ':!apps/app/components/lo-trinh' ':!apps/app/components/detail-sheet.tsx')` rỗng; `git diff --numstat <base> -- apps/app/components/detail-sheet.tsx` cột xoá ≤ 2.
- [ ] **Step 3: `do-man.mjs`** — theo khung `_acceptance/trang-lo-trinh-trong-crm/rang/do-man.mjs` (canhCay, phiên quản trị, puppeteer), MA_TRAN viết trước: `ngan-1280`, `ngan-375`, `tieu-diem-1280`, `cot-moc-375`, `cot-moc-1280`, `the-bang-cot`, `da-bac`. Thoả thuận: lấy deal đầu của tổ chức quản trị, không có thì tạo company + deal tạm (giai đoạn đầu của tổ chức), dọn trong `finally`. Mỗi dòng đúng như `expected` của E2–E7; ảnh vào `BANG_CHUNG`.
- [ ] **Step 4: Chiều đỏ** — chạy `do-man.mjs` trên cây `origin/onehub` (worktree tạm, `git worktree add`) trước khi gộp mã Task 1–2: kỳ vọng SAI ở `ngan-1280`, `ngan-375`, `tieu-diem-1280`, `cot-moc-375`, `the-bang-cot`, `da-bac`; ghi kết quả vào `_acceptance/lo-trinh-dong-bo-ho-so/chieu-do.md`.
- [ ] **Step 5: Chiều xanh** — `bun run do:man`-kiểu: `NGUOI=ada@trycomp.ai bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/lo-trinh-dong-bo-ho-so/rang/do-man.mjs"` → 0. Commit.

## Self-review

Spec → task: khung ngăn (T1), chuyển tiếp `data-*` (T1), ba lỗi (T2), kế hoạch (T3), mọi AC có đo (T4 + T1). Không còn chỗ trống.
