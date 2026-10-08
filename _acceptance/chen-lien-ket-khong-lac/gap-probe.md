---
slug: chen-lien-ket-khong-lac
at: 2026-10-08T01:25:00Z
verdict: findings
p0: 0
p1: 2
p2: 2
---
## Findings

Vòng phản biện của lần MỞ LẠI Cổng 1 (08/10, thêm bài «Esc» chờ có điều kiện). Vòng đầu (07/10: 0 P0, 2 P1, 1 P2) đã xử lý, giữ trong git.

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals E4 + AC-4 + design | Bài Esc mới chỉ đo chiều chờ chậm vẫn xanh; không đo chiều focus không bao giờ về vẫn đỏ, và hạn 2000 ms | Vòng chờ viết sai (điều kiện luôn đúng, khẳng định bọc trong if) → hồi quy «thôi trả focus» qua cả bốn eval | Chiều đỏ thứ ba: gỡ hẳn lời gọi focus, bài Esc HEAD đỏ trong khối của nó, không timed out, 1500–4000 ms | fixed: thêm E5 (rang/pha-chot.mjs mat) đúng bốn điều kiện; AC-6 hứa thêm vế đỏ sau ~2 giây |
| P1 | evals E4 | E4 không khoanh vào khối đầu ra của bài Esc | Bài chọn trang cũng qua onCloseAutoFocus → đỏ giả hoặc xanh oan nhờ lỗi bài khác | -t tên chính xác, đúng 1 bài chạy, chữ ký + :205 trong khối của chính bài Esc | fixed: E4 chạy riêng bài Esc, đòi đúng 1 bài, chữ ký và trinh-soan-lien-ket.dom.tsx:205 trong khối của nó |
| P2 | evals E2(a) + AC-4 | Miễn so byte cả khối Esc rồi chỉ kiểm hai khẳng định có mặt | Đổi cách bấm Esc hay focus tay trước vòng chờ mà giữ hai expect → E2, E4 xanh | So hunk: chỉ một dòng chờ chèn | fixed: khối Esc HEAD = bản ghim + đúng một dòng `await choTraFocus(editor);` trước khẳng định focus, so từng byte |
| P2 | design | Hai câu cũ «không đổi một byte», «Bài Esc không đổi» mâu thuẫn bổ sung | Reviewer S4 ghi phát hiện trong hợp đồng, hoặc người làm bỏ phần Esc | Sửa câu | fixed: hai câu trỏ tới «Bổ sung 08/10» |
