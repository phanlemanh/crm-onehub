# Cửa vào nói tiếng Việt — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Màn đăng nhập và màn khai báo đọc đúng tiếng của nhân viên OneHub ngay lần đầu họ mở CRM.

**Architecture:** Kho chuỗi mới `apps/app/lib/messages/auth.ts` theo đúng khuôn `satisfies` của năm kho anh em; tám file giao diện đọc từ nó thay vì tự chứa chữ. Cơ chế chọn tiếng đã có sẵn ở layout gốc — chỉ đổi giá trị mặc định. Giàn đo dựng vật thật hai lần, hai thứ tiếng, rồi so chữ người đọc thấy; không dùng máy quét mã để chứng minh sự vắng mặt của tiếng Anh.

**Tech Stack:** Next.js App Router · React server + client components · bun test · puppeteer-core (giàn đo) · TypeScript `satisfies`

**Spec:** `docs/superpowers/specs/2026-09-04-cua-vao-noi-tieng-viet-design.md`
**Contract:** `_acceptance/cua-vao-noi-tieng-viet/contract.md` · **Evals:** `_acceptance/cua-vao-noi-tieng-viet/evals.yaml`

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào mã mới, không thêm vào mã sửa.
- **`/packages/ui` là nguồn duy nhất của giao diện.** Không override style bằng `className` ở chỗ gọi.
- **Client component không được nhập package máy chủ.** `@crm/auth` và `@crm/db` kéo theo Prisma → `pg` → `dns`. Trang máy chủ tính, client chỉ nhận dữ liệu đã xong.
- **Kho chuỗi mới theo đúng khuôn năm kho anh em:** `const en` → `export type XMessages = typeof en` → `const vi = {...} satisfies XMessages` → `const BANG = { en, vi } satisfies Record<Locale, XMessages>` → `export function xMessages(locale: Locale): XMessages`.
- **MEASURE-BIRTH-CLAUSE:** một phép đo mới chỉ tính XONG khi có cặp hai chiều trên CÙNG một fixture — vật lành thì thước im, phá vật thật trong bản sao thì thước đỏ với THÔNG ĐIỆP GHIM (tên chân, tên khoá, tên dòng — không chỉ mã thoát). Task dựng thước có lượt phá thử trong verify của chính nó.
- **Ba nhóm không dịch, mười ba giá trị** — bảng đóng ở AC-6. Mỗi giá trị mang `translate="no"` ở phần tử chứa nó.
- **Lệnh verify của kho:** `bun run db:test && bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop`.
- **Giàn đo dựng máy chủ riêng cho cây làm việc** ở cổng 3300/3301, KHÔNG đo cổng 3000 của kho gốc. `bun run dev` ở gốc không chạy trong phiên không có TTY — chạy từng app.
- **`git status --porcelain` có output vẫn thoát 0.** Dùng `[ -z "$(...)" ]` khi cần kiểm cây sạch.

---

## File Structure

| File | Trách nhiệm |
| --- | --- |
| `apps/app/lib/messages/auth.ts` | **Tạo.** Kho chuỗi hai thứ tiếng cho cả hai luồng cửa vào |
| `apps/app/test/auth-messages.spec.ts` | **Tạo.** Khẳng định riêng của AC-12 mà bài kiểm chung không phủ |
| `apps/app/test/messages-guard.spec.ts` | **Sửa.** Thêm `auth` vào bảng `MODULE`; thêm dòng miễn dấu nếu có |
| `apps/app/test/locale-resolve.spec.ts` | **Tạo.** Năm khẳng định của trục C + mặc định `vi` |
| `packages/ui/src/lib/locale.ts` | **Sửa.** `DEFAULT_LOCALE` `"en"` → `"vi"` |
| `apps/app/components/auth-shell.tsx` | **Sửa.** Đọc kho chuỗi; bỏ dòng chân nhà làm gốc |
| `apps/app/app/(landing)/sign-in/page.tsx` | **Sửa.** Đọc kho chuỗi; `generateMetadata`; ba nhánh cấu hình |
| `apps/app/app/(landing)/sign-in/social-sign-in.tsx` | **Sửa.** Nhãn nút ghép động; tên hãng mang `translate="no"` |
| `apps/app/app/(landing)/sign-in/sso-sign-in.tsx` | **Sửa.** Nhãn nút ghép động; `provider.name` mang `translate="no"` |
| `apps/app/app/(landing)/onboarding/page.tsx` | **Sửa.** Đọc kho chuỗi; `generateMetadata` |
| `apps/app/app/(landing)/onboarding/onboarding-form.tsx` | **Sửa.** Ba nhãn trường, hai mô tả, tiền tố mang `translate="no"` |
| `apps/app/app/(landing)/onboarding/research/page.tsx` | **Sửa.** Đọc kho chuỗi; `generateMetadata` |
| `apps/app/app/(landing)/onboarding/research/research-form.tsx` | **Sửa.** Nhãn, gợi ý, mô tả có liên kết |
| `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs` | **Tạo.** Mười hai chân đo, một điểm vào duy nhất |
| `_acceptance/cua-vao-noi-tieng-viet/rang/o-ghim.json` | **Tạo.** Bảng đóng: sáu ô của E1, chín ô của E2, mười ba giá trị của AC-6 |
| `_acceptance/cua-vao-noi-tieng-viet/rang/lat-cua-vao.json` | **Tạo.** Danh sách 8 file cho chân đọc cây cú pháp dùng lại |
| `_acceptance/cua-vao-noi-tieng-viet/rang/khai-sinh.mjs` | **Tạo.** Sổ khai sinh, danh sách đóng N = 15 |
| `_acceptance/cua-vao-noi-tieng-viet/rang/may-chu.mjs` | **Tạo.** Dựng và dọn máy chủ 3300/3301 cho cây làm việc |

**Quyết định gộp file:** mười hai chân sống trong MỘT file `cua-vao.mjs` chứ không mười hai file, theo đúng lối `ban-ve.mjs` của vòng ③a — chúng dùng chung phần đăng nhập, phần dựng trang và phần đọc chữ, tách ra là chép ba lần.

---

## Task 1: Kho chuỗi cửa vào

**Files:**
- Create: `apps/app/lib/messages/auth.ts`
- Create: `apps/app/test/auth-messages.spec.ts`
- Modify: `apps/app/test/messages-guard.spec.ts` (bảng `MODULE`, khoảng dòng 14–20)

**Interfaces:**
- Produces: `authMessages(locale: Locale): AuthMessages` và `export type AuthMessages`. Task 3–6 nhập đúng tên này từ `@/lib/messages/auth`.
- Cây khoá mà các task sau dựa vào: `shell.{homepage,eyebrow,headline}` · `signIn.{title,description,noWay:{title,description,howTo},continueWith,continueWithProvider}` · `signIn.error.unreachable` · `onboarding.{title,description,name,slug,slugHint,website,websiteHint,submit,submitting}` · `research.{title,description,label,placeholder,noKey,signUp,submit,submitting}` · `docTitle.{signIn,onboarding,research}`

**Vì sao task này đi trước:** bài kiểm khoá-chết hiện có ĐÃ khẳng định ba điều AC-12 đòi — khoá hai bên khớp nhau, mọi giá trị tiếng Việt mang dấu, không giá trị nào y hệt bản tiếng Anh. Thêm một dòng vào `MODULE` là nhận cả ba, không dựng lại.

- [ ] **Step 1: Viết bài kiểm sẽ đỏ**

Tạo `apps/app/test/auth-messages.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { authMessages } from "@/lib/messages/auth";

describe("kho chuoi cua vao", () => {
	it("ba tieu de tai lieu khac nhau giua hai thu tieng", () => {
		const en = authMessages("en").docTitle;
		const vi = authMessages("vi").docTitle;
		for (const khoa of ["signIn", "onboarding", "research"] as const) {
			expect(vi[khoa]).not.toBe(en[khoa]);
		}
	});

	it("nhan nut SSO ghep dong, khong duc san mot cau tron", () => {
		const vi = authMessages("vi");
		expect(vi.signIn.continueWithProvider("Đất Xanh")).toContain("Đất Xanh");
		expect(vi.signIn.continueWithProvider("Đất Xanh")).not.toBe(
			authMessages("en").signIn.continueWithProvider("Đất Xanh"),
		);
	});

	it("doan huong dan cua man chua-co-duong giu nguyen bon ten bien", () => {
		for (const tieng of ["en", "vi"] as const) {
			const s = authMessages(tieng).signIn.noWay.howTo;
			for (const bien of [
				"GOOGLE_CLIENT_ID",
				"GOOGLE_CLIENT_SECRET",
				"MICROSOFT_CLIENT_ID",
				"MICROSOFT_CLIENT_SECRET",
			]) {
				expect(s).toContain(bien);
			}
		}
	});
});
```

- [ ] **Step 2: Chạy để chắc nó đỏ**

Run: `cd apps/app && bun test test/auth-messages.spec.ts`
Expected: FAIL — `Cannot find module '@/lib/messages/auth'`.

- [ ] **Step 3: Viết kho chuỗi**

Tạo `apps/app/lib/messages/auth.ts` theo đúng khuôn của `companies.ts`. Chữ tiếng Anh lấy NGUYÊN VĂN từ tám file hiện tại, trừ dòng chân nhà làm gốc (Task 3 bỏ hẳn nên không đưa vào kho). Bản tiếng Việt viết mới.

Khung bắt buộc:

```ts
import type { Locale } from "@crm/ui/lib/locale";

const en = {
	shell: {
		homepage: "Homepage",
		eyebrow: "CRM",
		headline: "Every customer, one place.",
	},
	docTitle: {
		signIn: "Sign in",
		onboarding: "Set up",
		research: "Research key",
	},
	signIn: {
		title: "Welcome back",
		description: "Sign in with your account to continue.",
		continueWith: (ten: string) => `Continue with ${ten}`,
		continueWithProvider: (ten: string) => `Continue with ${ten}`,
		noWay: {
			title: "No way in yet",
			description:
				"This CRM has no sign-in method configured, so nobody can get in — including you.",
			howTo:
				"Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET — or MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET — in the root .env file and restart. Your own identity provider can be added from Settings once somebody is signed in.",
		},
		error: { unreachable: "Could not reach the sign-in service." },
		signingIn: "Signing in",
	},
	onboarding: { … },
	research: { … },
};

export type AuthMessages = typeof en;
```

Bản tiếng Việt tương ứng, ví dụ cho phần đã chốt:

```ts
const vi = {
	shell: {
		homepage: "Trang chủ",
		eyebrow: "CRM",
		headline: "Mọi khách hàng, một chỗ.",
	},
	docTitle: {
		signIn: "Đăng nhập",
		onboarding: "Khai báo",
		research: "Khoá nghiên cứu",
	},
	signIn: {
		title: "Mừng bạn quay lại",
		description: "Đăng nhập bằng tài khoản của bạn để tiếp tục.",
		continueWith: (ten: string) => `Tiếp tục với ${ten}`,
		continueWithProvider: (ten: string) => `Tiếp tục với ${ten}`,
		noWay: {
			title: "Chưa có cách nào để vào",
			description:
				"CRM này chưa cấu hình cách đăng nhập nào, nên chưa ai vào được — kể cả bạn.",
			howTo:
				"Đặt GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET — hoặc MICROSOFT_CLIENT_ID và MICROSOFT_CLIENT_SECRET — trong file .env ở gốc kho rồi khởi động lại. Nhà cung cấp định danh của riêng bạn thêm được từ Cài đặt, sau khi đã có người đăng nhập.",
		},
		error: { unreachable: "Không kết nối được tới dịch vụ đăng nhập. Kiểm tra mạng rồi thử lại." },
		signingIn: "Đang đăng nhập",
	},
	…
} satisfies AuthMessages;

const BANG = { en, vi } satisfies Record<Locale, AuthMessages>;

export function authMessages(locale: Locale): AuthMessages {
	return BANG[locale];
}
```

Ba điều bắt buộc khi viết bản tiếng Việt:
1. `shell.eyebrow` giữ `"CRM"` ở cả hai thứ tiếng — nó là tên sản phẩm. Thêm `"shell.eyebrow"` vào `KHONG_DAU` ở `messages-guard.spec.ts`.
2. `signIn.error.unreachable` bản tiếng Việt phải nói NGƯỜI DÙNG LÀM GÌ TIẾP, không chỉ nói cái gì hỏng — Vercel WIG đòi vậy, và hội đồng E14 hỏi đúng câu đó.
3. `headline` bản tiếng Việt phải ngắn: ô chứa nó rộng `14ch`. Task 11 đo bề rộng thật; nếu tràn thì sửa chữ ở đây trước, nới ô sau.

- [ ] **Step 4: Nối vào bài kiểm khoá-chết**

Trong `apps/app/test/messages-guard.spec.ts`, thêm dòng nhập và một dòng vào `MODULE`:

```ts
import { authMessages } from "@/lib/messages/auth";
```

```ts
const MODULE = [
	["companies", companyMessages],
	["contacts", contactMessages],
	["deals", dealMessages],
	["record-sheet", recordSheetMessages],
	["crm", crmMessages],
	["auth", authMessages],
] as const;
```

- [ ] **Step 5: Chạy để chắc nó xanh**

Run: `cd apps/app && bun test test/auth-messages.spec.ts test/messages-guard.spec.ts`
Expected: PASS. Bài kiểm khoá-chết sẽ báo khoá chưa có chỗ gọi — đó là ĐÚNG ở bước này; thêm tên các khoá đó vào `CHUA_NOI_KHAI` **kèm ghi chú task nào sẽ nối**, rồi Task 3–6 xoá dần khỏi danh sách đó.

- [ ] **Step 6: Chứng minh chiều đỏ**

Trên bản sao, đổi một giá trị tiếng Việt bất kỳ thành đúng chuỗi tiếng Anh của nó rồi chạy lại.
Expected: bài kiểm khoá-chết ĐỎ ở khẳng định "khong gia tri nao con y het ban tieng Anh", nêu đích danh khoá đó. Trả lại nguyên trạng.

- [ ] **Step 7: Commit**

```bash
git add apps/app/lib/messages/auth.ts apps/app/test/auth-messages.spec.ts apps/app/test/messages-guard.spec.ts
git commit -m "feat(app): give the front door a catalogue of its own words"
```

**Verify task:** `cd apps/app && bun test test/auth-messages.spec.ts test/messages-guard.spec.ts` · `bun run check-types`
**Phục vụ:** E12 (khuôn kho chuỗi và dấu tiếng Việt)
**independent:** false — Task 3, 4, 5, 6 đều phụ thuộc.

---

## Task 2: Mặc định là tiếng Việt

**Files:**
- Modify: `packages/ui/src/lib/locale.ts:5`
- Create: `apps/app/test/locale-resolve.spec.ts`

**Interfaces:**
- Consumes: `resolveLocale(cookieValue, acceptLanguage)` từ `apps/app/lib/locale/resolve.ts` (đã có, không sửa).
- Produces: không có gì cho task sau; đây là task rời.

- [ ] **Step 1: Viết bài kiểm sẽ đỏ**

Tạo `apps/app/test/locale-resolve.spec.ts` — năm khẳng định, một cho mỗi ô của trục C, cộng một khẳng định về chính giá trị mặc định:

```ts
import { describe, expect, it } from "bun:test";
import { DEFAULT_LOCALE } from "@crm/ui/lib/locale";
import { resolveLocale } from "@/lib/locale/resolve";

const O = [
	["cookie vi thang Accept-Language en", "vi", "en-US,en;q=0.9", "vi"],
	["cookie en thang Accept-Language vi", "en", "vi-VN,vi;q=0.9", "en"],
	["khong cookie, Accept-Language vi", undefined, "vi-VN,vi;q=0.9", "vi"],
	["khong cookie, Accept-Language en", undefined, "en-US,en;q=0.9", "en"],
	["khong cookie, khong Accept-Language", undefined, undefined, "vi"],
] as const;

describe("luat chon tieng", () => {
	it("mac dinh la tieng Viet", () => {
		expect(DEFAULT_LOCALE).toBe("vi");
	});

	it.each(O)("%s", (_ten, cookie, header, mong) => {
		expect(resolveLocale(cookie, header)).toBe(mong);
	});

	it("do du nam o cua truc C", () => {
		expect(O.length).toBe(5);
	});
});
```

- [ ] **Step 2: Chạy để chắc nó đỏ**

Run: `cd apps/app && bun test test/locale-resolve.spec.ts`
Expected: FAIL ở `mac dinh la tieng Viet` (`expected "vi", received "en"`) VÀ ở ô thứ năm.

- [ ] **Step 3: Đổi giá trị mặc định**

Trong `packages/ui/src/lib/locale.ts`, dòng 5:

```ts
export const DEFAULT_LOCALE = "vi" satisfies Locale;
```

- [ ] **Step 4: Chạy để chắc nó xanh**

Run: `cd apps/app && bun test test/locale-resolve.spec.ts`
Expected: PASS, sáu khẳng định.

- [ ] **Step 5: Chứng minh chiều đỏ**

Đổi lại thành `"en"`, chạy lại.
Expected: ĐỎ ở đúng hai chỗ, thông điệp nêu `"vi"` và `"en"`. Trả về `"vi"`.

- [ ] **Step 6: Chạy trọn bộ để bắt hồi quy**

Run (từ gốc kho): `bun run db:test && bun run test`
Expected: PASS. Đổi mặc định chạm mọi màn — nếu một bài kiểm nào đó ngầm dựa vào mặc định cũ thì nó đỏ ở đây, và đó là thông tin phải xử ngay chứ không để tới S4.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/lib/locale.ts apps/app/test/locale-resolve.spec.ts
git commit -m "feat(ui): stop treating Vietnamese as the exception"
```

**Verify task:** `cd apps/app && bun test test/locale-resolve.spec.ts` · từ gốc: `bun run db:test && bun run test` · `bun run check-types`
**Phục vụ:** E9 (năm ô của luật chọn tiếng)
**independent:** true — không đụng file nào của các task khác.

---

## Task 3: Khung cửa vào

**Files:**
- Modify: `apps/app/components/auth-shell.tsx`

**Interfaces:**
- Consumes: `authMessages` (Task 1), khoá `shell.*`.
- Produces: `AuthShell` và `AuthHeading` giữ NGUYÊN chữ ký hiện tại (`{ children }` và `{ title, description }`) — Task 4, 5 không phải đổi chỗ gọi.

`auth-shell.tsx` không mang `"use client"`, nên nó là component máy chủ và đọc locale được bằng `cookies()` như layout gốc. Nhưng layout gốc đã tính locale rồi — **đừng tính lần hai**. Lấy locale bằng cùng cách layout gốc lấy, trong chính file này.

- [ ] **Step 1: Đọc lại cách layout gốc lấy locale**

Run: `sed -n '44,60p' apps/app/app/layout.tsx`
Ghi lại đúng hai dòng `cookies()` / `headers()` + `resolveLocale`. Dùng lại y hệt.

- [ ] **Step 2: Nối khung vào kho chuỗi và bỏ dòng chân**

Ba việc trong một lượt sửa:
1. `aria-label="Homepage"` (hai chỗ) → `aria-label={m.shell.homepage}`.
2. `CRM` trong thẻ `<p className="font-mono …">` → `{m.shell.eyebrow}`, và thẻ đó mang `translate="no"`.
3. `<h1>Every customer, one place.</h1>` → `{m.shell.headline}`.
4. **Xoá trọn** thẻ `<p className="relative font-mono text-xs/4 text-muted-foreground">` chứa "Made with love by" và thẻ `<a href="https://trycomp.ai">`.

Không đụng `LICENSE`.

- [ ] **Step 3: Kiểm mắt trên bản chạy**

Dựng `apps/app` rồi mở `/sign-in` ở cả hai thứ tiếng.
Expected: chân trang trống, không còn chữ "Comp AI"; tiêu đề lớn đọc bằng tiếng của người.

- [ ] **Step 4: Gỡ khoá `shell.*` khỏi `CHUA_NOI_KHAI`**

Xoá ba dòng `auth.shell.*` khỏi danh sách trong `messages-guard.spec.ts`.

- [ ] **Step 5: Chạy bài kiểm**

Run: `cd apps/app && bun test test/messages-guard.spec.ts` · từ gốc: `bun run check-types` · `bun run lint`
Expected: PASS cả ba.

- [ ] **Step 6: Commit**

```bash
git add apps/app/components/auth-shell.tsx apps/app/test/messages-guard.spec.ts
git commit -m "fix(app): the door frame reads in the reader's language, and stops crediting someone else"
```

**Verify task:** `cd apps/app && bun test test/messages-guard.spec.ts` · `bun run check-types` · `bun run lint`
**Phục vụ:** E1 (sáu ô của khung), E13 (dòng chân biến mất)
**independent:** false — phụ thuộc Task 1.

---

## Task 4: Màn đăng nhập, cả ba nhánh

**Files:**
- Modify: `apps/app/app/(landing)/sign-in/page.tsx`
- Modify: `apps/app/app/(landing)/sign-in/social-sign-in.tsx`
- Modify: `apps/app/app/(landing)/sign-in/sso-sign-in.tsx`

**Interfaces:**
- Consumes: `authMessages` (Task 1), khoá `signIn.*` và `docTitle.signIn`.
- Produces: `SocialSignIn` và `SsoSignIn` nhận thêm prop `nhan` — hai file này là client component nên **không được tự gọi `authMessages` bằng locale suy từ máy chủ**; trang máy chủ tính rồi truyền xuống.

Chữ ký mới, task sau dựa vào:

```ts
export function SocialSignIn(props: {
	provider: MailboxProviderId;
	nhan: string;
	loi: string;
	dangGui: string;
}): JSX.Element;

export function SsoSignIn(props: {
	providers: SsoProvider[];
	nhan: (ten: string) => string;
	loi: string;
}): JSX.Element;
```

- [ ] **Step 1: Đổi ba `metadata` tĩnh sang `generateMetadata`**

Trong `page.tsx`, thay:

```ts
export const metadata: Metadata = { title: "Sign in" };
```

bằng:

```ts
export async function generateMetadata(): Promise<Metadata> {
	const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
	const locale = resolveLocale(
		cookieStore.get(LANG_COOKIE)?.value,
		headerList.get("accept-language") ?? undefined,
	);
	return { title: authMessages(locale).docTitle.signIn };
}
```

- [ ] **Step 2: Nối ba nhánh của trang**

- Suspense fallback: `title={m.signIn.title}` `description={m.signIn.description}`.
- Nhánh thường: cùng hai khoá đó.
- **Nhánh "chưa có cách nào để vào"**: `m.signIn.noWay.title`, `m.signIn.noWay.description`, và đoạn hướng dẫn `m.signIn.noWay.howTo` đặt trong thẻ mang `translate="no"` — bốn tên biến trong đó là thứ người phải gõ lại nguyên văn.

- [ ] **Step 3: Nhãn nút ghép động, không đúc sẵn**

`social-sign-in.tsx`: bảng `PROVIDERS` giữ `Logo`, BỎ `label`. Tên hãng thành hằng riêng và bọc `translate="no"`:

```tsx
<Button …>
	{pending ? <Spinner data-icon="inline-start" /> : <Logo data-icon="inline-start" className="size-4" />}
	{nhan}
</Button>
```

Trang máy chủ truyền `nhan={m.signIn.continueWith(TEN_HANG[provider])}` với `TEN_HANG = { google: "Google", microsoft: "Microsoft" }`.

`sso-sign-in.tsx`: thay `Continue with {provider.name}` bằng nhãn ghép, và **tên nhà cung cấp mang `translate="no"`**:

```tsx
{nhan(provider.name)}
```

Vì `nhan` trả về một chuỗi, phần tử bọc nó phải mang `translate="no"` cho riêng tên. Tách làm hai mảnh để dấu đặt đúng chỗ dữ liệu, không đặt lên cả nhãn:

```tsx
<>
	{dongTu}{" "}
	<span translate="no">{provider.name}</span>
</>
```

với `dongTu` là phần nhãn đã bỏ chỗ trống, truyền từ trang máy chủ.

- [ ] **Step 4: Câu lỗi dự phòng**

Cả hai file: `toast.error(error.message ?? loi)` với `loi` là `m.signIn.error.unreachable` truyền xuống. Câu do máy chủ đúc sẵn (`error.message`) vẫn ưu tiên — đó là giới hạn đã khai, không phải lỗi.

- [ ] **Step 5: Kiểm client component không kéo package máy chủ**

Run: `bun run check-types` và `cd apps/app && bun run build 2>&1 | grep -i "can't resolve" || echo "khong ro ri"`
Expected: `khong ro ri`. Nếu thấy `dns` trong vết nhập thì một client component đang nhập `@crm/auth` — đọc từ dưới lên để tìm file rò rỉ.

- [ ] **Step 6: Gỡ khoá đã nối khỏi `CHUA_NOI_KHAI`, chạy bài kiểm**

Run: `cd apps/app && bun test test/messages-guard.spec.ts` · từ gốc `bun run check-types` · `bun run lint`

- [ ] **Step 7: Commit**

```bash
git add "apps/app/app/(landing)/sign-in" apps/app/test/messages-guard.spec.ts
git commit -m "fix(app): the way in reads in the reader's language, including the way that has no way in"
```

**Verify task:** `cd apps/app && bun test test/messages-guard.spec.ts` · `bun run check-types` · `bun run lint`
**Phục vụ:** E1, E3, E4, E5, E7, E8
**independent:** false — phụ thuộc Task 1. Có thể chạy song song với Task 5.

---

## Task 5: Màn khai báo và màn khoá nghiên cứu

**Files:**
- Modify: `apps/app/app/(landing)/onboarding/page.tsx`
- Modify: `apps/app/app/(landing)/onboarding/onboarding-form.tsx`
- Modify: `apps/app/app/(landing)/onboarding/research/page.tsx`
- Modify: `apps/app/app/(landing)/onboarding/research/research-form.tsx`

**Interfaces:**
- Consumes: `authMessages` (Task 1), khoá `onboarding.*`, `research.*`, `docTitle.*`.
- Produces: `OnboardingForm` nhận thêm `nhan: AuthMessages["onboarding"]`; `ResearchForm` nhận thêm `nhan: AuthMessages["research"]`. Hai form là client component nên nhận chữ đã xong từ trang máy chủ.

- [ ] **Step 1: `generateMetadata` cho hai trang**

Cùng khuôn Task 4 Step 1, với `docTitle.onboarding` và `docTitle.research`.

- [ ] **Step 2: Nối hai trang**

`onboarding/page.tsx`: `title={m.onboarding.title}` `description={m.onboarding.description}`, và `<OnboardingForm placeholder={DEFAULT_WORKSPACE_NAME} nhan={m.onboarding} />`. Giữ nguyên `DEFAULT_WORKSPACE_NAME` — nó là slug thật.

`research/page.tsx`: tương tự với `m.research`.

- [ ] **Step 3: Nối hai form, đặt dấu đúng chỗ dữ liệu**

`onboarding-form.tsx` — ba nhãn, hai mô tả, chữ trên nút, chữ lúc đang lưu. Bốn chỗ mang `translate="no"`:

```tsx
<InputGroupAddon><InputGroupText translate="no">/</InputGroupText></InputGroupAddon>
```

```tsx
<InputGroupAddon><InputGroupText translate="no">https://</InputGroupText></InputGroupAddon>
```

Ô tên công ty: `placeholder={placeholder}` — giá trị là `"CRM"`, và ô mang `translate="no"`.
Ô website: `placeholder="acme.com"` — ô mang `translate="no"`.

Nút gửi:

```tsx
<Button type="submit" disabled={save.isPending}>
	{save.isPending ? <Spinner data-icon="inline-start" /> : null}
	{save.isPending ? nhan.submitting : nhan.submit}
</Button>
```

`research-form.tsx` — nhãn, gợi ý, mô tả có liên kết, nút. Mô tả có liên kết ghép hai mảnh:

```tsx
<FieldDescription>
	{nhan.noKey}{" "}
	<a href={CONTEXT_DEV_SIGNUP_URL} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-foreground">
		{nhan.signUp}
	</a>
</FieldDescription>
```

- [ ] **Step 4: Gỡ khoá đã nối, chạy bài kiểm**

Run: `cd apps/app && bun test test/messages-guard.spec.ts` · từ gốc `bun run check-types` · `bun run lint`
Expected: PASS. `CHUA_NOI_KHAI` không còn dòng `auth.*` nào.

- [ ] **Step 5: Commit**

```bash
git add "apps/app/app/(landing)/onboarding" apps/app/test/messages-guard.spec.ts
git commit -m "fix(app): the two setup screens read in the reader's language"
```

**Verify task:** `cd apps/app && bun test test/messages-guard.spec.ts` · `bun run check-types` · `bun run lint`
**Phục vụ:** E2, E5, E6, E8
**independent:** false — phụ thuộc Task 1. Chạy song song được với Task 4.

---

## Task 6: Máy chủ riêng cho cây làm việc

**Files:**
- Create: `_acceptance/cua-vao-noi-tieng-viet/rang/may-chu.mjs`

**Interfaces:**
- Produces: `export async function dungMayChu(): Promise<{ dong(): Promise<void> }>` — dựng `apps/api` ở 3301 và `apps/app` ở 3300 TỪ CÂY ĐANG CHẠY, chờ cả hai trả lời, trả về một hàm dọn. Mọi chân của Task 7–12 gọi nó.

Bẫy đã trả giá ở vòng ③a: máy chủ ở cổng 3000 phục vụ mã của KHO GỐC. Sửa trong cây làm việc mà đo ở 3000 là đo cây khác.

- [ ] **Step 1: Viết bộ dựng**

```js
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const APP = Number(process.env.CONG_APP ?? 3300);
const API = Number(process.env.CONG_API ?? 3301);

async function cho(url, giay = 90) {
	for (let i = 0; i < giay * 2; i++) {
		try {
			const r = await fetch(url, { redirect: "manual" });
			if (r.status > 0) return;
		} catch {}
		await new Promise((r) => setTimeout(r, 500));
	}
	console.log(`KHONG DO DUOC: may chu ${url} khong len sau ${giay} giay`);
	process.exit(2);
}

export async function dungMayChu() { … }
```

`GOC` suy từ vị trí chính file này — **không hardcode đường dẫn kho**. Đây là lớp lỗi phản biện đã nêu ở vòng khác.

- [ ] **Step 2: Chứng minh nó dựng đúng cây**

Run: `node -e "import('./_acceptance/cua-vao-noi-tieng-viet/rang/may-chu.mjs').then(async m => { const s = await m.dungMayChu(); const r = await fetch('http://localhost:3300/sign-in'); console.log('status', r.status); await s.dong(); })"`
Expected: `status 200`.

- [ ] **Step 3: Chứng minh nó TỪ CHỐI chứ không đoán**

Đặt `CONG_APP=3999` rồi chạy lại với một cổng không có gì nghe.
Expected: in `KHONG DO DUOC: may chu http://localhost:3999/... khong len sau 90 giay`, thoát mã **2**.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/cua-vao-noi-tieng-viet/rang/may-chu.mjs
git commit -m "test(acceptance): measure the tree you are standing in, not the one on port 3000"
```

**Verify task:** hai lượt chạy ở Step 2 và Step 3
**Phục vụ:** nền cho E1–E8, E10, E13, E17, E18
**independent:** true — không đụng file của task nào khác.

---

## Task 7: Bảng ô ghim và chân đo hai màn chính

**Files:**
- Create: `_acceptance/cua-vao-noi-tieng-viet/rang/o-ghim.json`
- Create: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs` (chân `dang-nhap`, `khai-bao`)
- Create: `_acceptance/cua-vao-noi-tieng-viet/rang/lat-cua-vao.json`

**Interfaces:**
- Consumes: `dungMayChu` (Task 6).
- Produces: `o-ghim.json` với ba mảng — `dangNhap` (6 ô), `khaiBao` (9 ô), `khongDich` (13 giá trị). Task 8–12 đọc cùng file này. Mỗi ô là `{ ten, chon, viMongDoi?, enGhim }` với `chon` là bộ chọn CSS.

**Luật cốt lõi của hai chân này — đây là chỗ phản biện bắt lỗi nặng nhất:** KHÔNG trừ theo "giống hệt nhau". Với TỪNG ô, khẳng định quan hệ ba vế.

- [ ] **Step 1: Viết bảng ô ghim**

`o-ghim.json`, mảng `dangNhap` đúng SÁU dòng, mảng `khaiBao` đúng CHÍN dòng, mảng `khongDich` đúng MƯỜI BA dòng theo bảng ở AC-6. Mỗi dòng ghi `ten` (tên người đọc được), `chon` (bộ chọn), và `enGhim` (chuỗi tiếng Anh hiện tại, chép nguyên văn từ mã trước khi sửa).

- [ ] **Step 2: Viết chân `dang-nhap`**

Cốt lõi:

```js
const KQ = [];
for (const o of GHIM.dangNhap) {
	const vi = await docChu(trangVi, o.chon);
	const en = await docChu(trangEn, o.chon);
	if (vi === null || en === null) {
		console.log(`KHONG DO DUOC: khong tim thay o "${o.ten}" (${o.chon})`);
		process.exit(2);
	}
	if (vi === en) KQ.push(`TRUNG: o "${o.ten}" hien y het o ca hai thu tieng: ${JSON.stringify(vi)}`);
	else if (!DAU.test(vi)) KQ.push(`KHONG DAU: o "${o.ten}" ban tieng Viet khong mang dau tieng Viet: ${JSON.stringify(vi)}`);
	else if (en !== o.enGhim) KQ.push(`LECH GHIM: o "${o.ten}" ban tieng Anh la ${JSON.stringify(en)}, ghim la ${JSON.stringify(o.enGhim)}`);
}
if (KQ.length > 0) { for (const d of KQ) console.log(d); process.exit(1); }
console.log(`ket qua: ${GHIM.dangNhap.length}/${GHIM.dangNhap.length} o dat quan he ba ve`);
```

Số ô đo được phải BẰNG `GHIM.dangNhap.length`; không tìm thấy ô nào là **thoát mã 2**, không phải đạt.

- [ ] **Step 3: Viết chân `khai-bao`** — cùng khuôn, đọc `GHIM.khaiBao`, chín ô, trên hai màn.

- [ ] **Step 4: Viết `lat-cua-vao.json`** — danh sách tám đường dẫn cho chân đọc cây cú pháp của vòng ③a dùng lại.

Run để chắc nó nhận: `node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/chu-cung-jsx.mjs --lat _acceptance/cua-vao-noi-tieng-viet/rang/lat-cua-vao.json`
Expected: exit 0 sau khi Task 3–5 xong.

- [ ] **Step 5: Chứng minh chiều đỏ — cả BA đường**

Trên một bản sao của cây, lần lượt:
1. Đổi một giá trị tiếng Việt thành đúng bản tiếng Anh → Expected: `TRUNG: o "..." hien y het...`, thoát 1.
2. Đổi một giá trị tiếng Việt thành một chuỗi tiếng Anh KHÁC → Expected: `KHONG DAU: ...`, thoát 1.
3. Xoá một phần tử khỏi trang → Expected: `KHONG DO DUOC: khong tim thay o ...`, thoát **2**.

Kiểm `md5` của file bị phá trước và sau, để chắc cú phá thật sự đổi được vật. Trả nguyên trạng sau mỗi lượt.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/cua-vao-noi-tieng-viet/rang/
git commit -m "test(acceptance): assert the relation, not the absence of English"
```

**Verify task:** ba lượt phá ở Step 5, mỗi lượt đúng thông điệp đã ghim
**Phục vụ:** E1, E2, E11
**independent:** false — phụ thuộc Task 6, và cần Task 1–5 xong mới xanh được.

---

## Task 8: Ba trạng thái ẩn

**Files:**
- Modify: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs` (thêm `khong-co-duong`, `trang-thai-tam`, `dang-gui`)

**Interfaces:**
- Consumes: `o-ghim.json`, `dungMayChu`.

Đây là ba bề mặt mà vòng ③a sót. Mỗi chân phải MỞ ĐƯỢC trạng thái, không suy từ mã.

- [ ] **Step 1: `khong-co-duong`** — chặn lượt gọi `sso.signInOptions` ở tầng mạng của trình duyệt và trả về `{ google: false, microsoft: false, providers: [] }`, rồi tải lại trang. Khẳng định: tiêu đề, mô tả, đoạn hướng dẫn hiện tiếng Việt; và bốn tên biến xuất hiện ĐỦ BỐN, nguyên văn chữ hoa. Không dựng được nhánh → thoát mã 2 gọi tên nhánh.

- [ ] **Step 2: `trang-thai-tam`** — làm chậm lượt gọi cấu hình (delay 3 giây ở tầng chặn mạng), chụp trạng thái trong khoảng đó, đọc tiêu đề và mô tả dự phòng. Không bắt được → thoát mã 2.

- [ ] **Step 3: `dang-gui`** — với cả BA nút, treo lượt gửi lại rồi đọc chữ trên nút và kiểm thuộc tính `disabled`. Số nút đo được phải BẰNG 3; thiếu một cái là đỏ và gọi tên nút thiếu.

- [ ] **Step 4: Chứng minh chiều đỏ từng chân** — gõ chuỗi tương ứng về tiếng Anh trên bản sao; mỗi chân phải đỏ với thông điệp nêu đích danh trạng thái.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs
git commit -m "test(acceptance): open the three states that only appear when something is wrong"
```

**Verify task:** ba lượt phá ở Step 4
**Phục vụ:** E3, E4, E5
**independent:** false — phụ thuộc Task 7.

---

## Task 9: Mười ba thứ không dịch, và tên do người gõ

**Files:**
- Modify: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs` (thêm `khong-dich`, `ten-sso`)

- [ ] **Step 1: Gieo fixture** — một nhà cung cấp SSO tên `"Đất Xanh"` (không phải ASCII) và một workspace có tên người gõ. Gieo bằng lượt gọi máy chủ, không sửa cơ sở dữ liệu bằng tay.

- [ ] **Step 2: `khong-dich`** — đọc mười ba giá trị từ `GHIM.khongDich`. Số quan sát được phải BẰNG mười ba; thiếu một dòng → thoát mã 2 gọi tên dòng đó. Với từng giá trị: bản tiếng Việt giống hệt bản tiếng Anh, VÀ `el.closest('[translate="no"]')` khác `null`.

- [ ] **Step 3: `ten-sso`** — chữ trên nút chứa `"Đất Xanh"` nguyên văn ở cả hai thứ tiếng, và phần động từ KHÁC nhau giữa hai lượt.

- [ ] **Step 4: Chứng minh chiều đỏ — hai đường**
1. Bỏ `translate="no"` ở một chỗ → đỏ, gọi tên chỗ đó.
2. Bỏ một dòng khỏi fixture → thoát mã **2**, gọi tên dòng thiếu.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs
git commit -m "test(acceptance): count the things that must not change, and refuse when one is missing"
```

**Verify task:** hai lượt phá ở Step 4
**Phục vụ:** E6, E7
**independent:** false — phụ thuộc Task 7.

---

## Task 10: Tiêu đề tài liệu, luật chọn tiếng qua máy chủ, chân trang

**Files:**
- Modify: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs` (thêm `tieu-de-tai-lieu`, `chon-tieng-may-chu`, `chan-trang`)

- [ ] **Step 1: `tieu-de-tai-lieu`** — với ba đường, đọc `<title>` từ HTML máy chủ trả về (dùng `fetch`, không cần trình duyệt). Ba tiêu đề ở lượt `vi` phải KHÁC ba tiêu đề ở lượt `en` và đều mang dấu.

- [ ] **Step 2: `chon-tieng-may-chu`** — ba lượt yêu cầu thật:

| Lượt | Cookie | `Accept-Language` | Mong đợi |
| --- | --- | --- | --- |
| 1 | không | không gửi header | `vi` |
| 2 | không | `vi-VN,vi;q=0.9` | `vi` |
| 3 | `lang=vi` | `en-US,en;q=0.9` | `vi` |

Mỗi lượt kiểm HAI vế trên chính lượt trả về: thuộc tính `lang` của thẻ `html`, VÀ tiêu đề màn. Một vế đúng một vế sai vẫn là đỏ.

- [ ] **Step 3: `chan-trang`** — dựng ba màn ở hai thứ tiếng, khẳng định `"Comp AI"` và `trycomp.ai` không có trên màn. Cộng một khẳng định `git diff --quiet HEAD -- LICENSE`.

- [ ] **Step 4: Chứng minh chiều đỏ từng chân**
1. Trả một trang về `metadata` tĩnh → `tieu-de-tai-lieu` đỏ, gọi tên đường đó.
2. Đổi thứ tự ưu tiên trong `resolveLocale` cho header thắng cookie → lượt 3 đỏ, gọi tên ô đó.
3. Đặt lại dòng chân vào khung → `chan-trang` đỏ, gọi tên màn.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs
git commit -m "test(acceptance): read the tab, the header and the footer on the real wire"
```

**Verify task:** ba lượt phá ở Step 4
**Phục vụ:** E8, E13, E18
**independent:** false — phụ thuộc Task 7.

---

## Task 11: Bề rộng thật và trạng thái lỗi

**Files:**
- Modify: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs` (thêm `be-rong`, `loi-mang`)

- [ ] **Step 1: `be-rong`** — với ba màn ở tiếng Việt, trên ba khổ 768 / 1024 / 1280: đo `scrollWidth` so với `clientWidth` của ô chứa từng chuỗi. Chữ bị cắt bằng CSS **không nằm trong DOM** — phải đo bề rộng dựng thật, không đếm ký tự. Số ô đo được phải bằng số ô khai trước; thiếu ô nào → thoát mã 2.

- [ ] **Step 2: `loi-mang`** — chặn lượt gọi ra nhà cung cấp ở tầng mạng và trả lỗi, bấm nút đăng nhập, chờ thông báo nổi, đọc chữ trong nó ở cả hai thứ tiếng. Khẳng định `vi !== en` và `vi` mang dấu. Không nổi được thông báo → thoát mã **2**, không phải đạt.

Chân này ghi chữ bắt được ra `evidence/E14-chu-loi.txt` — hội đồng E14 lấy nó làm đầu vào bắt buộc.

- [ ] **Step 3: Chứng minh chiều đỏ**
1. Thay một tiêu đề bằng chuỗi dài gấp đôi → `be-rong` đỏ, gọi tên ô tràn ra.
2. Gõ câu lỗi dự phòng về tiếng Anh → `loi-mang` đỏ, in nguyên văn câu đó.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs
git commit -m "test(acceptance): measure the width the browser drew, and make the failure happen"
```

**Verify task:** hai lượt phá ở Step 3
**Phục vụ:** E10, E17
**independent:** false — phụ thuộc Task 7.

---

## Task 12: Sổ khai sinh

**Files:**
- Create: `_acceptance/cua-vao-noi-tieng-viet/rang/khai-sinh.mjs`

**Luật cốt lõi — phản biện đã bắt đúng chỗ này:** danh sách đóng viết TRONG file này, `N = 15`. **Không suy dân số từ việc quét thư mục `rang/`** — dân số suy từ chính thư mục nó sắp đọc là một đẳng thức chỉ có thể tự đồng ý với mình.

- [ ] **Step 1: Viết danh sách đóng**

```js
const DANH_SACH = [
	{ muc: "cua-vao.mjs dang-nhap", pha: …, thongDiep: "TRUNG: o" },
	{ muc: "cua-vao.mjs khai-bao", … },
	{ muc: "cua-vao.mjs khong-co-duong", … },
	{ muc: "cua-vao.mjs trang-thai-tam", … },
	{ muc: "cua-vao.mjs dang-gui", … },
	{ muc: "cua-vao.mjs khong-dich", … },
	{ muc: "cua-vao.mjs ten-sso", … },
	{ muc: "cua-vao.mjs tieu-de-tai-lieu", … },
	{ muc: "cua-vao.mjs be-rong", … },
	{ muc: "cua-vao.mjs chan-trang", … },
	{ muc: "cua-vao.mjs loi-mang", … },
	{ muc: "cua-vao.mjs chon-tieng-may-chu", … },
	{ muc: "chu-cung-jsx.mjs --lat lat-cua-vao.json", … },
	{ muc: "test/locale-resolve.spec.ts", … },
	{ muc: "test/auth-messages.spec.ts", … },
];

if (DANH_SACH.length !== 15) {
	console.log(`KHONG DO DUOC: danh sach khai sinh co ${DANH_SACH.length} muc, ghim la 15`);
	process.exit(2);
}
```

- [ ] **Step 2: Chạy cả hai chiều của từng mục**

Với mỗi mục: chạy chiều lành (phải im, thoát 0), rồi phá vật **trong một bản sao** và chạy chiều đỏ (phải thoát khác 0 VÀ in đúng `thongDiep` đã ghim). Bảng kết quả phải có đúng 15 dòng và tên từng dòng khớp `DANH_SACH`.

Một mục không chạy được vì hạ tầng (không có trình duyệt, máy chủ không lên) → **TỪ CHỐI ĐO**: thoát mã 2, gọi tên mục đó. Không bao giờ là một lượt đạt.

- [ ] **Step 3: Chạy song song ba luồng**

Bài học từ vòng thước: chạy tuần tự vượt trần 600 giây của công cụ. Chạy song song ba luồng, và mục nào có chiều đỏ sửa cây làm việc thì chạy RIÊNG sau cùng.

- [ ] **Step 4: Chứng minh chính sổ khai sinh đỏ được**

1. Xoá một mục khỏi `DANH_SACH` → Expected: thoát mã 2, `danh sach khai sinh co 14 muc, ghim la 15`.
2. Làm một chiều đỏ không còn đỏ (sửa chân đo cho nó nuốt lỗi) → Expected: sổ khai sinh đỏ và gọi tên mục đó.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/cua-vao-noi-tieng-viet/rang/khai-sinh.mjs
git commit -m "test(acceptance): a registry that cannot agree with itself"
```

**Verify task:** hai lượt phá ở Step 4
**Phục vụ:** E15
**independent:** false — phụ thuộc Task 7–11.

---

## Thứ tự chạy

```
Task 1 ─┬─ Task 3 ─┐
        ├─ Task 4 ─┤
        └─ Task 5 ─┤
Task 2 ─────────────┤   (rời, chạy lúc nào cũng được)
Task 6 ─────────────┴─ Task 7 ─┬─ Task 8 ─┐
                                ├─ Task 9 ─┤
                                ├─ Task 10 ┤
                                └─ Task 11 ┴─ Task 12
```

**Song song được:** Task 2 và Task 6 rời hẳn. Task 3, 4, 5 song song sau Task 1 — nhưng cả ba đụng `messages-guard.spec.ts`, nên hoặc chạy tuần tự, hoặc để một task duy nhất dọn `CHUA_NOI_KHAI` ở cuối. Task 8, 9, 10, 11 cùng đụng `cua-vao.mjs` nên **chạy tuần tự**.

**Kết luận về fan-out:** chỉ Task 2 và Task 6 mang cờ `independent: true`. Mọi task còn lại chia sẻ file, nên **chạy tuần tự trong vòng chính** — không dùng workflow chia nhánh.

## Kiểm trọn bộ trước khi giao S4

```bash
bun run db:test && bun run test
bun run check-types
bun run lint
bun run lint:slop
```

Rồi dựng máy chủ 3300/3301 từ cây làm việc, chạy `khai-sinh.mjs` (15/15 hai chiều), rồi mới sinh args S4.
