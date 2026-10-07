# Review findings: so-moi-khong-chap-chon (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Rang không dọn bản sao sót của lượt trước như evals.yaml E2 đã hứa**
  Người dùng thấy gì: Nếu một lượt kiểm bị ngắt giữa chừng, thư mục tạm của nó sẽ nằm lại trên máy và không lượt sau nào dọn. Chỉ tốn chỗ trên đĩa, không làm sai kết quả của bất kỳ lượt kiểm nào.
  file: `_acceptance/so-moi-khong-chap-chon/rang/va-cham.mjs`
  severity: low
  Đề xuất: wont-fix

- **Lỗi hạ tầng không thuộc KhongDo bị ném lại và thoát mã 1, lẫn với mã «bài đỏ»**
  Người dùng thấy gì: Khi máy gặp sự cố môi trường lúc chạy phép thử, kết quả có thể hiện là «không đạt» thay vì «không đo được». Người duyệt có thể tưởng bài kiểm viết sai trong khi thật ra là máy lỗi, và chỉ chạy lại mới phân biệt được.
  file: `_acceptance/so-moi-khong-chap-chon/rang/va-cham.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

