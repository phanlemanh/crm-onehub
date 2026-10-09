---
slug: kara-gop-y-luot-2
at: 2026-10-08T21:10:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | [soan-okr-khong-lac#F1]: AC-7 chỉ đo trên fixture đặt sẵn cả hai liên kết; ca cùng đích ghi trong sổ không có trong E7; chiều đỏ của E7 không thuộc bảy vết của E15; E15c không bấm Hoàn tác | Liên kết mới chưa có trong danh sách khi bấm Hoàn tác, hoặc gỡ nhầm liên kết cũ cùng đích mà mọi eval vẫn xanh | E7 chạy trọn nhận → làm mới → Hoàn tác với ca cùng đích và Y đứng đầu; vết (h) ở E15; E15c bấm Hoàn tác thật và đọc lại liên kết qua API | fixed: E7 ma trận 3 ca (khác đích, cùng đích có liên kết mới, cùng đích không có liên kết mới) với danh sách trước/sau; AC-7 và design nói rõ chỉ gỡ liên kết mới xuất hiện; vết (h) thêm vào E15 (8/8); E15c bấm Hoàn tác thật và đọc lại qua API |
| P1 | evals | [soan-okr-khong-lac#F1]: AC-10 thiếu phía âm cho góp ý cấp Mục tiêu và đường quyết; E10b dùng troLyDeXuat giả; Đường đo thiếu loại vấp thứ tư | Người phụ trách hai KR thấy và nhận được góp ý cấp Mục tiêu, sửa một Mục tiêu họ không có quyền | E10 thêm góp ý cấp Mục tiêu: không có trong danh sách của (a), quyết thì FORBIDDEN, đối chứng người sửa được Mục tiêu; E15c thêm trạng thái hai KR trên phiên thật; Đường đo thêm loại vấp thứ tư | fixed: E10 thêm ca góp ý cấp Mục tiêu + troLyQuyet FORBIDDEN + đối chứng (d); AC-10 nói rõ; E15c thêm trạng thái người phụ trách hai KR (bấm Nhờ thật); Đường đo thêm «nhờ không được cho KR của mình» |
| P1 | evals | E15c rút ngắn trần bằng biến môi trường không tồn tại và ngoài cham-tep; đường nhập hằng trần ở client chưa nói | E15c không dựng được quá hạn (BLOCKED) hoặc thêm biến làm E15b đỏ; nhập qua barrel @crm/db làm next build đỏ | Chọn chờ trần thật hoặc xin cham-tep cho biến môi trường; ghi đường nhập client | fixed: chọn (i) — E15c chờ đúng trần thật TRO_LY_OKR_TRAN.tranChoMs; design ghi client đọc hằng qua @crm/validation/okr-tro-ly như gop-y-kara.ts đang làm (soát lại: hằng đúng là TRO_LY_OKR_TRAN, không phải OKR_TRO_LY của packages/db — đã sửa tên ở AC-4, E4, design, sổ) |
| P2 | evals | E6 ma trận một trục (bốn loại lỗi) trong khi AC-6 nêu bốn hành động có đường lỗi riêng | Hoàn tác hay Bác lỗi vẫn in mã thô; E6 chỉ thử nút Nhận nên xanh | Mở E6 thành 4 hành động × 4 loại lỗi = 16 ô viết trước | fixed: E6 ma trận 16 ô, đòi số ô chạy === 16 |
| P2 | evals | E14 đo sự có mặt của lời gọi hàm chung, không đo chuỗi hiện ra; hai tab Ghi nhận và Trao đổi không eval nào đo | Một chỗ vẫn đi qua helper khác hay truyền tuỳ chọn riêng làm lệch khuôn mà E14 vẫn 5/5 | Bài DOM dựng các bề mặt với cùng thời điểm ở vi và en, so textContent với tệp mẫu | fixed: E14 thêm vế (3) bài DOM -t k3-ngay-gio dựng bảy bề mặt (năm chỗ + hai tab) × 2 locale = 14 ô so với rang/ngay-gio-mau.json |
