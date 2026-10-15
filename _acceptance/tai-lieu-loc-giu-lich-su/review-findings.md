# Review findings: tai-lieu-loc-giu-lich-su (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 — AC-2 hứa cho cả lớp «đổi một bộ lọc», nhưng ma trận vẫn 4 ô và bản sửa vòng này chỉ thêm hai ca lẻ**
  Người dùng thấy gì: Khi lọc tài liệu theo đơn vị hoặc chủ trang, thanh lọc vẫn nên giữ nguyên và báo đang tải, nhưng chưa có bài kiểm tự động canh hai thao tác này. Nếu sau này ai đó làm hỏng, thanh lọc có thể chớp hoặc mất vị trí con trỏ mà không ai hay ngay.
  file: `apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét lớp (màn × thao tác) cho AC-1 nhưng ma trận 7 ô thiếu ô Chờ duyệt × sang trang (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi sang trang ở màn Chờ duyệt, chưa có bài kiểm tự động nào xác nhận mỗi lần sang trang để lại một mục lịch sử riêng. Nếu có lỗi ở đó, nút lùi của trình duyệt có thể không về đúng trang trước mà không ai phát hiện sớm.
  file: `apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
