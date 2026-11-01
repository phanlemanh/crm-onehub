# Review findings: khung-chung-ngan-ban-ghi (round 3)

## Trong hợp đồng

Không có finding.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lỗi tải của ngăn Số KR không dùng VungTaiLoi, trái luật vừa ghi trong docs/design.md và ngan-ban-ghi.md (r2)**
  Người dùng thấy gì: Khi ngăn Số KR mất kết nối, người dùng vẫn thấy thông báo lỗi và nút Thử lại dùng được. Nút này chỉ khác hình dạng và không có trạng thái đang thử lại so với các ngăn khác.
  Căn cứ: Hậu quả nhẹ: không mất dữ liệu, người dùng bấm Thử lại là xong, chỉ lệch giao diện nhỏ so với ngăn khác nên có thể ghi lại và sửa sau.
  file: `apps/app/components/crm/record-sheet/so-kr-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có finding.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
