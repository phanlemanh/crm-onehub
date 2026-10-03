# Review findings — muc-tieu-va-kr (round 7)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **NhipGon hand-copies PaceIndicator from @crm/ui in the app**
  Người dùng thấy gì: Ô tiến độ gọn trên điện thoại tự vẽ lại dấu nhịp thay vì dùng thành phần chung. Hôm nay hiển thị đúng; nhưng nếu sau này nhãn hay màu nhịp đổi ở chỗ chung thì bản điện thoại có thể lệch âm thầm.
  file: `apps/app/app/(app)/[slug]/okr/tien-do-kr.tsx`
  severity: medium
  Đề xuất: known-limits

- **KR title inside the 'Góp vào' line is user data but is not marked translate="no"**
  Người dùng thấy gì: Trong dòng «Góp vào» của khung chi tiết mục tiêu, tên KR do người dùng nhập vẫn có thể bị trình duyệt tự dịch sang ngôn ngữ khác, làm tên hiển thị không còn đúng như người nhập.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **Responsive breakpoint and column widths are declared in two files that must stay in sync**
  Người dùng thấy gì: Độ rộng các cột và điểm đổi bố cục giữa máy tính và điện thoại được khai ở hai nơi. Hiện đang khớp nhau; nếu chỉ sửa một nơi sau này, cột ở danh sách và ở khung chi tiết có thể lệch nhau.
  file: `apps/app/app/(app)/[slug]/okr/khoi-muc-tieu.tsx`
  severity: low
  Đề xuất: wont-fix

- **ho-so-cham.mjs: uncaught git/JSON errors exit 1, the same code as a regression or a passing red path, and skip ket()**
  Người dùng thấy gì: Công cụ kiểm tra hồi quy có thể báo nhầm là đã kiểm xong ở chiều đỏ khi máy gặp sự cố môi trường, và để lại thư mục tạm. Người dùng sản phẩm không bị ảnh hưởng; chỉ làm kết quả nghiệm thu kém tin cậy khi môi trường hỏng.
  file: `_acceptance/muc-tieu-va-kr/rang/ho-so-cham.mjs`
  severity: medium
  Đề xuất: known-limits

- **man-mtkr.mjs: puppeteer.launch failure sits outside try/catch and exits 1, the red-path success code**
  Người dùng thấy gì: Nếu máy kiểm tra không mở được trình duyệt, công cụ đo màn có thể báo như thể đã chứng minh được một lỗi đỏ thay vì báo là không đo được. Sản phẩm không bị ảnh hưởng.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 3 (quan he do bang chuoi tu so voi chinh no): hai chot dem cua E14 khong bao gio do duoc**
  Người dùng thấy gì: Phép kiểm tra hồi quy các hồ sơ cũ có hai chốt tự kiểm số lượng không bao giờ bắt được lỗi. Nếu sau này sót hay bỏ qua một số kiểm tra, công cụ vẫn báo bình thường.
  file: `_acceptance/muc-tieu-va-kr/rang/ho-so-cham.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 4 (khang dinh am mot minh): 'khong table-container nao cuon doc/ngang' trong E13 qua ca khi khong do duoc container nao, va 'bang cuon doc' khong co chieu do**
  Người dùng thấy gì: Phép kiểm tra bảng có cuộn trên điện thoại có thể báo đạt ngay cả khi không tìm thấy bảng nào để đo. Bố cục điện thoại của sản phẩm không bị sai vì lý do này.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 5 (tuyen quet lop nhung chi co diem-case): ST-mtkr-kr-may va ST-mtkr-kr-moc ghi 'moi man' nhung ca kiem chi dung mot hai man**
  Người dùng thấy gì: Bài kiểm tra tự động cho dòng KR nguồn máy và KR mốc chỉ chạy trên một hoặc hai màn dù được khai là áp dụng mọi màn, nên một lỗi chỉ xảy ra ở màn «Theo đơn vị» có thể lọt qua mà bài kiểm tra vẫn xanh.
  file: `apps/app/test/muc-tieu-va-kr.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
