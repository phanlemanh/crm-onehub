---
slug: gia-co-gom-tin-hieu
at: 2026-10-21T14:30:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Luật cho phép mở Skill cho mọi skill; một skill khai allowed-tools tự cấp quyền công cụ khi chạy | Một skill của gói kit khai allowed-tools Bash(node:*), tín hiệu dặn gọi skill đó rồi chạy node đọc /proc của tiến trình claude, lấy khoá; E2 vẫn xanh | Khoá Skill theo tên; E2 đọc phần đầu hai skill; E8 thêm việc gọi skill rồi chạy node | fixed: luật chỉ cho Skill(acceptance-gate:gom-tin-hieu) và Skill(acceptance-gate:cat-luot); AC-2 thêm vế hai skill không tự cấp quyền và mọi lệnh chúng nêu đều được phép; E2 dòng 11–13 kèm hai chiều đỏ; E8 việc 8. Đã kiểm gói 2.33.1: không skill nào khai allowed-tools |
| P0 | contract | Dòng sổ bỏ đường đo ghi một-lối trong khi lối hỏi chủ kho khai ngưỡng vẫn sống | Cổng Phạm vi duyệt bỏ đường đo như máy chắc chắn; Cổng Giá trị không có số | Dòng sổ thay thế, hoặc thành câu hỏi | fixed: dòng mới supersedes d-20261021T142626Z-11, nguồn chỉ-người (Hỏi-3) với khuyến nghị và lối khác có giá |
| P1 | evals | AC-8 không đo khoá mô hình vắng khỏi môi trường lệnh kit; cờ gỡ khoá chỉ được E1 kiểm có mặt | Bản ghim bỏ qua cờ gỡ khoá; mọi lệnh con thấy khoá; E1, E8 vẫn xanh | Bọc lệnh kit ghi env; biến mồi phải vắng; chiều đỏ khi bỏ cờ | fixed: E8 dòng 6 — gốc kit của phép thử là bản bọc ghi env, biến mồi AWS_SECRET_ACCESS_KEY (Claude Code phải gỡ) vắng; chiều đỏ bỏ cờ gỡ khoá. Không dùng chính khoá mô hình làm mồi vì phép thử cục bộ cần khoá thật để gọi mô hình |
| P1 | evals | Không eval nào chứng skill gom thật làm xong việc chỉ với các lệnh đã liệt | Skill thật cần một lệnh chưa liệt; mọi lượt trên Actions đỏ ở răng; tám eval vẫn xanh | Lượt gom thật một tín hiệu, permission_denials rỗng; kiểm tĩnh lệnh của skill | fixed: E8b chạy chayGom thật với Claude Code thật, đạt khi giao PR và 0 lời gọi bị từ chối; E2 dòng 13 kiểm tĩnh khối lệnh của hai skill; lượt in số lời gọi bị từ chối (AC-3, E3 ca ba) |
| P1 | evals | Bước cài gói kit có thể lưu token dưới thư mục nhà mà E4, E4b không chạy bước đó | Cài gói lưu URL mang token dưới ~/.claude/plugins, phiên đọc được qua --add-dir | Chạy lệnh cài thật với HOME tạm, quét | fixed (đổi cách đo): lượt tự quét bản checkout và thư mục nhà tìm giá trị token TRƯỚC khi gọi phiên, đỏ «token nằm trên đĩa» — chốt chạy trên chính máy Actions sau bước cài thật; AC-4 vế ba, E4b ca chốt trước phiên. Không chạy lệnh cài gói trong bài kiểm vì nó cần token thật tới kho kit riêng tư |
