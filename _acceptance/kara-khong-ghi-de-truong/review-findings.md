# Review findings: kara-khong-ghi-de-truong (round 1)

## Trong hợp đồng

(không có finding)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (assertion âm tính đứng một mình, không ghim thông điệp): ba ô replace=false của ma trận kgd-nen không phân biệt được luật phiên nền**
  Người dùng thấy gì: Hành vi cho người dùng vẫn đúng: Kara chạy nền không ghi đè giá trị người bán hàng đã gõ. Chỉ là bài kiểm tự động chưa phân biệt đủ rõ lý do từ chối ở ba trường hợp, nên nếu sau này ai đó lỡ làm hỏng luật riêng cho chạy nền thì ba trường hợp đó có thể không báo đỏ.
  Căn cứ: Người dùng không bị ảnh hưởng ngay vì giá trị vẫn được giữ nguyên, ba trường hợp còn lại của ma trận vẫn bắt được lỗi, và việc ghim thêm lý do vào bài kiểm có thể làm sau với chi phí thấp.
  file: `apps/agent/test/kara-khong-ghi-de-truong.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

