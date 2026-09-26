## Trong hợp đồng

(không có — không finding nào map được vào một AC trong hợp đồng round này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Heading copied into a second feature folder instead of moved to packages/ui**
  Người dùng thấy gì: Nếu sau này cần đổi cỡ chữ hay câu chữ của tiêu đề trên các trang liên quan tới mật khẩu, đội ngũ phải nhớ sửa đúng ở nhiều trang cùng lúc; quên một chỗ thì các trang sẽ hiển thị không đồng nhất với nhau.
  file: `apps/app/app/(landing)/quen-mat-khau/quen-mat-khau-form.tsx`
  severity: medium
  Đề xuất: known-limits

- **Minute conversion constant written again in two new files; the unit has no single base**
  Người dùng thấy gì: Số phút hiển thị trên màn hình và số phút nói trong thư có thể lệch nhau nếu sau này có người chỉ sửa một chỗ mà quên các chỗ còn lại, khiến người dùng nhận thông tin sai về thời hạn.
  file: `packages/auth/src/thu-mat-khau.ts`
  severity: low
  Đề xuất: known-limits

- **Mail config breaks the env-object pattern the file uses for every other credential pair**
  Người dùng thấy gì: Nếu sau này thay đổi cách nạp cấu hình gửi thư, có nguy cơ hai chỗ đọc cấu hình khác nhau lệch thông tin, có thể làm việc gửi thư báo hoặc thư mời đặt lại mật khẩu chạy sai mà khó phát hiện.
  file: `packages/auth/src/env.ts`
  severity: low
  Đề xuất: known-limits

- **Direct-to-API auth requests (OAuth/SSO callbacks) now share one global rate-limit bucket, which lets one caller lock everyone out**
  Người dùng thấy gì: Nếu ai đó gửi dồn dập yêu cầu đăng nhập bằng Google/Microsoft/Slack thẳng tới máy chủ (không qua trang chủ), toàn bộ người dùng khác đang đăng nhập theo cách đó có thể bị chặn tạm thời và không vào được, dù đây không phải lỗi của họ.
  file: `packages/auth/src/auth.ts`
  severity: medium
  Đề xuất: new-contract

- **If onPasswordReset throws, better-auth skips revokeSessionsOnPasswordReset after the password has already changed**
  Người dùng thấy gì: Trong một tình huống hiếm có lỗi kỹ thuật tạm thời ở máy chủ, người dùng vừa đặt mật khẩu mới có thể nhận báo lỗi dù mật khẩu đã đổi thành công, và phiên đăng nhập cũ (kể cả phiên bị chiếm) có thể chưa bị đăng xuất như mong đợi.
  file: `packages/auth/src/auth.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn/nguồn thay vì đầu ra): E6 grep stderr khớp khung mã nguồn Bun in ra, không khớp thông điệp lỗi**
  Người dùng thấy gì: Đây là khoảng hở trong cách đo kiểm tự động chứ không phải điều người dùng thấy ngay bây giờ; nếu sau này ai đổi câu thông báo lỗi cấu hình thư mà không cẩn thận, phép đo có thể không phát hiện ra, nhưng người dùng hiện tại không bị ảnh hưởng.
  file: `packages/auth/test/quen-mat-khau-cau-hinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): E18 chup.mjs không đối chiếu số phút với hằng số, câu quá lượt thì viết tay**
  Người dùng thấy gì: Đây là khoảng hở trong cách đo kiểm tự động; nếu sau này số phút hiển thị trên màn hình bị tính sai, phép đo hiện tại có thể không phát hiện ra, dù người dùng hiện tại đang thấy đúng số phút.
  file: `_acceptance/quen-mat-khau/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): E11 het-han khẳng định dangNhapDuoc(...) === false mà không có đối chứng dương, và bộ bắt lỗi nuốt mọi lỗi**
  Người dùng thấy gì: Đây là khoảng hở trong cách đo kiểm tự động cho ca liên kết hết hạn; phép đo hiện chỉ chứng minh đăng nhập thất bại chứ chưa chứng minh chắc chắn đó là do liên kết hết hạn, nên một lỗi khác có thể âm thầm lọt qua mà không ai nhận ra.
  file: `packages/auth/test/quen-mat-khau.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).