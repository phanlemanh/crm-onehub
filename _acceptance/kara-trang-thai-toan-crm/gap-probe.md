---
slug: kara-trang-thai-toan-crm
at: 2026-10-08T04:44:30Z
verdict: findings
p0: 0
p1: 2
p2: 3
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Ngưỡng SỐNG đòi bước chưa lưu «kèm lý do» trong khi AC-7 và sổ d-…-4 cấm in lý do tiếng Anh ở tab Việt | Cổng Giá trị đọc ngưỡng nguyên văn, bước chưa lưu không có lý do nên không đạt SỐNG, hoặc ngưỡng bị bỏ qua lặng | Sửa ngưỡng hoặc thêm lý do Việt chung có đo | fixed: bỏ «kèm lý do» khỏi ngưỡng (cụm do máy thêm sau khi anh ký), sổ revisit d-…-6 trình ở Cổng 1 |
| P1 | evals | E8 chỉ đo data-trang-thai và chữ đọc màn, không đo chấm màu mà AC-7 hứa | Bảng tông của steps.tsx thiếu khoá unsaved, chấm rơi về tông xong; E8 vẫn xanh | So data-tone của chấm chua-luu (warning) với chấm xong (success) cùng lượt | fixed: E8 thêm ô data-tone warning/success, ma trận 7 ô |
| P2 | evals | E2 thiếu ô rỗng thật; E12 coi mọi return null theo dữ liệu là sai, không có ma trận nhánh hợp lệ | Nhánh rỗng hợp lệ bị E12 đếm sai (đỏ giả) hoặc mục rỗng hiện ra mà E2 không bắt | E2 thêm ô rỗng (10 ô); E12 khai trước từng return null kèm nhãn hợp lệ | fixed: E2 10 ô; E12 ma trận theo tệp, đối chứng dương |
| P2 | evals | E9 chỉ quét 3 tệp create-*; E10 chỉ so bằng tuyệt đối trên hai hàm chữ | Một tệp tsx khác còn «added.» hay một chuỗi chứa «Sửa Mục tiêu» lọt qua | Quét mọi tệp bằng git ls-files, so có-chứa | fixed: E9 quét apps/app/**/*.tsx; E10 quét lib/messages/*.ts và tsx, so có-chứa |
| P2 | contract | Trục C tuyên tiếng Anh chạy ngang mọi ô Core nhưng chỉ AC-8 có nhánh tiếng Anh | Chữ Việt viết cứng trong VungTaiLoi hay baoDaLuuTru lọt qua vì mọi eval chạy vi | Thêm ô en cho E1, E5, E8 hoặc sửa trục C | fixed: E1, E5, E8 thêm ô tiếng Anh; trục C ghi rõ AC nào đo tiếng Anh; AC-7 ghi tab en giữ lý do |
