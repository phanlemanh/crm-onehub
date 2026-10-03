# Góp ý của Kara đặt đúng chỗ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Số góp ý chờ của Kara hiện trên hàng Mục tiêu (kèm bộ lọc), góp ý được quyết ngay dưới thứ nó sửa trong khung chi tiết với biên nhận Hoàn tác, hai hộp Sửa chỉ còn dòng dẫn.

**Architecture:** API thêm `soGopYCho` vào `mucTieuOutput` (một truy vấn `okrDeXuat` cho cả trang, luật đếm của `troLyDanhSach` rút thành hàm chung) và mặt lọc `gopY`. App thay `useGopY`/cột bằng hook `useGopYMucTieu` nhóm góp ý theo chỗ neo; `ObjectiveSheet` tự dựng `DiemCam` Kara; danh sách cắm chip qua `nhanMucTieu`. `packages/ui` sửa `ProposedChange` (focus, cỡ chữ inline, nút lặng) và thêm `KaraTrace`.

**Tech Stack:** NestJS + nestjs-trpc, Prisma, Next.js App Router (client components), TanStack Query, nuqs, bun test (+ jsdom preload), puppeteer-core cho `rang/`.

**Spec:** `docs/superpowers/specs/2026-10-03-gop-y-dung-cho-design.md` · Hợp đồng: `_acceptance/gop-y-dung-cho/contract.md` · Evals: `_acceptance/gop-y-dung-cho/evals.yaml`

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Mọi chữ hiện trên màn qua `lib/messages` (app) hoặc `useMessages()` (`packages/ui`); có cả `vi` và `en`; khoá có biến mới phải ghim trong `apps/app/test/messages-guard.spec.ts` (`GHIM_*`).
- Tên AI trên màn là «Kara»; dấu AI là `AiGenerate` qua `KaraMark`/`KaraTrace`, màu chữ phụ, không tô xanh thương hiệu.
- Client component không import `@crm/db`, `@crm/auth`; chỉ `@crm/ui/components/<tên>` theo subpath.
- Không đổi bố cục `BangMucTieu`, `BangKr`, `SimpleTable` — chỉ cắm qua `DiemCam` và khu KR của `ObjectiveSheet`.
- Schema output mô tả đúng thứ API trả: `soGopYCho` bắt buộc, không `.default`; fixture thiếu thì sửa fixture.
- Hằng số chỉnh được sống trong module cấu hình của khu (vd `okr-xem.config.ts`), không rải.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture với thông điệp ghim (khối MEASURE-BIRTH của feature-loop).
- Lệnh test DOM: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/<tệp> -t <khối>`; test API qua `bun run test -- "cd apps/api && bun test test/<tệp> -t <khối>"` (CSDL riêng mỗi lượt).

## Review Focus

- Người chỉ sửa được một KR trong Mục tiêu do người khác phụ trách: chip phải đếm đúng góp ý của KR đó, khung chỉ hiện góp ý đó — test ở Task 2 (ô `phu-trach-kr2`) và Task 5 (fixture `troLyDanhSach` chỉ trả dòng KR2).
- Mục tiêu đã bỏ (`da-bo`): `troLyDanhSach` trả rỗng — chip phải là 0 — Task 2 thêm ô `da-bo`.
- Khung mở khi người vừa đổi tên KR ở tab khác: đề xuất viết lại cũ biến mất (409 hoặc hết hiệu lực) mà không lỗi đỏ — Task 5 ca `khoa-gui` 409.
- Hộp Sửa có chữ chưa lưu rồi bấm «Xem góp ý»: không mất chữ im lặng — Task 7 ca `hop-sua` nhánh form bẩn.
- Tên KR rất dài / tiếng Việt có dấu trong đề xuất ở 375 px: không tràn — Task 9 ma trận 375 (E23).

---

### Task 1: Hàm dùng chung — hết hiệu lực và dấu «theo Kara»

**Files:**
- Modify: `packages/db/src/okr-de-xuat.ts` (xuất `hetHieuLuc`, `danhSachDeXuat` dùng nó)
- Create: `packages/validation/src/okr-theo-kara.ts`
- Modify: `packages/validation/package.json` (subpath `./okr-theo-kara`)
- Test: `packages/validation/test/okr-theo-kara.spec.ts`, `packages/db/test/okr-de-xuat-het-hieu-luc.spec.ts`

**Interfaces:**
- Produces: `hetHieuLuc(mt: { title: string; whyNow: string; keyResults: { id: string; title: string }[] }, hang: { loai: string; truong: string | null; keyResultId: string | null; truoc: string | null }): boolean` (từ `@crm/db/okr-de-xuat`).
- Produces: `TIEN_TO_VET_KARA = "tro-ly-okr:"`, `type VetTen = { at: string; keyResultId: string | null; note: string | null; before: { title?: string } | null; after: { title?: string } | null }`, `krTheoKara(trail: readonly VetTen[]): ReadonlySet<string>` (từ `@crm/validation/okr-theo-kara`).

- [ ] **Step 1:** Viết `okr-theo-kara.spec.ts`: ma trận viết trước {KR1 đổi tên bởi Kara → có; KR1 Kara rồi người sửa tay → không; KR2 chỉ người sửa → không; vết Kara không đổi title (đổi đích) → không}; hai chiều: bản cài nhìn vết Kara ĐẦU TIÊN phải đỏ «dau theo kara con sau khi sua tay: KR1».
- [ ] **Step 2:** Chạy `cd packages/validation && bun test test/okr-theo-kara.spec.ts` → FAIL (module chưa có).
- [ ] **Step 3:** Cài `krTheoKara`: lọc vết có `keyResultId`, `before?.title !== after?.title`, sắp theo `at`, lấy vết cuối mỗi KR, giữ KR có `note?.startsWith(TIEN_TO_VET_KARA)`. API `okr-config.ts` dùng lại hằng này thay chuỗi riêng.
- [ ] **Step 4:** Tách `hetHieuLuc` khỏi `danhSachDeXuat` (thân là `hang.loai === "viet-lai" && giaTriHienTai(mt, hang) !== hang.truoc`), test thuần trong `packages/db/test`.
- [ ] **Step 5:** Chạy hai test → PASS; `bun run check-types` gói db/validation; commit `feat(gop-y-dung-cho): hàm hết hiệu lực và dấu theo Kara dùng chung`.

independent: true · phục vụ E4, E10

### Task 2: API — `soGopYCho` và mặt lọc `gopY`

**Files:**
- Create: `apps/api/src/okr/dem-gop-y.ts`
- Modify: `apps/api/src/okr/okr.contracts.ts` (`mucTieuOutput.soGopYCho`)
- Modify: `apps/api/src/okr/okr.service.ts` (`docMucTieu` nhận `soGopY?: ReadonlyMap<string, number>`, tự đếm khi vắng)
- Modify: `apps/api/src/okr/okr-xem.contracts.ts` (`locDanhSach.gopY`, `facetCounts.gopY`), `okr-xem.service.ts` (`danhSach`), `danh-sach.ts` (`khopLoc`, `demMatLoc`), `okr-xem.config.ts` nếu cần hằng
- Modify: `apps/api/src/generated/server.ts` (chạy `cd apps/api && bun run trpc:generate`)
- Modify: fixture viết tay có `soNguoiXem` trong `apps/app/test/*` (thêm `soGopYCho: 0`)
- Test: `apps/api/test/gop-y-dung-cho.spec.ts` (`-t dem-chip`, `-t dong-bo`, `-t loc-gop-y`, `-t theo-kara`, `-t bo-qua`)
- Modify: `docs/api.md` mục OKR (một đoạn: luật đếm `soGopYCho`, mặt lọc `gopY`)

**Interfaces:**
- Consumes: `hetHieuLuc` (Task 1), `nacCuaDonVi` + `cauHinhAiLuc` (`@crm/db`), `OkrAccessService.suaDuocDonVi/ghiDuocKr`.
- Produces: `demGopYCho(client: Db | Tx, v: { ct: CauHinhAi; viewerId: string; q: Quyen; mucTieu: MucTieuDem[]; access: OkrAccessService }): Promise<Map<string, number>>` với `MucTieuDem = { id; status; level; divisionId; departmentId; personUserId; title; whyNow; keyResults: { id; title; ownerUserId }[] }`; `mucTieuOutput.soGopYCho: number`; `locDanhSach.gopY: ("cho")[]` (mặc định `[]`); `facetCounts.gopY: { value: "cho"; count: number }[]`.

- [ ] **Step 1:** Viết `gop-y-dung-cho.spec.ts` theo `apps/api/test/tro-ly-okr-san.ts` (seed qua `dongMau`, `ghiCauHinh(NAC_CAU_HINH…)`, `phienMau`): khối `dem-chip` với bảng kỳ vọng viết trước {trưởng: M1=3, M2=0; phụ trách KR2: M1=1, M2=0; chỉ đọc: 0, 0} + ô `da-bo` = 0 + bọc Prisma `okrDeXuat` bằng proxy đếm lời gọi (1 lần mỗi `okr.danhSach`); `dong-bo`; `loc-gop-y` (5 Mục tiêu, 2 có chờ; chiều đỏ ghim «total sai: 5 != 2» khi bỏ điều kiện lọc); `theo-kara`; `bo-qua` (gồm truy vấn mốc của design doc chạy nguyên văn).
- [ ] **Step 2:** Chạy `bun run test -- "cd apps/api && bun test test/gop-y-dung-cho.spec.ts"` → FAIL.
- [ ] **Step 3:** Cài `dem-gop-y.ts`: lọc Mục tiêu `status !== "da-bo"` và `nacCuaDonVi(ct, "de-xuat", donViCua(mt)) === "bat"`; tập KR theo luật `tapDuocDoc` (sửa được đơn vị → mọi dòng; không → KR `ghiDuocKr`; rỗng → bỏ Mục tiêu); MỘT `okrDeXuat.findMany({ where: { objectiveId: { in }, nac: "bat", trangThai: "cho", cuocSoanId: null }, select: { objectiveId, keyResultId, loai, truong, truoc } })`; đếm dòng không `hetHieuLuc` và thuộc tập.
- [ ] **Step 4:** `docMucTieu` thêm `keyResults.ownerUserId` vào select nếu thiếu, gọi `demGopYCho` khi không nhận map; `danhSach` tính map một lần cho tập `gon` (mở rộng select đủ trường `MucTieuDem`), truyền vào `docMucTieu`, lọc `rows` khi `loc.gopY.includes("cho")`, thêm `gopY` vào `MucTieuGon`, `khopLoc`, `demMatLoc`.
- [ ] **Step 5:** `trpc:generate`; thêm `soGopYCho: 0` vào fixture viết tay; `bun run check-types` → sạch; test → PASS; chiều đỏ của từng khối chạy bằng bản sao tạm (phá-thử trong bản sao, không tại chỗ).
- [ ] **Step 6:** Sửa `docs/api.md`; commit `feat(gop-y-dung-cho): đếm góp ý chờ và lọc theo góp ý ở API`.

independent: false (cần Task 1) · phục vụ E3, E4, E6, E10, E12

### Task 3: `packages/ui` — `ProposedChange` và `KaraTrace`

**Files:**
- Modify: `packages/ui/src/components/proposed-change.tsx`
- Modify: `packages/ui/src/components/kara.tsx`
- Modify: `packages/ui/src/lib/messages.ts` (`kara.trace`, `kara.traceMoTa` vi/en)
- Modify: `packages/ui/test/nen-kara.dom.tsx`, `packages/ui/test/proposed-change.dom.tsx` nếu khẳng định slot `proposed-change-decided` hay `text-sm`
- Test: `packages/ui/test/gop-y-dung-cho-ui.dom.tsx` (`-t focus`, `-t inline`)

**Interfaces:**
- Produces: dòng biên nhận chỉ mang `data-slot="proposed-change-receipt"` (thẻ `p` bên trong bỏ slot); `ProposedChangeReceipt` nhận `ref`-able `tabIndex={-1}`; `KaraTrace({ label?: ReactNode })` vẽ `data-slot="kara-trace"`.
- Hành vi focus: Esc/Huỷ trong `editing` → focus nút `data-hanh-dong="sua"`; chuyển sang `decided` có `onUndo` → focus nút Hoàn tác; chuyển `decided` mất `onUndo` → focus dòng biên nhận. Cài bằng ref + `useLayoutEffect` theo chuyển trạng thái trước/sau (không derive state).

- [ ] **Step 1:** Viết test `focus` (bốn chuyển trạng thái, Esc không nổi bọt tới cha) và `inline` (khớp đúng 1 phần tử rồi mới xét lớp; không `text-sm|text-xs|text-base` ở gốc inline, thân, biên nhận và con cháu; nút lặng là anh em trực tiếp của nút chính; `card` giữ DOM như ghim; `KaraTrace` vi/en + sr-only).
- [ ] **Step 2:** Chạy → FAIL «focus roi: esc», «inline co dinh co chu: text-sm».
- [ ] **Step 3:** Cài: bỏ `text-sm` khỏi `GiaTri` và biên nhận ở `inline` (giữ ở `card`), bỏ bọc `ms-auto` khi `density="inline"`, gộp slot biên nhận, thêm focus; `KaraTrace` trong `kara.tsx`.
- [ ] **Step 4:** Chạy test mới + `nen-kara.dom.tsx` + `proposed-change.dom.tsx` → PASS (sửa khẳng định cũ đo slot `proposed-change-decided` sang slot mới); commit `feat(ui): ProposedChange giữ focus, cỡ chữ inline theo cha; KaraTrace`.

independent: true · phục vụ E15, E21 (E22 đo ở Task 9)

### Task 4: App — chữ Kara, hook `useGopYMucTieu`, chuyển `dauThangSau`

**Files:**
- Modify: `apps/app/lib/messages/okr-gop-y.ts` (viết lại theo Kara; khoá mới: `vung.nhan(n)`, `vung.daXemHet`, `vung.lyDo`, `vung.docLuc`, `vung.nho`, `vung.docLai`, `vung.dangDoc`, `vung.rong`, `vung.rongMoTa(gio)`, `vung.loi`, `vung.loiMoTa`, `vung.thuLai`, `vung.hetLuot`, `vung.tamNghi(ngay)`; `de.doiTenKr`, `de.sua`, `de.boQua`, `de.themDoiTrong`, `de.suaKrNay`, `de.moKr`, `de.huy`; `bienNhan.daDoiTen`, `bienNhan.daDoiTieuDe`, `bienNhan.daDoiViSao`, `bienNhan.daCanChinh`, `bienNhan.daHoanTac`, `bienNhan.boQuaTen(sau)`, `bienNhan.boQuaHoi(tomTat)`; `tomTat` theo năm mã vấn đề; `chip(n)`, `chipAria(n, ten)`; `danSang(n)`, `danSangMoTaMt`, `danSangMoTaKr`, `xemGopY`; `vet.theoKara`; `loc.matGopY`, `loc.coGopYCho(n)`)
- Modify: `apps/app/test/messages-guard.spec.ts` (`GHIM_OKR_GOP_Y` theo khoá mới)
- Create: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts` (hook)
- Modify: `apps/app/lib/okr-chu-ky-nhan.ts` (nhận `dauThangSau`), `apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx`, `apps/app/test/khung-soan-okr.tsx` (đường import)
- Modify: `apps/app/app/(app)/[slug]/okr/bang-vet.tsx` (dùng `vet.theoKara`), `apps/app/test/tro-ly-okr-vet.dom.tsx` (chữ Kara)
- Modify: `apps/app/lib/search-param-keys.ts` (`okr.gopY: "gopYOkr"`, `okr.neoGopY: "neoGopY"`), `okr-search-params.ts` (parser)

**Interfaces:**
- Produces: `useGopYMucTieu({ objectiveId: string | null; soGopYCho: number | null }) → { sanSang, trangThai: "tat"|"chua-goi"|"dang-doc"|"rong"|"loi"|"het-luot"|"tam-nghi"|"co-gop-y", dong: { capBo: DongHien[]; viSao: DongHien[]; theoKr: ReadonlyMap<string, DongHien[]> }, conCho: number, dangQuyet: string | null, ketCua(id) → { ket: "accepted"|"skipped"; daHoanTac: boolean } | undefined, quyet(d, cach, giaTri?), hoanTac(d), nho(), loiDong: Record<string,string>, coHoiDoiTrong: boolean, docLuc: string | null }`; `DongHien` lấy từ output thật `RouterOutputs["okr"]["troLyDanhSach"]["dong"][number]`.
- Hook gọi `cache.okr(objectiveId)` đúng một lần khi `dong` đến lần đầu và số dòng ≠ `soGopYCho` (không đếm biên nhận).

- [ ] **Step 1:** Viết `messages-guard` ghim mới + test DOM `trang-thai-kara`, `dong-bo` (Task 5 dựng khung dùng hook; ở task này test hook qua một component thử trong tệp test).
- [ ] **Step 2:** FAIL → cài messages, hook (giữ logic `troLySanSang`/`troLyDanhSach`/`refetchInterval` khi `dangSoan`/`troLyDeXuat`/`troLyQuyet`/hoàn tác của `cot-gop-y.tsx`, đổi khung trả), chuyển `dauThangSau`, đổi vết.
- [ ] **Step 3:** `bun run check-types`, test → PASS; commit `feat(gop-y-dung-cho): hook góp ý theo chỗ neo, chữ Kara`.

independent: false (cần Task 2 cho kiểu `soGopYCho`) · phục vụ E5, E17, E18 (một phần)

### Task 5: App — vùng Kara và đề xuất neo trong khung chi tiết

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx` (`VungKara`, `DeXuatNeo`)
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx` (`TabKr`: gọi hook, `diemCam` Kara cho `BangKr` — `duoiKr`, `sauTenKr` qua `krTheoKara(mt.trail)`; góp ý `whyNow` dưới `KhuViSao`; `hoiDoiTrong={suaNoiDung(mt) && !gopY.coHoiDoiTrong}`; đọc cờ `neoGopY` một lần, cuộn `[data-nhom-kara]`, xoá cờ)
- Test: `apps/app/test/gop-y-dung-cho.dom.tsx` (`-t neo`, `-t doi-trong`, `-t nhan-hoan-tac`, `-t bo-qua`, `-t khoa-gui`, `-t focus-khung`, `-t trang-thai-kara`, `-t dong-bo`)

**Interfaces:**
- Consumes: `useGopYMucTieu` (Task 4), `ProposedChange`/`KaraLabel`/`KaraTrace` (Task 3), `krTheoKara` (Task 1), `DiemCam` (`okr/diem-cam.ts`).
- Produces: `[data-nhom-kara=<trangThai>]` trước bảng KR; `[data-gop-y=<id>]` trên mỗi `ProposedChange`.

- [ ] **Step 1:** Viết các khối test trên với fixture parse bằng `objectiveOutput` và output thật của `troLyDanhSach` (`okr.contracts.ts`), tRPC giả theo khuôn `muc-tieu-va-kr.dom.tsx`; ma trận 6 chỗ neo; ma trận bỏ qua 6 phần tử; ba ô `dong-bo`.
- [ ] **Step 2:** FAIL → cài `nhom-kara.tsx` (Item/Empty/ThinkingIndicator/KaraLabel theo bảng ST-b-* của design) và nối `TabKr`.
- [ ] **Step 3:** PASS; chiều đỏ từng khối bằng bản sao; commit `feat(gop-y-dung-cho): góp ý neo dưới KR trong khung chi tiết`.

independent: false (cần Task 3, 4) · phục vụ E5, E8, E9, E11, E13, E14, E16, E17

### Task 6: App — chip trên danh sách và bộ lọc

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/chip-gop-y.tsx`
- Modify: `apps/app/app/(app)/[slug]/okr/cua-toi.tsx`, `theo-don-vi/theo-don-vi.tsx` (truyền `diemCam={{ nhanMucTieu }}`; theo-don-vi đọc/ghi `gopYOkr`, gửi `loc.gopY`), `loc-okr.tsx` (mặt `gopY`, `LocOkrGiaTri.gopY`, `coLoc`, `chuanLoc`)
- Test: `apps/app/test/gop-y-dung-cho.dom.tsx` (`-t chip`, `-t loc-url`)

**Interfaces:**
- Consumes: `soGopYCho` (Task 2), messages (Task 4), `useOpenRecord`.
- Produces: `ChipGopY({ mt }: { mt: MucTieu })` — `Button variant="outline" size="xs"` bọc `KaraMark`, `stopPropagation`, mở `objective:<id>` và đặt `neoGopY=1`.

- [ ] **Step 1:** Test chip (ma trận 2 màn × 2 Mục tiêu; chuột, Enter; bấm tên không đặt `neoGopY`; chiều đỏ «chip khong tu api: A») và `loc-url`.
- [ ] **Step 2:** FAIL → cài; PASS; commit `feat(gop-y-dung-cho): chip góp ý trên danh sách và bộ lọc`.

independent: false (cần Task 2, 4) · phục vụ E1, E7

### Task 7: App — hai hộp Sửa chỉ còn dòng dẫn; gỡ cột

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/dong-dan-gop-y.tsx`
- Modify: `hop-thoai-muc-tieu.tsx`, `hop-thoai-kr.tsx` (bỏ `useGopY`, `CotGopY`, `NutGopY`, `chiO`/`oDuocChi`, `size="assist"`, `SheetBody split`; thêm dòng dẫn bọc `SheetClose`)
- Delete: `okr/cot-gop-y.tsx`, `okr/the-gop-y.tsx` (giữ `the-gop-y-props.ts` vì `packages/ui/test` dùng)
- Delete: `apps/app/test/tro-ly-okr-gop-y.dom.tsx`; Modify: `the-gop-y-okr.dom.tsx` (chỉ giữ khối `thong-tin`), `khung-tao-okr.dom.tsx` (bỏ `co-ngan`, `mo-kr-url`), `nen-kara-man-cu.dom.tsx` (bỏ ca cột), `khung-gop-y.tsx` (dọn selector cột)
- Test: `apps/app/test/gop-y-dung-cho.dom.tsx` (`-t hop-sua`)

**Interfaces:**
- Consumes: `soGopYCho` của Mục tiêu (hộp Mục tiêu đọc từ query `okr.objective`), số góp ý của KR (đếm `troLyDanhSach` theo `keyResultId` ở hộp KR qua hook Task 4), messages Task 4.
- Produces: `DongDanGopY({ so, moTa, objectiveId })`.

- [ ] **Step 1:** Test `hop-sua` (ma trận 4 ô; form sạch → đóng + mở khung + `neoGopY`; form bẩn → hộp hỏi giữ thay đổi; chiều đỏ «cot gop y con: hop-kr»).
- [ ] **Step 2:** FAIL → cài, xoá tệp, dọn test cũ; `bun run check-types` + `bun run lint`; PASS; commit `feat(gop-y-dung-cho): hộp Sửa chỉ còn dòng dẫn, gỡ cột góp ý`.

independent: false (cần Task 4, 5) · phục vụ E19, E20

### Task 8: Phép đo của hồ sơ — `rang/`

**Files:**
- Create: `_acceptance/gop-y-dung-cho/rang/chu-kara.mjs`, `xoa-tep.mjs`, `thay-the.mjs`
- Test: chạy từng script ở chiều xanh và chiều đỏ ghim (`--kiem-do-do`, `--goc`, `--bo-dong`)

**Interfaces:**
- `thay-the.mjs` đọc bảng giữa marker `BANG-THAY-THE` của design doc, `evals.yaml` mọi hồ sơ đã ký (YAML qua `Bun.YAML`, gốc kho suy từ vị trí script), giải `config:` trong `_acceptance/config.yaml`; hai phép so (a) eval có lệnh, (b) judgment theo `inputs`.

- [ ] **Step 1:** Viết ba script, mỗi script thoát 0 ở cây hiện tại và thoát 1 với thông điệp ghim ở chiều đỏ.
- [ ] **Step 2:** Commit `test(gop-y-dung-cho): răng chữ Kara, xoá tệp cột, bảng thay thế`.

independent: true (sau Task 7 thì xoa-tep mới xanh) · phục vụ E18, E20, E25

### Task 9: Phép đo màn thật — `man-gop-y.mjs` + seed

**Files:**
- Create: `_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs` (seed qua Prisma của phiên đo: đơn vị bật Kara, Mục tiêu A ba dòng chờ, B không)
- Create: `_acceptance/gop-y-dung-cho/rang/man-gop-y.mjs` (canh-cay, tien-de, puppeteer: E2, E22, E23; ảnh `evidence/E2-*`, `E23-*`, `E2-chi-tiet-bien-nhan-1440-*`)

- [ ] **Step 1:** Viết theo khuôn `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs` (mot-luot.sh, canh-cay, đo bằng `mouse.wheel`, `innerText`), cờ `--kiem-do-do` cho chiều đỏ của E2/E22/E23.
- [ ] **Step 2:** Chạy `config:executors.script.gy_man_that` (kiểm cổng 3300 và khoá làn trước) → exit 0; chạy chiều đỏ → mã 1 đúng thông điệp; commit `test(gop-y-dung-cho): đo màn thật danh sách, khung chi tiết, 28 ô khổ`.

independent: false (cần Task 2–7) · phục vụ E2, E22, E23, E26 (ảnh)

### Task 10: Năm lệnh chứng và dọn

- [ ] `config:executors.script.gy_san_thiet_ke` (E24) thoát 0; `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` (với PATH Bun 1.3.12) → xanh; `docs/ai-ux.md` bảng lộ trình ghi `gop-y-dung-cho` đã làm; contract `status: implemented`.

independent: false
