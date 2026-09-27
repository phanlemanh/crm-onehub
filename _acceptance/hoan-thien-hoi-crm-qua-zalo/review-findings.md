## Trong hợp đồng

### The new SO_TIEN lookbehinds also fire on ordinary text before a money amount, and 13-digit amounts get partly masked (regression)
- file: apps/agent/agent/lib/zalo-loc.ts:15
- severity: high
- AC: AC-6
- detail: `(?<!\(\+?\d{1,3}\)[\s.-]?)` matches a numbered-list marker such as `(1) `, and `(?<!(?:\+|00)\d{1,3}[\s.-]?)` matches any number ending in 00x such as `2004 `. SO_TIEN then no longer protects the amount, and the rest goes to cheSo, where SO_DIEN_THOAI pattern 2 matches the digits after the first dot. Checked with bun, HEAD vs be244edb: `(1) 1.000.000.000.000 đ` now becomes `(1) 1.[đã ẩn] đ` (before: unchanged), and `Năm 2004 1.000.000.000.000 đ` becomes `Năm 2004 1.[đã ẩn] đ` (before: unchanged). This breaks the money half of AC-6: the amount must stay intact with no ZALO.hoi.an. Agent replies often use numbered `(1)`/`(2)` lists. E6 does not catch it because every money matrix item is wrapped as `Gia tri: <so>`, so nothing ever sits right before the amount.
- source: bugs
- rationale: Chuỗi tiền «1.000.000.000.000 đ» nằm nguyên trong ma trận số tiền của AC-6, và AC-6 hứa giữ nguyên con số này trong "một câu chứa" nó dù ngữ cảnh là gì; finding cho thấy khi đặt sau "(1) " hoặc "Năm 2004 " con số bị che mất một phần, phá đúng lời hứa đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The new money-number lookbehind in SO_TIEN copies the country-code prefix and the separator by hand instead of building them from PHAN_CACH, so two phone formats that SO_DIEN_THOAI catches are left visible**
  Người dùng thấy gì: Một vài cách gõ số điện thoại quốc tế có khoảng cách hơi rộng giữa mã nước và số máy (ví dụ gõ hai dấu cách liên tiếp) vẫn có thể hiện nguyên số cho người nhận tin thay vì được che đi.
  file: `apps/agent/agent/lib/zalo-loc.ts`
  severity: medium
  Đề xuất: known-limits

- **Lookbehind of SO_TIEN is narrower than the phone pattern, so international numbers with dot-grouped subscriber parts still leak unmasked**
  Người dùng thấy gì: Một số cách viết số điện thoại quốc tế ít gặp hơn (nhiều khoảng trắng, dùng gạch nối, hoặc mã nước viết dạng "(0084)") vẫn có thể hiện nguyên số điện thoại cho người nhận tin thay vì được che đi.
  file: `apps/agent/agent/lib/zalo-loc.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): ma trận số tiền không có trục «ngữ cảnh đứng trước» mà lookbehind mới của SO_TIEN dựa vào, nên không bắt được hồi quy giữ số tiền**
  Người dùng thấy gì: Bộ kiểm tra tự động hiện chưa thử trường hợp số tiền đứng ngay sau một dãy số khác trong câu (như số thứ tự hay năm tháng), nên nếu lỗi che nhầm số tiền xảy ra ở tình huống đó, hệ thống kiểm tra sẽ không tự phát hiện ra.
  file: `apps/agent/test/zalo-loc.spec.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 (điểm-case thay cho lớp): ma trận số quốc tế nhóm chỉ có dấu chấm, trong khi lookbehind vừa thêm áp cho cả hai dấu phân cách [.,] của SO_TIEN**
  Người dùng thấy gì: Số điện thoại quốc tế mà người dùng gõ theo nhóm bằng dấu phẩy (thay vì dấu chấm) có thể không được che, vì tính năng hiện chỉ nhận diện cách viết bằng dấu chấm.
  file: `apps/agent/test/zalo-loc.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Chặn Zalo trong execute không tới được ở hai công cụ có approval (archive_field, record_job_change) (r1)**
  Người dùng thấy gì: Với các thao tác cần duyệt trước khi ghi (như lưu trữ trường hay ghi nhận đổi việc), người hỏi qua Zalo có thể bị kẹt ở bước hỏi lại thay vì nhận được câu trả lời tiếp theo, dù không có dữ liệu nào bị ghi nhầm.
  file: `apps/agent/agent/tools/archive_field.ts`
  severity: medium
  Đề xuất: known-limits

- **assertNotZaloQuestion so với chuỗi "zalo" viết tay, trong khi lớp ẩn dùng ZALO.hoi.purpose (r1)**
  Người dùng thấy gì: Hiện chưa ảnh hưởng gì tới người dùng vì hai cách viết đang cho cùng một giá trị; nhưng nếu sau này có người đổi một chỗ mà quên chỗ còn lại, ranh giới bảo vệ dữ liệu khi hỏi qua Zalo có thể lặng lẽ hỏng mà không ai biết.
  file: `apps/agent/agent/lib/session-purpose.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
