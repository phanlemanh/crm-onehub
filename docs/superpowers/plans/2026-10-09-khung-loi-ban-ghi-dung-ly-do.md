# K4b khung-loi-ban-ghi-dung-ly-do Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khung lỗi của bốn ngăn bản ghi (cá nhân, công ty, thoả thuận, kế hoạch) và mục «Kế hoạch» của công ty nói đúng lý do: không còn (NOT_FOUND) · không có quyền (FORBIDDEN) · mất kết nối (mã khác).

**Architecture:** Một hàm `lyDoLoi` đọc `error.data.code` của tRPC; `KhungTaiLoi` nhận `lyDo` và `coDong`; `RecordSheetFrame` chuyển `lyDo` xuống. Bốn ngăn truyền `lyDo={lyDoLoi(query.error)}`; ngăn kế hoạch thêm `onRetry`. Không đổi API.

**Tech Stack:** React 19, TanStack Query 5, tRPC client, `@crm/ui` (`Empty`, `Button`, `KaraRetry`), bun test + jsdom (`apps/app/test/khung-gop-y.tsx`), puppeteer qua `man-lib.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-09-khung-loi-ban-ghi-dung-ly-do-design.md` · hợp đồng `_acceptance/khung-loi-ban-ghi-dung-ly-do/contract.md` · evals `_acceptance/khung-loi-ban-ghi-dung-ly-do/evals.yaml`.

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Chữ mới ở `apps/app/lib/messages/kara-ban-ghi.ts` khối `khung`, đủ cặp en/vi (`messages-guard`).
- Tệp ngoài ranh giới K4b (record-parts, plan-sheet, company-plans, ba sheet, test `khung-loi-ban-ghi*.dom.tsx`, hồ sơ) phải xin `cham-tep` trước khi sửa.
- `data-khung-tai-loi` giữ nguyên; thêm `data-ly-do="khong-con|khong-quyen|mat-ket-noi"`.
- Lý do mặc định của `KhungTaiLoi` là `mat-ket-noi` — bài đã ký `kara-ban-ghi.dom.tsx -t khung-loi` (E8) chạy lại không sửa.
- DOM test: expect chỉ so giá trị nguyên thuỷ; lượt đầu chạy có trần thời gian và đo RSS (luật 35).

## Review Focus

- Lỗi không có `data` (Error thường, lỗi mạng của fetch) → `mat-ket-noi`, không ném khi đọc `error.data.code`.
- «Đóng» khi chồng ngăn chỉ gỡ ngăn trên cùng (`close`), không `closeAll`.
- Mục «Kế hoạch» của công ty với NOT_FOUND/FORBIDDEN không có nút nào (không đóng nhầm ngăn công ty).
- Ngăn kế hoạch lỗi mạng có «Thử lại» gọi lại `onboarding.planById` đúng một lần.
- Bản tiếng Anh không lọt chữ Việt có dấu.

---

### Task 1: Phân loại lỗi và khung theo lý do

**Files:**
- Modify: `apps/app/components/crm/record-sheet/record-parts.tsx` (`KhungTaiLoi`, `RecordSheetFrame`, thêm `lyDoLoi`, kiểu `LyDoLoi`)
- Modify: `apps/app/lib/messages/kara-ban-ghi.ts` (khối `khung`: `khongCon {tieuDe, moTa, dong}`, `khongQuyen {tieuDe, moTa, dong}` en + vi)
- Modify: `contact-sheet.tsx`, `company-sheet.tsx`, `deal-sheet.tsx`, `plan-sheet.tsx` (truyền `lyDo`; plan-sheet thêm `onRetry`)
- Modify: `company-plans.tsx` (`<KhungTaiLoi lyDo={lyDoLoi(query.error)} coDong={false} onRetry=… />`)
- Test: `apps/app/test/khung-loi-ban-ghi-dung-ly-do.dom.tsx`

**Interfaces:**
- Produces: `export type LyDoLoi = "khong-con" | "khong-quyen" | "mat-ket-noi"`; `export function lyDoLoi(loi: { data?: { code?: string } | null } | null): LyDoLoi`; `KhungTaiLoi({ lyDo = "mat-ket-noi", onRetry, coDong = true })`; `RecordSheetFrame` thêm prop `lyDo?: LyDoLoi`.

- [ ] **Step 1: Viết bài đỏ** — `describe("khung-loi-ban-ghi-dung-ly-do")` với các test tên bắt đầu `klg-khong-con`, `klg-khong-quyen`, `klg-mat-ket-noi`, `klg-ke-hoach-cong-ty`, `klg-en`, đúng như `expected` của E1–E5. Lỗi giả: `Object.assign(new Error("khong-con-tho"), { data: { code: "NOT_FOUND" } })` ném từ `dat("<duong>.byId", …)`. Ma trận viết trước 4 ngăn: `ContactSheet` (`contacts.byId`), `CompanySheet` (`companies.byId`), `DealSheet` (`deals.byId`), `PlanSheet` (`onboarding.planById`), mỗi ngăn bọc trong `DetailSheet open`, `searchParams` `record=<loại>:<id>`; `expect(o.length).toBe(4)`. Ô chồng ngăn: `searchParams: "record=company:A,contact:B"`, `onUrlUpdate` ghi `record` cuối → sau «Đóng» === `"company:A"`; đối chứng một ngăn → không còn `record`. `klg-en`: bọc `man` trong `<LocaleProvider locale="en">` lồng bên trong.
- [ ] **Step 2: Chạy, xác nhận đỏ** — `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khung-loi-ban-ghi-dung-ly-do.dom.tsx` có trần thời gian, đo RSS; mong đỏ ở «không còn hiện như mất kết nối».
- [ ] **Step 3: Cài đặt** — `lyDoLoi` đọc `loi?.data?.code`; `KhungTaiLoi` chọn tiêu đề/mô tả theo lý do: `mat-ket-noi` giữ `m.misc.recordNotLoaded` + `t.loiMoTa` + `KaraRetry`; hai lý do kia `t.khongCon|khongQuyen.tieuDe/moTa` và, khi `coDong`, `Button variant="outline" size="sm" onClick={close}` (`useRecordStack().close`) chữ `.dong`. Không render `onRetry` cho hai lý do kia. Gắn `data-ly-do`.
- [ ] **Step 4: Chạy xanh** — cả tệp mới + `kbk_khung_loi` + `messages-guard`.
- [ ] **Step 5: Chiều đỏ ghim** — chép bản sao theo `CHIEU DO` của E1–E5 vào thư mục nháp, chạy, thấy đúng thông điệp ghim; không phá-thử tại chỗ trên cây chưa commit.
- [ ] **Step 6: Commit** — `feat(record-sheet): khung lỗi bản ghi nói đúng lý do`.

### Task 2: Răng mã thật của máy chủ (E9, E10)

**Files:**
- Create: `_acceptance/khung-loi-ban-ghi-dung-ly-do/rang/ma-that.mjs`

- [ ] **Step 1:** Script suy gốc kho từ vị trí, thoát 2 khi không có `PHIEN_DO`/`API_URL`; dùng `moDo()` của `kho-tai-lieu/rang/man-lib.mjs`, `nguoiMoi` tạo chủ; gieo cá nhân, công ty, thoả thuận, kế hoạch qua `d.db` rồi xoá vĩnh viễn (hoặc dùng id chưa từng có); `fetch(API_URL + "/api/trpc/<thủ tục>?input=…")` với cookie, đọc `error.json?.data?.code ?? error.data?.code`; bảng thủ tục → mã; NOT_FOUND cho bốn `byId`; ghi mã thật của `onboarding.plansOfCompany`; xoá dòng `member` của một người rồi gọi `contacts.byId` → FORBIDDEN. In `khung-loi-ban-ghi-dung-ly-do ma-that: dat`.
- [ ] **Step 2:** `--chieu-do` gọi `contacts.byId` với bản ghi còn sống bằng thành viên → đỏ «ma-that: khong con nhung tra du lieu».
- [ ] **Step 3:** Chạy qua `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-loi-ban-ghi-dung-ly-do/rang/ma-that.mjs"`; nếu `plansOfCompany` không ra NOT_FOUND thì AC-4 vẫn đúng (khung đọc mã thật) — ghi số vào sổ.
- [ ] **Step 4: Commit.**

### Task 3: Răng màn (E6)

**Files:**
- Create: `_acceptance/khung-loi-ban-ghi-dung-ly-do/rang/man.mjs` (theo khuôn `dong-thoi-gian-giu-khi-loi/rang/man.mjs`, có chốt «hồ sơ đã thông cổng thì không chép ảnh»)

- [ ] **Step 1:** Bước 1 (1440): gieo cá nhân, xoá vĩnh viễn qua `d.db`, mở `/contacts?record=contact:<id>`, chờ `[data-ly-do=khong-con]`, kiểm chữ, không nút «Thử lại», gỡ `.tsqd-*` rồi chụp `klg-khong-con-1440.png`, bấm «Đóng» → không còn `[data-slot=sheet-content]`. Bước 2 (390): lặp, đo `scrollWidth ≤ clientWidth`, nút «Đóng» trong khung nhìn, chụp `klg-khong-con-390.png`.
- [ ] **Step 2:** `--chieu-do` mở cá nhân còn sống → đỏ «man: khong thay khung khong con».
- [ ] **Step 3:** Chạy qua `tien-de`, chép ảnh vào `_acceptance/…/evidence/` (hồ sơ chưa thông cổng).
- [ ] **Step 4: Commit.**

### Task 4: Cổng máy của kho

- [ ] `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` từ gốc — đọc kết quả qua tệp.
- [ ] Contract `status: implemented`; commit; sang S4.
