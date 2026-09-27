# Hộp thoại giữ chỗ đang nhập — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `Dialog`, `Sheet`, `Drawer` của `packages/ui` không làm mất chữ người đang gõ: bấm ra ngoài khi đã gõ thì đứng yên; Esc, dấu X, nút Huỷ, vuốt thì hỏi «Bỏ những gì vừa nhập?».

**Architecture:** Một bộ giữ dùng chung (`packages/ui/src/components/giu-thay-doi.tsx`) cấp ngữ cảnh «có thay đổi», lớp bọc gốc chặn lời đóng, và hộp hỏi lại dựng trên `ConfirmDialog` (chuyển vào `packages/ui`). Ba khung bọc gốc Radix/vaul bằng bộ giữ; phần nội dung tự nhận thay đổi qua sự kiện `input` nổi bọt. Chỗ gọi ở `apps/app` nối nút Huỷ qua `DialogClose`/`SheetClose` và ba hộp form tự khai `coThayDoi`.

**Tech Stack:** React 19, Radix UI (`radix-ui` Dialog/AlertDialog), vaul (Drawer), Bun test + jsdom (`packages/ui/test/setup-dom.ts`), TypeScript compiler API cho phép soát tĩnh, puppeteer-core + phiên đo `scripts/lan-do/tien-de.mjs` cho màn thật.

**Spec:** `docs/superpowers/specs/2026-09-27-hop-thoai-giu-cho-dang-nhap-design.md` · hợp đồng `_acceptance/hop-thoai-giu-cho-dang-nhap/contract.md` · bộ chấm `_acceptance/hop-thoai-giu-cho-dang-nhap/evals.yaml`.

## Global Constraints

- Không chú thích mã, ở tệp mới lẫn tệp sửa (`AGENTS.md`).
- `/packages/ui` là nguồn giao diện duy nhất; không `className` đổi màu, góc, khoảng cách của thành phần `@crm/ui` ở chỗ gọi (`docs/design.md`).
- Không `useEffect` trần trong tệp mới (skill `.agents/skills/no-use-effect`); đặt lại trạng thái khi prop đổi bằng mẫu «so với giá trị trước trong lúc render».
- Prop `variant`/`tone`/`size` không có mặc định chuỗi trong tham số destructure.
- Chữ mới vào `packages/ui/src/lib/messages.ts`, có vi và en khác nhau: `dialog.boThayDoi = { tieuDe, than, tiepTuc, bo }` với vi «Bỏ những gì vừa nhập?» · «Những gì bạn vừa nhập trong hộp này sẽ mất.» · «Tiếp tục sửa» · «Bỏ»; en «Discard what you typed?» · «What you typed in this box will be lost.» · «Keep editing» · «Discard».
- Tên prop công khai: `coThayDoi?: boolean` và `giuThayDoi?: boolean` trên `Dialog`, `Sheet`, `Drawer`; `dongNgay?: boolean` trên `DialogClose`, `SheetClose`, `DrawerClose`.
- Ô bị bỏ qua khi tự nhận: `input[type=search]`, phần tử `role="combobox"`, và mọi thứ nằm trong `[data-khong-giu]`.
- Lệnh chứng từ gốc kho, PATH Node 24: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành xanh, bản sao bị phá đỏ với thông điệp ghim (MEASURE-BIRTH-CLAUSE của feature-loop). Bản sao phá dựng trong tmpdir/scratchpad, không trong cây thật.

## Review Focus

1. **Lưu thất bại rồi bấm ngoài** — nút Lưu gửi form, máy chủ trả lỗi, hộp vẫn mở với chữ: bộ giữ phải còn bật (chữ còn ⇒ còn thay đổi). Task 2 thêm ca: gửi form không làm mất cờ thay đổi.
2. **Hai hộp chồng nhau** (hộp KR mở từ trong ngăn bản ghi) — Esc trong hộp trên chỉ hỏi cho hộp trên, ngăn dưới không đổi. Task 3 thêm ca Dialog nằm trong Sheet.
3. **Gõ vào ô trong popover con** (ô tìm của Combobox nằm trong portal ngoài nội dung hộp) — sự kiện không nổi bọt qua `DialogContent`; không được đánh dấu nhầm hay ném lỗi. Task 2 phủ bằng ca `role=combobox` của E12.
4. **Mở–đóng nhanh liên tiếp** — đóng khi sạch rồi mở lại ngay: cờ phải sạch, hộp hỏi lại không lóe lên. Task 2 ca «mở lại» của E5.
5. **Nút đóng tự vẽ trong phần đầu hộp** (`showCloseButton={false}` rồi tự đặt nút X) — phải đi qua `DialogClose` mới được giữ; phép soát Task 4 bắt nút gọi thẳng hàm đóng ở bất kỳ đâu trong nội dung.

---

### Task 1: ConfirmDialog vào packages/ui

**Files:**
- Create: `packages/ui/src/components/confirm-dialog.tsx`
- Delete: `apps/app/app/(app)/[slug]/settings/members/confirm-dialog.tsx`
- Modify: 13 tệp đang nhập `@/app/(app)/[slug]/settings/members/confirm-dialog` (liệt bằng `grep -rln 'members/confirm-dialog' apps/app`)
- Create: `_acceptance/hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs` (khung CLI + ca `confirm`)

**Interfaces:**
- Produces: `ConfirmDialog` từ `@crm/ui/components/confirm-dialog`, chín prop cũ (`tieuDe, than, nut, thoi, open, onOpenChange, onConfirm, pending, tone?`) cộng `onCloseAutoFocus?: (event: Event) => void` chuyển thẳng cho `AlertDialogContent`.
- Produces: `soi-giu.mjs --ca <confirm|huy|tu-khai|thiet-ke> [--chieu-do]`, mã 0 xanh, 1 vi phạm, 2 «KHONG DO DUOC».

**Phục vụ:** E8 · **independent:** false (Task 2 dùng ConfirmDialog)

- [ ] **Step 1: Viết phép soát `--ca confirm` trước, chạy thấy đỏ**

`soi-giu.mjs` suy gốc kho từ vị trí tệp (`join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..")`), không hardcode. Ca `confirm`:
```js
const MUOI_BA = [
  // 13 đường tệp tương đối gốc kho, chép nguyên văn từ lệnh grep ở Files trước khi sửa
];
const CHIN_PROP = [["tieuDe",true],["than",true],["nut",true],["thoi",true],["open",true],["onOpenChange",true],["onConfirm",true],["pending",true],["tone",false]];
```
Đọc `packages/ui/src/components/confirm-dialog.tsx` bằng `typescript` (`ts.createSourceFile`), tìm hàm `ConfirmDialog`, lấy kiểu tham số (type literal), so từng cặp (tên, bắt buộc = không có `?`) — thiếu hay đổi là vi phạm «confirm: prop <tên> doi hoac mat». Tệp cũ còn → «confirm: tep cu con». Mỗi tệp trong `MUOI_BA` phải có `import { ConfirmDialog } from "@crm/ui/components/confirm-dialog"`; `git grep -l "members/confirm-dialog" -- apps/app` phải rỗng → «confirm: nhap duong cu o <tệp>». In «confirm: 13/13» khi xanh.

Run: `bun _acceptance/hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs --ca confirm`
Expected: mã 1, «confirm: tep cu con».

- [ ] **Step 2: Chuyển thành phần**

```tsx
"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@crm/ui/components/alert-dialog";

export function ConfirmDialog({
	tieuDe,
	than,
	nut,
	thoi,
	open,
	onOpenChange,
	onConfirm,
	pending,
	tone,
	onCloseAutoFocus,
}: {
	tieuDe: string;
	than: string;
	nut: string;
	thoi: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	pending: boolean;
	tone?: "destructive" | "default";
	onCloseAutoFocus?: (event: Event) => void;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent onCloseAutoFocus={onCloseAutoFocus}>
				<AlertDialogHeader>
					<AlertDialogTitle>{tieuDe}</AlertDialogTitle>
					<AlertDialogDescription>{than}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={pending}>{thoi}</AlertDialogCancel>
					<AlertDialogAction
						variant={tone ?? "destructive"}
						data-variant={tone ?? "destructive"}
						disabled={pending}
						onClick={(event) => {
							event.preventDefault();
							onConfirm();
						}}
					>
						{nut}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
```
Xoá tệp cũ; sửa 13 dòng nhập sang `@crm/ui/components/confirm-dialog`.

- [ ] **Step 3: Chạy lại, thấy xanh; chiều đỏ**

Run: `bun _acceptance/hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs --ca confirm && cd apps/app && bun test test/messages-guard.spec.ts`
Expected: «confirm: 13/13», mã 0. Thêm cờ `--chieu-do` vào ca: chép cây cần đọc vào tmpdir, trỏ lại một tệp dùng về đường cũ, chạy ca trên bản sao, khẳng định thông điệp «confirm: nhap duong cu o» và mã 1.

- [ ] **Step 4: Bộ kiểm có sẵn của 13 chỗ vẫn xanh**

Run: `cd apps/app && bun test && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/*.dom.tsx` rồi `bun run check-types`
Expected: 0 fail.

- [ ] **Step 5: Commit** — `hop-thoai-giu-cho-dang-nhap: ConfirmDialog vào packages/ui`

### Task 2: Bộ giữ và Dialog

**Files:**
- Create: `packages/ui/src/components/giu-thay-doi.tsx`
- Modify: `packages/ui/src/components/dialog.tsx`, `packages/ui/src/lib/messages.ts`
- Test: `packages/ui/test/giu-thay-doi.dom.tsx`

**Interfaces:**
- Consumes: `ConfirmDialog` (Task 1).
- Produces: `useGiuGoc(props)` và `useGiuNoiDung()`, dùng lại ở Task 3:

```ts
type GiuGocVao = {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	coThayDoi?: boolean;
	giuThayDoi?: boolean;
};
type GiuGocRa = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	coThayDoi: boolean;
	hopHoi: React.ReactNode;
	ngucCanh: GiuNguCanh;
};
type GiuNguCanh = {
	coThayDoi: boolean;
	danhDau: (target: EventTarget | null) => void;
	nhoO: (target: EventTarget | null) => void;
	hoiLai: () => void;
	boQuaLanToi: () => void;
};
export const GiuContext: React.Context<GiuNguCanh | null>;
export function useGiuGoc(vao: GiuGocVao): GiuGocRa;
export function useGiuNoiDung(): GiuNguCanh | null;
export function laOLoc(target: EventTarget | null): boolean;
```
- Produces: `Dialog` nhận `coThayDoi`, `giuThayDoi`; `DialogClose` nhận `dongNgay`; `DialogContent` tự nhận thay đổi, chặn bấm ngoài khi có thay đổi.

**Phục vụ:** E1, E2, E5, E6, E7(a), E12 (phần Dialog) · **independent:** false

- [ ] **Step 1: Viết bài kiểm đỏ trước** — `packages/ui/test/giu-thay-doi.dom.tsx`, cùng khung `dung`/`bam` như `to-chuc-thanh-phan.dom.tsx`, bọc `LocaleProvider` vi. Mỗi `describe` mang đúng tên nhóm mà lệnh chấm lọc (`-t bam-ngoai`, `hoi-lai`, `may-dong`, `lop-con`, `tu-khai`, `o-loc`); ca và thông điệp ghim lấy nguyên văn từ `expected` của E1, E2, E5, E6, E7(a), E12 trong `evals.yaml`. Hàm tiện:

```tsx
async function go(o: HTMLInputElement | HTMLTextAreaElement, chu: string) {
	await act(async () => {
		const dat = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(o), "value")?.set;
		dat?.call(o, chu);
		o.dispatchEvent(new InputEvent("input", { bubbles: true }));
	});
}
async function bamLopPhu(slot: string) {
	const lop = document.querySelector(`[data-slot='${slot}']`) as HTMLElement;
	await act(async () => {
		lop.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));
		lop.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
		lop.click();
	});
}
async function esc(el: Element) {
	await act(async () => {
		el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
	});
}
```
Ca mẫu (E1):
```tsx
test("bam-ngoai: da go thi hop dung yen, chu con, khong goi dong", async () => {
	let goi = 0;
	dung(<Vo onOpenChange={() => { goi += 1; }} />);
	const o = document.querySelector("[data-slot='dialog-content'] input") as HTMLInputElement;
	await go(o, "Hợp đồng");
	await bamLopPhu("dialog-overlay");
	expect(`bam-ngoai: con=${!!document.querySelector("[data-slot='dialog-content']")} chu=${o.value} goi=${goi} hoi=${!!document.querySelector("[role='alertdialog']")}`)
		.toBe("bam-ngoai: con=true chu=Hợp đồng goi=0 hoi=false");
});
```
Thêm ca Review Focus 1 (gửi form không xoá cờ) vào nhóm `may-dong`.

Run: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/giu-thay-doi.dom.tsx`
Expected: FAIL — ca «đã gõ» đóng hộp.

- [ ] **Step 2: Chữ** — thêm `dialog.boThayDoi` vi/en như Global Constraints vào cả hai bản trong `messages.ts`, cập nhật kiểu thông điệp nếu tệp khai kiểu.

- [ ] **Step 3: Bộ giữ** — `giu-thay-doi.tsx`:

```tsx
"use client";

import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { useMessages } from "@crm/ui/components/locale-provider";
import * as React from "react";

export type GiuNguCanh = {
	coThayDoi: boolean;
	danhDau: (target: EventTarget | null) => void;
	nhoO: (target: EventTarget | null) => void;
	hoiLai: () => void;
	boQuaLanToi: () => void;
};

export const GiuContext = React.createContext<GiuNguCanh | null>(null);

export function laOLoc(target: EventTarget | null): boolean {
	if (!(target instanceof Element)) return true;
	if (target instanceof HTMLInputElement && target.type === "search") return true;
	if (target.getAttribute("role") === "combobox") return true;
	return target.closest("[data-khong-giu]") !== null;
}

export function useGiuGoc({
	open,
	defaultOpen,
	onOpenChange,
	coThayDoi,
	giuThayDoi,
}: {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	coThayDoi?: boolean;
	giuThayDoi?: boolean;
}) {
	const msg = useMessages();
	const [moNoi, datMoNoi] = React.useState(defaultOpen ?? false);
	const mo = open ?? moNoi;
	const [tuNhan, datTuNhan] = React.useState(false);
	const [moTruoc, datMoTruoc] = React.useState(mo);
	const [hoi, datHoi] = React.useState(false);
	const boQua = React.useRef(false);
	const oCuoi = React.useRef<HTMLElement | null>(null);
	if (mo !== moTruoc) {
		datMoTruoc(mo);
		if (mo) datTuNhan(false);
	}
	const bat = giuThayDoi !== false;
	const ban = bat && (tuNhan || coThayDoi === true);
	const dongThat = React.useCallback(() => {
		datTuNhan(false);
		if (open === undefined) datMoNoi(false);
		onOpenChange?.(false);
	}, [open, onOpenChange]);
	const doiMo = React.useCallback(
		(v: boolean) => {
			if (v) {
				if (open === undefined) datMoNoi(true);
				onOpenChange?.(true);
				return;
			}
			if (ban && !boQua.current) {
				datHoi(true);
				return;
			}
			boQua.current = false;
			dongThat();
		},
		[ban, open, onOpenChange, dongThat],
	);
	const ngucCanh = React.useMemo<GiuNguCanh>(
		() => ({
			coThayDoi: ban,
			danhDau: (t) => {
				if (bat && !laOLoc(t)) datTuNhan(true);
			},
			nhoO: (t) => {
				if (t instanceof HTMLElement && !laOLoc(t)) oCuoi.current = t;
			},
			hoiLai: () => datHoi(true),
			boQuaLanToi: () => {
				boQua.current = true;
			},
		}),
		[ban, bat],
	);
	const hopHoi = (
		<ConfirmDialog
			tieuDe={msg.dialog.boThayDoi.tieuDe}
			than={msg.dialog.boThayDoi.than}
			nut={msg.dialog.boThayDoi.bo}
			thoi={msg.dialog.boThayDoi.tiepTuc}
			open={hoi}
			onOpenChange={datHoi}
			pending={false}
			onConfirm={() => {
				datHoi(false);
				dongThat();
			}}
			onCloseAutoFocus={(e) => {
				if (!oCuoi.current?.isConnected) return;
				e.preventDefault();
				oCuoi.current.focus();
			}}
		/>
	);
	return { open: mo, onOpenChange: doiMo, coThayDoi: ban, hopHoi, ngucCanh };
}

export function useGiuNoiDung() {
	return React.useContext(GiuContext);
}
```

- [ ] **Step 4: Cắm vào Dialog** — trong `dialog.tsx`:

```tsx
function Dialog({
	open,
	defaultOpen,
	onOpenChange,
	coThayDoi,
	giuThayDoi,
	children,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & {
	coThayDoi?: boolean;
	giuThayDoi?: boolean;
}) {
	const g = useGiuGoc({ open, defaultOpen, onOpenChange, coThayDoi, giuThayDoi });
	return (
		<GiuContext.Provider value={g.ngucCanh}>
			<DialogPrimitive.Root data-slot="dialog" open={g.open} onOpenChange={g.onOpenChange} {...props}>
				{children}
			</DialogPrimitive.Root>
			{g.hopHoi}
		</GiuContext.Provider>
	);
}

function DialogClose({
	dongNgay,
	onClick,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Close> & { dongNgay?: boolean }) {
	const g = useGiuNoiDung();
	return (
		<DialogPrimitive.Close
			data-slot="dialog-close"
			onClick={(e) => {
				if (dongNgay) g?.boQuaLanToi();
				onClick?.(e);
			}}
			{...props}
		/>
	);
}
```
`DialogContent` thêm vào `DialogPrimitive.Content`:
```tsx
onInputCapture={(e) => { g?.danhDau(e.target); onInputCapture?.(e); }}
onFocusCapture={(e) => { g?.nhoO(e.target); onFocusCapture?.(e); }}
onInteractOutside={(e) => { onInteractOutside?.(e); if (g?.coThayDoi) e.preventDefault(); }}
```
với `g = useGiuNoiDung()` và ba handler lấy khỏi `props`. Nút X sẵn có là `DialogPrimitive.Close` — đi qua `onOpenChange` nên được giữ.

- [ ] **Step 5: Chạy thấy xanh; chiều đỏ cho từng nhóm** — mỗi `CHIỀU ĐỎ` trong `expected` của E1, E2, E5, E6, E7(a), E12 chạy bằng một bản sao `dialog.tsx`/`giu-thay-doi.tsx` trong tmpdir bị phá đúng như mô tả, bài đỏ in thông điệp ghim; ghi đầu ra vào báo cáo việc.

Run: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/giu-thay-doi.dom.tsx && bun run check-types && cd ../.. && bun run lint`
Expected: PASS.

- [ ] **Step 6: Commit** — `hop-thoai-giu-cho-dang-nhap: bộ giữ thay đổi cho Dialog`

### Task 3: Sheet và Drawer

**Files:**
- Modify: `packages/ui/src/components/sheet.tsx`, `packages/ui/src/components/drawer.tsx`
- Test: `packages/ui/test/giu-thay-doi.dom.tsx` (nhóm `sheet-ma-tran`, `drawer`, và ca (4) của `o-loc` cho Sheet/Drawer)

**Interfaces:**
- Consumes: `useGiuGoc`, `useGiuNoiDung`, `GiuContext` (Task 2).
- Produces: `Sheet`, `Drawer` nhận `coThayDoi`, `giuThayDoi`; `SheetClose`, `DrawerClose` nhận `dongNgay`.

**Phục vụ:** E3, E4, E12 · **independent:** false

- [ ] **Step 1: Bài kiểm đỏ** — bảng viết trước 8 dòng của E3 (so `toEqual` cả bảng); các ca của E4 (lớp phủ, Esc, `onRelease` quá ngưỡng qua `onDrag` lấy từ prop của `Root` vaul thật, gốc nhận `dismissible=false` khi đã gõ); ca Review Focus 2 (Dialog trong Sheet: Esc trong Dialog chỉ hỏi cho Dialog).

- [ ] **Step 2: Sheet** — cùng khuôn Task 2 Step 4 cho `Sheet`, `SheetClose`, `SheetContent` (Radix Dialog).

- [ ] **Step 3: Drawer** —
```tsx
function Drawer({
	open,
	defaultOpen,
	onOpenChange,
	coThayDoi,
	giuThayDoi,
	dismissible,
	onDrag,
	onRelease,
	closeThreshold,
	children,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
	coThayDoi?: boolean;
	giuThayDoi?: boolean;
}) {
	const g = useGiuGoc({ open, defaultOpen, onOpenChange, coThayDoi, giuThayDoi });
	const keoXa = React.useRef(0);
	const nguong = closeThreshold ?? 0.25;
	return (
		<GiuContext.Provider value={g.ngucCanh}>
			<DrawerPrimitive.Root
				data-slot="drawer"
				open={g.open}
				onOpenChange={g.onOpenChange}
				dismissible={g.coThayDoi ? false : dismissible}
				closeThreshold={closeThreshold}
				onDrag={(e, tiLe) => {
					keoXa.current = Math.max(keoXa.current, tiLe);
					onDrag?.(e, tiLe);
				}}
				onRelease={(e, conMo) => {
					if (g.coThayDoi && keoXa.current >= nguong) g.ngucCanh.hoiLai();
					keoXa.current = 0;
					onRelease?.(e, conMo);
				}}
				{...props}
			>
				{children}
			</DrawerPrimitive.Root>
			{g.hopHoi}
		</GiuContext.Provider>
	);
}
```
`DrawerContent`: `onInputCapture`/`onFocusCapture` như Dialog; `onEscapeKeyDown={(e) => { onEscapeKeyDown?.(e); if (g?.coThayDoi) { e.preventDefault(); g.hoiLai(); } }}`. `DrawerClose` nhận `dongNgay` như `DialogClose`.

Tỉ lệ `onDrag` của vaul là phần trăm hay phân số — đọc `node_modules/vaul/dist/index.mjs` để chốt đơn vị trước khi so với `nguong`; ghi đơn vị vào báo cáo.

- [ ] **Step 4: Xanh, chiều đỏ** như Task 2 Step 5 cho E3, E4, E12.

Run: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/giu-thay-doi.dom.tsx && bun run check-types`

- [ ] **Step 5: Commit** — `hop-thoai-giu-cho-dang-nhap: Sheet và Drawer dùng bộ giữ`

### Task 4: Chỗ gọi — nút Huỷ, tự khai, ô tìm

**Files:**
- Modify: 15 tệp có nút Huỷ gọi thẳng hàm đóng: `okr/hop-thoai-can-chinh.tsx`, `okr/hop-thoai-kr.tsx`, `okr/hop-thoai-muc-tieu.tsx`, `okr/hop-thoai-nhap.tsx`, `settings/api-keys/created-api-key-dialog.tsx`, `settings/members/allow-dialog.tsx`, `settings/members/chuyen-okr-dialog.tsx`, `settings/members/chuyen-viec-dialog.tsx`, `settings/members/phat-chia-dialog.tsx`, `settings/organization/hop-thoai-don-vi.tsx`, `settings/organization/hop-thoai-nhap.tsx` (dưới `apps/app/app/(app)/[slug]/`), `apps/app/components/agent-builder/create-channel-dialog.tsx`, `apps/app/components/agent-builder/new-agent-dialog.tsx`, `apps/app/components/crm/stage-change.tsx`, `apps/app/components/data-table/saved-views-menu.tsx`
- Modify: `hop-thoai-kr.tsx`, `hop-thoai-muc-tieu.tsx`, `hop-thoai-don-vi.tsx` — `coThayDoi` từ trạng thái form
- Modify: `packages/ui/src/components/pick-list-dialog.tsx` — ô tìm `type="search"`
- Modify: `docs/design.md` — một dòng bảng «Dấu hiệu vẽ tay»
- Modify: `soi-giu.mjs` — ca `huy`, `tu-khai`

**Interfaces:**
- Consumes: `DialogClose`/`SheetClose`/`DrawerClose` với `dongNgay`, `Dialog` với `coThayDoi` (Task 2–3).

**Phục vụ:** E7(b), E9, E12(5) · **independent:** false

- [ ] **Step 1: Phép soát đỏ trước** — ca `huy`: `DANH_SACH` 25 tệp viết nguyên văn (15 ở trên + `campaigns/create-campaign-sheet.tsx`, `companies/create-company-sheet.tsx`, `contacts/create-contact-sheet.tsx`, `deals/create-deal-sheet.tsx`, `settings/api-keys/create-api-key-sheet.tsx`, `settings/okr/sheet-mo-chu-ky.tsx`, `settings/sso/add-sso-provider-sheet.tsx`, `deals/deals-bulk-actions.tsx`, `settings/connections/slack/slack-channels.tsx`, `apps/app/components/crm/fields/field-editor.tsx`); tập máy rút theo đúng heuristic của E9 phải bằng nó. AST: mọi `JsxElement`/`JsxSelfClosingElement` tên `Button` nằm trong `DialogContent|SheetContent|DrawerContent`, có `onClick` là định danh `dong|onClose|close` hoặc arrow gọi `setX(false)`/`onOpenChange(false)`/`dong()`, mà không có tổ tiên `DialogClose|SheetClose|DrawerClose` → vi phạm «huy: <tệp>:<dòng> goi thang ham dong». `docs/design.md` phải chứa `DialogClose` trong bảng «Dấu hiệu vẽ tay». Đối chứng dương: fixture tmpdir một tệp có nút gọi thẳng `dong` → đúng 1 vi phạm. Ca `tu-khai`: ba tệp, `<Dialog>` gốc có thuộc tính `coThayDoi` mà giá trị không phải hằng.

Run: `bun _acceptance/hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs --ca huy`
Expected: mã 1, liệt 15 vi phạm.

- [ ] **Step 2: Nối nút Huỷ** — trong mỗi tệp, đổi
```tsx
<Button variant="outline" onClick={dong} disabled={dangLuu}>{h.huy}</Button>
```
thành
```tsx
<DialogClose asChild>
	<Button variant="outline" disabled={dangLuu}>{h.huy}</Button>
</DialogClose>
```
và kiểm `onOpenChange` của `Dialog` gốc tệp đó có gọi đúng hàm đóng cũ khi nhận `false` (vd `hop-thoai-kr.tsx`: `onOpenChange={(mo) => { if (!mo && !dangLuu) dong(); }}`); thiếu thì thêm. Nút mang chữ «Đóng» sau khi đã lưu (`daLuuMot` ở hộp KR) đi qua `DialogClose dongNgay`.

- [ ] **Step 3: Tự khai** — ba hộp form tính `coThayDoi` bằng so trạng thái form hiện tại với giá trị lúc mở (vd hộp KR: tên, kiểu, khởi điểm, đích, hiện tại, đơn vị, phụ trách, hạn, nguồn số khác bản đầu). Ô chọn nguồn số (`ToggleGroup`) và `Select` kiểu đổi là đủ.

- [ ] **Step 4: Ô tìm của PickListDialog** — `InputGroupInput` tìm kiếm thêm `type="search"`.

- [ ] **Step 5: `docs/design.md`** — thêm dòng bảng: `| Nút Huỷ trong hộp thoại gọi thẳng hàm đóng | Bọc bằng \`DialogClose asChild\` (\`SheetClose\`, \`DrawerClose\`) để bộ giữ thay đổi thấy được |`.

- [ ] **Step 6: Xanh, chiều đỏ** — `--ca huy` và `--ca tu-khai` xanh; `--chieu-do` trên bản sao hop-thoai-kr.tsx trả nút về `onClick={dong}` và gỡ `coThayDoi`.

Run: `bun _acceptance/hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs --ca huy && bun _acceptance/hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs --ca tu-khai && bun run check-types && bun run lint && cd apps/app && bun test && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/*.dom.tsx`

- [ ] **Step 7: Commit** — `hop-thoai-giu-cho-dang-nhap: nút Huỷ qua nút đóng, ba hộp tự khai, ô tìm không giữ`

### Task 5: Sàn thiết kế và màn thật

**Files:**
- Modify: `soi-giu.mjs` — ca `thiet-ke`
- Create: `_acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs`

**Interfaces:**
- Consumes: mọi thứ trên; phiên đo `scripts/lan-do/tien-de.mjs` (đặt `APP_URL`, `API_URL`, `DATABASE_URL`, `PHIEN_DO`); tiện ích màn thật `_acceptance/man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs` (`API`, `APP`, `CHROME`, `chiaCookie`, `suySlug`, `khongDo`); `canhCay` của `_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs`.

**Phục vụ:** E10, E11 · **independent:** false

- [ ] **Step 1: `--ca thiet-ke`** — theo đúng `expected` của E11: `git diff --name-only origin/onehub...HEAD`, chỉ dòng thêm; `design-gate.mjs --mode static` (giải qua `CLAUDE_PLUGIN_ROOT` hoặc `scripts/resolve-plugin.mjs` như `executors.design.gate`); năm luật tĩnh; `dialog.boThayDoi` đủ 4 khoá vi/en khác nhau. Chiều đỏ trên bản sao tmpdir như E11.

- [ ] **Step 2: `man-giu-cho.mjs`** — khuôn theo `_acceptance/so-okr-tu-chay/rang/man-so-tu-chay.mjs` (dựng người bằng `dev:session`, gieo qua tRPC, `moTrang` với cookie, chỉ đếm phần tử đang hiện, dọn dữ liệu ở `finally`). Gieo: một phòng ban, chu kỳ quý đang chạy, một mục tiêu nháp có một KR, một mục tiêu đã công bố (mở ngăn bản ghi có ô trao đổi), một đơn vị. Sáu bước đúng `expected` của E10, mỗi bước in «buoc N: dat» hoặc lý do; ảnh vào `.acceptance-runs/hop-thoai-giu-cho-dang-nhap/evidence/`. Bước 5 kéo tay nắm drawer bằng `page.mouse.move/down/move(steps)/up` (và `page.touchscreen` nếu vaul chỉ nghe chạm) xuống 320 px. `--chieu-do`: chạy bước 1 trên bản sao app ở cổng `CONG_SAO` (xem `dot-bien.mjs`) có `dialog.tsx` bỏ bộ giữ, khẳng định «buoc 1: hop dong sau khi bam ngoai» và mã 1.

Run: `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs"`
Expected: sáu dòng «buoc N: dat», mã 0.

- [ ] **Step 3: Năm lệnh chứng** — `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` đều mã 0.

- [ ] **Step 4: Commit** — `hop-thoai-giu-cho-dang-nhap: sàn thiết kế và phép đo màn thật`
