## Trong hợp đồng

### The 3-per-minute limit on /request-password-reset is shared by every user, not applied per client
AC: AC-9
file: `packages/auth/src/auth.ts:124`
severity: medium
source: bugs
detail: The new customRules entry limits /request-password-reset to PASSWORD.requestMax=3 requests per requestWindowSeconds=60. better-auth keys that counter as `${getIp(req)}|${path}`. The browser never calls the API directly: packages/auth/src/client.ts sets `baseURL: globalThis.window?.location.origin`, so the request goes through the Next proxy at apps/app/app/api/[...path]/route.ts. That proxy explicitly deletes `x-forwarded-for` (line 16) and `forwarded` before it fetches API_URL. Nothing in packages/auth or apps/api sets `advanced.ipAddress.ipAddressHeaders` or `trustedProxies`, and grep finds no other IP header being passed along.

What the API sees in production depends on where it runs. In the core `getIp` (@better-auth/core/dist/utils/ip.mjs), a missing header resolves to null outside dev/test, so the key is the shared `no-trusted-ip|/request-password-reset`. If the API sits behind Vercel, the address is the egress IP of the Next function, which is also shared.

The result is one bucket for the whole install. After any 3 forgot-password requests in a minute, from anyone and for any address, every other user gets 429 and the message "Bạn đã xin quá nhiều lần" even though they never asked. A single anonymous script can keep forgot-password blocked for all users indefinitely.

The qua-luot integration test does not catch this. It calls `auth.handler` directly with a distinct `x-forwarded-for` per test, which skips the proxy. chup.mjs does not catch it either, because in dev `getIp` falls back to 127.0.0.1 for everyone. Possible fixes: have the proxy forward the client IP in a header the API trusts, and configure `advanced.ipAddress` to read it; or key this rule on something that does not collapse to one value.
rationale (vì sao thuộc AC-9): AC-9 hứa giới hạn 3 lần/60 giây tính theo "cùng một nơi gửi"; nếu bộ đệm proxy xoá header IP khiến mọi người dùng rơi vào cùng một khoá đếm, thì những nơi gửi khác nhau chặn lẫn nhau — đúng cơ chế mà AC-9 mô tả bị hỏng, không phải giới hạn theo địa chỉ nhận (mục đã loại trong Out of scope).

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A feature-folder Heading is copied into a second area instead of being moved to packages/ui**
  Người dùng thấy gì: Trên điện thoại, trong lúc trang đang tải người dùng có thể thấy logo hiện ra rồi biến mất trước khi form xin liên kết hiện lên, gây cảm giác giật hình nhẹ.
  file: `apps/app/app/(landing)/quen-mat-khau/quen-mat-khau-form.tsx`
  severity: medium
  Đề xuất: known-limits

- **The minute unit is written twice in packages/auth and the TTL-to-minutes step is repeated in three places**
  Người dùng thấy gì: Nếu sau này có người chỉnh thời hạn hiệu lực của liên kết, số phút hiển thị ở các màn khác nhau (thư và trang web) có nguy cơ không khớp nhau vì mỗi nơi tự tính riêng.
  file: `packages/auth/src/thu-mat-khau.ts`
  severity: low
  Đề xuất: known-limits

- **Mail credentials break env.ts's snapshot pattern: validated at load, then re-parsed (and able to throw) on every call**
  Người dùng thấy gì: Nếu cấu hình gửi thư trên máy chủ bị đổi giữa lúc đang chạy (trường hợp hiếm), trang đăng nhập có thể báo lỗi tạm thời thay vì chỉ lặng lẽ ẩn nút quên mật khẩu.
  file: `packages/auth/src/env.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E10 'chìa 2 bị từ chối' đỗ xanh suông khi thư thứ hai không tồn tại**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay bây giờ, nhưng nếu sau này lời hứa "dùng lại liên kết cũ đều bị từ chối" có lỗi thật, bộ kiểm tra tự động hiện tại có thể không phát hiện ra.
  file: `packages/auth/test/quen-mat-khau.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): số phút trên màn không được nối với PASSWORD.* ở bất kỳ phép đo nào**
  Người dùng thấy gì: Số phút hiển thị trên màn "Kiểm tra hộp thư" và câu quá lượt hiện chưa được máy tự động xác nhận là khớp với cấu hình thật; nếu có sai lệch, người dùng có thể thấy số phút chờ không đúng mà chưa chắc bị phát hiện sớm.
  file: `_acceptance/quen-mat-khau/rang/chup.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): ca sau-don của E12 không có đối chứng rằng bộ dọn hàng đếm thật sự đã chạy**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay bây giờ, nhưng nếu cơ chế cho phép xin lại sau 60 giây có lỗi thật trong tương lai, bộ kiểm tra hiện tại có thể không phát hiện ra.
  file: `packages/auth/test/quen-mat-khau.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E21 đếm 0 liên kết mà không kiểm màn đăng nhập đã vẽ xong**
  Người dùng thấy gì: Phép kiểm tra ẩn nút "Quên mật khẩu?" hiện có thể báo đạt ngay cả khi màn đăng nhập bị lỗi trắng, nên một lỗi hiển thị màn đăng nhập có thể không bị phát hiện sớm.
  file: `_acceptance/quen-mat-khau/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E11 dùng 'đăng nhập bằng mật khẩu mới thất bại' qua catch-all thay cho 'mật khẩu cũ vẫn dùng được'**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay bây giờ, nhưng nếu lời hứa "mật khẩu cũ vẫn dùng được khi liên kết bị từ chối" có lỗi thật, bộ kiểm tra hiện tại có thể không phát hiện ra.
  file: `packages/auth/test/quen-mat-khau.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): E15 kiểm '[auth]' và '422' trên hai dòng log bất kỳ, không cùng một dòng**
  Người dùng thấy gì: Nếu có sự cố gửi thư thật, dòng log ghi lại có thể không đủ rõ để tra cứu nhanh, dù bộ kiểm tra tự động vẫn báo đạt.
  file: `packages/auth/test/quen-mat-khau.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).