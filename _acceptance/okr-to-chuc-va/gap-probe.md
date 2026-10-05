---
slug: okr-to-chuc-va
at: 2026-10-04T13:58:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | #30 sinh hai câu từ chối mới ở máy chủ; Coverage nói ngôn ngữ en chỉ ở AC-4, Out of scope không miễn khôi phục; AC-5, AC-6 không có eval ở màn | Hai câu mới viết cứng tiếng Việt; quản trị giao diện tiếng Anh bấm Khôi phục nhận toast tiếng Việt — lỗi #18 sinh lại chỗ mới, E7 và E8 vẫn xanh | Lời chặn mang dữ liệu {loai, ten}, câu dựng từ lib/messages; DOM test 2 ngôn ngữ × 2 lý do; ui-check khôi phục ở màn | fixed: khôi phục trả { chan: { loai, ten } } không ném câu; thêm AC-12, E19 (DOM 2×2), E20 (ui-check en, tải lại vẫn ở Đã lưu trữ); Coverage và Đường đo sửa theo |
| P1 | evals | E1 giả «đổi đơn vị» bằng prop ds; bộ chọn đơn vị thật không được đo, #11 không có ui-check | Bộ chọn đơn vị dựng URL mới không mang thuMucTieu; quay về đơn vị cũ thì A mở ra, E1 vẫn xanh | ui-check --phan thu-gon 2 cách khuất qua bộ lọc và bộ chọn thật, đọc aria-expanded và URL thật | fixed: thêm E18 (ui-check, ma trận 2 cách, chiều đỏ replaceState) |
| P2 | evals | E6 kiểm ký tự tiếng Việt trên cả câu có tên khuôn người nhập; fixture tên khuôn không ghim | Tên khuôn có dấu làm bản đúng đỏ; tên không dấu thì phép kiểm không chứng được đã bỏ qua phần không dịch | Ghim «Khuôn Bán hàng»; gỡ [translate=no] rồi mới kiểm; đối chứng dương trước khi gỡ có «á» | fixed: E6 sửa đúng ba ý |
| P2 | evals | E12 dùng hook giả điều khiển tay; chiều đỏ E13 nhân tạo; không đối chứng trên mã cũ | Hook thật trả «than» ngay lần vẽ đầu, lỗi còn; E12 xanh vì hook giả, E13 xanh nhờ nhịp chờ dài | E12 thêm ca hook thật với matchMedia; E13 chạy thêm trên bản merge-base phải đỏ | fixed (một phần): E12 thêm ca 3 dùng hook thật, lần vẽ đầu phải trả chua-biet. deferred: E13 trên merge-base — dựng thêm một phiên app ở mã cũ vượt luật máy (một phiên đo, RAM thiếu); chiều đỏ ở mức mã do E12 ca 1 và ca 3 giữ |
| P2 | contract | Lối A chỉ ghi giá «không sửa được lỗi gõ»; không ai đo quản trị thêm KR vào mục tiêu vừa tạo | Lái thử: quản trị tạo được mục tiêu lẻ nhưng không thêm được KR — vấp R1m-7, CHẾT ở Cổng Giá trị | E9 thêm ô createKeyResult; ghi đủ giá ở sổ | fixed: đổi khuyến nghị sang A+ (tạo lẻ mục tiêu và KR theo luật nhập); AC-7 và E9 thêm ô createKeyResult (so o: 7); sổ ghi dòng thay thế |
