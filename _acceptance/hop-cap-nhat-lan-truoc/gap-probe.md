---
slug: hop-cap-nhat-lan-truoc
at: 2026-10-22T06:40:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-…-1 (nguồn dữ liệu, mot-loi) chỉ giết lối «trường bắt buộc trong dienBienOutput»; lối trường tuỳ chọn còn sống. | Chủ kho ký vì tin ghép ghi chú theo tuần là cách duy nhất; nếu ghép lệch ở S4 thì làm lại thiết kế sau khi ký. | Dòng sổ mới supersedes d-…-1 nêu ràng buộc thật giết lối trường tuỳ chọn. | fixed: d-20261022T061211Z-11 supersedes d-20261022T060817Z-1 — trường tuỳ chọn mà máy chủ luôn trả là khuôn lỏng hơn cái thật sự lưu, trái luật «The schema describes what is actually stored» của AGENTS.md. |
| P0 | design | Dòng sổ d-…-3 (khối đầu hộp, mot-loi) chỉ giết lối hai cột; lối một cột khác (trên ô ghi chú) còn sống, mà design-pass bị bỏ. | Chủ kho ký «đầu hộp» vì nghĩ là chỗ duy nhất; giá cuộn ở 375 chỉ lộ ở ảnh S4. | Đổi thành câu hỏi chi-nguoi có hai lối và giá. | human-gate1: thành Hỏi-3 (dòng sổ chi-nguoi supersedes d-20261022T060817Z-3), khuyên đầu hộp, lối khác trên ô ghi chú. |
| P1 | evals | E3 không có ô biên tuần: lần gửi sát nửa đêm thứ Hai giờ VN (Chủ nhật UTC). | Phép ghép tuần tính theo UTC thì khối mất dòng ghi chú, E3 vẫn xanh. | Ô ghi qua OkrCapNhatService với now cố định 17:30Z Chủ nhật; chiều đỏ bản sao tính tuần UTC. | fixed: E3 thêm ô biên tuần (KR B, now 2026-10-18T17:30:00Z) và chiều đỏ «hct-moi-nhat: B mat ghi chu o bien tuan». Ô «ghi hộ tuần trước» không tồn tại: máy chủ luôn đặt weekStart = dauTuanVN(now), không lùi tuần (okr-cap-nhat.service.ts:178). |
| P1 | contract | Trục E giả định ba chỗ mở cùng có objective.trail; bảng theo đơn vị có thể không có. | Mở từ bảng theo đơn vị, khối không hiện dù KR đã có lần cập nhật. | Ma trận E1 ba chỗ mở. | rejected: mo(mt, kr) nhận kiểu okr.objective có trail ở cả ba chỗ, và bảng theo đơn vị đọc okr.objective trước khi mở (theo-don-vi/bang.tsx:258-268) — trình biên dịch giữ điều này; bản thiết kế và Coverage trục E đã ghi căn cứ. |
| P1 | design | Chữ phụ cũ dưới ô giá trị «Lần trước 70» là số hiện tại của KR, có thể khác số của lần cập nhật trong khối. | KR nguồn số máy: khối «55 khách», dưới ô số «Lần trước 70 khách» — hai số cùng nhãn. | Quyết nhãn mới, thêm trục số đổi ngoài cập nhật, thêm ô E1. | fixed: AC-1 thêm câu «Hiện tại», sổ d-20261022T061211Z-13 (mot-loi), Coverage trục F, E1 ô thứ tư và chiều đỏ «hct-khoi: hai so cung nhan lan truoc (55, 70)». |
