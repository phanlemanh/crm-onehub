## Trong hợp đồng

[]

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **BackfillService teardown uses OnModuleDestroy, unlike the OnApplicationShutdown pattern used elsewhere, and leaves the sign-in handler registered**
  Người dùng thấy gì: Cách làm hiện tại chỉ đúng khi hệ thống chạy một bản dịch vụ tại một thời điểm — đúng như vận hành hôm nay. Nếu sau này chạy nhiều bản song song hoặc khởi động lại liên tục, các phiên cũ có thể vẫn âm thầm giữ lại một phần xử lý không cần thiết mà không ai nhận ra ngay.
  file: `apps/api/src/backfill/backfill.service.ts`
  severity: low
  Đề xuất: known-limits

- **dem-sot.ts 'dieu-phoi' check hard-codes seed prefixes copied from dieu-phoi-gieo.ts and has no guard against measuring nothing**
  Người dùng thấy gì: Nếu sau này ai đó đổi cách đặt tên cho dữ liệu thử nghiệm, phép kiểm có thể báo 'đã dọn sạch' dù dữ liệu rác thật ra vẫn còn, khiến người xem báo cáo tin nhầm là mọi thứ ổn.
  file: `_acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts`
  severity: low
  Đề xuất: known-limits

- **dem-sot.ts checks the raw TEST_RUN_ID against the database name, but the name holds the slugged id**
  Người dùng thấy gì: Nếu người chạy thử tự đặt một mã lượt có chữ hoa hoặc dấu gạch, công cụ kiểm tra có thể báo lỗi giả dù dữ liệu vẫn đúng, khiến người xem báo cáo mất thời gian tra một sự cố không có thật.
  file: `_acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 + 4: E1 đếm theo khuôn tên chép tay từ bộ gieo, không có đối chứng dương trong lượt**
  Người dùng thấy gì: Bốn phép đo dùng để khẳng định 'đã dọn sạch' không có bước chứng minh chúng thật sự bắt được rác nếu có; đổi cách đặt tên dữ liệu thử sau này có thể khiến báo cáo báo 'sạch' trong khi rác vẫn còn mà không ai phát hiện.
  file: `_acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: số 'bo phan' của E1 bằng 0 theo cấu trúc, không bao giờ đỏ được**
  Người dùng thấy gì: Một trong bốn phần của phép kiểm không bao giờ có thể phát hiện ra vấn đề vì kịch bản thử không tạo loại dữ liệu đó — hạn chế này đã được ghi nhận từ trước và không thay đổi ở lần này.
  file: `_acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

[]

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).