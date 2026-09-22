## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The agent can still create fields and change field briefs with no role check, which breaks the promise that every path is locked**
  Người dùng thấy gì: Một thành viên thường vẫn có thể nhờ trợ lý AI trong khung chat thêm hoặc đổi trường của cả đội, dù trên màn hình các nút đó đã bị khoá cho vai trò của họ.
  file: `apps/agent/agent/tools/manage_fields.ts:50`
  severity: medium
  Đề xuất: new-contract

- **When fields.access fails, the page falsely tells admins they lack admin rights and shows no error**
  Người dùng thấy gì: Nếu máy chủ tạm trục trặc lúc tải màn Trường, một quản trị có thể bị báo nhầm là không đủ quyền đổi trường và không có cách nào để thử lại, dù họ thật sự có quyền.
  file: `apps/app/app/(app)/[slug]/settings/fields/fields-settings.tsx:47`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 5 (quet LOP nhung chi co diem-case): ma tran bay thao tac khong doi chieu voi tap thu tuc doi cua router, va phep dem ca tu tham chieu chinh no**
  Người dùng thấy gì: Bộ kiểm thử hiện đếm đúng số ca như đã hứa, nhưng không đối chiếu với danh sách thao tác đổi trường thật của hệ thống — nên nếu sau này có ai thêm một cách đổi trường mới mà quên khoá quyền, bộ kiểm thử này có thể không phát hiện ra.
  file: `apps/api/test/chi-quan-tri-truong.spec.ts:264`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).