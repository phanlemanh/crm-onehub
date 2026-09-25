---
schema_version: 1
feature: Chỉ chủ và quản trị đổi được khoá nghiên cứu, model của trợ lý và số ngày giữ mục đã lưu trữ — thành viên thường vẫn xem được, mọi đường đổi đều khoá cả trên màn lẫn khi gọi thẳng máy chủ, và không bị nhốt ở màn cắm khoá
slug: cai-dat-chung-chi-quan-tri
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-09-25
design_doc: docs/superpowers/specs/2026-09-25-cai-dat-chung-chi-quan-tri-design.md
---

# Acceptance Contract: cai-dat-chung-chi-quan-tri

## Context

Buổi soát giao diện Cài đặt (24/09) tìm ra `SettingsRouter` chỉ kiểm đã đăng nhập: một tài
khoản vai trò `member` thay được khoá Context.dev của cả workspace, đổi model của trợ lý và
đổi số ngày giữ mục đã lưu trữ (quyết lúc dữ liệu bị xoá hẳn) — qua tRPC lẫn REST. Chủ kho
chốt 25/09: cả ba chỉ `owner`/`admin`; cổng `/onboarding/research` chỉ đẩy `owner`/`admin`.
Vòng áp nếp phân quyền sẵn có (`@crm/auth` + service + khoá control), không dựng lớp mới.

## Criteria

- AC-1: Given `canManageWorkspaceSettings` trong `@crm/auth`, When hỏi với từng vai trò, Then `owner` và `admin` được, `member` và không có vai trò (`null`) không được, và ma trận phủ đủ mọi giá trị của `WORKSPACE_ROLES`.
- AC-2 (cross-layer): Given một tài khoản `member` (bằng phiên đăng nhập, và bằng khoá API của chính người đó) và một người có phiên nhưng không thuộc workspace, When gọi thẳng máy chủ ba thao tác đổi (`setResearchKey`, `setAgentModel`, `setArchiveRetention`) qua tRPC, và thành viên thường gọi cùng ba thao tác qua REST, Then cả mười hai ca trả 403 với thông điệp «không đủ quyền» của khu Cài đặt; cơ sở dữ liệu không đổi (khoá, model, số ngày giữ nguyên giá trị trước lời gọi); và không lời gọi nào tới bộ thử khoá, danh mục model hay việc xếp nghiên cứu chờ khoá.
- AC-3 (cross-layer): Given một tài khoản `admin` và một tài khoản `owner` (bằng phiên), và khoá API của `admin`, When mỗi lối gọi ba thao tác đổi qua tRPC, và quản trị gọi cùng ba thao tác qua REST, Then cả mười hai ca thành công như trước vòng này: giá trị mới nằm trong cơ sở dữ liệu, lưu khoá vẫn gọi bộ thử khoá và vẫn xếp nghiên cứu chờ khoá, và trả lời mang `canManage: true`.
- AC-4 (cross-layer): Given một tài khoản `member`, When gọi bốn thao tác đọc (`researchKey`, `agentModel`, `archiveRetention`, `modelCatalog`), Then cả bốn thành công như trước; `researchKey` vẫn chỉ trả khoá dạng che.
- AC-5 (cross-layer): Given bốn tài khoản — `owner`, `admin`, `member`, và một người có phiên nhưng không thuộc workspace — When hỏi `researchKey`, `agentModel`, `archiveRetention`, Then `canManage` ở cả ba lần lượt là true, true, false, false, không ca nào 500.
- AC-6 (cross-layer): Given workspace chưa có khoá nghiên cứu và đã đặt tên xong, When một người mà `settings.researchKey` trả `canManage: false` mở một trang trong ứng dụng, Then cổng không đẩy tới `/onboarding/research`; gõ thẳng `/onboarding/research` thì được chuyển về trang chính của workspace. When người có `canManage: true` mở cùng trang, Then vẫn bị đẩy tới `/onboarding/research` như hôm nay. When trả lời thiếu `canManage`, Then cổng coi là `settled`, không đẩy. Trả lời dùng để quyết là trả lời HTTP thật của máy chủ cho chính người đó, đọc bằng đúng hàm proxy dùng.
- AC-7: Given một thành viên thường mở Cài đặt › Chung, When màn tải xong, Then ba card khoá nghiên cứu, lưu trữ, model vẫn hiện giá trị hiện tại (trạng thái đã cắm/chưa cắm và khoá che, số ngày, model đang chạy); ô nhập khoá, nút lưu khoá, ô số ngày, nút lưu số ngày và nút chọn model đều `disabled` và trỏ `aria-describedby` tới một dòng lý do nằm trong cùng card. Given một quản trị, When mở cùng màn, Then không có dòng lý do nào ở ba card và các control trên bấm được như hôm nay.
- AC-8: Given các hành vi đã giao của cổng onboarding (đặt tên trước, khoá sau, không tự lặp vào chính nó, API không đọc được thì `unknown`), When chạy lại `apps/app/test/onboarding-gate.spec.ts` với bộ dựng trả lời mang `canManage: true`, Then mọi khẳng định cũ vẫn đạt, và không dòng `expect` hay `it(` cũ nào bị xoá hoặc sửa.
- AC-9: Given dữ liệu thật trên bàn đo, When chụp Cài đặt › Chung ở khổ 1440 và 768 cho một thành viên thường và một quản trị, Then nhìn thấy trên ảnh: bản thành viên có dòng lý do ở cả ba card và control mờ; bản quản trị không có dòng đó và control sáng; khổ 768 không có gì tràn ngang.

## Coverage

Quét không gian tiêu chí bằng morphological-scan (preset entity-feature), ba trục cộng một lớp cắt ngang:

- Trục vai trò: owner | admin | member | có phiên nhưng không thuộc workspace [thước CE: `WORKSPACE_ROLES` trong `packages/auth/src/roles.ts`, `workspaceRoleOf` trả `null` khi không có hàng `member` — SUY-TỪ-REPO: packages/auth/src/organization.ts]
- Trục thao tác: 3 đổi (setResearchKey · setAgentModel · setArchiveRetention) | 4 đọc (researchKey · agentModel · archiveRetention · modelCatalog) [thước CE: mọi `@Mutation`/`@Query` của `apps/api/src/settings/settings.router.ts` — SUY-TỪ-REPO; NGÀNH: HubSpot giới hạn «account defaults» cho super admin/quyền Account Access, Salesforce giới hạn Setup cho quyền «Customize Application»]
- Trục lối vào: tRPC bằng phiên | tRPC bằng khoá API | REST | Cài đặt › Chung | `/onboarding/research` qua cổng proxy [thước CE: mọi lời gọi `trpc.settings.set*` trong `apps/app` — `grep` ra đúng `research-key.tsx`, `agent-model.tsx`, `archive-retention.tsx`, `onboarding/research/research-form.tsx`; REST là cầu `createOpenApiExpressMiddleware` trên cùng `appRouter` ở `apps/api/src/create-app.ts` — đo riêng ba ca mỗi phía vì bộ dựng ngữ cảnh khác lối tRPC]
- Cắt ngang mọi ô «đổi bị từ chối»: không ghi DB · không gọi bộ thử khoá · không đọc danh mục model · không xếp nghiên cứu chờ khoá [thước CE: các lời gọi trong `apps/api/src/settings/settings.service.ts` — SUY-TỪ-REPO]

Core: AC-1 (vị từ), AC-2 (member/không thuộc × 3 đổi × không hiệu ứng phụ), AC-3 (admin/owner × 3 đổi), AC-4 (member × 4 đọc), AC-5 (cờ × 4 vai), AC-6 (cổng onboarding × 2 vai + trả lời thiếu cờ + trả lời thật qua hàm đọc chung), AC-7 (màn × 2 vai), AC-8 (hồi quy cổng), AC-9 (ảnh thật).

Later: nhật ký ai đổi cài đặt · quyền nhiều mức theo từng cài đặt · áp quyền cho các router khác.

Never: chỉ khoá nút mà không chặn máy chủ — khoá nút không phải phân quyền.

[GIẢ ĐỊNH] Tài khoản chủ kho dùng trên prod mang vai trò `owner` hoặc `admin`. Nếu không, sau khi gộp chủ kho sẽ không đổi được ba cài đặt này; chủ kho kiểm trên prod trước khi gộp, máy không đọc được prod.

## Out of scope

- Áp phân quyền cho các router khác đang chỉ có `AuthMiddleware`.
- Nhật ký ai đổi cài đặt lúc nào.
- Hệ vai trò nhiều mức hay quyền riêng cho từng cài đặt.
- Thêm `aria-describedby` cho `workspace-form.tsx` và các card cũ khác.
- Đổi giá trị mặc định của `Member.role` hay sửa vai trò dữ liệu trên prod.

## Notes

- `canManageWorkspaceSettings` là hàm mới trong `@crm/auth` (đường T3), cùng hình với `canManageFields` và tám vị từ anh em.
- Không có `opportunity.md` — vòng đi thẳng từ buổi soát, không có ngưỡng nghiệm thu, nên không có mục Đường đo.
