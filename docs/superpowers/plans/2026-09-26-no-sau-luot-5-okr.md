# Nợ sau lượt 5 OKR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (feature-loop T2, thực thi tuần tự trong main loop). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khối «OKR của bạn» báo lỗi kèm Thử lại thay vì biến mất, bộ lọc phụ trách hiện tên thay mã, Theo đơn vị dùng được bản tải trước danh sách.

**Architecture:** Ba sửa nhỏ trong `apps/app`, không chạm API. Mỗi sửa đi kèm phép đo viết trước và chạy đỏ trên cây chưa vá; thước màn chạy trong phiên đo (`scripts/lan-do/tien-de.mjs`), chặn `okr.cycles` bằng chặn yêu cầu của puppeteer.

**Tech Stack:** Next (App Router, Cache Components), TanStack Query, tRPC `httpBatchLink` + superjson, nuqs, bun test + happy-dom, puppeteer-core.

**Spec:** `docs/superpowers/specs/2026-09-26-no-sau-luot-5-okr-design.md` · hợp đồng `_acceptance/no-sau-luot-5-okr/contract.md` · evals `_acceptance/no-sau-luot-5-okr/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Chữ hiển thị qua `apps/app/lib/messages/okr-toan-canh.ts`, có bản `vi` và `en`.
- Không `className` đổi màu/góc/khoảng cách trên component `@crm/ui`; trạng thái lỗi dùng `LoiXem` có sẵn.
- Fixture test khai `satisfies RouterOutputs[...]` (gap-probe P2).
- Bộ chứng năm lệnh: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## Review Focus

- Khối đã có dữ liệu rồi lần tải lại KR lỗi: phải hiện lỗi, không hiện chân «và N KR khác» với số cũ — Task 2 chặn chân thẻ khi lỗi.
- Chu kỳ lỗi trong lúc tải lại (retry của react-query giữ `isError`): nút vẫn ở, không nhấp nháy khung chờ — E2 bước 1.
- Người đã chọn ở bộ lọc trong khi danh sách chưa tải (`dem` undefined): vẫn hiện tên — E6 ca `dem` undefined.
- URL có mặt lọc với giá trị lạ (`tuTinOkr=xyz`): parser nuqs bỏ giá trị lạ, hai phía vẫn cùng khoá vì cùng hàm — E7 dùng `loadOkrSearchParams` thật.
- Lô tRPC chứa `okr.cycles` cùng thủ tục khác: thước chỉ làm lỗi đúng mục `okr.cycles`, các mục khác trả thật — Task 1.

---

### Task 1: Thước màn viết trước và chạy đỏ trên cây chưa vá

**Files:**
- Create: `_acceptance/no-sau-luot-5-okr/rang/man-no-okr.mjs`

**Phục vụ:** E8, E9, E10, E11 · **independent:** false (Task 5 chạy lại xanh)

- [ ] **Step 1:** Viết thước theo khuôn `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs` (dùng lại `canh-cay.mjs`, `man-that-lib.mjs`; `window.__tim` lọc phần tử đang hiện). Gieo qua API bằng cookie `dev:session`: hai người mới (`admin` vai admin, `chiOkr` vai okr) + một thành viên không KR «Lê Thị Vắng»; một bộ phận; kỳ năm + quý đang chạy; mục tiêu cấp bộ phận của admin có 2 KR admin phụ trách, mục tiêu cấp bộ phận của chiOkr có 1 KR; công bố; một lần cập nhật mức `thap` cho một KR của admin. Dọn trong `finally` (mục tiêu, kỳ, bộ phận, người).
- [ ] **Step 2:** Chặn: `page.setRequestInterception(true)`; yêu cầu có đường `/api/trpc/<a,b,…>` (giải mã, tách phẩy) chứa `okr.cycles` khi đang chặn → Node tự `fetch` bản thật (cùng header cookie), thay phần tử của `okr.cycles` bằng `{"error":{"json":{"message":"chan boi thuoc","code":-32603,"data":{"code":"INTERNAL_SERVER_ERROR","httpStatus":500,"path":"okr.cycles"}}}}`, `respond` mã 207 (500 nếu lô chỉ có nó). Đếm số lần chặn.
- [ ] **Step 3:** Bước E8/E9 (admin, rồi chiOkr): chặn → mở `/<slug>` → khẳng định `[data-trang-thai='ST-tongquan-loi']` hiện, chữ «Không tải được KR của bạn.», nút «Thử lại», số lần chặn ≥ 1 → ảnh; bỏ chặn → bấm «Thử lại» → đếm `okr.cycles` tăng, `[data-kr-cua-toi]` = 2 (admin) / 1 (chiOkr) → ảnh. Thông điệp đỏ ghim «E8: khoi OKR cua ban bien mat khi chu ky loi».
- [ ] **Step 4:** Bước E10: đếm yêu cầu trình duyệt có `okr.danhSach` (giải mã, tách phẩy, mọi method) từ `goto` tới mạng rảnh cho ba URL `/okr/theo-don-vi`, `?tuTinOkr=thap`, `?phuTrachOkr=<admin>&loaiOkr=cam-ket&trangThaiOkr=cong-bo&tuTinOkr=thap,cao,vua` với `donOkr=bp:<B>`; mỗi ca `[data-muc-tieu]` ≥ 1 và đếm = 0. Đối chứng: đổi URL sang lọc `tuTinOkr=cao` bằng bấm bộ lọc trên màn → đếm ≥ 1, tập `data-muc-tieu` đổi. Không lần nào đếm được → đỏ «E10: bo dem khong thay okr.danhSach».
- [ ] **Step 5:** Bước E11: mở `?donOkr=bp:<B>&phuTrachOkr=<vắng>&phuTrachOkr=u-da-roi-<ma>`; body lúc menu đóng không chứa hai id; mở «Bộ lọc» → «Người phụ trách» → menu con có «Lê Thị Vắng · 0» và «Người không còn trong tổ chức · 0», body không chứa hai id → ảnh. Đỏ ghim «E11: nhan phu trach lo ma».
- [ ] **Step 6:** Chạy đỏ: `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/no-sau-luot-5-okr/rang/man-no-okr.mjs"` (với PATH Node 24). Kỳ vọng: mã 1, HONG gồm E8, E10, E11 (E10 với số lượt ≥ 1).
- [ ] **Step 7:** Commit thước + ghi log đỏ vào `.acceptance-runs/no-sau-luot-5-okr/do-truoc-khi-va.txt` (không vào `_acceptance`).

### Task 2: Khối «OKR của bạn» báo lỗi

**Files:**
- Create: `apps/app/test/khoi-kr-cua-toi.dom.tsx`
- Modify: `apps/app/app/(app)/[slug]/okr/khoi-kr-cua-toi.tsx`
- Modify: `apps/app/lib/messages/okr-toan-canh.ts` (thêm `khoiCuaToi.loiNguoi`)

**Phục vụ:** E1, E2, E3, E4 · **independent:** true

- [ ] **Step 1: Test viết trước.** Giả `@/lib/trpc/client` (`okr.cycles`, `okr.khoiCuaToi` theo khuôn `thuTuc` của `okr-theo-don-vi.dom.tsx`, đếm lần gọi, cho phép đổi hàm trả), `next/navigation`, `next/link`, `@/components/crm/record-sheet/dien-bien-kr` (`useMoDienBien: () => () => {}`). Fixture:

```tsx
const KY = {
	id: "ky-1", kind: "quy", name: "Quý 3/2026", parentId: null,
	startsOn: "2026-07-01", endsOn: "2026-09-30", phase: "dang-chay",
	breakStartsOn: null, breakEndsOn: null, updateWeekday: 1,
} satisfies RouterOutputs["okr"]["cycles"]["cycles"][number];
const CO_KY = { cycles: [KY], currentId: "ky-1" } satisfies RouterOutputs["okr"]["cycles"];
const KHONG_KY = { cycles: [], currentId: null } satisfies RouterOutputs["okr"]["cycles"];
const dong = (id: string) => ({
	keyResultId: id, objectiveId: "mt-1", tieuDe: `KR ${id}`, mucTieu: "Mở rộng đối tác",
	chuTen: "Trần An", progress: 40, expected: 50, laMoc: false, tuTin: "vua", nhip: "cham-nhip",
}) satisfies RouterOutputs["okr"]["khoiCuaToi"]["kr"][number];
```

Bốn `describe`/`test` mang tên chứa `chu-ky-loi`, `thu-lai`, `kr-loi`, `doi-chung` (khớp `-t` của executor). Hàm `cho(xong, nhan)` ném `khong toi: <nhan> — <body>` — nhãn là thông điệp ghim của từng eval.

- [ ] **Step 2:** Chạy `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khoi-kr-cua-toi.dom.tsx` → đỏ ở `chu-ky-loi` («khoi-okr-bien-mat-khi-chu-ky-loi»), `thu-lai`, `kr-loi`; `doi-chung` xanh.
- [ ] **Step 3: Sửa.**

```tsx
import { LoiXem } from "./toan-canh/toan-canh";

const loi = cycles.isError || khoi.isError;
if (!loi && ky === null && !cycles.isPending) return null;

data-trang-thai={loi || khoi.data === undefined ? undefined : …như cũ}

{loi ? (
	<CardContent>
		<LoiXem
			cau={laNguoi ? mt.khoiCuaToi.loiNguoi : mt.khoiCuaToi.loi}
			thuLai={() => {
				if (cycles.isError) void cycles.refetch();
				if (khoi.isError) void khoi.refetch();
			}}
			trangThai={laNguoi ? "ST-nguoi-loi" : "ST-tongquan-loi"}
		/>
	</CardContent>
) : khoi.data === undefined ? (…khung chờ như cũ) : …}
{!loi && khoi.data && khoi.data.tong > khoi.data.kr.length ? (…chân như cũ) : null}
```

Messages: `vi.khoiCuaToi.loiNguoi = "Không tải được KR của người này."`, `en.khoiCuaToi.loiNguoi = "Couldn't load this person's KRs."`.

- [ ] **Step 4:** Chạy lại → xanh cả bốn. `bun run check-types` xanh.
- [ ] **Step 5:** Commit.

### Task 3: Nhãn người phụ trách

**Files:**
- Create: `apps/app/test/loc-okr-ten.spec.ts`
- Modify: `apps/app/app/(app)/[slug]/okr/loc-okr.tsx`, `okr/theo-don-vi/theo-don-vi.tsx`, `apps/app/lib/messages/okr-toan-canh.ts` (thêm `loc.nguoiDaRoi`)

**Phục vụ:** E5, E6 · **independent:** true

- [ ] **Step 1: Test viết trước** — ma trận E5/E6 so `toEqual`, và khẳng định không nhãn nào chứa `value` của nó (ném «nhan-phu-trach-lo-ma: <nhãn>»).
- [ ] **Step 2:** Chạy → đỏ (hàm chưa có).
- [ ] **Step 3: Sửa.**

```ts
export function luaChonPhuTrach(
	dem: DemMatLoc["phuTrach"] | undefined,
	chon: string[],
	tenNguoi: ReadonlyMap<string, string>,
	nguoiDaRoi: string,
): { value: string; label: string }[] {
	const coDem = new Set((dem ?? []).map((p) => p.value));
	return [
		...(dem ?? []).map((p) => ({ value: p.value, label: `${p.name} · ${p.count}` })),
		...chon
			.filter((id) => !coDem.has(id))
			.map((id) => ({ value: id, label: `${tenNguoi.get(id) ?? nguoiDaRoi} · 0` })),
	];
}
```

`LocOkr` nhận thêm `tenNguoi: ReadonlyMap<string, string>`; facet phuTrach dùng `luaChonPhuTrach(dem?.phuTrach, loc.phuTrach, tenNguoi, mt.loc.nguoiDaRoi)`. `TheoDonVi` truyền `tenNguoi={new Map(cay.data.people.map((p) => [p.id, p.name]))}`. Messages: `vi.loc.nguoiDaRoi = "Người không còn trong tổ chức"`, `en.loc.nguoiDaRoi = "No longer in the organization"`.

- [ ] **Step 4:** Chạy test → xanh; `okr-theo-don-vi.dom.tsx` vẫn xanh; check-types xanh.
- [ ] **Step 5:** Commit.

### Task 4: Một hàm dựng bộ lọc tải trước

**Files:**
- Create: `apps/app/test/loc-okr-tai-truoc.spec.ts`
- Modify: `apps/app/app/(app)/[slug]/okr/okr-search-params.ts`, `okr/theo-don-vi/page.tsx`, `okr/theo-don-vi/theo-don-vi.tsx`

**Phục vụ:** E7 · **independent:** true

- [ ] **Step 1: Test viết trước** — `Object.keys(locDanhSach.shape)` (nhập từ `../../api/src/okr/okr-xem.contracts`) so tập khoá của `locOkr(loadOkrSearchParams(new URLSearchParams()))`; thiếu mặt → ném «loc-tai-truoc-thieu-mat: <mặt>». Ma trận ba URL viết trước so `toEqual`, và `locDanhSach.parse(x)` bằng `x`.
- [ ] **Step 2:** Chạy → đỏ.
- [ ] **Step 3: Sửa.**

```ts
export function locOkr(v: {
	[SEARCH_PARAM.okr.phuTrach]: string[];
	[SEARCH_PARAM.okr.loai]: LoaiMucTieu[];
	[SEARCH_PARAM.okr.trangThai]: TrangThaiMucTieu[];
	[SEARCH_PARAM.okr.tuTin]: MucTuTin[];
}) {
	return {
		phuTrach: v[SEARCH_PARAM.okr.phuTrach],
		loai: v[SEARCH_PARAM.okr.loai],
		trangThai: v[SEARCH_PARAM.okr.trangThai],
		tuTin: v[SEARCH_PARAM.okr.tuTin],
	};
}
```

`page.tsx`: `trpc.okr.danhSach.queryOptions({ cycleId, unit, loc: locOkr(thamSo) })`. `theo-don-vi.tsx`: `const loc: LocOkrGiaTri = locOkr(url);`.

- [ ] **Step 4:** Test xanh; check-types xanh. Phá-thử sau commit: bỏ `tuTin` trong bản làm việc → đỏ ghim «loc-tai-truoc-thieu-mat: tuTin» → `git checkout` trả lại.
- [ ] **Step 5:** Commit.

### Task 5: Chạy xanh toàn bộ

**Phục vụ:** mọi eval · **independent:** false

- [ ] Phá-thử có ghim cho E1 (khôi phục nhánh `return null` trước) và E5 (nhãn về mã) sau khi commit; trả lại bằng `git checkout`.
- [ ] Thước màn Task 1 chạy lại → mã 0.
- [ ] Sàn thiết kế `bun _acceptance/toan-canh-okr/rang/san-thiet-ke.mjs` → mã 0.
- [ ] Năm lệnh chứng (Node 24) → mã 0.
- [ ] Contract `status: implemented`, commit.
