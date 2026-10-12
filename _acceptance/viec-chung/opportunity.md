---
schema_version: 1
slug: viec-chung
feature: Tôi giao một việc gắn với deal hay kế hoạch onboard; người nhận thấy nó trong Việc của tôi và được nhắc buổi sáng
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-12T23:35:17Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA1
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA1 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).

Tôi giao một việc gắn với deal hay kế hoạch onboard; người nhận thấy nó trong Việc của tôi và được nhắc buổi sáng

Vì sao: Ba thứ giống việc sống tách nhau; việc cần làm trên dòng thời gian không có người làm và ai cũng đánh dấu xong được.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau hai tuần dùng thật, người nhận có thấy và xử lý việc được giao cho mình (qua Việc của tôi và tin nhắc buổi sáng), và việc gắn đối tác có tránh được người vai «chỉ OKR» không?
- Kết quả nào là SỐNG: Trong 14 ngày đầu dùng thật: ít nhất 80% việc mới giao cho người khác người tạo được người thực hiện chuyển khỏi «Chưa làm» trước hoặc trong ngày hạn; và 0 việc gắn đối tác có người thực hiện hay người theo dõi mang vai «chỉ OKR».
- Kết quả nào là CHẾT: Dưới 80% ở vế đầu khi hết 14 ngày, hoặc có dù chỉ một việc gắn đối tác tới người vai «chỉ OKR».
- Timebox: Đọc số sau 14 ngày dùng thật kể từ ngày gộp vào onehub; DA1 gộp sau DA0b (mốc 16/10/2026).

Bản ở hàng DA1 của lộ trình (để đối chiếu): «hai tuần dùng thật, ít nhất 80% việc mới có người thực hiện; không việc gắn đối tác nào tới người vai «chỉ OKR»». Máy đề xuất đổi vế đầu vì mục từ điển «Việc» định nghĩa việc luôn có một người thực hiện: nếu ô đó bắt buộc thì «80% việc mới có người thực hiện» luôn đạt 100% và không đỏ được. Vế thay đo đúng lời hứa của câu giao — người nhận thấy việc và được nhắc thì sẽ xử lý nó.

## Nguồn quyết định Cổng Đáng

Chủ kho gõ ở phiên thợ DA1 (máy M5) ngày 13/10/2026: «Cổng Đáng viec-chung: build · ngưỡng: theo đề xuất máy
(≥80% việc giao cho người khác được người nhận chuyển khỏi «Chưa làm» trước hạn; 0 việc gắn đối tác tới vai «chỉ
OKR») · đo 14 ngày từ ngày gộp». `decided_at` là giờ phiên thợ ghi lại lời đó.
