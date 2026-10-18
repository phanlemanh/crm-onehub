# Tra cứu thương hiệu cho công ty Việt Nam — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chặn trang mạng xã hội ở ô tên miền và ở lượt tra, xin context.dev trả tiếng Việt, cho tra cứu lại thay phần máy điền chưa sửa, và hiện quốc gia theo ngôn ngữ người xem.

**Architecture:** Một mô-đun danh sách nền tảng trong `@crm/validation` dùng chung cho màn, API và tác nhân. Tác nhân parse phản hồi context.dev bằng schema Zod mới (thay kiểu `Brand` viết tay) và dùng raw lần trước để biết trường nào máy điền. Màn dịch tên quốc gia lúc hiển thị bằng `Intl.DisplayNames`.

**Tech Stack:** Bun test, Zod, Next/React 19, NestJS, Prisma, SDK `context.dev` 2.10.0.

**Spec:** `docs/superpowers/specs/2026-10-16-tra-cuu-thuong-hieu-viet-nam-design.md` · hợp đồng `_acceptance/tra-cuu-thuong-hieu-viet-nam/contract.md` · phép đo `_acceptance/tra-cuu-thuong-hieu-viet-nam/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã, kể cả mã sửa.
- Hằng số chỉnh được sống ở module cấu hình của khu (`apps/agent/agent/lib/context-config.ts`).
- Dữ liệu không kiểu (phản hồi context.dev, cột `Json` raw) parse bằng Zod ở biên, schema ở `packages/validation/src/`, nhập theo subpath; kiểu suy bằng `z.infer`.
- Giao diện chỉ dùng thành phần `@crm/ui` (`FieldError`, toast `sonner`); không `className` đổi màu/góc.
- `normalizeDomain` giữ nguyên (đường T3 gọi nó).
- Bài chạm DB chạy qua `bun run test -- "<lệnh>"` (kho thử riêng mỗi lượt); kho chạy song song nên đếm luôn có `where` của chính lượt.
- Danh sách 14 nền tảng đúng bảng ở thiết kế mục A.

## Review Focus

- Rep dán chuỗi viết hoa (`FACEBOOK.COM/Titan`) → vẫn nhận ra. Test ở Task 1.
- Rep dán `http://facebook.com` không `www`, có cổng (`facebook.com:443/x`) → vẫn nhận ra. Test ở Task 1.
- Raw cũ trong kho là phản hồi từ trước vòng (không có `force_language`) — vẫn parse được vì schema mọi trường tuỳ chọn. Test ở Task 4 (ca «mau du truong co null»).
- Rep sửa ô Quốc gia trong lúc giao diện hiện «Hoa Kỳ»: ô sửa mở ra giá trị lưu thật («United States»); lưu nguyên thì không gửi gì. Hành vi sẵn có của `InlineField` (so draft với value), không thêm test.
- `countryCode` không hợp lệ (`ZZ`, chuỗi rỗng) → `Intl.DisplayNames` ném hay trả mã — `tenQuocGia` trả `country` nguyên văn. Test ở Task 6.

---

### Task 1: Danh sách tên miền nền tảng (phục vụ E1; independent: true)

**Files:**
- Create: `packages/validation/src/ten-mien-nen-tang.ts`
- Create: `packages/validation/test/fixtures/ten-mien-nen-tang-dau-vao.json`
- Create: `packages/validation/test/ten-mien-nen-tang.spec.ts`
- Modify: `packages/validation/package.json` (thêm export `./ten-mien-nen-tang`)

**Interfaces:**
- Produces: `export const NEN_TANG: readonly { ten: string; tenMien: readonly string[] }[]` (đúng bảng thiết kế mục A, `as const`) · `export function nenTangCuaTenMien(dauVao: string | null | undefined): { ten: string; tenMien: string } | null` — `tenMien` là host đã rút.
- Fixture: `{"tao": ["https://www.facebook.com/titanmiennam", "zalo.me/123", "vn.linkedin.com/company/titan"], "tenNenTang": ["Facebook", "Zalo", "LinkedIn"]}`.

- [ ] **Step 1: Viết test** — các ca: `moi ten mien trong danh sach` (lặp `NEN_TANG`, khẳng định số ca = tổng số tên miền, mỗi ca trả đúng `ten`); `ten mien con` (`m.facebook.com`, `vn.linkedin.com`, `oa.zalo.me`, `www.tiktok.com`, `vt.tiktok.com`); `duong dan du` (`https://www.facebook.com/titanmiennam?ref=x` → Facebook, `zalo.me/123` → Zalo, `FACEBOOK.COM/Titan` → Facebook, `facebook.com:443/x` → Facebook); `ten mien trong giong` (`box.com`, `fbx.vn`, `myzalo.me`, `notx.com`, `facebook.com.vn.fake.vn` → null); `ten mien thuong` (`datxanh.vn`, `titanmiennam.vn`, `""`, `khong phai ten mien`, `null` → null); `khop hau to co dau cham` (dựng bản luật `endsWith` không dấu chấm từ `NEN_TANG` trong test, khẳng định bản đó nhận `box.com`, thông điệp `box.com bi nhan nham khi bo dau cham`); `fixture dau vao` (đọc fixture, ba chuỗi trả đúng ba tên).
- [ ] **Step 2: Chạy** `cd packages/validation && bun test ./test/ten-mien-nen-tang.spec.ts` → FAIL (mô-đun chưa có).
- [ ] **Step 3: Viết mô-đun.** Rút host: trim, lowercase, thêm `https://` khi thiếu scheme, `new URL().hostname`, bỏ `www.`; sai URL → null. Khớp: `host === m || host.endsWith("." + m)`.
- [ ] **Step 4: Chạy lại** → PASS. Phá-thử: sửa luật khớp thành `endsWith(m)` → ca `ten mien trong giong` đỏ gọi `box.com`; hoàn lại.
- [ ] **Step 5: Commit.**

### Task 2: API từ chối tên miền nền tảng (phục vụ E2, E4; independent: false — cần Task 1)

**Files:**
- Modify: `apps/api/src/companies/companies.service.ts` (create ~309, update ~383)
- Create: `apps/api/test/ten-mien-nen-tang.spec.ts`

**Interfaces:**
- Consumes: `nenTangCuaTenMien` từ `@crm/validation/ten-mien-nen-tang`.
- Thông điệp: `` `"${input}" is a ${ten} page, not the company's own website — leave the domain empty or use its own site.` `` qua `BadRequestException`.

- [ ] **Step 1: Viết test** dựng `CompaniesService` như `dien-thoai-o-deal-cong-ty.spec.ts`; tên `TEN = "Titan thu " + TEST_RUN_ID`. Khối `ac3`: create với `https://www.facebook.com/titanmiennam` và `vn.linkedin.com` → ném `BadRequestException` chứa `Facebook`/`LinkedIn`; đếm `company where { name: TEN }` = 0. Update công ty `tthv-thu-<run>.vn` sang `zalo.me/123` → ném, đọc lại domain không đổi. Đối chứng dương: create `tthv-that-<run>.vn` thành công; update sang `tthv-moi-<run>.vn` thành công. Khối `ac1-may-chu`: đọc fixture Task 1, mỗi chuỗi `tao` gửi create → ném; đếm theo `TEN` = 0.
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/api && bun test test/ten-mien-nen-tang.spec.ts"` → FAIL.
- [ ] **Step 3: Sửa service** — kiểm `nenTangCuaTenMien(input.domain)` trước `normalizeDomain` ở cả create và update.
- [ ] **Step 4: Chạy lại** → PASS.
- [ ] **Step 5: Commit.**

### Task 3: Tác nhân bỏ qua tên miền nền tảng và xin tiếng Việt (phục vụ E6, E7; independent: false — cần Task 1)

**Files:**
- Modify: `apps/agent/agent/lib/context-config.ts` (thêm `brandLanguage: "vietnamese"`)
- Modify: `apps/agent/agent/lib/context-dev.ts` (`brandByDomain`, `brandByEmail` truyền `force_language: CONTEXT.brandLanguage`)
- Modify: `apps/agent/agent/lib/brand.ts` (`runBrand` kiểm nền tảng ngay sau kiểm `company.domain`, trước `spend`)
- Create: `apps/agent/test/tra-cuu-thuong-hieu-viet-nam.spec.ts` (khối `ac5`, `ac6`)

**Interfaces:**
- Lý do SKIPPED: `` `${domain} is a ${ten} page, not the company's own site.` ``
- Bộ fetch giả trong test: thay `globalThis.fetch`; yêu cầu tới `https://api.context.dev/v1/brand/retrieve` (POST, thân JSON) được ghi lại; phản hồi `Response.json(phanHoi)` với `phanHoi satisfies BrandRetrieveResponse` (nhập kiểu từ `context.dev/resources/brand`). Yêu cầu khác → 404.

- [ ] **Step 1: Viết test.** `ac5`: ghi khoá bằng `writeContextDevKey(db, "ctx-thu")` (khôi phục khoá cũ ở afterAll); công ty `facebook.com` (xoá trước nếu có) → `runBrand({companyId, spend})` rồi `runBrand({companyId, fresh: true, spend})`: 0 yêu cầu, `spend` không gọi, `enrichmentStatus` SKIPPED, `enrichmentError` chứa `Facebook`. Đối chứng dương `tthv-that-<run>.vn`: 1 yêu cầu, spend 1 lần. Ca email: `new CompanyDirectoryService` không có ở agent — tạo công ty `linkedin.com` bằng `db.company.create` với `source` giống đường thư mục, `runBrand` → 0 yêu cầu, SKIPPED, `LinkedIn`. `ac6`: `brandByDomain("tthv-that.vn")`, `brandByEmail("a@tthv-that.vn")` → thân yêu cầu có `force_language === CONTEXT.brandLanguage`; `CONTEXT.brandLanguage === "vietnamese"`. Chiều đỏ: `new ContextDev({apiKey}).brand.retrieve({type:"by_domain", domain:"x.vn"})` → thân không có `force_language` (`thieu force_language`).
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/agent && bun test test/tra-cuu-thuong-hieu-viet-nam.spec.ts"` → FAIL.
- [ ] **Step 3: Sửa ba tệp.**
- [ ] **Step 4: Chạy lại** → PASS (phần ac5/ac6).
- [ ] **Step 5: Commit.**

### Task 4: Schema raw và tra cứu lại thay phần máy điền (phục vụ E8; independent: false)

**Files:**
- Create: `packages/validation/src/brand-raw.ts` (+ export `./brand-raw`)
- Modify: `apps/agent/agent/lib/context-dev.ts` (xoá `type Brand` viết tay, dùng `Brand` từ schema; `lookup` parse `response.brand` bằng schema, hỏng → `failed` lý do `unreadable brand response: <zod>`)
- Modify: `apps/agent/agent/lib/brand-mapping.ts` (`brandToUpdate(brand, current, mayDien?)`, `stillFillable(update, current, mayDien?)`)
- Modify: `apps/agent/agent/lib/brand.ts` (đọc `companyEnrichment.raw`, tính `mayDien`)
- Test: cùng tệp Task 3, khối `ac7`

**Interfaces:**
- Produces: `export const brandSchema` (mọi trường `.nullish()`, khớp kiểu `Brand` cũ), `export type Brand = z.infer<typeof brandSchema>`, `export const brandRawSchema = z.object({ brand: brandSchema.nullish() }).passthrough()`, `export function docBrandRaw(raw: unknown): { ok: true; brand: Brand | null } | { ok: false; loi: string }`.
- `mayDien: ReadonlySet<keyof CompanySnapshot>` = các khoá có `giáTrịHiệnTại === brandToUpdate(brandCu, snapshotRong)[khoá]`, trừ `name` và các khoá ảnh (`logoUrl`, `logoDarkUrl`, `iconUrl`, `iconDarkUrl`, `iconTone`).
- Raw hỏng: `console.warn(\`brand raw unreadable: ${loi}\`)`, `mayDien` rỗng.

- [ ] **Step 1: Viết test `ac7`** theo E8: lượt 1 brand A, rep sửa industry và gõ phone, lượt 2 brand B → kiểm từng ô; ca `mau du truong co null`; ca `raw hong khuon` (ghi đè `companyEnrichment.raw = {brand: 7}`, bắt `console.warn` bằng `spyOn`, tiền tố `brand raw unreadable:`; đối chứng: raw đúng khuôn không có dòng đó).
- [ ] **Step 2: Chạy** → FAIL.
- [ ] **Step 3: Viết schema, sửa ba tệp.**
- [ ] **Step 4: Chạy** test tác nhân + `cd apps/agent && bun run check-types` → PASS.
- [ ] **Step 5: Commit.**

### Task 5: Màn chặn tên miền nền tảng (phục vụ E3, E5, E11; independent: false — cần Task 1)

**Files:**
- Modify: `apps/app/lib/messages/companies.ts` (thêm `nenTang: (ten: string) => string` vào cả `en` và `vi`; sửa `create.domainHint` hai bản)
- Modify: `apps/app/app/(app)/[slug]/companies/create-company-sheet.tsx`
- Modify: `apps/app/components/crm/record-sheet/company-sheet.tsx` (onSave của ô Tên miền)
- Create: `apps/app/test/tra-cuu-thuong-hieu-viet-nam.dom.tsx` (khối `ac1`, `ac2`)

**Interfaces:**
- Câu (vi): `` `Đây là trang ${ten}, không phải trang web của công ty. Để trống nếu công ty chưa có trang web riêng.` `` · (en): `` `This is a ${ten} page, not the company's own website. Leave it empty if the company has no site of its own.` ``
- `domainHint` (vi): «Dán cả đường dẫn cũng được — hệ thống rút về tên miền gốc, và tên miền đó phải là duy nhất. Trang Facebook, Zalo hay LinkedIn không dùng được ở đây.» · (en): «A full URL is fine — it is reduced to the bare host, which has to be unique. Facebook, Zalo or LinkedIn pages are not accepted here.»
- Sheet: state `loiTenMien: string | null`; submit → `nenTangCuaTenMien(domain)` có → đặt lỗi, focus ô, không `mutate`; `onChange` xoá lỗi. `Input aria-invalid` + `aria-describedby={loiId}`; `<FieldError id={loiId}>`.
- Ngăn: `onSave={(domain) => { const nt = nenTangCuaTenMien(domain); if (nt) { toast.error(companyMessages(locale).nenTang(nt.ten)); return; } save({ domain }); }}`.
- Test tự dựng hàm `moVoi(man, locale)` (bản sao `mo` của `khung-gop-y.tsx` với `LocaleProvider locale` theo tham số), nhập `khung-gop-y` để có tRPC giả; bắt toast bằng `mock.module("sonner", …)` giữ thật trừ `toast.error`.

- [ ] **Step 1: Viết test** `ac1` (3 đầu vào × vi/en; 0 lời gọi `companies.create`; `aria-invalid="true"`; dòng lỗi có id trùng `aria-describedby`, text `toBe(companyMessages(l).nenTang(ten))`; gõ thêm → mất; đối chứng `titanmiennam.vn` gọi 1 lần) và `ac2` (ngăn công ty, sửa ô thành đường dẫn Facebook, 0 lời gọi `companies.update`, `toast.error` nhận `toBe(companyMessages(l).nenTang("Facebook"))`, ô vẫn `titanmiennam.vn`; đối chứng `titan-moi.vn` gọi 1 lần).
- [ ] **Step 2: Chạy** `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tra-cuu-thuong-hieu-viet-nam.dom.tsx` → FAIL.
- [ ] **Step 3: Sửa ba tệp.**
- [ ] **Step 4: Chạy lại** → PASS.
- [ ] **Step 5: Commit.**

### Task 6: Tên quốc gia theo ngôn ngữ người xem (phục vụ E9; independent: true)

**Files:**
- Create: `apps/app/lib/ten-quoc-gia.ts`
- Modify: `apps/app/components/crm/record-sheet/company-sheet.tsx` (`location` ở ~184; `render` của ô Quốc gia)
- Test: cùng tệp Task 5, khối `ac8`

**Interfaces:**
- Produces: `export function tenQuocGia(country: string | null, countryCode: string | null, locale: Locale): { ten: string; dich: boolean } | null` — `dich` true khi đã thay bằng tên Intl.
- Ô Quốc gia: `render={() => ...}` hiện `ten`; `dich === false` bọc `<span translate="no">`. `location` ghép `tenQuocGia(...)?.ten`.

- [ ] **Step 1: Viết test `ac8`** theo bảng E9 (+ `ZZ`, `""` → nguyên văn) và render ngăn vi/en.
- [ ] **Step 2: Chạy** → FAIL.
- [ ] **Step 3: Viết hàm** — `new Intl.DisplayNames(["en"], {type:"region"}).of(code)` so không phân biệt hoa thường với `country`; khớp → `of` theo `locale`; mọi ngoại lệ → nguyên văn.
- [ ] **Step 4: Chạy** → PASS.
- [ ] **Step 5: Commit.**

### Task 7: Bàn chụp ui-check (phục vụ E10; independent: false — cần Task 5, 6)

**Files:**
- Create: `_acceptance/tra-cuu-thuong-hieu-viet-nam/rang/chup.mjs`

**Interfaces:**
- Theo khuôn `_acceptance/zalo-gui-hong-ghi-ly-do/rang/chup.mjs`: cảnh cây trước, puppeteer qua `createRequire`, `APP_URL`/`API_URL` từ `tien-de.mjs`; tạo công ty qua tRPC của bàn đo (`companies.create` rồi `companies.update` đặt `country`, `countryCode`); mở ngăn bằng bấm dòng; ngôn ngữ qua cookie `lang`. In dòng `E10 …` cho từng kiểm (văn bản dòng phụ, ô Quốc gia, dòng lỗi, `scrollWidth <= clientWidth`), ảnh ra `evidence/E10-*.png`.

- [ ] **Step 1: Viết script.**
- [ ] **Step 2: Chạy** lệnh `executors.script.tthv_chup` → mọi dòng `E10` đạt, ảnh có.
- [ ] **Step 3: Mở ảnh soát bằng mắt.**
- [ ] **Step 4: Commit** (script; ảnh để S4 sinh).

### Task 8: Bộ chứng của kho

- [ ] **Step 1:** `bun run check-types`, `bun run lint`, `bun run lint:slop` ở gốc → xanh.
- [ ] **Step 2:** Đặt hợp đồng `status: implemented`, commit.
