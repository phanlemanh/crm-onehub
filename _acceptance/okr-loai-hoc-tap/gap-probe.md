---
slug: okr-loai-hoc-tap
at: 2026-10-07T14:45:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

# Gap probe — okr-loai-hoc-tap

Phản biện context sạch: một tác tử tươi chỉ đọc design doc, contract, evals, sổ quyết định và gói bài học xuyên feature (claim-scan, 12 dòng).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | AC-7 cho phép tải lại màn; không eval nào đo nhãn đổi ngay sau khi lưu và hộp khép kỳ mở bằng bấm không đọc bảng cũ | Lưu điều học được mà nhãn vẫn «Chưa trả lời», hộp khép vẫn chặn vì bangCham cũ trong cache; E11 vẫn xanh nhờ goto | AC-7 «không tải lại»; E11 bước 4 đặt dấu trang, mở hộp khép bằng bấm; chiều đỏ bỏ làm mới cache | fixed: AC-7 viết lại + tag cross-layer; E11 bước 4 dấu window.__mocMan và điều hướng bằng bấm; chiều đỏ --chieu-do E11b; thêm E18 backend; design ghi kiểm onSuccess |
| P1 | contract | Trục C và E7 thiếu «chờ duyệt»; đột biến không bắt cách lọc kiểu loại trừ | Mục tiêu học tập chờ duyệt chặn khép kỳ mà không có ô để ghi, quản trị kẹt | E7 ma trận bốn trạng thái viết trước; đột biến loại trừ | fixed: AC-5 bốn chu kỳ theo TRANG_THAI_MUC_TIEU; E7 bảng 4 dòng so tập status; đột biến (m) |
| P2 | evals | E6 đo thông điệp bằng chữ «1» có mặt, không đo số và tên theo thứ tự khi có nhiều mục tiêu | In cứng «1 mục tiêu» hoặc chỉ tên đầu vẫn xanh | Ca hai mục tiêu, so nguyên văn và thứ tự position | fixed: E6 thêm ca hai mục tiêu position ngược, toEqual chuỗi và mảng; đột biến (l) |
| P2 | evals | Màn thật không có ca mục tiêu học tập với điểm trống; E13 không có chiều đỏ riêng | Màn thật ẩn nhãn khi điểm trống qua đường DOM giả không dựng | E11 bước 2 trước khi chấm KR của H; chiều đỏ E13 bằng olht_man | fixed: gieo H với KR chưa chấm, chấm sau bước 2; --chieu-do E13 |
| P2 | contract | Tên mục tiêu (dữ liệu người nhập) trong hộp chặn không đòi translate="no" | Trình duyệt tự dịch tên, người không đối chiếu được | E8 đếm phần tử translate="no" bằng số mục; đột biến bỏ thuộc tính | fixed: AC-6 thêm vế; E8 ca (a); đột biến (n) |
