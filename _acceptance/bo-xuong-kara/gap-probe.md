---
slug: bo-xuong-kara
at: 2026-10-04T06:16:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design (kéo theo E11) | ST-phongmau-hoi-thoai ghi hai cột với hội thoại 380px nhưng không nói phòng mẫu bày thế nào khi khổ hẹp hơn 380px | E11 ở 375×812: cột 380px rộng hơn khung, E11 đỏ «tran ngang» dù cài đúng; hoặc người cài tự xếp chồng mà bố cục chưa qua Cổng Phạm vi | luật phòng mẫu dưới ngưỡng khổ + khẳng định bề rộng và không chồng ở 375 | fixed: design §4 thêm luật «dưới 768px xếp hội thoại trên bản nháp, mỗi vùng rộng bằng khung — bố cục đo khối, không phải bố cục điện thoại K2»; AC-11 và E11 thêm khẳng định ở 375 kèm chiều đỏ chong-cot |
| P1 | evals (E9) | Ma trận hai tiếng chỉ 7 cấu hình, thiếu ô sinh chữ: lý do khoá khi bận, bước đang chạy và bước lỗi, working, empty, off, ô soạn khoá, dòng hệ thống và mốc; số chỗ chưa ghi trước | proposal.tsx viết cứng «Kara đang soạn…» — không ô nào của E9 dựng ra chữ ấy, E9 xanh trong khi màn tiếng Anh hiện tiếng Việt | ma trận phủ mọi ô sinh chữ của E1–E8 + quét nguồn chữ tiếng Việt có dấu ngoài messages, chiều đỏ trên proposal.tsx | fixed: E9 13 cấu hình phủ E1–E8, số chỗ là hằng đầu tệp bài viết trước khi chạy, thêm quét nguồn kara/*.tsx (trừ vi-du) và chiều đỏ proposal.tsx viết cứng lý do khoá |
| P1 | design ↔ evals (E6, E11) | Design §4 hứa nút khoá vẫn nhận focus, E6/E11 đòi disabled — thuộc tính disabled làm mất focus; vị từ khoá chưa chốt | mã đúng theo một bên thì eval bên kia đỏ, hoặc lời hứa focus bị phá mà eval vẫn xanh | chốt vị từ theo cơ chế lockedReason thật của ProposedChange | fixed: đã đọc ProposedChange — khoá bằng thuộc tính disabled thật (NutHanhDong disabled + aria-describedby khi action.disabled); gỡ câu «vẫn nhận focus» khỏi design §4, ghi vị từ button.disabled === true nguyên văn vào E6 |
| P2 | evals (E12) | AC-12 hứa ba trạng thái ở 1440 và 375 nhưng inputs thiếu hoi-thoai-375 và dang-soan-375 | ở 375 lý do khoá bị cắt hay hai vùng đè nhau, hội đồng không thấy, AC-12 «đạt» trên tập ảnh khác tập nó hứa | inputs đủ sáu ảnh theo Given + E11 khẳng định từng ảnh có mặt | fixed: E12 inputs đủ sáu ảnh + ảnh tối; câu hỏi nêu bảy ảnh; E11 khẳng định mọi inputs của E12 có mặt và lớn hơn 0 byte |
| P2 | evals (E11) | Chữ bận hiện sau trễ 1000 ms; E11 chụp dang-soan không chờ chữ ấy | ảnh dang-soan thiếu «Kara đang soạn bản nháp…», E12 câu (3) chấm trên ảnh thiếu lý do khoá, kết quả đổi theo tốc độ máy | chờ có trần cho chữ bận rồi mới chụp + chiều đỏ chup-som | fixed: E11 chờ ≤ 5 s tới khi role=status trong đầu kara-artifact chứa chữ bận, thiếu → 'thieu chu ban'; chiều đỏ --kiem-do-do chup-som; AC-11 ghi điều này |
