## Trong hợp đồng

Không có phát hiện nào ánh xạ được vào AC trong vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E4 đo hàm nhãn phụ nanRail/nhanCaiDat mà hai thanh điều hướng không hề gọi**
  Người dùng thấy gì: Nhãn hai mục điều hướng hiện đúng, nhưng nếu sau này có người đổi nguồn chữ hiển thị mà quên đồng bộ, người dùng có thể thấy nhãn sai trong khi phép kiểm tra tự động vẫn báo xanh.
  file: `apps/app/test/cai-dat-dieu-huong.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
