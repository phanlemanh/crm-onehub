# Ngăn bản ghi giữ danh tính — kế hoạch làm

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `RecordSheetHost` không bị gỡ rồi dựng lại khi ngăn chuyển giữa rỗng và có bản ghi, mà nạp sẵn vẫn đúng #469.

**Architecture:** `NapSanKhiMoNgan` luôn trả `<HydrationBoundary>`; `state` là bản máy chủ khi `stack.length > 0`, `undefined`
khi rỗng. Một tệp DOM đo danh tính và bộ đệm; một răng chiều đỏ chạy tệp đó trên bản sao bị đột biến; một răng đo màn
trên phiên đo thật.

**Tech Stack:** React 19, `@tanstack/react-query` 5.101.4, nuqs (`NuqsTestingAdapter hasMemory`), bun test + happy-dom,
puppeteer-core qua `_acceptance/kho-tai-lieu/rang/man-lib.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-19-ngan-ban-ghi-giu-danh-tinh-design.md` · hợp đồng
`_acceptance/ngan-ban-ghi-giu-danh-tinh/contract.md` · `evals.yaml` cùng thư mục.

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Không đổi `layout.tsx`, `record-sheet-host.tsx`, `lib/ngan-ban-ghi-nap-san.ts`.
- Tên test bắt đầu đúng tiền tố lệnh khai: `gdt-danh-tinh`, `gdt-tai-xong`, `gdt-nap-vai`, `gdt-khong-de`.
- Thông điệp ghim nguyên văn như `evals.yaml` (không dấu, ASCII).
- Răng suy gốc kho từ vị trí tệp (`join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..")`).

## Review Focus

- Mở thẳng đường dẫn có `record=` lúc trang tải: bản máy chủ và bản khách phải cùng hình cây — E15 (`vs_hydrat_record`).
- Đóng rồi mở lại sau khi `gcTime` đã gỡ khoá: nhận lại bản máy chủ — đối chứng dương của E4.
- Chồng hai bản ghi rồi `close()` về rỗng — bước 3–4 của E1.
- Khổ 390 dùng `Drawer` (vaul), không phải Radix `Sheet` — mỗi ô của E6–E8 chạy cả hai khổ.
- Máy bận làm hiệu ứng chạy trễ — đo bằng `getAnimations()`/`animationend`, không bằng hẹn giờ cố định.

---

### Task 1: Bài DOM danh tính + bản sửa (E1–E4)

**Files:**
- Create: `apps/app/test/ngan-ban-ghi-giu-danh-tinh.dom.tsx`
- Modify: `apps/app/components/crm/record-sheet/nap-san-khi-mo-ngan.tsx`

**Interfaces:**
- Produces: bốn `test(...)` tên mở đầu `gdt-danh-tinh`, `gdt-tai-xong`, `gdt-nap-vai`, `gdt-khong-de`; thông điệp lỗi
  ghim `gdt: chu ngan dung lai khi doi ngan`, `gdt: ngan dong mot nhip roi moi mo`, `gdt: ngan rong da nap san`,
  `gdt: du lieu moi bi ban may chu de`, `gdt: khoa cu khong nhan ban may chu moi hon`.

- [ ] **Step 1: Viết bài** theo `expected` của E1–E4: đầu dò `DauDo` đếm dựng/gỡ bằng `useMountEffect`, gọi
  `useSauKhiTaiXong()` và ghi giá trị; điều khiển ngăn qua một `ref` giữ `useRecordStack()` của một thành phần ngoài
  `NapSanKhiMoNgan` (cùng adapter) và `act(() => ham(...))`; trạng thái máy chủ dehydrate bằng `chiKhoaNapSan` thật.
  Mỗi bài ném `Error` với thông điệp ghim thay vì chỉ `expect` khi điều kiện chính sai.
- [ ] **Step 2: Chạy, thấy đỏ trên mã cũ**
  Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ban-ghi-giu-danh-tinh.dom.tsx`
  Expected: `gdt-danh-tinh` và `gdt-tai-xong` FAIL với thông điệp ghim; `gdt-nap-vai`, `gdt-khong-de` có thể xanh.
- [ ] **Step 3: Sửa** `NapSanKhiMoNgan`: luôn `<HydrationBoundary state={stack.length > 0 ? state : undefined}>`.
- [ ] **Step 4: Chạy lại bài mới và bài #469** (`./test/ngan-ban-ghi-nap-san.dom.tsx`) — Expected: PASS hết.
- [ ] **Step 5: Commit** `feat(ngan-ban-ghi-giu-danh-tinh): ngăn bản ghi giữ danh tính khi mở, đóng (AC-1, AC-2, AC-6, AC-7)`.

### Task 2: Răng chiều đỏ DOM (E5)

**Files:**
- Create: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/chieu-do.mjs`

**Interfaces:**
- Consumes: tệp DOM của Task 1 và các thông điệp ghim.
- Produces: `node …/chieu-do.mjs` in `gdt chieu do: dat 5/5`, mã 0; lệch → mã 1; đột biến không áp được → mã 2.

- [ ] **Step 1: Viết răng** theo khuôn `ve-sinh-do-san-onehub/rang/chieu-do.mjs` (tự kiểm cây, `git worktree add --detach`
  từ HEAD, nối `node_modules` bằng symlink, so băm cây trước/sau). Năm ca: (1) `git show <merge-base>:<tệp>`;
  (2) `stack.length > 0 ? state : undefined` → `state`; (3) thêm `useMemo` gọi `hydrate(client, state)` khi stack khác
  rỗng; (4) lọc `state.queries` chỉ giữ khoá chưa có trong `useQueryClient().getQueryCache()`; (5) không đột biến.
- [ ] **Step 2: Chạy** `node _acceptance/ngan-ban-ghi-giu-danh-tinh/rang/chieu-do.mjs` — Expected: `dat 5/5`, mã 0.
- [ ] **Step 3: Commit** `test(ngan-ban-ghi-giu-danh-tinh): chiều đỏ của bài DOM trên bản sao (E5)`.

### Task 3: Răng đo màn (E6–E12)

**Files:**
- Create: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs`

**Interfaces:**
- Consumes: `moDo`, `chieuDo`, `RONG`, `HEP`, `MA` của `_acceptance/kho-tai-lieu/rang/man-lib.mjs`.
- Produces: in `o <kho> <phep>: dat|<ly do>` (6 dòng) ra stdout và `evidence/gdt-man.log`; dòng cuối
  `ngan-ban-ghi-giu-danh-tinh man: dat`; ảnh `gdt-dong-1440.png`, `gdt-dong-390.png`, `gdt-mo-1440.png`,
  `gdt-mo-390.png`, `gdt-mo-lai-1440.png`; `--chieu-do` gọi `chieuDo` với bản sao mang tệp cũ + trễ 400 ms.

- [ ] **Step 1: Viết răng** theo khuôn `luu-tru-truong-khong-hoi/rang/man.mjs` và `expected` của E6–E12: trang
  `/deals` của Thoả thuận seed `seed-deal-wise-1`; observer cài bằng `evaluate` trước mỗi lần bấm; lượt chụp riêng với
  `Animation.setPlaybackRate` 0.1 qua `page.createCDPSession()`.
- [ ] **Step 2: Chạy** `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs"` —
  Expected: 6 ô `dat`, mã 0; nhìn năm ảnh.
- [ ] **Step 3: Commit, rồi chạy** `bun _acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs --chieu-do` — Expected:
  `chieu do: DO DUNG GHIM`, mã 0.
- [ ] **Step 4: Commit** `test(ngan-ban-ghi-giu-danh-tinh): đo màn trượt vào, trượt ra, mở lại giữa chừng (AC-3, AC-4, AC-5)`.
