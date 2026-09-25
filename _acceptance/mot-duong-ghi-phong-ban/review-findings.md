## Trong hợp đồng

(Không có finding nào ánh xạ được vào AC trong round này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **org.restoreDepartment skips the tree's own guards: archived division and live-name uniqueness**
  Người dùng thấy gì: Khôi phục một phòng ban đã lưu trữ có thể đưa nó về dưới một khuôn tổ chức đã lưu trữ, hoặc tạo ra hai phòng ban đang hoạt động cùng tên cùng lúc, mà không có cảnh báo nào.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Re-pin 0ec378b9 silently drops the pending re-check on human-judged evals in three signed-off profiles; the E10 check never looks for it**
  Người dùng thấy gì: Một vài hồ sơ tính năng đã ký duyệt trước đây có thể hiện trạng thái đã xác nhận lại, dù phần bị thay đổi bởi tính năng này lẽ ra cần một người xem lại mà chưa ai xem.
  file: `_acceptance/mot-duong-ghi-phong-ban/rang/ho-so-da-ghim.mjs`
  severity: medium
  Đề xuất: known-limits

- **Empty-scan guard in mot-cho-ghi.mjs can never fire**
  Người dùng thấy gì: Nếu một lần quét kiểm tra nội bộ bỏ sót toàn bộ tệp của một phần ứng dụng, công cụ sẽ không báo lỗi — rủi ro nằm ở quy trình kiểm tra phía sau, không lộ ra màn hình người dùng.
  file: `_acceptance/mot-duong-ghi-phong-ban/rang/mot-cho-ghi.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (khẳng định âm tính một mình): «vẫn còn trong cây/danh sách» sau khi bị từ chối không thể đỏ**
  Người dùng thấy gì: Bài kiểm màn hình hiện tại không phân biệt được giữa việc lưu trữ/khôi phục thành công và bị từ chối, nên nếu sau này có lỗi khiến màn không cập nhật đúng lúc bị từ chối, bài kiểm sẽ không phát hiện ra.
  file: `apps/app/test/to-chuc.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP, không có ma trận viết trước), kèm hình dạng 1 (đo tệp sinh ra thay vì router đang chạy) ở E6b**
  Người dùng thấy gì: Một bài kiểm phụ về danh sách quyền có thể không phát hiện nếu thủ tục ghi phòng ban mới bị rớt khỏi danh sách, nhưng một bài kiểm khác đã chặn đúng rủi ro đó.
  file: `apps/api/test/to-chuc.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét LỚP «mọi app», không có danh sách app viết trước): chặn «> 0 tệp mỗi app» không thể đỏ**
  Người dùng thấy gì: Guard đếm tệp theo từng phần ứng dụng có thể im lặng bỏ sót một phần bị quét trống hoàn toàn mà không ai được báo.
  file: `_acceptance/mot-duong-ghi-phong-ban/rang/mot-cho-ghi.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (dữ liệu giả viết tay): câu từ chối của khôi phục là câu máy chủ không bao giờ trả cho thủ tục đó**
  Người dùng thấy gì: Có một tình huống từ chối khôi phục trên màn hình được kiểm bằng câu chữ mà máy chủ thật không bao giờ trả cho thao tác đó, nên nếu máy chủ đổi câu chữ, người dùng có thể thấy thông báo sai mà không ai phát hiện.
  file: `apps/app/test/to-chuc.dom.tsx`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

(Không có mục nào trong round này.)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).