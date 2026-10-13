---
slug: gui-tin-hieu-trong-crm
at: 2026-10-12T02:10:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---
# Phản biện context sạch — gui-tin-hieu-trong-crm

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Đường đo vế «tín hiệu gửi quá 7 ngày đã có chỗ» lấy mẫu số từ khối LO-TRINH.html — tín hiệu chưa từng kéo về không vào mẫu số; AC-12 không in tuổi tín hiệu chưa gom | Chủ kho quên kéo về ba tuần; khối chỉ có tín hiệu cũ đã có chỗ; thước đọc 100% và Cổng Giá trị ghi SỐNG trong khi hàng chục tín hiệu vẫn chờ | Mẫu số là mọi tín hiệu của máy chủ quá 7 ngày, ghép với khối theo mã; ca đỏ «tín hiệu chưa kéo về lọt khỏi mẫu số» | fixed: AC-12 thêm dòng «gửi quá 7 ngày · chưa có chỗ sau gom» với mẫu số từ máy chủ; Đường đo đổi nguồn; E12 dòng 3 + chiều đỏ ghim |
| P1 | evals | Không eval nào đo chỗ nối giữa vỏ phản hồi REST thật và lệnh kéo về; máy chủ giả dựng tay hình vỏ | API thật bọc kết quả khác hình máy chủ giả; E7, E8, E12 xanh; lượt kéo về thật đầu tiên ghi 0 tệp sau khi đã đóng dấu | Chạy hàm đọc của lệnh trên thân HTTP thật; chiều đỏ «lệnh kéo về lệch vỏ phản hồi REST» | fixed: thêm cặp hàm bọc/đọc vỏ phản hồi một chỗ (thiết kế §3.2); E6 dòng 4 chạy hàm đọc trên thân HTTP thật + chiều đỏ; E8 máy chủ giả bọc bằng chính hàm bọc của router |
| P1 | contract | Mục «Tín hiệu đã gửi» của menu người dùng không có AC hay eval | Mục menu sót; người gửi quay lại sau 7 ngày không có lối vào trang; vế «người gửi thấy chỗ đó» trượt | Vế mới ở AC-4 + ô menu ở E13 + ca DOM có chiều đỏ | fixed: AC-4 thêm vế menu; E1 ca «menu» + chiều đỏ ghim; E13 thêm ô menu-1280, menu-375 |
| P1 | evals | Không ai đo bản dựng production của trang mới có mang LO-TRINH.html | Route mới không mang tệp; mọi người thấy «chưa đọc được»; đường khoan dung che lỗi; người gửi không bao giờ thấy câu kit | .nft.json của route tin-hieu phải liệt LO-TRINH.html, đối chứng route Lộ trình, chiều đỏ | fixed: AC-11 thêm vế bản dựng; E17 mới (ban-dung.mjs) có đối chứng dương và chiều đỏ ghim. deferred: ô E13 «trang có bản vẽ» trên màn thật cần thay LO-TRINH.html ở gốc cây đo — làm thế là ghi vào cây; câu kit trên trang đã được E9 (bộ đọc thật trên HTML kit vẽ) và E10b phủ |
| P2 | evals | E14 hỏi câu trạng thái có chữ nội bộ nhưng câu kit không nằm trong inputs; câu kit mang chữ «hồ sơ» và tên hồ sơ kỹ thuật, mâu thuẫn ngầm với AC-10 | Hội đồng PASS trên tệp chữ; trên màn thật người phòng ban đọc «→ hồ sơ gui-tin-hieu-trong-crm: …» | Đưa mẫu câu kit thật vào inputs; nêu mâu thuẫn ở Cổng Phạm vi | fixed: inputs thêm evidence/cau-kit-mau.json do E9 ghi; PASS chỉ chấm câu của CRM, câu kit trích vào lý do. human-gate1: câu kit mang mã việc và tên hồ sơ — chủ kho quyết nhận làm giới hạn hay xin kit một câu cho người gửi |
