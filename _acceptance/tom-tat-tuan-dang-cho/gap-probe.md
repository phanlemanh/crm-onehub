---
slug: tom-tat-tuan-dang-cho
at: 2026-10-22T06:25:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-20261022T061149Z-9 ghi nguồn muc-tieu nhưng câu trích của docs/agent.md chỉ xác nhận chỗ đặt gói đọc chung, không quyết vế «lịch tác tử giữ nguyên, hai luật canh bằng E4»; lối một luật dùng chung vẫn sống | Cổng Phạm vi duyệt hai luật giờ vì tưởng tài liệu kho đã quyết; đổi giờ xếp sau này phải sửa hai chỗ | Dòng sổ mới supersedes, nguồn mot-loi có ràng buộc thật hoặc chi-nguoi kèm khuyen và loi_khac | human-gate1: dòng d-20261022T061526Z-10 (chi-nguoi, Hỏi-2) thay d-…-9; nháp theo khuyến nghị một luật dùng chung, design mục Tệp và AC-3 sửa theo |
| P0 | design | Dòng sổ d-20261022T061129Z-6 bỏ tự làm mới với lối chết «hỏi máy chủ suốt bảy ngày», trong khi một lần hẹn giờ ở luc và nhịp ở dang-xep vẫn sống [gia-co-gom-tin-hieu#F2] [pre-push-phan-rieng-pr#F1] | Người mở Họp tuần 06:00–06:05 thấy «đang xếp… vài phút» mãi | Dòng sổ mới supersedes với căn cứ đúng | fixed: làm luôn tự hỏi lại (dang-xep theo nhịp hoiLaiMs, toi-luc một lần ở luc); dòng d-20261022T061526Z-11 (mot-loi) thay d-…-6; AC-1, AC-4, E1, E5 thêm vế hỏi lại; bỏ mục Out of scope tương ứng |
| P1 | evals | Phép kiểm âm của E6 cấm «đ» trong khi chuỗi đúng «Kara chưa tóm tắt được» chứa «đ» | Bản cài đúng AC-5 vẫn làm E6 đỏ | Mẫu đo số tiền thật kèm đối chứng dương | fixed: E6 đo mẫu /\d[\d.,]*\s*(₫ hoặc đ\b hoặc USD)/ và /\$\s*\d/, đối chứng dương «1.200.000 đ», «5 USD», «$5» bị bắt, hai chuỗi AC-5 lọt |
| P1 | contract | AC-3 chỉ ghép lượt xếp thật ở ca đọc trưa ngày cập nhật; nhánh tuần sau (phòng bật sau giờ xếp) không được ghép, mà tác tử chỉ xếp phòng có cập nhật trong cửa sổ 7 ngày | Bật thứ Tư 21/10, thấy «06:00 thứ Ba 27/10»; không cập nhật thứ Hai 26/10 thì bản không tới | Given của AC-3 có điều kiện cửa sổ; E4 thêm ô tuần sau có và không có cập nhật mới | fixed: AC-3 thêm điều kiện cửa sổ; E4 thêm hai ô (có cập nhật 26/10 → 1 việc, không → 0 việc); dòng chờ nêu thêm thứ cập nhật («sáng hôm sau ngày cập nhật thứ Hai») |
| P2 | contract | AC-4 không buộc hôm nay là ngày xếp của chu kỳ; E5 không có ô ngày không khớp | 06:03 thứ Tư, việc xếp của thứ Tư chưa đóng → dòng hứa «vài phút» cho bản tới 27/10 | AC-4 thêm điều kiện; E5 thêm ô (d) | fixed: AC-4 thêm «hôm nay là ngày xếp của chu kỳ»; E5 thêm ô (d) và chiều đỏ ghim «(d) ra dang-xep o ngay khong khop» |

Rủi ro ngoài trần năm finding (từ ghi nhớ của kho): `TZ` đặt từ ngoài có thể không áp. Xử lý: fixed — E3 và E8 tự
assert `Intl.DateTimeFormat().resolvedOptions().timeZone` bằng đúng TZ đã đặt.
