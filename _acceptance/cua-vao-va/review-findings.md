# Review findings — cua-vao-va (round 1)

## Trong hợp đồng

- **Shape 5 (claims layer coverage, but only point cases): the 'SessionOnlyMiddleware' row in the ba-lop matrix is a hand-written label and actually measures AuthMiddleware**
  file: `apps/api/test/cua-vao-va.spec.ts:102`
  severity: high
  AC: AC-2
  source: measurement
  detail: MA_TRAN pairs ["SessionOnlyMiddleware", "apiKeys.list"] by hand. The precondition check on line 107 (`co.has(thuTuc)`) only confirms the procedure exists. It never reads router metadata to see which middleware the procedure carries, even though the E2 expected says 'doc metadata router, khong tu ghi tay'. In the real code, api-keys.router.ts declares `@UseMiddlewares(PhamViChungMiddleware, SessionOnlyMiddleware)`, and PhamViChungMiddleware extends AuthMiddleware. The 503 for apiKeys.list therefore comes from AuthMiddleware's sessionError branch. SessionOnlyMiddleware never reads the session at all: it only rejects API_KEY_HEADER, and this diff does not touch it. The row's assert string `SessionOnlyMiddleware nem 503 SERVICE_UNAVAILABLE` passes on a label, so the '3 layers × 2 states' matrix really covers only 2 layers (AuthMiddleware ×2 + SignedInMiddleware). The E2 red direction ('bo nhanh sessionError o SessionOnlyMiddleware') is impossible because that branch does not exist.
  rationale: AC-2 gọi đích danh ba lớp middleware gồm SessionOnlyMiddleware và hứa ma trận 3 × 2; dòng của lớp này trong bài kiểm tra thực ra đo lớp khác nên một trong ba lớp của AC chưa được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **do-man.mjs đổi tên bảng session mà không kiểm laKhoDo() trước**
  Người dùng thấy gì: Nếu ai đó chạy phép đo màn này trực tiếp trên máy dev mà không qua lệnh chuẩn, thước có thể làm hỏng dữ liệu phiên của cơ sở dữ liệu dùng chung, khiến mọi người đang đăng nhập bị văng ra. Đi đúng lệnh chuẩn thì không xảy ra.
  file: `_acceptance/cua-vao-va/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **A bad, disabled or expired API key now gets 503 SERVICE_UNAVAILABLE instead of 401, and is logged as a session-read failure**
  Người dùng thấy gì: Một tích hợp dùng khoá API đã bị thu hồi, tắt hoặc hết hạn sẽ nhận thông báo kiểu «máy chủ đang lỗi, thử lại sau» thay vì «khoá của bạn không hợp lệ», và nhật ký báo lỗi đọc phiên oan. Đây là hành vi thụt lùi so với trước, làm hai bài kiểm tra cũ đang đỏ.
  file: `apps/api/src/trpc/trpc.context.ts`
  severity: high
  Đề xuất: new-contract

- **Shape 4 (negative assertion alone): design-gate in r1f_san_thiet_ke has no negative control, although E15 promises one in the same command**
  Người dùng thấy gì: Phép kiểm tra giao diện của vòng này chưa có ca thử cố ý sai để chứng minh nó thật sự bắt được lỗi màu chữ. Kết quả «không có lỗi» vẫn đúng nhưng độ tin cậy thấp hơn mức đã hứa.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Shape 1 (measures a frozen description instead of the output): soi-ma (d) now checks tep-vong.txt instead of the real diff, so it is constant on every tree**
  Người dùng thấy gì: Thước kiểm tra của đợt «cửa vào đăng nhập» cũ không còn báo động nếu một vòng sau lỡ đụng vào phần đăng nhập hay proxy, vì nó chỉ nhìn danh sách đã chốt từ trước. Người dùng không thấy gì khác đi, nhưng một thay đổi sai chỗ có thể lọt qua mà không có đèn đỏ.
  file: `_acceptance/cua-vao-dang-nhap/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts a string is present when the promise is a relation between values): noi-goi-dang-xuat compares parameter names, not the values the page passes in**
  Người dùng thấy gì: Nếu sau này ai đó sửa trang hết quyền để thông báo lỗi đăng xuất lại dùng chữ của nút, thước quét tĩnh sẽ không phát hiện. Các bài kiểm tra khác vẫn có thể bắt được.
  file: `_acceptance/cua-vao-va/rang/noi-goi-dang-xuat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (the whole-set count has no independently written denominator): thuoc-cu-xanh compares the parser's output with itself**
  Người dùng thấy gì: Nếu bộ đọc danh sách kiểm tra bỏ sót vài mục, phép đếm tổng vẫn khớp với chính nó nên có thể không báo, khiến một số bài kiểm tra cũ không được chạy mà không ai biết.
  file: `_acceptance/cua-vao-va/rang/thuoc-cu-xanh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): thu-lai-lanh only checks that the error heading is gone, not that the page actually came back**
  Người dùng thấy gì: Sau khi bấm «Thử lại», thước chỉ kiểm tra tiêu đề lỗi đã biến mất chứ chưa kiểm trang bình thường thật sự hiện ra. Một trang trắng hay đang kẹt ở trạng thái tải vẫn có thể được tính là đạt.
  file: `_acceptance/cua-vao-va/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): khong-session-data asserts the session_data cookie is absent with no way to go red**
  Người dùng thấy gì: Phép đo màn chỉ khẳng định một cookie bộ nhớ đệm không có mặt khi cơ sở dữ liệu đang lỗi, mà chưa chứng minh được nó từng xuất hiện khi hệ thống khoẻ. Chi phí bổ sung nhỏ so với rủi ro nên chấp nhận.
  file: `_acceptance/cua-vao-va/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
