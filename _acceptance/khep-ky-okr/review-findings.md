## Trong hợp đồng

_Không có finding nào ánh xạ được vào một AC cụ thể trong vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **mangSang checks the target cycle's phase before taking the lock and never checks it again**
  Người dùng thấy gì: Nếu một quản trị viên đổi giai đoạn của kỳ đích đúng lúc một người khác đang mang mục tiêu dở sang, mục tiêu đó có thể bị ghi vào một kỳ đã sang giai đoạn chấm điểm hoặc đã đóng mà không ai kiểm lại được.
  file: `apps/api/src/okr/okr-khep.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Carry-over rules and the scoring-phase set are copied between screen and server instead of living in @crm/validation/okr-khep**
  Người dùng thấy gì: Vì luật xác định mục tiêu nào được mang sang và kỳ nào tính là kỳ kế được viết trùng lặp ở hai nơi, hộp thoại xem trước mang sang có thể hiện gợi ý khác với những gì hệ thống thực sự ghi lại.
  file: `apps/app/app/(app)/[slug]/okr/hop-thoai-mang-sang.tsx`
  severity: low
  Đề xuất: known-limits

- **A review window scheduled to start later can't be closed, and the menu offers to open another one**
  Người dùng thấy gì: Nếu quản trị viên mở một đợt rà giữa kỳ có ngày bắt đầu ở tương lai, đợt đó không hiện nút Đóng rà cho tới đúng ngày bắt đầu, và không mở được đợt rà khác để thay thế trong lúc chờ.
  file: `apps/app/app/(app)/[slug]/settings/okr/bang-chu-ky.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình, không ghim thông điệp): ba ca từ chối có `cau: ""` nên phép so thông điệp luôn đúng**
  Người dùng thấy gì: Một số ca kiểm thử ghi là đã xác nhận đúng thông báo từ chối, nhưng thực chất không kiểm tra nội dung thông báo đó — nếu sau này thông báo bị đổi sai, bộ kiểm thử sẽ không phát hiện được.
  file: `apps/api/test/okr-khep.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình, không đối chứng dương): bài DOM «kỳ đã đóng chỉ đọc» chỉ đếm vắng mặt**
  Người dùng thấy gì: Bài kiểm thử cho màn hình chấm điểm của kỳ đã đóng chỉ kiểm rằng các nút bấm bị ẩn, chứ không xác nhận màn hình vẫn hiện đúng dữ liệu chỉ đọc — nếu màn hình vô tình hiện trống, bài kiểm thử vẫn báo đạt.
  file: `apps/app/test/okr-khep-cham.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): bài «hàm thuần» là grep chuỗi phủ định, không có đối chứng, và không phải AST như evals.yaml mô tả**
  Người dùng thấy gì: Lời hứa rằng hàm kiểm luật không đụng tới cơ sở dữ liệu hay mạng được kiểm bằng cách tìm chuỗi chữ trong mã nguồn, không phải phân tích cấu trúc mã thật — một cách viết né được cách tìm này có thể lọt qua mà không bị phát hiện.
  file: `packages/validation/test/okr-kiem.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): bài biến thể ViewSwitch so chuỗi className thay vì khổ nào hiện lối nào**
  Người dùng thấy gì: Bài kiểm thử cho việc chuyển nút bấm và danh sách thả xuống theo kích thước màn hình chỉ so tên lớp CSS, không so việc phần nào thực sự hiện ra; phần đó đã được đo đúng ở nơi khác bằng phép đo màn hình thật, nên rủi ro chỉ nằm ở tầng kiểm thử đơn vị này.
  file: `packages/ui/test/khep-ky-bien-the.dom.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).