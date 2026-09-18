---
slug: loi-moi-da-huy-van-cho-vao
at: 2026-09-18T00:45:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Không eval nào khẳng định chiều DƯƠNG: hai ô `pending` và `accepted` của trục B không có assert nào. Cả bộ là đối chứng âm không đối chứng dương [ma-tran-phai-co-chieu-song#F1] | Bản sửa khai tập còn hiệu lực sai hoa-thường, hoặc bộ phân tích trả `unknown` cho mọi dòng. Mọi lời mời rơi ngoài danh sách trắng, không ai vào được nữa — cả bảy eval vẫn xanh | Eval ma trận toàn phần trục B: sáu ô, sáu assert viết trước. Chiều đỏ hai lần | fixed: thêm E8 sáu ô, cấm đếm-được-bao-nhiêu-assert-bấy-nhiêu |
| P0 | evals | AC-1 hứa hai vế, vế «không tạo dòng thành viên nào» không có eval. Trục C nêu `ensureWorkspaceMembership` làm thước mà không eval nào có nó trong `paths` | Phép kiểm trả TỪ CHỐI đúng, nhưng lộ trình đăng nhập vẫn chạy tiếp phần kết nạp. Người mang lời mời `canceled` vẫn có dòng thành viên. Bảy eval xanh vì không ô nào nhìn bảng thành viên | Eval tích hợp đếm dòng `member` trước và sau lượt đăng nhập: hiệu bằng 0 với `canceled`, bằng 1 với `pending` | fixed: thêm E9 |
| P1 | evals | E5 không ghim CÁCH giải gói. Cây có hai bản: `1.6.25` mã nạp thật và `1.4.22` bắc cầu của `@better-auth/cli` | Thước giải trúng `1.4.22` đã cũ. Bản `1.6.25` thêm một giá trị thứ năm, hai tập vẫn bằng nhau, thoát 0 — đúng điều AC-5 tồn tại để bắt thì lọt | `expected` khai neo bằng `createRequire` từ `packages/auth/package.json`, in đường dẫn và số hiệu bản, TỪ CHỐI ĐO mã 2 khi lệch | fixed: E5 viết lại; và sửa con số bản trong mục Context của hợp đồng |
| P1 | evals | E7 chỉ đòi «không phải pending» — âm tính không đối chứng dương, không ghim giá trị RA [ma-tran-phai-co-chieu-song#F1] | `toStatus` trả `unknown` cho MỌI giá trị. Hai ô của E7 vẫn xanh, còn lời mời đang chờ hoá vô nghĩa trên màn quản trị | Ma trận bốn ô ghim giá trị RA **bằng** giá trị VÀO | fixed: E7 viết lại thành bốn ô |
| P1 | evals | Cữ liệu của E1, E2, E4, E7 là chuỗi gõ tay, không rút từ nơi giá trị sinh ra [ma-tran-phai-co-chieu-song#F2] | Gõ nhầm cữ liệu E1 thành `cancelled` hai chữ L: bài vẫn pass, chiều đỏ vẫn đỏ, hồ sơ mất hẳn ô `canceled` mà vẫn báo đủ eval | Cữ liệu lấy từ hằng đã được E5 khẳng định; thêm assert canh hai ô phải khác chuỗi, bằng nhau thì TỪ CHỐI ĐO | fixed: điều khoản cữ liệu ghi vào design doc và vào `expected` của E1, E2, E4, E7 |
