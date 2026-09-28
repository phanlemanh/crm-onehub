## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **khong-cham-thuoc.mjs misses a signed file that is moved out of the forbidden paths because of git rename detection**
  Người dùng thấy gì: Nếu ai đó đổi tên hoặc dời một tệp đã ký ra khỏi vùng cấm thay vì sửa nội dung nó, phép kiểm tra tự động có thể báo "không chạm gì" dù thực ra đã chạm, nên có thể để lọt một thay đổi đáng lẽ phải bị chặn. Đây là khoảng hở của công cụ kiểm dùng chung, không phải lỗi của tính năng đang xét.
  file: `_acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs`
  severity: medium
  Đề xuất: new-contract

- **khong-cham-thuoc.mjs cannot see a signed file that was renamed or moved away**
  Người dùng thấy gì: Nếu một tệp đã ký bị đổi tên hoặc dời đi thay vì sửa trực tiếp, phép kiểm có thể không nhận ra tệp đó đã bị động tới và vẫn báo an toàn. Đây là hạn chế của công cụ kiểm dùng chung, không riêng cho thay đổi lần này.
  file: `_acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 — tuyên quét LỚP «không chạm tệp nào» nhưng git diff --name-only bỏ sót đường cũ khi đổi tên**
  Người dùng thấy gì: Nếu sau này có người đổi tên hoặc dời một tệp đã ký ra khỏi vùng được bảo vệ thay vì sửa nội dung, phép kiểm tự động có thể không phát hiện ra và vẫn báo mọi thứ an toàn. Đây là khoảng hở của công cụ kiểm dùng chung cho nhiều tính năng, không phải hậu quả của thay đổi lần này.
  file: `_acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
