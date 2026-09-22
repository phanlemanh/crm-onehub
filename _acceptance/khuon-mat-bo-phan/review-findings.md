## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New purge-block message sends the user to an action that can fail when the template already has plans**
  Người dùng thấy gì: The error message when you try to delete an archived department may point you to delete its template, but if that template already has a plan, deleting it will also fail, leaving you without a working next step from the message alone.
  file: `apps/api/src/onboarding/onboarding-config.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không ghim mã/thông điệp): E4 chỉ kiểm 'status !== 200' cho ba ca bị từ chối, trong khi evals ghi false/400**
  Người dùng thấy gì: The automated test that checks a rejected delete on a department still referenced by an archived plan only confirms the request failed, not that it failed with the right error code or message, so a future regression in that specific rejection could go undetected by this test.
  file: `apps/api/test/khuon-mat-bo-phan.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).