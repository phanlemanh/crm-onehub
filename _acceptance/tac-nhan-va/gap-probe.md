---
slug: tac-nhan-va
at: 2026-10-14T03:58:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Ngưỡng 15 phút và việc tự khép hội thoại dựng ghi là máy quyết, câu trích «provably dead» không quyết ngưỡng; lưới ghi FAILED lên hội thoại thật | Thẻ Cổng 1 trình ngưỡng như tài liệu đã quyết; lượt dựng chậm bị gắn lỗi, Thử lại làm hai lượt chạy song song | Đổi dòng sổ thành câu hỏi người hoặc trích câu thật sự quyết ngưỡng | fixed: lưới treo ra khỏi vòng (descope d-20261014T034742Z-8 supersedes d-20261014T034143Z-4, nguồn một-lối); vế treo im lặng của vòng là câu hỏi bị bỏ, đã chứng bằng mã eve; lưới thành đề xuất hàng riêng, ngưỡng do người chốt |
| P0 | design | Ba dòng S1 (d-20261014T034143Z-3, d-20261014T034143Z-6, d-20261014T034143Z-7) có câu trích chỉ liên quan, không quyết lựa chọn | Cổng 1 duyệt như thể tài liệu mục tiêu đã chọn luật turnId, bỏ design-pass, bỏ đường đo | Đổi nguồn từng dòng cho đúng | fixed: d-20261014T034742Z-9 (turnId) đổi sang một-lối nêu lối chết; d-20261014T034742Z-10 (design-pass) trích dòng luật «Danh sách» chọn hình đích dưới md và màn mẫu Tài liệu, trạng thái lỗi mới đã ra khỏi vòng; d-20261014T034742Z-11 (đường đo) trích dòng ngưỡng còn trống của opportunity.md |
| P1 | evals | E5 viết tay turnId và toạ độ, không chứng hai phiên con có turnId khác; AC-5 hứa builderById mà E5 chỉ gọi hàm tương đương | eve đánh số lượt lại cho phiên con thì câu vẫn rơi nhánh cùng turnId, E5 vẫn xanh | Sinh payload bằng eve thật qua hai lần giao việc; gắn cross-layer gọi builderById thật | fixed: E5 bước 1 chạy ca eve thật hai-luot-hoi (eve-tran, mockModel) ghi payload gốc nhận được, bước 2 đọc chính payload đó và khẳng định tiền đề turnId khác, toạ độ không lớn hơn; AC-9/E9 cross-layer gọi builderById thật qua tRPC rồi mở màn |
| P1 | evals | Không ui-check nào chụp trạng thái câu hỏi lượt sau và thẻ lỗi treo | Thẻ lỗi hay ô câu hỏi tràn ở 375 px mà Cổng 2 vẫn xanh | Gieo các trạng thái đó trong E4 và đo ở 375, 1440 | fixed: E4 gieo câu hỏi lượt hai bằng payload eve thật (ST-hoi-thoai-hoi-lan-hai); E9 mở /chat ở 375 và 1440, đo không cuộn ngang và ô câu hỏi hiện; thẻ lỗi treo không còn trong vòng |
| P1 | contract | Không AC nào đo sự kiện muộn của lượt đã bị lưới khép | Lượt cũ phát session.waiting sau Thử lại, hội thoại thôi đang làm khi lượt mới chưa trả lời | Thêm AC sự kiện muộn | fixed: lưới khép ra khỏi vòng nên không còn lượt bị khép giữa chừng; sự kiện muộn ghi vào đề xuất hàng riêng ở Out of scope |
