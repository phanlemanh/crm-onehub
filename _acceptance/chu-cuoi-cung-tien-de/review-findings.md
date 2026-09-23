## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **haChuLa/traVai change the roles of member rows the spec did not create, against the repo's existing rule that a spec never touches other people's access**
  Người dùng thấy gì: Nếu nhiều lượt kiểm thử chạy cùng lúc trên cùng một cơ sở dữ liệu dùng chung, một lượt có thể tạm thời hạ quyền quản trị của người khác trong lúc chạy; nếu tiến trình đó bị dừng đột ngột, quyền bị hạ có thể không được khôi phục lại.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **tra-vai reports a failed precondition (TIEN DE) with exit 1 instead of exit 2**
  Người dùng thấy gì: Trong một tình huống hiếm, thông báo lỗi của công cụ đo có thể khiến người xem tưởng nhầm là lỗi của tính năng, trong khi thực ra là công cụ đo không kiểm tra được, dẫn đến mất thời gian điều tra sai hướng.
  file: `_acceptance/chu-cuoi-cung-tien-de/rang/chu-la.mjs`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).