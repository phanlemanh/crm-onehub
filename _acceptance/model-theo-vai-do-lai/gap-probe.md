---
slug: model-theo-vai-do-lai
at: 2026-10-20T10:05:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Luật kiến nghị ở Notes (Tác nhân 4/5, kho câu lỗi ≤ 2, soạn ≥ 12/18 hỏng ≤ 3, luật phá hoà) do máy đặt, không có dòng sổ, opportunity.md chưa có ngưỡng | Cổng Phạm vi ký AC-5 vì tưởng luật là của chủ kho; 12/18 thấp hơn mốc Gemini 13/18 nên bảng có thể kiến nghị model kém mốc và MH2 đổi theo; E5 vẫn xanh | Dòng sổ chi-nguoi Hỏi-6; ma trận biên viết trước cho cả ba vai trong E5 | human-gate1: Hỏi-6 (dòng sổ chi-nguoi, khuyên soạn ≥ 13/18 bằng mốc); AC-5 đọc ngưỡng từ rang/nguong.json; E5 thêm ma trận biên ba vai và chiều đỏ «kien nghi trai luat <vai>» |
| P0 | contract, evals, sổ | Cỡ mẫu và trần chi viết cứng vào AC-1, AC-3, AC-4, AC-6 và E1, E4, E6 trong khi Hỏi-5 chưa trả; d-4 quyết «hai lượt» không có căn cứ | Chủ kho trả Hỏi-5 khác lời khuyên thì sáu chỗ phải viết lại sau ký; thẻ không hiện Hỏi-5 là việc còn chờ | Dòng sổ chi-nguoi Hỏi-5 thay d-4; số đọc từ một chỗ | human-gate1: Hỏi-5 (dòng sổ chi-nguoi, supersedes d-4, gồm cả mốc Gemini và ô bỏ); AC và eval đọc cỡ mẫu, trần từ evidence/ke-hoach.json, không số cứng |
| P1 | contract | Ô bỏ (trần bước, trần thời gian, mức tắt, flash-low cho kho và soạn) không có dòng descope người quyết, trong khi chủ kho nói «tinh chỉnh lại các thông số» | Tác nhân flash bị cắt ở 180 giây, bảng ghi «giữ», MH2 tưởng đã dò thông số | Ô bỏ thành câu hỏi người; hàng «giữ» in thông số chưa dò | fixed: ô bỏ đưa vào Hỏi-5 (lối khác: đo thêm, trần 12 USD); AC-5 và E5 đòi hàng «giữ» in thong_so_chua_do, chiều đỏ «thong so chua do <vai>» |
| P1 | contract, evals | AC-1 kiểm model đã đặt chứ không kiểm model Gateway trả cho phiên con agent_builder | modelTheoVai lùi về zai/glm-5.2-fast, 10 lượt chạy model cũ, E1 xanh, bảng kiến nghị 5.3 Flash bằng số của 5.2 Fast | AC-1 ghi model Gateway trả; E1 so và chiều đỏ «sai model tac-nhan <lượt>» | fixed: AC-1 thêm model Gateway trả của phiên con và luật loại lượt «sai model»; E1 thêm so sánh và chiều đỏ đổi model một lượt |
| P1 | evals | E3 nói «lượt một, lượt hai» khi AC-3 chỉ một lượt; «tập câu quy định» chưa định nghĩa; tệp mốc kho không có đường; chuỗi «lời dặn lệch mốc» và «chưa đủ số» lệch giữa AC-4 và E4 | Thợ làm đúng AC-3 thì E3 đỏ mãi, hoặc chạy thêm lượt vượt chi, hoặc tự đặt nghĩa | Định nghĩa vòng của thước, ghi đường tệp mốc, thống nhất chuỗi | fixed: AC-3 nói rõ một lượt gồm hai vòng của thước (CRM 46 câu quy định, Zalo 50 câu); E3 định nghĩa tập 46 = mã có nhom khác «khong-phai-quy-dinh»; AC-5 ghi đường ba tệp mốc; E4 ghim cả «lời dặn lệch mốc» lẫn «chưa đủ số» |
