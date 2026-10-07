---
slug: dieu-phoi-va-bien
at: 2026-10-07T01:20:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E10: chiều đỏ V17 không thể đỏ vì nhip chỉ lùi một lần trước khi lệnh bọc chạy; V18 không có khoá thứ hai | V17 chạm một lần lúc đầu thì nhip vẫn mới lúc motNhip chạy → gia-han → V17 SONG, S4 REJECT dù mã đúng | Lùi mtime nhip lần nữa trong lúc con ngủ rồi khẳng định nó vượt mốc; thêm khoá duong-nen của P2 để V18 đỏ | fixed: E10 viết lại — lùi lại giữa lúc chạy, chờ ≥ 3 chu kỳ, khoá P2 cùng fixture phải thu-hoi |
| P1 | evals | E3, E4 không toàn phần: các ô «thiếu một trong bốn loại», «thiếu một trong ba khoá suc_khoe», «sau/ranh_gioi/chung_chi_them», «khoá lạ ba tầng» chỉ đo một phần tử | Bộ kiểm sót loại merge thì ô duy nhất (duong-nen) vẫn xanh; chung_chi_them chuỗi lọt qua | Ma trận 16 ô cho AC-3, 13 ô cho AC-4, số assert bằng số ô; loại lặp trên LOAI_DON; đột biến bỏ merge | fixed: AC-3/AC-4 tách đủ 16/13 ô; E3, E4 viết lại; thêm V29 (thiếu merge), V30 (chung_chi_them) |
| P2 | evals | AC-6 lượng từ hai tệp × hai hook, chỉ đo hai tổ hợp | hook chặn S4 đọc hang-viec thô thì day là object chặn mọi Bash; E6, E7 vẫn xanh | Thêm hai ca chéo trên cùng fixture, mỗi ca một đột biến | fixed: AC-6 nói rõ hành vi bốn tổ hợp; E6, E7 thêm ca chéo; thêm V31, V32 |
| P2 | evals | E21 giả định mọi *.js trong .acceptance-runs/wf/ là S4 | Một bản chép execute-parallel trong wf/ làm E21 đỏ oan; bản chép kit cũ có meta khác khuôn lọt mà không ai biết nhãn đúng | Lấy nhãn thật bằng import rồi đọc meta.name, so với phanLoai từng tệp | fixed: E21 lấy nhãn bằng await import, đòi khớp 100% |
| P2 | contract | AC-12 không ràng phiên: tra-loi duyệt áp vào khoá đã sang tay phiên khác | P1 mất khoá, P2 được cấp 12:10; P1 xin gia-han 12:30, giám sát duyệt → cộng vào hạn của P2 | Vế (e) trong E15 + đột biến bỏ so chu.phien | fixed: AC-12 thêm điều kiện «khoá còn do chính phiên yêu cầu giữ»; E15 vế (e); thêm V33 |
