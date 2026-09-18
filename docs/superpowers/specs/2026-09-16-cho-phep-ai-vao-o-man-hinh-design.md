# Cho phép ai vào, quyết ở màn hình

Ngày 16/09/2026 · hạng T3 · slug `cho-phep-ai-vao-o-man-hinh`

## Vì sao

Hôm nay muốn cho một người vào CRM thì phải sửa biến `ALLOWED_SIGN_IN` trên Vercel
rồi chờ một lượt dựng lại. Chỉ người giữ quyền hạ tầng làm được, và việc ấy không
để lại dấu vết nào trong sản phẩm: không biết ai cho ai vào, lúc nào, với vai gì.

Chính sáng nay việc đó hỏng một lần có thật. Giá trị cũ ở bản chạy thật là kiểu
địa chỉ đích danh, nhưng bản `.env` trong kho ghi một domain, nên lượt ghi đè đã
mở cửa cho cả `@onemount.com` và bật `workspaceDomains()` từ rỗng thành một phần
tử — kéo theo cách khớp hộp thư và cách lọc lượt truy cập đổi hành vi, ở hai chỗ
chẳng liên quan gì tới chuyện mời ai. Giá trị đó không đọc lại được để đối chiếu
vì biến khai kiểu nhạy cảm.

Hai bài học đi thẳng vào thiết kế này: **danh sách người phải đọc được** để còn
đối chiếu trước khi sửa, và **domain nhà phải tách khỏi danh sách người** vì hai
thứ đó không cùng một câu hỏi.

## Phạm vi vòng này

Đưa danh sách ai-được-vào vào CRM, quản trên màn Members. **Không** làm link mời,
không hạn dùng, không gửi email — chủ kho đã chốt để vòng sau, và kho chưa có hạ
tầng gửi thư.

## Chỗ ở của dữ liệu

Danh sách sống trong bảng `invitation` đã có sẵn trong lược đồ. Một dòng nghĩa là
*địa chỉ này được phép vào, với vai này, do người này cho phép, lúc này* — đó đã
đúng là một lời mời chưa gửi, nên vòng sau chỉ thêm link và hạn thật chứ không
phải di dời dữ liệu lần nữa. Nó cũng xoá được câu `docs/api.md` đang khẳng định
bảng ấy không dùng tới.

`status` đi ba nấc: `pending` được phép mà chưa có tài khoản · `accepted` đã vào ·
`cancelled` đã rút. Rút không xoá dòng, để còn đọc được ai từng cho ai vào.

`expiresAt` không nullable mà vòng này chưa có hạn, nên nó nhận một hằng có tên
tự nói thay vì một ngày ma thuật rải trong mã. Vòng sau thay hằng ấy bằng hạn
thật, không đụng cột.

Domain nhà về `appSetting` — cùng chỗ với `reportingCurrency` và đám `tracking*`,
là nơi mọi cài đặt một-bản-duy-nhất đang ở.

## Quyết định nằm trong một hàm thuần

Cổng vào có bốn nguồn đầu vào — bảng, biến mồi, tư cách thành viên đã có, và câu
hỏi *đã có ai đăng nhập bao giờ chưa*. Trộn bốn thứ đó vào một hàm chạm cơ sở dữ
liệu thì không đo được bằng bảng viết trước.

Nên tách làm hai lớp, đúng khuôn mà vòng `hd-theo-danh-sach` đã dựng: một hàm
**thuần** nhận trạng thái đã đọc sẵn và trả lời *người này vào được không, với
vai gì, theo nguồn nào*; một lớp mỏng đọc cơ sở dữ liệu rồi gọi hàm ấy. Bảng
viết trước đo hàm thuần; lớp mỏng đo bằng hệ quả thật trong cơ sở dữ liệu.

Đường mồi: bảng rỗng **và** chưa ai từng đăng nhập → đọc biến môi trường. Đã có
người rồi thì bảng là nguồn duy nhất và biến hết hiệu lực. Hai vế, không phải
một — bảng rỗng mà đã có người nghĩa là ai đó vừa rút sạch lời cho phép, chứ
không phải bản cài mới.

## Nút gỡ phải nói thật

`ensureWorkspaceMembership` hiện cấp lại tư cách thành viên ở **mỗi** lần tạo
phiên, nên gỡ một người hôm nay là vô nghĩa: họ đăng nhập phát nữa là quay lại.

Đổi thành: đã là thành viên thì giữ nguyên; **chưa** là thành viên thì chỉ tạo
khi địa chỉ còn được phép. Và gỡ một người là một việc trọn vẹn trong một giao
dịch — xoá dòng thành viên đồng thời chuyển lời cho phép của họ sang `cancelled`.
Thiếu vế sau thì hai khối trên màn hình lại mâu thuẫn nhau đúng kiểu cũ.

Hook vẫn **không ném lỗi**, giữ nguyên ràng buộc `docs/api.md`: một lượt đọc bảng
hỏng không được phép khoá cả nhà ngoài cửa. Người bị gỡ vẫn đăng nhập được, chỉ
là không còn không gian làm việc — nên phải có một màn nói thẳng điều đó thay vì
để họ rơi vào vòng chuyển hướng.

## Tham số `hd` của Google giữ nguyên đường cũ

`googleHostedDomain()` được gọi lúc dựng cấu hình xác thực, ở phạm vi module, nên
không đọc cơ sở dữ liệu được. Nó tiếp tục đọc biến môi trường. Điều này không hạ
gì cả: `hd` chỉ là gợi ý ở màn chọn tài khoản Google, cổng thật nằm ở hook tạo
người dùng. Sau khi di dời, biến thường rỗng nên `hd` không đặt — đúng y luật mà
vòng `hd-theo-danh-sach` đã ký, không phá bất biến nào của nó.

## Mặt API

Bốn thủ tục mới trong router `workspace`, đều sau `AuthMiddleware`, zod vào và
dịch vụ ra, Prisma nằm trong dịch vụ:

| Thủ tục | Việc |
|---|---|
| danh sách được phép | đọc, kèm ai cho phép và lúc nào |
| cho phép một địa chỉ | thêm dòng, chuẩn hoá địa chỉ, vai trò định trước |
| rút lời cho phép | chuyển dòng sang `cancelled` |
| gỡ một thành viên | xoá tư cách thành viên và rút lời cho phép, một giao dịch |

Quyền dùng `isWorkspaceAdmin` sẵn có. Bất biến **chủ cuối cùng không gỡ được**
theo đúng cách mà việc hạ vai trò đang làm: khoá `FOR UPDATE` trên các dòng chủ
trước khi đếm.

## Đặc tả UX

### 1. Luồng

- Suôn sẻ: màn Members → bấm cho phép một địa chỉ → nhập địa chỉ, chọn vai →
  dòng hiện ở khối được phép vào (điểm ra: ở lại màn Members)
- Biên: khối được phép vào rỗng · người xem là thành viên thường nên không có
  khối nào thao tác được · gỡ người cuối cùng còn giữ quyền chủ
- Lỗi & quay lại: địa chỉ sai dạng → lỗi ngay cạnh ô nhập, con trỏ về ô đó · địa
  chỉ đã có trong danh sách → nói rõ đã có, không tạo dòng thứ hai · gỡ chủ cuối
  → lỗi nói rõ vì sao, danh sách không đổi

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Members | cho biết ai đang ở trong và ai được phép vào | từ Settings / ở lại đây |
| Hộp thoại cho phép | nhận một địa chỉ và một vai | từ nút trên màn Members / về màn Members |
| Hộp thoại xác nhận | chặn một việc không đảo được | từ nút gỡ hoặc nút rút / về màn Members |
| Màn hết quyền | nói thẳng rằng tài khoản này không còn trong không gian làm việc | sau khi đăng nhập / đăng xuất |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-members-loading | Members | khung xám hai khối, chữ `Đang tải…` | chờ |
| ST-members-duocphep-empty | Members | khối được phép vào rỗng, một câu nói chỉ những người trong bảng trên mới vào được, kèm nút cho phép một địa chỉ | bấm cho phép một địa chỉ |
| ST-members-chixem | Members | hai bảng đầy đủ, không nút nào thao tác | đọc |
| ST-members-loi | Members | câu lỗi và nút thử lại | thử lại |
| ST-chophep-dangluu | Hộp thoại cho phép | nút giữ nguyên chữ, có vòng quay, ô nhập khoá | chờ |
| ST-chophep-trung | Hộp thoại cho phép | lỗi cạnh ô nhập nói địa chỉ đã có trong danh sách | sửa địa chỉ hoặc đóng |
| ST-xacnhan-go | Hộp thoại xác nhận | nói rõ gỡ là cắt quyền thật và người đó vào lại sẽ không còn chỗ | xác nhận hoặc thôi |
| ST-xacnhan-rut | Hộp thoại xác nhận | nói rõ rút chỉ chặn người chưa có tài khoản | xác nhận hoặc thôi |
| ST-hetquyen | Màn hết quyền | một câu nói tài khoản không còn trong không gian làm việc, kèm nút đăng xuất | đăng xuất |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô địa chỉ dùng `type="email"`, có nhãn bấm được, có `autocomplete`
- Nút gửi giữ nguyên chữ cho tới khi lượt gọi bắt đầu, rồi mới có vòng quay
- Gỡ và rút đều qua hộp thoại xác nhận — hai việc không đảo được, chuẩn giao diện
  của kho cấm làm ngay lập tức
- Hai hộp thoại giữ cuộn bên trong, không đẩy trang nền
- Cột ngày dùng chữ số đều bề rộng

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| bảng dữ liệu | dùng | khối thành viên đang dùng, khối thứ hai dùng lại y hệt |
| hộp thoại | dùng | đã có trong kho giao diện dùng chung |
| hộp thoại xác nhận | dùng | đã có, không dựng biến thể mới |
| ô nhập, ô chọn, nút | dùng | không cần biến thể mới cho vòng này |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên, không cần tra mẫu — màn hiện tại đã là một bảng danh
sách, vòng này thêm một bảng thứ hai cùng dạng bên dưới. Hai sản phẩm cùng loại
đối chiếu ở bước quét — Vercel Teams và GitHub Organizations — đều xếp lời mời
treo thành khối riêng ngay dưới khối thành viên, không phải một màn khác.

## Thứ phải sửa theo

- `docs/api.md` mất câu *"Signing in is the join; no invite flow"* và câu
  *"the plugin's `invitation` table is unused"* — chính hai câu vòng này lật
- `.env.example` và `docs/environment.md`: `ALLOWED_SIGN_IN` đổi vai thành mồi
  cho lần cài đầu, và nói rõ nó thôi nuôi domain nhà

## Cách chứng minh

Hàm thuần đo bằng một bảng viết trước đủ các hình dạng, hai chiều trên cùng một
bộ đầu vào. Lớp chạm cơ sở dữ liệu đo bằng hệ quả thật: đếm dòng trước và sau.
Bốn thủ tục và hai bất biến đo bằng test thật ở `apps/api`.

Lời cho phép mà các lượt đo ở tầng cổng vào dùng phải do **chính thủ tục cho
phép** tạo ra, không cắm thẳng bằng Prisma cho đúng khuôn bên đọc. Cắm tay thì
bên ghi và bên đọc có thể lệch nhau — chữ hoa trong địa chỉ, hay tên vai viết
khác — mà mọi thước vẫn xanh, còn người thật thì bị chặn ở lượt đăng nhập đầu.

Màn hình đo bằng làn design trong cấu hình. Kho **chưa** wire đường proto nên
nghi thức thẩm mỹ S1-D không chạy được vòng này, và khung hình cho các thước
nhìn-thấy phải tự dựng ở S4: dựng cây đang xét, đặt `APP_URL` và `API_URL` bằng
tay theo cổng của chính cây ấy — bỏ mặc định thì thước đo sẽ chụp bản dev đang
chạy ở checkout khác và hồ sơ nhận khung hình của màn cũ. Cộng một lượt người
nhìn ở Cổng Phạm vi, lần này trên chữ chứ không trên bản bấm được.
