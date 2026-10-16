# Của tôi ba phần — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (vòng chính tự làm tuần tự — T2 của
> feature-loop). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** «Của tôi» thành hộp việc ba phần (cần cập nhật tuần này — gửi tại chỗ · đơn vị bạn dẫn · KR bạn phụ
trách), bỏ thẻ «Cập nhật tuần», đường cũ chuyển hướng lâu dài, có lệnh đo ngưỡng Cổng Đáng.

**Architecture:** Chỉ giao diện + một giá trị lối vào. Ba phần là ba thành phần client độc lập trong
`okr/`, mỗi phần tự truy vấn (`okr.capNhatTuan`, `okr.access` + `okr.danhSach` + `org.tree`, `okr.mine` +
`authClient.useSession`) nên tải/lỗi riêng. Bảng gửi cập nhật dùng lại `BangCapNhat` của trang cũ (xuất ra, thêm hai
prop). Trang `/okr/cap-nhat-tuan` thành `redirect()` phía máy chủ giữ query. Lệnh đo là script chỉ đọc trong
`apps/api/scripts/okr/`.

**Tech Stack:** Next.js app router (RSC + client), tRPC + TanStack Query, nuqs, Prisma, bun test (DOM preload
`packages/ui/test/setup-dom.ts`), biome + anti-slop lint.

**Spec:** `docs/superpowers/specs/2026-10-15-cua-toi-ba-phan-design.md` · hợp đồng
`_acceptance/cua-toi-ba-phan/contract.md` (đã duyệt 15/10, 13 AC, giữ cỡ) · `evals.yaml` (E1–E18).

## Global Constraints

- Không đổi thủ tục API, quyền, khuôn dữ liệu; `LOI_VAO` chỉ THÊM `"cua-toi"` (cột `entry` là chuỗi, không migration).
- Trang chuyển hướng `/okr/cap-nhat-tuan` sống lâu dài, giữ MỌI tham số và thứ tự giá trị.
- Phiên cập nhật chỉ mở khi người bấm hoặc khi `tu ∈ {nhac, viec-cua-toi}`; tải `/okr` không `tu` → 0 phiên.
- Phần 1 theo chu kỳ đang chạy (`okr.capNhatTuan` không nhận chu kỳ); phần 2, 3 theo `kyOkr` của ô chu kỳ.
- Không sửa tệp của DH1 (`test/okr-dau-trang-khu.dom.tsx`, `proto/_modules/dieu-huong-khu-muc-tieu/**`,
  `_acceptance/dieu-huong-khu-muc-tieu/**`) cho tới khi DH1 gộp `onehub` (Task 9).
- Chuỗi mặt người trong `lib/messages/okr.ts` cả `vi` và `en`; một tên AI là «Kara» (không chạm ở lượt này).
- Đột biến chiều đỏ của mọi bộ đo chạy trong WORKTREE TẠM, không sửa cây đang xét (dòng sổ d-…-11).
- Không `pkill -f`; lệnh nặng `nice -n 10`; S4 xin lượt Điều phối M5.

## Review Focus

1. `?tu=nhac` mở hai phiên trong React StrictMode (hiệu ứng chạy hai lần) — chặn bằng ref; E4 có ô «tải lại».
2. Người dẫn đơn vị mà `org.tree` chưa tải xong — thứ tự thẻ phải ổn định (bộ phận trước phòng ban) chứ không nhảy.
3. `capNhatTuan` refetch sau khi gửi làm phần 1 đóng bảng đang hiện «Đã gửi» — giữ trạng thái mở tới khi người rời.
4. Người không có phiên đăng nhập phía client (`useSession` đang tải) — phần 3 hiện khung xương, không lọc nhầm rỗng.
5. Đường cũ có `donOkr` dạng mảng / tham số lạ — chuyển hướng giữ nguyên, không rơi `tu`.

---

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `packages/validation/src/okr-cap-nhat.ts` | `LOI_VAO` + `"cua-toi"` |
| `apps/app/app/(app)/[slug]/okr/okr-search-params.ts` | `tu` thôi mặc định `"tab"` (nullable) |
| `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/page.tsx` | chuyển hướng phía máy chủ về `/<slug>/okr?<query>` |
| `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx` | xuất `BangCapNhat` (+ prop `taiCho`, `suaNgay`), `DuLieuCapNhat` |
| `apps/app/app/(app)/[slug]/okr/phan-can-cap-nhat.tsx` (mới) | phần 1 + lối `tu` |
| `apps/app/app/(app)/[slug]/okr/phan-don-vi-dan.tsx` (mới) | phần 2 + `demNhip()` |
| `apps/app/app/(app)/[slug]/okr/phan-kr-phu-trach.tsx` (mới) | phần 3 + nhóm «Mục tiêu bạn tham gia» |
| `apps/app/app/(app)/[slug]/okr/cua-toi.tsx` | ráp thứ tự: phần 1 · khối việc · phần 2 · phần 3 |
| `apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx` | prop `anCapNhat`; liên kết việc cập nhật → `/okr?tu=viec-cua-toi` |
| `apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx:518` | liên kết → `/okr` |
| `apps/app/app/(app)/[slug]/okr/tab-okr.ts` · `apps/app/lib/messages/okr.ts` | A3 bốn thẻ + chuỗi mới (commit riêng) |
| `apps/agent/agent/lib/nhac-ke-hoach.ts:174` · `apps/agent/test/okr-nhac.integration.spec.ts:410` | tin nhắc `/okr?tu=nhac` |
| `apps/api/scripts/okr/do-cap-nhat-cua-toi.ts` (mới) | lệnh đo chỉ đọc |
| `apps/api/test/cua-toi-ba-phan.spec.ts`, `apps/api/test/do-cap-nhat-cua-toi.spec.ts` (mới) | E3, E12 |
| `apps/app/test/okr-cua-toi-ba-phan.dom.tsx`, `apps/app/test/okr-chuyen-huong-cap-nhat.spec.ts` (mới) | E1,E2,E4,E7–E11 · E5 |
| `_acceptance/cua-toi-ba-phan/rang/*.mjs` (mới) + khoá `executors.*.ctbp_*` | bộ chạy hai chiều, liên kết cũ, hồ sơ đã ký, bản mẫu, màn thật |

---

### Task 1: Lối vào `cua-toi` và `tu` không mặc định (independent: true)

Phục vụ E3 (AC-2), nền cho E2/E4. Verify: `bun run test -- "cd apps/api && bun test test/cua-toi-ba-phan.spec.ts -t ctbp-phien-cua-toi"` · `cd packages/validation && bun test test/okr-cap-nhat.spec.ts`.

**Files:** Modify `packages/validation/src/okr-cap-nhat.ts:7`, `packages/validation/test/okr-cap-nhat.spec.ts`,
`apps/app/app/(app)/[slug]/okr/okr-search-params.ts:70`; Create `apps/api/test/cua-toi-ba-phan.spec.ts`.

**Interfaces:** Produces `LOI_VAO = ["nhac","viec-cua-toi","tab","sheet","cua-toi"]`; `okrParsers[tu]` trả `LoiVao | null`.

- [ ] Viết ca `ctbp-phien-cua-toi` trong `apps/api/test/cua-toi-ba-phan.spec.ts` theo khuôn `apps/api/test/okr-cap-nhat.spec.ts`
  (gieo người + KR đang chạy): lặp `for (const entry of LOI_VAO)` → `okr.moCapNhat({entry})` rồi đọc
  `okrCheckInSession` → `entry` đúng (5 assert); `moCapNhatInput.safeParse({entry:"la"}).success === false`; luồng
  `cua-toi` → `guiCapNhat` 2 KR → `submittedAt !== null`, `seconds >= 0`, đúng 2 `okrCheckIn` có `sessionId`.
- [ ] Chạy → đỏ ở `cua-toi` (enum chưa có). Thêm `"cua-toi"` cuối `LOI_VAO`; thêm ca vào bảng `DAU_VAO` của spec validation.
- [ ] `okr-search-params.ts`: `[SEARCH_PARAM.okr.tu]: parseAsStringLiteral(LOI_VAO)` (bỏ `.withDefault("tab")`).
- [ ] Chạy lại xanh; `bunx tsc -p apps/app` không lỗi mới (trang `cap-nhat-tuan/page.tsx` sẽ đổi ở Task 2).
- [ ] Commit `feat(okr): lối vào cập nhật tuần «cua-toi», tu không mặc định`.

### Task 2: Chuyển hướng đường cũ + liên kết + tin nhắc (independent: true)

Phục vụ E5, E6 (AC-4), E18. Verify: `cd apps/app && bun test ./test/okr-chuyen-huong-cap-nhat.spec.ts` ·
`bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/okr-nhac.integration.spec.ts -t nhac-cap-nhat"`.

**Files:** Modify `okr/cap-nhat-tuan/page.tsx` (thay trọn), `okr/viec-cua-toi.tsx:170-180`, `okr/hop-thoai-kr.tsx:518`,
`apps/agent/agent/lib/nhac-ke-hoach.ts:174`, `apps/agent/test/okr-nhac.integration.spec.ts:410`; Create `apps/app/test/okr-chuyen-huong-cap-nhat.spec.ts`.

**Interfaces:** Produces `export function duongCuaToi(slug: string, sp: Record<string, string | string[] | undefined>): string`
trong `okr/cap-nhat-tuan/page.tsx` (thuần, test gọi thẳng); page `default` gọi `redirect(duongCuaToi(slug, await searchParams))`.

- [ ] Viết `okr-chuyen-huong-cap-nhat.spec.ts` ca `ctbp-chuyen-huong`: bảng 6 ô viết trước (`{}`, `{tu:"nhac"}`,
  `{tu:"nhac",kyOkr:"k1"}`, `{kyOkr:"k1",donOkr:"bp:x"}`, `{la:"1"}`, `{donOkr:["a","b"]}`); kỳ vọng = `"/ws/okr"` +
  (`?` + `URLSearchParams` dựng từ đầu vào giữ thứ tự, mảng thành nhiều cặp) khi khác rỗng; và gọi `default` với
  `redirect` mock → bắt đúng chuỗi, không trả JSX.
- [ ] Đỏ (hàm chưa có) → viết `page.tsx`:
  ```tsx
  import { redirect } from "next/navigation";
  type SearchParams = Promise<Record<string, string | string[] | undefined>>;
  export function duongCuaToi(slug: string, sp: Record<string, string | string[] | undefined>): string {
  	const q = new URLSearchParams();
  	for (const [k, v] of Object.entries(sp)) for (const x of Array.isArray(v) ? v : v === undefined ? [] : [v]) q.append(k, x);
  	const s = q.toString();
  	return s ? `/${slug}/okr?${s}` : `/${slug}/okr`;
  }
  export default async function CapNhatTuanCu({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: SearchParams }) {
  	redirect(duongCuaToi((await params).slug, await searchParams));
  }
  ```
- [ ] Liên kết: `nhac-ke-hoach.ts:174` → `` `${ctx.appUrl}/${ctx.slug}/okr?tu=nhac` ``; test agent dòng 410 khẳng định
  `` `${APP_URL}/${s}/okr?tu=nhac` ``; `viec-cua-toi.tsx` `DichViec` → `` `${url("/okr")}?${thamSo}` ``;
  `hop-thoai-kr.tsx:518` → `url("/okr")`.
- [ ] `git grep -n "okr/cap-nhat-tuan" -- apps/app apps/agent | grep -v "from \"" | grep -v okr-chuyen-huong` → chỉ còn
  thư mục trang. Chạy hai test xanh. Commit `feat(okr): đường cũ cập nhật tuần chuyển về Của tôi, tin nhắc trỏ /okr`.

### Task 3: `BangCapNhat` dùng tại chỗ (independent: false — trước Task 4)

Phục vụ E2. Verify: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-cap-nhat-tuan.dom.tsx` (bài cũ phải xanh nguyên).

**Files:** Modify `okr/cap-nhat-tuan/cap-nhat-tuan.tsx` (`BangCapNhat`, `DaGui`, `DaXongTuanNay`).

**Interfaces:** Produces `export function BangCapNhat(p: { duLieu: DuLieuCapNhat; sessionId: string; taiCho?: boolean; suaNgay?: boolean })`
và `export type DuLieuCapNhat`. `taiCho` → ẩn nút «Về Của tôi» ở `DaGui`/`DaXongTuanNay`; `suaNgay` → `dangSua` khởi tạo `true`.

- [ ] Thêm hai prop, truyền `taiCho` xuống `DaGui`/`DaXongTuanNay` (`{taiCho ? null : <VeCuaToi />}`); `useState(suaNgay ?? false)`.
- [ ] Bài cũ xanh (CapNhatTuan không đổi). Commit chung với Task 4.

### Task 4: Phần 1 «Cần cập nhật tuần này» + lối `tu` (independent: false)

Phục vụ E1, E2, E4, E11 (một phần). Verify: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-cua-toi-ba-phan.dom.tsx -t "ctbp-phan-mot|ctbp-cap-nhat-tai-cho|ctbp-loi-vao-tu"`.

**Files:** Create `okr/phan-can-cap-nhat.tsx`, `apps/app/test/okr-cua-toi-ba-phan.dom.tsx`; Modify `okr/viec-cua-toi.tsx`
(prop `anCapNhat?: boolean` lọc `v.loai !== "okr-cap-nhat"`), `lib/messages/okr.ts` (khối `cuaToi`: `phan1`, `capNhatN(n)`,
`conThieu(n, tuan, han)`, `daDu(tuan)`, `suaLanGui`, `khongKr`, `loiPhan`, `thuLai`, `phan2`, `donViRong(ky)`, `moDonVi`,
`soMucTieu…`, `phan3`, `krTrong(n, ky)`, `thamGia` — vi + en).

**Interfaces:** Produces `export function PhanCanCapNhat()` (gốc `<section data-phan="can-cap-nhat">`, nút
`data-nut="cap-nhat-tai-cho"` / `data-nut="sua-lan-gui"`, dòng `data-kr`). Consumes `BangCapNhat` (Task 3), `LOI_VAO` (Task 1).

- [ ] Dựng tệp DOM theo khuôn `apps/app/test/viec-okr-cua-toi.dom.tsx` (mock `@/lib/trpc/client`, `next/navigation`,
  `nuqs` adapter thử); fixture `capNhatTuan` dựng qua `capNhatTuanOutput.parse(...)` từ `okr.contracts.ts`. Viết ba nhóm:
  `ctbp-phan-mot` (8 ô + ô chu kỳ cũ + việc cập nhật bị ẩn), `ctbp-cap-nhat-tai-cho` (a/b/c của E2),
  `ctbp-loi-vao-tu` (5 ô + tải lại). Chạy → đỏ.
- [ ] Viết `PhanCanCapNhat`: `useQuery(trpc.okr.capNhatTuan.queryOptions())`; `const [tu, datTu] = useQueryState(SEARCH_PARAM.okr.tu, parseAsStringLiteral(LOI_VAO))`;
  `moPhien = useMutation(trpc.okr.moCapNhat.mutationOptions({ onSuccess: (k) => setPhien(k.sessionId) }))`;
  `const daMo = useRef(false)`; `useEffect`: khi `ds.data` có item và `tu === "nhac" || tu === "viec-cua-toi"` và
  `!daMo.current` → `daMo.current = true; moPhien.mutate({ entry: tu }); void datTu(null)`; nút → `moPhien.mutate({ entry: "cua-toi" })`.
  Đóng: bảng `SimpleTable` các item `!updatedThisWeek`; mở: `<BangCapNhat taiCho duLieu={ds.data} sessionId={phien} suaNgay={tatCaDaGui} />`;
  sau khi mở, focus ô `[data-o=gia-tri]` đầu tiên trong section. Tải: `Skeleton` `data-khung-xuong`; lỗi: `Loi` riêng phần.
- [ ] Xanh ba nhóm. Commit `feat(okr): Của tôi phần 1 — cập nhật tuần tại chỗ`.

### Task 5: Phần 2 «Đơn vị bạn dẫn» (independent: false)

Phục vụ E7, E16. Verify: `... okr-cua-toi-ba-phan.dom.tsx -t ctbp-don-vi-dan`.

**Files:** Create `okr/phan-don-vi-dan.tsx`; Modify test DOM.

**Interfaces:** Produces `export function demNhip(rows: DongDanhSach[]): { soMucTieu: number; soKr: number; tienDoTb: number; dungNhip: number; chamNhip: number; truot: number }`
dùng `nhipCua(kr.progress, row.expected, row.kind, kr.kind === "moc")` của `tien-do-kr.tsx`; `export function thuTuDan(headOf, cay): DonChonOkr[]`
(bộ phận rồi phòng ban, theo thứ tự `org.tree`); `export function PhanDonViDan({ cycleId }: { cycleId: string })` — mỗi đơn vị
`<Card data-don-vi-dan={id}>` với `data-so=muc-tieu|kr|tien-do|dung-nhip|cham-nhip|truot`, nút `data-nut="mo-don-vi"`
href `/okr/theo-don-vi?donOkr=<khoaDon>&kyOkr=<ky>`. `headOf` rỗng → `null`.

- [ ] Nhóm `ctbp-don-vi-dan` (8 ô E7) đỏ → viết → xanh. Commit `feat(okr): Của tôi phần 2 — đơn vị bạn dẫn`.

### Task 6: Phần 3 + ráp Của tôi + C3 + tải/lỗi (independent: false)

Phục vụ E8, E9, E11. Verify: `... -t "ctbp-kr-phu-trach|ctbp-khong-dan|ctbp-tai-loi"` + `./test/viec-okr-cua-toi.dom.tsx` xanh.

**Files:** Create `okr/phan-kr-phu-trach.tsx`; Modify `okr/cua-toi.tsx` (thay `MucTieuCuaToi` bằng ráp bốn khối).

**Interfaces:** Produces `export function chiaPhanBa(mine: MineOutput, toi: string): { kr: { kr: Kr; mucTieu: MucTieu }[]; thamGia: MucTieu[] }`;
`PhanKrPhuTrach` dùng `authClient.useSession()` (`@crm/auth/client`) lấy `user.id`; bảng KR `data-kr`; nhóm
`data-nhom="tham-gia"` theo khuôn `NhomMucTieuGap` của `nhom-da-bo.tsx`; giữ `NhomDangTheoDoi`, `NhomDaBo`; rỗng
→ `Empty` cũ `ST-cuatoi-rong` chỉ một liên kết «Sang Theo đơn vị».

- [ ] Ba nhóm đỏ → viết → xanh; `cua-toi.tsx`: `<PhanCanCapNhat /> <ViecOkrCuaToi anCapNhat … /> <PhanDonViDan /> <PhanKrPhuTrach />`.
- [ ] Commit `feat(okr): Của tôi phần 3 — KR bạn phụ trách, nhóm tham gia`.

### Task 7: A3 — bốn thẻ (COMMIT RIÊNG, independent: true)

Phục vụ E10. Verify: `... -t ctbp-bon-the` + `./test/okr-thanh-tab.dom.tsx` + `./test/okr-cap-nhat-tuan.dom.tsx`.

**Files:** `okr/tab-okr.ts` (bỏ `"cap-nhat-tuan"` khỏi `TAB`, `DUONG`), `lib/messages/okr.ts` (bỏ khoá `cap-nhat-tuan`
ở `tab`, `moTa`; `moTa["cua-toi"]` = «Việc cần cập nhật tuần này, đơn vị bạn dẫn và KR bạn phụ trách.» / en «Your
weekly updates, the units you lead and the key results you own.»), `okr/tieu-de-khu.ts` nếu còn tham chiếu,
`apps/app/test/okr-thanh-tab.dom.tsx` (đổi khẳng định năm → bốn).

- [ ] Nhóm `ctbp-bon-the` đỏ → sửa → xanh; `git grep -n '"cap-nhat-tuan"' apps/app` chỉ còn nhãn vết. Commit riêng
  `feat(okr): A3 — khu Mục tiêu bốn thẻ, bỏ «Cập nhật tuần»`.

### Task 8: Lệnh đo ngưỡng (independent: true)

Phục vụ E12 (AC-10). Verify: `bun run test -- "cd apps/api && bun test test/do-cap-nhat-cua-toi.spec.ts -t ctbp-do-nguong"`.

**Files:** Create `apps/api/scripts/okr/do-cap-nhat-cua-toi.ts`, `apps/api/test/do-cap-nhat-cua-toi.spec.ts`.

**Interfaces:** Produces `export async function doCapNhatCuaToi(db: Db, tu: Date, den: Date): Promise<{ n: number; k: number; p: number; duMau: boolean; donViSua: number }>`
(trưởng = `headUserId` của `Division`/`Department` hiện tại; chỉ phiên `submittedAt` trong `[tu, den)`; `k` = `entry !== "sheet"`;
`donViSua` = số đơn vị `updatedAt` trong cửa sổ) và `export function inKetQua(r): string` («k/n phiên đã gửi của trưởng đơn
vị mở ở Của tôi (p %)», «không đủ mẫu» khi n < 10, «<m> đơn vị sửa trong cửa sổ»); `main` đọc `--tu`/`--den`, chỉ `findMany`/`count`.

- [ ] Spec gieo đúng ma trận E12 (đáp án viết trước n=9,k=7,77.8 %; rồi n=10,k=8,80.0 %; đơn vị sửa 1/0; đếm dòng bảng trước/sau
  bằng nhau) → đỏ → viết → xanh. Commit `feat(okr): lệnh đo ngưỡng Của tôi ba phần`.

### Task 9: Tệp của DH1 (CHẶN tới khi DH1 gộp `onehub`)

Phục vụ E13 (AC-11). Gộp `origin/onehub` (đã có DH1) vào nhánh rồi: `test/okr-dau-trang-khu.dom.tsx` (bỏ
`/okr/cap-nhat-tuan` khỏi `TRANG_DO`/`DUONG_TAB`, «5 mô tả» → 4, vòng đi-về `dhk-giu-don` bỏ thẻ cũ),
`proto/_modules/dieu-huong-khu-muc-tieu/du-lieu.ts` (TAB_MAU 4 thẻ), `catalog.ts` bỏ `ST-dhk-cap-nhat-tuan`, `index.tsx`
bỏ state đó. Chạy mọi eval của hồ sơ `dieu-huong-khu-muc-tieu` dùng các tệp ấy. Commit `chore(okr): hồ sơ DH1 theo bốn thẻ`.

### Task 10: Bộ đo `rang/` + khoá config (independent: false — sau Task 1–8)

Phục vụ E1–E18 (đường lệnh). Verify: từng `bun _acceptance/cua-toi-ba-phan/rang/<x>.mjs …` thoát 0 trên vật lành.

**Files:** Create `_acceptance/cua-toi-ba-phan/rang/hai-chieu.mjs` (bảng `DOT_BIEN` theo evals; mỗi đột biến: `git worktree
add --detach <tmp> HEAD`, `ln -s <goc>/node_modules`, thay đoạn, chạy nhóm ở `<tmp>`, kỳ vọng ≠0 + chuỗi ghim, `git worktree
remove --force`), `lien-ket-cu.mjs` (E6 hai chiều trên bản sao tạm), `ho-so-da-ky.mjs` (E13), `proto-ba-phan.mjs` (E14),
`man-cua-toi.mjs` (E15/E16/E18, khuôn `_acceptance/dieu-huong-khu-muc-tieu/rang/man-dau-trang.mjs` + `scripts/lan-do/tien-de.mjs`);
Modify `_acceptance/config.yaml` thêm `executors.test.ctbp_{phan_mot,cap_nhat_tai_cho,phien_cua_toi,loi_vao_tu,chuyen_huong,don_vi_dan,kr_phu_trach,khong_dan,bon_the,tai_loi,do_nguong}`
và `executors.script.ctbp_{lien_ket_cu,ho_so_da_ky,proto,man}`.

- [ ] Mỗi bộ chạy: chạy trên vật lành (0) và một đột biến (≠0 + chuỗi ghim). Commit `acceptance(cua-toi-ba-phan): bộ đo rang/ + khoá ctbp_*`.

## Self-review

- Phủ: AC-1→T4 · AC-2→T1,T3,T4 · AC-3→T1,T4,T10(E18) · AC-4→T2 · AC-5→T5 · AC-6→T6 · AC-7→T6 · AC-8→T7 · AC-9→T4–T6 ·
  AC-10→T8 · AC-11→T2,T7,T9 · AC-12→T10(E14, bản mẫu đã có) · AC-13→T10(E15) + hội đồng E17.
- Tên dùng chéo: `BangCapNhat`/`DuLieuCapNhat` (T3→T4), `LOI_VAO` (T1→T4), `nhipCua` (có sẵn → T5), `demNhip` (T5→T10 E16).
