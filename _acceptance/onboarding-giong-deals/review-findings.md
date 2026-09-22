## Trong hợp đồng

### Table view hides a failed refetch when the list already has data
- file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx:307`
- severity: medium
- AC: AC-6
- detail: The change removed the early `if (danhMuc.isError) return <Empty…>` and now passes the error view only through `empty={loiView ?? …}`. DataTable draws `empty` only when `deferredRows.length === 0` (packages/ui/src/components/data-table.tsx:601-604). When a refetch of the same query key fails, TanStack Query keeps the old `data` and sets `isError=true`. This happens on window focus, on the invalidation after 'Kế hoạch mới', or on a background refetch. In that case `rows={data?.rows ?? []}` is not empty, so loiView is built and then thrown away, and `loading` is false. The user sees stale rows with no error, no retry button and no sign of failure. The error is silently lost. The early returns for `data?.trangThai === 'ST-danhmuc-empty'` and `'ST-danhmuc-chuacokhuon'` run before loiView is even checked, so they hide the same failure when the cached state is one of those. The board view (bang-cot) is not affected: it checks `loiView ?` before anything else, so the two views now behave differently for the same failed query. Fix: in table view, show the error whenever `danhMuc.isError` is true, not only when there are no rows. For example, render loiView above the table, or pass `rows=[]` while there is an error. Also check `isError` before the two empty-state early returns.
- source: bugs
- rationale: AC-6 hứa khi tải danh sách hỏng thì lỗi và nút Thử lại phải hiện trong vùng bảng, không kèm điều kiện phải chưa có dữ liệu cũ; finding cho thấy điều này không xảy ra khi refetch hỏng mà bảng đã có hàng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **When there are no plans yet, the screen shows two filled primary buttons for the same create action**
  Người dùng thấy gì: Khi chưa có kế hoạch nào, màn hình hiện cùng lúc hai nút xanh nổi bật để tạo kế hoạch, dễ khiến người dùng phân vân nên bấm nút nào.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): khung trang tự bọc nút tạo trong page-shell-actions nên kiểm tra «nút ở đầu trang» luôn đúng**
  Người dùng thấy gì: Bài kiểm tự động cho vị trí nút không chạy qua đúng trang thật, nên nếu sau này nút bị đặt sai chỗ, phép đo này vẫn báo xanh và lỗi có thể lọt ra ngoài mà không ai phát hiện kịp.
  file: `apps/app/test/onboarding-giong-deals.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): noi-bon-nut `nut-tren-thanh-cong-cu` khẳng định «dau trang=true» trên div do chính test dựng**
  Người dùng thấy gì: Bài kiểm tự động cho việc «nút Kế hoạch mới nằm ở đầu trang» có thể luôn báo đạt dù trang thật lỡ đặt sai vị trí sau này, vì bài kiểm tự dựng khối để đo trên chính nó thay vì đo trang thật — nghĩa là nếu vị trí nút bị đổi nhầm trong một lần sửa sau, bài kiểm này sẽ không bắt được.
  file: `apps/app/test/noi-bon-nut.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).