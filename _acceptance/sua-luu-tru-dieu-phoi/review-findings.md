## Trong hợp đồng

Findings: []

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Admin check is done in the router, not the service, which breaks the repo's permission pattern**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay bây giờ — quyền quản trị vẫn được kiểm đúng qua màn hình. Nhưng cách tổ chức khiến một đường gọi khác trong tương lai có rủi ro cao hơn bình thường là bỏ sót bước kiểm tra quyền.
  file: `apps/api/src/onboarding/onboarding.router.ts`
  severity: medium
  Đề xuất: known-limits

- **New invalidation helpers list query keys at the call site instead of going through useCrmCache**
  Người dùng thấy gì: Không ảnh hưởng ngay bây giờ, nhưng nếu sau này thêm một thao tác sửa đổi mới, một vài màn liên quan có thể quên tự làm mới và tạm hiện dữ liệu cũ cho tới khi người dùng tải lại trang.
  file: `apps/app/app/(app)/[slug]/settings/onboarding/lam-moi.ts`
  severity: medium
  Đề xuất: known-limits

- **An archived template can point at a department that is later purged, and then can never be restored**
  Người dùng thấy gì: Trong một chuỗi thao tác hiếm (lưu trữ một khuôn rồi sau đó lưu trữ và xoá vĩnh viễn bộ phận mà khuôn đó dùng), khuôn có thể vĩnh viễn không khôi phục lại được nữa và chỉ còn cách xoá hẳn, dù không ai được cảnh báo trước khi bộ phận bị xoá.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Row types are written by hand next to the Prisma select objects instead of derived with GetPayload**
  Người dùng thấy gì: Không ảnh hưởng người dùng — đây là cách viết mã nội bộ. Nếu sau này thêm một trường dữ liệu mới, nó có thể bị bỏ sót âm thầm trên màn hình mà không báo lỗi ngay.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: low
  Đề xuất: known-limits

- **Permanently deleting a department strands archived templates that still reference it; they can never be restored**
  Người dùng thấy gì: Trong một chuỗi thao tác hiếm (lưu trữ một khuôn rồi lưu trữ, sau đó xoá vĩnh viễn bộ phận nó dùng), khuôn đó có thể vĩnh viễn không khôi phục lại được và chỉ còn cách xoá hẳn, dù người dùng không được cảnh báo trước khi bộ phận bị xoá vĩnh viễn.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 2 (fixture viết tay): E6 đo một thông điệp lỗi tự đặt, không phải thông điệp thật của máy chủ; dòng dùng ONBOARDING.thongDiep chỉ để trang trí**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp — bài đo tự động cho tính năng này có thể báo đạt dù câu thông báo lỗi hiển thị trên màn hình không đúng với câu máy chủ thực sự trả về, nên một lỗi thật ở chỗ đó có thể không bị phát hiện.
  file: `apps/app/test/sua-luu-tru.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): ô «hoàn tác bộ phận/khuôn (b)» của E25 khẳng định «1 lời gọi» mà không có đối chứng rằng cú bấm thứ hai đã xảy ra**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp — bài đo tự động cho nút Hoàn tác có thể chưa thật sự kiểm được trường hợp bấm liên tiếp hai lần, nên một lỗi gọi trùng lặp ở đó có thể không bị phát hiện.
  file: `apps/app/test/sua-luu-tru.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay vì quan hệ): ô at="21/09/2026" của E22 kiểm «thông điệp chứa tên trường» bằng includes("at"), mà điều này đúng với bất kỳ lỗi ngày nào**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp — bài đo tự động có thể báo đạt ngay cả khi thông báo lỗi không thực sự nêu đúng tên trường ngày tháng bị sai.
  file: `apps/api/test/sua-luu-tru.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).