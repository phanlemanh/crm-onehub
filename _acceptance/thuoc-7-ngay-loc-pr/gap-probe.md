---
slug: thuoc-7-ngay-loc-pr
at: 2026-10-09T09:43:30Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

# Phản biện context sạch — thuoc-7-ngay-loc-pr

Một tác tử tươi đọc design, contract, evals, sổ quyết định, opportunity và bài học xuyên hồ sơ (claim-scan), không đọc code.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Không eval nào chạy cách nhận lượt xanh và job dài nhất trên lượt thật có hình ma trận: cửa sổ cố định của E2 có 0 lượt xanh; Đường đo không so số của thước với số đếm độc lập | Thước khớp sai tên job `ci-ok`, mọi lượt rơi vào «không mang hình ma trận», E2 vẫn xanh; ngày đo in «chưa đủ mẫu» dù có ≥ 10 lượt xanh | Cửa sổ cố định sau #331 có lượt xanh, số ghim từ đếm độc lập; ngày đo so số thước với `gh` | fixed: E2 thêm cửa sổ 2026-10-09T05:42:52Z → 09:20:00Z (5 lượt xanh, job dài nhất 10,25/10,78/10,45/10,03/10,55′ đếm độc lập ở S0); E3 so số lượt xanh và số huỷ vì trần với số đếm độc lập ở cả hai pha; Đường đo thêm dòng đó |
| P1 | contract | AC-4 không nói trung vị lấy trên tập lượt nào; E1 đưa thẳng trung vị đã tính | Bản cài lấy trung vị trên mọi lượt, lượt huỷ 30′ kéo thành CHẾT giả | Cặp xanh/đỏ trên mẫu trộn lượt xanh, huỷ, đỏ | fixed: AC-4 ghi «trên các lượt XANH»; E1 thêm ô trộn 10 xanh + 3 huỷ + 3 đỏ và bản sao tính trên mọi lượt phải đỏ |
| P1 | contract | Bằng chứng trục B chỉ có annotation của lượt hình một job trước #331; chưa ai thấy annotation của job huỷ ở hình ma trận (job chưa bắt đầu, `ci-ok`) | Tuần đo có lượt bị đè khi `ci-ok` chưa chạy, job đó không có annotation, đúng lệnh Đường đo thoát 2 không in số | Chụp annotation của job huỷ ở hình ma trận thật làm ma trận viết trước | fixed một phần: AC-2 thêm lớp «huỷ khi chưa chạy» (không có `started_at`) — job chưa chạy không thể chạm trần. deferred: chưa có lượt huỷ hình ma trận nào trên kho (đo 09:30Z); dựng lượt phá-thử là mở PR thật trên GitHub, không đáng cho một lỗi tự lộ — ca lạ còn lại thoát 2 gọi tên câu, sửa trong ngày (entry revisit) |
| P2 | contract | AC-4 không định nghĩa trung vị khi số lượt chẵn | 10 lượt, hai giá trị giữa 14 và 16,5: lấy giá trị dưới ra SỐNG, lấy trung bình ra «giữa hai ngưỡng» | Ô E1 hai giá trị giữa nằm hai phía 15′ | fixed: AC-4 ghi «số lượt chẵn lấy trung bình hai giá trị giữa»; E1 thêm ô 14 và 16,5 → 15,25, «giữa hai ngưỡng» |
| P2 | evals | AC-6 đòi đúng dòng lệnh không `--tu` chạy bằng cả `node` lẫn `bun`; E2 có `--tu`, E3 không nói runtime | Nhánh tự tính cửa sổ sai dưới `bun`, E2 và E3 vẫn xanh | E3 chạy hai runtime, so dòng cửa sổ và số đếm | fixed: E3 chạy đúng dòng Đường đo hai lần, `node` và `bun`, hai đầu ra phải trùng |
