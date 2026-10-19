---
slug: trang-lo-trinh-mo-hinh-hien-thi
at: 2026-10-19T13:46:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Bản chụp cũ (Trục A) không ô nào đo; bản chụp mới không qua lượt JSON như cột Json thật | Bộ đọc bản chụp điền mặc định khác tệp đóng gói, coMoHinh coi khối cũ là mới, trang production hiện 0 mốc mà E6 vẫn xanh | E6 dòng 4 bản chụp cũ qua JSON round-trip, đối chứng khối mới, chiều đỏ ghim «bản chụp cũ mất mốc» | fixed: E6 thêm dòng 4 + dom (c), dòng 3 qua JSON.parse(JSON.stringify) |
| P1 | evals | Dòng số chỉ so với công thức của chính trang, không với đầu ra bộ vẽ | Trang và kỳ vọng cùng công thức sai, ca đối chiếu không đối chiếu gì | E5 so với chữ span dòng số bộ vẽ ghi trong LO-TRINH.html | fixed: E5 dòng 4 rút chữ dòng số từ HTML; E2 ghim chuỗi viết sẵn vi và en, không gọi hàm nhãn. Kịch bản «xong là số đã giao» không đúng với bộ vẽ: bộ vẽ tính xong = độ dài viec_hien − số việc chưa giao, cùng công thức với AC-2 |
| P1 | design | Dòng sổ bỏ design-pass trích một dòng mã không quyết việc bỏ; chữ tiếng Anh và chỗ đặt ở 1280 chưa ghi | Chủ kho thấy câu tiếng Anh và chỗ đặt lần đầu ở Cổng Bằng chứng rồi trả lại | Ghi chữ en và chỗ đặt vào AC-2 và Đặc tả UX; đổi nguồn căn cứ | fixed: AC-2 + Đặc tả UX mục 4 ghi chữ vi/en và chỗ đặt mọi bề rộng; dòng sổ mới supersedes d-4 (mot-loi) |
| P1 | contract | Giấu hàng trùng mã khỏi kiểu xem Mốc dựa trên câu trích không quyết; E3 so tập nên hàng trùng lọt | Một việc gõ trùng mã biến mất khỏi kiểu xem Mốc không dấu vết | Đổi thành Hỏi hoặc mot-loi; AC-3 nói rõ đếm theo gì | fixed: bỏ luật giấu hàng (trang không lọc ngoài khoá), ghi giới hạn ở Notes; dòng sổ mới supersedes d-5; AC-3 nói rõ so tập mã, đếm dòng hiện |
| P2 | evals | E7 không đo tên lộ trình translate=no, chỗ đặt ở 1280, dấu ba chấm | Tên lộ trình bị dịch hoặc dòng số cạnh tên ở 1280 mà E7 mã 0 | E7 thêm ba vế | fixed: E7 dòng 3 áp mọi bề rộng, dòng 4 thêm tên lộ trình, dòng 5 đo cắt chữ; AC-7 nói rõ dấu ba chấm |
