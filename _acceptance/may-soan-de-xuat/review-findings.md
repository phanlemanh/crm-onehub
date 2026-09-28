## Trong hợp đồng

(không có phát hiện nào khớp AC trong vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **taiLieuNguon.nhan can delete the stored file of an existing source (r1)**
  Người dùng thấy gì: Một thành viên trong không gian làm việc (không cần quyền quản trị) có thể khiến tệp nguồn của người khác bị xoá khỏi kho lưu trữ, khiến tài liệu đó không còn tải về được và không soạn lại được nữa.
  file: `apps/api/src/tai-lieu/tai-lieu-nguon.service.ts`
  severity: high
  Đề xuất: new-contract

- **New mutations invalidate taiLieuNguon.list by key at the call site instead of through useCrmCache (r1)**
  Người dùng thấy gì: Danh sách nguồn hiện vẫn được làm mới đúng sau khi soạn lại hay nhận tệp mới; rủi ro chỉ là nếu sau này ai đó đổi cách làm mới dữ liệu ở nơi khác mà quên chỗ này, người dùng có thể thấy danh sách cũ cho tới khi tải lại trang.
  file: `apps/app/app/(app)/[slug]/tai-lieu/bang-nguon.tsx`
  severity: medium
  Đề xuất: known-limits

- **Tunable limits and user-facing reasons defined beside their first use, outside the area's config object (r1)**
  Người dùng thấy gì: Không ảnh hưởng tới người dùng; đây chỉ là chỗ đặt vài con số và câu thông báo trong mã chưa gọn theo quy ước nội bộ, không gây lỗi khi dùng sản phẩm.
  file: `apps/agent/agent/lib/tai-lieu-soan.ts`
  severity: low
  Đề xuất: known-limits

- **The file-type to MIME map that the signed PUT depends on is duplicated in two packages (r1)**
  Người dùng thấy gì: Nếu hai danh sách loại tệp được chấp nhận (ở màn tải lên và ở nơi ký quyền lưu tệp) sau này lệch nhau, người dùng có thể gặp lỗi tải lên chung chung thay vì một thông báo rõ ràng.
  file: `apps/app/lib/tai-lieu-man.ts`
  severity: low
  Đề xuất: known-limits

- **Source stuck in CHO_DOC forever when chaySoanTuNguon throws; 'Draft again' refuses it (r1)**
  Người dùng thấy gì: Một trục trặc tạm thời khi máy đọc tệp vừa tải lên (ví dụ lỗi lưu trữ thoáng qua) có thể khiến màn hình treo mãi ở trạng thái 'đang soạn', không có cách nào bấm soạn lại.
  file: `apps/agent/agent/lib/tai-lieu-soan.ts`
  severity: high
  Đề xuất: new-contract

- **nhan deletes the blob of an already-registered source on dedupe or on any validation error (r1)**
  Người dùng thấy gì: Một trục trặc mạng khi tải tệp lên đôi khi có thể khiến hệ thống tự xoá mất chính tệp vừa lưu, làm nguồn tài liệu đó hỏng vĩnh viễn.
  file: `apps/api/src/tai-lieu/tai-lieu-nguon.service.ts`
  severity: high
  Đề xuất: new-contract

- **drainMaySoan drops every send error without logging it (r1)**
  Người dùng thấy gì: Nếu máy soạn không mở được phiên làm việc, người dùng chỉ thấy một thông báo lỗi chung; đội vận hành sẽ khó truy ra nguyên nhân thật sự nếu lỗi lặp lại nhiều lần.
  file: `apps/agent/agent/lib/tai-lieu-phien.ts`
  severity: low
  Đề xuất: known-limits

- **Timeout sweep uses the same 4-minute budget as the subagent but starts counting earlier (r1)**
  Người dùng thấy gì: Một bản đang được máy soạn hợp lệ có thể đôi khi bị đánh dấu 'hết giờ' hơi sớm, khiến lượt soạn đó bị bỏ phí dù chưa thực sự quá hạn.
  file: `apps/agent/agent/lib/tai-lieu-config.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (asserts a substring is present when the promise is an exact whole-number match): the bien-1-5 case cannot fail (r1)**
  Người dùng thấy gì: Phép kiểm cho quy tắc 'số 1,5 không được tính là khớp với số 11,5' hiện chưa chắc chắn sẽ bắt được lỗi nếu lỗi đó thật sự xảy ra — nếu có sai sót, bản đề xuất có thể trích nhầm số mà không bị chặn lại.
  file: `apps/agent/test/nop-ban-de-xuat.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 1 (reads source code instead of output): the API half of 'both paths go through one write function' is checked by grepping an import string, not by a spy (r1)**
  Người dùng thấy gì: Chưa có bằng chứng chắc chắn rằng đề xuất tạo từ màn nhập tay và đề xuất do máy soạn tạo luôn được lưu theo đúng cùng một cách — nếu hai nơi lệch nhau, dữ liệu đề xuất có thể không nhất quán mà không ai phát hiện qua phép kiểm hiện tại.
  file: `apps/agent/test/tai-lieu-soan.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 1 (reads source code instead of output): 'Blob giả nhận put với access private' is measured by counting regex hits in blob-nguon.ts (r1)**
  Người dùng thấy gì: Chưa có bằng chứng chắc chắn rằng tệp nguồn luôn được lưu ở chế độ riêng tư khi tải lên — nếu chế độ này bị đổi nhầm thành công khai, phép kiểm hiện tại có thể không phát hiện ra.
  file: `apps/api/test/tai-lieu-nguon.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): step 4 of blob-that only checks status != 200, and the promised red direction does not exist (r1)**
  Người dùng thấy gì: Phép kiểm 'tệp nguồn không đọc được nếu không có chữ ký hợp lệ' chưa từng được chứng minh sẽ báo lỗi nếu tệp thật sự bị lộ ra công khai — khả năng phát hiện sự cố lộ tệp chưa được kiểm chứng chắc chắn.
  file: `_acceptance/may-soan-de-xuat/rang/blob-that.mjs`
  severity: high
  Đề xuất: known-limits

- **Shape 5 (claims a class-wide sweep but covers one point case): 'no procedure edits tenTep/sha256/blobPathname/taiBoiId' uses a regex on one file (r1)**
  Người dùng thấy gì: Phép kiểm 'không nơi nào được sửa tên tệp, mã băm, đường dẫn lưu hay người tải của một nguồn' hiện chỉ quét được một cách viết mã; nếu trường này bị sửa theo cách viết khác, phép kiểm có thể không phát hiện.
  file: `apps/api/test/tai-lieu-nguon.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped to the reader): cid.pdf has no '(cid:' text layer; it maps to the private-use range to hit the reader's other branch (r1)**
  Người dùng thấy gì: Ca kiểm 'tệp PDF có lớp chữ hỏng kiểu cid' hiện không thật sự tạo ra đúng dạng hỏng đó, nên khả năng máy nhận diện đúng dạng lỗi này trên tệp thật chưa được chứng minh chắc chắn.
  file: `apps/agent/test/dung-mau-tai-lieu.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 (reads source code instead of output): sandbox deny-all is checked by counting a string in sandbox.ts (r1)**
  Người dùng thấy gì: Phép kiểm 'máy soạn không được ra mạng ngoài' hiện chỉ đếm chữ trong mã nguồn thay vì đọc đúng cấu hình mà hệ thống dùng lúc chạy — nếu cấu hình thật sự lệch, phép kiểm có thể không phát hiện.
  file: `apps/agent/test/tai-lieu-ranh-gioi.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).