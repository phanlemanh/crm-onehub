## Trong hợp đồng

(không có finding nào map được vào AC — danh sách rỗng)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The forgot-password page builds its own heading, so the loading state shows the logo and the loaded page does not**
  Người dùng thấy gì: Khi trang xin liên kết đặt lại mật khẩu tải xong, logo OneHub biến mất khỏi màn hình và bố cục hơi giật, khác với trải nghiệm ở trang đăng nhập.
  file: `apps/app/app/(landing)/quen-mat-khau/quen-mat-khau-form.tsx`
  severity: medium
  Đề xuất: new-contract

- **The seconds-to-minutes constant is defined again in two new files instead of once**
  Người dùng thấy gì: Người dùng không thấy khác biệt gì; đây chỉ là cách tổ chức mã nguồn nội bộ chưa gọn.
  file: `packages/auth/src/thu-mat-khau.ts`
  severity: low
  Đề xuất: known-limits

- **Mail config breaks the one-time `env` pattern: a bare top-level call plus a fresh read of process.env on every check**
  Người dùng thấy gì: Người dùng không thấy khác biệt; hành vi từ chối cấu hình thư thiếu vẫn đúng như cam kết, đây chỉ là cách viết mã nội bộ có thể gọn hơn.
  file: `packages/auth/src/env.ts`
  severity: low
  Đề xuất: known-limits

- **Proxy signs a browser-supplied x-real-ip when not running on Vercel, so callers can pick their own rate-limit bucket**
  Người dùng thấy gì: Nếu công ty tự vận hành máy chủ thay vì dùng Vercel mà chưa cấu hình đúng, một người có thể né được giới hạn số lần xin liên kết hoặc số lần thử đăng nhập bằng cách tự đặt địa chỉ IP giả cho mình.
  file: `packages/auth/src/dia-chi.ts`
  severity: medium
  Đề xuất: known-limits

- **If onPasswordReset throws, sessions are not revoked after the password has already changed**
  Người dùng thấy gì: Trong một số ít trường hợp lỗi hệ thống hiếm gặp, sau khi người dùng đặt lại mật khẩu thành công, các phiên đăng nhập cũ (kể cả của người đã chiếm được tài khoản) có thể chưa bị đăng xuất ngay.
  file: `packages/auth/src/auth.ts`
  severity: low
  Đề xuất: known-limits

- **Mail send failures return only a boolean and log only a status code; the reason from Resend is thrown away**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng; khi gửi thư báo lỗi ở hậu trường, đội vận hành sẽ có ít chi tiết hơn để tra lỗi, nhưng đây là lựa chọn có chủ đích để không lộ dữ liệu nhạy cảm trong log.
  file: `packages/auth/src/thu.ts`
  severity: low
  Đề xuất: wont-fix

- **Shape 3 (checks that a string is present when the promise is a relation between values): E18 never checks that the minutes on screen come from the right constant**
  Người dùng thấy gì: Nếu sau này có ai lỡ tay đổi nhầm số phút hiển thị trên hai màn hình xin liên kết, người dùng có thể thấy thời hạn liên kết hoặc thời gian phải chờ bị sai lệch mà không ai phát hiện ra trước khi phát hành.
  file: `_acceptance/quen-mat-khau/rang/chup.mjs`
  severity: medium
  Đề xuất: new-contract

- **Shape 4 (negative assertion on its own): het-han asserts login is false with no positive control, and the helper swallows every error**
  Người dùng thấy gì: Nếu quy trình từ chối liên kết đã hết hạn bị hỏng ngầm sau này, người dùng có thể không phát hiện ra vấn đề trước khi tính năng được phát hành.
  file: `packages/auth/test/quen-mat-khau.integration.spec.ts`
  severity: medium
  Đề xuất: new-contract

- **Shape 3 (checks that something is present when the promise is a relation): E18's network-error case only checks that some Alert exists, not that it is the error message**
  Người dùng thấy gì: Nếu thông báo lỗi mạng và thông báo quá lượt bị lẫn nội dung với nhau sau này, người dùng có thể nhận nhầm lý do lỗi mà không ai phát hiện ra trước khi phát hành.
  file: `_acceptance/quen-mat-khau/rang/chup.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion on its own): in chay-nen the only real check without a Vercel context is not.toThrow; the positive half is a tautology**
  Người dùng thấy gì: Nếu việc gửi thư ở hậu trường (ví dụ thư báo đổi mật khẩu) âm thầm bị hỏng sau này, người dùng nhận thư có thể không hay biết, và phép đo hiện tại chưa chắc phát hiện ra.
  file: `packages/auth/test/chay-nen.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).