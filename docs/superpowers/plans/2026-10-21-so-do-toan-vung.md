# Sơ đồ ở khung toàn vùng (VK6) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một màn Sơ đồ chiếm trọn vùng nội dung của khu Mục tiêu, có Toàn màn hình giấu thanh bên, hai kiểu xem (cả công ty, quanh một mục tiêu) trên cùng khung, thay cho Cây căn chỉnh, trang Sơ đồ quanh mục tiêu và cách xem Sơ đồ của Sức khoẻ.

**Architecture:** Hai trang `/okr/so-do` và đích rewrite `quanh-muc-tieu/[objectiveId]` (URL `/okr/so-do/muc-tieu/<id>`) cùng dựng một thành phần khách `ManSoDo({ tam })`. Trạng thái toàn màn hình sống trong một context của `okr/layout.tsx`; vỏ thôi dựng `AreaSidebar` khi bật (Hỏi-5). Đường cũ chuyển ở lớp trang bằng `redirect()` của `next/navigation`; `next.config.ts` không đổi.

**Tech Stack:** Next.js App Router (cacheComponents), React, TanStack Query + tRPC, nuqs, `@crm/ui` (`FlowMap`, `Breadcrumb`, `ToggleGroup`, `Button`), bun test + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-19-so-do-toan-vung-design.md` · hợp đồng `_acceptance/so-do-toan-vung/contract.md` (approved 21/10) · `_acceptance/so-do-toan-vung/evals.yaml`.

O = `apps/app/app/(app)/[slug]/okr`.

## Global Constraints

- **Chỉ bắt đầu sau khi #525 (VK7) gộp `onehub`**: `O/**` và `apps/app/components/crm/record-sheet/**` đang tạm né. Gộp `origin/onehub` vào nhánh, `bun install` nếu `bun.lock` đổi, rồi mới Task 1.
- Không viết chú thích trong code (AGENTS.md).
- Không sửa `apps/app/next.config.ts` (AC-5, sổ d-…-20).
- Không đổi `FlowMap`, `flow-layout`, đầu ra `okr.soDoDonVi`, `okr.quanhMucTieu`, `okr.cayCanChinh`; không thêm thủ tục API (OOS-2).
- Không chạm `packages/ui/src/components/area-sidebar.tsx` (Hỏi-5 đã chốt: vỏ thôi dựng thanh bên).
- Tệp chữ chung `apps/app/lib/messages/*.ts`, `_acceptance/config.yaml`: chỉ thêm dòng (luật 7). Sửa hay xoá dòng có sẵn → yêu cầu `cham-tep` trước.
- `objective-sheet.tsx` là vùng làn M5 → `cham-tep` trước Task 5.
- Hằng số tinh chỉnh vào config của khu (`O/toan-canh/so-do-config.ts` là nhà của `SO_DO`), không rải.
- Chữ mới: «Báo cáo», «Sơ đồ góp vào», «Toàn màn hình», «Thoát toàn màn hình», «Về sơ đồ cả công ty», «Xem trên sơ đồ», «Đang tải sơ đồ…», «Không tải được sơ đồ»; tên mục tiêu, KR, đơn vị mang `translate="no"`.
- Lệnh test dom: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/<tệp> -t <tên>`.
- Cổng cuối của mỗi task: `bun run check-types` và `bun run lint` xanh; trước S4: `bun run test`, `bun run lint:slop`, `bun run build`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành xanh, bản sao bị phá đỏ với thông điệp ghim (khối MEASURE-BIRTH của kit).

## Review Focus

1. Thu khung nhìn xuống dưới `md` khi đang toàn màn hình → hàng cuộn ngang của thanh bên phải trở lại (toàn màn hình tự tắt). Test ở Task 1.
2. Esc gõ trong một ô đang sửa của ngăn (ô tự xử Esc, `escTuXuLy`) → không thoát toàn màn hình. Test ở Task 1.
3. Rời hai đường Sơ đồ (vd bấm liên kết sang Bộ OKR trong ngăn) khi đang toàn màn hình → trang đích phải có thanh bên. Test ở Task 1.
4. Đường cũ Sức khoẻ `?xemToanCanh=so-do&kyOkr=<k>` → đích giữ cả `kyOkr`, không nhảy kỳ. Test ở Task 3.
5. `/okr/bo-okr?xemOkr=cay` không kèm `donOkr` (hay `donOkr=goc`) → tới `/okr/so-do` không mang `moDonVi`, không lỗi. Test ở Task 4.

---

### Task 1: Trạng thái toàn màn hình của vỏ khu

independent: false · phục vụ E2 (nền), Review Focus 1–3

**Files:**
- Create: `O/toan-man-hinh.tsx`
- Modify: `O/layout.tsx`, `O/thanh-ben-muc-tieu.tsx` (chỉ chỗ dựng `AreaSidebar` trong `ThanhBenMucTieu`)
- Modify: `_acceptance/config.yaml` — thêm một lần mọi khoá `executors.test.vk6_khung|vk6_toan_man|vk6_hai_kieu|vk6_loi_vao|vk6_duong_cu|vk6_bo_cay|vk6_hep|vk6_trang_thai|vk6_chu` và `executors.script.vk6_man|vk6_giu_ho_so` theo khuôn `vkm_*` (dòng ~2115, ~3251); `vk6_man` chạy qua `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/so-do-toan-vung/rang/man.mjs"` như `vkm_man`.
- Test: `apps/app/test/okr-toan-man-hinh.spec.ts` (thuần), ca dom ở Task 2.

**Interfaces:**
- Produces:
  - `export type BuocEsc = "nhuong" | "dong-the" | "thoat"`
  - `export function buocEsc(vao: { tuXuLy: boolean; lopMo: boolean; theDonViMo: boolean }): BuocEsc` — `tuXuLy || lopMo` → `"nhuong"`; else `theDonViMo` → `"dong-the"`; else `"thoat"`.
  - `export function laDuongSoDo(duong: string): boolean` — đúng cho `/<slug>/okr/so-do` và `/<slug>/okr/so-do/muc-tieu/<id>`, sai cho mọi đường khác (kể cả `/okr/so-do-x`).
  - `export function ToanManHinhProvider({ children }: { children: ReactNode })` — giữ `bat: boolean` trong state; tự về `false` khi `usePathname()` thôi `laDuongSoDo`, và khi `useIsMobile()` thành `true`.
  - `export function useToanManHinh(): { bat: boolean; dat: (bat: boolean) => void }`
  - `export function lopDangMo(doc: Document): boolean` — có phần tử `[role=dialog][data-state=open]`, `[role=alertdialog][data-state=open]` hoặc `[role=menu][data-state=open]`.

- [ ] **Step 1: Viết test thuần** `okr-toan-man-hinh.spec.ts`, describe `vk6-toan-man-thuan`: ma trận viết trước 8 ô của `buocEsc` (2³), mỗi ô một assert; `laDuongSoDo` với 5 đường (`/ws/okr/so-do` đúng, `/ws/okr/so-do/muc-tieu/m1` đúng, `/ws/okr/so-do-x` sai, `/ws/okr/bo-okr` sai, `/ws/okr` sai); `lopDangMo` trên document jsdom có/không một `div role=dialog data-state=open`.
- [ ] **Step 2: Chạy** `cd apps/app && bun test ./test/okr-toan-man-hinh.spec.ts` → FAIL «Cannot find module».
- [ ] **Step 3: Viết `O/toan-man-hinh.tsx`** với các export trên (`"use client"`).
- [ ] **Step 4: Nối vỏ.** `OkrLayout` bọc nội dung bằng `ToanManHinhProvider`; `ThanhBenMucTieu` (và `ThanhBenMucTieuCho`) trả `null` khi `useToanManHinh().bat`. Không `className` giấu.
- [ ] **Step 5: Chạy lại** → PASS; `bun run check-types` xanh.
- [ ] **Step 6: Commit** `feat(so-do-toan-vung): trạng thái toàn màn hình của vỏ khu Mục tiêu`.

### Task 2: Màn Sơ đồ toàn vùng (`ManSoDo`) cho hai đường

independent: false (dùng Task 1) · phục vụ E1, E2, E3, E7, E8

**Files:**
- Create: `O/so-do/man-so-do.tsx` (khách), `O/so-do/dai-cong-cu.tsx` (khách)
- Modify: `O/so-do/page.tsx`, `O/so-do/so-do.tsx` (thôi dựng `XemCay`; xoá tệp nếu không còn ai dùng), `O/quanh-muc-tieu/[objectiveId]/page.tsx`, `O/quanh-muc-tieu/quanh-muc-tieu.tsx`, `O/toan-canh/so-do-don-vi.tsx`, `O/soan/khung-trang-okr.tsx`
- Modify: `apps/app/lib/messages/okr-vo-khu.ts` (thêm khoá dưới `soDo`: `baoCao`, `soDoGopVao`, `toanManHinh`, `thoatToanManHinh`, `veCaCongTy`, `dangTai`, `loiTieuDe`)
- Test: `apps/app/test/okr-so-do-toan-vung.dom.tsx` — describe `vk6-khung`, `vk6-toan-man`, `vk6-hai-kieu`, `vk6-hep`, `vk6-trang-thai`

**Interfaces:**
- Consumes: `useToanManHinh`, `buocEsc`, `lopDangMo` (Task 1); `escTuXuLy` (`@crm/ui/lib/tu-xu-ly-esc`); `QuanhMucTieuNoiDung`, `SoDoDonVi` (giữ tệp tại chỗ — sổ S2).
- Produces:
  - `export function ManSoDo({ tam }: { tam: string | null })` — dựng `<div data-man-so-do class="flex min-h-0 flex-1 flex-col gap-3">` gồm `DaiCongCu` rồi vùng `flex-1 min-h-0` chứa `SoDoDonVi` (tam null) hay `QuanhMucTieuNoiDung` (tam).
  - `export function DaiCongCu({ tam, tenTam }: { tam: string | null; tenTam: string | null })` — `<div data-dai-cong-cu>` một dòng: `Breadcrumb` («Báo cáo › Sơ đồ góp vào» hoặc «Báo cáo › Sơ đồ › <tenTam translate=no>»), khi `tam === null` slot lọc, khi có tâm liên kết `veCaCongTy` → `/<slug>/okr/so-do`; nút `Button variant="outline"` `aria-pressed={bat}` chữ `toanManHinh`/`thoatToanManHinh`, ẩn khi `useIsMobile()`.
  - `export function laDuongCanKhungToanVung(duong: string): boolean` trong `khung-trang-okr.tsx` = `laDuongSoDo`.
  - `SoDoDonVi` nhận thêm prop `lop: "trang" | "toan-vung"` (mặc định `"trang"` để DH4 giữ hình cũ tới khi Task 3 bỏ chỗ gọi cũ); `"toan-vung"` → bỏ `style={{height: SO_DO.khung.caoPx}}`, khung `flex-1 min-h-0`, `ToggleGroup` lọc chuyển vào slot của `DaiCongCu` qua portal hoặc prop render (người làm chọn; test chỉ đòi lọc nằm trong `[data-dai-cong-cu]`).
  - `QuanhMucTieuNoiDung` nhận cùng prop `lop`, `"toan-vung"` bỏ chiều cao `QUANH.khung.caoPx` và báo `tenTam` lên `ManSoDo` (callback `onTenTam?: (ten: string) => void`).

- [ ] **Step 1: Viết test** `okr-so-do-toan-vung.dom.tsx` theo khuôn `vo-khu-muc-tieu.dom.tsx` (mock server, trpc Proxy, `next/navigation` với `dinhVi.duong`, `NuqsTestingAdapter`), dữ liệu sơ đồ sinh bằng `gopSoDoDonVi(dauVaoThuan())` và `gopQuanhMucTieu(mucTieuThuan(...), mtSoDo("a1-1"))` từ `apps/api/scripts/okr-mau/ca-so-do.ts` rồi parse bằng schema đầu ra thật (không viết tay). Năm describe đúng như `expected` của E1, E2, E3, E7, E8 trong `evals.yaml` — đếm assert theo ma trận khai ở đó (E2: 6 bước, 4 ô lớp; E3: 9 ô; E8: 4 ô). Ca E2 bước (5) dùng `Sheet`, `Dialog`, `DropdownMenu` thật của `@crm/ui` và `moDonVi`. Thêm ca Review Focus 1–3 vào `vk6-toan-man`.
- [ ] **Step 2: Chạy** `-t vk6-` → FAIL.
- [ ] **Step 3: Viết `DaiCongCu`, `ManSoDo`**, nối Esc: `useEffect` khi `bat` gắn `keydown` ở `document` pha capture; `e.key === "Escape"` → `buocEsc({ tuXuLy: escTuXuLy(e.target), lopMo: lopDangMo(document), theDonViMo: moDonVi !== null })`; `"dong-the"` → `datThamSo({ moDonVi: null })`; `"thoat"` → `dat(false)`.
- [ ] **Step 4: Đổi hai trang.** `so-do/page.tsx`: bỏ `PageShellHeader`, dựng `<ManSoDo tam={null}/>` trong `Suspense` với fallback là `DaiCongCu` thật + khung xương (`aria-busy`, sr-only `dangTai`); prefetch `okr.soDoDonVi` thay `okr.cayCanChinh`. `quanh-muc-tieu/[objectiveId]/page.tsx`: bỏ `PageShell` và `NutVeSoDo`, dựng `<ManSoDo tam={objectiveId}/>`, giữ prefetch `okr.quanhMucTieu` có `.catch`.
- [ ] **Step 5: Khung.** `KhungTrangOkr`: `laDuongSoDo(pathname)` → `<PageShell className="min-h-0" contained width="full">`.
- [ ] **Step 6: Chạy** `-t vk6-` → PASS năm describe; chạy lại `okr-quanh-muc-tieu.dom.tsx`, `okr-so-do-don-vi.dom.tsx` và ghi ca nào đỏ (đầu vào Task 8, không sửa thước ở đây).
- [ ] **Step 7: Phá-thử** trong bản sao: bọc trang bằng `PageShell` mặc định → `vk6-khung` in `khung con be rong toi da`; bỏ kiểm `theDonViMo` → `vk6-toan-man` in `esc nuot toan man hinh: the-don-vi`. Khôi phục, commit trước khi phá.
- [ ] **Step 8: Commit** `feat(so-do-toan-vung): màn Sơ đồ toàn vùng cho cả công ty và quanh mục tiêu`.

### Task 3: Sức khoẻ thôi cách xem Sơ đồ, đường cũ tới `/okr/so-do`

independent: true · phục vụ E5, Review Focus 4

**Files:**
- Create: `O/so-do/duong-so-do.ts`
- Modify: `O/toan-canh/page.tsx`, `O/toan-canh/toan-canh.tsx` (bỏ `ViewSwitch` Bảng/Sơ đồ và import động `so-do-don-vi`), `O/okr-search-params.ts` (`CACH_XEM_TOAN_CANH`, `soDoParsers.xemToanCanh`)
- Test: `apps/app/test/so-do-toan-vung-duong-cu.spec.ts` — describe `vk6-duong-cu`

**Interfaces:**
- Produces:
  - `export function duongSoDoTuSucKhoe(slug: string, thamSo: Record<string, string | string[] | undefined>): string | null` — `xemToanCanh === "so-do"` → `/<slug>/okr/so-do` kèm đúng các khoá có mặt trong `moDonVi`, `locSoDo`, `kyOkr` (thứ tự đó); khác → `null`.
  - `export function duongSoDoTuBoOkr(slug: string, thamSo: Record<string, string | string[] | undefined>): string | null` — `xemOkr === "cay"` → `/<slug>/okr/so-do`, kèm `moDonVi=<donOkr>` khi `donOkr` có và khác `goc`, kèm `kyOkr` khi có; khác → `null`. (Dùng ở Task 4.)
  - `ToanCanhPage({ params, searchParams })`: thêm `<Suspense fallback={null}><ChuyenSoDoCu …/></Suspense>` theo khuôn `O/soan/[cuocSoanId]/page.tsx` (`async function …(): Promise<null>` gọi `redirect`).

- [ ] **Step 1: Viết test** đúng năm ca của E5 trong `evals.yaml` (redirect `next.config` qua `getPathMatch`/`prepareDestination` như `vo-khu-chuyen-huong.spec.ts`; gọi hàm trang và bắt lỗi `NEXT_REDIRECT`; so `redirects()`/`rewrites()` với bản ở merge-base), cộng ma trận thuần của `duongSoDoTuSucKhoe` (có/không từng khoá, có `kyOkr` — Review Focus 4) và quét tĩnh `toan-canh/**`.
- [ ] **Step 2: Chạy** → FAIL.
- [ ] **Step 3: Viết `duong-so-do.ts`, nối trang Sức khoẻ, bỏ cách xem Sơ đồ.**
- [ ] **Step 4: Chạy** → PASS; phá-thử: bỏ lệnh chuyển → `SAI so-do-tu-suc-khoe: khong chuyen`.
- [ ] **Step 5: Commit** `feat(so-do-toan-vung): đường cũ Toàn cảnh › Sơ đồ tới màn Sơ đồ`.

### Task 4: Bỏ Cây căn chỉnh

independent: false (dùng `duongSoDoTuBoOkr` của Task 3) · phục vụ E6, Review Focus 5

**Files:**
- Modify: `packages/validation/src/okr-tham-so.ts` (`CACH_XEM_OKR` bỏ `"cay"`), `O/theo-don-vi/hang-cong-cu.tsx:38`, `O/theo-don-vi/theo-don-vi.tsx` (bỏ `XemCay` và nhánh `xem === "cay"`), `O/theo-don-vi/page.tsx` (bỏ prefetch `cayCanChinh`, thêm chuyển `ChuyenSoDoCu` dùng `duongSoDoTuBoOkr` trên searchParams thô)
- Delete: `O/cay-can-chinh.tsx`, `apps/app/test/cay-can-chinh-ly-do.dom.tsx` (thước L3 đi Task 8)
- Modify tests đang đo Cây: `okr-theo-don-vi.dom.tsx` ca `theo-don-vi-cay`, `okr-trang-don-vi.dom.tsx` chỗ dùng `xemOkr=cay` — ghi danh sách vào Task 8 nếu thuộc hồ sơ đã ký.
- Test: `okr-so-do-toan-vung.dom.tsx` — describe `vk6-bo-cay`

- [ ] **Step 1: Viết test** `vk6-bo-cay` đúng E6 (`CACH_XEM_OKR` rút từ `@crm/validation`; hàm trang Bộ OKR với `{xemOkr: "cay", donOkr: <cskh>}` → `NEXT_REDIRECT` tới `/ws/okr/so-do?moDonVi=<cskh>`; ca không `donOkr` và `donOkr=goc` → không `moDonVi` (Review Focus 5); `/okr/so-do` không `[role=tree]`; quét tĩnh không tệp nào trong `apps/app` import `cay-can-chinh`, in `con dung cay: <tệp>`).
- [ ] **Step 2: Chạy** → FAIL. **Step 3:** sửa và xoá như trên. **Step 4:** PASS + `check-types`.
- [ ] **Step 5: Commit** `feat(so-do-toan-vung): bỏ Cây căn chỉnh, đường cũ tới Sơ đồ`.

### Task 5: Nút «Xem trên sơ đồ» trong ngăn mục tiêu

independent: true · phục vụ E4 · **chờ `cham-tep` cho `objective-sheet.tsx`**

**Files:**
- Modify: `apps/app/lib/messages/okr-quanh.ts` (thêm khoá `xemTrenSoDo`: «Xem trên sơ đồ» / «View on map»), `apps/app/components/crm/record-sheet/objective-sheet.tsx` (`NutXemQuanh` dòng ~1130 đổi `m.nutXemQuanh` → `m.xemTrenSoDo`; giữ `NextLink`, giữ href)
- Test: `apps/app/test/okr-so-do-loi-vao.dom.tsx` — describe `vk6-loi-vao`, dựng bằng `dungSheet` của `khung-gop-y-dung-cho.tsx`

- [ ] **Step 1:** gửi `cham-tep` cho `objective-sheet.tsx` (vùng M5) qua giám sát; chờ trả lời.
- [ ] **Step 2: Viết test** đúng E4 (một `a` chữ `xemTrenSoDo`, href `/ws/okr/so-do/muc-tieu/mt-s` không chuỗi truy vấn; ngăn không còn chữ «Xem quanh mục tiêu»; `[data-khu=gop-vao]` đếm như trước; NOT_FOUND không nút). **Step 3:** FAIL. **Step 4:** sửa. **Step 5:** PASS; phá-thử giữ khoá cũ → `chu nut cu`.
- [ ] **Step 6: Commit** `feat(so-do-toan-vung): nút Xem trên sơ đồ trong ngăn mục tiêu`.

### Task 6: Chữ, phím và dòng ngoại lệ «màn toàn vùng»

independent: false (đo chữ Task 2) · phục vụ E9, E1 (vế `docs/design.md`)

**Files:**
- Modify: `docs/design.md` mục «Khung trang» — thêm đúng một dòng: màn toàn vùng (Sơ đồ) dùng dải công cụ một dòng có đường mảnh làm tiêu đề thay `PageShellHeader`, không `PageShellDescription`, khung `PageShell width="full" contained`; ngoại lệ chỉ cho màn mà một mặt vẽ chiếm trọn vùng.
- Test: `okr-so-do-toan-vung.dom.tsx` — describe `vk6-chu`; `apps/app/test/messages-guard.spec.ts` phải xanh.

- [ ] **Step 1: Viết test** đúng E9 (khoá mới rút từ object `vi`, `vi !== en`; `translate=no` trên tên; nút có `focus-visible`; `textContent` hai kiểu xem không chứa «căn chỉnh», đối chứng dương chèn nút «Căn chỉnh»). **Step 2:** chạy → đỏ ở chỗ còn thiếu. **Step 3:** bổ sung chữ, thêm dòng `docs/design.md`. **Step 4:** PASS + `messages-guard.spec.ts`.
- [ ] **Step 5: Commit** `docs(so-do-toan-vung): ngoại lệ màn toàn vùng và chữ của Sơ đồ`.

### Task 7: Bàn đo màn thật

independent: false (cần Task 2–5) · phục vụ E10

**Files:**
- Create: `_acceptance/so-do-toan-vung/rang/man.mjs` (khuôn `_acceptance/vo-khu-muc-tieu/rang/do-man.mjs`, chạy dưới `tien-de.mjs`, ảnh ra `.acceptance-runs/so-do-toan-vung/`)

- [ ] **Step 1:** viết đủ bốn bước của E10 (`steps` trong `evals.yaml`): vùng nội dung = `main[data-slot=page-shell-scroll]`; đo ở 1440 thường, toàn màn hình, sau Esc, 1920; điều hướng thật bằng `window.__vk6Dau`; 390 hai kiểu xem; tâm và KR kỳ vọng rút từ `mtSoDo` của `ca-so-do.ts`.
- [ ] **Step 2:** chạy `bun run do:man --chay "bun _acceptance/so-do-toan-vung/rang/man.mjs"` → mọi dòng `DUNG`, 6 ảnh.
- [ ] **Step 3:** ba phá-thử trong bản sao (`khung ve khong chiem tron`, `khung con be rong toi da`, `SAI dieu-huong-giu-toan-man: tai-lai`).
- [ ] **Step 4: Commit** `test(so-do-toan-vung): bàn đo màn Sơ đồ toàn vùng`.

### Task 8: Giữ hồ sơ đã ký và chuyển thước theo khuôn luật 21

independent: false (chạy sau mọi task mã) · phục vụ E11

**Files:**
- Create: `_acceptance/so-do-toan-vung/rang/giu-ho-so.mjs` (khuôn `_acceptance/ngan-kr-mot-cho/rang/giu-ho-so.mjs` của VK7), `rang/chuoi-bo.json`, `rang/giu-ui.json`, `rang/anh-xa-nghi.json`
- Modify (chỉ chỗ đo màn cũ, theo kết quả lượt chạy): `_acceptance/so-do-quanh-muc-tieu/evals.yaml` (dự kiến E4 chữ href, E5–E9, E11, E12), `_acceptance/so-do-can-chinh-don-vi/evals.yaml` (E4, E12), `_acceptance/cay-can-chinh-co-ly-do/evals.yaml` (E3–E8, E10), `_acceptance/vo-khu-muc-tieu/evals.yaml` + `rang/do-man-dieu-huong.mjs:105,108` (E4 bộ chọn `[data-so-do-gop-vao] [data-cay-khoa]`), cùng mọi hồ sơ khác script in `DO`/`MAT THUOC`.

- [ ] **Step 1:** viết `giu-ho-so.mjs` đúng E11 (vế (a) paths, vế (b) chuỗi bỏ trên mọi executor; chạy lại eval test/script; ui-check/judgment cần nghỉ hoặc dòng `giu-ui.json`; đối chứng dương DH5 ui-check, DH5 E4, `khung-man-chung`, VK2 E4).
- [ ] **Step 2:** chạy → danh sách `DO`/`MAT THUOC`. Gửi `cham-tep` một lần cho mọi tệp `_acceptance/<hồ sơ đã ký>/**` cần chạm.
- [ ] **Step 3:** từng eval: đổi đúng chỗ đo màn cũ sang màn mới, hoặc khai `status: not-run` + `superseded_by: so-do-toan-vung#AC-n` + dòng `anh-xa-nghi.json`; đo hai chiều; mỗi hồ sơ một dòng sổ `fix` mang `decided_by: Phan Le Manh` trỏ sổ d-20261019T121155Z-14.
- [ ] **Step 4:** chạy lại → chỉ `GIU`; `bun run test` xanh toàn kho.
- [ ] **Step 5: Commit** `fix(so-do-toan-vung): chuyển thước hồ sơ đã ký sang màn Sơ đồ`; đặt contract `status: implemented`, bàn giao S4 cho giám sát (xin dãy rảnh).
