# Bố cục hẹp của ngăn và Kanban thoả thuận — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ở khổ dưới `md`, hàng số liệu đầu ngăn và thanh giai đoạn hiện đủ chữ, nhãn giai đoạn trên thẻ Kanban thoả thuận đứng trong viền thẻ; khổ rộng giữ như hôm nay.

**Architecture:** Thêm biến thể `wrapLabel` cho `StatusIndicator` (`packages/ui`, mặc định giữ cắt). `DetailSheetStats` dưới `md` thành lưới 2×2, nhãn xuống dòng. Thanh giai đoạn và thẻ Kanban dùng biến thể xuống dòng; hàng người phụ trách và giai đoạn của thẻ cho `flex-wrap`. Thước đo màn thật `do-bo-cuc.mjs` theo khuôn `do-chu-ky.mjs` của NM3.

**Tech Stack:** React 19, Tailwind 4, Next 16 (`apps/app`), bun test + happy-dom (`packages/ui`), puppeteer qua `man-lib.mjs` và `mot-luot.sh`.

**Spec:** `docs/superpowers/specs/2026-10-16-bo-cuc-hep-ngan-va-kanban-design.md` · hợp đồng `_acceptance/bo-cuc-hep-ngan-va-kanban/contract.md` · evals `_acceptance/bo-cuc-hep-ngan-va-kanban/evals.yaml`.

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Biến thể mới làm ở `packages/ui`, không đè `className` của component `@crm/ui` ở chỗ gọi (`docs/design.md`).
- Ngưỡng đổi bố cục là `md` (768).
- Hỏi-1..4 theo khuyến nghị: lưới 2×2, tên bước xuống dòng đủ chữ, nhãn thẻ xuống dòng trong viền, không bản mẫu.
- Verify của kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` (CLAUDE.md). Sửa tệp kiểm thì chạy lint trước khi chấm.
- Thước đo chạy trong phiên đo (`mot-luot.sh`), không chạm cổng 3000/3001.

## Review Focus

- Tên một từ 120 ký tự không dấu cách: phải xuống dòng ở mọi vị trí (`wrap-anywhere`), không chỉ ở dấu cách — Task 2, 3, 4 dùng `wrap-anywhere`, thước gieo đúng ca đó.
- Ô số liệu rỗng «—» ở lưới 2×2 vẫn giữ chiều cao hàng — thước E2 đếm đủ 8 phần tử chữ kể cả ô rỗng.
- Thoả thuận ở giai đoạn chốt: bước chốt hiện bằng `StatusIndicator` — Task 3 truyền `wrapLabel`, thước E3 mở ngăn thoả thuận CHOT.
- Màn khác dùng `StatusIndicator` không đổi — Task 1 bài kiểm mặc định vẫn `truncate`.
- Khổ 1440 với dữ liệu ngắn giữ cùng hàng — thước E5.

---

### Task 1: Biến thể nhãn xuống dòng của `StatusIndicator`

independent: true · phục vụ E8 (AC-7), là nền của Task 3, 4

**Files:**
- Modify: `packages/ui/src/components/status-indicator.tsx` (hàm `StatusIndicator`)
- Test: `packages/ui/test/status-indicator-xuong-dong.dom.tsx`

**Interfaces:**
- Produces: `StatusIndicator` nhận thêm prop `wrapLabel?: boolean` (mặc định `false`). Phần tử nhãn mang `data-slot="status-indicator-label"`; `wrapLabel` false → lớp `truncate`; true → lớp `min-w-0 wrap-anywhere`, không `truncate`.

- [ ] **Step 1: Viết bài kiểm đỏ** — `kiemNhan(StatusIndicator)` dựng hai lần cùng nhãn, ném `bch-nhan: mac dinh khong con cat` khi mặc định không có `truncate`, ném `bch-nhan: bien the van cat` khi biến thể còn `truncate`. Chiều đỏ: chép `status-indicator.tsx` sang `packages/ui/node_modules/.bch-do/` với mặc định đổi sang xuống dòng (thay `wrapLabel = false` bằng `wrapLabel = true`), nạp bản chép, kỳ vọng ném đúng ghim.

```tsx
import { afterEach, describe, expect, test } from "bun:test";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

const TEP = resolve(import.meta.dir, "..", "src", "components", "status-indicator.tsx");
let goc: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => goc?.unmount());
	khung?.remove();
	goc = null;
	khung = null;
});

async function nhan(
	SI: typeof import("../src/components/status-indicator").StatusIndicator,
	wrapLabel: boolean | undefined,
): Promise<string> {
	khung = document.createElement("div");
	document.body.append(khung);
	goc = createRoot(khung);
	await act(async () => {
		goc?.render(<SI tone="info" label="Decision maker bought-in" wrapLabel={wrapLabel} />);
	});
	const el = khung.querySelector('[data-slot="status-indicator-label"]');
	if (!el) throw new Error("bch-nhan: khong thay nhan");
	const lop = el.className;
	act(() => goc?.unmount());
	khung.remove();
	goc = null;
	khung = null;
	return lop;
}

async function kiemNhan(SI: Parameters<typeof nhan>[0]): Promise<void> {
	if (!(await nhan(SI, undefined)).split(" ").includes("truncate"))
		throw new Error("bch-nhan: mac dinh khong con cat");
	const bienThe = (await nhan(SI, true)).split(" ");
	if (bienThe.includes("truncate") || !bienThe.includes("wrap-anywhere"))
		throw new Error("bch-nhan: bien the van cat");
}

describe("bch-nhan", () => {
	test("mac dinh cat, bien the xuong dong", async () => {
		const { StatusIndicator } = await import("../src/components/status-indicator");
		await kiemNhan(StatusIndicator);
	});

	test("chieu do: ban sao doi mac dinh sang xuong dong thi do dung ghim", async () => {
		const thu = resolve(import.meta.dir, "..", "node_modules", ".bch-do");
		mkdirSync(thu, { recursive: true });
		const ban = join(thu, `status-indicator-${Date.now()}.tsx`);
		const nguon = readFileSync(TEP, "utf8");
		const doi = nguon.replace("wrapLabel = false", "wrapLabel = true");
		expect(doi).not.toBe(nguon);
		writeFileSync(ban, doi);
		const { StatusIndicator } = await import(ban);
		await expect(kiemNhan(StatusIndicator)).rejects.toThrow("bch-nhan: mac dinh khong con cat");
	});
});
```

- [ ] **Step 2: Chạy, kỳ vọng đỏ** — `cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/status-indicator-xuong-dong.dom.tsx` → FAIL «bch-nhan: khong thay nhan» (chưa có `data-slot`).

- [ ] **Step 3: Sửa `StatusIndicator`** — thêm `wrapLabel = false` vào tham số, nhãn:

```tsx
<span
	data-slot="status-indicator-label"
	className={wrapLabel ? "min-w-0 wrap-anywhere" : "truncate"}
>
	{label}
</span>
```

và kiểu `wrapLabel?: boolean`. Khi `wrapLabel`, khối ngoài thêm `items-start` thay `items-center` để chấm đứng ở dòng đầu.

- [ ] **Step 4: Chạy lại, kỳ vọng xanh** — cùng lệnh → 2 pass. Chạy `bun run lint` cho `packages/ui`.

- [ ] **Step 5: Commit** — `feat(bo-cuc-hep-ngan-va-kanban): biến thể nhãn xuống dòng của StatusIndicator`.

### Task 2: Hàng số liệu đầu ngăn — lưới 2×2 dưới `md`

independent: true · phục vụ E2, E4, E5, E6

**Files:**
- Modify: `apps/app/components/detail-sheet.tsx` (`DetailSheetStats`, `DetailSheetStat`)
- Modify: `apps/app/components/crm/record-sheet/deal-sheet.tsx` (ô Phụ trách), `company-sheet.tsx` (ô Phụ trách), `plan-sheet.tsx` (ô Phụ trách)

**Interfaces:**
- Produces: `DetailSheetStats` dưới `md` là `grid grid-cols-2`, từ `md` là `flex divide-x` như hôm nay. `DetailSheetStat` `dt` mang `wrap-anywhere md:truncate`.

- [ ] **Step 1: Sửa `DetailSheetStats`**:

```tsx
<dl
	data-slot="detail-sheet-stats"
	className="grid shrink-0 grid-cols-2 border-b bg-muted/40 md:flex md:divide-x [&>*:nth-child(odd)]:border-r [&>*:nth-child(-n+2)]:border-b md:[&>*]:border-0"
>
```

Nếu lớp chọn con bị `lint:slop` trả lại, dùng `divide-y` theo hàng: bọc không đổi, chọn lối đơn giản nhất qua lint.

- [ ] **Step 2: `dt` của `DetailSheetStat`** — `"min-w-0 wrap-anywhere text-muted-foreground text-xs/5 md:truncate"`.
- [ ] **Step 3: Ô Phụ trách ở ba ngăn** — `<OwnerCell owner={…} xuongDongDienThoai />`.
- [ ] **Step 4: Verify** — `bun run check-types`, `bun run lint`; bài DOM có sẵn của ngăn: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/*sheet*.dom.tsx`.
- [ ] **Step 5: Commit** — `fix(bo-cuc-hep-ngan-va-kanban): hàng số liệu đầu ngăn xếp 2×2 và đủ chữ dưới md`.

### Task 3: Thanh giai đoạn đủ chữ dưới `md`

independent: false (dùng Task 1) · phục vụ E3, E5

**Files:**
- Modify: `apps/app/components/crm/stage-stepper.tsx`
- Modify: `apps/app/components/crm/deal-stage.tsx` (`DealStageIndicator` nhận `wrapLabel`, truyền `translate="no"` thẳng cho `StatusIndicator`)

**Interfaces:**
- Consumes: `StatusIndicator` prop `wrapLabel` (Task 1).
- Produces: `DealStageIndicator({ stage, className, wrapLabel })`.

- [ ] **Step 1: `DealStageIndicator`**:

```tsx
export function DealStageIndicator({
	stage,
	className,
	wrapLabel = false,
}: {
	stage: string;
	className?: string;
	wrapLabel?: boolean;
}) {
	const giaiDoan = useGiaiDoan();
	return (
		<StatusIndicator
			translate="no"
			tone={giaiDoan.tone(stage)}
			label={giaiDoan.label(stage)}
			wrapLabel={wrapLabel}
			className={className}
		/>
	);
}
```

- [ ] **Step 2: Tên bước** — `<span className="block wrap-anywhere md:truncate">`; bước chốt và ô đã thoát truyền `wrapLabel` cho `DealStageIndicator` (thanh dưới `md` cần xuống dòng; từ `md` nhãn ngắn vẫn một dòng vì đủ chỗ).
- [ ] **Step 3: Verify** — `bun run check-types`, `bun run lint`, bài DOM giai đoạn có sẵn: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/giai-doan-menu.dom.tsx ./test/giai-doan-board.dom.tsx`.
- [ ] **Step 4: Commit** — `fix(bo-cuc-hep-ngan-va-kanban): thanh giai đoạn đủ chữ dưới md`.

### Task 4: Thẻ Kanban — nhãn giai đoạn trong viền

independent: false (dùng Task 1, 3) · phục vụ E1, E5, E6

**Files:**
- Modify: `apps/app/app/(app)/[slug]/deals/deals-board.tsx` (`DealBoardCard`)
- Modify: `apps/app/components/crm/stage-change.tsx` (`DealStageMenu` biến thể `inline` truyền `wrapLabel`)

- [ ] **Step 1: Hàng người phụ trách và giai đoạn** — `<span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">`.
- [ ] **Step 2: `DealStageMenu` inline** — nút `min-w-0 max-w-full`, `<DealStageIndicator stage={stage} wrapLabel />`.
- [ ] **Step 3: Verify** — `bun run check-types`, `bun run lint`, `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/giai-doan-board.dom.tsx ./test/keo-tha-thoa-thuan.dom.tsx`.
- [ ] **Step 4: Commit** — `fix(bo-cuc-hep-ngan-va-kanban): nhãn giai đoạn trên thẻ Kanban xuống dòng trong viền`.

### Task 5: Thước đo màn thật `do-bo-cuc.mjs`

independent: false (đo Task 2–4) · phục vụ E1–E7

**Files:**
- Create: `_acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs`

**Interfaces:**
- Consumes: `man-lib.mjs` của `_acceptance/kho-tai-lieu/rang` (`moDo`, `chieuDo`, `chay`, `cho`); API `giaiDoan.create`, `companies.create`, `deals.create`, `users.me`.
- Produces: dòng `buoc <n>: dat`, ghim `bch-man: …` theo evals.yaml; `--chi-do` in `bch-man-do: 6/6 chieu do ra dung ghim`.

- [ ] **Step 1: Khung** chép từ `_acceptance/mau-trang-thai-chung/rang/do-chu-ky.mjs`: `CAY_DO` sáu chiều (mỗi chiều: tệp, `cam` thay đúng một chuỗi bản sửa giữ, `dauVet`, `ghim`, `chiBuoc`), nhánh `--chi-do`, nhánh `--chieu-do=n`, kiểm `PHIEN_DO`/`API_URL`.
- [ ] **Step 2: Gieo** — `nguoiMoi(MA, "owner", <120 ký tự không dấu cách>)` làm người phụ trách; `giaiDoan.create` hai giai đoạn (`OPEN` «Decision maker bought-in <MA>», `WON` «Closed won after procurement <MA>»); `companies.create` tên 120 ký tự; ba `deals.create` DAI, CHOT, NGAN (NGAN dùng người thứ hai tên ngắn); dọn bằng `deals.bulkArchive`/`bulkPurge`, `companies.bulkArchive`, `giaiDoan.archive` trong `finally`.
- [ ] **Step 3: Sáu bước** đúng `steps` của E1–E6 trong evals.yaml (375 bằng `moTrang(c, 375, "/deals?view=board")`, 1440 bằng `moTrang(c, 1440, …)`), mỗi phép một dòng in, mỗi vi phạm in đúng ghim và đẩy vào `hong`.
- [ ] **Step 4: Chiều đỏ tại chỗ** — `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs --chi-do"` → `6/6`; rồi lượt xanh không cờ → mọi bước `dat`.
- [ ] **Step 5: Lint tệp thước** — `bun run lint` (biome đọc `_acceptance/**/*.mjs`?) và `bun run lint:slop`.
- [ ] **Step 6: Commit** — `test(bo-cuc-hep-ngan-va-kanban): thước đo màn khổ hẹp và sáu chiều đỏ`.

### Task 6: Cổng năm lệnh và chuyển S4

independent: false

- [ ] `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` — đều thoát 0.
- [ ] Contract `status: implemented`, ghi sổ nếu đổi hướng so với plan, commit, rồi S4.
