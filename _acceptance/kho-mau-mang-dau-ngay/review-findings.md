# Review findings: kho-mau-mang-dau-ngay (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A test helper reads the pg error code with an ad hoc cast instead of narrowing it properly**
  Người dùng thấy gì: Chỉ là cách viết trong bài kiểm, không ảnh hưởng người dùng. Nếu có sai thì nhiều nhất là một ca kiểm báo đỏ nhầm, người chạy sẽ thấy ngay và chạy lại.
  file: `packages/db/test/measure-database.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (khẳng định có mặt thay cho quan hệ): giờ tạo của dấu building chỉ bị chặn một phía, còn E3 lấy đồng hồ quét từ chính giá trị đó**
  Người dùng thấy gì: Bài kiểm chưa chắc bắt được nếu sau này có người sửa nhầm khiến kho mẫu của lượt bị ngắt giữa chừng sống 24 giờ thay vì 12 giờ. Hiện tại hành vi đang đúng, rủi ro chỉ là kho rác nằm lâu hơn dự kiến mà không ai được báo.
  file: `packages/db/test/measure-database.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3/4 (quan hệ bị suy biến khi thiếu tiền đề): `killed?.createdAt ?? 0` ở giet-dung-lai, `mark?.createdAt ?? startedAt` ở giet-quet-gom**
  Người dùng thấy gì: Một vài ca kiểm có thể xanh dù kho bị ngắt giữa chừng không mang đúng dấu đang dựng, nhưng ca kiểm khác đã canh đúng điều đó. Người dùng không bị ảnh hưởng, chỉ là lớp bảo vệ ở đó mỏng hơn vẻ ngoài.
  file: `packages/db/test/measure-database.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
