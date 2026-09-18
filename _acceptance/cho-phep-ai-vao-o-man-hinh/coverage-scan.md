# Quét không gian AC — cho-phep-ai-vao-o-man-hinh

## Ngữ cảnh

Sản phẩm: CRM nội bộ OneHub, một workspace duy nhất, không phải biên nhiều khách.

**Chân sản phẩm** — đào từ kho, chưa có mục `## Product Context` nên dựng tại chỗ:

- Một tổ chức singleton, `WORKSPACE_ID` là hằng không bao giờ là tham số `[SUY-TỪ-REPO: docs/api.md]`
- Ba vai: `owner` · `admin` · `member`; quyền quản = owner hoặc admin `[SUY-TỪ-REPO: packages/auth/src/organization.ts]`
- Đăng nhập bằng Google, Microsoft, hoặc một nhà cung cấp OIDC `[SUY-TỪ-REPO: packages/auth/src/auth.ts]`
- Cổng duy nhất quyết ai có tài khoản: hook `user.create.before` đối chiếu `ALLOWED_SIGN_IN` `[SUY-TỪ-REPO: packages/auth/src/auth.ts:263]`
- Tư cách thành viên được cấp lại ở mỗi lần tạo phiên `[SUY-TỪ-REPO: packages/auth/src/organization.ts:41]`
- Bất biến đang có: chủ cuối cùng không bị hạ vai trò, khoá `FOR UPDATE` trước khi đếm `[SUY-TỪ-REPO: docs/api.md]`
- Người dùng là nhân viên quan hệ đối tác OneHub, không phải khách mua `[SUY-TỪ-REPO: CONTEXT.md]`
- Quy mô thật: bản chạy thật hiện có đúng một thành viên `[SUY-TỪ-REPO: quan sát màn /onehub/settings/members ngày 16/09/2026]`

**Chân ngành** — cùng loại "quản thành viên một không gian làm việc":

- `[NGÀNH: Vercel Teams]` — quan sát trực tiếp trong phiên này khi thao tác thật trên team: lời mời treo nằm ở danh sách RIÊNG tách khỏi thành viên đã xác nhận; thu hồi lời mời và gỡ thành viên là hai thao tác khác nhau; email đã gửi thì không rút lại được
- `[NGÀNH: GitHub Organizations]` — pending invitations tách khỏi members; vai trò định trước khi người ta nhận; chủ cuối cùng không gỡ được
- `[NGÀNH: Linear]` — mời theo email, danh sách chờ, thu hồi

## Trục

- **A — Vòng đời lời cho phép**: cho phép mới | đang chờ (chưa có tài khoản) | đã vào (đã tạo tài khoản) | đã rút | cho phép lại sau khi rút
  [thước CE: Vercel Teams + GitHub Orgs — hai sản phẩm thật, một cái vừa thao tác trực tiếp]
- **B — Người thao tác × người bị tác động**: chủ | quản | thành viên thường | người chưa có tài khoản | người vừa bị gỡ
  [thước CE: `WORKSPACE_ROLES` + `isWorkspaceAdmin` trong kho; đối chiếu vai trò của GitHub Orgs]
- **C — Nguồn quyết ai vào được**: biến môi trường (mồi) | bảng lời cho phép | tư cách thành viên đã có | ô domain nhà
  [thước CE: đọc thẳng `auth.ts` + `workspace.ts`; trục này độc lập vì cùng một người có thể được cho phép bởi nguồn khác nhau và hành vi khác nhau]
- **D — Thời điểm kiểm**: lúc tạo tài khoản | lúc tạo phiên | lúc gọi thủ tục API | lúc dựng màn hình
  [thước CE: `docs/api.md` mục Gates in proxy.ts + hai hook trong `auth.ts`]

Bốn trục độc lập: đổi giá trị một trục không ép đổi trục nào khác. Không gian đầy đủ 5×5×4×4 nên quét theo lát cắt của trục A.

## Core

1. **Cho phép một địa chỉ mới** — nó hiện ở khối được phép vào; người đó đăng nhập lần đầu thì vào được và nhận đúng vai trò đã định trước.
2. **Vai trò định trước có hiệu lực** — cho phép với vai trò quản thì lúc họ vào là quản, không phải rơi về vai mặc định.
3. **Rút lời cho phép người chưa vào** — họ hết tạo được tài khoản.
4. **Rút lời cho phép người đã vào** — tư cách thành viên của họ không suy suyển; màn hình nói đúng điều đó thay vì để người bấm tưởng đã cắt.
5. **Gỡ một thành viên là một việc trọn vẹn** — xoá tư cách thành viên và rút lời cho phép trong cùng một giao dịch; đăng nhập lại không tự thành viên lần nữa.
6. **Người vừa bị gỡ vào lại thì thấy lời nói thẳng** — không rơi vào vòng chuyển hướng, không màn trắng.
7. **Chủ cuối cùng không gỡ được** — cùng bất biến và cùng cách khoá mà việc hạ vai trò đang dùng.
8. **Chỉ chủ và quản thao tác được** — thành viên thường không thấy nút và cũng không gọi được thủ tục; nút và lỗi quyền không được nói hai điều khác nhau.
9. **Đường mồi cho bản cài mới** — bảng rỗng và chưa ai từng đăng nhập thì đọc biến môi trường; đã có người thì bảng là nguồn duy nhất, biến hết hiệu lực.
10. **Domain nhà tách hẳn** — đổi ô domain nhà không đổi ai vào được; khớp hộp thư và lọc lượt truy cập đọc từ ô đó chứ không đọc ké danh sách người.
11. **Địa chỉ được chuẩn hoá khi thêm** — cắt khoảng trắng, hạ chữ thường; thêm lại địa chỉ đã có không đẻ dòng thứ hai.
12. **Đọc danh sách hỏng thì không khoá cả nhà ngoài cửa** — hook giữ nguyên tính chất suy giảm chứ không ném lỗi.

## Later

- Hạn dùng cho lời cho phép, và link để người được mời tự bấm — chủ kho đã chốt để vòng sau
- Gửi email thật — kho chưa có hạ tầng gửi mail, và nó kéo theo một phụ thuộc tuỳ chọn
- Nhật ký ai cho phép ai, ai gỡ ai, xem được trên màn hình
- Thêm nhiều địa chỉ một lượt
- Đổi vai trò của một lời cho phép đang chờ
- `[NGÀNH: Vercel Teams]` gửi lại lời mời — không có nghĩa khi vòng này chưa gửi gì
- Tìm và lọc trong khối được phép vào — khối này còn rất nhỏ
- Địa chỉ Gmail có dấu chấm là cùng một hộp thư; hiện thêm nhầm dạng là không khớp lúc đăng nhập

## Never

- Mời người ngoài OneHub, khách, hay đối tác vào CRM — đây là sản phẩm nội bộ, `CONTEXT.md` đã khoá
- Nhiều không gian làm việc song song — kho cấm biến tổ chức thành biên nhiều khách
- Người lạ tự xin vào rồi chờ duyệt — cổng vào là lời cho phép có trước, không phải đơn xin

## Cross-cutting áp mọi ô Core

- Hai khối đều phải có trạng thái rỗng nói được việc cần làm tiếp
- Trạng thái đang tải và trạng thái lỗi
- Chữ trên màn theo kho chuỗi tiếng Việt đang có, không chuỗi trần trong mã
- Quyền kiểm ở cả dịch vụ lẫn chỗ ẩn nút, để nút bấm và lỗi quyền không mâu thuẫn
