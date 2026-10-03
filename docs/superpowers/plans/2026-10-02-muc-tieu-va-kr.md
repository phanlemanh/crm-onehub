# Mục tiêu và KR trong cùng một khung — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (feature-loop S3, tuần tự trong main loop). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mỗi mục tiêu trên «Của tôi», «Theo đơn vị», sheet chi tiết và «Chấm điểm» nằm chung một khung với KR của nó, có tiến độ của chính nó, KR đánh số, và chừa sáu điểm cắm cho Kara.

**Architecture:** Mở rộng `SimpleTable` (bậc 1): `header="sr-only"`, `SimpleTableRow nested|joined`. `KhoiMucTieu` viết lại thành một khối `data-muc-tieu` bọc một bảng: hàng mục tiêu + hàng KR (dựng bởi `BangKr` mở rộng tại chỗ) + hàng điểm cắm. `BangMucTieu` mới giữ trạng thái thu/mở trên URL (`thuMucTieu`). Sheet và Chấm điểm dùng lại cùng hàng KR / cùng khuôn khung. Không đổi API.

**Tech Stack:** Next 16 App Router (client components), React 19, nuqs, TanStack Query, `@crm/ui` (shadcn), bun test + jsdom (`packages/ui/test/setup-dom.ts`), puppeteer-core cho làn đo màn.

**Spec:** `docs/superpowers/specs/2026-10-02-muc-tieu-va-kr-design.md` · hợp đồng `_acceptance/muc-tieu-va-kr/contract.md` · evals `_acceptance/muc-tieu-va-kr/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Không `className` đổi màu, viền, bo góc lên thành phần `@crm/ui` tại chỗ gọi; biến thể mới sống ở `packages/ui` (docs/design.md).
- Móc DOM và chuỗi mã ở design doc mục «Móc DOM phải giữ» giữ NGUYÊN: `data-muc-tieu` trên khối bao bảng; `[data-muc-tieu] thead th` = 4 ở danh sách; tên mục tiêu là `translate=no` đầu khối; `data-kr` + `data-kr-hang` cùng hàng; `data-nguon` + `data-do-canh` cùng ô số; cha trực tiếp của `data-so-kr-tran` không flex, dạng «X / Đích»; chuỗi `) : xem === "duoc" ? (` trong `bang-kr.tsx`; `tong: k.soViec.tong,` trong `objective-sheet.tsx`; một dòng riêng `variant="neutral"` trong `tien-do-kr.tsx`; `SimpleTableRow` nhận `invalid`; `data-muc-tieu-cham` là khối bao (chứa `data-o-hoc`, `data-nut="mang-sang"`, `data-da-mang-sang`).
- Chữ mới chỉ nằm trong `apps/app/lib/messages/*.ts` (toan-canh-okr E7 cấm «Đúng nhịp»/«Tự tin» ngoài messages); khoá mới chạy `apps/app/test/messages-guard.spec.ts`.
- Số theo `vi-VN`; dữ liệu người nhập mang `translate="no"`.
- Test DOM chạy với `TZ=Asia/Ho_Chi_Minh`; mọi `setSystemTime` có `afterEach(() => setSystemTime())`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: xanh trên vật lành, đỏ với thông điệp ghim trên bản sao bị phá (MEASURE-BIRTH-CLAUSE).
- Dòng phụ hàng mục tiêu: «Tính từ N KR»; không viết «trung bình».
- Khoá URL: `thuMucTieu` (danh sách id đã thu); mặc định mở mọi mục tiêu.

## Review Focus

- Đơn vị có rất nhiều mục tiêu (≥ 20) mở sẵn: trang dài nhưng không giật khi thu/mở; thu/mở một khối không làm khối khác vẽ lại mất focus — bài E4 bấm liên tiếp hai khối và kiểm focus còn trên nút vừa bấm.
- URL `thuMucTieu` mang id trùng lặp hoặc rỗng (`?thuMucTieu=&thuMucTieu=a,a`): bỏ trùng, bỏ rỗng — bài E4 thêm ca này.
- Tên mục tiêu/KR rất dài (120 ký tự, không dấu cách): xuống dòng trong ô, không tràn ngang 375 px — làn E13 gieo một tên như vậy.
- Mục tiêu `expected = null` và `expected = 0`: hàng mục tiêu không có vạch, nhịp «Chưa có kỳ vọng» — bài E2 thêm ca.
- Người chỉ đọc (không quyền sửa) ở sheet: không có menu KR, không «Thêm KR», vẫn thấy Vì sao lúc này/Góp vào — bài E8 thêm ca chỉ đọc.

---

### Task 1: `SimpleTable` thêm `header="sr-only"`, `SimpleTableRow` thêm `nested` và `joined`

independent: true · phục vụ E10, E11, E18

**Files:**
- Modify: `packages/ui/src/components/simple-table.tsx`
- Modify: `packages/ui/src/lib/row-accent.ts` (hằng `ROW_NESTED`, `ROW_JOINED`)
- Create: `packages/ui/test/simple-table-hang.dom.tsx`
- Modify: `_acceptance/config.yaml` (executors `test.mtkr_hang_ui`, `script.mtkr_san_thiet_ke`)

**Interfaces:**
- Produces: `SimpleTable({ header?: "visible" | "sr-only" })` — mặc định `"visible"`; `"sr-only"` thêm lớp `sr-only` vào `TableHeader`. `SimpleTableRow({ nested?: boolean; joined?: boolean })` — `nested` → `ROW_NESTED` + `data-nested=""`; `joined` → `ROW_JOINED` + `data-joined=""`. Chữ ký destructure giữ `invalid` (okr-soat-anh-luot-3 soi AST).

- [ ] **Step 1: Bài đỏ** — `simple-table-hang.dom.tsx`: ma trận viết trước `[[{},false,false],[{nested:true},true,false],[{joined:true},false,true],[{nested:true,joined:true},true,true]]`, mỗi phần tử render `SimpleTable` một hàng, khẳng định `tr.dataset.nested`, `tr.dataset.joined`, `classList` chứa/không chứa `bg-muted/30` và `border-b-0`; ca `header`: `{}` → `thead` không có `sr-only`; `{header:"sr-only"}` → `thead.classList.contains("sr-only")` và `thead th` = số cột. In `so ca: 6`.
- [ ] **Step 2: Chạy, thấy đỏ** — `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/simple-table-hang.dom.tsx` → FAIL (prop chưa có).
- [ ] **Step 3: Cài**

```ts
// row-accent.ts
export const ROW_NESTED = "bg-muted/30";
export const ROW_JOINED = "border-b-0";
```

```tsx
// simple-table.tsx — SimpleTable thêm header; SimpleTableRow thêm nested, joined
header = "visible",
// …
<TableHeader className={cn(header === "sr-only" && "sr-only", panel && […], !panel && "…", headerClassName)}>
// SimpleTableRow
	nested,
	joined,
// …
	data-nested={nested ? "" : undefined}
	data-joined={joined ? "" : undefined}
	className={cn("hover:bg-transparent", sub && ROW_SUB, nested && ROW_NESTED, joined && ROW_JOINED, clickable && …, …)}
```

- [ ] **Step 4: Xanh + bài cũ** — chạy lại bài mới; chạy `simple-table-hang-phu.dom.tsx` và `luoi-va-khong-dich.dom.tsx` → PASS.
- [ ] **Step 5: Phá thử** — trong bản sao (`.acceptance-runs/muc-tieu-va-kr/sao-ui/`, symlink `node_modules`), đổi `ROW_JOINED` thành `"border-b-0 bg-muted/30"` → bài đỏ `joined dinh nen`; xoá bản sao.
- [ ] **Step 6: Khai executor** — `test.mtkr_hang_ui: 'cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/simple-table-hang.dom.tsx'`; `script.mtkr_san_thiet_ke` theo khuôn `tgy_san_thiet_ke` với sáu tệp của E18.
- [ ] **Step 7: Commit** `feat(ui): SimpleTable header sr-only, SimpleTableRow nested/joined`.

### Task 2: Chữ mới trong messages

independent: true · phục vụ E2, E6, E8, E17

**Files:**
- Modify: `apps/app/lib/messages/okr.ts` (vi + en)
- Modify: `apps/app/test/messages-guard.spec.ts` (GHIM/KHONG_DAU nếu bài đòi)

**Interfaces:**
- Produces trong `okrMessages(locale)`: `cot.mucTieuVaKr` («Mục tiêu và KR»), `cot.thuMo` (srLabel «Mở hoặc thu gọn»), `tinhTu(n)` («Tính từ {n} KR»), `chuaCoKrDeTinh` («Chưa có KR để tính»), `thu(ten)`/`mo(ten)` («Thu gọn KR của «{ten}»», «Mở KR của «{ten}»»), `soKr(n)` («{n} KR»), `soKrCham(n)` («{n} KR chậm»), `nhanKr(n)` («KR{n}»), `tuKhoiDiem(kieu, gia)` («{kieu} · từ {gia}»); `sheet.viSao` («Vì sao lúc này»), `sheet.gopVao` («Góp vào»), `sheet.quaKr(ten)` («qua KR «{ten}»»), `sheet.tienDoTu(x, n)` («Tiến độ mục tiêu {x}% tính từ {n} KR»), `sheet.soKrDo(n)` («{n} KR đo mục tiêu này»). Bản en dịch tương ứng.

- [ ] **Step 1:** Thêm khoá vi/en.
- [ ] **Step 2:** `cd apps/app && bun test test/messages-guard.spec.ts` → nếu đỏ vì khoá mới, thêm khoá vào danh sách GHIM/KHONG_DAU đúng như bài chỉ, chạy lại → PASS.
- [ ] **Step 3: Commit** `feat(okr): chữ cho khối mục tiêu–KR`.

### Task 3: Hàng KR đánh số, ô tiến độ gộp, tiến độ mục tiêu

independent: false (cần Task 1, 2) · phục vụ E6, E2

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/tien-do-kr.tsx` — thêm `TienDoMucTieu`, `OTienDoKr`
- Modify: `apps/app/app/(app)/[slug]/okr/bang-kr.tsx` — `BangKr` nhận `dau`, `cotMo`, `header`, `an`, `diemCam`, `tenCotDau`; hàng KR đánh số, ô gộp; bỏ cột «Đích»
- Create: `apps/app/app/(app)/[slug]/okr/diem-cam.ts`
- Create: `apps/app/test/muc-tieu-va-kr.dom.tsx` (khung bài: fixture parse bằng `mucTieuOutput`/`krOutput` của `apps/api/src/okr/okr.contracts.ts`, harness theo `okr-theo-don-vi.dom.tsx`)

**Interfaces:**
- Produces:
  - `type DiemCam = { nhanMucTieu?: (mt: MucTieu) => ReactNode; duoiMucTieu?: (mt: MucTieu) => ReactNode; duoiKr?: (kr: KetQua, mt: MucTieu | null) => ReactNode; sauTenKr?: (kr: KetQua, mt: MucTieu | null) => ReactNode }`; `coNoiDung(n: ReactNode): boolean`.
  - `TienDoMucTieu({ ten, progress, expected, kind, soKr })` — «Tính từ N KR» + `%` + `ThanhTienDo` + `NhanTinhTrang`; `soKr === 0` → «Chưa có KR để tính». Bọc `data-o-tien-do`.
  - `OTienDoKr({ kr, kind, expected, xem })` — `<div data-o-tien-do>` chứa `SoCuaKr` (giữ nguyên) rồi `TienDoKr`.
  - `BangKr(props)` thêm: `dau?: ReactNode` (hàng đặt trước KR), `cotMo?: boolean` (thêm cột đầu trống 48 px, khớp hàng mục tiêu), `header?: "visible" | "sr-only"`, `an?: boolean` (true → không vẽ hàng KR), `diemCam?: DiemCam`, `mucTieu?: MucTieu | null`, `tenCotDau?: string`, `nested?: boolean`. Cột: `[mo?] ten phuTrach tienDo [viec] [hanhDong]`.
  - Hàng KR: `data-kr`, `data-kr-hang`, `nested`, `joined` khi `duoiKr` có nội dung; ô tên: «KR{n}» (`text-xs`, không `translate`) rồi tên (`translate="no"`) + `sauTenKr` + dòng phụ `tuKhoiDiem` + badge `data-cua-toi`/`data-co-bang-chung` + `<div className="w-full pt-1 md:hidden"><OTienDoKr/></div>`; ô tiến độ `hidden md:table-cell` mang `data-nguon`, `data-do-canh`.
- [ ] **Step 1: Bài đỏ E6** — ma trận bảy KR (tăng 0, tăng 60, giảm 8→2 hiện 3,5, mốc chưa, mốc xong, máy chưa có số, máy đo cạnh), mỗi phần tử khẳng định: chữ dòng số (đọc `[data-so-kr], [data-so-kr-cho], [data-so-kr-tran]` cha), `%`, có/không `[data-expected]`, dòng phụ, `[data-dau-nguon]`, `[data-chua-chup]`; `thead` không chứa «Đích». In `so khang dinh: 7`. Test name chứa `o-tien-do`.
- [ ] **Step 2:** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/muc-tieu-va-kr.dom.tsx -t o-tien-do` → FAIL.
- [ ] **Step 3:** Cài `diem-cam.ts`, `TienDoMucTieu`, `OTienDoKr`, sửa `BangKr` như Interfaces; giữ `SoCuaKr` và nhánh `xem === "duoc"` nguyên văn trong `bang-kr.tsx`, giữ dòng `variant="neutral"` của `ThanhTienDo`.
- [ ] **Step 4:** Chạy lại → PASS; chạy `test/so-kr.dom.tsx`, `test/okr-canh-kr.dom.tsx` → PASS.
- [ ] **Step 5: Phá thử** — bản sao bỏ nhánh khởi điểm trong `tuKhoiDiem` gọi → đỏ `thieu tu khoi diem: tang-60`.
- [ ] **Step 6:** Khai `test.mtkr_o_tien_do` (`… -t o-tien-do`). Commit `feat(okr): hàng KR đánh số và ô tiến độ gộp`.

### Task 4: `KhoiMucTieu` viết lại + `BangMucTieu` + URL `thuMucTieu`

independent: false (cần Task 3) · phục vụ E2, E3, E4, E7, E12, E17

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/khoi-muc-tieu.tsx`
- Create: `apps/app/app/(app)/[slug]/okr/bang-muc-tieu.tsx`
- Modify: `apps/app/lib/search-param-keys.ts` (`okr.thuMucTieu: "thuMucTieu"`)
- Modify: `apps/app/app/(app)/[slug]/okr/okr-search-params.ts` (`parseAsThuMucTieu = parseAsArrayOf(parseAsString).withDefault([])`)
- Modify: `apps/app/app/(app)/[slug]/okr/cua-toi.tsx`, `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx` (hàm `DanhSach`)
- Modify: `apps/app/test/muc-tieu-va-kr.dom.tsx`

**Interfaces:**
- Consumes: `BangKr`, `TienDoMucTieu`, `DiemCam` (Task 3).
- Produces:
  - `KhoiMucTieu({ mucTieu, hienDonVi, danhDauCuaToi, mo, doiMo, diemCam })` → `<div data-muc-tieu={id}>` + `BangKr header="sr-only" cotMo nested dau={<HangMucTieu/> + duoiMucTieu} an={!mo}`. `HangMucTieu`: `SimpleTableRow clickable expandable data-hang-muc-tieu onClick={doiMo}`; ô 1 `w-12` nút mũi tên (`aria-expanded`, `aria-label` `thu/mo(ten)`, icon `transition-transform motion-reduce:transition-none`, `stopPropagation`); ô 2 nút tên `data-mo-muc-tieu` (mở sheet như cũ, `stopPropagation`) + badge loại + `NhanTrangThai` + `NhanGioiHan` + `nhanMucTieu`, dòng phụ `[đơn vị ·] soKr · gopVao · soKrCham` + phụ trách `md:hidden`, `TienDoMucTieu` `md:hidden`; ô 3 `w-48 hidden md:table-cell` người phụ trách (avatar + tên); ô 4 `w-64 hidden md:table-cell` `TienDoMucTieu`. 0 KR và đang mở → hàng `data-chua-co-kr` (`m.chuaCoKr`).
  - `BangMucTieu({ ds, hienDonVi, danhDauCuaToi, diemCam?, dangMo?, onDoiMo? })` — đọc/ghi `thuMucTieu` qua `useQueryState`; `dangMo` có thì không đọc URL; id URL không có trong `ds` bị bỏ qua; ghi lại bỏ trùng và rỗng, rỗng thì `null` (khoá rời URL).
- [ ] **Step 1: Bài đỏ** — `-t theo-don-vi` (E3: ba khối, thứ tự hàng, `thead.sr-only`, 4 th), `-t thu-mo` (E4: ma trận {bấm, Enter, Space} × {mt1, mt2}, URL ghi bằng `NuqsTestingAdapter onUrlUpdate`, id lạ, id trùng/rỗng, bấm tên không đổi URL, focus còn trên nút), `-t chua-co-kr` (E7), `-t co-du-lieu` (E2: CuaToi, `progress` 49 và 25, `expected` 47 / null / 0), `-t diem-cam` (E12 phần danh sách), `-t trang-thai` (E17: rút id từ bảng UX-STATE-TABLE của design doc, đường suy từ `import.meta.dir`).
- [ ] **Step 2:** Chạy từng `-t` → FAIL.
- [ ] **Step 3:** Cài như Interfaces; `cua-toi.tsx` và `DanhSach` dùng `BangMucTieu`, giữ `data-trang-thai` cũ trên phần tử bao.
- [ ] **Step 4:** Chạy lại → PASS; chạy `test/okr-theo-don-vi.dom.tsx` (4 th mỗi khối, `[data-tinh-trang]` đầu = `cham-nhip`, tên mục tiêu là `translate=no` đầu khối) → PASS.
- [ ] **Step 5: Phá thử** — bản sao giữ trạng thái bằng `useState` → `url khong ghi thuMucTieu`; bản sao vẽ `%` tự tính → `phan tram khong tu api: 10`; bản sao vẽ `tr` rỗng khi điểm cắm trả null → `hang thua khi diem cam null`; bản sao đảo KR → `thu tu kr sai: mt3`; bản sao không vẽ hàng rỗng → `thieu hang chua co kr`; bản sao design doc thêm `ST-mtkr-gia` → `thieu ca: ST-mtkr-gia`.
- [ ] **Step 6:** Khai `test.mtkr_bang_co_du_lieu`, `mtkr_theo_don_vi`, `mtkr_thu_mo`, `mtkr_chua_co_kr`, `mtkr_diem_cam`, `mtkr_trang_thai_cu`. Commit `feat(okr): mỗi mục tiêu một khung, thu/mở nhớ trên URL`.

### Task 5: Sheet chi tiết — Vì sao lúc này, Góp vào, KR đánh số

independent: false (cần Task 3) · phục vụ E8, E12

**Files:**
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx` (`TabKr`)
- Modify: `apps/app/test/muc-tieu-va-kr.dom.tsx`

**Interfaces:**
- Consumes: `BangKr` (không `cotMo`, `header` mặc định), `DiemCam`.
- Produces: `TabKr` vẽ theo thứ tự `DetailSheetSection title={m.viSao} data-khu="vi-sao"` (chỉ khi `whyNow.trim()`), `DetailSheetSection title={m.gopVao} data-khu="gop-vao"` (mỗi `alignments[i]`: `objectiveTitle` · `unitName` · `quaKr(keyResultTitle)` khi có), `DetailSheetSection title={m.soKrDo(n)}` chứa `diemCam.duoiMucTieu`, `BangKr` (giữ `hoiDoiTrong`, `canh`, `hanhDong`, `nhanHanhDong`), `<p data-tien-do-tu>` `tienDoTu(progress, n)`, nút Thêm KR như cũ. `ObjectiveSheet` nhận `diemCam?: DiemCam` và truyền xuống. Giữ nguyên dòng `tong: k.soViec.tong,` trong `demCanh`.
- [ ] **Step 1: Bài đỏ** `-t sheet` (E8 a/b/c + ca chỉ đọc) và `-t diem-cam-sheet` (E12 c) với `ObjectiveSheet` thật, tRPC giả trả `okr.objective` parse bằng schema output thật.
- [ ] **Step 2:** FAIL. **Step 3:** Cài. **Step 4:** PASS; chạy `test/okr-sheet.dom.tsx`, `test/khung-tao-okr.dom.tsx`, `test/sheet-quyen-cap-nhat.dom.tsx`, `test/okr-canh-kr.dom.tsx` → PASS.
- [ ] **Step 5: Phá thử** — bản sao đặt Góp vào trước Vì sao → `thu tu khu sai`.
- [ ] **Step 6:** Khai `test.mtkr_sheet`. Commit `feat(okr): sheet mục tiêu có lý do, nơi góp vào và KR đánh số`.

### Task 6: Chấm điểm — mục tiêu trong khung

independent: false (cần Task 1, 2) · phục vụ E9

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/cham-diem.tsx` (`KhoiMucTieuCham`, `DongKr`)
- Modify: `_acceptance/muc-tieu-va-kr/evals.yaml` (E9: hàng đầu mang `data-hang-muc-tieu-cham`, khối `data-muc-tieu-cham` bao bảng — khớp móc đã ký của khep-ky-okr; ghi sổ `fix` S3)
- Modify: `apps/app/test/muc-tieu-va-kr.dom.tsx`

**Interfaces:**
- Produces: `KhoiMucTieuCham` → `<div data-muc-tieu-cham={id}>` + `SimpleTable` (cột cũ: kr, so, goiY, diem — header hiện) với hàng đầu `data-hang-muc-tieu-cham` (tên `translate=no`, phụ trách, `StatusIndicator` điểm/«đã chấm k/n» ở ô điểm), `DongKr` thêm nhãn `KR{n}` trước tên và `nested`, hàng cuối (`nested`, `colSpan={4}`) chứa `DieuHocDuoc` + khối mang sang (`data-nut="mang-sang"` / `data-da-mang-sang`). Bỏ `Card`, `CardHeader`, `CardContent`, `CardFooter` trong khối.
- [ ] **Step 1: Bài đỏ** `-t cham` (E9) với `ChamDiemBang` thật, dữ liệu parse bằng schema output `bangCham` thật; bấm lưu điểm/lưu học → payload parse bằng schema input thật.
- [ ] **Step 2:** FAIL. **Step 3:** Cài. **Step 4:** PASS; chạy `test/okr-khep-cham.dom.tsx` → PASS.
- [ ] **Step 5: Phá thử** — bản sao đặt tên mục tiêu trong `CardHeader` → `muc tieu cham ngoai khung`.
- [ ] **Step 6:** Khai `test.mtkr_cham`. Commit `feat(okr): chấm điểm — mục tiêu trong khung`.

### Task 7: Thước tĩnh — không vẽ tay

independent: true · phục vụ E11

**Files:**
- Create: `_acceptance/muc-tieu-va-kr/rang/khong-ve-tay.mjs`
- Modify: `_acceptance/config.yaml` (`script.mtkr_khong_ve_tay`)

- [ ] **Step 1:** Script đọc AST (`typescript` của kho) mọi `.tsx` dưới `apps/app/app/(app)/[slug]/okr/**` và `objective-sheet.tsx`; gốc suy từ `import.meta.url`; JSX `SimpleTableRow` có `className` chứa `bg-`, `border-`, `rounded-` → in `ve tay: <tep>:<dong>`, mã 1; in số tệp và số `SimpleTableRow` (> 0). Cờ `--goc <dir>` để chạy trên bản sao.
- [ ] **Step 2:** Chạy trên cây → exit 0. Phá thử: bản sao có `<SimpleTableRow className="bg-muted/30">` → `ve tay` mã 1.
- [ ] **Step 3:** Commit `test(muc-tieu-va-kr): thước không vẽ tay`.

### Task 8: Làn đo màn thật

independent: false (cần Task 4–6) · phục vụ E1, E5, E13, E16

**Files:**
- Create: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
- Modify: `_acceptance/config.yaml` (`script.mtkr_man_that: 'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs"'`)

- [ ] **Step 1:** Script theo khuôn `the-gop-y-okr/rang/man-the-gop-y.mjs` (puppeteer-core, `phien-tro-ly.mjs`: `napBoMau`, `phienCookie`, `trpc`, `truyVan`, `laKhoDo`, cảnh cây trước màn đầu). Gieo: bộ OKR mẫu; một mục tiêu có `whyNow` + góp vào; một tên 120 ký tự; một chu kỳ ở pha chấm điểm ≥ 2 mục tiêu × ≥ 2 KR (thủ tục OKR thật như `khep-ky-okr/rang/man-khep-ky.mjs`). Bước E1 (1440 sáng/tối, so `okr.mine`), E5 (thu, reload, mở lại, `prefers-reduced-motion`), E13 (375, bốn màn, số hàng tối thiểu), E16 (theo đơn vị + sheet × sáng/tối, hien-tai từ proto, băm khác nhau). Ảnh vào `_acceptance/muc-tieu-va-kr/evidence/`. Cờ `--kiem-do-do` (proto ST-hien-tai → `muc tieu ngoai khung`; proto ST-cua-toi → `reload mat trang thai thu`; phần tử 500 px → `tran ngang`; sheet không whyNow → `thieu khu vi-sao trong anh`), `--kiem-do-do-rong` (chấm ở chu kỳ không chấm → `man rong: cham`).
- [ ] **Step 2:** Chạy làn một lượt (`bun scripts/lan-do/tien-de.mjs --chay …`) → exit 0; chạy từng cờ đỏ → mã 1 với thông điệp ghim.
- [ ] **Step 3:** Commit `test(muc-tieu-va-kr): làn đo màn thật`.

### Task 9: Thước hồ sơ đã ký bị chạm

independent: false (chạy sau mọi task chạm mã) · phục vụ E14

**Files:**
- Create: `_acceptance/muc-tieu-va-kr/rang/ho-so-cham.mjs`
- Modify: `_acceptance/config.yaml` (`script.mtkr_ho_so_cham`)

- [ ] **Step 1:** Chép khuôn `_acceptance/tra-loi-tin-nhac/rang/ho-so-cham.mjs` (glob `paths`, merge-base, bản sao tại B bằng `git worktree add --detach`), thay `SLUG`, thêm `DANH_SACH` viết trước đúng như E14 (hồ sơ, eval), chạy `cmd` đã khai của từng eval (giải `config:` qua `_acceptance/config.yaml`) ở HEAD và ở B, tuần tự, ghi log ra `.acceptance-runs/muc-tieu-va-kr/ho-so-cham/`; quan hệ đỏ-ở-HEAD-xanh-ở-B → chạy lại một lần → `hoi quy: <slug>/<E>` mã 1; in số đã chạy = độ dài danh sách. Cờ `--kiem-do-do`: bản sao HEAD xoá `data-muc-tieu` khỏi `khoi-muc-tieu.tsx`.
- [ ] **Step 2:** Chạy NỀN (≈ 70–120 phút) ra log; đợi bằng `until grep -q '^EXIT'`. exit 0. Chạy `--kiem-do-do` → ≥ 1 `hoi quy`, mã 1.
- [ ] **Step 3:** Commit `test(muc-tieu-va-kr): thước hồ sơ đã ký bị chạm`.

### Task 10: Dọn

independent: false · phục vụ E18 và năm lệnh chứng

- [ ] Xoá import/xuất không còn ai dùng (`KhoiMucTieu` cũ đã viết lại; kiểm `lint:dead`).
- [ ] Chạy `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run test`, `bun run build` từ gốc → tất cả 0.
- [ ] Set contract `status: implemented`. Commit `chore(muc-tieu-va-kr): xong S3`.
