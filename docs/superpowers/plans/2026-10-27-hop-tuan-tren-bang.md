# Họp tuần trên bảng Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bảng Họp tuần hiện ghi chú mới nhất và mức đổi ở mọi khổ, có nút Cập nhật trên dòng, và ngăn KR mở từ bảng đi ‹ › theo thứ tự bảng.

**Architecture:** API `okr.hopTuan` thêm bốn khoá mỗi dòng, tính bằng hàm thuần ở `packages/db/src/okr-hop-tuan.ts`. Màn Họp tuần
tách phần dòng sang thư mục `okr/hop-tuan/`; nút cập nhật trên dòng chuyển ra tệp chung. Ngăn KR đọc nguồn thứ tự từ một tham
số đường dẫn mới của ngăn và lấy danh sách từ chính truy vấn `okr.hopTuan` trong bộ nhớ đệm.

**Tech Stack:** NestJS + tRPC (apps/api), Next.js + TanStack Query + nuqs (apps/app), `@crm/ui`, bun test (+ jsdom DOM tests), Playwright-style bàn đo màn qua `scripts/lan-do`.

**Spec:** `docs/superpowers/specs/2026-10-27-hop-tuan-tren-bang-design.md` · hợp đồng `_acceptance/hop-tuan-tren-bang/contract.md` (approved 27/10) · `_acceptance/hop-tuan-tren-bang/evals.yaml`.

## Global Constraints

- Không viết chú thích trong code (AGENTS.md). Hằng tinh chỉnh vào config theo khu, không số ma.
- Thành phần client không nhập `@crm/db`, `@crm/auth`; kiểu prop do client tự khai.
- Chữ hiện cho người nằm ở `apps/app/lib/messages/okr*.ts`, đủ `vi` và `en`; chỉ THÊM dòng vào tệp chữ dùng chung (luật 7).
- Không sửa tệp thước hay bài kiểm của hồ sơ đã ký (AC-10); thước `ngan-kr-mot-cho/rang/quet-loi.mjs` phải còn xanh.
- Lối mở ngăn ở `hop-tuan.tsx` vẫn qua `useMoDienBien` (không thêm lời gọi `openRecord`/`thayDinh` mới mang KR ở tệp mới).
- `/packages/ui` là nguồn giao diện: dùng `SimpleTable`, `Item`, `StatusIndicator`, `Button`; không `className` đổi màu/góc.
- Mức đổi: so `giaTriMoi` với lần cuối thuộc tuần (giờ VN) trước tuần của lần mới nhất; không có mà KR có ≥2 lần → lần đầu tiên; ≤1 lần → `null`.
- In số qua `giaTri(kr, so, locale)` của `okr/bang-kr.tsx`.

## Review Focus

- KR mốc (giá trị 0/1): mức đổi in «Chưa xong → Xong», không «+1» — Task 3 thêm ca mốc vào bảng chữ.
- Ghi chú rất dài (200 ký tự) ở 375: xuống dòng, không tràn ngang — Task 5 (bàn đo) đo `scrollWidth`.
- Người xem chỉ đọc (không quyền cập nhật bất kỳ KR nào): không dòng nào có nút, cột Cập nhật không để trống tiêu đề lạ — Task 3 ca J.
- Đường dẫn cũ mang nguồn Họp tuần của chu kỳ khác/bộ khác sau khi người đổi bộ: ngăn rơi về theo mục tiêu — Task 4 ca Z.
- Gửi cập nhật lỗi (máy chủ trả lỗi): hộp giữ chữ, bảng không đổi, Còn lại không tự mở — Task 5 ca lỗi.

---

### Task 1: Bốn khoá mới của `okr.hopTuan` (AC-1 · E1) — independent: true

**Files:**
- Modify: `packages/db/src/okr-hop-tuan.ts` (thêm hàm thuần)
- Modify: `packages/db/test/okr-hop-tuan.spec.ts`
- Modify: `apps/api/src/okr/okr-xem.contracts.ts:186-192` (`dongHop`)
- Modify: `apps/api/src/okr/okr-xem.service.ts:648-700` (`hopTuan`)
- Create: `apps/api/test/hop-tuan-tren-bang.spec.ts`

**Interfaces:**
- Produces: `mucDoiCua(kr: KrSo): { tu: number; den: number; ngayTruoc: string } | null` và `ghiChuMoiNhatCua(kr: KrSo): { ghiChu: string; ngay: string } | null` (ngày `YYYY-MM-DD` qua `ngayVN`).
- Produces: `dongHop` thêm `ghiChuNgay: string | null`, `donVi: string`, `giaTriMoi: number | null`, `mucDoi: { tu: number; den: number; ngayTruoc: string } | null`.

- [ ] **Step 1:** Bài thuần `okr-hop-tuan.spec.ts` «mucDoiCua»: chín ca của AC-1 (lan rỗng → null; 1 lần → null; tuần T-2 = 5, T-1 = 8 → {tu:5,den:8}; T-1 = 1,17, T: 1,10 rồi 1,08 → tu 1,17 den 1,08; T: 3 rồi 4, không lần trước → tu 3 den 4; …). Chạy `cd packages/db && TZ=UTC bun test test/okr-hop-tuan.spec.ts -t mucDoiCua` → FAIL.
- [ ] **Step 2:** Viết `mucDoiCua`, `ghiChuMoiNhatCua`; chạy lại → PASS (cả `TZ=Asia/Ho_Chi_Minh`).
- [ ] **Step 3:** Ca «htb-muc-doi» trong `apps/api/test/hop-tuan-tren-bang.spec.ts` theo `expected` của E1 (khuôn dựng bộ và gọi router lấy từ `apps/api/test/hop-tuan-mo-dung-bo.spec.ts`; lần cập nhật qua `okr.guiCapNhat`, đồng hồ ghim). Chạy `bun run test -- "cd apps/api && bun test test/hop-tuan-tren-bang.spec.ts -t htb-muc-doi"` → FAIL (thiếu khoá).
- [ ] **Step 4:** Mở rộng `dongHop` và `dong()` trong `hopTuan` (`donVi` = `x.k.unit`, `giaTriMoi` = `moiNhat(s)?.giaTri ?? null`). Chạy lại → «htb-muc-doi: 9/9».
- [ ] **Step 5:** Phá thử trong bản sao: so với lần liền trước → đỏ «htb-muc-doi: hai-lan-cung-tuan tu=… can …». Hoàn lại. Commit.

### Task 2: Nút cập nhật trên dòng thành tệp chung (AC-4 · E4 phần nền) — independent: false (Task 3 dùng)

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/nut-cap-nhat-dong.tsx`
- Modify: `apps/app/app/(app)/[slug]/okr/theo-don-vi/bang.tsx:247-275` (xoá bản cũ, nhập bản chung)
- Modify: `apps/app/app/(app)/[slug]/okr/cap-nhat-kr.tsx` (tuỳ chọn `onDaGui`)
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx` (prop `onDaGui?: (keyResultId: string) => void`, gọi trong `onSuccess` trước `dong()`)

**Interfaces:**
- Produces: `export function NutCapNhatDong({ objectiveId, keyResultId, ten, mo }: { objectiveId: string; keyResultId: string; ten: string; mo: CapNhatKr["mo"] }): ReactNode` — giữ `data-nut="cap-nhat-dong-kr"`, `aria-label` = `dien(m.capNhatDong, { ten })`.
- Produces: `useCapNhatKr(opts?: { onDaGui?: (keyResultId: string) => void }): CapNhatKr`.

- [ ] **Step 1:** Chuyển nguyên thân hiện có; trang đơn vị gọi bản chung với `keyResultId={kr.id} ten={kr.title}`.
- [ ] **Step 2:** Chạy bài kiểm đã ký của trang đơn vị không sửa: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-trang-don-vi.dom.tsx ./test/ngan-kr-mot-cho.dom.tsx` → PASS như trước. `bun run check-types --filter=app` xanh. Commit.

### Task 3: Dòng Họp tuần — ghi chú, mức đổi, nút Cập nhật ở mọi khổ (AC-2, AC-3, AC-4, AC-9 · E2, E3, E4, E9) — independent: false

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/hop-tuan/muc-doi.tsx` — `chuMucDoi(dong, locale): { tren: string; duoi: string }` thuần + `OMucDoi`.
- Create: `apps/app/app/(app)/[slug]/okr/hop-tuan/dong-hop.tsx` — `BangHop` (`SimpleTable` từ md, `ItemGroup` dưới md), `GhiChuDong`, cột Cập nhật.
- Modify: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx` — dùng `BangHop`, `useCapNhatKr`, render `capNhat.hop`; Còn lại thành `Collapsible` có điều khiển.
- Modify: `apps/app/lib/messages/okr-toan-canh.ts` (thêm khoá `hopTuan.cotMucDoi`, `chuaCoGhiChu`, `chuaDoi`, `lanDau`, `chuaCapNhat`, `soVoi(ngay)`, `chuaCoLanTruoc`, `cotCapNhat` cho `vi` và `en`).
- Create: `apps/app/test/hop-tuan-tren-bang.dom.tsx` (ca htb-ghi-chu, htb-muc-doi-chu, htb-cap-nhat, htb-chu).

**Interfaces:**
- Consumes: `dongHop` mới (Task 1), `NutCapNhatDong`, `useCapNhatKr` (Task 2), `giaTri` của `okr/bang-kr.tsx`.
- Produces: dấu DOM `[data-kr-hop]`, `[data-ghi-chu][data-kho]`, `[data-muc-doi][data-kho]`, `[data-con-lai="mo"|"dong"]`; `data-kho` ∈ `duoi-md` (class `md:hidden`), `md-lg` (class `hidden md:block lg:hidden`), `tu-lg` (ô `hidden lg:table-cell`).

- [ ] **Step 1:** Viết bốn ca DOM theo `expected` của E2, E3, E4, E9 (mồi parse bằng `hopTuanOutput` từ `apps/api/src/okr/okr-xem.contracts.ts`; tRPC giả theo khuôn `hop-tuan-mo-dung-bo.dom.tsx`). Chạy `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t "htb-ghi-chu|htb-muc-doi-chu|htb-cap-nhat|htb-chu"` → FAIL.
- [ ] **Step 2:** Viết `chuMucDoi`: dòng trên `+X`/`−X` (`giaTri` của chênh tuyệt đối; KR mốc «Chưa xong → Xong» ở dòng trên), «Chưa đổi», «Lần đầu cập nhật» (giaTriMoi ≠ null, mucDoi null), «Chưa cập nhật» (giaTriMoi null); dòng dưới như AC-3.
- [ ] **Step 3:** Dựng `BangHop`; Còn lại tự mở khi `onDaGui(krId)` và krId nằm trong `conLai` sau lần tải mới; tiêu điểm về nút của KR ấy (`requestAnimationFrame` sau khi dòng có trong DOM).
- [ ] **Step 4:** Chạy lại → «htb-ghi-chu: 10/10», «htb-muc-doi-chu: 9/9», «htb-cap-nhat: 5/5», «htb-chu: 3/3»; chạy `bun test ./test/messages-guard.spec.ts` và DOM đã ký `hop-tuan-mo-dung-bo.dom.tsx` → xanh.
- [ ] **Step 5:** Phá thử ba chiều đỏ (cột ghi chú `hidden lg:table-cell` không bản dưới · mức đổi trên progress · nút dòng gọi openRecord) → đúng thông điệp ghim; hoàn lại. Commit.

### Task 4: Ngăn KR đi theo thứ tự bảng (AC-5, AC-6, AC-7 · E5, E6, E7) — independent: false

**Files:**
- Modify: `apps/app/lib/search-param-keys.ts` (thêm `record.thuTu: "thuTuKr"`)
- Modify: `apps/app/components/crm/record-sheet/record-stack.ts` (thêm param vào `params`, xoá khi đóng như `okr.hop`)
- Modify: `apps/app/components/crm/record-sheet/dien-bien-kr.ts` (`useMoDienBien()` trả `(objectiveId, keyResultId, thuTu?: string) => void`; `thuTu` đặt cùng lượt `dat`)
- Create: `apps/app/components/crm/record-sheet/thu-tu-hop-tuan.ts` — `khoaThuTuHop(cycleId: string, unit: DonChonOkr): string`, `docThuTuHop(raw: string | null): { cycleId: string; unit: DonChonOkr } | null`, `useThuTuHopTuan(keyResultId: string): string[] | null` (ids `[...dangBan, ...conLai]` khi có KR, ngược lại `null`).
- Modify: `apps/app/components/crm/record-sheet/kr-sheet.tsx` (`DauNganHanhDong` nhận `thuTu: string[] | null`; có thì `ds` = thuTu, nhãn «n/N · theo thứ tự bảng»)
- Modify: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx` (truyền `khoaThuTuHop(cycleId, unit)` khi mở ngăn)
- Modify: `apps/app/lib/messages/okr-canh-kr.ts` (thêm `khung.theoThuTuBang` vi/en)
- Test: `apps/app/test/hop-tuan-tren-bang.dom.tsx` (ca htb-sang, htb-nguon, htb-sau-gui)

**Interfaces:**
- Consumes: `okr.hopTuan` query key cùng `{ cycleId, unit }` như trang (Task 1).
- Produces: `[data-dem-kr]` mang «n/N», `[data-thu-tu-kr="bang"]` khi theo bảng.

- [ ] **Step 1:** Ba ca DOM theo `expected` của E5, E6, E7. Chạy `-t "htb-sang|htb-nguon|htb-sau-gui"` → FAIL.
- [ ] **Step 2:** Viết `thu-tu-hop-tuan.ts` (mã hoá `hop~<cycleId>~<loai>~<id>`; `docThuTuHop` sai khuôn → `null`), nối vào kr-sheet và hop-tuan.
- [ ] **Step 3:** Chạy lại → 7/7, 4/4, 4/4; `bun _acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs` mã 0; `ngan-kr-mot-cho.dom.tsx` xanh không sửa.
- [ ] **Step 4:** Phá thử: bỏ qua nguồn → «htb-sang: B ke la … can C»; nguồn trong state → «htb-nguon: tai lai mat thu tu bang»; danh sách chụp lúc mở → «htb-sau-gui: dem … can 3/4». Hoàn lại. Commit.

### Task 5: Bàn đo màn và quét lớp (AC-8, AC-4 backend, AC-10 · E8, E11, E10) — independent: false

**Files:**
- Create: `_acceptance/hop-tuan-tren-bang/rang/man.mjs` (`--phan anh|gui`, `--chieu-do`), khuôn từ `_acceptance/hop-tuan-mo-dung-bo/rang/man.mjs` + `man-lib.mjs`.
- Create: `_acceptance/hop-tuan-tren-bang/rang/khong-doi-hinh.mjs`, khuôn từ `_acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs`, lớp theo E10.
- Modify (nếu bộ mẫu thiếu): `apps/api/scripts/okr-mau/ca-hop-tuan.ts` — phòng ban P có ≥2 dòng Còn lại, một KR hai lần trong tuần, một KR chưa cập nhật tuần này ở Đang bàn (tiền đề E11), một ghi chú 200 ký tự.

- [ ] **Step 1:** Viết man.mjs theo steps của E8 và expected của E11; chạy `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/hop-tuan-tren-bang/rang/man.mjs --phan anh"` → KET LUAN mã 0, mười hai ảnh trong `evidence/`; `--phan gui` → mã 0.
- [ ] **Step 2:** `--chieu-do` hai chiều đỏ ghim (đối chứng tràn 4000px; nút dòng điều hướng → «SAI AC-4: roi bang»).
- [ ] **Step 3:** khong-doi-hinh.mjs: chạy `node _acceptance/hop-tuan-tren-bang/rang/khong-doi-hinh.mjs` → in «quet lop: n ho so, k eval», `ngan-kr-mot-cho` có trong lớp; chiều đỏ sửa một dòng cuối `quet-loi.mjs` trong bản sao → «SAI AC-10: SUA THUOC DA KY …». Commit.

### Task 6: Cổng máy của kho

- [ ] **Step 1:** `bun run check-types && bun run lint && bun run lint:slop && bun run build` xanh (test đầy đủ để pre-push và S4).
- [ ] **Step 2:** Đặt `status: implemented` trong contract; commit.
