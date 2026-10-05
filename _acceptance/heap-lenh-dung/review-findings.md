# Review findings: heap-lenh-dung (round 2)

## Trong hợp đồng

(không có finding nào)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Mang lên từ round 1 (round 2 chạy lại bộ soi và không trả lại các mục này; nhát sửa 293fc8e7 chỉ đổi dòng đọc `NODE_OPTIONS`, không gỡ mục nào):

- **E1 ties the acceptance build check to the fork's private patch in the vendor's ci.yml (r1)**
  Người dùng thấy gì: Phép kiểm heap của job dựng so với con số đã nới ở bước kiểm kiểu của CI hãng. Lần kế tiếp kéo bản mới của hãng về mà tệp CI đó mất con số ấy, phép kiểm sẽ đỏ hoặc không chạy được dù job dựng của công ty vẫn đúng, và phải sửa tay để gỡ.
  file: `_acceptance/heap-lenh-dung/rang/build-heap.mjs`
  severity: medium
  Đề xuất: known-limits

- **`--tep` without a value crashes with exit code 1, which reads as a real red (r1)**
  Người dùng thấy gì: Nếu ai đó chạy phép kiểm heap với thiếu một tham số, nó báo đỏ như thể tính năng hỏng, trong khi thật ra chỉ là gọi sai. Người đọc kết quả có thể tưởng job dựng bị lỗi heap.
  file: `_acceptance/heap-lenh-dung/rang/build-heap.mjs`
  severity: low
  Đề xuất: known-limits

- **Infrastructure errors exit with code 1, the same code as a red verdict (r1)**
  Người dùng thấy gì: Khi tệp cấu hình đọc không được hoặc thiếu thư mục, phép kiểm heap báo đỏ như một lượt dựng hỏng thật, thay vì báo không đo được. Người quyết định có thể mất thời gian đi tìm lỗi heap không tồn tại.
  file: `_acceptance/heap-lenh-dung/rang/build-heap.mjs`
  severity: medium
  Đề xuất: known-limits

- **The script deletes `apps/app/.next`, including the `.next/dev` folder of any dev server running in that tree (r1)**
  Người dùng thấy gì: Chạy phép kiểm này trong cùng cây với một bản dev đang mở sẽ làm bản dev đó mất dữ liệu đã biên dịch giữa chừng, hoặc làm hỏng một phép đo màn hình chạy song song. Cần chạy nó riêng, không đồng thời với bản dev hay phép đo màn khác.
  file: `_acceptance/heap-lenh-dung/rang/build-heap.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
