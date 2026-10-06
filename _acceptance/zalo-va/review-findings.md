# Review findings: zalo-va (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Kiểu sự kiện getMe viết tay cạnh schema Zod, và lúc ghi không chạy qua schema**
  Người dùng thấy gì: Nếu Zalo trả về một mã lỗi có dạng lạ (ví dụ số lẻ), hệ thống vẫn ghi lại bình thường. Nhưng đến ngày 10/11, bản báo cáo đếm lỗi của cả kỳ có thể báo lỗi thay vì ra số. Trường hợp này rất hiếm và không ảnh hưởng người dùng nhắn bot hay quản trị dán token.
  file: `apps/agent/agent/lib/zalo-getme.ts`
  severity: medium
  Đề xuất: known-limits

- **The "dead threshold" count also counts every per-minute kiemBot token-sai row on a truly revoked running token**
  Người dùng thấy gì: Nếu token đang lưu thật sự bị Zalo thu hồi trong kỳ đo, con số kiểm vào ngày 10/11 sẽ lớn hơn 0 và trông như quản trị bị báo token sai oan, dù token đó đúng là sai. Người đọc số cần biết điều này khi đọc, vì con số một mình chưa chứng minh có báo sai.
  file: `_acceptance/zalo-va/rang/dem-getme.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP «mọi nhãn điều hướng khác» nhưng chỉ dùng tập con chọn tay, không ghim số phần tử**
  Người dùng thấy gì: Câu chào của bot có thể đổi sai thành đường dẫn đi qua một mục khác trong menu tài khoản (như Đăng xuất) rồi mới tới Nhắc buổi sáng, mà bài kiểm tự động vẫn báo xanh. Người mới nhắn bot khi đó có thể bấm nhầm theo hướng dẫn.
  file: `apps/agent/test/zalo-va.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — đối chứng dương của phép kiểm thứ tự nhãn chạy trên bản sao vị từ, không chạy qua assert thật**
  Người dùng thấy gì: Một bài kiểm tự động có thể xanh dù phép kiểm bên trong nó đã hỏng. Người dùng cuối không bị ảnh hưởng; chỉ làm giảm độ tin cậy của bài kiểm.
  file: `apps/agent/test/zalo-va.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
