---
slug: dien-thoai-ca-nhan
at: 2026-10-09T00:13:43Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract, evals | AC-12 hứa người nạp từ listing hiện «0901 234 567» nhưng hàm hiện số trả nguyên văn số thô; E14 dựng tay M với số đã chuẩn hoá (theo khuôn bên đọc, không theo đường ghi thật của listing) [soan-okr-khong-lac#F1]; E14 không đo việc gõ số vào ô chọn có giữ M không | Môi giới nạp từ listing có số thô hiện «0901.234.567» trên production trong khi E14 xanh; hoặc ô chọn lọc client theo tên làm M biến mất khi gõ số | Hàm hiện số đọc qua docSoDienThoai; E14 dùng số thô như listing ghi; thêm dòng gõ số giữ option M; chiều đỏ ghim «M bi loc mat» | fixed: AC-3 và E4 «hien-so» đổi — số thô cũ hiện «0901 234 567», chuỗi không đọc được mới giữ nguyên văn; AC-12 và E14 dùng số thô «0901.234.567» như listing-ingest ghi, thêm hai dòng gõ số và chiều đỏ «M bi loc mat» |
| P1 | evals, contract | Các ô đo màn tao-sheet, tim-bang, cmdk nằm trong E1 (AC-1); AC-2 cross-layer thiếu eval backend-effect; AC-9, AC-10 có When trên màn nhưng không tag cross-layer, không có ui-check riêng | Ô tìm của bảng đỏ trên màn nhưng bị tính cho AC-1; thẻ Cổng 2 báo nhầm AC; AC-9 PASS nhờ lớp service | Tách ui-check theo đúng criterion; tag cross-layer AC-9, AC-10; eval backend-effect cho AC-2 | fixed: E1 chỉ còn hai ô của AC-1; thêm E16 (AC-2), E17 (AC-9), E18 (AC-10), E19 (AC-4), E20 (AC-8) cùng lệnh đo màn; thêm E2b backend-effect cho AC-2; AC-9 và AC-10 gắn (cross-layer) |
| P1 | contract, evals | Không ghim rằng sửa trường khác, hoặc gửi lại chính số cũ dưới dạng khác, thì bỏ qua kiểm trùng; giả định 2 của opportunity (đếm số trùng sẵn có) không có đường đo | Dữ liệu cũ có A và C cùng số thô; sửa Chức danh của A bị CONFLICT, sale không sửa được gì của A; E9 xanh vì fixture chỉ một người mang số | Thêm hai dòng A2/C2 trùng sẵn vào E9; chiều đỏ «sua truong khac bi chan»; truy vấn đếm nhóm trùng trước ngày lên | fixed: AC-7 thêm vế «chỉ kiểm trùng khi số quốc nội thật sự đổi»; E9 thêm dòng 4–5 với A2/C2 cùng số thô và chiều đỏ ghim; design doc ghi luật update; «Đường đo» thêm thước phụ `rang/dem-trung.sql` (chỉ-đọc, việc tay của anh trước khi gộp, không chặn) |
| P2 | contract | Thước ≥ 80% lọc `source = 'MANUAL'` nhưng không AC/eval nào đọc lại `source` của người vừa tạo qua hai form | Form gán nguồn khác, truy vấn 23/10 đếm sai tập, Cổng Giá trị đọc ra số không phải của hai form | E1/E16 in source thô và kỳ vọng MANUAL | fixed: AC-1, AC-2 thêm «nguồn MANUAL»; E1, E2b, E16 in và kỳ vọng `source = "MANUAL"` (schema mặc định MANUAL — packages/db/prisma/schema.prisma) |
| P2 | contract, evals | Trạng thái ST-them-trung (toast nêu tên, form giữ chữ) không có AC; AC-6 chỉ đo phía API | Form xoá chữ đã gõ khi lỗi trùng, toast không nêu tên; E8 xanh | Thêm vế màn vào AC-6 và một bài DOM ném CONFLICT | fixed: AC-6 thêm vế toast nêu tên và giữ chữ; thêm E21 (`dt_man_trung`, describe «trung-giu-chu») với chiều đỏ «mat chu da go» |
