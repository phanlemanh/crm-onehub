# Tiêu đề cột đọc trọn — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi tên cột ở năm trang danh sách đọc trọn ở 50 tổ hợp khổ × tiếng, không bảng nào cuộn ngang, và tên bản ghi luôn còn ít nhất 40px chữ nhìn thấy.

**Architecture:** Sửa một chỗ ở `packages/ui/src/components/data-table.tsx` (bố cục bảng auto, ô thân `max-w-0`, nhãn tiêu đề tối đa hai dòng có sàn bề rộng, mũi tên sắp nằm cùng dòng chữ), cộng ba chỉnh `hideBelow` ở ba trang. Phép đo là một răng puppeteer chạy Chrome thật trên máy chủ dev của cây đang xét, đủ ma trận viết trước, mỗi nhóm khẳng định có một chiều đỏ lấy bằng bản sao cố tình làm hỏng.

**Tech Stack:** React 19 + Next.js (apps/app), Tailwind v4, puppeteer-core + Chrome thật, bun test, bộ kit nghiệm thu acceptance-gate 2.18.1.

**Spec:** `docs/superpowers/specs/2026-09-22-tieu-de-cot-doc-tron-design.md` · hợp đồng `_acceptance/tieu-de-cot-doc-tron/contract.md` (đã duyệt Cổng 1, 2026-09-23)

## Global Constraints

- Không viết chú thích trong code (luật kho, `AGENTS.md`).
- `/packages/ui` là nguồn duy nhất của giao diện; không override style component bằng `className` ở chỗ gọi ngoài `packages/ui`.
- Hằng số tinh chỉnh được gom vào một chỗ có tên, không rải magic number trong JSX.
- Bàn đo: `ban-do-cot-api` (3501) + `ban-do-cot-app` (3500) của CÂY ĐANG XÉT; mọi lượt đo chạy qua `scripts/lan-do/tien-de.mjs`, và chạy tuần tự với phiên khác trên cùng máy.
- Mọi phép đo mới chỉ XONG khi có cặp hai chiều trên cùng fixture: vật lành → xanh, phá vật thật trong bản sao → đỏ với thông điệp ghim.
- Năm lệnh chứng của kho phải xanh trước khi đặt `status: implemented`: `bun run test`, `check-types`, `lint`, `lint:slop`, `build`.

---

### Task 1: DataTable chung — chốt bản sửa

**Files:**
- Modify: `packages/ui/src/components/data-table.tsx`

**Interfaces:**
- Consumes: không có (task đầu).
- Produces: nhãn tiêu đề mang `data-slot="table-head-label"` (mốc cho mọi phép đo sau); hằng `HEAD_LABEL` (`{ maxLines: 2, minWidthDivisor: 2, minWidthPadCh: 1 }`); hàm `headLabelStyle(column)` trả `{ minWidth: string } | undefined`.

- [ ] **Step 1: Gom hằng, bỏ magic number**

Thay khối `headLabelStyle` hiện tại bằng:

```tsx
const HEAD_LABEL = {
	maxLines: 2,
	minWidthDivisor: 2,
	minWidthPadCh: 1,
} as const;

function headLabelStyle<TRow>(column: DataTableColumn<TRow>) {
	if (typeof column.header !== "string") return undefined;
	const ch =
		Math.ceil(column.header.length / HEAD_LABEL.minWidthDivisor) +
		HEAD_LABEL.minWidthPadCh;
	return { minWidth: `${ch}ch` };
}
```

- [ ] **Step 2: Kiểm kiểu và lint**

Chạy: `bun run check-types && bunx biome check packages/ui/src/components/data-table.tsx`
Kỳ vọng: 0 lỗi.

- [ ] **Step 3: Bài kiểm dom của kho vẫn xanh**

Chạy: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/data-table-locale.spec.tsx`
Kỳ vọng: PASS. Đỏ vì bộ chọn lớp cũ (`span.truncate`) thì sửa bài kiểm sang `[data-slot="table-head-label"]`, không sửa sản phẩm.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/data-table.tsx
git commit -m "fix(ui): bang danh sach dung bo cuc auto, tieu de toi da hai dong"
```

---

### Task 2: Ba chỉnh ưu tiên cột

**Files:**
- Modify: `apps/app/app/(app)/[slug]/campaigns/campaigns-table.tsx` (cột `called`)
- Modify: `apps/app/app/(app)/[slug]/companies/companies-table.tsx` (cột `deals`)
- Modify: `apps/app/app/(app)/[slug]/settings/members/members-table.tsx` (cột `joinedAt`)

**Interfaces:**
- Consumes: `DataTableColumn.hideBelow` của Task 1.
- Produces: ba cột ẩn theo AC-5 — `called` và `deals` mang `hideBelow: "sm"`, `joinedAt` đổi `"sm"` → `"lg"`.

- [ ] **Step 1: Đặt ba giá trị**

```tsx
{ id: "called", header: m.columns.called, sortable: true, align: "right", width: "w-[10%]", hideBelow: "sm", ... }
{ id: "deals", header: m.headers.openDeals, sortable: true, align: "right", width: "w-[20%]", hideBelow: "sm", ... }
{ id: "joinedAt", header: t.bang.thamGia, label: t.bang.thamGiaDayDu, sortable: true, align: "right", width: "w-[12%]", hideBelow: "lg", ... }
```

- [ ] **Step 2: Kiểm kiểu**

Chạy: `bun run check-types`
Kỳ vọng: 0 lỗi.

- [ ] **Step 3: Commit**

```bash
git add "apps/app/app/(app)/[slug]/campaigns/campaigns-table.tsx" "apps/app/app/(app)/[slug]/companies/companies-table.tsx" "apps/app/app/(app)/[slug]/settings/members/members-table.tsx"
git commit -m "fix(app): ba trang danh sach bot mot cot o kho hep"
```

---

### Task 3: Răng đo đủ bảy nhóm khẳng định

**Files:**
- Modify: `_acceptance/tieu-de-cot-doc-tron/rang/tieu-de-cot.mjs`
- Đọc để lấy nhãn: `apps/app/lib/messages/{deals,companies,contacts,campaigns}.ts`, `apps/app/lib/messages/settings.ts` (hoặc tệp chứa `bang.*` của trang thành viên)

**Interfaces:**
- Consumes: `data-slot="table-head-label"` (Task 1), ba cột ẩn (Task 2).
- Produces: răng in mỗi ô một dòng `dat|HONG <man>@<kho>/<tieng> …`, các dòng `HONG: …` theo khuôn ghim, và dòng tổng `o=<n> khang-dinh=<k>/<ky>`; thoát 0 khi không dòng hỏng nào, 1 khi có, 2 khi tiền đề sai.

- [ ] **Step 1: Khai hằng ma trận và tập cột mong đợi**

```js
const O_MONG = 50;
const KY_MONG = 288;
const SAN_CHU_TEN = 40;
const SAN_MEP = 1.5;
const SAN_MUI_TEN = 6;
const O_CHON_MONG = 40;

const COT_MONG = {
	deals: { 320: ["name", "company", "stage"], 375: ["name", "company", "stage"], 768: ["name", "company", "stage", "amount", "owner"], 1024: ["name", "company", "stage", "amount", "owner", "expectedCloseDate", "lastActivity"], 1440: ["name", "company", "stage", "amount", "owner", "expectedCloseDate", "lastActivity"] },
	...
};
```

Khoá cột trỏ tới khoá messages, KHÔNG viết tay chữ tiếng Việt. Tập mong đợi lấy từ `_acceptance/tieu-de-cot-doc-tron/evidence/nen-truoc-sua.txt` (cây chưa sửa), trừ đúng ba cột của AC-5.

- [ ] **Step 2: Bảy nhóm khẳng định trong `doTrenTrang`**

Mỗi ô đo và trả về đủ: tập chữ của `th` đang hiện (bỏ `th` chỉ có `sr-only`, bỏ cột ô chọn) · mỗi nhãn `scrollWidth ≤ clientWidth + 0.5` và `scrollHeight ≤ clientHeight + 0.5` và số dòng ≤ 2 · chiều cao `th` = 44 ± 1 · `svg` đang hiện nằm trong hộp `th` · khoảng cách hộp `svg` tới hộp chữ gần nhất ≤ 6 · `documentElement.scrollWidth - innerWidth ≤ 0` · khung bảng `scrollWidth - clientWidth ≤ 0` · mép nhãn so với mép nội dung ô thân đầu tiên (trái với cột trái, phải với cột phải) trong 1.5 · bề rộng cột ô chọn 40 ± 1 (chỉ ba trang có ô chọn, từ 768) · bề rộng NHÌN THẤY của phần tử `text-overflow: ellipsis` trong ô đầu ≥ 40 · ở deals@320 có ít nhất một phần tử ellipsis đang cắt chữ và nằm gọn trong ô.

- [ ] **Step 3: Bước bấm sắp (AC-6), sau ma trận**

deals ở 375 và 1024, tiếng vi: ghi `outerHTML` của `svg` (S0) → bấm nút trong `th` có chữ `dealMessages("vi").headers.company` → `waitForFunction` tới khi URL mang `sort=company` → khẳng định `aria-sort="ascending"`, ghi svg (S1) → bấm lần hai → chờ `aria-sort="descending"`, ghi svg (S2) → khẳng định S0, S1, S2 đôi một khác nhau. Không ngủ cố định.

- [ ] **Step 4: Đếm khẳng định và chặn lệch ma trận**

Cộng: 100 (AC-1) + 52 (AC-2) + 50 (AC-3) + 18 (AC-4) + 12 (AC-5) + 6 (AC-6) + 50 (AC-7) = 288. Đặt `KY_MONG = 288`; đếm khác `O_MONG`/`KY_MONG` → in `KHONG DO DUOC: ma tran lech ban khai` và thoát 2.

- [ ] **Step 5: Chạy trên cây đã sửa**

Chạy: `APP_URL=http://localhost:3500 API_URL=http://localhost:3501 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/tieu-de-cot-doc-tron/rang/tieu-de-cot.mjs"`
Kỳ vọng: `o=50 khang-dinh=288/288`, exit 0. Lưu đầu ra vào `_acceptance/tieu-de-cot-doc-tron/evidence/E1-xanh.txt`.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/tieu-de-cot-doc-tron/rang/tieu-de-cot.mjs _acceptance/tieu-de-cot-doc-tron/evidence/E1-xanh.txt
git commit -m "test(acceptance): rang do tieu de cot du bay nhom khang dinh"
```

---

### Task 4: Tám chiều đỏ bằng bản sao phá

**Files:**
- Create: `_acceptance/tieu-de-cot-doc-tron/evidence/chieu-do.txt`
- Tạm sửa rồi hoàn lại: `packages/ui/src/components/data-table.tsx`, ba tệp bảng của Task 2

**Interfaces:**
- Consumes: răng của Task 3.
- Produces: một tệp bằng chứng, mỗi chiều đỏ một khối: lệnh phá, dòng `HONG:` nguyên văn, mã thoát.

- [ ] **Step 1: Tám lượt phá, mỗi lượt một thứ, hoàn lại ngay sau khi ghi**

| Nhóm | Phá gì | Thông điệp ghim phải thấy |
|---|---|---|
| AC-1 tập cột | thêm `hideBelow: "md"` cho `lastActivity` của deals | `deals@768/vi thieu cot: …` |
| AC-1 cắt dọc | bỏ sàn `minWidth` trong `headLabelStyle` | `contacts@1440/vi tieu de bi cat: …` |
| AC-2 cuộn | bỏ `hideBelow` của `called` (campaigns) | `campaigns@320/vi bang cuon ngang …px` |
| AC-2 dấu ba chấm | bỏ lớp `truncate` ở ô tên của deals | `deals@320/vi o than khong cat bang dau ba cham` |
| AC-3 mép | bỏ `-ml-2` ở nút sắp | `lech mep … 8px` |
| AC-4 ô chọn | trả `table-fixed` vào `Table` | `deals@768/en o chon rong 139px, mong 40` |
| AC-6 mũi tên | cho `SortIndicator` luôn vẽ biểu tượng nghỉ | `deals@1024/vi … mui ten khong doi` |
| AC-7 chữ tên | đặt `width: "w-[60%]"` cho cột `stage` của deals | `… chu ten <n>px, san 40` |

Mỗi lượt: sửa → chờ 5 giây cho máy chủ dev nạp lại → chạy lệnh ở Task 3 Step 5 → chép dòng `HONG:` và mã thoát vào `chieu-do.txt` → `git checkout --` tệp vừa phá.

- [ ] **Step 2: Kiểm cây sạch sau lượt cuối**

Chạy: `git status --short -- packages apps`
Kỳ vọng: chỉ còn các sửa của Task 1–2 đã commit, không còn sửa lạ.

- [ ] **Step 3: Commit**

```bash
git add _acceptance/tieu-de-cot-doc-tron/evidence/chieu-do.txt
git commit -m "test(acceptance): chieu do cho tam nhat pha cua rang tieu de cot"
```

---

### Task 5: Thước của hồ sơ Kế hoạch 30 ngày

**Files:**
- Modify: `_acceptance/onboarding-giong-deals/rang/man-danh-muc.mjs`
- Modify: `_acceptance/onboarding-giong-deals/evals.yaml` (đoạn `expected` của E4)
- Modify: `_acceptance/onboarding-giong-deals/decisions.jsonl` (một dòng `fix`)

**Interfaces:**
- Consumes: `data-slot="table-head-label"` của Task 1.
- Produces: thước đó chạy xanh trên cây này (`o=30 khang-dinh=70/70`, exit 0) — điều kiện của AC-8.

- [ ] **Step 1: Đổi bộ chọn nhãn và thêm điều kiện cắt dọc**

```js
const nhan = th.querySelector('[data-slot="table-head-label"], span.truncate, span.block');
...
cat:
	th.scrollWidth > th.clientWidth + 0.5 ||
	(nhan !== null &&
		(nhan.scrollWidth > nhan.clientWidth + 0.5 ||
			nhan.scrollHeight > nhan.clientHeight + 0.5)),
```

- [ ] **Step 2: Chạy xanh**

Chạy: `APP_URL=http://localhost:3500 API_URL=http://localhost:3501 bash -c "$(lệnh ogd_man_danh_muc trong _acceptance/config.yaml)"`
Kỳ vọng: `o=30 khang-dinh=70/70`, exit 0. Lưu vào `_acceptance/tieu-de-cot-doc-tron/evidence/E8-xanh.txt`.

- [ ] **Step 3: Chiều đỏ trên cùng thước**

Phá: đổi `line-clamp-2` thành `line-clamp-1` trong `data-table.tsx` → chạy lại → phải thấy `tieu de bi cat: …` → hoàn lại tệp. Ghi vào `_acceptance/tieu-de-cot-doc-tron/evidence/E8-chieu-do.txt`.

- [ ] **Step 4: Dòng sổ bên hồ sơ đó**

Dùng khối `DEC-ID-RECIPE`, ghi vào `_acceptance/onboarding-giong-deals/decisions.jsonl`: `type: "fix"`, `stage: "gate2-sau"`, decision nêu DataTable đổi nhãn sang `table-head-label` + `line-clamp-2` (hồ sơ tieu-de-cot-doc-tron), impact nêu thước đo lại được lớp nhìn-thấy và hồ sơ phải ghim lại.

- [ ] **Step 5: Sửa `expected` của E4 bên đó**

Câu «(span.truncate/span.block) scrollWidth <= clientWidth» → bộ chọn mới cộng điều kiện `scrollHeight <= clientHeight + 0.5`.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/onboarding-giong-deals _acceptance/tieu-de-cot-doc-tron/evidence/E8-xanh.txt _acceptance/tieu-de-cot-doc-tron/evidence/E8-chieu-do.txt
git commit -m "test(acceptance): thuoc ke hoach 30 ngay doc nhan theo data-slot"
```

---

### Task 6: Năm lệnh chứng và đặt trạng thái

**Files:**
- Modify: `_acceptance/tieu-de-cot-doc-tron/contract.md` (frontmatter `status`)

**Interfaces:**
- Consumes: mọi task trước.
- Produces: `status: implemented` — điều kiện để vòng chấm S4 chạy.

- [ ] **Step 1: Năm lệnh chứng**

Chạy lần lượt từ gốc kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
Kỳ vọng: cả năm exit 0. Đỏ ở đâu sửa ở đó rồi chạy lại từ lệnh đỏ.

- [ ] **Step 2: Đặt trạng thái và commit**

```bash
git add _acceptance/tieu-de-cot-doc-tron/contract.md
git commit -m "chore(acceptance): tieu-de-cot-doc-tron implemented"
```

---

### Task 7: Ghim lại hồ sơ Kế hoạch 30 ngày

**Files:**
- Modify (do script ghi): `_acceptance/onboarding-giong-deals/run-log.jsonl`, `_acceptance/onboarding-giong-deals/evidence-report.md`

**Interfaces:**
- Consumes: cây đã xanh ở Task 6.
- Produces: một dòng `kind:"repin"` và một mục `### Re-pin lần N` trong hồ sơ đó, `verified_commit` trỏ đỉnh nhánh này.

- [ ] **Step 1: Kiểm cây sạch ngoài `_acceptance/`**

Chạy: `git status --short`
Kỳ vọng: không còn sửa chưa commit ngoài `_acceptance/`.

- [ ] **Step 2: Chạy làn ghim lại tại đỉnh nhánh**

Chạy: `node <feature-loop>/scripts/repin-lane.mjs --root . --slug onboarding-giong-deals --reason "DataTable doi nhan tieu de sang data-slot table-head-label" --write` với `APP_URL`/`API_URL` trỏ bàn đo của cây này.
Kỳ vọng: exit 0; làn tự chạy suite của kho và mọi eval `test`/`script` của hồ sơ đó.

- [ ] **Step 3: Commit**

```bash
git add _acceptance/onboarding-giong-deals
git commit -m "repin: onboarding-giong-deals ghim lai sau khi doi nhan tieu de"
```

---

## Thứ tự và tính độc lập

Bảy task chạy TUẦN TỰ trong phiên chính, `independent: false` cho tất cả: Task 3 đo vật của Task 1–2, Task 4 phá chính vật đó, Task 5–7 dựa trên bản sửa đã chốt. Không fan-out worktree — mọi lượt đo dùng chung một bàn đo và một cơ sở dữ liệu dev.
