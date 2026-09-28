## Trong hợp đồng

(không có phát hiện nào map được vào một AC của hợp đồng)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4: đối chứng dương không tách được đại lượng nó cần đối chứng — Date.now của vòng Myers mức khối lẫn vào số đếm**
  Người dùng thấy gì: Bài kiểm tra chống-hồi-quy cho phần rút gọn khi so sánh tài liệu có một lỗ hổng nhỏ: nếu sau này thư viện so sánh đổi cách hoạt động, bài kiểm tra này có thể vẫn báo "đạt" dù tính năng tăng tốc đã ngừng phát huy tác dụng, khiến việc so sánh tài liệu lại chậm mà không ai phát hiện ra.
  file: `packages/validation/test/tai-lieu-diff.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: ma trận 7 ca viết trước nhưng số ca không được ghim (evals ghi «6 pass», không gì buộc GHIM phủ đủ CAP)**
  Người dùng thấy gì: Nếu sau này có ai vô tình xoá mất một trường hợp kiểm thử so sánh tài liệu khỏi danh sách, hệ thống kiểm tra tự động hiện tại sẽ không nhận ra và vẫn báo "mọi thứ ổn", nên một khiếm khuyết có thể lọt vào sản phẩm mà không ai hay biết.
  file: `_acceptance/tai-lieu-diff-bo-myers-vo-ich/evals.yaml`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).