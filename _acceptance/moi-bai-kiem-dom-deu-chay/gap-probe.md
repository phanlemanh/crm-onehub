---
slug: moi-bai-kiem-dom-deu-chay
at: 2026-09-23T14:26:50Z
verdict: findings
p0: 2
p1: 1
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Thước ghép stdout và stderr thành hai khối rời, nên dòng `chay-dom:` (in ra stdout) và dòng «Ran N tests across 1 file» (Bun in ra stderr) không nằm cùng một đoạn khi cắt theo `chay-dom:` | Bộ chạy mới đúng hoàn toàn, nhưng mọi đoạn cắt theo `chay-dom:` chỉ chứa tên tệp, còn mọi dòng «Ran» dồn về khối stderr phía sau. E1, E2, E3, E6 đỏ trên bản đúng, hoặc tệ hơn: gán nhầm số bài của tệp này cho tệp kia, và một tệp 0 bài vẫn được tính là đã chạy | Gộp luồng từ gốc: chạy lệnh qua `sh -c "<lệnh> 2>&1"` và chỉ đọc stdout, để thứ tự dòng đúng như trên màn hình | fixed: `chay` chạy `sh -c "<lệnh> 2>&1"`, đọc một luồng duy nhất |
| P0 | contract | AC-4 hứa `bun run test`, pre-push và CI cùng đỏ, nhưng E4 chỉ chạy lệnh kiểm ở cấp gói. Đường thật đi qua bộ chạy ở gốc (cơ sở dữ liệu riêng mỗi lượt) rồi turbo, và không phép đo nào chạy đường đó | Script gói đúng, nhưng `turbo.json` hoặc bộ chạy ở gốc nuốt mã thoát, hoặc task `test` của gói bị lọc khỏi đồ thị. E4 xanh, pre-push xanh trên một tệp đỏ — đúng lỗi mà vòng này sinh ra để chặn | Thêm E7 chạy từ gốc kho bằng `bun run test -- --filter=app --filter=@crm/ui` (đúng đường pre-push). Với mỗi gói: tệp tạm xanh phải chạy và cho mã 0, tệp tạm đỏ phải cho mã khác 0 và đầu ra gọi tên tệp. 2 × 3 khẳng định | fixed: thêm chế độ `goc` và E7; chiều đỏ trên script cũ đã chạy — sáu dòng HONG |
| P1 | evals | AC-2 hứa các tệp `*.spec` của `packages/ui` vẫn chạy, nhưng E2 chỉ đếm tệp DOM và mã thoát | Người dựng thay `bun test --preload …` bằng chỉ bộ chạy DOM. Chín tệp spec thôi chạy, mã vẫn 0, E2 xanh | Đếm tệp `*.spec.*`/`*.test.*` bằng find (bỏ `node_modules`), đòi có một lượt «Ran N tests across K files» với K bằng số đó và N > 0 | fixed: `du-tep ui` thêm khẳng định spec; xanh trên script cũ (9 tệp) như đòi hỏi, đỏ ghim "ui: K tep spec khong con chay" |
| P2 | evals | Tệp tạm dùng một tên cố định, chỉ dọn khi SIGINT, và không phép đo nào kiểm tệp sót | Hai lượt đo chạy song song (S4 và pre-push) đè tệp của nhau; hoặc lượt bị SIGTERM để lại tệp đỏ trong `test/`, làm lượt sau đỏ vì lý do không liên quan | Tên tệp theo chế độ và tiến trình, dọn cả khi SIGINT và SIGTERM, và mọi chế độ kiểm không còn tệp `zz-do-thu-*` sau khi đo | fixed: tên `zz-do-thu-<chế độ>-<pid>.dom.tsx`, dọn ở cả hai tín hiệu, khẳng định không sót tệp ở cả hai gói |
