# Liên quan lọc bản đã cất — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Danh sách liên quan trong ngăn công ty, cá nhân, thoả thuận chỉ hiện bản đang dùng, kèm dòng «+n đã lưu trữ» mở ra các bản đã cất.

**Architecture:** Ba `byId` chọn quan hệ một lần kèm `archivedAt`, rồi tách thành mảng đang dùng (giữ tên cũ) và mảng gọn `archivedContacts`/`archivedDeals`; hình gọn khai một lần ở `apps/api/src/crm/da-luu-tru.ts`. Ngăn dùng một mảnh `DongDaLuuTru` (trong `record-parts.tsx`) ghép từ `SimpleTableRow` + `Button` của `packages/ui`, đặt cuối bốn bảng liên quan.

**Tech Stack:** NestJS + nestjs-trpc + Prisma + zod (API), Next.js + React Query + `@crm/ui` (app), bun test + happy-dom + supertest.

**Spec:** `docs/superpowers/specs/2026-10-13-lien-quan-loc-ban-da-cat-design.md` · hợp đồng `_acceptance/lien-quan-loc-ban-da-cat/contract.md` · evals `_acceptance/lien-quan-loc-ban-da-cat/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (`AGENTS.md`).
- `/packages/ui` là nguồn duy nhất của giao diện; không `className` đổi màu, góc, khoảng cách của component `@crm/ui`.
- Chữ trên màn: «+n đã lưu trữ», «Đã lưu trữ ngày …»; tiếng Anh «+n archived», «Archived on …»; không chữ «ẩn».
- Dữ liệu người nhập (tên) mang `translate="no"`.
- `apps/api/src/generated/server.ts` sinh bằng `cd apps/api && bun run trpc:generate` và được commit.
- Lời báo xoá vĩnh viễn (công ty, thoả thuận) đếm đang dùng + đã cất; mọi chỗ khác đếm đang dùng.
- Không đổi số đếm bảng danh sách Công ty; không nút Khôi phục trên dòng; không ghi mở-gập lên đường dẫn.

## Review Focus

- Bảng đang dùng rỗng nhưng có bản đã cất: ô trống cũ vẫn hiện, dòng gập ngay dưới (E8).
- Tên rất dài trên khổ 390: dòng mờ không tràn ngang (`truncate` + `min-w-0`, E15).
- Hai bản cất cùng mili-giây: thứ tự vẫn ổn định — xếp `archivedAt` giảm dần rồi `id` tăng dần (E1).
- Bản ghi cha cũng đã cất: dòng gập vẫn hiện như thường (E5 chạy trên cha đang dùng; ngăn đã cất đã có dải báo — E14).
- Thêm người vào thoả thuận rồi lưu trữ người đó: bộ chọn không gợi ý lại người đã cất (E4).

---

### Task 1: Máy chủ tách bản đang dùng và bản đã cất

independent: false · phục vụ E1, E2, E3, E4

**Files:**
- Create: `apps/api/src/crm/da-luu-tru.ts`
- Modify: `apps/api/src/companies/companies.service.ts` (`byId`), `apps/api/src/companies/companies.contracts.ts` (`companyDetailOutput`)
- Modify: `apps/api/src/contacts/contacts.service.ts` (`byId`, `relationship`), `apps/api/src/contacts/contacts.contracts.ts` (`contactByIdOutput`)
- Modify: `apps/api/src/deals/deals.service.ts` (`byId`, `contactOptions`), `apps/api/src/deals/deals.contracts.ts` (`dealDetailOutput`)
- Modify: `apps/api/src/generated/server.ts` (sinh lại)
- Modify: `docs/api.md` mục «Deleting a record is archive first, purge later»
- Test: `apps/api/test/lien-quan-loc-ban-da-cat.spec.ts`

**Interfaces:**
- Produces: `caNhanDaLuuTruOutput`, `thoaThuanDaLuuTruOutput` (zod), `tachDaLuuTru<T extends { archivedAt: Date | null }>(rows: T[]): { dangDung: T[]; daLuuTru: (T & { archivedAt: Date })[] }`; trường mới trên ba hợp đồng: `companies.byId` → `archivedContacts: { id, firstName, lastName, email, archivedAt: string }[]`, `archivedDeals: { id, name, archivedAt: string }[]`; `contacts.byId` → `archivedDeals`; `deals.byId` → `archivedContacts`.

- [ ] **Step 1: Viết bài kiểm đỏ** `apps/api/test/lien-quan-loc-ban-da-cat.spec.ts`, theo nếp `hoan-tac-loat-dung-id.spec.ts`: `Test.createTestingModule({ imports: [AppModule] })`, `gieoThanhVien(nguoi, "admin")`, `mintPhien`, gọi `GET /api/trpc/<thủ tục>?input=…` và `POST /api/trpc/<thủ tục>` bằng supertest với cookie. Gieo bằng mutation thật (`companies.create`, `contacts.create`, `deals.create`, `deals.attachContact`, `deals.setContactRole`, `*.archive`). Bốn `describe`:
  - `lqc-byid-cong-ty`: công ty 2 người đang dùng + 1 đã cất, 2 thoả thuận đang dùng + 2 đã cất (archive tuần tự, khác mili-giây). Ma trận viết trước `[contacts, deals, archivedContacts, archivedDeals]` so tập id; `archivedDeals` đúng thứ tự `archivedAt` giảm dần; mỗi `archivedAt` khớp `/^\d{4}-\d{2}-\d{2}T/`. Đối chứng: công ty không có bản đã cất → hai mảng `[]`. `expect(o.length).toBe(4)`. Thông điệp ghim: `chot(..., "lqc: cong ty lan thoa thuan da cat")`, `chot(Array.isArray(kq.archivedDeals), "lqc: mang da cat roi o hop dong cong ty")`.
  - `lqc-byid-ca-nhan`: người gắn thoả thuận A (role «Người quyết») và B (đã cất). `deals` = [A] có role; `archivedDeals` = [B]. Ghim «lqc: mang da cat roi o hop dong ca nhan».
  - `lqc-byid-thoa-thuan`: thoả thuận gắn X (role «Kỹ thuật») và Y (Y đã cất). Ghim «lqc: thoa thuan lan ca nhan da cat».
  - `lqc-chon-dong-nghiep`: công ty C có A, B, D; thoả thuận T không gắn ai. Trước khi cất B: `deals.contactOptions` và `contacts.byId(D).relationship.colleagues` đều có B (đối chứng dương). Cất B: cả hai không còn B, vẫn có A. Ghim «lqc: bo chon goi y nguoi da cat», «lqc: dong nghiep lan nguoi da cat».
  - `afterAll`: dọn theo `ma` như `hoan-tac-loat-dung-id.spec.ts` (deal, agentTask, contact, company, member, user, session).

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `bun run test -- "cd apps/api && bun test test/lien-quan-loc-ban-da-cat.spec.ts"`
Expected: FAIL — `archivedDeals` undefined, thoả thuận đã cất có trong `deals`.

- [ ] **Step 3: Hình gọn dùng chung** `apps/api/src/crm/da-luu-tru.ts`:

```ts
import { z } from "zod";

export const caNhanDaLuuTruOutput = z.object({
	id: z.string(),
	firstName: z.string(),
	lastName: z.string().nullable(),
	email: z.string().nullable(),
	archivedAt: z.string(),
});

export const thoaThuanDaLuuTruOutput = z.object({
	id: z.string(),
	name: z.string(),
	archivedAt: z.string(),
});

export function tachDaLuuTru<T extends { archivedAt: Date | null }>(rows: T[]) {
	const dangDung = rows.filter((row) => row.archivedAt === null);
	const daLuuTru = rows
		.filter((row): row is T & { archivedAt: Date } => row.archivedAt !== null)
		.sort(
			(a, b) =>
				b.archivedAt.getTime() - a.archivedAt.getTime() ||
				String((a as { id?: string }).id).localeCompare(
					String((b as { id?: string }).id),
				),
		);
	return { dangDung, daLuuTru };
}
```

- [ ] **Step 4: Ba hợp đồng** — thêm vào `companyDetailOutput`: `archivedContacts: z.array(caNhanDaLuuTruOutput), archivedDeals: z.array(thoaThuanDaLuuTruOutput)`; `contactByIdOutput`: `archivedDeals: z.array(thoaThuanDaLuuTruOutput)`; `dealDetailOutput`: `archivedContacts: z.array(caNhanDaLuuTruOutput)`.

- [ ] **Step 5: Ba `byId`.**
  - `companies.byId`: thêm `archivedAt: true` vào select của `contacts` và `deals`; sau đọc: `const nguoi = tachDaLuuTru(company.contacts); const thoa = tachDaLuuTru(deals);` trả `contacts: nguoi.dangDung.map(({ archivedAt: _a, ...c }) => c)`, `archivedContacts: nguoi.daLuuTru.map((c) => ({ id: c.id, firstName: c.firstName, lastName: c.lastName, email: c.email, archivedAt: c.archivedAt.toISOString() }))`, `deals` từ `thoa.dangDung` (map tiền như cũ), `archivedDeals: thoa.daLuuTru.map((d) => ({ id: d.id, name: d.name, archivedAt: d.archivedAt.toISOString() }))`. Lấy `contacts` ra khỏi `rest` để không đè.
  - `contacts.byId`: thêm `archivedAt: true` vào select `deal`; tách theo `row.deal.archivedAt` (map `deals` thành `{ ...deal, role }` trước rồi `tachDaLuuTru`); `deals` giữ hình cũ, `archivedDeals` hình gọn.
  - `deals.byId`: select `contact: { select: { ...CONTACT_SELECT, archivedAt: true } }`; `contacts.map(({ role, contact }) => ({ ...contact, role }))` rồi tách; `contacts` bỏ khoá `archivedAt`, `archivedContacts` hình gọn.
- [ ] **Step 6: Hai chỗ lọc thẳng** — `deals.contactOptions`: thêm `archivedAt: null` vào `where`; `contacts.relationship` colleagues: `where: { companyId, id: { not: contactId }, archivedAt: null }`.
- [ ] **Step 7: Sinh lại `server.ts`**: `cd apps/api && bun run trpc:generate`; `git diff --stat apps/api/src/generated/server.ts` chỉ đổi ba output.
- [ ] **Step 8: `docs/api.md`** — thêm một gạch đầu dòng dưới «Deleting a record is archive first, purge later»: «**A record's related lists are active rows only.** `companies.byId`, `contacts.byId`, `deals.byId` return `contacts`/`deals` without archived rows and carry archived ones as `archivedContacts`/`archivedDeals` (`id`, name, `archivedAt`, newest first) — the same over the `/rest` bridge an API key reads. `deals.contactOptions` and a contact's `relationship.colleagues` drop archived contacts outright.»
- [ ] **Step 9: Chạy xanh + kiểu**

Run: `bun run test -- "cd apps/api && bun test test/lien-quan-loc-ban-da-cat.spec.ts"` → PASS 4 describe; `cd apps/api && bun run check-types` → 0 lỗi.
- [ ] **Step 10: Phá-thử chiều đỏ** trên bản sao làm việc: bỏ `archivedDeals` khỏi `companyDetailOutput` → đỏ «lqc: mang da cat roi o hop dong cong ty»; bỏ `archivedAt: null` ở `contactOptions` → đỏ «lqc: bo chon goi y nguoi da cat». Commit trước, phá bằng `git stash push -m lqc-pha` không dùng — sửa tay rồi `git checkout -- <tệp>` SAU khi đã commit.
- [ ] **Step 11: Commit** `feat(lien-quan-loc-ban-da-cat): byId tách bản đã lưu trữ`.

### Task 2: Ngăn hiện «+n đã lưu trữ» và đếm đúng

independent: false (dùng kiểu `RouterOutputs` của Task 1) · phục vụ E5–E12, E13, E14

**Files:**
- Modify: `apps/app/lib/messages/record-sheet.ts` (khoá `archivedRows` ở `en` và `vi`)
- Modify: `apps/app/components/crm/record-sheet/record-parts.tsx` (thêm `DongDaLuuTru`)
- Modify: `apps/app/components/crm/record-sheet/company-sheet.tsx` (`CompanyContacts`, `CompanyDeals`, `companyConsequence`)
- Modify: `apps/app/components/crm/record-sheet/contact-sheet.tsx` (`ContactDeals`)
- Modify: `apps/app/components/crm/record-sheet/deal-sheet.tsx` (bảng Cá nhân, `deleteWarning`)
- Test: `apps/app/test/lien-quan-loc-ban-da-cat.dom.tsx`

**Interfaces:**
- Consumes: `RouterOutputs["companies"]["byId"]["archivedDeals"]` v.v. từ Task 1.
- Produces: `DongDaLuuTru({ items, columns, kind }: { items: { id: string; name: string; archivedAt: string }[]; columns: number; kind: "contact" | "deal" })`; `m.archivedRows.toggle(n: string): string`, `m.archivedRows.on: string`.

- [ ] **Step 1: Bài DOM đỏ** `apps/app/test/lien-quan-loc-ban-da-cat.dom.tsx` — chép khung của `vong-doi-mot-cach-cat.dom.tsx` (tRPC giả bằng Proxy, `mock.module` cho `@/lib/trpc/client`, `next/navigation`, `eve/react`, `@/lib/agent-session`; `mo()` bọc `NuqsTestingAdapter` + `QueryClientProvider` + `LocaleProvider` + `TooltipProvider`; `DetailSheet`). Dữ liệu giả khai kiểu `RouterOutputs["companies"]["byId"]`, `RouterOutputs["contacts"]["byId"]`, `RouterOutputs["deals"]["byId"]` (import type từ `@/lib/trpc/types`), không `as`. Mười `describe` mang tên đúng `-t` của config: `lqc-dong-gap` (ma trận 4 bảng × mở/gập + đối chứng rỗng), `lqc-mo-ngan` (bấm tên → `url.get("record")` kết thúc bằng `<kind>:<id>`; ngăn đã cất có `[data-dai-luu-tru]`), `lqc-so-dem` (`setSystemTime(new Date("2026-10-15T03:00:00Z"))`, 7 phép), `lqc-chi-cat`, `lqc-xoa-vinh-vien` (4 phép), `lqc-chu`, `lqc-ban-phim`. Mỗi chiều đỏ có `chot(…, "<thông điệp ghim trong evals.yaml>")`.
- [ ] **Step 2: Chạy, thấy đỏ**: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lien-quan-loc-ban-da-cat.dom.tsx` → FAIL (không có nút «+2 đã lưu trữ»).
- [ ] **Step 3: Chữ** — `record-sheet.ts`, trong `en`: `archivedRows: { toggle: (n: string) => \`+${n} archived\`, on: "Archived on" }`; trong `vi`: `archivedRows: { toggle: (n: string) => \`+${n} đã lưu trữ\`, on: "Đã lưu trữ ngày" }`.
- [ ] **Step 4: `DongDaLuuTru`** trong `record-parts.tsx`:

```tsx
export function DongDaLuuTru({
	items,
	columns,
	kind,
}: {
	items: { id: string; name: string; archivedAt: string }[];
	columns: number;
	kind: "contact" | "deal";
}) {
	const m = recordSheetMessages(useLocale());
	const openRecord = useOpenRecord();
	const [mo, setMo] = useState(false);
	if (items.length === 0) return null;
	return (
		<>
			<SimpleTableRow>
				<TableCell colSpan={columns} className="p-0">
					<Button
						variant="ghost"
						size="sm"
						aria-expanded={mo}
						onClick={() => setMo((v) => !v)}
						className="h-9 w-full justify-start px-5 font-normal text-muted-foreground"
					>
						<Icon icon={mo ? ChevronDown : ChevronRight} data-icon="inline-start" />
						{m.archivedRows.toggle(String(items.length))}
					</Button>
				</TableCell>
			</SimpleTableRow>
			{mo
				? items.map((item) => (
						<SimpleTableRow key={item.id} sub data-da-luu-tru={item.id}>
							<TableCell colSpan={columns} className="truncate py-2.5 pr-3 pl-5">
								<span className="flex min-w-0 items-center gap-2">
									<button
										type="button"
										translate="no"
										onClick={() => openRecord({ kind, id: item.id })}
										className="min-w-0 truncate underline-offset-2 hover:underline"
									>
										{item.name}
									</button>
									<span className="shrink-0">
										{m.archivedRows.on} <LocalDay date={item.archivedAt} />
									</span>
								</span>
							</TableCell>
						</SimpleTableRow>
					))
				: null}
		</>
	);
}
```

  `AddRow` dùng đúng các lớp ô và nút này, nên dòng gập trông như dòng «Thêm». `useOpenRecord` nhập từ chỗ các ngăn đang nhập; `ChevronDown`, `ChevronRight` từ `@carbon/icons-react/es/…`; `Icon` của `@crm/ui` đã `aria-hidden` (kiểm trong bài `lqc-ban-phim`).
- [ ] **Step 5: Nối bốn bảng.** Trong mỗi bảng: đặt `<DongDaLuuTru …/>` ngay sau `AddRow` (bảng không có `AddRow` — `ContactDeals` — thì sau dòng cuối). Nhánh bảng rỗng: sau `DetailSheetEmpty`, khi có bản đã cất, thêm `<SimpleTable variant="panel" header="sr-only" columns={<cột của bảng đó>}><DongDaLuuTru …/></SimpleTable>`. Tên: cá nhân `[firstName, lastName].filter(Boolean).join(" ")`, thoả thuận `name`. `kind`: công ty › Cá nhân và thoả thuận › Cá nhân = `"contact"`; công ty › Thoả thuận và cá nhân › Thoả thuận = `"deal"`.
- [ ] **Step 6: Lời báo xoá vĩnh viễn.** `companyConsequence`: `const deals = company.deals.length + company.archivedDeals.length; const contacts = company.contacts.length + company.archivedContacts.length;`. `deal-sheet.tsx`: `deal.contacts.length + deal.archivedContacts.length === 1 ? m.deal.person : m.deal.people`.
- [ ] **Step 7: Xanh**: lệnh Step 2 → PASS; `cd apps/app && bun test test/messages-guard.spec.ts` → PASS; `bun run check-types` → 0 lỗi; bài cũ `-t vdc-dai-bao` và `-t vdc-chi-doc` của `vong-doi-mot-cach-cat.dom.tsx` → PASS (dữ liệu giả cũ phải thêm `archivedContacts: []`/`archivedDeals: []` nếu kiểu đòi — sửa dữ liệu giả, không sửa phép đo).
- [ ] **Step 8: Bộ quét tĩnh**: lệnh `lqc_san_thiet_ke` của `_acceptance/config.yaml` → exit 0.
- [ ] **Step 9: Phá-thử** sau commit: bỏ `DongDaLuuTru` ở bảng Cá nhân của `deal-sheet.tsx` → đỏ «lqc: bang thoa thuan khong co dong gap»; cộng `archivedDeals` vào `openDeals` → đỏ «lqc: so lieu dau ngan tinh ban da cat»; khôi phục bằng `git checkout -- <tệp>`.
- [ ] **Step 10: Commit** `feat(lien-quan-loc-ban-da-cat): ngăn hiện «+n đã lưu trữ»`.

### Task 3: Kịch bản đo màn thật

independent: false (cần Task 1, 2) · phục vụ E15, E16

**Files:**
- Create: `_acceptance/lien-quan-loc-ban-da-cat/rang/man.mjs`

- [ ] **Step 1: Chép khung** `_acceptance/vong-doi-mot-cach-cat/rang/man.mjs` (đọc `APP_URL`/`API_URL`, đăng nhập phiên đo, Playwright, `--chieu-do`, in «<slug> man: dat»). Gốc kho suy từ `import.meta.dirname`, không hardcode.
- [ ] **Step 2: Ba bước** đúng `expected` của E15: gieo qua API thật (`companies.create`, `deals.create`, `contacts.create`, `*.archive`), mở `/companies?record=company:<id>`, tab Thoả thuận, đếm dòng, chụp 5 ảnh vào `_acceptance/lien-quan-loc-ban-da-cat/evidence/`, đo `scrollWidth <= clientWidth` ở 390. `--chieu-do`: mở công ty không có bản đã cất → thoát 1 với «man: khong thay dong gap».
- [ ] **Step 3: Chạy** `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/lien-quan-loc-ban-da-cat/rang/man.mjs"` → «lien-quan-loc-ban-da-cat man: dat»; chạy `--chieu-do` → đỏ đúng thông điệp.
- [ ] **Step 4: Commit** `test(lien-quan-loc-ban-da-cat): kịch bản đo màn`.
