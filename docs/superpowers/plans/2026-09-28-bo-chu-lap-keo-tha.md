# Bỏ chữ lặp trong vùng kéo-thả — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Câu gợi ý của vùng kéo-thả trong hộp «Tải nguồn lên» thôi lặp chữ của nút «Chọn tệp» bên cạnh.

**Architecture:** Đổi một khoá chữ (`nguon.hop.keoTha`, `vi` + `en`) trong `apps/app/lib/messages/tai-lieu.ts`. Phép đo mới nằm trong tệp riêng của vòng; không tệp đo nào của hồ sơ đã ký bị sửa.

**Tech Stack:** bun test + happy-dom (`packages/ui/test/setup-dom.ts`), puppeteer qua `_acceptance/kho-tai-lieu/rang/man-lib.mjs`, phiên đo `scripts/lan-do/tien-de.mjs`.

**Spec:** `docs/superpowers/specs/2026-09-28-bo-chu-lap-keo-tha-design.md` · hợp đồng `_acceptance/bo-chu-lap-keo-tha/contract.md` · evals `_acceptance/bo-chu-lap-keo-tha/evals.yaml`

## Global Constraints

- Không chú thích trong mã (`AGENTS.md`).
- Không sửa `_acceptance/nguon-keo-tha-reui/**`, `_acceptance/may-soan-de-xuat/**`, và bốn tệp test `packages/ui/test/nguon-keo-tha.dom.tsx`, `packages/ui/test/nguon-canh-nhau.dom.tsx`, `apps/app/test/nguon-keo-tha-chu.dom.tsx`, `apps/app/test/tai-lieu-nguon.dom.tsx`.
- Câu mới đúng nguyên văn: `vi` «Kéo tệp vào đây», `en` «Drag a file here».
- Test DOM của `apps/app` chạy với `TZ=Asia/Ho_Chi_Minh`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture, thông điệp ghim.

## Review Focus

- Tệp chữ đổi nhưng hộp truyền nhầm khoá vào `nhan` → vùng hiện sai câu; E1/E2 đo bằng trọn cả ba chuỗi của vùng, không chỉ câu gợi ý.
- Nhãn nút đổi về sau (ví dụ «Tải tệp lên») → phép quan hệ «không lặp động từ» thành vô nghĩa; E3 ghim động từ rút ra phải là «chọn» / «choose».
- Màn thật ở 390 xuống dòng khác đi → tràn ngang; E6u đo cuộn ngang và hộp tràn ở 390.
- Phiên đo không có khoá Blob → nút «Tải nguồn lên» khoá → thước màn thật không được in «đạt»; E6u thoát mã 2 với câu gọi tên.
- Thay đổi chưa commit chạm tệp đo đã ký → E5b đo cây làm việc, không chỉ lịch sử đã commit.

---

### Task 1: Phép đo chữ ở lớp DOM rồi đổi câu (E1, E2, E3, E4)

`independent: false`

**Files:**
- Create: `apps/app/test/keo-tha-khong-lap-chu.dom.tsx`
- Modify: `apps/app/lib/messages/tai-lieu.ts:178` (`en`) và `:413` (`vi`)

**Interfaces:**
- Consumes: `NutTaiNguon` (`@/app/(app)/[slug]/tai-lieu/hop-tai-nguon`), `taiLieuMessages(locale).nguon.hop.{keoTha,keoThaNut}`.
- Produces: ba ca test tên mở đầu `chu-vi:`, `chu-en:`, `khong-lap:` (lệnh `config:executors.test.bclkt_*` lọc bằng `-t`).

- [ ] **Step 1: Viết test (khuôn mock giống `nguon-keo-tha-chu.dom.tsx`)** — nội dung đầy đủ ở tệp; ba ca:
  - `chu-vi`: mở hộp dưới `LocaleProvider "vi"`, `textContent` của `[data-hop-tai-nguon] [data-slot='nguon-keo-tha']` bằng trọn `"Chọn tệp" + "Kéo tệp vào đây" + "Word (.docx) hoặc PDF, tới 20 MB"`, và phần tử đầu của cột chữ sau nút bằng `taiLieuMessages("vi").nguon.hop.keoTha`; lệch → ném `chu vung keo tha vi lech: …`.
  - `chu-en`: tương tự với `"Choose file" + "Drag a file here" + "Word (.docx) or PDF, up to 20 MB"`; lệch → `chu vung keo tha en lech: …`.
  - `khong-lap`: với `["vi","en"]`, động từ = từ đầu của `keoThaNut` viết thường, phải bằng `{vi:"chọn",en:"choose"}` (lệch → `nhan nut doi: …`), và `keoTha` viết thường không chứa nó (có → `cau goi y <l> lap dong tu cua nut: <dongTu>`).
- [ ] **Step 2: Chạy — phải ĐỎ trên câu cũ**
  Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/keo-tha-khong-lap-chu.dom.tsx`
  Expected: 3 fail, thông điệp `chu vung keo tha vi lech`, `chu vung keo tha en lech`, `cau goi y vi lap dong tu cua nut: chọn`.
- [ ] **Step 3: Đổi hai dòng trong `tai-lieu.ts`** — `keoTha: "Drag a file here",` và `keoTha: "Kéo tệp vào đây",`.
- [ ] **Step 4: Chạy lại — XANH**: cùng lệnh, 3 pass; `cd apps/app && bun test test/messages-guard.spec.ts` pass.
- [ ] **Step 5: Phá-thử chiều đỏ thứ hai** (Step 2 đã là chiều đỏ của câu cũ trên cùng fixture): sau khi commit Step 6, tạm đặt `nhan={m.keoThaMoTa}` trong `hop-tai-nguon.tsx`, chạy `-t chu-vi` → đỏ `chu vung keo tha vi lech`; hoàn lại bằng `git checkout -- "apps/app/app/(app)/[slug]/tai-lieu/hop-tai-nguon.tsx"` (tệp này không có thay đổi nào khác của vòng).
- [ ] **Step 6: Commit** `fix(tai-lieu): bỏ vế «hoặc chọn tệp» khỏi câu gợi ý kéo-thả`.

### Task 2: Thước «không chạm thước đã ký» (E5b)

`independent: true`

**Files:**
- Create: `_acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs`

**Interfaces:**
- Produces: CLI `node …/khong-cham-thuoc.mjs [--tu <ref> --den <ref>]`; mã 0 «khong cham thuoc da ky: N tep doi, 0 tep bi cam», mã 1 «cham thuoc da ky: <tệp,…>», mã 2 «KHONG DO DUOC: …».

- [ ] **Step 1: Viết script** (GOC suy từ vị trí script; không ref → mã 2).
- [ ] **Step 2: Xanh**: `node _acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs` → mã 0.
- [ ] **Step 3: Đỏ lịch sử thật**: `--tu 0bb16a44 --den cfac5bea` → mã 1, in `cham thuoc da ky:` kèm `_acceptance/nguon-keo-tha-reui/…` và `packages/ui/test/nguon-keo-tha.dom.tsx`.
- [ ] **Step 4: Đỏ cây làm việc** (sau khi đã commit mọi thứ): `echo >> packages/ui/test/nguon-keo-tha.dom.tsx`, chạy → mã 1; `git checkout -- packages/ui/test/nguon-keo-tha.dom.tsx`.
- [ ] **Step 5: Đối chứng**: `--tu HEAD --den HEAD` → mã 0; `--tu khong-co-ref --den HEAD` → mã 2.
- [ ] **Step 6: Commit** `test(acceptance): bo-chu-lap-keo-tha — thước không chạm thước đã ký`.

### Task 3: Thước chữ trên màn thật (E6u)

`independent: true`

**Files:**
- Create: `_acceptance/bo-chu-lap-keo-tha/rang/man-chu.mjs`

**Interfaces:**
- Consumes: `moDo`, `chieuDo` từ `_acceptance/kho-tai-lieu/rang/man-lib.mjs` (`d.nguoiMoi`, `d.batTrinhDuyet`, `d.moTrang`, `d.bamSel`, `d.doi`, `d.chup`, `d.cuonNgang`, `d.chayBuoc`, `d.dat`, `d.ket`, `d.khongDoDuoc`).
- Produces: `buoc 1: dat` (1440), `buoc 2: dat` (390), ảnh `bclkt-tai-1440.png`, `bclkt-tai-390.png` ở `.acceptance-runs/bo-chu-lap-keo-tha/evidence/`.

- [ ] **Step 1: Viết script**; nút «Tải nguồn lên» còn khoá sau khi chờ → ném lỗi ra `khongDoDuoc` (mã 2).
- [ ] **Step 2: Commit** (chiều đỏ của `man-lib` dựng bản sao từ HEAD, nên thước phải có trong HEAD).
- [ ] **Step 3: Xanh**: `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_bclktgia_khonglakhoathat bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/bo-chu-lap-keo-tha/rang/man-chu.mjs"` → mã 0, `buoc 1: dat`, `buoc 2: dat`; xem hai ảnh.
- [ ] **Step 4: Đỏ**: `BLOB_READ_WRITE_TOKEN=… bun _acceptance/bo-chu-lap-keo-tha/rang/man-chu.mjs --chieu-do` → `chieu do: DO DUNG GHIM: ma 1, in «chu vung keo tha man that lech»`, mã 0.
- [ ] **Step 5: Đối chứng khoá**: `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/bo-chu-lap-keo-tha/rang/man-chu.mjs"` KHÔNG kèm khoá (và `.env` không có khoá Blob) → mã 2 `KHONG DO DUOC: … nut tai nguon khoa`.

### Task 4: Thước đã ký + năm lệnh chứng (E5a, E5c)

`independent: false`

- [ ] **Step 1**: chạy `config:executors.test.bclkt_thuoc_da_ky` (bốn tệp test đã ký) → pass.
- [ ] **Step 2**: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` → mã 0 cả năm.
- [ ] **Step 3**: set contract `status: implemented`, vẽ lại `PRODUCT-MAP.md`, commit.

E5c (thước màn thật đã ký) chạy ở S4, không chạy tay ở đây để khỏi giữ khoá làn đo hai lần.
