---
slug: dem-dau-cot-khi-dang-luu
at: 2026-09-24T01:32:09Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Chuẩn so «đầu ra máy chủ sau khi lưu» của E2 và E8 là mô hình viết tay, giả định cùng cách tính với bản cài; ở cột bị cắt nó chỉ có thể là «số cũ trừ giá trị thẻ», tức tự đúng theo cách viết | Máy chủ làm tròn tổng hoặc sắp mã tiền khác mô hình, đầu cột nhảy số lúc tải lại mà E2 vẫn xanh; cột bị cắt không giảm số mà không ai bắt | Bài kiểm API chạy lượt lưu thật cho từng ca, ghi đầu ra máy chủ trước và sau thành dữ liệu mẫu; bài kiểm hàm so với dữ liệu đó, kể cả ca cột bị cắt | fixed: E2 viết lại — bài kiểm API «sau-luu» gọi setStage thật và ghi dữ liệu mẫu trước/sau cho 9 ca, gồm cột bị cắt; bỏ mô hình viết tay |
| P1 | contract | Coverage thiếu trục số lượt dời đang chờ; mọi ca chỉ có một lượt | Kéo liền hai thẻ cùng cột, hoặc một lượt đã tải lại khi lượt kia còn chờ; bản cài chỉ chỉnh theo lượt cuối làm đầu cột lệch một thẻ mà E2…E9 vẫn xanh | Thêm AC cho hai lượt cùng chờ và một lượt đã tải lại; hai ca vào ma trận | fixed: thêm AC-10 và E10, ca hai-luot và mot-luot-da-tai vào ma trận E2, trục mới trong Coverage |
| P2 | evals | AC-2 hứa hai loại thẻ không vào tổng nhưng E3 chỉ đo thẻ quy đổi theo tiền cũ | Bản cài phân loại «chưa quy đổi» bằng baseAmountCents; kéo thẻ chưa quy đổi thật không đổi lời báo mà E3 vẫn xanh | Thêm ca thẻ chưa quy đổi thật (baseAmount rỗng) lấy từ máy chủ | fixed: ca chua-quy-doi-that (mã GBP) vào E2/E3, AC-2 nói rõ cả hai loại |
| P2 | evals | Không eval màn nào đọc chữ «chưa quy đổi» khi kéo; E7 chỉ so h3 | Đầu cột lấy lời chưa quy đổi từ nguồn khác; màn không đổi mà E3 đo hàm vẫn xanh | E5 thêm lượt kéo thẻ EUR đọc lời chưa quy đổi; E7 chụp toàn bộ chữ đầu cột | fixed: E5 có lượt 2 kéo thẻ EUR đọc lời chưa quy đổi và mã tiền ở hai cột; E7 kéo thẻ EUR, chụp toàn bộ chữ h3 (gồm tổng và lời chưa quy đổi) |
| P2 | evals | E1 so cờ counted với seed viết tay, không nối cờ với tổng máy chủ thật trả | Tổng cột dùng thêm điều kiện mà cờ không có; kéo thẻ đó trừ tổng sai mà E1 vẫn xanh | Khẳng định quan hệ: ở cột hiện đủ thẻ, tổng giá trị quy đổi của thẻ counted bằng valueCents; countedCount 0 thì valueCents rỗng | fixed: E1 thêm 7 khẳng định quan hệ, AC-9 ghi rõ quan hệ đó |
