---
slug: model-theo-vai-do-lai
at: 2026-10-21T00:45:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

Phản biện vòng mở lại 21/10 (DeepSeek, Gemini kho). Bản phản biện vòng đầu (20/10) ở lịch sử git của tệp này.

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Chủ kho muốn đo DeepSeek «đầy đủ với các vai», câu giao MH4 kể judge là một vai; d-17 thu DeepSeek còn ba vai mà ghi decided_by manh, Out of scope «DeepSeek không đo ở vai judge» không nằm trong Hỏi nào. Cùng dạng [lo-trinh-nhieu-san-pham#F2] | Chủ kho ký mà tưởng mình đã quyết bỏ judge; hàng Judge giữ zai/glm-5.2-fast (đắt nhất) không có số DeepSeek, vòng phải mở lại lần ba | Dòng sổ chi-nguoi riêng cho judge; d-17 chỉ ghi decided_by cho phần câu trích quyết | human-gate1: Hỏi-12 (d-20261020T223820Z-24, Judge OKR và Máy soạn kho, khuyên để ngoài vòng); d-20261020T223820Z-23 thay d-17, không thu vai; Out of scope trỏ Hỏi-12 |
| P0 | design | Hỏi-10 chọn «rẻ nhất theo chi phí đo mỗi lượt» nhưng usd soạn gồm judge, chênh số dư kho gồm phiên gốc và phiên khác | ds đắt hơn glm chỉ vì judge đọc đề xuất dài hơn; kiến nghị glm sai giá ship, E5 vẫn xanh | Chi phí của luật chọn chỉ tính phần ứng viên; ma trận E5 có ô nhân đôi judge | human-gate1: Hỏi-10 (d-20261020T223820Z-25) định nghĩa chi phí phần ứng viên = token các bước do model ứng viên chạy (aiChiPhi của kho đo) × giá niêm yết ghim; AC-5 ghi công thức; E5 tính lại công thức và thêm ô nhân đôi judge kèm đối chứng |
| P1 | contract | Chi phí kho không có nguồn tính lại; dòng glm của chi-phi.json đổi khoá mà không eval nào ghim | Phiên khác tiêu số dư nhóm trong lượt gem, gem trượt oan; sửa usd glm lúc đổi khoá làm đổi kiến nghị | Ghi aiChiPhi và số dư trước, sau lượt; E6 ghim dòng glm về 49456c140 | fixed: AC-3 thêm kết xuất aiChiPhi và số dư trước, sau lượt; AC-6 lấy chi phí thật kho từ aiChiPhi, số dư chỉ đối chiếu, dòng glm giữ giá trị 49456c140; E6 thêm assert và chiều đỏ «bang chung glm doi» |
| P1 | contract | AC-6 chỉ chặn giờ bắt đầu lượt ds, lượt dài vẫn chạy vào giờ cao điểm; d-21 ghi một-lối sai cho Tác nhân và soạn | Lượt soạn ds 05:10–06:30 thứ Tư phồng 20–40% usd, luật rẻ nhất lật sang glm | Chặn theo khoảng, hoặc quy về giá niêm yết | fixed: luật chọn quy về token × giá niêm yết (Hỏi-10) nên giờ chạy không đổi kết luận; bỏ chặn giờ (d-20261020T223820Z-26 thay d-21), AC-6 và E6 bỏ vế giờ cao điểm |
| P1 | contract | Lượt bị loại (sai model, lời dặn lệch) đổi ngưỡng ra sao không có luật chung; d-19 supersedes d-11 nên ngưỡng không còn dòng sổ nào đứng | 1/5 lượt ds sai model, so-do tự chọn 4/4, 4/5 hay chưa đủ số, E5 xanh cả ba | Một luật cho lượt bị loại; ô E5 cho lượt sai model; ngưỡng áp cho ds, gem có người duyệt | fixed: Hỏi-10 (d-20261020T223820Z-25) ghi ngưỡng Hỏi-6 áp nguyên cho ds, gem và lượt bị loại thành «chưa đủ số»; AC-5 ghi luật; E5 thêm ô 4 qua + 1 sai model → chưa đủ số |
