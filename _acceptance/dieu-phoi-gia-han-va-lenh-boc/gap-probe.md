---
slug: dieu-phoi-gia-han-va-lenh-boc
at: 2026-10-07T07:40:00Z
verdict: findings
p0: 0
p1: 2
p2: 2
---

# Gap-probe — dieu-phoi-gia-han-va-lenh-boc

Phản biện context sạch, một lượt, đọc đúng năm tệp: design doc, contract, evals, decisions, claims.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-4, E4 và E2 đo hạn thuê bằng số phút viết tay; «tệp tra-loi còn nguyên chỗ» không có đối chứng | Mã đổi cách tính hạn (cộng từ giờ nhịp thay vì từ hạn cũ) mà số viết tay tình cờ vẫn khớp fixture; đối chứng hồi quy xanh trên một hồi quy thật | So với hàm tính hạn của chính mã (`hanGiaHan`) trên cùng hạn cũ, giờ nhịp, số phút; so tập tệp `tra-loi/` trước và sau nhịp | fixed: AC-4 viết lại thành «bằng đúng giá trị hàm tính hạn hiện có»; E2, E4 đổi sang so quan hệ, E4 thêm so tập tệp trước/sau |
| P1 | evals | E6 và E12 không ghim đường tới `giu-nhip.mjs` trong dòng gợi ý | Dòng gợi ý trỏ một `giu-nhip.mjs` của cây khác (kho chính thay vì bản chép đột biến); E12 xanh trên mã gốc trong khi đột biến không bao giờ được chạy | Đòi đường trong dòng gợi ý bằng đúng `giu-nhip.mjs` cạnh mã đang chạy, dẫn từ `import.meta.url` của tệp test | fixed: AC-6 thêm vế «trỏ đúng giu-nhip.mjs nằm cạnh mã đang chạy»; E6 ghim đường |
| P2 | contract | Không ca nào chặn tách sai: `K=V` sau tên lệnh, hay tên biến không hợp lệ (`1X=y`) | Bản sửa tách mọi từ có dấu `=` vẫn xanh hết; `node check B=2` mất đối số và lặng lẽ đặt biến | Ca `giu-nhip -- node <kiểm> B=2` giữ `B=2` làm đối số, B vắng trong môi trường; `1X=y` chạy như tên chương trình; đột biến G6 «tách mọi từ có dấu =» | fixed: AC-5 thêm hai vế; E5 thêm hai ca; thêm đột biến G6 vào E7–E12 |
| P2 | evals | E6 chỉ đo mã thoát, không đo biến tới nơi | Bản sửa tách biến nhưng không truyền vào tiến trình con vẫn thoát 0 ở E6 | Tệp kiểm thoát 3 khi TZ sai; đối chứng không tiền tố thoát 3; đột biến G7 «tách nhưng không truyền biến» | fixed: E5, E6 thêm đối chứng không tiền tố thoát 3; thêm đột biến G7 vào E7–E12 |
