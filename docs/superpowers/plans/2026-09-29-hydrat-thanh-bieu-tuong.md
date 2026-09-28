# Thanh biểu tượng hydrat khớp máy chủ — kế hoạch

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lượt render đầu của `AppIconRail` chỉ phụ thuộc prop máy chủ đưa xuống, nên máy chủ và trình duyệt luôn vẽ giống nhau.

**Architecture:** `RailTheoVai` (server, layout `[slug]`) truyền `workspace={ viewerRole } | null` cho `AppIconRail`. Thanh đọc truy vấn `workspace.get` chỉ khi `useHydrated()` là `true`; trước đó chỉ đọc prop. Nguồn rỗng → `AppIconRailFallback` như cũ.

**Tech Stack:** Next.js App Router, React 19, TanStack Query 5.101, bun test + jsdom, puppeteer-core.

**Spec:** `docs/superpowers/specs/2026-09-29-hydrat-thanh-bieu-tuong-design.md` · contract `_acceptance/hydrat-thanh-bieu-tuong/contract.md`

## Global Constraints

- Không viết chú thích trong code (`AGENTS.md`).
- Không `useEffect` trực tiếp (skill `no-use-effect`); dùng `useHydrated` có sẵn ở `apps/app/lib/use-hydrated.ts`.
- Client component tự khai kiểu prop; không import `@crm/auth`/`@crm/db` vào tệp `"use client"`.
- Không đổi lớp, thành phần hay chữ của hai bản vẽ thanh.

## Review Focus

- Máy chủ không tải được workspace (prop `null`) mà cache trình duyệt đã có dữ liệu → hydrat vẫn khớp (ca e5).
- Vai `okr` từ máy chủ → HTML máy chủ đã rút gọn đúng 4 mục, không nhảy từ 10 xuống 4 (ca e3, bước HTML của E6u).
- Truy vấn làm mới sau hydrat mang vai khác → thanh theo (ca e4).
- Lệch một thuộc tính mà cấu trúc giữ nguyên → vẫn bị bắt (ca e0 kênh `console.error`).
- Sheet di động (`Sheet`) dùng cùng `items` → đổi nguồn vai không làm hỏng nó (dùng chung `items`, không nhánh riêng).

---

### Task 1: Thanh đọc vai từ prop ở lượt hydrat

`independent: false` · phục vụ E1–E5, E6u, E7

**Files:**
- Modify: `apps/app/components/app-icon-rail.tsx` (hàm `AppIconRail`)
- Modify: `apps/app/app/(app)/[slug]/layout.tsx` (hàm `RailTheoVai`)
- Test: `apps/app/test/thanh-bieu-tuong-hydrat.dom.tsx` (đã có, đỏ)

**Interfaces:**
- Produces: `export type RailWorkspace = { viewerRole: string | null }` và `AppIconRail({ workspace }: { workspace: RailWorkspace | null })`.

- [ ] **Step 1: Xác nhận test đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-bieu-tuong-hydrat.dom.tsx`
Expected: 2 pass (e0), 5 fail (e1–e5), e1/e2 mang «Hydration failed».

- [ ] **Step 2: Sửa `AppIconRail`**

```tsx
import { useHydrated } from "@/lib/use-hydrated";

export type RailWorkspace = { viewerRole: string | null };

export function AppIconRail({
	workspace,
}: {
	workspace: RailWorkspace | null;
}) {
	const pathname = usePathname();
	const workspaceUrl = useWorkspaceUrl();
	const { open, setOpen } = useMobileNav();
	const prefetchSection = usePrefetchSection();
	const m = khungUngDungMessages(useLocale());
	const trpc = useTRPC();
	const hydrated = useHydrated();
	const workspaceQuery = useQuery(trpc.workspace.get.queryOptions());
	const nguon = (hydrated ? workspaceQuery.data : undefined) ?? workspace;
	const viewerRole = nguon?.viewerRole ?? null;

	const items = useMemo(/* như cũ, phụ thuộc [workspaceUrl, m, viewerRole] */);
	if (!nguon) return <AppIconRailFallback />;
	/* phần còn lại giữ nguyên */
}
```

- [ ] **Step 3: Sửa `RailTheoVai`**

```tsx
async function RailTheoVai() {
	await connection();
	const workspace = await loadWorkspace();

	return (
		<HydrateClient>
			<AppIconRail
				workspace={workspace ? { viewerRole: workspace.viewerRole } : null}
			/>
		</HydrateClient>
	);
}
```

- [ ] **Step 4: Chạy test**

Run: lệnh Step 1. Expected: 7 pass, 0 fail.

- [ ] **Step 5: Kiểu, lint**

Run: `bun run check-types && bun run lint && bun run lint:slop`. Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add apps/app/components/app-icon-rail.tsx "apps/app/app/(app)/[slug]/layout.tsx"
git commit -m "fix(app): thanh biểu tượng hydrat theo vai máy chủ, không theo cache"
```

### Task 2: Chiều đỏ của từng eval

`independent: false` · phục vụ E1–E7 (luật MEASURE-BIRTH: cặp hai chiều cùng fixture, thông điệp ghim)

**Files:** không sửa tệp nào được commit; mỗi phá-thử làm trên cây ĐÃ commit rồi `git checkout -- <tệp>`.

- [ ] **Step 1: E1–E3, E5 — bản trước vòng.** `git show origin/onehub:apps/app/components/app-icon-rail.tsx > apps/app/components/app-icon-rail.tsx` → chạy `htbt_e1/e2/e3/e5` → mỗi lệnh exit ≠ 0 với thông điệp đã khai; `git checkout -- apps/app/components/app-icon-rail.tsx`.
- [ ] **Step 2: E5 — bỏ cổng `useHydrated`.** Đổi `(hydrated ? workspaceQuery.data : undefined)` thành `workspaceQuery.data` → `htbt_e5` fail «Hydration failed»; khôi phục.
- [ ] **Step 3: E4 — bỏ `useQuery`.** Đổi nguồn thành `workspace` → `htbt_e4` fail «expected 4 received 10»; khôi phục.
- [ ] **Step 4: E3 — bỏ vai.** Đổi `mucRailChoVai(viewerRole)` thành `mucRailChoVai(null)` → `htbt_e3` fail «10 thay 4»; khôi phục.
- [ ] **Step 5: E7 — prop thiếu.** `layout.tsx` gọi `<AppIconRail />` → `check-types` fail TS2741; khôi phục.
- [ ] **Step 6: E6u — ba chiều đỏ trên ứng dụng thật** (phiên đo, mỗi lượt ~8 phút, `LUOT=2` đủ cho chiều đỏ): (1) layout truyền `null` → «thanh may chu van ban cho»; (2) layout truyền `{ viewerRole: "admin" }` → «10 lien ket thay 4»; (3) nav bản đủ thêm `aria-busy={typeof window === "undefined" ? "true" : undefined}` → «loi hydrat cua thanh: k/n luot», k > 0. Khôi phục sau mỗi lượt; cuối cùng `git status` sạch ngoài `_acceptance/`.
- [ ] **Step 7: Chiều xanh E6u** trên cây đã sửa, `LUOT` mặc định 8 → «0 hong», «loi hydrat cua thanh: 0».
