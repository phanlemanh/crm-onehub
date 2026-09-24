# Ô số tiền đọc theo tiếng — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ba ô nhập số tiền thoả thuận đọc chuỗi theo tiếng đang dùng và số chữ số lẻ của đồng tiền, từ chối chuỗi mơ hồ có câu nói cách sửa, và cho người thấy máy đã đọc gì.

**Architecture:** Bộ đọc thuần `parseMoneyInput`/`formatMoneyInput` ở `packages/ui/src/lib/money-input.ts`; ô `MoneyInput` ở `packages/ui/src/components/money-input.tsx` dùng bộ đọc đó và `formatMoney`; `InlineMoneyField` ghép `MoneyInput` vào hàng thuộc tính của tấm thoả thuận; ba chỗ gọi thay `Number.parseFloat` bằng bộ đọc.

**Tech Stack:** React 19, Next.js, Bun test + jsdom (`*.dom.tsx`), `Intl.NumberFormat`, `@crm/db/currency`.

**Spec:** `docs/superpowers/specs/2026-09-24-o-so-tien-doc-theo-tieng-design.md` · hợp đồng `_acceptance/o-so-tien-doc-theo-tieng/contract.md` · bộ đo `_acceptance/o-so-tien-doc-theo-tieng/evals.yaml`

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- `/packages/ui` là nguồn UI duy nhất; không `className` ghi đè ở chỗ gọi trong `apps/app` ngoài chỗ đã có.
- Không cài `@reui/number-field`, không thêm `@base-ui/react`.
- Dấu nghìn/dấu lẻ lấy từ `Intl.NumberFormat(locale).formatToParts`, không viết cứng.
- Số chữ số lẻ lấy từ `minorUnitsOf` của `@crm/db/currency`.
- `cents` = đơn vị ×100 (quy ước vận chuyển của `docs/currency.md`), tính từ chữ số, không qua số thực.
- Câu chữ vi và en ở `packages/ui/src/lib/messages.ts`, nhóm `soTien`.
- Mọi phép đo mới có cặp hai chiều trên cùng fixture, chiều đỏ ghim thông điệp (MEASURE-BIRTH-CLAUSE).

## Review Focus

1. Người gõ khoảng trắng ở đầu/cuối (dán từ bảng tính) — phải được bỏ, không thành `format`.
2. Người đổi tiếng giao diện khi ô đang mở — bộ đọc đọc theo tiếng mới ở lần render kế (derive, không lưu kết quả đọc).
3. Chuỗi toàn số 0 (`0`, `0,00`) — nhận, `cents` 0, không phải rỗng.
4. Mở sửa một thoả thuận VND có `amountCents` không chia hết cho 100 (dữ liệu cũ sai) — `formatMoneyInput` vẫn ra chuỗi đọc lại được (hiện đủ 2 chữ số lẻ), người thấy lỗi phần lẻ khi Enter chứ không mất số.
5. Enter trong ô số tiền của tấm tạo — gửi biểu mẫu như các ô khác, không bị MoneyInput nuốt.

Mỗi dòng có một khẳng định trong task sở hữu (Task 1: dòng 1, 3, 4; Task 2: dòng 2; Task 3: dòng 5).

---

### Task 1: Bộ đọc thuần `money-input.ts`

phục vụ E1, E2, E3 · independent: false (Task 2–5 dựa vào nó)

**Files:**
- Create: `packages/ui/src/lib/money-input.ts`
- Test: `packages/ui/test/money-input.spec.ts`

**Interfaces — Produces:**

```ts
export type MoneyRejection = "format" | "otherLocale" | "fraction" | "negative" | "tooLarge";
export type MoneyReading =
  | { kind: "empty" }
  | { kind: "ok"; cents: number }
  | { kind: "invalid"; reason: MoneyRejection };
export function moneySeparators(locale: Locale): { group: string; decimal: string };
export function parseMoneyInput(text: string, options: { locale: Locale; currency: string }): MoneyReading;
export function formatMoneyInput(cents: number, options: { locale: Locale; currency: string }): string;
```

- [ ] Step 1: viết `money-input.spec.ts` với ba khối `describe`: `ma-tran` (bảng 12 dạng × vi/en × VND/USD viết sẵn, JPY ≡ VND, đối chứng `999.999.999.999`, đếm số ô = 74), `tieng-kia` (5 chuỗi × 2 chiều = 10), `chinh-xac` (3 giá trị ghi sẵn mỗi tiếng + 300 giá trị sinh tất định × 2 tiếng × 3 đồng, chuỗi lấy từ `formatMoneyInput`), cộng các dòng Review Focus 1, 3, 4.
- [ ] Step 2: `cd packages/ui && bun test ./test/money-input.spec.ts` → đỏ vì chưa có module.
- [ ] Step 3: viết `money-input.ts`: `moneySeparators` qua `formatToParts(1234567.5)`; `readWith(text, seps, minor)` trả `ok|fraction|format|tooLarge`; `parseMoneyInput` = trim → rỗng → dấu trừ → đọc theo tiếng này → nếu `format` hoặc `fraction` thì thử tiếng kia với cùng số chữ số lẻ, `ok` → `otherLocale`; `formatMoneyInput` dùng `Intl.NumberFormat(locale, { useGrouping: true, minimumFractionDigits: cents % 100 === 0 ? 0 : 2 (hoặc minorUnits nếu > 0), maximumFractionDigits: 2 })`.
- [ ] Step 4: chạy lại → xanh. Lượt phá-thử: bản sao đổi bộ đọc thành `parseFloat` → đỏ với thông điệp ghim (ghi vào evals ở S4).
- [ ] Step 5: commit `packages/ui/src/lib/money-input.ts packages/ui/test/money-input.spec.ts`.

### Task 2: Ô `MoneyInput` + câu chữ

phục vụ E4, E5 · independent: false

**Files:**
- Create: `packages/ui/src/components/money-input.tsx`
- Modify: `packages/ui/src/lib/messages.ts` (nhóm `soTien`, vi + en)
- Test: `packages/ui/test/money-input.dom.tsx`

**Interfaces — Produces:**

```tsx
export function MoneyInput(props: Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  value: string;
  onValueChange: (text: string) => void;
  currency: string;
  end?: React.ReactNode;
}): React.JSX.Element;
export function useMoneyReading(text: string, currency: string): MoneyReading;
```

- `Input` + (tuỳ chọn) `end` trong một hàng `flex gap-2`; `inputMode` theo `minorUnitsOf`; `aria-invalid` khi `invalid`; `aria-describedby` → id dòng dưới; dòng dưới là `<p aria-live="polite">` luôn có mặt khi chữ không rỗng: đọc được → `m.soTien.docLa` + `<span translate="no">{formatMoney(cents, currency, locale)}</span>`; từ chối → câu theo lý do (có số mẫu từ `formatMoneyInput`), màu `text-destructive`.
- `onBlur`: đọc được → `onValueChange(formatMoneyInput(cents))` rồi gọi `props.onBlur`.
- Placeholder mặc định = `formatMoneyInput` của 150 000 000 (đồng không lẻ) hoặc 24 000 (đồng có lẻ).

- [ ] Step 1: viết `money-input.dom.tsx` (`doc-lai`: 2 tiếng × 5 tình huống + rỗng + đổi đồng tiền + translate; `roi-o`: ba ca blur; Review Focus 2: đổi `LocaleProvider` khi đang có chữ).
- [ ] Step 2: chạy → đỏ.
- [ ] Step 3: viết thành phần + câu chữ.
- [ ] Step 4: chạy → xanh; phá-thử bỏ `aria-invalid` / bỏ `translate` / bỏ nhóm lại khi blur → đỏ đúng thông điệp.
- [ ] Step 5: `cd packages/ui && bun test test/messages-guard.spec.ts` xanh; commit.

### Task 3: Tấm tạo thoả thuận

phục vụ E6, E11 · independent: false

**Files:** Modify `apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx`; Test `apps/app/test/o-so-tien.dom.tsx` (`describe("tao-thoa-thuan")`).

- Thay `Input` số tiền + `Select` bằng `<MoneyInput id={amountId} ref={amountRef} value={amount} onValueChange={setAmount} currency={resolvedCurrency} end={<Select …/>} />`.
- `onSubmit`: `const reading = parseMoneyInput(amount, { locale, currency: resolvedCurrency })`; `invalid` → `amountRef.current?.focus()` và `return`; gửi `amountCents: reading.kind === "ok" ? reading.cents : null`, `currency: resolvedCurrency`.
- [ ] Test trước (ba ca + đổi đồng tiền + Enter gửi biểu mẫu), đỏ, sửa, xanh, phá-thử `parseFloat`, commit.

### Task 4: `InlineMoneyField` + tấm thoả thuận

phục vụ E7, E11 · independent: false

**Files:** Modify `apps/app/components/crm/inline-field.tsx` (thêm `InlineMoneyField`), `apps/app/components/crm/record-sheet/deal-sheet.tsx`; Test `apps/app/test/o-so-tien.dom.tsx` (`describe("sua-tai-cho")`).

```tsx
export function InlineMoneyField(props: {
  label: string; cents: number | null; currency: string;
  onSave: (cents: number | null) => void; saving?: boolean;
}): React.JSX.Element;
```

- Không sửa: nút như `InlineField`, hiện `formatMoney(cents, currency, locale)`.
- Sửa: `MoneyInput` `autoFocus`, nháp khởi đầu = `formatMoneyInput(cents)`; Enter/blur → đọc: `ok` → `onSave(cents)` nếu khác; `empty` → `onSave(null)` nếu khác; `invalid` → ở lại chế độ sửa; Esc → về giá trị cũ.
- `deal-sheet.tsx`: thay khối `InlineField` số tiền bằng `InlineMoneyField`; xoá `m.deal.amountNotNumber` nếu hết dùng.
- [ ] Test trước, đỏ, sửa, xanh, phá-thử lưu-khi-lỗi, commit.

### Task 5: Thêm nhanh từ tấm công ty

phục vụ E8, E11 · independent: false

**Files:** Modify `apps/app/components/crm/record-sheet/quick-add.tsx`; Test `apps/app/test/o-so-tien.dom.tsx` (`describe("them-nhanh")`).

- `useQuery(trpc.currency.settings.queryOptions())`; `currency = settings.data?.reportingCurrency`; `ready` thêm `currency !== undefined`; `submit` đọc bằng `parseMoneyInput`, `invalid` → focus + return; gửi `currency`.
- Xoá `amountNotNumber` của `recordSheetMessages` nếu hết dùng.
- [ ] Test trước, đỏ, sửa, xanh, phá-thử, commit.

### Task 6: Hai thước của hồ sơ — soi mã và màn thật

phục vụ E9, E10, E11 · independent: false

**Files:** Create `_acceptance/o-so-tien-doc-theo-tieng/rang/soi-ma.mjs`, `_acceptance/o-so-tien-doc-theo-tieng/rang/man-that.mjs`.

- `soi-ma.mjs`: gốc suy từ vị trí script; ma trận 3 tệp × 2 khẳng định; `@base-ui/react`, `cn`, `reui/number-field.tsx`, `amountNotNumber`; `design-gate --mode static` trên 4 tệp. Chiều đỏ: chạy trên bản sao tmpdir có `parseFloat`.
- `man-that.mjs`: khuôn `keo-tha-thoa-thuan/rang/man-bang-cot.mjs` (canhCay, phien, suySlug, goiApiTao, puppeteer); gieo công ty + thoả thuận USD; ba bước của E9; đọc `deals.byId` sau mỗi bước; dọn dẹp trong `finally`.
- Chạy với máy chủ của cây này (app ở cổng riêng, `APP_URL`/`API_URL` đặt tay).
- [ ] Viết, chạy xanh, chạy chiều đỏ trên bản trước vòng (git stash không dùng — worktree tạm ở tmpdir hoặc so bằng bản cũ), commit.

### Task 7: Bộ chứng của kho

- [ ] `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` xanh; đặt contract `status: implemented`.
