---
slug: trang-thai-tin-hieu-song
at: 2026-10-22T05:40:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Sổ d-4 tự quyết ghi thông báo cùng giao dịch với bản chụp, trong khi đó là đánh đổi giữa thông báo đủ và trang Lộ trình (LT1c) nhận bản chụp | Phần thông báo hỏng lặp lại (khoá ngoại, khuôn đổi) làm mọi lượt đẩy đỏ, trang Lộ trình đứng ở bản dựng nhiều ngày | Câu chỉ-người kèm giá của lối «nhận bản chụp, báo lỗi riêng»; E5 đo hệ quả với trang Lộ trình | fixed: gỡ đánh đổi bằng thiết kế — phần so chỗ không ném vì dữ liệu (danh sách hỏng hay vắng → không báo, bản chụp vẫn nhận, cảnh báo), người nhận lọc nối member trong cùng giao dịch nên khoá ngoại luôn đúng; lỗi còn lại chỉ là lỗi kho dữ liệu, lỗi đó cũng làm hỏng bản chụp. Dòng sổ mới thay d-4 (nguồn một-lối: lối kia làm lần đổi mất vĩnh viễn vì chạy lại cùng sha là «trùng»). AC-4, AC-5, E4 thêm ca. Ngưỡng của ô cơ hội đã qua Cổng Đáng (build, 19/10); AC-8 ghi rõ con số |
| P1 | contract | AC-3/AC-4 chưa định nghĩa ca danh sách tín hiệu vắng hay hỏng ở bản cũ hoặc bản mới | Bản cũ không đọc được → mọi tín hiệu bị báo đổi chỗ cùng lúc; bản mới hỏng mà hàm ném → chặn trang Lộ trình | AC-4 thêm bốn ca, E4 thêm ô và chiều đỏ | fixed: AC-4 thêm cũ-vắng · cũ-hỏng · mới-vắng · mới-hỏng (0 thông báo, bản chụp nhận, một dòng cảnh báo); E4 thêm hai chiều đỏ ghim thông điệp |
| P1 | evals | Fixture sửa tay tin_hieu theo khuôn bên đọc, không đi qua bộ vẽ thật của kit | Kit ghi tên nhóm hay trạng thái việc khác chỗ fixture sửa → bài xanh, production không báo | Mỗi loại chuyển sinh bằng bộ viết thật của kit; bài so khuôn | fixed: E1, E3, E4, E7 sinh khối bằng scripts/product-map.mjs thật trên bản sao đầu vào (ban gom, hang lo trinh) — dungKhoiMau; E3 thêm bài so khuôn choTinHieu(khối kit sinh) với khoá kỳ vọng. Chữ «chua-gom» ở E1 là giá trị cho của kit, khoá CRM là «cho-gom» — đã ghi rõ |
| P1 | evals | AC-1 «trong vòng một nhịp làm mới» không qua lớp bộ đệm; thẻ «Tất cả» không mở ở lớp màn; E7 tải lại trang thay vì chờ nhịp chuông | Bộ đệm đặt sai tuổi giữ bản chụp cũ, bài vẫn xanh | E7 thêm pha mở hai trang trước bản chụp thứ hai, chờ trong nhịp; chuông không tải lại | fixed: E7 pha 1 mở cả hai trang ở bản cũ, pha 2a chờ chuông không tải lại trong hoiLaiMs + 30 s, pha 2b chờ nhãn mới ở cả hai trang trong nhipLamMoiMs + 30 s; chiều đỏ bỏ cacheLife |
| P2 | contract | Căn cứ của d-3 chỉ nói trang hiện gì, không quyết điều gì được báo | Ma trận chuyển được duyệt như điều máy suy ra; mẫu số của AC-8 lệch | Trích câu quyết tập chuyển, hoặc câu chỉ-người | fixed: dòng sổ mới thay d-3, trích vấn đề của Cổng Đáng («phải tự mở trang») — thông báo thay việc mở trang nên phải có mặt mỗi khi điều trang hiện đổi; AC-3 và E3 giữ đúng tập ấy |
