---
slug: ci-test-duoi-tran
at: 2026-10-07T21:30:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals E1/E2 + AC-2/AC-3 | Chưa eval nào đo mã thoát của TIẾN TRÌNH khi một nhóm đỏ, và vế «trước khi chạy bài nào» của AC-2 | ketQua đúng nhưng main gọi process.exit(0) sau allSettled → pre-push/CI nuốt đỏ, E1/E2 vẫn xanh | Ô CLI thật với test-run giả; đếm spawn | fixed: E1 thêm ô (f) bốn nhóm lần lượt đỏ + đối chứng xanh trên tiến trình CLI thật, (g) gói thừa → thoát khác 0, đếm spawn = 0; trình chạy có cờ --test-run, --goc để thay tiến trình con |
| P1 | evals E1e + AC-4 | AC-4 chỉ đo hàm trả mảng lệnh, không đo spawn thật với đối số có dấu cách/nháy | spawn dùng shell hay join → lệnh config bị tách, mọi làn ghim lại của kho đỏ | So argv từng byte với lời gọi thẳng, lấy lệnh config thật | fixed: AC-4 hứa argv trùng từng byte; E1 ô (h) dùng một lệnh có thật trong config.yaml |
| P2 | design + opportunity | Tiền đề «máy CI 4 nhân» chưa đo | Kho private chạy máy 2 vCPU, 7 GB → bốn nhóm cùng lúc tranh CPU/RAM, vượt ngưỡng 12 phút | Ghi số nhân thật, tính lại đường găng | fixed: kho xác nhận private (gh repo view); thiết kế đổi sang tối đa min(số nhân, 4) nhóm cùng lúc, nhóm dài trước; đường găng 2 nhân ≈ 10.4 phút; ngưỡng AC-6 thành job < 22, test < 16; giả định 3 thêm vào opportunity; E1 ô (i) đo giới hạn song song |
| P2 | evals E2(d) + AC-5 | Khẳng định âm tính không có đối chứng dương; paths thiếu verify-gate-shape.mjs, .githooks | Bản tóm tắt nằm sai chỗ → (d) xanh rỗng, push thật bị chặn [nen-kara#F1] | Tự đếm hợp gói từ .turbo/runs; chiều đỏ bỏ một tóm tắt | fixed: E2 thêm (e) đếm hợp gói từ tóm tắt mới của lượt = 11 (rút từ workspace, không viết tay), chiều đỏ trong bộ nhớ bỏ một nhóm; thêm hai đường vào paths |
| P2 | evals E3 | E3 neo sha HEAD và paths có package.json → ghim lại sau này kẹt khi chưa có CI cho sha mới | PR sau nâng gói, E3 mã 2, làn BLOCKED | Chọn lượt CI mới nhất có cây con trùng HEAD; thu paths | fixed: E3 chọn lượt CI hoàn tất mới nhất có scripts/ci, package.json, test-run.ts trùng HEAD; paths thu về scripts/ci/** và răng của nó |
