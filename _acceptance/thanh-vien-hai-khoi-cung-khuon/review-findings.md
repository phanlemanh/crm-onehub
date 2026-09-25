## Trong hợp đồng

(không có phát hiện nào round này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 3 + 5: E19 chỉ kiểm «có lời gọi .workspace(» ở mỗi tệp, còn lời hứa là mỗi thao tác trong ba thao tác thành công đều làm mới qua lối chung**
  Người dùng thấy gì: Phép kiểm tự động hiện tại có thể không phát hiện nếu sau này riêng thao tác 'phát liên kết' ngừng làm mới danh sách — trong trường hợp đó người dùng phải tự tải lại trang mới thấy đúng trạng thái.
  file: `_acceptance/thanh-vien-hai-khoi-cung-khuon/rang/lam-moi.mjs`
  severity: medium
  Đề xuất: known-limits

- **quyenQuanTri() silently turns a workspace.get failure into 'no permission', removing the only 'Allow an address' button for admins (r1)**
  Người dùng thấy gì: Nếu việc kiểm tra quyền quản trị của trang gặp trục trặc tạm thời (ví dụ mạng chập chờn), nút 'Cho phép một địa chỉ' có thể biến mất khỏi đầu trang cho tới khi người dùng tải lại trang.
  file: `apps/app/app/(app)/[slug]/settings/members/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): E17 soi-ma thiếu đối chứng dương mà eval đã khai (r1)**
  Người dùng thấy gì: Phép đo tự động kiểm tra 'không có lớp CSS bị cấm' trong giao diện Thành viên hiện không có ca thử để chứng minh nó thực sự bắt được vi phạm, nên một lỗi tương tự trong tương lai có thể lọt qua mà phép đo vẫn báo đạt.
  file: `_acceptance/thanh-vien-hai-khoi-cung-khuon/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 (assertion âm tính đứng một mình): «mot-o-tim» chỉ đếm ô tìm có đúng placeholder t.bang.tim, không thấy được DataTable thứ hai (r1)**
  Người dùng thấy gì: Phép đo tự động cho tiêu chí 'trang chỉ có một ô tìm kiếm' không nhận ra một ô tìm kiếm thứ hai nếu nó mang nhãn khác với khối trên, nên lỗi dạng đó có thể lọt qua mà phép đo vẫn báo đạt.
  file: `_acceptance/thanh-vien-hai-khoi-cung-khuon/rang/do-khoi.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): «mỗi hàng có Phát liên kết / nút …» chỉ đo 15 hàng gieo (r1)**
  Người dùng thấy gì: Phép đo tự động cho tiêu chí 'mỗi hàng có nút Phát liên kết và nút …' chỉ kiểm tra trên các hàng dữ liệu thử được gieo thêm, bỏ sót các hàng có sẵn từng phát liên kết trước đó, nên một lỗi chỉ xảy ra ở dạng hàng đó có thể không bị phát hiện.
  file: `_acceptance/thanh-vien-hai-khoi-cung-khuon/rang/do-khoi.mjs`
  severity: low
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)

(không có mục nào round này)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
