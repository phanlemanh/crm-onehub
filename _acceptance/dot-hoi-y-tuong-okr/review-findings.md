# Review findings: dot-hoi-y-tuong-okr (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The publish check reads a topic's conclusion and its link to the pre-written draft as raw strings instead of parsing them**
  Người dùng thấy gì: Nếu dữ liệu một chủ đề bị lưu sai dạng (chỉ xảy ra khi ai đó sửa thẳng vào cơ sở dữ liệu), việc kiểm tra trước khi công bố có thể lặng lẽ cho qua thay vì báo lỗi rõ ràng. Qua các nút bấm bình thường thì không xảy ra.
  file: `apps/api/src/okr/okr-hoi-y.service.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 5 (claims a class, covers a hand list): E4's command never runs the check that closes the hỏi ý procedure set**
  Người dùng thấy gì: Nếu sau này ai thêm một thao tác đọc mới cho tính năng Hỏi ý mà quên khai vào danh sách quyền, bài kiểm tra tự động hiện chạy sẽ không phát hiện ra. Hôm nay danh sách đang đủ.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims a class, covers a hand-picked subset): the E14 "9 × 9 matrix" is 9 of the 13 screen states**
  Người dùng thấy gì: Bốn trạng thái màn (chưa có chu kỳ, đã niêm phong, đang gom, chọn đủ) chưa được bài kiểm tra tự động soi kỹ xem có hiện nhầm khối không. Nếu màn hiện sai ở đó, bài kiểm tra này sẽ không báo.
  file: `apps/app/test/okr-hoi-y.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (lone negative assertion): "unmounted, a click no longer scrolls" passes even if the listener leaks**
  Người dùng thấy gì: Nếu mục lục bên trái quên dọn dẹp khi rời trang, bài kiểm tra hiện tại vẫn xanh. Người dùng có thể gặp mục lục vẫn phản ứng sau khi đã chuyển trang, nhưng không thấy hậu quả rõ ràng.
  file: `packages/ui/test/scrollspy.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negatives without matching positives or pinned paths): the soLieuHoiY case table only compares success booleans**
  Người dùng thấy gì: Các giới hạn độ dài của con số và ý góp được thử ở phía bị từ chối nhưng chưa thử kỹ phía được chấp nhận. Nếu giới hạn bị siết quá tay, người dùng có thể bị chặn khi nhập một nhãn hay giá trị hợp lệ mà bài kiểm tra không báo.
  file: `packages/validation/test/okr-hoi-y.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 5 (claims a class, covers a subset): E11 promises to scan every hỏi ý procedure but only scans the 3 read queries**
  Người dùng thấy gì: Bài kiểm tra chỉ soi ba thao tác đọc xem có lộ danh sách người chưa góp ý hay không, mười bốn thao tác còn lại chưa được soi. Chưa thấy chỗ nào lộ thật, nhưng nếu về sau có thì máy sẽ không bắt.
  file: `apps/api/test/okr-hoi-y.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative that cannot fail): "no author name" on idea k1, whose fixture has no tacGia**
  Người dùng thấy gì: Một bài kiểm tra tự động khẳng định thành viên không thấy tên người góp, nhưng dữ liệu mẫu của nó vốn không có tên nên luôn xanh. Việc ẩn tên thật vẫn được kiểm ở phía máy chủ, không ở bài này.
  file: `apps/app/test/okr-hoi-y.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped for the reader): the E10 agent test seeds hỏi ý rows straight into the DB**
  Người dùng thấy gì: Bài kiểm tra tin nhắc buổi sáng dựng sẵn dữ liệu Hỏi ý bằng tay thay vì qua các thao tác thật. Nếu thao tác thật ghi dữ liệu hơi khác, tin nhắc có thể lệch mà bài này không thấy.
  file: `apps/agent/test/support/okr-gieo.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/8 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, packages/ui/test/scrollspy.dom.tsx, apps/agent/test/support/okr-gieo.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
