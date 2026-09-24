# Kéo thả thoả thuận giữa các giai đoạn — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Màn Thoả thuận có cách xem bảng cột; kéo một thoả thuận sang cột khác là đổi giai đoạn qua `deals.setStage`.

**Architecture:** `Board` (packages/ui) nhận chế độ kéo thả tuỳ chọn chạy bằng `reui/kanban` đã cài và sửa năm chỗ. API thêm thủ tục đọc `deals.board` (bảy cột: đếm, tổng `baseAmount`, 50 thẻ). App thêm tham số `view`, component `DealsBoard` gọi `deals.board`, ghi bằng `deals.setStage` và `CloseReasonDialog` có sẵn.

**Tech Stack:** Next 16 (app router, cacheComponents), NestJS + nestjs-trpc, Prisma, TanStack Query, nuqs, @dnd-kit (qua `reui/kanban`), bun test.

**Spec:** `docs/superpowers/specs/2026-09-23-keo-tha-thoa-thuan-design.md` · hợp đồng `_acceptance/keo-tha-thoa-thuan/contract.md` · phép đo `_acceptance/keo-tha-thoa-thuan/evals.yaml`

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Chỉ `baseAmount` được cộng; mọi tổng lọc qua `conversion.countedWhere(base)` (docs/currency.md).
- Làm mới dữ liệu qua `useCrmCache()`, không liệt key ở chỗ gọi (docs/api.md).
- Mọi biến thể giao diện mới nằm trong `packages/ui`; không `className` ghi đè ở chỗ gọi; chỉ `primary`/`destructive` được tô nền; góc theo thang (docs/design.md).
- File ReUI: import `cn` từ `../../lib/utils`, không gói npm `cn`, không Lucide (docs/reui.md).
- Client component không nhập `@crm/db` barrel; `@crm/db/enums` được phép (đang dùng ở `stage-change.tsx`).
- Dữ liệu người nhập mang `translate="no"`.
- Bộ chứng năm lệnh từ gốc: `bun run test`, `check-types`, `lint`, `lint:slop`, `build`.

---

### Task 1: `reui/kanban` sửa năm chỗ + `Board` chế độ kéo thả

`independent: true` · phục vụ E17, E14 (vùng thả cột rỗng, hydrate), E23 (không nút lồng)

**Files:**
- Modify: `packages/ui/src/components/reui/kanban.tsx`
- Modify: `packages/ui/src/components/board.tsx`
- Modify: `packages/ui/src/components/locale-provider.tsx` (thêm chuỗi `board.more`, lời báo kéo — nếu `useMessages` không đủ)
- Test: `packages/ui/test/board-giu-nguyen.dom.tsx`

**Interfaces — Produces:**
```ts
export type BoardMove = { cardId: string; from: string; to: string };
export type BoardProps = {
  columns: BoardColumn[];
  label: string;
  linkComponent?: ElementType;
  className?: string;
  onMove?: (move: BoardMove) => void;
  pendingIds?: readonly string[];
  renderCard?: (card: BoardCard, column: BoardColumn) => ReactNode;
  announcements?: Announcements;
};
export type BoardColumn = { id; label; count; cards; userLabel?; summary?: ReactNode };
```
`Kanban` thêm prop `collisionDetection?: CollisionDetection` (mặc định: `pointerWithin`, rơi về `rectIntersection` khi rỗng), `DndContext id={useId()}`; `KanbanItem` không rải `attributes` (role/tabIndex) lên thẻ nữa — `KanbanItemHandle` nhận cả `attributes` lẫn `listeners`; `KanbanColumn` gắn `data-over` từ `isOver` của `useSortable`.

- [ ] Viết `board-giu-nguyen.dom.tsx`: hai ca cùng fixture cột — không `onMove` (0 `[data-slot=kanban-item-handle]`, thẻ là `<a href>` đúng href, đếm `[data-board-column]`) và có `onMove` (mỗi thẻ có tay kéo, 0 `button` trong phần tử `role=button`). Chạy: đỏ (chưa có `onMove`).
- [ ] Sửa `kanban.tsx` năm chỗ; `Board` rẽ: không `onMove` → giữ nguyên JSX cũ; có `onMove` → bọc `Kanban`/`KanbanBoard`/`KanbanColumn`/`KanbanColumnContent`/`KanbanItem`, gọi `onMove({cardId, from, to})` trong `onMove` của `Kanban` khi `from !== to`, tay kéo ≥ 44px trên `pointer: coarse`, cột `data-[over=true]` vẽ ring bằng biến thể trong `board.tsx`.
- [ ] Chạy `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/board-giu-nguyen.dom.tsx` → xanh; phá thử (luôn bọc Kanban) → đỏ với "khong onMove: co tay keo".
- [ ] `bun run check-types`; commit.

### Task 2: thủ tục `deals.board`

`independent: true` · phục vụ E1, E2, E3, E4, E5, E22 (tệp dữ liệu round-trip)

**Files:**
- Modify: `apps/api/src/deals/deals.contracts.ts` (`dealBoardInput`, `dealBoardOutput`)
- Modify: `apps/api/src/deals/deals.service.ts` (`board()`)
- Modify: `apps/api/src/deals/deals.router.ts` (`@Query board`)
- Modify: `apps/api/src/generated/server.ts` (`bun run trpc:generate` trong `apps/api`)
- Create: `apps/api/src/deals/deal-board-config.ts` (`DEAL_BOARD = { cardsPerColumn: 50 } as const`)
- Test: `apps/api/test/deals-board.spec.ts`

**Interfaces — Produces:**
```ts
export const dealBoardInput = dealListInput.pick({ q, sort, dir, owner, closing, fields });
export const dealBoardOutput = z.object({
  columns: z.array(z.object({
    stage: stageEnum, count: z.number(), valueCents: z.number().nullable(),
    cards: z.array(dealListRowOutput.omit({ fields: true })),
  })),
  reportingCurrency: z.string(),
});
```
`board(input)` dựng `where` bằng `buildWhere({...input, status: "all", stage: [], archived: false, page: 1, pageSize: 1})`, rồi với mỗi giai đoạn theo thứ tự phễu: `count`, `aggregate _sum baseAmount` qua `countedWhere(base)`, `findMany take DEAL_BOARD.cardsPerColumn` với `resolveOrderBy(input, SORTABLE, …)`.

- [ ] Viết spec năm khối `-t dem-tong | tran-50 | cung-tap-voi-list | tha-ghi-giai-doan | thua-can-ly-do`, mọi fixture gắn owner riêng của spec để không lẫn hàng của spec khác; giá trị kỳ vọng tính từ fixture (E1) hoặc từ `deals.list` thật (E3); khối `dem-tong` ghi đầu ra `board()` ra `apps/app/test/fixtures/deals-board.json` cho E22.
- [ ] Chạy `bun run test -- "cd apps/api && bun test test/deals-board.spec.ts"` → đỏ.
- [ ] Viết contracts/service/router, `trpc:generate`.
- [ ] Chạy lại → xanh; phá thử từng chiều đỏ đã khai trong evals (bỏ `archivedAt`, nâng trần 60, bỏ owner ở phần đếm) → đỏ đúng thông điệp ghim.
- [ ] Commit.

### Task 3: màn Thoả thuận — cách xem bảng cột

`independent: false` (cần Task 1, Task 2) · phục vụ E6–E13, E18, E21, E22, E23

**Files:**
- Modify: `apps/app/app/(app)/[slug]/deals/deals-search-params.ts` (tham số `view`: `table|board`)
- Modify: `apps/app/app/(app)/[slug]/deals/page.tsx` (prefetch `deals.board` khi `view=board`, render `DealsView`)
- Create: `apps/app/app/(app)/[slug]/deals/deals-view.tsx` (nút chuyển + rẽ bảng/bảng cột; lưu trữ → khoá)
- Create: `apps/app/app/(app)/[slug]/deals/deals-board.tsx` (`DealsBoard`)
- Create: `apps/app/app/(app)/[slug]/deals/use-deal-board-move.ts` (lạc quan + hoàn tác + rẽ cột thua)
- Modify: `apps/app/lib/messages/deals.ts` (vi/en: nhãn cách xem, lời báo nhấc/dời/thả, lỗi tải, thử lại)
- Modify: `apps/app/lib/trpc/cache.ts` (`deals.board` đi cùng `deals.list` trong `listKeys` và `RECORD_LIST.deal`)
- Modify: `apps/app/lib/search-param-keys.ts` (khoá `view` nếu sổ khoá đòi)
- Test: `apps/app/test/keo-tha-thoa-thuan.dom.tsx`

**Interfaces — Consumes:** `Board`/`BoardMove` (Task 1), `trpc.deals.board` (Task 2), `DealStageMenu`, `CloseReasonDialog`, `useOpenRecord`, `useCrmCache().deal(id)`.
**Produces:** `useDealBoardMove(board)` trả `{ columns, move(cardId, from, to), pendingIds }`.

- [ ] Viết DOM test các khối `chuyen-cach-xem | tha-goi-setstage | tha-vao-cot-thua | tu-choi-ve-cho-cu | menu-giai-doan | bam-mo-tam | tai-va-loi | loc-vao-board | dau-cot | tro-nang`, tRPC giả theo nếp `onboarding-giong-deals.dom.tsx`; `dau-cot` đọc `test/fixtures/deals-board.json` do Task 2 ghi. Chạy → đỏ.
- [ ] Viết mã; thả vào cột thua đặt tham số `closeDeal/closeStage` như `DealStageMenu`.
- [ ] Chạy → xanh; phá thử từng chiều đỏ trong evals → đỏ đúng thông điệp.
- [ ] `bun run check-types`, `bun run lint`; commit.

### Task 4: thước máy cho Chrome, ReUI, cổng thiết kế

`independent: false` (cần Task 3) · phục vụ E14, E15, E16, E19, E20

**Files:**
- Create: `_acceptance/keo-tha-thoa-thuan/rang/man-bang-cot.mjs` (puppeteer-core; `rang/canh-cay.mjs` trước màn đầu; đăng nhập `dev:session`; gieo 12 thoả thuận, CONTRACT_SENT rỗng; 5 khổ × 2 tiếng; kéo bằng `page.mouse` từng bước; `deals.byId`; bắt console hydrate; `KY_MONG = 24`)
- Create: `_acceptance/keo-tha-thoa-thuan/rang/reui-da-chinh.mjs` (quét `packages/ui/src/components/reui/*`, thư mục rỗng → mã 2)
- Create: `_acceptance/keo-tha-thoa-thuan/rang/san-thiet-ke.mjs` (tệp từ `git diff --name-only $(git merge-base HEAD origin/onehub)...HEAD` giao glob, rỗng → mã 2, chạy `design-gate.mjs --mode static` từng tệp)

- [ ] Viết ba script, đường dẫn suy từ vị trí script (không hardcode gốc).
- [ ] Chạy trên máy chủ dev của worktree (APP_URL/API_URL đặt tay) → xanh; phá thử theo evals → đỏ đúng thông điệp.
- [ ] Commit.

## Thứ tự

Task 1 và Task 2 độc lập, chạy tuần tự trong vòng chính (hai việc nhỏ, dựng thêm worktree tốn hơn lợi). Task 3 sau cả hai; Task 4 sau Task 3.
