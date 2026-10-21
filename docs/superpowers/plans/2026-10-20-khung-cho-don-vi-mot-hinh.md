# Khung chờ trang Theo đơn vị một hình — kế hoạch thi công (DH12)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang Theo đơn vị vẽ đúng một khung chờ — hình `bang-hai-dong` mới của `KhungXuong` — ở fallback máy chủ và
mọi pha tải phía trình duyệt.

**Architecture:** `packages/ui` thêm hình thứ sáu cho `KhungXuong` cùng khe `thanhCongCu` (vẽ ngoài phần
`aria-hidden`) và `nhan` (câu trạng thái). `KhungDangTaiDonVi` của `apps/app` thôi vẽ tay, bọc `KhungXuong`; `page.tsx`
lấy nó làm fallback. Thước: bài DOM `apps/app/test/khung-cho-don-vi.dom.tsx`, bài `packages/ui/test/khung-xuong.dom.tsx`,
hai rang (`trang-khac.mjs`, `man-khung-cho.mjs`) và `hai-chieu.mjs` cho các bản sao phá thử `KCD_PHA`.

**Tech Stack:** React 19, Next.js App Router, Tailwind, bun test + jsdom (`setup-dom.ts`), Puppeteer qua
`scripts/lan-do/tien-de.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-20-khung-cho-don-vi-mot-hinh-design.md` · hợp đồng
`_acceptance/khung-cho-don-vi-mot-hinh/contract.md` · bộ đo `_acceptance/khung-cho-don-vi-mot-hinh/evals.yaml`.

## Global Constraints

- Không viết chú thích trong code (AGENTS.md) — trừ khối mô tả đầu tệp rang `.mjs` như mọi rang đang có.
- `packages/ui` là nguồn duy nhất của vạch khung chờ; không tệp nào dưới `okr/theo-don-vi/` nhập `Skeleton` hay dùng
  `animate-pulse`.
- Câu trạng thái của trang: «Đang tải OKR…» (`okrMessages(locale).dangTai`); mặc định của `KhungXuong`: `msg.khungXuong.dangTai`.
- Giữ `data-trang-thai="ST-donvi-dangtai"` và `aria-busy="true"` trên vỏ của `KhungDangTaiDonVi` (năm bài DOM đang đọc).
- Năm hình cũ của `KhungXuong` giữ đúng số vạch: `bang` 1/1/8, `danh-sach` 6, `the` 2/6, `tong-quan` 4/5, `chi-tiet` 1/3.
- Mỗi thước mới có cặp hai chiều cùng fixture, thông điệp ghim `SAI AC-n: …` (MEASURE-BIRTH-CLAUSE).
- Rang ghi ảnh ra `_acceptance/khung-cho-don-vi-mot-hinh/evidence/` khi hồ sơ chưa thông cổng, ra
  `.acceptance-runs/khung-cho-don-vi-mot-hinh/evidence/` khi đã thông (khuôn `daThongCong` của `man-don-vi.mjs` DH2).

## Review Focus

- Đổi đơn vị khi khung đang có hàng công cụ thật: ô chọn phải bấm được (không bị phủ, không inert) — Task 2 kcd-a11y và
  Task 4 E3.
- Khổ dưới `sm`: vạch hàng công cụ một hàng rộng, không tràn ngang ở 390 — Task 4 E9 ảnh 390 và E1 khổ 390.
- Trang khác đang dùng `KhungXuong hinh="bang"` không đổi — Task 3.
- Fallback máy chủ đọc «Đang tải OKR…», không «Đang tải…» — Task 2 kcd-a11y ca fallback.
- Mẫu lạ (vạch ngoài khung `bang-hai-dong`, vd `PageShellFallback`) trên đường đi mềm — Task 4 E2.

---

### Task 1: Hình `bang-hai-dong`, khe `thanhCongCu`, `nhan` trong `KhungXuong` (independent: true)

**Phục vụ:** E6 (AC-6), nền cho E5, E8.

**Files:**
- Modify: `packages/ui/src/components/khung-xuong.tsx`
- Test: `packages/ui/test/khung-xuong.dom.tsx`

**Interfaces:**
- Produces: `HinhKhungXuong` thêm `"bang-hai-dong"`; `KhungXuong({ hinh, cot?, coTieuDe?, thanhCongCu?: ReactNode, nhan?: string })`.
  Hình `bang-hai-dong`: vỏ `flex flex-col gap-3`; hàng công cụ `[data-khung-hang=thanh-cong-cu]` (khi không có
  `thanhCongCu`) chép đúng `XuongHangCongCu` của `hang-cong-cu.tsx` hôm nay, khối trái mang `data-hang-cong-cu-don-vi-khung`;
  khi có `thanhCongCu`: hàng `[data-khung-hang=thanh-cong-cu]` gồm `thanhCongCu` rồi cụm vạch phải (`XuongPhaiHang` hôm
  nay, trong `aria-hidden`), và hàng này nằm NGOÀI `[aria-hidden=true]`; thân bảng `rounded-lg border bg-card` với
  `[data-khung-hang=dau-bang]` `h-11` và năm `[data-khung-hang=hang]` hai tầng như `KhungDangTaiDonVi` hôm nay.
  `nhan` thay chữ của `[role=status]`.

- [ ] **Step 1:** Thêm vào `MA_TRAN` dòng `["bang-hai-dong", { "thanh-cong-cu": 1, "dau-bang": 1, hang: 5 }]` và các ca:
  `bang-hai-dong: moi dong co it nhat hai vach` (mỗi `[data-khung-hang=hang]` có ≥ 2 `[data-slot=skeleton]`),
  `nhan thay cau trang thai` (`nhan="Đang tải OKR…"` → `[role=status]` đọc đúng câu đó, chỉ một),
  `thanhCongCu nam ngoai phan an` (khe là `<button data-thu>` → nút không có tổ tiên `[aria-hidden=true]`, `focus()` làm nó
  thành `document.activeElement`, phần vạch vẫn không phần tử nhận tiêu điểm), chiều đỏ ghim `kmc-xuong: bang-hai-dong co 4 hang, bang ghi 5`
  bằng cách gỡ một dòng trên DOM rồi gọi `kiemKhungXuong`.
- [ ] **Step 2:** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx` → FAIL (hình chưa có).
- [ ] **Step 3:** Cài hình, khe, `nhan`; `kiemKhungXuong` bỏ qua khe khi đếm tabbable (chỉ đếm trong `[aria-hidden=true]`).
- [ ] **Step 4:** Lệnh Step 2 → PASS, sáu hình sáu cây khác nhau.
- [ ] **Step 5:** Commit `feat(khung-cho-don-vi-mot-hinh): KhungXuong hình bang-hai-dong, khe thanhCongCu, nhan`.

### Task 2: Trang Theo đơn vị dùng một khung (independent: false — cần Task 1)

**Phục vụ:** E5 (AC-5), E8 (AC-7).

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/theo-don-vi/hang-cong-cu.tsx` (bỏ `XuongPhaiHang`, `XuongHangCongCu`,
  `DONG_KHUNG`, nhập `Skeleton`), `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx` (fallback)
- Create: `apps/app/test/khung-cho-don-vi.dom.tsx`
- Modify: `apps/app/test/okr-trang-don-vi.dom.tsx` chỉ khi bài «dang-tai» cần đọc lại bộ chọn (giữ nguyên ý bài)

**Interfaces:**
- Consumes: `KhungXuong` của Task 1.
- Produces: `KhungDangTaiDonVi({ hang?: ReactNode })` = vỏ `div data-trang-thai="ST-donvi-dangtai" aria-busy="true"` bọc
  `<KhungXuong hinh="bang-hai-dong" nhan={m.dangTai} thanhCongCu={hang} />`, vỏ không mang `[role=status]` riêng. `page.tsx`:
  `<Suspense fallback={<KhungDangTaiDonVi />}>`.

- [ ] **Step 1:** Viết `khung-cho-don-vi.dom.tsx`, `mock.module` như `du-an.dom.tsx` cho `@/lib/session`,
  `@/lib/trpc/server`, `@/lib/trpc/hydrate`, `@/lib/locale/server`, `next/navigation`. Nhóm `kcd-cau-truc`: gọi
  `TheoDonViPage({ searchParams: Promise.resolve({}) })`, tìm phần tử `Suspense` trong cây trả về, `props.fallback.type`
  phải là `KhungDangTaiDonVi` (`SAI AC-5: fallback page.tsx khong phai KhungDangTaiDonVi`); dựng fallback, khung không
  hàng, khung có hàng (`hang` = `<HangCongCuDonVi chon={<button data-chon-don-vi>…</button>} …/>`) → cả ba có
  `[data-khung-xuong=bang-hai-dong]`, cùng chữ ký (số `[data-khung-hang=hang]`, số vạch mỗi dòng, `className` của đầu bảng
  và dòng); quét mọi `.ts/.tsx` dưới `okr/theo-don-vi/` bằng `typescript` (`ts.createSourceFile`): không `ImportDeclaration`
  có tên `Skeleton`, không chuỗi chứa `animate-pulse` (`SAI AC-5: <tệp> tu ve vach`). Nhóm `kcd-a11y`: ba ca (fallback,
  không hàng, có hàng) → vỏ `aria-busy="true"`, đúng một `[role=status]` đọc «Đang tải OKR…», vạch nằm trong
  `[aria-hidden=true]`, không phần tử nhận tiêu điểm trong phần ẩn; ca có hàng: `[data-chon-don-vi]` không có tổ tiên
  `[aria-hidden=true]` và nhận `focus()` (`SAI AC-7: o chon don vi nam trong phan an`); ca fallback đọc đúng câu
  (`SAI AC-7: fallback page.tsx khong doc Dang tai OKR`).
- [ ] **Step 2:** `config:executors.test.kcd_cau_truc` và `kcd_a11y` → FAIL (fallback còn là `KhungXuong hinh="bang"`,
  `hang-cong-cu.tsx` còn nhập `Skeleton`).
- [ ] **Step 3:** Sửa `hang-cong-cu.tsx`, `page.tsx` theo Interfaces.
- [ ] **Step 4:** Hai lệnh Step 2 → PASS; `cd apps/app && bun run test:dom` các tệp `okr-trang-don-vi.dom.tsx`,
  `muc-tieu-va-kr.dom.tsx`, `okr-cua-toi-ba-phan.dom.tsx`, `okr-sua-an-chu-ky.dom.tsx` → PASS.
- [ ] **Step 5:** Commit `feat(khung-cho-don-vi-mot-hinh): trang Theo đơn vị dùng một khung chờ ở mọi pha`.

### Task 3: Rang các trang khác vẫn dùng `bang` (independent: true)

**Phục vụ:** E7 (AC-6).

**Files:**
- Create: `_acceptance/khung-cho-don-vi-mot-hinh/rang/trang-khac.mjs`

**Interfaces:**
- Produces: `node …/trang-khac.mjs [--pha-thu]` in `AC-6: <n> trang dung bang · bang-hai-dong chi o theo-don-vi`; mã 0/1/2.

- [ ] **Step 1:** Viết rang: duyệt `apps/app/app/(app)/**/page.tsx`, phân tích bằng `typescript`, gom mọi phần tử JSX
  `KhungXuong` theo giá trị thuộc tính `hinh` (chuỗi). Danh sách chín trang hôm nay viết sẵn trong tệp: api-keys, sso,
  members, tai-lieu, contacts, deals, campaigns, companies, onboarding. `--pha-thu`: chép cây `apps/app/app` sang thư mục
  tạm, đổi `hinh="bang"` của `deals/page.tsx` thành `bang-hai-dong`, chạy lại phép đếm trên bản sao → phải in
  `SAI AC-6: deals dung bang-hai-dong` và thoát 1 trên bản sao, thoát 0 trên cây thật.
- [ ] **Step 2:** `node _acceptance/khung-cho-don-vi-mot-hinh/rang/trang-khac.mjs` → mã 0; `--pha-thu` → «hai chieu dung».
- [ ] **Step 3:** Commit `test(khung-cho-don-vi-mot-hinh): rang các trang khác giữ khung bang`.

### Task 4: Rang màn `man-khung-cho.mjs` và bản sao phá thử (independent: false — cần Task 2)

**Phục vụ:** E1 (AC-1), E2 (AC-2), E3 (AC-3), E4 (AC-4), E9 (AC-1, AC-4).

**Files:**
- Create: `_acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs`
- Create: `_acceptance/khung-cho-don-vi-mot-hinh/rang/hai-chieu.mjs`

**Interfaces:**
- Consumes: khung của Task 2; thư viện `_acceptance/kho-tai-lieu/rang/man-lib.mjs`, `chiaCookie` của
  `man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs`, bộ OKR mẫu như `trang-don-vi-mot-bang/rang/man-don-vi.mjs`.
- Produces: một lượt in dòng `AC-1 <khổ>`, `AC-2 <khổ>`, `AC-3 <khổ>`, `AC-4 <khổ>` đúng khuôn của `evals.yaml`, năm ảnh
  E9; `hai-chieu.mjs <nhom> [--trinh-duyet]` với bảng `DOT_BIEN` phủ MỌI tên `KCD_PHA` khai trong `evals.yaml`
  (`fallback-cu`, `cong-cu-lech`, `khung-la`, `hang-an`, `khe-inert`, `ve-tay`, `fallback-tran`).

- [ ] **Step 1:** Viết `man-khung-cho.mjs` theo khuôn E4 của `man-don-vi.mjs`: bộ lấy mẫu `evaluateOnNewDocument` mỗi
  50 ms ghi chữ ký khung (chiều cao hàng công cụ, khoảng từ đỉnh `[data-slot=page-shell-content]` tới đỉnh đầu bảng,
  chiều cao đầu bảng, số dòng và chiều cao từng dòng) và cờ mẫu lạ; tải cứng 1440 rồi 390 với latency 800 ms; điều hướng
  mềm từ `/okr/toan-canh` bằng bấm thẻ; đổi đơn vị với `okr.danhSach` của trình duyệt bị giữ (khuôn `datChan`),
  `elementFromPoint` + bấm + chờ `[role=listbox]` + Escape; so với bảng dựng xong (dòng `[data-hang-muc-tieu]` → hàng bảng
  `closest("tr")`, đầu bảng `thead tr`, hàng công cụ thật). Bảng mẫu < 2 dòng hay không bắt được mẫu khung ở tải cứng →
  `KHONG DO DUOC` mã 2.
- [ ] **Step 2:** Viết `hai-chieu.mjs` chép khuôn `trang-don-vi-mot-bang/rang/hai-chieu.mjs`; nhóm `kcd-dom` (đột biến
  `fallback-cu`, `ve-tay`, `hang-an`, `fallback-tran` chạy `kcd_cau_truc`/`kcd_a11y`) và nhóm `kcd-man` (`fallback-cu`,
  `cong-cu-lech`, `khung-la`, `hang-an`, `khe-inert` chạy `kcd_man`, chỉ khi `--trinh-duyet`).
- [ ] **Step 3:** `config:executors.script.kcd_man` trên cây thật → mã 0, bốn dòng DUNG, năm ảnh.
- [ ] **Step 4:** `bun _acceptance/khung-cho-don-vi-mot-hinh/rang/hai-chieu.mjs kcd-dom` → hai chiều đúng;
  `… kcd-man --trinh-duyet` → hai chiều đúng (chạy nền, phiên đo riêng mỗi đột biến).
- [ ] **Step 5:** Commit `test(khung-cho-don-vi-mot-hinh): rang màn khung chờ một hình và bản sao phá thử`.

### Task 5: Năm lệnh cổng (independent: false)

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` → mã 0 (`bun run test` để làn S4 chạy).
- [ ] Hợp đồng `status: implemented`, commit.
