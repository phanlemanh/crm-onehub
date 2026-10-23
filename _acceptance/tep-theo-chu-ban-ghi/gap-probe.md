---
slug: tep-theo-chu-ban-ghi
at: 2026-10-22T00:30:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E4 chỉ có đáp án của lối khuyến nghị Hỏi-2, không có ma trận cho hai lối khác người có thể chọn [re-mo-hinh-mac-dinh#F2] | Chủ kho chọn lối (a) hay (b), E4 đỏ trên mã đúng; Cổng Phạm vi ký một lối, eval đo lối kia | Ba ma trận viết trước, chọn theo lối đã duyệt, đối chứng một lối khác phải lệch | fixed: E4 đọc hoi2_loi từ evidence/ke-hoach.json, giữ ba ma trận trước và sau khi đổi (18 ô), đối chứng «ma trận mù», chiều đỏ riêng cho từng lối; AC-4 gạch 3 thành có điều kiện theo lối |
| P1 | evals | Dấu CHẾT chưa từng được chứng là bắt được lỗi luật thật; laPhuTrach có thể suy từ chính kết quả luật | Lỗi luật cho B mở hợp đồng của A, log ghi laPhuTrach true, thước CHẾT đếm 0 trên production | Đột biến luật trong ca, câu lọc phải đếm đúng số lần mở sai đã viết trước; laPhuTrach so thẳng ownerId với userId | fixed: E6 dựng lại 28 ô dưới đột biến «mọi member mở», câu lọc phải đếm đúng 11; quét mã cấm laPhuTrach suy từ luật; AC-6 và design doc ghi laPhuTrach so ownerId |
| P1 | contract | Người đã tải tệp mà không phụ trách xin mở: không AC, không eval | Bên dựng chép vế taiBoiId của luật xoá sang luật mở, người tải mở được tệp trên bản ghi người khác; mọi eval vẫn xanh | AC-3 thêm ca, E3 ghim tepId vừa tải, đột biến vế taiBoiId phải đỏ | fixed: AC-3 thêm gạch người tải không mở được; E3(c) ghim tepId của (b) và có đột biến 'tcb pham vi: nguoi tai mo'; design doc ghi quyenMoTep không nhận taiBoiId |
| P1 | evals | E5 chỉ đo phiếu thoả thuận và invalidate deals.byId; E7 không mở phiếu Cá nhân | Ô Tệp trên phiếu Công ty hay Cá nhân không tải lại sau khi mất quyền, hay thiếu tên người phụ trách; E5, E7 vẫn xanh | Ma trận 3 loại × 3 lý do × 2 ngôn ngữ, ca mất quyền mỗi loại đếm đúng byId | fixed: E5 nâng 18 ô và 3 ca mất quyền đếm invalidate đúng loại; E7 thêm bước 4b phiếu Cá nhân; AC-5, AC-7 nêu ba loại |
| P2 | contract | Ngưỡng của ô cơ hội để trống, Hỏi-5 thiếu ngày đọc và bước chép vào opportunity.md [re-mo-hinh-mac-dinh#F1] | Cổng Giá trị đọc ô cơ hội không thấy ngưỡng hay ngày đọc | Hỏi-5 có câu hỏi phép đo và timebox; bước chép ngay sau Cổng 1 | fixed: Hỏi-5 thêm câu hỏi phép đo và timebox 14 ngày sau khi lên production (dòng sổ mới supersedes); mục Đường đo của hợp đồng ghi bước chép bốn trường vào opportunity.md sau duyệt |
