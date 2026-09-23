## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC nào trong vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A signal during gieo() leaks the conversation because donDep runs only once**
  Người dùng thấy gì: Nếu dừng thước đo bằng tín hiệu đúng lúc nó đang tạo dữ liệu thử (trước khi bước tạo xong), một cuộc hội thoại thử có thể bị bỏ sót trong cơ sở dữ liệu phát triển thay vì được dọn sạch.
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`
  severity: low
  Đề xuất: known-limits

- **The time limit in caThat kills only the outer bash, so the wait is not bounded**
  Người dùng thấy gì: Khi một lượt đo bị buộc dừng vì quá giờ, tiến trình đo phía sau có thể vẫn treo lại thay vì dừng ngay, khiến người chờ kết quả phải đợi lâu hơn thời hạn đã định.
  file: `_acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 5 (claims the whole class, has point cases only): the three injected points claim to cover every khongDo, but no real khongDo call site runs**
  Người dùng thấy gì: Bộ kiểm tra hiện chỉ giả lập lỗi treo ở ba điểm dùng chung, chưa thử đúng những chỗ thật trong luồng (ô soạn không thấy, không lấy được con trỏ, không thấy thanh nút) — nên nếu về sau một lỗi thật ở đúng những chỗ đó bị bỏ sót âm thầm, phép đo hiện tại có thể không phát hiện ra.
  file: `_acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs`
  severity: medium
  Đề xuất: new-contract

- **Shape 4 (negative assertion alone): the '@onemount.com' absence check never runs on the original version, so it has no positive control**
  Người dùng thấy gì: Điều kiện kiểm tra 'tệp không còn email thật viết cứng' chưa từng được thử trên phiên bản có lỗi đó, nên chưa có bằng chứng cho thấy nó thực sự bắt được lỗi nếu lỗi quay lại sau này.
  file: `_acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): the 'no builder: string' clause in xetToken has no positive control of its own; the original version goes red because the import is missing**
  Người dùng thấy gì: Điều kiện kiểm tra 'không viết tay token' đang gộp chung với điều kiện khác, nên nếu phiên bản sau này nhập đúng thư viện nhưng vẫn viết tay token, phép đo có thể không phân biệt được và bỏ sót lỗi đó.
  file: `_acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
