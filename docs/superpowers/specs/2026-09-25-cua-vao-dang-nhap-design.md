# Cửa vào đăng nhập cho người mới — thiết kế

- Ngày: 2026-09-25 · Chủ kho duyệt hướng: Manh Phan (brainstorm 2026-09-25, hai phần)
- Hồ sơ nghiệm thu: `_acceptance/cua-vao-dang-nhap/` · Hạng: **T2** (`apps/app`, `packages/ui`)
- Nhánh: `feat/cua-vao-dang-nhap` từ `origin/onehub` (b7951341)

## 1. Vấn đề

Từ 26/10, OKR mở cho mọi phòng ban, kèm vai «chỉ OKR». Đây là đợt người mới lớn
nhất của CRM, và cửa vào duy nhất họ gặp là `/sign-in`. Hôm nay màn đó:

- không nói người mới phải làm gì để vào được (cột giới thiệu chỉ có «CRM» và
  «Mọi khách hàng, một chỗ.» — «khách hàng» nằm trong _Avoid_ của `CONTEXT.md`);
- **ẩn hẳn cột giới thiệu ở màn hẹp** (`hidden lg:flex`), trong khi liên kết đặt
  mật khẩu đi qua Zalo nên hay được mở trên điện thoại;
- **bỏ im lỗi**: người bị từ chối vì địa chỉ chưa được cho phép bị trả về
  `/sign-in?error=…` mà không thấy câu nào, vì trang không đọc `error`;
- bị ép `dark`, ngược `docs/design.md` (theo giao diện của máy người xem).

## 2. Đã đo (không đoán)

**`/` không phải cửa vào.** Landing của hãng (`app/(landing)/page.tsx`,
`components/landing/*`) chỉ mở khi `IS_MARKETING=true`; OneHub tắt biến này nên
người chưa đăng nhập vào `/` bị `307 → /sign-in`.

**`AuthShell` có năm trang dùng:** `sign-in`, `dat-mat-khau/[token]`,
`grant-access`, `onboarding`, `onboarding/research`.

**Mã lỗi thật mà `/sign-in` nhận** (better-auth 1.6.25, đọc nguồn và chạy thử
ngày 2026-09-25):

1. Hook `user.create.before` (`packages/auth/src/auth.ts` ≈ dòng 272–290) ném
   `APIError("FORBIDDEN", { message })`.
2. `handleOAuthUserInfo` (`better-auth/dist/oauth2/link-account.mjs` ≈ dòng
   115–120) **bắt** lỗi đó và trả `{ error: e.message }` — nên nhánh
   `e.body.code` ở callback không bao giờ chạy cho ca này.
3. Callback (`dist/api/routes/callback.mjs` dòng 161–163; plugin SSO làm y hệt ở
   `@better-auth/sso/dist/index.mjs` dòng 2191) gọi
   `redirectOnError(…, result.error.split(" ").join("_"))`, về
   `errorCallbackURL` = `/sign-in`.

Kết quả: **mã lỗi là câu tiếng Anh của hook, khoảng trắng thành `_`** — không
phải một mã máy gọn. Chạy thử, `searchParams.get("error")` đọc lại được:

| Ca | Giá trị `error` đọc lại |
| --- | --- |
| Có miền chính | `This_CRM_is_private._Sign_in_with_your_@onemount.com_account.` |
| Không có miền chính | `This_CRM_is_private._That_address_is_not_on_the_allow-list.` |
| Chưa khai `ALLOWED_SIGN_IN` | `No_one_can_sign_in_yet:_set_ALLOWED_SIGN_IN_in_.env_to_your_email_domain_(for_example_ALLOWED_SIGN_IN="acme.com")_and_restart.` |

Mã phụ thuộc miền, nên nhận ca «chưa được cho phép» bằng **tiền tố
`This_CRM_is_private.`**, không bằng so trọn chuỗi. Ngoài ra, OAuth trả nguyên
`error` của nhà cung cấp về (callback dòng 56): người bấm huỷ ở trang Google
quay về với `access_denied` (RFC 6749 §4.1.2.1).

Hệ quả phải nói ra: trang đăng nhập sẽ **phụ thuộc vào câu chữ tiếng Anh trong
`packages/auth`**. Đổi câu đó (việc T3) là trang quay về câu chung. Eval ở §7
khoá đúng mối nối này bằng cách rút câu thật từ nguồn, không chép tay.

**PR #104** (`feat/quen-mat-khau`, còn mở) thêm cờ `quenMatKhau` vào
`sso.signInOptions` và liên kết «Quên mật khẩu?» vào `password-sign-in.tsx` —
sửa đúng hai tệp vòng này chạm. Việc logo đã merge (#141): `LogoLockup` có sẵn
ở `packages/ui`.

## 3. Quyết định đã chốt (brainstorm)

- Trang phục vụ **người mới vào lần đầu**. **Hướng A**: một màn, cột trái giới
  thiệu, cột phải khung đăng nhập. Không làm landing dài.
- Cột trái: **«vào thế nào» trước, «là gì» sau**.
- Giữ đường dẫn và `proxy.ts`. Không đụng landing của hãng, `proxy.ts`,
  `packages/auth`.

## 4. Thiết kế

### 4.1 `AuthShell` nhận một chỗ trống

`AuthShell` thêm một prop tuỳ chọn (tên tạm `gioiThieu`). Chỉ `sign-in` truyền
khối hướng dẫn vào; bốn trang kia không truyền và giữ nguyên bố cục (cột trái
có `AuthShader`, «CRM», dòng tiêu đề), chỉ đổi đúng chuỗi dòng tiêu đề theo Q4.
Bỏ `dark` khỏi `<main>` — cả năm trang theo giao diện máy (Q3).

Thứ tự DOM: **khung đăng nhập trước, khối hướng dẫn sau**. Ở `lg` trở lên CSS
đặt khối hướng dẫn sang cột trái; dưới `lg` nó nằm **dưới** nút Đăng nhập. Một
lần render, không nhân đôi DOM. Khối hướng dẫn không có phần tử bấm được, nên
thứ tự Tab không lệch với thứ tự nhìn.

### 4.2 Cột trái (chỉ ở `sign-in`)

1. `LogoLockup` **trang trí, không phải liên kết** (`aria-hidden`), chỉ hiện từ
   `lg`. Liên kết logo duy nhất của trang là logo trong tiêu đề cột phải
   (`AuthHeading`, «Trang chủ»), hiện ở mọi khổ — nên thứ tự Tab giống nhau ở
   320 và 1440 (phản biện 25/09, P1 thứ ba).
2. **«Lần đầu vào?»** — danh sách bước (`StepList` của `packages/ui`):
   - **Bước 1** — Nhờ quản trị viên cho phép địa chỉ email bạn sẽ dùng. Phụ:
     «Ở Cài đặt › Thành viên › Cho phép một địa chỉ.» (chữ nút lấy từ
     `settings-thanh-vien.ts`, không gõ lại).
   - **Bước 2** — chỉ hiện khi có nút đăng nhập ngoài: «Đăng nhập bằng
     <Google | Microsoft | tên SSO>, đúng địa chỉ đó.» Phụ: «Địa chỉ khác sẽ bị
     từ chối.»
   - **Bước 3** — «Muốn dùng mật khẩu? Xin liên kết đặt mật khẩu.» Phụ: «Quản
     trị viên bấm Phát liên kết ở Cài đặt › Thành viên. Liên kết dùng một lần,
     hết hạn sau <n> phút.» `<n>` tính từ `PASSWORD.tokenTtlSeconds`, cùng
     nguồn với trang `dat-mat-khau`. Khi **không** có nút đăng nhập ngoài nào,
     bước này đổi thành đường chính: «Xin liên kết đặt mật khẩu.»
3. Một dòng «là gì», đúng cho cả người kinh doanh lẫn người chỉ làm OKR (Q2).

### 4.3 Cột phải

- Giữ `SsoSignIn`, `SocialSignIn`, `PasswordSignIn` và cách chọn nút hôm nay.
- **Ô báo lỗi** trên cùng khi URL có `error` (bảng ở 4.4).
- «Quên mật khẩu?» đến cùng #104 (trong `PasswordSignIn`); vòng này không tự
  thêm, chỉ giữ nó hiện đúng trong bố cục mới.
- Đổi tiêu đề «Mừng bạn quay lại» thành câu đúng cho cả người mới lẫn người cũ
  (Q1).

### 4.4 Ô báo lỗi

Một hàm thuần `phanLoaiLoiDangNhap(error)` trong tệp riêng của OneHub:

| `error` | Loại | Câu hiện ra (vi) |
| --- | --- | --- |
| vắng / rỗng | — | không hiện ô |
| bắt đầu bằng `This_CRM_is_private.` | chưa được cho phép | **Địa chỉ này chưa được cho phép vào** — Nhờ quản trị viên cho phép đúng địa chỉ email bạn vừa dùng. |
| `access_denied` | tự huỷ | **Bạn đã dừng đăng nhập giữa chừng** — Bấm lại nút đăng nhập để thử lần nữa. |
| mọi giá trị khác | chung | **Chưa đăng nhập được** — Thử lại; nếu vẫn không được, nhờ quản trị viên xem giúp. |

- **Không bao giờ in giá trị lấy từ URL**, kể cả trong thuộc tính. Chỉ loại
  (một trong ba) đi qua ranh giới; câu lấy từ tệp chữ.
- `error` lặp (`?error=a&error=b`) → xét giá trị đầu.
- Ô là `Alert destructive` của `packages/ui` kèm `Icon Warning` và `AlertTitle`
  (khuôn của màn Kết nối; design-pass 25/09 thêm tiêu đề vì bản chỉ-mô-tả trông
  như ghi chú thường), render ở server, có `role="alert"` để trình đọc màn hình
  đọc lên khi trang mở.
- Câu ví dụ của brainstorm nói «địa chỉ Google»; ở đây viết «địa chỉ email» vì
  mã lỗi không cho biết người đi qua Google hay SSO.

### 4.5 Máy chủ tính, client vẽ

`sign-in/page.tsx` (server) tính danh sách bước **từ cùng biến** đã chọn nút
(`social`, `showSso`), nên hướng dẫn không bao giờ nói khác các nút đang hiện.
`signInOptions` lỗi → giữ mặc định hôm nay (hiện Google) và các bước theo đúng
mặc định đó. Khối hướng dẫn và ô lỗi nhận dữ liệu thô (chuỗi đã dịch, mảng
bước); không tệp `"use client"` nào nhập `@crm/auth` hay `@crm/db`.

### 4.6 Chỗ đặt mã — giữ phí bản rẽ nhỏ

Mã mới sống ở tệp riêng của OneHub (vd `components/cua-vao/*`,
`lib/cua-vao/*`, `lib/messages/cua-vao.ts`). Tệp của hãng chỉ sửa hai chỗ:
`auth-shell.tsx` (prop mới, bỏ `dark`) và `sign-in/page.tsx` (đọc `error`, dựng
bước). Không sửa `components/landing/*`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở `/sign-in` (gõ tay, bấm liên kết từ Zalo/Slack, hoặc bị `/` đẩy
  về) → đọc «Lần đầu vào?» → bấm nút Google → vào CRM (điểm ra: `/`).
- Biên: Google tắt → không có bước 2, bước 3 thành đường chính · có SSO → bước
  2 gọi tên SSO · `signInOptions` lỗi → như Google bật · đã đăng nhập → chuyển
  về `/` như hôm nay.
- Lỗi & quay lại: Google trả về vì địa chỉ chưa được cho phép → trở lại
  `/sign-in` với ô lỗi «chưa được cho phép» ngay trên nút → nhờ quản trị viên →
  thử lại bằng đúng địa chỉ. Tự huỷ ở Google → ô «dừng giữa chừng» → bấm lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
| --- | --- | --- |
| `/sign-in` | Cho người vào CRM, và nói người mới cách để được vào | `/`, liên kết, callback lỗi / `/` |
| Bốn trang `AuthShell` khác | Không đổi việc | như hôm nay |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
| --- | --- | --- | --- |
| ST-sign-in-mac-dinh | `/sign-in` | Nút Google, «hoặc», ô mật khẩu; hướng dẫn ba bước | Bấm Google hoặc gõ mật khẩu |
| ST-sign-in-chi-mat-khau | `/sign-in` | Không nút ngoài; hướng dẫn hai bước, bước mật khẩu là đường chính | Xin liên kết đặt mật khẩu |
| ST-sign-in-chua-cho-phep | `/sign-in` | Ô lỗi «chưa được cho phép» trên nút | Nhờ quản trị viên, thử lại |
| ST-sign-in-da-huy | `/sign-in` | Ô lỗi «dừng giữa chừng» | Bấm lại nút |
| ST-sign-in-loi-chung | `/sign-in` | Ô lỗi chung, không lộ giá trị URL | Thử lại / nhờ quản trị viên |
| ST-sign-in-dang-tai | `/sign-in` | Tiêu đề và mô tả (fallback `Suspense`), chưa có nút | Chờ |
| ST-sign-in-hep | `/sign-in` ≤ 1023px | Một cột: logo, tiêu đề, nút; hướng dẫn **dưới** nút Đăng nhập | Như trên |
| ST-shell-khong-khoi | 4 trang còn lại | Bố cục và nội dung như hôm nay, theo giao diện máy | Như hôm nay |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Theo giao diện máy (sáng/tối), không ép `dark`.
- Khổ 320px: không cuộn ngang; hướng dẫn dưới nút Đăng nhập.
- Ô lỗi `role="alert"`, đọc lên khi trang mở; không lấy tiêu điểm.
- Tab: (nút ngoài) → email → mật khẩu → (Quên mật khẩu?) → Đăng nhập; hướng dẫn
  không có phần tử bấm được.
- Tên người dùng nhập, địa chỉ email: không dịch (`translate="no"` theo
  `CLAUDE.md`) — màn này không in lại dữ liệu người nhập nào.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
| --- | --- | --- |
| `StepList` | dùng (bậc 1) | Danh sách bước dọc có sẵn ở `packages/ui` |
| `Alert` | dùng (bậc 1) | Ô báo lỗi có sẵn, có `role="alert"` |
| `LogoLockup` | dùng (bậc 1) | Có từ #141 |
| `AuthShell` | mở rộng | Thêm một prop tuỳ chọn; là component của app, không phải `packages/ui` |
| Khối «Lần đầu vào?» | ghép | Ghép `StepList` + chữ; không vẽ tay |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn (hai cột ở `lg`, một cột cuộn dưới `lg`).
Căn cứ: hướng A đã chốt ở brainstorm — một màn, không landing dài; luồng hiển
nhiên (một việc: vào được CRM), không tra thêm mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## 5. Thứ tự làm và phụ thuộc

- **Làm ngay — S1–S2:** spec này, hợp đồng, evals, và design-pass trên
  `/proto/cua-vao-dang-nhap` theo `docs/proto.md` (bản mẫu ghép từ component
  thật, dữ liệu giả, không chạm tệp đăng nhập thật).
- **S3 chờ PR #104 merge vào `onehub`**, rồi cập nhật nhánh từ `onehub`. (Việc
  logo đã xong.) Mốc lên môi trường thật trước **19/10**, để còn một tuần trước
  26/10.

## 6. Ngoài phạm vi

- Landing của hãng (`/`, `components/landing/*`), `proxy.ts`, `packages/auth`.
- Đổi câu tiếng Anh của hook thành mã máy gọn — là việc T3 riêng; vòng này đọc
  câu thật đang có.
- Trang «Quên mật khẩu» và luồng gửi thư — thuộc #104.
- Microsoft chưa bật; vòng này chỉ bảo đảm hướng dẫn tự đổi theo nút đang hiện.

## 7. Cách chứng minh

1. Test giao diện: khối hướng dẫn chỉ có ở `sign-in`, không có ở bốn trang kia;
   `AuthShell` không nhận khối thì ra đúng cây như hôm nay; mỗi nhánh mã lỗi
   hiện đúng câu và không in giá trị URL (kể cả chuỗi chứa thẻ HTML).
2. Eval mã lỗi **rút câu thật từ nguồn**: đọc chuỗi ném trong `user.create.before`
   của `packages/auth/src/auth.ts`, kiểm phép biến đổi `split(" ").join("_")` còn
   ở `callback.mjs` của bản better-auth đang cài, cho đi qua `URLSearchParams`,
   rồi đưa vào `phanLoaiLoiDangNhap`. Cặp hai chiều: câu thật → «chưa được cho
   phép»; câu hook bị sửa trong bản sao → eval đỏ gọi tên mối nối.
3. Ảnh chụp 320, 768, 1024, 1440px × sáng, tối. Ở 320px hướng dẫn nằm dưới nút
   Đăng nhập, không cuộn ngang.
4. Truy cập: thứ tự Tab, tương phản AA ở cả hai giao diện, ô lỗi được đọc lên.
5. Soát chữ theo `CONTEXT.md`; câu phân vân hỏi người thật (§8).
6. Năm lệnh: `bun run test`, `check-types`, `lint`, `lint:slop`, `build`.

Giới hạn đã biết: chuỗi đầy đủ Google → callback → `/sign-in?error=` không chạy
đầu-cuối trong test (cần một nhà cung cấp OAuth giả); nó được khoá bằng hai mỏ
neo nguồn ở mục 2.

## 8. Quyết định của chủ kho (2026-09-25, «duyệt theo đề xuất»)

- **Q1 — tiêu đề cột phải:** «Đăng nhập vào CRM», mô tả «Dùng email công ty của
  bạn.» Thay «Mừng bạn quay lại».
  **Chờ phê lại ở Cổng Phạm vi:** hồ sơ `vao-bang-email-va-mat-khau` ghi nhân
  viên kinh doanh dùng Gmail cá nhân. «Email công ty» sẽ dẫn họ đưa sai địa chỉ
  cho quản trị viên. Máy tạm viết mô tả «Dùng đúng địa chỉ email đã được cho
  phép.» và bước 1 «địa chỉ email bạn sẽ dùng» (giả định 2 của `opportunity.md`).
- **Q2 — dòng «là gì»:** «CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR.»
  Rủi ro đã biết: người vai «chỉ OKR» có thể tưởng mình sẽ thấy đối tác — soát
  lại ở lái-thử người lạ.
- **Q3 — nền:** bỏ `dark` cho cả năm trang. `sign-in` dùng nền `muted` phẳng,
  không `AuthShader`. Bốn trang kia giữ `AuthShader`.
- **Q4 — chữ «Mọi khách hàng, một chỗ.»:** đổi đúng chuỗi này (vi và en) sang
  dòng «là gì» của Q2. Bốn trang kia không đổi bố cục.
- **Q5 — ngưỡng Cổng Giá trị:** dùng. Hồ sơ cơ hoi `_acceptance/cua-vao-dang-nhap/opportunity.md`
  mở trước hợp đồng; hợp đồng có mục `## Đường đo`.
