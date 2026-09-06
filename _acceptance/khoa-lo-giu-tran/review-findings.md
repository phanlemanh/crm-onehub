## Trong hợp đồng

Không có finding nào khớp AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Test xoá mọi hàng AgentTask, kể cả hàng nó không tạo**
  Người dùng thấy gì: Bộ kiểm thử tự xoá sạch dữ liệu thử nghiệm dùng chung để đo đúng số hàng; đây là cách làm đã được chấp nhận cho tính năng này và không ảnh hưởng người dùng sản phẩm thật.
  file: `apps/agent/test/tasks.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Răng cũng xoá toàn bảng AgentTask khi chạy tay ngoài rang.sh**
  Người dùng thấy gì: Nếu ai đó chạy công cụ đo bằng tay thay vì qua kịch bản chuẩn, dữ liệu thử nghiệm của các tính năng khác có thể bị xoá sạch mà không báo trước.
  file: `apps/agent/rang/khoa-lo-giu-tran.rang.ts`
  severity: medium
  Đề xuất: known-limits

- **sha trước-sửa và chuỗi dời import bị chép đôi giữa rang.ts và rang.sh**
  Người dùng thấy gì: Cùng một giá trị được ghi ở hai nơi; nếu sau này chỉ cập nhật một chỗ, phép so sánh trước và sau khi sửa có thể lặng lẽ dùng sai phiên bản mà không ai nhận ra.
  file: `apps/agent/rang/khoa-lo-giu-tran.rang.ts`
  severity: low
  Đề xuất: known-limits

- **rang.sh prepare_db lặng lẽ dùng DB test chung khi sed không viết lại được tên DB**
  Người dùng thấy gì: Nếu tên cơ sở dữ liệu thử nghiệm có ký tự đặc biệt, công cụ có thể lặng lẽ chạy nhầm trên cơ sở dữ liệu dùng chung và xoá dữ liệu của người khác mà không báo lỗi.
  file: `_acceptance/khoa-lo-giu-tran/rang.sh`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
