# Review findings: thuoc-mot-cho-khai-quet-man (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **K2b's signed E7 now depends on chung.mjs, but its paths do not list chung.mjs, so the stale-evidence check cannot see changes there**
  Người dùng thấy gì: Nếu sau này ai đó làm hỏng cách thước kiểm tra quét thư mục soạn OKR, bằng chứng đã ký của vòng trước vẫn được coi là còn mới và không bị báo cũ. Chỉ khi mở lại vòng trước và ghim lại thì lỗ hổng này mới được vá.
  file: `_acceptance/soan-okr-khong-lac/rang/mot-nguon.mjs`
  severity: medium
  Đề xuất: known-limits

- **do.mjs reports infrastructure failures as SAI (exit 1) instead of KHONG DO DUOC (exit 2)**
  Người dùng thấy gì: Khi máy đo thiếu thứ nó cần (ví dụ chưa cài đủ phụ thuộc hay thiếu lịch sử git), bộ đo có thể báo là thước sai thay vì báo là không đo được. Người duyệt có thể tưởng tính năng hỏng trong khi thật ra chỉ là môi trường chưa sẵn sàng.
  file: `_acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs`
  severity: low
  Đề xuất: known-limits

- **do.mjs copies helpers that chung.mjs already exports, and the root paths are written in several places**
  Người dùng thấy gì: Một số đoạn mã phụ của bộ đo bị chép lại thay vì dùng chung, và vài đường dẫn được viết ở hơn một nơi. Người dùng cuối không thấy gì, chỉ làm việc bảo trì sau này hơi phiền khi phải sửa nhiều chỗ.
  file: `_acceptance/thuoc-mot-cho-khai-quet-man/rang/do.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
