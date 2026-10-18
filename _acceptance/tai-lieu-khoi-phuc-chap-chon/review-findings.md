# Review findings: tai-lieu-khoi-phuc-chap-chon

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ca tlkp-dem ghi sự kiện KHOI_PHUC bằng db.taiLieuSuKien.create thay vì đi qua ghiSuKien**
  Người dùng thấy gì: Một bài kiểm nội bộ tạo dữ liệu mẫu theo lối đơn giản hơn đường ghi thật của Kho tài liệu. Người dùng không bị ảnh hưởng gì, kết quả đo vẫn đúng; chỉ có chút rủi ro bài kiểm lệch nếu sau này đổi cách ghi.
  file: `apps/api/test/tai-lieu-luu-tru.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3: kiểm thứ tự chuỗi xuất hiện, trong khi lời hứa là quan hệ giữa tập id chụp trước khi duyệt và tập id được đưa vào suKienMoi**
  Người dùng thấy gì: Công cụ tự canh chừng bài kiểm Kho tài liệu chưa bắt được vài kiểu viết sai hiếm gặp, nên sau này ai đó có thể làm bài kiểm đếm sai mà không bị báo. Hôm nay hai bài kiểm đó đang đúng và không ảnh hưởng người dùng.
  file: `apps/api/test/tai-lieu-luu-tru.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: AC-4 nói quét cả lớp «hàm đếm theo mốc», nhưng phép quét chỉ bắt đúng tên suKienSau và đúng dạng Date.now() -**
  Người dùng thấy gì: Công cụ canh chừng chỉ nhận ra hai kiểu đếm theo giờ đã biết, nên nếu ai viết lại theo kiểu khác thì lỗi đỏ ngẫu nhiên có thể quay lại mà không bị chặn sớm. Người dùng sản phẩm không bị ảnh hưởng.
  file: `apps/api/test/tai-lieu-luu-tru.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
