## Trong hợp đồng

(không có phát hiện nào map được vào AC ở vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (assertion âm tính không ghim thông điệp): ca C6 chấp nhận mọi đường mã 2, không riêng «ref không phân giải được»**
  Người dùng thấy gì: Phép kiểm thử tự động cho tình huống "không dò được điểm so sánh" hiện chấp nhận bất kỳ lỗi cùng loại nào thay vì đúng tình huống đó, nên nếu sau này cách báo lỗi thay đổi, phép kiểm có thể không phát hiện ra sai khác thật.
  file: `_acceptance/khong-cham-thuoc-bat-doi-ten/rang/doi-ten.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có — mọi finding đều đã qua adversarial-verify)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).