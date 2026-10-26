---
slug: pre-push-t1
at: 2026-10-16T15:07:02Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | design | Design và AC-4 nói ngược nhau ở ca thiếu tệp phân loại: node lỗi không in được dòng «không phân loại được» | Thợ làm đúng design, E4(e) đỏ vì stderr chỉ có vết lỗi node | Hook tự kiểm tệp vắng, in đúng dòng, không gọi node; E4(e) ghim dòng và vắng «Cannot find module» | fixed: design §2, AC-4, E4(e) |
| P1 | evals | Hợp tập tệp qua nhiều ref chỉ đo một thứ tự dòng; E7 không có đột biến chỉ-đọc-dòng-đầu | Cài đặt chỉ đọc dòng đầu qua ca 10 khi dòng mã đứng trước; git push docs-a feat-b bỏ test | Ca 10 và 17 hai thứ tự, ca 18 dương hai ref docs; đột biến chi-dong-dau | fixed: E1 18 ca, E7 thêm chi-dong-dau, AC-1 thêm vế thứ tự |
| P1 | evals | Một nguồn của danh sách bỏ chỉ đo bằng quét chuỗi | Hook viết case test/build tay, E2–E5 vẫn xanh vì danh sách trùng | mot-nguon (c) skip=[build] qua hook; đột biến hook-viet-tay | fixed: AC-2, E2 (c), E7 |
| P1 | evals | E6 trong spec thường trực gọi git show merge-base | CI checkout một commit, E6 ném lỗi; sau gộp không đo gì | Tách vế gốc vòng sang răng hồ sơ; spec không gọi git | fixed: E6, E8 ghim (5), AC-6/AC-7; dòng sổ mới thay d-4 nguồn mot-loi |
| P2 | evals | Bảng răng và E8 lệch; ba-noi-deu-chay không chạy | Cách đọc của ba-noi-deu-chay vỡ mà E8, E10 vẫn xanh | Chạy thật ba-noi-deu-chay, khớp bảng | fixed: bảng thêm chuyen-goi-dieu-phoi; rejected phần chạy ba-noi-deu-chay — nó chạy hook thật hai lượt ≈30′, cùng dạng đẩy sha=sha và cùng dòng «pre-push: bun run build» đã nằm trong E10 |
