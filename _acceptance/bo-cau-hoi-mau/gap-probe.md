---
slug: bo-cau-hoi-mau
at: 2026-10-13T00:38:00Z
verdict: findings
p0: 1
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-9 ghi «một lối» nhưng lối khác (đo mỗi lượt ghim, chỉ ghi `.acceptance-runs/`) không chết, chỉ tốn tiền; khoá dùng lại chỉ là băm bộ và không có cờ đo mới | `l5` sửa trợ lý rồi chạy lệnh đo: bộ không đổi nên lệnh in «dùng lại» với số của trợ lý cũ; muốn đo mới phải xoá `evidence/` của hồ sơ đã ký | Chuyển d-9 sang câu hỏi; thêm cờ đo mới; ca `do-moi` trong E8 | fixed: lệnh đo tách ba chế độ — `--do` luôn đo mới (cho `l5`), không cờ chỉ kiểm, `--ghi` chép; d-9 thay bằng dòng S1 thứ 10 nguồn «chỉ người» (Hỏi-2), gửi yêu cầu `P6-3` |
| P1 | contract | Không AC nào đòi bằng chứng đo nằm trong git; `--ghi` chỉ được in ra | PR gộp không có `evidence/do-bo-mau.md`; phiên `l5` ở máy khác không có đầu vào; mỗi lượt ghim lại gọi model | AC đòi hai tệp đã commit trước Cổng Bằng chứng; eval kiểm `git ls-files` và khớp băm | fixed: AC-7 đòi bằng chứng đã commit trước Cổng Bằng chứng; E7 kiểm `git ls-files`, băm, tập mã, từng ô |
| P1 | evals | Ba nhánh mã thoát của AC-6 không eval nào chạy chắc chắn; «n = 46» đếm dòng chứ không so tập mã | Lệnh truyền thẳng mã 1 của script chấm; hay script chấm sót một mã và lặp một mã khác mà vẫn đủ 46 dòng | Eval tiêm script chấm giả thoát 0/1/2, ca thiếu và trùng mã; so tập mã | fixed: thêm E10 (biến `BCM_LENH_CHAM`, năm ca viết trước, jsonl sinh bằng `dongTungCau`); AC-6 và E7 so tập mã |
| P2 | evals | Nhãn giả ở câu nguồn không có ca đỏ; design thiếu tên trường `nguon` và `bienTheCua` | Bộ không có câu nguồn hay câu nguồn không nói giả mà E1 vẫn xanh | Hai ca đỏ trong E1 | fixed: AC-1 đòi `nguon` mở đầu «Bộ mẫu giả»; E1 thêm ca xoá `nguon` và ca `nguon` sai; design nêu `nguon`, `bienTheCua` |
