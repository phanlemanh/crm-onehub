---
slug: bang-thanh-vien-giu-hang
at: 2026-09-25T09:55:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

# Gap probe — bang-thanh-vien-giu-hang

Phản biện context sạch (agent tươi, chỉ đọc design + contract + evals + decisions + bài học claim-scan). Định đoạt one-pass, không re-probe. Mọi bản sửa đã chạy lại trên mã chưa sửa (25/09): 13 DUNG, 14 SAI, mã 1; công tắc phá giữa lượt: mã 2, dọn sạch.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract + evals | AC-3/E3 không nói «nằm trọn» xét chiều dọc hay cả ngang; phá-thử của E3 nhận dòng «hàng bị cắt» của AC-1 | 375 tràn ngang 98px (đã descope) làm E3 đỏ oan; hoặc nới về chiều dọc thì E3 không có dòng đỏ riêng | Khai chiều dọc so với vùng cuộn; phá-thử đỏ bằng dòng của E3 | fixed: AC-3 và thước đo chiều dọc so với hộp của `main`; phá-thử riêng của E3 là `PageShell contained` → «SAI trang cuộn được» |
| P1 | evals | E8 không nói chụp ở vị trí cuộn nào; trang cuộn bằng `main`, ảnh cả trang chỉ ra một khung nhìn | Ở 1440 khối «Được phép vào» nằm dưới mép màn, ảnh không có chỗ nối, E8 không đạt dù mã đúng | Mỗi khổ chụp ở vị trí cuộn định trước, tên riêng, đủ danh sách | fixed: mỗi khổ hai ảnh `-dau` (scrollTop 0) và `-noi` (đáy DataTable giữa khung cuộn); E8 liệt đủ tám ảnh |
| P2 | evals | elementFromPoint không có đối chứng dương, không kiểm tâm nút trong khung nhìn; thiếu người bị đổi thì thành SAI | Hàng của người bị đổi dưới mép màn → null → SAI oan; dữ liệu đổi → nhánh mơ hồ | Tìm thấy nút hoặc mã 2; kiểm tâm trong khung; đối chứng dương | fixed: không có nút → mã 2; thêm «trong khung nhìn» vào dòng nút; thêm dòng đối chứng «tâm tiêu đề trang trả về chính tiêu đề» (xanh cả trên mã chưa sửa) |
| P2 | evals | Dòng «10/10 hàng» đếm hàng DOM, không phải hàng nhìn thấy; không khai cỡ trang | Hàng bị cắt vẫn nằm trong DOM nên dòng số hàng xanh trên mã hỏng | Tử số là hàng nằm trọn trong vỏ; tiền điều kiện ≤ cỡ trang | fixed: tử số = hàng nằm trọn trong hộp vỏ bảng; mẫu số đọc DB; 2 ≤ N ≤ 25 hoặc mã 2; trên mã chưa sửa dòng này nay đỏ «0/10» |
| P2 | evals | Lời hứa dọn «cả khi hỏng giữa chừng» chưa có phép đo | Một nhánh thoát trước finally để lại 15 lời mời trong CSDL dev chung, E7 vẫn xanh | Phá-thử gây lỗi sau khi gieo, đếm độc lập sau lượt | fixed: công tắc `TTV_PHA_SAU_GIEO=1` ném lỗi ngay sau gieo; đã chạy: mã 2, hai dòng DUNG dọn, truy vấn độc lập đếm 0 |
