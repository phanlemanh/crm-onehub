# Review findings: zalo-va-cach-ly (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Signed zalo-va E5 now runs the new app spec, but its paths do not list that file**
  Người dùng thấy gì: Nếu sau này có người sửa hoặc làm yếu bài kiểm câu chào mới ở phía ứng dụng, dấu ghim của hồ sơ Zalo cũ sẽ không báo là đã cũ. Bài kiểm vẫn chạy và vẫn đo đủ như đã hứa, chỉ là việc phát hiện thay đổi về sau yếu hơn ở hồ sơ đó.
  file: `_acceptance/zalo-va/evals.yaml`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

