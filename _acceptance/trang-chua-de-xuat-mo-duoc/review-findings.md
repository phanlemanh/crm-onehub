# Review findings: trang-chua-de-xuat-mo-duoc (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Shape 4 (negative-only assertion): the 'lo ten tep' check cannot fail because the fixture never supplies the file name**
  Người dùng thấy gì: Người không được thấy nguồn vẫn không thấy tên tệp nguồn trên màn đọc; đây chỉ là một câu kiểm phụ trong bài thử tự động chưa có tác dụng thật, không ảnh hưởng gì tới người dùng. Chấp nhận và ghi vết, không mở việc riêng.
  file: `apps/app/test/tai-lieu-trang-cho.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Two different rules for who may write by hand: the edit page lets a page open while the composer is drafting, but the reading screen hides the button (r1)**
  Người dùng thấy gì: Nếu ai đó gõ thẳng đường dẫn sửa của một trang mà máy đang soạn, họ vẫn mở được trình soạn trống và có thể gửi một bản viết tay song song với bản máy sắp soạn, khiến trang có hai bản đề xuất đầu tiên cạnh tranh nhau. Đi bằng nút trên màn đọc thì không gặp.
  file: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/sua/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **A returned hand-written first version still shows as 'go-tay'/'loi', so the page never says it was returned (r1)**
  Người dùng thấy gì: Khi người viết tay bị chủ trang trả lại bản đầu, màn đọc có thể quay về lời cũ như Cần gõ tay hoặc Máy chưa soạn được, thay vì báo bản của họ đã bị trả lại. Người viết có thể không biết vì sao mình phải làm lại.
  file: `apps/api/src/tai-lieu/tai-lieu.service.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
