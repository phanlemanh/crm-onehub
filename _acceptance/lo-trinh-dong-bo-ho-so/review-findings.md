# Review findings: lo-trinh-dong-bo-ho-so (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The days-left / days-late note in the Milestone cell gets cut off with no ellipsis on tablet and small-laptop widths**
  Người dùng thấy gì: Trên máy tính bảng hoặc laptop màn nhỏ, ô Mốc trong ngăn chi tiết có thể giấu mất dòng «còn n ngày» hoặc «Trễ n ngày» mà không báo gì. Đây lại đúng thông tin quản lý mở ngăn để xem, nên dễ bị hiểu nhầm là việc chưa trễ.
  file: `apps/app/components/lo-trinh/ho-so-viec.tsx`
  severity: medium
  Đề xuất: new-contract

- **Empty Mốc value restyled by hand instead of the existing empty-value pattern**
  Người dùng thấy gì: Khi một việc chưa hẹn mốc, chữ «Chưa hẹn mốc» trong ngăn chi tiết hiện mỏng hơn một chút so với cách các ngăn Thoả thuận, Công ty, Liên hệ hiện ô trống. Chỉ lệch về độ đậm chữ, không làm mất thông tin.
  file: `apps/app/components/lo-trinh/ho-so-viec.tsx`
  severity: low
  Đề xuất: known-limits

- **Board card alignment patched at the call site, not in packages/ui**
  Người dùng thấy gì: Thẻ việc trong cách xem Bảng cột hiển thị đúng, chữ căn theo đầu dòng. Cách sửa chỉ mới áp riêng cho trang Lộ trình, nên nơi khác dùng chung bảng cột sau này có thể phải sửa lại.
  file: `apps/app/components/lo-trinh/bang-cot.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (không đối chứng dương): bước so kiểu chữ của E2 bỏ qua cả nhóm khi phía thoả thuận thiếu phần tử**
  Người dùng thấy gì: Phép kiểm tra so ngăn Lộ trình với ngăn Thoả thuận có thể bỏ qua một vài chi tiết chữ (cỡ chữ tiêu đề, nhãn ô) nếu ngăn Thoả thuận thiếu mất thành phần đó. Khi đó nó vẫn báo là giống nhau dù chưa so thật.
  file: `_acceptance/lo-trinh-dong-bo-ho-so/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (đo một giá trị trong khi lời hứa là quan hệ): E5 không đo dòng phụ, chỉ đo câu giao so với mép thẻ**
  Người dùng thấy gì: Phép kiểm tra thẻ trong Bảng cột chỉ xác nhận câu giao căn trái, chưa kiểm dòng chữ phụ bên dưới. Nếu dòng phụ tự căn giữa thì phép kiểm tra vẫn báo đạt.
  file: `_acceptance/lo-trinh-dong-bo-ho-so/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
