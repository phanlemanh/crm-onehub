# Hồ sơ khai đúng tiếng — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi giá trị tiếng Anh do máy ghi, hiển thị trên tấm hồ sơ công ty và cá nhân của một trang khai `lang="vi"`, nằm trong phần tử tự khai `lang="en"` — qua một component dùng chung duy nhất.

**Architecture:** Một nguyên thuỷ mới `ForeignText` ở `packages/ui` là con đường duy nhất khai tiếng. Bốn chỗ trên tấm hồ sơ hôm nay chưa khai thì bọc qua nó; năm chỗ đang khai bằng `<span lang="en">` viết tay thì chuyển sang nó. Hai chỗ không có phần tử nào để mang `attribute` — `MetaLine.parts` kiểu `string[]` và một template literal trong dòng thời gian — phải đổi kiểu dữ liệu trước khi khai được.

**Tech Stack:** React 19 · Next.js App Router · TypeScript · bun + turbo · `bun test` với `--preload ./test/setup-dom.ts` cho bài kiểm vẽ ra DOM · puppeteer-core cho chân đo trình duyệt.

**Spec:** `docs/superpowers/specs/2026-09-18-ho-so-khai-dung-tieng-design.md`
**Hợp đồng:** `_acceptance/ho-so-khai-dung-tieng/contract.md` (11 tiêu chí) · **Phép đo:** `_acceptance/ho-so-khai-dung-tieng/evals.yaml` (12 ô)

## Global Constraints

- **Không viết chú thích trong code.** Không cho mã mới, không cho mã sửa. Luật `AGENTS.md`, không có ngoại lệ.
- **`/packages/ui` là nguồn duy nhất của giao diện dùng chung.** Biến thể mới cài ở đó, không đè ở chỗ gọi.
- **Không đổi một pixel nào.** `ForeignText` phải sinh đúng cây DOM mà `<span lang="en">` đang sinh. Bố cục, khoảng cách, lớp CSS giữ nguyên tuyệt đối.
- **Không khai `lang` cho ô người nhập được và danh từ riêng.** `contact.title`, `company.name`, `location` — ngoại lệ *words of indeterminate language* và *proper names* của WCAG 2.2 SC 3.1.2.
- **Mỗi phép đo mới phải có cặp hai chiều trên cùng một vật:** vật lành → xanh; phá vật thật trong bản sao → đỏ **kèm thông điệp ghim gọi tên chỗ hỏng**. Task chưa có cặp là task CHƯA XONG.
- **Bản kiểm kê chín chỗ** ở mục "Chín chỗ" của hợp đồng là nguồn sự thật cho số 9. Chép hằng đó vào tệp thước, không nạp từ module bị đo.
- Từ vựng mặt người theo `CONTEXT.md`: **cá nhân** (không dùng "liên hệ"), **trường** (không dùng "thuộc tính" cho ô dữ liệu). Nghĩa HTML giữ tên thật `attribute`.
- Bộ kiểm của kho, chạy từ gốc: `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build`.

---

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `packages/ui/src/components/foreign-text.tsx` | **Tạo.** Nguyên thuỷ duy nhất khai ngôn ngữ của một đoạn nội dung. |
| `packages/ui/test/khai-tieng.spec.tsx` | **Tạo.** Bài kiểm vẽ ra DOM thật, ba chiều của AC-7. |
| `apps/app/components/crm/record-sheet/record-parts.tsx` | **Sửa.** `MetaLine.parts` mang được ngôn ngữ theo từng phần. |
| `apps/app/components/crm/record-sheet/company-sheet.tsx` | **Sửa.** Giới thiệu công ty và ngành. |
| `apps/app/components/crm/record-sheet/contact-sheet.tsx` | **Sửa.** Tóm tắt cá nhân do tác nhân sinh. |
| `apps/app/components/crm/timeline/timeline-entry.tsx` | **Sửa.** Tiêu đề mục đổi giai đoạn. |
| 5 tệp của "Chín chỗ" mục 5–9 | **Sửa.** Chuyển `<span lang="en">` viết tay sang `ForeignText`. |
| `_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs` | **Tạo.** Chân đo cấu trúc mã: đúng chín chỗ, không còn chỗ viết tay. |
| `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs` | **Tạo.** Chân đo trình duyệt, bảy chân, mở tấm hồ sơ thật. |
| `_acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs` | **Tạo.** Chạy lại nguyên trạng thước của vòng trước. |
| `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs` | **Tạo.** Chân khai sinh: phá thật từng vật, khẳng định từng chân đo biết đỏ. |

---

### Task 1: Nguyên thuỷ `ForeignText`

**Files:**
- Create: `packages/ui/src/components/foreign-text.tsx`
- Test: `packages/ui/test/khai-tieng.spec.tsx`

**Interfaces:**
- Consumes: `Locale` từ `packages/ui/src/lib/locale.ts` (`"vi" | "en"`).
- Produces: `ForeignText({ lang, className?, children })` → một `<span lang={lang}>`. Nhập ở `apps/app` bằng `import { ForeignText } from "@crm/ui/components/foreign-text";` (subpath tự động, không phải khai thêm ở `package.json`).

- [ ] **Step 1: Viết bài kiểm trượt — chiều (a)**

Tạo `packages/ui/test/khai-tieng.spec.tsx`:

```tsx
import { expect, test } from "bun:test";
import { act, createElement, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { ForeignText } from "../src/components/foreign-text";

function ve(cay: ReactElement): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const goc = createRoot(o);
	act(() => {
		goc.render(cay);
	});
	return o;
}

test("chieu a — ForeignText sinh attribute lang dung tham so", () => {
	const anh = ve(createElement(ForeignText, { lang: "en" }, "Technology"));
	const viet = ve(createElement(ForeignText, { lang: "vi" }, "Công nghệ"));

	expect(anh.querySelector("[lang]")?.getAttribute("lang")).toBe("en");
	expect(viet.querySelector("[lang]")?.getAttribute("lang")).toBe("vi");
});
```

- [ ] **Step 2: Chạy để chắc nó trượt**

Run: `cd packages/ui && bun test --preload ./test/setup-dom.ts test/khai-tieng.spec.tsx`
Expected: FAIL — `Cannot find module '../src/components/foreign-text'`

- [ ] **Step 3: Viết cài đặt tối thiểu**

Tạo `packages/ui/src/components/foreign-text.tsx`:

```tsx
import type { ReactNode } from "react";
import type { Locale } from "../lib/locale";

export function ForeignText({
	lang,
	className,
	children,
}: {
	lang: Locale;
	className?: string;
	children: ReactNode;
}) {
	return (
		<span lang={lang} className={className}>
			{children}
		</span>
	);
}
```

- [ ] **Step 4: Chạy lại, phải xanh**

Run: `cd packages/ui && bun test --preload ./test/setup-dom.ts test/khai-tieng.spec.tsx`
Expected: PASS

- [ ] **Step 5: Chứng chiều đỏ — cặp khai sinh**

Trong một bản sao (`cp -r packages/ui /tmp/pha-thu-ui`), bỏ `lang={lang}` khỏi `<span>` rồi chạy lại bài kiểm. Phải ĐỎ, và thông điệp phải chứa chuỗi `chieu a`. Trả bản gốc về nguyên trạng.

Run: `cd packages/ui && bun test --preload ./test/setup-dom.ts test/khai-tieng.spec.tsx 2>&1 | grep -q 'chieu a' && echo "chiều đỏ có ghim"`

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/foreign-text.tsx packages/ui/test/khai-tieng.spec.tsx
git commit -m "feat(ui): them ForeignText — nguyen thuy khai ngon ngu cua mot doan"
```

**Phục vụ:** AC-7 chiều (a) · E7. **independent: true**

---

### Task 2: `MetaLine` khai tiếng theo từng phần

**Files:**
- Modify: `apps/app/components/crm/record-sheet/record-parts.tsx:126-157`
- Test: `packages/ui/test/khai-tieng.spec.tsx` (thêm chiều b và c)

**Interfaces:**
- Consumes: `ForeignText` (Task 1).
- Produces: `type MetaPart = { text: string; lang: Locale }` xuất từ `record-parts.tsx`; `MetaLine.parts` nhận `(string | MetaPart | null | undefined)[]`. **Chuỗi trần giữ nguyên nghĩa cũ — không khai gì.** Khử trùng lặp chạy trên `text`.

- [ ] **Step 1: Viết hai chiều kiểm trượt**

Thêm vào `packages/ui/test/khai-tieng.spec.tsx`:

```tsx
import { MetaLine } from "../../../apps/app/components/crm/record-sheet/record-parts";

test("chieu b — chuoi tran khong khai, phan tu mang lang thi khai", () => {
	const o = ve(
		createElement(MetaLine, {
			parts: ["Hà Nội, VN", { text: "Technology", lang: "en" as const }],
		}),
	);
	const cac = [...o.querySelectorAll("span")];
	const diaDanh = cac.find((s) => s.textContent?.includes("Hà Nội"));
	const nganh = cac.find((s) => s.textContent?.includes("Technology"));

	expect(diaDanh?.closest("[lang]")).toBeNull();
	expect(nganh?.closest("[lang]")?.getAttribute("lang")).toBe("en");
});

test("chieu c — khu trung lap chay tren text, khong tren phan tu tho", () => {
	const o = ve(
		createElement(MetaLine, {
			parts: ["Technology", { text: "Technology", lang: "en" as const }],
		}),
	);
	const dem = [...o.querySelectorAll("span")].filter(
		(s) => s.textContent?.trim().replace(/^·\s*/, "") === "Technology",
	).length;

	expect(dem).toBe(1);
});
```

- [ ] **Step 2: Chạy để chắc chiều b và c trượt**

Run: `cd packages/ui && bun test --preload ./test/setup-dom.ts test/khai-tieng.spec.tsx`
Expected: FAIL — `parts` chưa nhận kiểu phần tử; chiều b báo `nganh?.closest` trả null.

- [ ] **Step 3: Đổi `MetaLine`**

Thay nguyên hàm `MetaLine` ở `record-parts.tsx`:

```tsx
export type MetaPart = { text: string; lang: Locale };

export function MetaLine({
	lead,
	parts,
}: {
	lead?: ReactNode;
	parts: (string | MetaPart | null | undefined)[];
}) {
	const seen = new Set<string>();
	const rest: { text: string; lang?: Locale }[] = [];

	for (const part of parts) {
		const doan = typeof part === "string" ? { text: part } : part;
		const value = doan?.text?.trim();
		if (!value) continue;

		const key = value.toLowerCase();
		if (seen.has(key)) continue;

		seen.add(key);
		rest.push({ text: value, lang: typeof part === "string" ? undefined : part.lang });
	}

	return (
		<>
			{lead}
			{rest.map((part, index) => (
				<span key={part.text}>
					{index === 0 && !lead ? null : " · "}
					{part.lang ? (
						<ForeignText lang={part.lang}>{part.text}</ForeignText>
					) : (
						part.text
					)}
				</span>
			))}
		</>
	);
}
```

Thêm hai dòng nhập ở đầu tệp: `import { ForeignText } from "@crm/ui/components/foreign-text";` và `import type { Locale } from "@crm/ui/lib/locale";`.

`MetaPart` khai `lang: Locale` **bắt buộc** — đó là hình dạng chỗ gọi truyền vào. Nhưng `rest` bên trong là `{ text: string; lang?: Locale }[]`, vì phần tử đến từ chuỗi trần thì KHÔNG có `lang`, và khai nó là `MetaPart[]` là nói dối trình kiểm kiểu. Đừng ép bằng `as MetaPart`: ép ở đây làm chính chiều (b) của AC-7 mất lưới đỡ lúc biên dịch.

- [ ] **Step 4: Chạy lại, ba chiều phải xanh**

Run: `cd packages/ui && bun test --preload ./test/setup-dom.ts test/khai-tieng.spec.tsx`
Expected: PASS (3 test)

- [ ] **Step 5: Chứng hai chiều đỏ**

Bản sao 1: khai `lang="en"` cho MỌI phần tử → chiều b ĐỎ, thông điệp chứa `chieu b`.
Bản sao 2: đổi `seen.add(key)` thành khử trùng lặp trên phần tử thô (`seen.add(String(part))`) → chiều c ĐỎ, thông điệp chứa `chieu c` và số phần tử đếm được.

- [ ] **Step 6: Commit**

```bash
git add apps/app/components/crm/record-sheet/record-parts.tsx packages/ui/test/khai-tieng.spec.tsx
git commit -m "feat(ho-so): MetaLine khai tieng theo tung phan, khu trung lap tren text"
```

**Phục vụ:** AC-7 chiều (b)(c) · E7. **independent: false** (cần Task 1)

---

### Task 3: Ba chỗ mới trên tấm hồ sơ

**Files:**
- Modify: `apps/app/components/crm/record-sheet/company-sheet.tsx:248` và `:349`
- Modify: `apps/app/components/crm/record-sheet/contact-sheet.tsx:487`

**Interfaces:**
- Consumes: `ForeignText` (Task 1), `MetaPart` (Task 2).
- Produces: không có giao diện mới — chỉ chỗ gọi.

- [ ] **Step 1: Giới thiệu công ty**

`company-sheet.tsx:349`, thay:

```tsx
<DetailSheetProse>{company.description}</DetailSheetProse>
```

bằng:

```tsx
<DetailSheetProse>
	<ForeignText lang="en">{company.description}</ForeignText>
</DetailSheetProse>
```

- [ ] **Step 2: Ngành trên dòng meta**

`company-sheet.tsx:248`, thay `parts={[location, company.industry]}` bằng:

```tsx
parts={[
	location,
	company.industry ? { text: company.industry, lang: "en" as const } : null,
]}
```

`location` giữ nguyên là chuỗi trần — danh từ riêng, ngoại lệ *proper names*.

- [ ] **Step 3: Tóm tắt cá nhân**

`contact-sheet.tsx:487`, thay:

```tsx
<DetailSheetProse>{brief.narrative}</DetailSheetProse>
```

bằng:

```tsx
<DetailSheetProse>
	<ForeignText lang="en">{brief.narrative}</ForeignText>
</DetailSheetProse>
```

**KHÔNG đụng `contact-sheet.tsx:158`** — `parts={[contact.title, contact.company?.name]}`, cả hai đều là ngoại lệ và phải giữ nguyên chuỗi trần. Sửa dòng đó là làm hỏng AC-5.

- [ ] **Step 4: Thêm dòng nhập vào cả hai tệp**

```tsx
import { ForeignText } from "@crm/ui/components/foreign-text";
```

- [ ] **Step 5: Verify**

Run: `bun run check-types && bun run lint`
Expected: cả hai exit 0.

- [ ] **Step 6: Commit**

```bash
git add apps/app/components/crm/record-sheet/company-sheet.tsx apps/app/components/crm/record-sheet/contact-sheet.tsx
git commit -m "fix(ho-so): gioi thieu cong ty, nganh va tom tat ca nhan tu khai lang=en"
```

**Phục vụ:** AC-1, AC-2, AC-3 · E1, E2, E3. **independent: false** (cần Task 1, 2)

---

### Task 4: Tiêu đề đổi giai đoạn ở dòng thời gian

**Files:**
- Modify: `apps/app/components/crm/timeline/timeline-entry.tsx:81-83`

**Interfaces:**
- Consumes: `ForeignText` (Task 1).
- Produces: `headline` đổi từ `string | null` sang `ReactNode`. Ba chỗ dùng nó ở dòng 116, 133, 140 chỉ kiểm tính thật-giả nên không phải sửa; một phần tử JSX vẫn truthy.

- [ ] **Step 1: Đổi `headline`**

Thay:

```tsx
const headline = change
	? `${dealStageLabel(change.from)} → ${dealStageLabel(change.to)}`
	: entry.subject;
```

bằng:

```tsx
const headline = change ? (
	<>
		<ForeignText lang="en">{dealStageLabel(change.from)}</ForeignText>
		{" → "}
		<ForeignText lang="en">{dealStageLabel(change.to)}</ForeignText>
	</>
) : (
	entry.subject
);
```

Hai nhãn là HAI phần tử riêng — chân đo E4 khẳng định từng cái, nên bọc chung một `ForeignText` quanh cả chuỗi là sai hình dạng.

- [ ] **Step 2: Thêm dòng nhập**

```tsx
import { ForeignText } from "@crm/ui/components/foreign-text";
```

- [ ] **Step 3: Verify**

Run: `bun run check-types`
Expected: exit 0. Nếu đỏ ở dòng 116/133/140 thì `headline` đang bị gán vào một chỗ đòi `string` — đọc lỗi rồi nới kiểu ở đúng chỗ đó, KHÔNG ép kiểu bằng `as string`.

- [ ] **Step 4: Commit**

```bash
git add apps/app/components/crm/timeline/timeline-entry.tsx
git commit -m "fix(dong-thoi-gian): hai nhan giai doan tu khai lang=en, moi nhan mot phan tu"
```

**Phục vụ:** AC-4 · E4. **independent: true** so với Task 3 và Task 5 (khác tệp).

---

### Task 5: Chuyển năm chỗ viết tay sang `ForeignText`

**Files:**
- Modify: `apps/app/app/(app)/[slug]/companies/companies-table.tsx:90`
- Modify: `apps/app/app/(app)/[slug]/sales-dashboard.tsx:202`
- Modify: `apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx:198`
- Modify: `apps/app/components/crm/stage-stepper.tsx:65`
- Modify: `apps/app/components/crm/deal-stage.tsx:14`

**Interfaces:** Consumes `ForeignText` (Task 1). Không sinh giao diện mới.

- [ ] **Step 1: Năm phép thay, mỗi chỗ một dòng**

Mỗi chỗ giữ NGUYÊN `className` và NGUYÊN nội dung con — chỉ đổi tên thẻ:

| Tệp | Trước | Sau |
|---|---|---|
| `companies-table.tsx:90` | `<span className="truncate" lang="en">` | `<ForeignText className="truncate" lang="en">` |
| `sales-dashboard.tsx:202` | `<span className="min-w-0 flex-1 truncate" lang="en">` | `<ForeignText className="min-w-0 flex-1 truncate" lang="en">` |
| `create-deal-sheet.tsx:198` | `<span lang="en">` | `<ForeignText lang="en">` |
| `stage-stepper.tsx:65` | `<span lang="en">` | `<ForeignText lang="en">` |
| `deal-stage.tsx:14` | `<span lang="en">` | `<ForeignText lang="en">` |

Đổi cả thẻ đóng `</span>` → `</ForeignText>`. Thêm dòng nhập vào cả năm tệp.

- [ ] **Step 2: Khẳng định DOM không đổi**

Run: `bun run check-types && bun run lint`
Expected: exit 0 cả hai. `ForeignText` sinh đúng `<span lang className>` nên cây DOM giống hệt trước.

- [ ] **Step 3: Commit**

```bash
git add apps/app/app/(app)/[slug]/companies/companies-table.tsx apps/app/app/(app)/[slug]/sales-dashboard.tsx apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx apps/app/components/crm/stage-stepper.tsx apps/app/components/crm/deal-stage.tsx
git commit -m "refactor(khai-tieng): nam cho viet tay chuyen sang ForeignText — mot duong duy nhat"
```

**Phục vụ:** AC-6, AC-11 · E6, E12. **independent: true** so với Task 3 và Task 4.

---

### Task 6: Chân đo cấu trúc mã — `mot-duong.mjs`

**Files:**
- Create: `_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs`

**Interfaces:** Đọc mục "Chín chỗ" của `contract.md` KHÔNG phải để lấy số — số 9 là hằng chép vào tệp thước; đọc để lấy DANH SÁCH ĐƯỜNG DẪN đem đối chiếu.

- [ ] **Step 1: Viết chân đo**

```js
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CHIN = 9;

const KIEM_KE = [
	"apps/app/components/crm/record-sheet/company-sheet.tsx",
	"apps/app/components/crm/record-sheet/contact-sheet.tsx",
	"apps/app/components/crm/record-sheet/record-parts.tsx",
	"apps/app/components/crm/timeline/timeline-entry.tsx",
	"apps/app/app/(app)/[slug]/companies/companies-table.tsx",
	"apps/app/app/(app)/[slug]/sales-dashboard.tsx",
	"apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx",
	"apps/app/components/crm/stage-stepper.tsx",
	"apps/app/components/crm/deal-stage.tsx",
];
```

`GOC` suy từ vị trí chính tệp này, không hardcode gốc kho.

- [ ] **Step 2: Ba khẳng định**

```js
const VIET_TAY = /<\s*(?!ForeignText)[A-Za-z][\w.]*\s[^>]*\blang\s*=/;

function quet() {
	const tep = execFileSync("git", ["-C", GOC, "ls-files", "apps/app"], {
		encoding: "utf8",
	})
		.trim()
		.split("\n")
		.filter((t) => t.endsWith(".tsx"));

	const coForeignText = [];
	const conVietTay = [];

	for (const t of tep) {
		const noi_dung = readFileSync(join(GOC, t), "utf8");
		if (/<ForeignText[\s>]/.test(noi_dung)) coForeignText.push(t);
		for (const [i, dong] of noi_dung.split("\n").entries()) {
			if (VIET_TAY.test(dong)) conVietTay.push(`${t}:${i + 1}`);
		}
	}
	return { coForeignText, conVietTay };
}
```

`VIET_TAY` xét MỌI tên thẻ và MỌI dạng giá trị (`lang="en"` lẫn `lang={...}`), loại trừ chính `ForeignText`. Không được thu về `<span lang="en">` nguyên văn — một chỗ sót ở hình dạng khác là đúng thứ chân này tồn tại để bắt.

- [ ] **Step 3: In ra và thoát**

```js
const { coForeignText, conVietTay } = quet();
const thieu = KIEM_KE.filter((t) => !coForeignText.includes(t));
const thua = coForeignText.filter((t) => !KIEM_KE.includes(t));

console.log(`-- MA TRAN TOAN PHAN: hang so ${CHIN}, chep tu muc "Chin cho" cua hop dong`);
console.log(`-- TIM THAY: ${coForeignText.length} cho di qua ForeignText`);
for (const t of coForeignText) console.log(`     ${t}`);
for (const t of thieu) console.log(`   THIEU: ${t}`);
for (const t of thua) console.log(`   THUA (ngoai ban kiem ke): ${t}`);
for (const c of conVietTay) console.log(`   CON VIET TAY: ${c}`);

const hong =
	(coForeignText.length === CHIN ? 0 : 1) +
	thieu.length + thua.length + conVietTay.length;
console.log(`ket qua: so cho=${coForeignText.length} (can ${CHIN}) · thieu=${thieu.length} · thua=${thua.length} · con viet tay=${conVietTay.length}`);
process.exit(hong > 0 ? 1 : 0);
```

- [ ] **Step 4: Chạy trên cây lành**

Run: `bun _acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs`
Expected: exit 0, in ra đủ chín đường dẫn.

- [ ] **Step 5: Chứng hai chiều đỏ**

Bản sao 1: đổi `create-deal-sheet.tsx:198` về `<p lang="en">` viết tay → ĐỎ, in `CON VIET TAY: .../create-deal-sheet.tsx:198` và `THIEU:` đúng tệp đó.
Bản sao 2: thêm một `<ForeignText lang="en">` vào một tệp `apps/app` NGOÀI bản kiểm kê → ĐỎ, in `THUA (ngoai ban kiem ke): <tệp>`.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs
git commit -m "test(khai-tieng): chan do cau truc — dung chin cho, khong con cho viet tay"
```

**Phục vụ:** AC-6 · E6. **independent: false** (cần Task 3, 4, 5)

---

### Task 7: Chân đo trình duyệt — `khai-tieng-ho-so.mjs`

**Files:**
- Create: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`

**Interfaces:**
- Consumes: `canhCay()` từ `_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs`.
- Bảy chân theo `process.argv[2]`: `gioi-thieu` · `tom-tat-lien-he` · `nganh` · `dong-thoi-gian` · `khong-khai-thua` · `ho-so-trong` · `tieng-trang`. (Tên chân `tom-tat-lien-he` là khoá máy trong `config.yaml`, giữ nguyên — luật từ vựng không áp cho mặt máy.)
- Produces: `_acceptance/ho-so-khai-dung-tieng/evidence/vung-khai.json` — vật DUY NHẤT của E11.

- [ ] **Step 1: Chép phần khung từ chân đo vòng trước**

Chép nguyên `phien()`, `goi()`, `song()` và cách dựng puppeteer từ `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs`. Phần đó đã chạy được trên kho này; viết lại từ đầu chỉ thêm rủi ro.

- [ ] **Step 2: Cảnh cây TRƯỚC màn đầu tiên — không có đường vòng**

```js
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const cay = await canhCay();
if (!cay?.ok) {
	console.log(
		`RANG CUN: dau moc khong ve qua APP_URL — dang do MOT CAY KHAC.\n` +
			`   cay dang xet: ${cay?.cay ?? "(khong xac dinh)"}\n` +
			`   Dat APP_URL va API_URL tro dung cay nay roi chay lai.`,
	);
	process.exit(2);
}
console.log(`-- CANH CAY: dau moc ve tu ${cay.cay}`);
```

Đọc chữ ký thật của `canhCay()` ở tệp nguồn trước khi viết dòng này; nếu nó trả hình dạng khác thì theo hình dạng đó, nhưng **hành vi phải y hệt: không nhận lại dấu mốc thì thoát mã 2 và GỌI TÊN CÂY, không đọc con số nào**.

- [ ] **Step 3: Hàm đọc vùng khai**

```js
const DOC_VUNG = (canTim) => {
	const ra = [];
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	for (let n = walker.nextNode(); n; n = walker.nextNode()) {
		const t = n.nodeValue.replace(/\s+/g, " ").trim();
		if (t === "") continue;
		const el = n.parentElement;
		if (!el || el.closest("script,style,noscript,template")) continue;
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) continue;
		for (const gt of canTim) {
			if (!t.includes(gt.slice(0, 40))) continue;
			const vung = el.closest('[lang="en"]');
			ra.push({
				gia_tri: gt.slice(0, 60),
				boc: vung !== null,
				the: el.tagName,
				duong_the: vung
					? [...vung.querySelectorAll('[lang]')].map((x) => x.tagName)
					: [],
				so_phan_tu_khai: vung
					? vung.matches('[lang]')
						? 1 + vung.querySelectorAll('[lang]').length
						: vung.querySelectorAll('[lang]').length
					: 0,
			});
		}
	}
	return ra;
};
```

`so_phan_tu_khai` là con số E11 dùng để phân biệt "một vùng liền" với "bọc từng từ" — thiếu nó thì hội đồng không có gì để chấm.

- [ ] **Step 4: Kết xuất bằng chứng, cộng dồn qua các chân**

```js
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

function ghiVung(chan, muc) {
	const thu_muc = join(GOC, "_acceptance/ho-so-khai-dung-tieng/evidence");
	if (!existsSync(thu_muc)) mkdirSync(thu_muc, { recursive: true });
	const tep = join(thu_muc, "vung-khai.json");
	const cu = existsSync(tep) ? JSON.parse(readFileSync(tep, "utf8")) : {};
	cu[chan] = muc;
	writeFileSync(tep, JSON.stringify(cu, null, 2));
}
```

Mỗi chân ghi mục của mình; chân `khong-khai-thua` đánh dấu mục của nó `chieu: "nguoc"`.

- [ ] **Step 5: Bảy chân, mỗi chân một khẳng định**

- `gioi-thieu` · `tom-tat-lien-he`: đọc giá trị từ máy chủ, mở hồ sơ, khẳng định `boc === true`. Tập rỗng → mã 2.
- `nganh`: lặp qua từng giá trị ngành, GỌI TÊN từng cái và số chỗ chưa bọc của nó.
- `dong-thoi-gian`: nhãn lấy bằng `dealStageLabel()` CỦA SẢN PHẨM (chạy `bun -e` trong `apps/app` như chân đo vòng trước làm), khẳng định TỪNG nhãn riêng.
- `khong-khai-thua`: khẳng định `boc === false` cho tên công ty, địa danh, chức danh. Trả về 0 chỗ khai thừa.
- `ho-so-trong`: đếm phần tử `[lang="en"]` có nội dung chữ rỗng, phải bằng 0; và khẳng định khối Giới thiệu VẮNG khỏi cây DOM.
- `tieng-trang`: `document.documentElement.lang === "vi"`; và một chuỗi giao diện tiếng Việt thật KHÔNG có tổ tiên `[lang="en"]`.

- [ ] **Step 6: Chạy từng chân**

Run: `for c in gioi-thieu tom-tat-lien-he nganh dong-thoi-gian khong-khai-thua ho-so-trong tieng-trang; do bun _acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs $c || echo "DO: $c"; done`
Expected: bảy chân exit 0; `evidence/vung-khai.json` có bảy mục.

- [ ] **Step 7: Commit**

```bash
git add _acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs
git commit -m "test(khai-tieng): chan do trinh duyet mo TAM HO SO that, bay chan, canh cay truoc"
```

**Phục vụ:** AC-1..AC-5, AC-8, AC-9 · E1–E5, E8, E9, và sinh vật cho E11. **independent: false** (cần Task 3, 4)

---

### Task 8: Hồi quy năm chỗ cũ — `hoi-quy-nam-cho.mjs`

**Files:**
- Create: `_acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs`

- [ ] **Step 1: Chạy lại nguyên trạng thước cũ**

```js
import { execFileSync } from "node:child_process";

const CU = "_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs";
const CHAN = ["khai-tieng", "giai-doan"];

const cay = await canhCay();
if (!cay?.ok) { /* mã 2, gọi tên cây — y hệt Task 7 Step 2 */ }

let hong = 0;
for (const c of CHAN) {
	try {
		const ra = execFileSync("bun", [CU, c], { cwd: GOC, encoding: "utf8" });
		console.log(`-- CHAN ${c}: exit 0\n${ra}`);
	} catch (loi) {
		const ma = loi.status ?? 1;
		console.log(`   CHAN ${c} DO (ma ${ma}) tren MAN DANH SACH:\n${loi.stdout ?? ""}`);
		if (ma === 2) {
			console.log("   ma 2 = tien de thieu (du lieu thu rong), KHONG phai dat");
		}
		hong += 1;
	}
}
process.exit(hong > 0 ? 1 : 0);
```

**KHÔNG sửa một dòng nào của `khai-tieng.mjs`.** Chạy lại một cái thước không phải mở lại một lời hứa.

- [ ] **Step 2: Chạy**

Run: `bun _acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs`
Expected: exit 0, in ra tên từng giá trị chân đo cũ tìm thấy.

- [ ] **Step 3: Chứng chiều đỏ**

Bản sao: bỏ `lang={lang}` khỏi `ForeignText` → chân này ĐỎ, thông điệp chứa `MAN DANH SACH` và tên giá trị chưa bọc.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs
git commit -m "test(khai-tieng): hoi quy nam cho cu bang chinh thuoc cua vong truoc"
```

**Phục vụ:** AC-11 · E12. **independent: false** (cần Task 5)

---

### Task 9: Chân khai sinh — `pha-thu.mjs`

**Files:**
- Create: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`

- [ ] **Step 1: Bảng đột biến**

```js
const DOT_BIEN = [
	{ chan: "E1", tep: "apps/app/components/crm/record-sheet/company-sheet.tsx", pha: "go ForeignText quanh company.description", ghim: "gioi-thieu" },
	{ chan: "E2", tep: "apps/app/components/crm/record-sheet/contact-sheet.tsx", pha: "go ForeignText quanh brief.narrative", ghim: "tom-tat-lien-he" },
	{ chan: "E3", tep: "apps/app/components/crm/record-sheet/company-sheet.tsx", pha: "doi part nganh ve chuoi tran", ghim: "nganh" },
	{ chan: "E4", tep: "apps/app/components/crm/timeline/timeline-entry.tsx", pha: "tra headline ve template literal", ghim: "giai doan" },
	{ chan: "E5", tep: "apps/app/components/crm/record-sheet/company-sheet.tsx", pha: "boc ForeignText quanh part dia danh", ghim: "dia danh" },
	{ chan: "E6a", tep: "apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx", pha: "doi ve <p lang=\"en\"> viet tay", ghim: "CON VIET TAY" },
	{ chan: "E6b", tep: "apps/app/components/crm/record-sheet/record-actions.tsx", pha: "them ForeignText o tep ngoai ban kiem ke", ghim: "THUA" },
	{ chan: "E7a", tep: "packages/ui/src/components/foreign-text.tsx", pha: "bo attribute lang", ghim: "chieu a" },
	{ chan: "E7b", tep: "apps/app/components/crm/record-sheet/record-parts.tsx", pha: "khai lang cho moi part", ghim: "chieu b" },
	{ chan: "E7c", tep: "apps/app/components/crm/record-sheet/record-parts.tsx", pha: "khu trung lap tren phan tu tho", ghim: "chieu c" },
	{ chan: "E8", tep: "apps/app/components/crm/record-sheet/company-sheet.tsx", pha: "ve ForeignText khong dieu kien", ghim: "phan tu rong" },
	{ chan: "E9", tep: "apps/app/components/crm/record-sheet/company-sheet.tsx", pha: "boc quanh ca DetailSheetSection", ghim: "tieng Viet" },
	{ chan: "E12", tep: "packages/ui/src/components/foreign-text.tsx", pha: "bo attribute lang", ghim: "MAN DANH SACH" },
];
```

- [ ] **Step 2: Cho từng đột biến — bản sao, phá, chạy, khẳng định đỏ CÓ GHIM**

Mỗi lượt: `cp -r` cây làm việc sang thư mục tạm, áp đúng phép phá vào bản sao, chạy chân đo tương ứng TRÊN BẢN SAO, khẳng định exit ≠ 0 **và** đầu ra chứa chuỗi `ghim`. In bảng `chan | da pha gi | ma thoat | thong diep co ghim khong`.

- [ ] **Step 3: Đột biến môi trường — cảnh cây**

Chạy cả bảy chân `ui-check` với `APP_URL` trỏ sang một cổng không có máy chủ nào. **Mọi chân phải ĐỎ mã 2 và gọi tên cây; không chân nào được in ra một con số.** Chân nào in số nghĩa là nó đọc trước khi cảnh cây — đó là đúng lỗi đã xảy ra ở kho này.

- [ ] **Step 4: Chiều đỏ của chính chân này**

Chạy `pha-thu.mjs` trên cây CHƯA phá gì → mọi chân xanh → chân này phải ĐỎ với thông điệp `khong chan nao do khi da pha`.

- [ ] **Step 5: Chạy**

Run: `bun _acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
Expected: exit 0, bảng đủ 13 đột biến cộng một dòng đột biến môi trường, mọi ô "có ghim" đều ĐÚNG.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs
git commit -m "test(khai-tieng): chan khai sinh — moi chan do phai chung minh duoc no biet do"
```

**Phục vụ:** E10 (chống thước chưa từng đỏ). **independent: false** (cần Task 6, 7, 8)

---

## Thứ tự và làn song song

```
Task 1 (ForeignText)
   └─> Task 2 (MetaLine)
          ├─> Task 3 (ba chỗ mới)     ─┐
          ├─> Task 4 (dòng thời gian)  ├─ ba task này độc lập với nhau
          └─> Task 5 (năm chỗ cũ)     ─┘
                 ├─> Task 6 (mot-duong)
                 ├─> Task 7 (khai-tieng-ho-so)
                 └─> Task 8 (hoi-quy-nam-cho)
                        └─> Task 9 (pha-thu)
```

Task 3, 4, 5 chạm ba tập tệp rời nhau nên chạy song song được. **Task 9 phải chạy sau cùng và chạy TUẦN TỰ** — nó dựng bản sao cây và chạy lại các chân đo khác, nên song song với chúng là đo lẫn nhau.

## Cổng cuối trước khi giao

Từ gốc kho, năm lệnh, không cần export gì:

```
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```

`bun run build` là lệnh thứ năm và bốn lệnh đầu KHÔNG dựng ứng dụng — một hồi quy làm `next build` đỏ từng đi qua bốn vòng đã ký mà không cổng nào thấy.
