---
slug: cau-truc-to-chuc
at: 2026-09-24T05:20:38Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
# Phản biện context sạch — cau-truc-to-chuc

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | AC-1 hứa về dữ liệu có trước migration nhưng E1 dựng dữ liệu sau migration và so trước/sau một lệnh chỉ đọc; E2 lọt ADD COLUMN NOT NULL không DEFAULT và ADD CONSTRAINT UNIQUE/CHECK | Migration thêm ràng buộc duy nhất trên tên phòng ban: xanh trên cơ sở dữ liệu kiểm rỗng, đỏ trên production có hai phòng ban cũ trùng tên, R1 không lên được | Dựng cơ sở dữ liệu tới migration của base_commit, gieo bằng SQL lược đồ cũ có tên trùng và position rời, rồi chạy riêng migration mới; E2 cấm thêm ba dạng | fixed: E1 thành script chạy migration trên dữ liệu cũ (20 + 3 khẳng định, chiều đỏ NOT NULL); phần nhóm «Chưa xếp» tách thành E1b; E2 cấm thêm NOT NULL không DEFAULT, UNIQUE/CHECK và chỉ mục duy nhất trên bảng đã có, ba tệp giả cho chiều đỏ |
| P1 | evals | E8 gọi thủ tục ghi với input rỗng, cho vế quản trị trả BadRequest | zod từ chối trước khi tới kiểm quyền; vế dương xanh cả khi vị từ trả sai cho vai chủ | Input hợp lệ tối thiểu cho từng thủ tục rút từ router; quản trị và chủ không bao giờ BAD_REQUEST do input | fixed: E8 giữ bảng input hợp lệ, thủ tục thiếu input làm bài kiểm đỏ, thêm vai chủ, thêm chiều đỏ vị từ trả false cho chủ |
| P1 | contract | AC-9 không nói dòng nào hỏng ở ba loại lỗi cặp | Code chỉ đánh hỏng dòng sau: dòng đầu của cặp hai trưởng vẫn thành trưởng, trưởng phụ thuộc thứ tự dòng | Ghim: mọi dòng trong cặp đều hỏng; ma trận theo từng dòng | fixed: AC-9 thêm vế «mọi dòng trong cặp đều hỏng»; design ghi luật; E11 viết lại 14 dòng dữ liệu × 2 = 28 khẳng định, chiều đỏ đánh hỏng một dòng |
| P1 | evals | Không eval nào đo màn Điều phối đưa lựa chọn bộ phận vào truy vấn [keo-tha-thoa-thuan#F1] | Màn hiện bộ lọc nhưng không gửi mã bộ phận; E15 xanh ở máy chủ, E16 xanh vì bộ lọc có mặt | Eval DOM ghi lại input truy vấn danh mục | fixed: thêm E23 (input mang mã bộ phận, danh sách theo phản hồi, số đếm từ facetCounts, đường dẫn giữ lựa chọn); design ghi rõ lọc ở máy chủ |
| P2 | evals | AC-3: không ca xoá hẳn đơn vị chưa lưu trữ; không eval lớp màn cho mục Đã lưu trữ và câu lỗi | purgeDivision xoá được bộ phận chưa lưu trữ mà E4 vẫn xanh; màn không hiện câu nêu số người | Hai ca mới trong E4 và một eval DOM | fixed: E4 thành 10 ca (thêm hai ca xoá hẳn đơn vị chưa lưu trữ); thêm E24 cho mục Đã lưu trữ, ô chọn không có đơn vị đã lưu trữ, câu lỗi có số người |
