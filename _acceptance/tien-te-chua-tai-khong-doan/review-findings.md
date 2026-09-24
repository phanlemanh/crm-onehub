## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Bộ đo màn thật nuốt lỗi phân tích phản hồi, trả null cho các thủ tục cùng lô**
  Người dùng thấy gì: Khi có sự cố mạng hoặc phiên hết hạn lúc đang đo, báo cáo có thể chỉ nhầm dòng lỗi (ví dụ báo sai một thoả thuận không tồn tại) thay vì nói đúng là máy chủ không phản hồi được — không ảnh hưởng người dùng thật, chỉ gây khó khi người kiểm tra tìm nguyên nhân.
  file: `_acceptance/tien-te-chua-tai-khong-doan/rang/man-that.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — số khẳng định so với con số suy từ chính danh sách, không phải con số viết trước (soi-ma)**
  Người dùng thấy gì: Phép kiểm mã tự động cho phần này có thể không bắt được một lỗi nếu sau này ai đó thêm hoặc bớt một mục nhưng quên cập nhật đúng chỗ khác — nhưng đây là hạn chế đã biết từ hồ sơ trước, không phải lỗi mới, và không ảnh hưởng người dùng cuối.
  file: `_acceptance/tien-te-chua-tai-khong-doan/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — đếm số lần chuỗi xuất hiện thay vì kiểm quan hệ «có ở cả vi lẫn en» (soi-ma)**
  Người dùng thấy gì: Phép kiểm mã cho phần dịch có thể bỏ lọt trường hợp một chữ mới chỉ được dịch một thứ tiếng dù nằm sai chỗ trong tệp; rủi ro này hiện đã được một lớp kiểm tra khác (kiểu dữ liệu khi biên dịch) chặn lại, nên người dùng khó thấy màn hình thiếu bản dịch trên thực tế.
  file: `_acceptance/tien-te-chua-tai-khong-doan/rang/soi-ma.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 — Select viết tay theo đúng khuôn mà phép đo đọc: chữ trên ô chọn đồng tiền và «không có đồng nào đang chọn» chỉ kiểm lại bản giả**
  Người dùng thấy gì: Một trong các bài kiểm tự động dùng bản giả của ô chọn đồng tiền nên tự nó chưa chứng minh được giao diện thật hiển thị đúng chữ gợi ý, nhưng một phép đo khác trên màn hình thật đã xác nhận điều đó, nên người dùng vẫn thấy đúng chữ trên ô chọn.
  file: `apps/app/test/tien-te-chua-tai.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
