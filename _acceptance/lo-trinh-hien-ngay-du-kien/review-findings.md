# Review findings: lo-trinh-hien-ngay-du-kien (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Test helper hand-writes the gio_may shape beside its Zod schema and casts JSON.parse to that type without parsing (r1)**
  Người dùng thấy gì: Không ảnh hưởng trang người dùng thấy. Nếu bộ công cụ đổi hình khối dữ liệu, các bài kiểm sẽ đỏ ở chỗ khó hiểu nguyên nhân hơn mức cần, nên người sửa mất thời gian dò.
  Căn cứ: Chỉ ảnh hưởng người viết bài kiểm, không làm mất hay sai dữ liệu của người dùng; lỗi nếu có sẽ hiện đỏ chứ không im lặng, và sửa sau vẫn rẻ.
  file: `apps/app/test/lo-trinh-du-kien-mau.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
