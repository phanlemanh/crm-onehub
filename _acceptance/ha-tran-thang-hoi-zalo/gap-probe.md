---
slug: ha-tran-thang-hoi-zalo
at: 2026-09-26T23:52:00Z
verdict: findings
p0: 0
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | E6b gắn thước tài liệu của hồ sơ đã ký vào AC-6 mà không biết thước đó đòi gì | Thước cũ đòi chuỗi 1.500 thì E5 và E6b không cùng xanh được; lộ ra ở Cổng Bằng chứng | Chạy thước cũ trên cây này trước Cổng Phạm vi, ghi mã thoát | fixed: đã chạy 27/09 — thước cũ không đòi 1.500 nhưng đỏ sẵn trên mọi nhánh sau khi hồ sơ đó gộp (kiểm merge-base); bỏ E6b, ghi lý do vào Notes của contract |
| P1 | evals | Lời hứa không sửa hồ sơ đã ký mâu thuẫn với chữ «ghim lại» ở d-4; không eval nào chạy kiểm trước-gộp | Ghim lại làm đổi tệp của hồ sơ đã ký, hoặc không ghim thì trước-gộp đỏ lúc gộp | Eval chạy trước-gộp với --base và đòi không vi phạm hồ sơ khác | fixed: đọc pre-merge-check.sh — staleness chỉ soi hồ sơ có tệp _acceptance trong diff (STALE-DIFF-SCOPE-GUARD), nên không chạm hồ sơ cũ thì không cần ghim lại; AC-6 viết lại, thêm E7 (không chạm + trước-gộp lọc dòng của chính hồ sơ) |
| P1 | evals | Điều kiện âm của E5 chỉ bắt một cách viết; chiều đỏ chạy trên bản sao tự dựng | Mục Zalo còn «1.500 câu/tháng» mà E5 vẫn xanh | Chiều đỏ trên bản thật của origin; quét mọi 1.500 và 1500 trong mục Zalo; dòng 4b khớp 27/09 | fixed: E5 quét mọi 1.500/1500 trong mục Zalo, đối chứng chạy trên docs/agent.md của commit ad7c8ed0 (ghim sha, không dùng merge-base để khỏi đỏ sau gộp), dòng 4b đòi 27/09 |
| P2 | design | Không khai đồng hồ cho đường thật hoiTacTu; E3 E4 không ghi «qua hoiTacTu» | Test phụ hàm đầu tháng xanh trong khi hoiTacTu tính sai; hoặc hàng câu 300 mang giờ thật tháng 9 | Khai tham số giờ cố định cho cả đếm và ghi | fixed: hoiTacTu nhận now và ghi hoiLuc bằng chính now (đọc mã); E2 E3 E4 ghi rõ qua hoiTacTu với giờ cố định, E2 thêm khẳng định hàng câu 300 nằm trong tháng 10 |
