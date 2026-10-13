---
slug: bo-ca-mau-quy-4
at: 2026-10-13T00:50:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design (sổ d-…-5) | Chi tiền gọi mô hình ghi là máy quyết; câu trích chỉ nói eval tiêu vào quỹ 20 USD, không quyết mức của hàng này | Ba bốn lượt S4 và lượt ghim lại ăn 30–40% quỹ tháng dùng chung mà chưa người nào chọn | Đổi thành câu hỏi trên thẻ Cổng Phạm vi; rang in tổng USD đã tiêu | fixed: người quyết qua yêu cầu P1-1 (Phan Le Manh, 00:46Z) — trần 2 USD/lượt, ≤ 3 lượt S4; sổ d-…-13 thay câu hỏi d-…-10; AC-7 và E7 thêm tổng USD; E7 khai trong model_evals |
| P0 | design (sổ d-…-2) | «Một lối» cho ca OneHub lấy mục tiêu năm không đứng — viết tay ca OneHub quý trong tệp riêng vẫn sống; đây là nghĩa sản phẩm | Ca thật lúc bật 9b là OKR quý của OneHub, con số hàng này không so được | Câu hỏi trên thẻ, ghi đủ hai lối | fixed: người quyết qua yêu cầu P1-1 — lấy ba mục tiêu OneHub của năm; sổ d-…-14 thay câu hỏi d-…-11 |
| P1 | contract, evals (AC-5, E5) | Bảng nhãn quyết số đạt nhưng không eval nào ghim nó | Bản dựng gán nhãn rỗng, số đạt nhảy lên n/n, E5 vẫn xanh | Bảng nhãn viết trước so toEqual từng ca, chiều đỏ ghim «ca-q4-vh kyVong» | fixed: AC-5 thêm vế nhãn đúng bảng; E5 thêm bảng 32 dòng và chiều đỏ (b); dòng sổ d-…-12 ghi căn cứ nhãn |
| P1 | evals (E7) | Chỉ luật khongGopY có ca đối chứng; bốn luật còn lại và đường «ca thiếu bản ghi» không ai chạy [ban-gieo-gop-y-sau-nop#F1] | Bản chép kiểm NG đọc nhầm trường, mọi ca NG chấm DUNG, E7 vẫn xanh | Ma trận năm luật dựng bằng writer thật, không cần khoá | fixed: thêm E9 (`--tu-kiem`) ma trận bảy dòng phạm luật dựng bằng dongTongKet + hai đối chứng dương; E7 chạy tự kiểm trước khi gọi mô hình |
| P1 | evals (E8) | Câu hỏi judge nhắc từ điển mà CONTEXT.md không trong inputs | Judge đoán, kết quả lật giữa các lượt | Thêm CONTEXT.md vào inputs | fixed: CONTEXT.md vào inputs và paths của E8, câu hỏi gọi tên CONTEXT.md |
