---
slug: thu-paths-e15-giai-doan
at: 2026-10-16T05:30:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Câu SỐNG thứ hai của ô cơ hội (không hồ sơ nào còn lý do eval-ngoai-may-thieu-paths do một eval judgment) không có đường đo, và Hỏi-2 cùng dòng d-…-3 làm nó không đạt mà sổ ghi máy quyết, thẻ không nói ký Hỏi-2 là bỏ câu đó | Chủ kho ký Cổng Phạm vi tin ngưỡng SỐNG còn nguyên; sau gộp pre-merge-check vẫn in eval-ngoai-may-thieu-paths ở 3 + 44 hồ sơ; Cổng Giá trị đọc đỏ mà không ai quyết bỏ | Dòng Đường đo cho câu này; eval đếm KHONG_AP eval-ngoai-may-thieu-paths do judgment trước/sau; một câu Hỏi trên thẻ | fixed: dòng sổ d-20261016T051203Z-8 thay d-…-5, Hỏi-2 nói thẳng ký theo khuyến nghị là đổi câu SỐNG thành «ở các hồ sơ trong danh sách» (ba eval không suy được kể tên); Đường đo thêm dòng cho câu này; AC-7 vế (d) và E8 đếm dòng KHONG_AP do judgment ở hồ sơ trong danh sách |
| P1 | contract | Hai hồ sơ chủ kho gọi tên (thu-haiku E8, ghim-thuoc-soi-xem-okr E3) vào danh sách có điều kiện, không AC khẳng định, không dòng sổ cho lối loại | Lúc S3 hai hồ sơ còn hoá cũ hay #436 chưa gộp, bị bỏ khỏi danh sách lặng lẽ, E3 E5 vẫn xanh | AC-3 khẳng định có tên; không thoả luật thì dòng sổ chi-nguoi lên thẻ; E3 in CO_TEN, chiều đỏ xoá slug | fixed: AC-3 vế (b), E3 --phai-co in CO_TEN / KHONG_CO_TEN với chiều đỏ; Notes ghi không thoả luật thì máy dừng hỏi chủ kho, không tự bỏ |
| P1 | evals | Nguồn danh sách không thống nhất (AC-3 nói lệnh tpe_* trong config.yaml, E3–E5 đọc danh-sach.txt); không eval nào so danh sách với luật chọn; AC-4 cấm chạm evals.yaml ngoài danh sách mà chính hồ sơ này ngoài danh sách | danh-sach.txt vắng làm paths trỏ tệp mất, hồ sơ rơi về luật cũ; hồ sơ thoả luật bị sót mà E3 xanh; E4 đỏ vì chính hồ sơ này hay người dựng tự thêm miễn trừ không khai | Một nguồn; --kiem-danh-sach tính lại luật và so; AC-4 khai miễn trừ duy nhất | fixed: một nguồn danh-sach.txt ở AC-3 và design; E3 --kiem-danh-sach in THIEU_TRONG_DANH_SACH / THUA_TRONG_DANH_SACH với hai chiều đỏ; AC-4 và E4 khai miễn trừ duy nhất _acceptance/thu-paths-e15-giai-doan/** |
| P1 | evals | AC-1 AC-2 chỉ đo một vài tệp chọn tay, không ma trận toàn phần qua 48 tệp chữ; ba tệp của màn gõ cứng thay vì suy từ import | Một tệp chữ thứ tư mà màn nhập thẳng bị bỏ sót, hay một tệp khác vẫn bị giữ, thước vẫn xanh | Ma trận mọi apps/app/lib/messages/*.ts, tập giữ suy từ import; chiều đỏ thêm import | fixed: AC-1 viết lại theo tập suy từ import; E1 --ma-tran-chu lặp qua mọi tệp, in SAI_LOP; chiều đỏ thêm dòng nhập @/lib/messages/okr vào giai-doan-settings.tsx. E2 giữ một cặp tin-hieu/settings vì phần của E15 đã do E1 phủ toàn phần, E2 chỉ chứng mức hồ sơ sau F23 |
| P1 | contract | Ngưỡng giảm số hoá cũ chỉ đo tay; E5 dựng lại stale_files thay vì chạy pre-merge-check thật | pre-merge-check thật xét thêm điều E5 không chép, một hồ sơ trong danh sách vẫn hoá cũ hay hồ sơ mới thành hoá cũ mà E5 vẫn SACH | Eval chạy pre-merge-check thật trên merge-base và HEAD, so tập slug | fixed: AC-7 (cross-layer) và E8 chạy bash scripts/pre-merge-check.sh thật trên worktree tạm ở merge-base và trên HEAD, khẳng định rời, không mới, số giảm; pre-merge-check --base trên PR là việc của CI và pre-push |
