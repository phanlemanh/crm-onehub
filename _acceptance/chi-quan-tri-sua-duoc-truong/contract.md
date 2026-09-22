---
schema_version: 1
feature: Chỉ quản trị và chủ đổi được định nghĩa trường của cả đội — thành viên thường vẫn xem được, nhưng mọi đường đổi đều khoá, cả trên màn lẫn khi gọi thẳng máy chủ
slug: chi-quan-tri-sua-duoc-truong
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-09-22-chi-quan-tri-sua-duoc-truong-design.md
---

# Acceptance Contract: chi-quan-tri-sua-duoc-truong

## Context

Ô `truong-tu-tao-o-cai-dat` để ngỏ lỗ quyền ngày 18/09; buổi đọc mã 20/09 xác nhận còn nguyên.
`FieldsRouter` chỉ kiểm đã đăng nhập, nên một tài khoản vai trò `member` tạo, sửa, xếp lại,
lưu trữ, khôi phục, xoá và điền bù được trường của cả đội — qua tRPC lẫn REST. Chủ kho quyết
`build` ngày 22/09. Vòng áp nếp phân quyền sẵn có của kho (`@crm/auth` + service + khoá nút),
không dựng lớp mới.

## Criteria

- AC-1: Given `canManageFields` trong `@crm/auth`, When hỏi với từng vai trò, Then `owner` và `admin` được, `member` và không có vai trò (`null`) không được, và ma trận phủ đủ mọi giá trị của `WORKSPACE_ROLES`.
- AC-2: Given một tài khoản vai trò `member` (bằng phiên đăng nhập, và bằng khoá API của chính người đó), và một người có phiên nhưng không thuộc không gian làm việc, When gọi thẳng máy chủ bảy thao tác đổi trường (tạo, sửa, xếp lại, lưu trữ, khôi phục, xoá, điền bù), Then cả bảy trả 403 với thông điệp «không đủ quyền» của khu Trường, và cơ sở dữ liệu không đổi gì (trường không được tạo, nhãn không đổi, thứ tự không đổi, trạng thái lưu trữ không đổi, hàng không bị xoá, không việc điền bù nào được xếp hàng).
- AC-3: Given một tài khoản `admin` và một tài khoản `owner` (bằng phiên), và khoá API của `admin`, When mỗi lối gọi đủ bảy thao tác đổi trường, Then cả bảy thành công như trước vòng này.
- AC-4: Given một tài khoản `member`, When gọi các thao tác đọc (danh sách trường, một trường theo khoá, trường lọc được, độ phủ của một trường), Then cả bốn thành công như trước.
- AC-5: Given bốn tài khoản — `owner`, `admin`, `member`, và một người đăng nhập được nhưng không thuộc không gian làm việc — When hỏi `fields.access`, Then `canManage` lần lượt là true, true, false, false.
- AC-6: Given một thành viên thường mở Cài đặt › Trường, When màn tải xong, Then danh sách trường vẫn hiện đủ; có dòng «Cần quyền quản trị để đổi trường của cả đội.»; các nút «Trường mới», «Thêm» của trường gợi ý, kéo xếp, menu của dòng và «Khôi phục» đều khoá; bấm một dòng không mở ô sửa; mở thẳng đường `?field=new` hay `?field=<khoá>` không hiện ô sửa. Given một quản trị, When mở cùng màn, Then không có dòng khoá và mọi nút trên bấm được. Nửa máy chủ của lời hứa này là AC-2 và AC-5; ảnh thật ở AC-9.
- AC-7: Given một thành viên thường mở bảng Trường từ hồ sơ một bản ghi, When bảng tải xong, Then đúng các khoá của AC-6 áp ở đó; quản trị mở cùng bảng thì không khoá. Ảnh thật ở AC-9.
- AC-8: Given các hành vi của khu Trường đã giao ở `truong-tu-tao-o-cai-dat` (tạo, đổi kiểu bị chặn khi có dữ liệu, lưu trữ, khôi phục, xếp lại, lọc, điền bù…), When chạy lại bài kiểm `fields.spec.ts` với lời gọi mang tài khoản chủ, Then mọi khẳng định cũ vẫn đạt.
- AC-9: Given dữ liệu thật trên bàn đo, When chụp Cài đặt › Trường ở khổ 1440 và 768, và bảng Trường mở từ hồ sơ một công ty ở khổ 1440, cho một thành viên thường và một quản trị, Then nhìn thấy trên ảnh: bản thành viên có dòng khoá và các nút mờ, bản quản trị có nút sáng; ở khổ 768 không có gì tràn ngang.

## Coverage

Quét không gian tiêu chí bằng morphological-scan (preset entity-feature), ba trục:

- Trục vai trò: owner | admin | member | không thuộc không gian làm việc — cả bốn đặt trước bảy thao tác đổi (AC-2, AC-3) [thước CE: `WORKSPACE_ROLES` trong `packages/auth/src/roles.ts` và `workspaceRoleOf` trả `null` khi không có hàng `member` — SUY-TỪ-REPO: packages/auth/src/organization.ts]
- Trục thao tác: 7 đổi (create · update · reorder · archive · restore · delete · backfill) | 4 đọc (list · byKey · filters · coverage) | access [thước CE: mọi `@Mutation`/`@Query` của `apps/api/src/fields/fields.router.ts` — SUY-TỪ-REPO; NGÀNH: HubSpot «Edit property settings» chỉ cấp cho super admin/người có quyền, Salesforce «Customize Application»]
- Trục lối vào: tRPC bằng phiên | tRPC bằng khoá API | REST | Cài đặt › Trường | bảng Trường từ hồ sơ [thước CE: mọi lời gọi bảy mutation của `trpc.fields` trong `apps/app` — `grep` ra đúng `field-editor.tsx` (create, update) và `fields-list.tsx` (reorder, archive, restore, create gợi ý), cả hai chỉ dựng trong hai màn trên; REST dùng lại đúng router và bộ dựng ngữ cảnh (`apps/api/src/create-app.ts:129-131`) nên không có ca riêng]

Core: AC-1 (vị từ), AC-2 (member × 7 đổi), AC-3 (admin/owner × 7), AC-4 (member × 4 đọc), AC-5 (access × 4 vai), AC-6/AC-7 (hai lối vào trên màn × hai vai), AC-8 (hồi quy), AC-9 (ảnh thật).

Later: áp quyền cho các router khác · mức vai trò «sửa nhưng không xoá».

Never: chỉ ẩn nút mà không chặn máy chủ — ẩn nút không phải phân quyền.

[GIẢ ĐỊNH] Tài khoản chủ kho dùng trên prod mang vai trò `owner` hoặc `admin` — ở dev nó là `member`. Chủ kho kiểm trên prod trước khi gộp; máy không đọc được prod.

## Out of scope

- Áp phân quyền cho 20 router khác đang chỉ có `AuthMiddleware`.
- Hệ vai trò nhiều mức, quyền theo thao tác hay theo bản ghi.
- Nhật ký ai đổi trường lúc nào.
- Đổi giá trị mặc định của `Member.role`, hay sửa vai trò dữ liệu trên prod.
- Quyền sửa giá trị trường trên một bản ghi (khác quyền sửa định nghĩa trường).

## Notes

- `canManageFields` là hàm mới trong `@crm/auth` (đường T3), cùng hình với `canManageCurrency` và năm vị từ anh em.
