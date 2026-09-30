# Review findings — tro-ly-okr-tom-tat (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Summary types are written by hand beside their Zod schemas, and the level and status lists are declared in three places**
  Người dùng thấy gì: Danh sách các nấc và trạng thái của bản tóm tắt được khai ở nhiều chỗ. Ngày nào đó có người thêm một nấc mới ở một chỗ mà quên chỗ kia thì màn quản trị và màn họp tuần có thể hiểu khác nhau về cùng một bản.
  file: `packages/db/src/okr-tom-tat.ts`
  severity: medium
  Đề xuất: known-limits

- **Two identical functions were added to the same file**
  Người dùng thấy gì: Có hai đoạn mã làm cùng một việc là kiểm tra việc này đã có bản tóm tắt chưa. Hôm nay người dùng không thấy khác biệt; chỉ khi sửa một nơi mà quên nơi kia mới lệch.
  file: `apps/agent/agent/lib/okr/doc.ts`
  severity: low
  Đề xuất: wont-fix

- **Job kind constants in the summary scheduler are not checked against the task-kind list**
  Người dùng thấy gì: Nếu sau này ai đổi tên loại việc tóm tắt ở nơi khác, lịch tóm tắt mỗi sáng có thể âm thầm tạo ra việc không ai xử lý và các phòng ban sẽ không có bản tóm tắt mà không báo lỗi.
  file: `apps/agent/agent/lib/okr/lich-tom-tat.ts`
  severity: low
  Đề xuất: known-limits

- **Screen copy repeats tunable values from the summary config**
  Người dùng thấy gì: Màn hình đang ghi cứng «hai phút» và «06:00». Nếu sau này chỉnh thời gian chờ hoặc giờ chạy, màn hình vẫn hiện con số cũ và làm người xem hiểu sai.
  file: `apps/app/lib/messages/okr-toan-canh.ts`
  severity: low
  Đề xuất: known-limits

- **The date schema is defined again when an existing one is available**
  Người dùng thấy gì: Định dạng ngày của bản tóm tắt được viết lại một lần nữa thay vì dùng bản có sẵn. Người dùng không thấy khác biệt nào.
  file: `packages/validation/src/okr-tom-tat.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 — Đo CHỈ DẪN thay vì ĐẦU RA: E6 kiểm danh sách khai báo DANH_SACH_DOC, không kiểm các lệnh đọc thật của đường tóm tắt**
  Người dùng thấy gì: Bài kiểm cách ly dữ liệu chỉ soi danh sách khai báo chứ không soi những gì Trợ lý thực sự đọc. Nếu sau này Trợ lý đọc thêm dữ liệu khách hàng trong lúc tóm tắt, bài kiểm vẫn báo an toàn.
  file: `apps/agent/test/tro-ly-okr-cach-ly.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên bố quét cả LỚP nhưng danh sách viết tay: 'không bảng đối tác nào' so với 22 tên chép tay**
  Người dùng thấy gì: Bài kiểm chặn Trợ lý đọc dữ liệu đối tác chỉ biết một danh sách bảng gõ tay, nên một số loại dữ liệu như trường tuỳ chỉnh của khách hàng có thể lọt mà không bị bắt.
  file: `apps/agent/test/tro-ly-okr-cach-ly.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture VIẾT TAY đúng khuôn bên đọc: cả cột nấc 'khong-ro' của E15 đo trên một hàng OkrTomTat mà hàm ghi thật không sinh ra được**
  Người dùng thấy gì: Một nhóm số đo của thước được kiểm trên dữ liệu thử gõ tay mà hệ thống thật không bao giờ tạo ra, nên nhóm số «không rõ nấc» chưa được chứng minh bằng đường ghi thật.
  file: `apps/api/test/tro-ly-okr-tom-tat-thuoc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — Assert 'chuỗi có mặt' cho lời hứa QUAN HỆ bằng nhau: thẻ trích dẫn E9 so giá trị bằng startsWith**
  Người dùng thấy gì: Phép kiểm thẻ trích dẫn chỉ xem chữ trên thẻ có bắt đầu bằng số trong kho hay không, nên một thẻ hiện sai số (ví dụ 45 thay vì 4) vẫn có thể được chấm đúng.
  file: `_acceptance/tro-ly-okr-tom-tat/rang/man-tom-tat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính một mình: E17 chốt 'không câu nào chứa họ tên' mà không đối chứng danh sách tên khác rỗng**
  Người dùng thấy gì: Phép kiểm «không câu tóm tắt nào nêu họ tên» sẽ báo đạt nếu danh sách tên lấy về bị rỗng, nên có thể không phát hiện được khi Trợ lý nêu tên một người.
  file: `_acceptance/tro-ly-okr-tom-tat/rang/eval-tom-tat.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính một mình: E1 đòi 'không còn hop-tuan.ts' mà không chứng đường dẫn trỏ đúng thư mục có thật**
  Người dùng thấy gì: Một bài kiểm xác nhận tệp cũ đã bị dời đi có thể báo đạt dù đường dẫn sai. Người dùng không bị ảnh hưởng.
  file: `packages/db/test/okr-hop-tuan.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
