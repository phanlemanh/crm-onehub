---
slug: ho-so-do-kiem-cheo
at: 2026-10-22T10:55:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ khai not-run cho cron-theo-ban-khai E8 ghi nguồn một-lối, nhưng lối «răng đòi bản production chứa cặp gộp của vòng cron» vẫn sống | Cổng Phạm vi duyệt dòng như việc máy chắc; ô thành not-run, một bản khai cron lệch ở production qua mọi lượt ghim; hội đồng xếp ô vào loại (d) theo lời khai | Thay dòng bằng câu chỉ-người có khuyến nghị và lối khác kèm giá | fixed: d-20261022T104031Z-4 bị thay bằng Hỏi-4 (chỉ người, khuyên neo bản production chứa cặp gộp + một lần đăng nhập Vercel) |
| P0 | design | Câu trích nguồn mục-tiêu không quyết lựa chọn: câu F8 chỉ quyết hai ô của so-okr-tu-chay, không quyết 10 ô kia hay ghim lint; câu bo-okr-mau trích chưa nói «sáu bản chụp» | Chủ kho ký Phạm vi vì tin 11 ô neo và ô lint đã được quyết từ F8; 33 cảnh báo lint mới bị neo khuất; miễn trừ nap.ts không ai chọn | Mỗi dòng mục-tiêu trích đúng câu gọi tên hồ sơ và eval nó quyết, hoặc chuyển sang chỉ-người | fixed: d-…-2 thay bằng Hỏi-2, d-…-5 thay bằng Hỏi-3 (chỉ người); d-…-6 thay bằng dòng trích AC-3 bo-okr-mau «đúng sáu bản chụp số tuần» |
| P1 | evals | E2 lấy tập thay đổi từ nhãn commit tự khai, không kiểm mọi commit của vòng mang nhãn | Commit quên nhãn hạ một ô sang not-run; E2 vẫn xanh | Commit không nhãn không đến từ onehub → COMMIT_KHONG_NHAN, kèm cặp đỏ trên bản sao | fixed: thêm luật COMMIT_KHONG_NHAN và đối chứng vào E2 |
| P1 | evals | E1 không kiểm do-lai-nen.json phủ đủ tập đầu vào; tái lập hẹp hơn lời AC; số trong design, contract tự mâu thuẫn | do-lai-nen bỏ sót một ô đỏ, E1 vẫn xanh; người duyệt ký theo bộ số lệch | E1 suy tập đầu vào từ nguồn, THIEU_DO; tái lập mọi hồ sơ, khai nhóm cần máy chủ; dòng tổng bằng số Context | fixed: AC-1 và E1 viết lại (THIEU_DO, THUA_DO, SO_LECH_CONTEXT, tái lập mọi hồ sơ đầu vào); design và contract dùng một bộ số 27 · 345 · 73 · 22 |
| P1 | evals | E6 hỏi căn cứ trích được và đầu ra đỏ trong khi inputs không mang nguyên văn căn cứ, không mang đầu ra; dòng san-pham-hong vắng khỏi bảng; không gì kiểm bảng là bản máy sinh | Dòng hạ ô viện tệp:dòng có thật nhưng không cho phép hạ, hội đồng chỉ thấy lời khai và chấm PASS | bang-truoc-sau.md mang nguyên văn căn cứ và đuôi đầu ra đỏ cho mọi dòng kể cả san-pham-hong; sinh lại so từng byte | fixed: do-lai-nen.json thêm đuôi đầu ra đỏ; AC-6 và E6 định nghĩa lại bảng; E2 thêm BANG_LECH |
