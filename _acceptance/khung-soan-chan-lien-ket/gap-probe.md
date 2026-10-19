---
slug: khung-soan-chan-lien-ket
at: 2026-10-15T11:05:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Vế «lượt Kara không bị gọi dừng» của AC-3 đi qua máy chủ nhưng chỉ đo ở DOM với router giả (khung không gỡ khỏi cây); E7 không kiểm lượt; AC-3 không mang tag cross-layer | Một đoạn dọn lúc gỡ khỏi cây gọi dừng phiên khi người chọn «Đóng» rồi sang Kho tài liệu; E3 và E7 vẫn xanh, mở lại cuộc không thấy bản nháp mới | Bước đọc kho sau khi rời thật: lượt chạy hết, bản nháp được nộp; chiều đỏ bản sao gọi dừng | fixed: AC-3 thêm (cross-layer) và vế «chạy tới hết»; thêm E9 (script, layer backend-effect) đọc docCuoc sau khi rời thật trên phiên đo, chiều đỏ --kiem-do-do dung-luot |
| P1 | evals | «Xem theo đơn vị» chỉ được đo ở chiều không chặn; không ô nào chứng nó bị chặn khi có thứ dở | Nếu nút đó là Button gọi router.push không có href thì hrefNoiBo không lọc được, số gõ dở mất không hỏi | Thêm trục liên kết vào ma trận E1, E2 | rejected: «Xem theo đơn vị» là Link có href thật (`bang-nhap.tsx` dòng 150–153, `data-nut` đặt trên chính Link); bộ chặn nghe click ở document theo pha bắt, không phân biệt liên kết nào — một liên kết có href đủ đại diện; E4 đã bấm nó thật để chứng nó là liên kết đi được |
| P1 | design | Dòng sổ d-…-3 ghi mot-loi cho «đi thẳng, không đóng khung trước», nhưng lối await lệnh đóng khung rồi mới push vẫn sống và cho hành vi Quay lại khác | Thẻ trình hành vi Quay lại như ràng buộc kỹ thuật, người duyệt không được chọn | Đổi thành câu hỏi hoặc trích tiền lệ | fixed: dòng mới thay d-20261015T104207Z-3 thành Hỏi-2 (chi-nguoi, khuyên đi thẳng); hợp đồng Notes thêm Hỏi-2 |
| P1 | contract | Dòng sổ d-…-6 (bỏ đường đo) ghi muc-tieu với câu trích là ô trống của opportunity.md — chỉ liên quan, không quyết [tac-nhan-va#F2] | Thẻ ghi tài liệu mục tiêu đã quyết bỏ đo trong khi chưa ai quyết | Đổi nguồn sang mot-loi hoặc hỏi | fixed: dòng mới thay d-20261015T104207Z-6, nguồn mot-loi — không có ngưỡng nào đã khai để dựng đường đo, đặt ngưỡng là việc của Cổng Đáng |
| P2 | design | Dòng sổ d-…-5 (bỏ design-pass) dựa vào khuyến nghị của Hỏi-1 mà không nối với nó | Người chọn lời mới ở Hỏi-1; lời mới được thấy lần đầu ở ảnh E7 sau Cổng 2 | Ghi điều kiện | fixed: dòng mới thay d-20261015T104207Z-5, có điều kiện và revisit «Hỏi-1 chọn lời mới → chụp hộp hỏi với lời mới trước S3» |
