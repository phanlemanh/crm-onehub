# VK11 · Mọi KR cả công ty — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ô «KR trượt» bấm được ở Báo cáo › Sức khoẻ dẫn tới trang «Mọi KR» liệt kê mọi KR cả công ty người xem được thấy, lọc theo tình trạng, đơn vị, người, bộ lọc trên đường dẫn.

**Architecture:** Một thủ tục chỉ đọc `okr.moiKr` trong một dịch vụ mới (`OkrMoiKrService`) đọc mục tiêu theo quyền xem bằng `OkrService.docMucTieu` và lọc-đếm bằng một hàm thuần `locMoiKr`. App có trang `/okr/moi-kr` (chip tình trạng + `DataTable` hai mặt lọc), ô «KR trượt» là biến thể liên kết mới của `StatCard`, và mục thanh bên mới trong nhóm Báo cáo.

**Tech Stack:** NestJS + nestjs-trpc, Prisma, Zod, Next.js App Router, TanStack Query, nuqs, bun test (jsdom preload), puppeteer-core qua `scripts/lan-do/tien-de.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-21-moi-kr-ca-cong-ty-design.md` · hợp đồng `_acceptance/moi-kr-ca-cong-ty/contract.md` (đã duyệt 21/10) · `_acceptance/moi-kr-ca-cong-ty/evals.yaml`.

## Global Constraints

- Không chú thích trong code (`AGENTS.md`).
- Không sửa tệp T3: `apps/api/src/okr/okr-access.service.ts`, `apps/api/src/okr/hien-thi.ts`, `packages/db/src/okr-hien-thi.ts` — chỉ gọi.
- Tệp hàng khác đang giữ (`okr.router.ts`, `toan-canh/toan-canh.tsx`, `thanh-ben-muc-tieu.tsx`, `messages/okr-vo-khu.ts`): chỉ THÊM dòng, sau khi giám sát trả lời yêu cầu `cham-tep`.
- Tham số đường dẫn: `tinhTrangKr`, `donViKr`, `nguoiKr` (khai trong `SEARCH_PARAM.okr` của `apps/app/lib/search-param-keys.ts`, chỉ thêm).
- Giá trị tình trạng theo thứ tự hiển thị: `truot`, `cham-nhip`, `dung-nhip`, `chua-co-ky-vong`, `moc-chua`, `moc-xong`.
- Khoá đơn vị: `goc`, `bp:<divisionId>`, `pb:<departmentId>` (như `khoaCuaMucTieu` của `toan-canh.ts`).
- Chữ hiển thị nằm trong messages (vi + en), không viết tay chuỗi ở JSX; dữ liệu người nhập mang `translate="no"`.
- Một client component không import `@crm/db`, `@crm/auth`.
- Hằng tinh chỉnh được vào `apps/api/src/okr/okr-xem.config.ts` (`OKR_XEM.moiKr`), không rải.

## Review Focus

- Đơn vị bị xoá giữa chu kỳ mà mục tiêu vẫn trỏ tới (`divisionId` không còn trong cây) → dòng vẫn hiện với tên đơn vị từ `unitName`, mặt lọc không có giá trị ấy, không vỡ trang (Task 1, ca `mkc-don-vi-mo-coi`).
- Một người phụ trách KR đã rời công ty → mặt lọc Người vẫn có giá trị với tên lấy từ dòng (Task 1, đếm theo `owner.name`).
- `kyOkr` trên đường dẫn trỏ chu kỳ không tồn tại → `giaiKy` trả chu kỳ hiện hành, bộ lọc giữ (Task 3, ca trong `mkc-duong-dan`).
- Chu kỳ có KR nhưng 0 KR trượt → ô hiện «0», vẫn là liên kết; danh sách lọc Trượt ra `Empty` «Không KR nào khớp bộ lọc» (Task 4 + Task 3).
- `progress` lớn hơn 100 hoặc `expected` = 0 → tình trạng theo `tinhTrang` (`chua-co-ky-vong` khi kỳ vọng 0), không chia cho 0 (Task 1, ma trận E3).

---

### Task 1: API `okr.moiKr` (phục vụ E3, E4, E5, E6, E7; nền cho E1, E2, E12) · independent: false

**Files:**
- Create: `apps/api/src/okr/okr-moi-kr.contracts.ts`, `apps/api/src/okr/moi-kr.ts`, `apps/api/src/okr/okr-moi-kr.service.ts`, `apps/api/scripts/okr-mau/ca-moi-kr.ts`, `apps/api/test/okr-moi-kr.spec.ts`
- Modify: `apps/api/src/okr/okr.module.ts` (thêm provider), `apps/api/src/okr/okr.router.ts` (+import, +constructor, +thủ tục — sau `cham-tep`), `apps/api/src/okr/okr-xem.config.ts` (`moiKr.toiDaMoiMat`)

**Interfaces — Produces:**
- `TINH_TRANG_KR = ["truot","cham-nhip","dung-nhip","chua-co-ky-vong","moc-chua","moc-xong"] as const`, `type TinhTrangKr`.
- `moiKrInput = z.object({ cycleId, loc: z.object({ tinhTrang: z.array(z.enum(TINH_TRANG_KR)), donVi: z.array(ma), nguoi: z.array(ma) }) })`.
- `dongMoiKr = { keyResultId, tieuDe, objectiveId, mucTieu, donVi: { khoa, ten }, nguoi: { id, name }, progress, expected: number|null, tinhTrang: TinhTrangKr }`.
- `moiKrOutput = { rows: dongMoiKr[], total, facetCounts: { tinhTrang: {value,count}[], donVi: {value,count,name}[], nguoi: {value,count,name}[] } }`.
- `locMoiKr(dong: DongMoiKr[], loc, conCua: (khoa) => string[]): MoiKrOutput` — `conCua("bp:x")` trả `["bp:x", ...pb con]`.
- `OkrMoiKrService.moiKr(userId, input): Promise<MoiKrOutput>`; thủ tục `okr.moiKr` (`@Query`, `restMeta("GET", "/okr/key-results/all", TAG)`).
- `napCaMoiKr(db, { luc })` và hằng `CA_MOI_KR` (mã KR mong có/vắng, tình trạng mong đợi từng KR, khoá B1/P1/P2/B2/P3, người A/B/u2, người xem hẹp).

- [ ] **Step 1: Viết `apps/api/test/okr-moi-kr.spec.ts`** với năm `describe` mang đúng tên ca `mkc-nguon`, `mkc-quyen`, `mkc-loc-tinh-trang`, `mkc-loc-don-vi`, `mkc-loc-nguoi` (khuôn `okr-so-do-don-vi.spec.ts`: `dungUngDung`, `batDauMau`, `phienMau`, `goi`), `setSystemTime` ghim ngày trong `beforeAll`; khẳng định đúng như `expected` của E3–E7 (ma trận viết trước trong `CA_MOI_KR`, so tập `keyResultId`, đối chiếu `okr.khoiCuaToi` cho u2, `moiKrOutput.parse` mọi đầu ra).
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/api && bun test test/okr-moi-kr.spec.ts"` → FAIL (`okr.moiKr` chưa có).
- [ ] **Step 3: `ca-moi-kr.ts`** — nạp qua đường ghi thật của `OkrService` (tạo mục tiêu, thêm KR, công bố, ghi `currentValue`), đặt `publishedAt` tương đối `luc`; gồm mục tiêu công bố muộn (`publishedAt` khác `createdAt` và khác ngày đầu chu kỳ), một mục tiêu `gioi-han`, nháp, đã bỏ, cá nhân, chu kỳ khác, tham vọng, học tập, KR mốc, KR chủ A người phụ trách B.
- [ ] **Step 4: `moi-kr.ts` + contracts + service + router + module.** Service: `q = quyen(userId)`, `docMucTieu(db, { cycleId, status: "cong-bo", level: { in: ["onehub","bo-phan","phong-ban"] } }, userId, q, { nguCanh: nguCanhXem(q, userId) })`; tình trạng mỗi KR như `khoiCuaToi` (KR mốc → `moc-xong` khi `progress >= 100`, khác `moc-chua`; còn lại `tinhTrang(k.progress, m.expected, m.kind)`); `conCua` dựng từ `q.cay.divisions[].departments`. `locMoiKr`: một mặt đếm trên tập đã lọc theo hai mặt kia; giá trị mỗi mặt theo «hoặc», các mặt theo «và»; mặt rỗng = không lọc.
- [ ] **Step 5: Chạy lại** lệnh Step 2 → PASS cả năm ca.
- [ ] **Step 6: Phá-thử** (bản sao cục bộ, không commit): bỏ điều kiện cấp cá nhân → `mkc-nguon` đỏ «KR ca nhan lot vao ca cong ty»; đọc bằng `"so-gop"` → `mkc-quyen` đỏ; đếm tình trạng sau khi lọc chính nó → `mkc-loc-tinh-trang` đỏ; khớp đơn vị tuyệt đối → `mkc-loc-don-vi` đỏ; lọc theo chủ mục tiêu → `mkc-loc-nguoi` đỏ. Hoàn lại bằng `git checkout -- <tệp>` SAU khi đã commit Step 7.
- [ ] **Step 7: Commit** `feat(moi-kr-ca-cong-ty): thủ tục okr.moiKr đọc mọi KR cả công ty`.

### Task 2: `StatCard` dạng liên kết trong `packages/ui` (nền cho E1, E11) · independent: true

**Files:**
- Modify: `packages/ui/src/components/stat-card.tsx`
- Test: `packages/ui/test/stat-card-lien-ket.dom.tsx`

**Interfaces — Produces:** `StatCard` nhận `asChild?: boolean`; khi `asChild`, phần tử con duy nhất (ví dụ `<Link>`) nhận `data-slot="stat-card"`, lớp khung và trạng thái `hover:bg-muted/40 focus-visible:ring` của biến thể, nội dung nhãn/số/mô tả đặt bên trong nó (Radix `Slot` + `Slottable`).

- [ ] **Step 1: Test** — `asChild` với `<a href="/x">` → phần tử `a[data-slot=stat-card][href="/x"]` chứa nhãn và số; không `asChild` → vẫn `div` như cũ (đối chứng). Chiều đỏ: bản sao bỏ `Slottable` → «nhãn nằm ngoài liên kết».
- [ ] **Step 2: Chạy** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/stat-card-lien-ket.dom.tsx` → FAIL.
- [ ] **Step 3: Cài `asChild`** theo nếp `Button` của `packages/ui` (cùng `Slot`).
- [ ] **Step 4: Chạy lại** → PASS; chạy bài kiểm sẵn có của `StatCard`/`StatGroup` nếu có (`grep -l stat-card packages/ui/test`).
- [ ] **Step 5: Commit** `feat(ui): StatCard dạng liên kết`.

### Task 3: Trang Mọi KR + thanh bên (phục vụ E8, E9, E10) · independent: false (dùng Task 1)

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/moi-kr/page.tsx`, `.../okr/moi-kr/moi-kr.tsx`, `.../okr/moi-kr/tham-so.ts`, `apps/app/lib/messages/okr-moi-kr.ts`, `apps/app/test/moi-kr-ca-cong-ty.dom.tsx`
- Modify: `apps/app/lib/search-param-keys.ts` (+3 khoá), `.../okr/tab-okr.ts` (`moi-kr` vào nhóm `bao-cao` giữa `suc-khoe` và `so-do`, `DUONG_MUC["moi-kr"] = "/okr/moi-kr"`), `.../okr/thanh-ben-muc-tieu.tsx` (+1 nhãn — sau `cham-tep`), `apps/app/lib/messages/okr-vo-khu.ts` (+`muc.moiKr` vi/en — chỉ thêm)

**Interfaces:**
- Consumes: `okr.moiKr` (Task 1), `useMoNganKr` (`components/crm/record-sheet/dien-bien-kr.ts`), `PaceIndicator` (`packages/ui` `okr-status.tsx`), `ChuaChuKy`/`DangTai`/`LoiXem` sẵn có, `useChuKy`.
- Produces: `moiKrParsers` (nuqs: `tinhTrangKr` = `parseAsArrayOf(parseAsStringLiteral(TINH_TRANG_KR))`, `donViKr`, `nguoiKr` = `parseAsArrayOf(parseAsString)`), `duongMoiKr(url, { ky, tinhTrang })` dùng chung với Task 4.

- [ ] **Step 1: Test** `moi-kr-ca-cong-ty.dom.tsx` ba ca `mkc-duong-dan`, `mkc-ngan`, `mkc-trang` đúng `expected` E8–E10 (khuôn `vo-khu-muc-tieu.dom.tsx`: nuqs test adapter, QueryClient đổ sẵn dữ liệu, gián điệp trên `useMoNganKr` thật).
- [ ] **Step 2: Chạy** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/moi-kr-ca-cong-ty.dom.tsx -t "mkc-duong-dan|mkc-ngan|mkc-trang"` → FAIL.
- [ ] **Step 3: Trang.** `page.tsx` dựng `DauTrangOkrTrang tab="toan-canh"`, `PageShellTitle` «Mọi KR» + một câu mô tả trong page, prefetch `okr.moiKr`; `moi-kr.tsx` (client): `ToggleGroup type="multiple" variant="outline" size="sm"` cho tình trạng (số đếm `text-muted-foreground tabular-nums`), `DataTable layout="content"` với hai mặt `donVi`, `nguoi` (`facetValueOptions`), cột KR · Đơn vị · Phụ trách (`hideBelow: "md"`) · Tiến độ (`hideBelow: "md"`) · Tình trạng (`PaceIndicator`), `meta` in tổng số dòng, `onRowClick` → `useMoNganKr()(kr.keyResultId)`, `pageSize: Number.MAX_SAFE_INTEGER` như Bộ OKR; các trạng thái ST-moikr-* theo bảng của design doc.
- [ ] **Step 4: Chạy lại** → PASS; `cd apps/app && bun test ./test/messages-guard.spec.ts` xanh.
- [ ] **Step 5: Phá-thử** từng chiều đỏ của E8–E10, hoàn lại sau commit.
- [ ] **Step 6: Commit** `feat(moi-kr-ca-cong-ty): trang Mọi KR và mục thanh bên`.

### Task 4: Ô «KR trượt» ở Sức khoẻ (phục vụ E1) · independent: false (dùng Task 1, 2, 3)

**Files:**
- Create: `.../okr/toan-canh/o-kr-truot.tsx`
- Modify: `.../okr/toan-canh/toan-canh.tsx` (+import, +`<OKrTruot />` cuối `StatGroup` — sau `cham-tep`), `.../okr/toan-canh/page.tsx` (prefetch `okr.moiKr` với loc rỗng), `apps/app/lib/messages/okr-moi-kr.ts` (nhãn ô)
- Test: ca `mkc-o-truot` trong `apps/app/test/moi-kr-ca-cong-ty.dom.tsx`

**Interfaces:** Consumes `okr.moiKr` (`facetCounts.tinhTrang`), `StatCard asChild` (Task 2), `duongMoiKr` (Task 3). Produces `OKrTruot` với `data-o="kr-truot"`.

- [ ] **Step 1: Test** `mkc-o-truot` đúng `expected` E1 (ma trận 3 dòng).
- [ ] **Step 2: Chạy** `... -t mkc-o-truot` → FAIL.
- [ ] **Step 3: Cài** `OKrTruot`: số = `count` của `truot` trong `facetCounts.tinhTrang` (vắng → 0), `StatCard asChild` bọc `Link href={duongMoiKr(url, { ky, tinhTrang: ["truot"] })}`.
- [ ] **Step 4: Chạy lại** → PASS; phá-thử hai chiều đỏ của E1.
- [ ] **Step 5: Commit** `feat(moi-kr-ca-cong-ty): ô KR trượt bấm được ở Sức khoẻ`.

### Task 5: Bàn đo màn (phục vụ E2, E11, E12) · independent: false (dùng Task 1–4)

**Files:**
- Create: `_acceptance/moi-kr-ca-cong-ty/rang/do-man.mjs`
- Modify: `apps/api/scripts/okr-mau.ts` hoặc ca của nó (thêm ca KR trượt tương đối giờ chạy khi bộ mẫu chưa có ≥ `N_TRUOT`)

**Interfaces:** Consumes `taoNguCanh`/`phienCua`/`trangMoi`/`trpcCua` của `_acceptance/vo-khu-muc-tieu/rang/do-man-*.mjs`, `canhCay`, `ket`/`khongDo`. Produces dòng `DUNG AC-1 …`, `DUNG nguong duong-dan …`, `DUNG AC-10 …`, `KET LUAN VK11: <d> DUNG, <s> SAI`; pha-thử `MKC_PHA` ∈ `dem-ca-nhan`, `mot-trang`, `bo-mat-nguoi`; ảnh sang `evidence/` chỉ khi `MKC_CHEP_ANH=1`.

- [ ] **Step 1: Viết bàn đo** theo khuôn `vo-khu-muc-tieu/rang/do-man.mjs` (kiểm kho `_do`, `canhCay`, mã 2 khi không dựng được Given `so-o < 2`).
- [ ] **Step 2: Chạy một lượt** `EVAL= bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/moi-kr-ca-cong-ty/rang/do-man.mjs"` (nền, có thể dài) → mã 0; ba lượt pha-thử → đúng dòng SAI ghim. Không chạy được trong phiên này → ghi rõ trong ghi chú bàn giao, dãy V2 chạy ở S4.
- [ ] **Step 3: Commit** `test(moi-kr-ca-cong-ty): bàn đo màn một bấm và đường dẫn`.

### Kết S3

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop` xanh (không chạy `bun run test` toàn bộ hay `build` — nặng, để dãy V2).
- [ ] Contract `status: implemented`, commit, đẩy `git push --no-verify -u origin feat/moi-kr-ca-cong-ty` (lý do: «S4 do dãy V2 chạy»).
