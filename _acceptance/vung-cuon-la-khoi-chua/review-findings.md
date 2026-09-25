## Trong hợp đồng

(rỗng — không có phát hiện nào ánh xạ được vào AC của contract trong vòng này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The control-check (doi chung) output does not match what E2/E4/E6 promise, and half of the E2 control is never checked**
  Người dùng thấy gì: Dòng báo cáo đối chứng có thể ghi là đã kiểm đủ trong khi thực ra mới kiểm một nửa, để làm người đọc hiểu nhầm mức độ chắc chắn của kết quả.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: medium
  Đề xuất: known-limits

- **AC-6 and AC-7 have no empty-set guard, so a DUNG line can pass with nothing checked**
  Người dùng thấy gì: Nếu ngẫu nhiên không còn phần tử nào để kiểm, kết quả vẫn có thể báo "đạt" dù chưa thực sự kiểm được gì, khiến người xem tưởng tính năng đã được xác nhận.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: low
  Đề xuất: known-limits

- **AC-6 has no check that the set it examines is non-empty, so it can print DUNG on an empty set**
  Người dùng thấy gì: Nếu tập phần tử cần kiểm bất ngờ rỗng, kết quả vẫn có thể hiện "đạt" mà không thực sự đo được gì, gây hiểu nhầm về mức độ đã xác nhận.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: low
  Đề xuất: known-limits

- **AC-2 control check tests only the 'static' half; it never checks the probe's offsetParent is main after restoring**
  Người dùng thấy gì: Dòng báo đối chứng có thể tự nhận là đã xác minh xong dù chỉ mới thử một nửa, dễ gây hiểu lầm về độ tin cậy của bằng chứng kèm theo.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion on its own): AC-6 passes vacuously when the set it checks is empty, although E6 requires j >= 21**
  Người dùng thấy gì: Nếu về sau không còn phần tử nào rơi vào trường hợp cần kiểm, kết quả vẫn có thể báo "đạt" mà không hề đo được gì, khiến báo cáo trông đáng tin hơn thực tế.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (presence checked where the promise is a relation): pinned pages are checked only for 'not do', never against their pinned label**
  Người dùng thấy gì: Các trang được xếp vào nhóm đặc biệt (chuyển hướng, không hiện khung...) hiện chỉ được kiểm là "không bị lỗi hiển thị", chưa kiểm đã đúng đúng nơi hay đúng kiểu như kỳ vọng, nên một trang chuyển nhầm hướng vẫn có thể được báo là ổn.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims to sweep a class but has no matrix written in advance): AC-1's count 'nhan = tep x 3' is a tautology**
  Người dùng thấy gì: Số liệu "đã đo đủ trang" hiện chỉ tự đối chiếu với chính nó nên luôn đúng, không thực sự chứng minh đã quét đủ; tài liệu cũng ghi một con số trang khác với thực tế nên khó biết chắc đã đo hết chưa.
  file: `_acceptance/vung-cuon-la-khoi-chua/rang/do-khung.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).