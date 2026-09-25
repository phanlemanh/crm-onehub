# Toàn cảnh OKR — kế hoạch làm

> **For agentic workers:** thực thi tuần tự trong phiên chính (feature-loop S3, T2).
> Mỗi task kết thúc bằng lệnh kiểm riêng xanh rồi commit; phép đo mới đi kèm cặp
> phá-thử theo `MEASURE-BIRTH-CLAUSE` (xanh → commit → phá trong bản sao → đỏ có
> thông điệp ghim).

**Goal:** Cả công ty nhìn được OKR mọi đơn vị trên một màn và họp tuần theo KR đáng bàn.

**Architecture:** Mọi số tính ở máy chủ trong `OkrXemService` (Prisma, số câu cố định)
cộng hàm thuần ở `apps/api/src/okr/{toan-canh,hop-tuan,dien-bien}.ts`; router `okr`
nối thêm thủ tục. Giao diện ghép từ `packages/ui` (sáu biến thể mới, cây từ
`@reui/tree`). Hai nhịp: nhịp 1 ngay, nhịp 2 sau khi lượt 4 và #146 lên `onehub`.

**Tech Stack:** NestJS + nestjs-trpc + Prisma 7, Next 16 App Router, nuqs, recharts 3,
`@headless-tree`, bun test (jsdom cho `*.dom.tsx`), puppeteer-core cho màn thật.

**Spec:** `docs/superpowers/specs/2026-09-26-toan-canh-okr-design.md` ·
hợp đồng `_acceptance/toan-canh-okr/contract.md` (approved) ·
phép đo `_acceptance/toan-canh-okr/evals.yaml`.

## Global Constraints

- Không chú thích trong mã. Không `useEffect` trần (dùng `useMountEffect`).
- Không mặc định chuỗi trong tham số destructure ở tệp mới; `?? "x"` ở chỗ dùng.
- Không `Intl` ở mức module; định dạng qua `@crm/ui/lib/format`.
- Chữ mới: `packages/ui/src/lib/messages.ts` (vi/en) và `apps/app/lib/messages/okr-toan-canh.ts`; hàm ghép chữ nhận đối số vô hướng.
- Chữ người nhập mang `translate="no"`.
- `apps/app` không `<table`, `<h1`, `<h2`, `divide-y`, hộp `rounded-lg border` tự dựng; `@crm/ui` chỉ nhập theo subpath.
- Không `Record<string, unknown>`; khuôn ra/vào bằng Zod ở `okr-xem.contracts.ts`.
- Lọc ở Prisma; số câu truy vấn không tăng theo số đơn vị; mỗi lời gọi < 1.000 ms trên bộ 50 đơn vị × 2.000 KR.
- Không sửa `okr.contracts.ts`, `lib/messages/okr.ts`, `chon-chu-ky.tsx`, `hop-thoai-nhap.tsx`, khung Cài đặt ở nhịp 1.
- PATH Node 24 cho mọi lệnh dựng: `/Users/manhphan/.local/share/fnm/node-versions/v24.15.0/installation/bin`.
- Gieo trong bài đo tự dọn theo tiền tố; không để lại dữ liệu thử trong kho `crm`.

## Review Focus

- Bộ phận không có phòng ban nào, hoặc phòng ban đã lưu trữ: `danhSach` và `toanCanh` không được ném, không đếm phòng ban lưu trữ — thêm ca vào bài `danh-sach` và `toan-canh-tien-do`.
- Kỳ chưa có mục tiêu công bố nào: `toanCanh` trả hàng với `tienDo: null`, màn hiện trạng thái tuần đầu — ca trong `toan-canh-tien-do`.
- Người vừa bị gỡ khỏi workspace vẫn là chủ KR: `danhSach` lọc theo người vẫn trả mục tiêu, facet có tên người — ca trong `danh-sach`.
- Tên dài (đơn vị, mục tiêu) ở 390: cây và bảng không tràn ngang — khẳng định `scrollWidth` trong `man-toan-canh.mjs`.
- Tham số lọc trên URL sai khuôn (`loaiOkr=la`): parser bỏ giá trị lạ, không 500 — ca trong bài dom `okr-loc.dom.tsx`.

---

## Nhịp 1

### Task 1: Thanh tiến độ trung tính và cặp chỉ báo (`packages/ui`)

**Files:** Modify `packages/ui/src/components/progress.tsx`, `packages/ui/src/lib/messages.ts`; Create `packages/ui/src/components/okr-status.tsx`, `packages/ui/test/okr-thanh-phan.dom.tsx`; Modify `packages/ui/test/render-diff.spec.tsx` (ca mới).
**Interfaces — Produces:**
- `Progress({ variant?: "neutral", value?: number, expected?: number | null, label?: string, ...Radix })` — `variant` vắng giữ hành vi cũ.
- `ConfidenceIndicator({ level: "cao" | "vua" | "thap", size?: "default" | "sm", short?: boolean })`
- `PaceIndicator({ pace: "dung-nhip" | "cham-nhip" | "truot" | "chua-co-ky-vong" | "moc-xong" | "moc-chua", size?: "default" | "sm" })`
- `messages.okr.{tuTin, tinhTrang, tienDo(p, k), tienDoKhongVach(p)}` vi/en.
**Verify:** `config:executors.test.tco_ui_thanh_phan` (E6) + `cd packages/ui && bun run test`.
**Phá-thử:** bản sao Progress neutral giữ `bg-primary` → E6 đỏ ghim className.
**independent:** true

### Task 2: Cây bàn phím (`@reui/tree` + `TreeNav`)

**Files:** Create (qua `bun run ui:add @reui/tree --dry-run` rồi thật) `packages/ui/src/components/reui/tree.tsx` + sửa bốn chỗ `docs/reui.md`; Create `packages/ui/src/components/tree-nav.tsx`, `packages/ui/test/tree-nav.dom.tsx`; Modify `packages/ui/package.json` (`@headless-tree/core`, `@headless-tree/react`).
**Interfaces — Produces:** `TreeNav<T>({ label, nodes: TreeNavNode<T>[], expanded: string[], onExpandedChange(ids), selectedId?: string | null, onSelect?(id), renderLabel(node) })` với `TreeNavNode<T> = { id: string; data: T; children?: TreeNavNode<T>[] }`.
**Verify:** `config:executors.test.tco_ui_cay` (E4).
**Phá-thử:** bỏ `hotkeysCoreFeature` → bước «mũi tên xuống» đỏ.
**independent:** true

### Task 3: Heatmap, biểu đồ đường có đích, chọn chu kỳ (`packages/ui`)

**Files:** Create `heatmap.tsx`, `target-line-chart.tsx`, `period-select.tsx` + ba bài `*.dom.tsx`; `messages.ts` thêm khoá.
**Interfaces — Produces:**
- `Heatmap({ caption, rows: {id,label,indent?}[], columns: {id,label,current?}[], values: (number|null)[][], formatValue(v) })` — bậc theo bảng «Thang heatmap» của design doc.
- `TargetLineChart({ label, data: {x,value,expected}[], target, targetLabel, formatValue, height? })`.
- `PeriodSelect({ label, groups: {label, items: {value,label,current?,closed?}[]}[], value, onValueChange })`.
**Verify:** `tco_ui_heatmap` (E12), `tco_ui_chon_ky` (E22), dom `target-line-chart` (E16c).
**independent:** true

### Task 4: `okr.danhSach` — lọc ở máy chủ

**Files:** Create `apps/api/src/okr/okr-xem.contracts.ts`, `okr-xem.service.ts`, `apps/api/test/okr-toan-canh.spec.ts`; Modify `okr.router.ts` (nối thêm), `okr.module.ts` (provider), `okr.service.ts` (`docMucTieu` công khai); regenerate `apps/api/src/generated/server.ts`.
**Interfaces — Produces:** `danhSachInput = {cycleId, unit: donViChon, loc: {phuTrach: string[], loai: LoaiMucTieu[], trangThai: TrangThaiMucTieu[], tuTin: MucTuTin[]}}`; `danhSachOutput = {rows: (MucTieuOutput & {krKhop: string[]})[], total, facetCounts: {phuTrach: Record<id,n>, loai, trangThai, tuTin}}`; `OkrXemService.donViCon(unit) → Prisma.OkrObjectiveWhereInput`.
**Verify:** `tco_danh_sach` (E1, nhịp-1 phần).
**independent:** false

### Task 5: `okr.toanCanh` (tiến độ) và `okr.sucKhoe` (phần có sẵn)

**Files:** Create `apps/api/src/okr/toan-canh.ts` (thuần `gopToanCanh`, `gopSucKhoe`), `apps/api/test/okr-toan-canh-thuan.spec.ts`; Modify `okr-xem.service.ts`, `okr-xem.contracts.ts`, `okr.router.ts`, `okr-config.ts` không sửa — hằng mới ở `okr-xem.config.ts` (`OKR_XEM`), câu lỗi `chiQuanTri`.
**Interfaces — Produces:** `toanCanhOutput = {tongQuan:{tienDo,kyVong,donViCongBo,tongDonVi,donViChuaDat:string[]}, hang: HangToanCanh[], tuan: string[]}` với `HangToanCanh = {key, ten, cap:"goc"|"bo-phan"|"phong-ban", tienDo:number|null, kyVong:number|null, soMucTieu, soKr}`; `sucKhoeOutput = {tongQuan:{tongKr, chuaKhoiDiem, chuaNoiKenh}, hang:{key,ten,cap,truong:{id,name}|null,tongKr,chuaKhoiDiem,chuaNoiKenh}[]}`.
**Verify:** `tco_toan_canh` (E8), `tco_hieu_nang` (E9 phần nhịp 1), `tco_suc_khoe` (E20 phần nhịp 1), `tco_pham_vi` (E24 phần nhịp 1).
**independent:** false

### Task 6: Thanh tiến độ và cây trong khu OKR

**Files:** Modify `apps/app/app/(app)/[slug]/okr/tien-do-kr.tsx`, `cay-don-vi.tsx`, `cay-can-chinh.tsx`, `apps/app/components/crm/record-sheet/objective-sheet.tsx` (chỉ chỗ `Progress` nếu có — nếu tệp đó chỉ dùng `TienDoKr` thì không sửa); Create `_acceptance/toan-canh-okr/rang/soi-ma.mjs`.
**Verify:** `tco_soi_ma` (E7), `cd apps/app && bun run test`.
**independent:** false

### Task 7: Bộ lọc «Theo đơn vị» và trang một người

**Files:** Create `apps/app/app/(app)/[slug]/okr/loc-okr.tsx`, `apps/app/lib/messages/okr-toan-canh.ts`, `apps/app/test/okr-loc.dom.tsx`; Modify `theo-don-vi/theo-don-vi.tsx`, `theo-don-vi/page.tsx`, `okr-search-params.ts`, `lib/search-param-keys.ts`, `kieu.ts` (kiểu `DongDanhSach`).
**Verify:** `cd apps/app && bun test test/okr-loc.dom.tsx test/okr-theo-don-vi.dom.tsx`.
**independent:** false

### Task 8: Màn Toàn cảnh (tiến độ) và Sức khoẻ chương trình

**Files:** Modify `okr/toan-canh/page.tsx`; Create `okr/toan-canh/toan-canh.tsx`, `okr/suc-khoe/page.tsx`, `okr/suc-khoe/suc-khoe.tsx`, `apps/app/test/okr-toan-canh.dom.tsx`.
**Verify:** dom test + `cd apps/app && bunx tsc --noEmit -p .`.
**independent:** false

### Task 9: Thước màn thật, soi thiết kế, ghim lại hồ sơ cũ

**Files:** Create `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs` (bước nhịp 1: loc, nguoi, cay, toan-canh, suc-khoe), `rang/san-thiet-ke.mjs`; Modify `_acceptance/dat-okr-trong-crm/rang/man-okr.mjs` bước E11-12 (chỗ đứng «lượt 5» → khẳng định Toàn cảnh có nội dung) kèm dòng `revisit` trong sổ hồ sơ đó.
**Verify:** `tco_man_chrome` trên 3930/3931, `tco_san_thiet_ke` (E25).
**independent:** false

### Task 10: Tài liệu — ba trang hướng dẫn, `docs/api.md`

**Files:** Create `docs/huong-dan/okr-nguoi-phu-trach.md`, `okr-truong-don-vi.md`, `okr-quan-tri.md`; Modify `docs/api.md` mục OKR (thủ tục xem, luật vết `mo-hop-tuan`).
**Verify:** E27 (judgment ở S4).
**independent:** true

## Nhịp 2 (sau khi lượt 4 và #146 lên `onehub`; gộp `origin/onehub` trước)

### Task 11: Họp tuần — `hopTuan` (đọc), `moHopTuan` (ghi), `xepHopTuan`
Files: `hop-tuan.ts`, `okr-xem.*`, `packages/validation/src/okr-vet.ts` (`mo-hop-tuan`), `_acceptance/toan-canh-okr/rang/ty-le-mo-hop-tuan.sql`. Verify: E13, E15, E30.

### Task 12: Toàn cảnh tự tin + heatmap; `danhSach` lọc tự tin; `sucKhoe` đúng tuần, KR im
Verify: E11, E1 (vế nhịp 2), E20 (vế nhịp 2), E9 (thêm `hopTuan`).

### Task 13: Diễn biến KR — `dienBien`, tab «Diễn biến» (`objective-dien-bien.tsx`)
Verify: E16, E17.

### Task 14: Phần «OKR của bạn» — `khoiCuaToi`, Tổng quan hai vai, trang một người
Verify: E18, E19.

### Task 15: Màn Họp tuần, heatmap trên Toàn cảnh, `PeriodSelect` ở `chon-chu-ky.tsx`
Verify: E14, E23, E28, E29; `man-toan-canh.mjs` thêm bước nhịp 2.

### Task 16: Đóng S3 — gộp `origin/onehub`, năm lệnh chứng, `implemented`, tệp đối số S4
Lệnh: `bun run test`, `check-types`, `lint`, `lint:slop`, `build` (tuần tự, PATH Node 24); `s4-args.mjs --diff-base origin/onehub`; báo phiên điều phối.
