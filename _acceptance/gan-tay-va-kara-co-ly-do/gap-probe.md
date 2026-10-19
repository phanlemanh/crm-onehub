---
slug: gan-tay-va-kara-co-ly-do
at: 2026-10-14T00:07:28Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-1 (hộp thoại ba chế độ thay vì sửa tại dòng đề xuất) ghi nguồn mục-tiêu, nhưng câu trích của docs/design.md chỉ liên quan, không quyết; sửa trong hộp thoại hay tại dòng là lựa chọn tương tác chỉ người biết, và design-pass đang xin bỏ. Cùng lớp [khung-man-chung#F2]. | Chủ kho duyệt tưởng máy đã căn theo luật kho; lúc chạy thật muốn sửa ngay trên dòng của Kara, chế độ nhận đề xuất của hộp thoại và E9, E10, E12 phải viết lại sau Cổng 2. | Đổi d-1 thành câu hỏi chỉ-người (khuyến nghị hộp thoại, lối khác biến thể nhiều ô của ProposedChange), gửi cùng các câu đang chờ. | human-gate1: dòng sổ d-9 thay d-1 thành Hỏi-4, gửi P2-11 cho giám sát |
| P1 | contract | Cách sua trên đề xuất mà người không đổi chữ nào vẫn hạ lyDoTuKara, trái d-3 và docs/ai-ux.md §3; AC-7, E7 chỉ đo ca có đổi chữ. | Người bấm Sửa lý do để đọc kỹ rồi bấm Căn chỉnh không sửa gì; chữ Kara lưu nguyên văn mà mất dấu Kara; mọi eval vẫn xanh. | AC-7 thêm vế y chữ Kara thì như nhận; E7 thêm ca viết trước; E14 thêm vết sửa y chữ vẫn hạ cờ. | fixed: AC-7 thêm vế «y nguyên chữ Kara thì như nhận: lyDoTuKara true, trạng thái nhan»; E7 thêm ca thứ ba; E14 thêm vết (j) 'sua y chu van ha co' |
| P1 | evals | Đường REST của AC-3 chỉ đo ca không đổi gì (phủ định không đối chứng dương); AC-7 không có ô REST cho trường canCu mới. | Route REST trả 200 mà không ghi, hoặc DTO REST lột canCu; E3, E7 vẫn xanh. | E3 qua REST gửi cặp chữ mới rồi đọc lại, sau đó mới gửi y nguyên; AC-7 và E7 thêm một lần cách sua qua REST với canCu rồi đọc lại. | fixed: E3 REST gửi cặp mới (đọc lại, vết +1) rồi mới gửi y nguyên; AC-7 thêm «qua tRPC và qua REST», E7 thêm ca REST với C3 |
| P1 | evals | Lời hứa Kara soạn căn cứ chỉ đo ở chỉ dẫn (E8) và ở nopDeXuatVao gọi thẳng (E5); không eval nào đi qua công cụ thật nop_de_xuat. | Công cụ bỏ canCu trước khi gọi bộ ghi; E5, E8, E12 vẫn xanh, production mọi đề xuất vẫn là Đặt cược. | E5 gọi execute của chính công cụ nop_de_xuat; E14 thêm vết công cụ bỏ canCu. | fixed: AC-5 nêu công cụ nop_de_xuat; E5 gọi execute của công cụ, paths thêm tools/nop_de_xuat.ts; E14 thêm vết (i) |
| P1 | evals | Vết (g) của E14 (mức tin theo độ dài) không có ca bắt: ma trận E9 ba ca cho cùng kết quả với length > 0; thiếu ca chỉ khoảng trắng. Cùng lớp [cay-can-chinh-co-ly-do#F1]. | Vết (g) gài kiểu length > 0, E9 vẫn xanh, E14 không đỏ; hoặc hộp thoại xếp Đặt cược cho lý do toàn khoảng trắng trong khi máy chủ lưu null. | Thêm hai ca khoảng trắng vào E9, nâng số ca 3 → 5; viết vết (g) cụ thể là length > 0 không cắt. | fixed: AC-9 nói rõ chữ đã cắt khoảng trắng; E9 ma trận năm ca; vết (g) ghi rõ lyDo.length > 0 không cắt |
