# Review findings — nop-ban-nhap-chon-theo-khoa (round 1)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đoạn chèn DAO trong rang ép kiểu noiDung thay vì đọc qua dongSoanTuHang**
  Người dùng thấy gì: Công cụ kiểm chứng nội bộ đọc khoá bản nháp bằng một cách dễ vỡ hơn cần thiết. Nếu sau này đổi tên trường, công cụ sẽ báo lỗi chung chung thay vì chỉ đúng chỗ hỏng; người dùng sản phẩm không bị ảnh hưởng.
  file: `_acceptance/nop-ban-nhap-chon-theo-khoa/rang/dao-thu-tu.mjs`
  severity: low
  Đề xuất: wont-fix

- **Ca «nộp lại dòng có khoá đã bác» cũng chọn dòng m1 theo vị trí vật lý, cùng lớp lỗi với ca vừa sửa**
  Người dùng thấy gì: Một bài kiểm tra khác, về việc nộp lại đề xuất đã bị bác, vẫn có thể thỉnh thoảng báo đỏ ngẫu nhiên trên hệ thống kiểm tra tự động dù sản phẩm không lỗi. Việc này làm chậm đội khi phải chạy lại, nhưng không ảnh hưởng người dùng cuối.
  file: `apps/agent-okr/test/nop-ban-nhap.integration.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Răng quet-mau (AC-5) không thấy findFirst thiếu orderBy, nên báo xanh dù còn một ca cùng mẫu**
  Người dùng thấy gì: Bước tự động dò các bài kiểm tra có nguy cơ đỏ ngẫu nhiên chỉ nhận ra một kiểu duy nhất, nên có thể báo là đã rà đủ trong khi còn một kiểu tương tự chưa được dò tới. Hậu quả là đội có thể tin sai rằng vấn đề đã hết.
  file: `_acceptance/nop-ban-nhap-chon-theo-khoa/rang/quet-mau.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 (quét lớp nhưng không có ma trận viết trước): E5 chỉ đếm số chỗ, không ghim đúng ba chỗ đã được xét**
  Người dùng thấy gì: Bước dò chỉ đếm số chỗ cần chú ý chứ không nhớ đó là những chỗ nào, nên nếu ai đó đổi chỗ này sang chỗ khác thì vẫn báo đạt. Rủi ro thấp và chỉ ảnh hưởng độ chặt của công cụ kiểm tra nội bộ.
  file: `_acceptance/nop-ban-nhap-chon-theo-khoa/rang/quet-mau.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
