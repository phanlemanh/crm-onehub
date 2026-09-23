---
slug: thuoc-o-soan-don-dep
at: 2026-09-23T08:39:36Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Không đo lối lỗi thường (lỗi ném ra không phải KhongDoDuoc) | waitForSelector ném TimeoutError, catch chỉ gán ma=2 cho KhongDoDuoc, finally exit(0) → E1/E2/E8 xanh giả khi thước hỏng | Mốc loi-la chèn throw new Error sau Chrome; bản sửa thoát khác 0, 0 vật sót; bản gốc gọi tên | fixed: AC-2 thêm ca loi-la (thoát 2), E2 thành ma trận 8 dòng |
| P1 | evals | Trục Chrome không có đối chứng dương; nhận diện Chrome bằng hiệu ảnh chụp tiến trình lẫn lượt khác | Mẫu tìm Chrome sai luôn rỗng → 0 vật sót c xanh rỗng; làn song song bị giết Chrome hoặc xoá dấu mốc | Ca SIGKILL phải bị gọi tên sot chrome; nhận diện bằng dấu riêng của lượt; chạy tuần tự | fixed: Chrome nhận diện bằng TMPDIR riêng của lượt; AC-3 thêm đối chứng dương sigkill; E1..E4 chạy qua khoá mot-luot.sh |
| P1 | contract | AC-4 đo hội thoại theo NGUOI trong khi NGUOI vắng; chiều đỏ dựa vào hạn thời gian | Bản sửa lùi về người khác, bộ đo chỉ xem hàng của NGUOI → báo 0 vật sót; bản gốc tự thoát 2 trong hạn → E4 đỏ oan | Vật sót b tính mọi người dùng; chiều đỏ bằng quan hệ | fixed: định nghĩa b = mọi người dùng; chiều đỏ AC-4 = có hội thoại mới và không dòng KHONG DO DUOC nào nhắc NGUOI; hạn là hằng cấu hình |
| P1 | contract | Phần sửa steps E1/E2/E8 của hồ sơ đã ký không có AC đo | Dòng Chay bị bớt chế độ hoặc thêm cờ, E7 vẫn DAT → phép đo đã ký đổi mà không ai thấy | AC so diff evals.yaml cũ chỉ gồm tiền tố NGUOI trên ba dòng Chay, kèm mẫu đối chứng | fixed: thêm AC-9 và E9 (tosd_steps_cu) với hai mẫu đối chứng |
| P2 | evals | AC-8 ghim sha 7cf69d6a | Gộp onehub vào nhánh → tệp apps/** của PR khác lọt vào danh sách, E8 đỏ oan | Đo theo merge-base với origin/onehub | fixed: AC-8 và AC-9 đo từ git merge-base origin/onehub HEAD |
