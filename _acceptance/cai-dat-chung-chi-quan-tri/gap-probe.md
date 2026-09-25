---
slug: cai-dat-chung-chi-quan-tri
at: 2026-09-24T23:40:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

# Gap probe — cai-dat-chung-chi-quan-tri

Phản biện context sạch (agent tươi, chỉ đọc design + contract + evals + decisions + bài học claim-scan). Định đoạt one-pass, không re-probe.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract + evals | AC-6 đi qua máy chủ nhưng thiếu tag (cross-layer); E6/E8 chỉ đo proxy bằng bộ dựng researchKey giả viết tay theo khuôn bên đọc — lớp lỗi [noi-zalo-cho-nguoi-moi#F1], [zalo-qua-webhook#F1]; AC-4/AC-5 cũng thiếu tag | Trả lời thật có vỏ khác bộ giả, researchKeyAnswer nhận canManage null, cổng settled cho mọi người — quản trị chưa có khoá không còn bị đẩy; E6/E8 vẫn xanh | Gắn cross-layer + eval backend-effect gọi trả lời thật của API qua đúng hàm proxy dùng; chiều đỏ đổi tên trường cờ | fixed: tag cross-layer cho AC-4/5/6; phần đọc + luật cổng dời vào @crm/validation/cong-nghien-cuu dùng chung; E10 lấy trả lời HTTP thật của settings.researchKey (member, admin) đưa qua congNghienCuu, chiều đỏ ghim «admin bi day» |
| P1 | contract + evals | Context hứa chặn qua REST, trục Coverage liệt kê REST, nhưng không eval nào gọi REST | Cầu REST dựng ngữ cảnh khác, member đổi số ngày lưu trữ qua REST; chín ca tRPC vẫn xanh | Thêm ca REST cho member (403) và admin (200) mỗi thao tác | fixed: bài kiểm dựng app bằng createApp() (có cầu /rest); E2 và E3 thành 4 lối × 3 thao tác = 12 ca mỗi bên, gồm REST |
| P2 | evals | E9 không khai trạng thái khoá trên bàn đo và không kiểm địa chỉ trang đã chụp | Bàn đo chưa có khoá, quản trị bị đẩy sang /onboarding/research, ảnh chụp nhầm màn | Tiền đề khoá đã cắm + kiểm pathname trước mỗi ảnh | fixed: E9 thêm bước TIEN DE (configured true, không tự ghi khoá vào DB dùng chung) và kiểm pathname /<slug>/settings, lệch thì thoát mã 2 |
| P2 | evals | E8 không có chiều đỏ, không chốt máy giữ lời «khẳng định cũ giữ nguyên» | Luật mới làm một ca cũ đỏ, người sửa kỳ vọng ca cũ, E8 vẫn thoát 0 | git diff tệp test từ merge-base không có dòng expect/it cũ bị xoá | fixed: lệnh ccq_cong_hoi_quy nối thêm git diff -U0 từ merge-base với origin/onehub, grep dòng bị xoá chứa expect( hay it( thì đỏ; AC-8 thêm vế đó |
| P2 | design + contract | Luồng «Lỗi & quay lại» (403 → toast) trong đặc tả UX không có AC hay eval | Quản trị bị hạ vai giữa phiên bấm Lưu, card nuốt lỗi | Thêm GWT + ca jsdom, hoặc gạch luồng khỏi design | fixed: design ghi rõ đó là hành vi sẵn có (onError toast error.message) vòng này không đổi — không còn là lời hứa mới |
