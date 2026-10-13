# Review findings: dai-luu-tru-dung-chung (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **mot-noi.mjs --chieu-do không kiểm mã thoát của git: merge-base hỏng thì lặng lẽ đọc bản index và in «dat»**
  Người dùng thấy gì: Khi máy kiểm thiếu thông tin lịch sử git, một công cụ kiểm nội bộ có thể ghi «đạt» thay vì báo không đo được. Người dùng cuối không bị ảnh hưởng và kết quả nghiệm thu vẫn đúng, chỉ là người đọc nhật ký kiểm sẽ khó đoán nguyên nhân.
  file: `_acceptance/dai-luu-tru-dung-chung/rang/mot-noi.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
