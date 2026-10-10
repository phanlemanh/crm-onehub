# Review findings: hoan-tac-loat-dung-id (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The client BulkResult type is hand-written to copy the server Zod schema**
  Người dùng thấy gì: Hai chỗ trong mã cùng mô tả một kết quả lưu trữ hàng loạt và phải sửa song song. Người dùng không thấy gì khác hôm nay, nhưng sau này sửa một nơi quên nơi kia thì màn hình có thể hiện sai số.
  file: `apps/app/components/crm/bulk-actions.tsx`
  severity: medium
  Đề xuất: known-limits

- **Bulk archive and restore now write archivedAt through a second path, copied into three services**
  Người dùng thấy gì: Việc lưu trữ và khôi phục hàng loạt nay đi qua một đường riêng, chép ở ba nơi. Hôm nay chạy đúng, nhưng lần sau đổi luật lưu trữ phải sửa cả hai đường, dễ sót và làm hai kiểu thao tác ứng xử lệch nhau.
  file: `apps/api/src/companies/companies.service.ts`
  severity: low
  Đề xuất: known-limits

- **Bulk archive toast hides real per-record errors and says they were 'already archived or no longer there'**
  Người dùng thấy gì: Nếu việc lưu trữ hàng loạt hỏng thật (ví dụ mất kết nối cơ sở dữ liệu), thông báo vẫn nói các bản đã lưu trữ từ trước hoặc không còn, dù thực tế chưa bản nào được cất. Người dùng không biết thao tác đã lỗi và có thể không thử lại.
  file: `apps/app/components/crm/bulk-actions.tsx`
  severity: medium
  Đề xuất: new-contract

- **Undo that finds every record already restored says 'records are still under Archived', which is false**
  Người dùng thấy gì: Nếu có người khác đã khôi phục các bản đó trước khi bạn bấm Hoàn tác, thông báo vẫn nói các bản còn nằm ở mục Đã lưu trữ, trong khi chúng đã được dùng lại bình thường. Chỉ gây hiểu nhầm nhẹ, dữ liệu không sai.
  file: `apps/app/components/crm/bulk-actions.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (a present-string check where the promise is a relation between values): E1's archive cell has succeeded/skipped/failed all equal to 1, so it cannot tell skipped and failed apart**
  Người dùng thấy gì: Bài kiểm tự động cho lưu trữ hàng loạt dùng ba bản mà mỗi loại đúng một cái, nên nếu sau này ai đó làm lẫn bản đã lưu trữ với id không tồn tại, bài kiểm vẫn xanh và lỗi lọt qua mà không ai thấy.
  file: `apps/api/test/hoan-tac-loat-dung-id.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (a present-string check where the promise is a relation between values): E4's 'restored only part' cell has succeeded === failed === 1, so the two numbers can swap places without failing**
  Người dùng thấy gì: Bài kiểm thông báo Hoàn tác một phần dùng số bản khôi phục được bằng số bản không khôi phục được, nên nếu hai con số bị đảo chỗ trên màn hình thì bài kiểm vẫn xanh. Người dùng có thể thấy số sai mà không cổng nào bắt được.
  file: `apps/app/test/hoan-tac-loat-dung-id.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **(r1) Server never logs a real per-record bulk error — runBulk keeps only the first message and the client no longer shows it**
  Người dùng thấy gì: Khi một bản không lưu trữ được vì sự cố thật, phía vận hành không có dòng log nào để biết đã xảy ra lỗi; người dùng chỉ thấy báo «bị bỏ qua».
  file: `apps/api/src/crm/bulk.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
