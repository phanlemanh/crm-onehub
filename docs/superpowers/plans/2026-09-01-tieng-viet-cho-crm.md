# Xương sống ngôn ngữ tiếng Việt — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nhân viên quan hệ đối tác chọn tiếng Việt một lần, màn công ty hiện trọn tiếng Việt, và lựa chọn ở lại khi họ tắt máy rồi quay lại.

**Architecture:** Một cookie giữ lựa chọn. Trang gốc là thành phần máy chủ nên nó đọc cookie lúc dựng, đặt `<html lang>` đúng từ lượt đầu, rồi truyền ngôn ngữ xuống một context phía trình duyệt. Module định dạng dùng chung đang có được mở rộng để nhận ngôn ngữ thay vì khai cứng `en-US`. Không thư viện đa ngôn ngữ, không đổi đường dẫn.

**Tech Stack:** Next.js app router (server components) · React context · `Intl` · bun test · bash cho bộ răng nghiệm thu.

**Spec:** `docs/superpowers/specs/2026-09-01-tieng-viet-cho-crm-design.md`
**Hợp đồng:** `_acceptance/tieng-viet-cho-crm/contract.md` (12 tiêu chí)
**Phép đo:** `_acceptance/tieng-viet-cho-crm/evals.yaml` (12)

## Global Constraints

- Không viết chú thích trong mã.
- `/packages/ui` là nguồn duy nhất của giao diện. Không dựng biến thể tại chỗ gọi.
- Hai ngôn ngữ duy nhất: `vi` và `en`. Mặc định `en`.
- Cookie tên `lang`, thuộc tính bắt buộc: `Max-Age=31536000` · `Path=/` · `SameSite=Lax`.
- Nhãn cột tiếng Việt đã chốt, chép nguyên văn: Tên · Tên miền · Ngành · Phụ trách · Cá nhân · Thoả thuận mở · Ngày tạo · Hoạt động cuối · Bổ sung · Lưu trữ.
- Luật nhãn: nhãn chỉ mang phần ngữ cảnh màn hình CHƯA cấp (`CONTEXT.md`).
- KHÔNG sửa `packages/ui/src/components/**`. Chỉ truyền chuỗi vào ba prop đã mở: `empty`, `facet.empty`, `tabs.allLabel`.
- KHÔNG chạm `packages/ui/src/components/ai-elements/context.tsx` (10 chỗ định dạng, ngoài phạm vi).
- Mỗi phép đo mới ra đời kèm CẶP HAI CHIỀU: vật lành → xanh; phá vật thật trong bản sao → đỏ với thông điệp ghim tên. Thiếu cặp = việc CHƯA XONG.

## Điều dễ hiểu nhầm, đọc trước khi bắt đầu

Sáu chỗ khai cứng `en-US` trong `apps/app` nằm ở `timeline/` và `agent-builder/`.
**Không chỗ nào trên màn công ty.** Màn công ty định dạng hoàn toàn qua
`packages/ui/src/lib/format.ts`. Nên chuyển sáu file kia thoả AC-8 nhưng KHÔNG
chứng minh màn công ty chạy — hai việc khác nhau, Task 4 và Task 5 tách ra vì lý do đó.

## File Structure

| File | Trách nhiệm |
|---|---|
| `apps/app/lib/locale/locale.ts` (tạo) | Kiểu `Locale`, danh sách hợp lệ, hằng tên cookie và thuộc tính cookie |
| `apps/app/lib/locale/resolve.ts` (tạo) | Hàm thuần: cookie → Accept-Language → `en`. Không đụng React, không đụng Next |
| `apps/app/lib/locale/provider.tsx` (tạo) | Context phía trình duyệt + hook `useLocale()` |
| `apps/app/app/layout.tsx` (sửa) | Đọc cookie và header, đặt `<html lang>`, bọc provider |
| `apps/app/components/language-menu.tsx` (tạo) | Menu đổi tiếng, ghi cookie, làm mới trang |
| `apps/app/components/app-header.tsx` (sửa) | Gắn menu ngôn ngữ cạnh nút sáng/tối |
| `packages/ui/src/lib/format.ts` (sửa) | Mọi hàm nhận `locale`; bộ định dạng nhớ theo cặp (locale, tuỳ chọn) |
| `apps/app/lib/messages/companies.ts` (tạo) | Chuỗi màn công ty theo ngôn ngữ |
| `_acceptance/tieng-viet-cho-crm/rang-ngon-ngu.sh` (tạo) | Bốn chân răng, mỗi chân hai chiều |

---

### Task 1: Hàm giải ngôn ngữ

**Files:**
- Create: `apps/app/lib/locale/locale.ts`
- Create: `apps/app/lib/locale/resolve.ts`
- Test: `apps/app/test/locale-resolve.spec.ts`

**Interfaces:**
- Produces: `type Locale = "vi" | "en"` · `LOCALES: readonly Locale[]` · `LANG_COOKIE = "lang"` · `COOKIE_MAX_AGE = 31536000` · `resolveLocale(cookieValue: string | undefined, acceptLanguage: string | undefined): Locale`

**Phục vụ:** E4 (AC-4) trực tiếp; là nền của E1, E2, E11.
**independent:** true

- [ ] **Step 1: Viết bài kiểm đỏ**

```ts
import { describe, expect, it } from "bun:test";
import { resolveLocale } from "../lib/locale/resolve";

describe("resolveLocale", () => {
	it("lấy cookie khi cookie hợp lệ", () => {
		expect(resolveLocale("vi", "en-US,en;q=0.9")).toBe("vi");
	});

	it("lựa chọn đã lưu thắng ngôn ngữ trình duyệt", () => {
		expect(resolveLocale("en", "vi-VN,vi;q=0.9")).toBe("en");
	});

	it("chưa chọn thì lấy theo trình duyệt", () => {
		expect(resolveLocale(undefined, "vi-VN,vi;q=0.9")).toBe("vi");
	});

	it("chưa chọn và trình duyệt tiếng Anh thì ra en", () => {
		expect(resolveLocale(undefined, "en-US,en;q=0.9")).toBe("en");
	});

	it("cookie hỏng thì rơi về en, không ném lỗi", () => {
		expect(resolveLocale("zz-ZZ-nonsense", "vi-VN")).toBe("en");
	});

	it("không cookie, không header thì ra en", () => {
		expect(resolveLocale(undefined, undefined)).toBe("en");
	});
});
```

- [ ] **Step 2: Chạy để thấy nó đỏ**

Run: `cd apps/app && bun test test/locale-resolve.spec.ts`
Expected: FAIL — `Cannot find module '../lib/locale/resolve'`

- [ ] **Step 3: Viết mã tối thiểu**

```ts
// apps/app/lib/locale/locale.ts
export type Locale = "vi" | "en";

export const LOCALES: readonly Locale[] = ["vi", "en"];
export const DEFAULT_LOCALE: Locale = "en";
export const LANG_COOKIE = "lang";
export const COOKIE_MAX_AGE = 31536000;
export const COOKIE_PATH = "/";
export const COOKIE_SAME_SITE = "Lax";

export function isLocale(value: string | undefined): value is Locale {
	return value !== undefined && LOCALES.includes(value as Locale);
}
```

```ts
// apps/app/lib/locale/resolve.ts
import { DEFAULT_LOCALE, isLocale, type Locale, LOCALES } from "./locale";

export function resolveLocale(
	cookieValue: string | undefined,
	acceptLanguage: string | undefined,
): Locale {
	if (isLocale(cookieValue)) return cookieValue;
	if (!acceptLanguage) return DEFAULT_LOCALE;

	const ranked = acceptLanguage
		.split(",")
		.map((part) => {
			const [tag, ...params] = part.trim().split(";");
			const q = params
				.map((p) => p.trim())
				.find((p) => p.startsWith("q="))
				?.slice(2);
			return { base: tag.split("-")[0]?.toLowerCase(), q: q ? Number(q) : 1 };
		})
		.filter((entry) => entry.base !== undefined && !Number.isNaN(entry.q))
		.sort((a, b) => b.q - a.q);

	for (const entry of ranked) {
		const hit = LOCALES.find((locale) => locale === entry.base);
		if (hit) return hit;
	}
	return DEFAULT_LOCALE;
}
```

- [ ] **Step 4: Chạy để thấy nó xanh**

Run: `cd apps/app && bun test test/locale-resolve.spec.ts`
Expected: PASS, 6 ca.

- [ ] **Step 5: Commit**

```bash
git add apps/app/lib/locale apps/app/test/locale-resolve.spec.ts
git commit -m "feat(app): resolve the reader's language from the cookie, then the browser"
```

---

### Task 2: Trang gốc đọc ngôn ngữ và cấp xuống cây

**Files:**
- Create: `apps/app/lib/locale/provider.tsx`
- Modify: `apps/app/app/layout.tsx`
- Test: `apps/app/test/locale-provider.spec.ts`

**Interfaces:**
- Consumes: `resolveLocale`, `LANG_COOKIE` từ Task 1
- Produces: `<LocaleProvider locale={…}>` · `useLocale(): Locale`

**Phục vụ:** E1, E2, E3, E11 (AC-1, AC-2, AC-3, AC-12).
**independent:** false — cần Task 1

- [ ] **Step 1: Viết bài kiểm đỏ cho provider**

```ts
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider, LocaleValue } from "../lib/locale/provider";

describe("LocaleProvider", () => {
	it("cấp đúng ngôn ngữ xuống cây con", () => {
		const html = renderToStaticMarkup(
			<LocaleProvider locale="vi">
				<LocaleValue />
			</LocaleProvider>,
		);
		expect(html).toContain("vi");
	});
});
```

- [ ] **Step 2: Chạy để thấy nó đỏ**

Run: `cd apps/app && bun test test/locale-provider.spec.ts`
Expected: FAIL — module chưa tồn tại.

- [ ] **Step 3: Viết provider**

```tsx
// apps/app/lib/locale/provider.tsx
"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, type Locale } from "./locale";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
	locale,
	children,
}: {
	locale: Locale;
	children: React.ReactNode;
}) {
	return (
		<LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
	);
}

export function useLocale(): Locale {
	return useContext(LocaleContext);
}

export function LocaleValue() {
	return <span data-testid="locale">{useLocale()}</span>;
}
```

- [ ] **Step 4: Sửa trang gốc**

Trong `apps/app/app/layout.tsx`, đổi `RootLayout` thành `async`, đọc cookie và
header, rồi dùng giá trị giải ra cho cả thẻ `lang` lẫn provider:

```tsx
import { cookies, headers } from "next/headers";
import { LANG_COOKIE } from "@/lib/locale/locale";
import { LocaleProvider } from "@/lib/locale/provider";
import { resolveLocale } from "@/lib/locale/resolve";

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
	const locale = resolveLocale(
		cookieStore.get(LANG_COOKIE)?.value,
		headerList.get("accept-language") ?? undefined,
	);

	return (
		<html
			lang={locale}
			suppressHydrationWarning
			className={cn(fontSans.variable, fontMono.variable, "h-full antialiased")}
		>
			<body className="flex min-h-full flex-col font-sans">
				<LocaleProvider locale={locale}>
					{/* giữ nguyên toàn bộ cây provider đang có bên trong */}
				</LocaleProvider>
			</body>
		</html>
	);
}
```

- [ ] **Step 5: Chạy bài kiểm và kiểm kiểu**

Run: `cd apps/app && bun test test/locale-provider.spec.ts && cd ../.. && bun run check-types`
Expected: PASS, và kiểm kiểu xanh.

- [ ] **Step 6: Commit**

```bash
git add apps/app/lib/locale/provider.tsx apps/app/app/layout.tsx apps/app/test/locale-provider.spec.ts
git commit -m "feat(app): declare the page language on the server's first render"
```

---

### Task 3: Menu đổi tiếng

**Files:**
- Create: `apps/app/components/language-menu.tsx`
- Modify: `apps/app/components/app-header.tsx`

**Interfaces:**
- Consumes: `useLocale`, `LANG_COOKIE`, `COOKIE_MAX_AGE`, `COOKIE_PATH`, `COOKIE_SAME_SITE`
- Produces: `<LanguageMenu />`

**Phục vụ:** E5 (AC-5), E10 (AC-10).
**independent:** false — cần Task 2

- [ ] **Step 1: Viết menu**

```tsx
// apps/app/components/language-menu.tsx
"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Button } from "@crm/ui/components/button";
import { useRouter } from "next/navigation";
import {
	COOKIE_MAX_AGE,
	COOKIE_PATH,
	COOKIE_SAME_SITE,
	LANG_COOKIE,
	type Locale,
} from "@/lib/locale/locale";
import { useLocale } from "@/lib/locale/provider";

const LABELS: Record<Locale, string> = { vi: "Tiếng Việt", en: "English" };

export function LanguageMenu() {
	const locale = useLocale();
	const router = useRouter();

	const choose = (next: Locale) => {
		document.cookie = `${LANG_COOKIE}=${next}; Max-Age=${COOKIE_MAX_AGE}; Path=${COOKIE_PATH}; SameSite=${COOKIE_SAME_SITE}`;
		router.refresh();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm">
					{LABELS[locale]}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>
					{locale === "vi" ? "Ngôn ngữ" : "Language"}
				</DropdownMenuLabel>
				<DropdownMenuItem onSelect={() => choose("vi")}>
					{LABELS.vi}
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => choose("en")}>
					{LABELS.en}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
```

- [ ] **Step 2: Gắn vào thanh đầu trang**

Trong `apps/app/components/app-header.tsx`, nhập `LanguageMenu` và đặt nó ngay
trước nút sáng/tối. Không thêm lớp CSS nào mới.

- [ ] **Step 3: Kiểm kiểu và soi mã**

Run: `bun run check-types && bun run lint && bun run lint:slop`
Expected: cả ba xanh.

- [ ] **Step 4: Commit**

```bash
git add apps/app/components/language-menu.tsx apps/app/components/app-header.tsx
git commit -m "feat(app): let the reader switch language from the header"
```

---

### Task 4: Module định dạng nhận ngôn ngữ

**Files:**
- Modify: `packages/ui/src/lib/format.ts`
- Test: `packages/ui/test/format-locale.spec.ts`

**Interfaces:**
- Produces: `formatCount(value, locale)` · `formatMoney(cents, currency, locale)` · `formatMoneyCompact(cents, currency, locale)` · `formatPercent(rate, locale)` · `formatDay(value, locale)`. Tham số `locale` mặc định `"en"` để mọi chỗ gọi cũ vẫn biên dịch được.

**Phục vụ:** E8 (AC-8).
**independent:** true — không phụ thuộc Task 1-3

- [ ] **Step 1: Viết bài kiểm ma trận, đỏ trước**

```ts
import { describe, expect, it } from "bun:test";
import {
	formatCount,
	formatDay,
	formatMoney,
	formatMoneyCompact,
	formatPercent,
} from "../src/lib/format";

describe("định dạng theo ngôn ngữ", () => {
	it("năm hàm, hai ngôn ngữ, cùng một giá trị", () => {
		expect(formatCount(1240, "en")).toBe("1,240");
		expect(formatCount(1240, "vi")).toBe("1.240");
		expect(formatDay("2026-09-01", "en")).toBe("Sep 1, 2026");
		expect(formatDay("2026-09-01", "vi")).toBe("1 thg 9, 2026");
		expect(formatPercent(0.125, "en")).toBe("12.5%");
		expect(formatPercent(0.125, "vi")).toBe("12,5%");
		expect(formatMoney(123456, "usd", "en")).toContain("1,234.56");
		expect(formatMoney(123456, "usd", "vi")).toContain("1.234,56");
		expect(formatMoneyCompact(123456789, "usd", "en")).toContain("1.2M");
		expect(formatMoneyCompact(123456789, "usd", "vi")).toContain("1,2");
	});
});
```

- [ ] **Step 2: Chạy để thấy nó đỏ**

Run: `cd packages/ui && bun test test/format-locale.spec.ts`
Expected: FAIL — các hàm chưa nhận tham số thứ hai/thứ ba.

- [ ] **Step 3: Thay hằng mức module bằng bộ nhớ theo cặp**

Trong `packages/ui/src/lib/format.ts`, bỏ ba hằng `new Intl.…("en-US", …)` ở
mức module, thay bằng một bộ nhớ và một hàm lấy bộ định dạng:

```ts
const numberCache = new Map<string, Intl.NumberFormat>();
const dateCache = new Map<string, Intl.DateTimeFormat>();

function numberFormat(locale: string, options: Intl.NumberFormatOptions) {
	const key = `${locale}|${JSON.stringify(options)}`;
	const hit = numberCache.get(key);
	if (hit) return hit;
	const made = new Intl.NumberFormat(locale, options);
	numberCache.set(key, made);
	return made;
}

function dateFormat(locale: string, options: Intl.DateTimeFormatOptions) {
	const key = `${locale}|${JSON.stringify(options)}`;
	const hit = dateCache.get(key);
	if (hit) return hit;
	const made = new Intl.DateTimeFormat(locale, options);
	dateCache.set(key, made);
	return made;
}
```

Rồi cho từng hàm xuất khẩu nhận `locale: string = "en"` làm tham số cuối và gọi
qua hai hàm trên.

- [ ] **Step 4: Chạy để thấy nó xanh, và bộ kiểm cũ không vỡ**

Run: `cd packages/ui && bun test && cd ../.. && bun run check-types`
Expected: bài kiểm mới xanh, bài kiểm cũ xanh, kiểm kiểu xanh.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/lib/format.ts packages/ui/test/format-locale.spec.ts
git commit -m "feat(ui): format dates and numbers for the reader's language"
```

---

### Task 5: Sáu chỗ khai cứng trong apps/app

**Files:**
- Modify: `apps/app/components/crm/timeline/activity-composer.tsx`
- Modify: `apps/app/components/crm/timeline/timeline.tsx`
- Modify: `apps/app/components/agent-builder/agent-history.tsx` (2 chỗ)
- Modify: `apps/app/components/agent-builder/team-agent-detail.tsx` (2 chỗ)

**Interfaces:**
- Consumes: `useLocale` từ Task 2

**Phục vụ:** E8 (AC-8) — vế "đếm bằng 0".
**independent:** false — cần Task 2

**Lưu ý:** không file nào ở đây nằm trên màn công ty. Việc này thoả tiêu chí đếm, không chứng minh màn công ty chạy.

- [ ] **Step 1: Chuyển từng hằng thành hàm gọi lúc vẽ**

Mỗi chỗ có dạng `const X = new Intl.DateTimeFormat("en-US", {…})` ở mức module.
Chuyển thành: gọi `useLocale()` trong component, rồi dựng bộ định dạng trong
thân component qua `dateFormat` đã xuất từ Task 4, hoặc gọi hàm `formatDay` nếu
tuỳ chọn trùng.

- [ ] **Step 2: Đếm để chắc không sót**

Run: `grep -rn 'Intl\.\(NumberFormat\|DateTimeFormat\)("en-US"' apps/app packages/ui/src/lib | wc -l`
Expected: `0`

- [ ] **Step 3: Chạy bộ kiểm và kiểm kiểu**

Run: `bun run check-types && cd apps/app && bun test`
Expected: xanh.

- [ ] **Step 4: Commit**

```bash
git add apps/app/components
git commit -m "feat(app): read the language at render instead of pinning it at import"
```

---

### Task 6: Màn công ty nói tiếng Việt

**Files:**
- Create: `apps/app/lib/messages/companies.ts`
- Modify: `apps/app/app/(app)/[slug]/companies/companies-table.tsx`

**Interfaces:**
- Consumes: `useLocale` từ Task 2
- Produces: `companyMessages(locale): { headers: Record<string,string>; empty: string; emptyArchived: string; allLabel: string; facetEmpty: string }`

**Phục vụ:** E6 (AC-6), E7 (AC-7), E9 (AC-9).
**independent:** false — cần Task 2

- [ ] **Step 1: Viết kho chuỗi**

```ts
// apps/app/lib/messages/companies.ts
import type { Locale } from "@/lib/locale/locale";

const MESSAGES = {
	en: {
		headers: {
			name: "Company",
			domain: "Domain",
			industry: "Industry",
			owner: "Owner",
			contacts: "Contacts",
			openDeals: "Open deals",
			created: "Created",
			lastActivity: "Last activity",
			enrichment: "Enrichment",
			archived: "Archived",
		},
		empty: "No companies match this view.",
		emptyArchived: "No archived companies.",
		allLabel: "All",
		facetEmpty: "Nothing matches.",
	},
	vi: {
		headers: {
			name: "Tên",
			domain: "Tên miền",
			industry: "Ngành",
			owner: "Phụ trách",
			contacts: "Cá nhân",
			openDeals: "Thoả thuận mở",
			created: "Ngày tạo",
			lastActivity: "Hoạt động cuối",
			enrichment: "Bổ sung",
			archived: "Lưu trữ",
		},
		empty: "Chưa có công ty nào khớp bộ lọc này.",
		emptyArchived: "Chưa có công ty nào đã lưu trữ.",
		allLabel: "Tất cả",
		facetEmpty: "Không có kết quả nào.",
	},
} as const;

export function companyMessages(locale: Locale) {
	return MESSAGES[locale];
}
```

- [ ] **Step 2: Nối vào bảng**

Trong `companies-table.tsx`: gọi `useLocale()` và `companyMessages(locale)`, thay
mười chuỗi `header:` bằng giá trị từ kho, truyền `empty`, `tabs.allLabel`,
`facet.empty` vào bảng dùng chung, và bọc ô tên công ty bằng `translate="no"`:

```tsx
<span translate="no">{row.name}</span>
```

- [ ] **Step 3: Kiểm kiểu, soi mã, chạy bộ kiểm**

Run: `bun run check-types && bun run lint && cd apps/app && bun test`
Expected: xanh cả ba.

- [ ] **Step 4: Commit**

```bash
git add apps/app/lib/messages "apps/app/app/(app)/[slug]/companies"
git commit -m "feat(app): put the company screen into the reader's language"
```

---

### Task 7: Bộ răng nghiệm thu

**Files:**
- Create: `_acceptance/tieng-viet-cho-crm/rang-ngon-ngu.sh`

**Phục vụ:** E4, E5, E7, E8 — bốn phép đo kiểu script.
**independent:** false — cần Task 1, 3, 4, 6

Bốn chân, MỖI chân hai chiều. Chiều đỏ phá vật THẬT trong bản sao rồi đòi thước
đỏ với thông điệp ghim tên — không chỉ mã thoát.

- [ ] **Step 1: Chân `la` (AC-4)**

Chiều dương: `resolveLocale("zz-nonsense", "vi-VN")` trả `en`.
Chiều đỏ: bản sao `resolve.ts` bỏ lời gọi `isLocale` → chân phải đỏ và in tên
giá trị gây lỗi.

- [ ] **Step 2: Chân `cookie` (AC-5)**

Chiều dương: `language-menu.tsx` chứa đủ ba thuộc tính `Max-Age=31536000`,
`Path=/`, `SameSite=Lax`.
Chiều đỏ: bản sao bỏ `Max-Age` → chân đỏ và **gọi tên thuộc tính thiếu**.

- [ ] **Step 3: Chân `du-lieu-khong-dich` (AC-7)**

Chiều dương: chính phần tử vẽ tên công ty mang `translate="no"`.
Chiều đỏ: bản sao gỡ thuộc tính đó khỏi phần tử → chân đỏ.

- [ ] **Step 4: Chân `dinh-dang` (AC-8)**

Chiều dương: chạy ma trận 5 hàm × 2 ngôn ngữ, so với chuỗi ghim sẵn; VÀ đếm chỗ
khai cứng trong `apps/app` + `packages/ui/src/lib` bằng 0.
Chiều đỏ: bản sao `format.ts` trả MỘT hàm về `en-US` → chân đỏ và **gọi đúng tên
hàm** đó.

- [ ] **Step 5: Chạy cả bốn chân, cả hai chiều**

Run: `for c in la cookie du-lieu-khong-dich dinh-dang; do bash _acceptance/tieng-viet-cho-crm/rang-ngon-ngu.sh --chan $c; echo "$c -> $?"; done`
Expected: cả bốn thoát 0, và mỗi chân in ra dòng xác nhận cả hai chiều đã chạy.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/tieng-viet-cho-crm/rang-ngon-ngu.sh
git commit -m "test(acceptance): give each language measure a red direction"
```

---

## Sau khi xong bảy việc

Đặt `_acceptance/tieng-viet-cho-crm/contract.md` sang `status: implemented`, rồi
dựng nghiệm thu máy. Bốn phép đo `ui-check` (E1, E2, E3, E5, E6, E9, E10, E11)
cần máy chủ phát triển và trình duyệt — chúng chạy ở bước nghiệm thu, không chạy
ở đây.
