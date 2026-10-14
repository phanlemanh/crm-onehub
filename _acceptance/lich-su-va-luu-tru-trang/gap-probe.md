---
slug: lich-su-va-luu-tru-trang
at: 2026-10-13T13:10:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Duyệt lưu trữ đánh «cũ» mọi đề xuất nội dung đang chờ của người khác — lựa chọn chỉ người quyết mà sổ không ghi | Đề xuất sửa của B lặng lẽ thành «cũ»; khôi phục trang thì đề xuất ấy không sống lại; Cổng Phạm vi ký AC-5 mà không thấy câu hỏi | Dòng S1 nguồn chỉ-người; AC-5, E5 theo lựa chọn; E6 khẳng định trạng thái sau khôi phục | human-gate1: gửi yêu cầu P6-8 (khuyên theo luật có sẵn «cũ» + một sự kiện «cũ» mỗi đề xuất); sổ thêm dòng chỉ-người; AC-5, E5, design ghi theo khuyến nghị kèm [chờ P6-8] |
| P1 | contract | Ô «đã lưu trữ có đề xuất khôi phục chờ» không có AC; không chặn đề xuất khôi phục trùng | Hai đề xuất khôi phục cùng chờ, duyệt cả hai ghi hai sự kiện khôi phục, trái AC-9 | AC-6 thêm vế chặn trùng; E6 thêm ca; trạng thái ST-doc-cho-khoi-phuc | fixed: AC-6 chặn đề xuất khôi phục trùng và hiện huy hiệu chờ; E6 ma trận từ chối hai dòng; E11m đo trạng thái mới; design thêm ST-doc-cho-khoi-phuc |
| P1 | evals | Nửa khôi phục của luồng và nhóm «Đã xử lý» không có ui-check; E13j thiếu ảnh khôi phục, duyệt quay lại, danh sách rỗng | Hộp khôi phục hỏng hay chữ «Khôi phục» cạnh «Quay lại phiên bản N» mà hội đồng không thấy ảnh | E11 thêm bước khôi phục; ui-check nhóm Đã xử lý; E13j thêm ảnh | fixed: E11 thêm bước 6–8 và quan hệ màn ↔ API; E8u ui-check nhóm «Đã xử lý» (bước 5 của E12); E13j thêm năm ảnh |
| P1 | evals | Vế «chữ người nhập không bị dịch» của AC-13 không thước nào đo được (ảnh không thấy thuộc tính DOM) | Lý do lưu trữ thiếu translate="no", Chrome dịch, E13j vẫn PASS | E10m, E11m khẳng định closest translate=no, có chiều đỏ; hoặc rời vế khỏi judgment | fixed: vế chuyển từ AC-13 sang AC-11 (máy); E10m, E11m khẳng định closest('[translate=no]') với chiều đỏ bỏ thuộc tính |
| P2 | evals | Bảng sự kiện của E9 ghi «(+CU)» không ghim số, mâu thuẫn «đúng một sự kiện» của AC-5, AC-9 | Mã đúng bị REJECT vì đọc nhầm số; mã ghi thừa vẫn lọt | Ghim {LUU_TRU:1, CU:n} ở E5, E9, AC-5, AC-9 | fixed: E5 {LUU_TRU:1, CU:1}; E9 «LUU_TRU 1 và CU 1»; AC-5, AC-9 viết cùng số |
