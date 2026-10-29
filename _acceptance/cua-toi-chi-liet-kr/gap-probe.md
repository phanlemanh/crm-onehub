---
slug: cua-toi-chi-liet-kr
at: 2026-10-28T05:45:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Out of scope «Việc của tôi ngoài khu OKR và widget KR ở Tổng quan» không có dòng sổ, lại mâu thuẫn với AC-6 («mọi màn») và E8 (`noi="tong-quan"`) [cap-nhat-gan-day#F2] [don-sau-cho-tac-nhan#F2] | Một màn ngoài khu OKR còn đường cập nhật khác, không eval nào quét, AC-6 phát biểu sai | Dòng sổ cho mục đó hoặc tra mọi nơi gọi thủ tục ghi; gỡ mâu thuẫn E8 | fixed: tra 28/10 — `guiCapNhat` chỉ gọi ở `okr/hop-thoai-cap-nhat-kr.tsx` và `cap-nhat-tuan.tsx`, ghi kết quả vào Out of scope; khối «KR của tôi» ở Tổng quan đưa vào AC-8 và Hỏi-2 (d-…-10); E9 quét toàn `apps/app` |
| P0 | design | d-…-3 và d-…-6 ghi nguồn một-lối nhưng lối khác chưa chết | Cổng Phạm vi tin máy đã chứng minh chỉ còn một lối, không xét đánh đổi | Viết lại `can_cu` với ràng buộc thật hoặc đổi sang chỉ-người | fixed: d-…-12 (Của tôi liên kết thẳng qua `capNhatTuan` thêm `donOkr`, `cycleId`; trang giải chỉ cho lối biết `krId`, ràng buộc «giải lúc bấm, không lúc gửi»); d-…-11 (ràng buộc: các ô không có đường khai thay hợp lệ) |
| P1 | contract | Không AC hứa vòng khép: gửi qua hộp một KR thì KR rời danh sách và rời tin kế | `updatedThisWeek` hay bước gom nhắc chỉ đếm lối cũ, KR không bao giờ rời danh sách | AC cross-layer + eval backend-effect trên kho thật | fixed: AC-6 thêm vế vòng khép, gắn (cross-layer); E15 `ctlk-vong-khep` |
| P1 | evals | Không eval phân biệt chu kỳ của mục tiêu với chu kỳ đang chạy | Trả chu kỳ đang chạy vẫn qua E4, E5, E14; bấm KR chu kỳ cũ mở sai bộ | E5 gieo thêm chu kỳ đã kết thúc; E11 thêm ô chu kỳ cũ; chiều đỏ ghim | fixed: E5 (a) KR của K0 trả cycleId K0 + chiều đỏ «kyOkr la chu ky dang chay»; E11 ma trận 2 bề mặt × 2 chu kỳ; AC-8 nói rõ chu kỳ của mục tiêu |
| P1 | evals | E9 hở: miễn `CapNhatTuan`, chỉ đọc literal, chỉ luật 1 có đối chứng, bỏ `apps/app/lib` | Route cũ render `CapNhatTuan` hay hook gọi `moCapNhat({entry: LOI_VAO.x})` vẫn qua | Cấm cả hai, giải qua type checker, quét toàn app, mỗi luật một bản phá | fixed: E9 viết lại theo đúng thước đo đề xuất, `paths` thêm `apps/app/lib/**` |
