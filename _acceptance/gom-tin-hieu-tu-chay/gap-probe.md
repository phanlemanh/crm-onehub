---
slug: gom-tin-hieu-tu-chay
at: 2026-10-20T05:25:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ chỗ đặt bộ chạy ghi nguồn mục tiêu, nhưng câu trích nói phần chạy theo lịch thuộc kit — không quyết việc dựng bộ chạy trong crm; lối «kit cấp lệnh, crm chỉ khai tệp lịch» vẫn sống [zalo-cau-thu-hai-lien-ket#F2] | Người ký tưởng ghi chú hàng bắt crm tự dựng bộ chạy, duyệt một bản rẽ khỏi kit; sau kit ra bộ chạy riêng, hai bộ cùng mở PR | Thay bằng câu hỏi nêu hai lối | fixed: Hỏi-4 (dòng sổ mới thay d-…-1), lên Cổng Phạm vi kèm khuyến nghị và lối khác |
| P0 | design | Đứng yên khi PR có sửa của người ghi là một-lối/mục-tiêu, nhưng còn lối thêm bản gom thứ hai lên trên sửa của người và lối PR xếp chồng; đánh đổi với ngưỡng 2 ngày là của người [zalo-cau-thu-hai-lien-ket#F1] | Chủ kho sửa rồi để PR đứng 5 ngày, tín hiệu tới sau chờ quá 2 ngày; người ký tưởng không còn lối nào | Câu hỏi nêu các lối kèm giá | fixed: Hỏi-5 (thay d-…-4 và d-…-5); AC-8 nay gọi tên tín hiệu chờ quá 48 giờ |
| P1 | evals | Phiên claude giả không ghi lời gọi; hợp đồng gọi thật (cờ, công cụ, tên skill) không được kiểm; mẫu bản gom do bài kiểm tự dựng | Lượt thật đầu tiên bị chặn quyền ghi hoặc skill cắt lượt ghi ngoài vùng, AC-3/AC-4 đỏ mỗi ngày | Phiên giả ghi argv; đối chiếu với GOM; suy mẫu từ bản gom thật | fixed: E2 dòng 8 (argv: mô hình, trần lượt, công cụ từ GOM, tên hai skill) + giới hạn đã khai trong E2; rejected phần «suy mẫu từ bản gom thật»: `tin-hieu/gom` trên onehub chưa có bản gom nào (chỉ `.gitkeep`) — mẫu đi khứ hồi qua `--chua-gom` thật và răng thật |
| P1 | contract | AC-8 chỉ đếm bản gom đã gộp; bỏ sót tín hiệu đang chờ, tín hiệu qua PR bị phủ quyết, PR dựng lại bằng đẩy ép, và tín hiệu vào onehub qua commit gộp | Ba tín hiệu chờ 5 ngày sau PR đang mở mà lệnh đo vẫn in «đạt» | Thêm bốn ô vào ma trận E8 | fixed: AC-8 viết lại (mọi tín hiệu trên onehub, đường cha thứ nhất, lần đẩy cuối của máy trước commit người); E8 ô 5–8 |
| P2 | evals | Thân PR hứa tín hiệu đã phủ kèm việc đã giao mà E2 không đo; không đo mã lọt vào thân PR; LO-TRINH.html chỉ kiểm có tên trong diff | Thân PR bỏ mục đã phủ hoặc lọt mã; trang không mang hàng mới mà E2 vẫn xanh | Ba việc thêm cho E2 | fixed: E2 dòng 9 (đã phủ + không mã) và dòng 10 (vẽ lại trùng byte, có câu giao hàng mới) |
