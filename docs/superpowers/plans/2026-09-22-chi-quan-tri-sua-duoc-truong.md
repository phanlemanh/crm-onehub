# Chỉ quản trị đổi được trường — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bảy thao tác đổi định nghĩa trường chỉ cho `owner`/`admin`; màn khoá nút cho người khác.

**Architecture:** Vị từ `canManageFields` trong `@crm/auth`; `FieldsService` kiểm bằng `workspaceRoleOf` ở từng thao tác đổi và trả `access`; router chuyền `ctx.user.id`; hai màn đọc `fields.access` rồi khoá điều khiển.

**Tech Stack:** NestJS + nestjs-trpc, better-auth (plugin api-key, `enableSessionForAPIKeys`), Prisma, Next.js App Router, TanStack Query, bun test, jsdom.

**Spec:** `docs/superpowers/specs/2026-09-22-chi-quan-tri-sua-duoc-truong-design.md` · hợp đồng `_acceptance/chi-quan-tri-sua-duoc-truong/contract.md` · bộ đo `evals.yaml`.

## Global Constraints

- Không chú thích trong code, không `console.log`.
- Thông điệp máy chủ trong `apps/api/src/fields/fields-config.ts`; chữ trên màn trong `apps/app/lib/messages/crm.ts` (vi + en).
- `@crm/ui` là nguồn giao diện duy nhất; không `className` đè kiểu nút.
- Client component không import `@crm/auth` hay `@crm/db`.
- `lint:slop`: không tham số `unknown`/`object`, không spread rỗng có điều kiện.
- Sau đổi router: `bun run trpc:generate`.

---

### Task 1: Vị từ `canManageFields`

**Files:** Modify `packages/auth/src/organization.ts`, `packages/auth/src/index.ts` · Create `packages/auth/test/quyen-truong.spec.ts`
**Phục vụ:** E1 · `independent: true` · verify: `config:executors.test.cqt_ham_quyen`

- [ ] Viết test ma trận bốn vai (khuôn `quyen-dieu-phoi.spec.ts`) → đỏ (hàm chưa có)
- [ ] `export function canManageFields(role: WorkspaceRole | null): boolean { return isWorkspaceAdmin(role); }` + xuất
- [ ] Xanh; phá thử (trả `true`) → đỏ «member: true»; hoàn lại
- [ ] Commit

### Task 2: Máy chủ chặn và trả quyền

**Files:** Modify `apps/api/src/fields/fields-config.ts`, `fields.service.ts`, `fields.router.ts`, `fields.contracts.ts` (thêm `fieldAccessOutput`), `apps/api/src/generated/server.ts` (sinh lại), `apps/api/test/fields.spec.ts` (lời gọi mang `ownerId`, gieo owner qua `gieoThanhVien`) · Create `apps/api/test/chi-quan-tri-truong.spec.ts`
**Phục vụ:** E2, E3, E4, E5, E8 · `independent: false` (cần Task 1) · verify: bốn lệnh `cqt_*` API + `cqt_fields_hoi_quy`

- [ ] Viết `chi-quan-tri-truong.spec.ts`: phiên owner/admin/member/không-thuộc từ `phien-thu.ts`; khoá API tạo bằng `auth.api.createApiKey({ body: { name, userId } })`, gửi header `x-api-key`; bốn khối `cqt-member-bi-chan` (21 ca), `cqt-quan-tri-lam-duoc` (21 ca), `cqt-member-doc-duoc` (4), `cqt-access` (4) → đỏ
- [ ] `FIELDS.thongDiep.khongDuQuyen` trong `fields-config.ts`
- [ ] `FieldsService.requireManager(userId)`: `canManageFields(await workspaceRoleOf(userId))` sai → `ForbiddenException`; bảy thao tác nhận `actingUserId` đầu tiên; `access(actingUserId) → { canManage }`
- [ ] Router: `@Ctx() ctx: AuthedTrpcContext` → `ctx.user.id`; query `access`; `bun run trpc:generate`
- [ ] Sửa lời gọi trong `fields.spec.ts` (thêm `ownerId`), gieo `ownerId` làm `owner`
- [ ] Xanh; phá thử: bỏ `requireManager` ở `delete` → E2 đỏ ghim «delete»; `requireManager` bỏ qua `null` → lối (c) đỏ; hoàn lại
- [ ] `check-types`, `lint`, `lint:slop`; commit

### Task 3: Hai màn khoá nút

**Files:** Modify `apps/app/lib/messages/crm.ts`, `apps/app/components/crm/fields/fields-copy.ts`, `fields-list.tsx` (prop `khoa`), `fields-sheet.tsx`, `apps/app/app/(app)/[slug]/settings/fields/fields-settings.tsx`, `page.tsx` (prefetch `fields.access`) · Create `apps/app/test/chi-quan-tri-truong.dom.tsx`
**Phục vụ:** E6, E7 (E9 ở S4) · `independent: false` (cần kiểu sinh lại ở Task 2) · verify: `cqt_man_khoa`, `cqt_sheet_khoa`

- [ ] Viết DOM test: tRPC giả qua `mock.module("@/lib/trpc/client")` (khuôn `sua-luu-tru.dom.tsx`), hai khối × hai vai + ca «đang tải» → đỏ
- [ ] `FieldsList({ khoa })`: dòng `data-trang-thai="ST-truong-khong-quyen"`; `disabled` cho «Trường mới», «Thêm» gợi ý, `SortableItem`, nút menu dòng, «Khôi phục»; dòng không gọi `onEdit`
- [ ] `FieldsSettings` và `FieldsSheet`: `useQuery(trpc.fields.access.queryOptions())`, `khoa = data?.canManage !== true`; khoá thì không dựng `FieldEditor`
- [ ] `page.tsx` prefetch `fields.access`
- [ ] Xanh; phá thử: bỏ `disabled` ở «Trường mới» → đỏ ghim tên nút; hoàn lại
- [ ] `check-types`, `lint`, `lint:slop`, `build`; commit
