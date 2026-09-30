# Review findings — dot-hoi-y-tuong-okr (round 4)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New objective reads skip the visibility rule and turn the repo's own visibility check red**
  Người dùng thấy gì: Phép kiểm quyền xem mục tiêu của kho sẽ báo đỏ sau khi gộp. Việc đếm mục tiêu khi công bố có thể tính cả mục tiêu bị giới hạn xem mà chưa ghi rõ lý do, và cần một việc riêng để khai hoặc sửa.
  file: `apps/api/src/okr/okr-hoi-y.service.ts`
  severity: high
  Đề xuất: new-contract

- **Publish gate reads ketLuan and noiBanTruoc as raw strings; the rest of the service parses them**
  Người dùng thấy gì: Nếu dữ liệu lưu của một chủ đề bị hỏng hoặc sai giá trị, việc công bố vẫn có thể đi tiếp trong khi màn xem lần hỏi ý lại báo lỗi. Với dữ liệu nhập qua màn hình hiện tại thì không gặp.
  file: `apps/api/src/okr/hoi-y.ts`
  severity: medium
  Đề xuất: known-limits

- **The screen's time config redefines the minute locally instead of deriving from a shared base**
  Người dùng thấy gì: Đơn vị phút và múi giờ của màn Hỏi ý được khai riêng, không dùng chung với phần OKR còn lại. Nếu sau này đổi một chỗ mà quên chỗ kia, giờ hiển thị trên màn Hỏi ý có thể lệch.
  file: `apps/app/app/(app)/[slug]/okr/hoi-y/man-hoi-y.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình): ca «gỡ khỏi cây thì bấm không cuộn nữa» không thể đỏ**
  Người dùng thấy gì: Bài kiểm tra kiểm việc gỡ mục lục khỏi trang không thể báo đỏ. Nếu sau này mục lục quên dọn sự kiện khi bị gỡ, bài kiểm tra vẫn xanh và lỗi có thể lọt.
  file: `packages/ui/test/scrollspy.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): bảng ca soLieuHoiY chỉ so cờ success, không so đường dẫn lỗi**
  Người dùng thấy gì: Bài kiểm tra giới hạn các con số trong lần hỏi ý chỉ xác nhận là bị từ chối, không xác nhận từ chối vì lý do nào. Nếu quy tắc bị sửa nhầm, bài kiểm tra vẫn có thể xanh.
  file: `packages/validation/test/okr-hoi-y.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
