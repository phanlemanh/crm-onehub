# Review findings: gioi-han-duyet-cay-okr (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A Prisma filter object is used as the source of the 'cong-khai' visibility value (r1)**
  Người dùng thấy gì: Hôm nay việc chặn căn chỉnh vào mục tiêu giới hạn vẫn đúng. Nhưng nếu sau này ai đổi cách viết điều kiện lọc, hệ thống có thể lặng lẽ từ chối căn chỉnh vào mọi mục tiêu công khai, và trợ lý sẽ không đề xuất được đích nào.
  file: `apps/api/src/okr/okr.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Status and trail-action literals are redefined per file although a shared constant exists (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng hôm nay. Nếu sau này đổi tên một trạng thái duyệt, sẽ phải sửa nhiều chỗ và dễ sót, có thể làm màn hình hiện sai trạng thái.
  file: `apps/api/src/okr/okr-duyet.service.ts`
  severity: low
  Đề xuất: known-limits

- **The approver rule branches on an unparsed `level: string` (r1)**
  Người dùng thấy gì: Nếu một mục tiêu có cấp đơn vị lạ hoặc gõ sai, tin nhắc buổi sáng có thể gửi việc duyệt cho quản trị thay vì trưởng phòng hay trưởng bộ phận, và hai nơi có thể nêu hai người duyệt khác nhau.
  file: `packages/db/src/okr-duyet.ts`
  severity: low
  Đề xuất: known-limits

- **Program health drops KRs of objectives waiting for approval from the 'not published yet' count (r1)**
  Người dùng thấy gì: Khi bật duyệt và một trưởng phòng gửi mục tiêu đi duyệt, số «chưa công bố» ở Sức khoẻ chương trình giảm xuống dù chưa có gì được công bố, làm người xem tưởng tiến độ tốt hơn thực tế.
  file: `apps/api/src/okr/okr-xem.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Setting an objective to restricted can race with a new alignment into it, breaking the 'restricted has no alignments' rule (r1)**
  Người dùng thấy gì: Nếu một người đặt mục tiêu sang giới hạn đúng lúc người khác căn chỉnh vào nó, hiếm khi mục tiêu giới hạn vẫn còn một căn chỉnh trỏ tới. Cần hai thao tác trùng đúng khoảnh khắc nên rất ít gặp.
  file: `apps/api/src/okr/okr-hien-thi.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 (đo một bản chụp cố định thay vì cây đang kiểm): tach-giao-dich ghim vào SHA lịch sử của lần gộp lượt 9b (r1)**
  Người dùng thấy gì: Bài kiểm tra canh việc người ta có lỡ xoá bớt các kiểm tra OKR cũ hay không chỉ nhìn vào một lần gộp trong quá khứ, nên về sau nếu ai xoá kiểm tra thì bài này vẫn báo xanh. Người dùng không thấy ngay, nhưng lưới an toàn bị hở.
  file: `apps/api/test/tro-ly-okr-hoan-tac.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (đo «định danh có mặt» thay cho quan hệ «điều kiện nằm trong where»): coDieuKien của soi-ma --ca xem (r1)**
  Người dùng thấy gì: Công cụ tự soi có thể coi một truy vấn OKR là đã có điều kiện xem dù điều kiện đặt sai chỗ, nên một chỗ lộ mục tiêu giới hạn về sau có thể lọt qua mà công cụ vẫn báo ổn.
  file: `_acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo thứ runtime không dùng): ma trận 33 ô và kiểm «định nghĩa đúng một lần» nhắm vào xemDuocMucTieu, hàm không đường chạy nào của sản phẩm gọi (r1)**
  Người dùng thấy gì: Bảng thử 33 ô kiểm một hàm mô tả luật xem mà sản phẩm không gọi trực tiếp; luật thật chạy ở chỗ khác nhưng đã được đối chiếu với hàm này. Chấp nhận, hậu quả với người dùng gần như không có.
  file: `packages/validation/src/okr-hien-thi.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): kiểm «to-chuc không nhập từ okr» không có đối chứng dương (r1)**
  Người dùng thấy gì: Bài kiểm tra canh khu tổ chức không được phụ thuộc vào OKR có thể không bắt được một số cách viết phụ thuộc, nên sau này khu tổ chức có thể dính lại vào OKR mà bài vẫn xanh.
  file: `apps/api/test/okr-tai-co-cau.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
