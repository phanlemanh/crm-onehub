---
slug: tro-ly-kho-dung-phien
at: 2026-10-04T13:30:00Z
verdict: findings
p0: 1
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract + evals | Thước sai chỗ đọc AiChiPhi, nhưng session con hỏng ở session.started trước mọi lời gọi model nên không có hàng chi phí; E7 gieo dữ liệu không thể tồn tại | Production gọi sai chỗ, demSaiPhien trả rỗng, ngưỡng CHẾT đọc thành SỐNG, dòng revisit của d-…-1 không bao giờ bắn | Nguồn sự kiện riêng khi session con hỏng; E7 sinh ca sai chỗ bằng đường hỏng thật | fixed: lời dặn tro_ly_kho ghi AgentEvent tro-ly-kho.sai-cho trước khi ném (AC-5, design mục 3); thước đếm hàng đó nối AiChiPhi.tinhNang của session gốc (AC-7, Đường đo); E7 chạy resolver thật dưới ctx con của A, B, C; chiều đỏ «phiên con hỏng trước model không được đếm» |
| P1 | contract + evals | Thước không-ZDR so modelId nhưng ZDR là cờ từng lời gọi | Nhánh quên ganZdr mà cùng mã model, thước in 0 | Ghi cờ vào bản ghi chi phí hoặc khai chỉ báo gián tiếp | fixed: Đường đo và design mục 4 khai rõ chỉ báo gián tiếp; bảo đảm thật là E3 đo cờ trên từng lời gọi; không thêm cột vì là migration T3 (sổ d-…-4) |
| P1 | evals + contract | E5 gọi moHoi thẳng thay vì resolver session.started; ma trận thiếu okr-soan | Lời dặn mới nuốt lỗi, session con đi tiếp tốn model mà E5 vẫn xanh | E5 qua resolver thật, 6 purpose, chiều đỏ «lời dặn nuốt KHONG_PHAI_HOI» | fixed: AC-5 sáu purpose qua resolver session.started; E5 ma trận 6 ô, đối chứng purpose kho, hai chiều đỏ ghim |
| P2 | evals | E3 so «như trước» bằng biểu thức của chính code mới, deep-equal đối tượng model | Đổi vaiCuaPhien thì hai vế đổi cùng; hoặc deep-equal đỏ giả | Bảng viết trước so từng trường | fixed: E3 bảng viết trước 8 dòng từ merge-base, setting mặc định → null và setting không mặc định → model và cửa sổ, so từng trường |
