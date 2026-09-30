# Review findings: khung-tao-okr-nhu-deal (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E13 no longer compares the raw payload: both sides are compared only after parsing, and parsing hides a dropped field and extra spaces**
  Người dùng thấy gì: Bài kiểm kiểm tra ngăn tạo và sửa OKR gửi đúng dữ liệu chỉ so sau khi hệ thống đã tự điền mặc định và cắt khoảng trắng. Nếu sau này ngăn bỏ sót một ô như chế độ hiển thị hoặc gửi tiêu đề thừa dấu cách, bài kiểm vẫn báo xanh, nên lỗi kiểu đó có thể lọt qua mà không ai thấy.
  file: `apps/app/test/khung-tao-okr-payload.tsx`
  severity: medium
  Đề xuất: known-limits

- **E13 gui-dung now compares Zod-parsed output instead of the raw payload, so defaults and trims hide a changed payload**
  Người dùng thấy gì: Bài kiểm ngăn gửi dữ liệu chỉ nhìn kết quả sau khi hệ thống tự sửa và điền mặc định, nên nếu ngăn quên gửi mức hiển thị của Mục tiêu thì Mục tiêu giới hạn vẫn có thể bị tạo thành công khai mà bài kiểm không báo đỏ. Hiện chưa có bài kiểm nào khác canh chỗ này.
  file: `apps/app/test/khung-tao-okr-payload.tsx`
  severity: medium
  Đề xuất: known-limits

- **hopOkr gets its own parser in a component file and a second, different parser in record-stack** (r2)
  Người dùng thấy gì: Hiện người dùng không thấy lỗi nào. Nếu sau này có người sửa cách đọc tham số trên URL của ngăn OKR mà không biết có hai chỗ khai báo, ngăn có thể mở sai hoặc không mở khi bấm.
  file: `apps/app/app/(app)/[slug]/okr/ngan-okr-url.tsx`
  severity: medium
  Đề xuất: known-limits

- **Sheet open state in the URL is cleaned up with useEffect, against the repo's no-useEffect convention** (r2)
  Người dùng thấy gì: Người dùng không thấy khác biệt: người không có quyền mở đường dẫn ngăn OKR vẫn không thấy ngăn nào. Chỉ là cách viết mã trái quy ước của kho, có thể bị nhắc khi rà soát.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **The proto hand-builds a sheet body even though SheetBody was added in this same diff** (r2)
  Người dùng thấy gì: Chỉ ảnh hưởng bản mẫu xem thử: phần ngăn nền phía sau có thể không cuộn được như ngăn thật khi nội dung dài. Ứng dụng thật không bị ảnh hưởng.
  file: `apps/app/app/proto/_modules/khung-tao-okr-nhu-deal/ngan.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không đỏ được): E6 vẫn tính «scrollWidth == innerWidth» của trang trên vỏ ngăn** (r2)
  Người dùng thấy gì: Phép kiểm cũ về chuyện nội dung tràn ngang ở cột góp ý không còn bắt được lỗi trên ngăn mới. Nếu cột góp ý bị tràn ngang sau này, phép kiểm này sẽ vẫn báo đạt.
  file: `_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (có mặt thay cho quan hệ): E4 hứa hai tập class chân bằng nhau nhưng chỉ kiểm một chiều** (r2)
  Người dùng thấy gì: Phép kiểm chân ngăn có thể bỏ sót nếu chân ngăn có thêm kiểu xếp khác chân hộp thoại. Hiện các nút vẫn xếp đúng chỗ, chỉ có thêm khoảng đệm.
  file: `_acceptance/khung-tao-okr-nhu-deal/rang/chan-ngan.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (đếm không ghim): E18 hứa «số chốt = 5» nhưng không so với cỡ danh sách** (r2)
  Người dùng thấy gì: Một bước kiểm nội bộ in ra số chốt nhưng không tự báo lỗi khi số này lệch dự kiến. Người dùng cuối không bị ảnh hưởng.
  file: `_acceptance/khung-tao-okr-nhu-deal/rang/thuoc-cu.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
