# Soạn OKR trong khung bản ghi — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cuộc soạn OKR mở trong khung bản ghi (`?record=soan:<cuộc>`), một bề mặt liền: bản nháp trái, Kara cố định phải.

**Architecture:** Thêm loại bản ghi `soan` vào chồng `?record=` và một `SoanSheet` trong `RecordSheetHost`. Bề ngang đi từ hai token sẵn có qua cỡ sheet `kara` mới; vỏ «dock» (một đường kẻ, đầu mảnh) là thành phần mới trong `packages/ui/src/components/kara/`. Bảo vệ lượt dùng lại cơ chế giữ thay đổi `giu-thay-doi` với câu hỏi riêng.

**Tech Stack:** Next.js 16 App Router, React 19, nuqs, TanStack Query qua tRPC, Radix Sheet, vaul Drawer, eve/react, bun test + jsdom, puppeteer cho phép đo màn.

**Spec:** `docs/superpowers/specs/2026-10-09-soan-okr-trong-khung-design.md` · hợp đồng `_acceptance/soan-okr-trong-khung/contract.md` · bộ đo `evals.yaml`.

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Bề ngang chỉ từ `--container-assist-rail` (380px) và `--container-assist` (800px); không số px ở chỗ gọi (AC-10).
- Biến thể mới sống trong `packages/ui`, không `className` đổi màu/góc/khoảng cách của thành phần `@crm/ui` ở chỗ gọi (`docs/design.md`).
- Không sửa `packages/ui/src/components/kara/state.tsx` (K3). Khung cột Kara ở tệp mới.
- Không đổi lời gọi định dạng ngày giờ trong `nut-soan.tsx`, `danh-sach-cuoc.tsx`, `bang-nhap.tsx` (K3); chỉ bọc khung.
- `apps/app/test/khung-soan-okr.tsx`: dựa trên bản K2c (`datNgonNgu`) sau khi gộp onehub; không viết lại hàm đó.
- Giữ các thuộc tính `data-o="hoi-thoai"`, `data-o="ban-nhap"`, `data-cot`, `data-trang-soan`, `data-khung` mà phép đo K2 đọc.
- Hằng tinh chỉnh vào `okr/soan/cau-hinh.ts` (`SOAN_UI`), không đặt rải.
- Chuỗi người đọc qua `apps/app/lib/messages/okr-soan.ts` (vi + en).

## Review Focus

- Mở bản ghi khác chồng lên khung soạn rồi đóng lại: khung soạn dựng lại và nối tiếp lượt (AC-8) — kiểm ở Task 6 (DOM) và E8 (màn).
- Kara nộp bản nháp đầu khi khung đang hẹp: khung rộng ra mà ô soạn không bị tháo dựng lại (mất chữ đang gõ) — Task 5 đo cùng tham chiếu phần tử.
- Liên kết cũ `?cuocSoan=` cùng lúc có `record=` khác trên URL: thay đúng, giữ bản ghi kia dưới chồng — Task 4.
- Cuộc đã đưa vào rồi mở lại: khung rộng ngay, không nút quyết, đóng không hỏi — Task 6.
- Người không còn quyền soạn mở `record=soan:<id>`: khung hiện lỗi đóng được, không vỡ trang nền — Task 4 ô (e).

---

### Task 1: Cỡ `kara` cho sheet và ngăn kéo phủ toàn màn (`packages/ui`)

independent: true · phục vụ E3, E6, E10, E13

**Files:**
- Modify: `packages/ui/src/components/sheet.tsx` (biến thể `size`)
- Modify: `packages/ui/src/components/drawer.tsx` (`DrawerContent` thêm `phuToanMan`)
- Modify: `apps/app/components/responsive-sheet.tsx` (cỡ `kara` → ngăn kéo phủ toàn màn)
- Test: `packages/ui/test/sheet-co-kara.dom.tsx`

**Interfaces:**
- Produces: `SheetSize` có thêm `"kara"`; `DrawerContent` nhận `phuToanMan?: boolean` và gắn `data-phu-toan-man`.

- [ ] **Step 1: Viết bài DOM đỏ** — dựng `Sheet open` + `SheetContent size="kara"`: đòi `data-size="kara"` và className chứa `sm:w-auto` cùng `max-w-[calc(100%-2rem)]`; dựng `Drawer open` + `DrawerContent phuToanMan`: đòi `data-phu-toan-man=""` và className chứa `h-dvh`. Đối chứng: `DrawerContent` không cờ thì không có `data-phu-toan-man`.
- [ ] **Step 2: Chạy** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/sheet-co-kara.dom.tsx` → FAIL (`kara` không phải size).
- [ ] **Step 3: Cài**
  - `sheet.tsx` biến thể: `kara: "data-[side=left]:sm:w-auto data-[side=right]:sm:w-auto data-[side=left]:sm:max-w-[calc(100%-2rem)] data-[side=right]:sm:max-w-[calc(100%-2rem)]"`.
  - `drawer.tsx`: prop `phuToanMan`, khi bật thêm `data-phu-toan-man=""` và lớp `data-[vaul-drawer-direction=bottom]:h-dvh data-[vaul-drawer-direction=bottom]:max-h-dvh data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:rounded-t-none`.
  - `responsive-sheet.tsx`: nhánh ngăn kéo — `size === "kara"` thì `phuToanMan` và không gắn lớp `h-[88dvh]`.
- [ ] **Step 4: Chạy lại** → PASS; phá thử: bỏ `max-w` → đỏ thông điệp «kara khong co tran».
- [ ] **Step 5: Commit** `feat(ui): cỡ sheet kara theo nội dung, ngăn kéo phủ toàn màn`.

### Task 2: Vỏ dock cho cột Kara và bản nháp (`packages/ui/src/components/kara/`)

independent: true · phục vụ E3, E4, E10, E13

**Files:**
- Create: `packages/ui/src/components/kara/dock.tsx`
- Modify: `packages/ui/src/components/kara/artifact.tsx` (`variant?: "card" | "docked"`, chỉ thêm)
- Test: `packages/ui/test/kara-dock.dom.tsx`

**Interfaces:**
- Produces: `KaraDock({ side: "rail" | "fill", children })` — `rail` rộng `w-(--container-assist-rail)` có `border-l`, `fill` là `flex-1 min-w-0`; `KaraDockHeader({ children })` cao `h-11`, `border-b`; `KaraDockBody({ children })` cuộn riêng `overscroll-contain`; `KaraDockFooter({ children })`. Mỗi phần mang `data-slot="kara-dock*"`.
- Produces: `KaraArtifact variant="docked"` — không viền, không bo; đầu `h-11`; thân giới hạn `max-w-(--container-assist)`.

- [ ] **Step 1: Bài đỏ** — `KaraDock side="rail"` có lớp chứa `--container-assist-rail` và `border-l`; `side="fill"` không có `border-l`; `KaraArtifact variant="docked"` không có lớp `border`/`rounded` trên `[data-slot=kara-artifact]` và thân có `--container-assist`; mặc định (`card`) giữ nguyên lớp cũ (đối chứng).
- [ ] **Step 2: Chạy** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/kara-dock.dom.tsx` → FAIL.
- [ ] **Step 3: Cài** `dock.tsx` (bốn thành phần trên) và nhánh `docked` trong `artifact.tsx` dựng bằng `KaraDockHeader`/`KaraDockBody`/`KaraDockFooter` thay `ArtifactHeader`/`ArtifactContent`, giữ `KaraBusyProvider`, `KaraMark`, `KaraState`.
- [ ] **Step 4: Chạy lại** → PASS; phá thử: `docked` còn `border` → đỏ «docked con vien».
- [ ] **Step 5: Commit** `feat(ui/kara): vỏ dock cho cột Kara và bản nháp phẳng`.

### Task 3: Câu hỏi riêng cho bộ giữ thay đổi (`giu-thay-doi`)

independent: true · phục vụ E7

**Files:**
- Modify: `packages/ui/src/components/giu-thay-doi.tsx`
- Test: `packages/ui/test/giu-thay-doi-loi-hoi.dom.tsx`

**Interfaces:**
- Produces: `export type LoiHoi = { tieuDe: string; than: string; nut: string; thoi: string }`; `useKhaiThayDoi(loiHoi?: LoiHoi): (coChu: boolean) => void`; `GiuNguCanh.khai(id, coChu, loiHoi?)`. Hộp hỏi dùng `loiHoi` của khai đầu tiên đang bật có câu riêng, vắng thì `msg.dialog.boThayDoi` như cũ.

- [ ] **Step 1: Bài đỏ** — Sheet mở, con gọi `khai(true)` với `LoiHoi` riêng, bấm đóng → `[role=alertdialog]` chứa `tieuDe` riêng; con khai không câu → chứa chữ `boThayDoi.tieuDe` (đối chứng); `khai(false)` → đóng ngay không hộp.
- [ ] **Step 2–4:** chạy đỏ, cài (lưu `Record<string, { coChu: boolean; loiHoi?: LoiHoi }>`), chạy xanh; phá thử: bỏ nhánh câu riêng → đỏ «hop hoi khong theo khai».
- [ ] **Step 5: Commit** `feat(ui): bộ giữ thay đổi nhận câu hỏi riêng`.

### Task 4: Loại bản ghi `soan`, đường vào và liên kết

independent: false (sau Task 1) · phục vụ E1, E1b, E2, E2b

**Files:**
- Modify: `apps/app/components/crm/record-sheet/record-stack.ts` (`RECORD_KINDS` thêm `"soan"`)
- Modify: `apps/app/lib/record-href.ts` (nhận `"soan"`, nền `/okr/theo-don-vi`)
- Modify: `apps/app/components/crm/record-sheet/record-sheet-host.tsx` (prop `cauNoiOkr`, `size="kara"` cho `soan`, dựng `SoanSheet`)
- Modify: `apps/app/app/(app)/[slug]/layout.tsx` (truyền `cauNoiOkr={okrBridgeConfigured()}`)
- Create: `apps/app/components/crm/record-sheet/soan-sheet.tsx`
- Modify: `apps/app/app/(app)/[slug]/okr/soan/luat-ban-nhap.ts` (`duongMoCuoc`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx`, `danh-sach-cuoc.tsx` (chỉ chỗ mở: `router.push` → `useOpenRecord`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/chuyen-link-cu.ts` (`cuocSoan` → `record=soan:<id>`, history replace)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/[cuocSoanId]/page.tsx` (trang máy chủ đọc cuộc rồi `redirect(duongMoCuoc(...))`)
- Test: `apps/app/test/soan-okr-trong-khung.dom.tsx` (`-t sk-duong`, `-t sk-record`)

**Interfaces:**
- Produces: `duongMoCuoc(slug: string, cuocSoanId: string, dv: DonViSoan | null): string` → `/<slug>/okr/theo-don-vi?ky=..&don=..&record=soan:<id>` (dv null thì chỉ `record`).
- Produces: `SoanSheet({ cuocSoanId, cauNoi }: { cuocSoanId: string; cauNoi: boolean })`.

- [ ] **Step 1: Bài đỏ `sk-duong`** đúng năm ô của E1 (Soạn, Tiếp tục, link cũ replace, `duongMoCuoc` hai ca, id không có → lỗi trong khung) và **`sk-record`** đúng bốn ô của E2; mỗi khối in số ô và đòi đúng số đó.
- [ ] **Step 2: Chạy** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/soan-okr-trong-khung.dom.tsx -t sk-duong` → FAIL.
- [ ] **Step 3: Cài** theo danh sách tệp; `SoanSheet` = `DetailSheetHeader` (tiêu đề `trang.tieuDe`, mô tả `<span translate="no">đơn vị</span> · chu kỳ`) + `CuocSoanTrongKhung` (Task 5). Tiêu đề hiện ngay lúc đang mở.
- [ ] **Step 4: Chạy lại** cả hai khối → PASS; phá thử theo chiều đỏ của E1, E2.
- [ ] **Step 5: Commit** `feat(okr-soan): cuộc soạn là bản ghi soan, mở trong khung`.

### Task 5: Bố cục khung — bản nháp trái, Kara phải, khung lớn dần

independent: false (sau Task 2, 4) · phục vụ E3, E3b, E4, E5, E6

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/soan/khung-soan.tsx` (bỏ `Resizable*`; rộng: `KaraDock fill` bản nháp + `KaraDock rail` Kara, ô bản nháp chỉ khi `soDong > 0`; hẹp: `Tabs` line, khung rộng tối đa `--container-assist`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/trang-soan.tsx` (bỏ `DauTrangSoan`/`PageShell*`; xuất `CuocSoanTrongKhung`; `moCuoc` → mở bản ghi `soan` mới bằng replace)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx` (chỉ vỏ: `KaraDockHeader` mang `KaraMark scope={luot}` và trạng thái bận; ô soạn vào `KaraDockFooter`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/bang-nhap.tsx` (chỉ `variant="docked"` trên `KaraArtifact`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/cau-hinh.ts` (bỏ `ocHoiThoai`)
- Modify: `apps/app/test/khung-soan-okr.tsx` (dựng `CuocSoanTrongKhung` trong `DetailSheet` giả cho bài K2; không đụng `datNgonNgu`)
- Test: `apps/app/test/soan-okr-trong-khung.dom.tsx` (`-t sk-khung`, `-t sk-dau`)

**Interfaces:**
- Consumes: `KaraDock*`, `KaraArtifact variant`, `SoanSheet`.
- Produces: `CuocSoanTrongKhung({ cuocSoanId, cauNoi })`.

- [ ] **Step 1: Bài đỏ `sk-khung`** bốn ô của E3b (thứ tự tài liệu bản nháp trước Kara, không resizable, ô soạn giữ cùng phần tử khi bản nháp đầu tới) và **`sk-dau`** bốn ô của E5 (lượt ở đầu cột Kara, không ở đầu khung).
- [ ] **Step 2: Chạy** → FAIL.
- [ ] **Step 3: Cài** theo danh sách; cột Kara luôn là phần tử cuối của hàng và giữ khoá React ổn định để không tháo dựng.
- [ ] **Step 4: Chạy lại** + toàn bộ `soan-okr-trang.dom.tsx` của K2 (trừ `k2-duong`, `k2-khung` đã bị thay) → PASS.
- [ ] **Step 5: Commit** `feat(okr-soan): khung soạn một bề mặt — bản nháp trái, Kara phải`.

### Task 6: Bảo vệ lượt khi rời khung, trang nền sau Đưa vào

independent: false (sau Task 3, 5) · phục vụ E7, E7b, E8, E14

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/soan/trang-soan.tsx` (thành phần `KhaiKhiSoan` gọi `useKhaiThayDoi(LOI_HOI_SOAN)` theo `s.dangTraLoi`; `beforeunload` khi đang soạn)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/giu-trang.tsx` (gỡ — khung dùng bộ giữ của sheet)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts` (`duaVao.onSuccess` làm mới thêm `trpc.okr.soanSanSang.pathKey()`)
- Modify: `apps/app/lib/messages/okr-soan.ts` (khối `dong`: `hoiTieuDe`, `hoiMoTa`, `o`, `dong`)
- Test: `apps/app/test/soan-okr-trong-khung.dom.tsx` (`-t sk-dong`)

- [ ] **Step 1: Bài đỏ `sk-dong`** sáu ô của E7 (đang soạn/rảnh × ra ngoài/Esc/nút đóng; `agent.stop` giả 0 lần; focus về nút mở).
- [ ] **Step 2–4:** đỏ → cài → xanh; phá thử: gọi `agent.stop` khi tháo → đỏ «dong khung dung luot».
- [ ] **Step 5: Commit** `feat(okr-soan): đóng khung khi Kara đang soạn thì hỏi, không dừng lượt`.

### Task 7: Luật «Kara ở đâu», năm ô K2 bị thay, bản mẫu dùng thành phần thật

independent: true · phục vụ E10

**Files:**
- Modify: `docs/ai-ux.md` (mục «Kara ở đâu»: cột phải, vật phẩm mở thêm về trái, một bề mặt, áp Soạn OKR, khung deal ở K5)
- Modify: `_acceptance/soan-okr-trang-rieng/evals.yaml` (E1, E1b, E2, E2b, E14: `status: not-run` + `superseded_by: soan-okr-trong-khung#AC-1|AC-3|AC-11` theo bảng design doc)
- Modify: `apps/app/app/proto/_modules/soan-okr-trong-khung/index.tsx` (dùng `KaraDock`, `KaraArtifact variant="docked"`, sheet `kara`)

- [ ] **Step 1–3:** sửa; chạy `cd apps/app && bun test test/proto-catalog.spec.ts` và `bunx tsc --noEmit -p apps/app` → xanh.
- [ ] **Step 4: Commit** `docs(ai-ux): Kara ở đâu; K2 trỏ năm ô sang vòng khung`.

### Task 8: Thước của hồ sơ

independent: false (sau Task 4–6) · phục vụ E1b, E2b, E3, E4, E6, E7b, E8, E9, E10, E11, E13, E14

**Files:**
- Create: `_acceptance/soan-okr-trong-khung/rang/man.mjs` (các `--phan` của bộ đo, dùng lại `man-chung.mjs`/`kich-ban.mjs` của K2 bằng import tương đối suy từ vị trí tệp; `--kiem-do-do <ten>` dựng bản sao phá thử)
- Create: `_acceptance/soan-okr-trong-khung/rang/k2-song.mjs`, `luat.mjs`, `ranh-gioi.json`

- [ ] **Step 1:** viết từng phần đúng bước của evals; mỗi phần in số ô và đòi bằng số viết trước.
- [ ] **Step 2:** chạy chiều đỏ từng phần (`--kiem-do-do …`, `--tu-thu`) → đỏ đúng thông điệp ghim; chiều xanh trên cây → xanh.
- [ ] **Step 3: Commit** `test(soan-okr-trong-khung): thước màn, luật, K2 sống`.

### Task 9: Cổng kho

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` → xanh (test đầy đủ chạy ở S4).
