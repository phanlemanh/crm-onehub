## Trong hợp đồng

Không còn mục nào. Sáu phép đo rỗng mà hai lượt chấm vòng 1 bắt được đều đã sửa,
và lỗi Esc mà phiên thiết kế tìm ra cũng đã vá cùng tiêu chí AC-20.

## Ngoài hợp đồng — người quyết ở Gate 2

Các mục dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi — người quyết, máy
không sửa và không chấm thứ máy không được sửa.

- **Hàng ba thẻ không cuộn ngang được, nó vừa khung nhờ may chứ không nhờ thiết kế**
  Người dùng thấy gì: hôm nay ở khổ điện thoại ba thẻ vẫn thấy đủ. Ngày nhãn dài hơn hoặc thêm một thực thể thứ tư, thẻ cuối rơi ra ngoài mà không có đường cuộn để với tới.
  file: `packages/ui/src/components/tabs.tsx`
  severity: medium
  Đề xuất: mở hợp đồng mới

- **Skill chuẩn giao diện mà kho khai là bộ soi lấy luật từ mạng, không phải từ vựng token**
  Người dùng thấy gì: không thấy gì trực tiếp. Hệ quả là mọi phiên thiết kế sau này chạy trên token đọc từ mã chứ không trên một bản luật đã khai, nên hai phiên khác nhau có thể rút ra hai chuẩn khác nhau.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: mở hợp đồng mới

- **Trang chỉ được soi ở một chủ đề màu**
  Người dùng thấy gì: bản sáng của trang Trường chưa ai nhìn. Nếu nó lệch, người dùng chủ đề sáng là người phát hiện.
  file: `apps/app/app/(app)/[slug]/settings/fields/fields-settings.tsx`
  severity: low
  Đề xuất: ghi Known limits

## Đã xử ở vòng này, giữ lại làm sử liệu

Ba mục ngoài hợp đồng của vòng chấm 1 đã được người ký quyết lối «nâng phạm vi
sửa ngay» ngày 2026-09-18, mỗi mục thành một tiêu chí có thước:

- Lựa chọn dùng đúng cụm từ điển liệt vào danh sách cần tránh → AC-17, thước E19.
  Thước đó đọc danh sách trực tiếp từ từ điển và bắt thêm một chỗ nữa: lựa chọn
  «Trợ lý» trùng cụm tránh ở mục Tác nhân.
- Chữ «Phân khúc» dùng lại cho một nghĩa khác nghĩa đã có mục → AC-18, thước E20.
- Trang máy chủ nạp trước cứng một thực thể → AC-19, thước E21.

## Known limits

Chưa có mục nào. Người ký quyết mục nào vào đây tại Cổng Bằng chứng.
