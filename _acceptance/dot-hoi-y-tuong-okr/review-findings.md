# Review findings — dot-hoi-y-tuong-okr (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Người chọn vẫn bấm được «Tôi cũng nghĩ vậy»: máy chủ thiếu lần kiểm, màn tự suy quyền bấm**
  Người dùng thấy gì: Người được chọn để kết luận vẫn có thể bấm «Tôi cũng nghĩ vậy» vào những ý mà chính họ sắp gom và quyết định. Việc này làm số lượt đồng ý của từng chủ đề cao hơn thực tế, nên bằng chứng người chọn dựa vào để kết luận có thể bị lệch.
  file: `apps/api/src/okr/okr-hoi-y.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Shape 4 (the test only checks that something did NOT happen): the scrollspy «gỡ khỏi cây thì bấm không cuộn nữa» case passes whether or not the click listener is removed on unmount**
  Người dùng thấy gì: Một bài kiểm tra tự động cho mục lục chủ đề có thể vẫn xanh dù phần dọn dẹp khi rời trang bị xoá mất. Người dùng không thấy gì ngay, nhưng nếu sau này ai đó làm hỏng phần dọn dẹp đó thì bộ kiểm tra sẽ không báo.
  file: `packages/ui/test/scrollspy.dom.tsx`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
