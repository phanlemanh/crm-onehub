# Thanh bên khu dùng chung — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một thành phần `AreaSidebar` trong `packages/ui`, Cài đặt và Hội thoại dùng nó, và luật «thanh bên khu hay thẻ con» trong `docs/design.md`.

**Architecture:** `AreaSidebar` dựng `children` hai lần — một lần trong `aside` dọc (từ `md`), một lần trong `NavStrip` ngang (dưới `md`) — mỗi lần trong một React context mang `orientation`; `AreaSidebarGroup`/`AreaSidebarItem` đọc context. `placement="panel"` chỉ dựng bố cục dọc, cho ngăn điện thoại.

**Tech Stack:** React 19, Next.js App Router, Tailwind, `bun test` + jsdom (`packages/ui/test/setup-dom.ts`), puppeteer-core cho bàn đo màn.

**Spec:** `docs/superpowers/specs/2026-10-19-thanh-ben-khu-dung-chung-design.md`; hợp đồng `_acceptance/thanh-ben-khu-dung-chung/contract.md`; evals `_acceptance/thanh-ben-khu-dung-chung/evals.yaml`.

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Không `className` đè màu, góc, khoảng cách lên thành phần `@crm/ui`; `AreaSidebar` không nhận `className`.
- Bề rộng thanh dọc `w-56`; mốc khổ `md`; tên chuyển cảnh `[view-transition-name:area-sidebar]` chỉ ở `placement="area"`.
- Giữ bộ chọn mà hồ sơ đã ký `khung-trang-cai-dat` đọc: `aside nav`, `[data-slot=nav-group]`, `[data-slot=nav-group-label]`, `[data-slot=nav-item]`, `nav` ngoài `aside`, `nav[aria-label=Cài đặt]`.
- Không sửa `apps/app/test/khung-trang-cai-dat-thanh-ben.dom.tsx`.
- Tệp chữ dùng chung chỉ thêm dòng (luật 7 của đợt); vòng này không cần chữ mới.

## Review Focus

- Tiêu đề hội thoại rất dài → cắt một dòng, không đẩy rộng thanh (`min-w-0 truncate` trên span, thêm vào ca E4: span tiêu đề có lớp `truncate`).
- Hàng ngang dài hơn khung ở điện thoại → trang không tràn ngang (E8 với 8 cuộc).
- Vai chỉ OKR → hàng ngang chỉ một mục (bài đã ký giữ).
- Ngăn điện thoại mở cùng hàng ngang → không trùng tên chuyển cảnh (E2).
- Bấm Cmd/Ctrl vào mục → vẫn là `<a href>` (mọi ca kiểm `a[href]`).

---

### Task 1: `AreaSidebar` trong packages/ui

`independent: true` · phục vụ E1, E2

**Files:**
- Create: `packages/ui/src/components/area-sidebar.tsx`
- Test: `packages/ui/test/area-sidebar.dom.tsx`

**Interfaces:**
- Produces:
  - `AreaSidebar(props: { label: string; header?: ReactNode; footer?: ReactNode; busy?: boolean; placement?: "area" | "panel"; children: ReactNode })`
  - `AreaSidebarGroup(props: { label?: ReactNode; children: ReactNode })` — dọc: `NavGroup` (+ `NavGroupLabel id` và `aria-labelledby` khi có `label`); ngang: `<>{children}</>`.
  - `AreaSidebarItem(props: Omit<ComponentProps<typeof NavItem>, "orientation">)` — `NavItem` với `orientation` từ context.
  - `useAreaSidebarOrientation(): "vertical" | "horizontal"`
  - DOM: `aside[data-slot=area-sidebar]` (`hidden w-56 shrink-0 flex-col border-r md:flex [view-transition-name:area-sidebar]` ở area; `flex min-h-0 flex-1 flex-col` ở panel), `[data-slot=area-sidebar-header]`, `nav[aria-label]` (`flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3`), `[data-slot=area-sidebar-footer]` (`border-t p-3`), `[data-slot=area-sidebar-strip]` (`flex flex-col md:hidden [view-transition-name:area-sidebar]`) chứa header (`border-b p-2`) và `NavStrip aria-label aria-busy`.

- [ ] **Step 1: Viết `area-sidebar.dom.tsx`** theo mẫu `packages/ui/test/nav-strip.dom.tsx` (createRoot + act). `describe("area-sidebar")`, hai ca `tbk-khung` và `tbk-panel` với đúng khẳng định của E1, E2 trong `evals.yaml` (mỗi `expect` có thông điệp ghim như chữ trong `expected`).
- [ ] **Step 2: Chạy** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/area-sidebar.dom.tsx` → FAIL (không có module).
- [ ] **Step 3: Viết `area-sidebar.tsx`** theo Interfaces; `"use client"`.
- [ ] **Step 4: Chạy lại** → PASS 2 ca. Phá-thử trong bản sao (MEASURE-BIRTH): nhóm luôn vẽ nhãn → `tbk-khung` đỏ «hang ngang co nhan nhom»; panel mang tên chuyển cảnh → `tbk-panel` đỏ «panel mang ten chuyen canh». Hoàn lại.
- [ ] **Step 5: Commit** `feat(thanh-ben-khu-dung-chung): AreaSidebar trong packages/ui`.

### Task 2: Cài đặt dùng `AreaSidebar`

`independent: false` (cần Task 1) · phục vụ E3, E7

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx` (bỏ `aside`/`NavStrip` tự ghép; `ThanhBen` → `AreaSidebar label={t.thanhBen.nhan} busy={dangTai}`; `Nhom` → `AreaSidebarGroup`; `Muc` → `AreaSidebarItem`; `dangTai = trangThai === null`)
- Test: `apps/app/test/thanh-ben-khu.dom.tsx` (tạo; mock `next/navigation`, `next/link`, `@/lib/trpc/client` như bài đã ký)

- [ ] **Step 1:** Ca `tbk-cai-dat` và nửa Cài đặt của `tbk-dang-tai` (khẳng định của E3, E7).
- [ ] **Step 2:** Chạy `config:executors.test.tbk_cai_dat` → bài mới FAIL, bài đã ký PASS.
- [ ] **Step 3:** Sửa `settings-sidebar.tsx`.
- [ ] **Step 4:** Chạy lại → cả hai tệp PASS. Phá-thử: dựng lại `aside` tự đặt → `tbk-cai-dat` đỏ.
- [ ] **Step 5: Commit.**

### Task 3: Hội thoại dùng `AreaSidebar`

`independent: false` (cần Task 1; cùng tệp test với Task 2) · phục vụ E4, E5, E6, E7

**Files:**
- Modify: `apps/app/components/agent-builder/agent-builder-sidebar.tsx` — prop `placement: "area" | "panel"` bắt buộc, bỏ `className`; `header` = nhãn «Hội thoại» + nút `Link` «Hội thoại mới»; nhóm ngày → `AreaSidebarGroup label={t.thanhBen.nhom[label]}`; cuộc → `AreaSidebarItem asChild active` bọc `Link` (biểu tượng trạng thái + `span.min-w-0.flex-1.truncate translate="no"`), dọc bọc `div.relative` thêm `DeleteChatAction`; câu rỗng chỉ ở dọc; `TeamAgents` → `AreaSidebarGroup` với nhãn là `Link` tới `/agents` kèm số.
- Modify: `apps/app/components/agent-builder/agent-builder-shell.tsx` — khung `flex min-h-0 min-w-0 flex-1 flex-col md:flex-row`; `AgentBuilderSidebarFallback` → `AreaSidebar busy label={danhSachHoiThoai} header={nhãn}` với khung xương + `role=status` trong dọc.
- Modify: `apps/app/app/(app)/[slug]/(agent-builder)/layout.tsx` — `placement="area"`, bỏ `className`.
- Modify: `apps/app/components/app-icon-rail.tsx:307` — `placement="panel"` thay `className="flex flex-1"`.
- Test: `apps/app/test/thanh-ben-khu.dom.tsx` (thêm ca)

- [ ] **Step 1:** Ca `tbk-hoi-thoai-may-tinh`, `tbk-hoi-thoai-bam`, `tbk-hoi-thoai-rong`, `tbk-hoi-thoai-dien-thoai`, `tbk-hoi-thoai-ngan`, nửa Hội thoại của `tbk-dang-tai` — khẳng định của E4–E7. Fixture: `setSystemTime` ghim, mock `useTRPC` trả `conversations.builderList`, `agents.list`, `conversations.markRead.mutationOptions` (đếm lời gọi), `thongBao.chuong.pathKey`; `initialData` truyền thẳng; mock `./delete-chat-action` thành nút `aria-label="xoa <title>"`. Chữ nhãn rút từ `khungMessages("vi")`.
- [ ] **Step 2:** Chạy → FAIL.
- [ ] **Step 3:** Sửa bốn tệp.
- [ ] **Step 4:** Chạy `tbk_hoi_thoai_*`, `tbk_dang_tai` → PASS; `bun run check-types` xanh. Phá-thử: bỏ prop `placement` ở `app-icon-rail.tsx` → check-types đỏ và `tbk-hoi-thoai-ngan` đỏ «ngan mat bo cuc doc»; `DeleteChatAction` không bọc điều kiện → «hang ngang co nut xoa».
- [ ] **Step 5: Commit.**

### Task 4: Bài quét vẽ tay

`independent: true` · phục vụ E10

**Files:**
- Create: `_acceptance/thanh-ben-khu-dung-chung/rang/quet-vo-tay.mjs` (gốc kho suy từ `import.meta.url`)

- [ ] **Step 1:** Viết bộ quét theo `expected` của E10; `TBK_PHA=gieo` gieo tệp tạm rồi xoá trong `finally`.
- [ ] **Step 2:** Chạy trên mã trước Task 2–3 (worktree tạm `git worktree add` ở commit đầu) → SAI ở ba tệp, mã 1; chạy sau → DUNG, mã 0; `TBK_PHA=gieo` → SAI gọi tên tệp gieo.
- [ ] **Step 3: Commit.**

### Task 5: Bàn đo màn

`independent: false` (cần Task 2–3) · phục vụ E8, E9

**Files:**
- Create: `_acceptance/thanh-ben-khu-dung-chung/rang/do-man.mjs` — theo khung của `_acceptance/khung-trang-cai-dat/rang/man-chrome.mjs` (canhCay, puppeteer-core, Chrome hệ thống, đăng nhập qua `dev:session`); gieo 8 hội thoại qua service của `apps/api` hay `packages/db` (không chèn thẳng bảng); đo và chụp theo `expected` của E8; `TBK_PHA=rong|tran`.

- [ ] **Step 1:** Viết bàn đo.
- [ ] **Step 2:** Chạy `config:executors.script.tbk_man` → mã 0, bốn ảnh trong `evidence/`. Phá-thử `TBK_PHA=rong` và `TBK_PHA=tran` → SAI đúng dòng ghim.
- [ ] **Step 3: Commit** (ảnh vào `_acceptance/thanh-ben-khu-dung-chung/evidence/`).

### Task 6: Luật trong docs

`independent: true` · phục vụ E11

**Files:**
- Modify: `docs/design.md` — mục «Thanh bên khu và thẻ con» dưới «Nếp màn trong app» (trước «Thẻ con của trang»), dòng mới trong bảng «Dấu hiệu vẽ tay».
- Modify: `docs/settings.md` mục «Thanh bên» — dòng đầu trỏ `AreaSidebar`.

- [ ] **Step 1:** Viết theo năm ý của câu hỏi E11.
- [ ] **Step 2: Commit.**

### Kết

- [ ] `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` từ gốc kho.
