# Tạo và sửa OKR cùng khung với deal — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo và sửa Mục tiêu, thêm và sửa KR mở trong ngăn trượt phải cùng khung với ngăn tạo deal, trạng thái mở trên URL, chân «Huỷ» trái nút chính phải cho mọi ngăn, cột góp ý mở thành ngăn rộng.

**Architecture:** `packages/ui/sheet.tsx` nhận ba thứ mới — chân xếp như `DialogFooter`, cỡ `assist` kèm `data-size`, và `SheetBody` có `split`. Hai thành phần `HopThoaiMucTieu`, `HopThoaiKr` đổi vỏ `Dialog` sang `Sheet` ở đúng độ sâu lồng cũ. Một chủ duy nhất trong khung Mục tiêu đọc khoá URL `hopOkr` và dựng ngăn; trang Theo đơn vị dùng khoá `new` như tạo deal.

**Tech Stack:** Next (app router), React 19, Radix Dialog qua `packages/ui`, nuqs, TanStack Query, bun test + happy-dom, puppeteer-core cho đo màn thật.

**Spec:** `docs/superpowers/specs/2026-09-30-khung-tao-okr-nhu-deal-design.md` · hợp đồng `_acceptance/khung-tao-okr-nhu-deal/contract.md` · phép đo `_acceptance/khung-tao-okr-nhu-deal/evals.yaml`

## Global Constraints

- Không chú thích trong mã, kể cả mã sửa.
- Không `className` đổi cỡ, màu, góc, khoảng cách của thành phần `@crm/ui` ở `apps/app`; biến thể nằm trong `packages/ui`.
- Nhãn và tên truy cập của mọi nút giữ nguyên (Huỷ, Lưu, Tạo mục tiêu, Thêm KR, Nhận, Sửa, Bác, Bỏ qua, Mở KR này…).
- Giữ `data-hop-thoai-kr`, `data-hop-thoai-muc-tieu`, `data-cuon-hop`, `data-nut` trên ngăn.
- Form nằm đúng độ sâu lồng như trong hộp thoại: `Sheet` › `SheetContent` › `SheetBody` › `form` (thay `Dialog` › `DialogContent` › `DialogAssistBody` › `form`) — thụt đầu dòng của JSX bên trong form không đổi.
- Cỡ ngăn thường là cỡ mặc định của `SheetContent` (`sm`, 384 px) như ngăn tạo deal; cỡ `assist`: ≥ 1024 px rộng 800 px (`--container-assist`), 640–1023 px tối đa 640 px (`--container-sheet`), dưới 640 px như mọi ngăn.
- Cột cạnh form từ 1024 px (`lg`), rộng `--container-assist-rail` (380 px), cách 24 px.
- Khoá URL mới đăng ký trong `SEARCH_PARAM.okr.hop = "hopOkr"`; tạo Mục tiêu dùng `SEARCH_PARAM.dialog.create` («new»).
- Không đổi dữ liệu, thủ tục API, tác tử, bộ kiểm góp ý, vết, hoàn tác.
- Một phép đo mới chỉ xong khi có cặp hai chiều trên cùng vật: vật lành xanh, bản sao phá đỏ với thông điệp ghim.
- Năm lệnh chứng ở gốc: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## Review Focus

1. Người không sửa được dán link có `hopOkr` hay `new` — không ngăn nào mở, khoá bị xoá (Task 4 có ca).
2. Ngăn mở bằng URL khi dữ liệu Mục tiêu chưa tải xong — không nháy «không quyền» rồi xoá khoá oan; chỉ quyết khi dữ liệu đã có (Task 4 có ca: URL `hopOkr=muc-tieu` với truy vấn chờ rồi mới trả).
3. Ngăn chồng lên khung Mục tiêu: Esc đóng ngăn trên cùng trước, khung còn mở (Task 3 chạy `okr-sheet.dom.tsx -t hop-thoai-kr-escape-tra-lop`).
4. Chân dưới 640 px: nút chính nằm trên «Huỷ» vì thứ tự DOM là «Huỷ» trước và chân xếp `flex-col-reverse` (Task 7 đo ở 390).
5. Cột góp ý mở rồi đóng — ngăn quay về cỡ thường, không kẹt ở `assist` (Task 3 có ca trong `co-ngan`).

---

### Task 1: Ngăn chung trong `packages/ui` — chân, cỡ `assist`, thân ngăn

`independent: false` · phục vụ E15, E14 (một phần)

**Files:**
- Modify: `packages/ui/src/components/sheet.tsx`
- Create: `packages/ui/test/sheet-khung.dom.tsx`

**Interfaces:**
- Produces: `SheetContent` nhận `size="assist"` và đặt `data-size={size ?? "sm"}`; `SheetBody({ split?: boolean } & ComponentProps<"div">)` với `data-slot="sheet-body"`, `data-split`; `SheetFooter` bố cục `mt-auto flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end`.

- [ ] **Step 1: Bài kiểm đỏ** — `packages/ui/test/sheet-khung.dom.tsx`: dựng `Sheet open` với `SheetContent size="assist"`, `SheetBody split`, `SheetFooter` có hai con «Huỷ», «Lưu»; khẳng định `[data-slot=sheet-content]` mang `data-size="assist"`, không truyền `size` thì `data-size="sm"`; `[data-slot=sheet-body]` mang `data-split="true"` (và `"false"` khi không `split`); hai nút trong chân theo đúng thứ tự truyền vào; tập class bố cục của `sheet-footer` bằng tập class bố cục của `dialog-footer` dựng cạnh (thông điệp `'thieu data-size'` khi thiếu thuộc tính).
- [ ] **Step 2:** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/sheet-khung.dom.tsx` → đỏ «thieu data-size».
- [ ] **Step 3: Sửa `sheet.tsx`**

```tsx
const sheetContentVariants = cva("…giữ nguyên chuỗi gốc…", {
	variants: {
		size: {
			sm: "data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
			md: "…",
			lg: "…",
			xl: "…",
			"2xl": "…",
			assist:
				"data-[side=left]:sm:max-w-(--container-sheet) data-[side=right]:sm:max-w-(--container-sheet) data-[side=left]:lg:w-(--container-assist) data-[side=right]:lg:w-(--container-assist) data-[side=left]:lg:max-w-[calc(100%-2rem)] data-[side=right]:lg:max-w-[calc(100%-2rem)]",
		},
	},
	defaultVariants: { size: "sm" },
});
```

`SheetPrimitive.Content` thêm `data-size={size ?? "sm"}`.

```tsx
function SheetBody({
	split = false,
	className,
	...props
}: React.ComponentProps<"div"> & { split?: boolean }) {
	return (
		<div
			data-slot="sheet-body"
			data-split={split}
			className={cn(
				"min-h-0 flex-1 overflow-y-auto overscroll-contain px-4",
				split &&
					"grid content-start gap-6 lg:grid-cols-[minmax(0,1fr)_var(--container-assist-rail)] lg:items-start",
				className,
			)}
			{...props}
		/>
	);
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-footer"
			className={cn(
				"mt-auto flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
}
```

Xuất thêm `SheetBody`.
- [ ] **Step 4:** chạy lại bài → xanh. Phá thử: bản sao bỏ `data-size` → đỏ «thieu data-size»; trả lại.
- [ ] **Step 5:** `bun run check-types` ở gốc; commit `feat(ui): ngăn có cỡ assist, thân ngăn chung, chân xếp như hộp thoại`.

### Task 2: Bảy chân ngăn đặt «Huỷ» trước, và thước chân

`independent: false` (cần Task 1) · phục vụ E4

**Files:**
- Modify: `apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx`, `contacts/create-contact-sheet.tsx`, `companies/create-company-sheet.tsx`, `campaigns/create-campaign-sheet.tsx`, `settings/api-keys/create-api-key-sheet.tsx`, `settings/sso/add-sso-provider-sheet.tsx`, `apps/app/components/onboarding/khung-tao.tsx`
- Create: `_acceptance/khung-tao-okr-nhu-deal/rang/chan-ngan.mjs`

- [ ] **Step 1: Viết thước** `chan-ngan.mjs`: đường gốc suy từ `import.meta.url` (lên ba cấp); danh sách viết trước mười hai tệp của E4; đọc AST bằng `typescript` (có trong kho) — tìm phần tử JSX `SheetFooter`, trải fragment và nhánh `?:`/`&&`, lấy con là phần tử; khẳng định con đầu là `SheetClose` bọc `Button variant="outline"` và con cuối là `Button` có `type="submit"` hoặc không `variant`; in `ok <tệp>` hoặc `chan sai thu tu: <tệp>` / `khong tim thay chan: <tệp>`; so tập class bố cục (`flex`, `flex-col-reverse`, `gap-2`, `sm:flex-row`, `sm:justify-end`) đọc từ chuỗi `cn(` của `SheetFooter` và `DialogFooter`; rồi quét mọi `.tsx` dưới `apps/app` tìm `SheetFooter` ngoài danh sách và in tên; in `so khang dinh: 12`; mã 1 nếu có dòng lỗi. Cờ `--tep <đường>` để thay một tệp bằng bản sao (dùng cho chiều đỏ).
- [ ] **Step 2:** chạy `node _acceptance/khung-tao-okr-nhu-deal/rang/chan-ngan.mjs` → đỏ ở bảy tệp (thứ tự cũ).
- [ ] **Step 3:** đảo con trong bảy chân: `SheetClose` bọc nút «Huỷ» lên trước nút gửi. Không đổi gì khác.
- [ ] **Step 4:** chạy lại → xanh, `so khang dinh: 12` (hai tệp OKR xanh sau Task 3; tạm thời thước in `chua co SheetFooter` cho hai tệp đó — Task 3 làm nó xanh). Phá thử: chép `create-deal-sheet.tsx` sang tmpdir, đảo lại, chạy `--tep` → in `chan sai thu tu: apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx`, mã 1.
- [ ] **Step 5:** commit `feat(app): chân mọi ngăn tạo đặt Huỷ trước nút chính`.

### Task 3: Hai hộp OKR đổi vỏ sang ngăn; gỡ hộp hai cột

`independent: false` · phục vụ E7, E8, E9, E10, E12, E13, E14

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx`, `hop-thoai-muc-tieu.tsx`
- Modify: `packages/ui/src/components/dialog.tsx` (gỡ `DialogAssistBody`, cỡ `assist`)
- Delete: `packages/ui/test/dialog-assist.dom.tsx`
- Modify: `apps/app/test/the-gop-y-okr.dom.tsx`, `apps/app/test/tro-ly-okr-gop-y.dom.tsx`, `apps/app/test/okr-sheet.dom.tsx`, `apps/app/test/khung-gop-y.tsx`
- Create: `apps/app/test/khung-tao-okr.dom.tsx` (khối `co-ngan`, `giu`, `gui-dung`)

**Interfaces:**
- Consumes: `SheetBody`, `SheetContent size`, `SheetFooter` (Task 1).
- Produces: `HopThoaiMucTieu`, `HopThoaiKr` giữ nguyên props; vỏ là `Sheet` › `SheetContent side="right" size={gopY.cotMo ? "assist" : undefined} data-hop-thoai-*` › `SheetHeader` (`SheetTitle`, và `SheetDescription translate="no"` = tên Mục tiêu cho KR) › `SheetBody split={gopY.cotMo} data-cuon-hop` › form + `CotGopY` › `SheetFooter` (`SheetClose asChild` «Huỷ» rồi nút gửi).

- [ ] **Step 1: Bài đỏ** trong `khung-tao-okr.dom.tsx` (dùng `mo`, `cho`, `bam`, `go`, `phim` của `khung-gop-y.tsx`):
  - `co-ngan`: dựng `HopThoaiMucTieu` sửa `MT` và `HopThoaiKr` sửa `KR_1` với một đề xuất chờ (`D_TEN`, `D_KR`); dựng `CreateDealSheet` mở bằng `searchParams="new=true"` trong cùng bài để đọc `data-size` của ngăn deal; khẳng định: cột đóng → `data-size` của ngăn OKR bằng của ngăn deal; bấm «Nhờ Trợ lý OKR góp ý» → `data-size="assist"`, `[data-slot=sheet-body]` `data-split="true"` chứa cả `form` và `[data-cot-gop-y]`; đóng cột → về cỡ thường. Thông điệp `'co ngan kr'` / `'co ngan muc tieu'`.
  - `giu`: ma trận viết trước bốn ngăn (tạo MT, sửa MT, thêm KR, sửa KR) × {Esc, bấm `[data-slot=sheet-overlay]`, «Huỷ», dấu X (`[data-slot=sheet-close]` trong nội dung)} × {có sửa, không}; có sửa: gõ vào ô tên trước, kỳ vọng `[role=alertdialog]` hiện, ngăn còn, `dong` chưa gọi; không sửa: `dong` gọi đúng một lần. In `so khang dinh: 32`. Thông điệp `'dong mat thay doi: <ngăn>/<đường>'`.
  - `gui-dung`: bốn thao tác qua ngăn; mỗi ca đọc `goiCua("okr.createObjective" | "okr.updateObjective" | "okr.createKeyResult" | "okr.updateKeyResult")` đúng một lần, parse bằng `createObjectiveInput`, `updateObjectiveInput`, `createKeyResultInput`, `updateKeyResultInput` nhập từ `../../api/src/okr/okr.contracts` (dò đúng tên xuất trước khi viết); so với payload kỳ vọng dựng bằng chính giá trị đã gõ; in bốn payload. Thông điệp `'payload lech: <thủ tục>'`.
- [ ] **Step 2:** chạy `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khung-tao-okr.dom.tsx -t co-ngan` → đỏ (vỏ vẫn là hộp thoại).
- [ ] **Step 3: Đổi vỏ `hop-thoai-kr.tsx`** — thay import `Dialog*` bằng `Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle`; thay khung ngoài:

```tsx
		<Sheet
			open
			onOpenChange={(mo) => {
				if (!mo && !dangLuu) dong();
			}}
			coThayDoi={coThayDoi}
		>
			<SheetContent
				side="right"
				data-hop-thoai-kr={n.krId ?? "moi"}
				size={gopY.cotMo ? "assist" : undefined}
			>
				<SheetHeader>
					<SheetTitle>{n.krId ? h.suaKr : h.themKr}</SheetTitle>
					<SheetDescription translate="no">{mucTieu.title}</SheetDescription>
				</SheetHeader>
				<SheetBody split={gopY.cotMo} data-cuon-hop>
					<form …giữ nguyên…>
					…
				</SheetBody>
				<SheetFooter>
					<SheetClose asChild dongNgay={daLuuMot && !coThayDoi}>
						<Button variant="outline" disabled={dangLuu}>…</Button>
					</SheetClose>
					<Button type="submit" …giữ nguyên…>
				</SheetFooter>
			</SheetContent>
		</Sheet>
```

Làm tương tự `hop-thoai-muc-tieu.tsx` (không `SheetDescription`; truyền `aria-describedby={undefined}` cho `SheetContent`). Kiểm lại: chuỗi `disabled={dangLuu || !sanSang || !daSua || (canLyDo && !lyDoDu)}` và khối `{canLyDo ? (` rồi `<Field data-o-ly-do-dich>` còn đúng thụt đầu dòng như trước (`git diff -w` trên các dòng đó phải rỗng).
- [ ] **Step 4:** gỡ `DialogAssistBody` và nhánh `size === "assist"` khỏi `dialog.tsx` (kiểu `size` còn `"default" | "wide" | "table"`); xoá `packages/ui/test/dialog-assist.dom.tsx`; `grep -rn "DialogAssistBody\|size=\"assist\"" apps packages` chỉ còn ngăn.
- [ ] **Step 5: Sửa bộ chọn ở bài cũ** — chỉ đổi bộ chọn vỏ: `dialog-overlay` → `sheet-overlay`, `dialog-title` → `sheet-title`, `dialog-footer` → `sheet-footer`, đếm `[role=dialog]` trong bài dựng cả khung Mục tiêu thì đổi sang đếm `[data-hop-thoai-muc-tieu],[data-hop-thoai-kr]`. Ghi mỗi dòng đổi vào nhật ký Task (để E12 người chấm đọc diff).
- [ ] **Step 6:** chạy `config:executors.test.kto_bai_cu`, `kto_co_ngan`, `kto_giu`, `kto_gui_dung`, `tgy_cot_khong_dong`, `tgy_cot_sua_roi_nhan`, `tgy_co_hop`, và `okr-sheet.dom.tsx -t hop-thoai-kr-escape-tra-lop` → xanh. Phá thử từng bài mới theo chiều đỏ của E7, E8, E13.
- [ ] **Step 7:** `node _acceptance/khung-tao-okr-nhu-deal/rang/chan-ngan.mjs` → `so khang dinh: 12` xanh. Commit `feat(okr): hộp Mục tiêu và KR thành ngăn trượt phải`.

### Task 4: Trạng thái mở trên URL

`independent: false` · phục vụ E1, E2, E11

**Files:**
- Modify: `apps/app/lib/search-param-keys.ts` (thêm `okr.hop: "hopOkr"`)
- Create: `apps/app/app/(app)/[slug]/okr/ngan-okr-url.ts` (parser và hook)
- Modify: `apps/app/components/crm/record-sheet/record-stack.ts` (xoá `hopOkr` khi đổi khung)
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
- Modify: `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx`
- Modify: `apps/app/test/khung-gop-y.tsx` (`mo` nhận `{ searchParams?, onUrlUpdate? }`)
- Test: `apps/app/test/khung-tao-okr.dom.tsx` (khối `tao-muc-tieu`, `url-khung`, `mo-kr-url`)

**Interfaces:**
- Produces:

```ts
export type HopOkr =
	| { loai: "muc-tieu" }
	| { loai: "kr-moi" }
	| { loai: "kr"; id: string };
export const parseAsHopOkr: ParserBuilder<HopOkr>;
export function useHopOkr(): readonly [HopOkr | null, (h: HopOkr | null) => void];
```

- [ ] **Step 1: Bài đỏ** `tao-muc-tieu`, `url-khung`, `mo-kr-url` đúng như `expected` của E1, E2, E11 (ma trận, ca quyền, đối chứng dương, thông điệp ghim). Ca «dữ liệu chưa tải»: truy vấn `okr.objective` trả sau vài nhịp; khoá `hopOkr=muc-tieu` không bị xoá trong lúc chờ và ngăn mở khi dữ liệu tới.
- [ ] **Step 2:** chạy → đỏ.
- [ ] **Step 3:** `ngan-okr-url.ts`: `createParser` đọc `muc-tieu`, `kr-moi`, `kr:<id>`; `useHopOkr` bọc `useQueryState(SEARCH_PARAM.okr.hop, parseAsHopOkr)`.
- [ ] **Step 4:** `record-stack.ts`: thêm `[SEARCH_PARAM.okr.hop]: parseAsString` vào `params` và `[SEARCH_PARAM.okr.hop]: null` trong `write`.
- [ ] **Step 5:** `objective-sheet.tsx`: thành phần `NganOkr({ mt })` đặt một lần trong `ObjectiveSheet` (khi `mt` có), đọc `useHopOkr()`; quyết: `muc-tieu` → cần `ghiDuoc(mt)`; `kr-moi` → cần `ghiDuoc(mt)`; `kr:<id>` → KR có trong `mt.keyResults`, `mt.status !== "da-bo"`, `mt.canEditKr.includes(id)`; không đạt → `useEffect` ghi `null`. Dựng `HopThoaiMucTieu` (sửa, `moKr={(id) => datHop({ loai: "kr", id })}`) hoặc `HopThoaiKr` (`kr` null khi `kr-moi`); `dong={() => datHop(null)}`. Gỡ `hoi === "sua"`, `krMo`, `setKrMo`, và nhánh `hop.loai === "tao" | "sua"` của `TabKr` (giữ `cap-nhat`); menu «Sửa», «Thêm KR», «Sửa» của KR gọi `datHop`.
- [ ] **Step 6:** `theo-don-vi.tsx`: thay `themMo` bằng `useQueryState(SEARCH_PARAM.dialog.create, parseAsBoolean.withDefault(false))`; chỉ dựng ngăn khi `byUnit.data?.canEdit`; `byUnit.data` đã tải mà không sửa được → ghi `null`; `dong` ghi `null`.
- [ ] **Step 7:** chạy `kto_tao_muc_tieu`, `kto_url_khung`, `kto_mo_kr_url` → xanh; chạy lại `kto_bai_cu`, `tgy_cot_mo_kr`. Phá thử theo chiều đỏ của E1, E2, E11. `bun run check-types`. Commit `feat(okr): ngăn Mục tiêu và KR mở theo URL`.

### Task 5: Bản mẫu, thước gốc giao diện

`independent: false` (sau Task 3) · phục vụ E14, E19

**Files:**
- Modify: `apps/app/app/proto/_modules/khung-tao-okr-nhu-deal/ngan.tsx` (dùng `SheetBody`, `SheetFooter`, `size="assist"` thật thay phần vẽ tay)
- Modify: `apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx` (hộp thoại giả → `Sheet`)
- Create: `_acceptance/khung-tao-okr-nhu-deal/rang/ui-goc.mjs`, `_acceptance/khung-tao-okr-nhu-deal/rang/proto-khung.mjs`

- [ ] **Step 1:** `ui-goc.mjs` theo E14 (AST; đồ thị import của `apps/**`, `packages/**` không nhập `DialogAssistBody`; không `className` trên phần tử nhập từ `@crm/ui` trong hai tệp OKR; cờ `--tep` cho chiều đỏ). `proto-khung.mjs` theo E19 (rút id `ST-khung-*` từ khối `UX-STATE-TABLE`, trừ ba id, cộng `ST-khung-deal`; so với mục sổ; module 9b không nhập `Dialog`; cờ `--thiet-ke` cho bản sao).
- [ ] **Step 2:** chạy hai thước → `proto-khung` đỏ ở module 9b.
- [ ] **Step 3:** đổi hộp thoại giả của 9b sang `Sheet` (giữ state); bản mẫu lượt này dùng thành phần thật.
- [ ] **Step 4:** chạy lại → xanh; phá thử theo chiều đỏ; `cd apps/app && bun test test/proto-catalog.spec.ts`. Commit `feat(proto): bản mẫu ngăn OKR dùng thành phần thật`.

### Task 6: Thước của bốn hồ sơ đã ký

`independent: false` (sau Task 3, 4) · phục vụ E6, E16, E17, E18

**Files:**
- Modify: `_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs` (đếm ngăn OKR thay `[role=dialog][data-slot=dialog-content]`; ô đỏ giả đổi sang ngăn; ảnh ghi vào `process.env.BANG_CHUNG ?? <mặc định cũ>`)
- Modify: `_acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs` (hộp Mục tiêu tìm bằng `[data-hop-thoai-muc-tieu]`)
- Modify: `_acceptance/hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs` (gốc `Dialog` hoặc `Sheet`; chốt đỏ thay `<DialogClose asChild` hoặc `<SheetClose asChild`)
- Modify (nếu thư mục ảnh nằm trong cây hồ sơ): `_acceptance/tro-ly-okr-de-xuat/rang/man-gop-y.mjs`
- Create: `_acceptance/khung-tao-okr-nhu-deal/rang/thuoc-cu.mjs`

- [ ] **Step 1:** dò mọi chốt thay chữ trên `hop-thoai-kr.tsx`, `hop-thoai-muc-tieu.tsx`, `objective-sheet.tsx` trong `_acceptance/*/rang/` (`grep -n "replace\|readFileSync" … | grep hop-thoai`), ghi danh sách vào `thuoc-cu.mjs` trước khi sửa gì.
- [ ] **Step 2:** `thuoc-cu.mjs`: chạy lệnh config của các eval máy liệt ở E18, so mã với `expected_exit` hoặc 0; với mỗi chốt thay chữ: chép tệp vào tmpdir, áp đúng hàm thay (nhập từ script hồ sơ nếu xuất được, không thì dựng lại bằng cùng chuỗi tìm đọc từ script), khẳng định khác bản gốc; in `so chot: <n>`; thông điệp `chot do khong an: <hồ sơ> <eval>`.
- [ ] **Step 3:** sửa ba script theo cột «Sửa gì» của bảng «Phép đo phải sửa theo» trong thiết kế — chỉ đổi bộ chọn vỏ, thư mục ảnh; không đổi ngưỡng.
- [ ] **Step 4:** chạy `bun _acceptance/khung-tao-okr-nhu-deal/rang/thuoc-cu.mjs` → xanh; phá thử (bản sao `hop-thoai-kr.tsx` thụt thêm một nấc) → `chot do khong an: khep-ky-okr E3`. Commit `test(the-gop-y-okr, hop-thoai-giu-cho-dang-nhap): bám ngăn thay hộp thoại`.

### Task 7: Đo màn thật năm ngăn

`independent: false` · phục vụ E3, E5

**Files:**
- Create: `_acceptance/khung-tao-okr-nhu-deal/rang/man-khung.mjs`

- [ ] **Step 1:** đọc `_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs` và `scripts/lan-do/tien-de.mjs` để dùng lại phiên đo, đăng nhập, cảnh cây, puppeteer; tìm hàm nộp đề xuất của tác tử (`apps/agent`, bài `tro-ly-okr-nop.integration.spec.ts`) để ghi sẵn đề xuất chờ trong kho đo dùng-một-lần.
- [ ] **Step 2:** viết script theo E3 và E5: năm ngăn × {1440, 390}, hai ngăn rộng × {1440, 1024, 1023, 390}, ngăn Mở chu kỳ ở Cài đặt; số đo và ảnh `evidence/E3-<khổ>-<ngăn>.png`, `evidence/E5-<khổ>-<ngăn>.png`; cờ `--kiem-do-do` (ngăn hẹp 20 px → `lech be ngang`), `--kiem-do-do tran` (phần tử 600 px → `tran ngang`), `--kiem-do-do chan` (chân đảo → `huy khong ben trai`).
- [ ] **Step 3:** `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-tao-okr-nhu-deal/rang/man-khung.mjs"` → xanh; ba chiều đỏ ra mã 1 đúng thông điệp. Commit `test(khung-tao-okr-nhu-deal): đo năm ngăn trên màn thật`.

### Task 8: Tài liệu và lộ trình

`independent: false` (bước 2 cần mọi việc trước) · phục vụ E21, E22

**Files:**
- Modify: `docs/settings.md` (mục «Tạo mới và hỏi lại» ghi chân đã khớp; mục Đợt 2 đánh dấu phần `SheetFooter` xong)
- Modify: `docs/plan/lo-trinh-okr.md` mục 10 (dòng mới, số chưa dùng, trạng thái «đang làm»; commit cuối đổi thành «đã lên `onehub`»)
- Modify: `_acceptance/khung-tao-okr-nhu-deal/mo-ta-pr.md` (nếu Task 1–7 đổi gì so với bản S1)

- [ ] **Step 1:** sửa hai tài liệu; chạy `config:executors.script.kto_san_thiet_ke` → P0 = 0.
- [ ] **Step 2:** năm lệnh chứng ở gốc xanh. Commit `docs: chân ngăn đã khớp chân hộp thoại; lộ trình OKR thêm dòng khung tạo`.
- [ ] **Step 3:** đặt `status: implemented` trong hợp đồng; commit; sang S4.
