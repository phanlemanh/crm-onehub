# Vai «chỉ OKR» — thiết kế

Hồ sơ: `_acceptance/vai-chi-okr/` · hạng T3 · 24/09/2026 · lượt 2 của lộ trình OKR (TC-05)

## Vấn đề, đã chứng bằng đọc mã

CRM có ba vai workspace — `owner`, `admin`, `member` — và mọi vai đọc được toàn bộ
dữ liệu đối tác. `toWorkspaceRole` (`packages/auth/src/roles.ts`) hạ mọi vai lạ về
`member`, nên ghi «okr» vào bảng thành viên hôm nay là cho người đó đọc hết.

Lớp kiểm chung của API sau `go-la-cat-quyen-that` hỏi đúng hai điều ở mỗi lời gọi:
*có phiên* và *còn là thành viên* (`AuthMiddleware`, đọc dòng `member` tươi). Không
có câu hỏi thứ ba: *người này được đọc phần nào*. Cầu REST (`/rest/*`) và khoá API
đi qua cùng router nên cùng câu trả lời. Đường nối trợ lý AI
(`apps/app/app/eve/v1/[...path]/route.ts`) chỉ hỏi tư cách thành viên rồi đúc token
cho trợ lý AI — trợ lý AI có công cụ đọc thoả thuận, lịch sử công ty, tìm trong CRM.

Một cửa nữa lộ ra khi soát đường đăng nhập: `requireMailboxAccess`
(`apps/app/lib/session.ts`) chặn mọi tài khoản chỉ đăng nhập bằng Google/Microsoft mà
chưa cấp quyền hộp thư ở `/grant-access`. Người ngoài khối kinh doanh đăng nhập
Google sẽ bị đòi cấp Gmail cho CRM — cấp rồi thì thư của họ đổ vào đồng bộ hộp thư,
tức là chính họ *ghi* dữ liệu đối tác. Vai «chỉ OKR» phải không bao giờ tới màn đó.

## Cách vá được chọn: một luật vai → phạm vi dữ liệu, khai ở từng router, chặn mặc định

### 1. Vai thứ tư và luật phạm vi sống ở một chỗ

`packages/validation/src/vai-workspace.ts` (mới) giữ:

- `WORKSPACE_ROLES = ["owner", "admin", "member", "okr"]` — `packages/auth/src/roles.ts`
  xuất lại từ đây, `toWorkspaceRole` không đổi cách hạ vai lạ; `isWorkspaceAdmin` giữ
  nguyên nghĩa (okr không phải quản trị).
- `PHAM_VI_DU_LIEU = ["doi-tac", "to-chuc", "okr", "chung"]`.
- `docDuocPhamVi(role, phamVi | null)`: vai `okr` đọc được `okr`, `chung`, `to-chuc`; ba
  vai còn lại đọc được mọi phạm vi kể cả `null` (router chưa khai); vai `null` (không
  phải thành viên) không đọc được gì.
- `KHONG_TRONG_PHAM_VI` — một hằng thông điệp từ chối, để phép đo ghim đúng câu đó và
  phân biệt với `NOT_A_MEMBER` (tư cách) và 403 theo vai quản trị.

Vì sao ở `@crm/validation` chứ không ở `@crm/auth`: luật này ba nơi cần — API
(middleware), ứng dụng (proxy chạy ở rìa và thanh điều hướng là client component,
không import được `@crm/auth` vì barrel của nó với tới Prisma), và trợ lý AI (kênh
`repFromCrm` ở `apps/agent`, không phụ thuộc `@crm/auth`). `packages/validation` là
chỗ AGENTS.md dành cho hình dạng vượt ranh gói, và cả ba đã phụ thuộc nó.

### 2. Phạm vi dữ liệu khai ở từng router bằng lớp middleware

`apps/api/src/trpc/middlewares/pham-vi-du-lieu.middleware.ts` (mới) có bốn lớp
`PhamViDoiTacMiddleware` · `PhamViToChucMiddleware` · `PhamViOkrMiddleware` ·
`PhamViChungMiddleware`, mỗi lớp kế thừa `AuthMiddleware` và khai `phamVi` của mình.
`AuthMiddleware` thành lớp nền: sau khi hỏi phiên và tư cách như hôm nay, nó hỏi thêm
`docDuocPhamVi(role, this.phamVi)`; lớp nền không khai `phamVi` (`null`), nên **một router
gắn `AuthMiddleware` trần là router chưa khai phạm vi, và vai «chỉ OKR» bị chặn ở đó**.
Không có đường mở mặc định: quên khai là chặn, không phải hở.

Mỗi router đổi `@UseMiddlewares(AuthMiddleware)` thành lớp phạm vi của mình. Bảng khai:

| Phạm vi | Router (alias) | Vì sao |
|---|---|---|
| `doi-tac` | contacts · companies · deals · campaigns · activities · onboarding · search · dashboard · enrichment · savedViews · fields · google · microsoft · tracking · slack · agents · conversations | Đọc hoặc dẫn tới dữ liệu đối tác. `google.thread`/`google.event` trả thư và lịch đã đồng bộ; `tracking.contactActivity`/`companyActivity` là hoạt động web của đối tác; `slack.matches` khớp người với danh bạ; `agents`/`conversations` là trợ lý AI và hội thoại trên dữ liệu CRM; `fields` là khuôn trường của bản ghi đối tác. |
| `to-chuc` | org | Cây tổ chức chung cho cả CRM; OKR theo đơn vị (lượt 3) đọc nó. |
| `okr` | (chưa có — lượt 3 khai) | Đặt sẵn để router OKR khai đúng phạm vi. |
| `chung` | users · settings · currency · zalo · apiKeys · sso · workspace | Hồ sơ và tên đồng nghiệp, cấu hình hệ thống, kênh nhắc của chính mình, khoá API của chính mình, tư cách của chính mình. Không thủ tục nào ở đây trả một bản ghi đối tác. Thủ tục ghi ở đây chia hai: **tự phục vụ** (khoá API của mình, kênh Zalo của mình) và **cấu hình hệ thống** — cái sau đòi quản trị. `currency`, `sso`, `workspace`, `zalo.luuBot` đã đòi; ba thủ tục ghi của `settings` (`setAgentModel`, `setResearchKey`, `setArchiveRetention`) hôm nay mở cho mọi thành viên do sót — lượt này thêm `canManageSettings` vào `@crm/auth` và gọi nó trong `SettingsService`, đúng khuôn `canManageCurrency`. |

`workspace.get` giữ `SignedInMiddleware` (đường đọc tư cách cho proxy — bẫy số 1 của
`go-la-cat-quyen-that`): với vai «chỉ OKR» nó trả 200 và `viewerRole: "okr"`, proxy
đọc được vai từ chính câu trả lời này. `sso.signInOptions` vẫn mở.

Thứ tự trong chuỗi tRPC không đổi: middleware chạy trước `.input()`, nên lời từ chối
phạm vi đến trước lỗi đầu vào và trước 403 theo vai trong service.

**Đường HTTP ngoài router.** API còn các controller Nest thường (`/health`, `/auth/me`,
`/auth/session`, `/internal/*` gác bằng bí mật, `/api/t` bộ thu tracking công khai,
`/api/conversations/attachments/:id` chỉ trả tệp của hội thoại chính mình) và các
đường của Better Auth dưới `/api/auth/*`. Không đường nào trong số đó trả bản ghi đối
tác cho một người có phiên, nên lượt này không sửa controller nào — nhưng phép đo
AC-13 rút toàn bộ bộ định tuyến lúc chạy và ghim tập đường trả 2xx cho vai «chỉ OKR»,
để một controller thêm sau này không mở cửa mà không ai thấy.

Cầu REST và khoá API không cần mã riêng: `createOpenApiExpressMiddleware` dựng từ cùng
router, khoá API sinh phiên cho cùng người, cùng dòng `member`, cùng lớp middleware.
Phép đo vẫn đo riêng từng cửa.

### 3. Nhật ký mang vai và phạm vi — đường đo của ngưỡng

`request-context.ts` thêm `role` và `phamVi`; lớp nền ghi hai giá trị đó ngay sau khi
quyết. `LoggingMiddleware` (global, ngoài cùng) in thêm `role` và `phamVi` vào dòng
`tRPC …`. Ngưỡng của hồ sơ cơ hội — *0 lượt đọc đối tác thành công của vai chỉ OKR
trong hai tuần* — đếm từ dòng này: `role=okr` · `phamVi=doi-tac` · `outcome=ok`.

### 4. Màn: thanh điều hướng, Cài đặt, Tổng quan, trang «ngoài phạm vi»

`apps/app/lib/pham-vi-man.ts` (mới, không import gói máy chủ) là nguồn duy nhất
cho ba câu hỏi của màn, đều là hàm thuần:

- `mucRailChoVai(role)`: vai `okr` thấy đúng hai mục — Tổng quan và Cài đặt (Cài đặt
  trỏ thẳng `/settings/notifications`); vai khác thấy tám mục như hôm nay.
- `mucCaiDatChoVai(role)`: vai `okr` thấy đúng hai mục Cài đặt — «Thông báo của bạn»
  và «Khoá API»; vai khác thấy đủ.
- `dieuHuongTheoVai(role, pathnameKhongSlug)`: vai `okr` → khu đối tác
  (`/companies` `/contacts` `/deals` `/campaigns` `/onboarding` `/chat` `/agents`) và
  các mục Cài đặt ngoài hai mục trên → chuyển tới `/ngoai-pham-vi`; `/settings` trần →
  chuyển tới `/settings/notifications`; còn lại → đi tiếp. Vai khác → luôn đi tiếp.

Khung ứng dụng chạy trên mọi trang (tiêu đề, rail, khung bản ghi, tìm nhanh) không
được gọi router phạm vi đối tác cho vai này: tìm nhanh không dựng, Tổng quan không
prefetch `dashboard.summary`, và E11 đếm request tới `/api/trpc/` trên ba màn của vai
«chỉ OKR» — alias phạm vi đối tác phải bằng 0, không phản hồi 403 nào. Một thành phần
khung gọi nhầm sẽ lộ ở phép đếm này chứ không ở ảnh chụp.

`proxy.ts` gọi `dieuHuongTheoVai` ngay sau cổng tư cách, dùng `viewerRole` mà
`readWorkspaceGate` đã đọc từ `workspace.get` (mở thêm trường trả về, không thêm lời
gọi). `AppIconRail` và `SettingsSidebar` lọc mục bằng hai hàm trên với `viewerRole` từ
`workspace.get` đã hydrate ở layout — không thêm lời gọi. `QuickSwitcher` (tìm nhanh,
gọi `search.quick`) không dựng cho vai `okr`.

Trang `(app)/[slug]/ngoai-pham-vi/page.tsx` (mới): một tiêu đề, một câu nói phần này
không thuộc vai của bạn, một liên kết về Tổng quan. Nằm trong khung ứng dụng nên thanh
điều hướng vẫn có.

Tổng quan (`[slug]/page.tsx`): đọc vai trên máy chủ; vai `okr` thì không prefetch
`dashboard.summary`, không dựng bộ chuyển phạm vi, dựng `TongQuanChiOkr` — lời chào
và một đoạn nói khu OKR mở ở lượt sau, kèm liên kết tới Cài đặt › Thông báo của bạn.

### 5. Gán vai

`vaiTro` trong `apps/app/lib/messages/settings-thanh-vien.ts` thêm `okr` («Chỉ OKR» /
«OKR only»). Menu đổi vai, hộp thoại cho phép địa chỉ và bộ lọc theo vai của màn
Thành viên đều đọc `Object.keys(vaiTro)` nên tự có mục mới; `setMemberRoleInput` và
`allowEmailInput` dùng `z.enum(WORKSPACE_ROLES)` nên tự nhận «okr». Bất biến «kho
phải còn một chủ sở hữu» giữ nguyên. `ensureWorkspaceMembership` tạo dòng thành viên
với vai của lời cho phép, `toWorkspaceRole("okr")` nay trả `okr` thay vì hạ về
`member`.

### 6. Trợ lý AI: hai ổ khoá

- Đường nối `eve/v1/[...path]/route.ts`: sau khi có vai, `docDuocPhamVi(role, "doi-tac")`
  sai → 403 với `KHONG_TRONG_PHAM_VI`, không đúc token, không gọi sang trợ lý AI.
- Kênh `repFromCrm` (`apps/agent/agent/channels/eve.ts`): sau khi token hợp lệ, đọc
  dòng `member` của `subject` qua `@crm/db`; vai `okr` (hoặc không có dòng) → trả
  `null`, tức không xác thực. Trợ lý AI tự từ chối kể cả khi một token cũ còn sống 120 giây
  hay một đường nối khác đúc token — «trí khôn ở `apps/agent`» cũng có nghĩa là trợ lý AI
  tự biết mình không được phục vụ ai.

### 7. Đăng nhập không đòi hộp thư

`needsMailboxGrant(accounts, role)` và `mailboxGrantsNeeded(accounts, role)`
(`packages/auth/src/scopes.ts`) nhận thêm vai: vai `okr` → không bao giờ cần cấp
quyền hộp thư. Chỗ nối trong ứng dụng tách thành `hopThuCanCap(userId)`
(`apps/app/lib/session.ts`): đọc dòng thành viên và các dòng đăng nhập, trả danh sách
nhà cung cấp cần cấp; `requireMailboxAccess` chỉ còn gọi nó rồi chuyển hướng. Tách ra
để phép đo chạm đúng chỗ nối với cơ sở dữ liệu thật, không chỉ hàm thuần (gap-probe F1). Người mang vai này không thấy `/grant-access`, và vì thế không
có hàng `MailboxSync` nào cho họ.

## Phương án đã cân và loại

- **Sổ đăng ký alias → phạm vi trong một file, middleware tra theo `opts.path`.** Cũng
  chặn mặc định, nhưng lời khai nằm xa router nó nói về và dựa vào chuỗi đường dẫn;
  người thêm router thứ 26 không thấy chỗ phải khai. Loại.
- **Khai phạm vi trong `meta` của từng thủ tục (cạnh `restMeta`).** Mịn hơn cần thiết,
  hàng trăm chỗ khai, và một thủ tục quên khai trong một router đã khai là một lỗ mà
  mắt không thấy. Phạm vi là chuyện của router. Loại.
- **Dùng kiểm soát truy cập của plugin organization (Better Auth `ac`/`roles`).**
  Luật sẽ sống trong Better Auth, còn tRPC không hỏi nó; phải thêm một lớp dịch, và
  proxy/rail/agent vẫn cần luật riêng. Một ổ khoá ở lớp chung của API là cách hồ sơ
  trước đã chọn và đã chứng; không đổi khuôn giữa hai lượt. Loại.
- **Chặn ở màn và ở proxy là đủ.** Đúng lớp lỗi `go-la-cat-quyen-that` vừa đóng: màn
  không phải cửa duy nhất. Loại.
- **Gỡ hẳn khung bản ghi (`RecordSheetHost`) và tìm nhanh cho vai này.** Tìm nhanh ẩn
  được rẻ; khung bản ghi chỉ mở khi có tham số `?sheet=` gõ tay, và API từ chối ngay
  ở lời gọi đầu — màn hiện trạng thái lỗi sẵn có. Không đáng thêm nhánh. Chỉ ẩn tìm
  nhanh.

## Phép đo

Ma trận **rút từ sổ router lúc chạy** như hồ sơ trước, chạy cho người mang vai `okr`
đăng nhập bằng mật khẩu thật. Tập thủ tục *không* bị từ chối về phạm vi phải **bằng
đúng** tập khai trong bài kiểm — một hằng liệt kê alias của phạm vi `chung` và `to-chuc`
cộng hai ngoại lệ có sẵn — so bằng quan hệ tập, không phải chuỗi-có-mặt. Router mới
khai phạm vi `chung` mà không sửa hằng là bài đỏ: đó là quyết định phải nói ra. Cùng ma
trận chạy qua khoá API và qua cầu REST (đường rút từ khai báo openapi), và chạy đối
chứng cho thành viên thường (không hàng nào mang thông điệp phạm vi).

Router chưa khai phạm vi đo bằng bài kiểm đơn vị trên lớp nền: vai `okr` bị chặn với
đúng thông điệp, thành viên đi qua.

Proxy đo bằng tiến trình con chạy hàm `proxy` thật với API thật (như E10 của hồ sơ
trước): vai `okr` gõ `/contacts` → chuyển tới `/ngoai-pham-vi`; gõ `/` và
`/settings/notifications` → không; thành viên gõ `/contacts` → không.

Trợ lý AI đo ở cả hai ổ khoá: đường nối (handler thật, đếm lời gọi sang trợ lý AI) và kênh
(`repFromCrm` với token hợp lệ của một người mang vai `okr` trong cơ sở dữ liệu thật).

Màn đo bằng hàm thuần (bài kiểm đơn vị ba hàm) và bằng mắt (script Chrome: đăng
nhập vai `okr`, chụp thanh điều hướng, Cài đặt, Tổng quan, trang «ngoài phạm vi», màn
Thành viên đổi vai rồi đọc lại cột `role` trong cơ sở dữ liệu).

Mọi phép đo có chiều đỏ trên cùng dựng cảnh: bỏ câu hỏi phạm vi khỏi lớp nền, xếp
sai một router, bỏ bộ lọc rail, bỏ câu hỏi vai ở đường nối — từng bài đỏ với thông
điệp ghim tên thủ tục, đường, hay mục.

## Chi phí và rủi ro

- Không thêm lần đọc cơ sở dữ liệu nào ở API: vai đã có từ `workspaceRoleOf` của
  lớp kiểm tư cách. Kênh trợ lý AI thêm một lần đọc `member` theo khoá duy nhất mỗi lời
  gọi.
- 24 router đổi một dòng decorator; đây là chỗ sai xếp phạm vi làm mất quyền oan của
  thành viên thường hoặc mở quyền cho vai «chỉ OKR» — bài đối chứng và ma trận ghim
  cả hai chiều.
- Hai vòng khác đang chạy song song trên `apps/api/src/to-chuc`, `apps/api/src/onboarding`
  và màn `settings/organization`: lượt này chỉ đổi dòng khai phạm vi ở hai router đó.
- Vai «okr» ghi vào bảng thành viên trước khi bản này lên (không có) sẽ đọc như
  `member` cho tới lúc lên bản; không cần migration vì cột `role` là chuỗi.

## Đặc tả UX

### 1. Luồng

- Suôn sẻ: người mang vai «chỉ OKR» đăng nhập → Tổng quan rút gọn (lời chào, đoạn nói khu OKR mở ở lượt sau) → Cài đặt › Thông báo của bạn (nối Zalo) (điểm ra: đăng xuất ở tiêu đề)
- Biên: gõ tay đường dẫn tới màn dữ liệu (`/contacts`, `/deals`, `/settings/members`…) → trang «ngoài phạm vi» có liên kết về Tổng quan; gõ `/settings` trần → về Thông báo của bạn
- Lỗi & quay lại: mở khung bản ghi bằng tham số `?sheet=` gõ tay → API từ chối, khung hiện trạng thái lỗi sẵn có → đóng khung
- Quản trị: Cài đặt › Thành viên → menu vai của một người → «Chỉ OKR» → dòng đổi nhãn ngay; hộp thoại cho phép địa chỉ có «Chỉ OKR» trong ô vai

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thanh điều hướng (rail) | Cho vai «chỉ OKR» chỉ hai lối: Tổng quan, Cài đặt | mọi màn / Tổng quan, Cài đặt |
| Tổng quan rút gọn | Nói người này đang ở đâu và làm gì được | đăng nhập / Cài đặt › Thông báo của bạn |
| Thanh bên Cài đặt | Cho vai «chỉ OKR» đúng hai mục cá nhân | Cài đặt / Thông báo của bạn, Khoá API |
| Ngoài phạm vi | Nói phần này không thuộc vai của bạn, đưa về Tổng quan | đường dẫn gõ tay / Tổng quan |
| Thành viên (menu vai, hộp thoại cho phép) | Gán vai «Chỉ OKR» cho một người | Cài đặt › Thành viên / cùng màn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-rail-chi-okr | Thanh điều hướng | Hai mục: Tổng quan (đang mở), Cài đặt | Bấm Cài đặt |
| ST-rail-dang-tai | Thanh điều hướng | Khung tám nút mờ như hôm nay (`AppIconRailFallback`) — không lộ mục đối tác vì nút mờ không bấm được | Chờ |
| ST-tong-quan-chi-okr | Tổng quan rút gọn | Lời chào theo giờ + đoạn «Khu OKR mở ở lượt sau. Bạn có thể nối kênh nhắc ở Cài đặt › Thông báo của bạn.» + liên kết | Bấm liên kết |
| ST-tong-quan-dang-tai | Tổng quan rút gọn | Khung lời chào mờ (`OverviewGreetingFallback`) | Chờ |
| ST-cai-dat-chi-okr | Thanh bên Cài đặt | Hai mục: Thông báo của bạn, Khoá API | Chọn mục |
| ST-ngoai-pham-vi | Ngoài phạm vi | Tiêu đề «Phần này không thuộc vai của bạn», câu «Vai chỉ OKR không đọc dữ liệu đối tác. Hỏi quản trị nếu bạn cần vai khác.», liên kết «Về Tổng quan» | Bấm liên kết |
| ST-thanh-vien-menu-vai | Thành viên | Menu vai có bốn mục, mục hiện tại đánh dấu; «Chỉ OKR» là mục thứ tư | Chọn vai |
| ST-thanh-vien-doi-vai-loi | Thành viên | Thông báo lỗi sẵn có của màn (vd kho cần một chủ sở hữu), dòng không đổi | Chọn người khác làm chủ trước |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Rail và thanh bên Cài đặt lọc bằng hàm thuần theo vai; mục đang mở giữ `aria-current="page"`; thứ tự mục còn lại không đổi.
- Trang «ngoài phạm vi» không có nút hành động nào ngoài một liên kết; tiêu đề là `h1`; đường dẫn gõ tay không được giữ lại để thử lại (không có gì để thử lại với vai này).
- Chuỗi giao diện qua `lib/messages/*` cả hai tiếng; dữ liệu người nhập không dịch.
- Không đổi khoảng cách, màu, bo góc: dùng `PageShell`, `Button` liên kết, `Select` sẵn có.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `AppIconRail` (`apps/app/components`) | mở rộng | Thêm bộ lọc mục theo vai, không đổi hình |
| `SettingsSidebar` | mở rộng | Thêm bộ lọc mục theo vai |
| `PageShell` + `Button asChild` (`@crm/ui`) | dùng | Trang «ngoài phạm vi» và Tổng quan rút gọn ghép từ khung sẵn |
| `Select` trong `allow-dialog.tsx`, menu vai trong `members-table.tsx` | dùng | Mục mới đến từ `vaiTro`, không chạm component |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: trung-tâm-toả-nhánh (hub-and-spoke)
Căn cứ: khung ứng dụng đã là rail toả nhánh; lượt này chỉ bớt nhánh theo vai và thêm một trang đích cho đường dẫn lạc. Không có khuôn khả dĩ thứ hai — không tra mẫu.
