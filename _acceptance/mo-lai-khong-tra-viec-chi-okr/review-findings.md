# Review findings: mo-lai-khong-tra-viec-chi-okr (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Điều kiện nhận việc bị dựng lại ở chỗ thứ hai (docNguoiNhan) thay vì dùng chung với kiemNguoiNhanViec**
  Người dùng thấy gì: Quy tắc ai được nhận việc đang viết ở hai chỗ trong mã. Hôm nay hai chỗ cho kết quả giống nhau nên người dùng không thấy gì sai. Nếu sau này chỉ sửa một chỗ, mở lại kế hoạch có thể cho phép hoặc từ chối khác với giao bước.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: low
  Đề xuất: known-limits

- **E8 hứa kiểm «tệp thật không đổi (git diff --quiet)» nhưng dot-bien.mjs không hề chạy phép kiểm đó**
  Người dùng thấy gì: Bài kiểm tự động hứa sẽ xác nhận mã thật không bị đụng tới khi thử phá, nhưng thực ra không chạy bước xác nhận đó. Người dùng không bị ảnh hưởng. Chỉ là về sau nếu cách thử phá đổi sang sửa tại chỗ thì bài kiểm vẫn báo đạt dù mã đã bị đổi.
  file: `_acceptance/mo-lai-khong-tra-viec-chi-okr/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
