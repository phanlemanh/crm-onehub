---
schema_version: 1
slug: cam-xuc-tren-cap-nhat
feature: Thành viên thả cảm xúc lên một lần cập nhật tuần ở Cập nhật gần đây, thẻ con Họp tuần của bộ OKR và ngăn KR, và người cập nhật thấy ai đã thả
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: HT5
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng HT5 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: không đọc được ở đây: crm-onehub-nguon — git clone https://github.com/phanlemanh/crm-onehub-nguon.git /Users/manh-macmini/dev/crm-onehub-nguon
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.
Hàng HT5 của đợt `okr-hop-tuan-2210` (#543), dãy V3 đợt `vo-khu-muc-tieu`, đứng trên VK12 `cap-nhat-gan-day` (gộp onehub
`dd53c3870`, #574). Hạng T3: thêm bảng ở `packages/db/prisma`.

Thành viên thả cảm xúc lên một lần cập nhật tuần ở Cập nhật gần đây, thẻ con Họp tuần của bộ OKR và ngăn KR, và người cập nhật thấy ai đã thả

Vì sao: VK12 mang trả lời dưới từng lần cập nhật; chưa có cách ghi nhận nhẹ hơn một câu trả lời. Tability có Reply và Like trên từng check-in ở ba chỗ: Recent updates, ngăn KR, trình chiếu.

Ai gặp: thành viên đọc cập nhật của đồng đội trước buổi họp tuần muốn báo «đã đọc, tốt» mà không phải viết câu;
người cập nhật hôm nay không biết lần cập nhật của mình có ai đọc. Chủ kho báo 22/10 «bấm Họp tuần không thấy gì»
khi bộ OKR quý 4 đang chạy — đợt Họp tuần sinh ra từ nỗi đau đó (`docs/findings/2026-10-22-hop-tuan/README.md` §6:
«Reply và Like trên từng lần cập nhật — Chưa có — VK12 mang Reply; Like — HT5»).

Phạm vi đã chốt kèm hàng này (chủ kho 24/10, «Đồng ý hết theo khuyến nghị»):
- D5 — trả lời trên **từng** lần cập nhật (VK12 hiện chỉ cho trả lời ở lần mới nhất của KR) đi cùng hàng này.
- D6 — thêm `checkInId` cho `OkrComment` trong cùng migration với bảng cảm xúc, để trả lời và cảm xúc dùng một khoá lần
  cập nhật (`OkrCheckIn`). Không dùng `OkrGhiNhan` cho cảm xúc: đó là lời nhắn có người nhận, không phải một chạm.

Dữ liệu để dựng và đo trên máy: bộ OKR mẫu (`bun run okr:mau`) thêm ca cảm xúc và trả lời qua đường ghi thật; số
thật đọc sau khi gộp, lúc bật cho người dùng.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] Người cập nhật có nhận được ghi nhận của đồng đội trên lần cập nhật của mình không — tức thành viên có thật sự thả cảm xúc hay trả lời trên từng lần cập nhật của bộ OKR đang chạy?
- Kết quả nào là SỐNG: [đề xuất] Sau hai buổi họp tuần kể từ khi bật cho người dùng, ít nhất 30% lần cập nhật của các bộ OKR quý 4 đang chạy nhận ít nhất một cảm xúc hoặc một trả lời từ người khác người cập nhật; và trên máy: một lần thả hiện ở cả ba chỗ trong cùng phiên, thả lại thì gỡ, người ngoài quyền xem mục tiêu không thấy.
- Kết quả nào là CHẾT: [đề xuất] Sau hai buổi họp tuần, dưới 10% lần cập nhật nhận cảm xúc hoặc trả lời → không mở rộng (không thêm loại cảm xúc, không đưa lên trình chiếu HT-C1); giữ trả lời trên từng lần, cân nhắc gỡ cảm xúc. Giữa 10% và 30% → iterate (hỏi người dùng vì sao không thả).
- Timebox: [đề xuất] Dựng xong và gộp onehub trước 2026-10-31; đọc số hai buổi họp tuần sau ngày bật cho người dùng (dự kiến 2026-11-14).
