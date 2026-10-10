# Review findings: hoan-tac-loat-dung-id (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bulk archive reports real failures as benign skips and drops the server error message**
  Người dùng thấy gì: Nếu máy chủ gặp sự cố thật giữa chừng khi lưu trữ nhiều bản, người dùng chỉ thấy dòng báo vàng 'bị bỏ qua' (hoặc 'không có gì đổi') thay vì một báo lỗi, nên có thể tưởng bản đó đã lưu trữ từ trước trong khi thật ra chưa được cất.
  file: `apps/app/components/crm/bulk-actions.tsx`
  severity: medium
  Đề xuất: known-limits

- **Archive/restore logic copied into three services next to the existing single-record archive()/restore()**
  Người dùng thấy gì: Người dùng không thấy khác biệt ngay. Về sau nếu quy tắc lưu trữ đổi, lưu trữ từng bản và lưu trữ hàng loạt có thể lệch nhau nếu quên sửa đủ chỗ.
  file: `apps/api/src/companies/companies.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Client keeps a hand-written BulkResult type beside the server Zod schema**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng hôm nay. Chỉ có nguy cơ về sau: nếu máy chủ đổi hình kết quả mà màn hình không được cập nhật theo, thông báo có thể sai mà không ai phát hiện sớm.
  file: `apps/app/components/crm/bulk-actions.tsx`
  severity: low
  Đề xuất: wont-fix

- **Real archive errors are reported as 'already archived or no longer there', and the error is logged nowhere**
  Người dùng thấy gì: Khi một bản không lưu trữ được vì sự cố thật, người dùng được báo là 'đã lưu trữ từ trước hoặc không còn', còn bản đó vẫn đang dùng. Phía vận hành cũng không có dấu vết nào để biết đã xảy ra lỗi.
  file: `apps/app/components/crm/bulk-actions.tsx`
  severity: medium
  Đề xuất: new-contract

- **Undo says 'still under Archived' when every record was already restored elsewhere**
  Người dùng thấy gì: Nếu người khác đã khôi phục các bản đó trước khi mình bấm Hoàn tác, mình vẫn nhận báo lỗi 'các bản vẫn nằm trong Đã lưu trữ' dù chúng đã đang dùng bình thường, gây hiểu nhầm.
  file: `apps/app/components/crm/bulk-actions.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: assert chuỗi có mặt, nhưng lời hứa AC-3 là quan hệ số đã khôi phục ↔ succeeded, số không khôi phục được ↔ failed, và fixture cho hai số bằng nhau**
  Người dùng thấy gì: Chưa có bằng chứng sản phẩm sai, nhưng bài kiểm hiện không bắt được lỗi đảo hai con số trong thông báo Hoàn tác (số đã khôi phục và số không khôi phục được), nên một lỗi như vậy sau này có thể lọt qua mà không ai biết.
  file: `apps/app/test/hoan-tac-loat-dung-id.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3/5: số «bị bỏ qua» là skipped + failed, nhưng ma trận E5 không có ô nào cả hai cùng khác 0**
  Người dùng thấy gì: Khi một lô vừa có bản đã lưu trữ từ trước vừa có bản không còn tồn tại, con số 'bị bỏ qua' trên thông báo chưa được kiểm tự động, nên nếu sau này tính sai thì khó phát hiện sớm.
  file: `apps/app/test/hoan-tac-loat-dung-id.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: assert âm «không có toast xanh mới» dựa trên mốc đếm gồm cả toast lưu trữ đang bị sonner gỡ (data-removed, gỡ khỏi DOM sau 200 ms)**
  Người dùng thấy gì: Sản phẩm không bị ảnh hưởng. Chỉ là bài kiểm 'Hoàn tác thiếu không được hiện toast xanh' có thể báo xanh nhầm trên máy chậm, nên có thể bỏ lọt lỗi hiện toast thành công khi vẫn còn bản không về được.
  file: `apps/app/test/hoan-tac-loat-dung-id.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
