---
schema_version: 1
slug: agent-doi-truong-theo-quyen
feature: Trợ lý AI chỉ đổi trường của cả đội khi người yêu cầu là quản trị hoặc chủ — hôm nay thành viên thường nhờ trợ lý là thêm hay sửa được trường
owner: phanlemanh@gmail.com
stage: decided
decision: park
decided_by: Phan Le Manh
decided_at: 2026-10-31T09:52:29Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Phát hiện ở Cổng Bằng chứng của `chi-quan-tri-sua-duoc-truong` ngày 2026-09-22 (mục
Ngoài-1). Chủ kho chọn «mở hợp đồng mới».

Vòng đó khoá bảy thao tác đổi trường ở máy chủ API (`FieldsService.requireManager`) và
trên hai màn. Nhưng công cụ `manage_fields` của trợ lý AI (`apps/agent/agent/tools/manage_fields.ts`)
gọi `createField` / `updateFieldBrief` trong `apps/agent/agent/lib/fields.ts`, ghi thẳng
`db.fieldDefinition` — không qua API, không kiểm vai trò. `archive_field` có bước duyệt
`sensitiveWrite`, nhưng bước duyệt cũng không kiểm người duyệt có quyền quản trị.

**Người gặp:** quản trị (mất kiểm soát lược đồ qua đường khung chat) và cả đội.

## Giả định chốt sinh tử

- Agent biết được người yêu cầu của một lượt là ai (userId của hội thoại) để hỏi vai trò.
  Chưa kiểm.
- Theo luật kho, trí khôn sống ở `apps/agent`; kiểm quyền ở đó là hợp lệ, hoặc agent gọi
  qua API để dùng lại `requireManager`. Chưa chọn.

## Câu hỏi mở cho Cổng Đáng

- Thành viên thường nhờ trợ lý thêm trường: từ chối kèm lời giải thích, hay chuyển thành
  một đề xuất chờ quản trị duyệt?
- Bước duyệt `sensitiveWrite` của `archive_field`: người duyệt có phải là quản trị không?

## Ngưỡng chết / ngưỡng UAT

Chưa khai — đợi Cổng Đáng.

## Out of scope từ khám phá

- Quyền trên 20 router API khác — bài riêng.

## Quyết định Cổng Đáng 31/10

Xếp lại sau — Lỗ quyền còn sống (manage_fields của tác nhân không kiểm vai), nhưng chưa có hàng; mở lại khi cắt lượt kế có hàng quyền của tác nhân — lớp quyền là T3, cần Cổng Đáng riêng. Chủ kho 31/10 «Đồng ý theo khuyên» cho B9 của docs/plan/don-dep-3110.md (bác hoặc xếp lại hồ sơ treo ngoài kế hoạch), qua phiên giám sát Mac Studio; máy chọn từng hồ sơ.
