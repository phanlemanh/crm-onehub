---
slug: kara-khong-ghi-de-truong
at: 2026-10-20T13:22:00Z
verdict: findings
p0: 1
p1: 2
p2: 1
---

# Gap probe — kara-khong-ghi-de-truong

Phản biện context sạch, một tác tử tươi, đọc design + contract + evals + sổ quyết định + bài học xuyên hồ sơ (claim-scan).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ bỏ đường-đo ghi nguồn mot-loi, nhưng lối «đo» vẫn sống (đếm từ chối và thay sau gộp); bỏ Cổng Đáng và thước Cổng Giá trị là việc chỉ người quyết | Chủ kho duyệt vì tin không đo được; sau gộp không ai biết Kara có tự thay ngay sau mỗi lần bị từ chối | Thay dòng 5 bằng một dòng chi-nguoi (Hỏi-2) kèm khuyến nghị và lối khác | human-gate1: dòng d-20261020T131702Z-6 supersedes d-20261020T131406Z-5, lên thẻ thành Hỏi-2 |
| P1 | evals | E1 chỉ đo hai chuỗi có mặt trong lý do; câu điều kiện «chỉ thay khi người bảo» không được ghim; E8 không đọc fields.ts nơi câu lý do sống | Lý do chỉ ghi «gọi lại với replace: true» — E1, E8 xanh, Kara tự gọi lại và thay giá trị người gõ | Ghim câu điều kiện trong E1; thêm fields.ts vào inputs E8 và nới câu (5) | fixed: AC-1 Then ghim «only if the rep asked you to in this conversation», E1 ném 'kgd: ly do thieu dieu kien'; E8 inputs thêm apps/agent/agent/lib/fields.ts, câu (5) phủ lý do từ chối |
| P1 | evals | Ngữ cảnh phiên có người viết tay đúng khuôn bên đọc, không round-trip qua hàm thật; không eval nào khẳng định isAutomated bằng false | Phiên hội thoại thật mang khuôn khác, isAutomated trả true, replace luôn bị từ chối mà E3 vẫn xanh | Dựng ctx bằng hàm thật của kênh hội thoại; khẳng định isAutomated false | fixed: E1, E2, E3, E5, E7 dựng ctx bằng thanhVienPrincipal(<thành viên thử>, 'crm-app') của channels/eve.ts, ném 'kgd: ctx co nguoi la nen' |
| P2 | contract | Lượt Tác nhân xếp Never «cùng ô AC-4» nhưng E4 không có ô nào dùng ngữ cảnh lượt Tác nhân | Ngữ cảnh lượt Tác nhân khác taskAuth, isAutomated không nhận ra, Kara thay giá trị người gõ, không eval nào đỏ | Đưa lượt Tác nhân vào Core, E4 sáu ô | fixed: AC-4 và E4 thành sáu ô (thêm team-agent × replace); ctx chép khuôn runDeployedAgent vì không có writer xuất ra — giới hạn khai trong E4 |
