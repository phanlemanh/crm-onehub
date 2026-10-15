---
schema_version: 1
slug: dieu-huong-khu-muc-tieu
feature: Tôi bấm Mục tiêu trên thanh bên thì gặp trang tên Mục tiêu, nút Thêm mục tiêu ở góc phải như Thoả thuận, và đổi thẻ không mất đơn vị đang xem
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DH1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng DH1 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Tôi bấm Mục tiêu trên thanh bên thì gặp trang tên Mục tiêu, nút Thêm mục tiêu ở góc phải như Thoả thuận, và đổi thẻ không mất đơn vị đang xem

Vì sao: Đo trên production 14/10: tiêu đề đổi theo từng thẻ (5 tên) và khác tên «Mục tiêu» trên thanh bên; nút «Thêm mục tiêu» nằm giữa thân, cách mép phải 360–425px trong khi Thoả thuận, Công ty, Tài liệu là 0px; đổi thẻ chỉ giữ chu kỳ, mất đơn vị và cách xem.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] Người dùng OKR thật, lần đầu gặp khu Mục tiêu mới, có tự tìm được nút tạo mục tiêu và quay về đúng đơn vị đang xem sau khi đổi thẻ mà không ai chỉ không?
- Kết quả nào là SỐNG: [đề xuất] Năm người dùng thử (vai đang dùng OKR, chưa xem bản mới) làm hai việc — (1) từ trang Mục tiêu bấm được nút «Thêm mục tiêu», (2) đang xem một đơn vị, sang thẻ khác rồi quay lại vẫn thấy đúng đơn vị đó — cả năm người làm được mỗi việc dưới 5 giây, không hỏi.
- Kết quả nào là CHẾT: [đề xuất] Một người trở lên cần quá 5 giây hoặc phải hỏi ở một trong hai việc, khi hết timebox.
- Timebox: phiên nghiệm thu trong 7 ngày kể từ ngày DH1 gộp vào `onehub`; DH1 nằm trong mốc m-1020dh «OKR · Khu Mục tiêu dễ đi» (hoàn tất dự kiến 20/10/2026).

Bản ở hàng DH1 của lộ trình (để đối chiếu): «Năm người dùng thử tìm nút tạo mục tiêu và quay lại đúng đơn vị sau khi
đổi thẻ, mỗi việc dưới 5 giây». Máy giữ nguyên ngưỡng, chỉ khai rõ ai thử (người chưa xem bản mới — người đã xem bản
mẫu thì việc «tìm» luôn đạt và ngưỡng không đỏ được), hai việc đo từ đâu tới đâu, và vế chết.

Số đo nền (production 14/10, khổ 1440 và 390 — `docs/plan/pham-vi-okr-dieu-huong-1410.md`): tiêu đề đổi theo 5 thẻ
và khác tên «Mục tiêu» trên thanh bên; nút «Thêm mục tiêu» cách mép phải 360–425px (Thoả thuận, Công ty, Tài liệu:
0px); đổi thẻ chỉ giữ chu kỳ, mất đơn vị và cách xem.
