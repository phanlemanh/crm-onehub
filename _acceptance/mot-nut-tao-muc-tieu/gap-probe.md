---
slug: mot-nut-tao-muc-tieu
at: 2026-10-21T07:50:00Z
verdict: findings
p0: 2
p1: 1
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design (sổ d-…-10) | Dòng bỏ design-pass ghi nguồn một-lối, nhưng lối dựng bản mẫu không chết: phiên đo tien-de tự dựng cổng riêng, chính E16 dùng lối đó; bỏ khoảnh khắc nhìn hình trước duyệt là việc người quyết. Cùng dạng [kara-khong-ghi-de-truong#F1] và [okr-mau-xoa-du#F1] | Chủ kho duyệt bằng chữ một Dialog mới và một kiểu Item khoá mới; hộp trông sai chỉ lộ ở ảnh E16 tại Cổng Bằng chứng, sát mốc 26/10 | Dòng sổ thay d-…-10 thành câu chỉ-người Hỏi-2, nêu trên thẻ | human-gate1: dòng d-20261021T072236Z-11 (Hỏi-2) thay d-…-10 |
| P0 | design (sổ d-…-4) | Dòng hiện-khoá-không-ẩn ghi nguồn mục-tiêu, nhưng câu trích docs/design.md chỉ đòi nút khoá có lý do, không chọn giữa hiện-khoá và ẩn; lối ẩn ngoài pha là hành vi hôm nay | Ba trên bốn pha hộp luôn có một dòng Soạn khoá; nếu chủ kho muốn ẩn thì AC-7, E13 và chiều đỏ phải viết lại sau khi đã dựng | Dòng sổ thay d-…-4 thành câu chỉ-người; AC-7 ghi rõ phụ thuộc câu trả lời | human-gate1: dòng d-20261021T072236Z-12 (Hỏi-3) thay d-…-4; Notes của contract ghi phần AC-5, AC-7, E9, E13 đổi theo nếu chọn ẩn |
| P1 | contract + evals | AC-5 không có nhánh Của tôi; E9 không đo Của tôi; E15 không thử tham số bước mẫu khi không có quyền | Từ Của tôi chọn Từ mẫu rơi vào bước Tự viết; thành viên thường mở thẳng đường dẫn bước mẫu vẫn mở được ngăn | AC-5 thêm nhánh Của tôi; E9 ô (c); E15 thêm ô tham số bước mẫu | fixed: AC-5 thêm «từ Của tôi: sang Bộ OKR của đơn vị đó với ngăn ở bước chọn mẫu»; E9 ô (c), ma trận 3 ô; E15 bốn ô đường dẫn mở thẳng |
| P2 | evals | E9 không khẳng định chu kỳ khi gọi okr.taoTuMau | Từ mẫu truyền chu kỳ mặc định, mục tiêu vào nhầm chu kỳ mà E9, E10 vẫn xanh | E9 khẳng định cycleId, chiều đỏ ghim «mnt-tu-mau: cycleId lech» | fixed: AC-5 thêm «với đơn vị và chu kỳ đích»; E9 (a) khẳng định cycleId và thêm chiều đỏ |
| P2 | contract | Trạng thái quyền đang tải không có AC | Màn chỉ đọc còn khung chờ ở chỗ nút chính cũ rồi biến mất; Bộ OKR hiện nút bấm được trước khi biết quyền | Câu cho lúc quyền đang tải trong AC-1, AC-2; ô treo trong E1, E2 | fixed: AC-1, AC-2 thêm câu lúc quyền đang tải; E1 thêm 2 ô, E2 thêm 4 ô, kèm chiều đỏ ghim tên ô |
