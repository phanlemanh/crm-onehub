# Review findings: khung-tao-okr-nhu-deal (round 2)

## Trong hợp đồng

Không có mục nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **hopOkr gets its own parser in a component file and a second, different parser in record-stack**
  Người dùng thấy gì: Hiện người dùng không thấy lỗi nào. Nếu sau này có người sửa cách đọc tham số trên URL của ngăn OKR mà không biết có hai chỗ khai báo, ngăn có thể mở sai hoặc không mở khi bấm.
  file: `apps/app/app/(app)/[slug]/okr/ngan-okr-url.tsx`
  severity: medium
  Đề xuất: known-limits

- **Sheet open state in the URL is cleaned up with useEffect, against the repo's no-useEffect convention**
  Người dùng thấy gì: Người dùng không thấy khác biệt: người không có quyền mở đường dẫn ngăn OKR vẫn không thấy ngăn nào. Chỉ là cách viết mã trái quy ước của kho, có thể bị nhắc khi rà soát.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **The proto hand-builds a sheet body even though SheetBody was added in this same diff**
  Người dùng thấy gì: Chỉ ảnh hưởng bản mẫu xem thử: phần ngăn nền phía sau có thể không cuộn được như ngăn thật khi nội dung dài. Ứng dụng thật không bị ảnh hưởng.
  file: `apps/app/app/proto/_modules/khung-tao-okr-nhu-deal/ngan.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): ca suaDuoc=undefined ở tao-muc-tieu có thể xanh dù mã sai**
  Người dùng thấy gì: Trong lúc quyền của người dùng chưa tải xong, bài kiểm hiện không đủ chặt để bắt lỗi nếu sau này ai đó đổi cách xử lý. Hôm nay người dùng chưa thấy hậu quả nào.
  file: `apps/app/test/khung-tao-okr.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không đỏ được): E6 vẫn tính «scrollWidth == innerWidth» của trang trên vỏ ngăn**
  Người dùng thấy gì: Phép kiểm cũ về chuyện nội dung tràn ngang ở cột góp ý không còn bắt được lỗi trên ngăn mới. Nếu cột góp ý bị tràn ngang sau này, phép kiểm này sẽ vẫn báo đạt.
  file: `_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (có mặt thay cho quan hệ): E4 hứa hai tập class chân bằng nhau nhưng chỉ kiểm một chiều**
  Người dùng thấy gì: Phép kiểm chân ngăn có thể bỏ sót nếu chân ngăn có thêm kiểu xếp khác chân hộp thoại. Hiện các nút vẫn xếp đúng chỗ, chỉ có thêm khoảng đệm.
  file: `_acceptance/khung-tao-okr-nhu-deal/rang/chan-ngan.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận thiếu ô): ô «Sửa mục tiêu × mở bằng URL» ở E2 không kiểm ô tên**
  Người dùng thấy gì: Khi mở ngăn Sửa mục tiêu từ đường dẫn, bài kiểm không xác nhận ô tên hiện đúng tên mục tiêu. Nếu ô tên hiện sai, bài kiểm này sẽ không báo.
  file: `apps/app/test/khung-tao-okr.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (đếm không ghim): E18 hứa «số chốt = 5» nhưng không so với cỡ danh sách**
  Người dùng thấy gì: Một bước kiểm nội bộ in ra số chốt nhưng không tự báo lỗi khi số này lệch dự kiến. Người dùng cuối không bị ảnh hưởng.
  file: `_acceptance/khung-tao-okr-nhu-deal/rang/thuoc-cu.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
