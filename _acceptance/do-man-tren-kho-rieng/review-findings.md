## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The session state file (phien.json) is not validated when read, and a parse failure is silently swallowed**
  Người dùng thấy gì: Nếu một lượt đo bị tắt đột ngột để lại bản ghi trạng thái hỏng, máy có thể bỏ sót việc tắt các máy chủ đo cũ, khiến chúng tiếp tục chiếm tài nguyên mà không ai biết.
  file: `scripts/lan-do/phien-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **docs/setup.md still says only db:test may drop a database, which the new section contradicts**
  Người dùng thấy gì: Tài liệu hướng dẫn vẫn còn một câu mô tả cũ mâu thuẫn với tính năng mới, có thể khiến người đọc hiểu sai quy tắc xoá kho dữ liệu.
  file: `docs/setup.md`
  severity: low
  Đề xuất: known-limits

- **createMeasureDatabase drops a same-named database without checking the measure-session mark**
  Người dùng thấy gì: Khi tạo môi trường đo mới, một kho dữ liệu trùng tên nhưng không phải do phép đo tạo ra có thể bị xoá mất mà không có cảnh báo.
  file: `packages/db/scripts/measure-db.ts`
  severity: low
  Đề xuất: known-limits

- **Magic numbers and inline time units in measure-db.ts even though MEASURE_DATABASE exists**
  Người dùng thấy gì: Một số con số thời gian và độ dài mã được viết lặp lại rải rác thay vì gom về một nơi, khiến việc chỉnh sửa sau này dễ bỏ sót chỗ cần đổi.
  file: `packages/db/scripts/measure-db.ts`
  severity: low
  Đề xuất: wont-fix

- **MA_NGAT and the helper that reads the database name from a URL are duplicated between tien-de.mjs and phien-do.mjs**
  Người dùng thấy gì: Một vài hằng số và đoạn xử lý được chép lặp ở hai nơi thay vì dùng chung một nguồn, khiến chúng có nguy cơ lệch nhau khi chỉnh sửa sau này.
  file: `scripts/lan-do/phien-do.mjs`
  severity: low
  Đề xuất: wont-fix

- **Ctrl-C / SIGTERM is ignored for up to 60 minutes while a measure session waits for the tree lock**
  Người dùng thấy gì: Khi một lượt đo phải chờ đến lượt của cây đang chạy trước xong, người dùng bấm Ctrl-C hoặc hệ thống ra lệnh dừng có thể không có tác dụng trong tối đa một giờ.
  file: `scripts/lan-do/phien-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **A session that fails before it gets the lock deletes the phien.json of the session that holds the lock**
  Người dùng thấy gì: Một lượt đo thất bại trước khi vào lượt có thể xoá mất bản ghi trạng thái của lượt đo khác đang chạy cùng cây, khiến lượt đó mất khả năng tự dọn nếu bị tắt đột ngột sau đó.
  file: `scripts/lan-do/phien-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **kho-chung-khong-doi.mjs leaves a ~525 MB .next-phien-do-dmk_okr_<MA> build directory behind on every run**
  Người dùng thấy gì: Mỗi lần bài kiểm tự động chạy để lại một thư mục build nặng khoảng nửa GB không được dọn, khiến dung lượng ổ đĩa máy phát triển dần bị chiếm hết theo thời gian.
  file: `_acceptance/do-man-tren-kho-rieng/rang/kho-chung-khong-doi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Template fingerprint hashes only migration directory names, so a migration.sql edited in place reuses a stale template**
  Người dùng thấy gì: Nếu ai đó sửa trực tiếp nội dung một thay đổi cơ sở dữ liệu đã tạo thay vì tạo thay đổi mới, môi trường đo có thể tiếp tục dùng bản dữ liệu mẫu cũ mà không có cảnh báo.
  file: `packages/db/scripts/measure-db.ts`
  severity: low
  Đề xuất: wont-fix

- **Errors on the advisory-lock connection are swallowed, so a dropped connection silently releases the tree lock**
  Người dùng thấy gì: Nếu kết nối giữ chỗ giữa hai lượt đo trên cùng một cây bị rớt bất ngờ, hai lượt có thể chạy chồng lên nhau mà không ai được báo, có nguy cơ một lượt xoá mất kho dữ liệu lượt kia đang dùng.
  file: `packages/db/scripts/measure-db.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính một mình): chứng «máy chủ mồ côi đã tắt» chỉ soi pid đầu nhóm, còn đối chứng dương lại soi cả nhóm**
  Người dùng thấy gì: Bài kiểm tra tự động xác nhận «máy chủ cũ đã tắt hẳn» có thể không phát hiện được trường hợp một tiến trình con của máy chủ đó vẫn còn sống, nên một lỗi dọn dẹp thật có thể lọt qua mà không bị bắt.
  file: `_acceptance/do-man-tren-kho-rieng/rang/phien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): dòng mẫu của truoc-gop không phải output thật của pre-merge**
  Người dùng thấy gì: Dữ liệu mẫu dùng để kiểm tra bộ đọc kết quả kiểm tra trước khi gộp mã là viết tay chứ không lấy từ kết quả thật, nên nếu định dạng kết quả thật thay đổi, bài kiểm có thể không phát hiện ra.
  file: `_acceptance/do-man-tren-kho-rieng/rang/truoc-gop.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
