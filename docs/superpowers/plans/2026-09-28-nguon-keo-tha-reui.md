# Vùng kéo-thả tệp nguồn trên ReUI — kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng lại `NguonKeoTha` trên móc `@reui/use-file-upload` theo bố cục `c-file-upload-3`, giữ nguyên mọi hành vi đang đo.

**Architecture:** Móc ReUI cài vào `packages/ui/src/hooks/` lo trạng thái kéo, bốn bộ bắt kéo-thả, mở hộp chọn tệp và ô tệp; `NguonKeoTha` phân loại tệp bằng `lyDoTuChoiTep` của kho rồi gọi `onChon`/`onTuChoi`. Hộp tải ở `apps/app` chỉ truyền thêm nhãn nút.

**Tech Stack:** React 19, shadcn CLI 4 (`bun run ui:add`), `class-variance-authority`, Carbon icons, `bun test` + jsdom, TypeScript compiler API cho `rang/`.

**Spec:** `docs/superpowers/specs/2026-09-28-nguon-keo-tha-reui-design.md` · hợp đồng `_acceptance/nguon-keo-tha-reui/contract.md` · `_acceptance/nguon-keo-tha-reui/evals.yaml`

## Global Constraints

- Không viết chú thích trong code — kể cả tệp ReUI vừa cài (`AGENTS.md`).
- Cài chỉ từ `packages/ui`: `bun run ui:add @reui/use-file-upload --dry-run` trước, không bao giờ `--overwrite` (`docs/reui.md`).
- Không import `cn` từ gói `cn`, không icon Lucide; icon là `@carbon/icons-react`.
- Chỉ `primary` và `destructive` được tô nền; nút «Chọn tệp» là `variant="outline"`; góc theo thang `rounded-sm/md/lg`.
- Không sửa `packages/ui/test/nguon-canh-nhau.dom.tsx`, `apps/app/test/tai-lieu-nguon.dom.tsx`, `_acceptance/may-soan-de-xuat/**` (phép đo của hồ sơ đã ký).
- Giữ `data-slot="nguon-keo-tha"`, `data-tat`, `data-keo`, `input[type=file]` với `accept`, `aria-describedby`, `aria-invalid`.
- Không lấy `animate-bounce` của ví dụ (`prefers-reduced-motion`).
- Bun 1.3.12 trên PATH khi chạy lệnh kho.

## Review Focus

- Thả tệp vào vùng tắt: trình duyệt không được tự mở tệp → móc vẫn nối `onDrop` (gọi `preventDefault`) và bỏ qua vì ô tệp khoá — phủ ở Task 3 ca `dang-keo` vùng tắt và ca tắt cũ.
- Chọn lại đúng tệp vừa bị từ chối: ô tệp phải được đặt lại `value=""` để `change` bắn lần hai — móc làm việc này trong `addFiles`; Task 3 ca «chọn lại cùng tệp» ghim nó.
- Phím Tab trong hộp: chỉ dừng ở nút «Chọn tệp», không dừng ở ô tệp ẩn — Task 3 ca `nut-chon` kiểm `tabIndex`.
- Bộ đọc màn hình nghe mô tả và lỗi khi đứng ở nút — Task 3 so tập id `aria-describedby` của nút với ô tệp.
- Nhãn tiếng Anh của nút — Task 4 dựng hộp thật dưới `en`.

---

### Task 1: Cài móc `use-file-upload` sạch vào `packages/ui`

independent: false · phục vụ E1 (một phần), E3, E5

**Files:**
- Create: `packages/ui/src/hooks/use-file-upload.ts` (qua CLI)

**Interfaces:**
- Produces: `useFileUpload(options?: FileUploadOptions): [FileUploadState, FileUploadActions]`, `type FileWithPreview = { file: File | FileMetadata; id: string; preview?: string }`, từ `@crm/ui/hooks/use-file-upload`.

- [ ] **Step 1: Dry-run rồi cài**

```bash
cd packages/ui && bun run ui:add @reui/use-file-upload --dry-run
cd packages/ui && bun run ui:add @reui/use-file-upload
git status --short
```
Expected: dry-run báo đúng một tệp `+ src/hooks/use-file-upload.ts create`; sau khi cài `git status` chỉ có tệp đó (nếu CLI chạm `package.json`, `bun.lock` hay `components.json` thì hoàn lại bằng `git checkout -- <tệp>` và ghi vào sổ quyết định).

- [ ] **Step 2: Sửa bốn chỗ**

Xoá mọi chú thích `//` và `/* */` trong `use-file-upload.ts` (chín dòng: bốn chú thích đuôi dòng trong `FileUploadOptions`, «Clean up object URLs», «Clear existing errors…», «In single file mode, clear…», «Check if adding these files…», «Only check for duplicates…», «Skip duplicate files silently», «Check file size», «Call the onFilesAdded callback…», «Only update state…», «Reset input value…», «Don't process files…», «In single file mode, only use…»). Tệp không có `cn`, icon hay màu — ba chỗ còn lại không có việc.

```bash
bunx biome format --write packages/ui/src/hooks/use-file-upload.ts
cd packages/ui && bunx biome check src/hooks/use-file-upload.ts
bun run lint:slop 2>&1 | grep -A3 "use-file-upload" || echo "oxlint sach"
```
Expected: biome xanh. Biome/oxlint báo lỗi trên tệp ReUI (vd thiếu `onError` trong mảng phụ thuộc của `addFiles`) → sửa tối thiểu trong tệp móc, ghi một dòng `fix` vào `decisions.jsonl` nêu luật và dòng.

- [ ] **Step 3: Chứng móc không phá gì khi chưa dùng**

```bash
cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/nguon-canh-nhau.dom.tsx -t NguonKeoTha
cd packages/ui && bun run check-types
```
Expected: 5 pass; tsc xanh.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/hooks/use-file-upload.ts
git commit -m "feat(ui): cài móc ReUI use-file-upload"
```

### Task 2: Thước `rang/cai-sach.mjs` (E1, E2)

independent: false · phục vụ E1, E2

**Files:**
- Create: `_acceptance/nguon-keo-tha-reui/rang/cai-sach.mjs`

**Interfaces:**
- Consumes: tệp móc Task 1; `nguon-keo-tha.tsx` (Task 3 làm E2 xanh).
- Produces: `node …/cai-sach.mjs --phan cai|moc [--chieu-do]` — exit 0 xanh, 1 đỏ (thông điệp ghim), 2 không đo được.

- [ ] **Step 1: Viết script**

Script suy `GOC` từ `import.meta.url` (ba cấp lên). Hàm `kiemCai(goc)` trả mảng `{ o, dat, thongDiep }` cho ma trận:

| kiểm | vật |
| --- | --- |
| `moc-co` | `packages/ui/src/hooks/use-file-upload.ts` tồn tại và có `export const useFileUpload` (quét AST) |
| `khong-chu-thich` | móc · `nguon-keo-tha.tsx` — dùng `ts.createScanner(…, false)` tìm `SingleLineCommentTrivia`/`MultiLineCommentTrivia` |
| `khong-cn` | móc · thành phần — không `ImportDeclaration` có specifier `"cn"` |
| `khong-lucide` | móc · thành phần — không import `lucide-react` |
| `goi-khong-cn` | `packages/ui/package.json` — `dependencies.cn` vắng |
| `nhanh-khong-cham` | `button.tsx` · `alert.tsx` · `styles/globals.css` — tồn tại ở HEAD và ở `merge-base(HEAD, origin/onehub)` (`git cat-file -e`), và không có trong `git diff --name-only <mb>..HEAD`; `origin/onehub` vắng → exit 2 «khong co origin/onehub» |
| `khong-them` | `components/reui/alert.tsx` · `components/examples/` — không tồn tại |

Hàm `kiemMoc(goc)` phân tích `nguon-keo-tha.tsx` bằng `ts.createSourceFile`: tìm `VariableDeclaration` có initializer là lời gọi `useFileUpload` import từ module kết thúc `hooks/use-file-upload`; gom tên bind từ `ArrayBindingPattern` (propertyName ?? name); tìm `JsxOpeningElement`/`JsxSelfClosingElement` có thuộc tính `data-slot="nguon-keo-tha"`; với từng cặp `onDragEnter→handleDragEnter`, `onDragLeave→handleDragLeave`, `onDragOver→handleDragOver`, `onDrop→handleDrop` yêu cầu giá trị là `Identifier` bind từ đúng khoá đó của móc; thẻ `input` có `JsxSpreadAttribute` là lời gọi `getInputProps`; không import `DragEvent` từ `react`. Sai → «vung tu bat keo-tha: <thuộc tính>».

`--chieu-do`: `git worktree add --detach <tmp> HEAD` (tmp dưới `.acceptance-runs/nguon-keo-tha-reui/`), chạy bản lành → phải xanh; rồi từng bản phá (mỗi ô một bản, hoàn lại bằng `git -C tmp reset --hard HEAD && git -C tmp clean -fd` sau mỗi bản — HEAD của tmp được ghi lúc đầu): xoá móc; chèn `// x` vào từng tệp; chèn `import { cn } from "cn";` vào từng tệp; chèn `import { X } from "lucide-react";` vào từng tệp; thêm `"cn": "^1.0.0"` vào dependencies; commit một dòng vào `button.tsx`, `alert.tsx`, `globals.css` (mỗi cái một commit); tạo `reui/alert.tsx`; tạo `examples/c.tsx`. Mỗi bản phá phải cho đúng thông điệp «cai khong sach: <kiểm> <vật>». Phần `moc`: thay `onDrop={handleDrop}` bằng `onDrop={() => {}}` → «vung tu bat keo-tha: onDrop». `finally`: `git worktree remove --force <tmp>`. Bất kỳ bản phá nào không đỏ đúng thông điệp → exit 1 «chieu do hong: <ô>».

- [ ] **Step 2: Chạy — phần `moc` phải đỏ vì thành phần chưa viết lại**

```bash
node _acceptance/nguon-keo-tha-reui/rang/cai-sach.mjs --phan cai
node _acceptance/nguon-keo-tha-reui/rang/cai-sach.mjs --phan moc; echo $?
```
Expected: `cai` in `13/13 o dat`, exit 0; `moc` exit 1 với «khong goi useFileUpload» (thành phần cũ chưa dùng móc).

- [ ] **Step 3: Chiều đỏ của phần `cai`**

```bash
node _acceptance/nguon-keo-tha-reui/rang/cai-sach.mjs --phan cai --chieu-do
```
Expected: 13 dòng «pha <ô>: do dung thong diep», exit 0.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/nguon-keo-tha-reui/rang/cai-sach.mjs
git commit -m "test(acceptance): thước cai-sach cho nguon-keo-tha-reui"
```

### Task 3: `NguonKeoTha` trên móc + tệp test mới

independent: false · phục vụ E2, E3, E4, E4b, E5, E5b, E6, E7, E12

**Files:**
- Modify: `packages/ui/src/components/nguon-keo-tha.tsx` (viết lại toàn bộ)
- Create: `packages/ui/test/nguon-keo-tha.dom.tsx`

**Interfaces:**
- Consumes: `useFileUpload`, `FileWithPreview` (Task 1).
- Produces: `NguonKeoThaProps` thêm `nutChon: string` (bắt buộc); `lyDoTuChoiTep`, `LyDoTuChoi` giữ nguyên.

- [ ] **Step 1: Viết test hỏng trước**

```tsx
import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { NguonKeoTha } from "../src/components/nguon-keo-tha";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

const MB = 1024 * 1024;
const VUNG = {
	nhan: "Kéo tệp vào đây, hoặc chọn tệp",
	moTa: "Word (.docx) hoặc PDF, tới 20 MB",
	nutChon: "Chọn tệp",
	chapNhan: ".docx,.pdf",
	toiDaByte: 20 * MB,
};

function ghim(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

function ve(cay: ReactElement): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(cay));
	return khung;
}

function vung(goc: HTMLElement): HTMLElement {
	const v = goc.querySelector<HTMLElement>('[data-slot="nguon-keo-tha"]');
	if (!v) throw new Error("khong thay vung keo tha");
	return v;
}

function nut(goc: HTMLElement): HTMLButtonElement {
	const n = vung(goc).querySelector("button");
	if (!n) throw new Error("khong thay nut chon");
	return n;
}

function oTep(goc: HTMLElement): HTMLInputElement {
	const o = vung(goc).querySelector<HTMLInputElement>('input[type="file"]');
	if (!o) throw new Error("khong thay o tep");
	return o;
}

function tapId(e: Element): string[] {
	return (e.getAttribute("aria-describedby") ?? "")
		.split(/\s+/)
		.filter(Boolean)
		.sort();
}

function keo(el: Element, loai: string, tu: Node | null = null): void {
	const su = new Event(loai, { bubbles: true, cancelable: true });
	Object.defineProperty(su, "dataTransfer", { value: { files: [] } });
	Object.defineProperty(su, "relatedTarget", { value: tu });
	act(() => {
		el.dispatchEvent(su);
	});
}

function tep(ten: string): File {
	return new File([new Uint8Array(8)], ten);
}

function chon(goc: HTMLElement, f: File): void {
	const o = oTep(goc);
	Object.defineProperty(o, "files", { value: [f], configurable: true });
	act(() => {
		o.dispatchEvent(new Event("change", { bubbles: true }));
	});
}

describe("NguonKeoTha — nút chọn", () => {
	test("nut-chon: bấm nút mở ô tệp", () => {
		const goc = ve(<NguonKeoTha {...VUNG} onChon={() => {}} />);
		const n = nut(goc);
		const o = oTep(goc);
		let dem = 0;
		o.addEventListener("click", (e) => {
			dem += 1;
			e.preventDefault();
		});
		expect(dem).toBe(0);
		expect(n.textContent).toBe(VUNG.nutChon);
		expect(n.getAttribute("data-variant")).toBe("outline");
		act(() => n.click());
		ghim(dem === 1, "nut chon khong mo o tep");
		expect(o.tabIndex).toBe(-1);
		expect(o.getAttribute("aria-label")).toBe(VUNG.nutChon);
		expect(n.tabIndex).toBeGreaterThanOrEqual(0);
	});

	test("nut-chon: nút mang mô tả và câu lỗi", () => {
		const sach = ve(<NguonKeoTha {...VUNG} onChon={() => {}} />);
		ghim(
			tapId(nut(sach)).length === 1 &&
				tapId(nut(sach)).join() === tapId(oTep(sach)).join(),
			"nut khong mang mo ta",
		);
		act(() => root?.unmount());
		document.body.innerHTML = "";
		const loi = "Chỉ nhận Word (.docx) hoặc PDF, tới 20 MB";
		const goc = ve(<NguonKeoTha {...VUNG} loi={loi} onChon={() => {}} />);
		const bao = goc.querySelector('[data-slot="field-error"]');
		ghim(tapId(nut(goc)).join() === tapId(oTep(goc)).join(), "nut khong mang mo ta");
		expect(tapId(nut(goc))).toContain(bao?.id ?? "?");
	});

	test("nut-chon: tắt thì nút khoá", () => {
		const mo = ve(<NguonKeoTha {...VUNG} onChon={() => {}} />);
		expect(nut(mo).disabled).toBe(false);
		act(() => root?.unmount());
		document.body.innerHTML = "";
		const goc = ve(
			<NguonKeoTha {...VUNG} onChon={() => {}} tat={{ lyDo: "Chưa bật" }} />,
		);
		let dem = 0;
		oTep(goc).addEventListener("click", (e) => {
			dem += 1;
			e.preventDefault();
		});
		ghim(nut(goc).disabled, "nut chon khong khoa khi tat");
		act(() => nut(goc).click());
		expect(dem).toBe(0);
	});

	test("nut-chon: chọn lại đúng tệp vừa bị từ chối vẫn báo lại", () => {
		const onTuChoi = mock((_: File, __: string) => {});
		const goc = ve(<NguonKeoTha {...VUNG} onChon={() => {}} onTuChoi={onTuChoi} />);
		const anh = tep("anh.jpg");
		chon(goc, anh);
		chon(goc, anh);
		expect(onTuChoi.mock.calls).toEqual([
			[anh, "loai"],
			[anh, "loai"],
		]);
	});
});

describe("NguonKeoTha — đang kéo", () => {
	test("dang-keo: kéo vào, ra, thả bật tắt data-keo", () => {
		const goc = ve(<NguonKeoTha {...VUNG} onChon={() => {}} />);
		const v = vung(goc);
		keo(v, "dragenter");
		ghim(v.getAttribute("data-keo") === "true", "keo vao khong bat data-keo");
		keo(v, "dragleave", nut(goc));
		expect(v.getAttribute("data-keo")).toBe("true");
		keo(v, "dragleave", null);
		expect(v.getAttribute("data-keo")).toBe("false");
		keo(v, "dragenter");
		keo(v, "drop");
		expect(v.getAttribute("data-keo")).toBe("false");
	});

	test("dang-keo: vùng tắt không bật data-keo", () => {
		const goc = ve(
			<NguonKeoTha {...VUNG} onChon={() => {}} tat={{ lyDo: "Chưa bật" }} />,
		);
		const v = vung(goc);
		keo(v, "dragenter");
		ghim(v.getAttribute("data-keo") === "false", "vung tat van bat data-keo");
	});
});
```

- [ ] **Step 2: Chạy — phải đỏ**

```bash
cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/nguon-keo-tha.dom.tsx
```
Expected: FAIL — «khong thay nut chon».

- [ ] **Step 3: Viết lại thành phần**

```tsx
"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldError,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	type FileWithPreview,
	useFileUpload,
} from "@crm/ui/hooks/use-file-upload";
import { cn } from "@crm/ui/lib/utils";
import { cva } from "class-variance-authority";
import { useId } from "react";

export type LyDoTuChoi = "loai" | "co";

export type NguonKeoThaProps = {
	nhan: string;
	moTa: string;
	nutChon: string;
	chapNhan: string;
	toiDaByte: number;
	tat?: { lyDo: string };
	onChon: (tep: File) => void;
	onTuChoi?: (tep: File, lyDo: LyDoTuChoi) => void;
	loi?: string;
};

const vungKeoThaVariants = cva(
	"flex flex-wrap items-center gap-3 rounded-lg border border-input border-dashed bg-card p-4 transition-colors",
	{
		variants: {
			trangThai: {
				thuong: "hover:bg-muted/50",
				keo: "border-ring bg-muted/50",
				loi: "border-destructive",
				tat: "opacity-50",
			},
		},
		defaultVariants: { trangThai: "thuong" },
	},
);

function duoiTep(ten: string): string { … giữ nguyên … }
function dungLoai(tep: File, chapNhan: string): boolean { … giữ nguyên … }
export function lyDoTuChoiTep(…) { … giữ nguyên … }

export function NguonKeoTha({
	nhan,
	moTa,
	nutChon,
	chapNhan,
	toiDaByte,
	tat,
	onChon,
	onTuChoi,
	loi,
}: NguonKeoThaProps) {
	const goc = useId();
	const idMoTa = `${goc}-mo-ta`;
	const idTat = `${goc}-tat`;
	const idLoi = `${goc}-loi`;
	const biTat = tat !== undefined;

	const nhanTep = (them: FileWithPreview[]) => {
		const tep = them[0]?.file;
		if (!(tep instanceof File)) return;
		const lyDo = lyDoTuChoiTep(tep, chapNhan, toiDaByte);
		if (lyDo) onTuChoi?.(tep, lyDo);
		else onChon(tep);
	};

	const [
		{ isDragging },
		{
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			getInputProps,
		},
	] = useFileUpload({ onFilesAdded: nhanTep });

	const moTaBoi = [idMoTa, biTat ? idTat : null, loi ? idLoi : null]
		.filter(Boolean)
		.join(" ");
	const dangKeo = isDragging && !biTat;
	const trangThai = biTat ? "tat" : dangKeo ? "keo" : loi ? "loi" : "thuong";

	return (
		<Field data-disabled={biTat || undefined} data-invalid={!!loi || undefined}>
			<div
				className={cn(vungKeoThaVariants({ trangThai }))}
				data-keo={dangKeo}
				data-slot="nguon-keo-tha"
				data-tat={biTat}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<input
					{...getInputProps({ accept: chapNhan })}
					aria-describedby={moTaBoi}
					aria-invalid={loi ? true : undefined}
					aria-label={nutChon}
					className="sr-only"
					disabled={biTat}
					tabIndex={-1}
				/>
				<Button
					aria-describedby={moTaBoi}
					disabled={biTat}
					onClick={openFileDialog}
					size="sm"
					type="button"
					variant="outline"
				>
					<Icon icon={Add} />
					{nutChon}
				</Button>
				<div className="flex min-w-0 flex-1 flex-col gap-0.5">
					<span className="font-medium text-sm">{nhan}</span>
					<FieldDescription id={idMoTa}>{moTa}</FieldDescription>
				</div>
			</div>
			{tat ? <FieldDescription id={idTat}>{tat.lyDo}</FieldDescription> : null}
			<FieldError id={idLoi}>{loi}</FieldError>
		</Field>
	);
}
```

(`duoiTep`, `dungLoai`, `lyDoTuChoiTep` chép nguyên từ bản cũ, không đổi một ký tự.) Biome báo `noStaticElementInteractions` trên `div` mang bộ bắt kéo-thả → thêm `role="group"` và `aria-label={nhan}` cho vùng; ghi một dòng `fix` vào sổ.

- [ ] **Step 4: Chạy — mới và cũ đều xanh**

```bash
cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/nguon-keo-tha.dom.tsx
cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/nguon-canh-nhau.dom.tsx -t NguonKeoTha
node _acceptance/nguon-keo-tha-reui/rang/cai-sach.mjs --phan moc
node _acceptance/nguon-keo-tha-reui/rang/cai-sach.mjs --phan moc --chieu-do
cd packages/ui && bun run check-types && bunx biome check src/components/nguon-keo-tha.tsx test/nguon-keo-tha.dom.tsx
```
Expected: 6 pass; 5 pass; `kiem moc: dat`; chiều đỏ «vung tu bat keo-tha: onDrop»; tsc và biome xanh.

- [ ] **Step 5: Phá-thử từng thông điệp ghim (trên cây đã commit — commit trước rồi phá, hoàn bằng `git checkout -- <tệp>`)**

Bốn bản phá, mỗi bản chạy lệnh eval tương ứng và phải đỏ đúng thông điệp: bỏ `onClick={openFileDialog}` → «nut chon khong mo o tep»; bỏ `aria-describedby` trên nút → «nut khong mang mo ta»; bỏ `disabled` trên nút → «nut chon khong khoa khi tat»; `dangKeo = isDragging` → «vung tat van bat data-keo»; bỏ `onDragEnter` → «keo vao khong bat data-keo»; bỏ bước `lyDoTuChoiTep` (gọi thẳng `onChon`) → ca «chiều đỏ: sai loại hay quá cỡ» của `nguon-canh-nhau` fail; bỏ `disabled` trên ô tệp → ca «tắt» fail.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/nguon-keo-tha.tsx packages/ui/test/nguon-keo-tha.dom.tsx
git commit -m "feat(ui): NguonKeoTha dựng trên móc ReUI use-file-upload theo bố cục c-file-upload-3"
```

### Task 4: Hộp tải truyền nhãn nút, chữ vi/en, tệp test chữ

independent: false · phục vụ E8, E9, E9b, E10, E11u

**Files:**
- Modify: `apps/app/lib/messages/tai-lieu.ts` (khoá `nguon.hop.keoThaNut` ở `en` và `vi`)
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/hop-tai-nguon.tsx` (prop `nutChon={m.keoThaNut}`)
- Create: `apps/app/test/nguon-keo-tha-chu.dom.tsx`

**Interfaces:**
- Consumes: `NguonKeoThaProps.nutChon` (Task 3).

- [ ] **Step 1: Test hỏng trước**

`nguon-keo-tha-chu.dom.tsx` chép các `mock.module` của `tai-lieu-nguon.dom.tsx` cần cho `NutTaiNguon` (`@/lib/trpc/client` với `taiLieuNguon.trangThai` trả `{ bat: true }`, `xinCho`/`nhan`/`list` rỗng; `@/lib/trpc/cache`; `next/navigation`; `next/link`), rồi:

```tsx
const { NutTaiNguon } = await import("@/app/(app)/[slug]/tai-lieu/hop-tai-nguon");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { taiLieuMessages } = await import("@/lib/messages/tai-lieu");

async function nhanNut(locale: "vi" | "en"): Promise<string> {
	await mo(<LocaleProvider locale={locale}><NutTaiNguon luaChon={LUA_CHON} /></LocaleProvider>);
	await bam(nutTheoChu(taiLieuMessages(locale).nguon.nutTai));
	const n = document.body.querySelector("[data-hop-tai-nguon] [data-slot='nguon-keo-tha'] button");
	return n?.textContent ?? "";
}

describe("chu-nut — nhãn nút chọn tệp lấy từ tệp chữ", () => {
	test("chu-nut: vi và en đúng trọn chuỗi keoThaNut", async () => {
		const vi = await nhanNut("vi");
		await don();
		const en = await nhanNut("en");
		ghim(vi === taiLieuMessages("vi").nguon.hop.keoThaNut, "nhan nut khong lay tu tep chu");
		ghim(en === taiLieuMessages("en").nguon.hop.keoThaNut, "nhan nut khong lay tu tep chu");
		expect(vi).not.toBe(en);
	});
});
```
(`mo`, `bam`, `nutTheoChu`, `don`, `LUA_CHON`, `QueryClientProvider` dựng như trong `tai-lieu-nguon.dom.tsx`.)

```bash
cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/nguon-keo-tha-chu.dom.tsx
```
Expected: FAIL — «nhan nut khong lay tu tep chu».

- [ ] **Step 2: Thêm khoá chữ và truyền prop**

`en.nguon.hop`: `keoThaNut: "Choose file",` ngay sau `keoThaMoTa`. `vi.nguon.hop`: `keoThaNut: "Chọn tệp",`. Trong `hop-tai-nguon.tsx` thêm `nutChon={m.keoThaNut}` vào `<NguonKeoTha …>` (thứ tự prop theo chữ cái như biome sắp).

- [ ] **Step 3: Chạy mọi phép đo của hộp**

```bash
cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/nguon-keo-tha-chu.dom.tsx
cd apps/app && bun test test/messages-guard.spec.ts
cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-nguon.dom.tsx
cd apps/app && bun run check-types && bunx biome check "app/(app)/[slug]/tai-lieu/hop-tai-nguon.tsx" lib/messages/tai-lieu.ts test/nguon-keo-tha-chu.dom.tsx
```
Expected: 1 pass; messages-guard xanh; 10 pass; tsc, biome xanh.

- [ ] **Step 4: Phá-thử (sau commit)**

`nutChon={m.keoTha}` → «nhan nut khong lay tu tep chu»; bản sao `nguon-keo-tha.tsx` bỏ `onFilesAdded` → ca đối chứng `tai-loi` và ca trùng của `hang-nguon` fail. Hoàn bằng `git checkout -- <tệp>`.

- [ ] **Step 5: Commit**

```bash
git add apps/app/lib/messages/tai-lieu.ts "apps/app/app/(app)/[slug]/tai-lieu/hop-tai-nguon.tsx" apps/app/test/nguon-keo-tha-chu.dom.tsx
git commit -m "feat(tai-lieu): hộp tải truyền nhãn «Chọn tệp» cho vùng kéo-thả mới"
```

### Task 5: Năm lệnh chứng của kho + soát chuẩn giao diện

independent: false · phục vụ mọi eval (suite), E12

- [ ] **Step 1: Năm lệnh**

```bash
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```
Expected: cả năm exit 0.

- [ ] **Step 2: design-gate tĩnh và chuẩn `web-design-guidelines`**

```bash
bash -c "$(grep 'msd_san_thiet_ke:' _acceptance/config.yaml | sed 's/^ *msd_san_thiet_ke: *//; s/^'"'"'//; s/'"'"'$//')"
```
Expected: exit 0. Soát `nguon-keo-tha.tsx` theo luật đã rút ở design doc (focus-visible của nút có sẵn trong `buttonVariants`, không `outline-none` trần, không animation).

- [ ] **Step 3: Đặt `status: implemented` rồi commit**

```bash
git add _acceptance/nguon-keo-tha-reui/contract.md
git commit -m "docs(acceptance): nguon-keo-tha-reui implemented"
```
