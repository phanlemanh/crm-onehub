# Review findings: khung-loi-ban-ghi-dung-ly-do (round 1)

## Trong hợp đồng

- **Hình dạng 3 (lời hứa là quan hệ «đúng một lần», assert chỉ kiểm «có gọi»): klg-mat-ket-noi dùng `>= 1`**
  AC: AC-3
  file: `apps/app/test/khung-loi-ban-ghi-dung-ly-do.dom.tsx:375`
  severity: low
  source: measurement
  detail: AC-3 và E3 hứa «bấm Thử lại gọi lại đúng truy vấn của ngăn đó đúng một lần» («so lan goi byId tang dung 1»). Dòng 375 `expect(goiCua(n.duong).length - truoc >= 1).toBe(true)` chỉ kiểm có ít nhất một lần gọi, tức một phép có-mặt, không ghim quan hệ hiệu = 1. Phần đếm chính xác duy nhất là `goiKhiKhung` (dòng 354, 374), mà nó chỉ đếm lần gọi xảy ra khi khung còn trong DOM. Một lần gọi thừa sau khi khung đã biến mất (ví dụ refetch lặp hay invalidate sau khi tải xong) lọt qua cả hai assert. Hiệu `goiCua(...).length - truoc` lẽ ra phải là `toBe(1)` thì mới đo đúng lời hứa.
  rationale: AC-3 nêu rõ «bấm Thử lại gọi lại đúng truy vấn của ngăn đó đúng một lần», mà phép đo chỉ kiểm có ít nhất một lần gọi nên không chứng minh được lời hứa của AC này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The 'record gone' copy says «xoá vĩnh viễn» for every NOT_FOUND, which breaks the CONTEXT.md glossary**
  Người dùng thấy gì: Khi mở một bản ghi không còn (đã xoá, hoặc đường dẫn sai), màn hình nói chắc rằng có người đã «xoá vĩnh viễn» nó, trong khi có thể chưa ai làm vậy. Người dùng có thể hiểu sai chuyện gì đã xảy ra với dữ liệu của mình.
  file: `apps/app/lib/messages/kara-ban-ghi.ts`
  severity: medium
  Đề xuất: new-contract

- **man.mjs turns off the console-error check for the Close step, and does not ignore the load-time NOT_FOUND as it says**
  Người dùng thấy gì: Phép kiểm trên màn thật có thể bỏ sót một lỗi ngầm xảy ra khi đóng ngăn bản ghi. Người dùng vẫn thấy ngăn đóng bình thường, nhưng nếu có lỗi ngầm thì lần chạy kiểm vẫn báo đạt.
  file: `_acceptance/khung-loi-ban-ghi-dung-ly-do/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **The 'no longer exists' frame says someone permanently deleted the record, but NOT_FOUND also covers ids that never existed**
  Người dùng thấy gì: Mở đường dẫn gõ sai hoặc bị cắt cụt cũng cho ra thông báo như thể ai đó vừa xoá vĩnh viễn bản ghi. Người dùng bị báo một việc chưa từng xảy ra và chỉ có nút Đóng.
  file: `apps/app/lib/messages/kara-ban-ghi.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, không round-trip): E4 bơm NOT_FOUND/FORBIDDEN cho plansOfCompany, mà máy chủ thật không trả hai mã đó**
  Người dùng thấy gì: Hai trong ba trường hợp lỗi của mục «Kế hoạch» trong ngăn công ty được thử bằng lỗi giả mà hệ thống thật hầu như không tạo ra. Người dùng gần như không gặp hai khung đó, nhưng phép kiểm xanh không chứng minh được chúng chạy đúng ngoài đời.
  file: `apps/app/test/khung-loi-ban-ghi-dung-ly-do.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
