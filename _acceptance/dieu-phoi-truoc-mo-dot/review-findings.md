# Review findings: dieu-phoi-truoc-mo-dot

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **kiemTraLoi rewrites the unknown-key check instead of using the existing kiemKhoaLa helper (r1)**
  Người dùng thấy gì: Người dùng không thấy gì sai: tệp trả lời có khoá lạ vẫn bị cách ly và báo lý do như hứa. Chỉ có rủi ro nhỏ là sau này ai đó sửa câu báo lỗi ở một nơi mà quên nơi kia, nên hai thông báo có thể lệch nhau.
  file: `scripts/dieu-phoi/hinh-dang.mjs`
  severity: low
  Đề xuất: wont-fix
- **Hình dạng 3/5 (lời hứa là quan hệ nhưng chỉ đo ở một điểm suy biến): 'mã thoát trùng khớp' của dòng lệnh bọc chỉ đo khi mã thoát là 0 (r1)**
  Người dùng thấy gì: Khi thợ chạy một lệnh bị bọc mà lệnh đó báo lỗi, chưa có phép đo nào chứng minh lỗi ấy được báo ngược lại đúng; cách bọc hiện tại vẫn chạy đúng với lệnh thành công và có thể che lỗi nếu sau này bị sửa sai.
  file: `scripts/dieu-phoi/test/hook-chan-s4.test.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
