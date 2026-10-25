# Tiêu điểm sau hộp xoá tín hiệu — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đóng hộp hỏi xoá tín hiệu bằng «Giữ lại», Esc hay khi xoá hỏng thì tiêu điểm về nút ⋮ của đúng dòng; xoá xong giữ cách TH6.

**Architecture:** `DanhSachTinHieu` nhớ mã dòng đã mở hộp và tự dời tiêu điểm trong `onCloseAutoFocus` của `ConfirmDialog`. Trang (`DanhSachTinHieuTrang`) sau lỗi xoá chỉ dời tiêu điểm khi nó đã rơi về `body`. Hàm tìm bản đang hiện dùng chung ở `apps/app/lib/tin-hieu/tieu-diem.ts`.

**Tech Stack:** Next.js client component, Radix AlertDialog qua `@crm/ui`, TanStack Query, bun test + happy-dom, puppeteer-core cho phép đo màn.

**Spec:** `docs/superpowers/specs/2026-10-24-tieu-diem-sau-hop-xoa-tin-hieu-design.md`; hợp đồng `_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/contract.md`; eval `_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evals.yaml`.

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Không đổi tệp dưới `apps/api`, `packages/ui`, `packages/db`, `packages/validation` (AC-7).
- Không sửa `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx` (E5 đòi diff rỗng).
- Không `className` đè màu, góc, khoảng cách của component `@crm/ui` (E8, `docs/design.md`).
- Chuỗi người đọc lấy từ `tinHieuMessages(locale)` — không viết tay chữ trong bài kiểm.

## Review Focus

- Dòng mở hộp từ trạng thái ban đầu `hoiXoaBanDau` (bản mẫu) — mã dòng phải được nhớ ngay từ đầu, nếu không đóng hộp rơi về body. Bài: ô `ban-dau` trong `tdx-bien` dựng `DanhSachTinHieu` với `hoiXoaBanDau` rồi Escape.
- Dòng bị xoá bởi người khác trong lúc hộp mở (làm mới trả danh sách không còn dòng đó) → không có nút để dời tới: không ném lỗi, tiêu điểm không bị ép. Bài: ô `dong-mat` trong `tdx-bien`.
- Xoá hỏng khi trang đã có `xoaHong` cũ — câu mới thay câu cũ, chỉ một `role=alert`. Đã có ở E2/E3 khẳng định 2 (đúng một).
- Hai lần xoá liên tiếp nhanh — `moTu` phải là dòng mở hộp lần hai. Phủ bởi E3 khẳng định 4 (xoá lại cùng dòng).
- Nút ⋮ của dòng cuối nằm dưới mép màn ở 375 — `focus()` cuộn tới; phép đo E6 chụp ảnh sau khi ổn định.

---

### Task 1: Trả tiêu điểm khi đóng hộp và sau xoá hỏng

`independent: false` · phục vụ E1, E2, E3, E4, E5, E8

**Files:**
- Create: `apps/app/lib/tin-hieu/tieu-diem.ts`
- Modify: `apps/app/components/tin-hieu/danh-sach-tin-hieu.tsx`
- Modify: `apps/app/app/(app)/[slug]/tin-hieu/danh-sach-tin-hieu-trang.tsx`
- Test: `apps/app/test/tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx`

**Interfaces:**
- Produces: `phanTuHien(chon: string): HTMLElement | null` (chuyển nguyên từ trang) và `tieuDiemNutThaoTac(ma: string): boolean` (dời tiêu điểm tới bản đang hiện của `[data-thao-tac-tin-hieu='<ma>']`, trả `true` khi có phần tử) trong `apps/app/lib/tin-hieu/tieu-diem.ts`.

- [ ] **Step 1: Viết bài DOM đỏ** — tệp mới chép khung mock của `sua-giao-dien-tin-hieu.dom.tsx` (mock `@/lib/trpc/client`, `next/navigation`; `ve`, `bam`, `phim`, `cho`, `hang`). Lỗi máy chủ dựng bằng `new TRPCClientError(msg, { result: { error: { message, code, data: { code, httpStatus } } } })` của `@trpc/client` như `apps/app/test/du-an.dom.tsx`; mất mạng là `TypeError("Failed to fetch")`. Bản đang hiện: hàm `datKho(375 | 1280)` thay `HTMLElement.prototype.getClientRects` trả một rect khi phần tử nằm trong `.md\:hidden` (375) hay `.hidden.md\:block` (1280), mảng rỗng còn lại; khôi phục ở `afterEach`. Bốn `describe`: `tdx-giu-lai` (16 ô), `tdx-bien` (`ban-dau`, `dong-mat` — ngoài đếm của E1), `tdx-hong` (4 ô 409 + 8 ô mạng/máy chủ), `tdx-cho` (3 ô × 2 khổ). Mỗi `describe` in `<ten>: <n> khang dinh` với n đúng bằng công thức ở `evals.yaml`. Thông điệp ghim trong `expect(..., "<thông điệp>")` đúng chuỗi CHIỀU ĐỎ của evals.
- [ ] **Step 2: Chạy, thấy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx` → ô `giu-lai` đỏ với «tieu diem roi ve dau trang sau giu lai».
- [ ] **Step 3: Mã** — `danh-sach-tin-hieu.tsx`: `useRef<string | null>` khởi từ dòng `hoiXoaBanDau`; gán `d.ma` khi chọn «Xoá»; `onCloseAutoFocus` = `preventDefault()` rồi `tieuDiemNutThaoTac(moTu.current)`. Trang: nhập `phanTuHien` từ lib; `onError` chờ `cache.tinHieu()` rồi `requestAnimationFrame`: nếu `document.activeElement` là `null` hay `document.body` thì `tieuDiemNutThaoTac(muc.ma)`.
- [ ] **Step 4: Xanh cả mới lẫn cũ** — lệnh Step 2 xanh; `bun run --cwd apps/app test` phần tin hiệu: `-t sgt-tieu-diem` của `sua-giao-dien-tin-hieu.dom.tsx` in «sgt-tieu-diem: 23 khang dinh»; `tin-hieu.dom.tsx`, `tin-hieu-luu-tru.dom.tsx` xanh.
- [ ] **Step 5: Phá thử từng chiều đỏ** trên bản sao tạm (hoàn lại sau): mỗi chiều đỏ của E1–E4 đỏ đúng thông điệp ghim; ghi kết quả vào `_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/pha-thu.md`.
- [ ] **Step 6: Bộ kiểm thiết kế tĩnh** — lệnh `tdx_thiet_ke` của config exit 0.
- [ ] **Step 7: Commit** — `feat(tieu-diem-sau-hop-xoa-tin-hieu): trả tiêu điểm về nút ⋮ của dòng sau hộp xoá`.

### Task 2: Thước ranh giới

`independent: true` · phục vụ E7

**Files:**
- Create: `_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/rang/ranh-gioi.mjs`

- [ ] **Step 1:** Script suy gốc kho từ `import.meta.url`, lấy `git merge-base HEAD origin/onehub`, đọc `git diff --name-only <base>...HEAD` (hoặc danh sách từ cờ `--tep a,b`), lỗi khi có tệp khớp tiền tố `apps/api/`, `packages/ui/`, `packages/db/`, `packages/validation/`: in `vong sua tieu diem cham vung cam: <tệp>` và thoát 1; xanh in `ranh-gioi: <n> tep da xet, 0 cham vung cam`.
- [ ] **Step 2:** `node _acceptance/tieu-diem-sau-hop-xoa-tin-hieu/rang/ranh-gioi.mjs` exit 0; thêm `--tep packages/ui/src/components/confirm-dialog.tsx` → exit 1 đúng thông điệp. Ghi vào `pha-thu.md`.
- [ ] **Step 3: Commit.**

### Task 3: Phép đo bàn phím trên bản chạy thật

`independent: false` (cần Task 1 để xanh) · phục vụ E6

**Files:**
- Create: `_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/rang/do-ban-phim.mjs`

**Interfaces:**
- Consumes: khuôn chạy của `_acceptance/sua-giao-dien-tin-hieu/rang/do-man.mjs` (puppeteer-core + Chrome hệ thống, `phien(email)` qua `bun run dev:session`, `suySlug`, `canhCay`, tạo thành viên qua đường thật như hàm `nguoiThanhVien` ở đó); chạy qua `mot-luot.sh` → `tien-de.mjs` (kho đo riêng).

- [ ] **Step 1:** `MA_TRAN` viết trước 10 ô `{giu-lai, esc, lay-ve, mang, xoa-xong} × {375, 1280}`; `kiem(o, nhan, dat)` như TH6. Mỗi ô: một thành viên mới, gửi ba tín hiệu qua `tinHieu.gui` (tRPC HTTP với cookie phiên), mở `/<slug>/tin-hieu` ở khổ đó tiếng Việt, Tab tới nút ⋮ theo mã (lặp Tab tới khi `activeElement.dataset.thaoTacTinHieu === ma`), Enter, mũi tên tới «Xoá», Enter; rồi theo ô. `lay-ve`: quản trị gọi `tinHieu.keoVe` trước khi xác nhận; sau khi ổn định nhấn Enter trên tiêu điểm và kiểm `[data-xoa-tin-hieu]` `aria-disabled="true"` + dòng `khongXoaDuoc`. `mang`: `page.setRequestInterception(true)` huỷ yêu cầu có `tinHieu.xoa`. Mỗi ô kiểm mã tiêu điểm, `:focus-visible`, `getClientRects().length > 0`, `scrollWidth == clientWidth`, câu `role=alert` khi có; chụp `evidence/<o>.png`; nối một dòng vào `evidence/o.jsonl`.
- [ ] **Step 2:** Dòng cuối `KET LUAN: <dung>/<tong> dung` ; mã 0 khi mọi ô ĐÚNG, 1 khi có SAI, 2 khi không đo được (`KhongDo`).
- [ ] **Step 3:** Chạy `tdx_ban_phim` (việc nặng — qua khoá máy) với `BANG_CHUNG=_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence`; mã 0, mười ảnh, mười dòng jsonl. Phá thử: tạm hoàn lại Task 1 → ô `giu-lai-1280` SAI. Ghi `pha-thu.md`.
- [ ] **Step 4: Commit.**
