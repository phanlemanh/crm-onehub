---
slug: khong-cham-thuoc-bat-doi-ten
at: 2026-09-28T14:12:52Z
verdict: findings
p0: 0
p1: 1
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Chiều đỏ chỉ đòi mỗi ca «lệch», không ghim lệch theo đúng dấu của lỗ (thước thoát 0, «1 tep doi, 0 tep bi cam»); chiều xanh không ghim quan hệ đường cũ | Gỡ cờ làm vỡ cú pháp hay thước chạy sai cwd → thước mã 2 hoặc đo nhầm cây, C1–C3 vẫn «lệch», chiều đỏ báo đạt mà lỗ chưa được tái hiện | Chỉ in thông điệp ghim khi thước thoát 0 và in đúng dấu lỗ; khác đi thì «HONG DOT BIEN»; đếm đúng 2 chỗ gỡ; chiều xanh khẳng định danh sách bị chạm bằng đúng đường cũ | fixed: doi-ten.mjs ghim dấu lỗ theo từng ca (C1, C2 «1 tep doi, 0 tep bi cam»; C3 «0 tep bi cam»), ca khác in «chieu do: HONG DOT BIEN» và thoát 1; đếm đúng 2 chỗ --no-renames, khác 2 thì mã 2; chiều xanh so danh sách bị chạm bằng đúng [đường cũ] |
| P2 | design | Không khai danh tính git khi commit, worktree duy nhất theo lượt, cwd của thước | Máy không đặt user.email thì commit hỏng, C1 đỏ vì môi trường; worktree cố định làm E1, E2 chạy song song xoá của nhau | Khai ba điều kiện; thử E1–E3 song song với GIT_CONFIG_GLOBAL=/dev/null, GIT_CONFIG_NOSYSTEM=1, git worktree list trước = sau | fixed: design và expected của E1 khai ba điều kiện; lượt thử song song không cấu hình git toàn cục ghi vào verify của task ở S3 |
