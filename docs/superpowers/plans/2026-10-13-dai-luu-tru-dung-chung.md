# Dải lưu trữ dùng chung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dời dải báo `DaiLuuTru` và vùng khoá `KhoaLuuTru` từ `apps/app` vào `packages/ui`, ba ngăn CRM dùng mảnh chung, hành vi và hình không đổi.

**Architecture:** `packages/ui/src/components/dai-luu-tru.tsx` giữ phần trình bày (dải nhận tiêu đề, nhãn nút, hàm khôi phục qua prop) và vùng khoá (chép nguyên). `record-actions.tsx` giữ lớp mỏng `DaiLuuTruBanGhi` lo tRPC, chữ và ngày. Ba răng đo mới trong `_acceptance/dai-luu-tru-dung-chung/rang/` và một răng màn gọi lại phép đo đã ký của V2.

**Tech Stack:** React 19, bun test + happy-dom, `@testing-library/user-event`, TanStack Query, tRPC giả bằng Proxy.

**Spec:** `docs/superpowers/specs/2026-10-13-dai-luu-tru-dung-chung-design.md` · hợp đồng `_acceptance/dai-luu-tru-dung-chung/contract.md` · tiêu chí `_acceptance/dai-luu-tru-dung-chung/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- `/packages/ui` là nguồn duy nhất của UI; không `className` đè style ở chỗ gọi.
- Không đổi chữ, khoá chữ, hình hay máy chủ; không chạm `apps/app/lib/messages/*.ts`.
- Giữ `data-dai-luu-tru` và `data-khoa-luu-tru` (bài V2 đọc chúng); thêm `data-slot="dai-luu-tru"`.
- Không sửa `apps/app/test/vong-doi-mot-cach-cat.dom.tsx`, `_acceptance/vong-doi-mot-cach-cat/**` (E11 canh).
- `_acceptance/config.yaml` chỉ thêm dòng (luật 7 của đợt) — đã thêm ở S1.
- Phép đo mới đi kèm cặp hai chiều trên cùng fixture, chiều đỏ ghim thông điệp (MEASURE-BIRTH-CLAUSE).

## Review Focus

- `dangKhoiPhuc` không được truyền từ lớp mỏng → bấm hai lần gửi hai lần khôi phục (Task 3, E12).
- Bộ chặn `pointerdown`/`keydown` rơi khi dời → Radix Select mở được trên bản đã cất (Task 1, E2 ma trận 16).
- Tệp kiểm V2 bị sửa cho xanh lại sau khi dời (Task 4, E11).
- Ảnh cũ sót trong thư mục bằng chứng làm E10 so nhầm (Task 5: xoá ảnh trước khi chạy).
- Ba ngăn còn nhập `KhoaLuuTru` từ `./record-actions` (Task 3, E6).

---

### Task 1: Mảnh chung trong packages/ui

`independent: true` · phục vụ E1, E2

**Files:**
- Create: `packages/ui/src/components/dai-luu-tru.tsx`
- Test: `packages/ui/test/dai-luu-tru.dom.tsx`

**Interfaces:**
- Produces: `DaiLuuTru({ tieuDe: ReactNode; nhanKhoiPhuc: string; onKhoiPhuc: () => void; dangKhoiPhuc?: boolean })`, `KhoaLuuTru({ khoa: boolean; children: ReactNode })`, nhập bằng `@crm/ui/components/dai-luu-tru`.

- [ ] **Step 1: Viết bài kiểm đỏ** `packages/ui/test/dai-luu-tru.dom.tsx`:

```tsx
import { afterEach, describe, expect, test } from "bun:test";
import { fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DaiLuuTru, KhoaLuuTru } from "../src/components/dai-luu-tru";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function ve(cay: ReactElement) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() => root?.render(cay));
	return o;
}

const TIEU_DE = "Đã lưu trữ ngày 15/09/2026";

describe("dlt-dai", () => {
	test("dải mang data-slot, tiêu đề, bấm gọi đúng một lần", async () => {
		let goi = 0;
		const o = ve(
			<DaiLuuTru tieuDe={TIEU_DE} nhanKhoiPhuc="Khôi phục" onKhoiPhuc={() => goi++} />,
		);
		const dai = o.querySelectorAll('[data-dai-luu-tru][data-slot="dai-luu-tru"]');
		if (dai.length !== 1) throw new Error("dlt: dai khong mang data-slot");
		expect((dai[0]?.textContent ?? "").includes(TIEU_DE)).toBe(true);
		const nut = [...o.querySelectorAll("button")].find((b) => b.textContent === "Khôi phục");
		expect(nut?.matches(":disabled")).toBe(false);
		await userEvent.setup({ document }).click(nut as HTMLButtonElement);
		expect(goi).toBe(1);
	});

	test("đang khôi phục thì nút tắt, bấm không gọi", async () => {
		let goi = 0;
		const o = ve(
			<DaiLuuTru tieuDe={TIEU_DE} nhanKhoiPhuc="Khôi phục" onKhoiPhuc={() => goi++} dangKhoiPhuc />,
		);
		const nut = [...o.querySelectorAll("button")].find((b) => b.textContent === "Khôi phục");
		if (!nut?.matches(":disabled")) throw new Error("dlt: dang khoi phuc van bam duoc");
		await userEvent.setup({ document, pointerEventsCheck: 0 }).click(nut);
		expect(goi).toBe(0);
	});
});

const SU_KIEN = ["pointerdown", "mousedown", "click", "keydown"] as const;
type SuKien = (typeof SU_KIEN)[number];
const CHO = ["combobox", "contenteditable"] as const;
type Cho = (typeof CHO)[number];
type Dem = Record<Cho, Record<SuKien, number>>;

function demMoi(): Dem {
	const mot = () => ({ pointerdown: 0, mousedown: 0, click: 0, keydown: 0 });
	return { combobox: mot(), contenteditable: mot() };
}

function boDem(dem: Dem, cho: Cho) {
	return {
		onPointerDown: () => dem[cho].pointerdown++,
		onMouseDown: () => dem[cho].mousedown++,
		onClick: () => dem[cho].click++,
		onKeyDown: () => dem[cho].keydown++,
	};
}

function veKhoa(khoa: boolean, dem: Dem) {
	return ve(
		<KhoaLuuTru khoa={khoa}>
			<input aria-label="o" />
			<button type="button">nut</button>
			<div role="combobox" aria-controls="x" aria-expanded={false} tabIndex={0} data-cho="combobox" {...boDem(dem, "combobox")}>
				chon
			</div>
			<div contentEditable suppressContentEditableWarning tabIndex={0} data-cho="contenteditable" {...boDem(dem, "contenteditable")}>
				sua
			</div>
		</KhoaLuuTru>,
	);
}

async function ban(o: HTMLElement, cho: Cho, su: SuKien) {
	const el = o.querySelector(`[data-cho="${cho}"]`) as HTMLElement;
	if (su === "keydown") {
		act(() => el.focus());
		await userEvent.setup({ document, pointerEventsCheck: 0 }).keyboard("{Enter}");
		return;
	}
	if (su === "pointerdown") act(() => void fireEvent.pointerDown(el));
	if (su === "mousedown") act(() => void fireEvent.mouseDown(el));
	if (su === "click") act(() => void fireEvent.click(el));
}

const THONG_DIEP: Record<SuKien, string> = {
	pointerdown: "dlt: khoa de lot pointerdown",
	mousedown: "dlt: khoa de lot mousedown",
	click: "dlt: khoa de lot click",
	keydown: "dlt: khoa de lot phim",
};

describe("dlt-khoa", () => {
	test("ma trận 2 chỗ × 4 sự kiện × 2 trạng thái", async () => {
		const o: string[] = [];
		for (const khoa of [true, false]) {
			for (const cho of CHO) {
				for (const su of SU_KIEN) {
					const dem = demMoi();
					const goc = veKhoa(khoa, dem);
					await ban(goc, cho, su);
					const mong = khoa ? 0 : 1;
					if (dem[cho][su] !== mong) throw new Error(khoa ? THONG_DIEP[su] : `dlt: mo khoa van chan ${su}`);
					o.push(`${khoa}-${cho}-${su}`);
					act(() => root?.unmount());
					root = null;
					document.body.innerHTML = "";
				}
			}
		}
		expect(o.length).toBe(16);
	});

	test("khoá bật thì ô nhập và nút tắt, tắt thì không", () => {
		const bat = veKhoa(true, demMoi());
		const input = bat.querySelector("input");
		if (!input?.matches(":disabled")) throw new Error("dlt: o nhap khong tat khi khoa");
		expect(bat.querySelector("button")?.matches(":disabled")).toBe(true);
		expect(bat.querySelector("[data-khoa-luu-tru]")).not.toBeNull();
		act(() => root?.unmount());
		const tat = veKhoa(false, demMoi());
		expect(tat.querySelector("input")?.matches(":disabled")).toBe(false);
		expect(tat.querySelector("button")?.matches(":disabled")).toBe(false);
		expect(tat.querySelector("[data-khoa-luu-tru]")).toBeNull();
	});
});
```

- [ ] **Step 2: Chạy, mong đỏ** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/dai-luu-tru.dom.tsx` — FAIL: không tìm thấy `../src/components/dai-luu-tru`.

- [ ] **Step 3: Viết mảnh** `packages/ui/src/components/dai-luu-tru.tsx`:

```tsx
"use client";

import Archive from "@carbon/icons-react/es/Archive";
import Undo from "@carbon/icons-react/es/Undo";
import type { ReactNode, SyntheticEvent } from "react";
import { Alert, AlertAction, AlertTitle } from "./alert";
import { Button } from "./button";
import { Icon } from "./icon";

function DaiLuuTru({
	tieuDe,
	nhanKhoiPhuc,
	onKhoiPhuc,
	dangKhoiPhuc = false,
}: {
	tieuDe: ReactNode;
	nhanKhoiPhuc: string;
	onKhoiPhuc: () => void;
	dangKhoiPhuc?: boolean;
}) {
	return (
		<div className="shrink-0 border-b p-3">
			<Alert data-dai-luu-tru="" data-slot="dai-luu-tru">
				<Icon icon={Archive} />
				<AlertTitle>{tieuDe}</AlertTitle>
				<AlertAction>
					<Button variant="outline" size="sm" disabled={dangKhoiPhuc} onClick={onKhoiPhuc}>
						<Icon icon={Undo} data-icon="inline-start" />
						{nhanKhoiPhuc}
					</Button>
				</AlertAction>
			</Alert>
		</div>
	);
}

const CHO_SUA =
	"button, input, textarea, select, [role=combobox], [role=button], [contenteditable=true]";

function KhoaLuuTru({ khoa, children }: { khoa: boolean; children: ReactNode }) {
	const chan = (event: SyntheticEvent) => {
		if (!khoa) return;
		if (!(event.target instanceof Element)) return;
		if (!event.target.closest(CHO_SUA)) return;
		event.preventDefault();
		event.stopPropagation();
	};
	return (
		<fieldset
			disabled={khoa}
			data-khoa-luu-tru={khoa ? "" : undefined}
			className="contents"
			onPointerDownCapture={chan}
			onMouseDownCapture={chan}
			onClickCapture={chan}
			onKeyDownCapture={chan}
		>
			{children}
		</fieldset>
	);
}

export { DaiLuuTru, KhoaLuuTru };
```

Kiểm `Alert` có truyền `data-slot` đè được không: nếu `Alert` tự đặt `data-slot="alert"` sau `...props`, đặt `data-slot` ở khung `div` ngoài thay vào (`<div data-slot="dai-luu-tru" …>`) và đổi bộ chọn của bài thành `[data-slot="dai-luu-tru"] [data-dai-luu-tru]`; đồng bộ `expected` của E1 trong `evals.yaml` nếu đổi.

- [ ] **Step 4: Chạy, mong xanh** cùng lệnh — PASS 4 bài.

- [ ] **Step 5: Phá-thử chiều đỏ** trên bản sao tạm (không sửa tệp thật): bỏ `data-slot` → đỏ «dlt: dai khong mang data-slot»; bỏ `disabled={dangKhoiPhuc}` → «dlt: dang khoi phuc van bam duoc»; bỏ từng `on…Capture` → đúng thông điệp của sự kiện đó; `disabled={false}` cố định → «dlt: o nhap khong tat khi khoa». Ghi kết quả vào commit message.

- [ ] **Step 6: Commit** `git add packages/ui/src/components/dai-luu-tru.tsx packages/ui/test/dai-luu-tru.dom.tsx && git commit -m "feat(dai-luu-tru-dung-chung): DaiLuuTru và KhoaLuuTru vào packages/ui"`

### Task 2: Luật kho gọi tên mảnh

`independent: true` · phục vụ E7

**Files:**
- Modify: `docs/vong-doi.md` (bảng «Mảnh dùng chung», dòng «Dải báo bản ghi đã lưu trữ»)
- Create: `_acceptance/dai-luu-tru-dung-chung/rang/bang-manh.mjs`

- [ ] **Step 1: Viết răng** `rang/bang-manh.mjs`: đọc `docs/vong-doi.md` (hoặc `git show $(git merge-base HEAD origin/onehub):docs/vong-doi.md` khi `--chieu-do`), cắt mục từ `## Mảnh dùng chung` tới `## ` kế; lọc dòng bắt đầu `| Dải báo bản ghi đã lưu trữ |`; đúng 1 dòng; ô thứ hai chứa `có`, `DaiLuuTru`, `KhoaLuuTru`, `packages/ui`, không chứa `chưa`. Sai → `console.log("dai-luu-tru-dung-chung bang-manh: do — dai bao van ghi chua")`, `process.exit(1)`; đúng → `dai-luu-tru-dung-chung bang-manh: dat`. Gốc kho suy từ `import.meta.url` (`join(HERE, "..", "..", "..")`).

- [ ] **Step 2: Chạy, mong đỏ** `bun _acceptance/dai-luu-tru-dung-chung/rang/bang-manh.mjs` — exit 1, «dai bao van ghi chua».

- [ ] **Step 3: Sửa dòng bảng** thành `| Dải báo bản ghi đã lưu trữ | có — \`DaiLuuTru\`, \`KhoaLuuTru\` (\`packages/ui\`) |`.

- [ ] **Step 4: Chạy, mong xanh**; rồi `--chieu-do` → đỏ «bang-manh: dai bao van ghi chua».

- [ ] **Step 5: Commit** `docs(dai-luu-tru-dung-chung): bảng mảnh dùng chung gọi tên DaiLuuTru, KhoaLuuTru`.

### Task 3: Ba ngăn dùng mảnh chung

`independent: false` (cần Task 1) · phục vụ E3, E4, E5, E6, E12

**Files:**
- Modify: `apps/app/components/crm/record-sheet/record-actions.tsx` (bỏ `DaiLuuTru`, `CHO_SUA`, `KhoaLuuTru` cục bộ; thêm `DaiLuuTruBanGhi`)
- Modify: `company-sheet.tsx`, `contact-sheet.tsx`, `deal-sheet.tsx` (đổi nhập và tên gọi)
- Create: `apps/app/test/dai-luu-tru-dung-chung.dom.tsx`
- Create: `_acceptance/dai-luu-tru-dung-chung/rang/mot-noi.mjs`

**Interfaces:**
- Consumes: `DaiLuuTru`, `KhoaLuuTru` từ `@crm/ui/components/dai-luu-tru`.
- Produces: `DaiLuuTruBanGhi({ record: EntityRef; archivedAt: string })` export từ `record-actions.tsx`.

- [ ] **Step 1: Viết răng** `rang/mot-noi.mjs`: duyệt đệ quy `apps/app` (bỏ `node_modules`, `.next`, `apps/app/test`), lấy `.ts`/`.tsx`; đếm tệp quét (`> 100`); tệp nào chứa `data-dai-luu-tru`, `data-khoa-luu-tru` hay `<fieldset` → lỗi gọi tên tệp; ba tệp ngăn phải có `import { KhoaLuuTru } from "@crm/ui/components/dai-luu-tru"` (hoặc nằm trong cùng mệnh đề nhập từ chỗ đó); `record-actions.tsx` phải nhập `DaiLuuTru` từ chỗ đó và có `<DaiLuuTru`. `--chieu-do`: chép `git show $(git merge-base HEAD origin/onehub):apps/app/components/crm/record-sheet/record-actions.tsx` vào thư mục tạm `mkdtempSync` rồi quét riêng tệp đó → phải đỏ. Thông điệp đỏ: `dai-luu-tru-dung-chung mot-noi: do — apps/app con tu dung dai luu tru: <tệp>`. Xanh: `dai-luu-tru-dung-chung mot-noi: dat`.

- [ ] **Step 2: Chạy, mong đỏ** — gọi tên `record-actions.tsx`.

- [ ] **Step 3: Viết bài kiểm đỏ** `apps/app/test/dai-luu-tru-dung-chung.dom.tsx` (describe `dlt-ngan-cho`): chép khối tRPC giả của `apps/app/test/vong-doi-mot-cach-cat.dom.tsx` dòng 1–80 (Proxy `trpcGia`, `mock.module("@/lib/trpc/client")`, `mock.module("next/navigation")`), nhưng `mutationFn` của đường `<thủ tục>.restore` trả `choKhoiPhuc` — một promise giữ `giai` ngoài. Với mỗi `kind` trong `["company","contact","deal"]`: vẽ `<QueryClientProvider><LocaleProvider locale="vi"><DaiLuuTruBanGhi record={{kind,id:"r-1"}} archivedAt="2026-09-15T03:00:00.000Z" /></LocaleProvider></QueryClientProvider>`; bấm nút `crmMessages("vi").bulk.restore` hai lần bằng `userEvent.setup({document, pointerEventsCheck: 0})`; `goiCua("<thủ tục>.restore").length === 1` và nút `:disabled`, sai thì `throw new Error("dlt: ngan cho khoi phuc van bam duoc")`; `act(async () => giai({ name: "X" }))` rồi chờ nút hết `:disabled`; `o.push(kind)`; cuối `expect(o.length).toBe(3)`. Thủ tục: `company→companies`, `contact→contacts`, `deal→deals`.

- [ ] **Step 4: Chạy, mong đỏ** `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dai-luu-tru-dung-chung.dom.tsx -t dlt-ngan-cho` — FAIL: `DaiLuuTruBanGhi` không có.

- [ ] **Step 5: Sửa `record-actions.tsx`**: bỏ hàm `DaiLuuTru`, hằng `CHO_SUA`, hàm `KhoaLuuTru` và nhập `Alert, AlertAction, AlertTitle`, `SyntheticEvent` nếu thôi dùng; thêm:

```tsx
import { DaiLuuTru } from "@crm/ui/components/dai-luu-tru";

export function DaiLuuTruBanGhi({
	record,
	archivedAt,
}: {
	record: EntityRef;
	archivedAt: string;
}) {
	const m = crmMessages(useLocale());
	const restore = useRestoreRecord(record);
	return (
		<DaiLuuTru
			tieuDe={
				<>
					{m.sheet.daLuuTruNgay}{" "}
					<LocalDateTime date={archivedAt} options={NGAY_LUU_TRU} />
				</>
			}
			nhanKhoiPhuc={m.bulk.restore}
			onKhoiPhuc={() => restore.mutate({ id: record.id })}
			dangKhoiPhuc={restore.isPending}
		/>
	);
}
```

- [ ] **Step 6: Sửa ba ngăn**: `import { DaiLuuTruBanGhi, RecordActions } from "./record-actions";` + `import { KhoaLuuTru } from "@crm/ui/components/dai-luu-tru";`; đổi `<DaiLuuTru` → `<DaiLuuTruBanGhi` (props giữ nguyên `record`, `archivedAt`).

- [ ] **Step 7: Chạy, mong xanh**: `dlt-ngan-cho`, `bun _acceptance/dai-luu-tru-dung-chung/rang/mot-noi.mjs` (và `--chieu-do` đỏ), cùng ba bài V2: `config:executors.test.vdc_dai_bao`, `vdc_chi_doc`, `vdc_chu` — không sửa tệp kiểm V2. Phá-thử: bản sao bỏ `dangKhoiPhuc` → «dlt: ngan cho khoi phuc van bam duoc».

- [ ] **Step 8: Kiểm kho** `bun run check-types`, `bun run lint`, `bun run lint:slop`.

- [ ] **Step 9: Commit** `refactor(dai-luu-tru-dung-chung): ba ngăn dùng DaiLuuTru, KhoaLuuTru của packages/ui`.

### Task 4: Canh vật đo của V2

`independent: true` · phục vụ E11

**Files:**
- Create: `_acceptance/dai-luu-tru-dung-chung/rang/v2-nguyen.mjs`

- [ ] **Step 1: Viết răng**: `MOC = process.env.MOC ?? git merge-base HEAD origin/onehub`; bốn tệp `apps/app/test/vong-doi-mot-cach-cat.dom.tsx`, `_acceptance/vong-doi-mot-cach-cat/rang/man.mjs`, `_acceptance/vong-doi-mot-cach-cat/evidence/vdc-ngan-da-cat-1440.png`, `…-390.png`; từng tệp phải tồn tại và `git diff --quiet MOC -- <tệp>` thoát 0 (đếm 4 phép); đếm `.skip(`, `.only(`, `.todo(` trong tệp kiểm V2 ở cây và ở `git show MOC:<tệp>` — phải bằng nhau. `--chieu-do`: đếm trên chuỗi tệp kiểm V2 ghép thêm `test.skip(` → phải đỏ. Đỏ: `dai-luu-tru-dung-chung v2-nguyen: do — bai V2 bi sua: <tệp>`. Xanh: `dai-luu-tru-dung-chung v2-nguyen: dat`. Chạy `git` bằng `spawnSync` với `cwd` là gốc kho suy từ `import.meta.url`.

- [ ] **Step 2: Chạy, mong xanh**; `--chieu-do` mong đỏ đúng thông điệp.

- [ ] **Step 3: Commit** `test(dai-luu-tru-dung-chung): canh tệp kiểm và ảnh nền của V2`.

### Task 5: Răng màn gọi lại phép đo V2

`independent: true` · phục vụ E8, E9

**Files:**
- Create: `_acceptance/dai-luu-tru-dung-chung/rang/man.mjs`

- [ ] **Step 1: Viết răng**: thiếu `PHIEN_DO` hoặc `API_URL` → in «KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/dai-luu-tru-dung-chung/rang/man.mjs"», exit 2. `BANG_CHUNG = .acceptance-runs/dai-luu-tru-dung-chung/evidence`; xoá `vdc-ngan-da-cat-1440.png`, `vdc-ngan-da-cat-390.png` cũ ở đó; `spawnSync("bun", ["_acceptance/vong-doi-mot-cach-cat/rang/man.mjs", ...(CHIEU_DO ? ["--chieu-do"] : [])], { cwd: GOC, env: { ...process.env, BANG_CHUNG }, stdio: ["ignore","pipe","inherit"] })`; in lại stdout; exit ≠ 0 hoặc stdout thiếu `vong-doi-mot-cach-cat man: dat` → in `dai-luu-tru-dung-chung man: do` kèm dòng đỏ của V2, exit 1. Xanh: nếu hợp đồng của hồ sơ này không `signed-off`/`machine-cleared` và không `--chieu-do`, chép hai ảnh thành `_acceptance/dai-luu-tru-dung-chung/evidence/dlt-ngan-da-cat-1440.png`, `…-390.png` (thiếu ảnh → đỏ «man: thieu anh <tên>»); in `dai-luu-tru-dung-chung man: dat`.

- [ ] **Step 2: Chạy** `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/dai-luu-tru-dung-chung/rang/man.mjs"` sau Task 3 — mong «dai-luu-tru-dung-chung man: dat», hai ảnh có trong `evidence/`. `--chieu-do` mong đỏ «man: khong thay dai luu tru».

- [ ] **Step 3: Commit** `test(dai-luu-tru-dung-chung): răng màn gọi lại phép đo của V2` kèm hai ảnh.
