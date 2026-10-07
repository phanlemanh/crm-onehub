---
slug: dieu-phoi-truoc-mo-dot
at: 2026-10-07T06:45:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Đối chứng dương của E2 là tệp trả lời gõ tay, thiếu khoá voi mà máy thật ghi | Bộ kiểm dựng theo tệp gõ tay, bỏ voi → mọi tệp trả lời việc phụ gộp bị cách ly; E2 vẫn xanh | Đối chứng phải là tệp do bộ phát lịch thật ghi ra, đọc lại qua bộ kiểm; đột biến bỏ voi phải đỏ | fixed: E2 đọc lại ba tệp trả lời do motNhip thật ghi (gia hạn, việc phụ gộp, chạm tệp), tập khoá ⊆ KHOA_TRA_LOI; thêm T6; AC-2 nói rõ |
| P1 | evals | Chiều đỏ T4 của E3 (chép thay vì chuyển) không thể đỏ vì tệp được ghi lại ngay sau khi cách ly | T4 sống, E12 báo đột biến sống dù mã đúng | Thêm một nhịp giữa cách ly và ghi lại, khẳng định tệp gốc vắng và sự kiện vẫn một | fixed: E3 thêm nhịp 2 chưa ai sửa |
| P1 | evals | E5 chỉ dùng hook cây giả nên không đo bản pre-push thật khi được exec vào, cũng không đo stdin và argv được giữ | Khối chuyển lặp vô hạn hoặc đọc mất stdin trước exec → đẩy lọt không qua cổng; E5 vẫn xanh | Thêm ca worktree mang bản pre-push thật; hook giả ghi lại stdin và argv; đột biến đọc stdin trước exec phải đỏ | fixed: E5 bốn ca (a)–(d), ghi lại stdin/argv, thêm chiều đỏ đọc stdin trước exec; AC-5 nói rõ |
| P2 | evals | E4 so lệnh bọc với lệnh gốc mà không đòi lệnh gốc chạy thật | Fixture hỏng thì cả hai cùng thoát 1 stdout rỗng, so bằng vẫn đậu | Mỗi ô đòi lệnh gốc thoát 0 và stdout chứa dấu mong đợi riêng | fixed: E4 thêm đối chứng dương từng ô |
| P2 | evals | E13 hỏi «khoá nào hợp lệ» — ngoài AC-7 và không phán được từ inputs | Hội đồng PASS một danh sách khoá sai vì không có schema để đối chiếu | Bỏ vế đó khỏi judgment, hoặc đo bằng máy | fixed: AC-7 thêm vế danh sách khoá khớp bộ kiểm; E13 bỏ vế đó; thêm E14 script so tập khoá README với KHOA_TRA_LOI, có chiều đỏ |
