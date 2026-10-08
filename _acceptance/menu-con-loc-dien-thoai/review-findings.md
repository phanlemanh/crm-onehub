# Review findings: menu-con-loc-dien-thoai (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **cong-ty-375 dùng sleep 800 ms và đếm mọi command-item, nên «còn >= 1 mục công ty» có thể xanh nhờ danh sách cũ**
  Người dùng thấy gì: Phép kiểm trên điện thoại cho ô tìm Công ty có thể báo đạt dù danh sách vừa lọc chưa kịp cập nhật, nên nó chưa chứng minh được là gõ tên công ty thì ra đúng công ty đó. Menu vẫn mở trọn trong màn và gõ vào ô vẫn hiện chữ.
  file: `_acceptance/menu-con-loc-dien-thoai/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **--tu-thu của khong-cham-noi-goi không còn dùng diff giả như E7 hứa; bộ đọc hunk của lượt thật không có ca tự thử**
  Người dùng thấy gì: Công cụ canh việc không ai chỉnh vị trí menu con ở nơi gọi có phần tự thử không còn đi qua đường đọc thay đổi thật. Nếu phần đọc đó hỏng, công cụ vẫn báo sạch trong khi có thể có chỗ chỉnh lọt qua.
  file: `_acceptance/menu-con-loc-dien-thoai/rang/khong-cham-noi-goi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Răng bỏ nhánh «dòng thêm chứa DropdownMenuSubContent» mà E7 vẫn hứa**
  Người dùng thấy gì: Công cụ canh nơi gọi menu con hiện chỉ bắt chỗ chỉnh vị trí nằm ngay trong thẻ menu con. Một cách viết vòng như đổi tên khi nhập hoặc gói qua biến có thể không bị bắt, nhưng hiện chưa có chỗ nào làm vậy.
  file: `_acceptance/menu-con-loc-dien-thoai/rang/khong-cham-noi-goi.mjs`
  severity: low
  Đề xuất: known-limits

- **The E7 guard stopped counting added lines that contain "DropdownMenuSubContent" but sit outside a tag, which the contract still requires**
  Người dùng thấy gì: Ai đó có thể đổi tên menu con khi nhập vào rồi chỉnh vị trí ở nơi gọi mà công cụ canh không phát hiện. Hiện chưa có nơi gọi nào làm vậy, nên người dùng chưa thấy ảnh hưởng.
  file: `_acceptance/menu-con-loc-dien-thoai/rang/khong-cham-noi-goi.mjs`
  severity: medium
  Đề xuất: known-limits

- **cong-ty-375 counts company items without waiting for the search result, so stale unfiltered options can make it pass**
  Người dùng thấy gì: Phép kiểm ô tìm Công ty trên điện thoại có thể đạt khi danh sách cũ chưa lọc còn hiện. Nó chưa chứng minh được kết quả tìm ra đúng, nhưng menu vẫn nằm gọn trong màn và gõ chữ vẫn hiện.
  file: `_acceptance/menu-con-loc-dien-thoai/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): mẫu tự thử của khong-cham-noi-goi đưa thẳng số dòng, bỏ qua bộ đọc diff**
  Người dùng thấy gì: Phần tự thử của công cụ canh nơi gọi menu con không chạy qua đường đọc thay đổi thật, nên nếu đường đó hỏng thì phần tự thử vẫn xanh và công cụ có thể báo sạch nhầm.
  file: `_acceptance/menu-con-loc-dien-thoai/rang/khong-cham-noi-goi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm tính đứng một mình): lệnh E7 chỉ kiểm «0 dòng thêm», không chạy đối chứng dương --tu-thu**
  Người dùng thấy gì: Khi chạy kiểm tự động, công cụ canh việc không ai chỉnh vị trí menu con chỉ báo «không thấy gì» mà không tự chứng minh là nó còn bắt được lỗi. Nếu công cụ hỏng, kết quả sạch vẫn trông như đạt.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm «có mặt» trong khi lời hứa là quan hệ): đếm mục Công ty sau khi gõ không gắn với chữ vừa gõ**
  Người dùng thấy gì: Phép kiểm ô tìm Công ty chỉ chứng minh có ít nhất một mục hiện ra sau khi gõ, chưa chứng minh mục đó khớp chữ vừa gõ. Việc menu mở gọn trong màn thì vẫn được kiểm đúng.
  file: `_acceptance/menu-con-loc-dien-thoai/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm tính một mình: lệnh E7 chạy khong-cham-noi-goi không kèm --tu-thu (r1)**
  Người dùng thấy gì: Phép kiểm cuối cùng xác nhận không ai tự ý dịch vị trí menu con ở nơi gọi chỉ cho kết quả xanh hoặc đỏ, không tự chứng minh nó còn bắt được lỗi thật. Nếu bộ lọc của nó hỏng lặng lẽ, người duyệt vẫn thấy xanh và có thể tin nhầm.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert «chuỗi có mặt» cho lớp dịch phía trái, trong khi lời hứa là quan hệ dịch theo phần tràn (r1)**
  Người dùng thấy gì: Trên điện thoại, nếu menu cha nằm sát mép phải và menu con bị lật sang trái mà vẫn thiếu chỗ, chưa có phép đo nào xác nhận menu con thật sự dịch vào trong màn. Ca này hiếm và đã được ghi nhận là chưa đo.
  file: `packages/ui/test/menu-con-dich-vao.dom.tsx`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
