# Gỡ là cắt quyền thật — thiết kế

Hồ sơ: `_acceptance/go-la-cat-quyen-that/` · hạng T3 · 23/09/2026

## Vấn đề, đã chứng bằng chạy thật

Hai hồ sơ đã ký — `cho-phep-ai-vao-o-man-hinh` và `go-thanh-vien-phai-giu-duoc` —
hứa «gỡ một thành viên là cắt quyền thật». Lượt gỡ xoá dòng thành viên, xoá phiên
và huỷ lời cho phép trong một giao dịch, nhưng **API không hỏi tư cách thành viên**:
`AuthMiddleware` chỉ kiểm có phiên, và chặn người ngoài chỉ nằm ở `proxy.ts` của
ứng dụng — tức chỉ chặn màn hình, không chặn lời gọi dữ liệu.

Bài kiểm `apps/api/test/go-la-cat-quyen.spec.ts` và
`apps/app/test/eve-cau-noi-thanh-vien.spec.ts`, chạy trên cơ sở dữ liệu thật của
lượt kiểm, 23/09, cho kết quả:

| Cửa vào | Đo được sau lượt gỡ |
|---|---|
| 1. Đăng nhập lại bằng mật khẩu (tài khoản không bị xoá; hook tạo phiên vẫn tạo phiên, chỉ không tạo thành viên) | `contacts.list` 200 |
| 2a. Khoá API tạo từ trước | `contacts.list` 200 |
| 2b. Tạo khoá mới sau khi bị gỡ | qua tRPC 200, qua `/api/auth/api-key/create` 200 — 2 khoá được ghi |
| 3. Tab đang mở — cookie mang bộ đệm phiên (`session_data`, 5 phút) | `contacts.list` 200 ngay sau lượt gỡ |
| 4. Đường nối trợ lý `/eve/v1/*` — không qua proxy, chỉ kiểm có phiên | được chuyển tới trợ lý, 200 |

Đối chứng xanh cùng lượt: thành viên còn trong kho đọc được cả sáu thủ tục mẫu;
`workspace.get` của người đã bị gỡ trả 200 với `viewerRole: null`.

Cửa 4 không nằm trong mô tả ban đầu, tìm ra khi soát lối nào còn trao danh tính
người dùng cho một nơi đọc được dữ liệu CRM.

Cửa 3 cũng cho biết một điều về hồ sơ đã ký `go-thanh-vien-phai-giu-duoc`: AC-2 của
nó hứa phiên mở mất quyền «tức thì, 0 giây» và đo bằng `auth.api.getSession` với
cookie **chỉ mang token phiên**. Trình duyệt thật còn mang cookie bộ đệm, và với
cookie đó cửa phiên vẫn trả người dùng tới 5 phút sau khi dòng phiên đã xoá. Phép
đo cũ xanh vì hỏi thiếu một cookie, không phải vì lời hứa đúng.

## Cách vá được chọn: kiểm tư cách ở lớp chung, chặn mặc định

**`AuthMiddleware` đổi nghĩa: có phiên VÀ là thành viên.** Mỗi lời gọi đọc dòng
`member` tươi qua `workspaceRoleOf` — không cache — nên cả bốn cửa cùng đóng bằng
một chỗ: phiên mới không có dòng thành viên, khoá API sinh phiên cho một người
không có dòng thành viên, cookie bộ đệm vẫn cho ra người dùng nhưng dòng thành viên
đã không còn. Không ai phải tắt bộ đệm phiên.

Từ chối là `TRPCError FORBIDDEN` với một thông điệp có tên, xuất từ file của
middleware, để phép đo ghim đúng câu đó và phân biệt «không phải thành viên» với
«không đủ vai» (các 403 theo vai vẫn còn nguyên).

Vì nestjs-trpc gắn middleware trước `.input()`, lời từ chối tư cách đến trước bước
kiểm đầu vào — người ngoài không dò được hình dạng đầu vào của thủ tục nào.

**Đường đọc tư cách — một ngoại lệ, khai bằng middleware có tên.** Proxy hỏi
`workspace.get` để biết người đang xem có còn trong kho không; nếu thủ tục đó cũng
bị chặn, proxy nhận lỗi, coi là «không biết» và **cho qua** (xem
`apps/app/lib/onboarding.ts`) — tức là vá xong lại mở cửa màn hình. Nên thêm
`SignedInMiddleware` (chỉ kiểm có phiên), và router `workspace` chuyển
`AuthMiddleware` từ mức lớp xuống từng thủ tục, riêng `get` dùng
`SignedInMiddleware`. Đây là cách `sso` đã làm (`signInOptions` mở, còn lại gắn ở
thủ tục). `workspace.get` với người ngoài vẫn trả tên và website của công ty — thứ
proxy cần, và vốn là thông tin công khai.

**Khoá API.** Ba việc, mỗi việc chặn một lối khác:

1. Lượt gỡ **tắt** mọi khoá của người bị gỡ (`enabled: false`) trong cùng giao dịch
   với việc xoá dòng thành viên. Tắt chứ không xoá: dòng còn lại để đọc ai từng có
   khoá gì — cùng lý do lời cho phép bị huỷ chứ không bị xoá.
2. Một móc `hooks.before` trong `packages/auth/src/auth.ts` từ chối mọi endpoint
   `/api-key/*` của Better Auth khi phiên gọi tới thuộc về người không phải thành
   viên. Đây là lối tạo khoá trực tiếp đã chứng đỏ, và cũng là lối bật lại một khoá
   đã tắt. Lời gọi phía máy chủ không mang phiên (hệ thống tự tạo khoá) không bị
   móc chạm.
3. Lối tạo khoá qua tRPC (`apiKeys.create`) tự đóng nhờ `AuthMiddleware` mới.

**Đường nối trợ lý.** `apps/app/app/eve/v1/[...path]/route.ts` hỏi
`workspaceRoleOf(session.user.id)` ngay sau khi có phiên; không phải thành viên thì
trả 403 và không đúc token cầu nối, không gọi sang trợ lý. Đây là route máy chủ,
đã import `@crm/db`, nên import `@crm/auth` không vi phạm luật client/server.

## Phương án đã cân và loại

- **Gắn một `MemberMiddleware` riêng vào từng router dữ liệu.** Mở mặc định: router
  thứ 24 quên gắn là hở lại, đúng lớp lỗi hồ sơ trước đã khai ở Known limits («ma
  trận liệt thủ tục viết trước»). Loại.
- **Kiểm tư cách trong từng service theo mẫu Zalo (`assertMember(userId)`).** Mẫu
  tốt cho một mô-đun, nhưng ~15 router không truyền `userId` xuống service
  (`contacts.list(@Input() input)`) — vá kiểu này là sửa hàng trăm chữ ký hàm, và
  vẫn mở mặc định. Các `assertMember` sẵn có ở Zalo/Slack/agent được giữ nguyên:
  chúng thừa nhưng vô hại, gỡ chúng là việc khác.
- **Tắt bộ đệm phiên hoặc hạ `maxAge`.** Chỉ đóng cửa 3, đổi lại một lần đọc phiên
  mỗi yêu cầu cho mọi trang; kiểm tư cách tươi đã đóng cửa 3 mà không cần.
- **Xoá tài khoản khi gỡ.** Mất lịch sử ai đã làm gì, và người được cho phép lại
  phải làm lại từ đầu. Loại.

## Phép đo

Ma trận **rút từ sổ router lúc chạy** — `app.get(AppRouterHost).appRouter` — chứ
không viết tay: thủ tục thêm sau này tự vào ma trận. Mỗi thủ tục gọi đúng kiểu
(query bằng GET, mutation bằng POST) với đầu vào rỗng. Tập ngoại lệ khai là một
hằng trong bài kiểm, và bài đòi **tập thủ tục không từ chối người ngoài phải bằng
đúng tập khai** — thêm một ngoại lệ mới mà không khai là bài đỏ.

Cùng ma trận chạy cho ba danh tính của người đã bị gỡ (phiên đăng nhập lại, cookie
bộ đệm của tab cũ, khoá API cũ) và cho một thành viên còn trong kho (đối chứng:
thành viên không bao giờ nhận thông điệp tư cách).

## Chi phí và rủi ro

- Thêm một lần đọc `member` theo khoá duy nhất cho mỗi lời gọi tRPC. Bảng nhỏ, có
  chỉ mục duy nhất `organizationId_userId`.
- Đổi nghĩa `AuthMiddleware` chạm mọi router. Rủi ro là một thủ tục người ngoài
  THẬT cần mà ta chưa biết; đã soát các trang không chặn (`/het-quyen`,
  `/dat-mat-khau`, `/grant-access`, `/sign-in`) — không trang nào gọi thủ tục tRPC
  nào ngoài `sso.signInOptions`, vốn mở sẵn.

## Đặc tả UX

Không có — hồ sơ không chạm màn nào. Màn «hết quyền» đã có và không đổi.
