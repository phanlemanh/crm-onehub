## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Caret colour is written twice, as a CSS string and as an RGB array, and nothing ties them together**
  Người dùng thấy gì: Nếu sau này có người đổi màu con trỏ dùng để đo mà quên đổi cả hai chỗ, bước kiểm tự động có thể báo nhầm là lỗi dù ô soạn vẫn hoạt động đúng — người dùng cuối không bị ảnh hưởng, chỉ ảnh hưởng độ tin cậy của phép kiểm.
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`
  severity: low
  Đề xuất: known-limits

- **A test fixture under apps/api/test is imported by relative path from apps/agent and apps/app (r1)**
  Người dùng thấy gì: Nếu ai đó xóa hoặc đổi tên thư mục test của một ứng dụng, hai ứng dụng khác âm thầm hỏng theo mà không có cảnh báo, vì ba nơi cùng dùng chung một tệp dữ liệu mẫu nằm ngoài chỗ quy định.
  file: `apps/agent/test/log-loi-hoi-thoai.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay vì quan hệ): E7 hàng 3 không kiểm lý do hỏng M3 của bản ghi task (r1)**
  Người dùng thấy gì: Nếu tác vụ nghiên cứu hỏng nhưng lý do lưu lại bị sai hoặc để trống, vòng đo hiện tại vẫn có thể báo đạt vì chỉ kiểm trạng thái hỏng chứ không kiểm đúng lý do — người xem báo cáo hỏng có thể thấy lý do không khớp với chuyện đã thực sự xảy ra.
  file: `apps/agent/test/log-loi-hoi-thoai.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).