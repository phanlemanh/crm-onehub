# Vệ sinh đỏ sẵn onehub — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bảy hồ sơ đã ký đỏ sẵn trên onehub xanh lại: hết lỗi hydration khi mở thẳng `record=`, hết 403 khi quản trị mở cuộc soạn của người khác, thước quét chuỗi đúng định nghĩa.

**Architecture:** Ngăn bản ghi trong `layout.tsx` được bọc bởi một server component nạp sẵn đúng các khoá trùng theo vai rồi chuyển trạng thái đã `dehydrate` (chỉ các khoá đó) xuống thành phần khách `NapSanKhiMoNgan`, thành phần này chỉ bọc `HydrationBoundary` khi ngăn có bản ghi. `usePhienCuoc` chỉ bật truy vấn luồng khi `users.me` là người mở cuộc. Thước: các răng đo của vòng sống ở `_acceptance/ve-sinh-do-san-onehub/rang/`.

**Tech Stack:** Next.js 16 (App Router, Cache Components), TanStack Query v5, tRPC (`@trpc/tanstack-react-query`), nuqs, bun test + jsdom (setup-dom), puppeteer-core qua `scripts/lan-do/tien-de.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-16-ve-sinh-do-san-onehub-design.md`; hợp đồng `_acceptance/ve-sinh-do-san-onehub/contract.md`, evals `_acceptance/ve-sinh-do-san-onehub/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã sản phẩm (AGENTS.md). Chú thích khai trên răng đã ký mang nhãn `F8 neo (ve-sinh-do-san-onehub):`, `ve-sinh-do-san-onehub cach-toi:` hoặc `ve-sinh-do-san-onehub khai-trang:`.
- Thành phần `"use client"` không import gói máy chủ (`@crm/db`, `@crm/auth`, `server-only`).
- Hằng điều chỉnh được nằm trong một module theo khu (`ngan-ban-ghi-nap-san.ts`), không rải.
- Không nới route `app/eve/agents/okr/eve/v1/[...path]/route.ts`.
- Phá thử chỉ trong `git worktree add --detach` tạm; cây làm việc không đổi byte nào.
- Làn nặng (phiên đo màn, ghim lại, S4, push) xin lượt Điều phối M5, `nice -n 10`, nền.
- Chạm tệp hồ sơ đã ký hay khoá config dùng chung: `cham-tep` #375 trước commit (đã đăng 15/10 21:45Z cho danh sách hiện tại).

## Review Focus

- Trang không `record=` có thành phần khách đọc `users.list`/`giaiDoan.list`/`okr.access` mà trang không nạp sẵn → không được có dữ liệu sớm (E19, E20).
- Vai chỉ-OKR tải cứng bất kỳ trang nào → máy chủ không gọi `users.list` (bị cấm) — `khoaNapSan(true)` chỉ trả `okr.access` (E3).
- Người mở cuộc mở đúng cuộc của mình → luồng vẫn tải đúng một lần, không nháy khung «đang mở» → Than → «đang mở» (E5).
- Bài soạn đã ký dựa vào luồng được tải → vẫn xanh nhờ khung bài kiểm đặt `users.me` mặc định (suite app).
- Ô của ma trận hydration không tái hiện trên merge-base → báo cáo nói rõ, không tính là bằng chứng sửa (E2).

---

### Task 1: Nạp sẵn có điều kiện cho ngăn bản ghi

**independent:** true (với Task 2) · **phục vụ:** E3, E20 (đơn vị) · E1, E2, E16, E19 (trình duyệt)

**Files:**
- Create: `apps/app/lib/ngan-ban-ghi-nap-san.ts`
- Create: `apps/app/components/crm/record-sheet/nap-san-khi-mo-ngan.tsx`
- Modify: `apps/app/app/(app)/[slug]/layout.tsx` (khối `<Suspense fallback={null}><RecordSheetHost …/></Suspense>`)
- Test: `apps/app/test/ngan-ban-ghi-nap-san.dom.tsx`

**Interfaces:**
- Produces: `KHOA_NAP_SAN` (tên → `(trpc) => queryOptions`), `type KhoaNapSan`, `khoaNapSan(chiOkr: boolean): KhoaNapSan[]`, `luaNapSan(trpc, chiOkr)` trả mảng `queryOptions`, `chiKhoaNapSan(khoa: readonly KhoaNapSan[], trpc)` trả `(query) => boolean` cho `shouldDehydrateQuery`; `NapSanKhiMoNgan({ state, children })`.

- [ ] **Step 1: Bài DOM viết trước** — bốn ca:
  1. `khoaNapSan(true)` bằng `["okr.access"]`; `khoaNapSan(false)` bằng `["okr.access","users.list","giaiDoan.list"]`.
  2. Với mỗi khoá: `serverQC` đặt dữ liệu cho `queryKey` thật (proxy `createTRPCOptionsProxy<AppRouter>` với client giả), `dehydrate(serverQC, { shouldDehydrateQuery: chiKhoaNapSan(...) })`; render `NapSanKhiMoNgan` (nuqs testing adapter, `record=deal:x`) bọc một thành phần ngăn gọi `useQuery(khoá)`; rồi mount `HydrationBoundary` của trang cùng trạng thái + thành phần trang ghi `data` ở lần render đầu → có dữ liệu; thiếu → `throw new Error("trang doc rong luc hydrate: " + khoa)`.
  3. Đối chứng: ngăn không nạp sẵn (thành phần ngăn `useQuery` với `queryFn` không bao giờ xong) → thành phần trang đọc rỗng ở lần render đầu (chứng cơ chế thật).
  4. Ngăn rỗng (không `record=`) → sau render bộ đệm không có khoá nào (`"nap san khi ngan rong: " + khoa`); có bản ghi → đủ ba khoá.
- [ ] **Step 2:** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ban-ghi-nap-san.dom.tsx` → đỏ vì module chưa có.
- [ ] **Step 3: Module + thành phần khách**

```ts
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { Query } from "@tanstack/react-query";
import { hashKey } from "@tanstack/react-query";
import type { AppRouter } from "api/app-router";

type Trpc = TRPCOptionsProxy<AppRouter>;

export const KHOA_NAP_SAN = {
	"okr.access": (trpc: Trpc) => trpc.okr.access.queryOptions(),
	"users.list": (trpc: Trpc) => trpc.users.list.queryOptions(),
	"giaiDoan.list": (trpc: Trpc) => trpc.giaiDoan.list.queryOptions(),
} as const;

export type KhoaNapSan = keyof typeof KHOA_NAP_SAN;

const CHI_OKR: readonly KhoaNapSan[] = ["okr.access"];
const DAY_DU: readonly KhoaNapSan[] = ["okr.access", "users.list", "giaiDoan.list"];

export function khoaNapSan(chiOkr: boolean): KhoaNapSan[] {
	return [...(chiOkr ? CHI_OKR : DAY_DU)];
}

export function chiKhoaNapSan(khoa: readonly KhoaNapSan[], trpc: Trpc) {
	const bam = new Set(khoa.map((k) => hashKey(KHOA_NAP_SAN[k](trpc).queryKey)));
	return (query: Query) => query.state.status === "success" && bam.has(query.queryHash);
}
```

```tsx
"use client";
import { type DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useRecordStack } from "./record-stack";

export function NapSanKhiMoNgan({ state, children }: { state: DehydratedState; children: ReactNode }) {
	const { stack } = useRecordStack();
	return stack.length > 0 ? <HydrationBoundary state={state}>{children}</HydrationBoundary> : children;
}
```

- [ ] **Step 4: Layout** — thay `<RecordSheetHost …/>` trong Suspense bằng `<NganBanGhi />`:

```tsx
async function NganBanGhi() {
	await connection();
	const workspace = await loadWorkspace();
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const khoa = khoaNapSan(chiOkr(workspace?.viewerRole));
	await Promise.all(khoa.map((k) => queryClient.prefetchQuery(KHOA_NAP_SAN[k](trpc))));
	return (
		<NapSanKhiMoNgan state={dehydrate(queryClient, { shouldDehydrateQuery: chiKhoaNapSan(khoa, trpc) })}>
			<RecordSheetHost cauNoiOkr={okrBridgeConfigured()} />
		</NapSanKhiMoNgan>
	);
}
```
- [ ] **Step 5:** chạy bài DOM → xanh; `bun run check-types`; commit `fix(app): ngăn bản ghi nạp sẵn khoá trùng khi mở thẳng record= (cách B có điều kiện)`.

### Task 2: Chỉ tải luồng cuộc soạn khi người xem là người mở

**independent:** true (với Task 1) · **phục vụ:** E5, E7

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts:83-122` (`usePhienCuoc`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/trang-soan.tsx:179-182` (`ThanCuoc`)
- Modify: `apps/app/test/khung-soan-okr.tsx` (mặc định `users.me` = `CUOC.nguoiMo`)
- Test: `apps/app/test/soan-okr-nguoi-xem-khong-mo.dom.tsx`

**Interfaces:**
- Produces: `usePhienCuoc(cuoc)` thêm trường `choNguoiXem: boolean` (cuộc đang soạn, `users.me` chưa về).

- [ ] **Step 1: Bài DOM viết trước** (dùng `khung-soan-okr.tsx`): (a) `dat("users.me", () => ({ id: "quan-tri", … }))`, cuộc `trangThai: "dang"`, nguoiMo `hai` → đợi ổn định → `daTaiLuong` rỗng, không còn nhãn `m.man.dangMo`; vi phạm → `throw new Error("tai luong cuoc nguoi khac")`. (b) `users.me` = `hai` → đúng 1 lần tải luồng.
- [ ] **Step 2:** chạy → (a) đỏ «tai luong cuoc nguoi khac».
- [ ] **Step 3:** `usePhienCuoc`: `const toi = useQuery(trpc.users.me.queryOptions());` `const laNguoiMo = toi.data?.id === cuoc.nguoiMo.id;` `enabled: cuoc.trangThai === "dang" && !laChoGiuPhien(idThan) && laNguoiMo`; trả `choNguoiXem: cuoc.trangThai === "dang" && toi.isPending`. `ThanCuoc`: `if (phien.thread.isLoading || phien.choNguoiXem)` → `KaraState … dangMo`.
- [ ] **Step 4:** khung bài kiểm: trong phần đặt dữ liệu mặc định, `dat("users.me", () => ({ id: CUOC.nguoiMo.id, name: CUOC.nguoiMo.name, email: "hai@onehub.vn", image: null }))` — và mọi chỗ khung xoá `duLieu` giữa các bài thì đặt lại.
- [ ] **Step 5:** chạy bài mới + `bun run test:dom` của apps/app (mọi bài soạn) → xanh; commit `fix(okr): chỉ tải luồng cuộc soạn khi người xem là người mở — hết 403 của quản trị`.

### Task 3: Răng chiều đỏ dùng chung

**independent:** false (cần Task 1, 2) · **phục vụ:** E2, E4, E6, E10

**Files:** Create `_acceptance/ve-sinh-do-san-onehub/rang/chieu-do.mjs`

- [ ] Bảng `CA` (hydrat · nap-san · 403 · moi-chuoi-khai · moi-chuoi-that): tệp, phép thay chuỗi (phải khớp đúng 1 lần, không khớp → «KHONG DO DUOC: dot bien <ca> khong ap duoc» mã 2), lệnh, thông điệp ghim. Dựng `git worktree add --detach <tmp> HEAD`, symlink mọi `node_modules` (độ sâu ≤3) và `.env`, chép `packages/db/src/generated`, áp, chạy, gỡ (luôn, kể cả lỗi). Ca `hydrat`: tệp `layout.tsx` lấy nguyên bản `git show <merge-base>:…`; chạy `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/ve-sinh-do-san-onehub/rang/hydrat-record.mjs --mong-do"` trong bản sao; đọc dòng «O <o>: k/10».
- [ ] Băm cây trước/sau: `git status --porcelain -uall` + `git hash-object` mọi tệp M/?? → khác → «CHIEU DO GHI CAY <tep>» mã 1; `--tu-thu-cay` ghi một byte vào một tệp M trong bản sao danh sách băm giả → phải in «CHIEU DO GHI CAY».
- [ ] Chạy ca nap-san, 403 → «CHIEU DO DAT»; commit.

### Task 4: Răng đo hydration trình duyệt + bước 0

**independent:** false · **phục vụ:** E1, E7, E19 (và E2 qua `--mong-do`)

**Files:** Create `_acceptance/ve-sinh-do-san-onehub/rang/hydrat-record.mjs`

- [ ] Dựng theo `dat-okr-trong-crm/rang/man-okr.mjs` (puppeteer-core, `canhCay`, `phienCua` qua `dev:session`, `datNguoi`): đặt quản trị + trưởng phòng ban; tạo chu kỳ quý + cuộc soạn của trưởng qua mutation thật (`okr.*` trên API, theo đường man-okr đã dùng); ma trận viết trước D1–D4 × {1440,390} × 5 lượt, K (8 trang) × {1440,390} × 2 lượt; bắt `pageerror`/`console.error` khớp `/hydrat/i` với NGUYÊN VĂN; ghi mạng cho D3/D4 (`/eve/agents/okr`, mã 403); chụp 8 ảnh vào `.acceptance-runs/ve-sinh-do-san-onehub/evidence/`.
- [ ] `--mong-do`: chỉ D1–D4, 10 lần mỗi ô, in «O <o>: k/10 …», mã 0 khi ≥1 ô tái hiện.
- [ ] **Bước 0** (xin lượt phiên đo): chạy `--mong-do` trên HEAD TRƯỚC Task 1 (stash bằng worktree tạm ở `f46c0bbda`) để đọc thông báo đầy đủ ở D2 → nếu khoá trùng ngoài ba khoá, thêm vào `KHOA_NAP_SAN` + dòng sổ `fix`.
- [ ] Chạy đủ ở HEAD → «hydrat-record: 40 lan mo, 0 loi hydrat», «khong-record: 32 lan mo, 0 loi hydrat»; commit.

### Task 5: Răng không nới + răng ghim

**independent:** true (với Task 4) · **phục vụ:** E17, E18

**Files:** Create `rang/khong-noi.mjs`, `rang/ghim-xanh.mjs` (cùng thư mục hồ sơ).

- [ ] `khong-noi.mjs`: `git diff -U0 <mb>..HEAD -- '_acceptance/<đã ký>/rang/**'` → mỗi hunk có dòng thêm phải có một trong ba nhãn trong 12 dòng quanh; `evals.yaml` đã ký không thêm `status: not-run`/`expected_exit`; diff `apps/app/app/eve/agents/okr/**` rỗng; `--tu-thu` trên diff giả.
- [ ] `ghim-xanh.mjs`: tập bảy hồ sơ ∪ hồ sơ đã ký có tệp trong diff; dòng `repin` cuối xanh và `git diff --quiet <sha> HEAD -- . ':!_acceptance'`; `scripts/pre-merge-check.sh . --base origin/onehub` lọc vi phạm ngoài `[ve-sinh-do-san-onehub]`; `--tu-thu` với run-log giả.
- [ ] Chạy `khong-noi` → xanh; commit.

### Task 6: Thước moi-chuoi (sau Hỏi-1)

**independent:** true · **phục vụ:** E8, E9, E10

- [ ] Lối (a): thêm `"hinh"` vào `thuoc_jsx_ky_thuat` của `_acceptance/man-cai-dat-noi-tieng-viet/rang/khong-phai-chu-nguoi-doc.json` (JSON không có chú thích — khai lý do trong sổ và commit). `cai_dat_moi_chuoi` → XANH; `ktcd_khong_hoi_quy` → 0; `chieu-do --ca moi-chuoi-khai --ca moi-chuoi-that` → DAT. Lối (b) nếu chủ kho chọn: khoá mới `thuoc_jsx_theo_thanh_phan` + đọc tên thẻ mở JSX trong `boiCanh`.

### Task 7: Ghim lại + S4

**independent:** false · **phục vụ:** E18 và mọi eval

- [ ] Xin lượt `ghim-lai`; `repin-lane.mjs --root . --slug okr-soat-anh-luot-3 --slug toan-canh-okr --slug soan-okr-trong-khung --slug khung-trang-cai-dat --slug man-cai-dat-noi-tieng-viet --slug dat-okr-trong-crm --slug muc-tieu-va-kr --reason "ve-sinh-do-san-onehub: sửa gốc đỏ sẵn onehub" --write`; nhả.
- [ ] Contract → `implemented`; xin lượt `s4`; `s4-args.mjs` + bản bọc `args = …`; Workflow.
