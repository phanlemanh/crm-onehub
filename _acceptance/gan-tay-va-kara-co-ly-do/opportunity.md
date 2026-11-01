---
schema_version: 1
slug: gan-tay-va-kara-co-ly-do
feature: Căn chỉnh gắn bằng tay và căn chỉnh Kara đề xuất đều mang lý do
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: L4
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng L4 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Căn chỉnh gắn bằng tay và căn chỉnh Kara đề xuất đều mang lý do

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Căn chỉnh tạo mới sau khi bật, gắn tay hay nhận từ Kara, có thật sự mang lý do thay vì vẫn trống như trước không?
- Kết quả nào là SỐNG: Trong 2 tuần sau bật, với ít nhất 5 căn chỉnh mới, ít nhất 50% căn chỉnh có createdAt sau ngày bật mang lyDo khác null, và mọi căn chỉnh sinh từ đề xuất can-chinh của Kara đã nhận hay sửa đều có lyDo khác null.
- Kết quả nào là CHẾT: Dưới 20% căn chỉnh mới có lý do, hoặc có căn chỉnh sinh từ đề xuất Kara đã nhận mà lyDo vẫn null.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
