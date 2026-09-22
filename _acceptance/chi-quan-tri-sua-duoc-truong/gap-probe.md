---
slug: chi-quan-tri-sua-duoc-truong
at: 2026-09-22T03:40:00Z
verdict: findings
p0: 0
p1: 3
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E2 và E3 chỉ đi tRPC bằng phiên, không đi lối REST hay khoá API trong khi lời hứa là «gọi thẳng máy chủ» | Lối khoá API dựng danh tính khác, ctx.user thiếu thì 500, hoặc vai trò null làm quản trị dùng khoá mất quyền | Trục lối vào trong ma trận E2/E3 | fixed: E2 và E3 thêm lối khoá API (member bị chặn, admin làm được), mỗi eval 21 ca; rejected phần REST: REST bridge dùng lại đúng router và createBaseTrpcContext (create-app.ts:129-131), chỉ khác lớp chuyển — ghi trong Coverage |
| P1 | contract | Không AC nào đặt người không thuộc không gian làm việc trước bảy thao tác đổi | requireManager bỏ qua role null, người vừa bị gỡ mà còn phiên vẫn xoá được trường | Hàng non-member trong E2 | fixed: AC-2 thêm người có phiên nhưng không thuộc không gian; E2 lối (c), chiều đỏ ghim «non-member <thao tác>» |
| P1 | evals | AC-7 gắn cross-layer nhưng E7 chỉ jsdom với fixture tự viết; E9 chỉ chụp Cài đặt › Trường | Bảng Trường từ hồ sơ đọc access sai khoá, member thấy nút sáng rồi ăn 403, E7 vẫn xanh | Ảnh thật bảng Trường từ hồ sơ | fixed: E9 thêm ảnh bảng Trường mở từ hồ sơ cho hai vai ở 1440; gỡ tag cross-layer ở AC-6/AC-7, nửa máy chủ nằm ở AC-2/AC-5 |
| P2 | contract | Thước CE của trục lối vào là grep chỗ dựng FieldsList/FieldEditor, không phải chỗ gọi mutation | Một nút thứ ba gọi thẳng fields.create mà không qua FieldsList, member bấm và ăn lỗi | Grep mọi lời gọi bảy mutation trong apps/app | fixed: đã grep — chỉ field-editor.tsx và fields-list.tsx gọi, ghi vào thước CE của Coverage |
