# Review findings: khung-tao-okr-nhu-deal (round 1)

## Trong hợp đồng

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E13 gui-dung so payload với object viết tay, không so với payload rút từ hàm dựng của hộp cũ**
  file: `apps/app/test/khung-tao-okr.dom.tsx:305`
  severity: high
  AC: AC-8
  source: measurement
  detail: Lời hứa của E13 trong evals.yaml ghi rõ payload phải khớp «payload của cùng thao tác trên mã merge-base ghi sẵn trong bài bằng chính các hàm dựng payload của hộp cũ» và «không so với object viết tay». Bài kiểm lại làm ngược lại. Dòng 305–317 so createObjective với `kyTao` viết tay (cycleId, unit {level:'onehub'}, kind 'cam-ket', ownerUserId, participantIds [], whyNow). Dòng 328–330 so với `{ id: MT.id, title: tenMoi }`, dòng 345–358 so với một object createKeyResult viết tay (kind 'tang-toi', startValue 0, currentValue 0, unit '', dueOn null, weight 1), dòng 369–371 so với `{ id: KR_1.id, title }`. Chạy cả hai vế qua cùng schema `.parse` chỉ kiểm được hình dạng, không kiểm được giá trị: nếu hộp cũ ở merge-base gửi giá trị mặc định khác (ví dụ kind, unit, weight, participantIds, hay title đã trim), người viết tay đã chép đúng giá trị của hộp mới thì bài vẫn xanh. Không có bước rút payload từ bên ghi cũ nào, nên lời hứa «giữ nguyên dữ liệu gửi đi so với hộp cũ» chưa được đo.
  rationale: AC-8 đòi mỗi lần tạo và sửa Mục tiêu hay KR gửi cùng dữ liệu như hộp thoại cũ; bài kiểm chỉ so với object viết tay nên vế 'cùng dữ liệu như hộp cũ' của AC-8 chưa được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Quyền sửa KR mở từ URL được chép thành bản thứ ba, không dùng chung với menu KR**
  Người dùng thấy gì: Hiện người không có quyền sửa KR vẫn bị chặn đúng khi mở bằng đường dẫn. Nhưng điều kiện quyền được chép ở ba nơi, nên nếu sau này có người siết quyền ở nút menu mà quên hai nơi kia, đường dẫn trực tiếp vẫn mở được khung sửa KR.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định có mặt thay cho quan hệ): E4 hứa hai tập class bằng nhau nhưng chỉ kiểm một chiều bao hàm**
  Người dùng thấy gì: Phép đo chân ngăn chỉ chắc chắn rằng chân ngăn có đủ những gì chân hộp thoại có, chứ không bắt được việc chân ngăn có thêm thứ khác. Cách xếp nút trái phải trên màn vẫn được đo riêng, nên người dùng không thấy khác biệt nào.
  file: `_acceptance/khung-tao-okr-nhu-deal/rang/chan-ngan.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E1 hứa «khung chi tiết Mục tiêu mở với đúng id» nhưng chỉ đọc khoá record trên URL, không dựng bộ đọc khoá đó**
  Người dùng thấy gì: Bài kiểm nhanh chỉ xác nhận sau khi tạo mục tiêu, đường dẫn đã trỏ tới mục tiêu mới, chứ chưa tự xác nhận khung chi tiết hiện ra. Nếu khung không nhận ra đường dẫn đó, người dùng có thể tạo xong mà không thấy khung mở, và bài kiểm này sẽ không báo.
  file: `apps/app/test/khung-tao-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (trạng thái cuối thay cho quan hệ «cùng lần ghi»): E2 đóng khung chỉ đọc lần ghi URL cuối**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận đóng khung xong thì đường dẫn sạch, không xác nhận hai khoá bị xoá cùng một lúc. Nếu chúng bị xoá lệch nhau, người dùng có thể thấy đường dẫn nhấp nháy giữa chừng nhưng kết quả cuối vẫn đúng.
  file: `apps/app/test/khung-tao-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
