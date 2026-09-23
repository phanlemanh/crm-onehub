---
schema_version: 1
feature: Gỡ là cắt quyền thật — người đã bị gỡ khỏi workspace không còn đọc hay ghi dữ liệu CRM qua thủ tục của API, cầu REST, khoá API hay đường nối trợ lý
slug: go-la-cat-quyen-that
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [auth, api, app]
status: implemented
approved_by: Manh Phan
approved_at: 2026-09-23
design_doc: docs/superpowers/specs/2026-09-23-go-la-cat-quyen-that-design.md
---

# Acceptance Contract: go-la-cat-quyen-that

## Context

Hai hồ sơ đã ký — `cho-phep-ai-vao-o-man-hinh` và `go-thanh-vien-phai-giu-duoc` —
hứa gỡ là cắt quyền thật. Lượt gỡ xoá đúng ba dòng, nhưng API không hỏi tư cách
thành viên: lớp kiểm chung chỉ kiểm có phiên, việc chặn chỉ nằm ở proxy của màn.
Chạy thật ngày 23/09 cho thấy bốn cửa còn mở sau lượt gỡ — đăng nhập lại, khoá API
(cũ và tạo mới), tab đang mở mang bộ đệm phiên, và đường nối sang trợ lý nghiên
cứu. Bảng số đo nằm trong design doc.

Hồ sơ này đóng cả bốn bằng một chỗ kiểm tư cách chặn-mặc-định ở lớp chung, chừa
đúng một đường đọc tư cách cho proxy, tắt khoá khi gỡ, chặn tạo và bật khoá cho
người ngoài, và kiểm tư cách ở đường nối trợ lý.

Source input: prompt (phiên 23/09), cộng hai bài kiểm đỏ
`apps/api/test/go-la-cat-quyen.spec.ts` và `apps/app/test/eve-cau-noi-thanh-vien.spec.ts`.

## Criteria

- AC-1: Given một người đã bị gỡ rồi đăng nhập lại bằng đường sản phẩm thật (mật khẩu, qua móc tạo phiên của Better Auth), When họ gọi TỪNG thủ tục có trong sổ router đang chạy của API, Then mọi thủ tục ngoài tập ngoại lệ đã khai đều trả FORBIDDEN với đúng thông điệp tư cách có tên. Tập thủ tục rút từ sổ router lúc chạy, không viết tay, nên thủ tục thêm sau này tự vào phép đo.
- AC-2: Given cùng người đã bị gỡ và cùng phiên ở AC-1, When đếm các thủ tục KHÔNG từ chối họ, Then tập đó bằng ĐÚNG tập ngoại lệ đã khai — `workspace.get` và `sso.signInOptions` — không hơn không kém; `workspace.get` trả 200 với `viewerRole: null`; và proxy THẬT của ứng dụng, hỏi API thật bằng cookie của họ, chuyển họ sang màn hết quyền, còn một thành viên thì không bị chuyển. (cross-layer)
- AC-3: Given một thành viên còn trong kho, When họ gọi cùng ma trận thủ tục ở AC-1, Then không thủ tục nào trả thông điệp tư cách — các lỗi khác (thiếu đầu vào, không tìm thấy, không đủ vai) vẫn được phép. Đây là đối chứng dương: một bản vá từ chối mọi người vẫn đỏ ở đây.
- AC-4: Given một tab đang mở của người sắp bị gỡ, cookie mang cả token phiên lẫn bộ đệm phiên, và cùng cookie đó đọc được dữ liệu trước lượt gỡ, When lượt gỡ chạy xong, Then NGAY lời gọi kế tiếp — không chờ bộ đệm hết hạn — mọi thủ tục ngoài tập ngoại lệ trả FORBIDDEN với thông điệp tư cách.
- AC-5: Given một người không còn là thành viên nhưng khoá API của họ VẪN BẬT — trường hợp người bị gỡ trước ngày có bản vá này —, và cùng khoá đó đọc được dữ liệu khi họ còn là thành viên, When họ dùng khoá đó, Then mọi thủ tục ngoài tập ngoại lệ trả FORBIDDEN với thông điệp tư cách qua tRPC, và mọi đường của cầu REST — rút từ tài liệu OpenAPI lúc chạy — cũng từ chối với cùng thông điệp.
- AC-6: Given một người có khoá API và một thành viên khác cũng có khoá, When người thứ nhất bị gỡ, Then mọi khoá của người bị gỡ chuyển sang tắt — dòng khoá vẫn còn, số dòng không đổi; khoá đã tắt không đọc được dữ liệu; khoá của thành viên kia vẫn bật và vẫn đọc được dữ liệu.
- AC-7: Given một người đã bị gỡ rồi đăng nhập lại, When họ tạo khoá mới qua thủ tục của API VÀ qua endpoint tạo khoá của Better Auth, hoặc bật lại một khoá cũ đã tắt qua endpoint sửa khoá, Then cả ba lời gọi bị từ chối và không dòng khoá nào được ghi hay được bật lại. Đối chứng: một thành viên tạo khoá được qua cả thủ tục của API (lối màn cài đặt dùng) lẫn endpoint của Better Auth, và hệ thống tạo khoá phía máy chủ không kèm phiên vẫn được.
- AC-8: Given một người có phiên nhưng không còn là thành viên, When họ gọi đường nối sang trợ lý nghiên cứu (`/eve/v1/...`), Then đường nối trả 403 và KHÔNG chuyển lời gọi nào sang trợ lý; một thành viên gọi cùng đường thì được chuyển đúng một lần.
- AC-9: Given một người đã bị gỡ, có khoá cũ đã tắt, When quản trị cho phép lại địa chỉ của họ và họ đăng nhập lại, Then họ đọc được dữ liệu như một thành viên, còn khoá cũ vẫn tắt — cho phép lại trả tư cách, không trả khoá.

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — cửa vào (danh tính người bị gỡ còn cầm):** phiên mới do đăng nhập lại · cookie bộ đệm của tab đang mở · khoá API tạo trước · khoá API tạo sau · đường nối trợ lý  [thước CE: ba cách Better Auth dựng ra người dùng trong `packages/auth/src/auth.ts` (phiên, bộ đệm phiên, `enableSessionForAPIKeys`) + route Next duy nhất đúc danh tính cho nơi khác, `apps/app/app/eve/v1/[...path]/route.ts`; chân ngành: OWASP ASVS, mục kiểm soát truy cập «chặn mặc định» và mục quản lý phiên]
- **Trục B — lối gọi:** thủ tục tRPC (query và mutation) · cầu REST sinh từ tRPC · endpoint `/api-key/*` của Better Auth · route Next của đường nối trợ lý  [thước CE: `create-app.ts` dựng cả tRPC lẫn cầu REST từ cùng một router. Controller REST riêng của Nest đã soát tay một lần: `internal/*` gác bằng bí mật, `api/t` là bộ thu công khai của tracking, `auth` chỉ trả hồ sơ của chính người gọi, tệp đính kèm nằm ở Out of scope — không controller nào được đo trong hồ sơ này]
- **Trục C — người:** đã bị gỡ · thành viên còn trong kho · được cho phép lại  [thước CE: ba nhánh của `ensureWorkspaceMembership`]
- **Trục D — tập thủ tục:** toàn bộ router đang chạy · tập ngoại lệ khai rõ  [thước CE: `AppRouterHost` lúc chạy]

Chưa từng là thành viên và đã bị gỡ là cùng một vị từ (không có dòng `member`), nên không thành giá trị riêng của trục C.

## Out of scope

- **Các endpoint khác của Better Auth mà một người có phiên gọi thẳng được** — đăng ký nhà cung cấp SSO (`/sso/register`), các endpoint của plugin organization. Mối lo đó áp cho MỌI người có phiên, không riêng người bị gỡ, nên là một hồ sơ riêng.
- **Tải tệp đính kèm hội thoại qua REST** (`/api/conversations/attachments/:id`) — chỉ trả tệp của hội thoại chính người đó hoặc qua liên kết chia sẻ; để sau.
- **`workspace.get` vẫn trả tên và website công ty cho người ngoài** — proxy cần câu trả lời này, và đó là thông tin công khai.
- **Tắt hoặc rút ngắn bộ đệm phiên** — kiểm tư cách tươi ở mỗi lời gọi đã đóng cửa tab đang mở.
- **Gỡ các `assertMember` sẵn có ở Zalo, Slack, agent** — nay thừa nhưng vô hại.
- **Sửa hồ sơ đã ký `go-thanh-vien-phai-giu-duoc`** — AC-2 của nó đo cửa phiên thiếu cookie bộ đệm; hồ sơ này đo đúng cửa và thay lời hứa bằng số đo mới, không viết lại hồ sơ cũ.

> Rationale từng mục: `decisions.jsonl`.

## Notes

- Luật đã đọc: `docs/api.md` (tRPC, workspace, SSO), `AGENTS.md` (không chú thích, server/client, parse ở biên), `CLAUDE.md` của kho.
- Hạng T3: chạm `packages/auth` và `apps/api/src/workspace`, `apps/api/src/api-keys`; lớp `trpc/middlewares` không nằm trong `t3_paths` nhưng đổi nghĩa cho mọi router. Kế hoạch (`docs/superpowers/plans/2026-09-23-go-la-cat-quyen-that.md`) viết xong và đính kèm TRƯỚC Cổng 1, nên cổng duyệt kế hoạch của T3 ngồi cùng lượt với Cổng 1 chứ không bị bỏ.

## Known limits

- **Token cầu nối đã đúc trước lượt gỡ còn sống tối đa 120 giây ở phía trợ lý.** AC-8 chặn việc đúc token mới; trợ lý không tự hỏi tư cách khi nhận token.
