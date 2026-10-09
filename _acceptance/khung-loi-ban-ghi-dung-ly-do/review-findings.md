# Review findings: khung-loi-ban-ghi-dung-ly-do (round 2)

## Trong hợp đồng

Không có phát hiện nào nằm trong hợp đồng ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E6 is reported as PASS (exit 0) even though its first run failed; the evidence file shows it was rerun until it went green**
  Người dùng thấy gì: Màn «Bản ghi này không còn» vẫn hiện đúng, nhưng phép đo tự động cho màn này lúc chạy đỏ lúc xanh tuỳ nhịp tải trang, và báo cáo chỉ ghi lần xanh. Người ký cần biết kết quả xanh đó đã phải đo lại nhiều lần mới được.
  file: `_acceptance/khung-loi-ban-ghi-dung-ly-do/evidence/E6-network.txt`
  severity: medium
  Đề xuất: known-limits

- **The 'record gone' copy says «xoá vĩnh viễn» for every NOT_FOUND, which breaks the CONTEXT.md glossary (r1)**
  Người dùng thấy gì: Khi mở một bản ghi không còn (đã xoá, hoặc đường dẫn sai), màn hình nói chắc rằng có người đã «xoá vĩnh viễn» nó, trong khi có thể chưa ai làm vậy. Người dùng có thể hiểu sai chuyện gì đã xảy ra với dữ liệu của mình.
  file: `apps/app/lib/messages/kara-ban-ghi.ts`
  severity: medium
  Đề xuất: new-contract

- **man.mjs turns off the console-error check for the Close step, and does not ignore the load-time NOT_FOUND as it says (r1)**
  Người dùng thấy gì: Phép kiểm trên màn thật có thể bỏ sót một lỗi ngầm xảy ra khi đóng ngăn bản ghi. Người dùng vẫn thấy ngăn đóng bình thường, nhưng nếu có lỗi ngầm thì lần chạy kiểm vẫn báo đạt.
  file: `_acceptance/khung-loi-ban-ghi-dung-ly-do/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **The 'no longer exists' frame says someone permanently deleted the record, but NOT_FOUND also covers ids that never existed (r1)**
  Người dùng thấy gì: Mở đường dẫn gõ sai hoặc bị cắt cụt cũng cho ra thông báo như thể ai đó vừa xoá vĩnh viễn bản ghi. Người dùng bị báo một việc chưa từng xảy ra và chỉ có nút Đóng.
  file: `apps/app/lib/messages/kara-ban-ghi.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, không round-trip): E4 bơm NOT_FOUND/FORBIDDEN cho plansOfCompany, mà máy chủ thật không trả hai mã đó (r1)**
  Người dùng thấy gì: Hai trong ba trường hợp lỗi của mục «Kế hoạch» trong ngăn công ty được thử bằng lỗi giả mà hệ thống thật hầu như không tạo ra. Người dùng gần như không gặp hai khung đó, nhưng phép kiểm xanh không chứng minh được chúng chạy đúng ngoài đời.
  file: `apps/app/test/khung-loi-ban-ghi-dung-ly-do.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
