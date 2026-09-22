## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New plan and transfer queries are invalidated by key lists at the call site, not through useCrmCache (docs/api.md, Freshness)**
  Người dùng thấy gì: Sau khi một bước được đánh dấu xong hoặc một người bị chuyển việc, một số màn khác (tab 30 ngày đầu ở sheet Công ty, mục 30 ngày đầu ở sheet Cá nhân, thẻ Tasks) có thể tạm thời còn hiện dữ liệu cũ cho tới khi người dùng tải lại trang.
  file: `apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx`
  severity: high
  Đề xuất: known-limits

- **Admin check copied into onboarding-ghi.ts instead of using the existing OnboardingService.yeuCauQuanTri at the router**
  Người dùng thấy gì: Hiện tại người dùng không bị ảnh hưởng gì; nhưng nếu sau này quy tắc ai được phép chuyển việc 30 ngày thay đổi, có nguy cơ chỉ một trong hai chỗ kiểm tra được sửa, khiến người không phải quản trị vẫn lọt vào dùng được chức năng này.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **New injectable OnboardingNoi runs Prisma queries in a file that is not *.service.ts**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng ngay bây giờ; đây chỉ là cách tổ chức mã nguồn nội bộ chưa theo đúng quy ước đặt tên của kho, có thể gây khó tìm mã sau này.
  file: `apps/api/src/onboarding/onboarding-noi.ts`
  severity: low
  Đề xuất: known-limits

- **After a 30-day handover, several caches still show the old owner and assignee**
  Người dùng thấy gì: Sau khi chuyển việc 30 ngày của một người cho người khác, một số màn (chi tiết kế hoạch, tab 30 ngày đầu của công ty, thẻ Tasks) có thể tạm thời vẫn hiện tên người cũ cho tới khi tải lại trang.
  file: `apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (checks that a string appears when the promise is a relation): the S2 row links are found by their text, but where they open is never checked**
  Người dùng thấy gì: Nếu dòng bước trong tab 30 ngày đầu vô tình dẫn sang nhầm công ty hoặc nhầm kế hoạch, phép kiểm hiện tại vẫn có thể báo đạt, nên lỗi bấm nhầm chỗ đó có thể lọt ra ngoài mà không ai phát hiện.
  file: `apps/app/test/moi-phia-ke-hoach.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (checks that a string appears when the promise is a relation): the open pipeline value is only matched with /\d/, not tied to amountCents**
  Người dùng thấy gì: Nếu số tiền của thoả thuận đang mở hiển thị sai đơn vị hoặc sai giá trị, phép kiểm hiện tại vẫn có thể báo đạt, nên một lỗi hiển thị tiền có thể lọt ra sản phẩm mà không bị phát hiện.
  file: `apps/app/test/moi-phia-ke-hoach.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (checks that a string appears when the promise is a relation): the tab label is checked with toContain("2"), and the fixture cannot tell soKeHoach apart from the row count**
  Người dùng thấy gì: Nếu số trên nhãn tab «30 ngày đầu» không đúng bằng số dòng thực tế trong bảng (ví dụ hiện một số khác có chứa chữ số 2), phép kiểm hiện tại vẫn có thể báo đạt, nên lỗi đó có thể không bị phát hiện.
  file: `apps/app/test/moi-phia-ke-hoach.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture): the chuyenGiao/xemTruoc payloads rebuild their keys by hand on both sides instead of spreading the fixture**
  Người dùng thấy gì: Nếu dữ liệu chuyển việc giữa giao diện và máy chủ thiếu hoặc thừa một trường so với đúng khuôn đã định, phép kiểm hiện tại có thể vẫn báo đạt vì cả hai phía tự dựng lại dữ liệu mẫu riêng, nên sai lệch đó có thể lọt ra ngoài mà không bị phát hiện.
  file: `apps/api/test/moi-phia-ke-hoach.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion): the 403 case pins only the status, not the canQuyenQuanTri message the eval promises**
  Người dùng thấy gì: Khi một người không phải quản trị gọi chuyển việc 30 ngày, phép kiểm hiện chỉ chắc chắn về mã lỗi 403 chứ chưa chắc chắn về đúng nội dung thông báo bị từ chối, nên một lỗi cấm quyền khác không liên quan vẫn có thể lọt qua mà không bị phát hiện.
  file: `apps/api/test/moi-phia-ke-hoach.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
