## Trong hợp đồng

(Không có phát hiện nào được map vào AC ở vòng này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

### Round 3 (mới)

- **The new E21 log line claims more than E21 checks**
  Người dùng thấy gì: Dòng thông báo trong bước kiểm tra tự động có thể khiến người đọc báo cáo tin rằng mọi cảnh báo ở hồ sơ khác đã được rà hết, trong khi thực ra chỉ một loại cảnh báo được kiểm — dễ bỏ sót cảnh báo thật khi ra quyết định ký duyệt.
  file: `_acceptance/cap-nhat-tuan-okr/rang/ho-so-bi-cham.mjs`
  severity: low
  Đề xuất: known-limits

- **E21 misses a touched signed profile when the eval command starts with a quoted cd (go-khoa-goc-nhin), yet reports a full match**
  Người dùng thấy gì: Bước kiểm tra tự động có thể báo đã khớp đủ danh sách hồ sơ bị ảnh hưởng, trong khi thực ra bỏ sót một hồ sơ vì cách viết lệnh đặc biệt — người ký duyệt có thể tin nhầm là đã đủ bằng chứng trong khi còn thiếu một trường hợp cần xem lại.
  file: `_acceptance/cap-nhat-tuan-okr/rang/ho-so-bi-cham.mjs`
  severity: medium
  Đề xuất: known-limits

- **New E21 message says it reads every VIOLATION from other profiles, but the code only reads the «evidence is stale» kind**
  Người dùng thấy gì: Dòng thông báo mới nói rộng hơn thực tế: người đọc báo cáo có thể hiểu nhầm là mọi cảnh báo từ hồ sơ khác đều đã được rà, trong khi máy chỉ kiểm một dạng cảnh báo cụ thể — rủi ro bỏ sót cảnh báo thật khi quyết định ký.
  file: `_acceptance/cap-nhat-tuan-okr/rang/ho-so-bi-cham.mjs`
  severity: low
  Đề xuất: known-limits

### Carried từ round trước

- **Hình dạng 4 (âm-tính-một-mình): chuyen-okr-khoa-rieng khẳng định không có cảnh báo «same key» nhưng không có ca đối chứng chứng minh bộ bắt console còn sống (r2)**
  Người dùng thấy gì: Bài kiểm tra cho một phần dữ liệu OKR hiện không có phép thử chứng minh việc phát hiện lỗi trùng khoá vẫn hoạt động, nên nếu thực sự phát sinh lỗi trùng dữ liệu sau này, bài kiểm tra có thể không bắt được và báo nhầm là ổn.
  file: `apps/app/test/chuyen-okr.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **The sheet works out who may send a weekly update itself instead of using canEditKr from the API (r1)**
  Người dùng thấy gì: Menu 'Cập nhật' hiện trên từng chỉ số có thể một ngày nào đó cho phép sai người bấm, hoặc chặn nhầm người phụ trách, nếu quy tắc ai được ghi hộ thay đổi mà không đồng bộ.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **guiCapNhatInput allows the same KR twice in one submit (r1)**
  Người dùng thấy gì: Một lần gửi có thể vô tình ghi hai bản cập nhật cho cùng một chỉ số thay vì báo lỗi, làm số liệu tỷ lệ cập nhật hằng tuần bị lệch nhẹ và không thể xoá bản ghi thừa sau đó.
  file: `packages/validation/src/okr-cap-nhat.ts`
  severity: medium
  Đề xuất: known-limits

- **okr-nhac reads OkrTrail.after with raw JSON helpers instead of the trail schema (r1)**
  Người dùng thấy gì: Nếu một dòng lịch sử bị lưu sai định dạng, hệ thống âm thầm coi như 'không có ai được giao việc' thay vì báo lỗi, khiến thẻ việc 'được giao' có thể bị bỏ sót mà không ai hay biết.
  file: `packages/db/src/okr-nhac.ts`
  severity: medium
  Đề xuất: known-limits

- **The OKR reminder item shape is defined by hand in four to five places (r1)**
  Người dùng thấy gì: Khi có người thêm một loại nhắc việc OKR mới trong tương lai, nó có thể bị rơi mất khỏi tin nhắn nhắc buổi sáng mà không có cảnh báo nào.
  file: `packages/db/src/okr-nhac.ts`
  severity: medium
  Đề xuất: known-limits

- **PHUT_MS is written a second time, and okr-nhac keeps loose constants beside its first use (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay bây giờ; là rủi ro rằng thời hạn nhắc việc bị sửa không đồng bộ giữa hai nơi trong tương lai.
  file: `packages/db/src/okr-nhac.ts`
  severity: low
  Đề xuất: known-limits

- **mucTieuOutput adds a theoDoi field that is a copy of following and that no product code reads (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng; một trường dữ liệu dư thừa trong phản hồi hệ thống không có màn nào sử dụng.
  file: `apps/api/src/okr/okr.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Event-based OKR reminders go out mid-day and are sent again the next morning (r1)**
  Người dùng thấy gì: Một người có thể nhận lại đúng thông báo 'được nhắc tên' hoặc 'được giao việc' hai buổi sáng liên tiếp, và một tin gửi vào giữa trưa vẫn mở đầu bằng câu chào 'sáng nay' dù không phải buổi sáng.
  file: `packages/db/src/okr-nhac.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: vết OKR gieo tay ở bài agent (E11), phần "ghim" ở E12 chỉ so với một hằng số viết tay khác, không đi vòng qua bộ gieo (r1)**
  Người dùng thấy gì: Bài kiểm chứng dữ liệu lịch sử ghi đè người phụ trách dùng dữ liệu tự dựng riêng thay vì dữ liệu do đúng luồng ghi thật sinh ra, nên có thể báo Đạt dù luồng ghi thật đang sai định dạng.
  file: `apps/agent/test/okr-nhac.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — Không ghim thông điệp: chiều đỏ của E4 dùng vị từ riêng và tự in nhãn, không chạy bộ kiểm xanh (r1)**
  Người dùng thấy gì: Bài kiểm bảo vệ ba con số đo lường (tỷ lệ cập nhật, thời gian trung bình, người chưa nhận tin) có thể báo 'đã bắt được lỗi' dù phép đo thật đã hỏng một phần, vì nó tự dựng phép so sánh riêng thay vì kiểm tra chính phép đo đang dùng thật.
  file: `_acceptance/cap-nhat-tuan-okr/rang/duong-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: chiều đỏ «packages/ui bị sửa» của E25 đưa thẳng danh sách tay vào hàm định dạng (r1)**
  Người dùng thấy gì: Bài kiểm 'không được sửa thành phần giao diện dùng chung có sẵn' luôn báo bắt được lỗi bất kể nội dung thật, nên nếu bộ quét thật ngừng hoạt động, không ai biết.
  file: `_acceptance/cap-nhat-tuan-okr/rang/san-thiet-ke.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — Đo chỉ dẫn thay vì đầu ra: tập thủ tục router (E1, E17) đọc từ chữ của tệp sinh src/generated/server.ts, không đọc router đang chạy (r1)**
  Người dùng thấy gì: Khẳng định 'không thể sửa hay xoá bản cập nhật/bình luận qua API' dựa trên một bản khai được sinh ra trước đó; nếu bản khai đó không được cập nhật lại sau khi có thay đổi, phép đo vẫn báo Đạt dù khả năng sửa/xoá đã thực sự bị mở ra.
  file: `apps/api/test/okr-cap-nhat.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên quét cả lớp nhưng ma trận thiếu phần tử: E24 «9 thủ tục mới» trong khi lượt này thêm 10 thủ tục okr.* (r1)**
  Người dùng thấy gì: Bảng kiểm quyền truy cập cho các chức năng OKR mới theo từng vai bỏ sót một chức năng (xem danh sách thành viên), nên nếu chức năng đó bị lộ sai quyền, phép đo hiện tại sẽ không phát hiện.
  file: `apps/api/test/okr-cap-nhat.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(Không có.)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
