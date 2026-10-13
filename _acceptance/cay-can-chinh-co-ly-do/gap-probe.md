---
slug: cay-can-chinh-co-ly-do
at: 2026-10-13T07:40:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Vết (a) và (f) của E11 không có ca để bắt: bộ mẫu không có mục tiêu góp hai chỗ, cây của E7 không có nút lapLai | E11 đòi E1/E7 đỏ khi gài vết nhưng chúng vẫn xanh vì fixture không sinh ca đó — S4 REJECT dù mã đúng [giam-phut-ci-nhap-t1#F1] | Fixture sinh đúng ca vết đòi; chiều xanh kiểm điều kiện trước khi gài | fixed: vết (a) đổi thành «chỉ dựng cạnh đích KR» và E1 thêm đối chứng có cạnh đích KR và cạnh đích mục tiêu (bộ mẫu có cả hai); vết (f) đổi thành «chip Tất cả đếm mọi nút» — cây của E7 có gốc và KR nên số nút khác số cạnh |
| P0 | design | Dòng sổ mot-loi chỉ giết lối đổi NutCanChinh, còn lối gắn lý do vào bản nút ở service | Thẻ báo «chỉ một lối» trong khi còn lối sống — người duyệt không thấy đánh đổi | Nêu ràng buộc giết lối còn lại | fixed: dòng S1 mới mang supersedes nêu ràng buộc thật — cay-day-du của okr-toan-canh.spec.ts (hồ sơ đã ký toan-canh-okr) so nút cayCanChinh với nút alignmentTree bằng toEqual, nên gắn trường vào bản nút cũng đỏ |
| P1 | evals | Phép ghép (nút.objectiveId, cha.id) chỉ đo trên fixture viết tay; ca den là mục tiêu chưa bị đòi | Id nút khác id mục tiêu thì P dưới mục tiêu đích mất lý do trên màn thật mà E5 vẫn xanh | Đòi ca den KR và den mục tiêu trên dữ liệu thật | fixed: E9 đòi trong ba ca mẫu có ít nhất một cạnh den KR và một cạnh den mục tiêu; E1 đòi tương tự trên toàn bộ mẫu. (Đã đối chiếu mã: dungCayCanChinh đặt id nút mục tiêu bằng id mục tiêu, nút KR bằng id KR.) |
| P1 | contract | «Chưa có lý do» hiện hai lần trên một nút; AC-8 cho hai nguồn chữ chip mà E8 đếm 5 khoá mới | Ảnh E10 lặp chữ do hợp đồng khoá; dùng lại nhãn L2 cho chip thì E8 đỏ dù đúng AC-8 | Một nơi mang chữ; E8 khớp nguồn đã khai | fixed: nút chưa có lý do chỉ mang nhãn (dòng S1 mới, căn cứ luật nhãn của CLAUDE.md); chip «Chưa có lý do»/«Đặt cược» dùng nhãn mức tin của L2, E8 đếm đúng 2 khoá mới và so chữ chip với nhãn L2 |
| P2 | evals | Trạng thái lọc Đặt cược và lọc rỗng chưa có ảnh; E7 không nói chọn mức rỗng bằng cách nào | Khoá chip số 0 làm E7 đỏ dù hợp lý; câu rỗng lệch nếp không ai nhìn | Đặt lọc qua đường dẫn; thêm ảnh | fixed: AC-7 nói chip số 0 vẫn bấm được; E7 đặt lọc qua searchParams; E10 thêm ảnh lọc Đặt cược (6 ảnh). Lọc rỗng không có ca trên bộ mẫu (ba mức đều có) nên chỉ đo ở E7 |
