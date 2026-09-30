---
slug: gioi-han-duyet-cay-okr
at: 2026-09-29T01:40:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E3 chỉ có một ô đối chứng dương; thủ tục cần ghi nhận, cập nhật tuần, số chụp, người tham gia trả rỗng cho mọi người, và đầu vào sai khuôn (400) hay 403 cũng ra «0 lộ» | lichSuSo, capNhatTuan hay danh sách ghi nhận không gắn điều kiện xem; G không có hàng con nên phản hồi rỗng với cả người xem được; E3 xanh trong khi dữ liệu thật lộ tên KR qua khoá API | Ma trận viết trước một dòng mỗi thủ tục, đầu vào cố định, cột kỳ vọng cho người xem được; 400/403 ở ô nào là đỏ; gieo đủ hàng con | fixed: E3 viết lại — ma trận THU_TU_DOC_OKR số dòng = số thủ tục, mã trạng thái so toEqual, gieo ghi nhận, cập nhật tuần, số chụp, tham gia, theo dõi, người xem; người xem được phải đếm ≥ 1 ở dòng «chứa G» |
| P0 | evals | Lưới soi chỉ bắt okrObjective ở ba thư mục; đọc qua bảng con có include objective lọt; thủ tục ngoài router okr không được gọi | Một thủ tục ngoài okr dùng okrKeyResult.findMany include objective không điều kiện; E23 và E3 cùng xanh | Soi bảy bảng con trên toàn apps/api/src, packages/db/src, apps/agent/agent/lib; E3 gọi cả thủ tục ngoài okr chạm bảng OKR | fixed: E23 soi okrObjective và bảy bảng con trên ba gốc, tệp ngoài okr phải khai thủ tục ở rang/duong-doc-okr.json; E3 đọc cùng tệp đó; thiết kế mục 4 thêm dòng bảng con; chiều đỏ tệp giả ngoài okr |
| P1 | contract | Lời hứa «mang sang chép mức và người xem» không AC nào đo | Mang sang G giới hạn ra bản nháp công khai, cả công ty thấy ở quý kế; mọi eval xanh | Thêm vế AC và ca đo mangSang với người xem đã rời | fixed: AC-1 thêm vế mang sang; E1 thêm ca mangSang (người xem rời bị bỏ, người không xem được không thấy bản nháp) và chiều đỏ |
| P1 | evals | Vết và diễn biến của mục tiêu công khai từng căn chỉnh với G mang id, tên G; không bài soi — cùng loại [canh-kr-okr#F1] | Gỡ căn chỉnh rồi đặt G giới hạn; người không xem được mở vết của C1 thấy tên G | Gieo C1 căn chỉnh rồi gỡ; đọc vết C1 bằng M, O đếm id G = 0; ghim cách đọc | fixed: thiết kế mục 4 thêm luật `vetChoNguoiXem` (đích thành «một mục tiêu giới hạn»); AC-3 thêm vế; E3 gieo C1 và đo cả hai chiều |
| P1 | evals | Ngưỡng mồ côi đọc cột tuổi mà không có mốc bắt đầu; ngưỡng «tắt bước duyệt trong hai tuần» không có cột và vết cau-hinh không ghim before/after — cùng loại [toan-canh-okr#F1] | Tuổi tính từ createdAt báo CHẾT oan; vết cau-hinh không mang duyetCongBo nên lần tắt không bao giờ đếm được | Ghim mốc; E7 so before/after; E21 thêm cột tatTrongHaiTuan và ca ghép cặp | fixed: bỏ đo tuổi (gỡ thành viên xoá hàng — không còn mốc), ngưỡng mồ côi đổi thành so danh sách giữa các lần đọc tuần (opportunity, contract Đường đo, thiết kế mục 9); E7 so before/after `duyetCongBo`; E21 thêm tatTrongHaiTuan, chuỗi gửi-trả-gửi-duyệt, rút lại, cặp mở — số viết trước tính lại |
