## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **do-bang.mjs: pixel tolerance hardcoded as 2 inside the browser checks instead of using LECH_PX; other thresholds written inline**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng gì — đây chỉ là cách viết bên trong công cụ đo tự động, không phải thứ họ nhìn thấy hay bấm vào trên trang Thành viên.
  file: `_acceptance/bang-thanh-vien-giu-hang/rang/do-bang.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 (đo vật thay thế, không đo đầu ra): vế «cao từ 16px» của E5/AC-5 đo cái div bọc có đệm py-8, không đo câu chữ, nên không bao giờ đỏ**
  Người dùng thấy gì: Nếu sau này câu "Không ai khớp với bộ lọc này." co lại rất nhỏ, khó đọc trên màn hình, việc đo tự động hiện tại sẽ không phát hiện ra và sẽ vẫn báo đạt.
  file: `_acceptance/bang-thanh-vien-giu-hang/rang/do-bang.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên cả LỚP nhưng chỉ đo một điểm): AC-6 hứa «cách xếp lấp đầy của bảy trang không đổi» nhưng E6 chỉ đo trang Khoá API**
  Người dùng thấy gì: Sáu trang cài đặt khác dùng cùng kiểu bảng (SSO, Liên hệ, Thoả thuận, Công ty, Chiến dịch, Danh mục onboarding) chưa được kiểm tự động là có lấp đầy khung trang hay không; nếu một trong số đó lệch, sẽ không bị bắt cho tới khi có người nhìn thấy trực tiếp.
  file: `_acceptance/bang-thanh-vien-giu-hang/evals.yaml`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
