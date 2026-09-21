## Trong hợp đồng

Findings: []

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Assertion âm-tính-một-mình / không ghim thông điệp (hình dạng 4): chiều đỏ của E1, E3, E5 hỏng ở bước chờ, không tới assert có ghim thông điệp**
  Người dùng thấy gì: Đây là hạn chế của bằng chứng kiểm thử nội bộ (thông điệp chi tiết trong log test không hiện ra khi test thất bại sớm hơn dự kiến); bảng cột trên màn hình vẫn báo lỗi và cho tải lại đúng như thiết kế, người dùng không bị ảnh hưởng.
  file: `apps/app/test/bang-cot-loi-va-nhan.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).