# Review findings: ngan-ho-so-trong-lo-trinh

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The summary and numbers components write their own copy of the shape the Zod schema already defines**
  Người dùng thấy gì: Hôm nay thẻ «Số liệu» và phần tóm tắt vẫn hiện đúng. Nhưng nếu bộ kit sau này thêm một con số mới cho chủ kho, thẻ «Số liệu» có thể lặng lẽ không hiện con số đó và không ai được báo.
  file: `apps/app/components/lo-trinh/so-lieu-lam-viec.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): «sai kiểu — trang không có [data-o-tom-tat]» luôn đúng vì trang không bao giờ mở ngăn**
  Người dùng thấy gì: Khi dữ liệu lộ trình có một ô sai kiểu, bài kiểm hiện tại sẽ vẫn báo xanh dù trang có nuốt lỗi và hiện ô trống thay vì báo «dữ liệu lộ trình hỏng». Người dùng có thể thấy ngăn trống mà không biết dữ liệu đang hỏng.
  file: `apps/app/test/ngan-ho-so.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng không thật): chiều đỏ «bản sao giữ cảnh báo của bản 1» chỉ tự đưa true vào hàm**
  Người dùng thấy gì: Nếu sau này trang lại hiện băng cảnh báo cả trang với tệp lộ trình cũ (bản 1), bài kiểm có thể không bắt được. Người dùng sẽ thấy một cảnh báo «thiếu dữ liệu» không đúng trên trang vốn không thiếu gì.
  file: `apps/app/test/ngan-ho-so.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (thông điệp ghim không gắn với nguyên nhân): «vai member lọt chu_kho qua props» được in cho mọi lần khuôn props hỏng**
  Người dùng thấy gì: Khi bài kiểm quyền xem báo đỏ, dòng báo có thể nói «dữ liệu chủ kho bị lộ» trong khi thực tế chỉ là truyền thừa một thông số. Người sửa có thể mất thời gian đi tìm sai chỗ; người dùng cuối không bị ảnh hưởng.
  file: `apps/app/test/ngan-ho-so-vai.dom.tsx`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 5 (ma trận không viết trước): số đếm của o-vang tự so với chính nó**
  Người dùng thấy gì: Nếu một lần sửa sau này làm mất bớt các hàng «—» ở những việc có ô vắng, bài kiểm vẫn có thể xanh. Người dùng sẽ thấy ngăn thiếu hàng mà không có gì báo trước.
  file: `apps/app/test/ngan-ho-so.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ bắt một vài dạng): máy quét chữ viết thẳng bỏ sót chuỗi trong {…}**
  Người dùng thấy gì: Một nhãn bị viết thẳng bằng một kiểu khác thường sẽ không bị chặn khi kiểm tra. Nhãn đó chỉ hiện bằng một ngôn ngữ, người đọc bản tiếng Anh hoặc tiếng Việt còn lại có thể thấy chữ lệch ngôn ngữ.
  file: `_acceptance/ngan-ho-so-trong-lo-trinh/rang/chu-viet-thang.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): kiểm thứ tự «tóm tắt đứng trước chi tiết / cần trước / đang chờ» đúng suông khi không có phần đứng sau**
  Người dùng thấy gì: Nếu một lần sửa sau này đẩy «Tóm tắt hồ sơ» xuống sau «Chi tiết» hoặc hai danh sách việc liên quan, bài kiểm có thể không báo đỏ. Người dùng sẽ phải kéo xuống mới thấy tóm tắt.
  file: `apps/app/test/ngan-ho-so.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
