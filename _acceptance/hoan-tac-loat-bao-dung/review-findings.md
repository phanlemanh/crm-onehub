# Review findings: hoan-tac-loat-bao-dung (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **runBulk counts expected 4xx rejections (BadRequestException) as real server errors and logs them at error level**
  Người dùng thấy gì: Khi xoá vĩnh viễn hàng loạt một lô có cả bản chưa lưu trữ, hệ thống ghi nhật ký như thể máy chủ hỏng, dù đó chỉ là thao tác không hợp lệ. Người dùng không thấy khác biệt trên màn hình, nhưng người trực nhật ký sẽ thấy cảnh báo lỗi giả.
  file: `apps/api/src/crm/bulk.ts`
  severity: medium
  Đề xuất: known-limits

- **runBulk counts any non-404 exception as a server error (errored), including the expected 4xx rejections from bulkPurge, bulkSetStage and bulkEnrich**
  Người dùng thấy gì: Với xoá vĩnh viễn hoặc đổi giai đoạn hàng loạt, một thao tác bị từ chối do người dùng chọn sai có thể bị tính là lỗi máy chủ, và nhật ký lỗi bị nhiễu bởi cảnh báo giả. Hiện chưa có chỗ nào trên giao diện hiện lời «máy chủ gặp lỗi» cho các thao tác này.
  file: `apps/api/src/crm/bulk.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình, thông điệp ghim không tới được): chốt «hlb: thieu errored ra NaN» của E5 không thể đỏ dưới đột biến đã khai**
  Người dùng thấy gì: Nếu có người làm hỏng cách xử lý kết quả thiếu số lỗi, bài kiểm tự động vẫn báo đỏ nhưng với dòng giải thích không đúng nguyên nhân. Người dùng cuối không bị ảnh hưởng.
  file: `apps/app/test/hoan-tac-loat-bao-dung.dom.tsx`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 5 (khai quét lớp nhưng chỉ có ca điểm): ma trận «3 loại» của E3/E4/E5 không chạm chỗ gọi thật nào của ba loại**
  Người dùng thấy gì: Bài kiểm tự động chỉ thử cách báo kết quả chung, chưa thử riêng từng màn Liên hệ, Công ty, Thoả thuận. Nếu một màn nối sai thì có thể báo sai mà bài kiểm không phát hiện.
  file: `apps/app/test/hoan-tac-loat-bao-dung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay thay cho đường ghi thật): E14 gieo ba cá nhân bằng Prisma create, trong khi eval khai «qua đường ghi thật»**
  Người dùng thấy gì: Phép đo màn dùng ba liên hệ mẫu ghi thẳng vào cơ sở dữ liệu thay vì qua đường tạo liên hệ thật. Kết quả đo vẫn đúng cho việc xem hoàn tác, chỉ lệch so với lời khai của bài đo.
  file: `_acceptance/hoan-tac-loat-bao-dung/rang/man.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
