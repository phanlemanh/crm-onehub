# Review findings: thuoc-khong-tu-het-han (round 2)

## Trong hợp đồng

Không có muc nao.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **soan-okr-song-lai/E12: paths đã đổi sang khung-soan.tsx, lệnh vẫn quét man-soan.tsx, tệp không còn** (r1)
  Người dùng thấy gì: Kiểm tra thiết kế của màn Soạn OKR vẫn trỏ vào một tệp đã bị xoá. Lần kế tiếp màn này được sửa và kiểm tra chạy lại, nó sẽ báo đỏ vì thiếu tệp chứ không vì lỗi thiết kế thật, gây một lượt ghim lại không đáng có.
  file: `_acceptance/soan-okr-song-lai/evals.yaml`
  severity: low
  Đề xuất: new-contract

- **soan-okr-song-lai E12 paths now point at khung-soan.tsx, but its command still scans the deleted man-soan.tsx and crashes** (r1)
  Người dùng thấy gì: Kiểm tra thiết kế của màn Soạn OKR vẫn trỏ vào một tệp đã bị xoá. Lần kế tiếp màn này được sửa và kiểm tra chạy lại, nó sẽ báo đỏ vì thiếu tệp chứ không vì lỗi thiết kế thật, gây một lượt ghim lại không đáng có.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
