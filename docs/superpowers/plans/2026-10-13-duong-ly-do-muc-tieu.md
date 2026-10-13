# L2 Đường lý do trên sheet mục tiêu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sheet mục tiêu hiện lý do, căn cứ, nhãn mức tin và dấu Kara ngay trong từng dòng nối của vùng «Đường lý do»; bộ OKR mẫu gieo đủ ba mức tin.

**Architecture:** Một thành phần khách mới `LyDoNoiGop` (chỉ hiển thị, nhận một phần tử `alignments` đã xong) gắn vào `KhuGopVao` của `objective-sheet.tsx`; tiêu đề vùng đổi sang khoá chữ mới `khuDuongLyDo`. Không đổi API. Bộ mẫu nhận ba trường tuỳ chọn trong `canChinh` và ghi chúng cùng hàng `okrAlignment` sẵn có.

**Tech Stack:** Next.js (apps/app), `@crm/ui` (Item, StatusIndicator, KaraTrace, toneTheoNghia), bun test + jsdom, NestJS + Prisma (apps/api), Zod.

**Spec:** `docs/superpowers/specs/2026-10-13-duong-ly-do-muc-tieu-design.md` · hợp đồng `_acceptance/duong-ly-do-muc-tieu/contract.md` · evals `_acceptance/duong-ly-do-muc-tieu/evals.yaml`.

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Không `className` đổi màu/góc/khoảng cách của component `@crm/ui`; chỉ bố cục (`flex`, `gap-*`, `min-w-0`, `break-words`).
- Chữ khung qua `apps/app/lib/messages/okr.ts`, chỉ THÊM dòng (luật 7 của đợt); đủ `vi` và `en`.
- Dữ liệu người nhập mang `translate="no"`.
- Tone qua `toneTheoNghia`; nghĩa: `co-so-lieu`→`xong`, `dat-cuoc`→`nhap`, `chua-co-ly-do`→`cho` (chủ kho chọn 13/10).
- Không sửa dòng nào của `apps/app/test/muc-tieu-va-kr.dom.tsx`, `gop-y-dung-cho-luot-2.dom.tsx`, `gop-y-dung-cho-luot-2-khung.tsx`.
- Giữ `[data-khu=gop-vao]`, `[data-gop-vao]`, nội dung `item-title`/`item-description` của dòng; phần lý do nằm NGOÀI `item-description`.
- Bộ mẫu: chỉ thêm trường tuỳ chọn và giá trị cho ca có sẵn; không đổi ca nào khác (dùng chung với P1).

## Review Focus

- Câu lý do rất dài ở 390 px → xuống dòng trọn, không cắt (E10 đo; Task 1 dùng `break-words`, không `line-clamp`).
- `lyDo` có nhưng `mucTin` là `chua-co-ly-do` (API là nguồn) → nhãn theo `mucTin` (E2 có ca đối chứng).
- Mục tiêu không căn chỉnh → không vùng (E3 ca thứ ba).
- Locale `en` → mọi nhãn mới ra bản `en` (E6).
- `canCu` có mà `lyDo` null trong bộ mẫu → bộ đọc từ chối (E8 chiều đỏ).

---

### Task 1: Phần lý do trong dòng nối (màn)

`independent: true` · phục vụ E1–E6, E7

**Files:**
- Create: `apps/app/components/crm/record-sheet/ly-do-noi-gop.tsx`
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx` (`KhuGopVao`, ~L502–536)
- Modify: `apps/app/lib/messages/okr.ts` (khối `sheet` vi ~L131 và en ~L814 — chỉ thêm khoá)
- Test: `apps/app/test/duong-ly-do.dom.tsx`

**Interfaces:**
- Produces: `export function LyDoNoiGop({ g }: { g: NoiGopHien })` với `export type NoiGopHien = { lyDo: string | null; canCu: string | null; lyDoTuKara: boolean; mucTin: "chua-co-ly-do" | "dat-cuoc" | "co-so-lieu" }`; `export const NGHIA_MUC_TIN` (`as const`, ánh xạ mức → `NghiaTrangThai`).
- Messages: `sheet.khuDuongLyDo`, `sheet.canCu` (`"Căn cứ: {cau}"`, điền bằng `dien`), `sheet.mucTin` (`Record<mức, string>`).
- DOM: `[data-ly-do]` bọc phần lý do, `[data-ly-do-cau]` câu lý do (`translate="no"`), `[data-ly-do-can-cu]` dòng căn cứ (phần dữ liệu trong `<span translate="no">`), nhãn mức tin là `StatusIndicator` có `data-muc-tin`.

- [ ] Step 1: viết `duong-ly-do.dom.tsx` dùng bộ dựng `khung-gop-y-dung-cho.tsx` (`dung`, `dungSheet`, `mtSheet`, `chiTietTu`, `kho`, `qs`, `qsa`, `datLai`, `thaoHet`), sáu `describe`/`test` có tên chứa `l2-co-so-lieu`, `l2-ba-muc`, `l2-vang`, `l2-len-muc-tieu`, `l2-dau-kara`, `l2-chu`, mỗi test so giá trị nguyên thuỷ đúng như `expected` của E1–E6 và in thông điệp ghim khi sai (`dong can cu rong`, `muc tin tinh lai o man`, `dau kara tren ly do cua nguoi`, `khung gop vao rong`, `can cu`).
- [ ] Step 2: chạy `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/duong-ly-do.dom.tsx` → ĐỎ (chưa có `data-ly-do`).
- [ ] Step 3: thêm khoá chữ vi/en; viết `ly-do-noi-gop.tsx`; trong `KhuGopVao` đổi `title={m.khuGopVao}` → `m.khuDuongLyDo` và đặt `<LyDoNoiGop g={g} />` trong `ItemContent` SAU `ItemDescription`.
- [ ] Step 4: chạy lại → XANH; chạy `bun test ./test/messages-guard.spec.ts`; chạy `muc-tieu-va-kr.dom.tsx -t sheet-chi-tiet`, `-t ST-mtkr-sheet`, `gop-y-dung-cho-luot-2.dom.tsx -t k3-khung` → XANH.
- [ ] Step 5: phá thử từng thông điệp ghim (bỏ dòng căn cứ, suy mức ở màn, bỏ điều kiện `lyDoTuKara`, luôn vẽ vùng) → đỏ đúng thông điệp; trả lại; commit `feat(duong-ly-do-muc-tieu): lý do, căn cứ, mức tin trong vùng Đường lý do`.

### Task 2: Bộ OKR mẫu gieo ba mức tin

`independent: true` · phục vụ E8, E9

**Files:**
- Modify: `apps/api/scripts/okr-mau/khuon.ts` (schema `canChinh` ~L143; kiểm ~L360)
- Modify: `apps/api/scripts/okr-mau/nap.ts` (`okrAlignment.createMany` ~L602)
- Modify: `apps/api/scripts/okr-mau/cong-ty.json` (`q4-kd-bac-1`, `q4-kd-bac-2`)
- Create: `apps/api/test/okr-mau-ly-do.spec.ts`
- Create: `_acceptance/duong-ly-do-muc-tieu/rang/ca-man.json`

**Interfaces:**
- `canChinh: { mucTieu?, kr?, lyDo?: string (trim, 1–500), canCu?: string (trim, 1–500), lyDoTuKara?: boolean }`; luật: `canCu` mà không `lyDo` → `loi(["mucTieu", i, "canChinh", "canCu"], "căn cứ cần đi kèm lý do")`.
- `ca-man.json`: `{ "nguoiXem": "<mã người bộ mẫu>", "ca": [{ "ma": "q4-kd-bac-1", "mucTin": "co-so-lieu", "kara": true, "dai": true }, { "ma": "q4-kd-bac-2", "mucTin": "dat-cuoc", "kara": false }, { "ma": "q4-kd-nam-2", "mucTin": "chua-co-ly-do", "kara": false }] }`.

- [ ] Step 1: viết `okr-mau-ly-do.spec.ts` (`laKhoThu`, `lamSachOkr`, `napMau`, `OkrService` qua `dungUngDung` như `okr-mau-cau-hinh.spec.ts`): describe `ly-do-mau` (tập `mucTin` đọc qua `OkrService.objective` của mọi mục tiêu mẫu có căn chỉnh === ba mức; từng ca khai trong `cong-ty.json` đọc lại đúng; ≥1 `lyDoTuKara`; bản sao bộ mẫu có `canCu` không `lyDo` → `LoiBoMau` với đường chứa `canChinh` và `canCu`, bỏ `canCu` → đọc được) và describe `man-doc-lai` (đọc `ca-man.json`, `mucTin` căn chỉnh đầu === khai).
- [ ] Step 2: chạy `bun run test -- "cd apps/api && bun test test/okr-mau-ly-do.spec.ts"` → ĐỎ.
- [ ] Step 3: sửa `khuon.ts`, `nap.ts` (`lyDo: m.canChinh?.lyDo ?? null`, `canCu: m.canChinh?.canCu ?? null`, `lyDoTuKara: m.canChinh?.lyDoTuKara ?? false`), thêm giá trị cho hai ca của `cong-ty.json`.
- [ ] Step 4: chạy lại → XANH; chạy `bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts test/okr-mau-cau-hinh.spec.ts"` → XANH.
- [ ] Step 5: phá thử `nap.ts` bỏ `lyDo` → `ly do mau khong vao csdl`; trả lại; commit `feat(duong-ly-do-muc-tieu): bộ OKR mẫu gieo lý do căn chỉnh`.

### Task 3: Bàn đo của hồ sơ

`independent: false` (cần Task 1, 2) · phục vụ E7, E10, E11, E12

**Files:**
- Create: `_acceptance/duong-ly-do-muc-tieu/rang/giu-ho-so.mjs`, `ranh-gioi.mjs`, `dot-bien.mjs`, `man.mjs`

- [ ] Step 1: `ranh-gioi.mjs` — neo merge-base `origin/onehub`, đọc ranh giới từ `## Notes` của contract, cho phép `_acceptance/duong-ly-do-muc-tieu/**`, `docs/**`, `PRODUCT-MAP.md`, `LO-TRINH.html`, tệp chỉ-thêm `_acceptance/config.yaml` và `apps/app/lib/messages/okr.ts`; hai đối chứng tự chạy trên danh sách giả.
- [ ] Step 2: `giu-ho-so.mjs` — tập eval đã ký có `paths` khớp diff (bộ đọc yaml của kho, `picomatch`/`minimatch` theo glob), chạy lệnh đã giải từ `config.yaml`, đếm, đối chứng hai chiều của bộ lọc, ba tệp không đổi.
- [ ] Step 3: `dot-bien.mjs` — bảy vết (a)–(g) như E11, mỗi vết sửa tạm một tệp, đòi lệnh đỏ + thông điệp ghim, `finally` trả lại, cuối `git diff --quiet`.
- [ ] Step 4: `man.mjs` — dựa trên bàn đo `kara-gop-y-luot-2/rang/man.mjs` (phiên đo riêng, `tien-de.mjs`), hai khổ, ba ca `ca-man.json`, đo cắt chữ trên từng phần tử + đối chứng đỏ trong trang, 6 ảnh vào `_acceptance/duong-ly-do-muc-tieu/evidence/`.
- [ ] Step 5: chạy E7, E11, E12 bằng lệnh `config:`; E10 chạy ở S4. Commit `chore(duong-ly-do-muc-tieu): bàn đo của hồ sơ`.
