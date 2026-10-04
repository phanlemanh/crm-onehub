# Review findings — thu-lai-sau-45-giay (round 3)

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Retry while the turn is still 'submitted' sends a cancel scoped to the previous, finished turn, so the stuck turn is never cancelled**
  Người dùng thấy gì: Nếu người dùng nhắn tiếp một câu mà Trợ lý chưa kịp phản hồi gì, rồi đợi quá 45 giây và bấm Thử lại, lệnh dừng có thể nhắm nhầm lượt trước đã xong. Lượt đang kẹt vẫn chạy, tin không được gửi lại và sau 15 giây màn báo Chưa gửi lại được.
  file: `apps/app/app/(app)/[slug]/okr/soan/huy-luot.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ca mới «lượt tự xong sau một lần gửi lại bị từ chối» dựng một ảnh chụp onFinish làm mất các sự kiện mà lần onFinish trước đã giao**
  Người dùng thấy gì: Một bài kiểm tự động mô phỏng tình huống lượt cũ tự xong sau một lần gửi lại bị từ chối bằng dữ liệu mà hệ thống thật không tạo ra, nên chưa chứng minh được màn xử lý đúng ở tình huống đó trong thực tế. Người dùng gặp tình huống hiếm này có thể thấy ô soạn hoặc thông báo lỗi không đúng như mong đợi.
  file: `apps/app/test/soan-okr-thu-lai-45s.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **New test checks that the composer is not locked by looking for the absence of 'khoa', which also passes if the composer is missing**
  Người dùng thấy gì: Một bài kiểm tự động có thể báo xanh dù ô soạn tin biến mất khỏi màn hình, nên nếu sau này ô soạn hỏng theo kiểu đó thì bài kiểm này không bắt được. Người dùng không bị ảnh hưởng trực tiếp ở bản giao này.
  file: `apps/app/test/soan-okr-thu-lai-45s.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (khẳng định âm tính một mình): «ô soạn mở» chỉ được đo bằng việc không tìm thấy [data-o-soan="khoa"]**
  Người dùng thấy gì: Bài kiểm tự động chỉ xác nhận ô soạn không bị khoá chứ không xác nhận ô soạn đang mở, nên có thể bỏ sót trường hợp ô soạn không hiện. Người dùng không bị ảnh hưởng trực tiếp ở bản giao này.
  file: `apps/app/test/soan-okr-thu-lai-45s.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **giu-r1h.mjs anchors its 'signed file untouched' guard to a moving merge-base and fails open after merge** (r2)
  Người dùng thấy gì: Sau khi tính năng này được gộp, bài kiểm giữ nguyên các bài kiểm đã ký của vòng trước sẽ không còn so với bản đã ký nữa nên không còn bảo vệ được gì. Người dùng không thấy ảnh hưởng, chỉ là lưới an toàn cho vòng sau mỏng đi.
  file: `_acceptance/thu-lai-sau-45-giay/rang/giu-r1h.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (lone negative assertion): the giu-r1h ratchet pins only the 'error not shown' half of 'the 45 s timer resets'** (r2)
  Người dùng thấy gì: Ai đó có thể lặng lẽ xoá phép kiểm rằng báo lỗi quay lại sau 45 giây mà bộ giữ vẫn xanh. Người dùng chưa bị ảnh hưởng, chỉ là kiểm tra yếu đi.
  file: `_acceptance/thu-lai-sau-45-giay/rang/giu-r1h.mjs`
  severity: medium
  Đề xuất: known-limits

- **Cancel URL is hand-built and duplicates the route shape CUA_OKR already owns** (r2)
  Người dùng thấy gì: Nếu sau này đổi đường dẫn huỷ ở một nơi mà quên nơi kia, nút Thử lại sẽ báo chưa gửi lại được dù không có lỗi thật. Hiện tại hai nơi đang khớp nhau nên người dùng chưa gặp vấn đề.
  file: `apps/app/app/(app)/[slug]/okr/soan/huy-luot.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
