---
slug: trang-lo-trinh-trong-crm
at: 2026-10-09T01:59:28Z
verdict: findings
p0: 0
p1: 2
p2: 3
---
## Findings

Lượt 2 (sau khi viết lại bộ tiêu chí theo khung Thoả thuận đã duyệt 09/10). Lượt 1 (bố cục cũ, 0 P0 · 4 P1 · 1 P2) đã định đoạt hết, xem commit b714572c.

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Không eval nào chứng tệp mẫu do bộ vẽ của kit sinh; tệp mẫu và lệnh sinh không nằm trong paths của E2–E8, E12 | Sửa tay tệp mẫu cho khớp mã, mọi bài vẫn xanh trong khi khối thật làm lệch nhãn, lọc, ngăn hồ sơ | Eval chạy lệnh sinh trên đầu vào đóng băng rồi so từng byte với tệp mẫu; thêm tệp mẫu vào paths | fixed: thêm E16 (kiem-mau.mjs, đầu vào đóng băng ở fixtures/lo-trinh/nguon, chiều đỏ «tệp mẫu lệch bộ vẽ»); tệp mẫu và sinh-mau.mjs vào paths của E2–E8, E12 |
| P1 | design | Thiết kế còn sót bố cục cũ: «Không làm» ghi tìm theo chữ, dòng sổ bỏ ô tìm chưa bị thay; trạng thái chia-moc vẫn là bảng cột chia theo mốc; kiểm kê màn thiếu Mốc và Đã bác | Người cài bỏ ô tìm theo dòng sổ cũ, hoặc dựng lại bảng cột 16 cột đã loại | Xoá dòng thừa, ghi dòng sổ supersedes, sửa bảng trạng thái, thêm vào E5 tập lựa chọn chia cột | fixed: xoá «Tìm việc theo chữ»; dòng sổ supersedes d-20261008T171757Z-5; ST-lotrinh-chia-moc thành cách xem Mốc; kiểm kê màn thêm Mốc, Đã bác; E5 dòng 4 ghim tập chia cột {trạng thái, nhóm, lộ trình} |
| P2 | contract | Khổ 375 chỉ đo ở ngăn hồ sơ; ba hành vi khổ hẹp của thiết kế không có AC | Bảng ở 375 ép cột Việc còn vài chữ mà trang vẫn không cuộn ngang, E13 xanh | Thêm hành vi khổ hẹp vào AC-13 và ô đo 375 | fixed: AC-13 thêm ba hành vi khổ hẹp và thanh công cụ không tràn; E13 thêm ô bang-375, bang-cot-375, moc-375 |
| P2 | contract | Số n của khung việc trễ không nói theo phạm vi lọc nào; n của «Trễ n ngày» chưa định nghĩa | Lọc nhóm okr mà khung đếm cả kho; bấm nút ra ít dòng hơn số trong khung | Chốt phạm vi đếm và hành vi nút; E4 đo n bằng số dòng sau khi bấm, kể cả khi có lọc | fixed: AC-4 chốt n trên phạm vi ô tìm + Lộ trình + Nhóm, nút đặt Mốc=Trễ và thẻ Tất cả, giữ các chiều khác; E4 dòng 5, 5b; bản mẫu sửa theo, đo trên bản chạy: khung 3, sau khi bấm 3 dòng |
| P2 | evals | Hội đồng E14 chỉ đọc tệp lời; không gì chứng mọi nhãn đến từ tệp lời và hai ngôn ngữ đủ khoá | Nhãn viết thẳng trong mã lọt qua E14; bản tiếng Anh thiếu khoá không ai bắt | Eval quét chữ viết thẳng + bộ canh tệp lời | fixed: AC-14 ghi nhãn đến từ tệp lời; thêm E17 (chu-cung.mjs + messages-guard.spec.ts, chiều đỏ «chu viet thang ngoai tep loi») |
