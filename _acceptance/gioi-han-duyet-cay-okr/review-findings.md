# Review findings: gioi-han-duyet-cay-okr (round 1)

## Trong hợp đồng

- **The withdraw confirmation is a hand-built Dialog instead of ConfirmDialog**
  file: `apps/app/components/crm/record-sheet/objective-duyet.tsx:139`
  severity: medium
  AC: AC-15
  source: conventions
  detail: `HopRutLai` rebuilds a plain yes/no confirmation by hand: a title, a description, a Cancel button inside `DialogClose` and a confirm button with a spinner. The table in docs/design.md («Dấu hiệu vẽ tay») maps «AlertDialog ráp tay để hỏi lại» to `ConfirmDialog`, and review returns this pattern. The same file already uses `ConfirmDialog` for the send-for-approval question (`NutGuiDuyet`: `tone="default"`, `nut`, `thoi`, `tieuDe`, `than`, `pending`, `onConfirm`), so the component covers this case exactly. Because of that, the two confirmations in the approval strip look and behave differently: button order, pending handling and focus.

- **Hình dạng 5 (tuyên ma trận toàn phần nhưng một giá trị của cột K không có assert): ô K «vang» trong hien-thi-an không được kiểm**
  file: `apps/api/test/vai-chi-okr.spec.ts:2074`
  severity: medium
  AC: AC-3
  source: measurement
  detail: THU_TU_DOC_OKR khai cho mỗi thủ tục một cột K là «chua-G» hoặc «vang». Hợp đồng E3 định nghĩa «vang» là «G vắng với mọi người». Trong oDocAn, chuỗi lộ chỉ được đếm khi `ai !== "K"` (dòng 2074: `if (ai !== "K") ghiLo(...)`). Với K, chỉ có kiểm «thiếu» khi `d.K === "chua-G"` (dòng 2076). Vậy mọi ô (thủ tục K=«vang», đường, K) không có assert nào về việc G vắng, chỉ có mã trạng thái. Có hơn hai chục dòng như vậy, gồm alignmentTree, cayCanChinh, toanCanh, hopTuan, countByUnit, xuHuongKr, troLySanSang. Commit 424bd384 đổi alignmentTree và cayCanChinh từ «chua-G» sang «vang» đúng vì mục tiêu giới hạn phải vắng cả với người xem được. Sau đổi đó, nếu một hồi quy làm hai thủ tục này trả lại G cho K qua REST hay khoá API, ma trận ba đường × ba người vẫn xanh. Chỉ so-gop kiểm cayCanChinh/alignmentTree cho T, và chỉ qua tRPC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A Prisma filter object is used as the source of the 'cong-khai' visibility value**
  Người dùng thấy gì: Hôm nay việc chặn căn chỉnh vào mục tiêu giới hạn vẫn đúng. Nhưng nếu sau này ai đổi cách viết điều kiện lọc, hệ thống có thể lặng lẽ từ chối căn chỉnh vào mọi mục tiêu công khai, và trợ lý sẽ không đề xuất được đích nào.
  file: `apps/api/src/okr/okr.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Status and trail-action literals are redefined per file although a shared constant exists**
  Người dùng thấy gì: Không ảnh hưởng người dùng hôm nay. Nếu sau này đổi tên một trạng thái duyệt, sẽ phải sửa nhiều chỗ và dễ sót, có thể làm màn hình hiện sai trạng thái.
  file: `apps/api/src/okr/okr-duyet.service.ts`
  severity: low
  Đề xuất: known-limits

- **The approver rule branches on an unparsed `level: string`**
  Người dùng thấy gì: Nếu một mục tiêu có cấp đơn vị lạ hoặc gõ sai, tin nhắc buổi sáng có thể gửi việc duyệt cho quản trị thay vì trưởng phòng hay trưởng bộ phận, và hai nơi có thể nêu hai người duyệt khác nhau.
  file: `packages/db/src/okr-duyet.ts`
  severity: low
  Đề xuất: known-limits

- **Program health drops KRs of objectives waiting for approval from the 'not published yet' count**
  Người dùng thấy gì: Khi bật duyệt và một trưởng phòng gửi mục tiêu đi duyệt, số «chưa công bố» ở Sức khoẻ chương trình giảm xuống dù chưa có gì được công bố, làm người xem tưởng tiến độ tốt hơn thực tế.
  file: `apps/api/src/okr/okr-xem.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Setting an objective to restricted can race with a new alignment into it, breaking the 'restricted has no alignments' rule**
  Người dùng thấy gì: Nếu một người đặt mục tiêu sang giới hạn đúng lúc người khác căn chỉnh vào nó, hiếm khi mục tiêu giới hạn vẫn còn một căn chỉnh trỏ tới. Cần hai thao tác trùng đúng khoảnh khắc nên rất ít gặp.
  file: `apps/api/src/okr/okr-hien-thi.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 (đo một bản chụp cố định thay cho cây đang kiểm): tach-giao-dich ghim vào SHA lịch sử của lần gộp lượt 9b**
  Người dùng thấy gì: Bài kiểm tra canh việc người ta có lỡ xoá bớt các kiểm tra OKR cũ hay không chỉ nhìn vào một lần gộp trong quá khứ, nên về sau nếu ai xoá kiểm tra thì bài này vẫn báo xanh. Người dùng không thấy ngay, nhưng lưới an toàn bị hở.
  file: `apps/api/test/tro-ly-okr-hoan-tac.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (đo «định danh có mặt» thay cho quan hệ «điều kiện nằm trong where»): coDieuKien của soi-ma --ca xem**
  Người dùng thấy gì: Công cụ tự soi có thể coi một truy vấn OKR là đã có điều kiện xem dù điều kiện đặt sai chỗ, nên một chỗ lộ mục tiêu giới hạn về sau có thể lọt qua mà công cụ vẫn báo ổn.
  file: `_acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo thứ runtime không dùng): ma trận 33 ô và kiểm «định nghĩa đúng một lần» nhắm vào xemDuocMucTieu, hàm không đường chạy nào của sản phẩm gọi**
  Người dùng thấy gì: Bảng thử 33 ô kiểm một hàm mô tả luật xem mà sản phẩm không gọi trực tiếp; luật thật chạy ở chỗ khác nhưng đã được đối chiếu với hàm này. Chấp nhận, hậu quả với người dùng gần như không có.
  file: `packages/validation/src/okr-hien-thi.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): kiểm «to-chuc không nhập từ okr» không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm tra canh khu tổ chức không được phụ thuộc vào OKR có thể không bắt được một số cách viết phụ thuộc, nên sau này khu tổ chức có thể dính lại vào OKR mà bài vẫn xanh.
  file: `apps/api/test/okr-tai-co-cau.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
