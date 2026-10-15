---
slug: moi-tin-hieu-cho-quan-tri
at: 2026-10-14T02:50:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

# Phản biện context sạch — moi-tin-hieu-cho-quan-tri

Tác tử tươi đọc đúng sáu tệp (thiết kế, hợp đồng, phép đo, sổ quyết định, bài học xuyên hồ sơ, ô cơ hội); không
đọc mã, không chạy lệnh. Một lượt, không phản biện lại sau khi sửa.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Đường đo «số khớp» chỉ dựa AC-8 với một bộ tín hiệu dựng trong test qua máy chủ giả; không eval nào chứng kéo về THẬT và danh sách THẬT trả cùng tập mã, cùng phòng ban; không đòi bản vẽ hai bên cùng commit | Production ở commit X, cây chủ kho ở commit Y, hoặc kéo về lọc khác danh sách → ngày 12/11 số lệch, người đi sửa hàm đếm vốn không hỏng | Ca trong E2: gọi kéo về REST và danh sách trên cùng kho, ghim cùng tập mã và cùng ba số qua đường ánh xạ thật; Đường đo thêm bước đối sha | fixed: E2 thêm ca mth-khop-that (tập mã, mã phòng ban, ba số qua dongDemTuKeoVe/dongDemTuTatCa); AC-2 thêm vế cùng tập mã; Đường đo thêm bước đối sha production với cây chạy lệnh |
| P1 | evals | E3 ô 4 là khẳng định âm không đối chứng dương; chiều đỏ khai không đỏ được vì API đã từ chối thành viên | Fetch mất cookie hay danh sách chuỗi rỗng vẫn xanh; phá-thử không đỏ ở S4 [cay-can-chinh-co-ly-do#F1] | Đối chứng dương bằng cookie chủ; chiều đỏ bỏ cả nhánh không-quyền lẫn câu kiểm vai; ghim số chuỗi > 0 | fixed: E3 thêm ô 5 đối chứng dương, ghim số chuỗi > 0, chiều đỏ bỏ cả hai lớp |
| P1 | evals | E10 đo máy trạng thái phía khách mâu thuẫn thiết kế «server tính hết»; vế «lúc tải giữ tiêu đề và thanh thẻ» không đo được | Thợ làm theo thiết kế thì E10 không có refetch; thợ chiều E10 thì trái thiết kế — S3 kẹt hoặc S4 REJECT | Chốt chỗ sống của lúc tải/lỗi rồi viết lại E10 | fixed: thiết kế chốt nếp LT2 — tiêu đề và thanh thẻ ngoài Suspense, server tải trước tatCa, thẻ khách useQuery có refetch; E10 viết lại theo đó; vế «giữ tiêu đề lúc tải» rút khỏi AC-10 (cấu trúc trang, soi ở review) |
| P1 | decisions | Dòng 3 ghi một-lối (đếm phòng ban theo tên) trong khi lối thêm mã phòng ban vào phản hồi kéo về vẫn sống | Hai phòng ban trùng tên bị đếm là một ở cả trang lẫn lệnh; thẻ báo «một lối» nên người duyệt không thấy đánh đổi [cay-can-chinh-co-ly-do#F2] [khung-man-chung#F1] | Đổi căn cứ hoặc thành câu hỏi | fixed: dòng 9 thay dòng 3 — đếm theo MÃ phòng ban, phản hồi kéo về thêm trường mã tuỳ chọn (lối đếm theo tên chết vì sai nghĩa con số); E8, E8b, E2 đo hai phòng ban trùng tên là hai |
| P2 | contract | Coverage cắt ngang hứa «tệp git không đổi» và nhật ký không ghi nội dung mà không AC/eval nào đo | Gom một khối chọn cột chung cho kéo về và danh sách làm tên người lọt vào tệp git — không eval nào đỏ | Vế riêng tư trong AC-8 + eval quét tệp | fixed: AC-8 thêm vế tệp kéo về không mang tên hay thư; E2 ô 7 quét phản hồi kéo về với đối chứng dương; vế nhật ký ghi rõ là soi ở review, không có eval |
