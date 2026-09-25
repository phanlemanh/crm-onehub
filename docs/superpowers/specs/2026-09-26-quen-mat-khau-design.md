# Quên mật khẩu — người dùng tự xin liên kết đặt lại (tiếp quản PR #104)

Ngày: 2026-09-26 · Hạng: T3 · Hồ sơ: `_acceptance/quen-mat-khau/`
Nguồn: PR phanlemanh/crm-onehub#104 (tuandoviet1, commit 2818333d), chủ kho giao
tiếp quản 26/09. Thiết kế duyệt trong chat 26/09 với Q1 = A, Q2 = A.

## Vì sao

Vòng `vao-bang-email-va-mat-khau` dựng cửa mật khẩu nhưng cắt hai thứ vì kho không
gửi được thư: d-4 (người dùng không tự xin được liên kết, mỗi lần quên phải nhờ
quản trị) và d-5 (không báo cho chủ tài khoản khi mật khẩu bị đổi). PR #104 thêm
năng lực gửi thư qua REST của Resend và mở lại cả hai. Vòng này đưa PR lên
`onehub` sau khi vá những gì đo được là hỏng. Hồ sơ `cua-vao-dang-nhap` đang chờ
nó để làm S3, và cửa vào phải lên môi trường thật trước 19/10.

## Đo được gì ở PR #104 (26/09)

1. `/quen-mat-khau` không nằm trong `ANONYMOUS` (`apps/app/lib/proxy-paths.ts`):
   người chưa đăng nhập bị `proxy.ts` đá về `/sign-in`. Tính năng không chạy với
   đúng người nó nhắm tới.
2. `sendResetPassword` chạy qua `ctx.context.runInBackgroundOrAwait`. Kho không
   khai `advanced.backgroundTasks`, nên better-auth **chờ** gửi thư xong mới trả
   lời (`create-context.mjs`: không có handler thì `await promise`). Nhánh địa
   chỉ lạ chỉ đọc giả một lần. Chênh lệch bằng trọn một lượt gọi Resend, tới 8s.
3. `onPasswordReset` được `await` ngay trong `/reset-password`: Resend chậm thì
   lượt đặt mật khẩu treo theo.
4. Form hiện «Kiểm tra hộp thư» cả khi lượt gửi lỗi (429, mạng đứt).
5. Câu «còn hạn một giờ» viết cứng, không suy từ `PASSWORD.tokenTtlSeconds`.
6. Test `Auth (e2e) > lets the sign-in page read what it may offer` đỏ: kỳ vọng
   `toEqual` chưa có `quenMatKhau`. Đường nền S1 xác nhận đây là ca đỏ duy nhất.
7. `guiThu` ghi 200 ký tự đầu thân lỗi của Resend vào log. Thân đó có thể chứa
   địa chỉ người nhận, trái luật log của `docs/api.md`.

## Thiết kế

### Máy chủ (`packages/auth`)

- **Chạy nền.** Thêm `@vercel/functions` vào `packages/auth`. Một hàm `chayNen(p)`
  gọi `waitUntil(p)`, và được khai làm `advanced.backgroundTasks.handler`. Đã đọc
  bản 3.9.9: ngoài Vercel `getContext()` trả `{}`, nên `waitUntil` không làm gì
  còn promise vẫn chạy trong tiến trình Node sống lâu (self-host, test). Phụ thuộc
  kéo theo duy nhất là `@vercel/oidc`. `onPasswordReset` không đi qua
  `runInBackgroundOrAwait` của thư viện, nên nó gọi thẳng `chayNen` rồi trả về
  ngay.
- **Cấu hình thư đọc lúc gọi, không chụp lúc nạp.** `isMailConfigured()` và
  `guiThu` đọc `RESEND_API_KEY` + `MAIL_FROM` mỗi lần gọi, giống cách
  `ALLOWED_SIGN_IN` được «parsed on demand». `env.ts` vẫn kiểm cặp một lần lúc
  nạp và ném lỗi nêu tên cả hai biến khi chỉ có một. `sendResetPassword` luôn
  được khai; khi thư chưa cấu hình nó trả về ngay, không tra DB, không gọi ra
  ngoài. Lý do bỏ phương án «chỉ khai khi có thư»: cấu hình better-auth dựng một
  lần lúc nạp, nên một tiến trình test không bật/tắt được, và endpoint trả 400
  khi tắt chẳng che thêm gì.
- **Chỉ gửi cho người còn quyền vào.** `decideSignInFromDb` giữ nguyên như PR.
  Nay nó chạy trong nền nên không còn ảnh hưởng thời gian trả lời.
- **Đặt xong thì dọn chìa còn treo.** `onPasswordReset` **`await`** `donChiaCu(user.id)`
  TRƯỚC khi đẩy thư báo vào `chayNen`. Đây là đúng hàm vòng trước dùng cho luồng
  quản trị: mọi liên kết khác người đó xin trước đó chết theo, ngay trong câu trả
  lời. Chỉ lá thư chạy nền; việc dọn chìa không phụ thuộc Resend sống hay chết.
  Thư viện chỉ tự tiêu thụ đúng chìa vừa dùng.
- **Log không mang dữ liệu người.** `guiThu` ghi mã trạng thái, không ghi thân lỗi
  của Resend.
- **Giới hạn tần suất.** (Sửa 26/09, chủ kho chọn hướng b — xem Notes của hợp
  đồng.) Ba lượt mỗi 60 giây, không phải 15 phút như PR: bộ dọn của better-auth
  xoá hàng đếm cũ hơn 60 giây. Bản gốc của mục này: ba lượt mỗi 15 phút cho
  `/request-password-reset`, tính theo địa chỉ IP (bộ đếm của better-auth). Cấu
  hình hiện có của kho đã khai `rateLimit.enabled: true` (không phụ thuộc
  `NODE_ENV`) và `storage: "database"`, nên mọi instance trên Vercel dùng chung
  một bộ đếm. Test khẳng định cả hai giá trị này, để không ai đổi về `memory` mà
  lưới không thấy.

### API (`apps/api`)

- `sso.signInOptions` trả `quenMatKhau: isMailConfigured()`. Tên cờ giữ nguyên
  vì vòng `cua-vao-dang-nhap` đọc đúng tên này.
- `env.validation.ts` khai hai biến như PR. `turbo.json` `globalPassThroughEnv`
  và `.env.example` như PR.
- `docs/api.md` thêm một ngoại lệ có tên (Q2 = A) cạnh ngoại lệ bộ lấy tỷ giá:
  thư giao dịch của luồng xác thực gửi thẳng từ `packages/auth`, không qua agent.
  Lý do: chìa đặt lại không được nằm trần trong một hàng `AgentTask`, và agent
  ngừng thì người dùng ngồi chờ một lá thư không bao giờ tới. Không có «trí khôn»
  nào về người hay công ty ở đây.

### App (`apps/app`)

- Thêm `/quen-mat-khau` vào `ANONYMOUS`.
- Quyết định «hiện trang hay về `/sign-in`» tách ra một hàm thuần trong
  `lib/`, để test được mà không cần `mock.module`.
- Form: trạng thái lỗi (câu lỗi kèm cách thử lại, ở lại form, giữ chữ đã gõ),
  câu riêng cho 429, câu hạn dùng mang số phút thật do trang máy chủ truyền xuống.
  Ô email có `name`, `spellCheck={false}`, `inputMode="email"`, theo
  web-interface-guidelines. Màn «đã gửi» đặt trong vùng `aria-live="polite"`.
- Liên kết «Quên mật khẩu?» dùng `Button asChild variant="link"` thay cho `Link`
  tự đặt `className`.
- **Lệch so với lúc duyệt:** tôi đã nói form sẽ dùng `AuthHeading`. Đọc mã mới
  biết `AuthHeading` là component máy chủ bất đồng bộ, form client không gọi
  được. Form `/dat-mat-khau` của vòng trước (đã ký) cũng tự vẽ `Heading` vì lý do
  này. Giữ khuôn đó, và ghi vào sổ quyết định để duyệt lại ở Cổng 1.

## Ngoài phạm vi

- Bánh phiên 5 phút: đổi mật khẩu chưa cắt phiên cũ tức thì, như contract vòng
  trước đã khai.
- Chênh lệch thời gian còn lại giữa nhánh có tài khoản (ghi một hàng
  `verification`) và nhánh không có (đọc một hàng). Đó là mức giảm thiểu của chính
  better-auth; vòng này đo tới mức «không chờ thư», không đo tới mili-giây của DB.
- Giới hạn theo địa chỉ nhận: nhiều IP vẫn dội được hộp thư của một người.
- Xin liên kết mới không huỷ liên kết cũ còn hạn. Chỉ đặt mật khẩu thành công mới
  dọn.
- Thư HTML có nhận diện thương hiệu; xử lý thư dội và báo spam.
- Xác minh SPF/DKIM ở Resend, cắm khoá lên hai dự án Vercel: việc vận hành của
  chủ kho.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: `/sign-in` → bấm «Quên mật khẩu?» → `/quen-mat-khau` nhập địa chỉ →
  «Gửi liên kết» → màn «Kiểm tra hộp thư» → mở thư → `/dat-mat-khau/<chìa>` (luồng
  của vòng trước) → đăng nhập. Điểm ra: `/sign-in`.
- Biên: thư chưa cấu hình → không có liên kết ở `/sign-in`, gõ thẳng
  `/quen-mat-khau` thì về `/sign-in`. Địa chỉ lạ, đã bị thu quyền, hoặc chỉ vào
  bằng Google → cùng màn «Kiểm tra hộp thư», chữ không nói địa chỉ có tài khoản
  hay không. Người đang đăng nhập mở `/quen-mat-khau` → trang vẫn hiện, như
  `/dat-mat-khau`.
- Lỗi & quay lại: mạng đứt hoặc máy chủ lỗi → câu lỗi trên form, chữ đã gõ còn
  nguyên, bấm gửi lại được. Quá ba lượt → câu riêng bảo chờ rồi thử lại. Mọi màn
  có «Quay lại đăng nhập».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| `/sign-in` (thêm một liên kết) | đăng nhập; liên kết mở đường quên | vào thẳng / `/quen-mat-khau` |
| `/quen-mat-khau` | xin một liên kết đặt lại qua thư | `/sign-in` / hộp thư, `/sign-in` |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dang-nhap-co-lien-ket | `/sign-in` | «Quên mật khẩu?» dưới ô mật khẩu | bấm để sang `/quen-mat-khau` |
| ST-dang-nhap-khong-lien-ket | `/sign-in` | không có liên kết (thư chưa cấu hình) | nhờ quản trị như trước |
| ST-quen-mat-khau-trong | `/quen-mat-khau` | tiêu đề, ô «Địa chỉ email», nút «Gửi liên kết» | gõ địa chỉ |
| ST-quen-mat-khau-dang-gui | `/quen-mat-khau` | nút tắt + vòng xoay + «Đang gửi…» | chờ |
| ST-quen-mat-khau-da-gui | `/quen-mat-khau` | «Kiểm tra hộp thư» + câu có số phút thật, không nói địa chỉ có tài khoản | mở thư, hoặc «Quay lại đăng nhập» |
| ST-quen-mat-khau-loi | `/quen-mat-khau` | câu lỗi kèm cách thử lại, chữ đã gõ còn | bấm gửi lại |
| ST-quen-mat-khau-qua-luot | `/quen-mat-khau` | câu riêng: đã xin quá nhiều lần, chờ rồi thử lại | chờ |
| ST-quen-mat-khau-tat | `/quen-mat-khau` | không hiện, chuyển hướng về `/sign-in` | đăng nhập hoặc nhờ quản trị |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô email: `type="email"`, `required`, `autoComplete="email"`, `name`,
  `spellCheck={false}`, `inputMode="email"`. Trình duyệt tự chặn địa chỉ sai
  khuôn trước khi gửi.
- Nút gửi tắt trong lúc gửi. Enter trong ô là gửi.
- Màn «đã gửi» thay chỗ form trong một vùng `aria-live="polite"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `AuthShell` | dùng | khung chung mọi màn xác thực |
| `Field`, `FieldLabel`, `Input`, `Button`, `Spinner` | dùng | `@crm/ui`, như `/dat-mat-khau` |
| `Alert` (destructive) | dùng | câu lỗi, cùng khuôn `password-sign-in.tsx` |
| `Button variant="link"` | dùng | liên kết «Quên mật khẩu?», bỏ `className` tự đặt |
| `Heading` cục bộ | ghép | `AuthHeading` là component máy chủ; chép khuôn `/dat-mat-khau` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — một ô, một nút, một màn xác nhận, nằm trong `AuthShell`
như `/sign-in` và `/dat-mat-khau`; không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm bằng gì

Mười ba AC ở `_acceptance/quen-mat-khau/contract.md`. Phần máy chủ đo bằng test
tích hợp trong `packages/auth` gọi `auth.handler` thật với `fetch` tới Resend được
thay tạm (không `mock.module`). Cờ đo ở `apps/api`. Form đo bằng test DOM. Mặt
nhìn thấy chụp bằng một lượt ui-check.
