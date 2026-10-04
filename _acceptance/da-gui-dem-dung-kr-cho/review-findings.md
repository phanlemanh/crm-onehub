# Review findings: da-gui-dem-dung-kr-cho (round 1)

## Trong hợp đồng

Không có phát hiện nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **PRODUCT-MAP.md and LO-TRINH.html not redrawn after Gate 1 signature of the new dossier; the acceptance CI check fails at HEAD**
  Người dùng thấy gì: Bản đồ sản phẩm và trang lộ trình chưa được vẽ lại sau khi hồ sơ này được ký, nên kiểm tra nghiệm thu của công ty sẽ báo đỏ cho tới khi ai đó vẽ lại hai tệp đó. Người dùng cuối không thấy ảnh hưởng gì.
  file: `_acceptance/da-gui-dem-dung-kr-cho/card.html`
  severity: high
  Đề xuất: known-limits

- **The «Đã gửi N» title column cannot fail on its own: the test fixes the shared mock so `written` always equals the number of items sent**
  Người dùng thấy gì: Bài kiểm tra con số «Đã gửi N cập nhật» thực chất chỉ lặp lại số KR vừa gửi, nên nếu màn hiện sai con số này mà vẫn gửi đúng KR thì bài kiểm tra có thể không phát hiện. Màn hình đang chạy cho người dùng vẫn hiện đúng.
  file: `apps/app/test/okr-cap-nhat-tuan.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): cột «tiêu đề Đã gửi N» chỉ đo lại phần mock tự trả về**
  Người dùng thấy gì: Một phần các khẳng định về con số «Đã gửi N» trong bài kiểm tra chỉ so lại số do chính bài kiểm tra giả lập, nên có ít sức chứng minh hơn con số 18 khẳng định gợi ý. Người dùng không bị ảnh hưởng.
  file: `apps/app/test/okr-cap-nhat-tuan.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
