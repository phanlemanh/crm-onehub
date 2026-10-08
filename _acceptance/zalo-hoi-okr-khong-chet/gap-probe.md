---
slug: zalo-hoi-okr-khong-chet
at: 2026-10-08T10:31:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | evals | E1 không kiểm model gốc có thật sự gọi tro_ly_okr và nhận kết quả từ công cụ đè; chiều đỏ một lượt model thật | Model không gọi tro_ly_okr ba lượt → E1 xanh mà bản đè chưa chạy; lượt đỏ duy nhất không gọi → đỏ oan | Đếm lượt có dòng «→ tro_ly_okr» trong eve.log, đủ ba lượt có gọi, trần lượt; chiều đỏ tới ba lượt, không gọi lượt nào thì exit 2 | fixed: E1 đếm lượt có gọi (đủ 3, trần 6), «goi subagent that» tính là sai, chiều đỏ tới 3 lượt với exit 2 khi không kết luận được |
| P1 | contract | Ranh giới AC-4 thiếu PRODUCT-MAP.md và các tệp ghim lại của hồ sơ khác | Commit vẽ lại bản đồ sau Cổng 1 làm E4 đỏ | Thêm tệp bản đồ; ghim lại hồ sơ khác nếu lưới đòi | fixed: thêm PRODUCT-MAP.md, LO-TRINH.html; ghim lại hồ sơ khác rejected: kit 2.24 chỉ soi hồ sơ có trong diff nên sửa config.ts không bắt ghim lại hồ sơ khác |
| P1 | evals | Vế «okr-uy-quyen.spec.ts không sửa» không ai đo, glob AC-4 lại cho sửa | Nới ma trận trong okr-uy-quyen.spec.ts, E3 vẫn xanh, E4 nhận | Khẳng định tệp không đổi; thu glob | fixed: AC-4/E4 chỉ nhận okr-uy-quyen-ngoai.spec.ts; E4 có đối chứng «ngoai ranh gioi: apps/agent/test/okr-uy-quyen.spec.ts» |
| P1 | evals | Vế «phiên okr còn nguyên subagent thật» chỉ đo bằng ctx chép từ spec hook | purposeOf ở step.started đọc khác ctx của hook; phiên OKR thật bị đè, E2 vẫn xanh | Dựng ctx bằng fixture của resolver step.started; thêm một lượt eve thật ở purpose okr | fixed: E2 dùng phienAudit của test/support/eve-kieu.ts (fixture của okr-chi-tro-ly.spec.ts); AC-5 + E6 chạy lại E9 của tro-ly-okr-nen (eve thật, calledSubagent tro_ly_okr) |
| P2 | evals | «Đúng một tin trả lời» đo bằng ô bảng md có thể ghép; eve.log không ghim thư mục | Hai tin ghép lại vẫn có «OKR»; đọc nhầm eve.log | Đếm tin Zalo giả nhận; ghim đường eve.log theo thư mục lượt | fixed: tách ô theo « / » (cham-bo-do nối tin Zalo giả bằng « / ») và đòi đúng một tin, so nguyên văn với ZALO.loi.tacTuLoi; eve.log ghim <dir>/luot-1/eve.log của chính lượt; deferred: đếm từ bản ghi Zalo giả cần sửa cham-bo-do (ngoài ranh giới) |
