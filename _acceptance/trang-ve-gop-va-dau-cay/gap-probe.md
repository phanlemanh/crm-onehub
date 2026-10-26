---
slug: trang-ve-gop-va-dau-cay
at: 2026-10-23T09:20:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Phản biện context sạch — trang-ve-gop-va-dau-cay

Người phản biện: tác tử tươi (vai chấm-đọc), chỉ đọc design, contract, evals, sổ quyết định và tệp bài học (claim-scan).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design, contract AC-9, sổ dòng 6 | Dòng nhận CI chạy trên merge-ref ghi máy quyết (một lối), nhưng lối «chỉ nhận khi cây merge-ref trùng cây đỉnh» vẫn sống; chọn giữa hai là khẩu vị rủi ro | Đỉnh H đỏ một mình, H gộp onehub O1 xanh; lần đẩy sau cùng cây với H bỏ test và build vì «đã xanh ở CI» | Một dòng chỉ-người trình hai lối; nếu chọn lối hai thì E11 thêm ca base không là tổ tiên | human-gate1: dòng sổ chỉ-người mới thay dòng 6 (Hỏi ở Cổng Phạm vi, khuyên giữ như hiện nay) |
| P1 | evals E5 (3), contract AC-10 | Thước --no-verify đo chuỗi có mặt ở mọi tệp không phải .md, mà evals.yaml của vòng chứa chính chuỗi đó | E5 đỏ ở S4 trên cây sạch, người làm phải nới thước sau ký | Đo dòng thêm trong .githooks, scripts, .github, package.json; thêm đối chứng âm | fixed: AC-10 và E5 (3) đo theo bốn vùng tệp chạy được, thêm đối chứng âm (chuỗi trong evals.yaml và docs vẫn đạt) |
| P1 | evals E10, E11 | Bộ mẫu sổ chạy và check_runs viết tay đúng khuôn bên đọc; tên job trong tệp khai không so với ci.yml, acceptance.yml | Bên đọc so «"0"» trong khi kit ghi số 0, hay tên ô lệch; E10, E11 xanh mà hai nguồn chết trên kho thật | Mẫu chép từ dữ liệu thật; quét mọi run-log thật; tên dựng từ workflow | fixed: E10 dùng dòng chép nguyên văn từ sổ chạy thật và thêm ca (g) quét mọi run-log của kho; E11 dùng đầu ra gh thật của #538 lưu ở rang/mau và thêm ca (f) so tên với ci.yml, acceptance.yml |
| P1 | design E nguồn 1, evals E9 | Dấu ghi cả bước «đã chứng» nên tự gia hạn và đổi tên chứng CI thành «hook»; E9 chưa thử node, bun, chưa có đối chứng dương nhiều ref | Ngày 0, 13, 26: dấu 26 ngày tuổi vẫn bỏ năm bước | Dấu chỉ mang bước thật sự chạy; thêm ca chuỗi ngày, CI rồi hook, bun, node, hai ref | fixed: design, AC-7 và tệp khai đổi luật ghi dấu (sổ dòng fix); E9 thêm ca (e) chuỗi ngày, (g) bun và node, (i) hai ref cả dương lẫn giao, (j) CI không thành hook; E12 thêm đột biến (i) |
| P2 | contract Out of scope, sổ | Phương án 2 của hạt giống, giới hạn GitHub vẫn báo xung đột, rebase/cherry-pick không có dòng sổ | Cổng Phạm vi duyệt B như lời giải cho 53 phút mà không thấy phần còn lại | Dòng descope và mục Đường đo nói phần nào được cắt | fixed: hai dòng descope (phương án 2, rebase/cherry-pick); contract «Đường đo» và design «Phần nào của 53 phút B cắt được» |

Ghi chú của người phản biện, đã xử lý: E2 cần `bcf7ecdf9` (đầu #550, chưa gộp) — rang/ca-550.mjs thử `git fetch origin pull/550/head` một lần trước khi thoát mã 2.
