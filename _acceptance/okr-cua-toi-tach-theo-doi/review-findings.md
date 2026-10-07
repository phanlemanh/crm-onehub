# Review findings: okr-cua-toi-tach-theo-doi (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Shape 5 (claims to sweep a class without a fixed matrix): E15 checks the number of pairs run against a count derived from the same table, not against the 8 declared up front (r1)**
  Người dùng thấy gì: Bộ tự phá thử để kiểm tra các phép kiểm có thể lặng lẽ bớt đi một ca mà vẫn báo xanh. Người dùng không thấy gì khác đi, chỉ là về sau khó phát hiện nếu ai đó vô tình xoá bớt một ca phá thử.
  file: `_acceptance/okr-cua-toi-tach-theo-doi/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).