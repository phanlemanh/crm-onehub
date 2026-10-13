# Review findings: them-buoc-bao-dung (round 4)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A failed background refetch of the department list hides a working department picker while «Thêm» stays enabled**
  Người dùng thấy gì: Nếu bạn mở form Thêm bước, chọn phòng ban, rời tab một lúc rồi quay lại đúng lúc mạng lỗi, ô chọn phòng ban biến mất và hiện báo lỗi. Nút «Thêm» vẫn bấm được và bước có thể bị lưu vào một phòng ban không còn hiện trên form.
  file: `apps/app/components/crm/record-sheet/plan-steps.tsx`
  severity: medium
  Đề xuất: known-limits

- **TRAN_DONG = 10 in the screen check copies the API's inline `take: 10` instead of sharing one constant (r3 · tệp đã đổi)**
  Người dùng thấy gì: Phép đo tự động trên màn Tổng quan giữ riêng một con số giới hạn dòng, trùng với con số trong máy chủ. Nếu sau này máy chủ đổi giới hạn mà phép đo không đổi theo thì phép đo sẽ báo đỏ nhầm, người dùng thật không bị ảnh hưởng.
  file: `_acceptance/them-buoc-bao-dung/rang/man.mjs`
  severity: low
  Đề xuất: wont-fix

- **Ảnh E11 sau r2 không còn chụp được dòng bước đang đo: việc gieo thêm đẩy dòng «Bước đo ngày VN» ra khỏi phần nhìn thấy của khung thẻ (r3 · tệp đã đổi)**
  Người dùng thấy gì: Ảnh chụp màn Tổng quan đưa cho người ký duyệt không còn thấy dòng bước có dấu quá hạn, vì dòng đó nằm ngoài phần hiện ra của thẻ. Tính năng vẫn chạy đúng và phép đo tự động vẫn xác nhận được, nhưng người ký không tự nhìn thấy điều đó trên ảnh.
  file: `_acceptance/them-buoc-bao-dung/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **A second copy of the Vietnam-day rule, separate from the one the server counts with (r1)**
  Người dùng thấy gì: Quy tắc 'hôm nay là ngày nào theo giờ Việt Nam' đang được viết ở hai nơi. Hiện hai nơi cho cùng kết quả, nhưng sau này nếu ai sửa một nơi mà quên nơi kia thì số việc quá hạn trên màn hình và ở máy chủ có thể lệch nhau.
  file: `packages/validation/src/ngay-vn.ts`
  severity: low
  Đề xuất: known-limits

- **The record sheet still marks steps overdue by the browser's day, while Overview now uses the Vietnam day (r1)**
  Người dùng thấy gì: Khi mở một bản ghi, dấu 'quá hạn' của từng bước vẫn tính theo ngày của máy người xem, trong khi Tổng quan đã tính theo ngày Việt Nam. Người ở múi giờ khác, nhất là quanh nửa đêm Việt Nam, có thể thấy cùng một bước là quá hạn ở Tổng quan nhưng không quá hạn khi mở bản ghi.
  file: `apps/app/components/crm/record-sheet/plan-steps.tsx`
  severity: low
  Đề xuất: new-contract

- **Danh sách phòng ban đã tải mà lần refetch nền lỗi thì form giấu ô chọn nhưng vẫn gửi phòng ban đã chọn trước đó, nút «Thêm» không khoá (r1)**
  Người dùng thấy gì: Nếu danh sách phòng ban đã tải được rồi nhưng lần làm mới ngầm sau đó bị lỗi mạng, form hiện thông báo lỗi và ẩn ô chọn, nhưng nút 'Thêm' vẫn bấm được và vẫn lưu vào phòng ban đã chọn trước đó mà người dùng không còn thấy.
  file: `apps/app/components/crm/record-sheet/plan-steps.tsx`
  severity: low
  Đề xuất: known-limits

- **Ô them-buoc-thu-lai-xong in «khong chan them» và hứa không cuộn ngang nhưng không kiểm cả hai (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm màn hình sau khi bấm thử lại có thể báo đạt dù trang bị tràn ngang hoặc việc thêm bước bị chặn, vì hai điều đó chỉ được in ra chứ không được dùng để quyết định đạt hay không.
  file: `_acceptance/them-buoc-bao-dung/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: assert «chuỗi có mặt» toContain("1") cho mô tả thẻ, trong khi lời hứa là mô tả phải phản ánh đúng số quá hạn (r1 · tệp đã đổi)**
  Người dùng thấy gì: Dòng mô tả dưới thẻ việc ở Tổng quan có thể ghi sai số việc quá hạn mà bài kiểm vẫn không phát hiện, nên một lỗi đếm sai ở chữ này có thể lọt qua.
  file: `apps/app/test/them-buoc-bao-dung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: ma trận E10 hứa «trang không cuộn ngang» ở mọi trạng thái, nhưng ô thử-lại-xong không kiểm (r1 · tệp đã đổi)**
  Người dùng thấy gì: Sau khi bấm thử lại và tải thành công, phép kiểm màn hình không xem trang có bị tràn ngang trên màn điện thoại hay không, nên lỗi bố cục kiểu này ở trạng thái đó có thể lọt qua.
  file: `_acceptance/them-buoc-bao-dung/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
