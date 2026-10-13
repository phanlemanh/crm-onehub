# Review findings: lien-quan-loc-ban-da-cat

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **DongDaLuuTru dùng className để đổi màu, cỡ và khoảng cách của Button và TableCell trong @crm/ui**
  Người dùng thấy gì: Dòng «+n đã lưu trữ» chạy đúng và trông đúng, nhưng kiểu dáng của nó được chỉnh tay tại chỗ thay vì dùng thành phần chung. Hậu quả là sau này đổi giao diện chung sẽ phải sửa thêm một chỗ nữa, người dùng chưa thấy khác biệt gì.
  file: `apps/app/components/crm/record-sheet/record-parts.tsx`
  severity: medium
  Đề xuất: new-contract

- **Dựng tay một nút liên kết mở bản ghi trong khi RecordLink đã có sẵn cùng thư mục**
  Người dùng thấy gì: Tên các bản đã lưu trữ bấm được và mở đúng ngăn, nhưng kiểu chữ và cách phản hồi khi rê chuột có thể hơi khác so với các liên kết bản ghi ở chỗ khác.
  file: `apps/app/components/crm/record-sheet/record-parts.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận viết trước thiếu phần tử): E9 bỏ mất phép đối chứng onePerson đã khai**
  Người dùng thấy gì: Hộp hỏi khi xoá vĩnh viễn công ty chưa được kiểm tự động ở trường hợp chỉ còn một người ở lại, nên nếu chữ «một người» hiển thị sai thì chưa có bài kiểm nào bắt được.
  file: `apps/app/test/lien-quan-loc-ban-da-cat.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
