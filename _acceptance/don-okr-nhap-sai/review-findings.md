# Review findings: don-okr-nhap-sai (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bài dung-lai không kiểm câu trả lời khi tắt lại bước duyệt, nên tắt hỏng sẽ không ai thấy**
  Người dùng thấy gì: Không ảnh hưởng người dùng sản phẩm. Chỉ có một bài kiểm tự động bật bước duyệt công bố rồi tắt lại mà không xác nhận việc tắt có thành công. Nếu việc tắt hỏng, các bài kiểm chạy sau sẽ chạy trên thiết lập sai mà không ai được báo, nên kết quả kiểm có thể sai lặng lẽ.
  file: `apps/api/test/okr-xoa-muc-tieu.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
