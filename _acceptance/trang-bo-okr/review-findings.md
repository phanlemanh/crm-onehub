# Review findings: trang-bo-okr (round 4)

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **okr.viecCuaBo mixes tasks of «Đã bỏ» objectives into the main list, against docs/vong-doi.md**
  Người dùng thấy gì: Ở thẻ Việc của một bộ OKR, các việc thuộc mục tiêu đã bỏ nằm lẫn với việc của mục tiêu đang chạy, không có dòng riêng «Đã bỏ». Người xem có thể tưởng việc đã bỏ vẫn đang cần làm.
  Căn cứ: Nhẹ: không mất dữ liệu, chỉ thêm nhiễu khi đọc danh sách; người dùng vẫn nhìn ra qua tên KR, và sửa sau không đắt nhưng cần quyết định cách hiện.
  file: `apps/api/src/okr/okr-xem.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Task rows of an OKR set rebuild the select and mapping from scratch instead of the existing canh-kr pattern, losing daRoi and quaHan**
  Người dùng thấy gì: Ở thẻ Việc của bộ OKR, việc quá hạn hoặc có người làm đã rời nhóm không mang dấu cảnh báo như trong phiếu bản ghi. Người xem phải tự so với ngày hạn.
  Căn cứ: Nhẹ: thông tin vẫn đủ (có hạn và người làm), chỉ thiếu dấu nhắc; không sai số liệu và có thể bổ sung sau.
  file: `apps/api/src/okr/bo-okr.ts`
  severity: low
  Đề xuất: known-limits

- **Old compose links without donOkr now land on the set list and are silently dropped**
  Người dùng thấy gì: Một đường dẫn cũ mở bản nháp Soạn mà không có tham số đơn vị sẽ mở ra danh sách các bộ, không mở bản nháp và không báo lỗi. Người dùng phải tự tìm lại bản nháp.
  Căn cứ: Vừa: không mất bản nháp, chỉ mất đường tắt từ liên kết cũ hoặc dấu trang; người dùng tự mở lại được từ màn Soạn nên chấp nhận được trước mắt.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx`
  severity: low
  Đề xuất: known-limits

- **«Đang theo dõi» counts follows on draft and abandoned objectives, but the Mục tiêu column counts only published ones**
  Người dùng thấy gì: Một đơn vị có thể hiện trong «Đang theo dõi» chỉ vì người xem theo dõi một mục tiêu nháp hoặc đã bỏ, trong khi cột Mục tiêu của đơn vị đó ghi 0 hoặc ít hơn. Con số trông lệch nhau.
  Căn cứ: Nhẹ: chỉ là chênh lệch hiển thị ở trường hợp hiếm, không mất dữ liệu; người dùng bỏ theo dõi hoặc mở bộ ra là hiểu.
  file: `apps/api/src/okr/okr-xem.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không có đối chứng dương thật): đối chứng «doi chung duong» của tbo-viec-ten không bao giờ sai được**
  Người dùng thấy gì: Người dùng không thấy gì khác. Chỉ là một bài kiểm tự động có phần đối chứng không bắt được lỗi, nên nếu tên việc ở thẻ Việc bị trống trở lại thì phần đó không báo.
  Căn cứ: Rất nhẹ với người dùng: không ảnh hưởng sản phẩm hiện tại, phần kiểm chính vẫn có; sửa là việc dọn bài kiểm, không đáng mở việc riêng.
  file: `apps/app/test/trang-bo-okr.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay thay vì lấy từ bên ghi): tbo-lien-ket-do dựng href bằng tay, không cho Toàn cảnh chạy bản serialize cũ**
  Người dùng thấy gì: Người dùng không thấy gì khác. Một bài kiểm tự động chưa chứng minh được rằng nó sẽ báo đỏ nếu Toàn cảnh quay lại phát liên kết thiếu tham số đơn vị.
  Căn cứ: Rất nhẹ với người dùng: sản phẩm hiện đúng và phần kiểm chính đã đo liên kết thật; dựng lại đối chứng tốn công mà ít giá trị thêm.
  file: `apps/app/test/trang-bo-okr.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (khai quét LỚP nhưng cách giải lệnh bỏ sót mục): khong-doi-hinh.mjs bỏ mọi eval mà lệnh không ghi đường dẫn tệp**
  Người dùng thấy gì: Người dùng không thấy khác biệt ngay. Việc kiểm «không xấu hơn trước» bỏ sót những bài kiểm chạy cả bộ hoặc qua script bọc, nên một hồi quy ở đó có thể lọt mà không ai biết.
  Căn cứ: Vừa: không ảnh hưởng người dùng hôm nay nhưng làm lưới an toàn hở ở vài hồ sơ cũ; nên ghi lại là hạn chế đã biết, đo thêm thủ công khi cần.
  file: `_acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định «có mặt» trong khi lời hứa là quan hệ): E7 coi thẻ Sơ đồ đã mở khi nội dung mang mốc ST-donvi-rong, mà thẻ OKR cũng dùng mốc này**
  Người dùng thấy gì: Người dùng không thấy khác biệt. Phép đo có thể báo đạt cho thẻ Sơ đồ ngay cả khi nó hiện nhầm khối rỗng của danh sách, nhưng chỉ khi bộ đo không có mục tiêu ở chu kỳ khác.
  Căn cứ: Nhẹ: chỉ xảy ra với bộ dữ liệu mẫu đặc biệt, không động tới dữ liệu người dùng; sửa phép đo đắt hơn hậu quả.
  file: `_acceptance/trang-bo-okr/rang/man-bo-okr-du-lieu.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

