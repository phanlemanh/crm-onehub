---
slug: lo-trinh-hien-ngay-du-kien
at: 2026-10-17T12:40:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-6 hứa cột Mốc của bảng và thẻ bảng cột hiện ngày gọn CÙNG CỜ của mốc hoặc «Chưa có ngày dự kiến», nhưng E7 chỉ kiểm chữ ngày gọn; cờ ở dạng gọn và ca chưa-có trên bảng không được đo | Dạng gọn bỏ cờ cho vừa cột 375; một mốc máy ước hay quá tải hiện «dự kiến 30/10» trơn trên bảng, E4 và E5 vẫn xanh vì chỉ render dạng đủ | Ma trận 3 chỗ hiện × 4 trạng thái mốc, so tập cờ và tone với ô Mốc của cùng mốc; chiều đỏ ghim «bảng thiếu cờ của mốc» | fixed: E7 viết lại thành ma trận 12 ô so quan hệ với ô Mốc, thêm chiều đỏ ghim |
| P1 | evals | E9 chạy trên khối thật, lúc giao chỉ 1/7 mốc có ngày, không mốc nào quá tải hay đã qua — trạng thái rộng nhất không lên màn để đo cuộn ngang, cắt chữ hay nhìn bằng mắt; ngăn hồ sơ chỉ ở 1280 | Ở 375 tiếng Anh, ngày đủ kèm ba cờ và câu cách tính tràn dòng mốc, mục Ước lượng bị cắt, E9 vẫn mã 0 | Trong phiên đo, đặt du_kien, qua_tai, gio_may máy ước cho một mốc từ khối thật; thêm ô Mốc 375/1280 vi/en và ngăn 375/1280 với khẳng định không tràn | fixed: E9 thêm phần bản chụp đẩy qua đường thật với một mốc mang đủ ba cờ, 10 ô gồm sáng tối và ngăn ở hai khổ |
| P1 | contract | AC-7 đi qua đường đẩy bản chụp và API mà không gắn cross-layer; E8 dựng bản chụp viết tay theo khuôn bên đọc; không render bản chụp mới để so với bản đóng gói, không đếm cờ bản cũ cho bản chụp | Payload của day.ts hay thủ tục lưu đi qua khuôn bỏ khoá, bản chụp mất du_kien, production hiện «chưa mang ngày dự kiến» ở mốc có ngày, E8 vẫn xanh | Gắn cross-layer; dựng bản chụp bằng đường của day.ts trên tệp thật, so text mốc bản chụp với bản đóng gói; chiều đỏ ghim «bản chụp mất ngày dự kiến» | fixed: AC-7 gắn (cross-layer), surfaces thêm api; thêm E12 lớp backend-effect chạy day() qua app Nest thật tới DB; E8 dòng 3 dựng từ đường của day.ts, phần dom (b)(c) so bản chụp với bản đóng gói và đếm ban-cu |
| P2 | evals | Đường đo hứa «mọi ngày tính trên số đo chưa đủ mang cờ» đo trên khối thật, nhưng E10 không có dòng ấy | Một mốc thật có việc mà gio_may.co mang hình khác ma trận E4; ngày hiện không cờ, thước vẫn báo có số | Thêm vào E10 so chuaDuSoDo với điều kiện tính độc lập từ khối thô; in thuoc-2 | fixed: E10 thêm dòng so độc lập từ JSON thô và chiều đỏ ghim |
| P2 | contract | AC-6 không nói việc không giờ máy thì mục Ước lượng hiện gì (trục C có ca này) | Ngăn hồ sơ trên bản chụp đời trước hiện «NaN–NaN giờ máy» hoặc ném | Bổ sung Then và một ô E7 | fixed: AC-6 thêm «việc không có giờ máy không có mục Ước lượng và ngăn không vỡ»; E7 dòng 3 đo ca gio_may null |
