# Review findings: to-chuc-chi-tiet-cho-url (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **maxBuffer dùng số viết thẳng thay vì đặt trong cau-hinh.mjs**
  Người dùng thấy gì: Một con số giới hạn dung lượng đầu ra của lượt đo nằm lẫn trong mã thay vì ở tệp cấu hình chung. Nếu chạy lặp quá nhiều thì công cụ đo tự dừng và báo không kết luận, không báo xanh sai, nên chỉ gây bất tiện cho người chỉnh sau này.
  file: `_acceptance/to-chuc-chi-tiet-cho-url/rang/chay.mjs`
  severity: low
  Đề xuất: wont-fix

- **E2 stays green when an existing cho is moved after the assertion it guards**
  Người dùng thấy gì: Ai đó có thể dời một bước chờ xuống sau câu kiểm tra mà phép đo vẫn báo xanh, làm bài kiểm tra đọc trạng thái trước khi chờ xong và chập chờn trở lại mà không bị phát hiện.
  file: `_acceptance/to-chuc-chi-tiet-cho-url/rang/khang-dinh.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 (âm-tính-một-mình): chiều xanh của E3 chỉ hỏi 'không ca nào đỏ', không ghim số ca 29/29 hay mã thoát của bun**
  Người dùng thấy gì: Nếu lượt chạy thử bị dừng giữa chừng, phép đo trễ URL vẫn có thể báo xanh dù chưa chạy hết các ca. Phép đo lặp 20 lượt vẫn đếm đủ số ca nên rủi ro này được che phần lớn.
  file: `_acceptance/to-chuc-chi-tiet-cho-url/rang/tre-url.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, phạm vi chỉ trong thân test): E1 không thấy url.get hay bam nằm trong hàm trợ giúp**
  Người dùng thấy gì: Nếu sau này có người thêm một hàm phụ đọc địa chỉ trang rồi gọi trong bài kiểm tra, phép quét sẽ không thấy chỗ đọc đó. Hiện tại tệp kiểm không có trường hợp như vậy nên kết quả hôm nay vẫn đúng.
  file: `_acceptance/to-chuc-chi-tiet-cho-url/rang/cay.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
