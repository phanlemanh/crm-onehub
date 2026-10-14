# Review findings: moi-tin-hieu-cho-quan-tri (round 1)

## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Three counts are computed once on the server, but the table below them refetches live, so they drift apart**
  Người dùng thấy gì: Khi quản trị đang xem thẻ Tất cả rồi gửi thêm một tín hiệu từ nút trên đầu trang, bảng sẽ có thêm dòng mới nhưng ba ô số vẫn giữ số cũ cho đến khi tải lại trang.
  file: `apps/app/app/(app)/[slug]/tin-hieu/tat-ca/tat-ca-trang.tsx`
  severity: medium
  Đề xuất: known-limits

- **The table's own copy of the fallback status rule ignores theoCrm, which this diff exports**
  Người dùng thấy gì: Hiện chưa người dùng nào thấy sai. Nhưng nếu sau này đổi chữ của trạng thái «chờ lấy về» hay «chờ gom» ở một nơi mà quên nơi kia, bộ lọc và bảng có thể hiện hai chữ khác nhau cho cùng một trạng thái.
  file: `apps/app/lib/tin-hieu/loc-tat-ca.ts`
  severity: low
  Đề xuất: wont-fix

- **Row shape typed by hand instead of from the tRPC output type**
  Người dùng thấy gì: Người dùng không thấy gì khác. Nếu sau này thêm hay đổi cột của một tín hiệu thì có thể quên cập nhật chỗ khai báo thứ hai, và bảng sẽ thiếu hoặc lệch cột.
  file: `apps/app/lib/tin-hieu/loc-tat-ca.ts`
  severity: low
  Đề xuất: wont-fix

- **If seeding fails partway, the sample data is never cleaned up**
  Người dùng thấy gì: Nếu phép đo màn thật bị hỏng giữa chừng khi tạo dữ liệu mẫu, các phòng ban, người dùng và tín hiệu mẫu đã tạo sẽ ở lại trong cơ sở dữ liệu và có thể lẫn vào số liệu lần đo sau hoặc kho dùng chung.
  file: `_acceptance/moi-tin-hieu-cho-quan-tri/rang/sinh-mau.mjs`
  severity: low
  Đề xuất: known-limits

- **Cleanup failure is swallowed silently after a measurement run**
  Người dùng thấy gì: Sau một lần đo màn, nếu việc dọn dữ liệu mẫu thất bại thì phép đo vẫn báo kết quả bình thường mà không cảnh báo, nên dữ liệu thừa có thể làm lệch lần đo kế tiếp mà không ai biết.
  file: `_acceptance/moi-tin-hieu-cho-quan-tri/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (asserts a string is present when the promise is equality to a value): the value in the second stat card is never pinned**
  Người dùng thấy gì: Bài kiểm tự động có thể không bắt được lỗi nếu ô «Phòng ban có tín hiệu» hiện sai số, nên màn hình đúng hay sai ở chỗ này chưa được máy xác nhận chắc chắn.
  file: `apps/app/test/tin-hieu-tat-ca.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-built input that matches what the reader expects, with no round trip through the real writer): «the three numbers do not change with the filter» is an echo of the test's own input**
  Người dùng thấy gì: Nếu sau này ai đó làm ba ô số đổi theo bộ lọc, bài kiểm tự động hiện tại sẽ không báo đỏ, nên lỗi đó có thể lọt qua.
  file: `apps/app/test/tin-hieu-tat-ca.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion with no positive control): «no horizontal scroll at 375» reads a surface that cannot overflow**
  Người dùng thấy gì: Phép đo màn điện thoại có thể báo «không cuộn ngang» ngay cả khi bảng thực sự bị tràn và phải kéo ngang, nên chưa chắc chắn rằng màn nhỏ đọc được người gửi và trạng thái.
  file: `_acceptance/moi-tin-hieu-cho-quan-tri/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
