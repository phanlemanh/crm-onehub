---
slug: tac-nhan-glm-5-3-cham
at: 2026-10-16T08:30:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design, evals | Biến thể suy luận thấp có thể không đổi được gì mà phép đo không bắt; dòng sổ d-3 trích tài liệu eve không quyết rằng mức low tới nhà cung cấp; bản sửa tạm không ghi theo lượt | Gateway lờ khoá reasoning → glm53-low trùng glm53 → kết luận sai «suy luận không phải nguyên nhân»; quên trả bản sửa → lượt mặc định chạy low | Băm agent.ts từng lượt; bằng chứng mức suy luận tới nhà cung cấp; chiều đỏ ghim «ro suy luan glm53» | fixed: AC-1/AC-2 ghi băm agent.ts từng lượt, chỉ glm53-low mang băm bản sửa (chiều đỏ ghim «ro suy luan glm53»); thêm AC-3 phép dò thẳng Gateway low so với high; d-3 thay bằng d-…-7 nguồn mot-loi |
| P1 | evals | Bộ so chỉ đọc jsonl do trình đo tự viết; không có kết xuất thô aiChiPhi; bang.md không được kiểm | Trình đo điền modelId từ cấu hình → E2 luôn xanh; bang.md sửa tay → hội đồng xác nhận trên bảng lệch | Kết xuất thô aiChiPhi từng lượt băm vào bam.txt; bộ so tính lại và in lại bang.md so từng byte | fixed: AC-1 và E1 đòi kết xuất aichiphi-<biến thể>-<lượt>.json, bộ so tính lại mọi số, in lại bang.md so từng byte, chiều đỏ «lech aichiphi», «bang.md» |
| P1 | design | Thứ tự chạy không định, lượt có thể chồng nhau, phiên con có thể chạy nền sau khi eval huỷ | Chạy theo khối → độ trễ theo khung giờ thành khác biệt giữa biến thể; lượt hỏng đè tải lên lượt kế | Xen kẽ theo vòng, mỗi lượt một kho, ghi giờ, cấm chồng giờ và hàng ghi sau kết thúc | fixed: design và AC-1 khai thứ tự xen kẽ, mỗi lượt một kho, giờ bắt đầu/kết thúc; E1 ghim «chong gio», hàng aiChiPhi sau ket_thuc |
| P1 | contract | Kết luận có thể nêu nguyên nhân khi glm53 mặc định không tái hiện chỗ chậm; ngưỡng SỐNG và CHẾT ở opportunity.md không có đường đo; số Flash không có dòng bảng | glm53 lô này qua 3/3 → «hạng phục vụ là nguyên nhân» mà không có tương phản | AC-3 thêm vế tái hiện, vế dẫn chênh lệch kèm nhật ký, cách xử số Flash | fixed: AC-4 đòi tái hiện (không thì «không tái hiện»), mỗi câu nguyên nhân dẫn chênh lệch kèm tên nhật ký, số Flash ghi nguồn P0 (dòng sổ d-…-8 bỏ đo lại Flash); E4 hỏi đủ năm vế |
| P2 | evals | E2 mâu thuẫn AC-2 (đánh dấu và loại so với exit 1); không quy tắc cho biến thể thiếu lượt; lượt bị huỷ ghi như số thật | Một bước dự phòng sang model khác làm đỏ cả hồ sơ; lượt cắt ở 180 giây kéo trung bình xuống | sai model in ra và exit 0; «thieu luot»; cờ bi_cat, bảng ghi ≥180 | fixed: E2 in «sai model …» và exit 0, «thieu luot <biến thể>», AC-4 cấm «cả n lượt»; AC-1/E1 cờ bi_cat, chiều đỏ ghim «bi cat» |
