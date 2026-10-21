---
slug: so-do-toan-vung
at: 2026-10-21T07:20:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

Lượt hai, chạy lại trên bộ hồ sơ đã đối chiếu VK2 thật (21/10). Lượt một (19/10, 1 P0 · 4 P1, đã xử hết) nằm trong
lịch sử git của tệp này.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design (sổ d-20261019T171123Z-18) | d-18 ghi `mot-loi` cho prop thu trong `packages/ui`, nhưng lối chết chỉ nói ai làm prop; lối «vỏ khu thôi dựng `AreaSidebar`» (như `anThanhBen` của bản mẫu) vẫn sống, không chạm `packages/ui` | Cổng Phạm vi duyệt luôn một thay đổi trên thành phần chung mà hồ sơ đã ký VK1 đo; ở S3 eval VK1 đỏ, trễ một lượt | Dòng sổ mới thay d-18 nêu hai lối và giá, hoặc đổi nguồn thành chi-nguoi | human-gate1: dòng sổ mới thay d-18 thành Hỏi-5 `chi-nguoi` (khuyên bỏ dựng thanh bên như bản mẫu); design, Notes soạn theo lối khuyên; AC-2 đúng với cả hai lối nên hợp đồng không đổi theo câu trả lời |
| P1 | evals | E11 chỉ quét eval `test`/`script`; eval `ui-check` của hồ sơ đã ký mở đường cũ hay đọc `role=tree` lọt; AC-10 và E11 khác phạm vi | Một eval `ui-check` DH5 hay L3 còn khai sống, đỏ ở lượt ghim của PR khác sau gộp, không cửa bypass | E11 quét mọi executor theo chuỗi bỏ; đối chứng dương có ui-check DH5; AC-10 cùng phạm vi | fixed: E11 thêm vế (b) quét mọi executor theo `rang/chuoi-bo.json`, ui-check/judgment phải khai nghỉ hoặc có dòng `rang/giu-ui.json`, thiếu in «MAT THUOC»; đối chứng dương có ui-check DH5; AC-10 viết lại cùng phạm vi |
| P1 | evals | Giữ toàn màn hình qua đổi kiểu xem chỉ đo ở jsdom bằng cách dựng lại cùng cây vỏ; E10 không đo điều hướng thật qua ngăn | Trên trình duyệt thật vỏ dựng lại khi đi qua đường rewrite hay nút là `<a>` thường; thanh bên bật lại mà E2, E3, E10 xanh | Bước E10 có biến dấu trên window, bấm thẻ › ngăn › «Xem trên sơ đồ» › «Về sơ đồ cả công ty» | fixed: E10 thêm bước điều hướng thật với `window.__vk6Dau`, hai ca, đối chứng đỏ `<a>` thường; AC-10 thêm vế ấy |
| P1 | evals | `paths` thiếu tệp eval đọc: E2 thiếu `area-sidebar.tsx`, E1 thiếu `docs/design.md`, E5 thiếu `okr-tham-so.ts`, E3 thiếu `objective-sheet.tsx` | PR khác đổi tệp ấy sau gộp, bộ lọc hoá cũ không đánh dấu eval cũ | Mỗi eval khai đủ tệp; script so bao đóng import | fixed: thêm đủ các tệp đã nêu, cộng `page-shell.tsx` (E1), `okr-quanh.ts` (E3), `okr-vo-khu.ts` (E9). deferred: script so bao đóng import — việc của kit, không riêng hồ sơ này |
| P2 | evals | E10 đo bề rộng ở 1440 khung thường, nơi vùng nội dung đã hẹp hơn `max-w-7xl`; bộ chọn vùng nội dung chưa gọi tên | Còn `PageShell` mặc định mà ảnh khung thường vẫn DUNG | Gọi tên bộ chọn; đo ở toàn màn hình hay 1920 với đối chứng đỏ | fixed: vùng nội dung = `main[data-slot=page-shell-scroll]`; đo thêm ở toàn màn hình và 1920, đối chứng đỏ bọc `PageShell` mặc định in «khung con be rong toi da» |
