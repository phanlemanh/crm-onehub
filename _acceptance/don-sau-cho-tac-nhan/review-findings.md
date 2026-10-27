# Review findings: don-sau-cho-tac-nhan (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): BUOC_VAT và DANG_GHI chép tay hằng số của màn chat thay vì lấy từ chính nơi ghi**
  Người dùng thấy gì: Bài kiểm nội dung thẻ «Đang dựng» dùng tên tệp viết sẵn thay vì lấy từ màn chat. Nếu sau này màn chat đổi tên hay thứ tự tệp, bài này vẫn xanh dù thẻ trên màn có thể hiện khác.
  Căn cứ: Hậu quả nhẹ và không mất dữ liệu: bài kiểm thẻ qua màn chat thật ở nhánh khác vẫn bắt được lệch này, và sửa sau cũng rẻ.
  file: `apps/app/test/the-dang-dung.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): nhánh CardFooter của lechLop không có ca đối chứng đỏ**
  Người dùng thấy gì: Phần kiểm khoảng cách của chân thẻ chưa từng được thử cho thấy nó biết báo đỏ khi bị lệch. Người dùng không thấy gì khác trên màn; rủi ro chỉ là một lần lệch sau này lọt qua bài kiểm này.
  Căn cứ: Hậu quả rất nhẹ với người dùng, vì một bài kiểm khác đã bắt lỗi cùng loại và nhánh kia viết cùng khuôn, nên không đáng mở thêm việc.
  file: `packages/ui/test/the-dang-dung.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
