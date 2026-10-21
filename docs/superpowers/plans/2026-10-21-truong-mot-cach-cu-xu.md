# Một trường, một cách cư xử (DA14) — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (main loop, tuần tự). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một bảng đăng ký theo kiểu trường vẽ mọi giá trị trường trên ba phiếu và ba bảng, cho cả trường chuẩn lẫn tự tạo.

**Architecture:** Hai tệp mới trong `apps/app/components/crm/fields/`:
- `doc-nhap.ts`: hàm thuần đọc chuỗi người gõ và trình bày số;
- `kieu-truong.tsx`: bảng `KIEU_TRUONG` và ba điểm vào `OTruongPhieu`, `OTruongBang`, `HienThiTruong`.

Ba phiếu khai trường chuẩn thành bộ mô tả qua hàm xuất, và đổi trường tự tạo sang bộ mô tả bằng `moTaTruongTuTao`. Ba bảng dùng `OTruongBang` trong `cell`. Không chạm `packages/ui`.

**Tech Stack:** Next (apps/app), React 19, tRPC (nestjs-trpc), bun test với happy-dom (`packages/ui/test/setup-dom.ts`), Prisma.

**Spec:** `docs/superpowers/specs/2026-10-21-truong-mot-cach-cu-xu-design.md` · hợp đồng `_acceptance/truong-mot-cach-cu-xu/contract.md` (approved) · `evals.yaml`.

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Không chạm `packages/ui`, `apps/agent`, `packages/db/prisma`.
- `apps/app/lib/messages/*.ts` chỉ thêm dòng. Ngoại lệ là hai dòng đã duyệt `cham-tep` V1-9, chỉ phần tiếng Việt:
  - `crm.ts` `createHint` → «Tạo trường để Kara tra cứu và điền sẵn.»;
  - `kara-ban-ghi.ts` `set_field_value` → «Điền một trường».
- Câu lỗi tiếng Việt theo khuôn «Ô này nhận …, ví dụ …». Câu của Số chứa «1.234,5».
- Số hiển thị: `Intl.NumberFormat(locale, { maximumFractionDigits: 20 })`, `tabular-nums`, `translate="no"`.
- Liên kết: thêm `https://` khi thiếu giao thức, `target="_blank"`, `rel="noreferrer noopener"`.
- Lỗi máy chủ ở lượt lưu một trường: «Chưa lưu được <nhãn>.» + " " + câu của mã (`lua-chon`, `nguoi`, `khac`).
- Cột bảng giữ nguyên `id`, `header`, `width`, `hideBelow`, `sortable` như onehub `37e7bf27c`.
- Mã: tên tiếng Việt không dấu theo nếp kho (`docSoNhap`, `OTruongPhieu`).

## Review Focus

- Người dán số có khoảng trắng hai đầu («  1.234,5 ») → lưu 1234.5. Ghim trong test `tmc-doc-so` (Task 1).
- Ô Số đang mở mà người bấm Esc sau khi gõ sai → về giá trị cũ, câu lỗi biến mất. Ghim trong `tmc-loi-nhap` (Task 2).
- Liên kết có giao thức lạ (`javascript:alert(1)`) → không thành `href` chạy được; hiện chữ trơn. Ghim trong `tmc-lien-ket` (Task 2).
- Trường USER trỏ người đã rời đội → hiện «—» ở bảng và «Thành viên cũ» ở ô chọn phiếu, như nay. Ghim trong `tmc-o-bang` (Task 2).
- Phiếu đã lưu trữ → mọi ô khoá như nay (`KhoaLuuTru`). Kiểm bằng mắt ở E9; không thêm test.

---

### Task 1: Đọc nhập và trình bày số (`doc-nhap.ts`) + câu lỗi

**Files:**
- Create: `apps/app/components/crm/fields/doc-nhap.ts`
- Modify: `apps/app/lib/messages/crm.ts` (thêm khối `truongKieu` ở cả `en` và `vi`, chỉ thêm dòng)
- Test: `apps/app/test/truong-mot-cach.spec.ts` (describe `tmc-doc-so`)

**Interfaces — Produces:**
- `type KieuTruong = FieldTypeName | "MONEY"`.
- `type MaTuChoi = "trong" | "so" | "locale-khac" | "email" | "lien-ket" | "dien-thoai" | "lua-chon" | "nguoi" | "khac"`.
- `type DocNhap<T> = { kind: "rong" } | { kind: "ok"; giaTri: T } | { kind: "tu-choi"; ma: MaTuChoi }`.
- `docSoNhap(chuoi: string, locale: Locale): DocNhap<number>`, cùng cách `moneySeparators` của `@crm/ui/lib/money-input`: nhận dấu âm, nhận phần thập phân dài.
- `hienThiSo(so: number, locale: Locale): string`.
- `docNhapTheoKieu(kieu: KieuTruong, chuoi: string, locale: Locale): DocNhap<string | number>`:
  - EMAIL theo `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`;
  - URL cần một dấu chấm trong phần máy chủ;
  - PHONE qua `docSoDienThoai`;
  - TEXT, LONG_TEXT luôn ok.
- `hrefLienKet(kieu: "URL" | "EMAIL" | "PHONE", giaTri: string): string | null` — `javascript:` hay giao thức khác http(s) → `null`.
- `crmMessages(locale).truongKieu`: `{ tuChoi: Record<MaTuChoi, string>, trong: (nhan) => string, chuaLuu: (nhan) => string, sua: (nhan) => string, mo: (nhan) => string }`.
  - Câu tiếng Việt của `so`: «Ô này nhận số, ví dụ 1.234,5».
  - Câu tiếng Việt của `trong`: «<nhãn> không được để trống».

- [ ] Step 1: Viết test `tmc-doc-so`. Ma trận 12 ô của E2, cộng ca khoảng trắng hai đầu. Ba ô `hienThiSo` (1234.5 vi/en, 0.000123 vi), cộng 0.0000001 vi → «0,0000001».
- [ ] Step 2: `cd apps/app && bun test ./test/truong-mot-cach.spec.ts -t tmc-doc-so` → FAIL (import hỏng).
- [ ] Step 3: Viết `doc-nhap.ts` và khối messages.
- [ ] Step 4: Chạy lại → PASS. Đột biến tay: `hienThiSo` dùng `maximumFractionDigits: 6` → ô 0,0000001 đỏ với 'tmc hien so'. Hoàn lại.
- [ ] Step 5: Commit.

Phục vụ E2. `independent: false` (Task 2 dùng).

### Task 2: Bảng đăng ký kiểu (`kieu-truong.tsx`)

**Files:**
- Create: `apps/app/components/crm/fields/kieu-truong.tsx`
- Test: `apps/app/test/truong-mot-cach.dom.tsx` (describe `tmc-loi-nhap`, `tmc-o-tich`, `tmc-lien-ket` phần bảng đăng ký, `tmc-o-bang` phần ma trận ô)

**Interfaces — Consumes:** Task 1. **Produces:**

```ts
export type MoTaTruong = {
  khoa: string; nhan: string; kieu: KieuTruong; giaTri: string | number | boolean | null;
  batBuoc?: boolean; luaChon?: { value: string; label: string }[]; tienTe?: string;
  nguoiDung?: Map<string, Owner>; trinhBay?: (giaTri: string) => React.ReactNode;
  goiYTrong?: string; rong?: boolean;
  luu: (giaTri: string | number | boolean | null) => void; dangLuu?: boolean;
  nguon?: React.ReactNode;
};
export const KIEU_TRUONG: Record<KieuTruong, { hienThi; suaTaiCho; oBang }>;
export function OTruongPhieu(props: { moTa: MoTaTruong }): JSX.Element;
export function OTruongBang(props: { kieu: KieuTruong; giaTri; tienTe?; luaChon?; nguoiDung?: Map<string, Owner>; nguoi?: Owner | null; trinhBay? }): JSX.Element;
export function HienThiTruong(same props as OTruongBang): JSX.Element;
export function moTaTruongTuTao(field: RecordFieldEntry, luu: (khoa, giaTri) => void, dangLuu: (khoa) => boolean, nguoiDung): MoTaTruong;
export function loiLuuTruong(moTa: Pick<MoTaTruong,"nhan"|"kieu">, locale: Locale): string;
```

Cách dựng từng phần:
- `suaTaiCho` gọi lại các ô `Inline*` có sẵn ở `apps/app/components/crm/inline-field.tsx`. Ô Số, Email, Liên kết, Điện thoại thêm bước `docNhapTheoKieu` trước `luu`.
- Từ chối thì giữ ô mở, hiện câu dưới ô với `aria-invalid` và `aria-describedby`.
- Ô nhập có lỗi là một `OSuaCoKiem` mới nằm trong `kieu-truong.tsx`. Nó dựng trên `Input` của `@crm/ui` với `PROPERTY_ROW` và `PROPERTY_LABEL` của `detail-sheet`.
- CHECKBOX: `<label htmlFor>` nối `Checkbox id`.
- URL, EMAIL, PHONE có giá trị: thẻ `a` và nút `Button size="icon-sm" variant="ghost"` có `aria-label={m.truongKieu.sua(nhan)}`.

- [ ] Step 1: Viết bốn describe:
  - `tmc-loi-nhap`: sáu ô theo E3, cộng đối chứng «1.234,5», ca Esc, và ghim khuôn câu;
  - `tmc-o-tich`: năm ô theo E4;
  - `tmc-lien-ket`: phần bảng đăng ký của ma trận E5 (sáu ô tự tạo), cộng ca `javascript:` → không có `a`;
  - `tmc-o-bang`: mười hai ô theo E7, cộng USER rời đội → «—».
- [ ] Step 2: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-mot-cach.dom.tsx` → FAIL.
- [ ] Step 3: Viết `kieu-truong.tsx`.
- [ ] Step 4: PASS. Đột biến tay: bỏ `htmlFor` → 'tmc o tich: ten' đỏ. Hoàn lại.
- [ ] Step 5: Commit.

Phục vụ E3, E4, E5, E7. `independent: false`.

### Task 3: Ba phiếu qua bảng đăng ký

**Files:**
- Modify: `apps/app/components/crm/record-sheet/deal-sheet.tsx`, `company-sheet.tsx`, `contact-sheet.tsx`
- Modify: `apps/app/components/crm/fields/record-fields.tsx`. `RecordFields` vẽ bằng `OTruongPhieu` qua `moTaTruongTuTao`; `FieldsCog` giữ nguyên.
- Test: `apps/app/test/truong-mot-cach.dom.tsx` (describe `tmc-phieu-so`, `tmc-loi-may-chu`, `tmc-truong-chuan`, `tmc-lien-ket` phần chuẩn)

**Interfaces — Produces:**
- `export function truongChuanThoaThuan(deal: Deal, ctx: NguCanhTruong): MoTaTruong[]` ở `deal-sheet.tsx`. `truongChuanCongTy` và `truongChuanLienHe` cùng khuôn.
- `NguCanhTruong = { m: RecordSheetMessages; locale: Locale; luu: (data) => void; dangLuu: (khoa) => boolean; nguoiDung: Owner[] }`.
- Khoá của bộ mô tả bằng khoá dữ liệu API (`name`, `amountCents`, `expectedCloseDate`, `ownerId`→khoá `owner`…), khớp 23 dòng của E6.
- `export function DealOverview`, `CompanyOverview`, `ContactOverview` (thêm `export`, để test dựng).
- `onError` của ba mutation `update` dùng `loiLuuTruongTuBien(variables, moTaTheoKhoa, locale)`. Lượt lưu có đúng một khoá trong `data` (hay trong `data.fields`) khớp một bộ mô tả → câu `loiLuuTruong`; ngoài ra → `error.message` như cũ.
- Đầu phiếu (`DetailSheetStat`) vẽ giá trị trường bằng `HienThiTruong`. Các danh sách lồng (liên hệ trong thoả thuận, thoả thuận trong công ty…) vẽ ô trường bằng `OTruongBang`.
- Giữ riêng, liệt trong ngoại trừ của E1:
  - `ReportedValue` (giá trị quy đổi), tổng ở đầu phiếu công ty, `nextClose` — số tổng hợp, không phải một trường;
  - `InlineCompanyField`, `StageStepper`/`DealStageMenu`, `InlineTextCell` vai trò (Hỏi-1).

- [ ] Step 1: Viết bốn describe theo E2b, E3b (ba ca), E6 (23 dòng + sáu cặp trên Overview thật + đối chứng thước mù), E5 (sáu ô chuẩn của Công ty). Bản ghi giả rút qua bộ đọc đầu ra thật: `dealGetOutput` / `companyGetOutput` / `contactGetOutput` trong `apps/api/src/*/*.contracts.ts`; dùng đúng tên xuất có thật.
- [ ] Step 2: FAIL.
- [ ] Step 3: Chuyển ba phiếu sang bộ mô tả.
- [ ] Step 4: PASS. Chạy thêm `cd apps/app && bun test ./test/messages-guard.spec.ts` và các `*.dom.tsx` đang chạm ba phiếu (`grep -l "deal-sheet\|company-sheet\|contact-sheet" apps/app/test`) → xanh.
- [ ] Step 5: Commit.

Phục vụ E2b, E3b, E5, E6. `independent: false`.

### Task 4: Ba bảng qua bảng đăng ký

**Files:**
- Modify: `apps/app/components/crm/fields/field-columns.tsx` (`cell` → `OTruongBang`)
- Modify: `apps/app/app/(app)/[slug]/deals/deals-table.tsx`, `companies/companies-table.tsx`, `contacts/contacts-table.tsx` (cột trường chuẩn → `OTruongBang`; `columnsFor` xuất ra cho test)
- Test: `tmc-o-bang` vế cột

Ngoại trừ có tên: tổng `openPipelineCents` ở đầu bảng Thoả thuận; cột `company`, `stage`, `createdAt`, `lastActivity`, `industry`, `enrichment`, đếm liên hệ và thoả thuận (không phải trường có kiểu).

- [ ] Step 1: Viết vế cột theo E7: bảng mốc cột chuẩn chép từ onehub `37e7bf27c`, cộng cột tự tạo NUMBER.
- [ ] Step 2: FAIL.
- [ ] Step 3: Sửa bốn tệp.
- [ ] Step 4: PASS.
- [ ] Step 5: Commit.

Phục vụ E7. `independent: false` (cần Task 2).

### Task 5: Một tên gọi

**Files:**
- Modify: `apps/app/lib/messages/crm.ts:549` (vi `createHint`), `apps/app/lib/messages/kara-ban-ghi.ts:225` (vi `set_field_value`)
- Test: `apps/app/test/truong-mot-cach.spec.ts` describe `tmc-ten-goi`

- [ ] Step 1: Viết test theo E8, gồm thước mù.
- [ ] Step 2: FAIL với 'Tạo trường động'.
- [ ] Step 3: Sửa hai dòng.
- [ ] Step 4: PASS. `bun test ./test/messages-guard.spec.ts` và `kara-mot-ten.spec.ts` xanh (điều kiện của V1-9).
- [ ] Step 5: Commit.

Phục vụ E8. `independent: true`.

### Task 6: Bài kiểm API

**Files:**
- Create: `apps/api/test/truong-mot-cach.spec.ts` (describe `tmc-api-so`, `tmc-api-tu-choi`), theo mẫu fixture của `apps/api/test/fields.spec.ts`.

- [ ] Step 1: Viết hai describe theo E2c, E3c.
- [ ] Step 2: `bun run test -- "cd apps/api && bun test test/truong-mot-cach.spec.ts"` → PASS. Hành vi đã có, nên chứng chiều đỏ bằng hai đột biến tay ghi trong evals; ghi vào sổ.
- [ ] Step 3: Commit.

Phục vụ E2c, E3c. `independent: true`.

### Task 7: Răng E1 và E9

**Files:**
- Create: `_acceptance/truong-mot-cach-cu-xu/rang/quet-vo-tay.mjs` (E1: TypeScript compiler API, danh sách tệp, ngoại trừ, vế dương 22 khoá, thước mù trên bản chép).
- Create: `_acceptance/truong-mot-cach-cu-xu/rang/do-man.mjs` (E9: chạy dưới `scripts/lan-do/tien-de.mjs`; dựng dữ liệu qua API thật, chụp 9 ảnh vào `$BANG_CHUNG`, đọc DOM theo E9). Theo mẫu `_acceptance/thanh-ben-khu-dung-chung/rang/do-man.mjs`.

- [ ] Step 1: Viết `quet-vo-tay.mjs`. Chạy trên `37e7bf27c` (worktree tạm) → đỏ 'tmc quet: thieu tep …kieu-truong.tsx'. Chạy trên HEAD → xanh.
- [ ] Step 2: Viết `do-man.mjs`. Chạy `BANG_CHUNG=… bun scripts/lan-do/tien-de.mjs --chay "bun …/do-man.mjs"` → 'tmc man: dat'. Mở ảnh xem.
- [ ] Step 3: Commit.

Phục vụ E1, E9. `independent: false` (đọc tệp của Task 2–4).

### Cuối S3

`bun run check-types`, `bun run lint`, `bun run lint:slop` xanh. Hợp đồng chuyển `status: implemented`, rồi vào S4.
