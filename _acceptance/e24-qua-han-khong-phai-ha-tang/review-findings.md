# Review findings: e24-qua-han-khong-phai-ha-tang

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E3 kiểm «không có dòng luot qua» rỗng: trên đường mã 2, dòng đó không bao giờ được in**
  Người dùng thấy gì: Phép đo tự động không phân biệt được ca một lượt đo quá hạn và một lượt hỏng vì lỗi khác với ca chỉ hỏng vì lỗi khác. Kết quả cho người dùng vẫn đúng (hệ thống vẫn báo «không đo được»), chỉ là bài kiểm này không chứng minh được vế «không lượt nào quá hạn».
  file: `_acceptance/e24-qua-han-khong-phai-ha-tang/rang/qua-han.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — phép kiểm âm tính một mình: E3 «không có dòng 'luot qua'» không bao giờ đỏ được**
  Người dùng thấy gì: Bài kiểm tự động cho trường hợp «lượt hỏng vì model, không vì quá hạn» có một vế luôn đạt dù có sai hay không. Người dùng vẫn nhận kết quả đúng; chỉ là độ tin cậy của bài kiểm đó thấp hơn lời nó khai.
  file: `_acceptance/e24-qua-han-khong-phai-ha-tang/rang/qua-han.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
