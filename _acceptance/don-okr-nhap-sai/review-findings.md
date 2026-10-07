# Review findings: don-okr-nhap-sai (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bài dung-lai không kiểm câu trả lời khi tắt lại bước duyệt, nên tắt hỏng sẽ không ai thấy**
  Người dùng thấy gì: Không ảnh hưởng người dùng sản phẩm. Chỉ có một bài kiểm tự động bật bước duyệt công bố rồi tắt lại mà không xác nhận việc tắt có thành công. Nếu việc tắt hỏng, các bài kiểm chạy sau sẽ chạy trên thiết lập sai mà không ai được báo, nên kết quả kiểm có thể sai lặng lẽ.
  file: `apps/api/test/okr-xoa-muc-tieu.spec.ts`
  severity: low
  Đề xuất: known-limits

- **(r1) Shape 3 (asserts presence while the promise is a relation): the E7 order relation is lost because the ids are sorted**
  Người dùng thấy gì: Danh sách «Đã bỏ» có thể hiện các mục tiêu theo thứ tự khác với danh sách chính mà không có kiểm tra nào phát hiện. Người dùng vẫn thấy đủ và đúng các mục tiêu đã bỏ, chỉ có thể bị xếp lộn thứ tự.
  file: `apps/api/test/okr-xoa-muc-tieu.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **(r1) Shape 4 (negative assertion alone, no positive control): 'restricted R is not in daBo' has no viewer who should see R**
  Người dùng thấy gì: Chưa có kiểm tra nào xác nhận người được phép xem một mục tiêu hạn chế thì vẫn thấy nó trong mục «Đã bỏ». Nếu có lỗi làm mục tiêu hạn chế biến mất với cả người có quyền, hiện chưa có phép đo nào bắt được.
  file: `apps/api/test/okr-xoa-muc-tieu.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **(r1) Shape 3 (asserts presence while the promise is a relation): the wait-for-lock check in dong-thoi counts any Lock wait in the DB, not the xoa request waiting on T1**
  Người dùng thấy gì: Kiểm tra «lời xoá có chờ» có thể nhận nhầm một lần chờ khác trên cùng cơ sở dữ liệu thử. Kết quả cuối cùng (xoá bị từ chối, dữ liệu còn nguyên) vẫn được kiểm đúng, nên người dùng không bị ảnh hưởng.
  file: `apps/api/test/okr-xoa-muc-tieu.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
