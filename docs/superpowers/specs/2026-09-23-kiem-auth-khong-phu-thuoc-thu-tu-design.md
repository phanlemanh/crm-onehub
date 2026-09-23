# Bài kiểm `packages/auth` không phụ thuộc thứ tự tệp — design

Ngày: 2026-09-23 · Hồ sơ: `_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/` · Hạng T3 (`packages/auth/**`)

## Vấn đề

CI của PR #87 (run 35813904599) đỏ hai ca `cua-google-con-song` trong
`packages/auth/test/chia-mat-khau.integration.spec.ts`, dù PR không chạm
`packages/auth`. Log Better Auth: `Google sign-in rejected: id token hosted domain
(hd) "<missing>" does not satisfy the configured "hd" option "example.com"`.

Hai chỗ đọc cùng một giá trị ở hai thời điểm khác nhau:

- `packages/auth/src/auth.ts:51-52` đọc `googleHostedDomain()` **một lần lúc nạp
  module** và đặt `google.hd`. bun chạy mọi tệp của gói trong một tiến trình, nên
  module auth nạp một lần cho cả lượt.
- Token Google giả trong bài kiểm (`idTokenGia`) gọi lại `googleHostedDomain()`
  **lúc chạy**.

Bốn tệp gán `process.env.ALLOWED_SIGN_IN` mà không trả lại: `cau-tu-choi.spec.ts`,
`hosted-domain.spec.ts`, `cong-vao.integration.spec.ts`,
`tu-choi-khong-de-lai-hang.integration.spec.ts`. Tệp nào trong bốn chạy trước
`chia-mat-khau` thì token giả mang `hd` khác với `hd` auth đã khoá. Trên CI của
PR #87, `cau-tu-choi` chạy ngay trước `chia-mat-khau` (xác nhận từ log CI bởi
phiên PR #87); ở PR #86 thứ tự khác nên xanh.

Tại chỗ không tái hiện được vì `.env` gốc để `GOOGLE_CLIENT_ID=""`: hai ca rẽ vào
nhánh bỏ qua. Tái hiện được khi đặt env giống `.github/workflows/ci.yml`.

## Thiết kế (đã có trong mã, commit `6b66dc6f`)

1. **Token giả khớp đúng cấu hình auth.** `idTokenGia` lấy `hd` từ
   `auth.options.socialProviders?.google?.hd` — chính object mà Better Auth đọc
   `options.hd` để kiểm (`@better-auth/core` `social-providers/google`). Bài kiểm
   thôi đọc env một lần thứ hai.
2. **Tệp nào đổi env thì trả lại env.** Thêm `packages/auth/test/danh-sach-goc.ts`
   với `traLaiDanhSachSauTep()`: ghi giá trị gốc của `ALLOWED_SIGN_IN` lúc tệp nạp,
   trả lại ở `afterAll` (xoá biến nếu gốc vắng). Bốn tệp gọi nó ngay sau import.

Chọn `afterAll` thay `afterEach`: trong một tệp, các ca có thể dựa vào env ca
trước để lại (`cong-vao` có nhánh phụ thuộc trạng thái). `afterAll` giữ nguyên
ngữ nghĩa trong tệp, chỉ chặn rò sang tệp sau.

Phương án bị loại: sửa `auth.ts` để đọc `hd` lúc chạy. Đó là đổi hành vi sản
phẩm ở đường T3 để chiều một bài kiểm; hành vi khoá lúc nạp là đúng cho một tiến
trình máy chủ.

## Cách đo

Mọi phép đo đặt env theo khối `env:` của `ci.yml` (đọc từ tệp, không chép tay) và
chạy trong một bản sao gói ở thư mục ẩn `packages/auth/.sao-*` — `bun test` của
gói bỏ qua thư mục ẩn, và bản thật không bị sửa. Chiều đỏ của mỗi phép đo dùng
**bản tệp gốc lấy từ git ở commit `b812b65a`** (trước bản sửa), không phải đột
biến viết tay.

- Cặp tệp cố định thứ tự: một tệp dò import tệp đổi env rồi `chia-mat-khau`, nên
  thứ tự không phụ thuộc bun.
- Env sau tệp: một preload đăng ký `afterAll` toàn cục, ném lỗi `ENV-RO <gốc> -> <sau>`
  nếu env lệch khi mọi tệp đã chạy xong.
- Thứ tự tệp do bun chọn: `bun test --randomize --seed=<n>`, đọc thứ tự tệp từ
  báo cáo junit; răng kiểm tiền đề "có tệp đổi env đứng trước `chia-mat-khau`" và
  thoát 2 nếu tiền đề mất (bản bun khác xáo khác).

Không có bề mặt người nhìn. Không đổi mã sản phẩm.
