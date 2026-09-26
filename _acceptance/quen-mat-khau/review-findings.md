## Trong hợp đồng

(không có — không finding nào map được vào một AC trong hợp đồng round này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **xuLyXacThuc buffers every auth POST body before routing and before the rate limit, with no size cap**
    Người dùng thấy gì: Một yêu cầu rất lớn gửi tới cửa đăng nhập hoặc quên mật khẩu có thể khiến máy chủ dùng hết bộ nhớ, làm chậm hoặc treo dịch vụ cho mọi người dùng khác.
    file: `packages/auth/src/auth.ts`
    severity: medium
    Đề xuất: new-contract

- **The forgot-password form copies the Heading component from dat-mat-khau-form instead of moving it into packages/ui**
    Người dùng thấy gì: Trên điện thoại, biểu tượng công ty có thể hiện lên rồi biến mất trong chớp mắt khi màn xin liên kết vừa tải xong.
    file: `apps/app/app/(landing)/quen-mat-khau/quen-mat-khau-form.tsx`
    severity: low
    Đề xuất: known-limits

- **The seconds-per-minute unit is redefined in three new places instead of derived from one base**
    Người dùng thấy gì: Nếu sau này có người chỉnh thời hạn của liên kết đặt lại mật khẩu, một chỗ hiển thị số phút có thể bị quên sửa, khiến email và màn hình nói khác số phút nhau.
    file: `packages/auth/src/thu-mat-khau.ts`
    severity: low
    Đề xuất: known-limits

- **A client that drops the connection mid-body on a POST to /api/auth/* now crashes the API process**
    Người dùng thấy gì: Nếu một người dùng đóng trình duyệt đúng lúc đang gửi yêu cầu đăng nhập hoặc quên mật khẩu, toàn bộ hệ thống có thể sập, khiến mọi người khác cũng không dùng được cho tới khi khởi động lại.
    file: `packages/auth/src/auth.ts`
    severity: high
    Đề xuất: new-contract

- **A POST with Content-Type application/json and an empty body now gets 400 instead of being accepted**
    Người dùng thấy gì: Một vài công cụ kỹ thuật gọi thẳng vào máy chủ theo cách bất thường có thể nhận lỗi thay vì được xử lý; người dùng bình thường qua màn hình không bị ảnh hưởng.
    file: `packages/auth/src/auth.ts`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): số phút ở màn quá lượt và màn «Kiểm tra hộp thư» không được đo so với PASSWORD ở bất kỳ đâu**
    Người dùng thấy gì: Nếu sau này ai đó vô tình đổi sai số phút chờ hiển thị ở màn quá lượt hoặc màn 'Kiểm tra hộp thư', hệ thống đo tự động có thể không phát hiện, và người dùng sẽ thấy số phút sai.
    file: `_acceptance/quen-mat-khau/rang/chup.mjs`
    severity: high
    Đề xuất: new-contract

- **Hình dạng 3 (có mặt thay cho quan hệ): «mật khẩu vừa đặt không đổi» được đo bằng đăng nhập với chính mật khẩu mà mọi lần đặt lại đều gửi**
    Người dùng thấy gì: Nếu một lỗi khiến mật khẩu bị ghi đè sai khi ai đó dùng lại liên kết cũ, hệ thống đo tự động có thể không phát hiện ra, và người dùng có thể không biết mật khẩu nào đang thật sự có hiệu lực.
    file: `packages/auth/test/quen-mat-khau.integration.spec.ts`
    severity: medium
    Đề xuất: new-contract

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): AC-14 hứa cơ chế địa chỉ đã ký áp cho cả luật chống dò mật khẩu ở màn đăng nhập, nhưng chỉ /request-password-reset được đo**
    Người dùng thấy gì: Nếu giới hạn chống dò mật khẩu ở màn đăng nhập bị lỗi hoặc bị gỡ nhầm sau này, hệ thống đo tự động sẽ không phát hiện, để lộ khe hở cho kẻ xấu dò mật khẩu hàng loạt.
    file: `_acceptance/quen-mat-khau/evals.yaml`
    severity: medium
    Đề xuất: new-contract

- **Hình dạng 2 (đầu vào viết tay thay vì đi qua bên đọc thật): ca «thiếu BETTER_AUTH_SECRET thì không ném» đưa thẳng undefined vào tham số, không đi qua khoaXacThuc() hay process.env**
    Người dùng thấy gì: Nếu môi trường quên khai khoá bí mật, trang có thể báo lỗi hoặc gián đoạn thay vì tiếp tục chạy như đã dự tính, mà hệ thống đo tự động sẽ không phát hiện ra trước khi phát hành.
    file: `apps/app/test/api-proxy-headers.spec.ts`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): «quá hạn thì mật khẩu không đổi» chỉ đo bằng dangNhapDuoc(...) === false qua hàm nuốt mọi lỗi, và trong ca không có đối chứng dương**
    Người dùng thấy gì: Nếu một lỗi khiến hệ thống vẫn chấp nhận đổi mật khẩu bằng liên kết đã hết hạn, hệ thống đo tự động có thể không phát hiện ra.
    file: `packages/auth/test/quen-mat-khau.integration.spec.ts`
    severity: low
    Đề xuất: new-contract

- **Hình dạng 4 (âm tính một mình): ca không có context Vercel chỉ có not.toThrow; vế «việc vẫn chạy xong» chờ chính promise của test nên không thể đỏ**
    Người dùng thấy gì: Nếu việc gửi thư báo chạy nền bị lỗi âm thầm trên môi trường thật, hệ thống đo tự động sẽ không phát hiện ra trước khi phát hành.
    file: `packages/auth/test/chay-nen.spec.ts`
    severity: low
    Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).