## Trong hợp đồng

Không có phát hiện nào ánh xạ được vào AC — cả 10 eval (E1–E10) đều xanh đúng như hợp đồng đòi hỏi, không có lệch hành vi nào cần ghi ở mục này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hinh dang 2 (fixture viet tay dung khuon ben doc, khong round-trip qua writer): E3 noi 'round-trip qua writer that' nhung khong goi writer nao**
  Người dùng thấy gì: Ghi chu mo ta trong bo danh gia tu dong noi phep do co kiem tra qua duong ghi du lieu that cua san pham, nhung thuc te phep do do chi kiem tra phan doc du lieu dau vao. Neu sau nay duong ghi du lieu doi cach tinh ngay, nguoi dung co the khong duoc canh bao kip thoi vi phep do nay se khong phat hien ra.
  file: `_acceptance/ngay-gieo-theo-gio-vn/evals.yaml`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).