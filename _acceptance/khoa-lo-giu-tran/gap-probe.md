---
slug: khoa-lo-giu-tran
at: 2026-09-06T08:08:20Z
verdict: findings
p0: 0
p1: 2
p2: 3
claims_input: ok
---

# Phản biện context sạch — khoa-lo-giu-tran

Agent tươi, đầu vào: design doc, contract.md, evals.yaml, decisions.jsonl, bài học xuyên feature (claim-scan).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design | Chiều đỏ (AC-4, AC-5) cần bản tasks.ts tại sha 746d3ef8 mà design không nói nạp bằng cách nào; cách tự nhiên là chép đè rồi trả lại, không cách ly tệp nguồn [thuoc-cua-lat-3a-co-rang#F1] | S4 fan-out chạy E4/E5 song song với E1/E2/E7/E9 trên cùng worktree; E4 đè tasks.ts, E7 nạp đúng lúc đó thấy 2 fail; hai chân cùng đè cùng trả, lượt trả sau ghi lại bản CŨ, HEAD đổi thầm, Cổng 2 ký trên mã sai | Bản cũ nạp vào tệp riêng, không ghi vào cây; git status --porcelain tasks.ts rỗng sau khi chạy; sha vắng thì exit 2 | fixed: bản cũ và đột biến chỉ sống ở apps/agent/rang/.tmp/ (gitignore, tên PID) sinh bằng git show; AC-4 ghim git status rỗng và exit 2 khi sha vắng; design ghi mục Răng nghiệm thu |
| P1 | evals | E5, E6 trỏ tệp răng trong apps/agent/test, glob của bun nạp nó vào bun run test (E8) trên cơ sở dữ liệu chung, đúng điều d-4 muốn tránh | E8 chạy suite chung, tệp răng bị nạp, deleteMany({}) xoá agentTask giữa lúc spec khác chạy, suite đỏ ngẫu nhiên; bài EXPLAIN cần bản cũ mà suite không có, đỏ chắc | Design và contract nêu tên tệp răng, vị trí, cách nó không lọt vào bun run test | fixed: tệp răng là apps/agent/rang/khoa-lo-giu-tran.rang.ts, tên ngoài khuôn *.spec.ts, chạy bằng bun test ./rang/…; đo 06/09 bun gọi trần không nạp nó; @crm/db chỉ nối trong apps/agent nên không đặt ở _acceptance được |
| P2 | contract | Trục thống kê khai thước CE là pg_class.reltuples nhưng không AC nào assert nó trước khi gọi; AC-3 gộp hai nguyên nhân đỏ (Postgres đổi kế hoạch, thống kê trôi) | Autoanalyze chen vào sau khi chèn 2 hàng, reltuples = 3, bài bites đỏ trong suite chung dù mã đúng; người đọc kết luận Postgres đổi kế hoạch và xoá canary | Bộ dựng assert reltuples ≤ 1 trước probe, thông điệp riêng | fixed: fixture ném lỗi ghim 'statistics drifted' khi reltuples > 1; AC-3 và E3 tách hai thông điệp; trục chiều đo có thước đếm được |
| P2 | evals | E13 hỏi bài kiểm cũ có bị nới không nhưng inputs chỉ có tệp tại HEAD, không có diff | toHaveLength(2) đổi thành toBeGreaterThanOrEqual(2), số bài vẫn 19, judge đọc HEAD thấy hợp lý, pass | Thêm diff của tệp kiểm so với 746d3ef8 vào inputs | fixed: S3 ghi evidence/spec-diff.patch; E13 nhận nó làm đầu vào và rationale phải trích dòng diff; AC-7/E7 bánh cóc patch khớp diff sống |
| P2 | evals | Chiều đỏ của E6 là giả lập assert, không đột biến mã; không chứng 8 lượt thật sự chồng nhau | Pool hẹp làm 8 lượt chạy tuần tự, E6 xanh dù CTE không khoá gì | Chiều đỏ chạy cùng bài trên bản sao tasks.ts bỏ FOR UPDATE SKIP LOCKED | fixed: đo 06/09 — bản sao bỏ FOR UPDATE SKIP LOCKED, 8 lượt trên 40 hàng trả 16 id mà chỉ 6, 2, 4 id khác nhau ở ba lượt; bản sửa 16 khác nhau cả ba; AC-6/E6 ghim 'duplicate ids' |
