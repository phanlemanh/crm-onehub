# Review findings: cua-vao-va (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 2 (fixture viết tay khớp khuôn bên đọc): ca «doc-phien loi nguoi goi» tự dựng APIError từ chính module mà trpc.context dùng để kiểm, không đi qua plugin khoá API thật**
  Người dùng thấy gì: Khi khoá API của một người bị tắt, hết hạn hoặc sai, hệ thống đang được kiểm tra bằng một lỗi giả dựng theo đúng khuôn của nơi nhận, chưa phải bằng khoá thật. Hôm nay hai bên khớp nhau nên người dùng vẫn bị báo chưa đăng nhập đúng cách, nhưng nếu thư viện sau này tách đôi thì khoá hỏng có thể bị báo nhầm là hệ thống trục trặc mà bài kiểm tra vẫn xanh.
  file: `apps/api/test/cua-vao-va.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): tên test và AC-1 kể ba loại khoá hỏng (tắt, hết hạn, sai), ma trận chỉ có hai dòng**
  Người dùng thấy gì: Ba trường hợp khoá API hỏng (tắt, hết hạn, sai) được nhắc tên, nhưng bài kiểm tra mới thử hai trường hợp, chưa thử riêng trường hợp hết hạn. Người có khoá hết hạn nhiều khả năng vẫn được báo chưa đăng nhập đúng như hai trường hợp kia, chỉ là chưa có bằng chứng riêng cho nó.
  file: `apps/api/test/cua-vao-va.spec.ts`
  severity: low
  Đề xuất: known-limits

- **do-man.mjs đổi tên bảng session mà không kiểm laKhoDo() trước (r1)**
  Người dùng thấy gì: Nếu ai đó chạy phép đo màn này trực tiếp trên máy dev mà không qua lệnh chuẩn, thước có thể làm hỏng dữ liệu phiên của cơ sở dữ liệu dùng chung, khiến mọi người đang đăng nhập bị văng ra. Đi đúng lệnh chuẩn thì không xảy ra.
  file: `_acceptance/cua-vao-va/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 (measures a frozen description instead of the output): soi-ma (d) now checks tep-vong.txt instead of the real diff, so it is constant on every tree (r1)**
  Người dùng thấy gì: Thước kiểm tra của đợt «cửa vào đăng nhập» cũ không còn báo động nếu một vòng sau lỡ đụng vào phần đăng nhập hay proxy, vì nó chỉ nhìn danh sách đã chốt từ trước. Người dùng không thấy gì khác đi, nhưng một thay đổi sai chỗ có thể lọt qua mà không có đèn đỏ.
  file: `_acceptance/cua-vao-dang-nhap/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts a string is present when the promise is a relation between values): noi-goi-dang-xuat compares parameter names, not the values the page passes in (r1)**
  Người dùng thấy gì: Nếu sau này ai đó sửa trang hết quyền để thông báo lỗi đăng xuất lại dùng chữ của nút, thước quét tĩnh sẽ không phát hiện. Các bài kiểm tra khác vẫn có thể bắt được.
  file: `_acceptance/cua-vao-va/rang/noi-goi-dang-xuat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): thu-lai-lanh only checks that the error heading is gone, not that the page actually came back (r1)**
  Người dùng thấy gì: Sau khi bấm «Thử lại», thước chỉ kiểm tra tiêu đề lỗi đã biến mất chứ chưa kiểm trang bình thường thật sự hiện ra. Một trang trắng hay đang kẹt ở trạng thái tải vẫn có thể được tính là đạt.
  file: `_acceptance/cua-vao-va/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): khong-session-data asserts the session_data cookie is absent with no way to go red (r1)**
  Người dùng thấy gì: Phép đo màn chỉ khẳng định một cookie bộ nhớ đệm không có mặt khi cơ sở dữ liệu đang lỗi, mà chưa chứng minh được nó từng xuất hiện khi hệ thống khoẻ. Chi phí bổ sung nhỏ so với rủi ro nên chấp nhận.
  file: `_acceptance/cua-vao-va/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
