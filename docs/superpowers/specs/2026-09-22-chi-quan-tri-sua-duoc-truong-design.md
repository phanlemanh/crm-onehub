# Chỉ quản trị đổi được trường của cả đội — thiết kế

Hồ sơ: `_acceptance/chi-quan-tri-sua-duoc-truong` (T3 — chạm `packages/auth`). Cổng Đáng:
`build`, 2026-09-22.

## Lỗ

`FieldsRouter` chỉ có `AuthMiddleware` (đã đăng nhập, không kiểm vai trò). Bảy thao tác đổi
định nghĩa trường — `create` · `update` · `reorder` · `archive` · `restore` · `delete` ·
`backfill` — mở cho mọi thành viên, qua tRPC lẫn REST (`restMeta`). Ô cơ hội đếm sáu; đọc mã
thấy bảy (sót `restore`).

## Hướng

Theo đúng nếp `docs/api.md` («Permissions come from `@crm/auth` … enforced by the service *and*
used to disable the UI control, so the button and the 403 cannot disagree») và khuôn sống ở
`currency.service.ts:105`:

- `packages/auth/src/organization.ts`: `canManageFields(role) = isWorkspaceAdmin(role)`, xuất ở
  `index.ts`.
- `FieldsService`: bảy thao tác nhận thêm `actingUserId` ở đầu; mỗi thao tác gọi
  `requireManager(actingUserId)` → `workspaceRoleOf` → `ForbiddenException` với một câu trong
  `fields-config.ts`. Thêm `access(actingUserId) → { canManage }`. Không đổi constructor.
  Không lối gọi nội bộ nào dùng bảy thao tác này (contacts/deals/companies/listings chỉ đọc).
- `FieldsRouter`: lấy `ctx.user.id` bằng `@Ctx`, chuyền vào service; thêm query `access`.
  Chạy `bun run trpc:generate`.
- Kiểm ở service chứ không ở router: cùng chỗ với sáu vị từ anh em, và tránh đúng hạn chế
  Ngoài-1 của `sua-luu-tru-dieu-phoi` (kiểm ở router thì một lối gọi service khác bỏ sót).

Đọc (list, byKey, filters, coverage) giữ nguyên cho mọi thành viên.

## Màn

Hai chỗ mở việc đổi trường, cùng dùng `FieldsList` + `FieldEditor`:
Cài đặt › Trường (`settings/fields/fields-settings.tsx`) và bảng Trường mở từ hồ sơ
(`components/crm/fields/fields-sheet.tsx`).

Cả hai đọc `fields.access`. `canManage !== true` thì:
- một dòng «Cần quyền quản trị để đổi trường của cả đội.» (`data-trang-thai="ST-truong-khong-quyen"`),
  cùng hình với dòng khoá của Cài đặt › Điều phối;
- «Trường mới», nút «Thêm» của trường gợi ý, kéo xếp, menu dòng (lưu trữ), «Khôi phục» đều
  khoá (`disabled`), theo luật `docs/design.md` dùng biến thể có sẵn của `@crm/ui`;
- bấm một dòng không mở ô sửa; đường `?field=…` trên URL không dựng `FieldEditor` mà giữ danh
  sách.

`canManage` đang tải (chưa có dữ liệu) tính là khoá, để không có khoảnh khắc nút sáng rồi tắt.

## Kiểm

- `packages/auth/test/quyen-truong.spec.ts`: ma trận bốn vai (owner/admin/member/null).
- `apps/api/test/chi-quan-tri-truong.spec.ts`: supertest qua `AppModule`, phiên thật của
  `phien-thu.ts` cho ba vai; ma trận viết trước 7 thao tác × 3 vai + 4 thao tác đọc × vai
  thành viên + `access` × 4 vai (kể cả không phải thành viên).
- `apps/api/test/fields.spec.ts` cũ: đổi lời gọi sang dạng có `actingUserId` (tài khoản
  owner được gieo), mọi khẳng định cũ giữ nguyên — làm hồi quy.
- `apps/app/test/chi-quan-tri-truong.dom.tsx`: jsdom + tRPC giả, hai màn × hai vai.
- `ui-check`: ảnh thật 1440 và 768 của Cài đặt › Trường cho thành viên và quản trị.

## Tiền đề chỉ người gỡ được

Vai trò chỉ đọc từ bảng `member`. Ở dev, tài khoản chủ kho mang `member`. Trước khi gộp, chủ
kho kiểm vai trò tài khoản mình dùng trên prod — nếu là `member` thì bật chốt là tự khoá khỏi
Cài đặt › Trường (và đã khoá khỏi cài đặt Điều phối từ PR #74).

## Ngoài phạm vi

Áp quyền cho 20 router còn lại · hệ vai trò nhiều mức · nhật ký đổi trường · đổi mặc định
`Member.role` · quyền sửa giá trị trên bản ghi · sửa vai trò dữ liệu trên prod.
