## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC nào trong vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A signal during gieo() leaks the conversation because donDep runs only once (r1)**
  Người dùng thấy gì: Nếu dừng thước đo bằng tín hiệu đúng lúc nó đang tạo dữ liệu thử (trước khi bước tạo xong), một cuộc hội thoại thử có thể bị bỏ sót trong cơ sở dữ liệu phát triển thay vì được dọn sạch.
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
