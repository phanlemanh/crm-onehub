# Review findings: danh-sach-keo-chung (round 2)

## Trong hợp đồng

Không có phát hiện nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bấm lại Hoàn tác sau khi khôi phục lỗi không làm được trên sonner thật: toast đóng ngay lần bấm đầu**
  Người dùng thấy gì: Nếu bấm Hoàn tác sau khi lưu trữ một giai đoạn mà việc khôi phục bị lỗi (ví dụ mất mạng), thông báo biến mất ngay và người dùng chỉ thấy báo lỗi, không bấm Hoàn tác lại được. Không mất dữ liệu: giai đoạn vẫn nằm ở mục Đã lưu trữ và khôi phục được từ đó.
  file: `apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx`
  severity: medium
  Đề xuất: known-limits

- **An Undo from an earlier reorder toast is not blocked while a save is running, and restores an old snapshot (r1)**
  Người dùng thấy gì: Nếu người dùng kéo hai lần liên tiếp rồi bấm Hoàn tác ở thông báo của lần kéo đầu, thứ tự cuối cùng trên máy chủ có thể không khớp với những gì màn hình hiện, hoặc lần kéo thứ hai bị lùi theo.
  file: `packages/ui/src/components/sortable-list.tsx`
  severity: medium
  Đề xuất: known-limits

- **A failed load of archived stages is silently hidden (r1)**
  Người dùng thấy gì: Nếu việc tải danh sách giai đoạn đã lưu trữ bị lỗi, mục «Đã lưu trữ» biến mất mà không có thông báo hay nút thử lại. Quản trị viên sẽ tưởng không có giai đoạn nào để khôi phục.
  file: `apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx`
  severity: low
  Đề xuất: new-contract

- **Undo of an archive reports failure after the stage was already restored, and can silently undo a later reorder (r1)**
  Người dùng thấy gì: Nếu giữa lúc lưu trữ và lúc bấm Hoàn tác có người thêm giai đoạn mới cùng nhóm, giai đoạn vẫn được khôi phục nhưng màn hình báo lỗi. Nếu người dùng đã tự sắp lại nhóm trước đó, Hoàn tác có thể âm thầm ghi đè thứ tự mới bằng thứ tự cũ.
  file: `apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx`
  severity: medium
  Đề xuất: known-limits

- **An error loading the archived stages hides the «Archived» section with no message (r1)**
  Người dùng thấy gì: Khi danh sách đã lưu trữ tải lỗi, mục «Đã lưu trữ» không hiện, trong khi các thông báo lưu trữ vẫn bảo người dùng tìm giai đoạn ở đó. Người dùng không biết là lỗi tải hay thật sự không có gì.
  file: `apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
