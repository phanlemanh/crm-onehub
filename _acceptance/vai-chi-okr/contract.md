---
schema_version: 1
feature: Vai «chỉ OKR» — người mang vai này đăng nhập được, thấy khu OKR và hồ sơ của chính mình, nhưng không đọc được danh bạ, công ty, thoả thuận, chiến dịch, kế hoạch 30 ngày qua màn, tRPC, cầu REST, khoá API hay trợ lý AI
slug: vai-chi-okr
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: approved
approved_by: Manh Phan — uỷ quyền phiên điều phối 2026-09-24
approved_at: 2026-09-24T16:26:07Z
design_doc: docs/superpowers/specs/2026-09-24-vai-chi-okr-design.md
---

# Acceptance Contract: vai-chi-okr

## Context

Lộ trình OKR mở CRM cho mọi phòng ban từ 2026-10-26; CRM hôm nay chỉ có ba vai và
mọi thành viên đọc được toàn bộ dữ liệu đối tác. Lượt này thêm vai workspace thứ tư
«chỉ OKR» (giá trị `okr`), mở rộng lớp kiểm chung của API từ «tư cách» thành «tư cách
và phạm vi dữ liệu» — mỗi router khai phạm vi dữ liệu của mình, router không khai thì
vai này bị chặn — và đóng năm cửa: màn, tRPC, cầu REST, khoá API, trợ lý AI; cộng một
cửa lộ ra khi soát đường đăng nhập: tường xin quyền hộp thư. Lượt này chưa có khu
OKR, nên người mang vai này đăng nhập vào thấy Tổng quan rút gọn và Cài đặt cá nhân.

Source input: `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 2» (TC-05) + `CONTEXT.md` mục
«Vai «chỉ OKR»» + `_acceptance/vai-chi-okr/opportunity.md` + prompt phiên điều phối 24/09.

## Criteria

- AC-1: Given một thành viên mang vai `okr` đăng nhập bằng đường sản phẩm thật (mật khẩu, qua móc tạo phiên của Better Auth), When họ gọi TỪNG thủ tục có trong sổ router đang chạy của API (query bằng GET, mutation bằng POST, đầu vào rỗng), Then tập thủ tục KHÔNG trả FORBIDDEN với thông điệp phạm vi có tên bằng ĐÚNG tập khai trong bài kiểm — thủ tục của các router phạm vi `chung` và `to-chuc` cộng hai ngoại lệ sẵn có `workspace.get`, `sso.signInOptions` — không hơn không kém; mọi thủ tục còn lại trả FORBIDDEN với đúng thông điệp phạm vi. Sổ router phải có ≥ 50 thủ tục, tập rút lúc chạy, không viết tay.
- AC-2: Given cùng người mang vai `okr` tạo được một khoá API qua thủ tục tạo khoá của chính họ (thủ tục này thuộc phạm vi `chung` nên phải trả 2xx), When họ gọi cùng ma trận tRPC bằng khoá đó VÀ gọi mọi đường của cầu REST rút từ tài liệu OpenAPI lúc chạy (≥ 30 đường), Then tập không bị từ chối về phạm vi bằng đúng tập khai của AC-1 (chiếu sang tên đường REST), và mọi đường khác trả 403 với cùng thông điệp phạm vi.
- AC-3: Given một thành viên vai `member` và một người vai `admin`, When họ gọi cùng ma trận tRPC của AC-1, Then không hàng nào mang thông điệp phạm vi và sáu thủ tục dữ liệu mẫu (`contacts.list`, `companies.list`, `deals.list`, `activities.myTasks`, `search.quick`, `campaigns.list`) trả 200. Đây là đối chứng dương: một bản vá chặn nhầm thành viên vẫn đỏ ở đây.
- AC-4: Given một thủ tục gắn lớp kiểm tư cách trần — chưa khai phạm vi dữ liệu —, When người vai `okr` gọi nó, Then bị từ chối FORBIDDEN với thông điệp phạm vi; When thành viên vai `member` gọi nó, Then đi qua tới thủ tục. Chặn-mặc-định là hành vi của lớp nền, không của bảng khai.
- AC-5: Given cookie đăng nhập thật của người vai `okr`, When proxy THẬT của ứng dụng (hỏi API thật) nhận yêu cầu tới `/contacts`, `/deals`, `/onboarding`, `/chat` và `/settings/members`, Then mỗi yêu cầu được chuyển tới trang «ngoài phạm vi» dưới slug của kho; When nhận yêu cầu tới `/` và `/settings/notifications`, Then KHÔNG chuyển tới trang đó; When yêu cầu `/settings` trần, Then chuyển tới `/settings/notifications`; và thành viên vai `member` gõ `/contacts` không bị chuyển. Proxy vẫn đọc được tư cách: `workspace.get` trả 200 với `viewerRole: "okr"`. (cross-layer)
- AC-6: Given một người có phiên mang vai `okr`, When họ gọi đường nối sang trợ lý AI (`/eve/v1/...`), Then đường nối trả 403 với thông điệp phạm vi và KHÔNG chuyển lời gọi nào sang trợ lý AI; thành viên gọi cùng đường thì được chuyển đúng một lần. Và ở phía trợ lý AI: When kênh xác thực của trợ lý AI nhận một token cầu nối hợp lệ mà chủ token là người vai `okr` trong cơ sở dữ liệu, Then kênh không xác thực người đó (trả null), còn token của thành viên thì thành principal người dùng.
- AC-7: Given một quản trị và một thành viên, When quản trị đổi vai thành viên đó thành `okr` qua thủ tục đổi vai, Then cột `role` của dòng thành viên đọc lại từ cơ sở dữ liệu là `okr`; When quản trị cho phép một địa chỉ mới với vai `okr` rồi người đó đăng nhập, Then dòng thành viên được tạo với vai `okr` — không bị hạ về `member`; When một thành viên thường thử đổi vai người khác thành `okr`, Then bị từ chối; When chủ sở hữu duy nhất bị đổi thành `okr`, Then bị từ chối với thông điệp cần một chủ sở hữu sẵn có.
- AC-8: Given một người vai `okr` mà mọi dòng đăng nhập đều là Google và không dòng nào có quyền hộp thư, When ứng dụng quyết có dựng tường xin quyền hộp thư không, Then không dựng (không chuyển tới `/grant-access`) — đo ở chính chỗ nối của ứng dụng đọc vai từ cơ sở dữ liệu, không chỉ ở hàm thuần; cùng dòng đăng nhập nhưng vai `member` thì vẫn dựng tường. (cross-layer)
- AC-9: Given người vai `okr` đã đăng nhập, When họ nhìn ứng dụng ở khổ 375 và 1440, tiếng Việt và tiếng Anh, Then thanh điều hướng có đúng hai mục Tổng quan và Cài đặt (không Công ty, Cá nhân, Thoả thuận, Chiến dịch, 30 ngày đầu, Hội thoại), Tổng quan không có ô số liệu đối tác nào và có liên kết tới Thông báo của bạn, thanh bên Cài đặt có đúng hai mục Thông báo của bạn và Khoá API, gõ tay `/contacts` thấy trang «ngoài phạm vi» có liên kết về Tổng quan; thành viên thường thấy tám mục như hôm nay. Ba hàm thuần quyết mục rail, mục Cài đặt và điều hướng theo vai đo được không cần trình duyệt.
- AC-10: Given quản trị mở Cài đặt › Thành viên, When họ mở menu vai của một thành viên, Then menu có mục «Chỉ OKR»; When họ chọn nó, Then dòng đổi nhãn thành «Chỉ OKR» và cột `role` của dòng thành viên trong cơ sở dữ liệu là `okr`; hộp thoại cho phép địa chỉ cũng có «Chỉ OKR» trong ô vai. (cross-layer)
- AC-11: Given bất kỳ lời gọi tRPC nào của một thành viên, When lớp ghi nhật ký in dòng `tRPC <type> <path> <outcome>`, Then dòng đó mang thêm `role` (vai người gọi) và `phamVi` (phạm vi dữ liệu của router, hoặc null khi chưa khai) — để ngưỡng «0 lượt đọc được dữ liệu đối tác của vai chỉ OKR» đếm được từ nhật ký; một lời gọi bị từ chối về phạm vi vẫn in `role: okr`, `phamVi: doi-tac`, `outcome: err`.
- AC-12: Given người vai `okr` và danh sách MỌI thủ tục ghi (mutation) của các router phạm vi `chung` và `to-chuc` rút từ sổ router lúc chạy, When họ gọi từng thủ tục với đầu vào HỢP LỆ tối thiểu (để lời từ chối không thể là lỗi đầu vào), Then tập thủ tục KHÔNG bị từ chối bằng ĐÚNG tập «tự phục vụ» viết trước — tạo và thu hồi khoá API của chính mình, tạo mã nối Zalo, gỡ Zalo của mình, lưu ưu tiên kênh nhắc của mình, gửi thư thử vào kênh của mình — còn mọi thủ tục ghi cấu hình hệ thống (cài đặt chung, tiền tệ, SSO, bot Zalo, không gian làm việc, cây tổ chức) trả 403 theo vai quản trị; thành viên vai `member` gọi ba thủ tục ghi của cài đặt chung (model trợ lý AI, khoá research, thời gian lưu trữ) cũng bị từ chối — hôm nay chúng mở cho mọi thành viên do sót, lượt này đóng.
- AC-13: Given cookie đăng nhập thật của người vai `okr` và danh sách MỌI đường HTTP của API rút lúc chạy từ bộ định tuyến của máy chủ, trừ `/api/trpc/*` và `/rest/*` (đã đo ở AC-1, AC-2), When gọi từng đường với đúng phương thức và không đầu vào, Then tập đường trả 2xx bằng ĐÚNG tập khai trước trong bài kiểm (kiểm tra sức khoẻ, hồ sơ và phiên của chính mình, tài liệu OpenAPI, các đường của Better Auth) — không đường nào ngoài tập đó trả dữ liệu cho vai này; các đường nội bộ có bí mật trả 401/503 như hôm nay. Bài đỏ nếu danh sách đường dưới 20 (chống rỗng xanh câm).

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — cửa vào:** màn (proxy + thanh điều hướng) · tRPC bằng phiên · cầu REST · khoá API · trợ lý AI (đường nối + kênh của trợ lý AI) · tường xin quyền hộp thư · đường HTTP ngoài router (controller Nest, Better Auth)  [thước CE: bộ định tuyến của máy chủ lúc chạy (AC-13); `create-app.ts` dựng tRPC và cầu REST từ một router; ba cách Better Auth dựng người dùng trong `packages/auth/src/auth.ts`; route `apps/app/app/eve/v1/[...path]/route.ts`; `requireMailboxAccess` trong `apps/app/lib/session.ts`; chân ngành: OWASP ASVS chương kiểm soát truy cập, «chặn mặc định» [NGÀNH: OWASP ASVS]]
- **Trục B — phạm vi dữ liệu:** đối tác · tổ chức · OKR (chưa có router) · chung · chưa khai  [thước CE: sổ router lúc chạy — 25 router, mỗi router về đúng một phạm vi trong bảng của design doc]
- **Trục C — người:** chỉ OKR · thành viên · quản trị/chủ sở hữu · không phải thành viên  [thước CE: `WORKSPACE_ROLES`; người ngoài kho đã đo ở `go-la-cat-quyen-that`, không đo lại]
- **Trục D — cách vào vai:** đổi vai ở màn Thành viên · lời mời mang vai · đăng nhập tạo dòng thành viên từ lời mời · vai lạ trong bảng  [thước CE: `setMemberRole`, `allowEmail`, `ensureWorkspaceMembership`, `toWorkspaceRole`]
- Tiền lệ đối chiếu hình dạng vai: giấy phép «đăng nhập được mà không thấy đối tượng CRM» [NGÀNH: Salesforce Chatter Free] — chỉ để chắc vai này là một khuôn có thật, không kế thừa gì.
- [GIẢ ĐỊNH] vai «chỉ OKR» đọc được cây tổ chức (`org.tree`, `org.access`) vì OKR theo đơn vị ở lượt 3 cần nó.
- [GIẢ ĐỊNH] vai «chỉ OKR» tạo và dùng được khoá API của chính mình (phạm vi `chung`); khoá đó chỉ với tới phạm vi `chung` và `to-chuc`.
- [GIẢ ĐỊNH] `settings`, `currency`, `users`, `workspace` là phạm vi `chung`: chúng trả cấu hình và tên đồng nghiệp, không trả bản ghi đối tác. Thủ tục ghi ở `currency`, `sso`, `workspace`, `zalo.luuBot` đã đòi quản trị trong service; ba thủ tục ghi của `settings` hôm nay CHƯA — AC-12 đóng chúng cho mọi vai không phải quản trị.

## Đường đo

- Thước: 0 lượt đọc được dữ liệu đối tác của vai «chỉ OKR» trong hai tuần · số từ: dòng nhật ký `tRPC` có `role: okr`, `phamVi: doi-tac`, `outcome: ok` · bảo đảm bởi: AC-11
- Thước: ≥ 90 % người được gán vai «chỉ OKR» đăng nhập ít nhất một lần trong hai tuần đầu · số từ: bảng `session` nối bảng `member` theo `role = okr` · bảo đảm bởi: đã có sẵn: cơ sở dữ liệu (`session.userId`, `member.role`)

## Out of scope

- **Quyền xem theo đơn vị cho dữ liệu đối tác** — chưa ai đòi; lộ trình ghi ngoài phạm vi.
- **Khu OKR và router `okr.*`** — lượt 3; lượt này chỉ đặt sẵn phạm vi `okr` trong luật.
- **Nhắc OKR qua Zalo/Slack cho vai này** — lượt 5; kênh nhắc kế hoạch hôm nay chỉ gửi việc người đó cầm.
- **Gỡ khung bản ghi (`?sheet=`) và mọi đường dẫn sâu khác cho vai này** — API từ chối ở lời gọi đầu, khung hiện trạng thái lỗi sẵn có; chỉ ẩn tìm nhanh.
- **Các endpoint khác của Better Auth mà người có phiên gọi thẳng được** (organization plugin, `/sso/register`) — kế thừa từ `go-la-cat-quyen-that`, áp cho mọi người có phiên.
- **Vai «okr» đã có trong bảng trước ngày lên bản** — không có dòng nào như vậy; không migration.
- **Kênh nội bộ của trợ lý AI (`channels/crm.ts`, principal `eve:app`) và kênh Zalo** — không mang danh tính người dùng, không đọc theo người.

> Rationale từng mục: `decisions.jsonl`.

## Notes

- Luật đã đọc: `docs/api.md` (tRPC, workspace, SSO, đường đọc tư cách), `AGENTS.md` (không chú thích, server/client, hằng gom một chỗ, parse ở biên), `docs/design.md`, skill `better-auth-best-practices`, hồ sơ `go-la-cat-quyen-that` (contract, design doc, plan), `CONTEXT.md` mục «Vai «chỉ OKR»», «Bộ phận», «Phòng ban», «Đơn vị».
- Hạng T3: chạm `packages/auth`, `apps/api/src/workspace`, `apps/api/src/api-keys`; lớp `trpc/middlewares` không nằm trong `t3_paths` nhưng đổi nghĩa cho mọi router — khai T3 chủ động, có Cổng 1.5.
- Hai vòng khác đang chạy song song trên `apps/api/src/to-chuc`, `apps/api/src/onboarding` và màn `settings/organization`: lượt này chỉ đổi dòng khai phạm vi ở hai router đó.
- Cổng người của lượt do phiên điều phối ký theo uỷ quyền của Manh Phan ngày 2026-09-24; dòng ký ghi «Manh Phan — uỷ quyền phiên điều phối 2026-09-24».
- **Thay đổi đi kèm, duyệt tại Cổng Phạm vi (Manh Phan — uỷ quyền phiên điều phối 2026-09-24):** ba thủ tục ghi của Cài đặt chung — model trợ lý AI, khoá research, thời gian lưu trữ — hôm nay mở cho mọi thành viên do sót; lượt này đóng cho mọi vai không phải quản trị (AC-12, sổ quyết định d-11). Thành viên thường mất một quyền chưa từng được cấp có chủ ý.
- Tập «tự phục vụ» của AC-12 là hằng viết trước trong bài kiểm; thêm một thủ tục ghi cho vai «chỉ OKR» dùng được là sửa hằng đó có chủ ý.
- Nền hạ tầng (`duong-nen.md`): hai dòng đỏ là báo động giả của bộ kit (từ đầu lệnh `B=$(git merge-base …)` bị đọc thành tên chương trình) — mở chip sang kho kit; dòng đỏ `build_khong_cache` do shell nền lấy Node 22 trong khi `eve` đòi ≥ 24 — chạy tay với Node 24 thì xanh; đặt Node 24 làm mặc định của máy là việc của người.
