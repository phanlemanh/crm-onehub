# Kho tài liệu, lượt 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nhân viên viết trang bằng trình soạn kiểu Word, chủ trang duyệt trên diff kiểu Track Changes, cả công ty đọc bản đang dùng.

**Architecture:** Hai mô-đun thuần trong `packages/validation` giữ luật chung cho client và máy chủ: bộ markdown (lược đồ bảy loại nút, tuần tự hoá một cách, rút liên kết) và bộ diff (gióng khối rồi so từ, `diffHash`, dải số đổi). Máy chủ là module Nest `tai-lieu` với một hàm quyền; mọi thao tác duyệt chạy trong một giao dịch có điều kiện. `packages/ui` có hai thành phần mới `TrinhSoan` (Tiptap) và `DiffTrang`; `apps/app` có năm route dưới `/tai-lieu`.

**Tech Stack:** Prisma 7 / Postgres 17 (`unaccent`, `pg_trgm`), NestJS + nestjs-trpc, Next.js, Tiptap 3.31 (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-table`, `@tiptap/markdown`), `diff` (jsdiff ≥ 8.0.4), bun test + JSDOM, puppeteer-core.

**Spec:** `docs/superpowers/specs/2026-09-27-kho-tai-lieu-design.md` · hợp đồng `_acceptance/kho-tai-lieu/contract.md` · evals `_acceptance/kho-tai-lieu/evals.yaml`.

## Global Constraints

- Không chú thích trong mã; hằng số chỉnh được nằm trong một tệp config của khu (`TAI_LIEU` trong `packages/validation/src/tai-lieu.ts`).
- Tên trang 1–160 ký tự; lý do trả lại 1–500 ký tự; nội dung ≤ 200 000 ký tự; mọi chữ người gõ chuẩn NFC lúc nhận.
- Slug: bỏ dấu bằng NFD, `đ` → `d`, chữ thường, gạch nối, hậu tố `-2`, `-3` khi trùng; bất biến.
- Bốn loại trang: `quy-dinh` «Quy định» · `chinh-sach` «Chính sách» · `quy-trinh` «Quy trình» · `bieu-mau` «Biểu mẫu».
- Trạng thái đề xuất: `CHO_DUYET` · `DA_DUYET` · `TRA_LAI` · `CU`. Sự kiện: `TAO` · `DE_XUAT` · `DUYET` · `TRA_LAI` · `CU`.
- Người duyệt được: chủ trang, `owner`, `admin`. Người thấy đề xuất: người tạo và người duyệt được.
- Nhãn trên màn theo `CONTEXT.md`: «trang», «loại trang», «chủ trang», «bản đề xuất», «bản đang dùng», «quản trị»; không có chữ markdown, slug, diff, hash.
- Giao diện chỉ từ `@crm/ui`; thành phần mới dựng trong `packages/ui`; không `className` đổi màu, góc, khoảng cách của component `@crm/ui`.
- Trang server tính, thành phần client vẽ; client không import `@crm/db`, `@crm/auth`.
- Lệnh chứng của kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## Review Focus

- Hai người bấm «Duyệt» hai bản đề xuất cùng bản gốc cùng lúc → đúng một bản thành phiên bản mới, bản kia «cũ»; không bao giờ hai phiên bản cùng số (Task 6, ca «duyet-dong-thoi»).
- Chủ trang rời workspace → trang vẫn đọc được, quản trị vẫn duyệt được, người đó không duyệt được nữa (Task 6, ca «chu-trang-roi-di»).
- Trang dài ≈ 200 000 ký tự, viết lại toàn bộ → màn duyệt trả trong < 2 giây nhờ trần thời gian của diff, lùi về diff khối (Task 3, ca «diff-trang-dai»).
- Dán nội dung có ảnh, màu, phông lạ → ảnh bị bỏ, chữ còn, không lỗi (Task 7, ca «dan-co-anh»).
- Tên trang chỉ có ký hiệu hay emoji → slug dự phòng `trang`, `trang-2`, không lỗi (Task 1, ca «slug-du-phong»).

## Bản đồ tệp

| Tệp | Trách nhiệm |
| --- | --- |
| `packages/validation/src/tai-lieu.ts` | Hằng số, `TAI_LIEU` config, `sinhSlug`, `chuanNfc`, schema sự kiện |
| `packages/validation/src/tai-lieu-markdown.ts` | Bộ markdown dùng chung: `nap`, `tuanTuHoa`, `chuanHoa`, `rutLienKet` |
| `packages/validation/src/tai-lieu-diff.ts` | `soSanh`, `diffHash`, `suKienDoi` |
| `packages/db/prisma/schema.prisma` + migration `20260930010000_kho_tai_lieu` | Năm bảng `TaiLieu*`, hai extension |
| `apps/api/src/tai-lieu/` | `quyen.ts`, `tai-lieu.service.ts`, `tai-lieu.router.ts`, `tai-lieu.contracts.ts`, `tai-lieu.module.ts` |
| `packages/ui/src/components/trinh-soan.tsx`, `trinh-soan-thanh-cong-cu.tsx` | Trình soạn giàu |
| `packages/ui/src/components/diff-trang.tsx` | Diff kiểu Track Changes |
| `apps/app/app/(app)/[slug]/tai-lieu/**` | Năm route, thành phần client |
| `apps/app/lib/messages/tai-lieu.ts` | Chữ trên màn vi/en |
| `_acceptance/kho-tai-lieu/rang/*.mjs` | Năm răng đo (hai `migration`, ba màn) |

---

### Task 1: Luật chung — hằng số, slug, NFC, sự kiện

Phục vụ: E2 (slug, NFC). `independent: true`.

**Files:**
- Create: `packages/validation/src/tai-lieu.ts`
- Modify: `packages/validation/package.json` (exports `"./tai-lieu"`, `"./tai-lieu-markdown"`, `"./tai-lieu-diff"`)
- Test: `packages/validation/test/tai-lieu.spec.ts`

**Interfaces:**
- Produces: `LOAI_TRANG`, `TRANG_THAI_DE_XUAT`, `LOAI_SU_KIEN` (mảng `as const`), `type LoaiTrang`, `type TrangThaiDeXuat`, `TAI_LIEU = { ten: {min:1,max:160}, lyDo: {min:1,max:500}, noiDung: {max:200_000}, danhSach: {coTrang:25}, diff: {tranMs:1_500} } as const`, `chuanNfc(s: string): string`, `sinhSlug(ten: string, daCo: ReadonlySet<string>): string`, `suKienChiTiet` (zod discriminatedUnion theo `loai`), `parseSuKienChiTiet(v: unknown)`.

- [ ] **Step 1: Test hỏng**

```ts
import { describe, expect, test } from "bun:test";
import { chuanNfc, sinhSlug } from "../src/tai-lieu";

const SLUG: [string, string[], string][] = [
	["Quy định hoa hồng", [], "quy-dinh-hoa-hong"],
	["Đối tác Đà Nẵng", [], "doi-tac-da-nang"],
	["Quy định hoa hồng", ["quy-dinh-hoa-hong"], "quy-dinh-hoa-hong-2"],
	["Quy định hoa hồng", ["quy-dinh-hoa-hong", "quy-dinh-hoa-hong-2"], "quy-dinh-hoa-hong-3"],
	["  ✨ !!! ", [], "trang"],
	["  ✨ !!! ", ["trang"], "trang-2"],
];

describe("tai-lieu", () => {
	for (const [ten, daCo, mong] of SLUG)
		test(`slug ${ten} ${daCo.length}`, () => expect(sinhSlug(ten, new Set(daCo))).toBe(mong));
	test("nfc", () => expect(chuanNfc("hoà")).toBe("hoà"));
});
```

- [ ] **Step 2:** `cd packages/validation && bun test test/tai-lieu.spec.ts` → FAIL «Cannot find module».
- [ ] **Step 3: Mã**

```ts
export const LOAI_TRANG = ["quy-dinh", "chinh-sach", "quy-trinh", "bieu-mau"] as const;
export type LoaiTrang = (typeof LOAI_TRANG)[number];
export const TRANG_THAI_DE_XUAT = ["CHO_DUYET", "DA_DUYET", "TRA_LAI", "CU"] as const;
export type TrangThaiDeXuat = (typeof TRANG_THAI_DE_XUAT)[number];
export const LOAI_SU_KIEN = ["TAO", "DE_XUAT", "DUYET", "TRA_LAI", "CU"] as const;

export const TAI_LIEU = {
	ten: { min: 1, max: 160 },
	lyDo: { min: 1, max: 500 },
	noiDung: { max: 200_000 },
	danhSach: { coTrang: 25 },
	diff: { tranMs: 1_500 },
	slugDuPhong: "trang",
} as const;

export function chuanNfc(s: string): string {
	return s.normalize("NFC");
}

function goc(ten: string): string {
	const s = ten
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "d")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return s === "" ? TAI_LIEU.slugDuPhong : s;
}

export function sinhSlug(ten: string, daCo: ReadonlySet<string>): string {
	const g = goc(ten);
	if (!daCo.has(g)) return g;
	let n = 2;
	while (daCo.has(`${g}-${n}`)) n += 1;
	return `${g}-${n}`;
}
```

Schema sự kiện: `z.discriminatedUnion("loai", [...])` với `DUYET: { deXuatId, phienBan: number, diffHash: string }`, `TRA_LAI: { deXuatId, lyDo }`, `CU: { deXuatId, vi: string }`, `TAO`/`DE_XUAT: { deXuatId }`; `parseSuKienChiTiet` ném `Error("sự kiện tài liệu không đọc được: …")` khi hỏng (không nuốt).

- [ ] **Step 4:** chạy lại → PASS; thêm phá-thử: bỏ `.replace(/đ/g,"d")` trên bản sao → ca «Đối tác Đà Nẵng» đỏ.
- [ ] **Step 5:** commit `feat(tai-lieu): luật chung — loại trang, slug, NFC, sự kiện`.

#### Task 1b (cùng nhánh Task 1): Bộ markdown dùng chung

Phục vụ: E10 (khứ hồi), E10c (điểm bất động), E15 (rút liên kết). `independent: true`.

**Files:**
- Create: `packages/validation/src/tai-lieu-markdown.ts`
- Create: `packages/ui/test/fixtures/tai-lieu/*.md` (12 mẫu: `tieu-de`, `doan`, `dam-nghieng`, `danh-sach-so`, `danh-sach-cham`, `danh-sach-long`, `bang`, `bang-o-trong`, `lien-ket`, `lien-ket-co-dau`, `chu-nfd`, `tron-lan`)
- Modify: `packages/validation/package.json` (dependencies `@tiptap/core`, `@tiptap/markdown`, `@tiptap/starter-kit`, `@tiptap/extension-table`, `@tiptap/extension-link` = `3.31.3`)
- Test: `packages/validation/test/tai-lieu-markdown.spec.ts`

**Interfaces:**
- Produces: `PHAN_MO_RONG` (mảng extension Tiptap đã giới hạn: StarterKit tắt `codeBlock`, `code`, `blockquote`, `horizontalRule`, `strike`, heading `levels: [2, 3]`; TableKit; Link `openOnClick:false`), `nap(md: string): JSONContent`, `tuanTuHoa(doc: JSONContent): string`, `chuanHoa(md: string): string` (= `tuanTuHoa(nap(chuanNfc(md)))`), `rutLienKet(md: string): { den: string; vanBan: string }[]`.

- [ ] **Step 1: Test hỏng** — với mỗi mẫu trong thư mục fixtures: `const l1 = chuanHoa(doc(mau)); expect(chuanHoa(l1)).toBe(l1)`; và một ca «sửa một chữ thì khác»; `rutLienKet` trên mẫu `lien-ket` trả đúng hai phần tử `{den,vanBan}`.
- [ ] **Step 2:** chạy → FAIL.
- [ ] **Step 3: Mã** — `MarkdownManager` của `@tiptap/markdown` với `PHAN_MO_RONG` (đã thử 2026-09-27 trong Bun không DOM: lần hai y hệt lần một; lần đầu chuẩn hoá đệm bảng và dòng trống). `rutLienKet` duyệt `nap(md)` tìm mark `link`.
- [ ] **Step 4:** PASS 12/12; phá-thử: bản sao đổi dấu danh sách giữa hai lần gọi → ca đỏ nêu tên mẫu.
- [ ] **Step 5:** commit.

#### Task 1c (cùng nhánh Task 1): Bộ diff dùng chung

Phục vụ: E13 (ins/del, dải số, `diffHash` khớp), E6 (hash lệch). `independent: true`.

**Files:**
- Create: `packages/validation/src/tai-lieu-diff.ts`
- Modify: `packages/validation/package.json` (dependency `diff` ≥ 8.0.4)
- Test: `packages/validation/test/tai-lieu-diff.spec.ts`

**Interfaces:**
- Consumes: `chuanHoa`, `nap` (Task 2), `TAI_LIEU.diff.tranMs` (Task 1).
- Produces: `type DoanDoi = { loai: "giu" | "them" | "bo"; chu: string }`, `type KhoiDoi = { kieu: "doan" | "tieu-de-2" | "tieu-de-3" | "muc-so" | "muc-cham" | "hang-bang"; doan: DoanDoi[] }`, `soSanh(truoc: string, sau: string): KhoiDoi[]`, `diffHash(khoi: KhoiDoi[]): Promise<string>` (SHA-256 hex qua `globalThis.crypto.subtle` của JSON chuẩn), `suKienDoi(khoi: KhoiDoi[]): { truoc: string; sau: string }[]`.
- Cách làm: tách mỗi bản thành khối theo cây `nap()`; gióng khối bằng `diffArrays` trên chữ khối; khối khớp một-một thì `diffWordsWithSpace` bên trong; có trần thời gian `TAI_LIEU.diff.tranMs`, quá trần thì trả diff theo khối.

- [ ] **Step 1: Test hỏng** — cặp mẫu thiết kế (thêm một câu, bỏ một câu, «48 giờ» → «24 giờ»): đếm `them` = 2, `bo` = 2; `suKienDoi` = `[{truoc:"48 giờ", sau:"24 giờ"}]`; hai bản giống nhau → không `them`/`bo`, dải rỗng; `diffHash` ổn định qua hai lần gọi; ca «diff-trang-dai»: hai bản 200 000 ký tự khác toàn bộ → trả trong < 2 000 ms.
- [ ] **Step 2–4:** FAIL → mã → PASS; phá-thử: bản sao bỏ chuẩn hoá trước khi so → ca giống nhau đỏ.
- [ ] **Step 5:** commit.

### Task 4: Lược đồ và `migration` (T3)

Phục vụ: E1, E1b. `independent: true`.

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (năm model, quan hệ ngược trên `User`, `Department`)
- Create: `packages/db/prisma/migrations/20260930010000_kho_tai_lieu/migration.sql`
- Create: `_acceptance/kho-tai-lieu/rang/migration-chi-them.mjs`, `_acceptance/kho-tai-lieu/rang/migration-tren-ban-sao.mjs`

**Lược đồ** (String + hằng số ở Task 1 thay cho Prisma enum, theo lệ các model OKR):

```prisma
model TaiLieuTrang {
  id            String   @id @default(cuid())
  slug          String   @unique
  ten           String
  loai          String
  departmentId  String?
  department    Department? @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  chuTrangId    String
  chuTrang      User     @relation("TaiLieuChuTrang", fields: [chuTrangId], references: [id], onDelete: Restrict)
  xacMinhDen    DateTime?
  banDangDungId String?  @unique
  banDangDung   TaiLieuPhienBan? @relation("TaiLieuBanDangDung", fields: [banDangDungId], references: [id], onDelete: Restrict)
  timKiem       Unsupported("tsvector")?
  taoBoiId      String
  taoBoi        User     @relation("TaiLieuTaoBoi", fields: [taoBoiId], references: [id], onDelete: Restrict)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  phienBan      TaiLieuPhienBan[] @relation("TaiLieuPhienBanCuaTrang")
  deXuat        TaiLieuDeXuat[]
  suKien        TaiLieuSuKien[]
  lienKet       TaiLieuLienKet[]
  @@index([loai])
  @@index([chuTrangId])
  @@map("taiLieuTrang")
}
```

`TaiLieuPhienBan` (`trangId`, `so Int`, `ten`, `noiDung`, `noiDungHash`, `deXuatId @unique`, `duyetBoiId`, `duyetLuc`; `@@unique([trangId, so])`), `TaiLieuDeXuat` (`trangId`, `banGocId?`, `ten`, `noiDung`, `taoBoiId`, `trangThai String @default("CHO_DUYET")`, `lyDo?`, `xuLyBoiId?`, `xuLyLuc?`, `createdAt`; `@@index([trangId, trangThai])`), `TaiLieuSuKien` (`trangId`, `loai`, `aiId`, `luc @default(now())`, `chiTiet Json`; `@@index([trangId, luc])`), `TaiLieuLienKet` (`tuTrangId`, `denSlug`, `vanBan`; `@@index([denSlug])`).

- [ ] **Step 1:** viết hai răng (tự suy gốc kho từ vị trí tệp; `migration-chi-them.mjs` đọc mọi thư mục `migration` mới so với `git merge-base HEAD origin/onehub`, tập câu lệnh cho phép như E1; `migration-tren-ban-sao.mjs` như E1b), chạy → FAIL vì chưa có `migration`.
- [ ] **Step 2:** sửa schema; sinh `migration` bằng `cd packages/db && bunx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script`, chép vào thư mục mới, thêm đầu tệp `CREATE EXTENSION IF NOT EXISTS unaccent; CREATE EXTENSION IF NOT EXISTS pg_trgm;` và chỉ mục `CREATE INDEX "taiLieuTrang_timKiem_idx" ON "taiLieuTrang" USING GIN ("timKiem");`.
- [ ] **Step 3:** `bun run db:test --reset` rồi hai răng → exit 0; chiều đỏ của từng răng → exit 1 với thông điệp ghim.
- [ ] **Step 4:** `bun run db:generate`, `bun run check-types`.
- [ ] **Step 5:** commit `feat(db): lược đồ Kho tài liệu`.

### Task 5: Máy chủ — quyền, tạo, đề xuất, đọc

Phục vụ: E2, E3, E8, E8b, E10b. `independent: false` (cần Task 1, 2, 4).

**Files:**
- Create: `apps/api/src/tai-lieu/quyen.ts`, `tai-lieu.contracts.ts`, `tai-lieu.service.ts`, `tai-lieu.router.ts`, `tai-lieu.module.ts`
- Modify: `apps/api/src/app.module.ts` (import `TaiLieuModule` sau `OkrModule`), `apps/api/src/generated/server.ts` (qua `cd apps/api && bun run trpc:generate`), `apps/api/test/vai-chi-okr.spec.ts` (`ALIAS_CHO_PHEP` thêm `"taiLieu"`, `DAU_VAO_HOP_LE` thêm các thủ tục ghi)
- Test: `apps/api/test/tai-lieu-san.ts` (dựng app sáu người như `to-chuc-san.ts`: `tao`, `chu`, `owner`, `admin`, `khac`, `okr`), `apps/api/test/tai-lieu.spec.ts`, `apps/api/test/tai-lieu-khong-ro.spec.ts`, `apps/api/test/tai-lieu-man-sua.spec.ts`

**Interfaces:**
- `quyen.ts`: `laQuanTri(role: WorkspaceRole | null): boolean` (= `isWorkspaceAdmin`), `duyetDuoc(nguoi: {id; role}, trang: {chuTrangId}): boolean`, `thayDeXuat(nguoi, deXuat: {taoBoiId}, trang): boolean` (= người tạo ∨ `duyetDuoc`), `thayTrang(nguoi, trang, deXuatCuaTrang)`: bản đang dùng ≠ null ∨ tồn tại đề xuất người đó thấy.
- Router `@Router({ alias: "taiLieu" })`, `@UseMiddlewares(PhamViChungMiddleware)`; vai đọc bằng `docPhamViYeuCau(ctx).role`.
- Thủ tục: `list({ loai?, page })` → `{ rows: {slug, ten, loai, chuTrang, donVi, capNhat, coBanCho}[], total, facetCounts: Record<LoaiTrang, number> }` · `get({ slug })` → `{ slug, ten, loai, chuTrang, donVi, phienBan: {so, duyetLuc} | null, noiDung: string | null, coBanCho, choLanDau: {chuTrang} | null, suaDuoc: true }` · `create({ ten, loai, departmentId?, chuTrangId?, noiDung })` → `{ slug }` · `propose({ slug, ten?, noiDung })` → `{ deXuatId }`.
- Lỗi: không thấy → `NotFoundException(T.khongCo)` — cùng một câu cho mọi ca; tên sai → `BadRequestException(T.tenTrong|T.tenDai)`; đề xuất trùng bản gốc sau `chuanHoa` → `BadRequestException(T.chuaDoi)`.

- [ ] **Step 1:** test hỏng theo đúng `expected` của E2, E3 (bảng 6 × 5 × 4 = 120 khẳng định viết sẵn trong `tai-lieu-khong-ro.spec.ts` dưới dạng hai hằng bảng `THAY_TRANG`, `THAY_DE_XUAT`), E8, E8b (`get` với người tạo và chủ trang vẫn trả nội dung phiên bản đang dùng, không trả nội dung đề xuất), E10b.
- [ ] **Step 2:** `bun run test -- "cd apps/api && bun test test/tai-lieu.spec.ts"` → FAIL.
- [ ] **Step 3:** mã service: `create` trong một giao dịch — `sinhSlug(ten, slug đã có cùng gốc)`, tạo trang, đề xuất `CHO_DUYET` với `chuanHoa(noiDung)`, sự kiện `TAO`; `propose` kiểm trang thấy được, `banGocId = banDangDungId`, từ chối trùng; `list`/`get` lọc bằng một hàm `dieuKienThay(nguoi)` dùng trong cả `where` và `facetCounts`.
- [ ] **Step 4:** PASS; chiều đỏ của E3 (bản sao `thayDeXuat` trả `true`) và E8 đỏ đúng thông điệp.
- [ ] **Step 5:** commit.

#### Task 5b (cùng nhánh Task 5): Máy chủ — duyệt, trả lại, so-và-đặt, liên kết, tìm

Phục vụ: E4, E5, E6, E7, E10c, E13 (phía máy chủ), E15. `independent: false` (cần Task 3, 5).

**Files:**
- Modify: `apps/api/src/tai-lieu/tai-lieu.service.ts`, `tai-lieu.router.ts`, `tai-lieu.contracts.ts`
- Test: `apps/api/test/tai-lieu.spec.ts` (ca `duyet-tao-phien-ban`, `so-va-dat`, `tra-lai`, `lien-ket-tim`, `diff-hash`, `duyet-dong-thoi`, `chu-trang-roi-di`), `apps/api/test/tai-lieu-quyen.spec.ts`, `apps/api/test/tai-lieu-bat-dong.spec.ts`

**Interfaces:**
- `proposals()` → `{ rows: {id, slug, ten, taoBoi, luc, trangThai, cu}[], choToiDuyet: number }` · `proposal({ id })` → `{ id, slug, ten, trangThai, lyDo, taoBoi, banGoc: string, noiDung: string, cu: boolean, duyetDuoc: boolean }` · `approve({ id, diffHash })` → `{ slug, so }` · `reject({ id, lyDo })` → `{ ok: true }`.
- `approve` trong `db.$transaction`: đọc đề xuất và trang `FOR UPDATE` (`$queryRaw`); kiểm `duyetDuoc`; kiểm `trangThai = CHO_DUYET`; kiểm `banGocId === banDangDungId` (lệch → cập nhật `CU` + sự kiện `CU` rồi `ConflictException(T.cu)`); tính `diffHash(soSanh(banGoc, noiDung))` so với input (lệch → `ConflictException(T.daDoi)`); tạo phiên bản `so = max + 1`; cập nhật con trỏ; đề xuất `DA_DUYET`; các đề xuất `CHO_DUYET` khác cùng `banGocId` → `CU`; sự kiện `DUYET`; `deleteMany` + `createMany` liên kết từ `rutLienKet`; `$executeRaw` `UPDATE "taiLieuTrang" SET "timKiem" = to_tsvector('simple', unaccent($ten || ' ' || $noiDung)) WHERE id = $id`.

- [ ] **Step 1:** test hỏng theo `expected` của E4–E7, E10c, E13, E15 và hai ca Review Focus (`duyet-dong-thoi`: hai `approve` chạy `Promise.all` → đúng một thành công, một `CONFLICT`, số phiên bản = 1; `chu-trang-roi-di`: gỡ member của chủ trang → `get` vẫn trả, `approve` bởi admin được).
- [ ] **Step 2–4:** FAIL → mã → PASS; chiều đỏ từng eval.
- [ ] **Step 5:** commit.

### Task 7: Trình soạn giàu `TrinhSoan`

Phục vụ: E9, E10 (phía trình soạn), E11, E12 (một phần). `independent: true` (cần Task 2).

**Files:**
- Create: `packages/ui/src/components/trinh-soan.tsx`, `packages/ui/src/components/trinh-soan-thanh-cong-cu.tsx`, `packages/ui/src/lib/dan-tu-van-phong.ts`
- Modify: `packages/ui/package.json` (`@tiptap/react`, `@tiptap/pm`, cùng các gói của Task 2, `3.31.3`)
- Create: `packages/ui/test/fixtures/tai-lieu/clipboard-word.html`, `clipboard-word.md`, `clipboard-gdocs.html`, `clipboard-gdocs.md`
- Test: `packages/ui/test/trinh-soan.dom.tsx`, `trinh-soan-khu-hoi.dom.tsx`, `trinh-soan-dan.dom.tsx`

**Interfaces:**
- `TrinhSoan({ giaTri: string; onDoi: (md: string) => void; nhan: string; goiY: string; nhanNut: Record<"tieuDe2"|"tieuDe3"|"dam"|"nghieng"|"danhSachSo"|"danhSachCham"|"bang"|"lienKet"|"hoanTac"|"lamLai", string> })` — `role="textbox"`, `aria-multiline`, `aria-label={nhan}` đặt trên phần tử của ProseMirror qua `editorProps.attributes`; `onDoi` phát `tuanTuHoa(editor.getJSON())`.
- `locDan(html: string): string` trong `dan-tu-van-phong.ts`: bỏ `style`, `class`, `o:p`, thẻ `b` bọc ngoài có `font-weight:normal` của Google Docs, ảnh; giữ h1–h6 (h1 → h2), `ul/ol` lồng, `table`, `strong/em`, `a[href]`. Gắn qua `editorProps.transformPastedHTML`.
- Thanh công cụ: `div role="toolbar"` chứa `ToggleGroup`/`Button` của `@crm/ui`; mũi tên trái/phải chuyển focus giữa nút (roving tabindex).
- Bậc `docs/design.md`: tra ReUI bằng câu «editor», «rich text» trước khi dựng; ghi kết quả vào mô tả PR.

- [ ] **Step 1 (cần chủ kho):** tệp HTML clipboard phải là bản chép thật. Máy dựng trang chụp tạm `packages/ui/test/fixtures/tai-lieu/chup-clipboard.html` (một ô dán hiện `text/html` để chép); chủ kho mở, dán một đoạn mẫu từ Word và một từ Google Docs, chép ra hai tệp. Máy viết hai tệp `.md` kỳ vọng từ nội dung mẫu. Trong lúc chờ, các bước khác đi tiếp.
- [ ] **Step 2:** test hỏng theo `expected` của E9, E10, E11, ca «dan-co-anh».
- [ ] **Step 3–4:** mã → PASS; phá-thử: bỏ `aria-label` nút bảng → «nut thieu nhan: bang»; bỏ bộ lọc → «con Mso trong markdown: clipboard-word»; giữ thẻ `b` ngoài → «dam tran: clipboard-gdocs».
- [ ] **Step 5:** commit.

### Task 8: `DiffTrang`

Phục vụ: E13 (phía màn). `independent: true` (cần Task 3).

**Files:**
- Create: `packages/ui/src/components/diff-trang.tsx`
- Modify: `packages/ui/src/styles/globals.css` (hai token `--diff-them`, `--diff-bo` cho hai giao diện, đủ tương phản 3:1 với nền — finding Nhóm 2 của design-pass)
- Test: `packages/ui/test/diff-trang.dom.tsx`

**Interfaces:**
- `DiffTrang({ khoi: KhoiDoi[]; nhanThem: string; nhanBo: string; nhanDaiSo: string; dai: {truoc; sau}[] })` — vẽ theo `kieu` của khối (h2, h3, p, li, tr), `ins` và `del` dùng biến thể trong `packages/ui`, mỗi cái có `<span className="sr-only">` nhãn; chèn một khoảng trắng giữa `bo` và `them` liền kề (Nhóm 1 của design-pass).

- [ ] **Step 1–4:** test hỏng theo E13 (đếm `ins`/`del`, nhãn ẩn, không `+`/`−`, không lớp `font-mono`), mã, PASS; chiều đỏ «ins thieu nhan cho trinh doc man hinh».
- [ ] **Step 5:** commit.

### Task 9: Màn trong app

Phục vụ: E2b, E5b, E6b, E7b, E9b, E10d, E14 (dựng màn), E16. `independent: false` (cần Task 5–8).

**Files:**
- Create: `apps/app/app/(app)/[slug]/tai-lieu/page.tsx` (danh sách + tab «Chờ duyệt» qua `?tab=cho-duyet`), `moi/page.tsx`, `[trang]/page.tsx`, `[trang]/sua/page.tsx`, `de-xuat/[id]/page.tsx`, cùng các thành phần client `danh-sach.tsx`, `man-soan.tsx`, `man-doc.tsx`, `man-duyet.tsx`
- Create: `apps/app/lib/messages/tai-lieu.ts` (vi và en, xuất `taiLieuMessages(locale)`)
- Modify: `apps/app/lib/khung-dieu-huong.ts` (`MucRailKey` thêm `"taiLieu"`, `MUC_RAIL` thêm `{ key: "taiLieu", href: "/tai-lieu", match: "prefix" }` trước `settings`), `apps/app/components/app-icon-rail.tsx` (`ICON.taiLieu`), `apps/app/lib/messages/khung-ung-dung.ts` (`rail.taiLieu`: «Tài liệu» / «Documents»), `apps/app/lib/pham-vi-man.ts` (vai `okr` thấy mục «Tài liệu»), `apps/app/lib/trpc/cache.ts` (`taiLieu(slug?)` làm mới `get`, `list`, `proposals`, `proposal`)
- Test: `apps/app/test/tai-lieu-soan.dom.tsx`, `apps/app/test/tai-lieu-man-duyet.dom.tsx`

**Hành vi theo bản mẫu đã duyệt** (`/proto/kho-tai-lieu`, trạng thái lượt 1): danh sách ở khổ < 768 dùng `Item` thay bảng (Nhóm 2 của design-pass); màn soạn dùng `TrinhSoan` trong khung có bộ giữ thay đổi (`useKhaiThayDoi`); nút «Gửi duyệt» khoá khi `chuanHoa(giaTri) === chuanHoa(banGoc)`; lỗi dưới ô qua `FieldError`, focus ô lỗi đầu; màn duyệt dùng `DiffTrang` với `soSanh` chạy phía server page, `diffHash` tính ở client từ cùng `khoi` rồi gửi kèm `approve`.

- [ ] **Step 1–4:** test DOM hỏng theo E2b, E5b, E6b, E7b, E9b, E10d → mã → PASS; `design-gate --mode static` trên các tệp mới (E16).
- [ ] **Step 5:** commit.

### Task 10: Răng đo màn

Phục vụ: E12, E13b, E14. `independent: false` (cần Task 9).

**Files:**
- Create: `_acceptance/kho-tai-lieu/rang/bo-go-viet.mjs`, `man-duyet.mjs`, `man-danh-sach.mjs` (khuôn `hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs`: `man-that-lib.mjs` cho `APP`, `API`, `CHROME`; đăng nhập bằng `dev:session`; gieo qua tRPC thật; ảnh ghi `.acceptance-runs/kho-tai-lieu/evidence/`; `--chieu-do` dựng phiên đo mới trên bản sao hỏng)
- E12 dùng CDP `Input.imeSetComposition` rồi `Input.insertText` cho từng âm tiết Telex; Enter giữa lúc composition.

- [ ] **Step 1–4:** mỗi răng chạy bằng `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/kho-tai-lieu/rang/<ten>.mjs"` → in «buoc N: dat»; chiều đỏ → mã 1 đúng thông điệp.
- [ ] **Step 5:** commit; chạy năm lệnh chứng của kho; contract → `implemented`.

## Thứ tự và song song

Task 1 (gồm 1b, 1c, làm tuần tự trong một nhánh) và Task 4 chạy song song; phụ thuộc và exports đã thêm sẵn ở commit chuẩn bị `8ecf6093`. Task 7 và 8 độc lập với máy chủ — chạy song song với Task 5, 6. Task 9 sau 5–8; Task 10 sau 9.
