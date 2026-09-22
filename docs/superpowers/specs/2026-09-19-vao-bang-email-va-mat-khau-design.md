# Vào được CRM từ mạng đang chặn Google — đăng nhập bằng email và mật khẩu

Ngày 2026-09-19 · hồ sơ cơ hội `_acceptance/vao-bang-email-va-mat-khau/opportunity.md`
(Cổng Đáng ký 2026-09-19, `decision: build`) · hạng T3.

## Vấn đề

Nhân viên kinh doanh dùng Gmail cá nhân. Ở một số mạng nội bộ và mạng doanh
nghiệp khách hàng, các dịch vụ Google không vào được. Đứng trong mạng đó, cả ba
cửa hiện có đều chết: Google, Microsoft, SSO — cả ba đều phải đi ra một nhà cung
cấp bên ngoài. Tài khoản có đủ, mà cú chuyển hướng đăng nhập không tới đâu.

Cửa mật khẩu là cửa duy nhất **không gọi ra ngoài một lần nào**: nó đi thẳng vào
máy chủ của chính mình.

Ứng dụng không nạp tài nguyên nào của Google lúc chạy — phông chữ khai qua
`next/font/google` được tải về lúc dựng bản và phục vụ từ máy chủ của mình. Nên
gỡ cú chuyển hướng là gỡ hết chỗ tắc, không phải gỡ một nửa.

## Quyết định nền: mật khẩu đầu tiên đi bằng liên kết, không bằng mật khẩu tạm

Quản trị phát một **liên kết dùng một lần, có hạn**; người dùng mở và tự đặt mật
khẩu. Quản trị không bao giờ nhìn thấy mật khẩu của ai.

Đổi lại lối "quản trị đặt mật khẩu tạm rồi bắt đổi ở lần đầu": lối đó cần một cơ
chế chặn-bắt-đổi gác ở **mọi** đường vào ứng dụng, không chỉ màn đăng nhập — phần
đắt nhất và dễ hở nhất. Liên kết không cần nó.

Chuẩn ngành hậu thuẫn: OWASP ASVS V2.5 đòi bí mật kích hoạt ban đầu không đi dạng
chữ trần. Liên kết đi qua Zalo *là* chữ trần — nhưng nó không mang mật khẩu, nó
mang một giấy phép dùng một lần có hạn. NIST SP 800-63B Rev 4 đòi credential phục
hồi phải dùng một lần, đi kênh tách khỏi kênh đăng nhập chính, và hết hạn tính
bằng phút tới giờ. Zalo là kênh tách; hạn đặt theo phút.

## Kiến trúc

### Mượn nguyên bộ đặt-lại-mật-khẩu của thư viện, đổi đường giao liên kết

Thư viện xác thực trong kho (better-auth 1.6.25) đã có sẵn trọn cơ chế: token
nằm ở bảng `verification` với định danh tiền tố `reset-password:`, giá trị là id
người dùng, có `expiresAt`; điểm cuối `/reset-password` tiêu thụ token đúng một
lần, băm mật khẩu, và huỷ các phiên cũ.

Thứ duy nhất không dùng là **đường giao**: bình thường liên kết đi qua hàm
`sendResetPassword` để gửi thư. Kho này không gửi được thư, nên liên kết đi
đường khác — trả thẳng về cho quản trị trong câu trả lời của thủ tục.

Chỗ đánh đổi: đúc token tay nghĩa là dựa vào một chi tiết bên trong thư viện —
cái tiền tố định danh. Bản thư viện mới đổi tiền tố là hỏng câm. Bịt bằng phép đo
vòng tròn đúc-rồi-tiêu-thụ ở AC-3: nó xanh khi vòng khép, và đỏ ngay lượt nâng
cấp nào phá tiền tố.

Đã loại: bật plugin `admin` của thư viện. Nó đòi bốn cột mới trên bảng người dùng
(`role`, `banned`, `banReason`, `banExpires`), tức một migration, và dựng một
khái niệm vai trò **thứ hai** đứng cạnh vai trò không gian làm việc đang có. Nó
cũng đặt mật khẩu hộ — trái quyết định nền ở trên.

### Ba khoá cấu hình, không thương lượng

- `emailAndPassword.enabled: true`
- `emailAndPassword.disableSignUp: true` — **bịt lỗ chiếm danh tính**. Không có
  nó, ai biết địa chỉ công ty của một đồng nghiệp **chưa từng đăng nhập lần nào**
  thì tự đăng ký trước, và từ đó họ *là* người đó trong CRM. Danh sách được vào
  KHÔNG bịt lỗ này: nó hỏi "địa chỉ này có được phép không", không hỏi "người gõ
  có phải chủ địa chỉ không".
- `emailAndPassword.revokeSessionsOnPasswordReset: true`

Thêm: độ dài tối thiểu khai tường minh, và sàng mật khẩu qua danh sách đã lộ —
NIST Rev 4 đòi sàng danh sách chặn, và cấm bắt đổi định kỳ.

**Sửa sau vòng soi cuối (2026-09-19), giữ vết vì tài liệu đã ký ở Cổng Phạm vi:**
bản đầu khai sàng bằng bộ nối `haveibeenpwned` của thư viện. Bộ nối đó bọc bước
**băm** mật khẩu, mà bước băm chạy SAU khi token bị tiêu thụ — nên mỗi lần từ
chối là đốt luôn liên kết dùng-một-lần, và người dùng đọc «chọn mật khẩu khác»
mà không còn liên kết để chọn lại. Tệ hơn: bộ nối gọi ra `api.pwnedpasswords.com`
và hỏng-là-chặn, nên trong đúng loại mạng chặn host ngoài mà tính năng này sinh
ra để phục vụ thì không ai đặt được mật khẩu.

Nay phép sàng chạy ở `hooks.before`, TRƯỚC khi token bị tiêu thụ, và
**hỏng-là-cho-qua** kèm một dòng log — theo luật `AGENTS.md`: thứ self-hoster có
thể không có là tuỳ chọn và không bao giờ được ném. NIST đòi sàng danh sách chặn;
nó không đòi khoá cửa khi danh sách offline. Tiêu chí AC-8 giữ nguyên, chỉ đổi
cách thi hành.

### Ca người chưa có tài khoản

Token của thư viện trỏ tới một **người dùng đã tồn tại**. Hàng danh sách được vào
ở trạng thái `pending` thì chưa có hàng người dùng nào. Nên thủ tục phát liên kết
phải: chưa có hàng người dùng thì tạo trước rồi mới đúc token.

Việc tạo đó vẫn đi qua đúng cổng chặn người lạ đang có (`databaseHooks.user.create.before`),
và tư cách thành viên vẫn sinh ở lần tạo phiên đầu như cũ. Không thêm đường tắt.

### Quyền phải có tên

Theo `docs/api.md`: quyền sống ở `@crm/auth` thành hàm có tên, service dùng nó
*và* giao diện dùng nó để tắt nút, "để cái nút và lỗi 403 không nói khác nhau".
Nên có một vị từ mới cạnh `canChangeRole` / `canConfigureSso` đang có.

### Trang đặt mật khẩu nằm ngoài cổng

`proxy.ts` hiện thả ba đường: `/sign-in`, `/grant-access`, `/eve`. Trang đặt mật
khẩu là đường thứ tư — người mở liên kết chưa đăng nhập; quên là họ bị đá về màn
đăng nhập ngay trên chính liên kết vừa nhận.

## Giới hạn đã biết — khai tại Cổng Phạm vi

OWASP ASVS đòi **báo cho người dùng sau khi thông tin đăng nhập bị đổi**. Kho
không gửi được thư, và `notifySignedIn` chỉ là sổ đăng ký hàm trong tiến trình,
không phải kênh tới người. Vế này **không làm được vòng này**.

Phần làm được: **ghi vết** — ai phát liên kết cho ai, lúc nào, hiện trên màn
Thành viên. Đó là dấu vết cho người quản trị, không phải lời báo cho người dùng.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: màn Thành viên → quản trị bấm «Phát liên kết đặt mật khẩu» trên một
  hàng → hộp thoại hiện liên kết + nút chép → quản trị dán vào Zalo → người dùng
  mở liên kết → đặt mật khẩu hai lần → về màn đăng nhập, đăng nhập được
  (điểm ra: màn chính của CRM)
- Biên: người chưa có tài khoản (hàng danh sách `pending`) — cùng một nút, hệ
  thống tự tạo hàng người dùng trước · thành viên thường mở màn Thành viên thì
  nút tắt sẵn
- Lỗi & quay lại: liên kết hết hạn / đã dùng / không tồn tại → trang đặt mật khẩu
  nói thẳng ca nào và mời xin liên kết mới · mật khẩu quá ngắn hoặc nằm trong
  danh sách đã lộ → báo ngay tại ô, không mất thứ đã gõ ở ô kia

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thành viên (đã có, thêm một nút) | trao chìa vào tay một người | từ cài đặt / ra hộp thoại liên kết |
| Hộp thoại liên kết (mới) | chép được liên kết đúng một lần | từ màn Thành viên / ra clipboard |
| Đặt mật khẩu (mới) | đặt mật khẩu cho chính mình | từ liên kết Zalo / ra màn đăng nhập |
| Đăng nhập (đã có, thêm một ô) | vào được, kể cả khi Google chết | từ mọi nơi / ra màn chính |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-thanhvien-nutat | Thành viên | nút phát liên kết mờ, kèm lý do khi rê chuột | không làm gì được — cần quyền |
| ST-thanhvien-dangphat | Thành viên | nút ở trạng thái đang chạy | chờ |
| ST-thanhvien-covet | Thành viên | trên hàng người nhận: ai đã phát liên kết và phát lúc nào | đọc, hoặc phát lại |
| ST-hopthoai-colienket | Hộp thoại liên kết | liên kết đầy đủ + nút chép + hạn dùng bằng chữ | chép rồi gửi Zalo |
| ST-hopthoai-dachep | Hộp thoại liên kết | liên kết + lời xác nhận đã chép | dán vào Zalo |
| ST-hopthoai-loi | Hộp thoại liên kết | câu lỗi thật, không mã máy | đóng, thử lại |
| ST-datmk-nhap | Đặt mật khẩu | hai ô mật khẩu + mức tối thiểu nói trước | gõ rồi gửi |
| ST-datmk-chiaxau | Đặt mật khẩu | câu nói rõ ca: hết hạn / đã dùng / không có | xin liên kết mới |
| ST-datmk-mkyeu | Đặt mật khẩu | lý do tại ô: quá ngắn, hoặc đã lộ | sửa mật khẩu |
| ST-datmk-xong | Đặt mật khẩu | một câu xong + đường về đăng nhập | đăng nhập |
| ST-dangnhap-hailoi | Đăng nhập | nút Google và ô email/mật khẩu cùng trên màn | chọn một lối |
| ST-dangnhap-sai | Đăng nhập | một câu sai chung, không nói sai ô nào | gõ lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Màn đăng nhập sai thì nói một câu chung, không tiết lộ địa chỉ có tồn tại hay
  không — tránh dò danh sách người dùng.
- Trang đặt mật khẩu thì ngược lại: nói rõ liên kết hết hạn hay đã dùng, vì người
  đứng đó đã cầm token và cần biết phải làm gì tiếp.
- Hạn của liên kết hiện bằng chữ người đọc được, không phải dấu thời gian máy.
- Liên kết trong hộp thoại chọn được bằng bàn phím và chép được không cần chuột.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| Dialog, Button, Input, Label | dùng | `@crm/ui` đã có, không dựng lại |
| Hộp thoại liên kết | ghép | ghép từ Dialog + Input chỉ-đọc + nút chép đã có ở `copy-value.tsx` |
| Form đặt mật khẩu | ghép | ghép từ Input + Button trong khung `AuthShell` đang có |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: trang đặt mật khẩu có đúng một việc và hai ô; luồng hiển nhiên nên không
tra mẫu. Màn Thành viên giữ nguyên khuôn danh-sách-chi-tiết đang có, feature này
chỉ thêm một hành động lên hàng.

<!-- UX-SPEC-TEMPLATE>>> -->

## Cách đo

Phép đo xương sống là **vòng tròn đúc-rồi-tiêu-thụ**: đúc token, đổi mật khẩu
bằng nó, đăng nhập được bằng email và mật khẩu mới. Chiều đỏ của nó chính là thứ
bịt rủi ro kiến trúc: phá tiền tố định danh thì phép đo phải đỏ, không được im.

Các phép đo còn lại bám đúng tám ô Core của lưới chống sót, cộng hai ô cắt ngang
(nhãn tiếng Việt, ghi vết).

## Ngoài phạm vi

- Gửi thư ra ngoài — kho chưa có một dòng nào; ô cơ hội riêng.
- Người dùng tự đổi mật khẩu khi đang đăng nhập — chủ kho cắt 2026-09-19.
- Xác thực hai bước.
- Thu hồi một liên kết đã phát trước khi nó hết hạn — hạn ngắn che phần lớn.
- Báo cho người dùng khi mật khẩu đổi — chặn bởi kho không gửi được thư.
- Đăng nhập bằng Zalo — thêm một nhà cung cấp ngoài, không gỡ được chỗ đau.
