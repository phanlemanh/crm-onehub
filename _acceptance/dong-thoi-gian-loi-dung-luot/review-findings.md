# Review findings: dong-thoi-gian-loi-dung-luot (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Error memory lives in a hand-rolled module-level mutable store that shadows the TanStack cache, rather than being derived**
  Người dùng thấy gì: Thông báo lỗi trên dòng thời gian hiện đúng như đã hứa. Chỉ có điều trình duyệt giữ thêm một ít thông tin lỗi cho mỗi bản ghi và tab đã mở trong suốt phiên làm việc, người dùng không thấy được ảnh hưởng nào.
  file: `apps/app/components/crm/timeline/timeline.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «có mặt» trong khi lời hứa là quan hệ): ô «giu-qua-doi-tab» của E3 không ghim điều kiện «không tải lại» mà evals.yaml lấy làm tiền đề**
  Người dùng thấy gì: Hiện nay quay lại tab cũ vẫn thấy lại đúng thông báo lỗi như đã hứa. Nhưng nếu sau này có thay đổi làm tab đó tự tải lại khi quay về, bài kiểm hiện tại có thể không phát hiện ra.
  file: `apps/app/test/dong-thoi-gian-loi-dung-luot.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **paths của eval thiếu tệp mà bài kiểm phụ thuộc, nên ghim lại không biết khi tệp đó đổi (r1)**
  Người dùng thấy gì: Nếu sau này ai đó sửa một tệp phụ trợ của bài kiểm, hệ thống có thể không nhắc kiểm lại. Một lỗi trên dòng thời gian khi đó có thể lọt qua trong lúc mọi bài đo vẫn báo xanh.
  file: `_acceptance/dong-thoi-gian-loi-dung-luot/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): bộ đếm MutationObserver demChen chỉ được kiểm `=== 0`, chưa ca nào cho thấy nó đếm ra lớn hơn 0, và tác giả đã phá thử thấy nó mù (r1)**
  Người dùng thấy gì: Một phép đo phụ dùng để bắt thông báo nhấp nháy sai có thể không nhận ra một số lần nhấp nháy. Người dùng vẫn được bảo vệ bởi các phép đo khác, nhưng bằng chứng «không nhấp nháy» mạnh hơn mức thật sự đo được.
  file: `apps/app/test/dong-thoi-gian-loi-dung-luot.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
