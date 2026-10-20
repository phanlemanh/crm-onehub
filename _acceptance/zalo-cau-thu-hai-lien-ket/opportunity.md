---
schema_version: 1
slug: zalo-cau-thu-hai-lien-ket
feature: Hỏi Kho qua Zalo từ câu thứ hai trở đi trong ngày, trợ lý kho vẫn trả lời đúng chỉ dẫn
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-19T14:59:33Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: l7
lo_trinh_tep: docs/plan/lo-trinh-kho-tai-lieu.json
---

## Vấn đề & ai gặp

Mở từ hàng l7 của «Kho tài liệu» (`docs/plan/lo-trinh-kho-tai-lieu.json`).
Mốc: Kho tài liệu qua Zalo và model theo vai — 30/10/2026.

Hỏi Kho qua Zalo từ câu thứ hai trở đi trong ngày, trợ lý kho vẫn trả lời đúng chỉ dẫn

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
