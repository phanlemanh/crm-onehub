---
slug: kho-mau-mang-dau-ngay
at: 2026-10-06T22:58:00Z
verdict: findings
p0: 0
p1: 1
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Coverage xếp k3 (giết trong seed) vào Core nhưng E2, E3, E4 đều giết ở hàng migration đầu tiên (k2); không eval nào giết sau migrate, trước seed xong. | Bản cài ghi dấu building sau CREATE nhưng đặt markTemplate với fingerprint thật giữa migrate deploy và seed; lượt bị giết trong seed để lại kho dở mang dấu template khớp nguồn, --tao kế clone nó, mà E2–E4 vẫn xanh. | Thêm điểm giết k3 (mọi migration hoàn tất, chưa có deal) cho E2 và E4; phá thử dời markTemplate lên trước seed phải đỏ. | fixed: contract định nghĩa hai điểm giết (trong migrate, trong seed); AC-2 và AC-4 đo cả hai; E2, E4 có ma trận hai điểm và phá-thử «markTemplate trước seed». Coverage ghi AC-3 đo ở k2 vì luật quét không phân biệt hai điểm. |
| P2 | contract | AC-3 và E3 đo ở maxAgeMs − 1 phút và 2·maxAgeMs + 1 phút, khoảng 12–24 giờ không có mốc, nên lời hứa «xoá sau 12 giờ» không được đo. | Một luật cho kho đang dựng thêm ân hạn tới 24 giờ vẫn để E3 xanh, và tài liệu nói sai mà hồ sơ ký đủ. | Đồng hồ muộn ở createdAt + maxAgeMs + 1 phút. | fixed: AC-3 và E3 dùng createdAt + maxAgeMs ± 1 phút; E3 thêm phá thử «ân hạn riêng cho building». |
| P2 | evals | expected chỉ nêu nhãn ca, không ghim tiêu đề đầy đủ hay số ca; mẫu -t của dmk_* cũ có thể khớp ca mới. | Tên ca mới chứa «tao» hay «kho-mau» làm E5/E6 chạy cả ca giết mới, đo sai tập đã ký. | Ghim tiêu đề đầy đủ và số ca «N pass, 0 fail» cho từng lệnh. | fixed: E1–E4 ghim tiêu đề đầy đủ và «1 pass»; E5–E8 ghim số ca (1, 2, 2, 1) và cùng tập như ở merge-base; design doc cấm tên ca mới chứa bốn mẫu cũ. |
| P2 | evals | Tiền đề «kho mẫu chưa có deal» thiếu đối chứng dương và chạy khi bảng deal có thể chưa tồn tại. | Truy vấn ném «relation does not exist» làm ca đỏ vì lý do đo, hoặc try/catch nuốt mọi lỗi làm tiền đề luôn đúng. | Đếm deal qua to_regclass, không nuốt lỗi khác; đối chứng dương trên kho đo dựng trọn = 1. | fixed: E2 định nghĩa hàm đếm deal dùng chung (to_regclass null → 0, lỗi khác không nuốt); E4 dùng chính hàm đó trên kho đo dựng trọn và đòi bằng 1. |
