---
slug: pre-push-phan-rieng-pr
at: 2026-10-21T13:25:00Z
verdict: findings
p0: 2
p1: 3
p2: 2
---

# Phản biện context sạch — pre-push-phan-rieng-pr

Một tác nhân tươi đọc đúng năm tệp: design doc, `contract.md`, `evals.yaml`, `decisions.jsonl`, và bài học xuyên hồ sơ
(`claim-scan`). Không đọc hội thoại, không đọc mã.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Sổ ghi bỏ chế độ chạy riêng bài đọc LO-TRINH.html là «chỉ một lối», nhưng lối kia làm được, chỉ đắt; bỏ nó là bỏ đúng ca #523 khởi ra đề bài [khoa-viec-con-dung-thu-tu#F1] | Chủ kho ký và tin vòng này giải #523; gộp xong lần gộp có LO-TRINH.html vẫn tốn 30 phút | Dòng sổ chi-nguoi + Hỏi trên thẻ + Notes nói #523 không được giải | human-gate1: dòng d-…-11 (chi-nguoi, Hỏi-2) thay d-…-4; Notes và design nói rõ #523 không được giải |
| P0 | design | Sổ ghi phạm vi «đỉnh là commit gộp» là «chỉ một lối» với câu chết sai: luật dò về lần gộp gần nhất SẼ bớt được ca gộp rồi sửa thêm (G8) | Cổng Phạm vi duyệt phạm vi bằng một khẳng định sai | Đổi nguồn căn cứ hoặc ghi G8 là ca cố ý để lại | human-gate1: thiết kế đổi sang luật chung theo merge-base (S = tăng khi không có onehub mới); dòng d-…-12 (chi-nguoi, Hỏi-3) thay d-…-1, G8 nay nhẹ |
| P1 | evals | G10 viết trước không thể đúng: commit gộp giữ bản LO-TRINH.html của x nên tệp không có trong phần tăng | Bản cài đúng làm G10 đỏ | Gộp ra bản thứ ba khác cả hai, thêm đối chứng dương | fixed: G10 ghi bản thứ ba, đối chứng dương hai diff |
| P1 | contract, evals | Không ca nào có commit cục bộ chưa đẩy trước lần gộp; bản cài tính tăng từ cha thứ nhất qua hết 15 ca | Mã mới của PR bị bỏ test | Ca G16 + đột biến tăng-từ-cha-đầu | fixed: G16, trục A thêm hình đó, E10 thêm tang-tu-cha-dau ghim G16, E1 lên 16 ca |
| P1 | contract, design | Con số viết trước có thể tính bằng công thức trần | E6 đỏ với bản cài đúng; con số 78 phóng đại | Tính lại bằng S đủ hai vế, ghi lệnh vào design | fixed: tính lại — #523 vẫn 1 tệp, 23 tệp của onehub; lịch sử 351 lần gộp: 6 / 67 trần / 36 đủ hai vế; design ghi bảng và nguồn chênh |
| P2 | evals | E9 (judgment) không khai paths [d-20261021T074226Z-53] | Hồ sơ bị coi là cũ mỗi khi kho đổi | Khai paths | fixed: paths .githooks/gate-shape.json |
| P2 | contract | AC-9 trỏ E5 thay E10 | Người đọc tìm sai eval | Sửa chữ | fixed |
