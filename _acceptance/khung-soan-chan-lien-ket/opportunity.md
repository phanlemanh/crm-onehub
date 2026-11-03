---
schema_version: 1
slug: khung-soan-chan-lien-ket
feature: Khi Kara đang soạn hoặc người dùng gõ dở trong khung, bấm một liên kết trong khung thì được hỏi trước khi rời, chữ đang gõ không mất
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: K2f
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng K2f của «OKR» (`docs/plan/lo-trinh-okr.json`).

Khi Kara đang soạn hoặc người dùng gõ dở trong khung, bấm một liên kết trong khung thì được hỏi trước khi rời, chữ đang gõ không mất

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi bật, người soạn OKR trong khung bên phải có còn mất chữ đang gõ hay bản Kara đang soạn vì lỡ bấm một liên kết trong khung không?
- Kết quả nào là SỐNG: Trong timebox có 0 góp ý hay issue báo mất chữ gõ dở khi bấm liên kết trong khung soạn, và trong phiên nghiệm thu với ít nhất 3 người bấm «Tới Kho tài liệu» lúc đang gõ dở thì cả 3 đều thấy hộp hỏi và ai chọn ở lại đều giữ nguyên chữ.
- Kết quả nào là CHẾT: Có ít nhất 1 báo mất chữ hay mất bản soạn do bấm liên kết trong khung, hoặc trong phiên quá nửa người gặp hộp hỏi khi khung không có gì dở và thấy nó cản đường.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
