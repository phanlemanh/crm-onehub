---
schema_version: 1
slug: model-theo-vai-do-lai
feature: Mỗi vai (Tác nhân, Trợ lý kho, judge, soạn) có model kiến nghị, đo lại sau l6
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-19T14:59:33Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: MH4
lo_trinh_tep: docs/plan/lo-trinh-kho-tai-lieu.json
---

## Vấn đề & ai gặp

Mở từ hàng MH4 của «Kho tài liệu» (`docs/plan/lo-trinh-kho-tai-lieu.json`).
Mốc: Kho tài liệu qua Zalo và model theo vai — 30/10/2026.

Mỗi vai (Tác nhân, Trợ lý kho, judge, soạn) có model kiến nghị, đo lại sau l6

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
