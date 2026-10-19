# Review findings: khong-re-theo-ten-thanh-luat-kho (round 2)

## Trong hợp đồng

(không có finding nào trong hợp đồng ở round này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **.eslintignore can still exempt product code from the rule: lint:slop honours it, and E17 does not re-run because .eslintignore is not in its paths**
  Người dùng thấy gì: Một thay đổi thêm tệp bỏ qua của công cụ kiểm tra có thể làm một thư mục sản phẩm không còn bị soát tên giai đoạn cũ ngay lúc gửi thay đổi. Lỗi này chỉ bị bắt ở lần chấm lại hồ sơ theo định kỳ, không bị chặn ngay.
  file: `_acceptance/giai-doan-thoa-thuan/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, chỉ chặn bằng ngưỡng): E17 hứa «không tệp theo dõi nào thoát» nhưng chỉ kiểm number_of_files >= 50, không kiểm bằng đúng tập đã liệt kê**
  Người dùng thấy gì: Phép kiểm tên giai đoạn cũ hiện quét đủ mọi tệp. Nhưng nếu sau này công cụ lặng lẽ bỏ sót một số tệp, hoặc có tệp mang đuôi hiếm, phép kiểm vẫn báo đạt mà không cảnh báo.
  file: `_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs`
  severity: low
  Đề xuất: known-limits

- **ghim-xanh khong doi E17 co mat trong evals_exit; thieu evals_exit cung coi la dat (r1)**
  Người dùng thấy gì: Bước kiểm tra việc ghim hồ sơ có thể báo đạt dù thiếu kết quả của phép kiểm này, nên một hồ sơ ghim thiếu có thể lọt qua mà không ai thấy.
  file: `_acceptance/khong-re-theo-ten-thanh-luat-kho/rang/ghim-xanh.mjs`
  severity: low
  Đề xuất: known-limits

- **oxlint() khong kiem r.error/r.status: oxlint khong chay duoc thi bi xep ma 1 'HONG' thay vi ma 2 'KHONG DO DUOC' (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi công cụ kiểm tra mã không chạy được trên máy, kết quả bị báo như có vi phạm thay vì báo không đo được, nên người đọc có thể đi tìm lỗi sai chỗ.
  file: `_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): AC-4 «E17 lấy kết luận từ chính luật kho» chỉ được đo bằng cách grep mã nguồn của script E17 (r1)**
  Người dùng thấy gì: Phép kiểm xác nhận phép kiểm kia dùng đúng luật chung chỉ đọc chữ trong mã, nên nếu sau này có người đổi cách làm mà giữ nguyên chữ thì vẫn không bị phát hiện.
  file: `_acceptance/khong-re-theo-ten-thanh-luat-kho/rang/e17-qua-luat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): bảng ma trận chỉ gieo GIAI_DOAN_GOC ở 1/7 thư mục, và các chỗ miễn chỉ thử với id cũ (r1)**
  Người dùng thấy gì: Bộ thử mới chỉ kiểm một phần các tổ hợp thư mục và từ cấm, nên một thư mục bị tắt luật riêng cho tên giai đoạn gốc có thể không bị phát hiện.
  file: `_acceptance/khong-re-theo-ten-thanh-luat-kho/rang/ma-tran-luat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): ghim-xanh coi evals_exit thiếu E17 hay rỗng là xanh (r1)**
  Người dùng thấy gì: Bước kiểm tra việc ghim hồ sơ coi như đạt khi thiếu kết quả của phép kiểm này, nên có thể xác nhận nhầm một hồ sơ chưa đủ.
  file: `_acceptance/khong-re-theo-ten-thanh-luat-kho/rang/ghim-xanh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): ca chèn không ghim số dòng của dòng HONG (r1)**
  Người dùng thấy gì: Bộ thử không kiểm số dòng trong thông báo vi phạm, nên nếu thông báo chỉ sai dòng thì người sửa sẽ phải tự tìm lại chỗ đúng.
  file: `_acceptance/khong-re-theo-ten-thanh-luat-kho/rang/e17-qua-luat.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
