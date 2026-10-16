---
slug: ke-hoach-sinh-viec
at: 2026-10-14T06:07:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Sổ ghi máy quyết «một deal có nhiều nhất một gợi ý» mà câu trích không quyết số gợi ý mỗi deal; ngưỡng đã ký đếm theo lần chuyển sang thắng [kanban-viec#F1] | Deal thắng, gợi ý bị bỏ qua, mở lại rồi thắng lần nữa: AC-9 ghim không gợi ý, đọc theo chữ ngưỡng là deal thắng thiếu gợi ý — vế (b) chết | Dòng sổ thay thế + đơn vị đếm ở Đường đo + ca thắng lại trong E13 | fixed: d-20261014T060837Z-12 thay d-20261014T060430Z-5 bằng chữ ngưỡng «mọi deal chuyển sang giai đoạn thắng … đều sinh một gợi ý» (đơn vị là lần chuyển); sau đó cả vế gợi ý tách sang DA3b (d-20261014T061219Z-15) — đã sửa design mục 7 (đếm theo lần chuyển, d-20261014T060837Z-12, nay dời theo bằng d-20261014T061219Z-17); hồ sơ goi-y-mo-ke-hoach nhận nguyên thiết kế đó |
| P1 | design | Bảng bảy ca của AC-9 không rút từ ma trận giai đoạn đi × đến; thiếu thua → thắng và thắng → thắng | Deal kéo từ thua sang thắng không sinh gợi ý vì luật chỉ ở nhánh chưa-đóng → đóng; thước đếm nó, vế (b) chết | Ma trận 3×3 viết trước + E13 có thua → thắng và thắng → thắng | deferred: design mục 7 đã có ma trận 3×3 (sinh ở mở → thắng và thua → thắng); AC và eval đo nó viết ở hồ sơ goi-y-mo-ke-hoach (DA3b) |
| P1 | design | Mẫu số vế (a) không loại Việc chưa tới hạn lúc đọc và Việc Huỷ | Đọc ngày 14: Việc hạn ngày 20–30 còn Chưa làm bị tính trễ → chết giả; Việc Huỷ có roiChuaLamLuc → xanh giả | Luật mẫu số + hai ca E13 + đột biến | fixed: d-20261014T060837Z-13 (mot-loi); design mục 9, Đường đo (a), E13 thêm hai ca, E16 cặp (h) |
| P1 | contract | Đóng kế hoạch và chuyển việc không có AC; bảng mục 5 không nói chúng tác động lên bước đã nối | Đóng kế hoạch còn bước dở: Việc vẫn nhắc mỗi sáng; chuyển việc ghi thẳng assigneeId của bước làm lệch bản chiếu | Ô transferWork trong bảng E4; ca đóng/mở lại ở E6 + đột biến | fixed: transferWork vào bảng design mục 5, AC-4, E4; đóng kế hoạch thành câu hỏi người — human-gate1: Hỏi-3 (d-20261014T060837Z-14, da_bac x4 đòi hỏi người), AC-5 và E6 ghim theo khuyến nghị (hỏi, đánh dấu sẵn huỷ), E16 cặp (i) |
| P2 | evals | Vế «tạo xong thẻ biến mất» của AC-11 không eval nào đo | goiYCuaDeal không làm tươi → thẻ còn, người bấm mở kế hoạch thứ hai | Ca kh-the-sau-tao đếm lần gọi query + đột biến | deferred: thẻ gợi ý tách sang DA3b — ca kh-the-sau-tao (đếm lần gọi goiYCuaDeal sau tạo) viết ở hồ sơ goi-y-mo-ke-hoach |
