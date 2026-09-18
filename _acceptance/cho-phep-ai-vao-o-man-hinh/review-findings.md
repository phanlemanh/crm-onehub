## Trong hợp đồng

- **Assert giá trị có mặt (WORKSPACE_ID) trong khi lời hứa là quan hệ được-vào / bị-chặn**
  file: `packages/auth/test/cong-vao.integration.spec.ts:366`
  severity: high
  AC: AC-4
  source: measurement
  detail: Hình dạng 3. Vế mới `khoLamViec ?? null` phải bằng `WORKSPACE_ID` (dòng 366 và 371) được thêm để chứng điều expected của E4: 'họ VẪN tạo được phiên mới'. Nhưng ensureWorkspaceMembership trả đúng cùng `workspace.id` trên MỌI nhánh không nổ: dòng 109 (đã là thành viên), dòng 113 (`if (!decision.allowed) return workspace.id` — bị chặn), và dòng 138 (được nhận). Giá trị trả về không phân biệt được 'còn vào được' với 'bị chặn'; nó chỉ phân biệt 'có nổ vào khối catch' (trả undefined, dòng 145). Vậy vế này ghim sự có mặt của một chuỗi hằng, không ghim quan hệ mà AC-4 hứa. Ngoài ra không có hàng `session` nào được đọc hay tạo trong phép đo (db.session không xuất hiện ở test này), nên 'tạo được phiên mới' vẫn chưa có số đo.
  rationale: AC-4 hứa rõ "họ vẫn tạo được phiên mới", nhưng finding chỉ ra không có hàng session nào được đọc hay tạo trong phép đo — vế Then này của AC-4 hoàn toàn chưa có số đo, tức bằng chứng cho AC-4 chưa đủ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tham số trạng thái lời mời khai `string`, mất chính lưới an toàn mà commit này vừa dựng**
  Người dùng thấy gì: Nếu sau này có một lỗi đánh máy trong trạng thái lời mời, hệ thống kiểm tra tự động có thể không bắt được, khiến lỗi đó lọt vào mà không ai biết.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **E4 không đọc trạng thái TRƯỚC khi rút — điều "Given" của AC-4 (lời cho phép ở accepted) drift về pending mà bài vẫn XANH**
  Người dùng thấy gì: Bài kiểm cho tình huống "người đã vào bị rút lời mời" có thể vẫn báo đạt ngay cả khi nó đang kiểm nhầm một tình huống khác, nên một lỗi thật ở đúng tình huống này có thể không bị phát hiện.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **`thu()` nuốt mọi ngoại lệ thành `false` — một crash trong cổng vào được đọc là "đã chặn đúng"**
  Người dùng thấy gì: Nếu có trục trặc kỹ thuật xảy ra trong lúc kiểm tra quyền vào, hệ thống kiểm tra tự động có thể nhầm đó là "đã chặn đúng người", khiến vấn đề thật không được phát hiện.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Tham số `trangThai` khai kiểu `string` — đúng lớp lỗi "cancelled" hai chữ L mà vòng này đi vá vẫn biên dịch được**
  Người dùng thấy gì: Một lỗi đánh máy trong trạng thái lời mời có thể lọt qua mà không bị phát hiện, tạo ra một dòng dữ liệu không ai đọc được.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: cả ba vế của E4 vẫn xanh khi bỏ hẳn lượt rút**
  Người dùng thấy gì: Bài kiểm cho việc "rút lời mời không ảnh hưởng người đã vào" có thể vẫn báo đạt ngay cả khi bước rút lời mời không hề xảy ra, khiến một lỗi thật ở đúng chỗ này khó bị phát hiện.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Fixture viết tay đúng khuôn bên đọc — không round-trip qua bên ghi thật**
  Người dùng thấy gì: Dữ liệu giả lập dùng để kiểm tra có thể không khớp với cách hệ thống thật ghi dữ liệu, khiến bài kiểm báo đạt trong khi hành vi thật có thể khác.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

Carried từ round trước (file không đổi, round này không chấm lại):

- **Cột staffEmailDomains không có đường ghi và không có backfill — hai đường đọc "người nhà" mất sạch domain (r3)**
  Người dùng thấy gì: Nếu chưa có nơi nào để nhập danh sách domain công ty, tính năng lọc 'đây là đồng nghiệp mình' sẽ luôn coi ai cũng là người ngoài — nhân viên mới có thể bị ghi nhầm thành khách hàng tiềm năng trong CRM.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: high
  Đề xuất: new-contract

- **`staff-domains.ts` tự đúc hằng `APP_SETTING_ID` và đọc `findFirst` không khoá theo id, lệch pattern của cả kho (r3)**
  Người dùng thấy gì: Nếu bảng cài đặt từng có hơn một dòng, màn hình có thể âm thầm đọc nhầm danh sách domain nội bộ, khiến việc nhận diện email nhân viên hoặc lọc số liệu truy cập sai mà không ai biết.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: medium
  Đề xuất: known-limits

- **Cột staffEmailDomains không có đường ghi và migration không backfill — lọc "địa chỉ nhà" ở tracking tắt hẳn, âm thầm (r3)**
  Người dùng thấy gì: Nếu chưa có nơi nào để nhập danh sách domain công ty, các mẫu đăng ký do chính nhân viên điền bằng email công ty có thể bị tính nhầm thành khách hàng tiềm năng thật, làm sai lệch số liệu tiếp thị mà không ai nhận ra.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: high
  Đề xuất: new-contract

- **Câu từ chối ở cổng vào vẫn chỉ người dùng đi sửa .env, trong khi mô hình mới quyết bằng bảng cho phép (r3)**
  Người dùng thấy gì: Với một hệ thống đã có người dùng, khi có người mới bị từ chối vào, thông báo họ nhận được hướng dẫn sửa một file cấu hình không còn tác dụng nữa, khiến quản trị viên loay hoay sai hướng thay vì vào màn Members để cấp quyền.
  file: `packages/auth/src/auth.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
