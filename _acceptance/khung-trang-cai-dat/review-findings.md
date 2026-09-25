## Trong hợp đồng

(Không có phát hiện nào ánh xạ được vào một AC cụ thể trong lượt này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Breadcrumb in packages/ui hardcodes the English label "breadcrumb" instead of using the ui messages**
  Người dùng thấy gì: Người dùng dùng trình đọc màn hình bằng tiếng Việt trên các trang Kết nối sẽ nghe nhãn điều hướng bằng tiếng Anh, dù các phần còn lại của Cài đặt đã được dịch.
  file: `packages/ui/src/components/breadcrumb.tsx:11`
  severity: medium
  Đề xuất: known-limits

- **The /reminders route imports its components from the settings/notifications folder, which is now only a redirect**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng đang dùng sản phẩm — đây chỉ là cách tổ chức tệp nội bộ, và việc dọn lại đã được ghi nhận là để dành cho vòng sau.
  file: `apps/app/app/(app)/[slug]/reminders/page.tsx:17`
  severity: low
  Đề xuất: known-limits

- **The list of connection sub-pages is kept in three places with an `as` cast, and a mismatch drops the breadcrumb without any error**
  Người dùng thấy gì: Nếu sau này có ai thêm một loại kết nối mới mà quên cập nhật đủ nơi, trang kết nối đó có thể mất dòng điều hướng breadcrumb mà không ai nhận ra ngay.
  file: `apps/app/lib/cai-dat-breadcrumb.ts:6`
  severity: low
  Đề xuất: known-limits

- **Zalo bot's instructions still point to Settings › Your notifications, which this change removed**
  Người dùng thấy gì: Người dùng mới nhắn tin cho bot Zalo để kết nối sẽ được chỉ tới mục Cài đặt cũ không còn tồn tại, thay vì được chỉ đúng chỗ mới (Nhắc buổi sáng trong menu người dùng), nên có thể bỏ cuộc vì tưởng CRM bị lỗi.
  file: `apps/agent/agent/lib/zalo-config.ts:29`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E11 «bấm menu tới đúng đường» luôn xanh vì script tự goto /reminders trước khi đọc pathname**
  Người dùng thấy gì: Nếu cú bấm vào mục Nhắc buổi sáng trong menu thực ra dẫn sai trang, phép kiểm tự động vẫn báo xanh, nên lỗi đó có thể lọt ra ngoài mà không ai biết.
  file: `_acceptance/khung-trang-cai-dat/rang/man-chrome.mjs:539`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): E4 «tiêu đề thẻ không chứa tên nhà cung cấp» xanh cả khi không có thẻ nào**
  Người dùng thấy gì: Nếu thẻ tiêu đề bị xoá mất khỏi trang Google hoặc Microsoft, phép kiểm tự động vẫn báo xanh, nên việc thiếu tiêu đề có thể không bị phát hiện.
  file: `_acceptance/khung-trang-cai-dat/rang/man-chrome.mjs:296`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (đo «có mặt» khi lời hứa là quan hệ): breadcrumb trên trang thật chỉ được đo là có một <a>, không đo nhãn khớp với trang**
  Người dùng thấy gì: Nếu một trang con Kết nối vô tình hiện breadcrumb của trang khác, ví dụ trang Microsoft lại hiện chữ Google, phép kiểm tự động trên trang thật vẫn báo xanh.
  file: `_acceptance/khung-trang-cai-dat/rang/man-chrome.mjs:491`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): «mười trang mục không có breadcrumb» là khẳng định rỗng**
  Người dùng thấy gì: Nếu một trang mục sau này vô tình tự thêm breadcrumb dù đáng lẽ không có, phép kiểm tự động vẫn báo xanh nên sai khác này không bị bắt.
  file: `apps/app/test/khung-trang-cai-dat.dom.tsx:248`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (đo tên thay vì quan hệ thân bài): E16 miễn trừ toàn bộ thân bài loi-vao-dieu-phoi thay vì chỉ một khẳng định**
  Người dùng thấy gì: Nếu một bài kiểm cũ của mục Điều phối 30 ngày bị xoá nhầm trong lúc sửa cho vòng này, phép kiểm hồi quy vẫn có thể báo xanh thay vì báo lỗi.
  file: `_acceptance/khung-trang-cai-dat/rang/khong-hoi-quy.mjs:217`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E17 đo breadcrumb.tsx chỉ bằng vắng mặt, trong khi AC-13 hứa hai điều dương tính (cn của kho, biểu tượng Carbon)**
  Người dùng thấy gì: Nếu breadcrumb sau này đổi sang dùng một tiện ích màu hoặc bộ biểu tượng khác với quy chuẩn của kho, phép kiểm thiết kế tự động vẫn có thể báo xanh.
  file: `_acceptance/khung-trang-cai-dat/rang/san-thiet-ke.mjs:137`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E11 «0 nav Cài đặt trên /reminders» dùng một bộ chọn không được đối chứng dương trong lượt**
  Người dùng thấy gì: Nếu thanh bên Cài đặt sau này vô tình vẫn hiện trên trang Nhắc buổi sáng, dù đáng lẽ trang cá nhân đó không có thanh bên, phép kiểm tự động vẫn có thể báo xanh.
  file: `_acceptance/khung-trang-cai-dat/rang/man-chrome.mjs:547`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): kiểm tràn ngang ở 375 xanh khi không tìm thấy phần tử khung nào**
  Người dùng thấy gì: Nếu khung trang biến mất hoàn toàn trên màn hình nhỏ 375px vì một lý do khác, phép kiểm tràn ngang tự động vẫn có thể báo xanh thay vì báo lỗi.
  file: `_acceptance/khung-trang-cai-dat/rang/man-chrome.mjs:451`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
