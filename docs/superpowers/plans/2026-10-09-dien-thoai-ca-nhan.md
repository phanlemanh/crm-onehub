# Số điện thoại cho cá nhân — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sale nhập được số điện thoại lúc tạo cá nhân, thấy số ở bảng và ngăn chi tiết, tìm được theo số ở bảng Cá nhân / ⌘K / Kara / ô chọn môi giới, và một số không thuộc về hai người đang hoạt động.

**Architecture:** Một mô-đun thuần `packages/validation/src/so-dien-thoai.ts` (đọc, hiện, mảnh tìm) dùng chung cho app và API. Một mô-đun SQL `packages/db/src/so-dien-thoai.ts` so «số quốc nội» tính tại chỗ để tìm và chống trùng trên cả số cũ lưu thô — không migration. API chuẩn hoá + chặn trùng; app thêm ô, cột, gợi ý; agent tìm theo số mà không trả số.

**Tech Stack:** Bun test, Zod 4, Prisma `$queryRaw`, NestJS + nestjs-trpc, Next.js client components, `@crm/ui`.

**Spec:** `docs/superpowers/specs/2026-10-09-dien-thoai-ca-nhan-design.md` · hợp đồng `_acceptance/dien-thoai-ca-nhan/contract.md` · evals `_acceptance/dien-thoai-ca-nhan/evals.yaml`

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Không migration, không đụng `packages/db/prisma/**` (đường T3).
- Hằng số gom trong `SO_DIEN_THOAI` (một chỗ, `as const`).
- Giao diện chỉ dùng `@crm/ui`; ô số `type="tel" inputMode="tel"`; lỗi cạnh ô bằng `FieldError`.
- Client component không nhập `@crm/db`; `@crm/validation/so-dien-thoai` là hàm thuần nên được nhập.
- Câu lỗi API tiếng Anh theo nếp kho: `That is not a phone number.` và `<tên> already uses <số hiện>.`
- Chuỗi giao diện qua `apps/app/lib/messages/*` cả `en` và `vi`; số hiển thị mang `translate="no"`.
- DOM test: `expect` chỉ so giá trị nguyên thuỷ (luật 35 của đợt).

## Review Focus

- Số cũ lưu thô (`0901.234.567`) phải hiện đẹp, tìm được và chặn trùng được — mọi bài kiểm API ghi số thô THẲNG vào CSDL làm fixture.
- Người đã trùng số từ trước vẫn sửa được trường khác — Task 3 ca A2/C2.
- Gõ «12» không lọc ra mọi người có chữ số 12 — Task 1 `manh-tim` và Task 3 `tim-bang`.
- Kara không lộ số qua kết quả tìm — Task 5 kiểm cả khoá lẫn chuỗi JSON.
- Lỗi trùng không xoá chữ đã gõ — Task 6 `trung-giu-chu`.

---

### Task 1: Mô-đun đọc/hiện số dùng chung

**Files:**
- Create: `packages/validation/src/so-dien-thoai.ts`
- Modify: `packages/validation/package.json` (exports `"./so-dien-thoai": "./src/so-dien-thoai.ts"`)
- Test: `packages/validation/test/so-dien-thoai.spec.ts`

**Interfaces — Produces:**
- `SO_DIEN_THOAI = { quocNoi: { min: 9, max: 10 }, e164: { min: 8, max: 15 }, timToiThieu: 4 } as const`
- `type DocSo = { kind: "rong" } | { kind: "ok"; so: string } | { kind: "sai" }`
- `docSoDienThoai(raw: string): DocSo`
- `hienThiSoDienThoai(raw: string): string`
- `soQuocNoiDeTim(term: string): string | null`
- `soQuocNoi(so: string): string` (bỏ `+84`/`84`/`0` đầu khi đúng độ dài VN, còn lại trả chữ số)

Phục vụ E4. `independent: true`.

- [ ] Step 1: viết `so-dien-thoai.spec.ts` với ba describe `doc-so` (14 dòng), `hien-so` (5 dòng), `manh-tim` (5 dòng) đúng ma trận E4; mỗi dòng một `test.each` có thông điệp ghim `doc-so: <đầu vào>` / `hien-so: <đầu vào>` / `manh-tim: <đầu vào>`.
- [ ] Step 2: `cd packages/validation && bun test test/so-dien-thoai.spec.ts` → FAIL (chưa có mô-đun).
- [ ] Step 3: viết mô-đun:

```ts
export const SO_DIEN_THOAI = {
	quocNoi: { min: 9, max: 10 },
	e164: { min: 8, max: 15 },
	timToiThieu: 4,
	maVn: "84",
} as const;

export type DocSo = { kind: "rong" } | { kind: "ok"; so: string } | { kind: "sai" };

const NGAN_CACH = /[\s.\-()]/g;
const QN = `[0-9]{${SO_DIEN_THOAI.quocNoi.min},${SO_DIEN_THOAI.quocNoi.max}}`;
const VN_KHONG = new RegExp(`^0(${QN})$`);
const VN_84 = new RegExp(`^\\+?${SO_DIEN_THOAI.maVn}(${QN})$`);
const QUOC_TE = new RegExp(`^\\+([0-9]{${SO_DIEN_THOAI.e164.min},${SO_DIEN_THOAI.e164.max}})$`);

export function docSoDienThoai(raw: string): DocSo {
	const gon = raw.replace(NGAN_CACH, "");
	if (gon === "") return { kind: "rong" };
	const vn = VN_KHONG.exec(gon) ?? VN_84.exec(gon);
	if (vn) return { kind: "ok", so: `+${SO_DIEN_THOAI.maVn}${vn[1]}` };
	const qt = QUOC_TE.exec(gon);
	if (qt) return { kind: "ok", so: `+${qt[1]}` };
	return { kind: "sai" };
}
```

`hienThiSoDienThoai`: `docSoDienThoai(raw)`; không `ok` → trả `raw`; `ok` mà bắt đầu `+84` → `0` + quốc nội, nhóm 4-3-3 khi 9 chữ số quốc nội (di động), 3-4-4 khi 10 (cố định); số khác → `so`.
`soQuocNoi(so)`: chữ số của `so`; khớp `^84(QN)$` hoặc `^0(QN)$` → nhóm 1; còn lại nguyên.
`soQuocNoiDeTim(term)`: `/[^0-9+\s.\-()]/` có mặt → `null`; chữ số < `timToiThieu` → `null`; bỏ đầu `84` khi còn ≥ 9 chữ số sau đó, hoặc bỏ đầu `0`; trả chuỗi chữ số.
- [ ] Step 4: chạy lại → PASS. Phá-thử: bỏ nhánh `VN_84` trong bản sao → dòng `doc-so: 84901234567` đỏ; hoàn lại.
- [ ] Step 5: commit `feat: mô-đun đọc và hiện số điện thoại dùng chung`.

### Task 2: Truy vấn số quốc nội trên CSDL

**Files:**
- Create: `packages/db/src/so-dien-thoai.ts`
- Modify: `packages/db/package.json` (exports `"./so-dien-thoai"`)

**Interfaces:**
- Consumes: `soQuocNoi` (Task 1).
- Produces: `caNhanCoSo(db: PrismaClient | Prisma.TransactionClient, manh: string): Promise<string[]>` · `caNhanTrungSo(db, so: string, opts: { boQua?: string }): Promise<{ id: string; firstName: string; lastName: string | null } | null>`

Biểu thức SQL dùng chung (Prisma.sql):

```sql
case
  when regexp_replace(phone, '[^0-9]', '', 'g') ~ '^84[0-9]{9,10}$' then substr(regexp_replace(phone, '[^0-9]', '', 'g'), 3)
  when regexp_replace(phone, '[^0-9]', '', 'g') ~ '^0[0-9]{9,10}$' then substr(regexp_replace(phone, '[^0-9]', '', 'g'), 2)
  else regexp_replace(phone, '[^0-9]', '', 'g')
end
```

`caNhanCoSo`: `select id from contact where phone is not null and <biểu thức> like '%' || ${manh} || '%' limit 500`.
`caNhanTrungSo`: `... where "archivedAt" is null and phone is not null and <biểu thức> = ${soQuocNoi(so)} and id <> coalesce(${boQua}, '') limit 1`.

Phục vụ E8, E9, E11, E12, E13 (đo qua Task 3–5). `independent: false` (cần Task 1). Verify: `bun run check-types --filter=@crm/db`.

- [ ] Step 1: viết mô-đun; Step 2: type-check; Step 3: commit `feat: truy vấn cá nhân theo số quốc nội`.

### Task 3: API cá nhân — chuẩn hoá, chặn trùng, cột, tìm

**Files:**
- Modify: `apps/api/src/contacts/contacts.contracts.ts` (refine `phone` ở create/update; `contactRowOutput.phone`)
- Modify: `apps/api/src/contacts/contacts.service.ts` (`create`, `update`, `list` select, `searchFilter`)
- Test: `apps/api/test/dien-thoai-ca-nhan.spec.ts`

**Interfaces:** Consumes Task 1, Task 2. Produces `ContactRow.phone: string | null`.

Phục vụ E2, E2b, E6, E7, E8, E9, E11. `independent: false`.

- [ ] Step 1: spec theo khuôn `apps/api/test/bulk.spec.ts` (dựng `ContactsService` với stub agent, hậu tố `TEST_RUN_ID`, dọn theo tên). Bốn describe: `tao-chuan-hoa` (4 dòng E2 + `source` MANUAL), `so-sai` (safeParse + router `createCaller` BAD_REQUEST, đếm trước/sau), `trung-tao` + `trung-sua` (fixture ghi THẲNG `db.contact.create` với số thô; A2/C2 cùng `0907.654.321`), `tim-bang` (P, Q thô, R tên chứa «12»).
- [ ] Step 2: `bun run test -- "cd apps/api && bun test test/dien-thoai-ca-nhan.spec.ts"` → FAIL.
- [ ] Step 3: contracts — `const phoneInput = z.string().trim().refine((v) => docSoDienThoai(v).kind !== "sai", "That is not a phone number.")`; create `phone: phoneInput.optional()`, update `phone: phoneInput.optional()`; `contactRowOutput` thêm `phone: z.string().nullable()`.
- [ ] Step 4: service —
  - hàm riêng `soDaDoc(raw?: string): string | null` (`ok` → `so`, `rong`/vắng → `null`).
  - `create`: `const phone = soDaDoc(input.phone)`; có `phone` → `caNhanTrungSo(this.db, phone, {})` → `ConflictException(\`${nameOf(trung)} already uses ${hienThiSoDienThoai(phone)}.\`)`; ghi `phone`.
  - `update`: chỉ khi `input.phone !== undefined`: `phone = soDaDoc(input.phone)`; đọc `phone` hiện có của `id`; `phone !== null && soQuocNoi(phone) !== soQuocNoi(hienCo ?? "")` → kiểm `caNhanTrungSo(this.db, phone, { boQua: id })`; `data.phone = phone`.
  - `list` select thêm `phone: true`, map ra `phone`.
  - `searchFilter` thành `async` hoặc nhận thêm `ids`: ở `list` tính `const manh = soQuocNoiDeTim(input.q)`; `manh` → `ids = await caNhanCoSo(this.db, manh)`; OR thêm `{ id: { in: ids } }`.
- [ ] Step 5: chạy spec → PASS. Phá-thử theo CHIỀU ĐỎ của E2, E8, E9, E11 trên bản sao từng chỗ; hoàn lại sau mỗi lần.
- [ ] Step 6: `bun run check-types` sạch; commit `feat: API cá nhân chuẩn hoá số, chặn trùng, tìm theo số`.

### Task 4: ⌘K tìm theo số

**Files:** Modify `apps/api/src/search/search.service.ts`; Test thêm describe `tim-cmdk` vào `apps/api/test/dien-thoai-ca-nhan.spec.ts`.

Phục vụ E12. `independent: false` (Task 2, spec của Task 3).

- [ ] Step 1: describe `tim-cmdk` (P có công ty → detail tên công ty; P2 không công ty → detail `0907 654 321`). FAIL.
- [ ] Step 2: trong truy vấn cá nhân: `manh` → OR thêm `{ id: { in: ids } }`; select thêm `phone`; `detail: contact.company?.name ?? (contact.phone ? hienThiSoDienThoai(contact.phone) : contact.email)`.
- [ ] Step 3: PASS; phá-thử bỏ nhánh số → đỏ «tim-cmdk: thieu P»; commit `feat: tìm nhanh theo số điện thoại`.

### Task 5: Kara tìm theo số, không trả số

**Files:** Modify `apps/agent/agent/lib/lookup.ts` (`searchContacts`); Test `apps/agent/test/tim-theo-so.integration.spec.ts` (khuôn `lookup.integration.spec.ts`).

Phục vụ E13. `independent: false` (Task 2).

- [ ] Step 1: spec 3 dòng E13 (tìm `0901234567` có P; mọi hit không có khoá `phone` và JSON không chứa `901234567`; tìm theo tên vẫn ra P). FAIL dòng 1.
- [ ] Step 2: `searchContacts`: `manh = soQuocNoiDeTim(term)`; `ids = manh ? await caNhanCoSo(db, manh) : []`; OR thêm `{ id: { in: ids } }`; điểm của dòng có id trong `ids` = 4. Không thêm `phone` vào select.
- [ ] Step 3: `bun run test -- "cd apps/agent && bun test test/tim-theo-so.integration.spec.ts"` PASS; phá-thử thêm `phone` vào hit → dòng 2 đỏ; commit `feat: Kara tìm cá nhân theo số`.

### Task 6: Hai form tạo — ô Điện thoại, chặn số sai, giữ chữ khi trùng

**Files:**
- Modify: `apps/app/components/crm/record-sheet/quick-add.tsx` (`QuickAddContact`)
- Modify: `apps/app/app/(app)/[slug]/contacts/create-contact-sheet.tsx`
- Modify: `apps/app/lib/messages/record-sheet.ts` (`contact.phone`, `contact.phonePlaceholder`, `contact.phoneInvalid`), `apps/app/lib/messages/contacts.ts` (`create.phone`, `create.phonePlaceholder`, `create.phoneInvalid`)
- Test: `apps/app/test/dien-thoai-ca-nhan.dom.tsx` (describe `gui-so`, `so-sai`, `trung-giu-chu`)

Phục vụ E3, E5, E21. `independent: false` (Task 1).

Chuỗi vi: nhãn «Điện thoại», gợi ý «0901 234 567», lỗi «Số điện thoại chưa đúng — ví dụ 0901 234 567». en: «Phone», «0901 234 567», «That is not a phone number — for example 0901 234 567».

- [ ] Step 1: DOM spec theo khuôn `ngan-ban-ghi-giu.dom.tsx` (mock `@/lib/trpc/client` trả `mutationOptions` ghi đối số; mock `sonner`). FAIL.
- [ ] Step 2: QuickAddContact — thêm `phone` vào `useNhap`, ô sau Họ (`type="tel" inputMode="tel" autoComplete="off"`, `aria-invalid` khi lỗi), `const [loiSo, datLoiSo] = useState(false)` và ref ô; `onSubmit`: `docSoDienThoai(phone).kind === "sai"` → `datLoiSo(true)`, focus, return; ngược lại gửi `phone: phone || undefined`. `FieldError` dưới ô khi `loiSo`; gõ lại thì `datLoiSo(false)`. `onError` giữ nguyên (không reset).
- [ ] Step 3: CreateContactSheet — cùng cách; thứ tự Tên, Họ, Điện thoại, Email…; reset `phone` trong `onSuccess`.
- [ ] Step 4: chạy ba describe → PASS; phá-thử theo CHIỀU ĐỎ E3, E5, E21; commit `feat: ô Điện thoại ở hai form tạo cá nhân`.

### Task 7: Hiện số — bảng, ngăn chi tiết, gợi ý môi giới

**Files:**
- Modify: `apps/app/app/(app)/[slug]/contacts/contacts-table.tsx` (cột `phone` ngay sau `name`, ẩn dưới `md`, `tabular-nums`, `translate="no"`)
- Modify: `apps/app/lib/messages/contacts.ts` (`headers.phone`)
- Modify: `apps/app/components/crm/record-sheet/contact-sheet.tsx` (ô thống kê và `InlineField` hiện `hienThiSoDienThoai`, `tel:` dùng `docSoDienThoai(...).so` hoặc chuỗi gốc)
- Modify: `apps/app/app/(app)/[slug]/onboarding/[planId]/them-moi-gioi.tsx` (`hint: daCo ? … : c.phone ? hienThiSoDienThoai(c.phone) : (c.email ?? undefined)`)
- Test: `apps/app/test/dien-thoai-ca-nhan.dom.tsx` (describe `cot-bang`, `ngan-chi-tiet`, `goi-y-moi-gioi`)

Phục vụ E10, E14. `independent: false` (Task 1, Task 3 output).

- [ ] Step 1: spec FAIL; Step 2: sửa ba tệp; Step 3: PASS + phá-thử CHIỀU ĐỎ E10, E14; Step 4: commit `feat: hiện số điện thoại ở bảng, ngăn chi tiết, gợi ý môi giới`.

### Task 8: Đo màn thật và sàn thiết kế

**Files:** Create `_acceptance/dien-thoai-ca-nhan/rang/do-man.mjs` (khuôn `_acceptance/menu-con-loc-dien-thoai/rang/do-man.mjs`: puppeteer-core, `canhCay`, `dev:session`, `MA_TRAN` 7 ô, dòng `DUNG|SAI`, `KET LUAN`, ảnh vào `BANG_CHUNG`).

Phục vụ E1, E15–E20. `independent: false`.

- [ ] Step 1: viết `do-man.mjs` với bảy ô `them-tab-1440`, `them-tab-375`, `tao-sheet-1440`, `so-sai-375`, `bang-1440`, `tim-bang-1440`, `cmdk-1440`; mã luợt để tên và số riêng, dọn cá nhân đã tạo khi xong.
- [ ] Step 2: chạy `dt_do_man` một lần ngoài S4 (xin khoá nếu luật đợt đòi) — chỉ để gỡ lỗi kịch bản; S4 mới là lượt chấm.
- [ ] Step 3: chạy `dt_san_thiet_ke` → không P0.
- [ ] Step 4: `bun run check-types`, `bun run lint`, `bun run lint:slop` sạch; commit `test: đo màn số điện thoại`.

## Self-review

- Mọi AC có task: AC-1/2 (T3, T6, T8) · AC-3 (T1) · AC-4 (T3, T6, T8) · AC-5 (T3, T6) · AC-6 (T3, T6) · AC-7 (T3) · AC-8 (T7, T8) · AC-9 (T3, T8) · AC-10 (T4, T8) · AC-11 (T5) · AC-12 (T7) · AC-13 (T8).
- Tên dùng xuyên task: `docSoDienThoai`, `hienThiSoDienThoai`, `soQuocNoi`, `soQuocNoiDeTim`, `caNhanCoSo`, `caNhanTrungSo`, `SO_DIEN_THOAI`.
