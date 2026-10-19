---
slug: viec-rieng-chi-nguoi-trong-cuoc
at: 2026-10-19T10:05:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-4 ghi chữ trên khung là «mục tiêu», nhưng câu trích (lời báo trước của DA4 lúc đưa việc vào dự án) không quyết chữ thường trực của ô «Gắn với», cũng không quyết dòng dưới tiêu đề. Cùng dạng [dich-ten-nganh-bang-bang#F1]. | Chủ kho ký câu chữ như thể đã có căn cứ ký ở DA4; lời hứa mới về ai thấy việc lên production mà chưa người nào chọn. | Dòng sổ chỉ-người mới thay d-4, kèm khuyến nghị và lối khác, lên thẻ Cổng Phạm vi. | human-gate1: dòng d-20261019T094220Z-10 thay d-20261019T093723Z-4, thành Hỏi-2 trên thẻ. |
| P1 | evals | E8 chỉ có đối chứng dương cho ba câu duAn.*; nhóm giao-cho-toi có vẻ luôn rỗng với X. | Danh sách hay Bảng vẫn trả V cho X sau khi rút mà E8 vẫn xanh vì hỏi một nhóm không bao giờ chứa V. | Đối chứng dương cho cả sáu câu, cả X và A, trước khi rút. Chiều đỏ của vế giữ: đột biến chạy lại được hoặc khai Known limit. | fixed: đối chứng dương cho cả 6 câu × 2 người; expected nêu rõ duAnId/tatCaDuAn làm dieuKienNhomHayDuAn bỏ qua nhom (packages/db/src/viec.ts:324); chiều đỏ bằng đột biến tay khai giới hạn ở Notes của hợp đồng. |
| P1 | contract | Ngưỡng CHẾT có «khoảng ngày, mốc chờ» nhưng AC-8/E8 chỉ quét tiêu đề, mã và soViec; fixture không đặt ngày V ra ngoài khoảng của U. | Khoảng ngày của P còn tính ngày của V sau khi rút; E8 vẫn xanh. | AC-8 thêm vế khoảng ngày; V rộng hơn U; đối chứng trước, so sau. | fixed: AC-8 và E8 thêm batDauSom/hanMuon, V bao trọn U, đối chứng dương trước khi rút. |
| P1 | evals | E10 chốt vetNhacViecRieng = 3 trước writer thật (vết tự dời có thể là một hay hai); thiếu mồi; chiều đỏ không với tới do import tĩnh và parse stdout trước mã thoát. | Lệnh đếm đúng ra 4 làm E10 đỏ; lệnh đếm sai vẫn ra 3 và xanh; trên onehub tệp kiểm vỡ lúc nạp. | Đọc lại viecVet sau fixture và ghim theo loại; thêm hai mồi; import động; kiểm mã thoát trước parse. | fixed: fixture W1, W2 chờ V (4 vết đã biết loại, đọc lại và ghim), mồi R2/R3 và G; đáp án {2, 4, 1}; import động; mã thoát trước parse. |
| P2 | evals | Vế «K bị xoá» của E6 chỉ kiểm chuỗi đánh dấu vắng; không quét viec.get(P0) của W. | Bản dựng bỏ hẳn vết hay trả sau: {id} vẫn xanh; khung P0 lộ K qua đường khác. | Đếm đúng một vết them-viec-con với sau null; quét viec.get(P0) của W. | fixed: E6 và AC-6 thêm cả hai vế. |
