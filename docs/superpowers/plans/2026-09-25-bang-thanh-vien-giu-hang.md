# Bảng thành viên giữ hàng — kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (feature-loop S3 chạy tuần tự trong main loop). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang Cài đặt › Thành viên giữ đủ hàng của bảng thành viên và cuộn như một trang khi «Được phép vào» dài.

**Architecture:** Thêm prop `layout: "fill" | "content"` cho `DataTable` trong `packages/ui` (mặc định `"fill"`, bảy trang cũ không đổi). Trang Thành viên bỏ ba chỗ `min-h-0` và truyền `layout="content"`.

**Tech Stack:** Next.js App Router, React, Tailwind v4, `@crm/ui`; bàn đo puppeteer-core + Prisma.

**Spec:** `docs/superpowers/specs/2026-09-25-bang-thanh-vien-giu-hang-design.md` · hợp đồng `_acceptance/bang-thanh-vien-giu-hang/contract.md`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- `/packages/ui` là nguồn duy nhất của giao diện; không đè `className` của component `@crm/ui` ở chỗ gọi (docs/design.md).
- Mặc định của `DataTable` phải giữ nguyên cách lấp đầy: bảy chỗ gọi khác không đổi một dòng.
- Hằng tinh chỉnh được gom vào một bảng hằng ở đầu tệp, như `BE_RONG` của `apps/app/components/page-shell.tsx`.
- Kiểm chứng: `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`, `bun run test`, và bàn đo `config:executors.script.ttv_do_bang` (31 DUNG, mã 0).

## Review Focus

1. Tìm không ra ai trong bảng cao-theo-nội-dung — câu rỗng phải còn chỗ hiện (E5 của bàn đo).
2. Đang tải lần đầu (chưa có hàng) — cùng lớp phủ, cùng chiều cao tối thiểu; kiểm bằng mắt khi tải trang.
3. Bảy trang lấp đầy — Khoá API đo bằng E6; sáu trang còn lại đổi nếu mặc định bị đụng, nên `git diff` của Task 1 không được chạm nhánh `"fill"`.
4. Khổ 375 — bảng thành viên ẩn cột theo `hideBelow`, không được sinh tràn ngang mới (tràn 98px hiện có đến từ bảng «Được phép vào», ngoài phạm vi).
5. Phân trang của bảng thành viên vẫn nằm ngay dưới vỏ bảng, trước «Được phép vào».

---

### Task 1: Biến thể `layout` của `DataTable`

`independent: false` (Task 2 dùng prop này). Phục vụ E1, E5, E6.

**Files:**
- Modify: `packages/ui/src/components/data-table.tsx` (props, gốc `div` dòng ~431, `containerClassName` dòng ~630)

**Interfaces:**
- Produces: prop `layout?: "fill" | "content"` trên `DataTable`, mặc định `"fill"`.

- [ ] **Step 1: Thêm bảng hằng cách xếp**

```tsx
const LAYOUT_CLASS = {
	fill: {
		root: "flex min-h-0 flex-1 flex-col gap-3",
		container: "min-h-0 flex-1 overflow-auto rounded-lg border bg-card",
		emptyContainer: "",
	},
	content: {
		root: "flex flex-col gap-3",
		container: "overflow-x-auto rounded-lg border bg-card",
		emptyContainer: "min-h-40",
	},
} as const;
```

- [ ] **Step 2: Thêm prop và dùng bảng hằng**

Gốc: `className={cn(LAYOUT_CLASS[layout].root, className)}`. Vỏ: `containerClassName={cn(LAYOUT_CLASS[layout].container, deferredRows.length === 0 && LAYOUT_CLASS[layout].emptyContainer)}`.

- [ ] **Step 3: Kiểm**

Run: `bun run check-types && bun run lint:slop`
Expected: exit 0. `git diff packages/ui` chỉ thêm prop và bảng hằng; chuỗi lớp của `fill` giống hệt chuỗi cũ.

### Task 2: Trang Thành viên cuộn và dùng `layout="content"`

`independent: false`. Phục vụ E1–E8.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/members/page.tsx` (bỏ `className="min-h-0"` ở `PageShell`, `PageShellContent`, và `min-h-0` ở `div` bọc hai khối)
- Modify: `apps/app/app/(app)/[slug]/settings/members/members-table.tsx` (`<DataTable layout="content" …>`)
- Modify: `apps/app/app/(app)/[slug]/settings/members/allowances-table.tsx` (`<section>` thành `relative` — thêm ở S3, xem sổ quyết định)

- [ ] **Step 1: Bàn đo đỏ trước** — đã chạy 25/09 trên mã chưa sửa: 13 DUNG, 14 SAI, mã 1.
- [ ] **Step 2: Sửa hai tệp** như trên.
- [ ] **Step 3: Chạy bàn đo**

Run: `APP_URL=http://localhost:3500 API_URL=http://localhost:3501 NGUOI=ada@trycomp.ai bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/bang-thanh-vien-giu-hang/rang/do-bang.mjs"`
Expected: `KET LUAN: 31 DUNG, 0 SAI — ma thoat 0`.

- [ ] **Step 4: Commit**, rồi các lượt phá-thử trên cây đã commit (khôi phục bằng `git checkout -- <tệp>`): bỏ `layout="content"` → SAI «hàng bị cắt»; `PageShell contained` → SAI «trang cuộn được»; bỏ `emptyContainer` → SAI «trong khung false»; bỏ `relative` ở `<section>` → SAI «chỉ một vùng cuộn»; đổi mặc định sang `"content"` → SAI «Khoá API … lấp đầy».
- [ ] **Step 5: Năm lệnh chứng của kho** — `bun run test`, `check-types`, `lint`, `lint:slop`, `build`.
