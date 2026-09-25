# Vùng cuộn của khung trang là khối chứa — kế hoạch thực thi

> **For agentic workers:** feature-loop T2 thực thi tuần tự trong main loop (superpowers:executing-plans). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `main[data-slot=page-shell-scroll]` của `PageShell` là khối chứa, để phần tử `absolute` bên trong không kéo dài `document` ở bất kỳ trang nào.

**Architecture:** Một dòng sửa ở `apps/app/components/page-shell.tsx` (`relative` trong class gốc của `main`). Bằng chứng là một bàn đo puppeteer trên màn thật, rút danh sách trang từ đĩa, đo sáu điều trên mỗi trang × ba khổ, có đối chứng dương trong mỗi lượt.

**Tech Stack:** Next.js App Router (`next dev` ở 3500), Tailwind, puppeteer-core + Chrome hệ thống, Prisma (đọc mã bản ghi), bun.

**Spec:** `docs/superpowers/specs/2026-09-25-vung-cuon-la-khoi-chua-design.md` · hợp đồng `_acceptance/vung-cuon-la-khoi-chua/contract.md` · evals `_acceptance/vung-cuon-la-khoi-chua/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Không đè kiểu component `@crm/ui` ở chỗ gọi; `PageShell` sống ở `apps/app/components`, sửa tại chỗ.
- Bàn đo chạy qua `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "<lệnh>"`, `APP_URL=http://localhost:3500`, `API_URL=http://localhost:3501`, tự chặn cây bằng `canhCay`.
- Lỗi biên (phiên, hết giờ, trình duyệt, đối chứng không đỏ) → mã 2 «KHONG DO DUOC», không bao giờ thành dòng SAI.
- Ảnh mặc định ghi ra `.acceptance-runs/vung-cuon-la-khoi-chua/evidence`; chỉ lượt chấm S4 đặt `BANG_CHUNG=_acceptance/vung-cuon-la-khoi-chua/evidence`.
- Phá-thử chạy trên cây đã commit, trả bằng `git checkout -- <tệp>` của đúng tệp bị phá (ghi nhớ «phá-thử tại chỗ mất thay đổi»).

## Review Focus

- Trang chuyển hướng trong luồng stream (Slack › Người): đường dẫn cuối phải đọc sau khi đứng yên, không đọc ngay sau `load`.
- Trang còn đang tải khung xương (`PageShellLoading`) lúc đo: chờ ba mẫu liên tiếp trùng nhau trước khi đo.
- Đổi khổ trên cùng trang: bố cục cũ có thể còn sót (container query) — đo sau hai khung hình và mẫu ổn định.
- Lăn con lăn khi `main` chưa cuộn được (trang ngắn không khối đệm) — khối đệm luôn có mặt trước khi lăn; `scrollTop` phải > 0, không thì mã 2.
- Dữ liệu thăm dò còn sót trên trang giữa hai điều đo: mỗi điều gỡ phần tử chèn và trả `style.position` trước khi điều kế chạy.

---

### Task 1: Bàn đo `do-khung.mjs` và chiều đỏ trên mã chưa sửa

`independent: false` · phục vụ E1–E8

**Files:**
- Create: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
- Modify: `_acceptance/config.yaml` (khoá `executors.script.vckc_do_khung` — đã thêm ở S1)

**Interfaces:**
- Produces: dòng ra `NHAN …`, `DUNG|SAI AC-n <kho>: …`, `DUNG doi chung AC-n <kho>: …`, `GHI CHU …`, `THOI GIAN …`, `KET LUAN: <d> DUNG, <s> SAI — ma thoat <m>`; env pha-thu `VCKC_PHA_DOAN=1`, `VCKC_PHA_GHIM=1`; env `BANG_CHUNG`.

- [ ] **Step 1: Khung theo `do-bang.mjs`** — `kiem`, `KhongDo`, `phien(email)`, `suySlug`, `canhCay`, `finally` đóng trình duyệt và `db.$disconnect()`.
- [ ] **Step 2: Ma trận từ đĩa** — duyệt đệ quy `apps/app/app/(app)/[slug]`, mọi `page.tsx` → đường mẫu (bỏ nhóm `(…)`), thay đoạn `[x]` bằng mã từ bảng:

```js
const DOAN = {
	contactId: () => db.contact.findFirst({ select: { id: true } }),
	dealId: () => db.deal.findFirst({ select: { id: true } }),
	companyId: () => db.company.findFirst({ select: { id: true } }),
	planId: () => db.onboardingPlan.findFirst({ select: { id: true } }),
	campaignId: () => db.campaign.findFirst({ select: { id: true } }),
	agentId: () => db.agentDefinition.findFirst({ select: { id: true } }),
	chatId: (nguoi) => db.agentConversation.findFirst({ where: { userId: nguoi }, select: { id: true } }),
};
const GHIM = {
	"/contacts/[contactId]": "chuyen-huong",
	"/deals/[dealId]": "chuyen-huong",
	"/companies/[companyId]": "chuyen-huong",
	"/onboarding/[planId]": "chuyen-huong",
	"/settings/notifications": "chuyen-huong",
	"/settings/connections/slack/people": "chuyen-huong",
	"/agents/[agentId]": "contained",
	"/chat": "khong-khung",
	"/chat/[chatId]": "khong-khung",
};
```

- [ ] **Step 3: Đo một trang** — mở một lần ở 1440×900; với từng khổ: `setViewport`, chờ đường dẫn và số đo đứng yên (400ms, ba mẫu), gắn nhãn; nhãn «đo» thì chạy sáu hàm đo trong trang (`doTuNhien`, `doDem`, `doLan`, `doToaDo`, `doHop`) kèm đối chứng, gỡ mọi phần tử chèn sau mỗi hàm.
- [ ] **Step 4: Chấm theo khổ** — mỗi AC × khổ một dòng `N/N trang`, liệt kê trang trượt; AC-1 một dòng tổng.
- [ ] **Step 5: Ảnh** — trang `/settings/fields` ở ba khổ: có khối đệm, lăn tới cuối, chụp `truong-<rong>-cuoi.png`; ép `static`, lăn lại, chụp `truong-<rong>-doi-chung.png`.
- [ ] **Step 6: Chiều đỏ** — chạy `lệnh vckc_do_khung` trên mã chưa sửa.
  Expected: mã 1; `SAI AC-2` 5/N ở ba khổ (Tiền tệ, Trường, OKR, Danh mục onboarding, Tổ chức); `SAI AC-4` và `SAI AC-5` N/N ở ba khổ; `DUNG AC-1`, `DUNG AC-3`; mọi dòng đối chứng DUNG. Lưu đầu ra vào `.acceptance-runs/vung-cuon-la-khoi-chua/truoc-sua.txt`.
- [ ] **Step 7: Phá-thử E1** — `VCKC_PHA_DOAN=1` → mã 2 gọi tên `[doanLa]`; `VCKC_PHA_GHIM=1` → `SAI AC-1 … /settings/notifications`.
- [ ] **Step 8: Commit** thước (chưa đụng `page-shell.tsx`).

### Task 2: `main` là khối chứa

`independent: false` · phục vụ E2–E8

**Files:**
- Modify: `apps/app/components/page-shell.tsx:30`

- [ ] **Step 1: Sửa**

```tsx
className={cn(
	"relative flex min-w-0 flex-1 flex-col px-4 pt-4 pb-4 md:px-6 md:pt-6 md:pb-6",
	contained ? "min-h-0 overflow-hidden" : "overflow-y-auto",
)}
```

- [ ] **Step 2: Chạy xanh** — cùng lệnh, chờ HMR. Expected: mã 0, không dòng SAI; `AC-6` có j ≥ 21 phần tử đã xét; `THOI GIAN tong` < 540s.
- [ ] **Step 3: Năm lệnh chứng của kho** — `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` (test chạy ở pre-push).
- [ ] **Step 4: Commit.**

### Task 3: Phá-thử trên mã đã sửa

`independent: false` · phục vụ E2–E7 (chiều đỏ của AC-6, AC-7, AC-3 chỉ có trên mã đã sửa)

**Files:**
- Modify tạm rồi trả: `apps/app/components/page-shell.tsx`

- [ ] **Step 1:** bỏ `relative` → `SAI AC-2/AC-4/AC-5` như chiều đỏ. Trả tệp.
- [ ] **Step 2:** `relative top-2` → `SAI AC-7`. Trả tệp.
- [ ] **Step 3:** thêm `<span className="absolute top-0 right-0 size-1" />` đầu `PageShellContent` → `SAI AC-6`. Trả tệp.
- [ ] **Step 4:** thêm `min-w-[3000px]` cho `[data-slot=page-shell]` → `SAI AC-3`. Trả tệp.
- [ ] **Step 5:** ghi kết quả vào `contract.md` mục Notes; `git status` sạch ngoài `_acceptance/`; set `status: implemented`, commit.
