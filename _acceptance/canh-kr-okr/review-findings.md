## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **taoTuMau creates KRs without the per-KR `tao-kr` trail row the hand-made path writes**
  Người dùng thấy gì: Khi trưởng phòng tạo mục tiêu từ mẫu và gán người khác phụ trách một KR, người đó có thể không nhận được thông báo 'Được giao phụ trách KR' như khi KR được tạo bằng tay.
  file: `apps/api/src/okr/okr-mau.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Sáng kiến category defined twice: API-local constant plus an inline literal in validation**
  Người dùng thấy gì: Không có hậu quả cho người dùng ngay bây giờ; rủi ro là sau này thêm một loại sáng kiến mới, một chỗ có thể bị quên sửa và làm ô nhập với danh sách hiển thị lệch nhau.
  file: `apps/api/src/okr/okr-canh-kr.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **mauKr.unit re-declares the KR unit rule instead of reusing krInput.shape.unit**
  Người dùng thấy gì: Nếu sau này trần ký tự đơn vị đo của KR đổi, một mẫu vẫn có thể lưu đơn vị đo vượt trần mới, khiến việc tạo mục tiêu từ mẫu đó bị từ chối bất ngờ.
  file: `packages/validation/src/okr-mau.ts`
  severity: low
  Đề xuất: known-limits

- **«Milestone is done» is re-derived inline in three server places instead of one function**
  Người dùng thấy gì: Không ảnh hưởng người dùng hiện tại; rủi ro là nếu luật 'mốc xong' đổi sau này, ba nơi có thể sửa không đủ cả ba và làm ứng xử lệch nhau giữa các màn.
  file: `apps/api/src/okr/okr-canh-kr.service.ts`
  severity: low
  Đề xuất: known-limits

- **Ghi nhận recipient ids skip the module's id schema at the boundary**
  Người dùng thấy gì: Không có hậu quả rõ cho người dùng bình thường; đây là một khe hở kỹ thuật nhỏ ở tầng kiểm dữ liệu đầu vào, không phải một ca người dùng gặp trong luồng dùng thật.
  file: `packages/validation/src/okr-canh-kr.ts`
  severity: low
  Đề xuất: known-limits

- **The «may remove a recognition» rule is decided in two places**
  Người dùng thấy gì: Không có hậu quả ngay bây giờ; rủi ro là nếu sau này khái niệm 'quản trị' trong OKR đổi, nút gỡ trên màn và quyền gỡ thật ở máy chủ có thể không còn khớp nhau.
  file: `apps/api/src/okr/okr-trao-doi.service.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion with no positive control): step 5 of E16 passes without ever reading a template list**
  Người dùng thấy gì: Chưa có bằng chứng chắc chắn rằng nút 'Bắt đầu từ mẫu' hiện đúng cho mọi đơn vị có mẫu phù hợp — một lỗi ẩn ở đây có thể không bị phát hiện cho tới khi người dùng thật gặp phải.
  file: `_acceptance/canh-kr-okr/rang/man-canh-kr.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion that pins no message): the guiCapNhat + javascript: test checks only status 400, and E5 never runs it**
  Người dùng thấy gì: Chưa có bằng chứng xác nhận rằng dán một đường dẫn không hợp lệ vào hộp thoại 'Cập nhật tuần' luôn bị từ chối đúng cách — một lỗi ở đây có thể lọt qua mà không ai biết.
  file: `apps/api/test/okr-cap-nhat.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture matching the reader's shape): the mock re-implements the server filter, so 'server filters, screen does not re-filter' is not measured**
  Người dùng thấy gì: Chưa có bằng chứng xác nhận màn 'Đặt mục tiêu' không lọc lại danh sách mẫu sau khi máy chủ đã lọc — nếu có lỗi ở đây, trưởng đơn vị có thể thấy mẫu không thuộc đơn vị mình mà không ai phát hiện.
  file: `apps/app/test/okr-canh-kr.dom.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).