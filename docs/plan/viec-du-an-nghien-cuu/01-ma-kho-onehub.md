# Mã kho OneHub CRM — việc, kế hoạch, bảng cột, phân quyền
Ngày tra: 2026-10-05 · Số lượt WebSearch đã dùng: 0 (chỉ đọc mã kho)

Bản đọc: `origin/onehub` tại `e0b08ccd7` (2026-10-05 17:54, gộp PR #267). Mọi
đường dẫn dưới đây là đường trong kho `/Users/manhphan/dev/crm` trên bản đó, đọc
bằng `git show "origin/onehub:<đường>"` — không đọc cây làm việc (nhánh cũ).
`schema.prisma` = `packages/db/prisma/schema.prisma`.

**Tài liệu trong bảng chỉ mục của `AGENTS.md` đã đọc:** `docs/api.md` (trước khi đọc
`apps/api`), `docs/agent.md` (trước khi đọc `apps/agent`), `docs/telemetry.md`. Không
đọc `docs/design.md`/`docs/chat-ui.md`/`docs/agent-panel.md` vì không chạm giao diện;
không đọc skill nào trong `.agents/skills/` vì việc này chỉ đọc, không viết mã.

---

## Bảng chấm

Thang của `00-khung.md`. Một cột: OneHub hôm nay. Ô chấm cho **việc** (task) theo
nghĩa của khung; nơi năng lực chỉ có ở một trong ba loại việc-giống, ghi rõ loại nào.
Viết tắt: **HĐ** = hoạt động loại TASK (`Activity`), **B** = bước kế hoạch 30 ngày
(`OnboardingStep`), **VK** = việc (KR) (`OkrViecKr`).

| Mã | OneHub | Dẫn chứng |
| --- | --- | --- |
| A1 | **Y** — ba loại việc tách rời; chỉ HĐ gắn được công ty/cá nhân/thoả thuận/kế hoạch; B chỉ ở kế hoạch, VK chỉ ở KR | `schema.prisma:1262-1301`, `:1961-1985`, `:2706-2731` |
| A2 | **Y** — HĐ mang đồng thời `companyId`, `contactId`, `dealId`, `planId` (một mỗi loại), công ty tự suy từ deal/cá nhân | `schema.prisma:1272-1281`; `apps/api/src/activities/activities.service.ts:156-171` |
| A3 | **–** — không việc con; «bước có việc con» mới là lượt 4 chưa mở | `docs/plan/lo-trinh-dieu-phoi-30-ngay.md:238-262` |
| A4 | **–** | không trường lặp ở cả ba bảng (`schema.prisma:1262`, `:1961`, `:2706`) |
| A5 | **Y** — `ActivityType` cố định (NOTE/CALL/EMAIL/MEETING/TASK…), không cấu hình; TASK là một loại | `schema.prisma:237-246`; `apps/api/src/activities/activities.contracts.ts:5-11` |
| A6 | **Y** — chỉ xong/chưa (`completedAt`, `xongLuc`); không trạng thái nhiều nấc | `schema.prisma:1270`, `:1974`, `:2715` |
| A7 | **–** — không ưu tiên, không nhãn; nhãn tự do bị đưa vào Never | `docs/plan/lo-trinh-dieu-phoi-30-ngay.md:315-324` |
| A8 | **–** — trường tuỳ biến chỉ cho COMPANY/CONTACT/DEAL | `schema.prisma:1089-1093` |
| A9 | **–** | — |
| A10 | **Y** — HĐ không có người làm (chỉ `createdById`); B một người được giao + người cầm trịch + người theo dõi; VK một người làm | `schema.prisma:1281`, `:1970`, `:1855-1856`, `:1873-1883`, `:2712` |
| A11 | **–** — việc không có bình luận/đính kèm; bình luận + @nhắc tên chỉ có ở mục tiêu OKR | `schema.prisma:2233-2257` (`OkrComment`, `OkrMention`) |
| A12 | **–** — giờ công nằm ở «Chân trời» | `docs/plan/lo-trinh-dieu-phoi-30-ngay.md:278-285` |
| A13 | **Y** — B có vết (`PLAN_CHANGE`), VK có vết (`OkrTrail` them-viec/sua-viec/xong-viec); HĐ không có lịch sử | `apps/api/src/onboarding/onboarding-ghi.ts:129-144`; `apps/api/src/okr/okr-canh-kr.service.ts:265-272`, `:368-375`, `:394-401` |
| B1 | **Y** — Tổng quan gom bước của tôi + HĐ quá hạn + kế hoạch cần để ý + tài liệu chờ duyệt; thẻ «Việc của bạn» OKR riêng; không trang «việc của tôi» chung; `activities.myTasks` có API mà không màn nào dùng | `apps/api/src/dashboard/dashboard.service.ts:155-172`, `:300-342`; `apps/api/src/activities/activities.router.ts:56-58`; `apps/app/lib/trpc/cache.ts:81` |
| B2 | **–** | — |
| B3 | **Y** — nhắc buổi sáng qua Zalo/Slack, trả lời «xong n» trên Zalo — nhưng **chỉ cho B** (và mục OKR); HĐ và VK không có nhắc | `packages/db/src/onboarding-nhac.ts:12-17`, `:369-402`; `docs/agent.md:289-337`, `:484-496` |
| B4 | **–** cho việc — góc nhìn lưu (`SavedView`, có cờ `shared`) chỉ cho công ty/cá nhân/thoả thuận | `schema.prisma:1188-1206` |
| B5 | **–** — lịch Google/Outlook chỉ kéo cuộc họp vào, không đẩy việc ra | `docs/api.md` mục «Two mail providers»; `schema.prisma:1387` |
| B6 | **Y** — giao B và VK cho người khác được; HĐ không giao được; không uỷ quyền khi vắng | `apps/api/src/onboarding/onboarding-ghi.ts:172-205`; `packages/validation/src/okr-canh-kr.ts:37-50` |
| C1 | **Đ** — `OnboardingPlan` là bản ghi riêng, mở như khung bản ghi | `schema.prisma:1843-1871`; `apps/app/components/crm/record-sheet/record-stack.ts:17-23` |
| C2 | **Đ** — khuôn kế hoạch: bước có phòng ban + `offsetDays` (hạn tương đối); sửa khuôn chỉ quản trị | `packages/validation/src/onboarding-template.ts:6-11`; `apps/api/src/onboarding/onboarding.router.ts:113-165` |
| C3 | **Đ** — danh mục 30 ngày: bước xong, ngày im, bước đang tắc; «kế hoạch im», «mốc ngày» | `apps/api/src/onboarding/onboarding.contracts.ts:222-243`; `packages/db/src/onboarding-nhac.ts:254-293` |
| C4 | **Đ** — kế hoạch treo vào công ty (không vào thoả thuận) | `schema.prisma:1845-1846` |
| C5 | **–** — kế hoạch chỉ tạo tay từ khuôn; không có luật «thoả thuận chốt → tạo kế hoạch» | `apps/api/src/onboarding/onboarding.service.ts:340-379` (chỗ tạo duy nhất) |
| C6 | **–** — cổng cho đối tác ở «Chân trời» | `docs/plan/lo-trinh-dieu-phoi-30-ngay.md:278-285` |
| D1 | **Y** — bảng cột kéo thả cho **thoả thuận** theo giai đoạn; bảng cột kế hoạch 30 ngày chỉ xem; không có bảng cột cho việc | `apps/app/app/(app)/[slug]/deals/deals-board.tsx`; `apps/app/app/(app)/[slug]/onboarding/danh-muc-bang-cot.tsx:96`; `packages/ui/src/components/board.tsx:44` |
| D2 | **Y** — bảng kế hoạch chia theo bước/bộ phận/bậc/trạng thái/người giao (chỉ xem) | `apps/api/src/onboarding/onboarding.contracts.ts:360-371` |
| D3 | **–** | — |
| D4 | **–** | — |
| D5 | **Y** — kéo thoả thuận sang cột chốt bắt mở hộp lý do | `apps/app/app/(app)/[slug]/deals/use-deal-board-move.ts:19-22`, `:115-145` |
| E1 | **–** — không ngày bắt đầu (cố ý: Never) | `docs/plan/lo-trinh-dieu-phoi-30-ngay.md:315-324` |
| E2 | **–** — `dependsOnStepId` chỉ là dự kiến lượt 4 | `docs/plan/lo-trinh-dieu-phoi-30-ngay.md:254-257` |
| E3 | **–** | — |
| E4 | **–** | — |
| E5 | **–** | — |
| E6 | **Y** — «mốc ngày» 7/14/30 của kế hoạch; KR kiểu mốc; không mốc trên việc | `packages/db/src/onboarding-nhac.ts:49-57`; `CONTEXT.md:220`, `:461` |
| E7 | **–** — chỉ có múi giờ VN cố định và khoảng nghỉ của chu kỳ OKR | `packages/db/src/onboarding-nhac.ts:52`; `schema.prisma:2021-2022` |
| E8 | **–** | — |
| F1 | **Y** — Tác nhân bắt sự kiện `deal.stage.changed`/`deal.closed` rồi tạo HĐ TASK bằng AI; không có luật tất định | `packages/db/src/crm-events.ts:9-40`; `apps/agent/agent/subagents/agent_runner/tools/create_crm_activity.ts:6-23` |
| F2 | **–** — Chiến dịch là danh sách gọi, không phải chuỗi bước | `schema.prisma:1208-1237` |
| F3 | **Y** — kịch bản gọi trên chiến dịch (`script`); gợi ý trong nhắc kế hoạch im | `schema.prisma:1213`; `packages/db/src/onboarding-nhac.ts:224-235` |
| F4 | **Y** — Trợ lý OKR góp ý mục tiêu/KR; không AI tạo việc từ thư/cuộc họp | `docs/agent.md` mục «Two lanes» (okr-de-xuat); `apps/agent/agent/lib/accounts.ts:541-572` (chỉ đọc HĐ) |
| F5 | **Y** — Tác nhân chạy theo mốc kích hoạt, ghi HĐ qua `AgentAction` có idempotency; không «giao việc cho AI» | `apps/agent/agent/lib/run-runtime.ts:230-330`; `schema.prisma:931-967` |
| G1 | **Y** — bốn vai cố định (owner/admin/member/okr) + bốn phạm vi dữ liệu; không hồ sơ quyền theo đối tượng | `packages/validation/src/vai-workspace.ts:1-43`; `apps/api/src/trpc/middlewares/pham-vi-du-lieu.middleware.ts` |
| G2 | **Y** — dữ liệu đối tác: ai trong phạm vi cũng thấy hết, `ownerId` chỉ là bộ lọc; OKR có phạm vi theo trưởng đơn vị | `apps/api/src/deals/deals.service.ts:906-919`; `docs/api.md:538-547` |
| G3 | **Đ** — VK kế thừa đúng luật xem của mục tiêu (`dieuKienXemMucTieu`); HĐ kế thừa phạm vi «đối tác» (mà phạm vi đó mở cho mọi vai trừ okr) | `apps/api/src/okr/okr-canh-kr.service.ts:151-159`; `docs/api.md:548-560` |
| G4 | **Y** — người xem đích danh cho mục tiêu giới hạn (tối đa N); góc nhìn chia sẻ | `schema.prisma:2804-2816`, `:1192` |
| G5 | **–** | `schema.prisma:1108-1135` (không cột quyền) |
| G6 | **–** — HĐ không có cờ riêng tư | `schema.prisma:1262-1301` |
| G7 | **Đ** — vai «chỉ OKR» chặn ở tRPC, REST, khoá API, tác tử; không có khách ngoài | `apps/api/src/trpc/middlewares/auth.middleware.ts:38-48`; `apps/agent/agent/lib/thanh-vien-principal.ts:21`; `CONTEXT.md:714-736` |
| G8 | **Đ** — «Chuyển việc 30 ngày» (kế hoạch + bước) và chuyển OKR (mục tiêu + KR + VK), quản trị làm, có vết; HĐ không chuyển | `apps/api/src/onboarding/onboarding-ghi.ts:389-470`; `apps/api/src/okr/okr-trao-doi.service.ts:291-379` |
| G9 | **Y** — vết riêng từng khu (`OkrTrail`, vết kế hoạch, `AgentAuditEvent`), log mỗi lời gọi kèm vai/phạm vi; không nhật ký chung | `schema.prisma:2179-2195`, `:969-996`; `docs/api.md:254-259` |
| H1 | **Đ** — VK + «sáng kiến» gắn chiến dịch hay kế hoạch 30 ngày vào KR | `schema.prisma:2706-2731`; `apps/api/src/okr/okr-canh-kr.service.ts:277-344` |
| H2 | **Y** — VK cố ý không góp tiến độ; KR lấy số tự động từ chỉ số CRM, trong đó có `buoc-xong-dung-han` (bước 30 ngày xong đúng hạn) | `CONTEXT.md:628-634`; `packages/db/src/okr-chi-so-danh-muc.ts:47-53` |
| H3 | **–** — màn Cập nhật tuần không nhắc tới việc | `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx` (không có «viec») |
| I1 | **Y** — 10 HĐ quá hạn trên Tổng quan, phạm vi «tôi» lọc theo người tạo; không báo cáo theo người | `apps/api/src/dashboard/dashboard.service.ts:155-172` |
| I2 | **Đ** — danh mục 30 ngày + Toàn cảnh/Sức khoẻ OKR | `apps/api/src/onboarding/onboarding.service.ts:399-455`; `apps/app/app/(app)/[slug]/okr/toan-canh/` |
| J1 | **Đ** — mọi thủ tục tRPC có REST + OpenAPI, khoá API; không webhook ra cho việc | `apps/api/src/activities/activities.router.ts:38-82`; `apps/api/src/onboarding/onboarding.router.ts:252-321`; `docs/api.md` mục «The OpenAPI document» |
| J2 | **Y** — không ứng dụng di động; Zalo là kênh di động (nhắc, «xong n», hỏi CRM) | `docs/agent.md:443-496` |
| J3 | **–** cho việc — nhập/xuất chỉ có OKR và cây tổ chức | `apps/api/src/okr/okr.router.ts:806`, `:1163-1175`; `apps/api/src/to-chuc/to-chuc.router.ts:279-292` |

---

## OneHub: cách đang quy hoạch việc

### 1. Bản đồ mọi «việc-giống» trong kho

| Thứ | Trường chính | Ai tạo | Ai thấy | Hiện ở màn nào | Nhắc gì |
| --- | --- | --- | --- | --- | --- |
| **Hoạt động TASK** (`Activity`, `schema.prisma:1262-1301`) | `type`, `subject` (bắt buộc với TASK), `body`, `dueAt`, `completedAt`, `companyId?`, `contactId?`, `dealId?`, `planId?`, `createdById`, `meta` — **không người làm, không sửa, không xoá** (router chỉ có `timeline`, `timelineCounts`, `myTasks`, `create`, `complete`: `activities.router.ts:38-82`) | Người dùng ở ô soạn dòng thời gian (`apps/app/components/crm/timeline/activity-composer.tsx:31-87`); Tác nhân qua `create_crm_activity` (đứng tên người khởi chạy, `run-runtime.ts:330`) | Mọi vai có phạm vi «đối tác» (`activities.router.ts:29`); `complete` không kiểm tác giả — ai cũng đánh dấu xong được việc của người khác (`activities.service.ts:190-211`) | Tab Hoạt động của khung công ty / cá nhân / thoả thuận / kế hoạch (`record-sheet/{company,contact,deal,plan}-sheet.tsx`); Tổng quan «việc quá hạn» (`dashboard.service.ts:155-172`) | **Không nhắc.** Không vào nhắc buổi sáng |
| **Bước kế hoạch 30 ngày** (`OnboardingStep`, `schema.prisma:1961-1985`) | `label`, `departmentId` (bắt buộc), `assigneeId?`, `dueAt` (bắt buộc), `completedAt`, `position` | Chép từ khuôn khi tạo kế hoạch (`onboarding.service.ts:340-379`); thêm/bớt/sắp/đổi hạn/giao tay (`onboarding-ghi.ts:172-333`) — mọi thành viên phạm vi đối tác; khuôn chỉ quản trị | Phạm vi «đối tác» | Màn 30 ngày đầu (danh mục, bảng cột chỉ xem), khung kế hoạch, Tổng quan «bước của tôi» (`dashboard.service.ts:314-342`) | Nhắc buổi sáng Zalo/Slack: bước quá hạn, sắp hạn (≤3 ngày) cho người được giao; kế hoạch im (≥7 ngày), mốc 7/14/30 cho người cầm trịch + người theo dõi (`onboarding-nhac.ts:237-309`); trả lời «xong n» trên Zalo (`docs/agent.md:484-496`) |
| **Việc (KR)** (`OkrViecKr`, `schema.prisma:2706-2731`) | `keyResultId`, `loai` (viec / chien-dich / ke-hoach), `tieuDe`, `nguoiLamUserId`, `hanNgay` (ngày), `xongLuc`, `campaignId?`, `planId?`, `taoBoiUserId`, `position` | Người sửa được KR (chủ KR hoặc trưởng đơn vị) — `okr-canh-kr.service.ts:240-275`; gắn sáng kiến cần thêm phạm vi đối tác (`:285`) | Theo luật xem mục tiêu (`dieuKienXemMucTieu`, `okr-canh-kr.service.ts:151-159`); vai okr thấy «một chiến dịch/một kế hoạch» không tên (`apps/api/src/okr/canh-kr.ts:113-118`) | Khung KR, danh sách «Việc và sáng kiến» (`apps/app/components/crm/record-sheet/kr-viec.tsx`) | **Không nhắc.** («okr-duoc-giao» là được giao KR/mục tiêu, không phải VK — `packages/db/src/okr-nhac.ts:346-376`) |
| **Nhắc buổi sáng** (`AgentTask` kind `nhac-ke-hoach`, `schema.prisma:547-579`, `packages/db/src/agent-tasks.ts:14`) | `subject = user:<id>:<ngày VN>`, `payload` chỉ mã + loại; một hàng mỗi người mỗi ngày (`:573`) | Máy (`lenLichNhac` trên nhịp dispatch) | Người nhận qua Zalo/Slack | Không màn | Đây *là* cơ chế nhắc, không phải việc người dùng |
| **HĐ do Tác nhân tạo** | như HĐ + `meta.source = "agent"`, `agentId`, `runId`, `actionId` (`run-runtime.ts:317-336`) | Tác nhân, chỉ khi bản đã duyệt cho phép đúng loại (NOTE/TASK) và đúng bản ghi (`run-runtime.ts:255-260`) | Như HĐ | Như HĐ | Không |
| **`AgentAction`** (`schema.prisma:931-967`) | `type`, `targetType/Id`, `summary`, `status` PLANNED→SUCCEEDED/FAILED | Tác nhân | Màn lịch sử tác nhân | `apps/app/components/agent-builder/agent-history.tsx` | «Chờ duyệt» là trạng thái của **lượt chạy** (`AgentRunStatus.WAITING_FOR_APPROVAL`, `schema.prisma:317-324`), không phải hàng đợi việc duyệt theo từng hành động |
| **`AgentTask`** khác | hàng đợi nội bộ của tác tử (brand, portrait, okr-de-xuat…) | Máy | — | — | Không phải việc người dùng |

Ghi chú từ điển: «việc cần làm» là chữ đang dành cho HĐ TASK trên dòng thời gian —
`CONTEXT.md:156-157` và `:261-262` cấm dùng nó cho bước và gợi ý; «Việc (KR)» là
mục riêng (`CONTEXT.md:628-634`). Ba chữ cho ba thứ, cố ý.

### 2. Phân quyền hiện có

**Mô hình:** một workspace duy nhất, không phải ranh giới thuê bao — không
`organizationId` trên bản ghi CRM (`docs/api.md:41-48`). Vai nằm ở cột
`member.role` của plugin `organization` của better-auth (`schema.prisma:1675-1688`),
bốn giá trị `owner · admin · member · okr` (`packages/validation/src/vai-workspace.ts:1`);
vai lạ rơi về `member` (`:24-26`). Ai được vào do bảng `invitation` quyết
(`docs/api.md` mục «One organization»).

**Hai lớp kiểm:**

1. *Phạm vi dữ liệu theo router.* Mỗi router chọn một lớp middleware:
   `PhamViDoiTacMiddleware` (contacts, companies, deals, campaigns, activities,
   onboarding, search, dashboard, enrichment, savedViews, fields, google, microsoft,
   tracking, slack, agents, conversations, hoi-kho) · `PhamViToChucMiddleware` (org)
   · `PhamViOkrMiddleware` (okr) · `PhamViChungMiddleware` (users, settings, currency,
   zalo, apiKeys, sso, workspace, tai-lieu) — danh sách lấy từ
   `git grep UseMiddlewares` trên `apps/api/src/**/*.router.ts`; định nghĩa ở
   `apps/api/src/trpc/middlewares/pham-vi-du-lieu.middleware.ts`. `AuthMiddleware`
   đọc hàng `member` mỗi lời gọi, không cache, rồi `docDuocPhamVi(role, phamVi)`
   (`auth.middleware.ts:38-48`). Vai okr chỉ đọc `okr · chung · to-chuc`
   (`vai-workspace.ts:14-18`, `:32-39`). `AuthMiddleware` trần = phạm vi chưa khai →
   vai okr bị từ chối (đóng mặc định, `docs/api.md:242-253`). Danh sách thủ tục vai
   okr với tới được ghim trong `apps/api/test/vai-chi-okr.spec.ts`.
2. *Quyền thao tác trong service.* `isWorkspaceAdmin` = owner|admin
   (`packages/auth/src/roles.ts:16-18`); mọi `canManageX` (đổi vai, tiền tệ, kết nối,
   theo dõi web, **onboarding**, trường, tổ chức, cài đặt) đều là «quản trị»
   (`packages/auth/src/organization.ts:15-53`). Khuôn kế hoạch và chuyển việc cần
   quản trị (`onboarding.router.ts:113-165`, `onboarding-ghi.ts:157-161`); thêm/giao/
   xong bước thì mọi thành viên phạm vi đối tác.

**Dữ liệu đối tác không có phạm vi theo chủ sở hữu.** `ownerId` trên công ty, cá
nhân, thoả thuận chỉ là bộ lọc người chọn (`deals.service.ts:906-919`,
`ownerFilter`) và facet; Tổng quan «của tôi» lọc theo `ownerId`/`createdById`
(`dashboard.service.ts:56-57`, `:160`) — để xem cho gọn, không để chặn. Ai trong
phạm vi đối tác thấy và sửa mọi bản ghi.

**Cây tổ chức** (`docs/api.md:446-520`): `Division` → `Department` hai cấp
(`schema.prisma:1753-1797`), trưởng đơn vị `headUserId`; mỗi người một
`OrgPlacement` (phòng ban chính, quản lý ghi đè, chức danh — `:1799-1814`) + phòng
ban phụ (`OrgSecondaryDepartment`, `:1816-1826`). Quản lý trực tiếp suy ra, không
lưu (`docs/api.md:465-469`). Mọi ghi `org.*` cần `canManageOrganization`. Cây này
**chỉ OKR dùng để phân quyền** (`OkrAccessService`, `docs/api.md:538-547`); bước kế
hoạch chỉ dùng phòng ban làm nhãn.

**Quyền OKR** (`docs/api.md:533-640`): sửa theo bản ghi — trưởng phòng sửa mục tiêu
phòng, trưởng bộ phận sửa cả bộ phận, người tự sửa mục tiêu cá nhân, chủ KR sửa KR
(`apps/api/src/okr/okr-access.service.ts:165-196`). Xem: `hienThi` công khai / giới hạn
(`schema.prisma:2085`); mục tiêu giới hạn thấy được bởi quản trị, chủ, người của mục
tiêu cá nhân, chủ KR, **người làm VK dưới KR của nó**, người tham gia, người xem
đích danh (`OkrNguoiXem`, `schema.prisma:2804-2816`) và người sửa được đơn vị
(`packages/validation/src/okr-hien-thi.ts:50-62`). Một điều kiện Prisma
`dieuKienXemMucTieu` phủ mục tiêu và bảy bảng con, kể cả `okrViecKr`; id không thấy
trả cùng câu như id không có.

**Vai «chỉ OKR» được chặn ở đâu:** tRPC (trên), proxy eve của app
(`apps/app/app/eve/v1/[...path]/route.ts:35`), principal của tác tử
(`apps/agent/agent/lib/thanh-vien-principal.ts:21`), trả lời «xong n» qua Zalo
(`apps/agent/agent/lib/tra-loi-nhac.ts:55`), người nhận Slack
(`apps/agent/agent/lib/slack-nguoi-nhan.ts:142`), khung điều hướng ẩn
`/companies /contacts /deals /campaigns /onboarding /chat /agents`
(`apps/app/lib/pham-vi-man.ts:12-20`), Tổng quan riêng
(`apps/app/app/(app)/[slug]/page.tsx:46`). Trong OKR: sáng kiến hiện không tên
(`apps/api/src/okr/canh-kr.ts:113-118`), không gắn được sáng kiến
(`okr-canh-kr.service.ts:285`).

### 3. Thông báo

- **Không có bảng thông báo, không chuông trong app** — cố ý (`CONTEXT.md:231-237`:
  «kho không có bảng thông báo»).
- `NotificationChannel` = `AUTO | ZALO | SLACK` (`schema.prisma:1886-1890`);
  `NotificationPreference` một hàng mỗi người: `channel`, `dongTroLyOkr`
  (`:1950-1958`). Chọn kênh bằng hàm thuần `chonKenh`/`kenhSeDungCua`
  (`packages/db/src/kenh-thong-bao.ts:4-55`), trang «Nhắc buổi sáng» đọc cùng hàm
  (`apps/app/app/(app)/[slug]/reminders/page.tsx`).
- **Một tin mỗi người mỗi sáng 08:30 giờ VN**, gom: bước quá hạn/sắp hạn, kế hoạch
  im, mốc ngày, 10 loại mục OKR (cập nhật tuần, chờ duyệt, bị trả lại, KR im, được
  giao, nhắc tên, ghi nhận, theo dõi, hỏi ý), tài liệu chờ duyệt, tóm tắt tuần, trần
  AI (`packages/db/src/onboarding-nhac.ts:21-43`, `:369-402`). Trần 10 dòng
  (`:56`). Zalo lỗi thì ném, không rơi sang Slack (`docs/agent.md:326-329`).
- **Zalo:** nối bằng mã 6 số (`ZaloLink`, `schema.prisma:1892-1901`), trả lời «xong n»
  đánh dấu bước xong cùng thủ tục với màn (`docs/agent.md:484-496`), hỏi CRM qua
  Zalo (`ZaloHoi`, `:1931-1948`).
- **Email:** chỉ thư giao dịch xác thực (đặt lại mật khẩu) qua Resend
  (`packages/auth/src/thu.ts`; `docs/api.md:30-36`). Không email nhắc việc.
- **Việc nào có kênh nhắc:** chỉ **B**. HĐ TASK và VK **không có nhắc nào**; HĐ chỉ
  hiện lại trên Tổng quan khi đã quá hạn.

### 4. Điểm nối cho một loại «Việc» chung

**Bảng việc phải gắn vào** (đều đã có quan hệ ngược từ một trong ba loại):
`Company`, `Contact`, `Deal` (HĐ hôm nay), `OnboardingPlan` (HĐ `planId` + bước),
`OkrKeyResult` (VK), gián tiếp `OkrObjective`, `Campaign` (VK loại chiến dịch,
`schema.prisma:1228`), `Department` (bước bắt buộc phòng ban). Ứng viên thêm:
`TaiLieuTrang` (tài liệu chờ duyệt đang là mục nhắc), `AgentRun` (nguồn).

**Màn sẽ hiện việc:** tab Hoạt động của bốn khung bản ghi (dùng chung
`components/crm/timeline/*`); khung KR (`kr-viec.tsx`); khung kế hoạch + danh mục +
bảng cột 30 ngày; Tổng quan (`dashboard.service.ts:300-342`), Tổng quan vai okr
(`tong-quan-chi-okr.tsx`); thẻ «Việc của bạn» OKR (`okr/viec-cua-toi.tsx`, đọc
`okr.viecCuaToi` → `viecCanNhac`, `okr-trao-doi.service.ts:272-284`); tin nhắc
Zalo/Slack. Khung bản ghi đã có loại `plan`, `objective`, `kr` cạnh ba thực thể
(`record-stack.ts:17-23`) — chỗ cắm khung «việc».

**Lõi nhắc dùng chung:** `viecCanNhac` (`packages/db/src/onboarding-nhac.ts:369`) đã là
bộ gom «việc của tôi» đa nguồn, với `THU_TU_NHAC` có kiểm đủ ở kiểu
(`:21-47`) và hai cửa sổ `buoi-sang` / `truc-tiep`. Một loại việc chung cắm vào đây
là có ngay nhắc Zalo/Slack + Tổng quan.

**Chuyển giao khi nghỉ:** hai hộp đã có (`onboarding-ghi.ts:389-470`,
`okr-trao-doi.service.ts:291-379`) — việc chung phải vào cùng hộp «Chuyển việc».

**Tác tử AI:** `create_crm_activity` (NOTE/TASK trên company/contact/deal, qua manifest
đã duyệt + `AgentAction` idempotent — `run-runtime.ts:230-330`;
`packages/validation/src/agent-manifest.ts:32`); sự kiện kích hoạt chỉ có sáu loại,
không có sự kiện nào về việc (`packages/db/src/crm-events.ts:9-40`). Trí khôn phải ở
`apps/agent`, API chỉ ghi `AgentTask` (`docs/api.md:22-36`).

**Telemetry:** chỉ đếm gộp phía máy chủ; `activities_by_type` đã đếm HĐ theo loại
(`docs/telemetry.md:157-160`), `tasks_*` là `AgentTask` (`:120`). Thêm thuộc tính mới
phải vào `ALLOWED_PROPERTIES` (`docs/telemetry.md:325-330`). Số đo sản phẩm thật của
kho này đi qua **vết** (`buoc.xong`, `OkrTrail`) và thước nghiệm thu, không qua
telemetry (`docs/plan/lo-trinh-dieu-phoi-30-ngay.md:45-52`).

### 5. Từ điển và kế hoạch đụng việc / dự án

**`CONTEXT.md`:** Kế hoạch 30 ngày (`:145-151`, *Avoid* «dự án» — «gợi một thứ có ngân
sách và nghiệm thu»), Bước (`:153-158`, *Avoid* «task, việc cần làm, nhiệm vụ»), Người
cầm trịch (`:160`), Người được giao (`:167`), Chuyển việc 30 ngày (`:174`), Kế hoạch im
(`:214`), Mốc ngày (`:220`), Theo dõi (kế hoạch) (`:225`), Nhắc buổi sáng (`:231`),
Gợi ý (`:259`), Tác nhân (`:277`), Chiến dịch (`:299`), Khuôn kế hoạch (`:384`), Trưởng
đơn vị (`:373`), Việc (KR) (`:628-634`), Sáng kiến (KR) (`:636-643`, *Avoid* «dự án»),
Mức hiển thị (`:668`), Chuyển OKR (`:694`), Vai «chỉ OKR» (`:714`), Phạm vi dữ liệu
(`:726`). **Không có mục** «Việc cần làm» (HĐ TASK) riêng, không có «Dự án», «Bảng
cột», «Gantt» — chữ «dự án» đang bị cấm hai lần.

**`docs/plan/`:**
- `lo-trinh-dieu-phoi-30-ngay.md` — lượt 4 `buoc-co-viec-con` (việc con, phụ thuộc,
  đính kèm; mở khi có bằng chứng bước quá to, `:238-262`); Never: kéo thả bảng cột,
  nhãn tự do, ngày bắt đầu cho bước, tự động hoá kiểu Butler (`:315-324`); chân trời:
  cổng đối tác, giờ công (`:278-285`); cảnh báo người được giao mang vai okr không
  thấy việc của mình (`:41-43`); dữ liệu cá nhân theo Luật 91/2025 (`:334`).
- `lo-trinh-okr.md` — lượt 8 `canh-kr-okr` đẻ ra VK và sáng kiến (`:313-335`).
- `lo-trinh-zalo.md` — vòng 3 trả lời tin nhắc (`:217`).
- `tro-ly-okr-de-xuat-ban-giao.md` — không đụng mô hình việc (chữ «việc» ở đó là việc
  thi công).
- `crm-plan.md` — kế hoạch gốc của hãng; Tổng quan «overdue tasks» (`:387`).

### 6. Product Context

1. **Sản phẩm gì:** OneHub Center — CRM nội bộ của OneHub, quản quan hệ với mạng lưới
   công ty và cá nhân (giai đoạn đầu là môi giới), kèm điều phối 30 ngày đầu, OKR, kho
   tài liệu, tác nhân AI. [SUY-TỪ-REPO: `CONTEXT.md:3-22`, `:108`]
2. **Loại hình:** công cụ nội bộ một workspace (single-tenant), không bán ra ngoài;
   tách từ CRM mã nguồn mở `trycompai/crm`, tự triển khai trên Vercel + Postgres.
   [SUY-TỪ-REPO: `CONTEXT.md:14-15`; `docs/api.md:41-48`; `CLAUDE.md`]
3. **Actor & vai:** nhân viên quan hệ đối tác (member), quản trị (owner/admin), trưởng
   đơn vị (suy từ cây tổ chức), người ngoài khối kinh doanh (vai «chỉ OKR»); vai trò
   phi-người: Kara/Tác nhân. Đối tác không đăng nhập. [SUY-TỪ-REPO: `CONTEXT.md:81`,
   `:373`, `:714`, `:738`; `vai-workspace.ts:1`]
4. **Surface + kênh:** web app Next.js (desktop là chính), REST/OpenAPI + khoá API,
   nhắc buổi sáng qua Zalo bot hoặc Slack, hỏi CRM qua Zalo; không ứng dụng di động,
   không email nhắc. [SUY-TỪ-REPO: `docs/agent.md:289-337`, `:443-496`; `docs/api.md`
   mục OpenAPI]
5. **Thị trường & pháp lý:** Việt Nam, giờ `Asia/Ho_Chi_Minh` cố định, giao diện tiếng
   Việt; lĩnh vực tài chính – bất động sản. Dữ liệu cá nhân chịu Luật 91/2025/QH15 và
   Nghị định 356/2025; gửi dữ liệu tới mô hình AI ở nước ngoài là chuyển xuyên biên
   giới — đã chốt chỉ gửi nội dung OKR khi có ZDR. [SUY-TỪ-REPO:
   `packages/db/src/onboarding-nhac.ts:52`; `docs/plan/lo-trinh-dieu-phoi-30-ngay.md:334`;
   `docs/plan/kho-tai-lieu-viet-nam-va-do-luong.md:33`; `docs/plan/lo-trinh-okr.md:413`]
   Việc giao cho người ngoài OneHub không có tiền lệ trong kho. [GIẢ ĐỊNH]

---

## Mẫu thiết kế đáng học (từ chính kho)

- **Một bộ gom nhắc có kiểm đủ ở kiểu** (`THU_TU_NHAC` + `THU_TU_DU`,
  `onboarding-nhac.ts:21-47`): thêm loại việc mà quên thứ tự là lỗi biên dịch.
- **Nhắc đóng vòng ngay trong kênh**: «xong n» trên Zalo đi cùng thủ tục với màn, có
  vết `source: "zalo"` (`docs/agent.md:484-496`).
- **Quyền xem của con theo cha bằng một điều kiện Prisma dùng ở mọi lời đọc**
  (`dieuKienXemMucTieu`), có thước quét mã bắt lời đọc thiếu điều kiện
  (`docs/api.md:548-560`). Đúng mẫu cho G3 của việc chung.
- **Đóng mặc định theo phạm vi**: router chưa khai phạm vi thì vai okr bị chặn
  (`docs/api.md:242-253`).
- **Chuyển việc khi nghỉ: xem trước rồi làm, một giao dịch, mỗi dòng một vết**
  (`onboarding-ghi.ts:389-470`).
- **Khuôn với hạn tương đối + phòng ban** (`onboarding-template.ts:6-11`).

## Bẫy / điều nên tránh khi gộp việc

- **Rò dữ liệu đối tác sang vai «chỉ OKR».** Một việc chung gắn được cả KR lẫn
  thoả thuận/công ty sẽ nằm ở hai phạm vi cùng lúc. Bộ gom nhắc
  `viecCanNhac` **không lọc vai**: nó lấy kế hoạch theo `ownerId`/watch/assignee rồi
  chỉ kiểm «là thành viên» (`onboarding-nhac.ts:183-216`, `:373-381`); `thanhVien`
  khi giao bước cũng chỉ kiểm có hàng `member` (`onboarding-ghi.ts:105-119`). Hôm nay
  một người mang vai okr được giao bước sẽ nhận **tên công ty đối tác qua Zalo/Slack**
  dù màn chặn — kho đã ghi nỗi lo ngược chiều ở `lo-trinh-dieu-phoi-30-ngay.md:41-43`
  nhưng chưa có chặn. Việc chung phải: (a) đặt phạm vi theo **bản ghi cha**, không theo
  router; (b) lọc vai trong bộ gom nhắc và ở mọi chỗ chọn người làm; (c) với vai okr,
  hiện việc gắn bản ghi đối tác dạng «một việc ở thoả thuận», không tên — như
  `lienKetChoVai` (`canh-kr.ts:113-118`).
- **HĐ TASK hiện không có người làm và ai cũng đánh dấu xong được**
  (`schema.prisma:1281`, `activities.service.ts:190-211`). Gộp mà giữ ngữ nghĩa này là
  mở rộng một lỗ, không phải một tính năng.
- **Ba chữ đã chốt cho ba thứ** (bước / việc cần làm / việc (KR)) và «dự án» bị cấm
  hai lần trong từ điển — đổi mô hình mà không sửa `CONTEXT.md` trước là trái luật kho.
- **VK cố ý không góp tiến độ KR** (`CONTEXT.md:628-634`); tính tiến độ mục tiêu từ việc
  là quyết định ngược lại đã chốt ở Cổng Phạm vi.
- **Never đã ghi**: kéo thả bảng cột kế hoạch, nhãn tự do, ngày bắt đầu cho bước,
  automation kiểu Butler (`lo-trinh-dieu-phoi-30-ngay.md:315-324`) — khung «Kanban và
  Gantt là cách xem» va thẳng vào ba dòng này.
- **Đụng `packages/db/prisma` là đường T3** (`CLAUDE.md`); `Activity` cascade theo
  công ty/cá nhân/thoả thuận/kế hoạch (`schema.prisma:1275-1279`) — xoá hẳn bản ghi
  cha xoá luôn việc; `purge` phải tính lại `lastActivityAt` (`docs/api.md` mục
  «Deleting a record»).
- **Intelligence không ở API**: luật «thoả thuận chốt → tạo việc/kế hoạch» nếu tất
  định thì được ở API, nếu cần suy đoán thì phải đi `AgentTask` → tác tử
  (`docs/api.md:22-36`).

## Câu hỏi còn mở, khẳng định chưa xác minh

- Màn chọn người được giao bước có lọc vai okr không — chưa đọc mã picker ở
  `apps/app/app/(app)/[slug]/onboarding/[planId]/`. API thì không lọc (đã xác minh).
- Người mang vai okr đang thực sự là chủ/được giao/theo dõi kế hoạch nào ở production
  không — cần truy vấn dữ liệu thật; mã cho phép.
- `activities.myTasks` có REST `GET /activities/my-tasks` nhưng không màn nào gọi
  (chỉ thấy ở `apps/app/lib/trpc/cache.ts:81` và một bài kiểm) — có thể dùng ngoài qua
  khoá API; chưa kiểm.
- I2 «Toàn cảnh/Sức khoẻ OKR» chấm Đ theo tên tệp và `docs/api.md`, chưa đọc từng thẻ.
- Không đọc `.agents/skills/` và `docs/agent-panel.md`; không chạy mã, không chạy test.

## Nguồn (đường dẫn:dòng trên `origin/onehub` `e0b08ccd7`)

[1] `packages/db/prisma/schema.prisma:237-246, 547-579, 931-967, 1012-1054, 1089-1093, 1188-1237, 1262-1301, 1675-1688, 1753-1826, 1828-1883, 1886-1958, 1961-1985, 2070-2114, 2179-2195, 2233-2257, 2706-2731, 2804-2816`
[2] `packages/validation/src/vai-workspace.ts:1-43` — vai và phạm vi dữ liệu
[3] `packages/auth/src/roles.ts:16-18`; `packages/auth/src/organization.ts:15-53`
[4] `apps/api/src/trpc/middlewares/auth.middleware.ts:20-53`; `apps/api/src/trpc/middlewares/pham-vi-du-lieu.middleware.ts`
[5] `apps/api/src/activities/activities.router.ts:29-82`; `activities.contracts.ts:5-97`; `activities.service.ts:152-238`
[6] `apps/api/src/onboarding/onboarding-ghi.ts:105-161, 172-470`; `onboarding.router.ts:78-440`; `onboarding.contracts.ts:132-140, 220-243, 360-391`; `onboarding.service.ts:340-455`
[7] `apps/api/src/okr/okr-canh-kr.service.ts:125-420`; `apps/api/src/okr/canh-kr.ts:113-160`; `apps/api/src/okr/okr-trao-doi.service.ts:272-379`; `apps/api/src/okr/okr-access.service.ts:38-216`
[8] `packages/validation/src/okr-canh-kr.ts:12-64`; `packages/validation/src/okr-hien-thi.ts:50-62`; `packages/validation/src/onboarding-template.ts:6-11`
[9] `apps/api/src/dashboard/dashboard.service.ts:55-381`
[10] `packages/db/src/onboarding-nhac.ts:12-57, 183-402`; `packages/db/src/okr-nhac.ts:33-117, 230-376`; `packages/db/src/kenh-thong-bao.ts:4-55`; `packages/db/src/crm-events.ts:9-47`; `packages/db/src/okr-chi-so-danh-muc.ts:47-53`; `packages/db/src/agent-tasks.ts:14`
[11] `apps/agent/agent/subagents/agent_runner/tools/create_crm_activity.ts:6-23`; `apps/agent/agent/lib/run-runtime.ts:230-360`; `apps/agent/agent/lib/thanh-vien-principal.ts:12-23`; `apps/agent/agent/lib/tra-loi-nhac.ts:55`; `apps/agent/agent/lib/slack-nguoi-nhan.ts:142`
[12] `apps/app/components/crm/timeline/activity-composer.tsx:31-87`; `apps/app/components/crm/record-sheet/record-stack.ts:17-23`; `apps/app/components/crm/record-sheet/kr-viec.tsx`; `apps/app/app/(app)/[slug]/deals/use-deal-board-move.ts:19-145`; `apps/app/app/(app)/[slug]/onboarding/danh-muc-bang-cot.tsx:78-96`; `packages/ui/src/components/board.tsx:20-44`; `apps/app/lib/pham-vi-man.ts:12-40`; `apps/app/app/(app)/[slug]/page.tsx:46`
[13] `docs/api.md:22-48, 95-99, 234-262, 446-520, 533-640`; `docs/agent.md:289-337, 443-496`; `docs/telemetry.md:28, 120, 157-160, 325-330`
[14] `CONTEXT.md:3-22, 145-262, 277-305, 373-390, 628-643, 668-736`
[15] `docs/plan/lo-trinh-dieu-phoi-30-ngay.md:12-100, 238-262, 278-285, 315-324, 334`; `docs/plan/lo-trinh-okr.md:313-335, 413`
