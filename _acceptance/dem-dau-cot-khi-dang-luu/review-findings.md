## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hình dạng 2 (round-trip chỉ khi được gọi, không có lúc đo): tệp mẫu sau-lưu được rút từ máy chủ thật một lần nhưng không phép đo nào so nó lại với máy chủ**
  Người dùng thấy gì: Nếu sau này cách máy chủ tính số đếm hay tổng tiền của cột đổi khác đi, các bài kiểm tra tự động có thể vẫn báo "đạt" dù số hiển thị trên màn hình đã sai, vì không có bước nào tự đối chiếu lại với dữ liệu máy chủ thật hiện tại.
  file: `apps/api/test/deals-board.spec.ts:175`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có finding nào thuộc diện này.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).