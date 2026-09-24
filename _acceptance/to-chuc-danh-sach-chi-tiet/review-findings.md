## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **applyImport hand-writes its input type next to the Zod schema instead of using z.infer**
  Người dùng thấy gì: Nếu sau này có người đổi tên trường trong dữ liệu nhập, một số màn liên quan có thể lặng lẽ chạy sai mà không báo lỗi ngay.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: low
  Đề xuất: wont-fix

- **The newNames shape is declared twice in the contracts instead of as one shared schema**
  Người dùng thấy gì: Nếu một nơi đổi tên trường phòng ban hoặc bộ phận mới tạo, các màn hiển thị kết quả nhập có thể hiển thị sai tên mà không có cảnh báo.
  file: `apps/api/src/to-chuc/to-chuc.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): kết quả applyImport giả ở bước 3 là dữ liệu không thể có, và cột bộ phận trùng với bản xem trước nên không phân biệt được nguồn**
  Người dùng thấy gì: Bài kiểm tự động cho bước xem kết quả nhập có thể vẫn báo đạt dù màn hình đang hiển thị nhầm danh sách bộ phận dự kiến ban đầu thay vì danh sách thực sự đã tạo, nên một lỗi hiển thị sai kiểu này có thể lọt qua mà không ai phát hiện.
  file: `apps/app/test/to-chuc-chi-tiet.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Screen-width hook written locally with a hard-coded breakpoint instead of following the shared hook in packages/ui (r1)**
  Người dùng thấy gì: Nếu sau này có người chỉnh ngưỡng thu nhỏ màn ở một chỗ mà quên chỗ kia, cây thư mục và khung chi tiết có thể đổi cỡ màn hình không cùng lúc với nhau.
  file: `apps/app/app/(app)/[slug]/settings/organization/to-chuc.tsx`
  severity: low
  Đề xuất: known-limits

- **Add-people and attach-departments dialogs let you pick more than 50 items, and the server rejects them (r1)**
  Người dùng thấy gì: Trong một tổ chức lớn, admin có thể tích hơn 50 người hoặc phòng ban rồi bấm xác nhận mà nút vẫn cho bấm, chỉ để nhận một câu lỗi khó hiểu và không có gì được lưu.
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-them-nguoi.tsx`
  severity: medium
  Đề xuất: known-limits

- **workspace.get failure is swallowed, and the root silently falls back to the generic label (r1)**
  Người dùng thấy gì: Nếu việc lấy tên không gian làm việc bị lỗi, tên gốc trên cây tổ chức âm thầm đổi thành «Toàn công ty» mà không có dấu hiệu nào báo có sự cố.
  file: `apps/app/app/(app)/[slug]/settings/organization/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 5 (tuyen quet LOP nhung bo sot): san-thiet-ke.mjs noi quet className tren moi phan tu JSX nhung regex bo qua 15 the thanh phan (r1)**
  Người dùng thấy gì: Một số nút và hộp thoại mới có thể đang phá kiểu dùng chung của hệ thống mà công cụ rà lỗi thiết kế chưa bắt được.
  file: `_acceptance/to-chuc-danh-sach-chi-tiet/rang/san-thiet-ke.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
