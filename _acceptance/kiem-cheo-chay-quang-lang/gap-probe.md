---
slug: kiem-cheo-chay-quang-lang
at: 2026-10-10T00:05:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Phản biện context sạch — kiem-cheo-chay-quang-lang

Một tác tử tươi đọc design, contract, evals, sổ quyết định và opportunity, không đọc code.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract, evals | Không AC nào phủ ca chạm trần lần hai khi tiến độ đã có — đường chính, vì 146 hồ sơ cần 6–7 đêm | Đêm 2 ghi đè tiến độ bằng phần của riêng đêm 2, đêm 3 đo lại hồ sơ đã xong, lệch đêm 1 biến mất | Ca ba đêm sáu hồ sơ, đối chứng ghi đè | fixed: AC-2 viết lại (xong = hợp cũ không bị chạm và mới, do gộp, den = đỉnh đêm đó, k/N trên tập đêm đó); E3 thêm ca ba đêm và bản sao ghi đè phải đỏ |
| P1 | evals | Dòng [lane] mẫu viết tay theo khuôn bên đọc; giả định «một dòng mỗi eval theo thứ tự --slug» chưa đo trên làn thật | Làn thật in khác, xong=[] mãi hoặc xanh giả | Đọc nguyên văn nhật ký thật đêm 10/10 | fixed: E2 đọc nhật ký thật 10/10 (sha256 ghim) với 146 hồ sơ của tệp ngày đêm đó → 21 xong, dở cron-theo-ban-khai; xáo thứ tự dòng làm số xong đổi |
| P1 | contract, evals | AC-4 không nói gộp do trước hay sau khi kết luận; không khẳng định do-moi của đêm trước lật ket_qua | Do-moi đêm 1 nằm trong danh sách mà ket_qua ghi xanh | Ca chỉ đêm 1 có do-moi | fixed: AC-4 gộp trước khi kết luận; E3 đêm 3 sạch mà ket_qua do; eval của hồ sơ dở không vào do |
| P1 | contract, evals | Không AC cho lượt kế thoát 1 hay lỗi hạ tầng khi đã có tiến độ | Đêm cuối thoát 1 bị coi là không chạy được; lỗi hạ tầng xoá mất tiến độ nhiều đêm | Ca thoát 1 và thoát 3 | fixed: AC-4 tính thoát 0 hoặc 1 là đo hết; AC-5 lỗi hạ tầng giữ tiến độ từng byte; E3 thêm hai ca |
| P2 | opportunity, contract | Hai ngưỡng SỐNG/CHẾT không có đường đo | Cổng Giá trị không có số | Ghi tap_lan; nhật ký cấp lượt | fixed một phần: AC-7 tệp ngày ghi tap_lan để đếm hồ sơ đo lại; E1 thêm ô thợ khác tài nguyên + kiểm chéo s4 → cấp cả hai. deferred: bộ phát lịch chưa ghi hàng chờ lúc cấp — Đường đo khai đo tay, Notes ghi giới hạn |
