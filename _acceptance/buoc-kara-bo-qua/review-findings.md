# Review findings: buoc-kara-bo-qua (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The bo-qua-dung-cho check never sees the 'No picture found' return in runPortrait, so a wrong skipped there would still pass**
  Người dùng thấy gì: Hôm nay Kara vẫn báo đúng «Chưa lưu được» khi không tìm thấy ảnh. Chỉ là phép kiểm tự động chưa canh được trường hợp này, nên nếu sau này ai lỡ gắn nhầm nhãn «Đã bỏ qua» cho nó thì có thể không bị phát hiện ngay.
  file: `_acceptance/buoc-kara-bo-qua/rang/bo-qua-dung-cho.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 5, quét LỚP mà thiếu phần tử: bo-qua-dung-cho.mjs âm thầm bỏ sót khối «No picture found» và không ghim tổng số khối**
  Người dùng thấy gì: Người dùng hiện vẫn thấy cảnh báo «Chưa lưu được» đúng khi Kara không tìm được ảnh. Rủi ro nằm ở sau này: nếu ca này bị gắn nhầm thành «Đã bỏ qua» thì phép kiểm vẫn báo xanh, và việc hỏng thật sẽ hiện như một bước trung tính.
  file: `_acceptance/buoc-kara-bo-qua/rang/bo-qua-dung-cho.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình 4, phủ định đứng một mình cho ca bỏ qua: E5 hứa «có icon xong» nhưng test chỉ assert vắng icon cảnh báo**
  Người dùng thấy gì: Khi Kara bỏ qua một việc, khung tạo tác nhân không hiện dấu cảnh báo, đúng như đã hứa. Chưa có phép kiểm nào xác nhận bước đó hiện dấu «xong», nhưng chi phí nhỏ và không ảnh hưởng điều người dùng cần thấy.
  file: `apps/app/test/buoc-kara-bo-qua.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
