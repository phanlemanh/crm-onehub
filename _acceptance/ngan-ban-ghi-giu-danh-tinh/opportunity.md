---
schema_version: 1
slug: ngan-ban-ghi-giu-danh-tinh
feature: "Mở hay đóng ngăn bản ghi thì ngăn trượt ra, vào như cũ, không biến mất rồi hiện lại, mà vẫn chỉ nạp sẵn đúng các khoá của #469"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-19T14:59:33Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VS8
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VS8 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Mở hay đóng ngăn bản ghi thì ngăn trượt ra, vào như cũ, không biến mất rồi hiện lại, mà vẫn chỉ nạp sẵn đúng các khoá của #469

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người dùng mở và đóng ngăn bản ghi trong việc hằng ngày có thấy ngăn trượt ra vào liền mạch, không biến mất, không chớp, không trễ, mà dữ liệu trong ngăn vẫn đúng ngay khi mở không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu chung với ít nhất 5 người, mỗi người mở rồi đóng ngăn ít nhất 5 lần trên Thoả thuận và Mục tiêu ở cả máy tính lẫn điện thoại, 0 người nói ngăn «biến mất», «chớp» hay «mở chậm», và 0 lần ngăn vừa mở hiện ô trống hay số cũ phải tải lại mới đúng.
- Kết quả nào là CHẾT: Có từ 2 trên 5 người trở lên tự nêu ngăn biến mất, chớp hay chậm khi mở đóng, hoặc có ít nhất 1 lần ngăn vừa mở hiện dữ liệu trống hay cũ phải tải lại mới đúng.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
