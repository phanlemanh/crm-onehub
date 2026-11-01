## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **ap-sua.mjs chèn dòng paths lên đầu tệp khi eval không có dòng executor**
  Người dùng thấy gì: Công cụ dùng một lần để áp bảng sửa có thể làm hỏng tệp nếu ai đó chạy lại với bảng khác. Chín hồ sơ hiện tại không bị ảnh hưởng.
  Căn cứ: Nhẹ: chín hồ sơ của vòng này đã đúng và đã được kiểm, công cụ này không còn dùng nữa, nếu có chạy lại thì lỗi lộ ra ngay và sửa được.
  file: `_acceptance/paths-chet-chin-ho-so/rang/ap-sua.mjs`
  severity: low
  Đề xuất: known-limits

- **so-hong.mjs bỏ qua dòng mới rỗng, nên một dòng quyết định bị xoá trắng vẫn qua thước**
  Người dùng thấy gì: Thước kiểm sổ quyết định sẽ không bắt được trường hợp một dòng bị xoá trắng. Sổ hiện tại vẫn đúng và không mất dòng nào.
  Căn cứ: Nhẹ: không có dữ liệu nào mất ở bản hiện tại, chỉ là thước kiểm yếu hơn lời hứa, và có thể siết lại sau mà không ảnh hưởng người dùng.
  file: `_acceptance/paths-chet-chin-ho-so/rang/so-hong.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
