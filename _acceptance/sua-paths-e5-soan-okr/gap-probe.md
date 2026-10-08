---
slug: sua-paths-e5-soan-okr
at: 2026-10-08T08:47:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E4 đọc dòng repin cuối nhưng không gì buộc dòng đó do vòng này ghi; chiều đỏ chỉ phá vế mã thoát | Vòng không ghim lại, dòng repin cuối là một lượt đêm 07–08/10 thoả mọi điều kiện, E4 xanh | Diff so điểm rẽ có đúng một dòng repin thêm vào, là dòng được đọc; sha của nó có commit sửa evals làm tổ tiên; chiều đỏ repin-cu | fixed: AC-4 và E4 thêm hai điều kiện và chiều đỏ repin-cu |
| P1 | evals | Ngưỡng «lượt gộp chỉ chạm tệp ngoài paths không làm hồ sơ cũ» không có đường đo qua lưới thật; E5 xanh nhờ vừa ghim, chiều đỏ chỉ phá bộ đọc; E5 không đòi cây đã commit | Lưới không đi qua staleByPaths cho hồ sơ, E1 E2 E5 vẫn xanh, sau gộp hồ sơ vẫn cũ; hoặc S4 chạy E5 trên cây chưa commit | E7 trên worktree tạm chạy pre-merge thật, chiều đỏ với evals cũ; E5 đòi cây sạch và in hai sha | fixed: thêm AC-7 và E7 (lưới thật, hai chiều trên cùng bản sao); E5 đòi cây sạch, in sha HEAD và origin/onehub |
| P2 | evals | Vế kept của E2 không đo được gì vì E27 khai apps/** | E5 trỏ sai một thư mục có thật, AC-1 AC-2 vẫn xanh | Đo khớp theo từng eval bằng evalPathsOf + pathGlobToRe; chiều đỏ e5-lech | fixed: AC-2 và E2 đo theo eval, thêm chiều đỏ e5-lech |
| P2 | evals | AC-3 so sau parseEvals, không so byte | Bản sửa được ghi lại bằng cách xuất lại YAML, đổi trích dẫn hàng trăm dòng, E3 vẫn xanh | git diff -U0 đúng 2- và 2+; chiều đỏ doi-trich-dan | fixed: AC-3 và E3 thêm phép so byte và chiều đỏ |
| P2 | contract | Ranh giới cho phép cả thư mục hồ sơ đã ký; không giữ thân hợp đồng hay dòng cũ của run-log | Lượt ghim hay bước dọn tay sửa contract.md hoặc viết lại run-log cũ, mọi AC xanh | AC-6 liệt đích danh ba tệp; contract.md không đổi; run-log chỉ thêm dòng; chiều đỏ thêm contract.md | fixed: AC-6 và E6 siết theo đề xuất |
