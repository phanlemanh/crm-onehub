---
schema_version: 1
feature: Đưa danh sách ai-được-vào CRM từ biến môi trường vào bảng lời cho phép, quản trên màn Members với hai khối tách bạch — gỡ thành viên là cắt quyền thật, rút lời cho phép chỉ chặn người chưa có tài khoản
slug: cho-phep-ai-vao-o-man-hinh
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [auth, api, ui]
status: approved
approved_by: Mạnh
approved_at: 2026-09-16
design_doc: docs/superpowers/specs/2026-09-16-cho-phep-ai-vao-o-man-hinh-design.md
---

# Acceptance Contract: cho-phep-ai-vao-o-man-hinh

## Bối cảnh

Cho một người vào CRM hôm nay là sửa `ALLOWED_SIGN_IN` trên Vercel rồi chờ dựng
lại. Vòng này đưa việc ấy vào sản phẩm: một bảng lời cho phép đọc được, quản trên
màn Members. Chi tiết ở design doc.

Hai chỗ đang đọc ké biến ấy mà không liên quan gì tới chuyện cho ai vào —
`mailbox-match.service.ts` nhận email nội bộ, `tracking-filing.service.ts` loại
nhân viên khỏi số truy cập — được tách sang một ô domain nhà riêng.

## Acceptance Criteria

### AC-1 — Hàm thuần trả lời «người này vào được không, vai gì, theo nguồn nào»

**Given** một hàm thuần nhận trạng thái đã đọc sẵn: địa chỉ cần xét, danh sách
lời cho phép, chuỗi biến mồi, và cờ đã-có-ai-đăng-nhập-chưa
**When** gọi nó với từng hình dạng
**Then** kết quả đúng bảng viết trước này — **tám dòng**, chân phải in đủ tám:

| # | lời cho phép | biến mồi | đã có người | địa chỉ xét | vào được | vai | nguồn |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | rỗng | `onemount.com` | không | `ai@onemount.com` | có | `member` | mồi |
| 2 | rỗng | `onemount.com` | **có** | `ai@onemount.com` | không | — | không |
| 3 | rỗng | rỗng | không | `ai@onemount.com` | không | — | không |
| 4 | `khue@gmail.com` `pending` `member` | `onemount.com` | có | `khue@gmail.com` | có | `member` | bảng |
| 5 | `khue@gmail.com` `pending` `admin` | rỗng | có | `khue@gmail.com` | có | `admin` | bảng |
| 6 | `khue@gmail.com` `cancelled` `member` | rỗng | có | `khue@gmail.com` | không | — | không |
| 7 | `khue@gmail.com` `accepted` `member` | rỗng | có | `khue@gmail.com` | có | `member` | bảng |
| 8 | `khue@gmail.com` `pending` `member` | `onemount.com` | có | `ai@onemount.com` | không | — | không |

**Luật rút ra:** biến mồi chỉ có tiếng nói khi **cả hai** vế đúng — bảng rỗng và
chưa ai từng đăng nhập. Dòng 2 và dòng 8 là hai ca mà một cách đọc lỏng sẽ cho
qua: bảng rỗng nhưng đã có người, và bảng có người khác nhưng biến mồi còn đó.

Đây là cặp hai chiều trên cùng một hàm: dòng 1, 4, 5, 7 là chiều dương, dòng
2, 3, 6, 8 là chiều âm. Tám ca chạy trong một lượt, không nạp lại module. Sai một
dòng thì đỏ, nêu đầu vào, giá trị mong đợi, giá trị nhận được. Hàm không tồn tại,
không xuất ra được, hoặc số dòng chạy khác tám thì mã 2.

### AC-2 — Vai trò định trước đi vào tư cách thành viên (cross-layer)

**Given** một lời cho phép mang vai `admin` cho một địa chỉ chưa có tài khoản
**When** người ấy đăng nhập lần đầu qua đúng đường callback thật
**Then** dòng thành viên sinh ra mang vai `admin`, không rơi về vai mặc định, và
lời cho phép chuyển sang `accepted`. Đo bằng hàng trong cơ sở dữ liệu, không đo
tham số gửi đi.

### AC-3 — Rút lời cho phép chặn được người chưa có tài khoản (cross-layer)

**Given** một địa chỉ đang `pending` và chưa từng đăng nhập
**When** rút lời cho phép, rồi địa chỉ ấy đi trọn đường callback
**Then** không hàng nào sinh thêm ở `user`, `account`, `session`, `verification` —
đếm trước và sau, bốn cặp bằng nhau. Đối chứng dương bắt buộc: một địa chỉ **còn**
được phép đi cùng đường phải tạo đúng một hàng `user`; không tạo được thì phép đo
không phân biệt «chặn đúng» với «đường callback không chạy», và chân trả mã 2.

### AC-4 — Rút lời cho phép không đụng tới người đã vào (cross-layer)

**Given** một người đã là thành viên, lời cho phép của họ ở `accepted`
**When** rút lời cho phép ấy
**Then** dòng thành viên của họ còn nguyên và họ vẫn tạo được phiên mới. Đây là
hành vi cố ý, không phải sót: rút chỉ nói về cổng vào, cắt quyền là việc của nút
gỡ.

### AC-5 — Gỡ một thành viên là một việc trọn vẹn (cross-layer)

**Given** một thành viên đang ở trong, lời cho phép của họ ở `accepted`
**When** gỡ người ấy
**Then** trong **cùng một giao dịch**: dòng thành viên biến mất và lời cho phép
chuyển sang `cancelled`. Và khi họ đăng nhập lại, không dòng thành viên nào sinh
ra lần nữa. Chiều đỏ: chặn nửa chừng giữa hai lệnh ghi thì cả hai phải cùng không
xảy ra.

### AC-6 — Người vừa bị gỡ vào lại thì thấy lời nói thẳng

**Given** một tài khoản còn đăng nhập được nhưng không còn là thành viên
**When** họ đăng nhập rồi đi tới trang bất kỳ của ứng dụng
**Then** họ dừng ở một màn nói rằng tài khoản này không còn trong không gian làm
việc, kèm đường đăng xuất. Không vòng chuyển hướng, không màn trắng, không lỗi
máy chủ.

### AC-7 — Chủ cuối cùng không gỡ được (cross-layer)

**Given** không gian làm việc chỉ còn đúng một người giữ vai chủ
**When** gọi thủ tục gỡ người ấy
**Then** lượt gọi bị từ chối với thông điệp nói rõ vì sao, và cả hai bảng không
đổi một dòng nào. Đếm dòng chủ đi qua khoá `FOR UPDATE` trước khi đếm, cùng cách
mà việc hạ vai trò đang làm.

### AC-8 — Chỉ chủ và quản thao tác được, nút và lỗi quyền không nói hai điều khác nhau

**Given** một người đăng nhập với vai `member`
**When** họ mở màn Members, và khi họ gọi thẳng bốn thủ tục mới
**Then** trên màn không nút nào thao tác được, và cả bốn thủ tục đều từ chối. Đo
cả hai vế trong cùng một tiêu chí, vì một vế đúng mà vế kia sai là đúng cái lỗi
mà luật «nút bấm và lỗi quyền không được mâu thuẫn» sinh ra để chặn.

### AC-9 — Đường mồi chỉ mở cho bản cài mới (cross-layer)

**Given** một cơ sở dữ liệu chưa có lời cho phép nào
**When** xét hai trạng thái: chưa ai từng đăng nhập, và đã có ít nhất một người
**Then** trạng thái đầu đọc biến mồi, trạng thái sau không đọc. Ghim rằng phép
kiểm nằm ở `databaseHooks.user.create.before`, tức trước khi ghi.

### AC-10 — Domain nhà tách hẳn khỏi danh sách người

**Given** ô domain nhà ở `appSetting` và danh sách lời cho phép là hai vật khác nhau
**When** đổi ô domain nhà
**Then** không địa chỉ nào đổi quyền vào; và ngược lại, thêm hay rút một lời cho
phép không đổi kết quả của việc nhận email nội bộ lẫn việc lọc lượt truy cập. Đo
quan hệ chứ không đo chuỗi có mặt: gọi thật hai đường đọc ở `mailbox-match` và
`tracking-filing`, so kết quả trước và sau mỗi phía.

### AC-11 — Địa chỉ được chuẩn hoá, và không đẻ dòng thứ hai khi đang còn hiệu lực

**Given** danh sách đã có `khue@gmail.com` ở `pending` hoặc `accepted`
**When** cho phép `  KHUE@Gmail.com  `
**Then** không dòng thứ hai nào sinh ra, người thao tác nhận câu nói địa chỉ đã có
trong danh sách. Bảng viết trước cho việc chuẩn hoá: cắt khoảng trắng hai đầu, hạ
chữ thường toàn bộ, và địa chỉ không có đúng một dấu `@` thì bị từ chối trước khi
chạm cơ sở dữ liệu.

Từ chối chỉ áp cho lời cho phép **còn hiệu lực**. Một dòng đã `cancelled` không
chặn việc cho phép lại — xem AC-14.

### AC-14 — Cho phép lại một người đã bị rút (cross-layer)

**Given** một địa chỉ có dòng lời cho phép ở `cancelled`, do vừa bị gỡ hoặc vừa bị
rút
**When** người quản cho phép lại chính địa chỉ ấy
**Then** lượt gọi thành công và địa chỉ ấy vào được trở lại. Dòng `cancelled` cũ
**không** bị sửa — lời cho phép mới là một dòng mới, để nhật ký còn đọc được rằng
người này từng bị rút rồi được nhận lại.

Ba ca trong cùng một lượt, khác kết quả: `cancelled` cho phép lại được ·
`pending` bị từ chối · `accepted` bị từ chối. Ba ca cho cùng một kết quả thì chân
trả mã 2 — lúc ấy phép đo không phân biệt được "mở đúng ca đã rút" với "mở tất"
hay "đóng tất".

Không có tiêu chí này thì hợp đồng tự mâu thuẫn: AC-5 gỡ một người bằng cách
chuyển lời cho phép sang `cancelled`, rồi AC-11 lấy chính dòng ấy làm cớ từ chối,
và không đường nào nhận họ lại ngoài sửa tay cơ sở dữ liệu.

### AC-12 — Một lượt đọc bảng hỏng không khoá cả nhà ngoài cửa (cross-layer)

**Given** lớp đọc lời cho phép ném lỗi
**When** một người đang là thành viên tạo phiên mới
**Then** hook không ném lỗi ra ngoài, phiên vẫn tạo được, và tư cách thành viên
sẵn có còn nguyên. Đây là ràng buộc `docs/api.md` đang có, vòng này không được
làm mất.

### AC-13 — Hai hộp thoại xác nhận nói đúng hai việc khác nhau (judgment)

**Given** chữ trên hộp thoại xác nhận gỡ và hộp thoại xác nhận rút
**When** một người quản đọc chúng lần đầu, không có ai giải thích
**Then** họ hiểu đúng rằng gỡ cắt quyền của người đã vào, còn rút chỉ chặn người
chưa có tài khoản. Máy không chấm mục này.

## Coverage

Quét bằng `morphological-scan`, preset feature-quanh-một-entity, kết quả đầy đủ ở
`_acceptance/cho-phep-ai-vao-o-man-hinh/coverage-scan.md`.

Bốn trục: **vòng đời lời cho phép** (cho phép mới · đang chờ · đã vào · đã rút ·
cho phép lại) · **người thao tác × người bị tác động** (chủ · quản · thành viên
thường · người chưa có tài khoản · người vừa bị gỡ) · **nguồn quyết ai vào được**
(biến mồi · bảng · tư cách thành viên đã có · ô domain nhà) · **thời điểm kiểm**
(tạo tài khoản · tạo phiên · gọi thủ tục · dựng màn hình).

Thước CE: hai sản phẩm thật cùng loại — Vercel Teams, quan sát trực tiếp khi thao
tác thật trên team ngày 16/09/2026, và GitHub Organizations. Cả hai đều tách lời
mời treo thành khối riêng khỏi thành viên đã xác nhận, và cả hai đều có bất biến
chủ-cuối-cùng-không-gỡ-được.

Trục vòng đời phủ bởi AC-2 đến AC-5 và AC-14 (nấc cho phép lại); trục người thao
tác bởi AC-7 và AC-8; trục nguồn bởi AC-1, AC-9, AC-10; trục thời điểm bởi AC-2,
AC-5, AC-9, AC-12.

Nấc **cho phép lại** suýt lọt: bản quét có nó trên trục, nhưng bản hợp đồng đầu
tiên không có tiêu chí nào phủ, trong khi AC-11 lại ra luật chặn đúng ca đó. Lượt
phản biện context sạch bắt được, và AC-14 là chỗ vá.

## Out of scope

- Link để người được mời tự bấm, và hạn dùng cho lời cho phép — chủ kho chốt để
  vòng sau; cột `expiresAt` nhận một hằng có tên chờ sẵn
- Gửi email thật — kho chưa có hạ tầng gửi thư, và nó kéo theo một phụ thuộc mà
  người tự dựng có thể không có
- Nhật ký ai cho phép ai, ai gỡ ai, xem được trên màn hình
- Thêm nhiều địa chỉ một lượt, và gửi lại lời mời
- Địa chỉ Gmail có dấu chấm là cùng một hộp thư — thêm nhầm dạng thì không khớp
  lúc đăng nhập, để vòng sau
- Người lạ tự xin vào rồi chờ duyệt — cổng vào là lời cho phép có trước

## Notes
