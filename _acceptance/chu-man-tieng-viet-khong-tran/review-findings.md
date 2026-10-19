## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chờ cứng cho(400) sau scrollIntoView thay vì chờ theo điều kiện, số chờ viết thẳng trong code**
  Người dùng thấy gì: Công cụ chụp màn hình dùng để kiểm tra có một chỗ chờ cố định 400 mili giây, nên thỉnh thoảng có thể chụp hơi sớm hoặc chậm. Nó không ảnh hưởng gì tới người dùng cuối, chỉ có thể làm lần kiểm tra thỉnh thoảng chập chờn.
  file: `_acceptance/chu-man-tieng-viet-khong-tran/rang/chup-truong.mjs`
  severity: low
  Đề xuất: wont-fix

- **Badge nhãn kiểu vẫn bị chỉnh kích thước bằng className ngay chỗ gọi, không thành biến thể trong packages/ui (r1)**
  Người dùng thấy gì: Ô nhãn kiểu ở danh sách trường vẫn được chỉnh độ rộng ngay tại chỗ dùng thay vì là kiểu dựng sẵn của bộ giao diện chung. Người dùng không thấy khác biệt, chỉ là sau này đổi kiểu nhãn sẽ phải sửa nhiều chỗ hơn.
  file: `apps/app/components/crm/fields/fields-list.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
