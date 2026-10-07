---
slug: tro-ly-okr-bo-final-output
at: 2026-10-06T23:40:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E8 không chặn vế «không lượt nào hỏng» của AC-7: lượt hỏng chỉ tính 30 000 ms rồi so p50/p90 | 1 lượt hong:khong-nop và 19 lượt 6–12 s: số 30 000 rơi ở vị trí cao nhất, p90 vẫn ≤ 15 000, E8 xanh dù AC-7 vỡ | Đọc số lượt hỏng của do-tre, khác 0 thì mã 1 «co luot hong: n»; chiều đỏ trên đầu ra mẫu | fixed: AC-7 nói rõ một lượt hỏng là đỏ; E8 đọc dòng «n luot hong», ghim «co luot hong: n», chiều đỏ trong phần tu-kiem |
| P1 | evals | AC-5/AC-6 không đặt cỡ mẫu tối thiểu, chỉ đòi n > 0 | E22 chỉ sinh 5 lời gọi đầu: 0 lần hết trần có xác suất 39% dù lỗi còn | Đếm riêng lời gọi đầu, đòi n_dau ≥ 18 (0,83^18 < 0,05), thiếu thì «mau qua nho: n» | fixed: AC-5 và E6 đòi n_dau ≥ 18 trên lượt E22; AC-6/E7 chứng cấu trúc cho tóm tắt (n_dau ≥ 1), contract Notes nói lời hứa thống kê đứng trên AC-5 |
| P2 | evals | Hai phép đếm âm outputSchema và empty-log không có đối chứng dương | Trace không ghi khuôn vào hay --log trỏ sai: c = d = 0 mọi lượt, d-20261006T232116Z-1 dựa vào phép đếm im | Tự kiểm thêm span thật mang outputSchema và dòng log thật «empty model response» | fixed: phần tu-kiem của E6 đòi cả bốn ô ≥ 1 trên rang/mau-0710/ (span ai.toolCall thật được thêm khoá outputSchema; đoạn eve.log thật); E6 ghi rõ thuộc tính span đọc |
| P2 | contract | AC-3 thiếu ô «việc đã đóng» dù trục Coverage có | Việc tóm tắt đóng hong:het-lease rồi phiên con nộp muộn; bản cài quên kiểm vẫn ghi bản tóm tắt | Thêm ô: giữ hong:het-lease, 0 bản, ketQua tu-choi | fixed: AC-3 và E4 thêm ô thứ bảy |
| P2 | evals | Cửa sổ trace của E6/E7 chỉ có mốc đầu, không tách lượt; E8 đòi máy rảnh không ai cưỡng chế | S4 chạy E6, E7, E8 song song trên cùng .eve/traces: span của lượt khác lọt cửa sổ, E8 đo lúc máy bận | Mốc cuối, chạy tuần tự trong một lượt | fixed: E6/E7/E8 chung một lệnh do-mo-hinh.mjs chạy tuần tự e22 → e17 → e24, mỗi phần có mốc đầu và mốc cuối; in tải máy trước phần e24. Còn lại: bộ test không gọi model của S4 vẫn có thể chạy cùng lúc — ghi vào Notes của hợp đồng |
