## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E2 and E3 paths omit their shared helper khoa-nguon.mjs, so changes to it never mark those evals stale**
  Người dùng thấy gì: Nếu sau này có người sửa phần dùng chung đứng sau tên khoá kho nguồn, hai phép đo liên quan có thể không tự chạy lại để bắt lỗi, nên một thay đổi hỏng có thể lọt qua mà không ai biết.
  file: `_acceptance/man-chu-theo-khoa-kho-nguon/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **mctkkn_chieu_do runs tien-de.mjs twice without taking the mot-luot queue lock**
  Người dùng thấy gì: Khi nhiều phép đo chạy cùng lúc, phép đo chiều đỏ này có thể đụng phép đo khác đang chạy song song và báo sai kết quả, dù sản phẩm không thật sự có lỗi.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **E3 control ticket (ve 2) passes on any exit 2, not specifically on the locked button**
  Người dùng thấy gì: Vé kiểm chứng thứ hai của phép đo này có thể báo 'đúng' ngay cả khi máy đo bị lỗi vì một nguyên nhân hạ tầng khác, chứ không hẳn vì thiếu khoá kho nguồn — nên phép đo chưa chắc chắn tuyệt đối chứng minh đúng điều nó hứa.
  file: `_acceptance/man-chu-theo-khoa-kho-nguon/rang/chieu-do-can-khoa.mjs`
  severity: medium
  Đề xuất: known-limits

- **chay() spawn helper copied into two scripts beside the shared module created for them**
  Người dùng thấy gì: Hai đoạn mã nội bộ của bộ đo giống hệt nhau đang sống ở hai nơi; nếu sau này chỉ sửa một chỗ, cách xử lý lỗi giữa hai bộ đo có thể lệch nhau, nhưng ảnh hưởng tới người dùng cuối là rất nhỏ.
  file: `_acceptance/man-chu-theo-khoa-kho-nguon/rang/chieu-do-can-khoa.mjs`
  severity: low
  Đề xuất: wont-fix

- **E3's empty-key control (ve 2) passes on any exit 2 without checking that the button was locked**
  Người dùng thấy gì: Vé kiểm chứng thứ hai có thể báo 'đúng' dù máy đo hỏng vì lý do khác ngoài thiếu khoá kho nguồn, nên chưa chắc chắn tuyệt đối chứng minh đúng điều nó hứa — dù trong lần chạy thường thì kết quả vẫn đúng.
  file: `_acceptance/man-chu-theo-khoa-kho-nguon/rang/chieu-do-can-khoa.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình, không ghim thông điệp: vé đối chứng (2) của E3 nhận mọi lần thoát mã 2 của bản sao làm bằng chứng «thiếu khoá»**
  Người dùng thấy gì: Vé kiểm chứng thứ hai của phép đo có thể báo 'đúng' ngay cả khi bản sao chết vì một lỗi hạ tầng khác chứ không phải vì thiếu khoá kho nguồn, nên bằng chứng chưa chắc chắn tuyệt đối như hợp đồng mô tả.
  file: `_acceptance/man-chu-theo-khoa-kho-nguon/rang/chieu-do-can-khoa.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
