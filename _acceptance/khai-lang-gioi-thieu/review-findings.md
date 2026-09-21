# Review Findings: khai-lang-gioi-thieu (round 1)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A jsdom DOM test is named .spec.tsx and sets up jsdom by importing it, so it changes the globals for the whole default apps/app test run**
  Người dùng thấy gì: Nếu các phép kiểm tự động trong ứng dụng chạy sai thứ tự do xung đột này, một lỗi thật trong sản phẩm có thể lọt qua mà không bị phát hiện trước khi phát hành.
  file: `apps/app/test/khai-tieng-metaline.spec.tsx`
  severity: medium
  Đề xuất: known-limits

- **data-slot="timeline" is added with nothing reading it**
  Người dùng thấy gì: Một thuộc tính kỹ thuật thừa được gán nhưng không có gì đọc nó, nên không ảnh hưởng gì tới những gì người dùng thấy hoặc làm được.
  file: `apps/app/components/crm/timeline/timeline.tsx`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
