# Hạn việc theo ngày — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Việc hạn hôm nay không còn hiện quá hạn từ đầu ngày; thẻ «Việc quá hạn» ở «Cả đội» hiện việc của mọi người kèm tên người tạo; «bước của tôi» cắt khung theo ngày giờ VN.

**Architecture:** Một mốc server `dauNgayVN(now)` ở `packages/db/src/onboarding-nhac.ts` thay mọi phép so `dueAt < now` của việc và khung UTC của «bước của tôi». Client dòng thời gian dùng hàm `quaHan` sẵn có. Không đổi schema.

**Tech Stack:** bun · Prisma · NestJS + nestjs-trpc · Next.js · `@crm/ui`.

**Spec:** `docs/superpowers/specs/2026-09-22-han-viec-theo-ngay-design.md` · hợp đồng `_acceptance/han-viec-theo-ngay/contract.md` · phép đo `_acceptance/han-viec-theo-ngay/evals.yaml` (E1–E9; lệnh `hv_*` trong `_acceptance/config.yaml`).

## Global Constraints

- Không viết chú thích trong code (`AGENTS.md`).
- Mốc ngày duy nhất ở server là `dauNgayVN`; không số giờ rời (`7`, `17`) trong code hay test — suy từ `NHAC.muiGio`.
- Test đọc cửa sổ từ `ONBOARDING.viecCuaToi.cuaSoNgay`, không viết số rời.
- Việc test gieo bằng `ActivitiesService.create` thật (không insert tay `dueAt`); bước gieo bằng `apps/api/test/support/ke-hoach-gieo.ts`.
- Mỗi phép đo mới có cặp hai chiều và một lượt phá-thử đỏ với thông điệp ghim; ghi lượt phá-thử vào thân commit.
- Tên người là dữ liệu người nhập: `translate="no"`.
- Năm lệnh chứng minh: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

---

### Task 1: API — mốc ngày VN, chế độ «Cả đội», `myTasks`, «bước của tôi»

**independent:** false · **phục vụ:** E1, E2, E3, E4, E5, E8 · **verify:** `bun run test -- "cd apps/api && bun test test/han-viec.spec.ts"`

**Files:** Modify `packages/db/src/onboarding-nhac.ts` (thêm `dauNgayVN`), `apps/api/src/dashboard/dashboard.service.ts` (`overdueTasks`, `buocCuaToi`), `apps/api/src/dashboard/dashboard.contracts.ts` (`createdBy` trên việc quá hạn), `apps/api/src/activities/activities.service.ts` (`myTasks`), `apps/api/src/generated/server.ts` (sinh lại, `bun run trpc:generate` trong `apps/api`). Create `apps/api/test/han-viec.spec.ts`, `apps/api/test/fixtures/han-viec-payload.json`.

**Produces:**
- `export function dauNgayVN(now: Date): Date` — 00:00 của ngày `ngayVN(now)` theo `NHAC.muiGio`, tính từ chuỗi `ngayVN` và độ lệch múi giờ của `Intl` (không viết cứng +7).
- `dashboardSummaryOutput.overdueTasks[]` thêm `createdBy: { id: string, name: string }`.

- [ ] **Step 1:** Viết `han-viec.spec.ts` với `describe` mang đúng tag lệnh: `qua-han-ngay` (E1), `bien-nua-dem` (E2), `ca-doi` (E3), `viec-cua-toi` (E4), `buoc-cua-toi` (E5), `payload` (E8). Ma trận và thông điệp ghim chép nguyên từ `expected` của từng eval. Người dùng gieo bằng `gieoThanhVien` của harness; việc qua `ActivitiesService.create` với `dueAt` là chuỗi ISO mà ô soạn gửi (00:00 VN của ngày chọn = `dauNgayVN` của một thời điểm trong ngày đó; T3 lấy 14:00 VN).
- [ ] **Step 2:** Chạy → đỏ.
- [ ] **Step 3:** `dauNgayVN`; `overdueTasks` lọc `dueAt: { lt: dauNgayVN(now) }`, `createdById` chỉ khi `mine`, `select` thêm `createdBy: { select: { id: true, name: true } }`; `myTasks` đổi hai khung sang `dauNgayVN(now)`; `buocCuaToi` đổi `han` = `dauNgayVN(now) + (cuaSoNgay + 1) * DAY_MS` và `dueAt: ngayVN(b.dueAt)`.
- [ ] **Step 4:** Sinh `han-viec-payload.json` từ đầu ra thật (cờ in tạm, xoá sau) — hai khoá `me`, `team` của `dashboard.summary` sau khi bỏ trường thời gian.
- [ ] **Step 5:** Xanh; chạy các bài kiểm api khác đọc `dashboard.summary` / `mySteps` (`rg -l "mySteps\|overdueTasks" apps/api/test apps/app/test`) và sửa fixture tối thiểu nếu khuôn mới làm đỏ — liệt kê tệp.
- [ ] **Step 6:** Phá thử: `dueAt < now` → «viec han hom nay chua qua han»; mốc UTC → «00:30 VN 23/09 thi viec han 22/09 da qua han» và «cua so buoc cua toi tinh theo ngay VN»; giữ lọc `createdById` ở team → «ca doi thay viec qua han cua B»; `myTasks` `lt: now` → «khung qua han khong gom viec han hom nay». Hoàn lại.
- [ ] **Step 7:** Commit `fix(api): han viec tinh theo ngay VN, the ca doi theo che do`.

### Task 2: App — dòng thời gian và thẻ «Cả đội»

**independent:** false · **phục vụ:** E6, E7, E9 · **verify:** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/han-viec.dom.tsx`

**Files:** Modify `apps/app/components/crm/timeline/timeline-entry.tsx:67-71` (`overdue` = `quaHan(new Date(entry.dueAt), completedAt, new Date())`), `apps/app/app/(app)/[slug]/dashboard-summary.tsx` (dòng phụ của việc ở chế độ `team` bắt đầu bằng `createdBy.name` `translate="no"`), `apps/app/package.json` (thêm `./test/han-viec.dom.tsx` vào `test:dom`). Create `apps/app/test/han-viec.dom.tsx`.

- [ ] **Step 1:** Viết `han-viec.dom.tsx`: `describe("dong-thoi-gian")` (E6, `setSystemTime` 20:54 VN, hai việc) và `describe("the-ca-doi")` (E7, dữ liệu từ `han-viec-payload.json`, khung tRPC giả chép theo `apps/app/test/may-nhac.dom.tsx`, không import chéo). Thông điệp ghim từ `expected`.
- [ ] **Step 2:** Đỏ → sửa hai tệp → xanh; chạy lại `may-nhac.dom.tsx`, `moi-phia-ke-hoach.dom.tsx` (render cùng thẻ) và sửa fixture tối thiểu nếu cần.
- [ ] **Step 3:** Phá thử: trả lại `new Date(dueAt) < new Date()` → «dong thoi gian khong to do viec han hom nay»; bỏ render `createdBy` → «the ca doi hien ten nguoi tao». Hoàn lại.
- [ ] **Step 4:** Năm lệnh chứng minh xanh; cả tám khoá `hv_*` exit 0 và chạy ≥ 1 test.
- [ ] **Step 5:** Commit `fix(app): dong thoi gian tinh qua han theo ngay; the ca doi hien nguoi tao`.
