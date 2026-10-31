# Review findings: hex-trang-gioi-thieu (round 2)

## Trong hợp đồng

Không có finding.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chế độ HTG_XEM_SAU của man.mjs hỏng sau khi globals.css đổi selector thành ':root,\n.dark {' (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khách xem trang giới thiệu không bị ảnh hưởng gì. Chỉ có công cụ nội bộ dựng lại ảnh minh chứng cũ là không chạy được nữa, và nó báo lỗi rõ ràng chứ không âm thầm cho kết quả sai.
  Căn cứ: Không đến tay người dùng cuối, lỗi báo ra rõ ràng, ảnh minh chứng cần thiết đã có sẵn; sửa chỉ để dựng lại ảnh cũ thì tốn công hơn nhiều so với hậu quả.
  file: `_acceptance/hex-trang-gioi-thieu/rang/man.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
