## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E15a now drives the review screen, but its `paths` still leave out the screen code and man-lib**
  Người dùng thấy gì: Ảnh chụp minh chứng ở màn duyệt có thể không được đánh dấu lỗi thời khi giao diện màn đó đổi, khiến người đọc hồ sơ tưởng nhầm ảnh cũ vẫn là bằng chứng đúng cho bản mới.
  file: `_acceptance/may-soan-de-xuat/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E15a `expected` no longer matches the script's exit condition**
  Người dùng thấy gì: Khi phép đo báo lỗi, người đọc báo cáo có thể hiểu nhầm là máy soạn thất bại trong khi thực ra chỉ là bước chụp màn duyệt bị lỗi, gây mất thời gian tra sai chỗ.
  file: `_acceptance/may-soan-de-xuat/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **soan-that.mjs silently drops console and page errors from the review-screen captures**
  Người dùng thấy gì: Nếu màn duyệt gặp lỗi ẩn khi hiển thị, phép đo vẫn báo đạt và ảnh chụp vẫn được tính là bằng chứng sạch, nên một lỗi thật ở màn duyệt có thể không ai phát hiện.
  file: `_acceptance/may-soan-de-xuat/rang/soan-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **The 'Changes against the page in use' card diffs against banGoc, not the page currently in use**
  Người dùng thấy gì: Nếu một đề xuất khác được duyệt trong lúc bản máy soạn đang chờ, thẻ 'Thay đổi so với bản đang dùng' có thể vẫn so sánh với bản cũ hơn, khiến người duyệt hiểu sai về những gì thực sự sắp thay đổi.
  file: `apps/app/app/(app)/[slug]/tai-lieu/de-xuat/[id]/man-duyet.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): cờ coBanGoc được đặt tay, không đi qua page.tsx**
  Người dùng thấy gì: Chưa có phép đo nào xác nhận máy suy đúng lúc nào cần hiện khối so sánh với bản đang dùng, nên nếu logic đó tính sai trong thực tế, người duyệt có thể không thấy cảnh báo đáng ra phải có.
  file: `apps/app/test/tai-lieu-man-duyet-may.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «chuỗi có mặt» trong khi lời hứa là quan hệ): khối so với bản đang dùng chỉ được kiểm là có chứa "1,2%"**
  Người dùng thấy gì: Bằng chứng hiện chỉ xác nhận có chữ '1,2%' xuất hiện đâu đó trên màn, chứ chưa xác nhận đúng số cũ bị gạch bỏ và số mới được thêm vào đúng chỗ, nên một lỗi hiển thị đảo ngược hai giá trị có thể lọt qua mà không ai biết.
  file: `apps/app/test/tai-lieu-man-duyet-may.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): tiền tố «crm:» của token kênh viết tay, không lấy từ bên viết là eve**
  Người dùng thấy gì: Giả định về cách hệ thống ghi token phiên có thể không khớp thực tế, và nếu cách ghi đó đổi, việc tự động đóng phiên máy soạn khi gặp lỗi có thể lặng lẽ ngừng hoạt động mà không ai nhận ra ngay.
  file: `apps/agent/test/crm-token.spec.ts`
  severity: low
  Đề xuất: known-limits

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

⚠ Cụm ngoài vùng phủ: 3/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/may-soan-de-xuat/evals.yaml, apps/agent/test/crm-token.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.