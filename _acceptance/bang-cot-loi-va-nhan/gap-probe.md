---
slug: bang-cot-loi-va-nhan
at: 2026-09-21T13:34:02Z
verdict: findings
p0: 0
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E1 dòng khung chờ là khẳng định âm tính thiếu đối chứng dương | Bộ chọn khung chờ lệch với cái Skeleton thật vẽ ra nên dòng đó luôn xanh trong khi khung chờ vẫn quay dưới thông báo lỗi | Thủ tục treo thì cùng bộ chọn đếm được ít nhất một khung chờ, lỗi thì đếm 0 | fixed: thêm đối chứng dương cùng bộ chọn vào E1 |
| P1 | contract | Tải lại sau khi đổi bộ lọc không có tiêu chí | Tải lại gọi lại bằng bộ lọc cũ và hiện cột của bộ lọc cũ dưới thanh lọc mới | Lần gọi lại mang q mới và cột là của lần gọi đó | fixed: thêm AC-6 và E6 |
| P2 | evals | Vế đường dẫn không đổi ở E2 không đo được trên bản giả | Tải lại ghi lại tham số vào đường dẫn mà phép so vẫn bằng | Đếm số lần màn ghi đường dẫn qua bộ chuyển nuqs kiểm thử, kỳ vọng 0 | fixed: E2 đếm số lần ghi đường dẫn |
| P2 | evals | Dữ liệu của E5 có thể viết tay và chỉ đo một chiều đổi | Khoá cột thật khác khoá viết tay nên màn hiện khoá thô mà E5 vẫn xanh; chiều trạng thái sang bước lọt | Rút dữ liệu từ phép tính thật, đo cả hai chiều | fixed: E4 và E5 ma trận hai chiều, dữ liệu rút từ phép tính thật |
