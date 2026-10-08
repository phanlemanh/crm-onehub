# K6c dong-thoi-gian-giu-khi-loi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tab Hoạt động giữ danh sách đã tải khi «Xem cũ hơn» hay lượt làm mới nền lỗi, báo tại chỗ kèm «Thử lại» tải đúng phần hỏng.

**Architecture:** Chỉ sửa nhánh hiển thị trong `apps/app/components/crm/timeline/timeline.tsx` theo ba cờ của TanStack Query v5 (`isError && !data`, `isFetchNextPageError`, `isRefetchError`), thêm hai khoá chữ vào `apps/app/lib/messages/crm.ts`. Bộ dựng thử chung chuyển `pageParam` thành `cursor` để đo được trang kế.

**Tech Stack:** Next.js app, TanStack Query 5.101, tRPC, bun test + jsdom, `@crm/ui` (`Alert`, `KaraRetry`).

**Spec:** `docs/superpowers/specs/2026-10-08-dong-thoi-gian-giu-khi-loi-design.md` · hợp đồng `_acceptance/dong-thoi-gian-giu-khi-loi/contract.md` · evals `_acceptance/dong-thoi-gian-giu-khi-loi/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- `/packages/ui` là nguồn giao diện duy nhất; không `className` đổi màu, góc, khoảng cách của component `@crm/ui` — khoảng cách đặt chỗ đi ở thẻ bọc.
- Nút «Thử lại» là `KaraRetry` (ai-ux mục 7).
- Chữ hiện ra lấy từ `crmMessages(locale)`; cặp en/vi do `apps/app/test/messages-guard.spec.ts` giữ.
- Bài DOM chỉ so giá trị nguyên thuỷ trong `expect` (luật 35 của đợt); tệp DOM mới chạy lần đầu dưới trần thời gian và đo RSS.
- `khung-gop-y.tsx` sửa đúng một dòng, commit riêng, chạy lại đủ các tệp dùng nó trước khi commit (P2-26).
- Răng màn không chép ảnh vào `_acceptance/<slug>/evidence/` khi hợp đồng đã `signed-off`/`machine-cleared`.

## Review Focus

1. Lỗi «Xem cũ hơn» khi tab đang lọc (Ghi chú, Email…) — cùng nhánh mã, bài kiểm dùng tab mặc định; Task 2 bước 5 chạy lại bài ở tab `notes` một lần bằng tay.
2. Làm mới lỗi khi tab rỗng — thông báo phải hiện cùng trạng thái rỗng (E3 ô rỗng).
3. Bấm «Thử lại» hai lần khi trang kế đang treo — chỉ một lượt gọi (E2 ô d).
4. Sau khi thử lại thành công mà còn trang — nút «Xem cũ hơn» quay lại (E2 ô c).
5. Tiếng Anh — không ký tự Việt trong hai thông báo (E5).

---

### Task 1: Bộ dựng thử chuyển pageParam thành cursor

**Files:**
- Modify: `apps/app/test/khung-gop-y.tsx` (hàm `infiniteQueryOptions`, dòng `queryFn`)

**Interfaces:**
- Produces: truy vấn vô hạn của tRPC giả gọi `doc({...vao, cursor: pageParam})` khi `pageParam` là chuỗi; trang đầu (`pageParam` null) gọi `doc(vao)` như cũ.

- [ ] **Step 1: Sửa một dòng**

```ts
			queryFn: async ({ pageParam }: { pageParam: unknown }) =>
				doc(typeof pageParam === "string" ? { ...vao, cursor: pageParam } : vao),
```

- [ ] **Step 2: Chạy lại mọi tệp dùng bộ dựng**

Run: `cd apps/app && for f in $(grep -l "khung-gop-y" test/*.tsx); do TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./$f 2>&1 | grep -E "^ *[0-9]+ (pass|fail)" | tr '\n' ' '; echo " $f"; done`
Expected: mọi tệp `0 fail`, số pass bằng lượt chạy trước khi sửa.

- [ ] **Step 3: Commit riêng**

```bash
git add apps/app/test/khung-gop-y.tsx
git commit -m "test(app): bộ dựng thử chung chuyển pageParam thành cursor (P2-26)"
```

### Task 2: Dòng thời gian giữ danh sách khi lỗi sau khi đã có dữ liệu

**Files:**
- Modify: `apps/app/lib/messages/crm.ts` (khối `timeline` en và vi: thêm `xemCuLoi`, `lamMoiLoi`)
- Modify: `apps/app/components/crm/timeline/timeline.tsx` (nhánh hiển thị)
- Create: `apps/app/test/dong-thoi-gian-giu-khi-loi.dom.tsx`

**Interfaces:**
- Consumes: Task 1 (cursor trong `dauVao`).
- Produces: `[data-dtg-loi="xem-cu"]`, `[data-dtg-loi="lam-moi"]` (thông báo `Alert`, `role="alert"`), khoá `crmMessages(l).timeline.xemCuLoi`, `.lamMoiLoi`.

- [ ] **Step 1: Khoá chữ**

en: `xemCuLoi: "Couldn't load older activity."`, `lamMoiLoi: "Couldn't refresh activity. Showing what was already loaded."`
vi: `xemCuLoi: "Không tải được hoạt động cũ hơn."`, `lamMoiLoi: "Không làm mới được hoạt động. Đang hiện bản đã tải."`

- [ ] **Step 2: Viết bài kiểm (đỏ trước)** — tệp `apps/app/test/dong-thoi-gian-giu-khi-loi.dom.tsx`: bốn test `dtg-xem-cu-loi`, `dtg-thu-lai`, `dtg-lam-moi`, `dtg-en` đúng như `expected` của E1, E2, E3, E5 trong evals.yaml. Dữ liệu `hoatDong(id)` khai `satisfies TimelineEntryData` (kiểu lấy từ RouterOutputs — máy kiểm kiểu đối chiếu với đầu ra thật của API). Mỗi `expect` so số hay chuỗi; thông báo đỏ ghim bằng `phai(dieu, "<thông điệp>")`.

- [ ] **Step 3: Chạy — phải đỏ đúng thông điệp ghim**

Run: `cd apps/app && /usr/bin/time -l bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dong-thoi-gian-giu-khi-loi.dom.tsx 2>&1 | tail -30` (đo RSS lần đầu, luật 35; bọc trần bằng `perl -e 'alarm 120; exec @ARGV'`)
Expected: FAIL với «dtg: xem cu loi thay ca danh sach» và «dtg: lam moi loi thay ca danh sach».

- [ ] **Step 4: Sửa timeline.tsx**

```tsx
import { Alert, AlertAction, AlertDescription } from "@crm/ui/components/alert";
import { KaraRetry } from "@crm/ui/components/kara/state";
```

```tsx
	const chuaCoTrang = history.data === undefined;
	const thongBaoLamMoi = history.isRefetchError ? (
		<div className="pt-3">
			<Alert data-dtg-loi="lam-moi">
				<AlertDescription>{m.timeline.lamMoiLoi}</AlertDescription>
				<AlertAction>
					<KaraRetry
						onClick={() => void history.refetch()}
						disabled={history.isFetching}
					/>
				</AlertAction>
			</Alert>
		</div>
	) : null;
```

Nhánh: `isPending` → Spinner · `isError && chuaCoTrang` → `VungTaiLoi` (giữ nguyên) · rỗng → `<div className="flex min-h-0 flex-1 flex-col">` bọc `{thongBaoLamMoi}` (trong `px-5`) và `DetailSheetEmpty` · danh sách → `{thongBaoLamMoi}` đầu vùng cuộn; cuối vùng: `history.isFetchNextPageError` → `<div className="mt-4"><Alert data-dtg-loi="xem-cu">` + `AlertDescription` `m.timeline.xemCuLoi` + `KaraRetry onClick={() => void history.fetchNextPage()} disabled={history.isFetchingNextPage}`, ngược lại nút «Xem cũ hơn» như cũ.

- [ ] **Step 5: Chạy lại — xanh; chạy E4 và messages-guard**

Run: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dong-thoi-gian-giu-khi-loi.dom.tsx ./test/kara-trang-thai-vung.dom.tsx && bun test ./test/messages-guard.spec.ts`
Expected: PASS hết.

- [ ] **Step 6: Phá thử (chiều đỏ ghim)** — trong bản sao ở `.acceptance-runs/dong-thoi-gian-giu-khi-loi/pha/`: (a) bỏ điều kiện `chuaCoTrang` → E1/E3 đỏ «dtg: xem cu loi thay ca danh sach» / «dtg: lam moi loi thay ca danh sach»; (b) «Thử lại» gọi `refetch()` → «dtg: thu lai tai lai trang dau»; (c) không gắn thông báo ở nhánh rỗng → «dtg: lam moi loi tren rong im lang»; (d) giấu nút «Xem cũ hơn» sau lỗi → «dtg: xem cu khong quay lai»; (e) bản en bằng chữ Việt → «dtg: thong bao en con chu Viet». Chạy bằng cách chép bản sao đè lên tệp thật, chạy lệnh của eval, rồi `git checkout -- <tệp>` CHỈ sau khi đã commit bước 7 (ghi nhớ: phá-thử tại chỗ mất thay đổi chưa commit).

- [ ] **Step 7: Commit**

```bash
git add apps/app/lib/messages/crm.ts apps/app/components/crm/timeline/timeline.tsx apps/app/test/dong-thoi-gian-giu-khi-loi.dom.tsx
git commit -m "fix(app): dòng thời gian giữ hoạt động đã tải khi «Xem cũ hơn» hay làm mới lỗi"
```

### Task 3: Răng màn E6

**Files:**
- Create: `_acceptance/dong-thoi-gian-giu-khi-loi/rang/man.mjs`

**Interfaces:**
- Consumes: `kho-tai-lieu/rang/man-lib.mjs` (`chay`, `HEP`, `MA`, `moDo`, `RONG`), `config:executors.script.dtg_man`.

- [ ] **Step 1: Viết răng** theo khuôn `_acceptance/kara-trang-thai-toan-crm/rang/man.mjs`: gieo cá nhân + 35 hoạt động `NOTE` (createdById của người đo), bước 1 (1440) mở `?record=contact:<id>&tab=activity`, cuộn tới cuối, bật chặn: đổi `limit` thành 1000 trong mục lô tRPC có `cursor` của `activities.timeline`, bấm «Xem cũ hơn», chờ chữ `timeline.xemCuLoi`, đếm `[data-slot=timeline] > li` trước/sau (30 = 30), không `[data-vung-tai-loi]`, chụp `dtg-xem-cu-loi-1440.png`; tắt chặn, bấm «Thử lại», chờ 35 dòng, chụp `dtg-sau-thu-lai-1440.png`; bước 2 (390) lặp tới khi thông báo hiện, đo tràn ngang trang và ngăn, nút «Thử lại» trong khung nhìn, chụp `dtg-xem-cu-loi-390.png`. `--chieu-do` bỏ chặn → đỏ «man: khong thay thong bao xem cu loi». Chép ảnh vào hồ sơ chỉ khi hợp đồng chưa `signed-off`/`machine-cleared`.

- [ ] **Step 2: Chạy** `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/dong-thoi-gian-giu-khi-loi/rang/man.mjs"` → `dong-thoi-gian-giu-khi-loi man: dat`; chạy thêm `--chieu-do` → đỏ đúng thông điệp.

- [ ] **Step 3: Commit** răng + ảnh.

### Task 4: Kiểm toàn kho rồi sang S4

- [ ] `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` ở gốc — xanh.
- [ ] Hợp đồng `status: implemented`, commit, sinh args S4.
