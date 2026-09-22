## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **overdueTasks.createdBy dùng khuôn linkedRecordOutput thay vì ownerOutput/OWNER_SELECT như recentActivity.createdBy trong cùng contract**
  Người dùng thấy gì: Cách mã hoá tên người tạo trên thẻ việc quá hạn khác với dòng hoạt động gần đây về mặt kỹ thuật, nhưng hiện chưa gây sai lệch gì trên màn hình cho người dùng.
  file: `apps/api/src/dashboard/dashboard.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **Team-mode overdue count is silently capped at 10 now that the query covers every user**
  Người dùng thấy gì: Với đội có nhiều việc quá hạn, thẻ Việc quá hạn có thể chỉ đếm và hiện 10 việc đầu mà không báo còn sót, khiến người dùng tưởng đội đã gần hết việc quá hạn trong khi thực tế còn nhiều hơn.
  file: `apps/api/src/dashboard/dashboard.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 2 (fixture/giá trị gieo tay trùng khuôn bên đọc): assert dòng 3 của E5 không phân biệt được đột biến toISOString().slice mà evals.yaml tuyên bố**
  Người dùng thấy gì: Nếu tính năng hạn theo ngày bị hỏng và quay lại cách tính cũ, bài kiểm tra tự động hiện tại có thể không phát hiện ra, nên lỗi có nguy cơ lọt tới người dùng mà không ai biết trước.
  file: `apps/api/test/han-viec.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): «chế độ Tôi không có dòng U» chỉ đúng vì bản giả trả payload.me, bất kể màn gửi scope nào**
  Người dùng thấy gì: Nếu màn hình gửi nhầm chế độ xem lên máy chủ, bài kiểm tra hiện tại không chắc phát hiện ra lỗi đó, nên một lỗi hiện việc quá hạn của người khác trong chế độ Tôi có thể lọt qua mà không bị bắt.
  file: `apps/app/test/han-viec.dom.tsx`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
