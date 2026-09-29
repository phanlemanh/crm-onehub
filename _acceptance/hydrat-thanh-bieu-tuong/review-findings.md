# Review findings: hydrat-thanh-bieu-tuong (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The test's fake workspace.get data has only 3 of the real response's fields, which AGENTS.md forbids for fixtures**
  Người dùng thấy gì: Bài kiểm tra dùng dữ liệu workspace giả thiếu vài trường so với dữ liệu thật. Người dùng không bị ảnh hưởng gì; rủi ro chỉ là sau này nếu thanh bên trái đọc thêm một trường mới thì bài kiểm tra này sẽ không báo lỗi khi đáng ra phải báo.
  file: `apps/app/test/thanh-bieu-tuong-hydrat.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 — nói là phủ cả lớp nhưng chỉ có vài ca lẻ: tên describe và contract hứa «mọi ô A×B», test chỉ phủ 3 ô**
  Người dùng thấy gì: Các bài kiểm tra chỉ thử một số tổ hợp cụ thể của thanh bên trái (ví dụ vai admin hay vai okr, dữ liệu có hoặc chưa có), chưa thử hết mọi tổ hợp. Các tổ hợp còn lại được cho là cùng kết quả nhưng chưa có bài kiểm tra riêng chứng minh, nên một thay đổi sau này có thể làm hỏng một tổ hợp mà không ai hay.
  file: `apps/app/test/thanh-bieu-tuong-hydrat.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm tính đứng một mình: «loi hydrat cua thanh: 0» ở E6u không có đối chứng dương trong cùng lượt chạy**
  Người dùng thấy gì: Phép đo trên ứng dụng thật báo không có lỗi nào ở thanh bên trái, nhưng mỗi lần chạy nó không tự chứng minh rằng công cụ bắt lỗi còn hoạt động. Nếu công cụ đó hỏng lặng lẽ, kết quả vẫn hiện xanh và có thể che một lỗi thật cho người dùng.
  file: `_acceptance/hydrat-thanh-bieu-tuong/rang/man-thanh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: test tự chép phép ánh xạ prop của layout.tsx thay vì đi qua bên viết thật**
  Người dùng thấy gì: Các bài kiểm tra nhanh tự dựng lại cách trang truyền vai xuống thanh bên trái thay vì chạy qua trang thật, nên nếu ai đó sửa cách truyền vai ở trang thì các bài này vẫn xanh. Lỗi kiểu đó chỉ được phát hiện ở phép đo trên ứng dụng thật, không phải ở các bài kiểm tra nhanh.
  file: `apps/app/test/thanh-bieu-tuong-hydrat.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
