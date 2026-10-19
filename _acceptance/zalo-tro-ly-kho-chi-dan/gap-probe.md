---
slug: zalo-tro-ly-kho-chi-dan
at: 2026-10-16T03:45:00Z
verdict: findings
p0: 3
p1: 1
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Vế «0 dòng resolver threw» của AC-6 mất tác dụng khi AC-5 làm bộ giải thôi ném; không còn đường đo số lần thua chạy đua sau bản sửa | Hook không ghi gì trên eve thật, lần thua nhận chỉ dẫn dừng nên không sinh dòng threw; AC-6 PASS mà hook chưa từng chạy | Đếm sự kiện sai chỗ của lượt bằng 0; đếm số câu có liên kết do hook ghi bằng tổng số câu; chiều đỏ ghim «sai cho» | fixed: AC-5 ghi dòng cảnh báo «[tro-ly-kho] khong tim thay cau hoi»; hook ghi dòng «[lien-ket-hoi]»; AC-6 và E6 đòi 0 dòng sai chỗ và mỗi phiên gốc của lượt có đúng một dòng liên kết, kèm chiều đỏ ghim «sai cho» và ghim mã phiên; ngưỡng SỐNG trong opportunity.md ghi thêm vế này và nguồn gap-probe |
| P0 | evals | Ngữ cảnh hook (purpose, hoiId) và việc eve chờ hook chỉ được chứng trên ngữ cảnh dựng tay; design ghi «auth.attributes» còn evals ghi «auth.initiator.attributes» | Eve thật đặt thuộc tính chỗ khác hoặc moPhien không gửi hoiId; hook đi nhánh thiếu hoiId, E1/E2/E4 vẫn xanh vì fixture tự tiêm | Chụp ngữ cảnh thật làm fixture; bắt đối số send thật của moPhien/guiHoiKho; kiểm thứ tự trong lượt thật | fixed: hook đọc qua helper attribute() của session-purpose.ts (cùng đường các hook production audit.ts, okr-uy-quyen.ts đang đọc); E1/E2 dựng ngữ cảnh từ chính đối số auth mà moPhien và guiHoiKho truyền cho send; AC-6 đòi mỗi phiên gốc của lượt eve thật có dòng «[lien-ket-hoi]» — chỉ có khi hook đọc được purpose và hoiId trên eve thật. deferred: thứ tự hook trước bước đầu không đo riêng; hệ quả của nó đo bằng 0 dòng sai chỗ |
| P0 | contract | Dòng sổ d-3 (mở phạm vi sang đường CRM) ghi nguồn muc-tieu nhưng câu trích chỉ nêu đích đo; không có dữ kiện chứng đường CRM thua cùng chạy đua | Cổng Phạm vi ký mở phạm vi mà không ai hỏi người | Trích dòng threw thuộc phiên CRM, không có thì thành câu hỏi | human-gate1: không gắn được dòng threw với đường CRM (hai lượt chạy xen kẽ); d-3 thay bằng d-…-8 nguồn chi-nguoi, lên thẻ thành Hỏi-1 kèm khuyến nghị |
| P1 | evals | AC-2/E2 thiếu vế ghi lại của guiHoiKho sau khi hook đã thay dấu chờ | guiHoiKho khớp 0 hàng rồi ném hoặc đánh dấu hỏng; câu CRM hỏng đúng ca cần cứu | Gọi chính guiHoiKho sau hook với cùng mã phiên; chiều đỏ mã khác không ghi đè | fixed: AC-2 thêm vế «lần ghi sau của guiHoiKho không ném, không đổi hàng khác, câu vẫn đang hỏi»; E2 thêm ca ghi lại và chiều đỏ ghim «crm-ghi-lai» |
| P2 | evals | E6 không chứng bản chép eve.log phủ hết các phiên của lượt | Runtime dev khởi động lại giữa lượt, eve.log chỉ có nửa sau; đếm 0 vẫn PASS | Mỗi mã phiên trong ket-qua.jsonl có mặt trong eve.log; chiều đỏ cắt nửa đầu | fixed: E6 đòi mỗi mã phiên gốc trong evidence/ket-qua.jsonl có dòng «session <mã> on channel:» trong eve.log; chiều đỏ cắt nửa đầu ghim «eve.log thieu phien» |
