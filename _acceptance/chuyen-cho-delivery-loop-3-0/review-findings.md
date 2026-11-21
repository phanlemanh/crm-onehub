# Review findings: chuyen-cho-delivery-loop-3-0 (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **cc30_thu chắc chắn đỏ ngay khi vòng được gộp vào onehub: ca «nhánh còn mở» khẳng định CAP.daGop === false**
  Người dùng thấy gì: Sau khi bản chuyển này được gộp, mỗi thay đổi tiếp theo của kho sẽ làm bộ kiểm của việc chuyển kit báo đỏ giả. Người làm việc kế tiếp sẽ phải sửa bộ kiểm của một hồ sơ đã ký mới qua được.
  Căn cứ: Không mất dữ liệu và không ảnh hưởng người dùng cuối, nhưng chắc chắn xảy ra ngay sau gộp và làm vướng mọi việc sau; sửa nhỏ nếu làm trước khi gộp, tốn hơn nhiều nếu để sau vì phải mở lại hồ sơ đã ký.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/thu/chuyen-cho.test.mjs`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 4 (âm tính một mình, không có đối chứng dương): ca AC-8 «hồ sơ ghim lại khớp hợp đồng» xanh trên tập rỗng, hai bản phá bị bỏ qua**
  Người dùng thấy gì: Việc kiểm hồ sơ ghim lại chưa từng bị thử với dữ liệu sai, nên nếu sau này có hồ sơ cần ghim thì lỗi ở đó có thể lọt qua mà vẫn báo xanh.
  Căn cứ: Hiện không có hồ sơ nào cần ghim nên chưa gây hại thật; chỉ thành rủi ro nếu về sau có hồ sơ ghim, và lúc đó người dùng không tự thấy được lỗi.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/thu/chuyen-cho.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (hardcode gốc, đo một commit cố định thay vì cây đang kiểm): đối chứng «merge-base» neo sha cứ 74a29a68, trong khi merge-base thật là 5e2c0b39**
  Người dùng thấy gì: Phép so với nhánh chính đang dùng một mốc cũ thay vì mốc thật của nhánh. Hiện kết quả vẫn đúng, nhưng nếu nhánh chính đổi cấu hình phiên thì bài kiểm có thể báo đỏ hoặc xanh sai.
  Căn cứ: Hiện chưa gây sai kết quả và chỉ ảnh hưởng quy trình nghiệm thu, không ảnh hưởng người dùng cuối; chạy lại làn đo là phát hiện được.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/rang/doi-chung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng không ghim đúng ca đã hứa): bản phá «do-ca-hai» chọn eval không chạy trên nhánh chính, không phải eval xanh trên nhánh chính**
  Người dùng thấy gì: Một kiểu cài sai việc phân loại eval xanh ở nhánh chính có thể không bị bài kiểm bắt, nhưng chỉ ảnh hưởng quy trình nghiệm thu nội bộ.
  Căn cứ: Hậu quả nhẹ, không chạm người dùng và không mất dữ liệu; công sửa vượt lợi ích vì việc phân loại thật đã được chạy và ghi lại trong tệp kết quả.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/thu/chuyen-cho.test.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
