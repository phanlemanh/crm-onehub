# Thành viên: hai khối cùng một khuôn section — kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hai khối của `/<slug>/settings/members` dùng chung khuôn `Card` → `CardHeader` → bảng, nút «Cho phép một địa chỉ» ở đầu trang, «Rút» trong menu «…».

**Architecture:** `page.tsx` dựng đầu trang bên trong vùng đã hydrate (khuôn của `settings/organization/page.tsx`) để đặt nút client `ChoPhepDiaChi` vào `PageShellActions` chỉ cho quản trị. `MembersTable` giữ `DataTable`, bọc `section` + `Card`. `AllowancesTable` đổi bảng vẽ tay sang `CardTable`, có khung xương khi đang tải và `CardTableEmpty` khi rỗng.

**Tech Stack:** Next.js App Router (server page + client component), tRPC + TanStack Query, `@crm/ui` (shadcn), bun test + jsdom, puppeteer-core cho bàn đo.

**Spec:** `docs/superpowers/specs/2026-09-25-thanh-vien-hai-khoi-cung-khuon-design.md` · hợp đồng `_acceptance/thanh-vien-hai-khoi-cung-khuon/contract.md` · evals `…/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Không đè `className` của component `@crm/ui` ở chỗ gọi; không đổi lớp của `CardTable` (AC-16).
- Chuỗi `t.duocPhepVao.tieuDe` giữ nguyên «Được phép vào» — bàn đo đã ký `ttv_do_bang` tìm khối bằng nó.
- Không chạm `apps/api/**` (đường T3) và không sửa gì trong `_acceptance/bang-thanh-vien-giu-hang/`.
- Một `DataTable` duy nhất trên trang (khoá URL `q/sort/dir/page`).
- Bàn đo chạy trên máy chủ dev của chính cây này ở 3500/3501, qua `mot-luot.sh`; cuộn bằng `page.mouse.wheel`.

## Review Focus

1. Người gõ một địa chỉ đã có trong danh sách: hộp phải ở lại và hiện lỗi — AC-15, E18 (Task 3).
2. Ô tìm của khối trên lọc còn một người: tiêu đề vẫn «Đã vào · N» — E4 (Task 3).
3. Địa chỉ email dài ở 768px: cột địa chỉ cắt bằng dấu ba chấm, không đẩy bảng — `truncate` + `title` (Task 4).
4. Lượt đo bị giết giữa chừng để lại lời cho phép thử — dọn tàn dư trước khi gieo, E14 (Task 3).
5. Truy vấn «Được phép vào» chờ ở client: khung xương, không câu rỗng — E8 (Task 2).

---

### Task 1: Từ điển, chuỗi, `data-slot` của `CardTableEmpty`

`independent: false` · phục vụ E11, E9

**Files:**
- Create: `_acceptance/thanh-vien-hai-khoi-cung-khuon/rang/tu-dien.mjs`
- Modify: `CONTEXT.md` (thêm hai mục sau «Chuyển việc 30 ngày»)
- Modify: `apps/app/lib/messages/settings-thanh-vien.ts` (`bang.tieuDe`, `bang.moTa`, `dem`, `duocPhepVao.menu`)
- Modify: `packages/ui/src/components/card-table.tsx` (`data-slot="card-table-empty"` trên `CardTableEmpty`)

**Interfaces — Produces:**
- `t.bang.tieuDe: string` («Đã vào» / «Signed in»), `t.bang.moTa: string`
- `t.dem(tieuDe: string, n: number): string` → `` `${tieuDe} · ${n}` ``
- `t.duocPhepVao.menu(diaChi: string): string` → «Hành động với <địa chỉ>»

- [ ] Viết `tu-dien.mjs`: đọc `CONTEXT.md`, với mỗi tên trong `["Đã vào", "Được phép vào", "Không gian làm việc"]` tìm dòng bắt đầu `**<tên>**:`, rồi trong các dòng tới mục `**…**:` kế tiếp phải có dòng bắt đầu `_Avoid_:` và dòng bắt đầu `Vì sao:`; import `thanhVienMessages` và so `bang.tieuDe === "Đã vào"`, `duocPhepVao.tieuDe === "Được phép vào"`. In `DUNG …`/`SAI …`, kết `N DUNG, M SAI`, mã 1 khi có SAI, mã 2 khi không đọc được tệp.
- [ ] Chạy `bun _acceptance/thanh-vien-hai-khoi-cung-khuon/rang/tu-dien.mjs` → ĐỎ: `SAI muc «Đã vào» khong co`, `SAI bang.tieuDe la undefined`, mã 1 (đối chứng dương «Không gian làm việc» DUNG).
- [ ] Thêm hai mục vào `CONTEXT.md`, bốn khoá chuỗi (en + vi), `data-slot` cho `CardTableEmpty`.
- [ ] Chạy lại → 11 DUNG, 0 SAI, mã 0. `bun run check-types` xanh.
- [ ] Commit `feat(thanh-vien): từ điển và chuỗi cho hai khối, data-slot của CardTableEmpty`.

### Task 2: Test DOM cho khối «Được phép vào» và soi mã

`independent: false` · phục vụ E8, E9, E17

**Files:**
- Create: `apps/app/test/thanh-vien-hai-khoi.dom.tsx`
- Create: `_acceptance/thanh-vien-hai-khoi-cung-khuon/rang/soi-ma.mjs`

**Interfaces — Consumes:** `t.dem`, `[data-slot=card-table-empty]` (Task 1); `AllowancesTable` (xuất từ `allowances-table.tsx`, không prop).

- [ ] `thanh-vien-hai-khoi.dom.tsx`: `mock.module("@/lib/trpc/client")` với `workspace.get` (dữ liệu `satisfies RouterOutputs["workspace"]["get"]`, `canManageMembers: true`), `workspace.allowances` (queryFn điều khiển được: treo mãi / trả dữ liệu `satisfies RouterOutputs["workspace"]["allowances"]`), `allowEmail`, `revokeAllowance`, `issuePasswordLink`. Ca `dang-tai`: queryFn treo → `section` có `[data-slot=card-title]` bắt đầu bằng `t.duocPhepVao.tieuDe`, ≥ 3 `[data-slot=skeleton]`, không có `t.duocPhepVao.trong`; đối chứng dương trong cùng ca: một hàng pending → 0 skeleton, địa chỉ hiện. Ca `rong`: `{ rows: [] }` → tiêu đề `t.dem(tieuDe, 0)`, `[data-slot=card-table-empty]` chứa câu rỗng, 0 `table`; một hàng `canceled` duy nhất → vẫn rỗng; một hàng `pending` → có `table`, không `card-table-empty`.
- [ ] Chạy `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-vien-hai-khoi.dom.tsx` trên giao diện cũ → ĐỎ ở `dang-tai` (0 skeleton, câu rỗng hiện) và `rong` (không `card-table-empty`).
- [ ] `soi-ma.mjs`: dùng `typescript` (`createSourceFile`, như `_acceptance/khung-trang-cai-dat/rang/cau-truc.mjs`) duyệt mọi `.tsx` trong `settings/members`, lấy tên nhập từ `@crm/ui/...`, với mỗi phần tử JSX mang tên đó: `className` chuỗi hằng (hoặc đối số chuỗi của `cn(...)`) không chứa token khớp `^(rounded|border|bg-|shadow)`; `Card|CardHeader|CardTitle|CardDescription|CardTable|DataTable` không có thuộc tính `className`. Đọc `packages/ui/src/components/card-table.tsx`, chuỗi `className` của `SimpleTable` trong `CardTable` bằng chuỗi ghim. Nhận `GOC_KHO` từ env để phá-thử trên bản sao.
- [ ] Chạy soi-mã trên cây hiện tại → xanh (đối chứng dương, bản gốc không vi phạm).
- [ ] Commit `test(thanh-vien-hai-khoi-cung-khuon): test DOM hai trạng thái và soi mã`.

### Task 3: Bàn đo màn thật `do-khoi.mjs`

`independent: false` · phục vụ E1–E7, E10, E13, E14, E16, E18

**Files:**
- Create: `_acceptance/thanh-vien-hai-khoi-cung-khuon/rang/do-khoi.mjs`

**Interfaces — Consumes:** `canhCay` từ `_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs`; `db`, `WORKSPACE_ID`, `ALLOWANCE_WITHOUT_EXPIRY`; `thanhVienMessages("vi")`.

- [ ] Khung theo `_acceptance/bang-thanh-vien-giu-hang/rang/do-bang.mjs`: `kiem(ma, nhan, dat)` ghi mã đã phát; `MA_TRAN` 46 mã viết trước; cuối lượt mã nào chưa phát → `SAI thieu <ma>`. Tiền tố `tvhk-lan-do-`; `donTruoc()` xoá theo id và email trước khi gieo (một dòng `don-truoc`); `don()` trong `finally` (hai dòng). `TVHK_PHA_SAU_GIEO=1` ném lỗi sau gieo; `TVHK_BO_KHO=<rong>` bỏ một khổ.
- [ ] Mỗi khổ: `vo`, `mep-tieu-de`, `mep-du-lieu`, `tran-ngang`. Riêng 1440: nút đầu trang (vị trí), luồng lỗi (địa chỉ 01) trước luồng thành công (địa chỉ mới), tiêu đề + section + lọc, hành động hàng + luồng rút hàng 00, cột, một ô tìm, ba dòng không quyền (phiên `marcus@trycomp.ai`, đọc vai từ DB). 375: vỏ cuộn ngang + con lăn ngang. Ảnh vào `BANG_CHUNG` (mặc định `.acceptance-runs/thanh-vien-hai-khoi-cung-khuon/evidence`).
- [ ] Dựng `ban-do-cot-api` + `ban-do-cot-app` (kiểm cổng trống trước), chạy `tvhk_do_khoi` trên giao diện cũ → ĐỎ, mã 1, ghi dòng SAI chính vào sổ S3.
- [ ] Commit `test(thanh-vien-hai-khoi-cung-khuon): bàn đo hai khối, chiều đỏ trên giao diện cũ`.

### Task 4: Giao diện

`independent: false` · phục vụ mọi eval

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/members/page.tsx`
- Create: `apps/app/app/(app)/[slug]/settings/members/cho-phep-dia-chi.tsx`
- Modify: `apps/app/app/(app)/[slug]/settings/members/members-table.tsx`
- Modify: `apps/app/app/(app)/[slug]/settings/members/allowances-table.tsx`

**Interfaces — Produces:** `export function ChoPhepDiaChi()` (client, không prop); `MembersTable`, `AllowancesTable` giữ tên và không prop.

- [ ] `page.tsx`: `DauTrang({ t, hanhDong? })` server; fallback Suspense = `DauTrang` không nút + `PageShellContent > PageShellLoading`; `Members` fetch `workspace.get`, nếu `canManageMembers` prefetch `workspace.allowances`; prefetch `workspace.members` với đầu vào hiện tại và `membersSearchParams.defaultInput()`; trả `HydrateClient > DauTrang(hanhDong=<ChoPhepDiaChi/> khi quản trị) + PageShellContent > div.flex.flex-col.gap-8 > MembersTable + AllowancesTable`.
- [ ] `cho-phep-dia-chi.tsx`: `Button` (icon `Add`, `aria-haspopup="dialog"`) + `AllowDialog`; mutation `allowEmail` — thành công: đóng, xoá lỗi, `invalidateQueries({ queryKey: trpc.workspace.allowances.queryKey() })`, toast; lỗi: `setLoi(error.message)`, hộp ở lại.
- [ ] `members-table.tsx`: `useQuery(trpc.workspace.members.queryOptions(membersSearchParams.defaultInput()))` cho N; `section aria-labelledby` > `Card` > `CardHeader(CardTitle id, CardDescription t.bang.moTa)` > `DataTable` như cũ.
- [ ] `allowances-table.tsx`: `section aria-labelledby aria-busy` > `Card` > `CardHeader` > (đang tải: `CardTable` 3 hàng `Skeleton`) | (rỗng: `CardTableEmpty`) | `CardTable` sáu cột (`CELL = "px-3 py-2.5 align-middle"`, địa chỉ `block truncate` + `title`, vai và người cho phép `text-muted-foreground`, lúc `text-right text-muted-foreground tabular-nums`, «Phát liên kết», menu «…» `aria-label=t.duocPhepVao.menu(email)` với `DropdownMenuItem variant="destructive"`) + `ConfirmDialog`. Bỏ `AllowDialog` và nút cũ.
- [ ] Verify: `bun run check-types`, `bun run lint`, `bun run lint:slop`, test DOM (Task 2) xanh, `tu-dien`, `soi-ma` xanh; `tvhk_do_khoi` → `46 DUNG, 0 SAI`; `ttv_do_bang` → `30 DUNG, 0 SAI`; `tvhk_san_thiet_ke` mã 0.
- [ ] Phá-thử trên bản sao (không `git checkout` tại chỗ): `overflow-x-hidden` ở vỏ → E5 đỏ; đóng hộp trong `onSettled` → E18 đỏ; `className="rounded-lg border"` trên `CardTable` → E17 đỏ; bỏ `<section>` khối dưới → E12 mã 2; `kill -9` giữa lượt → lượt kế dọn.
- [ ] Commit `feat(settings): hai khối Thành viên cùng khuôn section, nút cho phép lên đầu trang`.
