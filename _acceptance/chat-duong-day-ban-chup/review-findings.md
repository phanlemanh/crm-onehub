# Review findings: chat-duong-day-ban-chup (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Test counts every division in the shared test database while other packages create divisions in parallel**
  Người dùng thấy gì: Một bài kiểm tra tự động có thể báo đỏ nhầm khi chạy cùng lúc với bài của gói khác, dù chức năng vẫn đúng. Người dùng cuối không bị ảnh hưởng, chỉ có thể phải chạy lại kiểm tra.
  file: `apps/api/test/tran-than-rest.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Push script imports from the API app's source to get the REST prefix**
  Người dùng thấy gì: Kịch bản đẩy bản chụp lộ trình đang lấy một phần địa chỉ từ mã của máy chủ thay vì từ nơi dùng chung. Hiện vẫn đẩy đúng, chỉ là sau này sửa mã máy chủ có thể kéo theo kịch bản.
  file: `scripts/ban-chup-lo-trinh/day.ts`
  severity: low
  Đề xuất: known-limits

- **How the bridge picks the 2 MB limit does not match how the library finds the procedure, so a trailing slash or different letter case sends a real snapshot to the 100 KB limit**
  Người dùng thấy gì: Nếu ai đó gọi đường đẩy bản chụp bằng địa chỉ có thêm dấu gạch cuối hoặc viết hoa khác, bản chụp thật sẽ bị báo quá lớn dù không lớn. Kịch bản đẩy chính thức luôn dùng đúng địa chỉ nên không dính, chỉ người gọi tay mới gặp.
  file: `apps/api/src/create-app.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): kiểm «không có Division nào được tạo» bằng một thân không thể tạo Division**
  Người dùng thấy gì: Một bài kiểm tra khẳng định chưa có bản ghi nào bị tạo, nhưng yêu cầu gửi đi vốn không thể tạo gì nên bài này không bắt được lỗi. Việc từ chối yêu cầu quá lớn vẫn được các kiểm tra khác chứng minh.
  file: `apps/api/test/tran-than-rest.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
