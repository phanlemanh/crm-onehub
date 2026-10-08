# Menu con của bộ lọc mở được trên điện thoại — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `DropdownMenuSubContent` tự dịch vào trong màn đúng bằng phần tràn, để menu con chạm chọn được ở khổ 375.

**Architecture:** Một chỗ trong `packages/ui/src/components/dropdown-menu.tsx`: mặc định `collisionPadding={8}` và hai lớp `translate` theo `data-side` dùng `--radix-popper-available-width`. Không đổi nơi gọi.

**Tech Stack:** React 19, Radix (`radix-ui`, popper 1.3.7), Tailwind v4, `tw-animate-css` 1.4.0, bun test + jsdom, puppeteer-core.

**Spec:** `docs/superpowers/specs/2026-10-08-menu-con-loc-dien-thoai-design.md` · hợp đồng `_acceptance/menu-con-loc-dien-thoai/contract.md` · evals `_acceptance/menu-con-loc-dien-thoai/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã. Không đổi chữ ký prop của `DropdownMenuSubContent`.
- Dịch dùng thuộc tính `translate` (Tailwind v4 `translate-x-*`), không đụng `transform` của hoạt ảnh.
- Không sửa tệp ngoài ranh giới: `dropdown-menu.tsx`, `data-table.tsx`, `packages/ui/test/menu-con-*.dom.tsx`, `_acceptance/menu-con-loc-dien-thoai/**`.

## Review Focus

1. Menu cha đủ chỗ bên phải → không dịch (AC-3) — đo ở E1 ô `doi-chung-1440`.
2. Nơi gọi truyền `className` → vẫn còn hai lớp dịch (`cn` ghép, không thay) — Task 1.
3. Chạm bằng ngón tay mở được menu con trên điện thoại — Task 3 dùng `touchscreen.tap`.

---

### Task 1: Lớp dịch của `DropdownMenuSubContent` (independent: false) — phục vụ E5, E6

**Files:** Modify `packages/ui/src/components/dropdown-menu.tsx` · Create `packages/ui/test/menu-con-dich-vao.dom.tsx`

- [ ] Bài đỏ `lop-dich` (3 dòng của E5), chạy `config:executors.test.mcl_lop` → đỏ.
- [ ] Cài: `collisionPadding = 8` trong tham số, truyền xuống Radix; thêm vào chuỗi lớp:
  `data-[side=right]:translate-x-[min(0px,calc(var(--radix-popper-available-width)-100%))]`
  `data-[side=left]:translate-x-[max(0px,calc(100%-var(--radix-popper-available-width)))]`
- [ ] Chạy lại → xanh; phá-thử bỏ lớp phía phải → đỏ «thiếu lớp dịch phía phải»; chạy `mcl_hoi_quy` → xanh.
- [ ] Commit `fix(ui): menu con tự dịch vào trong màn khi thiếu chỗ`.

### Task 2: Răng «không chạm nơi gọi» (independent: false) — phục vụ E7

**Files:** Create `_acceptance/menu-con-loc-dien-thoai/rang/khong-cham-noi-goi.mjs`

- [ ] Đọc `git diff -U0 <merge-base origin/onehub>` của tệp dưới `apps/`, đếm dòng thêm chạm `DropdownMenuSubContent`; `--tu-thu` chạy trên một diff giả thêm `className` ở `bulk-actions.tsx` → đỏ gọi tên tệp.
- [ ] Chạy `mcl_san_thiet_ke` → xanh; `--tu-thu` → đỏ đúng tên. Commit.

### Task 3: Đo màn thật (independent: false) — phục vụ E1–E4

**Files:** Create `_acceptance/menu-con-loc-dien-thoai/rang/do-man.mjs` (khuôn `datatable-loc-ro/rang/do-man.mjs`)

- [ ] Ô 375 trong viewport `hasTouch`/`isMobile`, mở bằng `touchscreen.tap`; 1440 đối chứng; 768 thao tác hàng loạt, thêm ô trên bản merge-base (`--doi-chung-goc`, worktree tạm).
- [ ] Chạy `mcl_do_man` → 6/6; phá-thử bỏ lớp dịch → `giai-doan-375` SAI. Commit.

### Task 4: Năm lệnh của kho

- [ ] `check-types`, `lint`, `lint:slop` xanh; contract `status: implemented`, commit.
